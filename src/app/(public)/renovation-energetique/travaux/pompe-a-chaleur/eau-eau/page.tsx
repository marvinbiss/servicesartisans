/**
 * Page : /renovation-energetique/travaux/pompe-a-chaleur/eau-eau
 *
 * @kw-primary    pompe a chaleur eau eau
 * @kw-volume     1700
 * @kw-kd         0
 * @kw-cpc        0.55
 * @intent        info
 * @cluster       reno-energetique-pac-eau-eau
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md
 * @snapshot      2026-05-06 (Bloc 1 — quota Ahrefs API restreint, à re-valider 18/05)
 * @backlog-item  Sprint 4 PAC long-tail eau-eau
 *
 * KW cibles (Bloc 1 + estimation longue traîne) :
 * - "pompe a chaleur eau eau"        → 1 700 vol, KD 0 ⭐⭐⭐⭐⭐ MEGA EASY WIN
 * - "pac eau eau"                    → ~400 vol, KD 0
 * - "pompe a chaleur nappe phreatique"→ ~250 vol, KD 1
 * - "pompe a chaleur eau"            → ~200 vol, KD 1
 * - "pac nappe phreatique"           → ~100 vol, KD 0
 * - "puit canadien geothermique"     → ~150 vol, KD 1
 * - Famille cumulée pivot : ~2 800 vol/mois (KD 0-1 = ULTRA EASY WIN)
 *
 * Easy win : OUI ABSOLU (KD 0 sur pivot, niche peu concurrentielle)
 * Cluster pillar : Rénovation Énergétique → Travaux → PAC → Eau-eau
 *
 * Anti-cannibalisation :
 *   - Hub /pompe-a-chaleur/ = comparatif air-air, air-eau, géothermique
 *   - /geothermie/ = sol-eau (sondes verticales/horizontales)
 *   - Cette page = focus EAU-EAU (PAC sur nappe phréatique, prélèvement/restitution
 *     d'eau, COP 5-6, étude hydrogéologique, déclaration DDT/DREAL, niche très
 *     spécifique).
 *
 * E-E-A-T YMYL :
 *   - Code Environnement art. L214-3 (déclaration prélèvement)
 *   - Décret 2008-720 (forage domestique)
 *   - Loi sur l'eau 1992 / 2006
 *   - BRGM (Bureau Recherches Géologiques et Minières — données hydrogéo)
 *   - AFPAC, Qualit'EnR (annuaire QualiPAC mention eau-eau)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Coins,
  Droplets,
  ShieldCheck,
  TrendingUp,
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
import { getBreadcrumbSchema, getFAQSchema, getGovernmentServiceSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { getProvidersByService } from '@/lib/supabase'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/pompe-a-chaleur/eau-eau'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'PAC eau-eau 2026 : nappe phréatique, COP 5-6, prix posée'
const DESCRIPTION =
  'PAC eau-eau 2026 : prélève les calories de la nappe phréatique. COP 5-6, prix 18-30K€ posée, MPR jusqu’à 11 000 €. Déclaration DDT obligatoire.'

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
  'Une PAC eau-eau prélève les calories d’une nappe phréatique (8-12 m de profondeur typique) et les restitue au circuit de chauffage.',
  'COP 5 à 6 — la PAC la PLUS performante (vs 4-5 géothermique sol-eau, 3-4 air-eau). Stable toute l’année car nappe à +10 à +14 °C.',
  'Prix posée 2026 : 18 000 à 30 000 € TTC (PAC + 2 forages 8-12 m + étude hydrogéologique + déclaration DDT).',
  'Aides cumulées MaPrimeRénov’ + CEE jusqu’à 11 000 € (très modestes). Reste à charge minimum ~7 000 €.',
  'Déclaration obligatoire à la DDT/DREAL (article L214-3 Code Environnement) + étude hydrogéologique préalable BRGM.',
  'Conditions terrain : présence d’une nappe à <15 m + débit suffisant + qualité eau (pH 6,5-8, fer < 0,3 mg/L).',
]

const FONCTIONNEMENT = [
  {
    n: 1,
    title: 'Forage de puisage',
    detail:
      'Forage 8 à 12 m de profondeur jusqu’à la nappe phréatique. Pose pompe immergée. Coût : 3 000-5 000 €.',
  },
  {
    n: 2,
    title: 'Prélèvement d’eau',
    detail:
      'L’eau de la nappe (+10 à +14 °C) est pompée vers l’échangeur thermique de la PAC. Débit typique : 2 à 4 m³/h selon puissance.',
  },
  {
    n: 3,
    title: 'Échange thermique',
    detail:
      'Dans l’évaporateur, le fluide frigorigène capte les calories de l’eau. Cycle thermo classique en 4 phases.',
  },
  {
    n: 4,
    title: 'Restitution chauffage',
    detail:
      'La chaleur récupérée chauffe le circuit hydraulique de la maison (radiateurs basse T° ou plancher chauffant) à 35-55 °C.',
  },
  {
    n: 5,
    title: 'Forage de rejet',
    detail:
      'L’eau refroidie (~+5 °C en hiver) est rejetée dans la même nappe via un 2e forage à 10-15 m du puisage. Boucle ouverte.',
  },
]

const COMPARATIF = [
  {
    type: 'PAC eau-eau',
    cop: '5,0 à 6,0',
    stab: 'Très stable (+10 à +14 °C nappe)',
    prix: '18 000 - 30 000 €',
    aides: 'jusqu’à 11 000 €',
    contraintes: 'Nappe < 15 m + déclaration DDT + entretien forage',
  },
  {
    type: 'PAC géothermique sol-eau',
    cop: '4,0 à 5,5',
    stab: 'Stable (sol +5 à +10 °C)',
    prix: '15 000 - 25 000 € (horizontal)',
    aides: 'jusqu’à 11 000 €',
    contraintes: 'Terrain ~2× surface chauffée pour capteurs horizontaux',
  },
  {
    type: 'PAC géothermique sondes',
    cop: '4,0 à 5,5',
    stab: 'Très stable (sol profond +12 °C)',
    prix: '20 000 - 35 000 €',
    aides: 'jusqu’à 11 000 €',
    contraintes: 'Forage 80-120 m + étude géologique',
  },
  {
    type: 'PAC air-eau',
    cop: '3,0 à 4,5',
    stab: 'Variable (-10 à +35 °C ext.)',
    prix: '10 000 - 18 000 €',
    aides: 'jusqu’à 9 000 €',
    contraintes: 'Performance dégradée < -7 °C',
  },
]

const CONTRAINTES = [
  {
    label: 'Présence d’une nappe phréatique',
    detail:
      'Profondeur maximale 15 m, débit ≥ 2 m³/h. Vérification via carte hydrogéologique BRGM (infoterre.brgm.fr) + sondage préalable obligatoire.',
  },
  {
    label: 'Qualité physico-chimique de l’eau',
    detail:
      'pH 6,5 - 8, fer < 0,3 mg/L, manganèse < 0,1 mg/L, sels dissous TDS < 600 mg/L. Eau corrosive ou ferrugineuse → encrassement échangeur (perte 20-40 % rendement en 5 ans).',
  },
  {
    label: 'Déclaration DDT obligatoire',
    detail:
      'Article L214-3 Code Environnement + décret 2008-720 (forage domestique). Délai instruction 2-3 mois. Coût étude : 800-2 000 €.',
  },
  {
    label: 'Distance entre puisage et rejet',
    detail:
      'Minimum 10 m entre les 2 forages pour éviter le court-circuit thermique (eau refroidie réaspirée). Si terrain trop petit → impossible.',
  },
  {
    label: 'Entretien spécifique annuel',
    detail:
      'Vérification pompe immergée + nettoyage filtres + analyse eau annuelle. Coût 300-500 €/an (vs 150-250 € PAC air-eau).',
  },
]

const faqs = [
  {
    question: 'Comment fonctionne une pompe à chaleur eau-eau ?',
    answer:
      'Une PAC eau-eau prélève l’eau d’une nappe phréatique (à 8-12 m de profondeur) via un puits de puisage. Cette eau, à température stable +10 à +14 °C toute l’année, traverse l’échangeur thermique de la PAC qui en extrait les calories pour chauffer la maison (cycle thermodynamique classique 4 phases). L’eau refroidie (~+5 °C) est ensuite rejetée dans la nappe via un 2e puits, à 10-15 m du puisage. C’est un système en boucle ouverte, le plus performant de toutes les PAC.',
  },
  {
    question: 'Quel COP atteint une PAC eau-eau et pourquoi est-elle la plus performante ?',
    answer:
      'COP 5 à 6 (vs 4-5 géothermique sol-eau, 3-4 air-eau). Pour 1 kWh électrique consommé, vous récupérez 5 à 6 kWh de chaleur. Trois raisons : (1) la nappe phréatique a une température STABLE toute l’année (+10 à +14 °C), donc pas de chute de performance en hiver ; (2) l’écart à combler entre source froide (+10 °C) et source chaude (+35 à +45 °C) est minimal ; (3) pas de cycle de dégivrage (vs PAC air-eau).',
  },
  {
    question: 'Combien coûte une PAC eau-eau installée en 2026 ?',
    answer:
      'Entre 18 000 et 30 000 € TTC posée. Décomposition : PAC eau-eau 6-12 kW (5 000-9 000 €) + 2 forages 8-12 m (3 000-5 000 €) + étude hydrogéologique BRGM (800-2 000 €) + raccordement hydraulique (2 000-3 500 €) + main d’œuvre + démarches DDT (1 500-3 000 €). Comptez 6-9 mois entre signature et mise en service (étude + autorisations + livraison + chantier).',
  },
  {
    question: 'Quelles aides en 2026 pour une PAC eau-eau ?',
    answer:
      'MaPrimeRénov’ par geste : 5 000 à 11 000 € selon revenus (barèmes bleu/jaune/violet/rose, identiques au géothermique). Coup de pouce CEE chauffage : 4 000 €. Cumul max 11 000 € pour ménage très modeste. TVA 5,5 % automatique avec artisan RGE QualiPAC mention eau-eau. Éco-PTZ jusqu’à 15 000 € sans intérêts. Reste à charge ménage très modeste : 7 000-12 000 € après aides.',
  },
  {
    question: 'Quelles sont les conditions pour installer une PAC eau-eau ?',
    answer:
      'Trois conditions cumulatives : (1) PRÉSENCE d’une nappe phréatique à < 15 m de profondeur, débit ≥ 2 m³/h (vérification BRGM infoterre.brgm.fr + sondage préalable) ; (2) QUALITÉ de l’eau : pH 6,5-8, fer < 0,3 mg/L, manganèse < 0,1 mg/L (sinon encrassement échangeur) ; (3) DISTANCE ≥ 10 m entre puits puisage et rejet (sinon court-circuit thermique). Si l’une de ces conditions n’est pas remplie → impossible techniquement.',
  },
  {
    question: 'Quelles démarches administratives pour une PAC eau-eau ?',
    answer:
      'Déclaration obligatoire à la DDT (Direction Départementale des Territoires) au titre de l’article L214-3 du Code de l’Environnement et du décret 2008-720 (forage domestique). Délai d’instruction 2-3 mois. L’étude hydrogéologique préalable (800-2 000 €) doit prouver le respect de la qualité de la nappe. Pour les prélèvements > 1 000 m³/an, autorisation préfectorale (rare en résidentiel). Pour les forages : obligation déclaration mairie (article L411-1 Code minier).',
  },
  {
    question: 'PAC eau-eau ou PAC géothermique sol-eau : laquelle choisir ?',
    answer:
      'PAC eau-eau si : (1) nappe phréatique présente à <15 m sous votre terrain ; (2) terrain trop petit pour capteurs horizontaux (>2× surface chauffée) ; (3) recherche de la performance maximale (COP 5-6). PAC géothermique sol-eau si : (1) nappe trop profonde ou absente ; (2) grand terrain disponible (capteurs horizontaux) ; (3) eau de mauvaise qualité (encrassement). Étude hydrogéologique BRGM = première étape obligatoire pour trancher.',
  },
  {
    question: 'Quelle est la durée de vie d’une PAC eau-eau ?',
    answer:
      'PAC : 18-25 ans (compresseur changé à 12-15 ans, ~3 000 €). Forages : 30-50 ans avec entretien annuel. Pompe immergée : 8-12 ans (~800-1 500 € de remplacement). Le maillon faible est l’encrassement de l’échangeur si l’eau contient fer/manganèse — passage en boucle fermée intermédiaire ou nettoyage acide tous les 3-5 ans (300-600 €). Globalement c’est la PAC la plus durable.',
  },
]

const sources = [
  {
    label: 'BRGM — Carte hydrogéologique InfoTerre',
    url: 'https://infoterre.brgm.fr',
  },
  {
    label: 'Légifrance — Code Environnement art. L214-3 (prélèvement)',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000033033017',
  },
  {
    label: 'Légifrance — Décret 2008-720 (forage domestique)',
    url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000019204470',
  },
  {
    label: 'AFPAC — Pompes à chaleur géothermiques',
    url: 'https://www.afpac.org',
  },
  {
    label: 'Qualit’EnR — Annuaire QualiPAC mention eau-eau',
    url: 'https://www.qualit-enr.org',
  },
  {
    label: 'France Rénov’ — MaPrimeRénov’ géothermie',
    url: 'https://france-renov.gouv.fr/aides',
  },
]

const relatedPages = [
  {
    label: 'Hub Pompe à chaleur (3 types comparés)',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
  },
  {
    label: 'PAC géothermique (sol-eau, sondes)',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/geothermie',
  },
  {
    label: 'Fonctionnement PAC : cycle thermo 4 phases',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/fonctionnement',
  },
  {
    label: 'Installation PAC : 8 étapes + RGE',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/installation',
  },
  {
    label: 'PAC air-eau prix 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix',
  },
  {
    label: 'Trouver un chauffagiste RGE QualiPAC',
    href: '/rge/chauffagiste',
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
    section: 'Travaux — PAC — Eau-eau',
    keywords: [
      'pompe à chaleur eau eau',
      'PAC eau-eau',
      'PAC nappe phréatique',
      'PAC sur puits',
      'COP 5 6 PAC',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Pompe à chaleur', url: '/renovation-energetique/travaux/pompe-a-chaleur' },
    { name: 'Eau-eau', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'PAC eau-eau : déclaration prélèvement et aides 2026',
    description:
      'PAC eau-eau sur nappe phréatique : déclaration DDT obligatoire (L214-3 Code Env.) + aides MaPrimeRénov’ jusqu’à 11 000 € + Coup de pouce CEE 4 000 € + TVA 5,5 %.',
    url: PAGE_URL,
    serviceType: 'Subvention publique installation PAC géothermique eau-eau',
    audience: 'Propriétaires occupants en zone à nappe accessible',
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
              { label: 'Pompe à chaleur', href: '/renovation-energetique/travaux/pompe-a-chaleur' },
              { label: 'Eau-eau' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Droplets className="w-3.5 h-3.5" aria-hidden />
              PAC eau-eau &middot; Nappe phréatique
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Pompe à chaleur eau-eau (sur nappe phréatique)
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              La PAC eau-eau est <strong>la plus performante</strong> de toutes les pompes à chaleur
              (COP 5 à 6) car elle prélève les calories d’une <strong>nappe phréatique</strong>{' '}
              stable à +10 à +14 °C toute l’année. Voici son fonctionnement, ses contraintes
              terrain, le prix posée 2026 et les démarches DDT obligatoires.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Fonctionnement en 5 étapes (boucle ouverte)</h2>
            <p>
              Le système prélève l’eau d’une nappe via un premier forage, en extrait les calories,
              puis rejette l’eau refroidie dans la même nappe via un second forage. Boucle ouverte
              continue, débit 2-4 m³/h.
            </p>

            <div className="not-prose grid gap-3 my-6">
              {FONCTIONNEMENT.map((step) => (
                <div
                  key={step.n}
                  className="bg-white border border-sand-200 rounded-lg p-4 flex items-start gap-4"
                >
                  <div className="bg-primary-100 text-primary-800 font-heading text-lg font-bold w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                    {step.n}
                  </div>
                  <div className="flex-1">
                    <p className="font-heading text-base font-semibold text-sand-900 m-0">
                      {step.title}
                    </p>
                    <p className="text-sm text-sand-700 m-0 mt-1">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2>Comparatif eau-eau vs autres PAC</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Type</th>
                    <th className="p-3 border-b border-sand-200">COP</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Stabilité</th>
                    <th className="p-3 border-b border-sand-200">Prix</th>
                    <th className="p-3 border-b border-sand-200">Aides max</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {COMPARATIF.map((row) => (
                    <tr key={row.type} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.type}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.cop}
                      </td>
                      <td className="p-3 text-sand-700 hidden md:table-cell">{row.stab}</td>
                      <td className="p-3 whitespace-nowrap">{row.prix}</td>
                      <td className="p-3 whitespace-nowrap">{row.aides}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Prix 2026 indicatifs maison 100-150 m². Aides cumulées MaPrimeRénov’ + Coup de pouce
                CEE selon revenus. Sources : ADEME, AFPAC.
              </p>
            </div>

            <h2>Conditions terrain obligatoires</h2>
            <p>
              La PAC eau-eau ne s’installe pas partout. Voici les <strong>5 conditions</strong> à
              vérifier AVANT d’engager des frais d’étude :
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6">
              <ul className="divide-y divide-sand-100">
                {CONTRAINTES.map((row) => (
                  <li key={row.label} className="p-4 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-primary-700 shrink-0 mt-0.5" aria-hidden />
                    <div>
                      <p className="font-semibold text-sand-900 m-0">{row.label}</p>
                      <p className="text-sm text-sand-700 m-0 mt-1">{row.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <h2>Prix détaillé d’une PAC eau-eau 2026</h2>
            <ul>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>PAC eau-eau 6-12 kW :</strong> 5 000 - 9 000 € TTC (équipement seul)
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>2 forages 8-12 m :</strong> 3 000 - 5 000 € TTC (selon nature sol)
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Étude hydrogéologique BRGM :</strong> 800 - 2 000 € TTC (obligatoire)
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Raccordement hydraulique :</strong> 2 000 - 3 500 € TTC (intérieur maison)
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Démarches DDT + main d’œuvre pose :</strong> 1 500 - 3 000 € TTC
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Prix total :</strong> <strong>18 000 à 30 000 € TTC posée.</strong>
              </li>
            </ul>

            <h2>Aides 2026 pour PAC eau-eau</h2>
            <ul>
              <li>
                <TrendingUp className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>MaPrimeRénov’</strong> par geste : 5 000 € (très modestes), 4 000 €
                (modestes), 3 000 € (intermédiaires), 0 € (supérieurs). Bonus +6 000 € pour
                géothermie très modestes (cumul total max 11 000 €).
              </li>
              <li>
                <TrendingUp className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Coup de pouce CEE</strong> chauffage : 4 000 € (très modestes), 2 500 €
                (autres ménages).
              </li>
              <li>
                <TrendingUp className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>TVA 5,5 %</strong> automatique avec artisan RGE QualiPAC (économie ~14 % vs
                TVA 20 %).
              </li>
              <li>
                <TrendingUp className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Éco-PTZ</strong> sans intérêts jusqu’à 15 000 € pour le reste à charge.
              </li>
            </ul>

            <div className="not-prose border-2 border-amber-200 bg-amber-50 rounded-lg p-5 my-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-semibold text-amber-900 m-0">
                    Première étape : étude hydrogéologique BRGM
                  </p>
                  <p className="text-sm text-amber-900 mt-2 mb-0">
                    AVANT de signer le moindre devis, faites réaliser une étude hydrogéologique
                    (800-2 000 €) qui vérifie la présence et la qualité de la nappe sous votre
                    terrain. Sans nappe accessible, la PAC eau-eau est impossible. Consultez aussi
                    la carte BRGM InfoTerre (gratuite) pour un premier diagnostic.
                  </p>
                </div>
              </div>
            </div>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Étude faisabilité PAC eau-eau gratuite
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    3 artisans RGE QualiPAC mention eau-eau vérifiés évaluent la faisabilité de
                    votre projet et détaillent les aides 2026 mobilisables. Devis gratuits sous 48h.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/simulateur-aides-renovation"
                      className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
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

            <h2>Vérifier la conformité après installation</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Récépissé déclaration DDT</strong> + arrêté préfectoral le cas échéant
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Rapport hydrogéologique signé bureau d’études</strong> certifié
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>PV mise en service PAC</strong> + COP réel mesuré
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Attestation RGE QualiPAC mention eau-eau</strong> de l’artisan
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Analyse eau initiale</strong> (pH, fer, manganèse, TDS) à conserver comme
                référence
              </li>
            </ul>
          </article>

          <PrixComparatif
            title="PAC eau-eau & sol-eau 2026 : 5 marques compatibles"
            caption="Prix hors forages (compter 5-10 K€ supplémentaires). PAC eau-eau exige module géothermique compatible. Source : constructeurs, AFPAC, Qualit'EnR."
            withSchema
            rows={[
              {
                brand: 'Daikin',
                model: 'Altherma 3 GEO',
                priceRange: '14 000 – 21 000 €',
                cop: 4.5,
                warranty: '5 ans',
                rating: 4.5,
                notes: 'COP top, module sol-eau/eau-eau',
                highlight: true,
              },
              {
                brand: 'Mitsubishi Electric',
                model: 'Ecodan eau-eau',
                priceRange: '11 500 – 17 500 €',
                cop: 4.2,
                warranty: '5 ans (7 ans auto)',
                rating: 4.5,
                notes: 'Garantie 7 ans, fiable nappe profonde',
              },
              {
                brand: 'Atlantic',
                model: 'Alfea Excellia GEO',
                priceRange: '10 000 – 15 000 €',
                cop: 4.0,
                warranty: '2 – 5 ans',
                rating: 4.0,
                notes: 'Fabrication France, prix entrée',
              },
              {
                brand: 'Hitachi',
                model: 'Yutaki S Combi GEO',
                priceRange: '11 000 – 16 500 €',
                cop: 4.1,
                warranty: '5 ans',
                rating: 4.0,
                notes: 'Bi-bloc géothermique compact',
              },
              {
                brand: 'Daikin',
                model: 'Altherma H Hybrid',
                priceRange: '14 000 – 21 000 €',
                cop: 4.5,
                warranty: '5 ans',
                rating: 4.5,
                notes: 'Hybride si forage non viable',
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
              href="/renovation-energetique/travaux/pompe-a-chaleur/geothermie"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              PAC géothermique sol-eau <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
