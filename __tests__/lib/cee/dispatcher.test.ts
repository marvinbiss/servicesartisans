/* eslint-disable @typescript-eslint/no-non-null-assertion */
/**
 * Tests unitaires — src/lib/cee/dispatcher.ts
 * --------------------------------------------
 * Stratégie : on isole la logique d'orchestration en mockant les modules
 * amont (`enrich`, `rge-filter`, `dossiers`). Ces modules sont testés
 * individuellement dans leurs propres fichiers (qualify.test / enrich.test /
 * rge-filter.test), pas besoin de refaire ici des mocks Supabase fins.
 *
 * Le seul mock chainable thenable restant sert au check d'idempotence qui,
 * lui, lit directement Supabase depuis le dispatcher.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks modules amont
// ---------------------------------------------------------------------------

vi.mock('@/lib/cee/enrich', () => ({
  enrichCeeQualification: vi.fn(),
}))

vi.mock('@/lib/cee/rge-filter', () => ({
  filterProvidersByCeeRge: vi.fn(),
}))

vi.mock('@/lib/cee/dossiers', () => ({
  createCeeDossier: vi.fn(),
}))

import { dispatchDevis } from '@/lib/cee/dispatcher'
import { enrichCeeQualification } from '@/lib/cee/enrich'
import { filterProvidersByCeeRge } from '@/lib/cee/rge-filter'
import { createCeeDossier } from '@/lib/cee/dossiers'
import type { EnrichedCeeItem, EnrichedCeeQualification } from '@/lib/cee/enrich'
import type { FilterProvidersByCeeRgeResult, RgeCoverageCheck } from '@/lib/cee/rge-filter'
import type { CeeDossier } from '@/lib/cee/dossier-types'

const mockedEnrich = vi.mocked(enrichCeeQualification)
const mockedFilter = vi.mocked(filterProvidersByCeeRge)
const mockedCreate = vi.mocked(createCeeDossier)

// ---------------------------------------------------------------------------
// Supabase mock — utilisé uniquement pour le check d'idempotence dispatcher.
// On contrôle précisément ce que `.maybeSingle()` retourne pour la query
// `cee_dossiers`.
// ---------------------------------------------------------------------------

interface IdempotenceResponse {
  data: unknown
  error: { message: string } | null
}

function createSupabaseMock(idempotenceResponses: IdempotenceResponse[]) {
  let idx = 0
  // Capture des appels (col, val) pour asserter l'ordre des paramètres et
  // détecter une inversion accidentelle (mock-théâtre).
  const captured: Array<{ method: string; args: unknown[] }> = []
  const client = {
    from: vi.fn((table: string) => {
      captured.push({ method: 'from', args: [table] })
      const chain: Record<string, unknown> = {}
      const methods = ['select', 'eq', 'contains', 'in', 'order', 'limit']
      for (const m of methods) {
        chain[m] = vi.fn((...args: unknown[]) => {
          captured.push({ method: m, args })
          return chain
        })
      }
      chain.maybeSingle = vi.fn(() => {
        const res = idempotenceResponses[idx] ?? { data: null, error: null }
        idx++
        return Promise.resolve(res)
      })
      return chain
    }),
  }
  ;(client as unknown as { __captured: typeof captured }).__captured = captured
  return client as unknown as Parameters<typeof dispatchDevis>[0]
}

function getCaptured(supabase: Parameters<typeof dispatchDevis>[0]) {
  return (supabase as unknown as { __captured: Array<{ method: string; args: unknown[] }> })
    .__captured
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function mkItem(overrides: Partial<EnrichedCeeItem> = {}): EnrichedCeeItem {
  return {
    code: 'BAR-TH-179',
    nom: 'Pompe à chaleur',
    domaine: 'Bâtiment',
    sous_domaine: 'Chauffage',
    rge_qualifications_requises: [],
    non_cumulable_avec: [],
    public_cible: 'tous',
    forfait_base_kwhc: null,
    forfaits_table: null,
    justificatifs_requis: [
      { code: 'attestation', label: 'AH', source: 'socle', obligatoire: true },
    ],
    prime_estimate: {
      kwhc_min: 100000,
      kwhc_max: 168000,
      euros_classique_min: 900,
      euros_classique_max: 1512,
      euros_precarite_min: 1600,
      euros_precarite_max: 2688,
      zone: 'H1',
      assumptions: 'test',
    },
    delegataires: [],
    ...overrides,
  }
}

function mkEnriched(items: EnrichedCeeItem[]): EnrichedCeeQualification {
  return {
    eligible: items.length > 0,
    codes: items.map((i) => i.code),
    zone_climatique: 'H1',
    items,
  }
}

function mkCoverage(foundCount: number): RgeCoverageCheck {
  return {
    hasCoverage: true,
    requiredCodes: Array.from({ length: foundCount }, (_, i) => `REQ_${i}`),
    foundCodes: Array.from({ length: foundCount }, (_, i) => `FOUND_${i}`),
    missingCodes: [],
    siret: '12345678900010',
  }
}

function mkFilterResult(
  eligibleIds: Array<[string, number]> = [],
  blocking: string[] = []
): FilterProvidersByCeeRgeResult {
  return {
    eligible: eligibleIds.map(([providerId, count]) => ({
      providerId,
      coverage: mkCoverage(count),
    })),
    ineligible: [],
    blockingAuditRequired: blocking,
  }
}

function mkDossier(id: string): CeeDossier {
  return {
    id,
    devis_id: 'devis-1',
    client_id: 'client-1',
    provider_id: 'provider-A',
    delegataire_id: null,
    operation_code: 'BAR-TH-179',
    status: 'brouillon',
    date_engagement: null,
    date_pre_visite: null,
    date_debut_travaux: null,
    date_fin_travaux: null,
    date_ah_signature: null,
    date_depot_delegataire: null,
    date_depot_pncee: null,
    date_validation: null,
    zone_climatique: 'H1',
    postal_code: '75001',
    kwhc_estime: 168000,
    kwhc_depose: null,
    prime_estimee_eur: 1512,
    prime_versee_eur: null,
    precarite: false,
    justificatifs: [],
    rejection_reason: null,
    notes: null,
    metadata: {},
    created_at: '2026-04-11T00:00:00Z',
    updated_at: '2026-04-11T00:00:00Z',
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

const BASE_INPUT = {
  devisId: 'devis-1',
  clientId: 'client-1',
  serviceSlug: 'chauffagiste',
  postalCode: '75001',
}

describe('dispatchDevis — fallbacks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('no_candidate_provider : candidateProviderIds vide → fallback immédiat, aucun appel amont', async () => {
    const supabase = createSupabaseMock([])
    const outcome = await dispatchDevis(supabase, {
      ...BASE_INPUT,
      candidateProviderIds: [],
    })

    expect(outcome.kind).toBe('fallback_non_cee')
    if (outcome.kind === 'fallback_non_cee') {
      expect(outcome.reason).toBe('no_candidate_provider')
      expect(outcome.providerId).toBeNull()
    }
    expect(mockedEnrich).not.toHaveBeenCalled()
    expect(mockedFilter).not.toHaveBeenCalled()
    expect(mockedCreate).not.toHaveBeenCalled()
  })

  it('not_eligible : enrich retourne eligible=false → fallback avec premier candidat', async () => {
    mockedEnrich.mockResolvedValue({
      eligible: false,
      codes: [],
      zone_climatique: 'H1',
      items: [],
    })
    const supabase = createSupabaseMock([])
    const outcome = await dispatchDevis(supabase, {
      ...BASE_INPUT,
      candidateProviderIds: ['prov-A', 'prov-B'],
    })

    expect(outcome.kind).toBe('fallback_non_cee')
    if (outcome.kind === 'fallback_non_cee') {
      expect(outcome.reason).toBe('not_eligible')
      expect(outcome.providerId).toBe('prov-A')
    }
    expect(mockedFilter).not.toHaveBeenCalled()
    expect(mockedCreate).not.toHaveBeenCalled()
  })

  it('audit_blocking : blockingAuditRequired rempli → fallback avec blockingAuditRequired transmis', async () => {
    mockedEnrich.mockResolvedValue(mkEnriched([mkItem()]))
    mockedFilter.mockResolvedValue(mkFilterResult([], ['BAR-TH-XXX']))
    const supabase = createSupabaseMock([])

    const outcome = await dispatchDevis(supabase, {
      ...BASE_INPUT,
      candidateProviderIds: ['prov-A'],
    })

    expect(outcome.kind).toBe('fallback_non_cee')
    if (outcome.kind === 'fallback_non_cee') {
      expect(outcome.reason).toBe('audit_blocking')
      expect(outcome.providerId).toBe('prov-A')
      expect(outcome.blockingAuditRequired).toEqual(['BAR-TH-XXX'])
    }
    expect(mockedCreate).not.toHaveBeenCalled()
  })

  it('no_rge_provider : filter retourne eligible=[] sans blocking → fallback', async () => {
    mockedEnrich.mockResolvedValue(mkEnriched([mkItem()]))
    mockedFilter.mockResolvedValue(mkFilterResult([], []))
    const supabase = createSupabaseMock([])

    const outcome = await dispatchDevis(supabase, {
      ...BASE_INPUT,
      candidateProviderIds: ['prov-A'],
    })

    expect(outcome.kind).toBe('fallback_non_cee')
    if (outcome.kind === 'fallback_non_cee') {
      expect(outcome.reason).toBe('no_rge_provider')
      expect(outcome.providerId).toBe('prov-A')
    }
    expect(mockedCreate).not.toHaveBeenCalled()
  })
})

describe('dispatchDevis — cee_routed happy path', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('crée le dossier et retourne cee_routed avec tous les champs', async () => {
    const item = mkItem({
      delegataires: [
        {
          id: 'deleg-1',
          slug: 'effy',
          nom_commercial: 'Effy',
          raison_sociale: 'Effy SAS',
          type: 'mandataire',
          vague_priorite: 1,
          statut: 'partenaire',
          url_site: null,
          url_api_docs: null,
          operations_supportees: ['BAR-TH-179'],
          secteurs_couverts: ['residentiel'],
          coup_de_pouce_signataire: true,
          is_p6: true,
        },
      ],
    })

    mockedEnrich.mockResolvedValue(mkEnriched([item]))
    mockedFilter.mockResolvedValue(mkFilterResult([['prov-A', 1]]))
    mockedCreate.mockResolvedValue(mkDossier('dossier-1'))

    const supabase = createSupabaseMock([{ data: null, error: null }])
    const outcome = await dispatchDevis(supabase, {
      ...BASE_INPUT,
      candidateProviderIds: ['prov-A'],
    })

    expect(outcome.kind).toBe('cee_routed')
    if (outcome.kind === 'cee_routed') {
      expect(outcome.operationCode).toBe('BAR-TH-179')
      expect(outcome.providerId).toBe('prov-A')
      expect(outcome.delegataireId).toBe('deleg-1')
      expect(outcome.dossierId).toBe('dossier-1')
      expect(outcome.primeEstimate).not.toBeNull()
      expect(outcome.primeEstimate!.kwhc_max).toBe(168000)
      expect(outcome.primeEstimate!.euros_classique_max).toBe(1512)
      expect(outcome.primeEstimate!.zone).toBe('H1')
      expect(outcome.justificatifsRequis).toEqual([
        { code: 'attestation', label: 'AH', obligatoire: true },
      ])
    }

    expect(mockedCreate).toHaveBeenCalledTimes(1)
    expect(mockedCreate).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({
        provider_id: 'prov-A',
        operation_code: 'BAR-TH-179',
        devis_id: 'devis-1',
        client_id: 'client-1',
        delegataire_id: 'deleg-1',
        zone_climatique: 'H1',
        postal_code: '75001',
        kwhc_estime: 168000,
        prime_estimee_eur: 1512,
      }),
      expect.objectContaining({ type: 'client', id: 'client-1' })
    )

    // Mock-théâtre : le lookup idempotence DOIT appeler `.eq('devis_id', ...)`
    // et `.eq('status', 'brouillon')` — pas l'inverse.
    const captured = getCaptured(supabase)
    const eqCalls = captured.filter((c) => c.method === 'eq')
    expect(eqCalls).toContainEqual({ method: 'eq', args: ['devis_id', 'devis-1'] })
    expect(eqCalls).toContainEqual({ method: 'eq', args: ['status', 'brouillon'] })
  })

  it("delegataireId null si aucun délégataire ne tagge l'opération", async () => {
    mockedEnrich.mockResolvedValue(mkEnriched([mkItem({ delegataires: [] })]))
    mockedFilter.mockResolvedValue(mkFilterResult([['prov-A', 1]]))
    mockedCreate.mockResolvedValue(mkDossier('dossier-2'))
    const supabase = createSupabaseMock([{ data: null, error: null }])

    const outcome = await dispatchDevis(supabase, {
      ...BASE_INPUT,
      candidateProviderIds: ['prov-A'],
    })

    expect(outcome.kind).toBe('cee_routed')
    if (outcome.kind === 'cee_routed') {
      expect(outcome.delegataireId).toBeNull()
    }
  })
})

describe('dispatchDevis — sélection provider (couverture RGE max)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('choisit le provider avec foundCodes.length maximum', async () => {
    mockedEnrich.mockResolvedValue(mkEnriched([mkItem()]))
    // prov-A couvre 1 qualif, prov-B en couvre 3, prov-C en couvre 2
    mockedFilter.mockResolvedValue(
      mkFilterResult([
        ['prov-A', 1],
        ['prov-B', 3],
        ['prov-C', 2],
      ])
    )
    mockedCreate.mockResolvedValue(mkDossier('dossier-3'))
    const supabase = createSupabaseMock([{ data: null, error: null }])

    const outcome = await dispatchDevis(supabase, {
      ...BASE_INPUT,
      candidateProviderIds: ['prov-A', 'prov-B', 'prov-C'],
    })

    expect(outcome.kind).toBe('cee_routed')
    if (outcome.kind === 'cee_routed') {
      expect(outcome.providerId).toBe('prov-B')
    }
  })
})

describe('dispatchDevis — sélection opération (rentabilité max)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("prend l'item avec euros_classique_max le plus élevé", async () => {
    const low = mkItem({
      code: 'BAR-TH-LOW',
      prime_estimate: {
        kwhc_min: 10000,
        kwhc_max: 20000,
        euros_classique_min: 90,
        euros_classique_max: 180,
        euros_precarite_min: 160,
        euros_precarite_max: 320,
        zone: 'H1',
        assumptions: 't',
      },
    })
    const high = mkItem({
      code: 'BAR-TH-HIGH',
      prime_estimate: {
        kwhc_min: 100000,
        kwhc_max: 200000,
        euros_classique_min: 900,
        euros_classique_max: 1800,
        euros_precarite_min: 1600,
        euros_precarite_max: 3200,
        zone: 'H1',
        assumptions: 't',
      },
    })

    mockedEnrich.mockResolvedValue(mkEnriched([low, high]))
    mockedFilter.mockResolvedValue(mkFilterResult([['prov-A', 1]]))
    mockedCreate.mockResolvedValue(mkDossier('dossier-4'))
    const supabase = createSupabaseMock([{ data: null, error: null }])

    const outcome = await dispatchDevis(supabase, {
      ...BASE_INPUT,
      candidateProviderIds: ['prov-A'],
    })

    expect(outcome.kind).toBe('cee_routed')
    if (outcome.kind === 'cee_routed') {
      expect(outcome.operationCode).toBe('BAR-TH-HIGH')
      expect(outcome.primeEstimate).not.toBeNull()
      expect(outcome.primeEstimate!.euros_classique_max).toBe(1800)
    }
  })
})

describe('dispatchDevis — idempotence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retourne le dossier brouillon existant avec prime/justif du code FOS stocké', async () => {
    // Deux items distincts : si le code d'existing matche le SECOND item,
    // on doit retourner la prime du SECOND (pas du premier sélectionné par
    // pickBestItem, qui serait ici le plus rentable = BAR-TH-HIGH).
    const low = mkItem({
      code: 'BAR-TH-LOW',
      justificatifs_requis: [
        { code: 'jlow', label: 'Just LOW', source: 'socle', obligatoire: true },
      ],
      prime_estimate: {
        kwhc_min: 1000,
        kwhc_max: 2000,
        euros_classique_min: 9,
        euros_classique_max: 18,
        euros_precarite_min: 16,
        euros_precarite_max: 32,
        zone: 'H1',
        assumptions: 't',
      },
    })
    const high = mkItem({
      code: 'BAR-TH-HIGH',
      justificatifs_requis: [
        { code: 'jhigh', label: 'Just HIGH', source: 'socle', obligatoire: true },
      ],
      prime_estimate: {
        kwhc_min: 100000,
        kwhc_max: 200000,
        euros_classique_min: 900,
        euros_classique_max: 1800,
        euros_precarite_min: 1600,
        euros_precarite_max: 3200,
        zone: 'H1',
        assumptions: 't',
      },
    })

    mockedEnrich.mockResolvedValue(mkEnriched([low, high]))
    // Le provider 'prov-OLD' du dossier existant doit être encore RGE pour
    // que l'idempotence reste valide (fix Bug #7 revalidation RGE).
    mockedFilter.mockResolvedValue(
      mkFilterResult([
        ['prov-A', 1],
        ['prov-OLD', 1],
      ])
    )
    mockedCreate.mockResolvedValue(mkDossier('should-not-be-used'))

    // Le dossier existant référence BAR-TH-LOW, pas le "bestItem" (HIGH).
    const existing = {
      id: 'existing-dossier-id',
      operation_code: 'BAR-TH-LOW',
      provider_id: 'prov-OLD',
      delegataire_id: 'deleg-OLD',
    }
    const supabase = createSupabaseMock([{ data: existing, error: null }])

    const outcome = await dispatchDevis(supabase, {
      ...BASE_INPUT,
      candidateProviderIds: ['prov-A'],
    })

    expect(outcome.kind).toBe('cee_routed')
    if (outcome.kind === 'cee_routed') {
      expect(outcome.dossierId).toBe('existing-dossier-id')
      expect(outcome.operationCode).toBe('BAR-TH-LOW')
      expect(outcome.providerId).toBe('prov-OLD')
      expect(outcome.delegataireId).toBe('deleg-OLD')
      // La prime doit provenir de BAR-TH-LOW, PAS de BAR-TH-HIGH
      expect(outcome.primeEstimate).not.toBeNull()
      expect(outcome.primeEstimate!.euros_classique_max).toBe(18)
      expect(outcome.primeEstimate!.kwhc_max).toBe(2000)
      // Les justificatifs doivent aussi provenir de BAR-TH-LOW
      expect(outcome.justificatifsRequis).toEqual([
        { code: 'jlow', label: 'Just LOW', obligatoire: true },
      ])
    }
    expect(mockedCreate).not.toHaveBeenCalled()

    // Mock-théâtre : on vérifie explicitement que l'idempotence filtre
    // par (devis_id, status) dans le BON ordre de paramètres.
    const captured = getCaptured(supabase)
    const eqCalls = captured.filter((c) => c.method === 'eq')
    expect(eqCalls).toContainEqual({ method: 'eq', args: ['devis_id', 'devis-1'] })
    expect(eqCalls).toContainEqual({ method: 'eq', args: ['status', 'brouillon'] })
  })

  it('code FOS stale (plus dans enriched.items) → prime=null, justifs=[], warn loggé', async () => {
    mockedEnrich.mockResolvedValue(mkEnriched([mkItem()])) // seul BAR-TH-179
    // prov-OLD encore RGE — sinon Bug #7 déclencherait fallback avant stale check.
    mockedFilter.mockResolvedValue(
      mkFilterResult([
        ['prov-A', 1],
        ['prov-OLD', 1],
      ])
    )
    mockedCreate.mockResolvedValue(mkDossier('should-not-be-used'))

    const existing = {
      id: 'existing-dossier-id',
      operation_code: 'BAR-TH-STALE',
      provider_id: 'prov-OLD',
      delegataire_id: null,
    }
    const supabase = createSupabaseMock([{ data: existing, error: null }])

    const outcome = await dispatchDevis(supabase, {
      ...BASE_INPUT,
      candidateProviderIds: ['prov-A'],
    })

    expect(outcome.kind).toBe('cee_routed')
    if (outcome.kind === 'cee_routed') {
      expect(outcome.operationCode).toBe('BAR-TH-STALE')
      expect(outcome.primeEstimate).toBeNull()
      expect(outcome.justificatifsRequis).toEqual([])
    }
    expect(mockedCreate).not.toHaveBeenCalled()
  })

  it('provider idempotent a perdu son RGE → fallback_non_cee, pas de dispatch CEE (Bug #7)', async () => {
    mockedEnrich.mockResolvedValue(mkEnriched([mkItem()]))
    // prov-OLD est ABSENT de la liste eligible — il a perdu son RGE entre
    // la création du brouillon et le re-dispatch.
    mockedFilter.mockResolvedValue(mkFilterResult([['prov-A', 1]]))
    mockedCreate.mockResolvedValue(mkDossier('should-not-be-used'))

    const existing = {
      id: 'existing-dossier-id',
      operation_code: 'BAR-TH-179',
      provider_id: 'prov-OLD',
      delegataire_id: null,
    }
    const supabase = createSupabaseMock([{ data: existing, error: null }])

    const outcome = await dispatchDevis(supabase, {
      ...BASE_INPUT,
      candidateProviderIds: ['prov-A', 'prov-OLD'],
    })

    expect(outcome.kind).toBe('fallback_non_cee')
    if (outcome.kind === 'fallback_non_cee') {
      expect(outcome.reason).toBe('no_rge_provider')
      expect(outcome.providerId).toBe('prov-OLD')
    }
    expect(mockedCreate).not.toHaveBeenCalled()
  })

  it('idempotence : .eq(devis_id, ...) et .eq(status, brouillon) sont bien appelés', async () => {
    // Fix faux positif : on vérifie que la query d'idempotence filtre
    // correctement par devis_id ET status, pas juste qu'elle est déclenchée.
    mockedEnrich.mockResolvedValue(mkEnriched([mkItem()]))
    mockedFilter.mockResolvedValue(mkFilterResult([['prov-A', 1]]))
    mockedCreate.mockResolvedValue(mkDossier('dossier-new'))

    const eqCalls: Array<[string, unknown]> = []
    const chain: Record<string, unknown> = {}
    const methods = ['select', 'contains', 'in', 'order', 'limit']
    for (const m of methods) chain[m] = vi.fn(() => chain)
    chain.eq = vi.fn((col: string, val: unknown) => {
      eqCalls.push([col, val])
      return chain
    })
    chain.maybeSingle = vi.fn(() => Promise.resolve({ data: null, error: null }))
    const supabase = {
      from: vi.fn(() => chain),
    } as unknown as Parameters<typeof dispatchDevis>[0]

    await dispatchDevis(supabase, {
      ...BASE_INPUT,
      devisId: 'devis-42',
      candidateProviderIds: ['prov-A'],
    })

    expect(eqCalls).toContainEqual(['devis_id', 'devis-42'])
    expect(eqCalls).toContainEqual(['status', 'brouillon'])
  })
})

describe('dispatchDevis — actor createCeeDossier', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('passe actor {type:client, id:clientId} quand clientId fourni', async () => {
    mockedEnrich.mockResolvedValue(mkEnriched([mkItem()]))
    mockedFilter.mockResolvedValue(mkFilterResult([['prov-A', 1]]))
    mockedCreate.mockResolvedValue(mkDossier('d1'))
    const supabase = createSupabaseMock([{ data: null, error: null }])

    await dispatchDevis(supabase, {
      ...BASE_INPUT,
      clientId: 'client-42',
      candidateProviderIds: ['prov-A'],
    })

    expect(mockedCreate).toHaveBeenCalledTimes(1)
    const call = mockedCreate.mock.calls[0]
    // createCeeDossier(supabase, input, actor)
    expect(call[2]).toEqual({ type: 'client', id: 'client-42' })
  })

  it('passe actor {type:system, id:null} quand clientId=null (soumission anonyme)', async () => {
    mockedEnrich.mockResolvedValue(mkEnriched([mkItem()]))
    mockedFilter.mockResolvedValue(mkFilterResult([['prov-A', 1]]))
    mockedCreate.mockResolvedValue(mkDossier('d2'))
    const supabase = createSupabaseMock([{ data: null, error: null }])

    await dispatchDevis(supabase, {
      ...BASE_INPUT,
      clientId: null,
      candidateProviderIds: ['prov-A'],
    })

    const call = mockedCreate.mock.calls[0]
    expect(call[2]).toEqual({ type: 'system', id: null })
  })
})

describe('dispatchDevis — client anonyme', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('crée un dossier avec client_id=null quand clientId est null (soumission anonyme)', async () => {
    mockedEnrich.mockResolvedValue(mkEnriched([mkItem()]))
    mockedFilter.mockResolvedValue(mkFilterResult([['prov-A', 1]]))
    mockedCreate.mockResolvedValue(mkDossier('dossier-anon'))
    const supabase = createSupabaseMock([{ data: null, error: null }])

    const outcome = await dispatchDevis(supabase, {
      ...BASE_INPUT,
      clientId: null,
      candidateProviderIds: ['prov-A'],
    })

    expect(outcome.kind).toBe('cee_routed')
    expect(mockedCreate).toHaveBeenCalledTimes(1)
    expect(mockedCreate).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({
        provider_id: 'prov-A',
        client_id: null,
      }),
      expect.objectContaining({ type: 'system', id: null })
    )
  })
})

describe('dispatchDevis — erreur création', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createCeeDossier retourne null → { kind: error }', async () => {
    mockedEnrich.mockResolvedValue(mkEnriched([mkItem()]))
    mockedFilter.mockResolvedValue(mkFilterResult([['prov-A', 1]]))
    mockedCreate.mockResolvedValue(null)
    const supabase = createSupabaseMock([{ data: null, error: null }])

    const outcome = await dispatchDevis(supabase, {
      ...BASE_INPUT,
      candidateProviderIds: ['prov-A'],
    })

    expect(outcome.kind).toBe('error')
    if (outcome.kind === 'error') {
      expect(outcome.message).toBe('dossier_creation_failed')
    }
  })
})
