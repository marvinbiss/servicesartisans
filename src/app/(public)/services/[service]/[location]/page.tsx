import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect'
import { isNotFoundError } from 'next/dist/client/components/not-found'
import { isDynamicServerError } from 'next/dist/client/components/hooks-server-context'
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
import { getCeeOpsForRgeService } from '@/lib/rge/service-guides-map'
import MiniSimulateurInline from '@/components/conversion/MiniSimulateurInline'
import TldrBlock from '@/components/flagship/TldrBlock'
import EnBrefBox from '@/components/seo/EnBrefBox'
import { ArticleMeta } from '@/components/ArticleMeta'
import { monthlyAnchorIso } from '@/lib/seo/sprint-helpers'
import { selectFittingTitle } from '@/lib/seo/title-selector'
import {
  buildUrgenceFsBait,
  buildRenovationFsBait,
  buildTravauxFsBait,
} from '@/lib/seo/fs-bait-descriptions'

import {
  getBreadcrumbSchema,
  getItemListSchema,
  getEnrichedLocalServiceSchema,
} from '@/lib/seo/jsonld'
import { buildAggregateRatingFromProviders } from '@/lib/seo/aggregate-rating'
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
import { SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import {
  generateLocationContent,
  hashCode,
  getRegionalMultiplier,
} from '@/lib/seo/location-content'
import { getNaturalTerm } from '@/lib/seo/natural-terms'
import {
  getServiceIntent,
  getIntentTitleVariants,
  getIntentH1Variants,
  shouldRenderRenovationBlocks,
  shouldRenderUrgencyBlock,
} from '@/lib/seo/service-intents'
import UrgencyBlock from '@/components/seo/UrgencyBlock'
import ServiceIntentReroute from '@/components/seo/ServiceIntentReroute'
import { getPageContent } from '@/lib/cms'
import { shouldNoindex } from '@/lib/seo/pruning'
import { isServiceVilleIndexable } from '@/lib/seo/services-tiers'
import { hasDeptProviderFallback } from '@/lib/seo/dept-fallback'
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
import { getPublishedDate } from '@/lib/seo/published-dates'

// SSR activé pour ces 4 composants de conversion : le bail-out ssr:false
// masquait le corps de page à Googlebot (HTML quasi-vide → soft 404 risk).
// Un loading skeleton minimal est rendu côté serveur pour préserver LCP.
const GeoPageCTA = dynamic(() => import('@/components/conversion/GeoPageCTA'), {
  loading: () => <div className="min-h-[180px] bg-sand-50 rounded-lg" aria-hidden="true" />,
})

const MicroConversions = dynamic(() => import('@/components/MicroConversions'), {
  loading: () => <div className="min-h-[120px] bg-sand-50 rounded-lg" aria-hidden="true" />,
})

const CallbackRequest = dynamic(() => import('@/components/CallbackRequest'), {
  loading: () => <div className="min-h-[160px] bg-sand-50 rounded-lg" aria-hidden="true" />,
})

const InlineTestimonial = dynamic(() => import('@/components/conversion/InlineTestimonial'), {
  loading: () => <div className="min-h-[100px] bg-sand-50 rounded-lg" aria-hidden="true" />,
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

/**
 * Truncate raw title so that, after the root layout template wrap
 * (`%s | ServicesArtisans` = 19 chars), the rendered HTML title is ≤ 60 chars.
 * Hence raw ≤ 41. See Google Search Central : "Title links in search results".
 */
// truncateTitle / selectFittingTitle moved to @/lib/seo/title-selector (shared
// across /rge, /avis, /services/[s], /villes/[v]).

// Lightweight metadata returned when the slug is invalid or unknown.
// Calling notFound() in generateMetadata renders the not-found.tsx body with
// the DEFAULT (homepage) title — we want an explicit noindex/nofollow signal
// instead. The page component still calls notFound() to propagate the render
// status. Note: Next.js 14.2 returns HTTP 200 for ISR routes with
// dynamicParams=true even when notFound() fires (soft 404) — mitigated by
// the robots:noindex below so Google de-indexes these paths.
// Upstream: https://github.com/vercel/next.js/issues/69103
const NOT_FOUND_METADATA: Metadata = {
  title: 'Page non trouvée — ServicesArtisans',
  description: "Cette combinaison service/ville n'existe pas dans notre annuaire.",
  robots: { index: false, follow: false },
}

const PUBLISHED_DATE = getPublishedDate('/services/[service]/[location]')

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { service: serviceSlug, location: locationSlug } = await params

  // Early reject: invalid slugs → noindex metadata, page will issue HTTP 404
  if (!VALID_SLUG.test(serviceSlug) || !VALID_SLUG.test(locationSlug)) {
    return NOT_FOUND_METADATA
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
    return NOT_FOUND_METADATA
  }

  // Sprint 2 CTR Attack — inject review social proof into title/desc when threshold met.
  // Fail-open: if DB hiccups or no reviews, fall through to existing templates.
  const reviewStats =
    departmentName || departmentCode
      ? await getReviewStatsByDept(serviceSlug, departmentName || departmentCode).catch(
          (err: unknown) => {
            logger.error('service_location.review_stats_metadata_error', err as Error, {
              route: 'services/[service]/[location]',
              service: serviceSlug,
              location: locationSlug,
              dept: departmentName || departmentCode,
            })
            return null
          }
        )
      : null
  const hasReviewProof = !!(reviewStats && reviewStats.review_count >= 5)
  const reviewPrefix =
    hasReviewProof && reviewStats
      ? `${reviewStats.avg_rating.toFixed(1)}★ (${reviewStats.review_count} avis) · `
      : ''
  const descReviewSnippet =
    hasReviewProof && reviewStats
      ? ` Note ${reviewStats.avg_rating.toFixed(1)}/5 sur ${reviewStats.review_count} avis clients.`
      : ''

  // Unified SEO seed for title + H1 coherence (same seed used in both generateMetadata and page render)
  const seoHash = Math.abs(hashCode(`seo-${serviceSlug}-${locationSlug}`))

  // Intent-aware title variants — urgence / renovation / travaux registers.
  // See `docs/service-intents-playbook.md` for taxonomy decision rationale.
  const intent = getServiceIntent(serviceSlug)
  const titleVariants = getIntentTitleVariants(intent, {
    serviceName,
    locationName,
    providerCount,
    reviewPrefix,
    year: 2026,
    departmentCode: departmentCode || null,
  })

  // First-fitting via helper partagé (Sprint 2 pattern, voir title-selector.ts).
  // Sprint 5 vague 4 — maxLen 41 → 60 pour récupérer les variants review-prefix
  // riches sur les ~50K pages /services/[service]/[location]. 60 = limite
  // Google SERP desktop (mobile blended ~58) sans perte signal sémantique.
  const title = selectFittingTitle(titleVariants, seoHash, 60)

  // FS-bait : intent-routed builder (urgence / renovation / travaux). Pattern
  // structuré pour Featured Snippet + PAA (count en début, signal aide en fin).
  // descReviewSnippet est passé tel quel — clipping géré par buildXxxFsBait.
  // pluralTerm corrige les noms composés ("pompes à chaleur" et non "pompe à chaleurs").
  const fsBaitCtx = {
    providerCount,
    serviceName,
    pluralTerm: getNaturalTerm(serviceSlug).plural,
    locationName,
    year: 2026,
    priceRange: null,
    reviewSnippet: descReviewSnippet.trim() || undefined,
  } as const
  const description =
    intent === 'urgence'
      ? buildUrgenceFsBait(fsBaitCtx)
      : intent === 'renovation'
        ? buildRenovationFsBait(fsBaitCtx)
        : buildTravauxFsBait(fsBaitCtx)

  // Pruning: noindex pages with zero providers AND no unique data (fail-open safe)
  // Only check dept fallback when providerCount is 0 (the only case where hasUniqueData matters).
  // Le check `communeExists` a été retiré (audit 2026-04-30) — la simple existence
  // d'une commune ne justifie plus l'indexation d'une page service×ville sans listing
  // (cf. justification dans le bloc isNoindex ci-dessous).
  let hasFallbackDept = false
  if (providerCount === 0) {
    // Align metadata robots with render-time fallback: when local providers
    // are absent but the department-level fallback yields ≥1 artisan, the
    // page renders an active listing — must NOT be noindex'd.
    // See `renderServiceLocationPage` providersResult fallback (page.tsx).
    hasFallbackDept = await hasDeptProviderFallback(serviceSlug, departmentName)
  }
  // Critère hasUniqueData restreint au fallback département (audit GSC 2026-04-30).
  //
  // Avant : `tradeContent || communeExists || hasFallbackDept`. Une page comme
  // `/services/deratisation/les-ulis` (0 artisan ville, 0 artisan dept 91)
  // était INDEXÉE car tradeContent('deratisation') et getCommuneBySlug('les-ulis')
  // retournent du contenu non-null. Résultat observé : 22+ villes IDF dérat en
  // pos 35-45 sur "dératisation [ville]" avec 0% CTR (template 5K mots, 0
  // business listings). Google rank low car page = boilerplate éducatif sans
  // valeur business.
  //
  // Après : seul `hasFallbackDept` justifie l'indexation. Une page service×ville
  // promet un listing local — sans artisan (direct OU fallback dept), elle ne
  // tient pas sa promesse et doit sortir de l'index. Trade content + commune
  // restent affichés côté UX (éducation/contexte), mais ne suffisent plus à
  // dépenser du budget crawl Google sur des pages à 0 conversion.
  // Vague α nettoyage 2026-05-02 : combos hors allocation tiered sont retirés
  // du sitemap (cf. services-tiers.ts Phase B). On aligne le comportement page
  // pour que ces combos soient également noindex — sinon Google peut les
  // indexer via découvertes externes (internal links, GSC URL inspection).
  // Rollback urgence : SA_DISABLE_SERVICES_TIERED=1 (cf. services-tiers.ts).
  const isExcludedByTier = !isServiceVilleIndexable(serviceSlug, locationSlug)
  const isNoindex =
    isExcludedByTier ||
    shouldNoindex(`/services/${serviceSlug}/${locationSlug}`, {
      providerCount,
      isQuartierPage: false,
      hasUniqueData: hasFallbackDept,
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
      ...getOgDefaults(),
      title,
      description,
      url: `${SITE_URL}/services/${serviceSlug}/${locationSlug}`,
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
  communeData: Awaited<ReturnType<typeof getCommuneBySlug>> | null,
  dynamicLastMod: string | null
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
    // Fail-closed : on omet dateModified si pas de vraie data — pas de fausse fraîcheur.
    ...(dynamicLastMod ? { dateModified: dynamicLastMod.split('T')[0] } : {}),
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
    ...(dynamicLastMod ? { dateModified: dynamicLastMod.split('T')[0] } : {}),
  }

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Services', url: '/services' },
    { name: service.name, url: `/services/${serviceSlug}` },
    { name: location.name, url: `/services/${serviceSlug}/${locationSlug}` },
  ])

  return [localBusinessSchema, serviceSchema, breadcrumbSchema]
}

// Top-level error boundary — Audit 2026-04-25 : ce template SEO est la page
// la plus crawlée (459K combinaisons service×ville). Un throw imprévu (Redis
// hoquet, RLS drift, schema bug) doit dégrader vers `notFound()` plutôt que
// renvoyer 500 à Googlebot. Reprise du pattern utilisé pour [publicId]/page.tsx.
export default async function ServiceLocationPage(props: PageProps) {
  try {
    return await renderServiceLocationPage(props)
  } catch (err) {
    if (isRedirectError(err) || isNotFoundError(err) || isDynamicServerError(err)) throw err
    // logger.error forwarde à Sentry (commit 341c32162) avec context structuré.
    // console.error précédent était capturé par onRequestError mais sans tags
    // métier (route, service, location) → drill-down GSC 5xx impossible.
    const params = await props.params.catch(() => null)
    logger.error('service_location.unhandled_render_error', err as Error, {
      route: 'services/[service]/[location]',
      service: params?.service ?? null,
      location: params?.location ?? null,
    })
    notFound()
  }
}

async function renderServiceLocationPage({ params, searchParams }: PageProps) {
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
            <h1 data-speakable="true" className="font-heading text-3xl font-bold text-charcoal-900">
              {cmsPage.title}
            </h1>
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
      // Providers + count + RGE count, with department fallback.
      // Audit 2026-05-01 (Sentry 295 events TimeoutError sur ce template) :
      // `getProvidersByServiceAndLocation` était le SEUL fetch sans .catch() dans
      // ce Promise.all. Un timeout Supabase faisait crash toute la page → Sentry
      // remontait `TimeoutError - Page Server Component`. Désormais on dégrade
      // vers une liste vide + log Sentry → la page tente le fallback département
      // ligne 610-617, ou retourne notFound() proprement si vraiment 0 provider.
      (async () => {
        const [directProviders, totalProviderCount, rgeProviderCount] = await Promise.all([
          getProvidersByServiceAndLocation(serviceSlug, locationSlug, { rgeOnly }).catch(
            (err: unknown) => {
              logger.error('service_location.providers_fetch_error', err as Error, {
                route: 'services/[service]/[location]',
                service: serviceSlug,
                location: locationSlug,
                rgeOnly,
              })
              return [] as Awaited<ReturnType<typeof getProvidersByServiceAndLocation>>
            }
          ),
          getProviderCountByServiceAndLocation(serviceSlug, locationSlug, { rgeOnly }).catch(
            () => -1
          ),
          getRgeProviderCountByServiceAndLocation(serviceSlug, locationSlug).catch(() => 0),
        ])
        let providers = directProviders
        let isFallback = false
        if (providers.length === 0 && totalProviderCount <= 0) {
          if (deptName) {
            // Vercel logs 2026-05-01 : 5+ URLs/h en `[TypeError: fetch failed]`
            // (limans, valence, cadenet, carros, solier/80379…). Sans .catch
            // ici, l'IIFE rejette → Promise.all global rejette → outer catch
            // ligne ~502 → notFound() avec body "Page non trouvée" alors que
            // ce n'est qu'un timeout réseau Supabase transient. Le commit
            // 7bcbfe9fd a catché getProvidersByServiceAndLocation mais pas
            // ce fallback département (cascade fix oubliée).
            providers = await getProvidersByServiceAndDepartment(serviceSlug, deptName, {
              limit: 6,
            }).catch((err: unknown) => {
              logger.error('service_location.dept_fallback_fetch_error', err as Error, {
                route: 'services/[service]/[location]',
                service: serviceSlug,
                location: locationSlug,
                dept: deptName,
              })
              return [] as Awaited<ReturnType<typeof getProvidersByServiceAndDepartment>>
            })
            isFallback = providers.length > 0
          }
          if (providers.length === 0) return null // signal notFound
        }
        return { providers, isFallback, totalProviderCount, rgeProviderCount }
      })(),
      // Commune enrichment (best-effort, never crash)
      getCommuneBySlug(locationSlug).catch((err: unknown) => {
        logger.error('service_location.commune_lookup_error', err as Error, {
          route: 'services/[service]/[location]',
          service: serviceSlug,
          location: locationSlug,
        })
        return null
      }) as Promise<Awaited<ReturnType<typeof getCommuneBySlug>>>,
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
        ? getReviewStatsByDept(serviceSlug, deptName).catch((err: unknown) => {
            logger.error('service_location.review_stats_render_error', err as Error, {
              route: 'services/[service]/[location]',
              service: serviceSlug,
              location: locationSlug,
              dept: deptName,
            })
            return null
          })
        : Promise.resolve(null),
      deptName
        ? getTopReviewsByDept(serviceSlug, deptName).catch((err: unknown) => {
            logger.error('service_location.top_reviews_error', err as Error, {
              route: 'services/[service]/[location]',
              service: serviceSlug,
              location: locationSlug,
              dept: deptName,
            })
            return []
          })
        : Promise.resolve([] as Awaited<ReturnType<typeof getTopReviewsByDept>>),
      deptName
        ? getDynamicLastModified(serviceSlug, location.department_code || '').catch(
            (err: unknown) => {
              logger.error('service_location.last_modified_error', err as Error, {
                route: 'services/[service]/[location]',
                service: serviceSlug,
                location: locationSlug,
                deptCode: location.department_code,
              })
              return null
            }
          )
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
    communeData,
    dynamicLastMod
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

  // H1 uses same seed as title for coherence (seo- prefix). Intent-aware
  // variants — matches the title register set in generateMetadata.
  const providerCount = totalProviderCount
  const seoHashH1 = Math.abs(hashCode(`seo-${serviceSlug}-${locationSlug}`))
  const naturalTermH1 = getNaturalTerm(serviceSlug)
  const pageIntent = getServiceIntent(serviceSlug)
  const renderRenovationBlocks = shouldRenderRenovationBlocks(pageIntent)
  const renderUrgencyBlock = shouldRenderUrgencyBlock(pageIntent)
  const h1Variants = getIntentH1Variants(pageIntent, {
    serviceName: service.name,
    locationName: location.name,
    providerCount,
    departmentCode: location.department_code || null,
    pluralTerm: naturalTermH1.plural,
  })
  const h1Text = h1Variants[seoHashH1 % h1Variants.length]

  // Enriched FAQ schema from schema-enrichment (supplements existing faqSchema)
  const enrichedFaqSchema = generateFAQSchema(
    combinedFaq.map((f) => ({ question: f.question, answer: f.answer }))
  )
  if (enrichedFaqSchema) jsonLdSchemas.push(enrichedFaqSchema)

  // Aggregate rating schema.
  // Source 1 (préférée) : stats dept-level via getReviewStatsByDept → couvre
  // tout un département, plus stable statistiquement.
  // Source 2 (fallback) : agrégation pondérée des providers listés sur la
  // page actuelle si les stats dept sont absentes. Permet aux premières
  // villes avec des artisans à reviews de porter des étoiles SERP sans
  // attendre la masse critique dept.
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
  } else {
    const providerAgg = buildAggregateRatingFromProviders(providers)
    if (providerAgg) {
      jsonLdSchemas.push({
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: `${service.name} à ${location.name}`,
        url: `${SITE_URL}/services/${serviceSlug}/${locationSlug}`,
        areaServed: { '@type': 'City', name: location.name },
        provider: {
          '@type': 'Organization',
          name: 'ServicesArtisans',
          url: SITE_URL,
        },
        aggregateRating: providerAgg,
      })
    }
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

  // Enriched speakable schema targeting specific CSS classes.
  // - .speakable-summary  → SpeakableAnswerBox (prose summary, 1 node bas de page)
  // - .speakable-faq      → FAQ section
  // - [data-speakable]    → TldrBlock + EnBrefBox (bullets / résumés structurés).
  // Trois sélecteurs disjoints = pas de double-extraction Google Speakable.
  const enrichedSpeakable = generateSpeakableSchema({
    url: `${SITE_URL}/services/${serviceSlug}/${locationSlug}`,
    title: h1Text,
    cssSelectors: ['.speakable-summary', '.speakable-faq', '[data-speakable="true"]'],
  })
  jsonLdSchemas.push(enrichedSpeakable)

  // Article schema — capture AI Overviews / Featured Snippets sur les requêtes
  // informationnelles ("artisan plombier paris", "trouver electricien lyon").
  // Speakable cssSelector dupliqué intentionnellement pour donner à Google
  // une racine Article bien typée (le Service/LocalBusiness ne suffit pas
  // toujours pour Google Assistant / SGE).
  const dateModifiedIso = monthlyAnchorIso()
  const articleHeadline = `${service.name} à ${location.name} — Artisans vérifiés ${new Date().getFullYear()}`
  jsonLdSchemas.push({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: articleHeadline.slice(0, 110),
    description: `Trouver un ${service.name.toLowerCase()} à ${location.name}${location.department_code ? ` (${location.department_code})` : ''} : ${totalProviderCount > 0 ? `${totalProviderCount} artisans vérifiés SIREN` : 'artisans qualifiés du département'}, devis gratuit en 24h.`,
    url: `${SITE_URL}/services/${serviceSlug}/${locationSlug}`,
    datePublished: PUBLISHED_DATE,
    dateModified: dateModifiedIso,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    image: getServiceImageForContext(serviceSlug, locationSlug).src,
    author: {
      '@type': 'Organization',
      name: 'Équipe éditoriale ServicesArtisans',
      url: `${SITE_URL}/a-propos`,
      '@id': `${SITE_URL}#organization`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/services/${serviceSlug}/${locationSlug}`,
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
    about: {
      '@type': 'Service',
      name: service.name,
      areaServed: { '@type': 'City', name: location.name },
    },
  })

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

  // TL;DR bullets — featured-snippet bait + speakable. Reuse data déjà calculé.
  // Guard NaN sur averageRating (rating_average=0 passe le filtre ratedProviders),
  // CTA conditionnel (P1#5) pour ne pas afficher TldrBlock avec 1 seul bullet
  // publicitaire en fallback dept sans trade ni count.
  const tldrBullets: string[] = []
  if (totalProviderCount > 0) {
    tldrBullets.push(
      `${totalProviderCount} ${service.name.toLowerCase()}${totalProviderCount > 1 ? 's' : ''} vérifié${totalProviderCount > 1 ? 's' : ''} SIREN à ${location.name}${location.department_code ? ` (${location.department_code})` : ''}`
    )
  }
  if (averageRating && totalReviews && averageRating > 0 && totalReviews > 0) {
    tldrBullets.push(`Note moyenne ${averageRating.toFixed(1)}/5 sur ${totalReviews} avis clients`)
  }
  if (trade) {
    const lo = Math.round(trade.priceRange.min * pricingMultiplier)
    const hi = Math.round(trade.priceRange.max * pricingMultiplier)
    tldrBullets.push(
      `Tarif indicatif ${lo}–${hi}€ ${trade.priceRange.unit} en ${new Date().getFullYear()}`
    )
    if (trade.averageResponseTime) {
      tldrBullets.push(`Délai d'intervention moyen : ${trade.averageResponseTime}`)
    }
  }
  if (rgeProviderCount > 0) {
    tldrBullets.push(
      `${rgeProviderCount} artisan${rgeProviderCount > 1 ? 's' : ''} RGE certifié${rgeProviderCount > 1 ? 's' : ''} (éligible MaPrimeRénov')`
    )
  }
  // CTA seulement si au moins 1 bullet informatif déjà présent — sinon TldrBlock
  // se réduirait à 1 bullet publicitaire (audit code-reviewer P1#5).
  if (tldrBullets.length > 0) {
    tldrBullets.push('Devis gratuit, sans engagement, en moins de 24h')
  }

  // En bref — bullets factuels (compte, rating, prix, RGE) en haut de page.
  // Source des chiffres = mêmes que TldrBlock mais formulation différente
  // (faits chiffrés isolés vs phrases featured-snippet).
  const enBrefPoints: string[] = []
  if (totalProviderCount > 0) {
    enBrefPoints.push(
      `${totalProviderCount} ${service.name.toLowerCase()}${totalProviderCount > 1 ? 's' : ''} actif${totalProviderCount > 1 ? 's' : ''} référencé${totalProviderCount > 1 ? 's' : ''} à ${location.name}`
    )
  }
  if (averageRating && totalReviews && averageRating > 0 && totalReviews > 0) {
    enBrefPoints.push(`Note moyenne ${averageRating.toFixed(1)}/5 — ${totalReviews} avis vérifiés`)
  }
  if (trade) {
    const lo = Math.round(trade.priceRange.min * pricingMultiplier)
    const hi = Math.round(trade.priceRange.max * pricingMultiplier)
    enBrefPoints.push(
      `Tarif ${lo}–${hi}€ ${trade.priceRange.unit} (indicatif ${new Date().getFullYear()})`
    )
  }
  if (rgeProviderCount > 0) {
    enBrefPoints.push(
      `${rgeProviderCount} artisan${rgeProviderCount > 1 ? 's' : ''} RGE certifié${rgeProviderCount > 1 ? 's' : ''} — éligible MaPrimeRénov'`
    )
  } else {
    enBrefPoints.push('Devis gratuit en moins de 24 h, sans engagement')
  }

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
          <h1
            data-speakable="true"
            className="font-heading text-3xl md:text-4xl font-bold text-charcoal-900 tracking-tight"
          >
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
          <ArticleMeta
            author="Équipe éditoriale ServicesArtisans"
            authorHref="/a-propos"
            datePublished={PUBLISHED_DATE}
            dateModified={dateModifiedIso}
            className="mt-4"
          />
        </div>
      </div>

      {/* En bref — bullets factuels juste sous H1, capté par cssSelector
          [data-speakable="true"] dans le schema enrichedSpeakable. */}
      {enBrefPoints.length > 0 && (
        <section
          aria-labelledby="services-en-bref"
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-4"
        >
          <h2 id="services-en-bref" className="sr-only">
            En bref : {service.name.toLowerCase()} à {location.name}
          </h2>
          <EnBrefBox keyPoints={enBrefPoints} />
        </section>
      )}

      {/* TL;DR — featured-snippet bait, juste sous le H1.
           Wrapper sans .speakable-summary : la classe est réservée à
           SpeakableAnswerBox (prose). TldrBlock est capté via [data-speakable="true"]
           natif → schéma générique enrichedSpeakable cssSelectors couvre les deux. */}
      {tldrBullets.length > 0 && (
        <section
          aria-labelledby="services-tldr-essentiel"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4"
        >
          <h2 id="services-tldr-essentiel" className="sr-only">
            L’essentiel : {service.name.toLowerCase()} à {location.name}
          </h2>
          <TldrBlock bullets={tldrBullets} />
        </section>
      )}

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

      {/* UrgencyBlock — services d'intent URGENCE uniquement (plombier, serrurier, …).
           Remplace visuellement le mini-simulateur aides qui était off-intent ici. */}
      {renderUrgencyBlock && (
        <UrgencyBlock
          serviceName={service.name}
          villeName={location.name}
          providerCount={totalProviderCount}
          averageResponseTime={trade?.averageResponseTime ?? null}
          emergencyInfo={trade?.emergencyInfo ?? null}
          callbackAnchor="#callback-request"
        />
      )}

      {/* Mini-simulateur aides — services d'intent RÉNOVATION uniquement (chauffagiste,
           PAC, isolation, …). Off-intent sur dépannage : dilue CTR + People-first 2026. */}
      {renderRenovationBlocks && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-2">
          <MiniSimulateurInline
            service={service.name.toLowerCase()}
            ville={location.name}
            source="services_slug_ville"
            variant="card"
          />
        </div>
      )}

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

        {/* ContexteDPE — rénovation énergétique uniquement. Hors-sujet sur
            intent urgence/travaux : DPE = signal YMYL projet, pas dépannage. */}
        {renderRenovationBlocks && (
          <ContexteDPEBlock
            communeData={communeData}
            serviceName={service.name}
            villeName={location.name}
          />
        )}

        <BarometrePrixBlock
          serviceSlug={serviceSlug}
          serviceName={service.name}
          villeName={location.name}
          regionName={location.region_name || ''}
          revenuMedian={communeData?.revenu_median}
          prixM2Moyen={communeData?.prix_m2_moyen}
          densite={communeData?.densite_population}
        />

        {/* Calendrier saisonnier — rénovation uniquement : pertinent pour les
            travaux planifiés (ITE, PAC, toiture), hors-sujet pour urgence/travaux classiques. */}
        {renderRenovationBlocks && (
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
        )}

        <CommuneContextBlock
          communeData={communeData}
          serviceName={service.name}
          villeName={location.name}
        />

        <ComparatifsBlock serviceSlug={serviceSlug} serviceName={service.name} />

        {/* Primes CEE / MaPrimeRénov' — rénovation uniquement. Le CEE
            n'existe pas pour du dépannage ni des travaux classiques (peinture,
            carrelage, déco). Afficher ailleurs = faux signal YMYL. */}
        {renderRenovationBlocks && (
          <PrimesCEEBlock
            serviceSlug={serviceSlug}
            serviceName={service.name}
            villeName={location.name}
            communeData={communeData}
          />
        )}

        <MaillageInterneBlock
          serviceSlug={serviceSlug}
          serviceName={service.name}
          villeSlug={locationSlug}
          villeName={location.name}
          departementSlug={location.department_code?.toLowerCase()}
          departementName={location.department_name}
          regionName={location.region_name}
          currentIntent="services"
          hasCEE={getCeeOpsForRgeService(serviceSlug).length > 0}
        />
      </div>
      {/* --- end pSEO enrichment blocks --- */}

      {/* Cross-intent reroute — 1 lien contextuel vers sibling d'intent différent
           (ex. plombier URGENCE → chauffagiste RÉNOVATION). Capte le volume
           adjacent sans polluer le registre de la page courante. */}
      <ServiceIntentReroute
        serviceSlug={serviceSlug}
        villeSlug={locationSlug}
        villeName={location.name}
        resolveServiceName={(slug) => {
          const svc = staticServicesList.find((s) => s.slug === slug)
          return svc ? svc.name : null
        }}
      />

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

      <div
        id="callback-request"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 scroll-mt-24"
      >
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
              href={`/services/${serviceSlug}/${locationSlug}`}
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
