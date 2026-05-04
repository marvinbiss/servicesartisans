/**
 * Tests — /api/cron/google-algo-monitor (Bouclier 1 plan v2).
 * Couvre auth, fail-safe, propagation severity, contrat observabilité.
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
  pingHeartbeatStage: () => Promise.resolve(),
}))

const mockUpsert = vi.fn()
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({ upsert: mockUpsert }),
  }),
}))

const mockCollect = vi.fn()
vi.mock('@/lib/seo/algo-monitor', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/seo/algo-monitor')>('@/lib/seo/algo-monitor')
  return {
    ...actual,
    collectVolatilitySnapshots: (...args: unknown[]) => mockCollect(...args),
    makeSemrushFetcher: vi.fn(() => ({ source: 'semrush_sensor', country: 'fr', fetch: vi.fn() })),
  }
})

function buildRequest(secret?: string): Request {
  const headers: Record<string, string> = {}
  if (secret) headers.authorization = `Bearer ${secret}`
  return new Request('http://localhost/api/cron/google-algo-monitor', {
    method: 'GET',
    headers,
  })
}

async function callRoute(req: Request) {
  const mod = await import('@/app/api/cron/google-algo-monitor/route')
  return mod.GET(req)
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.CRON_SECRET = 'test-secret'
  mockUpsert.mockResolvedValue({ error: null })
})

afterEach(() => {
  delete process.env.CRON_SECRET
})

describe('GET /api/cron/google-algo-monitor', () => {
  it('returns 500 when CRON_SECRET is unset', async () => {
    delete process.env.CRON_SECRET
    const res = await callRoute(buildRequest('whatever'))
    expect(res.status).toBe(500)
  })

  it('returns 401 on missing/wrong secret', async () => {
    const res1 = await callRoute(buildRequest())
    expect(res1.status).toBe(401)
    const res2 = await callRoute(buildRequest('wrong'))
    expect(res2.status).toBe(401)
  })

  it('persists snapshots and pings heartbeat on success', async () => {
    mockCollect.mockResolvedValue([
      { source: 'semrush_sensor', country: 'fr', score: 3, severity: 'calm', rawPayload: {} },
    ])
    const res = await callRoute(buildRequest('test-secret'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.upserted).toBe(1)
    expect(body.snapshots).toHaveLength(1)
    expect(mockUpsert).toHaveBeenCalledTimes(1)
    expect(mockHeartbeat).toHaveBeenCalledWith('google-algo-monitor')
  })

  it('captures Sentry message on critical severity', async () => {
    mockCollect.mockResolvedValue([
      { source: 'semrush_sensor', country: 'fr', score: 8.5, severity: 'critical', rawPayload: {} },
    ])
    const res = await callRoute(buildRequest('test-secret'))
    expect(res.status).toBe(200)
    expect(mockCaptureMessage).toHaveBeenCalledTimes(1)
    expect(mockCaptureMessage.mock.calls[0][0]).toContain('critical')
    expect(mockLoggerFns.error).toHaveBeenCalled()
  })

  it('does not Sentry-alert for warn or calm', async () => {
    mockCollect.mockResolvedValue([
      { source: 'a', country: 'fr', score: 5, severity: 'warn', rawPayload: {} },
      { source: 'b', country: 'fr', score: 1, severity: 'calm', rawPayload: {} },
    ])
    await callRoute(buildRequest('test-secret'))
    expect(mockCaptureMessage).not.toHaveBeenCalled()
  })

  it('still returns 200 when persist fails (non-blocking)', async () => {
    mockUpsert.mockResolvedValue({ error: { message: 'DB down' } })
    mockCollect.mockResolvedValue([
      { source: 'a', country: 'fr', score: 2, severity: 'calm', rawPayload: {} },
    ])
    const res = await callRoute(buildRequest('test-secret'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.upserted).toBe(0)
    expect(mockLoggerFns.warn).toHaveBeenCalled()
  })

  it('logs canonical observability shape on critical (kind/source/country/score/severity)', async () => {
    mockCollect.mockResolvedValue([
      { source: 'semrush_sensor', country: 'fr', score: 8, severity: 'critical', rawPayload: {} },
    ])
    await callRoute(buildRequest('test-secret'))
    expect(mockLoggerFns.error).toHaveBeenCalledWith(
      expect.stringContaining('CRITICAL'),
      undefined,
      expect.objectContaining({
        kind: 'algo_volatility_snapshot',
        source: 'semrush_sensor',
        country: 'fr',
        score: 8,
        severity: 'critical',
      })
    )
  })

  it('logs canonical shape on warn', async () => {
    mockCollect.mockResolvedValue([
      { source: 'semrush_sensor', country: 'fr', score: 5, severity: 'warn', rawPayload: {} },
    ])
    await callRoute(buildRequest('test-secret'))
    expect(mockLoggerFns.warn).toHaveBeenCalledWith(
      expect.stringContaining('WARN'),
      expect.objectContaining({
        kind: 'algo_volatility_snapshot',
        severity: 'warn',
      })
    )
  })

  it('returns response shape: { ok, upserted, snapshots, timestamp }', async () => {
    mockCollect.mockResolvedValue([
      { source: 'a', country: 'fr', score: 1, severity: 'calm', rawPayload: { secret: 'leak' } },
    ])
    const res = await callRoute(buildRequest('test-secret'))
    const body = await res.json()
    expect(Object.keys(body).sort()).toEqual(['ok', 'snapshots', 'timestamp', 'upserted'])
    // rawPayload doit jamais leak via la response
    expect(body.snapshots[0]).not.toHaveProperty('rawPayload')
    expect(body.snapshots[0]).not.toHaveProperty('secret')
  })
})
