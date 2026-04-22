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
})
