/**
 * POST /api/auth/2fa/verify-pending
 *
 * Plan C — C-1. Step 2 du flow 2FA post-signin :
 *   /api/auth/signin (password OK + 2FA enabled)
 *     → cookie `sa_2fa_pending` (HMAC, 10min) + redirect /verifier-2fa
 *   /verifier-2fa (page UI)
 *     → POST ici avec { code }
 *     → on lit cookie pending, vérifie TOTP/backup, clear pending,
 *       set `sa_2fa_verified` (HMAC, 8h) → middleware autorise les routes privées
 *
 * Sécurité :
 *   - userId vient EXCLUSIVEMENT du cookie HMAC-signé (jamais du body) →
 *     impossible pour un attaquant de forger un userId.
 *   - GET intentionnellement non-exposé : le client n'a pas à lire le cookie
 *     pending, juste à savoir s'il existe (page côté serveur peut redirect).
 *   - Pas de Bearer/CRON exemption (CSRF middleware s'en charge).
 *   - Rate-limit : déjà couvert par le middleware (RATE_LIMITS.api) + brute
 *     force protection 5 fails/15min directement dans `twoFactorAuth.verifyCode`.
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { twoFactorAuth } from '@/lib/auth/two-factor'
import {
  PENDING_COOKIE_NAME,
  buildClearCookie,
  buildVerifiedCookie,
  readPendingCookie,
} from '@/lib/auth/two-factor-cookies'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  code: z.string().min(6).max(20),
})

// Plan D — SLA fix : rate-limit IP en plus du lockout userId-scoped.
// 20 tentatives / 5 min / IP → bloque brute-force cross-user (creds stolen
// list) tout en laissant 3-4 erreurs de saisie utilisateur normales.
const RL_WINDOW_MS = 5 * 60 * 1000
const RL_MAX = 20

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`2fa-verify:${ip}`, {
      window: RL_WINDOW_MS,
      max: RL_MAX,
      failOpen: true,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: { message: 'Trop de tentatives, réessayez plus tard' } },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) },
        }
      )
    }

    const cookieStore = await cookies()
    const pendingValue = cookieStore.get(PENDING_COOKIE_NAME)?.value
    const pending = await readPendingCookie(pendingValue)

    if (!pending) {
      return NextResponse.json(
        { success: false, error: { message: 'Session 2FA expirée. Reconnectez-vous.' } },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => null)
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Code invalide' } },
        { status: 400 }
      )
    }

    let isValid = false
    try {
      isValid = await twoFactorAuth.verifyCode(pending.userId, parsed.data.code)
    } catch (e) {
      // verifyCode throw "Too many failed attempts" sur lockout 5/15min
      const message = e instanceof Error ? e.message : 'Erreur de vérification'
      return NextResponse.json({ success: false, error: { message } }, { status: 429 })
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: { message: 'Code incorrect' } },
        { status: 401 }
      )
    }

    const verified = await buildVerifiedCookie(pending.userId)
    const cleared = buildClearCookie(PENDING_COOKIE_NAME)

    const response = NextResponse.json({ success: true, message: 'Vérification réussie' })
    response.cookies.set(verified.name, verified.value, verified.options)
    response.cookies.set(cleared.name, cleared.value, cleared.options)
    return response
  } catch (error) {
    logger.error('2FA verify-pending error', error)
    captureError(error, {
      tags: { route: 'api/auth/2fa/verify-pending', critical: 'true' },
    })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
