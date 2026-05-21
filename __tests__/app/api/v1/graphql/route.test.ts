/**
 * Tests — POST /api/v1/graphql route (`src/app/api/v1/graphql/route.ts`)
 *
 * Couvre :
 *  - GET 200 + endpoint metadata + SDL preview + root_fields
 *  - OPTIONS 204 + CORS headers
 *  - POST {} → 400 (missing query)
 *  - POST {query:""} → 400
 *  - POST {query: <8001 chars>} → 400
 *  - POST <invalid JSON> → 400
 *  - POST {query: "malformed"} → 400 parse error
 *  - POST valid query → 200 + data
 *  - Rate limit exceeded → 429
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
    remaining: 59,
    resetTime: Date.now() + 60_000,
  }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            eq: () => ({
              limit: () => Promise.resolve({ data: [], error: null }),
            }),
          }),
          ilike: () => ({
            not: () => ({
              eq: () => ({
                eq: () => ({
                  limit: () => Promise.resolve({ data: [], error: null }),
                }),
              }),
            }),
          }),
        }),
      }),
    }),
  })),
}))

import { GET, POST, OPTIONS } from '@/app/api/v1/graphql/route'
import { checkRateLimit } from '@/lib/rate-limiter'

function buildPost(body: unknown, opts: { raw?: string } = {}): NextRequest {
  const url = 'https://servicesartisans.fr/api/v1/graphql'
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: opts.raw ?? JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(checkRateLimit).mockResolvedValue({
    allowed: true,
    remaining: 59,
    resetTime: Date.now() + 60_000,
  })
})

describe('GET /api/v1/graphql', () => {
  it('returns 200 with endpoint metadata + SDL preview', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      endpoint: string
      rate_limit: string
      license: string
      limits: { max_query_chars: number; max_depth: number; max_fields: number }
      root_fields: string[]
      sdl_preview: string
    }
    expect(body.endpoint).toBe('/api/v1/graphql')
    expect(body.rate_limit).toMatch(/60 req\/min/)
    expect(body.license).toBe('CC-BY-4.0')
    expect(body.limits.max_query_chars).toBe(8000)
    expect(body.limits.max_depth).toBe(5)
    expect(body.limits.max_fields).toBe(20)
    expect(body.root_fields).toContain('rgeLookup')
    expect(body.root_fields).toContain('mprBareme')
    expect(body.sdl_preview).toContain('Query')
  })

  it('GET emits CORS + X-License headers', async () => {
    const res = await GET()
    expect(res.headers.get('x-license')).toBe('CC-BY-4.0')
    expect(res.headers.get('access-control-allow-origin')).toBe('*')
  })
})

describe('OPTIONS /api/v1/graphql', () => {
  it('returns 204 with CORS headers', async () => {
    const res = await OPTIONS()
    expect(res.status).toBe(204)
    expect(res.headers.get('access-control-allow-methods')).toContain('POST')
  })
})

describe('POST /api/v1/graphql — body validation', () => {
  it('returns 400 when body is not valid JSON', async () => {
    const req = buildPost({}, { raw: '{not json' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = (await res.json()) as { errors: Array<{ message: string }> }
    expect(body.errors[0]!.message).toMatch(/valid JSON/i)
  })

  it('returns 400 when query field is missing', async () => {
    const res = await POST(buildPost({ foo: 'bar' }))
    expect(res.status).toBe(400)
    const body = (await res.json()) as { errors: Array<{ message: string }> }
    expect(body.errors[0]!.message).toMatch(/Missing required field: query/)
  })

  it('returns 400 when query is empty string', async () => {
    const res = await POST(buildPost({ query: '' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when query exceeds 8000 chars', async () => {
    const big = '{' + 'a'.repeat(8200) + '}'
    const res = await POST(buildPost({ query: big }))
    expect(res.status).toBe(400)
    const body = (await res.json()) as { errors: Array<{ message: string }> }
    expect(body.errors[0]!.message).toMatch(/max length/i)
  })

  it('returns 400 on malformed GraphQL', async () => {
    const res = await POST(buildPost({ query: '{ rgeLookup(siret: "x"' }))
    expect(res.status).toBe(400)
    const body = (await res.json()) as { errors: Array<{ message: string }> }
    expect(body.errors[0]!.message).toMatch(/Parse error/)
  })
})

describe('POST /api/v1/graphql — happy path', () => {
  it('returns 200 with data envelope for valid query', async () => {
    const res = await POST(buildPost({ query: '{ cumulRules { rules { geste } } }' }))
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      data: { cumulRules: { rules: Array<{ geste: string }> } }
    }
    expect(body.data.cumulRules.rules.length).toBeGreaterThan(0)
    expect(body.data.cumulRules.rules[0]!.geste).toBeTruthy()
  })

  it('returns 200 with __schema introspection', async () => {
    const res = await POST(buildPost({ query: '{ __schema { queryType { fields { name } } } }' }))
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      data: { __schema: { queryType: { fields: Array<{ name: string }> } } }
    }
    const names = body.data.__schema.queryType.fields.map((f) => f.name)
    expect(names).toContain('mprBareme')
    expect(names).toContain('ceeBareme')
  })
})

describe('POST /api/v1/graphql — rate limit', () => {
  it('returns 429 when rate limit exceeded', async () => {
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 60_000,
    })
    const res = await POST(buildPost({ query: '{ cumulRules { rules { geste } } }' }))
    expect(res.status).toBe(429)
    const body = (await res.json()) as { errors: Array<{ message: string }> }
    expect(body.errors[0]!.message).toMatch(/Rate limit/i)
  })
})
