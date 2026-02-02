import Script from 'next/script'

// Safely escape JSON for script tags to prevent XSS
function safeJsonStringify(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

interface LocalBusinessSchema {
  type: 'LocalBusiness'
  name: string
  description: string
  address: {
    streetAddress?: string
    addressLocality: string
    addressRegion: string
    postalCode?: string
    addressCountry: string
  }
  telephone?: string
  email?: string
  url?: string
  image?: string
  priceRange?: string
  aggregateRating?: {
    ratingValue: number
    reviewCount: number
  }
  openingHours?: string[]
  geo?: {
    latitude: number
    longitude: number
  }
}

interface ServiceSchema {
  type: 'Service'
  name: string
  description: string
  provider: {
    name: string
    url?: string
  }
  areaServed?: string
  serviceType?: string
}

interface WebsiteSchema {
  type: 'WebSite'
  name: string
  url: string
  description: string
  potentialAction?: {
    query: string
  }
}

interface FAQSchema {
  type: 'FAQPage'
  questions: Array<{
    question: string
    answer: string
  }>
}

type SchemaType = LocalBusinessSchema | ServiceSchema | WebsiteSchema | FAQSchema

interface SchemaOrgProps {
  schema: SchemaType
}

function generateLocalBusinessSchema(data: LocalBusinessSchema) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: data.name,
    description: data.description,
    address: {
      '@type': 'PostalAddress',
      ...data.address,
    },
  }

  if (data.telephone) schema.telephone = data.telephone
  if (data.email) schema.email = data.email
  if (data.url) schema.url = data.url
  if (data.image) schema.image = data.image
  if (data.priceRange) schema.priceRange = data.priceRange
  if (data.openingHours) schema.openingHoursSpecification = data.openingHours

  if (data.aggregateRating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: data.aggregateRating.ratingValue,
      reviewCount: data.aggregateRating.reviewCount,
    }
  }

  if (data.geo) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: data.geo.latitude,
      longitude: data.geo.longitude,
    }
  }

  return schema
}

function generateServiceSchema(data: ServiceSchema) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: data.name,
    description: data.description,
    provider: {
      '@type': 'Organization',
      name: data.provider.name,
      url: data.provider.url,
    },
    areaServed: data.areaServed,
    serviceType: data.serviceType,
  }
}

function generateWebsiteSchema(data: WebsiteSchema) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: data.name,
    url: data.url,
    description: data.description,
  }

  if (data.potentialAction) {
    schema.potentialAction = {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${data.url}/recherche?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    }
  }

  return schema
}

function generateFAQSchema(data: FAQSchema) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  }
}

export function SchemaOrg({ schema }: SchemaOrgProps) {
  let jsonLd: Record<string, unknown>

  switch (schema.type) {
    case 'LocalBusiness':
      jsonLd = generateLocalBusinessSchema(schema)
      break
    case 'Service':
      jsonLd = generateServiceSchema(schema)
      break
    case 'WebSite':
      jsonLd = generateWebsiteSchema(schema)
      break
    case 'FAQPage':
      jsonLd = generateFAQSchema(schema)
      break
    default:
      return null
  }

  return (
    <Script
      id="schema-org"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonStringify(jsonLd) }}
    />
  )
}

export default SchemaOrg
