import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  buildPendingCookie,
  buildVerifiedCookie,
  buildClearCookie,
  readPendingCookie,
  readVerifiedCookie,
  PENDING_COOKIE_NAME,
  VERIFIED_COOKIE_NAME,
  TWO_FACTOR_TTL,
} from '@/lib/auth/two-factor-cookies'

const SECRET = 'a'.repeat(64)
const OTHER_SECRET = 'b'.repeat(64)
const USER_ID = '11111111-1111-1111-1111-111111111111'

beforeEach(() => {
  vi.stubEnv('TWO_FACTOR_COOKIE_SECRET', SECRET)
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-05-05T10:00:00.000Z'))
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.useRealTimers()
})

describe('two-factor-cookies — pending cookie', () => {
  it('builds a cookie with name, value, and HttpOnly+strict options', async () => {
    const c = await buildPendingCookie(USER_ID)
    expect(c.name).toBe(PENDING_COOKIE_NAME)
    expect(c.value).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)
    expect(c.options.httpOnly).toBe(true)
    expect(c.options.sameSite).toBe('strict')
    expect(c.options.path).toBe('/')
    expect(c.options.maxAge).toBe(Math.floor(TWO_FACTOR_TTL.pending / 1000))
  })

  it('round-trip : a valid pending cookie value reads back the same userId', async () => {
    const c = await buildPendingCookie(USER_ID)
    const payload = await readPendingCookie(c.value)
    expect(payload?.userId).toBe(USER_ID)
    expect(payload?.exp).toBeGreaterThan(Date.now())
  })

  it('returns null for missing or empty input', async () => {
    expect(await readPendingCookie(null)).toBeNull()
    expect(await readPendingCookie(undefined)).toBeNull()
    expect(await readPendingCookie('')).toBeNull()
  })

  it('returns null for malformed format (no dot)', async () => {
    expect(await readPendingCookie('not-a-token')).toBeNull()
  })

  it('returns null for tampered payload (signature mismatch)', async () => {
    const c = await buildPendingCookie(USER_ID)
    // Inject a different userId by re-encoding the b64 part without re-signing.
    const [, sig] = c.value.split('.')
    const evilPayload = btoa(
      JSON.stringify({ userId: '99999999-9999-9999-9999-999999999999', exp: Date.now() + 60000 })
    )
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    const evilToken = `${evilPayload}.${sig}`
    expect(await readPendingCookie(evilToken)).toBeNull()
  })

  it('returns null for an expired payload', async () => {
    const c = await buildPendingCookie(USER_ID)
    vi.setSystemTime(new Date(Date.now() + TWO_FACTOR_TTL.pending + 1000))
    expect(await readPendingCookie(c.value)).toBeNull()
  })

  it('returns null when the secret rotates (signature key mismatch)', async () => {
    const c = await buildPendingCookie(USER_ID)
    vi.stubEnv('TWO_FACTOR_COOKIE_SECRET', OTHER_SECRET)
    expect(await readPendingCookie(c.value)).toBeNull()
  })

  it('throws if the secret is missing at sign time', async () => {
    vi.stubEnv('TWO_FACTOR_COOKIE_SECRET', '')
    await expect(buildPendingCookie(USER_ID)).rejects.toThrow(/TWO_FACTOR_COOKIE_SECRET/)
  })
})

describe('two-factor-cookies — verified cookie', () => {
  it('round-trip with userId match', async () => {
    const c = await buildVerifiedCookie(USER_ID)
    expect(c.name).toBe(VERIFIED_COOKIE_NAME)
    expect(c.options.maxAge).toBe(Math.floor(TWO_FACTOR_TTL.verified / 1000))
    const payload = await readVerifiedCookie(c.value, USER_ID)
    expect(payload?.userId).toBe(USER_ID)
  })

  it('returns null when expectedUserId mismatches', async () => {
    const c = await buildVerifiedCookie(USER_ID)
    expect(await readVerifiedCookie(c.value, 'other-user')).toBeNull()
  })

  it('without expectedUserId, accepts any valid signature', async () => {
    const c = await buildVerifiedCookie(USER_ID)
    const payload = await readVerifiedCookie(c.value)
    expect(payload?.userId).toBe(USER_ID)
  })

  it('expires after VERIFIED_TTL_MS (8h)', async () => {
    const c = await buildVerifiedCookie(USER_ID)
    vi.setSystemTime(new Date(Date.now() + TWO_FACTOR_TTL.verified + 1000))
    expect(await readVerifiedCookie(c.value, USER_ID)).toBeNull()
  })
})

describe('two-factor-cookies — clear cookie', () => {
  it('builds a deletion directive with maxAge=0 and same options as set', () => {
    const c = buildClearCookie(PENDING_COOKIE_NAME)
    expect(c.name).toBe(PENDING_COOKIE_NAME)
    expect(c.value).toBe('')
    expect(c.options.maxAge).toBe(0)
    expect(c.options.httpOnly).toBe(true)
    expect(c.options.sameSite).toBe('strict')
  })
})
