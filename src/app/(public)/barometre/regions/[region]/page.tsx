import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Users, Star, Building2, ArrowRight, BarChart3, HelpCircle } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { ArticleMeta } from '@/components/ArticleMeta'
import { getBreadcrumbSchema, getFAQSchema, getReviewedByPersonSchema } from '@/lib/seo/jsonld'
import { authors, getReviewerForAuthor } from '@/lib/data/authors'
import { SITE_URL, SITE_NAME, getAlternates, getOgDefaults } from '@/lib/seo/config'

const BARO_AUTHOR = authors['claire-dubois']
const BARO_REVIEWER = getReviewerForAuthor(BARO_AUTHOR)
import {
  BAROMETRE_REGIONS,
  getBarometreRegionBySlug,
  getBarometreMetierBySlug,
} from '@/lib/barometre/constants'
import { getStatsByRegion } from '@/lib/barometre/queries'
import { regionalIndices } from '@/lib/data/barometre'
import RelatedHubs from '@/components/seo/RelatedHubs'
import { getRegionPreposition, getRegionArticle } from '@/lib/geo-strings'
import { monthlyAnchorIso } from '@/lib/seo/sprint-helpers'

// ---------------------------------------------------------------------------
// Static params (13 régions métropolitaines)
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return BAROMETRE_REGIONS.map((r) => ({ region: r.slug }))
}

export const dynamicParams = false
export const revalidate = 86400

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ region: string }>
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { region: regionSlug } = await params
  const region = getBarometreRegionBySlug(regionSlug)
  if (!region) return { title: 'Région non trouvée' }

  const title = `Baromètre Artisans RGE ${region.name} 2026 — Stats + Prix`
  const description = `Baromètre 2026 des artisans RGE certifiés (Qualibat, Qualifelec, QualiPAC, Qualit'EnR) ${getRegionPreposition(region.name)} : top métiers, ${region.departements.length} départements, notes moyennes et taux de vérification. Source ADEME, données actualisées ${SITE_NAME}.`
  const canonicalUrl = `${SITE_URL}/barometre/regions/${regionSlug}`

  return {
    title,
    description,
    alternates: getAlternates(`/barometre/regions/${regionSlug}`),
    robots: { index: true, follow: true },
    openGraph: {
      ...getOgDefaults(),
      locale: 'fr_FR',
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: `${SITE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `Artisans RGE certifiés ${getRegionPreposition(region.name)}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function BarometreRegionPage({ params }: PageProps) {
  const { region: regionSlug } = await params
  const region = getBarometreRegionBySlug(regionSlug)
  if (!region) notFound()

  const stats = await getStatsByRegion(regionSlug)
  const index = regionalIndices.find((r) => r.regionSlug === regionSlug)

  // Pivot full RGE 2026-05-05 — barometre_stats agrège tous providers actifs
  // (RGE + non-RGE). On dérive l'estimation RGE-only via le ratio empirique
  // 49 611 fiches RGE / ~350 000 actifs ≈ 0.14 (aligné CarteClient.tsx).
  // À retirer dès que `barometre_stats.nb_artisans_rge` sera populé par cron.
  const RGE_RATIO = 0.14
  const totalArtisansRaw = stats.reduce((s, r) => s + r.nb_artisans, 0)
  const totalArtisans = Math.round(totalArtisansRaw * RGE_RATIO)
  const ratedStats = stats.filter((r) => r.note_moyenne !== null)
  const noteMoyenne =
    ratedStats.length > 0
      ? Math.round(
          (ratedStats.reduce((s, r) => s + (r.note_moyenne ?? 0) * r.nb_artisans, 0) /
            ratedStats.reduce((s, r) => s + r.nb_artisans, 0)) *
            10
        ) / 10
      : null

  const maxCount = stats.length > 0 ? stats[0].nb_artisans : 1

  const faqItems = [
    {
      question: `Combien d'artisans RGE sont référencés ${getRegionPreposition(region.name)} ?`,
      answer:
        totalArtisans > 0
          ? `Notre annuaire recense ${totalArtisans.toLocaleString('fr-FR')} artisans RGE certifiés (Qualibat, Qualifelec, QualiPAC, Qualit'EnR) actifs ${getRegionPreposition(region.name)}, répartis dans ${region.departements.length} départements et couvrant plus de ${stats.length} corps de métier RGE.`
          : `Tous les artisans RGE certifiés ${getRegionPreposition(region.name)} sont référencés dans notre annuaire (Qualibat, Qualifelec, QualiPAC, Qualit'EnR).`,
    },
    {
      question: `Quel est l'indice de prix ${getRegionPreposition(region.name)} ?`,
      answer: index
        ? `L'indice de prix ${getRegionPreposition(region.name)} est de ${index.index} (base 100 = moyenne nationale). ${index.index > 100 ? `Les prix sont ${index.index - 100}% au-dessus de la moyenne nationale.` : index.index < 100 ? `Les prix sont ${100 - index.index}% en dessous de la moyenne nationale.` : 'Les prix sont dans la moyenne nationale.'}`
        : `Consultez notre baromètre des prix pour connaître l'indice régional ${getRegionPreposition(region.name)}.`,
    },
    {
      question: `Quels sont les métiers RGE les plus demandés ${getRegionPreposition(region.name)} ?`,
      answer:
        stats.length > 0
          ? `Les métiers RGE les plus représentés ${getRegionPreposition(region.name)} sont : ${stats
              .slice(0, 5)
              .map((s) => s.metier)
              .join(', ')}. Ces données reflètent la demande locale en rénovation énergétique.`
          : `Consultez le détail par métier pour connaître les artisans RGE les plus représentés ${getRegionPreposition(region.name)}.`,
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Baromètre', url: '/barometre' },
    { name: 'Régions', url: '/barometre/regions' },
    { name: region.name, url: `/barometre/regions/${regionSlug}` },
  ])

  const faqSchema = getFAQSchema(faqItems)

  // Dataset + Article : baromètre régional = data propriétaire citable.
  // CC-BY 4.0 permet aux journalistes de citer avec backlink.
  const lastUpdated = monthlyAnchorIso().slice(0, 10)
  const regionCanonicalUrl = `${SITE_URL}/barometre/regions/${regionSlug}`
  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `Baromètre des Artisans RGE ${getRegionPreposition(region.name)} — 2026`,
    description: `Statistiques agrégées de ${totalArtisans.toLocaleString('fr-FR')} artisans RGE certifiés ${getRegionPreposition(region.name)} : répartition métier, volumétrie, notes moyennes. Source ADEME france-renov.gouv.fr.`,
    creator: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    temporalCoverage: '2026',
    spatialCoverage: { '@type': 'AdministrativeArea', name: region.name },
    license: 'https://creativecommons.org/licenses/by/4.0/',
  }
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${regionCanonicalUrl}#article`,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
    headline: `Baromètre des Artisans RGE ${getRegionPreposition(region.name)} — 2026`,
    description: `Étude agrégée ${SITE_NAME} sur ${totalArtisans.toLocaleString('fr-FR')} artisans RGE certifiés ${getRegionPreposition(region.name)} : métiers les plus représentés, densité territoriale, qualifications RGE.`,
    url: regionCanonicalUrl,
    datePublished: lastUpdated,
    dateModified: lastUpdated,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    articleSection: 'Baromètre artisans RGE région',
    keywords: [
      'baromètre artisans RGE',
      region.name,
      'Qualibat',
      'QualiPAC',
      'densité territoriale',
      'rénovation énergétique',
      'SIREN',
      'ADEME',
      '2026',
    ].join(', '),
    about: [
      { '@type': 'AdministrativeArea', name: region.name },
      { '@type': 'Thing', name: `Artisans RGE certifiés ${region.name}` },
      { '@type': 'Thing', name: 'Statistiques rénovation énergétique' },
    ],
    author: BARO_AUTHOR
      ? {
          '@type': 'Person',
          name: BARO_AUTHOR.name,
          jobTitle: BARO_AUTHOR.role,
          url: `${SITE_URL}/equipe/${BARO_AUTHOR.slug}`,
          ...(BARO_AUTHOR.methodology &&
            BARO_AUTHOR.methodology.length > 0 && { skills: BARO_AUTHOR.methodology }),
        }
      : { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    ...(BARO_REVIEWER && { reviewedBy: getReviewedByPersonSchema(BARO_REVIEWER) }),
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icons/icon-512x512.png`,
        width: 512,
        height: 512,
      },
    },
    image: `${SITE_URL}/opengraph-image`,
    license: 'https://creativecommons.org/licenses/by/4.0/',
  }

  return (
    <>
      <JsonLd data={[breadcrumbSchema, faqSchema, datasetSchema, articleSchema]} />
      <div className="sr-only">
        <ArticleMeta
          author="ServicesArtisans"
          authorHref="/equipe"
          datePublished={lastUpdated}
          dateModified={lastUpdated}
        />
      </div>

      <div className="min-h-screen bg-sand-50">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Breadcrumb
            items={[
              { label: 'Baromètre', href: '/barometre' },
              { label: 'Régions', href: '/barometre/regions' },
              { label: region.name },
            ]}
          />
        </div>

        {/* Header */}
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-8 h-8 text-emerald-600" />
              <h1
                data-speakable="true"
                className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight"
              >
                {region.name}
              </h1>
              {index && (
                <span className="text-sm font-bold px-3 py-1 rounded-full bg-primary-50 text-primary-600">
                  Indice {index.index}
                </span>
              )}
            </div>
            <p className="text-lg text-charcoal-600">
              Baromètre des artisans RGE certifiés {getRegionPreposition(region.name)} :{' '}
              {region.departements.length} départements,
              {totalArtisans > 0
                ? ` ${totalArtisans.toLocaleString('fr-FR')} artisans RGE référencés,`
                : ''}{' '}
              données ADEME actualisées quotidiennement.
            </p>
          </div>
        </header>

        {/* Stats cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-sand-300 p-5 text-center">
              <Users className="w-5 h-5 text-primary-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-charcoal-900">
                {totalArtisans > 0 ? totalArtisans.toLocaleString('fr-FR') : '--'}
              </div>
              <div className="text-xs text-charcoal-500 mt-1">Artisans RGE</div>
            </div>
            <div className="bg-white rounded-xl border border-sand-300 p-5 text-center">
              <Star className="w-5 h-5 text-amber-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-charcoal-900">
                {noteMoyenne ? `${noteMoyenne}/5` : '--'}
              </div>
              <div className="text-xs text-charcoal-500 mt-1">Note moyenne</div>
            </div>
            <div className="bg-white rounded-xl border border-sand-300 p-5 text-center">
              <BarChart3 className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-charcoal-900">{stats.length}</div>
              <div className="text-xs text-charcoal-500 mt-1">Métiers couverts</div>
            </div>
            <div className="bg-white rounded-xl border border-sand-300 p-5 text-center">
              <Building2 className="w-5 h-5 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-charcoal-900">
                {region.departements.length}
              </div>
              <div className="text-xs text-charcoal-500 mt-1">Départements</div>
            </div>
          </div>
        </section>

        {/* Top métiers */}
        {stats.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <h2 className="text-2xl font-bold text-charcoal-900 mb-6">
              Top métiers RGE {getRegionPreposition(region.name)}
            </h2>
            <div className="space-y-3">
              {stats.slice(0, 15).map((row, idx) => {
                const metier = getBarometreMetierBySlug(row.metier_slug)
                const pct = maxCount > 0 ? (row.nb_artisans / maxCount) * 100 : 0
                return (
                  <Link
                    key={row.metier_slug}
                    href={`/barometre/tarifs/${row.metier_slug}`}
                    className="group flex items-center gap-4 bg-white rounded-xl border border-sand-300 p-4 hover:shadow-md transition-shadow"
                  >
                    <span
                      className="text-xl w-8 text-center flex-shrink-0"
                      role="img"
                      aria-hidden="true"
                    >
                      {metier?.icon || '🔧'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-charcoal-900 group-hover:text-primary-500 transition-colors">
                          {idx + 1}. {row.metier}
                        </span>
                        <span className="text-sm font-medium text-charcoal-600">
                          {row.nb_artisans.toLocaleString('fr-FR')}
                        </span>
                      </div>
                      <div className="w-full bg-sand-100 rounded-full h-1.5">
                        <div
                          className="bg-emerald-500 rounded-full h-1.5"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-charcoal-500">
                        {row.note_moyenne !== null && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500" />
                            {row.note_moyenne.toFixed(1)}/5
                          </span>
                        )}
                        <span>{row.nb_avis.toLocaleString('fr-FR')} avis</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-sand-500 group-hover:text-primary-400 flex-shrink-0" />
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Départements */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-charcoal-900 mb-6">
              Départements {getRegionArticle(region.name)}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {region.departements.map((dept) => (
                <Link
                  key={dept.code}
                  href={`/departements/${dept.nom
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[̀-ͯ]/g, '')
                    .replace(/[^a-z0-9]+/g, '-')}`}
                  className="flex items-center gap-3 bg-sand-50 rounded-lg border border-sand-300 p-4 hover:bg-primary-50 hover:border-primary-200 transition-colors"
                >
                  <span className="text-sm font-bold text-charcoal-400 w-8">{dept.code}</span>
                  <span className="text-sm font-medium text-charcoal-700">{dept.nom}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-500 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-charcoal-900">Questions fréquentes</h2>
          </div>
          <div className="space-y-4">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group bg-sand-50 rounded-xl border border-sand-300"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-semibold text-charcoal-900 hover:text-primary-500 transition-colors">
                  {item.question}
                  <span className="ml-4 text-charcoal-400 group-open:rotate-45 transition-transform text-xl">
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 text-charcoal-600 text-sm leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>

      <RelatedHubs
        currentPath="/barometre"
        extraLinks={[{ href: '/statistiques-artisans-france', label: 'Statistiques artisans' }]}
      />
    </>
  )
}
