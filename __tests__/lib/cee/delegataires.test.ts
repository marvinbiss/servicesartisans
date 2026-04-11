/**
 * Tests unitaires pour src/lib/cee/delegataires.ts (brique 1 bis mandataire CEE).
 *
 * Stratégie : `listActiveDelegataires` et `getDelegatairesByOperation` reçoivent
 * le client Supabase en paramètre — on peut donc builder un mock chainable minimal
 * sans devoir mocker le module `@/lib/supabase`.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { listActiveDelegataires, getDelegatairesByOperation } from '@/lib/cee/delegataires'

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

// ---------------------------------------------------------------------------
// Mock Supabase builder
// ---------------------------------------------------------------------------

interface MockResponse {
  data: unknown
  error: { message: string } | null
}

/**
 * Crée un mock de `SupabaseClient` pour `cee_delegataires`. Chaque appel à
 * `.from('cee_delegataires')` retourne un builder chainable qui résout avec la
 * réponse passée en argument, OU enchaîne la prochaine réponse d'une queue si
 * plusieurs appels successifs sont attendus (cas de getDelegatairesByOperation
 * qui fait 2 queries : tagged + catchAll).
 */
interface CapturedCall {
  method: string
  args: unknown[]
}

function createMockClient(responses: MockResponse[]) {
  let callIndex = 0
  const captured: CapturedCall[] = []

  const buildChain = () => {
    const next: MockResponse = responses[callIndex] ?? { data: [], error: null }
    callIndex++

    // Un thenable chainable où chaque méthode retourne this, et `.then`
    // résout avec la réponse courante. On capture les args de chaque appel
    // pour pouvoir asserter l'inversion de paramètres côté test (mock-théâtre).
    const chain: Record<string, unknown> = {}
    const methods = ['select', 'in', 'eq', 'contains', 'overlaps', 'order', 'range', 'limit']
    for (const m of methods) {
      chain[m] = vi.fn((...args: unknown[]) => {
        captured.push({ method: m, args })
        return chain
      })
    }
    // PromiseLike
    chain.then = (
      onFulfilled: (v: MockResponse) => unknown,
      onRejected?: (e: unknown) => unknown
    ) => Promise.resolve(next).then(onFulfilled, onRejected)
    return chain
  }

  const client = {
    from: vi.fn((table: string) => {
      expect(table).toBe('cee_delegataires')
      return buildChain()
    }),
  } as unknown as Parameters<typeof listActiveDelegataires>[0]

  return { client, captured }
}

// Helper : rétrocompatibilité — la majorité des tests prend directement le client.
function createMockClientSimple(responses: MockResponse[]) {
  return createMockClient(responses).client
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('listActiveDelegataires', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retourne la liste des délégataires actifs/partenaires', async () => {
    const fake = [
      {
        id: 'uuid-1',
        slug: 'effy',
        nom_commercial: 'Effy',
        raison_sociale: "Economie d'Energie SAS",
        type: 'delegated',
        vague_priorite: 1,
        statut: 'partenaire',
        url_site: 'https://www.effy.fr',
        url_api_docs: null,
        operations_supportees: [],
        secteurs_couverts: ['residentiel'],
        coup_de_pouce_signataire: true,
        is_p6: true,
      },
    ]
    const { client, captured } = createMockClient([{ data: fake, error: null }])
    const result = await listActiveDelegataires(client)
    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe('effy')
    expect(result[0].vague_priorite).toBe(1)
    // Mock-théâtre : on vérifie l'ordre des paramètres côté .in(col, vals)
    // pour détecter une inversion accidentelle (col = 'statut' et non pas
    // la valeur passée en 1er argument).
    const inCalls = captured.filter((c) => c.method === 'in')
    expect(inCalls.length).toBeGreaterThanOrEqual(1)
    expect(inCalls[0].args[0]).toBe('statut')
    expect(inCalls[0].args[1]).toEqual(['actif', 'partenaire'])
  })

  it('fail-open : retourne [] si la DB renvoie une erreur', async () => {
    const client = createMockClientSimple([
      { data: null, error: { message: 'connection refused' } },
    ])
    const result = await listActiveDelegataires(client)
    expect(result).toEqual([])
  })

  it('retourne [] si data est null', async () => {
    const client = createMockClientSimple([{ data: null, error: null }])
    const result = await listActiveDelegataires(client)
    expect(result).toEqual([])
  })
})

describe('getDelegatairesByOperation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('merge les tagged + catch-all (filtre JS sur operations_supportees.length === 0) et dédup par id', async () => {
    const sonergiaTagged = {
      id: 'u1',
      slug: 'sonergia',
      nom_commercial: 'Sonergia',
      raison_sociale: 'Sonergia',
      type: 'delegated',
      vague_priorite: 1,
      statut: 'partenaire',
      url_site: null,
      url_api_docs: null,
      operations_supportees: ['BAR-EN-101'],
      secteurs_couverts: ['residentiel'],
      coup_de_pouce_signataire: true,
      is_p6: true,
    }
    const effyCatchAll = {
      id: 'u2',
      slug: 'effy',
      nom_commercial: 'Effy',
      raison_sociale: 'Effy',
      type: 'delegated',
      vague_priorite: 1,
      statut: 'partenaire',
      url_site: null,
      url_api_docs: null,
      operations_supportees: [],
      secteurs_couverts: ['residentiel'],
      coup_de_pouce_signataire: true,
      is_p6: true,
    }
    const hellioNotCatchAll = {
      id: 'u3',
      slug: 'hellio',
      nom_commercial: 'Hellio',
      raison_sociale: 'Hellio',
      type: 'delegated',
      vague_priorite: 2,
      statut: 'partenaire',
      url_site: null,
      url_api_docs: null,
      // Spécifiquement sur une AUTRE opération → doit être filtré out en JS
      operations_supportees: ['BAR-TH-999'],
      secteurs_couverts: ['residentiel'],
      coup_de_pouce_signataire: false,
      is_p6: true,
    }

    // Query A : tagged sur BAR-EN-101
    // Query B : TOUS les actifs (sonergia, effy catch-all, hellio non-catch-all)
    const { client, captured } = createMockClient([
      { data: [sonergiaTagged], error: null },
      { data: [sonergiaTagged, effyCatchAll, hellioNotCatchAll], error: null },
    ])
    const result = await getDelegatairesByOperation(client, 'BAR-EN-101')
    // Mock-théâtre : on vérifie les args de `.contains(col, vals)` pour
    // détecter une inversion accidentelle (col = 'operations_supportees',
    // vals = [operationCode]). Et on vérifie que `.in('statut', [...])` est
    // bien appelé sur les DEUX queries.
    const containsCalls = captured.filter((c) => c.method === 'contains')
    expect(containsCalls.length).toBeGreaterThanOrEqual(1)
    expect(containsCalls[0].args[0]).toBe('operations_supportees')
    expect(containsCalls[0].args[1]).toEqual(['BAR-EN-101'])
    const inCalls = captured.filter((c) => c.method === 'in')
    expect(inCalls.length).toBeGreaterThanOrEqual(2)
    for (const c of inCalls) {
      expect(c.args[0]).toBe('statut')
      expect(c.args[1]).toEqual(['actif', 'partenaire'])
    }
    // Attendu : Sonergia (tagged) + Effy (catch-all JS). Hellio filtré out.
    expect(result).toHaveLength(2)
    expect(result.map((d) => d.slug).sort()).toEqual(['effy', 'sonergia'])
    // Trié alphabétiquement à vague égale → Effy avant Sonergia
    expect(result[0].slug).toBe('effy')
    expect(result[1].slug).toBe('sonergia')
  })

  it('délégataire catch-all (operations_supportees=[]) est inclus même pour un code inconnu du tagged', async () => {
    // Fix bug A2 : avant le fix, Effy/TotalEnergies étaient silencieusement
    // exclus car la query `.eq('operations_supportees', '{}')` ne matchait
    // jamais en PostgREST.
    const effy = {
      id: 'effy-id',
      slug: 'effy',
      nom_commercial: 'Effy',
      raison_sociale: 'Effy SAS',
      type: 'delegated',
      vague_priorite: 1,
      statut: 'partenaire',
      url_site: null,
      url_api_docs: null,
      operations_supportees: [],
      secteurs_couverts: ['residentiel'],
      coup_de_pouce_signataire: true,
      is_p6: true,
    }
    const client = createMockClientSimple([
      // Query A : aucun tagged sur BAR-TH-179
      { data: [], error: null },
      // Query B : tous les actifs — contient Effy avec operations_supportees=[]
      { data: [effy], error: null },
    ])
    const result = await getDelegatairesByOperation(client, 'BAR-TH-179')
    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe('effy')
  })

  it('dédup par id : même délégataire présent dans tagged ET catch-all = une seule entrée', async () => {
    const duplicate = {
      id: 'same-id',
      slug: 'duplicate',
      nom_commercial: 'Duplicate',
      raison_sociale: 'Duplicate',
      type: 'delegated',
      vague_priorite: 1,
      statut: 'partenaire',
      url_site: null,
      url_api_docs: null,
      operations_supportees: [],
      secteurs_couverts: ['residentiel'],
      coup_de_pouce_signataire: true,
      is_p6: true,
    }
    const client = createMockClientSimple([
      { data: [duplicate], error: null },
      { data: [duplicate], error: null },
    ])
    const result = await getDelegatairesByOperation(client, 'BAR-TH-179')
    expect(result).toHaveLength(1)
  })

  it('fail-open : retourne [] si la query tagged échoue', async () => {
    const client = createMockClientSimple([{ data: null, error: { message: 'boom' } }])
    const result = await getDelegatairesByOperation(client, 'BAR-EN-101')
    expect(result).toEqual([])
  })

  it('tri stable par vague_priorite puis nom', async () => {
    const tagged = [
      {
        id: 'u3',
        slug: 'hellio',
        nom_commercial: 'Hellio',
        raison_sociale: 'Hellio',
        type: 'delegated',
        vague_priorite: 2,
        statut: 'partenaire',
        url_site: null,
        url_api_docs: null,
        operations_supportees: ['BAR-TH-171'],
        secteurs_couverts: ['residentiel'],
        coup_de_pouce_signataire: false,
        is_p6: true,
      },
      {
        id: 'u4',
        slug: 'sonergia',
        nom_commercial: 'Sonergia',
        raison_sociale: 'Sonergia',
        type: 'delegated',
        vague_priorite: 1,
        statut: 'partenaire',
        url_site: null,
        url_api_docs: null,
        operations_supportees: ['BAR-TH-171'],
        secteurs_couverts: ['residentiel'],
        coup_de_pouce_signataire: true,
        is_p6: true,
      },
    ]
    const client = createMockClientSimple([
      { data: tagged, error: null },
      { data: [], error: null },
    ])
    const result = await getDelegatairesByOperation(client, 'BAR-TH-171')
    expect(result.map((d) => d.slug)).toEqual(['sonergia', 'hellio'])
  })
})
