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
 *   - Token URL-safe 32 bytes base64url (entropie 256 bits) généré côté
 *     scripts/generate-outreach-top200.ts (crypto.randomBytes(32)).
 *   - RPC `outreach_opt_out` SECURITY DEFINER avec search_path pinné
 *     (cf. migration 500). Update atomique sur opt_out_token + opt_out_at NULL.
 *   - Aucune info renvoyée au caller (juste redirect succès), pas de leak
 *     possible (token présent ou non, on retourne le même résultat visible).
 *   - SLA-99.9 : l'app n'expose AUCUNE comparaison string sur la valeur du
 *     token (l'égalité est faite côté Postgres dans le RPC). Toute
 *     pré-validation locale se limite à `length` + regex de format pour
 *     éviter une oracle timing au niveau app.
 *
 * SLA-99.9 hardening (2026-05-06) :
 *   - Rate-limit 30/min/IP (fail-open) — protège la RPC d'un brute-force
 *     d'enumération de tokens (256-bit ⇒ inviolable, mais on coupe le bruit).
 *   - Timeout 5s sur l'appel RPC — fail-soft : redirect "lien-invalide"
 *     plutôt que de laisser le navigateur pendre.
 *   - Validation regex stricte (base64url 16-128 chars) avant tout DB hit.
 *   - Logging anonymisé (token prefix 8 chars max, jamais le token complet).
 */

import { NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/seo/config'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'

export const dynamic = 'force-dynamic'

// SLA-99.9 : timeout strict côté app — si Supabase RPC dépasse 5s, on
// redirige le user vers la page d'erreur plutôt que de laisser hang.
const RPC_TIMEOUT_MS = 5000

// SLA-99.9 : token = base64url 32 bytes ⇒ 43 chars sans padding. On accepte
// 16..128 pour rester souple si un jour on change la taille, mais on rejette
// tout caractère hors alphabet base64url AVANT de toucher la DB.
const TOKEN_REGEX = /^[A-Za-z0-9_-]{16,128}$/

function redirect(path: string): NextResponse {
  return NextResponse.redirect(new URL(path, SITE_URL), { status: 303 })
}

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
): Promise<NextResponse> {
  // SLA-99.9 : RL 30/min/IP, fail-open (un crawler ne doit jamais bloquer
  // un user légitime qui clique 2x sur le même mail).
  const ip = getClientIp(request.headers)
  const rl = await checkRateLimit(`outreach-optout:${ip}`, {
    window: 60_000,
    max: 30,
    failOpen: true,
  })
  if (!rl.allowed) {
    return new NextResponse('Trop de requêtes', {
      status: 429,
      headers: {
        'Retry-After': String(Math.max(1, Math.ceil((rl.resetTime - Date.now()) / 1000))),
        'Cache-Control': 'no-store',
      },
    })
  }

  const token = params.token?.trim() ?? ''

  // SLA-99.9 : pré-validation format avant tout I/O DB. Aucun branche secrète,
  // donc pas de timing oracle exploitable (regex `test` est constant en pire
  // cas sur input court).
  if (!TOKEN_REGEX.test(token)) {
    return redirect('/outreach/lien-invalide')
  }

  const supabase = createAdminClient()

  // SLA-99.9 : timeout 5s via Promise.race — le client Supabase JS ne supporte
  // pas AbortSignal sur les RPC, donc on wrap.
  let data: unknown
  let error: unknown
  try {
    const result = (await Promise.race([
      supabase.rpc('outreach_opt_out', { p_token: token }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('rpc-timeout')), RPC_TIMEOUT_MS)
      ),
    ])) as { data: unknown; error: unknown }
    data = result.data
    error = result.error
  } catch (timeoutErr) {
    logger.error('[outreach/opt-out] rpc timeout', {
      tokenPrefix: token.slice(0, 8),
      error: timeoutErr instanceof Error ? timeoutErr.message : 'unknown',
    })
    // SLA-99.9 : fail-soft → page d'erreur plutôt que 5xx (CDN cache-friendly).
    return redirect('/outreach/lien-invalide')
  }

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
