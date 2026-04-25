/**
 * Tests unitaires — src/lib/cee/enrich.ts
 * ----------------------------------------
 * Pattern identique à qualify.test.ts : mock chainable thenable pour Supabase.
 * Les queries s'enchaînent dans cet ordre :
 *   1. qualifyDevisForCee  → cee_operations (select code)
 *   2. enrich: cee_operations (select enrichi)
 *   3. getDelegatairesByOperation: cee_delegataires (tagged)
 *   4. getDelegatairesByOperation: cee_delegataires (catchAll)
 *   ... répété × N codes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  enrichCeeQualification,
  CEE_PRICE_CLASSIQUE_EUR_PER_MWHC,
  CEE_PRICE_PRECARITE_EUR_PER_MWHC,
} from '@/lib/cee/enrich'
import { invalidateCeePricesCache } from '@/lib/cee/market-prices'

interface MockResponse {
  data: unknown
  error: { message: string } | null
}

/**
 * Tables qui NE consomment PAS le queue global. Elles reçoivent un empty
 * fallback pour laisser le code tomber sur ses constantes par défaut.
 *
 * `cee_market_prices` est interrogée en parallèle des delegataires (via
 * `Promise.all`) — si on la laisse consommer la queue, l'ordre des réponses
 * part en vrille et les delegataires catchAll sont silencieusement shifted.
 */
const BYPASS_TABLES = new Set(['cee_market_prices'])

function createMockClient(responses: MockResponse[]) {
  let callIndex = 0
  const fromCalls: string[] = []

  const buildChain = (table: string) => {
    const bypass = BYPASS_TABLES.has(table)
    const next: MockResponse = bypass
      ? { data: [], error: null }
      : (responses[callIndex] ?? { data: [], error: null })
    if (!bypass) callIndex++

    const chain: Record<string, unknown> = {}
    const methods = ['select', 'eq', 'contains', 'overlaps', 'in', 'order', 'range', 'limit']
    for (const m of methods) {
      chain[m] = vi.fn(() => chain)
    }
    chain.then = (
      onFulfilled: (v: MockResponse) => unknown,
      onRejected?: (e: unknown) => unknown
    ) => Promise.resolve(next).then(onFulfilled, onRejected)
    return chain
  }

  const client = {
    from: vi.fn((table: string) => {
      fromCalls.push(table)
      return buildChain(table)
    }),
  } as unknown as Parameters<typeof enrichCeeQualification>[0]
  ;(client as unknown as { __fromCalls: string[] }).__fromCalls = fromCalls
  return client
}

function getFromCalls(client: Parameters<typeof enrichCeeQualification>[0]): string[] {
  return (client as unknown as { __fromCalls: string[] }).__fromCalls
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const OP_BAR_TH_179 = {
  code: 'BAR-TH-179',
  nom: 'Pompe à chaleur collective air/eau',
  domaine: 'Bâtiment résidentiel',
  sous_domaine: 'Chauffage',
  rge_qualifications_requises: [],
  non_cumulable_avec: [],
  public_cible: 'tous',
  forfait_base_kwhc: null,
  forfaits_table: {
    unite: 'kWhc_par_appartement',
    formule: 'montant × N × R',
    rows: [
      { etas_min: 111, zone: 'H1', chauffage: 100000, chauffage_ecs: 145000 },
      { etas_min: 111, zone: 'H2', chauffage: 83000, chauffage_ecs: 126000 },
      { etas_min: 111, zone: 'H3', chauffage: 59000, chauffage_ecs: 99000 },
      { etas_min: 190, zone: 'H1', chauffage: 116000, chauffage_ecs: 168000 },
      { etas_min: 190, zone: 'H2', chauffage: 97000, chauffage_ecs: 147000 },
      { etas_min: 190, zone: 'H3', chauffage: 69000, chauffage_ecs: 116000 },
    ],
  },
  // Shape prod : bare JSONB array (cf. migration 400). Le code tolère aussi
  // la shape legacy `{items: [...]}` — cf. test dédié plus bas.
  justificatifs_requis: [
    {
      code: 'attestation_honneur',
      label: "Attestation sur l'honneur",
      source: 'socle',
      obligatoire: true,
      duree_conservation_annees: 6,
    },
    {
      code: 'photos_horodatees_geolocalisees',
      label: 'Photos horodatées avec géolocalisation EXIF',
      source: 'loi_2025-594',
      obligatoire: true,
      exif_geotag: true,
    },
  ],
}

const DELEG_EFFY = {
  id: 'd1',
  slug: 'effy',
  nom_commercial: 'Effy',
  raison_sociale: "Economie d'Energie SAS",
  type: 'mandataire',
  vague_priorite: 1,
  statut: 'partenaire',
  url_site: 'https://effy.fr',
  url_api_docs: null,
  operations_supportees: ['BAR-TH-179'],
  secteurs_couverts: ['residentiel'],
  coup_de_pouce_signataire: true,
  is_p6: true,
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('enrichCeeQualification — happy path', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    invalidateCeePricesCache()
  })

  it('enrichit avec zone H1 (Paris) : forfaits filtrés + estimation € + délégataires', async () => {
    const client = createMockClient([
      // 1. qualifyDevisForCee
      { data: [{ code: 'BAR-TH-179' }], error: null },
      // 2. enrich fetch operations
      { data: [OP_BAR_TH_179], error: null },
      // 3. delegataires tagged
      { data: [DELEG_EFFY], error: null },
      // 4. delegataires catchAll
      { data: [], error: null },
    ])

    const result = await enrichCeeQualification(client, {
      serviceSlug: 'chauffagiste',
      postalCode: '75001',
    })

    expect(result.eligible).toBe(true)
    expect(result.codes).toEqual(['BAR-TH-179'])
    expect(result.zone_climatique).toBe('H1')
    expect(result.items).toHaveLength(1)

    const item = result.items[0]
    expect(item.code).toBe('BAR-TH-179')
    expect(item.delegataires).toHaveLength(1)
    expect(item.delegataires[0].slug).toBe('effy')
    expect(item.justificatifs_requis).toHaveLength(2)
    expect(item.justificatifs_requis[0].code).toBe('attestation_honneur')

    // Zone H1 : min = 100000 (chauffage), max = 168000 (chauffage_ecs à etas 190)
    expect(item.prime_estimate).not.toBeNull()
    expect(item.prime_estimate!.zone).toBe('H1')
    expect(item.prime_estimate!.kwhc_min).toBe(100000)
    expect(item.prime_estimate!.kwhc_max).toBe(168000)
    // 100000 kWhc = 100 MWhc × 9 €/MWhc = 900 € classique
    expect(item.prime_estimate!.euros_classique_min).toBe(
      Math.round((100000 / 1000) * CEE_PRICE_CLASSIQUE_EUR_PER_MWHC)
    )
    expect(item.prime_estimate!.euros_precarite_max).toBe(
      Math.round((168000 / 1000) * CEE_PRICE_PRECARITE_EUR_PER_MWHC)
    )
  })

  it('zone H3 (Marseille) : bornes beaucoup plus basses que H1', async () => {
    const client = createMockClient([
      { data: [{ code: 'BAR-TH-179' }], error: null },
      { data: [OP_BAR_TH_179], error: null },
      { data: [], error: null },
      { data: [], error: null },
    ])

    const result = await enrichCeeQualification(client, {
      serviceSlug: 'chauffagiste',
      postalCode: '13008',
    })

    expect(result.zone_climatique).toBe('H3')
    const est = result.items[0].prime_estimate!
    // H3 : min = 59000, max = 116000
    expect(est.kwhc_min).toBe(59000)
    expect(est.kwhc_max).toBe(116000)
  })

  it('sans code postal : bornes sur toutes les zones confondues', async () => {
    const client = createMockClient([
      { data: [{ code: 'BAR-TH-179' }], error: null },
      { data: [OP_BAR_TH_179], error: null },
      { data: [], error: null },
      { data: [], error: null },
    ])

    const result = await enrichCeeQualification(client, { serviceSlug: 'chauffagiste' })
    expect(result.zone_climatique).toBeNull()
    const est = result.items[0].prime_estimate!
    // Toutes zones : min global = 59000 (H3 etas 111 chauffage), max = 168000 (H1 etas 190 C+ECS)
    expect(est.kwhc_min).toBe(59000)
    expect(est.kwhc_max).toBe(168000)
  })
})

describe('enrichCeeQualification — scalar forfait fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    invalidateCeePricesCache()
  })

  it('utilise forfait_base_kwhc quand forfaits_table est null', async () => {
    const client = createMockClient([
      { data: [{ code: 'BAR-EN-101' }], error: null },
      {
        data: [
          {
            code: 'BAR-EN-101',
            nom: 'Isolation combles',
            domaine: 'Bâtiment',
            sous_domaine: 'Enveloppe',
            rge_qualifications_requises: ['Qualibat RGE 7131'],
            non_cumulable_avec: [],
            public_cible: 'tous',
            forfait_base_kwhc: 1600,
            forfaits_table: null,
            justificatifs_requis: null,
          },
        ],
        error: null,
      },
      { data: [], error: null },
      { data: [], error: null },
    ])

    const result = await enrichCeeQualification(client, {
      serviceSlug: 'isolation-combles',
      postalCode: '75001',
    })

    const item = result.items[0]
    expect(item.prime_estimate).not.toBeNull()
    expect(item.prime_estimate!.kwhc_min).toBe(1600)
    expect(item.prime_estimate!.kwhc_max).toBe(1600)
    expect(item.justificatifs_requis).toEqual([])
  })
})

describe('enrichCeeQualification — non éligible', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    invalidateCeePricesCache()
  })

  it('retourne eligible=false quand aucun code ne match, sans charger les détails', async () => {
    const client = createMockClient([{ data: [], error: null }])
    const result = await enrichCeeQualification(client, {
      serviceSlug: 'metier-inconnu',
      postalCode: '75001',
    })
    expect(result.eligible).toBe(false)
    expect(result.items).toEqual([])
    expect(result.zone_climatique).toBe('H1')
  })
})

describe('enrichCeeQualification — legacy shape tolerance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    invalidateCeePricesCache()
  })

  // Legacy shape tolerance — prod utilise bare array depuis migration 400.
  // Ce test garantit que la tolérance existe (fail-safe) mais ne valide PAS
  // le chemin prod — il documente seulement qu'un ancien seed ou une fixture
  // de test au format `{items: [...]}` ne casse pas `normalizeJustificatifs`.
  it('tolère la shape legacy {items: [...]} (fail-safe, pas le chemin prod)', async () => {
    const OP_LEGACY_SHAPE = {
      ...OP_BAR_TH_179,
      justificatifs_requis: {
        items: [
          {
            code: 'attestation_honneur',
            label: "Attestation sur l'honneur",
            source: 'socle',
            obligatoire: true,
          },
        ],
      },
    }

    const client = createMockClient([
      { data: [{ code: 'BAR-TH-179' }], error: null },
      { data: [OP_LEGACY_SHAPE], error: null },
      { data: [], error: null },
      { data: [], error: null },
    ])

    const result = await enrichCeeQualification(client, {
      serviceSlug: 'chauffagiste',
      postalCode: '75001',
    })

    expect(result.eligible).toBe(true)
    expect(result.items).toHaveLength(1)
    expect(result.items[0].justificatifs_requis).toHaveLength(1)
    expect(result.items[0].justificatifs_requis[0].code).toBe('attestation_honneur')
  })
})

describe('enrichCeeQualification — zone honnête sur forfait non-zoné (Bug #5)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    invalidateCeePricesCache()
  })

  it('forfait scalaire avec code postal fourni → zone=null (pas de zone applicable)', async () => {
    const client = createMockClient([
      { data: [{ code: 'BAR-EN-101' }], error: null },
      {
        data: [
          {
            code: 'BAR-EN-101',
            nom: 'Isolation combles',
            domaine: 'Bâtiment',
            sous_domaine: 'Enveloppe',
            rge_qualifications_requises: [],
            non_cumulable_avec: [],
            public_cible: 'tous',
            forfait_base_kwhc: 1600,
            forfaits_table: null,
            justificatifs_requis: null,
          },
        ],
        error: null,
      },
      { data: [], error: null },
      { data: [], error: null },
    ])

    const result = await enrichCeeQualification(client, {
      serviceSlug: 'isolation-combles',
      postalCode: '75001',
    })

    const est = result.items[0].prime_estimate!
    // Bug #5 : ne jamais afficher une zone H1/H2/H3 sur une fiche scalaire
    expect(est.zone).toBeNull()
  })

  it('forfait non-zoné (pas de clé zone dans la table) avec code postal → zone=null', async () => {
    const client = createMockClient([
      { data: [{ code: 'BAR-NZ-001' }], error: null },
      {
        data: [
          {
            code: 'BAR-NZ-001',
            nom: 'Opération non zonée',
            domaine: 'Bâtiment',
            sous_domaine: null,
            rge_qualifications_requises: [],
            non_cumulable_avec: [],
            public_cible: 'tous',
            forfait_base_kwhc: null,
            // Table avec forfaits mais sans clé `zone` — fiche non-zonée.
            forfaits_table: {
              rows: [{ montant: 5000 }, { montant: 8000 }],
            },
            justificatifs_requis: null,
          },
        ],
        error: null,
      },
      { data: [], error: null },
      { data: [], error: null },
    ])

    const result = await enrichCeeQualification(client, {
      serviceSlug: 'anything',
      postalCode: '75001',
    })

    const est = result.items[0].prime_estimate!
    expect(est.zone).toBeNull()
    expect(est.kwhc_min).toBe(5000)
    expect(est.kwhc_max).toBe(8000)
    // Assumption doit dire "toutes zones", pas "zone H1"
    expect(est.assumptions).toContain('toutes zones')
  })

  it('forfait zoné avec code postal matchant → zone conservée', async () => {
    const client = createMockClient([
      { data: [{ code: 'BAR-TH-179' }], error: null },
      { data: [OP_BAR_TH_179], error: null },
      { data: [], error: null },
      { data: [], error: null },
    ])

    const result = await enrichCeeQualification(client, {
      serviceSlug: 'chauffagiste',
      postalCode: '75001', // H1
    })

    const est = result.items[0].prime_estimate!
    // La fiche a des lignes H1/H2/H3 → filtre appliqué → zone H1 légitime
    expect(est.zone).toBe('H1')
  })
})

describe('enrichCeeQualification — batch délégataires (fix N+1)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    invalidateCeePricesCache()
  })

  it('2 codes → EXACTEMENT 2 queries cee_delegataires (pas 2×N)', async () => {
    // Fixtures minimales pour 2 codes distincts.
    const OP_A = {
      code: 'BAR-EN-101',
      nom: 'Isolation combles A',
      domaine: 'Bâtiment',
      sous_domaine: 'Enveloppe',
      rge_qualifications_requises: [],
      non_cumulable_avec: [],
      public_cible: 'tous',
      forfait_base_kwhc: 1600,
      forfaits_table: null,
      justificatifs_requis: null,
    }
    const OP_B = {
      code: 'BAR-EN-102',
      nom: 'Isolation murs B',
      domaine: 'Bâtiment',
      sous_domaine: 'Enveloppe',
      rge_qualifications_requises: [],
      non_cumulable_avec: [],
      public_cible: 'tous',
      forfait_base_kwhc: 800,
      forfaits_table: null,
      justificatifs_requis: null,
    }
    const DELEG_TAGGED_A = {
      ...DELEG_EFFY,
      id: 'd-a',
      slug: 'deleg-a',
      nom_commercial: 'Deleg A',
      operations_supportees: ['BAR-EN-101'],
    }
    const DELEG_CATCHALL = {
      ...DELEG_EFFY,
      id: 'd-ca',
      slug: 'deleg-ca',
      nom_commercial: 'Deleg Catchall',
      operations_supportees: [],
    }

    const client = createMockClient([
      // 1. qualifyDevisForCee
      { data: [{ code: 'BAR-EN-101' }, { code: 'BAR-EN-102' }], error: null },
      // 2. enrich fetch operations
      { data: [OP_A, OP_B], error: null },
      // 3. batch delegataires : overlaps (tagged multi-codes)
      { data: [DELEG_TAGGED_A], error: null },
      // 4. batch delegataires : all-active
      { data: [DELEG_TAGGED_A, DELEG_CATCHALL], error: null },
    ])

    const result = await enrichCeeQualification(client, {
      serviceSlug: 'anything',
      postalCode: '75001',
    })

    // Assertion compteur queries : cee_delegataires apparaît EXACTEMENT 2 fois.
    const fromCalls = getFromCalls(client)
    const delegCount = fromCalls.filter((t) => t === 'cee_delegataires').length
    expect(delegCount).toBe(2)

    // Non-régression fonctionnelle : chaque code reçoit ses délégataires.
    expect(result.items).toHaveLength(2)
    const byCode = new Map(result.items.map((i) => [i.code, i]))
    const itemA = byCode.get('BAR-EN-101')!
    const itemB = byCode.get('BAR-EN-102')!

    // Code A : tagged deleg-a + catch-all deleg-ca
    expect(itemA.delegataires.map((d) => d.slug).sort()).toEqual(['deleg-a', 'deleg-ca'].sort())
    // Code B : pas de tagged (seul BAR-EN-101 est tagged) + catch-all deleg-ca
    expect(itemB.delegataires.map((d) => d.slug)).toEqual(['deleg-ca'])
  })
})

describe('enrichCeeQualification — fail-open sur erreur DB', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    invalidateCeePricesCache()
  })

  it('retourne items vides mais garde codes quand le fetch enrichi échoue', async () => {
    const client = createMockClient([
      { data: [{ code: 'BAR-TH-179' }], error: null },
      { data: null, error: { message: 'connection refused' } },
    ])
    const result = await enrichCeeQualification(client, {
      serviceSlug: 'chauffagiste',
      postalCode: '75001',
    })
    expect(result.eligible).toBe(true)
    expect(result.codes).toEqual(['BAR-TH-179'])
    expect(result.items).toEqual([])
  })
})
