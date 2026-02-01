import { SITE_URL, SITE_NAME } from './config'

// Schema.org Organization
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    description: 'Plateforme de mise en relation entre particuliers et artisans qualifiés en France.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Avenue des Artisans',
      addressLocality: 'Paris',
      postalCode: '75001',
      addressCountry: 'FR',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+33-1-23-45-67-89',
      contactType: 'customer service',
      availableLanguage: 'French',
    },
    sameAs: [
      'https://www.facebook.com/servicesartisans',
      'https://twitter.com/servicesartisans',
      'https://www.linkedin.com/company/servicesartisans',
    ],
  }
}

// Schema.org WebSite with SearchAction
export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/services/{search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

// Schema.org LocalBusiness for artisans
export function getLocalBusinessSchema(artisan: {
  name: string
  description: string
  address: string
  city: string
  postalCode: string
  phone?: string
  rating?: number
  reviewCount?: number
  services: string[]
  priceRange?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/artisan/${artisan.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: artisan.name,
    description: artisan.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: artisan.address,
      addressLocality: artisan.city,
      postalCode: artisan.postalCode,
      addressCountry: 'FR',
    },
    telephone: artisan.phone,
    priceRange: artisan.priceRange || '€€',
    aggregateRating: artisan.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: artisan.rating,
          reviewCount: artisan.reviewCount || 0,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    makesOffer: artisan.services.map((service) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: service,
      },
    })),
  }
}

// Schema.org Service
export function getServiceSchema(service: {
  name: string
  description: string
  provider?: string
  areaServed?: string
  category?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
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

// Schema.org BreadcrumbList
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  }
}

// Schema.org FAQPage
export function getFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

// Schema.org Review
export function getReviewSchema(review: {
  author: string
  rating: number
  reviewBody: string
  datePublished: string
  itemReviewed: {
    name: string
    type: 'LocalBusiness' | 'Service'
  }
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.author,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.reviewBody,
    datePublished: review.datePublished,
    itemReviewed: {
      '@type': review.itemReviewed.type,
      name: review.itemReviewed.name,
    },
  }
}

// Schema.org HowTo (for "Comment ça marche" page)
export function getHowToSchema(steps: { name: string; text: string; image?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Comment trouver un artisan sur ServicesArtisans',
    description: 'Guide étape par étape pour trouver et contacter un artisan qualifié.',
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image,
    })),
  }
}

// Schema.org Reservation (for booking confirmation)
export function getReservationSchema(booking: {
  bookingId: string
  clientName: string
  clientEmail: string
  artisanName: string
  serviceName: string
  date: string
  startTime: string
  endTime: string
  status: 'confirmed' | 'cancelled' | 'completed'
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ServiceReservation',
    reservationId: booking.bookingId,
    reservationStatus: booking.status === 'confirmed'
      ? 'https://schema.org/ReservationConfirmed'
      : booking.status === 'cancelled'
      ? 'https://schema.org/ReservationCancelled'
      : 'https://schema.org/ReservationConfirmed',
    underName: {
      '@type': 'Person',
      name: booking.clientName,
      email: booking.clientEmail,
    },
    provider: {
      '@type': 'LocalBusiness',
      name: booking.artisanName,
    },
    reservationFor: {
      '@type': 'Service',
      name: booking.serviceName,
    },
    startTime: `${booking.date}T${booking.startTime}:00`,
    endTime: `${booking.date}T${booking.endTime}:00`,
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
        ...(item.rating && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: item.rating,
            reviewCount: item.reviewCount || 0,
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
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'City',
    name: city.name,
    url: `${SITE_URL}/villes/${city.slug}`,
    description: city.description || `Trouvez les meilleurs artisans à ${city.name}`,
    containedInPlace: city.region
      ? {
          '@type': 'AdministrativeArea',
          name: city.region,
        }
      : undefined,
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

// Schema.org ProfessionalService (enhanced for artisans with booking)
export function getProfessionalServiceSchema(artisan: {
  id: string
  name: string
  description: string
  address?: string
  city: string
  postalCode?: string
  phone?: string
  email?: string
  rating?: number
  reviewCount?: number
  services: string[]
  priceRange?: string
  image?: string
  availableSlots?: { date: string; times: string[] }[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE_URL}/artisan/${artisan.id}`,
    name: artisan.name,
    description: artisan.description,
    image: artisan.image || `${SITE_URL}/images/default-artisan.jpg`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: artisan.city,
      postalCode: artisan.postalCode || '',
      addressCountry: 'FR',
    },
    telephone: artisan.phone,
    email: artisan.email,
    priceRange: artisan.priceRange || '€€',
    aggregateRating: artisan.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: artisan.rating.toFixed(1),
          reviewCount: artisan.reviewCount || 0,
          bestRating: '5',
          worstRating: '1',
        }
      : undefined,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Services proposés',
      itemListElement: artisan.services.map((service, index) => ({
        '@type': 'Offer',
        '@id': `${SITE_URL}/artisan/${artisan.id}#service-${index}`,
        itemOffered: {
          '@type': 'Service',
          name: service,
        },
      })),
    },
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/artisan/${artisan.id}#reserver`,
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
      },
      result: {
        '@type': 'Reservation',
        name: 'Réservation de service',
      },
    },
  }
}
