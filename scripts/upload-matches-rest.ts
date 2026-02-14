/**
 * Upload PJ matches vers Supabase via REST API.
 * 1 UPDATE à la fois avec pause entre chaque pour éviter les timeouts.
 *
 * Usage: npx tsx scripts/upload-matches-rest.ts
 */
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const MATCHES_FILE = path.join(__dirname, '.enrich-data', 'matches', 'matches-full.jsonl')
const PROGRESS_FILE = path.join(__dirname, '.enrich-data', 'matches', 'upload-progress.json')

interface MatchResult {
  artisanId: string
  phone: string
  score: number
  strategy: string
  pjName: string
  artisanName: string
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  console.log('\n============================================================')
  console.log('  UPLOAD MATCHES PJ → SUPABASE (REST API)')
  console.log('============================================================')

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  // Load matches
  const lines = fs.readFileSync(MATCHES_FILE, 'utf-8').trim().split('\n')
  const allResults: MatchResult[] = []
  for (const line of lines) {
    try { allResults.push(JSON.parse(line)) } catch { /* skip */ }
  }

  // Deduplicate
  const phoneToResult = new Map<string, MatchResult>()
  const artisanToResult = new Map<string, MatchResult>()
  const sorted = [...allResults].sort((a, b) => b.score - a.score)
  for (const r of sorted) {
    if (phoneToResult.has(r.phone)) continue
    if (artisanToResult.has(r.artisanId)) continue
    phoneToResult.set(r.phone, r)
    artisanToResult.set(r.artisanId, r)
  }
  const deduped = [...artisanToResult.values()]
  console.log(`  ${deduped.length} matches uniques à uploader`)

  // Resume support
  let startIdx = 0
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'))
      startIdx = progress.lastIndex || 0
      console.log(`  Reprise à l'index ${startIdx}`)
    } catch { /* restart */ }
  }

  let updated = 0
  let skipped = 0
  let errors = 0
  let retries = 0
  const t0 = Date.now()

  for (let i = startIdx; i < deduped.length; i++) {
    const r = deduped[i]
    let success = false

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const { error, count } = await supabase
          .from('providers')
          .update({ phone: r.phone })
          .eq('id', r.artisanId)
          .is('phone', null)

        if (error) {
          if (attempt < 2) {
            retries++
            await sleep(2000 * (attempt + 1))
            continue
          }
          errors++
          if (errors <= 5) console.error(`    Err: ${error.message}`)
        } else {
          updated++
          success = true
        }
        break
      } catch (e: any) {
        if (attempt < 2) {
          retries++
          await sleep(2000 * (attempt + 1))
          continue
        }
        errors++
        if (errors <= 5) console.error(`    Err: ${e.message}`)
        break
      }
    }

    // Save progress every 100
    if ((i + 1) % 100 === 0) {
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ lastIndex: i + 1, updated, skipped, errors }))
    }

    if ((i + 1) % 500 === 0 || i === deduped.length - 1) {
      const elapsed = ((Date.now() - t0) / 1000).toFixed(0)
      const total = updated + skipped + errors
      const rate = total > 0 ? (total / ((Date.now() - t0) / 1000)).toFixed(0) : '0'
      console.log(`  ${i + 1}/${deduped.length} (${updated} MAJ, ${skipped} skip, ${errors} err, ${retries} retries) — ${rate}/s — ${elapsed}s`)
    }

    // Small delay to avoid rate limiting
    if ((i + 1) % 10 === 0) await sleep(50)
  }

  // Cleanup progress file
  if (fs.existsSync(PROGRESS_FILE)) fs.unlinkSync(PROGRESS_FILE)

  const totalTime = ((Date.now() - t0) / 1000).toFixed(1)
  console.log(`\n  ============ RÉSULTAT ============`)
  console.log(`  ${updated} artisans mis à jour avec téléphone`)
  console.log(`  ${skipped} déjà avec tél (ignorés)`)
  console.log(`  ${errors} erreurs`)
  console.log(`  ${retries} retries`)
  console.log(`  Temps: ${totalTime}s`)
  console.log(`  ==================================\n`)
}

main().catch(err => {
  console.error('Erreur fatale:', err)
  process.exit(1)
})
