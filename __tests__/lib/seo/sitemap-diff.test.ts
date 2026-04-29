/**
 * Tests `sitemap-diff` — Bouclier 5 du plan ULTRA DOMINATION SEO v2.
 * Pure logic + mocked Supabase pour le code DB.
 */
import { describe, it, expect, vi } from 'vitest'
import {
  classifyDelta,
  computeDeltaPct,
  computeSitemapDiff,
  persistSitemapRun,
  DIFF_ALERT_PCT_THRESHOLD,
  type SitemapRun,
} from '@/lib/seo/sitemap-diff'

describe('classifyDelta — pure', () => {
  it('returns null when baseline is 0 (no alert without prior data)', () => {
    expect(classifyDelta(0, 100)).toBeNull()
    expect(classifyDelta(0, 0)).toBeNull()
  })

  it('returns null when delta < 5% threshold', () => {
    expect(classifyDelta(1000, 1040)).toBeNull() // 4%
    expect(classifyDelta(1000, 960)).toBeNull() // -4%
  })

  it("returns 'warn' when delta is between 5% and 20%", () => {
    expect(classifyDelta(1000, 1100)).toBe('warn') // +10%
    expect(classifyDelta(1000, 940)).toBe('warn') // -6%
    expect(classifyDelta(1000, 1199)).toBe('warn') // +19.9%
  })

  it("returns 'critical' when delta >= 20%", () => {
    expect(classifyDelta(1000, 1200)).toBe('critical') // +20%
    expect(classifyDelta(1000, 800)).toBe('critical') // -20%
    expect(classifyDelta(1000, 500)).toBe('critical') // -50%
  })

  it('alerts at exact threshold boundary', () => {
    // 5% pile = warn (>=)
    expect(classifyDelta(100, 105)).toBe('warn')
  })
})

describe('computeDeltaPct — pure', () => {
  it('returns signed pct rounded to 4 decimals', () => {
    expect(computeDeltaPct(1000, 1100)).toBe(0.1)
    expect(computeDeltaPct(1000, 900)).toBe(-0.1)
  })

  it('returns 0 when before is 0 (no division)', () => {
    expect(computeDeltaPct(0, 100)).toBe(0)
  })
})

describe('DIFF_ALERT_PCT_THRESHOLD constant', () => {
  it('is 5% as documented in plan v2', () => {
    expect(DIFF_ALERT_PCT_THRESHOLD).toBe(0.05)
  })
})

describe('computeSitemapDiff — DB integration', () => {
  function buildSupabaseMock(
    previousByUrl: Record<string, { url_count: number; run_at: string } | null>,
    fetchError = false
  ) {
    return {
      from: vi.fn(() => {
        const builder: Record<string, unknown> = {}
        let currentUrl = ''
        Object.assign(builder, {
          select: vi.fn(() => builder),
          eq: vi.fn((_col: string, val: string) => {
            currentUrl = val
            return builder
          }),
          order: vi.fn(() => builder),
          limit: vi.fn(() => builder),
          maybeSingle: vi.fn(async () => {
            if (fetchError) return { data: null, error: { message: 'DB down' } }
            const data = previousByUrl[currentUrl] ?? null
            return { data, error: null }
          }),
        })
        return builder
      }),
    } as unknown as Parameters<typeof computeSitemapDiff>[0]
  }

  it('returns empty array when no current runs', async () => {
    const supabase = buildSupabaseMock({})
    const alerts = await computeSitemapDiff(supabase, [])
    expect(alerts).toEqual([])
  })

  it('returns empty array when no prior baseline exists', async () => {
    const supabase = buildSupabaseMock({})
    const current: SitemapRun[] = [{ sitemap_url: 'a', url_count: 100, status: 200, ok: true }]
    const alerts = await computeSitemapDiff(supabase, current)
    expect(alerts).toEqual([])
  })

  it('emits warn alert on -10% drop with prior baseline', async () => {
    const supabase = buildSupabaseMock({
      'https://example.com/sitemap-1.xml': {
        url_count: 1000,
        run_at: '2026-04-28T06:00:00Z',
      },
    })
    const alerts = await computeSitemapDiff(supabase, [
      {
        sitemap_url: 'https://example.com/sitemap-1.xml',
        url_count: 900,
        status: 200,
        ok: true,
      },
    ])
    expect(alerts).toHaveLength(1)
    expect(alerts[0].severity).toBe('warn')
    expect(alerts[0].before_count).toBe(1000)
    expect(alerts[0].after_count).toBe(900)
    expect(alerts[0].delta_pct).toBe(-0.1)
  })

  it('emits critical alert on -50% drop', async () => {
    const supabase = buildSupabaseMock({
      a: { url_count: 1000, run_at: '2026-04-28T06:00:00Z' },
    })
    const alerts = await computeSitemapDiff(supabase, [
      { sitemap_url: 'a', url_count: 500, status: 200, ok: true },
    ])
    expect(alerts).toHaveLength(1)
    expect(alerts[0].severity).toBe('critical')
  })

  it('skips sitemaps within 5% threshold', async () => {
    const supabase = buildSupabaseMock({
      a: { url_count: 1000, run_at: '2026-04-28T06:00:00Z' },
    })
    const alerts = await computeSitemapDiff(supabase, [
      { sitemap_url: 'a', url_count: 1020, status: 200, ok: true },
    ])
    expect(alerts).toEqual([])
  })

  it('fail-safes silently on DB error', async () => {
    const supabase = buildSupabaseMock({}, true)
    const alerts = await computeSitemapDiff(supabase, [
      { sitemap_url: 'a', url_count: 100, status: 200, ok: true },
    ])
    expect(alerts).toEqual([])
  })
})

describe('persistSitemapRun', () => {
  it('returns ok=true / inserted=0 when runs is empty', async () => {
    const supabase = {
      from: vi.fn(() => ({ insert: vi.fn() })),
    } as unknown as Parameters<typeof persistSitemapRun>[0]
    const r = await persistSitemapRun(supabase, [])
    expect(r).toEqual({ ok: true, inserted: 0 })
  })

  it('inserts all runs as a batch with shared run_at', async () => {
    const insertSpy = vi.fn(async (_rows: unknown) => ({ error: null }))
    const supabase = {
      from: vi.fn(() => ({ insert: insertSpy })),
    } as unknown as Parameters<typeof persistSitemapRun>[0]
    const r = await persistSitemapRun(supabase, [
      { sitemap_url: 'a', url_count: 100, status: 200, ok: true },
      { sitemap_url: 'b', url_count: 50, status: 200, ok: true },
    ])
    expect(r.ok).toBe(true)
    expect(r.inserted).toBe(2)
    expect(insertSpy).toHaveBeenCalledTimes(1)
    const rows = insertSpy.mock.calls[0][0] as Array<{ run_at: string }>
    expect(rows).toHaveLength(2)
    expect(rows[0].run_at).toBe(rows[1].run_at) // shared timestamp
  })

  it('returns ok=false on insert error', async () => {
    const supabase = {
      from: vi.fn(() => ({
        insert: vi.fn(async () => ({ error: { message: 'fail' } })),
      })),
    } as unknown as Parameters<typeof persistSitemapRun>[0]
    const r = await persistSitemapRun(supabase, [
      { sitemap_url: 'a', url_count: 100, status: 200, ok: true },
    ])
    expect(r).toEqual({ ok: false, inserted: 0 })
  })
})
