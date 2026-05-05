/**
 * Helper de désynchro metadata ↔ render — voir `src/lib/seo/dept-fallback.ts`.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetProviders = vi.fn()

vi.mock('@/lib/supabase', () => ({
  getProvidersByServiceAndDepartment: (...args: unknown[]) => mockGetProviders(...args),
}))

import { hasDeptProviderFallback } from '@/lib/seo/dept-fallback'

describe('hasDeptProviderFallback', () => {
  beforeEach(() => {
    mockGetProviders.mockReset()
  })

  it('returns false when departmentCode is null', async () => {
    expect(await hasDeptProviderFallback('plombier', null)).toBe(false)
    expect(mockGetProviders).not.toHaveBeenCalled()
  })

  it('returns false when departmentCode is undefined', async () => {
    expect(await hasDeptProviderFallback('plombier', undefined)).toBe(false)
    expect(mockGetProviders).not.toHaveBeenCalled()
  })

  it('returns false when departmentCode is empty string', async () => {
    expect(await hasDeptProviderFallback('plombier', '')).toBe(false)
    expect(mockGetProviders).not.toHaveBeenCalled()
  })

  it('returns true when fallback dept has 3+ providers (index threshold)', async () => {
    mockGetProviders.mockResolvedValueOnce([{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }])
    expect(await hasDeptProviderFallback('plombier', '75')).toBe(true)
    expect(mockGetProviders).toHaveBeenCalledWith('plombier', '75', { limit: 3 })
  })

  it('returns false when fallback dept has only 1 provider (below threshold)', async () => {
    mockGetProviders.mockResolvedValueOnce([{ id: 'p1' }])
    expect(await hasDeptProviderFallback('plombier', '75')).toBe(false)
  })

  it('returns false when fallback dept has 2 providers (below threshold)', async () => {
    mockGetProviders.mockResolvedValueOnce([{ id: 'p1' }, { id: 'p2' }])
    expect(await hasDeptProviderFallback('plombier', '75')).toBe(false)
  })

  it('returns false when fallback dept is empty', async () => {
    mockGetProviders.mockResolvedValueOnce([])
    expect(await hasDeptProviderFallback('plombier', '48')).toBe(false)
  })

  it('fail-safes to false on DB error', async () => {
    mockGetProviders.mockRejectedValueOnce(new Error('DB down'))
    expect(await hasDeptProviderFallback('plombier', '75')).toBe(false)
  })
})
