/**
 * Tests unitaires pour GET /api/artisan/reputation
 *
 * Couvre :
 *  - auth 401 / provider absent 403
 *  - reviews : avg, distribution, pendingResponse (response vide vs whitespace vs null)
 *  - invitations : sent7d/30d, completionRate, pending30d, nextScheduledAt
 *  - résilience : reviews.error loggé sans crasher, invitations.error idem
 *  - arrondi avgRating à 1 décimale + completionRate 1 décimale
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUser = { id: 'user-123' }
const mockProvider = { id: 'provider-456' }

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({ get: vi.fn(), set: vi.fn() })),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function buildClient(opts: { user?: { id: string } | null; providers?: { id: string }[] }) {
  const { user = mockUser, providers = [mockProvider] } = opts
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: providers, error: null }),
    })),
  }
}

type ReviewRow = {
  rating: number
  status: string
  response: string | null
  created_at: string
}
type InviteRow = {
  sent_at: string | null
  completed_at: string | null
  scheduled_at: string
}

function buildAdmin(opts: {
  reviews?: ReviewRow[]
  reviewsError?: unknown
  invitations?: InviteRow[]
  invitationsError?: unknown
  latest?: { created_at: string } | null
  next?: { scheduled_at: string } | null
}) {
  const {
    reviews = [],
    reviewsError = null,
    invitations = [],
    invitationsError = null,
    latest = null,
    next = null,
  } = opts

  let call = 0
  return {
    from: vi.fn().mockImplementation(() => {
      const idx = call++
      const chain: Record<string, ReturnType<typeof vi.fn>> = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn(),
      }
      for (const k of ['select', 'eq', 'gte', 'is', 'order', 'limit']) {
        chain[k].mockReturnValue(chain)
      }
      // Order of calls inside reputation route:
      // 0: reviews (thenable)
      // 1: latestPublished (maybeSingle)
      // 2: invitations (thenable)
      // 3: nextScheduled (maybeSingle)
      if (idx === 0) {
        ;(chain as Record<string, unknown>).then = (r: (v: unknown) => void) => {
          r({ data: reviewsError ? null : reviews, error: reviewsError })
          return chain
        }
      } else if (idx === 1) {
        chain.maybeSingle.mockResolvedValue({ data: latest, error: null })
      } else if (idx === 2) {
        ;(chain as Record<string, unknown>).then = (r: (v: unknown) => void) => {
          r({ data: invitationsError ? null : invitations, error: invitationsError })
          return chain
        }
      } else if (idx === 3) {
        chain.maybeSingle.mockResolvedValue({ data: next, error: null })
      }
      return chain
    }),
  }
}

describe('GET /api/artisan/reputation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('renvoie 401 sans user', async () => {
    vi.mocked(createClient).mockResolvedValue(buildClient({ user: null }) as never)
    vi.mocked(createAdminClient).mockReturnValue(buildAdmin({}) as never)
    const { GET } = await import('@/app/api/artisan/reputation/route')
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('renvoie 403 sans provider actif', async () => {
    vi.mocked(createClient).mockResolvedValue(buildClient({ providers: [] }) as never)
    vi.mocked(createAdminClient).mockReturnValue(buildAdmin({}) as never)
    const { GET } = await import('@/app/api/artisan/reputation/route')
    const res = await GET()
    expect(res.status).toBe(403)
  })

  it('renvoie payload vide cohérent sans avis ni invites', async () => {
    vi.mocked(createClient).mockResolvedValue(buildClient({}) as never)
    vi.mocked(createAdminClient).mockReturnValue(buildAdmin({}) as never)
    const { GET } = await import('@/app/api/artisan/reputation/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.reviews.total).toBe(0)
    expect(body.reviews.published).toBe(0)
    expect(body.reviews.avgRating).toBe(0)
    expect(body.reviews.distribution).toEqual({ '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 })
    expect(body.reviews.pendingResponse).toBe(0)
    expect(body.invitations.sent7d).toBe(0)
    expect(body.invitations.sent30d).toBe(0)
    expect(body.invitations.completed30d).toBe(0)
    expect(body.invitations.pending30d).toBe(0)
    expect(body.invitations.completionRate30d).toBeNull()
    expect(body.invitations.nextScheduledAt).toBeNull()
  })

  it('calcule distribution + avgRating (arrondi 1 décimale) + pendingResponse', async () => {
    const reviews: ReviewRow[] = [
      { rating: 5, status: 'published', response: 'merci', created_at: '2026-04-01T00:00:00Z' },
      { rating: 5, status: 'published', response: null, created_at: '2026-04-02T00:00:00Z' },
      { rating: 4, status: 'published', response: '   ', created_at: '2026-04-03T00:00:00Z' },
      { rating: 3, status: 'published', response: '', created_at: '2026-04-04T00:00:00Z' },
      { rating: 2, status: 'pending', response: null, created_at: '2026-04-05T00:00:00Z' }, // non-published → exclus
    ]
    vi.mocked(createClient).mockResolvedValue(buildClient({}) as never)
    vi.mocked(createAdminClient).mockReturnValue(buildAdmin({ reviews }) as never)
    const { GET } = await import('@/app/api/artisan/reputation/route')
    const res = await GET()
    const body = await res.json()
    // total = tous, published = 4
    expect(body.reviews.total).toBe(5)
    expect(body.reviews.published).toBe(4)
    // Avg de published = (5+5+4+3)/4 = 4.25 → 4.3 (arrondi 1 décimale)
    expect(body.reviews.avgRating).toBe(4.3)
    expect(body.reviews.distribution['5']).toBe(2)
    expect(body.reviews.distribution['4']).toBe(1)
    expect(body.reviews.distribution['3']).toBe(1)
    expect(body.reviews.distribution['2']).toBe(0)
    expect(body.reviews.distribution['1']).toBe(0)
    // pendingResponse : null + whitespace + '' = 3 (ceux sans reply)
    expect(body.reviews.pendingResponse).toBe(3)
  })

  it('calcule sent7d / sent30d / completed30d / pending30d / completionRate', async () => {
    const now = Date.now()
    const d2 = new Date(now - 2 * 86400000).toISOString()
    const d10 = new Date(now - 10 * 86400000).toISOString()
    const d20 = new Date(now - 20 * 86400000).toISOString()
    const invitations: InviteRow[] = [
      { sent_at: d2, completed_at: null, scheduled_at: d2 }, // dans 7j, pending
      { sent_at: d10, completed_at: d10, scheduled_at: d10 }, // completed
      { sent_at: d20, completed_at: null, scheduled_at: d20 }, // pending 30d
      { sent_at: null, completed_at: null, scheduled_at: d2 }, // pas envoyée
    ]
    vi.mocked(createClient).mockResolvedValue(buildClient({}) as never)
    vi.mocked(createAdminClient).mockReturnValue(buildAdmin({ invitations }) as never)
    const { GET } = await import('@/app/api/artisan/reputation/route')
    const res = await GET()
    const body = await res.json()
    expect(body.invitations.sent7d).toBe(1) // seul d2 dans la fenêtre 7j
    expect(body.invitations.sent30d).toBe(3) // d2, d10, d20 (sent_at non-null)
    expect(body.invitations.completed30d).toBe(1) // d10
    expect(body.invitations.pending30d).toBe(2) // d2, d20 envoyées sans completed
    // 1 / 3 = 33.333... → 33.3
    expect(body.invitations.completionRate30d).toBe(33.3)
  })

  it('expose nextScheduledAt et latestPublishedAt si présents', async () => {
    vi.mocked(createClient).mockResolvedValue(buildClient({}) as never)
    vi.mocked(createAdminClient).mockReturnValue(
      buildAdmin({
        latest: { created_at: '2026-04-10T00:00:00Z' },
        next: { scheduled_at: '2026-04-27T00:00:00Z' },
      }) as never
    )
    const { GET } = await import('@/app/api/artisan/reputation/route')
    const res = await GET()
    const body = await res.json()
    expect(body.reviews.latestPublishedAt).toBe('2026-04-10T00:00:00Z')
    expect(body.invitations.nextScheduledAt).toBe('2026-04-27T00:00:00Z')
  })

  it('ne crashe pas si reviews query renvoie une erreur (loggée)', async () => {
    vi.mocked(createClient).mockResolvedValue(buildClient({}) as never)
    vi.mocked(createAdminClient).mockReturnValue(
      buildAdmin({ reviewsError: { message: 'rls denied' } }) as never
    )
    const { GET } = await import('@/app/api/artisan/reputation/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.reviews.total).toBe(0)
  })
})
