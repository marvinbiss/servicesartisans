/**
 * Upload PJ matches — 4 workers parallèles.
 * Chaque worker a sa propre connexion Postgres.
 * Les artisans déjà enrichis sont auto-skippés (WHERE phone IS NULL).
 */
import * as fs from 'fs'
import * as path from 'path'
import { Client } from 'pg'

const PG_URL = 'postgresql://postgres:BEB6LnGlT6U9bkTe@db.umjmbdbwcsxrvfqktiui.supabase.co:5432/postgres'
const MATCHES_FILE = path.join(__dirname, '.enrich-data', 'matches', 'matches-full.jsonl')
const WORKERS = 4

interface MatchResult { artisanId: string; phone: string; score: number }

async function worker(id: number, items: MatchResult[]): Promise<{ updated: number; skipped: number; errors: number }> {
  const client = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 60000 })
  await client.connect()
  await client.query('SET statement_timeout = 0')
  console.log(`  Worker ${id}: connecté, ${items.length} items`)

  let updated = 0, skipped = 0, errors = 0
  const t0 = Date.now()

  for (let i = 0; i < items.length; i++) {
    const r = items[i]
    try {
      const res = await client.query('UPDATE providers SET phone = $1 WHERE id = $2 AND phone IS NULL', [r.phone, r.artisanId])
      if ((res.rowCount || 0) > 0) updated++
      else skipped++
    } catch (err: any) {
      errors++
      if (errors <= 2) console.log(`  W${id} err: ${err.message}`)
      // Reconnect on error
      try {
        await client.end()
        const newClient = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 60000 })
        await newClient.connect()
        await newClient.query('SET statement_timeout = 0')
        Object.assign(client, newClient)
      } catch {}
    }

    if ((i + 1) % 500 === 0 || i === items.length - 1) {
      const rate = ((i + 1) / ((Date.now() - t0) / 1000)).toFixed(1)
      console.log(`  W${id}: ${i + 1}/${items.length} (${updated} MAJ, ${skipped} skip) — ${rate}/s`)
    }
  }

  try { await client.end() } catch {}
  return { updated, skipped, errors }
}

async function main() {
  console.log('\n============================================================')
  console.log('  UPLOAD 4 WORKERS PARALLÈLES')
  console.log('============================================================')

  // Load & deduplicate
  const lines = fs.readFileSync(MATCHES_FILE, 'utf-8').trim().split('\n')
  const allResults: MatchResult[] = []
  for (const line of lines) {
    try { allResults.push(JSON.parse(line)) } catch {}
  }
  const phoneSet = new Set<string>()
  const artisanSet = new Set<string>()
  const deduped: MatchResult[] = []
  for (const r of [...allResults].sort((a, b) => b.score - a.score)) {
    if (phoneSet.has(r.phone) || artisanSet.has(r.artisanId)) continue
    phoneSet.add(r.phone)
    artisanSet.add(r.artisanId)
    deduped.push(r)
  }
  console.log(`  ${deduped.length} matches uniques — ${WORKERS} workers\n`)

  const t0 = Date.now()
  const chunkSize = Math.ceil(deduped.length / WORKERS)
  const chunks = Array.from({ length: WORKERS }, (_, i) => deduped.slice(i * chunkSize, (i + 1) * chunkSize))

  const results = await Promise.all(chunks.map((chunk, i) => worker(i + 1, chunk)))

  const totalUpdated = results.reduce((s, r) => s + r.updated, 0)
  const totalSkipped = results.reduce((s, r) => s + r.skipped, 0)
  const totalErrors = results.reduce((s, r) => s + r.errors, 0)
  const elapsed = ((Date.now() - t0) / 1000).toFixed(0)

  console.log(`\n  ============ RÉSULTAT ============`)
  console.log(`  ${totalUpdated} artisans enrichis avec téléphone`)
  console.log(`  ${totalSkipped} déjà avec tél (auto-skippés)`)
  console.log(`  ${totalErrors} erreurs`)
  console.log(`  Temps: ${elapsed}s (${(deduped.length / ((Date.now() - t0) / 1000)).toFixed(0)}/s)`)
  console.log(`  ==================================\n`)
}

main().catch(err => { console.error('Erreur fatale:', err); process.exit(1) })
