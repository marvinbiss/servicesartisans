#!/usr/bin/env npx tsx
/**
 * enrich-rge-ademe.ts — CLI wrapper around src/lib/rge/sync.ts
 *
 * Délègue toute la logique à `syncRgeFromAdeme()` dans le module partagé
 * `src/lib/rge/sync.ts` (utilisé aussi par le cron Vercel /api/cron/rge-sync).
 *
 * Usage :
 *   npx tsx scripts/enrich-rge-ademe.ts                 # Sync complet
 *   npx tsx scripts/enrich-rge-ademe.ts --dry-run       # Aucun UPDATE
 *   npx tsx scripts/enrich-rge-ademe.ts --limit=1000    # N'ingère que 1000 lignes ADEME
 *   npx tsx scripts/enrich-rge-ademe.ts --skip-backfill # Saute le backfill communes
 *
 * Env requis :
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import { syncRgeFromAdeme } from '../src/lib/rge/sync'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// CLI flags parsing
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const skipBackfill = args.includes('--skip-backfill')
const limitArg = args.find(a => a.startsWith('--limit='))
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity

async function main() {
  const result = await syncRgeFromAdeme(supabase, { dryRun, limit, skipBackfill })

  console.log('')
  console.log('═══ Summary ═══')
  console.log(`  ADEME rows fetched : ${result.ademeRowsFetched}`)
  console.log(`  Expired filtered   : ${result.expiredFiltered}`)
  console.log(`  Invalid skipped    : ${result.invalidSkipped}`)
  console.log(`  Unique SIRETs      : ${result.uniqueSirets}`)
  console.log(`  Providers matched  : ${result.providersMatched}`)
  console.log(`  Providers updated  : ${result.providersUpdated}`)
  console.log(`  Stale cleared      : ${result.staleCleared}`)
  console.log(`  Communes updated   : ${result.communesUpdated}`)
  console.log(`  Total RGE actifs   : ${result.totalRgeActifs}`)
  console.log(`  Duration           : ${result.durationSeconds}s`)
}

main().catch(err => {
  console.error('FATAL:', err)
  process.exit(1)
})
