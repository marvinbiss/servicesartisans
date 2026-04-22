/**
 * Upstash Redis Cache Client — REST API (serverless-compatible)
 * Uses same UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN as rate-limiter
 */
import { logger } from '@/lib/logger'

const REST_URL = process.env.UPSTASH_REDIS_REST_URL
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
const isAvailable = Boolean(REST_URL && REST_TOKEN)

// Skip Redis during `next build` : cache:'no-store' fetch in generateStaticParams
// throws DynamicServerUsage, et un token mal configuré côté Vercel ferait planter
// le build entier avec HTTP 401. Cache miss → fetcher (Supabase) → OK.
const IS_BUILD_PHASE = process.env.NEXT_PHASE === 'phase-production-build'

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
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    return json.result as T
  } catch (err) {
    logger.error('Redis command error', err as Error)
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

  async deletePattern(pattern: string): Promise<number> {
    const keys = await redisCommand<string[]>(['KEYS', this.k(pattern)])
    if (!keys || keys.length === 0) return 0
    const result = await redisCommand<number>(['DEL', ...keys])
    return result ?? 0
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
