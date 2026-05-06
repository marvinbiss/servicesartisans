/**
 * Régression : la détection du canonical pour getFlagshipArticleSchema.
 *
 * Bug pré-existant : `${SITE_URL}/guides/${input.slug}` hardcodé pour TOUS
 * les callers, y compris les hub pages (/renovation-energetique/travaux/*,
 * /services/*) qui passent un PAGE_PATH absolu — produisait des URLs
 * cassées du type `/guides//renovation-energetique/...` (double slash +
 * mauvais path) injectées dans le JSON-LD Article.
 *
 * Fix 2026-05-06 : détecter `slug.startsWith('/')` pour préserver la
 * rétrocompat des ~140 pages /guides/* qui passent un slug nu.
 */
import { describe, it, expect } from 'vitest'
import { getFlagshipArticleSchema } from '../flagship-schema'

const COMMON = {
  title: 'T',
  description: 'D',
  datePublished: '2026-05-06',
  author: { type: 'organization' as const },
  section: 'Test',
  keywords: ['k1'],
}

describe('getFlagshipArticleSchema canonical detection', () => {
  it('legacy guides — bare slug → /guides/<slug>', () => {
    const s = getFlagshipArticleSchema({ ...COMMON, slug: 'mon-guide' })
    expect(s.url).toMatch(/\/guides\/mon-guide$/)
    expect(s.url).not.toContain('//mon-guide')
  })

  it('hub pages — absolute PAGE_PATH → respect le chemin', () => {
    const s = getFlagshipArticleSchema({
      ...COMMON,
      slug: '/renovation-energetique/travaux/chauffage/chaudiere-bois',
    })
    expect(s.url).toMatch(/\/renovation-energetique\/travaux\/chauffage\/chaudiere-bois$/)
    expect(s.url).not.toContain('/guides/')
  })

  it('absolute PAGE_PATH ne produit jamais de double slash dans le path', () => {
    const s = getFlagshipArticleSchema({ ...COMMON, slug: '/services/plombier' })
    // strip "https://", check no double slash dans le reste de l'URL
    const pathPart = String(s.url).replace(/^https?:\/\//, '')
    expect(pathPart).not.toMatch(/\/\//)
    // schema.org `@id` et `mainEntityOfPage.@id` doivent rester cohérents.
    expect(s['@id']).toBe(`${s.url}#article`)
    const mainEntity = s.mainEntityOfPage as { '@id': string }
    expect(mainEntity['@id']).toBe(s.url)
  })
})
