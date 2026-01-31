import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getServiceBySlug,
  getLocationBySlug,
  getProvidersByServiceAndLocation,
} from '@/lib/supabase'
import ServiceLocationPageClient from './PageClient'
import { REVALIDATE } from '@/lib/cache'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'

// ISR: Revalidate every 15 minutes for service+location pages
export const revalidate = REVALIDATE.serviceLocation

interface PageProps {
  params: Promise<{
    service: string
    location: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { service: serviceSlug, location: locationSlug } = await params

  try {
    const [service, location] = await Promise.all([
      getServiceBySlug(serviceSlug),
      getLocationBySlug(locationSlug),
    ])

    if (!service || !location) {
      return { title: 'Page non trouvée' }
    }

    const title = `${service.name} ${location.name} (${location.postal_code || location.department_code}) - Devis gratuit`
    const description = `Trouvez le meilleur ${service.name.toLowerCase()} à ${location.name}. Comparez les avis, tarifs et obtenez jusqu'à 3 devis gratuits. Artisans vérifiés et disponibles.`

    return {
      title,
      description,
      keywords: [
        `${service.name.toLowerCase()} ${location.name}`,
        `${service.name.toLowerCase()} ${location.postal_code}`,
        `${service.name.toLowerCase()} pas cher ${location.name}`,
        `${service.name.toLowerCase()} urgence ${location.name}`,
        `devis ${service.name.toLowerCase()} ${location.name}`,
        `tarif ${service.name.toLowerCase()} ${location.name}`,
      ],
      openGraph: {
        title,
        description,
        type: 'website',
        locale: 'fr_FR',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
      alternates: {
        canonical: `https://servicesartisans.fr/services/${serviceSlug}/${locationSlug}`,
      },
    }
  } catch {
    return { title: 'Page non trouvée' }
  }
}

// JSON-LD structured data for SEO
function generateJsonLd(service: any, location: any, providers: any[], serviceSlug: string, locationSlug: string) {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${service.name} à ${location.name}`,
    description: `Trouvez les meilleurs ${service.name.toLowerCase()}s à ${location.name}`,
    areaServed: {
      '@type': 'Place',
      name: location.name,
      address: {
        '@type': 'PostalAddress',
        addressLocality: location.name,
        postalCode: location.postal_code,
        addressRegion: location.region_name,
        addressCountry: 'FR',
      },
    },
    provider: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
    },
    aggregateRating: providers.length > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      reviewCount: providers.length,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
  }

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Services', url: '/services' },
    { name: service.name, url: `/services/${serviceSlug}` },
    { name: location.name, url: `/services/${serviceSlug}/${locationSlug}` },
  ])

  return [serviceSchema, breadcrumbSchema]
}

export default async function ServiceLocationPage({ params }: PageProps) {
  const { service: serviceSlug, location: locationSlug } = await params

  let service
  let location
  let providers

  try {
    ;[service, location] = await Promise.all([
      getServiceBySlug(serviceSlug),
      getLocationBySlug(locationSlug),
    ])

    if (!service || !location) {
      notFound()
    }

    providers = await getProvidersByServiceAndLocation(serviceSlug, locationSlug)
  } catch (error) {
    console.error('Error fetching data:', error)
    notFound()
  }

  const jsonLdSchemas = generateJsonLd(service, location, providers || [], serviceSlug, locationSlug)

  return (
    <>
      {/* JSON-LD Structured Data */}
      {jsonLdSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* Page Content */}
      <ServiceLocationPageClient
        service={service}
        location={location}
        providers={providers || []}
      />
    </>
  )
}
