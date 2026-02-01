'use client'

import Script from 'next/script'
import { Artisan, Review, getDisplayName } from './types'

interface ArtisanSchemaProps {
  artisan: Artisan
  reviews: Review[]
}

export function ArtisanSchema({ artisan, reviews }: ArtisanSchemaProps) {
  const displayName = getDisplayName(artisan)
  const baseUrl = 'https://servicesartisans.fr'

  // LocalBusiness Schema
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${baseUrl}/services/artisan/${artisan.id}#business`,
    name: displayName,
    description: artisan.description || `${displayName} - ${artisan.specialty} a ${artisan.city}`,
    image: artisan.avatar_url || `${baseUrl}/og-artisan.jpg`,
    telephone: artisan.phone,
    email: artisan.email,
    url: `${baseUrl}/services/artisan/${artisan.id}`,
    priceRange: artisan.hourly_rate ? `${artisan.hourly_rate}€ - ${artisan.hourly_rate * 2}€` : '€€',

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

    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: artisan.average_rating,
      reviewCount: artisan.review_count,
      bestRating: 5,
      worstRating: 1,
    },

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
      itemListElement: artisan.service_prices.map((s, i) => ({
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

  // Helper to create URL-safe slugs
  const slugify = (text: string) => text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

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

  return (
    <>
      <Script
        id="schema-local-business"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <Script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <Script
          id="schema-faq"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  )
}
