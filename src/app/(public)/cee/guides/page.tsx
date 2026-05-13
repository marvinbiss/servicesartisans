import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, ArrowRight, ShieldCheck } from 'lucide-react'

import CeeCTA from '@/components/cee/CeeCTA'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { CEE_OPERATION_GUIDES, CEE_OPERATIONS_WITH_GUIDE } from '@/lib/cee/operation-guides-content'

export const revalidate = 86400

const path = '/cee/guides'

export const metadata: Metadata = {
  title: 'Guides primes CEE 2026 — PAC, isolation',
  description:
    'Guides éditoriaux complets sur les 5 primes CEE résidentielles les plus recherchées : PAC air/eau, isolation combles, plancher, poêle bois, chaudière biomasse.',
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1 as const,
    'max-image-preview': 'large' as const,
    'max-video-preview': -1 as const,
  },
  openGraph: {
    title: 'Guides primes CEE 2026',
    description:
      "5 guides long-format sur les primes CEE résidentielles : conditions techniques, montants, cumul MaPrimeRénov' et pièges à éviter.",
    type: 'website',
    locale: 'fr_FR',
    url: `${SITE_URL}${path}`,
    siteName: 'ServicesArtisans',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guides primes CEE 2026 — PAC, isolation, poêle, chaudière',
    description:
      'Guides éditoriaux complets sur les 5 primes CEE résidentielles les plus recherchées : PAC air/eau, isolation combles, plancher, poêle bois, chaudière biomasse.',
  },
  alternates: getAlternates(path),
}

export default function CeeGuidesIndexPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Primes CEE', url: '/cee' },
    { name: 'Guides', url: path },
  ])

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Guides primes CEE 2026',
    url: `${SITE_URL}${path}`,
    description:
      'Index des guides éditoriaux dédiés aux 5 primes CEE résidentielles les plus recherchées.',
    hasPart: CEE_OPERATIONS_WITH_GUIDE.map((code) => {
      const g = CEE_OPERATION_GUIDES[code]
      return {
        '@type': 'Article',
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', '[data-speakable="true"]'],
        },
        name: g.h1,
        url: `${SITE_URL}/cee/${code.toLowerCase()}/guide`,
      }
    }),
  }

  const faqSchema = getFAQSchema([
    {
      question: "Qu'est-ce qu'une prime CEE en 2026 ?",
      answer:
        "La prime CEE (Certificat d'Économies d'Énergie) est une aide financière versée par les fournisseurs d'énergie (obligés) pour encourager la rénovation énergétique des logements. Elle est cumulable avec MaPrimeRénov' et s'applique à 19 opérations standardisées résidentielles (isolation, chauffage, ECS, ventilation, services).",
    },
    {
      question: "Qui peut bénéficier d'une prime CEE résidentielle ?",
      answer:
        "Tout propriétaire occupant, bailleur ou locataire d'un logement achevé depuis plus de 2 ans peut demander une prime CEE pour les travaux éligibles. Le montant de base est identique pour tous ; une bonification « précarité énergétique » (BAR-TH modeste / très modeste) double voire triple le montant pour les ménages sous plafonds ANAH.",
    },
    {
      question: 'Quelles qualifications RGE sont obligatoires ?',
      answer:
        "L'artisan doit détenir la qualification RGE correspondant à la famille de travaux : Qualibat 8621/8622/8731 pour les PAC, Qualibat 7141 pour isolation des combles, Qualibois Module Air pour les poêles à bois, Qualibat 8731 pour les chaudières biomasse. La qualification doit être valide le jour de la signature du devis.",
    },
    {
      question: "Peut-on cumuler prime CEE et MaPrimeRénov' ?",
      answer:
        "Oui, la prime CEE et MaPrimeRénov' sont cumulables. Toutefois, depuis 2024, le cumul est encadré : l'aide totale ne peut dépasser 90 % du coût TTC des travaux pour les ménages très modestes, 75 % pour les modestes, 60 % pour les intermédiaires et 40 % pour les supérieurs. Un audit énergétique peut être requis pour les rénovations d'ampleur.",
    },
    {
      question: 'Quel est le délai pour déposer un dossier CEE ?',
      answer:
        "La prime CEE doit être signée AVANT le devis. L'artisan (ou le mandataire) dépose le dossier auprès d'un obligé après la fin des travaux : facture, attestation sur l'honneur signée, photos et justificatifs RGE. Le versement intervient en général sous 4 à 8 semaines après validation du dossier par l'obligé.",
    },
  ])

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={[breadcrumbSchema, collectionSchema, faqSchema]} />

      <Breadcrumb items={[{ label: 'Primes CEE', href: '/cee' }, { label: 'Guides' }]} />

      <section className="bg-gradient-to-br from-accent-700 via-accent-800 to-charcoal-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-accent-500/20 border border-accent-400/30 rounded-full px-4 py-1.5 mb-5">
            <BookOpen className="w-4 h-4 text-accent-300" />
            <span className="text-sm font-medium text-accent-100">
              Guides éditoriaux rénovation énergétique
            </span>
          </div>
          <h1
            data-speakable="true"
            className="font-heading text-4xl md:text-5xl font-extrabold leading-tight mb-4"
          >
            Guides des primes CEE 2026
          </h1>
          <p className="text-lg text-accent-50/90 max-w-3xl leading-relaxed">
            Conditions techniques, montants de la prime classique et bonifiée précarité, cumul
            MaPrimeRénov’ et pièges à éviter pour les 5 opérations CEE résidentielles les plus
            mobilisées.
          </p>
        </div>
      </section>

      {/* CTA hero */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        <CeeCTA variant="hero" />
      </div>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CEE_OPERATIONS_WITH_GUIDE.map((code) => {
            const g = CEE_OPERATION_GUIDES[code]
            return (
              <Link
                key={code}
                href={`/cee/${code.toLowerCase()}/guide`}
                className="group block p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-accent-400 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-accent-50 border border-accent-100 text-xs font-semibold text-accent-700">
                    {g.code}
                  </span>
                  <span className="text-xs text-charcoal-900">{g.primeClassique}</span>
                </div>
                <h2 className="font-heading font-bold text-xl text-charcoal-900 group-hover:text-accent-700 transition leading-snug">
                  {g.h1}
                </h2>
                <p className="text-sm text-charcoal-600 mt-3 leading-relaxed">{g.lede}</p>
                <div className="flex items-center gap-2 mt-4 text-xs text-charcoal-900">
                  <ShieldCheck className="w-4 h-4 text-accent-600" aria-hidden="true" />
                  <span>RGE requis&nbsp;: {g.rgeRequises.join(', ')}</span>
                </div>
                <div className="text-sm font-semibold text-accent-700 mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Lire le guide <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-4">
            Vous cherchez une autre prime CEE&nbsp;?
          </h2>
          <p className="text-charcoal-600 max-w-3xl mb-6 leading-relaxed">
            Le catalogue complet recense 19 opérations standardisées résidentielles (enveloppe,
            chauffage, ECS, ventilation, services). Chaque opération dispose de sa fiche détaillée
            et de sa liste d’artisans RGE par ville.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/cee"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-600 text-white font-semibold hover:bg-accent-700 transition"
            >
              Voir les 19 primes CEE
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/cee/coup-de-pouce-2026"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-accent-300 bg-white text-accent-800 font-semibold hover:bg-accent-50 transition"
            >
              Coup de pouce 2026
            </Link>
            <Link
              href="/cee/mandataire-vs-direct"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-accent-300 bg-white text-accent-800 font-semibold hover:bg-accent-50 transition"
            >
              Mandataire vs direct
            </Link>
            <Link
              href="/maprimerenov-cumulaison-cee"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-accent-300 bg-white text-accent-800 font-semibold hover:bg-accent-50 transition"
            >
              Cumul MaPrimeRénov’ &amp; CEE
            </Link>
            <Link
              href="/rge/qualifications"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-accent-300 bg-white text-accent-800 font-semibold hover:bg-accent-50 transition"
            >
              Qualifications RGE
            </Link>
            <Link
              href="/comparatif-primes-cee-2026"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-accent-300 bg-white text-accent-800 font-semibold hover:bg-accent-50 transition"
            >
              Comparatif primes 2026
            </Link>
            <Link
              href="/leads-exclusifs-vs-partages"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-accent-300 bg-white text-accent-800 font-semibold hover:bg-accent-50 transition"
            >
              Leads exclusifs vs partagés
            </Link>
            <Link
              href="/ademe"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-accent-300 bg-white text-accent-800 font-semibold hover:bg-accent-50 transition"
            >
              Source officielle ADEME
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-accent-700 to-accent-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold mb-3">
            Prêt à lancer votre projet&nbsp;?
          </h2>
          <p className="text-accent-100 max-w-2xl mx-auto mb-6 leading-relaxed">
            Demandez un devis gratuit auprès d’un artisan RGE certifié et sécurisez votre prime CEE
            dès la signature.
          </p>
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-accent-800 font-semibold shadow-lg hover:bg-accent-50 transition"
          >
            Demander un devis gratuit
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  )
}
