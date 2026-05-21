/**
 * Tests — `_spec-source.ts` thin passthrough wrapper.
 *
 * The wrapper exists for testability (we can stub it in renderer tests),
 * not for runtime logic. These tests just guarantee the wrapper returns
 * the real OpenAPI 3.1 const from Ralph 27.
 */
import { describe, it, expect } from 'vitest'
import { getSpec } from '@/app/(public)/developpeurs/api-explorer/_spec-source'

describe('getSpec', () => {
  it("returns the OpenAPI 3.1 spec const (openapi field === '3.1.0')", () => {
    const spec = getSpec()
    expect(spec.openapi).toBe('3.1.0')
  })

  it('returns a spec with a non-empty `paths` object', () => {
    const spec = getSpec()
    expect(spec.paths).toBeDefined()
    const keys = Object.keys(spec.paths)
    expect(keys.length).toBeGreaterThan(0)
    for (const path of keys) {
      expect(path.startsWith('/api/v1/')).toBe(true)
    }
  })
})
