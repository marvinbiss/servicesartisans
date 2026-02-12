import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getServiceBySlug,
  getLocationBySlug,
  getProvidersByServiceAndLocation,
  hasProvidersByServiceAndLocation,
} from '@/lib/supabase'
import ServiceLocationPageClient from './PageClient'

import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { PopularServicesLinks } from '@/components/InternalLinks'
import { popularServices, popularCities } from '@/lib/constants/navigation'
import Link from 'next/link'
import { REVALIDATE } from '@/lib/cache'
import { slugify } from '@/lib/utils'
import { services as staticServicesList, villes, getVilleBySlug, getDepartementByCode, getRegionSlugByName } from '@/lib/data/france'
import { getTradeContent } from '@/lib/data/trade-content'
import { getFAQSchema } from '@/lib/seo/jsonld'
import type { Service, Location as LocationType, Provider } from '@/types'

// Safely escape JSON for script tags to prevent XSS
function safeJsonStringify(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

// ISR: revalidate every 60s — stale cache served on DB outage
export const revalidate = REVALIDATE.serviceLocation
// Hard 404 for slugs not in generateStaticParams
export const dynamicParams = false

// 15 services × 141 villes = 2,115 pre-rendered paths
export function generateStaticParams() {
  return staticServicesList.flatMap(s =>
    villes.map(v => ({ service: s.slug, location: v.slug }))
  )
}

/** Resolve a ville from static data to Location shape (fallback when DB is down) */
function villeToLocation(slug: string): LocationType | null {
  const ville = getVilleBySlug(slug)
  if (!ville) return null
  return {
    id: '',
    name: ville.name,
    slug: ville.slug,
    postal_code: ville.codePostal,
    region_name: ville.region,
    department_name: ville.departement,
    department_code: ville.departementCode,
    is_active: true,
    created_at: '',
  }
}

// slugify imported from '@/lib/utils'

interface PageProps {
  params: Promise<{
    service: string
    location: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { service: serviceSlug, location: locationSlug } = await params

  let serviceName = ''
  let locationName = ''
  let postalCode = ''
  let departmentCode = ''
  let hasProviders = true

  try {
    const [service, location, providersExist] = await Promise.all([
      getServiceBySlug(serviceSlug),
      getLocationBySlug(locationSlug),
      // Lightweight count-only check — avoids fetching all provider rows
      hasProvidersByServiceAndLocation(serviceSlug, locationSlug),
    ])

    if (service) serviceName = service.name
    if (location) {
      locationName = location.name
      postalCode = location.postal_code || ''
      departmentCode = location.department_code || ''
    }

    hasProviders = providersExist
  } catch {
    // DB down — fallback to static data
    const staticSvc = staticServicesList.find(s => s.slug === serviceSlug)
    const ville = getVilleBySlug(locationSlug)
    if (staticSvc) serviceName = staticSvc.name
    if (ville) {
      locationName = ville.name
      postalCode = ville.codePostal
      departmentCode = ville.departementCode
    }
    hasProviders = false // conservative: noindex when DB is down
  }

  if (!serviceName || !locationName) {
    return { title: 'Non trouvé' }
  }

  const title = `${serviceName} à ${locationName} (${postalCode || departmentCode}) — Annuaire & Devis Gratuit`
  const description = `Trouvez un ${serviceName.toLowerCase()} référencé par SIREN à ${locationName}. Comparez les profils, consultez les coordonnées et demandez un devis gratuit. Artisans référencés par l'API gouvernementale.`
  const svcLower = serviceName.toLowerCase()

  return {
    title,
    description,
    ...(hasProviders ? {} : { robots: { index: false, follow: true } }),
    keywords: [
      `${svcLower} ${locationName}`,
      `${svcLower} ${postalCode}`,
      `${svcLower} pas cher ${locationName}`,
      `${svcLower} urgence ${locationName}`,
      `devis ${svcLower} ${locationName}`,
      `tarif ${svcLower} ${locationName}`,
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
}

// JSON-LD structured data for SEO
function generateJsonLd(service: Service, location: LocationType, _providers: unknown[], serviceSlug: string, locationSlug: string) {
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

  // 1. Resolve service (DB → static fallback)
  let service: Service
  try {
    service = await getServiceBySlug(serviceSlug)
    if (!service) {
      const staticSvc = staticServicesList.find(s => s.slug === serviceSlug)
      if (!staticSvc) notFound()
      service = { id: '', name: staticSvc.name, slug: staticSvc.slug, is_active: true, created_at: '' }
    }
  } catch {
    const staticSvc = staticServicesList.find(s => s.slug === serviceSlug)
    if (!staticSvc) notFound()
    service = { id: '', name: staticSvc.name, slug: staticSvc.slug, is_active: true, created_at: '' }
  }

  // 2. Resolve location (DB → france.ts fallback)
  let location: LocationType
  try {
    const dbLocation = await getLocationBySlug(locationSlug)
    if (!dbLocation) {
      const fallback = villeToLocation(locationSlug)
      if (!fallback) notFound()
      location = fallback
    } else {
      location = dbLocation
    }
  } catch {
    const fallback = villeToLocation(locationSlug)
    if (!fallback) notFound()
    location = fallback
  }

  // 3. Fetch providers (best-effort, never crash)
  let providers: Provider[] = []
  try {
    providers = await getProvidersByServiceAndLocation(serviceSlug, locationSlug)
  } catch (error) {
    console.error('Hub DB error (providers):', error)
    // Continue with empty providers — page still renders
  }

  const trade = getTradeContent(serviceSlug)
  const baseSchemas = generateJsonLd(service, location, providers || [], serviceSlug, locationSlug)
  const faqSchema = trade ? getFAQSchema(trade.faq.map(f => ({ question: f.q, answer: f.a }))) : null
  const jsonLdSchemas: Record<string, unknown>[] = [...baseSchemas, ...(faqSchema ? [faqSchema] : [])]

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
          dangerouslySetInnerHTML={{ __html: safeJsonStringify(schema) }}
        />
      ))}

      {/* Page Content */}
      <ServiceLocationPageClient
        service={service}
        location={location}
        providers={providers || []}
      />

      {/* Trade pricing context */}
      {trade && (
        <section className="py-10 bg-gray-50 border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Tarifs {service.name.toLowerCase()} à {location.name}
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
              Tarif horaire moyen : <strong>{trade.priceRange.min}–{trade.priceRange.max} {trade.priceRange.unit}</strong>.
              Les prix peuvent varier selon la complexité des travaux et le professionnel choisi.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {trade.commonTasks.slice(0, 6).map((task, i) => {
                const [label, price] = task.split(' : ')
                return (
                  <div key={i} className="flex items-start justify-between gap-3 p-2.5 bg-white rounded-lg text-sm">
                    <span className="text-gray-700">{label}</span>
                    {price && <span className="font-semibold text-amber-700 whitespace-nowrap">{price}</span>}
                  </div>
                )
              })}
            </div>
            {trade.emergencyInfo && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Urgence {service.name.toLowerCase()} à {location.name} :</strong>{' '}
                  {trade.averageResponseTime}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

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
                  nearbyCities.map((city) => (
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
                    href={`/regions/${getRegionSlugByName(location.region_name) || slugify(location.region_name)}`}
                    className="block px-3 py-2 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-lg text-sm transition-colors"
                  >
                    Artisans en {location.region_name}
                  </Link>
                )}
                {location.department_name && location.department_code && (
                  <Link
                    href={`/departements/${getDepartementByCode(location.department_code)?.slug || slugify(location.department_name)}`}
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

      {/* Trust & Safety Links (E-E-A-T) */}
      <section className="py-8 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Confiance &amp; Sécurité
          </h2>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/notre-processus-de-verification" className="text-blue-600 hover:text-blue-800">
              Comment nous référençons les artisans
            </Link>
            <Link href="/politique-avis" className="text-blue-600 hover:text-blue-800">
              Notre politique des avis
            </Link>
            <Link href="/mediation" className="text-blue-600 hover:text-blue-800">
              Service de médiation
            </Link>
          </nav>
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
