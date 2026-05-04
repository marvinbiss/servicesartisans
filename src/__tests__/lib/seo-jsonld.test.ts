import { describe, it, expect, vi } from 'vitest'

// Mock dependencies before importing
vi.mock('@/lib/seo/config', () => ({
  SITE_URL: 'https://servicesartisans.fr',
  SITE_NAME: 'ServicesArtisans',
}))

vi.mock('@/lib/config/company-identity', () => ({
  companyIdentity: {
    email: 'contact@servicesartisans.fr',
    phone: '07 56 87 27 87',
    tagline: 'Le premier annuaire 100% artisans RGE certifiés',
    legalName: null,
    address: null,
    foundingDate: null,
    tvaIntracom: null,
  },
  isCompanyRegistered: vi.fn(() => false),
  getSocialLinks: vi.fn(() => [
    'https://facebook.com/servicesartisans',
    'https://instagram.com/servicesartisans',
  ]),
}))

vi.mock('@/lib/seo/location-content', () => ({
  hashCode: (s: string) => {
    let hash = 0
    for (let i = 0; i < s.length; i++) {
      hash = (hash << 5) - hash + s.charCodeAt(i)
      hash |= 0
    }
    return hash
  },
}))

import {
  getOrganizationSchema,
  getWebsiteSchema,
  getServiceSchema,
  getBreadcrumbSchema,
  getFAQSchema,
  getHowToSchema,
  getItemListSchema,
  getPlaceSchema,
  getCollectionPageSchema,
  getServicePricingSchema,
  getLocalServiceSchema,
  getComparisonReviewSchema,
  getAvisHubSchema,
  getUrgencyServiceSchema,
  getUrgencyHubServiceSchema,
  getSpeakableSchema,
  getEnrichedLocalServiceSchema,
  getPersonSchema,
  getReviewedByPersonSchema,
  getInsuranceProductSchema,
  getFinancialProductSchema,
  getGovernmentServiceSchema,
  getLoanOrCreditSchema,
  getDetailedPricingSchema,
} from '@/lib/seo/jsonld'

// ---------- getOrganizationSchema ----------
describe('getOrganizationSchema', () => {
  it('returns correct @type and @context', () => {
    const schema = getOrganizationSchema()
    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('Organization')
  })

  it('includes site name and URL', () => {
    const schema = getOrganizationSchema()
    expect(schema.name).toBe('ServicesArtisans')
    expect(schema.url).toBe('https://servicesartisans.fr')
  })

  it('includes sameAs with social links when available', () => {
    const schema = getOrganizationSchema()
    expect(schema.sameAs).toBeDefined()
    expect(schema.sameAs).toContain('https://facebook.com/servicesartisans')
  })

  it('includes contactPoint with email', () => {
    const schema = getOrganizationSchema()
    expect(schema.contactPoint).toBeDefined()
    expect((schema.contactPoint as Record<string, unknown>).email).toBe(
      'contact@servicesartisans.fr'
    )
  })

  it('emits Brand entity with @id, slogan and logo (Tier 26)', () => {
    const schema = getOrganizationSchema()
    expect(schema.brand).toBeDefined()
    const brand = schema.brand as Record<string, unknown>
    expect(brand['@type']).toBe('Brand')
    expect(brand['@id']).toBe('https://servicesartisans.fr#brand')
    expect(brand.slogan).toBeDefined()
  })

  it('emits hasOfferCatalog pointing to /services (Tier 26)', () => {
    const schema = getOrganizationSchema()
    expect(schema.hasOfferCatalog).toBeDefined()
    const catalog = schema.hasOfferCatalog as Record<string, unknown>
    expect(catalog['@type']).toBe('OfferCatalog')
    expect(catalog.url).toBe('https://servicesartisans.fr/services')
  })

  it('emits disambiguatingDescription for KG entity disambiguation (Tier 26)', () => {
    const schema = getOrganizationSchema()
    expect(schema.disambiguatingDescription).toBeDefined()
    expect(typeof schema.disambiguatingDescription).toBe('string')
  })
})

// ---------- getWebsiteSchema ----------
describe('getWebsiteSchema', () => {
  it('returns WebSite type with SearchAction', () => {
    const schema = getWebsiteSchema()
    expect(schema['@type']).toBe('WebSite')
    expect(schema.potentialAction).toBeDefined()
  })

  it('links to #organization via publisher, copyrightHolder, isPartOf (Tier 27)', () => {
    const schema = getWebsiteSchema()
    const orgId = 'https://servicesartisans.fr#organization'
    expect((schema.publisher as { '@id': string })['@id']).toBe(orgId)
    expect((schema.copyrightHolder as { '@id': string })['@id']).toBe(orgId)
    expect((schema.isPartOf as { '@id': string })['@id']).toBe(orgId)
  })

  it('emits abstract + keywords + audience for AI Overviews (Tier 27)', () => {
    const schema = getWebsiteSchema()
    expect(schema.abstract).toBeDefined()
    expect(schema.keywords).toBeDefined()
    expect(schema.audience).toBeDefined()
    expect((schema.audience as { '@type': string })['@type']).toBe('Audience')
    expect((schema.potentialAction as Record<string, unknown>)['@type']).toBe('SearchAction')
  })

  it('includes correct search URL template', () => {
    const schema = getWebsiteSchema()
    const action = schema.potentialAction as Record<string, unknown>
    const target = action.target as Record<string, unknown>
    expect(target.urlTemplate).toContain('/recherche?q=')
  })
})

// ---------- getServiceSchema ----------
describe('getServiceSchema', () => {
  it('returns Service type with name and description', () => {
    const schema = getServiceSchema({ name: 'Plomberie', description: 'Service plomberie' })
    expect(schema['@type']).toBe('Service')
    expect(schema.name).toBe('Plomberie')
    expect(schema.description).toBe('Service plomberie')
  })

  it('uses SITE_NAME as fallback provider when no provider specified', () => {
    const schema = getServiceSchema({ name: 'Plomberie', description: 'Test' })
    expect((schema.provider as Record<string, unknown>).name).toBe('ServicesArtisans')
  })

  it('uses custom provider when specified', () => {
    const schema = getServiceSchema({
      name: 'Plomberie',
      description: 'Test',
      provider: 'Acme Corp',
    })
    expect((schema.provider as Record<string, unknown>).name).toBe('Acme Corp')
  })

  it('defaults areaServed to France when no area specified', () => {
    const schema = getServiceSchema({ name: 'Plomberie', description: 'Test' })
    expect((schema.areaServed as Record<string, unknown>).name).toBe('France')
  })

  it('uses custom areaServed when specified', () => {
    const schema = getServiceSchema({ name: 'Plomberie', description: 'Test', areaServed: 'Paris' })
    expect((schema.areaServed as Record<string, unknown>).name).toBe('Paris')
    expect((schema.areaServed as Record<string, unknown>)['@type']).toBe('Place')
  })

  it('uses category as serviceType when provided', () => {
    const schema = getServiceSchema({ name: 'Plomberie', description: 'Test', category: 'Travaux' })
    expect(schema.serviceType).toBe('Travaux')
  })

  it('falls back to name as serviceType when no category', () => {
    const schema = getServiceSchema({ name: 'Plomberie', description: 'Test' })
    expect(schema.serviceType).toBe('Plomberie')
  })
})

// ---------- getBreadcrumbSchema ----------
describe('getBreadcrumbSchema', () => {
  it('returns BreadcrumbList with correct positions', () => {
    const items = [
      { name: 'Accueil', url: '/' },
      { name: 'Services', url: '/services' },
      { name: 'Plomberie', url: '/services/plomberie' },
    ]
    const schema = getBreadcrumbSchema(items)
    expect(schema['@type']).toBe('BreadcrumbList')
    expect(schema.itemListElement).toHaveLength(3)
  })

  it('last item has no item URL (Google compliance)', () => {
    const items = [
      { name: 'Accueil', url: '/' },
      { name: 'Plomberie', url: '/services/plomberie' },
    ]
    const schema = getBreadcrumbSchema(items)
    const elements = schema.itemListElement as Array<Record<string, unknown>>
    expect(elements[1].item).toBeUndefined()
    expect(elements[0].item).toBe('https://servicesartisans.fr/')
  })

  it('positions start at 1', () => {
    const schema = getBreadcrumbSchema([{ name: 'Accueil', url: '/' }])
    const elements = schema.itemListElement as Array<Record<string, unknown>>
    expect(elements[0].position).toBe(1)
  })

  it('emits deterministic @id based on leaf URL (Tier 28)', () => {
    const items = [
      { name: 'Accueil', url: '/' },
      { name: 'Services', url: '/services' },
      { name: 'Plomberie', url: '/services/plomberie' },
    ]
    const schema = getBreadcrumbSchema(items)
    expect(schema['@id']).toBe('https://servicesartisans.fr/services/plomberie#breadcrumb')
  })

  it('emits numberOfItems matching itemListElement length (Tier 28)', () => {
    const items = [
      { name: 'Accueil', url: '/' },
      { name: 'A', url: '/a' },
      { name: 'B', url: '/a/b' },
    ]
    const schema = getBreadcrumbSchema(items)
    expect(schema.numberOfItems).toBe(3)
  })
})

// ---------- getFAQSchema ----------
describe('getFAQSchema', () => {
  it('returns FAQPage with questions and answers', () => {
    const faqs = [
      { question: 'Q1?', answer: 'A1' },
      { question: 'Q2?', answer: 'A2' },
    ]
    const schema = getFAQSchema(faqs)
    expect(schema).not.toBeNull()
    expect(schema!['@type']).toBe('FAQPage')
    expect(schema!.mainEntity).toHaveLength(2)
  })

  it('returns null for empty FAQ list', () => {
    expect(getFAQSchema([])).toBeNull()
  })

  it('emits inLanguage fr-FR + isPartOf #website (Tier 29)', () => {
    const schema = getFAQSchema([{ question: 'Q?', answer: 'A' }])
    expect(schema).not.toBeNull()
    expect(schema!.inLanguage).toBe('fr-FR')
    expect((schema!.isPartOf as { '@id': string })['@id']).toBe(
      'https://servicesartisans.fr#website'
    )
  })

  it('emits inLanguage on each Answer (Tier 29)', () => {
    const schema = getFAQSchema([
      { question: 'Q1?', answer: 'A1' },
      { question: 'Q2?', answer: 'A2' },
    ])
    const mainEntity = schema!.mainEntity as Array<Record<string, unknown>>
    const a1 = mainEntity[0].acceptedAnswer as Record<string, unknown>
    const a2 = mainEntity[1].acceptedAnswer as Record<string, unknown>
    expect(a1.inLanguage).toBe('fr-FR')
    expect(a2.inLanguage).toBe('fr-FR')
  })

  it('returns null for null input', () => {
    expect(getFAQSchema(null as unknown as { question: string; answer: string }[])).toBeNull()
  })
})

// ---------- getHowToSchema ----------
describe('getHowToSchema', () => {
  it('returns HowTo schema with steps', () => {
    const steps = [{ name: 'Step 1', text: 'Do thing' }]
    const schema = getHowToSchema(steps)
    expect(schema).not.toBeNull()
    expect(schema!['@type']).toBe('HowTo')
  })

  it('returns null for empty steps', () => {
    expect(getHowToSchema([])).toBeNull()
  })

  it('includes optional name and description', () => {
    const steps = [{ name: 'Step 1', text: 'Do thing' }]
    const schema = getHowToSchema(steps, { name: 'How to fix', description: 'Guide' })
    expect(schema!.name).toBe('How to fix')
    expect(schema!.description).toBe('Guide')
  })

  it('includes step positions starting at 1', () => {
    const steps = [
      { name: 'A', text: 'First' },
      { name: 'B', text: 'Second' },
    ]
    const schema = getHowToSchema(steps)
    const schemaSteps = schema!.step as Array<Record<string, unknown>>
    expect(schemaSteps[0].position).toBe(1)
    expect(schemaSteps[1].position).toBe(2)
  })
})

// ---------- getAvisHubSchema ----------
describe('getAvisHubSchema', () => {
  it('returns array with CollectionPage and Service', () => {
    const result = getAvisHubSchema({
      serviceName: 'Plomberie',
      serviceSlug: 'plomberie',
      description: 'Avis plomberie',
      url: 'https://servicesartisans.fr/avis/plomberie',
      ratingValue: 4.5,
      reviewCount: 120,
    })
    expect(result).toHaveLength(2)
    expect(result[0]['@type']).toBe('CollectionPage')
    expect(result[1]['@type']).toBe('Service')
  })

  it('includes aggregateRating when rating data is provided', () => {
    const result = getAvisHubSchema({
      serviceName: 'Plomberie',
      serviceSlug: 'plomberie',
      description: 'Desc',
      url: 'https://servicesartisans.fr/avis/plomberie',
      ratingValue: 4.2,
      reviewCount: 50,
    })
    const service = result[1]
    expect(service.aggregateRating).toBeDefined()
    const rating = service.aggregateRating as Record<string, unknown>
    expect(rating['@type']).toBe('AggregateRating')
    expect(rating.ratingValue).toBe(4.2)
    expect(rating.reviewCount).toBe(50)
    expect(rating.bestRating).toBe(5)
    expect(rating.worstRating).toBe(1)
  })

  it('handles 0 reviews gracefully (no aggregateRating)', () => {
    const result = getAvisHubSchema({
      serviceName: 'Plomberie',
      serviceSlug: 'plomberie',
      description: 'Desc',
      url: 'https://servicesartisans.fr/avis/plomberie',
      ratingValue: 0,
      reviewCount: 0,
    })
    expect(result[1].aggregateRating).toBeUndefined()
  })

  it('handles missing rating data gracefully', () => {
    const result = getAvisHubSchema({
      serviceName: 'Plomberie',
      serviceSlug: 'plomberie',
      description: 'Desc',
      url: 'https://servicesartisans.fr/avis/plomberie',
    })
    expect(result[1].aggregateRating).toBeUndefined()
  })

  it('includes review snippets when reviews are provided', () => {
    const result = getAvisHubSchema({
      serviceName: 'Plomberie',
      serviceSlug: 'plomberie',
      description: 'Desc',
      url: 'https://servicesartisans.fr/avis/plomberie',
      reviews: [
        { authorName: 'Jean', rating: 5, comment: 'Excellent', datePublished: '2026-01-01' },
        { authorName: 'Marie', rating: 4, comment: 'Bien', datePublished: '2026-01-02' },
      ],
    })
    const service = result[1]
    expect(service.review).toBeDefined()
    const reviews = service.review as Array<Record<string, unknown>>
    expect(reviews).toHaveLength(2)
    expect((reviews[0].author as Record<string, unknown>).name).toBe('Jean')
  })

  it('limits reviews to max 3', () => {
    const reviews = Array.from({ length: 5 }, (_, i) => ({
      authorName: `User${i}`,
      rating: 4,
      comment: `Comment ${i}`,
      datePublished: '2026-01-01',
    }))
    const result = getAvisHubSchema({
      serviceName: 'Plomberie',
      serviceSlug: 'plomberie',
      description: 'Desc',
      url: 'https://servicesartisans.fr/avis/plomberie',
      reviews,
    })
    const serviceReviews = result[1].review as Array<Record<string, unknown>>
    expect(serviceReviews).toHaveLength(3)
  })

  it('handles empty review list', () => {
    const result = getAvisHubSchema({
      serviceName: 'Plomberie',
      serviceSlug: 'plomberie',
      description: 'Desc',
      url: 'https://servicesartisans.fr/avis/plomberie',
      reviews: [],
    })
    expect(result[1].review).toBeUndefined()
  })

  it('Service has correct @id linking', () => {
    const result = getAvisHubSchema({
      serviceName: 'Plomberie',
      serviceSlug: 'plomberie',
      description: 'Desc',
      url: 'https://servicesartisans.fr/avis/plomberie',
    })
    expect(result[1]['@id']).toBe('https://servicesartisans.fr/avis/plomberie#service')
    const about = result[0].about as Record<string, unknown>
    expect(about['@id']).toBe('https://servicesartisans.fr/avis/plomberie#service')
  })
})

// ---------- getItemListSchema ----------
describe('getItemListSchema', () => {
  it('includes aggregateRating only when reviewCount > 0', () => {
    const schema = getItemListSchema({
      name: 'Top plombiers',
      description: 'List',
      url: '/services/plomberie/paris',
      items: [
        { name: 'Plombier A', url: '/p/a', position: 1, rating: 4.5, reviewCount: 10 },
        { name: 'Plombier B', url: '/p/b', position: 2, rating: 3.0, reviewCount: 0 },
      ],
    })
    const elements = schema.itemListElement as Array<Record<string, unknown>>
    const itemA = elements[0].item as Record<string, unknown>
    const itemB = elements[1].item as Record<string, unknown>
    expect(itemA.aggregateRating).toBeDefined()
    expect(itemB.aggregateRating).toBeUndefined()
  })
})

// ---------- getPlaceSchema ----------
describe('getPlaceSchema', () => {
  it('returns City type with name and url', () => {
    const schema = getPlaceSchema({ name: 'Paris', slug: 'paris' })
    expect(schema['@type']).toBe('City')
    expect(schema.url).toBe('https://servicesartisans.fr/villes/paris')
  })

  it('includes containedInPlace when department/region specified', () => {
    const schema = getPlaceSchema({
      name: 'Lyon',
      slug: 'lyon',
      region: 'Auvergne-Rhone-Alpes',
      department: 'Rhone',
      departmentCode: '69',
    })
    expect(schema.containedInPlace).toBeDefined()
    expect(schema.containedInPlace).toHaveLength(2)
  })

  it('has default description when none provided', () => {
    const schema = getPlaceSchema({ name: 'Paris', slug: 'paris' })
    expect(schema.description).toContain('Paris')
  })
})

// ---------- getCollectionPageSchema ----------
describe('getCollectionPageSchema', () => {
  it('returns CollectionPage type', () => {
    const schema = getCollectionPageSchema({
      name: 'Services',
      description: 'All services',
      url: '/services',
      itemCount: 46,
    })
    expect(schema['@type']).toBe('CollectionPage')
    expect(schema.numberOfItems).toBe(46)
  })
})

// ---------- getServicePricingSchema ----------
describe('getServicePricingSchema', () => {
  it('includes AggregateOffer with price range', () => {
    const schema = getServicePricingSchema({
      serviceName: 'Plomberie',
      serviceSlug: 'plomberie',
      description: 'Tarifs plomberie',
      lowPrice: 50,
      highPrice: 200,
      url: 'https://servicesartisans.fr/tarifs/plomberie',
    })
    expect(schema['@type']).toBe('Service')
    const offers = schema.offers as Record<string, unknown>
    expect(offers.lowPrice).toBe(50)
    expect(offers.highPrice).toBe(200)
    expect(offers.priceCurrency).toBe('EUR')
  })

  it('includes aggregateRating only when reviewCount > 0', () => {
    const withRating = getServicePricingSchema({
      serviceName: 'Plomberie',
      serviceSlug: 'plomberie',
      description: 'Test',
      lowPrice: 50,
      highPrice: 200,
      ratingValue: 4.5,
      reviewCount: 10,
      url: 'https://servicesartisans.fr/tarifs/plomberie',
    })
    expect(withRating.aggregateRating).toBeDefined()

    const withoutRating = getServicePricingSchema({
      serviceName: 'Plomberie',
      serviceSlug: 'plomberie',
      description: 'Test',
      lowPrice: 50,
      highPrice: 200,
      reviewCount: 0,
      url: 'https://servicesartisans.fr/tarifs/plomberie',
    })
    expect(withoutRating.aggregateRating).toBeUndefined()
  })
})

// ---------- getLocalServiceSchema ----------
describe('getLocalServiceSchema', () => {
  it('returns Service with City areaServed', () => {
    const schema = getLocalServiceSchema({
      serviceName: 'Plomberie',
      serviceType: 'plomberie',
      description: 'Plombier a Paris',
      cityName: 'Paris',
      regionName: 'Ile-de-France',
      url: 'https://servicesartisans.fr/services/plomberie/paris',
    })
    expect(schema.name).toBe('Plomberie à Paris')
    const area = schema.areaServed as Record<string, unknown>
    expect(area['@type']).toBe('City')
    expect(area.name).toBe('Paris')
  })

  it('includes department containedInPlace when provided', () => {
    const schema = getLocalServiceSchema({
      serviceName: 'Plomberie',
      serviceType: 'plomberie',
      description: 'Desc',
      cityName: 'Lyon',
      regionName: 'ARA',
      departmentName: 'Rhone',
      url: 'https://servicesartisans.fr/services/plomberie/lyon',
    })
    const area = schema.areaServed as Record<string, unknown>
    expect(area.containedInPlace).toBeDefined()
  })
})

// ---------- getComparisonReviewSchema ----------
describe('getComparisonReviewSchema', () => {
  it('returns Review with positiveNotes and negativeNotes', () => {
    const schema = getComparisonReviewSchema({
      title: 'Chaudiere gaz vs PAC',
      description: 'Comparaison',
      url: 'https://servicesartisans.fr/comparaison/chaudiere-gaz-vs-pac',
      options: [
        { name: 'Gaz', avantages: ['Moins cher'], inconvenients: ['Polluant'] },
        { name: 'PAC', avantages: ['Ecolo'], inconvenients: ['Couteux'] },
      ],
    })
    expect(schema['@type']).toBe('Review')
    expect(schema.positiveNotes).toBeDefined()
    expect(schema.negativeNotes).toBeDefined()
  })

  it('limits notes to 8 items max', () => {
    const options = [
      {
        name: 'A',
        avantages: Array.from({ length: 10 }, (_, i) => `Avantage ${i}`),
        inconvenients: Array.from({ length: 10 }, (_, i) => `Inconvenient ${i}`),
      },
    ]
    const schema = getComparisonReviewSchema({
      title: 'Test',
      description: 'Desc',
      url: '/test',
      options,
    })
    const pos = schema.positiveNotes as Record<string, unknown>
    const posItems = pos.itemListElement as Array<unknown>
    expect(posItems.length).toBeLessThanOrEqual(8)
  })
})

// ---------- getUrgencyServiceSchema ----------
describe('getUrgencyServiceSchema', () => {
  it('returns emergency Service with 7/7 availability', () => {
    const schema = getUrgencyServiceSchema({
      serviceName: 'Plomberie',
      serviceSlug: 'plomberie',
      cityName: 'Paris',
      url: 'https://servicesartisans.fr/urgence/plomberie/paris',
    })
    expect(schema.category).toBe('Emergency Service')
    const hours = schema.hoursAvailable as Record<string, unknown>
    expect(hours.opens).toBe('00:00')
    expect(hours.closes).toBe('23:59')
    const days = hours.dayOfWeek as string[]
    expect(days).toHaveLength(7)
  })

  it('includes offers when prices provided', () => {
    const schema = getUrgencyServiceSchema({
      serviceName: 'Plomberie',
      serviceSlug: 'plomberie',
      cityName: 'Paris',
      url: '/urgence/plomberie/paris',
      lowPrice: 80,
      highPrice: 300,
    })
    expect(schema.offers).toBeDefined()
    expect((schema.offers as Record<string, unknown>).lowPrice).toBe(80)
  })

  it('omits offers when no prices', () => {
    const schema = getUrgencyServiceSchema({
      serviceName: 'Plomberie',
      serviceSlug: 'plomberie',
      cityName: 'Paris',
      url: '/urgence/plomberie/paris',
    })
    expect(schema.offers).toBeUndefined()
  })
})

// ---------- getUrgencyHubServiceSchema ----------
describe('getUrgencyHubServiceSchema', () => {
  it('returns Service with Emergency category and country-wide area', () => {
    const schema = getUrgencyHubServiceSchema({
      serviceName: 'Plomberie',
      serviceSlug: 'plomberie',
      description: 'Urgence plomberie',
      url: '/urgence/plomberie',
    })
    expect(schema['@type']).toBe('Service')
    expect(schema.category).toBe('Emergency Service')
    expect((schema.areaServed as Record<string, unknown>).name).toBe('France')
  })
})

// ---------- getSpeakableSchema ----------
describe('getSpeakableSchema', () => {
  it('returns WebPage with SpeakableSpecification', () => {
    const schema = getSpeakableSchema({
      url: 'https://servicesartisans.fr/test',
      title: 'Test Page',
    })
    expect(schema['@type']).toBe('WebPage')
    const speakable = schema.speakable as Record<string, unknown>
    expect(speakable['@type']).toBe('SpeakableSpecification')
  })

  it('uses default CSS selectors when none provided', () => {
    const schema = getSpeakableSchema({ url: '/test', title: 'Test' })
    const speakable = schema.speakable as Record<string, unknown>
    expect(speakable.cssSelector).toContain('h1')
  })

  it('uses custom CSS selectors when provided', () => {
    const schema = getSpeakableSchema({
      url: '/test',
      title: 'Test',
      speakableCssSelectors: ['.custom'],
    })
    const speakable = schema.speakable as Record<string, unknown>
    expect(speakable.cssSelector).toEqual(['.custom'])
  })
})

// ---------- getInsuranceProductSchema ----------
describe('getInsuranceProductSchema', () => {
  it('returns FinancialProduct with InsuranceProduct additionalType', () => {
    const schema = getInsuranceProductSchema({
      name: 'Assurance decennale',
      description: 'Desc',
      insuranceType: 'decennale',
      url: '/guides/assurance-decennale',
    })
    expect(schema['@type']).toBe('FinancialProduct')
    expect(schema.additionalType).toContain('InsuranceProduct')
  })

  it('includes offers when price range is provided', () => {
    const schema = getInsuranceProductSchema({
      name: 'Assurance decennale',
      description: 'Desc',
      insuranceType: 'decennale',
      url: '/guides/assurance-decennale',
      lowPrice: 500,
      highPrice: 3000,
    })
    expect(schema.offers).toBeDefined()
    expect((schema.offers as Record<string, unknown>).lowPrice).toBe(500)
  })
})

// ---------- getFinancialProductSchema ----------
describe('getFinancialProductSchema', () => {
  it('returns FinancialProduct with correct defaults', () => {
    const schema = getFinancialProductSchema({
      name: 'MaPrimeRenov',
      description: 'Aide renovation',
      url: '/guides/maprimenov',
    })
    expect(schema['@type']).toBe('FinancialProduct')
    expect(schema.category).toBe('Government Grant')
  })

  it('includes optional financial fields', () => {
    const schema = getFinancialProductSchema({
      name: 'Eco-PTZ',
      description: 'Pret taux zero',
      url: '/guides/eco-ptz',
      annualPercentageRate: 0,
      interestRate: 0,
      amount: '50000',
    })
    expect(schema.annualPercentageRate).toBe(0)
    expect(schema.interestRate).toBe(0)
    expect(schema.amount).toBe('50000')
  })
})

// ---------- getGovernmentServiceSchema ----------
describe('getGovernmentServiceSchema', () => {
  it('returns GovernmentService type with required fields', () => {
    const schema = getGovernmentServiceSchema({
      name: 'CEE',
      description: "Certificats d'économies d'énergie",
      url: 'https://servicesartisans.fr/cee',
    })
    expect(schema['@type']).toBe('GovernmentService')
    expect(schema.name).toBe('CEE')
    expect(schema.url).toBe('https://servicesartisans.fr/cee')
  })

  it('defaults serviceOperator to DGEC when not provided', () => {
    const schema = getGovernmentServiceSchema({
      name: 'CEE',
      description: 'Desc',
      url: '/cee',
    })
    const operator = schema.serviceOperator as Record<string, unknown>
    expect(operator['@type']).toBe('GovernmentOrganization')
    expect(operator.name).toContain('DGEC')
  })

  it('defaults serviceType to Financial Assistance', () => {
    const schema = getGovernmentServiceSchema({
      name: 'CEE',
      description: 'Desc',
      url: '/cee',
    })
    expect(schema.serviceType).toBe('Financial Assistance')
  })

  it('includes temporalCoverage when provided (P6 2026-2030)', () => {
    const schema = getGovernmentServiceSchema({
      name: 'CEE',
      description: 'Desc',
      url: '/cee',
      temporalCoverage: '2026-01-01/2030-12-31',
    })
    expect(schema.temporalCoverage).toBe('2026-01-01/2030-12-31')
  })

  it('includes sameAs with official authorities when provided', () => {
    const schema = getGovernmentServiceSchema({
      name: 'CEE',
      description: 'Desc',
      url: '/cee',
      sameAs: [
        'https://www.ecologie.gouv.fr/politiques-publiques/certificats-deconomies-denergie',
        'https://www.service-public.fr/particuliers/vosdroits/F342',
      ],
    })
    expect(schema.sameAs).toHaveLength(2)
  })

  it('omits sameAs when not provided', () => {
    const schema = getGovernmentServiceSchema({
      name: 'CEE',
      description: 'Desc',
      url: '/cee',
    })
    expect(schema.sameAs).toBeUndefined()
  })

  it('includes audience as Audience object when provided', () => {
    const schema = getGovernmentServiceSchema({
      name: 'CEE',
      description: 'Desc',
      url: '/cee',
      audience: 'Propriétaires en France',
    })
    expect(schema.audience).toBeDefined()
    const audience = schema.audience as Record<string, unknown>
    expect(audience['@type']).toBe('Audience')
    expect(audience.audienceType).toBe('Propriétaires en France')
  })

  it('sets areaServed to France', () => {
    const schema = getGovernmentServiceSchema({
      name: 'CEE',
      description: 'Desc',
      url: '/cee',
    })
    const area = schema.areaServed as Record<string, unknown>
    expect(area['@type']).toBe('Country')
    expect(area.name).toBe('France')
  })
})

// ---------- getLoanOrCreditSchema ----------
describe('getLoanOrCreditSchema', () => {
  it('returns LoanOrCredit type', () => {
    const schema = getLoanOrCreditSchema({
      name: 'Eco-PTZ',
      description: 'Pret a taux zero',
      url: '/guides/eco-ptz',
      annualPercentageRate: 0,
    })
    expect(schema['@type']).toBe('LoanOrCredit')
    expect(schema.annualPercentageRate).toBe(0)
    expect(schema.currency).toBe('EUR')
  })
})

// ---------- getDetailedPricingSchema ----------
describe('getDetailedPricingSchema', () => {
  it('returns Service with OfferCatalog for tasks', () => {
    const schema = getDetailedPricingSchema({
      serviceName: 'Plomberie',
      serviceSlug: 'plomberie',
      description: 'Tarifs',
      url: '/tarifs/plomberie',
      tasks: [
        { name: 'Debouchage', lowPrice: 80, highPrice: 200 },
        { name: 'Fuite', lowPrice: 60, highPrice: 150 },
      ],
      overallLowPrice: 60,
      overallHighPrice: 200,
    })
    expect(schema.hasOfferCatalog).toBeDefined()
    const catalog = schema.hasOfferCatalog as Record<string, unknown>
    const items = catalog.itemListElement as Array<Record<string, unknown>>
    expect(items).toHaveLength(2)
  })
})

// ---------- getEnrichedLocalServiceSchema ----------
describe('getEnrichedLocalServiceSchema', () => {
  it('includes aggregateRating only when valid', () => {
    const withRating = getEnrichedLocalServiceSchema({
      serviceName: 'Plomberie',
      serviceType: 'plomberie',
      description: 'Desc',
      cityName: 'Paris',
      regionName: 'IDF',
      url: '/services/plomberie/paris',
      ratingValue: 4.3,
      reviewCount: 25,
    })
    expect(withRating.aggregateRating).toBeDefined()
    const agg = withRating.aggregateRating as Record<string, unknown>
    expect(agg.ratingValue).toBe(4.3)

    const withoutRating = getEnrichedLocalServiceSchema({
      serviceName: 'Plomberie',
      serviceType: 'plomberie',
      description: 'Desc',
      cityName: 'Paris',
      regionName: 'IDF',
      url: '/services/plomberie/paris',
      ratingValue: 0,
      reviewCount: 0,
    })
    expect(withoutRating.aggregateRating).toBeUndefined()
  })
})

// ---------- getPersonSchema ----------
describe('getPersonSchema', () => {
  it('returns Person type with defensible E-E-A-T signals', () => {
    const schema = getPersonSchema({
      name: 'Jean Dupont',
      slug: 'jean-dupont',
      role: 'Rédacteur spécialisé plomberie',
      bio: 'Bio text',
      expertise: ['Plomberie', 'Chauffage'],
      yearsExperience: 15,
    })
    expect(schema['@type']).toBe('Person')
    expect(schema.name).toBe('Jean Dupont')
    expect(schema.knowsAbout).toEqual(['Plomberie', 'Chauffage'])
    expect(schema.worksFor).toBeDefined()
  })

  it('never emits hasCredential for editorial staff (fraud prevention)', () => {
    // Staff writers are not RGE/Qualibat/Qualifelec/OPQTECC certified ;
    // those credentials belong to the artisans they cite. The schema
    // must not claim them on the Person node.
    const schema = getPersonSchema({
      name: 'Marie Martin',
      slug: 'marie-martin',
      role: 'Rédactrice',
      bio: 'Bio',
      expertise: [],
      yearsExperience: 0,
    })
    expect('hasCredential' in schema).toBe(false)
    expect('hasOccupation' in schema).toBe(false)
  })

  it('never emits sameAs (no fake LinkedIn profiles for staff writers)', () => {
    const schema = getPersonSchema({
      name: 'Jean',
      slug: 'jean',
      role: 'Rédacteur',
      bio: 'Bio',
      expertise: [],
      yearsExperience: 5,
    })
    expect('sameAs' in schema).toBe(false)
  })

  it('emits mainEntityOfPage pointing to /equipe/[slug]#profile (Tier 25)', () => {
    const schema = getPersonSchema({
      name: 'Jean Dupont',
      slug: 'jean-dupont',
      role: 'Rédacteur',
      bio: 'Bio',
      expertise: [],
      yearsExperience: 5,
    })
    expect(schema.mainEntityOfPage).toEqual({
      '@type': 'ProfilePage',
      '@id': expect.stringMatching(/\/equipe\/jean-dupont#profile$/),
    })
  })
})

// ---------- getReviewedByPersonSchema ----------
describe('getReviewedByPersonSchema', () => {
  it('emits Person ref with @id, name, jobTitle, url + Org affiliation (Tier 25)', () => {
    const reviewer = getReviewedByPersonSchema({
      slug: 'claire-dubois',
      name: 'Claire Dubois',
      role: 'Rédactrice spécialisée',
    })
    expect(reviewer['@type']).toBe('Person')
    expect(reviewer['@id']).toMatch(/\/equipe\/claire-dubois#person$/)
    expect(reviewer.name).toBe('Claire Dubois')
    expect(reviewer.jobTitle).toBe('Rédactrice spécialisée')
    expect(reviewer.affiliation).toBeDefined()
    expect((reviewer.affiliation as { '@type': string })['@type']).toBe('Organization')
  })
})
