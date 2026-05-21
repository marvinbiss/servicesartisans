/**
 * HMAC-signed webhook delivery for RGE-OS pillar 8.
 *
 * Signature scheme :
 *   header :  X-SA-Signature: v1,t=<unix>,sig=<hex>
 *   data   :  `${SIGNATURE_VERSION}.${timestamp}.${body}`
 *   algo   :  HMAC-SHA256 (hex), keyed by per-webhook `secret`
 *
 * Verification :
 *   - `crypto.timingSafeEqual` to avoid leaking secret via response time.
 *   - 5-min replay window (`toleranceSeconds = 300`) so a captured request
 *     can't be replayed weeks later.
 *
 * Delivery :
 *   - Single-shot POST, 10s `AbortController` timeout.
 *   - Retry + DLQ are deferred to v0.2 (cron worker scans
 *     `rge_os_webhook_deliveries.status IS NULL OR status >= 500` and
 *     re-fires with exponential backoff). Locking this in v0.1 keeps the
 *     surface tiny and lets integrators validate their endpoint logic
 *     before we add operational complexity.
 *
 * Why no `Authorization: Bearer ...` : webhooks travel over the public
 * internet to URLs we don't control. A static bearer leaks on the first
 * compromised TLS-stripping middlebox. HMAC + replay window means even
 * if the whole request is recorded, the attacker can't replay it (>5min)
 * and can't tamper the body without invalidating the signature.
 */

import crypto from 'node:crypto'

import { logger } from '@/lib/logger'

const SIGNATURE_VERSION = 'v1'
const DELIVERY_TIMEOUT_MS = 10_000

export type DeliveryResult = {
  status: number | null
  duration_ms: number
  body_excerpt: string
  error: string | null
}

export function signPayload(secret: string, timestamp: string, body: string): string {
  const data = `${SIGNATURE_VERSION}.${timestamp}.${body}`
  const hmac = crypto.createHmac('sha256', secret).update(data).digest('hex')
  return `${SIGNATURE_VERSION},t=${timestamp},sig=${hmac}`
}

export function verifyPayloadSignature(
  secret: string,
  timestamp: string,
  body: string,
  header: string,
  toleranceSeconds = 300
): boolean {
  // header looks like : `v1,t=1716301200,sig=abcdef...`
  // We skip parts[0] (version) and parse `k=v` from the rest.
  const segments = header.split(',').slice(1)
  const parts: Record<string, string> = {}
  for (const seg of segments) {
    const idx = seg.indexOf('=')
    if (idx <= 0) continue
    const k = seg.slice(0, idx).trim()
    const v = seg.slice(idx + 1).trim()
    parts[k] = v
  }
  const sig = parts.sig
  if (!sig) return false

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${SIGNATURE_VERSION}.${timestamp}.${body}`)
    .digest('hex')
  if (sig.length !== expected.length) return false

  let a: Buffer
  let b: Buffer
  try {
    a = Buffer.from(sig, 'hex')
    b = Buffer.from(expected, 'hex')
  } catch {
    return false
  }
  if (a.length !== b.length) return false
  if (!crypto.timingSafeEqual(a, b)) return false

  const t = Number(timestamp)
  if (!Number.isFinite(t)) return false
  const now = Math.floor(Date.now() / 1000)
  return Math.abs(now - t) <= toleranceSeconds
}

export async function deliverWebhook(
  url: string,
  secret: string,
  event: string,
  payload: unknown
): Promise<DeliveryResult> {
  const start = Date.now()
  const ts = Math.floor(start / 1000)
  const body = JSON.stringify({ event, payload, ts })
  const timestamp = String(ts)
  const signature = signPayload(secret, timestamp, body)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), DELIVERY_TIMEOUT_MS)
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SA-Signature': signature,
        'X-SA-Event': event,
        'User-Agent': 'sa-rge-os-webhooks/0.1.0',
      },
      body,
      signal: controller.signal,
    })
    let text = ''
    try {
      text = await response.text()
    } catch {
      // body read failure — keep status, no excerpt.
    }
    return {
      status: response.status,
      duration_ms: Date.now() - start,
      body_excerpt: text.slice(0, 500),
      error: null,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.warn('webhooks.delivery.failed', { url, event, error: message })
    return {
      status: null,
      duration_ms: Date.now() - start,
      body_excerpt: '',
      error: message,
    }
  } finally {
    clearTimeout(timer)
  }
}

export function generateSecret(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function generateApiKey(): string {
  return `sa_wh_${crypto.randomBytes(24).toString('hex')}`
}

export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex')
}
