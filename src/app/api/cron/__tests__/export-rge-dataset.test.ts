/**
 * Tests for src/app/api/cron/export-rge-dataset/route.ts
 *
 * Mocks:
 *  - @sentry/nextjs  → withMonitor passthrough
 *  - @/lib/logger    → no-op
 *  - @/lib/auth/verify-cron-secret → controllable
 *  - scripts/cron/export-rge-dataset → controllable happy/error path
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks (declared before dynamic import so vi.mock hoisting applies)
// ---------------------------------------------------------------------------

vi.mock('@sentry/nextjs', () => ({
  withMonitor: (_key: string, fn: () => unknown) => fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

// We control verifyCronSecret per test via vi.mocked
vi.mock('@/lib/auth/verify-cron-secret', () => ({
  verifyCronSecret: vi.fn(() => false),
}))

// Default mock for export function: happy path
vi.mock('../../../../../scripts/cron/export-rge-dataset', () => ({
  exportRgeDataset: vi.fn(async () => ({
    ok: true,
    yearmonth: '2026-04',
    count: 100,
    files: ['rge-2026-04.csv'],
    warnings: [],
  })),
}))

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { exportRgeDataset } from '../../../../../scripts/cron/export-rge-dataset'

// Dynamic import of GET to ensure mocks are already in place
async function loadRoute() {
  const mod = await import('../export-rge-dataset/route')
  return mod.GET
}

// Minimal Request factory
function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/api/cron/export-rge-dataset', {
    method: 'GET',
    headers,
  })
}

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const mockVerify = vi.mocked(verifyCronSecret)
const mockExport = vi.mocked(exportRgeDataset)

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/cron/export-rge-dataset', () => {
  let GET: (req: Request) => Promise<Response>

  beforeEach(async () => {
    vi.unstubAllEnvs()
    mockVerify.mockReset()
    mockExport.mockReset()
    GET = await loadRoute()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  // -------------------------------------------------------------------------
  // Auth failures — CRON_SECRET absent
  // -------------------------------------------------------------------------

  it('returns 401 when CRON_SECRET env is not set (info-leak prevention, fix-pass Phase A)', async () => {
    vi.stubEnv('CRON_SECRET', '')
    // verifyCronSecret returns false when env is missing (handled in route before calling verify)
    const req = makeRequest()
    const res = await GET(req)
    // Sécurité fix #8 : 500 → 401 générique pour ne pas leak l'absence de CRON_SECRET
    expect(res.status).toBe(401)
    const body = (await res.json()) as Record<string, unknown>
    expect(body.error).toBe('Non autorisé')
  })

  // -------------------------------------------------------------------------
  // Auth failures — wrong token
  // -------------------------------------------------------------------------

  it('returns 401 when Authorization header is absent', async () => {
    vi.stubEnv('CRON_SECRET', 'secret123')
    mockVerify.mockReturnValue(false)
    const req = makeRequest()
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns 401 when Authorization header has wrong token', async () => {
    vi.stubEnv('CRON_SECRET', 'secret123')
    mockVerify.mockReturnValue(false)
    const req = makeRequest({ authorization: 'Bearer wrong-token' })
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('does not leak information in the 401 response body', async () => {
    vi.stubEnv('CRON_SECRET', 'secret123')
    mockVerify.mockReturnValue(false)
    const req = makeRequest({ authorization: 'Bearer wrong' })
    const res = await GET(req)
    const body = (await res.json()) as Record<string, unknown>
    expect(body).not.toHaveProperty('CRON_SECRET')
    expect(JSON.stringify(body)).not.toContain('secret123')
  })

  // -------------------------------------------------------------------------
  // Kill switch — feature not enabled
  // -------------------------------------------------------------------------

  it('returns 503 when RGE_DATASET_EXPORT_ENABLED is not "true"', async () => {
    vi.stubEnv('CRON_SECRET', 'secret123')
    vi.stubEnv('RGE_DATASET_EXPORT_ENABLED', 'false')
    mockVerify.mockReturnValue(true)
    const req = makeRequest({ authorization: 'Bearer secret123' })
    const res = await GET(req)
    expect(res.status).toBe(503)
  })

  it('returns 503 when RGE_DATASET_EXPORT_ENABLED is absent', async () => {
    vi.stubEnv('CRON_SECRET', 'secret123')
    vi.stubEnv('RGE_DATASET_EXPORT_ENABLED', '')
    mockVerify.mockReturnValue(true)
    const req = makeRequest({ authorization: 'Bearer secret123' })
    const res = await GET(req)
    expect(res.status).toBe(503)
  })

  it('503 body contains feature_disabled error key', async () => {
    vi.stubEnv('CRON_SECRET', 'secret123')
    vi.stubEnv('RGE_DATASET_EXPORT_ENABLED', '')
    mockVerify.mockReturnValue(true)
    const req = makeRequest({ authorization: 'Bearer secret123' })
    const res = await GET(req)
    const body = (await res.json()) as Record<string, unknown>
    expect(body.error).toBe('feature_disabled')
  })

  // -------------------------------------------------------------------------
  // Happy path
  // -------------------------------------------------------------------------

  it('returns 200 with ok=true on happy path', async () => {
    vi.stubEnv('CRON_SECRET', 'secret123')
    vi.stubEnv('RGE_DATASET_EXPORT_ENABLED', 'true')
    mockVerify.mockReturnValue(true)
    mockExport.mockResolvedValue({
      ok: true,
      yearmonth: '2026-04',
      count: 1234,
      duration_ms: 1500,
      output_dir: '/tmp/rge-export',
      files: ['rge-2026-04.csv', 'rge-2026-04.json'],
      warnings: [],
    })
    const req = makeRequest({ authorization: 'Bearer secret123' })
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = (await res.json()) as Record<string, unknown>
    expect(body.ok).toBe(true)
    expect(body.count).toBe(1234)
  })

  it('returns 500 when exportRgeDataset throws', async () => {
    vi.stubEnv('CRON_SECRET', 'secret123')
    vi.stubEnv('RGE_DATASET_EXPORT_ENABLED', 'true')
    mockVerify.mockReturnValue(true)
    mockExport.mockRejectedValue(new Error('DB timeout'))
    const req = makeRequest({ authorization: 'Bearer secret123' })
    const res = await GET(req)
    expect(res.status).toBe(500)
    const body = (await res.json()) as Record<string, unknown>
    expect(body.error).toBe('export_rge_dataset_failed')
  })

  // -------------------------------------------------------------------------
  // verifyCronSecret is called (timing-safe delegation)
  // -------------------------------------------------------------------------

  it('calls verifyCronSecret with the Authorization header value', async () => {
    vi.stubEnv('CRON_SECRET', 'secret123')
    vi.stubEnv('RGE_DATASET_EXPORT_ENABLED', 'true')
    mockVerify.mockReturnValue(false)
    const req = makeRequest({ authorization: 'Bearer some-header' })
    await GET(req)
    expect(mockVerify).toHaveBeenCalledWith('Bearer some-header')
  })

  it('calls verifyCronSecret with null when header is absent', async () => {
    vi.stubEnv('CRON_SECRET', 'secret123')
    vi.stubEnv('RGE_DATASET_EXPORT_ENABLED', 'true')
    mockVerify.mockReturnValue(false)
    const req = makeRequest()
    await GET(req)
    expect(mockVerify).toHaveBeenCalledWith(null)
  })
})
