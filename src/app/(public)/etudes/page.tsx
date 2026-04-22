import { Metadata } from 'next'
import Link from 'next/link'
import { BarChart3, ArrowRight, MapPin } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'

const canonicalUrl = `${SITE_URL}/etudes`

export const metadata: Metadata = {
  title: 'Études et données artisanat France',
  description:
    'Études exclusives sur l’artisanat en France : déserts artisanaux, densité par département, métiers en tension. Données SIREN officielles.',
  alternates: getAlternates('/etudes'),
  robots: { index: true, follow: true },
  openGraph: {
    locale: 'fr_FR',
    title: `Études et données | ${SITE_NAME}`,
    description:
      'Études exclusives sur l’artisanat en France. Données officielles, analyses par département et par métier.',
    url: canonicalUrl,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: `Études artisanat — ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Études et données | ${SITE_NAME}`,
    description: 'Études exclusives sur l’artisanat en France.',
    images: [`${SITE_URL}/opengraph-image`],
  },
}

export const revalidate = 86400

const studies = [
  {
    slug: 'deserts-artisanaux',
    title: 'Déserts artisanaux : la carte des départements en manque d’artisans',
    date: '28 mars 2026',
    description:
      'Analyse de la densité artisanale dans les 101 départements français. Classement complet, top 10 des déserts, métiers en tension.',
    icon: MapPin,
    color: 'bg-red-50 text-red-600 border-red-200',
  },
]

export default function EtudesPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Études', url: '/etudes' },
  ])

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd data={breadcrumbSchema} />

      <section className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumb items={[{ label: 'Études' }]} className="mb-4" />
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-8 h-8 text-primary-500" />
            <h1 className="font-heading text-3xl font-bold text-charcoal-900">Études et données</h1>
          </div>
          <p className="text-lg text-charcoal-600 max-w-2xl">
            Analyses exclusives sur l&apos;artisanat en France, basées sur les données SIREN
            officielles et les statistiques des chambres des métiers.
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
                  className="block bg-white border border-sand-300 rounded-xl p-6 hover:shadow-md hover:border-primary-200 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-xl border flex-shrink-0 ${study.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-charcoal-400 mb-1">{study.date}</p>
                      <h2 className="font-heading text-lg font-bold text-charcoal-900 group-hover:text-primary-500 transition-colors mb-2">
                        {study.title}
                      </h2>
                      <p className="text-charcoal-600 text-sm">{study.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-charcoal-400 group-hover:text-primary-500 transition-colors flex-shrink-0 mt-1" />
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
