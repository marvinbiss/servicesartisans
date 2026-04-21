import { describe, it, expect } from 'vitest'
import { aggregate, slugifyRegion, validYearMonth, type ProviderRow } from './rge-aggregate'

const FIXED_NOW = new Date('2026-04-20T08:00:00.000Z')

function mkRow(partial: Partial<ProviderRow>, i = 0): ProviderRow {
  return {
    id: `p-${i}`,
    specialty: null,
    address_region: null,
    rge_qualifications: null,
    rge_valid_until: null,
    rge_organismes: null,
    ...partial,
  }
}

describe('validYearMonth', () => {
  it.each([
    ['2026-01', true],
    ['2026-12', true],
    ['2026-00', false],
    ['2026-13', false],
    ['26-04', false],
    ['2026/04', false],
    ['2026-4', false],
    ['', false],
  ])('validYearMonth(%s) = %s', (input, expected) => {
    expect(validYearMonth(input)).toBe(expected)
  })
})

describe('slugifyRegion', () => {
  it('normalises accents and spaces', () => {
    expect(slugifyRegion('Île-de-France')).toBe('ile-de-france')
    expect(slugifyRegion('Provence-Alpes-Côte d’Azur')).toBe('provence-alpes-cote-d-azur')
    expect(slugifyRegion('  Grand Est ')).toBe('grand-est')
  })
})

describe('aggregate', () => {
  it('throws on invalid yearmonth', () => {
    expect(() => aggregate([], '2026-13', 0, FIXED_NOW)).toThrow(/Invalid yearmonth/)
  })

  it('produces a zero-row snapshot with stable shape', () => {
    const snap = aggregate([], '2026-04', 100, FIXED_NOW)
    expect(snap.yearmonth).toBe('2026-04')
    expect(snap.captured_at).toBe(FIXED_NOW.toISOString())
    expect(snap.total_rge_active).toBe(0)
    expect(snap.total_rge_expired).toBe(0)
    expect(snap.total_providers).toBe(100)
    expect(snap.by_region).toEqual([])
    expect(snap.by_qualification).toEqual([])
    expect(snap.by_specialty).toEqual([])
    expect(snap.organismes).toEqual([])
    expect(snap.methodology.length).toBeGreaterThan(50)
    expect(snap.source_note).toContain('ADEME')
  })

  it('skips providers with empty rge_qualifications', () => {
    const rows = [mkRow({ rge_qualifications: [] }, 0), mkRow({ rge_qualifications: null }, 1)]
    const snap = aggregate(rows, '2026-04', 2, FIXED_NOW)
    expect(snap.total_rge_active).toBe(0)
    expect(snap.total_rge_expired).toBe(0)
  })

  it('classifies active vs expired using first-of-month cutoff', () => {
    const rows = [
      mkRow(
        {
          rge_qualifications: [{ code: 'QualiPAC' }],
          rge_valid_until: '2026-04-01', // exactly at cutoff → active
        },
        0
      ),
      mkRow(
        {
          rge_qualifications: [{ code: 'QualiPAC' }],
          rge_valid_until: '2026-03-31', // day before → expired
        },
        1
      ),
      mkRow(
        {
          rge_qualifications: [{ code: 'QualiPAC' }],
          rge_valid_until: null, // missing date → expired
        },
        2
      ),
    ]
    const snap = aggregate(rows, '2026-04', 3, FIXED_NOW)
    expect(snap.total_rge_active).toBe(1)
    expect(snap.total_rge_expired).toBe(2)
  })

  it('sorts regions by active count descending and picks top qualification', () => {
    const ile = (i: number, code: string) =>
      mkRow(
        {
          address_region: 'Île-de-France',
          rge_qualifications: [{ code }],
          rge_valid_until: '2027-01-01',
        },
        i
      )
    const paca = (i: number, code: string) =>
      mkRow(
        {
          address_region: "Provence-Alpes-Côte d'Azur",
          rge_qualifications: [{ code }],
          rge_valid_until: '2027-01-01',
        },
        i
      )
    const rows = [ile(1, 'QualiPAC'), ile(2, 'QualiPAC'), ile(3, 'Qualibat'), paca(4, 'RGE')]
    const snap = aggregate(rows, '2026-04', 4, FIXED_NOW)
    expect(snap.by_region).toHaveLength(2)
    expect(snap.by_region[0].region).toBe('Île-de-France')
    expect(snap.by_region[0].nb_rge_active).toBe(3)
    expect(snap.by_region[0].top_qualification).toBe('QualiPAC')
    expect(snap.by_region[0].top_qualification_count).toBe(2)
    expect(snap.by_region[1].region_slug).toBe('provence-alpes-cote-d-azur')
  })

  it('caps top qualifications at 10 and assigns 1-based ranks', () => {
    const rows: ProviderRow[] = []
    for (let i = 0; i < 15; i++) {
      // qualification Q0 gets 15 artisans, Q1 14, … Q14 1
      for (let j = 0; j < 15 - i; j++) {
        rows.push(
          mkRow(
            {
              rge_qualifications: [{ code: `Q${i}` }],
              rge_valid_until: '2027-01-01',
            },
            rows.length
          )
        )
      }
    }
    const snap = aggregate(rows, '2026-04', rows.length, FIXED_NOW)
    expect(snap.by_qualification).toHaveLength(10)
    expect(snap.by_qualification[0]).toEqual({ code: 'Q0', nb_artisans: 15, rank: 1 })
    expect(snap.by_qualification[9].rank).toBe(10)
  })

  it('counts each qualification code once per provider', () => {
    const rows = [
      mkRow(
        {
          rge_qualifications: [
            { code: 'QualiPAC' },
            { code: 'QualiPAC' }, // dup on same artisan
            { code: 'Qualibat' },
          ],
          rge_valid_until: '2027-01-01',
        },
        0
      ),
    ]
    const snap = aggregate(rows, '2026-04', 1, FIXED_NOW)
    const pac = snap.by_qualification.find((q) => q.code === 'QualiPAC')
    expect(pac?.nb_artisans).toBe(1)
  })

  it('counts specialties only among active providers and computes share_pct', () => {
    const rows = [
      mkRow(
        {
          specialty: 'pompe-a-chaleur',
          rge_qualifications: [{ code: 'QualiPAC' }],
          rge_valid_until: '2027-01-01',
        },
        0
      ),
      mkRow(
        {
          specialty: 'pompe-a-chaleur',
          rge_qualifications: [{ code: 'QualiPAC' }],
          rge_valid_until: '2027-01-01',
        },
        1
      ),
      mkRow(
        {
          specialty: 'isolation-combles',
          rge_qualifications: [{ code: 'Qualibat' }],
          rge_valid_until: '2027-01-01',
        },
        2
      ),
      mkRow(
        {
          specialty: 'pompe-a-chaleur', // expired, should NOT count
          rge_qualifications: [{ code: 'QualiPAC' }],
          rge_valid_until: '2020-01-01',
        },
        3
      ),
    ]
    const snap = aggregate(rows, '2026-04', 4, FIXED_NOW)
    const pac = snap.by_specialty.find((s) => s.specialty === 'pompe-a-chaleur')
    expect(pac?.nb_rge_active).toBe(2)
    expect(pac?.share_pct).toBeCloseTo(66.7, 1) // 2/3 actifs
    const iso = snap.by_specialty.find((s) => s.specialty === 'isolation-combles')
    expect(iso?.share_pct).toBeCloseTo(33.3, 1)
  })

  it('sorts specialties descending and caps at 12', () => {
    const rows: ProviderRow[] = []
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20 - i; j++) {
        rows.push(
          mkRow(
            {
              specialty: `spec-${i}`,
              rge_qualifications: [{ code: 'X' }],
              rge_valid_until: '2027-01-01',
            },
            rows.length
          )
        )
      }
    }
    const snap = aggregate(rows, '2026-04', rows.length, FIXED_NOW)
    expect(snap.by_specialty).toHaveLength(12)
    expect(snap.by_specialty[0].specialty).toBe('spec-0')
  })

  it('deduplicates organismes per artisan and sorts descending', () => {
    const rows = [
      mkRow(
        {
          rge_qualifications: [{ code: 'X' }],
          rge_valid_until: '2027-01-01',
          rge_organismes: ['Qualibat', 'Qualibat', "Qualit'EnR"], // dup
        },
        0
      ),
      mkRow(
        {
          rge_qualifications: [{ code: 'X' }],
          rge_valid_until: '2027-01-01',
          rge_organismes: ['Qualibat'],
        },
        1
      ),
    ]
    const snap = aggregate(rows, '2026-04', 2, FIXED_NOW)
    expect(snap.organismes[0]).toEqual({ organisme: 'Qualibat', nb_artisans: 2 })
    expect(snap.organismes[1]).toEqual({ organisme: "Qualit'EnR", nb_artisans: 1 })
  })

  it('returns share_pct = 0 when totalActive is 0', () => {
    const snap = aggregate(
      [
        mkRow(
          {
            specialty: 'pompe-a-chaleur',
            rge_qualifications: [{ code: 'X' }],
            rge_valid_until: '2020-01-01', // expired
          },
          0
        ),
      ],
      '2026-04',
      1,
      FIXED_NOW
    )
    expect(snap.by_specialty).toEqual([])
  })
})
