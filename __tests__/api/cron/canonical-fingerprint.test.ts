/**
 * Tests — /api/cron/canonical-fingerprint (Bouclier 2 plan v2).
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
    from: () => ({ upsert: mockUpsert, select: () => ({}) }),
  }),
}))

const mockCapture = vi.fn()
const mockLoadPrevious = vi.fn()
const mockPersist = vi.fn()
vi.mock('@/lib/seo/canonical-fingerprint', async () => {
  const actual = await vi.importActual<typeof import('@/lib/seo/canonical-fingerprint')>(
    '@/lib/seo/canonical-fingerprint'
  )
  return {
    ...actual,
    captureFingerprints: (...args: unknown[]) => mockCapture(...args),
    loadPreviousFingerprints: (...args: unknown[]) => mockLoadPrevious(...args),
    persistFingerprints: (...args: unknown[]) => mockPersist(...args),
  }
})

vi.mock('@/lib/seo/config', () => ({
  SITE_URL: 'https://servicesartisans.fr',
}))

function buildRequest(secret?: string): Request {
  const headers: Record<string, string> = {}
  if (secret) headers.authorization = `Bearer ${secret}`
  return new Request('http://localhost/api/cron/canonical-fingerprint', {
    method: 'GET',
    headers,
  })
}

async function callRoute(req: Request) {
  const mod = await import('@/app/api/cron/canonical-fingerprint/route')
  return mod.GET(req)
}

const baseFp = {
  canonical: 'https://servicesartisans.fr/',
  title: 'Home',
  metaDescription: 'Desc',
  h1: 'H1',
  noindex: false,
  fingerprint: 'a'.repeat(64),
  statusCode: 200,
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.CRON_SECRET = 'test-secret'
  mockPersist.mockResolvedValue({ ok: true, upserted: 1 })
  mockLoadPrevious.mockResolvedValue(new Map())
  mockCapture.mockResolvedValue([])
})

afterEach(() => {
  delete process.env.CRON_SECRET
})

describe('GET /api/cron/canonical-fingerprint', () => {
  it('returns 500 when CRON_SECRET unset', async () => {
    delete process.env.CRON_SECRET
    expect((await callRoute(buildRequest('whatever'))).status).toBe(500)
  })

  it('returns 401 on missing/wrong secret', async () => {
    expect((await callRoute(buildRequest())).status).toBe(401)
    expect((await callRoute(buildRequest('wrong'))).status).toBe(401)
  })

  it('persists captured fingerprints + heartbeat', async () => {
    mockCapture.mockResolvedValue([{ ...baseFp, url: 'https://servicesartisans.fr/' }])
    mockPersist.mockResolvedValue({ ok: true, upserted: 1 })
    const res = await callRoute(buildRequest('test-secret'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toMatchObject({ ok: true, upserted: 1, captured: 1 })
    expect(mockHeartbeat).toHaveBeenCalledWith('canonical-fingerprint')
  })

  it('detects critical drift (canonical changed) + Sentry alert', async () => {
    const url = 'https://servicesartisans.fr/'
    mockLoadPrevious.mockResolvedValue(
      new Map([
        [
          url,
          {
            canonical: 'https://servicesartisans.fr/old',
            title: 'Home',
            metaDescription: 'Desc',
            h1: 'H1',
            noindex: false,
          },
        ],
      ])
    )
    mockCapture.mockResolvedValue([{ ...baseFp, url }])
    const res = await callRoute(buildRequest('test-secret'))
    const body = await res.json()
    expect(body.critical).toBe(1)
    expect(mockCaptureMessage).toHaveBeenCalledTimes(1)
    expect(mockCaptureMessage.mock.calls[0][0]).toContain('Canonical drift critical')
    expect(mockLoggerFns.error).toHaveBeenCalled()
  })

  it('detects critical drift (noindex flipped) + Sentry alert', async () => {
    const url = 'https://servicesartisans.fr/'
    mockLoadPrevious.mockResolvedValue(
      new Map([
        [
          url,
          {
            canonical: 'https://servicesartisans.fr/',
            title: 'Home',
            metaDescription: 'Desc',
            h1: 'H1',
            noindex: false,
          },
        ],
      ])
    )
    mockCapture.mockResolvedValue([{ ...baseFp, url, noindex: true }])
    const res = await callRoute(buildRequest('test-secret'))
    const body = await res.json()
    expect(body.critical).toBe(1)
    expect(mockCaptureMessage).toHaveBeenCalledTimes(1)
  })

  it('detects warn drift (title changed) — no Sentry alert', async () => {
    const url = 'https://servicesartisans.fr/'
    mockLoadPrevious.mockResolvedValue(
      new Map([
        [
          url,
          {
            canonical: 'https://servicesartisans.fr/',
            title: 'Old title',
            metaDescription: 'Desc',
            h1: 'H1',
            noindex: false,
          },
        ],
      ])
    )
    mockCapture.mockResolvedValue([{ ...baseFp, url }])
    const res = await callRoute(buildRequest('test-secret'))
    const body = await res.json()
    expect(body.warn).toBe(1)
    expect(body.critical).toBe(0)
    expect(mockCaptureMessage).not.toHaveBeenCalled()
    expect(mockLoggerFns.warn).toHaveBeenCalled()
  })

  it('logs new fingerprint when no previous exists (no alert)', async () => {
    mockLoadPrevious.mockResolvedValue(new Map())
    mockCapture.mockResolvedValue([{ ...baseFp, url: 'https://servicesartisans.fr/' }])
    const res = await callRoute(buildRequest('test-secret'))
    const body = await res.json()
    expect(body.critical).toBe(0)
    expect(body.warn).toBe(0)
    expect(mockCaptureMessage).not.toHaveBeenCalled()
    expect(mockLoggerFns.info).toHaveBeenCalled()
  })

  it('returns 200 when persist fails (non-blocking)', async () => {
    mockCapture.mockResolvedValue([{ ...baseFp, url: 'https://servicesartisans.fr/' }])
    mockPersist.mockResolvedValue({ ok: false, upserted: 0 })
    const res = await callRoute(buildRequest('test-secret'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.upserted).toBe(0)
    expect(mockLoggerFns.warn).toHaveBeenCalled()
  })

  it('logs canonical observability shape on critical', async () => {
    const url = 'https://servicesartisans.fr/'
    mockLoadPrevious.mockResolvedValue(
      new Map([
        [
          url,
          {
            canonical: 'https://servicesartisans.fr/old',
            title: 'Home',
            metaDescription: 'Desc',
            h1: 'H1',
            noindex: false,
          },
        ],
      ])
    )
    mockCapture.mockResolvedValue([{ ...baseFp, url }])
    await callRoute(buildRequest('test-secret'))
    expect(mockLoggerFns.error).toHaveBeenCalledWith(
      expect.stringContaining('CRITICAL drift'),
      undefined,
      expect.objectContaining({
        kind: 'canonical_fingerprint',
        url,
        severity: 'critical',
        changes: expect.objectContaining({
          canonical: {
            before: 'https://servicesartisans.fr/old',
            after: 'https://servicesartisans.fr/',
          },
        }),
      })
    )
  })
})
