import { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, ArrowRight, Building2 } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { SITE_URL, SITE_NAME } from '@/lib/seo/config'
import { BAROMETRE_REGIONS } from '@/lib/barometre/constants'
import { regionalIndices } from '@/lib/data/barometre'

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

const canonicalUrl = `${SITE_URL}/barometre/regions`

export const metadata: Metadata = {
  title: `Baromètre par région — Artisans en France`,
  description:
    "Explorez les statistiques des artisans par région : Île-de-France, Auvergne-Rhône-Alpes, PACA, Occitanie et les 13 régions métropolitaines. Indices de prix, nombre d'artisans et tendances.",
  alternates: { canonical: canonicalUrl },
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

  return (
    <>
      <JsonLd data={breadcrumbSchema} />

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
