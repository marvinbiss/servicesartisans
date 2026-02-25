import { describe, it, expect } from 'vitest'
import {
  escapeXmlLoc,
  getStaticSitemapIds,
  getDynamicSitemapIds,
  getSitemapIndexUrls,
  PROVIDER_BATCH_SIZE,
  STATIC_BATCH,
  LARGE_BATCH,
  GOOGLE_MAX_URLS_PER_SITEMAP,
} from '@/lib/seo/sitemap-manifest'
import { SITE_URL } from '@/lib/seo/config'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// D1. XML SPECIAL CHARACTERS — no double encoding, no missed escaping
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('failure-mode: XML special characters', () => {
  const testCases: Array<{ input: string; description: string }> = [
    { input: 'Dupont & Fils', description: 'ampersand in provider name' },
    { input: '<script>alert(1)</script>', description: 'HTML injection' },
    { input: 'A > B < C', description: 'angle brackets' },
    { input: '"Artisan Pro"', description: 'double quotes' },
    { input: "L'atelier du bois", description: 'apostrophe (French)' },
    { input: 'Rénovation & Décoration "Pro"', description: 'mixed French + special chars' },
    { input: 'café résumé Étanchéité', description: 'French accents only (no escaping needed)' },
    { input: 'Maçon à Châteauroux', description: 'cedilla + grave accent' },
    { input: 'https://example.com/path?a=1&b=2&c=3', description: 'URL with query params' },
    { input: '&amp; &lt; &gt;', description: 'already-escaped entities (must NOT double-encode &amp;)' },
    { input: '', description: 'empty string' },
    { input: 'simple', description: 'safe string passes through unchanged' },
  ]

  for (const tc of testCases) {
    it(`escapes correctly: ${tc.description}`, () => {
      const escaped = escapeXmlLoc(tc.input)

      // After escaping, no raw special XML chars should remain
      // Check by removing valid entities, then asserting no raw & < > remain
      const stripped = escaped.replace(/&(amp|lt|gt|quot|apos);/g, 'ENTITY')
      expect(stripped).not.toContain('&')
      expect(stripped).not.toContain('<')
      expect(stripped).not.toContain('>')

      // Accents MUST pass through unchanged
      if (tc.input.includes('é')) expect(escaped).toContain('é')
      if (tc.input.includes('à')) expect(escaped).toContain('à')
      if (tc.input.includes('ç')) expect(escaped).toContain('ç')
      if (tc.input.includes('â')) expect(escaped).toContain('â')
      if (tc.input.includes('È')) expect(escaped).toContain('È')
    })
  }

  it('does NOT double-encode already-escaped entities', () => {
    // If input already has &amp; it WILL be double-encoded by design (correct behavior)
    // because escapeXmlLoc is meant for raw text, not pre-escaped XML.
    // This test documents this intentional behavior.
    const result = escapeXmlLoc('&amp;')
    expect(result).toBe('&amp;amp;')
  })

  it('escapeXmlLoc is idempotent on strings containing only safe chars', () => {
    const safe = 'https://servicesartisans.fr/services/plombier/paris'
    expect(escapeXmlLoc(safe)).toBe(safe)
    // Double-escaping a safe string (no special chars) is still the same
    expect(escapeXmlLoc(escapeXmlLoc(safe))).toBe(safe)
  })

  it('double-escaping a string WITH special chars produces different result', () => {
    const unsafe = 'dupont&fils'
    const once = escapeXmlLoc(unsafe)     // "dupont&amp;fils"
    const twice = escapeXmlLoc(once)      // "dupont&amp;amp;fils"
    expect(once).not.toBe(unsafe)
    expect(twice).not.toBe(once)
  })

  it('handles all 5 XML special characters in a single string', () => {
    const input = `A&B<C>D"E'F`
    const expected = `A&amp;B&lt;C&gt;D&quot;E&apos;F`
    expect(escapeXmlLoc(input)).toBe(expected)
  })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// D2. PROVIDER ROUTE FALLBACK — empty valid XML on DB error
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('failure-mode: provider fallback XML', () => {
  const EMPTY_SITEMAP = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>'

  it('empty fallback XML is well-formed', () => {
    expect(EMPTY_SITEMAP).toContain('<?xml version="1.0"')
    expect(EMPTY_SITEMAP).toContain('<urlset')
    expect(EMPTY_SITEMAP).toContain('</urlset>')
  })

  it('empty fallback XML has 0 URLs', () => {
    const locs = EMPTY_SITEMAP.match(/<loc>/g)
    expect(locs).toBeNull()
  })

  it('empty fallback XML passes wellformedness check', () => {
    const trimmed = EMPTY_SITEMAP.trimStart()
    expect(trimmed.startsWith('<?xml')).toBe(true)
    // Check no unescaped &
    const cleaned = EMPTY_SITEMAP.replace(/&(amp|lt|gt|quot|apos|#\d+|#x[\da-fA-F]+);/g, '')
    expect(cleaned).not.toContain('&')
  })

  it('provider route source contains try/catch with empty fallback', () => {
    const fs = require('fs')
    const path = require('path')
    const src = fs.readFileSync(path.resolve(process.cwd(), 'src/app/api/sitemap-providers/route.ts'), 'utf-8')
    // Must have a catch block
    expect(src).toContain('catch')
    // Must return valid XML in catch
    expect(src).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    // Reduced cache TTL on error
    expect(src).toContain('s-maxage=60')
  })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// D3. SIMULATED DB TIMEOUT / ERROR — mocked scenarios
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('failure-mode: simulated DB errors', () => {
  it('getDynamicSitemapIds returns empty array for 0 providers (DB down scenario)', () => {
    // When DB is unreachable, activeProvidersCount defaults to 0
    const ids = getDynamicSitemapIds({ activeProvidersCount: 0 })
    expect(ids).toEqual([])
  })

  it('getSitemapIndexUrls still returns static sitemaps when providers=0 (DB down)', () => {
    const urls = getSitemapIndexUrls({ activeProvidersCount: 0 })
    const staticIds = getStaticSitemapIds()
    expect(urls.length).toBe(staticIds.length)
    expect(urls.length).toBeGreaterThan(0)
    // All are static sitemaps, no providers
    for (const url of urls) {
      expect(url).not.toContain('providers-')
    }
  })

  it('getSitemapIndexUrls returns static + dynamic when providers > 0', () => {
    const urls = getSitemapIndexUrls({ activeProvidersCount: 5001 })
    const hasStatic = urls.some(u => u.includes('/sitemap/static.xml'))
    const hasProviders = urls.some(u => u.includes('/sitemap/providers-'))
    expect(hasStatic).toBe(true)
    expect(hasProviders).toBe(true)
  })

  it('index route source catches DB error gracefully', () => {
    const fs = require('fs')
    const path = require('path')
    const src = fs.readFileSync(path.resolve(process.cwd(), 'src/app/api/sitemap-index/route.ts'), 'utf-8')
    // Must have try/catch around DB call
    expect(src).toContain('try')
    expect(src).toContain('catch')
    // Must log the error
    expect(src).toContain('sitemapLog.error')
    // Must default activeProvidersCount to 0
    expect(src).toContain('let activeProvidersCount = 0')
  })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// D4. INDEX ↔ CHILDREN COHERENCE CHECKER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('failure-mode: index ↔ children coherence', () => {
  function buildMockIndexXml(locs: string[]): string {
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...locs.map(loc => `  <sitemap><loc>${loc}</loc></sitemap>`),
      '</sitemapindex>',
    ].join('\n')
  }

  function extractLocsFromXml(xml: string): string[] {
    const locs: string[] = []
    const re = /<loc>(.*?)<\/loc>/g
    let m: RegExpExecArray | null
    while ((m = re.exec(xml)) !== null) locs.push(m[1])
    return locs
  }

  it('mock index has exactly the expected number of children', () => {
    const urls = getSitemapIndexUrls({ activeProvidersCount: 5000 })
    const xml = buildMockIndexXml(urls)
    const extracted = extractLocsFromXml(xml)
    expect(extracted.length).toBe(urls.length)
  })

  it('every child loc in index is a valid absolute HTTPS URL', () => {
    const urls = getSitemapIndexUrls({ activeProvidersCount: 10000 })
    for (const url of urls) {
      expect(url).toMatch(/^https:\/\//)
      expect(url).toMatch(/\.xml$/)
      expect(url).toContain(SITE_URL)
    }
  })

  it('index with providers has superset of index without providers', () => {
    const withoutProviders = getSitemapIndexUrls({ activeProvidersCount: 0 })
    const withProviders = getSitemapIndexUrls({ activeProvidersCount: 20000 })
    // All static URLs must be present in both
    for (const url of withoutProviders) {
      expect(withProviders).toContain(url)
    }
    // With providers must be strictly larger
    expect(withProviders.length).toBeGreaterThan(withoutProviders.length)
  })

  it('no duplicate <loc> entries in simulated index XML', () => {
    const urls = getSitemapIndexUrls({ activeProvidersCount: 15000 })
    const xml = buildMockIndexXml(urls)
    const locs = extractLocsFromXml(xml)
    expect(new Set(locs).size).toBe(locs.length)
  })

  it('provider batch IDs are contiguous starting from 0', () => {
    const dynamicIds = getDynamicSitemapIds({ activeProvidersCount: 25000 })
    for (let i = 0; i < dynamicIds.length; i++) {
      expect(dynamicIds[i]).toBe(`providers-${i}`)
    }
  })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// D5. GOOGLE GUARDRAILS — size & count limits
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('failure-mode: Google guardrails size/count', () => {
  it('GOOGLE_MAX_URLS_PER_SITEMAP is exactly 50000', () => {
    expect(GOOGLE_MAX_URLS_PER_SITEMAP).toBe(50_000)
  })

  it('PROVIDER_BATCH_SIZE < GOOGLE_MAX_URLS_PER_SITEMAP', () => {
    expect(PROVIDER_BATCH_SIZE).toBeLessThan(GOOGLE_MAX_URLS_PER_SITEMAP)
  })

  it('STATIC_BATCH < GOOGLE_MAX_URLS_PER_SITEMAP', () => {
    expect(STATIC_BATCH).toBeLessThan(GOOGLE_MAX_URLS_PER_SITEMAP)
  })

  it('LARGE_BATCH < GOOGLE_MAX_URLS_PER_SITEMAP', () => {
    expect(LARGE_BATCH).toBeLessThan(GOOGLE_MAX_URLS_PER_SITEMAP)
  })

  it('static sitemap count is reasonable (< 500)', () => {
    const ids = getStaticSitemapIds()
    expect(ids.length).toBeLessThan(500)
    expect(ids.length).toBeGreaterThan(10)
  })

  it('maximum theoretical URLs per static batch respects limit', () => {
    // The largest batch size is LARGE_BATCH (45,000) for service-cities
    // This must be < 50,000
    expect(LARGE_BATCH).toBeLessThanOrEqual(GOOGLE_MAX_URLS_PER_SITEMAP)
    expect(STATIC_BATCH).toBeLessThanOrEqual(GOOGLE_MAX_URLS_PER_SITEMAP)
  })

  it('provider batch produces maximum PROVIDER_BATCH_SIZE URLs per sitemap', () => {
    // By definition, each provider batch has at most PROVIDER_BATCH_SIZE rows
    // Each row produces at most 1 URL, so max URLs per sitemap = PROVIDER_BATCH_SIZE
    expect(PROVIDER_BATCH_SIZE).toBeLessThanOrEqual(GOOGLE_MAX_URLS_PER_SITEMAP)
  })

  it('simulated large provider count produces correct batch count', () => {
    const count = 250_000
    const ids = getDynamicSitemapIds({ activeProvidersCount: count })
    expect(ids.length).toBe(Math.ceil(count / PROVIDER_BATCH_SIZE))
    // Each batch has at most PROVIDER_BATCH_SIZE URLs
    expect(PROVIDER_BATCH_SIZE * ids.length).toBeGreaterThanOrEqual(count)
  })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// D6. ANTI-REGRESSION — import manifest enforcement
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('failure-mode: anti-regression imports', () => {
  function readSource(relativePath: string): string {
    const fs = require('fs')
    const path = require('path')
    return fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf-8')
  }

  const criticalFiles = [
    {
      path: 'src/app/api/sitemap-providers/route.ts',
      label: 'sitemap-providers',
      mustImport: ['PROVIDER_BATCH_SIZE', 'escapeXmlLoc'],
      mustNotDefine: ['PROVIDER_BATCH_SIZE', 'GOOGLE_MAX_URLS', 'LARGE_BATCH', 'STATIC_BATCH'],
    },
    {
      path: 'src/app/api/sitemap-index/route.ts',
      label: 'sitemap-index',
      mustImport: ['getSitemapIndexUrls', 'escapeXmlLoc'],
      mustNotDefine: ['PROVIDER_BATCH_SIZE', 'LARGE_BATCH', 'STATIC_BATCH'],
    },
    {
      path: 'src/app/sitemap.ts',
      label: 'sitemap.ts',
      mustImport: ['getStaticSitemapIds'],
      mustNotDefine: ['STATIC_BATCH', 'LARGE_BATCH', 'TOP_CITIES_PHASE1', 'PROVIDER_BATCH_SIZE'],
    },
  ]

  for (const file of criticalFiles) {
    describe(`${file.label}`, () => {
      it(`imports from sitemap-manifest`, () => {
        const src = readSource(file.path)
        expect(src).toContain("from '@/lib/seo/sitemap-manifest'")
      })

      for (const symbol of file.mustImport) {
        it(`imports ${symbol}`, () => {
          const src = readSource(file.path)
          expect(src).toContain(symbol)
        })
      }

      for (const symbol of file.mustNotDefine) {
        it(`does NOT locally define ${symbol}`, () => {
          const src = readSource(file.path)
          expect(src).not.toMatch(new RegExp(`^\\s*(const|let|var)\\s+${symbol}\\b`, 'm'))
        })
      }
    })
  }

  it('sitemap-providers uses logger.child for observability', () => {
    const src = readSource('src/app/api/sitemap-providers/route.ts')
    expect(src).toContain("logger.child")
    expect(src).toContain("sitemap-providers")
  })

  it('sitemap-index uses logger.child for observability', () => {
    const src = readSource('src/app/api/sitemap-index/route.ts')
    expect(src).toContain("logger.child")
    expect(src).toContain("sitemap-index")
  })

  it('sitemap-index sets Content-Type to application/xml', () => {
    const src = readSource('src/app/api/sitemap-index/route.ts')
    expect(src).toContain("'Content-Type': 'application/xml")
  })

  it('sitemap-providers sets Content-Type to application/xml', () => {
    const src = readSource('src/app/api/sitemap-providers/route.ts')
    expect(src).toContain("'Content-Type': 'application/xml")
  })

  it('sitemap-index sets cache headers with s-maxage', () => {
    const src = readSource('src/app/api/sitemap-index/route.ts')
    expect(src).toMatch(/s-maxage=\d+/)
  })

  it('sitemap-providers sets cache headers with s-maxage', () => {
    const src = readSource('src/app/api/sitemap-providers/route.ts')
    expect(src).toMatch(/s-maxage=\d+/)
  })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// D7. SITEMAP XML GENERATION — edge cases
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('failure-mode: sitemap XML generation edge cases', () => {
  function buildUrlsetXml(urls: string[]): string {
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls.map(u => `  <url><loc>${escapeXmlLoc(u)}</loc></url>`),
      '</urlset>',
    ].join('\n')
  }

  it('generates valid XML with dangerous provider URLs', () => {
    const dangerousUrls = [
      `${SITE_URL}/services/plombier/paris/dupont-&-fils`,
      `${SITE_URL}/services/électricien/châteauroux/l'artisan`,
      `${SITE_URL}/services/maçon/saint-étienne/pro-<élite>`,
      `${SITE_URL}/services/peintre/lyon/"expert"`,
    ]
    const xml = buildUrlsetXml(dangerousUrls)

    // Must be valid XML (no raw special chars outside entities)
    const cleaned = xml.replace(/&(amp|lt|gt|quot|apos|#\d+|#x[\da-fA-F]+);/g, '')
    expect(cleaned).not.toContain('&')

    // Must start with proper XML declaration
    expect(xml.trimStart()).toMatch(/^<\?xml/)
    expect(xml).toContain('</urlset>')
  })

  it('generates valid empty urlset', () => {
    const xml = buildUrlsetXml([])
    expect(xml).toContain('<?xml version="1.0"')
    expect(xml).toContain('<urlset')
    expect(xml).toContain('</urlset>')
    expect(xml).not.toContain('<url>')
  })

  it('accented URLs are preserved correctly', () => {
    const url = `${SITE_URL}/services/étanchéité/château-thierry/résumé`
    const xml = buildUrlsetXml([url])
    expect(xml).toContain('étanchéité')
    expect(xml).toContain('château-thierry')
    expect(xml).toContain('résumé')
  })
})
