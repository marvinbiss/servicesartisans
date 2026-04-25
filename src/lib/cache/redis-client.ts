/**
 * Upstash Redis Cache Client — REST API (serverless-compatible)
 * Uses same UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN as rate-limiter
 *
 * Durabilité (audit 2026-04-23 suite incident Upstash 22/04) :
 *   1. AbortSignal.timeout sur CHAQUE fetch → jamais de hang qui dégrade les pages publiques
 *   2. SCAN (cursor-based) au lieu de KEYS (bloquant) pour deletePattern
 *   3. captureError Sentry throttlé (1/min) → visibilité incidents sans flood
 */
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'

const REST_URL = process.env.UPSTASH_REDIS_REST_URL
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
const isAvailable = Boolean(REST_URL && REST_TOKEN)

// Skip Redis during `next build` : cache:'no-store' fetch in generateStaticParams
// throws DynamicServerUsage, et un token mal configuré côté Vercel ferait planter
// le build entier avec HTTP 401. Cache miss → fetcher (Supabase) → OK.
const IS_BUILD_PHASE = process.env.NEXT_PHASE === 'phase-production-build'

// Timeouts Upstash — voir rate-limiter.ts pour la même politique.
// Un cache-miss SSR doit coûter < 100 ms ; au-delà de 2 s, on préfère re-fetcher
// Supabase plutôt que de faire attendre Googlebot/un user.
const UPSTASH_FETCH_TIMEOUT_MS = 2000

// Sentry throttling pour ne pas flooder pendant un incident long.
const SENTRY_THROTTLE_MS = 60_000
let lastSentryCapture = 0

function maybeCaptureUpstashError(err: unknown, extras: Record<string, unknown>) {
  const now = Date.now()
  if (now - lastSentryCapture < SENTRY_THROTTLE_MS) return
  lastSentryCapture = now
  try {
    captureError(err, {
      tags: { integration: 'upstash', component: 'cache' },
      extras,
      level: 'warning',
    })
  } catch {
    // Sentry failure must never impact the business code path
  }
}

async function redisCommand<T = unknown>(command: (string | number)[]): Promise<T | null> {
  if (!isAvailable) return null
  if (IS_BUILD_PHASE) return null
  try {
    const res = await fetch(REST_URL as string, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${REST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
      cache: 'no-store',
      signal: AbortSignal.timeout(UPSTASH_FETCH_TIMEOUT_MS),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    return json.result as T
  } catch (err) {
    // "Dynamic server usage: no-store fetch" est levée par Next.js patched fetch
    // quand on appelle Upstash pendant un rendu ISR/SSG. Le `cache: 'no-store'`
    // ci-dessus marque l'appel comme dynamique → Next.js bail. Le catch retourne
    // null → le fetcher Supabase prend le relais. C'est attendu et bénin sur
    // 459K pages crawlées par Googlebot — flood Sentry inutile.
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('Dynamic server usage')) return null

    logger.error('Redis command error', err as Error)
    maybeCaptureUpstashError(err, { command: command[0] })
    return null
  }
}

export class CacheService {
  private prefix: string

  constructor(prefix = 'sa:') {
    this.prefix = prefix
  }

  private k(key: string) {
    return `${this.prefix}${key}`
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await redisCommand<string>(['GET', this.k(key)])
    if (value === null || value === undefined) return null
    try {
      return JSON.parse(value) as T
    } catch {
      return value as unknown as T
    }
  }

  async set<T>(key: string, value: T, ttlSeconds = 3600): Promise<boolean> {
    const result = await redisCommand(['SETEX', this.k(key), ttlSeconds, JSON.stringify(value)])
    return result === 'OK'
  }

  async delete(key: string): Promise<boolean> {
    const result = await redisCommand<number>(['DEL', this.k(key)])
    return (result ?? 0) > 0
  }

  /**
   * deletePattern via SCAN (cursor-based) au lieu de KEYS.
   *
   * KEYS bloque le thread Redis sur tout le keyspace → interdit en prod
   * (voir https://redis.io/commands/keys). SCAN itère par lots, non-bloquant,
   * safe pour production.
   *
   * Hardening :
   *   - Limite le nombre d'itérations (SCAN_MAX_ITERATIONS) pour éviter un
   *     runaway si le pattern matche des millions de clés.
   *   - Limite le total de clés supprimées pour protéger Upstash.
   */
  async deletePattern(pattern: string): Promise<number> {
    const SCAN_COUNT = 500
    const SCAN_MAX_ITERATIONS = 100 // → 50 000 clés max scannées
    const MAX_DELETIONS = 10_000

    const matchPattern = this.k(pattern)
    let cursor = '0'
    let totalDeleted = 0
    let iterations = 0

    do {
      iterations++
      const result = await redisCommand<[string, string[]]>([
        'SCAN',
        cursor,
        'MATCH',
        matchPattern,
        'COUNT',
        SCAN_COUNT,
      ])
      if (!result) break
      const [nextCursor, keys] = result
      cursor = nextCursor

      if (keys && keys.length > 0) {
        const toDelete = keys.slice(0, MAX_DELETIONS - totalDeleted)
        const deleted = (await redisCommand<number>(['DEL', ...toDelete])) ?? 0
        totalDeleted += deleted
        if (totalDeleted >= MAX_DELETIONS) break
      }

      if (iterations >= SCAN_MAX_ITERATIONS) {
        logger.warn('deletePattern: SCAN_MAX_ITERATIONS reached', {
          pattern: matchPattern,
          iterations,
          totalDeleted,
        })
        break
      }
    } while (cursor !== '0')

    return totalDeleted
  }

  async getOrSet<T>(key: string, factory: () => Promise<T>, ttlSeconds = 3600): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) return cached
    const value = await factory()
    await this.set(key, value, ttlSeconds)
    return value
  }

  async increment(key: string, ttlSeconds = 3600): Promise<number> {
    const value = await redisCommand<number>(['INCR', this.k(key)])
    if (value === 1) await redisCommand(['EXPIRE', this.k(key), ttlSeconds])
    return value ?? 0
  }

  async exists(key: string): Promise<boolean> {
    const result = await redisCommand<number>(['EXISTS', this.k(key)])
    return result === 1
  }

  async ttl(key: string): Promise<number> {
    return (await redisCommand<number>(['TTL', this.k(key)])) ?? -1
  }
}

// Default cache instance
export const cache = new CacheService()

/**
 * Verrou distribué Redis (SET NX EX) — utilisé pour empêcher deux exécutions
 * concurrentes d'un cron lourd (ex: sync RGE ADEME).
 *
 * Signature :
 *   const token = await tryAcquireLock('rge:sync', 3600)
 *   if (!token) throw new Error('locked by another process')
 *   try { ... } finally { await releaseLock('rge:sync', token) }
 *
 * On stocke un token unique (crypto.randomUUID) comme valeur de la clef.
 * `releaseLock` vérifie via Lua EVAL que la valeur == token avant DEL :
 * sans ce check, un process qui dépasse le TTL puis appelle releaseLock
 * effacerait la clef nouvellement posée par un autre process → deux syncs
 * concurrents. Pattern Redis recommandé ("correct lock").
 *
 * Retour :
 *   - string (token) si lock acquis
 *   - null si détenu par un autre process ou erreur Redis transitoire
 *   - 'fail-open' si Redis absent (dev local)
 */
export async function tryAcquireLock(key: string, ttlSeconds: number): Promise<string | null> {
  if (!isAvailable) return 'fail-open' // fail-open en dev si Redis absent
  const token = crypto.randomUUID()
  const result = await redisCommand<string>([
    'SET',
    `sa:lock:${key}`,
    token,
    'NX',
    'EX',
    ttlSeconds,
  ])
  return result === 'OK' ? token : null
}

// Lua script : DEL uniquement si la valeur actuelle == token passé.
// Exécuté atomiquement côté Redis → pas de race condition check-then-del.
const RELEASE_LOCK_LUA = `
if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("DEL", KEYS[1])
else
  return 0
end
`.trim()

export async function releaseLock(key: string, token: string): Promise<void> {
  if (!isAvailable) return
  if (token === 'fail-open') return
  await redisCommand(['EVAL', RELEASE_LOCK_LUA, 1, `sa:lock:${key}`, token])
}

/**
 * Minimal RateLimiter shim — delegates to Upstash REST (sliding window)
 * Used by src/middleware/rate-limit.ts
 */
export const rateLimiter = {
  async isAllowed(
    identifier: string,
    limit: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const now = Date.now()
    const windowMs = windowSeconds * 1000
    const key = `sa:rl:${identifier}`

    try {
      await redisCommand(['ZADD', key, String(now), String(now)])
      await redisCommand(['ZREMRANGEBYSCORE', key, '0', String(now - windowMs)])
      const count = (await redisCommand<number>(['ZCARD', key])) ?? 0
      await redisCommand(['PEXPIRE', key, String(windowMs)])

      if (count > limit) {
        await redisCommand(['ZREM', key, String(now)])
        return { allowed: false, remaining: 0, resetAt: now + windowMs }
      }
      return { allowed: true, remaining: Math.max(0, limit - count), resetAt: now + windowMs }
    } catch {
      return { allowed: true, remaining: limit, resetAt: now + windowMs }
    }
  },
}

export default cache
