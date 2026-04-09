/**
 * Tests unitaires pour src/lib/cee/delegataires.ts (brique 1 bis mandataire CEE).
 *
 * Stratégie : `listActiveDelegataires` et `getDelegatairesByOperation` reçoivent
 * le client Supabase en paramètre — on peut donc builder un mock chainable minimal
 * sans devoir mocker le module `@/lib/supabase`.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  listActiveDelegataires,
  getDelegatairesByOperation,
} from '@/lib/cee/delegataires'

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
function createMockClient(responses: MockResponse[]) {
  let callIndex = 0

  const buildChain = () => {
    const next: MockResponse = responses[callIndex] ?? { data: [], error: null }
    callIndex++

    // Un thenable chainable où chaque méthode retourne this, et `.then`
    // résout avec la réponse courante.
    const chain: Record<string, unknown> = {}
    const methods = [
      'select',
      'in',
      'eq',
      'contains',
      'order',
      'range',
      'limit',
    ]
    for (const m of methods) {
      chain[m] = vi.fn(() => chain)
    }
    // PromiseLike
    chain.then = (
      onFulfilled: (v: MockResponse) => unknown,
      onRejected?: (e: unknown) => unknown,
    ) => Promise.resolve(next).then(onFulfilled, onRejected)
    return chain
  }

  return {
    from: vi.fn((table: string) => {
      expect(table).toBe('cee_delegataires')
      return buildChain()
    }),
  } as unknown as Parameters<typeof listActiveDelegataires>[0]
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
        raison_sociale: 'Economie d\'Energie SAS',
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
    const client = createMockClient([{ data: fake, error: null }])
    const result = await listActiveDelegataires(client)
    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe('effy')
    expect(result[0].vague_priorite).toBe(1)
  })

  it('fail-open : retourne [] si la DB renvoie une erreur', async () => {
    const client = createMockClient([
      { data: null, error: { message: 'connection refused' } },
    ])
    const result = await listActiveDelegataires(client)
    expect(result).toEqual([])
  })

  it('retourne [] si data est null', async () => {
    const client = createMockClient([{ data: null, error: null }])
    const result = await listActiveDelegataires(client)
    expect(result).toEqual([])
  })
})

describe('getDelegatairesByOperation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('merge les tagged + catch-all et déduplique par slug', async () => {
    const tagged = [
      {
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
      },
    ]
    const catchAll = [
      {
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
      },
      // Doublon sur sonergia — doit être dédupliqué
      {
        id: 'u1',
        slug: 'sonergia',
        nom_commercial: 'Sonergia',
        raison_sociale: 'Sonergia',
        type: 'delegated',
        vague_priorite: 1,
        statut: 'partenaire',
        url_site: null,
        url_api_docs: null,
        operations_supportees: [],
        secteurs_couverts: ['residentiel'],
        coup_de_pouce_signataire: true,
        is_p6: true,
      },
    ]
    const client = createMockClient([
      { data: tagged, error: null },
      { data: catchAll, error: null },
    ])
    const result = await getDelegatairesByOperation(client, 'BAR-EN-101')
    expect(result).toHaveLength(2)
    // Trié alphabétiquement à vague égale → Effy avant Sonergia
    expect(result[0].slug).toBe('effy')
    expect(result[1].slug).toBe('sonergia')
  })

  it('fail-open : retourne [] si la query tagged échoue', async () => {
    const client = createMockClient([
      { data: null, error: { message: 'boom' } },
    ])
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
    const client = createMockClient([
      { data: tagged, error: null },
      { data: [], error: null },
    ])
    const result = await getDelegatairesByOperation(client, 'BAR-TH-171')
    expect(result.map((d) => d.slug)).toEqual(['sonergia', 'hellio'])
  })
})
