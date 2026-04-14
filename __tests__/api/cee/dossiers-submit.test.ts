/**
 * Tests — POST /api/cee/dossiers/[id]/submit
 *
 * Covers:
 *   - Auth obligatoire (401)
 *   - CSRF validateOrigin (403)
 *   - Rate-limit 3/min (429)
 *   - Ownership check (404 when not owner)
 *   - Transition draft → submitted_by_artisan (200)
 *   - Transition illégale (ex. qa_pending → submitted_by_artisan) retourne 422
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockJsonFn = vi.fn(
  (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
    body,
    status: init?.status ?? 200,
    headers: init?.headers ?? {},
  })
)
vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) =>
      mockJsonFn(body, init),
  },
}))

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

// ---------------------------------------------------------------------------
// Supabase mocks
// ---------------------------------------------------------------------------
const getDossierMock = vi.fn()
const getOwnerMock = vi.fn()
const updateMock = vi.fn()
const _insertEventMock = vi.fn().mockResolvedValue({ error: null })
void _insertEventMock;

const mockSupabase = {
  auth: {
    getUser: vi.fn(async () => ({
      data: { user: { id: 'user-1', email: 'a@b.fr' } },
      error: null,
    })),
  },
  from: vi.fn((table: string) => {
    if (table === 'cee_dossiers') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: getDossierMock,
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: updateMock,
            })),
          })),
        })),
        insert: vi.fn(() => ({
          then: vi.fn((cb: (r: unknown) => void) => cb({ error: null })),
        })),
      }
    }
    if (table === 'cee_artisan_partners') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: getOwnerMock,
            })),
          })),
        })),
      }
    }
    if (table === 'cee_dossier_events') {
      return {
        insert: vi.fn(() => ({
          then: vi.fn((cb: (r: { error: null }) => void) => { cb({ error: null }); return undefined }),
        })),
      }
    }
    return {}
  }),
}

const mockAdmin = {
  from: vi.fn((table: string) => {
    if (table === 'cee_dossiers') {
      return {
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: updateMock,
            })),
          })),
        })),
      }
    }
    if (table === 'cee_dossier_events') {
      return {
        insert: vi.fn(() => ({
          then: vi.fn((cb: (r: { error: null }) => void) => { cb({ error: null }); return undefined }),
        })),
      }
    }
    return {}
  }),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => mockSupabase),
}))
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockAdmin),
}))

type MockResult = { body: Record<string, unknown>; status: number }

function makeRequest(id: string, headers?: Record<string, string>) {
  return new Request(`http://localhost:3000/api/cee/dossiers/${id}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

const originalEnv = { ...process.env }

beforeEach(async () => {
  vi.clearAllMocks()
  ;(process.env as Record<string, string | undefined>) = {
    ...originalEnv,
    NODE_ENV: 'test',
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  }
  getDossierMock.mockResolvedValue({
    data: { id: 'dossier-1', partner_id: 'partner-1', status: 'draft' },
    error: null,
  })
  getOwnerMock.mockResolvedValue({ data: { id: 'partner-1' }, error: null })
  updateMock.mockResolvedValue({
    data: { id: 'dossier-1', reference: 'SAE-202604-000001', status: 'submitted_by_artisan', updated_at: '2026-04-14T10:00:00Z' },
    error: null,
  })
  const rl = await import('@/lib/cee/rate-limit')
  rl._resetRateLimitStoreForTests()
})
afterEach(() => {
  process.env = { ...originalEnv }
  vi.resetModules()
})

describe('POST /api/cee/dossiers/[id]/submit', () => {
  it('returns 401 when not authenticated', async () => {
    ;(mockSupabase.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { user: null },
      error: null,
    })
    const { POST } = await import('@/app/api/cee/dossiers/[id]/submit/route')
    const ctx = { params: { id: 'dossier-1' } }
    const res = (await POST(makeRequest('dossier-1') as never, ctx as never)) as unknown as MockResult
    expect(res.status).toBe(401)
  })

  it('returns 403 on CSRF cross-site request', async () => {
    const { POST } = await import('@/app/api/cee/dossiers/[id]/submit/route')
    const ctx = { params: { id: 'dossier-1' } }
    const res = (await POST(
      makeRequest('dossier-1', { 'Sec-Fetch-Site': 'cross-site' }) as never,
      ctx as never
    )) as unknown as MockResult
    expect(res.status).toBe(403)
  })

  it('returns 429 after 3 requests/min', async () => {
    const { POST } = await import('@/app/api/cee/dossiers/[id]/submit/route')
    const ctx = { params: { id: 'dossier-1' } }
    for (let i = 0; i < 3; i++) {
      await POST(makeRequest('dossier-1') as never, ctx as never)
    }
    const res = (await POST(makeRequest('dossier-1') as never, ctx as never)) as unknown as MockResult
    expect(res.status).toBe(429)
  })

  it('returns 404 when dossier not found', async () => {
    getDossierMock.mockResolvedValueOnce({ data: null, error: null })
    const { POST } = await import('@/app/api/cee/dossiers/[id]/submit/route')
    const ctx = { params: { id: 'nonexistent' } }
    const res = (await POST(makeRequest('nonexistent') as never, ctx as never)) as unknown as MockResult
    expect(res.status).toBe(404)
  })

  it('returns 404 when user is not the owner', async () => {
    getOwnerMock.mockResolvedValueOnce({ data: null, error: null })
    const { POST } = await import('@/app/api/cee/dossiers/[id]/submit/route')
    const ctx = { params: { id: 'dossier-1' } }
    const res = (await POST(makeRequest('dossier-1') as never, ctx as never)) as unknown as MockResult
    expect(res.status).toBe(404)
  })

  it('transitions draft → submitted_by_artisan (200)', async () => {
    const { POST } = await import('@/app/api/cee/dossiers/[id]/submit/route')
    const ctx = { params: { id: 'dossier-1' } }
    const res = (await POST(makeRequest('dossier-1') as never, ctx as never)) as unknown as MockResult
    expect(res.status).toBe(200)
    expect((res.body as { success: boolean }).success).toBe(true)
    const data = (res.body as { data: { status: string } }).data
    expect(data.status).toBe('submitted_by_artisan')
  })

  it('returns 422 on illegal transition (qa_pending → submitted_by_artisan)', async () => {
    getDossierMock.mockResolvedValueOnce({
      data: { id: 'dossier-1', partner_id: 'partner-1', status: 'qa_pending' },
      error: null,
    })
    const { POST } = await import('@/app/api/cee/dossiers/[id]/submit/route')
    const ctx = { params: { id: 'dossier-1' } }
    const res = (await POST(makeRequest('dossier-1') as never, ctx as never)) as unknown as MockResult
    expect(res.status).toBe(422)
    const body = res.body as { error: { code: string } }
    expect(body.error.code).toBe('ILLEGAL_TRANSITION')
  })

  it('returns 422 on illegal transition (validated → submitted_by_artisan)', async () => {
    getDossierMock.mockResolvedValueOnce({
      data: { id: 'dossier-1', partner_id: 'partner-1', status: 'validated' },
      error: null,
    })
    const { POST } = await import('@/app/api/cee/dossiers/[id]/submit/route')
    const ctx = { params: { id: 'dossier-1' } }
    const res = (await POST(makeRequest('dossier-1') as never, ctx as never)) as unknown as MockResult
    expect(res.status).toBe(422)
  })
})
