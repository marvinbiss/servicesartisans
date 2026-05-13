import type { Metadata } from 'next'
import Link from 'next/link'
import { Scale, Sparkles, Calculator, ArrowRight, CheckCircle2, Info } from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import { ArticleMeta } from '@/components/ArticleMeta'
import { authors, getReviewerForAuthor } from '@/lib/data/authors'
import { SITE_NAME, SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import {
  getBreadcrumbSchema,
  getCeeGovServiceSchema,
  getFAQSchema,
  getMaPrimeRenovGovServiceSchema,
  getReviewedByPersonSchema,
} from '@/lib/seo/jsonld'
import { spreadCitationsForTopics } from '@/lib/seo/authoritative-citations'

/**
 * /aides/maprimerenov-vs-cee — Sprint AI Wave I 2026-05-03.
 *
 * Comparator head-to-head MaPrimeRénov' vs Prime CEE pour répondre à l'intent
 * de recherche "MaPrimeRénov vs CEE", "différence MaPrimeRénov CEE", "lequel
 * choisir entre MaPrimeRénov et CEE" (volume Ahrefs estimé 1-2K req/mois exact
 * match + 3-5K en variantes).
 *
 * Différencié de /maprimerenov-cumulaison-cee qui traite le CUMUL des deux.
 * Bridge naturel : "Vous n'avez pas à choisir — les deux se cumulent".
 *
 * Auteur : claire-dubois (YMYL aides financières publiques).
 */

export const revalidate = 86400

const PATH = '/aides/maprimerenov-vs-cee'
const PAGE_URL = `${SITE_URL}${PATH}`
const PUBLISHED_AT = '2026-05-03'
const REVIEWED_AT = '2026-05-03'
const AUTHOR = authors['claire-dubois']
const REVIEWER = getReviewerForAuthor(AUTHOR)

const TITLE = 'MaPrimeRénov’ vs CEE 2026 : différences, montants, choix'
const DESCRIPTION =
  "MaPrimeRénov' vs prime CEE 2026 : comparatif officiel — qui finance, conditions revenus, montants, démarche. Cumul possible : on ne choisit pas, on additionne."

type Criterion = {
  label: string
  mpr: string
  cee: string
  mprWins?: boolean
  ceeWins?: boolean
}

const CRITERIA: Criterion[] = [
  {
    label: 'Qui finance ?',
    mpr: 'L’État via l’ANAH (Agence nationale de l’habitat) — argent public.',
    cee: 'Les vendeurs d’énergie (EDF, Engie, TotalEnergies, Auchan…) — argent privé sous obligation de la loi POPE 2005.',
  },
  {
    label: 'Plafond de revenus',
    mpr: 'Oui, 4 catégories (bleu / jaune / violet / rose). Plus les revenus sont modestes, plus le forfait est élevé.',
    cee: 'Non pour la prime classique. Oui pour la bonification "précarité énergétique" qui double les forfaits.',
    ceeWins: true,
  },
  {
    label: 'Type d’aide',
    mpr: 'Subvention forfaitaire par geste de travaux ou parcours accompagné (rénovation d’ampleur).',
    cee: 'Prime calculée sur les kWh cumac économisés — variable selon zone climatique et surface.',
  },
  {
    label: 'Quand demander ?',
    mpr: 'AVANT signature du devis (dépôt en ligne sur maprimerenov.gouv.fr, attente accord).',
    cee: 'AVANT signature du devis (l’obligé/délégataire émet un courrier d’engagement).',
  },
  {
    label: 'Délai de versement',
    mpr: '4 à 8 semaines après dépôt facture acquittée + photos travaux.',
    cee: '4 à 12 semaines selon obligé. Effy/Sonergia historiquement plus rapides que les généralistes.',
    mprWins: true,
  },
  {
    label: 'Artisan RGE obligatoire',
    mpr: 'Oui, sans exception sur tous les gestes éligibles.',
    cee: 'Oui sur la quasi-totalité des opérations standardisées résidentielles.',
  },
  {
    label: 'Coup de pouce / bonification',
    mpr: 'Bonifications via parcours accompagné (rénovation d’ampleur, 2+ gestes, gain DPE 2 classes).',
    cee: 'Coups de pouce Chauffage (PAC, biomasse) et Isolation (combles, planchers) — primes majorées.',
    ceeWins: true,
  },
  {
    label: 'Logement éligible',
    mpr: 'Résidence principale (ou louée à titre principal) construite il y a >15 ans.',
    cee: 'Résidence principale OU secondaire, neuf ou ancien, propriétaire OU locataire.',
    ceeWins: true,
  },
  {
    label: 'Travaux éligibles',
    mpr: '~15 gestes : isolation, chauffage performant, ventilation, audit énergétique, fenêtres double-vitrage.',
    cee: '19 opérations standardisées résidentielles couvertes en 2026 (BAR-TH, BAR-EN, BAR-SE…).',
  },
  {
    label: 'Cumul avec l’autre aide',
    mpr: 'Cumulable avec CEE, TVA 5,5 %, éco-PTZ et aides locales (règle anti-enrichissement Anah ≤ 100 % TTC).',
    cee: 'Cumulable avec MaPrimeRénov’, TVA 5,5 %, éco-PTZ et aides locales (même règle).',
  },
]

const FAQ = [
  {
    question: 'Faut-il choisir entre MaPrimeRénov’ et la prime CEE ?',
    answer:
      "Non. Les deux dispositifs sont cumulables sur les mêmes travaux dans la limite de 100 % du coût TTC (règle dite anti-enrichissement de l'Anah). Pour 90 % des projets de rénovation énergétique, le bon réflexe est de demander LES DEUX simultanément, en plus de la TVA 5,5 % et éventuellement de l'éco-PTZ.",
  },
  {
    question: 'Quelle aide est la plus avantageuse en 2026 ?',
    answer:
      'Aucune dans l’absolu — elles répondent à des logiques différentes. MaPrimeRénov’ favorise les revenus modestes (forfaits plus élevés) et les rénovations d’ampleur (parcours accompagné). La prime CEE n’a pas de plafond de revenus pour le segment classique et offre les « Coups de pouce » historiquement les plus rentables sur le chauffage et l’isolation. Le cumul des deux est presque toujours optimal.',
  },
  {
    question: 'Mon logement secondaire est-il éligible aux deux aides ?',
    answer:
      "Non pour MaPrimeRénov' : seules les résidences principales (occupées ou mises en location à titre principal) sont éligibles. Oui pour la prime CEE : elle s'applique également aux résidences secondaires, ainsi qu'aux locataires (avec accord du propriétaire).",
  },
  {
    question: 'Puis-je faire les travaux sans artisan RGE ?',
    answer:
      "Non, ni pour MaPrimeRénov' ni pour la prime CEE. La qualification RGE (Reconnu Garant de l'Environnement) doit être valide à la date de signature du devis. Sans cette condition, vous perdez les deux aides intégralement. C'est la règle la plus contrôlée par les organismes payeurs.",
  },
  {
    question: 'Quels travaux donnent droit aux deux aides simultanément ?',
    answer:
      'Quasiment tous les travaux d’économies d’énergie : pompe à chaleur air-eau ou air-air (PAC), chaudière biomasse, isolation des combles ou des murs (ITE/ITI), remplacement de fenêtres double vitrage, ventilation double flux, audit énergétique. Voir le détail famille par famille sur notre page dédiée au cumul des aides.',
  },
  {
    question: 'Quel est le plafond cumulé MaPrimeRénov’ + CEE ?',
    answer:
      "Le seul plafond commun est la règle anti-enrichissement de l'Anah : la somme des aides publiques + privées ne peut pas dépasser 100 % du coût TTC des travaux. En pratique, ce plafond n'est atteint que pour les ménages très modestes sur des opérations fortement bonifiées (chaudière biomasse remplaçant un fioul, isolation combles 1 €).",
  },
]

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: getAlternates(PATH),
  openGraph: {
    ...getOgDefaults(),
    locale: 'fr_FR',
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'article',
  },
}

export default function MaprimerenovVsCeePage() {
  const breadcrumbItems = [
    { name: 'Accueil', url: '/' },
    { name: 'Aides', url: '/aides' },
    { name: 'MaPrimeRénov’ vs CEE', url: PATH },
  ]
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems)
  const faqSchema = getFAQSchema(FAQ, {
    pageUrl: PAGE_URL,
    name: 'FAQ — MaPrimeRénov’ vs CEE',
    includeSpeakable: true,
  })

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${PAGE_URL}#article`,
    url: PAGE_URL,
    headline: TITLE,
    description: DESCRIPTION,
    image: [`${SITE_URL}/og-default.jpg`],
    datePublished: `${PUBLISHED_AT}T00:00:00+02:00`,
    dateModified: `${REVIEWED_AT}T00:00:00+02:00`,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    articleSection: 'Aides à la rénovation énergétique',
    keywords: [
      "MaPrimeRénov'",
      'CEE',
      "Certificats d'économies d'énergie",
      'comparatif aides',
      'cumul aides',
      '2026',
    ].join(', '),
    about: [
      { '@type': 'Thing', name: "MaPrimeRénov'" },
      { '@type': 'Thing', name: "Certificats d'économies d'énergie" },
    ],
    ...spreadCitationsForTopics('MaPrimeRénov CEE rénovation énergétique'),
    author: AUTHOR
      ? {
          '@type': 'Person',
          name: AUTHOR.name,
          jobTitle: AUTHOR.role,
          url: `${SITE_URL}/equipe/${AUTHOR.slug}`,
          ...(AUTHOR.methodology &&
            AUTHOR.methodology.length > 0 && { skills: AUTHOR.methodology }),
        }
      : { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    ...(REVIEWER && { reviewedBy: getReviewedByPersonSchema(REVIEWER) }),
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': PAGE_URL },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  const tldrBullets = [
    'Pas de choix à faire : MaPrimeRénov’ + prime CEE sont cumulables sur les mêmes travaux (≤ 100 % du coût TTC).',
    "MaPrimeRénov' = État (ANAH), forfaits selon revenus. Prime CEE = vendeurs d'énergie, calcul sur kWh cumac.",
    'CEE plus permissive : pas de plafond revenus (segment classique), résidences secondaires + locataires éligibles.',
    'MaPrimeRénov’ favorise les rénovations d’ampleur via parcours accompagné (gain DPE 2 classes).',
    'Artisan RGE obligatoire dans les deux cas, dépôt AVANT signature du devis.',
  ]

  const enBrefPoints = [
    'MaPrimeRénov’ = subvention publique ANAH avec plafonds revenus (4 catégories).',
    'Prime CEE = obligation privée des vendeurs d’énergie, sans plafond revenus.',
    'Les deux aides sont cumulables — le cumul est presque toujours optimal.',
    'Artisan RGE + dépôt avant signature du devis : règles communes.',
    'Délai versement 4-12 semaines selon le dispositif et l’opérateur.',
  ]

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema as Record<string, unknown>,
          articleSchema as Record<string, unknown>,
          getMaPrimeRenovGovServiceSchema(`${SITE_URL}/aides/maprimerenov-vs-cee`) as Record<
            string,
            unknown
          >,
          getCeeGovServiceSchema(`${SITE_URL}/aides/maprimerenov-vs-cee`) as Record<
            string,
            unknown
          >,
          ...(faqSchema ? [faqSchema as Record<string, unknown>] : []),
        ]}
      />

      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Aides', href: '/aides' },
          { label: 'MaPrimeRénov’ vs CEE' },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <EnBrefBox
          summary={`MaPrimeRénov' (subvention ANAH avec plafonds revenus) versus prime CEE (obligation privée des vendeurs d'énergie, sans plafond revenus). 10 critères comparés en 2026. Le cumul des deux est cumulable sur les mêmes travaux (≤ 100 % du coût TTC).`}
          keyPoints={enBrefPoints}
        />
      </div>

      <section className="bg-gradient-to-br from-accent-700 via-accent-800 to-charcoal-900 text-white py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-accent-500/20 border border-accent-400/30 rounded-full px-4 py-1.5 mb-5">
            <Scale className="w-4 h-4 text-accent-300" aria-hidden="true" />
            <span className="text-sm font-medium text-accent-100">
              Comparatif aides 2026 · YMYL vérifié
            </span>
          </div>
          <h1
            data-speakable="true"
            className="font-heading text-3xl md:text-5xl font-extrabold leading-tight mb-4"
          >
            MaPrimeRénov’ vs prime CEE en 2026 : 10 différences clés
          </h1>
          <p className="text-base md:text-lg text-accent-50/90 max-w-3xl leading-relaxed">
            Comparatif officiel des deux principaux dispositifs d’aide à la rénovation énergétique
            résidentielle en France. Sources : ANAH, ADEME, France Rénov’, ministère de la
            Transition énergétique.
          </p>
          <LastUpdated
            label="Comparatif vérifié le"
            date={REVIEWED_AT}
            className="mt-4 text-accent-100/90"
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-accent-800 font-semibold shadow-lg hover:bg-accent-50 transition"
            >
              <Calculator className="w-5 h-5" aria-hidden="true" />
              Simuler mon cumul d’aides
            </Link>
            <Link
              href="/maprimerenov-cumulaison-cee"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-accent-300/60 text-white font-semibold hover:bg-accent-600/30 transition"
            >
              Détail famille par famille
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-10 border-b border-charcoal-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <ArticleMeta
            author={AUTHOR?.name ?? 'Équipe éditoriale ServicesArtisans'}
            authorHref={AUTHOR ? `/equipe/${AUTHOR.slug}` : '/a-propos'}
            datePublished={PUBLISHED_AT}
            dateModified={REVIEWED_AT}
          />
          <TldrBlock title="L’essentiel : pas de choix à faire" bullets={tldrBullets} />
        </div>
      </section>

      <section className="bg-white py-12" aria-labelledby="comparison-table-heading">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-accent-700" aria-hidden="true" />
            <h2
              id="comparison-table-heading"
              className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900"
            >
              10 critères comparés
            </h2>
          </div>
          <p className="text-charcoal-700 mb-6">
            Tableau de comparaison à plat. Les pastilles{' '}
            <CheckCircle2
              className="inline w-4 h-4 text-accent-600 align-text-bottom"
              aria-hidden="true"
            />{' '}
            indiquent le dispositif qui prend l’avantage sur le critère.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-charcoal-100 bg-white">
            <table className="w-full text-left">
              <caption className="sr-only">
                Comparatif détaillé MaPrimeRénov’ vs prime CEE en 2026 sur 10 critères
              </caption>
              <thead className="bg-accent-50 text-sm text-charcoal-800">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold w-44">
                    Critère
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    MaPrimeRénov’
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Prime CEE
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100 text-sm text-charcoal-800">
                {CRITERIA.map((c) => (
                  <tr key={c.label} className="align-top">
                    <th scope="row" className="px-4 py-3 font-semibold align-top">
                      {c.label}
                    </th>
                    <td className="px-4 py-3 leading-relaxed">
                      {c.mprWins && (
                        <CheckCircle2
                          className="inline w-4 h-4 text-accent-600 mr-1 align-text-bottom"
                          aria-label="MaPrimeRénov’ prend l’avantage sur ce critère"
                        />
                      )}
                      {c.mpr}
                    </td>
                    <td className="px-4 py-3 leading-relaxed">
                      {c.ceeWins && (
                        <CheckCircle2
                          className="inline w-4 h-4 text-accent-600 mr-1 align-text-bottom"
                          aria-label="Prime CEE prend l’avantage sur ce critère"
                        />
                      )}
                      {c.cee}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section
        className="bg-accent-50/40 py-12 border-y border-accent-100"
        aria-labelledby="quand-choisir-heading"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2
            id="quand-choisir-heading"
            className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-3"
          >
            Quand l’une prend l’avantage sur l’autre
          </h2>
          <p className="text-charcoal-700 mb-6">
            En pratique, vous demandez les deux aides. Mais sur certains projets, l’une ouvre des
            droits que l’autre n’ouvre pas. Voici 6 cas concrets pour 2026.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white border border-accent-200 p-6">
              <h3 className="font-heading font-bold text-charcoal-900 mb-3">
                MaPrimeRénov’ d’abord
              </h3>
              <ul className="space-y-3 text-sm text-charcoal-700 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>
                    <strong>Revenus très modestes (bleu)</strong> : forfaits MPR jusqu’à 90 % du
                    coût TTC sur les opérations bonifiées.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>
                    <strong>Rénovation d’ampleur (parcours accompagné)</strong> : 2+ gestes + gain
                    DPE de 2 classes minimum, bonification jusqu’à 80 %.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>
                    <strong>Audit énergétique seul</strong> : MPR finance jusqu’à 500 €, CEE non
                    standardisé.
                  </span>
                </li>
              </ul>
            </div>
            <div className="rounded-2xl bg-white border border-accent-200 p-6">
              <h3 className="font-heading font-bold text-charcoal-900 mb-3">Prime CEE d’abord</h3>
              <ul className="space-y-3 text-sm text-charcoal-700 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>
                    <strong>Résidence secondaire</strong> : MPR exclut, CEE accepte (propriétaire ou
                    locataire).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>
                    <strong>Coup de pouce Chauffage (PAC, biomasse)</strong> : majoration CEE
                    largement supérieure aux forfaits MPR sur le critère pur chauffage.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>
                    <strong>Revenus supérieurs (rose)</strong> : MPR fortement réduite ou nulle, CEE
                    non plafonnée par revenus.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section
        className="bg-white py-12 border-t border-charcoal-100"
        aria-labelledby="cumul-bridge-heading"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-start gap-4 rounded-2xl bg-accent-50/60 border border-accent-200 p-6 md:p-8">
            <Info className="w-6 h-6 text-accent-700 flex-shrink-0 mt-1" aria-hidden="true" />
            <div>
              <h2
                id="cumul-bridge-heading"
                className="font-heading text-xl md:text-2xl font-extrabold text-charcoal-900 mb-2"
              >
                Vous n’avez pas à choisir : les deux se cumulent
              </h2>
              <p className="text-charcoal-700 leading-relaxed mb-4">
                Pour 90 % des projets de rénovation énergétique, demandez{' '}
                <strong>MaPrimeRénov’ ET la prime CEE</strong> sur les mêmes travaux. Les deux aides
                s’additionnent dans la limite de 100 % du coût TTC (règle anti-enrichissement Anah).
                En complément, vous bénéficiez automatiquement de la TVA à 5,5 % par votre artisan
                RGE et pouvez préfinancer le reste à charge avec un éco-PTZ jusqu’à 50 000 €.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/maprimerenov-cumulaison-cee"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-700 text-white font-semibold shadow-md hover:bg-accent-800 transition"
                >
                  Voir le cumul famille par famille
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/simulateur-aides-renovation"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-accent-300 text-accent-700 font-semibold hover:bg-accent-50 transition"
                >
                  <Calculator className="w-5 h-5" aria-hidden="true" />
                  Simuler mon cumul d’aides
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="bg-white py-12 border-t border-charcoal-100"
        aria-labelledby="faq-heading"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2
            id="faq-heading"
            className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6"
          >
            Questions fréquentes
          </h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <details
                key={`faq-${i}`}
                className="group rounded-xl border border-charcoal-200 bg-white p-5 open:border-accent-300 open:shadow-sm"
              >
                <summary className="cursor-pointer list-none font-semibold text-charcoal-900 flex items-start justify-between gap-4">
                  <span>{item.question}</span>
                  <span
                    className="text-accent-600 group-open:rotate-45 transition-transform text-xl leading-none"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-charcoal-700 leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-charcoal-950 py-12 text-center text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3">
            Aller plus loin sur les aides 2026
          </h2>
          <p className="text-charcoal-300 mb-6">
            Catalogue détaillé des 12 aides nationales et primes CEE par opération.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/aides/maprimerenov"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-600 hover:bg-accent-700 text-white font-semibold transition"
            >
              Page MaPrimeRénov’
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/aides/cee"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-600 hover:bg-accent-700 text-white font-semibold transition"
            >
              Page prime CEE
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/aides"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-charcoal-700 text-charcoal-200 hover:bg-charcoal-900 font-semibold transition"
            >
              Hub des 12 aides 2026
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
