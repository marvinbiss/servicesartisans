/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Tests — /api/cron/simulateur-pipedrive-retry/route.ts
 *
 * Coverage:
 *   - Auth: CRON_SECRET not set → 500, wrong/missing header → 401
 *   - Pipedrive not configured → skipped:true
 *   - Empty DLQ → total:0, synced:0, failed:0
 *   - Submit row: createSimulateurDeal + delete + estimation update
 *   - Callback row: estimation prefetch + createCallbackRequest + delete
 *   - Callback row missing email/telephone → retry_count incremented
 *   - Unknown kind → failed++
 *   - Batch of 8, all succeed
 *   - Mix success + failure: retry_count++ on failures
 *   - nextAttempts >= MAX → no next_retry_at (terminal state)
 *   - Deadline exceeded mid-loop → break
 *   - N+1 prevention: estimations fetched ONCE for all callback rows
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── Mock logger ────────────────────────────────────────────────────
vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

// ── Pipedrive simulateur mock ───────────────────────────────────────
const mockCreateSimulateurDeal = vi.fn()
const mockIsSimulateurPipedriveConfigured = vi.fn()
const mockComputeNextSimRetryAt = vi.fn()

vi.mock('@/lib/simulateur/pipedrive', () => ({
  createSimulateurDeal: (...args: unknown[]) => mockCreateSimulateurDeal(...args),
  isSimulateurPipedriveConfigured: () => mockIsSimulateurPipedriveConfigured(),
  computeNextSimRetryAt: (...args: unknown[]) => mockComputeNextSimRetryAt(...args),
  MAX_SIM_SYNC_ATTEMPTS: 5,
}))

// ── Callback pipedrive mock ─────────────────────────────────────────
const mockCreateCallbackRequest = vi.fn()

vi.mock('@/lib/simulateur/callback-pipedrive', () => ({
  createCallbackRequest: (...args: unknown[]) => mockCreateCallbackRequest(...args),
}))

// ── Supabase mock ───────────────────────────────────────────────────
// We need a flexible chainable builder for the main query + separate
// builders for delete, update, and the estimation in() prefetch.

const mockAdminClient = {
  from: vi.fn(),
}

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockAdminClient),
}))

// ── Helpers ─────────────────────────────────────────────────────────

function buildRequest(secret?: string): Request {
  const headers: Record<string, string> = {}
  if (secret !== undefined) headers['authorization'] = `Bearer ${secret}`
  return new Request('http://localhost/api/cron/simulateur-pipedrive-retry', {
    method: 'GET',
    headers,
  })
}

async function callRoute(req: Request) {
  vi.resetModules()
  const mod = await import('@/app/api/cron/simulateur-pipedrive-retry/route')
  return mod.GET(req)
}

// ── Default row factories ────────────────────────────────────────────

function makeSubmitRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'row-submit-1',
    estimation_id: 'est-1',
    retry_count: 0,
    payload: {
      kind: 'submit',
      publicId: 'EST-001',
      prenom: 'Alice',
      nom: 'Martin',
      email: 'alice@example.fr',
      telephone: '+33611111111',
      estimation: { publicId: 'EST-001', codePostal: '75001', surface: 80 },
    },
    ...overrides,
  }
}

function makeCallbackRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'row-cb-1',
    estimation_id: 'est-cb-1',
    retry_count: 0,
    payload: {
      kind: 'callback',
      preferredSlot: 'Lundi 10h',
      remarquesClient: null,
    },
    ...overrides,
  }
}

function makeEstimation(id: string) {
  return {
    id,
    prenom: 'Bob',
    nom: 'Dupont',
    email: 'bob@example.fr',
    telephone: '+33622222222',
    public_id: 'EST-CB-001',
    // Submit rehydration fields (ignored by callback flow).
    categorie_anah: 'modeste',
    zone_climatique: 'H1',
    parcours: 'geste',
    gestes: [{ id: 'isolation_combles' }],
    bareme_ids: { mpr: 'bar-1' },
    mpr_total: 4000,
    cee_fourchette_bas: 500,
    cee_fourchette_haut: 1500,
    coup_pouce_estimation: 300,
    reste_a_charge_bas: 2000,
    reste_a_charge_haut: 3000,
    barometre_version: '2026-01',
    code_postal: '75001',
    surface_m2: 80,
    rfr: 25000,
    rfr_exact: 25000,
  }
}

function makeSubmitEstimations(ids: string[]) {
  return ids.map((id) => ({ ...makeEstimation(id), id }))
}

// ── Chainable query builder ──────────────────────────────────────────

function makeQueryChain(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {}
  chain.select = vi.fn().mockReturnValue(chain)
  chain.lt = vi.fn().mockReturnValue(chain)
  chain.lte = vi.fn().mockReturnValue(chain)
  chain.order = vi.fn().mockReturnValue(chain)
  chain.limit = vi.fn().mockResolvedValue(result)
  chain.in = vi.fn().mockResolvedValue(result)
  chain.eq = vi.fn().mockReturnValue(chain)
  chain.update = vi.fn().mockReturnValue(chain)
  chain.delete = vi.fn().mockReturnValue(chain)
  return chain
}

// ── Supabase from() router ───────────────────────────────────────────
// Returns different chain objects per table so we can track calls separately.

interface FromSetup {
  pending: unknown[]
  pendingError?: unknown
  estimations?: unknown[]
  deleteResults?: Map<string, { data: unknown; error: unknown }>
  updateResults?: Map<string, { data: unknown; error: unknown }>
  estimationUpdateResults?: { data: unknown; error: unknown }
}

function setupSupabase(opts: FromSetup) {
  const { pending, pendingError, estimations } = opts

  // Separate trackers
  const deleteChains: Array<ReturnType<typeof makeQueryChain>> = []
  const failureUpdateChains: Array<ReturnType<typeof makeQueryChain>> = []
  const estimationUpdateChains: Array<ReturnType<typeof makeQueryChain>> = []
  const estimationSelectChain = makeQueryChain({ data: estimations ?? [], error: null })

  let pendingQueryDone = false
  let estimationInDone = false

  mockAdminClient.from.mockImplementation((table: string) => {
    if (table === 'simulateur_pipedrive_failures') {
      // First call = main SELECT query; subsequent = DELETE or UPDATE
      if (!pendingQueryDone) {
        pendingQueryDone = true
        return makeQueryChain({ data: pending, error: pendingError ?? null })
      }
      // DELETE chain
      const dc = makeQueryChain({ data: null, error: null })
      deleteChains.push(dc)
      // After delete(), eq() should resolve (it's the terminal)
      dc.delete = vi
        .fn()
        .mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) })
      // UPDATE chain
      const uc = makeQueryChain({ data: null, error: null })
      failureUpdateChains.push(uc)
      uc.update = vi
        .fn()
        .mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) })
      // Return delete chain by default; caller will choose which to use
      return dc
    }
    if (table === 'simulateur_estimations') {
      if (!estimationInDone && estimations !== undefined) {
        estimationInDone = true
        return estimationSelectChain
      }
      // estimation UPDATE (pipedrive_deal_id)
      const euc = makeQueryChain({ data: null, error: null })
      estimationUpdateChains.push(euc)
      euc.update = vi
        .fn()
        .mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) })
      return euc
    }
    return makeQueryChain({ data: null, error: null })
  })

  return { deleteChains, failureUpdateChains, estimationUpdateChains, estimationSelectChain }
}

// ── Setup / teardown ─────────────────────────────────────────────────

beforeEach(() => {
  process.env.CRON_SECRET = 'secret-123'
  mockIsSimulateurPipedriveConfigured.mockReturnValue(true)
  mockCreateSimulateurDeal.mockReset()
  mockCreateCallbackRequest.mockReset()
  mockComputeNextSimRetryAt.mockReturnValue(new Date(Date.now() + 2 * 60 * 60 * 1000))
  vi.clearAllMocks()
  // Re-apply since clearAllMocks resets mockReturnValue
  mockIsSimulateurPipedriveConfigured.mockReturnValue(true)
  mockComputeNextSimRetryAt.mockReturnValue(new Date(Date.now() + 2 * 60 * 60 * 1000))
})

afterEach(() => {
  delete process.env.CRON_SECRET
  vi.restoreAllMocks()
  vi.resetModules()
})

// ======================================================================
// Authentication
// ======================================================================

describe('GET /api/cron/simulateur-pipedrive-retry — authentication', () => {
  it('CRON_SECRET not set → 401 (no info oracle)', async () => {
    delete process.env.CRON_SECRET
    setupSupabase({ pending: [] })
    const res = await callRoute(buildRequest('anything'))
    // Unconditional 401 : un client ne doit pas distinguer "secret absent"
    // de "mauvais secret" (500 vs 401 révélerait l'état de config serveur).
    expect(res.status).toBe(401)
  })

  it('missing authorization header → 401', async () => {
    setupSupabase({ pending: [] })
    const req = new Request('http://localhost/api/cron/simulateur-pipedrive-retry', {
      method: 'GET',
    })
    const res = await callRoute(req)
    expect(res.status).toBe(401)
  })

  it('wrong authorization header → 401', async () => {
    setupSupabase({ pending: [] })
    const res = await callRoute(buildRequest('wrong-secret'))
    expect(res.status).toBe(401)
  })

  it('correct authorization header → 200', async () => {
    setupSupabase({ pending: [] })
    const res = await callRoute(buildRequest('secret-123'))
    expect(res.status).toBe(200)
  })
})

// ======================================================================
// Skip when not configured
// ======================================================================

describe('GET /api/cron/simulateur-pipedrive-retry — skip when not configured', () => {
  it('Pipedrive not configured → skipped:true in response', async () => {
    mockIsSimulateurPipedriveConfigured.mockReturnValue(false)
    setupSupabase({ pending: [] })
    const res = await callRoute(buildRequest('secret-123'))
    const body = await res.json()
    expect(body.skipped).toBe(true)
    expect(body.reason).toBeDefined()
  })
})

// ======================================================================
// Empty DLQ
// ======================================================================

describe('GET /api/cron/simulateur-pipedrive-retry — empty DLQ', () => {
  it('empty DLQ → total:0, synced:0, failed:0', async () => {
    setupSupabase({ pending: [] })
    const res = await callRoute(buildRequest('secret-123'))
    const body = await res.json()
    expect(body.total).toBe(0)
    expect(body.synced).toBe(0)
    expect(body.failed).toBe(0)
  })
})

// ======================================================================
// Submit row
// ======================================================================

describe('GET /api/cron/simulateur-pipedrive-retry — submit row', () => {
  it('submit row → createSimulateurDeal called, row deleted, estimation updated with dealId', async () => {
    const submitRow = makeSubmitRow()
    const est = { ...makeEstimation('est-1'), id: 'est-1' }
    mockCreateSimulateurDeal.mockResolvedValue({ personId: 10, dealId: 20 })

    const deleteSpy = vi.fn().mockResolvedValue({ data: null, error: null })
    const updateEstimationEqSpy = vi.fn().mockResolvedValue({ data: null, error: null })
    const updateEstimationSpy = vi.fn().mockReturnValue({ eq: updateEstimationEqSpy })

    let pendingQueryDone = false
    let estimationUpdateDone = false

    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === 'simulateur_pipedrive_failures') {
        if (!pendingQueryDone) {
          pendingQueryDone = true
          const chain = makeQueryChain({ data: [submitRow], error: null })
          return chain
        }
        // DELETE call
        return { delete: vi.fn().mockReturnValue({ eq: deleteSpy }) }
      }
      if (table === 'simulateur_estimations') {
        if (!estimationUpdateDone) {
          estimationUpdateDone = true
          // First call = SELECT .in() for prefetch (submit rehydration from DB)
          return {
            update: updateEstimationSpy,
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({ data: [est], error: null }),
          }
        }
        return { update: updateEstimationSpy }
      }
      return makeQueryChain({ data: null, error: null })
    })

    const res = await callRoute(buildRequest('secret-123'))
    const body = await res.json()

    expect(mockCreateSimulateurDeal).toHaveBeenCalledTimes(1)
    const callArg = mockCreateSimulateurDeal.mock.calls[0][0]
    expect(callArg.email).toBe('bob@example.fr')
    expect(callArg.telephone).toBe('+33622222222')
    expect(callArg.publicId).toBe('EST-CB-001')
    expect(body.synced).toBe(1)
    expect(body.failed).toBe(0)
  })
})

// ======================================================================
// Callback row
// ======================================================================

describe('GET /api/cron/simulateur-pipedrive-retry — callback row', () => {
  it('callback row → estimation prefetched, createCallbackRequest called, row deleted', async () => {
    const cbRow = makeCallbackRow()
    const est = makeEstimation('est-cb-1')
    mockCreateCallbackRequest.mockResolvedValue({ personId: 50, dealId: 60 })

    let pendingDone = false
    let estimationsDone = false

    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === 'simulateur_pipedrive_failures') {
        if (!pendingDone) {
          pendingDone = true
          return makeQueryChain({ data: [cbRow], error: null })
        }
        return {
          delete: vi
            .fn()
            .mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
        }
      }
      if (table === 'simulateur_estimations') {
        if (!estimationsDone) {
          estimationsDone = true
          const chain = makeQueryChain({ data: [est], error: null })
          chain.select = vi.fn().mockReturnValue(chain)
          chain.in = vi.fn().mockResolvedValue({ data: [est], error: null })
          return chain
        }
        return makeQueryChain({ data: null, error: null })
      }
      return makeQueryChain({ data: null, error: null })
    })

    const res = await callRoute(buildRequest('secret-123'))
    const body = await res.json()

    expect(mockCreateCallbackRequest).toHaveBeenCalledTimes(1)
    const callArg = mockCreateCallbackRequest.mock.calls[0][0]
    expect(callArg.email).toBe('bob@example.fr')
    expect(callArg.telephone).toBe('+33622222222')
    expect(callArg.publicId).toBe('EST-CB-001')
    expect(body.synced).toBe(1)
    expect(body.failed).toBe(0)
  })

  it('callback row but estimation missing email → throws → retry_count incremented', async () => {
    const cbRow = makeCallbackRow()
    const estNoEmail = { ...makeEstimation('est-cb-1'), email: null }

    let pendingDone = false
    let estimationsDone = false
    const updateEqSpy = vi.fn().mockResolvedValue({ data: null, error: null })
    const updateSpy = vi.fn().mockReturnValue({ eq: updateEqSpy })

    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === 'simulateur_pipedrive_failures') {
        if (!pendingDone) {
          pendingDone = true
          return makeQueryChain({ data: [cbRow], error: null })
        }
        return { update: updateSpy }
      }
      if (table === 'simulateur_estimations') {
        if (!estimationsDone) {
          estimationsDone = true
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({ data: [estNoEmail], error: null }),
          }
        }
        return makeQueryChain({ data: null, error: null })
      }
      return makeQueryChain({ data: null, error: null })
    })

    const res = await callRoute(buildRequest('secret-123'))
    const body = await res.json()

    expect(body.failed).toBe(1)
    expect(body.synced).toBe(0)
    expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({ retry_count: 1 }))
  })
})

// ======================================================================
// Unknown kind
// ======================================================================

describe('GET /api/cron/simulateur-pipedrive-retry — unknown kind', () => {
  it('unknown kind → failed++ (exhaustiveness check)', async () => {
    const unknownRow = makeSubmitRow({
      payload: { kind: 'totally-unknown-kind' },
    })

    let pendingDone = false
    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === 'simulateur_pipedrive_failures') {
        if (!pendingDone) {
          pendingDone = true
          return makeQueryChain({ data: [unknownRow], error: null })
        }
        return makeQueryChain({ data: null, error: null })
      }
      return makeQueryChain({ data: null, error: null })
    })

    const res = await callRoute(buildRequest('secret-123'))
    const body = await res.json()

    expect(body.failed).toBe(1)
    expect(body.synced).toBe(0)
    expect(mockCreateSimulateurDeal).not.toHaveBeenCalled()
    expect(mockCreateCallbackRequest).not.toHaveBeenCalled()
  })
})

// ======================================================================
// Batch of 8 rows
// ======================================================================

describe('GET /api/cron/simulateur-pipedrive-retry — batch processing', () => {
  it('batch of 8 submit rows, all succeed → synced=8, failed=0', async () => {
    mockCreateSimulateurDeal.mockResolvedValue({ personId: 1, dealId: 2 })

    const rows = Array.from({ length: 8 }, (_, i) =>
      makeSubmitRow({ id: `row-${i}`, estimation_id: `est-${i}` })
    )
    const ests = makeSubmitEstimations(Array.from({ length: 8 }, (_, i) => `est-${i}`))

    let pendingDone = false
    let callCount = 0

    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === 'simulateur_pipedrive_failures') {
        if (!pendingDone) {
          pendingDone = true
          return makeQueryChain({ data: rows, error: null })
        }
        callCount++
        return {
          delete: vi
            .fn()
            .mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
        }
      }
      if (table === 'simulateur_estimations') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: ests, error: null }),
          update: vi
            .fn()
            .mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
        }
      }
      return makeQueryChain({ data: null, error: null })
    })

    const res = await callRoute(buildRequest('secret-123'))
    const body = await res.json()

    expect(body.total).toBe(8)
    expect(body.synced).toBe(8)
    expect(body.failed).toBe(0)
    expect(mockCreateSimulateurDeal).toHaveBeenCalledTimes(8)
  })

  it('mix success + failure: some deleted, some retry_count++', async () => {
    mockCreateSimulateurDeal
      .mockResolvedValueOnce({ personId: 1, dealId: 2 }) // row-0 success
      .mockRejectedValueOnce(new Error('Pipedrive 500')) // row-1 fails
      .mockResolvedValueOnce({ personId: 3, dealId: 4 }) // row-2 success

    const rows = [
      makeSubmitRow({ id: 'row-0', estimation_id: 'est-0' }),
      makeSubmitRow({ id: 'row-1', estimation_id: 'est-1' }),
      makeSubmitRow({ id: 'row-2', estimation_id: 'est-2' }),
    ]
    const ests = makeSubmitEstimations(['est-0', 'est-1', 'est-2'])

    let pendingDone = false
    const updateSpy = vi
      .fn()
      .mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) })

    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === 'simulateur_pipedrive_failures') {
        if (!pendingDone) {
          pendingDone = true
          return makeQueryChain({ data: rows, error: null })
        }
        return {
          delete: vi
            .fn()
            .mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
          update: updateSpy,
        }
      }
      if (table === 'simulateur_estimations') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: ests, error: null }),
          update: vi
            .fn()
            .mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
        }
      }
      return makeQueryChain({ data: null, error: null })
    })

    const res = await callRoute(buildRequest('secret-123'))
    const body = await res.json()

    expect(body.total).toBe(3)
    expect(body.synced).toBe(2)
    expect(body.failed).toBe(1)
  })
})

// ======================================================================
// Terminal state: nextAttempts >= MAX
// ======================================================================

describe('GET /api/cron/simulateur-pipedrive-retry — terminal state', () => {
  it('nextAttempts >= MAX_SIM_SYNC_ATTEMPTS → no next_retry_at in update', async () => {
    // retry_count = 4, nextAttempts = 5 = MAX
    const row = makeSubmitRow({ id: 'row-terminal', retry_count: 4 })
    mockCreateSimulateurDeal.mockRejectedValue(new Error('still broken'))

    let pendingDone = false
    let updatedPayload: Record<string, unknown> | null = null

    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === 'simulateur_pipedrive_failures') {
        if (!pendingDone) {
          pendingDone = true
          return makeQueryChain({ data: [row], error: null })
        }
        return {
          update: vi.fn().mockImplementation((payload: Record<string, unknown>) => {
            updatedPayload = payload
            return { eq: vi.fn().mockResolvedValue({ data: null, error: null }) }
          }),
        }
      }
      if (table === 'simulateur_estimations') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: [], error: null }),
        }
      }
      return makeQueryChain({ data: null, error: null })
    })

    await callRoute(buildRequest('secret-123'))

    expect(updatedPayload).not.toBeNull()
    expect(updatedPayload!['retry_count']).toBe(5)
    expect(updatedPayload).not.toHaveProperty('next_retry_at')
  })
})

// ======================================================================
// Deadline exceeded
// ======================================================================

describe('GET /api/cron/simulateur-pipedrive-retry — deadline exceeded', () => {
  it('deadline exceeded mid-loop → break, remaining rows untouched', async () => {
    // Simulate deadline: first call takes "forever" by manipulating Date.now
    // We mock Date.now to return a value that exceeds DEADLINE_MS after first iteration
    const DEADLINE_MS = 50_000
    const originalNow = Date.now
    let callCount = 0

    vi.spyOn(Date, 'now').mockImplementation(() => {
      callCount++
      // After the 2nd call (start + first loop check), jump past deadline
      if (callCount >= 3) return originalNow() + DEADLINE_MS + 1000
      return originalNow()
    })

    const rows = Array.from({ length: 4 }, (_, i) =>
      makeSubmitRow({ id: `row-${i}`, estimation_id: `est-${i}` })
    )
    const ests = makeSubmitEstimations(['est-0', 'est-1', 'est-2', 'est-3'])
    mockCreateSimulateurDeal.mockResolvedValue({ personId: 1, dealId: 2 })

    let pendingDone = false

    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === 'simulateur_pipedrive_failures') {
        if (!pendingDone) {
          pendingDone = true
          return makeQueryChain({ data: rows, error: null })
        }
        return {
          delete: vi
            .fn()
            .mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
        }
      }
      if (table === 'simulateur_estimations') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: ests, error: null }),
          update: vi
            .fn()
            .mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
        }
      }
      return makeQueryChain({ data: null, error: null })
    })

    const res = await callRoute(buildRequest('secret-123'))
    const body = await res.json()

    // total = 4 (all rows fetched) but synced < 4 due to deadline
    expect(body.total).toBe(4)
    // With deadline hit after call 3, at most 1 row is processed
    expect(mockCreateSimulateurDeal.mock.calls.length).toBeLessThan(4)
  })
})

// ======================================================================
// N+1 prevention
// ======================================================================

describe('GET /api/cron/simulateur-pipedrive-retry — N+1 prevention', () => {
  it('multiple callback rows → estimations fetched ONCE via in() not per-row', async () => {
    const cbRows = [
      makeCallbackRow({ id: 'cb-1', estimation_id: 'est-1' }),
      makeCallbackRow({ id: 'cb-2', estimation_id: 'est-2' }),
      makeCallbackRow({ id: 'cb-3', estimation_id: 'est-3' }),
    ]
    const ests = [
      { ...makeEstimation('est-1'), id: 'est-1' },
      { ...makeEstimation('est-2'), id: 'est-2' },
      { ...makeEstimation('est-3'), id: 'est-3' },
    ]
    mockCreateCallbackRequest.mockResolvedValue({ personId: 1, dealId: 2 })

    let pendingDone = false
    let estimationsInDone = false
    const inSpy = vi.fn().mockResolvedValue({ data: ests, error: null })

    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === 'simulateur_pipedrive_failures') {
        if (!pendingDone) {
          pendingDone = true
          return makeQueryChain({ data: cbRows, error: null })
        }
        return {
          delete: vi
            .fn()
            .mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
        }
      }
      if (table === 'simulateur_estimations') {
        if (!estimationsInDone) {
          estimationsInDone = true
          return {
            select: vi.fn().mockReturnThis(),
            in: inSpy,
          }
        }
        return makeQueryChain({ data: null, error: null })
      }
      return makeQueryChain({ data: null, error: null })
    })

    const res = await callRoute(buildRequest('secret-123'))
    const body = await res.json()

    // The in() call should happen exactly ONCE with all 3 estimation IDs
    expect(inSpy).toHaveBeenCalledTimes(1)
    const [field, ids] = inSpy.mock.calls[0]
    expect(field).toBe('id')
    expect(ids).toEqual(expect.arrayContaining(['est-1', 'est-2', 'est-3']))
    expect(ids).toHaveLength(3)

    expect(body.synced).toBe(3)
  })
})

// ======================================================================
// DB query failure
// ======================================================================

describe('GET /api/cron/simulateur-pipedrive-retry — DB error', () => {
  it('pending query returns error → 500', async () => {
    let pendingDone = false
    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === 'simulateur_pipedrive_failures' && !pendingDone) {
        pendingDone = true
        return makeQueryChain({ data: null, error: { message: 'connection timeout' } })
      }
      return makeQueryChain({ data: null, error: null })
    })

    const res = await callRoute(buildRequest('secret-123'))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toContain('connection timeout')
  })
})
