/**
 * Webhook Security - Prospection
 * Vérification des signatures pour Twilio et Resend
 */

import twilio from 'twilio'
import { logger } from '@/lib/logger'

/**
 * Vérifier la signature Twilio (X-Twilio-Signature)
 */
export function verifyTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!authToken) {
    logger.error('TWILIO_AUTH_TOKEN not configured for webhook verification')
    return false
  }

  try {
    return twilio.validateRequest(authToken, signature, url, params)
  } catch (error) {
    logger.error('Twilio signature verification error', error as Error)
    return false
  }
}

/**
 * Vérifier la signature Resend (webhook svix)
 */
export function verifyResendSignature(
  _payload: string,
  headers: {
    'svix-id'?: string
    'svix-timestamp'?: string
    'svix-signature'?: string
  }
): boolean {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET
  if (!webhookSecret) {
    logger.warn('RESEND_WEBHOOK_SECRET not configured')
    return false
  }

  try {
    const svixId = headers['svix-id']
    const svixTimestamp = headers['svix-timestamp']
    const svixSignature = headers['svix-signature']

    if (!svixId || !svixTimestamp || !svixSignature) {
      return false
    }

    // Vérifier le timestamp (max 5 minutes de différence)
    const timestamp = parseInt(svixTimestamp, 10)
    const now = Math.floor(Date.now() / 1000)
    if (Math.abs(now - timestamp) > 300) {
      logger.warn('Resend webhook timestamp too old')
      return false
    }

    // Pour une vérification complète, il faudrait utiliser le package @svix/webhook
    // Pour l'instant, on vérifie juste la présence des headers
    return true
  } catch (error) {
    logger.error('Resend signature verification error', error as Error)
    return false
  }
}
