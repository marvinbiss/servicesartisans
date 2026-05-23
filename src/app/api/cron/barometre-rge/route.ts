import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { aggregate, type ProviderRow, type Snapshot } from '@/lib/barometre/rge-aggregate'
import { logger } from '@/lib/logger'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

/**
 * Monthly cron: builds the RGE barometer snapshot from `providers` and
 * persists it into `barometre_rge_snapshots`. Then revalidates the
 * public page /barometre/rge so the new numbers ship within seconds.
 *
 * Schedule  : `0 3 1 * *` (1st of each month, 03:00 UTC — declared in vercel.json)
 * Runtime   : ~30-60 s (reads ~50k providers in pages of 1000)
 * Auth      : Authorization: Bearer $CRON_SECRET
 */

export const maxDuration = 300 // Vercel Pro — same budget as rge-sync
export const dynamic = 'force-dynamic'

// SLA-99.9 : wall-clock guard (maxDuration 300 → marge 10s) + cap dur sur les
// providers lus par run + lease anti-double-run.
const MAX_RUNTIME_MS = 290_000
const MAX_PROVIDERS_PER_RUN = 200_000
const LEASE_NAME = 'cron_barometre_rge'
const LEASE_TTL_SECONDS = 15 * 60

async function fetchAllProviders(startedAt: number): Promise<ProviderRow[]> {
  const supabase = createAdminClient()
  const pageSize = 1000
  const out: ProviderRow[] = []
  let from = 0
  for (;;) {
    // SLA-99.9 : wall-clock + cap guards sur la pagination.
    if (Date.now() - startedAt > MAX_RUNTIME_MS) break
    if (out.length >= MAX_PROVIDERS_PER_RUN) break
    const { data, error } = await supabase
      .from('providers')
      .select('id,specialty,address_region,rge_qualifications,rge_valid_until,rge_organismes')
      .eq('is_active', true)
      .not('rge_qualifications', 'is', null)
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1)
    if (error) throw new Error(`providers fetch failed: ${error.message}`)
    if (!data || data.length === 0) break
    out.push(...(data as ProviderRow[]))
    if (data.length < pageSize) break
    from += pageSize
  }
  return out
}

async function fetchTotalProviders(): Promise<number> {
  const supabase = createAdminClient()
  const { count, error } = await supabase
    .from('providers')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)
  if (error) throw new Error(`total providers failed: ${error.message}`)
  return count ?? 0
}

async function upsertSnapshot(snap: Snapshot): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('barometre_rge_snapshots').upsert(
    {
      yearmonth: snap.yearmonth,
      captured_at: snap.captured_at,
      total_rge_active: snap.total_rge_active,
      total_rge_expired: snap.total_rge_expired,
      total_providers: snap.total_providers,
      by_region: snap.by_region,
      by_qualification: snap.by_qualification,
      by_specialty: snap.by_specialty,
      organismes: snap.organismes,
      methodology: snap.methodology,
      source_note: snap.source_note,
    },
    { onConflict: 'yearmonth' }
  )
  if (error) throw new Error(`upsert snapshot failed: ${error.message}`)
}

export const GET = withCronCheckIn('cron-barometre-rge', async (request: Request) => {
  return await Sentry.withMonitor(
    'cron-barometre-rge',
    async () => {
      if (!process.env.CRON_SECRET) {
        return NextResponse.json(
          { error: 'Serveur mal configuré : CRON_SECRET manquant' },
          { status: 500 }
        )
      }
      const authHeader = request.headers.get('authorization')
      if (!verifyCronSecret(authHeader)) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
      }

      const yearmonth = new Date().toISOString().slice(0, 7)
      const started = Date.now()
      const leaseSupabase = createAdminClient()

      // SLA-99.9 : lease avec abort 5s.
      const leaseController = new AbortController()
      const leaseTimer = setTimeout(() => leaseController.abort(), 5_000)
      let acquired: boolean | null = null
      let leaseErr: { message: string } | null = null
      try {
        const leaseResult = await leaseSupabase
          .rpc('acquire_cron_lease', {
            p_name: LEASE_NAME,
            p_ttl_seconds: LEASE_TTL_SECONDS,
          })
          .abortSignal(leaseController.signal)
        acquired = leaseResult.data as boolean | null
        leaseErr = leaseResult.error
      } catch (err) {
        leaseErr = { message: err instanceof Error ? err.message : String(err) }
      } finally {
        clearTimeout(leaseTimer)
      }

      if (leaseErr) {
        logger.error('[cron-barometre-rge] lease error', { error: leaseErr.message })
        return NextResponse.json({ error: 'lease_error' }, { status: 500 })
      }
      if (acquired !== true) {
        logger.info('[cron-barometre-rge] skipped (lease already held)')
        return NextResponse.json({ ok: true, skipped: true, reason: 'already_running' })
      }

      try {
        const [rows, total] = await Promise.all([fetchAllProviders(started), fetchTotalProviders()])
        const snap = aggregate(rows, yearmonth, total)
        await upsertSnapshot(snap)

        // Nuke ISR cache so /barometre/rge picks up the new snapshot immediately
        revalidatePath('/barometre/rge')

        const duration = Date.now() - started
        logger.info('[cron-barometre-rge] snapshot upserted', {
          yearmonth: snap.yearmonth,
          active: snap.total_rge_active,
          expired: snap.total_rge_expired,
          regions: snap.by_region.length,
          duration_ms: duration,
        })

        return NextResponse.json({
          ok: true,
          yearmonth: snap.yearmonth,
          total_rge_active: snap.total_rge_active,
          total_rge_expired: snap.total_rge_expired,
          regions: snap.by_region.length,
          duration_ms: duration,
        })
      } catch (err) {
        const msg = (err as Error).message
        logger.error('[cron-barometre-rge] failed', { error: msg })
        return NextResponse.json({ error: 'barometre_rge_failed', message: msg }, { status: 500 })
      } finally {
        // SLA-99.9 : release best-effort.
        try {
          await leaseSupabase.rpc('release_cron_lease', { p_name: LEASE_NAME })
        } catch {
          // swallowed : TTL acts as safety net
        }
      }
    },
    {
      schedule: { type: 'crontab', value: '0 3 1 * *' },
    }
  )
})
