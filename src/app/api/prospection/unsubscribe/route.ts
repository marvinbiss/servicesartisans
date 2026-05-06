/**
 * Endpoint public de désinscription RGPD prospection.
 *
 * Accessible sans authentification via token HMAC signé (cf.
 * `verifyUnsubscribeToken` dans lib/prospection/template-renderer.ts).
 *
 * SLA-99.9 hardening (2026-05-06) :
 *   - Rate-limit 30/min/IP via Redis Upstash (shared cross-instances) +
 *     fail-open (un crawler de safe-link ne doit jamais bloquer un user).
 *     Le précédent in-memory Map ne tenait pas sur Vercel multi-region.
 *   - Timeout 5s sur l'UPDATE Supabase (Promise.race) → fail-soft.
 *   - HMAC verifié via crypto.timingSafeEqual (cf. template-renderer.ts).
 *     Aucun `===` sur la signature côté app.
 *   - Logs anonymisés : on log payload.cid (UUID interne) jamais l'email.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { verifyUnsubscribeToken } from '@/lib/prospection/template-renderer'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'

export const dynamic = 'force-dynamic'

// SLA-99.9 : timeout DB (5s) — fail-soft sur lenteur Supabase.
const DB_TIMEOUT_MS = 5000

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const securityHeaders = {
  'Content-Type': 'text/html; charset=utf-8',
  'Content-Security-Policy':
    "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'no-store',
} as const

async function withTimeout<T>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label}-timeout`)), ms)),
  ])
}

export async function GET(request: NextRequest) {
  // SLA-99.9 : RL Redis (shared) 30/min/IP fail-open.
  const ip = getClientIp(request.headers)
  const rl = await checkRateLimit(`unsubscribe:${ip}`, {
    window: 60_000,
    max: 30,
    failOpen: true,
  })
  if (!rl.allowed) {
    return new NextResponse('Trop de requêtes. Réessayez plus tard.', {
      status: 429,
      headers: {
        'Retry-After': String(Math.max(1, Math.ceil((rl.resetTime - Date.now()) / 1000))),
        'Cache-Control': 'no-store',
      },
    })
  }

  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return new NextResponse(unsubscribePage('Token manquant', false), {
        status: 400,
        headers: securityHeaders,
      })
    }

    // SLA-99.9 : Verify HMAC-signed token avec timingSafeEqual côté
    // verifyUnsubscribeToken (cf. template-renderer.ts).
    const payload = verifyUnsubscribeToken(token)

    if (!payload) {
      return new NextResponse(unsubscribePage('Lien invalide ou expiré', false), {
        status: 400,
        headers: securityHeaders,
      })
    }

    const supabase = createAdminClient()

    // SLA-99.9 : timeout 5s sur l'UPDATE.
    let updateError: { message: string } | null = null
    try {
      const res = await withTimeout(
        supabase
          .from('prospection_contacts')
          .update({
            consent_status: 'opted_out',
            opted_out_at: new Date().toISOString(),
          })
          .eq('id', payload.cid),
        DB_TIMEOUT_MS,
        'unsubscribe-update'
      )
      updateError = (res.error as { message: string } | null) ?? null
    } catch (err) {
      logger.error('Unsubscribe update timeout', {
        contactId: payload.cid,
        error: err instanceof Error ? err.message : 'unknown',
      })
      return new NextResponse(unsubscribePage('Service indisponible', false), {
        status: 503,
        headers: securityHeaders,
      })
    }

    if (updateError) {
      logger.error('Unsubscribe error', updateError)
      return new NextResponse(unsubscribePage('Erreur technique', false), {
        status: 500,
        headers: securityHeaders,
      })
    }

    logger.info('Contact unsubscribed', { contactId: payload.cid, channel: payload.ch })

    return new NextResponse(unsubscribePage('Désinscription confirmée', true), {
      status: 200,
      headers: securityHeaders,
    })
  } catch (error) {
    logger.error('Unsubscribe endpoint error', error as Error)
    return new NextResponse(unsubscribePage('Erreur technique', false), {
      status: 500,
      headers: securityHeaders,
    })
  }
}

function unsubscribePage(message: string, success: boolean): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>Désinscription - ServicesArtisans</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
    .card { background: white; border-radius: 12px; padding: 40px; max-width: 400px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 20px; color: #333; margin: 0 0 8px; }
    p { color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? '&#10003;' : '&#10007;'}</div>
    <h1>${escapeHtml(message)}</h1>
    <p>${
      success
        ? 'Vous ne recevrez plus de communications de notre part.'
        : 'Veuillez réessayer ou contacter support@servicesartisans.fr'
    }</p>
  </div>
</body>
</html>`
}
