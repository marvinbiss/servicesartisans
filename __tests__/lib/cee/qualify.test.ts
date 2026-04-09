/**
 * Tests unitaires — src/lib/cee/qualify.ts
 * ----------------------------------------
 * `qualifyDevisForCee` prend le client Supabase en paramètre → on builde un
 * mock chainable minimal (même pattern que delegataires.test.ts).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { qualifyDevisForCee } from '@/lib/cee/qualify'

// ---------------------------------------------------------------------------
// Mock Supabase builder — chainable thenable
// ---------------------------------------------------------------------------

interface MockResponse {
  data: unknown
  error: { message: string } | null
}

function createMockClient(responses: MockResponse[]) {
  let callIndex = 0

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

  return {
    from: vi.fn((table: string) => {
      expect(table).toBe('cee_operations')
      return buildChain()
    }),
  } as unknown as Parameters<typeof qualifyDevisForCee>[0]
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('qualifyDevisForCee — service slug valide', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retourne eligible=true avec 1 code quand le service match une seule opération', async () => {
    const client = createMockClient([{ data: [{ code: 'BAR-EN-101' }], error: null }])
    const result = await qualifyDevisForCee(client, 'isolation-combles')
    expect(result.eligible).toBe(true)
    expect(result.codes).toEqual(['BAR-EN-101'])
  })

  it('retourne plusieurs codes quand le service match plusieurs opérations', async () => {
    const client = createMockClient([
      {
        data: [{ code: 'BAR-TH-171' }, { code: 'BAR-TH-129' }, { code: 'BAR-TH-148' }],
        error: null,
      },
    ])
    const result = await qualifyDevisForCee(client, 'chauffagiste')
    expect(result.eligible).toBe(true)
    expect(result.codes).toEqual(['BAR-TH-171', 'BAR-TH-129', 'BAR-TH-148'])
  })
})

describe('qualifyDevisForCee — service slug non éligible', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retourne eligible=false + codes vides quand aucune opération ne match', async () => {
    const client = createMockClient([{ data: [], error: null }])
    const result = await qualifyDevisForCee(client, 'metier-inconnu')
    expect(result.eligible).toBe(false)
    expect(result.codes).toEqual([])
  })
})

describe('qualifyDevisForCee — entrées invalides (graceful)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retourne eligible=false pour un slug vide sans toucher à la DB', async () => {
    const client = createMockClient([])
    const result = await qualifyDevisForCee(client, '')
    expect(result.eligible).toBe(false)
    expect(result.codes).toEqual([])
    // from() ne doit même pas être appelé — short-circuit
    expect((client as unknown as { from: ReturnType<typeof vi.fn> }).from).not.toHaveBeenCalled()
  })

  it('retourne eligible=false pour un slug null/undefined (cast forcé, fallback propre)', async () => {
    const client = createMockClient([])
    // La signature est `string`, mais la fonction gère `!serviceSlug` → on teste le path.
    const result = await qualifyDevisForCee(client, null as unknown as string)
    expect(result.eligible).toBe(false)
    expect(result.codes).toEqual([])
  })
})

describe('qualifyDevisForCee — fail-open sur erreur DB', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retourne eligible=false quand Supabase renvoie une erreur', async () => {
    const client = createMockClient([{ data: null, error: { message: 'connection refused' } }])
    const result = await qualifyDevisForCee(client, 'isolation-combles')
    expect(result.eligible).toBe(false)
    expect(result.codes).toEqual([])
  })

  it('retourne eligible=false quand data est null sans erreur', async () => {
    const client = createMockClient([{ data: null, error: null }])
    const result = await qualifyDevisForCee(client, 'isolation-combles')
    expect(result.eligible).toBe(false)
    expect(result.codes).toEqual([])
  })
})

describe('qualifyDevisForCee — filtres SQL appliqués', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('appelle .eq("is_active", true), .eq("secteur", "residentiel") et .contains("services_slugs", [slug])', async () => {
    // On capture le chain pour inspecter les appels.
    const chain: Record<string, ReturnType<typeof vi.fn>> = {}
    const methods = ['select', 'eq', 'contains']
    for (const m of methods) {
      chain[m] = vi.fn(() => chain)
    }
    ;(chain as unknown as { then: unknown }).then = (onFulfilled: (v: MockResponse) => unknown) =>
      Promise.resolve({ data: [{ code: 'BAR-EN-101' }], error: null }).then(onFulfilled)

    const client = {
      from: vi.fn(() => chain),
    } as unknown as Parameters<typeof qualifyDevisForCee>[0]

    await qualifyDevisForCee(client, 'isolation-combles')

    expect(chain.select).toHaveBeenCalledWith('code')
    expect(chain.eq).toHaveBeenCalledWith('is_active', true)
    expect(chain.eq).toHaveBeenCalledWith('secteur', 'residentiel')
    expect(chain.contains).toHaveBeenCalledWith('services_slugs', ['isolation-combles'])
  })
})
