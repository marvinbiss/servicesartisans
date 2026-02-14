/**
 * Focused script: backfill stable_id for all providers missing it.
 * Fetches small pages, updates immediately, retries on error.
 * Run: npx tsx scripts/backfill-stable-id.ts
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

function md5StableId(id: string): string {
  const crypto = require('crypto')
  return crypto.createHash('md5').update(id + 'sa-2025').digest('hex').substring(0, 16)
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function updateWithRetry(id: string, stableId: string, attempt = 0): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('providers')
      .update({ stable_id: stableId })
      .eq('id', id)
    if (error) {
      if (attempt < 3) {
        await sleep(2000 * (attempt + 1))
        return updateWithRetry(id, stableId, attempt + 1)
      }
      return false
    }
    return true
  } catch {
    if (attempt < 3) {
      await sleep(2000 * (attempt + 1))
      return updateWithRetry(id, stableId, attempt + 1)
    }
    return false
  }
}

async function main() {
  let totalUpdated = 0
  let totalErrors = 0
  let round = 0

  console.log('=== Backfill stable_id ===\n')

  while (true) {
    round++
    // Fetch a small page of providers without stable_id
    const { data, error } = await supabase
      .from('providers')
      .select('id')
      .is('stable_id', null)
      .order('id')
      .limit(500)

    if (error) {
      console.log(`  Fetch error (round ${round}): ${error.message}`)
      await sleep(5000)
      continue
    }

    if (!data || data.length === 0) {
      console.log(`\n✅ Terminé ! ${totalUpdated} stable_ids générés, ${totalErrors} erreurs`)
      break
    }

    // Update each provider
    let batchOk = 0
    for (const p of data) {
      const ok = await updateWithRetry(p.id, md5StableId(p.id))
      if (ok) {
        batchOk++
        totalUpdated++
      } else {
        totalErrors++
      }
    }

    console.log(`  Round ${round}: ${batchOk}/${data.length} OK | Total: ${totalUpdated} | Erreurs: ${totalErrors}`)

    // Small delay between rounds to avoid overwhelming the API
    await sleep(200)
  }
}

main().catch(e => {
  console.error('Fatal:', e.message)
  process.exit(1)
})
