/**
 * Page : /renovation-energetique/aides/maprimerenov-2026
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "ma prime renov"               → 56 980 vol, KD 67, CPC $1,40, clicks 91 307 ⭐⭐⭐
 * - "maprimerenov"                 → 27 985 vol, KD 64, CPC $1,30
 * - "ma prime renov 2026"          → 11 746 vol, KD 69, CPC $1,30
 * - "maprimerenov 2026"            → 900 vol, KD 68, CPC $1,10
 * - Famille cumulée pivot : ~97 600 vol/mois (top 1 du cluster aides)
 *
 * Source : audit Ahrefs API live (cf docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md)
 * Easy win : NON (KD 64-69 — concurrence france-renov.gouv.fr, anah.gouv.fr, effy)
 *            Mais incontournable : page pivot du cluster aides, capte 97K vol cumulé.
 *            Stratégie = E-E-A-T fort + 3 sub-pages (montants, eligibilite, parcours-accompagne)
 *            captant la longue traîne moins compétitive.
 * Cluster pillar : Rénovation Énergétique → Aides → MaPrimeRénov’ 2026
 *
 * Anti-cannibalisation :
 *   - Hub /aides/ = panorama 4 dispositifs (intent général)
 *   - Cette page = HUB MPR définition + barème 2026 + parcours + démarche (intent "qu’est-ce que MPR")
 *   - Sub-pages : /montants/, /eligibilite/, /parcours-accompagne/ (intent transactionnel)
 *   - Existant /guides/maprimerenov-* (focus how-to)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Banknote,
  Calculator,
  CheckCircle2,
  Coins,
  Landmark,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import MprBaremeChip from '@/components/renovation/MprBaremeChip'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema, getGovernmentServiceSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/aides/maprimerenov-2026'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'claire-dubois'
const AUTHOR_NAME = 'Claire Dubois'

const TITLE = 'MaPrimeRénov 2026 : barèmes & démarche'
const DESCRIPTION =
  'MaPrimeRénov 2026 : barèmes 4 catégories, parcours par geste vs accompagné, éligibilité, démarche officielle, plafonds et bonus passoire/BBC.'

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
  'MaPrimeRénov’ : aide État versée par l’Anah pour la rénovation énergétique du logement.',
  '2 parcours en 2026 : "Par geste" (1 ou 2 travaux, jusqu’à 11 000 €) et "Parcours accompagné" (rénovation d’ampleur, jusqu’à 70 000 €).',
  '4 catégories de revenus : Bleu (très modeste), Jaune (modeste), Violet (intermédiaire), Rose (supérieur).',
  'Logement > 15 ans, occupé en résidence principale 8 mois/an, artisan RGE obligatoire.',
  'Demande à faire AVANT signature du devis sur france-renov.gouv.fr.',
  'Cumulable avec CEE, éco-PTZ, TVA 5,5 % et aides locales (plafond 90 % du devis pour très modestes).',
]

const PARCOURS = [
  {
    name: 'MaPrimeRénov’ Par geste',
    icon: Sparkles,
    headline: '1 ou 2 travaux ciblés',
    plafond: 'Jusqu’à 11 000 € (PAC géothermique très modeste)',
    quand:
      'Remplacement chauffage, isolation par poste (combles, murs, sols), VMC double flux, audit',
    avantage: 'Rapide (4-8 semaines versement). Pas d’accompagnateur obligatoire.',
    limite: 'Plafonné par geste. Pas cumulable avec Parcours accompagné sur même projet.',
  },
  {
    name: 'MaPrimeRénov’ Parcours accompagné',
    icon: Users,
    headline: 'Rénovation d’ampleur (gain ≥ 2 classes DPE)',
    plafond: 'Jusqu’à 70 000 € (90 000 € si sortie passoire F/G)',
    quand: 'Travaux groupés isolation + chauffage + ventilation visant gain énergétique massif',
    avantage: 'Bonus sortie passoire + bonus BBC. Aide jusqu’à 90 % pour très modestes.',
    limite: 'Mon Accompagnateur Rénov’ obligatoire. Audit énergétique préalable requis.',
  },
]

const PLAFONDS_IDF = [
  {
    foyer: '1 personne',
    bleu: '23 768 €',
    jaune: '28 933 €',
    violet: '40 404 €',
    rose: '> 40 404 €',
  },
  {
    foyer: '2 personnes',
    bleu: '34 884 €',
    jaune: '42 463 €',
    violet: '59 394 €',
    rose: '> 59 394 €',
  },
  {
    foyer: '3 personnes',
    bleu: '41 893 €',
    jaune: '51 000 €',
    violet: '71 060 €',
    rose: '> 71 060 €',
  },
  {
    foyer: '4 personnes',
    bleu: '48 914 €',
    jaune: '59 549 €',
    violet: '83 637 €',
    rose: '> 83 637 €',
  },
  {
    foyer: '5 personnes',
    bleu: '55 961 €',
    jaune: '68 123 €',
    violet: '95 758 €',
    rose: '> 95 758 €',
  },
]

const PLAFONDS_PROVINCE = [
  {
    foyer: '1 personne',
    bleu: '17 173 €',
    jaune: '22 015 €',
    violet: '30 844 €',
    rose: '> 30 844 €',
  },
  {
    foyer: '2 personnes',
    bleu: '25 115 €',
    jaune: '32 197 €',
    violet: '45 340 €',
    rose: '> 45 340 €',
  },
  {
    foyer: '3 personnes',
    bleu: '30 206 €',
    jaune: '38 719 €',
    violet: '54 592 €',
    rose: '> 54 592 €',
  },
  {
    foyer: '4 personnes',
    bleu: '35 285 €',
    jaune: '45 234 €',
    violet: '63 844 €',
    rose: '> 63 844 €',
  },
  {
    foyer: '5 personnes',
    bleu: '40 388 €',
    jaune: '51 775 €',
    violet: '73 098 €',
    rose: '> 73 098 €',
  },
]

const ETAPES = [
  {
    step: 'Identifier les travaux et le parcours',
    detail:
      'Estimer si un seul geste suffit (PAC, isolation toiture) ou si une rénovation d’ampleur est nécessaire (passoire F/G). Le simulateur officiel France Rénov’ aide à trancher.',
  },
  {
    step: 'Rendez-vous France Rénov’ (gratuit)',
    detail:
      'Conseiller France Rénov’ neutre et gratuit, par téléphone (0 808 800 700) ou en espace Conseil. Première analyse, orientation parcours, info aides locales.',
  },
  {
    step: 'Mon Accompagnateur Rénov’ (si Parcours accompagné)',
    detail:
      'Obligatoire pour > 5 000 € MPR. Liste agréée sur france-renov.gouv.fr. Coût 200-2 000 € (souvent intégré dans MPR). Pilote audit + devis + travaux.',
  },
  {
    step: 'Devis artisan RGE',
    detail:
      'Choisir un artisan portant la mention RGE valide à la date du devis. Devis détaillé indiquant performance équipements (Ucompo, R, COP, ETAS).',
  },
  {
    step: 'Création compte + dépôt MPR',
    detail:
      'Sur france-renov.gouv.fr, créer un compte avec FranceConnect, déposer le dossier en joignant devis + avis d’imposition. Notification décision sous 15 jours en moyenne.',
  },
  {
    step: 'Travaux + facture',
    detail:
      'Les travaux doivent commencer après la notification d’octroi (ou anticipation devis sous conditions). Délai max 2 ans pour transmettre la facture finale.',
  },
  {
    step: 'Versement de la prime',
    detail:
      'Téléversement facture + RIB sur le compte MPR. Versement sous 4-8 semaines. Possibilité d’avance pour ménages très modestes (jusqu’à 70 % du montant alloué).',
  },
]

const faqs = [
  {
    question: 'Qu’est-ce que MaPrimeRénov’ en 2026 ?',
    answer:
      'MaPrimeRénov’ est l’aide principale de l’État français pour financer la rénovation énergétique des logements, distribuée par l’Agence Nationale de l’Habitat (Anah) depuis 2020. Elle remplace l’ancien CITE (crédit d’impôt) et l’ancien Habiter Mieux Sérénité. En 2026, elle se décline en deux parcours : "Par geste" (jusqu’à 11 000 € pour un équipement) et "Parcours accompagné" (jusqu’à 70 000 € pour rénovation d’ampleur avec gain ≥ 2 classes DPE).',
  },
  {
    question: 'Qui peut bénéficier de MaPrimeRénov’ ?',
    answer:
      'Tous les propriétaires (occupants ou bailleurs) d’un logement de plus de 15 ans, occupé en résidence principale au moins 8 mois par an. Les copropriétés sont également éligibles via MaPrimeRénov’ Copropriété. Le montant dépend de 4 catégories de ressources (Bleu/Jaune/Violet/Rose) basées sur le revenu fiscal de référence et la composition du foyer. Aucune restriction d’âge ni de profession.',
  },
  {
    question: 'Quels travaux finance MaPrimeRénov’ ?',
    answer:
      'Pompes à chaleur (air-eau, géothermique, hybride), chaudières biomasse (granulés, bûches), chauffe-eau thermodynamiques, isolation (combles, murs, sols, ITE), VMC double flux, fenêtres double vitrage (uniquement Parcours accompagné), audit énergétique, systèmes solaires combinés. Les chaudières fioul et gaz ne sont plus éligibles depuis 2022.',
  },
  {
    question: 'Combien puis-je toucher en 2026 ?',
    answer:
      'Le montant dépend du type de travaux, du parcours et de la catégorie de revenus. Exemples 2026 : PAC air-eau Bleu = 5 000 €, Jaune = 4 000 €, Violet = 3 000 €. PAC géothermique Bleu = 11 000 €. Isolation combles 100 m² Bleu = 25 €/m² (2 500 €). Parcours accompagné rénovation globale Bleu = jusqu’à 90 % du devis (plafond 70 000 €, 90 000 € si sortie passoire).',
  },
  {
    question: 'Faut-il faire la demande avant ou après les travaux ?',
    answer:
      'Avant. La demande MaPrimeRénov’ doit être déposée AVANT signature du devis, ou au plus tard avant le démarrage des travaux. Une exception existe pour les équipements en panne irréparable (avec justificatif). Une demande déposée après facture est systématiquement refusée. Délai de notification : 15 jours en moyenne, jusqu’à 2 mois en pic d’activité.',
  },
  {
    question: 'MaPrimeRénov’ est-elle cumulable avec d’autres aides ?',
    answer:
      'Oui. Cumul possible avec CEE (Coup de pouce ou classique), éco-PTZ (jusqu’à 50 000 € sans intérêts), TVA 5,5 % (automatique avec artisan RGE), aides locales (région, département, agglo, commune). Plafond global : 90 % du devis pour très modestes, 75 % modestes, 60 % intermédiaires, 40 % supérieurs. La prime énergie CEE de l’artisan se déduit du devis avant calcul MPR.',
  },
  {
    question: 'Combien de temps pour recevoir l’argent ?',
    answer:
      'Après facture, le versement intervient sous 4-8 semaines en moyenne. En période de pic (octobre à mars), délais pouvant atteindre 12 semaines. Pour les ménages très modestes (Bleu), une avance jusqu’à 70 % du montant alloué peut être demandée avant les travaux. Les modestes (Jaune) peuvent demander une avance jusqu’à 50 %. Demande via la plateforme ou Mon Accompagnateur Rénov’.',
  },
  {
    question: 'Que faire en cas de refus MaPrimeRénov’ ?',
    answer:
      'Vérifier d’abord le motif (souvent : devis non conforme, mention RGE expirée, logement < 15 ans, revenus dépassant Rose). Possibilité de recours gracieux dans les 2 mois. Si refus définitif, options alternatives : CEE seul (pas de plafond ressources), éco-PTZ (sans condition), aides locales. Un accompagnateur France Rénov’ peut aider à monter un nouveau dossier.',
  },
]

const sources = [
  {
    label: 'France Rénov’ — MaPrimeRénov’ 2026',
    url: 'https://france-renov.gouv.fr/aides/maprimerenov',
  },
  { label: 'Anah — Site officiel MaPrimeRénov’', url: 'https://www.anah.gouv.fr' },
  {
    label: 'Service-Public.fr — MaPrimeRénov’',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F35083',
  },
  {
    label: 'Légifrance — Décret 2020-26 MaPrimeRénov’',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000041365413',
  },
  { label: 'ADEME — Guide aides 2026', url: 'https://librairie.ademe.fr' },
]

const relatedPages = [
  {
    label: 'MaPrimeRénov’ : montants par travaux',
    href: '/renovation-energetique/aides/maprimerenov-2026/montants',
    description: 'Barème détaillé PAC, isolation, chauffage 2026',
  },
  {
    label: 'MaPrimeRénov’ : éligibilité',
    href: '/renovation-energetique/aides/maprimerenov-2026/eligibilite',
    description: 'Conditions revenus, logement, travaux, artisan',
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
    label: 'Éco-PTZ',
    href: '/renovation-energetique/aides/eco-ptz-pret-zero',
    description: 'Prêt 0 % jusqu’à 50 000 € sur 20 ans',
  },
  {
    label: 'Simulateur aides MPR 2026',
    href: '/simulateur-aides-renovation',
    description: 'Calcul personnalisé instantané',
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
    section: 'MaPrimeRénov’ 2026',
    keywords: [
      'ma prime renov',
      'maprimerenov',
      'ma prime renov 2026',
      'maprimerenov 2026',
      'maprimerenov anah',
      'aide renovation maprimerenov',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Aides', url: '/renovation-energetique/aides' },
    { name: 'MaPrimeRénov’ 2026', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'MaPrimeRénov’ 2026 (Anah)',
    description:
      'Aide financière de l’État français versée par l’Agence Nationale de l’Habitat (Anah) pour la rénovation énergétique des logements de plus de 15 ans. 2 parcours : Par geste (jusqu’à 11 000 €) et Parcours accompagné (jusqu’à 70 000 €). 4 catégories de revenus.',
    url: PAGE_URL,
    serviceType: 'Subvention publique rénovation énergétique',
    audience: 'Propriétaires occupants, bailleurs, copropriétés',
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
              { label: 'MaPrimeRénov’ 2026' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Banknote className="w-3.5 h-3.5" aria-hidden />
              Anah — Barèmes 2026
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              MaPrimeRénov’ 2026 : barèmes, parcours et démarche
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              <strong>MaPrimeRénov’</strong> est l’aide principale de l’État pour la rénovation
              énergétique en 2026. Versée par l’Anah, elle se décline en deux parcours :{' '}
              <strong>Par geste</strong> (jusqu’à 11 000 € pour un équipement isolé) et{' '}
              <strong>Parcours accompagné</strong> (jusqu’à 70 000 € pour rénovation d’ampleur, 90
              000 € si sortie passoire F/G). Voici les barèmes officiels 2026, les conditions et la
              démarche complète.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="parcours">Les 2 parcours en 2026</h2>
            <div className="not-prose grid gap-4 my-6 md:grid-cols-2">
              {PARCOURS.map((p) => {
                const Icon = p.icon
                return (
                  <div key={p.name} className="bg-white border border-sand-200 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-700 grid place-items-center shrink-0">
                        <Icon className="w-5 h-5" aria-hidden />
                      </div>
                      <h3 className="font-heading text-lg font-semibold text-sand-900 m-0">
                        {p.name}
                      </h3>
                    </div>
                    <p className="text-xs font-medium text-primary-600 m-0 mb-3">{p.headline}</p>
                    <dl className="text-sm text-sand-700 space-y-2 m-0">
                      <div>
                        <dt className="font-semibold text-sand-900">Plafond</dt>
                        <dd className="m-0">{p.plafond}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-sand-900">Quand l’utiliser</dt>
                        <dd className="m-0">{p.quand}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-sand-900">Avantage</dt>
                        <dd className="m-0">{p.avantage}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-sand-900">Limite</dt>
                        <dd className="m-0">{p.limite}</dd>
                      </div>
                    </dl>
                  </div>
                )
              })}
            </div>

            <h2 id="categories-revenus">Les 4 catégories de revenus 2026</h2>
            <p>
              MaPrimeRénov’ classe les ménages en 4 catégories selon le <strong>RFR</strong> (Revenu
              Fiscal de Référence, ligne 25 de l’avis d’imposition) et le nombre de personnes du
              foyer. Plafonds différents Île-de-France vs autres régions.
            </p>

            <h3>Île-de-France</h3>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Foyer</th>
                    <th className="p-3 border-b border-sand-200">
                      <MprBaremeChip categorie="bleu" suffix="très modeste" />
                    </th>
                    <th className="p-3 border-b border-sand-200">
                      <MprBaremeChip categorie="jaune" suffix="modeste" />
                    </th>
                    <th className="p-3 border-b border-sand-200">
                      <MprBaremeChip categorie="violet" suffix="intermédiaire" />
                    </th>
                    <th className="p-3 border-b border-sand-200">
                      <MprBaremeChip categorie="rose" suffix="supérieur" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PLAFONDS_IDF.map((row) => (
                    <tr key={row.foyer} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{row.foyer}</td>
                      <td className="p-3">{row.bleu}</td>
                      <td className="p-3">{row.jaune}</td>
                      <td className="p-3">{row.violet}</td>
                      <td className="p-3">{row.rose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3>Hors Île-de-France</h3>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Foyer</th>
                    <th className="p-3 border-b border-sand-200">
                      <MprBaremeChip categorie="bleu" />
                    </th>
                    <th className="p-3 border-b border-sand-200">
                      <MprBaremeChip categorie="jaune" />
                    </th>
                    <th className="p-3 border-b border-sand-200">
                      <MprBaremeChip categorie="violet" />
                    </th>
                    <th className="p-3 border-b border-sand-200">
                      <MprBaremeChip categorie="rose" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PLAFONDS_PROVINCE.map((row) => (
                    <tr key={row.foyer} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{row.foyer}</td>
                      <td className="p-3">{row.bleu}</td>
                      <td className="p-3">{row.jaune}</td>
                      <td className="p-3">{row.violet}</td>
                      <td className="p-3">{row.rose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-sand-500">
              Source : barèmes Anah 2026 (Île-de-France majorée de ~28 % pour tenir compte du coût
              de la vie). Au-delà de 5 personnes : ajouter 7 037 € (IDF) ou 5 422 € (province) par
              personne supplémentaire.
            </p>

            <h2 id="demarche">Démarche en 7 étapes</h2>
            <div className="not-prose my-6">
              <ol className="space-y-3 list-none m-0 p-0">
                {ETAPES.map((s, i) => (
                  <li
                    key={s.step}
                    className="bg-white border border-sand-200 rounded-xl p-4 flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-700 text-white grid place-items-center shrink-0 font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-sand-900 m-0">{s.step}</p>
                      <p className="text-sm text-sand-700 mt-1 mb-0">{s.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Estimer votre MaPrimeRénov’ 2026
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Calcul instantané basé sur barèmes officiels Anah 2026 selon revenus, foyer,
                    travaux et zone géographique. Mise en relation avec un Mon Accompagnateur Rénov’
                    si rénovation d’ampleur.
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

            <h2 id="bonus">Bonus 2026 à connaître</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Bonus sortie passoire</strong> : +500 à +1 500 € si le projet fait sortir le
                logement de la classe F ou G (DPE).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Bonus BBC</strong> : +500 à +1 500 € si le projet atteint la classe A ou B
                après travaux.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Forfait audit énergétique</strong> : 300-500 € pris en charge si l’audit est
                préalable au projet.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Avance ménages modestes</strong> : jusqu’à 70 % de la prime versée avant
                travaux pour les Bleu, 50 % pour les Jaune.
              </li>
            </ul>

            <div className="not-prose flex items-start gap-3 border border-amber-200 bg-amber-50 rounded-lg p-4 my-6">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">Anti-arnaque MaPrimeRénov’</p>
                <p className="m-0">
                  Démarchage téléphonique <strong>interdit</strong> depuis juillet 2020 pour la
                  rénovation énergétique. Aucun organisme ne sollicite par téléphone non sollicité.
                  Ne signez jamais le jour-même. France Rénov’ et l’Anah sont les{' '}
                  <strong>seules</strong> sources officielles. Méfiez-vous des sites en .com qui
                  imitent france-renov.gouv.fr.
                </p>
              </div>
            </div>
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
              href="/rge/renovation-energetique"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Artisans RGE rénovation <Landmark className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>

          <p className="sr-only">
            <Coins className="inline" aria-hidden /> Page mise à jour selon barèmes officiels Anah
            2026 et France Rénov’.
          </p>
        </div>
      </div>
    </>
  )
}
