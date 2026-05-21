/**
 * Tests — POST /api/v1/webhooks/admin-emit
 *
 * Covers :
 *   - 401 without auth / wrong bearer / env var missing
 *   - 429 when rate-limited (fail-open semantics asserted via allowed=true happy path)
 *   - 400 invalid JSON / non-object body / unknown event / invalid payload
 *   - 200 + summary when emitWebhookEvent succeeds (mocked)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn(),
  getClientIp: vi.fn(),
  loggerError: vi.fn(),
  captureError: vi.fn(),
  emitWebhookEvent: vi.fn(),
  createAdminClient: vi.fn(),
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

vi.mock('@/lib/webhooks/emit', async () => {
  const actual = await vi.importActual<typeof import('@/lib/webhooks/emit')>('@/lib/webhooks/emit')
  return {
    ...actual,
    emitWebhookEvent: mocks.emitWebhookEvent,
  }
})

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mocks.createAdminClient(),
}))

import { POST } from '@/app/api/v1/webhooks/admin-emit/route'

const VALID_KEY = 'admin-test-key-secret-32-chars-aaaa'

function buildPost(body: unknown, opts: { auth?: string } = {}): unknown {
  const headers = new Headers({ 'x-forwarded-for': '127.0.0.1' })
  if (opts.auth !== undefined) headers.set('authorization', opts.auth)
  return {
    headers,
    json: async () => {
      if (body === '__INVALID_JSON__') throw new Error('parse')
      return body
    },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.WEBHOOKS_ADMIN_API_KEY = VALID_KEY
  mocks.checkRateLimit.mockResolvedValue({
    allowed: true,
    remaining: 29,
    resetTime: Date.now() + 60_000,
  })
  mocks.getClientIp.mockReturnValue('127.0.0.1')
  mocks.createAdminClient.mockReturnValue({
    /* never called because emitWebhookEvent is mocked */
  })
  mocks.emitWebhookEvent.mockResolvedValue({
    event: 'rge.snapshot.refreshed',
    matched: 2,
    delivered: 2,
    failed_initial: 0,
    scheduled_retry: 0,
    circuit_broken: 0,
  })
})

afterEach(() => {
  delete process.env.WEBHOOKS_ADMIN_API_KEY
})

describe('POST /api/v1/webhooks/admin-emit — auth', () => {
  it('returns 401 without Authorization header', async () => {
    const res = await POST(
      buildPost({ event: 'rge.snapshot.refreshed', payload: { snapshot_date: 'x' } }) as never
    )
    expect(res.status).toBe(401)
    expect(mocks.emitWebhookEvent).not.toHaveBeenCalled()
  })

  it('returns 401 with wrong bearer', async () => {
    const res = await POST(
      buildPost(
        { event: 'rge.snapshot.refreshed', payload: { snapshot_date: 'x' } },
        { auth: 'Bearer wrong-key' }
      ) as never
    )
    expect(res.status).toBe(401)
    expect(mocks.emitWebhookEvent).not.toHaveBeenCalled()
  })

  it('returns 401 with malformed Authorization (no Bearer prefix)', async () => {
    const res = await POST(
      buildPost(
        { event: 'rge.snapshot.refreshed', payload: { snapshot_date: 'x' } },
        { auth: VALID_KEY }
      ) as never
    )
    expect(res.status).toBe(401)
  })

  it('returns 401 when WEBHOOKS_ADMIN_API_KEY env is missing (no bypass)', async () => {
    delete process.env.WEBHOOKS_ADMIN_API_KEY
    const res = await POST(
      buildPost(
        { event: 'rge.snapshot.refreshed', payload: { snapshot_date: 'x' } },
        { auth: `Bearer ` }
      ) as never
    )
    expect(res.status).toBe(401)
    expect(mocks.emitWebhookEvent).not.toHaveBeenCalled()
  })
})

describe('POST /api/v1/webhooks/admin-emit — body validation', () => {
  it('returns 400 on invalid JSON', async () => {
    const res = await POST(buildPost('__INVALID_JSON__', { auth: `Bearer ${VALID_KEY}` }) as never)
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('invalid_body')
  })

  it('returns 400 when body is null', async () => {
    const res = await POST(buildPost(null, { auth: `Bearer ${VALID_KEY}` }) as never)
    expect(res.status).toBe(400)
  })

  it('returns 400 invalid_event when event missing', async () => {
    const res = await POST(
      buildPost({ payload: { snapshot_date: 'x' } }, { auth: `Bearer ${VALID_KEY}` }) as never
    )
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('invalid_event')
  })

  it('returns 400 invalid_event for unknown event name', async () => {
    const res = await POST(
      buildPost({ event: 'user.banned', payload: {} }, { auth: `Bearer ${VALID_KEY}` }) as never
    )
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('invalid_event')
  })

  it('returns 400 invalid_payload when payload missing', async () => {
    const res = await POST(
      buildPost({ event: 'rge.snapshot.refreshed' }, { auth: `Bearer ${VALID_KEY}` }) as never
    )
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('invalid_payload')
  })

  it('returns 400 invalid_payload when payload is an array', async () => {
    const res = await POST(
      buildPost(
        { event: 'rge.snapshot.refreshed', payload: [] },
        { auth: `Bearer ${VALID_KEY}` }
      ) as never
    )
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('invalid_payload')
  })

  it('returns 400 invalid_payload when payload is a primitive', async () => {
    const res = await POST(
      buildPost(
        { event: 'rge.snapshot.refreshed', payload: 'a-string' },
        { auth: `Bearer ${VALID_KEY}` }
      ) as never
    )
    expect(res.status).toBe(400)
  })
})

describe('POST /api/v1/webhooks/admin-emit — rate-limit', () => {
  it('returns 429 when rate-limit denies', async () => {
    mocks.checkRateLimit.mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 60_000,
    })
    const res = await POST(
      buildPost(
        {
          event: 'rge.snapshot.refreshed',
          payload: {
            snapshot_date: '2026-05-21',
            providers_count: 1,
            qualifications_count: 1,
          },
        },
        { auth: `Bearer ${VALID_KEY}` }
      ) as never
    )
    expect(res.status).toBe(429)
    expect(mocks.emitWebhookEvent).not.toHaveBeenCalled()
  })
})

describe('POST /api/v1/webhooks/admin-emit — success path', () => {
  it('returns 200 + summary when emitWebhookEvent succeeds', async () => {
    const res = await POST(
      buildPost(
        {
          event: 'rge.snapshot.refreshed',
          payload: {
            snapshot_date: '2026-05-21',
            providers_count: 49228,
            qualifications_count: 165432,
          },
        },
        { auth: `Bearer ${VALID_KEY}` }
      ) as never
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as { ok: boolean; summary: { event: string; matched: number } }
    expect(body.ok).toBe(true)
    expect(body.summary.event).toBe('rge.snapshot.refreshed')
    expect(body.summary.matched).toBe(2)
    expect(mocks.emitWebhookEvent).toHaveBeenCalledTimes(1)
    const callArgs = mocks.emitWebhookEvent.mock.calls[0]
    expect(callArgs[0]).toBe('rge.snapshot.refreshed')
    expect(callArgs[1]).toMatchObject({ snapshot_date: '2026-05-21' })
  })

  it('returns 500 when emitWebhookEvent throws', async () => {
    mocks.emitWebhookEvent.mockRejectedValueOnce(new Error('boom'))
    const res = await POST(
      buildPost(
        {
          event: 'rge.snapshot.refreshed',
          payload: {
            snapshot_date: '2026-05-21',
            providers_count: 1,
            qualifications_count: 1,
          },
        },
        { auth: `Bearer ${VALID_KEY}` }
      ) as never
    )
    expect(res.status).toBe(500)
    expect(mocks.loggerError).toHaveBeenCalled()
    expect(mocks.captureError).toHaveBeenCalled()
  })
})
