/**
 * GET /api/outreach/opt-out/[token]
 *
 * Sprint 4 vague 4 — opt-out 1-clic outreach Lemlist (RGPD pro B2B). Lien
 * public en pied de chaque email envoyé via scripts/generate-outreach-top200.ts.
 *
 * Single-use idempotent (l'utilisateur peut cliquer 2x sans erreur). Pas
 * d'auth (RFC 8058 1-click) : la possession du token = preuve que l'email
 * est arrivé à destination du bon contact.
 *
 * Sécurité :
 *   - Token URL-safe 32 bytes base64url (entropie 256 bits)
 *   - RPC `outreach_opt_out` SECURITY DEFINER avec search_path pinné
 *     (cf. migration 500). Update atomique sur opt_out_token + opt_out_at NULL.
 *   - Aucune info renvoyée au caller (juste redirect succès), pas de leak
 *     possible (token présent ou non, on retourne le même résultat visible).
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'

function redirect(path: string): NextResponse {
  return NextResponse.redirect(new URL(path, SITE_URL), { status: 303 })
}

export async function GET(
  _request: Request,
  { params }: { params: { token: string } }
): Promise<NextResponse> {
  const token = params.token?.trim()

  if (!token || token.length < 32 || token.length > 96) {
    return redirect('/outreach/lien-invalide')
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('outreach_opt_out', { p_token: token })

  if (error) {
    logger.error('[outreach/opt-out] rpc error', { tokenPrefix: token.slice(0, 8), error })
    return redirect('/outreach/lien-invalide')
  }

  // RPC retourne TRUE si update a touché ≥1 ligne, FALSE sinon (token inconnu
  // OU déjà opt-out — idempotent). On redirige toujours vers la page succès
  // pour éviter de leaker l'info "ce token n'existe pas".
  logger.info('[outreach/opt-out] processed', {
    tokenPrefix: token.slice(0, 8),
    matched: Boolean(data),
  })
  return redirect('/outreach/desinscrit')
}
