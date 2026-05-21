/**
 * Tests — POST /api/v1/ask/sessions
 *
 * Covers :
 *   - 201 happy path returns session_id + public_key + expires_at + message_cap
 *   - 429 on rate-limit deny
 *   - 500 on supabase insert error (captureError invoked)
 *   - user-agent and IP are forwarded to the DB row (ip_first / user_agent_first)
 *   - response envelope carries _meta.docs pointing to API-V1-ASK-SESSIONS.md
 *   - GET discovery endpoint returns metadata + ttl
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

import { GET, POST } from '@/app/api/v1/ask/sessions/route'

function buildPost(headers: Record<string, string> = {}): unknown {
  return {
    headers: new Headers(headers),
    json: async () => ({}),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.checkRateLimit.mockResolvedValue({
    allowed: true,
    remaining: 29,
    resetTime: Date.now() + 60_000,
  })
  mocks.getClientIp.mockReturnValue('203.0.113.10')
  mocks.supabaseInsert.mockReturnValue({
    data: {
      id: '11111111-2222-3333-4444-555555555555',
      public_key: 'PK-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      created_at: '2026-05-21T00:00:00Z',
      last_activity_at: '2026-05-21T00:00:00Z',
      expires_at: '2026-06-20T00:00:00Z',
      message_count: 0,
    },
    error: null,
  })
})

describe('POST /api/v1/ask/sessions — happy path', () => {
  it('returns 201 with session_id, public_key, expires_at, message_cap', async () => {
    const res = await POST(buildPost({ 'user-agent': 'curl/8.0' }) as never)
    expect(res.status).toBe(201)
    const body = (await res.json()) as {
      session_id: string
      public_key: string
      expires_at: string
      message_cap: number
      _meta: { docs: string }
    }
    expect(body.session_id).toBe('11111111-2222-3333-4444-555555555555')
    expect(body.public_key).toMatch(/^PK-/)
    expect(body.expires_at).toBe('2026-06-20T00:00:00Z')
    expect(body.message_cap).toBe(50)
    expect(body._meta.docs).toContain('API-V1-ASK-SESSIONS')
  })

  it('forwards IP and user-agent into the inserted row', async () => {
    await POST(buildPost({ 'user-agent': 'TestUA/1.0' }) as never)
    expect(mocks.supabaseInsert).toHaveBeenCalledTimes(1)
    const inserted = mocks.supabaseInsert.mock.calls[0][0] as {
      public_key: string
      ip_first: string
      user_agent_first: string
    }
    expect(inserted.ip_first).toBe('203.0.113.10')
    expect(inserted.user_agent_first).toBe('TestUA/1.0')
    expect(inserted.public_key.length).toBeGreaterThanOrEqual(32)
  })
})

describe('POST /api/v1/ask/sessions — failure paths', () => {
  it('returns 429 when the rate-limiter denies', async () => {
    mocks.checkRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 30_000,
    })
    const res = await POST(buildPost() as never)
    expect(res.status).toBe(429)
    expect(mocks.supabaseInsert).not.toHaveBeenCalled()
  })

  it('returns 500 + captureError on supabase insert error', async () => {
    mocks.supabaseInsert.mockReturnValue({ data: null, error: { message: 'boom' } })
    const res = await POST(buildPost() as never)
    expect(res.status).toBe(500)
    expect(mocks.captureError).toHaveBeenCalledTimes(1)
    expect(mocks.loggerError).toHaveBeenCalled()
  })

  it('uses fail-open rate-limit config (30/min, failOpen=true)', async () => {
    await POST(buildPost() as never)
    expect(mocks.checkRateLimit).toHaveBeenCalledWith(
      expect.stringContaining('v1-ask-sessions-create:'),
      expect.objectContaining({ failOpen: true, max: 30, window: 60_000 })
    )
  })
})

describe('GET /api/v1/ask/sessions — discovery', () => {
  it('returns metadata + ttl + cap', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      endpoint: string
      method: string
      ttl_days: number
      message_cap: number
      rate_limit: string
    }
    expect(body.endpoint).toBe('/api/v1/ask/sessions')
    expect(body.method).toBe('POST')
    expect(body.ttl_days).toBe(30)
    expect(body.message_cap).toBe(50)
    expect(body.rate_limit).toContain('30')
  })
})
