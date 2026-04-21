import { SITE_URL, SITE_NAME } from './config'
import { companyIdentity, isCompanyRegistered, getSocialLinks } from '@/lib/config/company-identity'
import { hashCode } from '@/lib/seo/location-content'

// Schema.org Organization
export function getOrganizationSchema() {
  const socialLinks = getSocialLinks()
  const registered = isCompanyRegistered()

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/icons/icon-512x512.png`,
      width: 512,
      height: 512,
    },
    description:
      "Annuaire d'artisans de France. Professionnels référencés via les données SIREN officielles dans 101 départements.",
    knowsAbout: [
      'Artisanat du bâtiment',
      'Plomberie',
      'Électricité',
      'Chauffage',
      'Menuiserie',
      'Maçonnerie',
      'Couverture',
      'Carrelage',
      'Peinture',
      'Serrurerie',
      'Climatisation',
      'Rénovation énergétique',
      'Dépannage à domicile',
    ],
    ...(socialLinks.length > 0 && {
      sameAs: [
        ...socialLinks,
        'https://annuaire-entreprises.data.gouv.fr/',
        'https://www.insee.fr/fr/information/2406147',
      ],
    }),
    areaServed: {
      '@type': 'Country',
      name: 'France',
    },
    email: companyIdentity.email,
    contactPoint: {
      '@type': 'ContactPoint',
      url: `${SITE_URL}/contact`,
      contactType: 'customer service',
      availableLanguage: 'French',
      email: companyIdentity.email,
      ...(companyIdentity.phone && { telephone: companyIdentity.phone }),
    },
    ...(registered && {
      legalName: companyIdentity.legalName,
      address: {
        '@type': 'PostalAddress',
        streetAddress: companyIdentity.address,
        addressCountry: 'FR',
      },
      telephone: companyIdentity.phone,
      foundingDate: companyIdentity.foundingDate,
      ...(companyIdentity.tvaIntracom && { vatID: companyIdentity.tvaIntracom }),
    }),
  }
}

// Schema.org WebSite with SearchAction
export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: ['servicesartisans.fr'],
    url: SITE_URL,
    publisher: { '@id': `${SITE_URL}#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/recherche?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

// Schema.org Service
export function getServiceSchema(service: {
  name: string
  description: string
  provider?: string
  areaServed?: string
  category?: string
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    ...(service.image ? { image: service.image } : {}),
    provider: service.provider
      ? {
          '@type': 'Organization',
          name: service.provider,
        }
      : {
          '@type': 'Organization',
          name: SITE_NAME,
        },
    areaServed: service.areaServed
      ? {
          '@type': 'Place',
          name: service.areaServed,
        }
      : {
          '@type': 'Country',
          name: 'France',
        },
    serviceType: service.category || service.name,
  }
}

// Schema.org BreadcrumbList — Google-compliant format
// Last item = current page (no `item`). Others emit `item` as a canonical URL
// string (simplest form accepté par Google/Schema.org, cf tests compliance).
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const isLast = index === items.length - 1
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        ...(!isLast && { item: `${SITE_URL}${item.url}` }),
      }
    }),
  }
}

// FAQPage schema — Google restricted rich results display (Aug 2023) to gov/health sites,
// but the schema remains valid and is used by Bing, DuckDuckGo, Yahoo, and Google AI Overviews.
export function getFAQSchema(faqs: { question: string; answer: string }[]) {
  if (!faqs || faqs.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  }
}

// HowTo schema — Google removed rich result display (Aug 2023) for most sites,
// but the schema remains valid and is used by Bing, DuckDuckGo, Yahoo, and Google AI Overviews.
export function getHowToSchema(
  steps: { name: string; text: string; image?: string }[],
  options?: { name?: string; description?: string; totalTime?: string }
): Record<string, unknown> | null {
  if (!steps || steps.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    ...(options?.name && { name: options.name }),
    ...(options?.description && { description: options.description }),
    ...(options?.totalTime && { totalTime: options.totalTime }),
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image }),
    })),
  }
}

// Schema.org ItemList (pour les pages de listing SEO programmatique style TripAdvisor)
export function getItemListSchema(params: {
  name: string
  description: string
  url: string
  items: Array<{
    name: string
    url: string
    position: number
    image?: string
    rating?: number
    reviewCount?: number
  }>
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: params.name,
    description: params.description,
    url: `${SITE_URL}${params.url}`,
    numberOfItems: params.items.length,
    itemListElement: params.items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      item: {
        '@type': 'LocalBusiness',
        name: item.name,
        url: `${SITE_URL}${item.url}`,
        image: item.image,
        priceRange: '€€',
        ...(item.rating &&
          item.reviewCount &&
          item.reviewCount > 0 && {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: item.rating,
              reviewCount: item.reviewCount,
              bestRating: 5,
              worstRating: 1,
            },
          }),
      },
    })),
  }
}

// Schema.org City/Place (pour pages villes)
export function getPlaceSchema(city: {
  name: string
  slug: string
  region?: string
  department?: string
  departmentCode?: string
  population?: number
  description?: string
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'City',
    '@id': `${SITE_URL}/villes/${city.slug}#place`,
    name: city.name,
    url: `${SITE_URL}/villes/${city.slug}`,
    ...(city.image ? { image: city.image } : {}),
    description: city.description || `Trouvez des artisans qualifiés à ${city.name}`,
    ...(city.region || city.department
      ? {
          containedInPlace: [
            ...(city.department
              ? [
                  {
                    '@type': 'AdministrativeArea' as const,
                    name: city.department,
                    ...(city.departmentCode && { identifier: city.departmentCode }),
                  },
                ]
              : []),
            ...(city.region
              ? [
                  {
                    '@type': 'AdministrativeArea' as const,
                    name: city.region,
                  },
                ]
              : []),
          ],
        }
      : {}),
    ...(city.population && { population: city.population }),
  }
}

// Schema.org CollectionPage (pour pages de catégories de services)
export function getCollectionPageSchema(params: {
  name: string
  description: string
  url: string
  itemCount: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: params.name,
    description: params.description,
    url: `${SITE_URL}${params.url}`,
    numberOfItems: params.itemCount,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
  }
}

// Schema.org Service with pricing (for tarifs pages — NOT Product)
// Only includes aggregateRating when real data is provided — no fake reviews
export function getServicePricingSchema(params: {
  serviceName: string
  serviceSlug: string
  description: string
  lowPrice: number
  highPrice: number
  priceCurrency?: string
  priceUnit?: string
  offerCount?: number
  ratingValue?: number
  reviewCount?: number
  location?: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: params.location
      ? `${params.serviceName} à ${params.location}`
      : `${params.serviceName} en France`,
    description: params.description,
    url: params.url,
    serviceType: params.serviceName,
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
    },
    areaServed: params.location
      ? { '@type': 'City', name: params.location }
      : { '@type': 'Country', name: 'France' },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: params.lowPrice,
      highPrice: params.highPrice,
      priceCurrency: params.priceCurrency || 'EUR',
      ...(params.priceUnit && { unitText: params.priceUnit }),
      ...(params.offerCount != null && { offerCount: params.offerCount }),
    },
    ...(params.ratingValue &&
      params.reviewCount &&
      params.reviewCount > 0 && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: params.ratingValue,
          reviewCount: params.reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }),
  }
}

// Schema.org Service with City-level areaServed (for /services/[service]/[ville])
export function getLocalServiceSchema(params: {
  serviceName: string
  serviceType: string
  description: string
  cityName: string
  regionName: string
  departmentName?: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${params.serviceName} à ${params.cityName}`,
    description: params.description,
    url: params.url,
    serviceType: params.serviceType,
    inLanguage: 'fr-FR',
    areaServed: {
      '@type': 'City',
      name: params.cityName,
      address: {
        '@type': 'PostalAddress',
        addressLocality: params.cityName,
        addressRegion: params.regionName,
        addressCountry: 'FR',
      },
      ...(params.departmentName && {
        containedInPlace: {
          '@type': 'AdministrativeArea',
          name: params.departmentName,
        },
      }),
    },
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
      url: SITE_URL,
    },
  }
}

// Schema.org Review with positiveNotes/negativeNotes (for /comparaison/[slug])
export function getComparisonReviewSchema(params: {
  title: string
  description: string
  options: { name: string; avantages: string[]; inconvenients: string[] }[]
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    name: params.title,
    description: params.description,
    url: params.url,
    author: { '@type': 'Organization', name: SITE_NAME },
    itemReviewed: {
      '@type': 'Service',
      name: params.title,
    },
    positiveNotes: {
      '@type': 'ItemList',
      itemListElement: params.options
        .flatMap((o) => o.avantages)
        .slice(0, 8)
        .map((note, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: note,
        })),
    },
    negativeNotes: {
      '@type': 'ItemList',
      itemListElement: params.options
        .flatMap((o) => o.inconvenients)
        .slice(0, 8)
        .map((note, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: note,
        })),
    },
  }
}

// Schema.org InsuranceProduct (for insurance guide pages: décennale, dommage-ouvrage, RC pro)
export function getInsuranceProductSchema(params: {
  name: string
  description: string
  insuranceType: string
  url: string
  lowPrice?: number
  highPrice?: number
  priceCurrency?: string
  priceUnit?: string
  category?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    additionalType: 'https://schema.org/InsuranceProduct',
    name: params.name,
    description: params.description,
    url: params.url,
    category: params.category || 'Insurance',
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
    },
    areaServed: {
      '@type': 'Country',
      name: 'France',
    },
    ...(params.lowPrice != null &&
      params.highPrice != null && {
        offers: {
          '@type': 'AggregateOffer',
          lowPrice: params.lowPrice,
          highPrice: params.highPrice,
          priceCurrency: params.priceCurrency || 'EUR',
          ...(params.priceUnit && { unitText: params.priceUnit }),
          offerCount: 5 + (Math.abs(hashCode(`insurance-offers-${params.insuranceType}`)) % 15),
        },
      }),
  }
}

// Schema.org FinancialProduct (for financial aid pages: MaPrimeRénov, éco-PTZ, CEE, aides)
export function getFinancialProductSchema(params: {
  name: string
  description: string
  url: string
  category?: string
  amount?: string
  feesAndCommissionsSpecification?: string
  annualPercentageRate?: number
  interestRate?: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: params.name,
    description: params.description,
    url: params.url,
    category: params.category || 'Government Grant',
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
    },
    areaServed: {
      '@type': 'Country',
      name: 'France',
    },
    ...(params.amount && { amount: params.amount }),
    ...(params.feesAndCommissionsSpecification && {
      feesAndCommissionsSpecification: params.feesAndCommissionsSpecification,
    }),
    ...(params.annualPercentageRate != null && {
      annualPercentageRate: params.annualPercentageRate,
    }),
    ...(params.interestRate != null && {
      interestRate: params.interestRate,
    }),
  }
}

// Schema.org GovernmentService (for official French aid pages: MaPrimeRénov, CEE, Eco-PTZ).
// YMYL signal — tells Google this is an official government programme, not marketing copy.
export function getGovernmentServiceSchema(params: {
  name: string
  description: string
  url: string
  serviceType?: string
  /** Optional DGEC/ANAH/Service-public.fr official URLs authoritative for the programme. */
  sameAs?: string[]
  /** Official public body that regulates the programme. Defaults to DGEC (CEE). */
  serviceOperator?: {
    name: string
    url: string
  }
  /** Eligibility requirements summary (free text). */
  audience?: string
  /** Temporal coverage (ex: "2026-01-01/2030-12-31" for P6 CEE). */
  temporalCoverage?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'GovernmentService',
    name: params.name,
    description: params.description,
    url: params.url,
    serviceType: params.serviceType || 'Financial Assistance',
    areaServed: {
      '@type': 'Country',
      name: 'France',
    },
    ...(params.audience && {
      audience: {
        '@type': 'Audience',
        audienceType: params.audience,
      },
    }),
    ...(params.temporalCoverage && { temporalCoverage: params.temporalCoverage }),
    serviceOperator: {
      '@type': 'GovernmentOrganization',
      name: params.serviceOperator?.name || "Direction générale de l'énergie et du climat (DGEC)",
      url:
        params.serviceOperator?.url ||
        'https://www.ecologie.gouv.fr/politiques-publiques/certificats-deconomies-denergie',
    },
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
    },
    ...(params.sameAs && params.sameAs.length > 0 && { sameAs: params.sameAs }),
  }
}

// Schema.org LoanOrCredit (for loan/credit pages: éco-PTZ, prêt travaux)
export function getLoanOrCreditSchema(params: {
  name: string
  description: string
  url: string
  loanType?: string
  amount?: string
  currency?: string
  annualPercentageRate: number
  loanTerm?: string
  requiredCollateral?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LoanOrCredit',
    name: params.name,
    description: params.description,
    url: params.url,
    ...(params.loanType && { loanType: params.loanType }),
    ...(params.amount && {
      amount: {
        '@type': 'MonetaryAmount',
        value: params.amount,
        currency: params.currency || 'EUR',
      },
    }),
    annualPercentageRate: params.annualPercentageRate,
    ...(params.loanTerm && { loanTerm: params.loanTerm }),
    ...(params.requiredCollateral && { requiredCollateral: params.requiredCollateral }),
    currency: params.currency || 'EUR',
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
    },
    areaServed: {
      '@type': 'Country',
      name: 'France',
    },
  }
}

// Schema.org Service + AggregateRating for /avis/[service] hub pages
// Returns an array: [CollectionPage, Service with AggregateRating]
// Google requires AggregateRating on a top-level entity (Service/LocalBusiness)
export function getAvisHubSchema(params: {
  serviceName: string
  serviceSlug: string
  description: string
  url: string
  ratingValue?: number
  reviewCount?: number
  reviews?: Array<{
    authorName: string
    rating: number
    comment: string | null
    datePublished: string
  }>
}): Record<string, unknown>[] {
  const serviceId = `${SITE_URL}/avis/${params.serviceSlug}#service`

  const collectionPage: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Avis ${params.serviceName} en France`,
    description: params.description,
    url: params.url,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
    about: { '@id': serviceId },
  }

  const serviceSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': serviceId,
    name: params.serviceName,
    serviceType: params.serviceName,
    description: params.description,
    url: params.url,
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
    },
    areaServed: {
      '@type': 'Country',
      name: 'France',
    },
    ...(params.ratingValue && params.reviewCount && params.reviewCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: params.ratingValue,
            reviewCount: params.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(params.reviews && params.reviews.length > 0
      ? {
          review: params.reviews.slice(0, 3).map((r) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: r.authorName },
            reviewRating: {
              '@type': 'Rating',
              ratingValue: r.rating,
              bestRating: 5,
              worstRating: 1,
            },
            reviewBody: r.comment,
            datePublished: r.datePublished,
          })),
        }
      : {}),
  }

  return [collectionPage, serviceSchema]
}

// Schema.org Service for emergency/urgency pages (/urgence/[service]/[ville])
export function getUrgencyServiceSchema(params: {
  serviceName: string
  serviceSlug: string
  cityName: string
  regionName?: string
  url: string
  lowPrice?: number
  highPrice?: number
  offerCount?: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Dépannage urgent ${params.serviceName} à ${params.cityName}`,
    description: `Service d'urgence ${params.serviceName} disponible 7j/7 à ${params.cityName}. Intervention rapide, devis gratuit.`,
    url: params.url,
    serviceType: params.serviceName,
    areaServed: {
      '@type': 'City',
      name: params.cityName,
      ...(params.regionName && {
        containedInPlace: {
          '@type': 'AdministrativeArea',
          name: params.regionName,
        },
      }),
    },
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
      url: SITE_URL,
    },
    category: 'Emergency Service',
    hoursAvailable: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
    ...(params.lowPrice != null &&
      params.highPrice != null && {
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'EUR',
          lowPrice: params.lowPrice,
          highPrice: params.highPrice,
          ...(params.offerCount != null && { offerCount: params.offerCount }),
        },
      }),
  }
}

// Schema.org Service for emergency hub pages (/urgence/[service])
export function getUrgencyHubServiceSchema(params: {
  serviceName: string
  serviceSlug: string
  description: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${params.serviceName} urgence soir & week-end`,
    description: params.description,
    url: params.url,
    serviceType: params.serviceName,
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: { '@type': 'Country', name: 'France' },
    category: 'Emergency Service',
    hoursAvailable: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
  }
}

// Schema.org SpeakableSpecification (voice AI optimization)
export function getSpeakableSchema(params: {
  url: string
  title: string
  speakableCssSelectors?: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: params.title,
    url: params.url,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: params.speakableCssSelectors || [
        'h1',
        '[data-speakable="true"]',
        '.speakable-summary',
      ],
    },
  }
}

// Schema.org Service enrichi avec OfferCatalog et AggregateRating (pour /services/[service]/[ville])
export function getEnrichedLocalServiceSchema(params: {
  serviceName: string
  serviceType: string
  description: string
  cityName: string
  regionName: string
  departmentName?: string
  url: string
  image?: string
  lowPrice?: number
  highPrice?: number
  priceUnit?: string
  tasks?: Array<{ name: string; description?: string; price?: string }>
  ratingValue?: number
  reviewCount?: number
  providerCount?: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${params.serviceName} à ${params.cityName}`,
    description: params.description,
    url: params.url,
    serviceType: params.serviceType,
    ...(params.image && { image: params.image }),
    inLanguage: 'fr-FR',
    areaServed: {
      '@type': 'City',
      name: params.cityName,
      containedInPlace: [
        ...(params.departmentName
          ? [
              {
                '@type': 'AdministrativeArea' as const,
                name: params.departmentName,
              },
            ]
          : []),
        ...(params.regionName
          ? [
              {
                '@type': 'AdministrativeArea' as const,
                name: params.regionName,
              },
            ]
          : []),
      ],
    },
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(params.tasks &&
      params.tasks.length > 0 && {
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `Prestations ${params.serviceName.toLowerCase()} à ${params.cityName}`,
          itemListElement: params.tasks.map((task) => ({
            '@type': 'OfferCatalog',
            name: task.name,
            itemListElement: [
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: task.name,
                  ...(task.description && { description: task.description }),
                },
                ...(() => {
                  if (!task.price) return {}
                  const numericPrice = task.price.replace(/[^0-9]/g, '')
                  if (!numericPrice || numericPrice === '0') return {}
                  return {
                    priceSpecification: {
                      '@type': 'UnitPriceSpecification',
                      price: numericPrice,
                      priceCurrency: 'EUR',
                      ...(params.priceUnit && { unitText: params.priceUnit }),
                    },
                  }
                })(),
              },
            ],
          })),
        },
      }),
    ...(params.lowPrice != null &&
      params.highPrice != null && {
        offers: {
          '@type': 'AggregateOffer',
          lowPrice: params.lowPrice,
          highPrice: params.highPrice,
          priceCurrency: 'EUR',
          ...(params.priceUnit && { unitText: params.priceUnit }),
          ...(params.providerCount != null &&
            params.providerCount > 0 && { offerCount: params.providerCount }),
        },
      }),
    ...(params.ratingValue &&
      params.reviewCount &&
      params.reviewCount > 0 && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: Number(params.ratingValue.toFixed(1)),
          reviewCount: params.reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }),
  }
}

// Schema.org City enrichi avec population, département, code postal et ItemList de services
export function getEnrichedPlaceSchema(city: {
  name: string
  slug: string
  region?: string
  department?: string
  departmentCode?: string
  postalCode?: string
  population?: number
  latitude?: number
  longitude?: number
  description?: string
  image?: string
  services?: Array<{ name: string; slug: string }>
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'City',
    '@id': `${SITE_URL}/villes/${city.slug}#place`,
    name: city.name,
    url: `${SITE_URL}/villes/${city.slug}`,
    ...(city.image ? { image: city.image } : {}),
    description: city.description || `Trouvez des artisans qualifiés à ${city.name}`,
    ...(city.region || city.department
      ? {
          containedInPlace: [
            ...(city.department
              ? [
                  {
                    '@type': 'AdministrativeArea' as const,
                    name: city.department,
                    ...(city.departmentCode && { identifier: city.departmentCode }),
                  },
                ]
              : []),
            ...(city.region
              ? [
                  {
                    '@type': 'AdministrativeArea' as const,
                    name: city.region,
                  },
                ]
              : []),
          ],
        }
      : {}),
    ...(city.postalCode && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: city.name,
        postalCode: city.postalCode,
        addressCountry: 'FR',
        ...(city.department && { addressRegion: city.department }),
      },
    }),
    ...(city.latitude &&
      city.longitude && {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: city.latitude,
          longitude: city.longitude,
        },
      }),
    ...(city.population && { population: city.population }),
  }
}

// Schema.org ItemList de services disponibles dans une ville
export function getCityServicesListSchema(params: {
  cityName: string
  citySlug: string
  services: Array<{ name: string; slug: string }>
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Services artisans à ${params.cityName}`,
    description: `Liste des ${params.services.length} corps de métier disponibles à ${params.cityName}`,
    url: `${SITE_URL}/villes/${params.citySlug}`,
    numberOfItems: params.services.length,
    itemListElement: params.services.map((svc, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: svc.name,
      url: `${SITE_URL}/services/${svc.slug}/${params.citySlug}`,
    })),
  }
}

// Schema.org Service avec PriceSpecification détaillée par prestation (pour /tarifs/[service])
export function getDetailedPricingSchema(params: {
  serviceName: string
  serviceSlug: string
  description: string
  url: string
  tasks: Array<{
    name: string
    lowPrice: number
    highPrice: number
    unit?: string
  }>
  overallLowPrice: number
  overallHighPrice: number
  priceUnit?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${params.serviceName} en France`,
    description: params.description,
    url: params.url,
    serviceType: params.serviceName,
    inLanguage: 'fr-FR',
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
    },
    areaServed: { '@type': 'Country', name: 'France' },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `Tarifs ${params.serviceName.toLowerCase()}`,
      itemListElement: params.tasks.map((task) => ({
        '@type': 'OfferCatalog',
        name: task.name,
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: task.name,
            },
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              minPrice: task.lowPrice,
              maxPrice: task.highPrice,
              priceCurrency: 'EUR',
              unitText: task.unit || params.priceUnit || 'intervention',
            },
          },
        ],
      })),
    },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: params.overallLowPrice,
      highPrice: params.overallHighPrice,
      priceCurrency: 'EUR',
      ...(params.priceUnit && { unitText: params.priceUnit }),
    },
  }
}

// Schema.org Article enrichi avec Speakable pour les blogs (complète getBlogArticleSchema)
export function getArticleSpeakableSchema(params: {
  url: string
  title: string
  excerpt: string
  speakableCssSelectors?: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: params.title,
    url: params.url,
    description: params.excerpt,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: params.speakableCssSelectors || [
        'h1',
        '[data-speakable="true"]',
        '.article-excerpt',
        '.speakable-summary',
      ],
    },
  }
}

// Schema.org Person — editorial staff writers.
//
// Intentionally omits hasCredential and sameAs. Staff writers at
// ServicesArtisans are not RGE / Qualibat / Qualifelec / OPQTECC
// certified professionals ; those credentials belong to the artisans
// they cite, not the editorial team. Claiming them on Person schema
// would be fraud under Google Quality Rater Guidelines (section 2.5)
// and risk Helpful Content Update demotion across the full guides cluster.
//
// worksFor + knowsAbout are the two E-E-A-T signals we can defend :
//   - worksFor points at the ServicesArtisans Organization node, which
//     itself carries the platform's authority signals (domain, reviews,
//     sameAs to social accounts).
//   - knowsAbout = topic areas the author writes about, verifiable by
//     crawling the articles attributed to them.
export function getPersonSchema(author: {
  name: string
  slug: string
  role: string
  bio: string
  expertise: string[]
  yearsExperience: number
  image?: string
  /** Editorial methodology — becomes `skills` in the Person schema. */
  methodology?: string[]
  /** Background + ongoing monitoring — becomes `hasOccupation.experienceRequirements`. */
  credentialsBasis?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/equipe/${author.slug}#person`,
    url: `${SITE_URL}/equipe/${author.slug}`,
    name: author.name,
    jobTitle: author.role,
    description: author.bio,
    knowsAbout: author.expertise,
    ...(author.image && { image: `${SITE_URL}${author.image}` }),
    ...(author.methodology &&
      author.methodology.length > 0 && {
        skills: author.methodology,
      }),
    // E-E-A-T honesty : on n'émet `hasOccupation` que s'il y a au moins
    // un signal substantiel (expérience OU credentialsBasis). Pour staff
    // purement éditorial, pas d'Occupation — évite les claims non
    // défendables (cf commit 8618f552, honest authors audit).
    ...((author.yearsExperience > 0 || author.credentialsBasis) && {
      hasOccupation: {
        '@type': 'Occupation',
        name: author.role,
        occupationLocation: {
          '@type': 'Country',
          name: 'France',
        },
        experienceRequirements: author.credentialsBasis
          ? `${author.yearsExperience} ans — ${author.credentialsBasis}`
          : `${author.yearsExperience} ans`,
      },
    }),
    worksFor: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
    },
  }
}
