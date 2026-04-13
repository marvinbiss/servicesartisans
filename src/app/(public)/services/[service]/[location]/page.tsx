import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getServiceBySlug,
  getLocationBySlug,
  getProvidersByServiceAndLocation,
  getProvidersByServiceAndDepartment,
  getProviderCountByServiceAndLocation,
  getRgeProviderCountByServiceAndLocation,
} from '@/lib/supabase'
import ServiceLocationPageClient from './PageClient'
import SeoContent from './_components/SeoContent'
import TradeSections from './_components/TradeSections'
import FaqAndBlogSection from './_components/FaqAndBlogSection'
import CrossLinks from './_components/CrossLinks'
import CrossIntentLinks from '@/components/seo/CrossIntentLinks'
import DeepPageLinks from '@/components/seo/DeepPageLinks'
import MoneyPageBoost from '@/components/seo/MoneyPageBoost'
import SeasonalLinks from '@/components/seo/SeasonalLinks'
import InContentLinks from '@/components/seo/InContentLinks'
import ImmediateAnswerBlock from '@/components/seo/ImmediateAnswerBlock'
import LocalInsightsBlock from '@/components/seo/LocalInsightsBlock'
import RisquesGeoBlock from '@/components/seo/RisquesGeoBlock'
import PrimesCEEBlock from '@/components/seo/PrimesCEEBlock'
import BarometrePrixBlock from '@/components/seo/BarometrePrixBlock'
import ContexteDPEBlock from '@/components/seo/ContexteDPEBlock'
import CalendrierSaisonnierBlock from '@/components/seo/CalendrierSaisonnierBlock'
import CommuneContextBlock from '@/components/seo/CommuneContextBlock'
import ProblemesCourantsBlock from '@/components/seo/ProblemesCourantsBlock'
import ComparatifsBlock from '@/components/seo/ComparatifsBlock'
import MaillageInterneBlock from '@/components/seo/MaillageInterneBlock'

import {
  getBreadcrumbSchema,
  getItemListSchema,
  getSpeakableSchema,
  getEnrichedLocalServiceSchema,
} from '@/lib/seo/jsonld'
import { popularServices, relatedServices } from '@/lib/constants/navigation'
import Breadcrumb from '@/components/Breadcrumb'
import { getArtisanUrl } from '@/lib/utils'
import { getServiceImageForContext } from '@/lib/data/images'
import {
  services as staticServicesList,
  villes,
  getVilleBySlug,
  getNearbyCities,
} from '@/lib/data/france'
import { getTradeContent } from '@/lib/data/trade-content'
import {
  generateFAQSchema,
  generateSpeakableSchema,
  generateAggregateRatingSchema,
  generateItemListSchema,
} from '@/lib/seo/schema-enrichment'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import {
  generateLocationContent,
  hashCode,
  getRegionalMultiplier,
} from '@/lib/seo/location-content'
import { getNaturalTerm } from '@/lib/seo/natural-terms'
import { getPageContent } from '@/lib/cms'
import { shouldNoindex } from '@/lib/seo/pruning'
import { logger } from '@/lib/logger'
import { CmsContent } from '@/components/CmsContent'
import { SpeakableAnswerBox } from '@/components/SpeakableAnswerBox'
import { getCommuneBySlug } from '@/lib/data/commune-data'
import StickyMobileCTA from '@/components/StickyMobileCTA'
import SearchRecorder from '@/components/SearchRecorder'
import DemandIndicator from '@/components/DemandIndicator'
import LocalProviderShowcase from '@/components/seo/LocalProviderShowcase'
import FallbackProviders from '@/components/seo/FallbackProviders'
import ReviewsDeptBlock from '@/components/seo/ReviewsDeptBlock'
import DevisCounterBlock from '@/components/seo/DevisCounterBlock'
import FreshnessSignal from '@/components/seo/FreshnessSignal'
import GlossaireTooltips from '@/components/seo/GlossaireTooltips'
import UserQuestionBlock from '@/components/seo/UserQuestionBlock'
import PhotoGalleryBlock from '@/components/seo/PhotoGalleryBlock'
import AEOAnswerBlock from '@/components/seo/AEOAnswerBlock'
import { getReviewStatsByDept, getTopReviewsByDept } from '@/lib/supabase'
import { getDynamicLastModified } from '@/lib/seo/dynamic-lastmod'
import dynamic from 'next/dynamic'
import IntentNavBar from '@/components/seo/IntentNavBar'
import type { Service, Location as LocationType, Provider } from '@/types'

const GeoPageCTA = dynamic(() => import('@/components/conversion/GeoPageCTA'), { ssr: false })

const MicroConversions = dynamic(() => import('@/components/MicroConversions'), { ssr: false })

const CallbackRequest = dynamic(() => import('@/components/CallbackRequest'), { ssr: false })

const InlineTestimonial = dynamic(() => import('@/components/conversion/InlineTestimonial'), {
  ssr: false,
})

// Safely escape JSON for script tags to prevent XSS
function safeJsonStringify(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

// ISR: revalidate every 24h — stale cache served on DB outage
export const revalidate = 86400
// Allow on-demand ISR for cities not pre-rendered at build time
export const dynamicParams = true

// Pre-render top 10 cities (47 × 10 = 470 pages) — rest via ISR on-demand
const TOP_CITIES_COUNT = 10
export function generateStaticParams() {
  const topCities = villes.slice(0, TOP_CITIES_COUNT)
  return staticServicesList.flatMap((s) =>
    topCities.map((v) => ({ service: s.slug, location: v.slug }))
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
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

// Valid slug: lowercase alphanumeric + hyphens, 2-80 chars, no leading/trailing hyphen
const VALID_SLUG = /^[a-z0-9][a-z0-9-]{0,78}[a-z0-9]$/

/** Truncate title to ~58 chars for Google's display limit */
function truncateTitle(title: string, maxLen = 58): string {
  if (title.length <= maxLen) return title
  return title.slice(0, maxLen - 1).replace(/\s+\S*$/, '') + '…'
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { service: serviceSlug, location: locationSlug } = await params

  // Early reject: invalid slugs
  if (!VALID_SLUG.test(serviceSlug) || !VALID_SLUG.test(locationSlug)) {
    notFound()
  }

  let serviceName = ''
  let locationName = ''
  let departmentCode = ''
  let departmentName = ''
  // Fail open: default to indexed. ISR will correct if truly 0 providers.
  let providerCount = 1

  try {
    const [service, location, count] = await Promise.all([
      getServiceBySlug(serviceSlug),
      getLocationBySlug(locationSlug) as Promise<import('@/types').Location | null>,
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
    const staticSvc = staticServicesList.find((s) => s.slug === serviceSlug)
    const ville = getVilleBySlug(locationSlug)
    if (staticSvc) serviceName = staticSvc.name
    if (ville) {
      locationName = ville.name
      departmentCode = ville.departementCode
      departmentName = ville.departement
    }
    providerCount = 1 // Fail open: default to indexed. ISR will correct if truly 0 providers.
  }

  if (!serviceName || !locationName) {
    notFound()
  }

  const hasProviders = providerCount > 0
  const svcLower = serviceName.toLowerCase()
  const naturalTerm = getNaturalTerm(serviceSlug)

  // Unified SEO seed for title + H1 coherence (same seed used in both generateMetadata and page render)
  const seoHash = Math.abs(hashCode(`seo-${serviceSlug}-${locationSlug}`))

  const seoPairs = hasProviders
    ? [
        {
          title: `${serviceName} ${locationName} 2026 — Devis Gratuit`,
          h1: `${serviceName} à ${locationName}`,
        },
        {
          title: `${serviceName} à ${locationName} : ${providerCount} Pros + Devis`,
          h1: `Trouvez ${naturalTerm.article} à ${locationName}`,
        },
        {
          title: `${serviceName} ${locationName}${departmentCode ? ` (${departmentCode})` : ''} — Devis 2026`,
          h1: `${serviceName} à ${locationName} — ${providerCount} pros référencés`,
        },
        {
          title: `${serviceName} ${locationName} 2026 : ${providerCount} Artisans`,
          h1: `${serviceName} à ${locationName}${departmentCode ? ` (${departmentCode})` : ''}`,
        },
        {
          title: `${serviceName} à ${locationName} — Devis Gratuit 2026`,
          h1: `${naturalTerm.plural.charAt(0).toUpperCase() + naturalTerm.plural.slice(1)} de confiance à ${locationName}`,
        },
      ]
    : [
        {
          title: `${serviceName} ${locationName} 2026 — Devis Gratuit`,
          h1: `${serviceName} à ${locationName}`,
        },
        {
          title: `${serviceName} à ${locationName} : Devis Gratuit 2026`,
          h1: `Trouvez ${naturalTerm.article} à ${locationName}`,
        },
        {
          title: `${serviceName} ${locationName}${departmentCode ? ` (${departmentCode})` : ''} — Devis 2026`,
          h1: `${serviceName} à ${locationName} — Artisans qualifiés`,
        },
        {
          title: `${serviceName} à ${locationName} — Artisans 2026`,
          h1: `${serviceName} à ${locationName}${departmentCode ? ` (${departmentCode})` : ''}`,
        },
        {
          title: `${serviceName} ${locationName} : Devis Gratuit 2026`,
          h1: `${naturalTerm.plural.charAt(0).toUpperCase() + naturalTerm.plural.slice(1)} de confiance à ${locationName}`,
        },
      ]

  const title = truncateTitle(seoPairs[seoHash % seoPairs.length].title)

  // Resolve trade content early for price range in descriptions
  const tradeContent = getTradeContent(serviceSlug)
  const priceTag = tradeContent
    ? `${tradeContent.priceRange.min}€–${tradeContent.priceRange.max}€`
    : ''

  // Unique meta descriptions with provider count, price range, department and CTA
  const descHash = Math.abs(hashCode(`desc-${serviceSlug}-${locationSlug}`))
  const deptLabel = departmentName || departmentCode
  const descTemplates = hasProviders
    ? [
        `Trouvez un ${svcLower} à ${locationName}. ${providerCount} artisans vérifiés${priceTag ? `, tarifs de ${priceTag}` : ''}. Devis gratuit en 2 min.`,
        `${providerCount} ${svcLower}s vérifiés à ${locationName}${deptLabel ? ` (${deptLabel})` : ''}${priceTag ? `. ${priceTag}/h` : ''}. Comparez et demandez un devis gratuit.`,
        `${serviceName} à ${locationName} : ${providerCount} pros vérifiés SIREN${priceTag ? `, ${priceTag}` : ''}. Devis gratuit, sans engagement.`,
        `Besoin d'un ${svcLower} à ${locationName} ? ${providerCount} artisans vérifiés${priceTag ? `, ${priceTag}/h` : ''}. Devis gratuit et réponse rapide.`,
        `${locationName}${departmentCode ? ` (${departmentCode})` : ''} : ${providerCount} ${svcLower}s vérifiés${priceTag ? `. Prix : ${priceTag}` : ''}. Devis gratuit.`,
      ]
    : [
        `Trouvez un ${svcLower} à ${locationName}${deptLabel ? ` (${deptLabel})` : ''}${priceTag ? `. Tarifs : ${priceTag}` : ''}. Devis gratuit en 2 min.`,
        `${serviceName} à ${locationName}${departmentCode ? ` (${departmentCode})` : ''} : artisans vérifiés SIREN${priceTag ? `, ${priceTag}` : ''}. Devis gratuit.`,
        `Besoin d'un ${svcLower} à ${locationName} ? Artisans vérifiés${priceTag ? `, tarifs de ${priceTag}` : ''}. Devis gratuit.`,
        `${serviceName} à ${locationName}${priceTag ? `. ${priceTag}/h` : ''}. Professionnels vérifiés SIREN. Devis gratuit.`,
        `${locationName}${deptLabel ? ` (${deptLabel})` : ''} : trouvez un ${svcLower} de confiance${priceTag ? `, ${priceTag}` : ''}. Devis gratuit.`,
      ]
  const description = descTemplates[descHash % descTemplates.length]

  // Pruning: noindex pages with zero providers AND no unique data (fail-open safe)
  // Only fetch commune data when providerCount is 0 (the only case where hasUniqueData matters)
  let communeExists = false
  if (providerCount === 0) {
    try {
      communeExists = !!(await getCommuneBySlug(locationSlug))
    } catch {
      communeExists = false
    }
  }
  const isNoindex = shouldNoindex(`/services/${serviceSlug}/${locationSlug}`, {
    providerCount,
    isQuartierPage: false,
    hasUniqueData: !!(tradeContent || communeExists),
  })

  return {
    title,
    description,
    robots: isNoindex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          'max-snippet': -1 as const,
          'max-image-preview': 'large' as const,
          'max-video-preview': -1 as const,
        },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'fr_FR',
      images: [
        {
          url: getServiceImageForContext(serviceSlug, locationSlug).src,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [getServiceImageForContext(serviceSlug, locationSlug).src],
    },
    alternates: getAlternates(`/services/${serviceSlug}/${locationSlug}`),
  }
}

// JSON-LD structured data for SEO
function generateJsonLd(
  service: Service,
  location: LocationType,
  _providers: unknown[],
  serviceSlug: string,
  locationSlug: string,
  communeData: Awaited<ReturnType<typeof getCommuneBySlug>> | null
) {
  const svcLower = service.name.toLowerCase()
  const trade = getTradeContent(serviceSlug)

  const localBusinessSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `${service.name} à ${location.name}`,
    description: `Trouvez un ${svcLower} qualifié à ${location.name}. Artisans vérifiés SIREN, devis gratuit et avis clients.`,
    image: getServiceImageForContext(serviceSlug, locationSlug).src,
    address: {
      '@type': 'PostalAddress',
      addressLocality: location.name,
      ...(location.region_name ? { addressRegion: location.region_name } : {}),
      addressCountry: 'FR',
      ...(location.postal_code ? { postalCode: location.postal_code } : {}),
    },
    ...(communeData?.latitude && communeData?.longitude
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: communeData.latitude,
            longitude: communeData.longitude,
          },
        }
      : {}),
    areaServed: {
      '@type': 'City',
      name: location.name,
      ...(location.department_name
        ? {
            containedInPlace: {
              '@type': 'AdministrativeArea',
              name: location.department_name,
            },
          }
        : {}),
    },
    ...(trade ? { priceRange: `${trade.priceRange.min}€–${trade.priceRange.max}€` } : {}),
    url: `${SITE_URL}/services/${serviceSlug}/${locationSlug}`,
    dateModified: new Date().toISOString().split('T')[0],
  }

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${service.name} à ${location.name}`,
    description: `Trouvez des ${svcLower}s qualifiés et vérifiés à ${location.name}`,
    image: getServiceImageForContext(serviceSlug, locationSlug).src,
    serviceType: service.name,
    inLanguage: 'fr-FR',
    areaServed: {
      '@type': 'City',
      name: location.name,
      containedInPlace: [
        ...(location.department_name
          ? [
              {
                '@type': 'AdministrativeArea' as const,
                name: location.department_name,
              },
            ]
          : []),
        ...(location.region_name
          ? [
              {
                '@type': 'AdministrativeArea' as const,
                name: location.region_name,
              },
            ]
          : []),
      ],
    },
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: 'ServicesArtisans',
    },
    ...(trade
      ? {
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: `Prestations ${svcLower} à ${location.name}`,
            itemListElement: trade.commonTasks.slice(0, 8).map((task) => {
              const parts = task.split(':')
              return {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: parts[0].trim(),
                },
              }
            }),
          },
        }
      : {}),
    dateModified: new Date().toISOString().split('T')[0],
  }

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Services', url: '/services' },
    { name: service.name, url: `/services/${serviceSlug}` },
    { name: location.name, url: `/services/${serviceSlug}/${locationSlug}` },
  ])

  return [localBusinessSchema, serviceSchema, breadcrumbSchema]
}

export default async function ServiceLocationPage({ params, searchParams }: PageProps) {
  const { service: serviceSlug, location: locationSlug } = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const rgeOnly = resolvedSearchParams.rge === '1'

  // Early reject: invalid slugs (XSS attempts, random strings, special chars)
  if (!VALID_SLUG.test(serviceSlug) || !VALID_SLUG.test(locationSlug)) {
    notFound()
  }

  // CMS override — if admin published content for this specific service+city page
  let cmsPage = null
  try {
    cmsPage = await getPageContent(`${serviceSlug}-${locationSlug}`, 'location', {
      serviceSlug,
      locationSlug,
    })
  } catch (err) {
    logger.error('[CMS] Error fetching page content for', {
      slug: `${serviceSlug}-${locationSlug}`,
      error: err,
    })
  }

  if (cmsPage?.content_html) {
    return (
      <div className="min-h-screen bg-sand-50">
        <section className="bg-white border-b border-sand-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="font-heading text-3xl font-bold text-charcoal-900">{cmsPage.title}</h1>
          </div>
        </section>
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4">
            <CmsContent html={cmsPage.content_html} />
          </div>
        </section>
      </div>
    )
  }

  // 1. Resolve service + location in parallel (DB → static fallback) — notFound() OUTSIDE try/catch
  const [resolvedService, resolvedLocation] = await Promise.all([
    // Service resolution
    (async (): Promise<Service | null> => {
      try {
        const svc = await getServiceBySlug(serviceSlug)
        if (svc) return svc
        const staticSvc = staticServicesList.find((s) => s.slug === serviceSlug)
        if (staticSvc)
          return {
            id: '',
            name: staticSvc.name,
            slug: staticSvc.slug,
            is_active: true,
            created_at: '',
          }
        return null
      } catch {
        const staticSvc = staticServicesList.find((s) => s.slug === serviceSlug)
        if (staticSvc)
          return {
            id: '',
            name: staticSvc.name,
            slug: staticSvc.slug,
            is_active: true,
            created_at: '',
          }
        return null
      }
    })(),
    // Location resolution
    (async (): Promise<LocationType | null> => {
      try {
        const dbLocation = await getLocationBySlug(locationSlug)
        if (dbLocation) {
          return {
            ...dbLocation,
            id: ((dbLocation as Record<string, unknown>).code_insee as string) || '',
          }
        }
        return villeToLocation(locationSlug)
      } catch {
        return villeToLocation(locationSlug)
      }
    })(),
  ])
  if (!resolvedService) notFound()
  const service: Service = resolvedService
  if (!resolvedLocation || !resolvedLocation.name) notFound()
  const location: LocationType = resolvedLocation

  const trade = getTradeContent(serviceSlug)
  const deptName = location.department_name || getVilleBySlug(locationSlug)?.departement

  // 2. Fetch ALL async data in a single parallel batch
  const [providersResult, communeData, recentDevisCount, reviewStats, topReviews, dynamicLastMod] =
    await Promise.all([
      // Providers + count + RGE count, with department fallback
      (async () => {
        const [directProviders, totalProviderCount, rgeProviderCount] = await Promise.all([
          getProvidersByServiceAndLocation(serviceSlug, locationSlug, { rgeOnly }),
          getProviderCountByServiceAndLocation(serviceSlug, locationSlug, { rgeOnly }).catch(
            () => -1
          ),
          getRgeProviderCountByServiceAndLocation(serviceSlug, locationSlug).catch(() => 0),
        ])
        let providers = directProviders
        let isFallback = false
        if (providers.length === 0 && totalProviderCount <= 0) {
          if (deptName) {
            providers = await getProvidersByServiceAndDepartment(serviceSlug, deptName, {
              limit: 6,
            })
            isFallback = providers.length > 0
          }
          if (providers.length === 0) return null // signal notFound
        }
        return { providers, isFallback, totalProviderCount, rgeProviderCount }
      })(),
      // Commune enrichment (best-effort, never crash)
      getCommuneBySlug(locationSlug).catch(() => null) as Promise<
        Awaited<ReturnType<typeof getCommuneBySlug>>
      >,
      // Recent devis count
      (async () => {
        if (process.env.NEXT_BUILD_SKIP_DB === '1' && !process.env.NEXT_PUBLIC_SUPABASE_URL)
          return 0
        try {
          const { createAdminClient } = await import('@/lib/supabase/admin')
          const supabase = createAdminClient()
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          const { count } = await supabase
            .from('devis_requests')
            .select('*', { count: 'exact', head: true })
            .ilike('city', location.name)
            .gte('created_at', thirtyDaysAgo.toISOString())
          return count ?? 0
        } catch {
          return 0
        }
      })(),
      // Social proof: department reviews
      deptName
        ? getReviewStatsByDept(serviceSlug, deptName).catch(() => null)
        : Promise.resolve(null),
      deptName
        ? getTopReviewsByDept(serviceSlug, deptName).catch(() => [])
        : Promise.resolve([] as Awaited<ReturnType<typeof getTopReviewsByDept>>),
      deptName
        ? getDynamicLastModified(serviceSlug, location.department_code || '').catch(() => null)
        : Promise.resolve(null),
    ])

  // Hard 404: if BOTH direct and department fallback return 0 results
  if (!providersResult) notFound()
  const { providers, isFallback, totalProviderCount, rgeProviderCount } = providersResult

  const baseSchemas = generateJsonLd(
    service,
    location,
    providers || [],
    serviceSlug,
    locationSlug,
    communeData
  )

  // Generate unique SEO content per service+location combo (doorway-page mitigation)
  const ville = getVilleBySlug(locationSlug)
  const locationContent = ville
    ? generateLocationContent(serviceSlug, service.name, ville, providers.length, communeData)
    : null

  // Regional pricing multiplier for localized tariffs
  const pricingMultiplier = ville ? getRegionalMultiplier(ville.region, ville.departementCode) : 1.0

  // Compute average rating and total reviews from provider data (for ImmediateAnswerBlock)
  const ratedProviders = providers.filter((p) => p.rating_average && p.rating_average > 0)
  const averageRating =
    ratedProviders.length > 0
      ? ratedProviders.reduce((sum, p) => sum + (p.rating_average ?? 0), 0) / ratedProviders.length
      : null
  const totalReviews = ratedProviders.reduce((sum, p) => sum + (p.review_count ?? 0), 0) || null

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

  // AEO-optimized contextual FAQs — service+ville specific, mention ServicesArtisans for LLM citation
  const svcLowerFaq = service.name.toLowerCase()
  if (trade) {
    combinedFaq.push({
      question: `Combien coûte un ${svcLowerFaq} à ${location.name} ?`,
      answer: `À ${location.name}, les tarifs d'un ${svcLowerFaq} varient généralement entre ${Math.round(trade.priceRange.min * pricingMultiplier)}€ et ${Math.round(trade.priceRange.max * pricingMultiplier)}€ ${trade.priceRange.unit}. Ces prix dépendent de la complexité des travaux, de l'accessibilité et des matériaux. Sur ServicesArtisans, vous pouvez comparer gratuitement les devis de ${svcLowerFaq}s vérifiés SIREN à ${location.name}.`,
    })
    combinedFaq.push({
      question: `Comment trouver un ${svcLowerFaq} fiable à ${location.name} ?`,
      answer: `Pour trouver un ${svcLowerFaq} de confiance à ${location.name}, vérifiez son numéro SIREN, consultez les avis clients et demandez plusieurs devis. ServicesArtisans référence uniquement des artisans vérifiés à ${location.name}${location.department_name ? ` (${location.department_name})` : ''} et permet de comparer les profils, avis et tarifs gratuitement.`,
    })
    combinedFaq.push({
      question: `Quel est le délai d'intervention d'un ${svcLowerFaq} à ${location.name} ?`,
      answer: `Le délai moyen d'intervention d'un ${svcLowerFaq} à ${location.name} est de ${trade.averageResponseTime}. Ce délai peut varier selon la saison et la demande locale.${trade.emergencyInfo ? ` En cas d'urgence, certains artisans référencés sur ServicesArtisans proposent une intervention rapide 24h/24.` : ` Sur ServicesArtisans, vous pouvez contacter directement les artisans disponibles pour obtenir un rendez-vous rapide.`}`,
    })
    if (totalProviderCount > 0) {
      combinedFaq.push({
        question: `Combien de ${svcLowerFaq}s sont disponibles à ${location.name} ?`,
        answer: `${location.name} compte actuellement ${totalProviderCount} ${svcLowerFaq}${totalProviderCount > 1 ? 's' : ''} référencé${totalProviderCount > 1 ? 's' : ''} sur ServicesArtisans, tous vérifiés SIREN.${averageRating ? ` La note moyenne des artisans est de ${averageRating.toFixed(1)}/5.` : ''} Demandez un devis gratuit pour comparer leurs offres.`,
      })
    }
  }

  // Task 2: ItemList JSON-LD for provider listings
  const itemListSchema =
    providers.length > 0
      ? getItemListSchema({
          name: `${service.name} à ${location.name}`,
          description: `Liste des ${service.name.toLowerCase()}s référencés à ${location.name}`,
          url: `/services/${serviceSlug}/${locationSlug}`,
          items: providers.slice(0, 20).map((p, i) => ({
            name: p.name,
            url: getArtisanUrl({
              stable_id: p.stable_id,
              slug: p.slug,
              specialty: p.specialty,
              city: p.address_city,
            }),
            position: i + 1,
            image: getServiceImageForContext(serviceSlug, locationSlug).src,
            rating: p.rating_average ?? undefined,
            reviewCount: p.review_count ?? undefined,
          })),
        })
      : null

  const jsonLdSchemas: Record<string, unknown>[] = [
    ...baseSchemas,
    ...(itemListSchema ? [itemListSchema] : []),
  ]

  // Cross-link to semantically related services (with fallback to popular)
  const relatedSlugs = relatedServices[serviceSlug] || []
  const otherServices =
    relatedSlugs.length > 0
      ? (relatedSlugs
          .slice(0, 5)
          .map((slug) => {
            const svc = staticServicesList.find((s) => s.slug === slug)
            return svc ? { slug: svc.slug, name: svc.name, icon: svc.icon } : null
          })
          .filter(Boolean) as { slug: string; name: string; icon: string }[])
      : popularServices.filter((s) => s.slug !== serviceSlug).slice(0, 5)
  const nearbyCities = getNearbyCities(locationSlug, 6)
  const deptCities: { slug: string; name: string }[] = [] // Removed: duplicated by DeepPageLinks module 3

  // H1 uses same seed as title for coherence (seo- prefix)
  const providerCount = totalProviderCount
  const seoHashH1 = Math.abs(hashCode(`seo-${serviceSlug}-${locationSlug}`))
  const naturalTermH1 = getNaturalTerm(serviceSlug)
  const hasProvidersH1 = providerCount > 0
  const h1Variants = hasProvidersH1
    ? [
        `${service.name} à ${location.name}`,
        `Trouvez ${naturalTermH1.article} à ${location.name}`,
        `${service.name} à ${location.name} — ${providerCount} pros référencés`,
        `${service.name} à ${location.name}${location.department_code ? ` (${location.department_code})` : ''}`,
        `${naturalTermH1.plural.charAt(0).toUpperCase() + naturalTermH1.plural.slice(1)} de confiance à ${location.name}`,
      ]
    : [
        `${service.name} à ${location.name}`,
        `Trouvez ${naturalTermH1.article} à ${location.name}`,
        `${service.name} à ${location.name} — Artisans qualifiés`,
        `${service.name} à ${location.name}${location.department_code ? ` (${location.department_code})` : ''}`,
        `${naturalTermH1.plural.charAt(0).toUpperCase() + naturalTermH1.plural.slice(1)} de confiance à ${location.name}`,
      ]
  const h1Text = h1Variants[seoHashH1 % h1Variants.length]

  const speakableSchema = getSpeakableSchema({
    url: `${SITE_URL}/services/${serviceSlug}/${locationSlug}`,
    title: h1Text,
  })
  jsonLdSchemas.push(speakableSchema)

  // Enriched FAQ schema from schema-enrichment (supplements existing faqSchema)
  const enrichedFaqSchema = generateFAQSchema(
    combinedFaq.map((f) => ({ question: f.question, answer: f.answer }))
  )
  if (enrichedFaqSchema) jsonLdSchemas.push(enrichedFaqSchema)

  // Aggregate rating schema (only from first-party review stats, not scraped data)
  if (reviewStats && reviewStats.avg_rating > 0 && reviewStats.review_count > 0) {
    const aggRatingSchema = generateAggregateRatingSchema({
      serviceName: service.name,
      villeName: location.name,
      avgRating: reviewStats.avg_rating,
      reviewCount: reviewStats.review_count,
      serviceSlug,
      villeSlug: locationSlug,
    })
    if (aggRatingSchema) jsonLdSchemas.push(aggRatingSchema)
  }

  // ItemList schema for top providers (enriched version)
  if (providers.length > 0) {
    const enrichedItemList = generateItemListSchema({
      serviceName: service.name,
      villeName: location.name,
      providers: providers.slice(0, 10).map((p) => ({
        name: p.name,
        slug: p.slug,
        rating_average: p.rating_average,
        review_count: p.review_count,
      })),
      serviceSlug,
      villeSlug: locationSlug,
    })
    if (enrichedItemList) jsonLdSchemas.push(enrichedItemList)
  }

  // Enriched speakable schema targeting specific CSS classes
  const enrichedSpeakable = generateSpeakableSchema({
    url: `${SITE_URL}/services/${serviceSlug}/${locationSlug}`,
    title: h1Text,
    cssSelectors: ['.speakable-summary', '.speakable-faq'],
  })
  jsonLdSchemas.push(enrichedSpeakable)

  // Schema enrichi avec OfferCatalog, AggregateRating et areaServed détaillé
  jsonLdSchemas.push(
    getEnrichedLocalServiceSchema({
      serviceName: trade?.name || service.name,
      serviceType: trade?.name || service.name,
      description: `${service.name} à ${location.name} — artisans référencés SIREN. Devis gratuit.`,
      cityName: location.name,
      regionName: location.region_name || '',
      departmentName: location.department_name || '',
      url: `${SITE_URL}/services/${serviceSlug}/${locationSlug}`,
      image: getServiceImageForContext(serviceSlug, locationSlug).src,
      ...(trade
        ? {
            lowPrice: trade.priceRange.min,
            highPrice: trade.priceRange.max,
            priceUnit: trade.priceRange.unit,
            tasks: trade.commonTasks.slice(0, 10).map((task) => {
              const parts = task.split(':')
              return {
                name: parts[0].trim(),
                description: parts.length > 1 ? parts[1].trim() : undefined,
              }
            }),
          }
        : {}),
      // NE PAS injecter ratingValue/reviewCount ici : ces valeurs viennent de
      // providers.rating_average/review_count (données scrapées Google/PJ, pas
      // d'avis vérifiés plateforme). Émettre un AggregateRating basé sur des
      // avis non first-party = déclencheur de pénalité Google "review spam".
      // Le calcul est gardé pour le rendu front (ImmediateAnswerBlock).
      providerCount: providers.length,
    })
  )

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
      <div className="bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Breadcrumb
            items={[
              { label: 'Services', href: '/services' },
              { label: service.name, href: `/services/${serviceSlug}` },
              { label: location.name },
            ]}
          />
        </div>
      </div>

      <IntentNavBar
        serviceSlug={serviceSlug}
        villeSlug={locationSlug}
        currentIntent="services"
        serviceName={service.name}
        villeName={location.name}
        providerCount={totalProviderCount}
        avgRating={averageRating ?? undefined}
        reviewCount={totalReviews ?? undefined}
      />

      {/* SSR H1 — always in server component HTML for Googlebot */}
      <div className="bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal-900 tracking-tight">
            {h1Text}
          </h1>
          {(location.department_name || location.postal_code) && (
            <p className="text-charcoal-500 text-sm mt-1">
              {location.department_name
                ? `${location.department_name}${location.department_code ? ` (${location.department_code})` : ''}`
                : location.postal_code}
              {totalProviderCount > 0 &&
                ` — ${totalProviderCount} artisan${totalProviderCount > 1 ? 's' : ''} vérifié${totalProviderCount > 1 ? 's' : ''}`}
            </p>
          )}
        </div>
      </div>

      {/* JSON-LD LocalBusiness schemas for top providers (SEO only, no visual cards
           — the visual listing is handled by ServiceLocationPageClient below to avoid
           duplicate "Voir le profil" buttons for the same artisan on desktop) */}
      {!isFallback && (
        <LocalProviderShowcase
          providers={(providers || []).slice(0, 3)}
          serviceName={service.name}
          cityName={location.name}
          max={3}
          jsonLdOnly
        />
      )}

      {/* Fallback: département-level providers when 0 local providers */}
      {isFallback && (
        <FallbackProviders
          providers={providers}
          departmentName={location.department_name || ville?.departement || ''}
          serviceName={service.name}
          serviceSlug={serviceSlug}
          villeSlug={locationSlug}
          villeName={location.name}
        />
      )}

      {/* SSR provider links — crawlable by Googlebot even without JS execution */}
      {providers.length > 0 && !isFallback && (
        <div className="sr-only" aria-hidden="true">
          <ul>
            {providers.slice(0, 10).map((p) => (
              <li key={p.id}>
                <a
                  href={getArtisanUrl({
                    stable_id: p.stable_id,
                    slug: p.slug,
                    specialty: p.specialty,
                    city: p.address_city,
                  })}
                >
                  {p.name}
                </a>
                {p.address_city && <span> — {p.address_city}</span>}
                {p.rating_average && p.rating_average > 0 && (
                  <span>
                    {' '}
                    — Note : {p.rating_average.toFixed(1)}/5
                    {p.review_count ? ` (${p.review_count} avis)` : ''}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <SearchRecorder
        type="service-ville"
        label={`${service.name} à ${location.name}`}
        href={`/services/${serviceSlug}/${locationSlug}`}
      />

      {/* Immediate Answer Block — Position 0 / Featured Snippet target */}
      <div className="py-4 bg-sand-50">
        <ImmediateAnswerBlock
          serviceName={service.name}
          villeName={location.name}
          trade={trade ?? null}
          minPrice={trade ? Math.round(trade.priceRange.min * pricingMultiplier) : undefined}
          maxPrice={trade ? Math.round(trade.priceRange.max * pricingMultiplier) : undefined}
          providerCount={totalProviderCount}
          averageRating={averageRating}
          totalReviews={totalReviews}
          variant="services"
        />
      </div>

      {/* Demand indicator — urgency/scarcity signal */}
      <div className="max-w-7xl mx-auto px-4 py-3 bg-sand-50">
        <DemandIndicator serviceSlug={serviceSlug} cityName={location.name} variant="banner" />
      </div>

      {/* CTA secondaire above-the-fold — pré-rempli service + ville */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GeoPageCTA
          title={`Besoin d'un ${service.name.toLowerCase()} à ${location.name} ?`}
          subtitle={`Devis gratuit et sans engagement d'artisans vérifiés`}
          service={serviceSlug}
          ville={location.name}
          variant="hero"
        />
      </div>

      {/* Page Content */}
      <ServiceLocationPageClient
        service={service}
        location={location}
        // Limit to 10 providers to reduce RSC payload (~100KB savings)
        providers={(providers || []).slice(0, 10) as unknown as Provider[]}
        h1Text={h1Text}
        totalCount={totalProviderCount}
        rgeCount={rgeProviderCount}
        serviceSlug={serviceSlug}
        locationSlug={locationSlug}
        recentDevisCount={recentDevisCount}
        rgeOnly={rgeOnly}
      />

      {trade && (
        <div className="speakable-summary max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <SpeakableAnswerBox
            answer={`${trade.name} à ${location.name} : ${trade.priceRange.min}–${trade.priceRange.max} ${trade.priceRange.unit}. ${totalProviderCount} artisans vérifiés SIREN disponibles dans le ${location.department_code}. Délai moyen : ${trade.averageResponseTime}.${trade.emergencyInfo ? ' Urgences disponibles 24h/24.' : ''}`}
          />
        </div>
      )}

      <SeoContent
        locationContent={locationContent}
        communeData={communeData}
        service={service}
        location={location}
        locationSlug={locationSlug}
        providerCount={providers.length}
        trade={trade || null}
        pricingMultiplier={pricingMultiplier}
      />

      {/* Local insights — ville-specific differentiation */}
      <LocalInsightsBlock
        communeData={communeData}
        serviceSlug={serviceSlug}
        serviceName={service.name}
        villeName={location.name}
        villeSlug={locationSlug}
        providerCount={totalProviderCount}
        regionalMultiplier={pricingMultiplier}
      />

      {trade && (
        <TradeSections
          trade={trade}
          service={service}
          location={location}
          serviceSlug={serviceSlug}
          locationSlug={locationSlug}
          pricingMultiplier={pricingMultiplier}
        />
      )}

      {/* Social proof — inline testimonial */}
      <section className="my-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InlineTestimonial count={1} />
      </section>

      <div className="speakable-faq">
        <FaqAndBlogSection
          combinedFaq={combinedFaq}
          service={service}
          location={location}
          serviceSlug={serviceSlug}
        />
      </div>

      <CrossLinks
        service={service}
        location={location}
        serviceSlug={serviceSlug}
        locationSlug={locationSlug}
        otherServices={otherServices}
        nearbyCities={nearbyCities}
        deptCities={deptCities}
        locationContent={locationContent}
        communeData={communeData}
      />

      {/* --- pSEO enrichment blocks --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProblemesCourantsBlock
          serviceSlug={serviceSlug}
          serviceName={service.name}
          villeName={location.name}
          villeSlug={locationSlug}
          climatZone={communeData?.climat_zone}
        />

        <RisquesGeoBlock
          communeData={communeData}
          serviceName={service.name}
          villeName={location.name}
        />

        <ContexteDPEBlock
          communeData={communeData}
          serviceName={service.name}
          villeName={location.name}
        />

        <BarometrePrixBlock
          serviceSlug={serviceSlug}
          serviceName={service.name}
          villeName={location.name}
          regionName={location.region_name || ''}
          revenuMedian={communeData?.revenu_median}
          prixM2Moyen={communeData?.prix_m2_moyen}
          densite={communeData?.densite_population}
        />

        <CalendrierSaisonnierBlock
          serviceSlug={serviceSlug}
          serviceName={service.name}
          villeName={location.name}
          climatZone={communeData?.climat_zone ?? null}
          joursGelAnnuels={communeData?.jours_gel_annuels}
          precipitationAnnuelle={communeData?.precipitation_annuelle}
          temperatureMoyenneHiver={communeData?.temperature_moyenne_hiver}
          temperatureMoyenneEte={communeData?.temperature_moyenne_ete}
          moisTravauxExtDebut={communeData?.mois_travaux_ext_debut}
          moisTravauxExtFin={communeData?.mois_travaux_ext_fin}
          altitudeMoyenne={communeData?.altitude_moyenne}
        />

        <CommuneContextBlock
          communeData={communeData}
          serviceName={service.name}
          villeName={location.name}
        />

        <ComparatifsBlock serviceSlug={serviceSlug} serviceName={service.name} />

        <PrimesCEEBlock
          serviceSlug={serviceSlug}
          serviceName={service.name}
          villeName={location.name}
          communeData={communeData}
        />

        <MaillageInterneBlock
          serviceSlug={serviceSlug}
          serviceName={service.name}
          villeSlug={locationSlug}
          villeName={location.name}
          departementSlug={location.department_code?.toLowerCase()}
          departementName={location.department_name}
          regionName={location.region_name}
          currentIntent="services"
        />
      </div>
      {/* --- end pSEO enrichment blocks --- */}

      {/* --- Vague 3: social proof, freshness, UGC, AEO --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AEOAnswerBlock
          serviceSlug={serviceSlug}
          serviceName={service.name}
          villeName={location.name}
          departmentName={location.department_name || ''}
          providerCount={totalProviderCount}
          avgRating={averageRating}
          priceRange={
            trade
              ? {
                  min: Math.round(trade.priceRange.min * pricingMultiplier),
                  max: Math.round(trade.priceRange.max * pricingMultiplier),
                }
              : null
          }
          communePopulation={communeData?.population ?? null}
        />

        <ReviewsDeptBlock
          serviceSlug={serviceSlug}
          serviceName={service.name}
          departmentName={location.department_name || ''}
          stats={reviewStats}
          reviews={topReviews}
        />

        <DevisCounterBlock
          count={recentDevisCount}
          serviceName={service.name}
          departmentName={location.department_name || ''}
        />

        <GlossaireTooltips serviceSlug={serviceSlug} />

        <PhotoGalleryBlock
          serviceName={service.name}
          villeName={location.name}
          departmentName={location.department_name || ''}
          providerCount={totalProviderCount}
        />

        <UserQuestionBlock
          serviceSlug={serviceSlug}
          serviceName={service.name}
          villeName={location.name}
          villeSlug={locationSlug}
        />

        <FreshnessSignal lastModified={dynamicLastMod} />
      </div>
      {/* --- end Vague 3 --- */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
        <CallbackRequest serviceSlug={serviceSlug} cityName={location.name} />
      </div>

      <InContentLinks
        serviceSlug={serviceSlug}
        serviceName={service.name}
        villeSlug={locationSlug}
        villeName={location.name}
        currentIntent="services"
        departement={location.department_name}
        departementCode={location.department_code}
        region={location.region_name}
      />

      <CrossIntentLinks
        service={serviceSlug}
        serviceName={service.name}
        ville={locationSlug}
        villeName={location.name}
        currentIntent="services"
      />

      <DeepPageLinks
        currentService={serviceSlug}
        currentVille={locationSlug}
        currentIntent="services"
        skipCrossIntent
      />

      <MoneyPageBoost currentService={serviceSlug} currentVille={locationSlug} />
      <SeasonalLinks
        currentService={serviceSlug}
        villeSlug={locationSlug}
        villeName={location.name}
      />

      {/* CTA final — Devis gratuit */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-charcoal-900 to-charcoal-800 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">
              Devis gratuit de {service.name.toLowerCase()} à {location.name}
            </h2>
            <p className="text-sand-400 text-lg mb-8 max-w-2xl mx-auto">
              Comparez les profils et obtenez un devis personnalisé d'artisans vérifiés à{' '}
              {location.name}.
            </p>
            <Link
              href={`/devis/${serviceSlug}/${locationSlug}`}
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] transition-all duration-200"
            >
              Obtenir mon devis gratuit
              <span aria-hidden="true" className="text-lg">
                &rarr;
              </span>
            </Link>
          </div>
        </div>
      </section>

      <StickyMobileCTA serviceSlug={serviceSlug} cityName={location.name} citySlug={locationSlug} />

      <MicroConversions
        pageType="service-ville"
        serviceSlug={serviceSlug}
        cityName={location.name}
      />
    </>
  )
}
