/**
 * Resend Email API Client
 * Transactional email with world-class reliability
 * Documentation: https://resend.com/docs
 */

import { Resend } from 'resend'
import { retry } from '../utils/retry'
import { APIError, ErrorCode, AppError, ValidationError } from '../utils/errors'
import { apiLogger } from '../utils/logger'
import { isEmailSuppressed, filterSuppressed } from '@/lib/email/suppression'
import crypto from 'crypto'

// Lazy-loaded Resend client
let resendClient: Resend | null = null

export function getResendClient(): Resend {
  if (resendClient) return resendClient

  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    throw new APIError('Resend', 'API key not configured', {
      code: ErrorCode.API_UNAUTHORIZED,
    })
  }

  resendClient = new Resend(apiKey)
  return resendClient
}

// Default sender — always "Name <email>" format (RFC 5322)
const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || 'ServicesArtisans <noreply@servicesartisans.fr>'

// ============================================
// HELPER UTILITIES
// ============================================

// escapeHtml imported from shared utility; re-exported for backward compatibility
import { escapeHtml } from '@/lib/utils/html'
export { escapeHtml }

/**
 * Validate a URL to ensure it's safe for use in href attributes.
 * Only allows http:, https:, and mailto: protocols.
 */
export function validateUrl(url: string): string {
  const trimmed = url.trim()
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('mailto:')
  ) {
    return trimmed
  }
  // Block javascript:, data:, vbscript:, and other dangerous protocols
  return '#'
}

/**
 * Convert HTML to plain text for email fallback.
 * Strips tags and converts common elements to text equivalents.
 */
export function htmlToText(html: string): string {
  let text = html

  // Remove DOCTYPE and head section
  text = text.replace(/<!DOCTYPE[^>]*>/gi, '')
  text = text.replace(/<head[\s\S]*?<\/head>/gi, '')

  // Convert line breaks
  text = text.replace(/<br\s*\/?>/gi, '\n')

  // Convert paragraphs
  text = text.replace(/<\/p>/gi, '\n\n')
  text = text.replace(/<p[^>]*>/gi, '')

  // Convert list items
  text = text.replace(/<li[^>]*>/gi, '- ')
  text = text.replace(/<\/li>/gi, '\n')

  // Convert links: <a href="url">text</a> -> text (url)
  text = text.replace(/<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, url, linkText) => {
    const cleanText = linkText.replace(/<[^>]+>/g, '').trim()
    return `${cleanText} (${url})`
  })

  // Convert strong/bold
  text = text.replace(/<\/?(?:strong|b)[^>]*>/gi, '')

  // Convert em/italic
  text = text.replace(/<\/?(?:em|i)[^>]*>/gi, '')

  // Convert headings to uppercase with spacing
  text = text.replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, (_, content) => {
    return `\n${content.replace(/<[^>]+>/g, '').trim()}\n\n`
  })

  // Convert hr to dashes
  text = text.replace(/<hr[^>]*>/gi, '\n---\n')

  // Convert divs and sections to newlines
  text = text.replace(/<\/(?:div|section|article|header|footer)>/gi, '\n')

  // Strip all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '')

  // Decode HTML entities
  text = text.replace(/&amp;/g, '&')
  text = text.replace(/&lt;/g, '<')
  text = text.replace(/&gt;/g, '>')
  text = text.replace(/&quot;/g, '"')
  text = text.replace(/&#039;/g, "'")
  text = text.replace(/&nbsp;/g, ' ')
  text = text.replace(/&eacute;/g, 'e')
  text = text.replace(/&egrave;/g, 'e')
  text = text.replace(/&agrave;/g, 'a')
  text = text.replace(/&ccedil;/g, 'c')

  // Collapse excessive whitespace but preserve paragraph breaks
  text = text.replace(/[ \t]+/g, ' ')
  text = text.replace(/\n[ \t]+/g, '\n')
  text = text.replace(/[ \t]+\n/g, '\n')
  text = text.replace(/\n{3,}/g, '\n\n')

  return text.trim()
}

/**
 * Generate HMAC-signed List-Unsubscribe headers.
 * For transactional emails: mailto only.
 * For marketing/bulk emails: mailto + one-click URL (RFC 8058).
 */
export function getUnsubscribeHeaders(
  email: string,
  type: 'transactional' | 'marketing'
): Record<string, string> {
  if (type === 'transactional') {
    return {
      'List-Unsubscribe': '<mailto:unsubscribe@servicesartisans.fr>',
    }
  }

  // Marketing: generate HMAC-signed one-click unsubscribe URL
  const secret = process.env.UNSUBSCRIBE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const payload = JSON.stringify({
    email,
    t: Date.now(),
  })
  const tokenPart = Buffer.from(payload).toString('base64url')
  const signature = crypto.createHmac('sha256', secret).update(tokenPart).digest('base64url')
  const token = `${tokenPart}.${signature}`

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'
  const unsubUrl = `${siteUrl}/api/prospection/unsubscribe?token=${token}`

  return {
    'List-Unsubscribe': `<mailto:unsubscribe@servicesartisans.fr>, <${unsubUrl}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  }
}

/**
 * Shared email footer HTML for all templates.
 */
function emailFooterHtml(): string {
  return `
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px; text-align: center;">
    ServicesArtisans &mdash; La plateforme des artisans qualifi&eacute;s<br>
    contact@servicesartisans.fr
  </p>`
}

// Types
export interface EmailParams {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  replyTo?: string
  cc?: string | string[]
  bcc?: string | string[]
  tags?: { name: string; value: string }[]
  headers?: Record<string, string>
  attachments?: Array<{
    filename: string
    content: string | Buffer
    contentType?: string
  }>
  /** Include List-Unsubscribe headers. Default: true */
  includeUnsubscribe?: boolean
}

export interface EmailResult {
  id: string
  from: string
  to: string[]
  createdAt: Date
}

export interface BatchEmailParams {
  emails: EmailParams[]
}

// ============================================
// EMAIL SENDING
// ============================================

/**
 * Send a single email
 */
export async function sendEmail(params: EmailParams): Promise<EmailResult> {
  const logger = apiLogger.child({ action: 'sendEmail' })
  const start = Date.now()

  // Validate
  if (!params.to) {
    throw new ValidationError('Recipient email is required', { field: 'to' })
  }
  if (!params.subject) {
    throw new ValidationError('Email subject is required', { field: 'subject' })
  }
  if (!params.html && !params.text) {
    throw new ValidationError('Email content (html or text) is required')
  }

  // Check suppression list before sending (bounced/complained/unsubscribed)
  const recipients = Array.isArray(params.to) ? params.to : [params.to]
  for (const recipient of recipients) {
    if (await isEmailSuppressed(recipient)) {
      logger.warn('Email suppressed (bounce/complaint/unsubscribe)', { to: recipient, subject: params.subject })
      return {
        id: 'suppressed',
        from: params.from || DEFAULT_FROM,
        to: recipients,
        createdAt: new Date(),
      }
    }
  }

  // Auto-generate plain text from HTML if not provided
  if (params.html && !params.text) {
    params.text = htmlToText(params.html)
  }

  // Determine recipient email for unsubscribe headers
  const recipientEmail = Array.isArray(params.to) ? params.to[0] : params.to

  // Determine email type from tags
  const emailType = params.tags?.find(t => t.name === 'type')?.value || ''
  const isTransactional = ['password_reset', 'booking_confirmation', 'welcome'].includes(emailType)
  const unsubType = isTransactional ? 'transactional' : 'marketing'

  // Build unsubscribe headers (default: included)
  const includeUnsub = params.includeUnsubscribe !== false
  const unsubHeaders = includeUnsub ? getUnsubscribeHeaders(recipientEmail, unsubType) : {}

  // Merge headers: unsubscribe headers first, then caller's custom headers (which can override)
  const mergedHeaders = {
    ...unsubHeaders,
    ...(params.headers || {}),
  }

  try {
    const resend = getResendClient()

    const result = await retry(
      async () => {
        // Use any to avoid complex type issues with Resend's changing API
        const emailData: Record<string, unknown> = {
          from: params.from || DEFAULT_FROM,
          to: Array.isArray(params.to) ? params.to : [params.to],
          subject: params.subject,
        }

        if (params.html) emailData.html = params.html
        if (params.text) emailData.text = params.text
        if (params.replyTo) emailData.reply_to = params.replyTo
        if (params.cc) emailData.cc = Array.isArray(params.cc) ? params.cc : [params.cc]
        if (params.bcc) emailData.bcc = Array.isArray(params.bcc) ? params.bcc : [params.bcc]
        if (params.tags) emailData.tags = params.tags
        if (Object.keys(mergedHeaders).length > 0) emailData.headers = mergedHeaders
        if (params.attachments?.length) {
          emailData.attachments = params.attachments.map(a => ({
            filename: a.filename,
            content: typeof a.content === 'string' ? Buffer.from(a.content) : a.content,
          }))
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await (resend.emails.send as any)(emailData)

        if (response.error) {
          throw new APIError('Resend', response.error.message, {
            code: ErrorCode.API_ERROR,
            retryable: true,
          })
        }

        return response.data
      },
      {
        maxAttempts: 3,
        initialDelay: 1000,
        onRetry: (error, attempt) => {
          logger.warn(`Retry attempt ${attempt}`, { error, to: params.to })
        },
      }
    )

    logger.info('Email sent', {
      emailId: result?.id,
      to: params.to,
      subject: params.subject,
      duration: Date.now() - start,
    })

    return {
      id: result?.id || '',
      from: params.from || DEFAULT_FROM,
      to: Array.isArray(params.to) ? params.to : [params.to],
      createdAt: new Date(),
    }
  } catch (error) {
    logger.error('Failed to send email', error as Error, {
      to: params.to,
      subject: params.subject,
    })
    throw normalizeResendError(error)
  }
}

/**
 * Send batch emails
 */
export async function sendBatchEmails(params: BatchEmailParams): Promise<EmailResult[]> {
  const logger = apiLogger.child({ action: 'sendBatchEmails' })
  const start = Date.now()

  if (!params.emails.length) {
    return []
  }

  // Filter out suppressed emails (bounced/complained/unsubscribed)
  const activeEmails: typeof params.emails = []
  for (const email of params.emails) {
    const recipients = Array.isArray(email.to) ? email.to : [email.to]
    const active = await filterSuppressed(recipients)
    if (active.length > 0) {
      activeEmails.push({ ...email, to: active.length === 1 ? active[0] : active })
    } else {
      logger.warn('All recipients suppressed, skipping email', { subject: email.subject })
    }
  }

  if (activeEmails.length === 0) {
    return []
  }

  try {
    const resend = getResendClient()

    const batchParams = activeEmails.map(email => {
      // Auto-generate plain text from HTML if not provided
      const textContent = email.text || (email.html ? htmlToText(email.html) : undefined)

      // Determine recipient email for unsubscribe headers
      const recipientEmail = Array.isArray(email.to) ? email.to[0] : email.to
      const emailType = email.tags?.find(t => t.name === 'type')?.value || ''
      const isTransactional = ['password_reset', 'booking_confirmation', 'welcome'].includes(emailType)
      const unsubType = isTransactional ? 'transactional' : 'marketing'
      const includeUnsub = email.includeUnsubscribe !== false
      const unsubHeaders = includeUnsub ? getUnsubscribeHeaders(recipientEmail, unsubType) : {}
      const mergedHeaders = {
        ...unsubHeaders,
        ...(email.headers || {}),
      }

      const emailData: Record<string, unknown> = {
        from: email.from || DEFAULT_FROM,
        to: Array.isArray(email.to) ? email.to : [email.to],
        subject: email.subject,
      }
      if (email.html) emailData.html = email.html
      if (textContent) emailData.text = textContent
      if (email.replyTo) emailData.reply_to = email.replyTo
      if (Object.keys(mergedHeaders).length > 0) emailData.headers = mergedHeaders
      return emailData
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (resend.batch.send as any)(batchParams)

    if (response.error) {
      throw new APIError('Resend', response.error.message, {
        code: ErrorCode.API_ERROR,
        retryable: true,
      })
    }

    logger.info('Batch emails sent', {
      count: activeEmails.length,
      duration: Date.now() - start,
    })

    return (response.data?.data || []).map((result: { id: string }, index: number) => ({
      id: result.id,
      from: activeEmails[index].from || DEFAULT_FROM,
      to: Array.isArray(activeEmails[index].to)
        ? activeEmails[index].to as string[]
        : [activeEmails[index].to as string],
      createdAt: new Date(),
    }))
  } catch (error) {
    logger.error('Failed to send batch emails', error as Error, {
      count: activeEmails.length,
    })
    throw normalizeResendError(error)
  }
}

// ============================================
// EMAIL TEMPLATES
// ============================================

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(params: {
  to: string
  name: string
  isArtisan?: boolean
}): Promise<EmailResult> {
  const { to, name, isArtisan } = params

  const safeName = escapeHtml(name)
  const siteUrl = validateUrl(process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr')

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; margin: 0;">ServicesArtisans</h1>
  </div>

  <h2>Bienvenue ${safeName} !</h2>

  <p>Nous sommes ravis de vous accueillir sur ServicesArtisans${isArtisan ? ', la plateforme qui connecte les artisans avec leurs clients' : ''}.</p>

  ${isArtisan ? `
  <p>Prochaines &eacute;tapes pour d&eacute;marrer :</p>
  <ul>
    <li>Compl&eacute;tez votre profil professionnel</li>
    <li>Ajoutez vos photos de r&eacute;alisations</li>
    <li>D&eacute;finissez votre zone d'intervention</li>
    <li>Configurez vos disponibilit&eacute;s</li>
  </ul>
  ` : `
  <p>Vous pouvez maintenant :</p>
  <ul>
    <li>Rechercher des artisans qualifi&eacute;s</li>
    <li>Demander des devis gratuits</li>
    <li>Prendre rendez-vous en ligne</li>
  </ul>
  `}

  <div style="text-align: center; margin: 30px 0;">
    <a href="${siteUrl}/dashboard" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
      Acc&eacute;der &agrave; mon compte
    </a>
  </div>

  <p style="color: #666; font-size: 14px;">
    Si vous avez des questions, n'h&eacute;sitez pas &agrave; nous contacter &agrave; support@servicesartisans.fr
  </p>

  ${emailFooterHtml()}
</body>
</html>
  `

  return sendEmail({
    to,
    subject: `Bienvenue sur ServicesArtisans${isArtisan ? ' !' : ', ' + name}`,
    html,
    tags: [
      { name: 'type', value: 'welcome' },
      { name: 'user_type', value: isArtisan ? 'artisan' : 'client' },
    ],
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(params: {
  to: string
  name: string
  resetLink: string
}): Promise<EmailResult> {
  const { to, name, resetLink } = params

  const safeName = escapeHtml(name)
  const safeResetLink = validateUrl(resetLink)

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; margin: 0;">ServicesArtisans</h1>
  </div>

  <h2>R&eacute;initialisation de mot de passe</h2>

  <p>Bonjour ${safeName},</p>

  <p>Vous avez demand&eacute; &agrave; r&eacute;initialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour cr&eacute;er un nouveau mot de passe :</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${safeResetLink}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
      R&eacute;initialiser mon mot de passe
    </a>
  </div>

  <p style="color: #666; font-size: 14px;">
    Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.
  </p>

  ${emailFooterHtml()}
</body>
</html>
  `

  return sendEmail({
    to,
    subject: 'Réinitialisation de votre mot de passe - ServicesArtisans',
    html,
    tags: [{ name: 'type', value: 'password_reset' }],
  })
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail(params: {
  to: string
  clientName: string
  artisanName: string
  serviceName: string
  date: string
  time: string
  address: string
  bookingId: string
}): Promise<EmailResult> {
  const { to, clientName, artisanName, serviceName, date, time, address, bookingId } = params

  const safeClientName = escapeHtml(clientName)
  const safeArtisanName = escapeHtml(artisanName)
  const safeServiceName = escapeHtml(serviceName)
  const safeDate = escapeHtml(date)
  const safeTime = escapeHtml(time)
  const safeAddress = escapeHtml(address)
  const safeBookingId = escapeHtml(bookingId)
  const siteUrl = validateUrl(process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr')

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; margin: 0;">ServicesArtisans</h1>
  </div>

  <h2>R&eacute;servation confirm&eacute;e !</h2>

  <p>Bonjour ${safeClientName},</p>

  <p>Votre rendez-vous avec <strong>${safeArtisanName}</strong> est confirm&eacute;.</p>

  <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <p style="margin: 0 0 10px 0;"><strong>Service :</strong> ${safeServiceName}</p>
    <p style="margin: 0 0 10px 0;"><strong>Date :</strong> ${safeDate}</p>
    <p style="margin: 0 0 10px 0;"><strong>Heure :</strong> ${safeTime}</p>
    <p style="margin: 0;"><strong>Adresse :</strong> ${safeAddress}</p>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${siteUrl}/reservations/${safeBookingId}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
      Voir ma r&eacute;servation
    </a>
  </div>

  <p style="color: #666; font-size: 14px;">
    Besoin de modifier ou annuler ? Rendez-vous dans votre espace client.
  </p>

  ${emailFooterHtml()}
</body>
</html>
  `

  return sendEmail({
    to,
    subject: `Rendez-vous confirmé avec ${artisanName} - ${date}`,
    html,
    tags: [
      { name: 'type', value: 'booking_confirmation' },
      { name: 'booking_id', value: bookingId },
    ],
  })
}

/**
 * Send quote request notification to artisan
 */
export async function sendQuoteRequestEmail(params: {
  to: string
  artisanName: string
  clientName: string
  serviceName: string
  description: string
  quoteId: string
}): Promise<EmailResult> {
  const { to, artisanName, clientName, serviceName, description, quoteId } = params

  const safeArtisanName = escapeHtml(artisanName)
  const safeClientName = escapeHtml(clientName)
  const safeServiceName = escapeHtml(serviceName)
  const safeDescription = escapeHtml(description)
  const safeQuoteId = escapeHtml(quoteId)
  const siteUrl = validateUrl(process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr')

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; margin: 0;">ServicesArtisans</h1>
  </div>

  <h2>Nouvelle demande de devis !</h2>

  <p>Bonjour ${safeArtisanName},</p>

  <p>Vous avez re&ccedil;u une nouvelle demande de devis de <strong>${safeClientName}</strong>.</p>

  <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <p style="margin: 0 0 10px 0;"><strong>Service demand&eacute; :</strong> ${safeServiceName}</p>
    <p style="margin: 0;"><strong>Description :</strong></p>
    <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${safeDescription}</p>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${siteUrl}/artisan/devis/${safeQuoteId}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
      R&eacute;pondre &agrave; la demande
    </a>
  </div>

  <p style="color: #666; font-size: 14px;">
    R&eacute;pondez rapidement pour augmenter vos chances de d&eacute;crocher ce projet !
  </p>

  ${emailFooterHtml()}
</body>
</html>
  `

  return sendEmail({
    to,
    subject: `Nouvelle demande de devis - ${serviceName}`,
    html,
    tags: [
      { name: 'type', value: 'quote_request' },
      { name: 'quote_id', value: quoteId },
    ],
  })
}

// ============================================
// ERROR HANDLING
// ============================================

function normalizeResendError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }

  const message = error instanceof Error ? error.message : String(error)

  // Check for specific error patterns
  if (message.includes('rate limit')) {
    return new APIError('Resend', 'Rate limit exceeded', {
      code: ErrorCode.API_RATE_LIMIT,
      statusCode: 429,
      retryable: true,
    })
  }

  if (message.includes('unauthorized') || message.includes('API key')) {
    return new APIError('Resend', 'Authentication failed', {
      code: ErrorCode.API_UNAUTHORIZED,
      statusCode: 401,
      retryable: false,
    })
  }

  if (message.includes('validation')) {
    return new ValidationError(message)
  }

  return new APIError('Resend', message, {
    code: ErrorCode.API_ERROR,
    retryable: true,
    originalError: error instanceof Error ? error : undefined,
  })
}
