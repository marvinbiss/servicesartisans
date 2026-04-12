/**
 * Tests — Pipedrive CRM sync integration
 *
 * Covers:
 *   - syncLeadToPipedrive: Person+Deal+Note creation, person dedup, note failure resilience
 *   - syncDevisRequestToPipedrive: full flow with Supabase reads/writes, idempotency,
 *     dead-letter guard, DLQ insertion on failure, exponential backoff scheduling
 *   - Error handling: 4xx, 5xx, network errors, missing config
 *
 * Strategy: mock at the fetch boundary (global.fetch) and Supabase admin client.
 * No real HTTP calls.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

vi.mock('@/lib/monitoring/sentry', () => ({
  captureError: vi.fn(),
}))

const mockSupabaseFrom = vi.fn()
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ from: mockSupabaseFrom })),
}))

const PIPEDRIVE_ENV = {
  PIPEDRIVE_API_TOKEN: 'test-token-abc',
  PIPEDRIVE_COMPANY_DOMAIN: 'testcompany',
  PIPEDRIVE_PIPELINE_ID: '1',
  PIPEDRIVE_STAGE_ID: '2',
  PIPEDRIVE_FIELD_SERVICE: 'cf_service',
  PIPEDRIVE_FIELD_URGENCY: 'cf_urgency',
  PIPEDRIVE_FIELD_CITY: 'cf_city',
  PIPEDRIVE_FIELD_POSTAL_CODE: 'cf_cp',
  PIPEDRIVE_FIELD_SOURCE: 'cf_source',
}

function setEnv(overrides: Record<string, string | undefined> = {}) {
  const env = { ...PIPEDRIVE_ENV, ...overrides }
  for (const [k, v] of Object.entries(env)) {
    if (v === undefined) {
      delete process.env[k]
    } else {
      process.env[k] = v
    }
  }
}

function clearEnv() {
  for (const k of Object.keys(PIPEDRIVE_ENV)) {
    delete process.env[k]
  }
}

function makeLead(overrides: Record<string, unknown> = {}) {
  return {
    id: 'devis-001',
    client_name: 'Jean Dupont',
    client_email: 'jean@example.com',
    client_phone: '+33612345678',
    service_name: 'Plombier',
    description: 'Fuite robinet cuisine',
    budget: '200-500',
    urgency: 'urgent',
    city: 'Lyon',
    postal_code: '69001',
    created_at: '2026-04-10T08:00:00.000Z',
    ...overrides,
  }
}

// ── fetch mock helpers ────────────────────────────────────

function pipedriveOk<T>(data: T) {
  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

function pipedriveError(status: number, error: string) {
  return new Response(JSON.stringify({ success: false, error }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  mockSupabaseFrom.mockReset()
  setEnv()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.resetModules()
  clearEnv()
})

// ════════════════════════════════════════════════════════════
// syncLeadToPipedrive
// ════════════════════════════════════════════════════════════

describe('syncLeadToPipedrive', () => {
  async function importSync() {
    const mod = await import('@/lib/integrations/pipedrive')
    return mod.syncLeadToPipedrive
  }

  it('creates Person + Deal + Note for a new lead', async () => {
    fetchMock
      .mockResolvedValueOnce(pipedriveOk({ items: [] })) // search person: no match
      .mockResolvedValueOnce(pipedriveOk({ id: 42 })) // create person
      .mockResolvedValueOnce(pipedriveOk({ id: 100 })) // create deal
      .mockResolvedValueOnce(pipedriveOk({})) // add note

    const syncLeadToPipedrive = await importSync()
    const result = await syncLeadToPipedrive(makeLead())

    expect(result).toEqual({ personId: 42, dealId: 100 })
    expect(fetchMock).toHaveBeenCalledTimes(4)

    // Verify person search URL
    const searchUrl = fetchMock.mock.calls[0][0] as string
    expect(searchUrl).toContain('/persons/search')
    expect(searchUrl).toContain('term=jean%40example.com')
    expect(searchUrl).toContain('fields=email')
    expect(searchUrl).toContain('exact_match=true')

    // Verify person creation body
    const personBody = JSON.parse(fetchMock.mock.calls[1][1].body)
    expect(personBody.name).toBe('Jean Dupont')
    expect(personBody.email[0].value).toBe('jean@example.com')
    expect(personBody.phone[0].value).toBe('+33612345678')

    // Verify deal creation body
    const dealBody = JSON.parse(fetchMock.mock.calls[2][1].body)
    expect(dealBody.title).toBe('Plombier \u2014 Lyon')
    expect(dealBody.person_id).toBe(42)
    expect(dealBody.pipeline_id).toBe(1)
    expect(dealBody.stage_id).toBe(2)
    expect(dealBody.cf_service).toBe('Plombier')
    expect(dealBody.cf_source).toBe('servicesartisans.fr')

    // Verify note creation body
    const noteBody = JSON.parse(fetchMock.mock.calls[3][1].body)
    expect(noteBody.deal_id).toBe(100)
    expect(noteBody.content).toContain('Fuite robinet cuisine')
    expect(noteBody.content).toContain('devis-001')
  })

  it('reuses an existing Person when found by email', async () => {
    fetchMock
      .mockResolvedValueOnce(pipedriveOk({ items: [{ item: { id: 77 } }] })) // search: found
      .mockResolvedValueOnce(pipedriveOk({ id: 200 })) // create deal
      .mockResolvedValueOnce(pipedriveOk({})) // add note

    const syncLeadToPipedrive = await importSync()
    const result = await syncLeadToPipedrive(makeLead())

    expect(result).toEqual({ personId: 77, dealId: 200 })
    expect(fetchMock).toHaveBeenCalledTimes(3) // no person POST
  })

  it('searches by phone when email is null', async () => {
    fetchMock
      .mockResolvedValueOnce(pipedriveOk({ items: [] })) // search by phone
      .mockResolvedValueOnce(pipedriveOk({ id: 10 })) // create person
      .mockResolvedValueOnce(pipedriveOk({ id: 50 })) // create deal
      .mockResolvedValueOnce(pipedriveOk({})) // note

    const syncLeadToPipedrive = await importSync()
    await syncLeadToPipedrive(makeLead({ client_email: null }))

    const searchUrl = fetchMock.mock.calls[0][0] as string
    expect(searchUrl).toContain('fields=phone')
    expect(searchUrl).toContain(encodeURIComponent('+33612345678'))
  })

  it('succeeds even if note creation fails', async () => {
    fetchMock
      .mockResolvedValueOnce(pipedriveOk({ items: [] }))
      .mockResolvedValueOnce(pipedriveOk({ id: 1 }))
      .mockResolvedValueOnce(pipedriveOk({ id: 2 }))
      .mockResolvedValueOnce(pipedriveError(500, 'internal error')) // note fails

    const syncLeadToPipedrive = await importSync()
    const result = await syncLeadToPipedrive(makeLead())

    expect(result).toEqual({ personId: 1, dealId: 2 })
  })

  it('throws when person creation returns no id', async () => {
    fetchMock
      .mockResolvedValueOnce(pipedriveOk({ items: [] }))
      .mockResolvedValueOnce(pipedriveOk(null)) // person returns null data

    const syncLeadToPipedrive = await importSync()
    await expect(syncLeadToPipedrive(makeLead())).rejects.toThrow('person creation returned no id')
  })

  it('throws on Pipedrive 429 rate limit', async () => {
    fetchMock.mockResolvedValueOnce(pipedriveError(429, 'Rate limit exceeded'))

    const syncLeadToPipedrive = await importSync()
    await expect(syncLeadToPipedrive(makeLead())).rejects.toThrow('429')
  })

  it('throws on Pipedrive 500 server error', async () => {
    fetchMock
      .mockResolvedValueOnce(pipedriveOk({ items: [] }))
      .mockResolvedValueOnce(pipedriveOk({ id: 1 }))
      .mockResolvedValueOnce(pipedriveError(500, 'Internal Server Error'))

    const syncLeadToPipedrive = await importSync()
    await expect(syncLeadToPipedrive(makeLead())).rejects.toThrow('500')
  })

  it('throws on network/fetch error', async () => {
    fetchMock.mockRejectedValueOnce(new Error('ECONNREFUSED'))

    const syncLeadToPipedrive = await importSync()
    await expect(syncLeadToPipedrive(makeLead())).rejects.toThrow('ECONNREFUSED')
  })

  it('throws when Pipedrive is not configured', async () => {
    clearEnv()
    const syncLeadToPipedrive = await importSync()
    await expect(syncLeadToPipedrive(makeLead())).rejects.toThrow('not configured')
  })

  it('uses fallback name when all identifiers are null', async () => {
    // When email+phone are null, findExistingPerson returns null without searching.
    // First fetch call is person creation (POST), then deal, then note.
    fetchMock
      .mockResolvedValueOnce(pipedriveOk({ id: 5 })) // create person
      .mockResolvedValueOnce(pipedriveOk({ id: 10 })) // create deal
      .mockResolvedValueOnce(pipedriveOk({})) // add note

    const syncLeadToPipedrive = await importSync()
    await syncLeadToPipedrive(
      makeLead({ client_name: null, client_email: null, client_phone: null })
    )

    expect(fetchMock).toHaveBeenCalledTimes(3)
    const personBody = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(personBody.name).toBe('Lead anonyme')
  })

  it('omits custom fields not configured in env', async () => {
    delete process.env.PIPEDRIVE_FIELD_SERVICE
    delete process.env.PIPEDRIVE_FIELD_URGENCY
    delete process.env.PIPEDRIVE_PIPELINE_ID
    delete process.env.PIPEDRIVE_STAGE_ID

    fetchMock
      .mockResolvedValueOnce(pipedriveOk({ items: [] }))
      .mockResolvedValueOnce(pipedriveOk({ id: 1 }))
      .mockResolvedValueOnce(pipedriveOk({ id: 2 }))
      .mockResolvedValueOnce(pipedriveOk({}))

    const syncLeadToPipedrive = await importSync()
    await syncLeadToPipedrive(makeLead())

    const dealBody = JSON.parse(fetchMock.mock.calls[2][1].body)
    expect(dealBody).not.toHaveProperty('pipeline_id')
    expect(dealBody).not.toHaveProperty('stage_id')
    expect(dealBody).not.toHaveProperty('cf_service')
    expect(dealBody).not.toHaveProperty('cf_urgency')
  })
})

// ════════════════════════════════════════════════════════════
// syncDevisRequestToPipedrive — full flow with Supabase
// ════════════════════════════════════════════════════════════

describe('syncDevisRequestToPipedrive', () => {
  async function importSyncDevis() {
    const mod = await import('@/lib/integrations/pipedrive')
    return mod.syncDevisRequestToPipedrive
  }

  function setupSupabaseSelect(lead: Record<string, unknown>) {
    const selectChain: Record<string, unknown> = {}
    selectChain.select = vi.fn().mockReturnValue(selectChain)
    selectChain.eq = vi.fn().mockReturnValue(selectChain)
    selectChain.single = vi.fn().mockResolvedValue({ data: lead, error: null })

    const updateChain: Record<string, unknown> = {}
    updateChain.update = vi.fn().mockReturnValue(updateChain)
    updateChain.eq = vi.fn().mockResolvedValue({ data: null, error: null })

    let callCount = 0
    mockSupabaseFrom.mockImplementation(() => {
      callCount++
      if (callCount === 1) return selectChain
      return updateChain
    })

    return { selectChain, updateChain }
  }

  it('syncs a new lead and writes Pipedrive IDs back to DB', async () => {
    const lead = makeLead({
      pipedrive_deal_id: null,
      pipedrive_sync_attempts: 0,
      pipedrive_dead_letter_at: null,
    })
    const { updateChain } = setupSupabaseSelect(lead)

    fetchMock
      .mockResolvedValueOnce(pipedriveOk({ items: [] }))
      .mockResolvedValueOnce(pipedriveOk({ id: 42 }))
      .mockResolvedValueOnce(pipedriveOk({ id: 100 }))
      .mockResolvedValueOnce(pipedriveOk({}))

    const syncDevisRequestToPipedrive = await importSyncDevis()
    await syncDevisRequestToPipedrive('devis-001')

    expect(mockSupabaseFrom).toHaveBeenCalledWith('devis_requests')
    expect(updateChain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        pipedrive_person_id: 42,
        pipedrive_deal_id: 100,
        pipedrive_sync_error: null,
        pipedrive_next_retry_at: null,
        pipedrive_sync_attempts: 1,
      })
    )
  })

  it('skips sync when lead already has a pipedrive_deal_id (idempotency)', async () => {
    const lead = makeLead({ pipedrive_deal_id: 999, pipedrive_sync_attempts: 1 })
    setupSupabaseSelect(lead)

    const syncDevisRequestToPipedrive = await importSyncDevis()
    await syncDevisRequestToPipedrive('devis-001')

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('skips sync when lead is dead-lettered', async () => {
    const lead = makeLead({
      pipedrive_deal_id: null,
      pipedrive_sync_attempts: 5,
      pipedrive_dead_letter_at: '2026-04-11T00:00:00.000Z',
    })
    setupSupabaseSelect(lead)

    const syncDevisRequestToPipedrive = await importSyncDevis()
    await syncDevisRequestToPipedrive('devis-001')

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns early when Pipedrive is not configured', async () => {
    clearEnv()
    const syncDevisRequestToPipedrive = await importSyncDevis()
    await syncDevisRequestToPipedrive('devis-001')

    expect(mockSupabaseFrom).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('records error and schedules retry on first failure', async () => {
    const lead = makeLead({
      pipedrive_deal_id: null,
      pipedrive_sync_attempts: 0,
      pipedrive_dead_letter_at: null,
    })
    const { updateChain } = setupSupabaseSelect(lead)

    fetchMock.mockRejectedValueOnce(new Error('Connection refused'))

    const syncDevisRequestToPipedrive = await importSyncDevis()
    await syncDevisRequestToPipedrive('devis-001')

    expect(updateChain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        pipedrive_sync_error: expect.stringContaining('Connection refused'),
        pipedrive_sync_attempts: 1,
        pipedrive_next_retry_at: expect.any(String),
      })
    )
    // Should NOT be dead-lettered on first failure
    const updateArg = (updateChain.update as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(updateArg).not.toHaveProperty('pipedrive_dead_letter_at')
  })

  it('dead-letters a lead after MAX_SYNC_ATTEMPTS failures', async () => {
    const lead = makeLead({
      pipedrive_deal_id: null,
      pipedrive_sync_attempts: 4, // next will be 5 = MAX
      pipedrive_dead_letter_at: null,
    })
    const { updateChain } = setupSupabaseSelect(lead)

    fetchMock.mockRejectedValueOnce(new Error('Persistent failure'))

    const { captureError } = await import('@/lib/monitoring/sentry')
    const syncDevisRequestToPipedrive = await importSyncDevis()
    await syncDevisRequestToPipedrive('devis-001')

    const updateArg = (updateChain.update as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(updateArg.pipedrive_sync_attempts).toBe(5)
    expect(updateArg.pipedrive_dead_letter_at).toEqual(expect.any(String))
    expect(updateArg.pipedrive_next_retry_at).toBeNull()

    expect(captureError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: expect.objectContaining({ dead_letter: 'true' }),
      })
    )
  })

  it('truncates long error messages to 500 chars', async () => {
    const lead = makeLead({
      pipedrive_deal_id: null,
      pipedrive_sync_attempts: 0,
      pipedrive_dead_letter_at: null,
    })
    const { updateChain } = setupSupabaseSelect(lead)

    const longMessage = 'X'.repeat(600)
    fetchMock.mockRejectedValueOnce(new Error(longMessage))

    const syncDevisRequestToPipedrive = await importSyncDevis()
    await syncDevisRequestToPipedrive('devis-001')

    const updateArg = (updateChain.update as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(updateArg.pipedrive_sync_error.length).toBe(500)
  })

  it('handles lead not found in DB gracefully', async () => {
    const selectChain: Record<string, unknown> = {}
    selectChain.select = vi.fn().mockReturnValue(selectChain)
    selectChain.eq = vi.fn().mockReturnValue(selectChain)
    selectChain.single = vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } })
    mockSupabaseFrom.mockReturnValue(selectChain)

    const syncDevisRequestToPipedrive = await importSyncDevis()
    await syncDevisRequestToPipedrive('nonexistent-id')

    expect(fetchMock).not.toHaveBeenCalled()
  })
})

// ════════════════════════════════════════════════════════════
// computeNextRetryAt — edge cases beyond pipedrive-dlq.test.ts
// ════════════════════════════════════════════════════════════

describe('computeNextRetryAt — edge cases', () => {
  async function importCompute() {
    const mod = await import('@/lib/integrations/pipedrive')
    return mod.computeNextRetryAt
  }

  it('treats attempts=0 the same as attempts=1 (floor at 30s)', async () => {
    const computeNextRetryAt = await importCompute()
    const now = new Date('2026-04-12T10:00:00.000Z')
    const d0 = computeNextRetryAt(0, now).getTime() - now.getTime()
    const d1 = computeNextRetryAt(1, now).getTime() - now.getTime()
    expect(d0).toBe(d1)
    expect(d0).toBe(30_000)
  })

  it('treats negative attempts the same as attempts=1', async () => {
    const computeNextRetryAt = await importCompute()
    const now = new Date('2026-04-12T10:00:00.000Z')
    const d = computeNextRetryAt(-1, now).getTime() - now.getTime()
    expect(d).toBe(30_000)
  })

  it('uses current time when no date is provided', async () => {
    const computeNextRetryAt = await importCompute()
    const before = Date.now()
    const result = computeNextRetryAt(1)
    const after = Date.now()
    expect(result.getTime()).toBeGreaterThanOrEqual(before + 30_000)
    expect(result.getTime()).toBeLessThanOrEqual(after + 30_000)
  })
})

// ════════════════════════════════════════════════════════════
// isPipedriveConfigured
// ════════════════════════════════════════════════════════════

describe('isPipedriveConfigured', () => {
  async function importIsConfigured() {
    const mod = await import('@/lib/integrations/pipedrive')
    return mod.isPipedriveConfigured
  }

  it('returns true when token and domain are set', async () => {
    setEnv()
    const isPipedriveConfigured = await importIsConfigured()
    expect(isPipedriveConfigured()).toBe(true)
  })

  it('returns false when token is missing', async () => {
    setEnv({ PIPEDRIVE_API_TOKEN: undefined })
    const isPipedriveConfigured = await importIsConfigured()
    expect(isPipedriveConfigured()).toBe(false)
  })

  it('returns false when domain is missing', async () => {
    setEnv({ PIPEDRIVE_COMPANY_DOMAIN: undefined })
    const isPipedriveConfigured = await importIsConfigured()
    expect(isPipedriveConfigured()).toBe(false)
  })
})
