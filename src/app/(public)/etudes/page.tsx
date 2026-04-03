import { Metadata } from 'next'
import Link from 'next/link'
import { BarChart3, ArrowRight, MapPin } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { SITE_URL, SITE_NAME } from '@/lib/seo/config'

const canonicalUrl = `${SITE_URL}/etudes`

export const metadata: Metadata = {
  title: '\u00c9tudes et donn\u00e9es sur l\u2019artisanat en France',
  description:
    '\u00c9tudes exclusives sur l\u2019artisanat en France : d\u00e9serts artisanaux, densit\u00e9 par d\u00e9partement, m\u00e9tiers en tension. Donn\u00e9es SIREN officielles.',
  alternates: { canonical: canonicalUrl },
  robots: { index: true, follow: true },
  openGraph: {
    locale: 'fr_FR',
    title: `\u00c9tudes et donn\u00e9es | ${SITE_NAME}`,
    description:
      '\u00c9tudes exclusives sur l\u2019artisanat en France. Donn\u00e9es officielles, analyses par d\u00e9partement et par m\u00e9tier.',
    url: canonicalUrl,
    type: 'website',
    images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: `\u00c9tudes artisanat \u2014 ${SITE_NAME}` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `\u00c9tudes et donn\u00e9es | ${SITE_NAME}`,
    description: '\u00c9tudes exclusives sur l\u2019artisanat en France.',
    images: [`${SITE_URL}/opengraph-image`],
  },
}

export const revalidate = 86400

const studies = [
  {
    slug: 'deserts-artisanaux',
    title: 'D\u00e9serts artisanaux : la carte des d\u00e9partements en manque d\u2019artisans',
    date: '28 mars 2026',
    description:
      'Analyse de la densit\u00e9 artisanale dans les 101 d\u00e9partements fran\u00e7ais. Classement complet, top 10 des d\u00e9serts, m\u00e9tiers en tension.',
    icon: MapPin,
    color: 'bg-red-50 text-red-600 border-red-200',
  },
]

export default function EtudesPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: '\u00c9tudes', url: '/etudes' },
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={breadcrumbSchema} />

      <section className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumb items={[{ label: '\u00c9tudes' }]} className="mb-4" />
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h1 className="font-heading text-3xl font-bold text-gray-900">
              \u00c9tudes et donn\u00e9es
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl">
            Analyses exclusives sur l&apos;artisanat en France, bas\u00e9es sur les donn\u00e9es
            SIREN officielles et les statistiques des chambres des m\u00e9tiers.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {studies.map((study) => {
              const Icon = study.icon
              return (
                <Link
                  key={study.slug}
                  href={`/etudes/${study.slug}`}
                  className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-blue-200 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl border flex-shrink-0 ${study.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-400 mb-1">{study.date}</p>
                      <h2 className="font-heading text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                        {study.title}
                      </h2>
                      <p className="text-gray-600 text-sm">{study.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
