/**
 * Tests — GET /api/cee/partners/training/status
 *
 * Covers:
 *   - Auth obligatoire (401)
 *   - 404 si pas de partner
 *   - quiz_passed = true quand score >= PASS_THRESHOLD (8)
 *   - quiz_passed = false quand score < 8
 *   - videos_watched = all-true quand training_completed_at est set
 *   - videos_watched = all-false quand training_completed_at est null
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockJsonFn = vi.fn((body: unknown, init?: { status?: number }) => ({
  body,
  status: init?.status ?? 200,
}))
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
      eq: vi.fn(() => ({
        maybeSingle: maybeSingleMock,
      })),
    })),
  })),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => mockSupabase),
}))

type MockResult = { body: Record<string, unknown>; status: number }

function makeRequest() {
  return new Request('http://localhost:3000/api/cee/partners/training/status', {
    method: 'GET',
  })
}

const originalEnv = { ...process.env }

beforeEach(() => {
  vi.clearAllMocks()
  ;(process.env as Record<string, string | undefined>) = { ...originalEnv, NODE_ENV: 'test' }
  maybeSingleMock.mockResolvedValue({
    data: {
      id: 'partner-1',
      certification_score: null,
      certified_at: null,
      training_completed_at: null,
      status: 'training',
    },
    error: null,
  })
})
afterEach(() => {
  process.env = { ...originalEnv }
  vi.resetModules()
})

describe('GET /api/cee/partners/training/status', () => {
  it('returns 401 when not authenticated', async () => {
    ;(mockSupabase.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { user: null },
      error: null,
    })
    const { GET } = await import('@/app/api/cee/partners/training/status/route')
    const res = (await GET(makeRequest() as never)) as unknown as MockResult
    expect(res.status).toBe(401)
  })

  it('returns 404 when no partner found', async () => {
    maybeSingleMock.mockResolvedValueOnce({ data: null, error: null })
    const { GET } = await import('@/app/api/cee/partners/training/status/route')
    const res = (await GET(makeRequest() as never)) as unknown as MockResult
    expect(res.status).toBe(404)
  })

  it('returns quiz_passed=false when score < 8', async () => {
    maybeSingleMock.mockResolvedValueOnce({
      data: {
        id: 'partner-1',
        certification_score: 6,
        certified_at: null,
        training_completed_at: '2026-04-10T00:00:00Z',
        status: 'training',
      },
      error: null,
    })
    const { GET } = await import('@/app/api/cee/partners/training/status/route')
    const res = (await GET(makeRequest() as never)) as unknown as MockResult
    expect(res.status).toBe(200)
    const data = (res.body as { data: { quiz_passed: boolean; score: number } }).data
    expect(data.quiz_passed).toBe(false)
    expect(data.score).toBe(6)
  })

  it('returns quiz_passed=true when score >= 8', async () => {
    maybeSingleMock.mockResolvedValueOnce({
      data: {
        id: 'partner-1',
        certification_score: 8,
        certified_at: '2026-04-12T00:00:00Z',
        training_completed_at: '2026-04-12T00:00:00Z',
        status: 'certified',
      },
      error: null,
    })
    const { GET } = await import('@/app/api/cee/partners/training/status/route')
    const res = (await GET(makeRequest() as never)) as unknown as MockResult
    expect(res.status).toBe(200)
    const data = (res.body as { data: { quiz_passed: boolean; certified_at: string } }).data
    expect(data.quiz_passed).toBe(true)
    expect(data.certified_at).toBe('2026-04-12T00:00:00Z')
  })

  it('returns videos_watched all-false when training not started', async () => {
    // Default mock: training_completed_at = null
    const { GET } = await import('@/app/api/cee/partners/training/status/route')
    const res = (await GET(makeRequest() as never)) as unknown as MockResult
    const data = (res.body as { data: { videos_watched: boolean[] } }).data
    expect(data.videos_watched.every((v) => v === false)).toBe(true)
    expect(data.videos_watched.length).toBeGreaterThan(0)
  })

  it('returns videos_watched all-true when training completed', async () => {
    maybeSingleMock.mockResolvedValueOnce({
      data: {
        id: 'partner-1',
        certification_score: 10,
        certified_at: '2026-04-12T00:00:00Z',
        training_completed_at: '2026-04-12T00:00:00Z',
        status: 'certified',
      },
      error: null,
    })
    const { GET } = await import('@/app/api/cee/partners/training/status/route')
    const res = (await GET(makeRequest() as never)) as unknown as MockResult
    const data = (res.body as { data: { videos_watched: boolean[] } }).data
    expect(data.videos_watched.every((v) => v === true)).toBe(true)
  })

  it('returns score=null and quiz_passed=false when quiz not attempted', async () => {
    const { GET } = await import('@/app/api/cee/partners/training/status/route')
    const res = (await GET(makeRequest() as never)) as unknown as MockResult
    const data = (res.body as { data: { score: null; quiz_passed: boolean } }).data
    expect(data.score).toBeNull()
    expect(data.quiz_passed).toBe(false)
  })
})
