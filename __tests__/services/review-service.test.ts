/**
 * Tests for review-service.ts — Business logic for review processing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getArtisanDisplayName,
  getClientInfo,
  detectFraudIndicators,
  generateReviewToken,
  verifyReviewToken,
  computeReviewStats,
  updateArtisanRating,
  createReview,
} from '@/lib/services/review-service'

// ---------------------------------------------------------------------------
// Mock next/cache (revalidatePath)
// ---------------------------------------------------------------------------
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// ---------------------------------------------------------------------------
// Mock logger
// ---------------------------------------------------------------------------
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

// ---------------------------------------------------------------------------
// Mock slugify
// ---------------------------------------------------------------------------
vi.mock('@/lib/utils', () => ({
  slugify: (text: string) => text.toLowerCase().replace(/\s+/g, '-'),
}))

// ---------------------------------------------------------------------------
// Supabase mock helpers
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// getArtisanDisplayName
// ---------------------------------------------------------------------------

describe('getArtisanDisplayName', () => {
  it('returns "Artisan" when artisan is null', () => {
    expect(getArtisanDisplayName(null)).toBe('Artisan')
  })

  it('returns name from single artisan profile', () => {
    expect(getArtisanDisplayName({ id: '1', name: 'Jean Dupont' })).toBe('Jean Dupont')
  })

  it('returns first name from artisan array', () => {
    const artisans = [
      { id: '1', name: 'Marie Martin' },
      { id: '2', name: 'Pierre Duval' },
    ]
    expect(getArtisanDisplayName(artisans)).toBe('Marie Martin')
  })

  it('returns "Artisan" when name is null in profile', () => {
    expect(getArtisanDisplayName({ id: '1', name: null })).toBe('Artisan')
  })

  it('returns "Artisan" for empty array', () => {
    expect(getArtisanDisplayName([])).toBe('Artisan')
  })
})

// ---------------------------------------------------------------------------
// getClientInfo
// ---------------------------------------------------------------------------

describe('getClientInfo', () => {
  it('returns defaults when client is null', () => {
    expect(getClientInfo(null)).toEqual({ name: 'Client', email: '', phone: null })
  })

  it('extracts info from single client profile', () => {
    const client = { full_name: 'Alice', email: 'alice@test.com', phone_e164: '+33612345678' }
    expect(getClientInfo(client)).toEqual({
      name: 'Alice',
      email: 'alice@test.com',
      phone: '+33612345678',
    })
  })

  it('extracts first element from client array', () => {
    const clients = [
      { full_name: 'Bob', email: 'bob@test.com', phone_e164: null },
      { full_name: 'Charlie', email: 'charlie@test.com', phone_e164: '+33699999999' },
    ]
    expect(getClientInfo(clients)).toEqual({ name: 'Bob', email: 'bob@test.com', phone: null })
  })

  it('returns defaults for null fields in profile', () => {
    const client = { full_name: null, email: null, phone_e164: null }
    expect(getClientInfo(client)).toEqual({ name: 'Client', email: '', phone: null })
  })
})

// ---------------------------------------------------------------------------
// detectFraudIndicators
// ---------------------------------------------------------------------------

describe('detectFraudIndicators', () => {
  it('returns empty array for normal comment', () => {
    expect(detectFraudIndicators('Bon travail, je recommande.', 4)).toEqual([])
  })

  it('detects all caps text (>20 chars)', () => {
    const result = detectFraudIndicators('CE PLOMBIER EST TERRIBLE ET INCOMPETENT', 1)
    expect(result).toContain('all_caps')
  })

  it('does not flag short all-caps text', () => {
    const result = detectFraudIndicators('SUPER BOULOT', 5)
    expect(result).not.toContain('all_caps')
  })

  it('detects repeated characters', () => {
    const result = detectFraudIndicators('Nuuuuuuul ce plombier', 1)
    expect(result).toContain('repeated_chars')
  })

  it('detects links in comment', () => {
    const result = detectFraudIndicators('Allez voir https://spam.com', 5)
    expect(result).toContain('contains_links')
  })

  it('detects www links', () => {
    const result = detectFraudIndicators('Visitez www.spam.fr', 5)
    expect(result).toContain('contains_links')
  })

  it('detects excessive punctuation', () => {
    const result = detectFraudIndicators('Horrible!!!', 1)
    expect(result).toContain('excessive_punctuation')
  })

  it('detects short extreme rating (rating=1, short text)', () => {
    const result = detectFraudIndicators('Nul', 1)
    expect(result).toContain('short_extreme_rating')
  })

  it('detects short extreme rating (rating=5, short text)', () => {
    const result = detectFraudIndicators('Top', 5)
    expect(result).toContain('short_extreme_rating')
  })

  it('does not flag short text for mid-range ratings', () => {
    const result = detectFraudIndicators('Ok', 3)
    expect(result).not.toContain('short_extreme_rating')
  })

  it('returns empty array for empty comment', () => {
    expect(detectFraudIndicators('', 5)).toEqual([])
  })

  it('can detect multiple indicators at once', () => {
    const result = detectFraudIndicators('AAAAAAA VISITEZ HTTP://SPAM.COM!!! NUUUUUL', 1)
    expect(result.length).toBeGreaterThanOrEqual(3)
    expect(result).toContain('all_caps')
    expect(result).toContain('contains_links')
    expect(result).toContain('repeated_chars')
  })
})

// ---------------------------------------------------------------------------
// HMAC token generation & verification
// ---------------------------------------------------------------------------

describe('generateReviewToken', () => {
  const originalEnv = process.env.REVIEW_HMAC_SECRET

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.REVIEW_HMAC_SECRET = originalEnv
    } else {
      delete process.env.REVIEW_HMAC_SECRET
    }
  })

  it('returns null when REVIEW_HMAC_SECRET is not set', () => {
    delete process.env.REVIEW_HMAC_SECRET
    expect(generateReviewToken('booking-123')).toBeNull()
  })

  it('returns a 32-char hex string when secret is set', () => {
    process.env.REVIEW_HMAC_SECRET = 'test-secret-key'
    const token = generateReviewToken('booking-123')
    expect(token).not.toBeNull()
    expect(token!.length).toBe(32)
    expect(/^[0-9a-f]+$/.test(token!)).toBe(true)
  })

  it('returns deterministic output for same input', () => {
    process.env.REVIEW_HMAC_SECRET = 'test-secret-key'
    const t1 = generateReviewToken('booking-123')
    const t2 = generateReviewToken('booking-123')
    expect(t1).toBe(t2)
  })

  it('returns different tokens for different booking IDs', () => {
    process.env.REVIEW_HMAC_SECRET = 'test-secret-key'
    const t1 = generateReviewToken('booking-1')
    const t2 = generateReviewToken('booking-2')
    expect(t1).not.toBe(t2)
  })
})

describe('verifyReviewToken', () => {
  const originalEnv = process.env.REVIEW_HMAC_SECRET

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.REVIEW_HMAC_SECRET = originalEnv
    } else {
      delete process.env.REVIEW_HMAC_SECRET
    }
  })

  it('returns false when REVIEW_HMAC_SECRET is not set', () => {
    delete process.env.REVIEW_HMAC_SECRET
    expect(verifyReviewToken('booking-123', 'sometoken')).toBe(false)
  })

  it('returns true for valid token', () => {
    process.env.REVIEW_HMAC_SECRET = 'test-secret-key'
    const token = generateReviewToken('booking-123')!
    expect(verifyReviewToken('booking-123', token)).toBe(true)
  })

  it('returns false for invalid token', () => {
    process.env.REVIEW_HMAC_SECRET = 'test-secret-key'
    expect(verifyReviewToken('booking-123', 'deadbeefdeadbeefdeadbeefdeadbeef')).toBe(false)
  })

  it('returns false for wrong booking ID', () => {
    process.env.REVIEW_HMAC_SECRET = 'test-secret-key'
    const token = generateReviewToken('booking-123')!
    expect(verifyReviewToken('booking-999', token)).toBe(false)
  })

  it('returns false for token with wrong length', () => {
    process.env.REVIEW_HMAC_SECRET = 'test-secret-key'
    expect(verifyReviewToken('booking-123', 'short')).toBe(false)
  })

  it('returns false for non-hex token', () => {
    process.env.REVIEW_HMAC_SECRET = 'test-secret-key'
    // Non-hex chars will cause Buffer.from to produce different length
    expect(verifyReviewToken('booking-123', 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// computeReviewStats
// ---------------------------------------------------------------------------

function makeReview(
  overrides: Partial<{
    id: string
    rating: number
    content: string | null
    would_recommend: boolean
    author_name: string
    created_at: string
    reply: string | null
    reply_date: string | null
  }> = {}
) {
  return {
    id: overrides.id ?? 'r1',
    rating: overrides.rating ?? 5,
    content: overrides.content ?? 'Great work',
    would_recommend: overrides.would_recommend ?? true,
    author_name: overrides.author_name ?? 'Alice',
    created_at: overrides.created_at ?? '2026-01-01T00:00:00Z',
    reply: overrides.reply ?? null,
    reply_date: overrides.reply_date ?? null,
  }
}

describe('computeReviewStats', () => {
  it('returns zeros for empty reviews array', () => {
    const stats = computeReviewStats([])
    expect(stats).toEqual({
      total: 0,
      average: 0,
      recommendRate: 0,
      distribution: [0, 0, 0, 0, 0],
    })
  })

  it('computes correct stats for single review', () => {
    const stats = computeReviewStats([makeReview({ rating: 4, would_recommend: true })])
    expect(stats.total).toBe(1)
    expect(stats.average).toBe(4)
    expect(stats.recommendRate).toBe(100)
    expect(stats.distribution).toEqual([0, 0, 0, 1, 0])
  })

  it('computes correct average rating', () => {
    const reviews = [
      makeReview({ id: '1', rating: 5 }),
      makeReview({ id: '2', rating: 3 }),
      makeReview({ id: '3', rating: 4 }),
    ]
    const stats = computeReviewStats(reviews)
    expect(stats.total).toBe(3)
    expect(stats.average).toBe(4) // (5+3+4)/3 = 4.0
  })

  it('rounds average to one decimal place', () => {
    const reviews = [
      makeReview({ id: '1', rating: 5 }),
      makeReview({ id: '2', rating: 4 }),
      makeReview({ id: '3', rating: 4 }),
    ]
    const stats = computeReviewStats(reviews)
    // (5+4+4)/3 = 4.333... → 4.3
    expect(stats.average).toBe(4.3)
  })

  it('computes recommend rate correctly', () => {
    const reviews = [
      makeReview({ id: '1', would_recommend: true }),
      makeReview({ id: '2', would_recommend: true }),
      makeReview({ id: '3', would_recommend: false }),
      makeReview({ id: '4', would_recommend: false }),
    ]
    const stats = computeReviewStats(reviews)
    expect(stats.recommendRate).toBe(50)
  })

  it('builds correct distribution across all ratings', () => {
    const reviews = [
      makeReview({ id: '1', rating: 1 }),
      makeReview({ id: '2', rating: 2 }),
      makeReview({ id: '3', rating: 3 }),
      makeReview({ id: '4', rating: 4 }),
      makeReview({ id: '5', rating: 5 }),
      makeReview({ id: '6', rating: 5 }),
    ]
    const stats = computeReviewStats(reviews)
    expect(stats.distribution).toEqual([1, 1, 1, 1, 2])
  })

  it('handles all 1-star reviews', () => {
    const reviews = Array.from({ length: 5 }, (_, i) =>
      makeReview({ id: `r${i}`, rating: 1, would_recommend: false })
    )
    const stats = computeReviewStats(reviews)
    expect(stats.average).toBe(1)
    expect(stats.recommendRate).toBe(0)
    expect(stats.distribution).toEqual([5, 0, 0, 0, 0])
  })

  it('handles review with null content', () => {
    const stats = computeReviewStats([makeReview({ content: null, rating: 3 })])
    expect(stats.total).toBe(1)
    expect(stats.average).toBe(3)
  })
})

// ---------------------------------------------------------------------------
// updateArtisanRating
// ---------------------------------------------------------------------------

describe('updateArtisanRating', () => {
  it('updates provider rating_average and review_count', async () => {
    const updateMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    })

    const supabase = {
      from: vi.fn((table: string) => {
        if (table === 'reviews') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ rating: 4 }, { rating: 5 }, { rating: 3 }],
                error: null,
              }),
            }),
          }
        }
        if (table === 'providers') {
          return { update: updateMock }
        }
        return {}
      }),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await updateArtisanRating(supabase as any, 'provider-1')

    expect(supabase.from).toHaveBeenCalledWith('reviews')
    expect(supabase.from).toHaveBeenCalledWith('providers')
    expect(updateMock).toHaveBeenCalledWith({
      rating_average: 4,
      review_count: 3,
    })
  })

  it('does not update when there are no reviews', async () => {
    const updateMock = vi.fn()

    const supabase = {
      from: vi.fn((table: string) => {
        if (table === 'reviews') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }
        }
        if (table === 'providers') {
          return { update: updateMock }
        }
        return {}
      }),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await updateArtisanRating(supabase as any, 'provider-1')

    expect(updateMock).not.toHaveBeenCalled()
  })

  it('does not update when reviews data is null', async () => {
    const updateMock = vi.fn()

    const supabase = {
      from: vi.fn((table: string) => {
        if (table === 'reviews') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'DB error' },
              }),
            }),
          }
        }
        if (table === 'providers') {
          return { update: updateMock }
        }
        return {}
      }),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await updateArtisanRating(supabase as any, 'provider-1')

    expect(updateMock).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// createReview
// ---------------------------------------------------------------------------

describe('createReview', () => {
  const originalEnv = process.env.REVIEW_HMAC_SECRET

  beforeEach(() => {
    process.env.REVIEW_HMAC_SECRET = 'test-secret'
  })

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.REVIEW_HMAC_SECRET = originalEnv
    } else {
      delete process.env.REVIEW_HMAC_SECRET
    }
  })

  const defaultParams = {
    bookingId: 'booking-1',
    userId: 'user-1',
    rating: 5,
    comment: 'Excellent travail',
    wouldRecommend: true,
    reviewToken: '', // will be set per test
  }

  function makeSupabaseForCreateReview(
    overrides: {
      booking?: { data: unknown; error: unknown }
      existingReview?: { data: unknown; error: unknown }
      insertResult?: { data: unknown; error: unknown }
      providerData?: { data: unknown; error: unknown }
      reviewsForRating?: { data: unknown; error: unknown }
      updateProvider?: { data: unknown; error: unknown }
    } = {}
  ) {
    const booking = overrides.booking ?? {
      data: {
        id: 'booking-1',
        client_id: 'user-1',
        provider_id: 'provider-1',
        status: 'completed',
        client: { full_name: 'Alice', email: 'alice@test.com', phone_e164: null },
      },
      error: null,
    }
    const existingReview = overrides.existingReview ?? { data: null, error: { code: 'PGRST116' } }
    const insertResult = overrides.insertResult ?? {
      data: { id: 'review-1', status: 'published' },
      error: null,
    }

    // Track call order per table
    const reviewCalls: string[] = []

    const supabase = {
      from: vi.fn((table: string) => {
        if (table === 'bookings') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(booking),
              }),
            }),
          }
        }

        if (table === 'reviews') {
          reviewCalls.push('reviews')

          // First call: duplicate check (select), second call: insert, third call: updateArtisanRating
          if (reviewCalls.length === 1) {
            // duplicate check
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(existingReview),
                }),
              }),
            }
          }

          if (reviewCalls.length === 2) {
            // insert
            return {
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(insertResult),
                }),
              }),
            }
          }

          // updateArtisanRating select
          return {
            select: vi.fn().mockReturnValue({
              eq: vi
                .fn()
                .mockResolvedValue(
                  overrides.reviewsForRating ?? { data: [{ rating: 5 }], error: null }
                ),
            }),
          }
        }

        if (table === 'providers') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue(
                  overrides.providerData ?? {
                    data: {
                      specialty: 'plombier',
                      address_city: 'Paris',
                      slug: 'jean-plombier',
                      stable_id: 'abc',
                    },
                    error: null,
                  }
                ),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi
                .fn()
                .mockResolvedValue(overrides.updateProvider ?? { data: null, error: null }),
            }),
          }
        }

        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }
      }),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return supabase as any
  }

  it('successfully creates a review', async () => {
    const token = generateReviewToken('booking-1')!
    const supabase = makeSupabaseForCreateReview()

    const result = await createReview(supabase, { ...defaultParams, reviewToken: token })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.reviewId).toBe('review-1')
      expect(result.status).toBe('published')
      expect(result.fraudDetected).toBe(false)
    }
  })

  it('returns booking_not_found when booking does not exist', async () => {
    const token = generateReviewToken('booking-1')!
    const supabase = makeSupabaseForCreateReview({
      booking: { data: null, error: { message: 'not found' } },
    })

    const result = await createReview(supabase, { ...defaultParams, reviewToken: token })
    expect(result).toEqual({ success: false, code: 'booking_not_found' })
  })

  it('returns not_owner when userId does not match client_id', async () => {
    const token = generateReviewToken('booking-1')!
    const supabase = makeSupabaseForCreateReview({
      booking: {
        data: {
          id: 'booking-1',
          client_id: 'other-user',
          provider_id: 'provider-1',
          status: 'completed',
          client: { full_name: 'Bob', email: 'bob@test.com', phone_e164: null },
        },
        error: null,
      },
    })

    const result = await createReview(supabase, { ...defaultParams, reviewToken: token })
    expect(result).toEqual({ success: false, code: 'not_owner' })
  })

  it('returns missing_token when reviewToken is undefined', async () => {
    const supabase = makeSupabaseForCreateReview()

    const result = await createReview(supabase, {
      ...defaultParams,
      reviewToken: undefined as unknown as string,
    })
    expect(result).toEqual({ success: false, code: 'missing_token' })
  })

  it('returns missing_token when REVIEW_HMAC_SECRET is not set', async () => {
    delete process.env.REVIEW_HMAC_SECRET
    const supabase = makeSupabaseForCreateReview()

    const result = await createReview(supabase, { ...defaultParams, reviewToken: 'sometoken' })
    expect(result).toEqual({ success: false, code: 'missing_token' })
  })

  it('returns invalid_token for wrong HMAC token', async () => {
    const supabase = makeSupabaseForCreateReview()

    const result = await createReview(supabase, {
      ...defaultParams,
      reviewToken: 'deadbeefdeadbeefdeadbeefdeadbeef',
    })
    expect(result).toEqual({ success: false, code: 'invalid_token' })
  })

  it('returns wrong_status when booking status is pending', async () => {
    const token = generateReviewToken('booking-1')!
    const supabase = makeSupabaseForCreateReview({
      booking: {
        data: {
          id: 'booking-1',
          client_id: 'user-1',
          provider_id: 'provider-1',
          status: 'pending',
          client: { full_name: 'Alice', email: 'alice@test.com', phone_e164: null },
        },
        error: null,
      },
    })

    const result = await createReview(supabase, { ...defaultParams, reviewToken: token })
    expect(result).toEqual({ success: false, code: 'wrong_status' })
  })

  it('returns already_reviewed when a review already exists', async () => {
    const token = generateReviewToken('booking-1')!
    const supabase = makeSupabaseForCreateReview({
      existingReview: { data: { id: 'existing-review' }, error: null },
    })

    const result = await createReview(supabase, { ...defaultParams, reviewToken: token })
    expect(result).toEqual({ success: false, code: 'already_reviewed' })
  })

  it('returns db_error when insert fails', async () => {
    const token = generateReviewToken('booking-1')!
    const supabase = makeSupabaseForCreateReview({
      insertResult: { data: null, error: { message: 'insert failed' } },
    })

    const result = await createReview(supabase, { ...defaultParams, reviewToken: token })
    expect(result).toEqual({ success: false, code: 'db_error' })
  })

  it('marks review as pending_review when fraud is detected', async () => {
    const token = generateReviewToken('booking-1')!
    const supabase = makeSupabaseForCreateReview({
      insertResult: {
        data: { id: 'review-fraud', status: 'pending_review' },
        error: null,
      },
    })

    const result = await createReview(supabase, {
      ...defaultParams,
      comment: 'NUUUUUUL CE MEC EST TERRIBLE ET INCOMPETENT',
      reviewToken: token,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.fraudDetected).toBe(true)
    }
  })

  it('accepts confirmed booking status', async () => {
    const token = generateReviewToken('booking-1')!
    const supabase = makeSupabaseForCreateReview({
      booking: {
        data: {
          id: 'booking-1',
          client_id: 'user-1',
          provider_id: 'provider-1',
          status: 'confirmed',
          client: { full_name: 'Alice', email: 'alice@test.com', phone_e164: null },
        },
        error: null,
      },
    })

    const result = await createReview(supabase, { ...defaultParams, reviewToken: token })
    expect(result.success).toBe(true)
  })
})
