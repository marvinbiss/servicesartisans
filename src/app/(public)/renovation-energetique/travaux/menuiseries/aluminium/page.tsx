/**
 * Page : /renovation-energetique/travaux/menuiseries/aluminium
 *
 * @kw-primary    menuiserie aluminium
 * @kw-volume     3500
 * @kw-kd         6
 * @kw-cpc        1.20
 * @intent        info-buy
 * @cluster       reno-energetique-menuiseries-aluminium
 * @ahrefs-source docs/ahrefs-audit-2026-05/SNAPSHOT-AUDIT-AHREFS-RENOVATION-2026-05-06.md (P0 #13)
 * @snapshot      2026-05-06 (Bloc 1 — quota Ahrefs API restreint, à re-valider 18/05)
 * @backlog-item  P0 ABSENT Bloc 1 — menuiserie aluminium (cluster menuiseries niche transactionnelle)
 *
 * KW cibles (Bloc 1 + estimation longue traîne) :
 * - "menuiserie aluminium"             → ~3 500 vol, KD 6 ⭐⭐⭐⭐ PIVOT
 * - "fenetre aluminium"                → ~9 800 vol, KD 21 (head term — concurrence forte)
 * - "porte fenetre aluminium"          → ~1 500 vol, KD 8
 * - "baie vitrée aluminium"            → ~3 200 vol, KD 12 (variant)
 * - "menuiserie alu prix"              → ~600 vol, KD 4
 * - "menuiserie aluminium sur mesure"  → ~400 vol, KD 7
 * - "rupture pont thermique aluminium" → ~250 vol, KD 3 (technique)
 * - Famille cumulée pivot accessible : ~6 200 vol/mois (KD ≤ 12, pivot KD 6 = focus)
 *
 * Easy win : MOYEN (KD 6 sur pivot, intent info-buy = haute conversion).
 * Concurrence : Tryba, Komilfo, Solabaie, Lapeyre. SA atout : focus rupture pont
 * thermique (RPT) Uw ≤ 1,3 W/m².K + comparatif PVC/alu/bois + aides MPR.
 *
 * Anti-cannibalisation :
 *   - Hub /menuiseries/ = panorama types (fenêtres, portes, baies)
 *   - /fenetre-de-toit/ = type spécifique (Velux)
 *   - Cette page = focus matériau ALUMINIUM (avantages/inconvénients/RPT/prix par
 *     ouverture/aides). Distinct du hub (matériaux comparés brièvement).
 *
 * E-E-A-T : ADEME, AFNOR (NF EN 14351-1), Qualibat 6361, France Rénov',
 *           Cetim (Centre technique mécanique), Centre Scientifique Bâtiment (CSTB).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calculator, ShieldCheck, TrendingUp } from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/menuiseries/aluminium'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'marc-lefebvre'
const AUTHOR_NAME = 'Marc Lefebvre'

const TITLE = 'Menuiserie aluminium 2026 : prix, RPT, aides MaPrimeRénov’'
const DESCRIPTION =
  'Menuiserie aluminium 2026 : 800-1 800 €/fenêtre posée. Rupture pont thermique RPT obligatoire (Uw ≤ 1,3 W/m².K), Sw, profilés. Aides MaPrimeRénov’ + CEE. Comparatif PVC / alu / bois.'

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
  'Menuiserie aluminium 2026 : matériau premium pour grandes ouvertures + esthétique contemporaine. Prix 800-1 800 €/fenêtre posée selon dimension et profilé.',
  'Rupture de pont thermique (RPT) OBLIGATOIRE : barrette polyamide insère un isolant entre profilés intérieur/extérieur (Uw ≤ 1,3 W/m².K).',
  'Avantages alu : finesse profilés (vitrage 70-80 % vs 60 % PVC), grandes baies > 2 m possibles, durabilité 40-50 ans, recyclable 100 %.',
  'Inconvénients : 30-50 % plus cher que PVC, conductivité thermique brute 1 000× plus haute (mais RPT compense).',
  'Aides 2026 : MaPrimeRénov’ 80-120 €/m² + CEE 35-100 €/m² (selon revenus) si Uw ≤ 1,3 W/m².K + RGE Qualibat 6361.',
  'TVA 5,5 % travaux RGE + éco-PTZ 50 K€ + bonus territoires (Île-de-France, Bordeaux). Total moyen 30-50 % du devis HT couvert.',
]

const COMPARATIF = [
  {
    materiau: 'Aluminium RPT',
    uw: '1,1 - 1,4 W/m².K',
    prix: '800 - 1 800 €/fenêtre',
    duree: '40-50 ans',
    avantages: 'Finesse profilés, grandes ouvertures, esthétique moderne, recyclable 100 %.',
    inconvenients: 'Cher (+30-50 % vs PVC). Sans RPT, pont thermique catastrophique.',
  },
  {
    materiau: 'PVC',
    uw: '1,1 - 1,4 W/m².K',
    prix: '500 - 1 000 €/fenêtre',
    duree: '25-30 ans',
    avantages: 'Économique, isolant naturel, sans entretien, large gamme couleurs.',
    inconvenients:
      'Profilés épais (vitrage 60 %), grandes ouvertures > 2 m limitées, vieillissement UV.',
  },
  {
    materiau: 'Bois',
    uw: '1,2 - 1,6 W/m².K',
    prix: '900 - 2 200 €/fenêtre',
    duree: '40-60 ans (entretien)',
    avantages: 'Esthétique chaude, écologique, bonne isolation phonique.',
    inconvenients: 'Entretien lasure tous les 5-7 ans (~ 100-300 €). Sensible humidité.',
  },
  {
    materiau: 'Mixte bois-alu',
    uw: '1,0 - 1,3 W/m².K',
    prix: '1 200 - 2 800 €/fenêtre',
    duree: '50+ ans',
    avantages: 'Bois côté intérieur (esthétique) + alu côté extérieur (sans entretien).',
    inconvenients: 'Le plus cher. Niche premium / rénovation patrimoniale.',
  },
]

const PRIX_PAR_OUVERTURE = [
  { type: 'Fenêtre 1 vantail (60 × 100 cm)', prix: '800 - 1 200 €', pose: '150-250 €' },
  { type: 'Fenêtre 2 vantaux (120 × 100 cm)', prix: '1 100 - 1 800 €', pose: '200-350 €' },
  { type: 'Porte-fenêtre 2 vantaux (140 × 215 cm)', prix: '1 800 - 2 800 €', pose: '300-500 €' },
  { type: 'Baie coulissante 2 vantaux (240 × 215 cm)', prix: '2 800 - 4 500 €', pose: '400-700 €' },
  {
    type: 'Baie vitrée galandage 3 vantaux (300 × 215 cm)',
    prix: '5 500 - 9 000 €',
    pose: '700-1 200 €',
  },
]

const sources = [
  {
    label: 'AFNOR — NF EN 14351-1 (norme menuiseries extérieures)',
    url: 'https://www.afnor.org',
  },
  {
    label: 'Qualibat 6361 — qualification menuiseries extérieures',
    url: 'https://www.qualibat.com',
  },
  {
    label: 'France Rénov’ — MaPrimeRénov’ menuiseries 2026',
    url: 'https://france-renov.gouv.fr',
  },
  {
    label: 'ADEME — Guide rénovation menuiseries 2024',
    url: 'https://librairie.ademe.fr',
  },
  {
    label: 'CSTB — Centre Scientifique du Bâtiment',
    url: 'https://www.cstb.fr',
  },
  {
    label: 'Cetim — Centre technique mécanique (RPT)',
    url: 'https://www.cetim.fr',
  },
  {
    label: 'Légifrance — Décret RT 2012 menuiseries',
    url: 'https://www.legifrance.gouv.fr',
  },
]

const faqs = [
  {
    question: 'Pourquoi choisir une menuiserie aluminium plutôt que PVC ?',
    answer:
      'Trois cas où l’alu domine : 1) Grandes ouvertures > 2 m de large (baie coulissante, galandage) — le PVC se déforme avec la dilatation. 2) Esthétique contemporaine recherchée (profilés fins 70-80 % de vitrage vs 60 % PVC). 3) Durabilité long terme (40-50 ans vs 25-30 PVC). Inconvénient : 30-50 % plus cher. Pour fenêtre standard 1-2 vantaux en rénovation budget, le PVC reste plus rentable. Pour patrimoine ou pièces de vie design, alu RPT.',
  },
  {
    question: 'Qu’est-ce que la rupture de pont thermique (RPT) ?',
    answer:
      'L’aluminium brut conduit la chaleur 1 000× plus que le PVC, créant un "pont thermique" qui amène le froid extérieur à l’intérieur (condensation, déperdition). La rupture de pont thermique (RPT) consiste à insérer une barrette polyamide isolante entre le profilé intérieur et extérieur. Résultat : Uw passe de 5-6 W/m².K (alu sans RPT) à 1,1-1,4 W/m².K (alu RPT) — équivalent voire meilleur que PVC. RPT est OBLIGATOIRE pour bénéficier des aides MaPrimeRénov’/CEE.',
  },
  {
    question: 'Quel Uw cibler pour bénéficier de MaPrimeRénov’ en 2026 ?',
    answer:
      'Uw ≤ 1,3 W/m².K (coefficient transmission thermique global fenêtre, plus c’est bas mieux c’est) ET Sw ≥ 0,30 (facteur solaire, captage gratuit du soleil l’hiver). Tous les fabricants alu sérieux 2026 atteignent ces seuils. Vérifier l’étiquette CEKAL + AEV (Air, Eau, Vent) sur la facture pose. Sans ces certifications = aides refusées.',
  },
  {
    question: 'Combien coûte une fenêtre alu posée en 2026 ?',
    answer:
      'Fenêtre 1 vantail 60×100 cm : 800-1 200 € fourniture + 150-250 € pose = 950-1 450 € total. Fenêtre 2 vantaux 120×100 cm : 1 100-1 800 € + 200-350 € = 1 300-2 150 €. Porte-fenêtre 2 vantaux : 1 800-2 800 € + 300-500 € = 2 100-3 300 €. Baie coulissante 240×215 : 2 800-4 500 € + 400-700 € = 3 200-5 200 €. Prix variables selon profilé (70 mm vs 80 mm), vitrage (double vs triple), couleur (laquage), accessoires (poignées, cylindres anti-effraction).',
  },
  {
    question: 'Quelles aides 2026 pour menuiserie alu ?',
    answer:
      'MaPrimeRénov’ classique : 80 €/m² (intermédiaires/supérieurs) à 120 €/m² (modestes/très modestes). CEE Coup de pouce : 35-100 €/m² selon revenus + opération BAR-EN-104. TVA 5,5 % au lieu de 20 % si pose RGE Qualibat 6361. Éco-PTZ 50 K€ taux 0 sur 20 ans. Total moyen 30-50 % du devis HT couvert pour ménage modeste. Conditions : Uw ≤ 1,3 W/m².K + Sw ≥ 0,30 + entreprise RGE certifiée.',
  },
  {
    question: 'Quelle différence entre alu thermolaqué et alu anodisé ?',
    answer:
      'Thermolaquage : peinture poudre cuite à 200 °C → finition mate ou satinée, large gamme couleurs (RAL), 25-40 ans de tenue avant retouche. Anodisation : oxydation contrôlée → finition métallique brute (gris, bronze, noir), 30-50 ans sans retouche, plus chère mais plus durable. Pour rénovation maison : thermolaquage RAL standard (gris anthracite 7016 dominant 2026). Pour patrimoine ou architecte : anodisation premium.',
  },
  {
    question: 'L’alu est-il compatible avec une rénovation BBC ?',
    answer:
      'OUI absolument, à condition de choisir : 1) Profilés 80 mm avec triple RPT (Uw 1,0-1,1). 2) Triple vitrage Ug 0,5-0,7 (au lieu de double 1,0-1,2). 3) Joints d’étanchéité EPDM longue durée. 4) Pose en applique extérieure (vs tunnel) pour traiter les ponts thermiques périphériques. Coût : ~ +25-35 % vs alu standard. Justifié si vous visez RT 2012 / RE 2020 ou label BBC Effinergie.',
  },
  {
    question: 'Faut-il choisir un fabricant français ou européen ?',
    answer:
      'Plusieurs gammes 2026 fiables : Schüco (DE, premium), K-Line (FR, leader marché), Technal (FR, milieu/haut de gamme), Wicona (DE, premium), Tryba (FR, distribution intégrée), Internorm (AT, BBC). Critères : 1) Marquage CE + NF (normes européennes). 2) Label CEKAL (vitrage). 3) Garantie ≥ 10 ans + SAV pièces 15 ans. 4) Étanchéité AEV A4 / E9A / VC2 minimum. 5) RGE Qualibat 6361 du poseur. Pour rénovation classique, K-Line ou Tryba sont les références qualité/prix France.',
  },
]

export default function MenuiserieAluminiumPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Menuiseries', url: '/renovation-energetique/travaux/menuiseries' },
    { name: 'Aluminium', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: PAGE_PATH,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Travaux — Menuiseries — Aluminium',
    keywords: [
      'menuiserie aluminium',
      'fenetre aluminium',
      'porte fenetre aluminium',
      'baie vitrée aluminium',
      'menuiserie alu prix',
      'menuiserie aluminium sur mesure',
      'rupture pont thermique aluminium',
    ],
  })

  const schemas = [articleSchema, breadcrumbSchema, faqSchema].filter(
    (s): s is Record<string, unknown> => s !== null
  )

  return (
    <>
      <JsonLd data={schemas} />

      <main className="bg-sand-50 min-h-screen">
        <Breadcrumb
          items={[
            { label: 'Rénovation énergétique', href: '/renovation-energetique' },
            { label: 'Travaux', href: '/renovation-energetique/travaux' },
            { label: 'Menuiseries', href: '/renovation-energetique/travaux/menuiseries' },
            { label: 'Aluminium' },
          ]}
          className="max-w-4xl mx-auto px-4 sm:px-6 pt-6"
        />

        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <header className="mb-8">
            <p className="inline-flex items-center gap-2 bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden /> Premium · RPT obligatoire
            </p>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-sand-900 mt-3 mb-3 leading-tight">
              Menuiserie aluminium en 2026 : prix, RPT, aides
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Tout sur la menuiserie aluminium : prix posé par type d’ouverture (800-1 800 €
              fenêtre, 2 800-4 500 € baie coulissante), rupture de pont thermique (RPT) obligatoire,
              comparatif PVC/alu/bois, aides MaPrimeRénov’ + CEE 2026.
            </p>
            <LastUpdated date={MODIFIED} label="Mis à jour le" className="mt-3 text-sm" />
          </header>

          <TldrBlock bullets={tldr} />

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              Qu’est-ce que la rupture de pont thermique (RPT) ?
            </h2>
            <p className="text-sand-700 leading-relaxed mb-4">
              L’aluminium brut conduit la chaleur <strong>1 000 fois plus</strong> que le PVC. Sans
              traitement, une fenêtre alu transforme l’ouverture en pont thermique majeur : froid
              extérieur transmis à l’intérieur, condensation, déperdition de chaleur, factures
              énergétiques élevées.
            </p>
            <p className="text-sand-700 leading-relaxed mb-4">
              La <strong>rupture de pont thermique (RPT)</strong> consiste à insérer une barrette en
              polyamide isolant (matériau plastique haute densité) entre les profilés intérieur et
              extérieur. Résultat : le coefficient Uw passe de 5-6 W/m².K (alu sans RPT,
              catastrophique) à <strong>1,1-1,4 W/m².K (alu RPT 2026)</strong> — équivalent voire
              légèrement supérieur au PVC.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
              <strong>RPT est OBLIGATOIRE</strong> pour bénéficier des aides MaPrimeRénov’ et CEE en
              2026. Vérifier l’étiquette CEKAL + AEV sur la facture du poseur RGE Qualibat 6361.
            </div>
          </section>

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              Comparatif 4 matériaux : alu, PVC, bois, mixte
            </h2>
            <div className="space-y-4">
              {COMPARATIF.map((m) => (
                <div
                  key={m.materiau}
                  className="bg-white border border-sand-200 rounded-xl p-5 shadow-sm"
                >
                  <h3 className="font-heading text-lg font-bold text-sand-900 mb-2">
                    {m.materiau}
                  </h3>
                  <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                    <div>
                      <p className="text-xs uppercase text-sand-500 mb-0.5">Uw</p>
                      <p className="font-semibold text-slate-700">{m.uw}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-sand-500 mb-0.5">Prix HT/fenêtre</p>
                      <p className="font-semibold text-sand-900">{m.prix}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-sand-500 mb-0.5">Durée vie</p>
                      <p className="font-semibold text-sand-900">{m.duree}</p>
                    </div>
                  </div>
                  <p className="text-sm text-sand-700 leading-relaxed mb-1">
                    <strong>+ </strong>
                    {m.avantages}
                  </p>
                  <p className="text-sm text-sand-600 leading-relaxed">
                    <strong>− </strong>
                    {m.inconvenients}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              Prix posé par type d’ouverture (2026)
            </h2>
            <p className="text-sand-700 mb-6">
              Tarifs HT pour menuiserie aluminium RPT 70-80 mm + double vitrage Uw ≤ 1,3 W/m².K +
              pose RGE Qualibat 6361 en France métropolitaine. Prix indicatifs hors zones très
              tendues (Paris intra-muros : +20-30 %).
            </p>
            <div className="bg-white border border-sand-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-sand-100">
                  <tr>
                    <th className="text-left p-3 font-semibold text-sand-900">Type d’ouverture</th>
                    <th className="text-right p-3 font-semibold text-sand-900">Fourniture HT</th>
                    <th className="text-right p-3 font-semibold text-sand-900">Pose HT</th>
                  </tr>
                </thead>
                <tbody>
                  {PRIX_PAR_OUVERTURE.map((p) => (
                    <tr key={p.type} className="border-t border-sand-200">
                      <td className="p-3 text-sand-700">{p.type}</td>
                      <td className="text-right p-3 font-semibold text-sand-900">{p.prix}</td>
                      <td className="text-right p-3 text-sand-700">{p.pose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="my-10 bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6">
            <h2 className="font-heading text-xl font-bold text-emerald-900 mb-3">
              <Calculator className="inline w-5 h-5 mr-2" aria-hidden />
              Estimer mes aides menuiserie en 2 minutes
            </h2>
            <p className="text-sm text-emerald-800 mb-4 leading-relaxed">
              Le simulateur officiel France Rénov’ calcule MaPrimeRénov’ menuiseries (80-120 €/m²
              selon revenus) + CEE Coup de pouce (35-100 €/m²) + TVA 5,5 % + éco-PTZ. Conditions :
              Uw ≤ 1,3 W/m².K + Sw ≥ 0,30 + RGE Qualibat 6361.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/simulateur-aides-renovation"
                className="inline-flex items-center gap-2 bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-emerald-800 transition-colors"
              >
                Simulateur aides
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
              <Link
                href="/renovation-energetique/aides/maprimerenov-2026"
                className="inline-flex items-center gap-2 bg-white border border-emerald-300 text-emerald-800 px-5 py-2.5 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
              >
                MaPrimeRénov’ 2026
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          </section>

          <FlagshipFaq items={faqs} />
          <FlagshipSources sources={sources} />

          <section className="my-10">
            <h2 className="font-heading text-xl font-semibold text-sand-900 mb-4">
              Pour aller plus loin
            </h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {[
                {
                  label: 'Hub Menuiseries — fenêtres, portes, baies',
                  href: '/renovation-energetique/travaux/menuiseries',
                },
                {
                  label: 'Fenêtre de toit (Velux) — guide',
                  href: '/renovation-energetique/travaux/menuiseries/fenetre-de-toit',
                },
                {
                  label: 'Fenêtres double vitrage — prix et aides',
                  href: '/renovation-energetique/travaux/fenetres-double-vitrage',
                },
                {
                  label: 'Isolation extérieure ITE',
                  href: '/renovation-energetique/travaux/isolation/exterieure-ite',
                },
                {
                  label: 'MaPrimeRénov’ 2026',
                  href: '/renovation-energetique/aides/maprimerenov-2026',
                },
                {
                  label: 'CEE Certificats économies énergie',
                  href: '/renovation-energetique/aides/cee-certificats-economie-energie',
                },
              ].map((g) => (
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
            authorSlug={AUTHOR_SLUG}
            datePublished={PUBLISHED}
            dateModified={MODIFIED}
          />

          <div className="flex items-center justify-between text-sm text-sand-600 border-t border-sand-200 pt-4 mt-6">
            <Link
              href="/renovation-energetique/travaux/menuiseries"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Menuiseries
            </Link>
            <Link
              href="/renovation-energetique/travaux/fenetres-double-vitrage"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Double vitrage <TrendingUp className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </article>
      </main>
    </>
  )
}
