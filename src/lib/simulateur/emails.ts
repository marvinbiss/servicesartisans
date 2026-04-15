/**
 * Simulateur Aides Rénovation — transactional emails
 *
 * 4 flows:
 *   1. sendSubmitClientConfirmation — user reçoit accusé post-submit avec lien /resultat
 *   2. sendSubmitAdminNotification   — équipe SA reçoit alerte nouveau lead
 *   3. sendCallbackClientConfirmation — user reçoit accusé de rappel demandé
 *   4. sendCallbackAdminAlert         — équipe SA reçoit signal chaud (tel + slot)
 *
 * Design :
 *  - Fire-and-forget côté appelant (catch inline) — un email down ne bloque JAMAIS la 201/202
 *  - escapeHtml systématique pour tout champ user-controlled (prénom, nom, remarques)
 *  - ADMIN_EMAILS = liste comma-separated (fallback: contact@servicesartisans.fr)
 */

import { sendEmail } from '@/lib/api/resend-client'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'
const ADMIN_FALLBACK = 'contact@servicesartisans.fr'

function adminRecipients(): string[] {
  const raw = process.env.ADMIN_EMAILS || ADMIN_FALLBACK
  const list = raw
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)
  return list.length > 0 ? list : [ADMIN_FALLBACK]
}

function escapeHtml(s: unknown): string {
  if (s === null || s === undefined) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function fmtEur(v: number | null | undefined): string {
  if (typeof v !== 'number' || !Number.isFinite(v)) return '—'
  return `${v.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`
}

// ── 1. Submit — Client confirmation ─────────────────────────────────

export interface SubmitClientEmailParams {
  to: string
  prenom: string | null
  publicId: string
  mprTotal: number
  ceeFourchetteBas: number
  ceeFourchetteHaut: number
  coupPouceEstimation: number
  resteAChargeBas: number
  resteAChargeHaut: number
}

export async function sendSubmitClientConfirmation(params: SubmitClientEmailParams) {
  const resultatUrl = `${SITE_URL}/simulateur-aides-renovation/resultat/${params.publicId}`
  const greeting = params.prenom ? `Bonjour ${escapeHtml(params.prenom)},` : 'Bonjour,'
  const aidesTotal = params.mprTotal + params.coupPouceEstimation
  const ceeRange = `${fmtEur(params.ceeFourchetteBas)} – ${fmtEur(params.ceeFourchetteHaut)}`
  const resteRange = `${fmtEur(params.resteAChargeBas)} – ${fmtEur(params.resteAChargeHaut)}`

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
  <div style="text-align:center;margin-bottom:24px;">
    <h1 style="color:#059669;margin:0;">ServicesArtisans</h1>
  </div>
  <h2 style="color:#111;">Votre estimation d'aides à la rénovation</h2>
  <p>${greeting}</p>
  <p>Merci d'avoir utilisé notre simulateur. Voici un récapitulatif de votre estimation :</p>
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:20px 0;">
    <p style="margin:0 0 8px 0;"><strong>MaPrimeRénov' :</strong> ${fmtEur(params.mprTotal)}</p>
    <p style="margin:0 0 8px 0;"><strong>Certificats CEE :</strong> ${ceeRange}</p>
    <p style="margin:0 0 8px 0;"><strong>Coup de Pouce :</strong> ${fmtEur(params.coupPouceEstimation)}</p>
    <hr style="border:none;border-top:1px solid #bbf7d0;margin:12px 0;">
    <p style="margin:0;font-size:16px;"><strong>Aides cumulées estimées :</strong> <span style="color:#059669;font-weight:700;">${fmtEur(aidesTotal)}+ CEE</span></p>
    <p style="margin:8px 0 0 0;"><strong>Reste à charge estimé :</strong> ${resteRange}</p>
  </div>
  <div style="text-align:center;margin:30px 0;">
    <a href="${resultatUrl}" style="display:inline-block;background:#059669;color:#fff;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:600;">Consulter mon estimation complète</a>
  </div>
  <p style="color:#666;font-size:14px;">
    Cette estimation est indicative, non contractuelle. Un artisan RGE confirmera les montants exacts dans son devis.
    Vous pouvez demander un rappel gratuit d'un conseiller depuis la page de votre estimation.
  </p>
  <p style="color:#666;font-size:14px;">Référence de votre estimation : <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;">${escapeHtml(params.publicId)}</code></p>
  <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
  <p style="color:#999;font-size:12px;text-align:center;">
    ServicesArtisans — Simulateur aides rénovation énergétique<br>
    <a href="${SITE_URL}" style="color:#999;">servicesartisans.fr</a>
  </p>
</body></html>`

  return sendEmail({
    to: params.to,
    subject: `Votre estimation d'aides rénovation — ${fmtEur(aidesTotal)}+ d'aides`,
    html,
    tags: [
      { name: 'type', value: 'simulateur_submit_client' },
      { name: 'public_id', value: params.publicId },
    ],
  })
}

// ── 2. Submit — Admin notification ──────────────────────────────────

export interface SubmitAdminEmailParams {
  publicId: string
  prenom: string | null
  nom: string | null
  email: string | null
  telephone: string | null
  codePostal: string
  parcours: string
  categorieAnah: string
  mprTotal: number
  ceeFourchetteHaut: number
  coupPouceEstimation: number
  consentDemarchage: boolean
}

export async function sendSubmitAdminNotification(params: SubmitAdminEmailParams) {
  const aidesHaut = params.mprTotal + params.ceeFourchetteHaut + params.coupPouceEstimation
  const nomComplet =
    [params.prenom, params.nom]
      .filter(Boolean)
      .map((s) => escapeHtml(s))
      .join(' ') || '—'
  const tel = params.telephone ? escapeHtml(params.telephone) : '—'
  const emailUser = params.email ? escapeHtml(params.email) : '—'
  const demarchage = params.consentDemarchage
    ? '<span style="color:#059669;font-weight:600;">✓ Consenti</span>'
    : '<span style="color:#dc2626;">✗ Refusé</span>'

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
  <h2 style="color:#059669;">🔔 Nouveau lead simulateur</h2>
  <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:20px 0;">
    <p style="margin:0 0 8px 0;"><strong>Contact :</strong> ${nomComplet}</p>
    <p style="margin:0 0 8px 0;"><strong>Email :</strong> ${emailUser}</p>
    <p style="margin:0 0 8px 0;"><strong>Téléphone :</strong> ${tel}</p>
    <p style="margin:0 0 8px 0;"><strong>Code postal :</strong> ${escapeHtml(params.codePostal)}</p>
    <p style="margin:0 0 8px 0;"><strong>Parcours :</strong> ${escapeHtml(params.parcours)}</p>
    <p style="margin:0 0 8px 0;"><strong>Catégorie ANAH :</strong> ${escapeHtml(params.categorieAnah)}</p>
    <p style="margin:0 0 8px 0;"><strong>Consent démarchage :</strong> ${demarchage}</p>
  </div>
  <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:16px;margin:20px 0;">
    <p style="margin:0;"><strong>Estimation aides (haut) :</strong> ${fmtEur(aidesHaut)}</p>
    <p style="margin:4px 0 0 0;font-size:13px;color:#065f46;">MPR ${fmtEur(params.mprTotal)} · CEE ${fmtEur(params.ceeFourchetteHaut)} · CdP ${fmtEur(params.coupPouceEstimation)}</p>
  </div>
  <p><strong>Référence :</strong> <code>${escapeHtml(params.publicId)}</code></p>
  <p style="color:#666;font-size:13px;">Lead également synchronisé dans Pipedrive (pipeline Simulateur Aides).</p>
</body></html>`

  return sendEmail({
    to: adminRecipients(),
    subject: `🔔 Lead simulateur — ${nomComplet} (${escapeHtml(params.codePostal)})`,
    html,
    tags: [
      { name: 'type', value: 'simulateur_submit_admin' },
      { name: 'public_id', value: params.publicId },
    ],
  })
}

// ── 3. Callback — Client confirmation ───────────────────────────────

export interface CallbackClientEmailParams {
  to: string
  prenom: string | null
  telephone: string
  preferredSlot: string | null
  publicId: string
}

export async function sendCallbackClientConfirmation(params: CallbackClientEmailParams) {
  const greeting = params.prenom ? `Bonjour ${escapeHtml(params.prenom)},` : 'Bonjour,'
  const slot = params.preferredSlot
    ? `Créneau préféré : <strong>${escapeHtml(params.preferredSlot)}</strong>`
    : 'Un conseiller vous rappellera dans les meilleurs délais.'

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
  <div style="text-align:center;margin-bottom:24px;">
    <h1 style="color:#059669;margin:0;">ServicesArtisans</h1>
  </div>
  <h2 style="color:#111;">Demande de rappel confirmée</h2>
  <p>${greeting}</p>
  <p>Nous avons bien enregistré votre demande de rappel pour votre estimation d'aides à la rénovation.</p>
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:20px 0;">
    <p style="margin:0 0 8px 0;"><strong>Numéro qui sera appelé :</strong> ${escapeHtml(params.telephone)}</p>
    <p style="margin:0;">${slot}</p>
  </div>
  <p>Notre conseiller prendra connaissance de votre dossier avant de vous joindre pour affiner votre estimation et vous présenter les prochaines étapes.</p>
  <p style="color:#666;font-size:14px;">Référence : <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;">${escapeHtml(params.publicId)}</code></p>
  <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
  <p style="color:#999;font-size:12px;text-align:center;">
    ServicesArtisans — <a href="${SITE_URL}" style="color:#999;">servicesartisans.fr</a>
  </p>
</body></html>`

  return sendEmail({
    to: params.to,
    subject: 'Demande de rappel confirmée — ServicesArtisans',
    html,
    tags: [
      { name: 'type', value: 'simulateur_callback_client' },
      { name: 'public_id', value: params.publicId },
    ],
  })
}

// ── 4. Callback — Admin alert ────────────────────────────────────────

export interface CallbackAdminEmailParams {
  publicId: string
  prenom: string | null
  nom: string | null
  email: string
  telephone: string
  preferredSlot: string | null
  remarquesClient: string | null
}

export async function sendCallbackAdminAlert(params: CallbackAdminEmailParams) {
  const nomComplet =
    [params.prenom, params.nom]
      .filter(Boolean)
      .map((s) => escapeHtml(s))
      .join(' ') || '—'
  const slot = params.preferredSlot ? escapeHtml(params.preferredSlot) : '—'
  const remarques = params.remarquesClient
    ? `<div style="background:#fffbeb;border-left:3px solid #f59e0b;padding:12px;margin:16px 0;white-space:pre-wrap;">${escapeHtml(params.remarquesClient)}</div>`
    : ''

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
  <h2 style="color:#dc2626;">🔥 Rappel demandé (signal chaud)</h2>
  <p style="color:#666;">Le client a soumis une estimation puis demandé explicitement à être rappelé.</p>
  <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:20px;margin:20px 0;">
    <p style="margin:0 0 8px 0;"><strong>Contact :</strong> ${nomComplet}</p>
    <p style="margin:0 0 8px 0;"><strong>Téléphone :</strong> <a href="tel:${escapeHtml(params.telephone)}" style="color:#dc2626;font-weight:700;">${escapeHtml(params.telephone)}</a></p>
    <p style="margin:0 0 8px 0;"><strong>Email :</strong> ${escapeHtml(params.email)}</p>
    <p style="margin:0;"><strong>Créneau préféré :</strong> ${slot}</p>
  </div>
  ${remarques}
  <p><strong>Référence estimation :</strong> <code>${escapeHtml(params.publicId)}</code></p>
  <p style="color:#666;font-size:13px;">Activity Pipedrive également créée sur la fiche. Priorité haute.</p>
</body></html>`

  return sendEmail({
    to: adminRecipients(),
    subject: `🔥 Rappel demandé — ${nomComplet} (${escapeHtml(params.telephone)})`,
    html,
    tags: [
      { name: 'type', value: 'simulateur_callback_admin' },
      { name: 'public_id', value: params.publicId },
    ],
  })
}

// ── 5. Claim — Authenticated artisan ────────────────────────────────

export async function sendClaimApprovedAuthenticatedEmail(params: {
  to: string
  name: string
  providerName: string
}) {
  const { to, name, providerName } = params
  const dashboardUrl = `${SITE_URL}/espace-artisan`

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;">
  <div style="text-align:center;margin-bottom:24px;">
    <h1 style="color:#f59e0b;margin:0;">ServicesArtisans</h1>
  </div>
  <h2>Bonne nouvelle, ${escapeHtml(name)} !</h2>
  <p>Votre demande de revendication pour <strong>${escapeHtml(providerName)}</strong> a été approuvée par notre équipe.</p>
  <p>Votre fiche artisan est désormais active et rattachée à votre compte. Vous pouvez gérer vos leads et votre profil depuis votre espace :</p>
  <div style="text-align:center;margin:30px 0;">
    <a href="${dashboardUrl}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">Accéder à mon espace</a>
  </div>
  <hr style="border:none;border-top:1px solid #eee;margin:30px 0;">
  <p style="color:#999;font-size:12px;text-align:center;">
    ServicesArtisans — <a href="${SITE_URL}" style="color:#999;">servicesartisans.fr</a>
  </p>
</body></html>`

  return sendEmail({
    to,
    subject: `Votre fiche "${providerName}" a été validée — ServicesArtisans`,
    html,
    tags: [{ name: 'type', value: 'claim_approved_auth' }],
  })
}
