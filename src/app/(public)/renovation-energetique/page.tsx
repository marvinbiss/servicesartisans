import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  ShieldCheck,
  Thermometer,
  Wind,
  Droplet,
  Home,
  Flame,
  FileCheck2,
  Calculator,
  BookOpen,
  Users,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import SimulateurCTA from '@/components/cee/SimulateurCTA'
import LastUpdated from '@/components/seo/LastUpdated'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import {
  getBreadcrumbSchema,
  getCollectionPageSchema,
  getFAQSchema,
  getFinancialProductSchema,
  getGovernmentServiceSchema,
  getHowToSchema,
} from '@/lib/seo/jsonld'
import { RGE_ALLOWED_SERVICES } from '@/lib/rge/service-city-listings'
import { CEE_OPERATIONS_WITH_GUIDE } from '@/lib/cee/operation-guides-content'
import { CEE_SHORT_LABELS } from '@/lib/cee/shared-labels'

// Labels humains pour les services RGE (aligné avec services catalogue).
// Maintenu localement pour éviter une dépendance DB côté hub SSG.
const RGE_SERVICE_LABELS: Record<(typeof RGE_ALLOWED_SERVICES)[number], string> = {
  'pompe-a-chaleur': 'Pompe à chaleur',
  'panneaux-solaires': 'Panneaux solaires',
  'isolation-thermique': 'Isolation thermique',
  chauffagiste: 'Chauffagiste',
  electricien: 'Électricien',
  'renovation-energetique': 'Rénovation énergétique',
  menuisier: 'Menuisier',
  couvreur: 'Couvreur',
  plombier: 'Plombier',
  climaticien: 'Climaticien',
  ramoneur: 'Ramoneur',
  zingueur: 'Zingueur',
  facadier: 'Façadier',
  platrier: 'Plâtrier',
}

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const CONTENT_UPDATED_AT = '2026-04-19'

// Aides officielles publiques — chaque carte pointe sur un guide existant.
// Les montants affichés doivent rester synchronisés avec les barèmes officiels
// (arrêtés JORF / guide Anah Fév 2026). Toute mise à jour = bump CONTENT_UPDATED_AT.
const AIDES = [
  {
    title: "MaPrimeRénov'",
    description:
      "Aide de l'Anah versée selon 4 catégories de revenus (bleu, jaune, violet, rose). Parcours par geste ou accompagné (Mon Accompagnateur Rénov').",
    amount: 'Jusqu’à 70 000 € / logement',
    href: '/guides/maprimerenov-2026',
    icon: FileCheck2,
    authoritySource: 'https://www.anah.gouv.fr/',
  },
  {
    title: 'Primes CEE',
    description:
      "Certificats d'Économies d'Énergie financés par les obligés (EDF, Engie, TotalEnergies). Cumulables avec MaPrimeRénov'. Période P6 en cours (2026-2030).",
    amount: '300 € à 5 000 €+',
    href: '/cee',
    icon: Sparkles,
    authoritySource: 'https://france-renov.gouv.fr/aides/cee',
  },
  {
    title: 'TVA à 5,5 %',
    description:
      'Taux réduit automatique sur main-d’œuvre et matériaux énergétiques, valable en résidence principale ou secondaire achevée depuis plus de 2 ans.',
    amount: 'Économie ~14 % sur le devis',
    href: '/guides/aides-renovation-2026',
    icon: TrendingUp,
    authoritySource:
      'https://www.impots.gouv.fr/particulier/questions/vais-je-beneficier-du-taux-reduit-de-tva-pour-les-travaux',
  },
  {
    title: 'Éco-PTZ',
    description:
      "Prêt à taux zéro jusqu'à 50 000 € pour financer le reste à charge. Cumulable avec MaPrimeRénov' et CEE, durée remboursement jusqu'à 20 ans.",
    amount: 'Jusqu’à 50 000 €',
    href: '/guides/aides-renovation-2026',
    icon: BookOpen,
    authoritySource: 'https://www.service-public.fr/particuliers/vosdroits/F19905',
  },
] as const

// Travaux populaires — mix guide éditorial + route dynamique RGE/ville quand
// pertinent. Objectif : rediriger vers le guide le plus mature pour le sujet.
const TRAVAUX = [
  {
    title: 'Pompe à chaleur air-eau',
    description:
      "Remplace une chaudière gaz ou fioul. Aide MaPrimeRénov' + Coup de Pouce chauffage + CEE cumulés.",
    href: '/guides/pompe-a-chaleur-cee-maprimerenov-2026',
    icon: Thermometer,
    requireRge: 'QualiPAC',
  },
  {
    title: 'Isolation combles & toiture',
    description:
      "MaPrimeRénov' calculée au m² (25€ rampants / 75€ toiture terrasse en bleu). Plafonds revenus et dépenses.",
    href: '/guides/aide-isolation-maison-proprietaire',
    icon: Home,
    requireRge: 'Qualibat 7141/7143',
  },
  {
    title: 'Poêle à granulés',
    description:
      'Remplacement d’appareil ancien ou installation première. Cumul MPR + CEE + Coup de Pouce biomasse.',
    href: '/guides/poele-granules-aides-2026',
    icon: Flame,
    requireRge: 'QualiBois',
  },
  {
    title: 'Remplacement fenêtres',
    description:
      'Fenêtres double/triple vitrage performantes. Aide forfaitaire par menuiserie selon revenus.',
    href: '/guides/remplacement-fenetres-aides-2026',
    icon: Droplet,
    requireRge: 'Qualibat 3511/3514',
  },
  {
    title: 'VMC double flux',
    description:
      'Ventilation haut rendement. Opération BAR-TH-125 avec ou sans bonification selon équipements associés.',
    href: '/cee',
    icon: Wind,
    requireRge: 'Qualibat 5422',
  },
  {
    title: 'Audit énergétique',
    description:
      "Obligatoire pour le parcours accompagné Mon Accompagnateur Rénov'. Détaille les scénarios travaux et les sauts DPE.",
    href: '/guides/audit-energetique-prix-aides',
    icon: Calculator,
    requireRge: 'OPQIBI 1905 / Qualibat 8731',
  },
] as const

const FAQ: Array<{ question: string; answer: string }> = [
  {
    question: 'Quelles aides cumuler pour une rénovation énergétique en 2026 ?',
    answer:
      "Le trio gagnant : MaPrimeRénov' (Anah) + prime CEE (obligés) + TVA 5,5 % (automatique sur devis RGE). Vous pouvez ajouter l'éco-PTZ pour financer le reste à charge, et les aides de votre collectivité locale. Le plafond global est de 100 % du coût TTC, rarement atteint sauf pour les ménages très modestes sur des opérations fortement bonifiées. La règle non-négociable : l'artisan doit être RGE à la signature du devis (pas seulement au démarrage du chantier).",
  },
  {
    question: 'Comment savoir si mon artisan est bien RGE ?',
    answer:
      "Vérifiez sur france-renov.gouv.fr (annuaire officiel ADEME) avec le SIREN ou le nom de l'entreprise. La qualification RGE doit être en cours de validité à la date de signature du devis. Elle est délivrée par un organisme accrédité COFRAC : Qualibat (majeur métiers enveloppe + chauffage), Qualit'EnR (ENR), Qualifelec (électricité), Certibat ou OPQIBI. Un artisan RGE peut perdre sa certification en cours d'année — contrôle avant signature systématique.",
  },
  {
    question: "MaPrimeRénov' parcours par geste ou accompagné, quelle différence ?",
    answer:
      "Parcours par geste : vous faites un ou deux travaux isolés (isolation combles, fenêtres, PAC) avec demande en ligne autonome. Plafond 30 000 € d'aide/logement. Parcours accompagné : obligatoire dès 2 gestes d'isolation + changement de chauffage OU pour un saut d'au moins 2 classes DPE. Nécessite un Mon Accompagnateur Rénov' (MAR) agréé qui audite, pilote et garantit la cohérence. Plafond 70 000 €, montant supérieur, mais process plus long (3-6 mois).",
  },
  {
    question: 'Combien de temps entre le devis et le versement des aides ?',
    answer:
      "Délais typiques 2026 : MaPrimeRénov' parcours par geste = 2-4 mois après fin de travaux (facture + photos + AH). Parcours accompagné = versement en 2 tranches (30 % signature + 70 % réception). Prime CEE = 4-12 semaines après dossier complet chez le délégataire. La TVA 5,5 % est appliquée directement sur la facture, pas de remboursement a posteriori. L'éco-PTZ est débloqué avant travaux si dossier banque validé.",
  },
  {
    question: 'Est-ce que je peux faire les travaux moi-même pour toucher les aides ?',
    answer:
      "Non. MaPrimeRénov', CEE et TVA 5,5 % exigent impérativement une entreprise RGE (ou auto-entrepreneur RGE) qui fournit la facture. Le travail en auto-rénovation est exclu de TOUS les dispositifs d'aides publics et obligataires. Seule exception très encadrée : les matériaux achetés par un particulier pour pose par un artisan RGE peuvent, sous conditions strictes, ouvrir droit à une partie des aides — à valider au cas par cas.",
  },
  {
    question: "Je suis locataire, ai-je droit à MaPrimeRénov' ?",
    answer:
      "MaPrimeRénov' est réservée aux propriétaires (occupants ou bailleurs) et aux syndicats de copropriétaires. Les locataires ne peuvent pas en faire la demande directement, mais peuvent bénéficier d'un logement rénové via leur bailleur (qui touche MPR Bailleur avec engagement de plafonnement du loyer). En revanche, les primes CEE sont ouvertes aux locataires pour certaines opérations (équipements amovibles type thermostat, PAC air-air sans unité extérieure).",
  },
]

export const metadata: Metadata = {
  title: 'Rénovation énergétique 2026 : aides RGE',
  description:
    "Hub rénovation énergétique : MaPrimeRénov' 2026, primes CEE P6, TVA 5,5 %, éco-PTZ. Simulateur officiel, artisans RGE vérifiés via ADEME.",
  alternates: getAlternates(PAGE_PATH),
  openGraph: {
    locale: 'fr_FR',
    title: 'Rénovation énergétique 2026 — aides, travaux, artisans RGE',
    description:
      "Toutes les aides 2026 : MaPrimeRénov', CEE, TVA 5,5 %, éco-PTZ. Simulateur + annuaire officiel RGE.",
    url: PAGE_URL,
    siteName: 'ServicesArtisans',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rénovation énergétique 2026 : hub officiel',
    description:
      "MaPrimeRénov', CEE, TVA 5,5 %, éco-PTZ, artisans RGE. Toutes les aides 2026 cumulables.",
  },
}

export default function RenovationEnergetiqueHub() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: PAGE_PATH },
  ])

  const collectionSchema = getCollectionPageSchema({
    name: 'Rénovation énergétique 2026 : hub aides + artisans RGE',
    description:
      "Hub rénovation énergétique France 2026 : toutes les aides officielles cumulables (MaPrimeRénov', CEE, TVA 5,5 %, éco-PTZ), les travaux éligibles par qualification RGE, et le simulateur d'éligibilité Anah.",
    url: PAGE_PATH,
    itemCount: AIDES.length + TRAVAUX.length,
  })

  const mprSchema = getGovernmentServiceSchema({
    name: "MaPrimeRénov' 2026",
    description:
      "Aide publique de l'Anah pour la rénovation énergétique des logements. Barèmes par catégorie de revenus (bleu, jaune, violet, rose) et par geste. Parcours par geste (jusqu'à 30 000 €) ou accompagné (jusqu'à 70 000 €). Artisan RGE obligatoire à la signature du devis.",
    url: `${SITE_URL}/guides/maprimerenov-2026`,
    serviceType: 'Aide financière à la rénovation énergétique',
    audience:
      'Propriétaires occupants, bailleurs et copropriétés de logements achevés depuis plus de 15 ans',
    temporalCoverage: '2026-01-01/2026-12-31',
    sameAs: [
      'https://www.anah.gouv.fr/',
      'https://france-renov.gouv.fr/aides/maprimerenov',
      'https://www.maprimerenov.gouv.fr/',
    ],
  })

  const mprProductSchema = getFinancialProductSchema({
    name: "MaPrimeRénov' — aide à la rénovation énergétique",
    description:
      "Aide financière de l'Anah pour financer les travaux d'économies d'énergie dans les logements. Versement sous 2 à 4 mois après fin de travaux. Cumulable avec les primes CEE, la TVA 5,5 % et l'éco-PTZ. Conditions : propriétaire, logement achevé depuis +15 ans en résidence principale (ou bailleur avec engagement), artisan RGE.",
    url: `${SITE_URL}/guides/maprimerenov-2026`,
    category: 'Government Grant',
    feesAndCommissionsSpecification:
      "Aide directement versée par l'Anah. Pas de frais pour le bénéficiaire. Le Mon Accompagnateur Rénov' en parcours accompagné est rémunéré par l'aide (jusqu'à 2 000 € intégrés dans le plafond).",
  })

  const faqSchema = getFAQSchema(FAQ)

  // HowTo Schema — parcours "je commence une rénovation énergétique" en 6
  // étapes. Consommé par Google AI Overviews (champ de bataille 2026) : l'AIO
  // privilégie les structured data pour générer les réponses AI en tête SERP.
  const howToSchema = getHowToSchema(
    [
      {
        name: 'Faire un audit énergétique',
        text: "Réaliser un audit énergétique par un diagnostiqueur certifié RGE études (obligatoire pour MaPrimeRénov' parcours accompagné au-delà de 30 000 €). Identifie les postes prioritaires selon la classe DPE.",
      },
      {
        name: 'Simuler les aides cumulables',
        text: "Utiliser le simulateur ServicesArtisans ou france-renov.gouv.fr pour estimer MaPrimeRénov' + primes CEE + éco-PTZ + TVA 5,5 % selon revenus, zone climatique et travaux.",
      },
      {
        name: 'Choisir 3 artisans RGE',
        text: "Vérifier la qualification RGE active à la date de signature (Qualibat, QualiPAC, QualiBois selon le geste). L'annuaire ServicesArtisans se synchronise quotidiennement sur la base ADEME.",
      },
      {
        name: 'Déposer dossier AVANT devis',
        text: "Créer un compte maprimerenov.gouv.fr et déposer le dossier AVANT signature de devis. Joindre 3 devis comparables, RIB, avis d'imposition, attestation RGE.",
      },
      {
        name: 'Attendre accord Anah puis signer',
        text: "L'Anah instruit en 2 à 8 semaines. Signer le devis uniquement APRÈS réception de l'accord écrit, sinon l'aide est perdue.",
      },
      {
        name: 'Réaliser travaux et encaisser',
        text: "Travaux réalisés par l'artisan RGE sélectionné. Déposer facture finale sur maprimerenov.gouv.fr. Versement sous 2 à 4 mois. Cumul CEE versé séparément par le mandataire CEE.",
      },
    ],
    {
      name: 'Rénovation énergétique 2026 : toutes les étapes',
      description:
        "Parcours complet pour financer une rénovation énergétique en France en 2026 : audit, simulation des aides cumulables, choix des artisans RGE, dépôt du dossier MaPrimeRénov' et versement.",
      totalTime: 'P180D',
    }
  )

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={collectionSchema} />
      <JsonLd data={mprSchema} />
      <JsonLd data={mprProductSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}
      {howToSchema && <JsonLd data={howToSchema} />}

      <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: 'Rénovation énergétique' }]} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-charcoal-900 text-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <ShieldCheck className="w-4 h-4 text-emerald-300" aria-hidden="true" />
            <span className="text-sm font-medium text-emerald-100">
              Aides cumulables 2026 — artisans RGE vérifiés via ADEME
            </span>
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight mb-5">
            Rénovation énergétique 2026
          </h1>
          <p className="text-lg md:text-xl text-emerald-50/90 max-w-3xl leading-relaxed">
            MaPrimeRénov&apos;, primes CEE, TVA 5,5 %, éco-PTZ : toutes les aides officielles
            cumulables pour financer vos travaux. Simulateur d&apos;éligibilité instantané et
            annuaire d&apos;artisans RGE vérifiés directement via l&apos;API ADEME.
          </p>
          <LastUpdated
            label="Barèmes et aides vérifiés le"
            date={CONTENT_UPDATED_AT}
            className="mt-5 text-emerald-100/90"
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/simulateur-aides-renovation"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50 transition"
            >
              <Calculator className="w-5 h-5" aria-hidden="true" />
              Simuler mes aides
            </Link>
            <Link
              href="/artisans-rge"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              <Users className="w-5 h-5" aria-hidden="true" />
              Annuaire artisans RGE
            </Link>
          </div>
        </div>
      </section>

      {/* Simulateur CTA */}
      <section className="bg-white border-b border-charcoal-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <SimulateurCTA variant="card" />
        </div>
      </section>

      {/* Aides — cartes */}
      <section id="aides" className="bg-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mb-10">
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-charcoal-900 mb-3">
              Les 4 aides cumulables en 2026
            </h2>
            <p className="text-charcoal-600 leading-relaxed">
              Une rénovation énergétique mobilise en général 3 à 4 dispositifs conjoints. Chaque
              aide renvoie vers son guide détaillé avec les barèmes officiels à jour.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {AIDES.map((aide) => {
              const Icon = aide.icon
              return (
                <Link
                  key={aide.title}
                  href={aide.href}
                  className="group block rounded-2xl border border-charcoal-100 bg-white p-6 hover:border-emerald-300 hover:shadow-lg transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <Icon className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-heading text-lg font-bold text-charcoal-900">
                          {aide.title}
                        </h3>
                        <ArrowRight className="w-4 h-4 text-charcoal-400 group-hover:text-emerald-700 transition" />
                      </div>
                      <div className="text-sm font-semibold text-emerald-700 mb-2">
                        {aide.amount}
                      </div>
                      <p className="text-sm text-charcoal-600 leading-relaxed">
                        {aide.description}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Travaux populaires */}
      <section id="travaux" className="bg-emerald-50/40 py-12 md:py-16 border-y border-emerald-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mb-10">
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-charcoal-900 mb-3">
              Les travaux les plus demandés
            </h2>
            <p className="text-charcoal-600 leading-relaxed">
              Chaque poste est éligible à une ou plusieurs aides, sous réserve d&apos;un artisan RGE
              avec la qualification correspondante. Cliquez pour voir le guide détaillé.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRAVAUX.map((travail) => {
              const Icon = travail.icon
              return (
                <Link
                  key={travail.title}
                  href={travail.href}
                  className="group block rounded-xl border border-charcoal-100 bg-white p-5 hover:border-emerald-300 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <h3 className="font-heading font-bold text-charcoal-900 group-hover:text-emerald-700 transition">
                      {travail.title}
                    </h3>
                  </div>
                  <p className="text-sm text-charcoal-600 leading-relaxed mb-3">
                    {travail.description}
                  </p>
                  <div className="text-xs text-charcoal-500 font-medium">
                    Qualification requise :{' '}
                    <span className="text-charcoal-700">{travail.requireRge}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pourquoi RGE */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-charcoal-900 mb-4">
              Pourquoi un artisan RGE est obligatoire
            </h2>
            <p className="text-charcoal-600 leading-relaxed mb-4">
              La qualification RGE (<em>Reconnu Garant de l&apos;Environnement</em>) est exigée par
              toutes les aides publiques et obligataires depuis 2020 pour les travaux
              d&apos;économies d&apos;énergie en résidentiel. Elle est délivrée par un organisme
              accrédité COFRAC et doit être en cours de validité{' '}
              <strong>à la date de signature du devis</strong> — pas au démarrage du chantier.
            </p>
            <p className="text-charcoal-600 leading-relaxed mb-4">
              ServicesArtisans vérifie chaque jour la liste ADEME des 50 332 artisans RGE actifs en
              France. Chaque fiche affiche les qualifications exactes (Qualibat, Qualit&apos;EnR,
              Qualifelec, Certibat, OPQIBI) avec la date d&apos;expiration.
            </p>
            <Link
              href="/guides/annuaire-rge-verifier-officiel"
              className="inline-flex items-center gap-2 text-emerald-700 font-semibold hover:text-emerald-800"
            >
              Comment vérifier une qualification RGE
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6">
            <h3 className="font-heading text-xl font-bold text-charcoal-900 mb-4">
              Les 5 principaux organismes RGE
            </h3>
            <ul className="space-y-3 text-sm text-charcoal-700">
              <li>
                <strong>Qualibat</strong> — isolation, maçonnerie, couverture, menuiserie, plomberie
              </li>
              <li>
                <strong>Qualit&apos;EnR</strong> — pompes à chaleur (QualiPAC), bois (QualiBois),
                solaire (QualiSol, QualiPV)
              </li>
              <li>
                <strong>Qualifelec</strong> — installations électriques, IRVE, photovoltaïque
              </li>
              <li>
                <strong>OPQIBI</strong> — bureaux d&apos;études, audits énergétiques
              </li>
              <li>
                <strong>Certibat</strong> — entreprises générales du bâtiment (maisons
                individuelles)
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Maillage interne RGE × CEE — hub sculpting */}
      <section className="bg-white py-12 md:py-16 border-t border-charcoal-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-charcoal-900 mb-3">
            Artisans RGE par métier
          </h2>
          <p className="text-charcoal-600 mb-6 max-w-3xl">
            Accédez aux artisans RGE qualifiés pour chaque type de travaux. Chaque page métier liste
            les certifications requises, les opérations CEE éligibles, et les artisans actifs.
          </p>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-12">
            {RGE_ALLOWED_SERVICES.map((slug, idx) => {
              const label = RGE_SERVICE_LABELS[slug]
              // Anchor diversification — cycle through 3 phrasings to avoid
              // doorway-like template repetition flagged by Google spam models.
              const variant = idx % 3
              const anchor =
                variant === 0
                  ? `Artisans RGE ${label}`
                  : variant === 1
                    ? `Trouver un ${label.toLowerCase()} RGE`
                    : `${label} certifié RGE`
              return (
                <li key={slug}>
                  <Link
                    href={`/rge/${slug}`}
                    className="block px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 transition text-sm font-semibold text-emerald-900"
                  >
                    {anchor}
                  </Link>
                </li>
              )
            })}
          </ul>

          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-charcoal-900 mb-3">
            Guides Primes CEE par opération
          </h2>
          <p className="text-charcoal-600 mb-6 max-w-3xl">
            Détail des barèmes, éligibilité et cumul d&apos;aides pour chaque opération CEE active
            en 2026 (Période P6). Guides rédigés à partir des arrêtés JORF et du catalogue ADEME.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {CEE_OPERATIONS_WITH_GUIDE.map((code) => (
              <li key={code}>
                <Link
                  href={`/cee/${code.toLowerCase()}/guide`}
                  className="block px-4 py-3 rounded-xl border border-primary-200 bg-primary-50 hover:bg-primary-100 hover:border-primary-400 transition text-sm"
                >
                  <span className="font-bold text-primary-900">{code}</span>
                  <span className="text-charcoal-700 ml-2">
                    {CEE_SHORT_LABELS[code] ?? 'Opération CEE'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-charcoal-50 py-12 md:py-16 border-t border-charcoal-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-charcoal-900 mb-8">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <details
                key={item.question}
                className="group rounded-xl border border-charcoal-200 bg-white p-5 open:border-emerald-300"
              >
                <summary className="cursor-pointer font-heading font-bold text-charcoal-900 list-none flex justify-between items-start gap-4">
                  <span>{item.question}</span>
                  <span className="text-charcoal-400 group-open:rotate-180 transition flex-shrink-0">
                    <ArrowRight className="w-5 h-5 rotate-90" aria-hidden="true" />
                  </span>
                </summary>
                <p className="mt-3 text-charcoal-700 leading-relaxed text-sm">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Sources officielles */}
      <section className="bg-white py-10 border-t border-charcoal-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-lg font-bold text-charcoal-900 mb-3">
            Sources officielles
          </h2>
          <ul className="text-sm text-charcoal-600 space-y-1.5">
            <li>
              <a
                href="https://www.anah.gouv.fr/"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="hover:text-emerald-700 underline underline-offset-2"
              >
                Anah — Agence nationale de l&apos;habitat
              </a>
            </li>
            <li>
              <a
                href="https://france-renov.gouv.fr/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-700 underline underline-offset-2"
              >
                France Rénov&apos; — service public de la rénovation
              </a>
            </li>
            <li>
              <a
                href="https://www.ecologie.gouv.fr/politiques-publiques/certificats-deconomies-denergie"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="hover:text-emerald-700 underline underline-offset-2"
              >
                Ministère — Certificats d&apos;économies d&apos;énergie (CEE)
              </a>
            </li>
            <li>
              <a
                href="https://www.maprimerenov.gouv.fr/"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="hover:text-emerald-700 underline underline-offset-2"
              >
                MaPrimeRénov&apos; — plateforme officielle de demande
              </a>
            </li>
          </ul>
        </div>
      </section>
    </>
  )
}
