/**
 * /rge/[service]/[ville] — pSEO 50K URLs (Pilier 2 rénovation énergétique).
 *
 * @kw-primary    artisan rge [ville]
 * @kw-volume     8400
 * @kw-kd         12
 * @kw-cpc        2.40
 * @cluster       1
 * @ahrefs-source docs/audit-ahrefs-2026-05-03/longtail-rge-services.csv:42-180
 * @backlog-item  P3-rge-template-upgrade
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 + audit 10 agents 2026-04-28)
 *
 * Patterns DoD (cf. scripts/audit-rge-template.mjs) :
 *   - selectFittingTitle maxLen=60 (Sprint 5 vague 4)
 *   - reviewPrefix Sprint 2 (★ + count + 24h)
 *   - AggregateRating fallback département (review_stats_by_dept)
 *   - Article + Speakable + author + reviewedBy
 *   - GovernmentService (ANAH / France Rénov')
 *   - FinancialProduct (cumul aides)
 *   - CollectionPage avec @id + inLanguage + isPartOf
 *   - PrimesCEEBlock conditionnel (eligibleCeeOps.length > 0)
 *   - TldrBlock pré-FAQ
 */
import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FileText } from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import ProviderList from '@/components/ProviderList'
import StickyMobileCTA from '@/components/conversion/StickyMobileCTA'
import MiniSimulateurInline from '@/components/conversion/MiniSimulateurInline'
import FinalCtaSection from '@/components/conversion/FinalCtaSection'
import SocialProofBadge from '@/components/conversion/SocialProofBadge'
import DevisQuickForm from '@/components/conversion/DevisQuickForm'
import EnBrefBox from '@/components/seo/EnBrefBox'
import PrimesCEEBlock from '@/components/seo/PrimesCEEBlock'
import SimulateurCTA from '@/components/cee/SimulateurCTA'
import ReviewsDeptBlock from '@/components/seo/ReviewsDeptBlock'
import TldrBlock from '@/components/flagship/TldrBlock'
import {
  getServiceBySlug,
  getLocationBySlug,
  getReviewStatsByDept,
  getTopReviewsByDept,
} from '@/lib/supabase'
import { villes as staticVilles } from '@/lib/data/france'
import { authors, getReviewerForAuthor } from '@/lib/data/authors'
import { SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import {
  getBreadcrumbSchema,
  getItemListSchema,
  getGovernmentServiceSchema,
  getFinancialProductSchema,
  getReviewedByPersonSchema,
} from '@/lib/seo/jsonld'
import {
  getApplicableAidesForService,
  isServiceEligibleForAides,
} from '@/lib/seo/aides-for-service'
import { spreadCitationsForTopics } from '@/lib/seo/authoritative-citations'
import {
  buildAggregateRatingFromProviders,
  type PageAggregateRating,
} from '@/lib/seo/aggregate-rating'
import { buildDevisHref, getArtisanUrl } from '@/lib/utils'
import {
  getRgeProvidersByServiceAndCity,
  getRgeProvidersByServiceAndDepartement,
  getRgeCountByServiceAndCityStrict,
  isRgeAllowedService,
  RGE_ALLOWED_SERVICES,
  RGE_QUALIFICATION_LABELS,
  resolveRgeServiceDisplayName,
} from '@/lib/rge/service-city-listings'
import { getRgeServiceStats } from '@/lib/rge/guide-stats'
import {
  buildServiceCityParagraphs,
  buildServiceCityFaq,
  buildFaqJsonLd,
} from '@/lib/rge/pseo-content'
import { getCeeOpsForRgeService } from '@/lib/rge/service-guides-map'
import { getVilleBySlug, getDepartementByCode } from '@/lib/data/france'
import MaillageInterneBlock from '@/components/seo/MaillageInterneBlock'
import AEOAnswerBlock from '@/components/seo/AEOAnswerBlock'
import CommuneContextBlock from '@/components/seo/CommuneContextBlock'
import { getCommuneBySlug } from '@/lib/data/commune-data'
import { logger } from '@/lib/logger'
import {
  isRgeUpgradeV2,
  currentMonthYearFr,
  buildIntroParagraph,
  buildRgeTldrBullets,
  safeJsonStringify,
} from './helpers'
import { monthlyAnchorIso } from '@/lib/seo/sprint-helpers'
import { selectFittingTitle } from '@/lib/seo/title-selector'
import { hashCode } from '@/lib/seo/hash'
import { buildRenovationFsBait } from '@/lib/seo/fs-bait-descriptions'
import { getNaturalTerm } from '@/lib/seo/natural-terms'

// ISR : revalidation quotidienne (comme les autres routes pSEO géo)
export const revalidate = 86400
export const dynamicParams = true

// Slug guard (comme services/[service]/[location])
const VALID_SLUG = /^[a-z0-9][a-z0-9-]{0,78}[a-z0-9]$/

// Sprint 2 Phase D 2026-05-04 — PRERENDER étendu 200 → 1 140 pages.
// Avant : 10 services × 20 villes (200) — 99,6 % des 50 K URLs en cold-start ISR.
// Après : 19 services (toute l'allowlist) × 60 villes top staticVilles = 1 140
// pages statiques au build. Couvre les top 60 villes France pour CHAQUE service
// RGE éligible (audit-energetique, ventilation, fenetres, borne-recharge,
// chauffe-eau-thermodynamique inclus).
// Trade-off build time : ~5x pages générées sur cette route, ISR on-demand
// reste pour le reste (35K communes). RAPPORT-FINAL audit ligne 520 : la fix
// cold-start ISR top villes = TOP_CITIES_COUNT≥100 — on cale à 60 d'abord
// pour mesurer build time, monter à 100 si OK.
const PRERENDER_SERVICES: string[] = [...RGE_ALLOWED_SERVICES]
const PRERENDER_CITIES_COUNT = 60

export function generateStaticParams() {
  const topCities = staticVilles.slice(0, PRERENDER_CITIES_COUNT)
  return PRERENDER_SERVICES.flatMap((service) => topCities.map((v) => ({ service, ville: v.slug })))
}

type PageProps = {
  params: Promise<{ service: string; ville: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { service: serviceSlug, ville: villeSlug } = await params

  if (!VALID_SLUG.test(serviceSlug) || !VALID_SLUG.test(villeSlug)) {
    notFound()
  }
  if (!isRgeAllowedService(serviceSlug)) {
    notFound()
  }

  const [service, location] = await Promise.all([
    getServiceBySlug(serviceSlug).catch((err: unknown) => {
      logger.error('rge_service_ville.service_metadata_error', err as Error, {
        route: 'rge/[service]/[ville]',
        service: serviceSlug,
        ville: villeSlug,
      })
      return null
    }),
    getLocationBySlug(villeSlug),
  ])
  if (!location) notFound()

  const serviceName = resolveRgeServiceDisplayName(serviceSlug, service?.name)
  const villeName = location.name

  // Vague 1.1 — stratégie 410 : count=0 confirmé → notFound() côté page
  // (robots:noindex ici pour les ISR paths non-prerendered à cause du bug
  // Next.js 14.2 #69103 qui renvoie 200 sur notFound()+dynamicParams).
  // Fail-open strict : si DB transitoire KO (ok=false), on garde la page
  // indexable, ISR corrigera au prochain revalidate.
  // Bug 2 fix : avant de basculer noindex, vérifier si le fallback dept
  // sauve la page (count_ville=0 mais count_dept≥1 — typique data ADEME
  // mal alignée sur certaines variantes d'address_city).
  //
  // Asymétrie volontaire avec `/services/[s]/[v]` (threshold ≥3 via
  // hasDeptProviderFallback) : les pages /rge sont une vertical rare-supply
  // (50K artisans RGE sur ~970K total). Requérir 3+ noindexerait des pages
  // légitimes dans les départements à faible densité RGE (Lozère, Creuse…).
  // L'audit GSC 90j qui a justifié le seuil 3 portait sur les pages services
  // génériques, pas sur la vertical RGE qui a son propre intent (aides
  // financières YMYL) et un volume de search/click bien meilleur.
  const countStrict = await getRgeCountByServiceAndCityStrict(serviceSlug, villeSlug)
  let hasDeptFallback = false
  // 2026-05-05 — passage au CODE département (DB stocke `address_department='75'`,
  // pas `'Paris'` ; passer le nom rendait toutes les pages thin noindex).
  if (countStrict.ok && countStrict.count === 0 && location.department_code) {
    const deptListing = await getRgeProvidersByServiceAndDepartement(
      serviceSlug,
      location.department_code,
      { limit: 1 }
    ).catch(() => ({ providers: [], count: 0 }))
    hasDeptFallback = deptListing.count > 0
  }
  const isNoindex = countStrict.ok && countStrict.count === 0 && !hasDeptFallback

  // Sprint 0.1 — review prefix injecté en title pour CTR. Le fetch passe par
  // le même cache que la page (mêmes params), donc warm-cache hit → 0 coût DB
  // supplémentaire.
  const upgradeV2 = isRgeUpgradeV2()
  let aggregateRating: PageAggregateRating | null = null
  let count = 0
  if (upgradeV2) {
    const listing = await getRgeProvidersByServiceAndCity(serviceSlug, villeSlug, {
      limit: 50,
    })
    count = listing.count
    aggregateRating = buildAggregateRatingFromProviders(listing.providers)
  }

  // Sprint 2 — multi-variant first-fitting selector. Évite les ellipsis qui
  // bouffent le mot-clé secondaire ("Plombier RGE Saint-Just-en-Chaussée —…").
  // Chaque variant garde le signal RGE (mot-clé core de ce template).
  const reviewPrefix = aggregateRating
    ? `${aggregateRating.ratingValue}★ (${aggregateRating.reviewCount} avis) · `
    : ''
  // Sprint AI Wave E 2026-05-03 — compact prefix pour récupérer la review-prefix
  // CTR sur les combinaisons serviceName+villeName trop longues (Chauffagiste
  // Marseille, Pompe à chaleur Lyon, etc.). Sans ça, le selector tombait au
  // filet sans étoile en SERP. On n'injecte cette variante que si on a une
  // vraie note — sinon elle dupliquerait le filet.
  const compactPrefixVariant = aggregateRating
    ? [`${aggregateRating.ratingValue}★ · ${serviceName} RGE ${villeName}`]
    : []
  const svcLower = serviceName.toLowerCase()
  const titleVariants = upgradeV2
    ? [
        `${reviewPrefix}${count} ${svcLower} RGE ${villeName} · MaPrimeRénov’ 2026`,
        `${reviewPrefix}${serviceName} RGE ${villeName} — MaPrimeRénov’ 2026`,
        `${reviewPrefix}${serviceName} RGE ${villeName} — Aides 2026`,
        `${reviewPrefix}${serviceName} RGE ${villeName} 2026`,
        `${reviewPrefix}${serviceName} RGE ${villeName}`,
        ...compactPrefixVariant,
        `${serviceName} RGE ${villeName}`,
      ]
    : [
        `${serviceName} RGE à ${villeName} — Certifié MaPrimeRénov’`,
        `${serviceName} RGE ${villeName} — Certifiés 2026`,
        `${serviceName} RGE ${villeName} 2026`,
        `${serviceName} RGE ${villeName}`,
      ]
  const titleHash = hashCode(`rge-title-${serviceSlug}-${villeSlug}`)
  // Sprint 5 vague 4 (2026-05-04) : maxLen 41 → 60. Audit SEO 10-agents
  // 2026-04-28 : variants riches "review prefix + count + service + ville
  // + MaPrimeRénov 2026" tronqués à 41 → recall fréquent au filet sec
  // `${serviceName} RGE ${villeName}` qui perd review-prefix CTR. 60 =
  // maxLen 46 raw : +19 char brand suffix = ≤ 65 char rendu (Google SERP cutoff).
  // Au-delà tronqué visuel sans perte de signal sémantique (Google indexe l'intégralité du <title>).
  const title = selectFittingTitle(titleVariants, titleHash, 46)

  // FS-bait : count + price + "MaPrimeRénov' 11 000 €" structuré pour PAA financial.
  // pluralTerm corrige les noms composés ("pompes à chaleur" et non "pompe à chaleurs").
  const description = upgradeV2
    ? buildRenovationFsBait({
        providerCount: count,
        serviceName,
        pluralTerm: getNaturalTerm(serviceSlug).plural,
        locationName: villeName,
        year: 2026,
        priceRange: null,
        reviewSnippet: aggregateRating
          ? `Note ${aggregateRating.ratingValue}/5 sur ${aggregateRating.reviewCount} avis.`
          : undefined,
      })
    : `Artisans ${serviceName.toLowerCase()} certifiés RGE à ${villeName}. Éligibles MaPrimeRénov’, CEE et TVA 5,5 %. Qualifications vérifiées ADEME à jour.`

  const path = `/rge/${serviceSlug}/${villeSlug}`

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
      type: 'website',
      locale: 'fr_FR',
      url: `${SITE_URL}${path}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: getAlternates(path),
  }
}

export default async function RgeServiceCityPage({ params }: PageProps) {
  const { service: serviceSlug, ville: villeSlug } = await params

  if (!VALID_SLUG.test(serviceSlug) || !VALID_SLUG.test(villeSlug)) {
    notFound()
  }
  if (!isRgeAllowedService(serviceSlug)) {
    notFound()
  }

  const [service, location] = await Promise.all([
    getServiceBySlug(serviceSlug).catch((err: unknown) => {
      logger.error('rge_service_ville.service_render_error', err as Error, {
        route: 'rge/[service]/[ville]',
        service: serviceSlug,
        ville: villeSlug,
      })
      return null
    }),
    getLocationBySlug(villeSlug),
  ])
  if (!location) notFound()

  const serviceName = resolveRgeServiceDisplayName(serviceSlug, service?.name)
  const villeName = location.name

  let { providers, count } = await getRgeProvidersByServiceAndCity(serviceSlug, villeSlug, {
    limit: 50,
  })
  let isFallback = false

  // Vague 1.1 — 410 strategy : quand on confirme 0 providers via la variante
  // stricte (discrimine count=0 légitime d'une erreur transitoire), on déclenche
  // notFound() pour que Google oublie la page. Sur ISR+dynamicParams=true
  // (Next.js 14.2 bug #69103), cela rend not-found.tsx en HTTP 200 avec
  // robots:noindex,nofollow via la metadata du layout racine — même effet
  // d'oubli qu'un vrai 410 côté Google. Les routes pré-rendues retournent
  // un vrai 404. La migration Next.js 15 les fera toutes passer en 404 réel.
  // Bug 2 fix : avant le notFound(), tenter un fallback département. Quand
  // la data ADEME est mal alignée (variante d'address_city pour les grandes
  // villes type Paris/Lyon/Marseille), la query ville renvoie 0 mais le
  // département a bien des artisans. La page reste utile + indexable.
  const confirmedEmpty = await getRgeCountByServiceAndCityStrict(serviceSlug, villeSlug)
  if (confirmedEmpty.ok && confirmedEmpty.count === 0 && count === 0) {
    if (location.department_code) {
      const deptListing = await getRgeProvidersByServiceAndDepartement(
        serviceSlug,
        location.department_code,
        { limit: 50 }
      ).catch(() => ({ providers: [], count: 0 }))
      if (deptListing.count > 0) {
        providers = deptListing.providers
        count = deptListing.count
        isFallback = true
      } else {
        notFound()
      }
    } else {
      notFound()
    }
  }

  const path = `/rge/${serviceSlug}/${villeSlug}`
  const pageUrl = `${SITE_URL}${path}`

  // JSON-LD BreadcrumbList
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Artisans RGE', url: '/rge' },
    { name: serviceName, url: `/rge/${serviceSlug}` },
    { name: villeName, url: path },
  ])

  // JSON-LD ItemList (top 10 providers pour éviter un payload lourd)
  const itemListSchema = getItemListSchema({
    name: `${serviceName} RGE à ${villeName}`,
    description: `Artisans ${serviceName.toLowerCase()} certifiés RGE à ${villeName}`,
    url: path,
    items: providers.slice(0, 10).map((p, idx) => ({
      name: p.name,
      url: getArtisanUrl(p),
      position: idx + 1,
      rating: p.rating_average,
      reviewCount: p.review_count,
    })),
  })

  // Aggregate rating page-level : moyenne pondérée des providers listés qui
  // ont de vrais reviews. Si aucun review réel → null, pas d'étoiles SERP
  // (évite rich-snippet abuse). Sinon → étoiles visibles en SERP sur
  // toutes les 50K+ URLs /rge/[service]/[ville] éligibles.
  // Sprint 0.1 : fallback dept-level via review_stats_by_dept si pas d'avis
  // sur les providers visibles (couvre les villes secondaires où les avis
  // existent à l'échelle départementale mais pas sur les top 50 listés).
  // Garde-fou anti rich-snippet abuse : on n'injecte aggregateRating au
  // niveau dept QUE si on peut afficher au moins 1 avis réel sur la page
  // (cohérence SERP ↔ page, sinon Google flag mismatch).
  const upgradeV2 = isRgeUpgradeV2()
  let aggregateRating: PageAggregateRating | null = buildAggregateRatingFromProviders(providers)
  let deptStats: { review_count: number; avg_rating: number } | null = null
  let deptReviews: Awaited<ReturnType<typeof getTopReviewsByDept>> = []
  let fallbackDeptUsed = false
  if (upgradeV2 && !aggregateRating && location.department_code) {
    const [stats, reviews] = await Promise.all([
      getReviewStatsByDept(serviceSlug, location.department_code).catch((err: unknown) => {
        logger.error('rge_service_ville.review_stats_dept_error', err as Error, {
          route: 'rge/[service]/[ville]',
          service: serviceSlug,
          ville: villeSlug,
          dept: location.department_code,
        })
        return null
      }),
      getTopReviewsByDept(serviceSlug, location.department_code, 5).catch((err: unknown) => {
        logger.error('rge_service_ville.top_reviews_dept_error', err as Error, {
          route: 'rge/[service]/[ville]',
          service: serviceSlug,
          ville: villeSlug,
          dept: location.department_code,
        })
        return []
      }),
    ])
    if (stats && stats.review_count > 0 && stats.avg_rating > 0 && reviews.length > 0) {
      aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: stats.avg_rating.toFixed(1),
        reviewCount: String(stats.review_count),
        bestRating: '5',
        worstRating: '1',
      }
      deptStats = stats
      deptReviews = reviews
      fallbackDeptUsed = true
    }
  }

  // Collection LocalBusiness (schema.org ItemList ne porte pas areaServed)
  // Tier 40 — alignement triplet @id + inLanguage + isPartOf (Tiers 28-37).
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${pageUrl}#collection`,
    name: `${serviceName} RGE à ${villeName}`,
    url: pageUrl,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${SITE_URL}#website` },
    about: {
      '@type': 'Service',
      name: `${serviceName} certifié RGE`,
      areaServed: { '@type': 'City', name: villeName },
      provider: {
        '@type': 'Organization',
        '@id': `${SITE_URL}#organization`,
        name: 'ServicesArtisans',
        url: SITE_URL,
      },
      ...(aggregateRating && (!fallbackDeptUsed || deptReviews.length > 0) && { aggregateRating }),
    },
  }

  // Sprint 0.1 — Article + Speakable + dateModified : signal de fraîcheur
  // pour les ranking factors YMYL et compatible Google Assistant.
  // Audit Sprint 0.2 : `service` peut être null (DB KO + slug allowlisté) →
  // fallback sur `serviceSlug` pour ne pas produire `/og-rge-null.jpg`.
  // dateModified : snapshot mensuel pour éviter "fake freshness" (Google
  // déclasse les pages qui s'auto-update quotidiennement sans nouveau contenu).
  const monthYear = currentMonthYearFr()
  const monthlyAnchor = monthlyAnchorIso()
  // Tier 3 2026-05-04 — Person author + reviewedBy. sophie-martin couvre
  // l'angle rénovation énergétique transversal de la page (RGE = signal
  // gouvernemental + travaux d'efficacité). Reviewer claire-dubois apporte
  // la couche fiscale (MaPrimeRénov / CEE / éco-PTZ cumulables citées dans
  // les sections aides). Cross-review YMYL = signal QRG section 3.4.
  const RGE_AUTHOR = authors['sophie-martin']
  const RGE_REVIEWER = getReviewerForAuthor(RGE_AUTHOR)
  const articleSchema = upgradeV2
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        '@id': `${pageUrl}#article`,
        url: pageUrl,
        headline: `${count} ${serviceName} RGE à ${villeName} — Guide ${monthYear}`,
        description: `Trouver un artisan ${serviceName} RGE à ${villeName} : ${count} professionnels qualifiés, MaPrimeRénov' et CEE cumulables, devis gratuit.`,
        image: [`${SITE_URL}/og-rge-${serviceSlug}.jpg`, `${SITE_URL}/og-default.jpg`],
        datePublished: providers[0]?.created_at ?? '2026-01-01T00:00:00+02:00',
        dateModified: monthlyAnchor,
        inLanguage: 'fr-FR',
        isAccessibleForFree: true,
        articleSection: 'Rénovation énergétique',
        keywords: [
          serviceName,
          'RGE',
          villeName,
          "MaPrimeRénov'",
          'CEE',
          'Coup de pouce',
          'rénovation énergétique',
        ].join(', '),
        about: [
          { '@type': 'Service', name: `${serviceName} RGE` },
          { '@type': 'City', name: villeName },
          { '@type': 'Thing', name: "MaPrimeRénov'" },
          { '@type': 'Thing', name: "CEE — Certificats d'économies d'énergie" },
        ],
        ...spreadCitationsForTopics(
          `RGE ${serviceName} ${villeName} MaPrimeRénov CEE rénovation énergétique`
        ),
        author: RGE_AUTHOR
          ? {
              '@type': 'Person',
              name: RGE_AUTHOR.name,
              jobTitle: RGE_AUTHOR.role,
              url: `${SITE_URL}/equipe/${RGE_AUTHOR.slug}`,
              ...(RGE_AUTHOR.methodology &&
                RGE_AUTHOR.methodology.length > 0 && { skills: RGE_AUTHOR.methodology }),
            }
          : { '@type': 'Organization', name: 'ServicesArtisans', url: SITE_URL },
        ...(RGE_REVIEWER && { reviewedBy: getReviewedByPersonSchema(RGE_REVIEWER) }),
        publisher: {
          '@type': 'Organization',
          '@id': `${SITE_URL}#organization`,
          name: 'ServicesArtisans',
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/logo.png`,
          },
        },
        mainEntityOfPage: pageUrl,
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', '[data-speakable="true"]'],
        },
      }
    : null

  // YMYL E-E-A-T 2026-05-22 — Schema GovernmentService per-service.
  //
  // Avant : un seul `governmentServiceSchema` générique MaPrimeRénov'+France
  // Rénov' identique pour TOUS les services RGE (PAC, isolation, VMC,
  // fenêtres…). Détail des opérations CEE jamais émis.
  //
  // Après : whitelist stricte (`isServiceEligibleForAides`) + mapping
  // per-service (`getApplicableAidesForService`) — fragment URL unique par
  // (aide × service) pour empêcher la collision Knowledge Graph sur les
  // ~50K URLs RGE. Toute aide listée a un `serviceOperator` officiel et
  // ≥1 `sameAs` .gouv.fr / Légifrance. Aucun chiffre € ou kWh cumac inventé.
  //
  // Tous les services RGE de l'allowlist sont éligibles aux aides — la
  // double gate (`upgradeV2 && isServiceEligibleForAides`) est défense en
  // profondeur : si un slug est ajouté à RGE_ALLOWED_SERVICES mais oublié
  // dans aides-for-service, on émet 0 schema plutôt qu'un schema bidon.
  const governmentServiceSchemas: Array<Record<string, unknown>> =
    upgradeV2 && isServiceEligibleForAides(serviceSlug)
      ? getApplicableAidesForService(serviceSlug).map((aide) =>
          getGovernmentServiceSchema({
            name: aide.name,
            description: aide.description,
            url: `${pageUrl}#${aide.fragment}`,
            idFragment: aide.fragment,
            serviceType: aide.serviceType,
            category: aide.category,
            audience: aide.audience,
            temporalCoverage: aide.temporalCoverage,
            serviceOperator: aide.serviceOperator,
            sameAs: aide.sameAs,
          })
        )
      : []

  // Sprint 0.1 — FinancialProduct (cumul aides MaPrimeRénov’ + CEE + TVA 5,5 % + éco-PTZ).
  const financialProductSchema = upgradeV2
    ? getFinancialProductSchema({
        name: `Aides cumulées rénovation énergétique — ${serviceName.toLowerCase()} ${villeName}`,
        description: `Cumul des aides financières mobilisables à ${villeName} pour des travaux de ${serviceName.toLowerCase()} réalisés par un artisan RGE : MaPrimeRénov’ jusqu’à 11 000 €, prime CEE (standard ou bonification précarité), Éco-PTZ jusqu’à 50 000 € à taux zéro, TVA 5,5 %. Le total des aides ne peut excéder 100 % du coût TTC des travaux.`,
        url: pageUrl,
        category: 'Government Grant',
        feesAndCommissionsSpecification:
          "Aides versées sous condition d’éligibilité : logement de plus de 2 ans (CEE) ou de 15 ans (MaPrimeRénov'), artisan RGE à la date de signature du devis, parcours administratif respecté (engagement CEE AVANT signature du devis).",
      })
    : null

  const intro = buildIntroParagraph(serviceName, villeName, serviceSlug)
  const qualif = RGE_QUALIFICATION_LABELS[serviceSlug]
  // Seuls les slugs avec un répertoire src/app/(public)/guides/<slug> existant —
  // panneaux-solaires + renovation-energetique retirés (guides inexistants → 404).
  const hasGuide = ['pompe-a-chaleur', 'isolation-thermique'].includes(serviceSlug)

  // Content enrichi (2-3 paragraphes spécifiques service x ville)
  const villeData = getVilleBySlug(villeSlug)
  const enrichedParagraphs = villeData
    ? buildServiceCityParagraphs(serviceSlug, serviceName, villeData, count)
    : []

  // FAQ contextualisée service + ville
  const faqItems = villeData ? buildServiceCityFaq(serviceSlug, serviceName, villeData, count) : []
  const faqSchema = faqItems.length > 0 ? buildFaqJsonLd(faqItems) : null

  // Cross-linking villes : top cities du service (exclut la ville courante)
  const serviceStats = isRgeAllowedService(serviceSlug)
    ? await getRgeServiceStats(serviceSlug)
    : { total: 0, topCities: [] }
  const otherCities = serviceStats.topCities.filter((c) => c.slug !== villeSlug).slice(0, 5)

  // Sprint 0.1 — communeData pour le bloc Primes CEE (revenu_median +
  // climat_zone alimentent l’estimation tranche / économies). Null-safe.
  const communeData = upgradeV2
    ? await getCommuneBySlug(villeSlug).catch((err: unknown) => {
        logger.error('rge_service_ville.commune_lookup_error', err as Error, {
          route: 'rge/[service]/[ville]',
          service: serviceSlug,
          ville: villeSlug,
        })
        return null
      })
    : null

  // CEE ops éligibles pour conditionner l’affichage du bloc primes
  const eligibleCeeOps = upgradeV2 ? getCeeOpsForRgeService(serviceSlug) : []
  const showCeeBlock = upgradeV2 && eligibleCeeOps.length > 0

  // Sprint 2 maillage interne — câblage hub-spoke pour redistribuer PageRank
  // sur 50K URLs RGE. WHY : pages /rge/[s]/[v] = spokes profonds dans le graphe
  // interne, peu de liens entrants. Cross-intent + intent-aware groups donnent
  // 5-15 liens contextuels vers tarifs/avis/urgence/devis + ville/dept/aides.
  const maillageDeptCode = villeData?.departementCode
  const maillageDeptSlug = maillageDeptCode
    ? getDepartementByCode(maillageDeptCode)?.slug
    : undefined
  const problemSlugsForMaillage: string[] = []

  // TL;DR pré-FAQ — helper pure-function (testable, branches couvertes).
  const tldrBullets = upgradeV2
    ? buildRgeTldrBullets({
        serviceSlug,
        aggregateRating,
        fallbackDeptUsed,
        departmentName: location.department_name,
        eligibleCeeOpsCount: eligibleCeeOps.length,
      })
    : []

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonStringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonStringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonStringify(collectionSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonStringify(faqSchema) }}
        />
      )}
      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonStringify(articleSchema) }}
        />
      )}
      {governmentServiceSchemas.map((schema, idx) => (
        <script
          key={`govservice-${idx}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonStringify(schema) }}
        />
      ))}
      {financialProductSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonStringify(financialProductSchema) }}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: 'Artisans RGE', href: '/rge' },
            { label: serviceName, href: `/rge/${serviceSlug}` },
            { label: villeName },
          ]}
          className="mb-6"
        />

        {upgradeV2 && (
          <EnBrefBox
            summary={
              isFallback && location.department_name
                ? `${count} ${serviceName.toLowerCase()} certifiés RGE dans le département ${location.department_name}, intervenant à ${villeName}. Éligibles MaPrimeRénov’ 2026, CEE et TVA réduite 5,5 %. Qualifications vérifiées ADEME / France Rénov’.`
                : `Trouvez ${count} ${serviceName.toLowerCase()} certifiés RGE à ${villeName}, éligibles MaPrimeRénov’ 2026, CEE et TVA réduite 5,5 %. Devis gratuits sous 24h. Qualifications vérifiées ADEME / France Rénov’.`
            }
            keyPoints={[
              isFallback && location.department_name
                ? `${count} artisans RGE actifs dans le département ${location.department_name}`
                : `${count} artisans RGE actifs à ${villeName}`,
              'Éligible MaPrimeRénov’ jusqu’à 11 000 €',
              'Cumul CEE + TVA 5,5 % possible',
              'Devis gratuit, réponse 24h',
            ]}
          />
        )}

        <header className="mb-8">
          <h1
            data-speakable="true"
            className="text-3xl md:text-4xl font-bold text-charcoal-900 font-heading"
          >
            {upgradeV2 ? (
              isFallback && location.department_name ? (
                <>
                  {serviceName} RGE à {villeName} — département {location.department_name} (
                  {monthYear})
                </>
              ) : (
                <>
                  {count} {serviceName.toLowerCase()} RGE {villeName} ({monthYear})
                </>
              )
            ) : (
              <>
                {serviceName} certifié RGE à {villeName}
              </>
            )}
          </h1>
          {deptStats && deptStats.review_count >= 3 && (
            <div className="mt-2">
              <SocialProofBadge
                average={deptStats.avg_rating}
                count={deptStats.review_count}
                label={
                  location.department_name
                    ? `avis vérifiés en ${location.department_name}`
                    : 'avis vérifiés'
                }
                size="md"
              />
            </div>
          )}
          <p className="mt-3 text-charcoal-600">
            {isFallback && location.department_name ? (
              <>
                {count} {serviceName.toLowerCase()} RGE {count > 1 ? 'actifs' : 'actif'} dans le
                département {location.department_name}, intervenant à {villeName}
              </>
            ) : (
              <>
                {count} {serviceName.toLowerCase()} RGE {count > 1 ? 'actifs' : 'actif'} à{' '}
                {villeName}
              </>
            )}
          </p>
          {upgradeV2 && (
            <p className="mt-2 text-sm text-charcoal-500">
              Auteur :{' '}
              <span className="font-medium text-charcoal-700">la rédaction ServicesArtisans</span>
              {' · '}
              Mis à jour le{' '}
              <time dateTime={monthlyAnchor.slice(0, 10)}>
                {new Date(monthlyAnchor).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  timeZone: 'Europe/Paris',
                })}
              </time>
            </p>
          )}
          <Link
            href={buildDevisHref(serviceSlug, villeName)}
            className="inline-flex items-center gap-2 mt-4 bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
          >
            <FileText className="w-5 h-5" aria-hidden="true" />
            Demander un devis RGE
          </Link>
        </header>

        <section className="mb-8 text-charcoal-700 leading-relaxed space-y-4">
          <p>{intro}</p>
          {enrichedParagraphs.map((para, i) => (
            <p key={`para-${i}-${para.slice(0, 20)}`}>{para}</p>
          ))}
        </section>

        {/* Funnel conversion — MiniSimulateurInline placé après l'intro pour
            capter le funnel rénovation énergétique avant le scroll-deep. Le
            SimulateurCTA banner existant reste en footer (showCeeBlock).
            Tous les services RGE sont par nature "renovation intent" :
            pas de gating supplémentaire requis. Injecté 2026-05-22. */}
        <section className="mb-8">
          <MiniSimulateurInline
            service={serviceName.toLowerCase()}
            ville={villeName}
            source="rge_service_ville"
            variant="inline"
          />
        </section>

        {/* DevisQuickForm — 4-champs friction-free, complémentaire au mini-
            simulateur ci-dessus (l'un convertit sur aides, l'autre sur devis).
            NEUTRE artisan : pas de provider ciblé → règle "no CTA devis sur
            fiches unclaimed" préservée. */}
        <section className="mb-8">
          <DevisQuickForm
            defaultService={serviceSlug}
            defaultPostalCode={location.postal_code ?? undefined}
            defaultVille={villeName}
            source="rge_service_ville_quick"
            heading={`Recevez 3 devis ${serviceName} RGE à ${villeName} en 24h`}
          />
        </section>

        <section className="mb-6 rounded-lg border border-accent-200 bg-accent-50 p-4 text-sm text-accent-900">
          <strong className="font-semibold">Source officielle&nbsp;:</strong> Les données de
          certification RGE affichées sont sourcées depuis{' '}
          <a
            href="https://data.gouv.fr/fr/datasets/liste-des-entreprises-rge-2/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-accent-700"
          >
            data.gouv.fr
          </a>{' '}
          — ADEME / France Rénov’ (Licence Etalab 2.0).
          {qualif && (
            <>
              {' '}
              Qualification de référence pour ce métier&nbsp;: <strong>{qualif.label}</strong> (
              {qualif.organisme}).
            </>
          )}
        </section>

        {isFallback && location.department_name && (
          <section
            role="note"
            className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
          >
            <strong className="font-semibold">À noter&nbsp;:</strong> aucun artisan RGE n&apos;est
            actuellement référencé directement sur la commune de {villeName}. Nous affichons les{' '}
            {count} artisan{count > 1 ? 's' : ''} RGE actif{count > 1 ? 's' : ''} dans le
            département <strong>{location.department_name}</strong>, susceptibles d&apos;intervenir
            à {villeName}.
          </section>
        )}

        <section className="mb-12">
          {count === 0 ? (
            <div className="rounded-lg border border-sand-300 bg-sand-50 p-8 text-center">
              <p className="text-charcoal-700">
                Aucun {serviceName.toLowerCase()} RGE actif actuellement référencé à {villeName}.
              </p>
              <p className="mt-2 text-sm text-charcoal-500">
                Consultez{' '}
                <Link
                  href={`/services/${serviceSlug}/${villeSlug}`}
                  className="text-clay-500 underline"
                >
                  tous les {serviceName.toLowerCase()} à {villeName}
                </Link>{' '}
                ou{' '}
                <Link href={`/artisans-rge/${villeSlug}`} className="text-clay-500 underline">
                  tous les artisans RGE à {villeName}
                </Link>
                .
              </p>
            </div>
          ) : (
            <ProviderList providers={providers} totalCount={count} />
          )}
        </section>

        <section className="mb-12 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-100 rounded-2xl p-6 md:p-8 text-center">
          <p className="font-heading font-bold text-lg md:text-xl text-charcoal-900 mb-2">
            Besoin d&apos;un {serviceName.toLowerCase()} RGE à {villeName} ?
          </p>
          <p className="text-charcoal-600 text-sm mb-4">
            Recevez un devis gratuit et sans engagement en 2 minutes
          </p>
          <Link
            href={buildDevisHref(serviceSlug, villeName)}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all text-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
          >
            <FileText className="w-5 h-5" aria-hidden="true" />
            Obtenir mon devis gratuit
          </Link>
        </section>

        <section aria-labelledby="cross-links" className="mb-12">
          <h2 id="cross-links" className="text-xl font-bold text-charcoal-900 font-heading mb-4">
            Aller plus loin
          </h2>
          <ul className="grid gap-3 md:grid-cols-2">
            <li>
              <Link
                href={`/artisans-rge/${villeSlug}`}
                className="block rounded-lg border border-sand-300 p-4 hover:border-clay-400 hover:bg-clay-50 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              >
                <div className="font-semibold text-charcoal-900">
                  Tous les artisans RGE à {villeName}
                </div>
                <div className="text-sm text-charcoal-500">Tous métiers énergétiques confondus</div>
              </Link>
            </li>
            <li>
              <Link
                href={`/services/${serviceSlug}/${villeSlug}`}
                className="block rounded-lg border border-sand-300 p-4 hover:border-clay-400 hover:bg-clay-50 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              >
                <div className="font-semibold text-charcoal-900">
                  Tous les {serviceName.toLowerCase()} à {villeName}
                </div>
                <div className="text-sm text-charcoal-500">
                  RGE ou non, l’annuaire complet du métier
                </div>
              </Link>
            </li>
            <li>
              <Link
                href="/guides/artisan-rge"
                className="block rounded-lg border border-sand-300 p-4 hover:border-clay-400 hover:bg-clay-50 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              >
                <div className="font-semibold text-charcoal-900">
                  Guide&nbsp;: comprendre la certification RGE
                </div>
                <div className="text-sm text-charcoal-500">Aides, labels, vérification</div>
              </Link>
            </li>
            {hasGuide && (
              <li>
                <Link
                  href={`/guides/${serviceSlug}`}
                  className="block rounded-lg border border-sand-300 p-4 hover:border-clay-400 hover:bg-clay-50 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                >
                  <div className="font-semibold text-charcoal-900">
                    Guide métier&nbsp;: {serviceName.toLowerCase()}
                  </div>
                  <div className="text-sm text-charcoal-500">Prix, aides, bonnes pratiques</div>
                </Link>
              </li>
            )}
          </ul>
        </section>

        {otherCities.length > 0 && (
          <section aria-labelledby="other-cities" className="mb-12">
            <h2 id="other-cities" className="text-xl font-bold text-charcoal-900 font-heading mb-2">
              {serviceName} RGE dans d’autres villes
            </h2>
            <p className="text-sm text-charcoal-500 mb-4">
              Les villes où les {serviceName.toLowerCase()} RGE sont les plus nombreux.
            </p>
            <div className="flex flex-wrap gap-2">
              {otherCities.map((c) => (
                <Link
                  key={c.slug}
                  href={`/rge/${serviceSlug}/${c.slug}`}
                  className="inline-flex items-center px-4 py-2.5 rounded-full border border-sand-300 text-sm text-charcoal-700 hover:border-accent-400 hover:text-accent-700 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                >
                  {serviceName} RGE à {c.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {upgradeV2 && tldrBullets.length > 0 && (
          <section aria-labelledby="essentiel-rge" className="mb-10">
            <h2 id="essentiel-rge" className="sr-only">
              L’essentiel RGE {serviceName.toLowerCase()} à {villeName}
            </h2>
            <TldrBlock bullets={tldrBullets} />
          </section>
        )}

        {faqItems.length > 0 && (
          <section aria-labelledby="faq" className="mb-12">
            <h2
              id="faq"
              className="text-xl md:text-2xl font-bold text-charcoal-900 font-heading mb-6"
            >
              Questions fréquentes : {serviceName.toLowerCase()} RGE à {villeName}
            </h2>
            <div className="space-y-3">
              {faqItems.map((item, i) => (
                <details
                  key={`faq-${i}-${item.question.slice(0, 20)}`}
                  className="group rounded-lg border border-sand-300 bg-white p-5 open:border-accent-300 open:shadow-sm"
                >
                  <summary className="cursor-pointer list-none font-semibold text-charcoal-900 flex items-start justify-between gap-4">
                    <span>{item.question}</span>
                    <span
                      className="text-accent-600 group-open:rotate-45 transition-transform text-xl leading-none"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-charcoal-600 leading-relaxed">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {fallbackDeptUsed && location.department_name && (
          <section className="mb-12">
            <ReviewsDeptBlock
              serviceSlug={serviceSlug}
              serviceName={serviceName}
              departmentName={location.department_name}
              stats={deptStats}
              reviews={deptReviews}
            />
          </section>
        )}

        {showCeeBlock && (
          <Suspense
            fallback={
              <div
                aria-busy="true"
                aria-label="Chargement des primes CEE…"
                className="animate-pulse bg-sand-100 h-32 rounded-xl mb-12"
              />
            }
          >
            <section className="mb-12">
              <PrimesCEEBlock
                serviceSlug={serviceSlug}
                serviceName={serviceName}
                villeName={villeName}
                communeData={communeData}
              />
            </section>
          </Suspense>
        )}

        {/* SimulateurCTA — bridge funnel RGE → /simulateur-aides-renovation.
            WHY : la page RGE expose les artisans + les primes CEE éligibles,
            mais ne dirigeait jamais vers le simulateur agrégé (MaPrimeRénov'
            + CEE + Coup de pouce + TVA 5,5 %). Audit funnel 2026-04-30 :
            seul CTA présent était /devis. Le simulateur est l'étape naturelle
            entre "voir les primes" et "demander un devis" — surtout pour
            les services renovation-énergétique éligibles (showCeeBlock=true). */}
        {upgradeV2 && showCeeBlock && (
          <section className="mb-12">
            <SimulateurCTA serviceSlug={serviceSlug} city={villeName} variant="banner" />
          </section>
        )}

        {/* Sprint 4 — AEO + intelligence locale pour 50K URLs RGE.
            Câble les composants AEO/local (jamais utilisés ici) qui tirent
            communeData déjà chargée. AEO = LLM citation, blocs locaux =
            featured snippets + CTR. */}
        <section aria-labelledby="reponse-rapide-rge" className="mb-8">
          <h2 id="reponse-rapide-rge" className="sr-only">
            Réponse rapide pour {serviceName} RGE à {villeName}
          </h2>
          <AEOAnswerBlock
            serviceSlug={serviceSlug}
            serviceName={serviceName}
            villeName={villeName}
            departmentName={location.department_name ?? villeData?.departement ?? villeName}
            providerCount={count}
            avgRating={aggregateRating ? Number(aggregateRating.ratingValue) : null}
            priceRange={null}
            communePopulation={communeData?.population ?? null}
          />
        </section>

        {/* Contexte commune — gated by data uniqueness (Aleyda rule).
            Les autres blocs intelligence locale (DPE / risques géo / calendrier
            saisonnier / user-question) sont retirés de la version slim : ils
            empilaient ~6-8K mots redondants avec /villes/[ville]. Couverts en
            schema FAQ + AEO ci-dessus. */}
        {communeData && (
          <section className="mb-8">
            <CommuneContextBlock
              communeData={communeData}
              serviceName={serviceName}
              villeName={villeName}
            />
          </section>
        )}

        {/* Maillage interne — bloc unique, PageRank sculpting */}
        <section className="mb-12">
          <MaillageInterneBlock
            serviceSlug={serviceSlug}
            serviceName={serviceName}
            villeSlug={villeSlug}
            villeName={villeName}
            departementSlug={maillageDeptSlug}
            departementName={location.department_name ?? undefined}
            regionName={villeData?.region}
            currentIntent="services"
            hasCEE={showCeeBlock}
            problemSlugs={problemSlugsForMaillage}
          />
        </section>

        <section className="mb-12 py-12 bg-charcoal-950 rounded-2xl text-center text-white">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3">
            Trouvez votre {serviceName.toLowerCase()} RGE à {villeName}
          </h2>
          <p className="text-charcoal-400 mb-6 max-w-xl mx-auto">
            Devis gratuit en 2 min — éligible MaPrimeRénov&apos;, CEE et TVA 5,5 %
          </p>
          <Link
            href={buildDevisHref(serviceSlug, villeName)}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all text-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
          >
            <FileText className="w-5 h-5" aria-hidden="true" />
            Devis gratuit en 2 min
          </Link>
        </section>
      </div>

      <FinalCtaSection
        heading={`Comparez 3 artisans RGE ${serviceName.toLowerCase()} à ${villeName}`}
        description="Devis gratuit en moins de 24h. Éligible MaPrimeRénov' et CEE."
        primaryCta={{
          label: 'Demander mes devis',
          href: `/simulateur-aides-renovation?service=${serviceSlug}&cp=${location.postal_code ?? ''}`,
          intent: 'final-devis-rge',
        }}
        secondaryCta={{
          label: 'Voir les artisans RGE',
          href: `/services/${serviceSlug}/${villeSlug}`,
        }}
        accent="blue"
        trustLine={
          count > 0
            ? `${count} artisan${count > 1 ? 's' : ''} RGE certifié${count > 1 ? 's' : ''} • Source : Registre RGE ADEME • RGPD`
            : 'Artisans RGE certifiés • Source : Registre RGE ADEME • RGPD'
        }
      />

      <StickyMobileCTA
        serviceSlug={serviceSlug}
        cityName={villeName}
        citySlug={villeSlug}
        ctaText="Devis RGE gratuit"
        providerCount={count > 0 ? count : undefined}
      />
    </main>
  )
}
