import type { Metadata } from 'next'
import Link from 'next/link'
import { Award, ArrowRight, ShieldCheck } from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import RgeGlossaryBlock from '@/components/seo/RgeGlossaryBlock'
import { ArticleMeta } from '@/components/ArticleMeta'
import { SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema, getRgeDefinedTermSetSchema } from '@/lib/seo/jsonld'
import { getAllRgeGlossaryEntries } from '@/lib/seo/rge-qualifications-glossary'
import { monthlyAnchorIso } from '@/lib/seo/sprint-helpers'

/**
 * /rge/glossaire — Sprint O Ahrefs 2026-05-03.
 *
 * Page canonique unique hébergeant le DefinedTermSet RGE complet (16
 * qualifications). Consolide l'autorité topical sur une URL unique au lieu
 * de la disperser entre 3 templates (Sprints J/M/P sur /services, /rge, /cee).
 *
 * Cible : devenir l'URL de référence pour les liens externes (presse, blogs
 * tiers, dictionnaires métier) qui mentionnent "Qualibat 7141" ou "QualiPAC".
 * Un seul `@id` canonique par DefinedTerm évite la dilution PageRank et
 * améliore les chances de citation Google AI Overviews + Bing rich snippets.
 *
 * NB : les Sprints J/M/P continuent d'émettre leurs propres DefinedTermSet
 * en Schema sur les hubs (cohérence Schema/DOM intacte). Cette page est la
 * source canonique vers laquelle les futurs liens externes devraient pointer.
 */

export const revalidate = 86400

const path = '/rge/glossaire'

export const metadata: Metadata = {
  title: 'Glossaire RGE 2026 : QualiPAC, Qualibat, Qualifelec',
  description:
    'Glossaire officiel des qualifications RGE 2026 : QualiPAC, QualiSol, QualiBois, Qualibat 7141 / 7144 / 7131, Qualifelec IRVE, OPQIBI 1905. Définitions et primes débloquées.',
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1 as const,
    'max-image-preview': 'large' as const,
    'max-video-preview': -1 as const,
  },
  openGraph: {
    ...getOgDefaults(),
    title: 'Glossaire RGE — qualifications officielles',
    description:
      'Définitions des 16 qualifications RGE : QualiPAC, Qualibat, Qualifelec, OPQIBI. Sources france-renov.gouv.fr + annuaire ADEME.',
    type: 'article',
    locale: 'fr_FR',
    url: `${SITE_URL}${path}`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Glossaire RGE 2026 : QualiPAC, Qualibat, Qualifelec',
    description:
      'Définitions des 16 qualifications RGE 2026 (QualiPAC, Qualibat, Qualifelec, OPQIBI). Aides débloquées et organismes certificateurs.',
  },
  alternates: getAlternates(path),
}

export default function RgeGlossairePage() {
  const entries = getAllRgeGlossaryEntries()
  const monthlyAnchor = monthlyAnchorIso()
  const pageUrl = `${SITE_URL}${path}`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Artisans RGE', url: '/rge' },
    { name: 'Glossaire', url: path },
  ])

  // Article schema — page éditoriale YMYL (aides financières) avec auteur
  // identifié et speakable selectors pour Google Assistant / Alexa.
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    image: `${SITE_URL}/opengraph-image`,
    headline: 'Glossaire des qualifications RGE — guide officiel 2026',
    description:
      'Définitions canoniques des qualifications RGE 2026 : QualiPAC, QualiSol, QualiBois, Qualibat 7141/7144/7131, Qualifelec IRVE, OPQIBI 1905, RGE Éco Artisan.',
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    datePublished: '2026-05-03T00:00:00+02:00',
    dateModified: monthlyAnchor,
    author: { '@type': 'Organization', name: 'ServicesArtisans', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'ServicesArtisans', url: SITE_URL },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  const definedTermSetSchema = getRgeDefinedTermSetSchema({
    pageUrl,
    name: 'Glossaire RGE — qualifications officielles 2026',
    description:
      "Vocabulaire canonique des 16 qualifications RGE reconnues par l'État pour MaPrimeRénov' et les primes CEE en 2026.",
    terms: entries,
  })

  const faqItems = [
    {
      question: 'À quoi sert une qualification RGE ?',
      answer:
        "RGE (Reconnu Garant de l'Environnement) atteste qu'un artisan maîtrise un geste technique précis (PAC, isolation, solaire). Sans RGE actif à la date du devis, l'aide MaPrimeRénov' et la prime CEE sont refusées. Chaque qualification (QualiPAC, Qualibat 7141, Qualifelec IRVE, etc.) couvre un périmètre métier différent.",
    },
    {
      question: 'Comment vérifier la validité d’une qualification RGE ?',
      answer:
        "L'annuaire officiel france-renov.gouv.fr permet de vérifier en temps réel la qualification d'un artisan via son SIREN. Une qualification expirée entre la signature du devis et la fin du chantier annule l'aide. Vérifiez systématiquement avant signature.",
    },
    {
      question: 'Quelle qualification pour quelle aide ?',
      answer:
        'QualiPAC = pompes à chaleur (BAR-TH-104, BAR-TH-129). Qualibat 7141 = isolation thermique extérieure (BAR-EN-102). Qualifelec IRVE = bornes de recharge (BAR-EN-108). QualiSol = solaire thermique. QualiBois = chaudière bois. Voir le glossaire ci-dessous pour le détail des 16 qualifications.',
    },
    {
      question: 'Une qualification RGE est-elle obligatoire pour tous les travaux ?',
      answer:
        "Non. RGE est obligatoire uniquement pour bénéficier des aides publiques (MaPrimeRénov', CEE, éco-PTZ, TVA 5,5 %). Un chantier réalisé hors aides publiques peut être confié à un artisan non RGE — mais l'aide ne sera pas versée.",
    },
  ]
  const faqSchema = getFAQSchema(faqItems, {
    pageUrl,
    name: 'FAQ — Glossaire RGE',
    includeSpeakable: true,
  })

  const jsonLdItems: Record<string, unknown>[] = [breadcrumbSchema, articleSchema]
  if (definedTermSetSchema) jsonLdItems.push(definedTermSetSchema)
  if (faqSchema) jsonLdItems.push(faqSchema as Record<string, unknown>)

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={jsonLdItems} />

      <Breadcrumb items={[{ label: 'Artisans RGE', href: '/rge' }, { label: 'Glossaire' }]} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-charcoal-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <Award className="w-4 h-4 text-emerald-300" aria-hidden="true" />
            <span className="text-sm font-medium text-emerald-100">
              Référentiel officiel — {entries.length} qualifications
            </span>
          </div>
          <h1
            data-speakable="true"
            className="font-heading text-4xl md:text-5xl font-extrabold leading-tight mb-4"
          >
            Glossaire des qualifications RGE
          </h1>
          <p className="text-lg text-emerald-50/90 max-w-3xl leading-relaxed">
            Définitions canoniques des qualifications délivrées par Qualibat, Qualit&apos;EnR,
            Qualifelec et l&apos;OPQIBI. Sans qualification RGE active à la date du devis,
            MaPrimeRénov&apos; et les primes CEE sont refusées.
          </p>
          <ArticleMeta
            author="ServicesArtisans"
            datePublished="2026-05-03"
            className="mt-5 text-emerald-100/90"
          />
        </div>
      </section>

      {/* Glossaire visible — DefinedTermSet rendu HTML cohérent avec le Schema. */}
      <RgeGlossaryBlock
        entries={entries}
        title={`Les ${entries.length} qualifications RGE expliquées`}
        intro="Définitions officielles, organismes certificateurs et primes débloquées. Cliquez sur l’ancre #term-… pour partager une définition exacte."
      />

      {/* FAQ visible — cohérent avec FAQPage Schema. */}
      <section aria-labelledby="rge-glossaire-faq" className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
        <h2
          id="rge-glossaire-faq"
          className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6"
        >
          Questions fréquentes — Qualifications RGE
        </h2>
        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <details
              key={`rge-glos-faq-${i}`}
              className="group rounded-lg border border-sand-300 bg-white p-5 open:border-emerald-300 open:shadow-sm"
            >
              <summary className="cursor-pointer list-none font-semibold text-charcoal-900 flex items-start justify-between gap-4">
                <span>{item.question}</span>
                <span
                  className="text-emerald-600 group-open:rotate-45 transition-transform text-xl leading-none"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-charcoal-700 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Liens internes vers hubs RGE — PageRank flow vers les pages action */}
      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-3">
            Trouver un artisan RGE qualifié
          </h2>
          <p className="text-charcoal-600 max-w-3xl mb-8 leading-relaxed">
            Annuaire d’artisans RGE certifiés vérifiés via l’API officielle ADEME. Filtrez par
            qualification ou par métier.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link
              href="/rge"
              className="group flex items-start gap-3 p-4 bg-white rounded-xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-sm transition"
            >
              <ShieldCheck
                className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <div className="font-semibold text-charcoal-900 group-hover:text-emerald-700 transition">
                  Tous les métiers RGE
                </div>
                <div className="text-xs text-charcoal-600 mt-0.5">Hub par métier</div>
              </div>
            </Link>
            <Link
              href="/rge/qualifications"
              className="group flex items-start gap-3 p-4 bg-white rounded-xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-sm transition"
            >
              <Award className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="min-w-0">
                <div className="font-semibold text-charcoal-900 group-hover:text-emerald-700 transition">
                  Guides détaillés
                </div>
                <div className="text-xs text-charcoal-600 mt-0.5">
                  Long-format par qualification
                </div>
              </div>
            </Link>
            <Link
              href="/rge/comment-devenir-rge"
              className="group flex items-start gap-3 p-4 bg-white rounded-xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-sm transition"
            >
              <ArrowRight
                className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <div className="font-semibold text-charcoal-900 group-hover:text-emerald-700 transition">
                  Devenir RGE
                </div>
                <div className="text-xs text-charcoal-600 mt-0.5">Procédure pour artisans</div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
