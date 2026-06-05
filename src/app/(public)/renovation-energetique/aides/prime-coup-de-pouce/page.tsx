/**
 * Page : /renovation-energetique/aides/prime-coup-de-pouce
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "prime coup de pouce"          → 951 vol, KD 47, CPC $1,00, clicks 1 348 ⭐
 * - "coup de pouce chauffage"      → 1 061 vol, KD 33, CPC $1,80 ⭐⭐ EASY-WIN-MOYEN
 * - "coup de pouce isolation"      → 91 vol, KD 30, CPC $1,50
 * - "coup de pouce renovation"     → longue traîne
 * - Famille cumulée pivot : ~2 200 vol/mois (KD 30-47, intent transactionnel élevé)
 *
 * Source : audit Ahrefs API live (cf docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md)
 * Easy win : OUI sur "coup de pouce chauffage" (KD 33, vol 1061, CPC $1,80)
 *            Et "coup de pouce isolation" (KD 30, vol 91)
 *            Convergence intent transactionnel + montant élevé prime
 * Cluster pillar : Rénovation Énergétique → Aides → Prime Coup de Pouce
 *
 * Anti-cannibalisation :
 *   - Page parente /aides/cee/ = HUB CEE complet (mécanisme général)
 *   - Cette page = focus Coup de pouce (montants détaillés, conditions, cumul)
 *   - Distinct du CEE classique (montants forfaitaires plus élevés)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  Coins,
  Flame,
  PiggyBank,
  ShieldCheck,
  Sparkles,
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

const PAGE_PATH = '/renovation-energetique/aides/prime-coup-de-pouce'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'claire-dubois'
const AUTHOR_NAME = 'Claire Dubois'

const TITLE = 'Prime Coup de Pouce 2026 : chauffage'
const DESCRIPTION =
  'Coup de Pouce CEE 2026 : primes bonifiées chauffage et isolation, partenaires obligataires, montants exacts, cumul MaPrimeRénov + démarche.'

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
  'Coup de Pouce = bonification CEE pour travaux prioritaires (chauffage EnR, isolation grande échelle).',
  'Coup de Pouce Chauffage : 2 500-5 000 € PAC standard, 4 000-7 000 € PAC modeste, 4 000-7 000 € biomasse.',
  'Coup de Pouce Isolation : 10-20 €/m² combles, 15-25 €/m² ITE, 20-30 €/m² plancher bas.',
  'Cumul possible MaPrimeRénov’ + éco-PTZ + TVA 5,5 %.',
  'Versée par l’artisan (déduction devis) ou l’énergéticien (chèque, virement).',
  'Démarchage téléphonique INTERDIT depuis juillet 2020 — méfiez-vous des offres "isolation à 1 €".',
]

const COUP_POUCE_CHAUFFAGE = [
  {
    travail: 'PAC air-eau (remplace fioul/gaz/charbon)',
    standard: '2 500 €',
    modeste: '4 000 €',
    code: 'BAR-TH-159',
  },
  {
    travail: 'PAC géothermique (remplace fioul/gaz/charbon)',
    standard: '5 000 €',
    modeste: '7 000 €',
    code: 'BAR-TH-159',
  },
  {
    travail: 'Chaudière biomasse granulés',
    standard: '4 000 €',
    modeste: '5 000 €',
    code: 'BAR-TH-113',
  },
  {
    travail: 'Chaudière biomasse bûches',
    standard: '3 500 €',
    modeste: '4 500 €',
    code: 'BAR-TH-113',
  },
  {
    travail: 'Système solaire combiné (SSC)',
    standard: '4 000 €',
    modeste: '5 500 €',
    code: 'BAR-TH-143',
  },
  {
    travail: 'Raccordement réseau de chaleur',
    standard: '450 €',
    modeste: '700 €',
    code: 'BAR-TH-127',
  },
]

const COUP_POUCE_ISOLATION = [
  {
    travail: 'Combles perdus (soufflage)',
    standard: '10 €/m²',
    modeste: '20 €/m²',
    code: 'BAR-EN-101',
  },
  {
    travail: 'Combles aménagés (rampants)',
    standard: '12 €/m²',
    modeste: '22 €/m²',
    code: 'BAR-EN-101',
  },
  {
    travail: 'Plancher bas (sur cave, garage, vide sanitaire)',
    standard: '20 €/m²',
    modeste: '30 €/m²',
    code: 'BAR-EN-103',
  },
  {
    travail: 'Murs ITE (par l’extérieur)',
    standard: '15 €/m²',
    modeste: '25 €/m²',
    code: 'BAR-EN-102',
  },
  {
    travail: 'Murs ITI (par l’intérieur)',
    standard: '10 €/m²',
    modeste: '15 €/m²',
    code: 'BAR-EN-104',
  },
]

const COUP_POUCE_GLOBAL = [
  {
    operation: 'Rénovation d’ampleur (gain ≥ 35 %)',
    standard: '350 €/MWh économisé',
    modeste: '500 €/MWh économisé',
    code: 'BAR-TH-145',
    detail: 'Bonification cumulable avec MaPrimeRénov’ Parcours accompagné',
  },
  {
    operation: 'Rénovation performante de copropriété',
    standard: '250 €/MWh économisé',
    modeste: '400 €/MWh économisé',
    code: 'BAR-TH-145',
    detail: 'Pour les parties communes, gain énergétique ≥ 35 %',
  },
]

const ETAPES = [
  {
    step: 'Identifier l’éligibilité Coup de pouce',
    detail:
      'Vérifier que vos travaux sont sur la liste Coup de pouce (PAC, biomasse, isolation grande échelle). Les CEE classiques s’appliquent aux autres travaux.',
  },
  {
    step: 'Comparer les offres Coup de pouce',
    detail:
      'Demander 2-3 offres : (1) artisans partenaires d’un obligé (TotalEnergies, EDF, Engie), (2) énergéticien direct, (3) mandataire CEE. Comparer le montant net.',
  },
  {
    step: 'Accepter l’offre AVANT signature devis',
    detail:
      'Le rôle actif et incitatif (RAI) de l’obligé doit précéder le devis. Pas d’acceptation rétroactive (sauf cas de fraude prouvée).',
  },
  {
    step: 'Signature devis avec mention Coup de pouce',
    detail:
      'Le devis doit mentionner explicitement la prime Coup de pouce et son montant. Si déduite du devis : ligne distincte. Si versée à part : avenant signé.',
  },
  {
    step: 'Travaux par artisan RGE',
    detail:
      'Travaux conformes aux fiches techniques CEE (BAR-TH-159 pour PAC, BAR-EN-101 pour combles…). Performance équipements respectant les seuils ETAS, R, COP.',
  },
  {
    step: 'Versement de la prime',
    detail:
      'Sous 2-6 semaines après facture acquittée. Soit déduction immédiate du devis, soit chèque/virement de l’énergéticien.',
  },
]

const faqs = [
  {
    question: 'Qu’est-ce que la Prime Coup de Pouce exactement ?',
    answer:
      'La Prime Coup de Pouce est une bonification du dispositif CEE (Certificats d’Économie d’Énergie) ciblée sur les travaux prioritaires : remplacement de chauffage fioul/gaz/charbon par une énergie renouvelable (PAC, biomasse), isolation à grande échelle (combles, planchers, ITE), rénovation d’ampleur. Les montants sont forfaitaires (2 500-7 000 € selon travaux et revenus) au lieu du calcul kWh cumac classique du CEE.',
  },
  {
    question: 'Quels sont les montants Coup de Pouce 2026 ?',
    answer:
      'Coup de Pouce Chauffage : PAC air-eau 2 500 € (standard) à 4 000 € (modeste), PAC géothermique 5 000 € (standard) à 7 000 € (modeste), chaudière biomasse granulés 4 000-5 000 €. Coup de Pouce Isolation : combles 10-20 €/m², ITE 15-25 €/m², plancher bas 20-30 €/m². Coup de Pouce Rénovation d’ampleur : 350-500 €/MWh économisé annuellement.',
  },
  {
    question: 'Qui est éligible à la Prime Coup de Pouce ?',
    answer:
      'Tous les particuliers propriétaires occupants ou bailleurs (sans condition de ressources pour les versions standard). Les ménages modestes et très modestes (selon plafonds Anah) bénéficient de montants bonifiés (multipliés par 1,5 à 2). Les copropriétés sont éligibles à un Coup de Pouce dédié (parties communes). Justificatif de revenus à fournir pour la version bonifiée (avis d’imposition).',
  },
  {
    question: 'Cumulable avec MaPrimeRénov’ ?',
    answer:
      'Oui, totalement cumulable. La prime Coup de Pouce se déduit du devis, le reste constitue la base de calcul MPR. Cumul typique : devis 14 000 € (PAC air-eau) - Coup de pouce 4 000 € - MPR 4 000 € = reste 6 000 € (TVA 5,5 % comprise). Avec éco-PTZ : 0 € à charge immédiate, mensualité 25 €/mois sur 20 ans à 0 %.',
  },
  {
    question: 'Quelles conditions pour le Coup de Pouce Chauffage PAC ?',
    answer:
      'Conditions : (1) remplacement d’une chaudière au fioul, gaz ou charbon (pas de remplacement d’une PAC existante), (2) PAC air-eau, géothermique ou hybride conforme aux critères techniques (ETAS ≥ 126 % moyenne température, COP saisonnier ≥ 3,4), (3) artisan RGE QualiPAC ou Qualibat, (4) acceptation de l’offre AVANT signature du devis. PAC air-air NON éligible.',
  },
  {
    question: 'Et le Coup de Pouce Isolation ?',
    answer:
      'Conditions : (1) résistance thermique R ≥ 7 m².K/W pour les combles, R ≥ 3,7 pour les murs, R ≥ 3 pour les planchers bas, (2) artisan RGE Qualibat (mention 7131 isolation combles, 5911 ITE), (3) acceptation de l’offre AVANT devis, (4) maison ou appartement, sans condition d’ancienneté pour les CEE. Surface minimale isolée : 12 m². Bonification ménages modestes : montants au m² doublés pour combles et plancher bas.',
  },
  {
    question: 'Comment éviter les arnaques "isolation à 1 €" ?',
    answer:
      'Les offres "isolation à 1 €" ont été interdites en 2021 après scandales massifs (matériaux non conformes, pose bâclée, pas d’audit). Aujourd’hui, l’isolation des combles avec Coup de pouce + MPR coûte typiquement 800-2 000 € pour 100 m² (ménage modeste), soit ~10-20 €/m². Méfiez-vous de toute offre &lt; 5 €/m². Démarchage téléphonique interdit depuis 2020 : aucun artisan sérieux ne vous appelle sans démarche initiale de votre part.',
  },
  {
    question: 'Le Coup de Pouce Rénovation d’ampleur, c’est quoi ?',
    answer:
      'Bonification CEE dédiée aux projets de rénovation globale visant un gain énergétique ≥ 35 % (validé par audit). Montant : 350-500 € par MWh économisé annuellement (selon revenus). Pour un projet économisant 8 MWh/an, prime = 2 800 € (standard) ou 4 000 € (modeste). Cumulable avec MaPrimeRénov’ Parcours accompagné. Très avantageux pour rénovations passoires F/G qui visent classe C ou mieux.',
  },
]

const sources = [
  {
    label: 'Ministère Transition Écologique — Coup de pouce',
    url: 'https://www.ecologie.gouv.fr/coup-pouce-chauffage',
  },
  {
    label: 'France Rénov’ — Prime Coup de pouce',
    url: 'https://france-renov.gouv.fr/aides/coup-de-pouce-economies-denergie',
  },
  {
    label: 'ADEME — Fiches Coup de pouce',
    url: 'https://www.economie.gouv.fr/dgec/cee-fiches-operations-standardisees',
  },
  {
    label: 'Service-Public.fr — Coup de pouce chauffage',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F35643',
  },
  {
    label: 'DGCCRF — Anti-arnaque rénovation énergétique',
    url: 'https://www.economie.gouv.fr/dgccrf/renovation-energetique-attention-aux-arnaques',
  },
]

const relatedPages = [
  {
    label: 'CEE — Hub complet',
    href: '/renovation-energetique/aides/cee-certificats-economie-energie',
    description: 'Mécanisme CEE classique + Coup de pouce',
  },
  {
    label: 'MaPrimeRénov’ 2026',
    href: '/renovation-energetique/aides/maprimerenov-2026',
    description: 'Subvention principale Anah cumulable',
  },
  {
    label: 'Éco-PTZ : prêt 0 %',
    href: '/renovation-energetique/aides/eco-ptz-pret-zero',
    description: 'Couvrir le reste à charge à 0 %',
  },
  {
    label: 'Pompe à chaleur : prix + aides 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
    description: 'Comparatif PAC + financement',
  },
  {
    label: 'Isolation combles : technique + prix',
    href: '/renovation-energetique/travaux/isolation/combles',
    description: 'Soufflage, déroulé, sarking, rampants',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'Calcul personnalisé instantané',
  },
]

function CoupPouceTable({ title, rows }: { title: string; rows: typeof COUP_POUCE_CHAUFFAGE }) {
  return (
    <div className="not-prose my-6">
      <h3 className="font-heading text-lg font-semibold text-sand-900 mb-2">{title}</h3>
      <div className="bg-white border border-sand-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-sand-50 text-sand-900 text-left">
            <tr>
              <th className="p-3 border-b border-sand-200">Travaux</th>
              <th className="p-3 border-b border-sand-200">Standard</th>
              <th className="p-3 border-b border-sand-200">Modeste / très modeste</th>
              <th className="p-3 border-b border-sand-200">Fiche</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((cp) => (
              <tr key={cp.travail} className="border-b border-sand-100 last:border-0">
                <td className="p-3 font-medium text-sand-900">{cp.travail}</td>
                <td className="p-3">{cp.standard}</td>
                <td className="p-3 text-primary-700 font-semibold">{cp.modeste}</td>
                <td className="p-3 text-xs text-sand-500 font-mono">{cp.code}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: PAGE_PATH,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Prime Coup de Pouce',
    keywords: [
      'prime coup de pouce',
      'coup de pouce chauffage',
      'coup de pouce isolation',
      'coup de pouce renovation',
      'coup de pouce pompe a chaleur',
      'cee coup de pouce',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Aides', url: '/renovation-energetique/aides' },
    { name: 'Prime Coup de Pouce', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'Prime Coup de Pouce 2026',
    description:
      'Bonification CEE ciblée sur les travaux prioritaires : Coup de Pouce Chauffage (PAC, biomasse), Coup de Pouce Isolation (combles, ITE, planchers bas), Coup de Pouce Rénovation d’ampleur. Versée par les fournisseurs d’énergie obligés.',
    url: PAGE_URL,
    serviceType: 'Aide financière privée régulée',
    audience: 'Particuliers, copropriétés',
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
              { label: 'Prime Coup de Pouce' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <PiggyBank className="w-3.5 h-3.5" aria-hidden />
              Bonification CEE 2026
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Prime Coup de Pouce 2026 : chauffage et isolation
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              La <strong>Prime Coup de Pouce</strong> est la version bonifiée des CEE pour les
              travaux prioritaires de la rénovation énergétique. En 2026, elle finance jusqu’à{' '}
              <strong>7 000 €</strong> pour le remplacement d’une chaudière fioul/gaz par une PAC
              géothermique (ménage modeste), <strong>30 €/m²</strong> pour l’isolation d’un plancher
              bas, et <strong>500 €/MWh économisé</strong> annuellement pour une rénovation
              d’ampleur.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="coup-pouce-chauffage">
              <Flame className="inline w-5 h-5 text-primary-700 mr-1" aria-hidden />
              Coup de Pouce Chauffage 2026
            </h2>
            <p>
              Pour le remplacement d’une chaudière au fioul, gaz ou charbon par une énergie
              renouvelable (PAC, biomasse, solaire combiné). Montants standard et bonifiés
              (modeste/très modeste selon plafonds Anah).
            </p>
            <CoupPouceTable
              title="Coup de Pouce Chauffage — montants 2026"
              rows={COUP_POUCE_CHAUFFAGE}
            />

            <h2 id="coup-pouce-isolation">
              <Sparkles className="inline w-5 h-5 text-primary-700 mr-1" aria-hidden />
              Coup de Pouce Isolation 2026
            </h2>
            <p>
              Pour l’isolation thermique à grande échelle des combles, planchers bas, murs
              extérieurs et intérieurs.
            </p>
            <CoupPouceTable
              title="Coup de Pouce Isolation — montants 2026"
              rows={COUP_POUCE_ISOLATION}
            />

            <h2 id="coup-pouce-global">Coup de Pouce Rénovation d’ampleur</h2>
            <div className="not-prose grid gap-3 my-6">
              {COUP_POUCE_GLOBAL.map((cp) => (
                <div key={cp.operation} className="bg-white border border-sand-200 rounded-xl p-5">
                  <p className="font-semibold text-sand-900 m-0 mb-1">{cp.operation}</p>
                  <p className="text-xs text-sand-500 font-mono mb-2">{cp.code}</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-2">
                    <span className="text-sand-600">Standard</span>
                    <span className="text-right">{cp.standard}</span>
                    <span className="text-sand-600">Modeste</span>
                    <span className="text-right text-primary-700 font-semibold">{cp.modeste}</span>
                  </div>
                  <p className="text-xs text-sand-600 italic m-0">{cp.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="cumul">Cumul exemple chiffré</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 my-6">
              <p className="text-sm text-sand-900 m-0 mb-3 font-semibold">
                Remplacement chaudière fioul → PAC air-eau (devis 14 000 €) — couple modeste (Jaune)
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <span className="text-sand-600">Devis HT</span>
                <span className="text-sand-900 font-medium text-right">14 000 €</span>
                <span className="text-sand-600">Coup de Pouce Chauffage</span>
                <span className="text-primary-700 font-medium text-right">- 4 000 €</span>
                <span className="text-sand-600">MaPrimeRénov’ Jaune</span>
                <span className="text-primary-700 font-medium text-right">- 4 000 €</span>
                <span className="text-sand-600">TVA 5,5 % (vs 20 %) ≈</span>
                <span className="text-primary-700 font-medium text-right">- 750 €</span>
                <span className="text-sand-900 font-bold pt-2 border-t border-sand-200">
                  Reste à charge
                </span>
                <span className="text-sand-900 font-bold pt-2 border-t border-sand-200 text-right">
                  5 250 €
                </span>
                <span className="text-primary-700 font-semibold mt-1">
                  Financé par éco-PTZ (15 ans à 0 %)
                </span>
                <span className="text-primary-700 font-semibold text-right mt-1">~30 €/mois</span>
              </div>
              <p className="text-xs text-sand-500 italic mt-3 mb-0">
                Économie chauffage attendue : 80-120 €/mois (PAC vs chaudière fioul). ROI immédiat,
                gain net 50-90 €/mois.
              </p>
            </div>

            <h2 id="etapes">Démarche en 6 étapes</h2>
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
                    Calculer votre Prime Coup de Pouce
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Estimation instantanée : Coup de pouce + MPR + éco-PTZ + TVA 5,5 %. Comparaison
                    standard vs modeste selon vos revenus.
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

            <div className="not-prose flex items-start gap-3 border border-amber-200 bg-amber-50 rounded-lg p-4 my-6">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <div className="text-sm text-amber-900">
                <p className="font-semibold m-0 mb-1">Anti-arnaque "isolation à 1 €"</p>
                <p className="m-0">
                  Les offres "isolation à 1 €" ont été interdites en 2021 après plus de 10 000
                  plaintes (DGCCRF) : matériaux non conformes (12 cm au lieu de 30+), pose bâclée,
                  pas d’audit thermique, parfois aucune intervention sur place. Aujourd’hui, prix
                  marché isolation combles 100 m² avec Coup de pouce = 800-2 000 € (modeste).
                  Méfiance maximale envers toute offre &lt; 5 €/m² ou démarchage téléphonique.
                </p>
              </div>
            </div>

            <h2 id="conditions-modeste">Conditions ménage modeste / très modeste</h2>
            <p>
              Les bonifications "modeste" appliquent les plafonds de revenus Anah utilisés pour
              MaPrimeRénov’ catégories Bleu (très modeste) et Jaune (modeste). Justification par
              avis d’imposition de l’année précédente (RFR + composition foyer). Plafonds 1 personne
              hors Île-de-France 2026 : Bleu ≤ 17 173 €, Jaune ≤ 22 015 €.{' '}
              <Link href="/renovation-energetique/aides/maprimerenov-2026/eligibilite">
                Voir les plafonds détaillés par foyer
              </Link>
              .
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
              href="/renovation-energetique/aides"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Aides
            </Link>
            <Link
              href="/rge/renovation-energetique"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Artisans RGE <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>

          <p className="sr-only">
            <CheckCircle2 className="inline" aria-hidden /> Page mise à jour selon arrêtés CEE 2026
            et fiches BAR-TH/BAR-EN officielles.
          </p>
        </div>
      </div>
    </>
  )
}
