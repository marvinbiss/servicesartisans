import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { VERIFIED_COOKIE_NAME, readVerifiedCookie } from '@/lib/auth/two-factor-cookies'
import { logger } from '@/lib/logger'

type Provider = { id: string }

type ArtisanGuardResult =
  | { error: NextResponse; user: null; provider: null; supabase: SupabaseClient }
  | { error: null; user: User; provider: Provider; supabase: SupabaseClient }

/**
 * Gate 2FA réutilisable pour les routes /api/artisan/** qui font leur propre
 * résolution auth (ex. provider GET/PUT) au lieu de `requireArtisan()`.
 * Renvoie une NextResponse 403 si la 2FA est activée mais non vérifiée, sinon
 * `null` (accès autorisé). Fail-closed sur toute erreur de lecture du cookie.
 *
 * Portée : appliqué aux mutations et au profil. Les GET de lecture pure scopés
 * `user_id` (funnel/reputation/rge/trends/stats) ne l'appliquent volontairement
 * pas — le bypass pré-challenge n'y exposerait que les propres données de
 * l'utilisateur à lui-même, et une query 2FA par chargement de bloc dashboard
 * dégraderait la perf sans gain de sécurité.
 */
export async function assertArtisanTwoFactor(
  twoFactorEnabled: boolean | null | undefined,
  userId: string
): Promise<NextResponse | null> {
  if (twoFactorEnabled !== true) return null
  let verifiedPayload = null
  try {
    const cookieStore = await cookies()
    const verifiedCookieValue = cookieStore.get(VERIFIED_COOKIE_NAME)?.value
    verifiedPayload = await readVerifiedCookie(verifiedCookieValue, userId)
  } catch (err) {
    logger.error('assertArtisanTwoFactor cookie read failed, fail-closing', err)
    verifiedPayload = null
  }
  if (!verifiedPayload) {
    return NextResponse.json(
      { error: 'Vérification 2FA requise', code: 'two_factor_required' },
      { status: 403 }
    )
  }
  return null
}

/**
 * Auth guard pour TOUTES les routes /api/artisan/**.
 *
 * Le middleware n'enforce le gate auth/role/2FA que sur les *pages*
 * (/espace-artisan/*) — il ne couvre PAS /api/artisan/* (le bloc API du
 * middleware ne fait que du rate-limit). Sans ce guard, une session volée
 * ou une session 2FA pré-challenge pourrait taper l'API directement en
 * contournant le gate 2FA. Ce guard réplique donc la même défense au niveau
 * API : auth → role artisan → 2FA verified (si activé) → provider lié.
 */
export async function requireArtisan(): Promise<ArtisanGuardResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return {
      error: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }),
      user: null,
      provider: null,
      supabase,
    }
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, two_factor_enabled')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'artisan') {
    return {
      error: NextResponse.json({ error: 'Accès réservé aux artisans' }, { status: 403 }),
      user: null,
      provider: null,
      supabase,
    }
  }

  // Gate 2FA — parité avec le middleware (Plan C-1, CVSS 8.1). Si l'artisan a
  // activé la 2FA, on exige le cookie HMAC `sa_2fa_verified` valide. Couvre le
  // bypass pré-challenge (session active après signin mais TOTP non validé) et
  // les sessions hijackées (cookie verified impossible à forger sans le code).
  const twoFactorError = await assertArtisanTwoFactor(profile.two_factor_enabled, user.id)
  if (twoFactorError) {
    return { error: twoFactorError, user: null, provider: null, supabase }
  }

  // Verify artisan has an active provider profile
  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', user.id)
    .or('is_active.eq.true,is_active.is.null')
    .single()
  if (!provider) {
    return {
      error: NextResponse.json({ error: 'Profil artisan incomplet' }, { status: 403 }),
      user: null,
      provider: null,
      supabase,
    }
  }
  return { error: null, user, provider, supabase }
}
