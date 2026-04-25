/**
 * Tests unitaires — src/lib/cee/rge-filter.ts
 * --------------------------------------------
 * Même pattern de mock que qualify.test.ts / enrich.test.ts : chaque appel à
 * supabase.from(...) retourne un chain thenable. Les réponses sont fournies
 * dans l'ordre d'appel.
 *
 * Ordre des queries pour `checkProviderRgeCoverage` :
 *   1. cee_operations (getRequiredRgeLabels)
 *   2. providers (fetch unitaire)
 *
 * Ordre des queries pour `filterProvidersByCeeRge` :
 *   1. cee_operations
 *   2. providers (batch .in('id', ids))
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  checkProviderRgeCoverage,
  filterProvidersByCeeRge,
  AUDIT_REQUIRED_SENTINEL,
} from '@/lib/cee/rge-filter'

// ---------------------------------------------------------------------------
// Mock client chainable thenable
// ---------------------------------------------------------------------------

interface MockResponse {
  data: unknown
  error: { message: string } | null
}

function createMockClient(responses: MockResponse[]) {
  let callIndex = 0
  const fromCalls: string[] = []

  const buildChain = () => {
    const next: MockResponse = responses[callIndex] ?? { data: [], error: null }
    callIndex++

    const chain: Record<string, unknown> = {}
    const methods = ['select', 'eq', 'contains', 'in', 'order', 'range', 'limit']
    for (const m of methods) {
      chain[m] = vi.fn(() => chain)
    }
    chain.then = (
      onFulfilled: (v: MockResponse) => unknown,
      onRejected?: (e: unknown) => unknown
    ) => Promise.resolve(next).then(onFulfilled, onRejected)
    return chain
  }

  const fromFn = vi.fn((table: string) => {
    fromCalls.push(table)
    return buildChain()
  })

  return {
    client: { from: fromFn } as unknown as Parameters<typeof filterProvidersByCeeRge>[0],
    fromFn,
    fromCalls,
  }
}

// ---------------------------------------------------------------------------
// Fixtures — dates
// ---------------------------------------------------------------------------

const FUTURE_DATE = '2030-12-31'
const PAST_DATE = '2020-01-01'

// ---------------------------------------------------------------------------
// checkProviderRgeCoverage
// ---------------------------------------------------------------------------

describe('checkProviderRgeCoverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('provider avec toutes les qualifs → hasCoverage=true', async () => {
    const { client } = createMockClient([
      // cee_operations
      {
        data: [
          {
            code: 'BAR-TH-171',
            rge_qualifications_requises: ['QualiPAC'],
            rge_requirement_status: 'required_with_codes',
          },
        ],
        error: null,
      },
      // providers
      {
        data: [
          {
            id: 'p1',
            siret: '12345678900011',
            rge_qualifications: [{ nom: 'QualiPAC Module Chauffage', date_fin: FUTURE_DATE }],
          },
        ],
        error: null,
      },
    ])
    const result = await checkProviderRgeCoverage(client, 'p1', ['BAR-TH-171'])
    expect(result.hasCoverage).toBe(true)
    expect(result.requiredCodes).toEqual(['QualiPAC'])
    expect(result.foundCodes).toEqual(['QualiPAC Module Chauffage'])
    expect(result.missingCodes).toEqual([])
    expect(result.siret).toBe('12345678900011')
  })

  it('provider avec qualif manquante → hasCoverage=false + missingCodes correct', async () => {
    const { client } = createMockClient([
      {
        data: [
          {
            code: 'BAR-TH-113',
            rge_qualifications_requises: ['Qualibois Eau', 'Qualibois Air'],
            rge_requirement_status: 'required_with_codes',
          },
        ],
        error: null,
      },
      {
        data: [
          {
            id: 'p1',
            siret: '12345678900011',
            rge_qualifications: [{ nom: 'Qualibois Eau', date_fin: FUTURE_DATE }],
          },
        ],
        error: null,
      },
    ])
    const result = await checkProviderRgeCoverage(client, 'p1', ['BAR-TH-113'])
    expect(result.hasCoverage).toBe(false)
    expect(result.foundCodes).toEqual(['Qualibois Eau'])
    expect(result.missingCodes).toEqual(['Qualibois Air'])
  })

  it('fiche sans exigence (requiredCodes = []) → hasCoverage=true, pas de query providers', async () => {
    const { client, fromCalls } = createMockClient([
      // cee_operations → aucune exigence (dispensed, verbatim PDF vA75-1)
      {
        data: [
          {
            code: 'BAR-TH-179',
            rge_qualifications_requises: [],
            rge_requirement_status: 'dispensed',
          },
        ],
        error: null,
      },
    ])
    const result = await checkProviderRgeCoverage(client, 'p1', ['BAR-TH-179'])
    expect(result.hasCoverage).toBe(true)
    expect(result.requiredCodes).toEqual([])
    expect(result.missingCodes).toEqual([])
    // seule query : cee_operations
    expect(fromCalls).toEqual(['cee_operations'])
  })

  it('match case-insensitive + espaces multiples', async () => {
    const { client } = createMockClient([
      {
        data: [
          {
            code: 'BAR-TH-171',
            rge_qualifications_requises: ['  QualiPAC  '],
            rge_requirement_status: 'required_with_codes',
          },
        ],
        error: null,
      },
      {
        data: [
          {
            id: 'p1',
            siret: '12345678900011',
            rge_qualifications: [{ nom: 'qualipac  module   chauffage', date_fin: FUTURE_DATE }],
          },
        ],
        error: null,
      },
    ])
    const result = await checkProviderRgeCoverage(client, 'p1', ['BAR-TH-171'])
    expect(result.hasCoverage).toBe(true)
  })

  it('qualif expirée (date_fin passée) → non comptée', async () => {
    const { client } = createMockClient([
      {
        data: [
          {
            code: 'BAR-TH-171',
            rge_qualifications_requises: ['QualiPAC'],
            rge_requirement_status: 'required_with_codes',
          },
        ],
        error: null,
      },
      {
        data: [
          {
            id: 'p1',
            siret: '12345678900011',
            rge_qualifications: [{ nom: 'QualiPAC Module Chauffage', date_fin: PAST_DATE }],
          },
        ],
        error: null,
      },
    ])
    const result = await checkProviderRgeCoverage(client, 'p1', ['BAR-TH-171'])
    expect(result.hasCoverage).toBe(false)
    expect(result.missingCodes).toEqual(['QualiPAC'])
  })

  it('date_fin au format non-ISO (ex: 01/12/2026) → qualif rejetée (fail-CLOSED)', async () => {
    const { client } = createMockClient([
      {
        data: [
          {
            code: 'BAR-TH-171',
            rge_qualifications_requises: ['QualiPAC'],
            rge_requirement_status: 'required_with_codes',
          },
        ],
        error: null,
      },
      {
        data: [
          {
            id: 'p1',
            siret: '12345678900011',
            rge_qualifications: [{ nom: 'QualiPAC Module Chauffage', date_fin: '01/12/2026' }],
          },
        ],
        error: null,
      },
    ])
    const result = await checkProviderRgeCoverage(client, 'p1', ['BAR-TH-171'])
    expect(result.hasCoverage).toBe(false)
    expect(result.missingCodes).toEqual(['QualiPAC'])
  })

  it('fail-CLOSED quand cee_operations erreur DB', async () => {
    const { client } = createMockClient([{ data: null, error: { message: 'connection refused' } }])
    const result = await checkProviderRgeCoverage(client, 'p1', ['BAR-TH-171'])
    expect(result.hasCoverage).toBe(false)
  })

  it('fail-CLOSED quand providers erreur DB', async () => {
    const { client } = createMockClient([
      {
        data: [
          {
            code: 'BAR-TH-171',
            rge_qualifications_requises: ['QualiPAC'],
            rge_requirement_status: 'required_with_codes',
          },
        ],
        error: null,
      },
      { data: null, error: { message: 'timeout' } },
    ])
    const result = await checkProviderRgeCoverage(client, 'p1', ['BAR-TH-171'])
    expect(result.hasCoverage).toBe(false)
    expect(result.missingCodes).toEqual(['QualiPAC'])
  })
})

// ---------------------------------------------------------------------------
// filterProvidersByCeeRge
// ---------------------------------------------------------------------------

describe('filterProvidersByCeeRge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('provider sans siret → ineligible short-circuit', async () => {
    const { client } = createMockClient([
      // cee_operations
      {
        data: [
          {
            code: 'BAR-TH-171',
            rge_qualifications_requises: ['QualiPAC'],
            rge_requirement_status: 'required_with_codes',
          },
        ],
        error: null,
      },
      // providers
      {
        data: [
          {
            id: 'p1',
            siret: null,
            rge_qualifications: null,
          },
        ],
        error: null,
      },
    ])
    const result = await filterProvidersByCeeRge(client, {
      providerIds: ['p1'],
      operationCodes: ['BAR-TH-171'],
    })
    expect(result.eligible).toHaveLength(0)
    expect(result.ineligible).toHaveLength(1)
    expect(result.ineligible[0].coverage.siret).toBeNull()
    expect(result.ineligible[0].coverage.missingCodes).toEqual(['QualiPAC'])
  })

  it('union des qualifs multi-fiches dédupliquée', async () => {
    const { client } = createMockClient([
      {
        data: [
          {
            code: 'BAR-TH-171',
            rge_qualifications_requises: ['QualiPAC'],
            rge_requirement_status: 'required_with_codes',
          },
          {
            code: 'BAR-TH-143',
            rge_qualifications_requises: ['QualiPAC', 'Qualisol Combi'],
            rge_requirement_status: 'required_with_codes',
          },
        ],
        error: null,
      },
      {
        data: [
          {
            id: 'p1',
            siret: '12345678900011',
            rge_qualifications: [
              { nom: 'QualiPAC Module Chauffage', date_fin: FUTURE_DATE },
              { nom: 'Qualisol Combi', date_fin: FUTURE_DATE },
            ],
          },
        ],
        error: null,
      },
    ])
    const result = await filterProvidersByCeeRge(client, {
      providerIds: ['p1'],
      operationCodes: ['BAR-TH-171', 'BAR-TH-143'],
    })
    expect(result.eligible).toHaveLength(1)
    const cov = result.eligible[0].coverage
    // Union déduppliquée : 2 libellés uniques (pas 3)
    expect(cov.requiredCodes.sort()).toEqual(['QualiPAC', 'Qualisol Combi'].sort())
    expect(cov.hasCoverage).toBe(true)
  })

  it('fiches sans exigence → tous eligible, pas de query providers', async () => {
    const { client, fromCalls } = createMockClient([
      {
        data: [
          {
            code: 'BAR-TH-179',
            rge_qualifications_requises: [],
            rge_requirement_status: 'dispensed',
          },
          {
            code: 'BAR-TH-180',
            rge_qualifications_requises: null,
            rge_requirement_status: 'dispensed',
          },
        ],
        error: null,
      },
    ])
    const result = await filterProvidersByCeeRge(client, {
      providerIds: ['p1', 'p2', 'p3'],
      operationCodes: ['BAR-TH-179', 'BAR-TH-180'],
    })
    expect(result.eligible).toHaveLength(3)
    expect(result.ineligible).toHaveLength(0)
    // aucune query providers
    expect(fromCalls).toEqual(['cee_operations'])
  })

  it('batch : UNE seule query providers pour N candidats', async () => {
    const { client, fromCalls } = createMockClient([
      {
        data: [
          {
            code: 'BAR-TH-171',
            rge_qualifications_requises: ['QualiPAC'],
            rge_requirement_status: 'required_with_codes',
          },
        ],
        error: null,
      },
      {
        data: [
          {
            id: 'p1',
            siret: '11111111100011',
            rge_qualifications: [{ nom: 'QualiPAC Module Chauffage', date_fin: FUTURE_DATE }],
          },
          {
            id: 'p2',
            siret: '22222222200022',
            rge_qualifications: [{ nom: 'Qualibat RGE', date_fin: FUTURE_DATE }],
          },
          {
            id: 'p3',
            siret: null,
            rge_qualifications: null,
          },
        ],
        error: null,
      },
    ])
    const result = await filterProvidersByCeeRge(client, {
      providerIds: ['p1', 'p2', 'p3'],
      operationCodes: ['BAR-TH-171'],
    })
    expect(result.eligible.map((e) => e.providerId)).toEqual(['p1'])
    expect(result.ineligible.map((e) => e.providerId).sort()).toEqual(['p2', 'p3'])
    // Exactement 2 appels from() : cee_operations + providers
    expect(fromCalls).toEqual(['cee_operations', 'providers'])
  })

  it('erreur DB rge → fail-CLOSED tous ineligible', async () => {
    const { client } = createMockClient([
      {
        data: [
          {
            code: 'BAR-TH-171',
            rge_qualifications_requises: ['QualiPAC'],
            rge_requirement_status: 'required_with_codes',
          },
        ],
        error: null,
      },
      { data: null, error: { message: 'connection refused' } },
    ])
    const result = await filterProvidersByCeeRge(client, {
      providerIds: ['p1', 'p2'],
      operationCodes: ['BAR-TH-171'],
    })
    expect(result.eligible).toHaveLength(0)
    expect(result.ineligible).toHaveLength(2)
    for (const item of result.ineligible) {
      expect(item.coverage.hasCoverage).toBe(false)
      expect(item.coverage.missingCodes).toEqual(['QualiPAC'])
    }
  })

  it('erreur DB cee_operations → fail-CLOSED', async () => {
    const { client } = createMockClient([{ data: null, error: { message: 'timeout' } }])
    const result = await filterProvidersByCeeRge(client, {
      providerIds: ['p1'],
      operationCodes: ['BAR-TH-171'],
    })
    expect(result.eligible).toHaveLength(0)
    expect(result.ineligible).toHaveLength(1)
  })

  it('providerIds vide → résultat vide sans query DB', async () => {
    const { client, fromCalls } = createMockClient([])
    const result = await filterProvidersByCeeRge(client, {
      providerIds: [],
      operationCodes: ['BAR-TH-171'],
    })
    expect(result.eligible).toEqual([])
    expect(result.ineligible).toEqual([])
    expect(fromCalls).toEqual([])
  })

  it('provider absent du résultat DB (soft-delete/RLS) → ineligible', async () => {
    const { client } = createMockClient([
      {
        data: [
          {
            code: 'BAR-TH-171',
            rge_qualifications_requises: ['QualiPAC'],
            rge_requirement_status: 'required_with_codes',
          },
        ],
        error: null,
      },
      {
        data: [
          {
            id: 'p1',
            siret: '11111111100011',
            rge_qualifications: [{ nom: 'QualiPAC Module Chauffage', date_fin: FUTURE_DATE }],
          },
          // p2 manquant volontairement
        ],
        error: null,
      },
    ])
    const result = await filterProvidersByCeeRge(client, {
      providerIds: ['p1', 'p2'],
      operationCodes: ['BAR-TH-171'],
    })
    expect(result.eligible.map((e) => e.providerId)).toEqual(['p1'])
    expect(result.ineligible.map((e) => e.providerId)).toEqual(['p2'])
  })

  // -------------------------------------------------------------------------
  // Sémantique rge_requirement_status (migration 401)
  // -------------------------------------------------------------------------

  it('status=dispensed → tous eligible (pas de query providers)', async () => {
    const { client, fromCalls } = createMockClient([
      {
        data: [
          {
            code: 'BAR-TH-179',
            rge_qualifications_requises: [],
            rge_requirement_status: 'dispensed',
          },
        ],
        error: null,
      },
    ])
    const result = await filterProvidersByCeeRge(client, {
      providerIds: ['p1', 'p2'],
      operationCodes: ['BAR-TH-179'],
    })
    expect(result.eligible).toHaveLength(2)
    expect(result.ineligible).toHaveLength(0)
    expect(result.blockingAuditRequired).toEqual([])
    expect(fromCalls).toEqual(['cee_operations'])
  })

  it('status=not_applicable → tous eligible', async () => {
    const { client, fromCalls } = createMockClient([
      {
        data: [
          {
            code: 'BAR-SE-104',
            rge_qualifications_requises: [],
            rge_requirement_status: 'not_applicable',
          },
        ],
        error: null,
      },
    ])
    const result = await filterProvidersByCeeRge(client, {
      providerIds: ['p1', 'p2', 'p3'],
      operationCodes: ['BAR-SE-104'],
    })
    expect(result.eligible).toHaveLength(3)
    expect(result.ineligible).toHaveLength(0)
    expect(result.blockingAuditRequired).toEqual([])
    expect(fromCalls).toEqual(['cee_operations'])
  })

  it('status=required_unknown_codes → tous ineligible + blockingAuditRequired rempli', async () => {
    const { client, fromCalls } = createMockClient([
      {
        data: [
          {
            code: 'BAR-TH-171',
            rge_qualifications_requises: ['QualiPAC'],
            rge_requirement_status: 'required_unknown_codes',
          },
        ],
        error: null,
      },
    ])
    const result = await filterProvidersByCeeRge(client, {
      providerIds: ['p1', 'p2'],
      operationCodes: ['BAR-TH-171'],
    })
    expect(result.eligible).toHaveLength(0)
    expect(result.ineligible).toHaveLength(2)
    expect(result.blockingAuditRequired).toEqual(['BAR-TH-171'])
    for (const item of result.ineligible) {
      expect(item.coverage.hasCoverage).toBe(false)
      expect(item.coverage.missingCodes).toEqual([AUDIT_REQUIRED_SENTINEL])
    }
    // Pas de query providers : on bloque avant.
    expect(fromCalls).toEqual(['cee_operations'])
  })

  it('mix dispensed + required_with_codes → filtre uniquement sur required_with_codes', async () => {
    const { client } = createMockClient([
      {
        data: [
          {
            code: 'BAR-TH-179',
            rge_qualifications_requises: [],
            rge_requirement_status: 'dispensed',
          },
          {
            code: 'BAR-TH-178',
            rge_qualifications_requises: ['OPQIBI 10.07', 'OPQIBI 20.13'],
            rge_requirement_status: 'required_with_codes',
          },
        ],
        error: null,
      },
      {
        data: [
          {
            id: 'p1',
            siret: '11111111100011',
            rge_qualifications: [
              { nom: 'OPQIBI 10.07 Étude des ressources géothermiques', date_fin: FUTURE_DATE },
              { nom: 'OPQIBI 20.13 Maîtrise d’œuvre géothermie', date_fin: FUTURE_DATE },
            ],
          },
          {
            id: 'p2',
            siret: '22222222200022',
            rge_qualifications: [{ nom: 'Qualibat RGE', date_fin: FUTURE_DATE }],
          },
        ],
        error: null,
      },
    ])
    const result = await filterProvidersByCeeRge(client, {
      providerIds: ['p1', 'p2'],
      operationCodes: ['BAR-TH-179', 'BAR-TH-178'],
    })
    expect(result.blockingAuditRequired).toEqual([])
    // Les libellés agrégés ne viennent QUE de la fiche required_with_codes.
    expect(result.eligible.map((e) => e.providerId)).toEqual(['p1'])
    expect(result.ineligible.map((e) => e.providerId)).toEqual(['p2'])
    const cov = result.eligible[0].coverage
    expect(cov.requiredCodes.sort()).toEqual(['OPQIBI 10.07', 'OPQIBI 20.13'].sort())
  })

  // -------------------------------------------------------------------------
  // dispensed avec rge_decret_category (migration 403 + 404)
  // -------------------------------------------------------------------------

  it('dispensed avec category requise → match si provider a la catégorie', async () => {
    const { client } = createMockClient([
      {
        data: [
          {
            code: 'BAR-TH-171',
            rge_qualifications_requises: [],
            rge_requirement_status: 'dispensed',
            rge_decret_category: [5],
          },
        ],
        error: null,
      },
      {
        data: [
          {
            id: 'p1',
            siret: '11111111100011',
            rge_qualifications: [],
            rge_categories_decret: [5, 6],
          },
        ],
        error: null,
      },
    ])
    const result = await filterProvidersByCeeRge(client, {
      providerIds: ['p1'],
      operationCodes: ['BAR-TH-171'],
    })
    expect(result.eligible).toHaveLength(1)
    expect(result.ineligible).toHaveLength(0)
    const cov = result.eligible[0].coverage
    expect(cov.requiredCategories).toEqual([5])
    expect(cov.foundCategories).toEqual([5])
    expect(cov.missingCategories).toEqual([])
  })

  it("dispensed avec category requise → no match si provider n'a pas la catégorie → ineligible + missingCategories", async () => {
    const { client } = createMockClient([
      {
        data: [
          {
            code: 'BAR-TH-171',
            rge_qualifications_requises: [],
            rge_requirement_status: 'dispensed',
            rge_decret_category: [5],
          },
        ],
        error: null,
      },
      {
        data: [
          {
            id: 'p1',
            siret: '11111111100011',
            rge_qualifications: [],
            rge_categories_decret: [3, 4],
          },
        ],
        error: null,
      },
    ])
    const result = await filterProvidersByCeeRge(client, {
      providerIds: ['p1'],
      operationCodes: ['BAR-TH-171'],
    })
    expect(result.eligible).toHaveLength(0)
    expect(result.ineligible).toHaveLength(1)
    const cov = result.ineligible[0].coverage
    expect(cov.hasCoverage).toBe(false)
    expect(cov.requiredCategories).toEqual([5])
    expect(cov.missingCategories).toEqual([5])
    expect(cov.foundCategories).toEqual([])
  })

  it('dispensed avec rge_decret_category vide → pass-through (cas BAR-TH-129 revu)', async () => {
    const { client, fromCalls } = createMockClient([
      {
        data: [
          {
            code: 'BAR-TH-129',
            rge_qualifications_requises: [],
            rge_requirement_status: 'dispensed',
            rge_decret_category: [],
          },
        ],
        error: null,
      },
    ])
    const result = await filterProvidersByCeeRge(client, {
      providerIds: ['p1', 'p2'],
      operationCodes: ['BAR-TH-129'],
    })
    expect(result.eligible).toHaveLength(2)
    expect(result.ineligible).toHaveLength(0)
    expect(fromCalls).toEqual(['cee_operations'])
  })

  it('not_applicable → pass-through inchangé (aucun match catégorie)', async () => {
    const { client, fromCalls } = createMockClient([
      {
        data: [
          {
            code: 'BAR-TH-161',
            rge_qualifications_requises: [],
            rge_requirement_status: 'not_applicable',
            // not_applicable peut avoir rge_decret_category = [] — on l'ignore
            rge_decret_category: [],
          },
        ],
        error: null,
      },
    ])
    const result = await filterProvidersByCeeRge(client, {
      providerIds: ['p1', 'p2', 'p3'],
      operationCodes: ['BAR-TH-161'],
    })
    expect(result.eligible).toHaveLength(3)
    expect(result.ineligible).toHaveLength(0)
    expect(fromCalls).toEqual(['cee_operations'])
  })

  it('mix dispensed + required_with_codes → deux règles cumulées', async () => {
    const { client } = createMockClient([
      {
        data: [
          {
            code: 'BAR-TH-171',
            rge_qualifications_requises: [],
            rge_requirement_status: 'dispensed',
            rge_decret_category: [5],
          },
          {
            code: 'BAR-TH-178',
            rge_qualifications_requises: ['OPQIBI 10.07'],
            rge_requirement_status: 'required_with_codes',
            rge_decret_category: null,
          },
        ],
        error: null,
      },
      {
        data: [
          {
            id: 'p1',
            siret: '11111111100011',
            rge_qualifications: [{ nom: 'OPQIBI 10.07 Étude', date_fin: FUTURE_DATE }],
            rge_categories_decret: [5],
          },
          {
            id: 'p2',
            siret: '22222222200022',
            rge_qualifications: [{ nom: 'OPQIBI 10.07 Étude', date_fin: FUTURE_DATE }],
            // catégorie 5 manquante → ineligible malgré le libellé
            rge_categories_decret: [3],
          },
          {
            id: 'p3',
            siret: '33333333300033',
            rge_qualifications: [], // libellé ET catégorie manquants
            rge_categories_decret: [],
          },
        ],
        error: null,
      },
    ])
    const result = await filterProvidersByCeeRge(client, {
      providerIds: ['p1', 'p2', 'p3'],
      operationCodes: ['BAR-TH-171', 'BAR-TH-178'],
    })
    expect(result.eligible.map((e) => e.providerId)).toEqual(['p1'])
    const ineligibleIds = result.ineligible.map((e) => e.providerId).sort()
    expect(ineligibleIds).toEqual(['p2', 'p3'])

    const p1Cov = result.eligible[0].coverage
    expect(p1Cov.requiredCodes).toEqual(['OPQIBI 10.07'])
    expect(p1Cov.requiredCategories).toEqual([5])
    expect(p1Cov.foundCategories).toEqual([5])
    expect(p1Cov.missingCategories).toEqual([])
    expect(p1Cov.missingCodes).toEqual([])

    const p2Cov = result.ineligible.find((e) => e.providerId === 'p2')!.coverage
    expect(p2Cov.missingCategories).toEqual([5])
    expect(p2Cov.missingCodes).toEqual([])

    const p3Cov = result.ineligible.find((e) => e.providerId === 'p3')!.coverage
    expect(p3Cov.missingCodes).toEqual(['OPQIBI 10.07'])
    expect(p3Cov.missingCategories).toEqual([5])
  })

  it('mix required_with_codes + required_unknown_codes → tous ineligible (fail-closed strict)', async () => {
    const { client, fromCalls } = createMockClient([
      {
        data: [
          {
            code: 'BAR-TH-178',
            rge_qualifications_requises: ['OPQIBI 10.07', 'OPQIBI 20.13'],
            rge_requirement_status: 'required_with_codes',
          },
          {
            code: 'BAR-TH-171',
            rge_qualifications_requises: ['QualiPAC'],
            rge_requirement_status: 'required_unknown_codes',
          },
        ],
        error: null,
      },
    ])
    const result = await filterProvidersByCeeRge(client, {
      providerIds: ['p1', 'p2'],
      operationCodes: ['BAR-TH-178', 'BAR-TH-171'],
    })
    expect(result.eligible).toHaveLength(0)
    expect(result.ineligible).toHaveLength(2)
    expect(result.blockingAuditRequired).toEqual(['BAR-TH-171'])
    for (const item of result.ineligible) {
      expect(item.coverage.missingCodes).toEqual([AUDIT_REQUIRED_SENTINEL])
    }
    // Court-circuit : pas de query providers même si required_with_codes existe.
    expect(fromCalls).toEqual(['cee_operations'])
  })
})
