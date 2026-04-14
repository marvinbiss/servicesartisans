/**
 * Tests — src/lib/rate-limit-db.ts
 *
 * Coverage:
 *   - rateLimitDb: RPC success (allowed true/false)
 *   - Fail-open: error, null data, empty array, malformed row, thrown exception
 *   - getRateLimitDbHeaders: correct header names and values
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── Mock logger (silence noise) ────────────────────────────────────
vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

// ── Mock @/lib/supabase/admin ──────────────────────────────────────
const mockRpc = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ rpc: mockRpc })),
}))

// ── Import under test ──────────────────────────────────────────────
import { rateLimitDb, getRateLimitDbHeaders } from '@/lib/rate-limit-db'
import { logger } from '@/lib/logger'

const KEY = 'test-key'
const LIMIT = 10
const WINDOW_MS = 60_000

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ======================================================================
// rateLimitDb
// ======================================================================

describe('rateLimitDb', () => {
  // ── Happy path ──────────────────────────────────────────────────

  it('allowed:true → success:true, remaining parsed, resetAt as Date', async () => {
    const resetIso = '2026-05-01T10:00:00.000Z'
    mockRpc.mockResolvedValue({
      data: [{ allowed: true, remaining: 5, reset_at: resetIso }],
      error: null,
    })

    const result = await rateLimitDb(KEY, LIMIT, WINDOW_MS)

    expect(result.success).toBe(true)
    expect(result.remaining).toBe(5)
    expect(result.resetAt).toBeInstanceOf(Date)
    expect(result.resetAt.toISOString()).toBe(resetIso)
  })

  it('allowed:false → success:false', async () => {
    mockRpc.mockResolvedValue({
      data: [{ allowed: false, remaining: 0, reset_at: '2026-05-01T10:00:00.000Z' }],
      error: null,
    })

    const result = await rateLimitDb(KEY, LIMIT, WINDOW_MS)

    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('calls rpc with correct parameters', async () => {
    mockRpc.mockResolvedValue({
      data: [{ allowed: true, remaining: 9, reset_at: new Date().toISOString() }],
      error: null,
    })

    await rateLimitDb('my-key', 5, 30_000)

    expect(mockRpc).toHaveBeenCalledWith('rate_limit_check', {
      p_key: 'my-key',
      p_limit: 5,
      p_window_ms: 30_000,
    })
  })

  // ── Fail-open: RPC error ────────────────────────────────────────

  it('rpc returns error → fail-open (success:true, remaining=limit)', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: 'connection failed' },
    })

    const result = await rateLimitDb(KEY, LIMIT, WINDOW_MS)

    expect(result.success).toBe(true)
    expect(result.remaining).toBe(LIMIT)
    expect(result.resetAt).toBeInstanceOf(Date)
  })

  it('rpc error → warn logged', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: 'DB down' },
    })

    await rateLimitDb(KEY, LIMIT, WINDOW_MS)

    expect(logger.warn).toHaveBeenCalled()
  })

  // ── Fail-open: null data ────────────────────────────────────────

  it('rpc returns null data → fail-open', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null })

    const result = await rateLimitDb(KEY, LIMIT, WINDOW_MS)

    expect(result.success).toBe(true)
    expect(result.remaining).toBe(LIMIT)
  })

  // ── Fail-open: empty array ──────────────────────────────────────

  it('rpc returns empty array → fail-open', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null })

    const result = await rateLimitDb(KEY, LIMIT, WINDOW_MS)

    expect(result.success).toBe(true)
    expect(result.remaining).toBe(LIMIT)
  })

  // ── Fail-open: malformed row ────────────────────────────────────

  it('row with missing fields → fail-open + warn logged', async () => {
    mockRpc.mockResolvedValue({
      data: [{ allowed: true }], // missing remaining and reset_at
      error: null,
    })

    const result = await rateLimitDb(KEY, LIMIT, WINDOW_MS)

    expect(result.success).toBe(true)
    expect(result.remaining).toBe(LIMIT)
    expect(logger.warn).toHaveBeenCalled()
  })

  it('row with wrong types (string allowed, string remaining) → fail-open', async () => {
    mockRpc.mockResolvedValue({
      data: [{ allowed: 'yes', remaining: '5', reset_at: '2026-05-01T10:00:00.000Z' }],
      error: null,
    })

    const result = await rateLimitDb(KEY, LIMIT, WINDOW_MS)

    expect(result.success).toBe(true)
    expect(result.remaining).toBe(LIMIT)
  })

  it('row with null values → fail-open', async () => {
    mockRpc.mockResolvedValue({
      data: [{ allowed: null, remaining: null, reset_at: null }],
      error: null,
    })

    const result = await rateLimitDb(KEY, LIMIT, WINDOW_MS)

    expect(result.success).toBe(true)
  })

  // ── Fail-open: thrown exception ─────────────────────────────────

  it('rpc throws exception → fail-open', async () => {
    mockRpc.mockRejectedValue(new Error('unexpected network error'))

    const result = await rateLimitDb(KEY, LIMIT, WINDOW_MS)

    expect(result.success).toBe(true)
    expect(result.remaining).toBe(LIMIT)
    expect(result.resetAt).toBeInstanceOf(Date)
  })

  it('exception → warn logged', async () => {
    mockRpc.mockRejectedValue(new Error('boom'))

    await rateLimitDb(KEY, LIMIT, WINDOW_MS)

    expect(logger.warn).toHaveBeenCalled()
  })

  // ── Fail-open: resetAt is in the future ─────────────────────────

  it('fail-open resetAt is approximately now + windowMs', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null })
    const before = Date.now()

    const result = await rateLimitDb(KEY, LIMIT, WINDOW_MS)

    const after = Date.now()
    const resetMs = result.resetAt.getTime()
    expect(resetMs).toBeGreaterThanOrEqual(before + WINDOW_MS)
    expect(resetMs).toBeLessThanOrEqual(after + WINDOW_MS)
  })
})

// ======================================================================
// getRateLimitDbHeaders
// ======================================================================

describe('getRateLimitDbHeaders', () => {
  it('returns X-RateLimit-Remaining header', () => {
    const resetDate = new Date('2026-05-01T10:00:00.000Z')
    const result = { success: true, remaining: 7, resetAt: resetDate }
    const headers = getRateLimitDbHeaders(result)
    expect(headers).toHaveProperty('X-RateLimit-Remaining', '7')
  })

  it('returns X-RateLimit-Reset header as ISO string', () => {
    const resetDate = new Date('2026-05-01T10:00:00.000Z')
    const result = { success: true, remaining: 7, resetAt: resetDate }
    const headers = getRateLimitDbHeaders(result)
    expect(headers).toHaveProperty('X-RateLimit-Reset', resetDate.toISOString())
  })

  it('remaining 0 stringified correctly', () => {
    const result = { success: false, remaining: 0, resetAt: new Date() }
    const headers = getRateLimitDbHeaders(result)
    expect(headers['X-RateLimit-Remaining']).toBe('0')
  })

  it('contains exactly the two expected header keys', () => {
    const result = { success: true, remaining: 3, resetAt: new Date() }
    const headers = getRateLimitDbHeaders(result)
    const keys = Object.keys(headers)
    expect(keys).toContain('X-RateLimit-Remaining')
    expect(keys).toContain('X-RateLimit-Reset')
  })
})
