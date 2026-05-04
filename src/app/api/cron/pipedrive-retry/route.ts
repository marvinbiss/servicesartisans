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
        .limit(BATCH_SIZE)

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
    },
    {
      schedule: { type: 'crontab', value: '30 */6 * * *' },
    }
  )
})
