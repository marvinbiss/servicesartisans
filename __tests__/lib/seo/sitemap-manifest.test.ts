import { describe, it, expect } from 'vitest'
import {
  getStaticSitemapIds,
  getDynamicSitemapIds,
  getSitemapIndexUrls,
  getTotalServiceQuartierUrls,
  STATIC_BATCH,
  LARGE_BATCH,
  PROVIDER_BATCH_SIZE,
  TOP_CITIES_PHASE1,
} from '@/lib/seo/sitemap-manifest'
import { services, villes, getQuartiersByVille } from '@/lib/data/france'
import { SITE_URL } from '@/lib/seo/config'

// ── index ids ⊆ static ids + dynamic ids ──────────────────────────────────

describe('sitemap-manifest: index ids ⊆ static ids + dynamic ids', () => {
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
      const inStatic = staticIds.has(id)
      const inDynamic = dynamicIds.has(id)
      expect(inStatic || inDynamic).toBe(true)
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

// ── no divergence quartiers accessor ──────────────────────────────────────

describe('sitemap-manifest: no divergence quartiers accessor', () => {
  it('getTotalServiceQuartierUrls matches manual computation via getQuartiersByVille', () => {
    let manual = 0
    for (const v of villes) {
      manual += (getQuartiersByVille(v.slug)?.length || 0) * services.length
    }
    expect(getTotalServiceQuartierUrls()).toBe(manual)
  })

  it('getTotalServiceQuartierUrls matches ville.quartiers direct access', () => {
    let fromDirect = 0
    for (const v of villes) {
      fromDirect += (v.quartiers?.length || 0) * services.length
    }
    expect(getTotalServiceQuartierUrls()).toBe(fromDirect)
  })

  it('service-quartiers batch count covers all URLs', () => {
    const total = getTotalServiceQuartierUrls()
    const ids = getStaticSitemapIds()
    const sqIds = ids.filter(id => id.startsWith('service-quartiers-'))
    const expectedBatches = Math.ceil(total / STATIC_BATCH)
    expect(sqIds.length).toBe(expectedBatches)
  })

  it('devis-quartiers batch count matches service-quartiers batch count', () => {
    const ids = getStaticSitemapIds()
    const sqIds = ids.filter(id => id.startsWith('service-quartiers-'))
    const dqIds = ids.filter(id => id.startsWith('devis-quartiers-'))
    expect(dqIds.length).toBe(sqIds.length)
  })
})

// ── providers loc xml escaping ────────────────────────────────────────────

describe('sitemap-manifest: providers loc xml escaping', () => {
  /**
   * Simulate the XML escaping that the sitemap-index route should apply.
   * This helper mirrors the escaping logic providers would need.
   */
  function escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  const dangerousStrings = [
    'https://servicesartisans.fr/sitemap/providers-0.xml',
    'https://example.com/path?a=1&b=2',
    '<script>alert("xss")</script>',
    'Rénovation & Décoration',
    'Maçon "Pro" <élite>',
    "L'artisan & fils — crépissage",
    'https://servicesartisans.fr/artisan/josé-garcía',
    'Étanchéité Façade à l\'ancienne',
  ]

  it('escapeXml handles & correctly', () => {
    expect(escapeXml('a&b')).toBe('a&amp;b')
    expect(escapeXml('a&amp;b')).toBe('a&amp;amp;b') // double escape is intentional for raw &amp;
  })

  it('escapeXml handles < and > correctly', () => {
    expect(escapeXml('<tag>')).toBe('&lt;tag&gt;')
  })

  it('escapeXml handles accented characters (passes through)', () => {
    expect(escapeXml('café')).toBe('café')
    expect(escapeXml('résumé')).toBe('résumé')
    expect(escapeXml('Étanchéité')).toBe('Étanchéité')
  })

  it('all dangerous strings produce valid XML text after escaping', () => {
    for (const str of dangerousStrings) {
      const escaped = escapeXml(str)
      // Must not contain raw & (that isn't part of &amp; &lt; &gt; &quot; &apos;)
      const rawAmpersand = escaped.replace(/&(amp|lt|gt|quot|apos);/g, '')
      expect(rawAmpersand).not.toContain('&')
      // Must not contain raw < or >
      expect(escaped).not.toContain('<')
      expect(escaped).not.toContain('>')
    }
  })

  it('sitemap index URLs are already safe (no & in loc paths)', () => {
    const urls = getSitemapIndexUrls({ activeProvidersCount: 100 })
    for (const url of urls) {
      // Sitemap loc URLs should never contain raw & < >
      expect(url).not.toContain('&')
      expect(url).not.toContain('<')
      expect(url).not.toContain('>')
    }
  })

  it('provider sitemap ids follow providers-N pattern', () => {
    const ids = getDynamicSitemapIds({ activeProvidersCount: 25_000 })
    for (const id of ids) {
      expect(id).toMatch(/^providers-\d+$/)
    }
  })
})

// ── General sanity checks ─────────────────────────────────────────────────

describe('sitemap-manifest: sanity', () => {
  it('static ids contain no duplicates', () => {
    const ids = getStaticSitemapIds()
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('static ids are all non-empty strings', () => {
    for (const id of getStaticSitemapIds()) {
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    }
  })

  it('index URLs are all absolute HTTPS URLs', () => {
    const urls = getSitemapIndexUrls({ activeProvidersCount: 10 })
    for (const url of urls) {
      expect(url).toMatch(/^https:\/\//)
      expect(url).toMatch(/\.xml$/)
    }
  })

  it('batch constants are positive integers', () => {
    expect(STATIC_BATCH).toBeGreaterThan(0)
    expect(LARGE_BATCH).toBeGreaterThan(0)
    expect(PROVIDER_BATCH_SIZE).toBeGreaterThan(0)
    expect(Number.isInteger(STATIC_BATCH)).toBe(true)
    expect(Number.isInteger(LARGE_BATCH)).toBe(true)
    expect(Number.isInteger(PROVIDER_BATCH_SIZE)).toBe(true)
  })

  it('TOP_CITIES_PHASE1 is within villes range', () => {
    expect(TOP_CITIES_PHASE1).toBeGreaterThan(0)
    expect(TOP_CITIES_PHASE1).toBeLessThanOrEqual(villes.length)
  })
})
