import { describe, expect, it } from 'vitest'

import {
  aidesCatalog,
  aidesBySlug,
  aidesSlugs,
  getAideBySlug,
  getCumulableAides,
  type Aide,
} from '@/lib/aides/aides-catalog'

describe('aidesCatalog — structural integrity', () => {
  it('contains exactly 12 aides', () => {
    expect(aidesCatalog).toHaveLength(12)
  })

  it('every slug is unique kebab-case [a-z0-9-]+', () => {
    const seen = new Set<string>()
    for (const a of aidesCatalog) {
      expect(a.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
      expect(seen.has(a.slug)).toBe(false)
      seen.add(a.slug)
    }
  })

  it('aidesSlugs mirrors catalog order', () => {
    expect(aidesSlugs).toEqual(aidesCatalog.map((a) => a.slug))
  })

  it('aidesBySlug lookup returns same reference as catalog', () => {
    for (const a of aidesCatalog) {
      expect(aidesBySlug[a.slug]).toBe(a)
    }
  })
})

describe('aidesCatalog — YMYL data quality', () => {
  it('every aide has lastReviewed in ISO YYYY-MM-DD format', () => {
    for (const a of aidesCatalog) {
      expect(a.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('every aide has at least 1 source with HTTPS URL pointing to a known official domain', () => {
    const officialDomains = [
      'france-renov.gouv.fr',
      'service-public.fr',
      'anah.gouv.fr',
      'ecologie.gouv.fr',
      'maprimerenov.gouv.fr',
      'chequeenergie.gouv.fr',
      'monprojet.anah.gouv.fr',
      'ademe.fr',
      'legifrance.gouv.fr',
      'impots.gouv.fr',
    ]
    for (const a of aidesCatalog) {
      expect(a.sources.length).toBeGreaterThan(0)
      for (const src of a.sources) {
        expect(src.url).toMatch(/^https:\/\//)
        const matchesOfficial = officialDomains.some((d) => src.url.includes(d))
        expect(matchesOfficial, `${a.slug} source ${src.url} not in allowlist`).toBe(true)
      }
    }
  })

  it('every aide has 1+ montant, 3+ eligibilite, 3+ demarche, 3+ faqs', () => {
    for (const a of aidesCatalog) {
      expect(a.montants.length, `${a.slug} montants`).toBeGreaterThanOrEqual(1)
      expect(a.eligibilite.length, `${a.slug} eligibilite`).toBeGreaterThanOrEqual(3)
      expect(a.demarche.length, `${a.slug} demarche`).toBeGreaterThanOrEqual(3)
      expect(a.faqs.length, `${a.slug} faqs`).toBeGreaterThanOrEqual(3)
    }
  })

  it('FAQs include the disclaimer fallback question (vérifier sur france-renov)', () => {
    for (const a of aidesCatalog) {
      const hasDisclaimer = a.faqs.some((f) => f.answer.includes('france-renov.gouv.fr'))
      expect(hasDisclaimer, `${a.slug} missing france-renov disclaimer`).toBe(true)
    }
  })

  it('cumulableWith references only existing slugs (no orphans) and excludes self', () => {
    const known = new Set(aidesSlugs)
    for (const a of aidesCatalog) {
      for (const slug of a.cumulableWith) {
        expect(known.has(slug), `${a.slug} → ${slug} orphan`).toBe(true)
        expect(slug).not.toBe(a.slug)
      }
    }
  })

  it('temporalCoverage matches ISO 8601 interval format YYYY-MM-DD/YYYY-MM-DD', () => {
    for (const a of aidesCatalog) {
      expect(a.temporalCoverage).toMatch(/^\d{4}-\d{2}-\d{2}\/\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('demarche steps have non-empty name + text', () => {
    for (const a of aidesCatalog) {
      for (const step of a.demarche) {
        expect(step.name.trim().length, `${a.slug} step name empty`).toBeGreaterThan(0)
        expect(step.text.trim().length, `${a.slug} step text empty`).toBeGreaterThan(10)
      }
    }
  })

  it('kind is GovernmentService or FinancialProduct (Schema.org allowlist)', () => {
    for (const a of aidesCatalog) {
      expect(['GovernmentService', 'FinancialProduct']).toContain(a.kind)
    }
  })
})

describe('getAideBySlug', () => {
  it('returns the aide for a known slug', () => {
    const a = getAideBySlug('maprimerenov')
    expect(a).not.toBeNull()
    expect(a?.slug).toBe('maprimerenov')
  })

  it('returns null for unknown slug', () => {
    expect(getAideBySlug('not-a-real-aide')).toBeNull()
    expect(getAideBySlug('')).toBeNull()
  })
})

describe('getCumulableAides', () => {
  it('returns Aide[] for valid slug, all entries are real Aide', () => {
    const cumulables = getCumulableAides('maprimerenov')
    expect(cumulables.length).toBeGreaterThan(0)
    for (const a of cumulables) {
      expect(aidesBySlug[a.slug]).toBe(a)
    }
  })

  it('returns [] for unknown slug', () => {
    expect(getCumulableAides('unknown')).toEqual([])
  })

  it('never includes the aide itself in its cumulables', () => {
    for (const a of aidesCatalog) {
      const cumulables = getCumulableAides(a.slug)
      const slugs = cumulables.map((c) => c.slug)
      expect(slugs).not.toContain(a.slug)
    }
  })
})

describe('Aide.tagline and description quality (CTR signals)', () => {
  it('tagline is 30-100 chars (snippet-friendly)', () => {
    for (const a of aidesCatalog) {
      expect(a.tagline.length, `${a.slug} tagline`).toBeGreaterThanOrEqual(30)
      expect(a.tagline.length, `${a.slug} tagline`).toBeLessThanOrEqual(100)
    }
  })

  it('description is 100-700 chars (well-formed paragraph)', () => {
    for (const a of aidesCatalog) {
      expect(a.description.length, `${a.slug} description`).toBeGreaterThanOrEqual(100)
      expect(a.description.length, `${a.slug} description`).toBeLessThanOrEqual(700)
    }
  })

  it('schemaDescription is independent (not equal) of description', () => {
    for (const a of aidesCatalog) {
      // Pas de duplication, mais peut commencer par les mêmes mots — on
      // vérifie juste que ce n'est pas littéralement le même string.
      expect(a.schemaDescription).not.toBe(a.description)
    }
  })
})

describe('Type guards', () => {
  it('Aide type fields are present on every entry', () => {
    const required: (keyof Aide)[] = [
      'slug',
      'name',
      'tagline',
      'kind',
      'description',
      'schemaDescription',
      'estimatedVolume',
      'category',
      'montants',
      'eligibilite',
      'demarche',
      'faqs',
      'cumulableWith',
      'sources',
      'lastReviewed',
      'keywords',
      'temporalCoverage',
    ]
    for (const a of aidesCatalog) {
      for (const k of required) {
        expect(a[k], `${a.slug} missing ${k}`).toBeDefined()
      }
    }
  })
})

// P0.1 (test-architect 2026-04-29) — generateStaticParams contract
describe('generateStaticParams contract', () => {
  it('aidesSlugs produces exactly 12 non-empty strings, no duplicates', () => {
    const params = aidesSlugs.map((slug) => ({ slug }))
    expect(params).toHaveLength(12)
    const seen = new Set<string>()
    for (const p of params) {
      expect(typeof p.slug).toBe('string')
      expect(p.slug.length).toBeGreaterThan(0)
      expect(seen.has(p.slug)).toBe(false)
      seen.add(p.slug)
    }
  })
})

// P0.3 (test-architect 2026-04-29) — Schema.org type cohérent avec category
describe('Schema.org @type — kind ↔ category coherence (YMYL)', () => {
  it('every aide has kind in {GovernmentService, FinancialProduct} only', () => {
    for (const a of aidesCatalog) {
      expect(['GovernmentService', 'FinancialProduct']).toContain(a.kind)
    }
  })

  it('Subvention nationale + Avantage fiscal → GovernmentService ; Prime privée + Prêt → FinancialProduct', () => {
    for (const a of aidesCatalog) {
      if (a.category === 'Subvention nationale' || a.category === 'Avantage fiscal') {
        expect(a.kind, `${a.slug} should be GovernmentService`).toBe('GovernmentService')
      }
      if (a.category === 'Prime privée' || a.category === 'Prêt') {
        expect(a.kind, `${a.slug} should be FinancialProduct`).toBe('FinancialProduct')
      }
    }
  })

  it('catalog has at least 1 GovernmentService AND 1 FinancialProduct (mix is required for SEO topical authority)', () => {
    const govCount = aidesCatalog.filter((a) => a.kind === 'GovernmentService').length
    const finCount = aidesCatalog.filter((a) => a.kind === 'FinancialProduct').length
    expect(govCount + finCount).toBe(12)
    expect(govCount).toBeGreaterThan(0)
    expect(finCount).toBeGreaterThan(0)
  })
})

// P1.1 (test-architect 2026-04-29) — cumulableWith bidirectional symmetry
//
// Distinction sémantique : les aides « primaires » (instruments financiers
// réels : maprimerenov, cee, eco-ptz, tva-5-5, cheque-energie, coup-de-pouce,
// maprimeadapt) doivent être symétriques entre elles. Les aides agrégatrices
// (slug `aide-*`, pages thématiques par travaux) pointent vers les primaires
// applicables ; l'inverse n'aurait pas de sens (TVA 5,5 % ne « renvoie » pas
// vers une page thématique pompe à chaleur — la TVA 5,5 % s'applique à tous
// les travaux ENR sans distinction).
const AGGREGATOR_PREFIX = 'aide-'

function isAggregator(slug: string): boolean {
  return slug.startsWith(AGGREGATOR_PREFIX)
}

describe('cumulableWith — bidirectional symmetry (primaires entre elles)', () => {
  it('if A and B are both primary aides and A.cumulableWith includes B, then B.cumulableWith must include A', () => {
    for (const a of aidesCatalog) {
      if (isAggregator(a.slug)) continue
      for (const targetSlug of a.cumulableWith) {
        if (isAggregator(targetSlug)) continue // ignore aggregator targets (rare)
        const target = aidesBySlug[targetSlug]
        if (!target) continue // already covered by P0 orphan test
        expect(
          target.cumulableWith,
          `${a.slug}↔${targetSlug} asymmetric cumulability between two primary aides`
        ).toContain(a.slug)
      }
    }
  })

  it('aggregator aides (aide-*) only point to existing primary aides', () => {
    for (const a of aidesCatalog) {
      if (!isAggregator(a.slug)) continue
      for (const targetSlug of a.cumulableWith) {
        const target = aidesBySlug[targetSlug]
        expect(target, `${a.slug} → ${targetSlug} orphan`).toBeDefined()
        expect(
          isAggregator(targetSlug),
          `${a.slug} should not point to another aggregator (${targetSlug})`
        ).toBe(false)
      }
    }
  })
})

// P1.2 (test-architect 2026-04-29) — lastReviewed freshness anti-drift
describe('lastReviewed freshness (≤ 90 days from build time)', () => {
  it('every aide.lastReviewed is within 90 days from now (anti-stale guard)', () => {
    const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000
    const now = Date.now()
    for (const a of aidesCatalog) {
      const reviewed = Date.parse(a.lastReviewed + 'T00:00:00Z')
      expect(Number.isFinite(reviewed), `${a.slug} lastReviewed unparseable`).toBe(true)
      const ageMs = now - reviewed
      expect(
        ageMs,
        `${a.slug} lastReviewed=${a.lastReviewed} is older than 90 days — refresh source check before merge`
      ).toBeLessThanOrEqual(NINETY_DAYS_MS)
    }
  })
})
