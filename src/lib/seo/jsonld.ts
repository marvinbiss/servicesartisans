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
    description: 'Annuaire d\'artisans de France. Professionnels référencés via les données SIREN officielles dans 101 départements.',
    ...(socialLinks.length > 0 && { sameAs: socialLinks }),
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
// Last item = current page (no `item`), others use WebPage object with @id
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
        ...(!isLast && {
          item: `${SITE_URL}${item.url}`,
        }),
      }
    }),
  }
}

// FAQPage schema — DEPRECATED by Google (Aug 2023) for non-governmental/non-health sites.
// Kept as no-op stub so existing callers don't break. Returns null → schemas skip it.
export function getFAQSchema(_faqs: { question: string; answer: string }[]): null {
  return null
}

// HowTo schema — DEPRECATED by Google (Aug 2023) for non-governmental/non-health sites.
// Kept as no-op stub so existing callers don't break. Returns null → schemas skip it.
export function getHowToSchema(
  _steps: { name: string; text: string; image?: string }[],
  _options?: { name?: string; description?: string; totalTime?: string }
): null {
  return null
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
        ...(item.rating && item.reviewCount && item.reviewCount > 0 && {
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
  description?: string
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'City',
    name: city.name,
    url: `${SITE_URL}/villes/${city.slug}`,
    ...(city.image ? { image: city.image } : {}),
    description: city.description || `Trouvez des artisans qualifiés à ${city.name}`,
    ...(city.region ? {
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: city.region,
      },
    } : {}),
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
  review?: {
    authorName: string
    rating: number
    comment: string
  }
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
    ...(params.ratingValue && params.reviewCount && params.reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: params.ratingValue,
        reviewCount: params.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(params.review && {
      review: {
        '@type': 'Review',
        author: { '@type': 'Person', name: params.review.authorName },
        reviewRating: { '@type': 'Rating', ratingValue: params.review.rating, bestRating: 5, worstRating: 1 },
        reviewBody: params.review.comment,
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
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${params.serviceName} à ${params.cityName}`,
    description: params.description,
    url: params.url,
    serviceType: params.serviceType,
    areaServed: {
      '@type': 'City',
      name: params.cityName,
      address: {
        '@type': 'PostalAddress',
        addressLocality: params.cityName,
        addressRegion: params.regionName,
        addressCountry: 'FR',
      },
    },
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  }
}

// Schema.org Service with AggregateRating (for /avis/[service]/[ville])
export function getServiceRatingSchema(params: {
  serviceName: string
  cityName: string
  ratingValue: number
  reviewCount: number
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${params.serviceName} à ${params.cityName}`,
    url: params.url,
    provider: { '@type': 'Organization', name: SITE_NAME },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: params.ratingValue,
      reviewCount: params.reviewCount,
      bestRating: 5,
      worstRating: 1,
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
      itemListElement: params.options.flatMap(o => o.avantages).slice(0, 8).map((note, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: note,
      })),
    },
    negativeNotes: {
      '@type': 'ItemList',
      itemListElement: params.options.flatMap(o => o.inconvenients).slice(0, 8).map((note, i) => ({
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
    ...(params.lowPrice != null && params.highPrice != null && {
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: params.lowPrice,
        highPrice: params.highPrice,
        priceCurrency: params.priceCurrency || 'EUR',
        ...(params.priceUnit && { unitText: params.priceUnit }),
        offerCount: 5 + Math.abs(hashCode(`insurance-offers-${params.insuranceType}`)) % 15,
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

// Schema.org CollectionPage + AggregateRating (for /avis/[service] hub pages)
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
}) {
  return {
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
    about: {
      '@type': 'Service',
      name: params.serviceName,
      serviceType: params.serviceName,
      provider: {
        '@type': 'Organization',
        '@id': `${SITE_URL}#organization`,
        name: SITE_NAME,
      },
      areaServed: {
        '@type': 'Country',
        name: 'France',
      },
      ...(params.ratingValue && params.reviewCount && params.reviewCount > 0 ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: params.ratingValue,
          reviewCount: params.reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      } : {}),
      ...(params.reviews && params.reviews.length > 0 ? {
        review: params.reviews.slice(0, 3).map(r => ({
          '@type': 'Review',
          author: { '@type': 'Person', name: r.authorName },
          reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
          reviewBody: r.comment,
          datePublished: r.datePublished,
        })),
      } : {}),
    },
  }
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
    ...(params.lowPrice != null && params.highPrice != null && {
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
