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

vi.mock('@/lib/api/resend-client', () => ({
  getResendClient: vi.fn(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ id: 'email-123' }),
    },
  })),
}))

vi.mock('@/app/actions/dispatch', () => ({
  dispatchLead: vi.fn().mockResolvedValue(['provider-1', 'provider-2']),
}))

vi.mock('@/lib/dashboard/events', () => ({
  logLeadEvent: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/integrations/pipedrive', () => ({
  syncDevisRequestToPipedrive: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/cee/qualify', () => ({
  qualifyDevisForCee: vi.fn().mockResolvedValue({ eligible: false, codes: [] }),
}))

vi.mock('@/lib/cee/dispatcher-integration', () => ({
  runCeeDispatchFireAndForget: vi.fn().mockResolvedValue(undefined),
}))

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import {
  checkDuplicate,
  checkEmailRateLimit,
  processDevis,
  resolveServiceName,
  urgencyLabels,
  type DevisInput,
} from '@/lib/services/devis-service'
import { dispatchLead } from '@/app/actions/dispatch'
import { qualifyDevisForCee } from '@/lib/cee/qualify'
import { syncDevisRequestToPipedrive } from '@/lib/integrations/pipedrive'
import { logLeadEvent } from '@/lib/dashboard/events'
import { runCeeDispatchFireAndForget } from '@/lib/cee/dispatcher-integration'
import { getResendClient } from '@/lib/api/resend-client'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a chainable mock query builder for Supabase */
function createMockQueryBuilder(finalResult: Record<string, unknown> = {}) {
  const builder: Record<string, ReturnType<typeof vi.fn>> = {}
  const chainable = (name: string) => {
    builder[name] = vi.fn().mockReturnValue(builder)
  }
  ;['select', 'insert', 'update', 'eq', 'gte', 'limit', 'single', 'then'].forEach(chainable)

  // Override terminal methods to return the final result
  builder.limit = vi.fn().mockResolvedValue(finalResult)
  builder.single = vi.fn().mockResolvedValue(finalResult)
  builder.select = vi.fn().mockImplementation(() => {
    // When select is called after insert, return the builder (for chaining to .single())
    return builder
  })

  // Make insert/update return builder for chaining
  builder.insert = vi.fn().mockReturnValue(builder)
  builder.update = vi.fn().mockReturnValue(builder)
  builder.eq = vi.fn().mockReturnValue(builder)
  builder.gte = vi.fn().mockReturnValue(builder)

  return builder
}

function makeDevisInput(overrides: Partial<DevisInput> = {}): DevisInput {
  return {
    service: 'plombier',
    urgency: 'semaine',
    budget: '500',
    description: 'Fuite robinet cuisine',
    codePostal: '75001',
    ville: 'Paris',
    nom: 'Jean Dupont',
    email: 'jean@example.com',
    telephone: '0612345678',
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Reset between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
})

// ===========================================================================
// resolveServiceName
// ===========================================================================

describe('resolveServiceName', () => {
  it('returns known service name for plombier', () => {
    expect(resolveServiceName('plombier')).toBe('Plombier')
  })

  it('returns known service name for electricien', () => {
    expect(resolveServiceName('electricien')).toBe('Électricien')
  })

  it('returns known service name for peintre-en-batiment', () => {
    expect(resolveServiceName('peintre-en-batiment')).toBe('Peintre en bâtiment')
  })

  it('returns known service name for all mapped services', () => {
    expect(resolveServiceName('serrurier')).toBe('Serrurier')
    expect(resolveServiceName('chauffagiste')).toBe('Chauffagiste')
    expect(resolveServiceName('couvreur')).toBe('Couvreur')
    expect(resolveServiceName('menuisier')).toBe('Menuisier')
    expect(resolveServiceName('macon')).toBe('Maçon')
    expect(resolveServiceName('carreleur')).toBe('Carreleur')
    expect(resolveServiceName('jardinier')).toBe('Jardinier-paysagiste')
    expect(resolveServiceName('vitrier')).toBe('Vitrier')
    expect(resolveServiceName('climaticien')).toBe('Climaticien')
    expect(resolveServiceName('cuisiniste')).toBe('Cuisiniste')
    expect(resolveServiceName('solier')).toBe('Solier-moquettiste')
    expect(resolveServiceName('nettoyage')).toBe('Nettoyage professionnel')
    expect(resolveServiceName('general')).toBe('Demande générale')
  })

  it('capitalises and replaces dashes for unknown slugs', () => {
    expect(resolveServiceName('technicien-frigoriste')).toBe('Technicien frigoriste')
  })

  it('capitalises single-word unknown slug', () => {
    expect(resolveServiceName('zingueur')).toBe('Zingueur')
  })

  it('handles empty string gracefully', () => {
    const result = resolveServiceName('')
    expect(result).toBe('')
  })
})

// ===========================================================================
// urgencyLabels export
// ===========================================================================

describe('urgencyLabels', () => {
  it('contains all expected urgency keys', () => {
    expect(urgencyLabels).toHaveProperty('urgent', 'Urgent')
    expect(urgencyLabels).toHaveProperty('semaine', 'Cette semaine')
    expect(urgencyLabels).toHaveProperty('mois', 'Ce mois-ci')
    expect(urgencyLabels).toHaveProperty('flexible', 'Pas urgent')
  })
})

// ===========================================================================
// checkDuplicate
// ===========================================================================

describe('checkDuplicate', () => {
  it('returns true when a matching record exists within 1 hour', async () => {
    const builder = createMockQueryBuilder()
    builder.limit = vi.fn().mockResolvedValue({ data: [{ id: 'existing-id' }] })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await checkDuplicate(
      mockSupabaseClient as never,
      'jean@example.com',
      'Plombier',
      'Paris'
    )

    expect(result).toBe(true)
    expect(mockSupabaseFrom).toHaveBeenCalledWith('devis_requests')
    expect(builder.eq).toHaveBeenCalledWith('client_email', 'jean@example.com')
    expect(builder.eq).toHaveBeenCalledWith('service_name', 'Plombier')
    expect(builder.eq).toHaveBeenCalledWith('city', 'Paris')
  })

  it('returns false when no matching record exists', async () => {
    const builder = createMockQueryBuilder()
    builder.limit = vi.fn().mockResolvedValue({ data: [] })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await checkDuplicate(
      mockSupabaseClient as never,
      'jean@example.com',
      'Plombier',
      'Paris'
    )

    expect(result).toBe(false)
  })

  it('returns false when data is null (DB error fallback)', async () => {
    const builder = createMockQueryBuilder()
    builder.limit = vi.fn().mockResolvedValue({ data: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await checkDuplicate(
      mockSupabaseClient as never,
      'jean@example.com',
      'Plombier',
      'Paris'
    )

    expect(result).toBe(false)
  })

  it('returns false for different email', async () => {
    const builder = createMockQueryBuilder()
    builder.limit = vi.fn().mockResolvedValue({ data: [] })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await checkDuplicate(
      mockSupabaseClient as never,
      'other@example.com',
      'Plombier',
      'Paris'
    )

    expect(result).toBe(false)
    expect(builder.eq).toHaveBeenCalledWith('client_email', 'other@example.com')
  })

  it('returns false for different service', async () => {
    const builder = createMockQueryBuilder()
    builder.limit = vi.fn().mockResolvedValue({ data: [] })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await checkDuplicate(
      mockSupabaseClient as never,
      'jean@example.com',
      'Électricien',
      'Paris'
    )

    expect(result).toBe(false)
    expect(builder.eq).toHaveBeenCalledWith('service_name', 'Électricien')
  })

  it('returns false for different city', async () => {
    const builder = createMockQueryBuilder()
    builder.limit = vi.fn().mockResolvedValue({ data: [] })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await checkDuplicate(
      mockSupabaseClient as never,
      'jean@example.com',
      'Plombier',
      'Lyon'
    )

    expect(result).toBe(false)
    expect(builder.eq).toHaveBeenCalledWith('city', 'Lyon')
  })

  it('uses correct time window (1 hour ago)', async () => {
    const builder = createMockQueryBuilder()
    builder.limit = vi.fn().mockResolvedValue({ data: [] })
    mockSupabaseFrom.mockReturnValue(builder)

    const before = Date.now()
    await checkDuplicate(mockSupabaseClient as never, 'a@b.com', 'X', 'Y')
    const after = Date.now()

    const gteCall = builder.gte.mock.calls[0]
    expect(gteCall[0]).toBe('created_at')
    const timestamp = new Date(gteCall[1]).getTime()
    // Should be roughly 1 hour ago (within 1 second tolerance)
    expect(timestamp).toBeGreaterThanOrEqual(before - 3600000 - 1000)
    expect(timestamp).toBeLessThanOrEqual(after - 3600000 + 1000)
  })

  it('handles empty email', async () => {
    const builder = createMockQueryBuilder()
    builder.limit = vi.fn().mockResolvedValue({ data: [] })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await checkDuplicate(mockSupabaseClient as never, '', 'Plombier', 'Paris')

    expect(result).toBe(false)
    expect(builder.eq).toHaveBeenCalledWith('client_email', '')
  })
})

// ===========================================================================
// checkEmailRateLimit
// ===========================================================================

describe('checkEmailRateLimit', () => {
  it('returns false when count is under the limit (< 5)', async () => {
    const builder = createMockQueryBuilder()
    builder.gte = vi.fn().mockResolvedValue({ count: 3 })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await checkEmailRateLimit(mockSupabaseClient as never, 'jean@example.com')

    expect(result).toBe(false)
  })

  it('returns true when count equals the limit (= 5)', async () => {
    const builder = createMockQueryBuilder()
    builder.gte = vi.fn().mockResolvedValue({ count: 5 })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await checkEmailRateLimit(mockSupabaseClient as never, 'jean@example.com')

    expect(result).toBe(true)
  })

  it('returns true when count exceeds the limit (> 5)', async () => {
    const builder = createMockQueryBuilder()
    builder.gte = vi.fn().mockResolvedValue({ count: 10 })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await checkEmailRateLimit(mockSupabaseClient as never, 'jean@example.com')

    expect(result).toBe(true)
  })

  it('returns false when count is null (DB error)', async () => {
    const builder = createMockQueryBuilder()
    builder.gte = vi.fn().mockResolvedValue({ count: null })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await checkEmailRateLimit(mockSupabaseClient as never, 'jean@example.com')

    expect(result).toBe(false)
  })

  it('returns false when count is zero', async () => {
    const builder = createMockQueryBuilder()
    builder.gte = vi.fn().mockResolvedValue({ count: 0 })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await checkEmailRateLimit(mockSupabaseClient as never, 'jean@example.com')

    expect(result).toBe(false)
  })

  it('returns false when count is exactly 4', async () => {
    const builder = createMockQueryBuilder()
    builder.gte = vi.fn().mockResolvedValue({ count: 4 })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await checkEmailRateLimit(mockSupabaseClient as never, 'jean@example.com')

    expect(result).toBe(false)
  })

  it('queries the correct table with head:true count', async () => {
    const builder = createMockQueryBuilder()
    // Need select to accept options and return chainable builder
    builder.select = vi.fn().mockReturnValue(builder)
    builder.eq = vi.fn().mockReturnValue(builder)
    builder.gte = vi.fn().mockResolvedValue({ count: 0 })
    mockSupabaseFrom.mockReturnValue(builder)

    await checkEmailRateLimit(mockSupabaseClient as never, 'test@test.com')

    expect(mockSupabaseFrom).toHaveBeenCalledWith('devis_requests')
    expect(builder.select).toHaveBeenCalledWith('id', { count: 'exact', head: true })
    expect(builder.eq).toHaveBeenCalledWith('client_email', 'test@test.com')
  })

  it('independent emails are checked independently', async () => {
    const builder1 = createMockQueryBuilder()
    builder1.gte = vi.fn().mockResolvedValue({ count: 5 })
    const builder2 = createMockQueryBuilder()
    builder2.gte = vi.fn().mockResolvedValue({ count: 1 })

    mockSupabaseFrom.mockReturnValueOnce(builder1).mockReturnValueOnce(builder2)

    const r1 = await checkEmailRateLimit(mockSupabaseClient as never, 'spammer@evil.com')
    const r2 = await checkEmailRateLimit(mockSupabaseClient as never, 'legit@good.com')

    expect(r1).toBe(true)
    expect(r2).toBe(false)
  })
})

// ===========================================================================
// processDevis
// ===========================================================================

describe('processDevis', () => {
  /** Setup mock chain for the standard happy path */
  function setupHappyPathMocks() {
    const leadId = 'lead-uuid-123'
    let callIndex = 0

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'devis_requests') {
        callIndex++
        // Call 1: checkDuplicate — select().eq().eq().eq().gte().limit()
        if (callIndex === 1) {
          const b = createMockQueryBuilder()
          b.limit = vi.fn().mockResolvedValue({ data: [] })
          return b
        }
        // Call 2: checkEmailRateLimit — select().eq().gte()
        if (callIndex === 2) {
          const b = createMockQueryBuilder()
          b.select = vi.fn().mockReturnValue(b)
          b.eq = vi.fn().mockReturnValue(b)
          b.gte = vi.fn().mockResolvedValue({ count: 0 })
          return b
        }
        // Call 3: insert
        if (callIndex === 3) {
          const b = createMockQueryBuilder()
          b.single = vi.fn().mockResolvedValue({
            data: { id: leadId, service_name: 'Plombier' },
            error: null,
          })
          return b
        }
        // Call 4+: update for CEE or analytics
        const b = createMockQueryBuilder()
        b.eq = vi.fn().mockResolvedValue({ error: null })
        return b
      }
      if (table === 'analytics_events') {
        const b = createMockQueryBuilder()
        b.insert = vi.fn().mockReturnValue({
          then: vi.fn().mockImplementation((cb: (v: { error: null }) => void) => {
            cb({ error: null })
            return Promise.resolve()
          }),
        })
        return b
      }
      return createMockQueryBuilder()
    })

    return leadId
  }

  it('returns success with lead id on happy path', async () => {
    const leadId = setupHappyPathMocks()
    const input = makeDevisInput()

    const result = await processDevis(input, 'client-123')

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.id).toBe(leadId)
      expect(result.artisans_notified).toBe(2)
      expect(result.artisans_found).toBe(true)
      expect(result.cee_eligible).toBe(false)
    }
  })

  it('returns duplicate error when duplicate is detected', async () => {
    const builder = createMockQueryBuilder()
    builder.limit = vi.fn().mockResolvedValue({ data: [{ id: 'existing' }] })
    mockSupabaseFrom.mockReturnValue(builder)

    const input = makeDevisInput()
    const result = await processDevis(input, null)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('duplicate')
    }
  })

  it('returns email_rate_limit error when email is rate-limited', async () => {
    let callIndex = 0
    mockSupabaseFrom.mockImplementation(() => {
      callIndex++
      if (callIndex === 1) {
        // checkDuplicate: no duplicate
        const b = createMockQueryBuilder()
        b.limit = vi.fn().mockResolvedValue({ data: [] })
        return b
      }
      // checkEmailRateLimit: at limit
      const b = createMockQueryBuilder()
      b.select = vi.fn().mockReturnValue(b)
      b.eq = vi.fn().mockReturnValue(b)
      b.gte = vi.fn().mockResolvedValue({ count: 5 })
      return b
    })

    const input = makeDevisInput()
    const result = await processDevis(input, null)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('email_rate_limit')
    }
  })

  it('skips email rate limit check when email is empty', async () => {
    let callIndex = 0
    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'devis_requests') {
        callIndex++
        if (callIndex === 1) {
          const b = createMockQueryBuilder()
          b.limit = vi.fn().mockResolvedValue({ data: [] })
          return b
        }
        // Insert (no rate limit check because email is empty)
        if (callIndex === 2) {
          const b = createMockQueryBuilder()
          b.single = vi.fn().mockResolvedValue({
            data: { id: 'lead-no-email' },
            error: null,
          })
          return b
        }
        const b = createMockQueryBuilder()
        b.eq = vi.fn().mockResolvedValue({ error: null })
        return b
      }
      if (table === 'analytics_events') {
        const b = createMockQueryBuilder()
        b.insert = vi.fn().mockReturnValue({
          then: vi.fn().mockImplementation((cb: (v: { error: null }) => void) => {
            cb({ error: null })
            return Promise.resolve()
          }),
        })
        return b
      }
      return createMockQueryBuilder()
    })

    const input = makeDevisInput({ email: '' })
    const result = await processDevis(input, null)

    // Should succeed — email rate limit is not checked
    expect(result.success).toBe(true)
  })

  it('returns db_error when insert fails', async () => {
    let callIndex = 0
    mockSupabaseFrom.mockImplementation(() => {
      callIndex++
      if (callIndex === 1) {
        const b = createMockQueryBuilder()
        b.limit = vi.fn().mockResolvedValue({ data: [] })
        return b
      }
      if (callIndex === 2) {
        const b = createMockQueryBuilder()
        b.select = vi.fn().mockReturnValue(b)
        b.eq = vi.fn().mockReturnValue(b)
        b.gte = vi.fn().mockResolvedValue({ count: 0 })
        return b
      }
      // Insert fails
      const b = createMockQueryBuilder()
      b.single = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'DB insert failed', code: '42P01' },
      })
      return b
    })

    const input = makeDevisInput()
    const result = await processDevis(input, null)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('db_error')
    }
  })

  it('calls dispatchLead with correct arguments', async () => {
    setupHappyPathMocks()
    const input = makeDevisInput()
    await processDevis(input, 'client-abc')

    expect(dispatchLead).toHaveBeenCalledWith('lead-uuid-123', {
      serviceName: 'Plombier',
      city: 'Paris',
      postalCode: '75001',
      urgency: 'semaine',
      sourceTable: 'devis_requests',
      ceeEligible: false,
    })
  })

  it('calls syncDevisRequestToPipedrive', async () => {
    setupHappyPathMocks()
    const input = makeDevisInput()
    await processDevis(input, null)

    expect(syncDevisRequestToPipedrive).toHaveBeenCalledWith('lead-uuid-123')
  })

  it('calls logLeadEvent with created event', async () => {
    setupHappyPathMocks()
    const input = makeDevisInput()
    await processDevis(input, 'client-xyz')

    expect(logLeadEvent).toHaveBeenCalledWith('lead-uuid-123', 'created', {
      actorId: 'client-xyz',
    })
  })

  it('handles CEE eligible devis', async () => {
    vi.mocked(qualifyDevisForCee).mockResolvedValueOnce({
      eligible: true,
      codes: ['BAR-TH-160', 'BAR-TH-104'],
    })

    setupHappyPathMocks()
    const input = makeDevisInput({ service: 'chauffagiste' })
    const result = await processDevis(input, null)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.cee_eligible).toBe(true)
      expect(result.cee_operation_codes).toEqual(['BAR-TH-160', 'BAR-TH-104'])
    }
  })

  it('calls runCeeDispatchFireAndForget when CEE eligible and providers assigned', async () => {
    vi.mocked(qualifyDevisForCee).mockResolvedValueOnce({
      eligible: true,
      codes: ['BAR-TH-160'],
    })

    setupHappyPathMocks()
    const input = makeDevisInput({ service: 'chauffagiste', codePostal: '69001' })
    await processDevis(input, 'client-cee')

    expect(runCeeDispatchFireAndForget).toHaveBeenCalled()
  })

  it('does not call runCeeDispatchFireAndForget when CEE not eligible', async () => {
    vi.mocked(qualifyDevisForCee).mockResolvedValueOnce({
      eligible: false,
      codes: [],
    })

    setupHappyPathMocks()
    const input = makeDevisInput()
    await processDevis(input, null)

    expect(runCeeDispatchFireAndForget).not.toHaveBeenCalled()
  })

  it('does not call runCeeDispatchFireAndForget when no providers assigned', async () => {
    vi.mocked(qualifyDevisForCee).mockResolvedValueOnce({
      eligible: true,
      codes: ['BAR-TH-160'],
    })
    vi.mocked(dispatchLead).mockResolvedValueOnce([])

    setupHappyPathMocks()
    const input = makeDevisInput()
    await processDevis(input, null)

    expect(runCeeDispatchFireAndForget).not.toHaveBeenCalled()
  })

  it('handles CEE qualification error gracefully (best-effort)', async () => {
    vi.mocked(qualifyDevisForCee).mockRejectedValueOnce(new Error('CEE service down'))

    setupHappyPathMocks()
    const input = makeDevisInput()
    const result = await processDevis(input, null)

    // Should still succeed despite CEE error
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.cee_eligible).toBe(false)
    }
  })

  it('handles dispatch error gracefully (returns empty array)', async () => {
    vi.mocked(dispatchLead).mockRejectedValueOnce(new Error('Dispatch failed'))

    setupHappyPathMocks()
    const input = makeDevisInput()
    const result = await processDevis(input, null)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.artisans_notified).toBe(0)
      expect(result.artisans_found).toBe(false)
    }
  })

  it('handles Pipedrive sync error gracefully', async () => {
    vi.mocked(syncDevisRequestToPipedrive).mockRejectedValueOnce(new Error('Pipedrive timeout'))

    setupHappyPathMocks()
    const input = makeDevisInput()
    const result = await processDevis(input, null)

    // Should still succeed
    expect(result.success).toBe(true)
  })

  it('uses default values for optional fields', async () => {
    // When email is undefined/empty, processDevis skips rate limit check,
    // so the call order is: 1=checkDuplicate, 2=insert (not 3)
    let callIndex = 0
    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'devis_requests') {
        callIndex++
        if (callIndex === 1) {
          const b = createMockQueryBuilder()
          b.limit = vi.fn().mockResolvedValue({ data: [] })
          return b
        }
        if (callIndex === 2) {
          const b = createMockQueryBuilder()
          b.single = vi.fn().mockResolvedValue({
            data: { id: 'lead-defaults' },
            error: null,
          })
          return b
        }
        const b = createMockQueryBuilder()
        b.eq = vi.fn().mockResolvedValue({ error: null })
        return b
      }
      if (table === 'analytics_events') {
        const b = createMockQueryBuilder()
        b.insert = vi.fn().mockReturnValue({
          then: vi.fn().mockImplementation((cb: (v: { error: null }) => void) => {
            cb({ error: null })
            return Promise.resolve()
          }),
        })
        return b
      }
      return createMockQueryBuilder()
    })

    const input = makeDevisInput({
      nom: undefined,
      email: undefined,
      description: undefined,
      budget: undefined,
      ville: undefined,
      codePostal: undefined,
    })

    const result = await processDevis(input, null)

    expect(result.success).toBe(true)
  })

  it('handles null clientId (anonymous devis)', async () => {
    setupHappyPathMocks()
    const input = makeDevisInput()
    const result = await processDevis(input, null)

    expect(result.success).toBe(true)
    expect(logLeadEvent).toHaveBeenCalledWith('lead-uuid-123', 'created', {
      actorId: undefined,
    })
  })

  it('sends emails via Resend on success with email provided', async () => {
    // Track that getResendClient is called during processDevis
    setupHappyPathMocks()
    const input = makeDevisInput({ email: 'client@test.fr' })
    await processDevis(input, null)

    // getResendClient is called inside sendDevisEmails
    expect(getResendClient).toHaveBeenCalled()
  })

  it('handles Resend not configured (skips emails)', async () => {
    vi.mocked(getResendClient).mockImplementationOnce(() => {
      throw new Error('Resend not configured')
    })

    setupHappyPathMocks()
    const input = makeDevisInput()
    const result = await processDevis(input, null)

    // Should still succeed
    expect(result.success).toBe(true)
  })

  it('maps urgency correctly for known values', async () => {
    setupHappyPathMocks()
    const input = makeDevisInput({ urgency: 'urgent' })
    await processDevis(input, null)

    expect(dispatchLead).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ urgency: 'urgent' })
    )
  })

  it('falls back to normal urgency for unknown urgency value', async () => {
    setupHappyPathMocks()
    const input = makeDevisInput({ urgency: 'unknown_urgency' })
    await processDevis(input, null)

    expect(dispatchLead).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ urgency: 'normal' })
    )
  })

  it('resolves correct service name for the insert', async () => {
    let insertedData: Record<string, unknown> | null = null
    let callIndex = 0

    mockSupabaseFrom.mockImplementation((table: string) => {
      if (table === 'devis_requests') {
        callIndex++
        if (callIndex === 1) {
          const b = createMockQueryBuilder()
          b.limit = vi.fn().mockResolvedValue({ data: [] })
          return b
        }
        if (callIndex === 2) {
          const b = createMockQueryBuilder()
          b.select = vi.fn().mockReturnValue(b)
          b.eq = vi.fn().mockReturnValue(b)
          b.gte = vi.fn().mockResolvedValue({ count: 0 })
          return b
        }
        if (callIndex === 3) {
          const b = createMockQueryBuilder()
          b.insert = vi.fn().mockImplementation((data: Record<string, unknown>) => {
            insertedData = data
            return b
          })
          b.single = vi.fn().mockResolvedValue({
            data: { id: 'lead-svc' },
            error: null,
          })
          return b
        }
        const b = createMockQueryBuilder()
        b.eq = vi.fn().mockResolvedValue({ error: null })
        return b
      }
      if (table === 'analytics_events') {
        const b = createMockQueryBuilder()
        b.insert = vi.fn().mockReturnValue({
          then: vi.fn().mockImplementation((cb: (v: { error: null }) => void) => {
            cb({ error: null })
            return Promise.resolve()
          }),
        })
        return b
      }
      return createMockQueryBuilder()
    })

    const input = makeDevisInput({ service: 'peintre-en-batiment' })
    await processDevis(input, null)

    expect(insertedData).not.toBeNull()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(insertedData!.service_name).toBe('Peintre en bâtiment')
  })

  it('logs dispatched event when providers are assigned', async () => {
    setupHappyPathMocks()
    const input = makeDevisInput()
    await processDevis(input, null)

    expect(logLeadEvent).toHaveBeenCalledWith('lead-uuid-123', 'dispatched', {
      metadata: { count: 2 },
    })
  })

  it('does not log dispatched event when no providers assigned', async () => {
    vi.mocked(dispatchLead).mockResolvedValueOnce([])

    setupHappyPathMocks()
    const input = makeDevisInput()
    await processDevis(input, null)

    expect(logLeadEvent).not.toHaveBeenCalledWith(
      expect.any(String),
      'dispatched',
      expect.anything()
    )
  })
})

// ===========================================================================
// Edge cases
// ===========================================================================

describe('edge cases', () => {
  it('checkDuplicate handles empty string for all params', async () => {
    const builder = createMockQueryBuilder()
    builder.limit = vi.fn().mockResolvedValue({ data: [] })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await checkDuplicate(mockSupabaseClient as never, '', '', '')

    expect(result).toBe(false)
    expect(builder.eq).toHaveBeenCalledWith('client_email', '')
    expect(builder.eq).toHaveBeenCalledWith('service_name', '')
    expect(builder.eq).toHaveBeenCalledWith('city', '')
  })

  it('checkEmailRateLimit handles email with special characters', async () => {
    const builder = createMockQueryBuilder()
    builder.select = vi.fn().mockReturnValue(builder)
    builder.eq = vi.fn().mockReturnValue(builder)
    builder.gte = vi.fn().mockResolvedValue({ count: 0 })
    mockSupabaseFrom.mockReturnValue(builder)

    const result = await checkEmailRateLimit(mockSupabaseClient as never, 'user+tag@example.com')

    expect(result).toBe(false)
    expect(builder.eq).toHaveBeenCalledWith('client_email', 'user+tag@example.com')
  })

  it('resolveServiceName handles slug with multiple dashes', () => {
    expect(resolveServiceName('a-b-c-d')).toBe('A b c d')
  })

  it('resolveServiceName handles single character', () => {
    expect(resolveServiceName('x')).toBe('X')
  })
})
