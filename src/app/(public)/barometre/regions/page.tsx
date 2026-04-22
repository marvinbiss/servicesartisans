import { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, ArrowRight, Building2 } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { ArticleMeta } from '@/components/ArticleMeta'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { BAROMETRE_REGIONS } from '@/lib/barometre/constants'
import { regionalIndices } from '@/lib/data/barometre'

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

const canonicalUrl = `${SITE_URL}/barometre/regions`

export const metadata: Metadata = {
  title: `Baromètre par région — Artisans en France`,
  description:
    'Découvrez les statistiques des artisans par région : Île-de-France, Auvergne-Rhône-Alpes, PACA, Occitanie. Indices de prix, volumes et tendances 2026.',
  alternates: getAlternates('/barometre/regions'),
  robots: { index: true, follow: true },
  openGraph: {
    locale: 'fr_FR',
    title: `Baromètre par région | ${SITE_NAME}`,
    description: 'Statistiques des artisans par région en France.',
    url: canonicalUrl,
    type: 'website',
  },
}

export const revalidate = 86400

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function BarometreRegionsPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Baromètre', url: '/barometre' },
    { name: 'Régions', url: '/barometre/regions' },
  ])

  const lastUpdated = new Date().toISOString().slice(0, 10)

  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Indices régionaux des prix artisans — France 2026',
    description:
      'Indices de prix par région métropolitaine (base 100 = moyenne nationale) calculés sur les devis réels transmis par notre réseau d’artisans sur l’année en cours.',
    creator: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    temporalCoverage: '2026',
    spatialCoverage: { '@type': 'Country', name: 'France' },
    inLanguage: 'fr',
    url: canonicalUrl,
    license: 'https://creativecommons.org/licenses/by/4.0/',
    isAccessibleForFree: true,
    variableMeasured: [
      'Indice régional de prix (base 100)',
      'Nombre de départements',
      'Nombre d’artisans référencés',
    ],
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Baromètre des prix artisans par région — France 2026',
    description:
      'Analyse comparée des prix des artisans du bâtiment par région : indices base 100, volumétrie et tendances 2026.',
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

  const faqSchema = getFAQSchema([
    {
      question: 'Que représente l’indice régional des prix ?',
      answer:
        "L'indice régional des prix est calculé en base 100, où 100 correspond à la moyenne nationale. Un indice de 120 signifie que les prix de la région sont 20 % supérieurs à la moyenne française, tandis qu'un indice de 95 signifie 5 % en dessous.",
    },
    {
      question: 'Comment sont calculés ces indices ?',
      answer:
        "Les indices sont calculés à partir des devis signés transmis par notre réseau d'artisans et pondérés par la volumétrie de chaque métier. Les données sont mises à jour tous les trimestres à partir d'un échantillon glissant de 12 mois.",
    },
    {
      question: 'Quelle région de France a les prix les plus élevés ?',
      answer:
        "L'Île-de-France, la Côte d'Azur (PACA) et l'Auvergne-Rhône-Alpes (zones urbaines denses, tension immobilière) présentent historiquement les indices les plus élevés. À l'inverse, l'Occitanie intérieure, la Bourgogne-Franche-Comté et certaines régions rurales affichent des indices en dessous de la moyenne.",
    },
    {
      question: 'Les indices tiennent-ils compte de l’inflation ?',
      answer:
        "Oui. L'indice est calculé sur les prix courants (TTC), ce qui intègre mécaniquement l'inflation des matériaux et de la main-d'œuvre. Pour comparer les évolutions entre régions, nous publions également les taux d'évolution trimestriels corrigés de l'inflation nationale.",
    },
    {
      question: 'Puis-je réutiliser ces indices dans un article ?',
      answer:
        'Oui, avec mention de la source « Baromètre ServicesArtisans » et lien vers cette page. Les données du baromètre sont publiées sous licence Creative Commons BY 4.0 ; le service presse fournit sur demande des visuels haute définition et analyses complémentaires.',
    },
  ])

  return (
    <>
      <JsonLd data={[breadcrumbSchema, datasetSchema, articleSchema, faqSchema]} />
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
          <Breadcrumb items={[{ label: 'Baromètre', href: '/barometre' }, { label: 'Régions' }]} />
        </div>

        {/* Header */}
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium mb-6">
              <MapPin className="w-4 h-4" />
              13 régions métropolitaines
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-charcoal-900 tracking-tight mb-4">
              Baromètre par région
            </h1>
            <p className="text-lg text-charcoal-600 leading-relaxed">
              Découvrez les statistiques des artisans du bâtiment pour chaque région de France.
              Indices de prix, métiers les plus représentés et données départementales.
            </p>
          </div>
        </header>

        {/* Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BAROMETRE_REGIONS.map((region) => {
              const index = regionalIndices.find((r) => r.regionSlug === region.slug)
              const indexValue = index?.index ?? 100

              let indexColor = 'text-charcoal-700 bg-sand-50'
              if (indexValue >= 120) indexColor = 'text-red-700 bg-red-50'
              else if (indexValue >= 105) indexColor = 'text-orange-700 bg-orange-50'
              else if (indexValue < 96) indexColor = 'text-green-700 bg-green-50'

              return (
                <Link
                  key={region.slug}
                  href={`/barometre/regions/${region.slug}`}
                  className="group bg-white rounded-xl border border-sand-300 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="font-semibold text-charcoal-900 group-hover:text-primary-500 transition-colors text-lg">
                      {region.name}
                    </h2>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${indexColor}`}>
                      {indexValue}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-charcoal-500 mb-4">
                    <Building2 className="w-3.5 h-3.5" />
                    {region.departements.length} département
                    {region.departements.length > 1 ? 's' : ''}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {region.departements.slice(0, 4).map((d) => (
                      <span
                        key={d.code}
                        className="text-xs bg-sand-100 text-charcoal-600 px-2 py-0.5 rounded"
                      >
                        {d.code}
                      </span>
                    ))}
                    {region.departements.length > 4 && (
                      <span className="text-xs bg-sand-100 text-charcoal-500 px-2 py-0.5 rounded">
                        +{region.departements.length - 4}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-sm text-primary-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Explorer <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Légende indices */}
        <section className="bg-white py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl font-bold text-charcoal-900 mb-4">Indice régional des prix</h2>
            <p className="text-charcoal-600 mb-6">
              L'indice affiché sur chaque carte représente le niveau de prix par rapport à la
              moyenne nationale (base 100). Un indice de 130 signifie que les prix sont 30%
              supérieurs à la moyenne.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-4 h-4 rounded bg-green-50 border border-green-200" />
                <span className="text-charcoal-600">&lt; 96 (en dessous)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-4 h-4 rounded bg-sand-50 border border-sand-300" />
                <span className="text-charcoal-600">96-104 (moyenne)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-4 h-4 rounded bg-orange-50 border border-orange-200" />
                <span className="text-charcoal-600">105-119 (au-dessus)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-4 h-4 rounded bg-red-50 border border-red-200" />
                <span className="text-charcoal-600">&ge; 120 (nettement au-dessus)</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
