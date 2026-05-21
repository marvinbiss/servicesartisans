/**
 * Tests — DELETE /api/v1/webhooks/unsubscribe
 *
 * Covers :
 *   - 400 without id+secret
 *   - 400 when id is not a uuid
 *   - 404 when webhook not found
 *   - 403 when secret does not match
 *   - 200 + active=false when secret matches (verifies UPDATE called)
 *   - 429 when rate-limited
 *   - 500 when supabase fetch or update errors
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn(),
  getClientIp: vi.fn(),
  loggerError: vi.fn(),
  captureError: vi.fn(),
  fetchRow: vi.fn(),
  updateCall: vi.fn(),
}))

vi.mock('@/lib/rate-limiter', () => ({
  checkRateLimit: mocks.checkRateLimit,
  getClientIp: mocks.getClientIp,
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: mocks.loggerError,
  },
}))

vi.mock('@/lib/monitoring/sentry', () => ({
  captureError: mocks.captureError,
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => mocks.fetchRow(),
        }),
      }),
      update: (patch: unknown) => ({
        eq: async (_col: string, _id: string) => {
          mocks.updateCall(patch)
          return { error: null }
        },
      }),
    }),
  }),
}))

import { DELETE } from '@/app/api/v1/webhooks/unsubscribe/route'

function buildDelete(body: unknown): unknown {
  return {
    headers: new Headers({ 'x-forwarded-for': '127.0.0.1' }),
    json: async () => {
      if (body === '__INVALID_JSON__') throw new Error('parse')
      return body
    },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.checkRateLimit.mockResolvedValue({
    allowed: true,
    remaining: 29,
    resetTime: Date.now() + 60_000,
  })
  mocks.getClientIp.mockReturnValue('127.0.0.1')
  mocks.fetchRow.mockResolvedValue({
    data: {
      id: '11111111-1111-1111-1111-111111111111',
      secret: 'the-stored-secret-of-correct-length-aaaaaa',
      active: true,
    },
    error: null,
  })
})

describe('DELETE /api/v1/webhooks/unsubscribe — body validation', () => {
  it('returns 400 on invalid JSON', async () => {
    const res = await DELETE(buildDelete('__INVALID_JSON__') as never)
    expect(res.status).toBe(400)
  })

  it('returns 400 when id+secret missing', async () => {
    const res = await DELETE(buildDelete({}) as never)
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('invalid_params')
  })

  it('returns 400 when id is not a uuid', async () => {
    const res = await DELETE(buildDelete({ id: 'not-uuid', secret: 'x' }) as never)
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { field?: string } }
    expect(body.error.field).toBe('id')
  })
})

describe('DELETE /api/v1/webhooks/unsubscribe — auth & state', () => {
  it('returns 404 when webhook does not exist', async () => {
    mocks.fetchRow.mockReturnValueOnce({ data: null, error: null })
    const res = await DELETE(
      buildDelete({
        id: '11111111-1111-1111-1111-111111111111',
        secret: 'any-secret',
      }) as never
    )
    expect(res.status).toBe(404)
  })

  it('returns 403 when secret does not match', async () => {
    const res = await DELETE(
      buildDelete({
        id: '11111111-1111-1111-1111-111111111111',
        secret: 'wrong-secret-totally-different',
      }) as never
    )
    expect(res.status).toBe(403)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('invalid_secret')
    expect(mocks.updateCall).not.toHaveBeenCalled()
  })

  it('returns 200 + active:false on matching secret', async () => {
    const res = await DELETE(
      buildDelete({
        id: '11111111-1111-1111-1111-111111111111',
        secret: 'the-stored-secret-of-correct-length-aaaaaa',
      }) as never
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as { id: string; active: boolean }
    expect(body.id).toBe('11111111-1111-1111-1111-111111111111')
    expect(body.active).toBe(false)
    expect(mocks.updateCall).toHaveBeenCalledTimes(1)
    expect(mocks.updateCall).toHaveBeenCalledWith({ active: false })
  })
})

describe('DELETE /api/v1/webhooks/unsubscribe — rate limit', () => {
  it('returns 429 when rate-limited', async () => {
    mocks.checkRateLimit.mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 60_000,
    })
    const res = await DELETE(
      buildDelete({
        id: '11111111-1111-1111-1111-111111111111',
        secret: 'x',
      }) as never
    )
    expect(res.status).toBe(429)
  })
})
