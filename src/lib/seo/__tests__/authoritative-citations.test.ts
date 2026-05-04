/**
 * Tier 20 — vérifie l'auto-résolution citation Schema.org QRG.
 *
 * Ce qu'on contrôle ici (et qui aurait coûté cher en régression silencieuse):
 *   - getAuthorityCitations dédup + ordre stable
 *   - flagship-schema injecte citation auto à partir de section + keywords
 *   - blog-schema injecte citation auto à partir de category + tags
 *   - override caller fusionné, pas remplacé (pas de perte de source spécifique)
 */
import { describe, it, expect } from 'vitest'

import {
  getAuthorityCitations,
  MAPRIMERENOV_AUTHORITY_CITATIONS,
  CEE_AUTHORITY_CITATIONS,
  RGE_AUTHORITY_CITATIONS,
} from '../authoritative-citations'
import { getFlagshipArticleSchema } from '../flagship-schema'
import { getBlogArticleSchema } from '../blog-schema'

describe('getAuthorityCitations', () => {
  it('returns citations for a single known topic', () => {
    const out = getAuthorityCitations(['maprimerenov'])
    expect(out).toEqual([...MAPRIMERENOV_AUTHORITY_CITATIONS])
  })

  it('dedupes URLs across multiple topics', () => {
    const out = getAuthorityCitations(['maprimerenov', 'cee'])
    expect(new Set(out).size).toBe(out.length)
    expect(out).toContain('https://www.maprimerenov.gouv.fr/')
    expect(out).toContain(
      'https://www.ecologie.gouv.fr/politiques-publiques/certificats-deconomies-denergie'
    )
  })

  it('skips unknown topics silently', () => {
    const out = getAuthorityCitations(['maprimerenov', 'totally-unknown-topic'])
    expect(out).toEqual([...MAPRIMERENOV_AUTHORITY_CITATIONS])
  })

  it('returns empty array if all topics unknown', () => {
    expect(getAuthorityCitations(['x', 'y'])).toEqual([])
  })
})

describe('getFlagshipArticleSchema — citation auto-injection', () => {
  const baseInput = {
    title: "Guide MaPrimeRénov' 2026",
    description: 'Test',
    slug: 'maprimerenov-2026',
    datePublished: '2026-01-01',
    author: { type: 'organization' as const },
    section: 'Aides à la rénovation énergétique',
    keywords: ["MaPrimeRénov'", '2026'],
  }

  it('injects MaPrimeRénov citations from keywords', () => {
    const s = getFlagshipArticleSchema(baseInput)
    const citation = s.citation as string[] | undefined
    expect(Array.isArray(citation)).toBe(true)
    expect(citation).toContain('https://www.maprimerenov.gouv.fr/')
  })

  it('merges caller override with auto-resolved (no loss)', () => {
    const customUrl = 'https://example.gouv.fr/specific-decree'
    const s = getFlagshipArticleSchema({
      ...baseInput,
      citation: [customUrl],
    })
    const citation = s.citation as string[]
    expect(citation).toContain(customUrl)
    expect(citation).toContain('https://www.maprimerenov.gouv.fr/')
  })

  it('omits citation field when no topic matches', () => {
    const s = getFlagshipArticleSchema({
      ...baseInput,
      section: 'Random unrelated topic',
      keywords: ['nothing', 'matches'],
    })
    expect(s.citation).toBeUndefined()
  })

  it('detects RGE topic from various qualif names', () => {
    const s = getFlagshipArticleSchema({
      ...baseInput,
      section: 'Qualifications RGE',
      keywords: ['Qualibat', 'QualiPAC'],
    })
    const citation = s.citation as string[]
    expect(citation).toEqual(expect.arrayContaining([...RGE_AUTHORITY_CITATIONS]))
  })

  it('combines MaPrimeRénov + CEE + PAC topics', () => {
    const s = getFlagshipArticleSchema({
      ...baseInput,
      section: 'Pompe à chaleur',
      keywords: ["MaPrimeRénov'", 'CEE', 'pompe à chaleur'],
    })
    const citation = s.citation as string[]
    // Expect at least one URL from each topic family
    expect(citation.some((u) => u.includes('maprimerenov'))).toBe(true)
    expect(citation.some((u) => u.includes('certificats-deconomies-denergie'))).toBe(true)
    expect(citation.some((u) => u.includes('qualipac') || u.includes('changer-chaudiere'))).toBe(
      true
    )
  })
})

describe('getBlogArticleSchema — citation auto-injection', () => {
  it('injects citations from category + tags', () => {
    const out = getBlogArticleSchema(
      {
        title: "MaPrimeRénov' guide",
        excerpt: 'x',
        content: ['hello'],
        author: 'ServicesArtisans',
        date: '2026-05-01',
        category: 'Aides',
        tags: ["MaPrimeRénov'", 'CEE'],
      },
      'mpr-cee-guide'
    )
    const citation = (out[0] as Record<string, unknown>).citation as string[]
    expect(Array.isArray(citation)).toBe(true)
    expect(citation).toContain('https://www.maprimerenov.gouv.fr/')
    expect(citation).toContain(
      'https://www.ecologie.gouv.fr/politiques-publiques/certificats-deconomies-denergie'
    )
  })

  it('omits citation when category and tags do not match any topic', () => {
    const out = getBlogArticleSchema(
      {
        title: 'Lifestyle post',
        excerpt: 'x',
        content: ['hello'],
        author: 'ServicesArtisans',
        date: '2026-05-01',
        category: 'Lifestyle',
        tags: ['inspiration', 'décoration'],
      },
      'lifestyle-post'
    )
    const article = out[0] as Record<string, unknown>
    expect(article.citation).toBeUndefined()
  })
})

describe('CEE topic citations include Légifrance', () => {
  it('exposes the Légifrance article L221 reference', () => {
    expect(CEE_AUTHORITY_CITATIONS.some((u) => u.includes('legifrance.gouv.fr'))).toBe(true)
  })
})
