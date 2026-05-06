/**
 * Page : /renovation-energetique/travaux/isolation/combles
 *
 * @kw-primary    isolation combles
 * @kw-volume     4080
 * @kw-kd         5
 * @kw-cpc        1.20
 * @intent        commercial
 * @cluster       reno-energetique-isolation-combles
 * @ahrefs-source api-live
 * @snapshot      2026-05-06
 * @backlog-item  Sprint 2 ISO combles JACKPOT 10876 vol cumulé
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "isolation combles"           → 4 080 vol, KD 5, CPC $1,20, clicks 5 151 ⭐⭐⭐
 * - "isolation des combles"       → 4 054 vol, KD 6, CPC $1,20 (variant)
 * - "isolation combles perdus"    → 2 121 vol, KD 2, CPC $1,10 ⭐⭐
 * - "isolation combles soufflage" → 298 vol, KD 1, CPC $1,10
 * - "isolation combles 1 euro"    → 117 vol, KD 2 (à debunker)
 * - "isolation combles prix"      → 86 vol, KD 0
 * - "isolation combles amenages"  → 80 vol, KD 7
 * - "isolation combles aides"     → 40 vol, KD 6
 * - Famille cumulée pivot : ~10 876 vol/mois
 *
 * Source : audit Ahrefs API live. Easy win MASSIF (KD 1-5 sur 10K vol cumulé).
 * Easy win : OUI ABSOLU (KW pivot KD 5 vol > 4 000, CPC commercial fort)
 * Cluster pillar : Rénovation Énergétique → Travaux → Isolation → Combles
 *
 * Anti-cannibalisation :
 *   - Source guide /guides/prix-isolation-combles-100m2 (312 lignes étude cas chiffrée)
 *   - Source guide /guides/isolation-combles (variant guide)
 *   - Cette page = HUB combles (techniques + prix + aides + RGE + 1€ debunk)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Home,
  Wind,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Calculator,
  Layers,
  Snowflake,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema, getFinancialProductSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/isolation/combles'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'sophie-martin'
const AUTHOR_NAME = 'Sophie Martin'

const TITLE = 'Isolation combles 2026 : prix au m²'
const DESCRIPTION =
  'Isolation combles 2026 : 15-50 €/m² posée selon technique (soufflage, déroulé, sarking). Aides MPR + CEE jusquà 37 €/m². Combles perdus vs aménagés.'

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

const TECHNIQUES = [
  {
    name: 'Soufflage (combles perdus)',
    icon: Wind,
    prix: '15 à 25 €/m² posé',
    matiere: 'Laine de verre, laine de roche, ouate de cellulose, fibre de bois',
    duree: '½ journée pour 100 m²',
    avantages: 'Rapide, économique, couvre 100 % des recoins, aucun découpe ni ajustement',
    inconvenients: 'Combles devenus inaccessibles (rangement perdu)',
    rge: 'Qualibat 7131',
  },
  {
    name: 'Déroulé (combles perdus accessibles)',
    icon: Layers,
    prix: '20 à 35 €/m² posé',
    matiere: 'Rouleaux laine de verre ou roche (parfois 2 couches croisées)',
    duree: '1 journée pour 100 m²',
    avantages: 'Combles restent accessibles (rangement préservé), maîtrise épaisseur',
    inconvenients: 'Plus cher que le soufflage, ponts thermiques aux jonctions possibles',
    rge: 'Qualibat 7131',
  },
  {
    name: 'Sarking (combles aménagés - rampants)',
    icon: Home,
    prix: '120 à 200 €/m² posé',
    matiere: 'Panneaux rigides PUR/PIR ou fibre de bois sur chevrons',
    duree: '1 semaine + ravoir charpente',
    avantages: 'Performance maximale, élimine ponts thermiques, conserve volume habitable',
    inconvenients: 'Refonte couverture nécessaire, coût élevé, surélévation toiture 8-15 cm',
    rge: 'Qualibat 7141',
  },
  {
    name: 'Isolation rampants par l’intérieur',
    icon: Snowflake,
    prix: '40 à 80 €/m² posé',
    matiere: 'Laine entre chevrons + sous-face + parement BA13',
    duree: '3-5 jours pour 80 m²',
    avantages: 'Pas de modification couverture, coût modéré',
    inconvenients:
      'Perte 15-25 cm hauteur, ponts thermiques aux jonctions, étanchéité air délicate',
    rge: 'Qualibat 7141',
  },
]

const AIDES_BAREME = [
  { profil: 'Très modestes (bleu)', mpr: '25 €/m²', cee: '12 €/m²', cumul: '37 €/m²' },
  { profil: 'Modestes (jaune)', mpr: '20 €/m²', cee: '12 €/m²', cumul: '32 €/m²' },
  { profil: 'Intermédiaires (violet)', mpr: '15 €/m²', cee: '11 €/m²', cumul: '26 €/m²' },
  { profil: 'Supérieurs (rose)', mpr: '7 €/m²', cee: '11 €/m²', cumul: '18 €/m²' },
]

const tldr = [
  'Isolation des combles 2026 : 15-50 €/m² posée selon technique (soufflage, déroulé, sarking, par l’intérieur).',
  'C’est le poste de rénovation le plus rentable : 30 % des déperditions thermiques, ROI 3-5 ans.',
  'Aides cumulables jusqu’à 37 €/m² (très modestes) : MaPrimeRénov’ + Coup de pouce CEE Isolation.',
  'Artisan RGE Qualibat obligatoire : mention 7131 (combles perdus) ou 7141 (combles aménagés).',
  'Performance R ≥ 7 m².K/W obligatoire pour les aides (combles perdus), R ≥ 6 (aménagés).',
]

const faqs = [
  {
    question: 'Quel est le prix de l’isolation des combles en 2026 ?',
    answer:
      'Pour des combles perdus en soufflage (le cas le plus fréquent) : 15-25 €/m² TTC posé. En déroulé : 20-35 €/m². Pour des combles aménagés : sarking 120-200 €/m² (par l’extérieur) ou rampants par l’intérieur 40-80 €/m². Une maison 100 m² avec 80 m² de combles à isoler : 1 200-2 000 € en soufflage, 9 600-16 000 € en sarking complet.',
  },
  {
    question: 'Combles perdus ou combles aménagés : quelle différence ?',
    answer:
      'Les combles perdus sont des combles non habitables (souvent triangle de toiture sous chevrons), où l’on isole le plancher du grenier. Solution la plus économique : soufflage ou déroulé sur le plancher (15-35 €/m²). Les combles aménagés sont habitables (chambre, bureau) : il faut isoler les rampants (sous toiture). Solutions plus coûteuses : sarking par l’extérieur (120-200 €/m²) ou rampants par l’intérieur (40-80 €/m²).',
  },
  {
    question: 'Quelle technique d’isolation des combles choisir ?',
    answer:
      'Combles perdus avec accès difficile : soufflage (rapide, économique, couvre tout). Combles perdus accessibles avec besoin de rangement : déroulé. Combles aménagés en rénovation lourde avec couverture refaite : sarking (performance max). Combles aménagés sans toucher la couverture : rampants par l’intérieur (compromis prix/performance).',
  },
  {
    question: 'Quels matériaux isolants pour les combles ?',
    answer:
      'Laine de verre (le plus fréquent, économique 7-12 €/m²), laine de roche (idéale acoustique + résistance feu), ouate de cellulose (écologique, soufflée), fibre de bois (biosourcée, R/épaisseur intéressant), polyuréthane PUR/PIR (performance max par épaisseur, pour sarking ou rampants intérieurs). Tous certifiés ACERMI sont éligibles aux aides.',
  },
  {
    question: 'Combles à 1 € : ça existe encore en 2026 ?',
    answer:
      'Non. L’opération « combles à 1 € » a été supprimée en juillet 2021 suite aux scandales d’éco-démarchage frauduleux. Toute offre « combles à 1 € » en 2026 est une arnaque (travaux bâclés, isolant tassé, factures gonflées pour récupérer les aides au-delà du juste prix). La DGCCRF poursuit ces fraudes. En revanche, le Coup de pouce CEE Isolation reste actif et peut couvrir 60-90 % du coût pour les très modestes.',
  },
  {
    question: 'Quel coefficient R pour les aides combles 2026 ?',
    answer:
      'Pour MaPrimeRénov’ et Coup de pouce CEE : R ≥ 7 m².K/W pour combles perdus (équivaut à 30 cm de laine de verre). R ≥ 6 m².K/W pour combles aménagés / rampants (équivaut à 24 cm de laine entre chevrons). Sans atteindre ces seuils, les aides sont refusées. Vérifier sur le devis : la mention R en m².K/W est obligatoire.',
  },
  {
    question: 'Combien d’aides cumulables sur l’isolation des combles ?',
    answer:
      'Pour très modestes (bleu) : MaPrimeRénov’ 25 €/m² + Coup de pouce CEE 12 €/m² = 37 €/m². Sur 80 m² de combles à 25 €/m² (soufflage) = 2 000 € de devis, vous récupérez 2 960 € d’aides… soit reste à charge négatif. C’est le poste où l’on peut être quasi-gratuit pour les très modestes (mais pas « 1 € » avec arnaque). Pour intermédiaires/supérieurs : reste à charge 30-60 % du devis.',
  },
  {
    question: 'Quelle qualification RGE pour mon artisan combles ?',
    answer:
      'Qualibat 7131 pour les combles perdus (soufflage, déroulé). Qualibat 7141 pour les combles aménagés (sarking, rampants par l’intérieur). Vérification gratuite sur qualibat.com avec le SIRET. Sans qualification RGE en cours de validité à la date de signature, vous perdez MaPrimeRénov’, CEE et TVA 5,5 % (soit 30-50 % du coût en plus).',
  },
]

const sources = [
  {
    label: 'France Rénov’ — Aides isolation combles',
    url: 'https://france-renov.gouv.fr/aides/maprimerenov',
  },
  { label: 'ADEME — Guide isolation combles', url: 'https://agir.ademe.fr' },
  { label: 'ACERMI — Certification isolants', url: 'https://www.acermi.com' },
  { label: 'Qualibat — Annuaire 7131/7141', url: 'https://www.qualibat.com' },
  { label: 'DGCCRF — Liste noire éco-démarchage', url: 'https://www.economie.gouv.fr/dgccrf' },
]

const relatedPages = [
  {
    label: 'Hub isolation thermique (3 types comparés)',
    href: '/renovation-energetique/travaux/isolation',
  },
  {
    label: 'Prix isolation combles 100 m² (étude de cas)',
    href: '/guides/prix-isolation-combles-100m2',
  },
  {
    label: 'Guide isolation combles complet',
    href: '/guides/isolation-combles',
  },
  {
    label: 'ITE isolation par l’extérieur',
    href: '/renovation-energetique/travaux/isolation/exterieure-ite',
  },
  {
    label: 'Qualibat 7131/7141 : label RGE isolation',
    href: '/rge/labels/qualibat',
  },
  {
    label: 'Trouver un artisan combles RGE',
    href: '/rge/renovation-energetique',
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
    section: 'Travaux — Isolation — Combles',
    keywords: [
      'isolation combles',
      'isolation des combles',
      'isolation combles perdus',
      'isolation combles aménagés',
      'isolation combles soufflage',
      'isolation combles prix',
      'aides isolation combles',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Isolation', url: '/renovation-energetique/travaux/isolation' },
    { name: 'Combles', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const financialSchema = getFinancialProductSchema({
    name: 'Aides isolation combles 2026',
    description:
      'Cumul MaPrimeRénov’ par geste + Coup de pouce CEE Isolation pour l’isolation des combles perdus ou aménagés par un artisan RGE Qualibat 7131/7141.',
    url: PAGE_URL,
    category: 'Government Grant',
    amount: 'Jusqu’à 37 €/m² (cumul MPR + CEE) selon revenus',
  })
  const schemas = [articleSchema, breadcrumbSchema, faqSchema, financialSchema].filter(
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
              { label: 'Isolation', href: '/renovation-energetique/travaux/isolation' },
              { label: 'Combles' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Home className="w-3.5 h-3.5" aria-hidden />
              Isolation &middot; Combles
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Isolation des combles 2026 : prix, techniques et aides
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              L’<strong>isolation des combles</strong> est le poste de rénovation énergétique le
              plus rentable en 2026 : 30 % des déperditions thermiques passent par la toiture. Selon
              la technique (soufflage, déroulé, sarking, rampants par l’intérieur), comptez entre{' '}
              <strong>15 et 200 €/m²</strong> posée. Aides MaPrimeRénov’ + CEE jusqu’à 37 €/m² (très
              modestes), reste à charge souvent inférieur à 30 % du devis.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Combles perdus vs combles aménagés</h2>
            <p>
              <strong>Combles perdus</strong> = combles non habitables (souvent sous toiture en
              triangle, sous chevrons, hauteur insuffisante &lt; 1,80 m). On isole le plancher du
              grenier, sans toucher à la toiture. Solutions économiques.
            </p>
            <p>
              <strong>Combles aménagés</strong> = combles habitables (chambre, bureau, salle de
              jeux). On isole les rampants (sous toiture). Soit par l’extérieur (sarking, plus
              performant), soit par l’intérieur (entre chevrons, plus économique).
            </p>

            <h2 id="techniques">Les 4 techniques d’isolation des combles</h2>
            <div className="not-prose grid gap-4 my-6">
              {TECHNIQUES.map((t) => {
                const Icon = t.icon
                return (
                  <div key={t.name} className="bg-white border border-sand-200 rounded-xl p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-700 grid place-items-center shrink-0">
                        <Icon className="w-5 h-5" aria-hidden />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading text-lg font-semibold text-sand-900 m-0">
                          {t.name}
                        </h3>
                        <p className="text-sm font-semibold text-primary-700 m-0 mt-1">{t.prix}</p>
                      </div>
                    </div>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="font-semibold text-sand-700">Matière</dt>
                        <dd className="m-0 text-sand-900">{t.matiere}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-sand-700">Durée chantier</dt>
                        <dd className="m-0 text-sand-900">{t.duree}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-sand-700">Avantages</dt>
                        <dd className="m-0 text-sand-900">{t.avantages}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-sand-700">Limites</dt>
                        <dd className="m-0 text-sand-900">{t.inconvenients}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-sand-700">Qualif. RGE</dt>
                        <dd className="m-0 text-sand-900">{t.rge}</dd>
                      </div>
                    </dl>
                  </div>
                )
              })}
            </div>

            <h2 id="aides">Aides 2026 : combien récupérer</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Profil revenus</th>
                    <th className="p-3 border-b border-sand-200">MaPrimeRénov’</th>
                    <th className="p-3 border-b border-sand-200">Coup de pouce CEE</th>
                    <th className="p-3 border-b border-sand-200">Cumul</th>
                  </tr>
                </thead>
                <tbody>
                  {AIDES_BAREME.map((row) => (
                    <tr key={row.profil} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{row.profil}</td>
                      <td className="p-3">{row.mpr}</td>
                      <td className="p-3">{row.cee}</td>
                      <td className="p-3 font-semibold text-primary-800">{row.cumul}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Montants combles perdus 2026. Combles aménagés : barèmes équivalents. Vérifier sur
                france-renov.gouv.fr selon situation.
              </p>
            </div>

            <h2 id="performance">Performance R minimum pour les aides</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>R ≥ 7 m².K/W</strong> pour combles perdus (≈ 30 cm laine de verre)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>R ≥ 6 m².K/W</strong> pour combles aménagés / rampants (≈ 24 cm laine entre
                chevrons)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Sans atteindre ces seuils : aides refusées
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Mention R en m².K/W obligatoire sur le devis
              </li>
            </ul>

            <div className="not-prose border-2 border-red-200 bg-red-50 rounded-lg p-5 my-6">
              <div className="flex items-start gap-3">
                <XCircle className="w-6 h-6 text-red-700 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-semibold text-red-900 m-0">
                    « Combles à 1 € » : arnaque en 2026
                  </p>
                  <p className="text-sm text-red-900 mt-2 mb-0">
                    L’opération « combles à 1 € » a été supprimée en juillet 2021. Toute offre « à 1
                    € » en 2026 cache : soit isolant tassé sans atteindre R ≥ 7 (aides perdues),
                    soit factures gonflées (fraude aux aides), soit reste à charge caché en
                    post-installation. La DGCCRF publie chaque année une liste noire des
                    éco-démarcheurs frauduleux.
                  </p>
                </div>
              </div>
            </div>

            <h2 id="rge">RGE Qualibat obligatoire</h2>
            <p>
              Pour bénéficier de MaPrimeRénov’, du Coup de pouce CEE et de la TVA 5,5 %, l’artisan
              doit être titulaire d’une qualification{' '}
              <Link href="/rge/labels/qualibat">Qualibat RGE</Link> :
            </p>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Qualibat 7131</strong> : isolation des combles perdus (soufflage, déroulé)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Qualibat 7141</strong> : isolation des combles aménagés (sarking, rampants)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Vérification gratuite en 30 secondes sur qualibat.com
              </li>
            </ul>

            <h2 id="economies">Économies sur la facture chauffage</h2>
            <p>Combles correctement isolés (R ≥ 7 m².K/W) sur une maison non isolée :</p>
            <ul>
              <li>Maison 100 m² chauffée gaz : -400 à -600 €/an de gaz</li>
              <li>Maison 100 m² chauffée fioul : -500 à -800 €/an de fioul</li>
              <li>Maison 100 m² chauffée électrique : -350 à -550 €/an d’électricité</li>
              <li>ROI typique : 3-5 ans avec aides cumulées</li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Demandez 3 devis isolation combles
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    3 artisans Qualibat 7131/7141 vérifiés vous répondent sous 48h. Devis détaillé +
                    simulation MaPrimeRénov’ + CEE incluse.
                  </p>
                  <Link
                    href="/devis"
                    className="inline-flex items-center gap-1.5 bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                  >
                    Demander 3 devis <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </div>
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
              href="/renovation-energetique/travaux/isolation"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Isolation
            </Link>
            <Link
              href="/renovation-energetique/travaux/isolation/exterieure-ite"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ITE par l’extérieur → <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
