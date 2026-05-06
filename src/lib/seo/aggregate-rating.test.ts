import { describe, expect, it } from 'vitest'
import { buildAggregateRatingFromProviders } from './aggregate-rating'

describe('buildAggregateRatingFromProviders', () => {
  it('returns null when no providers', () => {
    expect(buildAggregateRatingFromProviders([])).toBeNull()
  })

  it('returns null when all providers have zero reviews', () => {
    const result = buildAggregateRatingFromProviders([
      { rating_average: 0, review_count: 0 },
      { rating_average: null, review_count: 0 },
      { rating_average: undefined, review_count: null },
    ])
    expect(result).toBeNull()
  })

  it('skips providers with review_count=0 even if rating>0 (would bias average)', () => {
    const result = buildAggregateRatingFromProviders([
      { rating_average: 4.8, review_count: 10 },
      { rating_average: 5.0, review_count: 0 }, // ignored
    ])
    expect(result).not.toBeNull()
    if (!result) return
    expect(result.ratingValue).toBe('4.8')
    expect(result.reviewCount).toBe('10')
  })

  it('computes weighted average (higher-review providers weigh more)', () => {
    const result = buildAggregateRatingFromProviders([
      { rating_average: 4.0, review_count: 1 }, // 4
      { rating_average: 5.0, review_count: 9 }, // 45
    ])
    // (4 + 45) / 10 = 4.9
    expect(result).not.toBeNull()
    if (!result) return
    expect(result.ratingValue).toBe('4.9')
    expect(result.reviewCount).toBe('10')
  })

  it('coerces string NUMERIC values from Supabase', () => {
    const result = buildAggregateRatingFromProviders([
      { rating_average: '4.5' as unknown as number, review_count: 4 },
    ])
    expect(result).not.toBeNull()
    if (!result) return
    expect(result.ratingValue).toBe('4.5')
    expect(result.reviewCount).toBe('4')
  })

  it('returns 5-scale bounded schema object', () => {
    const result = buildAggregateRatingFromProviders([{ rating_average: 4.7, review_count: 12 }])
    expect(result).toEqual({
      '@type': 'AggregateRating',
      ratingValue: '4.7',
      reviewCount: '12',
      bestRating: '5',
      worstRating: '1',
    })
  })

  it('guards against absurd ratings outside 1..5 scale', () => {
    const result = buildAggregateRatingFromProviders([
      { rating_average: 42, review_count: 10 }, // garbage
    ])
    expect(result).toBeNull()
  })

  // === Google Places fallback (mig 483 + audit SEO 10-agents 04-28 #5) ===

  it('uses Google fallback when first-party review_count = 0 and Google passes guards', () => {
    const result = buildAggregateRatingFromProviders([
      {
        rating_average: 0,
        review_count: 0,
        google_rating: 4.6,
        google_user_ratings_total: 50,
        google_business_status: 'OPERATIONAL',
        google_place_id: 'ChIJabc123',
      },
    ])
    expect(result).not.toBeNull()
    if (!result) return
    expect(result.ratingValue).toBe('4.6')
    expect(result.reviewCount).toBe('50')
  })

  it('prefers first-party over Google when both present', () => {
    const result = buildAggregateRatingFromProviders([
      {
        rating_average: 5.0,
        review_count: 10,
        google_rating: 3.0,
        google_user_ratings_total: 100,
        google_business_status: 'OPERATIONAL',
        google_place_id: 'ChIJabc123',
      },
    ])
    expect(result).not.toBeNull()
    if (!result) return
    expect(result.ratingValue).toBe('5.0')
    expect(result.reviewCount).toBe('10')
  })

  it('rejects Google fallback when count < 3 (mimic Google display threshold)', () => {
    const result = buildAggregateRatingFromProviders([
      {
        rating_average: null,
        review_count: 0,
        google_rating: 5.0,
        google_user_ratings_total: 2, // too few
        google_business_status: 'OPERATIONAL',
        google_place_id: 'ChIJabc123',
      },
    ])
    expect(result).toBeNull()
  })

  it('rejects Google fallback when business is CLOSED_PERMANENTLY', () => {
    const result = buildAggregateRatingFromProviders([
      {
        rating_average: null,
        review_count: 0,
        google_rating: 4.5,
        google_user_ratings_total: 100,
        google_business_status: 'CLOSED_PERMANENTLY',
        google_place_id: 'ChIJabc123',
      },
    ])
    expect(result).toBeNull()
  })

  it('rejects Google fallback when place_id missing (no real entity match)', () => {
    const result = buildAggregateRatingFromProviders([
      {
        rating_average: null,
        review_count: 0,
        google_rating: 4.5,
        google_user_ratings_total: 100,
        google_business_status: 'OPERATIONAL',
        google_place_id: null,
      },
    ])
    expect(result).toBeNull()
  })

  it('rejects Google fallback when rating outside [1, 5]', () => {
    const result = buildAggregateRatingFromProviders([
      {
        rating_average: null,
        review_count: 0,
        google_rating: 0.5, // sub-1
        google_user_ratings_total: 100,
        google_business_status: 'OPERATIONAL',
        google_place_id: 'ChIJabc123',
      },
    ])
    expect(result).toBeNull()
  })

  it('mixes first-party + Google providers with weighted average', () => {
    const result = buildAggregateRatingFromProviders([
      { rating_average: 5.0, review_count: 10 }, // 50 — first-party
      {
        rating_average: 0,
        review_count: 0,
        google_rating: 4.0,
        google_user_ratings_total: 40,
        google_business_status: 'OPERATIONAL',
        google_place_id: 'ChIJxyz',
      }, // 160 — Google fallback
    ])
    // (50 + 160) / (10 + 40) = 210 / 50 = 4.2
    expect(result).not.toBeNull()
    if (!result) return
    expect(result.ratingValue).toBe('4.2')
    expect(result.reviewCount).toBe('50')
  })

  it('coerces Google rating string from Supabase NUMERIC', () => {
    const result = buildAggregateRatingFromProviders([
      {
        rating_average: null,
        review_count: 0,
        google_rating: '4.3' as unknown as number,
        google_user_ratings_total: 25,
        google_business_status: 'OPERATIONAL',
        google_place_id: 'ChIJabc',
      },
    ])
    expect(result).not.toBeNull()
    if (!result) return
    expect(result.ratingValue).toBe('4.3')
    expect(result.reviewCount).toBe('25')
  })
})
