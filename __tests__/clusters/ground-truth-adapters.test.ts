import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

import { createAdminClient } from '@/lib/supabase/admin'
import {
  __testing,
  assembleGroundTruth,
  getCeeFactsForServiceSlug,
  getMprFactsForServiceSlug,
  getRgeFactsForServiceSlug,
} from '@/lib/clusters/ground-truth-adapters'

const mockedAdmin = vi.mocked(createAdminClient)

describe('ground-truth-adapters / MPR (sync)', () => {
  it('returns barème entries for pompe-a-chaleur', () => {
    const facts = getMprFactsForServiceSlug('pompe-a-chaleur')
    expect(facts.length).toBeGreaterThan(3)
    expect(facts.some((f) => f.includes('air/eau'))).toBe(true)
    expect(facts.some((f) => f.includes('géothermique'))).toBe(true)
    expect(facts.every((f) => f.includes('source:'))).toBe(true)
  })

  it('returns empty for unknown service', () => {
    expect(getMprFactsForServiceSlug('inexistant-zz')).toEqual([])
  })

  it('returns empty for null service', () => {
    expect(getMprFactsForServiceSlug(null)).toEqual([])
  })

  it('skips entries with 0 EUR (rose exclu)', () => {
    const facts = getMprFactsForServiceSlug('pompe-a-chaleur')
    expect(facts.every((f) => !/: 0 EUR/.test(f))).toBe(true)
  })

  it('SERVICE_TO_GESTES maps known service slugs', () => {
    expect(__testing.SERVICE_TO_GESTES['pompe-a-chaleur']).toContain('pac_air_eau')
    expect(__testing.SERVICE_TO_GESTES['isolation-thermique']).toContain('isolation_combles')
  })
})

describe('ground-truth-adapters / CEE (async DB)', () => {
  it('queries cee_operations and formats output', async () => {
    const mockData = [
      {
        code: 'BAR-TH-148',
        nom: 'Chauffe-eau thermodynamique',
        coup_de_pouce: true,
        url_fiche_officielle: 'https://example.gouv.fr/bar-th-148',
      },
      {
        code: 'BAR-TH-129',
        nom: 'PAC air/eau',
        coup_de_pouce: false,
        url_fiche_officielle: null,
      },
    ]
    const limitMock = vi.fn().mockResolvedValue({ data: mockData })
    const orderMock = vi.fn().mockReturnValue({ limit: limitMock })
    const eqMock = vi.fn().mockReturnValue({ order: orderMock })
    const containsMock = vi.fn().mockReturnValue({ eq: eqMock })
    const selectMock = vi.fn().mockReturnValue({ contains: containsMock })
    mockedAdmin.mockReturnValue({
      from: vi.fn().mockReturnValue({ select: selectMock }),
    } as never)

    const facts = await getCeeFactsForServiceSlug('chauffe-eau-thermodynamique')
    expect(facts.length).toBe(2)
    expect(facts[0]).toContain('BAR-TH-148')
    expect(facts[0]).toContain('[Coup de pouce ACTIF]')
    expect(facts[0]).toContain('example.gouv.fr/bar-th-148')
    expect(facts[1]).not.toContain('[Coup de pouce ACTIF]')
  })

  it('returns empty for null service', async () => {
    expect(await getCeeFactsForServiceSlug(null)).toEqual([])
  })
})

describe('ground-truth-adapters / RGE (async DB count)', () => {
  it('formats count with fr-FR thousands separator', async () => {
    const notMock = vi.fn().mockResolvedValue({ count: 49228 })
    const eqMock = vi.fn().mockReturnValue({ not: notMock })
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
    mockedAdmin.mockReturnValue({
      from: vi.fn().mockReturnValue({ select: selectMock }),
    } as never)

    const facts = await getRgeFactsForServiceSlug('pompe-a-chaleur')
    expect(facts.length).toBe(1)
    expect(facts[0]).toMatch(/49\s?228/)
    expect(facts[0]).toContain('RGE registry ADEME')
    expect(facts[0]).toContain('source: registre RGE ADEME')
  })

  it('returns empty when count is null', async () => {
    const notMock = vi.fn().mockResolvedValue({ count: null })
    const eqMock = vi.fn().mockReturnValue({ not: notMock })
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
    mockedAdmin.mockReturnValue({
      from: vi.fn().mockReturnValue({ select: selectMock }),
    } as never)

    expect(await getRgeFactsForServiceSlug('pompe-a-chaleur')).toEqual([])
  })
})

describe('ground-truth-adapters / assembleGroundTruth', () => {
  it('aggregates MPR sync + CEE async + RGE async', async () => {
    const ceeLimitMock = vi.fn().mockResolvedValue({ data: [] })
    const ceeOrderMock = vi.fn().mockReturnValue({ limit: ceeLimitMock })
    const ceeEqMock = vi.fn().mockReturnValue({ order: ceeOrderMock })
    const ceeContainsMock = vi.fn().mockReturnValue({ eq: ceeEqMock })

    const rgeNotMock = vi.fn().mockResolvedValue({ count: 12000 })
    const rgeEqMock = vi.fn().mockReturnValue({ not: rgeNotMock })

    const fromMock = vi.fn((table: string) => {
      if (table === 'cee_operations') {
        return { select: vi.fn().mockReturnValue({ contains: ceeContainsMock }) }
      }
      if (table === 'providers') {
        return { select: vi.fn().mockReturnValue({ eq: rgeEqMock }) }
      }
      throw new Error(`Unexpected table: ${table}`)
    })
    mockedAdmin.mockReturnValue({ from: fromMock } as never)

    const gt = await assembleGroundTruth('pompe-a-chaleur', '2026-05-21')
    expect(gt.freshness).toBe('2026-05-21')
    expect((gt.mprBareme ?? []).length).toBeGreaterThan(0)
    expect(gt.ceeForfaits).toEqual([])
    expect((gt.rgeStats ?? []).length).toBe(1)
  })
})
