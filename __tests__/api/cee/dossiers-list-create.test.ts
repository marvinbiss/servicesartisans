/**
 * Tests — GET + POST /api/cee/dossiers
 *
 * Covers:
 *   - Auth obligatoire (401)
 *   - CSRF validateOrigin sur POST (403)
 *   - Rate-limit POST 10/min (429)
 *   - Partner résolu côté serveur par user_id (404 si absent)
 *   - Fail-closed CEE_PII_KEY absente (500)
 *   - Commune inconnue du référentiel (400)
 *   - Barème introuvable (422) / surface requise (400)
 *   - Création 201 avec PII chiffrées + snapshot serveur, idempotent 200
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
const maybeSingleZone = vi.fn()
const listDossiers = vi.fn()
const profileSingleMock = vi.fn(async () => ({
  data: { role: 'artisan', two_factor_enabled: false },
  error: null,
}))

const mockSupabase = {
  auth: {
    getUser: vi.fn(async () => ({
      data: { user: { id: 'user-1', email: 'a@b.fr' } },
      error: null,
    })),
  },
  from: vi.fn((table: string) => {
    if (table === 'profiles') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({ single: profileSingleMock })),
        })),
      }
    }
    if (table === 'cee_artisan_partners') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: maybeSinglePartner,
          })),
        })),
      }
    }
    if (table === 'zones_climatiques_ref') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: maybeSingleZone,
          })),
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

// createDossier mock (validation interne testée dans dossier-creation)
const createDossierMock = vi.fn()
vi.mock('@/lib/cee/dossier-creation', () => ({
  createDossier: (...args: unknown[]) =>
    (createDossierMock as (...a: unknown[]) => unknown)(...args),
  hashEmailForDossier: (_email: string) => 'h'.repeat(64),
  generateDossierReference: () => 'SAE-202606-001234',
}))

// Barème mock — snapshot serveur
const lookupForfaitMock = vi.fn()
vi.mock('@/lib/cee/bareme', () => ({
  lookupForfaitSnapshot: (...args: unknown[]) =>
    (lookupForfaitMock as (...a: unknown[]) => unknown)(...args),
}))

// PII crypto mock — pas de clé en environnement de test
const isConfiguredMock = vi.fn(() => true)
vi.mock('@/lib/cee/pii-crypto', () => ({
  isPiiCryptoConfigured: () => isConfiguredMock(),
  encryptPiiToB64: (v: string) => Buffer.from(`enc:${v}`).toString('base64'),
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
    operation_code: 'BAR-TH-171',
    client: {
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'Jean@Example.com',
      telephone: '06 12 34 56 78',
      adresse: '12 rue de la Paix',
      code_postal: '75011',
      commune_insee: '75056',
    },
    foyer_personnes: 2,
    revenus_categorie: 'modeste',
    type_travaux: 'Pompe à chaleur air/eau — etas=130, cop=4.2',
    surface_m2: 100,
    annee_construction: 1985,
    energie_remplacee: 'fioul',
    montant_ht_eur: 8500,
    montant_ttc_eur: 8967.5,
    date_devis: '2026-06-01',
    date_chantier_prevue: null,
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
  profileSingleMock.mockResolvedValue({
    data: { role: 'artisan', two_factor_enabled: false },
    error: null,
  })
  maybeSinglePartner.mockResolvedValue({
    data: { id: 'partner-1', provider_id: 'provider-1', commission_rate_effective: 12.5 },
    error: null,
  })
  maybeSingleZone.mockResolvedValue({
    data: { code_insee: '75056', zone: 'H1' },
    error: null,
  })
  lookupForfaitMock.mockResolvedValue({
    ok: true,
    snapshot: { forfait_id: 42, forfait_version: '2026-01-01:96000', prime_cee_cts: 96000 },
  })
  isConfiguredMock.mockReturnValue(true)
  listDossiers.mockResolvedValue({ data: [], error: null })
  createDossierMock.mockResolvedValue({
    ok: true,
    dossier: { id: 'dossier-1', status: 'draft', reference: 'SAE-202606-001234' },
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
        { id: 'd-1', reference: 'SAE-202606-000001', status: 'draft' },
        { id: 'd-2', reference: 'SAE-202606-000002', status: 'submitted_by_artisan' },
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

  it('returns 400 on invalid body (missing required fields)', async () => {
    const { POST } = await import('@/app/api/cee/dossiers/route')
    const res = (await POST(
      makePostRequest({ operation_code: 'BAR-TH-171' }) as never
    )) as unknown as MockResult
    expect(res.status).toBe(400)
  })

  it('returns 400 when TTC < HT', async () => {
    const body = makeValidBody()
    body.montant_ttc_eur = 100
    const { POST } = await import('@/app/api/cee/dossiers/route')
    const res = (await POST(makePostRequest(body) as never)) as unknown as MockResult
    expect(res.status).toBe(400)
  })

  it('returns 500 fail-closed when CEE_PII_KEY is not configured', async () => {
    isConfiguredMock.mockReturnValue(false)
    const { POST } = await import('@/app/api/cee/dossiers/route')
    const res = (await POST(makePostRequest(makeValidBody()) as never)) as unknown as MockResult
    expect(res.status).toBe(500)
    expect(createDossierMock).not.toHaveBeenCalled()
  })

  it('returns 404 when no partner exists for the authenticated user', async () => {
    maybeSinglePartner.mockResolvedValueOnce({ data: null, error: null })
    const { POST } = await import('@/app/api/cee/dossiers/route')
    const res = (await POST(makePostRequest(makeValidBody()) as never)) as unknown as MockResult
    expect(res.status).toBe(404)
    expect((res.body as { error: { code: string } }).error.code).toBe('PARTNER_NOT_FOUND')
  })

  it('returns 400 COMMUNE_INCONNUE when commune is not in referential', async () => {
    maybeSingleZone.mockResolvedValueOnce({ data: null, error: null })
    const { POST } = await import('@/app/api/cee/dossiers/route')
    const res = (await POST(makePostRequest(makeValidBody()) as never)) as unknown as MockResult
    expect(res.status).toBe(400)
  })

  it('returns 422 BAREME_NOT_FOUND when no forfait in force', async () => {
    lookupForfaitMock.mockResolvedValueOnce({ ok: false, error: 'BAREME_NOT_FOUND' })
    const { POST } = await import('@/app/api/cee/dossiers/route')
    const res = (await POST(makePostRequest(makeValidBody()) as never)) as unknown as MockResult
    expect(res.status).toBe(422)
  })

  it('returns 400 SURFACE_REQUIRED for per-m² operation without surface', async () => {
    lookupForfaitMock.mockResolvedValueOnce({ ok: false, error: 'SURFACE_REQUIRED' })
    const { POST } = await import('@/app/api/cee/dossiers/route')
    const res = (await POST(makePostRequest(makeValidBody()) as never)) as unknown as MockResult
    expect(res.status).toBe(400)
  })

  it('returns 201 and builds CreateDossierInput entirely server-side', async () => {
    const { POST } = await import('@/app/api/cee/dossiers/route')
    const res = (await POST(makePostRequest(makeValidBody()) as never)) as unknown as MockResult
    expect(res.status).toBe(201)
    expect((res.body as { success: boolean }).success).toBe(true)

    const input = createDossierMock.mock.calls[0][1] as Record<string, unknown>
    // Attribution serveur — jamais depuis le payload
    expect(input.partner_id).toBe('partner-1')
    expect(input.provider_id).toBe('provider-1')
    expect(input.commission_rate).toBe(12.5)
    // Snapshot barème serveur
    expect(input.forfait_id).toBe(42)
    expect(input.prime_cee_cts).toBe(96000)
    // PII chiffrées (mock enc:) — jamais le plaintext
    expect(Buffer.from(input.client_nom_b64 as string, 'base64').toString()).toBe('enc:Dupont')
    expect(input.client_email_hash).toHaveLength(64)
    // Email normalisé lowercase par le schéma
    expect(Buffer.from(input.client_email_b64 as string, 'base64').toString()).toBe(
      'enc:jean@example.com'
    )
    // Téléphone normalisé (espaces retirés)
    expect(Buffer.from(input.client_telephone_b64 as string, 'base64').toString()).toBe(
      'enc:0612345678'
    )
    // Montants convertis en centimes
    expect(input.montant_ht_cts).toBe(850000)
    expect(input.montant_ttc_cts).toBe(896750)
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
})
