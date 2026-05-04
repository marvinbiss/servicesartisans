import type { Metadata } from 'next'
import Link from 'next/link'
import { Scale, Sparkles, Calculator, ArrowRight, CheckCircle2, Info } from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import { ArticleMeta } from '@/components/ArticleMeta'
import { authors } from '@/lib/data/authors'
import { SITE_NAME, SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'

/**
 * /aides/maprimerenov-vs-coup-de-pouce — Sprint AI Wave K 2026-05-03.
 *
 * Comparator head-to-head MaPrimeRénov' vs Coup de pouce CEE pour répondre
 * à l'intent "maprimerenov ou coup de pouce", "coup de pouce chauffage vs
 * maprimerenov", "différence coup de pouce maprimerenov" (volume Ahrefs
 * estimé 300-500 req/mois).
 *
 * Subtilité éditoriale : Coup de pouce N'EST PAS une aide alternative à
 * MaPrimeRénov' — c'est une bonification CEE qui se cumule. Le comparator
 * doit dissiper la confusion ET orienter vers le cumul optimal.
 *
 * Auteur : claire-dubois (YMYL aides financières publiques).
 */

export const revalidate = 86400

const PATH = '/aides/maprimerenov-vs-coup-de-pouce'
const PAGE_URL = `${SITE_URL}${PATH}`
const PUBLISHED_AT = '2026-05-03'
const REVIEWED_AT = '2026-05-03'
const AUTHOR = authors['claire-dubois']

const TITLE = 'MaPrimeRénov’ vs Coup de pouce 2026 : différences et cumul'
const DESCRIPTION =
  "MaPrimeRénov' vs Coup de pouce 2026 : qui finance, montants chauffage et isolation, conditions revenus. Cumul optimal des deux dispositifs sur le même chantier."

type Criterion = {
  label: string
  mpr: string
  coupDePouce: string
  mprWins?: boolean
  cdpWins?: boolean
}

const CRITERIA: Criterion[] = [
  {
    label: 'Nature de l’aide',
    mpr: 'Subvention publique (ANAH) — argent public versé directement au bénéficiaire.',
    coupDePouce:
      'Bonification du dispositif CEE — primes majorées versées par les obligés / délégataires (Effy, Sonergia, EDF, Engie…).',
  },
  {
    label: 'Travaux ciblés',
    mpr: '~15 gestes : isolation, chauffage performant, ventilation, audit énergétique, fenêtres.',
    coupDePouce:
      'Périmètre restreint en 2026 : Coup de pouce Chauffage (PAC, biomasse, raccordement réseau chaleur) + Coup de pouce Isolation (combles, planchers bas).',
  },
  {
    label: 'Plafond de revenus',
    mpr: 'Oui, 4 catégories (bleu / jaune / violet / rose) — forfait dégressif avec les revenus.',
    coupDePouce:
      'Non pour la prime classique. Bonification "précarité énergétique" doublée pour ménages très modestes / modestes.',
    cdpWins: true,
  },
  {
    label: 'Montant unitaire (PAC air-eau)',
    mpr: 'De 0 € (rose) à 5 000 € (bleu) en geste seul. Plus en parcours accompagné.',
    coupDePouce:
      'Prime CEE de base + bonification Coup de pouce Chauffage = jusqu’à 4 000-5 000 € selon zone climatique et revenus.',
  },
  {
    label: 'Cumul avec l’autre dispositif',
    mpr: 'Cumulable de droit commun avec Coup de pouce CEE et toutes les autres aides (TVA, éco-PTZ).',
    coupDePouce: 'Idem, cumulable avec MaPrimeRénov’ — c’est même la combinaison standard.',
  },
  {
    label: 'Démarche de demande',
    mpr: 'Dépôt sur maprimerenov.gouv.fr AVANT signature du devis — accord ANAH puis virement sous 4-8 semaines.',
    coupDePouce:
      'Inscription chez un obligé (Effy, Sonergia…) AVANT signature du devis. Versement post-travaux 4-12 semaines.',
  },
  {
    label: 'Logement éligible',
    mpr: 'Résidence principale (ou louée à titre principal) construite il y a > 15 ans.',
    coupDePouce: 'Résidence principale OU secondaire, propriétaire OU locataire (avec accord).',
    cdpWins: true,
  },
  {
    label: 'Artisan RGE obligatoire',
    mpr: 'Oui, sans exception sur tous les gestes éligibles.',
    coupDePouce: 'Oui, qualifications spécifiques selon opération (QualiPAC, QualiBois, etc.).',
  },
  {
    label: 'Disponibilité 2026',
    mpr: 'Pérenne (loi Climat-Résilience). Barèmes ajustés annuellement.',
    coupDePouce:
      'Pérenne mais Coup de pouce révisé tous les 1-2 ans par arrêté DGEC. Risque de changement de barème en cours d’année.',
    mprWins: true,
  },
  {
    label: 'Combiné maximal possible',
    mpr: 'MPR + CEE + Coup de pouce + TVA 5,5 % + éco-PTZ + aides locales — règle anti-enrichissement Anah ≤ 100 % TTC.',
    coupDePouce:
      'Idem cumul commun — Coup de pouce ne plafonne pas le cumul, c’est une majoration CEE.',
  },
]

const FAQ = [
  {
    question: 'MaPrimeRénov’ et Coup de pouce sont-ils la même chose ?',
    answer:
      "Non, ce sont deux dispositifs distincts. MaPrimeRénov' est une subvention publique versée par l'ANAH. Le Coup de pouce est une bonification du dispositif CEE (Certificats d'Économies d'Énergie) versée par les obligés (vendeurs d'énergie). Ils se cumulent sur le même chantier — c'est même la combinaison standard.",
  },
  {
    question: 'Faut-il choisir entre MaPrimeRénov’ et Coup de pouce ?',
    answer:
      'Non, jamais. Les deux se cumulent dans la limite de 100 % du coût TTC des travaux (règle anti-enrichissement Anah). Pour une PAC air-eau, vous pouvez recevoir simultanément la prime MaPrimeRénov’ + la prime CEE + la bonification Coup de pouce Chauffage. C’est ce cumul qui rend les opérations « 1 € » possibles pour les ménages très modestes.',
  },
  {
    question: 'Quelles opérations donnent droit au Coup de pouce en 2026 ?',
    answer:
      'En 2026, deux Coups de pouce sont actifs : (1) Coup de pouce Chauffage = remplacement de chaudière fioul ou gaz par une PAC, chaudière biomasse ou raccordement à un réseau de chaleur ; (2) Coup de pouce Isolation = isolation des combles perdus (BAR-EN-101) ou des planchers bas (BAR-EN-103). Les autres opérations CEE restent éligibles à la prime CEE classique sans bonification Coup de pouce.',
  },
  {
    question: 'Quelles aides choisir si on est dans le profil "rose" (revenus supérieurs) ?',
    answer:
      'Le profil rose touche peu ou rien sur MaPrimeRénov’ (forfait dégressif). En revanche la prime CEE et le Coup de pouce ne sont pas plafonnés par revenus pour le segment classique — vous gardez accès à des montants substantiels via ces deux leviers, à compléter par TVA 5,5 % et éco-PTZ.',
  },
  {
    question: 'Le Coup de pouce peut-il être supprimé en cours d’année ?',
    answer:
      'Théoriquement oui — les arrêtés Coup de pouce sont révisés par décret DGEC, généralement avec un préavis de 3-6 mois. La règle protectrice : si votre devis est signé AVANT la date de prise d’effet du nouveau barème, c’est l’ancien qui s’applique (sécurité juridique). En pratique, Coup de pouce Chauffage et Isolation sont reconduits sans rupture depuis 2019.',
  },
  {
    question: 'Comment obtenir simultanément MaPrimeRénov’ et le Coup de pouce ?',
    answer:
      'Procédure : (1) demander un devis à un artisan RGE qualifié pour l’opération ; (2) déposer la demande MaPrimeRénov’ sur maprimerenov.gouv.fr AVANT signature ; (3) inscrire le chantier chez un obligé CEE (Effy, Sonergia…) AVANT signature également ; (4) signer le devis une fois les deux accords obtenus ; (5) après travaux, déposer factures + photos avant/après géotaggées dans les deux dossiers.',
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

export default function MprVsCoupDePoucePage() {
  const breadcrumbItems = [
    { name: 'Accueil', url: '/' },
    { name: 'Aides', url: '/aides' },
    { name: 'MaPrimeRénov’ vs Coup de pouce', url: PATH },
  ]
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems)
  const faqSchema = getFAQSchema(FAQ, {
    pageUrl: PAGE_URL,
    name: 'FAQ — MaPrimeRénov’ vs Coup de pouce',
    includeSpeakable: true,
  })

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: TITLE,
    description: DESCRIPTION,
    image: [`${SITE_URL}/og-default.jpg`],
    datePublished: `${PUBLISHED_AT}T00:00:00+02:00`,
    dateModified: `${REVIEWED_AT}T00:00:00+02:00`,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
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
    publisher: {
      '@type': 'Organization',
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
    'Pas une alternative : Coup de pouce est une BONIFICATION CEE, MaPrimeRénov’ une SUBVENTION publique. Les deux se cumulent.',
    "MaPrimeRénov' = ANAH, plafonds revenus. Coup de pouce = obligés CEE (Effy, Sonergia…), pas de plafond classique.",
    'Coup de pouce 2026 = Chauffage (PAC, biomasse, réseau chaleur) + Isolation (combles, planchers bas).',
    'Profil "rose" exclu de MaPrimeRénov’ ? Coup de pouce reste accessible — pas de plafond revenus.',
    'Combinaison standard : MPR + CEE + Coup de pouce + TVA 5,5 % + éco-PTZ — préfinancement quasi-intégral.',
  ]

  const enBrefPoints = [
    'MaPrimeRénov’ ≠ Coup de pouce — ce sont 2 dispositifs distincts qui se cumulent.',
    'Coup de pouce = bonification CEE (versée par obligés) sur opérations Chauffage + Isolation.',
    'MaPrimeRénov’ pour tous les gestes énergétiques avec plafonds revenus (4 catégories).',
    'Cumul possible avec MaPrimeRénov’ + CEE + TVA 5,5 % + éco-PTZ — combinaison standard 2026.',
    'Profil "rose" : Coup de pouce reste accessible quand MaPrimeRénov’ est dégressive ou nulle.',
  ]

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema as Record<string, unknown>,
          articleSchema as Record<string, unknown>,
          ...(faqSchema ? [faqSchema as Record<string, unknown>] : []),
        ]}
      />

      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Aides', href: '/aides' },
          { label: 'MaPrimeRénov’ vs Coup de pouce' },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <EnBrefBox
          summary={`MaPrimeRénov' (subvention ANAH avec plafonds revenus) versus Coup de pouce CEE (bonification versée par les obligés sur Chauffage + Isolation). Ce ne sont PAS deux alternatives — ils se cumulent sur le même chantier. 10 critères comparés en 2026.`}
          keyPoints={enBrefPoints}
        />
      </div>

      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-charcoal-900 text-white py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <Scale className="w-4 h-4 text-emerald-300" aria-hidden="true" />
            <span className="text-sm font-medium text-emerald-100">
              Comparatif aides 2026 · YMYL vérifié
            </span>
          </div>
          <h1
            data-speakable="true"
            className="font-heading text-3xl md:text-5xl font-extrabold leading-tight mb-4"
          >
            MaPrimeRénov’ vs Coup de pouce en 2026 : 10 différences clés
          </h1>
          <p className="text-base md:text-lg text-emerald-50/90 max-w-3xl leading-relaxed">
            Ce ne sont pas deux alternatives — ils se cumulent. Comparatif officiel des deux
            dispositifs et stratégie de cumul optimale. Sources : ANAH, ADEME, France Rénov’,
            arrêtés Coup de pouce DGEC.
          </p>
          <LastUpdated
            label="Comparatif vérifié le"
            date={REVIEWED_AT}
            className="mt-4 text-emerald-100/90"
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              <Calculator className="w-5 h-5" aria-hidden="true" />
              Simuler mon cumul d’aides
            </Link>
            <Link
              href="/maprimerenov-cumulaison-cee"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              Cumul famille par famille
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
          <TldrBlock title="L’essentiel : on cumule, on ne choisit pas" bullets={tldrBullets} />
        </div>
      </section>

      <section className="bg-white py-12" aria-labelledby="comparison-table-heading">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-emerald-700" aria-hidden="true" />
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
              className="inline w-4 h-4 text-emerald-600 align-text-bottom"
              aria-hidden="true"
            />{' '}
            indiquent le dispositif qui prend l’avantage sur le critère.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-charcoal-100 bg-white">
            <table className="w-full text-left">
              <caption className="sr-only">
                Comparatif détaillé MaPrimeRénov’ vs Coup de pouce en 2026 sur 10 critères
              </caption>
              <thead className="bg-emerald-50 text-sm text-charcoal-800">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold w-44">
                    Critère
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    MaPrimeRénov’
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Coup de pouce CEE
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
                          className="inline w-4 h-4 text-emerald-600 mr-1 align-text-bottom"
                          aria-label="MaPrimeRénov’ prend l’avantage sur ce critère"
                        />
                      )}
                      {c.mpr}
                    </td>
                    <td className="px-4 py-3 leading-relaxed">
                      {c.cdpWins && (
                        <CheckCircle2
                          className="inline w-4 h-4 text-emerald-600 mr-1 align-text-bottom"
                          aria-label="Coup de pouce prend l’avantage sur ce critère"
                        />
                      )}
                      {c.coupDePouce}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section
        className="bg-emerald-50/40 py-12 border-y border-emerald-100"
        aria-labelledby="cumul-bridge-heading"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-start gap-4 rounded-2xl bg-white border border-emerald-200 p-6 md:p-8">
            <Info className="w-6 h-6 text-emerald-700 flex-shrink-0 mt-1" aria-hidden="true" />
            <div>
              <h2
                id="cumul-bridge-heading"
                className="font-heading text-xl md:text-2xl font-extrabold text-charcoal-900 mb-2"
              >
                Le vrai sujet : la combinaison MaPrimeRénov’ + CEE + Coup de pouce
              </h2>
              <p className="text-charcoal-700 leading-relaxed mb-4">
                La question « lequel choisir entre MaPrimeRénov’ et Coup de pouce » est mal posée :
                ce sont deux briques complémentaires. Pour une PAC air-eau ou une isolation des
                combles, la combinaison standard 2026 est : <strong>MaPrimeRénov’</strong>{' '}
                (subvention selon revenus) + <strong>prime CEE classique</strong> (versée par
                l’obligé) + <strong>bonification Coup de pouce</strong> (majoration de la prime CEE
                sur l’opération éligible). Ajoutez la TVA 5,5 % automatique + éventuellement un
                éco-PTZ pour préfinancer le reste à charge à taux 0 %.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/simulateur-aides-renovation"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-semibold shadow-md hover:bg-emerald-800 transition"
                >
                  <Calculator className="w-5 h-5" aria-hidden="true" />
                  Simuler mon cumul total
                </Link>
                <Link
                  href="/cee/coup-de-pouce-2026"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-emerald-300 text-emerald-700 font-semibold hover:bg-emerald-50 transition"
                >
                  Détail Coup de pouce 2026
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
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
                className="group rounded-xl border border-charcoal-200 bg-white p-5 open:border-emerald-300 open:shadow-sm"
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
        </div>
      </section>

      <section className="bg-charcoal-950 py-12 text-center text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3">
            Aller plus loin sur les aides 2026
          </h2>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <Link
              href="/aides/maprimerenov"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
            >
              Page MaPrimeRénov’
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/aides/coup-de-pouce"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
            >
              Page Coup de pouce
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/aides/maprimerenov-vs-cee"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
            >
              MaPrimeRénov’ vs CEE
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
