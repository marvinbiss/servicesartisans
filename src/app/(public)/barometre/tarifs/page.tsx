import { Metadata } from 'next'
import Link from 'next/link'
import { BarChart3, Star, Users, ArrowRight } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { ArticleMeta } from '@/components/ArticleMeta'
import { getBreadcrumbSchema, getReviewedByPersonSchema } from '@/lib/seo/jsonld'
import { authors, getReviewerForAuthor } from '@/lib/data/authors'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'

const BARO_AUTHOR = authors['claire-dubois']
const BARO_REVIEWER = getReviewerForAuthor(BARO_AUTHOR)
import { getTopMetiers } from '@/lib/barometre/queries'
import { getBarometreMetierBySlug } from '@/lib/barometre/constants'
import { monthlyAnchorIso } from '@/lib/seo/sprint-helpers'

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

const canonicalUrl = `${SITE_URL}/barometre/tarifs`

export const metadata: Metadata = {
  title: `Stats par métier RGE — Baromètre`,
  description:
    'Statistiques par métier RGE certifié : pompe à chaleur, isolation, photovoltaïque, plomberie, électricité. Volumes, notes et avis par métier 2026.',
  alternates: getAlternates('/barometre/tarifs'),
  robots: { index: true, follow: true },
  openGraph: {
    locale: 'fr_FR',
    title: `Statistiques par métier RGE — Baromètre Artisans`,
    description: 'Stats détaillées par corps de métier RGE certifié en France.',
    url: canonicalUrl,
    type: 'website',
  },
}

export const revalidate = 86400

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function BarometreTarifsPage() {
  const metiers = await getTopMetiers(50) // All available

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Baromètre', url: '/barometre' },
    { name: 'Métiers', url: '/barometre/tarifs' },
  ])

  // Dataset + Article schemas : baromètre tarifs = data propriétaire
  // citable (CC-BY 4.0). Rend la page éligible à Top Stories et aux
  // backlinks journalistes sur les requêtes "statistiques artisans métier".
  const lastUpdated = monthlyAnchorIso().slice(0, 10)
  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Statistiques par métier — Artisans RGE France 2026',
    description: `Statistiques agrégées par métier RGE certifié (Qualibat, Qualifelec, QualiPAC, Qualit'EnR) en France : volumes, notes moyennes, taux de vérification SIREN sur ${metiers.length} corps de métier RGE. Source ADEME.`,
    creator: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    temporalCoverage: '2026',
    spatialCoverage: { '@type': 'Place', name: 'France' },
    license: 'https://creativecommons.org/licenses/by/4.0/',
  }
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${canonicalUrl}#article`,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
    headline: 'Baromètre des Artisans RGE par métier — France 2026',
    description: `Analyse comparée ${SITE_NAME} des corps de métier RGE certifiés en France : volumétrie, notes moyennes, répartition géographique. Source ADEME.`,
    url: canonicalUrl,
    datePublished: lastUpdated,
    dateModified: lastUpdated,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    articleSection: 'Baromètre artisans RGE par métier',
    keywords: [
      'baromètre métiers RGE',
      'corps de métier rénovation énergétique',
      'artisans RGE France',
      'Qualibat',
      'Qualifelec',
      'QualiPAC',
      'volumétrie sectorielle',
      'notes moyennes',
      '2026',
    ].join(', '),
    about: [
      { '@type': 'Thing', name: 'Métiers RGE' },
      { '@type': 'Country', name: 'France' },
      { '@type': 'Thing', name: 'Statistiques rénovation énergétique par métier' },
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
      <JsonLd data={[breadcrumbSchema, datasetSchema, articleSchema]} />
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
          <Breadcrumb items={[{ label: 'Baromètre', href: '/barometre' }, { label: 'Métiers' }]} />
        </div>

        {/* Header */}
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 text-primary-600 rounded-full text-sm font-medium mb-6">
              <BarChart3 className="w-4 h-4" />
              {metiers.length} métiers RGE référencés
            </div>
            <h1
              data-speakable="true"
              className="text-4xl sm:text-5xl font-extrabold text-charcoal-900 tracking-tight mb-4"
            >
              Statistiques par métier RGE
            </h1>
            <p className="text-lg text-charcoal-600 leading-relaxed">
              Explorez les données détaillées pour chaque corps de métier RGE certifié (Qualibat,
              Qualifelec, QualiPAC, Qualit&apos;EnR) : nombre d&apos;artisans RGE, note moyenne et
              avis clients.
            </p>
          </div>
        </header>

        {/* Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {metiers.map((row) => {
              const metier = getBarometreMetierBySlug(row.metier_slug)
              return (
                <Link
                  key={row.metier_slug}
                  href={`/barometre/tarifs/${row.metier_slug}`}
                  className="group bg-white rounded-xl border border-sand-300 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl" role="img" aria-hidden="true">
                      {metier?.icon || '🔧'}
                    </span>
                    <h2 className="font-semibold text-charcoal-900 group-hover:text-primary-500 transition-colors">
                      {row.metier}
                    </h2>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-charcoal-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {/* Pivot full RGE 2026-05-05 — nb_artisans agrège tous
                          providers actifs ; ratio 0.14 dérive l'estimation
                          RGE-only (cf. CarteClient.tsx). */}
                      {Math.round(row.nb_artisans * 0.14).toLocaleString('fr-FR')}
                    </span>
                    {row.note_moyenne !== null && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        {row.note_moyenne.toFixed(1)}
                      </span>
                    )}
                    <span>{row.nb_avis.toLocaleString('fr-FR')} avis</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="w-full bg-sand-100 rounded-full h-1.5 mr-3">
                      <div
                        className="bg-primary-400 rounded-full h-1.5"
                        style={{
                          width: `${metiers[0] ? (row.nb_artisans / metiers[0].nb_artisans) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <ArrowRight className="w-4 h-4 text-sand-500 group-hover:text-primary-400 flex-shrink-0" />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </>
  )
}
