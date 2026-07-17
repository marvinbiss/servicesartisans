/**
 * GET /api/artisan/claim/confirm/[token]
 *
 * Sprint 4 vague 4 — confirmation email pour claim. Lien public reçu par
 * l'artisan qui a soumis le formulaire de revendication. Single-use, expire
 * 7 jours après création (cf. createClaim).
 *
 * Flow :
 *   - Vérifie token + expires_at
 *   - Si OK + claim status='pending' + email_confirmed_at NULL : flip
 *     email_confirmed_at = now() et clear le token (single-use).
 *   - Redirige vers `/artisan/claim/confirme` (succès) ou
 *     `/artisan/claim/lien-invalide` (erreur).
 *
 * Sécurité :
 *   - Lien public, pas d'auth (l'artisan n'a pas encore de compte)
 *   - Token URL-safe 32 bytes base64url, généré par crypto.randomBytes côté
 *     createClaim (entropie 256 bits, non-devinable)
 *   - Index partiel sur email_confirmation_token côté migration 500
 *
 * Aucun PII renvoyé : on redirige vers une page statique. Le claim id
 * matché reste interne.
 */

import { NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/seo/config'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

function redirect(path: string): NextResponse {
  return NextResponse.redirect(new URL(path, SITE_URL), { status: 303 })
}

export async function GET(
  _request: Request,
  props: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  const params = await props.params
  try {
    const token = params.token?.trim()

    // Token URL-safe = base64url 43 chars (32 bytes). On rejette tout ce qui
    // n'est pas dans cette plage de longueur pour éviter les scans.
    if (!token || token.length < 32 || token.length > 96) {
      return redirect('/artisan/claim/lien-invalide')
    }

    const supabase = createAdminClient()

    const { data: claim, error: fetchError } = await supabase
      .from('provider_claims')
      .select('id, status, email_confirmed_at, email_confirmation_expires_at')
      .eq('email_confirmation_token', token)
      .maybeSingle()

    if (fetchError) {
      logger.error('[claim/confirm] fetch error', fetchError)
      return redirect('/artisan/claim/lien-invalide')
    }

    if (!claim) {
      return redirect('/artisan/claim/lien-invalide')
    }

    // Idempotent : déjà confirmé → on redirige vers succès sans re-update.
    if (claim.email_confirmed_at) {
      return redirect('/artisan/claim/confirme')
    }

    if (claim.status !== 'pending') {
      // Claim déjà traité (approved/rejected) — pas la peine de confirmer
      return redirect('/artisan/claim/lien-invalide')
    }

    const expiresAt = claim.email_confirmation_expires_at
      ? new Date(claim.email_confirmation_expires_at).getTime()
      : 0
    if (!expiresAt || expiresAt <= Date.now()) {
      return redirect('/artisan/claim/lien-invalide')
    }

    const { error: updateError } = await supabase
      .from('provider_claims')
      .update({
        email_confirmed_at: new Date().toISOString(),
        // Single-use : on clear le token pour éviter qu'il puisse être réutilisé
        // ou exfiltré via une fuite côté logs/proxies.
        email_confirmation_token: null,
      })
      .eq('id', claim.id)
      .is('email_confirmed_at', null)

    if (updateError) {
      logger.error('[claim/confirm] update error', { claimId: claim.id, error: updateError })
      return redirect('/artisan/claim/lien-invalide')
    }

    logger.info('[claim/confirm] email confirmed', { claimId: claim.id })
    return redirect('/artisan/claim/confirme')
  } catch (error) {
    logger.error('[api/artisan/claim/confirm/[token]] GET failed', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
