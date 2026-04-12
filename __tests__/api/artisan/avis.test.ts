/**
 * Tests unitaires pour GET/POST /api/artisan/avis
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockUser = { id: 'user-123' }
const mockProvider = { id: 'provider-456' }

vi.mock('@/lib/auth/artisan-guard', () => ({
  requireArtisan: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
  })),
}))

import { requireArtisan } from '@/lib/auth/artisan-guard'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createRequest(url: string, options: RequestInit = {}): Request {
  return new Request(url, options)
}

const sampleReviews = [
  {
    id: 'r1',
    provider_id: 'provider-456',
    rating: 5,
    content: 'Excellent',
    reply: null,
    reply_date: null,
    author_name: 'Client A',
    booking_id: 'b1',
    created_at: '2026-03-01',
    updated_at: '2026-03-01',
  },
  {
    id: 'r2',
    provider_id: 'provider-456',
    rating: 3,
    content: 'Moyen',
    reply: null,
    reply_date: null,
    author_name: 'Client B',
    booking_id: 'b2',
    created_at: '2026-03-02',
    updated_at: '2026-03-02',
  },
]

function buildSupabaseMock(
  overrides: {
    reviews?: unknown[]
    reviewsError?: unknown
    count?: number
    allRatings?: Array<{ rating: number }>
    ratingsError?: unknown
    singleReview?: unknown
    singleError?: unknown
    updateError?: unknown
  } = {}
) {
  const {
    reviews = sampleReviews,
    reviewsError = null,
    count = reviews.length,
    allRatings = reviews.map((r) => ({ rating: (r as { rating: number }).rating })),
    ratingsError = null,
    singleReview = null,
    singleError = null,
    updateError = null,
  } = overrides

  let fromCallIndex = 0

  const supabase: Record<string, unknown> = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
    },
    from: vi.fn().mockImplementation(() => {
      const idx = fromCallIndex++
      const chain: Record<string, unknown> = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        single: vi.fn(),
        maybeSingle: vi.fn(),
      }

      for (const key of Object.keys(chain)) {
        if (typeof chain[key] === 'function' && key !== 'single' && key !== 'maybeSingle') {
          ;(chain[key] as ReturnType<typeof vi.fn>).mockReturnValue(chain)
        }
      }

      // idx 0 = providers lookup (maybeSingle) to resolve provider.id from user.id
      // idx 1 = reviews with pagination (count:exact)
      // idx 2 = all ratings select('rating') for stats (single query, grouped in JS)
      // idx 3+ = single review / update (POST)
      if (idx === 0) {
        ;(chain.maybeSingle as ReturnType<typeof vi.fn>).mockResolvedValue({
          data: mockProvider,
          error: null,
        })
      } else if (idx === 1) {
        // reviews select with count:exact — thenable
        chain.then = (resolve: (v: unknown) => void) => {
          resolve({ data: reviews, error: reviewsError, count })
          return chain
        }
      } else if (idx === 2) {
        // All ratings for stats (single query)
        chain.then = (resolve: (v: unknown) => void) => {
          resolve({ data: ratingsError ? null : allRatings, error: ratingsError })
          return chain
        }
      } else if (idx === 3) {
        // single review fetch for POST
        ;(chain.single as ReturnType<typeof vi.fn>).mockResolvedValue({
          data: singleReview,
          error: singleError,
        })
      }

      // For update chain (POST update review)
      if (idx === 4) {
        chain.then = (resolve: (v: unknown) => void) => {
          resolve({ error: updateError })
          return chain
        }
      }

      return chain
    }),
  }

  return supabase
}

// ─── Tests GET ───────────────────────────────────────────────────────────────

describe('GET /api/artisan/avis', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('retourne 401 si non authentifié', async () => {
    vi.mocked(requireArtisan).mockResolvedValue({
      error: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }),
      user: null,
      provider: null,
      supabase: {} as never,
    })

    const { GET } = await import('@/app/api/artisan/avis/route')
    const response = await GET(createRequest('http://localhost:3000/api/artisan/avis'))
    expect(response.status).toBe(401)
  })

  it('retourne page 1, limit 20 par défaut', async () => {
    const supabaseMock = buildSupabaseMock()

    vi.mocked(requireArtisan).mockResolvedValue({
      error: null,
      user: mockUser as never,
      provider: mockProvider as never,
      supabase: supabaseMock as never,
    })

    const { GET } = await import('@/app/api/artisan/avis/route')
    const response = await GET(createRequest('http://localhost:3000/api/artisan/avis'))

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.page).toBe(1)
    expect(body.limit).toBe(20)
    expect(body.avis).toBeDefined()
    expect(body.stats).toBeDefined()
  })

  it('respecte les paramètres page, limit et sort', async () => {
    const supabaseMock = buildSupabaseMock()
    const fromSpy = supabaseMock.from as ReturnType<typeof vi.fn>

    vi.mocked(requireArtisan).mockResolvedValue({
      error: null,
      user: mockUser as never,
      provider: mockProvider as never,
      supabase: supabaseMock as never,
    })

    const { GET } = await import('@/app/api/artisan/avis/route')
    const response = await GET(
      createRequest('http://localhost:3000/api/artisan/avis?page=2&limit=10&sort=rating_high')
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.page).toBe(2)
    expect(body.limit).toBe(10)

    // Vérifie que from('reviews') a été appelé
    expect(fromSpy).toHaveBeenCalledWith('reviews')
  })

  it('calcule les stats de distribution correctement', async () => {
    const customReviews = [
      {
        id: 'r1',
        provider_id: 'provider-456',
        rating: 5,
        content: 'Top',
        reply: null,
        reply_date: null,
        author_name: 'A',
        booking_id: 'b1',
        created_at: '2026-03-01',
        updated_at: '2026-03-01',
      },
      {
        id: 'r2',
        provider_id: 'provider-456',
        rating: 5,
        content: 'Super',
        reply: null,
        reply_date: null,
        author_name: 'B',
        booking_id: 'b2',
        created_at: '2026-03-02',
        updated_at: '2026-03-02',
      },
      {
        id: 'r3',
        provider_id: 'provider-456',
        rating: 3,
        content: 'Ok',
        reply: null,
        reply_date: null,
        author_name: 'C',
        booking_id: 'b3',
        created_at: '2026-03-03',
        updated_at: '2026-03-03',
      },
    ]

    const supabaseMock = buildSupabaseMock({
      reviews: customReviews,
      count: 3,
      allRatings: [{ rating: 5 }, { rating: 5 }, { rating: 3 }],
    })

    vi.mocked(requireArtisan).mockResolvedValue({
      error: null,
      user: mockUser as never,
      provider: mockProvider as never,
      supabase: supabaseMock as never,
    })

    const { GET } = await import('@/app/api/artisan/avis/route')
    const response = await GET(createRequest('http://localhost:3000/api/artisan/avis'))
    const body = await response.json()

    expect(body.stats.total).toBe(3)
    // Moyenne = (5+5+3)/3 = 4.333... arrondi à 4.3
    expect(body.stats.moyenne).toBe(4.3)
    expect(body.stats.distribution).toHaveLength(5)
  })
})

// POST reply is handled by /api/artisan/avis/[id]/response — tested in its own file
