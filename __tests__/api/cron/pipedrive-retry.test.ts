/**
 * Tests — /api/cron/pipedrive-retry
 *
 * Covers:
 *   - Auth: rejects missing/invalid CRON_SECRET
 *   - Skip when Pipedrive not configured
 *   - Fetches pending leads with correct filters (not synced, not dead-lettered, under max attempts, due for retry)
 *   - Calls syncDevisRequestToPipedrive for each pending lead
 *   - Reports synced/failed counts
 *   - Handles DB query errors
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

const mockSyncDevis = vi.fn()
const mockIsPipedriveConfigured = vi.fn()

vi.mock('@/lib/integrations/pipedrive', () => ({
  isPipedriveConfigured: (...args: unknown[]) => mockIsPipedriveConfigured(...args),
  syncDevisRequestToPipedrive: (...args: unknown[]) => mockSyncDevis(...args),
  MAX_SYNC_ATTEMPTS: 5,
}))

const mockSupabaseSelect = vi.fn()
const mockSupabaseFrom = vi.fn()
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ from: mockSupabaseFrom })),
}))

function buildRequest(secret?: string): Request {
  const headers: Record<string, string> = {}
  if (secret) headers.authorization = `Bearer ${secret}`
  return new Request('http://localhost/api/cron/pipedrive-retry', {
    method: 'GET',
    headers,
  })
}

beforeEach(() => {
  process.env.CRON_SECRET = 'test-cron-secret'
  mockIsPipedriveConfigured.mockReturnValue(true)

  const chain: Record<string, unknown> = {}
  chain.select = vi.fn().mockReturnValue(chain)
  chain.is = vi.fn().mockReturnValue(chain)
  chain.lt = vi.fn().mockReturnValue(chain)
  chain.or = vi.fn().mockReturnValue(chain)
  chain.gte = vi.fn().mockReturnValue(chain)
  chain.order = vi.fn().mockReturnValue(chain)
  chain.limit = mockSupabaseSelect

  mockSupabaseFrom.mockReturnValue(chain)
  mockSupabaseSelect.mockResolvedValue({ data: [], error: null })
  mockSyncDevis.mockReset()
  mockSyncDevis.mockResolvedValue(undefined)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.resetModules()
  delete process.env.CRON_SECRET
})

async function callRoute(req: Request) {
  const mod = await import('@/app/api/cron/pipedrive-retry/route')
  return mod.GET(req)
}

describe('GET /api/cron/pipedrive-retry', () => {
  it('returns 500 when CRON_SECRET is not set', async () => {
    delete process.env.CRON_SECRET
    const res = await callRoute(buildRequest('anything'))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toContain('CRON_SECRET')
  })

  it('returns 401 when authorization header is missing', async () => {
    const res = await callRoute(buildRequest())
    expect(res.status).toBe(401)
  })

  it('returns 401 when authorization header is wrong', async () => {
    const res = await callRoute(buildRequest('wrong-secret'))
    expect(res.status).toBe(401)
  })

  it('skips when Pipedrive is not configured', async () => {
    mockIsPipedriveConfigured.mockReturnValue(false)
    const res = await callRoute(buildRequest('test-cron-secret'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.skipped).toBe(true)
  })

  it('processes pending leads and returns counts', async () => {
    mockSupabaseSelect.mockResolvedValueOnce({
      data: [{ id: 'lead-1' }, { id: 'lead-2' }, { id: 'lead-3' }],
      error: null,
    })

    const res = await callRoute(buildRequest('test-cron-secret'))
    const body = await res.json()

    expect(body.total).toBe(3)
    expect(body.synced).toBe(3)
    expect(body.failed).toBe(0)
    expect(mockSyncDevis).toHaveBeenCalledTimes(3)
    expect(mockSyncDevis).toHaveBeenCalledWith('lead-1')
    expect(mockSyncDevis).toHaveBeenCalledWith('lead-2')
    expect(mockSyncDevis).toHaveBeenCalledWith('lead-3')
  })

  it('counts failures when syncDevisRequestToPipedrive throws', async () => {
    mockSupabaseSelect.mockResolvedValueOnce({
      data: [{ id: 'lead-ok' }, { id: 'lead-fail' }],
      error: null,
    })
    mockSyncDevis.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('sync error'))

    const res = await callRoute(buildRequest('test-cron-secret'))
    const body = await res.json()

    expect(body.total).toBe(2)
    expect(body.synced).toBe(1)
    expect(body.failed).toBe(1)
  })

  it('returns 500 when DB query fails', async () => {
    mockSupabaseSelect.mockResolvedValueOnce({
      data: null,
      error: { message: 'connection timeout' },
    })

    const res = await callRoute(buildRequest('test-cron-secret'))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toContain('connection timeout')
  })

  it('handles empty pending list gracefully', async () => {
    mockSupabaseSelect.mockResolvedValueOnce({ data: [], error: null })

    const res = await callRoute(buildRequest('test-cron-secret'))
    const body = await res.json()

    expect(body.total).toBe(0)
    expect(body.synced).toBe(0)
    expect(body.failed).toBe(0)
    expect(mockSyncDevis).not.toHaveBeenCalled()
  })

  it('handles null data from DB as empty list', async () => {
    mockSupabaseSelect.mockResolvedValueOnce({ data: null, error: null })

    const res = await callRoute(buildRequest('test-cron-secret'))
    const body = await res.json()

    expect(body.total).toBe(0)
    expect(mockSyncDevis).not.toHaveBeenCalled()
  })

  it('queries with correct filters: not synced, not dead-lettered, under max attempts', async () => {
    mockSupabaseSelect.mockResolvedValueOnce({ data: [], error: null })

    await callRoute(buildRequest('test-cron-secret'))

    expect(mockSupabaseFrom).toHaveBeenCalledWith('devis_requests')
    const chain = mockSupabaseFrom.mock.results[0].value
    expect(chain.is).toHaveBeenCalledWith('pipedrive_synced_at', null)
    expect(chain.is).toHaveBeenCalledWith('pipedrive_dead_letter_at', null)
    expect(chain.lt).toHaveBeenCalledWith('pipedrive_sync_attempts', 5)
  })
})
