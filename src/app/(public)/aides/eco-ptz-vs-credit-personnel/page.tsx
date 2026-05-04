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
  getFAQSchema,
  getGovernmentServiceSchema,
  getLoanOrCreditSchema,
  getReviewedByPersonSchema,
} from '@/lib/seo/jsonld'
import { spreadCitationsForTopics } from '@/lib/seo/authoritative-citations'

/**
 * /aides/eco-ptz-vs-credit-personnel — Sprint AI Wave K 2026-05-03.
 *
 * Comparator head-to-head éco-PTZ vs crédit personnel/travaux pour répondre
 * à l'intent "éco-ptz vs crédit", "éco-prêt à taux zéro avantages",
 * "financer travaux rénovation prêt", "éco-PTZ inconvénients" (volume Ahrefs
 * estimé 500-800 req/mois en variantes).
 *
 * Bridge funnel : préfinancer le reste-à-charge MaPrimeRénov' + CEE.
 * Auteur : claire-dubois (YMYL aides financières).
 */

export const revalidate = 86400

const PATH = '/aides/eco-ptz-vs-credit-personnel'
const PAGE_URL = `${SITE_URL}${PATH}`
const PUBLISHED_AT = '2026-05-03'
const REVIEWED_AT = '2026-05-03'
const AUTHOR = authors['claire-dubois']
const REVIEWER = getReviewerForAuthor(AUTHOR)

const TITLE = 'Éco-PTZ vs crédit travaux 2026 : taux, plafond, choix'
const DESCRIPTION =
  'Éco-PTZ vs crédit personnel travaux 2026 : taux 0 % vs 4-7 %, plafond 50 000 €, durée, conditions RGE. Comparatif officiel + bascule cumul aides.'

type Criterion = {
  label: string
  ecoPtz: string
  credit: string
  ecoPtzWins?: boolean
  creditWins?: boolean
}

const CRITERIA: Criterion[] = [
  {
    label: 'Taux d’intérêt',
    ecoPtz: '0 % — l’État prend en charge les intérêts via crédit d’impôt versé à la banque.',
    credit:
      'Taux marché 4 à 7 % en 2026 selon profil (TAEG fixe ou variable). Aucune subvention publique.',
    ecoPtzWins: true,
  },
  {
    label: 'Plafond',
    ecoPtz: 'Jusqu’à 50 000 € pour bouquet de travaux + 7 000 € (parois vitrées seules).',
    credit: 'Crédit conso classique : 75 000 € max selon banque. Pas de plafond aide publique.',
    creditWins: true,
  },
  {
    label: 'Durée de remboursement',
    ecoPtz: 'Jusqu’à 20 ans (prolongée à 25 ans pour rénovation d’ampleur depuis 2024).',
    credit: '12 à 120 mois (1 à 10 ans) — durée plus courte = mensualités plus élevées.',
    ecoPtzWins: true,
  },
  {
    label: 'Travaux éligibles',
    ecoPtz:
      'Restreint : isolation, chauffage performant, VMC double flux, audit énergétique, parois vitrées (liste limitative).',
    credit: 'Tous travaux acceptés (rénovation énergétique OU décoration OU embellissement).',
    creditWins: true,
  },
  {
    label: 'Artisan RGE obligatoire',
    ecoPtz: 'Oui, sans exception. Devis d’artisan RGE à fournir au dossier banque.',
    credit: 'Non, libre choix de l’artisan. Pas de qualification exigée.',
    creditWins: true,
  },
  {
    label: 'Délai déblocage',
    ecoPtz: '3 à 6 semaines — montage dossier + accord ANAH puis virement banque.',
    credit: '24 à 72 heures pour un crédit conso classique en ligne (Cetelem, Younited…).',
    creditWins: true,
  },
  {
    label: 'Cumul avec MaPrimeRénov’ + CEE',
    ecoPtz: 'Oui, cumulable de droit commun avec MaPrimeRénov’, CEE, TVA 5,5 % et aides locales.',
    credit:
      'Oui, mais pas un cumul d’aide : c’est juste un financement complémentaire à 100 % du reste à charge.',
  },
  {
    label: 'Justificatifs travaux',
    ecoPtz:
      'Devis détaillé, factures acquittées, attestation RGE, attestation de fin de travaux dans les 3 ans.',
    credit: 'Aucun justificatif final exigé (sauf crédit affecté à un usage précis).',
    creditWins: true,
  },
  {
    label: 'Banques partenaires',
    ecoPtz: 'Conventionnée État : BNP, Crédit Agricole, Caisse d’Épargne, Banque Postale, etc.',
    credit: 'Tout établissement de crédit français + plateformes 100 % en ligne.',
  },
  {
    label: 'Risque endettement',
    ecoPtz: 'Apparaît au taux d’endettement comme tout prêt — analyse banque normale.',
    credit:
      'Idem, mais coût total plus élevé (intérêts) → plus pénalisant à long terme sur capacité d’emprunt.',
    ecoPtzWins: true,
  },
]

const FAQ = [
  {
    question: 'Pour les travaux de rénovation énergétique, l’éco-PTZ est-il toujours préférable ?',
    answer:
      "Oui dans 90 % des cas. Le taux 0 % est imbattable et la durée 20 ans (25 ans pour rénovation d'ampleur) lisse les mensualités. Le crédit personnel ne devient meilleur que si vos travaux ne sont pas éligibles éco-PTZ (décoration, embellissement, agrandissement non-énergétique) ou si vous avez besoin d'un déblocage immédiat (24-72h vs 3-6 semaines pour l'éco-PTZ).",
  },
  {
    question: 'Puis-je cumuler éco-PTZ + crédit personnel pour le même chantier ?',
    answer:
      "Oui. L'éco-PTZ finance la part « rénovation énergétique éligible » et le crédit personnel finance le reste (décoration, mobilier, extension non énergétique). Les deux apparaîtront dans votre taux d'endettement, à valider auprès de votre banque conseil.",
  },
  {
    question: 'L’éco-PTZ est-il aussi cumulable avec MaPrimeRénov’ et la prime CEE ?',
    answer:
      'Oui, sans plafond spécifique au-delà de la règle anti-enrichissement Anah (somme des aides + prêts ≤ 100 % du coût TTC des travaux). En pratique : MaPrimeRénov’ + CEE financent une partie subventionnée (non remboursable) et l’éco-PTZ pré-finance le reste à charge sans intérêts.',
  },
  {
    question: 'Quel est le coût total réel d’un éco-PTZ vs un crédit personnel à 5 % ?',
    answer:
      'Sur 30 000 € remboursés en 10 ans : éco-PTZ = 30 000 € (zéro intérêt) ; crédit personnel à 5 % TAEG = environ 38 200 € (8 200 € d’intérêts cumulés). Sur 20 ans à plafond 50 000 € : éco-PTZ = 50 000 € ; crédit personnel équivalent = environ 65 000-72 000 € selon TAEG. L’écart se chiffre rapidement en milliers d’euros.',
  },
  {
    question: 'Mon dossier éco-PTZ a été refusé : que faire ?',
    answer:
      'Vérifier d’abord le motif (souvent : artisan non RGE à la date du devis, travaux non éligibles, plafond dépassé, taux d’endettement >35 %). Solutions : rectifier l’artisan (relire son attestation RGE), réduire le scope au strict éligible, ou basculer vers un crédit personnel travaux pour ne pas bloquer le chantier — vous pourrez tenter à nouveau l’éco-PTZ pour une seconde tranche dans les 5 ans.',
  },
  {
    question: 'L’éco-PTZ est-il vraiment gratuit pour la banque ?',
    answer:
      'Non, c’est l’État qui paie les intérêts à la banque sous forme de crédit d’impôt étalé sur 5 ans. Vous bénéficiez du taux 0 % réel mais la banque continue à vérifier votre solvabilité comme pour tout prêt classique. Aucune commission ni frais cachés ne sont autorisés sur l’éco-PTZ.',
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

export default function EcoPtzVsCreditPage() {
  const breadcrumbItems = [
    { name: 'Accueil', url: '/' },
    { name: 'Aides', url: '/aides' },
    { name: 'Éco-PTZ vs crédit travaux', url: PATH },
  ]
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems)
  const faqSchema = getFAQSchema(FAQ, {
    pageUrl: PAGE_URL,
    name: 'FAQ — Éco-PTZ vs crédit personnel travaux',
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
      'éco-PTZ',
      'crédit personnel travaux',
      'prêt rénovation',
      'comparatif financement',
      'TAEG',
      '2026',
    ].join(', '),
    about: [
      { '@type': 'Thing', name: 'Éco-PTZ — Prêt à taux zéro' },
      { '@type': 'Thing', name: 'Crédit personnel travaux' },
    ],
    ...spreadCitationsForTopics('éco-PTZ rénovation énergétique'),
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
    'Éco-PTZ = prêt à taux 0 %, plafond 50 000 €, jusqu’à 20-25 ans, restreint aux travaux énergétiques avec artisan RGE.',
    'Crédit personnel = taux 4-7 %, jusqu’à 75 000 €, durée 1-10 ans, tous travaux acceptés, déblocage 24-72h.',
    'Sur 30 000 € sur 10 ans : éco-PTZ = 30 000 € total. Crédit perso à 5 % = ~38 200 € (8 200 € d’intérêts).',
    'L’éco-PTZ est cumulable avec MaPrimeRénov’ + CEE + TVA 5,5 % — il pré-finance le reste à charge.',
    'Crédit personnel utile uniquement si travaux non éligibles éco-PTZ ou besoin de déblocage immédiat.',
  ]

  const enBrefPoints = [
    'Éco-PTZ = taux 0 % réel (intérêts pris en charge État via crédit d’impôt banque).',
    'Plafond 50 000 € éco-PTZ vs 75 000 € crédit personnel — mais éco-PTZ jusqu’à 25 ans.',
    'Économie cumulée éco-PTZ vs crédit perso sur 30 000 € / 10 ans : ~8 200 € d’intérêts.',
    'Cumul possible : éco-PTZ + MaPrimeRénov’ + CEE = financement quasi-intégral travaux énergétiques.',
    'Artisan RGE obligatoire pour éco-PTZ. Liste de travaux limitative (isolation, chauffage, VMC).',
  ]

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema as Record<string, unknown>,
          articleSchema as Record<string, unknown>,
          getGovernmentServiceSchema({
            name: 'Éco-prêt à taux zéro (éco-PTZ)',
            description:
              "Prêt sans intérêt distribué par les banques conventionnées avec l'État pour financer les travaux d'amélioration de la performance énergétique du logement (isolation, chauffage, VMC, audit énergétique). Plafond jusqu'à 50 000 € pour un bouquet performance globale, durée de remboursement jusqu'à 20 ans.",
            url: `${SITE_URL}/aides/eco-ptz-vs-credit-personnel`,
            serviceType: 'Prêt aidé à la rénovation énergétique',
            audience:
              'Propriétaires occupants, bailleurs et syndicats de copropriétaires de logements achevés depuis plus de 2 ans en France',
            temporalCoverage: '2026-01-01/2027-12-31',
            sameAs: [
              'https://www.service-public.fr/particuliers/vosdroits/F19905',
              'https://france-renov.gouv.fr/aides/eco-ptz',
              'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044881907/',
            ],
            serviceOperator: {
              name: 'Direction générale du Trésor',
              url: 'https://www.tresor.economie.gouv.fr/',
            },
          }) as Record<string, unknown>,
          getLoanOrCreditSchema({
            name: 'Éco-PTZ — Prêt à taux zéro travaux',
            description:
              "Prêt sans intérêt garanti par l'État pour financer la rénovation énergétique du logement, distribué par les établissements bancaires conventionnés.",
            url: `${SITE_URL}/aides/eco-ptz-vs-credit-personnel`,
            loanType: 'Prêt à taux zéro travaux',
            amount: 'jusqu’à 50 000 €',
            currency: 'EUR',
            annualPercentageRate: 0,
          }) as Record<string, unknown>,
          ...(faqSchema ? [faqSchema as Record<string, unknown>] : []),
        ]}
      />

      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Aides', href: '/aides' },
          { label: 'Éco-PTZ vs crédit travaux' },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <EnBrefBox
          summary={`Éco-PTZ (taux 0 %, plafond 50 000 €, RGE obligatoire) vs crédit personnel travaux (TAEG 4-7 %, plafond 75 000 €, libre choix artisan). 10 critères comparés en 2026. Pour les travaux énergétiques, l'éco-PTZ est imbattable financièrement et cumulable avec MaPrimeRénov' + CEE.`}
          keyPoints={enBrefPoints}
        />
      </div>

      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-charcoal-900 text-white py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <Scale className="w-4 h-4 text-emerald-300" aria-hidden="true" />
            <span className="text-sm font-medium text-emerald-100">
              Comparatif financement 2026 · YMYL vérifié
            </span>
          </div>
          <h1
            data-speakable="true"
            className="font-heading text-3xl md:text-5xl font-extrabold leading-tight mb-4"
          >
            Éco-PTZ vs crédit travaux en 2026 : 10 différences clés
          </h1>
          <p className="text-base md:text-lg text-emerald-50/90 max-w-3xl leading-relaxed">
            Comparatif officiel des deux modes de financement de travaux. Sources : Service-Public,
            ANAH, France Rénov’, Banque de France (taux moyens crédit conso 2026).
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
              Simuler mon plan de financement
            </Link>
            <Link
              href="/aides/eco-ptz"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              Page éco-PTZ détaillée
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
          <TldrBlock title="L’essentiel : taux 0 % vs flexibilité" bullets={tldrBullets} />
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
                Comparatif détaillé éco-PTZ vs crédit personnel travaux en 2026 sur 10 critères
              </caption>
              <thead className="bg-emerald-50 text-sm text-charcoal-800">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold w-44">
                    Critère
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Éco-PTZ
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Crédit personnel travaux
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
                      {c.ecoPtzWins && (
                        <CheckCircle2
                          className="inline w-4 h-4 text-emerald-600 mr-1 align-text-bottom"
                          aria-label="Éco-PTZ prend l’avantage sur ce critère"
                        />
                      )}
                      {c.ecoPtz}
                    </td>
                    <td className="px-4 py-3 leading-relaxed">
                      {c.creditWins && (
                        <CheckCircle2
                          className="inline w-4 h-4 text-emerald-600 mr-1 align-text-bottom"
                          aria-label="Crédit personnel travaux prend l’avantage sur ce critère"
                        />
                      )}
                      {c.credit}
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
        aria-labelledby="quand-choisir-heading"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2
            id="quand-choisir-heading"
            className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-3"
          >
            Quand choisir l’un ou l’autre
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="rounded-2xl bg-white border border-emerald-200 p-6">
              <h3 className="font-heading font-bold text-charcoal-900 mb-3">Éco-PTZ d’abord</h3>
              <ul className="space-y-3 text-sm text-charcoal-700 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>
                    <strong>Travaux éligibles</strong> (isolation, chauffage RGE, VMC, audit
                    énergétique, parois vitrées).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>
                    <strong>Délai accepté ≥ 4 semaines</strong> avant démarrage chantier — laisse le
                    temps du montage dossier.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>
                    <strong>Préfinancer le reste à charge MaPrimeRénov’ + CEE</strong> (cumul
                    optimal).
                  </span>
                </li>
              </ul>
            </div>
            <div className="rounded-2xl bg-white border border-emerald-200 p-6">
              <h3 className="font-heading font-bold text-charcoal-900 mb-3">
                Crédit personnel d’abord
              </h3>
              <ul className="space-y-3 text-sm text-charcoal-700 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>
                    <strong>Travaux non éligibles éco-PTZ</strong> (décoration, embellissement,
                    extension non-énergétique).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>
                    <strong>Urgence travaux</strong> (chaudière HS, fuite, dégât des eaux) —
                    déblocage 24-72h.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>
                    <strong>Artisan non RGE imposé</strong> (artisan local de confiance non
                    certifié) — éco-PTZ exclut.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section
        className="bg-white py-12 border-t border-charcoal-100"
        aria-labelledby="bridge-heading"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-start gap-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 p-6 md:p-8">
            <Info className="w-6 h-6 text-emerald-700 flex-shrink-0 mt-1" aria-hidden="true" />
            <div>
              <h2
                id="bridge-heading"
                className="font-heading text-xl md:text-2xl font-extrabold text-charcoal-900 mb-2"
              >
                Stratégie optimale 2026 : MaPrimeRénov’ + CEE + éco-PTZ
              </h2>
              <p className="text-charcoal-700 leading-relaxed mb-4">
                Pour les travaux de rénovation énergétique éligibles : demandez les{' '}
                <strong>aides subventionnelles</strong> (MaPrimeRénov’ + prime CEE + TVA 5,5 %) pour
                la part non remboursable, et l’<strong>éco-PTZ</strong> pour pré-financer le reste à
                charge à taux 0 %. Vous évitez d’avancer la trésorerie ET vous remboursez sans
                intérêts. Notre simulateur agrège les 3 dispositifs en 2 minutes.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/simulateur-aides-renovation"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-semibold shadow-md hover:bg-emerald-800 transition"
                >
                  <Calculator className="w-5 h-5" aria-hidden="true" />
                  Simuler mon plan complet
                </Link>
                <Link
                  href="/aides/maprimerenov-vs-cee"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-emerald-300 text-emerald-700 font-semibold hover:bg-emerald-50 transition"
                >
                  MaPrimeRénov’ vs CEE
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
            Aller plus loin sur le financement travaux
          </h2>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <Link
              href="/aides/eco-ptz"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
            >
              Page éco-PTZ
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/guides/credit-travaux-pret-personnel-comparatif"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
            >
              Guide crédit travaux
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
