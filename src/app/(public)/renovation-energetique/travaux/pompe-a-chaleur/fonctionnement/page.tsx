/**
 * Page : /renovation-energetique/travaux/pompe-a-chaleur/fonctionnement
 *
 * @kw-primary    fonctionnement pompe a chaleur
 * @kw-volume     2500
 * @kw-kd         3
 * @kw-cpc        0.45
 * @intent        info
 * @cluster       reno-energetique-pac-fonctionnement
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md
 * @snapshot      2026-05-06 (Bloc 1 — quota Ahrefs API restreint, à re-valider 18/05)
 * @backlog-item  Sprint 4 PAC long-tail fonctionnement
 *
 * KW cibles (Bloc 1 + estimation longue traîne) :
 * - "fonctionnement pompe a chaleur"      → 2 500 vol, KD 3 ⭐⭐⭐⭐ PIVOT
 * - "comment fonctionne pompe a chaleur"  → ~600 vol, KD 2
 * - "principe pompe a chaleur"            → ~400 vol, KD 1
 * - "schema pompe a chaleur"              → ~350 vol, KD 1
 * - "cycle thermodynamique pompe a chaleur"→ ~200 vol, KD 0
 * - "fluide frigorigene pompe a chaleur"  → ~250 vol, KD 1
 * - Famille cumulée pivot : ~4 300 vol/mois (KD 0-3)
 *
 * Easy win : OUI (KD 1-3, intent informationnel haut funnel)
 * Cluster pillar : Rénovation Énergétique → Travaux → PAC → Fonctionnement
 *
 * Anti-cannibalisation :
 *   - Hub /pompe-a-chaleur/ = comparatif 3 types + dimensionnement
 *   - /installation/ = chantier 8 étapes
 *   - /entretien/, /consommation/ = post-pose
 *   - Cette page = fonctionnement physique (cycle thermodynamique 4 phases,
 *     COP/SCOP, fluides frigorigènes R32/R290, mode chauffage/rafraîchissement,
 *     ECS optionnel, dégivrage hiver, modulation Inverter).
 *
 * E-E-A-T :
 *   - Norme NF EN 14511 (méthode mesure COP)
 *   - Norme NF EN 14825 (méthode mesure SCOP saisonnier)
 *   - Règlement UE 517/2014 (F-Gas, fluides PRG)
 *   - AFPAC, ADEME (vulgarisation thermodynamique)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Calculator,
  CheckCircle2,
  Snowflake,
  Sun,
  Thermometer,
  Wind,
  Zap,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import SimulateurAideBox from '@/components/conversion/SimulateurAideBox'
import PrixComparatif from '@/components/conversion/PrixComparatif'
import LocalProviderShowcase from '@/components/seo/LocalProviderShowcase'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { getProvidersByService } from '@/lib/supabase'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/pompe-a-chaleur/fonctionnement'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Fonctionnement pompe à chaleur : cycle, COP, fluide frigo'
const DESCRIPTION =
  'Comment fonctionne une pompe à chaleur en 2026 : cycle thermodynamique 4 phases (évaporation, compression, condensation, détente), COP/SCOP, fluides.'

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
  'Une PAC fonctionne en 4 phases : évaporation (capte chaleur), compression (élève la T°), condensation (cède chaleur), détente (refroidit le fluide).',
  'Coefficient de performance (COP) : 1 kWh électrique consommé → 3 à 5 kWh de chaleur restitués. Le SCOP mesure la performance moyenne saisonnière.',
  'Fluide frigorigène : R32 (PRG 675) ou R290 propane (PRG 3) ont remplacé le R410A obsolète depuis 2025.',
  'Performance dégradée par grand froid (-7 à -15 °C) → cycle de dégivrage automatique 5-10 min toutes les 60-90 min.',
  'Technologie Inverter : modulation continue 30-100 % de la puissance vs ON/OFF. Économie 25-35 % vs ancienne génération.',
  'Mode rafraîchissement (PAC réversible) : inversion du cycle via vanne 4 voies. Côté froid devient côté chaud, et vice-versa.',
]

const PHASES = [
  {
    n: 1,
    nom: 'Évaporation',
    icone: Snowflake,
    tempEntree: '−5 °C',
    tempSortie: '−10 °C',
    desc: "Le fluide frigorigène (à très basse pression) entre en contact avec l'air extérieur, le sol ou l'eau. Il absorbe les calories et passe de l'état liquide à gazeux. Cette phase capte l'énergie thermique « gratuite ».",
  },
  {
    n: 2,
    nom: 'Compression',
    icone: Zap,
    tempEntree: '−10 °C',
    tempSortie: '+80 °C',
    desc: 'Le compresseur (seul gros consommateur électrique) augmente brutalement la pression du fluide gazeux. Cette compression élève sa température de manière spectaculaire (de -10 °C à +80 °C typiquement).',
  },
  {
    n: 3,
    nom: 'Condensation',
    icone: Sun,
    tempEntree: '+80 °C',
    tempSortie: '+45 °C',
    desc: "Le fluide chaud à haute pression cède sa chaleur au circuit de chauffage (radiateurs, plancher chauffant ou eau du ballon ECS). En se refroidissant, le fluide repasse à l'état liquide.",
  },
  {
    n: 4,
    nom: 'Détente',
    icone: ArrowDown,
    tempEntree: '+45 °C',
    tempSortie: '−5 °C',
    desc: 'Le fluide liquide passe à travers un détendeur (vanne ou capillaire) qui chute brusquement sa pression. Cette détente le refroidit drastiquement, le préparant à recommencer le cycle.',
  },
]

const FLUIDES = [
  {
    nom: 'R32',
    formule: 'CH₂F₂ (difluorométhane)',
    prg: '675',
    statut: 'Standard 2023-2030',
    detail:
      'Fluide HFC le plus répandu actuellement. PRG divisé par 3 vs R410A. Faiblement inflammable (classe A2L), nécessite ventilation locale.',
  },
  {
    nom: 'R290',
    formule: 'C₃H₈ (propane)',
    prg: '3',
    statut: 'Future norme 2030+',
    detail:
      'Fluide naturel, PRG quasi nul. Hautement inflammable (classe A3) → restrictions installation (volume max, ventilation accrue). Adopté par Daikin Altherma 3 R290.',
  },
  {
    nom: 'R410A',
    formule: 'Mélange R32 + R125',
    prg: '2 088',
    statut: 'Interdit nouveaux équipements depuis 2025',
    detail:
      'Ancien fluide HFC. PRG très élevé. Maintenance encore autorisée jusqu’en 2030 sur installations existantes (article F-Gas révisé 2024).',
  },
  {
    nom: 'R134a',
    formule: 'CH₂FCF₃',
    prg: '1 430',
    statut: 'Restreint',
    detail:
      'Utilisé pour PAC haute température (production ECS). Phasé out progressif. Remplacé par R32 + booster ECS.',
  },
]

const COP_TABLE = [
  {
    type: 'PAC air-air',
    cop: '3,5 à 4,5',
    scop: '3,8 à 4,2',
    note: 'Décline rapidement < 0 °C',
  },
  {
    type: 'PAC air-eau basse T° (35-45 °C)',
    cop: '4,0 à 5,0',
    scop: '4,2 à 4,8',
    note: 'Idéal plancher chauffant',
  },
  {
    type: 'PAC air-eau haute T° (55-65 °C)',
    cop: '3,0 à 4,0',
    scop: '3,2 à 3,7',
    note: 'Compatible radiateurs anciens',
  },
  {
    type: 'PAC géothermique sol-eau',
    cop: '4,5 à 5,5',
    scop: '4,5 à 5,0',
    note: 'Stable toute l’année',
  },
  {
    type: 'PAC eau-eau (nappe phréatique)',
    cop: '5,0 à 6,0',
    scop: '5,0 à 5,5',
    note: 'Performance maximale',
  },
]

const faqs = [
  {
    question: 'Comment fonctionne une pompe à chaleur en termes simples ?',
    answer:
      'Une PAC est un climatiseur inversé : elle déplace les calories de l’extérieur (air, sol, eau) vers l’intérieur de votre maison via un cycle thermodynamique. Concrètement, un fluide frigorigène circule dans un circuit fermé, change d’état (liquide ↔ gazeux), absorbe la chaleur dehors et la restitue dedans. Pour 1 kWh électrique consommé, vous récupérez 3 à 5 kWh de chaleur — c’est ce qu’on appelle le COP.',
  },
  {
    question: 'Quelles sont les 4 étapes du cycle thermodynamique ?',
    answer:
      'Phase 1 — ÉVAPORATION : le fluide à basse pression capte les calories extérieures (-5 → -10 °C) et passe de liquide à gaz. Phase 2 — COMPRESSION : un compresseur augmente brutalement la pression et donc la température (-10 → +80 °C). Phase 3 — CONDENSATION : le fluide chaud cède sa chaleur au circuit de chauffage (+80 → +45 °C) et redevient liquide. Phase 4 — DÉTENTE : le fluide passe à travers un détendeur qui chute sa pression et le refroidit drastiquement (+45 → -5 °C), prêt à recommencer le cycle.',
  },
  {
    question: 'Qu’est-ce que le COP et le SCOP d’une pompe à chaleur ?',
    answer:
      'Le COP (Coefficient of Performance, norme NF EN 14511) mesure la performance instantanée à des conditions précises (ex. air ext. +7 °C, eau dép. +35 °C). Un COP de 4 = 1 kWh consommé → 4 kWh restitués. Le SCOP (Seasonal COP, norme NF EN 14825) mesure la performance MOYENNE sur une saison de chauffe complète, plus représentative de la réalité. Un SCOP > 4,0 est excellent. Le SCOP est obligatoire sur l’étiquette énergie depuis 2013.',
  },
  {
    question: 'Pourquoi le rendement d’une PAC baisse en hiver ?',
    answer:
      'À mesure que la température extérieure baisse, l’écart à combler entre l’extérieur (-5 °C, -10 °C) et le circuit de chauffage (+45 °C, +55 °C) s’élargit, ce qui force le compresseur à travailler plus. Un COP de 4,5 à +7 °C peut tomber à 2,8 à -7 °C. Sous -15 °C, certaines PAC nécessitent un appoint électrique. Choix conseillé en climat froid : PAC géothermique (sol stable à +10 °C) ou PAC air-eau « grand froid » (R32 enthalpie injection, performante jusqu’à -25 °C).',
  },
  {
    question: 'Quel fluide frigorigène est utilisé en 2026 ?',
    answer:
      'Le R32 est devenu le standard depuis 2023 (PRG 675, 3× moins polluant que l’ancien R410A). Daikin et certains constructeurs adoptent désormais le R290 (propane, PRG 3) qui est un fluide naturel, mais inflammable. Le R410A est interdit pour les équipements neufs depuis 2025 (Règlement F-Gas révisé). Le PRG (Pouvoir de Réchauffement Global) mesure l’impact climatique du fluide en cas de fuite : plus il est bas, mieux c’est.',
  },
  {
    question: 'Qu’est-ce que le dégivrage automatique ?',
    answer:
      'Quand la température extérieure est entre -5 °C et +5 °C avec humidité élevée, du givre se forme sur l’évaporateur extérieur, ce qui bloque le transfert thermique. La PAC inverse alors le cycle pendant 5-10 minutes pour faire fondre la glace (le condenseur intérieur cède sa chaleur au circuit extérieur). Cycle automatique transparent, mais consomme un peu d’énergie. Fréquence typique : toutes les 60-90 min en conditions givrantes.',
  },
  {
    question: 'Qu’est-ce que la technologie Inverter ?',
    answer:
      'Inverter signifie que le compresseur est à VITESSE VARIABLE (vs ancienne génération ON/OFF). Le compresseur module sa puissance entre 30 % et 100 % en continu pour s’adapter exactement aux besoins thermiques. Avantages : (1) économie d’énergie 25-35 % vs ON/OFF ; (2) maintien d’une température stable (±0,5 °C vs ±2 °C en ON/OFF) ; (3) durée de vie compresseur prolongée (moins de cycles). Toutes les PAC modernes (sauf entrée de gamme) sont équipées Inverter en 2026.',
  },
  {
    question: 'Comment marche le mode rafraîchissement (PAC réversible) ?',
    answer:
      'Une PAC réversible inverse le sens du cycle thermodynamique grâce à une VANNE 4 VOIES. En mode froid, le fluide capte les calories à l’intérieur (côté chaud devient froid) et les rejette dehors. Idéal pour la climatisation estivale (PAC air-air) ou le rafraîchissement passif d’un plancher chauffant (PAC air-eau réversible). Performance EER (Energy Efficiency Ratio) : 3,0 à 4,0 typique. Attention : la PAC air-eau réversible nécessite des émetteurs adaptés (planchers chauffants/rafraîchissants).',
  },
]

const sources = [
  {
    label: 'AFPAC — Comprendre la pompe à chaleur',
    url: 'https://www.afpac.org',
  },
  {
    label: 'ADEME — Fiches techniques pompes à chaleur',
    url: 'https://agir.ademe.fr',
  },
  {
    label: 'Légifrance — Règlement UE 517/2014 F-Gas (fluides frigorigènes)',
    url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX%3A32014R0517',
  },
  {
    label: 'AFNOR — Norme NF EN 14511 (méthode mesure COP)',
    url: 'https://www.afnor.org',
  },
  {
    label: 'AFNOR — Norme NF EN 14825 (méthode mesure SCOP)',
    url: 'https://www.afnor.org',
  },
]

const relatedPages = [
  {
    label: 'Hub Pompe à chaleur (3 types comparés)',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
  },
  {
    label: 'Installation PAC : 8 étapes + RGE',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/installation',
  },
  {
    label: 'Consommation PAC : kWh/an, COP, facture',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/consommation',
  },
  {
    label: 'PAC air-eau prix 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix',
  },
  {
    label: 'PAC air-air prix 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-air-prix',
  },
  {
    label: 'PAC géothermique',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/geothermie',
  },
]

export default async function Page() {
  const providers = await getProvidersByService('chauffagiste', 6)
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: PAGE_PATH,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Travaux — PAC — Fonctionnement',
    keywords: [
      'fonctionnement pompe à chaleur',
      'comment fonctionne PAC',
      'cycle thermodynamique PAC',
      'COP SCOP pompe à chaleur',
      'fluide frigorigène R32 R290',
      'dégivrage PAC',
      'inverter PAC',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Pompe à chaleur', url: '/renovation-energetique/travaux/pompe-a-chaleur' },
    { name: 'Fonctionnement', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const schemas = [articleSchema, breadcrumbSchema, faqSchema].filter(
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
              { label: 'Pompe à chaleur', href: '/renovation-energetique/travaux/pompe-a-chaleur' },
              { label: 'Fonctionnement' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Thermometer className="w-3.5 h-3.5" aria-hidden />
              PAC &middot; Fonctionnement physique
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Comment fonctionne une pompe à chaleur ?
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Une pompe à chaleur n’est pas un radiateur : elle <strong>déplace</strong> les
              calories de l’extérieur (air, sol, eau) vers votre maison grâce à un{' '}
              <strong>cycle thermodynamique en 4 phases</strong>. Pour 1 kWh électrique consommé,
              elle restitue 3 à 5 kWh de chaleur. Voici le principe physique, les fluides
              frigorigènes 2026 (R32, R290), les COP/SCOP et le dégivrage hivernal.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Le cycle thermodynamique en 4 phases</h2>
            <p>
              Le cœur d’une PAC est un circuit fermé contenant un{' '}
              <strong>fluide frigorigène</strong> qui change d’état (liquide ↔ gazeux) en absorbant
              ou cédant de la chaleur. Voici les 4 phases qui se succèdent en boucle :
            </p>

            <div className="not-prose grid gap-3 my-6">
              {PHASES.map((phase) => {
                const Icon = phase.icone
                return (
                  <div
                    key={phase.n}
                    className="bg-white border border-sand-200 rounded-lg p-4 flex items-start gap-4"
                  >
                    <div className="bg-primary-100 text-primary-800 font-heading text-lg font-bold w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                      {phase.n}
                    </div>
                    <div className="flex-1">
                      <p className="font-heading text-base font-semibold text-sand-900 m-0 flex items-center gap-2">
                        <Icon className="w-4 h-4 text-primary-700" aria-hidden />
                        {phase.nom}
                        <span className="ml-auto text-xs font-mono text-sand-500 font-normal">
                          {phase.tempEntree} <ArrowRight className="inline w-3 h-3" aria-hidden />{' '}
                          {phase.tempSortie}
                        </span>
                      </p>
                      <p className="text-sm text-sand-700 m-0 mt-1">{phase.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <h2>COP et SCOP : comment lire la performance</h2>
            <p>
              Le <strong>COP (Coefficient of Performance, norme NF EN 14511)</strong> mesure la
              performance instantanée dans des conditions précises (souvent +7 °C ext. / +35 °C
              eau). Le <strong>SCOP (Seasonal COP, norme NF EN 14825)</strong> mesure la performance
              MOYENNE sur une saison complète — beaucoup plus représentatif de la réalité.
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Type PAC</th>
                    <th className="p-3 border-b border-sand-200">COP</th>
                    <th className="p-3 border-b border-sand-200">SCOP</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {COP_TABLE.map((row) => (
                    <tr key={row.type} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{row.type}</td>
                      <td className="p-3 whitespace-nowrap">{row.cop}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.scop}
                      </td>
                      <td className="p-3 text-sand-600 hidden md:table-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Valeurs indicatives 2026 selon AFPAC. Le SCOP doit toujours être &gt; 3,4 pour
                bénéficier des aides MaPrimeRénov’.
              </p>
            </div>

            <h2>Fluides frigorigènes 2026 : R32, R290 et autres</h2>
            <p>
              Le fluide frigorigène est le sang de la PAC : il transporte la chaleur. Le règlement
              UE F-Gas 2014/2024 impose des fluides à faible <strong>PRG</strong> (Pouvoir de
              Réchauffement Global). Voici les fluides 2026 :
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Fluide</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Formule</th>
                    <th className="p-3 border-b border-sand-200">PRG</th>
                    <th className="p-3 border-b border-sand-200">Statut 2026</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {FLUIDES.map((row) => (
                    <tr key={row.nom} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.nom}</td>
                      <td className="p-3 text-sand-700 font-mono hidden md:table-cell">
                        {row.formule}
                      </td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.prg}
                      </td>
                      <td className="p-3 text-sand-700">{row.statut}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                PRG = Pouvoir de Réchauffement Global vs CO₂ (sur 100 ans). Plus il est bas,
                meilleur est l’impact environnemental en cas de fuite.
              </p>
            </div>
            <p className="text-sm text-sand-700">
              Détail technique : le R290 (propane) est un fluide naturel à PRG quasi nul, mais
              hautement inflammable (classe A3). Daikin et Stiebel Eltron en ont équipé leurs gammes
              premium 2024-2025. Restrictions installation : volume local minimum, ventilation
              accrue.
            </p>

            <h2>Le dégivrage automatique en hiver</h2>
            <p>
              Quand la température extérieure est entre <strong>-5 °C et +5 °C</strong> avec une
              humidité &gt; 70 %, du givre se forme sur l’évaporateur extérieur. Le givre bloque le
              transfert thermique → la PAC perd en performance.
            </p>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Cycle de dégivrage automatique :</strong> la vanne 4 voies inverse
                temporairement le sens (5-10 min) pour faire fondre la glace.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Fréquence :</strong> toutes les 60-90 min en conditions givrantes (typiques
                novembre-mars en plaine, septembre-mai en montagne).
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Énergie consommée :</strong> 5-10 % de la consommation totale en hiver.
                Souvent perceptible : variation du bruit + bouffée d’air froid intérieur courte.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Géothermique : pas de dégivrage,</strong> car le sol stable à +10 °C ne gèle
                pas. Avantage majeur en climat froid.
              </li>
            </ul>

            <h2>Inverter : modulation continue de la puissance</h2>
            <p>
              L’ancienne génération de PAC fonctionnait en <strong>tout-ou-rien (ON/OFF)</strong> :
              compresseur à 100 % ou à l’arrêt. Aujourd’hui, presque toutes les PAC sont à
              technologie <strong>Inverter</strong> : modulation continue 30-100 %.
            </p>
            <ul>
              <li>
                <ArrowUp className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>+25-35 % d’économie</strong> vs PAC ON/OFF (ADEME 2024)
              </li>
              <li>
                <ArrowUp className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>±0,5 °C</strong> de stabilité de température (vs ±2 °C en ON/OFF)
              </li>
              <li>
                <ArrowUp className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Bruit réduit</strong> : compresseur ne s’emballe pas brutalement
              </li>
              <li>
                <ArrowUp className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Durée de vie</strong> compresseur prolongée (moins de cycles d’usure)
              </li>
            </ul>

            <h2>Mode rafraîchissement (PAC réversible)</h2>
            <p>
              Une PAC réversible utilise une <strong>vanne 4 voies</strong> qui inverse le sens du
              cycle thermodynamique. En mode froid, l’unité intérieure devient l’évaporateur (capte
              les calories) et l’unité extérieure devient le condenseur (rejette la chaleur).
            </p>
            <ul>
              <li>
                <Snowflake className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>PAC air-air :</strong> climatisation classique, EER 3,0 à 4,0
              </li>
              <li>
                <Snowflake className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>PAC air-eau réversible :</strong> rafraîchissement passif via plancher
                chauffant adapté (eau à 18-20 °C). Confort doux, pas de courants d’air, mais
                puissance limitée vs clim air-air.
              </li>
              <li>
                <Wind className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>PAC géothermique réversible :</strong> géocooling. Le sol absorbe la chaleur
                excédentaire de la maison. Très efficace énergétiquement.
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Quelle PAC pour votre maison ?
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Notre simulateur détermine le type de PAC optimal (air-air, air-eau, géo) selon
                    votre climat, isolation, surface et budget. 3 devis d’artisans RGE QualiPAC sous
                    48h.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/simulateur-aides-renovation"
                      className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                    >
                      Simulateur aides <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                    <Link
                      href="/devis"
                      className="inline-flex items-center gap-1.5 bg-white text-primary-700 border border-primary-200 px-4 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                    >
                      Demander 3 devis <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <PrixComparatif
            title="COP / SCOP 2026 : 5 marques de référence"
            caption="COP mesuré +7 °C / sortie 35 °C selon NF EN 14511. Source : fiches techniques constructeurs, AFPAC."
            withSchema
            rows={[
              {
                brand: 'Daikin',
                model: 'Altherma H Hybrid',
                priceRange: '14 000 – 21 000 €',
                cop: 4.5,
                warranty: '5 ans',
                rating: 4.5,
                notes: 'COP top marché, hybride gaz',
                highlight: true,
              },
              {
                brand: 'Daikin',
                model: 'Altherma 3 H HT',
                priceRange: '12 000 – 18 000 €',
                cop: 4.3,
                warranty: '5 ans',
                rating: 4.5,
                notes: 'Cycle thermo R32, SCOP 4,3',
              },
              {
                brand: 'Mitsubishi Electric',
                model: 'Ecodan PUZ-WM',
                priceRange: '11 500 – 17 500 €',
                cop: 4.2,
                warranty: '5 ans (7 ans auto)',
                rating: 4.5,
                notes: 'Inverter R32, Zubadan -28 °C',
              },
              {
                brand: 'Hitachi',
                model: 'Yutaki S',
                priceRange: '11 000 – 16 500 €',
                cop: 4.1,
                warranty: '5 ans',
                rating: 4.0,
                notes: 'Cycle thermo R32, modulation continue',
              },
              {
                brand: 'Atlantic',
                model: 'Alfea Excellia',
                priceRange: '10 000 – 15 000 €',
                cop: 4.0,
                warranty: '2 – 5 ans',
                rating: 4.0,
                notes: 'Fluide R32, dégivrage par inversion',
              },
            ]}
          />
          <SimulateurAideBox
            serviceKey="pompe-a-chaleur"
            estimatedSaving={5000}
            subtitle="MaPrimeRénov' jusqu'à 5 000 € + CEE BAR-TH-171 ~4 000 €"
          />
          <LocalProviderShowcase
            providers={providers}
            serviceName="chauffagiste RGE QualiPAC"
            cityName=""
            max={3}
          />
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
                    className="flex items-center justify-between gap-2 bg-white border border-sand-200 rounded-lg p-4 hover:border-primary-400 hover:shadow-sm transition-all text-sand-800"
                  >
                    <span className="text-sm font-medium">{g.label}</span>
                    <ArrowRight className="w-4 h-4 text-sand-400 shrink-0" aria-hidden />
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
              href="/renovation-energetique/travaux/pompe-a-chaleur"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Pompe à chaleur
            </Link>
            <Link
              href="/renovation-energetique/travaux/pompe-a-chaleur/installation"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Installation PAC <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
