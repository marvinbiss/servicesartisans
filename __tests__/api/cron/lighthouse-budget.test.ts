/**
 * Tests — /api/cron/lighthouse-budget (Bouclier 4 plan v2).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockLoggerFns = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
}
vi.mock('@/lib/logger', () => ({ logger: mockLoggerFns }))

const mockCaptureMessage = vi.fn()
vi.mock('@sentry/nextjs', () => ({
  withMonitor: (_name: string, fn: () => unknown) => fn(),
  captureMessage: (...args: unknown[]) => mockCaptureMessage(...args),
}))

const mockHeartbeat = vi.fn()
vi.mock('@/lib/monitoring/heartbeat', () => ({
  pingHeartbeat: (...args: unknown[]) => mockHeartbeat(...args),
}))

const mockUpsert = vi.fn()
const mockSelect = vi.fn()
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      upsert: mockUpsert,
      select: (...args: unknown[]) => mockSelect(...args),
    }),
  }),
}))

const mockAudit = vi.fn()
vi.mock('@/lib/seo/lighthouse-monitor', async () => {
  const actual = await vi.importActual<typeof import('@/lib/seo/lighthouse-monitor')>(
    '@/lib/seo/lighthouse-monitor'
  )
  return {
    ...actual,
    auditUrls: (...args: unknown[]) => mockAudit(...args),
    makePsiFetcher: vi.fn(() => vi.fn()),
  }
})

vi.mock('@/lib/seo/config', () => ({
  SITE_URL: 'https://servicesartisans.fr',
}))

function buildRequest(secret?: string): Request {
  const headers: Record<string, string> = {}
  if (secret) headers.authorization = `Bearer ${secret}`
  return new Request('http://localhost/api/cron/lighthouse-budget', {
    method: 'GET',
    headers,
  })
}

async function callRoute(req: Request) {
  const mod = await import('@/app/api/cron/lighthouse-budget/route')
  return mod.GET(req)
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.CRON_SECRET = 'test-secret'
  mockUpsert.mockResolvedValue({ error: null })
  // Idempotency check : par défaut, simule "0 row aujourd'hui" (pas de skip)
  mockSelect.mockReturnValue({
    eq: vi.fn(() => Promise.resolve({ count: 0, error: null })),
  })
})

afterEach(() => {
  delete process.env.CRON_SECRET
})

describe('GET /api/cron/lighthouse-budget', () => {
  it('returns 500 when CRON_SECRET unset', async () => {
    delete process.env.CRON_SECRET
    const res = await callRoute(buildRequest('whatever'))
    expect(res.status).toBe(500)
  })

  it('returns 401 on missing/wrong secret', async () => {
    expect((await callRoute(buildRequest())).status).toBe(401)
    expect((await callRoute(buildRequest('wrong'))).status).toBe(401)
  })

  it('persists scores and pings heartbeat', async () => {
    mockAudit.mockResolvedValue([
      {
        url: 'https://servicesartisans.fr/',
        strategy: 'mobile',
        performanceScore: 85,
        lcpMs: 2000,
        cls: 0.05,
        inpMs: 1500,
        fcpMs: 1000,
        tbtMs: 100,
        severity: 'ok',
        rawAudit: {},
      },
    ])
    const res = await callRoute(buildRequest('test-secret'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toMatchObject({ ok: true, upserted: 1, audited: 1, criticals: 0 })
    expect(mockHeartbeat).toHaveBeenCalledWith('lighthouse-budget')
  })

  it('captures Sentry on critical severity + counts criticals', async () => {
    mockAudit.mockResolvedValue([
      {
        url: 'https://servicesartisans.fr/services',
        strategy: 'mobile',
        performanceScore: 30,
        lcpMs: 5000,
        cls: 0.4,
        inpMs: null,
        fcpMs: 2000,
        tbtMs: 800,
        severity: 'critical',
        rawAudit: {},
      },
    ])
    const res = await callRoute(buildRequest('test-secret'))
    const body = await res.json()
    expect(body.criticals).toBe(1)
    expect(mockCaptureMessage).toHaveBeenCalledTimes(1)
    expect(mockLoggerFns.error).toHaveBeenCalled()
  })

  it('returns 200 even when persist fails', async () => {
    mockUpsert.mockResolvedValue({ error: { message: 'DB down' } })
    mockAudit.mockResolvedValue([
      {
        url: 'https://servicesartisans.fr/',
        strategy: 'mobile',
        performanceScore: 80,
        lcpMs: 2000,
        cls: 0.05,
        inpMs: 1500,
        fcpMs: 1000,
        tbtMs: 100,
        severity: 'ok',
        rawAudit: {},
      },
    ])
    const res = await callRoute(buildRequest('test-secret'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.upserted).toBe(0)
    expect(mockLoggerFns.warn).toHaveBeenCalled()
  })

  it('does not Sentry-alert for warn or ok', async () => {
    mockAudit.mockResolvedValue([
      {
        url: 'https://servicesartisans.fr/',
        strategy: 'mobile',
        performanceScore: 65,
        lcpMs: 2500,
        cls: 0.1,
        inpMs: null,
        fcpMs: 1500,
        tbtMs: 200,
        severity: 'warn',
        rawAudit: {},
      },
    ])
    await callRoute(buildRequest('test-secret'))
    expect(mockCaptureMessage).not.toHaveBeenCalled()
    expect(mockLoggerFns.warn).toHaveBeenCalled()
  })

  it('skips audit when full snapshot already exists today (idempotency)', async () => {
    // 10 URLs × 2 strategies = 20 rows attendus. On simule >=20 déjà présents.
    mockSelect.mockReturnValue({
      eq: vi.fn(() => Promise.resolve({ count: 20, error: null })),
    })
    const res = await callRoute(buildRequest('test-secret'))
    const body = await res.json()
    expect(body.skipped).toBe(true)
    expect(body.reason).toBe('already_run_today')
    expect(mockUpsert).not.toHaveBeenCalled()
    expect(mockHeartbeat).toHaveBeenCalledWith('lighthouse-budget')
  })

  it('logs canonical observability shape on critical', async () => {
    mockAudit.mockResolvedValue([
      {
        url: 'https://servicesartisans.fr/blog',
        strategy: 'desktop',
        performanceScore: 20,
        lcpMs: 6000,
        cls: 0.3,
        inpMs: null,
        fcpMs: 2500,
        tbtMs: 1500,
        severity: 'critical',
        rawAudit: {},
      },
    ])
    await callRoute(buildRequest('test-secret'))
    expect(mockLoggerFns.error).toHaveBeenCalledWith(
      expect.stringContaining('CRITICAL'),
      undefined,
      expect.objectContaining({
        kind: 'lighthouse_score',
        url: 'https://servicesartisans.fr/blog',
        strategy: 'desktop',
        severity: 'critical',
      })
    )
  })
})
