/**
 * In-memory LRU rate limiter for CEE partner routes.
 *
 * Design
 * ------
 * - Per-process, per-key sliding window counter. Sufficient for a single
 *   Vercel function instance. Does NOT attempt cross-instance coordination —
 *   in serverless, each cold instance has its own map. Failure mode is
 *   graceful (a few extra requests get through when instances are hot-swapped,
 *   never a DoS gate).
 * - LRU cap (2000 entries) to bound memory footprint.
 * - Zero external dependencies (no Redis / Upstash required).
 *
 * Usage
 * -----
 *   const rl = checkRateLimit(`cee:iban:${userId}`, { max: 3, windowMs: 60_000 })
 *   if (!rl.allowed) return NextResponse.json(..., { status: 429 })
 */

export interface RateLimitOptions {
  /** Max number of requests allowed inside the window. */
  max: number
  /** Window size in milliseconds. */
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetMs: number
}

interface Bucket {
  /** Epoch ms timestamps of recent requests. */
  hits: number[]
}

const LRU_CAP = 2000
const store = new Map<string, Bucket>()

function touch(key: string, bucket: Bucket): void {
  // Refresh LRU ordering: delete then set moves it to tail.
  store.delete(key)
  store.set(key, bucket)

  // Evict oldest if over cap.
  if (store.size > LRU_CAP) {
    const oldestKey = store.keys().next().value
    if (typeof oldestKey === 'string') {
      store.delete(oldestKey)
    }
  }
}

/**
 * Check whether an action is allowed under the rate limit.
 * Records the hit atomically (if allowed) so the second call within the
 * window sees the updated count.
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  const { max, windowMs } = options
  const now = Date.now()
  const windowStart = now - windowMs

  const existing = store.get(key)
  const bucket: Bucket = existing ? existing : { hits: [] }

  // Drop expired hits.
  bucket.hits = bucket.hits.filter((t) => t > windowStart)

  if (bucket.hits.length >= max) {
    const oldest = bucket.hits[0] ?? now
    const resetMs = Math.max(0, oldest + windowMs - now)
    touch(key, bucket)
    return { allowed: false, remaining: 0, resetMs }
  }

  bucket.hits.push(now)
  touch(key, bucket)
  return {
    allowed: true,
    remaining: Math.max(0, max - bucket.hits.length),
    resetMs: windowMs,
  }
}

/**
 * Test-only helper — reset the in-memory store between tests.
 * Not exported for public use but available via module boundary in vitest.
 */
export function _resetRateLimitStoreForTests(): void {
  store.clear()
}
