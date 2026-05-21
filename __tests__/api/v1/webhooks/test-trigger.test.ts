/**
 * Tests — POST /api/v1/webhooks/test
 *
 * Covers :
 *   - 400 without body / missing fields / unknown event / non-uuid id
 *   - 404 when webhook missing
 *   - 403 when secret mismatch (deliverWebhook NOT called)
 *   - 200 + delivered:true when deliverWebhook returns status 200 (+ row inserted)
 *   - 200 + delivered:false on non-2xx (still records the attempt)
 *   - 429 when rate-limited
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn(),
  getClientIp: vi.fn(),
  loggerError: vi.fn(),
  fetchRow: vi.fn(),
  deliveryInsert: vi.fn(),
  hookUpdate: vi.fn(),
  deliverWebhook: vi.fn(),
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
  captureError: vi.fn(),
}))

vi.mock('@/lib/webhooks', async () => {
  const actual = await vi.importActual<typeof import('@/lib/webhooks')>('@/lib/webhooks')
  return {
    ...actual,
    deliverWebhook: mocks.deliverWebhook,
  }
})

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'rge_os_webhooks') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => mocks.fetchRow(),
            }),
          }),
          update: (patch: unknown) => ({
            eq: async () => {
              mocks.hookUpdate(patch)
              return { error: null }
            },
          }),
        }
      }
      // rge_os_webhook_deliveries
      return {
        insert: async (row: unknown) => {
          mocks.deliveryInsert(row)
          return { error: null }
        },
      }
    },
  }),
}))

import { POST } from '@/app/api/v1/webhooks/test/route'

function buildPost(body: unknown): unknown {
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
  mocks.fetchRow.mockReturnValue({
    data: {
      id: '11111111-1111-1111-1111-111111111111',
      url: 'https://example.com/h',
      secret: 'the-stored-secret-of-correct-length-aaaaaa',
    },
    error: null,
  })
  mocks.deliverWebhook.mockResolvedValue({
    status: 200,
    duration_ms: 12,
    body_excerpt: 'ok',
    error: null,
  })
})

describe('POST /api/v1/webhooks/test — body validation', () => {
  it('returns 400 on invalid JSON', async () => {
    const res = await POST(buildPost('__INVALID_JSON__') as never)
    expect(res.status).toBe(400)
  })

  it('returns 400 when id+secret+event missing', async () => {
    const res = await POST(buildPost({}) as never)
    expect(res.status).toBe(400)
  })

  it('returns 400 when id is not a uuid', async () => {
    const res = await POST(
      buildPost({ id: 'nope', secret: 'x', event: 'rge.snapshot.refreshed' }) as never
    )
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { field?: string } }
    expect(body.error.field).toBe('id')
  })

  it('returns 400 when event is unknown', async () => {
    const res = await POST(
      buildPost({
        id: '11111111-1111-1111-1111-111111111111',
        secret: 'x',
        event: 'user.banned',
      }) as never
    )
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { field?: string; message: string } }
    expect(body.error.field).toBe('event')
  })
})

describe('POST /api/v1/webhooks/test — auth & delivery', () => {
  it('returns 404 when webhook does not exist', async () => {
    mocks.fetchRow.mockReturnValueOnce({ data: null, error: null })
    const res = await POST(
      buildPost({
        id: '11111111-1111-1111-1111-111111111111',
        secret: 'x',
        event: 'rge.snapshot.refreshed',
      }) as never
    )
    expect(res.status).toBe(404)
    expect(mocks.deliverWebhook).not.toHaveBeenCalled()
  })

  it('returns 403 on secret mismatch — deliverWebhook NOT called', async () => {
    const res = await POST(
      buildPost({
        id: '11111111-1111-1111-1111-111111111111',
        secret: 'wrong-secret-totally-different-bb',
        event: 'rge.snapshot.refreshed',
      }) as never
    )
    expect(res.status).toBe(403)
    expect(mocks.deliverWebhook).not.toHaveBeenCalled()
    expect(mocks.deliveryInsert).not.toHaveBeenCalled()
  })

  it('returns 200 + delivered:true + inserts delivery row on success', async () => {
    const res = await POST(
      buildPost({
        id: '11111111-1111-1111-1111-111111111111',
        secret: 'the-stored-secret-of-correct-length-aaaaaa',
        event: 'rge.snapshot.refreshed',
      }) as never
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as { delivered: boolean; status: number; duration_ms: number }
    expect(body.delivered).toBe(true)
    expect(body.status).toBe(200)
    expect(mocks.deliverWebhook).toHaveBeenCalledTimes(1)
    expect(mocks.deliveryInsert).toHaveBeenCalledTimes(1)
    const inserted = mocks.deliveryInsert.mock.calls[0][0] as Record<string, unknown>
    expect(inserted.webhook_id).toBe('11111111-1111-1111-1111-111111111111')
    expect(inserted.event).toBe('rge.snapshot.refreshed')
    expect(inserted.status).toBe(200)
    expect(mocks.hookUpdate).toHaveBeenCalledTimes(1)
    const update = mocks.hookUpdate.mock.calls[0][0] as Record<string, unknown>
    expect(update).toHaveProperty('last_delivery_at')
    expect(update.last_delivery_status).toBe(200)
  })

  it('returns 200 + delivered:false when subscriber endpoint returns 500', async () => {
    mocks.deliverWebhook.mockResolvedValueOnce({
      status: 500,
      duration_ms: 12,
      body_excerpt: 'down',
      error: null,
    })
    const res = await POST(
      buildPost({
        id: '11111111-1111-1111-1111-111111111111',
        secret: 'the-stored-secret-of-correct-length-aaaaaa',
        event: 'aides.bareme.updated',
      }) as never
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as { delivered: boolean; status: number }
    expect(body.delivered).toBe(false)
    expect(body.status).toBe(500)
    // Still records the attempt
    expect(mocks.deliveryInsert).toHaveBeenCalledTimes(1)
  })
})

describe('POST /api/v1/webhooks/test — rate limit', () => {
  it('returns 429 when rate-limited', async () => {
    mocks.checkRateLimit.mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 60_000,
    })
    const res = await POST(
      buildPost({
        id: '11111111-1111-1111-1111-111111111111',
        secret: 'x',
        event: 'rge.snapshot.refreshed',
      }) as never
    )
    expect(res.status).toBe(429)
  })
})
