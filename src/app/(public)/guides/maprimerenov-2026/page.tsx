import { Metadata } from 'next'
import Link from 'next/link'
import SimulateurCTA from '@/components/cee/SimulateurCTA'
import {
  Euro,
  Users,
  Clock,
  ShieldCheck,
  Flame,
  Droplets,
  Wind,
  Home,
  Sun,
  FileSearch,
  ClipboardList,
  Search,
  UserCheck,
  FileText,
  Hammer,
  Receipt,
  ArrowRight,
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronRight,
  Zap,
  Building2,
  PiggyBank,
  BadgePercent,
  Landmark,
  CreditCard,
  HelpCircle,
} from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import RgeGuideBlock from '@/components/rge/RgeGuideBlock'
import JsonLd from '@/components/JsonLd'
import {
  getBreadcrumbSchema,
  getEcoPtzGovServiceSchema,
  getFAQSchema,
  getFinancialProductSchema,
  getLoanOrCreditSchema,
  getMaPrimeRenovGovServiceSchema,
  getReviewedByPersonSchema,
} from '@/lib/seo/jsonld'
import { authors, getReviewerForAuthor } from '@/lib/data/authors'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'

const G_AUTHOR = authors['claire-dubois']
const G_REVIEWER = getReviewerForAuthor(G_AUTHOR)
import { ArticleMeta } from '@/components/ArticleMeta'

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'MaPrimeRénov 2026 : Montants',
  description:
    "Guide MaPrimeRénov' 2026 : montants jusqu'à 70 000 €, conditions, barèmes revenus, parcours accompagné. Obtenez votre aide rénovation énergétique.",
  keywords: [
    'MaPrimeRénov 2026',
    'aide rénovation énergétique',
    'montant MaPrimeRénov',
    'prime rénovation énergétique',
    'MaPrimeRénov conditions',
    'MaPrimeRénov barème',
    'artisan RGE',
    'parcours accompagné',
    'rénovation globale',
  ],
  alternates: getAlternates('/guides/maprimerenov-2026'),
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  openGraph: {
    title: 'MaPrimeRénov 2026 : Guide Complet, Montants et Conditions',
    description:
      'Tout savoir sur MaPrimeRénov en 2026 : montants, barèmes, conditions et démarches pour obtenir votre aide à la rénovation énergétique.',
    url: `${SITE_URL}/guides/maprimerenov-2026`,
    type: 'article',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'MaPrimeRénov 2026 — Guide Complet | ServicesArtisans',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MaPrimeRénov 2026 : Guide Complet',
    description:
      'Montants, conditions, barèmes et démarches MaPrimeRénov 2026. Guide détaillé et à jour.',
    images: [`${SITE_URL}/opengraph-image`],
  },
}

// ---------------------------------------------------------------------------
// FAQ Data
// ---------------------------------------------------------------------------

const faqItems = [
  {
    question: 'MaPrimeRénov est-elle accessible à tous ?',
    answer:
      'Oui, depuis 2021, MaPrimeRénov est ouverte à tous les propriétaires (occupants ou bailleurs, dans la limite de 3 logements). Le montant varie selon la catégorie de revenus du foyer. Le logement doit avoir 15 ans minimum (2 ans pour remplacement de chaudière fioul).',
  },
  {
    question: 'Faut-il un artisan RGE ?',
    answer:
      "Oui, le recours à un artisan RGE certifié (Reconnu Garant de l'Environnement) est obligatoire. Le devis doit être signé avec l'artisan RGE AVANT le dépôt du dossier. Vérifiez la qualification sur france-renov.gouv.fr ou ServicesArtisans.",
  },
  {
    question: 'Peut-on isoler ses murs avec MaPrimeRénov en 2026 ?',
    answer:
      "Depuis le 1er janvier 2025, l'isolation seule (murs, toiture, plancher) n'est plus éligible au parcours par geste. Elle reste finançable via le parcours accompagné (gain ≥ 2 classes DPE). Les CEE restent disponibles pour l'isolation seule.",
  },
  {
    question: 'Quel est le délai pour recevoir la prime ?',
    answer:
      "4 à 6 mois en moyenne après la fin des travaux : 1 mois d'instruction, puis versement après envoi de la facture. Une avance de 70 % est possible pour les ménages très modestes en parcours accompagné. Virement direct par l'ANAH.",
  },
  {
    question: 'Peut-on cumuler MaPrimeRénov avec les CEE ?',
    answer:
      "Oui. MaPrimeRénov est cumulable avec les CEE (« prime énergie »), l'éco-PTZ, la TVA à 5,5 %, les aides locales et le chèque énergie. Plafond : le total des aides ne peut dépasser 100 % du coût des travaux.",
  },
  {
    question: 'MaPrimeRénov est-elle disponible pour les copropriétés ?',
    answer:
      "Oui via MaPrimeRénov Copropriétés : jusqu'à 25 % des travaux HT, plafond 25 000 € par logement, gain énergétique ≥ 35 % requis. Bonus +10 % pour copropriétés fragiles. Aide versée au syndicat.",
  },
  {
    question: 'Que faire si mon DPE est F ou G ?',
    answer:
      "Le parcours accompagné offre un bonus « sortie de passoire » de +10 % pour atteindre la classe D minimum. Les ménages très modestes peuvent ainsi atteindre 90 % de financement. Audit énergétique obligatoire avant la vente d'un logement F ou G.",
  },
  {
    question: 'Comment trouver un artisan RGE près de chez moi ?',
    answer:
      'Annuaire ServicesArtisans ou site officiel france-renov.gouv.fr. Demandez 3 devis minimum, vérifiez que la mention RGE figure sur le devis et que la certification est valide pour le type de travaux envisagé.',
  },
]

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const keyFigures = [
  {
    icon: Euro,
    value: '70 000 €',
    label: 'Montant max (parcours accompagné)',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: Users,
    value: 'Tous les ménages',
    label: 'Éligibles (sans condition de revenus pour certains travaux)',
    color: 'text-primary-500',
    bg: 'bg-primary-50',
  },
  {
    icon: Clock,
    value: '4-6 mois',
    label: 'Délai moyen de versement',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: ShieldCheck,
    value: 'Artisan RGE',
    label: 'Requis pour toutes les demandes',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
]

const parcoursAccompagne = [
  {
    categorie: 'Très modestes',
    taux: '80 %',
    plafond: '56 000 €',
    couleur: 'bg-green-100 text-green-800',
  },
  {
    categorie: 'Modestes',
    taux: '60 %',
    plafond: '42 000 €',
    couleur: 'bg-primary-100 text-primary-800',
  },
  {
    categorie: 'Intermédiaires',
    taux: '45 %',
    plafond: '31 500 €',
    couleur: 'bg-amber-100 text-amber-800',
  },
  {
    categorie: 'Supérieurs',
    taux: '30 %',
    plafond: '21 000 €',
    couleur: 'bg-sand-100 text-charcoal-800',
  },
]

const parcoursGeste = [
  { travaux: 'PAC air-eau', montant: '3 000 - 5 000 €', icon: Flame },
  { travaux: 'PAC géothermique', montant: '5 000 - 11 000 €', icon: Zap },
  { travaux: 'Chauffe-eau solaire', montant: '2 000 - 4 000 €', icon: Sun },
  { travaux: 'Poêle à bois', montant: '1 000 - 1 800 €', icon: Flame },
  { travaux: 'VMC double flux', montant: '2 500 €', icon: Wind },
]

const baremesIDF = [
  {
    personnes: '1 personne',
    tresModestes: '23 541 €',
    modestes: '28 657 €',
    intermediaires: '40 018 €',
  },
  {
    personnes: '2 personnes',
    tresModestes: '34 551 €',
    modestes: '42 058 €',
    intermediaires: '58 827 €',
  },
  {
    personnes: '3 personnes',
    tresModestes: '41 493 €',
    modestes: '50 513 €',
    intermediaires: '70 382 €',
  },
  {
    personnes: '4 personnes',
    tresModestes: '48 447 €',
    modestes: '58 981 €',
    intermediaires: '81 472 €',
  },
  {
    personnes: '5 personnes',
    tresModestes: '55 427 €',
    modestes: '67 473 €',
    intermediaires: '92 953 €',
  },
  {
    personnes: 'Par pers. supp.',
    tresModestes: '+6 970 €',
    modestes: '+8 486 €',
    intermediaires: '+11 455 €',
  },
]

const baremesProvince = [
  {
    personnes: '1 personne',
    tresModestes: '17 009 €',
    modestes: '21 805 €',
    intermediaires: '30 549 €',
  },
  {
    personnes: '2 personnes',
    tresModestes: '24 875 €',
    modestes: '31 889 €',
    intermediaires: '44 907 €',
  },
  {
    personnes: '3 personnes',
    tresModestes: '29 917 €',
    modestes: '38 349 €',
    intermediaires: '54 071 €',
  },
  {
    personnes: '4 personnes',
    tresModestes: '34 948 €',
    modestes: '44 802 €',
    intermediaires: '63 235 €',
  },
  {
    personnes: '5 personnes',
    tresModestes: '40 002 €',
    modestes: '51 281 €',
    intermediaires: '72 400 €',
  },
  {
    personnes: 'Par pers. supp.',
    tresModestes: '+5 045 €',
    modestes: '+6 462 €',
    intermediaires: '+9 165 €',
  },
]

const travauxEligibles = [
  {
    title: 'Chauffage',
    description:
      'PAC air-eau, PAC géothermique, chaudière biomasse, poêle à granulés, poêle à bois',
    icon: Flame,
    parcours: 'Geste & Accompagné',
  },
  {
    title: 'Eau chaude',
    description: 'Chauffe-eau solaire individuel, chauffe-eau thermodynamique',
    icon: Droplets,
    parcours: 'Geste & Accompagné',
  },
  {
    title: 'Ventilation',
    description: 'VMC double flux',
    icon: Wind,
    parcours: 'Geste & Accompagné',
  },
  {
    title: 'Isolation',
    description: 'Murs, toiture, planchers, combles',
    icon: Home,
    parcours: 'Accompagné uniquement',
    warning: true,
  },
  {
    title: 'Fenêtres',
    description: 'Remplacement de fenêtres, portes-fenêtres',
    icon: Building2,
    parcours: 'Accompagné uniquement',
    warning: true,
  },
  {
    title: 'Audit énergétique',
    description: 'Audit réglementaire pour le parcours accompagné',
    icon: FileSearch,
    parcours: 'Accompagné',
  },
]

const etapesDemande = [
  {
    numero: 1,
    title: 'Vérifier votre éligibilité',
    description: 'Simulateur sur maprimerenov.gouv.fr selon revenus et projet.',
    icon: Search,
  },
  {
    numero: 2,
    title: 'Trouver un artisan RGE',
    description: 'ServicesArtisans ou france-renov.gouv.fr.',
    icon: UserCheck,
  },
  {
    numero: 3,
    title: 'Créer un compte',
    description: 'Inscription sur maprimerenov.gouv.fr avec numéro fiscal.',
    icon: ClipboardList,
  },
  {
    numero: 4,
    title: 'Obtenir des devis',
    description: '2 à 3 devis minimum, mention RGE obligatoire sur chaque devis.',
    icon: FileText,
  },
  {
    numero: 5,
    title: 'Déposer le dossier AVANT les travaux',
    description: "Soumission en ligne, attendre l'accord ANAH avant de commencer.",
    icon: Hammer,
  },
  {
    numero: 6,
    title: 'Travaux puis facture',
    description: 'Téléversement de la facture après travaux. Versement sous 4-6 mois.',
    icon: Receipt,
  },
]

const aidesCumulables = [
  {
    title: "CEE (Certificats d'Économie d'Énergie)",
    description: "Prime versée par les fournisseurs d'énergie, cumulable avec MaPrimeRénov.",
    icon: Zap,
  },
  {
    title: 'Éco-PTZ (prêt à taux zéro)',
    description: "Jusqu'à 50 000 € sans intérêt pour le reste à charge.",
    icon: PiggyBank,
  },
  {
    title: 'TVA réduite 5,5 %',
    description: "Appliquée automatiquement par l'artisan sur les travaux énergétiques.",
    icon: BadgePercent,
  },
  {
    title: 'Aides locales',
    description: "Régions, départements, communes. Vérifier auprès de l'ADIL.",
    icon: Landmark,
  },
  {
    title: 'Chèque énergie',
    description: 'Aide annuelle de 48 à 277 € pour les ménages modestes.',
    icon: CreditCard,
  },
]

// ---------------------------------------------------------------------------
// Table of contents
// ---------------------------------------------------------------------------

const tocItems = [
  { id: 'quest-ce-que', label: "Qu'est-ce que MaPrimeRénov' ?" },
  { id: 'parcours', label: 'Les deux parcours 2026' },
  { id: 'baremes', label: 'Barèmes de revenus 2026' },
  { id: 'travaux', label: 'Travaux éligibles' },
  { id: 'demarches', label: 'Comment faire sa demande ?' },
  { id: 'cumul', label: "Cumul avec d'autres aides" },
  { id: 'faq', label: 'Questions fréquentes' },
]

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function MaPrimeRenov2026Page() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'MaPrimeRénov 2026', url: '/guides/maprimerenov-2026' },
  ])

  const faqSchema = getFAQSchema(faqItems)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
    headline: 'MaPrimeRénov 2026 : Guide Complet des Aides à la Rénovation Énergétique',
    description:
      'Guide complet MaPrimeRénov 2026 : montants, conditions, barèmes de revenus, parcours accompagné et par geste, démarches.',
    datePublished: '2026-01-15',
    dateModified: '2026-03-10',
    author: G_AUTHOR
      ? {
          '@type': 'Person',
          name: G_AUTHOR.name,
          jobTitle: G_AUTHOR.role,
          url: `${SITE_URL}/equipe/${G_AUTHOR.slug}`,
          ...(G_AUTHOR.methodology &&
            G_AUTHOR.methodology.length > 0 && { skills: G_AUTHOR.methodology }),
        }
      : { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    ...(G_REVIEWER && { reviewedBy: getReviewedByPersonSchema(G_REVIEWER) }),
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icons/icon-512x512.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/guides/maprimerenov-2026`,
    },
    image: `${SITE_URL}/opengraph-image`,
    inLanguage: 'fr-FR',
  }

  const financialProductSchema = getFinancialProductSchema({
    name: "MaPrimeRénov' 2026",
    description:
      "Aide financière de l'État pour la rénovation énergétique des logements. Jusqu'à 70 000 € pour le parcours accompagné. Accessible à tous les propriétaires, artisan RGE obligatoire.",
    url: `${SITE_URL}/guides/maprimerenov-2026`,
    category: 'Government Grant',
    amount: '70000',
    feesAndCommissionsSpecification: "Aucuns frais — aide directe de l'ANAH versée après travaux",
  })

  const ecoPtzSchema = getLoanOrCreditSchema({
    name: 'Éco-PTZ — Prêt à Taux Zéro Rénovation Énergétique',
    description:
      "Prêt à taux zéro pour financer les travaux de rénovation énergétique. Jusqu'à 50 000 € remboursables sur 20 ans, sans condition de revenus. Cumulable avec MaPrimeRénov'.",
    url: `${SITE_URL}/guides/maprimerenov-2026`,
    loanType: 'Éco-prêt à taux zéro',
    amount: '50000',
    annualPercentageRate: 0,
    loanTerm: 'P20Y',
  })

  // GovernmentService — guide MPR 2026 + éco-PTZ. Émet 2 dispositifs publics
  // avec fragment URL distinct (cohabite avec FinancialProduct/LoanOrCredit
  // qui couvrent l'angle « produit financier » côté Google rich result).
  const PAGE_URL_MPR = `${SITE_URL}/guides/maprimerenov-2026`
  const mprGovSchema = getMaPrimeRenovGovServiceSchema(`${PAGE_URL_MPR}#maprimerenov`)
  const ecoPtzGovSchema = getEcoPtzGovServiceSchema(`${PAGE_URL_MPR}#eco-ptz`)

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema,
          faqSchema,
          articleSchema,
          financialProductSchema,
          ecoPtzSchema,
          mprGovSchema,
          ecoPtzGovSchema,
        ]}
      />

      <div className="min-h-screen bg-sand-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumb
              items={[{ label: 'Guides', href: '/guides' }, { label: 'MaPrimeRénov 2026' }]}
            />
          </div>
        </div>

        {/* Hero */}
        <div className="bg-gradient-to-b from-green-50 via-accent-50/30 to-sand-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Mis à jour mars 2026
              </span>
            </div>
            <h1
              data-speakable="true"
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal-900 font-heading leading-tight"
            >
              {"MaPrimeRénov' 2026 : Guide Complet des Aides à la Rénovation Énergétique"}
            </h1>
            <ArticleMeta
              author="ServicesArtisans"
              datePublished="2026-01-15"
              dateModified="2026-03-10"
              className="justify-center mt-4"
            />
            <p className="mt-4 text-xl text-charcoal-600 max-w-3xl">
              {"Jusqu'à "}
              <span className="font-semibold text-green-700">90 % de vos travaux financés</span>
              {'. Montants, barèmes et démarches MaPrimeRénov 2026.'}
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Key figures */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-6 mb-12">
            {keyFigures.map((fig) => (
              <div
                key={fig.label}
                className="bg-white rounded-xl border border-sand-300 p-5 shadow-sm text-center"
              >
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${fig.bg} mb-3`}
                >
                  <fig.icon className={`w-5 h-5 ${fig.color}`} />
                </div>
                <div className={`text-xl md:text-2xl font-bold ${fig.color}`}>{fig.value}</div>
                <div className="text-xs text-charcoal-500 mt-1">{fig.label}</div>
              </div>
            ))}
          </div>

          {/* Table of contents */}
          <nav className="bg-white rounded-xl border border-sand-300 p-6 mb-12">
            <h2 className="text-sm font-semibold text-charcoal-500 uppercase tracking-wide mb-3">
              Sommaire
            </h2>
            <ol className="grid md:grid-cols-2 gap-2">
              {tocItems.map((item, index) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="flex items-center gap-2 text-charcoal-700 hover:text-green-700 transition-colors py-1"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-50 text-green-700 text-xs font-semibold flex items-center justify-center">
                      {index + 1}
                    </span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Section: Qu'est-ce que MaPrimeRénov' ? */}
          <section id="quest-ce-que" className="mb-16 scroll-mt-20">
            <h2 className="text-2xl md:text-3xl font-bold text-charcoal-900 font-heading mb-6">
              {"Qu'est-ce que MaPrimeRénov' ?"}
            </h2>
            <div className="bg-white rounded-xl border border-sand-300 p-6 md:p-8">
              <p className="text-charcoal-700 leading-relaxed">
                {
                  "MaPrimeRénov' est l'aide principale de l'État pour la rénovation énergétique des logements, gérée par l'ANAH depuis 2020 (en remplacement du CITE et des aides « Habiter Mieux »). En 2026, elle propose deux parcours : accompagné (rénovation globale, gain ≥ 2 classes DPE) et par geste (chauffage, eau chaude, ventilation). Tous les propriétaires sont éligibles — occupants ou bailleurs — avec un montant variable selon revenus, travaux et parcours."
                }
              </p>
            </div>
          </section>

          {/* Section: Les deux parcours */}
          <section id="parcours" className="mb-16 scroll-mt-20">
            <h2 className="text-2xl md:text-3xl font-bold text-charcoal-900 font-heading mb-6">
              Quels sont les deux parcours MaPrimeRénov&apos; en 2026&nbsp;?
            </h2>
            <p className="text-charcoal-600 mb-6 leading-relaxed">
              {
                "Deux parcours selon l'ampleur du projet. Depuis 2025, l'isolation seule n'est plus éligible au parcours par geste."
              }
            </p>

            {/* Parcours accompagné */}
            <div className="bg-white rounded-xl border-2 border-green-200 p-6 md:p-8 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-charcoal-900">Parcours accompagné</h3>
                  <p className="text-sm text-green-700 font-medium">Rénovation globale</p>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-charcoal-700">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Gain minimum de 2 classes DPE exigé</span>
                </li>
                <li className="flex items-start gap-2 text-charcoal-700">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Accompagnateur Rénov&apos; (MAR) obligatoire</span>
                </li>
                <li className="flex items-start gap-2 text-charcoal-700">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{'Plafond de travaux : 70 000 € HT'}</span>
                </li>
                <li className="flex items-start gap-2 text-charcoal-700">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{'Bonus sortie de passoire thermique : +10 %'}</span>
                </li>
              </ul>

              {/* Tableau parcours accompagné */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-green-50">
                      <th className="text-left p-3 text-sm font-semibold text-charcoal-700 border border-green-100">
                        Catégorie de revenus
                      </th>
                      <th className="text-center p-3 text-sm font-semibold text-charcoal-700 border border-green-100">
                        Taux de financement
                      </th>
                      <th className="text-center p-3 text-sm font-semibold text-charcoal-700 border border-green-100">
                        Plafond aide
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {parcoursAccompagne.map((row) => (
                      <tr key={row.categorie} className="hover:bg-sand-50">
                        <td className="p-3 border border-sand-200">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${row.couleur}`}
                          >
                            {row.categorie}
                          </span>
                        </td>
                        <td className="p-3 text-center font-semibold text-charcoal-900 border border-sand-200">
                          {row.taux}
                        </td>
                        <td className="p-3 text-center font-semibold text-green-700 border border-sand-200">
                          {row.plafond}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 bg-amber-50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    <strong>Bonus sortie de passoire :</strong> +10 % si passage de F/G à classe D
                    minimum. Très modestes : jusqu&apos;à 90 % de financement.
                  </p>
                </div>
              </div>
            </div>

            {/* Parcours par geste */}
            <div className="bg-white rounded-xl border-2 border-primary-200 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Hammer className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-charcoal-900">Parcours par geste</h3>
                  <p className="text-sm text-primary-600 font-medium">Mono-geste ciblé</p>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">
                    <strong>Depuis 2025 :</strong>{' '}
                    {
                      'isolation seule (murs, toiture, plancher) plus éligible au parcours par geste. Seuls chauffage, eau chaude et ventilation sont concernés.'
                    }
                  </p>
                </div>
              </div>

              <p className="text-charcoal-700 mb-6">
                Montants forfaitaires par équipement, sans rénovation globale requise.
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                {parcoursGeste.map((item) => (
                  <div
                    key={item.travaux}
                    className="flex items-center gap-3 bg-primary-50/50 rounded-lg p-4 border border-primary-100"
                  >
                    <item.icon className="w-5 h-5 text-primary-500 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-charcoal-900 text-sm">{item.travaux}</div>
                      <div className="text-primary-600 font-semibold text-sm">{item.montant}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section: Barèmes de revenus */}
          <section id="baremes" className="mb-16 scroll-mt-20">
            <h2 className="text-2xl md:text-3xl font-bold text-charcoal-900 font-heading mb-6">
              Quels sont les barèmes de revenus MaPrimeRénov&apos; 2026&nbsp;?
            </h2>
            <p className="text-charcoal-600 mb-6">
              {
                'Quatre catégories (très modestes, modestes, intermédiaires, supérieurs) basées sur le revenu fiscal de référence N-1, avec plafonds différenciés selon foyer et zone (Île-de-France ou Province).'
              }
            </p>

            {/* Île-de-France */}
            <div className="bg-white rounded-xl border border-sand-300 p-6 md:p-8 mb-6">
              <h3 className="text-lg font-bold text-charcoal-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary-500" />
                Île-de-France
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-sand-50">
                      <th className="text-left p-3 font-semibold text-charcoal-700 border border-sand-200">
                        Composition du foyer
                      </th>
                      <th className="text-center p-3 font-semibold text-charcoal-700 border border-sand-200">
                        <span className="inline-block px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs">
                          Très modestes
                        </span>
                      </th>
                      <th className="text-center p-3 font-semibold text-charcoal-700 border border-sand-200">
                        <span className="inline-block px-2 py-0.5 rounded bg-primary-100 text-primary-800 text-xs">
                          Modestes
                        </span>
                      </th>
                      <th className="text-center p-3 font-semibold text-charcoal-700 border border-sand-200">
                        <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs">
                          Intermédiaires
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {baremesIDF.map((row) => (
                      <tr key={row.personnes} className="hover:bg-sand-50">
                        <td className="p-3 font-medium text-charcoal-900 border border-sand-200">
                          {row.personnes}
                        </td>
                        <td className="p-3 text-center text-charcoal-700 border border-sand-200">
                          {row.tresModestes}
                        </td>
                        <td className="p-3 text-center text-charcoal-700 border border-sand-200">
                          {row.modestes}
                        </td>
                        <td className="p-3 text-center text-charcoal-700 border border-sand-200">
                          {row.intermediaires}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Province */}
            <div className="bg-white rounded-xl border border-sand-300 p-6 md:p-8">
              <h3 className="text-lg font-bold text-charcoal-900 mb-4 flex items-center gap-2">
                <Home className="w-5 h-5 text-green-600" />
                Autres régions (Province)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-sand-50">
                      <th className="text-left p-3 font-semibold text-charcoal-700 border border-sand-200">
                        Composition du foyer
                      </th>
                      <th className="text-center p-3 font-semibold text-charcoal-700 border border-sand-200">
                        <span className="inline-block px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs">
                          Très modestes
                        </span>
                      </th>
                      <th className="text-center p-3 font-semibold text-charcoal-700 border border-sand-200">
                        <span className="inline-block px-2 py-0.5 rounded bg-primary-100 text-primary-800 text-xs">
                          Modestes
                        </span>
                      </th>
                      <th className="text-center p-3 font-semibold text-charcoal-700 border border-sand-200">
                        <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs">
                          Intermédiaires
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {baremesProvince.map((row) => (
                      <tr key={row.personnes} className="hover:bg-sand-50">
                        <td className="p-3 font-medium text-charcoal-900 border border-sand-200">
                          {row.personnes}
                        </td>
                        <td className="p-3 text-center text-charcoal-700 border border-sand-200">
                          {row.tresModestes}
                        </td>
                        <td className="p-3 text-center text-charcoal-700 border border-sand-200">
                          {row.modestes}
                        </td>
                        <td className="p-3 text-center text-charcoal-700 border border-sand-200">
                          {row.intermediaires}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 bg-primary-50 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-primary-800">
                  Au-delà des plafonds intermédiaires : catégorie « revenus supérieurs ». Reste
                  éligible au parcours accompagné (30 %).
                </p>
              </div>
            </div>
          </section>

          {/* Section: Travaux éligibles */}
          <section id="travaux" className="mb-16 scroll-mt-20">
            <h2 className="text-2xl md:text-3xl font-bold text-charcoal-900 font-heading mb-6">
              Quels travaux sont éligibles à MaPrimeRénov&apos; en 2026&nbsp;?
            </h2>
            <p className="text-charcoal-600 mb-6 leading-relaxed">
              {
                'Chauffage, eau chaude sanitaire, ventilation, plus isolation et menuiseries en parcours accompagné uniquement. Artisan RGE certifié obligatoire pour chaque catégorie.'
              }
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {travauxEligibles.map((travail) => (
                <div
                  key={travail.title}
                  className={`bg-white rounded-xl border p-5 ${
                    travail.warning ? 'border-amber-200' : 'border-sand-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        travail.warning ? 'bg-amber-50' : 'bg-green-50'
                      }`}
                    >
                      <travail.icon
                        className={`w-5 h-5 ${travail.warning ? 'text-amber-600' : 'text-green-600'}`}
                      />
                    </div>
                    <h3 className="font-semibold text-charcoal-900">{travail.title}</h3>
                  </div>
                  <p className="text-sm text-charcoal-600 mb-3">{travail.description}</p>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      travail.warning
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {travail.parcours}
                  </span>
                  {travail.warning && (
                    <div className="mt-3 flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700">
                        Non éligible en mono-geste depuis 2025
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Section: Démarches */}
          <section id="demarches" className="mb-16 scroll-mt-20">
            <h2 className="text-2xl md:text-3xl font-bold text-charcoal-900 font-heading mb-6">
              Comment faire sa demande MaPrimeRénov&apos; en 2026&nbsp;?
            </h2>
            <p className="text-charcoal-600 mb-6 leading-relaxed">
              {
                "Demande en ligne sur maprimerenov.gouv.fr AVANT le démarrage des travaux. Tout chantier démarré avant l'accord ANAH est refusé."
              }
            </p>
            <div className="space-y-4">
              {etapesDemande.map((etape) => (
                <div
                  key={etape.numero}
                  className="bg-white rounded-xl border border-sand-300 p-5 flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {etape.numero}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <etape.icon className="w-4 h-4 text-green-600" />
                      <h3 className="font-semibold text-charcoal-900">{etape.title}</h3>
                    </div>
                    <p className="text-sm text-charcoal-600">{etape.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-red-50 rounded-xl border border-red-200 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900 mb-1">
                    Ne commencez pas les travaux avant l&apos;accord ANAH
                  </h4>
                  <p className="text-sm text-red-800">
                    {
                      "Attendre l'accusé de réception de l'ANAH avant de signer le devis définitif. Tout chantier démarré avant dépôt du dossier sera refusé."
                    }
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Cumul */}
          <section id="cumul" className="mb-16 scroll-mt-20">
            <h2 className="text-2xl md:text-3xl font-bold text-charcoal-900 font-heading mb-6">
              Avec quelles autres aides peut-on cumuler MaPrimeRénov&apos;&nbsp;?
            </h2>
            <p className="text-charcoal-600 mb-6">
              {
                'Cumulable avec CEE, éco-PTZ, TVA 5,5 %, aides locales et chèque énergie pour réduire le reste à charge.'
              }
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {aidesCumulables.map((aide) => (
                <div key={aide.title} className="bg-white rounded-xl border border-sand-300 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                      <aide.icon className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-charcoal-900 text-sm">{aide.title}</h3>
                  </div>
                  <p className="text-sm text-charcoal-600">{aide.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-green-50 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">
                  <strong>Plafond cumul :</strong> 100 % du montant TTC max. Reste à charge minimum
                  10 % pour les ménages très modestes en parcours accompagné.
                </p>
              </div>
            </div>
          </section>

          {/* Section: FAQ */}
          <section id="faq" className="mb-16 scroll-mt-20">
            <h2 className="text-2xl md:text-3xl font-bold text-charcoal-900 font-heading mb-6">
              Questions fréquentes
            </h2>
            <div className="space-y-4">
              {faqItems.map((faq, index) => (
                <details key={index} className="bg-white rounded-xl border border-sand-300 group">
                  <summary className="flex items-center gap-3 p-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <HelpCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="font-semibold text-charcoal-900 flex-1">{faq.question}</span>
                    <ChevronRight className="w-5 h-5 text-charcoal-400 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="px-5 pb-5 pl-13">
                    <p className="text-charcoal-600 leading-relaxed pl-8">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          <RgeGuideBlock variant="generic" title="Artisans RGE éligibles MaPrimeRénov'" />

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600 to-accent-600 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white font-heading mb-4">
              {'Trouvez un artisan RGE certifié'}
            </h2>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
              {
                'MaPrimeRénov exige un artisan RGE certifié. Trouvez-en un près de chez vous sur ServicesArtisans.'
              }
            </p>
            <Link
              href="/services/renovation-energetique"
              className="inline-flex items-center gap-2 bg-white text-green-700 font-semibold px-6 py-3 rounded-lg hover:bg-green-50 transition-colors shadow-lg"
            >
              Rechercher un artisan RGE
              <ArrowRight className="w-5 h-5" />
            </Link>
          </section>
        </div>
      </div>

      {/* Sticky CTA mobile — simulateur aides rénovation */}
      <SimulateurCTA variant="sticky-bottom" />
    </>
  )
}
