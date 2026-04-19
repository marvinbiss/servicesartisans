/**
 * POST /api/webhooks/provider-seo-refresh
 *
 * Triggered automatically on provider-side mutations that change a fiche's
 * indexability. Pushes the affected URLs to IndexNow (Bing, Yandex, etc.)
 * within seconds of the change — short-circuits the 7-14 day default
 * re-crawl window.
 *
 * Supported reasons (see ProviderSeoRefreshReason):
 *   - provider_activated         — is_active flipped to true
 *   - rge_qualifications_changed — new qualif or expiration flip
 *   - noindex_cleared            — noindex flipped to false
 *   - cee_dossier_validated_pncee — cee_dossier_events.event_type='validated_pncee'
 *
 * Security
 * --------
 *   - HMAC-SHA256 over `${timestamp}.${rawBody}` (see provider-seo-refresh lib)
 *   - Replay window ≤ 5 min
 *   - Fail-close in production if INDEXNOW_WEBHOOK_SECRET missing
 *   - Content-Type application/json required
 *
 * Rate limit
 * ----------
 *   - 100 URLs/min per provider_id (sliding window via rate_limit_check RPC).
 *     Burst above the cap is rejected with 429; the caller should back off.
 *
 * Reliability
 * -----------
 * Fire-and-forget: the IndexNow POST is launched via submitUrlsWithRetry()
 * but the response is returned before the promise resolves. A single retry
 * pass is baked in; further failures are logged for the follow-up cron to
 * retry if a DLQ table is wired up later.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { rateLimitDb } from '@/lib/rate-limit-db'
import { requireEnvProd } from '@/lib/cee/route-helpers'
import {
  buildProviderUrls,
  submitUrlsWithRetry,
  verifyProviderSeoSignature,
  type ProviderSeoRefreshEvent,
  type ProviderSeoRefreshReason,
} from '@/lib/seo/provider-seo-refresh'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 10

const REASON_VALUES = [
  'provider_activated',
  'rge_qualifications_changed',
  'noindex_cleared',
  'cee_dossier_validated_pncee',
] as const

const bodySchema = z.object({
  reason: z.enum(REASON_VALUES),
  provider_id: z.string().uuid(),
  specialty: z.string().min(1).max(200).nullable().optional(),
  city: z.string().min(1).max(200).nullable().optional(),
  slug: z.string().min(1).max(200).nullable().optional(),
  stable_id: z.string().min(1).max(200).nullable().optional(),
})

function unauthorized(reason: string): NextResponse {
  return NextResponse.json(
    { success: false, error: { code: 'UNAUTHORIZED', message: reason } },
    { status: 401 }
  )
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Fail-close in prod if secret missing.
  const envError = requireEnvProd('INDEXNOW_WEBHOOK_SECRET')
  if (envError) return envError

  // Require JSON.
  const ct = request.headers.get('content-type') || ''
  if (!ct.toLowerCase().includes('application/json')) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Content-Type invalide' },
      },
      { status: 415 }
    )
  }

  // Raw body is required for HMAC — read exactly once.
  let rawBody: string
  try {
    rawBody = await request.text()
  } catch (err) {
    logger.warn('provider-seo-refresh: body unreadable', {
      action: 'provider-seo-refresh-body-read',
      error: err instanceof Error ? err.message : String(err),
    })
    return unauthorized('Body unreadable')
  }

  const signature =
    request.headers.get('x-seo-signature-256') || request.headers.get('X-Seo-Signature-256') || ''
  const timestamp =
    request.headers.get('x-seo-timestamp') || request.headers.get('X-Seo-Timestamp') || ''

  if (!signature || !timestamp) {
    return unauthorized('Missing signature or timestamp')
  }

  if (!verifyProviderSeoSignature(rawBody, signature, timestamp)) {
    logger.warn('provider-seo-refresh: signature rejected', {
      action: 'provider-seo-refresh-invalid-sig',
    })
    return unauthorized('Invalid signature')
  }

  // Parse + validate.
  let parsed: ProviderSeoRefreshEvent
  try {
    const json = JSON.parse(rawBody)
    parsed = bodySchema.parse(json)
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_PAYLOAD',
          message: 'Payload invalide',
          details: err instanceof Error ? err.message : undefined,
        },
      },
      { status: 400 }
    )
  }

  // Rate-limit: 100 URL-pushes per rolling minute per provider.
  // Each push is ≤3 URLs, so this caps a single provider at ~3×100=300 URLs/min.
  const rl = await rateLimitDb(`indexnow-webhook:${parsed.provider_id}`, 100, 60_000)
  if (!rl.success) {
    logger.warn('provider-seo-refresh: rate-limited', {
      action: 'provider-seo-refresh-429',
      provider_id: parsed.provider_id,
      reason: parsed.reason,
    })
    return NextResponse.json(
      {
        success: false,
        error: { code: 'RATE_LIMITED', message: 'Trop de requêtes' },
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.max(1, Math.ceil((rl.resetAt.getTime() - Date.now()) / 1000))),
        },
      }
    )
  }

  const urls = buildProviderUrls(parsed)

  if (urls.length === 0) {
    logger.info('provider-seo-refresh: no urls to push (missing specialty/city)', {
      action: 'provider-seo-refresh-skip',
      provider_id: parsed.provider_id,
      reason: parsed.reason,
    })
    return NextResponse.json({ success: true, skipped: true, reason: 'no_urls' })
  }

  // Fire-and-forget: respond immediately, let IndexNow resolve in background.
  // Any hard failure after retry is logged + surfaced via seo.success_rate=0.
  void submitUrlsWithRetry(urls, parsed.reason as ProviderSeoRefreshReason).catch((err) => {
    logger.error('provider-seo-refresh: background push crashed', err, {
      action: 'provider-seo-refresh-crash',
      provider_id: parsed.provider_id,
      reason: parsed.reason,
    })
  })

  logger.info('provider-seo-refresh: accepted', {
    action: 'provider-seo-refresh-accepted',
    provider_id: parsed.provider_id,
    reason: parsed.reason,
    urls_count: urls.length,
    'seo.event': 'indexnow.push',
  })

  return NextResponse.json({
    success: true,
    accepted: true,
    urls_count: urls.length,
    rate_remaining: rl.remaining,
  })
}

export function GET(): NextResponse {
  return NextResponse.json(
    { success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'POST requis' } },
    { status: 405, headers: { Allow: 'POST' } }
  )
}
