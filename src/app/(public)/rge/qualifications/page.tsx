import type { Metadata } from 'next'
import Link from 'next/link'
import { Award, ArrowRight, ShieldCheck } from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import {
  RGE_QUALIFICATION_GUIDES,
  RGE_QUALIFICATIONS_WITH_GUIDE,
} from '@/lib/rge/qualification-guides-content'
import { getRgeLastSyncDate } from '@/lib/rge/last-sync'
import LastUpdated from '@/components/seo/LastUpdated'
import { logger } from '@/lib/logger'

export const revalidate = 86400

const path = '/rge/qualifications'

export const metadata: Metadata = {
  title: 'Qualifications RGE : QualiPAC, QualiBois',
  description:
    'Comprendre les qualifications RGE officielles : QualiPAC, QualiSol, QualiBois Air/Eau, Qualifelec et QualiPV. Périmètre, primes débloquées et vérification.',
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1 as const,
    'max-image-preview': 'large' as const,
    'max-video-preview': -1 as const,
  },
  openGraph: {
    title: 'Qualifications RGE — guides officiels',
    description:
      "Guides officiels des qualifications RGE Qualit'EnR et Qualifelec : QualiPAC, QualiSol, QualiBois, Qualifelec, QualiPV.",
    type: 'website',
    locale: 'fr_FR',
    url: `${SITE_URL}${path}`,
  },
  alternates: getAlternates(path),
}

export default async function RgeQualificationsHubPage() {
  // Fail-open strict — si la DB est down, `lastSyncDate` = null et le
  // composant `LastUpdated` retombera sur la date de rendu ISR.
  const lastSyncDate = await getRgeLastSyncDate().catch((err: unknown) => {
    logger.error('rge_qualifications_hub.last_sync_error', err as Error, {
      route: 'rge/qualifications',
    })
    return null
  })

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Artisans RGE', url: '/rge' },
    { name: 'Qualifications', url: path },
  ])

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Qualifications RGE officielles',
    url: `${SITE_URL}${path}`,
    description:
      "Index des principales qualifications RGE reconnues par l'État pour MaPrimeRénov' et les primes CEE.",
    hasPart: RGE_QUALIFICATIONS_WITH_GUIDE.map((slug) => {
      const g = RGE_QUALIFICATION_GUIDES[slug]
      return {
        '@type': 'Article',
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', '[data-speakable="true"]'],
        },
        name: g.name,
        url: `${SITE_URL}/rge/qualifications/${slug}`,
      }
    }),
  }

  const faqSchema = getFAQSchema([
    {
      question: "Qu'est-ce qu'une qualification RGE ?",
      answer:
        "RGE (Reconnu Garant de l'Environnement) est un signe de qualité délivré par des organismes accrédités (Qualibat, Qualit'EnR, Qualifelec, Cequami) et reconnu par l'État pour les travaux de rénovation énergétique. Un artisan RGE doit justifier de compétences techniques, d'assurances valides et d'un audit sur chantier.",
    },
    {
      question: 'Quelles qualifications RGE pour quels travaux ?',
      answer:
        "QualiPAC pour les pompes à chaleur, QualiBois Air (poêles) et QualiBois Eau (chaudières biomasse), QualiSol pour le solaire thermique, QualiPV pour le photovoltaïque, Qualifelec Mention ENR pour l'électricité liée aux EnR et IRVE, Qualibat 7141 pour l'isolation des combles, 7131/8722 pour l'ITE. Chaque prime CEE ou MaPrimeRénov' exige une qualification précise.",
    },
    {
      question: "L'artisan RGE est-il obligatoire pour toucher MaPrimeRénov' ?",
      answer:
        "Oui. Le recours à un artisan RGE est obligatoire pour bénéficier de MaPrimeRénov', des primes CEE, de l'éco-PTZ et de la TVA réduite à 5,5 % sur les travaux d'économie d'énergie. La qualification doit être valide le jour de la signature du devis. La liste officielle est consultable sur france-renov.gouv.fr.",
    },
    {
      question: 'Comment vérifier qu’un artisan est réellement RGE ?',
      answer:
        "Vérifiez sur france-renov.gouv.fr en saisissant le nom ou le SIRET de l'entreprise. Notre annuaire est synchronisé hebdomadairement avec la base officielle ADEME : chaque fiche RGE affiche la qualification exacte, sa date de validité et l'organisme certificateur.",
    },
    {
      question: 'Que faire si l’artisan perd sa qualification entre signature et travaux ?',
      answer:
        "Si la qualification RGE expire entre la signature du devis et la fin des travaux, les aides peuvent être refusées. Demandez à l'artisan une attestation de renouvellement en cours et privilégiez les entreprises dont la qualification est valide au moins 6 mois après la fin prévue du chantier.",
    },
  ])

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={[breadcrumbSchema, collectionSchema, faqSchema]} />

      <Breadcrumb items={[{ label: 'Artisans RGE', href: '/rge' }, { label: 'Qualifications' }]} />

      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-charcoal-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span className="text-sm font-medium text-emerald-100">
              Guides officiels des qualifications RGE
            </span>
          </div>
          <h1
            data-speakable="true"
            className="font-heading text-4xl md:text-5xl font-extrabold leading-tight mb-4"
          >
            Qualifications RGE&nbsp;: le référentiel complet
          </h1>
          <p className="text-lg text-emerald-50/90 max-w-3xl leading-relaxed">
            Comprendre ce que couvre chaque qualification RGE, quelles primes elle débloque et
            comment la vérifier avant de signer un devis.
          </p>
          <LastUpdated
            label="Référentiel ADEME mis à jour le"
            date={lastSyncDate}
            className="mt-5 text-emerald-100/90"
          />
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {RGE_QUALIFICATIONS_WITH_GUIDE.map((slug) => {
            const g = RGE_QUALIFICATION_GUIDES[slug]
            return (
              <Link
                key={slug}
                href={`/rge/qualifications/${slug}`}
                className="group block p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-lg transition"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <Award className="w-6 h-6 text-emerald-700" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                      {g.organisme}
                    </div>
                    <div className="font-bold text-charcoal-900 text-xl mt-1 group-hover:text-emerald-700 transition">
                      {g.name}
                    </div>
                    <p className="text-sm text-charcoal-600 mt-2 leading-relaxed">{g.lede}</p>
                    <div className="text-sm font-semibold text-emerald-700 mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Lire le guide <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold mb-3">
            Trouvez un artisan RGE certifié
          </h2>
          <p className="text-emerald-100 max-w-2xl mx-auto mb-6 leading-relaxed">
            Annuaire synchronisé hebdomadairement avec la base officielle ADEME.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/rge"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              Explorer l’annuaire RGE
            </Link>
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              Demander un devis
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
