/**
 * Helpers for the provider SEO refresh webhook.
 *
 * Surface
 * -------
 *   - verifyProviderSeoSignature(rawBody, signature, timestamp)
 *   - buildProviderUrls(event)
 *   - submitUrlsWithRetry(urls, source)
 *
 * Security (HMAC)
 * ---------------
 * HMAC-SHA256 over `${timestamp}.${rawBody}` compared in constant time.
 * Timestamp drift ≤ 5 min blocks replay. Fail-close in production if
 * INDEXNOW_WEBHOOK_SECRET is missing.
 *
 * Reliability
 * -----------
 * Failed submissions enqueue one retry row into `indexnow_dlq` (migration
 * shipped separately) — the existing `/api/cron/indexnow-submit` runs every
 * morning and can pick up DLQ rows via a follow-up cron pass. Fire-and-forget
 * here: we never block the mutating request path.
 */

import crypto from 'crypto'
import { logger } from '@/lib/logger'
import { submitToIndexNow } from '@/lib/seo/indexnow'
import { SITE_URL } from '@/lib/seo/config'
import { slugify } from '@/lib/utils'

export const PROVIDER_SEO_REFRESH_WINDOW_MS = 5 * 60 * 1000 // 5 min replay window

export type ProviderSeoRefreshReason =
  | 'provider_activated'
  | 'rge_qualifications_changed'
  | 'noindex_cleared'
  | 'cee_dossier_validated_pncee'

export interface ProviderSeoRefreshEvent {
  reason: ProviderSeoRefreshReason
  provider_id: string
  /** Resolved from providers table by caller — avoids a second DB round-trip. */
  specialty?: string | null
  city?: string | null
  slug?: string | null
  stable_id?: string | null
}

/**
 * Constant-time HMAC-SHA256 verification of the webhook body.
 * Accepts both `rawBody` and `${timestamp}.${rawBody}` digests to mirror the
 * Yousign convention already in use elsewhere in the codebase.
 */
export function verifyProviderSeoSignature(
  rawBody: string,
  signature: string,
  timestamp: string
): boolean {
  const secret = process.env.INDEXNOW_WEBHOOK_SECRET
  if (!secret || secret.length < 16) {
    logger.warn('provider-seo-refresh: INDEXNOW_WEBHOOK_SECRET missing or too short', {
      action: 'provider-seo-refresh-no-secret',
    })
    return false
  }

  if (!signature || !timestamp) return false

  const tsSec = Number(timestamp)
  if (!Number.isFinite(tsSec)) return false

  const nowSec = Math.floor(Date.now() / 1000)
  const driftSec = Math.abs(nowSec - tsSec)
  if (driftSec > PROVIDER_SEO_REFRESH_WINDOW_MS / 1000) {
    logger.warn('provider-seo-refresh: timestamp drift too large', {
      action: 'provider-seo-refresh-drift',
      driftSec,
    })
    return false
  }

  const expectedA = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  const expectedB = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex')

  // Normalise candidate hex (accept `sha256=...` prefix).
  const provided = signature.replace(/^sha256=/i, '').trim()
  const sigBuf = Buffer.from(provided, 'hex')
  if (sigBuf.length !== 32) return false

  for (const expected of [expectedA, expectedB]) {
    const expBuf = Buffer.from(expected, 'hex')
    try {
      if (crypto.timingSafeEqual(sigBuf, expBuf)) return true
    } catch {
      // length mismatch — try next candidate
    }
  }

  return false
}

/**
 * Build the list of URLs affected by a provider change.
 *
 * Returns **absolute** URLs (including SITE_URL). Empty array if the event
 * is under-specified (missing specialty/city) — IndexNow won't be called in
 * that case.
 */
export function buildProviderUrls(event: ProviderSeoRefreshEvent): string[] {
  const { specialty, city, slug, stable_id } = event
  if (!specialty || !city) return []

  const serviceSlug = slugify(specialty)
  const citySlug = slugify(city)
  if (!serviceSlug || !citySlug) return []

  const publicId = slug || stable_id
  const urls: string[] = [
    `${SITE_URL}/services/${serviceSlug}/${citySlug}`,
    `${SITE_URL}/villes/${citySlug}`,
  ]
  if (publicId) {
    urls.push(`${SITE_URL}/services/${serviceSlug}/${citySlug}/${publicId}`)
  }
  // Dedup without allocating a Set for 2–3 items.
  return Array.from(new Set(urls))
}

export interface SubmitWithRetryResult {
  submitted: number
  attempts: number
  success: boolean
  error?: string
}

/**
 * Submit URLs via the existing IndexNow helper with a single retry pass.
 * Never throws — failures are logged and returned in the result so the caller
 * can enqueue a DLQ row.
 */
export async function submitUrlsWithRetry(
  urls: string[],
  source: ProviderSeoRefreshReason
): Promise<SubmitWithRetryResult> {
  if (urls.length === 0) {
    return { submitted: 0, attempts: 0, success: true }
  }

  let lastError: string | undefined
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = await submitToIndexNow(urls)
      if (result.success) {
        logger.info('provider-seo-refresh: indexnow push ok', {
          action: 'provider-seo-refresh-ok',
          reason: source,
          submitted: result.submitted,
          attempts: attempt,
          'seo.event': 'indexnow.push',
        })
        return { submitted: result.submitted, attempts: attempt, success: true }
      }
      lastError = result.error
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err)
    }
    // backoff: 250ms between attempt 1 and 2
    if (attempt === 1) await new Promise((r) => setTimeout(r, 250))
  }

  logger.error('provider-seo-refresh: indexnow push failed after retries', undefined, {
    action: 'provider-seo-refresh-fail',
    reason: source,
    urls_count: urls.length,
    error: lastError,
    'seo.event': 'indexnow.push',
    'seo.success_rate': 0,
  })
  return { submitted: 0, attempts: 2, success: false, error: lastError }
}
