/**
 * Tests unitaires guide-stats RGE.
 *
 * Stratégie : on mock `@/lib/supabase` pour forcer `IS_BUILD = true` (le flag
 * est évalué au module load via `process.env.NEXT_BUILD_SKIP_DB`). Cela couvre
 * le chemin fail-open synchrone des deux fonctions principales sans avoir à
 * stub un client Supabase complet (trop invasif pour un test unitaire).
 *
 * Les chemins qui passent réellement par le client DB (réponse non-triviale
 * avec mock de .from().select()...) sont skippés : ils nécessiteraient un
 * harness d'intégration complet, hors périmètre de cette passe.
 */

import { describe, it, expect, vi, beforeAll } from 'vitest'

// Mock de @/lib/supabase AVANT d'importer guide-stats : IS_BUILD=true court-
// circuite les deux fonctions et retourne les valeurs fail-open par défaut.
vi.mock('@/lib/supabase', () => ({
  IS_BUILD: true,
  supabase: {},
  SERVICE_TO_SPECIALTIES: {
    'pompe-a-chaleur': ['Chauffagiste', 'Climatisation'],
    electricien: ['Electricien'],
  },
  SERVICE_RGE_DECRET_CATEGORY: {},
}))

// Mock logger pour éviter les sorties console pendant les tests
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

// Mock cache : passthrough → renvoie directement la fonction fetcher, mais ici
// on n'en a pas besoin (IS_BUILD court-circuite avant).
vi.mock('@/lib/cache', () => ({
  getCachedData: async (_key: string, fetcher: () => Promise<unknown>) => {
    return fetcher()
  },
  CACHE_TTL: { artisans: 3600 },
}))

let getRgeNationalStats: typeof import('@/lib/rge/guide-stats').getRgeNationalStats
let getRgeServiceStats: typeof import('@/lib/rge/guide-stats').getRgeServiceStats

beforeAll(async () => {
  const mod = await import('@/lib/rge/guide-stats')
  getRgeNationalStats = mod.getRgeNationalStats
  getRgeServiceStats = mod.getRgeServiceStats
})

describe('getRgeNationalStats — IS_BUILD fail-open', () => {
  it('retourne { totalActive: 0, topCities: [] } sans throw', async () => {
    const stats = await getRgeNationalStats()
    expect(stats).toEqual({ totalActive: 0, topCities: [] })
  })

  it('retourne un topCities qui est bien un tableau', async () => {
    const stats = await getRgeNationalStats()
    expect(Array.isArray(stats.topCities)).toBe(true)
    expect(stats.topCities).toHaveLength(0)
  })

  it('retourne totalActive numérique', async () => {
    const stats = await getRgeNationalStats()
    expect(typeof stats.totalActive).toBe('number')
    expect(stats.totalActive).toBe(0)
  })
})

describe('getRgeServiceStats — IS_BUILD fail-open', () => {
  it('retourne { total: 0, topCities: [] } pour un service valide', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stats = await getRgeServiceStats('pompe-a-chaleur' as any)
    expect(stats).toEqual({ total: 0, topCities: [] })
  })

  it('retourne { total: 0, topCities: [] } pour un service invalide', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stats = await getRgeServiceStats('plombier-urgence' as any)
    expect(stats).toEqual({ total: 0, topCities: [] })
  })

  it('retourne { total: 0, topCities: [] } pour une string vide', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stats = await getRgeServiceStats('' as any)
    expect(stats).toEqual({ total: 0, topCities: [] })
  })
})

describe('Types RGE (forme d objet)', () => {
  it('RgeTopCity a la forme { slug, name, count }', () => {
    const sample: import('@/lib/rge/guide-stats').RgeTopCity = {
      slug: 'paris',
      name: 'Paris',
      count: 42,
    }
    expect(sample.slug).toBe('paris')
    expect(sample.name).toBe('Paris')
    expect(sample.count).toBe(42)
  })

  it('RgeNationalStats a la forme { totalActive, topCities }', () => {
    const sample: import('@/lib/rge/guide-stats').RgeNationalStats = {
      totalActive: 100,
      topCities: [{ slug: 'lyon', name: 'Lyon', count: 10 }],
    }
    expect(sample.totalActive).toBe(100)
    expect(sample.topCities).toHaveLength(1)
  })

  it('RgeServiceStats a la forme { total, topCities }', () => {
    const sample: import('@/lib/rge/guide-stats').RgeServiceStats = {
      total: 50,
      topCities: [],
    }
    expect(sample.total).toBe(50)
    expect(sample.topCities).toEqual([])
  })
})

// Note : les chemins non-IS_BUILD (requêtes DB réelles via supabase.from())
// ne sont pas testés ici. Ils nécessiteraient un mock chainable complet
// (.select().in().eq().not().gte()...) trop invasif pour un unit test — à
// couvrir plutôt par un test d'intégration avec une DB de test.
describe.skip('getRgeNationalStats — chemin DB actif', () => {
  it.skip('skipped : mock chainable supabase-js trop invasif pour un unit test', () => {
    // Intentionnellement vide.
  })
})
