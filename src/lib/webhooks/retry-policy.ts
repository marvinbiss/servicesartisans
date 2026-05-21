/**
 * Retry policy for RGE-OS webhook deliveries (pillar 8, v0.2).
 *
 * Exponential backoff capped at a 24h horizon — past attempt 5 we give up
 * (the row is stamped `final_status_at = now()` with the last observed
 * status, NO more retry).
 *
 *   attempt 1 (initial) →  +1 min   (immediate, from cron tick)
 *   attempt 2          →  +5 min
 *   attempt 3          →  +30 min
 *   attempt 4          →  +3 h
 *   attempt 5          →  +12 h
 *   attempt 6+         →  terminal (max_attempts)
 *
 * Plus a webhook-level circuit-breaker (rge_os_webhooks.consecutive_failures) :
 * once `MAX_CONSECUTIVE_FAILURES` (10) is reached, the cron flips
 * `rge_os_webhooks.active = false` and marks the in-flight row terminal.
 * This protects the platform from hammering a broken integrator endpoint
 * for hours, and surfaces the outage to the integrator via the dashboard
 * (their hook went inactive, they re-enable manually after fixing).
 *
 * `decideRetry` is the single source of truth for the state machine — it
 * is invoked from `runWebhookRetry` and is fully pure (no I/O), so the
 * cron route is the only file that needs to mock dependencies.
 */

export const MAX_ATTEMPTS = 5
export const MAX_CONSECUTIVE_FAILURES = 10

export const BACKOFF_SCHEDULE_SECONDS: readonly number[] = [
  60, // attempt 1 already done → retry +1min
  300, // attempt 2 → +5min
  1800, // attempt 3 → +30min
  10_800, // attempt 4 → +3h
  43_200, // attempt 5 → +12h
]

export function computeNextRetryAt(currentAttempt: number, now: Date = new Date()): Date | null {
  if (currentAttempt >= MAX_ATTEMPTS) return null
  const seconds = BACKOFF_SCHEDULE_SECONDS[currentAttempt - 1]
  if (seconds === undefined) return null
  return new Date(now.getTime() + seconds * 1000)
}

export function isTerminalStatus(status: number | null): boolean {
  if (status === null) return false
  return status >= 200 && status < 300
}

export function isClientError(status: number | null): boolean {
  if (status === null) return false
  return status >= 400 && status < 500
}

export type RetryDecision =
  | { action: 'retry'; nextRetryAt: Date }
  | { action: 'terminal'; reason: 'success' | 'client_error' | 'max_attempts' | 'circuit_breaker' }

export function decideRetry(
  attempt: number,
  status: number | null,
  consecutiveFailures: number,
  now: Date = new Date()
): RetryDecision {
  if (isTerminalStatus(status)) return { action: 'terminal', reason: 'success' }
  if (isClientError(status)) return { action: 'terminal', reason: 'client_error' }
  if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    return { action: 'terminal', reason: 'circuit_breaker' }
  }
  if (attempt >= MAX_ATTEMPTS) return { action: 'terminal', reason: 'max_attempts' }
  const nextRetryAt = computeNextRetryAt(attempt + 1, now)
  if (!nextRetryAt) return { action: 'terminal', reason: 'max_attempts' }
  return { action: 'retry', nextRetryAt }
}
