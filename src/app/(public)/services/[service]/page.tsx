import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Star, Shield, ChevronDown, BadgeCheck, Clock } from 'lucide-react'
import { getServiceBySlug, getProvidersByService, getProviderCountByService } from '@/lib/supabase'
import { getValidCitySlugsForService } from '@/lib/seo/valid-combos'
import JsonLd from '@/components/JsonLd'
import { PageHeroH1 } from '@/components/ui/PageHeroH1'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import { ArticleMeta } from '@/components/ArticleMeta'
import { isSeoUpgradeV2, currentMonthYearFr, monthlyAnchorIso } from '@/lib/seo/sprint-helpers'
import { selectFittingTitle } from '@/lib/seo/title-selector'
import { tradeContent } from '@/lib/data/trade-content'
import { countLabelForSummary, buildEnBrefPoints, buildServiceTldrBullets } from './sprint-helpers'
import {
  getBreadcrumbSchema,
  getFAQSchema,
  getSpeakableSchema,
  getServicePricingSchema,
  getDeepSectionsTechArticleSchema,
  getDeepSectionsFAQPageSchema,
  getDeepSectionsHowToSchemas,
  buildHubRgeGlossarySchema,
  getReviewedByPersonSchema,
} from '@/lib/seo/jsonld'
import { getAuthorForServiceSlug } from '@/lib/data/service-author'
import { getReviewerForAuthor } from '@/lib/data/authors'
import { getHowToOverlay } from '@/lib/seo/deep-sections-howto-overlays'
import { buildAggregateRatingFromProviders } from '@/lib/seo/aggregate-rating'
import { autoLinkRgeTerms } from '@/lib/seo/glossary-autolink'
import { hashCode } from '@/lib/seo/location-content'
import { SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { logger } from '@/lib/logger'
import Breadcrumb from '@/components/Breadcrumb'
import { popularServices, relatedServices } from '@/lib/constants/navigation'
import { services as staticServicesList, villes, parsePopulation } from '@/lib/data/france'
import { getServiceImage, BLUR_PLACEHOLDER } from '@/lib/data/images'
import { getPageContent, getTradeContentOverride } from '@/lib/cms'
import { CmsContent } from '@/components/CmsContent'
import LastUpdated from '@/components/seo/LastUpdated'
import { getDynamicLastModifiedByService } from '@/lib/seo/dynamic-lastmod'
import StickyMobileCTA from '@/components/conversion/StickyMobileCTA'
import RgeGuideBlock from '@/components/rge/RgeGuideBlock'
import RgeGlossaryBlock from '@/components/seo/RgeGlossaryBlock'
import { isRgeAllowedService } from '@/lib/rge/service-city-listings'
import { getDeepSections } from '@/lib/seo/trade-deep-sections'
import { getTradeContent } from '@/lib/data/trade-content'
import dynamic from 'next/dynamic'

const MicroConversions = dynamic(() => import('@/components/MicroConversions'), { ssr: false })

/** Shape returned by getLocationsByService / getStaticCities */
interface CityInfo {
  id: string
  name: string
  slug: string
  department_code?: string
  region_name?: string
}

/** Shape returned by getProvidersByService (provider with joined location) */
interface ServiceProvider {
  id: string
  name: string
  slug: string
  stable_id?: string
  address_city?: string
  address_postal_code?: string
  rating_average?: number | string | null
  review_count?: number | null
  provider_locations?: Array<{
    location?: { name: string; slug: string } | null
  }>
}

// ISR: Revalidate every 24h
export const revalidate = 86400
export const dynamicParams = false

// Pre-render all 15 service pages at build time
export function generateStaticParams() {
  return staticServicesList.map((s) => ({ service: s.slug }))
}

interface PageProps {
  params: Promise<{ service: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { service: serviceSlug } = await params
  const upgradeV2 = isSeoUpgradeV2()

  let serviceName = ''
  let providerCount = 0

  try {
    const [service, count] = await Promise.all([
      getServiceBySlug(serviceSlug),
      getProviderCountByService(serviceSlug),
    ])
    if (service) serviceName = service.name
    providerCount = count
  } catch {
    // DB down — fallback to static data
  }

  if (!serviceName) {
    const staticSvc = staticServicesList.find((s) => s.slug === serviceSlug)
    if (!staticSvc) notFound()
    serviceName = staticSvc.name
  }

  const svcLower = serviceName.toLowerCase()
  const countLabel = providerCount > 0 ? `${providerCount}+` : 'des centaines de'
  const tradeMeta = tradeContent[serviceSlug]

  const titleHash = Math.abs(hashCode(`hub-title-${serviceSlug}`))
  const titleTemplates = upgradeV2
    ? [
        tradeMeta && providerCount > 0
          ? `${providerCount}+ ${svcLower} RGE France · ${tradeMeta.priceRange.min}–${tradeMeta.priceRange.max} ${tradeMeta.priceRange.unit} · 2026`
          : `${countLabel} ${svcLower} RGE France 2026 · Devis 24h`,
        `${serviceName} RGE 2026 — ${countLabel} artisans certifiés, devis 24h`,
        `${serviceName} RGE France 2026 — Comparez, devis gratuit`,
        tradeMeta
          ? `${serviceName} RGE ${tradeMeta.priceRange.min}–${tradeMeta.priceRange.max} ${tradeMeta.priceRange.unit} · Devis gratuit 2026`
          : `${serviceName} RGE : Tarifs 2026 + Devis gratuit`,
        `${serviceName} 2026 — Artisans RGE certifiés en France`,
      ]
    : [
        `${serviceName} RGE France 2026 : Devis Gratuit`,
        `${serviceName} : Artisans RGE certifiés + Devis Gratuit`,
        `${serviceName} RGE France 2026 — Comparez + Devis`,
        `${serviceName} RGE : Tarifs 2026 + Devis Gratuit`,
        `${serviceName} 2026 — Artisans RGE certifiés en France`,
      ]
  const title = selectFittingTitle(titleTemplates, titleHash, 60)

  const descHash = Math.abs(hashCode(`hub-desc-${serviceSlug}`))
  const descTemplates = [
    `${serviceName} : ${countLabel} artisans RGE certifiés en France (Qualibat, Qualifelec, QualiPAC). Tarifs, avis clients et devis gratuit sans engagement.`,
    `Comparez ${countLabel} ${svcLower}s RGE certifiés en France : tarifs, avis vérifiés, certifications RGE actives. Devis gratuit, réponse rapide.`,
    `Annuaire 100% ${svcLower}s RGE certifiés en France. Prix, avis clients, certifications ADEME. Devis gratuit en ligne sans engagement.`,
    `${serviceName} : ${countLabel} artisans RGE certifiés, tarifs indicatifs, avis vérifiés. Devis gratuit en ligne.`,
    `${serviceName} France 2026 : comparez ${countLabel} artisans RGE certifiés. Prix, certifications RGE vérifiées, devis gratuit en ligne.`,
  ]
  const description = descTemplates[descHash % descTemplates.length]

  const serviceImage = getServiceImage(serviceSlug)

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
    openGraph: {
      ...getOgDefaults(),
      locale: 'fr_FR',
      title,
      description,
      url: `${SITE_URL}/services/${serviceSlug}`,
      type: 'website',
      images: [{ url: serviceImage.src, width: 1200, height: 630, alt: serviceImage.alt }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [serviceImage.src],
    },
    alternates: getAlternates(`/services/${serviceSlug}`),
  }
}

/** Convert static villes to Location-like shape for fallback display */
function getStaticCities() {
  return [...villes]
    .sort((a, b) => parsePopulation(b.population) - parsePopulation(a.population))
    .slice(0, 12)
    .map((v) => ({
      id: v.slug,
      name: v.name,
      slug: v.slug,
      department_code: v.departementCode,
      region_name: v.region,
    }))
}

export default async function ServicePage({ params }: PageProps) {
  const { service: serviceSlug } = await params

  // Full CMS page override
  const cmsPage = await getPageContent(serviceSlug, 'service', { serviceSlug })
  if (cmsPage?.content_html) {
    return (
      <div className="min-h-screen bg-sand-50">
        <section className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <PageHeroH1 size="page">{cmsPage.title}</PageHeroH1>
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

  let service: { name: string; slug: string; description?: string; category?: string } | null = null
  let recentProviders: ServiceProvider[] = []
  let totalProviderCount = 0
  try {
    service = await getServiceBySlug(serviceSlug)
  } catch (error) {
    logger.error('Service page DB error (service):', error)
  }

  // Fetch providers and count — cities are always static (faster, no DB dependency)
  const [providersResult, countResult] = await Promise.allSettled([
    getProvidersByService(serviceSlug, 12),
    getProviderCountByService(serviceSlug),
  ])
  if (providersResult.status === 'fulfilled') {
    recentProviders = (providersResult.value || []) as ServiceProvider[]
  } else {
    logger.error('Service page DB error (providers):', providersResult.reason)
  }
  if (countResult.status === 'fulfilled') {
    totalProviderCount = countResult.value
  }

  // Fallback to static data if DB failed
  if (!service) {
    const staticSvc = staticServicesList.find((s) => s.slug === serviceSlug)
    if (!staticSvc) notFound()
    service = { name: staticSvc.name, slug: staticSvc.slug }
  }

  // Real freshness signal (MAX provider.updated_at + latest review nationally).
  // Fail-open : absence > fausse date.
  const lastModified = await getDynamicLastModifiedByService(serviceSlug).catch((err: unknown) => {
    logger.error('service_hub.last_modified_error', err as Error, {
      route: 'services/[service]',
      service: serviceSlug,
    })
    return null
  })

  // Top 12 cities — single source of truth via mat-view `mv_provider_counts`
  // (mig 312 + 516, RGE-aware). Le helper retourne déjà les villes triées par
  // count RGE descendant et exclut les combos sans aucun artisan RGE actif.
  // Avant pivot full RGE, ce hub listait des villes statiques qui partaient en
  // notFound() côté /services/[s]/[v] (~50% des cas). Cf. lib/seo/valid-combos.ts.
  const validCitySlugs = new Set(await getValidCitySlugsForService(serviceSlug, { limit: 30 }))
  const topCities: CityInfo[] = getStaticCities()
    .filter((c) => validCitySlugs.has(c.slug))
    .slice(0, 12)

  // Trade-specific rich content (prices, FAQ, certifications)
  const tradeBase = getTradeContent(serviceSlug)
  const cmsTradeOverride = await getTradeContentOverride(serviceSlug)
  const trade =
    tradeBase && cmsTradeOverride
      ? ({ ...tradeBase, ...cmsTradeOverride } as typeof tradeBase)
      : tradeBase

  // H1 variation for SEO — keyword-first
  const h1Hash = Math.abs(hashCode(`hub-h1-${serviceSlug}`))
  const h1Templates = [
    `${service.name} RGE en France`,
    `${service.name} RGE en France : annuaire et devis`,
    `${service.name} RGE — Annuaire national`,
    `Artisans ${service.name.toLowerCase()} RGE en France`,
    `${service.name} RGE : comparez les artisans certifiés`,
  ]
  const h1Text = h1Templates[h1Hash % h1Templates.length]

  // ── JSON-LD structured data ────────────────────────────────────────────
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Services', url: '/services' },
    { name: service.name, url: `/services/${serviceSlug}` },
  ])

  const faqSchema = trade
    ? getFAQSchema(trade.faq.slice(0, 5).map((f) => ({ question: f.q, answer: f.a })))
    : null

  const speakableSchema = getSpeakableSchema({
    url: `${SITE_URL}/services/${serviceSlug}`,
    title: h1Text,
  })

  const pageAggregateRating = buildAggregateRatingFromProviders(recentProviders)

  const pricingSchema = trade
    ? getServicePricingSchema({
        serviceName: service.name,
        serviceSlug: serviceSlug,
        description: service.description || `Services de ${service.name.toLowerCase()} en France`,
        lowPrice: trade.priceRange.min,
        highPrice: trade.priceRange.max,
        priceCurrency: 'EUR',
        priceUnit: trade.priceRange.unit,
        offerCount: totalProviderCount || trade.commonTasks.length,
        url: `${SITE_URL}/services/${serviceSlug}`,
        ...(pageAggregateRating && {
          ratingValue: Number(pageAggregateRating.ratingValue),
          reviewCount: Number(pageAggregateRating.reviewCount),
        }),
      })
    : null

  const itemListSchema =
    topCities.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `${service.name} RGE en France — top villes`,
          description: `Top ${Math.min(topCities.length, 12)} villes françaises avec des ${service.name.toLowerCase()}s RGE certifiés.`,
          url: `${SITE_URL}/services/${serviceSlug}`,
          numberOfItems: Math.min(topCities.length, 12),
          itemListElement: topCities.slice(0, 12).map((city, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: `${service.name} à ${city.name}`,
            url: `${SITE_URL}/services/${serviceSlug}/${city.slug}`,
          })),
        }
      : null

  const upgradeV2 = isSeoUpgradeV2()
  const monthYear = currentMonthYearFr()
  const pageUrl = `${SITE_URL}/services/${serviceSlug}`
  const monthlyAnchor = monthlyAnchorIso()
  const dateModifiedIso = lastModified ?? monthlyAnchor
  const heroImage = getServiceImage(serviceSlug)
  const articleImage = heroImage.src.startsWith('http')
    ? heroImage.src
    : `${SITE_URL}${heroImage.src}`
  const HUB_AUTHOR = getAuthorForServiceSlug(serviceSlug)
  const HUB_REVIEWER = getReviewerForAuthor(HUB_AUTHOR)
  const articleSchema = upgradeV2
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: `${service.name} RGE en France — Guide ${monthYear}`,
        image: [articleImage],
        datePublished: '2026-01-01T00:00:00+02:00',
        dateModified: dateModifiedIso,
        author: {
          '@type': 'Person',
          name: HUB_AUTHOR.name,
          jobTitle: HUB_AUTHOR.role,
          url: `${SITE_URL}/equipe/${HUB_AUTHOR.slug}`,
          ...(HUB_AUTHOR.methodology &&
            HUB_AUTHOR.methodology.length > 0 && { skills: HUB_AUTHOR.methodology }),
        },
        ...(HUB_REVIEWER && { reviewedBy: getReviewedByPersonSchema(HUB_REVIEWER) }),
        publisher: {
          '@type': 'Organization',
          name: 'ServicesArtisans',
          logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
        },
        mainEntityOfPage: pageUrl,
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', '[data-speakable="true"]'],
        },
      }
    : null

  // Deep sections (PAC, isolation, photovoltaïque, borne-recharge…) — kept but
  // limited to the first 2 sections to slim the visible body, full schema kept.
  const deepSectionsForSchema = getDeepSections(serviceSlug)
  const deepSectionsTechArticleSchema = getDeepSectionsTechArticleSchema({
    pageUrl,
    topic: service.name,
    sections: deepSectionsForSchema,
    image: articleImage,
    datePublished: '2026-05-03T00:00:00+02:00',
    dateModified: dateModifiedIso,
    authorName: HUB_AUTHOR?.name || 'la rédaction ServicesArtisans',
    publisherName: 'ServicesArtisans',
  })
  const deepSectionsFAQSchema = getDeepSectionsFAQPageSchema({
    pageUrl,
    sections: deepSectionsForSchema,
  })
  const deepSectionsHowToSchemas = getDeepSectionsHowToSchemas({
    pageUrl,
    sections: deepSectionsForSchema,
    overlayLookup: getHowToOverlay,
  })
  const isRgeEligibleService = isRgeAllowedService(serviceSlug)
  const servicesRgeGlossarySchema = isRgeEligibleService
    ? buildHubRgeGlossarySchema({ pageUrl, hubLabel: service.name })
    : null

  const visibleDeepSections = deepSectionsForSchema.slice(0, 2)
  const relatedSlugs = (
    relatedServices[serviceSlug] ||
    popularServices.filter((s) => s.slug !== serviceSlug).map((s) => s.slug)
  ).slice(0, 6)

  return (
    <div className="min-h-screen bg-sand-50">
      {/* JSON-LD — schemas complets préservés (Article + FAQ + ItemList +
          TechArticle + HowTo + RGE glossary + pricing). */}
      <JsonLd
        data={[
          breadcrumbSchema,
          speakableSchema,
          ...(faqSchema ? [faqSchema] : []),
          ...(pricingSchema ? [pricingSchema] : []),
          ...(itemListSchema ? [itemListSchema] : []),
          ...(articleSchema ? [articleSchema] : []),
          ...(deepSectionsTechArticleSchema ? [deepSectionsTechArticleSchema] : []),
          ...(deepSectionsFAQSchema ? [deepSectionsFAQSchema] : []),
          ...deepSectionsHowToSchemas,
          ...(servicesRgeGlossarySchema ? [servicesRgeGlossarySchema] : []),
        ]}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb items={[{ label: 'Services', href: '/services' }, { label: service.name }]} />
        </div>
      </div>

      {/* Hero — gardé compact, avec photo et stats clés */}
      <section className="relative bg-gradient-hero overflow-hidden">
        <Image
          src={heroImage.src}
          alt={heroImage.alt}
          fill
          className="object-cover opacity-15"
          sizes="100vw"
          priority
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
        />
        <div className="absolute inset-0 bg-charcoal-900/75" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h1
            data-speakable="true"
            className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight"
          >
            {h1Text}
          </h1>
          <p className="text-lg md:text-xl text-sand-400 max-w-3xl leading-relaxed">
            {service.description ||
              `Comparez les ${service.name.toLowerCase()}s RGE certifiés près de chez vous : tarifs, avis vérifiés et devis gratuit en 24 h.`}
          </p>
          <LastUpdated
            label="Données artisans mises à jour le"
            date={lastModified}
            className="text-sand-500 mt-3"
          />

          <div className="flex flex-wrap gap-6 md:gap-10 mt-8">
            <div className="flex flex-col">
              <span className="font-heading text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-terra">
                {totalProviderCount > 0 ? totalProviderCount.toLocaleString('fr-FR') : '—'}
              </span>
              <span className="text-sm text-sand-400 mt-1">artisans RGE certifiés</span>
            </div>
            {trade && (
              <div className="flex flex-col">
                <span className="font-heading text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-premium">
                  {trade.priceRange.min}–{trade.priceRange.max}
                </span>
                <span className="text-sm text-sand-400 mt-1">{trade.priceRange.unit}</span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-heading text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-accent-500">
                100%
              </span>
              <span className="text-sm text-sand-400 mt-1">RGE certifiés</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <div className="flex items-center gap-2 bg-white/[0.08] backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full">
              <Shield className="w-4 h-4 text-accent-400" aria-hidden="true" />
              <span className="text-sm text-sand-200 font-medium">Vérifiés ADEME</span>
            </div>
            <div className="flex items-center gap-2 bg-white/[0.08] backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full">
              <Star className="w-4 h-4 text-secondary-400" aria-hidden="true" />
              <span className="text-sm text-sand-200 font-medium">Avis clients vérifiés</span>
            </div>
            {trade && (
              <div className="flex items-center gap-2 bg-white/[0.08] backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full">
                <Clock className="w-4 h-4 text-primary-300" aria-hidden="true" />
                <span className="text-sm text-sand-200 font-medium">
                  {trade.averageResponseTime.split(',')[0]}
                </span>
              </div>
            )}
          </div>

          <div className="mt-8">
            <Link
              href={`/devis/${serviceSlug}`}
              className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold px-8 py-4 rounded-xl shadow-cta hover:shadow-cta-hover transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-400 focus-visible:outline-none"
              aria-label={`Demander un devis ${service.name.toLowerCase()} gratuit`}
            >
              Obtenir mon devis gratuit
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Article byline E-E-A-T — visible si Article schema actif */}
      {upgradeV2 && articleSchema && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <ArticleMeta
            author={HUB_AUTHOR.name}
            authorHref={`/equipe/${HUB_AUTHOR.slug}`}
            datePublished={monthlyAnchor}
            dateModified={dateModifiedIso}
          />
        </div>
      )}

      {/* TL;DR : 4 réponses directes pour AI Overviews + Speakable */}
      {upgradeV2 && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <TldrBlock
            bullets={buildServiceTldrBullets({
              serviceName: service.name,
              trade,
              topCity: topCities[0]?.name ?? null,
              villesCount: villes.length,
            })}
          />
        </div>
      )}

      {/* En bref : Featured Snippets en haut de page */}
      {upgradeV2 && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <EnBrefBox
            summary={`${service.name} RGE en France 2026 : ${countLabelForSummary(totalProviderCount)} artisans RGE certifiés (Qualibat, Qualifelec, QualiPAC), devis gratuits sous 24h${trade ? `, fourchette de prix ${trade.priceRange.min}–${trade.priceRange.max} ${trade.priceRange.unit}` : ''}.`}
            keyPoints={buildEnBrefPoints({
              serviceName: service.name,
              providerCount: totalProviderCount,
              trade,
              villesCount: villes.length,
            })}
          />
        </div>
      )}

      {/* Top 12 villes — listing flat keyword-first (anchors "Service Ville") */}
      <section className="py-10 bg-white border-t border-sand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6 tracking-tight">
            {service.name} RGE par ville
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" role="list">
            {topCities.slice(0, 12).map((city) => (
              <li key={city.id}>
                <Link
                  href={`/services/${serviceSlug}/${city.slug}`}
                  className="flex items-center gap-2 px-4 py-3 bg-sand-50 hover:bg-primary-50 text-charcoal-700 hover:text-primary-600 rounded-xl border border-sand-200 hover:border-primary-200 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-400 focus-visible:outline-none"
                >
                  <span className="font-medium">
                    {service.name} {city.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <Link
              href="/villes"
              className="text-sm text-primary-500 hover:text-primary-700 underline-offset-2 hover:underline"
            >
              Voir toutes les villes ({villes.length.toLocaleString('fr-FR')}) →
            </Link>
          </div>
        </div>
      </section>

      {/* RGE signal — uniquement pour les services RGE-eligible */}
      {isRgeEligibleService && (
        <section className="py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <RgeGuideBlock variant="service" serviceSlug={serviceSlug} />
          </div>
        </section>
      )}

      {/* Glossaire RGE — câblage Sprint K/AI obligatoire (anti-régression).
          Render gated par RGE-eligible (cohérence schema DefinedTermSet). */}
      {servicesRgeGlossarySchema && (
        <RgeGlossaryBlock
          title={`Glossaire RGE — ${service.name}`}
          intro={`Définitions officielles des qualifications RGE et primes CEE applicables au métier ${service.name.toLowerCase()}. Vérifiez systématiquement le numéro de qualification de votre artisan sur annuaire-rge.ademe.fr.`}
        />
      )}

      {/* Deep sections (PAC / isolation / PV / borne) — 2 sections max
          en visible, schema TechArticle reste complet pour AI Overviews. */}
      {visibleDeepSections.length > 0 && (
        <section id="deep-sections" className="py-12 bg-white border-y border-sand-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            {visibleDeepSections.map((section) => (
              <article key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-4 tracking-tight">
                  {section.h2}
                </h2>
                <div className="space-y-3">
                  {section.body.slice(0, 2).map((paragraph, i) => (
                    <p
                      key={i}
                      data-speakable={i === 0 ? 'true' : undefined}
                      className="text-charcoal-700 leading-relaxed"
                    >
                      {autoLinkRgeTerms(paragraph)}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* FAQ — 5 questions max (Schema FAQPage déjà émis) */}
      {trade && trade.faq.length > 0 && (
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-charcoal-900 mb-6">
              Questions fréquentes — {service.name}
            </h2>
            <div className="space-y-3">
              {trade.faq.slice(0, 5).map((item, i) => (
                <details
                  key={i}
                  open={i === 0}
                  className="group bg-white rounded-xl shadow-soft border border-sand-200"
                >
                  <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                    <h3 className="font-semibold text-charcoal-900 pr-4">{item.q}</h3>
                    <ChevronDown
                      className="w-5 h-5 text-primary-400 group-open:rotate-180 transition-transform flex-shrink-0"
                      aria-hidden="true"
                    />
                  </summary>
                  <div className="px-5 pb-5 pt-0">
                    <p className="text-charcoal-600 leading-relaxed">{item.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Conseils succincts — gardés pour les services avec trade content */}
      {trade && trade.tips.length > 0 && (
        <section className="py-10 bg-white border-t border-sand-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-charcoal-900 mb-5">
              Conseils pour choisir votre {service.name.toLowerCase()}
            </h2>
            <ul className="space-y-3" role="list">
              {trade.tips.slice(0, 4).map((tip, i) => (
                <li key={i} className="flex gap-3">
                  <BadgeCheck
                    className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <p className="text-charcoal-700 text-sm leading-relaxed">{tip}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Voir aussi — services connexes (4-6 max) */}
      <section className="py-10 bg-white border-t border-sand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-charcoal-900 mb-5">Voir aussi</h2>
          <ul className="flex flex-wrap gap-2" role="list">
            {relatedSlugs.map((slug) => {
              const svc = staticServicesList.find((s) => s.slug === slug)
              if (!svc) return null
              return (
                <li key={slug}>
                  <Link
                    href={`/services/${slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-sand-100 hover:bg-primary-50 text-charcoal-700 hover:text-primary-600 rounded-full text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-400 focus-visible:outline-none"
                  >
                    {svc.name} RGE
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* CTA final — Devis gratuit */}
      <section className="py-12 bg-gradient-to-b from-sand-50 to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-900 mb-3">
            Recevez vos devis gratuits {service.name.toLowerCase()}
          </h2>
          <p className="text-charcoal-600 mb-8">
            Comparez les artisans RGE certifiés et obtenez jusqu'à 5 devis personnalisés sans
            engagement.
          </p>
          <Link
            href={`/devis/${serviceSlug}`}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
          >
            Demander un devis gratuit
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Sticky mobile CTA + analytics invisibles */}
      <StickyMobileCTA serviceSlug={serviceSlug} />
      <MicroConversions pageType="service" serviceSlug={serviceSlug} />
    </div>
  )
}
