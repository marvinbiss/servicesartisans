/**
 * Tests — GET /api/v1/health/deep (`src/app/api/v1/health/deep/route.ts`).
 *
 * Couvre :
 *  - GET → 200 with status:'ok' when all checks pass
 *  - GET → 503 when supabase fails
 *  - GET → 200 with status:'degraded' when llm_keys partial
 *  - Rate limit exceeded → 429
 *  - Unexpected error → 500 + captureError called
 *  - Response body shape : checks array with name/status/latency_ms
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))
vi.mock('@/lib/monitoring/sentry', () => ({
  captureError: vi.fn(),
}))
vi.mock('@/lib/rate-limiter', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({
    allowed: true,
    remaining: 29,
    resetTime: Date.now() + 60_000,
  }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: () => ({
      select: () => ({
        limit: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  })),
}))

import { GET } from '@/app/api/v1/health/deep/route'
import { checkRateLimit } from '@/lib/rate-limiter'
import { createAdminClient } from '@/lib/supabase/admin'
import { captureError } from '@/lib/monitoring/sentry'

function buildReq(): NextRequest {
  return new NextRequest('https://servicesartisans.fr/api/v1/health/deep', {
    method: 'GET',
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(checkRateLimit).mockResolvedValue({
    allowed: true,
    remaining: 29,
    resetTime: Date.now() + 60_000,
  })
  vi.mocked(createAdminClient).mockReturnValue({
    from: () => ({
      select: () => ({
        limit: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)
  // Default : enable Upstash env so the upstash check has something to call.
  process.env.UPSTASH_REDIS_REST_URL = 'https://upstash-test.local'
  process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
  // Default LLM keys = all 3 present → ok.
  process.env.MISTRAL_API_KEY = 'm-test'
  process.env.ANTHROPIC_API_KEY = 'a-test'
  process.env.GEMINI_API_KEY = 'g-test'
  // Stub fetch globally — Upstash /ping returns 200 by default.
  globalThis.fetch = vi.fn(
    async () =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ({ ok: true, status: 200, json: async () => ({}) }) as any
  )
})

describe('GET /api/v1/health/deep', () => {
  it('returns 200 + status:ok when all checks pass', async () => {
    const res = await GET(buildReq())
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      status: string
      checks: Array<{ name: string; status: string; latency_ms: number }>
      timestamp: string
      version: string
    }
    expect(body.status).toBe('ok')
    expect(Array.isArray(body.checks)).toBe(true)
    expect(body.checks.map((c) => c.name).sort()).toEqual(['llm_keys', 'supabase', 'upstash'])
    for (const check of body.checks) {
      expect(typeof check.name).toBe('string')
      expect(['ok', 'degraded', 'fail']).toContain(check.status)
      expect(typeof check.latency_ms).toBe('number')
    }
    expect(body.version).toBe('1.0.0')
  })

  it('returns 503 when supabase ping fails', async () => {
    vi.mocked(createAdminClient).mockReturnValue({
      from: () => ({
        select: () => ({
          limit: () => Promise.resolve({ data: null, error: { message: 'connection_refused' } }),
        }),
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    const res = await GET(buildReq())
    expect(res.status).toBe(503)
    const body = (await res.json()) as {
      status: string
      checks: Array<{ name: string; status: string }>
    }
    expect(body.status).toBe('fail')
    const supabaseCheck = body.checks.find((c) => c.name === 'supabase')
    expect(supabaseCheck?.status).toBe('fail')
  })

  it('returns 200 + status:degraded when llm_keys partial', async () => {
    delete process.env.MISTRAL_API_KEY
    delete process.env.GEMINI_API_KEY
    // Only ANTHROPIC_API_KEY remains → 1/3 → degraded.
    const res = await GET(buildReq())
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      status: string
      checks: Array<{ name: string; status: string; details?: string }>
    }
    expect(body.status).toBe('degraded')
    const llm = body.checks.find((c) => c.name === 'llm_keys')
    expect(llm?.status).toBe('degraded')
    expect(llm?.details).toMatch(/1\/3/)
  })

  it('rate-limit exceeded → 429', async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 60_000,
    })
    const res = await GET(buildReq())
    expect(res.status).toBe(429)
    const body = (await res.json()) as { status: string; message: string }
    expect(body.status).toBe('rate_limit')
    expect(body.message).toMatch(/30 req\/min/)
  })

  it('unexpected error → 500 + captureError called', async () => {
    vi.mocked(checkRateLimit).mockRejectedValue(new Error('boom'))
    const res = await GET(buildReq())
    expect(res.status).toBe(500)
    const body = (await res.json()) as { status: string; message: string }
    expect(body.status).toBe('fail')
    expect(captureError).toHaveBeenCalled()
  })

  it('response sets Cache-Control + X-License + CORS headers on ok', async () => {
    const res = await GET(buildReq())
    expect(res.headers.get('cache-control')).toBe('no-store')
    expect(res.headers.get('x-license')).toBe('CC-BY-4.0')
    expect(res.headers.get('access-control-allow-origin')).toBe('*')
  })
})
