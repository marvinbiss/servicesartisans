import React from 'react'
import { Review, getDisplayName } from './types'
import type { LegacyArtisan } from '@/types/legacy'
import { slugify, getArtisanUrl } from '@/lib/utils'
import { companyIdentity, getSocialLinks } from '@/lib/config/company-identity'

interface ArtisanSchemaProps {
  artisan: LegacyArtisan
  reviews: Review[]
}

export function ArtisanSchema({ artisan, reviews }: ArtisanSchemaProps) {
  const displayName = getDisplayName(artisan)
  const baseUrl = companyIdentity.url

  // Organization Schema for ServicesArtisans platform
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}#organization`,
    name: 'ServicesArtisans',
    url: baseUrl,
    logo: `${baseUrl}/icon.svg`,
    description: 'Plateforme de mise en relation entre particuliers et artisans qualifiés en France',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['French'],
      url: `${baseUrl}/contact`,
    },
    ...(getSocialLinks().length > 0 && { sameAs: getSocialLinks() }),
  }

  const artisanUrl = `${baseUrl}${getArtisanUrl(artisan)}`

  // Individual Service Schemas for each service offered
  const serviceSchemas = artisan.service_prices.map((service, index) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${artisanUrl}#service-${index}`,
    name: service.name,
    description: service.description || `${service.name} par ${displayName}`,
    provider: {
      '@type': 'LocalBusiness',
      '@id': `${artisanUrl}#business`,
      name: displayName,
    },
    areaServed: {
      '@type': 'City',
      name: artisan.city,
      ...(artisan.region && { containedInPlace: { '@type': 'AdministrativeArea', name: artisan.region } }),
    },
    ...(service.price && {
      offers: {
        '@type': 'Offer',
        price: service.price.replace(/[^0-9]/g, '') || '0',
        priceCurrency: 'EUR',
        availability: artisan.accepts_new_clients ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
    }),
    ...(service.duration && {
      estimatedDuration: service.duration,
    }),
    serviceType: artisan.specialty,
    termsOfService: `${baseUrl}/cgv`,
  }))

  // LocalBusiness Schema
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${artisanUrl}#business`,
    name: displayName,
    description: artisan.description || `${displayName} - ${artisan.specialty} a ${artisan.city}`,
    image: artisan.avatar_url || `${baseUrl}/og-artisan.jpg`,
    telephone: artisan.phone,
    email: artisan.email,
    url: artisanUrl,
    priceRange: artisan.hourly_rate ? `${artisan.hourly_rate}€ - ${artisan.hourly_rate * 2}€` : '€€',
    parentOrganization: {
      '@type': 'Organization',
      '@id': `${baseUrl}#organization`,
      name: 'ServicesArtisans',
    },

    address: {
      '@type': 'PostalAddress',
      streetAddress: artisan.address || '',
      addressLocality: artisan.city,
      addressRegion: artisan.region || artisan.department || '',
      postalCode: artisan.postal_code,
      addressCountry: 'FR',
    },

    ...(artisan.latitude && artisan.longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: artisan.latitude,
        longitude: artisan.longitude,
      },
    }),

    aggregateRating: reviews.length > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1,
    } : undefined,

    review: reviews.slice(0, 5).map(r => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: r.author,
      },
      datePublished: r.date,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: r.comment,
    })),

    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Services',
      itemListElement: artisan.service_prices.map((s, _i) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: s.name,
          description: s.description,
        },
        ...(s.price && {
          priceSpecification: {
            '@type': 'PriceSpecification',
            price: s.price.replace(/[^0-9]/g, '') || '0',
            priceCurrency: 'EUR',
          },
        }),
      })),
    },

    ...(artisan.intervention_zone && {
      areaServed: {
        '@type': 'GeoCircle',
        geoMidpoint: {
          '@type': 'GeoCoordinates',
          latitude: artisan.latitude || 48.8566,
          longitude: artisan.longitude || 2.3522,
        },
        geoRadius: parseInt(artisan.intervention_zone) * 1000 || 20000,
      },
    }),

    ...(artisan.siret && {
      identifier: {
        '@type': 'PropertyValue',
        name: 'SIRET',
        value: artisan.siret,
      },
    }),

    ...(artisan.website && {
      sameAs: [artisan.website],
    }),

    // Additional SEO-friendly properties
    ...(artisan.experience_years && {
      foundingDate: new Date(new Date().getFullYear() - artisan.experience_years, 0, 1).toISOString().split('T')[0],
    }),
    ...(artisan.employee_count && {
      numberOfEmployees: {
        '@type': 'QuantitativeValue',
        value: artisan.employee_count,
      },
    }),
    ...(artisan.certifications && artisan.certifications.length > 0 && {
      hasCredential: artisan.certifications.map(cert => ({
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'certification',
        name: cert,
      })),
    }),
    paymentAccepted: artisan.payment_methods?.join(', ') || 'Cash, Credit Card',
    currenciesAccepted: 'EUR',
  }

  // FAQPage Schema
  const faqSchema = artisan.faq && artisan.faq.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: artisan.faq.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : null

  // BreadcrumbList Schema with full geographic hierarchy
  const breadcrumbItems = [
    { name: 'Accueil', item: baseUrl },
    { name: artisan.specialty, item: `${baseUrl}/services/${slugify(artisan.specialty)}` },
  ]

  if (artisan.region) {
    breadcrumbItems.push({ name: artisan.region, item: `${baseUrl}/regions/${slugify(artisan.region)}` })
  }

  if (artisan.department) {
    breadcrumbItems.push({ name: artisan.department, item: `${baseUrl}/departements/${slugify(artisan.department)}` })
  }

  breadcrumbItems.push({ name: artisan.city, item: `${baseUrl}/villes/${slugify(artisan.city)}` })
  breadcrumbItems.push({ name: displayName, item: '' })

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.item && { item: item.item }),
    })),
  }

  // Combined schema graph for better SEO (single JSON-LD with @graph)
  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchema,
      localBusinessSchema,
      breadcrumbSchema,
      ...(faqSchema ? [faqSchema] : []),
      ...serviceSchemas,
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(combinedSchema, null, 0)
            .replace(/</g, '\\u003c')
            .replace(/>/g, '\\u003e')
        }}
      />
    </>
  )
}
