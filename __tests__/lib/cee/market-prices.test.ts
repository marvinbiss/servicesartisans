/**
 * Tests unitaires — src/lib/cee/market-prices.ts
 * ------------------------------------------------
 * `getLatestCeePrices` : lecture DB avec cache memoire + fallback constantes.
 * `invalidateCeePricesCache` : reset du cache.
 *
 * Mock Supabase chainable (meme pattern que qualify.test.ts).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getLatestCeePrices,
  invalidateCeePricesCache,
  CEE_PRICE_CLASSIQUE_FALLBACK,
  CEE_PRICE_PRECARITE_FALLBACK,
} from '@/lib/cee/market-prices'

// ---------------------------------------------------------------------------
// Mock logger (evite les console.warn pendant les tests)
// ---------------------------------------------------------------------------

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

// ---------------------------------------------------------------------------
// Mock Supabase builder — chainable thenable
// ---------------------------------------------------------------------------

interface MockResponse {
  data: unknown
  error: { message: string } | null
}

function createMockClient(response: MockResponse) {
  const chain: Record<string, unknown> = {}
  const methods = ['select', 'eq', 'order', 'limit', 'range', 'in', 'contains']
  for (const m of methods) {
    chain[m] = vi.fn(() => chain)
  }
  chain.then = (onFulfilled: (v: MockResponse) => unknown, onRejected?: (e: unknown) => unknown) =>
    Promise.resolve(response).then(onFulfilled, onRejected)

  const from = vi.fn(() => chain)
  return { from, _chain: chain } as unknown as {
    from: ReturnType<typeof vi.fn>
    _chain: Record<string, unknown>
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('getLatestCeePrices', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Toujours invalider le cache entre les tests
    invalidateCeePricesCache()
  })

  it('retourne les prix depuis la DB quand la requete reussit', async () => {
    const client = createMockClient({
      data: [
        { price_type: 'classique', eur_per_mwhc: 8.5 },
        { price_type: 'precarite', eur_per_mwhc: 14.2 },
      ],
      error: null,
    })

    const prices = await getLatestCeePrices(client as never)
    expect(prices.classique).toBe(8.5)
    expect(prices.precarite).toBe(14.2)
    expect(client.from).toHaveBeenCalledWith('cee_market_prices')
  })

  it('utilise le cache au 2e appel (Supabase appele une seule fois)', async () => {
    const client = createMockClient({
      data: [
        { price_type: 'classique', eur_per_mwhc: 8.5 },
        { price_type: 'precarite', eur_per_mwhc: 14.2 },
      ],
      error: null,
    })

    const first = await getLatestCeePrices(client as never)
    const second = await getLatestCeePrices(client as never)

    expect(first).toEqual(second)
    // from() ne doit etre appele qu'une seule fois (cache hit au 2e appel)
    expect(client.from).toHaveBeenCalledTimes(1)
  })

  it('fallback sur les constantes si erreur DB', async () => {
    const client = createMockClient({
      data: null,
      error: { message: 'relation does not exist' },
    })

    const prices = await getLatestCeePrices(client as never)
    expect(prices.classique).toBe(CEE_PRICE_CLASSIQUE_FALLBACK)
    expect(prices.precarite).toBe(CEE_PRICE_PRECARITE_FALLBACK)
  })

  it('fallback sur les constantes si data est vide', async () => {
    const client = createMockClient({
      data: [],
      error: null,
    })

    const prices = await getLatestCeePrices(client as never)
    expect(prices.classique).toBe(CEE_PRICE_CLASSIQUE_FALLBACK)
    expect(prices.precarite).toBe(CEE_PRICE_PRECARITE_FALLBACK)
  })

  it('fallback partiel : utilise la constante si un seul type est present', async () => {
    const client = createMockClient({
      data: [{ price_type: 'classique', eur_per_mwhc: 7.0 }],
      error: null,
    })

    const prices = await getLatestCeePrices(client as never)
    expect(prices.classique).toBe(7.0)
    expect(prices.precarite).toBe(CEE_PRICE_PRECARITE_FALLBACK)
  })

  it('invalidateCeePricesCache force un re-fetch', async () => {
    const client = createMockClient({
      data: [
        { price_type: 'classique', eur_per_mwhc: 8.5 },
        { price_type: 'precarite', eur_per_mwhc: 14.2 },
      ],
      error: null,
    })

    // Premier appel — remplit le cache
    await getLatestCeePrices(client as never)
    expect(client.from).toHaveBeenCalledTimes(1)

    // Invalide le cache
    invalidateCeePricesCache()

    // Deuxieme appel — doit re-fetcher
    await getLatestCeePrices(client as never)
    expect(client.from).toHaveBeenCalledTimes(2)
  })

  it('fallback sur les constantes si exception (fail-open)', async () => {
    // Client qui throw au lieu de retourner normalement
    const client = {
      from: vi.fn(() => {
        throw new Error('network timeout')
      }),
    }

    const prices = await getLatestCeePrices(client as never)
    expect(prices.classique).toBe(CEE_PRICE_CLASSIQUE_FALLBACK)
    expect(prices.precarite).toBe(CEE_PRICE_PRECARITE_FALLBACK)
  })
})
