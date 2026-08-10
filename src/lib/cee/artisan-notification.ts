/**
 * CEE Artisan Briefing — email complémentaire envoyé à l'artisan RGE
 * assigné après un dispatch `cee_routed`.
 *
 * Design
 * ------
 * - **Fail-OPEN** : ne throw JAMAIS. Toute erreur est loggée et avalée.
 *   Le dispatch CEE ne doit pas être bloqué par un échec d'envoi d'email.
 * - **Zéro PII dans les logs** : on ne log que providerId (UUID) et dossierId.
 * - **Français avec accents** : l'artisan doit comprendre en 10 secondes
 *   que c'est un lead CEE et ce qu'il doit faire.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { SITE_URL } from '@/lib/seo/config'
import { logger } from '@/lib/logger'
import { sendEmail } from '@/lib/api/resend-client'
import type { DispatchPrimeEstimate, DispatchJustificatif } from './dispatcher'
import { escapeHtml, formatEuros } from './format'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CeeArtisanBriefingInput {
  providerId: string
  dossierId: string
  operationCode: string
  operationName: string | null
  primeEstimate: DispatchPrimeEstimate | null
  justificatifsRequis: DispatchJustificatif[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildPrimeSection(estimate: DispatchPrimeEstimate): string {
  if (estimate.euros_classique_min === 0 && estimate.euros_classique_max === 0) {
    return '<p style="color: #555; font-size: 14px;">Prime estimée : <strong>en cours de calcul</strong></p>'
  }
  const min = formatEuros(estimate.euros_classique_min)
  const max = formatEuros(estimate.euros_classique_max)
  if (estimate.euros_classique_min === estimate.euros_classique_max) {
    return `<p style="color: #555; font-size: 14px;">Prime estimée pour votre client : <strong style="color: #059669; font-size: 18px;">${max}</strong></p>`
  }
  return `<p style="color: #555; font-size: 14px;">Prime estimée pour votre client : <strong style="color: #059669; font-size: 18px;">${min} à ${max}</strong></p>`
}

function buildJustificatifsList(justificatifs: DispatchJustificatif[]): string {
  const obligatoires = justificatifs.filter((j) => j.obligatoire)
  if (obligatoires.length === 0) return ''

  const items = obligatoires
    .map((j) => `<li style="margin-bottom: 6px;">${escapeHtml(j.label)}</li>`)
    .join('')

  return `
    <div style="margin-top: 16px;">
      <p style="color: #333; font-weight: 600; margin-bottom: 8px;">Justificatifs obligatoires à collecter :</p>
      <ul style="color: #555; font-size: 14px; padding-left: 20px; margin: 0;">
        ${items}
      </ul>
    </div>`
}

function buildEmailHtml(input: CeeArtisanBriefingInput, artisanName: string): string {
  const operationLabel = input.operationName
    ? `${escapeHtml(input.operationCode)} — ${escapeHtml(input.operationName)}`
    : escapeHtml(input.operationCode)

  const primeSection = input.primeEstimate
    ? buildPrimeSection(input.primeEstimate)
    : '<p style="color: #555; font-size: 14px;">Prime estimée : <strong>en cours de calcul</strong></p>'

  const justificatifsSection = buildJustificatifsList(input.justificatifsRequis)

  const dashboardUrl = `${SITE_URL}/espace-artisan/cee/${encodeURIComponent(input.dossierId)}`

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 22px;">Lead CEE — Prime en jeu</h1>
    </div>
    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <p style="color: #333; font-size: 16px; margin-bottom: 16px;">Bonjour ${escapeHtml(artisanName)},</p>

      <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <p style="color: #065f46; font-size: 15px; font-weight: 600; margin: 0 0 4px 0;">
          Ce lead est éligible aux Certificats d'Économies d'Énergie (CEE)
        </p>
        <p style="color: #047857; font-size: 13px; margin: 0;">
          Une prime est disponible pour votre client. Traitez ce dossier en priorité.
        </p>
      </div>

      <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #059669;">
        <p style="color: #333; font-weight: 600; margin: 0 0 12px 0;">Fiche d'opération</p>
        <p style="color: #555; font-size: 14px; margin: 0 0 12px 0;">
          <strong>${operationLabel}</strong>
        </p>
        ${primeSection}
      </div>

      ${justificatifsSection}

      <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="color: #92400e; font-size: 13px; line-height: 1.5; margin: 0;">
          <strong>Rappel :</strong> en tant qu'artisan RGE, vous devez fournir votre attestation RGE valide
          et la facture conforme aux exigences de la fiche d'opération.
        </p>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${dashboardUrl}" style="display: inline-block; background: #059669; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
          Voir le dossier CEE
        </a>
      </div>

      <p style="color: #888; font-size: 13px; line-height: 1.5;">
        Cet email est un complément à la notification de lead standard.
        Le dossier CEE est accessible depuis votre espace artisan.
      </p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
      <p style="color: #aaa; font-size: 12px; text-align: center;">
        ServicesArtisans — La plateforme des artisans RGE certifiés
      </p>
    </div>
  </div>
</body>
</html>`
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Envoie un email de briefing CEE à l'artisan assigné.
 *
 * Fail-OPEN : ne throw JAMAIS. Toute erreur est loggée et la promesse
 * résout normalement. L'appelant peut fire-and-forget sans try/catch.
 */
export async function sendCeeArtisanBriefing(
  supabase: SupabaseClient,
  input: CeeArtisanBriefingInput
): Promise<void> {
  try {
    // Récupère l'email et le nom de l'artisan depuis la table providers
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('email, name')
      .eq('id', input.providerId)
      .single()

    if (providerError || !provider) {
      logger.warn('cee-artisan-briefing: provider introuvable, email non envoyé', {
        action: 'cee-artisan-briefing',
        providerId: input.providerId,
        dossierId: input.dossierId,
        error: providerError?.message ?? 'no_provider_row',
      })
      return
    }

    if (!provider.email) {
      logger.warn('cee-artisan-briefing: provider sans email, briefing non envoyé', {
        action: 'cee-artisan-briefing',
        providerId: input.providerId,
        dossierId: input.dossierId,
      })
      return
    }

    const html = buildEmailHtml(input, provider.name || 'Artisan')

    await sendEmail({
      to: provider.email,
      subject: `Dossier CEE — ${input.operationCode}${input.operationName ? ` — ${input.operationName}` : ''} — Prime disponible`,
      html,
      tags: [
        { name: 'type', value: 'cee_artisan_briefing' },
        { name: 'dossier_id', value: input.dossierId },
      ],
    })

    logger.info('cee-artisan-briefing: email envoyé', {
      action: 'cee-artisan-briefing',
      providerId: input.providerId,
      dossierId: input.dossierId,
    })
  } catch (err) {
    // Fail-OPEN : on avale l'erreur pour ne jamais bloquer le dispatch
    logger.warn('cee-artisan-briefing: échec envoi email, soft-fail', {
      action: 'cee-artisan-briefing',
      providerId: input.providerId,
      dossierId: input.dossierId,
      error: err instanceof Error ? err.message : String(err),
    })
  }
}
