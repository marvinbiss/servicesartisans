/**
 * Upload PJ matches vers Supabase via Postgres.
 * UPDATEs simples séquentiels avec reprise automatique.
 *
 * Usage: npx tsx scripts/upload-matches-pg.ts
 */
import * as fs from 'fs'
import * as path from 'path'
import { Client } from 'pg'

// Port 6543 = Supabase session pooler (plus stable que 5432 direct)
const PG_URL = 'postgresql://postgres.umjmbdbwcsxrvfqktiui:BEB6LnGlT6U9bkTe@aws-0-eu-west-3.pooler.supabase.com:6543/postgres'
const PG_URL_DIRECT = 'postgresql://postgres:BEB6LnGlT6U9bkTe@db.umjmbdbwcsxrvfqktiui.supabase.co:5432/postgres'
const MATCHES_FILE = path.join(__dirname, '.enrich-data', 'matches', 'matches-full.jsonl')
const PROGRESS_FILE = path.join(__dirname, '.enrich-data', 'matches', 'upload-progress.json')

interface MatchResult {
  artisanId: string
  phone: string
  score: number
}

async function connectPg(): Promise<Client> {
  // Try pooler first, fallback to direct
  for (const url of [PG_URL, PG_URL_DIRECT]) {
    try {
      const client = new Client({
        connectionString: url,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 60000,
      })
      await client.connect()
      await client.query('SET statement_timeout = 0')
      console.log(`  Connecté via ${url.includes('pooler') ? 'pooler (6543)' : 'direct (5432)'}`)
      return client
    } catch (e: any) {
      console.log(`  Échec ${url.includes('pooler') ? 'pooler' : 'direct'}: ${e.message}`)
    }
  }
  throw new Error('Impossible de se connecter à Postgres')
}

async function main() {
  console.log('\n============================================================')
  console.log('  UPLOAD MATCHES PJ → SUPABASE')
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
  for (const r of [...allResults].sort((a, b) => b.score - a.score)) {
    if (phoneSet.has(r.phone) || artisanSet.has(r.artisanId)) continue
    phoneSet.add(r.phone)
    artisanSet.add(r.artisanId)
    deduped.push(r)
  }
  console.log(`  ${deduped.length} matches uniques`)

  // Resume support
  let startIdx = 0
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      startIdx = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8')).idx || 0
      if (startIdx > 0) console.log(`  Reprise à l'index ${startIdx}`)
    } catch {}
  }

  let client = await connectPg()

  let updated = 0, skipped = 0, errors = 0
  const t0 = Date.now()

  for (let i = startIdx; i < deduped.length; i++) {
    const r = deduped[i]
    let done = false

    for (let attempt = 0; attempt < 3 && !done; attempt++) {
      try {
        const res = await client.query(
          'UPDATE providers SET phone = $1 WHERE id = $2 AND phone IS NULL',
          [r.phone, r.artisanId]
        )
        if ((res.rowCount || 0) > 0) updated++
        else skipped++
        done = true
      } catch (err: any) {
        if (attempt < 2) {
          // Reconnect
          try { await client.end() } catch {}
          await new Promise(r => setTimeout(r, 3000))
          try { client = await connectPg() } catch { await new Promise(r => setTimeout(r, 5000)); client = await connectPg() }
        } else {
          errors++
          if (errors <= 5) console.log(`    Err #${i}: ${err.message}`)
        }
      }
    }

    // Save progress every 200
    if ((i + 1) % 200 === 0) {
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ idx: i + 1, updated, skipped, errors }))
    }

    if ((i + 1) % 500 === 0 || i === deduped.length - 1) {
      const elapsed = ((Date.now() - t0) / 1000).toFixed(0)
      const rate = ((i + 1 - startIdx) / Math.max(1, (Date.now() - t0) / 1000)).toFixed(0)
      console.log(`  ${i + 1}/${deduped.length} (${updated} MAJ, ${skipped} skip, ${errors} err) — ${rate}/s — ${elapsed}s`)
    }
  }

  try { await client.end() } catch {}
  if (fs.existsSync(PROGRESS_FILE)) fs.unlinkSync(PROGRESS_FILE)

  console.log(`\n  ============ RÉSULTAT ============`)
  console.log(`  ${updated} artisans mis à jour avec téléphone`)
  console.log(`  ${skipped} déjà avec tél (ignorés)`)
  console.log(`  ${errors} erreurs`)
  console.log(`  Temps: ${((Date.now() - t0) / 1000).toFixed(0)}s`)
  console.log(`  ==================================\n`)
}

main().catch(err => { console.error('Erreur fatale:', err); process.exit(1) })
