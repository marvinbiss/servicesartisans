/**
 * Tests — POST /api/cee/partners/training/quiz
 * Covers MUST-7 (server-side scoring), MUST-8 (rate limit), MUST-9 (CSRF).
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

const maybeSingleMock = vi.fn()
const updateEqMock = vi.fn(() => Promise.resolve({ error: null }))

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
    update: vi.fn(() => ({ eq: updateEqMock })),
  })),
}

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn(async () => mockSupabase) }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn(() => mockSupabase) }))

const updateStatusMock = vi.fn(async () => ({ id: 'p', status: 'certified' }))
vi.mock('@/lib/cee/leads-service', () => ({
  updateCeePartnerStatus: (...args: unknown[]) =>
    (updateStatusMock as (...a: unknown[]) => unknown)(...args),
}))

vi.mock('@/lib/cee/emails', () => ({
  sendCeeCertificationEmail: vi.fn(async () => ({ success: true })),
}))

type MockResult = { body: Record<string, unknown>; status: number; headers: Record<string, string> }

function makeRequest(body: unknown, headers?: Record<string, string>) {
  return new Request('http://localhost:3000/api/cee/partners/training/quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
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
  ;(maybeSingleMock as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue({
    data: { id: 'partner-1', status: 'convention_signed' },
    error: null,
  })
  const rl = await import('@/lib/cee/rate-limit')
  rl._resetRateLimitStoreForTests()
})
afterEach(() => {
  process.env = { ...originalEnv }
})

describe('POST /api/cee/partners/training/quiz', () => {
  it('computes score server-side and IGNORES client-supplied score/certified (MUST-7)', async () => {
    const { POST } = await import('@/app/api/cee/partners/training/quiz/route')
    // Client tries to cheat: all wrong answers but declares score 10 + certified true.
    const cheatingBody = {
      score: 10,
      certified: true,
      answers: {
        q1: 99,
        q2: 99,
        q3: 99,
        q4: 99,
        q5: 99,
        q6: 99,
        q7: 99,
        q8: 99,
        q9: 99,
        q10: 99,
      },
    }
    const res = (await POST(makeRequest(cheatingBody) as never)) as unknown as MockResult
    expect(res.status).toBe(200)
    // Server recomputes: 0 correct.
    expect(
      (res.body as { data: { score: number; passed: boolean; certified: boolean } }).data.score
    ).toBe(0)
    expect((res.body as { data: { passed: boolean } }).data.passed).toBe(false)
    expect((res.body as { data: { certified: boolean } }).data.certified).toBe(false)
    expect(updateStatusMock).not.toHaveBeenCalled()
  })

  it('certifies artisan when score >= 8/10', async () => {
    const { QUIZ_QUESTIONS } = await import('@/lib/cee/quiz-questions')
    const perfectAnswers: Record<string, number> = {}
    for (const q of QUIZ_QUESTIONS) perfectAnswers[q.id] = q.correct

    const { POST } = await import('@/app/api/cee/partners/training/quiz/route')
    const res = (await POST(
      makeRequest({ answers: perfectAnswers }) as never
    )) as unknown as MockResult

    expect(res.status).toBe(200)
    const data = (res.body as { data: { score: number; certified: boolean } }).data
    expect(data.score).toBe(10)
    expect(data.certified).toBe(true)
    expect(updateStatusMock).toHaveBeenCalled()
  })

  it('rejects cross-site requests (CSRF, 403)', async () => {
    const { POST } = await import('@/app/api/cee/partners/training/quiz/route')
    const res = (await POST(
      makeRequest({ answers: {} }, { 'Sec-Fetch-Site': 'cross-site' }) as never
    )) as unknown as MockResult
    expect(res.status).toBe(403)
  })

  it('rate-limits at 3 req/min', async () => {
    const { POST } = await import('@/app/api/cee/partners/training/quiz/route')
    for (let i = 0; i < 3; i++) {
      const ok = (await POST(makeRequest({ answers: {} }) as never)) as unknown as MockResult
      expect(ok.status).toBe(200)
    }
    const throttled = (await POST(makeRequest({ answers: {} }) as never)) as unknown as MockResult
    expect(throttled.status).toBe(429)
  })

  it('returns 401 when not authenticated', async () => {
    ;(
      mockSupabase.auth.getUser as unknown as { mockResolvedValueOnce: (v: unknown) => void }
    ).mockResolvedValueOnce({ data: { user: null }, error: null })
    const { POST } = await import('@/app/api/cee/partners/training/quiz/route')
    const res = (await POST(makeRequest({ answers: {} }) as never)) as unknown as MockResult
    expect(res.status).toBe(401)
  })
})
