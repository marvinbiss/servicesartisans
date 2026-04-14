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

const BATCH_SIZE = 8
const DEADLINE_MS = 50_000
// Worst-case row: 5 sequential pdFetch × 5s timeout = 25s. Refuse to start
// a row unless that much budget is left — otherwise a slow row can overrun
// maxDuration=60s, leaving Pipedrive writes uncommitted in the DLQ (DELETE
// not reached → ghost replays + duplicate Deals next cron).
const ROW_BUDGET_MS = 25_000

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
  const startTs = Date.now()

  // Batch-prefetch estimations for callback rows to avoid N+1 SELECTs.
  const callbackEstimationIds = rows
    .filter((r) => (r.payload as { kind?: string })?.kind === 'callback')
    .map((r) => r.estimation_id)
  const estimationsMap = new Map<
    string,
    {
      prenom: string | null
      nom: string | null
      email: string | null
      telephone: string | null
      public_id: string
    }
  >()
  if (callbackEstimationIds.length > 0) {
    const { data: ests } = await supabase
      .from('simulateur_estimations')
      .select('id, prenom, nom, email, telephone, public_id')
      .in('id', callbackEstimationIds)
    for (const e of ests ?? []) {
      estimationsMap.set(e.id as string, {
        prenom: (e.prenom as string | null) ?? null,
        nom: (e.nom as string | null) ?? null,
        email: (e.email as string | null) ?? null,
        telephone: (e.telephone as string | null) ?? null,
        public_id: (e.public_id as string) ?? '',
      })
    }
  }

  for (const row of rows) {
    // Pre-check includes worst-case row budget so we never START a row that
    // could overrun maxDuration. Simple `elapsed > DEADLINE_MS` was too lax.
    if (Date.now() - startTs + ROW_BUDGET_MS > DEADLINE_MS) {
      logger.warn('simulateur-pipedrive-retry: row budget exhausted, stopping batch', {
        elapsed: Date.now() - startTs,
        processed: synced + failed,
        remaining: rows.length - (synced + failed),
      })
      break
    }
    const rawPayload = row.payload as { kind?: string } & Record<string, unknown>
    const rawKind = rawPayload?.kind
    if (rawKind !== undefined && rawKind !== 'callback' && rawKind !== 'submit') {
      failed++
      logger.error('simulateur-pipedrive-retry: unknown kind — skipping', {
        id: row.id,
        kind: rawKind,
      })
      continue
    }
    const kind: 'callback' | 'submit' = rawKind === 'callback' ? 'callback' : 'submit'
    try {
      let dealId: number | string
      if (kind === 'callback') {
        const est = estimationsMap.get(row.estimation_id)
        if (!est || !est.email || !est.telephone) {
          throw new Error(
            `Cannot rehydrate callback: estimation ${row.estimation_id} missing email/telephone`
          )
        }
        const ctx = rawPayload as {
          preferredSlot?: string | null
          remarquesClient?: string | null
        }
        const cb: CallbackPayload = {
          publicId: est.public_id,
          prenom: est.prenom,
          nom: est.nom,
          email: est.email,
          telephone: est.telephone,
          preferredSlot: ctx.preferredSlot ?? null,
          remarquesClient: ctx.remarquesClient ?? null,
        }
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
