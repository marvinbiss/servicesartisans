/**
 * Templates d'emails de relance CEE — brique mandataire CEE.
 *
 * Fonctions pures : chaque template retourne `{ subject, html }` sans effet
 * de bord. Le caller (cron cee-relance) se charge de l'envoi via Resend.
 *
 * Règles :
 *   - Ton rassurant, jamais pressant ou menaçant
 *   - Français avec accents
 *   - Zéro PII dans le code (les données arrivent en paramètre)
 *   - Pas de lien direct vers le dossier (le client n'a pas forcément de compte)
 */

import { escapeHtml as esc } from './format'
import { SITE_URL } from '@/lib/seo/config'

const REPLY_EMAIL = 'contact@servicesartisans.fr'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emailWrapper(body: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; margin: 0;">ServicesArtisans</h1>
    <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">Prime CEE - Certificats d'Économies d'Énergie</p>
  </div>

  ${body}

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px; text-align: center;">
    ServicesArtisans — La plateforme des artisans RGE certifiés<br>
    <a href="${SITE_URL}" style="color: #999;">${SITE_URL.replace('https://', '')}</a>
  </p>
</body>
</html>`
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RelanceEmailOutput {
  subject: string
  html: string
}

// ---------------------------------------------------------------------------
// J+3 — Client uniquement
// ---------------------------------------------------------------------------

export function relanceJ3Client(clientName: string): RelanceEmailOutput {
  const prenom = esc(clientName.split(' ')[0] || clientName)

  return {
    subject: 'Votre prime CEE — prochaine étape pour en bénéficier',
    html: emailWrapper(`
      <h2 style="color: #333; font-size: 20px;">Bonjour ${prenom},</h2>

      <p>Vous avez récemment effectué une demande de travaux éligible à une <strong>prime CEE</strong> (Certificats d'Économies d'Énergie). C'est une aide financière à laquelle vous avez droit.</p>

      <p>Pour que votre dossier avance, votre artisan doit signer un engagement avant le début des travaux. C'est une étape simple mais indispensable.</p>

      <div style="background: #f0f9ff; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; font-weight: 500;">Que faire ?</p>
        <ul style="margin: 8px 0 0 0; padding-left: 20px;">
          <li>Contactez votre artisan pour lui rappeler de signer l'engagement CEE</li>
          <li>Ou répondez simplement à cet email : nous faciliterons la mise en relation</li>
        </ul>
      </div>

      <p style="color: #64748b; font-size: 14px;">Cette démarche est entièrement gratuite et vous permet de réduire le coût de vos travaux.</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="mailto:${REPLY_EMAIL}?subject=Dossier%20CEE%20-%20Besoin%20d%27aide" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
          Nous contacter
        </a>
      </div>
    `),
  }
}

// ---------------------------------------------------------------------------
// J+7 — Client
// ---------------------------------------------------------------------------

export function relanceJ7Client(clientName: string): RelanceEmailOutput {
  const prenom = esc(clientName.split(' ')[0] || clientName)

  return {
    subject: 'Rappel : votre prime CEE est toujours disponible',
    html: emailWrapper(`
      <h2 style="color: #333; font-size: 20px;">Bonjour ${prenom},</h2>

      <p>Nous vous avions contacté il y a quelques jours au sujet de votre <strong>prime CEE</strong>. Votre dossier est toujours en attente.</p>

      <p>Pour que vous puissiez bénéficier de cette aide, l'engagement doit être signé avant le début des travaux. Plus le dossier avance vite, plus vite vous recevrez votre prime.</p>

      <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0;">N'hésitez pas à nous contacter si vous avez la moindre question ou si vous rencontrez une difficulté avec votre artisan. Nous sommes là pour vous accompagner.</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="mailto:${REPLY_EMAIL}?subject=Dossier%20CEE%20-%20Rappel" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
          Nous contacter
        </a>
      </div>
    `),
  }
}

// ---------------------------------------------------------------------------
// J+7 — Artisan
// ---------------------------------------------------------------------------

export function relanceJ7Artisan(artisanName: string): RelanceEmailOutput {
  return {
    subject: 'Un dossier CEE vous attend — pensez à le consulter',
    html: emailWrapper(`
      <h2 style="color: #333; font-size: 20px;">Bonjour ${esc(artisanName)},</h2>

      <p>Un dossier CEE (Certificats d'Économies d'Énergie) lié à un de vos devis est en attente depuis plusieurs jours.</p>

      <p>Pour que votre client puisse bénéficier de sa prime et que le dossier avance, nous vous invitons à consulter votre espace artisan et à signer l'engagement CEE.</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${SITE_URL}/espace-artisan/cee" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
          Accéder à mon espace
        </a>
      </div>

      <p style="color: #64748b; font-size: 14px;">Si vous avez des questions sur le dispositif CEE, n'hésitez pas à nous écrire à <a href="mailto:${REPLY_EMAIL}" style="color: #2563eb;">${REPLY_EMAIL}</a>.</p>
    `),
  }
}

// ---------------------------------------------------------------------------
// J+14 — Client (dernier rappel)
// ---------------------------------------------------------------------------

export function relanceJ14Client(clientName: string): RelanceEmailOutput {
  const prenom = esc(clientName.split(' ')[0] || clientName)

  return {
    subject: 'Dernier rappel — votre prime CEE',
    html: emailWrapper(`
      <h2 style="color: #333; font-size: 20px;">Bonjour ${prenom},</h2>

      <p>Ceci est notre dernier rappel concernant votre dossier de <strong>prime CEE</strong>.</p>

      <p>Votre dossier est en attente depuis deux semaines. Sans action de votre part ou de celle de votre artisan, le dossier ne pourra malheureusement pas aboutir et la prime ne sera pas versée.</p>

      <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0;">Si vos travaux sont toujours prévus, contactez-nous dès que possible. Nous ferons le maximum pour débloquer la situation.</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="mailto:${REPLY_EMAIL}?subject=Dossier%20CEE%20-%20Dernier%20rappel" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
          Nous contacter
        </a>
      </div>

      <p style="color: #64748b; font-size: 14px;">Si vous avez changé d'avis ou si les travaux ne sont plus d'actualité, vous n'avez rien à faire. Ce sera notre dernier message sur ce sujet.</p>
    `),
  }
}

// ---------------------------------------------------------------------------
// J+14 — Artisan (dernier rappel)
// ---------------------------------------------------------------------------

export function relanceJ14Artisan(artisanName: string): RelanceEmailOutput {
  return {
    subject: 'Dernier rappel — dossier CEE en attente',
    html: emailWrapper(`
      <h2 style="color: #333; font-size: 20px;">Bonjour ${esc(artisanName)},</h2>

      <p>Un dossier CEE associé à l'un de vos devis est en attente depuis deux semaines. Sans action, ce dossier ne pourra pas aboutir et votre client ne bénéficiera pas de sa prime énergie.</p>

      <p>Nous vous invitons à vous connecter à votre espace pour consulter le dossier et effectuer les démarches nécessaires.</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${SITE_URL}/espace-artisan/cee" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
          Accéder à mon espace
        </a>
      </div>

      <p style="color: #64748b; font-size: 14px;">Ce sera notre dernier rappel. Pour toute question : <a href="mailto:${REPLY_EMAIL}" style="color: #2563eb;">${REPLY_EMAIL}</a>.</p>
    `),
  }
}
