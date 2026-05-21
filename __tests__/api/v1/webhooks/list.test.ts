/**
 * Tests — GET /api/v1/webhooks/list
 *
 * Covers :
 *   - 401 without Authorization
 *   - 401 with malformed bearer
 *   - 200 + array on valid api_key (mock supabase select)
 *   - secret column never returned in response shape
 *   - 429 when rate-limited
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn(),
  getClientIp: vi.fn(),
  loggerError: vi.fn(),
  selectByHash: vi.fn(),
  selectColumns: vi.fn(),
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

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      select: (cols: string) => {
        mocks.selectColumns(cols)
        return {
          eq: (_col: string, hash: string) => {
            mocks.selectByHash(hash)
            return {
              order: async () => {
                const r = mocks.selectByHash.mock.results.at(-1)?.value
                return r ?? { data: [], error: null }
              },
            }
          },
        }
      },
    }),
  }),
}))

import { GET } from '@/app/api/v1/webhooks/list/route'

function buildGet(headers: Record<string, string>): unknown {
  return {
    headers: new Headers(headers),
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
  mocks.selectByHash.mockReturnValue({
    data: [
      {
        id: '11111111-1111-1111-1111-111111111111',
        url: 'https://example.com/h',
        email: null,
        events: ['rge.snapshot.refreshed'],
        active: true,
        created_at: '2026-05-21T00:00:00Z',
        updated_at: '2026-05-21T00:00:00Z',
        last_delivery_at: null,
        last_delivery_status: null,
        consecutive_failures: 0,
      },
    ],
    error: null,
  })
})

describe('GET /api/v1/webhooks/list — auth', () => {
  it('returns 401 when Authorization header is missing', async () => {
    const res = await GET(buildGet({}) as never)
    expect(res.status).toBe(401)
    const body = (await res.json()) as { error: { code: string } }
    expect(body.error.code).toBe('unauthorized')
  })

  it('returns 401 when Authorization is malformed (no Bearer)', async () => {
    const res = await GET(buildGet({ authorization: 'sa_wh_aaaaaaaaaaaaaaaa' }) as never)
    expect(res.status).toBe(401)
  })

  it('returns 401 when bearer key too short', async () => {
    const res = await GET(buildGet({ authorization: 'Bearer short' }) as never)
    expect(res.status).toBe(401)
  })
})

describe('GET /api/v1/webhooks/list — happy path', () => {
  it('returns 200 + webhooks array on valid bearer', async () => {
    const res = await GET(
      buildGet({ authorization: 'Bearer sa_wh_aaaaaaaaaaaaaaaa1234567890abcdef' }) as never
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      webhooks: Array<Record<string, unknown>>
      count: number
      _meta: { license: string }
    }
    expect(Array.isArray(body.webhooks)).toBe(true)
    expect(body.webhooks).toHaveLength(1)
    expect(body.count).toBe(1)
    expect(body._meta.license).toBe('CC-BY-4.0')
  })

  it('NEVER returns the secret column in the response', async () => {
    const res = await GET(
      buildGet({ authorization: 'Bearer sa_wh_aaaaaaaaaaaaaaaa1234567890abcdef' }) as never
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as { webhooks: Array<Record<string, unknown>> }
    for (const hook of body.webhooks) {
      expect(hook).not.toHaveProperty('secret')
      expect(hook).not.toHaveProperty('api_key_hash')
    }
    // Verify select(...) does NOT request secret
    const cols = mocks.selectColumns.mock.calls[0]?.[0] as string | undefined
    expect(cols).toBeTruthy()
    expect(cols).not.toContain('secret')
    expect(cols).not.toContain('api_key_hash')
  })

  it('uses sha256 hash of bearer key to query (not plaintext)', async () => {
    const apiKey = 'sa_wh_aaaaaaaaaaaaaaaa1234567890abcdef'
    await GET(buildGet({ authorization: `Bearer ${apiKey}` }) as never)
    const queriedHash = mocks.selectByHash.mock.calls[0]?.[0] as string | undefined
    expect(queriedHash).toBeTruthy()
    expect(queriedHash).not.toBe(apiKey)
    expect(queriedHash).toMatch(/^[a-f0-9]{64}$/)
  })

  it('returns empty array for unknown api_key (no leakage of validity)', async () => {
    mocks.selectByHash.mockReturnValueOnce({ data: [], error: null })
    const res = await GET(
      buildGet({ authorization: 'Bearer sa_wh_unknown_unknown_unknown_unknown' }) as never
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as { webhooks: unknown[]; count: number }
    expect(body.count).toBe(0)
  })
})

describe('GET /api/v1/webhooks/list — rate limit', () => {
  it('returns 429 when rate-limited', async () => {
    mocks.checkRateLimit.mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 60_000,
    })
    const res = await GET(
      buildGet({ authorization: 'Bearer sa_wh_aaaaaaaaaaaaaaaa1234567890abcdef' }) as never
    )
    expect(res.status).toBe(429)
  })
})
