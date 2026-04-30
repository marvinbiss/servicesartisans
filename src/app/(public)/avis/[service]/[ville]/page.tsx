import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect'
import { isNotFoundError } from 'next/dist/client/components/not-found'
import { isDynamicServerError } from 'next/dist/client/components/hooks-server-context'
import {
  ArrowRight,
  CheckCircle,
  Euro,
  Shield,
  Clock,
  Phone,
  ChevronDown,
  MapPin,
  Users,
  Building2,
  Star,
  Zap,
  TrendingUp,
  Thermometer,
} from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import { ArticleMeta } from '@/components/ArticleMeta'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { SITE_URL, SITE_NAME, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { monthlyAnchorIso } from '@/lib/seo/sprint-helpers'
import { hashCode, getRegionalMultiplier } from '@/lib/seo/location-content'
import { tradeContent, getTradesSlugs } from '@/lib/data/trade-content'
import { villes, getVilleBySlug, getNearbyCities, getDepartementByCode } from '@/lib/data/france'
import { getCommuneBySlug, formatNumber } from '@/lib/data/commune-data'
import { getServiceImageForContext } from '@/lib/data/images'
import { relatedServices } from '@/lib/constants/navigation'
import { getCityValues } from '@/lib/insee-resolver'
import { SERVICE_TO_SPECIALTIES } from '@/lib/supabase'
import { getProblemsByService } from '@/lib/data/problems'
import LastUpdated from '@/components/seo/LastUpdated'
import CrossIntentLinks from '@/components/seo/CrossIntentLinks'
import DeepPageLinks from '@/components/seo/DeepPageLinks'
import ServiceIntentReroute from '@/components/seo/ServiceIntentReroute'
import MoneyPageBoost from '@/components/seo/MoneyPageBoost'
import InContentLinks from '@/components/seo/InContentLinks'
import VerticalCrossLinks from '@/components/seo/VerticalCrossLinks'
import IntentNavBar from '@/components/seo/IntentNavBar'
import RisquesGeoBlock from '@/components/seo/RisquesGeoBlock'
import PrimesCEEBlock from '@/components/seo/PrimesCEEBlock'
import BarometrePrixBlock from '@/components/seo/BarometrePrixBlock'
import ContexteDPEBlock from '@/components/seo/ContexteDPEBlock'
import CalendrierSaisonnierBlock from '@/components/seo/CalendrierSaisonnierBlock'
import CommuneContextBlock from '@/components/seo/CommuneContextBlock'
import ProblemesCourantsBlock from '@/components/seo/ProblemesCourantsBlock'
import ComparatifsBlock from '@/components/seo/ComparatifsBlock'
import MaillageInterneBlock from '@/components/seo/MaillageInterneBlock'
import ReviewsDeptBlock from '@/components/seo/ReviewsDeptBlock'
import DevisCounterBlock from '@/components/seo/DevisCounterBlock'
import FreshnessSignal from '@/components/seo/FreshnessSignal'
import GlossaireTooltips from '@/components/seo/GlossaireTooltips'
import UserQuestionBlock from '@/components/seo/UserQuestionBlock'
import PhotoGalleryBlock from '@/components/seo/PhotoGalleryBlock'
import AEOAnswerBlock from '@/components/seo/AEOAnswerBlock'
import {
  generateFAQSchema,
  generateSpeakableSchema,
  generateAggregateRatingSchema,
} from '@/lib/seo/schema-enrichment'
import {
  getReviewStatsByDept,
  getTopReviewsByDept,
  hasProvidersByServiceAndLocation,
} from '@/lib/supabase'
import { shouldNoindex } from '@/lib/seo/pruning'
import { hasDeptProviderFallback } from '@/lib/seo/dept-fallback'
import { getDynamicLastModified } from '@/lib/seo/dynamic-lastmod'
import { getRegionPreposition } from '@/lib/geo-strings'
import dynamic from 'next/dynamic'

function getClimatLabel(zone: string | null): string {
  const labels: Record<string, string> = {
    oceanique: 'Climat océanique',
    'semi-oceanique': 'Climat semi-océanique',
    continental: 'Climat continental',
    mediterraneen: 'Climat méditerranéen',
    montagnard: 'Climat montagnard',
  }
  return zone ? (labels[zone] ?? zone) : 'Climat tempéré'
}

const ExitIntentPopup = dynamic(() => import('@/components/ExitIntentPopup'), { ssr: false })
const StickyMobileCTA = dynamic(() => import('@/components/conversion/StickyMobileCTA'), {
  ssr: false,
})
const TarifsDevisCTA = dynamic(() => import('@/components/conversion/TarifsDevisCTA'), {
  ssr: false,
})

export const revalidate = 86400 // Revalidate every 24h

const IS_BUILD = process.env.NEXT_BUILD_SKIP_DB === '1' && !process.env.NEXT_PUBLIC_SUPABASE_URL

// ---------------------------------------------------------------------------
// Types & data-fetching (Supabase)
// ---------------------------------------------------------------------------

interface AvisProvider {
  id: string
  user_id: string | null
  name: string
  slug: string
  stable_id: string
  address_city: string | null
  rating_average: number | null
  review_count: number | null
  is_verified: boolean
  specialty: string | null
}

interface AvisReview {
  id: string
  rating: number
  content: string | null
  author_name: string | null
  created_at: string
  provider_id: string
}

async function getTopProviders(
  cityName: string,
  serviceSlug: string,
  departmentName: string
): Promise<AvisProvider[]> {
  if (IS_BUILD) return []
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()

    // Specialty slugs for this service (for RPC fallback)
    const specialtySlugs = SERVICE_TO_SPECIALTIES[serviceSlug] ?? [serviceSlug]

    // 1) Try city-level first — all active providers (no review_count filter)
    const { data: cityData } = await supabase
      .from('providers')
      .select(
        'id, user_id, name, slug, stable_id, address_city, rating_average, review_count, is_verified, specialty'
      )
      .eq('is_active', true)
      .in('address_city', getCityValues(cityName))
      .in('specialty_slug', specialtySlugs)
      .order('rating_average', { ascending: false, nullsFirst: false })
      .order('review_count', { ascending: false, nullsFirst: false })
      .limit(6)

    if (cityData && cityData.length >= 2) return cityData

    // 2) Fallback: department-level via RPC (indexed, fast)
    const { data: deptData } = await supabase.rpc('get_providers_by_dept', {
      p_specialty_slugs: specialtySlugs,
      p_department: departmentName,
      p_limit: 6,
    })

    if (deptData && deptData.length > 0) {
      // Merge: city providers first, then dept providers (deduplicated)
      const cityIds = new Set((cityData ?? []).map((p) => p.id))
      const merged = [
        ...(cityData ?? []),
        ...deptData.filter((p: AvisProvider) => !cityIds.has(p.id)),
      ]
      return merged.slice(0, 6)
    }

    return cityData ?? []
  } catch {
    return []
  }
}

async function getRecentReviews(providerIds: string[]): Promise<AvisReview[]> {
  if (IS_BUILD || providerIds.length === 0) return []
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('reviews')
      .select('id, rating, content, author_name, created_at, provider_id')
      .in('provider_id', providerIds)
      .eq('status', 'published')
      .not('content', 'is', null)
      .order('rating', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(8)

    if (error || !data) return []
    return data
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// Static params: top 50 cities x 46 services = 2,300 pages
// ---------------------------------------------------------------------------

const tradeSlugs = getTradesSlugs()

function parsePopulation(pop: string): number {
  return parseInt(pop.replace(/\s/g, ''), 10) || 0
}

const top5Cities = [...villes]
  .sort((a, b) => parsePopulation(b.population) - parsePopulation(a.population))
  .slice(0, 3)

export function generateStaticParams() {
  const params: { service: string; ville: string }[] = []
  for (const service of tradeSlugs) {
    for (const ville of top5Cities) {
      params.push({ service, ville: ville.slug })
    }
  }
  return params
}

export const dynamicParams = true

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

function truncateTitle(title: string, maxLen = 41): string {
  if (title.length <= maxLen) return title
  return title.slice(0, maxLen - 1).replace(/\s+\S*$/, '') + '…'
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string; ville: string }>
}): Promise<Metadata> {
  const { service, ville } = await params
  const trade = tradeContent[service]
  const villeData = getVilleBySlug(ville)
  if (!trade || !villeData) notFound()

  const tradeLower = trade.name.toLowerCase()
  const multiplier = getRegionalMultiplier(villeData.region, villeData.departementCode)
  const minPrice = Math.round(trade.priceRange.min * multiplier)
  const maxPrice = Math.round(trade.priceRange.max * multiplier)

  const priceTag = `dès ${minPrice}${trade.priceRange.unit === '€/h' ? '€/h' : '€'}`

  // Sprint 2 CTR Attack — fetch dept review stats once for both metadata + noindex gate.
  // Fail-open: null stats => no proof prefix + hasReviews defaults to true (keep indexed).
  const reviewStats = await getReviewStatsByDept(service, villeData.departement).catch(() => null)
  const hasReviewProof = !!(reviewStats && reviewStats.review_count >= 5)
  const reviewPrefix =
    hasReviewProof && reviewStats
      ? `${reviewStats.avg_rating.toFixed(1)}★ (${reviewStats.review_count} avis) · `
      : ''
  const descReviewSnippet =
    hasReviewProof && reviewStats
      ? ` Note ${reviewStats.avg_rating.toFixed(1)}/5 sur ${reviewStats.review_count} avis vérifiés.`
      : ''

  const titleHash = Math.abs(hashCode(`avis-loc-title-${service}-${ville}`))
  const titleTemplates = [
    `${reviewPrefix}Avis ${trade.name} ${villeData.name} 2026 — Tarifs ${priceTag}`,
    `${reviewPrefix}Avis ${tradeLower} à ${villeData.name} — Pros vérifiés 2026`,
    `${reviewPrefix}Avis ${tradeLower} ${villeData.name} 2026 — Tarifs ${priceTag}`,
    `${reviewPrefix}Avis ${trade.name} ${villeData.name} — Top artisans 2026`,
    `${reviewPrefix}Avis ${tradeLower} ${villeData.name} 2026 — Prix ${priceTag}`,
  ]
  const title = truncateTitle(titleTemplates[titleHash % titleTemplates.length])

  const descHash = Math.abs(hashCode(`avis-loc-desc-${service}-${ville}`))
  const dept = villeData.departement
  const descTemplates = [
    `Avis ${tradeLower} à ${villeData.name} : ${minPrice}–${maxPrice} ${trade.priceRange.unit}. Consultez les recommandations, comparez les artisans et trouvez un professionnel de confiance.${descReviewSnippet}`,
    `Choisir un ${tradeLower} à ${villeData.name} (${dept}) : avis clients, notes et recommandations. Artisans vérifiés, devis gratuit.${descReviewSnippet}`,
    `${trade.name} à ${villeData.name} : consultez les avis vérifiés et comparez les tarifs (${minPrice}–${maxPrice} ${trade.priceRange.unit}). Guide 2026.${descReviewSnippet}`,
    `${tradeLower.charAt(0).toUpperCase() + tradeLower.slice(1)}s de confiance à ${villeData.name} selon les avis clients. Prix local : ${minPrice}–${maxPrice} ${trade.priceRange.unit}. Comparez et choisissez.${descReviewSnippet}`,
    `Avis et recommandations ${tradeLower} à ${villeData.name} (${dept}). Trouvez un artisan de confiance parmi les professionnels vérifiés.${descReviewSnippet}`,
  ]
  const description = descTemplates[descHash % descTemplates.length]

  const serviceImage = getServiceImageForContext(service, ville)
  const canonicalUrl = `${SITE_URL}/avis/${service}/${ville}`

  // Gate indexation: avis pages with 0 reviews AND 0 providers are thin content.
  // Fail-open: hasProvidersByServiceAndLocation returns false on DB error, but
  // shouldNoindex requires BOTH 0 providers AND hasUniqueData===false to noindex.
  // Reviews ARE the unique data for /avis/ pages, so hasUniqueData = hasReviews.
  const hasProviders = await hasProvidersByServiceAndLocation(service, ville)
  // Reuse reviewStats fetched above for CTR prefix — fail-open: null => indexed.
  const hasReviews = reviewStats === null ? true : (reviewStats.review_count ?? 0) > 0
  // Bug 4 fix : aligner sur le render qui cascade ville → dept (via
  // getTopProviders). Quand pas de providers ville mais que le département a
  // des artisans, la page rend bien un listing utile — ne pas noindex.
  const hasFallbackDept = hasProviders
    ? false
    : await hasDeptProviderFallback(service, villeData.departement)

  // Stratégie 140K V1 #5 (2026-04-29) : seuil strict 3 avis minimum (au niveau
  // département, source `getReviewStatsByDept`). Sans social proof minimal,
  // une page /avis/ est thin content qui dilue le crawl budget. Auto-réversible :
  // dès que reviewStats.review_count ≥ 3 via le flywheel (cron
  // /api/cron/send-review-invitations actif depuis 2026-04-18), l'ISR rebuild
  // retire le tag au prochain crawl Google.
  // Fail-open : si reviewStats === null (DB blip), on suit l'ancienne règle.
  const reviewCountStrict = reviewStats?.review_count ?? null
  const noindexInsufficientSocialProof = reviewCountStrict !== null && reviewCountStrict < 3

  const noindex =
    noindexInsufficientSocialProof ||
    shouldNoindex(`/avis/${service}/${ville}`, {
      providerCount: hasProviders ? 1 : 0,
      hasUniqueData: hasReviews || hasFallbackDept,
    })

  return {
    title,
    description,
    alternates: getAlternates(`/avis/${service}/${ville}`),
    robots: {
      index: !noindex,
      follow: true,
      'max-snippet': -1 as const,
      'max-image-preview': 'large' as const,
      'max-video-preview': -1 as const,
    },
    openGraph: {
      ...getOgDefaults(),
      locale: 'fr_FR',
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: serviceImage.src,
          width: 800,
          height: 600,
          alt: `Avis ${trade.name} à ${villeData.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [serviceImage.src],
    },
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

// Top-level error boundary — Audit 2026-04-25 : un throw imprévu doit dégrader
// vers `notFound()` plutôt qu'un 500 sur Googlebot.
export default async function AvisServiceVillePage(props: {
  params: Promise<{ service: string; ville: string }>
}) {
  try {
    return await renderAvisServiceVillePage(props)
  } catch (err) {
    if (isRedirectError(err) || isNotFoundError(err) || isDynamicServerError(err)) throw err
    console.error('[AvisServiceVillePage] unhandled error on render', err)
    notFound()
  }
}

async function renderAvisServiceVillePage({
  params,
}: {
  params: Promise<{ service: string; ville: string }>
}) {
  const { service, ville: villeSlug } = await params

  const trade = tradeContent[service]
  const villeData = getVilleBySlug(villeSlug)
  if (!trade || !villeData) notFound()

  const commune = await getCommuneBySlug(villeSlug)

  const multiplier = getRegionalMultiplier(villeData.region, villeData.departementCode)
  const minPrice = Math.round(trade.priceRange.min * multiplier)
  const maxPrice = Math.round(trade.priceRange.max * multiplier)

  const tradeLower = trade.name.toLowerCase()

  // ----- Fetch real data from database -----
  // Cascade: city-level first, fallback to department-level (all active, no review filter)
  // Fail-open : un throw imprévu (timeout Redis, RLS, etc.) ne doit jamais
  // causer un 500 sur cette page indexée par Googlebot. Audit 2026-04-25.
  const topProviders = await getTopProviders(villeData.name, service, villeData.departement).catch(
    () => [] as Awaited<ReturnType<typeof getTopProviders>>
  )
  // reviews.provider_id references providers.id directly
  const providerIds = topProviders.map((p) => p.id).filter((pid): pid is string => !!pid)
  const reviews = await getRecentReviews(providerIds).catch(
    () => [] as Awaited<ReturnType<typeof getRecentReviews>>
  )

  // Enrichment data (social proof, freshness, AEO) — fail-open
  const [reviewStats, topReviewsDept, dynamicLastMod] = await Promise.all([
    getReviewStatsByDept(service, villeData.departement).catch(() => null),
    getTopReviewsByDept(service, villeData.departement).catch(() => []),
    getDynamicLastModified(service, villeData.departementCode).catch(() => null),
  ])

  // Calculate aggregate stats
  const totalReviews = topProviders.reduce((sum, p) => sum + (p.review_count || 0), 0)
  const ratedProviders = topProviders.filter((p) => p.rating_average && p.rating_average > 0)
  const avgRating =
    ratedProviders.length > 0
      ? ratedProviders.reduce((sum, p) => sum + (p.rating_average || 0), 0) / ratedProviders.length
      : 0
  const roundedRating = Math.round(avgRating * 10) / 10

  // Rating distribution from reviews
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
    pct:
      reviews.length > 0
        ? Math.round((reviews.filter((r) => r.rating === stars).length / reviews.length) * 100)
        : 0,
  }))

  // Provider map keyed by provider id (= provider_id in reviews) for review display
  const providerMap = new Map(topProviders.filter((p) => p.id).map((p) => [p.id as string, p]))

  // ----- JSON-LD schemas -----
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Avis', url: '/avis' },
    { name: `Avis ${tradeLower}`, url: `/avis/${service}` },
    { name: villeData.name, url: `/avis/${service}/${villeSlug}` },
  ])

  // Review-specific FAQ (localized)
  const reviewFaqItems = [
    {
      question: `Comment trouver un bon ${tradeLower} à ${villeData.name} ?`,
      answer: `Pour trouver un bon ${tradeLower} à ${villeData.name}, consultez les avis clients, vérifiez les certifications (${trade.certifications.length > 0 ? trade.certifications.slice(0, 3).join(', ') : 'assurance décennale, RC pro'}) et comparez plusieurs devis. Les tarifs locaux vont de ${minPrice} à ${maxPrice} ${trade.priceRange.unit}.`,
    },
    {
      question: `Quel est le prix moyen d'un ${tradeLower} à ${villeData.name} ?`,
      answer: `À ${villeData.name} (${villeData.region}), les tarifs d'un ${tradeLower} varient de ${minPrice} à ${maxPrice} ${trade.priceRange.unit}. Ces prix sont ajustés selon le coût de la vie régional. Demandez plusieurs devis pour comparer.`,
    },
    {
      question: `Quelles certifications vérifier pour un ${tradeLower} à ${villeData.name} ?`,
      answer:
        trade.certifications.length > 0
          ? `Pour un ${tradeLower} à ${villeData.name}, vérifiez les certifications suivantes : ${trade.certifications.join(', ')}. L'assurance décennale et la RC pro sont obligatoires.`
          : `Vérifiez au minimum l'assurance décennale et la responsabilité civile professionnelle. Un ${tradeLower} sérieux à ${villeData.name} fournit ces documents sans difficulté.`,
    },
  ]

  // 2 trade FAQ (hash-selected, localized)
  const tradeFaqSorted = [...trade.faq].sort((a, b) => {
    const ha = Math.abs(hashCode(`avis-faq-sort-${service}-${villeSlug}-${a.q}`))
    const hb = Math.abs(hashCode(`avis-faq-sort-${service}-${villeSlug}-${b.q}`))
    return ha - hb
  })
  const tradeFaqItems = tradeFaqSorted.slice(0, 2).map((f) => ({
    question: f.q.replace(/\?$/, '') + ` à ${villeData.name} ?`,
    answer: f.a,
  }))

  const allFaqItems = [...reviewFaqItems, ...tradeFaqItems]

  // Merge real reviews + deterministic fallback into a single Service schema
  // (avoids duplicate Service schemas that confuse Google's validator)
  const hasRealReviews = totalReviews > 0

  const schemaReviews = hasRealReviews
    ? reviews.slice(0, 5).map((r) => ({
        '@type': 'Review' as const,
        author: { '@type': 'Person' as const, name: r.author_name || 'Client vérifié' },
        reviewRating: {
          '@type': 'Rating' as const,
          ratingValue: r.rating,
          bestRating: 5,
          worstRating: 1,
        },
        reviewBody: r.content,
        ...(r.created_at ? { datePublished: r.created_at.split('T')[0] } : {}),
      }))
    : []

  // Only emit structured data when backed by real reviews — never fabricate
  const reviewSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `${trade.name} à ${villeData.name}`,
    description: `Consultez les avis et recommandations pour choisir un ${tradeLower} de confiance à ${villeData.name} (${villeData.departement}). Prix : ${minPrice}–${maxPrice} ${trade.priceRange.unit}.`,
    url: `${SITE_URL}/avis/${service}/${villeSlug}`,
    image: `${SITE_URL}/images/services/${service}.webp`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: villeData.name,
      addressRegion: villeData.region,
      addressCountry: 'FR',
    },
    priceRange: `${minPrice}–${maxPrice} ${trade.priceRange.unit}`,
    ...(hasRealReviews
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: roundedRating,
            reviewCount: totalReviews,
            bestRating: 5,
            worstRating: 1,
          },
          review: schemaReviews,
        }
      : {}),
  }

  // ----- Enriched schemas (Vague 3) -----
  const enrichedFAQSchema = generateFAQSchema(
    allFaqItems.map((f) => ({
      question: f.question,
      answer: f.answer,
    }))
  )

  const enrichedSpeakableSchema = generateSpeakableSchema({
    url: `${SITE_URL}/avis/${service}/${villeSlug}`,
    title: `Avis ${tradeLower} à ${villeData.name}`,
    cssSelectors: ['.speakable-summary', '.speakable-faq', '[data-speakable="true"]'],
  })

  // AggregateRating schema (only if review data available)
  const aggregateRatingSchema = reviewStats
    ? generateAggregateRatingSchema({
        serviceName: trade.name,
        villeName: villeData.name,
        avgRating: reviewStats.avg_rating,
        reviewCount: reviewStats.review_count,
        serviceSlug: service,
        villeSlug,
      })
    : null

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Avis ${trade.name} à ${villeData.name} — recommandations clients vérifiées`,
    description: `Avis et recommandations pour choisir un ${tradeLower} de confiance à ${villeData.name} (${villeData.departement}). Prix : ${minPrice}–${maxPrice} ${trade.priceRange.unit}.${totalReviews > 0 ? ` ${totalReviews} avis vérifiés, note ${roundedRating.toFixed(1)}/5.` : ''}`,
    image: `${SITE_URL}/images/services/${service}.webp`,
    url: `${SITE_URL}/avis/${service}/${villeSlug}`,
    mainEntityOfPage: `${SITE_URL}/avis/${service}/${villeSlug}`,
    inLanguage: 'fr-FR',
    datePublished: '2026-01-15T08:00:00+02:00',
    dateModified: monthlyAnchorIso(),
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.speakable-summary', '.speakable-faq', '[data-speakable="true"]'],
    },
  }

  const enBrefPoints: string[] = [
    totalReviews > 0
      ? `Note moyenne ${roundedRating.toFixed(1)}/5 sur ${totalReviews} avis vérifiés à ${villeData.name}`
      : `Avis et recommandations clients pour ${tradeLower} à ${villeData.name}`,
    `Tarifs locaux : ${minPrice}–${maxPrice} ${trade.priceRange.unit}`,
    `Délai de réponse moyen : ${trade.averageResponseTime}`,
    topProviders.length > 0
      ? `${topProviders.length} ${tradeLower}${topProviders.length > 1 ? 's' : ''} référencé${topProviders.length > 1 ? 's' : ''} à ${villeData.name}`
      : `Critères de choix : qualifications, transparence, réactivité, qualité`,
  ]

  const tldrBullets: string[] = [
    `Avis ${tradeLower} à ${villeData.name} (${villeData.departementCode}) — ${totalReviews > 0 ? `${roundedRating.toFixed(1)}/5 sur ${totalReviews} avis` : 'recommandations vérifiées'}, fourchette ${minPrice}-${maxPrice} ${trade.priceRange.unit}.`,
    `Critères clés : qualifications obligatoires (${trade.certifications.length > 0 ? trade.certifications.slice(0, 2).join(', ') : 'décennale + RC pro'}), transparence du devis, ponctualité, qualité des finitions.`,
    `${trade.averageResponseTime}. Bonnes pratiques : demander 2-3 devis détaillés avant de signer, vérifier l'assurance et les certifications.`,
    `Notre rôle : mise en relation gratuite avec un ${tradeLower} référencé à ${villeData.name}, devis sous 24 h, sans engagement.`,
  ]

  // ----- Related links -----
  const nearbyCities = getNearbyCities(villeSlug, 6)
  const relatedSlugs = relatedServices[service] || []
  const otherTrades =
    relatedSlugs.length > 0
      ? relatedSlugs.slice(0, 5).filter((s) => tradeContent[s])
      : tradeSlugs.filter((s) => s !== service).slice(0, 5)

  // Top 10 nearby cities by population
  const nearbyCitiesByPop = [...villes]
    .filter((v) => v.slug !== villeSlug)
    .sort((a, b) => parsePopulation(b.population) - parsePopulation(a.population))
    .slice(0, 10)

  // ----- Hash-selected tips (3) -----
  const sortedTips = [...trade.tips].sort((a, b) => {
    const ha = Math.abs(hashCode(`avis-tip-sort-${service}-${villeSlug}-${a}`))
    const hb = Math.abs(hashCode(`avis-tip-sort-${service}-${villeSlug}-${b}`))
    return ha - hb
  })
  const selectedTips = sortedTips.slice(0, 3)

  // ----- Review criteria (localized) -----
  const reviewCriteria = [
    {
      icon: Shield,
      title: 'Qualifications et certifications',
      description:
        trade.certifications.length > 0
          ? `Vérifiez que votre ${tradeLower} à ${villeData.name} possède les certifications suivantes : ${trade.certifications.join(', ')}. L'assurance décennale et la RC pro sont obligatoires.`
          : `Vérifiez que votre ${tradeLower} à ${villeData.name} dispose d'une assurance décennale et d'une responsabilité civile professionnelle.`,
    },
    {
      icon: Euro,
      title: 'Transparence des tarifs',
      description: `Un bon ${tradeLower} à ${villeData.name} fournit un devis détaillé avant intervention. Prix habituels : ${minPrice}–${maxPrice} ${trade.priceRange.unit}.`,
    },
    {
      icon: Clock,
      title: 'Réactivité et ponctualité',
      description: `Vérifiez le délai de réponse habituel à ${villeData.name}. ${trade.averageResponseTime}.`,
    },
    {
      icon: CheckCircle,
      title: 'Qualité des finitions',
      description: `Examinez les photos avant/après dans les avis clients. Un ${tradeLower} soigneux à ${villeData.name} est un gage de sérieux.`,
    },
    {
      icon: Phone,
      title: 'Service après-intervention',
      description: `Un artisan sérieux à ${villeData.name} assure un suivi et reste joignable après les travaux.`,
    },
  ]

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd
        data={[
          breadcrumbSchema,
          articleSchema,
          reviewSchema,
          ...(enrichedFAQSchema ? [enrichedFAQSchema] : []),
          enrichedSpeakableSchema,
          ...(aggregateRatingSchema ? [aggregateRatingSchema] : []),
        ]}
      />

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative bg-charcoal-950 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,107,75,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(232,107,75,0.1) 0%, transparent 50%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sand-50 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28 md:pt-14 md:pb-36">
          <Breadcrumb
            items={[
              { label: 'Avis', href: '/avis' },
              { label: `Avis ${tradeLower}`, href: `/avis/${service}` },
              { label: villeData.name },
            ]}
            className="mb-6 text-charcoal-400 [&_a]:text-charcoal-400 [&_a:hover]:text-white [&_svg]:text-charcoal-600"
          />
          <div className="text-center">
            <h1
              className="font-heading text-4xl md:text-5xl font-extrabold mb-6 tracking-[-0.025em]"
              data-speakable="true"
            >
              {(() => {
                const h1Hash = Math.abs(hashCode(`avis-loc-h1-${service}-${villeSlug}`))
                const h1Templates = [
                  `Avis ${tradeLower} à ${villeData.name}`,
                  `Avis ${tradeLower} à ${villeData.name} : recommandations clients`,
                  `${trade.name} à ${villeData.name} : avis clients vérifiés`,
                  `${trade.name} à ${villeData.name} : avis et notes clients`,
                  `Avis et recommandations ${tradeLower} à ${villeData.name}`,
                ]
                return h1Templates[h1Hash % h1Templates.length]
              })()}
            </h1>
            <p className="text-xl text-charcoal-400 max-w-3xl mx-auto mb-4 speakable-summary">
              Consultez les avis et recommandations pour choisir un {tradeLower} de confiance à{' '}
              {villeData.name} ({villeData.departement}). Prix local : {minPrice} à {maxPrice}{' '}
              {trade.priceRange.unit}.
            </p>
            <LastUpdated
              label="Avis vérifiés le"
              date={dynamicLastMod}
              className="justify-center text-charcoal-900 mb-4"
            />
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {totalReviews > 0 && (
                <div className="flex items-center gap-2 bg-white/[0.08] backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-medium">
                    {roundedRating.toFixed(1)}/5 — {totalReviews} avis
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-sm">
                <Euro className="w-4 h-4 text-amber-400" />
                <span>
                  {minPrice} – {maxPrice} {trade.priceRange.unit}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-sm">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Artisans référencés</span>
              </div>
              {commune?.nb_entreprises_artisanales && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-sm">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>{formatNumber(commune.nb_entreprises_artisanales)} artisans locaux</span>
                </div>
              )}
            </div>
            <div className="mt-8">
              <Link
                href={`/services/${service}/${villeSlug}`}
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all text-lg"
              >
                <ArrowRight className="w-5 h-5" />
                Devis gratuit à {villeData.name}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <IntentNavBar
        serviceSlug={service}
        villeSlug={villeSlug}
        currentIntent="avis"
        serviceName={trade.name}
        villeName={villeData.name}
        providerCount={topProviders.length}
        avgRating={roundedRating > 0 ? roundedRating : undefined}
        reviewCount={totalReviews > 0 ? totalReviews : undefined}
      />

      {/* ─── Article byline + En bref — E-E-A-T DOM signals + FS Position 0 ── */}
      <section className="bg-white border-b border-sand-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ArticleMeta
            author={SITE_NAME}
            datePublished="2026-01-15"
            dateModified={monthlyAnchorIso().slice(0, 10)}
            className="mb-5"
          />
          <EnBrefBox keyPoints={enBrefPoints} />
        </div>
      </section>

      {/* ─── REAL STATS BANNER ─────────────────────────── */}
      {totalReviews > 0 && (
        <section className="py-8 bg-white border-b">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              <div className="text-center">
                <div className="flex items-center gap-2 justify-center mb-1">
                  <Star className="w-7 h-7 text-amber-500 fill-amber-500" />
                  <span className="text-3xl font-bold text-charcoal-900">
                    {roundedRating.toFixed(1)}
                  </span>
                </div>
                <div className="text-sm text-charcoal-500">Note moyenne</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-charcoal-900">{totalReviews}</div>
                <div className="text-sm text-charcoal-500">Avis vérifiés</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-charcoal-900">{topProviders.length}</div>
                <div className="text-sm text-charcoal-500">Artisans notés</div>
              </div>
              {/* Rating distribution bars */}
              <div className="flex flex-col gap-1">
                {ratingDistribution.map(({ stars, pct }) => (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-xs text-charcoal-500 w-3">{stars}</span>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <div className="w-24 h-2 bg-sand-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-charcoal-400 w-8">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── EMPTY STATE (no reviews) ──────────────────────── */}
      {totalReviews === 0 && (
        <section className="py-12 bg-white border-b">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-2">
              Aucun avis pour {tradeLower} à {villeData.name} pour le moment
            </h2>
            <p className="text-charcoal-500 mb-6">Soyez le premier à partager votre expérience !</p>
            <Link
              href={`/services/${service}/${villeSlug}`}
              className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold text-sm"
            >
              Trouver un {tradeLower} à {villeData.name}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* ─── ARTISANS LES MIEUX NOTÉS ───────────────────── */}
      {topProviders.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-2 text-center">
              {topProviders.length >= 2
                ? `${trade.name}s les mieux notés à ${villeData.name}`
                : `Artisans les mieux notés à ${villeData.name}`}
            </h2>
            <p className="text-charcoal-900 text-center mb-8 max-w-lg mx-auto">
              Classement basé sur les avis clients vérifiés et la note moyenne.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topProviders.map((provider, i) => (
                <Link
                  key={provider.id}
                  href={`/services/${service}/${villeSlug}/${provider.stable_id}`}
                  className="bg-sand-50 hover:bg-primary-50 border border-sand-300 hover:border-primary-300 rounded-xl p-5 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-500 font-bold text-sm">
                        {provider.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-charcoal-900 group-hover:text-primary-500 transition-colors text-sm">
                          {provider.name}
                        </div>
                        {provider.is_verified && (
                          <div className="flex items-center gap-1 text-green-600 text-xs">
                            <CheckCircle className="w-3 h-3" />
                            Vérifié
                          </div>
                        )}
                      </div>
                    </div>
                    {i < 3 && (
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          i === 0
                            ? 'bg-amber-100 text-amber-700'
                            : i === 1
                              ? 'bg-sand-100 text-charcoal-600'
                              : 'bg-orange-50 text-orange-600'
                        }`}
                      >
                        {i + 1}
                      </div>
                    )}
                  </div>
                  {provider.rating_average && provider.rating_average > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(provider.rating_average ?? 0)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-sand-400'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-charcoal-900">
                        {provider.rating_average.toFixed(1)}
                      </span>
                      <span className="text-xs text-charcoal-500">
                        ({provider.review_count} avis)
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── DERNIERS AVIS CLIENTS ──────────────────────── */}
      {reviews.length > 0 && (
        <section className="py-12 bg-sand-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-2 text-center">
              Derniers avis clients
            </h2>
            <p className="text-charcoal-900 text-center mb-8">
              Avis authentiques de clients ayant fait appel à un {tradeLower} à {villeData.name}.
            </p>
            <div className="space-y-4">
              {reviews.slice(0, 5).map((review) => {
                const provider = providerMap.get(review.provider_id)
                return (
                  <div key={review.id} className="bg-white rounded-xl border border-sand-200 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-charcoal-900 text-sm">
                            {review.author_name || 'Client vérifié'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Vérifié
                          </span>
                        </div>
                        {provider && (
                          <div className="text-xs text-charcoal-500">
                            {tradeLower} — {provider.name}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-sand-400'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.content && (
                      <p className="text-charcoal-700 text-sm leading-relaxed">
                        {review.content.length > 300
                          ? review.content.slice(0, 300) + '…'
                          : review.content}
                      </p>
                    )}
                    <div className="mt-3 text-xs text-charcoal-400">
                      {new Date(review.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
            {topProviders.length > 0 && (
              <div className="text-center mt-8">
                <Link
                  href={`/services/${service}/${villeSlug}`}
                  className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold text-sm"
                >
                  Voir tous les {tradeLower}s à {villeData.name}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── REVIEW CRITERIA (localized) ──────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-2 text-center">
            Comment choisir un {tradeLower} à {villeData.name}
          </h2>
          <p className="text-charcoal-500 text-sm text-center mb-8">
            Les critères essentiels pour trouver un artisan de confiance à {villeData.name}.
          </p>
          <div className="space-y-4">
            {reviewCriteria.map((criterion) => {
              const Icon = criterion.icon
              return (
                <div
                  key={criterion.title}
                  className="flex items-start gap-4 bg-sand-50 rounded-xl border border-sand-300 p-5 hover:bg-primary-50 hover:border-primary-200 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-charcoal-900 mb-1">
                      {criterion.title}
                    </h3>
                    <p className="text-charcoal-600 text-sm leading-relaxed">
                      {criterion.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── LOCAL PRICING ────────────────────────────────────── */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6 text-center">
            Tarifs indicatifs {tradeLower} à {villeData.name}
          </h2>
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-8 text-center mb-8">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold text-primary-500">
                {minPrice} — {maxPrice}
              </span>
              <span className="text-charcoal-600 text-lg">{trade.priceRange.unit}</span>
            </div>
            <p className="text-charcoal-500 text-sm mt-3">
              Prix moyen constaté à {villeData.name} et ses alentours, main-d'&oelig;uvre incluse
            </p>
            {multiplier !== 1.0 && (
              <p className="text-xs text-charcoal-400 mt-2">
                {multiplier > 1.0
                  ? `Les tarifs ${getRegionPreposition(villeData.region)} sont en moyenne ${Math.round((multiplier - 1) * 100)} % supérieurs à la moyenne nationale`
                  : `Les tarifs ${getRegionPreposition(villeData.region)} sont en moyenne ${Math.round((1 - multiplier) * 100)} % inférieurs à la moyenne nationale`}
              </p>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {trade.commonTasks.slice(0, 6).map((task, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-white rounded-xl border border-sand-300 p-4"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Euro className="w-4 h-4 text-primary-500" />
                </div>
                <span className="text-charcoal-800 text-sm">{task}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              href={`/barometre/tarifs/${service}`}
              className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold text-sm"
            >
              Consulter le baromètre des prix {tradeLower}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── LOCAL FACTORS ────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-2 text-center">
            Facteurs locaux à {villeData.name}
          </h2>
          <p className="text-charcoal-500 text-sm text-center mb-8">
            Plusieurs facteurs locaux influencent le choix d'un {tradeLower} à {villeData.name}.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Artisan density */}
            <LocalFactorCard
              icon={<Users className="w-5 h-5 text-amber-600" />}
              bgColor="bg-amber-50"
              title="Densité d'artisans"
              value={
                commune?.nb_entreprises_artisanales
                  ? `${formatNumber(commune.nb_entreprises_artisanales)} entreprises`
                  : null
              }
              description={
                commune?.nb_entreprises_artisanales
                  ? commune.nb_entreprises_artisanales > 500
                    ? `Avec ${formatNumber(commune.nb_entreprises_artisanales)} entreprises artisanales, ${villeData.name} offre un large choix de ${tradeLower}s. Comparez les avis pour faire le bon choix.`
                    : `${villeData.name} compte ${formatNumber(commune.nb_entreprises_artisanales)} entreprises artisanales. Consultez les avis pour identifier les professionnels les mieux notés.`
                  : `Le nombre d'artisans disponibles à ${villeData.name} influence directement l'offre et la qualité de service.`
              }
            />

            {/* Climate zone */}
            <LocalFactorCard
              icon={<Thermometer className="w-5 h-5 text-primary-500" />}
              bgColor="bg-primary-50"
              title="Zone climatique"
              value={getClimatLabel(commune?.climat_zone ?? null)}
              description={`Les conditions climatiques à ${villeData.name} peuvent influencer le type d'interventions demandées et la disponibilité des ${tradeLower}s.`}
            />

            {/* Housing type */}
            <LocalFactorCard
              icon={<Building2 className="w-5 h-5 text-green-600" />}
              bgColor="bg-green-50"
              title="Type de logement"
              value={commune?.part_maisons_pct ? `${commune.part_maisons_pct} % de maisons` : null}
              description={
                commune?.part_maisons_pct
                  ? commune.part_maisons_pct > 50
                    ? `À ${villeData.name}, ${commune.part_maisons_pct} % des logements sont des maisons individuelles, ce qui influence les types de travaux de ${tradeLower} demandés.`
                    : `À ${villeData.name}, les appartements sont majoritaires (${100 - commune.part_maisons_pct} %). Les travaux en copropriété peuvent impliquer des contraintes spécifiques.`
                  : `La répartition entre maisons et appartements à ${villeData.name} influence les types de travaux demandés.`
              }
            />

            {/* Population */}
            <LocalFactorCard
              icon={<MapPin className="w-5 h-5 text-charcoal-600" />}
              bgColor="bg-sand-50"
              title="Population"
              value={
                commune?.population
                  ? `${formatNumber(commune.population)} habitants`
                  : villeData.population
                    ? `${villeData.population} habitants`
                    : null
              }
              description={`La taille de la population à ${villeData.name} influence la concurrence entre artisans et la facilité à trouver un ${tradeLower} disponible rapidement.`}
            />
          </div>
        </div>
      </section>

      {/* ─── MARCHÉ LOCAL ─────────────────────────────────────── */}
      {commune &&
        (commune.nb_entreprises_artisanales ||
          commune.pct_passoires_dpe ||
          commune.revenu_median ||
          commune.nb_maprimerenov_annuel ||
          commune.nb_transactions_annuelles) && (
          <section className="py-16 bg-sand-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-2 text-center">
                Le marché à {villeData.name}
              </h2>
              <p className="text-charcoal-500 text-sm text-center mb-8">
                Données locales pour contextualiser votre recherche de {tradeLower} à{' '}
                {villeData.name}.
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Marché artisanal local */}
                {commune.nb_entreprises_artisanales != null && (
                  <div className="bg-white rounded-xl border border-sand-300 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-amber-600" />
                      </div>
                      <h3 className="font-semibold text-charcoal-900">Marché artisanal local</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-charcoal-700">
                      <li>
                        &Agrave; {villeData.name},{' '}
                        <span className="font-semibold">
                          {formatNumber(commune.nb_entreprises_artisanales)}
                        </span>{' '}
                        entreprises artisanales sont référencées.
                      </li>
                      {commune.nb_artisans_btp != null && (
                        <li>
                          <span className="font-semibold">
                            {formatNumber(commune.nb_artisans_btp)}
                          </span>{' '}
                          spécialisées dans le bâtiment.
                        </li>
                      )}
                      {commune.nb_artisans_rge != null && (
                        <li>
                          Dont{' '}
                          <span className="font-semibold">
                            {formatNumber(commune.nb_artisans_rge)}
                          </span>{' '}
                          certifiées RGE.
                        </li>
                      )}
                    </ul>
                    {commune.population > 0 && (
                      <p className="mt-3 text-xs text-charcoal-500 leading-relaxed">
                        {(() => {
                          const ratio = Math.round(
                            (commune.nb_entreprises_artisanales / commune.population) * 10000
                          )
                          const level = ratio >= 200 ? 'forte' : ratio >= 80 ? 'modérée' : 'faible'
                          return `Avec un ratio de ${ratio} artisans pour 10 000 habitants, la concurrence est ${level} à ${villeData.name}.`
                        })()}
                      </p>
                    )}
                  </div>
                )}

                {/* Qualité du parc immobilier */}
                {(commune.pct_passoires_dpe != null || commune.part_maisons_pct != null) && (
                  <div className="bg-white rounded-xl border border-sand-300 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-charcoal-900">
                        Qualité du parc immobilier
                      </h3>
                    </div>
                    <ul className="space-y-2 text-sm text-charcoal-700">
                      {commune.pct_passoires_dpe != null && (
                        <li>
                          <span className="font-semibold">{commune.pct_passoires_dpe}&nbsp;%</span>{' '}
                          de passoires thermiques (DPE F ou G).
                        </li>
                      )}
                      {commune.nb_dpe_total != null && (
                        <li>
                          Sur{' '}
                          <span className="font-semibold">
                            {formatNumber(commune.nb_dpe_total)}
                          </span>{' '}
                          diagnostics réalisés.
                        </li>
                      )}
                      {commune.part_maisons_pct != null && (
                        <li>{commune.part_maisons_pct}&nbsp;% de maisons individuelles.</li>
                      )}
                    </ul>
                    {commune.pct_passoires_dpe != null && commune.pct_passoires_dpe > 15 && (
                      <p className="mt-3 text-xs text-charcoal-500 leading-relaxed">
                        Un parc avec {commune.pct_passoires_dpe}&nbsp;% de passoires thermiques
                        génère une forte demande en rénovation énergétique à {villeData.name}.
                      </p>
                    )}
                  </div>
                )}

                {/* Pouvoir d'achat et prix */}
                {(commune.revenu_median != null || commune.prix_m2_moyen != null) && (
                  <div className="bg-white rounded-xl border border-sand-300 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Euro className="w-5 h-5 text-primary-500" />
                      </div>
                      <h3 className="font-semibold text-charcoal-900">Pouvoir d'achat et prix</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-charcoal-700">
                      {commune.revenu_median != null && (
                        <li>
                          Revenu médian :{' '}
                          <span className="font-semibold">
                            {formatNumber(commune.revenu_median)}&nbsp;€
                          </span>{' '}
                          / an.
                        </li>
                      )}
                      {commune.prix_m2_moyen != null && (
                        <li>
                          Prix au m&sup2; :{' '}
                          <span className="font-semibold">
                            {formatNumber(commune.prix_m2_moyen)}&nbsp;€
                          </span>
                          .
                        </li>
                      )}
                    </ul>
                    {commune.revenu_median != null && commune.prix_m2_moyen != null && (
                      <p className="mt-3 text-xs text-charcoal-500 leading-relaxed">
                        {(() => {
                          const prixM2 = commune.prix_m2_moyen
                          const revenu = commune.revenu_median
                          const level =
                            prixM2 >= 4000
                              ? 'premium'
                              : prixM2 >= 2000
                                ? 'intermédiaire'
                                : 'accessible'
                          return `Le revenu médian de ${formatNumber(revenu)} € et un prix au m² de ${formatNumber(prixM2)} € situent ${villeData.name} dans un marché ${level}.`
                        })()}
                      </p>
                    )}
                  </div>
                )}

                {/* Indicateurs de satisfaction */}
                {(commune.nb_maprimerenov_annuel != null ||
                  commune.nb_transactions_annuelles != null) && (
                  <div className="bg-white rounded-xl border border-sand-300 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-charcoal-900">Indicateurs d'activité</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-charcoal-700">
                      {commune.nb_maprimerenov_annuel != null && (
                        <li>
                          <span className="font-semibold">
                            {formatNumber(commune.nb_maprimerenov_annuel)}
                          </span>{' '}
                          dossiers MaPrimeRénov' déposés, signe d'un marché actif.
                        </li>
                      )}
                      {commune.nb_transactions_annuelles != null && (
                        <li>
                          <span className="font-semibold">
                            {formatNumber(commune.nb_transactions_annuelles)}
                          </span>{' '}
                          transactions immobilières, source de demande en travaux.
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

      {/* ─── TIPS ─────────────────────────────────────────────── */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6 text-center">
            Conseils pour choisir un {tradeLower} à {villeData.name}
          </h2>
          <div className="space-y-4">
            {selectedTips.map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-white rounded-xl border border-sand-300 p-5"
              >
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-charcoal-700 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CERTIFICATIONS ───────────────────────────────────── */}
      {trade.certifications.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6 text-center">
              Certifications à vérifier à {villeData.name}
            </h2>
            <p className="text-charcoal-600 text-center mb-8">
              Vérifiez que votre {tradeLower} à {villeData.name} possède les certifications adaptées
              à votre projet.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {trade.certifications.map((cert) => (
                <div
                  key={cert}
                  className="flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-3 rounded-xl text-sm font-medium"
                >
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  {cert}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── TL;DR pré-FAQ — capture FS Position 0 / AI Overviews ──── */}
      <section className="py-8 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <TldrBlock bullets={tldrBullets} />
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────── */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-8 text-center">
            Questions fréquentes — Avis {trade.name} à {villeData.name}
          </h2>
          <div className="space-y-4 speakable-faq">
            {allFaqItems.map((item, i) => (
              <details
                key={i}
                open={i === 0}
                className="bg-white rounded-xl border border-sand-300 group"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="text-base font-semibold text-charcoal-900 pr-4">
                    {item.question}
                  </h3>
                  <ChevronDown className="w-5 h-5 text-charcoal-400 flex-shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-charcoal-600 text-sm leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl font-bold text-white mb-4">
            Trouver un {tradeLower} de confiance {'à'} {villeData.name}
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Devis gratuit d'artisans bien not{'é'}s pr{'è'}s de chez vous {'—'} sans engagement.
          </p>
          <TarifsDevisCTA
            service={service}
            serviceName={tradeLower}
            ville={villeSlug}
            villeName={villeData.name}
            variant="banner"
          />
          <p className="text-primary-100 text-sm mt-6">
            Ou{' '}
            <Link
              href={`/services/${service}/${villeSlug}`}
              className="underline hover:text-white transition-colors"
            >
              voir les {tradeLower}s {'à'} {villeData.name}
            </Link>
          </p>
        </div>
      </section>

      {/* ─── RELATED CITIES ───────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6">
            Avis {tradeLower} dans d'autres villes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl">
            {nearbyCities.map((v) => (
              <Link
                key={v.slug}
                href={`/avis/${service}/${v.slug}`}
                className="bg-sand-50 hover:bg-primary-50 border border-sand-300 hover:border-primary-300 rounded-xl p-4 transition-all group text-center"
              >
                <div className="font-semibold text-charcoal-900 group-hover:text-primary-500 transition-colors text-sm">
                  Avis {tradeLower} à {v.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── RELATED SERVICES ─────────────────────────────────── */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6">
            Autres avis artisans à {villeData.name}
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {otherTrades.map((slug) => {
              const t = tradeContent[slug]
              if (!t) return null
              const m = getRegionalMultiplier(villeData.region, villeData.departementCode)
              return (
                <Link
                  key={slug}
                  href={`/avis/${slug}/${villeSlug}`}
                  className="bg-white hover:bg-primary-50 border border-sand-300 hover:border-primary-300 rounded-xl p-4 transition-all group"
                >
                  <div className="font-semibold text-charcoal-900 group-hover:text-primary-500 transition-colors text-sm">
                    Avis {t.name.toLowerCase()} à {villeData.name}
                  </div>
                  <div className="text-xs text-charcoal-500 mt-1">
                    {Math.round(t.priceRange.min * m)} — {Math.round(t.priceRange.max * m)}{' '}
                    {t.priceRange.unit}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── NEARBY CITIES ────────────────────────────────────── */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-4">
            Grandes villes à proximité
          </h2>
          <div className="flex flex-wrap gap-2">
            {nearbyCitiesByPop.map((v) => (
              <Link
                key={v.slug}
                href={`/avis/${service}/${v.slug}`}
                className="text-sm text-primary-500 hover:text-primary-800 hover:underline"
              >
                {v.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Problèmes courants */}
      {(() => {
        const problems = getProblemsByService(service).slice(0, 4)
        if (problems.length === 0) return null
        return (
          <section className="py-12 bg-white border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl font-bold text-charcoal-900 mb-4">Problèmes courants</h2>
              <div className="flex flex-wrap gap-3">
                {problems.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/problemes/${p.slug}/${villeSlug}`}
                    className="px-4 py-2.5 bg-sand-50 hover:bg-orange-50 text-charcoal-700 hover:text-orange-800 rounded-lg text-sm font-medium border border-sand-300 hover:border-orange-200 transition-all"
                  >
                    {p.name} à {villeData.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )
      })()}

      {/* ─── ENRICHMENT: Intelligence locale (Vague 2) ───────── */}
      <ProblemesCourantsBlock
        serviceSlug={service}
        serviceName={trade.name}
        villeName={villeData.name}
        villeSlug={villeSlug}
        climatZone={commune?.climat_zone ?? null}
      />

      {commune && (
        <RisquesGeoBlock
          communeData={commune}
          serviceName={trade.name}
          villeName={villeData.name}
        />
      )}

      {commune && (
        <ContexteDPEBlock
          communeData={commune}
          serviceName={trade.name}
          villeName={villeData.name}
        />
      )}

      <BarometrePrixBlock
        serviceSlug={service}
        serviceName={trade.name}
        villeName={villeData.name}
        regionName={villeData.region}
        revenuMedian={commune?.revenu_median}
        prixM2Moyen={commune?.prix_m2_moyen}
        densite={commune?.densite_population}
      />

      <CalendrierSaisonnierBlock
        serviceSlug={service}
        serviceName={trade.name}
        villeName={villeData.name}
        climatZone={commune?.climat_zone ?? null}
        joursGelAnnuels={commune?.jours_gel_annuels}
        precipitationAnnuelle={commune?.precipitation_annuelle}
        temperatureMoyenneHiver={commune?.temperature_moyenne_hiver}
        temperatureMoyenneEte={commune?.temperature_moyenne_ete}
        moisTravauxExtDebut={commune?.mois_travaux_ext_debut}
        moisTravauxExtFin={commune?.mois_travaux_ext_fin}
        altitudeMoyenne={commune?.altitude_moyenne}
      />

      <CommuneContextBlock
        communeData={commune}
        serviceName={trade.name}
        villeName={villeData.name}
      />

      <ComparatifsBlock serviceSlug={service} serviceName={trade.name} />

      {commune && (
        <PrimesCEEBlock
          serviceSlug={service}
          serviceName={trade.name}
          villeName={villeData.name}
          communeData={commune}
        />
      )}

      {/* ─── EDITORIAL CREDIBILITY ────────────────────────────── */}
      <section className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-sand-50 rounded-2xl border border-charcoal-200 p-6">
            <h3 className="text-sm font-semibold text-charcoal-700 mb-2">
              Transparence éditoriale
            </h3>
            <p className="text-xs text-charcoal-900 leading-relaxed">
              Les informations présentées pour {villeData.name} sont indicatives et destinées à vous
              aider dans le choix d'un {tradeLower}. Les prix affichés sont des fourchettes ajustées
              en fonction des données régionales ({villeData.region}). Seul un devis personnalisé
              fait foi. {SITE_NAME} est un annuaire indépendant.
            </p>
          </div>
        </div>
      </section>

      <VerticalCrossLinks
        currentService={service}
        villeSlug={villeSlug}
        villeName={villeData.name}
        intent="avis"
      />

      <InContentLinks
        serviceSlug={service}
        serviceName={trade.name}
        villeSlug={villeSlug}
        villeName={villeData.name}
        currentIntent="avis"
        departement={villeData.departement}
        departementCode={villeData.departementCode}
        region={villeData.region}
      />

      <CrossIntentLinks
        service={service}
        serviceName={trade.name}
        ville={villeSlug}
        villeName={villeData.name}
        currentIntent="avis"
      />

      <DeepPageLinks
        currentService={service}
        currentVille={villeSlug}
        currentIntent="avis"
        skipCrossIntent
      />

      <ServiceIntentReroute
        serviceSlug={service}
        villeSlug={villeSlug}
        villeName={villeData.name}
        resolveServiceName={(slug) => tradeContent[slug]?.name ?? null}
      />

      <MoneyPageBoost currentService={service} currentVille={villeSlug} />

      <MaillageInterneBlock
        serviceSlug={service}
        serviceName={trade.name}
        villeSlug={villeSlug}
        villeName={villeData.name}
        departementSlug={getDepartementByCode(villeData.departementCode)?.slug}
        departementName={villeData.departement}
        regionName={villeData.region}
        currentIntent="avis"
      />

      {/* ─── ENRICHMENT: Social proof, freshness, UGC, AEO (Vague 3) ─── */}

      <AEOAnswerBlock
        serviceSlug={service}
        serviceName={trade.name}
        villeName={villeData.name}
        departmentName={villeData.departement}
        providerCount={topProviders.length}
        avgRating={reviewStats?.avg_rating ?? null}
        priceRange={{ min: minPrice, max: maxPrice }}
        communePopulation={commune?.population ?? null}
      />

      <ReviewsDeptBlock
        serviceSlug={service}
        serviceName={trade.name}
        departmentName={villeData.departement}
        stats={reviewStats}
        reviews={topReviewsDept}
      />

      <DevisCounterBlock
        count={0}
        serviceName={trade.name}
        departmentName={villeData.departement}
      />

      <GlossaireTooltips serviceSlug={service} />

      <PhotoGalleryBlock
        serviceName={trade.name}
        villeName={villeData.name}
        departmentName={villeData.departement}
        providerCount={topProviders.length}
      />

      <UserQuestionBlock
        serviceSlug={service}
        serviceName={trade.name}
        villeName={villeData.name}
        villeSlug={villeSlug}
      />

      <FreshnessSignal lastModified={dynamicLastMod} />

      <StickyMobileCTA
        serviceSlug={service}
        cityName={villeData.name}
        citySlug={villeSlug}
        ctaText="Devis gratuit"
      />
      <ExitIntentPopup
        sessionKey="sa:exit-avis"
        description="Contactez un artisan bien noté — devis gratuit et sans engagement."
        ctaHref={`/services/${service}/${villeSlug}`}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-component: Local factor card
// ---------------------------------------------------------------------------

function LocalFactorCard({
  icon,
  bgColor,
  title,
  value,
  description,
}: {
  icon: React.ReactNode
  bgColor: string
  title: string
  value: string | null
  description: string
}) {
  return (
    <div className="bg-white rounded-xl border border-sand-300 p-6">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}
        >
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-charcoal-900 text-sm">{title}</h3>
          {value && <p className="text-xs text-primary-500 font-medium">{value}</p>}
        </div>
      </div>
      <p className="text-charcoal-600 text-sm leading-relaxed">{description}</p>
    </div>
  )
}
