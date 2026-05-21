/**
 * Webhook event emitter — pillar 8 follow-up (Ralph 24+29).
 *
 * Public surface :
 *   - emitWebhookEvent(event, payload, deps) — fan-out to all active
 *     subscribers and record delivery attempts.
 *
 * Behavior :
 *   1. Caller's fetchSubscribers() returns active hooks subscribed to event.
 *   2. For each match : POST signed payload (via Ralph 24 deliverWebhook).
 *   3. Record an rge_os_webhook_deliveries row per attempt.
 *   4. If status >= 500 or null (network error) : schedule retry via the
 *      retry-policy backoff (Ralph 29 BACKOFF_SCHEDULE_SECONDS[1] = +5min for
 *      attempt=2) by setting next_retry_at. The cron /api/cron/webhooks-retry
 *      then picks up.
 *   5. Update rge_os_webhooks.last_delivery_at + last_delivery_status +
 *      consecutive_failures.
 *   6. If consecutive_failures + 1 >= MAX_CONSECUTIVE_FAILURES (10) we trip
 *      the circuit breaker : disable the hook + mark the row terminal.
 *
 * Concurrency : we deliver subscribers in parallel (Promise.all) but cap
 * at MAX_FANOUT_PARALLELISM. A slow subscriber should not block faster
 * ones in the same fan-out batch.
 *
 * Idempotency : the caller is responsible for not double-firing the same
 * event. We do not dedup based on payload content here. Production
 * crons must use ledger keys to ensure one-shot semantics.
 *
 * Dependency injection : all I/O is passed via `EmitDeps` so the admin
 * route is the only file that touches Supabase. The emitter itself is
 * pure logic + sequencing, fully unit-testable.
 */

import { logger } from '@/lib/logger'

import { deliverWebhook, type DeliveryResult } from './delivery'
import type { WebhookEvent, WebhookPayloadByEvent } from './events'
import { computeNextRetryAt, MAX_CONSECUTIVE_FAILURES } from './retry-policy'

export const MAX_FANOUT_PARALLELISM = 8

export type SubscriberRow = {
  id: string
  url: string
  secret: string
  consecutive_failures: number
}

export type RecordDeliveryArgs = {
  webhook_id: string
  event: WebhookEvent
  payload: Record<string, unknown>
  attempt: number
  status: number | null
  duration_ms: number
  body_excerpt: string
  error: string | null
  next_retry_at: Date | null
  final_status_at: Date | null
}

export type UpdateHookArgs = {
  webhook_id: string
  last_delivery_at: Date
  last_delivery_status: number | null
  consecutive_failures: number
}

export type EmitDeps = {
  fetchSubscribers: (event: WebhookEvent) => Promise<SubscriberRow[]>
  recordDelivery: (row: RecordDeliveryArgs) => Promise<void>
  updateHookBookkeeping: (args: UpdateHookArgs) => Promise<void>
  disableHook: (webhookId: string) => Promise<void>
  deliver: typeof deliverWebhook
  now?: () => Date
}

export type EmitSummary = {
  event: WebhookEvent
  matched: number
  delivered: number
  failed_initial: number
  scheduled_retry: number
  circuit_broken: number
}

export async function emitWebhookEvent<E extends WebhookEvent>(
  event: E,
  payload: WebhookPayloadByEvent[E],
  deps: EmitDeps
): Promise<EmitSummary> {
  const subscribers = await deps.fetchSubscribers(event)
  const summary: EmitSummary = {
    event,
    matched: subscribers.length,
    delivered: 0,
    failed_initial: 0,
    scheduled_retry: 0,
    circuit_broken: 0,
  }

  if (subscribers.length === 0) {
    logger.info('webhooks.emit.no_subscribers', { event })
    return summary
  }

  const now = (deps.now ?? (() => new Date()))()
  const buckets = chunk(subscribers, MAX_FANOUT_PARALLELISM)
  for (const bucket of buckets) {
    await Promise.all(bucket.map((sub) => deliverOne(sub, event, payload, deps, summary, now)))
  }
  logger.info('webhooks.emit.tick', summary)
  return summary
}

async function deliverOne<E extends WebhookEvent>(
  sub: SubscriberRow,
  event: E,
  payload: WebhookPayloadByEvent[E],
  deps: EmitDeps,
  summary: EmitSummary,
  now: Date
): Promise<void> {
  let result: DeliveryResult
  try {
    result = await deps.deliver(sub.url, sub.secret, event, payload as Record<string, unknown>)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.warn('webhooks.emit.deliver_threw', { webhook_id: sub.id, event, error: message })
    result = { status: null, duration_ms: 0, body_excerpt: '', error: message }
  }

  const isOk = typeof result.status === 'number' && result.status >= 200 && result.status < 300
  const isClient4xx =
    typeof result.status === 'number' && result.status >= 400 && result.status < 500

  let nextRetryAt: Date | null = null
  let finalStatusAt: Date | null = null
  let circuitTrip = false

  if (isOk) {
    summary.delivered++
    finalStatusAt = now
  } else if (isClient4xx) {
    // 4xx is a terminal client error : retrying won't help (integrator
    // schema bug, auth header missing, etc.). Stamp final immediately.
    summary.failed_initial++
    finalStatusAt = now
  } else {
    const nextFailures = sub.consecutive_failures + 1
    if (nextFailures >= MAX_CONSECUTIVE_FAILURES) {
      circuitTrip = true
      summary.circuit_broken++
      finalStatusAt = now
    } else {
      // attempt=1 just failed → schedule attempt=2 via the +5min slot.
      nextRetryAt = computeNextRetryAt(2, now)
      if (nextRetryAt) {
        summary.scheduled_retry++
      } else {
        finalStatusAt = now
        summary.failed_initial++
      }
    }
  }

  try {
    await deps.recordDelivery({
      webhook_id: sub.id,
      event,
      payload: payload as Record<string, unknown>,
      attempt: 1,
      status: result.status,
      duration_ms: result.duration_ms,
      body_excerpt: result.body_excerpt,
      error: result.error,
      next_retry_at: nextRetryAt,
      final_status_at: finalStatusAt,
    })
  } catch (err) {
    logger.warn('webhooks.emit.record_failed', {
      webhook_id: sub.id,
      error: err instanceof Error ? err.message : String(err),
    })
  }

  try {
    await deps.updateHookBookkeeping({
      webhook_id: sub.id,
      last_delivery_at: now,
      last_delivery_status: result.status,
      consecutive_failures: isOk ? 0 : sub.consecutive_failures + 1,
    })
  } catch (err) {
    logger.warn('webhooks.emit.bookkeeping_failed', {
      webhook_id: sub.id,
      error: err instanceof Error ? err.message : String(err),
    })
  }

  if (circuitTrip) {
    try {
      await deps.disableHook(sub.id)
    } catch (err) {
      logger.warn('webhooks.emit.disable_failed', {
        webhook_id: sub.id,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}
