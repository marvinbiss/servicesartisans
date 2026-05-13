import { Metadata } from 'next'
import Link from 'next/link'
import { BarChart3, ArrowRight, MapPin } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import { ArticleMeta } from '@/components/ArticleMeta'
import { PageHeroH1 } from '@/components/ui/PageHeroH1'
import { monthlyAnchorIso } from '@/lib/seo/sprint-helpers'

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

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Études et données ServicesArtisans',
    url: canonicalUrl,
    description:
      'Index des études propriétaires ServicesArtisans sur l’artisanat en France (densité, tensions, prix, qualifications RGE).',
    numberOfItems: studies.length,
    hasPart: studies.map((s) => ({
      '@type': 'Report',
      name: s.title,
      url: `${SITE_URL}/etudes/${s.slug}`,
      description: s.description,
    })),
    license: 'https://creativecommons.org/licenses/by/4.0/',
    isAccessibleForFree: true,
  }

  const faqSchema = getFAQSchema([
    {
      question: 'Qui publie ces études ?',
      answer: `Toutes les études sont publiées par la rédaction de ${SITE_NAME} à partir des données officielles (SIREN/Sirene INSEE, base ADEME france-renov.gouv.fr, CAPEB, FFB, CMA) croisées avec les données internes de notre réseau d'artisans. Chaque étude mentionne ses sources, sa méthodologie et ses limites.`,
    },
    {
      question: 'À quelle fréquence les données sont-elles mises à jour ?',
      answer:
        'Les études structurelles (déserts artisanaux, densité) sont actualisées annuellement avec les dernières données INSEE. Les études conjoncturelles (indices de prix, tensions métiers) sont rafraîchies chaque trimestre. La date de publication et la date de dernière mise à jour sont indiquées en tête de chaque étude.',
    },
    {
      question: 'Puis-je citer ces études dans un article ou un rapport ?',
      answer:
        "Oui. Nos études sont publiées sous licence Creative Commons BY 4.0 : vous pouvez reprendre les données, citations et graphiques en mentionnant la source « ServicesArtisans » et en incluant un lien vers la page d'étude. Pour les médias, notre service presse fournit visuels haute définition et analyses complémentaires.",
    },
    {
      question: 'Les données brutes sont-elles téléchargeables ?',
      answer:
        "Certaines séries sont exposées via notre API publique (/api/v1/rge/*), d'autres sont disponibles sous forme de tableaux HTML réutilisables. Pour une demande de dataset spécifique (CSV, JSON), contactez presse@servicesartisans.fr.",
    },
    {
      question: 'Comment suggérer un sujet d’étude ?',
      answer:
        "Journalistes, chercheurs et élus peuvent suggérer un axe d'étude via notre espace presse. Nous priorisons les sujets d'intérêt général (tensions métiers, déserts artisanaux, évolutions des prix) et les analyses territoriales (département, région, métropole).",
    },
  ])

  const dateModifiedIso = monthlyAnchorIso()
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Études et données artisanat France — ${SITE_NAME}`,
    description:
      'Analyses propriétaires sur l’artisanat en France basées sur les données SIREN officielles, croisées avec ADEME et les statistiques internes du réseau.',
    url: canonicalUrl,
    datePublished: '2026-03-28T08:00:00.000Z',
    dateModified: dateModifiedIso,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    image: `${SITE_URL}/opengraph-image`,
    author: {
      '@type': 'Organization',
      name: 'Équipe éditoriale ServicesArtisans',
      url: `${SITE_URL}/a-propos`,
      '@id': `${SITE_URL}#organization`,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
    license: 'https://creativecommons.org/licenses/by/4.0/',
  }

  const enBrefPoints = [
    `${studies.length} étude${studies.length > 1 ? 's' : ''} propriétaire publiée(s) à ce jour`,
    `Sources : SIREN/SIRENE INSEE, ADEME france-renov.gouv.fr, CAPEB, FFB, CMA`,
    `Méthodologie chiffrée, sources référencées, limites explicites`,
    `Licence CC-BY 4.0 — citation autorisée avec lien vers la source`,
  ]

  const tldrBullets = [
    `Études quantitatives sur l’artisanat français à partir de données officielles SIREN/INSEE croisées avec ADEME et les chambres des métiers (CAPEB, FFB, CMA).`,
    `Études structurelles (densité, déserts artisanaux) actualisées annuellement ; études conjoncturelles (prix, tensions métiers) trimestriellement.`,
    `Toutes les analyses sont publiées sous licence Creative Commons BY 4.0 : reprise autorisée avec mention « ServicesArtisans » et lien.`,
    `Pour suggérer un sujet ou demander un dataset CSV/JSON personnalisé, contacter presse@servicesartisans.fr.`,
  ]

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd data={[articleSchema, breadcrumbSchema, collectionSchema, faqSchema]} />

      <section className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumb items={[{ label: 'Études' }]} className="mb-4" />
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-8 h-8 text-primary-500" />
            <PageHeroH1 size="article">Études et données</PageHeroH1>
          </div>
          <p className="text-lg text-charcoal-600 max-w-2xl">
            Analyses exclusives sur l&apos;artisanat en France, basées sur les données SIREN
            officielles et les statistiques des chambres des métiers.
          </p>
          <div className="mt-6 space-y-4">
            <ArticleMeta
              author="Équipe éditoriale ServicesArtisans"
              authorHref="/a-propos"
              datePublished="2026-03-28T08:00:00.000Z"
              dateModified={dateModifiedIso}
            />
            <EnBrefBox keyPoints={enBrefPoints} />
            <TldrBlock bullets={tldrBullets} />
          </div>
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
