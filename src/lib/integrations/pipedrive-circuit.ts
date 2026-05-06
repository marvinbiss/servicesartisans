/**
 * Pipedrive circuit-breaker — Plan C — C-4 (DLQ-1).
 *
 * Pattern Hystrix simplifié :
 *   closed     : flux nominal, on appelle Pipedrive
 *   open       : skip tous les appels jusqu'à `next_attempt_at`
 *   half_open  : 1 tentative autorisée → succès → closed, fail → open+1
 *
 * Distinction infra vs métier :
 *   - infra (timeout, ECONNRESET, 5xx, 429) → incrémente `consecutive_failures`
 *   - métier (400 Bad Request, "person not found") → no-op sur breaker
 *
 * Singleton row id=true en table `pipedrive_circuit_state` (mig 515).
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'

const FAILURE_THRESHOLD = Number(process.env.PIPEDRIVE_CIRCUIT_FAILURE_THRESHOLD) || 10
const OPEN_DURATION_MS = Number(process.env.PIPEDRIVE_CIRCUIT_OPEN_DURATION_MS) || 30 * 60 * 1000

export type CircuitState = 'closed' | 'open' | 'half_open'

type CircuitRow = {
  state: CircuitState
  consecutive_failures: number
  next_attempt_at: string | null
  opened_at: string | null
  total_opens: number
}

/**
 * Vrai si l'erreur est de type infrastructure / Pipedrive globalement HS
 * (vs erreur métier sur un lead spécifique : email malformé, etc.).
 */
export function isInfrastructureError(err: unknown): boolean {
  if (!err) return false
  const message = err instanceof Error ? err.message : String(err)
  if (
    /fetch failed|TimeoutError|AbortError|ECONNRESET|ETIMEDOUT|getaddrinfo|EAI_AGAIN|socket hang up|UND_ERR_/i.test(
      message
    )
  ) {
    return true
  }
  // Format pdFetch : "Pipedrive /persons failed: <status> <error>"
  if (/Pipedrive .* failed: 5\d\d/.test(message)) return true
  if (/Pipedrive .* failed: 429/.test(message)) return true
  if (/Pipedrive .* failed: 408/.test(message)) return true
  return false
}

async function fetchState(): Promise<CircuitRow | null> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('pipedrive_circuit_state')
      .select('state, consecutive_failures, next_attempt_at, opened_at, total_opens')
      .eq('id', true)
      .maybeSingle()
    if (error) {
      logger.warn('pipedrive-circuit: state fetch error', { error: error.message })
      return null
    }
    return (data as CircuitRow | null) ?? null
  } catch (err) {
    logger.warn('pipedrive-circuit: state fetch threw', { error: String(err) })
    return null
  }
}

/**
 * Doit-on skipper l'appel Pipedrive ?
 *   - true  : circuit ouvert, ne tente pas
 *   - false : circuit fermé OU half_open transitoire (tente UNE fois)
 *
 * Effet de bord : si state=open ET next_attempt_at expiré, on bascule en
 * half_open ici (1 lecture+1 update SQL). Fail-open en cas d'erreur DB
 * (préférable de spammer Pipedrive que de bloquer toute la sync queue).
 */
export async function shouldSkipPipedrive(): Promise<boolean> {
  const state = await fetchState()
  if (!state) return false // fail-open
  if (state.state === 'closed') return false
  if (state.state === 'half_open') return false

  // state === 'open'
  if (state.next_attempt_at && new Date(state.next_attempt_at) <= new Date()) {
    // Cooldown écoulé : transition open → half_open (autoriser 1 tentative)
    try {
      const supabase = createAdminClient()
      await supabase
        .from('pipedrive_circuit_state')
        .update({ state: 'half_open', updated_at: new Date().toISOString() })
        .eq('id', true)
      logger.info('pipedrive-circuit: open → half_open (cooldown elapsed)')
    } catch (err) {
      logger.warn('pipedrive-circuit: half_open transition failed', { error: String(err) })
    }
    return false
  }

  return true
}

/**
 * Enregistre un succès. Reset counter, transition vers closed.
 * Idempotent : si déjà closed avec 0 failures, no-op.
 */
export async function recordPipedriveSuccess(): Promise<void> {
  try {
    const supabase = createAdminClient()
    await supabase
      .from('pipedrive_circuit_state')
      .update({
        state: 'closed',
        consecutive_failures: 0,
        last_success_at: new Date().toISOString(),
        last_error_message: null,
        next_attempt_at: null,
        opened_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', true)
  } catch (err) {
    logger.warn('pipedrive-circuit: recordSuccess failed', { error: String(err) })
  }
}

/**
 * Enregistre un échec. Si > FAILURE_THRESHOLD échecs consécutifs ou si déjà
 * half_open → transition vers open (cooldown OPEN_DURATION_MS).
 * Si l'erreur n'est pas infra → ne touche PAS au counter (no-op).
 */
export async function recordPipedriveFailure(err: unknown): Promise<void> {
  if (!isInfrastructureError(err)) return

  const message = err instanceof Error ? err.message : String(err)
  const supabase = createAdminClient()

  try {
    const state = await fetchState()
    const now = new Date()
    const consecutiveFailures = (state?.consecutive_failures ?? 0) + 1
    const wasHalfOpen = state?.state === 'half_open'
    const shouldOpen = wasHalfOpen || consecutiveFailures >= FAILURE_THRESHOLD

    if (shouldOpen) {
      const nextAttempt = new Date(now.getTime() + OPEN_DURATION_MS)
      await supabase
        .from('pipedrive_circuit_state')
        .update({
          state: 'open',
          consecutive_failures: consecutiveFailures,
          last_failure_at: now.toISOString(),
          last_error_message: message.slice(0, 500),
          opened_at: now.toISOString(),
          next_attempt_at: nextAttempt.toISOString(),
          total_opens: (state?.total_opens ?? 0) + 1,
          updated_at: now.toISOString(),
        })
        .eq('id', true)

      // Sentry : 1 alerte par open (pas par fail accumulé)
      captureError(err, {
        tags: {
          integration: 'pipedrive',
          circuit: 'opened',
          critical: 'true',
        },
        extras: {
          consecutive_failures: consecutiveFailures,
          half_open_failed: wasHalfOpen,
          next_attempt_at: nextAttempt.toISOString(),
          open_duration_ms: OPEN_DURATION_MS,
        },
      })

      logger.error('pipedrive-circuit: OPENED', {
        consecutive_failures: consecutiveFailures,
        next_attempt_at: nextAttempt.toISOString(),
      })
    } else {
      await supabase
        .from('pipedrive_circuit_state')
        .update({
          consecutive_failures: consecutiveFailures,
          last_failure_at: now.toISOString(),
          last_error_message: message.slice(0, 500),
          updated_at: now.toISOString(),
        })
        .eq('id', true)
    }
  } catch (e) {
    logger.warn('pipedrive-circuit: recordFailure failed', { error: String(e) })
  }
}

export const PIPEDRIVE_CIRCUIT_CONFIG = {
  failureThreshold: FAILURE_THRESHOLD,
  openDurationMs: OPEN_DURATION_MS,
}
