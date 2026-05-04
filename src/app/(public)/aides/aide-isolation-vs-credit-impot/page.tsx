import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Scale,
  Sparkles,
  Calculator,
  ArrowRight,
  CheckCircle2,
  Info,
  XCircle,
  AlertTriangle,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import { ArticleMeta } from '@/components/ArticleMeta'
import { authors, getReviewerForAuthor } from '@/lib/data/authors'
import { SITE_NAME, SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema, getReviewedByPersonSchema } from '@/lib/seo/jsonld'
import { spreadCitationsForTopics } from '@/lib/seo/authoritative-citations'

/**
 * /aides/aide-isolation-vs-credit-impot — Sprint Q 2026-05-03.
 *
 * Comparator pédagogique sur l'intent résiduel "crédit d'impôt isolation 2026"
 * (volume Ahrefs estimé 800-1.5K req/mois). Le Crédit d'Impôt Transition
 * Énergétique (CITE) a été DÉFINITIVEMENT supprimé fin 2020 et remplacé par
 * MaPrimeRénov'. Beaucoup d'utilisateurs cherchent encore la mauvaise aide.
 *
 * Angle : "le crédit d'impôt isolation n'existe plus, voici les 4 dispositifs
 * 2026 qui le remplacent (MPR + CEE + TVA 5,5 % + éco-PTZ)".
 *
 * Auteur : claire-dubois (YMYL aides financières publiques).
 */

export const revalidate = 86400

const PATH = '/aides/aide-isolation-vs-credit-impot'
const PAGE_URL = `${SITE_URL}${PATH}`
const PUBLISHED_AT = '2026-05-03'
const REVIEWED_AT = '2026-05-03'
const AUTHOR = authors['claire-dubois']
const REVIEWER = getReviewerForAuthor(AUTHOR)

const TITLE = 'Aide isolation 2026 : le crédit d’impôt n’existe plus'
const DESCRIPTION =
  "Aide isolation vs crédit d'impôt 2026 : le CITE a été supprimé fin 2020. Les 4 dispositifs actuels qui le remplacent (MaPrimeRénov', CEE, TVA 5,5 %, éco-PTZ) avec montants et conditions."

type Replacement = {
  slug: string
  name: string
  type: string
  montant: string
  conditions: string
  cumulable: boolean
}

const REPLACEMENTS: Replacement[] = [
  {
    slug: 'maprimerenov',
    name: 'MaPrimeRénov’',
    type: 'Subvention forfaitaire ANAH',
    montant: '15 € à 75 €/m² selon profil revenus + isolant + zone géographique',
    conditions: 'Plafonds revenus (bleu/jaune/violet/rose) + artisan RGE obligatoire',
    cumulable: true,
  },
  {
    slug: 'cee',
    name: 'Prime CEE (Coup de pouce Isolation)',
    type: 'Prime privée vendeurs d’énergie',
    montant: 'Calculé sur kWh cumac économisés (ex. 11 €/m² combles, 27 €/m² murs)',
    conditions: 'Pas de plafond revenus segment classique. Bonifications précarité.',
    cumulable: true,
  },
  {
    slug: 'tva-5-5',
    name: 'TVA réduite 5,5 %',
    type: 'Réduction fiscale automatique',
    montant: 'Économie ~14,5 % sur facture HT (vs TVA 20 % normale)',
    conditions: 'Travaux d’économie d’énergie + logement > 2 ans + facture artisan RGE',
    cumulable: true,
  },
  {
    slug: 'eco-ptz',
    name: 'Éco-prêt à taux zéro (éco-PTZ)',
    type: 'Prêt sans intérêt',
    montant: 'Jusqu’à 15 000 € geste seul, jusqu’à 50 000 € rénovation globale',
    conditions: 'Banque partenaire + artisan RGE + logement > 2 ans',
    cumulable: true,
  },
]

const FAQ = [
  {
    question: 'Le crédit d’impôt isolation existe-t-il encore en 2026 ?',
    answer:
      "Non. Le Crédit d'Impôt pour la Transition Énergétique (CITE), qui finançait notamment l'isolation thermique, a été DÉFINITIVEMENT supprimé fin 2020. Il a été remplacé par MaPrimeRénov' pour tous les ménages dès le 1er janvier 2020 (mise en place progressive jusqu'en 2021). Aucun crédit d'impôt ne finance des travaux d'isolation en 2026. Si vous voyez encore des références au CITE, le contenu est obsolète.",
  },
  {
    question: 'Quelle aide remplace le crédit d’impôt isolation en 2026 ?',
    answer:
      "Quatre dispositifs cumulables remplacent le CITE pour l'isolation : (1) MaPrimeRénov' (subvention forfaitaire selon revenus, 15-75 €/m²), (2) Prime CEE Coup de pouce Isolation (prime privée des vendeurs d'énergie, ~11 €/m² combles, ~27 €/m² murs), (3) TVA réduite à 5,5 % (automatique sur facture artisan RGE), (4) Éco-PTZ (prêt sans intérêt jusqu'à 15 000 € geste seul). Le cumul des quatre couvre généralement 50 à 90 % du coût total selon profil.",
  },
  {
    question: 'Pourquoi le crédit d’impôt CITE a-t-il été supprimé ?',
    answer:
      "Trois raisons officielles annoncées par le gouvernement : (1) le crédit d'impôt n'aidait que les ménages imposables (les non-imposables ne pouvaient pas en bénéficier) — MaPrimeRénov' bénéficie à tous les ménages dont les très modestes ; (2) le délai d'un an entre travaux et réception de l'avantage fiscal était dissuasif — MPR est versée 4 à 8 semaines après dépôt facture ; (3) volonté de rationaliser les aides en un seul guichet (maprimerenov.gouv.fr).",
  },
  {
    question: 'Si j’ai fait des travaux en 2020, ai-je encore droit au crédit d’impôt ?',
    answer:
      "Cela dépend de la date des travaux. Pour des travaux engagés (devis signé) AVANT le 1er janvier 2021 et facturés AVANT le 31 décembre 2021, vous pouviez encore bénéficier du CITE en mode transitoire (déclaration revenus 2020 ou 2021). Au-delà, plus aucun droit au CITE — uniquement MaPrimeRénov' + autres dispositifs. Vérifiez votre déclaration de revenus 2021 pour confirmer si l'avantage a été pris en compte.",
  },
  {
    question: 'La TVA 5,5 % est-elle un crédit d’impôt déguisé ?',
    answer:
      "Non. La TVA réduite à 5,5 % sur les travaux de rénovation énergétique n'est pas un crédit d'impôt mais une RÉDUCTION DIRECTE du taux de TVA sur la facture. Elle s'applique automatiquement (sans démarche de votre part) si l'artisan RGE l'inscrit sur sa facture. Économie : environ 14,5 % du coût HT par rapport à la TVA normale à 20 %. Cumulable avec MPR + CEE + éco-PTZ.",
  },
  {
    question: 'Que faire si un site mentionne encore un « crédit d’impôt isolation 2026 » ?',
    answer:
      "C'est un contenu obsolète ou trompeur. Vérifiez la date de publication : tout article avant 2020 est dépassé. Vérifiez la source : seuls maprimerenov.gouv.fr, anah.gouv.fr, ecologie.gouv.fr, service-public.fr et france-renov.gouv.fr font autorité en 2026. Méfiez-vous des plateformes qui promettent un « crédit d'impôt » : c'est souvent un démarchage abusif visant à signer un devis non-RGE (qui vous fait perdre TOUTES les aides).",
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

export default function AideIsolationVsCreditImpotPage() {
  const breadcrumbItems = [
    { name: 'Accueil', url: '/' },
    { name: 'Aides', url: '/aides' },
    { name: 'Aide isolation vs crédit d’impôt', url: PATH },
  ]
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems)
  const faqSchema = getFAQSchema(FAQ, {
    pageUrl: PAGE_URL,
    name: 'FAQ — Aide isolation vs crédit d’impôt 2026',
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
      'aide isolation',
      "crédit d'impôt",
      "MaPrimeRénov'",
      'CEE',
      'comparatif aides',
      'rénovation énergétique',
      '2026',
    ].join(', '),
    about: [
      { '@type': 'Thing', name: 'Aide isolation' },
      { '@type': 'Thing', name: "Crédit d'impôt rénovation" },
      { '@type': 'Thing', name: "MaPrimeRénov'" },
    ],
    ...spreadCitationsForTopics('isolation MaPrimeRénov CEE éco-PTZ TVA'),
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

  const enBrefPoints = [
    "Le crédit d'impôt CITE pour l'isolation a été DÉFINITIVEMENT supprimé fin 2020.",
    `${REPLACEMENTS.length} dispositifs 2026 le remplacent : MaPrimeRénov’, prime CEE, TVA 5,5 %, éco-PTZ.`,
    'Les 4 sont cumulables : 50 à 90 % du coût isolation pris en charge selon profil revenus.',
    'Artisan RGE obligatoire pour TOUS ces dispositifs (sans exception).',
    "Méfiance contenus internet d'avant 2020 et plateformes parlant encore de « crédit d'impôt isolation »",
  ]

  const tldrBullets = [
    'CITE supprimé fin 2020 — aucun crédit d’impôt isolation en 2026.',
    `${REPLACEMENTS.length} dispositifs cumulables le remplacent : MPR + CEE + TVA 5,5 % + éco-PTZ.`,
    'Cumul total : 50-90 % du coût isolation couvert (selon profil revenus + zone climatique).',
    'Artisan RGE obligatoire — sans cette qualification, vous perdez TOUTES les aides.',
    "Si une page mentionne « crédit d'impôt isolation 2026 », c'est obsolète ou un démarchage abusif.",
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
          { label: 'Aide isolation vs crédit d’impôt' },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <EnBrefBox
          summary={`Le crédit d'impôt CITE pour l'isolation a été DÉFINITIVEMENT supprimé fin 2020. ${REPLACEMENTS.length} dispositifs cumulables le remplacent en 2026 (MaPrimeRénov', CEE, TVA 5,5 %, éco-PTZ) — couvrant 50 à 90 % du coût des travaux d'isolation selon profil revenus.`}
          keyPoints={enBrefPoints}
        />
      </div>

      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-charcoal-900 text-white py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <Scale className="w-4 h-4 text-emerald-300" aria-hidden="true" />
            <span className="text-sm font-medium text-emerald-100">
              Information YMYL · vérifié 2026
            </span>
          </div>
          <h1
            data-speakable="true"
            className="font-heading text-3xl md:text-5xl font-extrabold leading-tight mb-4"
          >
            Aide isolation 2026 : le crédit d’impôt n’existe plus
          </h1>
          <p className="text-base md:text-lg text-emerald-50/90 max-w-3xl leading-relaxed">
            Le Crédit d’Impôt Transition Énergétique (CITE) a été supprimé fin 2020. Voici les{' '}
            {REPLACEMENTS.length} dispositifs officiels qui financent l’isolation en 2026 — tous
            cumulables et sourcés sur les portails gouvernementaux.
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
              Simuler mes aides isolation
            </Link>
            <Link
              href="/aides/aide-isolation"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              Page aide isolation
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
          <TldrBlock title="L’essentiel : pas de crédit d’impôt en 2026" bullets={tldrBullets} />
        </div>
      </section>

      <section
        className="bg-red-50/30 py-12 border-y border-red-100"
        aria-labelledby="cite-supprime-heading"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-start gap-4 rounded-2xl bg-white border border-red-200 p-6 md:p-8">
            <XCircle className="w-6 h-6 text-red-700 flex-shrink-0 mt-1" aria-hidden="true" />
            <div>
              <h2
                id="cite-supprime-heading"
                className="font-heading text-xl md:text-2xl font-extrabold text-charcoal-900 mb-3"
              >
                Le CITE est supprimé depuis fin 2020 — confirmé officiellement
              </h2>
              <p className="text-charcoal-700 leading-relaxed mb-3">
                Le <strong>Crédit d’Impôt pour la Transition Énergétique (CITE)</strong>, qui
                finançait notamment l’isolation thermique, a été supprimé par la{' '}
                <strong>loi de finances pour 2020</strong> (article 15) avec une période transitoire
                limitée. Tous les nouveaux travaux engagés à partir du{' '}
                <strong>1er janvier 2021</strong> sont exclus du dispositif.
              </p>
              <p className="text-charcoal-700 leading-relaxed">
                La raison officielle annoncée par le ministère : le crédit d’impôt ne profitait pas
                aux ménages non imposables (40 % de la population), et le délai d’un an entre
                travaux et avantage fiscal était dissuasif. Le dispositif a été remplacé par{' '}
                <strong>MaPrimeRénov’</strong> versée sous 4-8 semaines à tous les ménages
                propriétaires occupants ou bailleurs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12" aria-labelledby="replacements-heading">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            <h2
              id="replacements-heading"
              className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900"
            >
              Les {REPLACEMENTS.length} dispositifs qui remplacent le CITE en 2026
            </h2>
          </div>
          <p className="text-charcoal-700 mb-6">
            Tous{' '}
            <CheckCircle2
              className="inline w-4 h-4 text-emerald-600 align-text-bottom"
              aria-hidden="true"
            />{' '}
            cumulables entre eux dans la limite de 100 % du coût TTC (règle anti-enrichissement
            Anah).
          </p>
          <div className="overflow-x-auto rounded-2xl border border-charcoal-100 bg-white">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                Comparatif des {REPLACEMENTS.length} dispositifs 2026 remplaçant le crédit d’impôt
                isolation
              </caption>
              <thead className="bg-emerald-50 text-charcoal-800">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Dispositif
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Type
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Montant
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Conditions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100 text-charcoal-800">
                {REPLACEMENTS.map((r) => (
                  <tr key={r.slug} className="align-top">
                    <th scope="row" className="px-4 py-3 font-semibold align-top">
                      {r.cumulable && (
                        <CheckCircle2
                          className="inline w-4 h-4 text-emerald-600 mr-1 align-text-bottom"
                          aria-label="Dispositif cumulable"
                        />
                      )}
                      {r.name}
                    </th>
                    <td className="px-4 py-3 leading-relaxed">{r.type}</td>
                    <td className="px-4 py-3 leading-relaxed text-emerald-800 font-semibold">
                      {r.montant}
                    </td>
                    <td className="px-4 py-3 leading-relaxed">{r.conditions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section
        className="bg-amber-50/30 py-12 border-y border-amber-100"
        aria-labelledby="warning-heading"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-start gap-4 rounded-2xl bg-white border border-amber-200 p-6 md:p-8">
            <AlertTriangle
              className="w-6 h-6 text-amber-700 flex-shrink-0 mt-1"
              aria-hidden="true"
            />
            <div>
              <h2
                id="warning-heading"
                className="font-heading text-xl md:text-2xl font-extrabold text-charcoal-900 mb-3"
              >
                Méfiez-vous des contenus parlant encore de « crédit d’impôt isolation »
              </h2>
              <ul className="space-y-2 text-sm text-charcoal-800 leading-relaxed">
                <li>
                  <strong>Articles antérieurs à 2020 :</strong> obsolètes. Vérifier la date de
                  publication avant de se baser dessus.
                </li>
                <li>
                  <strong>Plateformes commerciales :</strong> certaines utilisent encore le terme «
                  crédit d’impôt » dans leur démarchage pour rassurer. Souvent associé à une
                  pression pour signer un devis hors-RGE (= perte intégrale des aides).
                </li>
                <li>
                  <strong>Sources fiables 2026 :</strong> uniquement maprimerenov.gouv.fr,
                  anah.gouv.fr, ecologie.gouv.fr, france-renov.gouv.fr et service-public.fr.
                </li>
              </ul>
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
            Continuer l’exploration
          </h2>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <Link
              href="/aides/aide-isolation"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
            >
              Page aide isolation
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/aides/maprimerenov-vs-cee"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
            >
              MPR vs CEE
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/aides/calendrier-2026"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
            >
              Calendrier 2026
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/aides"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-charcoal-700 text-charcoal-200 hover:bg-charcoal-900 font-semibold transition"
            >
              Hub des aides
            </Link>
          </div>
          <p className="mt-6 text-sm text-charcoal-400 max-w-xl mx-auto flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            Sources officielles : maprimerenov.gouv.fr, anah.gouv.fr, ecologie.gouv.fr,
            france-renov.gouv.fr, service-public.fr.
          </p>
        </div>
      </section>
    </>
  )
}
