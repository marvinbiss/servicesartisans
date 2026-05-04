import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Scale,
  Sparkles,
  Calculator,
  ArrowRight,
  CheckCircle2,
  Info,
  Building2,
  AlertTriangle,
} from 'lucide-react'

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
 * /aides/anah-vs-maprimerenov — Sprint P 2026-05-03.
 *
 * Comparator dissipant la confusion historique "Anah vs MaPrimeRénov" (volume
 * estimé 1-2K req/mois exact + 3-5K en variantes "anah ou maprimerenov",
 * "différence anah maprimerenov", "qui choisir entre anah et mpr").
 *
 * Angle éditorial unique : c'est une FAUSSE opposition. MaPrimeRénov est en
 * réalité un dispositif GÉRÉ par l'Anah depuis sa création en janvier 2020.
 * L'Anah opère aussi d'autres dispositifs distincts (Loc'Avantages, MaPrimeAdapt,
 * programme Habiter Mieux logements indignes, Mon Accompagnateur Rénov').
 *
 * Différencié des autres comparators du cluster (vs CEE, vs Coup de pouce,
 * vs éco-PTZ) : ici on clarifie une CONFUSION terminologique, pas un choix.
 *
 * Auteur : claire-dubois (YMYL aides financières publiques).
 */

export const revalidate = 86400

const PATH = '/aides/anah-vs-maprimerenov'
const PAGE_URL = `${SITE_URL}${PATH}`
const PUBLISHED_AT = '2026-05-03'
const REVIEWED_AT = '2026-05-03'
const AUTHOR = authors['claire-dubois']

const TITLE = 'Anah ou MaPrimeRénov’ 2026 : la fausse opposition expliquée'
const DESCRIPTION =
  "Anah vs MaPrimeRénov' 2026 : ce n'est pas une opposition. L'Anah GÈRE MaPrimeRénov' depuis 2020. Comparatif des 6 dispositifs Anah actuels (MPR, Loc'Avantages, MaPrimeAdapt…)."

type AnahDispositif = {
  slug: string
  name: string
  beneficiaire: string
  finance: string
  conditions: string
  montant: string
  depot: string
  isMpr?: boolean
}

const ANAH_DISPOSITIFS: AnahDispositif[] = [
  {
    slug: 'maprimerenov',
    name: 'MaPrimeRénov’',
    beneficiaire: 'Propriétaires occupants ou bailleurs (résidence principale > 15 ans)',
    finance:
      'Rénovation énergétique (isolation, chauffage performant, ventilation, audit, fenêtres)',
    conditions:
      'Plafonds revenus 4 catégories (bleu, jaune, violet, rose) + artisan RGE obligatoire',
    montant:
      '0 € → 11 000 € selon profil + geste (jusqu’à 70 000 € en parcours accompagné rénovation d’ampleur)',
    depot: 'maprimerenov.gouv.fr — AVANT signature du devis',
    isMpr: true,
  },
  {
    slug: 'mpr-parcours-accompagne',
    name: 'MaPrimeRénov’ Parcours accompagné',
    beneficiaire: 'Propriétaires souhaitant une rénovation globale (gain DPE 2 classes minimum)',
    finance:
      'Bouquet de travaux performants + audit énergétique + accompagnement Mon Accompagnateur Rénov’ (MAR) obligatoire',
    conditions: 'Tous revenus, mais bonifications selon catégorie. MAR agréé obligatoire.',
    montant: 'Jusqu’à 70 000 € de travaux subventionnés (bonus si gain DPE ≥ 4 classes)',
    depot: 'Via MAR + dépôt sur maprimerenov.gouv.fr',
    isMpr: true,
  },
  {
    slug: 'loc-avantages',
    name: 'Loc’Avantages',
    beneficiaire: 'Propriétaires bailleurs qui louent à loyer modéré',
    finance: 'Réduction d’impôt sur revenus locatifs (15 % à 65 % selon niveau de loyer plafonné)',
    conditions: 'Convention Anah signée pour 6 ans + locataires sous plafonds revenus',
    montant: 'Réduction fiscale 15-65 % du loyer brut + cumul possible avec MPR sur travaux',
    depot: 'monprojet.anah.gouv.fr',
  },
  {
    slug: 'maprimeadapt',
    name: 'MaPrimeAdapt’',
    beneficiaire: 'Personnes âgées (≥ 70 ans) ou en situation de handicap (résidence principale)',
    finance:
      'Travaux d’adaptation logement (douche italienne, monte-escalier, élargissement portes, barres d’appui)',
    conditions: 'Plafonds revenus + évaluation perte d’autonomie + artisan agréé',
    montant: '50 % à 70 % du coût des travaux (plafond 22 000 € HT)',
    depot: 'monprojet.anah.gouv.fr',
  },
  {
    slug: 'habiter-mieux-logements-indignes',
    name: 'Programme Habiter Mieux — logements indignes',
    beneficiaire: 'Propriétaires occupants logement insalubre ou très dégradé',
    finance: 'Travaux lourds de remise aux normes (plomberie, électricité, structure, salubrité)',
    conditions: 'Diagnostic insalubrité + plafonds revenus très modestes',
    montant: 'Jusqu’à 50 % du coût des travaux (plafond 50 000 €)',
    depot: 'monprojet.anah.gouv.fr — accompagnement opérateur Anah obligatoire',
  },
  {
    slug: 'mon-accompagnateur-renov',
    name: 'Mon Accompagnateur Rénov’ (MAR)',
    beneficiaire:
      'Tout ménage projetant une rénovation d’ampleur (obligatoire si MPR Parcours accompagné)',
    finance:
      'Accompagnement par un tiers de confiance agréé Anah (audit, devis, suivi chantier, dépôt aides)',
    conditions: 'MAR référencé sur france-renov.gouv.fr/agences',
    montant: 'Forfait 2 000 € pris en charge par l’Anah pour les ménages très modestes/modestes',
    depot: 'france-renov.gouv.fr — choix d’un MAR avant tout devis',
  },
]

const FAQ = [
  {
    question: 'L’Anah et MaPrimeRénov’, est-ce la même chose ?',
    answer:
      "Non, mais ce n'est pas une opposition non plus. L'Anah (Agence nationale de l'habitat) est l'organisme public qui GÈRE plusieurs dispositifs d'aide au logement, dont MaPrimeRénov' depuis sa création en janvier 2020. MaPrimeRénov' est UN des 6 dispositifs Anah actuels (avec Loc'Avantages, MaPrimeAdapt', Habiter Mieux logements indignes, etc.). Quand vous demandez MaPrimeRénov', vous demandez en réalité une aide Anah.",
  },
  {
    question: 'Pourquoi entend-on encore parler d’aides Anah distinctes de MaPrimeRénov’ ?',
    answer:
      "Trois raisons : (1) avant 2020, l'Anah avait son propre programme « Habiter Mieux Sérénité » (HMS) qui a été ABSORBÉ par MaPrimeRénov' en 2022 — beaucoup d'articles n'ont pas été mis à jour ; (2) l'Anah continue de gérer des dispositifs distincts non rénovation énergétique (Loc'Avantages, MaPrimeAdapt') ; (3) le programme Habiter Mieux pour logements indignes (insalubrité, péril) reste un dispositif Anah à part.",
  },
  {
    question: 'Faut-il déposer son dossier sur monprojet.anah.gouv.fr ou maprimerenov.gouv.fr ?',
    answer:
      "Pour MaPrimeRénov' (rénovation énergétique géste par geste OU parcours accompagné), le dépôt se fait UNIQUEMENT sur maprimerenov.gouv.fr (FranceConnect requis). Pour les autres dispositifs Anah (MaPrimeAdapt', Loc'Avantages, Habiter Mieux logements indignes), le portail est monprojet.anah.gouv.fr. Les deux portails sont gérés par l'Anah mais ne sont pas interopérables.",
  },
  {
    question: 'Puis-je cumuler MaPrimeRénov’ avec d’autres aides Anah ?',
    answer:
      "Oui sur des projets distincts : MPR pour les travaux de performance énergétique + MaPrimeAdapt' pour l'adaptation autonomie sur les MÊMES locaux est cumulable (chaque dispositif finance un type de travaux différent). En revanche, deux aides Anah ne peuvent PAS financer le même geste précis (règle anti-double financement public). Les aides hors Anah (CEE, éco-PTZ, TVA 5,5 %, aides régionales) restent cumulables avec n'importe quel dispositif Anah.",
  },
  {
    question: 'Le crédit d’impôt CITE existe-t-il encore en 2026 ?',
    answer:
      "Non. Le Crédit d'Impôt pour la Transition Énergétique (CITE) a été DÉFINITIVEMENT supprimé fin 2020 et remplacé par MaPrimeRénov' pour tous les ménages. Si vous voyez encore des références au CITE, le contenu est obsolète. Le seul reste fiscal sur l'énergie est la TVA réduite à 5,5 % sur les travaux de rénovation énergétique (qui s'applique automatiquement sur la facture, sans démarche).",
  },
  {
    question: 'Mon Accompagnateur Rénov’ (MAR) est-il une aide ou un service ?',
    answer:
      "Les deux. C'est un SERVICE d'accompagnement par un tiers de confiance agréé Anah (audit, devis, suivi chantier, dépôt aides) qui devient OBLIGATOIRE pour MaPrimeRénov' Parcours accompagné depuis 2024. Et c'est aussi une AIDE car son coût (forfait 2 000 €) est pris en charge par l'Anah pour les ménages très modestes et modestes (gratuit pour eux). Pour les autres revenus, le MAR est partiellement subventionné selon le projet.",
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

export default function AnahVsMaprimerenovPage() {
  const breadcrumbItems = [
    { name: 'Accueil', url: '/' },
    { name: 'Aides', url: '/aides' },
    { name: 'Anah vs MaPrimeRénov’', url: PATH },
  ]
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems)
  const faqSchema = getFAQSchema(FAQ, {
    pageUrl: PAGE_URL,
    name: 'FAQ — Anah vs MaPrimeRénov’',
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

  const enBrefPoints = [
    "L'Anah GÈRE MaPrimeRénov' depuis sa création en janvier 2020 — ce n'est pas un concurrent.",
    `${ANAH_DISPOSITIFS.length} dispositifs Anah actuels recensés (MPR, MPR Parcours accompagné, Loc'Avantages, MaPrimeAdapt', Habiter Mieux logements indignes, MAR).`,
    "Le crédit d'impôt CITE est SUPPRIMÉ depuis fin 2020 — toute référence ailleurs est obsolète.",
    'Portails distincts : maprimerenov.gouv.fr pour MPR, monprojet.anah.gouv.fr pour les autres dispositifs Anah.',
    'Cumul OK entre MPR + autre dispositif Anah si projets distincts (autonomie + énergie). Cumul KO sur le même geste.',
  ]

  const tldrBullets = [
    "Anah ≠ concurrent de MaPrimeRénov' — l'Anah EST l'opérateur public qui gère MPR depuis 2020.",
    `${ANAH_DISPOSITIFS.length} dispositifs Anah 2026 : MPR (rénovation énergétique), MaPrimeAdapt' (autonomie), Loc'Avantages (bailleurs), Habiter Mieux indigne, MAR.`,
    'Le programme Habiter Mieux Sérénité (HMS) a été absorbé par MPR en 2022 — articles antérieurs périmés.',
    "Crédit d'impôt CITE supprimé fin 2020. Reste uniquement la TVA 5,5 % automatique sur factures.",
    "Pour bien choisir : projet rénovation énergétique → MPR. Projet autonomie/handicap → MaPrimeAdapt'. Logement insalubre → Habiter Mieux indignes.",
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
          { label: 'Anah vs MaPrimeRénov’' },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <EnBrefBox
          summary={`Anah vs MaPrimeRénov' : c'est une fausse opposition. L'Anah (Agence nationale de l'habitat) GÈRE MaPrimeRénov' depuis 2020 et opère ${ANAH_DISPOSITIFS.length} dispositifs distincts en 2026. Comparatif officiel pour ne plus confondre.`}
          keyPoints={enBrefPoints}
        />
      </div>

      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-charcoal-900 text-white py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <Scale className="w-4 h-4 text-emerald-300" aria-hidden="true" />
            <span className="text-sm font-medium text-emerald-100">
              Confusion clarifiée · YMYL vérifié 2026
            </span>
          </div>
          <h1
            data-speakable="true"
            className="font-heading text-3xl md:text-5xl font-extrabold leading-tight mb-4"
          >
            Anah ou MaPrimeRénov’ 2026 : la fausse opposition
          </h1>
          <p className="text-base md:text-lg text-emerald-50/90 max-w-3xl leading-relaxed">
            L’Agence nationale de l’habitat (Anah) gère MaPrimeRénov’ depuis sa création en janvier
            2020, ainsi que {ANAH_DISPOSITIFS.length - 1} autres dispositifs distincts. Cette page
            clarifie qui-fait-quoi en 2026, sans erreur historique.
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
              Simuler mes aides 2026
            </Link>
            <Link
              href="/aides/maprimerenov-vs-cee"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              MPR vs CEE
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
          <TldrBlock title="L’essentiel : pas de confusion" bullets={tldrBullets} />
        </div>
      </section>

      <section
        className="bg-emerald-50/40 py-12 border-y border-emerald-100"
        aria-labelledby="anah-roles-heading"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-start gap-4 rounded-2xl bg-white border border-emerald-200 p-6 md:p-8">
            <Building2 className="w-6 h-6 text-emerald-700 flex-shrink-0 mt-1" aria-hidden="true" />
            <div>
              <h2
                id="anah-roles-heading"
                className="font-heading text-xl md:text-2xl font-extrabold text-charcoal-900 mb-3"
              >
                L’Anah, c’est qui exactement ?
              </h2>
              <p className="text-charcoal-700 leading-relaxed mb-3">
                L’<strong>Agence nationale de l’habitat (Anah)</strong> est un établissement public
                administratif sous tutelle des ministères du Logement et de la Transition
                écologique. Elle a été créée en 1971 pour améliorer l’habitat privé en France. Son
                budget 2026 dépasse 5 milliards d’euros, dont la majorité est consacrée à
                MaPrimeRénov’.
              </p>
              <p className="text-charcoal-700 leading-relaxed mb-3">
                Depuis le <strong>1er janvier 2020</strong>, l’Anah a remplacé deux dispositifs
                anciens (le Crédit d’impôt CITE supprimé fin 2020 + le programme Habiter Mieux
                Sérénité absorbé en 2022) par un dispositif unifié : <strong>MaPrimeRénov’</strong>.
                C’est l’Anah qui : reçoit les dossiers, vérifie l’éligibilité, contrôle les
                factures, verse les aides, et instruit les recours.
              </p>
              <p className="text-charcoal-700 leading-relaxed">
                En parallèle de MaPrimeRénov’, l’Anah gère d’autres dispositifs distincts
                (autonomie, bailleurs, logements indignes) avec leurs propres règles et leur propre
                portail (monprojet.anah.gouv.fr).
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12" aria-labelledby="dispositifs-table-heading">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            <h2
              id="dispositifs-table-heading"
              className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900"
            >
              Les {ANAH_DISPOSITIFS.length} dispositifs Anah en 2026
            </h2>
          </div>
          <p className="text-charcoal-700 mb-6">
            Tableau récapitulatif. Les pastilles{' '}
            <CheckCircle2
              className="inline w-4 h-4 text-emerald-600 align-text-bottom"
              aria-hidden="true"
            />{' '}
            indiquent les dispositifs MaPrimeRénov’ (gérés par l’Anah).
          </p>
          <div className="overflow-x-auto rounded-2xl border border-charcoal-100 bg-white">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                Récapitulatif des {ANAH_DISPOSITIFS.length} dispositifs gérés par l’Anah en 2026
              </caption>
              <thead className="bg-emerald-50 text-charcoal-800">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold w-44">
                    Dispositif
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Pour qui ?
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Finance quoi ?
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Montant max
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100 text-charcoal-800">
                {ANAH_DISPOSITIFS.map((d) => (
                  <tr key={d.slug} className="align-top">
                    <th scope="row" className="px-4 py-3 font-semibold align-top">
                      {d.isMpr && (
                        <CheckCircle2
                          className="inline w-4 h-4 text-emerald-600 mr-1 align-text-bottom"
                          aria-label="Dispositif MaPrimeRénov’"
                        />
                      )}
                      {d.name}
                    </th>
                    <td className="px-4 py-3 leading-relaxed">{d.beneficiaire}</td>
                    <td className="px-4 py-3 leading-relaxed">{d.finance}</td>
                    <td className="px-4 py-3 leading-relaxed text-emerald-800 font-semibold">
                      {d.montant}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section
        className="bg-amber-50/30 py-12 border-y border-amber-100"
        aria-labelledby="confusion-heading"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-start gap-4 rounded-2xl bg-white border border-amber-200 p-6 md:p-8">
            <AlertTriangle
              className="w-6 h-6 text-amber-700 flex-shrink-0 mt-1"
              aria-hidden="true"
            />
            <div>
              <h2
                id="confusion-heading"
                className="font-heading text-xl md:text-2xl font-extrabold text-charcoal-900 mb-3"
              >
                3 confusions à éviter en 2026
              </h2>
              <ul className="space-y-3 text-sm text-charcoal-800 leading-relaxed">
                <li>
                  <strong>« J’ai droit à MaPrimeRénov’ ET à une aide Anah » :</strong> non, MPR EST
                  une aide Anah. Vous ne cumulez pas MPR avec « l’aide Anah » — vous cumulez MPR
                  avec d’autres dispositifs (CEE, éco-PTZ, aides locales) et éventuellement avec
                  d’autres dispositifs Anah sur des projets distincts (MPR énergie + MaPrimeAdapt’
                  autonomie).
                </li>
                <li>
                  <strong>« Le crédit d’impôt rénovation existe encore » :</strong> non, le CITE
                  (Crédit d’Impôt Transition Énergétique) a été supprimé fin 2020. Toute référence à
                  un crédit d’impôt rénovation est obsolète. Reste uniquement la TVA réduite à 5,5 %
                  (automatique sur factures, sans démarche).
                </li>
                <li>
                  <strong>« Habiter Mieux Sérénité existe toujours » :</strong> non, ce programme a
                  été absorbé par MaPrimeRénov’ Parcours accompagné en 2022. Si vous trouvez un
                  article qui en parle au présent, il est périmé.
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
              href="/aides/maprimerenov"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
            >
              Page MaPrimeRénov’
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
            Sources officielles : anah.gouv.fr, maprimerenov.gouv.fr, monprojet.anah.gouv.fr,
            france-renov.gouv.fr.
          </p>
        </div>
      </section>
    </>
  )
}
