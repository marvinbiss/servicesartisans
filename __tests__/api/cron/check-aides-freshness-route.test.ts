/**
 * Tests — handler GET /api/cron/check-aides-freshness
 *
 * Couvre les 4 chemins du handler :
 *   1. CRON_SECRET absent → 500
 *   2. authHeader invalide → 401
 *   3. success path → 200 + payload minimal (anti-fuite YMYL)
 *   4. header X-Debug-Detail: 1 → payload détaillé (ageDays + alerts)
 *
 * La logique pure `computeFreshnessReport` est testée séparément dans
 * `check-aides-freshness.test.ts`.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockLoggerFns = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
}
vi.mock('@/lib/logger', () => ({ logger: mockLoggerFns }))

const mockVerifyCronSecret = vi.fn()
vi.mock('@/lib/auth/verify-cron-secret', () => ({
  verifyCronSecret: (h: string | null | undefined) => mockVerifyCronSecret(h),
}))

vi.mock('@/lib/aides/aides-catalog', () => ({
  aidesCatalog: [
    { slug: 'fresh', lastReviewed: '2026-04-25' },
    { slug: 'stale', lastReviewed: '2026-01-01' },
  ],
}))

async function callGet(req: Request) {
  const mod = await import('@/app/api/cron/check-aides-freshness/route')
  return mod.GET(req)
}

function buildRequest(opts: { secret?: string; debugDetail?: boolean } = {}): Request {
  const headers: Record<string, string> = {}
  if (opts.secret) headers.authorization = `Bearer ${opts.secret}`
  if (opts.debugDetail) headers['x-debug-detail'] = '1'
  return new Request('http://localhost/api/cron/check-aides-freshness', { headers })
}

describe('GET /api/cron/check-aides-freshness — handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.CRON_SECRET
  })

  it('returns 500 when CRON_SECRET env is missing', async () => {
    const res = await callGet(buildRequest({ secret: 'whatever' }))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body).toMatchObject({ error: 'Serveur mal configuré' })
  })

  it('returns 401 when verifyCronSecret rejects the bearer header', async () => {
    process.env.CRON_SECRET = 'good-secret'
    mockVerifyCronSecret.mockReturnValue(false)
    const res = await callGet(buildRequest({ secret: 'wrong' }))
    expect(res.status).toBe(401)
    expect(mockVerifyCronSecret).toHaveBeenCalledWith('Bearer wrong')
  })

  it('returns 200 with minimal payload (no ageDays/alerts leak) on success', async () => {
    process.env.CRON_SECRET = 'good-secret'
    mockVerifyCronSecret.mockReturnValue(true)
    const res = await callGet(buildRequest({ secret: 'good-secret' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('ok')
    expect(body).toHaveProperty('status')
    expect(body).toHaveProperty('totalAides', 2)
    expect(body).toHaveProperty('timestamp')
    // Anti-fuite : par défaut, pas d'exposition des slugs ni dates exactes.
    expect(body).not.toHaveProperty('ageDays')
    expect(body).not.toHaveProperty('alerts')
  })

  it('returns ageDays + alerts when X-Debug-Detail: 1 is set with valid auth', async () => {
    process.env.CRON_SECRET = 'good-secret'
    mockVerifyCronSecret.mockReturnValue(true)
    const res = await callGet(buildRequest({ secret: 'good-secret', debugDetail: true }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('ageDays')
    expect(body).toHaveProperty('alerts')
    expect(body.ageDays).toHaveProperty('fresh')
    expect(body.ageDays).toHaveProperty('stale')
  })
})
