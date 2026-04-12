/**
 * Tests — CEE Dispatch API (/api/cee/dispatch)
 *
 * Couvre :
 *   - auth via header `x-internal-secret` (présent / absent / invalide,
 *     comparaison temps constant)
 *   - validation zod du body (UUIDs, postal_code, cap candidates)
 *   - mapping outcome → HTTP (cee_routed / fallback_non_cee / error)
 *   - mapping snake_case (HTTP) → camelCase (dispatcher)
 *   - short-circuit fallback côté dispatcher (no_candidate_provider)
 *   - filet de sécurité si le dispatcher throw
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { DispatchOutcome } from '@/lib/cee/dispatcher'

// ============================================
// Mocks
// ============================================

const mockJsonFn = vi.fn(
  (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
    body,
    status: init?.status ?? 200,
    headers: init?.headers ?? {},
  })
)

vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) =>
      mockJsonFn(body, init),
  },
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

const mockAdminSupabase = { from: vi.fn() }
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockAdminSupabase),
}))

const mockDispatchDevis = vi.fn()
vi.mock('@/lib/cee/dispatcher', () => ({
  dispatchDevis: (...args: unknown[]) => mockDispatchDevis(...args),
}))

// ============================================
// Helpers
// ============================================

const DEVIS_UUID = '550e8400-e29b-41d4-a716-446655440001'
const CLIENT_UUID = '550e8400-e29b-41d4-a716-446655440002'
const PROVIDER_UUID_1 = '550e8400-e29b-41d4-a716-446655440010'
const PROVIDER_UUID_2 = '550e8400-e29b-41d4-a716-446655440011'
const SECRET = 'test-internal-secret-1234567890'

type MockResult = {
  body: Record<string, unknown>
  status: number
  headers: Record<string, string>
}

function makeRequest(body: unknown, headers?: Record<string, string>) {
  return new Request('http://localhost/api/cee/dispatch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    devis_id: DEVIS_UUID,
    client_id: CLIENT_UUID,
    service_slug: 'chauffagiste',
    postal_code: '75011',
    candidate_provider_ids: [PROVIDER_UUID_1, PROVIDER_UUID_2],
    ...overrides,
  }
}

const routedOutcome: DispatchOutcome = {
  kind: 'cee_routed',
  operationCode: 'BAR-TH-104',
  operationName: 'Pompe à chaleur de type air/eau ou eau/eau',
  providerId: PROVIDER_UUID_1,
  delegataireId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  dossierId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  primeEstimate: {
    kwhc_min: 100,
    kwhc_max: 200,
    euros_classique_min: 50,
    euros_classique_max: 100,
    zone: 'H1',
  },
  justificatifsRequis: [{ code: 'PVPLUS', label: 'Procès-verbal', obligatoire: true }],
}

const fallbackNoCandidate: DispatchOutcome = {
  kind: 'fallback_non_cee',
  reason: 'no_candidate_provider',
  providerId: null,
}

const errorOutcome: DispatchOutcome = {
  kind: 'error',
  message: 'dossier_creation_failed',
}

// ============================================
// Setup / teardown
// ============================================

const originalEnv = { ...process.env }

beforeEach(() => {
  vi.clearAllMocks()
  process.env.INTERNAL_API_SECRET = SECRET
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
})

afterEach(() => {
  process.env = { ...originalEnv }
})

// ============================================
// Tests
// ============================================

describe('POST /api/cee/dispatch — auth', () => {
  it('returns 401 when x-internal-secret header is absent', async () => {
    const { POST } = await import('@/app/api/cee/dispatch/route')
    const res = (await POST(makeRequest(validBody()) as never)) as unknown as MockResult

    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({
      success: false,
      error: { code: 'unauthorized' },
    })
    expect(mockDispatchDevis).not.toHaveBeenCalled()
  })

  it('returns 401 when x-internal-secret header is invalid', async () => {
    const { POST } = await import('@/app/api/cee/dispatch/route')
    const res = (await POST(
      makeRequest(validBody(), { 'x-internal-secret': 'wrong-secret' }) as never
    )) as unknown as MockResult

    expect(res.status).toBe(401)
    expect(mockDispatchDevis).not.toHaveBeenCalled()
  })

  it('returns 401 when INTERNAL_API_SECRET env var is unset (fail-closed)', async () => {
    delete process.env.INTERNAL_API_SECRET

    const { POST } = await import('@/app/api/cee/dispatch/route')
    const res = (await POST(
      makeRequest(validBody(), { 'x-internal-secret': SECRET }) as never
    )) as unknown as MockResult

    expect(res.status).toBe(401)
    expect(mockDispatchDevis).not.toHaveBeenCalled()
  })

  it('returns 401 when provided secret has a different length (no throw)', async () => {
    const { POST } = await import('@/app/api/cee/dispatch/route')
    const res = (await POST(
      makeRequest(validBody(), { 'x-internal-secret': 'short' }) as never
    )) as unknown as MockResult

    expect(res.status).toBe(401)
  })
})

describe('POST /api/cee/dispatch — body validation', () => {
  it('returns 400 when body is not valid JSON', async () => {
    const { POST } = await import('@/app/api/cee/dispatch/route')
    const res = (await POST(
      makeRequest('{not-json', { 'x-internal-secret': SECRET }) as never
    )) as unknown as MockResult

    expect(res.status).toBe(400)
    expect(res.body.error).toMatchObject({ code: 'invalid_body' })
  })

  it('returns 400 when devis_id is not a UUID', async () => {
    const { POST } = await import('@/app/api/cee/dispatch/route')
    const res = (await POST(
      makeRequest(validBody({ devis_id: 'not-a-uuid' }), {
        'x-internal-secret': SECRET,
      }) as never
    )) as unknown as MockResult

    expect(res.status).toBe(400)
    expect(res.body.error).toMatchObject({ code: 'invalid_body' })
  })

  it('returns 400 when required fields are missing', async () => {
    const { POST } = await import('@/app/api/cee/dispatch/route')
    const res = (await POST(
      makeRequest({}, { 'x-internal-secret': SECRET }) as never
    )) as unknown as MockResult

    expect(res.status).toBe(400)
    expect(res.body.error).toMatchObject({ code: 'invalid_body' })
  })

  it('returns 400 when client_id is omitted (undefined)', async () => {
    // Contrat : client_id est REQUIS mais peut être null. Omission → 400.
    const { POST } = await import('@/app/api/cee/dispatch/route')
    const body = validBody()
    delete (body as Record<string, unknown>).client_id
    const res = (await POST(
      makeRequest(body, { 'x-internal-secret': SECRET }) as never
    )) as unknown as MockResult

    expect(res.status).toBe(400)
    expect(res.body.error).toMatchObject({ code: 'invalid_body' })
    expect(mockDispatchDevis).not.toHaveBeenCalled()
  })

  it('accepte client_id: null (anonymous submission, no profile)', async () => {
    mockDispatchDevis.mockResolvedValueOnce(routedOutcome)

    const { POST } = await import('@/app/api/cee/dispatch/route')
    const res = (await POST(
      makeRequest(validBody({ client_id: null }), {
        'x-internal-secret': SECRET,
      }) as never
    )) as unknown as MockResult

    expect(res.status).toBe(200)
    expect(mockDispatchDevis).toHaveBeenCalledTimes(1)
    const [, input] = mockDispatchDevis.mock.calls[0]
    expect(input.clientId).toBeNull()
  })

  it('returns 400 when postal_code format is invalid', async () => {
    const { POST } = await import('@/app/api/cee/dispatch/route')
    const res = (await POST(
      makeRequest(validBody({ postal_code: 'ABCDE' }), {
        'x-internal-secret': SECRET,
      }) as never
    )) as unknown as MockResult

    expect(res.status).toBe(400)
  })

  it('returns 400 when candidate_provider_ids exceeds cap (>50)', async () => {
    const ids = Array.from(
      { length: 51 },
      (_, i) =>
        // 51 UUIDs distincts mais bien formés
        `550e8400-e29b-41d4-a716-${String(446655440100 + i).padStart(12, '0')}`
    )

    const { POST } = await import('@/app/api/cee/dispatch/route')
    const res = (await POST(
      makeRequest(validBody({ candidate_provider_ids: ids }), {
        'x-internal-secret': SECRET,
      }) as never
    )) as unknown as MockResult

    expect(res.status).toBe(400)
    expect(mockDispatchDevis).not.toHaveBeenCalled()
  })

  it('accepte exactement 50 UUIDs (borne incluse, off-by-one fix)', async () => {
    mockDispatchDevis.mockResolvedValueOnce(routedOutcome)
    const ids = Array.from(
      { length: 50 },
      (_, i) => `550e8400-e29b-41d4-a716-${String(446655440200 + i).padStart(12, '0')}`
    )

    const { POST } = await import('@/app/api/cee/dispatch/route')
    const res = (await POST(
      makeRequest(validBody({ candidate_provider_ids: ids }), {
        'x-internal-secret': SECRET,
      }) as never
    )) as unknown as MockResult

    expect(res.status).toBe(200)
    expect(mockDispatchDevis).toHaveBeenCalledTimes(1)
    const [, input] = mockDispatchDevis.mock.calls[0]
    expect(input.candidateProviderIds).toHaveLength(50)
  })

  it('returns 400 when extra keys are present (strict schema)', async () => {
    const { POST } = await import('@/app/api/cee/dispatch/route')
    const res = (await POST(
      makeRequest(validBody({ extra_field: 'boom' }), {
        'x-internal-secret': SECRET,
      }) as never
    )) as unknown as MockResult

    expect(res.status).toBe(400)
  })
})

describe('POST /api/cee/dispatch — happy path', () => {
  it('returns 200 with cee_routed outcome', async () => {
    mockDispatchDevis.mockResolvedValueOnce(routedOutcome)

    const { POST } = await import('@/app/api/cee/dispatch/route')
    const res = (await POST(
      makeRequest(validBody(), { 'x-internal-secret': SECRET }) as never
    )) as unknown as MockResult

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true, outcome: routedOutcome })
    expect(res.headers['Cache-Control']).toBe('no-store')
    expect(res.headers['X-Content-Type-Options']).toBe('nosniff')
  })

  it('calls dispatchDevis with correct snake→camel mapping', async () => {
    mockDispatchDevis.mockResolvedValueOnce(routedOutcome)

    const { POST } = await import('@/app/api/cee/dispatch/route')
    await POST(makeRequest(validBody(), { 'x-internal-secret': SECRET }) as never)

    expect(mockDispatchDevis).toHaveBeenCalledTimes(1)
    const [, input] = mockDispatchDevis.mock.calls[0]
    expect(input).toEqual({
      devisId: DEVIS_UUID,
      clientId: CLIENT_UUID,
      serviceSlug: 'chauffagiste',
      postalCode: '75011',
      candidateProviderIds: [PROVIDER_UUID_1, PROVIDER_UUID_2],
    })
  })

  it('normalizes omitted postal_code to null for the dispatcher', async () => {
    mockDispatchDevis.mockResolvedValueOnce(routedOutcome)

    const body = validBody()
    delete (body as Record<string, unknown>).postal_code

    const { POST } = await import('@/app/api/cee/dispatch/route')
    await POST(makeRequest(body, { 'x-internal-secret': SECRET }) as never)

    const [, input] = mockDispatchDevis.mock.calls[0]
    expect(input.postalCode).toBeNull()
  })
})

describe('POST /api/cee/dispatch — fallback & error', () => {
  it('returns 200 with fallback_non_cee when candidate_provider_ids is empty', async () => {
    mockDispatchDevis.mockResolvedValueOnce(fallbackNoCandidate)

    const { POST } = await import('@/app/api/cee/dispatch/route')
    const res = (await POST(
      makeRequest(validBody({ candidate_provider_ids: [] }), {
        'x-internal-secret': SECRET,
      }) as never
    )) as unknown as MockResult

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      success: true,
      outcome: {
        kind: 'fallback_non_cee',
        reason: 'no_candidate_provider',
      },
    })
  })

  it('returns 500 when dispatcher returns kind=error', async () => {
    mockDispatchDevis.mockResolvedValueOnce(errorOutcome)

    const { POST } = await import('@/app/api/cee/dispatch/route')
    const res = (await POST(
      makeRequest(validBody(), { 'x-internal-secret': SECRET }) as never
    )) as unknown as MockResult

    expect(res.status).toBe(500)
    expect(res.body).toMatchObject({
      success: false,
      error: { code: 'dispatch_error', message: 'dossier_creation_failed' },
    })
  })

  it('returns 500 when dispatcher throws unexpectedly', async () => {
    mockDispatchDevis.mockRejectedValueOnce(new Error('boom'))

    const { POST } = await import('@/app/api/cee/dispatch/route')
    const res = (await POST(
      makeRequest(validBody(), { 'x-internal-secret': SECRET }) as never
    )) as unknown as MockResult

    expect(res.status).toBe(500)
    expect(res.body).toMatchObject({
      success: false,
      error: { code: 'dispatch_error' },
    })
  })
})
