/**
 * Tests `canonical-fingerprint` — Bouclier 2 du plan ULTRA DOMINATION SEO v2.
 * Pure logic + DI fetcher + mocked Supabase.
 */
import { describe, expect, it, vi } from 'vitest'
import {
  captureFingerprints,
  classifyDrift,
  computeChanges,
  computeFingerprint,
  loadPreviousFingerprints,
  parseHtmlForFingerprint,
  persistFingerprints,
  type FingerprintFetcher,
  type SeoFingerprintComponents,
} from '@/lib/seo/canonical-fingerprint'

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

const sample = (overrides: Partial<SeoFingerprintComponents> = {}): SeoFingerprintComponents => ({
  canonical: 'https://servicesartisans.fr/services/plombier/paris',
  title: 'Plombier à Paris — ServicesArtisans',
  metaDescription: 'Trouvez un plombier qualifié à Paris.',
  h1: 'Plombiers à Paris (24)',
  noindex: false,
  ...overrides,
})

describe('parseHtmlForFingerprint — extraction HTML', () => {
  it('extracts canonical (href before rel)', () => {
    const html = `<link href="https://example.fr/foo" rel="canonical">`
    expect(parseHtmlForFingerprint(html).canonical).toBe('https://example.fr/foo')
  })

  it('extracts canonical (rel before href)', () => {
    const html = `<link rel="canonical" href="https://example.fr/bar">`
    expect(parseHtmlForFingerprint(html).canonical).toBe('https://example.fr/bar')
  })

  it('returns null canonical when missing', () => {
    expect(parseHtmlForFingerprint('<html></html>').canonical).toBeNull()
  })

  it('extracts title', () => {
    const html = `<title>  Plombier Paris  </title>`
    expect(parseHtmlForFingerprint(html).title).toBe('Plombier Paris')
  })

  it('handles missing/empty title', () => {
    expect(parseHtmlForFingerprint('<html></html>').title).toBeNull()
    expect(parseHtmlForFingerprint('<title></title>').title).toBeNull()
  })

  it('extracts meta description (both attribute orders)', () => {
    const a = `<meta name="description" content="Foo bar">`
    const b = `<meta content="Foo bar" name="description">`
    expect(parseHtmlForFingerprint(a).metaDescription).toBe('Foo bar')
    expect(parseHtmlForFingerprint(b).metaDescription).toBe('Foo bar')
  })

  it('extracts h1 stripping nested tags', () => {
    const html = `<h1 class="x"><span>Hello</span> <em>World</em></h1>`
    expect(parseHtmlForFingerprint(html).h1).toBe('Hello World')
  })

  it('takes first h1 when multiple are present', () => {
    const html = '<h1>First H1</h1><p>text</p><h1>Second H1</h1>'
    expect(parseHtmlForFingerprint(html).h1).toBe('First H1')
  })

  it('trims canonical whitespace (defensive vs CDN normalization)', () => {
    const html = `<link rel="canonical" href="  https://a.fr/  ">`
    expect(parseHtmlForFingerprint(html).canonical).toBe('https://a.fr/')
  })

  it('preserves internal whitespace in title (no double-trim)', () => {
    const html = '<title>  Foo  Bar  </title>'
    expect(parseHtmlForFingerprint(html).title).toBe('Foo  Bar')
  })

  it('detects noindex in robots meta', () => {
    expect(
      parseHtmlForFingerprint(`<meta name="robots" content="noindex, nofollow">`).noindex
    ).toBe(true)
    expect(parseHtmlForFingerprint(`<meta name="robots" content="index, follow">`).noindex).toBe(
      false
    )
    expect(parseHtmlForFingerprint(`<html></html>`).noindex).toBe(false)
  })

  it('full page extraction', () => {
    const html = `
      <html><head>
        <title>Plombier Paris</title>
        <meta name="description" content="Trouvez un plombier">
        <meta name="robots" content="index, follow">
        <link rel="canonical" href="https://servicesartisans.fr/services/plombier/paris">
      </head><body><h1>Plombiers à Paris</h1></body></html>`
    expect(parseHtmlForFingerprint(html)).toEqual({
      canonical: 'https://servicesartisans.fr/services/plombier/paris',
      title: 'Plombier Paris',
      metaDescription: 'Trouvez un plombier',
      h1: 'Plombiers à Paris',
      noindex: false,
    })
  })
})

describe('computeFingerprint — deterministic SHA-256', () => {
  it('returns hex 64 chars', () => {
    const fp = computeFingerprint(sample())
    expect(fp).toMatch(/^[a-f0-9]{64}$/)
  })

  it('is deterministic on identical input', () => {
    expect(computeFingerprint(sample())).toBe(computeFingerprint(sample()))
  })

  it('differs when canonical changes', () => {
    expect(computeFingerprint(sample())).not.toBe(
      computeFingerprint(sample({ canonical: 'https://other.fr' }))
    )
  })

  it('differs when noindex changes', () => {
    expect(computeFingerprint(sample())).not.toBe(computeFingerprint(sample({ noindex: true })))
  })

  it('order-independent (sorted keys internally)', () => {
    const fp1 = computeFingerprint({
      canonical: 'a',
      title: 'b',
      metaDescription: 'c',
      h1: 'd',
      noindex: false,
    })
    const fp2 = computeFingerprint({
      noindex: false,
      h1: 'd',
      metaDescription: 'c',
      title: 'b',
      canonical: 'a',
    })
    expect(fp1).toBe(fp2)
  })
})

describe('classifyDrift — sévérité', () => {
  it('returns new when no previous fingerprint', () => {
    expect(classifyDrift(null, sample())).toBe('new')
  })

  it('returns ok when identical', () => {
    expect(classifyDrift(sample(), sample())).toBe('ok')
  })

  it('returns critical when canonical changes', () => {
    expect(classifyDrift(sample(), sample({ canonical: 'https://other.fr' }))).toBe('critical')
  })

  it('returns critical when noindex flips', () => {
    expect(classifyDrift(sample({ noindex: false }), sample({ noindex: true }))).toBe('critical')
  })

  it('returns warn when title changes only', () => {
    expect(classifyDrift(sample(), sample({ title: 'New title' }))).toBe('warn')
  })

  it('returns warn when meta description changes only', () => {
    expect(classifyDrift(sample(), sample({ metaDescription: 'New' }))).toBe('warn')
  })

  it('returns warn when h1 changes only', () => {
    expect(classifyDrift(sample(), sample({ h1: 'New H1' }))).toBe('warn')
  })

  it('canonical change wins over h1 change (priority)', () => {
    expect(classifyDrift(sample(), sample({ canonical: 'https://other.fr', h1: 'New H1' }))).toBe(
      'critical'
    )
  })

  it('null-to-null canonical is ok (not critical)', () => {
    const before: SeoFingerprintComponents = {
      canonical: null,
      title: 'T',
      metaDescription: 'M',
      h1: 'H',
      noindex: false,
    }
    expect(classifyDrift(before, { ...before })).toBe('ok')
  })

  it('null-to-value canonical is critical drift', () => {
    const before: SeoFingerprintComponents = {
      canonical: null,
      title: 'T',
      metaDescription: 'M',
      h1: 'H',
      noindex: false,
    }
    const after = { ...before, canonical: 'https://a.fr/' }
    expect(classifyDrift(before, after)).toBe('critical')
  })
})

describe('computeChanges — diff détaillé', () => {
  it('returns empty when no previous', () => {
    expect(computeChanges(null, sample())).toEqual({})
  })

  it('returns empty when identical', () => {
    expect(computeChanges(sample(), sample())).toEqual({})
  })

  it('captures canonical before/after', () => {
    const c = computeChanges(sample(), sample({ canonical: 'https://x.fr' }))
    expect(c.canonical).toEqual({
      before: 'https://servicesartisans.fr/services/plombier/paris',
      after: 'https://x.fr',
    })
  })

  it('captures noindex flip', () => {
    const c = computeChanges(sample({ noindex: false }), sample({ noindex: true }))
    expect(c.noindex).toEqual({ before: false, after: true })
  })

  it('captures multiple changes simultaneously', () => {
    const c = computeChanges(
      sample(),
      sample({ canonical: 'https://x.fr', title: 'New', noindex: true })
    )
    expect(c.canonical).toBeDefined()
    expect(c.title).toBeDefined()
    expect(c.noindex).toBeDefined()
    expect(c.h1).toBeUndefined()
  })
})

describe('captureFingerprints — DI fetcher', () => {
  it('returns empty for empty url list', async () => {
    const fetcher: FingerprintFetcher = vi.fn()
    const result = await captureFingerprints([], fetcher)
    expect(result).toEqual([])
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('parses HTML and computes fingerprint per URL', async () => {
    const fetcher: FingerprintFetcher = vi.fn(async (url) => ({
      html: `<title>${url}</title><link rel="canonical" href="${url}">`,
      statusCode: 200,
    }))
    const result = await captureFingerprints(['https://a.fr', 'https://b.fr'], fetcher)
    expect(result).toHaveLength(2)
    expect(result[0].canonical).toBe('https://a.fr')
    expect(result[0].title).toBe('https://a.fr')
    expect(result[0].statusCode).toBe(200)
    expect(result[0].fingerprint).toMatch(/^[a-f0-9]{64}$/)
  })

  it('SKIPS URL when fetcher returns null (no empty fingerprint persisted)', async () => {
    const fetcher: FingerprintFetcher = vi.fn(async () => null)
    const result = await captureFingerprints(['https://broken.fr'], fetcher)
    expect(result).toEqual([])
  })

  it('mixes fetched + skipped URLs correctly (only fetched returned)', async () => {
    const fetcher: FingerprintFetcher = vi.fn(async (url) =>
      url === 'https://broken.fr' ? null : { html: `<title>${url}</title>`, statusCode: 200 }
    )
    const result = await captureFingerprints(
      ['https://a.fr', 'https://broken.fr', 'https://b.fr'],
      fetcher
    )
    expect(result).toHaveLength(2)
    expect(result.map((r) => r.url)).toEqual(['https://a.fr', 'https://b.fr'])
  })

  it('preserves input order across batch boundaries', async () => {
    const urls = ['https://a.fr', 'https://b.fr', 'https://c.fr', 'https://d.fr', 'https://e.fr']
    const fetcher: FingerprintFetcher = vi.fn(async (url) => ({
      html: `<title>${url}</title>`,
      statusCode: 200,
    }))
    const result = await captureFingerprints(urls, fetcher, 2)
    expect(result.map((r) => r.url)).toEqual(urls)
  })

  it('respects concurrency batch size', async () => {
    let inflight = 0
    let maxInflight = 0
    const fetcher: FingerprintFetcher = vi.fn(async () => {
      inflight += 1
      maxInflight = Math.max(maxInflight, inflight)
      await new Promise((r) => setTimeout(r, 5))
      inflight -= 1
      return { html: '<title>x</title>', statusCode: 200 }
    })
    await captureFingerprints(['1', '2', '3', '4', '5', '6'], fetcher, 2)
    expect(maxInflight).toBeLessThanOrEqual(2)
  })
})

describe('loadPreviousFingerprints — DB integration', () => {
  function buildSupabaseMock(byUrl: Record<string, Record<string, unknown> | null>) {
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
          gt: vi.fn(() => builder),
          order: vi.fn(() => builder),
          limit: vi.fn(() => builder),
          maybeSingle: vi.fn(async () => ({ data: byUrl[currentUrl] ?? null, error: null })),
        })
        return builder
      }),
    } as unknown as Parameters<typeof loadPreviousFingerprints>[0]
  }

  it('returns empty map when no urls', async () => {
    const sb = buildSupabaseMock({})
    const m = await loadPreviousFingerprints(sb, [])
    expect(m.size).toBe(0)
  })

  it('maps DB rows to component shape', async () => {
    const sb = buildSupabaseMock({
      'https://a.fr': {
        canonical: 'https://a.fr',
        title: 'A',
        meta_description: 'desc',
        h1: 'H1',
        noindex: false,
      },
    })
    const m = await loadPreviousFingerprints(sb, ['https://a.fr', 'https://b.fr'])
    expect(m.size).toBe(1)
    expect(m.get('https://a.fr')).toEqual({
      canonical: 'https://a.fr',
      title: 'A',
      metaDescription: 'desc',
      h1: 'H1',
      noindex: false,
    })
  })

  it('skips URL silently when Supabase returns error', async () => {
    const sb = {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gt: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn(async () => ({
          data: null,
          error: { message: 'permission denied' },
        })),
      })),
    } as unknown as Parameters<typeof loadPreviousFingerprints>[0]
    const m = await loadPreviousFingerprints(sb, ['https://a.fr'])
    expect(m.size).toBe(0)
  })

  it('skips URL when Supabase throws (catch block)', async () => {
    const sb = {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gt: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn(async () => {
          throw new Error('network error')
        }),
      })),
    } as unknown as Parameters<typeof loadPreviousFingerprints>[0]
    const m = await loadPreviousFingerprints(sb, ['https://a.fr'])
    expect(m.size).toBe(0)
  })

  it('applies status_code > 0 filter (ignores error snapshots)', async () => {
    const gtSpy = vi.fn().mockReturnThis()
    const sb = {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gt: gtSpy,
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn(async () => ({ data: null, error: null })),
      })),
    } as unknown as Parameters<typeof loadPreviousFingerprints>[0]
    await loadPreviousFingerprints(sb, ['https://a.fr'])
    expect(gtSpy).toHaveBeenCalledWith('status_code', 0)
  })
})

describe('persistFingerprints — DB integration', () => {
  it('returns ok=true / upserted=0 when empty', async () => {
    const supabase = {
      from: vi.fn(() => ({ upsert: vi.fn() })),
    } as unknown as Parameters<typeof persistFingerprints>[0]
    const r = await persistFingerprints(supabase, [])
    expect(r).toEqual({ ok: true, upserted: 0 })
  })

  it('upserts with snake_case mapping + onConflict key', async () => {
    const upsertSpy = vi.fn(async (_rows: unknown, _opts: unknown) => ({ error: null }))
    const supabase = {
      from: vi.fn(() => ({ upsert: upsertSpy })),
    } as unknown as Parameters<typeof persistFingerprints>[0]
    const r = await persistFingerprints(supabase, [
      {
        url: 'https://a.fr',
        canonical: 'https://a.fr',
        title: 'A',
        metaDescription: 'desc',
        h1: 'H1',
        noindex: false,
        fingerprint: 'a'.repeat(64),
        statusCode: 200,
        driftSeverity: 'ok',
      },
    ])
    expect(r).toEqual({ ok: true, upserted: 1 })
    const rows = upsertSpy.mock.calls[0][0] as Array<Record<string, unknown>>
    expect(rows[0]).toMatchObject({
      url: 'https://a.fr',
      canonical: 'https://a.fr',
      title: 'A',
      meta_description: 'desc',
      h1: 'H1',
      noindex: false,
      fingerprint: 'a'.repeat(64),
      status_code: 200,
      drift_severity: 'ok',
    })
    expect(rows[0]).not.toHaveProperty('metaDescription')
    expect(rows[0]).not.toHaveProperty('statusCode')
    expect(rows[0]).not.toHaveProperty('driftSeverity')
    const opts = upsertSpy.mock.calls[0][1] as { onConflict: string }
    expect(opts.onConflict).toBe('snapshot_date,url')
  })

  it('returns ok=false on DB error', async () => {
    const supabase = {
      from: vi.fn(() => ({
        upsert: vi.fn(async () => ({ error: { message: 'fail' } })),
      })),
    } as unknown as Parameters<typeof persistFingerprints>[0]
    const r = await persistFingerprints(supabase, [
      {
        url: 'https://a.fr',
        canonical: null,
        title: null,
        metaDescription: null,
        h1: null,
        noindex: false,
        fingerprint: 'b'.repeat(64),
        statusCode: 0,
        driftSeverity: 'ok',
      },
    ])
    expect(r).toEqual({ ok: false, upserted: 0 })
  })
})
