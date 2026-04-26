/**
 * Rate Limiter Service - ServicesArtisans
 * Uses Redis (Upstash) for distributed rate limiting in production
 * Falls back to in-memory for development
 *
 * Durabilité (audit 2026-04-23 suite incident Upstash 22/04) :
 *   1. AbortSignal.timeout(UPSTASH_FETCH_TIMEOUT_MS) sur CHAQUE fetch → jamais de hang
 *   2. Endpoint Upstash /pipeline → 4 commandes en 1 round-trip (vs 4 séquentielles)
 *   3. Circuit breaker : N échecs consécutifs → court-circuite Upstash pour X ms
 *   4. ZADD member unique (now + compteur process) → pas de dédoublonnage silencieux
 *   5. captureError Sentry throttlé (1/min) → alerting sans flood
 */

import { logger } from './logger'
import { captureError } from './monitoring/sentry'

// Types
interface RateLimitConfig {
  window: number // Time window in milliseconds
  max: number // Maximum requests in window
  failOpen?: boolean // If true, allow requests when Redis is unavailable (default: false = fail-close)
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  error?: string
}

// Environment detection
const isProduction = process.env.NODE_ENV === 'production'
const hasRedis = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

// In-memory fallback store
const memoryStore = new Map<string, { count: number; resetTime: number }>()

// ─── Durabilité Upstash ───────────────────────────────────────────────────────
// Timeouts courts : une requête rate-limit doit coûter < 50 ms p50, < 500 ms p99.
// Au-delà de 2 s, le fetch Upstash dégrade l'UX plus qu'il ne protège.
const UPSTASH_FETCH_TIMEOUT_MS = 2000

// Circuit breaker : après N échecs consécutifs, on skippe Upstash pendant
// COOLDOWN_MS → on retombe direct sur memoryLimiter (si failOpen) plutôt que
// de payer le timeout à chaque requête pendant l'incident.
const CIRCUIT_BREAKER_THRESHOLD = 3
const CIRCUIT_BREAKER_COOLDOWN_MS = 30_000
let consecutiveFailures = 0
let circuitOpenUntil = 0

// Sentry throttling : pendant un incident Upstash long, on peut générer des
// milliers d'events → 1 capture / 60 s suffit pour alerter sans flood.
const SENTRY_THROTTLE_MS = 60_000
let lastSentryCapture = 0

function maybeCaptureUpstashError(err: unknown, extras: Record<string, unknown>) {
  const now = Date.now()
  if (now - lastSentryCapture < SENTRY_THROTTLE_MS) return
  lastSentryCapture = now
  try {
    captureError(err, {
      tags: { integration: 'upstash', component: 'rate-limiter' },
      extras,
      level: 'error',
    })
  } catch {
    // Sentry failure must never impact the business code path
  }
}

// ZADD member unique dans la même ms : `${now}:${counter}` au lieu de `${now}`.
// Sans ça, deux requêtes exact même ms remplacent la même entrée dans le ZSET
// (ZADD est un SET par member) → under-counting silencieux, rate-limit bypassé.
let zaddCounter = 0
function nextZaddMember(now: number): string {
  zaddCounter = (zaddCounter + 1) % 1_000_000
  return `${now}:${zaddCounter}`
}

/**
 * Upstash Redis Rate Limiter
 * Uses REST API for serverless compatibility
 */
class UpstashRateLimiter {
  private baseUrl: string
  private token: string

  constructor() {
    this.baseUrl = process.env.UPSTASH_REDIS_REST_URL || ''
    this.token = process.env.UPSTASH_REDIS_REST_TOKEN || ''
  }

  /**
   * Single fetch, multiple Redis commands : endpoint Upstash `/pipeline` accepte
   * un tableau de commandes et renvoie un tableau de résultats. Latence divisée
   * par ~4 vs appels séquentiels.
   */
  private async pipeline(commands: string[][]): Promise<unknown[]> {
    if (Date.now() < circuitOpenUntil) {
      throw new Error('Upstash circuit breaker open')
    }

    const response = await fetch(`${this.baseUrl}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commands),
      signal: AbortSignal.timeout(UPSTASH_FETCH_TIMEOUT_MS),
    })

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        logger.error(
          `[UpstashRateLimiter] Upstash returned ${response.status} — UPSTASH_REDIS_REST_TOKEN may be invalid/expired. Verify Vercel Project Settings → Environment Variables.`
        )
      }
      throw new Error(`Redis error: ${response.status}`)
    }

    const data = (await response.json()) as Array<{ result?: unknown; error?: string }>
    // Upstash /pipeline peut renvoyer un objet d'erreur par commande sans faire
    // échouer le HTTP global → on propage la première erreur rencontrée.
    for (const entry of data) {
      if (entry?.error) {
        throw new Error(`Redis pipeline error: ${entry.error}`)
      }
    }
    return data.map((entry) => entry?.result)
  }

  async checkRateLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const now = Date.now()
    const windowKey = `ratelimit:${key}`
    const windowMs = config.window
    const member = nextZaddMember(now)

    try {
      // Sliding window : ajoute le hit, drop les périmés, compte, renouvelle TTL.
      const results = await this.pipeline([
        ['ZADD', windowKey, String(now), member],
        ['ZREMRANGEBYSCORE', windowKey, '0', String(now - windowMs)],
        ['ZCARD', windowKey],
        ['PEXPIRE', windowKey, String(windowMs)],
      ])

      // Succès Upstash → reset circuit breaker
      consecutiveFailures = 0

      const count = Number(results[2] ?? 0)
      const allowed = count <= config.max
      const remaining = Math.max(0, config.max - count)
      const resetTime = now + windowMs

      if (!allowed) {
        // Remove the request we just added since it's over limit — best effort,
        // un échec ici n'est pas bloquant (TTL nettoie de toute façon).
        try {
          await this.pipeline([['ZREM', windowKey, member]])
        } catch {
          // silent — TTL PEXPIRE garantit le nettoyage
        }
      }

      return { allowed, remaining, resetTime }
    } catch (error) {
      consecutiveFailures++
      if (consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD && Date.now() >= circuitOpenUntil) {
        circuitOpenUntil = Date.now() + CIRCUIT_BREAKER_COOLDOWN_MS
        logger.error('[UpstashRateLimiter] Circuit breaker opened', undefined, {
          consecutiveFailures,
          cooldownMs: CIRCUIT_BREAKER_COOLDOWN_MS,
        })
      }

      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error('[UpstashRateLimiter] Redis unavailable', undefined, {
        key,
        failOpen: config.failOpen === true,
        error: errorMessage,
        consecutiveFailures,
      })

      maybeCaptureUpstashError(error, {
        key,
        failOpen: config.failOpen === true,
        consecutiveFailures,
      })

      // Fail-close by default: deny requests when Redis is unavailable.
      // Only fall back to allowing requests when failOpen is explicitly true.
      if (config.failOpen === true) {
        return memoryLimiter.checkRateLimit(`fallback:${key}`, config)
      }

      return {
        allowed: false,
        remaining: 0,
        resetTime: now + config.window,
        error: 'Rate limiter unavailable',
      }
    }
  }

  async cleanup(): Promise<void> {
    // Redis handles TTL automatically
  }
}

/**
 * In-Memory Rate Limiter (development/fallback)
 */
class MemoryRateLimiter {
  checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now()
    const record = memoryStore.get(key)

    // Clean up old entries periodically
    if (memoryStore.size > 10000) {
      Array.from(memoryStore.entries()).forEach(([k, v]) => {
        if (now > v.resetTime) {
          memoryStore.delete(k)
        }
      })
    }

    // Reset if window expired
    if (!record || now > record.resetTime) {
      memoryStore.set(key, { count: 1, resetTime: now + config.window })
      return { allowed: true, remaining: config.max - 1, resetTime: now + config.window }
    }

    // Check if over limit
    if (record.count >= config.max) {
      return { allowed: false, remaining: 0, resetTime: record.resetTime }
    }

    // Increment and allow
    record.count++
    return {
      allowed: true,
      remaining: config.max - record.count,
      resetTime: record.resetTime,
    }
  }
}

// Singleton instances
let upstashLimiter: UpstashRateLimiter | null = null
const memoryLimiter = new MemoryRateLimiter()

/**
 * Get the appropriate rate limiter based on environment
 */
function getRateLimiter(): UpstashRateLimiter | MemoryRateLimiter {
  if (isProduction && hasRedis) {
    if (!upstashLimiter) {
      upstashLimiter = new UpstashRateLimiter()
    }
    return upstashLimiter
  }
  return memoryLimiter
}

/**
 * Helpers exposés pour tests + cron de santé. Permettent de vérifier l'état
 * du circuit breaker et de le forcer (test-only).
 */
export function _getCircuitBreakerState(): {
  consecutiveFailures: number
  circuitOpenUntil: number
  openNow: boolean
} {
  return {
    consecutiveFailures,
    circuitOpenUntil,
    openNow: Date.now() < circuitOpenUntil,
  }
}

export function _resetCircuitBreakerForTests(): void {
  consecutiveFailures = 0
  circuitOpenUntil = 0
  lastSentryCapture = 0
}

// Rate limit configurations per route type.
//
// POLITIQUE failOpen (2026-04-22) :
//   - `failOpen: true` pour les endpoints user-facing critiques : si Redis
//     Upstash a un glitch (latence, panne transient, rate limit Upstash propre),
//     on bascule sur le memoryLimiter au lieu de bloquer tout le business.
//     Sans ce flag, UpstashRateLimiter.checkRateLimit fail-CLOSE → toutes les
//     requêtes renvoient "Trop de requêtes" (incident 2026-04-22).
//   - `failOpen` absent (fail-close) réservé aux endpoints sensibles :
//     brute-force auth, paiements, formulaires anti-spam.
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  auth: { window: 60 * 1000, max: 10, failOpen: true }, // 10/min auth sensible (password reset, 2FA, signup) — fail-open pour aligner avec le handler, sinon le middleware bloque en 429 lors d'un glitch Redis même avec handler failOpen
  signin: { window: 60 * 1000, max: 30, failOpen: true }, // 30/min signin — ne doit JAMAIS bloquer l'admin en cas de glitch Redis
  api: { window: 60 * 1000, max: 60, failOpen: true }, // 60/min API générale — fail-open pour ne pas casser la navigation
  booking: { window: 60 * 1000, max: 30, failOpen: true }, // 30/min bookings — business-critical
  payment: { window: 60 * 1000, max: 10 }, // 10/min payments — fail-close strict (anti-fraude)
  reviews: { window: 60 * 1000, max: 5, failOpen: true }, // 5/min reviews — UX (spam géré côté modération)
  devis: { window: 60 * 1000, max: 10, failOpen: true }, // 10/min devis — BUSINESS-CRITICAL, ne doit JAMAIS bloquer
  contact: { window: 300 * 1000, max: 3, failOpen: true }, // 3/5min contact — fail-open aligné avec le handler (incident 2026-04-22 : middleware 429 en Redis glitch)
  upload: { window: 60 * 1000, max: 20, failOpen: true }, // 20/min uploads — UX
  search: { window: 60 * 1000, max: 100, failOpen: true }, // 100/min search — UX navigation
  gdpr: { window: 300 * 1000, max: 5 }, // 5/5min GDPR — fail-close (données sensibles)
  newsletter: { window: 300 * 1000, max: 3, failOpen: true }, // 3/5min newsletter — fail-open aligné avec le handler (anti-spam reste assuré par double-opt-in + Resend quotas)
  inscription: { window: 300 * 1000, max: 3, failOpen: true }, // 3/5min inscription — fail-open aligné avec le handler
  ai: { window: 60 * 1000, max: 10 }, // 10/min AI — fail-close (coûts API tiers)
  ceeEstimate: { window: 60 * 1000, max: 20, failOpen: true }, // 20 requests per minute for CEE prime estimate — fail open so tunnel devis always works
  estimation: { window: 60 * 1000, max: 15, failOpen: true }, // 15 messages per minute for estimation chat — fail open so widget always works
  estimationLead: { window: 300 * 1000, max: 3, failOpen: true }, // 3 leads per 5 minutes for estimation lead capture — fail open
  verify: { window: 60 * 1000, max: 20 }, // 20 requests per minute for SIRET/entreprise verification (external API)
  geocode: { window: 60 * 1000, max: 60 }, // 60 requests per minute for geocoding (external API)
  vapiWebhook: { window: 60 * 1000, max: 300, failOpen: true }, // 300/min for VAPI voice webhooks — fail open
  webhook: { window: 60 * 1000, max: 200, failOpen: true }, // 200/min for external webhooks (Resend, Twilio) — fail open
  cron: { window: 60 * 1000, max: 10, failOpen: true }, // 10/min for cron jobs — fail open so cron runs don't fail
  analytics: { window: 60 * 1000, max: 120, failOpen: true }, // 120/min for analytics beacons — fail open
  default: { window: 60 * 1000, max: 100 }, // 100 requests per minute default
}

/**
 * Get rate limit configuration for a given pathname
 *
 * Order matters: more specific prefixes MUST come before generic ones.
 * e.g. /api/admin/prospection/ai must match before /api/admin
 */
export function getRateLimitConfig(pathname: string): RateLimitConfig {
  // Server Actions Next 14 — appel via POST sur l'URL de page avec header
  // Next-Action. Pas de pathname /api/* donc on retombe ici via la détection
  // header dans middleware. RATE_LIMITS.api couvre raisonnablement.
  // (Gap CVE GHSA-h25m-26qc-wcjf, audit 2026-04-26.)
  if (pathname.startsWith('/_next/server-action')) return RATE_LIMITS.api

  // Auth signin — plus permissif que le bucket "auth" générique (password
  // reset, 2FA, signup). Un admin qui se trompe de mot de passe 2-3 fois
  // + reload ne doit pas être bloqué 1 minute.
  if (pathname.startsWith('/api/auth/signin')) return RATE_LIMITS.signin

  // Auth — password reset, 2FA, OAuth, signup (plus sensibles)
  if (pathname.startsWith('/api/auth')) return RATE_LIMITS.auth

  // Payments — Stripe checkout, portal, webhook
  if (pathname.startsWith('/api/payments') || pathname.startsWith('/api/stripe'))
    return RATE_LIMITS.payment

  // Cron jobs — Vercel cron triggers, must not be blocked
  if (pathname.startsWith('/api/cron')) return RATE_LIMITS.cron

  // VAPI voice webhooks — very high throughput, fail-open
  if (pathname.startsWith('/api/vapi')) return RATE_LIMITS.vapiWebhook

  // External service webhooks (Resend, Twilio) — high throughput, fail-open
  if (pathname.startsWith('/api/admin/prospection/webhooks')) return RATE_LIMITS.webhook

  // AI generation — expensive external API calls (Claude, OpenAI)
  if (pathname.startsWith('/api/admin/prospection/ai')) return RATE_LIMITS.ai

  // CEE prime estimate — public tunnel devis, fail-open
  if (pathname.startsWith('/api/cee/estimate')) return RATE_LIMITS.ceeEstimate

  // Estimation lead capture — anti-spam (must match before /api/estimation)
  if (pathname.startsWith('/api/estimation/lead')) return RATE_LIMITS.estimationLead

  // Estimation chat — 15 messages/min
  if (pathname.startsWith('/api/estimation')) return RATE_LIMITS.estimation

  // Bookings — create, cancel, reschedule
  if (pathname.startsWith('/api/bookings')) return RATE_LIMITS.booking

  // Reviews — create, vote, list
  if (pathname.startsWith('/api/reviews')) return RATE_LIMITS.reviews

  // Quotes / devis — create, list
  if (pathname.startsWith('/api/devis') || pathname.startsWith('/api/artisan/devis'))
    return RATE_LIMITS.devis

  // Contact form — sends email, unauthenticated
  if (pathname.startsWith('/api/contact')) return RATE_LIMITS.contact

  // GDPR — data export and account deletion (expensive DB operations)
  if (pathname.startsWith('/api/gdpr')) return RATE_LIMITS.gdpr

  // Newsletter — sends welcome email, unauthenticated
  if (pathname.startsWith('/api/newsletter')) return RATE_LIMITS.newsletter

  // Artisan registration — sends 2 emails, unauthenticated
  if (pathname.startsWith('/api/inscription-artisan')) return RATE_LIMITS.inscription

  // SIRET / entreprise verification — external INSEE API calls
  if (pathname.startsWith('/api/verify')) return RATE_LIMITS.verify

  // Geocoding — external address API calls
  if (pathname.startsWith('/api/geocode')) return RATE_LIMITS.geocode

  // File uploads (any route containing /upload)
  if (pathname.includes('/upload')) return RATE_LIMITS.upload

  // Analytics beacons — public, high throughput, fail-open
  if (pathname.startsWith('/api/analytics')) return RATE_LIMITS.analytics

  // Search and public listing endpoints — scraping prevention
  if (
    pathname.startsWith('/api/search') ||
    pathname.startsWith('/api/providers/listing') ||
    pathname.startsWith('/api/providers/by-city')
  )
    return RATE_LIMITS.search

  // All other API routes
  if (pathname.startsWith('/api/')) return RATE_LIMITS.api

  return RATE_LIMITS.default
}

/**
 * Generate rate limit key from request
 */
export function getRateLimitKey(ip: string, pathname: string): string {
  return `${ip}:${pathname}`
}

/**
 * Check rate limit for a request
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const limiter = getRateLimiter()

  if (limiter instanceof UpstashRateLimiter) {
    return limiter.checkRateLimit(key, config)
  }

  return limiter.checkRateLimit(key, config)
}

/**
 * Utility to extract IP from request headers.
 *
 * Si aucun header IP n'est présent (XFF/Real-IP/CF-Connecting-IP absents —
 * rare sur Vercel mais possible derrière un proxy mal configuré), on dérive
 * un fingerprint léger (UA + Accept-Language) plutôt que de retourner un
 * bucket `'unknown'` partagé par TOUS les clients anonymes — ce qui causait
 * un DoS accidentel où un seul crawler épuisait le quota pour tout le
 * trafic sans IP.
 */
export function getClientIp(headers: Headers): string {
  const ip =
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') // Cloudflare
  if (ip) return ip

  const ua = headers.get('user-agent') ?? ''
  const al = headers.get('accept-language') ?? ''
  return `anon:${hashString(`${ua}|${al}`)}`
}

// djb2 — non-crypto, edge-runtime safe (pas de dépendance Web Crypto).
function hashString(s: string): string {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i)
  return (h >>> 0).toString(36)
}

export default {
  checkRateLimit,
  getRateLimitConfig,
  getRateLimitKey,
  getClientIp,
  RATE_LIMITS,
}
