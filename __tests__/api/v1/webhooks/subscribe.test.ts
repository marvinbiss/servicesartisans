/**
 * Tests — POST /api/v1/webhooks/subscribe
 *
 * Covers :
 *   - 400 on invalid body (non-JSON, non-object, missing url/events)
 *   - 400 on bad URL (validateWebhookUrl reject)
 *   - 400 on unknown event in events[]
 *   - 429 when rate-limiter denies
 *   - 201 happy path : returns id, secret, api_key, events (mock supabase insert)
 *   - 500 when supabase insert fails
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn(),
  getClientIp: vi.fn(),
  loggerError: vi.fn(),
  captureError: vi.fn(),
  supabaseInsert: vi.fn(),
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
      insert: (row: unknown) => {
        mocks.supabaseInsert(row)
        return {
          select: () => ({
            single: async () => {
              const r = mocks.supabaseInsert.mock.results.at(-1)?.value as
                | { data?: unknown; error?: unknown }
                | undefined
              return r ?? { data: null, error: null }
            },
          }),
        }
      },
    }),
  }),
}))

import { POST } from '@/app/api/v1/webhooks/subscribe/route'

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
  mocks.supabaseInsert.mockReturnValue({
    data: {
      id: '11111111-1111-1111-1111-111111111111',
      events: ['rge.snapshot.refreshed'],
      created_at: '2026-05-21T00:00:00Z',
    },
    error: null,
  })
})

describe('POST /api/v1/webhooks/subscribe — body validation', () => {
  it('returns 400 on invalid JSON body', async () => {
    const res = await POST(buildPost('__INVALID_JSON__') as never)
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('invalid_body')
  })

  it('returns 400 when body is not an object', async () => {
    const res = await POST(buildPost('a string') as never)
    expect(res.status).toBe(400)
  })

  it('returns 400 with field=url when url missing', async () => {
    const res = await POST(buildPost({ events: ['rge.snapshot.refreshed'] }) as never)
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { field?: string } }
    expect(body.error.field).toBe('url')
  })

  it('returns 400 with field=url when url is malformed', async () => {
    const res = await POST(
      buildPost({ url: 'not a url', events: ['rge.snapshot.refreshed'] }) as never
    )
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { field?: string } }
    expect(body.error.field).toBe('url')
  })

  it('returns 400 with field=email when email is malformed', async () => {
    const res = await POST(
      buildPost({
        url: 'https://example.com/h',
        email: 'not-an-email',
        events: ['rge.snapshot.refreshed'],
      }) as never
    )
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { field?: string } }
    expect(body.error.field).toBe('email')
  })

  it('returns 400 with field=events when events is missing or empty', async () => {
    const res = await POST(buildPost({ url: 'https://example.com/h' }) as never)
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { field?: string } }
    expect(body.error.field).toBe('events')
  })

  it('returns 400 when events contains unknown string', async () => {
    const res = await POST(
      buildPost({ url: 'https://example.com/h', events: ['user.banned'] }) as never
    )
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: { field?: string; message: string } }
    expect(body.error.field).toBe('events')
    expect(body.error.message).toContain('user.banned')
  })
})

describe('POST /api/v1/webhooks/subscribe — rate limit', () => {
  it('returns 429 when rate limiter denies', async () => {
    mocks.checkRateLimit.mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 60_000,
    })
    const res = await POST(
      buildPost({
        url: 'https://example.com/h',
        events: ['rge.snapshot.refreshed'],
      }) as never
    )
    expect(res.status).toBe(429)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('rate_limit')
  })
})

describe('POST /api/v1/webhooks/subscribe — happy path', () => {
  it('returns 201 with id, secret, api_key, events on success', async () => {
    const res = await POST(
      buildPost({
        url: 'https://example.com/h',
        events: ['rge.snapshot.refreshed', 'aides.bareme.updated'],
      }) as never
    )
    expect(res.status).toBe(201)
    const body = (await res.json()) as {
      id: string
      secret: string
      api_key: string
      events: string[]
      created_at: string
      _meta: { license: string; notice?: string }
    }
    expect(body.id).toBe('11111111-1111-1111-1111-111111111111')
    expect(body.secret).toMatch(/^[a-f0-9]{64}$/)
    expect(body.api_key).toMatch(/^sa_wh_/)
    expect(body.events).toContain('rge.snapshot.refreshed')
    expect(body._meta.license).toBe('CC-BY-4.0')
    expect(body._meta.notice).toContain('ONCE')

    // Verify supabase insert was called with hashed api_key, not plaintext
    expect(mocks.supabaseInsert).toHaveBeenCalledTimes(1)
    const inserted = mocks.supabaseInsert.mock.calls[0][0] as Record<string, unknown>
    expect(inserted).toHaveProperty('url', 'https://example.com/h')
    expect(inserted).toHaveProperty('api_key_hash')
    expect(inserted.api_key_hash).not.toBe(body.api_key)
    expect(String(inserted.api_key_hash)).toMatch(/^[a-f0-9]{64}$/)
    expect(inserted).toHaveProperty('secret', body.secret)
    expect(inserted.active).toBe(true)
  })

  it('returns 500 when supabase insert errors', async () => {
    mocks.supabaseInsert.mockReturnValueOnce({
      data: null,
      error: { message: 'unique violation' },
    })
    const res = await POST(
      buildPost({
        url: 'https://example.com/h',
        events: ['rge.snapshot.refreshed'],
      }) as never
    )
    expect(res.status).toBe(500)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('internal_error')
  })
})
