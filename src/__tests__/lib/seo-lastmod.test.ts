import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockNot = vi.fn()
const mockOrder = vi.fn()
const mockLimit = vi.fn()
const mockRange = vi.fn()
const mockIn = vi.fn()

function createChainBuilder(
  terminalData: { data?: unknown; error?: unknown } = { data: [], error: null }
) {
  const builder = {
    select: mockSelect.mockReturnThis(),
    eq: mockEq.mockReturnThis(),
    not: mockNot.mockReturnThis(),
    order: mockOrder.mockReturnThis(),
    limit: mockLimit.mockResolvedValue(terminalData),
    range: mockRange.mockReturnThis(),
    in: mockIn.mockReturnThis(),
  }
  return builder
}

const mockFrom = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ from: mockFrom })),
}))

vi.mock('@/lib/supabase', () => ({
  SERVICE_TO_SPECIALTIES: {
    plombier: ['plombier', 'plomberie'],
    electricien: ['electricien'],
    chauffagiste: ['chauffagiste'],
  },
}))

vi.mock('@/lib/data/france', () => ({
  villes: [
    { name: 'Paris', slug: 'paris' },
    { name: 'Lyon', slug: 'lyon' },
    { name: 'Marseille', slug: 'marseille' },
  ],
  departements: [
    { code: '75', slug: 'paris', name: 'Paris' },
    { code: '69', slug: 'rhone', name: 'Rhône' },
    { code: '13', slug: 'bouches-du-rhone', name: 'Bouches-du-Rhône' },
  ],
}))

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import {
  getLastmodByCity,
  getLastmodByDepartment,
  getLastmodByRegion,
  getLastmodByService,
  getLastmodByDeptService,
  getLastmodByRegionService,
  getLastReviewByService,
  getQualifiedServiceCityCombos,
  getQualifiedRgeCombos,
  getQualifiedCeeCombos,
  fetchAllLastmodData,
} from '@/lib/seo/lastmod-queries'

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
})

// ===========================================================================
// getLastmodByCity
// ===========================================================================

describe('getLastmodByCity', () => {
  it('returns a Map of city -> date string', async () => {
    const builder = createChainBuilder({
      data: [
        { address_city: 'Paris', updated_at: '2026-04-01T12:00:00Z' },
        { address_city: 'Lyon', updated_at: '2026-03-15T08:00:00Z' },
      ],
      error: null,
    })
    mockFrom.mockReturnValue(builder)

    const map = await getLastmodByCity()

    expect(map.get('paris')).toBe('2026-04-01')
    expect(map.get('lyon')).toBe('2026-03-15')
    expect(map.size).toBe(2)
  })

  it('keeps only the first (most recent) entry per city', async () => {
    const builder = createChainBuilder({
      data: [
        { address_city: 'Paris', updated_at: '2026-04-10T12:00:00Z' },
        { address_city: 'Paris', updated_at: '2026-03-01T08:00:00Z' },
      ],
      error: null,
    })
    mockFrom.mockReturnValue(builder)

    const map = await getLastmodByCity()

    expect(map.get('paris')).toBe('2026-04-10')
    expect(map.size).toBe(1)
  })

  it('returns empty map on error', async () => {
    const builder = createChainBuilder({ data: null, error: { message: 'fail' } })
    mockFrom.mockReturnValue(builder)

    const map = await getLastmodByCity()
    expect(map.size).toBe(0)
  })

  it('returns empty map when supabase client creation fails', async () => {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    vi.mocked(createAdminClient).mockImplementationOnce(() => {
      throw new Error('no env')
    })

    const map = await getLastmodByCity()
    expect(map.size).toBe(0)
  })

  it('skips rows with null address_city', async () => {
    const builder = createChainBuilder({
      data: [
        { address_city: null, updated_at: '2026-04-01T00:00:00Z' },
        { address_city: 'Lyon', updated_at: '2026-04-01T00:00:00Z' },
      ],
      error: null,
    })
    mockFrom.mockReturnValue(builder)

    const map = await getLastmodByCity()
    expect(map.size).toBe(1)
    expect(map.has('lyon')).toBe(true)
  })

  it('normalizes city names (strips diacritics, lowercases)', async () => {
    const builder = createChainBuilder({
      data: [{ address_city: 'Saint-Étienne', updated_at: '2026-04-01T00:00:00Z' }],
      error: null,
    })
    mockFrom.mockReturnValue(builder)

    const map = await getLastmodByCity()
    expect(map.has('saint-etienne')).toBe(true)
  })
})

// ===========================================================================
// getLastmodByDepartment
// ===========================================================================

describe('getLastmodByDepartment', () => {
  it('returns a Map of department -> date string', async () => {
    const builder = createChainBuilder({
      data: [{ address_department: 'Rhône', updated_at: '2026-04-05T10:00:00Z' }],
      error: null,
    })
    mockFrom.mockReturnValue(builder)

    const map = await getLastmodByDepartment()
    expect(map.get('rhone')).toBe('2026-04-05')
  })

  it('returns empty map on null data', async () => {
    const builder = createChainBuilder({ data: null, error: null })
    mockFrom.mockReturnValue(builder)

    const map = await getLastmodByDepartment()
    expect(map.size).toBe(0)
  })

  it('skips rows with null department', async () => {
    const builder = createChainBuilder({
      data: [{ address_department: null, updated_at: '2026-04-01T00:00:00Z' }],
      error: null,
    })
    mockFrom.mockReturnValue(builder)

    const map = await getLastmodByDepartment()
    expect(map.size).toBe(0)
  })
})

// ===========================================================================
// getLastmodByRegion
// ===========================================================================

describe('getLastmodByRegion', () => {
  it('returns a Map of region -> date string', async () => {
    const builder = createChainBuilder({
      data: [{ address_region: 'Île-de-France', updated_at: '2026-04-07T14:00:00Z' }],
      error: null,
    })
    mockFrom.mockReturnValue(builder)

    const map = await getLastmodByRegion()
    expect(map.get('ile-de-france')).toBe('2026-04-07')
  })

  it('returns empty map when supabase unavailable', async () => {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    vi.mocked(createAdminClient).mockImplementationOnce(() => {
      throw new Error('no env')
    })

    const map = await getLastmodByRegion()
    expect(map.size).toBe(0)
  })
})

// ===========================================================================
// getLastmodByService
// ===========================================================================

describe('getLastmodByService', () => {
  it('returns a Map of specialty -> date string', async () => {
    const builder = createChainBuilder({
      data: [
        { specialty: 'Plombier', updated_at: '2026-04-02T00:00:00Z' },
        { specialty: 'Electricien', updated_at: '2026-03-20T00:00:00Z' },
      ],
      error: null,
    })
    mockFrom.mockReturnValue(builder)

    const map = await getLastmodByService()
    expect(map.get('plombier')).toBe('2026-04-02')
    expect(map.get('electricien')).toBe('2026-03-20')
  })

  it('skips rows with null specialty', async () => {
    const builder = createChainBuilder({
      data: [{ specialty: null, updated_at: '2026-04-01T00:00:00Z' }],
      error: null,
    })
    mockFrom.mockReturnValue(builder)

    const map = await getLastmodByService()
    expect(map.size).toBe(0)
  })
})

// ===========================================================================
// getLastmodByDeptService
// ===========================================================================

describe('getLastmodByDeptService', () => {
  it('returns a Map of dept::specialty -> date string', async () => {
    const builder = createChainBuilder({
      data: [
        { address_department: 'Paris', specialty: 'Plombier', updated_at: '2026-04-03T00:00:00Z' },
      ],
      error: null,
    })
    mockFrom.mockReturnValue(builder)

    const map = await getLastmodByDeptService()
    expect(map.get('paris::plombier')).toBe('2026-04-03')
  })

  it('skips rows with missing dept or specialty', async () => {
    const builder = createChainBuilder({
      data: [
        { address_department: null, specialty: 'Plombier', updated_at: '2026-04-01T00:00:00Z' },
        { address_department: 'Paris', specialty: null, updated_at: '2026-04-01T00:00:00Z' },
      ],
      error: null,
    })
    mockFrom.mockReturnValue(builder)

    const map = await getLastmodByDeptService()
    expect(map.size).toBe(0)
  })
})

// ===========================================================================
// getLastmodByRegionService
// ===========================================================================

describe('getLastmodByRegionService', () => {
  it('returns a Map of region::specialty -> date string', async () => {
    const builder = createChainBuilder({
      data: [
        {
          address_region: 'Auvergne-Rhône-Alpes',
          specialty: 'Electricien',
          updated_at: '2026-04-04T00:00:00Z',
        },
      ],
      error: null,
    })
    mockFrom.mockReturnValue(builder)

    const map = await getLastmodByRegionService()
    expect(map.get('auvergne-rhone-alpes::electricien')).toBe('2026-04-04')
  })
})

// ===========================================================================
// getLastReviewByService
// ===========================================================================

describe('getLastReviewByService', () => {
  it('returns a Map of specialty -> latest review date', async () => {
    // Two separate calls: first reviews, then providers
    let callIdx = 0
    mockFrom.mockImplementation(() => {
      callIdx++
      if (callIdx === 1) {
        // reviews table
        return createChainBuilder({
          data: [
            { provider_id: 'p1', created_at: '2026-04-08T10:00:00Z' },
            { provider_id: 'p2', created_at: '2026-03-25T10:00:00Z' },
          ],
          error: null,
        })
      }
      // providers table (for specialty lookup)
      const b = createChainBuilder()
      b.in = vi.fn().mockResolvedValue({
        data: [
          { id: 'p1', specialty: 'Plombier' },
          { id: 'p2', specialty: 'Electricien' },
        ],
        error: null,
      })
      return b
    })

    const map = await getLastReviewByService()
    expect(map.get('plombier')).toBe('2026-04-08')
    expect(map.get('electricien')).toBe('2026-03-25')
  })

  it('returns empty map when no reviews exist', async () => {
    const builder = createChainBuilder({ data: [], error: null })
    mockFrom.mockReturnValue(builder)

    const map = await getLastReviewByService()
    expect(map.size).toBe(0)
  })

  it('returns empty map on review query error', async () => {
    const builder = createChainBuilder({ data: null, error: { message: 'fail' } })
    mockFrom.mockReturnValue(builder)

    const map = await getLastReviewByService()
    expect(map.size).toBe(0)
  })
})

// ===========================================================================
// getQualifiedServiceCityCombos
// ===========================================================================

describe('getQualifiedServiceCityCombos', () => {
  it('returns a Set of service::ville combos', async () => {
    const builder = createChainBuilder()
    builder.range = vi.fn().mockResolvedValue({
      data: [
        { specialty: 'plombier', address_city: 'Paris' },
        { specialty: 'electricien', address_city: 'Lyon' },
      ],
      error: null,
    })
    mockFrom.mockReturnValue(builder)

    const combos = await getQualifiedServiceCityCombos()
    expect(combos).not.toBeNull()
    expect(combos!.has('plombier::paris')).toBe(true)
    expect(combos!.has('electricien::lyon')).toBe(true)
  })

  it('returns null when supabase unavailable (fail-open)', async () => {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    vi.mocked(createAdminClient).mockImplementationOnce(() => {
      throw new Error('no env')
    })

    const combos = await getQualifiedServiceCityCombos()
    expect(combos).toBeNull()
  })

  it('returns null on query error (fail-open)', async () => {
    const builder = createChainBuilder()
    builder.range = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'DB error' },
    })
    mockFrom.mockReturnValue(builder)

    const combos = await getQualifiedServiceCityCombos()
    expect(combos).toBeNull()
  })

  it('strips arrondissement suffix from city names', async () => {
    const builder = createChainBuilder()
    builder.range = vi.fn().mockResolvedValue({
      data: [{ specialty: 'plombier', address_city: 'Paris 18e arrondissement' }],
      error: null,
    })
    mockFrom.mockReturnValue(builder)

    const combos = await getQualifiedServiceCityCombos()
    expect(combos).not.toBeNull()
    expect(combos!.has('plombier::paris')).toBe(true)
  })

  it('skips providers with unknown specialty', async () => {
    const builder = createChainBuilder()
    builder.range = vi.fn().mockResolvedValue({
      data: [{ specialty: 'unknown_trade', address_city: 'Paris' }],
      error: null,
    })
    mockFrom.mockReturnValue(builder)

    const combos = await getQualifiedServiceCityCombos()
    expect(combos).not.toBeNull()
    expect(combos!.size).toBe(0)
  })

  it('skips providers with unknown city', async () => {
    const builder = createChainBuilder()
    builder.range = vi.fn().mockResolvedValue({
      data: [{ specialty: 'plombier', address_city: 'Unknown City 12345' }],
      error: null,
    })
    mockFrom.mockReturnValue(builder)

    const combos = await getQualifiedServiceCityCombos()
    expect(combos).not.toBeNull()
    expect(combos!.size).toBe(0)
  })
})

// ===========================================================================
// getQualifiedRgeCombos — Vague 1.3 sitemap purge
// ===========================================================================

describe('getQualifiedRgeCombos', () => {
  it('returns null on supabase unavailable (fail-open)', async () => {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    vi.mocked(createAdminClient).mockImplementationOnce(() => {
      throw new Error('no env')
    })

    const combos = await getQualifiedRgeCombos()
    expect(combos.rgeServiceCity).toBeNull()
    expect(combos.rgeServiceDept).toBeNull()
  })

  it('returns null on query error (fail-open)', async () => {
    const builder = createChainBuilder()
    builder.range = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'DB error' },
    })
    mockFrom.mockReturnValue(builder)

    const combos = await getQualifiedRgeCombos()
    expect(combos.rgeServiceCity).toBeNull()
    expect(combos.rgeServiceDept).toBeNull()
  })
})

// ===========================================================================
// getQualifiedCeeCombos — Vague 1.3 sitemap purge
// ===========================================================================

describe('getQualifiedCeeCombos', () => {
  it('returns null on supabase unavailable (fail-open)', async () => {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    vi.mocked(createAdminClient).mockImplementationOnce(() => {
      throw new Error('no env')
    })

    const combos = await getQualifiedCeeCombos(['bar-th-171'])
    expect(combos).toBeNull()
  })

  it('returns null when operation codes list is empty', async () => {
    const combos = await getQualifiedCeeCombos([])
    expect(combos).toBeNull()
  })
})

// ===========================================================================
// fetchAllLastmodData
// ===========================================================================

describe('fetchAllLastmodData', () => {
  it('returns all maps in parallel', async () => {
    // All queries return empty
    const builder = createChainBuilder({ data: [], error: null })
    builder.range = vi.fn().mockResolvedValue({ data: [], error: null })
    mockFrom.mockReturnValue(builder)

    const data = await fetchAllLastmodData()

    expect(data.byCity).toBeInstanceOf(Map)
    expect(data.byDepartment).toBeInstanceOf(Map)
    expect(data.byRegion).toBeInstanceOf(Map)
    expect(data.byService).toBeInstanceOf(Map)
    expect(data.byDeptService).toBeInstanceOf(Map)
    expect(data.byRegionService).toBeInstanceOf(Map)
    expect(data.reviewByService).toBeInstanceOf(Map)
    expect(data.byDeptServiceSlug).toBeInstanceOf(Map)
    // qualifiedCombos can be Set or null
  })

  it('derives byDeptServiceSlug from byDeptService via SERVICE_TO_SPECIALTIES', async () => {
    // Return dept×specialty data for the providers query (getLastmodByDeptService)
    let callCount = 0
    mockFrom.mockImplementation(() => {
      callCount++
      const builder = createChainBuilder({ data: [], error: null })
      builder.range = vi.fn().mockResolvedValue({ data: [], error: null })
      // The 5th call is getLastmodByDeptService (order: city, dept, region, service, deptService, ...)
      if (callCount === 5) {
        builder.limit = vi.fn().mockResolvedValue({
          data: [
            // 'plombier' specialty → should map to 'plombier' service slug
            {
              address_department: 'Paris',
              specialty: 'plombier',
              updated_at: '2026-04-10T00:00:00Z',
            },
            // 'plomberie' specialty → should also map to 'plombier' service slug
            {
              address_department: 'Paris',
              specialty: 'plomberie',
              updated_at: '2026-04-08T00:00:00Z',
            },
            // 'electricien' specialty → should map to 'electricien' service slug
            {
              address_department: 'Rhône',
              specialty: 'electricien',
              updated_at: '2026-04-05T00:00:00Z',
            },
          ],
          error: null,
        })
      }
      return builder
    })

    const data = await fetchAllLastmodData()

    // plombier service slug uses MAX of plombier (04-10) and plomberie (04-08) → 04-10
    expect(data.byDeptServiceSlug.get('paris::plombier')).toBe('2026-04-10')
    // electricien maps directly
    expect(data.byDeptServiceSlug.get('rhone::electricien')).toBe('2026-04-05')
  })

  it('returns empty maps when supabase is unavailable', async () => {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    vi.mocked(createAdminClient).mockImplementationOnce(() => {
      throw new Error('no env')
    })
    vi.mocked(createAdminClient).mockImplementationOnce(() => {
      throw new Error('no env')
    })
    vi.mocked(createAdminClient).mockImplementationOnce(() => {
      throw new Error('no env')
    })
    vi.mocked(createAdminClient).mockImplementationOnce(() => {
      throw new Error('no env')
    })
    vi.mocked(createAdminClient).mockImplementationOnce(() => {
      throw new Error('no env')
    })
    vi.mocked(createAdminClient).mockImplementationOnce(() => {
      throw new Error('no env')
    })
    vi.mocked(createAdminClient).mockImplementationOnce(() => {
      throw new Error('no env')
    })
    vi.mocked(createAdminClient).mockImplementationOnce(() => {
      throw new Error('no env')
    })

    const data = await fetchAllLastmodData()

    expect(data.byCity.size).toBe(0)
    expect(data.byDepartment.size).toBe(0)
    expect(data.byRegion.size).toBe(0)
    expect(data.byService.size).toBe(0)
    expect(data.qualifiedCombos).toBeNull()
  })
})

// ===========================================================================
// Date formatting edge cases
// ===========================================================================

describe('date formatting', () => {
  it('handles invalid date strings gracefully', async () => {
    const builder = createChainBuilder({
      data: [{ address_city: 'Paris', updated_at: 'not-a-date' }],
      error: null,
    })
    mockFrom.mockReturnValue(builder)

    const map = await getLastmodByCity()
    // Invalid date -> toDateStr returns undefined -> not added to map
    expect(map.has('paris')).toBe(false)
  })

  it('handles null updated_at', async () => {
    const builder = createChainBuilder({
      data: [{ address_city: 'Paris', updated_at: null }],
      error: null,
    })
    mockFrom.mockReturnValue(builder)

    const map = await getLastmodByCity()
    expect(map.has('paris')).toBe(false)
  })

  it('extracts YYYY-MM-DD from full ISO date', async () => {
    const localSelect = vi.fn()
    const localEq = vi.fn()
    const localNot = vi.fn()
    const localOrder = vi.fn()
    const localLimit = vi.fn()
    const builder = {
      select: localSelect.mockReturnThis(),
      eq: localEq.mockReturnThis(),
      not: localNot.mockReturnThis(),
      order: localOrder.mockReturnThis(),
      limit: localLimit.mockResolvedValue({
        data: [{ address_city: 'Paris', updated_at: '2026-01-15T23:59:59.999Z' }],
        error: null,
      }),
    }
    mockFrom.mockReturnValue(builder)

    const map = await getLastmodByCity()
    expect(map.get('paris')).toBe('2026-01-15')
  })
})
