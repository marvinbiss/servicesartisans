/**
 * Tests — CEE Estimate API (/api/cee/estimate)
 *
 * Couvre :
 *   - 200 avec eligible (items projetés, champs privés absents)
 *   - 200 avec non-eligible (items vides, zone climatique exposée)
 *   - validation zod (body invalide, slug non conforme, CP invalide)
 *   - fail-open : toute erreur lib → 200 non éligible
 *   - zéro fuite : delegataires, justificatifs_requis, forfaits_table,
 *     rge_qualifications_requises, assumptions, public_cible, domaine
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { EnrichedCeeQualification } from '@/lib/cee/enrich'

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

const mockEnrich = vi.fn()
vi.mock('@/lib/cee/enrich', () => ({
  enrichCeeQualification: (...args: unknown[]) => mockEnrich(...args),
}))

// ============================================
// Helpers
// ============================================

type MockResult = {
  body: Record<string, unknown>
  status: number
  headers: Record<string, string>
}

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/cee/estimate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    serviceSlug: 'chauffagiste',
    postalCode: '75011',
    ...overrides,
  }
}

/** Enrichissement "riche" contenant tous les champs privés à filtrer. */
const richEnriched: EnrichedCeeQualification = {
  eligible: true,
  codes: ['BAR-TH-104'],
  zone_climatique: 'H1',
  items: [
    {
      code: 'BAR-TH-104',
      nom: 'Pompe à chaleur air/eau',
      domaine: 'BAR',
      sous_domaine: 'TH',
      rge_qualifications_requises: ['QualiPAC'],
      non_cumulable_avec: ['BAR-TH-171'],
      public_cible: 'residentiel',
      forfait_base_kwhc: null,
      forfaits_table: { rows: [{ zone: 'H1', montant: 85000 }] },
      justificatifs_requis: [
        {
          code: 'FACT',
          label: 'Facture signée',
          source: 'artisan',
          obligatoire: true,
        },
      ],
      prime_estimate: {
        kwhc_min: 85000,
        kwhc_max: 125000,
        euros_classique_min: 765,
        euros_classique_max: 1125,
        euros_precarite_min: 1360,
        euros_precarite_max: 2000,
        zone: 'H1',
        assumptions: 'Bornes sur forfaits zone H1.',
      },
      delegataires: [
        {
          id: 'deleg-secret-id',
          slug: 'deleg-secret',
          nom_commercial: 'Délégataire Secret SAS',
          raison_sociale: 'Délégataire Secret',
          type: 'delegated',
          vague_priorite: 1,
          statut: 'partenaire',
          url_site: null,
          url_api_docs: null,
          operations_supportees: ['BAR-TH-104'],
          secteurs_couverts: ['residentiel'],
          coup_de_pouce_signataire: false,
          is_p6: true,
        },
      ],
    },
  ],
}

const nonEligible: EnrichedCeeQualification = {
  eligible: false,
  codes: [],
  zone_climatique: 'H2',
  items: [],
}

// ============================================
// Setup
// ============================================

beforeEach(() => {
  vi.clearAllMocks()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
})

// ============================================
// Tests
// ============================================

describe('POST /api/cee/estimate — validation zod', () => {
  it('returns 400 when body is not JSON', async () => {
    const { POST } = await import('@/app/api/cee/estimate/route')
    const req = new Request('http://localhost/api/cee/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    })
    const res = (await POST(req as never)) as unknown as MockResult
    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({
      success: false,
      error: { code: 'invalid_json' },
    })
    expect(mockEnrich).not.toHaveBeenCalled()
  })

  it('returns 400 when serviceSlug is missing', async () => {
    const { POST } = await import('@/app/api/cee/estimate/route')
    const res = (await POST(makeRequest({ postalCode: '75011' }) as never)) as unknown as MockResult
    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ error: { code: 'invalid_body' } })
    expect(mockEnrich).not.toHaveBeenCalled()
  })

  it('returns 400 when serviceSlug contains invalid chars', async () => {
    const { POST } = await import('@/app/api/cee/estimate/route')
    const res = (await POST(
      makeRequest({ serviceSlug: 'Chauffagiste!' }) as never
    )) as unknown as MockResult
    expect(res.status).toBe(400)
  })

  it('returns 400 when postalCode is not 5 digits', async () => {
    const { POST } = await import('@/app/api/cee/estimate/route')
    const res = (await POST(
      makeRequest({ serviceSlug: 'chauffagiste', postalCode: '75' }) as never
    )) as unknown as MockResult
    expect(res.status).toBe(400)
  })

  it('rejects additional keys (strict schema)', async () => {
    const { POST } = await import('@/app/api/cee/estimate/route')
    const res = (await POST(
      makeRequest({
        serviceSlug: 'chauffagiste',
        postalCode: '75011',
        email: 'leak@example.com',
      }) as never
    )) as unknown as MockResult
    expect(res.status).toBe(400)
    expect(mockEnrich).not.toHaveBeenCalled()
  })

  it('accepts body without postalCode (optional)', async () => {
    mockEnrich.mockResolvedValueOnce(nonEligible)
    const { POST } = await import('@/app/api/cee/estimate/route')
    const res = (await POST(
      makeRequest({ serviceSlug: 'chauffagiste' }) as never
    )) as unknown as MockResult
    expect(res.status).toBe(200)
    expect(mockEnrich).toHaveBeenCalledWith(mockAdminSupabase, {
      serviceSlug: 'chauffagiste',
      postalCode: null,
    })
  })
})

describe('POST /api/cee/estimate — eligible', () => {
  it('returns 200 with projected items (only safe fields)', async () => {
    mockEnrich.mockResolvedValueOnce(richEnriched)
    const { POST } = await import('@/app/api/cee/estimate/route')
    const res = (await POST(makeRequest(validBody()) as never)) as unknown as MockResult

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      eligible: true,
      codes: ['BAR-TH-104'],
      zone_climatique: 'H1',
    })
    const items = (res.body as { items: unknown[] }).items
    expect(items).toHaveLength(1)
    const item = items[0] as Record<string, unknown>
    expect(item).toEqual({
      code: 'BAR-TH-104',
      nom: 'Pompe à chaleur air/eau',
      prime_estimate: {
        euros_classique_min: 765,
        euros_classique_max: 1125,
        euros_precarite_min: 1360,
        euros_precarite_max: 2000,
      },
    })
  })

  it('never leaks delegataires, justificatifs, forfaits_table, assumptions, etc.', async () => {
    mockEnrich.mockResolvedValueOnce(richEnriched)
    const { POST } = await import('@/app/api/cee/estimate/route')
    const res = (await POST(makeRequest(validBody()) as never)) as unknown as MockResult

    const serialized = JSON.stringify(res.body)
    // Champs sensibles — aucune fuite textuelle tolérée
    expect(serialized).not.toContain('delegataires')
    expect(serialized).not.toContain('deleg-secret-id')
    expect(serialized).not.toContain('Délégataire Secret')
    expect(serialized).not.toContain('justificatifs_requis')
    expect(serialized).not.toContain('Facture signée')
    expect(serialized).not.toContain('forfaits_table')
    expect(serialized).not.toContain('forfait_base_kwhc')
    expect(serialized).not.toContain('rge_qualifications_requises')
    expect(serialized).not.toContain('QualiPAC')
    expect(serialized).not.toContain('non_cumulable_avec')
    expect(serialized).not.toContain('public_cible')
    expect(serialized).not.toContain('assumptions')
    expect(serialized).not.toContain('domaine')
    expect(serialized).not.toContain('sous_domaine')
    // kWhc détails : pas non plus
    expect(serialized).not.toContain('kwhc_min')
    expect(serialized).not.toContain('kwhc_max')
  })
})

describe('POST /api/cee/estimate — non-eligible', () => {
  it('returns 200 with eligible:false and empty items', async () => {
    mockEnrich.mockResolvedValueOnce(nonEligible)
    const { POST } = await import('@/app/api/cee/estimate/route')
    const res = (await POST(makeRequest(validBody()) as never)) as unknown as MockResult

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      eligible: false,
      codes: [],
      zone_climatique: 'H2',
      items: [],
    })
  })
})

describe('POST /api/cee/estimate — fail-open', () => {
  it('returns 200 non-eligible when enrich throws', async () => {
    mockEnrich.mockRejectedValueOnce(new Error('db down'))
    const { POST } = await import('@/app/api/cee/estimate/route')
    const res = (await POST(makeRequest(validBody()) as never)) as unknown as MockResult

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      eligible: false,
      items: [],
    })
  })
})
