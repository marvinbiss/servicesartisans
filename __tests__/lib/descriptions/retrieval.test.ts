import { describe, it, expect, vi, beforeEach } from 'vitest'

type MockRow = {
  id: string
  name: string | null
  slug: string | null
  address_city: string | null
  address_region: string | null
  specialty: string | null
  claimed_at: string | null
  description: string | null
  rge_qualifications: unknown
  rge_valid_until: string | null
  is_active: boolean | null
}

let mockRows: MockRow[] = []
let lastIdsQueried: string[] | null = null

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'provider_insee_enrichment' || table === 'communes') {
        // Tests don't exercise enrichment/commune joins — return empty.
        return {
          select() {
            return this
          },
          in(_col: string, _ids: string[]) {
            return this
          },
          returns<T = unknown[]>() {
            return {
              then: (resolve: (v: { data: T; error: null }) => unknown) =>
                resolve({ data: [] as unknown as T, error: null }),
            }
          },
        }
      }
      if (table !== 'providers') throw new Error(`unexpected table ${table}`)
      const stub = {
        _id: null as string | null,
        _ids: null as string[] | null,
        select() {
          return this
        },
        eq(_col: string, val: string) {
          this._id = val
          return this
        },
        in(_col: string, ids: string[]) {
          this._ids = ids
          lastIdsQueried = ids
          return this
        },
        async maybeSingle<T = MockRow>() {
          const row = mockRows.find((r) => r.id === this._id) ?? null
          return { data: row as T | null, error: null }
        },
        returns<T = MockRow[]>() {
          return {
            then: (resolve: (v: { data: T; error: null }) => unknown) => {
              const rows = mockRows.filter((r) => this._ids?.includes(r.id))
              return resolve({ data: rows as unknown as T, error: null })
            },
          }
        },
      }
      return stub
    },
  }),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

import { fetchProviderContext, fetchProviderContextsBatch } from '@/lib/descriptions/retrieval'
import type { ProviderContext } from '@/lib/descriptions/prompts/rge-description-v1'

const futureDate = '2030-12-31'
const pastDate = '2020-01-01'

const makeRow = (overrides: Partial<MockRow> = {}): MockRow => ({
  id: 'p1',
  name: 'Entreprise Dupont',
  slug: 'entreprise-dupont',
  address_city: 'Lyon',
  address_region: 'Auvergne-Rhône-Alpes',
  specialty: 'Plomberie chauffage',
  claimed_at: null,
  description: 'Baseline.',
  rge_qualifications: [
    {
      code: '5911',
      nom: 'QualiPAC',
      organisme: "Qualit'EnR",
      domaine: 'Chauffage',
      meta_domaine: 'Solutions thermiques',
      date_debut: '2025-01-01',
      date_fin: futureDate,
    },
  ],
  rge_valid_until: futureDate,
  is_active: true,
  ...overrides,
})

const expectCtx = (ctx: ProviderContext | null): ProviderContext => {
  if (ctx === null) throw new Error('expected non-null ProviderContext')
  return ctx
}

describe('fetchProviderContext', () => {
  beforeEach(() => {
    mockRows = []
    lastIdsQueried = null
  })

  it('returns null when provider is not eligible (is_active=false)', async () => {
    mockRows = [makeRow({ is_active: false })]
    const ctx = await fetchProviderContext('p1')
    expect(ctx).toBeNull()
  })

  it('returns null when RGE has expired', async () => {
    mockRows = [makeRow({ rge_valid_until: pastDate })]
    const ctx = await fetchProviderContext('p1')
    expect(ctx).toBeNull()
  })

  it('returns null when provider is missing', async () => {
    const ctx = await fetchProviderContext('does-not-exist')
    expect(ctx).toBeNull()
  })

  it('returns a grounded ProviderContext for eligible provider', async () => {
    mockRows = [makeRow()]
    const ctx = expectCtx(await fetchProviderContext('p1'))
    expect(ctx.name).toBe('Entreprise Dupont')
    expect(ctx.address_city).toBe('Lyon')
    expect(ctx.rge_qualifications).toEqual(['QualiPAC'])
    expect(ctx.ademe_categories).toEqual(['Chauffage'])
    expect(ctx.ademe_meta_domains).toEqual(['Solutions thermiques'])
    expect(ctx.rge_valid_until).toBe(futureDate)
  })

  it('dedupes duplicate qualifications by name (case-insensitive)', async () => {
    mockRows = [
      makeRow({
        rge_qualifications: [
          { code: '5911', nom: 'QualiPAC', domaine: 'Chauffage', meta_domaine: 'A' },
          { code: '5911bis', nom: 'QualiPAC', domaine: 'Chauffage', meta_domaine: 'A' },
          { code: '7131', nom: 'Qualibat', domaine: 'Isolation', meta_domaine: 'B' },
        ],
      }),
    ]
    const ctx = expectCtx(await fetchProviderContext('p1'))
    expect(ctx.rge_qualifications).toEqual(['QualiPAC', 'Qualibat'])
    expect(ctx.ademe_categories).toEqual(['Chauffage', 'Isolation'])
    expect(ctx.ademe_meta_domains).toEqual(['A', 'B'])
  })

  it('skips rows without name or slug', async () => {
    mockRows = [makeRow({ name: null })]
    const ctx = await fetchProviderContext('p1')
    expect(ctx).toBeNull()
  })

  it('truncates baseline_text beyond 2000 chars', async () => {
    const longText = 'x'.repeat(2500)
    mockRows = [makeRow({ description: longText })]
    const ctx = expectCtx(await fetchProviderContext('p1'))
    expect(ctx.baseline_text).not.toBeNull()
    expect(ctx.baseline_text?.length).toBe(2000)
  })

  it('normalises ISO date to YYYY-MM-DD for rge_valid_until', async () => {
    mockRows = [makeRow({ rge_valid_until: `${futureDate}T12:34:56Z` })]
    const ctx = expectCtx(await fetchProviderContext('p1'))
    expect(ctx.rge_valid_until).toBe(futureDate)
  })

  it('restores missing accents in RGE qualifications (ADEME data fix)', async () => {
    mockRows = [
      makeRow({
        rge_qualifications: [
          {
            nom: 'QualiPAC Chauffage - Pose de pompe  chaleur (PAC arothermique ou gothermique)',
            domaine: 'Pompe  chaleur : chauffage',
            meta_domaine: "Installations d'nergies renouvelables",
          },
          {
            nom: 'Qualibois - Pose de chaudire bois et pole',
            domaine: 'Chaudire bois',
            meta_domaine: "Installations d'nergies renouvelables",
          },
          {
            nom: 'QualiPV - Pose de gnrateur photovoltaque raccord au rseau',
            domaine: 'Panneau photovoltaque',
            meta_domaine: "Installations d'nergies renouvelables",
          },
        ],
      }),
    ]
    const ctx = expectCtx(await fetchProviderContext('p1'))
    expect(ctx.rge_qualifications[0]).toMatch(/pompe à chaleur/)
    expect(ctx.rge_qualifications[0]).toMatch(/aérothermique/)
    expect(ctx.rge_qualifications[0]).toMatch(/géothermique/)
    expect(ctx.rge_qualifications[1]).toMatch(/chaudière/)
    expect(ctx.rge_qualifications[1]).toMatch(/poêle/)
    expect(ctx.rge_qualifications[2]).toMatch(/générateur/)
    expect(ctx.rge_qualifications[2]).toMatch(/photovoltaïque/)
    expect(ctx.rge_qualifications[2]).toMatch(/réseau/)
    expect(ctx.ademe_meta_domains[0]).toBe("Installations d'énergies renouvelables")
  })

  it('does not double-apply accent fixes on already-correct text', async () => {
    mockRows = [
      makeRow({
        rge_qualifications: [
          {
            nom: 'Test',
            domaine: 'Chauffage',
            meta_domaine: "Installations d'énergies renouvelables",
          },
        ],
      }),
    ]
    const ctx = expectCtx(await fetchProviderContext('p1'))
    expect(ctx.ademe_meta_domains[0]).toBe("Installations d'énergies renouvelables")
    expect(ctx.ademe_meta_domains[0]).not.toMatch(/éé/)
  })

  it('falls back to ADEME meta_domain when DB specialty conflicts with qualifs', async () => {
    mockRows = [
      makeRow({
        specialty: 'plombier',
        rge_qualifications: [
          {
            nom: 'Test',
            domaine: 'Fenêtres de toit',
            meta_domaine: "Travaux d'efficacité énergétique",
          },
        ],
      }),
    ]
    const ctx = expectCtx(await fetchProviderContext('p1'))
    expect(ctx.specialty).toBe("Travaux d'efficacité énergétique")
  })

  it('keeps DB specialty when it aligns with the qualifs', async () => {
    mockRows = [
      makeRow({
        specialty: 'Chauffage',
        rge_qualifications: [{ nom: 'QualiPAC', domaine: 'Chauffage', meta_domaine: 'Chauffage' }],
      }),
    ]
    const ctx = expectCtx(await fetchProviderContext('p1'))
    expect(ctx.specialty).toBe('Chauffage')
  })
})

describe('fetchProviderContextsBatch', () => {
  beforeEach(() => {
    mockRows = []
    lastIdsQueried = null
  })

  it('returns an empty map for an empty input array without hitting the DB', async () => {
    const map = await fetchProviderContextsBatch([])
    expect(map.size).toBe(0)
    expect(lastIdsQueried).toBeNull()
  })

  it('returns a Map keyed by provider_id containing only eligible rows', async () => {
    mockRows = [
      makeRow({ id: 'p1' }),
      makeRow({ id: 'p2', is_active: false }),
      makeRow({ id: 'p3', rge_valid_until: pastDate }),
      makeRow({ id: 'p4' }),
    ]
    const map = await fetchProviderContextsBatch(['p1', 'p2', 'p3', 'p4'])
    expect(map.size).toBe(2)
    expect(map.has('p1')).toBe(true)
    expect(map.has('p4')).toBe(true)
    expect(map.has('p2')).toBe(false)
    expect(map.has('p3')).toBe(false)
  })
})
