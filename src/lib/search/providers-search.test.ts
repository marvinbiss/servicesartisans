import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockRpc = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({ rpc: mockRpc })),
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}))

import { searchProvidersByName } from './providers-search'

describe('searchProvidersByName', () => {
  beforeEach(() => {
    mockRpc.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns empty results when query is shorter than 2 chars', async () => {
    const out = await searchProvidersByName({ query: 'a' })
    expect(out.results).toEqual([])
    expect(out.truncatedQuery).toBe('a')
    expect(mockRpc).not.toHaveBeenCalled()
  })

  it('returns empty results when query is empty/whitespace', async () => {
    const out = await searchProvidersByName({ query: '   ' })
    expect(out.results).toEqual([])
    expect(out.truncatedQuery).toBe('')
    expect(mockRpc).not.toHaveBeenCalled()
  })

  it('truncates query to 100 chars', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null })
    const longQuery = 'a'.repeat(150)
    const out = await searchProvidersByName({ query: longQuery })
    expect(out.truncatedQuery).toHaveLength(100)
    expect(mockRpc).toHaveBeenCalledWith('search_providers_by_name', {
      p_query: 'a'.repeat(100),
      p_limit: 20,
      p_offset: 0,
    })
  })

  it('clamps limit to [1, 50] and offset to [0, ∞)', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null })
    await searchProvidersByName({ query: 'edf', limit: 999, offset: -10 })
    expect(mockRpc).toHaveBeenCalledWith('search_providers_by_name', {
      p_query: 'edf',
      p_limit: 50,
      p_offset: 0,
    })
  })

  it('returns RPC results when successful', async () => {
    mockRpc.mockResolvedValue({
      data: [
        {
          id: 'uuid-1',
          name: 'EDF Plomberie',
          slug: 'edf-plomberie-paris',
          stable_id: 'STBL1',
          specialty: 'plombier',
          address_city: 'Paris',
          address_region: 'Île-de-France',
          is_verified: true,
          claimed_at: '2026-04-01',
          rge_qualifications: ['Qualibat 5912'],
          rating_average: 4.5,
          review_count: 12,
          rank: 0.81,
        },
      ],
      error: null,
    })

    const out = await searchProvidersByName({ query: 'EDF' })
    expect(out.results).toHaveLength(1)
    expect(out.results[0].name).toBe('EDF Plomberie')
    expect(out.results[0].rank).toBe(0.81)
  })

  it('returns empty results and logs on RPC error', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: 'permission denied', code: '42501' },
    })
    const out = await searchProvidersByName({ query: 'sarl' })
    expect(out.results).toEqual([])
    expect(out.truncatedQuery).toBe('sarl')
  })

  it('returns empty results and logs on unexpected throw', async () => {
    mockRpc.mockRejectedValue(new Error('network down'))
    const out = await searchProvidersByName({ query: 'sas' })
    expect(out.results).toEqual([])
  })
})
