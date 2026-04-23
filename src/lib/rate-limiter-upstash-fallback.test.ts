/**
 * Integration tests for UpstashRateLimiter durability.
 *
 * Contexte historique :
 *   - 2026-04-22 : ajout Upstash en prod a activé un chemin fail-close dormant.
 *     Fix commit 3ab150da (failOpen aligné).
 *   - 2026-04-23 : durcissement suite audit — timeout AbortSignal, pipeline,
 *     circuit breaker, Sentry throttle, ZADD member unique.
 *
 * Ces tests couvrent :
 *   1. Upstash 401/500/network + failOpen:true → memory fallback
 *   2. Upstash 401 + failOpen:false → fail-close strict
 *   3. Upstash OK (pipeline format) → réponse Redis utilisée
 *   4. Circuit breaker : 3 échecs consécutifs → 4ème requête court-circuitée
 *   5. ZADD member unique : deux appels dans la même ms produisent des members distincts
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const ORIGINAL_ENV = { ...process.env }

function setUpstashEnv() {
  // NODE_ENV est typé readonly par @types/node, mais en runtime c'est une
  // simple propriété de process.env qu'on peut muter dans un test.
  ;(process.env as Record<string, string>).NODE_ENV = 'production'
  process.env.UPSTASH_REDIS_REST_URL = 'https://fake-upstash.example.com'
  process.env.UPSTASH_REDIS_REST_TOKEN = 'fake-token'
}

/**
 * Upstash `/pipeline` renvoie un tableau d'objets `{ result?, error? }`, un par
 * commande envoyée. Helper pour construire la réponse dans les tests OK.
 */
function mockPipelineResponse(results: unknown[]) {
  return new Response(JSON.stringify(results.map((r) => ({ result: r }))), { status: 200 })
}

describe('UpstashRateLimiter durability', () => {
  beforeEach(() => {
    setUpstashEnv()
    vi.resetModules()
  })

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
    vi.restoreAllMocks()
  })

  it('Upstash 401 + failOpen:true → allowed via memory fallback', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 })
      ) as typeof fetch

    const { checkRateLimit, _resetCircuitBreakerForTests } = await import('./rate-limiter')
    _resetCircuitBreakerForTests()
    const result = await checkRateLimit(`test-401-open:${Math.random()}`, {
      window: 60_000,
      max: 10,
      failOpen: true,
    })

    expect(result.allowed).toBe(true)
  })

  it('Upstash 401 + failOpen:false → fail-close, allowed=false', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 })
      ) as typeof fetch

    const { checkRateLimit, _resetCircuitBreakerForTests } = await import('./rate-limiter')
    _resetCircuitBreakerForTests()
    const result = await checkRateLimit(`test-401-close:${Math.random()}`, {
      window: 60_000,
      max: 10,
      // failOpen absent (défaut = fail-close)
    })

    expect(result.allowed).toBe(false)
    expect(result.error).toBe('Rate limiter unavailable')
  })

  it('Upstash network error + failOpen:true → allowed via memory fallback', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('fetch failed: ENOTFOUND')) as typeof fetch

    const { checkRateLimit, _resetCircuitBreakerForTests } = await import('./rate-limiter')
    _resetCircuitBreakerForTests()
    const result = await checkRateLimit(`test-net-open:${Math.random()}`, {
      window: 60_000,
      max: 10,
      failOpen: true,
    })

    expect(result.allowed).toBe(true)
  })

  it('Upstash 500 + failOpen:true → allowed via memory fallback', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response('Internal Server Error', { status: 500 })) as typeof fetch

    const { checkRateLimit, _resetCircuitBreakerForTests } = await import('./rate-limiter')
    _resetCircuitBreakerForTests()
    const result = await checkRateLimit(`test-500-open:${Math.random()}`, {
      window: 60_000,
      max: 10,
      failOpen: true,
    })

    expect(result.allowed).toBe(true)
  })

  it('Upstash OK (pipeline format) → no fallback, count below max', async () => {
    // checkRateLimit envoie maintenant UN seul fetch vers `/pipeline` avec
    // 4 commandes : ZADD, ZREMRANGEBYSCORE, ZCARD, PEXPIRE. La réponse est
    // un tableau de 4 `{ result: ... }`. Seul le 3ème (ZCARD) nous intéresse.
    global.fetch = vi.fn().mockImplementation(async () => {
      return mockPipelineResponse([
        1, // ZADD → 1 ajouté
        0, // ZREMRANGEBYSCORE → 0 supprimés
        1, // ZCARD → 1 hit dans la window
        1, // PEXPIRE → 1 (TTL posé)
      ])
    }) as typeof fetch

    const { checkRateLimit, _resetCircuitBreakerForTests } = await import('./rate-limiter')
    _resetCircuitBreakerForTests()
    const result = await checkRateLimit(`test-ok:${Math.random()}`, {
      window: 60_000,
      max: 10,
      failOpen: true,
    })

    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(9)
  })

  it('Upstash pipeline error par commande → throws + fallback', async () => {
    // Upstash HTTP 200 mais une commande renvoie `{ error: "WRONGTYPE" }` :
    // le code doit remonter cette erreur et basculer sur le fallback.
    global.fetch = vi.fn().mockImplementation(async () => {
      return new Response(
        JSON.stringify([
          { result: 1 },
          { error: 'WRONGTYPE Operation against a key holding wrong kind of value' },
          { result: 1 },
          { result: 1 },
        ]),
        { status: 200 }
      )
    }) as typeof fetch

    const { checkRateLimit, _resetCircuitBreakerForTests } = await import('./rate-limiter')
    _resetCircuitBreakerForTests()
    const result = await checkRateLimit(`test-pipeline-err:${Math.random()}`, {
      window: 60_000,
      max: 10,
      failOpen: true,
    })

    expect(result.allowed).toBe(true) // fallback memory
  })

  it('Circuit breaker : 3 échecs consécutifs → short-circuit au 4ème appel', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValue(new Error('fetch failed: ENOTFOUND')) as typeof fetch
    global.fetch = fetchMock

    const { checkRateLimit, _resetCircuitBreakerForTests, _getCircuitBreakerState } =
      await import('./rate-limiter')
    _resetCircuitBreakerForTests()

    // 3 échecs consécutifs pour armer le circuit breaker
    for (let i = 0; i < 3; i++) {
      await checkRateLimit(`test-cb:${i}`, { window: 60_000, max: 10, failOpen: true })
    }

    expect(_getCircuitBreakerState().openNow).toBe(true)

    const fetchCallsBeforeShortCircuit = (fetchMock as unknown as ReturnType<typeof vi.fn>).mock
      .calls.length

    // 4ème appel : circuit ouvert → ne doit PAS appeler fetch Upstash
    const result = await checkRateLimit('test-cb:short', {
      window: 60_000,
      max: 10,
      failOpen: true,
    })

    expect(result.allowed).toBe(true) // fallback memory
    const fetchCallsAfter = (fetchMock as unknown as ReturnType<typeof vi.fn>).mock.calls.length
    expect(fetchCallsAfter).toBe(fetchCallsBeforeShortCircuit) // aucun fetch supplémentaire
  })

  it('ZADD member unique : 2 appels consécutifs produisent des members distincts', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => {
      return mockPipelineResponse([1, 0, 1, 1])
    }) as typeof fetch
    global.fetch = fetchMock

    const { checkRateLimit, _resetCircuitBreakerForTests } = await import('./rate-limiter')
    _resetCircuitBreakerForTests()

    await checkRateLimit('test-zadd:1', { window: 60_000, max: 10, failOpen: true })
    await checkRateLimit('test-zadd:1', { window: 60_000, max: 10, failOpen: true })

    const calls = (fetchMock as unknown as ReturnType<typeof vi.fn>).mock.calls
    expect(calls.length).toBeGreaterThanOrEqual(2)

    // Extraire le ZADD member de chaque appel (4ème élément de la 1ère commande)
    const members = calls.map((call) => {
      const body = JSON.parse((call[1] as RequestInit).body as string) as string[][]
      return body[0][3] // ZADD windowKey score member
    })

    // Les members DOIVENT être distincts, sinon under-counting silencieux.
    expect(new Set(members).size).toBe(members.length)
  })

  it('Fetch timeout (AbortSignal) + failOpen:true → allowed via memory fallback', async () => {
    // Simule un AbortError remonté par AbortSignal.timeout()
    const abortErr = new Error('The operation was aborted')
    abortErr.name = 'AbortError'
    global.fetch = vi.fn().mockRejectedValue(abortErr) as typeof fetch

    const { checkRateLimit, _resetCircuitBreakerForTests } = await import('./rate-limiter')
    _resetCircuitBreakerForTests()

    const result = await checkRateLimit(`test-timeout:${Math.random()}`, {
      window: 60_000,
      max: 10,
      failOpen: true,
    })

    expect(result.allowed).toBe(true)
  })
})
