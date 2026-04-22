/**
 * Integration tests for UpstashRateLimiter failOpen behaviour.
 *
 * Contexte : l'ajout d'Upstash en prod (2026-04-21) a activé un chemin
 * fail-close dormant : toute erreur réseau/401/5xx d'Upstash retournait
 * `allowed:false` aux users alors que les endpoints business-critical
 * doivent basculer sur le MemoryRateLimiter.
 *
 * Ces tests simulent fetch() pour prouver :
 *   1. Upstash 401 + failOpen:true → allowed:true (fallback mémoire)
 *   2. Upstash 401 + failOpen:false → allowed:false (fail-close strict)
 *   3. Upstash network error + failOpen:true → allowed:true
 *   4. Upstash 500 + failOpen:true → allowed:true
 *   5. Upstash OK → pas de fallback, utilise la réponse Redis
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

describe('UpstashRateLimiter failOpen integration', () => {
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

    const { checkRateLimit } = await import('./rate-limiter')
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

    const { checkRateLimit } = await import('./rate-limiter')
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

    const { checkRateLimit } = await import('./rate-limiter')
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

    const { checkRateLimit } = await import('./rate-limiter')
    const result = await checkRateLimit(`test-500-open:${Math.random()}`, {
      window: 60_000,
      max: 10,
      failOpen: true,
    })

    expect(result.allowed).toBe(true)
  })

  it('Upstash OK → no fallback, result comes from Redis (count below max)', async () => {
    // Upstash REST renvoie une forme { result: <value> } pour chaque commande.
    // checkRateLimit appelle ZADD, ZREMRANGEBYSCORE, ZCARD, PEXPIRE. Seul le
    // ZCARD retourne le count ; on retourne 1 pour simuler "1 hit sur 10 max".
    global.fetch = vi.fn().mockImplementation(async (_url, init) => {
      const body = JSON.parse((init as RequestInit).body as string) as string[]
      if (body[0] === 'ZCARD') {
        return new Response(JSON.stringify({ result: 1 }), { status: 200 })
      }
      return new Response(JSON.stringify({ result: 1 }), { status: 200 })
    }) as typeof fetch

    const { checkRateLimit } = await import('./rate-limiter')
    const result = await checkRateLimit(`test-ok:${Math.random()}`, {
      window: 60_000,
      max: 10,
      failOpen: true,
    })

    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(9)
  })
})
