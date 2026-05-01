import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect'
import { isNotFoundError } from 'next/dist/client/components/not-found'
import { isDynamicServerError } from 'next/dist/client/components/hooks-server-context'
import {
  MapPin,
  Users,
  Building2,
  ArrowRight,
  Shield,
  Clock,
  Wrench,
  HelpCircle,
  Thermometer,
  Home,
  TrendingUp,
  AlertTriangle,
  Leaf,
} from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import {
  getBreadcrumbSchema,
  getFAQSchema,
  getEnrichedPlaceSchema,
  getCityServicesListSchema,
} from '@/lib/seo/jsonld'
import { buildAggregateRatingFromProviders } from '@/lib/seo/aggregate-rating'
import { getProvidersByLocation } from '@/lib/supabase'
import { SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import {
  villes,
  getVilleBySlug,
  services,
  getRegionSlugByName,
  getDepartementByCode,
  getQuartiersByVille,
} from '@/lib/data/france'
import { getCityImage, BLUR_PLACEHOLDER } from '@/lib/data/images'
import { generateVilleContent, hashCode } from '@/lib/seo/location-content'
import { getCommuneBySlug } from '@/lib/data/commune-data'
import { getRgeProviderCountByCity } from '@/lib/rge/city-listings'
import RgePseoCtaLink from '@/components/rge/RgePseoCtaLink'
import CityHubLinks from '@/components/seo/CityHubLinks'
import EnBrefBox from '@/components/seo/EnBrefBox'
import ImmediateAnswerBlock from '@/components/seo/ImmediateAnswerBlock'
import SnippetBaitSummary from '@/components/seo/SnippetBaitSummary'
import TldrBlock from '@/components/flagship/TldrBlock'
import { buildVilleTldrBullets } from './sprint-helpers'
import { tradeContent } from '@/lib/data/trade-content'
import SeasonalLinks from '@/components/seo/SeasonalLinks'
import InContentLinks from '@/components/seo/InContentLinks'
import OrphanRescueLinks from '@/components/seo/OrphanRescueLinks'
import MoneyPageBoost from '@/components/seo/MoneyPageBoost'
import RelatedArticles from '@/components/seo/RelatedArticles'
import { SocialProofBanner } from '@/components/SocialProofBanner'
import StickyMobileCTA from '@/components/StickyMobileCTA'
import VilleHeroCTA from '@/components/conversion/VilleHeroCTA'
import { isSeoUpgradeV2, currentMonthYearFr, monthlyAnchorIso } from '@/lib/seo/sprint-helpers'
import { selectFittingTitle } from '@/lib/seo/title-selector'
import { buildVilleHubFsBait } from '@/lib/seo/fs-bait-descriptions'
import { logger } from '@/lib/logger'

const ExitIntentPopup = dynamic(() => import('@/components/ExitIntentPopup'), { ssr: false })

const CityMap = dynamic(() => import('@/components/maps/CityMap'), { ssr: false })

// Pre-render top 10 cities, rest generated on-demand via ISR
const TOP_CITIES_COUNT = 10
export function generateStaticParams() {
  return villes.slice(0, TOP_CITIES_COUNT).map((ville) => ({ ville: ville.slug }))
}

export const dynamicParams = true
export const revalidate = 86400

interface PageProps {
  params: Promise<{ ville: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ville: villeSlug } = await params
  const ville = getVilleBySlug(villeSlug)
  if (!ville) notFound()

  const cityImage = getCityImage(villeSlug)
  const upgradeV2 = isSeoUpgradeV2()

  // Sprint 0.2 — review prefix injecté en title pour CTR (pattern Sprint 2).
  // Source : aggregateRating ville-level via providers (skipped si DB KO).
  let villeAggregate: ReturnType<typeof buildAggregateRatingFromProviders> = null
  let villeProviderCount = 0
  if (upgradeV2) {
    const villeProviders = await getProvidersByLocation(villeSlug).catch(() => [])
    villeProviderCount = villeProviders.length
    villeAggregate = buildAggregateRatingFromProviders(villeProviders)
  }

  const titleHash = Math.abs(hashCode(`title-ville-${ville.slug}`))
  // Sprint 2 — variants gradués + first-fitting. Tail variants courts pour
  // longues villes (Saint-Just-en-Chaussée, Verneuil-d'Avre…).
  const titleTemplates = upgradeV2
    ? [
        villeAggregate
          ? `${villeAggregate.ratingValue}★ (${villeAggregate.reviewCount} avis) · ${villeProviderCount} artisans ${ville.name} ${ville.departementCode} 2026`
          : `${villeProviderCount > 0 ? villeProviderCount + ' ' : ''}artisans ${ville.name} (${ville.departementCode}) 2026 — Devis 24h`,
        villeAggregate
          ? `${villeAggregate.ratingValue}★ ${ville.name} : ${services.length} métiers, ${villeAggregate.reviewCount} avis · 2026`
          : `${ville.name} 2026 — ${services.length} métiers d’artisans, devis 24h`,
        `Artisans ${ville.name} (${ville.departementCode}) 2026 — Devis gratuit 24h`,
        `${ville.name} 2026 : ${services.length} métiers, devis 24h, RGE certifiés`,
        `${ville.name} (${ville.departementCode}) — Annuaire artisans vérifiés 2026`,
        `Artisans ${ville.name} 2026 — Devis 24h`,
        `Artisans ${ville.name} 2026`,
        `Artisans ${ville.name}`,
      ]
    : [
        `Artisans ${ville.name} (${ville.departementCode}) 2026 — Devis gratuit`,
        `Artisan ${ville.name} 2026 — Devis gratuit 24h`,
        `${ville.name} : ${services.length} métiers d'artisans — Devis 2026`,
        `Artisans à ${ville.name} 2026 — Comparez & choisissez`,
        `${ville.name} (${ville.departementCode}) — Annuaire artisans 2026`,
        `Artisans ${ville.name} 2026 — Devis`,
        `Artisans ${ville.name} 2026`,
        `Artisans ${ville.name}`,
      ]
  const title = selectFittingTitle(titleTemplates, titleHash, 41)

  // FS-bait : count global + count métiers (PAA "Combien d'artisans à X").
  const description = buildVilleHubFsBait({
    providerCount: villeProviderCount,
    servicesCount: services.length,
    villeName: ville.name,
    departementCode: ville.departementCode,
    year: 2026,
    reviewSnippet: villeAggregate
      ? `Note ${villeAggregate.ratingValue}/5 sur ${villeAggregate.reviewCount} avis.`
      : undefined,
  })

  return {
    title,
    description,
    // Hub pages are always indexed — rich geographic content has value even with 0 providers
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    openGraph: {
      ...getOgDefaults(),
      locale: 'fr_FR',
      title,
      description,
      url: `${SITE_URL}/villes/${villeSlug}`,
      type: 'website',
      images: [
        cityImage
          ? { url: cityImage.src, width: 1200, height: 630, alt: cityImage.alt }
          : {
              url: `${SITE_URL}/opengraph-image`,
              width: 1200,
              height: 630,
              alt: `Artisans à ${ville.name}`,
            },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [cityImage ? cityImage.src : `${SITE_URL}/opengraph-image`],
    },
    alternates: getAlternates(`/villes/${villeSlug}`),
  }
}

// Top-level error boundary — Audit 2026-04-25 (agent #6 BLOCKER) : 2 267 pages
// indexées. Tout throw imprévu doit dégrader vers `notFound()` plutôt que 500.
export default async function VillePage(props: PageProps) {
  try {
    return await renderVillePage(props)
  } catch (err) {
    if (isRedirectError(err) || isNotFoundError(err) || isDynamicServerError(err)) throw err
    logger.error('[VillePage] unhandled error on render', { error: err })
    notFound()
  }
}

async function renderVillePage({ params }: PageProps) {
  const { ville: villeSlug } = await params
  const ville = getVilleBySlug(villeSlug)
  if (!ville) notFound()

  const regionSlug = getRegionSlugByName(ville.region)
  const dept = getDepartementByCode(ville.departementCode)
  const deptSlug = dept?.slug

  // Fetch commune enrichment data + comptage RGE local + providers ville
  // pour alimenter aggregateRating. Parallèle + fail-open.
  const [commune, rgeCount, villeProviders] = await Promise.all([
    getCommuneBySlug(villeSlug).catch((err: unknown) => {
      logger.error('ville.commune_lookup_error', err as Error, {
        route: 'villes/[ville]',
        ville: villeSlug,
      })
      return null
    }),
    getRgeProviderCountByCity(villeSlug).catch((err: unknown) => {
      logger.error('ville.rge_count_error', err as Error, {
        route: 'villes/[ville]',
        ville: villeSlug,
      })
      return 0
    }),
    getProvidersByLocation(villeSlug).catch((err: unknown) => {
      logger.error('ville.providers_lookup_error', err as Error, {
        route: 'villes/[ville]',
        ville: villeSlug,
      })
      return []
    }),
  ])

  // Generate unique SEO content
  const content = generateVilleContent(ville)
  const topServiceSlugsSet = new Set(content.profile.topServiceSlugs.slice(0, 5))
  const orderedServices = [...services].sort((a, b) => {
    const aIdx = content.profile.topServiceSlugs.indexOf(a.slug)
    const bIdx = content.profile.topServiceSlugs.indexOf(b.slug)
    return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx)
  })

  // JSON-LD structured data
  const cityImage = getCityImage(ville.slug)
  const placeSchema = getEnrichedPlaceSchema({
    name: ville.name,
    slug: ville.slug,
    region: ville.region,
    department: ville.departement,
    departmentCode: ville.departementCode,
    population:
      typeof ville.population === 'number'
        ? ville.population
        : parseInt(String(ville.population).replace(/\s/g, ''), 10) || undefined,
    description: `Trouvez des artisans qualifiés à ${ville.name} (${ville.departementCode}). ${services.length} corps de métier : plombiers, électriciens, serruriers et plus.`,
    image: cityImage?.src,
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Villes', url: '/villes' },
    { name: ville.name, url: `/villes/${ville.slug}` },
  ])

  const faqSchema = getFAQSchema(content.faqItems)

  // ItemList des services disponibles dans cette ville
  const servicesListSchema = getCityServicesListSchema({
    cityName: ville.name,
    citySlug: ville.slug,
    services: orderedServices.slice(0, 20).map((s) => ({ name: s.name, slug: s.slug })),
  })

  // AggregateRating city-level : moyenne pondérée des providers de la ville
  // tous services confondus. Déclenche les étoiles SERP sur /villes/[ville]
  // (haute valeur : requêtes "artisans paris").
  const aggregateRating = buildAggregateRatingFromProviders(villeProviders)
  const cityAggregateSchema = aggregateRating
    ? {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: `Artisans à ${ville.name}`,
        url: `${SITE_URL}/villes/${ville.slug}`,
        areaServed: { '@type': 'City', name: ville.name },
        provider: {
          '@type': 'Organization',
          name: 'ServicesArtisans',
          url: SITE_URL,
        },
        aggregateRating,
      }
    : null

  // Sprint 0.2 — Article + Speakable + dateModified : signal de fraîcheur
  // pour les ranking factors et compatible Google Assistant. Image obligatoire
  // (Google Article required field) → fallback OG image si pas de cityImage.
  const upgradeV2 = isSeoUpgradeV2()
  // SnippetBaitSummary — top 10 métiers avec fourchette prix renseignée.
  // WHY : capture des Featured Snippets sur "tarif <metier> <ville>" en
  // affichant un tableau structuré <table> par-dessus la grid services.
  // Données nationales (priceRange identique sur toutes les villes), mais
  // l'URL contient la ville → Google rattache le snippet au pattern
  // "tarif/prix <metier> <ville>" via la query intent.
  const snippetTrades = upgradeV2
    ? Object.values(tradeContent)
        .filter((t) => t.priceRange?.min > 0 && t.priceRange?.max > 0)
        .slice(0, 10)
        .map((t) => ({
          name: t.name,
          slug: t.slug,
          min: t.priceRange.min,
          max: t.priceRange.max,
          unit: t.priceRange.unit,
        }))
    : []
  const monthYear = currentMonthYearFr()
  const pageUrl = `${SITE_URL}/villes/${villeSlug}`
  const monthlyAnchor = monthlyAnchorIso()
  const articleImage = cityImage?.src
    ? cityImage.src.startsWith('http')
      ? cityImage.src
      : `${SITE_URL}${cityImage.src}`
    : `${SITE_URL}/og-default.jpg`
  const articleSchema = upgradeV2
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: `Artisans à ${ville.name} (${ville.departementCode}) — Guide ${monthYear}`,
        image: [articleImage],
        datePublished: '2026-01-01T00:00:00+02:00',
        dateModified: monthlyAnchor,
        author: {
          '@type': 'Organization',
          name: 'la rédaction ServicesArtisans',
          url: SITE_URL,
        },
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

  // En bref bullets — adaptés à la ville
  const enBrefPoints: string[] = [
    `${services.length} corps de métier disponibles à ${ville.name}`,
    'Devis gratuits, réponse 24h',
    'Artisans vérifiés SIREN officiel',
  ]
  if (rgeCount > 0) {
    enBrefPoints.push(`${rgeCount} artisan${rgeCount > 1 ? 's' : ''} RGE pour MaPrimeRénov’`)
  }

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd
        data={[
          placeSchema,
          breadcrumbSchema,
          faqSchema,
          servicesListSchema,
          ...(cityAggregateSchema ? [cityAggregateSchema] : []),
          ...(articleSchema ? [articleSchema] : []),
        ]}
      />

      {/* ─── PREMIUM DARK HERO ──────────────────────────────── */}
      <section className="relative bg-charcoal-950 text-white overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          {cityImage && (
            <Image
              src={cityImage.src}
              alt={cityImage.alt}
              fill
              className="object-cover opacity-15"
              sizes="100vw"
              priority
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
            />
          )}
          <div className="absolute inset-0 bg-charcoal-950/80" />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,107,75,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(61,139,104,0.12) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(61,139,104,0.06) 0%, transparent 50%)',
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

        <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-28 md:pt-14 md:pb-36">
          {/* Breadcrumb */}
          <div className="mb-10">
            <Breadcrumb
              items={[
                ...(regionSlug ? [{ label: ville.region, href: `/regions/${regionSlug}` }] : []),
                ...(deptSlug
                  ? [
                      {
                        label: `${ville.departement} (${ville.departementCode})`,
                        href: `/departements/${deptSlug}`,
                      },
                    ]
                  : []),
                { label: ville.name },
              ]}
              className="text-charcoal-400 [&_a]:text-charcoal-400 [&_a:hover]:text-white [&_svg]:text-charcoal-600"
            />
          </div>

          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2 mb-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-400/15 backdrop-blur-sm rounded-full border border-primary-400/25">
                <MapPin className="w-4 h-4 text-primary-400" />
                <span className="text-sm font-medium text-primary-200">
                  {content.profile.citySizeLabel}
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/15 backdrop-blur-sm rounded-full border border-accent-400/25">
                <Thermometer className="w-4 h-4 text-accent-400" />
                <span className="text-sm font-medium text-accent-200">
                  {content.profile.climateLabel}
                </span>
              </div>
            </div>

            {(() => {
              const h1Hash = Math.abs(hashCode(`h1-ville-${ville.slug}`))
              const h1Templates = [
                `Artisans à ${ville.name}`,
                `Artisans à ${ville.name} (${ville.departementCode}) : pros qualifiés`,
                `${ville.name} : artisans qualifiés pour vos travaux`,
                `Artisans à ${ville.name}, ${ville.departement}`,
                `${services.length} corps de métier à ${ville.name}`,
              ]
              return (
                <h1
                  data-speakable="true"
                  className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold mb-5 tracking-[-0.025em] leading-[1.1]"
                >
                  {h1Templates[h1Hash % h1Templates.length]}
                </h1>
              )
            })()}
            <p className="text-lg text-charcoal-400 max-w-2xl leading-relaxed mb-8">
              {content.intro}
            </p>

            {/* Location info */}
            <div className="flex flex-wrap gap-4 mb-8 text-sm">
              <div className="flex items-center gap-2 text-charcoal-300">
                <MapPin className="w-4 h-4 text-primary-400" />
                <span>{ville.region}</span>
              </div>
              <div className="flex items-center gap-2 text-charcoal-300">
                <Building2 className="w-4 h-4 text-primary-400" />
                <span>
                  {ville.departement} ({ville.departementCode})
                </span>
              </div>
              <div className="flex items-center gap-2 text-charcoal-300">
                <Users className="w-4 h-4 text-primary-400" />
                <span>{ville.population} habitants</span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10">
                <Shield className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium">Données SIREN officielles</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium">Devis gratuits</span>
              </div>
            </div>
          </div>

          {/* ── CTA above the fold ── */}
          <div className="mt-10 max-w-3xl">
            <VilleHeroCTA villeName={ville.name} />
          </div>
        </div>
      </section>

      {/* Sprint 0.2 — byline E-E-A-T (visible si Article schema racine actif).
          Permet à Google de relier l'auteur Organization au contenu et de
          satisfaire le pre-commit hook E-E-A-T DOM (byline + date visible). */}
      {upgradeV2 && articleSchema && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <p className="text-xs text-charcoal-500">
            Auteur :{' '}
            <span className="font-medium text-charcoal-700">la rédaction ServicesArtisans</span> ·
            Mis à jour le{' '}
            <time dateTime={monthlyAnchor}>
              {new Intl.DateTimeFormat('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                timeZone: 'Europe/Paris',
              }).format(new Date(monthlyAnchor))}
            </time>
          </p>
        </div>
      )}

      {/* Sprint 0.2 — TL;DR : 4-5 réponses directes pour AI Overviews +
          Speakable. Distinct de EnBrefBox (chiffres) et ImmediateAnswerBlock
          (réponse front-end) — ici on répond aux intentions fréquentes
          (vérification, délai, leads exclusifs, RGE/MPR si éligible). */}
      {upgradeV2 && villeProviders.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <TldrBlock
            bullets={buildVilleTldrBullets({
              villeName: ville.name,
              departementCode: ville.departementCode,
              servicesCount: services.length,
              villeProviderCount: villeProviders.length,
              rgeCount,
              climateLabel: content.profile.climateLabel ?? null,
              citySizeLabel: content.profile.citySizeLabel ?? null,
            })}
          />
        </div>
      )}

      {/* Sprint 0.2 — En bref : capture des Featured Snippets en haut de page.
          Conditionné sur villeProviders.length > 0 pour rester cohérent avec
          ImmediateAnswerBlock (sinon promesse "X artisans vérifiés" sans
          rendu concret en dessous → friction UX). */}
      {upgradeV2 && villeProviders.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <EnBrefBox
            summary={`Trouvez des artisans qualifiés à ${ville.name} (${ville.departementCode}) : ${services.length} corps de métier disponibles, devis gratuits sous 24h, professionnels vérifiés SIREN. ${rgeCount > 0 ? `${rgeCount} certifié${rgeCount > 1 ? 's' : ''} RGE pour MaPrimeRénov’.` : ''}`.trim()}
            keyPoints={enBrefPoints}
          />
        </div>
      )}

      {/* Sprint 0.2 — bloc de stats locales pour réponse immédiate (LLM-citable
          + Featured Snippets). Composant existant ImmediateAnswerBlock. */}
      {upgradeV2 && villeProviders.length > 0 && (
        <div className="pt-2 pb-6">
          <ImmediateAnswerBlock
            serviceName="Artisans"
            villeName={ville.name}
            trade={null}
            providerCount={villeProviders.length}
            averageRating={aggregateRating ? Number(aggregateRating.ratingValue) : undefined}
            totalReviews={aggregateRating ? Number(aggregateRating.reviewCount) : undefined}
          />
        </div>
      )}

      {/* SnippetBaitSummary — table prix par métier (Featured Snippets).
          5 000 surfaces villes × 10 métiers = 50 000 surfaces de capture
          sur "tarif <metier> <ville>" / "prix <metier> <ville>".
          Lien interne /tarifs/[trade] depuis chaque ligne renforce le
          maillage tarifs ↔ villes (PageRank flow). */}
      {upgradeV2 && snippetTrades.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6">
          <SnippetBaitSummary trades={snippetTrades} />
        </div>
      )}

      {/* ─── RGE LOCAL SIGNAL ───────────────────────────────────
          Bandeau reassurance visible uniquement si au moins 1 artisan RGE
          existe dans la ville. Rappel : RGE est requis pour MaPrimeRénov',
          CEE et TVA 5,5 %. Lien vers le hub /artisans-rge/[ville]. */}
      {rgeCount > 0 && (
        <section className="py-4 bg-emerald-50 border-y border-emerald-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <RgePseoCtaLink
              href={`/artisans-rge/${villeSlug}`}
              surface="villes"
              className="flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-emerald-900">
                    {rgeCount} artisan{rgeCount > 1 ? 's' : ''} certifié{rgeCount > 1 ? 's' : ''}{' '}
                    RGE à {ville.name}
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

      {/* ─── SERVICES GRID ──────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-charcoal-900 tracking-tight">
                Trouver un artisan à {ville.name}
              </h2>
              <p className="text-sm text-charcoal-500">
                {services.length} corps de métier disponibles
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {orderedServices.slice(0, 10).map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}/${villeSlug}`}
                className={`bg-white rounded-2xl shadow-soft p-5 text-center hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group ${topServiceSlugsSet.has(service.slug) ? 'border-2 border-accent-200' : 'border border-sand-200'}`}
              >
                {topServiceSlugsSet.has(service.slug) && (
                  <span className="inline-block text-[10px] font-bold text-accent-600 bg-accent-50 px-2 py-0.5 rounded-full mb-2">
                    Prioritaire
                  </span>
                )}
                <h3 className="font-semibold text-charcoal-800 group-hover:text-primary-400 transition-colors text-sm">
                  {service.name}
                </h3>
                <p className="text-xs text-charcoal-400 mt-1.5">à {ville.name}</p>
              </Link>
            ))}
          </div>
          {orderedServices.length > 10 && (
            <div className="text-center mt-6">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary-400 hover:text-primary-600 transition-colors"
              >
                Voir les {services.length} corps de métier <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* ── Social proof mid-page ── */}
          <div className="mt-8">
            <SocialProofBanner ville={ville.name} variant="card" />
          </div>
        </section>

        {/* ─── CARTE DES ARTISANS ─────────────────────────────── */}
        <CityMap cityName={ville.name} citySlug={villeSlug} />

        {/* ─── SERVICES ASSOCIES — cross-intent links ──────── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-charcoal-900 tracking-tight">
                Services associés à {ville.name}
              </h2>
              <p className="text-sm text-charcoal-500">Tarifs, devis et urgences par métier</p>
            </div>
          </div>
          <div className="space-y-4">
            {orderedServices.slice(0, 5).map((service) => (
              <div
                key={`intent-${service.slug}`}
                className="bg-white rounded-2xl border border-sand-200 p-5"
              >
                <h3 className="font-semibold text-charcoal-900 text-sm mb-3">
                  {service.name} à {ville.name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/services/${service.slug}/${villeSlug}`}
                    className="inline-flex items-center gap-1.5 text-sm text-primary-500 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Artisans
                  </Link>
                  <Link
                    href={`/services/${service.slug}/${villeSlug}`}
                    className="inline-flex items-center gap-1.5 text-sm text-primary-500 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Tarifs
                  </Link>
                  <Link
                    href={`/services/${service.slug}/${villeSlug}`}
                    className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Devis gratuit
                  </Link>
                  <Link
                    href={`/urgence/${service.slug}/${villeSlug}`}
                    className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Urgence
                  </Link>
                  <Link
                    href={`/avis/${service.slug}/${villeSlug}`}
                    className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Avis
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── QUARTIERS ────────────────────────────────────── */}
        {ville.quartiers && ville.quartiers.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-accent-600" />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-charcoal-900 tracking-tight">
                  Quartiers desservis à {ville.name}
                </h2>
                <p className="text-sm text-charcoal-500">
                  {ville.quartiers.length} quartiers couverts
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-sand-300 p-6">
              <div className="flex flex-wrap gap-2.5">
                {getQuartiersByVille(villeSlug).map(({ name, slug }) => (
                  <Link
                    key={slug}
                    href={`/villes/${villeSlug}/${slug}`}
                    className="bg-sand-50 text-charcoal-700 px-4 py-2 rounded-full text-sm border border-sand-200 hover:bg-accent-50 hover:text-accent-700 hover:border-accent-200 transition-colors"
                  >
                    {name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── PROFIL DE LA VILLE ─────────────────────────────── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-charcoal-900 tracking-tight">
                Profil de {ville.name}
              </h2>
              <p className="text-sm text-charcoal-500">
                {content.profile.citySizeLabel} · {content.profile.climateLabel}
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-sand-300 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-4 h-4 text-primary-400" />
                <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
                  Climat
                </span>
              </div>
              <p className="font-bold text-charcoal-900">{content.profile.climateLabel}</p>
            </div>
            <div className="bg-white rounded-2xl border border-sand-300 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Home className="w-4 h-4 text-accent-500" />
                <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
                  Habitat
                </span>
              </div>
              <p className="font-bold text-charcoal-900">{content.profile.citySizeLabel}</p>
            </div>
            <div className="bg-white rounded-2xl border border-sand-300 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-violet-500" />
                <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
                  Population
                </span>
              </div>
              <p className="font-bold text-charcoal-900">{ville.population} hab.</p>
            </div>
            <div className="bg-white rounded-2xl border border-sand-300 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
                  Département
                </span>
              </div>
              <p className="font-bold text-charcoal-900">
                {ville.departement} ({ville.departementCode})
              </p>
            </div>
          </div>

          {/* Données enrichies — affichées uniquement si disponibles */}
          {commune &&
            (commune.nb_artisans_btp != null ||
              commune.prix_m2_maison != null ||
              commune.pct_passoires_dpe != null ||
              commune.jours_gel_annuels != null ||
              commune.nb_artisans_rge != null ||
              commune.nb_maprimerenov_annuel != null) && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {commune.nb_artisans_btp != null && (
                  <div className="bg-white rounded-2xl border border-sand-300 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="w-4 h-4 text-teal-500" />
                      <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
                        Artisans BTP
                      </span>
                    </div>
                    <p className="font-bold text-charcoal-900 text-lg">
                      {commune.nb_artisans_btp.toLocaleString('fr-FR')}
                    </p>
                    <p className="text-xs text-charcoal-500 mt-1">entreprises actives (SIRENE)</p>
                  </div>
                )}
                {commune.nb_artisans_rge != null && (
                  <div className="bg-white rounded-2xl border border-sand-300 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-accent-500" />
                      <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
                        Certifiés RGE
                      </span>
                    </div>
                    <p className="font-bold text-charcoal-900 text-lg">
                      {commune.nb_artisans_rge.toLocaleString('fr-FR')}
                    </p>
                    <p className="text-xs text-charcoal-500 mt-1">
                      artisans rénovation énergétique
                    </p>
                  </div>
                )}
                {commune.prix_m2_maison != null && (
                  <div className="bg-white rounded-2xl border border-sand-300 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-primary-400" />
                      <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
                        Prix immobilier
                      </span>
                    </div>
                    <p className="font-bold text-charcoal-900 text-lg">
                      {commune.prix_m2_maison.toLocaleString('fr-FR')} €/m²
                    </p>
                    <p className="text-xs text-charcoal-500 mt-1">
                      maison
                      {commune.prix_m2_appartement != null
                        ? ` · ${commune.prix_m2_appartement.toLocaleString('fr-FR')} €/m² appt`
                        : ''}
                    </p>
                  </div>
                )}
                {commune.pct_passoires_dpe != null && (
                  <div className="bg-white rounded-2xl border border-sand-300 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
                        Passoires énergétiques
                      </span>
                    </div>
                    <p className="font-bold text-charcoal-900 text-lg">
                      {commune.pct_passoires_dpe}%
                    </p>
                    <p className="text-xs text-charcoal-500 mt-1">
                      des logements classés F ou G (DPE)
                    </p>
                  </div>
                )}
                {commune.jours_gel_annuels != null && (
                  <div className="bg-white rounded-2xl border border-sand-300 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="w-4 h-4 text-primary-400" />
                      <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
                        Climat
                      </span>
                    </div>
                    <p className="font-bold text-charcoal-900 text-lg">
                      {commune.jours_gel_annuels} jours de gel/an
                    </p>
                    <p className="text-xs text-charcoal-500 mt-1">
                      {commune.temperature_moyenne_hiver != null &&
                      commune.temperature_moyenne_ete != null
                        ? `Hiver ${commune.temperature_moyenne_hiver.toFixed(1)}°C · Été ${commune.temperature_moyenne_ete.toFixed(1)}°C`
                        : `${commune.precipitation_annuelle != null ? commune.precipitation_annuelle + ' mm/an' : ''}`}
                    </p>
                  </div>
                )}
                {commune.nb_maprimerenov_annuel != null && (
                  <div className="bg-white rounded-2xl border border-sand-300 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
                        MaPrimeRénov&apos;
                      </span>
                    </div>
                    <p className="font-bold text-charcoal-900 text-lg">
                      {commune.nb_maprimerenov_annuel.toLocaleString('fr-FR')}
                    </p>
                    <p className="text-xs text-charcoal-500 mt-1">
                      dossiers/an dans le département
                    </p>
                  </div>
                )}
              </div>
            )}

          {/* Risques naturels — affichés uniquement si données géorisques disponibles */}
          {commune &&
            ((commune.nb_catnat != null && commune.nb_catnat > 0) ||
              commune.zone_sismique != null ||
              commune.risque_argile != null) && (
              <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 mb-6">
                <h3 className="font-semibold text-charcoal-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Risques naturels à {ville.name}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {commune.zone_sismique != null && (
                    <span className="inline-flex items-center px-3 py-1.5 bg-white rounded-lg text-sm text-charcoal-700 border border-amber-200">
                      Zone sismique <strong className="ml-1">{commune.zone_sismique}/5</strong>
                    </span>
                  )}
                  {commune.risque_argile != null && (
                    <span className="inline-flex items-center px-3 py-1.5 bg-white rounded-lg text-sm text-charcoal-700 border border-amber-200">
                      Argile : <strong className="ml-1">{commune.risque_argile}</strong>
                    </span>
                  )}
                  {commune.risque_inondation === true && (
                    <span className="inline-flex items-center px-3 py-1.5 bg-white rounded-lg text-sm text-charcoal-700 border border-amber-200">
                      Risque inondation
                    </span>
                  )}
                  {commune.risque_radon != null && (
                    <span className="inline-flex items-center px-3 py-1.5 bg-white rounded-lg text-sm text-charcoal-700 border border-amber-200">
                      Radon : <strong className="ml-1">niveau {commune.risque_radon}/3</strong>
                    </span>
                  )}
                  {commune.nb_catnat != null && commune.nb_catnat > 0 && (
                    <span className="inline-flex items-center px-3 py-1.5 bg-white rounded-lg text-sm text-charcoal-700 border border-amber-200">
                      <strong className="mr-1">{commune.nb_catnat}</strong> arrêtés CatNat
                    </span>
                  )}
                </div>
              </div>
            )}

          <div className="bg-white rounded-2xl border border-sand-300 p-6 mb-4">
            <h3 className="font-semibold text-charcoal-900 mb-3">Habitat à {ville.name}</h3>
            <p className="text-sm text-charcoal-600 leading-relaxed">
              {content.profile.habitatDescription}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-sand-300 p-6 mb-4">
            <h3 className="font-semibold text-charcoal-900 mb-3">Contexte urbain</h3>
            <p className="text-sm text-charcoal-600 leading-relaxed">{content.contexteUrbain}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {content.profile.climaticIssues.slice(0, 4).map((issue, i) => (
              <div
                key={i}
                className="flex items-start gap-2 bg-amber-50 rounded-lg border border-amber-100 p-3"
              >
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-amber-800">{issue}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CONTENU SEO : SERVICES & CONSEILS ─────────────── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-charcoal-900 tracking-tight">
              Artisanat à {ville.name}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-sand-300 p-6">
              <h3 className="font-semibold text-charcoal-900 mb-3">Services prioritaires</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                {content.servicesPrioritaires}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-sand-300 p-6">
              <h3 className="font-semibold text-charcoal-900 mb-3">Conseils pour {ville.name}</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">{content.conseilsVille}</p>
            </div>
          </div>
        </section>

        {/* Devis links handled by CityHubLinks below */}

        {/* Nearby villes handled by CityHubLinks below — no duplication */}

        {/* ─── FAQ SECTION ──────────────────────────────────── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-charcoal-900 tracking-tight">
              Questions fréquentes
            </h2>
          </div>
          <div className="space-y-4">
            {content.faqItems.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-sand-300 p-6">
                <h3 className="font-semibold text-charcoal-900 mb-2">{faq.question}</h3>
                <p className="text-sm text-charcoal-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ─── CTA ────────────────────────────────────────────── */}
      <section className="relative bg-charcoal-950 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(232,107,75,0.12) 0%, transparent 60%)',
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-20 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">
            Besoin d'un artisan à {ville.name} ?
          </h2>
          <p className="text-charcoal-400 mb-8 max-w-lg mx-auto">
            Décrivez votre projet et recevez des devis gratuits d'artisans qualifiés.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-400 via-primary-400 to-primary-500 text-white font-semibold px-8 py-3.5 rounded-2xl shadow-cta hover:shadow-cta hover:-translate-y-0.5 transition-all duration-300"
            >
              Obtenir mon devis gratuit
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-charcoal-300 hover:text-primary-400 font-medium transition-colors"
            >
              Voir les services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SEO INTERNAL LINKS ─────────────────────────────── */}
      <CityHubLinks
        ville={ville}
        villeSlug={villeSlug}
        topServiceSlugs={content.profile.topServiceSlugs}
        regionSlug={regionSlug}
        deptSlug={deptSlug}
      />

      <InContentLinks
        serviceSlug={content.profile.topServiceSlugs[0] ?? 'plombier'}
        serviceName={
          services.find((s) => s.slug === (content.profile.topServiceSlugs[0] ?? 'plombier'))
            ?.name ?? 'Plombier'
        }
        villeSlug={villeSlug}
        villeName={ville.name}
        currentIntent="services"
        departementCode={ville.departementCode}
        region={ville.region}
      />

      <SeasonalLinks villeSlug={villeSlug} villeName={ville.name} />

      <OrphanRescueLinks currentPath={`/villes/${villeSlug}`} villeSlug={villeSlug} />

      {/* ─── MONEY PAGE BOOST — cross-silo links to top pages ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MoneyPageBoost
          currentService={content.profile.topServiceSlugs[0]}
          currentVille={villeSlug}
        />
      </div>

      {/* ─── RELATED ARTICLES — guides for top service ───────── */}
      <RelatedArticles serviceSlug={content.profile.topServiceSlugs[0] ?? 'plombier'} limit={3} />

      {/* ─── EDITORIAL CREDIBILITY ──────────────────────────── */}
      <section className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-sand-100 rounded-2xl border border-sand-300 p-6">
            <h3 className="text-sm font-semibold text-charcoal-700 mb-2">
              Méthodologie éditoriale
            </h3>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              Les données de cette page sont issues de sources publiques (INSEE, base SIRENE). Les
              profils climatiques et économiques sont des estimations régionales. ServicesArtisans
              est un annuaire indépendant — nous ne réalisons pas de travaux et ne garantissons pas
              les prestations des artisans référencés.
            </p>
          </div>
        </div>
      </section>

      {/* Confiance & Sécurité links available in footer */}

      {/* ── Conversion overlays ── */}
      <StickyMobileCTA cityName={ville.name} citySlug={villeSlug} />
      <ExitIntentPopup />
    </div>
  )
}
