import type { SupabaseClientType } from '@/types'
import { logger } from '@/lib/logger'
import { getResendClient } from '@/lib/api/resend-client'
import { escapeHtml } from '@/lib/utils/html'

// Lazy getter for Resend client
const getResend = () => getResendClient()

const FROM_EMAIL = process.env.FROM_EMAIL || 'ServicesArtisans <noreply@servicesartisans.fr>'
const SITE_NAME = 'ServicesArtisans'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'

const FOOTER_HTML = `
              <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                ServicesArtisans \u2014 La plateforme des artisans qualifi\u00e9s<br>
                contact@servicesartisans.fr<br>
                <a href="https://servicesartisans.fr/confidentialite" style="color: #999;">Politique de confidentialit\u00e9</a>
              </p>`

const FOOTER_TEXT = `
${SITE_NAME} \u2014 La plateforme des artisans qualifi\u00e9s
contact@servicesartisans.fr
Politique de confidentialit\u00e9 : https://servicesartisans.fr/confidentialite`

export interface BookingEmailData {
  bookingId: string
  clientName: string
  clientEmail: string
  clientPhone: string
  artisanName: string
  artisanEmail: string
  serviceName: string
  date: string
  startTime: string
  endTime: string
  message?: string
}

export interface ReminderEmailData {
  bookingId: string
  clientName: string
  clientEmail: string
  artisanName: string
  serviceName: string
  date: string
  startTime: string
  endTime: string
}

export interface CancellationEmailData {
  bookingId: string
  clientName: string
  clientEmail: string
  artisanName: string
  artisanEmail: string
  serviceName: string
  date: string
  startTime: string
  endTime: string
  cancelledBy: 'client' | 'artisan'
  reason?: string
}

export interface PaymentFailedEmailData {
  clientName: string
  clientEmail: string
  serviceName: string
  date: string
  amount?: string
}

// Email templates
const templates = {
  bookingConfirmationClient: (data: BookingEmailData) => {
    const safeClientName = escapeHtml(data.clientName)
    const safeArtisanName = escapeHtml(data.artisanName)
    const safeServiceName = escapeHtml(data.serviceName)
    const safeDate = escapeHtml(data.date)
    const safeStartTime = escapeHtml(data.startTime)
    const safeEndTime = escapeHtml(data.endTime)
    const safeBookingId = escapeHtml(data.bookingId)
    return {
      subject: `Confirmation de votre rendez-vous - ${data.serviceName}`,
      html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmation de r\u00e9servation</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Rendez-vous confirm\u00e9</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
                Bonjour <strong>${safeClientName}</strong>,
              </p>
              <p style="color: #666; font-size: 15px; line-height: 1.6;">
                Votre rendez-vous avec <strong>${safeArtisanName}</strong> a bien \u00e9t\u00e9 confirm\u00e9.
              </p>

              <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #2563eb;">
                <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 16px;">D\u00e9tails du rendez-vous</h3>
                <table style="width: 100%; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Service:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: 500;">${safeServiceName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Date:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: 500;">${safeDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Horaire:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: 500;">${safeStartTime} - ${safeEndTime}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Artisan:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: 500;">${safeArtisanName}</td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${SITE_URL}/booking/${safeBookingId}" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 500;">
                  G\u00e9rer ma r\u00e9servation
                </a>
              </div>

              <p style="color: #666; font-size: 14px; line-height: 1.6;">
                Besoin de modifier ou annuler votre rendez-vous ? Utilisez le lien ci-dessus ou contactez directement l'artisan.
              </p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
              ${FOOTER_HTML}
            </div>
          </div>
        </body>
      </html>
    `,
      text: `Bonjour ${data.clientName},

Votre rendez-vous avec ${data.artisanName} a bien \u00e9t\u00e9 confirm\u00e9.

D\u00c9TAILS DU RENDEZ-VOUS
Service: ${data.serviceName}
Date: ${data.date}
Horaire: ${data.startTime} - ${data.endTime}
Artisan: ${data.artisanName}

G\u00e9rer votre r\u00e9servation: ${SITE_URL}/booking/${data.bookingId}

Besoin de modifier ou annuler ? Utilisez le lien ci-dessus ou contactez directement l'artisan.
${FOOTER_TEXT}`,
    }
  },

  bookingNotificationArtisan: (data: BookingEmailData) => {
    const safeArtisanName = escapeHtml(data.artisanName)
    const safeClientName = escapeHtml(data.clientName)
    const safeClientPhone = escapeHtml(data.clientPhone)
    const safeClientEmail = escapeHtml(data.clientEmail)
    const safeServiceName = escapeHtml(data.serviceName)
    const safeDate = escapeHtml(data.date)
    const safeStartTime = escapeHtml(data.startTime)
    const safeEndTime = escapeHtml(data.endTime)
    const safeMessage = data.message ? escapeHtml(data.message) : ''
    return {
      subject: `Nouvelle r\u00e9servation - ${data.clientName}`,
      html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Nouvelle r\u00e9servation</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
                Bonjour <strong>${safeArtisanName}</strong>,
              </p>
              <p style="color: #666; font-size: 15px; line-height: 1.6;">
                Vous avez re\u00e7u une nouvelle r\u00e9servation de la part de <strong>${safeClientName}</strong>.
              </p>

              <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #059669;">
                <h3 style="margin: 0 0 15px 0; color: #047857; font-size: 16px;">D\u00e9tails du rendez-vous</h3>
                <table style="width: 100%; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Client:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: 500;">${safeClientName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">T\u00e9l\u00e9phone:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: 500;">${safeClientPhone}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Email:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: 500;">${safeClientEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Service:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: 500;">${safeServiceName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Date:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: 500;">${safeDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Horaire:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: 500;">${safeStartTime} - ${safeEndTime}</td>
                  </tr>
                </table>
                ${data.message ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #d1fae5;">
                  <p style="color: #666; font-size: 13px; margin: 0 0 5px 0;">Message du client:</p>
                  <p style="color: #333; font-size: 14px; margin: 0; font-style: italic;">"${safeMessage}"</p>
                </div>
                ` : ''}
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${SITE_URL}/espace-artisan/calendrier" style="display: inline-block; background: #059669; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 500;">
                  Voir mon calendrier
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
              ${FOOTER_HTML}
            </div>
          </div>
        </body>
      </html>
    `,
      text: `Bonjour ${data.artisanName},

Vous avez re\u00e7u une nouvelle r\u00e9servation.

D\u00c9TAILS DU RENDEZ-VOUS
Client: ${data.clientName}
T\u00e9l\u00e9phone: ${data.clientPhone}
Email: ${data.clientEmail}
Service: ${data.serviceName}
Date: ${data.date}
Horaire: ${data.startTime} - ${data.endTime}
${data.message ? `Message: ${data.message}` : ''}

Voir votre calendrier: ${SITE_URL}/espace-artisan/calendrier
${FOOTER_TEXT}`,
    }
  },

  reminderClient: (data: ReminderEmailData) => {
    const safeClientName = escapeHtml(data.clientName)
    const safeArtisanName = escapeHtml(data.artisanName)
    const safeServiceName = escapeHtml(data.serviceName)
    const safeDate = escapeHtml(data.date)
    const safeStartTime = escapeHtml(data.startTime)
    const safeEndTime = escapeHtml(data.endTime)
    const safeBookingId = escapeHtml(data.bookingId)
    return {
      subject: `Rappel: Votre RDV demain avec ${data.artisanName}`,
      html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Rappel de rendez-vous</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
                Bonjour <strong>${safeClientName}</strong>,
              </p>
              <p style="color: #666; font-size: 15px; line-height: 1.6;">
                Nous vous rappelons votre rendez-vous pr\u00e9vu <strong>demain</strong> avec <strong>${safeArtisanName}</strong>.
              </p>

              <div style="background: #fffbeb; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #f59e0b;">
                <table style="width: 100%; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Service:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: 500;">${safeServiceName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Date:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: 500;">${safeDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Horaire:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: 500;">${safeStartTime} - ${safeEndTime}</td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${SITE_URL}/booking/${safeBookingId}" style="display: inline-block; background: #f59e0b; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 500;">
                  G\u00e9rer ma r\u00e9servation
                </a>
              </div>

              <p style="color: #666; font-size: 14px; line-height: 1.6;">
                Si vous ne pouvez plus honorer ce rendez-vous, merci de l'annuler le plus t\u00f4t possible.
              </p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
              ${FOOTER_HTML}
            </div>
          </div>
        </body>
      </html>
    `,
      text: `Bonjour ${data.clientName},

Rappel: Vous avez un rendez-vous DEMAIN avec ${data.artisanName}.

Service: ${data.serviceName}
Date: ${data.date}
Horaire: ${data.startTime} - ${data.endTime}

G\u00e9rer votre r\u00e9servation: ${SITE_URL}/booking/${data.bookingId}

Si vous ne pouvez plus honorer ce rendez-vous, merci de l'annuler le plus t\u00f4t possible.
${FOOTER_TEXT}`,
    }
  },

  cancellationNotification: (data: CancellationEmailData) => {
    const safeServiceName = escapeHtml(data.serviceName)
    const safeDate = escapeHtml(data.date)
    const safeStartTime = escapeHtml(data.startTime)
    const safeEndTime = escapeHtml(data.endTime)
    const safeReason = data.reason ? escapeHtml(data.reason) : ''
    return {
      subject: `Annulation de rendez-vous - ${data.date}`,
      html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Rendez-vous annul\u00e9</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
                Bonjour,
              </p>
              <p style="color: #666; font-size: 15px; line-height: 1.6;">
                Le rendez-vous pr\u00e9vu le <strong>${safeDate}</strong> a \u00e9t\u00e9 annul\u00e9 par ${data.cancelledBy === 'client' ? 'le client' : 'l\'artisan'}.
              </p>

              <div style="background: #fef2f2; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #dc2626;">
                <h3 style="margin: 0 0 15px 0; color: #b91c1c; font-size: 16px;">D\u00e9tails de l'annulation</h3>
                <table style="width: 100%; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Service:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: 500;">${safeServiceName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Date pr\u00e9vue:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: 500;">${safeDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Horaire:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: 500;">${safeStartTime} - ${safeEndTime}</td>
                  </tr>
                  ${data.reason ? `
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Raison:</td>
                    <td style="padding: 8px 0; color: #333;">${safeReason}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
              ${FOOTER_HTML}
            </div>
          </div>
        </body>
      </html>
    `,
      text: `Le rendez-vous pr\u00e9vu le ${data.date} a \u00e9t\u00e9 annul\u00e9 par ${data.cancelledBy === 'client' ? 'le client' : 'l\'artisan'}.

Service: ${data.serviceName}
Date pr\u00e9vue: ${data.date}
Horaire: ${data.startTime} - ${data.endTime}
${data.reason ? `Raison: ${data.reason}` : ''}
${FOOTER_TEXT}`,
    }
  },

  paymentFailed: (data: PaymentFailedEmailData) => {
    const safeClientName = escapeHtml(data.clientName)
    const safeServiceName = escapeHtml(data.serviceName)
    const safeDate = escapeHtml(data.date)
    const safeAmount = data.amount ? escapeHtml(data.amount) : ''
    return {
      subject: `Action requise: \u00c9chec de paiement - ${SITE_NAME}`,
      html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">\u00c9chec de paiement</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
                Bonjour <strong>${safeClientName}</strong>,
              </p>
              <p style="color: #666; font-size: 15px; line-height: 1.6;">
                Nous n'avons pas pu traiter votre paiement pour votre abonnement ${SITE_NAME}.
              </p>

              <div style="background: #fef2f2; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #dc2626;">
                <h3 style="margin: 0 0 15px 0; color: #b91c1c; font-size: 16px;">D\u00e9tails</h3>
                <table style="width: 100%; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Service:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: 500;">${safeServiceName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Date:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: 500;">${safeDate}</td>
                  </tr>
                  ${data.amount ? `
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Montant:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: 500;">${safeAmount}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              <p style="color: #666; font-size: 15px; line-height: 1.6;">
                Veuillez mettre \u00e0 jour vos informations de paiement pour continuer \u00e0 b\u00e9n\u00e9ficier de votre abonnement.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${SITE_URL}/espace-artisan/parametres/facturation" style="display: inline-block; background: #3366FF; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 500;">
                  Mettre \u00e0 jour le paiement
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
              ${FOOTER_HTML}
            </div>
          </div>
        </body>
      </html>
    `,
      text: `Bonjour ${data.clientName},

Nous n'avons pas pu traiter votre paiement pour votre abonnement ${SITE_NAME}.

Service: ${data.serviceName}
Date: ${data.date}
${data.amount ? `Montant: ${data.amount}` : ''}

Veuillez mettre \u00e0 jour vos informations de paiement pour continuer \u00e0 b\u00e9n\u00e9ficier de votre abonnement.

Mettre \u00e0 jour: ${SITE_URL}/espace-artisan/parametres/facturation
${FOOTER_TEXT}`,
    }
  },
}

// Send email function
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
      headers: {
        'List-Unsubscribe': '<mailto:unsubscribe@servicesartisans.fr>'
      },
    })

    if (error) {
      logger.error('Email send error', error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (err) {
    logger.error('Email error', err as Error)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// High-level email functions
export async function sendBookingConfirmation(data: BookingEmailData) {
  const clientEmail = templates.bookingConfirmationClient(data)
  const artisanEmail = templates.bookingNotificationArtisan(data)

  const results = await Promise.all([
    sendEmail({ to: data.clientEmail, ...clientEmail }),
    sendEmail({ to: data.artisanEmail, ...artisanEmail }),
  ])

  return {
    clientNotification: results[0],
    artisanNotification: results[1],
  }
}

export async function sendBookingReminder(data: ReminderEmailData) {
  const reminder = templates.reminderClient(data)
  return sendEmail({ to: data.clientEmail, ...reminder })
}

export async function sendCancellationNotification(data: CancellationEmailData) {
  const notification = templates.cancellationNotification(data)

  // Send to both client and artisan
  const results = await Promise.all([
    sendEmail({ to: data.clientEmail, ...notification }),
    sendEmail({ to: data.artisanEmail, ...notification }),
  ])

  return {
    clientNotification: results[0],
    artisanNotification: results[1],
  }
}

// Send payment failed email
export async function sendPaymentFailedEmail(data: PaymentFailedEmailData) {
  const email = templates.paymentFailed(data)
  return sendEmail({ to: data.clientEmail, ...email })
}

// Simplified cancellation email (for unified notification service)
export async function sendCancellationEmail(data: {
  bookingId: string
  clientName: string
  clientEmail: string
  artisanName: string
  serviceName: string
  date: string
  startTime: string
  cancellationReason?: string
}) {
  const notification = templates.cancellationNotification({
    bookingId: data.bookingId,
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    artisanName: data.artisanName,
    artisanEmail: '', // Not needed for client notification
    serviceName: data.serviceName,
    date: data.date,
    startTime: data.startTime,
    endTime: '',
    cancelledBy: 'client',
    reason: data.cancellationReason,
  })

  return sendEmail({ to: data.clientEmail, ...notification })
}

// Log notification to database
export async function logNotification(
  supabase: SupabaseClientType,
  {
    bookingId,
    type,
    status,
    recipientEmail,
    errorMessage,
  }: {
    bookingId: string
    type: 'confirmation' | 'reminder' | 'cancellation' | 'reschedule'
    status: 'sent' | 'failed'
    recipientEmail: string
    errorMessage?: string
  }
) {
  const { error } = await supabase.from('notification_logs').insert({
    booking_id: bookingId,
    type,
    status,
    recipient_email: recipientEmail,
    error_message: errorMessage,
    sent_at: new Date().toISOString(),
  })

  if (error) {
    logger.error('Failed to log notification', error)
  }
}
