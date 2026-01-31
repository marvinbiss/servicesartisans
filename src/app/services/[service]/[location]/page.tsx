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
import Breadcrumb from '@/components/Breadcrumb'
import { PopularServicesLinks, popularServices, popularCities } from '@/components/InternalLinks'
import Link from 'next/link'

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

  // Filter out current location and get other services for cross-linking
  const otherServices = popularServices.filter(s => s.slug !== serviceSlug).slice(0, 6)
  const nearbyCities = popularCities.filter(c => c.slug !== locationSlug).slice(0, 8)

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

      {/* Voir aussi - Cross Links Section */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Voir aussi</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Autres services dans cette ville */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">
                Autres artisans à {location.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {otherServices.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/services/${s.slug}/${locationSlug}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full text-sm transition-colors"
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
              <Link
                href={`/villes/${locationSlug}`}
                className="inline-block mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Tous les artisans à {location.name} →
              </Link>
            </div>

            {/* Ce service dans d'autres villes */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">
                {service.name} dans d&apos;autres villes
              </h3>
              <div className="flex flex-wrap gap-2">
                {nearbyCities.length > 0 ? (
                  nearbyCities.map((city: any) => (
                    <Link
                      key={city.slug}
                      href={`/services/${serviceSlug}/${city.slug}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full text-sm transition-colors"
                    >
                      {city.name}
                    </Link>
                  ))
                ) : (
                  popularCities.slice(0, 6).map((city) => (
                    <Link
                      key={city.slug}
                      href={`/services/${serviceSlug}/${city.slug}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full text-sm transition-colors"
                    >
                      {city.name}
                    </Link>
                  ))
                )}
              </div>
              <Link
                href={`/services/${serviceSlug}`}
                className="inline-block mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Voir toutes les villes →
              </Link>
            </div>

            {/* Navigation régionale */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">
                Explorer par zone
              </h3>
              <div className="space-y-2">
                {location.region_name && (
                  <Link
                    href={`/regions/${location.region_slug || location.region_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                    className="block px-3 py-2 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-lg text-sm transition-colors"
                  >
                    Artisans en {location.region_name}
                  </Link>
                )}
                {location.department_name && (
                  <Link
                    href={`/departements/${location.department_code}`}
                    className="block px-3 py-2 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-lg text-sm transition-colors"
                  >
                    Artisans dans {location.department_name} ({location.department_code})
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Internal Links Footer */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PopularServicesLinks showTitle={true} limit={8} />
        </div>
      </section>
    </>
  )
}
