import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getServiceBySlug,
  getLocationBySlug,
  getProvidersByServiceAndLocation,
  getProviderCountByServiceAndLocation,
} from '@/lib/supabase'
import ServiceLocationPageClient from './PageClient'

import { getBreadcrumbSchema, getItemListSchema } from '@/lib/seo/jsonld'
import { PopularServicesLinks } from '@/components/InternalLinks'
import { popularServices } from '@/lib/constants/navigation'
import Link from 'next/link'
import { REVALIDATE } from '@/lib/cache'
import { slugify, getArtisanUrl } from '@/lib/utils'
import { services as staticServicesList, villes, getVilleBySlug, getDepartementByCode, getRegionSlugByName, getNearbyCities } from '@/lib/data/france'
import { getTradeContent } from '@/lib/data/trade-content'
import { getFAQSchema } from '@/lib/seo/jsonld'
import { generateLocationContent } from '@/lib/seo/location-content'
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
  let departmentCode = ''
  let departmentName = ''
  let providerCount = 0

  try {
    const [service, location, count] = await Promise.all([
      getServiceBySlug(serviceSlug),
      getLocationBySlug(locationSlug),
      // Lightweight count-only check — avoids fetching all provider rows
      getProviderCountByServiceAndLocation(serviceSlug, locationSlug),
    ])

    if (service) serviceName = service.name
    if (location) {
      locationName = location.name
      departmentCode = location.department_code || ''
      departmentName = location.department_name || ''
    }

    providerCount = count
  } catch {
    // DB down — fallback to static data
    const staticSvc = staticServicesList.find(s => s.slug === serviceSlug)
    const ville = getVilleBySlug(locationSlug)
    if (staticSvc) serviceName = staticSvc.name
    if (ville) {
      locationName = ville.name
      departmentCode = ville.departementCode
      departmentName = ville.departement
    }
    providerCount = 0 // conservative: noindex when DB is down
  }

  if (!serviceName || !locationName) {
    return { title: 'Non trouvé' }
  }

  const hasProviders = providerCount > 0
  const svcLower = serviceName.toLowerCase()

  // Task 4: Title under 60 chars — no postal code, include artisan count
  const title = hasProviders
    ? `${serviceName} à ${locationName} — ${providerCount} artisans | ServicesArtisans`
    : `${serviceName} à ${locationName} — Devis Gratuit | ServicesArtisans`

  // Task 3: Unique meta descriptions with provider count and department
  const description = hasProviders
    ? `Comparez ${providerCount} ${svcLower}s référencés par SIREN à ${locationName} (${departmentName || departmentCode}). Consultez les profils, coordonnées et demandez un devis gratuit.`
    : `Trouvez un ${svcLower} référencé par SIREN à ${locationName} (${departmentName || departmentCode}). Comparez les profils et demandez un devis gratuit.`

  return {
    title,
    description,
    ...(hasProviders ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'fr_FR',
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: title }],
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
      '@type': 'City',
      name: location.name,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: location.department_name || '',
      },
    },
    provider: {
      '@id': 'https://servicesartisans.fr#organization',
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

  // Generate unique SEO content per service+location combo (doorway-page mitigation)
  const ville = getVilleBySlug(locationSlug)
  const locationContent = ville
    ? generateLocationContent(serviceSlug, service.name, ville, providers.length)
    : null

  // Task 2: ItemList JSON-LD for provider listings
  const itemListSchema = providers.length > 0
    ? getItemListSchema({
        name: `${service.name} à ${location.name}`,
        description: `Liste des ${service.name.toLowerCase()}s référencés à ${location.name}`,
        url: `/services/${serviceSlug}/${locationSlug}`,
        items: providers.slice(0, 20).map((p, i) => ({
          name: p.name,
          url: getArtisanUrl({ stable_id: p.stable_id, slug: p.slug, specialty: p.specialty, city: p.address_city }),
          position: i + 1,
          rating: p.rating_average,
          reviewCount: p.review_count,
        })),
      })
    : null

  const jsonLdSchemas: Record<string, unknown>[] = [
    ...baseSchemas,
    ...(faqSchema ? [faqSchema] : []),
    ...(itemListSchema ? [itemListSchema] : []),
  ]

  // Filter out current location and get other services for cross-linking
  const otherServices = popularServices.filter(s => s.slug !== serviceSlug).slice(0, 6)
  const nearbyCities = getNearbyCities(locationSlug, 8)

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

      {/* SEO Content - Server-rendered for Googlebot (unique per service+location) */}
      {locationContent && (
        <section className="py-12 bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-gray max-w-none">
              <h2>
                Trouver un {service.name.toLowerCase()} à {location.name}
              </h2>
              <p>{locationContent.introText}</p>

              <h3>Tarifs et prix d&apos;un {service.name.toLowerCase()} à {location.name}</h3>
              <p>{locationContent.pricingNote}</p>

              <h3>Conseils pour vos travaux à {location.name}</h3>
              <ul>
                {locationContent.localTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>

              <h3>
                Zones d&apos;intervention à {location.name}
              </h3>
              <p>{locationContent.quartierText}</p>

              <p>{locationContent.conclusion}</p>
            </div>
          </div>
        </section>
      )}

      {/* Fallback SEO content when locationContent is not available */}
      {!locationContent && (
        <section className="py-12 bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-gray max-w-none">
              <h2>
                Trouver un {service.name.toLowerCase()} à {location.name}
              </h2>
              <p>
                Vous recherchez un {service.name.toLowerCase()} à {location.name} (
                {location.postal_code}) ? ServicesArtisans vous propose une sélection de{' '}
                {providers.length} professionnels qualifiés dans votre ville.
              </p>
            </div>
          </div>
        </section>
      )}

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

      {/* Task 1: Visible FAQ accordion — renders trade-specific FAQ above cross-links */}
      {trade && trade.faq.length > 0 && (
        <section className="py-10 bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Questions fréquentes — {service.name.toLowerCase()} à {location.name}
            </h2>
            <div className="space-y-4">
              {trade.faq.map((item, i) => (
                <details
                  key={i}
                  className="group bg-gray-50 rounded-xl border border-gray-100 overflow-hidden"
                >
                  <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-left hover:bg-gray-100 transition-colors [&::-webkit-details-marker]:hidden">
                    <span className="font-semibold text-slate-900 pr-4">{item.q}</span>
                    <svg className="w-5 h-5 text-gray-400 shrink-0 group-open:rotate-180 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-5 text-slate-500 leading-relaxed text-sm">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Articles utiles — liens contextuels vers le blog */}
      <section className="py-10 bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Guides et conseils
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {serviceSlug === 'plombier' ? (
              <>
                <Link
                  href="/blog/comment-choisir-plombier"
                  className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all group"
                >
                  <span className="text-2xl shrink-0" aria-hidden="true">&#128295;</span>
                  <div>
                    <span className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Comment choisir son plombier ?</span>
                    <p className="text-sm text-gray-500 mt-1">Les critères essentiels pour trouver un plombier fiable et compétent.</p>
                  </div>
                </Link>
                <Link
                  href="/blog/urgence-plomberie-que-faire"
                  className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all group"
                >
                  <span className="text-2xl shrink-0" aria-hidden="true">&#128680;</span>
                  <div>
                    <span className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Urgence plomberie : que faire ?</span>
                    <p className="text-sm text-gray-500 mt-1">Les bons réflexes en cas de fuite ou de dégât des eaux.</p>
                  </div>
                </Link>
              </>
            ) : ['peintre-en-batiment', 'macon', 'couvreur', 'carreleur', 'menuisier'].includes(serviceSlug) ? (
              <>
                <Link
                  href="/blog/renovation-energetique-2026"
                  className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all group"
                >
                  <span className="text-2xl shrink-0" aria-hidden="true">&#127969;</span>
                  <div>
                    <span className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Rénovation énergétique 2026 : aides et conseils</span>
                    <p className="text-sm text-gray-500 mt-1">Découvrez les aides disponibles et les travaux prioritaires pour votre logement.</p>
                  </div>
                </Link>
                <Link
                  href="/blog/tendances-decoration-2026"
                  className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all group"
                >
                  <span className="text-2xl shrink-0" aria-hidden="true">&#127912;</span>
                  <div>
                    <span className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Tendances décoration 2026</span>
                    <p className="text-sm text-gray-500 mt-1">Les styles et matériaux qui font la tendance cette année.</p>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/blog/tendances-decoration-2026"
                  className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all group"
                >
                  <span className="text-2xl shrink-0" aria-hidden="true">&#127912;</span>
                  <div>
                    <span className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Tendances décoration 2026</span>
                    <p className="text-sm text-gray-500 mt-1">Les styles et matériaux qui font la tendance cette année.</p>
                  </div>
                </Link>
                <Link
                  href="/blog/renovation-energetique-2026"
                  className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all group"
                >
                  <span className="text-2xl shrink-0" aria-hidden="true">&#127969;</span>
                  <div>
                    <span className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Rénovation énergétique 2026 : aides et conseils</span>
                    <p className="text-sm text-gray-500 mt-1">Découvrez les aides disponibles et les travaux prioritaires pour votre logement.</p>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

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
                    {s.name} à {location.name}
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

            {/* Ce service dans les villes proches */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">
                {service.name} près de {location.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {nearbyCities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/services/${serviceSlug}/${city.slug}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full text-sm transition-colors"
                  >
                    {service.name} à {city.name}
                  </Link>
                ))}
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
