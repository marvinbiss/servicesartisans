/**
 * Webhook idempotency — stores (source, event_id) tuples in
 * `cee_webhook_events` so replayed webhook deliveries are silently ignored
 * after the first processing.
 *
 * Caller contract
 * ---------------
 *   const { fresh } = await recordWebhookEvent(admin, {
 *     source: 'yousign',
 *     event_id: `${envelopeId}:${eventType}`,
 *     event_type: eventType,
 *     payload,
 *   })
 *   if (!fresh) return NextResponse.json({ ok: true, duplicate: true })
 *   // ...process event...
 *
 * DB model
 * --------
 * UNIQUE (source, event_id) → ON CONFLICT DO NOTHING. `fresh = true` iff a
 * new row was inserted.
 */

import { logger } from '@/lib/logger'
import type { SupabaseClient } from '@supabase/supabase-js'

export type WebhookSource = 'yousign' | 'pipedrive' | 'other'

export interface RecordWebhookEventInput {
  source: WebhookSource
  /** Deterministic, stable identifier of the event (e.g. `${envelopeId}:${type}`). */
  event_id: string
  event_type?: string | null
  payload?: Record<string, unknown>
}

export interface RecordWebhookEventResult {
  /** true if the row was freshly inserted, false if this is a duplicate. */
  fresh: boolean
}

/**
 * Record a webhook event for idempotency.
 * Uses `.insert()` with `.select().single()` — PostgREST returns the row
 * on success and a 23505 error on UNIQUE violation.
 */
export async function recordWebhookEvent(
  supabase: SupabaseClient,
  input: RecordWebhookEventInput
): Promise<RecordWebhookEventResult> {
  const { source, event_id, event_type, payload } = input

  if (!event_id || typeof event_id !== 'string') {
    throw new Error('webhook-idempotency: event_id required')
  }

  const { error } = await supabase
    .from('cee_webhook_events')
    .insert({
      source,
      event_id,
      event_type: event_type ?? null,
      payload: payload ?? {},
    })
    .select('id')
    .single()

  if (!error) {
    return { fresh: true }
  }

  const code = (error as { code?: string }).code
  if (code === '23505') {
    logger.info('cee-webhook: duplicate event ignored', {
      action: 'cee-webhook-duplicate',
      source,
      event_id,
    })
    return { fresh: false }
  }

  logger.error('cee-webhook: idempotency insert failed', error, {
    action: 'cee-webhook-insert-fail',
    source,
    event_id,
  })
  throw new Error('webhook idempotency insert failed')
}
