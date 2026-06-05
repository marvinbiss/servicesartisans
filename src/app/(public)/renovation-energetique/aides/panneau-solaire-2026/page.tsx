/**
 * Page : /renovation-energetique/aides/panneau-solaire-2026
 *
 * @kw-primary    aide panneau solaire 2024
 * @kw-volume     4500
 * @kw-kd         6
 * @kw-cpc        2.10
 * @intent        informational + commercial
 * @cluster       solaire_pv,aides
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md (rang #105, #195)
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — sub-cluster aides PV)
 * @backlog-item  Levier-O-aides-panneau-solaire
 *
 * KW cibles (validés Ahrefs gap CSV 2026-04, country=fr) :
 * - "aide panneau solaire 2024"           4 500 vol, KD 6  ⭐⭐⭐ pivot rang #105
 * - "panneau solaire gratuit gouvernement" 1 000 vol, KD 7  rang #195 (anti-arnaque)
 * - "aide panneau solaire"                  500 vol, KD 5  longue traîne
 * - "subvention panneau solaire"            300 vol, KD 4  longue traîne
 * - "aide pour panneau solaire"             200 vol, KD 4  longue traîne
 * - Famille cumulée pivot : ~6 500 vol/mois (KW pivot KD 4-7)
 *
 * Easy win : OUI (KD 6 sur pivot 4.5K, leader sonergia.fr #7 page commodité).
 * 0 page SA dédiée aides PV (que mention dans /solaire hub + /aides hub générique).
 * Atout SA : clarification anti-arnaque (PV PAS éligible MPR/CEE), focus prime EDF OA
 * autoconsommation barème CRE trimestriel, TVA 10 % ≤ 3 kWc, exonération IR.
 *
 * Cluster pillar : Rénovation Énergétique → Aides → Panneau solaire 2026
 *
 * Anti-cannibalisation :
 *   - /aides (hub)                        = panorama 4 dispositifs (MPR, CEE, éco-PTZ, Anah)
 *   - /aides/maprimerenov-2026             = focus MPR (PV pur PAS éligible)
 *   - /aides/cee-certificats-economie-energie = focus CEE (PV pur PAS éligible)
 *   - /aides/eco-ptz-pret-zero             = focus éco-PTZ (PV éligible si combiné)
 *   - /solaire (hub)                       = focus produit/prix PV
 *   - /solaire/thermique                   = focus solaire thermique CESI/SSC (éligible MPR)
 *   - Cette page                           = focus AIDES PV résidentiel (prime EDF OA,
 *     TVA 10 %, exonération IR, anti-arnaque "gratuit gouvernement")
 *
 * YMYL high : décisions financières, anti-arnaque commerciale (Engie/EDF/démarcheurs
 * vendent PV en faisant croire à des aides massives). Cite : Légifrance, CRE, EDF OA,
 * Code énergie, BOFiP-impôts, Service-Public.fr, ADEME.
 *
 * NOTE : la prime EDF OA est révisée trimestriellement par la CRE. La page hedge
 * volontairement les montants exacts (risque obsolescence). Pour valeurs en vigueur,
 * consulter edf-oa.fr et cre.fr.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Coins,
  Sun,
  ShieldCheck,
  XCircle,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema, getGovernmentServiceSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/aides/panneau-solaire-2026'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'claire-dubois'
const AUTHOR_NAME = 'Claire Dubois'

const TITLE = 'Aides panneau solaire 2026 : EDF OA, TVA, IR'
const DESCRIPTION =
  'Aides panneau solaire 2026 : prime EDF OA autoconsommation, TVA 10 % ≤ 3 kWc, exonération IR ≤ 3 kWc. PV PAS éligible MaPrimeRénov’ ni CEE.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: getAlternates(PAGE_PATH),
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'article',
    siteName: SITE_NAME,
    publishedTime: PUBLISHED,
    modifiedTime: MODIFIED,
    authors: [`${SITE_URL}/equipe/${AUTHOR_SLUG}`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  "Le PV résidentiel n'est PAS éligible à MaPrimeRénov’ ni aux CEE — uniquement le solaire thermique.",
  'Aide #1 : prime EDF OA autoconsommation versée pendant 5 ans (barème trimestriel CRE — vérifier edf-oa.fr).',
  'Aide #2 : TVA 10 % au lieu de 20 % pour installations ≤ 3 kWc en autoconsommation avec vente surplus.',
  'Aide #3 : exonération impôt sur le revenu si ≤ 3 kWc et autoconsommation (Code général impôts art. 35 ter).',
  'Aide #4 : éco-PTZ jusqu\\u2019à 30 000 € si combiné avec d’autres travaux d’économie d’énergie.',
  'Aide #5 : aides locales (région, département, métropole) variables 200-2 000 €.',
  "Méfiez-vous des arnaques « panneau solaire gratuit gouvernement » — aucun dispositif gratuit n'existe.",
]

const AIDES_NATIONALES = [
  {
    aide: "Prime à l'autoconsommation EDF OA",
    montant: '~80-450 € / kWc (barème CRE trimestriel)',
    detail:
      'Versée par EDF Obligation d’Achat sur 5 ans (1/5 par an). Conditions : autoconsommation avec vente du surplus, installateur RGE QualiPV, puissance ≤ 100 kWc, raccordement Enedis. Le barème exact est révisé chaque trimestre par la CRE — consulter edf-oa.fr ou cre.fr pour les valeurs en vigueur.',
    eligibilite: 'Autoconsommation + vente surplus, RGE QualiPV obligatoire',
  },
  {
    aide: 'TVA réduite à 10 %',
    montant: 'Économie ~10 % du prix posé',
    detail:
      'TVA à 10 % au lieu de 20 % sur le matériel et la pose pour les installations photovoltaïques ≤ 3 kWc en autoconsommation avec vente du surplus, dans un logement de plus de 2 ans. Conditions : installateur RGE QualiPV. Pour > 3 kWc, TVA 20 %.',
    eligibilite: '≤ 3 kWc + autoconsommation + RGE + logement > 2 ans',
  },
  {
    aide: 'Exonération impôt sur le revenu',
    montant: 'Exonération totale revenus PV',
    detail:
      "Les revenus de la vente d'électricité sont exonérés d'impôt sur le revenu (CGI art. 35 ter) pour les installations ≤ 3 kWc en autoconsommation avec vente du surplus. Au-delà de 3 kWc, les revenus sont imposables au régime BIC ou micro-BIC.",
    eligibilite: '≤ 3 kWc + autoconsommation + vente surplus',
  },
  {
    aide: 'Éco-PTZ (prêt à taux zéro)',
    montant: 'Jusqu\\u2019à 30 000 €',
    detail:
      "Prêt sans intérêt jusqu\\u2019à 30 000 € (par geste) ou 50 000 € (rénovation d'ampleur 3 gestes). PV éligible UNIQUEMENT si combiné avec d’autres travaux d’économie d’énergie (isolation, chauffage EnR, ventilation). Pas accessible pour PV seul.",
    eligibilite: 'Combinaison avec autres travaux RGE',
  },
]

const NON_ELIGIBLES = [
  {
    aide: 'MaPrimeRénov’',
    raison:
      "Le PV pur n'est PAS éligible MPR depuis 2024 (uniquement le solaire thermique CESI/SSC). MPR finance les EnR pour le chauffage et l’ECS, pas la production électrique.",
  },
  {
    aide: 'CEE Coup de pouce',
    raison:
      "Le PV résidentiel pur n'est PAS éligible aux CEE (les CEE financent les économies d’énergie via fiches BAR-TH/BAR-EN, pas la production électrique).",
  },
  {
    aide: 'Crédit d’impôt transition énergétique (CITE)',
    raison: 'Dispositif supprimé fin 2020. Remplacé par MaPrimeRénov’ (qui exclut le PV).',
  },
  {
    aide: 'Anah (programme Habiter Sain/Mieux)',
    raison: 'L’Anah finance la rénovation énergétique globale, pas le PV en geste isolé.',
  },
]

const SCENARIOS = [
  {
    profil: 'Maison, 3 kWc autoconsommation + vente surplus',
    investissement: '8 000-9 500 € posé',
    aides:
      'Prime EDF OA ~250-450 €/kWc × 3 = 750-1 350 € (sur 5 ans) + TVA 10 % (~700 € éco) + IR exonéré',
    resteCharge: '6 500-8 000 € net',
    detail:
      'Cas le plus courant. ROI 8-12 ans. Production typique 3 600-4 200 kWh/an Sud France. Économies factures 600-900 €/an + revenu vente surplus 100-250 €/an.',
  },
  {
    profil: 'Maison, 6 kWc autoconsommation + vente surplus',
    investissement: '12 000-15 000 € posé',
    aides: 'Prime EDF OA ~150-280 €/kWc × 6 = 900-1 700 € (5 ans) + TVA 20 % + IR imposable BIC',
    resteCharge: '11 100-14 100 € net',
    detail:
      'Production typique 6 800-7 800 kWh/an Sud France. ROI 10-14 ans. Au-delà de 3 kWc, TVA passe à 20 % et les revenus sont imposables. Moins avantageux fiscalement.',
  },
  {
    profil: 'Maison, 9 kWc revente totale',
    investissement: '16 000-19 000 € posé',
    aides: 'Tarif d’achat CRE ~12-15 c€/kWh sur 20 ans + TVA 20 %',
    resteCharge: '16 000-19 000 € net',
    detail:
      'Modèle « investissement énergétique » : revente 100 % de la production à EDF OA. Prix variable selon barème CRE. Plus rentable en zone très ensoleillée mais expose à la fluctuation des tarifs CRE.',
  },
]

const ARNAQUES = [
  {
    type: '« Panneau solaire gratuit gouvernement »',
    detail:
      "Aucun dispositif gratuit n'existe en France. C’est une publicité mensongère utilisée par certains démarcheurs (Engie, EDF, Total, mais aussi prestataires opportunistes) pour piéger les consommateurs. Le PV reste un investissement net 6 500-19 000 € après aides.",
  },
  {
    type: '« Aide MaPrimeRénov’ PV de 5 000 € »',
    detail:
      "Faux. Le PV pur n'est PAS éligible MaPrimeRénov’. Seul le solaire thermique CESI/SSC l'est (jusqu’à 10 000 € selon revenus). Ne signez jamais un devis qui mentionne MPR pour du PV pur.",
  },
  {
    type: '« Reste à charge 1 € » ou « Pompe à chaleur 1 € »',
    detail:
      'Variantes du démarchage abusif (ex Hellio, Effy, Engie, RénovActif). Le coup de pouce CEE existe mais ne peut JAMAIS amener un reste à charge à 1 € sur du PV. La DGCCRF poursuit ce type de pratique.',
  },
  {
    type: '« Crédit gratuit » ou « Financement à 0 % »',
    detail:
      "Vérifier qu’il s’agit bien d’un éco-PTZ (vrai 0 %) ou d’un prêt commercial à 0 % « avec mensualités décalées » (TAEG caché). Toujours vérifier le TAEG inscrit au contrat. La règle : aucun crédit n'est jamais vraiment gratuit côté consommateur.",
  },
]

const faqs = [
  {
    question: 'Le panneau solaire est-il éligible à MaPrimeRénov’ en 2026 ?',
    answer:
      "<strong>Non, le PV pur n’est PAS éligible MaPrimeRénov’</strong> depuis 2024. Seul le solaire <strong>thermique</strong> (CESI : chauffe-eau solaire individuel ; SSC : système solaire combiné) est éligible MPR — jusqu’à 4 000 € (CESI) ou 10 000 € (SSC) pour les revenus très modestes. Pour le PV résidentiel, l'aide principale est la prime EDF OA à l'autoconsommation (versée pendant 5 ans, barème trimestriel CRE), la TVA réduite à 10 % (≤ 3 kWc) et l'exonération de l'impôt sur le revenu.",
  },
  {
    question: 'Combien rapporte la prime EDF OA en 2026 ?',
    answer:
      "Le barème de la prime à l'autoconsommation est révisé chaque <strong>trimestre</strong> par la CRE (Commission de régulation de l'énergie). En 2026, ordres de grandeur : ~250-450 €/kWc pour les installations ≤ 3 kWc, ~80-150 €/kWc pour les 3-9 kWc, versés en 5 fois (1/5 par an). Pour une installation de 3 kWc, cela représente <strong>~750-1 350 € sur 5 ans</strong>. Pour les valeurs en vigueur, consulter edf-oa.fr ou cre.fr (le barème change tous les 3 mois).",
  },
  {
    question: 'TVA 10 % ou 20 % sur les panneaux solaires ?',
    answer:
      "<strong>TVA 10 %</strong> sur le matériel + pose pour les installations PV ≤ 3 kWc en autoconsommation avec vente du surplus, dans un logement de plus de 2 ans, posées par un installateur RGE QualiPV. <strong>TVA 20 %</strong> au-delà de 3 kWc, ou en revente totale, ou si le logement a moins de 2 ans, ou sans installateur RGE. Cette différence de TVA peut représenter ~700-1 000 € d'économie sur une installation de 3 kWc.",
  },
  {
    question: 'Les revenus de la vente d’électricité PV sont-ils imposables ?',
    answer:
      '<strong>Exonérés d’impôt sur le revenu</strong> pour les installations ≤ 3 kWc en autoconsommation avec vente du surplus, sous condition que le foyer ne fasse pas de revente professionnelle (Code général des impôts art. 35 ter). Au-delà de 3 kWc ou en revente totale, les revenus sont imposables au régime BIC (bénéfices industriels et commerciaux), souvent en micro-BIC avec abattement forfaitaire de 71 %.',
  },
  {
    question: 'Existe-t-il vraiment des « panneaux solaires gratuits du gouvernement » ?',
    answer:
      "<strong>Non.</strong> C’est une publicité mensongère utilisée par certains démarcheurs commerciaux (Engie, EDF, Total Direct Énergie, et de multiples prestataires opportunistes) pour piéger les consommateurs vulnérables. Aucun dispositif d'État ne finance gratuitement des panneaux solaires PV. Le PV reste un investissement net <strong>6 500-19 000 €</strong> après toutes les aides. La DGCCRF poursuit régulièrement ce type de démarchage abusif. <strong>Ne signez jamais</strong> un contrat sur la base de cette promesse.",
  },
  {
    question: 'Les aides locales pour panneau solaire en 2026 ?',
    answer:
      'Variables selon les collectivités : 200-2 000 € selon région, département, métropole ou EPCI. Exemples 2026 : Île-de-France (subvention écomobilité ~500 € maxi), Nouvelle-Aquitaine, Occitanie. Ces aides sont rarement cumulables entre elles mais cumulables avec la prime EDF OA + TVA 10 %. Pour le détail par département, consulter France Rénov’ (france-renov.gouv.fr) ou notre simulateur d’aides.',
  },
  {
    question: 'Quel reste à charge pour 3 kWc en 2026 ?',
    answer:
      'Pour une installation 3 kWc autoconsommation + vente surplus en 2026 : investissement initial 8 000-9 500 € posé. Aides : prime EDF OA ~750-1 350 € (versée sur 5 ans), TVA 10 % (~700 € d’économie vs 20 %), IR exonéré sur les revenus de vente. <strong>Reste à charge net : 6 500-8 000 €</strong> sur l’année 1, puis affiné sur 5 ans avec la prime. Plus aides locales éventuelles (200-2 000 €).',
  },
  {
    question: 'Quel installateur choisir pour bénéficier des aides ?',
    answer:
      'Plombier-électricien qualifié <strong>RGE QualiPV</strong> obligatoire pour bénéficier de la prime EDF OA + TVA 10 %. Sans RGE QualiPV : prime non versée + TVA 20 % au lieu de 10 % = perte de ~1 000-1 500 € sur une installation 3 kWc. Vérifier : SIRET valide, attestation décennale, certificat QualiPV en cours de validité (1 an), références chantiers PV (10 mini), devis détaillé avec marque, modèle, kWc total, garantie production 25 ans, raccordement Enedis. Comparer 2-3 devis. Notre annuaire référence 3 985 QualiPV actifs (snapshot DB 2026-05-06).',
  },
]

const sources = [
  {
    label: 'EDF OA — Tarifs achat photovoltaïque',
    url: 'https://www.edf-oa.fr',
  },
  {
    label: "CRE — Commission de régulation de l'énergie",
    url: 'https://www.cre.fr',
  },
  {
    label: 'Service-Public.fr — Aides panneaux solaires',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F35054',
  },
  {
    label: 'BOFiP-impôts — Article 35 ter CGI (exonération PV ≤ 3 kWc)',
    url: 'https://bofip.impots.gouv.fr',
  },
  {
    label: 'France Rénov’ — Aides locales solaire',
    url: 'https://france-renov.gouv.fr',
  },
  {
    label: 'ADEME — Photovoltaïque résidentiel',
    url: 'https://www.ademe.fr',
  },
  {
    label: 'Qualit’EnR — Mention RGE QualiPV (annuaire)',
    url: 'https://www.qualit-enr.org',
  },
  {
    label: 'DGCCRF — Démarchage abusif énergies renouvelables',
    url: 'https://www.economie.gouv.fr/dgccrf',
  },
]

const relatedPages = [
  {
    label: 'Hub Solaire 2026 — prix & types',
    href: '/renovation-energetique/travaux/solaire',
    description: 'Panneau solaire prix 6.3K KD 25, 5 sub-pages',
  },
  {
    label: 'Panneau solaire thermique (CESI / SSC)',
    href: '/renovation-energetique/travaux/solaire/thermique',
    description: 'Distinct du PV, éligible MPR jusqu’à 10 000 €',
  },
  {
    label: 'Autoconsommation solaire',
    href: '/renovation-energetique/travaux/solaire/autoconsommation',
    description: 'Totale, surplus, collective + raccordement Enedis',
  },
  {
    label: 'Rendement panneau solaire',
    href: '/renovation-energetique/travaux/solaire/rendement',
    description: 'Mono 18-22 %, poly 14-17 %, dégradation 25 ans',
  },
  {
    label: 'Hub aides rénovation',
    href: '/renovation-energetique/aides',
    description: 'MPR + CEE + éco-PTZ (panorama complet)',
  },
  {
    label: 'Éco-PTZ : prêt à taux zéro',
    href: '/renovation-energetique/aides/eco-ptz-pret-zero',
    description: 'Jusqu’à 30 000 €, accessible si PV combiné',
  },
  {
    label: 'Label RGE QualiPV',
    href: '/rge/labels/qualipv',
    description: 'Certification installateur PV obligatoire',
  },
  {
    label: 'Trouver un installateur QualiPV',
    href: '/services/electricien',
    description: 'Annuaire 3 985 QualiPV vérifiés',
  },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: PAGE_PATH,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Aides — Panneau solaire',
    keywords: [
      'aide panneau solaire 2024',
      'aide panneau solaire 2026',
      'panneau solaire gratuit gouvernement',
      'subvention panneau solaire',
      'prime edf oa autoconsommation',
      'tva panneau solaire',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Aides', url: '/renovation-energetique/aides' },
    { name: 'Panneau solaire 2026', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'Prime à l’autoconsommation EDF OA Solaire',
    description:
      'Aide forfaitaire versée par EDF Obligation d’Achat aux particuliers qui installent du photovoltaïque résidentiel en autoconsommation avec vente du surplus. Versée pendant 5 ans (1/5 par an). Barème révisé trimestriellement par la CRE.',
    url: PAGE_URL,
    serviceType: 'Energy Grant',
    serviceOperator: {
      name: 'Commission de régulation de l’énergie (CRE)',
      url: 'https://www.cre.fr',
    },
    audience:
      'Particuliers résidentiels équipés d’une installation PV ≤ 100 kWc en autoconsommation avec vente surplus',
    sameAs: [
      'https://www.edf-oa.fr',
      'https://www.cre.fr',
      'https://www.service-public.fr/particuliers/vosdroits/F35054',
    ],
  })
  const schemas = [articleSchema, breadcrumbSchema, faqSchema, govSchema].filter(
    (s): s is Record<string, unknown> => s !== null
  )

  return (
    <>
      <JsonLd data={schemas} />
      <div className="bg-sand-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: 'Rénovation énergétique', href: '/renovation-energetique' },
              { label: 'Aides', href: '/renovation-energetique/aides' },
              { label: 'Panneau solaire 2026' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Sun className="w-3.5 h-3.5" aria-hidden />
              Aides PV résidentiel — Prime EDF OA + TVA 10 %
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Aides panneau solaire 2026 : EDF OA, TVA, IR
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Le <strong>panneau solaire photovoltaïque</strong> (production d&apos;électricité)
              n&apos;est <strong>PAS éligible MaPrimeRénov&apos;</strong> ni aux CEE (réservés au
              solaire <strong>thermique</strong>). Les vraies aides 2026 sont la{' '}
              <strong>prime EDF OA à l&apos;autoconsommation</strong> (versée sur 5 ans, barème CRE
              trimestriel), la <strong>TVA réduite à 10 %</strong> pour les installations ≤ 3 kWc,
              et l&apos;<strong>exonération d&apos;impôt sur le revenu</strong>. Pour 3 kWc
              autoconsommation, le reste à charge net tombe à <strong>6 500-8 000 €</strong>. Voici
              tout sur les aides réelles, les arnaques à éviter et les 3 scénarios fiscaux.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="non-eligibles">Ce à quoi le PV résidentiel n&apos;est PAS éligible</h2>
            <p>
              Avant de regarder les vraies aides, il faut clarifier ce qui est <strong>faux</strong>{' '}
              dans le marketing solaire — beaucoup de démarcheurs vendent des panneaux PV en
              promettant des aides qui n&apos;existent pas pour ce type d&apos;installation.
            </p>
            <div className="not-prose grid gap-3 my-6">
              {NON_ELIGIBLES.map((n) => (
                <div key={n.aide} className="bg-white border border-amber-200 rounded-xl p-5">
                  <div className="flex items-start gap-2 mb-1">
                    <XCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                    <h3 className="font-heading text-base font-semibold text-amber-900 m-0">
                      {n.aide}
                    </h3>
                  </div>
                  <p className="text-sm text-sand-700 m-0 ml-7">{n.raison}</p>
                </div>
              ))}
            </div>

            <h2 id="aides-nationales">Les 4 vraies aides nationales 2026</h2>
            <div className="not-prose grid gap-3 my-6">
              {AIDES_NATIONALES.map((a) => (
                <div key={a.aide} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {a.aide}
                    </h3>
                    <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                      {a.montant}
                    </span>
                  </div>
                  <p className="text-xs text-accent-700 font-medium m-0 mb-1">
                    Éligibilité : {a.eligibilite}
                  </p>
                  <p className="text-sm text-sand-700 m-0">{a.detail}</p>
                </div>
              ))}
            </div>

            <div className="not-prose flex items-start gap-3 border border-amber-200 bg-amber-50 rounded-lg p-4 my-6">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">
                  La prime EDF OA est révisée chaque trimestre
                </p>
                <p className="m-0">
                  Le barème exact change tous les 3 mois selon la décision de la CRE. Cette page
                  affiche des ordres de grandeur 2026 mais ne peut pas tenir une valeur figée. Pour
                  les montants en vigueur au moment de votre devis, consulter{' '}
                  <a href="https://www.edf-oa.fr">edf-oa.fr</a> ou{' '}
                  <a href="https://www.cre.fr">cre.fr</a>.
                </p>
              </div>
            </div>

            <h2 id="scenarios">3 scénarios fiscaux 2026</h2>
            <div className="not-prose grid gap-3 my-6">
              {SCENARIOS.map((s) => (
                <div key={s.profil} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {s.profil}
                    </h3>
                    <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                      {s.investissement}
                    </span>
                  </div>
                  <p className="text-xs text-accent-700 m-0 mb-1">
                    <strong>Aides :</strong> {s.aides}
                  </p>
                  <p className="text-xs text-amber-800 font-medium m-0 mb-1">
                    Reste à charge net : {s.resteCharge}
                  </p>
                  <p className="text-sm text-sand-700 m-0">{s.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="arnaques">4 arnaques fréquentes à éviter</h2>
            <div className="not-prose grid gap-3 my-6">
              {ARNAQUES.map((a) => (
                <div key={a.type} className="bg-white border border-amber-200 rounded-xl p-5">
                  <div className="flex items-start gap-2 mb-1">
                    <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                    <h3 className="font-heading text-base font-semibold text-amber-900 m-0">
                      {a.type}
                    </h3>
                  </div>
                  <p className="text-sm text-sand-700 m-0 ml-7">{a.detail}</p>
                </div>
              ))}
            </div>

            <div className="not-prose flex items-start gap-3 border border-primary-200 bg-primary-50 rounded-lg p-5 my-8">
              <Calculator className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
              <div className="flex-1">
                <p className="font-semibold text-primary-900 m-0 mb-1">
                  Estimer mon reste à charge PV en 2 minutes
                </p>
                <p className="text-sm text-primary-900 m-0 mb-3">
                  Notre simulateur calcule la prime EDF OA, la TVA et le reste à charge net selon
                  votre puissance, zone climatique et profil fiscal. Liste de QualiPV proches de
                  chez vous.
                </p>
                <Link
                  href="/simulateur-aides-renovation"
                  className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                >
                  Lancer le simulateur <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              </div>
            </div>

            <h2 id="cumul">Cumul des aides en 2026</h2>
            <ul>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Prime EDF OA + TVA 10 % + IR exonéré</strong> = cumul autorisé pour PV ≤ 3
                kWc en autoconsommation. C&apos;est le cas le plus courant et le plus avantageux
                fiscalement.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Prime EDF OA + éco-PTZ</strong> = cumul autorisé si le PV est combiné avec
                d&apos;autres travaux d&apos;économie d&apos;énergie (isolation, chauffage EnR,
                ventilation). Pas accessible pour PV seul.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Aides locales</strong> (région, département, métropole) : cumulables avec
                les aides nationales. Variables 200-2 000 €.
              </li>
              <li>
                <ShieldCheck className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Le cumul est conditionné à un installateur <strong>RGE QualiPV</strong> et un
                dossier déposé auprès d&apos;EDF OA AVANT le démarrage des travaux.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Solaire thermique CESI/SSC</strong> : c&apos;est la seule technologie
                solaire éligible MaPrimeRénov&apos; (jusqu&apos;à 10 000 €) + CEE BAR-TH-101/102. À
                ne pas confondre avec le PV.
              </li>
            </ul>
          </article>

          <FlagshipFaq items={faqs} />
          <FlagshipSources sources={sources} />

          <section className="my-10">
            <h2 className="font-heading text-xl font-semibold text-sand-900 mb-4">
              Pour aller plus loin
            </h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {relatedPages.map((g) => (
                <li key={g.href}>
                  <Link
                    href={g.href}
                    className="flex items-start justify-between gap-2 bg-white border border-sand-200 rounded-lg p-4 hover:border-primary-400 hover:shadow-sm transition-all"
                  >
                    <div>
                      <p className="text-sm font-semibold text-sand-900 m-0">{g.label}</p>
                      <p className="text-xs text-sand-600 mt-1 mb-0">{g.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-sand-400 shrink-0 mt-1" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <FlagshipAuthorCard
            authorName={AUTHOR_NAME}
            datePublished={PUBLISHED}
            dateModified={MODIFIED}
          />

          <div className="flex items-center justify-between text-sm text-sand-600 border-t border-sand-200 pt-4 mt-6">
            <Link
              href="/renovation-energetique/aides"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Aides
            </Link>
            <Link
              href="/services/electricien"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Installateurs QualiPV <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
