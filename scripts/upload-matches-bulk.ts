/**
 * Upload PJ matches — méthode radicale: 1 seule transaction SQL.
 *
 * Crée une table temporaire, INSERT VALUES en bloc, puis 1 UPDATE JOIN.
 * = 3 requêtes au lieu de 15 000.
 *
 * Usage: npx tsx scripts/upload-matches-bulk.ts
 */
import * as fs from 'fs'
import * as path from 'path'
import { Client } from 'pg'

const PG_URL = 'postgresql://postgres:BEB6LnGlT6U9bkTe@db.umjmbdbwcsxrvfqktiui.supabase.co:5432/postgres'
const MATCHES_FILE = path.join(__dirname, '.enrich-data', 'matches', 'matches-full.jsonl')

interface MatchResult {
  artisanId: string
  phone: string
  score: number
}

async function main() {
  console.log('\n============================================================')
  console.log('  UPLOAD BULK — 1 transaction pour 15k matches')
  console.log('============================================================')

  // Load & deduplicate
  const lines = fs.readFileSync(MATCHES_FILE, 'utf-8').trim().split('\n')
  const allResults: MatchResult[] = []
  for (const line of lines) {
    try { allResults.push(JSON.parse(line)) } catch { /* skip */ }
  }

  const phoneSet = new Set<string>()
  const artisanSet = new Set<string>()
  const deduped: MatchResult[] = []
  const sorted = [...allResults].sort((a, b) => b.score - a.score)
  for (const r of sorted) {
    if (phoneSet.has(r.phone) || artisanSet.has(r.artisanId)) continue
    phoneSet.add(r.phone)
    artisanSet.add(r.artisanId)
    deduped.push(r)
  }
  console.log(`  ${deduped.length} matches uniques`)

  // Generate SQL file — split into chunks of 500 VALUES per INSERT
  const sqlFile = path.join(__dirname, '.enrich-data', 'matches', 'upload.sql')
  const chunks: string[] = []

  chunks.push('BEGIN;')
  chunks.push('CREATE TEMP TABLE _phone_matches (id uuid, phone text) ON COMMIT DROP;')

  // Insert in batches of 500
  const BATCH = 500
  for (let i = 0; i < deduped.length; i += BATCH) {
    const batch = deduped.slice(i, i + BATCH)
    const values = batch.map(r => {
      const safePhone = r.phone.replace(/'/g, "''")
      return `('${r.artisanId}','${safePhone}')`
    }).join(',\n')
    chunks.push(`INSERT INTO _phone_matches VALUES\n${values};`)
  }

  chunks.push(`
UPDATE providers p
SET phone = m.phone
FROM _phone_matches m
WHERE p.id = m.id
AND p.phone IS NULL;
`)
  chunks.push('COMMIT;')

  const sql = chunks.join('\n')
  fs.writeFileSync(sqlFile, sql)
  console.log(`  SQL généré: ${(sql.length / 1024).toFixed(0)} KB, ${deduped.length} VALUES`)

  // Execute via pg client
  console.log('  Connexion Postgres...')
  const client = new Client({
    connectionString: PG_URL,
    ssl: { rejectUnauthorized: false },
    query_timeout: 120000,  // 2 min per query
  })

  await client.connect()
  console.log('  Connecté — exécution SQL...')

  const t0 = Date.now()

  try {
    // Execute the full SQL
    const result = await client.query(sql)
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
    console.log(`\n  ✓ TERMINÉ en ${elapsed}s`)
    console.log(`  Résultat:`, JSON.stringify(result).slice(0, 200))
  } catch (err: any) {
    console.error(`  Erreur SQL: ${err.message}`)
    console.log('  Fallback: exécution statement par statement...')

    // Fallback: execute each statement separately
    try {
      await client.query('BEGIN')
      console.log('  BEGIN OK')

      await client.query('CREATE TEMP TABLE _phone_matches (id uuid, phone text) ON COMMIT DROP')
      console.log('  CREATE TEMP TABLE OK')

      // Insert in batches
      let inserted = 0
      for (let i = 0; i < deduped.length; i += BATCH) {
        const batch = deduped.slice(i, i + BATCH)
        const values = batch.map(r => {
          const safePhone = r.phone.replace(/'/g, "''")
          return `('${r.artisanId}','${safePhone}')`
        }).join(',')

        await client.query(`INSERT INTO _phone_matches VALUES ${values}`)
        inserted += batch.length
        if (inserted % 2000 === 0) console.log(`  Inserted ${inserted}/${deduped.length}`)
      }
      console.log(`  INSERT ${inserted} OK`)

      // Single UPDATE
      const updateResult = await client.query(`
        UPDATE providers p SET phone = m.phone
        FROM _phone_matches m WHERE p.id = m.id AND p.phone IS NULL
      `)
      console.log(`  UPDATE: ${updateResult.rowCount} rows modifiés`)

      await client.query('COMMIT')
      console.log('  COMMIT OK')

      const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
      console.log(`\n  ✓ TERMINÉ en ${elapsed}s — ${updateResult.rowCount} artisans enrichis avec téléphone`)
    } catch (err2: any) {
      console.error(`  Erreur fallback: ${err2.message}`)
      await client.query('ROLLBACK').catch(() => {})
    }
  }

  await client.end()
}

main().catch(err => {
  console.error('Erreur fatale:', err)
  process.exit(1)
})
