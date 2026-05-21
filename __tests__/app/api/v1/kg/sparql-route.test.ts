/**
 * Tests — POST/GET /api/v1/kg/sparql route.
 *
 * Couvre :
 *  - OPTIONS 204 + CORS headers
 *  - GET ?query=... 200
 *  - POST application/sparql-query raw body 200
 *  - POST application/x-www-form-urlencoded 200
 *  - POST application/json {query:...} 200
 *  - Missing query → 400
 *  - Query too long → 400
 *  - Malformed query → 400 parse_error
 *  - Rate limit → 429
 *  - ASK form returns valid JSON
 *  - format=csv returns text/csv
 *  - Accept: text/csv returns CSV
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
  createAdminClient: vi.fn(() => {
    const result = { data: [], error: null }
    const builder: Record<string, unknown> = {
      select() {
        return builder
      },
      eq() {
        return builder
      },
      not() {
        return builder
      },
      limit() {
        return builder
      },
      range() {
        return builder
      },
      then(
        onFulfilled?: ((v: typeof result) => unknown) | null,
        onRejected?: ((e: unknown) => unknown) | null
      ) {
        return Promise.resolve(result).then(onFulfilled ?? undefined, onRejected ?? undefined)
      },
    }
    return { from: () => builder }
  }),
}))

import { GET, POST, OPTIONS } from '@/app/api/v1/kg/sparql/route'
import { checkRateLimit } from '@/lib/rate-limiter'

const BASE_URL = 'https://servicesartisans.fr/api/v1/kg/sparql'

function buildGet(qs: string): NextRequest {
  return new NextRequest(`${BASE_URL}?${qs}`, { method: 'GET' })
}

function buildPost(body: string, headers: Record<string, string>, qs = ''): NextRequest {
  return new NextRequest(`${BASE_URL}${qs ? `?${qs}` : ''}`, {
    method: 'POST',
    headers,
    body,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(checkRateLimit).mockResolvedValue({
    allowed: true,
    remaining: 29,
    resetTime: Date.now() + 60_000,
  })
})

describe('OPTIONS /api/v1/kg/sparql', () => {
  it('returns 204 with CORS headers', async () => {
    const res = await OPTIONS()
    expect(res.status).toBe(204)
    expect(res.headers.get('access-control-allow-methods')).toContain('POST')
    expect(res.headers.get('access-control-allow-methods')).toContain('GET')
    expect(res.headers.get('x-license')).toBe('CC-BY-4.0')
  })
})

describe('GET /api/v1/kg/sparql', () => {
  it('returns 200 + JSON results for ?query=', async () => {
    const q = encodeURIComponent('SELECT ?s WHERE { ?s ?p ?o }')
    const res = await GET(buildGet(`query=${q}`))
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toMatch(/sparql-results\+json/)
    const body = (await res.json()) as {
      head: { vars: string[] }
      results: { bindings: unknown[] }
    }
    expect(body.head.vars).toEqual(['s'])
  })

  it('returns 400 when query is missing', async () => {
    const res = await GET(buildGet(''))
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('missing_query')
  })
})

describe('POST /api/v1/kg/sparql', () => {
  it('accepts application/sparql-query raw body', async () => {
    const res = await POST(
      buildPost('SELECT ?s WHERE { ?s ?p ?o }', {
        'content-type': 'application/sparql-query',
      })
    )
    expect(res.status).toBe(200)
  })

  it('accepts application/x-www-form-urlencoded', async () => {
    const body = `query=${encodeURIComponent('SELECT ?s WHERE { ?s ?p ?o }')}`
    const res = await POST(
      buildPost(body, {
        'content-type': 'application/x-www-form-urlencoded',
      })
    )
    expect(res.status).toBe(200)
  })

  it('accepts application/json body', async () => {
    const res = await POST(
      buildPost(JSON.stringify({ query: 'SELECT ?s WHERE { ?s ?p ?o }' }), {
        'content-type': 'application/json',
      })
    )
    expect(res.status).toBe(200)
  })

  it('returns 400 when query is missing in JSON body', async () => {
    const res = await POST(buildPost(JSON.stringify({}), { 'content-type': 'application/json' }))
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('missing_query')
  })

  it('returns 400 on invalid JSON', async () => {
    const res = await POST(buildPost('{not json', { 'content-type': 'application/json' }))
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('invalid_body')
  })

  it('returns 400 on malformed SPARQL', async () => {
    const res = await POST(
      buildPost(JSON.stringify({ query: 'SELECT ?s WHERE { ?s' }), {
        'content-type': 'application/json',
      })
    )
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('parse_error')
  })

  it('returns 400 when query exceeds MAX_QUERY_LEN', async () => {
    const big = 'SELECT ?s WHERE { ?s ?p "' + 'x'.repeat(4100) + '" }'
    const res = await POST(
      buildPost(JSON.stringify({ query: big }), {
        'content-type': 'application/json',
      })
    )
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('query_too_long')
  })

  it('returns 429 when rate limited', async () => {
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 60_000,
    })
    const res = await POST(
      buildPost(JSON.stringify({ query: 'SELECT ?s WHERE { ?s ?p ?o }' }), {
        'content-type': 'application/json',
      })
    )
    expect(res.status).toBe(429)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('rate_limit')
  })

  it('returns valid JSON for ASK form', async () => {
    const res = await POST(
      buildPost(JSON.stringify({ query: 'ASK { ?s ?p ?o }' }), {
        'content-type': 'application/json',
      })
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as { head: Record<string, unknown>; boolean: boolean }
    expect(body).toHaveProperty('boolean')
  })
})

describe('Format negotiation', () => {
  it('returns CSV when ?format=csv', async () => {
    const q = encodeURIComponent('SELECT ?s WHERE { ?s ?p ?o }')
    const res = await GET(buildGet(`query=${q}&format=csv`))
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toMatch(/text\/csv/)
  })

  it('returns CSV via Accept header', async () => {
    const req = new NextRequest(
      `${BASE_URL}?query=${encodeURIComponent('SELECT ?s WHERE { ?s ?p ?o }')}`,
      { method: 'GET', headers: { accept: 'text/csv' } }
    )
    const res = await GET(req)
    expect(res.headers.get('content-type')).toMatch(/text\/csv/)
  })
})
