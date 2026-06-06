/**
 * Resend Email API Client
 * Transactional email with retry and error handling
 * Documentation: https://resend.com/docs
 */

import { Resend } from 'resend'
import { retry } from '../utils/retry'
import { APIError, ErrorCode, AppError, ValidationError } from '../utils/errors'
import { apiLogger } from '@/lib/logger'

// XSS guard pour interpolation HTML dans templates email (F-4).
// Tout champ user/admin (name, providerName, rejectionReason, etc.) DOIT
// passer par esc() avant injection dans une string template.
function esc(s: unknown): string {
  if (s === null || s === undefined) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

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

// Default sender
const DEFAULT_FROM =
  process.env.RESEND_FROM_EMAIL || 'ServicesArtisans <noreply@servicesartisans.fr>'

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

  try {
    const resend = getResendClient()

    type ResendSendParams = Parameters<typeof resend.emails.send>[0]

    const result = await retry(
      async () => {
        const emailData = {
          from: params.from || DEFAULT_FROM,
          to: Array.isArray(params.to) ? params.to : [params.to],
          subject: params.subject,
          ...(params.html ? { html: params.html } : {}),
          ...(params.text ? { text: params.text } : {}),
          ...(params.replyTo ? { reply_to: params.replyTo } : {}),
          ...(params.cc ? { cc: Array.isArray(params.cc) ? params.cc : [params.cc] } : {}),
          ...(params.bcc ? { bcc: Array.isArray(params.bcc) ? params.bcc : [params.bcc] } : {}),
          ...(params.tags ? { tags: params.tags } : {}),
          ...(params.headers ? { headers: params.headers } : {}),
          ...(params.attachments?.length
            ? {
                attachments: params.attachments.map((a) => ({
                  filename: a.filename,
                  content: typeof a.content === 'string' ? Buffer.from(a.content) : a.content,
                })),
              }
            : {}),
        } as ResendSendParams

        const response = await resend.emails.send(emailData)

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

  try {
    const resend = getResendClient()

    type ResendBatchParams = Parameters<typeof resend.batch.send>[0]

    const batchParams = params.emails.map((email) => ({
      from: email.from || DEFAULT_FROM,
      to: Array.isArray(email.to) ? email.to : [email.to],
      subject: email.subject,
      ...(email.html ? { html: email.html } : {}),
      ...(email.text ? { text: email.text } : {}),
      ...(email.replyTo ? { reply_to: email.replyTo } : {}),
    })) as ResendBatchParams

    const response = await resend.batch.send(batchParams)

    if (response.error) {
      throw new APIError('Resend', response.error.message, {
        code: ErrorCode.API_ERROR,
        retryable: true,
      })
    }

    logger.info('Batch emails sent', {
      count: params.emails.length,
      duration: Date.now() - start,
    })

    return (response.data?.data || []).map((result: { id: string }, index: number) => ({
      id: result.id,
      from: params.emails[index].from || DEFAULT_FROM,
      to: Array.isArray(params.emails[index].to)
        ? (params.emails[index].to as string[])
        : [params.emails[index].to as string],
      createdAt: new Date(),
    }))
  } catch (error) {
    logger.error('Failed to send batch emails', error as Error, {
      count: params.emails.length,
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

  <h2>Bienvenue ${esc(name)} !</h2>

  <p>Nous sommes ravis de vous accueillir sur ServicesArtisans${isArtisan ? ', la plateforme qui connecte les artisans avec leurs clients' : ''}.</p>

  ${
    isArtisan
      ? `
  <p>Prochaines étapes pour démarrer :</p>
  <ul>
    <li>Complétez votre profil professionnel</li>
    <li>Ajoutez vos photos de réalisations</li>
    <li>Définissez votre zone d'intervention</li>
    <li>Configurez vos disponibilités</li>
  </ul>
  `
      : `
  <p>Vous pouvez maintenant :</p>
  <ul>
    <li>Rechercher des artisans qualifiés</li>
    <li>Demander des devis gratuits</li>
    <li>Prendre rendez-vous en ligne</li>
  </ul>
  `
  }

  <div style="text-align: center; margin: 30px 0;">
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}${isArtisan ? '/espace-artisan' : '/devis'}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
      ${isArtisan ? 'Accéder à mon compte' : 'Demander un devis'}
    </a>
  </div>

  <p style="color: #666; font-size: 14px;">
    Si vous avez des questions, n'hésitez pas à nous contacter à support@servicesartisans.fr
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px; text-align: center;">
    ServicesArtisans - La plateforme des artisans RGE certifiés
  </p>
</body>
</html>
  `

  return sendEmail({
    to,
    subject: `Bienvenue sur ServicesArtisans${isArtisan ? ' !' : ', ' + esc(name)}`,
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

  <h2>Réinitialisation de mot de passe</h2>

  <p>Bonjour ${esc(name)},</p>

  <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${esc(resetLink)}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
      Réinitialiser mon mot de passe
    </a>
  </div>

  <p style="color: #666; font-size: 14px;">
    Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px; text-align: center;">
    ServicesArtisans - La plateforme des artisans RGE certifiés
  </p>
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
 * Send claim email confirmation (Sprint 4 vague 4 — précondition auto-approve).
 * URL-safe token single-use, expire 7j. Lien public GET → flip email_confirmed_at.
 */
export async function sendClaimEmailConfirmation(params: {
  to: string
  name: string
  providerName: string
  confirmLink: string
}): Promise<EmailResult> {
  const { to, name, providerName, confirmLink } = params
  const greeting = name ? `Bonjour ${esc(name)}` : 'Bonjour'

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #f59e0b; margin: 0;">ServicesArtisans</h1>
  </div>

  <h2 style="color: #333;">${greeting},</h2>

  <p>Vous venez de demander la revendication de la fiche <strong>${esc(providerName)}</strong>.</p>

  <p>Confirmez votre adresse email pour qu'un administrateur puisse valider votre demande&nbsp;:</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${esc(confirmLink)}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
      Confirmer mon email
    </a>
  </div>

  <p style="color: #666; font-size: 14px;">
    Ce lien est valable 7 jours. Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px; text-align: center;">
    ServicesArtisans — La plateforme des artisans RGE certifiés<br>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'}" style="color: #999;">servicesartisans.fr</a>
  </p>
</body>
</html>
  `

  return sendEmail({
    to,
    subject: `Confirmez votre email pour la fiche "${providerName}"`,
    html,
    tags: [{ name: 'type', value: 'claim_email_confirm' }],
  })
}

/**
 * Send claim approved email (artisan sets password)
 */
export async function sendClaimApprovedEmail(params: {
  to: string
  name: string
  providerName: string
  passwordLink: string
}): Promise<EmailResult> {
  const { to, name, providerName, passwordLink } = params

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #f59e0b; margin: 0;">ServicesArtisans</h1>
  </div>

  <h2 style="color: #333;">Bonne nouvelle, ${esc(name)} !</h2>

  <p>Votre demande de revendication pour <strong>${esc(providerName)}</strong> a été approuvée par notre équipe.</p>

  <p>Votre fiche artisan est désormais active. Pour accéder à votre espace et gérer vos leads, définissez votre mot de passe :</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${esc(passwordLink)}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
      Définir mon mot de passe
    </a>
  </div>

  <p style="color: #666; font-size: 14px;">
    Ce lien est valable pendant 24 heures. Après ce délai, vous pourrez utiliser la fonction "Mot de passe oublié" pour en générer un nouveau.
  </p>

  <h3 style="color: #333; margin-top: 32px;">Vos 3 prochaines étapes</h3>
  <ol style="padding-left: 20px; color: #333;">
    <li style="margin-bottom: 10px;"><strong>Complétez votre fiche</strong> — bio, photos, certifications RGE/Qualibat. Plus c'est précis, plus vous attirez de devis qualifiés.</li>
    <li style="margin-bottom: 10px;"><strong>Vérifiez vos coordonnées</strong> — téléphone et email pro pour ne rater aucun lead. Les leads sont exclusifs : 1 lead = 1 artisan, jamais partagés.</li>
    <li style="margin-bottom: 10px;"><strong>Activez les notifications</strong> — SMS et email pour être alerté en moins de 5 min sur chaque devis dans votre zone.</li>
  </ol>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px; text-align: center;">
    ServicesArtisans - La plateforme des artisans RGE certifiés<br>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'}" style="color: #999;">servicesartisans.fr</a>
  </p>
</body>
</html>
  `

  return sendEmail({
    to,
    subject: `Votre fiche "${providerName}" a été validée - ServicesArtisans`,
    html,
    tags: [{ name: 'type', value: 'claim_approved' }],
  })
}

/**
 * Send claim rejected email — explique le motif + propose un retry path.
 * Funnel claim 2026-05-05 : avant, le rejet était silencieux côté artisan,
 * il ne savait pas qu'il pouvait corriger et resoumettre.
 */
export async function sendClaimRejectedEmail(params: {
  to: string
  name: string
  providerName: string
  rejectionReason: string | null
  retryLink: string
}): Promise<EmailResult> {
  const { to, name, providerName, rejectionReason, retryLink } = params
  const greeting = name ? `Bonjour ${esc(name)}` : 'Bonjour'
  const reasonBlock = rejectionReason
    ? `<div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
        <strong style="color: #92400e;">Motif du rejet :</strong><br>
        <span style="color: #78350f;">${esc(rejectionReason)}</span>
      </div>`
    : `<p style="color: #666;">Notre équipe n'a pas pu valider votre demande en l'état.</p>`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #f59e0b; margin: 0;">ServicesArtisans</h1>
  </div>

  <h2 style="color: #333;">${greeting},</h2>

  <p>Votre demande de revendication pour <strong>${esc(providerName)}</strong> n'a pas pu être validée.</p>

  ${reasonBlock}

  <p>Ce n'est pas définitif : vous pouvez resoumettre une nouvelle demande avec les informations corrigées (SIREN/SIRET vérifié, email pro, justificatifs si besoin).</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${esc(retryLink)}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
      Resoumettre ma demande
    </a>
  </div>

  <p style="color: #666; font-size: 14px;">
    Si vous avez un doute sur le motif ou un justificatif particulier (extrait Kbis, certification RGE), répondez à cet email — un membre de l'équipe vous accompagnera.
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px; text-align: center;">
    ServicesArtisans - La plateforme des artisans RGE certifiés<br>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'}" style="color: #999;">servicesartisans.fr</a>
  </p>
</body>
</html>
  `

  return sendEmail({
    to,
    subject: `Votre demande pour "${providerName}" - action nécessaire`,
    html,
    tags: [{ name: 'type', value: 'claim_rejected' }],
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

  <h2>Réservation confirmée !</h2>

  <p>Bonjour ${esc(clientName)},</p>

  <p>Votre rendez-vous avec <strong>${esc(artisanName)}</strong> est confirmé.</p>

  <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <p style="margin: 0 0 10px 0;"><strong>Service :</strong> ${esc(serviceName)}</p>
    <p style="margin: 0 0 10px 0;"><strong>Date :</strong> ${esc(date)}</p>
    <p style="margin: 0 0 10px 0;"><strong>Heure :</strong> ${esc(time)}</p>
    <p style="margin: 0;"><strong>Adresse :</strong> ${esc(address)}</p>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/reservations/${bookingId}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
      Voir ma réservation
    </a>
  </div>

  <p style="color: #666; font-size: 14px;">
    Besoin de modifier ou annuler ? Rendez-vous dans votre espace client.
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px; text-align: center;">
    ServicesArtisans - La plateforme des artisans RGE certifiés
  </p>
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

  <p>Bonjour ${esc(artisanName)},</p>

  <p>Vous avez reçu une nouvelle demande de devis de <strong>${esc(clientName)}</strong>.</p>

  <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <p style="margin: 0 0 10px 0;"><strong>Service demandé :</strong> ${esc(serviceName)}</p>
    <p style="margin: 0;"><strong>Description :</strong></p>
    <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${esc(description)}</p>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/espace-artisan/demandes" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
      Répondre à la demande
    </a>
  </div>

  <p style="color: #666; font-size: 14px;">
    Répondez rapidement pour augmenter vos chances de décrocher ce projet !
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px; text-align: center;">
    ServicesArtisans - La plateforme des artisans RGE certifiés
  </p>
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
