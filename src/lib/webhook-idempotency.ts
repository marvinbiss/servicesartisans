import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

/**
 * Check if a webhook event was already processed.
 * Returns true if the event should be skipped (already completed).
 * Fails open: if the DB check itself fails, processing continues.
 *
 * Uses the existing `webhook_events` table with `stripe_event_id` column.
 * Non-Stripe providers prefix their IDs to avoid collisions:
 *   - Stripe:  "evt_xxx" (no prefix, legacy)
 *   - Resend:  "resend:xxx"
 *   - Twilio:  "twilio:xxx"
 *   - Vapi:    "vapi:xxx"
 */
const WEBHOOK_PROCESSING_TIMEOUT_MS = 30_000

export async function checkWebhookIdempotency(eventId: string, provider: string): Promise<boolean> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase.from('webhook_events').insert({
      stripe_event_id: eventId,
      provider, // mig 511 — discriminant explicite pour agrégations admin
      type: `${provider}_webhook`,
      status: 'processing',
      created_at: new Date().toISOString(),
    })

    if (error) {
      if (error.code === '23505') {
        const { data: existing } = await supabase
          .from('webhook_events')
          .select('status, created_at')
          .eq('stripe_event_id', eventId)
          .maybeSingle()

        if (existing?.status === 'completed') {
          logger.info(`Webhook event ${eventId} already processed, skipping`)
          return true
        }

        if (existing?.status === 'processing') {
          const ageMs = existing.created_at
            ? Date.now() - new Date(existing.created_at).getTime()
            : 0
          if (ageMs < WEBHOOK_PROCESSING_TIMEOUT_MS) {
            logger.warn(`Webhook event ${eventId} already in flight (age=${ageMs}ms), skipping`)
            return true
          }
          logger.warn(
            `Webhook event ${eventId} stuck in processing >${WEBHOOK_PROCESSING_TIMEOUT_MS}ms, claiming`
          )
        }
      } else {
        logger.warn(`Webhook idempotency insert failed for ${eventId}`, { code: error.code })
      }
    }

    return false
  } catch (err) {
    logger.warn(`Webhook idempotency check failed for ${eventId}, proceeding`, {
      error: String(err),
    })
    return false
  }
}

export async function markWebhookCompleted(eventId: string, eventType: string): Promise<void> {
  try {
    const supabase = createAdminClient()
    await supabase
      .from('webhook_events')
      .update({
        type: eventType,
        status: 'completed',
        processed_at: new Date().toISOString(),
      })
      .eq('stripe_event_id', eventId)
  } catch (err) {
    logger.warn(`Failed to mark webhook ${eventId} as completed`, { error: String(err) })
  }
}

export async function markWebhookFailed(eventId: string, errorMsg: string): Promise<void> {
  try {
    const supabase = createAdminClient()
    await supabase
      .from('webhook_events')
      .update({
        status: 'failed',
        error: errorMsg.slice(0, 1000),
        processed_at: new Date().toISOString(),
      })
      .eq('stripe_event_id', eventId)
  } catch (err) {
    logger.warn(`Failed to mark webhook ${eventId} as failed`, { error: String(err) })
  }
}
