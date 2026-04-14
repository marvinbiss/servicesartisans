/**
 * Tests — GET /api/cee/partners/me
 * Covers MUST-13 (user_id filter, RLS-respecting client).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockJsonFn = vi.fn(
  (body: unknown, init?: { status?: number }) => ({
    body,
    status: init?.status ?? 200,
  })
)
vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => mockJsonFn(body, init),
  },
}))

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

const eqMock = vi.fn()
const maybeSingleMock = vi.fn()

const mockSupabase = {
  auth: {
    getUser: vi.fn(async () => ({
      data: { user: { id: 'user-A', email: 'a@b.fr' } },
      error: null,
    })),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: (col: string, val: string) => {
        eqMock(col, val)
        return { maybeSingle: maybeSingleMock }
      },
    })),
  })),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => mockSupabase),
}))

type MockResult = { body: Record<string, unknown>; status: number }

function makeRequest() {
  return new Request('http://localhost:3000/api/cee/partners/me', {
    method: 'GET',
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  maybeSingleMock.mockResolvedValue({
    data: { id: 'partner-A', user_id: 'user-A', status: 'onboarding' },
    error: null,
  })
})

afterEach(() => {
  vi.resetModules()
})

describe('GET /api/cee/partners/me', () => {
  it('returns the authenticated user record', async () => {
    const { GET } = await import('@/app/api/cee/partners/me/route')
    const res = (await GET(makeRequest() as never)) as unknown as MockResult

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      success: true,
      data: { id: 'partner-A', user_id: 'user-A' },
    })
  })

  it('filters by user_id (MUST-13 — defense in depth)', async () => {
    const { GET } = await import('@/app/api/cee/partners/me/route')
    await GET(makeRequest() as never)

    expect(eqMock).toHaveBeenCalledWith('user_id', 'user-A')
  })

  it('returns 401 when not authenticated', async () => {
    ;(mockSupabase.auth.getUser as unknown as { mockResolvedValueOnce: (v: unknown) => void }).mockResolvedValueOnce({
      data: { user: null },
      error: null,
    })
    const { GET } = await import('@/app/api/cee/partners/me/route')
    const res = (await GET(makeRequest() as never)) as unknown as MockResult
    expect(res.status).toBe(401)
  })

  it('returns null data when no partner row exists', async () => {
    maybeSingleMock.mockResolvedValueOnce({ data: null, error: null })
    const { GET } = await import('@/app/api/cee/partners/me/route')
    const res = (await GET(makeRequest() as never)) as unknown as MockResult
    expect(res.status).toBe(200)
    expect((res.body as { data: unknown }).data).toBeNull()
  })
})
