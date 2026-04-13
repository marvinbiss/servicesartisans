import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  CheckCircle,
  Euro,
  ChevronDown,
  MapPin,
  Users,
  Thermometer,
  Building2,
  Leaf,
  ArrowRight,
} from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema, getFAQSchema, getSpeakableSchema } from '@/lib/seo/jsonld'
import { SITE_URL, SITE_NAME } from '@/lib/seo/config'
import { tradeContent, getTradesSlugs } from '@/lib/data/trade-content'
import { villes, getVilleBySlug, getNearbyCities, getDepartementByCode } from '@/lib/data/france'
import { getCommuneBySlug } from '@/lib/data/commune-data'
import {
  getProvidersByServiceAndLocation,
  getProvidersByServiceAndDepartment,
  getRgeProviderCountByServiceAndLocation,
  hasProvidersByServiceAndLocation,
} from '@/lib/supabase'
import { shouldNoindex } from '@/lib/seo/pruning'
import { isRgeAllowedService } from '@/lib/rge/service-city-listings'
import RgePseoCtaLink from '@/components/rge/RgePseoCtaLink'
import { hashCode } from '@/lib/seo/location-content'
import LocalDataInsights from '@/components/seo/LocalDataInsights'
import LocalProviderShowcase from '@/components/seo/LocalProviderShowcase'
import FallbackProviders from '@/components/seo/FallbackProviders'
import { getServiceImageForContext } from '@/lib/data/images'
import { getProblemsByService } from '@/lib/data/problems'
import { relatedServices } from '@/lib/constants/navigation'
import { SpeakableAnswerBox } from '@/components/SpeakableAnswerBox'
import PriceTableHTML from '@/components/seo/PriceTableHTML'
import LastUpdated from '@/components/seo/LastUpdated'
import CrossIntentLinks from '@/components/seo/CrossIntentLinks'
import DeepPageLinks from '@/components/seo/DeepPageLinks'
import MoneyPageBoost from '@/components/seo/MoneyPageBoost'
import InContentLinks from '@/components/seo/InContentLinks'
import VerticalCrossLinks from '@/components/seo/VerticalCrossLinks'
import ImmediateAnswerBlock from '@/components/seo/ImmediateAnswerBlock'
import StructuredPricingTable from '@/components/seo/StructuredPricingTable'
import LocalInsightsBlock from '@/components/seo/LocalInsightsBlock'
import { getDefaultAuthor } from '@/lib/data/team'
import GeoPageCTA from '@/components/conversion/GeoPageCTA'
import IntentNavBar from '@/components/seo/IntentNavBar'
import TrustPromiseBanner from '@/components/conversion/TrustPromiseBanner'
import RisquesGeoBlock from '@/components/seo/RisquesGeoBlock'
import PrimesCEEBlock from '@/components/seo/PrimesCEEBlock'
import BarometrePrixBlock from '@/components/seo/BarometrePrixBlock'
import ContexteDPEBlock from '@/components/seo/ContexteDPEBlock'
import CalendrierSaisonnierBlock from '@/components/seo/CalendrierSaisonnierBlock'
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
  generateDetailedPricingSchema,
  generateSpeakableSchema,
  generateAggregateRatingSchema,
  parseCommonTasksToPricingTasks,
} from '@/lib/seo/schema-enrichment'
import { getReviewStatsByDept, getTopReviewsByDept } from '@/lib/supabase'
import { getDynamicLastModified } from '@/lib/seo/dynamic-lastmod'
import { getRegionPreposition } from '@/lib/geo-strings'
import dynamic from 'next/dynamic'

const StickyMobileCTA = dynamic(() => import('@/components/conversion/StickyMobileCTA'), {
  ssr: false,
})
const ExitIntentPopup = dynamic(() => import('@/components/conversion/ExitIntentModal'), {
  ssr: false,
})
const TarifsDevisCTA = dynamic(() => import('@/components/conversion/TarifsDevisCTA'), {
  ssr: false,
})

// ---------------------------------------------------------------------------
// Static params: top 5 cities x 46 services = 230 pages
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
export const revalidate = 86400

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRegionalMultiplier(region: string): number {
  const multipliers: Record<string, number> = {
    'Ile-de-France': 1.25,
    'Île-de-France': 1.25,
    "Provence-Alpes-Côte d'Azur": 1.1,
    'Auvergne-Rhône-Alpes': 1.1,
    Occitanie: 1.05,
    'Nouvelle-Aquitaine': 1.0,
    'Hauts-de-France': 0.95,
    'Grand Est': 0.95,
    Bretagne: 1.0,
    'Pays de la Loire': 1.0,
    Normandie: 0.95,
    'Centre-Val de Loire': 0.95,
    'Bourgogne-Franche-Comté': 0.95,
    Corse: 1.1,
  }
  return multipliers[region] ?? 1.0
}

function formatNumber(n: number): string {
  return n.toLocaleString('fr-FR')
}

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

function getSeasonalTip(zone: string | null, serviceName: string): string {
  if (zone === 'mediterraneen') {
    return `À noter : le climat méditerranéen favorise les travaux extérieurs quasiment toute l'année. La demande de ${serviceName.toLowerCase()} peut être plus forte en été avec l'afflux de résidents saisonniers.`
  }
  if (zone === 'montagnard') {
    return `En zone de montagne, les conditions hivernales peuvent limiter certains travaux extérieurs et augmenter les délais d'intervention. Prévoyez vos travaux de ${serviceName.toLowerCase()} en amont.`
  }
  if (zone === 'continental') {
    return `Avec un climat continental, les écarts de température sont importants. Les travaux de ${serviceName.toLowerCase()} liés au chauffage et à l'isolation sont particulièrement pertinents.`
  }
  if (zone === 'oceanique' || zone === 'semi-oceanique') {
    return `Le climat océanique implique une humidité fréquente. Les interventions de ${serviceName.toLowerCase()} liées à l'étanchéité et à la ventilation sont courantes.`
  }
  return `Les conditions climatiques locales peuvent influencer le type et la fréquence des interventions de ${serviceName.toLowerCase()}.`
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

/** Truncate title to maxLen chars on a word boundary */
function truncateTitle(title: string, maxLen = 58): string {
  if (title.length <= maxLen) return title
  return title.slice(0, maxLen - 1).replace(/\s+\S*$/, '') + '\u2026'
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string; ville: string }>
}): Promise<Metadata> {
  const { service, ville: villeSlug } = await params
  const trade = tradeContent[service]
  const villeData = getVilleBySlug(villeSlug)
  if (!trade || !villeData) notFound()

  const tradeLower = trade.name.toLowerCase()
  const multiplier = getRegionalMultiplier(villeData.region)
  const minPrice = Math.round(trade.priceRange.min * multiplier)
  const maxPrice = Math.round(trade.priceRange.max * multiplier)
  const unit = trade.priceRange.unit
  const dept = villeData.departement

  const titleHash = Math.abs(hashCode(`tarif-title-${service}-${villeSlug}`))
  const titleTemplates = [
    `Prix ${trade.name} ${villeData.name} 2026 : ${minPrice}–${maxPrice}€`,
    `Tarifs ${trade.name} ${villeData.name} : ${minPrice} à ${maxPrice}€`,
    `Coût ${trade.name} à ${villeData.name} (2026) : dès ${minPrice}€`,
    `${trade.name} ${villeData.name} : Tarifs ${minPrice}–${maxPrice}€`,
    `Prix ${trade.name} à ${villeData.name} | ${minPrice}–${maxPrice}€`,
  ]
  const title = truncateTitle(titleTemplates[titleHash % titleTemplates.length])

  const descHash = Math.abs(hashCode(`tarif-desc-${service}-${villeSlug}`))
  const descTemplates = [
    `Prix ${tradeLower} à ${villeData.name} en 2026 : ${minPrice} à ${maxPrice} ${unit}. Tarifs locaux ajustés ${villeData.region} + devis gratuit en 2 min.`,
    `Tarifs ${tradeLower} à ${villeData.name} (${dept}) : ${minPrice}–${maxPrice} ${unit}. Comparez les prix locaux et obtenez un devis gratuit.`,
    `Combien coûte un ${tradeLower} à ${villeData.name} ? De ${minPrice} à ${maxPrice} ${unit} en 2026. Guide tarifaire local + devis sans engagement.`,
    `${trade.name} à ${villeData.name} : ${minPrice}–${maxPrice} ${unit} en 2026. Prix par prestation, barème local et devis gratuit.`,
    `Prix ${tradeLower} ${villeData.name} 2026 : ${minPrice} à ${maxPrice} ${unit}. Tarifs ajustés ${villeData.region}. Devis gratuit en ligne.`,
  ]
  const description = descTemplates[descHash % descTemplates.length]

  const canonicalUrl = `${SITE_URL}/tarifs/${service}/${villeSlug}`

  // Gate indexation on provider availability (HCU anti-thin).
  // Fail-open: hasProvidersByServiceAndLocation returns true during build and
  // on error, so pages stay indexed unless ISR confirms 0 providers.
  const hasProviders = await hasProvidersByServiceAndLocation(service, villeSlug)
  // hasUniqueData: trade content (pricing, FAQ) and villeData (commune context) are real unique data
  const noindex = shouldNoindex(`/tarifs/${service}/${villeSlug}`, {
    providerCount: hasProviders ? 1 : 0,
    hasUniqueData: !!(trade && villeData),
  })

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    robots: { index: !noindex, follow: true },
    openGraph: {
      locale: 'fr_FR',
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      images: [
        { url: getServiceImageForContext(service, villeSlug).src, width: 1200, height: 630 },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [getServiceImageForContext(service, villeSlug).src],
    },
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function TarifsServiceVillePage({
  params,
}: {
  params: Promise<{ service: string; ville: string }>
}) {
  const { service, ville: villeSlug } = await params

  const trade = tradeContent[service]
  const villeData = getVilleBySlug(villeSlug)
  if (!trade || !villeData) notFound()

  // Fetch commune data + providers + comptage RGE local en parallèle.
  // Le comptage RGE n'est fetché que pour les métiers éligibles (allowlist énergie/bâti).
  const rgeEligible = isRgeAllowedService(service)
  const [commune, directProviders, rgeCount] = await Promise.all([
    getCommuneBySlug(villeSlug),
    getProvidersByServiceAndLocation(service, villeSlug, { limit: 6 }).catch(() => []),
    rgeEligible
      ? getRgeProviderCountByServiceAndLocation(service, villeSlug).catch(() => 0)
      : Promise.resolve(0),
  ])

  // Enrichment data (social proof, freshness, AEO) — fail-open
  const [reviewStats, topReviews, dynamicLastMod] = await Promise.all([
    getReviewStatsByDept(service, villeData.departement).catch(() => null),
    getTopReviewsByDept(service, villeData.departement).catch(() => []),
    getDynamicLastModified(service, villeData.departementCode).catch(() => null),
  ])

  // Fallback: if 0 providers in this city, try the whole département
  let providers = directProviders
  let isFallback = false
  if (providers.length === 0) {
    providers = await getProvidersByServiceAndDepartment(service, villeData.departement, {
      limit: 6,
    })
    isFallback = providers.length > 0
  }

  const multiplier = getRegionalMultiplier(villeData.region)
  const minPrice = Math.round(trade.priceRange.min * multiplier)
  const maxPrice = Math.round(trade.priceRange.max * multiplier)

  const tradeLower = trade.name.toLowerCase()

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Tarifs artisans', url: '/tarifs' },
    { name: `Tarifs ${tradeLower}`, url: `/tarifs/${service}` },
    { name: villeData.name, url: `/tarifs/${service}/${villeSlug}` },
  ])

  const faqSchema = getFAQSchema(
    trade.faq.slice(0, 5).map((f) => ({
      question: f.q.replace(/\?$/, '') + ` à ${villeData.name} ?`,
      answer: f.a,
    }))
  )

  const author = getDefaultAuthor()

  const dbOfferCount = commune?.nb_entreprises_artisanales
  const offerCount = dbOfferCount || 3 + (Math.abs(hashCode(`offers-${service}`)) % 20)

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${trade.name} à ${villeData.name}`,
    description: `Service de ${tradeLower} à ${villeData.name} (${villeData.departement}). Tarifs 2026 : ${minPrice} à ${maxPrice} ${trade.priceRange.unit}.`,
    url: `${SITE_URL}/tarifs/${service}/${villeSlug}`,
    serviceType: trade.name,
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
    },
    areaServed: {
      '@type': 'City',
      name: villeData.name,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: villeData.region,
      },
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'EUR',
      lowPrice: minPrice,
      highPrice: maxPrice,
      offerCount,
    },
  }

  const pricingItemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Tarifs ${trade.name} à ${villeData.name}`,
    description: `Liste des prestations et prix indicatifs pour ${trade.name} à ${villeData.name}`,
    numberOfItems: trade.commonTasks.length,
    itemListElement: trade.commonTasks.map((task, i) => {
      const parts = task.split(':')
      const name = parts[0].trim()
      return {
        '@type': 'ListItem',
        position: i + 1,
        name,
        url: `${SITE_URL}/tarifs/${service}/${villeSlug}`,
      }
    }),
  }

  const speakableSchema = getSpeakableSchema({
    url: `${SITE_URL}/tarifs/${service}/${villeSlug}`,
    title: `Tarifs ${tradeLower} à ${villeData.name}`,
  })

  // Enriched schemas -------------------------------------------------------
  const pricingTasks = parseCommonTasksToPricingTasks(trade.commonTasks, trade.priceRange.unit)
  const detailedPricingSchema = generateDetailedPricingSchema({
    serviceName: trade.name,
    locationName: villeData.name,
    url: `${SITE_URL}/tarifs/${service}/${villeSlug}`,
    tasks: pricingTasks,
    pricingMultiplier: multiplier,
  })

  const enrichedFAQSchema = generateFAQSchema(
    trade.faq.slice(0, 5).map((f) => ({
      question: f.q.replace(/\?$/, '') + ` à ${villeData.name} ?`,
      answer: f.a,
    }))
  )

  const enrichedSpeakableSchema = generateSpeakableSchema({
    url: `${SITE_URL}/tarifs/${service}/${villeSlug}`,
    title: `Tarifs ${tradeLower} à ${villeData.name}`,
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

  const relatedCities = getNearbyCities(villeSlug, 6)

  const relatedSlugs = relatedServices[service] || []
  const otherTrades =
    relatedSlugs.length > 0
      ? relatedSlugs.slice(0, 6).filter((s) => tradeContent[s])
      : tradeSlugs.filter((s) => s !== service).slice(0, 6)

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd
        data={[
          breadcrumbSchema,
          faqSchema,
          serviceSchema,
          pricingItemListSchema,
          speakableSchema,
          ...(detailedPricingSchema ? [detailedPricingSchema] : []),
          ...(enrichedFAQSchema ? [enrichedFAQSchema] : []),
          enrichedSpeakableSchema,
          ...(aggregateRatingSchema ? [aggregateRatingSchema] : []),
        ]}
      />

      {/* Hero */}
      <section className="relative bg-gradient-hero text-white overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,107,75,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(61,139,104,0.08) 0%, transparent 50%)',
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
              { label: 'Tarifs artisans', href: '/tarifs' },
              { label: `Tarifs ${tradeLower}`, href: `/tarifs/${service}` },
              { label: villeData.name },
            ]}
            className="mb-6 text-sand-400 [&_a]:text-sand-400 [[&_a:hover]:text-white_a:hover]:text-white [&_svg]:text-sand-600"
          />
          <div className="text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-extrabold mb-6 tracking-[-0.025em] speakable-summary">
              {(() => {
                const h1Hash = Math.abs(hashCode(`tarif-h1-${service}-${villeSlug}`))
                const h1Templates = [
                  `Tarifs ${tradeLower} à ${villeData.name} en 2026`,
                  `Prix ${tradeLower} à ${villeData.name} : guide des tarifs 2026`,
                  `Combien coûte un ${tradeLower} à ${villeData.name} ?`,
                  `${trade.name} à ${villeData.name} : tarifs et prix 2026`,
                  `Guide des tarifs ${tradeLower} à ${villeData.name}`,
                ]
                return h1Templates[h1Hash % h1Templates.length]
              })()}
            </h1>
            <p className="text-xl text-sand-400 max-w-3xl mx-auto mb-4">
              Prix {tradeLower} {'à'} {villeData.name} ({villeData.departement}) : {minPrice} {'à'}{' '}
              {maxPrice} {trade.priceRange.unit}. Tarifs adapt{'é'}s au march{'é'} local.
            </p>
            <LastUpdated
              label="Tarifs vérifiés et mis à jour le"
              className="justify-center text-sand-500 mb-4"
            />
            <p className="text-sm text-sand-500">
              Tarifs vérifiés par{' '}
              <Link href="/a-propos" className="underline hover:text-white transition-colors">
                {author.name}
              </Link>
              , {author.role.toLowerCase()}
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-sm">
                <Euro className="w-4 h-4 text-secondary-400" />
                <span>
                  {minPrice} {'–'} {maxPrice} {trade.priceRange.unit}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-sm">
                <MapPin className="w-4 h-4 text-secondary-400" />
                <span>
                  {villeData.name} ({villeData.departementCode})
                </span>
              </div>
              {commune?.nb_entreprises_artisanales && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-sm">
                  <Users className="w-4 h-4 text-secondary-400" />
                  <span>{formatNumber(commune.nb_entreprises_artisanales)} artisans locaux</span>
                </div>
              )}
            </div>
            <div className="mt-8">
              <Link
                href={`/devis/${service}/${villeSlug}`}
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
        currentIntent="tarifs"
        serviceName={trade.name}
        villeName={villeData.name}
        providerCount={providers.length}
      />

      {/* Immediate Answer Block — Position 0 / Featured Snippet target */}
      <div className="-mt-16 relative z-10 pb-6">
        <ImmediateAnswerBlock
          serviceName={trade.name}
          villeName={villeData.name}
          trade={trade}
          minPrice={minPrice}
          maxPrice={maxPrice}
          providerCount={commune?.provider_count ?? 0}
          variant="tarifs"
        />
      </div>

      {/* Snippet-bait: reponse directe textuelle pour Featured Snippet Google */}
      <section className="py-6 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="snippet-answer" data-speakable="true">
            <p className="text-base text-charcoal-700 leading-relaxed">
              Le{' '}
              <strong>
                prix {tradeLower} {'à'} {villeData.name}
              </strong>{' '}
              est de{' '}
              <strong>
                {minPrice} {'à'} {maxPrice} {trade.priceRange.unit}
              </strong>{' '}
              en 2026.
              {multiplier !== 1.0 && (
                <>
                  {' '}
                  Les tarifs en {villeData.region} sont{' '}
                  {multiplier > 1.0
                    ? `${Math.round((multiplier - 1) * 100)} % supérieurs`
                    : `${Math.round((1 - multiplier) * 100)} % inférieurs`}{' '}
                  {'à'} la moyenne nationale.
                </>
              )}{' '}
              Prestations courantes :{' '}
              {trade.commonTasks
                .slice(0, 3)
                .map((t) => t.split(':')[0].trim().toLowerCase())
                .join(', ')}
              .
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <TrustPromiseBanner variant="compact" />
      </div>

      <section className="py-6 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <GeoPageCTA
            title="Besoin d'un devis pour votre projet ?"
            subtitle={`Comparez les tarifs de ${tradeLower}s vérifiés à ${villeData.name}`}
            service={service}
            ville={villeData.name}
          />
        </div>
      </section>

      {/* RGE local — reassurance strip. Visible uniquement si le métier est
          éligible RGE et qu'au moins 1 artisan certifié existe dans la ville.
          Rappel : RGE est obligatoire pour MaPrimeRénov', CEE, TVA 5,5 %. */}
      {rgeEligible && rgeCount > 0 && (
        <section className="py-4 bg-emerald-50 border-y border-emerald-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <RgePseoCtaLink
              href={`/rge/${service}/${villeSlug}`}
              surface="tarifs"
              className="flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-emerald-900">
                    {rgeCount} {tradeLower}
                    {rgeCount > 1 ? 's' : ''} certifié{rgeCount > 1 ? 's' : ''} RGE à{' '}
                    {villeData.name}
                  </div>
                  <div className="text-xs text-emerald-700">
                    Requis pour MaPrimeRénov&apos;, CEE et TVA 5,5 %
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-emerald-700 group-hover:text-emerald-900 transition-colors flex-shrink-0">
                <span className="hidden sm:inline">Voir la liste</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </div>
            </RgePseoCtaLink>
          </div>
        </section>
      )}

      {/* Artisans disponibles — real providers for this service+city */}
      {isFallback ? (
        <FallbackProviders
          providers={providers}
          departmentName={villeData.departement}
          serviceName={trade.name}
          serviceSlug={service}
          villeSlug={villeSlug}
          villeName={villeData.name}
        />
      ) : (
        <LocalProviderShowcase
          providers={providers}
          serviceName={trade.name}
          cityName={villeData.name}
          max={3}
        />
      )}

      {/* Enrichment blocks — pSEO couche 3 */}
      <ProblemesCourantsBlock
        serviceSlug={service}
        serviceName={trade.name}
        villeName={villeData.name}
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
      />

      <CalendrierSaisonnierBlock
        serviceSlug={service}
        serviceName={trade.name}
        villeName={villeData.name}
        climatZone={commune?.climat_zone ?? null}
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

      {/* Price range overview */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-secondary-50 to-secondary-100 rounded-2xl p-8 text-center mb-12">
            <h2 className="text-lg font-semibold text-charcoal-700 mb-2">
              Tarif horaire moyen {'à'} {villeData.name}
            </h2>
            <div className="flex items-baseline justify-center gap-2">
              <span className="font-heading text-5xl font-bold text-primary-500">
                {minPrice} {'—'} {maxPrice}
              </span>
              <span className="text-charcoal-600 text-lg">{trade.priceRange.unit} TTC</span>
            </div>
            <p className="text-charcoal-500 text-sm mt-3">
              Prix moyen constat{'é'} {'à'} {villeData.name} et ses alentours, main-d&apos;œuvre
              incluse, TTC
            </p>
            {multiplier !== 1.0 && (
              <p className="text-xs text-charcoal-400 mt-2">
                {multiplier > 1.0
                  ? `Les tarifs ${getRegionPreposition(villeData.region)} sont en moyenne ${Math.round((multiplier - 1) * 100)} % supérieurs à la moyenne nationale`
                  : `Les tarifs ${getRegionPreposition(villeData.region)} sont en moyenne ${Math.round((1 - multiplier) * 100)} % inférieurs à la moyenne nationale`}
              </p>
            )}
          </div>

          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6">
            Prestations courantes et prix {'à'} {villeData.name}
          </h2>
          <PriceTableHTML
            tasks={trade.commonTasks}
            serviceName={trade.name}
            serviceSlug={service}
            location={villeData.name}
            locationSlug={villeSlug}
            multiplier={multiplier}
            unit={trade.priceRange.unit}
          />

          <StructuredPricingTable
            serviceSlug={service}
            serviceName={trade.name}
            villeName={villeData.name}
            villeSlug={villeSlug}
            tasks={trade.commonTasks}
            multiplier={multiplier}
            unit="€"
          />
          <div className="mt-8" />
        </div>
      </section>

      {/* Local insights — ville-specific differentiation */}
      <LocalInsightsBlock
        communeData={commune}
        serviceSlug={service}
        serviceName={trade.name}
        villeName={villeData.name}
        villeSlug={villeSlug}
        providerCount={commune?.provider_count}
        regionalMultiplier={multiplier}
      />

      {/* Local factors */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-2 text-center">
            Facteurs qui influencent les prix {'à'} {villeData.name}
          </h2>
          <p className="text-charcoal-500 text-sm text-center mb-8">
            Plusieurs facteurs locaux expliquent les variations tarifaires {'à'} {villeData.name}.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <LocalFactorCard
              icon={<Euro className="w-5 h-5 text-primary-500" />}
              title="Pouvoir d'achat local"
              value={commune?.revenu_median ? `${formatNumber(commune.revenu_median)} €/an` : null}
              description={
                commune?.revenu_median
                  ? `Le revenu médian à ${villeData.name} est de ${formatNumber(commune.revenu_median)} € par an, ce qui influence le positionnement tarifaire des artisans locaux.`
                  : `Le pouvoir d'achat local à ${villeData.name} influence le niveau des tarifs pratiqués par les artisans.`
              }
            />
            <LocalFactorCard
              icon={<Users className="w-5 h-5 text-secondary-600" />}
              title="Concurrence locale"
              value={
                commune?.nb_entreprises_artisanales
                  ? `${formatNumber(commune.nb_entreprises_artisanales)} entreprises`
                  : null
              }
              description={
                commune?.nb_entreprises_artisanales
                  ? commune.nb_entreprises_artisanales > 500
                    ? `Avec ${formatNumber(commune.nb_entreprises_artisanales)} entreprises artisanales, ${villeData.name} bénéficie d'une forte concurrence, ce qui peut maintenir les prix compétitifs.`
                    : `${villeData.name} compte ${formatNumber(commune.nb_entreprises_artisanales)} entreprises artisanales. Une concurrence modérée peut impliquer des tarifs légèrement plus élevés.`
                  : `Le nombre d'artisans disponibles à ${villeData.name} influence directement les tarifs pratiqués.`
              }
            />
            <LocalFactorCard
              icon={<Thermometer className="w-5 h-5 text-accent-600" />}
              title="Conditions climatiques"
              value={getClimatLabel(commune?.climat_zone ?? null)}
              description={getSeasonalTip(commune?.climat_zone ?? null, trade.name)}
            />
            <LocalFactorCard
              icon={<Building2 className="w-5 h-5 text-purple-600" />}
              title="Type de logement"
              value={commune?.part_maisons_pct ? `${commune.part_maisons_pct} % de maisons` : null}
              description={
                commune?.part_maisons_pct
                  ? commune.part_maisons_pct > 50
                    ? `À ${villeData.name}, ${commune.part_maisons_pct} % des logements sont des maisons individuelles. Les interventions sur maisons (toiture, façade, jardin) sont fréquentes.`
                    : `À ${villeData.name}, les appartements sont majoritaires (${100 - commune.part_maisons_pct} %). Les travaux en copropriété peuvent impliquer des contraintes spécifiques.`
                  : `La répartition entre maisons et appartements à ${villeData.name} influence les types de travaux demandés.`
              }
            />
          </div>

          {commune && (commune.nb_artisans_rge || commune.prix_m2_moyen) && (
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {commune.prix_m2_moyen && (
                <div className="bg-white rounded-xl border border-sand-300 p-4 text-center">
                  <div className="font-heading text-2xl font-bold text-charcoal-900">
                    {formatNumber(commune.prix_m2_moyen)} {'€'}/m{'²'}
                  </div>
                  <div className="text-sm text-charcoal-500 mt-1">Prix immobilier moyen</div>
                </div>
              )}
              {commune.nb_artisans_rge != null && commune.nb_artisans_rge > 0 && (
                <div className="bg-white rounded-xl border border-sand-300 p-4 text-center">
                  <div className="font-heading text-2xl font-bold text-charcoal-900">
                    {formatNumber(commune.nb_artisans_rge)}
                  </div>
                  <div className="text-sm text-charcoal-500 mt-1">Artisans RGE certifi{'é'}s</div>
                </div>
              )}
              {commune.population && (
                <div className="bg-white rounded-xl border border-sand-300 p-4 text-center">
                  <div className="font-heading text-2xl font-bold text-charcoal-900">
                    {formatNumber(commune.population)}
                  </div>
                  <div className="text-sm text-charcoal-500 mt-1">Habitants</div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Local Data Insights — unique content per commune */}
      <LocalDataInsights
        communeData={commune}
        serviceSlug={service}
        serviceName={trade.name}
        villeName={villeData.name}
      />

      {/* Speakable Answer Box */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <SpeakableAnswerBox
          answer={`${trade.name} à ${villeData.name} : ${minPrice}–${maxPrice} ${trade.priceRange.unit} (prix ajusté région ${villeData.region}). Prestations courantes : ${trade.commonTasks
            .slice(0, 3)
            .map((t) => t.split(':')[0].trim())
            .join(
              ', '
            )}. ${commune?.nb_entreprises_artisanales ? `${commune.nb_entreprises_artisanales} entreprises artisanales dans la commune.` : ''}`}
        />
      </div>

      {/* Questions fréquentes — PAA optimisé */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <h2 className="text-xl font-heading font-semibold text-charcoal-900">
            Combien co{'û'}te un {tradeLower} {'à'} {villeData.name} ?
          </h2>
          <p className="text-charcoal-700 leading-relaxed">
            Le tarif horaire d'un {tradeLower} {'à'} {villeData.name} se situe entre {minPrice} et{' '}
            {maxPrice} {trade.priceRange.unit}. Ce prix varie selon la complexit{'é'} de
            l'intervention, l'accessibilit{'é'} du chantier et les mat{'é'}riaux n{'é'}cessaires.
            {multiplier >= 1.2
              ? ` Les tarifs ${getRegionPreposition(villeData.region)} sont généralement 20 à 25 % supérieurs à la moyenne nationale.`
              : ''}
          </p>

          <h2 className="text-xl font-heading font-semibold text-charcoal-900">
            Comment trouver un bon {tradeLower} {'à'} {villeData.name} ?
          </h2>
          <p className="text-charcoal-700 leading-relaxed">
            Pour trouver un {tradeLower} fiable {'à'} {villeData.name}, v{'é'}rifiez son num{'é'}ro
            SIRET, demandez une copie de son assurance d{'é'}cennale et comparez au moins 3 devis.
            Consultez les avis clients et privil{'é'}giez les artisans certifi{'é'}s
            {trade.certifications.length > 0 ? ` (${trade.certifications[0]})` : ''}.
          </p>

          <h2 className="text-xl font-heading font-semibold text-charcoal-900">
            Quel est le d{'é'}lai d'intervention d'un {tradeLower} {'à'} {villeData.name} ?
          </h2>
          <p className="text-charcoal-700 leading-relaxed">
            En moyenne, un {tradeLower} {'à'} {villeData.name} peut intervenir sous{' '}
            {trade.averageResponseTime.split(',')[0].toLowerCase()}. En cas d'urgence, certains
            professionnels proposent des interventions sous 1 {'à'} 2 heures, avec une majoration
            tarifaire de 50 {'à'} 100 %.
          </p>
        </div>
      </section>

      {/* Conseils */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6 text-center">
            Conseils pour choisir un {tradeLower} {'à'} {villeData.name}
          </h2>
          <div className="space-y-4">
            {trade.tips.slice(0, 4).map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-sand-50 rounded-xl border border-sand-300 p-5"
              >
                <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-secondary-600" />
                </div>
                <p className="text-charcoal-700 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — localisée par ville */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-8 text-center">
            Questions fr{'é'}quentes {'—'} {trade.name} {'à'} {villeData.name}
          </h2>
          <div className="space-y-4 speakable-faq">
            {trade.faq.slice(0, 5).map((item, i) => {
              const localQ = item.q.replace(/\?$/, '') + ` à ${villeData.name} ?`
              return (
                <details key={i} className="bg-white rounded-xl border border-sand-300 group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <h3 className="text-base font-semibold text-charcoal-900 pr-4">{localQ}</h3>
                    <ChevronDown className="w-5 h-5 text-charcoal-400 flex-shrink-0 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-6 pb-6 text-charcoal-600 text-sm leading-relaxed">
                    {item.a}
                  </div>
                </details>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl font-bold text-white mb-4">
            Obtenez un devis exact de {tradeLower} {'à'} {villeData.name}
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Ces tarifs sont indicatifs. Obtenez un devis personnalis{'é'} d'artisans v{'é'}rifi{'é'}
            s pr{'è'}s de chez vous {'—'} gratuit et sans engagement.
          </p>
          <TarifsDevisCTA
            service={service}
            serviceName={tradeLower}
            ville={villeSlug}
            villeName={villeData.name}
            variant="banner"
          />
          <p className="text-primary-200 text-sm mt-6">
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

      {/* Related cities */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6">
            Tarifs {tradeLower} dans d'autres villes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl">
            {relatedCities.map((v) => (
              <Link
                key={v.slug}
                href={`/tarifs/${service}/${v.slug}`}
                className="bg-sand-50 hover:bg-primary-50 border border-sand-300 hover:border-primary-300 rounded-xl p-4 transition-all group text-center"
              >
                <div className="font-semibold text-charcoal-900 group-hover:text-primary-500 transition-colors text-sm">
                  {trade.name} {'à'} {v.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Other trades */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6">
            Autres tarifs artisans {'à'} {villeData.name}
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {otherTrades.map((slug) => {
              const t = tradeContent[slug]
              const m = getRegionalMultiplier(villeData.region)
              return (
                <Link
                  key={slug}
                  href={`/tarifs/${slug}/${villeSlug}`}
                  className="bg-white hover:bg-primary-50 border border-sand-300 hover:border-primary-300 rounded-xl p-4 transition-all group"
                >
                  <div className="font-semibold text-charcoal-900 group-hover:text-primary-500 transition-colors text-sm">
                    {t.name} {'à'} {villeData.name}
                  </div>
                  <div className="text-xs text-charcoal-500 mt-1">
                    {Math.round(t.priceRange.min * m)} {'—'} {Math.round(t.priceRange.max * m)}{' '}
                    {t.priceRange.unit}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Services complémentaires */}
      {(() => {
        const complementarySlugs = relatedServices[service] || []
        const complementary = complementarySlugs
          .filter((s) => s !== service && tradeContent[s])
          .slice(0, 4)
        if (complementary.length === 0) return null
        return (
          <section className="py-12 bg-white border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-2">
                Services compl{'é'}mentaires {'à'} {villeData.name}
              </h2>
              <p className="text-sm text-charcoal-500 mb-4">
                Ces services sont souvent demand{'é'}s avec {tradeLower}.
              </p>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {complementary.map((slug) => {
                  const t = tradeContent[slug]
                  if (!t) return null
                  const m = getRegionalMultiplier(villeData.region)
                  return (
                    <div
                      key={slug}
                      className="bg-sand-50 rounded-xl border border-sand-300 p-4 space-y-2.5"
                    >
                      <div className="font-semibold text-charcoal-900 text-sm">{t.name}</div>
                      <div className="text-xs text-charcoal-500">
                        {Math.round(t.priceRange.min * m)} {'–'} {Math.round(t.priceRange.max * m)}{' '}
                        {t.priceRange.unit}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <Link
                          href={`/services/${slug}/${villeSlug}`}
                          className="inline-flex items-center px-2.5 py-1 bg-white hover:bg-primary-50 text-charcoal-600 hover:text-primary-600 rounded-lg text-xs font-medium border border-sand-300 hover:border-primary-200 transition-all"
                        >
                          Artisans
                        </Link>
                        <Link
                          href={`/devis/${slug}/${villeSlug}`}
                          className="inline-flex items-center px-2.5 py-1 bg-white hover:bg-secondary-50 text-charcoal-600 hover:text-secondary-700 rounded-lg text-xs font-medium border border-sand-300 hover:border-secondary-200 transition-all"
                        >
                          Devis
                        </Link>
                        <Link
                          href={`/tarifs/${slug}/${villeSlug}`}
                          className="inline-flex items-center px-2.5 py-1 bg-white hover:bg-accent-50 text-charcoal-600 hover:text-accent-700 rounded-lg text-xs font-medium border border-sand-300 hover:border-accent-200 transition-all"
                        >
                          Tarifs
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )
      })()}

      {/* Problèmes courants */}
      {(() => {
        const problems = getProblemsByService(service).slice(0, 4)
        if (problems.length === 0) return null
        return (
          <section className="py-12 bg-white border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-4">
                Probl{'è'}mes courants
              </h2>
              <div className="flex flex-wrap gap-3">
                {problems.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/problemes/${p.slug}/${villeSlug}`}
                    className="px-4 py-2.5 bg-sand-50 hover:bg-orange-50 text-charcoal-700 hover:text-orange-800 rounded-lg text-sm font-medium border border-sand-300 hover:border-orange-200 transition-all"
                  >
                    {p.name} {'à'} {villeData.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )
      })()}

      {/* Voir aussi — navigation interne consolidée */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-6">Voir aussi</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-3">Ce service</h3>
              <div className="space-y-2">
                <Link
                  href={`/tarifs/${service}`}
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  Tarifs {tradeLower} en France
                </Link>
                <Link
                  href={`/services/${service}/${villeSlug}`}
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  {trade.name} {'à'} {villeData.name}
                </Link>
                <Link
                  href={`/services/${service}`}
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  {trade.name} {'—'} tous les artisans
                </Link>
                <Link
                  href={`/devis/${service}/${villeSlug}`}
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  Devis {tradeLower} {'à'} {villeData.name}
                </Link>
                <Link
                  href={`/avis/${service}/${villeSlug}`}
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  Avis {tradeLower} {'à'} {villeData.name}
                </Link>
                <Link
                  href={`/urgence/${service}/${villeSlug}`}
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  {trade.name} urgence {'à'} {villeData.name}
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-3">Cette ville</h3>
              <div className="space-y-2">
                <Link
                  href={`/villes/${villeSlug}`}
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  Artisans {'à'} {villeData.name}
                </Link>
                {otherTrades.slice(0, 5).map((slug) => {
                  const t = tradeContent[slug]
                  if (!t) return null
                  return (
                    <Link
                      key={slug}
                      href={`/tarifs/${slug}/${villeSlug}`}
                      className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                    >
                      Tarifs {t.name.toLowerCase()} {'à'} {villeData.name}
                    </Link>
                  )
                })}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-3">Informations utiles</h3>
              <div className="space-y-2">
                <Link
                  href="/tarifs"
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  Guide complet des tarifs
                </Link>
                <Link
                  href="/comment-ca-marche"
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  Comment {'ç'}a marche
                </Link>
                <Link
                  href="/devis"
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  Demander un devis
                </Link>
                <Link
                  href="/faq"
                  className="block text-sm text-charcoal-600 hover:text-primary-500 py-1"
                >
                  FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial */}
      <section className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-sand-100 rounded-2xl border border-sand-300 p-6">
            <h3 className="text-sm font-semibold text-charcoal-700 mb-2">
              M{'é'}thodologie tarifaire
            </h3>
            <p className="text-xs text-sand-500 leading-relaxed">
              Les prix affich{'é'}s pour {villeData.name} sont des fourchettes indicatives ajust
              {'é'}es en fonction des donn{'é'}es r{'é'}gionales ({villeData.region}). Ils varient
              selon la complexit{'é'} du chantier, les mat{'é'}riaux et l'urgence. Seul un devis
              personnalis{'é'} fait foi. {SITE_NAME} est un annuaire ind{'é'}pendant.
            </p>
          </div>
        </div>
      </section>

      <VerticalCrossLinks
        currentService={service}
        villeSlug={villeSlug}
        villeName={villeData.name}
        intent="tarifs"
      />

      <InContentLinks
        serviceSlug={service}
        serviceName={trade.name}
        villeSlug={villeSlug}
        villeName={villeData.name}
        currentIntent="tarifs"
        departement={villeData.departement}
        departementCode={villeData.departementCode}
        region={villeData.region}
      />

      <CrossIntentLinks
        service={service}
        serviceName={trade.name}
        ville={villeSlug}
        villeName={villeData.name}
        currentIntent="tarifs"
      />

      <DeepPageLinks
        currentService={service}
        currentVille={villeSlug}
        currentIntent="tarifs"
        skipCrossIntent
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
        currentIntent="tarifs"
      />

      {/* ─── ENRICHMENT: Social proof, freshness, UGC, AEO ─────── */}

      <AEOAnswerBlock
        serviceSlug={service}
        serviceName={trade.name}
        villeName={villeData.name}
        departmentName={villeData.departement}
        providerCount={providers.length}
        avgRating={reviewStats?.avg_rating ?? null}
        priceRange={{ min: minPrice, max: maxPrice }}
        communePopulation={commune?.population ?? null}
      />

      <ReviewsDeptBlock
        serviceSlug={service}
        serviceName={trade.name}
        departmentName={villeData.departement}
        stats={reviewStats}
        reviews={topReviews}
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
        providerCount={providers.length}
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
        ctaText="Comparer les prix gratuitement"
      />

      <ExitIntentPopup />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-component
// ---------------------------------------------------------------------------

function LocalFactorCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode
  title: string
  value: string | null
  description: string
}) {
  return (
    <div className="bg-white rounded-xl border border-sand-300 p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-sand-200 rounded-lg flex items-center justify-center flex-shrink-0">
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
