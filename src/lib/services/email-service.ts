/**
 * Email Service
 * Centralized email sending with templates
 */

import { isEmailSuppressed } from '@/lib/email/suppression'
import { escapeHtml } from '@/lib/utils/html'

export interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

export interface EmailOptions {
  to: string | string[]
  template: EmailTemplate
  from?: string
}

const DEFAULT_FROM = 'ServicesArtisans <noreply@servicesartisans.fr>'

/**
 * Send an email using Resend API
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    console.log('[Email Service] No RESEND_API_KEY configured')
    console.log('[Email Service] Would send to:', options.to)
    console.log('[Email Service] Subject:', options.template.subject)
    return { success: true, id: 'dev-mode' }
  }

  // Check suppression list before sending (bounced/complained/unsubscribed)
  const recipients = Array.isArray(options.to) ? options.to : [options.to]
  for (const recipient of recipients) {
    if (await isEmailSuppressed(recipient)) {
      console.log('[Email Service] Email suppressed (bounce/complaint/unsubscribe):', recipient)
      return { success: true, id: 'suppressed' }
    }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: options.from || DEFAULT_FROM,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.template.subject,
        html: options.template.html,
        text: options.template.text,
        headers: {
          'List-Unsubscribe': '<mailto:unsubscribe@servicesartisans.fr>'
        }
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email')
    }

    return { success: true, id: data.id }
  } catch (error) {
    console.error('[Email Service] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Email Templates
 */
export const emailTemplates = {
  // Welcome email for new users
  welcome: (name: string): EmailTemplate => {
    const safeName = escapeHtml(name)
    return {
      subject: 'Bienvenue sur ServicesArtisans !',
      html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px; color: white;">Bienvenue ${safeName} !</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
              <p style="color: #333; font-size: 15px; line-height: 1.6;">Nous sommes ravis de vous accueillir sur ServicesArtisans.</p>
              <p style="color: #333; font-size: 15px; line-height: 1.6;">Vous pouvez maintenant :</p>
              <ul style="color: #333; font-size: 15px; line-height: 1.8;">
                <li>Rechercher des artisans qualifi\u00e9s pr\u00e8s de chez vous</li>
                <li>Comparer les avis et les tarifs</li>
                <li>Demander des devis gratuits</li>
                <li>R\u00e9server directement en ligne</li>
              </ul>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/recherche" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                  Trouver un artisan
                </a>
              </div>
            </div>
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
              ServicesArtisans \u2014 La plateforme des artisans qualifi\u00e9s<br>
              contact@servicesartisans.fr
            </p>
          </div>
        </body>
      </html>
    `,
      text: `Bienvenue ${name} !

Nous sommes ravis de vous accueillir sur ServicesArtisans.

Vous pouvez maintenant :
- Rechercher des artisans qualifi\u00e9s pr\u00e8s de chez vous
- Comparer les avis et les tarifs
- Demander des devis gratuits
- R\u00e9server directement en ligne

Trouver un artisan : ${process.env.NEXT_PUBLIC_APP_URL}/recherche

ServicesArtisans \u2014 La plateforme des artisans qualifi\u00e9s
contact@servicesartisans.fr`
    }
  },

  // Welcome email for new artisans
  welcomeArtisan: (name: string): EmailTemplate => {
    const safeName = escapeHtml(name)
    return {
      subject: 'Bienvenue sur ServicesArtisans - Votre espace artisan est pr\u00eat !',
      html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px; color: white;">Bienvenue ${safeName} !</h1>
              <p style="margin: 10px 0 0 0; color: white; font-size: 15px;">Votre espace artisan est pr\u00eat</p>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
              <p style="color: #333; font-size: 15px; line-height: 1.6;">F\u00e9licitations ! Vous faites maintenant partie de la communaut\u00e9 ServicesArtisans.</p>

              <h3 style="color: #333; font-size: 16px; margin: 20px 0 15px 0;">Prochaines \u00e9tapes :</h3>

              <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                <span style="display: inline-block; width: 30px; height: 30px; background: #059669; color: white; text-align: center; line-height: 30px; border-radius: 50%; margin-right: 10px; font-weight: bold;">1</span>
                <strong style="color: #333;">Compl\u00e9tez votre profil</strong>
                <p style="margin-left: 40px; color: #666; font-size: 14px;">Ajoutez vos sp\u00e9cialit\u00e9s, photos et tarifs</p>
              </div>

              <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                <span style="display: inline-block; width: 30px; height: 30px; background: #059669; color: white; text-align: center; line-height: 30px; border-radius: 50%; margin-right: 10px; font-weight: bold;">2</span>
                <strong style="color: #333;">Ajoutez votre portfolio</strong>
                <p style="margin-left: 40px; color: #666; font-size: 14px;">Montrez vos r\u00e9alisations avec des photos avant/apr\u00e8s</p>
              </div>

              <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                <span style="display: inline-block; width: 30px; height: 30px; background: #059669; color: white; text-align: center; line-height: 30px; border-radius: 50%; margin-right: 10px; font-weight: bold;">3</span>
                <strong style="color: #333;">Configurez votre calendrier</strong>
                <p style="margin-left: 40px; color: #666; font-size: 14px;">D\u00e9finissez vos disponibilit\u00e9s pour recevoir des demandes</p>
              </div>

              <div style="text-align: center; margin: 20px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/espace-artisan" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                  Acc\u00e9der \u00e0 mon espace
                </a>
              </div>
            </div>
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
              ServicesArtisans \u2014 La plateforme des artisans qualifi\u00e9s<br>
              contact@servicesartisans.fr
            </p>
          </div>
        </body>
      </html>
    `,
      text: `Bienvenue ${name} !

Votre espace artisan est pr\u00eat.

F\u00e9licitations ! Vous faites maintenant partie de la communaut\u00e9 ServicesArtisans.

Prochaines \u00e9tapes :
1. Compl\u00e9tez votre profil - Ajoutez vos sp\u00e9cialit\u00e9s, photos et tarifs
2. Ajoutez votre portfolio - Montrez vos r\u00e9alisations avec des photos avant/apr\u00e8s
3. Configurez votre calendrier - D\u00e9finissez vos disponibilit\u00e9s pour recevoir des demandes

Acc\u00e9der \u00e0 mon espace : ${process.env.NEXT_PUBLIC_APP_URL}/espace-artisan

ServicesArtisans \u2014 La plateforme des artisans qualifi\u00e9s
contact@servicesartisans.fr`
    }
  },

  // New booking notification
  newBooking: (artisanName: string, clientName: string, service: string, date: string): EmailTemplate => {
    const safeArtisanName = escapeHtml(artisanName)
    const safeClientName = escapeHtml(clientName)
    const safeService = escapeHtml(service)
    const safeDate = escapeHtml(date)
    return {
      subject: `Nouvelle r\u00e9servation de ${clientName}`,
      html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px; color: white;">Nouvelle r\u00e9servation !</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
              <p style="color: #333; font-size: 15px; line-height: 1.6;">Bonjour ${safeArtisanName},</p>
              <p style="color: #666; font-size: 15px; line-height: 1.6;">Vous avez re\u00e7u une nouvelle demande de r\u00e9servation.</p>

              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; color: #333; font-size: 14px;"><strong>Client :</strong> ${safeClientName}</p>
                <p style="margin: 0 0 10px 0; color: #333; font-size: 14px;"><strong>Service :</strong> ${safeService}</p>
                <p style="margin: 0; color: #333; font-size: 14px;"><strong>Date souhait\u00e9e :</strong> ${safeDate}</p>
              </div>

              <p style="color: #666; font-size: 15px; line-height: 1.6;">R\u00e9pondez rapidement pour augmenter vos chances de conversion !</p>

              <div style="text-align: center; margin: 20px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/espace-artisan/demandes" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                  Voir la demande
                </a>
              </div>
            </div>
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
              ServicesArtisans \u2014 La plateforme des artisans qualifi\u00e9s<br>
              contact@servicesartisans.fr
            </p>
          </div>
        </body>
      </html>
    `,
      text: `Bonjour ${artisanName},

Vous avez re\u00e7u une nouvelle demande de r\u00e9servation.

Client : ${clientName}
Service : ${service}
Date souhait\u00e9e : ${date}

R\u00e9pondez rapidement pour augmenter vos chances de conversion !

Voir la demande : ${process.env.NEXT_PUBLIC_APP_URL}/espace-artisan/demandes

ServicesArtisans \u2014 La plateforme des artisans qualifi\u00e9s
contact@servicesartisans.fr`
    }
  },

  // Review request
  reviewRequest: (clientName: string, artisanName: string, bookingId: string): EmailTemplate => {
    const safeClientName = escapeHtml(clientName)
    const safeArtisanName = escapeHtml(artisanName)
    const safeBookingId = escapeHtml(bookingId)
    return {
      subject: `Donnez votre avis sur ${artisanName}`,
      html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px; color: white;">Comment s'est pass\u00e9e votre intervention ?</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
              <p style="color: #333; font-size: 15px; line-height: 1.6;">Bonjour ${safeClientName},</p>
              <p style="color: #666; font-size: 15px; line-height: 1.6;">Votre intervention avec <strong>${safeArtisanName}</strong> est termin\u00e9e.</p>
              <p style="color: #666; font-size: 15px; line-height: 1.6;">Prenez 2 minutes pour laisser un avis et aider d'autres clients \u00e0 choisir.</p>

              <p style="font-size: 32px; text-align: center; margin: 20px 0;">&#11088;&#11088;&#11088;&#11088;&#11088;</p>

              <div style="text-align: center; margin: 20px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/avis/${safeBookingId}" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                  Donner mon avis
                </a>
              </div>

              <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
                Votre avis est important pour la communaut\u00e9 et aide les artisans \u00e0 am\u00e9liorer leurs services.
              </p>
            </div>
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
              ServicesArtisans \u2014 La plateforme des artisans qualifi\u00e9s<br>
              contact@servicesartisans.fr
            </p>
          </div>
        </body>
      </html>
    `,
      text: `Bonjour ${clientName},

Votre intervention avec ${artisanName} est termin\u00e9e.

Prenez 2 minutes pour laisser un avis et aider d'autres clients \u00e0 choisir.

Donner mon avis : ${process.env.NEXT_PUBLIC_APP_URL}/avis/${bookingId}

Votre avis est important pour la communaut\u00e9 et aide les artisans \u00e0 am\u00e9liorer leurs services.

ServicesArtisans \u2014 La plateforme des artisans qualifi\u00e9s
contact@servicesartisans.fr`
    }
  },

  // Password reset
  passwordReset: (name: string, resetLink: string): EmailTemplate => {
    const safeName = escapeHtml(name)
    return {
      subject: 'R\u00e9initialisation de votre mot de passe',
      html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px; color: white;">R\u00e9initialisation du mot de passe</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
              <p style="color: #333; font-size: 15px; line-height: 1.6;">Bonjour ${safeName},</p>
              <p style="color: #666; font-size: 15px; line-height: 1.6;">Vous avez demand\u00e9 \u00e0 r\u00e9initialiser votre mot de passe.</p>
              <p style="color: #666; font-size: 15px; line-height: 1.6;">Cliquez sur le bouton ci-dessous pour cr\u00e9er un nouveau mot de passe :</p>

              <div style="text-align: center; margin: 20px 0;">
                <a href="${resetLink}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                  R\u00e9initialiser mon mot de passe
                </a>
              </div>

              <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
                Ce lien expire dans 1 heure. Si vous n'avez pas demand\u00e9 cette r\u00e9initialisation, ignorez cet email.
              </p>
            </div>
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
              ServicesArtisans \u2014 La plateforme des artisans qualifi\u00e9s<br>
              contact@servicesartisans.fr
            </p>
          </div>
        </body>
      </html>
    `,
      text: `Bonjour ${name},

Vous avez demand\u00e9 \u00e0 r\u00e9initialiser votre mot de passe.

Cliquez sur le lien ci-dessous pour cr\u00e9er un nouveau mot de passe :
${resetLink}

Ce lien expire dans 1 heure. Si vous n'avez pas demand\u00e9 cette r\u00e9initialisation, ignorez cet email.

ServicesArtisans \u2014 La plateforme des artisans qualifi\u00e9s
contact@servicesartisans.fr`
    }
  }
}

export default {
  sendEmail,
  emailTemplates
}
