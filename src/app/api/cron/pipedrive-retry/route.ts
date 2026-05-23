/**
 * Cron: Pipedrive sync retry
 *
 * Replays any devis_requests that failed their initial Pipedrive sync.
 * Scope: leads created in the last 7 days, not yet synced, < 5 attempts.
 * Runs daily — see vercel.json.
 */

import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'
import { pingHeartbeat } from '@/lib/monitoring/heartbeat'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  isPipedriveConfigured,
  syncDevisRequestToPipedrive,
  MAX_SYNC_ATTEMPTS,
} from '@/lib/integrations/pipedrive'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Lookback extended to 30d now that dead-letter state exists: live leads
// won't pile up past MAX_SYNC_ATTEMPTS (they flip to dead_letter and are
// skipped), so the scan stays cheap thanks to idx_devis_requests_pipedrive_retry.
const LOOKBACK_DAYS = 30
const BATCH_SIZE = 50

// SLA-99.9 : cap dur par run (alias explicite de BATCH_SIZE) + wall-clock guard
// 50s + lease anti-double-run.
const MAX_LEADS_PER_RUN = BATCH_SIZE
const MAX_RUNTIME_MS = 50_000
const LEASE_NAME = 'cron_pipedrive_retry'
const LEASE_TTL_SECONDS = 15 * 60

export const GET = withCronCheckIn('cron-pipedrive-retry', async (request: Request) => {
  return await Sentry.withMonitor(
    'cron-pipedrive-retry',
    async () => {
      if (!process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'CRON_SECRET non configuré' }, { status: 500 })
      }
      const authHeader = request.headers.get('authorization')
      if (!verifyCronSecret(authHeader)) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
      }

      if (!isPipedriveConfigured()) {
        return NextResponse.json({ skipped: true, reason: 'Pipedrive not configured' })
      }

      const supabase = createAdminClient()
      const startedAt = Date.now()

      // SLA-99.9 : lease avec abort 5s.
      const leaseController = new AbortController()
      const leaseTimer = setTimeout(() => leaseController.abort(), 5_000)
      let acquired: boolean | null = null
      let leaseErr: { message: string } | null = null
      try {
        const leaseResult = await supabase
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
        logger.error('pipedrive-retry: lease error', { lease: LEASE_NAME, error: leaseErr.message })
        return NextResponse.json({ error: 'lease_error' }, { status: 500 })
      }
      if (acquired !== true) {
        logger.info('pipedrive-retry: skipped (lease already held)', { lease: LEASE_NAME })
        return NextResponse.json({ ok: true, skipped: true, reason: 'already_running' })
      }

      try {
        const nowIso = new Date().toISOString()
        const lookback = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString()

        // Pull leads that are:
        //   - not yet synced
        //   - not dead-lettered (terminal state, alert already fired)
        //   - under the max-attempts cap (belt + suspenders with dead_letter_at)
        //   - due for retry: next_retry_at IS NULL (never failed yet) OR <= now
        //   - within lookback window (garbage collection safety net)
        const { data: pending, error } = await supabase
          .from('devis_requests')
          .select('id')
          .is('pipedrive_synced_at', null)
          .is('pipedrive_dead_letter_at', null)
          .lt('pipedrive_sync_attempts', MAX_SYNC_ATTEMPTS)
          .or(`pipedrive_next_retry_at.is.null,pipedrive_next_retry_at.lte.${nowIso}`)
          .gte('created_at', lookback)
          .order('created_at', { ascending: true })
          .limit(MAX_LEADS_PER_RUN)

        if (error) {
          logger.error('pipedrive-retry: query failed', error)
          Sentry.captureException(error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const ids = pending?.map((r) => r.id) ?? []
        let synced = 0
        let failed = 0

        // Sequential to respect Pipedrive rate limits and keep logs readable
        for (const id of ids) {
          // SLA-99.9 : wall-clock guard (1 sync Pipedrive = plusieurs roundtrips).
          if (Date.now() - startedAt > MAX_RUNTIME_MS) break
          try {
            await syncDevisRequestToPipedrive(id)
            synced++
          } catch (err) {
            failed++
            logger.error('pipedrive-retry: sync failed', { id, err })
            Sentry.captureException(err, { extra: { devisRequestId: id } })
          }
        }

        logger.info('pipedrive-retry: done', { total: ids.length, synced, failed })
        await pingHeartbeat('pipedrive-retry')
        return NextResponse.json({ total: ids.length, synced, failed })
      } finally {
        // SLA-99.9 : release best-effort.
        try {
          await supabase.rpc('release_cron_lease', { p_name: LEASE_NAME })
        } catch {
          // swallowed : TTL acts as safety net
        }
      }
    },
    {
      schedule: { type: 'crontab', value: '30 */6 * * *' },
    }
  )
})
