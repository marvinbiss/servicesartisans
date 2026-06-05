/**
 * Page : /renovation-energetique/aides/maprimerenov-2026/montants
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "maprimerenov montant"             → 20 vol, KD 76 (longue traîne directe)
 * - "ma prime renov montant"           → variant
 * - "montant maprimerenov pompe a chaleur" → longue traîne intent fort
 * - "maprimerenov isolation montant"   → longue traîne intent fort
 * - Famille cumulée pivot : ~150 vol/mois (longue traîne, intent transactionnel élevé)
 *
 * Source : audit Ahrefs API live (cf docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md)
 * Easy win : OUI sur la longue traîne montants par travaux (peu de pages dédiées concurrentes)
 *            Capte intent "combien je vais toucher pour X" — conversion simulateur élevée
 * Cluster pillar : Rénovation Énergétique → Aides → MaPrimeRénov’ 2026 → Montants
 *
 * Anti-cannibalisation :
 *   - Page parente /maprimerenov-2026/ = barèmes revenus + parcours (intent général)
 *   - Cette page = grille montants détaillés par poste de travaux 2026 (intent transactionnel)
 *   - Sub /eligibilite/ = conditions accès | Sub /parcours-accompagne/ = rénovation d’ampleur
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Banknote, Calculator, Coins, ShieldCheck } from 'lucide-react'

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

const PAGE_PATH = '/renovation-energetique/aides/maprimerenov-2026/montants'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'claire-dubois'
const AUTHOR_NAME = 'Claire Dubois'

const TITLE = 'MaPrimeRénov 2026 : montants par geste'
const DESCRIPTION =
  'Montants MaPrimeRénov 2026 par travaux : PAC, isolation, chauffage biomasse, menuiseries. Barèmes officiels par catégorie de revenus.'

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
  'Montants MaPrimeRénov’ 2026 = forfait fixe par geste (€) selon revenus (Bleu/Jaune/Violet/Rose).',
  'PAC air-eau : 5 000 € (Bleu) / 4 000 € (Jaune) / 3 000 € (Violet) / 0 € (Rose).',
  'PAC géothermique : 11 000 € (Bleu) — montant le plus élevé du barème par geste.',
  'Isolation combles : 25 €/m² (Bleu), 20 €/m² (Jaune), 15 €/m² (Violet).',
  'Bonus sortie passoire +500-1 500 € si projet fait sortir de classe F ou G.',
  'Parcours accompagné : montant calculé sur % du devis (jusqu’à 90 % pour très modestes).',
]

const CHAUFFAGE = [
  { equip: 'PAC air-eau', bleu: '5 000 €', jaune: '4 000 €', violet: '3 000 €', rose: '0 €' },
  {
    equip: 'PAC géothermique / solarothermique',
    bleu: '11 000 €',
    jaune: '9 000 €',
    violet: '6 000 €',
    rose: '0 €',
  },
  {
    equip: 'PAC air-air (climatisation)',
    bleu: 'Non éligible',
    jaune: 'Non éligible',
    violet: 'Non éligible',
    rose: 'Non éligible',
  },
  {
    equip: 'Chaudière biomasse granulés',
    bleu: '7 000 €',
    jaune: '5 500 €',
    violet: '3 000 €',
    rose: '0 €',
  },
  {
    equip: 'Chaudière biomasse bûches',
    bleu: '6 000 €',
    jaune: '4 500 €',
    violet: '2 500 €',
    rose: '0 €',
  },
  { equip: 'Poêle à granulés', bleu: '2 500 €', jaune: '2 000 €', violet: '1 500 €', rose: '0 €' },
  { equip: 'Poêle à bûches', bleu: '2 000 €', jaune: '1 500 €', violet: '1 000 €', rose: '0 €' },
  {
    equip: 'Chauffe-eau thermodynamique',
    bleu: '1 200 €',
    jaune: '800 €',
    violet: '400 €',
    rose: '0 €',
  },
  {
    equip: 'Chauffe-eau solaire individuel',
    bleu: '4 000 €',
    jaune: '3 000 €',
    violet: '2 000 €',
    rose: '0 €',
  },
  {
    equip: 'Système solaire combiné',
    bleu: '10 000 €',
    jaune: '8 000 €',
    violet: '4 000 €',
    rose: '0 €',
  },
  {
    equip: 'Raccordement réseau chaleur',
    bleu: '1 200 €',
    jaune: '800 €',
    violet: '400 €',
    rose: '0 €',
  },
]

const ISOLATION = [
  {
    equip: 'Isolation combles perdus',
    bleu: '25 €/m²',
    jaune: '20 €/m²',
    violet: '15 €/m²',
    rose: '0 €',
  },
  {
    equip: 'Isolation rampants/toiture',
    bleu: '25 €/m²',
    jaune: '20 €/m²',
    violet: '15 €/m²',
    rose: '0 €',
  },
  {
    equip: 'Isolation murs par l’extérieur (ITE)',
    bleu: '75 €/m²',
    jaune: '60 €/m²',
    violet: '40 €/m²',
    rose: '0 €',
  },
  {
    equip: 'Isolation murs par l’intérieur (ITI)',
    bleu: '25 €/m²',
    jaune: '20 €/m²',
    violet: '15 €/m²',
    rose: '0 €',
  },
  {
    equip: 'Isolation plancher bas',
    bleu: '25 €/m²',
    jaune: '20 €/m²',
    violet: '15 €/m²',
    rose: '0 €',
  },
  {
    equip: 'Fenêtres double vitrage (Parcours accompagné uniquement)',
    bleu: '100 €/équip.',
    jaune: '80 €/équip.',
    violet: '40 €/équip.',
    rose: '0 €',
  },
]

const VENTILATION_AUDIT = [
  { equip: 'VMC double flux', bleu: '2 500 €', jaune: '2 000 €', violet: '1 500 €', rose: '0 €' },
  {
    equip: 'Audit énergétique (forfait)',
    bleu: '500 €',
    jaune: '400 €',
    violet: '300 €',
    rose: '0 €',
  },
  { equip: 'Dépose cuve fioul', bleu: '1 200 €', jaune: '800 €', violet: '400 €', rose: '0 €' },
]

const BONUS = [
  { name: 'Bonus sortie passoire (F→E ou G→E minimum)', amount: '+500 € à +1 500 €' },
  { name: 'Bonus BBC (atteinte classe A ou B)', amount: '+500 € à +1 500 €' },
  { name: 'Bonus copropriété fragile', amount: '+1 000 €/logement' },
]

const faqs = [
  {
    question: 'Quel est le plus gros montant MaPrimeRénov’ par geste ?',
    answer:
      'La PAC géothermique pour un ménage très modeste (Bleu) atteint 11 000 € de prime, plus haut montant du barème par geste 2026. Suivent le système solaire combiné (10 000 € Bleu), la chaudière biomasse granulés (7 000 € Bleu) et la PAC air-eau (5 000 € Bleu). Pour aller plus loin, le Parcours accompagné permet d’atteindre 70 000 € sur un projet de rénovation globale.',
  },
  {
    question: 'Le montant pour la PAC air-air (climatisation réversible) ?',
    answer:
      'Aucun. La PAC air-air n’est pas éligible à MaPrimeRénov’ depuis 2022. Elle est en revanche éligible au CEE Coup de pouce dans certains cas (remplacement chaudière fioul/gaz). Si vous cherchez à rénover économiquement, privilégiez la PAC air-eau (5 000 € MPR Bleu) qui chauffe ET produit de l’eau chaude sanitaire.',
  },
  {
    question: 'Combien pour isoler 100 m² de combles avec MaPrimeRénov’ 2026 ?',
    answer:
      'Forfait isolation combles 2026 : 25 €/m² Bleu, 20 €/m² Jaune, 15 €/m² Violet, 0 € Rose. Pour 100 m² : 2 500 € (Bleu), 2 000 € (Jaune), 1 500 € (Violet). Cumulable avec CEE Coup de pouce isolation (~10-15 €/m²) et TVA 5,5 %. Reste à charge typique : 800-1 500 € pour 100 m² ménage modeste.',
  },
  {
    question: 'Les bonus passoire et BBC sont-ils automatiques ?',
    answer:
      'Non, ils sont conditionnés à un saut de classe DPE attesté par un nouveau DPE post-travaux. Bonus sortie passoire : projet doit faire sortir le logement de classe F ou G (vers E minimum). Bonus BBC : projet doit atteindre classe A ou B après travaux. Cumul possible des 2 bonus si le projet va de G à B par exemple. Montants entre 500 € et 1 500 € selon catégorie revenus.',
  },
  {
    question: 'Comment calcule-t-on le montant pour le Parcours accompagné ?',
    answer:
      'Le Parcours accompagné raisonne en pourcentage du devis HT (et non en forfait fixe). Bleu : jusqu’à 80 % du devis (+10 % bonus passoire = 90 %). Jaune : 60 % (+10 % = 70 %). Violet : 45 %. Rose : 30 %. Plafond global : 70 000 € de devis pris en compte (90 000 € si sortie passoire + bonus BBC). Audit énergétique préalable obligatoire qui définit les travaux éligibles.',
  },
  {
    question: 'Le montant change-t-il selon la région ?',
    answer:
      'Non, les forfaits MPR par geste sont identiques sur tout le territoire. En revanche, les plafonds de revenus distinguent l’Île-de-France (plafonds majorés ~28 %) du reste de la France. Donc pour des revenus identiques, vous pouvez être Bleu en province et Jaune en Île-de-France. Les aides locales (région, département, métropole) viennent en complément et varient.',
  },
  {
    question: 'Les montants 2026 ont-ils baissé par rapport à 2025 ?',
    answer:
      'Globalement stables avec quelques ajustements. La PAC air-eau Bleu reste à 5 000 €, l’ITE Bleu à 75 €/m². Le forfait audit énergétique a été harmonisé à 500 € Bleu. Le bonus sortie passoire a été étendu (était 1 000-1 500 €, désormais 500-1 500 € selon catégorie). Le Parcours accompagné a vu son plafond passer à 90 000 € pour les sorties de passoire avec bonus BBC.',
  },
  {
    question: 'Comment maximiser le montant total de mes aides ?',
    answer:
      'Stratégie de cumul : (1) MPR par geste pour chaque équipement éligible, (2) ajouter CEE Coup de pouce (négocié avec l’artisan, déduit du devis), (3) demander l’éco-PTZ pour le reste à charge (jusqu’à 50 000 € à 0 %), (4) bénéficier de la TVA 5,5 % automatique avec artisan RGE, (5) vérifier les aides locales sur france-renov.gouv.fr. Pour rénovation d’ampleur (gain ≥ 2 classes DPE), le Parcours accompagné est généralement plus avantageux que le cumul de gestes isolés.',
  },
]

const sources = [
  {
    label: 'Anah — Barèmes MaPrimeRénov’ 2026',
    url: 'https://www.anah.gouv.fr/proprietaires/proprietaire-occupant/maprimerenov-une-prime-pour-la-renovation-energetique',
  },
  {
    label: 'France Rénov’ — Calculer MaPrimeRénov’',
    url: 'https://france-renov.gouv.fr/aides/maprimerenov',
  },
  {
    label: 'Service-Public.fr — Montants MaPrimeRénov’',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F35083',
  },
  { label: 'Légifrance — Arrêté MPR 2026', url: 'https://www.legifrance.gouv.fr' },
  { label: 'ADEME — Tableau aides 2026', url: 'https://librairie.ademe.fr' },
]

const relatedPages = [
  {
    label: 'MaPrimeRénov’ 2026 (hub)',
    href: '/renovation-energetique/aides/maprimerenov-2026',
    description: 'Barèmes revenus + parcours + démarche',
  },
  {
    label: 'MaPrimeRénov’ : éligibilité 2026',
    href: '/renovation-energetique/aides/maprimerenov-2026/eligibilite',
    description: 'Conditions logement, revenus, travaux',
  },
  {
    label: 'Parcours accompagné MPR',
    href: '/renovation-energetique/aides/maprimerenov-2026/parcours-accompagne',
    description: 'Rénovation d’ampleur jusqu’à 70 000 €',
  },
  {
    label: 'CEE Coup de pouce',
    href: '/renovation-energetique/aides/cee-certificats-economie-energie',
    description: 'Cumul possible avec MPR par geste',
  },
  {
    label: 'Pompe à chaleur prix 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
    description: 'Comparatif 3 types PAC + aides',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'Calcul personnalisé instantané',
  },
]

function Table({ title, rows }: { title: string; rows: typeof CHAUFFAGE }) {
  return (
    <div className="not-prose my-6">
      <h3 className="font-heading text-lg font-semibold text-sand-900 mb-2">{title}</h3>
      <div className="bg-white border border-sand-300 rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-sand-50 text-sand-900 text-left">
            <tr>
              <th className="p-3 border-b border-sand-300">Équipement</th>
              <th className="p-3 border-b border-sand-300">
                <MprBaremeChip categorie="bleu" />
              </th>
              <th className="p-3 border-b border-sand-300">
                <MprBaremeChip categorie="jaune" />
              </th>
              <th className="p-3 border-b border-sand-300">
                <MprBaremeChip categorie="violet" />
              </th>
              <th className="p-3 border-b border-sand-300">
                <MprBaremeChip categorie="rose" />
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.equip}
                className={`border-b border-sand-100 last:border-0 hover:bg-primary-50/60 transition-colors ${i % 2 === 1 ? 'bg-sand-50/50' : ''}`}
              >
                <td className="p-3 font-medium text-sand-900">{r.equip}</td>
                <td className="p-3 text-primary-700 font-semibold whitespace-nowrap">{r.bleu}</td>
                <td className="p-3 whitespace-nowrap">{r.jaune}</td>
                <td className="p-3 whitespace-nowrap">{r.violet}</td>
                <td className="p-3 text-sand-500 whitespace-nowrap">{r.rose}</td>
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
    section: 'Montants MaPrimeRénov’ 2026',
    keywords: [
      'maprimerenov montant',
      'ma prime renov montant',
      'montant maprimerenov pompe a chaleur',
      'maprimerenov isolation montant',
      'forfait maprimerenov 2026',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Aides', url: '/renovation-energetique/aides' },
    { name: 'MaPrimeRénov’ 2026', url: '/renovation-energetique/aides/maprimerenov-2026' },
    { name: 'Montants', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'Forfaits MaPrimeRénov’ 2026 par geste',
    description:
      'Grille officielle Anah 2026 des montants forfaitaires MaPrimeRénov’ par poste de travaux et par catégorie de revenus (Bleu/Jaune/Violet/Rose).',
    url: PAGE_URL,
    serviceType: 'Subvention publique rénovation énergétique',
    audience: 'Propriétaires occupants et bailleurs',
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
              { label: 'Montants' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Banknote className="w-3.5 h-3.5" aria-hidden />
              Forfaits Anah 2026
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              MaPrimeRénov’ 2026 : montants par travaux
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Grille complète des <strong>forfaits MaPrimeRénov’ 2026</strong> par type de travaux
              et par catégorie de revenus. Données issues directement des arrêtés Anah, valables
              pour les demandes déposées entre le 1<sup>er</sup> janvier 2026 et le 31 décembre
              2026.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="categories">Rappel des 4 catégories de revenus</h2>
            <p>Les forfaits ci-dessous dépendent de votre catégorie de revenus 2026 :</p>
            <ul>
              <li>
                <strong>Bleu</strong> = Très modeste (RFR ≤ 17 173 € / 1 personne hors IDF)
              </li>
              <li>
                <strong>Jaune</strong> = Modeste (RFR ≤ 22 015 € / 1 personne hors IDF)
              </li>
              <li>
                <strong>Violet</strong> = Intermédiaire (RFR ≤ 30 844 € / 1 personne hors IDF)
              </li>
              <li>
                <strong>Rose</strong> = Supérieur (au-delà — éligible uniquement à certains gestes :
                audit, ITE, VMC double flux dans Parcours accompagné)
              </li>
            </ul>
            <p>
              <Link href="/renovation-energetique/aides/maprimerenov-2026">
                Voir le détail des plafonds de revenus IDF / hors IDF
              </Link>
              .
            </p>

            <h2 id="chauffage-eau-chaude">Chauffage et eau chaude sanitaire</h2>
            <Table title="Forfaits MPR 2026 — chauffage / ECS" rows={CHAUFFAGE} />
            <p className="text-xs text-sand-500">
              Source : arrêté ministériel barèmes Anah 2026. PAC air-air exclue depuis 2022. PAC
              hybride éligible aux mêmes montants que la PAC air-eau. Critères techniques : ETAS ≥
              126 % (PAC moyenne température), 102 % (haute température). COP saisonnier ≥ 3,4.
            </p>

            <h2 id="isolation">Isolation thermique</h2>
            <Table title="Forfaits MPR 2026 — isolation" rows={ISOLATION} />
            <p className="text-xs text-sand-500">
              Source : arrêté Anah 2026. Critères techniques : R ≥ 7 m².K/W combles, R ≥ 3,7 m².K/W
              murs, R ≥ 3 m².K/W planchers bas. Plafond ITE 100 m² par logement.
            </p>

            <h2 id="ventilation-audit">Ventilation et audit</h2>
            <Table
              title="Forfaits MPR 2026 — ventilation, audit, dépose fioul"
              rows={VENTILATION_AUDIT}
            />

            <h2 id="bonus">Les 3 bonus 2026</h2>
            <div className="not-prose grid gap-3 my-6">
              {BONUS.map((b) => (
                <div
                  key={b.name}
                  className="bg-white border border-primary-200 rounded-xl p-4 flex items-center justify-between gap-3"
                >
                  <p className="font-semibold text-sand-900 m-0">{b.name}</p>
                  <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                    {b.amount}
                  </span>
                </div>
              ))}
            </div>

            <h2 id="parcours-accompagne">Parcours accompagné : montants en pourcentage</h2>
            <p>
              Pour les rénovations d’ampleur (gain ≥ 2 classes DPE), le Parcours accompagné raisonne
              en <strong>pourcentage du devis HT</strong> (au lieu de forfaits par geste) :
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Catégorie</th>
                    <th className="p-3 border-b border-sand-200">% devis pris en charge</th>
                    <th className="p-3 border-b border-sand-200">Avec bonus passoire</th>
                    <th className="p-3 border-b border-sand-200">Plafond travaux</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-sand-100 hover:bg-primary-50/60 transition-colors">
                    <td className="p-3">
                      <MprBaremeChip categorie="bleu" />
                    </td>
                    <td className="p-3">80 %</td>
                    <td className="p-3 text-primary-700 font-semibold">90 %</td>
                    <td className="p-3">70 000 € (90 000 € si bonus BBC)</td>
                  </tr>
                  <tr className="border-b border-sand-100 bg-sand-50/50 hover:bg-primary-50/60 transition-colors">
                    <td className="p-3">
                      <MprBaremeChip categorie="jaune" />
                    </td>
                    <td className="p-3">60 %</td>
                    <td className="p-3">70 %</td>
                    <td className="p-3">70 000 €</td>
                  </tr>
                  <tr className="border-b border-sand-100 hover:bg-primary-50/60 transition-colors">
                    <td className="p-3">
                      <MprBaremeChip categorie="violet" />
                    </td>
                    <td className="p-3">45 %</td>
                    <td className="p-3">55 %</td>
                    <td className="p-3">70 000 €</td>
                  </tr>
                  <tr className="bg-sand-50/50 hover:bg-primary-50/60 transition-colors">
                    <td className="p-3">
                      <MprBaremeChip categorie="rose" />
                    </td>
                    <td className="p-3">30 %</td>
                    <td className="p-3">40 %</td>
                    <td className="p-3">70 000 €</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-sand-500">
              Le Parcours accompagné requiert un audit énergétique préalable et l’accompagnement
              d’un Mon Accompagnateur Rénov’. Voir{' '}
              <Link href="/renovation-energetique/aides/maprimerenov-2026/parcours-accompagne">
                la page dédiée
              </Link>
              .
            </p>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Calcul personnalisé MaPrimeRénov’ 2026
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Estimation instantanée selon vos revenus, votre foyer, vos travaux et votre zone
                    géographique. Cumul automatique avec CEE et éco-PTZ.
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
                <p className="font-semibold m-0 mb-1">Vérifier les critères techniques</p>
                <p className="m-0">
                  Le forfait n’est versé que si l’équipement respecte les critères de performance
                  Anah (ETAS, COP, R, Up). Vérifiez la conformité auprès de l’artisan RGE et exigez
                  la fiche technique fabricant. En cas de doute, France Rénov’
                  (0&nbsp;808&nbsp;800&nbsp;700) confirme l’éligibilité avant signature du devis.
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
