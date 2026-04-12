/**
 * Tests — Reviews API (/api/reviews)
 * GET: param validation, booking info, artisan reviews + stats
 * POST: validation, HMAC token, duplicate check, fraud detection, 201 success
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createHmac } from 'crypto'

// ============================================
// Mocks
// ============================================

const mockJsonFn = vi.fn((body: unknown, init?: { status?: number }) => ({
  body,
  status: init?.status ?? 200,
}))

vi.mock('next/server', () => ({
  NextResponse: { json: (body: unknown, init?: { status?: number }) => mockJsonFn(body, init) },
}))

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

vi.mock('@/lib/rate-limiter', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true, resetTime: Date.now() + 60000 }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/utils', () => ({
  slugify: vi.fn((s: string) => s.toLowerCase().replace(/\s+/g, '-')),
}))

// Auth mock for POST (createServerClient)
let mockAuthUser: { id: string; email: string } | null = null

const mockServerSupabase = {
  auth: {
    getUser: vi.fn(() =>
      Promise.resolve({
        data: { user: mockAuthUser },
        error: mockAuthUser ? null : { message: 'not authenticated' },
      })
    ),
  },
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(() => Promise.resolve(mockServerSupabase)),
}))

// Supabase state
type QueryResult = { data: unknown; error: unknown }
const queryResults: QueryResult[] = []

function makeBuilder(result: QueryResult) {
  const b: Record<string, unknown> = {}
  b.select = vi.fn().mockReturnValue(b)
  b.eq = vi.fn().mockReturnValue(b)
  b.order = vi.fn().mockReturnValue(b)
  b.single = vi.fn().mockReturnValue(b)
  b.insert = vi.fn().mockReturnValue(b)
  b.update = vi.fn().mockReturnValue(b)
  b.in = vi.fn().mockReturnValue(b)
  ;(b as Record<string, unknown>).then = (resolve: (v: unknown) => unknown) =>
    resolve({ data: result.data, error: result.error })
  return b
}

let fromCallIndex = 0
const mockSupabaseClient = {
  from: vi.fn((_table: string) => {
    const result = queryResults[fromCallIndex] ?? { data: null, error: null }
    fromCallIndex++
    return makeBuilder(result)
  }),
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue(mockSupabaseClient),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn().mockImplementation(() => mockSupabaseClient),
}))

// ============================================
// Helpers
// ============================================

const ARTISAN_UUID = '550e8400-e29b-41d4-a716-446655440001'
const BOOKING_UUID = '550e8400-e29b-41d4-a716-446655440002'

function makeGetRequest(params: Record<string, string> = {}) {
  const sp = new URLSearchParams(params)
  return new Request(`http://localhost/api/reviews?${sp.toString()}`)
}

function makePostRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const HMAC_SECRET = 'test-hmac-secret'

function generateValidToken(bookingId: string): string {
  return createHmac('sha256', HMAC_SECRET).update(bookingId).digest('hex').slice(0, 32)
}

const validReviewBody = {
  bookingId: BOOKING_UUID,
  rating: 5,
  comment: 'Excellent travail, très professionnel et ponctuel.',
  reviewToken: generateValidToken(BOOKING_UUID),
}

// Env setup
const OLD_ENV = process.env
const CLIENT_UUID = '550e8400-e29b-41d4-a716-446655440050'

beforeEach(() => {
  vi.clearAllMocks()
  fromCallIndex = 0
  queryResults.length = 0
  mockAuthUser = null
  process.env = { ...OLD_ENV }
  delete process.env.REVIEW_HMAC_SECRET
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
})

// ============================================
// GET tests
// ============================================

describe('GET /api/reviews', () => {
  it('returns 400 when neither bookingId nor artisanId provided', async () => {
    const { GET } = await import('@/app/api/reviews/route')
    const result = (await GET(makeGetRequest())) as unknown as {
      body: Record<string, unknown>
      status: number
    }

    expect(result.status).toBe(400)
    expect(result.body.success).toBe(false)
  })

  it('returns 400 when bookingId is not a valid UUID', async () => {
    const { GET } = await import('@/app/api/reviews/route')
    const result = (await GET(makeGetRequest({ bookingId: 'bad-id' }))) as unknown as {
      body: Record<string, unknown>
      status: number
    }

    expect(result.status).toBe(400)
  })

  it('returns 404 when booking not found (by bookingId)', async () => {
    queryResults.push({ data: null, error: { message: 'No rows', code: 'PGRST116' } })

    const { GET } = await import('@/app/api/reviews/route')
    const result = (await GET(makeGetRequest({ bookingId: BOOKING_UUID }))) as unknown as {
      body: Record<string, unknown>
      status: number
    }

    expect(result.status).toBe(404)
    expect(result.body.success).toBe(false)
  })

  it('returns booking info with alreadyReviewed=false', async () => {
    // 1st query: booking
    queryResults.push({
      data: {
        id: BOOKING_UUID,
        client_id: 'client-123',
        provider_id: ARTISAN_UUID,
        service_name: 'Réparation fuite',
        status: 'completed',
        client: { full_name: 'Jean Dupont', email: 'jean@example.com', phone_e164: null },
        artisan: { id: ARTISAN_UUID, name: 'Martin Plombier' },
      },
      error: null,
    })
    // 2nd query: existing review check (none found)
    queryResults.push({ data: null, error: { message: 'No rows', code: 'PGRST116' } })

    const { GET } = await import('@/app/api/reviews/route')
    const result = (await GET(makeGetRequest({ bookingId: BOOKING_UUID }))) as unknown as {
      body: { success: boolean; data: Record<string, unknown> }
      status: number
    }

    expect(result.status).toBe(200)
    expect(result.body.success).toBe(true)
    expect(result.body.data.artisanName).toBe('Martin Plombier')
    expect(result.body.data.alreadyReviewed).toBe(false)
  })

  it('returns alreadyReviewed=true when review exists', async () => {
    queryResults.push({
      data: {
        id: BOOKING_UUID,
        client_id: 'client-123',
        provider_id: ARTISAN_UUID,
        service_name: null,
        status: 'completed',
        client: null,
        artisan: null,
      },
      error: null,
    })
    queryResults.push({ data: { id: 'existing-review-id' }, error: null })

    const { GET } = await import('@/app/api/reviews/route')
    const result = (await GET(makeGetRequest({ bookingId: BOOKING_UUID }))) as unknown as {
      body: { success: boolean; data: Record<string, unknown> }
      status: number
    }

    expect(result.body.data.alreadyReviewed).toBe(true)
  })

  it('returns reviews with computed stats for artisanId', async () => {
    queryResults.push({
      data: [
        {
          id: 'r1',
          rating: 5,
          content: 'Parfait',
          would_recommend: true,
          author_name: 'Alice',
          created_at: '2026-01-01T00:00:00Z',
          reply: null,
          reply_date: null,
        },
        {
          id: 'r2',
          rating: 3,
          content: 'Correct',
          would_recommend: false,
          author_name: 'Bob',
          created_at: '2026-01-02T00:00:00Z',
          reply: null,
          reply_date: null,
        },
      ],
      error: null,
    })

    const { GET } = await import('@/app/api/reviews/route')
    const result = (await GET(makeGetRequest({ artisanId: ARTISAN_UUID }))) as unknown as {
      body: { success: boolean; data: { reviews: unknown[]; stats: Record<string, unknown> } }
      status: number
    }

    expect(result.status).toBe(200)
    expect(result.body.success).toBe(true)
    expect(result.body.data.reviews).toHaveLength(2)
    expect(result.body.data.stats.total).toBe(2)
    expect(result.body.data.stats.average).toBe(4) // (5+3)/2
    expect(result.body.data.stats.recommendRate).toBe(50) // 1/2
  })

  it('returns empty reviews with zero stats when no reviews', async () => {
    queryResults.push({ data: [], error: null })

    const { GET } = await import('@/app/api/reviews/route')
    const result = (await GET(makeGetRequest({ artisanId: ARTISAN_UUID }))) as unknown as {
      body: { success: boolean; data: { stats: Record<string, unknown> } }
      status: number
    }

    expect(result.body.data.stats.total).toBe(0)
    expect(result.body.data.stats.average).toBe(0)
    expect(result.body.data.stats.recommendRate).toBe(0)
  })
})

// ============================================
// POST tests
// ============================================

describe('POST /api/reviews', () => {
  it('returns 400 on missing required fields', async () => {
    const { POST } = await import('@/app/api/reviews/route')
    const result = (await POST(makePostRequest({ bookingId: BOOKING_UUID }))) as unknown as {
      body: Record<string, unknown>
      status: number
    }

    expect(result.status).toBe(400)
    expect(result.body.success).toBe(false)
  })

  it('returns 400 when comment is too short', async () => {
    const { POST } = await import('@/app/api/reviews/route')
    const result = (await POST(
      makePostRequest({ ...validReviewBody, comment: 'Ok' })
    )) as unknown as { body: Record<string, unknown>; status: number }

    expect(result.status).toBe(400)
  })

  it('returns 400 when rating is out of range', async () => {
    const { POST } = await import('@/app/api/reviews/route')
    const result = (await POST(makePostRequest({ ...validReviewBody, rating: 6 }))) as unknown as {
      body: Record<string, unknown>
      status: number
    }

    expect(result.status).toBe(400)
  })

  it('returns 404 when booking not found', async () => {
    mockAuthUser = { id: CLIENT_UUID, email: 'client@test.com' }
    process.env.REVIEW_HMAC_SECRET = HMAC_SECRET
    queryResults.push({ data: null, error: { message: 'No rows', code: 'PGRST116' } })

    const { POST } = await import('@/app/api/reviews/route')
    const result = (await POST(makePostRequest(validReviewBody))) as unknown as {
      body: Record<string, unknown>
      status: number
    }

    expect(result.status).toBe(404)
  })

  it('returns 400 when booking status is pending (not reviewable)', async () => {
    mockAuthUser = { id: CLIENT_UUID, email: 'client@test.com' }
    process.env.REVIEW_HMAC_SECRET = HMAC_SECRET
    queryResults.push({
      data: {
        id: BOOKING_UUID,
        client_id: CLIENT_UUID,
        provider_id: ARTISAN_UUID,
        status: 'pending',
        client: null,
      },
      error: null,
    })

    const { POST } = await import('@/app/api/reviews/route')
    const result = (await POST(makePostRequest(validReviewBody))) as unknown as {
      body: Record<string, unknown>
      status: number
    }

    expect(result.status).toBe(400)
  })

  it('returns 409 when review already exists', async () => {
    mockAuthUser = { id: CLIENT_UUID, email: 'client@test.com' }
    process.env.REVIEW_HMAC_SECRET = HMAC_SECRET
    queryResults.push({
      data: {
        id: BOOKING_UUID,
        client_id: CLIENT_UUID,
        provider_id: ARTISAN_UUID,
        status: 'confirmed',
        client: { full_name: 'Alice', email: 'alice@test.com', phone_e164: null },
      },
      error: null,
    })
    queryResults.push({ data: { id: 'existing-review' }, error: null }) // existing review

    const { POST } = await import('@/app/api/reviews/route')
    const result = (await POST(makePostRequest(validReviewBody))) as unknown as {
      body: Record<string, unknown>
      status: number
    }

    expect(result.status).toBe(409)
  })

  it('returns 201 on successful review submission', async () => {
    mockAuthUser = { id: CLIENT_UUID, email: 'client@test.com' }
    process.env.REVIEW_HMAC_SECRET = HMAC_SECRET
    queryResults.push({
      data: {
        id: BOOKING_UUID,
        client_id: CLIENT_UUID,
        provider_id: ARTISAN_UUID,
        status: 'confirmed',
        client: { full_name: 'Alice', email: 'alice@test.com', phone_e164: null },
      },
      error: null,
    })
    queryResults.push({ data: null, error: { code: 'PGRST116' } }) // no existing review
    queryResults.push({ data: { id: 'new-review-id', status: 'published' }, error: null }) // insert
    queryResults.push({ data: [{ rating: 5 }], error: null }) // update rating query
    queryResults.push({ data: null, error: null }) // providers update
    queryResults.push({
      data: {
        specialty: 'plombier',
        address_city: 'Paris',
        slug: 'martin-plombier',
        stable_id: '123',
      },
      error: null,
    }) // provider data for revalidation

    const { POST } = await import('@/app/api/reviews/route')
    const result = (await POST(makePostRequest(validReviewBody))) as unknown as {
      body: { success: boolean; data: { review: Record<string, unknown>; message: string } }
      status: number
    }

    expect(result.status).toBe(201)
    expect(result.body.success).toBe(true)
    expect(result.body.data.review.id).toBe('new-review-id')
  })

  it('marks review as pending_review when fraud indicators detected', async () => {
    mockAuthUser = { id: CLIENT_UUID, email: 'client@test.com' }
    process.env.REVIEW_HMAC_SECRET = HMAC_SECRET
    queryResults.push({
      data: {
        id: BOOKING_UUID,
        client_id: CLIENT_UUID,
        provider_id: ARTISAN_UUID,
        status: 'completed',
        client: { full_name: 'Alice', email: 'alice@test.com', phone_e164: null },
      },
      error: null,
    })
    queryResults.push({ data: null, error: { code: 'PGRST116' } })
    queryResults.push({ data: { id: 'new-review-id', status: 'pending_review' }, error: null })
    queryResults.push({ data: [], error: null })
    queryResults.push({ data: null, error: null }) // providers update
    queryResults.push({
      data: {
        specialty: 'plombier',
        address_city: 'Paris',
        slug: 'martin-plombier',
        stable_id: '123',
      },
      error: null,
    })

    // All-caps comment with link = fraud indicators
    const fraudBody = {
      ...validReviewBody,
      comment: 'THIS IS AMAZING CHECK HTTP://SPAM.COM NOW!!!',
    }

    const { POST } = await import('@/app/api/reviews/route')
    const result = (await POST(makePostRequest(fraudBody))) as unknown as {
      body: { success: boolean; data: { message: string } }
      status: number
    }

    expect(result.status).toBe(201)
    // Fraud detected → pending message
    expect(result.body.data.message).toContain('verification')
  })

  it('returns 401 when HMAC token is invalid', async () => {
    mockAuthUser = { id: CLIENT_UUID, email: 'client@test.com' }
    process.env.REVIEW_HMAC_SECRET = HMAC_SECRET
    // Provide booking that matches the client
    queryResults.push({
      data: {
        id: BOOKING_UUID,
        client_id: CLIENT_UUID,
        provider_id: ARTISAN_UUID,
        status: 'confirmed',
        client: { full_name: 'Alice', email: 'alice@test.com', phone_e164: null },
      },
      error: null,
    })

    const { POST } = await import('@/app/api/reviews/route')
    const result = (await POST(
      makePostRequest({ ...validReviewBody, reviewToken: 'deadbeefdeadbeefdeadbeefdeadbeef' })
    )) as unknown as {
      body: Record<string, unknown>
      status: number
    }

    expect(result.status).toBe(401)
    expect(result.body.success).toBe(false)
  })
})
