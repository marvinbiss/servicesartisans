import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import CeeCTA from '@/components/cee/CeeCTA'
import Breadcrumb from '@/components/Breadcrumb'
import ProviderList from '@/components/ProviderList'
import JsonLd from '@/components/JsonLd'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import AEOAnswerBlock from '@/components/seo/AEOAnswerBlock'
import CommuneContextBlock from '@/components/seo/CommuneContextBlock'
import ContexteDPEBlock from '@/components/seo/ContexteDPEBlock'
import RisquesGeoBlock from '@/components/seo/RisquesGeoBlock'
import CalendrierSaisonnierBlock from '@/components/seo/CalendrierSaisonnierBlock'
import UserQuestionBlock from '@/components/seo/UserQuestionBlock'
import { getCommuneBySlug } from '@/lib/data/commune-data'
import { logger } from '@/lib/logger'
import {
  villes as staticVilles,
  getVilleBySlug,
  getDepartementByCode,
  services,
} from '@/lib/data/france'
import MaillageInterneBlock from '@/components/seo/MaillageInterneBlock'
import VerticalCrossLinks from '@/components/seo/VerticalCrossLinks'
import TopCitiesGrid from '@/components/seo/TopCitiesGrid'
import { authors, getReviewerForAuthor } from '@/lib/data/authors'
import { SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import {
  getBreadcrumbSchema,
  getItemListSchema,
  getFinancialProductSchema,
  getGovernmentServiceSchema,
  getReviewedByPersonSchema,
} from '@/lib/seo/jsonld'
import { spreadCitationsForTopics } from '@/lib/seo/authoritative-citations'
import { buildAggregateRatingFromProviders } from '@/lib/seo/aggregate-rating'
import { currentMonthYearFr, monthlyAnchorIso } from '@/lib/seo/sprint-helpers'
import { getArtisanUrl } from '@/lib/utils'
import { SITEMAP_CITY_COUNT_TIER2 } from '@/lib/seo/sitemap-config'
import {
  getCeeOperationByCode,
  getCeeOperations,
  CEE_DOMAINE_LABELS,
  type CeeOperation,
} from '@/lib/cee/catalogue'
import {
  getCeeProvidersByOperationAndCity,
  getCeeProviderCountByOperationAndCity,
  getCeeTopCitiesByOperation,
} from '@/lib/cee/listings'
import {
  buildCeeOperationCityParagraphs,
  buildCeeOperationCityFaq,
  buildCeeFaqJsonLd,
} from '@/lib/cee/pseo-content'
import {
  RGE_ALLOWED_SERVICES,
  RGE_QUALIFICATION_LABELS,
  type RgeAllowedService,
} from '@/lib/rge/service-city-listings'
import { getRgeServicesForCeeOp } from '@/lib/rge/service-guides-map'

// ISR quotidien — le catalogue bouge rarement, les providers RGE sont
// resynchronisés hebdo côté ADEME.
export const revalidate = 86400
export const dynamicParams = true

const VALID_OP = /^[A-Z]{2,3}-[A-Z]{2}-\d{3}$/i
const VALID_SLUG = /^[a-z0-9][a-z0-9-]{0,78}[a-z0-9]$/

/**
 * generateStaticParams — 19 opérations × top 500 villes (Tier 2).
 * Les opérations actives sont résolues à la volée pour rester alignées
 * avec la DB (ajout/retrait d'une fiche DGEC → re-build couvre les nouvelles).
 */
export async function generateStaticParams(): Promise<Array<{ operation: string; ville: string }>> {
  const operations = await getCeeOperations().catch(() => [])
  // Fallback hardcodé si DB down au build — on pré-rend les codes du seed
  // migration 383 pour que l'ISR on-demand puisse prendre le relais.
  // Fiches abrogées retirées : BAR-TH-106 (01/01/2024 → BAR-TH-171),
  // BAR-TH-160 (01/08/2025), BAR-TH-164 (→ BAR-TH-174). Ajouts : BAR-TH-172,
  // 174, 175, 177.
  const codes: string[] =
    operations.length > 0
      ? operations.map((op) => op.code.toLowerCase())
      : [
          'bar-en-101',
          'bar-en-102',
          'bar-en-103',
          'bar-en-104',
          'bar-en-108',
          'bar-th-112',
          'bar-th-113',
          'bar-th-125',
          'bar-th-127',
          'bar-th-129',
          'bar-th-143',
          'bar-th-148',
          'bar-th-159',
          'bar-th-161',
          'bar-th-171',
          'bar-th-172',
          'bar-th-173',
          'bar-th-174',
          'bar-th-175',
          'bar-th-177',
          'bar-se-104',
        ]

  // Pre-render budget : top 500 villes (TIER2). Les 500 suivantes émises au
  // sitemap (V3 #2 SITEMAP_CEE_CITY_COUNT=1000) sont générées via ISR
  // on-demand au premier hit Googlebot pour éviter d'exploser le build time.
  const topCities = staticVilles.slice(0, SITEMAP_CITY_COUNT_TIER2)
  return codes.flatMap((operation) => topCities.map((v) => ({ operation, ville: v.slug })))
}

interface PageProps {
  params: Promise<{ operation: string; ville: string }>
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen - 1).replace(/\s+\S*$/, '') + '…'
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { operation: rawOp, ville: villeSlug } = await params
  const opCode = rawOp.toUpperCase()
  const urlCode = opCode.toLowerCase()

  if (!VALID_OP.test(opCode) || !VALID_SLUG.test(villeSlug)) notFound()

  const [operation, ville] = await Promise.all([
    getCeeOperationByCode(opCode),
    Promise.resolve(getVilleBySlug(villeSlug)),
  ])
  if (!ville) notFound()

  // Fail-open : si DB down ou op inconnue, on rend quand même un shell
  // (ISR corrigera). Dans ce cas on noindex et on affiche le fallback.
  const opName = operation?.nom ?? `Prime CEE ${opCode}`
  const villeName = ville.name

  const providerCount = await getCeeProviderCountByOperationAndCity(opCode, villeSlug)
  const isNoindex = providerCount === 0 || !operation

  const title = truncate(`Prime CEE ${opName} à ${villeName} — artisans RGE`, 60)
  const description = truncate(
    `${opName} à ${villeName} : artisans RGE certifiés, prime CEE mobilisable, cumul MaPrimeRénov’ et TVA 5,5 %. Vérification ADEME.`,
    158
  )
  const path = `/cee/${urlCode}/${villeSlug}`

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

export default async function CeeOperationCityPage({ params }: PageProps) {
  const { operation: rawOp, ville: villeSlug } = await params
  const opCode = rawOp.toUpperCase()
  const urlCode = opCode.toLowerCase()

  if (!VALID_OP.test(opCode) || !VALID_SLUG.test(villeSlug)) notFound()

  const ville = getVilleBySlug(villeSlug)
  if (!ville) notFound()

  const operation: CeeOperation | null = await getCeeOperationByCode(opCode)
  const villeName = ville.name
  const path = `/cee/${urlCode}/${villeSlug}`

  // Fail-open strict : si operation null, on rend un shell explicatif neutre.
  // Metadata aura déjà posé un noindex.
  if (!operation) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1
            data-speakable="true"
            className="text-3xl font-bold text-charcoal-900 font-heading mb-4"
          >
            Prime CEE {opCode} à {villeName}
          </h1>
          <p className="text-charcoal-700">
            Cette opération CEE n’est pas actuellement disponible dans notre catalogue. Consultez le{' '}
            <Link href="/cee" className="text-accent-700 underline">
              hub des primes CEE
            </Link>{' '}
            pour découvrir les 19 opérations résidentielles couvertes.
          </p>
        </div>
      </main>
    )
  }

  const [providers, communeData] = await Promise.all([
    getCeeProvidersByOperationAndCity(opCode, villeSlug, { limit: 50 }),
    getCommuneBySlug(villeSlug).catch((err: unknown) => {
      logger.error('cee_operation_ville.commune_lookup_error', err as Error, {
        route: 'cee/[operation]/[ville]',
        operation: opCode,
        ville: villeSlug,
      })
      return null
    }),
  ])
  const count = providers.length

  // Sprint 4 — proxy service slug pour les composants AEO/local qui exigent
  // un serviceSlug. CEE op → premier service RGE équivalent (fallback
  // renovation-energetique). Réutilisé par MaillageInterneBlock + AEO blocks.
  const proxyRgeServices = getRgeServicesForCeeOp(operation.code)
  const sprint4ProxyServiceSlug = proxyRgeServices[0] ?? 'renovation-energetique'
  const sprint4ProxyService = services.find((s) => s.slug === sprint4ProxyServiceSlug)
  const sprint4ProxyServiceName = sprint4ProxyService?.name ?? 'Rénovation énergétique'

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Primes CEE', url: '/cee' },
    { name: operation.nom, url: `/cee/${urlCode}` },
    { name: villeName, url: path },
  ])

  const itemListSchema =
    count > 0
      ? getItemListSchema({
          name: `${operation.nom} à ${villeName}`,
          description: `Artisans RGE certifiés pour ${operation.nom.toLowerCase()} à ${villeName}`,
          url: path,
          items: providers.slice(0, 10).map((p, idx) => ({
            name: p.name,
            url: getArtisanUrl(p),
            position: idx + 1,
            rating: p.rating_average ?? undefined,
            reviewCount: p.review_count ?? undefined,
          })),
        })
      : null

  // Aggregate rating page-level : moyenne pondérée des providers listés.
  // Null si aucun review réel (évite rich-snippet abuse). Sinon, déclenche
  // les étoiles SERP sur les URLs /cee/[operation]/[ville] éligibles.
  const aggregateRating = buildAggregateRatingFromProviders(providers)

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Prime CEE ${operation.nom} à ${villeName}`,
    url: `${SITE_URL}${path}`,
    about: {
      '@type': 'Service',
      name: `${operation.nom} (CEE ${operation.code})`,
      areaServed: { '@type': 'City', name: villeName },
      provider: {
        '@type': 'Organization',
        name: 'ServicesArtisans',
        url: SITE_URL,
      },
      ...(aggregateRating && { aggregateRating }),
    },
  }

  const officialSources: string[] = [
    'https://www.ecologie.gouv.fr/politiques-publiques/certificats-deconomies-denergie',
    'https://france-renov.gouv.fr/aides/cee',
  ]
  if (operation.url_fiche_officielle) officialSources.unshift(operation.url_fiche_officielle)

  const governmentServiceSchema = getGovernmentServiceSchema({
    name: `Prime CEE ${operation.code} — ${operation.nom} à ${villeName}`,
    description: `Opération CEE ${operation.code} disponible à ${villeName}. Aide financière obligatoire versée par les vendeurs d'énergie (loi POPE 2005, période P6 2026-2030) pour les travaux ${operation.nom.toLowerCase()}.`,
    url: `${SITE_URL}${path}`,
    serviceType: 'Aide financière à la rénovation énergétique',
    audience: operation.precarite_eligible
      ? 'Propriétaires et locataires, bonification pour ménages en précarité énergétique'
      : 'Propriétaires et locataires de logements résidentiels',
    temporalCoverage: '2026-01-01/2030-12-31',
    sameAs: officialSources,
  })

  const financialProductSchema = getFinancialProductSchema({
    name: `Prime CEE ${operation.code} à ${villeName}`,
    description:
      `Montant de prime ${operation.nom} à ${villeName} variable selon la zone climatique, la surface ou la puissance installée, le profil de revenus et le cours du MWh cumac. ${operation.classique_eligible ? 'Tous ménages éligibles.' : ''}${operation.precarite_eligible ? ' Bonification précarité disponible.' : ''}`.trim(),
    url: `${SITE_URL}${path}`,
    category: 'Government Grant',
    feesAndCommissionsSpecification:
      "Prime versée par l'obligé ou le délégataire. Pas de frais à la charge du bénéficiaire. Cumulable avec MaPrimeRénov', TVA 5,5 % et éco-PTZ.",
  })

  const enrichedParagraphs = buildCeeOperationCityParagraphs(operation, ville)
  const faqItems = buildCeeOperationCityFaq(operation, ville, count)
  const faqSchema = buildCeeFaqJsonLd(faqItems)

  // Sprint ULTRA — signal YMYL freshness + Speakable (Google Assistant).
  // dateModified : snapshot mensuel pour éviter "fake freshness" (Google
  // déclasse les pages qui s'auto-update quotidiennement sans nouveau contenu).
  const monthYear = currentMonthYearFr()
  const monthlyAnchor = monthlyAnchorIso()
  const AUTHOR = authors['claire-dubois']
  const REVIEWER = getReviewerForAuthor(AUTHOR)
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${SITE_URL}${path}#article`,
    url: `${SITE_URL}${path}`,
    headline: `Prime CEE ${operation.code} ${operation.nom} à ${villeName} — Guide ${monthYear}`,
    description: `Prime CEE ${operation.code} ${operation.nom} à ${villeName} : conditions, montants, artisans RGE certifiés et démarche pas à pas.`,
    image: [`${SITE_URL}/og-cee-${operation.code.toLowerCase()}.jpg`, `${SITE_URL}/og-default.jpg`],
    datePublished: '2026-01-01T00:00:00+02:00',
    dateModified: monthlyAnchor,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    articleSection: "Certificats d'économies d'énergie (CEE)",
    keywords: [
      `Prime CEE ${operation.code}`,
      operation.nom,
      villeName,
      'CEE',
      'rénovation énergétique',
      ...(operation.coup_de_pouce ? ['Coup de pouce'] : []),
      ...(operation.rge_qualifications_requises[0]
        ? [operation.rge_qualifications_requises[0]]
        : []),
    ].join(', '),
    about: [
      { '@type': 'Thing', name: `Opération CEE ${operation.code}` },
      { '@type': 'Thing', name: operation.nom },
      { '@type': 'City', name: villeName },
      { '@type': 'Thing', name: "Certificats d'économies d'énergie" },
    ],
    ...spreadCitationsForTopics(
      `CEE ${operation.code} ${operation.nom} ${villeName} ${operation.coup_de_pouce ? 'coup de pouce' : ''}`
    ),
    author: AUTHOR
      ? {
          '@type': 'Person',
          name: AUTHOR.name,
          jobTitle: AUTHOR.role,
          url: `${SITE_URL}/equipe/${AUTHOR.slug}`,
          ...(AUTHOR.methodology &&
            AUTHOR.methodology.length > 0 && { skills: AUTHOR.methodology }),
        }
      : { '@type': 'Organization', name: 'ServicesArtisans', url: SITE_URL },
    ...(REVIEWER && { reviewedBy: getReviewedByPersonSchema(REVIEWER) }),
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: 'ServicesArtisans',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: `${SITE_URL}${path}`,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  // TL;DR pré-FAQ — capture Featured Snippet sur les requêtes prime CEE.
  const tldrBullets: string[] = [
    `Prime CEE ${operation.code} pour ${operation.nom.toLowerCase()} à ${villeName}, versée par les vendeurs d'énergie (loi POPE).`,
    operation.precarite_eligible
      ? `Bonification précarité énergétique : montant majoré pour les ménages modestes et très modestes.`
      : `Tous ménages éligibles, sans condition de revenus.`,
    operation.coup_de_pouce
      ? `Coup de pouce ${operation.coup_de_pouce_charte ?? operation.code} : barème renforcé activé en 2026.`
      : `Cumulable avec MaPrimeRénov' et la TVA réduite à 5,5 %.`,
    `Artisan RGE obligatoire (qualif. ${operation.rge_qualifications_requises[0] ?? 'Qualibat'}). Engagement avant signature du devis.`,
  ]

  // Cross-linking villes : top autres villes pour la même opération
  const topCities = await getCeeTopCitiesByOperation(opCode)
  const otherCities = topCities.filter((c) => c.slug !== villeSlug).slice(0, 5)

  // Cross-linking opérations du même domaine
  const allOps = await getCeeOperations()
  const sameDomainOps = allOps
    .filter((op) => op.domaine === operation.domaine && op.code !== operation.code)
    .slice(0, 3)

  const domaineLabel = CEE_DOMAINE_LABELS[operation.domaine]?.label || operation.domaine

  // Primary source: DB seed (migration 383). Fallback: static mapping
  // CEE_CODE_TO_RGE_SERVICES — extended post-seed with 5 new codes (BAR-TH-172,
  // BAR-TH-174, BAR-TH-143, BAR-TH-159, BAR-EN-108). Dedup and filter to allowed.
  const dbSlugs = operation.services_slugs ?? []
  const helperSlugs = dbSlugs.length === 0 ? getRgeServicesForCeeOp(operation.code) : []
  const mergedSlugs = Array.from(new Set<string>([...dbSlugs, ...helperSlugs]))
  const rgeServices: RgeAllowedService[] = mergedSlugs.filter((slug): slug is RgeAllowedService =>
    (RGE_ALLOWED_SERVICES as readonly string[]).includes(slug)
  )

  const jsonLdItems: Record<string, unknown>[] = [breadcrumbSchema]
  if (itemListSchema) jsonLdItems.push(itemListSchema as Record<string, unknown>)
  jsonLdItems.push(
    collectionSchema as Record<string, unknown>,
    articleSchema as Record<string, unknown>,
    governmentServiceSchema as Record<string, unknown>,
    financialProductSchema as Record<string, unknown>
  )
  if (faqSchema) jsonLdItems.push(faqSchema as Record<string, unknown>)

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={jsonLdItems} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: 'Primes CEE', href: '/cee' },
            { label: operation.nom, href: `/cee/${urlCode}` },
            { label: villeName },
          ]}
          className="mb-6"
        />

        <EnBrefBox
          summary={
            count > 0
              ? `${count} artisan${count > 1 ? 's' : ''} RGE certifié${count > 1 ? 's' : ''} pour la prime CEE ${operation.code} (${operation.nom.toLowerCase()}) à ${villeName}. Cumul MaPrimeRénov' + TVA 5,5 % possible. Vérification ADEME.`
              : `Catalogue national de l'opération CEE ${operation.code} (${operation.nom.toLowerCase()}) à ${villeName}. Devis gratuit, prime versée par les vendeurs d'énergie.`
          }
          keyPoints={[
            `Fiche officielle DGEC ${operation.code} — ${domaineLabel.toLowerCase()}`,
            operation.precarite_eligible
              ? 'Bonifié pour ménages en précarité énergétique'
              : 'Tous ménages éligibles, sans condition de revenus',
            "Cumul MaPrimeRénov' + TVA 5,5 % + éco-PTZ possible",
            'Artisan RGE obligatoire — engagement avant signature du devis',
          ]}
        />

        <header className="mb-8">
          <div className="inline-flex items-center gap-2 bg-accent-50 border border-accent-200 rounded-full px-3 py-1 mb-3">
            <span className="text-xs font-semibold text-accent-800">
              Fiche officielle DGEC {operation.code}
            </span>
          </div>
          <h1
            data-speakable="true"
            className="text-3xl md:text-4xl font-bold text-charcoal-900 font-heading"
          >
            {operation.nom} : artisans RGE certifiés à {villeName} ({monthYear})
          </h1>
          <p className="mt-3 text-charcoal-600">
            {count > 0 ? (
              <>
                {count} artisan{count > 1 ? 's' : ''} RGE certifié{count > 1 ? 's' : ''} pour cette
                opération CEE à {villeName}
              </>
            ) : (
              <>
                Catalogue national de l’opération CEE {operation.code} à {villeName}
              </>
            )}
          </p>
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
        </header>

        <section className="mb-8 text-charcoal-700 leading-relaxed space-y-4">
          {enrichedParagraphs.map((para, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: para }} />
          ))}
        </section>

        {/* CTA inline contextualisé */}
        <div className="mb-8">
          <CeeCTA
            variant="inline"
            operationCode={operation.code}
            serviceSlug={rgeServices[0]}
            ville={villeName}
          />
        </div>

        <section className="mb-10">
          {count === 0 ? (
            <div className="rounded-lg border border-sand-300 bg-sand-50 p-8 text-center">
              <p className="text-charcoal-700 mb-3">
                Aucun artisan RGE certifié pour la fiche {operation.code} n’est actuellement
                référencé à {villeName}.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                <Link
                  href="/devis"
                  className="inline-flex items-center px-5 py-2.5 rounded-lg bg-accent-600 text-white font-semibold hover:bg-accent-700 transition"
                >
                  Demander un devis gratuit
                </Link>
                <Link
                  href="/cee"
                  className="inline-flex items-center px-5 py-2.5 rounded-lg border border-sand-400 text-charcoal-700 font-semibold hover:bg-sand-50 transition"
                >
                  Voir toutes les primes CEE
                </Link>
              </div>
            </div>
          ) : (
            <ProviderList providers={providers} totalCount={count} />
          )}
        </section>

        {/* Sprint 4 — AEO + intelligence locale pour 15K URLs CEE.
            Câble les composants AEO/local existants jamais utilisés sur ce template :
            AEO answer (LLM citation), commune context, DPE/passoires (raison d'être CEE),
            risques climatiques, calendrier saisonnier, UGC questions. */}
        <section aria-labelledby="reponse-rapide" className="mb-12">
          <h2 id="reponse-rapide" className="sr-only">
            Réponse rapide pour {operation.nom} à {villeName}
          </h2>
          <AEOAnswerBlock
            serviceSlug={sprint4ProxyServiceSlug}
            serviceName={sprint4ProxyServiceName}
            villeName={villeName}
            departmentName={ville.departement}
            providerCount={count}
            avgRating={aggregateRating ? Number(aggregateRating.ratingValue) : null}
            priceRange={null}
            communePopulation={communeData?.population ?? null}
          />
        </section>

        {communeData && (
          <>
            <section className="mb-12">
              <CommuneContextBlock
                communeData={communeData}
                serviceName={sprint4ProxyServiceName}
                villeName={villeName}
              />
            </section>
            <section className="mb-12">
              <ContexteDPEBlock
                communeData={communeData}
                serviceName={sprint4ProxyServiceName}
                villeName={villeName}
              />
            </section>
            <section className="mb-12">
              <RisquesGeoBlock
                communeData={communeData}
                serviceName={sprint4ProxyServiceName}
                villeName={villeName}
              />
            </section>
            <section className="mb-12">
              <CalendrierSaisonnierBlock
                serviceSlug={sprint4ProxyServiceSlug}
                serviceName={sprint4ProxyServiceName}
                villeName={villeName}
                climatZone={communeData.climat_zone ?? null}
              />
            </section>
          </>
        )}

        <section className="mb-12">
          <UserQuestionBlock
            serviceSlug={sprint4ProxyServiceSlug}
            serviceName={sprint4ProxyServiceName}
            villeName={villeName}
            villeSlug={villeSlug}
          />
        </section>

        {/* Comprendre cette prime CEE */}
        <section className="mb-12 rounded-2xl border border-accent-100 bg-accent-50/50 p-6">
          <h2 className="text-xl md:text-2xl font-bold text-charcoal-900 font-heading mb-4">
            Comprendre la prime CEE {operation.code}
          </h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div>
              <dt className="font-semibold text-charcoal-900">Domaine</dt>
              <dd className="text-charcoal-700">{domaineLabel}</dd>
            </div>
            {operation.sous_domaine && (
              <div>
                <dt className="font-semibold text-charcoal-900">Sous-domaine</dt>
                <dd className="text-charcoal-700">{operation.sous_domaine.replace(/_/g, ' ')}</dd>
              </div>
            )}
            <div>
              <dt className="font-semibold text-charcoal-900">Qualifications RGE requises</dt>
              <dd className="text-charcoal-700">
                {operation.rge_qualifications_requises.join(', ') || 'Qualibat RGE'}
              </dd>
            </div>
            {operation.unite_mesure && (
              <div>
                <dt className="font-semibold text-charcoal-900">Unité de mesure</dt>
                <dd className="text-charcoal-700">{operation.unite_mesure}</dd>
              </div>
            )}
            <div>
              <dt className="font-semibold text-charcoal-900">Éligibilité</dt>
              <dd className="text-charcoal-700">
                {operation.classique_eligible && 'Tous ménages'}
                {operation.classique_eligible && operation.precarite_eligible && ' + '}
                {operation.precarite_eligible && 'Bonifié précarité'}
              </dd>
            </div>
            {operation.coup_de_pouce && (
              <div>
                <dt className="font-semibold text-charcoal-900">Coup de pouce</dt>
                <dd className="text-accent-700 font-semibold">
                  Oui{operation.coup_de_pouce_charte ? ` (${operation.coup_de_pouce_charte})` : ''}
                </dd>
              </div>
            )}
          </dl>
          <div className="mt-5 flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
            <Link
              href={`/cee/${urlCode}/guide`}
              className="text-accent-700 font-semibold underline hover:text-accent-900"
            >
              Guide complet {operation.code} — étapes, montants, pièces justificatives →
            </Link>
            {operation.url_fiche_officielle && (
              <a
                href={operation.url_fiche_officielle}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-700 font-semibold underline hover:text-accent-900"
              >
                Consulter la fiche officielle DGEC {operation.code} →
              </a>
            )}
          </div>
        </section>

        {/* TL;DR pré-FAQ — capture FS sur requêtes "prime CEE [code] [ville]" */}
        <section aria-labelledby="essentiel-cee" className="mb-10">
          <h2 id="essentiel-cee" className="sr-only">
            L’essentiel de la prime CEE {operation.code} à {villeName}
          </h2>
          <TldrBlock bullets={tldrBullets} />
        </section>

        {/* Source officielle Etalab visible — E-E-A-T YMYL */}
        <section className="mb-10 rounded-lg border border-accent-200 bg-accent-50 p-4 text-sm text-accent-900">
          <strong className="font-semibold">Source officielle&nbsp;:</strong> Données opération CEE{' '}
          {operation.code} sourcées depuis la{' '}
          <a
            href="https://www.ecologie.gouv.fr/politiques-publiques/certificats-deconomies-denergie"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-accent-700"
          >
            DGEC (ministère de la Transition écologique)
          </a>{' '}
          et qualifications RGE depuis{' '}
          <a
            href="https://data.gouv.fr/fr/datasets/liste-des-entreprises-rge-2/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-accent-700"
          >
            data.gouv.fr — ADEME
          </a>{' '}
          (Licence Etalab 2.0).
        </section>

        {/* FAQ */}
        {faqItems.length > 0 && (
          <section aria-labelledby="faq" className="mb-12">
            <h2
              id="faq"
              className="text-xl md:text-2xl font-bold text-charcoal-900 font-heading mb-6"
            >
              Questions fréquentes — {operation.nom} à {villeName}
            </h2>
            <div className="space-y-3">
              {faqItems.map((item, i) => (
                <details
                  key={i}
                  className="group rounded-lg border border-sand-300 bg-white p-5 open:border-accent-300 open:shadow-sm"
                >
                  <summary className="cursor-pointer list-none font-semibold text-charcoal-900 flex items-start justify-between gap-4">
                    <span>{item.question}</span>
                    <span className="text-accent-600 group-open:rotate-45 transition-transform text-xl leading-none">
                      +
                    </span>
                  </summary>
                  <p
                    className="mt-3 text-charcoal-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: item.answer }}
                  />
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Cross-linking métiers RGE */}
        {rgeServices.length > 0 && (
          <section aria-labelledby="rge-services" className="mb-12">
            <h2 id="rge-services" className="text-xl font-bold text-charcoal-900 font-heading mb-4">
              Métiers RGE certifiés à {villeName}
            </h2>
            <p className="text-sm text-charcoal-600 mb-4 max-w-3xl">
              Explorer l’annuaire des artisans RGE par métier à {villeName}
              &nbsp;:
            </p>
            <div className="flex flex-wrap gap-2">
              {rgeServices.map((slug) => {
                const meta = RGE_QUALIFICATION_LABELS[slug]
                const trade = slug.replace(/-/g, ' ')
                return (
                  <Link
                    key={slug}
                    href={`/rge/${slug}/${villeSlug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent-200 bg-accent-50 text-sm text-accent-800 hover:border-accent-400 hover:bg-accent-100 transition"
                  >
                    <span className="font-semibold capitalize">
                      Artisans RGE {trade} à {villeName}
                    </span>
                    {meta && <span className="text-xs text-accent-600">&middot; {meta.label}</span>}
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Cross-linking villes */}
        {otherCities.length > 0 && (
          <section aria-labelledby="other-cities" className="mb-12">
            <h2 id="other-cities" className="text-xl font-bold text-charcoal-900 font-heading mb-4">
              {operation.nom} dans d’autres villes
            </h2>
            <div className="flex flex-wrap gap-2">
              {otherCities.map((c) => (
                <Link
                  key={c.slug}
                  href={`/cee/${urlCode}/${c.slug}`}
                  className="inline-flex items-center px-4 py-2 rounded-full border border-sand-300 text-sm text-charcoal-700 hover:border-accent-400 hover:text-accent-700 transition"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Cross-linking opérations */}
        {sameDomainOps.length > 0 && (
          <section aria-labelledby="same-domain" className="mb-12">
            <h2 id="same-domain" className="text-xl font-bold text-charcoal-900 font-heading mb-4">
              Autres primes CEE du domaine {domaineLabel.toLowerCase()}
            </h2>
            <ul className="grid gap-3 md:grid-cols-3">
              {sameDomainOps.map((op) => (
                <li key={op.code}>
                  <Link
                    href={`/cee/${op.code.toLowerCase()}/${villeSlug}`}
                    className="block rounded-lg border border-sand-300 p-4 hover:border-accent-400 hover:bg-accent-50 transition"
                  >
                    <div className="text-xs font-semibold text-accent-700">{op.code}</div>
                    <div className="font-semibold text-charcoal-900 mt-1">{op.nom}</div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Sprint 2 maillage interne — câble cross-intent + intent-aware
            sur 15K URLs CEE. Mapping : on utilise le premier service RGE
            associé à l'opération CEE comme proxy pour les liens artisans/
            tarifs/avis/urgence. Si pas de mapping, fallback rénovation. */}
        {(() => {
          const rgeServices = getRgeServicesForCeeOp(operation.code)
          const proxyServiceSlug = rgeServices[0] ?? 'renovation-energetique'
          const proxyService = services.find((s) => s.slug === proxyServiceSlug)
          const proxyServiceName = proxyService?.name ?? 'Rénovation énergétique'
          const cityDeptCode = ville?.departementCode
          const deptSlug = cityDeptCode ? getDepartementByCode(cityDeptCode)?.slug : undefined
          return (
            <>
              <section className="mb-12">
                <MaillageInterneBlock
                  serviceSlug={proxyServiceSlug}
                  serviceName={proxyServiceName}
                  villeSlug={villeSlug}
                  villeName={villeName}
                  departementSlug={deptSlug}
                  departementName={ville?.departement}
                  regionName={ville?.region}
                  currentIntent="tarifs"
                  hasCEE={true}
                />
              </section>

              {/* Sprint 2.1 — VerticalCrossLinks (4 services × ville pour intent tarifs) */}
              <VerticalCrossLinks
                currentService={proxyServiceSlug}
                villeSlug={villeSlug}
                villeName={villeName}
                intent="tarifs"
              />

              {/* Sprint 2.1 — TopCitiesGrid (top 20 villes pour ce service rénovation) */}
              <TopCitiesGrid
                serviceSlug={proxyServiceSlug}
                serviceName={proxyServiceName}
                intent="tarifs"
                title={`Tarifs ${proxyServiceName.toLowerCase()} dans les principales villes`}
              />
            </>
          )
        })()}

        <section className="mb-12 rounded-2xl border border-sand-300 bg-white p-6 text-center">
          <h2 className="text-lg font-bold text-charcoal-900 font-heading mb-2">
            Prêt à lancer votre projet à {villeName}&nbsp;?
          </h2>
          <p className="text-charcoal-600 text-sm mb-4 max-w-2xl mx-auto">
            Demandez un devis gratuit auprès d’un artisan RGE certifié pour la fiche{' '}
            {operation.code}. Devis sans engagement, primes CEE et MaPrimeRénov’ calculées
            automatiquement.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/devis"
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-accent-600 text-white font-semibold hover:bg-accent-700 transition"
            >
              Demander un devis gratuit
            </Link>
            <Link
              href="/cee"
              className="inline-flex items-center px-5 py-2.5 rounded-lg border border-accent-300 text-accent-700 font-semibold hover:bg-accent-50 transition"
            >
              Voir toutes les primes CEE
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
