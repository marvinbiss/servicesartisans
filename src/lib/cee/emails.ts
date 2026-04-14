/**
 * Emails CEE — notifications client liées au pipeline mandataire CEE.
 *
 * Design
 * ------
 * - **Fail-OPEN** : l'envoi d'email ne doit JAMAIS bloquer le dispatch CEE.
 *   Le caller (`dispatcher-integration.ts`) catch toute erreur et log un warn.
 * - **Zéro PII dans les logs** : on ne log que le résultat (succès/échec),
 *   jamais l'email ni le nom du client.
 * - **Contenu en français** avec accents — langue du site.
 * - **Pas de promesse de montant exact** : toujours "estimée", "indicatif".
 */

import { sendEmail } from '@/lib/api/resend-client'
import { logger } from '@/lib/logger'
import { escapeHtml as esc, formatEurosRaw as formatEuros } from './format'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CeeEligibilityEmailParams {
  clientName: string
  clientEmail: string
  serviceName: string
  ville: string
  operationCode: string
  operationName: string
  primeEstimateMin: number | null
  primeEstimateMax: number | null
  justificatifs: Array<{ code: string; label: string; obligatoire: boolean }>
}

// ---------------------------------------------------------------------------
// Email HTML builder
// ---------------------------------------------------------------------------

function buildCeeEligibilityHtml(params: CeeEligibilityEmailParams): string {
  const {
    clientName,
    serviceName,
    ville,
    operationCode,
    operationName,
    primeEstimateMin,
    primeEstimateMax,
    justificatifs,
  } = params

  const hasPrime =
    primeEstimateMin !== null &&
    primeEstimateMax !== null &&
    (primeEstimateMin > 0 || primeEstimateMax > 0)

  const obligatoires = justificatifs.filter((j) => j.obligatoire)

  const primeSection = hasPrime
    ? `
    <div style="background-color: #ecfdf5; border-left: 4px solid #059669; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; font-size: 16px; color: #065f46; font-weight: 600;">
        Prime estim\u00e9e : entre ${formatEuros(primeEstimateMin ?? 0)} \u20ac et ${formatEuros(primeEstimateMax ?? 0)} \u20ac
      </p>
      <p style="margin: 8px 0 0 0; font-size: 13px; color: #047857;">
        Montant indicatif, le montant final d\u00e9pend des caract\u00e9ristiques pr\u00e9cises de vos travaux.
      </p>
    </div>`
    : ''

  const justificatifsSection =
    obligatoires.length > 0
      ? `
    <div style="margin: 24px 0;">
      <h3 style="color: #059669; font-size: 16px; margin: 0 0 12px 0; font-family: system-ui, -apple-system, sans-serif;">
        Pi\u00e8ces \u00e0 pr\u00e9parer
      </h3>
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px 20px;">
        ${obligatoires
          .map(
            (j) => `
        <p style="margin: 8px 0; font-size: 14px; color: #374151;">
          \u2610 ${esc(j.label)}
        </p>`
          )
          .join('')}
      </div>
    </div>`
      : ''

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff;">
  <div style="padding: 32px 24px;">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #059669; margin: 0; font-size: 24px; font-family: system-ui, -apple-system, sans-serif;">ServicesArtisans</h1>
      <div style="display: inline-block; background-color: #ecfdf5; color: #065f46; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 12px; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
        \u00c9ligible CEE
      </div>
    </div>

    <!-- Body -->
    <p style="font-size: 16px; margin: 0 0 16px 0;">Bonjour ${esc(clientName)},</p>

    <p style="font-size: 15px; margin: 0 0 16px 0;">
      Votre demande de devis pour <strong>${esc(serviceName)}</strong>${ville ? ` \u00e0 <strong>${esc(ville)}</strong>` : ''} est \u00e9ligible au dispositif des <strong>Certificats d\u2019\u00c9conomies d\u2019\u00c9nergie (CEE)</strong>.
    </p>

    ${primeSection}

    <!-- Opération CEE -->
    <div style="background-color: #f9fafb; border-radius: 8px; padding: 12px 16px; margin: 24px 0;">
      <p style="margin: 0; font-size: 13px; color: #6b7280;">Op\u00e9ration CEE</p>
      <p style="margin: 4px 0 0 0; font-size: 15px; color: #1f2937; font-weight: 600;">
        ${esc(operationCode)} \u2014 ${esc(operationName)}
      </p>
    </div>

    ${justificatifsSection}

    <!-- Réassurance -->
    <div style="background-color: #f0fdf4; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
      <p style="margin: 0; font-size: 15px; color: #166534;">
        Notre \u00e9quipe et votre artisan RGE vous accompagnent \u00e0 chaque \u00e9tape. Aucune d\u00e9marche suppl\u00e9mentaire n\u2019est n\u00e9cessaire de votre part, nous nous occupons de tout.
      </p>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin: 24px 0 0 0;">
      Cordialement,<br>
      L\u2019\u00e9quipe ServicesArtisans
    </p>

    <!-- Footer -->
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0 16px 0;">
    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
      ServicesArtisans \u2014 Plateforme de mise en relation artisans certifi\u00e9s RGE<br>
      <a href="https://servicesartisans.fr" style="color: #9ca3af;">servicesartisans.fr</a>
    </p>

  </div>
</body>
</html>`
}

// ---------------------------------------------------------------------------
// API publique
// ---------------------------------------------------------------------------

/**
 * Envoie un email informant le client que ses travaux sont éligibles CEE.
 *
 * Peut throw — le caller DOIT wrapper dans un `.catch()` pour respecter
 * le contrat fail-open du pipeline CEE.
 */
export async function sendCeeEligibilityEmail(params: CeeEligibilityEmailParams): Promise<void> {
  const html = buildCeeEligibilityHtml(params)

  await sendEmail({
    to: params.clientEmail,
    subject: 'Bonne nouvelle\u00a0: vos travaux sont \u00e9ligibles \u00e0 une prime CEE',
    html,
    from: process.env.RESEND_FROM_EMAIL || 'ServicesArtisans <noreply@servicesartisans.fr>',
    tags: [
      { name: 'type', value: 'cee_eligibility' },
      { name: 'operation_code', value: params.operationCode },
    ],
  })

  logger.info('cee-email: email éligibilité CEE envoyé', {
    action: 'cee-email-eligibility',
    operationCode: params.operationCode,
  })
}

// ---------------------------------------------------------------------------
// PR2 — Activation partenaire CEE (invite / certification / activation)
// ---------------------------------------------------------------------------

export interface CeePartnerInviteEmailParams {
  to: string
  artisanName: string
  invitationUrl: string
}

export interface CeeCertificationEmailParams {
  to: string
  artisanName: string
  score: number
  certificatePdfUrl: string | null
}

export interface CeePartnerActivatedEmailParams {
  to: string
  artisanName: string
  dashboardUrl: string
}

// ---------------------------------------------------------------------------
// Invite (onboarding CTA)
// ---------------------------------------------------------------------------

function buildCeePartnerInviteHtml(params: CeePartnerInviteEmailParams): string {
  const { artisanName, invitationUrl } = params
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff;">
  <div style="padding: 32px 24px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #059669; margin: 0; font-size: 24px;">ServicesArtisans</h1>
      <div style="display: inline-block; background-color: #ecfdf5; color: #065f46; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 12px; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
        Invitation partenaire CEE
      </div>
    </div>

    <p style="font-size: 16px; margin: 0 0 16px 0;">Bonjour ${esc(artisanName)},</p>

    <p style="font-size: 15px; margin: 0 0 16px 0;">
      Vous \u00eates invit\u00e9 \u00e0 rejoindre le r\u00e9seau d\u2019artisans partenaires de <strong>SA Energy</strong>, mandataire CEE. Notre \u00e9quipe d\u00e9pose pour vous les dossiers CEE et vous reverse la prime apr\u00e8s validation PNCEE.
    </p>

    <div style="background-color: #f0fdf4; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #166534; font-weight: 600;">Parcours d\u2019activation (environ 30 minutes)</p>
      <ol style="margin: 0; padding-left: 20px; font-size: 14px; color: #166534;">
        <li>Renseigner votre IBAN (chiffr\u00e9)</li>
        <li>Signer la convention \u00e9lectroniquement (Yousign)</li>
        <li>Suivre la formation et r\u00e9ussir le quiz (8/10 min.)</li>
        <li>D\u00e9marrer les dossiers CEE</li>
      </ol>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${esc(invitationUrl)}" style="display: inline-block; background: #059669; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        D\u00e9marrer mon activation
      </a>
    </div>

    <p style="color: #6b7280; font-size: 13px; margin: 16px 0 0 0;">
      Ce lien expire dans 7 jours. Pour toute question : <a href="mailto:partenaires@servicesartisans.fr" style="color: #059669;">partenaires@servicesartisans.fr</a>.
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0 16px 0;">
    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
      ServicesArtisans \u2014 SA Energy, mandataire CEE<br>
      <a href="https://servicesartisans.fr" style="color: #9ca3af;">servicesartisans.fr</a>
    </p>
  </div>
</body>
</html>`
}

/**
 * Envoie un email d'invitation partenaire CEE (onboarding).
 * Fail-open : retourne `{ success: false }` sur erreur, log warn.
 */
export async function sendCeePartnerInvite(
  params: CeePartnerInviteEmailParams
): Promise<{ success: boolean }> {
  try {
    await sendEmail({
      to: params.to,
      subject: 'Invitation \u2014 Devenez partenaire CEE de ServicesArtisans',
      html: buildCeePartnerInviteHtml(params),
      from: process.env.RESEND_FROM_EMAIL || 'ServicesArtisans <noreply@servicesartisans.fr>',
      tags: [{ name: 'type', value: 'cee_partner_invite' }],
    })
    logger.info('cee-email: invitation partenaire envoyée', {
      action: 'cee-email-partner-invite',
    })
    return { success: true }
  } catch (error) {
    logger.warn('cee-email: échec invitation partenaire (fail-open)', {
      action: 'cee-email-partner-invite-failed',
      error: error instanceof Error ? error.message : String(error),
    })
    return { success: false }
  }
}

// ---------------------------------------------------------------------------
// Certification (après quiz réussi)
// ---------------------------------------------------------------------------

function buildCeeCertificationHtml(params: CeeCertificationEmailParams): string {
  const { artisanName, score, certificatePdfUrl } = params
  const certificateSection = certificatePdfUrl
    ? `
    <div style="text-align: center; margin: 28px 0;">
      <a href="${esc(certificatePdfUrl)}" style="display: inline-block; background: #059669; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
        T\u00e9l\u00e9charger mon attestation
      </a>
    </div>`
    : ''
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff;">
  <div style="padding: 32px 24px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #059669; margin: 0; font-size: 24px;">ServicesArtisans</h1>
      <div style="display: inline-block; background-color: #ecfdf5; color: #065f46; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 12px; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
        F\u00e9licitations \u2014 certifi\u00e9 CEE
      </div>
    </div>

    <p style="font-size: 16px; margin: 0 0 16px 0;">Bonjour ${esc(artisanName)},</p>

    <p style="font-size: 15px; margin: 0 0 16px 0;">
      Vous avez valid\u00e9 la formation partenaire CEE avec un score de <strong>${score}/10</strong>. Votre compte va \u00eatre activ\u00e9 d\u00e8s validation finale de notre \u00e9quipe.
    </p>

    ${certificateSection}

    <p style="color: #6b7280; font-size: 13px; margin: 16px 0 0 0;">
      Vous recevrez un second email d\u00e8s que votre compte sera pleinement op\u00e9rationnel.
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0 16px 0;">
    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
      ServicesArtisans \u2014 SA Energy, mandataire CEE
    </p>
  </div>
</body>
</html>`
}

/**
 * Envoie l'email de certification après quiz réussi (score >= 8/10).
 * Fail-open.
 */
export async function sendCeeCertificationEmail(
  params: CeeCertificationEmailParams
): Promise<{ success: boolean }> {
  try {
    await sendEmail({
      to: params.to,
      subject: 'Certification CEE valid\u00e9e',
      html: buildCeeCertificationHtml(params),
      from: process.env.RESEND_FROM_EMAIL || 'ServicesArtisans <noreply@servicesartisans.fr>',
      tags: [
        { name: 'type', value: 'cee_partner_certification' },
        { name: 'score', value: String(params.score) },
      ],
    })
    logger.info('cee-email: certification envoyée', {
      action: 'cee-email-certification',
      score: params.score,
    })
    return { success: true }
  } catch (error) {
    logger.warn('cee-email: échec certification (fail-open)', {
      action: 'cee-email-certification-failed',
      error: error instanceof Error ? error.message : String(error),
    })
    return { success: false }
  }
}

// ---------------------------------------------------------------------------
// Partner activated (status → active)
// ---------------------------------------------------------------------------

function buildCeePartnerActivatedHtml(params: CeePartnerActivatedEmailParams): string {
  const { artisanName, dashboardUrl } = params
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff;">
  <div style="padding: 32px 24px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #059669; margin: 0; font-size: 24px;">ServicesArtisans</h1>
      <div style="display: inline-block; background-color: #ecfdf5; color: #065f46; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 12px; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
        Compte activ\u00e9
      </div>
    </div>

    <p style="font-size: 16px; margin: 0 0 16px 0;">Bonjour ${esc(artisanName)},</p>

    <p style="font-size: 15px; margin: 0 0 16px 0;">
      Votre compte partenaire CEE est <strong>actif</strong>. Vous pouvez maintenant recevoir des dossiers CEE qualifi\u00e9s et suivre vos commissions depuis votre espace.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${esc(dashboardUrl)}" style="display: inline-block; background: #059669; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Acc\u00e9der \u00e0 mon espace CEE
      </a>
    </div>

    <p style="color: #6b7280; font-size: 13px; margin: 16px 0 0 0;">
      Besoin d\u2019aide ? <a href="mailto:partenaires@servicesartisans.fr" style="color: #059669;">partenaires@servicesartisans.fr</a>
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0 16px 0;">
    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
      ServicesArtisans \u2014 SA Energy, mandataire CEE
    </p>
  </div>
</body>
</html>`
}

/**
 * Envoie l'email d'activation finale (status → active). Fail-open.
 */
export async function sendCeePartnerActivatedEmail(
  params: CeePartnerActivatedEmailParams
): Promise<{ success: boolean }> {
  try {
    await sendEmail({
      to: params.to,
      subject: 'Votre compte partenaire CEE est activ\u00e9',
      html: buildCeePartnerActivatedHtml(params),
      from: process.env.RESEND_FROM_EMAIL || 'ServicesArtisans <noreply@servicesartisans.fr>',
      tags: [{ name: 'type', value: 'cee_partner_activated' }],
    })
    logger.info('cee-email: activation partenaire envoyée', {
      action: 'cee-email-partner-activated',
    })
    return { success: true }
  } catch (error) {
    logger.warn('cee-email: échec activation partenaire (fail-open)', {
      action: 'cee-email-partner-activated-failed',
      error: error instanceof Error ? error.message : String(error),
    })
    return { success: false }
  }
}
