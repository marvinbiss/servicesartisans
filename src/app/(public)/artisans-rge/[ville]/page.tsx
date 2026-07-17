import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ShieldCheck, FileCheck2, Percent, ExternalLink, BookOpen } from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import ProviderList from '@/components/ProviderList'
import StickyMobileCTA from '@/components/conversion/StickyMobileCTA'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import { SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import {
  getBreadcrumbSchema,
  getCollectionPageSchema,
  getItemListSchema,
  getReviewedByPersonSchema,
} from '@/lib/seo/jsonld'
import { spreadCitationsForTopics } from '@/lib/seo/authoritative-citations'
import { authors, getReviewerForAuthor } from '@/lib/data/authors'

const ART_RGE_AUTHOR = authors['sophie-martin']
const ART_RGE_REVIEWER = getReviewerForAuthor(ART_RGE_AUTHOR)
import { buildAggregateRatingFromProviders } from '@/lib/seo/aggregate-rating'
import { currentMonthYearFr, monthlyAnchorIso } from '@/lib/seo/sprint-helpers'
import { villes, getVilleBySlug, getDepartementByCode } from '@/lib/data/france'
import MaillageInterneBlock from '@/components/seo/MaillageInterneBlock'
import VerticalCrossLinks from '@/components/seo/VerticalCrossLinks'
import TopCitiesGrid from '@/components/seo/TopCitiesGrid'
import AEOAnswerBlock from '@/components/seo/AEOAnswerBlock'
import CommuneContextBlock from '@/components/seo/CommuneContextBlock'
import ContexteDPEBlock from '@/components/seo/ContexteDPEBlock'
import RisquesGeoBlock from '@/components/seo/RisquesGeoBlock'
import CalendrierSaisonnierBlock from '@/components/seo/CalendrierSaisonnierBlock'
import UserQuestionBlock from '@/components/seo/UserQuestionBlock'
import LocalProviderShowcase from '@/components/seo/LocalProviderShowcase'
import { getArtisanUrl } from '@/lib/utils'
import { getRgeProvidersByCity, getRgeProviderCountByCity } from '@/lib/rge/city-listings'
import { getCommuneBySlug } from '@/lib/data/commune-data'
import { logger } from '@/lib/logger'
import {
  buildGenericRgeParagraphs,
  buildGenericRgeFaq,
  buildFaqJsonLd,
  getNeighborVilles,
  MAIN_RGE_SERVICES,
} from '@/lib/rge/pseo-content'
import type { Provider } from '@/types'

// ISR — revalidate every 24h. Content evolves slowly (ADEME sync weekly).
export const revalidate = 86400

const DEFAULT_LIMIT = 50

/**
 * Pre-generate the top 50 most populated cities at build.
 * villes is pre-sorted by population desc in src/lib/data/france.ts.
 * All other cities are generated on-demand via ISR.
 */
export function generateStaticParams() {
  return villes.slice(0, 50).map((v) => ({ ville: v.slug }))
}

type PageProps = {
  params: Promise<{ ville: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const ville = getVilleBySlug(params.ville)
  if (!ville) {
    return {
      title: 'Artisans RGE — Ville introuvable',
      robots: { index: false, follow: false },
    }
  }

  const url = `${SITE_URL}/artisans-rge/${ville.slug}`
  const title = `Artisans RGE à ${ville.name} — Certifiés MaPrimeRénov' & CEE`
  const description =
    `Liste des artisans certifiés RGE à ${ville.name}. Éligibles MaPrimeRénov', CEE et TVA 5,5%. Données officielles ADEME — data.gouv.fr.`.slice(
      0,
      160
    )

  return {
    title,
    description,
    alternates: getAlternates(`/artisans-rge/${ville.slug}`),
    openGraph: {
      ...getOgDefaults(),
      locale: 'fr_FR',
      title,
      description,
      url,
      siteName: 'ServicesArtisans',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function ArtisansRgeVillePage(props: PageProps) {
  const params = await props.params
  const ville = getVilleBySlug(params.ville)
  if (!ville) notFound()

  const [providers, totalCount, communeData] = await Promise.all([
    getRgeProvidersByCity(params.ville, { limit: DEFAULT_LIMIT, offset: 0 }),
    getRgeProviderCountByCity(params.ville),
    getCommuneBySlug(params.ville).catch((err: unknown) => {
      logger.error('artisans_rge_ville.commune_lookup_error', err as Error, {
        route: 'artisans-rge/[ville]',
        ville: params.ville,
      })
      return null
    }),
  ])

  // Fail-open: only noindex when we confirmed 0. During build we fail-open (count = 1).
  const shouldNoindex = totalCount === 0

  const pagePath = `/artisans-rge/${ville.slug}`

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Artisans', href: '/artisans' },
    { label: `RGE à ${ville.name}` },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Artisans', url: '/artisans' },
    { name: `Artisans RGE à ${ville.name}`, url: pagePath },
  ])

  const collectionSchema = getCollectionPageSchema({
    name: `Artisans RGE à ${ville.name}`,
    description: `Artisans certifiés RGE actifs à ${ville.name}, toutes spécialités confondues — source ADEME / data.gouv.fr.`,
    url: pagePath,
    itemCount: totalCount,
  })

  const contentParagraphs = buildGenericRgeParagraphs(ville, totalCount)
  const faqItems = buildGenericRgeFaq(ville, totalCount)
  const faqSchema = buildFaqJsonLd(faqItems)
  const neighborVilles = getNeighborVilles(ville.slug, 5)

  const itemListSchema =
    providers.length > 0
      ? getItemListSchema({
          name: `Artisans RGE à ${ville.name}`,
          description: `Liste des artisans certifiés RGE à ${ville.name}.`,
          url: pagePath,
          items: providers.slice(0, 20).map((p, index) => ({
            name: p.name,
            url: getArtisanUrl({
              stable_id: p.stable_id ?? undefined,
              slug: p.slug,
              specialty: p.specialty ?? undefined,
              city: p.address_city ?? undefined,
            }),
            position: index + 1,
            ...(p.rating_average && p.review_count && p.review_count >= 3
              ? {
                  rating: p.rating_average,
                  reviewCount: p.review_count,
                }
              : {}),
          })),
        })
      : null

  // Sprint ULTRA — signal YMYL freshness + Speakable + AggregateRating page-level.
  const aggregateRating = buildAggregateRatingFromProviders(providers as Provider[])
  const monthYear = currentMonthYearFr()
  const monthlyAnchor = monthlyAnchorIso()
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${SITE_URL}${pagePath}#article`,
    url: `${SITE_URL}${pagePath}`,
    headline: `Artisans RGE certifiés à ${ville.name} — ${monthYear}`,
    description: `Liste des artisans RGE actifs à ${ville.name} : qualifications, certifications ADEME / France Rénov', éligibilité MaPrimeRénov' et CEE.`,
    image: [`${SITE_URL}/og-rge-default.jpg`, `${SITE_URL}/og-default.jpg`],
    datePublished: '2026-01-01T00:00:00+02:00',
    dateModified: monthlyAnchor,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    articleSection: 'Rénovation énergétique',
    keywords: [
      'artisan RGE',
      ville.name,
      "MaPrimeRénov'",
      'CEE',
      'Éco-PTZ',
      'rénovation énergétique',
      'France Rénov',
      'ADEME',
    ].join(', '),
    about: [
      { '@type': 'Thing', name: 'Label RGE — Reconnu Garant de l’Environnement' },
      { '@type': 'City', name: ville.name },
      { '@type': 'Thing', name: "MaPrimeRénov'" },
      { '@type': 'Thing', name: "CEE — Certificats d'économies d'énergie" },
    ],
    ...spreadCitationsForTopics(
      `RGE ${ville.name} MaPrimeRénov CEE éco-PTZ rénovation énergétique`
    ),
    author: ART_RGE_AUTHOR
      ? {
          '@type': 'Person',
          name: ART_RGE_AUTHOR.name,
          jobTitle: ART_RGE_AUTHOR.role,
          url: `${SITE_URL}/equipe/${ART_RGE_AUTHOR.slug}`,
          ...(ART_RGE_AUTHOR.methodology &&
            ART_RGE_AUTHOR.methodology.length > 0 && { skills: ART_RGE_AUTHOR.methodology }),
        }
      : { '@type': 'Organization', name: 'ServicesArtisans', url: SITE_URL },
    ...(ART_RGE_REVIEWER && { reviewedBy: getReviewedByPersonSchema(ART_RGE_REVIEWER) }),
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: 'ServicesArtisans',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: `${SITE_URL}${pagePath}`,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  const tldrBullets: string[] = [
    `${totalCount.toLocaleString('fr-FR')} artisan${totalCount > 1 ? 's' : ''} RGE actif${totalCount > 1 ? 's' : ''} à ${ville.name}, toutes spécialités énergétiques confondues.`,
    "Label RGE = condition obligatoire pour MaPrimeRénov', CEE, Éco-PTZ et TVA à 5,5 %.",
    'Données ADEME / France Rénov’ — synchronisation hebdomadaire, certifications en cours de validité.',
    `Cumul possible des aides : MaPrimeRénov' jusqu'à 11 000 € + prime CEE + Éco-PTZ jusqu'à 50 000 € à taux zéro.`,
  ]

  const jsonLdItems: Record<string, unknown>[] = [breadcrumbSchema, collectionSchema, articleSchema]
  if (itemListSchema) jsonLdItems.push(itemListSchema as Record<string, unknown>)
  jsonLdItems.push(faqSchema as Record<string, unknown>)

  return (
    <>
      {shouldNoindex && <meta name="robots" content="noindex, follow" />}
      <JsonLd data={jsonLdItems} />

      <Breadcrumb items={breadcrumbItems} />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-accent-700 via-accent-800 to-charcoal-900 text-white py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-accent-500/20 border border-accent-400/30 rounded-full px-4 py-1.5 mb-5">
            <ShieldCheck className="w-4 h-4 text-accent-300" />
            <span className="text-sm font-medium text-accent-100">
              Label RGE — Reconnu Garant de l&apos;Environnement
            </span>
          </div>
          <h1
            data-speakable="true"
            className="text-3xl md:text-5xl font-extrabold leading-tight mb-4"
          >
            Artisans certifiés RGE à {ville.name} ({monthYear})
          </h1>
          <p className="text-sm text-accent-100/80 mb-3">
            Auteur : <span className="font-medium text-white">la rédaction ServicesArtisans</span>
            {' · '}
            Mis à jour le{' '}
            <time dateTime={monthlyAnchor.slice(0, 10)} className="font-medium">
              {new Date(monthlyAnchor).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                timeZone: 'Europe/Paris',
              })}
            </time>
          </p>
          <p className="text-base md:text-lg text-accent-50/90 max-w-3xl">
            Le label RGE est délivré par des organismes accrédités (Qualibat, Qualit&apos;EnR,
            Qualifelec, Certibat…) aux artisans RGE certifiés pour les travaux de rénovation
            énergétique. C&apos;est la condition
            <strong> indispensable</strong> pour faire bénéficier vos clients de{' '}
            <strong>MaPrimeRénov&apos;</strong>, des{' '}
            <strong>Certificats d&apos;Économies d&apos;Énergie (CEE)</strong>, de l&apos;
            <strong>Éco-PTZ</strong> et de la <strong>TVA réduite à 5,5 %</strong>.
          </p>
          <p className="text-sm text-accent-100/80 max-w-3xl mt-4">
            Données issues du jeu de données officiel{' '}
            <a
              href="https://data.ademe.fr/datasets/liste-des-entreprises-rge-2"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-accent-300 underline-offset-2 hover:text-white inline-flex items-center gap-1"
            >
              « liste-des-entreprises-rge-2 »
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>{' '}
            publié par l&apos;ADEME sur data.gouv.fr — Licence Ouverte Etalab 2.0.
          </p>
        </div>
      </section>

      {/* Providers listing — lifted above the fold (cards first) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-2xl md:text-3xl font-bold text-charcoal-900 mb-2">
          Annuaire des artisans RGE à {ville.name}
        </h2>
        <p className="text-charcoal-900 mb-6">
          {providers.length > 0
            ? `${providers.length} résultat${providers.length > 1 ? 's' : ''} affiché${providers.length > 1 ? 's' : ''} sur ${totalCount.toLocaleString('fr-FR')} au total.`
            : 'Aucun artisan RGE actif actuellement référencé dans cette ville.'}
        </p>

        {providers.length > 0 ? (
          <ProviderList providers={providers as Provider[]} totalCount={totalCount} />
        ) : (
          <div className="text-center py-16 bg-sand-50 rounded-2xl">
            <ShieldCheck className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
            <p className="text-lg text-charcoal-600 font-medium">
              Aucun artisan RGE trouvé à {ville.name}
            </p>
            <p className="text-charcoal-400 mt-2 max-w-md mx-auto">
              Notre base est synchronisée chaque semaine depuis l&apos;ADEME. Essayez une ville
              voisine ou consultez le{' '}
              <Link href="/verifier-artisan" className="text-accent-700 underline">
                vérificateur officiel
              </Link>
              .
            </p>
          </div>
        )}
      </section>

      {/* En bref — capture FS Position 0 sur "artisans RGE [ville]" */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-2">
        <EnBrefBox
          summary={`${totalCount.toLocaleString('fr-FR')} artisan${totalCount > 1 ? 's' : ''} certifié${totalCount > 1 ? 's' : ''} RGE actif${totalCount > 1 ? 's' : ''} à ${ville.name} — toutes spécialités énergétiques confondues. Éligibles MaPrimeRénov', CEE et TVA 5,5 %. Données officielles ADEME, mises à jour hebdomadaires.`}
          keyPoints={[
            'Label délivré par Qualibat, Qualit’EnR, Qualifelec, Certibat',
            "Condition obligatoire pour MaPrimeRénov' + CEE + Éco-PTZ",
            'Données ADEME / France Rénov’ — Licence Etalab 2.0',
            'Cumul des aides possible jusqu’à 11 000 € + 50 000 € à taux zéro',
          ]}
        />
      </div>

      {/* Counter strip */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-charcoal-900">
                {totalCount.toLocaleString('fr-FR')} artisan{totalCount > 1 ? 's' : ''} RGE actif
                {totalCount > 1 ? 's' : ''} à {ville.name}
              </div>
              <p className="text-sm text-charcoal-900 mt-1">
                Certifications en cours de validité — mises à jour hebdomadaires depuis
                l&apos;ADEME.
              </p>
            </div>
            <Link
              href="/verifier-artisan"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-accent-600 text-accent-700 font-semibold hover:bg-accent-50 transition"
            >
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              Vérifier un artisan RGE
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits strip */}
      <section className="bg-accent-50/60 border-b border-accent-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <FileCheck2
              className="w-5 h-5 text-accent-700 mt-0.5 flex-shrink-0"
              aria-hidden="true"
            />
            <div>
              <div className="font-semibold text-charcoal-900">MaPrimeRénov&apos;</div>
              <div className="text-sm text-charcoal-600">
                Aide de l&apos;État pour la rénovation énergétique, réservée aux travaux réalisés
                par un RGE.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FileCheck2
              className="w-5 h-5 text-accent-700 mt-0.5 flex-shrink-0"
              aria-hidden="true"
            />
            <div>
              <div className="font-semibold text-charcoal-900">Primes CEE</div>
              <div className="text-sm text-charcoal-600">
                Certificats d&apos;Économies d&apos;Énergie — versés par les délégataires (Effy,
                Sonergia…).
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Percent className="w-5 h-5 text-accent-700 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <div className="font-semibold text-charcoal-900">TVA à 5,5 %</div>
              <div className="text-sm text-charcoal-600">
                Taux réduit applicable sur la main d&apos;œuvre et les matériaux pour les travaux
                d&apos;amélioration énergétique.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sprint 4 chantier #4 — AEO answer block (LLM-citable) */}
      <section className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <AEOAnswerBlock
            serviceSlug="renovation-energetique"
            serviceName="Artisans RGE"
            villeName={ville.name}
            departmentName={ville.departement}
            providerCount={totalCount}
            avgRating={aggregateRating ? parseFloat(aggregateRating.ratingValue) : null}
            priceRange={null}
            communePopulation={communeData?.population ?? null}
          />
        </div>
      </section>

      {/* Sprint 4 chantier #4 — LocalProviderShowcase (top 3 RGE artisans, JSON-LD LocalBusiness) */}
      {providers.length > 0 && (
        <LocalProviderShowcase
          providers={providers as Provider[]}
          serviceName="Artisan RGE"
          cityName={ville.name}
          max={3}
          jsonLdOnly={true}
        />
      )}

      {/* Sprint 4 chantier #4 — intelligence locale unique par commune */}
      {communeData && (
        <>
          <section className="bg-sand-50 border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
              <CommuneContextBlock
                communeData={communeData}
                serviceName="Rénovation énergétique"
                villeName={ville.name}
              />
            </div>
          </section>

          <section className="bg-white border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
              <ContexteDPEBlock
                communeData={communeData}
                serviceName="Rénovation énergétique"
                villeName={ville.name}
              />
            </div>
          </section>

          <section className="bg-sand-50 border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
              <RisquesGeoBlock
                communeData={communeData}
                serviceName="Rénovation énergétique"
                villeName={ville.name}
              />
            </div>
          </section>

          <section className="bg-white border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
              <CalendrierSaisonnierBlock
                serviceSlug="renovation-energetique"
                serviceName="Rénovation énergétique"
                villeName={ville.name}
                climatZone={communeData.climat_zone ?? null}
                joursGelAnnuels={communeData.jours_gel_annuels ?? null}
                precipitationAnnuelle={communeData.precipitation_annuelle ?? null}
                temperatureMoyenneHiver={communeData.temperature_moyenne_hiver ?? null}
                temperatureMoyenneEte={communeData.temperature_moyenne_ete ?? null}
                moisTravauxExtDebut={communeData.mois_travaux_ext_debut ?? null}
                moisTravauxExtFin={communeData.mois_travaux_ext_fin ?? null}
                altitudeMoyenne={communeData.altitude_moyenne ?? null}
              />
            </div>
          </section>
        </>
      )}

      {/* Sprint 4 chantier #4 — UserQuestionBlock (FAQ enrichie LLM) */}
      <section className="bg-sand-50 border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <UserQuestionBlock
            serviceSlug="renovation-energetique"
            serviceName="Rénovation énergétique"
            villeSlug={ville.slug}
            villeName={ville.name}
          />
        </div>
      </section>

      {/* Long-form content: unique par ville */}
      <section className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-charcoal-900 mb-6">
            Rénovation énergétique à {ville.name} : ce qu&apos;il faut savoir
          </h2>
          <div className="prose prose-slate max-w-none space-y-5 text-charcoal-700 leading-relaxed">
            {contentParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-linking : services RGE principaux dans cette ville */}
      <section className="bg-sand-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-2xl font-bold text-charcoal-900 mb-2">
            Par spécialité RGE à {ville.name}
          </h2>
          <p className="text-charcoal-900 mb-6">
            Filtrez les artisans RGE de {ville.name} par métier énergétique.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {MAIN_RGE_SERVICES.map((svc) => (
              <Link
                key={svc.slug}
                href={`/rge/${svc.slug}/${ville.slug}`}
                className="block p-4 bg-white rounded-xl border border-charcoal-200 hover:border-accent-300 hover:shadow-sm transition"
              >
                <div className="font-semibold text-charcoal-900 group-hover:text-accent-700">
                  {svc.label}
                </div>
                <div className="text-xs text-charcoal-900 mt-1">RGE à {ville.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-linking : villes voisines */}
      {neighborVilles.length > 0 && (
        <section className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <h2 className="text-2xl font-bold text-charcoal-900 mb-2">
              Artisans RGE dans les communes voisines
            </h2>
            <p className="text-charcoal-900 mb-6">
              Département {ville.departement} ({ville.region}) — les artisans RGE d&apos;une commune
              voisine interviennent couramment chez vous.
            </p>
            <div className="flex flex-wrap gap-2">
              {neighborVilles.map((n) => (
                <Link
                  key={n.slug}
                  href={`/artisans-rge/${n.slug}`}
                  className="inline-flex items-center px-4 py-2 rounded-full border border-charcoal-200 text-sm text-charcoal-700 hover:border-accent-400 hover:text-accent-700 transition"
                >
                  RGE à {n.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TL;DR pré-FAQ — capture FS sur "artisans RGE [ville]" */}
      <section className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <h2 className="sr-only">L’essentiel des artisans RGE à {ville.name}</h2>
          <TldrBlock bullets={tldrBullets} />
        </div>
      </section>

      {/* AggregateRating note (E-E-A-T trust) */}
      {aggregateRating && (
        <section className="bg-accent-50/40 border-t border-accent-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-accent-900">
            <strong className="font-semibold">{aggregateRating.ratingValue}/5</strong> — moyenne sur{' '}
            <strong className="font-semibold">{aggregateRating.reviewCount}</strong> avis vérifiés
            d&apos;artisans RGE listés à {ville.name}.
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="bg-sand-50 border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-charcoal-900 mb-6">
            Questions fréquentes sur les artisans RGE à {ville.name}
          </h2>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <details
                key={i}
                className="group bg-white rounded-xl border border-charcoal-200 p-5 open:border-accent-300 open:shadow-sm"
              >
                <summary className="cursor-pointer list-none font-semibold text-charcoal-900 flex items-start justify-between gap-4">
                  <span>{item.question}</span>
                  <span className="text-accent-600 group-open:rotate-45 transition-transform text-xl leading-none">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-charcoal-600 leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sand-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
          <MaillageInterneBlock
            serviceSlug="renovation-energetique"
            serviceName="Rénovation énergétique"
            villeSlug={ville.slug}
            villeName={ville.name}
            departementSlug={
              ville.departementCode ? getDepartementByCode(ville.departementCode)?.slug : undefined
            }
            departementName={ville.departement}
            regionName={ville.region}
            currentIntent="services"
            hasCEE={true}
          />
        </div>
      </section>

      {/* Sprint 2.1 — VerticalCrossLinks (4 services × ville pour avis) */}
      <VerticalCrossLinks
        currentService="renovation-energetique"
        villeSlug={ville.slug}
        villeName={ville.name}
        intent="avis"
      />

      {/* Sprint 2.1 — TopCitiesGrid (top 20 villes RGE) */}
      <TopCitiesGrid
        serviceSlug="renovation-energetique"
        serviceName="Rénovation énergétique"
        intent="services"
        title="Artisans RGE dans les principales villes"
      />

      {/* Guides CTA */}
      <section className="bg-sand-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-2xl font-bold text-charcoal-900 mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-accent-700" aria-hidden="true" />
            Guides pour vos travaux de rénovation énergétique
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/guides/artisan-rge"
              className="group p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-accent-300 hover:shadow-md transition"
            >
              <div className="font-bold text-charcoal-900 group-hover:text-accent-700">
                Comprendre le label RGE
              </div>
              <p className="text-sm text-charcoal-600 mt-2">
                Comment est attribué le label, qui peut le délivrer, comment le vérifier.
              </p>
            </Link>
            <Link
              href="/guides/aides-renovation-2026"
              className="group p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-accent-300 hover:shadow-md transition"
            >
              <div className="font-bold text-charcoal-900 group-hover:text-accent-700">
                Aides à la rénovation 2026
              </div>
              <p className="text-sm text-charcoal-600 mt-2">
                Toutes les aides publiques disponibles : montants, conditions, cumul.
              </p>
            </Link>
            <Link
              href="/guides/maprimerenov-2026"
              className="group p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-accent-300 hover:shadow-md transition"
            >
              <div className="font-bold text-charcoal-900 group-hover:text-accent-700">
                MaPrimeRénov&apos; 2026
              </div>
              <p className="text-sm text-charcoal-600 mt-2">
                Barèmes par revenus, travaux éligibles, procédure de demande.
              </p>
            </Link>
          </div>
        </div>
      </section>

      <StickyMobileCTA
        cityName={ville.name}
        citySlug={ville.slug}
        ctaText="Devis artisan RGE gratuit"
      />
    </>
  )
}
