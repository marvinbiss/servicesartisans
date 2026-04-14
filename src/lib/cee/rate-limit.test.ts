/**
 * Tests — rate-limit LRU
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { checkRateLimit, _resetRateLimitStoreForTests } from './rate-limit'

describe('checkRateLimit', () => {
  beforeEach(() => {
    _resetRateLimitStoreForTests()
  })

  it('allows up to max requests per window', () => {
    const key = 'k'
    const opts = { max: 3, windowMs: 60_000 }
    expect(checkRateLimit(key, opts).allowed).toBe(true)
    expect(checkRateLimit(key, opts).allowed).toBe(true)
    expect(checkRateLimit(key, opts).allowed).toBe(true)
    expect(checkRateLimit(key, opts).allowed).toBe(false)
  })

  it('tracks separate keys independently', () => {
    const opts = { max: 1, windowMs: 60_000 }
    expect(checkRateLimit('a', opts).allowed).toBe(true)
    expect(checkRateLimit('b', opts).allowed).toBe(true)
    expect(checkRateLimit('a', opts).allowed).toBe(false)
    expect(checkRateLimit('b', opts).allowed).toBe(false)
  })

  it('returns remaining and resetMs', () => {
    const opts = { max: 3, windowMs: 1000 }
    const r1 = checkRateLimit('k', opts)
    expect(r1.remaining).toBe(2)
    expect(r1.resetMs).toBeGreaterThan(0)
  })
})
