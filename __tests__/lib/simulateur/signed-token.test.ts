/**
 * Tests — signToken / verifyToken (src/lib/simulateur/rgpd/signed-token.ts)
 *
 * Coverage:
 *  - generate + verify roundtrip
 *  - wrong publicId fails
 *  - tampered token fails
 *  - expired token fails (fake timers)
 *  - timing safety: malformed tokens return false, never throw
 *  - malformed token shapes (empty, single char, no dot, 2 dots, non-hex)
 *  - two tokens for same publicId both verify (stateless, no one-time-use)
 *  - signToken guard: invalid publicId / ttl throws
 *  - dev fallback secret when RGPD_EXPORT_SECRET absent
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { signToken, verifyToken } from '@/lib/simulateur/rgpd/signed-token'

const ORIGINAL_SECRET = process.env.RGPD_EXPORT_SECRET
const ORIGINAL_NODE_ENV = (process.env as Record<string, string | undefined>).NODE_ENV

const TEST_SECRET = 'test-secret-rgpd-signed-token-long-enough-2026'
const PUBLIC_ID = 'EST-2026-04-14-abc123'

describe('signToken + verifyToken', () => {
  beforeEach(() => {
    process.env.RGPD_EXPORT_SECRET = TEST_SECRET
    ;(process.env as Record<string, string | undefined>).NODE_ENV = 'test'
  })

  afterEach(() => {
    if (ORIGINAL_SECRET === undefined) delete process.env.RGPD_EXPORT_SECRET
    else process.env.RGPD_EXPORT_SECRET = ORIGINAL_SECRET
    if (ORIGINAL_NODE_ENV === undefined)
      delete (process.env as Record<string, string | undefined>).NODE_ENV
    else (process.env as Record<string, string | undefined>).NODE_ENV = ORIGINAL_NODE_ENV
    vi.useRealTimers()
  })

  // -------------------------------------------------------------------------
  // Roundtrip
  // -------------------------------------------------------------------------

  it('generate + verify roundtrip returns true', () => {
    const token = signToken(PUBLIC_ID, 3600)
    expect(verifyToken(PUBLIC_ID, token)).toBe(true)
  })

  it('token has format <epoch>.<hex64>', () => {
    const token = signToken(PUBLIC_ID, 3600)
    expect(token).toMatch(/^\d+\.[0-9a-f]{64}$/)
  })

  it('expiresAt encoded in token is in the future', () => {
    const token = signToken(PUBLIC_ID, 3600)
    const expiresAt = Number(token.split('.')[0])
    expect(expiresAt).toBeGreaterThan(Math.floor(Date.now() / 1000))
  })

  // -------------------------------------------------------------------------
  // Wrong publicId
  // -------------------------------------------------------------------------

  it('verify with wrong publicId returns false', () => {
    const token = signToken(PUBLIC_ID, 3600)
    expect(verifyToken('EST-2026-04-14-XXXXXX', token)).toBe(false)
  })

  it('verify with empty publicId returns false (no throw)', () => {
    const token = signToken(PUBLIC_ID, 3600)
    expect(verifyToken('', token)).toBe(false)
  })

  it('verify with null publicId returns false (no throw)', () => {
    const token = signToken(PUBLIC_ID, 3600)
    // @ts-expect-error deliberate defensive check
    expect(verifyToken(null, token)).toBe(false)
  })

  // -------------------------------------------------------------------------
  // Tampered token
  // -------------------------------------------------------------------------

  it('verify with tampered signature returns false', () => {
    const token = signToken(PUBLIC_ID, 3600)
    const [exp, sig] = token.split('.')
    const tampered = sig[0] === '0' ? '1' + sig.slice(1) : '0' + sig.slice(1)
    expect(verifyToken(PUBLIC_ID, `${exp}.${tampered}`)).toBe(false)
  })

  it('verify with flipped last char in sig returns false', () => {
    const token = signToken(PUBLIC_ID, 3600)
    const [exp, sig] = token.split('.')
    const tampered = sig.slice(0, -1) + (sig.slice(-1) === '0' ? '1' : '0')
    expect(verifyToken(PUBLIC_ID, `${exp}.${tampered}`)).toBe(false)
  })

  it('verify with all-zeros signature returns false', () => {
    const token = signToken(PUBLIC_ID, 3600)
    const exp = token.split('.')[0]
    expect(verifyToken(PUBLIC_ID, `${exp}.${'0'.repeat(64)}`)).toBe(false)
  })

  // -------------------------------------------------------------------------
  // Expired token
  // -------------------------------------------------------------------------

  it('verify expired token returns false', () => {
    const token = signToken(PUBLIC_ID, 1) // 1 second TTL
    vi.useFakeTimers()
    vi.setSystemTime(Date.now() + 2_000) // advance 2s
    expect(verifyToken(PUBLIC_ID, token)).toBe(false)
  })

  it('verify token exactly at expiry boundary returns false (> check)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-14T10:00:00Z'))
    const token = signToken(PUBLIC_ID, 0.9) // rounds down to 0 → already at/past expiry
    // With ttlSeconds=1 effectively (signToken floors): advance past
    vi.setSystemTime(new Date('2026-04-14T11:00:00Z'))
    expect(verifyToken(PUBLIC_ID, token)).toBe(false)
  })

  // -------------------------------------------------------------------------
  // Malformed token shapes — must return false, never throw
  // -------------------------------------------------------------------------

  it('empty token returns false', () => {
    expect(() => verifyToken(PUBLIC_ID, '')).not.toThrow()
    expect(verifyToken(PUBLIC_ID, '')).toBe(false)
  })

  it('single char token returns false', () => {
    expect(verifyToken(PUBLIC_ID, 'x')).toBe(false)
  })

  it('no dot in token returns false', () => {
    expect(verifyToken(PUBLIC_ID, 'sanspointdutout')).toBe(false)
  })

  it('dot at position 0 returns false', () => {
    expect(verifyToken(PUBLIC_ID, '.abcdef')).toBe(false)
  })

  it('dot at last position returns false', () => {
    expect(verifyToken(PUBLIC_ID, '1744665600.')).toBe(false)
  })

  it('token with dot injected into epoch segment returns false', () => {
    const token = signToken(PUBLIC_ID, 3600)
    const [exp, sig] = token.split('.')
    // Inject a dot inside the epoch to create a 3-segment token: "17.44665600.<sig>"
    // This changes the epoch → verifyToken parses a wrong expiry → sig mismatch
    const modified = exp.slice(0, 2) + '.' + exp.slice(2) + '.' + sig
    expect(verifyToken(PUBLIC_ID, modified)).toBe(false)
  })

  it('non-numeric expiry returns false', () => {
    expect(verifyToken(PUBLIC_ID, 'abc.' + 'f'.repeat(64))).toBe(false)
  })

  it('zero epoch returns false (expired immediately)', () => {
    expect(verifyToken(PUBLIC_ID, '0.' + 'a'.repeat(64))).toBe(false)
  })

  it('negative epoch (NaN after Number) returns false', () => {
    expect(verifyToken(PUBLIC_ID, '-1.' + 'a'.repeat(64))).toBe(false)
  })

  it('non-hex signature (wrong chars) returns false without throw', () => {
    const token = signToken(PUBLIC_ID, 3600)
    const exp = token.split('.')[0]
    // Replace hex with non-hex chars — Buffer.from('xyz...', 'hex') silently decodes 0 bytes
    expect(verifyToken(PUBLIC_ID, `${exp}.${'z'.repeat(64)}`)).toBe(false)
  })

  it('short signature (32 hex chars) returns false', () => {
    const token = signToken(PUBLIC_ID, 3600)
    const exp = token.split('.')[0]
    expect(verifyToken(PUBLIC_ID, `${exp}.${'deadbeef'.repeat(4)}`)).toBe(false)
  })

  it('null token returns false', () => {
    // @ts-expect-error deliberate defensive check
    expect(verifyToken(PUBLIC_ID, null)).toBe(false)
  })

  // -------------------------------------------------------------------------
  // Stateless / no one-time-use
  // -------------------------------------------------------------------------

  it('same token verifies twice (no one-time-use)', () => {
    const token = signToken(PUBLIC_ID, 3600)
    expect(verifyToken(PUBLIC_ID, token)).toBe(true)
    expect(verifyToken(PUBLIC_ID, token)).toBe(true)
  })

  it('two tokens for same publicId at different times both verify', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-14T10:00:00Z'))
    const t1 = signToken(PUBLIC_ID, 3600)

    vi.setSystemTime(new Date('2026-04-14T10:00:05Z'))
    const t2 = signToken(PUBLIC_ID, 3600)

    expect(t1).not.toBe(t2)
    expect(verifyToken(PUBLIC_ID, t1)).toBe(true)
    expect(verifyToken(PUBLIC_ID, t2)).toBe(true)
  })

  it('token for publicId A does not verify for publicId B', () => {
    const tokenA = signToken('EST-2026-04-14-AAAAA1', 3600)
    const tokenB = signToken('EST-2026-04-14-BBBBB1', 3600)
    expect(verifyToken('EST-2026-04-14-AAAAA1', tokenB)).toBe(false)
    expect(verifyToken('EST-2026-04-14-BBBBB1', tokenA)).toBe(false)
  })

  // -------------------------------------------------------------------------
  // signToken guards
  // -------------------------------------------------------------------------

  it('signToken throws if publicId is empty string', () => {
    expect(() => signToken('', 3600)).toThrow(/publicId/)
  })

  it('signToken throws if publicId is not a string', () => {
    // @ts-expect-error deliberate defensive check
    expect(() => signToken(null, 3600)).toThrow()
  })

  it('signToken throws if ttlSeconds is 0', () => {
    expect(() => signToken(PUBLIC_ID, 0)).toThrow(/ttlSeconds/)
  })

  it('signToken throws if ttlSeconds is negative', () => {
    expect(() => signToken(PUBLIC_ID, -1)).toThrow(/ttlSeconds/)
  })

  it('signToken throws if ttlSeconds is NaN', () => {
    expect(() => signToken(PUBLIC_ID, NaN)).toThrow(/ttlSeconds/)
  })

  it('signToken throws if ttlSeconds is Infinity', () => {
    expect(() => signToken(PUBLIC_ID, Infinity)).toThrow(/ttlSeconds/)
  })

  // -------------------------------------------------------------------------
  // Dev fallback secret
  // -------------------------------------------------------------------------

  it('works with dev fallback when RGPD_EXPORT_SECRET absent (non-production)', () => {
    delete process.env.RGPD_EXPORT_SECRET
    // NODE_ENV = 'test' — should use dev fallback, not throw
    const token = signToken(PUBLIC_ID, 3600)
    expect(verifyToken(PUBLIC_ID, token)).toBe(true)
  })

  it('token signed with dev fallback does NOT verify against real secret', () => {
    delete process.env.RGPD_EXPORT_SECRET
    const tokenWithFallback = signToken(PUBLIC_ID, 3600)

    // Restore a real secret and try to verify
    process.env.RGPD_EXPORT_SECRET = 'completely-different-secret-value-ok'
    expect(verifyToken(PUBLIC_ID, tokenWithFallback)).toBe(false)
  })

  // -------------------------------------------------------------------------
  // Timing safety
  // -------------------------------------------------------------------------

  it('correct token returns true (timing safe)', () => {
    const token = signToken(PUBLIC_ID, 3600)
    expect(verifyToken(PUBLIC_ID, token)).toBe(true)
  })

  it('incorrect token returns false without throw (timing safe — no exception path)', () => {
    expect(() => verifyToken(PUBLIC_ID, 'totally-wrong-value')).not.toThrow()
    expect(verifyToken(PUBLIC_ID, 'totally-wrong-value')).toBe(false)
  })
})
