/**
 * Tests — GET /api/admin/webhooks/deliveries
 *
 * Covers :
 *   - 403 when requirePermission rejects
 *   - 400 when id missing / not uuid
 *   - 200 + returns projected deliveries (response_body_excerpt → body_excerpt)
 *   - 500 on supabase error
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  loggerError: vi.fn(),
  selectResult: vi.fn(),
}))

vi.mock('@/lib/admin-auth', () => ({
  requirePermission: mocks.requirePermission,
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: mocks.loggerError,
  },
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: async () => mocks.selectResult(),
          }),
        }),
      }),
    }),
  }),
}))

import { GET } from '@/app/api/admin/webhooks/deliveries/route'

function buildGet(searchParams: Record<string, string>): unknown {
  const url = new URL('https://srv/api/admin/webhooks/deliveries')
  for (const [k, v] of Object.entries(searchParams)) {
    url.searchParams.set(k, v)
  }
  return {
    nextUrl: url,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.requirePermission.mockResolvedValue({
    success: true,
    admin: { id: 'admin', email: 'op@sa.fr', role: 'admin', permissions: {} },
  })
  mocks.selectResult.mockResolvedValue({
    data: [
      {
        id: 1,
        event: 'rge.snapshot.refreshed',
        status: 200,
        duration_ms: 12,
        response_body_excerpt: 'ok',
        error: null,
        created_at: '2026-05-21T10:00:00.000Z',
        attempt: 1,
      },
      {
        id: 2,
        event: 'aides.bareme.updated',
        status: null,
        duration_ms: 10010,
        response_body_excerpt: '',
        error: 'timeout',
        created_at: '2026-05-20T10:00:00.000Z',
        attempt: 3,
      },
    ],
    error: null,
  })
})

describe('GET /api/admin/webhooks/deliveries — auth', () => {
  it('returns the auth error when requirePermission rejects', async () => {
    const errResponse = { status: 403 }
    mocks.requirePermission.mockResolvedValueOnce({ success: false, error: errResponse })
    const res = (await GET(
      buildGet({ id: '11111111-1111-1111-1111-111111111111' }) as never
    )) as unknown
    expect(res).toBe(errResponse)
  })
})

describe('GET /api/admin/webhooks/deliveries — validation', () => {
  it('returns 400 when id missing', async () => {
    const res = await GET(buildGet({}) as never)
    expect(res.status).toBe(400)
  })

  it('returns 400 when id is not a uuid', async () => {
    const res = await GET(buildGet({ id: 'not-uuid' }) as never)
    expect(res.status).toBe(400)
  })
})

describe('GET /api/admin/webhooks/deliveries — happy path', () => {
  it('returns 200 + projects response_body_excerpt to body_excerpt', async () => {
    const res = await GET(buildGet({ id: '11111111-1111-1111-1111-111111111111' }) as never)
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      deliveries: Array<{
        id: number
        body_excerpt: string | null
        attempt: number
        status: number | null
        error: string | null
      }>
      count: number
    }
    expect(body.count).toBe(2)
    expect(body.deliveries[0].body_excerpt).toBe('ok')
    expect(body.deliveries[0].attempt).toBe(1)
    expect(body.deliveries[1].status).toBeNull()
    expect(body.deliveries[1].error).toBe('timeout')
  })

  it('handles empty result set without throwing', async () => {
    mocks.selectResult.mockResolvedValueOnce({ data: [], error: null })
    const res = await GET(buildGet({ id: '11111111-1111-1111-1111-111111111111' }) as never)
    expect(res.status).toBe(200)
    const body = (await res.json()) as { deliveries: unknown[]; count: number }
    expect(body.count).toBe(0)
    expect(body.deliveries).toEqual([])
  })

  it('sends Cache-Control: no-store', async () => {
    const res = await GET(buildGet({ id: '11111111-1111-1111-1111-111111111111' }) as never)
    expect(res.headers.get('Cache-Control')).toBe('no-store')
  })
})

describe('GET /api/admin/webhooks/deliveries — supabase error', () => {
  it('returns 500 when supabase errors', async () => {
    mocks.selectResult.mockResolvedValueOnce({ data: null, error: { message: 'pgrst' } })
    const res = await GET(buildGet({ id: '11111111-1111-1111-1111-111111111111' }) as never)
    expect(res.status).toBe(500)
    expect(mocks.loggerError).toHaveBeenCalled()
  })
})
