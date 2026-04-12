import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { verifyResendSignature } from '@/lib/prospection/webhook-security'
import {
  checkWebhookIdempotency,
  markWebhookCompleted,
  markWebhookFailed,
} from '@/lib/webhook-idempotency'

export const dynamic = 'force-dynamic'

/**
 * Webhook Resend - Delivery status callbacks pour les emails
 * Reçoit les événements: email.sent, email.delivered, email.bounced,
 * email.complained, email.delivery_delayed
 */
export async function POST(request: NextRequest) {
  let idempotencyKey: string | null = null

  try {
    const rawBody = await request.text()

    const svixId = request.headers.get('svix-id') || undefined
    const svixHeaders = {
      'svix-id': svixId,
      'svix-timestamp': request.headers.get('svix-timestamp') || undefined,
      'svix-signature': request.headers.get('svix-signature') || undefined,
    }

    if (!verifyResendSignature(rawBody, svixHeaders)) {
      logger.warn('Signature webhook Resend invalide')
      return new NextResponse('Invalid signature', { status: 401 })
    }

    const event = JSON.parse(rawBody)
    const eventType: string = event.type
    const data = event.data

    if (!eventType || !data) {
      return new NextResponse('OK', { status: 200 })
    }

    idempotencyKey = svixId ? `resend:${svixId}` : null
    if (idempotencyKey) {
      const shouldSkip = await checkWebhookIdempotency(idempotencyKey, 'resend')
      if (shouldSkip) {
        return new NextResponse('OK', { status: 200 })
      }
    }

    const supabase = createAdminClient()

    const statusMap: Record<string, string> = {
      'email.sent': 'sent',
      'email.delivered': 'delivered',
      'email.bounced': 'failed',
      'email.complained': 'failed',
      'email.delivery_delayed': 'sending',
    }

    const newStatus = statusMap[eventType]
    if (!newStatus) {
      return new NextResponse('OK', { status: 200 })
    }

    const emailId: string | undefined = data.email_id
    if (!emailId) {
      logger.warn('Resend webhook missing email_id', { eventType })
      return new NextResponse('OK', { status: 200 })
    }

    const updateData: Record<string, unknown> = { status: newStatus }

    switch (newStatus) {
      case 'sent':
        updateData.sent_at = new Date().toISOString()
        break
      case 'delivered':
        updateData.delivered_at = new Date().toISOString()
        break
      case 'failed':
        updateData.failed_at = new Date().toISOString()
        updateData.error_code = eventType === 'email.bounced' ? 'bounced' : 'complained'
        updateData.error_message = data.bounce?.message || data.complaint?.message || eventType
        break
    }

    const { error } = await supabase
      .from('prospection_messages')
      .update(updateData)
      .eq('external_id', emailId)

    if (error) {
      logger.error('Resend webhook DB update error', error)
    }

    if (idempotencyKey) {
      await markWebhookCompleted(idempotencyKey, eventType)
    }

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    logger.error('Resend webhook error', error as Error)
    if (idempotencyKey) {
      await markWebhookFailed(
        idempotencyKey,
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
    return new NextResponse('OK', { status: 200 })
  }
}
