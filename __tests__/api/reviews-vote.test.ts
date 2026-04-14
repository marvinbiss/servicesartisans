/**
 * Tests — Review Vote API (/api/reviews/vote)
 * POST: Zod validation, rate limiting, in-memory deduplication,
 *       direct increment, review lookup, DB errors
 *
 * The route was rewritten to use:
 * - Rate limiting via checkRateLimit
 * - In-memory dedup (IP+reviewId) instead of review_votes table
 * - Direct helpful_count increment on reviews table
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================
// Mocks
// ============================================

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

// Rate limiter mock — always allow by default
let mockRateLimitAllowed = true
vi.mock('@/lib/rate-limiter', () => ({
  checkRateLimit: vi
    .fn()
    .mockImplementation(() =>
      Promise.resolve({ allowed: mockRateLimitAllowed, resetTime: Date.now() + 3600000 })
    ),
  getClientIp: vi.fn().mockImplementation((headers: Headers) => {
    return headers.get('x-forwarded-for') || '127.0.0.1'
  }),
}))

// State for controlling mock behaviour per test
let mockReviewResult: { data: unknown; error: unknown } = { data: null, error: null }
let mockUpdateResult: { data: unknown; error: unknown } = { data: null, error: null }
let adminFromCallCount = 0

function makeBuilder(result: { data?: unknown; error?: unknown }) {
  const b: Record<string, unknown> = {}
  b.select = vi.fn().mockReturnValue(b)
  b.eq = vi.fn().mockReturnValue(b)
  b.single = vi.fn().mockReturnValue(b)
  b.update = vi.fn().mockReturnValue(b)
  ;(b as Record<string, unknown>).then = (resolve: (v: unknown) => unknown) =>
    resolve({ data: result.data ?? null, error: result.error ?? null })
  return b
}

function makeAdminFrom(_table: string) {
  adminFromCallCount++
  // Call 1: reviews.select(...).eq(...).eq(...).single() -> mockReviewResult
  if (adminFromCallCount === 1) {
    return makeBuilder(mockReviewResult)
  }
  // Call 2+: reviews.update(...).eq(...) -> mockUpdateResult
  return makeBuilder(mockUpdateResult)
}

const mockAdminSupabase = {
  from: vi.fn((_table: string) => makeAdminFrom(_table)),
}

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockAdminSupabase),
}))

// ============================================
// Helpers
// ============================================

const REVIEW_UUID = '550e8400-e29b-41d4-a716-446655440010'

// Use unique IPs per test to avoid in-memory dedup collisions
let testIpCounter = 0
function nextIp() {
  testIpCounter++
  return `10.0.0.${testIpCounter}`
}

function makePostRequest(body: unknown, headers?: Record<string, string>) {
  const ip = headers?.['x-forwarded-for'] || nextIp()
  return new Request('http://localhost/api/reviews/vote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip,
      ...headers,
    },
    body: JSON.stringify(body),
  })
}

type MockResult = { body: Record<string, unknown>; status: number }

beforeEach(() => {
  vi.clearAllMocks()
  adminFromCallCount = 0
  mockRateLimitAllowed = true
  mockReviewResult = { data: null, error: null }
  mockUpdateResult = { data: null, error: null }
})

// ============================================
// Tests
// ============================================

describe('POST /api/reviews/vote', () => {
  it('returns 400 when body is invalid (not an object with reviewId)', async () => {
    const { POST } = await import('@/app/api/reviews/vote/route')
    const result = (await POST(makePostRequest({ bad: 'data' }))) as unknown as MockResult

    expect(result.status).toBe(400)
    expect(result.body.error).toMatchObject({ message: 'Requête invalide' })
  })

  it('returns 400 when reviewId is missing', async () => {
    const { POST } = await import('@/app/api/reviews/vote/route')
    const result = (await POST(makePostRequest({}))) as unknown as MockResult

    expect(result.status).toBe(400)
    expect(result.body.error).toMatchObject({ message: 'Requête invalide' })
  })

  it('returns 404 when review does not exist', async () => {
    mockReviewResult = { data: null, error: { message: 'Row not found', code: 'PGRST116' } }

    const { POST } = await import('@/app/api/reviews/vote/route')
    const result = (await POST(makePostRequest({ reviewId: REVIEW_UUID }))) as unknown as MockResult

    expect(result.status).toBe(404)
    expect(result.body.error).toEqual({ message: 'Avis non trouvé ou non publié' })
  })

  it('returns 404 when review is not published', async () => {
    // .single() returns null because the status='published' filter excludes it
    mockReviewResult = { data: null, error: null }

    const { POST } = await import('@/app/api/reviews/vote/route')
    const result = (await POST(makePostRequest({ reviewId: REVIEW_UUID }))) as unknown as MockResult

    expect(result.status).toBe(404)
    expect(result.body.error).toEqual({ message: 'Avis non trouvé ou non publié' })
  })

  it('returns success with incremented helpful_count after vote', async () => {
    mockReviewResult = { data: { id: REVIEW_UUID, helpful_count: 7 }, error: null }
    mockUpdateResult = { data: null, error: null }

    const { POST } = await import('@/app/api/reviews/vote/route')
    const result = (await POST(makePostRequest({ reviewId: REVIEW_UUID }))) as unknown as MockResult

    expect(result.status).toBe(200)
    expect(result.body).toEqual({ success: true, helpful_count: 8 })
  })

  it('returns 409 when same IP votes twice for same review', async () => {
    mockReviewResult = { data: { id: REVIEW_UUID, helpful_count: 3 }, error: null }
    mockUpdateResult = { data: null, error: null }

    const ip = nextIp()
    const { POST } = await import('@/app/api/reviews/vote/route')

    // First vote succeeds
    const result1 = (await POST(
      makePostRequest({ reviewId: REVIEW_UUID }, { 'x-forwarded-for': ip })
    )) as unknown as MockResult
    expect(result1.status).toBe(200)

    // Second vote from same IP is rejected
    adminFromCallCount = 0
    const result2 = (await POST(
      makePostRequest({ reviewId: REVIEW_UUID }, { 'x-forwarded-for': ip })
    )) as unknown as MockResult
    expect(result2.status).toBe(409)
    expect(result2.body.error).toMatchObject({ message: 'Vous avez déjà voté pour cet avis' })
  })

  it('returns 500 on unexpected database error during update', async () => {
    mockReviewResult = { data: { id: REVIEW_UUID, helpful_count: 0 }, error: null }
    mockUpdateResult = { data: null, error: { message: 'connection refused', code: '08000' } }

    const { POST } = await import('@/app/api/reviews/vote/route')
    const result = (await POST(makePostRequest({ reviewId: REVIEW_UUID }))) as unknown as MockResult

    expect(result.status).toBe(500)
    expect(result.body.error).toEqual({ message: 'Erreur serveur lors du vote' })
  })

  it('returns 429 when rate limited', async () => {
    mockRateLimitAllowed = false

    const { POST } = await import('@/app/api/reviews/vote/route')
    const result = (await POST(makePostRequest({ reviewId: REVIEW_UUID }))) as unknown as MockResult

    expect(result.status).toBe(429)
    expect(result.body.error).toMatchObject({
      message: 'Trop de votes, veuillez réessayer plus tard',
    })
  })

  it('handles null helpful_count gracefully', async () => {
    mockReviewResult = { data: { id: REVIEW_UUID, helpful_count: null }, error: null }
    mockUpdateResult = { data: null, error: null }

    const { POST } = await import('@/app/api/reviews/vote/route')
    const result = (await POST(makePostRequest({ reviewId: REVIEW_UUID }))) as unknown as MockResult

    expect(result.status).toBe(200)
    expect(result.body).toEqual({ success: true, helpful_count: 1 })
  })
})
