/**
 * Tests `baseline-aggregator` — `diffAggregates` est pure et testable seule.
 * `computeSeoAggregate` est testée via mocks chaînés sur le SupabaseClient.
 */
import { describe, it, expect, vi } from 'vitest'
import {
  diffAggregates,
  computeSeoAggregate,
  type SeoAggregate,
} from '@/lib/seo/baseline-aggregator'

const baseAgg: SeoAggregate = {
  total_pages: 1000,
  indexed_count: 800,
  orphan_critical: 50,
  orphan_weak: 100,
  avg_link_score: 4.5,
  median_link_score: 4.0,
  by_page_type: {
    services: { count: 500, indexed: 450, orphans: 30, avg_link_score: 5.0 },
    blog: { count: 300, indexed: 280, orphans: 10, avg_link_score: 6.0 },
  },
}

describe('diffAggregates', () => {
  it('returns zero deltas when before === after', () => {
    const delta = diffAggregates(baseAgg, baseAgg)
    expect(delta.total_pages).toBe(0)
    expect(delta.indexed_count).toBe(0)
    expect(delta.orphan_critical).toBe(0)
    expect(delta.avg_link_score).toBe(0)
    expect(delta.by_page_type.services.count).toBe(0)
  })

  it('captures positive growth and orphan reduction', () => {
    const after: SeoAggregate = {
      ...baseAgg,
      total_pages: 1200,
      indexed_count: 1000,
      orphan_critical: 30,
      orphan_weak: 80,
      avg_link_score: 5.0,
      median_link_score: 4.5,
      by_page_type: {
        services: { count: 600, indexed: 550, orphans: 20, avg_link_score: 5.5 },
        blog: { count: 350, indexed: 320, orphans: 8, avg_link_score: 6.2 },
      },
    }
    const delta = diffAggregates(baseAgg, after)
    expect(delta.total_pages).toBe(200)
    expect(delta.indexed_count).toBe(200)
    expect(delta.orphan_critical).toBe(-20) // improvement
    expect(delta.orphan_weak).toBe(-20)
    expect(delta.avg_link_score).toBe(0.5)
    expect(delta.by_page_type.services.count).toBe(100)
    expect(delta.by_page_type.services.orphans).toBe(-10)
    expect(delta.by_page_type.blog.avg_link_score).toBe(0.2)
  })

  it('handles new page types appearing in after only', () => {
    const after: SeoAggregate = {
      ...baseAgg,
      by_page_type: {
        ...baseAgg.by_page_type,
        rge: { count: 100, indexed: 90, orphans: 5, avg_link_score: 7.0 },
      },
    }
    const delta = diffAggregates(baseAgg, after)
    expect(delta.by_page_type.rge.count).toBe(100)
    expect(delta.by_page_type.rge.indexed).toBe(90)
  })

  it('handles page types removed in after', () => {
    const before: SeoAggregate = {
      ...baseAgg,
      by_page_type: {
        ...baseAgg.by_page_type,
        deprecated: { count: 50, indexed: 40, orphans: 5, avg_link_score: 2.0 },
      },
    }
    const delta = diffAggregates(before, baseAgg)
    expect(delta.by_page_type.deprecated.count).toBe(-50)
  })

  it('rounds avg_link_score deltas to 2 decimals', () => {
    const after: SeoAggregate = { ...baseAgg, avg_link_score: 4.5678 }
    const delta = diffAggregates(baseAgg, after)
    expect(delta.avg_link_score).toBe(0.07)
  })
})

describe('computeSeoAggregate', () => {
  function buildSupabaseMock(overrides: {
    counts: { total: number; indexed: number; orphanCritical: number; orphanWeak: number }
    scores: number[]
    typeCounts: Record<
      string,
      { count: number; indexed: number; orphans: number; scores: number[] }
    >
  }) {
    const calls: Array<{ filters: Record<string, unknown>; head: boolean }> = []

    function makeBuilder() {
      const filters: Record<string, unknown> = {}
      let isHead = false
      let limit = Infinity
      const builder: Record<string, unknown> = {
        select: vi.fn((_cols: string, opts?: { count?: 'exact'; head?: boolean }) => {
          if (opts?.head) isHead = true
          return builder
        }),
        eq: vi.fn((col: string, val: unknown) => {
          filters[`eq_${col}`] = val
          return builder
        }),
        gt: vi.fn((col: string, val: unknown) => {
          filters[`gt_${col}`] = val
          return builder
        }),
        not: vi.fn(() => builder),
        limit: vi.fn((n: number) => {
          limit = n
          return builder
        }),
        then: (resolve: (v: unknown) => void) => {
          calls.push({ filters, head: isHead })
          if (isHead) {
            // Return appropriate count
            const isPageType = filters.eq_page_type
            const isOrphan = filters.eq_is_orphan === true
            const isIndexed = filters.eq_is_indexed === true
            const isInternalZero = filters.eq_internal_links_in === 0

            if (isPageType) {
              const t = filters.eq_page_type as string
              const tc = overrides.typeCounts[t]
              if (!tc) return resolve({ data: null, count: 0, error: null })
              if (isOrphan) return resolve({ data: null, count: tc.orphans, error: null })
              if (isIndexed) return resolve({ data: null, count: tc.indexed, error: null })
              return resolve({ data: null, count: tc.count, error: null })
            }
            if (isOrphan && isInternalZero)
              return resolve({ data: null, count: overrides.counts.orphanCritical, error: null })
            if (isOrphan)
              return resolve({ data: null, count: overrides.counts.orphanWeak, error: null })
            if (isIndexed)
              return resolve({ data: null, count: overrides.counts.indexed, error: null })
            return resolve({ data: null, count: overrides.counts.total, error: null })
          }
          // Non-head: scores rows
          const isPageType = filters.eq_page_type
          if (isPageType) {
            const t = filters.eq_page_type as string
            const tc = overrides.typeCounts[t]
            const rows = (tc?.scores ?? []).slice(0, limit).map((s) => ({ link_score: s }))
            return resolve({ data: rows, count: null, error: null })
          }
          const rows = overrides.scores.slice(0, limit).map((s) => ({ link_score: s }))
          return resolve({ data: rows, count: null, error: null })
        },
      }
      return builder
    }

    return {
      from: vi.fn(() => makeBuilder()),
    } as unknown as Parameters<typeof computeSeoAggregate>[0]
  }

  it('aggregates global counts and scores correctly', async () => {
    const supabase = buildSupabaseMock({
      counts: { total: 1000, indexed: 800, orphanCritical: 50, orphanWeak: 100 },
      scores: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      typeCounts: {
        services: { count: 500, indexed: 450, orphans: 30, scores: [4, 5, 6] },
        blog: { count: 300, indexed: 280, orphans: 10, scores: [6, 7, 8] },
      },
    })
    const agg = await computeSeoAggregate(supabase)
    expect(agg.total_pages).toBe(1000)
    expect(agg.indexed_count).toBe(800)
    expect(agg.orphan_critical).toBe(50)
    expect(agg.orphan_weak).toBe(100)
    expect(agg.avg_link_score).toBe(5.5)
    expect(agg.median_link_score).toBe(5.5)
    expect(agg.by_page_type.services).toBeDefined()
    expect(agg.by_page_type.services.count).toBe(500)
    expect(agg.by_page_type.services.avg_link_score).toBe(5)
  })

  it('omits page types with zero count', async () => {
    const supabase = buildSupabaseMock({
      counts: { total: 100, indexed: 90, orphanCritical: 0, orphanWeak: 5 },
      scores: [3, 4, 5],
      typeCounts: {},
    })
    const agg = await computeSeoAggregate(supabase)
    expect(agg.by_page_type).toEqual({})
  })

  it('handles empty database (zero scores) without crashing', async () => {
    const supabase = buildSupabaseMock({
      counts: { total: 0, indexed: 0, orphanCritical: 0, orphanWeak: 0 },
      scores: [],
      typeCounts: {},
    })
    const agg = await computeSeoAggregate(supabase)
    expect(agg.total_pages).toBe(0)
    expect(agg.avg_link_score).toBe(0)
    expect(agg.median_link_score).toBe(0)
  })
})
