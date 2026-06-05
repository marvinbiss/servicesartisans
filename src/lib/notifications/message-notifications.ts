/**
 * Message Notification Service
 *
 * Sends email notifications when a new message is received in a conversation.
 * Non-blocking: errors are logged but never propagated to the caller.
 */

import { sendEmail } from '@/lib/email/resend'
import { getNewMessageAlertEmail } from '@/lib/email/templates/new-message-alert'
import { logger } from '@/lib/logger'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'

interface MessageNotificationParams {
  /** Email of the recipient (artisan or client) */
  recipientEmail: string
  /** Display name of the recipient */
  recipientName: string
  /** Display name of the message sender */
  senderName: string
  /** Message content (will be truncated in template) */
  messageContent: string
  /** 'artisan' or 'client' — determines the dashboard URL */
  recipientRole: 'artisan' | 'client'
}

/**
 * Send a new message email notification.
 * Fire-and-forget: catches all errors and logs them.
 * Returns true if sent successfully, false otherwise.
 */
export async function notifyNewMessage(params: MessageNotificationParams): Promise<boolean> {
  const { recipientEmail, recipientName, senderName, messageContent, recipientRole } = params

  if (!recipientEmail) {
    logger.warn('[message-notification] No recipient email, skipping notification')
    return false
  }

  try {
    // Espace particulier fermé 2026-06-05 : les clients ne peuvent plus se
    // connecter, on les oriente vers /contact au lieu de /espace-client.
    const conversationUrl =
      recipientRole === 'artisan' ? `${SITE_URL}/espace-artisan/messages` : `${SITE_URL}/contact`

    const { subject, html } = getNewMessageAlertEmail({
      recipientName: recipientName || (recipientRole === 'artisan' ? 'Artisan' : 'Client'),
      senderName: senderName || "Quelqu'un",
      messagePreview: messageContent,
      conversationUrl,
    })

    const result = await sendEmail({ to: recipientEmail, subject, html })

    if (!result.success) {
      logger.error('[message-notification] Email send failed:', {
        error: result.error,
        to: recipientEmail,
      })
      return false
    }

    logger.info('[message-notification] Email sent', { to: recipientEmail, recipientRole })
    return true
  } catch (err) {
    logger.error('[message-notification] Unexpected error:', err)
    return false
  }
}
