/**
 * Page : /renovation-energetique/diagnostic/dpe
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "dpe"                          → 93 963 vol, KD 55, CPC $0,70 ⭐⭐⭐⭐⭐ MEGA JACKPOT
 * - "dpe location"                 → 6 798 vol, KD 2, CPC $0,45 ⭐⭐⭐⭐ EASY WIN
 * - "dpe immobilier"               → 1 585 vol, KD 40
 * - "diagnostic de performance energetique" → 150 vol, KD 49
 * - "dpe maison"                   → longue traîne KD bas
 * - "dpe vente"                    → longue traîne
 * - Famille cumulée pivot : ~105 000 vol/mois
 *
 * Source : audit Ahrefs API live (cf docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md)
 * Easy win : OUI MAJEUR sur "dpe location" (KD 2, vol 6 798) — à exploiter en priorité
 *            "dpe" KD 55 (haute concurrence) mais volume massif justifie tentative
 *            Stratégie : E-E-A-T fort + sources officielles + section H2 dédiée location
 * Cluster pillar : Rénovation Énergétique → Diagnostic → DPE
 *
 * Anti-cannibalisation :
 *   - Hub /diagnostic/ = panorama 3 diagnostics
 *   - Cette page = focus DPE (méthode, classes, validité, opposabilité, location interdite)
 *   - Sub /audit-energetique/ = focus audit (distinct, post-DPE)
 *   - /passoires-thermiques/ = focus loi location passoire (lien fort)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  Coins,
  ShieldCheck,
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

const PAGE_PATH = '/renovation-energetique/diagnostic/dpe'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'claire-dubois'
const AUTHOR_NAME = 'Claire Dubois'

const TITLE = 'DPE 2026 : note A-G, prix, validité'
const DESCRIPTION =
  'DPE 2026 : note A à G, prix 100-250 €, validité 10 ans, méthode 3CL-2021 opposable. Obligations vente/location, classes F/G interdites.'

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
  'DPE = Diagnostic de Performance Énergétique : note A à G obligatoire pour vente/location.',
  'Classes : A (≤ 70 kWh/m²/an) à G (> 420 kWh/m²/an). F et G = passoires thermiques.',
  'Prix 2026 : 100-250 € TTC. Validité 10 ans depuis 1er juillet 2021.',
  'Méthode unique 3CL-2021 (3 Conventions Calcul) — opposable juridiquement.',
  'Location interdite : G depuis 2025, F en 2028, E en 2034 (loi Climat 2021).',
  'Vente : audit énergétique obligatoire en plus si maison classée F, G ou E (depuis 2025).',
]

const CLASSES_DPE = [
  {
    classe: 'A',
    conso: '≤ 70 kWh/m²/an',
    ges: '≤ 6 kg CO2',
    statut: 'Excellent',
    color: 'bg-green-50',
  },
  { classe: 'B', conso: '71-110', ges: '7-11', statut: 'Très bon', color: 'bg-green-50' },
  { classe: 'C', conso: '111-180', ges: '12-30', statut: 'Bon', color: 'bg-green-50' },
  { classe: 'D', conso: '181-250', ges: '31-50', statut: 'Acceptable', color: 'bg-yellow-50' },
  {
    classe: 'E',
    conso: '251-330',
    ges: '51-70',
    statut: 'Médiocre — interdit location 2034',
    color: 'bg-orange-50',
  },
  {
    classe: 'F',
    conso: '331-420',
    ges: '71-100',
    statut: 'Passoire — interdit location 2028',
    color: 'bg-amber-50',
  },
  {
    classe: 'G',
    conso: '> 420',
    ges: '> 100',
    statut: 'Passoire — INTERDIT location depuis 2025',
    color: 'bg-red-50',
  },
]

const OBLIGATIONS = [
  {
    cas: 'Vente d’un logement',
    obligation:
      'DPE obligatoire annexé au compromis de vente. Audit énergétique en plus si maison F, G ou E (depuis 2025).',
  },
  {
    cas: 'Location d’un logement',
    obligation:
      'DPE obligatoire annexé au bail. G interdit depuis 2025, F en 2028, E en 2034 (résidence principale).',
  },
  {
    cas: 'Construction neuve',
    obligation:
      'DPE obligatoire à la livraison du bâtiment (étiquettes énergie + GES sur étiquette).',
  },
  {
    cas: 'Travaux importants (> 25 % surface)',
    obligation:
      'Nouveau DPE recommandé (pas obligatoire si déjà valide) pour attester des nouvelles performances.',
  },
  {
    cas: 'Annonce immobilière (vente ou location)',
    obligation:
      'Note DPE et étiquette GES obligatoires dans toute annonce immobilière (papier ou web). Mention "logement consommant beaucoup d’énergie" pour F/G.',
  },
]

const ETAPES = [
  {
    step: 'Choisir un diagnostiqueur certifié',
    detail:
      'Annuaire officiel sur diagnostiqueurs.application.developpement-durable.gouv.fr. Vérifier la certification COFRAC valide à la date du DPE. Exiger l’attestation d’assurance professionnelle.',
  },
  {
    step: 'Visite sur place (1-2 h)',
    detail:
      'Le diagnostiqueur relève : surface habitable, isolation (toit, murs, planchers, fenêtres), équipements chauffage et ECS, ventilation, exposition. Photos justificatives obligatoires.',
  },
  {
    step: 'Calcul méthode 3CL-2021',
    detail:
      'Méthode officielle unifiée depuis le 1er juillet 2021. Calcul de la consommation primaire (kWh/m²/an) et des émissions GES (kg CO2/m²/an). La pire des 2 notes détermine la classe.',
  },
  {
    step: 'Émission du rapport',
    detail:
      'PDF officiel avec : note A-G, étiquette énergie + GES, recommandations travaux chiffrées, données techniques. Numéro ADEME unique enregistré sur observatoire-dpe-audit.ademe.fr.',
  },
]

const faqs = [
  {
    question: 'Qu’est-ce que le DPE en 2026 ?',
    answer:
      'Le DPE (Diagnostic de Performance Énergétique) est un document officiel attribuant une note A à G à un logement selon sa consommation d’énergie primaire (kWh/m²/an) et ses émissions de gaz à effet de serre (kg CO2/m²/an). Obligatoire pour toute vente ou location depuis 2007. Réformé le 1er juillet 2021 (méthode unique 3CL-2021, opposable juridiquement). Validité 10 ans.',
  },
  {
    question: 'Combien coûte un DPE en 2026 ?',
    answer:
      'Prix 2026 : 100-250 € TTC selon la surface du logement et la zone géographique. Studio/T2 : 100-150 €. T3/T4 : 130-200 €. Maison : 180-280 €. Prix libres, comparer 2-3 devis. Le DPE est à la charge du propriétaire vendeur ou bailleur. Pas de DPE gratuit (méfiance envers les "DPE offerts" : souvent associés à du démarchage rénovation énergétique).',
  },
  {
    question: 'DPE et location : qu’est-ce qui change en 2026 ?',
    answer:
      'Depuis le 1er janvier 2025, les logements classés G ne peuvent plus être proposés à la location en résidence principale (interdiction concerne nouveaux baux et renouvellements). À partir du 1er janvier 2028, l’interdiction s’étendra aux logements F. En 2034, ce sera le tour des E. Concrètement, en 2026 : si vous louez un logement G, le locataire peut exiger des travaux ou faire baisser le loyer judiciairement.',
  },
  {
    question: 'Combien de temps un DPE est-il valable ?',
    answer:
      '10 ans pour les DPE réalisés depuis le 1er juillet 2021 (méthode 3CL-2021 stable). DPE réalisés AVANT le 1er juillet 2021 : invalides depuis le 1er janvier 2025 (à refaire). Si vous faites des travaux importants modifiant la performance (isolation toiture, changement chauffage), il est conseillé de refaire un DPE pour attester des nouvelles performances et bénéficier d’une meilleure note pour la vente/location.',
  },
  {
    question: 'Le DPE est-il fiable depuis la réforme de 2021 ?',
    answer:
      'Oui. Réforme du 1er juillet 2021 : méthode 3CL-2021 unifiée (avant : 2 méthodes selon ancienneté), DPE devenu opposable juridiquement (le diagnostiqueur engage sa responsabilité), prise en compte de l’usage réel et des occupants. Quelques bugs initiaux (notamment maisons construites avant 1948) corrigés par arrêté du 31 mars 2024. Les DPE depuis 2024 sont fiables et tiennent leurs 10 ans.',
  },
  {
    question: 'Que faire si mon DPE est mauvais (F ou G) ?',
    answer:
      'Plusieurs leviers selon votre profil. Propriétaire bailleur : urgence avant 2028 (interdiction location F), 4 leviers : (1) MaPrimeRénov’ Parcours accompagné jusqu’à 70 000 €, (2) audit énergétique pour identifier travaux prioritaires, (3) rénovation par geste si budget limité, (4) vente avec décote acceptée. Propriétaire occupant : pas d’urgence légale mais inconfort thermique + factures élevées. Voir notre guide "passoire thermique".',
  },
  {
    question: 'Comment contester un DPE jugé erroné ?',
    answer:
      'Le DPE est opposable depuis 2021 : recours possible si le diagnostiqueur a commis une erreur ou méconnu un élément. Démarche : (1) demander rectification au diagnostiqueur (lettre RAR), (2) si refus, médiation par la chambre de commerce, (3) recours juridictionnel devant le tribunal civil. Sanctions possibles : annulation du DPE, dommages-intérêts, retrait de certification du diagnostiqueur. Délai recours 5 ans.',
  },
  {
    question: 'Le DPE est-il obligatoire pour une copropriété ?',
    answer:
      'Oui, deux DPE distincts : (1) DPE individuel pour chaque appartement (obligatoire pour vente/location), (2) DPE collectif obligatoire pour les copropriétés > 50 lots construites avant 2013 depuis 2024, étendu à toutes les copropriétés > 200 lots en 2025, > 50 lots en 2026, toutes en 2028. Le DPE collectif analyse les parties communes (toiture, chaufferie, façades) et peut compléter ou remplacer les DPE individuels selon configuration.',
  },
]

const sources = [
  {
    label: 'Service-Public.fr — DPE',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F16096',
  },
  { label: 'ADEME — Méthode 3CL-2021', url: 'https://www.ademe.fr' },
  { label: 'Observatoire DPE-Audit ADEME', url: 'https://observatoire-dpe-audit.ademe.fr' },
  { label: 'Légifrance — Décret 2020-1610 DPE opposable', url: 'https://www.legifrance.gouv.fr' },
  {
    label: 'Annuaire diagnostiqueurs certifiés',
    url: 'https://diagnostiqueurs.application.developpement-durable.gouv.fr',
  },
]

const relatedPages = [
  {
    label: 'Hub Diagnostic énergétique',
    href: '/renovation-energetique/diagnostic',
    description: 'DPE + audit + thermographie comparés',
  },
  {
    label: 'DPE prix 2026 : 100-250 € + pack DDT',
    href: '/renovation-energetique/diagnostic/dpe/prix',
    description: 'Grille par surface + comparaison pack DDT',
  },
  {
    label: 'DPE location : obligations bailleur 2026',
    href: '/renovation-energetique/diagnostic/dpe/location',
    description: 'Calendrier interdiction G 2025 / F 2028 / E 2034',
  },
  {
    label: 'Validité DPE 2026 : durée 10 ans, renouvellement',
    href: '/renovation-energetique/diagnostic/dpe/validite',
    description: 'DPE pré-2021 caducs depuis 2025 + correction 2024 maisons < 1948',
  },
  {
    label: 'Classes DPE A à G : seuils, GES, travaux',
    href: '/renovation-energetique/diagnostic/dpe/classes',
    description: 'Méthode 3CL-2021 + facture par classe + sauts E→C, F→C',
  },
  {
    label: 'DPE classe G : sortir de la passoire',
    href: '/renovation-energetique/diagnostic/dpe/classes/g',
    description: 'Seuils, audit obligatoire vente, 5 sauts G→F/E/D/C/B chiffrés',
  },
  {
    label: 'Audit énergétique 2026',
    href: '/renovation-energetique/diagnostic/audit-energetique',
    description: 'Obligatoire vente F/G/E et MPR',
  },
  {
    label: 'Passoire thermique F/G',
    href: '/renovation-energetique/passoires-thermiques',
    description: 'Calendrier interdiction location 2025-2034',
  },
  {
    label: 'Sortir d’une passoire thermique',
    href: '/renovation-energetique/aides/maprimerenov-2026/parcours-accompagne',
    description: 'Parcours accompagné jusqu’à 90 000 €',
  },
  {
    label: 'Travaux rénovation énergétique',
    href: '/renovation-energetique/travaux',
    description: '4 clusters travaux + ordre logique',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'MPR + CEE + éco-PTZ',
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
    section: 'DPE',
    keywords: [
      'dpe',
      'dpe location',
      'dpe immobilier',
      'diagnostic de performance energetique',
      'dpe maison',
      'dpe vente',
      'dpe 2026',
      'classe dpe',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Diagnostic', url: '/renovation-energetique/diagnostic' },
    { name: 'DPE', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'Diagnostic de Performance Énergétique (DPE) 2026',
    description:
      'Diagnostic officiel français obligatoire pour la vente et la location de tout logement, attribuant une note A à G selon la consommation d’énergie primaire et les émissions de gaz à effet de serre. Méthode unique 3CL-2021, opposable juridiquement, validité 10 ans.',
    url: PAGE_URL,
    serviceType: 'Diagnostic réglementaire immobilier',
    audience: 'Propriétaires vendeurs, bailleurs, copropriétés',
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
              { label: 'Diagnostic', href: '/renovation-energetique/diagnostic' },
              { label: 'DPE' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <ClipboardCheck className="w-3.5 h-3.5" aria-hidden />
              Méthode 3CL-2021 — Opposable juridiquement
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              DPE 2026 : note A-G, prix, validité, obligations
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Le <strong>DPE</strong> (Diagnostic de Performance Énergétique) attribue une note de A
              à G à un logement selon sa consommation d’énergie primaire et ses émissions de gaz à
              effet de serre. Obligatoire pour toute <strong>vente ou location</strong>, il est{' '}
              <strong>opposable juridiquement</strong> depuis 2021. Prix 2026 :{' '}
              <strong>100 à 250 € TTC</strong>, validité 10 ans. Les classes F et G (passoires
              thermiques) sont progressivement interdites à la location entre 2025 et 2034.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="classes-dpe">Les 7 classes DPE 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Classe</th>
                    <th className="p-3 border-b border-sand-200">Conso primaire</th>
                    <th className="p-3 border-b border-sand-200">Émissions GES</th>
                    <th className="p-3 border-b border-sand-200">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {CLASSES_DPE.map((c) => (
                    <tr
                      key={c.classe}
                      className={`border-b border-sand-100 last:border-0 ${c.color}`}
                    >
                      <td className="p-3 font-bold text-sand-900">{c.classe}</td>
                      <td className="p-3">{c.conso}</td>
                      <td className="p-3">{c.ges}</td>
                      <td className="p-3 text-xs">{c.statut}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-sand-500">
              Source : arrêté du 31 mars 2021 méthode 3CL-2021. La classe finale = la PIRE des 2
              notes (énergie ou GES). Un logement peut être classé F énergie / D GES → classe F.
            </p>

            <h2 id="dpe-location">DPE et location : ce qui change en 2026</h2>
            <p>
              Depuis la <strong>loi Climat et Résilience 2021</strong>, le DPE conditionne la
              possibilité de louer un logement en résidence principale :
            </p>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Depuis le 1er janvier 2025</strong> : interdiction location DPE G (~600 000
                logements concernés).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Depuis août 2022</strong> : gel des loyers pour les passoires F et G.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>1er janvier 2028</strong> : interdiction location DPE F (~1,8 million
                logements supplémentaires).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>1er janvier 2034</strong> : interdiction location DPE E (~7 millions
                logements cumulés).
              </li>
            </ul>
            <p>
              Pour les bailleurs, l’urgence est claire :{' '}
              <Link href="/renovation-energetique/passoires-thermiques">
                rénover les passoires F/G
              </Link>{' '}
              avant les échéances ou accepter une décote à la revente. MaPrimeRénov’ Parcours
              accompagné finance jusqu’à 70 000 € (90 000 € avec bonus passoire + BBC) pour les très
              modestes.
            </p>

            <h2 id="obligations">DPE obligatoire dans 5 cas</h2>
            <div className="not-prose grid gap-3 my-6">
              {OBLIGATIONS.map((o) => (
                <div key={o.cas} className="bg-white border border-sand-200 rounded-xl p-4">
                  <p className="font-semibold text-sand-900 m-0 mb-1">→ {o.cas}</p>
                  <p className="text-sm text-sand-700 m-0">{o.obligation}</p>
                </div>
              ))}
            </div>

            <h2 id="prix">Prix DPE 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Type de logement</th>
                    <th className="p-3 border-b border-sand-200">Prix moyen 2026</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-medium">Studio / T2 (≤ 50 m²)</td>
                    <td className="p-3 text-primary-700 font-semibold">100-150 €</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-medium">T3 / T4 (50-100 m²)</td>
                    <td className="p-3 text-primary-700 font-semibold">130-200 €</td>
                  </tr>
                  <tr className="border-b border-sand-100">
                    <td className="p-3 font-medium">Maison 100-150 m²</td>
                    <td className="p-3 text-primary-700 font-semibold">180-280 €</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Maison &gt; 200 m² ou complexe</td>
                    <td className="p-3 text-primary-700 font-semibold">250-400 €</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-sand-500">
              Prix libres, comparer 2-3 devis. À la charge du vendeur (vente) ou bailleur
              (location). Pas de prise en charge MPR/CEE pour le DPE seul (mais inclus dans certains
              forfaits audit).
            </p>

            <h2 id="etapes">Comment se passe un DPE</h2>
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
                    DPE F ou G ? Estimer votre rénovation et aides
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Calcul instantané MPR + CEE + éco-PTZ pour sortir de classe F/G. Mise en
                    relation avec un Mon Accompagnateur Rénov’ si Parcours accompagné.
                  </p>
                  <Link
                    href="/simulateur-aides-renovation"
                    className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                  >
                    Lancer le simulateur <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>

            <div className="not-prose flex items-start gap-3 border border-amber-200 bg-amber-50 rounded-lg p-4 my-6">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">DPE gratuit = piège démarchage</p>
                <p className="m-0">
                  Méfiance maximale envers les "DPE offerts" : ils sont quasi systématiquement
                  associés à du démarchage rénovation énergétique (illégal depuis juillet 2020) ou à
                  des artisans peu scrupuleux. Un DPE coûte 100-250 €. Choisir un diagnostiqueur
                  certifié et indépendant via{' '}
                  <a
                    href="https://diagnostiqueurs.application.developpement-durable.gouv.fr"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    l’annuaire officiel
                  </a>
                  .
                </p>
              </div>
            </div>

            <h2 id="opposabilite">DPE opposable : que ça change</h2>
            <p>
              <ShieldCheck className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
              Depuis le 1er juillet 2021, le DPE est <strong>opposable juridiquement</strong> au
              vendeur ou bailleur. Concrètement : si l’acheteur ou locataire constate que la
              consommation réelle est très supérieure à celle indiquée dans le DPE, il peut se
              retourner contre le vendeur/bailleur ET contre le diagnostiqueur. Sanctions possibles
              : annulation de la vente, baisse du prix, dommages-intérêts. C’est un changement
              majeur : le DPE n’est plus une simple information mais un engagement juridique.
              Conséquence : choisir un diagnostiqueur sérieux et expérimenté.
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
              href="/renovation-energetique/diagnostic"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Diagnostic
            </Link>
            <Link
              href="/renovation-energetique/passoires-thermiques"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Passoires thermiques <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
