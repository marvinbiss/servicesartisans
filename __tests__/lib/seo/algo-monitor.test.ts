/**
 * Tests `algo-monitor` — Bouclier 1 du plan ULTRA DOMINATION SEO v2.
 * Pure logic + DI fetchers + mocked Supabase + fetcher Semrush réel via fetch stub.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  classifyVolatility,
  collectVolatilitySnapshots,
  extractFirstNumericScore,
  makeSemrushFetcher,
  normalizeMozcastScore,
  normalizeSemrushScore,
  persistVolatilitySnapshots,
  VOLATILITY_CRITICAL,
  VOLATILITY_WARN,
  type VolatilityFetcher,
} from '@/lib/seo/algo-monitor'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('classifyVolatility — pure', () => {
  it('returns calm under warn threshold', () => {
    expect(classifyVolatility(0)).toBe('calm')
    expect(classifyVolatility(3.99)).toBe('calm')
  })

  it('returns warn between warn and critical', () => {
    expect(classifyVolatility(VOLATILITY_WARN)).toBe('warn')
    expect(classifyVolatility(5)).toBe('warn')
    expect(classifyVolatility(6.99)).toBe('warn')
  })

  it('returns critical at threshold and above', () => {
    expect(classifyVolatility(VOLATILITY_CRITICAL)).toBe('critical')
    expect(classifyVolatility(7.01)).toBe('critical')
    expect(classifyVolatility(8)).toBe('critical')
    expect(classifyVolatility(10)).toBe('critical')
  })

  it('clamps out-of-range scores defensively', () => {
    expect(classifyVolatility(999)).toBe('critical')
    expect(classifyVolatility(-5)).toBe('calm')
  })

  it('treats NaN/Infinity as calm (not critical)', () => {
    expect(classifyVolatility(NaN)).toBe('calm')
    expect(classifyVolatility(Infinity)).toBe('calm')
  })
})

describe('normalizeMozcastScore — 0-100 → 0-10', () => {
  it('divides by 10 within bounds', () => {
    expect(normalizeMozcastScore(50)).toBe(5)
    expect(normalizeMozcastScore(80)).toBe(8)
  })

  it('clamps to [0, 10]', () => {
    expect(normalizeMozcastScore(150)).toBe(10)
    expect(normalizeMozcastScore(-20)).toBe(0)
  })

  it('handles NaN', () => {
    expect(normalizeMozcastScore(NaN)).toBe(0)
  })
})

describe('normalizeSemrushScore — already 0-10', () => {
  it('passes through within bounds', () => {
    expect(normalizeSemrushScore(5.7)).toBe(5.7)
  })

  it('clamps to [0, 10]', () => {
    expect(normalizeSemrushScore(11)).toBe(10)
    expect(normalizeSemrushScore(-1)).toBe(0)
  })
})

describe('extractFirstNumericScore — pure recursion', () => {
  it('returns numeric value for exact key match at root', () => {
    expect(extractFirstNumericScore({ score: 7.2, other: 'x' })).toBe(7.2)
    expect(extractFirstNumericScore({ volatility: 5.5 })).toBe(5.5)
    expect(extractFirstNumericScore({ temp: 3 })).toBe(3)
    expect(extractFirstNumericScore({ temperature: 8.1 })).toBe(8.1)
  })

  it('returns null when no recognized key matches', () => {
    expect(extractFirstNumericScore({ value: 5, count: 3 })).toBeNull()
    expect(extractFirstNumericScore({})).toBeNull()
  })

  it('does not match near-keys like temp_redirect or temperature_id', () => {
    expect(extractFirstNumericScore({ temp_redirect: 0, temperature_id: 999 })).toBeNull()
    expect(extractFirstNumericScore({ scoreboard: 5 })).toBeNull()
  })

  it('descends into nested objects to find first match', () => {
    expect(extractFirstNumericScore({ data: { volatility: 6.1 } })).toBe(6.1)
    expect(extractFirstNumericScore({ a: { b: { c: { score: 9 } } } })).toBe(9)
  })

  it('iterates arrays at root and inside', () => {
    expect(extractFirstNumericScore([{ score: 8 }, { score: 3 }])).toBe(8)
    expect(extractFirstNumericScore({ readings: [{ temp: 4 }] })).toBe(4)
  })

  it('priority: first-pass key match wins over deeper match', () => {
    expect(extractFirstNumericScore({ score: 5, nested: { score: 9 } })).toBe(5)
  })

  it('returns null on null/primitives', () => {
    expect(extractFirstNumericScore(null)).toBeNull()
    expect(extractFirstNumericScore(42)).toBeNull()
    expect(extractFirstNumericScore('hello')).toBeNull()
    expect(extractFirstNumericScore(undefined)).toBeNull()
  })

  it('rejects NaN as a "found" value', () => {
    expect(extractFirstNumericScore({ score: NaN })).toBeNull()
  })

  it('does not blow the stack on deeply nested objects (depth guard)', () => {
    let obj: Record<string, unknown> = { score: 5 }
    for (let i = 0; i < 50; i++) obj = { nested: obj }
    expect(() => extractFirstNumericScore(obj)).not.toThrow()
    // Au-delà de SCORE_EXTRACT_MAX_DEPTH (20), retour null
    expect(extractFirstNumericScore(obj)).toBeNull()
  })

  it('finds value within depth budget', () => {
    let obj: Record<string, unknown> = { score: 5 }
    for (let i = 0; i < 5; i++) obj = { nested: obj }
    expect(extractFirstNumericScore(obj)).toBe(5)
  })
})

describe('collectVolatilitySnapshots — DI fetchers', () => {
  it('returns empty array when no fetchers', async () => {
    const result = await collectVolatilitySnapshots([])
    expect(result).toEqual([])
  })

  it('aggregates results from multiple fetchers', async () => {
    const fetchers: VolatilityFetcher[] = [
      {
        source: 'fake_a',
        country: 'fr',
        fetch: async () => ({ score: 5.5, rawPayload: { foo: 1 } }),
      },
      {
        source: 'fake_b',
        country: 'us',
        fetch: async () => ({ score: 8, rawPayload: { bar: 2 } }),
      },
    ]
    const result = await collectVolatilitySnapshots(fetchers)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      source: 'fake_a',
      country: 'fr',
      score: 5.5,
      severity: 'warn',
      rawPayload: { foo: 1 },
    })
    expect(result[1].severity).toBe('critical')
  })

  it('replaces failed fetcher with calm + error rawPayload', async () => {
    const fetchers: VolatilityFetcher[] = [
      {
        source: 'broken',
        country: 'fr',
        fetch: async () => {
          throw new Error('network fail')
        },
      },
    ]
    const result = await collectVolatilitySnapshots(fetchers)
    expect(result).toHaveLength(1)
    expect(result[0].severity).toBe('calm')
    expect(result[0].score).toBe(0)
    expect(result[0].rawPayload).toEqual({ error: 'network fail' })
  })

  it('treats null fetcher result as calm with marker payload', async () => {
    const fetchers: VolatilityFetcher[] = [
      {
        source: 'noresult',
        country: 'fr',
        fetch: async () => null,
      },
    ]
    const result = await collectVolatilitySnapshots(fetchers)
    expect(result[0].severity).toBe('calm')
    expect(result[0].rawPayload).toEqual({ error: 'fetcher returned null' })
  })

  it('honours AbortSignal timeout inside fetcher (no outer race)', async () => {
    const fetchers: VolatilityFetcher[] = [
      {
        source: 'slow',
        country: 'fr',
        fetch: async () => {
          // Le fetcher gère son propre timeout — ici on simule un AbortError
          throw new DOMException('signal timed out', 'TimeoutError')
        },
      },
    ]
    const result = await collectVolatilitySnapshots(fetchers)
    expect(result[0].severity).toBe('calm')
    expect(result[0].rawPayload).toMatchObject({ error: expect.stringContaining('timed out') })
  })

  it('truncates oversized rawPayload before returning', async () => {
    const big = 'x'.repeat(40_000)
    const fetchers: VolatilityFetcher[] = [
      {
        source: 'huge',
        country: 'fr',
        fetch: async () => ({ score: 3, rawPayload: { big } }),
      },
    ]
    const result = await collectVolatilitySnapshots(fetchers)
    expect(result[0].rawPayload).toMatchObject({ _truncated: true })
  })
})

describe('makeSemrushFetcher — real fetch via stub', () => {
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

  it('returns null on HTTP error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeResponse({ ok: false, status: 503 })))
    const result = await makeSemrushFetcher('fr').fetch()
    expect(result).toBeNull()
  })

  it('returns null when JSON has no recognized score key', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          makeResponse({ ok: true, body: JSON.stringify({ data: { irrelevant: 5.5 } }) })
        )
    )
    const result = await makeSemrushFetcher('fr').fetch()
    expect(result).toBeNull()
  })

  it('returns null on JSON parse failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(makeResponse({ ok: true, body: '<html>not json</html>' }))
    )
    const result = await makeSemrushFetcher('fr').fetch()
    expect(result).toBeNull()
  })

  it('returns null when body exceeds 512KB cap', async () => {
    const huge = new ArrayBuffer(600 * 1024)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeResponse({ ok: true, body: huge })))
    const result = await makeSemrushFetcher('fr').fetch()
    expect(result).toBeNull()
  })

  it('extracts and normalizes score from valid Semrush JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          makeResponse({ ok: true, body: JSON.stringify({ score: 6.5, country: 'fr' }) })
        )
    )
    const result = await makeSemrushFetcher('fr').fetch()
    expect(result).not.toBeNull()
    expect(result!.score).toBe(6.5)
    expect(result!.rawPayload).toMatchObject({ score: 6.5 })
  })

  it('clamps out-of-range Semrush score (defensive)', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(makeResponse({ ok: true, body: JSON.stringify({ volatility: 12 }) }))
    )
    const result = await makeSemrushFetcher('fr').fetch()
    expect(result!.score).toBe(10)
  })

  it('passes redirect: error to fetch (anti-SSRF)', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(makeResponse({ ok: true, body: JSON.stringify({ score: 4 }) }))
    vi.stubGlobal('fetch', fetchSpy)
    await makeSemrushFetcher('fr').fetch()
    const init = fetchSpy.mock.calls[0][1] as RequestInit
    expect(init.redirect).toBe('error')
  })
})

describe('persistVolatilitySnapshots — DB integration', () => {
  it('returns ok=true / upserted=0 when empty', async () => {
    const supabase = {
      from: vi.fn(() => ({ upsert: vi.fn() })),
    } as unknown as Parameters<typeof persistVolatilitySnapshots>[0]
    const r = await persistVolatilitySnapshots(supabase, [])
    expect(r).toEqual({ ok: true, upserted: 0 })
  })

  it('upserts with snapshot_date today + onConflict key + raw_payload mapping', async () => {
    const upsertSpy = vi.fn(async (_rows: unknown, _opts: unknown) => ({ error: null }))
    const supabase = {
      from: vi.fn(() => ({ upsert: upsertSpy })),
    } as unknown as Parameters<typeof persistVolatilitySnapshots>[0]
    const r = await persistVolatilitySnapshots(supabase, [
      {
        source: 'fake',
        country: 'fr',
        score: 5,
        severity: 'warn',
        rawPayload: { x: 1 },
      },
    ])
    expect(r).toEqual({ ok: true, upserted: 1 })
    expect(upsertSpy).toHaveBeenCalledTimes(1)
    const rows = upsertSpy.mock.calls[0][0] as Array<Record<string, unknown>>
    expect(rows[0].snapshot_date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(rows[0]).toHaveProperty('raw_payload', { x: 1 })
    expect(rows[0]).not.toHaveProperty('rawPayload')
    const opts = upsertSpy.mock.calls[0][1] as { onConflict: string }
    expect(opts.onConflict).toBe('snapshot_date,source,country')
  })

  it('returns ok=false when DB errors', async () => {
    const supabase = {
      from: vi.fn(() => ({
        upsert: vi.fn(async () => ({ error: { message: 'fail' } })),
      })),
    } as unknown as Parameters<typeof persistVolatilitySnapshots>[0]
    const r = await persistVolatilitySnapshots(supabase, [
      { source: 'a', country: 'fr', score: 1, severity: 'calm', rawPayload: {} },
    ])
    expect(r).toEqual({ ok: false, upserted: 0 })
  })
})
