/**
 * Page : /renovation-energetique/travaux/pompe-a-chaleur/geothermie
 *
 * @kw-primary    geothermie
 * @kw-volume     5556
 * @kw-kd         12
 * @kw-cpc        0.35
 * @intent        info
 * @cluster       reno-energetique-pac-geothermie
 * @ahrefs-source api-live
 * @snapshot      2026-05-06
 * @backlog-item  Sprint 2 PAC géothermie head 5556 vol KD 12
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "geothermie"                       → 5 556 vol, KD 12, CPC $0,35, clicks 4 343 ⭐⭐⭐
 * - "pompe a chaleur geothermie"       → 292 vol, KD 4, CPC $0,70 ⭐
 * - "pac geothermique"                 → longue traîne
 * - "geothermie maison"                → longue traîne
 * - Famille cumulée pivot : ~6 200 vol/mois
 *
 * Source : audit Ahrefs API live (cf docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md)
 * Easy win : OUI MOYEN (KD 12 sur KW pivot 5 556 vol, KD 4 sur PAC geothermie 292 vol)
 *            Concurrence ADEME, Énergie+ Habitat, BRGM
 *            Atout SA : focus prix posé + MaPrimeRénov’ 11 000 € + ROI long terme
 * Cluster pillar : Rénovation Énergétique → Travaux → Pompe à chaleur → Géothermie
 *
 * Anti-cannibalisation :
 *   - Hub /pompe-a-chaleur = comparatif 3 types PAC
 *   - Sub /air-eau-prix = pivot PAC chauffage central
 *   - Sub /air-air-prix = clim réversible (KW 6 404 vol)
 *   - Cette page = focus géothermie (sondes verticales/horizontales, MPR max 11 000 €)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  Calculator,
  CheckCircle2,
  Coins,
  Layers,
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
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema, getGovernmentServiceSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/pompe-a-chaleur/geothermie'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-04'
const MODIFIED = '2026-05-04'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'PAC géothermique 2026 : prix & sondes'
const DESCRIPTION =
  'Pompe à chaleur géothermique 2026 : prix 18 000-32 000 €, sondes verticales/horizontales, COP 4-5,5. MPR jusquà 11 000 €.'

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
  'PAC géothermique : exploite la chaleur du sous-sol (10-12 °C constants à 1 m de profondeur).',
  'COP saisonnier 4-5,5 (le plus élevé toutes PAC confondues).',
  'Prix posé 2026 : 18 000-32 000 € selon type de captage et puissance.',
  'MaPrimeRénov’ jusqu’à 11 000 € (Bleu) — montant le plus élevé du barème par geste.',
  '2 types de captage : horizontal (terrain plat 200-300 m²) ou vertical (sondes 50-150 m profondeur).',
  'Durée de vie 25-30 ans (PAC) à 50+ ans (sondes). ROI 8-12 ans.',
]

const TYPES_CAPTAGE = [
  {
    type: 'Captage horizontal',
    icon: Layers,
    surface: 'Terrain plat 200-300 m²',
    profondeur: '0,6-1,2 m',
    prix: '18 000-25 000 € posé',
    avantage: 'Coût moindre, pas de forage',
    contrainte: 'Surface terrain importante. Terrain non constructible au-dessus.',
    cop: '3,5-4,5',
  },
  {
    type: 'Captage vertical (sondes)',
    icon: TrendingUp,
    surface: 'Quelques m² (forage)',
    profondeur: '50-150 m (1-3 sondes)',
    prix: '22 000-32 000 € posé',
    avantage: 'COP supérieur (sol plus profond = température stable). Petit terrain OK.',
    contrainte: 'Forage 5 000-12 000 € à part. Autorisation préfecture si > 100 m profondeur.',
    cop: '4,5-5,5',
  },
  {
    type: 'Sur nappe phréatique (eau-eau)',
    icon: ShieldCheck,
    surface: 'Petit terrain',
    profondeur: '10-50 m (puits)',
    prix: '25 000-35 000 € posé',
    avantage: 'COP exceptionnel 5-6. Performance constante toute l’année.',
    contrainte:
      'Disponibilité nappe + autorisation préfectorale obligatoire. Étude hydrogéologique.',
    cop: '5,0-6,0',
  },
]

const COMPARATIF = [
  { critere: 'Prix posé (10 kW)', geo: '22 000-32 000 €', air_eau: '12 000-15 000 €' },
  { critere: 'COP saisonnier', geo: '4,5-5,5', air_eau: '3,5-4,5' },
  {
    critere: 'Économie facture annuelle (vs fioul)',
    geo: '900-1 500 €/an',
    air_eau: '700-1 200 €/an',
  },
  { critere: 'MaPrimeRénov’ Bleu max', geo: '11 000 €', air_eau: '5 000 €' },
  { critere: 'CEE Coup de pouce max', geo: '7 000 €', air_eau: '4 000 €' },
  { critere: 'Encombrement intérieur', geo: '0,8-1,2 m³', air_eau: '0,5-0,8 m³' },
  { critere: 'Bruit', geo: 'Très silencieux (intérieur)', air_eau: 'Modéré (unité ext.)' },
  { critere: 'Durée de vie PAC', geo: '20-25 ans', air_eau: '15-20 ans' },
  { critere: 'Durée de vie captage', geo: '50+ ans', air_eau: 'N/A' },
  { critere: 'ROI typique', geo: '8-12 ans', air_eau: '5-7 ans' },
]

const ETAPES = [
  {
    step: 'Étude thermique et géotechnique',
    detail:
      'Audit énergétique du logement + étude du sol (BRGM ou bureau d’études). Détermine type de captage, puissance, faisabilité. 800-2 500 € (souvent intégré dans devis).',
  },
  {
    step: 'Choix du captage',
    detail:
      'Horizontal si terrain plat 200-300 m² disponible. Vertical si terrain limité. Sur nappe si étude hydrogéologique favorable. La PAC géothermique représente 60-70 % du devis, le captage 30-40 %.',
  },
  {
    step: 'Autorisations administratives',
    detail:
      'Captage vertical > 100 m profondeur : déclaration préfectorale (DREAL). Sur nappe : autorisation Code de l’Environnement. Captage horizontal : sans autorisation préalable (sauf zones protégées).',
  },
  {
    step: 'Travaux de captage',
    detail:
      'Horizontal : tranchées 0,6-1,2 m sur 200-300 m² (3-5 jours). Vertical : forage 50-150 m par sonde (2-3 jours). Sur nappe : forage puits + tubage + tests débit.',
  },
  {
    step: 'Installation PAC intérieure',
    detail:
      'Pose unité PAC (chaufferie ou local technique), raccordement aux sondes via fluide caloporteur (eau glycolée), connexion chauffage central + ECS. 2-4 jours.',
  },
  {
    step: 'Mise en service et tests',
    detail:
      'Tests de performance (débit, pression, COP), réglages courbe de chauffe, formation utilisation. Garantie 2-5 ans matériel + 10 ans sondes.',
  },
]

const ARTISANS = [
  'PAC géothermique : QualiPAC mention géothermie',
  'Forage sondes verticales : qualification Qualiforage (foreurs certifiés)',
  'Étude thermique : bureau d’études certifié (audit énergétique)',
  'Étude hydrogéologique (sur nappe) : géologue agréé DREAL',
]

const faqs = [
  {
    question: 'Combien coûte une pompe à chaleur géothermique en 2026 ?',
    answer:
      'Prix posé clé en main : 18 000-25 000 € pour un captage horizontal (terrain plat disponible), 22 000-32 000 € pour un captage vertical (forage sondes 50-150 m), 25 000-35 000 € pour une PAC eau-eau sur nappe phréatique. Le captage représente 30-40 % du devis. La PAC elle-même 60-70 %. Avec MaPrimeRénov’ jusqu’à 11 000 € (Bleu) + CEE Coup de pouce 7 000 € + éco-PTZ : reste à charge 4 000-15 000 € pour ménage modeste.',
  },
  {
    question: 'PAC géothermique vs air-eau : laquelle est la mieux ?',
    answer:
      'Géothermique : COP saisonnier 4,5-5,5 (top performance), durée de vie 20-25 ans, peu sensible au climat extérieur, bruit minimal (unité intérieure). Air-eau : COP 3,5-4,5, durée de vie 15-20 ans, performance variable selon T°ext, unité extérieure visible et bruyante. La géothermique est techniquement supérieure mais coûte 8 000-15 000 € de plus à l’installation. Choisir géothermique si on dispose d’un terrain et qu’on s’inscrit dans la durée (15+ ans). Choisir air-eau si budget limité ou ROI rapide souhaité.',
  },
  {
    question: 'Quelles aides pour la pompe à chaleur géothermique ?',
    answer:
      'MaPrimeRénov’ Bleu : 11 000 € (montant le plus élevé du barème par geste 2026). Jaune : 9 000 €. Violet : 6 000 €. Rose : 0 €. CEE Coup de pouce Chauffage : 5 000 € (standard) ou 7 000 € (modeste). Éco-PTZ jusqu’à 50 000 € sur 20 ans à 0 %. TVA 5,5 % automatique avec QualiPAC. Cumul typique pour un Bleu : 11 000 + 7 000 = 18 000 € sur un devis 28 000 €, reste à charge 10 000 € (financé par éco-PTZ).',
  },
  {
    question: 'Quelle surface de terrain pour un captage horizontal ?',
    answer:
      '200-300 m² typiquement, sur sol non gelé (profondeur 0,6-1,2 m). Règle approximative : 1,5 à 2 fois la surface chauffée du logement. Exemple : maison 120 m² nécessite ~240 m² de captage horizontal. Le terrain doit rester libre (pas de constructions, terrasses lourdes, plantations à racines profondes type arbres) pendant toute la durée de vie du captage (50+ ans). Les jardins, pelouses et zones engazonnées sont parfaits.',
  },
  {
    question: 'Faut-il une autorisation pour une PAC géothermique ?',
    answer:
      'Captage horizontal : pas d’autorisation préalable sauf zones protégées (Natura 2000, ABF). Captage vertical (sondes) : déclaration préfectorale obligatoire si profondeur > 100 m, pas d’autorisation si &lt; 100 m. Captage sur nappe phréatique (eau-eau) : autorisation préfectorale obligatoire (Code de l’Environnement, articles L.214-1 et suivants), avec étude hydrogéologique préalable. Délais d’instruction 2-6 mois selon la zone.',
  },
  {
    question: 'COP réel d’une PAC géothermique en hiver français ?',
    answer:
      'COP saisonnier (SCOP) typique 4,5-5,5 selon technologie et profondeur du captage. Captage vertical 80-150 m profondeur atteint SCOP 5+. Sur nappe phréatique : SCOP 5,5-6. Variation faible selon climat (vs PAC air-eau qui chute en froid extrême). Pour comparaison : 1 kWh d’électricité produit 4,5 à 6 kWh de chaleur. Avec un coût élec 0,22 €/kWh : 1 kWh chaleur = 4-5 cts. Soit 5-7 € pour 100 kWh chaleur livrée.',
  },
  {
    question: 'Inconvénients de la pompe à chaleur géothermique ?',
    answer:
      'Trois principaux : (1) coût d’installation élevé (8 000-15 000 € de plus qu’une air-eau), (2) travaux de captage importants (tranchées ou forages), (3) terrain nécessaire pour captage horizontal. Avantages compensateurs : COP supérieur (économies factures 25-30 % vs air-eau), durée de vie 25 ans+, sondes durent 50+ ans, pas d’unité extérieure bruyante, performance constante. Recommandée pour rénovation lourde 15+ ans de projet.',
  },
  {
    question: 'Peut-on installer une PAC géothermique en copropriété ?',
    answer:
      'Possible techniquement mais rare en pratique. Conditions : (1) accord en assemblée générale, (2) parcelles privatives suffisantes pour captage horizontal (rare en immeuble urbain), (3) ou forage vertical sur cour intérieure (espace 5 m × 5 m minimum), (4) gestion collective ou individuelle de la PAC. Plus courant : géothermie de réseau (raccordement à un réseau de chaleur urbain alimenté par géothermie profonde, comme à Paris, Strasbourg, Bordeaux).',
  },
]

const sources = [
  { label: 'France Rénov’ — PAC géothermique', url: 'https://france-renov.gouv.fr' },
  { label: 'AFPG — Association Française Géothermie', url: 'https://www.afpg.asso.fr' },
  { label: 'BRGM — Bureau Recherches Géologiques', url: 'https://www.brgm.fr' },
  { label: 'ADEME — Géothermie résidentielle', url: 'https://www.ademe.fr' },
  { label: 'Légifrance — Code Environnement L214-1', url: 'https://www.legifrance.gouv.fr' },
]

const relatedPages = [
  {
    label: 'Hub pompe à chaleur',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
    description: 'Comparatif 3 types PAC + aides',
  },
  {
    label: 'PAC air-eau prix 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix',
    description: 'Pivot 2 263 vol — alternative économique',
  },
  {
    label: 'PAC air-air prix 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-air-prix',
    description: 'Clim réversible — 6 404 vol KD 8',
  },
  {
    label: 'Hub aides rénovation',
    href: '/renovation-energetique/aides',
    description: 'MPR 11 000 € + CEE 7 000 €',
  },
  {
    label: 'Label QualiPAC',
    href: '/rge/labels/qualipac',
    description: 'Mention RGE PAC obligatoire',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'Estimation MPR + CEE + éco-PTZ',
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
    section: 'PAC géothermique',
    keywords: [
      'geothermie',
      'pompe a chaleur geothermie',
      'pac geothermique',
      'geothermie maison',
      'sondes geothermiques',
      'maprimerenov geothermie',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Pompe à chaleur', url: '/renovation-energetique/travaux/pompe-a-chaleur' },
    { name: 'Géothermie', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const govSchema = getGovernmentServiceSchema({
    name: 'PAC géothermique : aides MaPrimeRénov’ 2026',
    description:
      'Pompe à chaleur géothermique éligible MaPrimeRénov’ jusqu’à 11 000 € (Bleu), CEE Coup de pouce jusqu’à 7 000 €, éco-PTZ. Installation par artisan QualiPAC mention géothermie obligatoire.',
    url: PAGE_URL,
    serviceType: 'Subvention publique chauffage EnR',
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
              { label: 'Travaux', href: '/renovation-energetique/travaux' },
              { label: 'Pompe à chaleur', href: '/renovation-energetique/travaux/pompe-a-chaleur' },
              { label: 'Géothermie' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Award className="w-3.5 h-3.5" aria-hidden />
              Top COP 4,5-5,5 — MPR jusqu’à 11 000 €
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Pompe à chaleur géothermique 2026 : prix et aides
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              La <strong>PAC géothermique</strong> exploite la chaleur du sous-sol (10-12 °C
              constants) pour chauffer le logement et produire l’ECS. Avec un{' '}
              <strong>COP saisonnier 4,5 à 5,5</strong>, c’est la solution la plus performante
              toutes PAC confondues. Prix posé 2026 : <strong>18 000 à 32 000 €</strong> selon le
              type de captage. Et MaPrimeRénov’ atteint <strong>11 000 € (Bleu)</strong> — le
              montant le plus élevé du barème par geste.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="captages">Les 3 types de captage</h2>
            <div className="not-prose grid gap-4 my-6">
              {TYPES_CAPTAGE.map((t) => {
                const Icon = t.icon
                return (
                  <div key={t.type} className="bg-white border border-sand-200 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-700 grid place-items-center shrink-0">
                        <Icon className="w-5 h-5" aria-hidden />
                      </div>
                      <h3 className="font-heading text-lg font-semibold text-sand-900 m-0">
                        {t.type}
                      </h3>
                    </div>
                    <dl className="text-sm text-sand-700 space-y-2 m-0">
                      <div className="grid grid-cols-3 gap-2">
                        <dt className="font-semibold text-sand-900 col-span-1">Surface</dt>
                        <dd className="m-0 col-span-2">{t.surface}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <dt className="font-semibold text-sand-900">Profondeur</dt>
                        <dd className="m-0 col-span-2">{t.profondeur}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <dt className="font-semibold text-sand-900">Prix posé</dt>
                        <dd className="m-0 col-span-2 text-primary-700 font-semibold">{t.prix}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <dt className="font-semibold text-sand-900">COP</dt>
                        <dd className="m-0 col-span-2">{t.cop}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <dt className="font-semibold text-sand-900">Avantage</dt>
                        <dd className="m-0 col-span-2">{t.avantage}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <dt className="font-semibold text-amber-700">Contrainte</dt>
                        <dd className="m-0 col-span-2 text-amber-800">{t.contrainte}</dd>
                      </div>
                    </dl>
                  </div>
                )
              })}
            </div>

            <h2 id="comparatif">Géothermique vs air-eau : comparatif</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Critère</th>
                    <th className="p-3 border-b border-sand-200">Géothermique</th>
                    <th className="p-3 border-b border-sand-200">Air-eau</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARATIF.map((c) => (
                    <tr key={c.critere} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{c.critere}</td>
                      <td className="p-3 text-primary-700 font-semibold">{c.geo}</td>
                      <td className="p-3">{c.air_eau}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="aides">Aides 2026 pour la PAC géothermique</h2>
            <div className="not-prose grid gap-3 my-6">
              <div className="bg-white border border-primary-200 rounded-xl p-5">
                <p className="font-semibold text-sand-900 m-0 mb-1">
                  MaPrimeRénov’ par geste (Bleu / Jaune / Violet / Rose)
                </p>
                <p className="text-sm text-primary-700 font-bold m-0">
                  11 000 € / 9 000 € / 6 000 € / 0 €
                </p>
                <p className="text-xs text-sand-500 italic m-0 mt-1">
                  Montant le plus élevé du barème MPR par geste.
                </p>
              </div>
              <div className="bg-white border border-primary-200 rounded-xl p-5">
                <p className="font-semibold text-sand-900 m-0 mb-1">CEE Coup de Pouce Chauffage</p>
                <p className="text-sm text-primary-700 font-bold m-0">
                  5 000 € (standard) / 7 000 € (modeste, en remplacement chaudière fioul/gaz)
                </p>
              </div>
              <div className="bg-white border border-primary-200 rounded-xl p-5">
                <p className="font-semibold text-sand-900 m-0 mb-1">Éco-PTZ</p>
                <p className="text-sm text-primary-700 font-bold m-0">
                  Jusqu’à 50 000 € sur 20 ans à 0 %
                </p>
              </div>
              <div className="bg-white border border-primary-200 rounded-xl p-5">
                <p className="font-semibold text-sand-900 m-0 mb-1">TVA 5,5 %</p>
                <p className="text-sm text-primary-700 font-bold m-0">
                  Automatique avec artisan QualiPAC
                </p>
              </div>
            </div>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 my-6">
              <p className="font-semibold text-sand-900 m-0 mb-3">
                Exemple : PAC géothermique vertical 12 kW (devis 28 000 €) — couple Bleu sortie
                passoire
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <span className="text-sand-600">Devis HT</span>
                <span className="text-sand-900 font-medium text-right">28 000 €</span>
                <span className="text-sand-600">MaPrimeRénov’ Bleu</span>
                <span className="text-primary-700 font-medium text-right">- 11 000 €</span>
                <span className="text-sand-600">Bonus sortie passoire</span>
                <span className="text-primary-700 font-medium text-right">- 1 500 €</span>
                <span className="text-sand-600">CEE Coup de pouce modeste</span>
                <span className="text-primary-700 font-medium text-right">- 7 000 €</span>
                <span className="text-sand-600">TVA 5,5 % (vs 20 %) ≈</span>
                <span className="text-primary-700 font-medium text-right">- 1 800 €</span>
                <span className="text-sand-900 font-bold pt-2 border-t border-sand-200">
                  Reste à charge
                </span>
                <span className="text-sand-900 font-bold pt-2 border-t border-sand-200 text-right">
                  6 700 €
                </span>
                <span className="text-primary-700 font-semibold mt-1">
                  Financé par éco-PTZ (20 ans à 0 %)
                </span>
                <span className="text-primary-700 font-semibold text-right mt-1">~28 €/mois</span>
              </div>
              <p className="text-xs text-sand-500 italic mt-3 mb-0">
                Économie facture chauffage attendue : 100-130 €/mois (vs chaudière fioul existante).
                ROI immédiat, gain net 70-100 €/mois.
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

            <h2 id="artisans">Qualifications artisans requises</h2>
            <ul>
              {ARTISANS.map((a) => (
                <li key={a}>
                  <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                  {a}
                </li>
              ))}
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Estimer votre PAC géothermique
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Calcul instantané MPR + CEE + éco-PTZ. Mise en relation avec un artisan QualiPAC
                    géothermie vérifié. Comparaison vs PAC air-eau.
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
              href="/renovation-energetique/travaux/pompe-a-chaleur"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub pompe à chaleur
            </Link>
            <Link
              href="/rge/labels/qualipac"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              QualiPAC <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
