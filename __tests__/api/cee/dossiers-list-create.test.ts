/**
 * Tests — GET + POST /api/cee/dossiers
 *
 * Covers:
 *   - Auth obligatoire (401)
 *   - CSRF validateOrigin sur POST (403)
 *   - Rate-limit POST 10/min (429)
 *   - Ownership check partner_id → user_id (403)
 *   - Création retourne 201, idempotent retourne 200
 *   - Business gate errors mappés en bon HTTP status
 *   - GET retourne liste vide si pas de partner
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

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
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

// ---------------------------------------------------------------------------
// Supabase mock
// ---------------------------------------------------------------------------
const maybeSinglePartner = vi.fn()
const maybeSingleOwnerCheck = vi.fn()
const listDossiers = vi.fn()

const mockSupabase = {
  auth: {
    getUser: vi.fn(async () => ({
      data: { user: { id: 'user-1', email: 'a@b.fr' } },
      error: null,
    })),
  },
  from: vi.fn((table: string) => {
    if (table === 'cee_artisan_partners') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: maybeSingleOwnerCheck,
            })),
            maybeSingle: maybeSinglePartner,
          })),
          maybeSingle: maybeSinglePartner,
        })),
      }
    }
    if (table === 'cee_dossiers') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => listDossiers()),
            })),
          })),
        })),
      }
    }
    return { select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn() })) })) }
  }),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => mockSupabase),
}))

// createDossier mock
const createDossierMock = vi.fn()
vi.mock('@/lib/cee/dossier-creation', () => ({
  CreateDossierInputSchema: {
    safeParse: (data: unknown) => {
      // Minimal validation: check required fields exist
      const d = data as Record<string, unknown>
      const required = [
        'partner_id',
        'provider_id',
        'operation_code',
        'client_code_postal',
        'client_email_hash',
        'montant_ht_cts',
        'montant_ttc_cts',
        'date_devis',
        'forfait_id',
        'forfait_version',
        'prime_cee_cts',
        'commission_rate',
        'client_nom_b64',
        'client_prenom_b64',
        'client_email_b64',
        'client_adresse_b64',
        'client_commune_insee',
        'foyer_personnes',
        'revenus_categorie',
        'type_travaux',
      ]
      const missing = required.filter((k) => d[k] === undefined)
      if (missing.length > 0) {
        return {
          success: false,
          error: { issues: missing.map((k) => ({ path: [k], message: 'required' })) },
        }
      }
      return { success: true, data: d }
    },
  },
  createDossier: (...args: unknown[]) =>
    (createDossierMock as (...a: unknown[]) => unknown)(...args),
  hashEmailForDossier: (email: string) => `hash:${email}`,
  generateDossierReference: () => 'SAE-202604-001234',
}))

type MockResult = { body: Record<string, unknown>; status: number }

function makeGetRequest(url = 'http://localhost:3000/api/cee/dossiers') {
  return new Request(url, { method: 'GET' })
}

function makePostRequest(body: unknown, headers?: Record<string, string>) {
  return new Request('http://localhost:3000/api/cee/dossiers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

function makeValidBody() {
  return {
    partner_id: 'partner-1',
    provider_id: 'provider-1',
    client_nom_b64: 'RHVwb250',
    client_prenom_b64: 'SmVhbg==',
    client_email_b64: 'amVhbkBleGFtcGxlLmNvbQ==',
    client_email_hash: 'a'.repeat(64),
    client_telephone_b64: null,
    client_adresse_b64: 'MXJ1ZWRlbGFQYWl4',
    client_code_postal: '75001',
    client_commune_insee: '75056',
    foyer_personnes: 2,
    revenus_categorie: 'modeste',
    rfr_declared_cts: null,
    operation_code: 'BAR-TH-171',
    type_travaux: 'Installation PAC',
    surface_m2: null,
    annee_construction: null,
    energie_remplacee: null,
    montant_ht_cts: 500000,
    montant_ttc_cts: 600000,
    date_devis: '2026-04-10',
    date_chantier_prevue: null,
    forfait_id: 1,
    forfait_version: 'v1',
    prime_cee_cts: 120000,
    prime_mpr_cts: null,
    commission_rate: 10,
  }
}

const originalEnv = { ...process.env }

beforeEach(async () => {
  vi.clearAllMocks()
  ;(process.env as Record<string, string | undefined>) = {
    ...originalEnv,
    NODE_ENV: 'test',
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  }
  maybeSinglePartner.mockResolvedValue({ data: { id: 'partner-1' }, error: null })
  maybeSingleOwnerCheck.mockResolvedValue({ data: { id: 'partner-1' }, error: null })
  listDossiers.mockResolvedValue({ data: [], error: null })
  createDossierMock.mockResolvedValue({
    ok: true,
    dossier: { id: 'dossier-1', status: 'draft', reference: 'SAE-202604-001234' },
    status: 'draft',
  })
  const rl = await import('@/lib/cee/rate-limit')
  rl._resetRateLimitStoreForTests()
})
afterEach(() => {
  process.env = { ...originalEnv }
  vi.resetModules()
})

// ---------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------
describe('GET /api/cee/dossiers', () => {
  it('returns 401 when not authenticated', async () => {
    ;(mockSupabase.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { user: null },
      error: null,
    })
    const { GET } = await import('@/app/api/cee/dossiers/route')
    const res = (await GET(makeGetRequest() as never)) as unknown as MockResult
    expect(res.status).toBe(401)
  })

  it('returns empty array when no partner found', async () => {
    maybeSinglePartner.mockResolvedValueOnce({ data: null, error: null })
    const { GET } = await import('@/app/api/cee/dossiers/route')
    const res = (await GET(makeGetRequest() as never)) as unknown as MockResult
    expect(res.status).toBe(200)
    expect((res.body as { data: unknown[] }).data).toHaveLength(0)
  })

  it('returns dossier list for authenticated artisan', async () => {
    listDossiers.mockResolvedValueOnce({
      data: [
        { id: 'd-1', reference: 'SAE-202604-000001', status: 'draft' },
        { id: 'd-2', reference: 'SAE-202604-000002', status: 'submitted_by_artisan' },
      ],
      error: null,
    })
    const { GET } = await import('@/app/api/cee/dossiers/route')
    const res = (await GET(makeGetRequest() as never)) as unknown as MockResult
    expect(res.status).toBe(200)
    expect((res.body as { data: unknown[] }).data).toHaveLength(2)
  })
})

// ---------------------------------------------------------------------------
// POST
// ---------------------------------------------------------------------------
describe('POST /api/cee/dossiers', () => {
  it('returns 401 when not authenticated', async () => {
    ;(mockSupabase.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { user: null },
      error: null,
    })
    const { POST } = await import('@/app/api/cee/dossiers/route')
    const res = (await POST(makePostRequest(makeValidBody()) as never)) as unknown as MockResult
    expect(res.status).toBe(401)
  })

  it('returns 403 on CSRF cross-site request', async () => {
    const { POST } = await import('@/app/api/cee/dossiers/route')
    const res = (await POST(
      makePostRequest(makeValidBody(), { 'Sec-Fetch-Site': 'cross-site' }) as never
    )) as unknown as MockResult
    expect(res.status).toBe(403)
  })

  it('returns 429 after 10 requests/min', async () => {
    const { POST } = await import('@/app/api/cee/dossiers/route')
    for (let i = 0; i < 10; i++) {
      await POST(makePostRequest(makeValidBody()) as never)
    }
    const res = (await POST(makePostRequest(makeValidBody()) as never)) as unknown as MockResult
    expect(res.status).toBe(429)
  })

  it('returns 403 when partner_id does not belong to authenticated user', async () => {
    maybeSingleOwnerCheck.mockResolvedValueOnce({ data: null, error: null })
    const { POST } = await import('@/app/api/cee/dossiers/route')
    const res = (await POST(makePostRequest(makeValidBody()) as never)) as unknown as MockResult
    expect(res.status).toBe(403)
  })

  it('returns 201 on successful creation', async () => {
    const { POST } = await import('@/app/api/cee/dossiers/route')
    const res = (await POST(makePostRequest(makeValidBody()) as never)) as unknown as MockResult
    expect(res.status).toBe(201)
    expect((res.body as { success: boolean }).success).toBe(true)
  })

  it('returns 200 (not 201) when idempotent existing dossier returned', async () => {
    createDossierMock.mockResolvedValueOnce({
      ok: true,
      dossier: { id: 'existing', status: 'draft' },
      status: 'existing',
    })
    const { POST } = await import('@/app/api/cee/dossiers/route')
    const res = (await POST(makePostRequest(makeValidBody()) as never)) as unknown as MockResult
    expect(res.status).toBe(200)
    expect((res.body as { meta: { created: boolean } }).meta.created).toBe(false)
  })

  it('returns 403 when createDossier returns PARTNER_NOT_ACTIVE', async () => {
    createDossierMock.mockResolvedValueOnce({
      ok: false,
      error: 'PARTNER_NOT_ACTIVE',
    })
    const { POST } = await import('@/app/api/cee/dossiers/route')
    const res = (await POST(makePostRequest(makeValidBody()) as never)) as unknown as MockResult
    expect(res.status).toBe(403)
  })

  it('returns 422 when createDossier returns RGE_EXPIRED', async () => {
    createDossierMock.mockResolvedValueOnce({
      ok: false,
      error: 'RGE_EXPIRED',
    })
    const { POST } = await import('@/app/api/cee/dossiers/route')
    const res = (await POST(makePostRequest(makeValidBody()) as never)) as unknown as MockResult
    expect(res.status).toBe(422)
  })

  it('returns 400 on invalid body (missing required fields)', async () => {
    const { POST } = await import('@/app/api/cee/dossiers/route')
    const res = (await POST(
      makePostRequest({ partner_id: 'only-this' }) as never
    )) as unknown as MockResult
    expect(res.status).toBe(400)
  })
})
