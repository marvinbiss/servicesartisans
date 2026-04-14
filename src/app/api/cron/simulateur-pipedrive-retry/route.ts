/**
 * Cron: Simulateur Pipedrive sync retry
 *
 * Replays entries from simulateur_pipedrive_failures every 6h.
 * - retry_count < 5
 * - next_retry_at <= now()
 * Exponential backoff: 2^retry_count hours, capped at 24h.
 * On success → DELETE row.
 * On failure → increment retry_count + reschedule.
 *
 * See vercel.json for schedule.
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  createSimulateurDeal,
  isSimulateurPipedriveConfigured,
  computeNextSimRetryAt,
  MAX_SIM_SYNC_ATTEMPTS,
  type SimulateurLeadInput,
} from '@/lib/simulateur/pipedrive'
import { createCallbackRequest, type CallbackPayload } from '@/lib/simulateur/callback-pipedrive'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const BATCH_SIZE = 50

interface FailureRow {
  id: string
  estimation_id: string
  payload: unknown
  retry_count: number
}

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET non configuré' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  if (!isSimulateurPipedriveConfigured()) {
    return NextResponse.json({ skipped: true, reason: 'Pipedrive simulateur not configured' })
  }

  const supabase = createAdminClient()
  const nowIso = new Date().toISOString()

  const { data: pending, error } = await supabase
    .from('simulateur_pipedrive_failures')
    .select('id, estimation_id, payload, retry_count')
    .lt('retry_count', MAX_SIM_SYNC_ATTEMPTS)
    .lte('next_retry_at', nowIso)
    .order('next_retry_at', { ascending: true })
    .limit(BATCH_SIZE)

  if (error) {
    logger.error('simulateur-pipedrive-retry: query failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = (pending ?? []) as FailureRow[]
  let synced = 0
  let failed = 0

  for (const row of rows) {
    const rawPayload = row.payload as { kind?: string } & Record<string, unknown>
    const kind = rawPayload?.kind === 'callback' ? 'callback' : 'submit'
    try {
      let dealId: number | string
      if (kind === 'callback') {
        const cb = rawPayload as unknown as CallbackPayload
        const result = await createCallbackRequest(cb)
        dealId = result.dealId
      } else {
        const input = row.payload as SimulateurLeadInput
        const result = await createSimulateurDeal(input)
        dealId = result.dealId
        // Only submit kind writes pipedrive_deal_id on the estimation
        await supabase
          .from('simulateur_estimations')
          .update({ pipedrive_deal_id: String(result.dealId) })
          .eq('id', row.estimation_id)
      }

      // Remove from DLQ on success
      await supabase.from('simulateur_pipedrive_failures').delete().eq('id', row.id)
      synced++
      logger.info('simulateur-pipedrive-retry: synced', {
        id: row.id,
        estimationId: row.estimation_id,
        kind,
        dealId,
      })
    } catch (err) {
      failed++
      const message = err instanceof Error ? err.message : String(err)
      const nextAttempts = row.retry_count + 1
      const update: Record<string, unknown> = {
        retry_count: nextAttempts,
        last_retry_at: new Date().toISOString(),
        error: message.slice(0, 2000),
      }
      if (nextAttempts < MAX_SIM_SYNC_ATTEMPTS) {
        update.next_retry_at = computeNextSimRetryAt(nextAttempts).toISOString()
      }
      await supabase.from('simulateur_pipedrive_failures').update(update).eq('id', row.id)
      logger.error('simulateur-pipedrive-retry: retry failed', {
        id: row.id,
        estimationId: row.estimation_id,
        attempts: nextAttempts,
        message,
      })
    }
  }

  logger.info('simulateur-pipedrive-retry: done', { total: rows.length, synced, failed })
  return NextResponse.json({ total: rows.length, synced, failed })
}
