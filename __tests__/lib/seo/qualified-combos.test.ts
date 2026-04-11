/**
 * Tests unitaires — getQualifiedServiceCityCombos()
 * --------------------------------------------------
 * Vérifie la reverse lookup specialty→service + address_city→ville,
 * dont le cas arrondissement (Paris/Lyon/Marseille) qui sinon prune
 * à tort ~500 combos de sitemap alors qu'elles ont des providers.
 *
 * Stratégie : mock de `createAdminClient` + `SERVICE_TO_SPECIALTIES` +
 * `villes` pour isoler la logique pure. Une seule page DB (data.length <
 * pageSize) pour éviter de tester la pagination.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks (hoisted)
// ---------------------------------------------------------------------------

vi.mock('@/lib/supabase', () => ({
  SERVICE_TO_SPECIALTIES: {
    plombier: ['plombier'],
    electricien: ['electricien'],
    'peintre-en-batiment': ['peintre', 'peintre-en-batiment'],
    peintre: ['peintre', 'peintre-en-batiment'],
  },
}))

vi.mock('@/lib/data/france', () => ({
  villes: [
    { slug: 'paris', name: 'Paris' },
    { slug: 'lyon', name: 'Lyon' },
    { slug: 'marseille', name: 'Marseille' },
    { slug: 'toulouse', name: 'Toulouse' },
    { slug: 'saint-etienne', name: 'Saint-Étienne' },
  ],
}))

type Row = { specialty: string | null; address_city: string | null }

let mockRows: Row[] = []
let mockError: { message: string } | null = null

type Chain = {
  select: () => Chain
  eq: () => Chain
  not: () => Chain
  range: () => Promise<{ data: Row[]; error: { message: string } | null }>
}

function makeChainable(): Chain {
  const resolver = () => Promise.resolve({ data: mockRows, error: mockError })
  const chain: Chain = {
    select: () => chain,
    eq: () => chain,
    not: () => chain,
    range: resolver,
  }
  return chain
}

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => makeChainable(),
  }),
}))

// ---------------------------------------------------------------------------
// Import AFTER mocks
// ---------------------------------------------------------------------------

import { getQualifiedServiceCityCombos } from '@/lib/seo/lastmod-queries'

async function getCombos(): Promise<Set<string>> {
  const combos = await getQualifiedServiceCityCombos()
  if (!combos) throw new Error('combos should not be null in this test')
  return combos
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockRows = []
  mockError = null
})

describe('getQualifiedServiceCityCombos — direct match', () => {
  it('mappe plombier + Paris → plombier::paris', async () => {
    mockRows = [{ specialty: 'plombier', address_city: 'Paris' }]
    const combos = await getCombos()
    expect(combos.has('plombier::paris')).toBe(true)
    expect(combos.size).toBe(1)
  })

  it('mappe electricien + Toulouse → electricien::toulouse', async () => {
    mockRows = [{ specialty: 'electricien', address_city: 'Toulouse' }]
    const combos = await getCombos()
    expect(combos.has('electricien::toulouse')).toBe(true)
  })

  it('gère les accents : Saint-Étienne → saint-etienne', async () => {
    mockRows = [{ specialty: 'plombier', address_city: 'Saint-Étienne' }]
    const combos = await getCombos()
    expect(combos.has('plombier::saint-etienne')).toBe(true)
  })
})

describe('getQualifiedServiceCityCombos — arrondissements', () => {
  it('Paris 18e arrondissement → plombier::paris', async () => {
    mockRows = [{ specialty: 'plombier', address_city: 'Paris 18e arrondissement' }]
    const combos = await getCombos()
    expect(combos.has('plombier::paris')).toBe(true)
  })

  it('Paris 1er → plombier::paris', async () => {
    mockRows = [{ specialty: 'plombier', address_city: 'Paris 1er' }]
    const combos = await getCombos()
    expect(combos.has('plombier::paris')).toBe(true)
  })

  it('Lyon 3e → plombier::lyon', async () => {
    mockRows = [{ specialty: 'plombier', address_city: 'Lyon 3e' }]
    const combos = await getCombos()
    expect(combos.has('plombier::lyon')).toBe(true)
  })

  it('Marseille 15e arrondissement → plombier::marseille', async () => {
    mockRows = [{ specialty: 'plombier', address_city: 'Marseille 15e arrondissement' }]
    const combos = await getCombos()
    expect(combos.has('plombier::marseille')).toBe(true)
  })

  it('agrège plusieurs arrondissements sous le même slug', async () => {
    mockRows = [
      { specialty: 'plombier', address_city: 'Paris 1er' },
      { specialty: 'plombier', address_city: 'Paris 18e arrondissement' },
      { specialty: 'plombier', address_city: 'Paris' },
    ]
    const combos = await getCombos()
    expect(combos.size).toBe(1)
    expect(combos.has('plombier::paris')).toBe(true)
  })
})

describe('getQualifiedServiceCityCombos — aliases specialty', () => {
  it('peintre (alias) et peintre-en-batiment mappent sur le même combo', async () => {
    mockRows = [
      { specialty: 'peintre', address_city: 'Lyon' },
      { specialty: 'peintre-en-batiment', address_city: 'Lyon' },
    ]
    const combos = await getCombos()
    expect(combos.size).toBeGreaterThanOrEqual(1)
    const hasPeintreLyon = combos.has('peintre::lyon') || combos.has('peintre-en-batiment::lyon')
    expect(hasPeintreLyon).toBe(true)
  })
})

describe('getQualifiedServiceCityCombos — entrées ignorées', () => {
  it('ignore specialty inconnue', async () => {
    mockRows = [{ specialty: 'astronaute', address_city: 'Paris' }]
    const combos = await getCombos()
    expect(combos.size).toBe(0)
  })

  it('ignore ville inconnue', async () => {
    mockRows = [{ specialty: 'plombier', address_city: 'Pétaouchnok' }]
    const combos = await getCombos()
    expect(combos.size).toBe(0)
  })

  it('ignore les rows avec specialty null', async () => {
    mockRows = [{ specialty: null, address_city: 'Paris' }]
    const combos = await getCombos()
    expect(combos.size).toBe(0)
  })

  it('ignore les rows avec address_city null', async () => {
    mockRows = [{ specialty: 'plombier', address_city: null }]
    const combos = await getCombos()
    expect(combos.size).toBe(0)
  })
})

describe('getQualifiedServiceCityCombos — fail-open', () => {
  it('retourne null si la requête échoue', async () => {
    mockError = { message: 'network error' }
    const combos = await getQualifiedServiceCityCombos()
    expect(combos).toBeNull()
  })

  it('retourne un Set vide (pas null) si la DB est vide', async () => {
    mockRows = []
    const combos = await getCombos()
    expect(combos.size).toBe(0)
  })
})
