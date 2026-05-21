/**
 * GET /api/cron/webhooks-retry
 *
 * Vercel-cron-invoked retry tick for RGE-OS webhook deliveries (pillar 8,
 * Ralph 29 follow-up to Ralph 24). Auth via `Authorization: Bearer
 * <CRON_SECRET>` header (existing SA pattern, timing-safe via
 * `verifyCronSecret`). Returns `RetrySummary` JSON.
 *
 * Schedule : every 5 minutes (see `vercel.json`).
 *
 * Concurrency note : Vercel cron is single-tenant per minute, but two
 * ticks could theoretically overlap during cold-start storms. The
 * orchestrator stamps `final_status_at` on terminal rows, which makes
 * subsequent updates no-ops on already-final rows. Tightening to
 * pg_try_advisory_xact_lock is deferred to v0.3.
 *
 * Observability : try/catch wraps the entire tick. `logger.error` is
 * branched to Sentry (per src/lib/logger.ts), so a thrown exception
 * surfaces both in Vercel logs and in Sentry under tag
 * `cron=webhooks-retry`.
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { createAdminClient } from '@/lib/supabase/admin'
import { deliverWebhook } from '@/lib/webhooks/delivery'
import type { WebhookEvent } from '@/lib/webhooks/events'
import { runWebhookRetry, type EligibleRow, type InsertDeliveryArgs } from '@/lib/webhooks/retry'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

type JoinedRow = {
  id: number
  webhook_id: string
  event: string
  payload: Record<string, unknown>
  attempt: number
  rge_os_webhooks:
    | { url: string; secret: string; active: boolean; consecutive_failures: number }
    | { url: string; secret: string; active: boolean; consecutive_failures: number }[]
    | null
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'CRON_SECRET non configuré' }, { status: 401 })
  }
  if (!verifyCronSecret(req.headers.get('authorization'))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    const summary = await runWebhookRetry({
      deliver: deliverWebhook,

      fetchEligibleRows: async (limit) => {
        const { data, error } = await supabase
          .from('rge_os_webhook_deliveries')
          .select(
            'id, webhook_id, event, payload, attempt, next_retry_at, rge_os_webhooks!inner(url, secret, active, consecutive_failures)'
          )
          .is('final_status_at', null)
          .lte('next_retry_at', new Date().toISOString())
          .order('next_retry_at', { ascending: true })
          .limit(limit)
        if (error) throw new Error(`fetchEligibleRows: ${error.message}`)

        return (data ?? []).map((row: JoinedRow): EligibleRow => {
          const hook = Array.isArray(row.rge_os_webhooks)
            ? row.rge_os_webhooks[0]
            : row.rge_os_webhooks
          return {
            delivery_id: row.id,
            webhook_id: row.webhook_id,
            event: row.event as WebhookEvent,
            payload: row.payload,
            attempt: row.attempt,
            url: hook?.url ?? '',
            secret: hook?.secret ?? '',
            active: hook?.active ?? false,
            consecutive_failures: hook?.consecutive_failures ?? 0,
          }
        })
      },

      insertRetryDelivery: async (args: InsertDeliveryArgs) => {
        const { error } = await supabase.from('rge_os_webhook_deliveries').insert({
          webhook_id: args.webhook_id,
          event: args.event,
          payload: args.payload,
          attempt: args.attempt,
          status: args.status,
          response_body_excerpt: args.body_excerpt,
          duration_ms: args.duration_ms,
          error: args.error,
          next_retry_at: args.next_retry_at ? args.next_retry_at.toISOString() : null,
        })
        if (error) logger.warn('webhooks.retry.insert_failed', { error: error.message })
      },

      stampFinal: async (deliveryId, finalStatusAt, status) => {
        const { error } = await supabase
          .from('rge_os_webhook_deliveries')
          .update({ final_status_at: finalStatusAt.toISOString(), status })
          .eq('id', deliveryId)
        if (error) logger.warn('webhooks.retry.stamp_failed', { error: error.message })
      },

      bumpWebhookFailures: async (webhookId, status) => {
        const isOk = typeof status === 'number' && status >= 200 && status < 300
        if (isOk) {
          const { data, error } = await supabase
            .from('rge_os_webhooks')
            .update({
              consecutive_failures: 0,
              last_delivery_at: new Date().toISOString(),
              last_delivery_status: status,
            })
            .eq('id', webhookId)
            .select('consecutive_failures')
            .maybeSingle()
          if (error) logger.warn('webhooks.retry.bump_reset_failed', { error: error.message })
          return { consecutive_failures: data?.consecutive_failures ?? 0 }
        }
        const { data: cur } = await supabase
          .from('rge_os_webhooks')
          .select('consecutive_failures')
          .eq('id', webhookId)
          .maybeSingle()
        const newCount = (cur?.consecutive_failures ?? 0) + 1
        const { error } = await supabase
          .from('rge_os_webhooks')
          .update({
            consecutive_failures: newCount,
            last_delivery_at: new Date().toISOString(),
            last_delivery_status: status,
          })
          .eq('id', webhookId)
        if (error) logger.warn('webhooks.retry.bump_failed', { error: error.message })
        return { consecutive_failures: newCount }
      },

      disableWebhook: async (webhookId) => {
        const { error } = await supabase
          .from('rge_os_webhooks')
          .update({ active: false })
          .eq('id', webhookId)
        if (error) logger.warn('webhooks.retry.disable_failed', { error: error.message })
      },
    })

    return NextResponse.json(
      { ok: true, summary },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    logger.error('webhooks.retry: tick error', err)
    captureError(err, { tags: { cron: 'webhooks-retry' } })
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 }
    )
  }
}
