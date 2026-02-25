import { describe, it, expect } from 'vitest'
import {
  getStaticSitemapIds,
  getDynamicSitemapIds,
  getSitemapIndexUrls,
  getTotalServiceQuartierUrls,
  escapeXmlLoc,
  getEmergencySlugs,
  getAvisServiceSlugs,
  STATIC_BATCH,
  LARGE_BATCH,
  PROVIDER_BATCH_SIZE,
  TOP_CITIES_PHASE1,
  GOOGLE_MAX_URLS_PER_SITEMAP,
} from '@/lib/seo/sitemap-manifest'
import { services, villes, departements, regions, getQuartiersByVille } from '@/lib/data/france'
import { getTradesSlugs } from '@/lib/data/trade-content'
import { getProblemSlugs } from '@/lib/data/problems'
import { SITE_URL } from '@/lib/seo/config'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. INDEX IDS ⊆ STATIC + DYNAMIC (no orphans, no missing)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('index ids ⊆ static ids + dynamic ids', () => {
  it('getSitemapIndexUrls with 0 providers produces exactly the static ids', () => {
    const indexUrls = getSitemapIndexUrls({ activeProvidersCount: 0 })
    const staticIds = getStaticSitemapIds()
    expect(indexUrls.length).toBe(staticIds.length)
    for (const id of staticIds) {
      expect(indexUrls).toContain(`${SITE_URL}/sitemap/${id}.xml`)
    }
  })

  it('getSitemapIndexUrls with providers includes both static + dynamic ids', () => {
    const providerCount = 12_345
    const indexUrls = getSitemapIndexUrls({ activeProvidersCount: providerCount })
    const staticIds = getStaticSitemapIds()
    const dynamicIds = getDynamicSitemapIds({ activeProvidersCount: providerCount })
    const allIds = [...staticIds, ...dynamicIds]
    expect(indexUrls.length).toBe(allIds.length)
    for (const id of allIds) {
      expect(indexUrls).toContain(`${SITE_URL}/sitemap/${id}.xml`)
    }
  })

  it('every index URL is covered by static or dynamic (no orphan)', () => {
    const indexUrls = getSitemapIndexUrls({ activeProvidersCount: 7_777 })
    const staticIds = new Set(getStaticSitemapIds())
    const dynamicIds = new Set(getDynamicSitemapIds({ activeProvidersCount: 7_777 }))
    for (const url of indexUrls) {
      const id = url.replace(`${SITE_URL}/sitemap/`, '').replace('.xml', '')
      expect(staticIds.has(id) || dynamicIds.has(id)).toBe(true)
    }
  })

  it('dynamic ids are empty when activeProvidersCount is 0', () => {
    expect(getDynamicSitemapIds({ activeProvidersCount: 0 })).toEqual([])
  })

  it('dynamic ids are empty when activeProvidersCount is negative', () => {
    expect(getDynamicSitemapIds({ activeProvidersCount: -1 })).toEqual([])
  })

  it('dynamic ids produce correct batch count', () => {
    const ids = getDynamicSitemapIds({ activeProvidersCount: PROVIDER_BATCH_SIZE * 3 + 1 })
    expect(ids.length).toBe(4)
    expect(ids[0]).toBe('providers-0')
    expect(ids[3]).toBe('providers-3')
  })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. CARDINALITY — segment counts match expected formulas
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('segment cardinality', () => {
  const ids = getStaticSitemapIds()

  function countByPrefix(prefix: string): number {
    return ids.filter(id => id.startsWith(prefix) && !id.startsWith(prefix + '-extended')).length
  }

  it('service-cities batch count = ceil(services × TOP_CITIES_PHASE1 / LARGE_BATCH)', () => {
    const expected = Math.ceil(services.length * TOP_CITIES_PHASE1 / LARGE_BATCH)
    expect(countByPrefix('service-cities-')).toBe(expected)
  })

  it('devis-service-cities batch count = ceil(services × villes / STATIC_BATCH)', () => {
    const expected = Math.ceil(services.length * villes.length / STATIC_BATCH)
    expect(countByPrefix('devis-service-cities-')).toBe(expected)
  })

  it('urgence-service-cities batch count = ceil(emergencySlugs × villes / STATIC_BATCH)', () => {
    const expected = Math.ceil(getEmergencySlugs().length * villes.length / STATIC_BATCH)
    expect(countByPrefix('urgence-service-cities-')).toBe(expected)
  })

  it('tarifs-service-cities batch count = ceil(services × villes / STATIC_BATCH)', () => {
    const expected = Math.ceil(services.length * villes.length / STATIC_BATCH)
    expect(countByPrefix('tarifs-service-cities-')).toBe(expected)
  })

  it('avis-service-cities batch count = ceil(avisServiceSlugs × villes / STATIC_BATCH)', () => {
    const expected = Math.ceil(getAvisServiceSlugs().length * villes.length / STATIC_BATCH)
    expect(countByPrefix('avis-service-cities-')).toBe(expected)
  })

  it('problemes-cities batch count = ceil(problemSlugs × villes / STATIC_BATCH)', () => {
    const expected = Math.ceil(getProblemSlugs().length * villes.length / STATIC_BATCH)
    expect(countByPrefix('problemes-cities-')).toBe(expected)
  })

  it('dept-services batch count = ceil(departements × tradeSlugs / LARGE_BATCH)', () => {
    const expected = Math.ceil(departements.length * getTradesSlugs().length / LARGE_BATCH)
    expect(countByPrefix('dept-services-')).toBe(expected)
  })

  it('service-quartiers batch count = ceil(totalServiceQuartierUrls / STATIC_BATCH)', () => {
    const expected = Math.ceil(getTotalServiceQuartierUrls() / STATIC_BATCH)
    expect(countByPrefix('service-quartiers-')).toBe(expected)
  })

  it('devis-quartiers batch count matches service-quartiers batch count', () => {
    const sqIds = ids.filter(id => id.startsWith('service-quartiers-'))
    const dqIds = ids.filter(id => id.startsWith('devis-quartiers-'))
    expect(dqIds.length).toBe(sqIds.length)
  })

  it('singleton sitemaps exist exactly once', () => {
    const singletons = ['static', 'cities', 'geo', 'quartiers', 'devis-services', 'avis-services', 'problemes', 'region-services', 'guides']
    for (const s of singletons) {
      const count = ids.filter(id => id === s).length
      expect(count).toBe(1)
    }
  })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. QUARTIERS ACCESSOR — no divergence
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('no divergence quartiers accessor', () => {
  it('getTotalServiceQuartierUrls matches via getQuartiersByVille', () => {
    let manual = 0
    for (const v of villes) {
      manual += (getQuartiersByVille(v.slug)?.length || 0) * services.length
    }
    expect(getTotalServiceQuartierUrls()).toBe(manual)
  })

  it('getTotalServiceQuartierUrls matches ville.quartiers direct', () => {
    let fromDirect = 0
    for (const v of villes) {
      fromDirect += (v.quartiers?.length || 0) * services.length
    }
    expect(getTotalServiceQuartierUrls()).toBe(fromDirect)
  })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. XML ESCAPING (centralized escapeXmlLoc)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('escapeXmlLoc (centralized)', () => {
  it('escapes & correctly', () => {
    expect(escapeXmlLoc('a&b')).toBe('a&amp;b')
    expect(escapeXmlLoc('a&amp;b')).toBe('a&amp;amp;b')
  })

  it('escapes < and > correctly', () => {
    expect(escapeXmlLoc('<tag>')).toBe('&lt;tag&gt;')
  })

  it('escapes " and \' correctly', () => {
    expect(escapeXmlLoc('"hello"')).toBe('&quot;hello&quot;')
    expect(escapeXmlLoc("l'artisan")).toBe("l&apos;artisan")
  })

  it('passes through accented characters', () => {
    expect(escapeXmlLoc('café')).toBe('café')
    expect(escapeXmlLoc('résumé')).toBe('résumé')
    expect(escapeXmlLoc('Étanchéité')).toBe('Étanchéité')
  })

  it('dangerous strings produce valid XML text after escaping', () => {
    const dangerous = [
      'https://example.com/path?a=1&b=2',
      '<script>alert("xss")</script>',
      'Rénovation & Décoration',
      'Maçon "Pro" <élite>',
      "L'artisan & fils — crépissage",
      'https://servicesartisans.fr/artisan/josé-garcía',
    ]
    for (const str of dangerous) {
      const escaped = escapeXmlLoc(str)
      const afterEntityRemoval = escaped.replace(/&(amp|lt|gt|quot|apos);/g, '')
      expect(afterEntityRemoval).not.toContain('&')
      expect(escaped).not.toContain('<')
      expect(escaped).not.toContain('>')
    }
  })

  it('sitemap index URLs are already safe (no raw & < > in paths)', () => {
    const urls = getSitemapIndexUrls({ activeProvidersCount: 100 })
    for (const url of urls) {
      expect(url).not.toContain('&')
      expect(url).not.toContain('<')
      expect(url).not.toContain('>')
    }
  })

  it('idempotent on safe strings', () => {
    const safe = 'https://servicesartisans.fr/sitemap/static.xml'
    expect(escapeXmlLoc(safe)).toBe(safe)
  })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. GOOGLE PROTOCOL COMPLIANCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('Google protocol compliance', () => {
  it('GOOGLE_MAX_URLS_PER_SITEMAP is 50000', () => {
    expect(GOOGLE_MAX_URLS_PER_SITEMAP).toBe(50_000)
  })

  it('all batch sizes stay below Google limit', () => {
    expect(STATIC_BATCH).toBeLessThanOrEqual(GOOGLE_MAX_URLS_PER_SITEMAP)
    expect(LARGE_BATCH).toBeLessThanOrEqual(GOOGLE_MAX_URLS_PER_SITEMAP)
    expect(PROVIDER_BATCH_SIZE).toBeLessThanOrEqual(GOOGLE_MAX_URLS_PER_SITEMAP)
  })

  it('batch constants are positive integers', () => {
    expect(STATIC_BATCH).toBeGreaterThan(0)
    expect(LARGE_BATCH).toBeGreaterThan(0)
    expect(PROVIDER_BATCH_SIZE).toBeGreaterThan(0)
    expect(Number.isInteger(STATIC_BATCH)).toBe(true)
    expect(Number.isInteger(LARGE_BATCH)).toBe(true)
    expect(Number.isInteger(PROVIDER_BATCH_SIZE)).toBe(true)
  })

  it('index URLs are all absolute HTTPS .xml URLs', () => {
    const urls = getSitemapIndexUrls({ activeProvidersCount: 10 })
    for (const url of urls) {
      expect(url).toMatch(/^https:\/\//)
      expect(url).toMatch(/\.xml$/)
    }
  })

  it('provider sitemap ids follow providers-N pattern', () => {
    const ids = getDynamicSitemapIds({ activeProvidersCount: 25_000 })
    for (const id of ids) {
      expect(id).toMatch(/^providers-\d+$/)
    }
  })

  it('TOP_CITIES_PHASE1 is within villes range', () => {
    expect(TOP_CITIES_PHASE1).toBeGreaterThan(0)
    expect(TOP_CITIES_PHASE1).toBeLessThanOrEqual(villes.length)
  })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. NO DUPLICATE SITEMAP IDS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('no duplicate sitemap IDs', () => {
  it('static ids contain no duplicates', () => {
    const ids = getStaticSitemapIds()
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('dynamic ids contain no duplicates', () => {
    const ids = getDynamicSitemapIds({ activeProvidersCount: 50_000 })
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('static and dynamic ids have no overlap', () => {
    const staticSet = new Set(getStaticSitemapIds())
    const dynamicIds = getDynamicSitemapIds({ activeProvidersCount: 50_000 })
    for (const id of dynamicIds) {
      expect(staticSet.has(id)).toBe(false)
    }
  })

  it('static ids are all non-empty strings', () => {
    for (const id of getStaticSitemapIds()) {
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    }
  })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7. SITEMAP INDEX XML STRUCTURE (simulated)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('sitemap index XML structure', () => {
  function buildIndexXml(providerCount: number): string {
    const urls = getSitemapIndexUrls({ activeProvidersCount: providerCount })
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls.map(loc => `  <sitemap><loc>${escapeXmlLoc(loc)}</loc></sitemap>`),
      '</sitemapindex>',
    ].join('\n')
  }

  it('produces valid XML structure with header', () => {
    const xml = buildIndexXml(0)
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(xml).toContain('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    expect(xml).toContain('</sitemapindex>')
  })

  it('every loc is a valid absolute URL', () => {
    const xml = buildIndexXml(5_000)
    const locs: string[] = []
    const re = /<loc>(.*?)<\/loc>/g
    let m: RegExpExecArray | null
    while ((m = re.exec(xml)) !== null) locs.push(m[1])
    expect(locs.length).toBeGreaterThan(0)
    for (const loc of locs) {
      expect(loc).toMatch(/^https:\/\/servicesartisans\.fr\/sitemap\/[\w-]+\.xml$/)
    }
  })

  it('number of <sitemap> tags matches index URL count', () => {
    const providerCount = 10_000
    const expectedCount = getSitemapIndexUrls({ activeProvidersCount: providerCount }).length
    const xml = buildIndexXml(providerCount)
    const sitemapTags = xml.match(/<sitemap>/g) || []
    expect(sitemapTags.length).toBe(expectedCount)
  })

  it('no unescaped & in generated XML', () => {
    const xml = buildIndexXml(100)
    const cleaned = xml.replace(/&(amp|lt|gt|quot|apos|#\d+|#x[\da-fA-F]+);/g, '')
    expect(cleaned).not.toContain('&')
  })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 8. ANTI-REGRESSION: detect re-introduction of double source of truth
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('anti-regression: single source of truth enforcement', () => {
  // Use path.resolve with process.cwd() — import.meta.url is unreliable in jsdom
  function readSource(relativePath: string): string {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs')
    const path = require('path')
    return fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf-8')
  }

  it('PROVIDER_BATCH_SIZE in manifest matches expected value 5000', () => {
    expect(PROVIDER_BATCH_SIZE).toBe(5_000)
  })

  it('STATIC_BATCH in manifest matches expected value 10000', () => {
    expect(STATIC_BATCH).toBe(10_000)
  })

  it('LARGE_BATCH in manifest matches expected value 45000', () => {
    expect(LARGE_BATCH).toBe(45_000)
  })

  it('sitemap-providers/route.ts imports PROVIDER_BATCH_SIZE from manifest (not local)', () => {
    const routeSource = readSource('src/app/api/sitemap-providers/route.ts')
    // Must import from manifest
    expect(routeSource).toContain("from '@/lib/seo/sitemap-manifest'")
    // Must NOT define its own PROVIDER_BATCH_SIZE (at any indentation level)
    expect(routeSource).not.toMatch(/^\s*(const|let|var)\s+PROVIDER_BATCH_SIZE\b/m)
  })

  it('sitemap.ts imports from manifest and does not define local batch constants', () => {
    const sitemapSource = readSource('src/app/sitemap.ts')
    expect(sitemapSource).toContain("from '@/lib/seo/sitemap-manifest'")
    // Must NOT define its own constants (at any indentation level)
    expect(sitemapSource).not.toMatch(/^\s*(const|let|var)\s+STATIC_BATCH\b/m)
    expect(sitemapSource).not.toMatch(/^\s*(const|let|var)\s+LARGE_BATCH\b/m)
    expect(sitemapSource).not.toMatch(/^\s*(const|let|var)\s+TOP_CITIES_PHASE1\b/m)
    expect(sitemapSource).not.toMatch(/^\s*(const|let|var)\s+PROVIDER_BATCH_SIZE\b/m)
  })

  it('sitemap-index/route.ts imports from manifest and does not define local ID lists', () => {
    const routeSource = readSource('src/app/api/sitemap-index/route.ts')
    expect(routeSource).toContain("from '@/lib/seo/sitemap-manifest'")
    // Must NOT reconstruct IDs locally
    expect(routeSource).not.toContain('getStaticSitemapIds')
    // It should use getSitemapIndexUrls which is the composed helper
    expect(routeSource).toContain('getSitemapIndexUrls')
  })

  it('sitemap-providers/route.ts uses escapeXmlLoc from manifest', () => {
    const routeSource = readSource('src/app/api/sitemap-providers/route.ts')
    expect(routeSource).toContain('escapeXmlLoc')
  })

  it('generateSitemaps() in sitemap.ts delegates to getStaticSitemapIds()', () => {
    const sitemapSource = readSource('src/app/sitemap.ts')
    // The function body should call getStaticSitemapIds()
    expect(sitemapSource).toContain('getStaticSitemapIds()')
    // Should NOT build the ids array inline
    expect(sitemapSource).not.toMatch(/const sitemaps.*=.*\[/)
  })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 9. DATA DIMENSION SANITY — catch data file truncation/corruption
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('data dimension sanity', () => {
  it('services array is non-empty and has expected minimum count', () => {
    expect(services.length).toBeGreaterThanOrEqual(40)
  })

  it('villes array is non-empty and has expected minimum count', () => {
    expect(villes.length).toBeGreaterThanOrEqual(2000)
  })

  it('departements array is non-empty and has expected minimum count', () => {
    expect(departements.length).toBeGreaterThanOrEqual(100)
  })

  it('regions array is non-empty', () => {
    expect(regions.length).toBeGreaterThanOrEqual(13)
  })

  it('problems array is non-empty', () => {
    expect(getProblemSlugs().length).toBeGreaterThanOrEqual(20)
  })

  it('trade slugs are non-empty', () => {
    expect(getTradesSlugs().length).toBeGreaterThanOrEqual(30)
  })

  it('emergency slugs are a subset of trade slugs', () => {
    const tradeSet = new Set(getTradesSlugs())
    for (const slug of getEmergencySlugs()) {
      expect(tradeSet.has(slug)).toBe(true)
    }
  })

  it('avis service slugs equal trade content keys', () => {
    expect(getAvisServiceSlugs().length).toBe(getTradesSlugs().length)
  })
})
