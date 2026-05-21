/**
 * Retry orchestrator for RGE-OS webhook deliveries — invoked by
 * `/api/cron/webhooks-retry` every 5 minutes.
 *
 * Algorithm :
 *   1. Scan `rge_os_webhook_deliveries` where `final_status_at IS NULL`
 *      AND `next_retry_at <= now()` AND `attempt < MAX_ATTEMPTS`. Cap at
 *      `MAX_ROWS_PER_TICK` (100) rows per tick to bound the cost of one
 *      Vercel invocation.
 *   2. For each row, join its parent webhook (url, secret, active flag,
 *      consecutive_failures counter). If the hook is inactive, the row is
 *      stamped terminal with status NULL to free the queue (no delivery
 *      attempted).
 *   3. Otherwise, deliver via Ralph 24 `deliverWebhook`. Bump the parent's
 *      `consecutive_failures` (reset to 0 on 2xx, +1 otherwise).
 *   4. Compute the decision via `decideRetry` :
 *        - 2xx           → terminal success
 *        - 4xx           → terminal client_error (don't retry, integrator bug)
 *        - 5xx / null +
 *           attempt<MAX  → schedule next retry via backoff
 *        - circuit-break → terminal + disable the hook
 *        - max attempts  → terminal failure
 *   5. Insert a new `rge_os_webhook_deliveries` row capturing the result
 *      of this attempt (append-only log).
 *   6. Stamp `final_status_at` on the ORIGINAL row when decision is terminal.
 *
 * Idempotency note :
 *   Vercel cron is single-tenant per minute, but two ticks could in theory
 *   overlap during cold-start storms. The window is small (10s delivery
 *   timeout × 100 rows is the worst case) and `stampFinal` makes subsequent
 *   updates no-ops on already-final rows. A pg_try_advisory_xact_lock
 *   tightening is deferred to v0.3.
 *
 * Dependency injection : all I/O is passed via `WebhooksRetryDeps` so the
 * cron route is the only file that touches Supabase / fetch. The orchestrator
 * itself is pure logic + sequencing, fully unit-testable.
 */

import { logger } from '@/lib/logger'
import { deliverWebhook } from './delivery'
import type { WebhookEvent } from './events'
import { decideRetry, MAX_ATTEMPTS } from './retry-policy'

export const MAX_ROWS_PER_TICK = 100

export type EligibleRow = {
  delivery_id: number
  webhook_id: string
  event: WebhookEvent
  payload: Record<string, unknown>
  attempt: number
  url: string
  secret: string
  active: boolean
  consecutive_failures: number
}

export type InsertDeliveryArgs = {
  webhook_id: string
  event: WebhookEvent
  payload: Record<string, unknown>
  attempt: number
  status: number | null
  duration_ms: number
  body_excerpt: string
  error: string | null
  next_retry_at: Date | null
}

export type WebhooksRetryDeps = {
  fetchEligibleRows: (limit: number) => Promise<EligibleRow[]>
  insertRetryDelivery: (row: InsertDeliveryArgs) => Promise<void>
  stampFinal: (deliveryId: number, finalStatusAt: Date, status: number | null) => Promise<void>
  bumpWebhookFailures: (
    webhookId: string,
    status: number | null
  ) => Promise<{ consecutive_failures: number }>
  disableWebhook: (webhookId: string) => Promise<void>
  deliver: typeof deliverWebhook
  now?: () => Date
}

export type RetrySummary = {
  processed: number
  retried: number
  terminal_success: number
  terminal_failure: number
  circuit_broken: number
  skipped_inactive: number
}

export async function runWebhookRetry(deps: WebhooksRetryDeps): Promise<RetrySummary> {
  const summary: RetrySummary = {
    processed: 0,
    retried: 0,
    terminal_success: 0,
    terminal_failure: 0,
    circuit_broken: 0,
    skipped_inactive: 0,
  }
  const now = deps.now ?? (() => new Date())
  const rows = await deps.fetchEligibleRows(MAX_ROWS_PER_TICK)

  for (const row of rows) {
    summary.processed++

    if (!row.active) {
      summary.skipped_inactive++
      await deps.stampFinal(row.delivery_id, now(), null)
      continue
    }

    const nextAttempt = row.attempt + 1
    if (nextAttempt > MAX_ATTEMPTS) {
      await deps.stampFinal(row.delivery_id, now(), null)
      summary.terminal_failure++
      continue
    }

    const result = await deps.deliver(row.url, row.secret, row.event, row.payload)
    const bumped = await deps.bumpWebhookFailures(row.webhook_id, result.status)
    const decision = decideRetry(nextAttempt, result.status, bumped.consecutive_failures, now())

    await deps.insertRetryDelivery({
      webhook_id: row.webhook_id,
      event: row.event,
      payload: row.payload,
      attempt: nextAttempt,
      status: result.status,
      duration_ms: result.duration_ms,
      body_excerpt: result.body_excerpt,
      error: result.error,
      next_retry_at: decision.action === 'retry' ? decision.nextRetryAt : null,
    })

    if (decision.action === 'retry') {
      summary.retried++
      continue
    }

    // Terminal — stamp original row and update counters.
    await deps.stampFinal(row.delivery_id, now(), result.status)

    if (decision.reason === 'success') {
      summary.terminal_success++
    } else if (decision.reason === 'circuit_breaker') {
      await deps.disableWebhook(row.webhook_id)
      summary.circuit_broken++
      summary.terminal_failure++
    } else {
      summary.terminal_failure++
    }
  }

  logger.info('webhooks.retry.tick', summary)
  return summary
}
