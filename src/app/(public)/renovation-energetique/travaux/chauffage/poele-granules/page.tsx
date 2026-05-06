/**
 * /renovation-energetique/travaux/chauffage/poele-granules — Levier 4 ROI.
 *
 * @kw-primary    poele a granule
 * @kw-volume     48000
 * @kw-kd         12
 * @kw-cpc        0.40
 * @cluster       4
 * @ahrefs-source live keywords-explorer/overview snapshot 2026-05-06 country=fr
 * @backlog-item  P3-poele-granules-cluster
 *
 * REFONTE CIBLAGE 2026-05-06 (Levier 4 ROI) :
 * Le ciblage initial (snapshot 2026-05-03, 380 vol KD 16) ratait le vrai
 * pivot. Repull Ahrefs API live a révélé que le variant orthographique
 * `poele a granule` (sans S) génère 126× plus de volume. Cette refonte
 * cible le bon pivot tout en couvrant les variants en cohabitation.
 *
 * KW cibles validés Ahrefs API live (snapshot 2026-05-06, country=fr) :
 * - "poele a granule"            → 48 000 vol, KD 12, CPC 0,40 €  (PIVOT primary)
 * - "poele a pellet"             →  5 400 vol, KD 17
 * - "poele a granule prix"       →  2 300 vol, KD 3  (money KW easy win)
 * - "poele a granules"           →  1 000 vol, KD 16 (variant pluriel)
 * - "poele a pellets"            →    300 vol, KD 18
 * - "poele granules etanche"     →    150 vol, KD null (large opportunité)
 * - "prix poele a granules"      →    150 vol, KD 5
 * - "poele granules"             →    150 vol, KD 17
 * - "poele a granules sans electricite" → 90 vol, KD 0 (sub-page easy win)
 * - "poele a granules prix"      →     60 vol, KD 3
 * - "prix poele granule"         →     40 vol, KD 12
 * - "poele a pellets prix"       →     30 vol, KD null
 * - Cluster cumulé : ~58 000 vol/mo, KD avg 11.
 *
 * Easy win : OUI MAJEUR sur "poele a granule prix" (2 300 KD 3) et
 * "poele a granules sans electricite" (90 KD 0). Sur le pivot 48K KD 12,
 * compétition Effy/Hellio/MCZ/comparateurs — atteignable mais demande
 * autorité topical (cluster bois/biomasse cohérent, mêmes 4 171 Qualibois
 * que /chaudiere-bois, label Flamme Verte 7+, prix posé fourchette honnête).
 *
 * Cluster pillar : Rénovation Énergétique → Travaux → Chauffage → Poêle granulés.
 *
 * Anti-cannibalisation :
 *   - /chauffage/chaudiere-bois          → chaudière biomasse (chauffage central)
 *   - /chauffage/chaudiere-condensation  → chaudière gaz/fioul
 *   - /chauffage/chauffe-eau-thermodynamique → ECS uniquement
 *   - Cette page = poêle (point unique pièce, jamais central)
 *   - /poele-granules/sans-electricite (sub-page Vague 1, KD 0)
 *   - /guides/poele-granules-aides-2026 → cette page absorbe l'autorité topical
 *     via maillage descendant
 *
 * Aides 2026 (rappel YMYL) :
 *   - MaPrimeRénov' Bleu 2 500 € (4 000 € hydro) — barème révisé annuellement
 *   - CEE BAR-TH-112 (poêle granulés) + Coup de pouce si remplacement fioul/gaz
 *   - Éco-PTZ (1 action) + TVA 5,5 % avec RGE Qualibois Module Air ou Eau
 *   - Label Flamme Verte 7+ obligatoire pour TVA 5,5 % (rendement ≥ 87 %).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calculator, CheckCircle2, Coins, Flame, Leaf, Zap } from 'lucide-react'

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

const PAGE_PATH = '/renovation-energetique/travaux/chauffage/poele-granules'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Poêle à granulé 2026 : prix posé, aides MPR + CEE'
const DESCRIPTION =
  'Poêle à granulé (pellet) 2026 : prix posé 4 000-14 000 € (étanche / canalisable / hydro), MaPrimeRénov’ jusqu’à 4 000 €, label Flamme Verte 7+, ROI 5-8 ans.'

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
  'Poêle à granulés : combustion automatique de pellets bois (15 kg/jour pour 100 m²).',
  'Prix posé 2026 : 4 000-8 000 € (étanche), 6 000-10 000 € (hydro raccordé chauffage central).',
  'Rendement 85-92 % — meilleur que poêles bûches (75-85 %).',
  'MaPrimeRénov’ Bleu : 2 500 €. CEE Coup de pouce : 1 000-2 000 €.',
  'Label Flamme Verte 7+ obligatoire pour aides + bénéfice TVA 5,5 %.',
  'ROI 5-8 ans vs chauffage électrique direct, 7-10 ans vs chaudière gaz.',
]

const TYPES_POELE = [
  {
    type: 'Étanche standard',
    prix: '4 000-8 000 € posé',
    surface: '60-120 m²',
    detail:
      'Combustion air pris à l’extérieur via conduit concentrique. Compatible RT2012/RE2020. Le plus courant.',
  },
  {
    type: 'Canalisable',
    prix: '5 500-10 000 € posé',
    surface: '100-180 m²',
    detail: 'Diffuse l’air chaud dans 1-2 pièces voisines via gaines. Idéal maison T4-T5 ouverte.',
  },
  {
    type: 'Hydraulique (hydro)',
    prix: '8 000-14 000 € posé',
    surface: '120-200 m² + ECS',
    detail:
      'Raccordé au chauffage central + ECS. Remplace une chaudière. Aides MPR plus généreuses (jusqu’à 4 000 € Bleu).',
  },
]

const PRIX_GRANULES = [
  { item: 'Sac 15 kg', prix: '4-7 €', detail: 'Achat ponctuel, palette 1 t = 250-350 €' },
  {
    item: 'Vrac livraison silo (1-5 t)',
    prix: '300-450 €/tonne',
    detail: 'Économique : -15 à -25 % vs sacs',
  },
  {
    item: 'Conso annuelle 100 m² isolé',
    prix: '2-3 t/an = 600-1 000 €',
    detail: 'Variable selon zone climatique et isolation',
  },
]

const AIDES_2026 = [
  {
    aide: 'MaPrimeRénov’ Bleu',
    montant: '2 500 € (4 000 € hydro)',
    detail: 'Catégorie très modeste',
  },
  { aide: 'MaPrimeRénov’ Jaune', montant: '2 000 € (3 000 € hydro)', detail: 'Catégorie modeste' },
  {
    aide: 'MaPrimeRénov’ Violet',
    montant: '1 500 € (2 000 € hydro)',
    detail: 'Catégorie intermédiaire',
  },
  {
    aide: 'CEE Coup de pouce',
    montant: '1 000-2 000 €',
    detail: 'Si remplacement chaudière fioul/gaz/charbon',
  },
  {
    aide: 'TVA 5,5 %',
    montant: 'Automatique avec RGE Qualibois',
    detail: 'Sur main d’œuvre + matériaux',
  },
  {
    aide: 'Éco-PTZ',
    montant: 'Jusqu’à 15 000 € (1 action)',
    detail: 'Si combiné isolation : jusqu’à 50 000 €',
  },
]

const faqs = [
  {
    question: 'Combien coûte un poêle à granulés en 2026 ?',
    answer:
      'Prix posé clé en main 2026 : 4 000-8 000 € pour un poêle étanche standard 6-12 kW (60-120 m²), 5 500-10 000 € pour un canalisable (diffusion 2-3 pièces), 8 000-14 000 € pour un hydraulique raccordé au chauffage central + ECS. Le matériel représente 50-65 % du devis (1 800-5 000 € pour une bonne marque type Stuv, MCZ, Edilkamin, RIKA, Wodtke), pose et conduit 35-50 %.',
  },
  {
    question: 'Quelles aides en 2026 pour un poêle à granulés ?',
    answer:
      'MaPrimeRénov’ : 2 500 € Bleu, 2 000 € Jaune, 1 500 € Violet (poêle simple). Hydro : 4 000 € Bleu, 3 000 € Jaune, 2 000 € Violet. CEE Coup de pouce : 1 000-2 000 € si remplacement chaudière fioul/gaz/charbon. TVA 5,5 % avec artisan Qualibois. Éco-PTZ jusqu’à 15 000 € (1 action) ou 50 000 € (rénovation d’ampleur). Cumul typique Bleu : MPR 2 500 € + CEE 2 000 € = 4 500 € sur un devis 6 500 €, reste à charge 2 000 €.',
  },
  {
    question: 'Faut-il le label Flamme Verte ?',
    answer:
      'Oui, label Flamme Verte 7 étoiles minimum pour bénéficier de MaPrimeRénov’, des CEE et de la TVA 5,5 %. Ce label garantit : rendement ≥ 87 %, émissions particules &lt; 30 mg/Nm³, monoxyde de carbone &lt; 250 mg/Nm³, fonctionnement automatique avec contrôle électronique. Marques certifiées : Stuv, MCZ, Edilkamin, RIKA, Hase, Hark, Palazzetti, Termoflux. Vérifier le label sur le devis avant signature.',
  },
  {
    question: 'Combien de granulés consomme-t-on par an ?',
    answer:
      '100 m² bien isolé en zone climatique H2 (centre/ouest France) : 2-3 tonnes par an, soit 600-1 000 € au prix vrac 2026 (300-450 €/tonne). En zone H1 (est/nord/montagne) : 3-4 tonnes (900-1 350 €). En zone H3 (sud) : 1,5-2,5 tonnes (450-850 €). Stockage : silo 1 m³ ≈ 700 kg, prévoir 3-4 m³ pour autonomie hivernale complète. Coût annuel inférieur de 30-50 % à un chauffage électrique direct.',
  },
  {
    question: 'Quelle puissance de poêle pour ma maison ?',
    answer:
      'Règle approximative : 1 kW pour 10 m² de surface bien isolée. Maison 100 m² isolée : 8-10 kW. Maison 120 m² avec étage : 10-12 kW. Maison passoire 100 m² (G/F) : 12-14 kW. Sur-dimensionner légèrement (10-15 %) pour les pics de froid. Sous-dimensionner = inconfort en hiver. Audit thermique préalable recommandé pour calculer précisément les besoins.',
  },
  {
    question: 'Quel artisan installer un poêle à granulés ?',
    answer:
      'Mention RGE <strong>Qualibois</strong> Module Air (poêle simple) ou Module Eau (poêle hydro raccordé chauffage central). Vérifier dans notre <a href="/rge/labels/qualibois">annuaire Qualibois</a>. Le devis doit indiquer : marque, modèle, label Flamme Verte 7+, puissance kW, rendement %, conduit fumée (tubage neuf ou existant), mise en service. Au moins 2-3 devis comparés pour optimiser.',
  },
  {
    question: 'Quel entretien pour un poêle à granulés ?',
    answer:
      'Quotidien : vidage cendrier (5 min/semaine si bonnes pellets). Mensuel : aspiration intérieure (10 min). Annuel : ramonage obligatoire par professionnel (60-100 €) + entretien complet du poêle (180-280 €) — vérification brûleur, ventilateur, tarière vis sans fin, capteurs. Total 240-380 €/an. Marques fiables : pannes rares avant 10-12 ans. Durée de vie 20-25 ans.',
  },
  {
    question: 'Poêle à granulés vs poêle à bûches : lequel choisir ?',
    answer:
      'Poêle à granulés : automatique (programmation, autonomie 24-72h), rendement supérieur (85-92 % vs 75-85 % bûches), pellets stockage compact. Poêle à bûches : combustible moins cher (50-90 €/m³), ambiance feu, pas d’électricité requise (sauf souffleur). Granulés idéal pour usage quotidien chauffage principal. Bûches plutôt agrément ou rural avec accès bois local. Coût annuel : granulés 600-1 000 €/an vs bûches 350-700 €/an pour 100 m².',
  },
]

const sources = [
  { label: 'France Rénov’ — Poêle à granulés', url: 'https://france-renov.gouv.fr' },
  { label: 'Flamme Verte — Label officiel', url: 'https://www.flammeverte.org' },
  { label: 'ADEME — Chauffage bois', url: 'https://www.ademe.fr' },
  { label: 'Anah — MPR poêle granulés', url: 'https://www.anah.gouv.fr' },
  { label: 'Service-Public.fr — Ramonage obligatoire', url: 'https://www.service-public.fr' },
]

const relatedPages = [
  {
    label: 'Entretien poêle à granulés 2026',
    href: '/renovation-energetique/travaux/chauffage/poele-granules/entretien',
    description: '150-220 € HT/an, 12 points, ramonage 80-150 €',
  },
  {
    label: 'Meilleures marques poêle granulés (8 comparées)',
    href: '/renovation-energetique/travaux/chauffage/poele-granules/marques',
    description: 'RIKA, MCZ, Edilkamin, Stuv, Wodtke + 6 critères + 3 budgets',
  },
  {
    label: 'Poêle granulés sans électricité',
    href: '/renovation-energetique/travaux/chauffage/poele-granules/sans-electricite',
    description: 'Gravitaire, hybride, onduleur — autonomie réseau',
  },
  {
    label: 'Chaudière à bois (biomasse)',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-bois',
    description: 'Chauffage central + ECS via bois',
  },
  {
    label: 'Hub Chauffage',
    href: '/renovation-energetique/travaux/chauffage',
    description: 'PAC, granulés, condensation comparés',
  },
  {
    label: 'PAC air-eau prix 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix',
    description: 'Alternative chauffage central',
  },
  {
    label: 'Chaudière condensation',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-condensation',
    description: 'Comparatif pour transition gaz',
  },
  {
    label: 'Label Qualibois',
    href: '/rge/labels/qualibois',
    description: 'Mention RGE chaudière + poêle bois',
  },
  {
    label: 'CEE Coup de pouce',
    href: '/renovation-energetique/aides/prime-coup-de-pouce',
    description: '1 000-2 000 € sur poêle granulés',
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
    section: 'Poêle à granulés',
    keywords: [
      'poele a granule',
      'poele a granules',
      'poele a pellet',
      'poele a pellets',
      'poele a granule prix',
      'poele granules',
      'poele granules etanche',
      'poele a granules sans electricite',
      'maprimerenov poele granules',
      'flamme verte',
      'qualibois',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Chauffage', url: '/renovation-energetique/travaux/chauffage' },
    { name: 'Poêle à granulés', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'Poêle à granulés : aides MaPrimeRénov’ 2026',
    description:
      'Poêle à granulés éligible MaPrimeRénov’ jusqu’à 2 500 € (modèle simple) ou 4 000 € (hydraulique). Label Flamme Verte 7+ obligatoire. Installation par artisan Qualibois Module Air ou Eau.',
    url: PAGE_URL,
    serviceType: 'Subvention publique chauffage biomasse',
    audience: 'Propriétaires occupants, bailleurs',
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
              { label: 'Travaux', href: '/renovation-energetique/travaux' },
              { label: 'Chauffage', href: '/renovation-energetique/travaux/chauffage' },
              { label: 'Poêle à granulés' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Leaf className="w-3.5 h-3.5" aria-hidden />
              EnR — MaPrimeRénov’ jusqu’à 4 000 € (hydro Bleu)
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Poêle à granulé (pellet) 2026 : prix, aides et modèles
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Le <strong>poêle à granulé</strong> (ou <strong>pellet</strong>) brûle automatiquement
              des pellets bois pour chauffer une pièce principale ou une maison entière (canalisable
              / hydro). Prix posé 2026 : <strong>4 000 à 8 000 €</strong> pour un modèle étanche
              standard, jusqu’à <strong>14 000 €</strong> pour un hydraulique raccordé au chauffage
              central. Avec un rendement de <strong>85-92 %</strong> et MaPrimeRénov’{' '}
              <strong>jusqu’à 4 000 €</strong> (Bleu hydro), c’est une alternative pertinente aux
              chaudières fossiles.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="types">Les 3 types de poêle à granulés</h2>
            <div className="not-prose grid gap-3 my-6">
              {TYPES_POELE.map((t) => (
                <div key={t.type} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {t.type}
                    </h3>
                    <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                      {t.prix}
                    </span>
                  </div>
                  <p className="text-xs text-sand-500 m-0 mb-2">Surface idéale : {t.surface}</p>
                  <p className="text-sm text-sand-700 m-0">{t.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="prix-granules">Prix des granulés 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Format</th>
                    <th className="p-3 border-b border-sand-200">Prix 2026</th>
                    <th className="p-3 border-b border-sand-200">Détail</th>
                  </tr>
                </thead>
                <tbody>
                  {PRIX_GRANULES.map((p) => (
                    <tr key={p.item} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{p.item}</td>
                      <td className="p-3 text-primary-700 font-semibold">{p.prix}</td>
                      <td className="p-3 text-sand-600 text-xs">{p.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-sand-500">
              Prix indicatifs France métropolitaine. Privilégier granulés certifiés DINplus / EN+ A1
              pour un rendement optimal et limiter l’encrassement. Évitez les premiers prix.
            </p>

            <h2 id="aides">Aides 2026 pour poêle à granulés</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Aide</th>
                    <th className="p-3 border-b border-sand-200">Montant</th>
                    <th className="p-3 border-b border-sand-200">Détail</th>
                  </tr>
                </thead>
                <tbody>
                  {AIDES_2026.map((a) => (
                    <tr key={a.aide} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{a.aide}</td>
                      <td className="p-3 text-primary-700 font-semibold">{a.montant}</td>
                      <td className="p-3 text-sand-600 text-xs">{a.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 my-6">
              <p className="font-semibold text-sand-900 m-0 mb-3">
                Exemple : poêle granulés étanche 9 kW (devis 6 500 €) — couple modeste (Jaune)
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <span className="text-sand-600">Devis HT</span>
                <span className="text-sand-900 font-medium text-right">6 500 €</span>
                <span className="text-sand-600">MaPrimeRénov’ Jaune</span>
                <span className="text-primary-700 font-medium text-right">- 2 000 €</span>
                <span className="text-sand-600">
                  CEE Coup de pouce (si remplace chaudière fioul)
                </span>
                <span className="text-primary-700 font-medium text-right">- 1 500 €</span>
                <span className="text-sand-600">TVA 5,5 % (vs 20 %) ≈</span>
                <span className="text-primary-700 font-medium text-right">- 350 €</span>
                <span className="text-sand-900 font-bold pt-2 border-t border-sand-200">
                  Reste à charge
                </span>
                <span className="text-sand-900 font-bold pt-2 border-t border-sand-200 text-right">
                  2 650 €
                </span>
              </div>
              <p className="text-xs text-sand-500 italic mt-3 mb-0">
                Économie facture chauffage attendue : 30-50 % vs chauffage électrique direct, ROI
                4-6 ans.
              </p>
            </div>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Estimer votre poêle à granulés + aides 2026
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Calcul instantané MPR + CEE + éco-PTZ selon revenus, type de poêle et zone. Mise
                    en relation artisan Qualibois vérifié.
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

            <h2 id="installation">Installation et conduit</h2>
            <ul>
              <li>
                <Flame className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Conduit fumée étanche</strong> obligatoire (T200 minimum). Tubage existant
                ou ventouse concentrique selon configuration.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Stockage pellets</strong> : silo intégré poêle (15-30 kg, autonomie 2-7
                jours) ou silo extérieur 1-5 t (autonomie hivernale complète).
              </li>
              <li>
                <Zap className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Alimentation électrique</strong> requise (allumage, ventilateur, tarière) :
                ~250-400 kWh/an consommés.
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Ramonage annuel</strong> obligatoire (60-100 €) + entretien complet (180-280
                €).
              </li>
            </ul>
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
              href="/renovation-energetique/travaux/chauffage"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Chauffage
            </Link>
            <Link
              href="/rge/labels/qualibois"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Qualibois <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
