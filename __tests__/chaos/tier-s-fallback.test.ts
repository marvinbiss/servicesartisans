/**
 * Chaos tests — Tier S routes (revenue/SEO critical) sous panne Supabase
 *
 * Pourquoi : SLA-99.9 dépend de la capacité des handlers à fallback gracieusement
 * quand l'amont (Supabase) hang ou crashe. On simule des pannes (timeout, 5xx)
 * et on vérifie que :
 *   - Le handler répond en <6s (budget timeout 5s + 1s overhead)
 *   - Aucun 5xx visible côté SEO (préserve ranking Google)
 *   - Sentry capturé pour alerting
 *
 * Routes testées :
 *   1. /api/v1/rge/lookup     → fallback 200 not_found cacheable
 *   2. /api/v1/rge/search     → fallback 200 results:[] cacheable
 *   3. /api/providers/listing → fallback 200 providers:[] cacheable
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- Mocks (avant les imports de routes) ---

// Rate-limit mock = always allow (chaos focus = upstream, pas RL).
vi.mock('@/lib/rate-limiter', () => ({
  checkRateLimit: vi.fn(() =>
    Promise.resolve({ allowed: true, limit: 600, remaining: 599, resetTime: Date.now() + 60_000 })
  ),
  getClientIp: vi.fn(() => '127.0.0.1'),
}))

const captureErrorMock = vi.fn()
vi.mock('@/lib/monitoring/sentry', () => ({
  captureError: captureErrorMock,
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

// Supabase admin mock — le builder retourne une promise qui hang ou reject
// selon le mode chaos sélectionné.
type ChaosMode = 'hang' | 'error_5xx' | 'normal'
let chaosMode: ChaosMode = 'normal'
let chaosNormalData: { data: unknown; error: unknown; count?: number | null } = {
  data: [],
  error: null,
  count: 0,
}

function makeChaosBuilder(): Record<string, unknown> {
  const builder: Record<string, unknown> = {}
  const passthrough = () => builder
  builder.select = passthrough
  builder.eq = passthrough
  builder.not = passthrough
  builder.gte = passthrough
  builder.lte = passthrough
  builder.ilike = passthrough
  builder.or = passthrough
  builder.order = passthrough
  builder.range = passthrough
  builder.limit = passthrough
  builder.single = passthrough
  builder.maybeSingle = passthrough

  // Thenable (Supabase shape) — comportement selon chaosMode.
  builder.then = (onFulfilled?: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) => {
    if (chaosMode === 'hang') {
      // Hang for 30s — withTimeout(5s) doit kicker avant.
      return new Promise(() => {}).then(onFulfilled, onRejected)
    }
    if (chaosMode === 'error_5xx') {
      return Promise.resolve({
        data: null,
        error: { code: 'PGRST500', message: 'Internal server error' },
      }).then(onFulfilled, onRejected)
    }
    return Promise.resolve(chaosNormalData).then(onFulfilled, onRejected)
  }

  return builder
}

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => makeChaosBuilder(),
  }),
}))

// Helpers Supabase utilisés par /api/providers/listing.
vi.mock('@/lib/supabase', () => ({
  getProvidersByServiceAndLocation: vi.fn(async (..._args: unknown[]) => {
    if (chaosMode === 'hang') return new Promise(() => {})
    if (chaosMode === 'error_5xx') throw new Error('Supabase 503')
    return []
  }),
  getProviderCountByServiceAndLocation: vi.fn(async () => {
    if (chaosMode === 'hang') return new Promise(() => {})
    if (chaosMode === 'error_5xx') throw new Error('Supabase 503')
    return 0
  }),
  getProviderCountByService: vi.fn(async () => {
    if (chaosMode === 'hang') return new Promise(() => {})
    if (chaosMode === 'error_5xx') throw new Error('Supabase 503')
    return 0
  }),
}))

vi.mock('@/lib/seo/config', () => ({
  SITE_URL: 'https://servicesartisans.fr',
}))

vi.mock('@/lib/rge/sanitize', () => ({
  sanitizeQualificationCode: (s: string) => s.replace(/[^a-zA-Z0-9]/g, ''),
}))

beforeEach(() => {
  chaosMode = 'normal'
  chaosNormalData = { data: [], error: null, count: 0 }
  captureErrorMock.mockClear()
})

// --- Tests ---

function makeReq(url: string): Request {
  return new Request(url, { method: 'GET', headers: { 'x-forwarded-for': '127.0.0.1' } })
}

describe('Chaos — /api/v1/rge/lookup under Supabase failure', () => {
  it('Supabase hang 30s → handler répond en <6s avec fallback 200 not_found', async () => {
    chaosMode = 'hang'
    const { GET } = await import('@/app/api/v1/rge/lookup/route')

    const start = Date.now()
    // Cast: route signature takes NextRequest; `Request` shape is sufficient
    // for our tests because the handler only reads headers + nextUrl/searchParams.
    const res = await GET(
      makeReq('http://localhost/api/v1/rge/lookup?siret=12345678901234') as never
    )
    const elapsed = Date.now() - start

    expect(elapsed).toBeLessThan(6000) // budget 5s + overhead 1s
    expect(res.status).toBe(200) // SEO : jamais 5xx
    const body = (await res.json()) as { found: boolean; rge_status: string }
    expect(body.found).toBe(false)
    expect(body.rge_status).toBe('not_found')
    expect(captureErrorMock).toHaveBeenCalled()
  }, 10_000)

  it('Supabase error 5xx → fallback 200 not_found cacheable', async () => {
    chaosMode = 'error_5xx'
    const { GET } = await import('@/app/api/v1/rge/lookup/route')

    const res = await GET(
      makeReq('http://localhost/api/v1/rge/lookup?siret=12345678901234') as never
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as { found: boolean; rge_status: string }
    expect(body.found).toBe(false)
    expect(captureErrorMock).toHaveBeenCalled()
  })
})

describe('Chaos — /api/v1/rge/search under Supabase failure', () => {
  it('Supabase hang → handler répond en <6s avec fallback 200 results:[]', async () => {
    chaosMode = 'hang'
    const { GET } = await import('@/app/api/v1/rge/search/route')

    const start = Date.now()
    const res = await GET(makeReq('http://localhost/api/v1/rge/search?city=lyon') as never)
    const elapsed = Date.now() - start

    expect(elapsed).toBeLessThan(6000)
    expect(res.status).toBe(200) // SEO : jamais 5xx visible
    const body = (await res.json()) as { results: unknown[] }
    expect(Array.isArray(body.results)).toBe(true)
    expect(body.results).toHaveLength(0)
    expect(captureErrorMock).toHaveBeenCalled()
  }, 10_000)
})

describe('Chaos — /api/providers/listing under upstream failure', () => {
  it('Supabase hang → handler répond en <6s avec fallback providers:[]', async () => {
    chaosMode = 'hang'
    const { GET } = await import('@/app/api/providers/listing/route')

    const start = Date.now()
    const res = await GET(
      makeReq(
        'http://localhost/api/providers/listing?service=plombier&location=lyon&limit=50&offset=0'
      ) as never
    )
    const elapsed = Date.now() - start

    expect(elapsed).toBeLessThan(6000)
    if (res.status !== 200) {
      const debugBody = await res.json()
      throw new Error(`Unexpected status ${res.status}: ${JSON.stringify(debugBody)}`)
    }
    expect(res.status).toBe(200) // hot path SEO 459K pages : pas de soft 404
    const body = (await res.json()) as { providers: unknown[]; totalCount: number }
    expect(Array.isArray(body.providers)).toBe(true)
    expect(body.providers).toHaveLength(0)
    expect(body.totalCount).toBe(0)
    expect(captureErrorMock).toHaveBeenCalled()
  }, 10_000)

  it('Supabase error → fallback 200 cacheable (s-maxage=60)', async () => {
    chaosMode = 'error_5xx'
    const { GET } = await import('@/app/api/providers/listing/route')

    const res = await GET(
      makeReq(
        'http://localhost/api/providers/listing?service=plombier&location=lyon&limit=50&offset=0'
      ) as never
    )
    expect(res.status).toBe(200)
    const cacheControl = res.headers.get('cache-control')
    expect(cacheControl).toContain('s-maxage=60')
    expect(captureErrorMock).toHaveBeenCalled()
  })
})

describe('Chaos — SLA contract uniform across Tier S', () => {
  const routes: Array<{
    name: string
    importer: () => Promise<{ GET: (r: Request) => Promise<Response> }>
    url: string
  }> = [
    {
      name: 'v1/rge/lookup',
      importer: () => import('@/app/api/v1/rge/lookup/route') as never,
      url: 'http://localhost/api/v1/rge/lookup?siret=12345678901234',
    },
    {
      name: 'v1/rge/search',
      importer: () => import('@/app/api/v1/rge/search/route') as never,
      url: 'http://localhost/api/v1/rge/search?city=lyon',
    },
    {
      name: 'providers/listing',
      importer: () => import('@/app/api/providers/listing/route') as never,
      url: 'http://localhost/api/providers/listing?service=plombier&location=lyon&limit=50&offset=0',
    },
  ]

  it.each(routes)(
    '$name returns 200 (not 5xx) under hang chaos',
    async ({ importer, url }) => {
      chaosMode = 'hang'
      const mod = await importer()
      const start = Date.now()
      const res = await mod.GET(makeReq(url))
      const elapsed = Date.now() - start

      expect(res.status).toBe(200) // SLA: SEO ranking preserved
      expect(elapsed).toBeLessThan(6000) // SLA: bounded latency
    },
    10_000
  )
})
