/**
 * Snapshot tests Schema.org — Bouclier 5 du plan ULTRA DOMINATION SEO v2.
 *
 * Toute évolution involontaire du shape JSON-LD est détectée par snapshot
 * inline diff. Couvre les helpers présents sur les templates pSEO les plus
 * crawlés (services, rge, avis, blog, devis).
 *
 * Inputs déterministes : noms simples, dates fixes, URLs prévisibles. Pas
 * de tests `_spec.full` : on capture juste assez de structure pour catcher
 * un changement de @type, d'attribut requis ou de nesting.
 *
 * Si un snapshot fail légitimement (refacto voulu) → relancer avec
 * `vitest -u` pour mettre à jour. Toujours vérifier avec un Schema validator
 * Google (Rich Results Test) avant de mettre à jour à l'aveugle.
 */
import { describe, expect, it } from 'vitest'
import {
  getBreadcrumbSchema,
  getServiceSchema,
  getItemListSchema,
  getFAQSchema,
  getGovernmentServiceSchema,
  getFinancialProductSchema,
  getArticleSpeakableSchema,
} from '@/lib/seo/jsonld'
import {
  generateFAQSchema as enrichedFaq,
  generateAggregateRatingSchema,
  generateSpeakableSchema,
} from '@/lib/seo/schema-enrichment'

describe('Schema.org snapshots — jsonld.ts core helpers', () => {
  it('getBreadcrumbSchema — last item omits `item`', () => {
    const schema = getBreadcrumbSchema([
      { name: 'Accueil', url: '/' },
      { name: 'Services', url: '/services' },
      { name: 'Plombier Paris', url: '/services/plombier/paris' },
    ])
    expect(schema).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@id": "https://servicesartisans.fr/services/plombier/paris#breadcrumb",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "item": "https://servicesartisans.fr/",
            "name": "Accueil",
            "position": 1,
          },
          {
            "@type": "ListItem",
            "item": "https://servicesartisans.fr/services",
            "name": "Services",
            "position": 2,
          },
          {
            "@type": "ListItem",
            "name": "Plombier Paris",
            "position": 3,
          },
        ],
        "numberOfItems": 3,
      }
    `)
  })

  it('getServiceSchema — fallback Organization + Country when omitted', () => {
    const schema = getServiceSchema({
      name: 'Plombier Paris',
      description: 'Plombier qualifié à Paris',
    })
    expect(schema).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@type": "Service",
        "areaServed": {
          "@type": "Country",
          "name": "France",
        },
        "description": "Plombier qualifié à Paris",
        "name": "Plombier Paris",
        "provider": {
          "@type": "Organization",
          "name": "ServicesArtisans",
        },
        "serviceType": "Plombier Paris",
      }
    `)
  })

  it('getItemListSchema — embeds AggregateRating only when rating + count > 0', () => {
    const schema = getItemListSchema({
      name: 'Plombiers Paris',
      description: 'Top 2 plombiers',
      url: '/services/plombier/paris',
      items: [
        {
          name: 'A SARL',
          url: '/services/plombier/paris/a-sarl',
          position: 1,
          rating: 4.8,
          reviewCount: 12,
        },
        {
          name: 'B SAS',
          url: '/services/plombier/paris/b-sas',
          position: 2,
          rating: 0,
          reviewCount: 0,
        },
      ],
    })
    expect(schema).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@id": "https://servicesartisans.fr/services/plombier/paris#itemlist",
        "@type": "ItemList",
        "description": "Top 2 plombiers",
        "inLanguage": "fr-FR",
        "isPartOf": {
          "@id": "https://servicesartisans.fr#website",
        },
        "itemListElement": [
          {
            "@type": "ListItem",
            "item": {
              "@type": "LocalBusiness",
              "aggregateRating": {
                "@type": "AggregateRating",
                "bestRating": 5,
                "ratingValue": 4.8,
                "reviewCount": 12,
                "worstRating": 1,
              },
              "image": undefined,
              "name": "A SARL",
              "priceRange": "€€",
              "url": "https://servicesartisans.fr/services/plombier/paris/a-sarl",
            },
            "position": 1,
          },
          {
            "@type": "ListItem",
            "item": {
              "@type": "LocalBusiness",
              "image": undefined,
              "name": "B SAS",
              "priceRange": "€€",
              "url": "https://servicesartisans.fr/services/plombier/paris/b-sas",
            },
            "position": 2,
          },
        ],
        "name": "Plombiers Paris",
        "numberOfItems": 2,
        "url": "https://servicesartisans.fr/services/plombier/paris",
      }
    `)
  })

  it('getFAQSchema — @type FAQPage + Question/Answer nesting', () => {
    const schema = getFAQSchema([
      { question: 'Combien coûte un plombier ?', answer: 'Entre 45 et 75€/h.' },
    ])
    expect(schema).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "inLanguage": "fr-FR",
        "isPartOf": {
          "@id": "https://servicesartisans.fr#website",
        },
        "mainEntity": [
          {
            "@type": "Question",
            "acceptedAnswer": {
              "@type": "Answer",
              "inLanguage": "fr-FR",
              "text": "Entre 45 et 75€/h.",
            },
            "name": "Combien coûte un plombier ?",
          },
        ],
      }
    `)
  })

  // Sprint X Ahrefs 2026-05-03 — verrou speakable defaults FAQPage.
  // Le pattern <details>/<summary> Tailwind est dominant. Sans `details summary`
  // dans les defaults, Google Speakable checker rejetait le signal sur 18+
  // pages (ghost-match HIGH bug Reviewer SEO Schema).
  it('Sprint X — getFAQSchema includeSpeakable default contient details summary/p', () => {
    const schema = getFAQSchema([{ question: 'Q', answer: 'A' }], {
      pageUrl: 'https://example.com/faq',
      includeSpeakable: true,
    })
    const speakable = schema?.speakable as Record<string, unknown>
    const selectors = speakable.cssSelector as string[]
    expect(selectors).toContain('details summary')
    expect(selectors).toContain('details p')
    expect(selectors).toContain('h1')
    expect(selectors).toContain('[data-speakable="true"]')
    // Rétrocompat fallback préservé (zéro coût SEO).
    expect(selectors).toContain('.faq-question')
    expect(selectors).toContain('.faq-answer')
  })

  it('Sprint X — speakableCssSelectors override remplace bien le default', () => {
    const schema = getFAQSchema([{ question: 'Q', answer: 'A' }], {
      pageUrl: 'https://example.com/faq',
      includeSpeakable: true,
      speakableCssSelectors: ['h2', '.custom-faq'],
    })
    const speakable = schema?.speakable as Record<string, unknown>
    expect(speakable.cssSelector).toEqual(['h2', '.custom-faq'])
  })
})

describe('Schema.org snapshots — RGE templates (YMYL)', () => {
  it('getGovernmentServiceSchema — required fields preserved', () => {
    const schema = getGovernmentServiceSchema({
      name: 'MaPrimeRénov pour pompe à chaleur à Paris',
      description: 'Aide ANAH cumulable CEE.',
      url: 'https://servicesartisans.fr/rge/pompe-a-chaleur/paris',
      serviceType: 'Aide financière à la rénovation',
      audience: 'Propriétaires occupants',
      temporalCoverage: '2026-01-01/2030-12-31',
      serviceOperator: { name: 'ANAH', url: 'https://france-renov.gouv.fr/' },
      sameAs: ['https://france-renov.gouv.fr/'],
    })
    expect(schema).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@type": "GovernmentService",
        "areaServed": {
          "@type": "Country",
          "name": "France",
        },
        "audience": {
          "@type": "Audience",
          "audienceType": "Propriétaires occupants",
        },
        "description": "Aide ANAH cumulable CEE.",
        "name": "MaPrimeRénov pour pompe à chaleur à Paris",
        "provider": {
          "@id": "https://servicesartisans.fr#organization",
          "@type": "Organization",
          "name": "ServicesArtisans",
        },
        "sameAs": [
          "https://france-renov.gouv.fr/",
        ],
        "serviceOperator": {
          "@type": "GovernmentOrganization",
          "name": "ANAH",
          "url": "https://france-renov.gouv.fr/",
        },
        "serviceType": "Aide financière à la rénovation",
        "temporalCoverage": "2026-01-01/2030-12-31",
        "url": "https://servicesartisans.fr/rge/pompe-a-chaleur/paris",
      }
    `)
  })

  it('getFinancialProductSchema — category + url + provider', () => {
    const schema = getFinancialProductSchema({
      name: 'Cumul aides rénovation pompe à chaleur Paris',
      description: 'MaPrimeRénov + CEE + Éco-PTZ + TVA 5,5%.',
      url: 'https://servicesartisans.fr/rge/pompe-a-chaleur/paris',
      category: 'Government Grant',
      feesAndCommissionsSpecification: "Aides versées sous condition d'éligibilité.",
    })
    expect(schema).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@type": "FinancialProduct",
        "areaServed": {
          "@type": "Country",
          "name": "France",
        },
        "category": "Government Grant",
        "description": "MaPrimeRénov + CEE + Éco-PTZ + TVA 5,5%.",
        "feesAndCommissionsSpecification": "Aides versées sous condition d'éligibilité.",
        "name": "Cumul aides rénovation pompe à chaleur Paris",
        "provider": {
          "@id": "https://servicesartisans.fr#organization",
          "@type": "Organization",
          "name": "ServicesArtisans",
        },
        "url": "https://servicesartisans.fr/rge/pompe-a-chaleur/paris",
      }
    `)
  })
})

describe('Schema.org snapshots — schema-enrichment generators', () => {
  it('generateFAQSchema returns null on empty list (no FAQPage emitted)', () => {
    expect(enrichedFaq([])).toBeNull()
  })

  it('generateAggregateRatingSchema — returns null when reviewCount === 0', () => {
    expect(
      generateAggregateRatingSchema({
        serviceName: 'Plombier',
        villeName: 'Paris',
        avgRating: 4.5,
        reviewCount: 0,
        serviceSlug: 'plombier',
        villeSlug: 'paris',
      })
    ).toBeNull()
  })

  it('generateAggregateRatingSchema — embeds rating when count > 0', () => {
    const schema = generateAggregateRatingSchema({
      serviceName: 'Plombier',
      villeName: 'Paris',
      avgRating: 4.5,
      reviewCount: 12,
      serviceSlug: 'plombier',
      villeSlug: 'paris',
    })
    expect(schema).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "FR",
          "addressLocality": "Paris",
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "bestRating": 5,
          "ratingValue": 4.5,
          "reviewCount": 12,
          "worstRating": 1,
        },
        "name": "Plombier à Paris — ServicesArtisans",
        "url": "https://servicesartisans.fr/services/plombier/paris",
      }
    `)
  })

  it('generateSpeakableSchema — pins SpeakableSpecification cssSelector', () => {
    const schema = generateSpeakableSchema({
      url: 'https://servicesartisans.fr/services/plombier/paris',
      title: 'Plombier Paris',
      cssSelectors: ['.speakable-summary', '.speakable-faq'],
    })
    expect(schema).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Plombier Paris",
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": [
            ".speakable-summary",
            ".speakable-faq",
          ],
        },
        "url": "https://servicesartisans.fr/services/plombier/paris",
      }
    `)
  })
})

describe('Schema.org snapshots — Article + Person (E-E-A-T)', () => {
  it('getArticleSpeakableSchema — WebPage + SpeakableSpecification cssSelectors', () => {
    const schema = getArticleSpeakableSchema({
      url: 'https://servicesartisans.fr/blog/guide-plombier',
      title: 'Guide plombier 2026',
      excerpt: 'Guide complet du plombier 2026 — tarifs, garanties, certifications.',
      speakableCssSelectors: ['h1', '[data-speakable="true"]'],
    })
    expect(schema).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "description": "Guide complet du plombier 2026 — tarifs, garanties, certifications.",
        "name": "Guide plombier 2026",
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": [
            "h1",
            "[data-speakable="true"]",
          ],
        },
        "url": "https://servicesartisans.fr/blog/guide-plombier",
      }
    `)
  })
})
