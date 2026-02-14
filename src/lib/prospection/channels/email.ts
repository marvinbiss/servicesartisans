/**
 * Email Channel Sender - Prospection
 * Envoi d'emails via Resend pour campagnes de prospection
 */

import { sendEmail, sendBatchEmails } from '@/lib/api/resend-client'
import { logger } from '@/lib/logger'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'
const DEFAULT_FROM = 'ServicesArtisans <noreply@servicesartisans.fr>'

export interface EmailProspectionParams {
  to: string
  subject: string
  html: string
  text?: string
  tags?: { name: string; value: string }[]
}

export interface EmailResult {
  success: boolean
  id?: string
  error?: string
}

/**
 * Generate a plain text fallback by stripping HTML tags
 */
function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Build deliverability headers for bulk prospection emails
 */
function buildProspectionHeaders(to: string): Record<string, string> {
  return {
    'List-Unsubscribe': `<${SITE_URL}/api/prospection/unsubscribe?email=${encodeURIComponent(to)}>, <mailto:unsubscribe@servicesartisans.fr?subject=unsubscribe>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    'Precedence': 'bulk',
  }
}

/**
 * Envoyer un email de prospection
 */
export async function sendProspectionEmail(params: EmailProspectionParams): Promise<EmailResult> {
  try {
    const plainText = params.text || htmlToPlainText(params.html)

    const result = await sendEmail({
      to: params.to,
      from: DEFAULT_FROM,
      subject: params.subject,
      html: params.html,
      text: plainText,
      headers: buildProspectionHeaders(params.to),
      tags: [
        { name: 'type', value: 'prospection' },
        ...(params.tags || []),
      ],
    })

    return { success: true, id: result.id }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Prospection email error', error as Error)
    return { success: false, error: errMsg }
  }
}

/**
 * Envoyer un batch d'emails de prospection
 */
export async function sendProspectionEmailBatch(
  emails: EmailProspectionParams[]
): Promise<{ sent: number; failed: number; results: EmailResult[] }> {
  try {
    const batchParams = emails.map(e => ({
      to: e.to,
      from: DEFAULT_FROM,
      subject: e.subject,
      html: e.html,
      text: e.text || htmlToPlainText(e.html),
      headers: buildProspectionHeaders(typeof e.to === 'string' ? e.to : ''),
      tags: [
        { name: 'type', value: 'prospection' },
        ...(e.tags || []),
      ],
    }))

    const results = await sendBatchEmails({ emails: batchParams })

    return {
      sent: results.length,
      failed: emails.length - results.length,
      results: results.map(r => ({ success: true, id: r.id })),
    }
  } catch (error) {
    logger.error('Prospection email batch error', error as Error)
    return {
      sent: 0,
      failed: emails.length,
      results: emails.map(() => ({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })),
    }
  }
}
