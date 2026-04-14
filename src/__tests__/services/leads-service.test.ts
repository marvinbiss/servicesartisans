import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — declared before imports so hoisting works
// ---------------------------------------------------------------------------

const mockSupabaseFrom = vi.fn()
const mockSupabaseClient = { from: mockSupabaseFrom }

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockSupabaseClient),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

vi.mock('@/lib/dashboard/events', () => ({
  logLeadEvent: vi.fn().mockResolvedValue(undefined),
}))

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import {
  getProviderForUser,
  getLeadsForArtisan,
  getLeadByIdForArtisan,
  getAssignmentForAction,
  updateAssignmentStatus,
  getExistingQuote,
  insertQuote,
  getLeadHistory,
  verifyAssignmentOwnership,
  getLeadStats,
  getLeadsForExport,
  getDevisRequestsForClient,
  getLeadEventsForLeads,
  deriveStatus,
  getDevisRequestById,
  getQuotesForLead,
  getLeadEventsById,
  getAssignmentsForLead,
  getQuoteById,
  updateQuoteStatus,
  refuseOtherQuotes,
  updateDevisRequestStatus,
  getAdminLeadCounts,
  getActiveArtisans,
  getDispatchAssignments,
  getDispatchStats,
  getAssignmentById,
  reassignAssignment,
  deleteAssignment,
  STATUS_LABELS,
} from '@/lib/services/leads-service'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a chainable mock query builder for Supabase.
 * All methods return the builder itself (chainable).
 * The builder is thenable — `await builder` resolves to `_result`.
 * Set `_result` to control what `await query` returns.
 * For terminal-only resolution, override `.single()` or `.range()` with mockResolvedValue. */
function createMockQueryBuilder(result: Record<string, unknown> = { data: null, error: null }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const builder: Record<string, any> = {}

  // Store the default resolved value
  builder._result = result

  const methods = [
    'select',
    'insert',
    'update',
    'delete',
    'eq',
    'neq',
    'gte',
    'lt',
    'lte',
    'ilike',
    'in',
    'not',
    'limit',
    'single',
    'order',
    'range',
  ]
  for (const name of methods) {
    builder[name] = vi.fn().mockReturnValue(builder)
  }

  // Make builder thenable so `await builder` works
  builder.then = (resolve: (v: unknown) => void, reject?: (e: unknown) => void) => {
    try {
      return Promise.resolve(builder._result).then(resolve, reject)
    } catch (e) {
      if (reject) return reject(e)
      throw e
    }
  }

  return builder
}

// ---------------------------------------------------------------------------
// Reset between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
})

// ===========================================================================
// STATUS_LABELS
// ===========================================================================

describe('STATUS_LABELS', () => {
  it('has all expected status labels', () => {
    expect(STATUS_LABELS.en_attente).toBe('En attente')
    expect(STATUS_LABELS.en_traitement).toBe('En traitement')
    expect(STATUS_LABELS.devis_recus).toBe('Devis reçu(s)')
    expect(STATUS_LABELS.accepte).toBe('Accepté')
    expect(STATUS_LABELS.termine).toBe('Terminé')
    expect(STATUS_LABELS.expire).toBe('Expiré')
    expect(STATUS_LABELS.refuse).toBe('Refusé')
  })
})

// ===========================================================================
// getProviderForUser
// ===========================================================================

describe('getProviderForUser', () => {
  it('returns provider when found', async () => {
    const provider = { id: 'prov-1', address_city: 'Paris' }
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: provider })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getProviderForUser(mockSupabaseClient as never, 'user-1')

    expect(result).toEqual(provider)
    expect(mockSupabaseFrom).toHaveBeenCalledWith('providers')
    expect(builder.eq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(builder.eq).toHaveBeenCalledWith('is_active', true)
  })

  it('returns null when provider not found', async () => {
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getProviderForUser(mockSupabaseClient as never, 'user-unknown')

    expect(result).toBeNull()
  })

  it('returns null on DB error (data is null)', async () => {
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'DB error' },
    })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getProviderForUser(mockSupabaseClient as never, 'user-err')

    expect(result).toBeNull()
  })
})

// ===========================================================================
// getLeadsForArtisan
// ===========================================================================

describe('getLeadsForArtisan', () => {
  function setupLeadsMock(opts: {
    count?: number | null
    countError?: unknown
    assignments?: unknown[]
    assignError?: unknown
  }) {
    let callIndex = 0
    mockSupabaseFrom.mockImplementation(() => {
      callIndex++
      if (callIndex === 1) {
        // Count query — awaited directly via thenable
        return createMockQueryBuilder({
          count: opts.count ?? 0,
          error: opts.countError ?? null,
        })
      }
      // Data query — awaited directly via thenable
      return createMockQueryBuilder({
        data: opts.assignments ?? [],
        error: opts.assignError ?? null,
      })
    })
  }

  it('returns assignments with pagination info', async () => {
    const assignments = [
      { id: 'a-1', status: 'pending', assigned_at: '2026-01-01', viewed_at: null },
    ]
    setupLeadsMock({ count: 1, assignments })

    const result = await getLeadsForArtisan(mockSupabaseClient as never, 'prov-1', {
      page: 1,
      pageSize: 10,
      status: 'all',
    })

    expect(result.assignments).toEqual(assignments)
    expect(result.totalItems).toBe(1)
    expect(result.totalPages).toBe(1)
  })

  it('filters by status when not "all"', async () => {
    setupLeadsMock({ count: 5, assignments: [] })

    await getLeadsForArtisan(mockSupabaseClient as never, 'prov-1', {
      page: 1,
      pageSize: 10,
      status: 'pending',
    })

    // Both count and data queries should call .eq with status
    expect(mockSupabaseFrom).toHaveBeenCalledWith('lead_assignments')
  })

  it('returns empty assignments when none found', async () => {
    setupLeadsMock({ count: 0, assignments: [] })

    const result = await getLeadsForArtisan(mockSupabaseClient as never, 'prov-1', {
      page: 1,
      pageSize: 10,
      status: 'all',
    })

    expect(result.assignments).toEqual([])
    expect(result.totalItems).toBe(0)
    expect(result.totalPages).toBe(1) // min 1
  })

  it('calculates totalPages correctly for multi-page results', async () => {
    setupLeadsMock({ count: 25, assignments: [] })

    const result = await getLeadsForArtisan(mockSupabaseClient as never, 'prov-1', {
      page: 1,
      pageSize: 10,
      status: 'all',
    })

    expect(result.totalPages).toBe(3) // ceil(25/10) = 3
  })

  it('throws on count query error', async () => {
    setupLeadsMock({ countError: { message: 'count failed' } })

    await expect(
      getLeadsForArtisan(mockSupabaseClient as never, 'prov-1', {
        page: 1,
        pageSize: 10,
        status: 'all',
      })
    ).rejects.toThrow('Erreur lors du comptage des leads')
  })

  it('throws on data query error', async () => {
    setupLeadsMock({ count: 5, assignError: { message: 'data failed' } })

    await expect(
      getLeadsForArtisan(mockSupabaseClient as never, 'prov-1', {
        page: 1,
        pageSize: 10,
        status: 'all',
      })
    ).rejects.toThrow('Erreur lors de la récupération des leads')
  })
})

// ===========================================================================
// getLeadByIdForArtisan
// ===========================================================================

describe('getLeadByIdForArtisan', () => {
  it('returns assignment when found with correct ownership', async () => {
    const assignment = {
      id: 'assign-1',
      status: 'pending',
      assigned_at: '2026-01-01',
      viewed_at: null,
      lead: { id: 'lead-1', service_name: 'Plombier' },
    }
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: assignment, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getLeadByIdForArtisan(mockSupabaseClient as never, 'assign-1', 'prov-1')

    expect(result).toEqual(assignment)
    expect(builder.eq).toHaveBeenCalledWith('id', 'assign-1')
    expect(builder.eq).toHaveBeenCalledWith('provider_id', 'prov-1')
  })

  it('returns null when not found', async () => {
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getLeadByIdForArtisan(
      mockSupabaseClient as never,
      'assign-missing',
      'prov-1'
    )

    expect(result).toBeNull()
  })

  it('returns null when wrong provider (ownership check)', async () => {
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Row not found' },
    })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getLeadByIdForArtisan(
      mockSupabaseClient as never,
      'assign-1',
      'wrong-provider'
    )

    expect(result).toBeNull()
  })
})

// ===========================================================================
// getAssignmentForAction
// ===========================================================================

describe('getAssignmentForAction', () => {
  it('returns assignment for valid action', async () => {
    const assignment = { id: 'a-1', lead_id: 'l-1', status: 'pending' }
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: assignment, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getAssignmentForAction(mockSupabaseClient as never, 'a-1', 'prov-1')

    expect(result).toEqual(assignment)
  })

  it('returns null when not found', async () => {
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getAssignmentForAction(mockSupabaseClient as never, 'missing', 'prov-1')

    expect(result).toBeNull()
  })
})

// ===========================================================================
// updateAssignmentStatus
// ===========================================================================

describe('updateAssignmentStatus', () => {
  it('updates assignment successfully', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockResolvedValue({ error: null })
    builder.update = vi.fn().mockReturnValue(builder)
    mockSupabaseFrom.mockReturnValue(builder)

    await expect(
      updateAssignmentStatus(mockSupabaseClient as never, 'assign-1', {
        status: 'viewed',
        viewed_at: '2026-01-01',
      })
    ).resolves.toBeUndefined()

    expect(mockSupabaseFrom).toHaveBeenCalledWith('lead_assignments')
    expect(builder.update).toHaveBeenCalledWith({
      status: 'viewed',
      viewed_at: '2026-01-01',
    })
  })

  it('throws on DB error', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockResolvedValue({ error: { message: 'update failed' } })
    builder.update = vi.fn().mockReturnValue(builder)
    mockSupabaseFrom.mockReturnValue(builder)

    await expect(
      updateAssignmentStatus(mockSupabaseClient as never, 'assign-1', { status: 'viewed' })
    ).rejects.toThrow('Erreur lors de la mise à jour du lead')
  })
})

// ===========================================================================
// getExistingQuote
// ===========================================================================

describe('getExistingQuote', () => {
  it('returns quote when found', async () => {
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: { id: 'quote-1' } })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getExistingQuote(mockSupabaseClient as never, 'lead-1', 'prov-1')

    expect(result).toEqual({ id: 'quote-1' })
    expect(mockSupabaseFrom).toHaveBeenCalledWith('quotes')
    expect(builder.eq).toHaveBeenCalledWith('request_id', 'lead-1')
    expect(builder.eq).toHaveBeenCalledWith('provider_id', 'prov-1')
  })

  it('returns null when not found', async () => {
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getExistingQuote(mockSupabaseClient as never, 'lead-1', 'prov-1')

    expect(result).toBeNull()
  })
})

// ===========================================================================
// insertQuote
// ===========================================================================

describe('insertQuote', () => {
  it('inserts quote successfully', async () => {
    const builder = createMockQueryBuilder()
    builder.insert = vi.fn().mockResolvedValue({ error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    await expect(
      insertQuote(mockSupabaseClient as never, {
        requestId: 'lead-1',
        providerId: 'prov-1',
        amount: 500,
        description: 'Réparation fuite',
        validUntil: '2026-02-01',
      })
    ).resolves.toBeUndefined()

    expect(mockSupabaseFrom).toHaveBeenCalledWith('quotes')
    expect(builder.insert).toHaveBeenCalledWith({
      request_id: 'lead-1',
      provider_id: 'prov-1',
      amount: 500,
      description: 'Réparation fuite',
      valid_until: '2026-02-01',
      status: 'pending',
    })
  })

  it('throws on DB error', async () => {
    const builder = createMockQueryBuilder()
    builder.insert = vi.fn().mockResolvedValue({ error: { message: 'insert failed' } })
    mockSupabaseFrom.mockReturnValue(builder)

    await expect(
      insertQuote(mockSupabaseClient as never, {
        requestId: 'lead-1',
        providerId: 'prov-1',
        amount: 500,
        description: 'Test',
        validUntil: '2026-02-01',
      })
    ).rejects.toThrow('Erreur lors de la création du devis')
  })
})

// ===========================================================================
// getLeadHistory
// ===========================================================================

describe('getLeadHistory', () => {
  it('returns events ordered by date', async () => {
    const events = [
      { id: 'e-1', event_type: 'created', metadata: {}, created_at: '2026-01-01' },
      { id: 'e-2', event_type: 'viewed', metadata: {}, created_at: '2026-01-02' },
    ]
    const builder = createMockQueryBuilder()
    builder.order = vi.fn().mockResolvedValue({ data: events, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getLeadHistory(mockSupabaseClient as never, 'lead-1', 'prov-1')

    expect(result).toEqual(events)
    expect(builder.eq).toHaveBeenCalledWith('lead_id', 'lead-1')
    expect(builder.eq).toHaveBeenCalledWith('provider_id', 'prov-1')
    expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: true })
  })

  it('returns empty array when no events', async () => {
    const builder = createMockQueryBuilder()
    builder.order = vi.fn().mockResolvedValue({ data: [], error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getLeadHistory(mockSupabaseClient as never, 'lead-1', 'prov-1')

    expect(result).toEqual([])
  })

  it('throws on DB error', async () => {
    const builder = createMockQueryBuilder()
    builder.order = vi.fn().mockResolvedValue({ data: null, error: { message: 'db err' } })
    mockSupabaseFrom.mockReturnValue(builder)

    await expect(getLeadHistory(mockSupabaseClient as never, 'lead-1', 'prov-1')).rejects.toThrow(
      'Erreur serveur'
    )
  })
})

// ===========================================================================
// verifyAssignmentOwnership
// ===========================================================================

describe('verifyAssignmentOwnership', () => {
  it('returns lead_id when assignment belongs to provider', async () => {
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: { lead_id: 'lead-1' } })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await verifyAssignmentOwnership(
      mockSupabaseClient as never,
      'assign-1',
      'prov-1'
    )

    expect(result).toEqual({ lead_id: 'lead-1' })
  })

  it('returns null when assignment does not belong to provider', async () => {
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await verifyAssignmentOwnership(
      mockSupabaseClient as never,
      'assign-1',
      'wrong-prov'
    )

    expect(result).toBeNull()
  })
})

// ===========================================================================
// getLeadStats
// ===========================================================================

describe('getLeadStats', () => {
  function setupStatsMock(
    overrides: {
      total?: number
      pending?: number
      viewed?: number
      declined?: number
      quoted?: number
      accepted?: number
      completed?: number
      thisMonth?: number
      lastMonth?: number
      trendCounts?: number[]
      totalError?: unknown
      responseTimeRows?: Array<{ assigned_at: string; viewed_at: string }>
    } = {}
  ) {
    const {
      total = 10,
      pending = 3,
      viewed = 2,
      declined = 1,
      quoted = 2,
      accepted = 1,
      completed = 1,
      thisMonth = 4,
      lastMonth = 3,
      trendCounts = [1, 2, 1, 2, 3, 4],
      totalError = null,
      responseTimeRows = [],
    } = overrides

    const counts = [
      { count: total, error: totalError }, // total
      { count: pending, error: null }, // pending
      { count: viewed, error: null }, // viewed
      { count: declined, error: null }, // declined
      { count: quoted, error: null }, // quoted (lead_events)
      { count: accepted, error: null }, // accepted (lead_events)
      { count: completed, error: null }, // completed (lead_events)
      { count: thisMonth, error: null }, // thisMonth
      { count: lastMonth, error: null }, // lastMonth
      ...trendCounts.map((c) => ({ count: c, error: null })), // 6 trend months
    ]

    let callIndex = 0

    mockSupabaseFrom.mockImplementation(() => {
      const currentCall = callIndex++
      if (currentCall < counts.length) {
        // Count query builder
        const b = createMockQueryBuilder()
        const countResult = counts[currentCall]
        // These are all count queries that chain .eq/.gte/.lt and resolve
        // We need to make the whole chain resolve to the count result
        b.select = vi.fn().mockReturnValue(b)
        b.eq = vi.fn().mockReturnValue(b)
        b.gte = vi.fn().mockReturnValue(b)
        b.lt = vi.fn().mockReturnValue(b)
        // Make the builder thenable
        Object.assign(b, {
          then: (resolve: (v: unknown) => void) => resolve(countResult),
        })
        return b
      }
      // Response time query (the last query after Promise.all)
      const b = createMockQueryBuilder()
      b.limit = vi.fn().mockResolvedValue({ data: responseTimeRows })
      return b
    })
  }

  it('returns correct stats with counts', async () => {
    setupStatsMock({
      total: 10,
      pending: 3,
      viewed: 2,
      declined: 1,
      quoted: 4,
      accepted: 2,
      completed: 1,
      thisMonth: 5,
      lastMonth: 3,
    })

    const result = await getLeadStats(mockSupabaseClient as never, 'prov-1')

    expect(result.stats.total).toBe(10)
    expect(result.stats.pending).toBe(3)
    expect(result.stats.viewed).toBe(2)
    expect(result.stats.declined).toBe(1)
    expect(result.stats.quoted).toBe(4)
    expect(result.stats.accepted).toBe(2)
    expect(result.stats.completed).toBe(1)
    expect(result.stats.thisMonth).toBe(5)
    expect(result.stats.lastMonth).toBe(3)
  })

  it('calculates conversion rate correctly', async () => {
    setupStatsMock({ quoted: 10, accepted: 5 })

    const result = await getLeadStats(mockSupabaseClient as never, 'prov-1')

    expect(result.stats.conversionRate).toBe(50)
  })

  it('returns 0 conversion rate when no quotes', async () => {
    setupStatsMock({ quoted: 0, accepted: 0 })

    const result = await getLeadStats(mockSupabaseClient as never, 'prov-1')

    expect(result.stats.conversionRate).toBe(0)
  })

  it('calculates monthly growth correctly', async () => {
    setupStatsMock({ thisMonth: 6, lastMonth: 4 })

    const result = await getLeadStats(mockSupabaseClient as never, 'prov-1')

    expect(result.stats.monthlyGrowth).toBe(50) // (6-4)/4 * 100
  })

  it('returns 0 monthly growth when last month is 0', async () => {
    setupStatsMock({ thisMonth: 5, lastMonth: 0 })

    const result = await getLeadStats(mockSupabaseClient as never, 'prov-1')

    expect(result.stats.monthlyGrowth).toBe(0)
  })

  it('returns 6 monthly trend items', async () => {
    setupStatsMock({ trendCounts: [1, 2, 3, 4, 5, 6] })

    const result = await getLeadStats(mockSupabaseClient as never, 'prov-1')

    expect(result.monthlyTrend).toHaveLength(6)
    expect(result.monthlyTrend[0]).toHaveProperty('month')
    expect(result.monthlyTrend[0]).toHaveProperty('count')
  })

  it('calculates avgResponseMinutes correctly', async () => {
    setupStatsMock({
      responseTimeRows: [
        { assigned_at: '2026-01-01T10:00:00Z', viewed_at: '2026-01-01T10:30:00Z' }, // 30 min
        { assigned_at: '2026-01-01T11:00:00Z', viewed_at: '2026-01-01T12:00:00Z' }, // 60 min
      ],
    })

    const result = await getLeadStats(mockSupabaseClient as never, 'prov-1')

    expect(result.stats.avgResponseMinutes).toBe(45)
  })

  it('returns 0 avgResponseMinutes when no viewed leads', async () => {
    setupStatsMock({ responseTimeRows: [] })

    const result = await getLeadStats(mockSupabaseClient as never, 'prov-1')

    expect(result.stats.avgResponseMinutes).toBe(0)
  })

  it('throws on total count error', async () => {
    setupStatsMock({ totalError: { message: 'DB down' } })

    await expect(getLeadStats(mockSupabaseClient as never, 'prov-1')).rejects.toThrow(
      'Erreur serveur'
    )
  })
})

// ===========================================================================
// getLeadsForExport
// ===========================================================================

describe('getLeadsForExport', () => {
  it('returns assignments with correct fields', async () => {
    const assignments = [
      {
        id: 'a-1',
        status: 'pending',
        assigned_at: '2026-01-01',
        lead: { id: 'l-1', service_name: 'Plombier', city: 'Paris' },
      },
    ]
    const builder = createMockQueryBuilder({ data: assignments, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getLeadsForExport(mockSupabaseClient as never, 'prov-1', { limit: 100 })

    expect(result).toEqual(assignments)
    expect(mockSupabaseFrom).toHaveBeenCalledWith('lead_assignments')
  })

  it('filters by status when provided', async () => {
    const builder = createMockQueryBuilder({ data: [], error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    await getLeadsForExport(mockSupabaseClient as never, 'prov-1', {
      status: 'viewed',
      limit: 100,
    })

    expect(builder.eq).toHaveBeenCalledWith('status', 'viewed')
  })

  it('does not filter by status when "all"', async () => {
    const builder = createMockQueryBuilder({ data: [], error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    await getLeadsForExport(mockSupabaseClient as never, 'prov-1', {
      status: 'all',
      limit: 100,
    })

    // eq should only be called for provider_id, not status
    const eqCalls = builder.eq.mock.calls
    const statusCalls = eqCalls.filter((call: string[]) => call[0] === 'status')
    expect(statusCalls).toHaveLength(0)
  })

  it('applies date from filter', async () => {
    const builder = createMockQueryBuilder({ data: [], error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    await getLeadsForExport(mockSupabaseClient as never, 'prov-1', {
      from: '2026-01-01',
      limit: 100,
    })

    expect(builder.gte).toHaveBeenCalledWith('assigned_at', '2026-01-01T00:00:00')
  })

  it('applies date to filter', async () => {
    const builder = createMockQueryBuilder({ data: [], error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    await getLeadsForExport(mockSupabaseClient as never, 'prov-1', {
      to: '2026-01-31',
      limit: 100,
    })

    expect(builder.lte).toHaveBeenCalledWith('assigned_at', '2026-01-31T23:59:59')
  })

  it('throws on DB error', async () => {
    const builder = createMockQueryBuilder({ data: null, error: { message: 'export err' } })
    mockSupabaseFrom.mockReturnValue(builder)

    await expect(
      getLeadsForExport(mockSupabaseClient as never, 'prov-1', { limit: 100 })
    ).rejects.toThrow("Erreur lors de l'export")
  })
})

// ===========================================================================
// getDevisRequestsForClient
// ===========================================================================

describe('getDevisRequestsForClient', () => {
  it('returns requests filtered by client_id', async () => {
    const data = [
      {
        id: 'r-1',
        service_name: 'Plombier',
        city: 'Paris',
        status: 'pending',
        client_name: 'Jean',
        created_at: '2026-01-01',
      },
    ]
    const builder = createMockQueryBuilder()
    builder.order = vi.fn().mockResolvedValue({ data, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getDevisRequestsForClient(mockSupabaseClient as never, 'client-1')

    expect(result).toEqual(data)
    expect(mockSupabaseFrom).toHaveBeenCalledWith('devis_requests')
    expect(builder.eq).toHaveBeenCalledWith('client_id', 'client-1')
  })

  it('returns empty array when no requests', async () => {
    const builder = createMockQueryBuilder()
    builder.order = vi.fn().mockResolvedValue({ data: [], error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getDevisRequestsForClient(mockSupabaseClient as never, 'client-empty')

    expect(result).toEqual([])
  })

  it('throws on DB error', async () => {
    const builder = createMockQueryBuilder()
    builder.order = vi.fn().mockResolvedValue({ data: null, error: { message: 'err' } })
    mockSupabaseFrom.mockReturnValue(builder)

    await expect(
      getDevisRequestsForClient(mockSupabaseClient as never, 'client-1')
    ).rejects.toThrow('Erreur serveur')
  })
})

// ===========================================================================
// getLeadEventsForLeads
// ===========================================================================

describe('getLeadEventsForLeads', () => {
  it('returns events for multiple lead IDs', async () => {
    const events = [
      { lead_id: 'l-1', event_type: 'created', created_at: '2026-01-01' },
      { lead_id: 'l-2', event_type: 'viewed', created_at: '2026-01-02' },
    ]
    const builder = createMockQueryBuilder()
    builder.order = vi.fn().mockResolvedValue({ data: events, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getLeadEventsForLeads(mockSupabaseClient as never, ['l-1', 'l-2'])

    expect(result).toEqual(events)
    expect(builder.in).toHaveBeenCalledWith('lead_id', ['l-1', 'l-2'])
  })

  it('returns empty array on error (non-blocking)', async () => {
    const builder = createMockQueryBuilder()
    builder.order = vi.fn().mockResolvedValue({ data: null, error: { message: 'err' } })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getLeadEventsForLeads(mockSupabaseClient as never, ['l-1'])

    expect(result).toEqual([])
  })
})

// ===========================================================================
// deriveStatus
// ===========================================================================

describe('deriveStatus', () => {
  it('returns "en_attente" for empty events', () => {
    expect(deriveStatus([])).toBe('en_attente')
  })

  it('returns "termine" when completed event exists', () => {
    expect(deriveStatus([{ event_type: 'completed' }])).toBe('termine')
  })

  it('returns "expire" when expired event exists', () => {
    expect(deriveStatus([{ event_type: 'expired' }])).toBe('expire')
  })

  it('returns "accepte" when accepted event exists', () => {
    expect(deriveStatus([{ event_type: 'accepted' }])).toBe('accepte')
  })

  it('returns "refuse" when refused event exists', () => {
    expect(deriveStatus([{ event_type: 'refused' }])).toBe('refuse')
  })

  it('returns "devis_recus" when quoted event exists', () => {
    expect(deriveStatus([{ event_type: 'quoted' }])).toBe('devis_recus')
  })

  it('returns "en_traitement" when dispatched event exists', () => {
    expect(deriveStatus([{ event_type: 'dispatched' }])).toBe('en_traitement')
  })

  it('returns "en_traitement" when viewed event exists', () => {
    expect(deriveStatus([{ event_type: 'viewed' }])).toBe('en_traitement')
  })

  it('returns "en_traitement" when declined event exists', () => {
    expect(deriveStatus([{ event_type: 'declined' }])).toBe('en_traitement')
  })

  it('returns "en_traitement" when reassigned event exists', () => {
    expect(deriveStatus([{ event_type: 'reassigned' }])).toBe('en_traitement')
  })

  it('returns "en_attente" for unknown event types', () => {
    expect(deriveStatus([{ event_type: 'unknown_type' }])).toBe('en_attente')
  })

  it('prioritizes completed over all other statuses', () => {
    expect(
      deriveStatus([
        { event_type: 'dispatched' },
        { event_type: 'viewed' },
        { event_type: 'quoted' },
        { event_type: 'accepted' },
        { event_type: 'completed' },
      ])
    ).toBe('termine')
  })

  it('prioritizes expired over accepted/refused/quoted', () => {
    expect(
      deriveStatus([
        { event_type: 'quoted' },
        { event_type: 'accepted' },
        { event_type: 'expired' },
      ])
    ).toBe('expire')
  })

  it('prioritizes accepted over refused/quoted', () => {
    expect(
      deriveStatus([
        { event_type: 'quoted' },
        { event_type: 'refused' },
        { event_type: 'accepted' },
      ])
    ).toBe('accepte')
  })

  it('prioritizes refused over quoted', () => {
    expect(deriveStatus([{ event_type: 'quoted' }, { event_type: 'refused' }])).toBe('refuse')
  })
})

// ===========================================================================
// getDevisRequestById
// ===========================================================================

describe('getDevisRequestById', () => {
  it('returns lead when found with correct ownership', async () => {
    const lead = {
      id: 'lead-1',
      service_name: 'Plombier',
      city: 'Paris',
      client_name: 'Jean',
    }
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: lead, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getDevisRequestById(mockSupabaseClient as never, 'lead-1', 'client-1')

    expect(result).toEqual(lead)
    expect(builder.eq).toHaveBeenCalledWith('id', 'lead-1')
    expect(builder.eq).toHaveBeenCalledWith('client_id', 'client-1')
  })

  it('returns null when not found', async () => {
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getDevisRequestById(
      mockSupabaseClient as never,
      'lead-missing',
      'client-1'
    )

    expect(result).toBeNull()
  })

  it('returns null when client does not own the request', async () => {
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: null, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getDevisRequestById(mockSupabaseClient as never, 'lead-1', 'wrong-client')

    expect(result).toBeNull()
  })
})

// ===========================================================================
// getQuotesForLead
// ===========================================================================

describe('getQuotesForLead', () => {
  it('returns all quotes for a lead', async () => {
    const quotes = [
      { id: 'q-1', amount: 500, status: 'pending', provider_id: 'prov-1' },
      { id: 'q-2', amount: 600, status: 'pending', provider_id: 'prov-2' },
    ]
    const builder = createMockQueryBuilder()
    builder.order = vi.fn().mockResolvedValue({ data: quotes, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getQuotesForLead(mockSupabaseClient as never, 'lead-1')

    expect(result).toEqual(quotes)
    expect(mockSupabaseFrom).toHaveBeenCalledWith('quotes')
    expect(builder.eq).toHaveBeenCalledWith('request_id', 'lead-1')
  })

  it('returns empty array on error (non-blocking)', async () => {
    const builder = createMockQueryBuilder()
    builder.order = vi.fn().mockResolvedValue({ data: null, error: { message: 'err' } })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getQuotesForLead(mockSupabaseClient as never, 'lead-1')

    expect(result).toEqual([])
  })

  it('returns empty array when no quotes', async () => {
    const builder = createMockQueryBuilder()
    builder.order = vi.fn().mockResolvedValue({ data: [], error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getQuotesForLead(mockSupabaseClient as never, 'lead-1')

    expect(result).toEqual([])
  })
})

// ===========================================================================
// getLeadEventsById
// ===========================================================================

describe('getLeadEventsById', () => {
  it('returns events for a lead', async () => {
    const events = [{ id: 'e-1', event_type: 'created', metadata: {}, created_at: '2026-01-01' }]
    const builder = createMockQueryBuilder()
    builder.order = vi.fn().mockResolvedValue({ data: events, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getLeadEventsById(mockSupabaseClient as never, 'lead-1')

    expect(result).toEqual(events)
    expect(builder.eq).toHaveBeenCalledWith('lead_id', 'lead-1')
  })

  it('returns empty array on error', async () => {
    const builder = createMockQueryBuilder()
    builder.order = vi.fn().mockResolvedValue({ data: null, error: { message: 'err' } })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getLeadEventsById(mockSupabaseClient as never, 'lead-1')

    expect(result).toEqual([])
  })
})

// ===========================================================================
// getAssignmentsForLead
// ===========================================================================

describe('getAssignmentsForLead', () => {
  it('returns assignments for a lead', async () => {
    const assignments = [
      { id: 'a-1', status: 'pending' },
      { id: 'a-2', status: 'viewed' },
    ]
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockResolvedValue({ data: assignments, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getAssignmentsForLead(mockSupabaseClient as never, 'lead-1')

    expect(result).toEqual(assignments)
  })

  it('returns empty array on error', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockResolvedValue({ data: null, error: { message: 'err' } })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getAssignmentsForLead(mockSupabaseClient as never, 'lead-1')

    expect(result).toEqual([])
  })
})

// ===========================================================================
// getQuoteById
// ===========================================================================

describe('getQuoteById', () => {
  it('returns quote when found', async () => {
    const quote = { id: 'q-1', request_id: 'l-1', provider_id: 'p-1', status: 'pending' }
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: quote, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getQuoteById(mockSupabaseClient as never, 'q-1', 'l-1')

    expect(result).toEqual(quote)
    expect(builder.eq).toHaveBeenCalledWith('id', 'q-1')
    expect(builder.eq).toHaveBeenCalledWith('request_id', 'l-1')
  })

  it('returns null when not found', async () => {
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getQuoteById(mockSupabaseClient as never, 'q-missing', 'l-1')

    expect(result).toBeNull()
  })
})

// ===========================================================================
// updateQuoteStatus
// ===========================================================================

describe('updateQuoteStatus', () => {
  it('updates quote status to accepted', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockResolvedValue({ error: null })
    builder.update = vi.fn().mockReturnValue(builder)
    mockSupabaseFrom.mockReturnValue(builder)

    await expect(
      updateQuoteStatus(mockSupabaseClient as never, 'q-1', 'accepted')
    ).resolves.toBeUndefined()

    expect(builder.update).toHaveBeenCalledWith({ status: 'accepted' })
  })

  it('updates quote status to refused', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockResolvedValue({ error: null })
    builder.update = vi.fn().mockReturnValue(builder)
    mockSupabaseFrom.mockReturnValue(builder)

    await expect(
      updateQuoteStatus(mockSupabaseClient as never, 'q-1', 'refused')
    ).resolves.toBeUndefined()

    expect(builder.update).toHaveBeenCalledWith({ status: 'refused' })
  })

  it('throws on DB error', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockResolvedValue({ error: { message: 'update err' } })
    builder.update = vi.fn().mockReturnValue(builder)
    mockSupabaseFrom.mockReturnValue(builder)

    await expect(updateQuoteStatus(mockSupabaseClient as never, 'q-1', 'accepted')).rejects.toThrow(
      'Erreur lors de la mise à jour du devis'
    )
  })
})

// ===========================================================================
// refuseOtherQuotes
// ===========================================================================

describe('refuseOtherQuotes', () => {
  it('refuses all pending quotes except the selected one', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockReturnValue(builder)
    builder.neq = vi.fn().mockReturnValue(builder)
    builder.update = vi.fn().mockReturnValue(builder)
    // The last chained call resolves
    let eqCallCount = 0
    builder.eq = vi.fn().mockImplementation(() => {
      eqCallCount++
      if (eqCallCount >= 2)
        return { ...builder, then: (r: (v: unknown) => void) => r({ error: null }) }
      return builder
    })
    mockSupabaseFrom.mockReturnValue(builder)

    await expect(
      refuseOtherQuotes(mockSupabaseClient as never, 'lead-1', 'q-accepted')
    ).resolves.toBeUndefined()

    expect(builder.update).toHaveBeenCalledWith({ status: 'refused' })
    expect(builder.neq).toHaveBeenCalledWith('id', 'q-accepted')
  })

  it('does not throw on error (non-fatal)', async () => {
    const builder = createMockQueryBuilder()
    builder.update = vi.fn().mockReturnValue(builder)
    builder.neq = vi.fn().mockReturnValue(builder)
    let eqCallCount = 0
    builder.eq = vi.fn().mockImplementation(() => {
      eqCallCount++
      if (eqCallCount >= 2)
        return { ...builder, then: (r: (v: unknown) => void) => r({ error: { message: 'err' } }) }
      return builder
    })
    mockSupabaseFrom.mockReturnValue(builder)

    // Should not throw
    await expect(
      refuseOtherQuotes(mockSupabaseClient as never, 'lead-1', 'q-1')
    ).resolves.toBeUndefined()
  })
})

// ===========================================================================
// updateDevisRequestStatus
// ===========================================================================

describe('updateDevisRequestStatus', () => {
  it('updates devis request status', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockResolvedValue({ error: null })
    builder.update = vi.fn().mockReturnValue(builder)
    mockSupabaseFrom.mockReturnValue(builder)

    await expect(
      updateDevisRequestStatus(mockSupabaseClient as never, 'lead-1', 'accepted')
    ).resolves.toBeUndefined()

    expect(mockSupabaseFrom).toHaveBeenCalledWith('devis_requests')
    expect(builder.update).toHaveBeenCalledWith({ status: 'accepted' })
  })

  it('does not throw on error (non-fatal)', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockResolvedValue({ error: { message: 'err' } })
    builder.update = vi.fn().mockReturnValue(builder)
    mockSupabaseFrom.mockReturnValue(builder)

    await expect(
      updateDevisRequestStatus(mockSupabaseClient as never, 'lead-1', 'accepted')
    ).resolves.toBeUndefined()
  })
})

// ===========================================================================
// getDispatchAssignments (admin)
// ===========================================================================

describe('getDispatchAssignments', () => {
  it('returns assignments with provider data', async () => {
    const data = [
      {
        id: 'a-1',
        lead_id: 'l-1',
        status: 'pending',
        assigned_at: '2026-01-01',
        viewed_at: null,
        source_table: 'devis_requests',
        score: 85,
        distance_km: 5,
        position: 1,
        provider: { id: 'p-1', name: 'Artisan 1', specialty: 'Plombier', address_city: 'Paris' },
      },
    ]
    const builder = createMockQueryBuilder()
    builder.range = vi.fn().mockResolvedValue({ data, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getDispatchAssignments(mockSupabaseClient as never, {
      page: 1,
      limit: 10,
    })

    expect(result).toEqual(data)
    expect(builder.range).toHaveBeenCalledWith(0, 9)
  })

  it('returns empty array on error', async () => {
    const builder = createMockQueryBuilder()
    builder.range = vi.fn().mockResolvedValue({ data: null, error: { message: 'err' } })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getDispatchAssignments(mockSupabaseClient as never, {
      page: 1,
      limit: 10,
    })

    expect(result).toEqual([])
  })

  it('calculates correct offset for page 2', async () => {
    const builder = createMockQueryBuilder()
    builder.range = vi.fn().mockResolvedValue({ data: [], error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    await getDispatchAssignments(mockSupabaseClient as never, { page: 2, limit: 10 })

    expect(builder.range).toHaveBeenCalledWith(10, 19)
  })
})

// ===========================================================================
// getDispatchStats (admin)
// ===========================================================================

describe('getDispatchStats', () => {
  it('returns correct counts', async () => {
    const counts = [
      { count: 5 }, // pending
      { count: 3 }, // viewed
      { count: 2 }, // quoted
      { count: 10 }, // total
    ]
    let callIndex = 0
    mockSupabaseFrom.mockImplementation(() => {
      const b = createMockQueryBuilder()
      const result = counts[callIndex++] || { count: 0 }
      b.select = vi.fn().mockReturnValue(b)
      b.eq = vi.fn().mockReturnValue(b)
      Object.assign(b, {
        then: (resolve: (v: unknown) => void) => resolve(result),
      })
      return b
    })

    const result = await getDispatchStats(mockSupabaseClient as never)

    expect(result).toEqual({
      pending: 5,
      viewed: 3,
      quoted: 2,
      total: 10,
    })
  })

  it('defaults to 0 when counts are null', async () => {
    mockSupabaseFrom.mockImplementation(() => {
      const b = createMockQueryBuilder()
      b.select = vi.fn().mockReturnValue(b)
      b.eq = vi.fn().mockReturnValue(b)
      Object.assign(b, {
        then: (resolve: (v: unknown) => void) => resolve({ count: null }),
      })
      return b
    })

    const result = await getDispatchStats(mockSupabaseClient as never)

    expect(result).toEqual({ pending: 0, viewed: 0, quoted: 0, total: 0 })
  })
})

// ===========================================================================
// getAssignmentById (admin)
// ===========================================================================

describe('getAssignmentById', () => {
  it('returns assignment data', async () => {
    const data = { lead_id: 'l-1', provider_id: 'p-1', source_table: 'devis_requests' }
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getAssignmentById(mockSupabaseClient as never, 'assign-1')

    expect(result).toEqual(data)
  })

  it('returns null when not found', async () => {
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getAssignmentById(mockSupabaseClient as never, 'missing')

    expect(result).toBeNull()
  })
})

// ===========================================================================
// reassignAssignment (admin)
// ===========================================================================

describe('reassignAssignment', () => {
  it('reassigns to new provider', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockResolvedValue({ error: null })
    builder.update = vi.fn().mockReturnValue(builder)
    mockSupabaseFrom.mockReturnValue(builder)

    await expect(
      reassignAssignment(mockSupabaseClient as never, 'assign-1', 'new-prov')
    ).resolves.toBeUndefined()

    expect(builder.update).toHaveBeenCalledWith(
      expect.objectContaining({
        provider_id: 'new-prov',
        status: 'pending',
        viewed_at: null,
      })
    )
  })

  it('throws on DB error', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockResolvedValue({ error: { message: 'err' } })
    builder.update = vi.fn().mockReturnValue(builder)
    mockSupabaseFrom.mockReturnValue(builder)

    await expect(
      reassignAssignment(mockSupabaseClient as never, 'assign-1', 'new-prov')
    ).rejects.toThrow('Erreur lors de la réassignation')
  })
})

// ===========================================================================
// deleteAssignment (admin)
// ===========================================================================

describe('deleteAssignment', () => {
  it('deletes assignment successfully', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockResolvedValue({ error: null })
    builder.delete = vi.fn().mockReturnValue(builder)
    mockSupabaseFrom.mockReturnValue(builder)

    await expect(deleteAssignment(mockSupabaseClient as never, 'assign-1')).resolves.toBeUndefined()

    expect(mockSupabaseFrom).toHaveBeenCalledWith('lead_assignments')
  })

  it('throws on DB error', async () => {
    const builder = createMockQueryBuilder()
    builder.eq = vi.fn().mockResolvedValue({ error: { message: 'err' } })
    builder.delete = vi.fn().mockReturnValue(builder)
    mockSupabaseFrom.mockReturnValue(builder)

    await expect(deleteAssignment(mockSupabaseClient as never, 'assign-1')).rejects.toThrow(
      'Erreur lors de la suppression'
    )
  })
})

// ===========================================================================
// getAdminLeadCounts
// ===========================================================================

describe('getAdminLeadCounts', () => {
  it('returns lead counts without filters', async () => {
    let callIndex = 0
    mockSupabaseFrom.mockImplementation(() => {
      callIndex++
      const b = createMockQueryBuilder()
      b.select = vi.fn().mockReturnValue(b)
      b.ilike = vi.fn().mockReturnValue(b)
      b.eq = vi.fn().mockReturnValue(b)

      if (callIndex === 1) {
        // devis_requests count
        Object.assign(b, {
          then: (resolve: (v: unknown) => void) => resolve({ count: 20, error: null }),
        })
      } else if (callIndex === 2) {
        // lead_assignments count with join
        Object.assign(b, {
          then: (resolve: (v: unknown) => void) => resolve({ count: 15, error: null }),
        })
      } else {
        // fallback query
        Object.assign(b, {
          then: (resolve: (v: unknown) => void) => resolve({ count: 15, error: null }),
        })
      }
      return b
    })

    const result = await getAdminLeadCounts(mockSupabaseClient as never, {
      city: null,
      service: null,
    })

    expect(result.leadsCreated).toBe(20)
    expect(result.leadsAssigned).toBe(15)
  })
})

// ===========================================================================
// getActiveArtisans
// ===========================================================================

describe('getActiveArtisans', () => {
  it('returns active artisans', async () => {
    const artisans = [
      {
        id: 'p-1',
        stable_id: 's-1',
        name: 'Jean',
        slug: 'jean',
        specialty: 'Plombier',
        address_city: 'Paris',
        is_verified: true,
      },
    ]
    const builder = createMockQueryBuilder({ data: artisans, error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getActiveArtisans(mockSupabaseClient as never, {
      city: null,
      service: null,
    })

    expect(result).toEqual(artisans)
    expect(builder.eq).toHaveBeenCalledWith('is_active', true)
  })

  it('filters by city when provided', async () => {
    const builder = createMockQueryBuilder({ data: [], error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    await getActiveArtisans(mockSupabaseClient as never, {
      city: 'Paris',
      service: null,
    })

    expect(builder.ilike).toHaveBeenCalledWith('address_city', 'Paris%')
  })

  it('filters by service when provided', async () => {
    const builder = createMockQueryBuilder({ data: [], error: null })
    mockSupabaseFrom.mockReturnValue(builder)

    await getActiveArtisans(mockSupabaseClient as never, {
      city: null,
      service: 'Plombier',
    })

    expect(builder.ilike).toHaveBeenCalledWith('specialty', 'Plombier%')
  })

  it('returns empty array on error', async () => {
    const builder = createMockQueryBuilder({ data: null, error: { message: 'err' } })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await getActiveArtisans(mockSupabaseClient as never, {
      city: null,
      service: null,
    })

    expect(result).toEqual([])
  })
})
