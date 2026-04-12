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
export async function checkWebhookIdempotency(eventId: string, provider: string): Promise<boolean> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase.from('webhook_events').insert({
      stripe_event_id: eventId,
      type: `${provider}_webhook`,
      status: 'processing',
      created_at: new Date().toISOString(),
    })

    if (error) {
      if (error.code === '23505') {
        const { data: existing } = await supabase
          .from('webhook_events')
          .select('status')
          .eq('stripe_event_id', eventId)
          .single()

        if (existing?.status === 'completed') {
          logger.info(`Webhook event ${eventId} already processed, skipping`)
          return true
        }
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
