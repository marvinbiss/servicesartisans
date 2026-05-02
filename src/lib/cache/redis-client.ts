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
// Audit 2026-05-02 : Vercel CDG1 (Paris) tape une DB Upstash hors-EU
// (probablement US ou ASIA) → latency réseau pic à 2-3s sous charge ⇒ ~17
// timeouts/h résiduels après tous les autres fix. Bumped de 2000 → 3500 ms.
// Compromis : un cache-miss SSR coûte au pire 3.5s avant fallback Supabase
// (Googlebot tolère ≤4s avant abandon de fetch), mais on supprime ~80% des
// timeouts. À reduire à 1500 ms après migration de la DB en `eu-central-1`.
const UPSTASH_FETCH_TIMEOUT_MS = 3500

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

// Circuit breaker — un token Upstash invalide (HTTP 401) ou un endpoint qui
// renvoie 5xx en boucle ne se "répare" pas tout seul ; tant qu'il faut
// régénérer le token côté Upstash + Vercel, chaque cache-miss SSR paye 2s
// d'AbortSignal pour rien sur 459K pages crawlées par Googlebot.
//
// Stratégie : après CIRCUIT_THRESHOLD échecs auth/serveur consécutifs, on
// ouvre le circuit pour CIRCUIT_OPEN_MS → redisCommand renvoie null sans
// fetch. À l'expiration, on tente UN ping (half-open) ; succès → reset, échec
// → re-ouverture pour CIRCUIT_OPEN_MS.
const CIRCUIT_THRESHOLD = 3
const CIRCUIT_OPEN_MS = 60_000
let consecutiveAuthFailures = 0
let circuitOpenedAt = 0

function isCircuitOpen(): boolean {
  if (circuitOpenedAt === 0) return false
  if (Date.now() - circuitOpenedAt < CIRCUIT_OPEN_MS) return true
  // Half-open : laisse passer la prochaine requête ; reset() ou trip() suivra
  circuitOpenedAt = 0
  return false
}

function tripCircuit(reason: string) {
  if (circuitOpenedAt === 0) {
    circuitOpenedAt = Date.now()
    logger.error('Upstash circuit breaker opened', undefined, {
      reason,
      consecutiveAuthFailures,
      reopenInMs: CIRCUIT_OPEN_MS,
    })
  }
}

function resetCircuit() {
  consecutiveAuthFailures = 0
  circuitOpenedAt = 0
}

async function redisCommand<T = unknown>(command: (string | number)[]): Promise<T | null> {
  if (!isAvailable) return null
  if (IS_BUILD_PHASE) return null
  if (isCircuitOpen()) return null
  try {
    // Pas de directive de cache. `cache: 'no-store'` ET `next: { revalidate: 0 }`
    // sont équivalents et déclenchent "Dynamic server usage" sur les rendus
    // ISR/SSG (459K pages), ce qui spamme les logs et fait crasher certaines
    // pages en 500. Pour un POST, Next.js ne cache rien par défaut, donc rien
    // à opter-out. Cf. src/lib/rate-limiter.ts qui suit le même pattern sans
    // bug observé depuis l'incident Upstash 22/04.
    const res = await fetch(REST_URL as string, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${REST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
      signal: AbortSignal.timeout(UPSTASH_FETCH_TIMEOUT_MS),
    })
    if (!res.ok) {
      // Auth (401/403) ou server error (5xx) = compte vers le circuit.
      // 4xx clients (404/410) sont rares pour une commande Redis et ne devraient
      // pas trip le breaker (ne va pas se résoudre côté ops).
      if (res.status === 401 || res.status === 403 || res.status >= 500) {
        consecutiveAuthFailures++
        if (consecutiveAuthFailures >= CIRCUIT_THRESHOLD) {
          tripCircuit(`HTTP ${res.status}`)
        }
      }
      throw new Error(`HTTP ${res.status}`)
    }
    const json = await res.json()
    if (consecutiveAuthFailures > 0) resetCircuit()
    return json.result as T
  } catch (err) {
    // "Dynamic server usage: no-store fetch" est levée par Next.js patched fetch
    // quand on appelle Upstash pendant un rendu ISR/SSG. Le `cache: 'no-store'`
    // ci-dessus marque l'appel comme dynamique → Next.js bail. Le catch retourne
    // null → le fetcher Supabase prend le relais. C'est attendu et bénin sur
    // 459K pages crawlées par Googlebot — flood Sentry inutile.
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('Dynamic server usage')) return null

    // Quand le circuit est ouvert on a déjà loggé l'incident — ne pas re-logger
    // chaque appel. tripCircuit() ne logge qu'une fois.
    //
    // logger.warn (non logger.error) : ces timeouts sont absorbés par le caller
    // (return null → fail-open Supabase). Avec logger.error → Sentry capture
    // automatiquement (audit 2026-04-30), on flood Sentry de N events / min sur
    // un incident Upstash long. La visibilité Sentry reste garantie par
    // maybeCaptureUpstashError ci-dessous (throttlé 1/min).
    if (!isCircuitOpen()) {
      logger.warn('Redis command error (absorbed, fail-open)', {
        error: err instanceof Error ? err.message : String(err),
        command: command[0],
      })
      maybeCaptureUpstashError(err, { command: command[0] })
    }
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
 * Minimal RateLimiter shim — fixed-window via INCR + EXPIRE.
 *
 * Used by :
 *   - src/middleware/rate-limit.ts
 *   - src/app/api/prospection/optout/route.ts
 *
 * 2026-05-02 — switch from sliding-window ZADD/ZCARD/PEXPIRE → fixed-window
 * INCR + EXPIRE pour 3 raisons :
 *
 *   1. NOPERM zadd (Sentry NEXTJS-87 / 6N / 5B partiel) : le user Redis
 *      `default` du token Upstash actif n'a pas la permission `+zadd`
 *      (ACL restreinte côté Upstash backend, indépendante du token UI).
 *      INCR + EXPIRE sont des commandes core supportées par toutes les
 *      ACL Redis, donc immunes à ce type de restriction.
 *
 *   2. Bug silent under-count : la version ZADD passait `now` comme score
 *      ET comme member (`['ZADD', key, String(now), String(now)]`). En
 *      Redis, ZADD avec un member existant override le score sans rien
 *      ajouter au cardinal. Conséquence : 100 requêtes à la même ms ne
 *      comptent que pour 1 → rate-limit bypassé. Cf rate-limiter.ts:71-77
 *      qui décrit ce piège et le contourne avec un counter unique.
 *
 *   3. Performance : 1 round-trip Upstash REST au lieu de 4 (ZADD +
 *      ZREMRANGEBYSCORE + ZCARD + PEXPIRE) → divise par ~4 la latence.
 *
 * Approximation acceptée : fixed-window (vs sliding) → un client peut
 * burster 2x la limite à la frontière d'une window. Pour les cas d'usage
 * (optout DSAR + middleware throttle anti-spam) c'est négligeable.
 *
 * Pour un rate-limiting précis sliding-window, utiliser `checkRateLimit`
 * de `src/lib/rate-limiter.ts` (qui garde le pipeline ZADD avec member
 * unique, à utiliser quand l'ACL Upstash sera corrigée).
 */
export const rateLimiter = {
  async isAllowed(
    identifier: string,
    limit: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const now = Date.now()
    const windowMs = windowSeconds * 1000
    // Bucket basé sur la window : `sa:rl:<id>:<bucketStart>` → expire seul.
    const bucketStart = Math.floor(now / windowMs) * windowMs
    const key = `sa:rl:${identifier}:${bucketStart}`
    const resetAt = bucketStart + windowMs

    try {
      const count = (await redisCommand<number>(['INCR', key])) ?? 1
      // EXPIRE seulement à la 1ère INCR (count=1) — économise les writes.
      // Si Redis perd le TTL (rare), pire cas = clé persiste 1 window de plus.
      if (count === 1) {
        await redisCommand(['PEXPIRE', key, String(windowMs)])
      }

      if (count > limit) {
        return { allowed: false, remaining: 0, resetAt }
      }
      return { allowed: true, remaining: Math.max(0, limit - count), resetAt }
    } catch {
      // Fail-open : Redis indispo → on laisse passer, jamais blocker un
      // user sur un problème infra. Sentry capture déjà via redisCommand.
      return { allowed: true, remaining: limit, resetAt }
    }
  },
}

export default cache
