import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, ArrowRight, ShieldCheck } from 'lucide-react'

import CeeCTA from '@/components/cee/CeeCTA'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { CEE_OPERATION_GUIDES, CEE_OPERATIONS_WITH_GUIDE } from '@/lib/cee/operation-guides-content'

export const revalidate = 86400

const path = '/cee/guides'

export const metadata: Metadata = {
  title: 'Guides primes CEE 2026 — PAC, isolation, po\u00eale, chaudi\u00e8re',
  description:
    'Guides \u00e9ditoriaux complets sur les 5 primes CEE r\u00e9sidentielles les plus recherch\u00e9es : PAC air/eau, isolation combles, plancher, po\u00eale bois, chaudi\u00e8re biomasse.',
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
      "5 guides long-format sur les primes CEE r\u00e9sidentielles : conditions techniques, montants, cumul MaPrimeR\u00e9nov' et pi\u00e8ges \u00e0 \u00e9viter.",
    type: 'website',
    locale: 'fr_FR',
    url: `${SITE_URL}${path}`,
    siteName: 'ServicesArtisans',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guides primes CEE 2026 \u2014 PAC, isolation, po\u00eale, chaudi\u00e8re',
    description:
      'Guides \u00e9ditoriaux complets sur les 5 primes CEE r\u00e9sidentielles les plus recherch\u00e9es : PAC air/eau, isolation combles, plancher, po\u00eale bois, chaudi\u00e8re biomasse.',
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
      'Index des guides \u00e9ditoriaux d\u00e9di\u00e9s aux 5 primes CEE r\u00e9sidentielles les plus recherch\u00e9es.',
    hasPart: CEE_OPERATIONS_WITH_GUIDE.map((code) => {
      const g = CEE_OPERATION_GUIDES[code]
      return {
        '@type': 'Article',
        name: g.h1,
        url: `${SITE_URL}/cee/${code}/guide`,
      }
    }),
  }

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={collectionSchema} />

      <Breadcrumb items={[{ label: 'Primes CEE', href: '/cee' }, { label: 'Guides' }]} />

      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-charcoal-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <BookOpen className="w-4 h-4 text-emerald-300" />
            <span className="text-sm font-medium text-emerald-100">
              Guides &eacute;ditoriaux r&eacute;novation &eacute;nerg&eacute;tique
            </span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Guides des primes CEE 2026
          </h1>
          <p className="text-lg text-emerald-50/90 max-w-3xl leading-relaxed">
            Conditions techniques, montants de la prime classique et bonifi&eacute;e
            pr&eacute;carit&eacute;, cumul MaPrimeR&eacute;nov&rsquo; et pi&egrave;ges &agrave;
            &eacute;viter pour les 5 op&eacute;rations CEE r&eacute;sidentielles les plus
            mobilis&eacute;es.
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
                href={`/cee/${code}/guide`}
                className="group block p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700">
                    {g.code}
                  </span>
                  <span className="text-xs text-charcoal-900">{g.primeClassique}</span>
                </div>
                <h2 className="font-heading font-bold text-xl text-charcoal-900 group-hover:text-emerald-700 transition leading-snug">
                  {g.h1}
                </h2>
                <p className="text-sm text-charcoal-600 mt-3 leading-relaxed">{g.lede}</p>
                <div className="flex items-center gap-2 mt-4 text-xs text-charcoal-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>RGE requis&nbsp;: {g.rgeRequises.join(', ')}</span>
                </div>
                <div className="text-sm font-semibold text-emerald-700 mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
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
            Le catalogue complet recense 19 op&eacute;rations standardis&eacute;es
            r&eacute;sidentielles (enveloppe, chauffage, ECS, ventilation, services). Chaque
            op&eacute;ration dispose de sa fiche d&eacute;taill&eacute;e et de sa liste
            d&rsquo;artisans RGE par ville.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/cee"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
            >
              Voir les 19 primes CEE
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/cee/coup-de-pouce-2026"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-300 bg-white text-emerald-800 font-semibold hover:bg-emerald-50 transition"
            >
              Coup de pouce 2026
            </Link>
            <Link
              href="/cee/mandataire-vs-direct"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-300 bg-white text-emerald-800 font-semibold hover:bg-emerald-50 transition"
            >
              Mandataire vs direct
            </Link>
            <Link
              href="/maprimerenov-cumulaison-cee"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-300 bg-white text-emerald-800 font-semibold hover:bg-emerald-50 transition"
            >
              Cumul MaPrimeR&eacute;nov&rsquo; &amp; CEE
            </Link>
            <Link
              href="/rge/qualifications"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-300 bg-white text-emerald-800 font-semibold hover:bg-emerald-50 transition"
            >
              Qualifications RGE
            </Link>
            <Link
              href="/ademe"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-300 bg-white text-emerald-800 font-semibold hover:bg-emerald-50 transition"
            >
              Source officielle ADEME
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold mb-3">
            Pr&ecirc;t &agrave; lancer votre projet&nbsp;?
          </h2>
          <p className="text-emerald-100 max-w-2xl mx-auto mb-6 leading-relaxed">
            Demandez un devis gratuit aupr&egrave;s d&rsquo;un artisan RGE qualifi&eacute; et
            s&eacute;curisez votre prime CEE d&egrave;s la signature.
          </p>
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
          >
            Demander un devis gratuit
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  )
}
