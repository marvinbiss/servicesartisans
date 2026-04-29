/**
 * Tests `lighthouse-monitor` — Bouclier 4 du plan ULTRA DOMINATION SEO v2.
 * Pure logic + DI fetcher PSI + mocked Supabase.
 */
import { afterEach, describe, it, expect, vi } from 'vitest'
import {
  auditUrls,
  classifyLighthouse,
  extractMetricsFromPsi,
  LIGHTHOUSE_CLS_CRITICAL,
  LIGHTHOUSE_LCP_CRITICAL_MS,
  LIGHTHOUSE_PERF_CRITICAL,
  LIGHTHOUSE_PERF_WARN,
  makePsiFetcher,
  persistLighthouseScores,
  type PsiFetcher,
} from '@/lib/seo/lighthouse-monitor'

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('classifyLighthouse — pure', () => {
  it('returns ok when all metrics are healthy', () => {
    expect(classifyLighthouse({ performanceScore: 90, lcpMs: 2000, cls: 0.05 })).toBe('ok')
  })

  it('returns warn when perf 50-69', () => {
    expect(classifyLighthouse({ performanceScore: 65, lcpMs: 2000, cls: 0.1 })).toBe('warn')
    expect(
      classifyLighthouse({ performanceScore: LIGHTHOUSE_PERF_WARN - 1, lcpMs: 2000, cls: 0.1 })
    ).toBe('warn')
  })

  it('returns critical on perf < 50', () => {
    expect(
      classifyLighthouse({ performanceScore: LIGHTHOUSE_PERF_CRITICAL - 1, lcpMs: 1000, cls: 0 })
    ).toBe('critical')
  })

  it('returns critical when LCP > 4000ms even if perf is OK', () => {
    expect(
      classifyLighthouse({ performanceScore: 90, lcpMs: LIGHTHOUSE_LCP_CRITICAL_MS + 1, cls: 0 })
    ).toBe('critical')
  })

  it('returns critical when CLS > 0.25 even if perf is OK', () => {
    expect(
      classifyLighthouse({ performanceScore: 90, lcpMs: 2000, cls: LIGHTHOUSE_CLS_CRITICAL + 0.01 })
    ).toBe('critical')
  })

  it('handles null metrics gracefully (perf alone decides)', () => {
    expect(classifyLighthouse({ performanceScore: 80, lcpMs: null, cls: null })).toBe('ok')
    expect(classifyLighthouse({ performanceScore: null, lcpMs: null, cls: null })).toBe('ok')
  })

  it('boundary: perf=70 is ok (not warn)', () => {
    expect(classifyLighthouse({ performanceScore: LIGHTHOUSE_PERF_WARN, lcpMs: 0, cls: 0 })).toBe(
      'ok'
    )
  })

  it('boundary: perf=50 is warn (not critical)', () => {
    expect(
      classifyLighthouse({ performanceScore: LIGHTHOUSE_PERF_CRITICAL, lcpMs: 0, cls: 0 })
    ).toBe('warn')
  })

  it('boundary: cls=0.25 exactly is NOT critical (strict >)', () => {
    expect(
      classifyLighthouse({
        performanceScore: 90,
        lcpMs: 2000,
        cls: LIGHTHOUSE_CLS_CRITICAL,
      })
    ).toBe('ok')
  })
})

describe('extractMetricsFromPsi — shape resilience', () => {
  it('extracts all metrics from a valid PSI response', () => {
    const psi = {
      lighthouseResult: {
        categories: { performance: { score: 0.85 } },
        audits: {
          'largest-contentful-paint': { numericValue: 2400.7 },
          'cumulative-layout-shift': { numericValue: 0.07 },
          'first-contentful-paint': { numericValue: 1100.4 },
          'total-blocking-time': { numericValue: 250.2 },
          'interaction-to-next-paint': { numericValue: 220.7 },
        },
      },
    }
    const m = extractMetricsFromPsi(psi)
    expect(m.performanceScore).toBe(85)
    expect(m.lcpMs).toBe(2401)
    expect(m.cls).toBe(0.07)
    expect(m.fcpMs).toBe(1100)
    expect(m.tbtMs).toBe(250)
    expect(m.inpMs).toBe(221)
  })

  it('returns null fields when PSI shape is incomplete', () => {
    const m = extractMetricsFromPsi({ lighthouseResult: { categories: {}, audits: {} } })
    expect(m).toEqual({
      performanceScore: null,
      lcpMs: null,
      cls: null,
      inpMs: null,
      fcpMs: null,
      tbtMs: null,
    })
  })

  it('returns all-null on completely malformed input', () => {
    expect(extractMetricsFromPsi(null)).toEqual({
      performanceScore: null,
      lcpMs: null,
      cls: null,
      inpMs: null,
      fcpMs: null,
      tbtMs: null,
    })
    expect(extractMetricsFromPsi('not an object')).toMatchObject({ performanceScore: null })
    expect(extractMetricsFromPsi(42)).toMatchObject({ performanceScore: null })
  })

  it('uses canonical INP audit key (interaction-to-next-paint)', () => {
    const psi = {
      lighthouseResult: {
        categories: { performance: { score: 0.5 } },
        audits: { 'interaction-to-next-paint': { numericValue: 220 } },
      },
    }
    expect(extractMetricsFromPsi(psi).inpMs).toBe(220)
  })

  it('falls back to experimental INP key when canonical absent', () => {
    const psi = {
      lighthouseResult: {
        categories: { performance: { score: 0.5 } },
        audits: { 'experimental-interaction-to-next-paint': { numericValue: 180 } },
      },
    }
    expect(extractMetricsFromPsi(psi).inpMs).toBe(180)
  })

  it('does NOT fallback to TTI (`interactive` audit) — TTI is a different metric', () => {
    const psi = {
      lighthouseResult: {
        categories: { performance: { score: 0.5 } },
        audits: { interactive: { numericValue: 5000 } },
      },
    }
    // TTI must NOT be stored as INP
    expect(extractMetricsFromPsi(psi).inpMs).toBeNull()
  })

  it('treats performanceScore === 0 as 0 (not null)', () => {
    const psi = {
      lighthouseResult: { categories: { performance: { score: 0 } }, audits: {} },
    }
    expect(extractMetricsFromPsi(psi).performanceScore).toBe(0)
    expect(classifyLighthouse({ performanceScore: 0, lcpMs: null, cls: null })).toBe('critical')
  })

  it('rejects NaN/Infinity in numericValue', () => {
    const psi = {
      lighthouseResult: {
        categories: { performance: { score: NaN } },
        audits: { 'largest-contentful-paint': { numericValue: Infinity } },
      },
    }
    const m = extractMetricsFromPsi(psi)
    expect(m.performanceScore).toBeNull()
    expect(m.lcpMs).toBeNull()
  })
})

describe('auditUrls — DI fetcher', () => {
  function fakePsiOk(perf: number, lcp: number, cls: number): unknown {
    return {
      lighthouseResult: {
        categories: { performance: { score: perf / 100 } },
        audits: {
          'largest-contentful-paint': { numericValue: lcp },
          'cumulative-layout-shift': { numericValue: cls },
          'first-contentful-paint': { numericValue: 1000 },
          'total-blocking-time': { numericValue: 100 },
          interactive: { numericValue: 2000 },
        },
      },
    }
  }

  it('returns empty array when no urls', async () => {
    const fetcher: PsiFetcher = vi.fn()
    const result = await auditUrls([], fetcher)
    expect(result).toEqual([])
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('audits each url x strategy by default (mobile + desktop)', async () => {
    const fetcher: PsiFetcher = vi.fn(async () => fakePsiOk(90, 2000, 0.05))
    const result = await auditUrls(['https://a.fr'], fetcher)
    expect(result).toHaveLength(2)
    expect(result.map((r) => r.strategy).sort()).toEqual(['desktop', 'mobile'])
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('skips entry when fetcher returns null', async () => {
    const fetcher: PsiFetcher = vi.fn(async (_url, strategy) =>
      strategy === 'mobile' ? null : fakePsiOk(80, 2500, 0.1)
    )
    const result = await auditUrls(['https://a.fr'], fetcher)
    expect(result).toHaveLength(1)
    expect(result[0].strategy).toBe('desktop')
  })

  it('skips entry when fetcher throws (no crash)', async () => {
    const fetcher: PsiFetcher = vi.fn(async () => {
      throw new Error('boom')
    })
    const result = await auditUrls(['https://a.fr'], fetcher, ['mobile'])
    expect(result).toEqual([])
  })

  it('classifies severity correctly downstream', async () => {
    const fetcher: PsiFetcher = vi.fn(async () => fakePsiOk(40, 2000, 0.05))
    const result = await auditUrls(['https://a.fr'], fetcher, ['mobile'])
    expect(result[0].severity).toBe('critical')
  })

  it('truncates rawAudit to slim summary', async () => {
    const big = 'x'.repeat(200_000)
    const psi = {
      lighthouseResult: {
        lighthouseVersion: '11.0',
        fetchTime: '2026-04-29T00:00:00Z',
        requestedUrl: 'https://a.fr',
        finalUrl: 'https://a.fr',
        categories: { performance: { score: 0.9 } },
        audits: { huge: { numericValue: 1, padding: big } },
      },
    }
    const fetcher: PsiFetcher = vi.fn(async () => psi)
    const result = await auditUrls(['https://a.fr'], fetcher, ['mobile'])
    expect(result[0].rawAudit).not.toHaveProperty('audits')
    expect(result[0].rawAudit).toHaveProperty('lighthouseVersion', '11.0')
  })
})

describe('persistLighthouseScores — DB integration', () => {
  it('returns ok=true / upserted=0 when empty', async () => {
    const supabase = {
      from: vi.fn(() => ({ upsert: vi.fn() })),
    } as unknown as Parameters<typeof persistLighthouseScores>[0]
    const r = await persistLighthouseScores(supabase, [])
    expect(r).toEqual({ ok: true, upserted: 0 })
  })

  it('upserts with snapshot_date today + onConflict + snake_case mapping', async () => {
    const upsertSpy = vi.fn(async (_rows: unknown, _opts: unknown) => ({ error: null }))
    const supabase = {
      from: vi.fn(() => ({ upsert: upsertSpy })),
    } as unknown as Parameters<typeof persistLighthouseScores>[0]
    const r = await persistLighthouseScores(supabase, [
      {
        url: 'https://a.fr',
        strategy: 'mobile',
        performanceScore: 75,
        lcpMs: 2400,
        cls: 0.08,
        inpMs: 1500,
        fcpMs: 1000,
        tbtMs: 200,
        severity: 'ok',
        rawAudit: { _slim: true },
      },
    ])
    expect(r).toEqual({ ok: true, upserted: 1 })
    const rows = upsertSpy.mock.calls[0][0] as Array<Record<string, unknown>>
    expect(rows[0]).toMatchObject({
      url: 'https://a.fr',
      strategy: 'mobile',
      performance_score: 75,
      lcp_ms: 2400,
      cls: 0.08,
      inp_ms: 1500,
      fcp_ms: 1000,
      tbt_ms: 200,
      severity: 'ok',
      raw_audit: { _slim: true },
    })
    expect(rows[0]).not.toHaveProperty('performanceScore')
    expect(rows[0]).not.toHaveProperty('rawAudit')
    expect(rows[0].snapshot_date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    const opts = upsertSpy.mock.calls[0][1] as { onConflict: string }
    expect(opts.onConflict).toBe('snapshot_date,url,strategy')
  })

  it('clamps cls > 99.999 to fit NUMERIC(5,3) DB constraint', async () => {
    const upsertSpy = vi.fn(async (_rows: unknown) => ({ error: null }))
    const supabase = {
      from: vi.fn(() => ({ upsert: upsertSpy })),
    } as unknown as Parameters<typeof persistLighthouseScores>[0]
    await persistLighthouseScores(supabase, [
      {
        url: 'https://a.fr',
        strategy: 'mobile',
        performanceScore: 10,
        lcpMs: 6000,
        cls: 250.5,
        inpMs: 5000,
        fcpMs: 2000,
        tbtMs: 1500,
        severity: 'critical',
        rawAudit: {},
      },
    ])
    const rows = upsertSpy.mock.calls[0][0] as Array<{ cls: number }>
    expect(rows[0].cls).toBe(99.999)
  })

  it('preserves negative cls clamped to 0 (defensive)', async () => {
    const upsertSpy = vi.fn(async (_rows: unknown) => ({ error: null }))
    const supabase = {
      from: vi.fn(() => ({ upsert: upsertSpy })),
    } as unknown as Parameters<typeof persistLighthouseScores>[0]
    await persistLighthouseScores(supabase, [
      {
        url: 'https://a.fr',
        strategy: 'mobile',
        performanceScore: 50,
        lcpMs: 2000,
        cls: -1,
        inpMs: 1000,
        fcpMs: 800,
        tbtMs: 100,
        severity: 'warn',
        rawAudit: {},
      },
    ])
    const rows = upsertSpy.mock.calls[0][0] as Array<{ cls: number }>
    expect(rows[0].cls).toBe(0)
  })

  it('returns ok=false on DB error', async () => {
    const supabase = {
      from: vi.fn(() => ({
        upsert: vi.fn(async () => ({ error: { message: 'fail' } })),
      })),
    } as unknown as Parameters<typeof persistLighthouseScores>[0]
    const r = await persistLighthouseScores(supabase, [
      {
        url: 'https://a.fr',
        strategy: 'mobile',
        performanceScore: 80,
        lcpMs: 2000,
        cls: 0.05,
        inpMs: 1000,
        fcpMs: 800,
        tbtMs: 100,
        severity: 'ok',
        rawAudit: {},
      },
    ])
    expect(r).toEqual({ ok: false, upserted: 0 })
  })
})

describe('makePsiFetcher — real fetch via stub', () => {
  function makeResponse(opts: { ok: boolean; status?: number; body?: ArrayBuffer | string }) {
    const body =
      typeof opts.body === 'string'
        ? new TextEncoder().encode(opts.body).buffer
        : (opts.body ?? new ArrayBuffer(0))
    return {
      ok: opts.ok,
      status: opts.status ?? (opts.ok ? 200 : 503),
      arrayBuffer: async () => body,
    }
  }

  it('returns null on HTTP error (non-200)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeResponse({ ok: false, status: 429 })))
    const result = await makePsiFetcher().call(undefined, 'https://a.fr', 'mobile')
    expect(result).toBeNull()
  })

  it('returns null when body exceeds 4MB cap', async () => {
    const big = new ArrayBuffer(5 * 1024 * 1024)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeResponse({ ok: true, body: big })))
    const result = await makePsiFetcher().call(undefined, 'https://a.fr', 'mobile')
    expect(result).toBeNull()
  })

  it('returns null on JSON parse failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(makeResponse({ ok: true, body: '<html>not json</html>' }))
    )
    const result = await makePsiFetcher().call(undefined, 'https://a.fr', 'mobile')
    expect(result).toBeNull()
  })

  it('returns parsed JSON on happy path', async () => {
    const psi = { lighthouseResult: { categories: { performance: { score: 0.9 } } } }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(makeResponse({ ok: true, body: JSON.stringify(psi) }))
    )
    const result = await makePsiFetcher().call(undefined, 'https://a.fr', 'mobile')
    expect(result).toEqual(psi)
  })

  it('passes redirect:error + Accept header (anti-SSRF)', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(makeResponse({ ok: false, status: 503 }))
    vi.stubGlobal('fetch', fetchSpy)
    await makePsiFetcher().call(undefined, 'https://a.fr', 'mobile')
    const init = fetchSpy.mock.calls[0][1] as RequestInit
    expect(init.redirect).toBe('error')
    expect((init.headers as Record<string, string>)['Accept']).toBe('application/json')
  })

  it('omits API key from URL query when undefined', async () => {
    let capturedUrl = ''
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (url: string) => {
        capturedUrl = url
        return makeResponse({ ok: false })
      })
    )
    await makePsiFetcher().call(undefined, 'https://a.fr', 'mobile')
    expect(capturedUrl).not.toContain('key=')
  })

  it('passes API key via X-Goog-Api-Key header (NOT URL query)', async () => {
    let capturedUrl = ''
    let capturedHeaders: Record<string, string> = {}
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (url: string, init: RequestInit) => {
        capturedUrl = url
        capturedHeaders = init.headers as Record<string, string>
        return makeResponse({ ok: false })
      })
    )
    await makePsiFetcher('secret-key').call(undefined, 'https://a.fr', 'mobile')
    expect(capturedUrl).not.toContain('key=secret-key')
    expect(capturedHeaders['X-Goog-Api-Key']).toBe('secret-key')
  })
})

describe('auditUrls — deadline guard', () => {
  it('stops audit early when deadline passed', async () => {
    const fetcher: PsiFetcher = vi.fn(async () => ({
      lighthouseResult: { categories: { performance: { score: 0.5 } } },
    }))
    const pastDeadline = Date.now() - 1
    const result = await auditUrls(
      ['https://a.fr', 'https://b.fr'],
      fetcher,
      ['mobile'],
      pastDeadline
    )
    expect(result).toEqual([])
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('runs all audits when deadline far in future', async () => {
    const fetcher: PsiFetcher = vi.fn(async () => ({
      lighthouseResult: {
        categories: { performance: { score: 0.9 } },
        audits: { 'largest-contentful-paint': { numericValue: 2000 } },
      },
    }))
    const futureDeadline = Date.now() + 10_000
    const result = await auditUrls(['https://a.fr'], fetcher, ['mobile'], futureDeadline)
    expect(result).toHaveLength(1)
  })
})
