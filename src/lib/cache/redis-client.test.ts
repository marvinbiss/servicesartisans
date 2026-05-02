/**
 * Circuit breaker regression tests — pour le fix 401-storm Upstash 2026-04-25.
 *
 * Le module redis-client garde son état (consecutiveAuthFailures, circuitOpenedAt)
 * en module-scope. Pour le tester sans tout refactorer, on mock fetch et on
 * réimporte le module à chaque test via vi.resetModules().
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/lib/monitoring/sentry', () => ({
  captureError: vi.fn(),
}))

const ORIG_URL = process.env.UPSTASH_REDIS_REST_URL
const ORIG_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

beforeEach(() => {
  vi.resetModules()
  process.env.UPSTASH_REDIS_REST_URL = 'https://fake-upstash.example.com'
  process.env.UPSTASH_REDIS_REST_TOKEN = 'fake-token'
  delete process.env.NEXT_PHASE
})

afterEach(() => {
  if (ORIG_URL === undefined) delete process.env.UPSTASH_REDIS_REST_URL
  else process.env.UPSTASH_REDIS_REST_URL = ORIG_URL
  if (ORIG_TOKEN === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN
  else process.env.UPSTASH_REDIS_REST_TOKEN = ORIG_TOKEN
  vi.restoreAllMocks()
})

describe('redis-client circuit breaker', () => {
  it('returns null silently when circuit is open after 3× HTTP 401', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({}),
    })
    vi.stubGlobal('fetch', fetchMock)

    const { cache } = await import('./redis-client')

    // 3 échecs auth → trip
    for (let i = 0; i < 3; i++) {
      const res = await cache.get('test-key')
      expect(res).toBeNull()
    }
    expect(fetchMock).toHaveBeenCalledTimes(3)

    // 4ème appel : circuit ouvert → 0 fetch
    const res = await cache.get('test-key')
    expect(res).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('does not trip on 4xx client errors (404)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    })
    vi.stubGlobal('fetch', fetchMock)

    const { cache } = await import('./redis-client')

    for (let i = 0; i < 5; i++) await cache.get('test-key')
    // Pas de circuit → tous les fetchs partent
    expect(fetchMock).toHaveBeenCalledTimes(5)
  })

  it('trips on 3× HTTP 500', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    })
    vi.stubGlobal('fetch', fetchMock)

    const { cache } = await import('./redis-client')

    for (let i = 0; i < 3; i++) await cache.get('test-key')
    expect(fetchMock).toHaveBeenCalledTimes(3)

    await cache.get('test-key')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('resets the failure counter after a successful response', async () => {
    let call = 0
    const fetchMock = vi.fn().mockImplementation(async () => {
      call++
      if (call <= 2) return { ok: false, status: 401, json: async () => ({}) }
      // Success
      return { ok: true, status: 200, json: async () => ({ result: 'OK' }) }
    })
    vi.stubGlobal('fetch', fetchMock)

    const { cache } = await import('./redis-client')

    await cache.get('a') // 401
    await cache.get('b') // 401
    await cache.set('c', { x: 1 }) // success → reset

    // Re-déclenche 2× 401 ; le compteur a été reset, donc circuit reste fermé
    const fetchMock2 = vi
      .fn()
      .mockImplementation(async () => ({ ok: false, status: 401, json: async () => ({}) }))
    vi.stubGlobal('fetch', fetchMock2)
    await cache.get('d')
    await cache.get('e')
    // 2 fetchs (pas trip, on est sous le seuil de 3)
    expect(fetchMock2).toHaveBeenCalledTimes(2)
  })

  it('reopens after CIRCUIT_OPEN_MS expires (half-open) and trips again on persistent failure', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({}),
    })
    vi.stubGlobal('fetch', fetchMock)

    const { cache } = await import('./redis-client')

    for (let i = 0; i < 3; i++) await cache.get('a') // trip
    await cache.get('b') // circuit ouvert
    expect(fetchMock).toHaveBeenCalledTimes(3)

    // Avance de 60s+1ms → circuit half-open
    vi.advanceTimersByTime(60_001)

    await cache.get('c') // half-open → laisse passer le ping → re-trip
    expect(fetchMock).toHaveBeenCalledTimes(4)

    await cache.get('d') // ré-ouvert → bloqué
    expect(fetchMock).toHaveBeenCalledTimes(4)

    vi.useRealTimers()
  })
})

describe('rateLimiter shim (fixed-window INCR + EXPIRE)', () => {
  it('uses INCR + PEXPIRE — never ZADD (immune au NOPERM zadd)', async () => {
    const calls: Array<string[]> = []
    const fetchMock = vi.fn().mockImplementation(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body)) as string[]
      calls.push(body)
      // 1ère commande = INCR → retourne le compteur (1, puis 2, etc.)
      // 2ème commande = PEXPIRE → retourne 1
      const cmd = body[0]
      if (cmd === 'INCR')
        return {
          ok: true,
          status: 200,
          json: async () => ({ result: calls.filter((b) => b[0] === 'INCR').length }),
        }
      if (cmd === 'PEXPIRE') return { ok: true, status: 200, json: async () => ({ result: 1 }) }
      throw new Error(`Unexpected Redis command in test: ${cmd}`)
    })
    vi.stubGlobal('fetch', fetchMock)

    const { rateLimiter } = await import('./redis-client')

    const r1 = await rateLimiter.isAllowed('test:user', 5, 60)
    expect(r1.allowed).toBe(true)
    expect(r1.remaining).toBe(4)

    // Aucune commande envoyée ne doit être un ZADD/ZREMRANGEBYSCORE/ZCARD/ZREM
    const verbs = calls.map((c) => c[0])
    expect(verbs).not.toContain('ZADD')
    expect(verbs).not.toContain('ZREMRANGEBYSCORE')
    expect(verbs).not.toContain('ZCARD')
    expect(verbs).not.toContain('ZREM')

    // Doit contenir au moins 1 INCR + 1 PEXPIRE (sur la 1ère INCR du bucket)
    expect(verbs).toContain('INCR')
    expect(verbs).toContain('PEXPIRE')
  })

  it('fail-open quand Redis throw (jamais bloquer un user sur infra)', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('NOPERM whatever'))
    vi.stubGlobal('fetch', fetchMock)

    const { rateLimiter } = await import('./redis-client')

    // L'invariant clé : `allowed: true` même si Redis est down (fail-open).
    // Le `remaining` peut varier selon le path catch (try-catch outer vs
    // redisCommand qui swallow → INCR=null → count=1 → remaining=limit-1).
    // L'important est qu'aucun user ne soit bloqué par un problème infra.
    const r = await rateLimiter.isAllowed('test:user', 5, 60)
    expect(r.allowed).toBe(true)
  })
})
