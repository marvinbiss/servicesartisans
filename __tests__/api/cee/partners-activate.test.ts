/**
 * Tests — POST /api/cee/partners/activate
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

const maybeSingleMock = vi.fn()
const mockSupabase = {
  auth: {
    getUser: vi.fn(async () => ({
      data: { user: { id: 'user-1', email: 'a@b.fr' } },
      error: null,
    })),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({ maybeSingle: maybeSingleMock })),
    })),
  })),
}
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => mockSupabase),
}))
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockSupabase),
}))

const updateStatusMock = vi.fn()
vi.mock('@/lib/cee/leads-service', () => ({
  updateCeePartnerStatus: (...args: unknown[]) => updateStatusMock(...args),
}))
vi.mock('@/lib/cee/emails', () => ({
  sendCeePartnerActivatedEmail: vi.fn(async () => ({ success: true })),
}))

type MockResult = { body: Record<string, unknown>; status: number }

function makeRequest(headers?: Record<string, string>) {
  return new Request('http://localhost:3000/api/cee/partners/activate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

const originalEnv = { ...process.env }
beforeEach(() => {
  vi.clearAllMocks()
  process.env = { ...originalEnv, NODE_ENV: 'test' }
  maybeSingleMock.mockResolvedValue({
    data: { id: 'partner-1', status: 'certified' },
    error: null,
  })
  updateStatusMock.mockResolvedValue({ id: 'partner-1', status: 'active' })
})
afterEach(() => {
  process.env = { ...originalEnv }
})

describe('POST /api/cee/partners/activate', () => {
  it('activates a certified partner', async () => {
    const { POST } = await import('@/app/api/cee/partners/activate/route')
    const res = (await POST(makeRequest() as never)) as unknown as MockResult
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ success: true, data: { status: 'active' } })
    expect(updateStatusMock).toHaveBeenCalledWith(
      expect.anything(),
      'partner-1',
      'active'
    )
  })

  it('rejects illegal transition (400)', async () => {
    maybeSingleMock.mockResolvedValueOnce({
      data: { id: 'partner-1', status: 'invited' },
      error: null,
    })
    updateStatusMock.mockRejectedValueOnce(new Error('Transition interdite: invited → active'))

    const { POST } = await import('@/app/api/cee/partners/activate/route')
    const res = (await POST(makeRequest() as never)) as unknown as MockResult
    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ error: { code: 'ILLEGAL_TRANSITION' } })
  })

  it('rejects cross-site (CSRF, 403)', async () => {
    const { POST } = await import('@/app/api/cee/partners/activate/route')
    const res = (await POST(
      makeRequest({ 'Sec-Fetch-Site': 'cross-site' }) as never
    )) as unknown as MockResult
    expect(res.status).toBe(403)
  })

  it('returns 401 when not authenticated', async () => {
    ;(mockSupabase.auth.getUser as unknown as { mockResolvedValueOnce: (v: unknown) => void }).mockResolvedValueOnce({
      data: { user: null },
      error: null,
    })
    const { POST } = await import('@/app/api/cee/partners/activate/route')
    const res = (await POST(makeRequest() as never)) as unknown as MockResult
    expect(res.status).toBe(401)
  })
})
