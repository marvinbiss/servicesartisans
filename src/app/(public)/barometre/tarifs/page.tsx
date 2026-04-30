import { Metadata } from 'next'
import Link from 'next/link'
import { BarChart3, Star, Users, ArrowRight } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { ArticleMeta } from '@/components/ArticleMeta'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getTopMetiers } from '@/lib/barometre/queries'
import { getBarometreMetierBySlug } from '@/lib/barometre/constants'

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

const canonicalUrl = `${SITE_URL}/barometre/tarifs`

export const metadata: Metadata = {
  title: `Stats par métier — Baromètre`,
  description:
    'Consultez les statistiques par métier : plombier, électricien, maçon, couvreur. Volumes, notes moyennes et avis par corps de métier en France 2026.',
  alternates: getAlternates('/barometre/tarifs'),
  robots: { index: true, follow: true },
  openGraph: {
    locale: 'fr_FR',
    title: `Statistiques par métier — Baromètre Artisans`,
    description: 'Stats détaillées par corps de métier du bâtiment en France.',
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
  const lastUpdated = new Date().toISOString().slice(0, 10)
  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Statistiques par métier — Artisans France 2026',
    description: `Statistiques agrégées par métier du bâtiment en France : volumes, notes moyennes, taux de vérification SIREN sur ${metiers.length} corps de métier.`,
    creator: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    temporalCoverage: '2026',
    spatialCoverage: { '@type': 'Place', name: 'France' },
    license: 'https://creativecommons.org/licenses/by/4.0/',
  }
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Baromètre des Artisans par métier — France 2026',
    description: `Analyse comparée ${SITE_NAME} des corps de métier du bâtiment en France : volumétrie, notes moyennes, répartition géographique.`,
    url: canonicalUrl,
    datePublished: lastUpdated,
    dateModified: lastUpdated,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
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
    isAccessibleForFree: true,
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
              {metiers.length} métiers référencés
            </div>
            <h1
              data-speakable="true"
              className="text-4xl sm:text-5xl font-extrabold text-charcoal-900 tracking-tight mb-4"
            >
              Statistiques par métier
            </h1>
            <p className="text-lg text-charcoal-600 leading-relaxed">
              Explorez les données détaillées pour chaque corps de métier du bâtiment : nombre
              d'artisans, note moyenne et avis clients.
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
                      {row.nb_artisans.toLocaleString('fr-FR')}
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
