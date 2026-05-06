/**
 * Newsletter Unsubscribe API
 * GET /api/newsletter/unsubscribe?email=xxx&token=xxx
 * Marks subscriber as unsubscribed. Redirects to homepage with confirmation.
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'

export const dynamic = 'force-dynamic'

// Plan D — SLA fix : rate-limit IP pour empêcher brute-force du token HMAC
// (même si timingSafeEqual rend l'attaque coûteuse, on ferme la porte).
// 100 / 10 min / IP : large pour bot anti-spam mail (preview link prefetcher
// peut hit 5-10 fois) sans bloquer un user légitime sous NAT partagé.
const RL_WINDOW_MS = 10 * 60 * 1000
const RL_MAX = 100

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`newsletter-unsub:${ip}`, {
      window: RL_WINDOW_MS,
      max: RL_MAX,
      failOpen: true,
    })
    if (!rl.allowed) {
      return new NextResponse(
        htmlPage('Trop de requêtes', 'Veuillez patienter quelques minutes.'),
        {
          status: 429,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)),
          },
        }
      )
    }

    const { searchParams } = request.nextUrl
    const email = searchParams.get('email')
    const token = searchParams.get('token')

    if (!email || !token) {
      return new NextResponse(htmlPage('Lien invalide', 'Les paramètres requis sont manquants.'), {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    // Plan D — D-3 + D-4 (2026-05-06) :
    //   - Fail-CLOSE si UNSUBSCRIBE_SECRET absent (au lieu du fallback
    //     `'sa-newsletter-default-key'` qui permettait token forgery en prod
    //     si l'env n'était pas posée).
    //   - timingSafeEqual pour aligner sur prospection/unsubscribe et
    //     prévenir les attaques timing.
    const unsubscribeSecret = process.env.UNSUBSCRIBE_SECRET
    if (!unsubscribeSecret || unsubscribeSecret.length < 32) {
      logger.error(
        'Newsletter unsubscribe: UNSUBSCRIBE_SECRET missing or too short (must be >=32 chars)',
        undefined
      )
      return new NextResponse(
        htmlPage('Service indisponible', 'La désinscription est temporairement indisponible.'),
        {
          status: 503,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }
      )
    }
    const expectedToken = crypto
      .createHmac('sha256', unsubscribeSecret)
      .update(email.toLowerCase().trim())
      .digest('hex')

    let isValidToken = false
    try {
      const tokenBuf = Buffer.from(token, 'hex')
      const expectedBuf = Buffer.from(expectedToken, 'hex')
      isValidToken =
        tokenBuf.length === expectedBuf.length && crypto.timingSafeEqual(tokenBuf, expectedBuf)
    } catch {
      isValidToken = false
    }

    if (!isValidToken) {
      return new NextResponse(
        htmlPage('Lien invalide', 'Le lien de désinscription est invalide.'),
        {
          status: 400,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }
      )
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq('email', email.toLowerCase().trim())

    if (error) {
      logger.error('Newsletter unsubscribe DB error', error)
      return new NextResponse(htmlPage('Erreur', 'Une erreur est survenue. Veuillez réessayer.'), {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    return new NextResponse(
      htmlPage(
        'Désinscription confirmée',
        'Vous avez été désinscrit de notre newsletter. Vous ne recevrez plus nos emails.'
      ),
      {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    )
  } catch (error) {
    logger.error('Newsletter unsubscribe error', error)
    return new NextResponse(htmlPage('Erreur', 'Une erreur est survenue.'), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }
}

function htmlPage(title: string, message: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} - ServicesArtisans</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f8fafc; color: #333; }
    .card { text-align: center; max-width: 480px; padding: 48px 32px; background: white; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    h1 { color: #2563eb; font-size: 24px; margin: 0 0 16px; }
    p { color: #666; line-height: 1.6; margin: 0 0 24px; }
    a { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; }
    a:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="${siteUrl}">Retour à l'accueil</a>
  </div>
</body>
</html>`
}
