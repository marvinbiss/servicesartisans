/**
 * Backfill dispatch for devis_requests that never got a lead_assignment.
 *
 * Runs AFTER migration 461 is applied. For every devis in the window with no
 * assignment, calls the SAME code path used in production (dispatchLead) so
 * artisans are notified exactly as if the devis had been freshly submitted.
 *
 * Safety:
 *   - Dry-run by default; pass --apply to write.
 *   - Skips devis that already have ANY lead_assignment.
 *   - Limited to devis newer than MAX_AGE_DAYS (too old = artisans confused).
 *   - Bounded by --limit (default 5) per run to avoid blasting the provider pool.
 */

import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { createAdminClient } from '@/lib/supabase/admin'
import { dispatchLead } from '@/app/actions/dispatch'

const APPLY = process.argv.includes('--apply')
const MAX_AGE_DAYS = 20
const LIMIT = Number(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? 5)

async function main() {
  const supabase = createAdminClient()
  const cutoff = new Date(Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString()

  console.log(
    `[backfill-dispatch] mode=${APPLY ? 'APPLY' : 'DRY-RUN'} cutoff=${cutoff} limit=${LIMIT}`
  )

  const { data: devis, error } = await supabase
    .from('devis_requests')
    .select('id, service_name, city, postal_code, urgency, created_at, client_email')
    .gte('created_at', cutoff)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[backfill-dispatch] query failed:', error)
    process.exit(1)
  }

  if (!devis?.length) {
    console.log('[backfill-dispatch] no devis in window.')
    return
  }

  const { data: existing } = await supabase
    .from('lead_assignments')
    .select('lead_id')
    .eq('source_table', 'devis_requests')
    .in(
      'lead_id',
      devis.map((d) => d.id)
    )
  const assignedIds = new Set((existing ?? []).map((e) => e.lead_id))

  const orphans = devis.filter((d) => !assignedIds.has(d.id))
  console.log(
    `[backfill-dispatch] devis_in_window=${devis.length} already_dispatched=${assignedIds.size} orphans=${orphans.length}`
  )

  const batch = orphans.slice(0, LIMIT)
  if (!APPLY) {
    console.log('[backfill-dispatch] dry-run — first batch that WOULD be dispatched:')
    for (const d of batch) {
      console.log(
        `  ${d.id.slice(0, 8)} ${d.created_at} ${d.service_name} · ${d.city ?? 'n/a'} ${d.postal_code ?? ''}`
      )
    }
    console.log('\n  Pass --apply to run dispatchLead on them.')
    return
  }

  let ok = 0
  let empty = 0
  let failed = 0

  for (const d of batch) {
    try {
      const assigned = await dispatchLead(d.id, {
        serviceName: d.service_name ?? undefined,
        city: d.city ?? undefined,
        postalCode: d.postal_code ?? undefined,
        urgency: d.urgency ?? 'normal',
        sourceTable: 'devis_requests',
      })
      if (assigned.length > 0) {
        ok++
        console.log(`  ✅ ${d.id.slice(0, 8)} → ${assigned.length} provider(s)`)
      } else {
        empty++
        console.log(`  ⚠️  ${d.id.slice(0, 8)} → 0 matches (no eligible provider)`)
      }
    } catch (e) {
      failed++
      console.error(`  ❌ ${d.id.slice(0, 8)}:`, e instanceof Error ? e.message : String(e))
    }
  }

  console.log(
    `\n[backfill-dispatch] done. assigned=${ok} no_match=${empty} failed=${failed} remaining=${orphans.length - batch.length}`
  )
}

main().catch((e) => {
  console.error('[backfill-dispatch] fatal:', e)
  process.exit(1)
})
