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

  it('returns false when departmentName is null', async () => {
    expect(await hasDeptProviderFallback('plombier', null)).toBe(false)
    expect(mockGetProviders).not.toHaveBeenCalled()
  })

  it('returns false when departmentName is undefined', async () => {
    expect(await hasDeptProviderFallback('plombier', undefined)).toBe(false)
    expect(mockGetProviders).not.toHaveBeenCalled()
  })

  it('returns false when departmentName is empty string', async () => {
    expect(await hasDeptProviderFallback('plombier', '')).toBe(false)
    expect(mockGetProviders).not.toHaveBeenCalled()
  })

  it('returns true when fallback dept has at least one provider', async () => {
    mockGetProviders.mockResolvedValueOnce([{ id: 'p1' }])
    expect(await hasDeptProviderFallback('plombier', 'Paris')).toBe(true)
    expect(mockGetProviders).toHaveBeenCalledWith('plombier', 'Paris', { limit: 1 })
  })

  it('returns false when fallback dept is empty', async () => {
    mockGetProviders.mockResolvedValueOnce([])
    expect(await hasDeptProviderFallback('plombier', 'Lozère')).toBe(false)
  })

  it('fail-safes to false on DB error', async () => {
    mockGetProviders.mockRejectedValueOnce(new Error('DB down'))
    expect(await hasDeptProviderFallback('plombier', 'Paris')).toBe(false)
  })
})
