import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect'
import { isNotFoundError } from 'next/dist/client/components/not-found'
import { isDynamicServerError } from 'next/dist/client/components/hooks-server-context'
import { MapPin, Users, Building2, ArrowRight, HelpCircle, Leaf } from 'lucide-react'

const ExitIntentPopup = dynamic(() => import('@/components/ExitIntentPopup'), { ssr: false })
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import {
  getBreadcrumbSchema,
  getFAQSchema,
  getEnrichedPlaceSchema,
  getCityServicesListSchema,
  getReviewedByPersonSchema,
} from '@/lib/seo/jsonld'
import { authors, getReviewerForAuthor } from '@/lib/data/authors'
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
import { getRgeProviderCountByCity } from '@/lib/rge/city-listings'
import RgePseoCtaLink from '@/components/rge/RgePseoCtaLink'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import { buildVilleTldrBullets } from './sprint-helpers'
import StickyMobileCTA from '@/components/StickyMobileCTA'
import VilleHeroCTA from '@/components/conversion/VilleHeroCTA'
import { isSeoUpgradeV2, currentMonthYearFr, monthlyAnchorIso } from '@/lib/seo/sprint-helpers'
import { selectFittingTitle } from '@/lib/seo/title-selector'
import { buildVilleHubFsBait } from '@/lib/seo/fs-bait-descriptions'
import { logger } from '@/lib/logger'

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
        `${ville.name} (${ville.departementCode}) — Annuaire artisans RGE 2026`,
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
  // Sprint 5 vague 4 — maxLen 41 → 60 pour récupérer les variants review-prefix
  // riches sur les 35K pages /villes/[ville]. 60 = limite Google SERP desktop
  // (mobile blended ~58), au-delà tronqué visuel sans perte de signal sémantique.
  const title = selectFittingTitle(titleTemplates, titleHash, 60)

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

  // Fetch comptage RGE local + providers ville pour alimenter aggregateRating.
  // Parallèle + fail-open.
  const [rgeCount, villeProviders] = await Promise.all([
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
    description: `Trouvez des artisans RGE certifiés à ${ville.name} (${ville.departementCode}). ${services.length} corps de métier RGE pour la rénovation énergétique.`,
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

  // Article + Speakable + dateModified : signal de fraîcheur Google.
  const upgradeV2 = isSeoUpgradeV2()
  const monthYear = currentMonthYearFr()
  const pageUrl = `${SITE_URL}/villes/${villeSlug}`
  const monthlyAnchor = monthlyAnchorIso()
  const articleImage = cityImage?.src
    ? cityImage.src.startsWith('http')
      ? cityImage.src
      : `${SITE_URL}${cityImage.src}`
    : `${SITE_URL}/og-default.jpg`
  // Tier 6 2026-05-04 — Person sophie-martin (généraliste rénovation,
  // hub multi-métiers ville). Reviewer claire-dubois (aides cumulables citées).
  const VILLE_AUTHOR = authors['sophie-martin']
  const VILLE_REVIEWER = getReviewerForAuthor(VILLE_AUTHOR)
  const articleSchema = upgradeV2
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: `Artisans à ${ville.name} (${ville.departementCode}) — Guide ${monthYear}`,
        image: [articleImage],
        datePublished: '2026-01-01T00:00:00+02:00',
        dateModified: monthlyAnchor,
        author: VILLE_AUTHOR
          ? {
              '@type': 'Person',
              name: VILLE_AUTHOR.name,
              jobTitle: VILLE_AUTHOR.role,
              url: `${SITE_URL}/equipe/${VILLE_AUTHOR.slug}`,
              ...(VILLE_AUTHOR.methodology &&
                VILLE_AUTHOR.methodology.length > 0 && { skills: VILLE_AUTHOR.methodology }),
            }
          : {
              '@type': 'Organization',
              name: 'la rédaction ServicesArtisans',
              url: SITE_URL,
            },
        ...(VILLE_REVIEWER && { reviewedBy: getReviewedByPersonSchema(VILLE_REVIEWER) }),
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
    `${services.length} corps de métier RGE disponibles à ${ville.name}`,
    'Devis gratuits, réponse 24h',
    'Artisans RGE certifiés (Qualibat, Qualifelec, QualiPAC, Qualit’EnR)',
  ]
  if (rgeCount > 0) {
    enBrefPoints.push(`${rgeCount} artisan${rgeCount > 1 ? 's' : ''} RGE pour MaPrimeRénov’`)
  }

  // H1 keyword-first
  const h1Hash = Math.abs(hashCode(`h1-ville-${ville.slug}`))
  const h1Templates = [
    `Artisans RGE à ${ville.name}`,
    `Artisans RGE certifiés à ${ville.name} (${ville.departementCode})`,
    `${ville.name} : artisans RGE certifiés pour vos travaux`,
    `Artisans RGE à ${ville.name}, ${ville.departement}`,
    `${services.length} corps de métier RGE à ${ville.name}`,
  ]
  const h1Text = h1Templates[h1Hash % h1Templates.length]

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

      {/* Breadcrumb */}
      <div className="bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
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
          />
        </div>
      </div>

      {/* Hero compact */}
      <section className="relative bg-charcoal-950 text-white overflow-hidden">
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

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h1
            data-speakable="true"
            className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight"
          >
            {h1Text}
          </h1>
          <p className="mt-4 text-lg text-charcoal-300 max-w-2xl leading-relaxed">
            {content.intro}
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-charcoal-300">
            <span className="inline-flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-400" aria-hidden="true" />
              {ville.region}
            </span>
            <span className="inline-flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary-400" aria-hidden="true" />
              {ville.departement} ({ville.departementCode})
            </span>
            <span className="inline-flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-400" aria-hidden="true" />
              {ville.population} habitants
            </span>
          </div>

          <div className="mt-8 max-w-2xl">
            <VilleHeroCTA villeName={ville.name} />
          </div>
        </div>
      </section>

      {/* Article byline */}
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

      {/* Removed: HERO_END_MARKER. Replace from here onwards. */}
      {/* TL;DR — direct answers (AI Overviews + Speakable) */}
      {upgradeV2 && villeProviders.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
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

      {/* En bref — Featured Snippets */}
      {upgradeV2 && villeProviders.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <EnBrefBox
            summary={`Trouvez des artisans RGE certifiés à ${ville.name} (${ville.departementCode}) : ${services.length} corps de métier RGE, devis gratuits sous 24h, qualifications synchronisées avec la base ADEME. ${rgeCount > 0 ? `${rgeCount} artisan${rgeCount > 1 ? 's' : ''} RGE éligibles MaPrimeRénov’.` : ''}`.trim()}
            keyPoints={enBrefPoints}
          />
        </div>
      )}

      {/* RGE local signal — bandeau visible si au moins 1 artisan RGE */}
      {rgeCount > 0 && (
        <section className="mt-6 py-4 bg-emerald-50 border-y border-emerald-100">
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Top 10 services × ville (keyword-first) */}
        <section>
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-5 tracking-tight">
            Trouver un artisan à {ville.name}
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" role="list">
            {orderedServices.slice(0, 10).map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/services/${service.slug}/${villeSlug}`}
                  className="block bg-white rounded-xl border border-sand-200 hover:border-primary-200 hover:shadow-card-hover px-4 py-3 text-center transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-400 focus-visible:outline-none"
                >
                  <span className="block font-semibold text-charcoal-900 text-sm">
                    {service.name}
                  </span>
                  <span className="block text-xs text-charcoal-500 mt-1">à {ville.name}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <Link
              href="/services"
              className="text-sm text-primary-500 hover:text-primary-700 underline-offset-2 hover:underline"
            >
              Voir les {services.length} corps de métier →
            </Link>
          </div>
        </section>

        {/* Quartiers — uniquement si présents (gated by data uniqueness) */}
        {ville.quartiers && ville.quartiers.length > 0 && (
          <section>
            <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-4 tracking-tight">
              Quartiers desservis à {ville.name}
            </h2>
            <ul className="flex flex-wrap gap-2" role="list">
              {getQuartiersByVille(villeSlug)
                .slice(0, 12)
                .map(({ name, slug }) => (
                  <li key={slug}>
                    <Link
                      href={`/villes/${villeSlug}/${slug}`}
                      className="inline-flex items-center bg-sand-100 hover:bg-primary-50 text-charcoal-700 hover:text-primary-600 px-4 py-2 rounded-full text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-400 focus-visible:outline-none"
                    >
                      {name}
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        )}

        {/* FAQ — 5 questions max (Schema FAQPage déjà émis) */}
        {content.faqItems.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <HelpCircle className="w-6 h-6 text-amber-600 flex-shrink-0" aria-hidden="true" />
              <h2 className="font-heading text-2xl font-bold text-charcoal-900 tracking-tight">
                Questions fréquentes — {ville.name}
              </h2>
            </div>
            <div className="space-y-3">
              {content.faqItems.slice(0, 5).map((faq, i) => (
                <details
                  key={i}
                  open={i === 0}
                  className="group bg-white rounded-xl border border-sand-200 p-5"
                >
                  <summary className="cursor-pointer list-none font-semibold text-charcoal-900">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-sm text-charcoal-600 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* CTA final */}
      <section className="bg-charcoal-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3 tracking-tight">
            Besoin d'un artisan RGE à {ville.name} ?
          </h2>
          <p className="text-charcoal-400 mb-6 max-w-lg mx-auto">
            Décrivez votre projet et recevez des devis gratuits d'artisans RGE certifiés.
          </p>
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3.5 rounded-xl shadow-cta transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-400 focus-visible:outline-none"
          >
            Obtenir mon devis gratuit
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Sticky mobile CTA + exit intent */}
      <StickyMobileCTA cityName={ville.name} citySlug={villeSlug} />
      <ExitIntentPopup />
    </div>
  )
}
