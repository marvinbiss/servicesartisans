import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — declared before imports so hoisting works
// ---------------------------------------------------------------------------

const mockAdminFrom = vi.fn()
const mockAdminClient = { from: mockAdminFrom }

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockAdminClient),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

vi.mock('@/lib/utils', () => ({
  slugify: vi.fn((s: string) => s?.toLowerCase().replace(/\s+/g, '-') || ''),
}))

vi.mock('@/lib/api/resend-client', () => ({
  sendClaimApprovedEmail: vi.fn().mockResolvedValue({ id: 'email-123' }),
}))

vi.mock('crypto', () => ({
  default: {
    randomUUID: () => 'random-uuid-mock',
    randomBytes: (size: number) => ({
      toString: (_enc: string) => 'a'.repeat(Math.max(32, size)),
    }),
  },
}))

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import {
  createClaim,
  listClaims,
  approveClaim,
  rejectClaim,
  createRemovalRequest,
  listRemovalRequests,
  approveRemovalRequest,
  rejectRemovalRequest,
} from '@/lib/services/claims-service'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockQueryBuilder(finalResult: Record<string, unknown> = {}) {
  const builder: Record<string, ReturnType<typeof vi.fn>> = {}
  const chainable = (name: string) => {
    builder[name] = vi.fn().mockReturnValue(builder)
  }
  ;[
    'select',
    'insert',
    'update',
    'delete',
    'upsert',
    'eq',
    'in',
    'is',
    'not',
    'order',
    'range',
    'limit',
    'single',
    'maybeSingle',
  ].forEach(chainable)

  builder.single = vi.fn().mockResolvedValue(finalResult)
  builder.maybeSingle = vi.fn().mockResolvedValue(finalResult)

  // Make builder thenable so await on chained .eq() works
  builder.then = vi.fn().mockImplementation((resolve: (v: unknown) => void) => {
    resolve(finalResult)
    return Promise.resolve(finalResult)
  })

  return builder
}

function createMockSupabase() {
  const fromMock = vi.fn()
  const authAdmin = {
    createUser: vi.fn().mockResolvedValue({ data: { user: null }, error: { message: 'test' } }),
    generateLink: vi.fn().mockResolvedValue({ data: null }),
    updateUserById: vi.fn().mockResolvedValue({}),
  }
  return {
    from: fromMock,
    auth: { admin: authAdmin },
  }
}

const PROVIDER_ID = 'provider-uuid-001'
const USER_ID = 'user-uuid-001'
const ADMIN_ID = 'admin-uuid-001'
const CLAIM_ID = 'claim-uuid-001'

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
})

// ===========================================================================
// createClaim
// ===========================================================================

describe('createClaim', () => {
  it('creates a claim successfully for authenticated user', async () => {
    let callIndex = 0
    mockAdminFrom.mockImplementation((table: string) => {
      callIndex++
      if (table === 'providers' && callIndex <= 2) {
        // 1st: check existing provider for user
        if (callIndex === 1) {
          const b = createMockQueryBuilder()
          b.single = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
          return b
        }
      }
      if (table === 'provider_claims') {
        if (callIndex === 2) {
          // Check pending claims for user
          const b = createMockQueryBuilder()
          b.limit = vi.fn().mockResolvedValue({ data: [] })
          return b
        }
        if (callIndex === 3) {
          // Check pending claims for provider
          const b = createMockQueryBuilder()
          b.limit = vi.fn().mockResolvedValue({ data: [] })
          return b
        }
        if (callIndex === 5) {
          // Insert claim — Sprint 4 vague 4 chaîne maintenant .select('id').single()
          // pour récupérer l'id et envoyer l'email de confirmation.
          const b = createMockQueryBuilder()
          b.single = vi.fn().mockResolvedValue({ data: { id: 'new-claim-id' }, error: null })
          b.insert = vi.fn().mockReturnValue(b)
          return b
        }
      }
      if (table === 'providers' && callIndex === 4) {
        // Fetch provider
        const b = createMockQueryBuilder()
        b.single = vi.fn().mockResolvedValue({
          data: { id: PROVIDER_ID, name: 'Plombier Pro', siret: '12345678901234', user_id: null },
          error: null,
        })
        return b
      }
      if (table === 'profiles') {
        const b = createMockQueryBuilder()
        b.eq = vi.fn().mockResolvedValue({ error: null })
        return b
      }
      const b = createMockQueryBuilder()
      b.insert = vi.fn().mockResolvedValue({ error: null })
      return b
    })

    const result = await createClaim(
      {
        providerId: PROVIDER_ID,
        siret: '12345678901234',
        fullName: 'Jean Dupont',
        email: 'jean@example.com',
        phone: '0612345678',
        position: 'Gerant',
      },
      USER_ID
    )

    expect(result.success).toBe(true)
  })

  it('rejects duplicate claim when user already owns a provider', async () => {
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'providers') {
        const b = createMockQueryBuilder()
        b.single = vi.fn().mockResolvedValue({ data: { id: 'existing-provider' }, error: null })
        return b
      }
      return createMockQueryBuilder()
    })

    const result = await createClaim(
      {
        providerId: PROVIDER_ID,
        siret: '12345678901234',
        fullName: 'Jean',
        email: 'jean@example.com',
        phone: '0612345678',
        position: 'Gerant',
      },
      USER_ID
    )

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(409)
    }
  })

  it('rejects when SIRET does not match', async () => {
    let callIndex = 0
    mockAdminFrom.mockImplementation((table: string) => {
      callIndex++
      if (table === 'providers' && callIndex === 1) {
        const b = createMockQueryBuilder()
        b.single = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
        return b
      }
      if (table === 'provider_claims') {
        const b = createMockQueryBuilder()
        b.limit = vi.fn().mockResolvedValue({ data: [] })
        return b
      }
      if (table === 'providers') {
        const b = createMockQueryBuilder()
        b.single = vi.fn().mockResolvedValue({
          data: { id: PROVIDER_ID, name: 'Plombier', siret: '12345678901234', user_id: null },
          error: null,
        })
        return b
      }
      return createMockQueryBuilder()
    })

    const result = await createClaim(
      {
        providerId: PROVIDER_ID,
        siret: '99999999999999', // wrong SIRET
        fullName: 'Jean',
        email: 'jean@example.com',
        phone: '0612345678',
        position: 'Gerant',
      },
      USER_ID
    )

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(403)
    }
  })

  it('rejects when provider already has user_id (already claimed)', async () => {
    let callIndex = 0
    mockAdminFrom.mockImplementation((table: string) => {
      callIndex++
      if (table === 'providers' && callIndex === 1) {
        const b = createMockQueryBuilder()
        b.single = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
        return b
      }
      if (table === 'provider_claims') {
        const b = createMockQueryBuilder()
        b.limit = vi.fn().mockResolvedValue({ data: [] })
        return b
      }
      if (table === 'providers') {
        const b = createMockQueryBuilder()
        b.single = vi.fn().mockResolvedValue({
          data: {
            id: PROVIDER_ID,
            name: 'Plombier',
            siret: '12345678901234',
            user_id: 'other-user',
          },
          error: null,
        })
        return b
      }
      return createMockQueryBuilder()
    })

    const result = await createClaim(
      {
        providerId: PROVIDER_ID,
        siret: '12345678901234',
        fullName: 'Jean',
        email: 'jean@example.com',
        phone: '0612345678',
        position: 'Gerant',
      },
      USER_ID
    )

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(409)
    }
  })

  it('rejects when provider not found', async () => {
    let callIndex = 0
    mockAdminFrom.mockImplementation((table: string) => {
      callIndex++
      if (table === 'providers' && callIndex === 1) {
        const b = createMockQueryBuilder()
        b.single = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
        return b
      }
      if (table === 'provider_claims') {
        const b = createMockQueryBuilder()
        b.limit = vi.fn().mockResolvedValue({ data: [] })
        return b
      }
      if (table === 'providers') {
        const b = createMockQueryBuilder()
        b.single = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
        return b
      }
      return createMockQueryBuilder()
    })

    const result = await createClaim(
      {
        providerId: 'non-existent',
        siret: '12345678901234',
        fullName: 'Jean',
        email: 'jean@example.com',
        phone: '0612345678',
        position: 'Gerant',
      },
      USER_ID
    )

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(404)
    }
  })

  it('rejects anonymous claim when email already has pending claim', async () => {
    let callIndex = 0
    mockAdminFrom.mockImplementation((table: string) => {
      callIndex++
      if (table === 'provider_claims' && callIndex === 1) {
        // Check email pending claims for anonymous
        const b = createMockQueryBuilder()
        b.limit = vi.fn().mockResolvedValue({ data: [{ id: 'existing' }] })
        return b
      }
      return createMockQueryBuilder()
    })

    const result = await createClaim(
      {
        providerId: PROVIDER_ID,
        siret: '12345678901234',
        fullName: 'Jean',
        email: 'jean@example.com',
        phone: '0612345678',
        position: 'Gerant',
      },
      null
    ) // anonymous

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(409)
    }
  })

  it('matches SIREN (9 digits) against first 9 of stored SIRET', async () => {
    let callIndex = 0
    mockAdminFrom.mockImplementation((table: string) => {
      callIndex++
      if (table === 'providers' && callIndex === 1) {
        const b = createMockQueryBuilder()
        b.single = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
        return b
      }
      if (table === 'provider_claims') {
        const b = createMockQueryBuilder()
        b.limit = vi.fn().mockResolvedValue({ data: [] })
        return b
      }
      if (table === 'providers') {
        const b = createMockQueryBuilder()
        b.single = vi.fn().mockResolvedValue({
          data: { id: PROVIDER_ID, name: 'Pro', siret: '123456789 01234', user_id: null },
          error: null,
        })
        return b
      }
      // Insert claim
      const b = createMockQueryBuilder()
      b.insert = vi.fn().mockResolvedValue({ error: null })
      b.eq = vi.fn().mockResolvedValue({ error: null })
      return b
    })

    const result = await createClaim(
      {
        providerId: PROVIDER_ID,
        siret: '123456789', // 9 digits SIREN
        fullName: 'Jean',
        email: 'jean@example.com',
        phone: '0612345678',
        position: 'Gerant',
      },
      USER_ID
    )

    expect(result.success).toBe(true)
  })
})

// ===========================================================================
// listClaims
// ===========================================================================

describe('listClaims', () => {
  it('returns paginated claims with status filter', async () => {
    const claims = [{ id: '1', status: 'pending' }]
    const supabase = createMockSupabase()
    const builder = createMockQueryBuilder()
    // range returns builder (chainable), then .eq('status') is called after, then await resolves via thenable
    builder.then = vi.fn().mockImplementation((resolve: (v: unknown) => void) => {
      const result = { data: claims, error: null, count: 1 }
      resolve(result)
      return Promise.resolve(result)
    })
    supabase.from.mockReturnValue(builder)

    const result = await listClaims(supabase as never, { status: 'pending', page: 1, limit: 10 })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.data).toEqual(claims)
      expect(result.data.pagination.total).toBe(1)
      expect(result.data.pagination.page).toBe(1)
    }
    expect(builder.eq).toHaveBeenCalledWith('status', 'pending')
  })

  it('returns all claims when status is "all"', async () => {
    const supabase = createMockSupabase()
    const builder = createMockQueryBuilder()
    builder.range = vi.fn().mockResolvedValue({ data: [], error: null, count: 0 })
    supabase.from.mockReturnValue(builder)

    await listClaims(supabase as never, { status: 'all', page: 1, limit: 10 })

    // Should NOT filter by status when 'all'
    expect(builder.eq).not.toHaveBeenCalledWith('status', 'all')
  })

  it('handles pagination correctly', async () => {
    const supabase = createMockSupabase()
    const builder = createMockQueryBuilder()
    builder.range = vi.fn().mockResolvedValue({ data: [{ id: '11' }], error: null, count: 25 })
    supabase.from.mockReturnValue(builder)

    const result = await listClaims(supabase as never, { status: 'all', page: 3, limit: 5 })

    expect(builder.range).toHaveBeenCalledWith(10, 14) // offset=(3-1)*5=10
    if (result.success) {
      expect(result.data.pagination.totalPages).toBe(5) // ceil(25/5)
    }
  })

  it('returns error on DB failure', async () => {
    const supabase = createMockSupabase()
    const builder = createMockQueryBuilder()
    builder.then = vi.fn().mockImplementation((resolve: (v: unknown) => void) => {
      const result = { data: null, error: { message: 'DB error' }, count: null }
      resolve(result)
      return Promise.resolve(result)
    })
    supabase.from.mockReturnValue(builder)

    const result = await listClaims(supabase as never, { status: 'pending', page: 1, limit: 10 })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(500)
    }
  })
})

// ===========================================================================
// approveClaim
// ===========================================================================

describe('approveClaim', () => {
  it('approves a pending claim with existing user_id', async () => {
    const supabase = createMockSupabase()
    let providerClaimsCallIndex = 0
    let profilesCallIndex = 0
    let providersCallIndex = 0

    supabase.from.mockImplementation((table: string) => {
      if (table === 'provider_claims') {
        providerClaimsCallIndex++
        if (providerClaimsCallIndex === 1) {
          // Fetch claim
          const b = createMockQueryBuilder()
          b.single = vi.fn().mockResolvedValue({
            data: {
              id: CLAIM_ID,
              provider_id: PROVIDER_ID,
              user_id: USER_ID,
              status: 'pending',
              claimant_email: 'jean@example.com',
              claimant_name: 'Jean',
            },
            error: null,
          })
          return b
        }
        // Update claim status — .update().eq() awaited
        const b = createMockQueryBuilder({ error: null })
        return b
      }
      if (table === 'providers') {
        providersCallIndex++
        if (providersCallIndex === 1) {
          // Assign provider — .update().eq().is().select().maybeSingle()
          const b = createMockQueryBuilder()
          b.maybeSingle = vi
            .fn()
            .mockResolvedValue({ data: { id: PROVIDER_ID, name: 'Pro' }, error: null })
          return b
        }
        // Revalidation query
        const b = createMockQueryBuilder()
        b.single = vi.fn().mockResolvedValue({ data: null, error: null })
        return b
      }
      if (table === 'profiles') {
        profilesCallIndex++
        if (profilesCallIndex === 1) {
          // Fetch current profile role — .select('role').eq('id', ...).single()
          const b = createMockQueryBuilder()
          b.single = vi.fn().mockResolvedValue({ data: { role: 'client' }, error: null })
          return b
        }
        // Update role — .update().eq() awaited
        const b = createMockQueryBuilder({ error: null })
        return b
      }
      return createMockQueryBuilder()
    })

    supabase.auth.admin.updateUserById.mockResolvedValue({})

    const result = await approveClaim(supabase as never, CLAIM_ID, ADMIN_ID)

    expect(result.success).toBe(true)
  })

  it('rejects already processed claim', async () => {
    const supabase = createMockSupabase()
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({
      data: { id: CLAIM_ID, status: 'approved', provider_id: PROVIDER_ID },
      error: null,
    })
    supabase.from.mockReturnValue(builder)

    const result = await approveClaim(supabase as never, CLAIM_ID, ADMIN_ID)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(409)
    }
  })

  it('returns 404 when claim not found', async () => {
    const supabase = createMockSupabase()
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
    supabase.from.mockReturnValue(builder)

    const result = await approveClaim(supabase as never, 'non-existent', ADMIN_ID)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(404)
    }
  })
})

// ===========================================================================
// rejectClaim
// ===========================================================================

describe('rejectClaim', () => {
  it('rejects a pending claim with reason', async () => {
    let callIndex = 0
    const supabase = createMockSupabase()

    supabase.from.mockImplementation((table: string) => {
      callIndex++
      if (table === 'provider_claims' && callIndex === 1) {
        const b = createMockQueryBuilder()
        b.single = vi.fn().mockResolvedValue({
          data: { id: CLAIM_ID, provider_id: PROVIDER_ID, user_id: USER_ID, status: 'pending' },
          error: null,
        })
        return b
      }
      // Update claim status
      const b = createMockQueryBuilder()
      b.eq = vi.fn().mockResolvedValue({ error: null })
      return b
    })

    const result = await rejectClaim(supabase as never, CLAIM_ID, ADMIN_ID, 'SIRET invalide')

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.message).toContain('rejetée')
    }
  })

  it('handles unclaim action for approved claim', async () => {
    let callIndex = 0
    const supabase = createMockSupabase()

    supabase.from.mockImplementation((table: string) => {
      callIndex++
      if (table === 'provider_claims' && callIndex === 1) {
        const b = createMockQueryBuilder()
        b.single = vi.fn().mockResolvedValue({
          data: { id: CLAIM_ID, provider_id: PROVIDER_ID, user_id: USER_ID, status: 'approved' },
          error: null,
        })
        return b
      }
      if (table === 'providers' && callIndex === 2) {
        // Remove user_id
        const b = createMockQueryBuilder()
        b.eq = vi.fn().mockResolvedValue({ error: null })
        return b
      }
      if (table === 'provider_claims') {
        const b = createMockQueryBuilder()
        b.eq = vi.fn().mockResolvedValue({ error: null })
        return b
      }
      if (table === 'providers') {
        // Count remaining + revalidation
        const b = createMockQueryBuilder()
        b.eq = vi.fn().mockResolvedValue({ count: 0 })
        b.single = vi.fn().mockResolvedValue({ data: null, error: null })
        return b
      }
      if (table === 'profiles') {
        const b = createMockQueryBuilder()
        b.not = vi.fn().mockResolvedValue({ error: null })
        return b
      }
      return createMockQueryBuilder()
    })

    const result = await rejectClaim(supabase as never, CLAIM_ID, ADMIN_ID, 'Unclaim')

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.message).toContain('disponible')
    }
  })

  it('returns 404 when claim not found', async () => {
    const supabase = createMockSupabase()
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
    supabase.from.mockReturnValue(builder)

    const result = await rejectClaim(supabase as never, 'non-existent', ADMIN_ID)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(404)
    }
  })

  it('returns 409 when claim already processed (rejected status)', async () => {
    const supabase = createMockSupabase()
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({
      data: { id: CLAIM_ID, provider_id: PROVIDER_ID, status: 'rejected' },
      error: null,
    })
    supabase.from.mockReturnValue(builder)

    const result = await rejectClaim(supabase as never, CLAIM_ID, ADMIN_ID)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(409)
    }
  })
})

// ===========================================================================
// createRemovalRequest
// ===========================================================================

describe('createRemovalRequest', () => {
  it('creates removal request successfully', async () => {
    let callIndex = 0
    mockAdminFrom.mockImplementation((table: string) => {
      callIndex++
      if (table === 'providers' && callIndex === 1) {
        const b = createMockQueryBuilder()
        b.single = vi.fn().mockResolvedValue({
          data: { id: PROVIDER_ID, name: 'Pro', siret: '12345678901234' },
          error: null,
        })
        return b
      }
      if (table === 'provider_removal_requests' && callIndex === 2) {
        // Check existing
        const b = createMockQueryBuilder()
        b.limit = vi.fn().mockResolvedValue({ data: [] })
        return b
      }
      if (table === 'provider_removal_requests') {
        // Insert
        const b = createMockQueryBuilder()
        b.insert = vi.fn().mockResolvedValue({ error: null })
        return b
      }
      if (table === 'providers') {
        // Set noindex
        const b = createMockQueryBuilder()
        b.eq = vi.fn().mockResolvedValue({ error: null })
        return b
      }
      return createMockQueryBuilder()
    })

    const result = await createRemovalRequest({
      providerId: PROVIDER_ID,
      siret: '12345678901234',
      requesterName: 'Jean',
      requesterEmail: 'jean@example.com',
      reason: 'RGPD',
    })

    expect(result.success).toBe(true)
  })

  it('rejects when SIRET does not match', async () => {
    mockAdminFrom.mockImplementation(() => {
      const b = createMockQueryBuilder()
      b.single = vi.fn().mockResolvedValue({
        data: { id: PROVIDER_ID, name: 'Pro', siret: '12345678901234' },
        error: null,
      })
      return b
    })

    const result = await createRemovalRequest({
      providerId: PROVIDER_ID,
      siret: '99999999999999',
      requesterName: 'Jean',
      requesterEmail: 'jean@example.com',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(403)
    }
  })

  it('rejects when already requested', async () => {
    let _callIndex = 0
    mockAdminFrom.mockImplementation((table: string) => {
      _callIndex++
      if (table === 'providers') {
        const b = createMockQueryBuilder()
        b.single = vi.fn().mockResolvedValue({
          data: { id: PROVIDER_ID, name: 'Pro', siret: '12345678901234' },
          error: null,
        })
        return b
      }
      if (table === 'provider_removal_requests') {
        const b = createMockQueryBuilder()
        b.limit = vi.fn().mockResolvedValue({ data: [{ id: 'existing' }] })
        return b
      }
      return createMockQueryBuilder()
    })

    const result = await createRemovalRequest({
      providerId: PROVIDER_ID,
      siret: '12345678901234',
      requesterName: 'Jean',
      requesterEmail: 'jean@example.com',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(409)
    }
  })

  it('returns 404 when provider not found', async () => {
    mockAdminFrom.mockImplementation(() => {
      const b = createMockQueryBuilder()
      b.single = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      return b
    })

    const result = await createRemovalRequest({
      providerId: 'non-existent',
      siret: '12345678901234',
      requesterName: 'Jean',
      requesterEmail: 'jean@example.com',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(404)
    }
  })
})

// ===========================================================================
// listRemovalRequests
// ===========================================================================

describe('listRemovalRequests', () => {
  it('returns paginated results', async () => {
    const supabase = createMockSupabase()
    const builder = createMockQueryBuilder()
    builder.then = vi.fn().mockImplementation((resolve: (v: unknown) => void) => {
      const result = { data: [{ id: '1', status: 'pending' }], error: null, count: 1 }
      resolve(result)
      return Promise.resolve(result)
    })
    supabase.from.mockReturnValue(builder)

    const result = await listRemovalRequests(supabase as never, {
      status: 'pending',
      page: 1,
      limit: 10,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.data).toHaveLength(1)
      expect(result.data.pagination.total).toBe(1)
    }
  })

  it('does not filter by status when "all"', async () => {
    const supabase = createMockSupabase()
    const builder = createMockQueryBuilder()
    builder.range = vi.fn().mockResolvedValue({ data: [], error: null, count: 0 })
    supabase.from.mockReturnValue(builder)

    await listRemovalRequests(supabase as never, { status: 'all', page: 1, limit: 10 })

    expect(builder.eq).not.toHaveBeenCalledWith('status', 'all')
  })

  it('returns error on DB failure', async () => {
    const supabase = createMockSupabase()
    const builder = createMockQueryBuilder()
    builder.range = vi
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'fail' }, count: null })
    supabase.from.mockReturnValue(builder)

    const result = await listRemovalRequests(supabase as never, {
      status: 'all',
      page: 1,
      limit: 10,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(500)
    }
  })
})

// ===========================================================================
// approveRemovalRequest
// ===========================================================================

describe('approveRemovalRequest', () => {
  it('approves a pending removal request', async () => {
    let callIndex = 0
    const supabase = createMockSupabase()

    supabase.from.mockImplementation((table: string) => {
      callIndex++
      if (table === 'provider_removal_requests' && callIndex === 1) {
        const b = createMockQueryBuilder()
        b.single = vi.fn().mockResolvedValue({
          data: {
            id: 'req-1',
            provider_id: PROVIDER_ID,
            status: 'pending',
            requester_name: 'Jean',
            requester_email: 'jean@test.com',
          },
          error: null,
        })
        return b
      }
      if (table === 'provider_removal_requests') {
        const b = createMockQueryBuilder()
        b.eq = vi.fn().mockResolvedValue({ error: null })
        return b
      }
      if (table === 'providers') {
        const b = createMockQueryBuilder()
        b.eq = vi.fn().mockResolvedValue({ error: null })
        b.single = vi.fn().mockResolvedValue({ data: null, error: null })
        return b
      }
      return createMockQueryBuilder()
    })

    const result = await approveRemovalRequest(
      supabase as never,
      'req-1',
      ADMIN_ID,
      'RGPD confirmed'
    )

    expect(result.success).toBe(true)
  })

  it('returns 409 when already processed', async () => {
    const supabase = createMockSupabase()
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({
      data: { id: 'req-1', provider_id: PROVIDER_ID, status: 'approved' },
      error: null,
    })
    supabase.from.mockReturnValue(builder)

    const result = await approveRemovalRequest(supabase as never, 'req-1', ADMIN_ID)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(409)
    }
  })

  it('returns 404 when request not found', async () => {
    const supabase = createMockSupabase()
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
    supabase.from.mockReturnValue(builder)

    const result = await approveRemovalRequest(supabase as never, 'non-existent', ADMIN_ID)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(404)
    }
  })
})

// ===========================================================================
// rejectRemovalRequest
// ===========================================================================

describe('rejectRemovalRequest', () => {
  it('rejects a pending removal request', async () => {
    let callIndex = 0
    const supabase = createMockSupabase()

    supabase.from.mockImplementation((table: string) => {
      callIndex++
      if (table === 'provider_removal_requests' && callIndex === 1) {
        const b = createMockQueryBuilder()
        b.single = vi.fn().mockResolvedValue({
          data: { id: 'req-1', provider_id: PROVIDER_ID, status: 'pending' },
          error: null,
        })
        return b
      }
      const b = createMockQueryBuilder()
      b.eq = vi.fn().mockResolvedValue({ error: null })
      return b
    })

    const result = await rejectRemovalRequest(
      supabase as never,
      'req-1',
      ADMIN_ID,
      'SIRET ne correspond pas'
    )

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.message).toContain('rejetee')
    }
  })

  it('returns 409 when already processed', async () => {
    const supabase = createMockSupabase()
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({
      data: { id: 'req-1', status: 'rejected' },
      error: null,
    })
    supabase.from.mockReturnValue(builder)

    const result = await rejectRemovalRequest(supabase as never, 'req-1', ADMIN_ID, 'note')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(409)
    }
  })

  it('returns 404 when request not found', async () => {
    const supabase = createMockSupabase()
    const builder = createMockQueryBuilder()
    builder.single = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
    supabase.from.mockReturnValue(builder)

    const result = await rejectRemovalRequest(supabase as never, 'non-existent', ADMIN_ID, 'note')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(404)
    }
  })
})
