#!/usr/bin/env npx tsx
/**
 * enrich-rge-ademe.ts — CLI wrapper around src/lib/rge/sync.ts
 *
 * Délègue toute la logique à `syncRgeFromAdeme()` dans le module partagé
 * `src/lib/rge/sync.ts` (utilisé aussi par le cron Vercel /api/cron/rge-sync).
 *
 * Usage :
 *   npx tsx scripts/enrich-rge-ademe.ts                       # Sync complet (clearStaleRge actif)
 *   npx tsx scripts/enrich-rge-ademe.ts --dry-run             # Aucun UPDATE
 *   npx tsx scripts/enrich-rge-ademe.ts --limit=1000          # N'ingère que 1000 lignes (sync partielle — clearStaleRge SKIPPÉ)
 *   npx tsx scripts/enrich-rge-ademe.ts --limit=1000 --full-sync  # ⚠ Override : force clearStaleRge malgré --limit (DANGEREUX)
 *   npx tsx scripts/enrich-rge-ademe.ts --skip-backfill       # Saute le backfill communes
 *
 * Env requis :
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { createClient } from '@supabase/supabase-js'
import { syncRgeFromAdeme } from '../src/lib/rge/sync'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    'Missing SUPABASE env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local'
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// CLI flags parsing
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const skipBackfill = args.includes('--skip-backfill')
const fullSyncFlag = args.includes('--full-sync')
const limitArg = args.find((a) => a.startsWith('--limit='))
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity

// Règle P0 : --limit implique sync partielle (clearStaleRge skipped), sauf si --full-sync explicite.
// Sans --limit : sync complète → clearStaleRge actif.
const isPartialSync = Number.isFinite(limit) && !fullSyncFlag

if (Number.isFinite(limit) && fullSyncFlag) {
  console.warn(
    "⚠ --limit + --full-sync : clearStaleRge tournera malgré le limit. Tu risques d'effacer des providers hors fenêtre."
  )
}

async function main() {
  const result = await syncRgeFromAdeme(supabase, { dryRun, limit, skipBackfill, isPartialSync })

  console.log('')
  console.log('═══ Summary ═══')
  console.log(`  ADEME rows fetched : ${result.ademeRowsFetched}`)
  console.log(`  Expired filtered   : ${result.expiredFiltered}`)
  console.log(`  Invalid skipped    : ${result.invalidSkipped}`)
  console.log(`  Unique SIRETs      : ${result.uniqueSirets}`)
  console.log(`  Providers matched  : ${result.providersMatched}`)
  console.log(`  Providers updated  : ${result.providersUpdated}`)
  console.log(`  Contacts enriched  : ${result.contactsEnriched}`)
  console.log(`  Stale cleared      : ${result.staleCleared}`)
  console.log(`  Communes updated   : ${result.communesUpdated}`)
  console.log(`  Total RGE actifs   : ${result.totalRgeActifs}`)
  console.log(`  Duration           : ${result.durationSeconds}s`)
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
