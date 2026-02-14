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
import Breadcrumb from '@/components/Breadcrumb'
import Link from 'next/link'
import { REVALIDATE } from '@/lib/cache'
import { slugify, getArtisanUrl } from '@/lib/utils'
import { getServiceImage } from '@/lib/data/images'
import { services as staticServicesList, villes, getVilleBySlug, getDepartementByCode, getRegionSlugByName, getNearbyCities, getVillesByDepartement, getQuartiersByVille } from '@/lib/data/france'
import { getTradeContent } from '@/lib/data/trade-content'
import { getFAQSchema } from '@/lib/seo/jsonld'
import { SITE_URL } from '@/lib/seo/config'
import { generateLocationContent, hashCode, getRegionalMultiplier } from '@/lib/seo/location-content'
import type { Service, Location as LocationType, Provider } from '@/types'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

// Safely escape JSON for script tags to prevent XSS
function safeJsonStringify(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

// ISR: revalidate every 60s — stale cache served on DB outage
export const revalidate = REVALIDATE.serviceLocation
// Allow on-demand ISR for cities not pre-rendered at build time
export const dynamicParams = true

// Pre-render top 200 cities only (15 × 200 = 3,000 pages)
// Remaining 2,000+ cities are generated on-demand via ISR
const TOP_CITIES_COUNT = 200
export function generateStaticParams() {
  const topCities = villes.slice(0, TOP_CITIES_COUNT)
  return staticServicesList.flatMap(s =>
    topCities.map(v => ({ service: s.slug, location: v.slug }))
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

/** Truncate title to ~55 chars to leave room for " | ServicesArtisans" suffix (total ~75, Google shows ~60 of page title) */
function truncateTitle(title: string, maxLen = 55): string {
  if (title.length <= maxLen) return title
  return title.slice(0, maxLen - 1).replace(/\s+\S*$/, '') + '\u2026'
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

  // Varied title patterns to avoid repetitive SERP appearance
  const titleHash = Math.abs(hashCode(`title-${serviceSlug}-${locationSlug}`))

  const titleTemplates = hasProviders
    ? [
        `${serviceName} à ${locationName} — ${providerCount} artisans`,
        `${providerCount} ${svcLower}s à ${locationName} — Devis Gratuit`,
        `${serviceName} ${locationName} : ${providerCount} pros référencés`,
        `Trouver un ${svcLower} à ${locationName} (${providerCount} pros)`,
        `${serviceName} à ${locationName} — Comparez ${providerCount} pros`,
      ]
    : [
        `${serviceName} à ${locationName} — Devis Gratuit`,
        `${svcLower} à ${locationName} : Devis en ligne gratuit`,
        `Trouver un ${svcLower} à ${locationName} — Pros vérifiés`,
        `${serviceName} ${locationName} — Artisans qualifiés`,
        `Devis ${svcLower} à ${locationName} — Gratuit`,
      ]
  const title = truncateTitle(titleTemplates[titleHash % titleTemplates.length])

  // Unique meta descriptions with provider count, department and regional context
  const metaVille = getVilleBySlug(locationSlug)
  const metaRegion = metaVille?.region || ''
  const descHash = Math.abs(hashCode(`desc-${serviceSlug}-${locationSlug}`))
  const descTemplates = hasProviders
    ? [
        `Comparez ${providerCount} ${svcLower}s référencés par SIREN à ${locationName} (${departmentName || departmentCode}). Devis gratuit en ${metaRegion || 'France'}.`,
        `${providerCount} ${svcLower}s vérifiés à ${locationName}, ${departmentName || departmentCode}. Comparez les profils et demandez un devis gratuit.`,
        `Trouvez le meilleur ${svcLower} à ${locationName} parmi ${providerCount} professionnels référencés. ${metaRegion || 'France'}, devis gratuit.`,
        `${locationName} (${departmentCode}) : ${providerCount} ${svcLower}s référencés SIREN. Tarifs, avis et devis gratuit en ${metaRegion || 'France'}.`,
        `Besoin d'un ${svcLower} à ${locationName} ? ${providerCount} artisans vérifiés dans le ${departmentName || departmentCode}. Comparez et obtenez un devis.`,
      ]
    : [
        `Trouvez un ${svcLower} qualifié à ${locationName} (${departmentName || departmentCode}), ${metaRegion}. Artisans vérifiés SIREN, devis gratuit.`,
        `${svcLower} à ${locationName} (${departmentCode}) : artisans référencés en ${metaRegion || 'France'}. Devis gratuit et sans engagement.`,
        `Besoin d'un ${svcLower} à ${locationName}, ${departmentName || departmentCode} ? Consultez notre annuaire d'artisans vérifiés. Devis gratuit.`,
        `Annuaire ${svcLower} à ${locationName} en ${metaRegion || 'France'}. Professionnels vérifiés SIREN, devis gratuit et immédiat.`,
        `${locationName}, ${metaRegion} : trouvez un ${svcLower} de confiance. Artisans référencés par SIREN. Demandez votre devis.`,
      ]
  const description = descTemplates[descHash % descTemplates.length]

  return {
    title,
    description,
    ...(providerCount > 2 ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'fr_FR',
      images: [{ url: getServiceImage(serviceSlug).src, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [getServiceImage(serviceSlug).src],
    },
    alternates: {
      canonical: `${SITE_URL}/services/${serviceSlug}/${locationSlug}`,
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
    image: getServiceImage(serviceSlug).src,
    areaServed: {
      '@type': 'City',
      name: location.name,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: location.department_name || '',
      },
    },
    provider: {
      '@id': `${SITE_URL}#organization`,
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

  // Generate unique SEO content per service+location combo (doorway-page mitigation)
  const ville = getVilleBySlug(locationSlug)
  const locationContent = ville
    ? generateLocationContent(serviceSlug, service.name, ville, providers.length)
    : null

  // Regional pricing multiplier for localized tariffs
  const pricingMultiplier = ville ? getRegionalMultiplier(ville.region) : 1.0

  // FAQ: combine 2 trade FAQ (hash-selected) + 4 location-specific FAQ
  const combinedFaq: { question: string; answer: string }[] = []
  if (trade && trade.faq.length > 0) {
    const tradeFaqHash = Math.abs(hashCode(`trade-faq-${serviceSlug}-${locationSlug}`))
    const idx1 = tradeFaqHash % trade.faq.length
    const idx2 = (tradeFaqHash + 3) % trade.faq.length
    combinedFaq.push({ question: trade.faq[idx1].q, answer: trade.faq[idx1].a })
    if (idx2 !== idx1) combinedFaq.push({ question: trade.faq[idx2].q, answer: trade.faq[idx2].a })
  }
  if (locationContent) combinedFaq.push(...locationContent.faqItems)
  const faqSchema = combinedFaq.length > 0 ? getFAQSchema(combinedFaq) : null

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
          image: getServiceImage(serviceSlug).src,
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
  const nearbyCities = getNearbyCities(locationSlug, 12)
  const deptCities = location.department_code
    ? getVillesByDepartement(location.department_code).filter(v => v.slug !== locationSlug).slice(0, 10)
    : []

  // Varied H1 text per service+location combo
  const h1Hash = Math.abs(hashCode(`h1-${serviceSlug}-${locationSlug}`))
  const h1Templates = [
    `${service.name} à ${location.name}`,
    `${service.name} à ${location.name} — Artisans vérifiés`,
    `Trouvez un ${service.name.toLowerCase()} à ${location.name}`,
    `${service.name} à ${location.name} : pros référencés`,
    `Les meilleurs ${service.name.toLowerCase()}s à ${location.name}`,
  ]
  const h1Text = h1Templates[h1Hash % h1Templates.length]

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

      {/* Visual breadcrumb for navigation and SEO */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Breadcrumb items={[
            { label: 'Services', href: '/services' },
            { label: service.name, href: `/services/${serviceSlug}` },
            { label: location.name },
          ]} />
        </div>
      </div>

      {/* Page Content */}
      <ServiceLocationPageClient
        service={service}
        location={location}
        providers={providers || []}
        h1Text={h1Text}
      />

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* SEO Content - Server-rendered for Googlebot (unique per service+location) */}
      {locationContent && (
        <section className="py-16 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
            <div className="bg-white rounded-2xl border border-slate-200/60 p-8">
              <div className="prose prose-gray max-w-none">
                <h2 className="border-l-4 border-amber-500 pl-4 !mt-0">
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

                <h3>Contexte local : {locationContent.climateLabel}</h3>
                <p>{locationContent.climateTip}</p>

                <h3>
                  Zones d&apos;intervention à {location.name}
                </h3>
                <p>{locationContent.quartierText}</p>
                {ville && getQuartiersByVille(locationSlug).length > 0 && (
                  <div className="not-prose flex flex-wrap gap-2 mt-4">
                    {getQuartiersByVille(locationSlug).slice(0, 10).map(({ name, slug }) => (
                      <Link key={slug} href={`/villes/${locationSlug}/${slug}`} className="text-sm bg-slate-50 text-slate-700 px-3 py-1.5 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        {name}
                      </Link>
                    ))}
                  </div>
                )}

                <p>{locationContent.conclusion}</p>
              </div>
            </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Fallback SEO content when locationContent is not available */}
      {!locationContent && (
        <section className="py-16 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl border border-slate-200/60 p-8">
              <div className="prose prose-gray max-w-none">
                <h2 className="border-l-4 border-amber-500 pl-4 !mt-0">
                  Trouver un {service.name.toLowerCase()} à {location.name}
                </h2>
                <p>
                  Vous recherchez un {service.name.toLowerCase()} à {location.name} (
                  {location.postal_code}) ? ServicesArtisans vous propose une sélection de{' '}
                  {providers.length} professionnels qualifiés dans votre ville.
                  {location.department_name && ` Notre annuaire couvre l'ensemble du département ${location.department_name} (${location.department_code}).`}
                </p>
                {trade && (
                  <>
                    <h3>Tarifs indicatifs à {location.name}</h3>
                    <p>
                      Le tarif horaire moyen d&apos;un {service.name.toLowerCase()} à {location.name} se situe
                      entre <strong>{Math.round(trade.priceRange.min * pricingMultiplier)} et {Math.round(trade.priceRange.max * pricingMultiplier)} {trade.priceRange.unit}</strong>.
                      Les prix varient selon la complexité des travaux et le professionnel choisi.
                    </p>
                    {trade.certifications && trade.certifications.length > 0 && (
                      <>
                        <h3>Certifications à vérifier</h3>
                        <p>
                          Avant de choisir un {service.name.toLowerCase()}, vérifiez qu&apos;il dispose
                          des certifications suivantes : {trade.certifications.slice(0, 3).join(', ')}.
                        </p>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* Trade expertise section */}
      {trade && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
            <h2 className="text-xl font-bold text-gray-900 mb-1 border-l-4 border-amber-500 pl-4">
              Pourquoi faire appel à un {service.name.toLowerCase()} professionnel à {location.name} ?
            </h2>
            <div className="mt-6 space-y-4">
              {trade.certifications && trade.certifications.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Certifications et garanties</h3>
                  <div className="flex flex-wrap gap-2">
                    {trade.certifications.map((cert, i) => (
                      <span key={i} className="text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {trade.tips && trade.tips.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Conseils d&apos;expert</h3>
                  <ul className="space-y-1">
                    {trade.tips.slice(0, 3).map((tip, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-slate-400 mt-0.5">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* Trade pricing context */}
      {trade && (
        <section className="py-16 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
            <div className="bg-white rounded-2xl border border-slate-200/60 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-1 border-l-4 border-amber-500 pl-4">
                Tarifs {service.name.toLowerCase()} à {location.name}
              </h2>
              <p className="text-gray-600 mb-6 text-sm pl-[calc(1rem+4px)]">
                Tarif horaire moyen à {location.name} : <strong className="text-gray-900">{Math.round(trade.priceRange.min * pricingMultiplier)}–{Math.round(trade.priceRange.max * pricingMultiplier)} {trade.priceRange.unit}</strong>.
                {pricingMultiplier !== 1.0 && ' Tarifs ajustés à la zone géographique.'}
                {pricingMultiplier === 1.0 && ' Les prix peuvent varier selon la complexité des travaux et le professionnel choisi.'}
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {trade.commonTasks.slice(0, 6).map((task, i) => {
                  const [label, price] = task.split(' : ')
                  const adjustedPrice = price && pricingMultiplier !== 1.0
                    ? price.replace(/\d[\d\s]*/g, (m) => {
                        const n = parseInt(m.replace(/\s/g, ''), 10)
                        return isNaN(n) ? m : String(Math.round(n * pricingMultiplier))
                      })
                    : price
                  return (
                    <div key={i} className="flex items-start justify-between gap-3 p-3 bg-slate-50 rounded-2xl text-sm border border-slate-100">
                      <span className="text-gray-700">{label}</span>
                      {adjustedPrice && <span className="font-semibold text-amber-700 whitespace-nowrap">{adjustedPrice}</span>}
                    </div>
                  )
                })}
              </div>
              {trade.emergencyInfo && (
                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl">
                  <p className="text-sm text-red-800">
                    <strong>Urgence {service.name.toLowerCase()} à {location.name} :</strong>{' '}
                    {trade.averageResponseTime}
                  </p>
                </div>
              )}
              <Link
                href={`/tarifs-artisans/${serviceSlug}`}
                className="inline-flex items-center gap-2 mt-6 text-blue-600 hover:text-blue-800 text-sm font-medium group"
              >
                Voir tous les tarifs {service.name.toLowerCase()} en France
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* FAQ accordion — premium card style (trade FAQ hash-selected + location-specific) */}
      {combinedFaq.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
            <div className="bg-white rounded-2xl border border-slate-200/60 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-l-4 border-amber-500 pl-4">
                Questions fréquentes — {service.name.toLowerCase()} à {location.name}
              </h2>
              <div className="space-y-3">
                {combinedFaq.map((item, i) => (
                  <details
                    key={i}
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden"
                  >
                    <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-left hover:bg-slate-50 transition-colors [&::-webkit-details-marker]:hidden list-none">
                      <span className="font-semibold text-slate-900 pr-4">{item.question}</span>
                      <svg className="w-5 h-5 text-slate-400 shrink-0 group-open:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-5 text-slate-600 leading-relaxed text-sm">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* Articles utiles — liens contextuels vers le blog */}
      <section className="py-16 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-l-4 border-amber-500 pl-4">
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
                  className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-200 transition-colors group"
                >
                  <span className="text-2xl shrink-0" aria-hidden="true">&#128295;</span>
                  <div>
                    <span className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Comment choisir son plombier ?</span>
                    <p className="text-sm text-gray-500 mt-1">Les critères essentiels pour trouver un plombier fiable et compétent.</p>
                  </div>
                </Link>
                <Link
                  href="/blog/urgence-plomberie-que-faire"
                  className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-200 transition-colors group"
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
                  className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-200 transition-colors group"
                >
                  <span className="text-2xl shrink-0" aria-hidden="true">&#127969;</span>
                  <div>
                    <span className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Rénovation énergétique 2026 : aides et conseils</span>
                    <p className="text-sm text-gray-500 mt-1">Découvrez les aides disponibles et les travaux prioritaires pour votre logement.</p>
                  </div>
                </Link>
                <Link
                  href="/blog/tendances-decoration-2026"
                  className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-200 transition-colors group"
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
                  className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-200 transition-colors group"
                >
                  <span className="text-2xl shrink-0" aria-hidden="true">&#127912;</span>
                  <div>
                    <span className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Tendances décoration 2026</span>
                    <p className="text-sm text-gray-500 mt-1">Les styles et matériaux qui font la tendance cette année.</p>
                  </div>
                </Link>
                <Link
                  href="/blog/renovation-energetique-2026"
                  className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-200 transition-colors group"
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

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* Voir aussi - Cross Links Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 border-l-4 border-amber-500 pl-4">Voir aussi</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Autres services dans cette ville */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Autres artisans à {location.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {otherServices.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/services/${s.slug}/${locationSlug}`}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-full text-sm font-medium border border-slate-100 hover:border-blue-200 transition-colors"
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
              <Link
                href={`/villes/${locationSlug}`}
                className="inline-flex items-center gap-1 mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium group"
              >
                Tous les artisans à {location.name}
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>

            {/* Ce service dans les villes proches */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                {service.name} près de {location.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {nearbyCities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/services/${serviceSlug}/${city.slug}`}
                    className="inline-flex items-center gap-1 px-3.5 py-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-full text-sm font-medium border border-slate-100 hover:border-blue-200 transition-colors"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>
              <Link
                href={`/services/${serviceSlug}`}
                className="inline-flex items-center gap-1 mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium group"
              >
                Voir toutes les villes
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>

            {/* Navigation régionale */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Explorer par zone
              </h3>
              <div className="space-y-2">
                {location.region_name && (
                  <Link
                    href={`/regions/${getRegionSlugByName(location.region_name) || slugify(location.region_name)}`}
                    className="flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-xl text-sm font-medium border border-gray-100 hover:border-blue-200 transition-colors"
                  >
                    <svg className="w-4 h-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Artisans en {location.region_name}
                  </Link>
                )}
                {location.department_name && location.department_code && (
                  <Link
                    href={`/departements/${getDepartementByCode(location.department_code)?.slug || slugify(location.department_name)}`}
                    className="flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-xl text-sm font-medium border border-gray-100 hover:border-blue-200 transition-colors"
                  >
                    <svg className="w-4 h-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Artisans dans {location.department_name} ({location.department_code})
                  </Link>
                )}
              </div>
            </div>
            {/* Cross-service callouts */}
            {otherServices.slice(0, 3).map((s) => (
              <Link
                key={`cross-${s.slug}`}
                href={`/services/${s.slug}/${locationSlug}`}
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-200 transition-colors group"
              >
                <span className="text-sm text-slate-700 font-medium">
                  Besoin d&apos;un {s.name.toLowerCase()} à {location.name} ?
                </span>
                <svg className="w-4 h-4 text-slate-400 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            ))}

            {/* Villes du département */}
            {deptCities.length > 3 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 md:col-span-2 lg:col-span-3">
                <h3 className="font-semibold text-gray-900 mb-4">
                  {service.name} dans {location.department_name ? `le ${location.department_name}` : 'le département'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {deptCities.map((city) => (
                    <Link
                      key={city.slug}
                      href={`/services/${serviceSlug}/${city.slug}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-full text-sm border border-slate-100 hover:border-blue-200 transition-colors"
                    >
                      {city.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* Trust & Safety Links (E-E-A-T) */}
      <section className="py-8 bg-white">
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

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* Editorial credibility signal */}
      <section className="py-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-gray-400 leading-relaxed max-w-3xl">
            Les artisans référencés sur cette page sont des entreprises immatriculées vérifiées via l&apos;API SIRENE de l&apos;INSEE.
            Les tarifs affichés sont indicatifs et basés sur les moyennes du marché en {location.region_name || 'France'}.
            ServicesArtisans est un annuaire indépendant — nous ne réalisons pas de travaux et ne percevons aucune commission.
          </p>
        </div>
      </section>

      {/* Internal Links Footer */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PopularServicesLinks showTitle={true} limit={8} />
        </div>
      </section>
    </>
  )
}
