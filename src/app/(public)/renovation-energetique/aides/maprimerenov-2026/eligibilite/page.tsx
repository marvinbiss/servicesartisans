/**
 * Page : /renovation-energetique/aides/maprimerenov-2026/eligibilite
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "maprimerenov eligibilite"           → 0 vol direct (longue traîne questions)
 * - "qui peut beneficier de maprimerenov" → longue traîne forte intent
 * - "conditions maprimerenov 2026"       → longue traîne
 * - "logement eligible maprimerenov"     → longue traîne
 * - Famille cumulée pivot : ~200 vol/mois (longue traîne, intent qualification)
 *
 * Source : audit Ahrefs API live (cf docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md)
 * Easy win : OUI sur questions de qualification (peu de pages dédiées, intent transactionnel haut)
 *            Captation utilisateur en phase pré-achat → mise en relation simulateur élevée
 * Cluster pillar : Rénovation Énergétique → Aides → MaPrimeRénov’ 2026 → Éligibilité
 *
 * Anti-cannibalisation :
 *   - Page parente /maprimerenov-2026/ = barèmes + parcours + démarche
 *   - Cette page = checklist conditions complète (logement, revenus, travaux, artisan)
 *   - Sub /montants/ = grille forfaits | Sub /parcours-accompagne/ = rénovation d’ampleur
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Building,
  CheckCircle2,
  ClipboardCheck,
  Coins,
  Home,
  ShieldCheck,
  Users,
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

const PAGE_PATH = '/renovation-energetique/aides/maprimerenov-2026/eligibilite'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'claire-dubois'
const AUTHOR_NAME = 'Claire Dubois'

const TITLE = 'Éligibilité MaPrimeRénov 2026'
const DESCRIPTION =
  'Conditions MaPrimeRénov 2026 : revenus fiscaux, type de logement, ancienneté, occupation, RGE obligatoire. Calculer son profil et son éligibilité.'

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
  '4 conditions cumulatives : être propriétaire (occupant ou bailleur), logement > 15 ans, résidence principale 8 mois/an, artisan RGE.',
  'Aucun plafond d’âge ni de profession. Locataires non éligibles directement (passer par le bailleur).',
  'Logement neuf < 15 ans non éligible (sauf changement chauffage à énergie renouvelable depuis 2026).',
  'Copropriétés : MaPrimeRénov’ Copropriété pour parties communes (jusqu’à 25 % du devis).',
  'Bailleurs : éligibles depuis 2022 (max 3 logements/5 ans). Engagement de location pendant 6 ans.',
  'Indivision : un seul demandeur désigné par tous les indivisaires (mandat).',
]

const CONDITIONS = [
  {
    icon: Users,
    title: 'Statut du demandeur',
    items: [
      { ok: true, text: 'Propriétaire occupant (résidence principale)' },
      { ok: true, text: 'Propriétaire bailleur (résidence principale du locataire)' },
      { ok: true, text: 'Indivisaire (avec mandat des co-indivisaires)' },
      { ok: true, text: 'Usufruitier (avec accord du nu-propriétaire)' },
      { ok: true, text: 'Société civile immobilière (SCI familiale uniquement)' },
      { ok: false, text: 'Locataire (passer par le bailleur)' },
      { ok: false, text: 'Société commerciale (SARL, SAS, SA)' },
    ],
  },
  {
    icon: Home,
    title: 'Caractéristiques du logement',
    items: [
      { ok: true, text: 'Logement de plus de 15 ans à la date de demande' },
      { ok: true, text: 'Maison individuelle ou appartement en copropriété' },
      { ok: true, text: 'Résidence principale (occupée ≥ 8 mois/an)' },
      { ok: true, text: 'Engagement de maintenir en résidence principale 5-6 ans' },
      {
        ok: false,
        text: 'Logement neuf < 15 ans (exception : changement chauffage EnR depuis 2026)',
      },
      { ok: false, text: 'Résidence secondaire' },
      { ok: false, text: 'Logement loué moins de 12 mois sur les 24 derniers (Bailleur)' },
    ],
  },
  {
    icon: ClipboardCheck,
    title: 'Travaux éligibles',
    items: [
      { ok: true, text: 'Pompe à chaleur air-eau, géothermique, hybride' },
      { ok: true, text: 'Chaudière biomasse (granulés, bûches), chauffe-eau thermodynamique' },
      { ok: true, text: 'Isolation thermique (combles, murs, sols, ITE/ITI)' },
      { ok: true, text: 'VMC double flux, audit énergétique, solaire combiné' },
      { ok: true, text: 'Fenêtres double vitrage (Parcours accompagné uniquement)' },
      { ok: false, text: 'PAC air-air (climatisation réversible)' },
      { ok: false, text: 'Chaudière fioul ou gaz (interdites depuis 2022)' },
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Artisan',
    items: [
      {
        ok: true,
        text: 'Mention RGE (Reconnu Garant de l’Environnement) valide à la date du devis',
      },
      {
        ok: true,
        text: 'Qualification spécifique au métier : Qualibat 5911 (ITE), QualiPAC, Qualifelec, etc.',
      },
      { ok: true, text: 'Devis détaillé avec performance équipements (ETAS, COP, R, Up)' },
      { ok: true, text: 'Sous-traitant lui-même RGE (pas de marque blanche)' },
      { ok: false, text: 'Artisan sans mention RGE' },
      { ok: false, text: 'Auto-réalisation (travaux par le propriétaire lui-même)' },
    ],
  },
]

const CAS_PARTICULIERS = [
  {
    titre: 'Copropriété',
    detail:
      'Parties communes : MaPrimeRénov’ Copropriété (jusqu’à 25 % du devis, +bonus passoire). Décision en AG obligatoire. Mon Accompagnateur Rénov’ Copropriété requis. Parties privatives : MPR individuelle classique.',
  },
  {
    titre: 'Bailleur',
    detail:
      'Éligible depuis 2022. Max 3 logements/5 ans par bailleur. Engagement de louer 6 ans en résidence principale du locataire à un loyer encadré. Plafonds de loyer fixés par l’Anah selon la zone (A, A bis, B1, B2, C).',
  },
  {
    titre: 'Indivision',
    detail:
      'Un seul indivisaire dépose la demande, avec mandat des co-indivisaires. Tous doivent signer le mandat (formulaire Anah). Le demandeur est responsable du dossier et reçoit la prime, à charge pour lui de répartir.',
  },
  {
    titre: 'Usufruitier',
    detail:
      'L’usufruitier peut faire la demande avec accord écrit du nu-propriétaire. Le logement doit être occupé en résidence principale par l’usufruitier ou un locataire. Parcours accompagné possible.',
  },
  {
    titre: 'SCI familiale',
    detail:
      'SCI à objet exclusivement familial éligible (associés tous parents/alliés). Le logement doit être occupé en résidence principale par l’un des associés. Demande déposée par la SCI (avec K-bis). Pas d’éligibilité pour SCI commerciales.',
  },
  {
    titre: 'Locataire',
    detail:
      'Pas éligible directement. Convaincre le bailleur de demander la prime. Le locataire peut bénéficier des CEE Coup de pouce avec son artisan (ne nécessite pas l’accord du bailleur pour certains gestes), et déduire la TVA 5,5 % automatique.',
  },
]

const PIECES = [
  'Pièce d’identité du demandeur',
  'Justificatif de domicile (taxe foncière + facture EDF/eau)',
  'Avis d’imposition année N-1 (RFR + composition foyer)',
  'Devis détaillé artisan RGE (mention RGE visible, performance équipements)',
  'Mandat des co-indivisaires (si indivision)',
  'K-bis (si SCI)',
  'Attestation sur l’honneur résidence principale 8 mois/an',
  'RIB pour versement',
]

const faqs = [
  {
    question: 'Qui peut bénéficier de MaPrimeRénov’ en 2026 ?',
    answer:
      'Tous les propriétaires (occupants ou bailleurs) d’un logement de plus de 15 ans, occupé en résidence principale au moins 8 mois par an. Aucun plafond d’âge, aucune condition de profession. Le montant dépend des revenus (4 catégories Bleu/Jaune/Violet/Rose). Les copropriétés sont éligibles via MaPrimeRénov’ Copropriété pour les parties communes.',
  },
  {
    question: 'Un locataire peut-il bénéficier de MaPrimeRénov’ ?',
    answer:
      'Non, MaPrimeRénov’ est réservée aux propriétaires. Un locataire peut en revanche : (1) demander à son bailleur de faire les travaux et solliciter la prime, (2) bénéficier des CEE Coup de pouce avec son artisan pour certains gestes (isolation combles, fenêtres) sans accord du bailleur, (3) profiter automatiquement de la TVA 5,5 % avec artisan RGE.',
  },
  {
    question: 'Mon logement de 12 ans est-il éligible ?',
    answer:
      'Non, le logement doit avoir au moins 15 ans à la date de demande. Une exception existe depuis 2026 : le remplacement d’un chauffage par un système à énergie renouvelable (PAC, biomasse, solaire) est éligible dès la 2e année du logement, à condition que le logement ait au moins 2 ans. Cette exception ne couvre que le geste chauffage, pas l’isolation.',
  },
  {
    question: 'Puis-je cumuler MaPrimeRénov’ avec d’autres aides ?',
    answer:
      'Oui. MaPrimeRénov’ se cumule avec les CEE (Coup de pouce ou classique), l’éco-PTZ (jusqu’à 50 000 € à 0 %), la TVA 5,5 % (automatique), et les aides locales (région, département, agglo, commune). Plafond global : 90 % du devis pour les très modestes (Bleu), 75 % pour les modestes (Jaune), 60 % intermédiaires (Violet), 40 % supérieurs (Rose).',
  },
  {
    question: 'Comment vérifier si mon artisan est bien RGE ?',
    answer:
      'Annuaire officiel sur france-renov.gouv.fr (filtrer par code postal et type de travaux), ou notre annuaire RGE vérifié quotidiennement via l’API ADEME. La mention RGE doit être valide à la date du devis (pas seulement au moment des travaux). Un sous-traitant doit lui aussi être RGE pour la part qu’il exécute. Demander toujours l’attestation RGE avec le devis.',
  },
  {
    question: 'Bailleur : combien de logements puis-je rénover ?',
    answer:
      'Maximum 3 logements distincts sur une période de 5 ans glissants. Au-delà, les demandes sont refusées. Engagement de louer chaque logement pendant 6 ans en résidence principale du locataire, à un loyer encadré selon la zone géographique (plafonds fixés par l’Anah). Le bailleur signe une convention spécifique au moment de la demande.',
  },
  {
    question: 'Quelle est la différence entre Parcours par geste et Parcours accompagné ?',
    answer:
      'Par geste : 1 ou 2 travaux ciblés, montants forfaitaires (jusqu’à 11 000 € PAC géothermique Bleu), pas d’accompagnateur obligatoire. Parcours accompagné : rénovation d’ampleur visant gain ≥ 2 classes DPE, montants en pourcentage du devis (jusqu’à 90 % pour Bleu, plafond 70 000 €), Mon Accompagnateur Rénov’ obligatoire, audit énergétique préalable. Voir notre page dédiée Parcours accompagné.',
  },
  {
    question: 'Que faire si MaPrimeRénov’ est refusée ?',
    answer:
      'Vérifier le motif de refus (souvent : devis non conforme, mention RGE expirée, logement < 15 ans, revenus dépassant Rose, demande après signature). Recours gracieux possible dans les 2 mois auprès de l’Anah. Si refus définitif : demander un avis France Rénov’ (gratuit, 0 808 800 700) pour identifier les alternatives — CEE, éco-PTZ, aides locales — qui peuvent souvent compenser.',
  },
]

const sources = [
  { label: 'Anah — Conditions MaPrimeRénov’ 2026', url: 'https://www.anah.gouv.fr' },
  {
    label: 'France Rénov’ — Éligibilité MPR',
    url: 'https://france-renov.gouv.fr/aides/maprimerenov',
  },
  {
    label: 'Service-Public.fr — Critères MPR',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F35083',
  },
  {
    label: 'Légifrance — Décret 2020-26',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000041365413',
  },
  { label: 'ADEME — RGE annuaire officiel', url: 'https://france-renov.gouv.fr/annuaire-rge' },
]

const relatedPages = [
  {
    label: 'MaPrimeRénov’ 2026 (hub)',
    href: '/renovation-energetique/aides/maprimerenov-2026',
    description: 'Barèmes revenus + parcours + démarche',
  },
  {
    label: 'MaPrimeRénov’ : montants par travaux',
    href: '/renovation-energetique/aides/maprimerenov-2026/montants',
    description: 'Grille forfaits 2026 PAC, isolation…',
  },
  {
    label: 'Parcours accompagné MaPrimeRénov’',
    href: '/renovation-energetique/aides/maprimerenov-2026/parcours-accompagne',
    description: 'Rénovation d’ampleur jusqu’à 70 000 €',
  },
  {
    label: 'CEE Coup de pouce',
    href: '/renovation-energetique/aides/cee-certificats-economie-energie',
    description: 'Prime énergie cumulable avec MPR',
  },
  {
    label: 'Trouver un artisan RGE',
    href: '/rge/renovation-energetique',
    description: 'Annuaire vérifié quotidiennement',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'Vérifier votre éligibilité en 2 min',
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
    section: 'Éligibilité MaPrimeRénov’',
    keywords: [
      'maprimerenov eligibilite',
      'qui peut beneficier maprimerenov',
      'conditions maprimerenov 2026',
      'logement eligible maprimerenov',
      'maprimerenov bailleur',
      'maprimerenov copropriete',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Aides', url: '/renovation-energetique/aides' },
    { name: 'MaPrimeRénov’ 2026', url: '/renovation-energetique/aides/maprimerenov-2026' },
    { name: 'Éligibilité', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'Conditions d’éligibilité MaPrimeRénov’ 2026',
    description:
      'Conditions cumulatives pour bénéficier de MaPrimeRénov’ en 2026 : statut du demandeur (propriétaire), logement (> 15 ans, résidence principale), travaux (liste éligible Anah), artisan (mention RGE valide).',
    url: PAGE_URL,
    serviceType: 'Critères d’éligibilité aide publique',
    audience: 'Propriétaires occupants, bailleurs et copropriétés',
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
              {
                label: 'MaPrimeRénov’ 2026',
                href: '/renovation-energetique/aides/maprimerenov-2026',
              },
              { label: 'Éligibilité' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <ClipboardCheck className="w-3.5 h-3.5" aria-hidden />
              Conditions Anah 2026
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              MaPrimeRénov’ 2026 : éligibilité complète
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Pour bénéficier de <strong>MaPrimeRénov’ en 2026</strong>, quatre conditions
              cumulatives doivent être réunies : être propriétaire, posséder un logement de plus de
              15 ans, l’occuper en résidence principale et faire réaliser les travaux par un artisan
              portant la mention RGE. Voici la checklist détaillée et les cas particuliers
              (bailleur, copropriété, indivision, usufruit, SCI familiale).
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="conditions">Les 4 conditions cumulatives</h2>
            <div className="not-prose grid gap-4 my-6">
              {CONDITIONS.map((c) => {
                const Icon = c.icon
                return (
                  <div key={c.title} className="bg-white border border-sand-200 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-700 grid place-items-center shrink-0">
                        <Icon className="w-5 h-5" aria-hidden />
                      </div>
                      <h3 className="font-heading text-lg font-semibold text-sand-900 m-0">
                        {c.title}
                      </h3>
                    </div>
                    <ul className="text-sm text-sand-700 space-y-1.5 list-none m-0 p-0">
                      {c.items.map((item) => {
                        const Icon2 = item.ok ? CheckCircle2 : XCircle
                        const color = item.ok ? 'text-accent-600' : 'text-red-600'
                        return (
                          <li key={item.text} className="flex items-start gap-2">
                            <Icon2 className={`w-4 h-4 shrink-0 mt-0.5 ${color}`} aria-hidden />
                            <span>{item.text}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )
              })}
            </div>

            <h2 id="cas-particuliers">Cas particuliers (6 situations)</h2>
            <div className="not-prose grid gap-3 my-6">
              {CAS_PARTICULIERS.map((cas) => (
                <div key={cas.titre} className="bg-white border border-sand-200 rounded-xl p-4">
                  <p className="font-semibold text-sand-900 m-0 mb-1">{cas.titre}</p>
                  <p className="text-sm text-sand-700 m-0">{cas.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="pieces">Pièces à fournir au dossier</h2>
            <ul>
              {PIECES.map((p) => (
                <li key={p}>
                  <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <ClipboardCheck className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Vérifier votre éligibilité en 2 minutes
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Test rapide selon votre profil (occupant/bailleur/copro), vos revenus, votre
                    logement et vos travaux. Mise en relation Mon Accompagnateur Rénov’ si Parcours
                    accompagné.
                  </p>
                  <Link
                    href="/simulateur-aides-renovation"
                    className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                  >
                    Lancer le simulateur <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>

            <h2 id="quand-demander">Quand déposer la demande ?</h2>
            <p>
              <strong>Avant signature du devis</strong>, ou au plus tard avant le démarrage des
              travaux. La règle est stricte : une demande déposée après facture est systématiquement
              refusée. Une exception existe pour les équipements en panne irréparable (avec
              justificatif tels que rapport d’intervention chauffagiste). Délai moyen de
              notification : 15 jours, jusqu’à 2 mois en pic d’activité (octobre-mars).
            </p>

            <div className="not-prose flex items-start gap-3 border border-amber-200 bg-amber-50 rounded-lg p-4 my-6">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">
                  Erreur fréquente : signer le devis trop tôt
                </p>
                <p className="m-0">
                  Beaucoup de demandes sont rejetées parce que le devis a été signé avant le dépôt
                  MPR. Réflexe : valider l’éligibilité, déposer le dossier MPR, attendre la
                  notification (15 jours), PUIS signer le devis. Dans l’intervalle, demander à
                  l’artisan une option de réservation gratuite et non engageante.
                </p>
              </div>
            </div>

            <h2 id="copro-bailleur">Focus copropriété et bailleur</h2>
            <h3>Copropriété (parties communes)</h3>
            <p>
              <Building className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              MaPrimeRénov’ Copropriété finance jusqu’à 25 % du devis pour les rénovations d’ampleur
              (gain énergétique ≥ 35 %). Décision en assemblée générale à la majorité absolue
              (article 25 loi 1965). Mon Accompagnateur Rénov’ Copropriété obligatoire (liste agréée
              Anah). Bonification +500 à +1 500 € par logement pour sortie passoire. Cumul avec CEE
              Coup de pouce Copropriété possible.
            </p>
            <h3>Bailleur (résidence principale du locataire)</h3>
            <p>
              <Home className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              Éligible depuis 2022 sous conditions : maximum 3 logements/5 ans, engagement de
              location 6 ans en résidence principale du locataire, loyer encadré (plafonds Anah par
              zone A/A bis/B1/B2/C). Convention spécifique signée à la demande. Particulièrement
              intéressant pour sortir un logement F ou G avant les interdictions de location 2028 et
              2034.
            </p>
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
              href="/renovation-energetique/aides/maprimerenov-2026"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← MaPrimeRénov’ 2026
            </Link>
            <Link
              href="/rge/renovation-energetique"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Artisans RGE <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
