/**
 * Backfill review invitations for existing devis_requests that have no invitation yet.
 *
 * Safety:
 *   - Idempotent: skips devis already having an invitation (checked via left join).
 *   - Skips devis older than 60 days (too late to invite credibly).
 *   - Skips devis without client_email.
 *   - Dry-run by default; pass --apply to write.
 */

import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { createAdminClient } from '@/lib/supabase/admin'
import { createInvitationForDevis } from '@/lib/reviews/invitations'

const APPLY = process.argv.includes('--apply')
const MAX_AGE_DAYS = 20

async function main() {
  const supabase = createAdminClient()
  const cutoff = new Date(Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString()

  console.log(`[backfill] mode=${APPLY ? 'APPLY' : 'DRY-RUN'} cutoff=${cutoff}`)

  // Only backfill devis that already have an artisan assignment (lead_assignments),
  // otherwise inviting for an un-dispatched devis makes no sense.
  const { data: assigned } = await supabase
    .from('lead_assignments')
    .select('lead_id')
    .eq('source_table', 'devis_requests')

  const assignedIds = new Set((assigned ?? []).map((a) => a.lead_id))

  const { data: devis, error } = await supabase
    .from('devis_requests')
    .select('id, client_email, client_name, service_name, created_at')
    .gte('created_at', cutoff)
    .not('client_email', 'is', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[backfill] query failed:', error)
    process.exit(1)
  }

  if (!devis || devis.length === 0) {
    console.log('[backfill] no eligible devis found.')
    return
  }

  const { data: existing } = await supabase
    .from('review_invitations')
    .select('devis_request_id')
    .in(
      'devis_request_id',
      devis.map((d) => d.id)
    )

  const existingIds = new Set((existing ?? []).map((e) => e.devis_request_id))
  const toProcess = devis.filter((d) => !existingIds.has(d.id) && assignedIds.has(d.id))

  console.log(
    `[backfill] devis_in_window=${devis.length} already_invited=${existingIds.size} unassigned_skipped=${devis.length - toProcess.length - existingIds.size} to_process=${toProcess.length}`
  )

  if (!APPLY) {
    console.log('[backfill] dry-run — no writes. Pass --apply to create invitations.')
    for (const d of toProcess.slice(0, 10)) {
      console.log(`  would invite: ${d.id.slice(0, 8)} · ${d.client_email} · ${d.service_name}`)
    }
    return
  }

  let created = 0
  let skipped = 0
  let failed = 0

  for (const d of toProcess) {
    const lookupProvider = await supabase
      .from('lead_assignments')
      .select('provider_id')
      .eq('lead_id', d.id)
      .limit(1)
      .maybeSingle()

    const providerId = lookupProvider.data?.provider_id ?? null

    const result = await createInvitationForDevis({
      devisRequestId: d.id,
      clientEmail: d.client_email,
      clientName: d.client_name ?? null,
      serviceName: d.service_name ?? null,
      providerId,
    })

    if (result.success) {
      created++
    } else if (result.reason === 'duplicate') {
      skipped++
    } else {
      failed++
      console.warn(`  failed: ${d.id.slice(0, 8)} reason=${result.reason}`)
    }
  }

  console.log(`[backfill] done. created=${created} skipped_dup=${skipped} failed=${failed}`)
}

main().catch((e) => {
  console.error('[backfill] fatal:', e)
  process.exit(1)
})
