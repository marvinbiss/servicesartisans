/**
 * Tests — handler GET /api/cron/check-aides-freshness
 *
 * Couvre tous les chemins du handler :
 *   1. CRON_SECRET absent → 500
 *   2. authHeader invalide → 401 (même avec X-Debug-Detail: 1 — pas de bypass)
 *   3. success path → 200 + payload minimal (anti-fuite YMYL)
 *   4. header X-Debug-Detail: 1 → payload détaillé (ageDays + alerts)
 *   5. header X-Debug-Detail: 0 (autre valeur que '1') → payload minimal
 *
 * `vi.useFakeTimers()` pin le `now` interne du handler à FIXED_NOW pour
 * éviter toute dérive calendaire (les `lastReviewed` du catalog mocké sont
 * fixés relativement à FIXED_NOW).
 *
 * La logique pure `computeFreshnessReport` est testée séparément dans
 * `check-aides-freshness.test.ts`.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const FIXED_NOW = new Date('2026-04-29T12:00:00Z')

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
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_NOW)
    vi.clearAllMocks()
    delete process.env.CRON_SECRET
  })

  afterEach(() => {
    vi.useRealTimers()
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

  it('returns 401 when X-Debug-Detail: 1 is set WITHOUT valid bearer (no bypass)', async () => {
    process.env.CRON_SECRET = 'good-secret'
    mockVerifyCronSecret.mockReturnValue(false)
    const res = await callGet(buildRequest({ secret: 'wrong', debugDetail: true }))
    expect(res.status).toBe(401)
    // Vital : auth check court-circuite AVANT que le header debug soit lu.
    const body = await res.json()
    expect(body).not.toHaveProperty('ageDays')
    expect(body).not.toHaveProperty('alerts')
  })

  it('treats X-Debug-Detail: 0 (any value ≠ "1") as minimal payload', async () => {
    process.env.CRON_SECRET = 'good-secret'
    mockVerifyCronSecret.mockReturnValue(true)
    const headers = { authorization: 'Bearer good-secret', 'x-debug-detail': '0' }
    const req = new Request('http://localhost/api/cron/check-aides-freshness', { headers })
    const mod = await import('@/app/api/cron/check-aides-freshness/route')
    const res = await mod.GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).not.toHaveProperty('ageDays')
    expect(body).not.toHaveProperty('alerts')
  })
})
