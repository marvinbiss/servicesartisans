/**
 * Endpoint opt-out prospection (P1.3 — traçabilité CNIL)
 *
 * GET  /api/prospection/optout?email=…&campaign=…&token=…
 *   → lien one-click dans les emails de prospection. Retourne une page HTML
 *     minimale "Vous avez été désinscrit".
 *
 * POST /api/prospection/optout
 *   body : { email, campaign_id, token, reason? }
 *   → pour form HTML ou déclenchement programmatique (SMS reply STOP,
 *     admin manuel, etc.). Retourne JSON.
 *
 * Fail-close : token invalide → 400, pas d'insert.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { verifyOptoutToken, hashIp } from '@/lib/prospection/optout'
import { rateLimiter } from '@/lib/cache/redis-client'

export const dynamic = 'force-dynamic'

const securityHeaders = {
  'Content-Type': 'text/html; charset=utf-8',
  'Content-Security-Policy':
    "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'no-store',
} as const

// SLA-99.9 (2026-05-06) : 30/min/IP — élargi de 10 → 30 pour absorber les
// pré-fetcheurs anti-spam (Outlook safe-links, Apple Mail privacy proxy)
// qui visitent l'URL avant le user. Le HMAC fait la sécurité réelle.
const RATE_LIMIT_MAX = 30
const RATE_LIMIT_WINDOW_SECONDS = 60

// SLA-99.9 : timeout DB strict (5s) — si Supabase rame, on fail-soft au lieu
// de laisser le navigateur attendre indéfiniment.
const DB_TIMEOUT_MS = 5000

async function withTimeout<T>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label}-timeout`)), ms)),
  ])
}

function getClientIp(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]?.trim() || 'unknown'
  return request.headers.get('x-real-ip') || 'unknown'
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function renderPage(title: string, message: string, success: boolean): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>${escapeHtml(title)} - ServicesArtisans</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; color: #222; }
    .card { background: #fff; border-radius: 12px; padding: 40px; max-width: 440px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 20px; margin: 0 0 8px; }
    p { color: #555; font-size: 14px; line-height: 1.5; }
    a { color: #2563eb; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? '&#10003;' : '&#10007;'}</div>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
    <p style="margin-top:24px;font-size:12px;color:#888">
      ServicesArtisans — <a href="https://servicesartisans.fr">servicesartisans.fr</a>
    </p>
  </div>
</body>
</html>`
}

interface OptoutInput {
  email: string
  campaignId: string
  token: string
  reason: 'user_request' | 'complaint' | 'legal_request'
  source: 'email_link' | 'sms_reply_stop' | 'api' | 'manual_admin'
  ipHash: string | null
  userAgent: string | null
}

/**
 * Cœur logique : vérifie le token, upsert l'opt-out (idempotent).
 * Retourne `{ ok: true }` si succès, `{ ok: false, status, message }` sinon.
 */
async function performOptout(
  input: OptoutInput
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  // SLA-99.9 : verifyOptoutToken utilise crypto.timingSafeEqual (lib/prospection/optout.ts).
  // Aucune comparaison `===` sur le HMAC côté app.
  if (!verifyOptoutToken(input.token, input.email, input.campaignId)) {
    logger.warn('Prospection optout: token invalide', {
      campaignId: input.campaignId,
      source: input.source,
    })
    return { ok: false, status: 400, message: 'Lien invalide ou expiré.' }
  }

  const supabase = createAdminClient()
  const normalizedEmail = input.email.trim().toLowerCase()

  // Upsert idempotent via ON CONFLICT sur lower(email). L'index unique
  // défini en migration 393 garantit qu'un deuxième clic est un no-op.
  // PostgREST ne supporte pas ON CONFLICT sur expression, donc on fait
  // un SELECT préalable puis INSERT si absent.
  // Exact match sur l'email normalisé (lowercase+trim). On n'utilise PAS
  // `ilike` : `_` et `%` sont des wildcards LIKE et produiraient des
  // faux positifs (ex: `a_b@x.com` matche `aab@x.com`) ainsi qu'un vecteur
  // d'injection de wildcards. L'unique index `lower(email)` (migration 393)
  // garantit la cohérence côté DB.
  let existing: { id: string } | null = null
  try {
    // SLA-99.9 : timeout 5s DB (anti-hang Supabase).
    const res = await withTimeout(
      supabase.from('prospection_optouts').select('id').eq('email', normalizedEmail).maybeSingle(),
      DB_TIMEOUT_MS,
      'optout-select'
    )
    existing = (res.data as { id: string } | null) ?? null
  } catch (err) {
    logger.error('Prospection optout: select timeout', {
      campaignId: input.campaignId,
      error: err instanceof Error ? err.message : 'unknown',
    })
    return { ok: false, status: 503, message: 'Service indisponible, réessayez plus tard.' }
  }

  if (existing) {
    logger.info('Prospection optout: déjà enregistré', {
      campaignId: input.campaignId,
      source: input.source,
    })
    return { ok: true }
  }

  let insertError: { code?: string; message: string } | null = null
  try {
    const res = await withTimeout(
      supabase.from('prospection_optouts').insert({
        email: normalizedEmail,
        reason: input.reason,
        source: input.source,
        campaign_id: input.campaignId,
        token_used: input.token,
        ip_hash: input.ipHash,
        user_agent: input.userAgent,
      }),
      DB_TIMEOUT_MS,
      'optout-insert'
    )
    insertError = (res.error as { code?: string; message: string } | null) ?? null
  } catch (err) {
    logger.error('Prospection optout: insert timeout', {
      campaignId: input.campaignId,
      error: err instanceof Error ? err.message : 'unknown',
    })
    return { ok: false, status: 503, message: 'Service indisponible, réessayez plus tard.' }
  }

  if (insertError) {
    // Course : deux clics simultanés — la contrainte unique a pu gagner
    // entre le SELECT et l'INSERT. Traiter comme succès idempotent.
    if (insertError.code === '23505') {
      return { ok: true }
    }
    logger.error('Prospection optout: insert échoué', {
      error: insertError.message,
      campaignId: input.campaignId,
    })
    // SLA-99.9 : 503 plutôt que 500 → indique "service temporairement
    // indisponible, retry possible" (cohérent avec exigence opérationnelle
    // RGPD : un opt-out doit pouvoir être retenté).
    return { ok: false, status: 503, message: 'Service indisponible, réessayez plus tard.' }
  }

  // Le trigger DB (migration 393) réplique automatiquement dans
  // email_suppressions — pas besoin d'un second insert ici.

  logger.info('Prospection optout enregistré', {
    campaignId: input.campaignId,
    source: input.source,
    reason: input.reason,
  })
  return { ok: true }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request)
  const rl = await rateLimiter.isAllowed(`optout:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_SECONDS)
  if (!rl.allowed) {
    const retryAfter = Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000))
    return new NextResponse(
      renderPage('Trop de requêtes', 'Veuillez réessayer dans une minute.', false),
      {
        status: 429,
        headers: {
          ...securityHeaders,
          'Retry-After': String(retryAfter),
          'X-RateLimit-Remaining': String(rl.remaining),
        },
      }
    )
  }

  const { searchParams } = request.nextUrl
  const email = searchParams.get('email')
  const campaignId = searchParams.get('campaign')
  const token = searchParams.get('token')

  if (!email || !campaignId || !token) {
    return new NextResponse(
      renderPage('Lien invalide', 'Paramètres manquants dans le lien de désinscription.', false),
      { status: 400, headers: securityHeaders }
    )
  }

  const userAgent = request.headers.get('user-agent')?.slice(0, 500) || null
  const ipHash = ip !== 'unknown' ? hashIp(ip) : null

  const result = await performOptout({
    email,
    campaignId,
    token,
    reason: 'user_request',
    source: 'email_link',
    ipHash,
    userAgent,
  })

  if (!result.ok) {
    return new NextResponse(renderPage('Désinscription impossible', result.message, false), {
      status: result.status,
      headers: securityHeaders,
    })
  }

  return new NextResponse(
    renderPage(
      'Vous avez été désinscrit',
      'Votre adresse ne recevra plus de communications commerciales de ServicesArtisans. Merci pour votre confiance.',
      true
    ),
    { status: 200, headers: securityHeaders }
  )
}

// Comportement legacy préservé : un `reason`/`source` non-string retombe sur
// le défaut (le code historique testait `typeof === 'string'`), tandis qu'un
// string hors liste reste rejeté en `invalid_reason_or_source`.
const stringOnly = (v: unknown) => (typeof v === 'string' ? v : undefined)
const optoutPostSchema = z.object({
  email: z.string().min(1),
  campaign_id: z.string().min(1),
  token: z.string().min(1),
  reason: z.preprocess(
    stringOnly,
    z.enum(['user_request', 'complaint', 'legal_request']).default('user_request')
  ),
  source: z.preprocess(
    stringOnly,
    z.enum(['email_link', 'sms_reply_stop', 'api', 'manual_admin']).default('api')
  ),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request)
  const rl = await rateLimiter.isAllowed(`optout:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_SECONDS)
  if (!rl.allowed) {
    const retryAfter = Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000))
    return NextResponse.json(
      { error: 'rate_limited' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Remaining': String(rl.remaining),
        },
      }
    )
  }

  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const parsed = optoutPostSchema.safeParse(rawBody)
  if (!parsed.success) {
    const onCredentials = parsed.error.issues.some((i) =>
      ['email', 'campaign_id', 'token'].includes(String(i.path[0]))
    )
    return NextResponse.json(
      { error: onCredentials ? 'missing_fields' : 'invalid_reason_or_source' },
      { status: 400 }
    )
  }

  const { email, campaign_id: campaignId, token, reason, source } = parsed.data

  const userAgent = request.headers.get('user-agent')?.slice(0, 500) || null
  const ipHash = ip !== 'unknown' ? hashIp(ip) : null

  const result = await performOptout({
    email,
    campaignId,
    token,
    reason,
    source,
    ipHash,
    userAgent,
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.status })
  }
  return NextResponse.json({ ok: true })
}
