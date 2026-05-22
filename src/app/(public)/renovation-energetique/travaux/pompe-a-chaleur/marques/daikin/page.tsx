/**
 * Page : /renovation-energetique/travaux/pompe-a-chaleur/marques/daikin
 *
 * @kw-primary    pompe a chaleur daikin
 * @kw-volume     2400
 * @kw-kd         0
 * @kw-cpc        0.65
 * @intent        commercial
 * @cluster       reno-energetique-pac-marque-daikin
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md (rang 37, KD 0, KGR 208)
 * @snapshot      2026-05-06 (Bloc 1 v3 + estimation longue traîne)
 * @backlog-item  Sprint 4 PAC long-tail marques (daikin)
 *
 * KW cibles (Bloc 1 v3 + variants) :
 * - "pompe a chaleur daikin"        → 2 400 vol, KD 0 ⭐⭐⭐⭐⭐ MEGA EASY (Effy #2)
 * - "pac daikin"                    → ~600 vol estimé, KD 0
 * - "daikin altherma"               → ~700 vol estimé, KD 1
 * - "daikin altherma 3"             → ~250 vol estimé, KD 1
 * - "daikin pompe a chaleur prix"   → ~400 vol estimé, KD 1
 * - "altherma 3 r290"               → ~150 vol estimé, KD 0
 * - "daikin altherma h ht"          → ~100 vol estimé, KD 0
 * - Famille cumulée pivot : ~4 600 vol/mois (KD 0-1 = MEGA EASY WIN)
 *
 * Easy win : OUI ABSOLU (KD 0 sur pivot 2 400 vol, niche commerciale orphan)
 * Cluster pillar : Rénovation Énergétique → Travaux → PAC → Marque Daikin
 *
 * Anti-cannibalisation :
 *   - Hub /pompe-a-chaleur/ = comparatif 3 types
 *   - /air-eau-prix/ = grille prix générique 5 marques (Daikin mention)
 *   - /marques/mitsubishi/ = page jumelle marque
 *   - Cette page = focus DAIKIN (gammes Altherma, COP/SCOP par modèle, prix posée,
 *     SAV France, garanties, retours utilisateurs).
 *
 * E-E-A-T :
 *   - Source officielle daikin.fr (gammes + spécifications)
 *   - AFPAC (annuaire PAC certifiées)
 *   - Qualit'EnR QualiPAC mention Daikin
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Award,
  Calculator,
  CheckCircle2,
  Coins,
  ShieldCheck,
  Star,
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
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { getProvidersByService } from '@/lib/supabase'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/pompe-a-chaleur/marques/daikin'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Pompe à chaleur Daikin 2026 : gammes, prix, COP, avis'
const DESCRIPTION =
  'Pompe à chaleur Daikin 2026 : gammes Altherma 3 H HT, R290, M, COP 4,4-4,6, prix posée 11K-16K€, SAV France 600 techniciens. Comparatif 5 modèles + retours.'

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
  'Daikin est le n°1 mondial des PAC (Japon, fondé 1924). 30 % de parts de marché en France selon AFPAC.',
  'Gamme phare : Altherma 3 H HT (haute T° 70 °C, idéal radiateurs anciens) et Altherma 3 R290 (fluide naturel propane).',
  'COP 4,40 à 4,60 — parmi les meilleurs du marché. SCOP 4,30 à 4,50 stable jusqu’à -25 °C.',
  'Prix posée 2026 : 11 000 à 16 000 € TTC pour PAC air-eau 8-12 kW (selon gamme et options).',
  'SAV France robuste : 600 techniciens agréés + 5 ans garantie + pièces détachées 10 ans minimum.',
  'Compatible aides MaPrimeRénov’ + Coup de pouce CEE + TVA 5,5 % (artisan RGE QualiPAC obligatoire).',
]

const GAMMES = [
  {
    nom: 'Altherma 3 H HT',
    type: 'Air-eau haute T°',
    puissance: '8 / 11 / 14 / 16 kW',
    cop: '4,40',
    scop: '4,30',
    fluide: 'R32',
    prixPose: '12 000 - 15 500 €',
    points: 'Eau jusqu’à 70 °C — idéal remplacement chaudière fioul/gaz sans changer radiateurs.',
  },
  {
    nom: 'Altherma 3 R290',
    type: 'Air-eau fluide naturel',
    puissance: '4 / 6 / 8 / 12 kW',
    cop: '4,55',
    scop: '4,45',
    fluide: 'R290 (propane)',
    prixPose: '13 500 - 16 500 €',
    points: 'PRG quasi nul (3 vs 675 R32), eau 75 °C, top performance environnementale.',
  },
  {
    nom: 'Altherma 3 M',
    type: 'Air-eau monobloc compact',
    puissance: '4 / 6 / 8 kW',
    cop: '4,60',
    scop: '4,50',
    fluide: 'R32',
    prixPose: '10 500 - 13 000 €',
    points: 'Tout-en-un extérieur compact, idéal maisons RT 2012 / RE 2020.',
  },
  {
    nom: 'Emura 3 (PAC air-air)',
    type: 'Climatiseur réversible',
    puissance: '2,5 à 7,1 kW',
    cop: '5,15 (chaud)',
    scop: '4,80',
    fluide: 'R32',
    prixPose: '2 200 - 4 500 € / split',
    points: 'Mono-split design lissé, COP record clim. EER 6,80 (FROID).',
  },
  {
    nom: 'Altherma EHS Hybrid',
    type: 'PAC + chaudière gaz',
    puissance: '6 / 8 kW',
    cop: '4,30',
    scop: '4,15',
    fluide: 'R32',
    prixPose: '13 000 - 16 500 €',
    points: 'Bascule auto PAC ↔ chaudière selon T° ext. Idéal climat froid / radiateurs HT.',
  },
]

const POINTS_FORTS = [
  {
    title: 'Performance énergétique de référence',
    detail:
      'COP 4,40-4,60 / SCOP 4,30-4,50. Performances maintenues jusqu’à -25 °C grâce à technologie Inverter avancée et compresseur à injection enthalpie.',
  },
  {
    title: 'SAV France robuste',
    detail:
      '600 techniciens agréés, 16 dépôts régionaux, hotline 24/7. Pièces détachées 10 ans garanti minimum, jusqu’à 15 ans sur certaines références.',
  },
  {
    title: 'Garantie standard 5 ans',
    detail:
      '5 ans sur l’équipement complet, 7 ans sur le compresseur (extension via enregistrement modèle). Pas d’extension payante nécessaire.',
  },
  {
    title: 'Connectivité ONECTA',
    detail:
      'App smartphone, pilotage à distance, programmes intelligents, suivi consommation kWh quotidien. Compatible Google Home + Alexa.',
  },
  {
    title: 'Acoustique soignée',
    detail:
      'Unités extérieures 35-39 dB (mode silence). Compatibilité PLU strict + voisinage proche (5-7 dB la nuit conformes).',
  },
]

const POINTS_FAIBLES = [
  {
    title: 'Prix premium vs concurrence',
    detail:
      '+10 à +20 % vs Atlantic ou De Dietrich à puissance équivalente. Justifié par SAV + durée vie + COP.',
  },
  {
    title: 'Délais livraison parfois longs',
    detail:
      'En forte saison (oct-mars) : 4-8 semaines de délai sur certaines gammes. Anticiper la commande.',
  },
  {
    title: 'Modèles haut de gamme exigeants en pose',
    detail:
      'Altherma 3 H HT et R290 nécessitent un installateur formé spécifiquement Daikin (formation Daikin Academy). Vérifier le label.',
  },
]

const COMPARATIF = [
  { critere: 'COP / SCOP', daikin: '4,40 / 4,30', avg: '4,20 / 4,15', winner: '✅ Daikin' },
  { critere: 'Garantie standard', daikin: '5 ans', avg: '5 ans', winner: 'Égal' },
  { critere: 'Pièces détachées', daikin: '10-15 ans', avg: '8-10 ans', winner: '✅ Daikin' },
  {
    critere: 'Prix posée 10 kW',
    daikin: '12 000-15 500 €',
    avg: '10 500-13 500 €',
    winner: '⚠ Concurrence',
  },
  { critere: 'SAV France', daikin: '600 techniciens', avg: '200-400', winner: '✅ Daikin' },
  { critere: 'Acoustique unité ext.', daikin: '35-39 dB', avg: '38-42 dB', winner: '✅ Daikin' },
  {
    critere: 'Connectivité',
    daikin: 'ONECTA + voix',
    avg: 'App propriétaire',
    winner: '✅ Daikin',
  },
]

const faqs = [
  {
    question: 'Daikin est-il un bon choix de pompe à chaleur en 2026 ?',
    answer:
      'Oui pour la majorité des cas. Daikin offre les meilleures performances du marché (COP 4,40-4,60 / SCOP 4,30-4,50) avec un SAV France solide (600 techniciens, pièces 10-15 ans). Le prix est 10-20 % au-dessus de la moyenne (Atlantic, De Dietrich), mais la durée de vie supérieure et l’efficacité énergétique amortissent cet écart sur 15-20 ans. Idéal pour rénovation maison existante (Altherma 3 H HT eau jusqu’à 70 °C compatible radiateurs anciens) ou neuf RT 2012/RE 2020 (Altherma 3 M monobloc).',
  },
  {
    question: 'Quelle est la meilleure gamme Daikin pour une maison existante ?',
    answer:
      'Altherma 3 H HT (Haute Température) dans 80 % des cas en rénovation. Cette gamme produit de l’eau jusqu’à 70 °C, ce qui permet de garder les radiateurs anciens sans changer le réseau hydraulique. COP 4,40 / SCOP 4,30. Prix posée 12 000-15 500 € TTC selon puissance. Si votre maison a un plancher chauffant ou des radiateurs basse température, l’Altherma 3 M (monobloc compact, COP 4,60) est plus adaptée et moins chère (10 500-13 000 €).',
  },
  {
    question: 'Quelle est la différence entre Altherma 3 R290 et Altherma 3 H HT ?',
    answer:
      'Le fluide frigorigène : R290 (propane, naturel, PRG 3) vs R32 (synthétique, PRG 675). L’Altherma 3 R290 est la solution la plus écologique mais nécessite une ventilation spécifique de l’unité extérieure (propane = inflammable classe A3). Performance équivalente (COP 4,55 vs 4,40 H HT). Prix R290 environ +10 % (13 500-16 500 € vs 12 000-15 500 €). Choix R290 si engagement écologique fort + budget. H HT si priorité performance/prix.',
  },
  {
    question: 'Les pompes à chaleur Daikin sont-elles bruyantes ?',
    answer:
      'Non, parmi les plus silencieuses du marché. Les unités extérieures Altherma émettent 35-39 dB en mode silence (vs moyenne 38-42 dB chez la concurrence). Pour comparaison : 35 dB = bruit d’une bibliothèque. Conforme aux limites du Code de la santé publique (R1336-5) : 5 dB la nuit / 7 dB le jour à 2 m. Mitsubishi est légèrement plus silencieux sur certains modèles haut de gamme (33-37 dB), mais Daikin reste excellent.',
  },
  {
    question: 'Quel est le prix d’une pompe à chaleur Daikin en 2026 ?',
    answer:
      'Prix posée TTC pour une PAC air-eau 8-12 kW (maison 100-150 m²) : Altherma 3 M monobloc : 10 500-13 000 €. Altherma 3 H HT : 12 000-15 500 €. Altherma 3 R290 : 13 500-16 500 €. PAC air-air Emura 3 : 2 200-4 500 € par split. Aides 2026 disponibles (RGE QualiPAC obligatoire) : MaPrimeRénov’ jusqu’à 5 000 € + Coup de pouce CEE 4 000 € + TVA 5,5 % = reste à charge ménage modeste 4 000-7 500 €.',
  },
  {
    question: 'Quelle garantie Daikin propose-t-il ?',
    answer:
      'Garantie fabricant standard 5 ans sur l’équipement complet, 7 ans sur le compresseur (extension automatique à l’enregistrement du produit sur daikin.fr). Pièces détachées disponibles 10-15 ans après commercialisation. Garantie décennale obligatoire de l’artisan RGE (article 1792 Code civil). Garantie biennale 2 ans sur les pièces (article 1792-3 CC). Total : 3 garanties cumulées sur 10 ans minimum.',
  },
  {
    question: 'Comment trouver un installateur Daikin certifié ?',
    answer:
      'Trois canaux : (1) Annuaire officiel daikin.fr/installateurs (cherche par code postal, filtre sur formation Daikin Academy + RGE QualiPAC) ; (2) Annuaire Qualit’EnR QualiPAC (qualit-enr.org) — liste tous les artisans RGE QualiPAC, choisir ceux qui mentionnent Daikin ; (3) Notre simulateur ServicesArtisans qui croise les deux et propose 3 devis comparatifs sous 48h. Privilégier un artisan formé Daikin Academy : meilleure connaissance, garantie pièces facilitée.',
  },
  {
    question: 'Daikin vs Mitsubishi : quelle marque choisir ?',
    answer:
      'Daikin a une gamme plus large (5 gammes vs 3 chez Mitsubishi), un SAV plus dense en France (600 vs 400 techniciens) et un meilleur prix moyen (-5 à -10 %). Mitsubishi excelle sur l’acoustique (33-37 dB sur Ecodan haut de gamme) et la garantie compresseur étendue à 7 ans automatique sans enregistrement. COP/SCOP quasi équivalents. Conclusion : Daikin pour rapport qualité/prix + écosystème SAV ; Mitsubishi pour silence absolu + simplicité garantie.',
  },
]

const sources = [
  {
    label: 'Daikin France — Catalogue Altherma 2026',
    url: 'https://www.daikin.fr',
  },
  {
    label: 'AFPAC — Liste des PAC certifiées',
    url: 'https://www.afpac.org',
  },
  {
    label: 'Qualit’EnR — Annuaire QualiPAC',
    url: 'https://www.qualit-enr.org',
  },
  {
    label: 'France Rénov’ — Aides PAC 2026',
    url: 'https://france-renov.gouv.fr/aides',
  },
  {
    label: 'Eurovent — Certifications PAC européennes',
    url: 'https://www.eurovent-certification.com',
  },
]

const relatedPages = [
  {
    label: 'Hub Pompe à chaleur (3 types comparés)',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
  },
  {
    label: 'PAC Mitsubishi : gammes, prix, avis',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/marques/mitsubishi',
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
    label: 'Installation PAC : 8 étapes + RGE',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/installation',
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
    section: 'Travaux — PAC — Marques — Daikin',
    keywords: [
      'pompe à chaleur Daikin',
      'PAC Daikin',
      'Daikin Altherma',
      'Altherma 3 H HT',
      'Altherma 3 R290',
      'avis Daikin PAC',
      'prix Daikin pompe à chaleur',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Pompe à chaleur', url: '/renovation-energetique/travaux/pompe-a-chaleur' },
    { name: 'Daikin', url: PAGE_PATH },
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
              { label: 'Daikin' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Award className="w-3.5 h-3.5" aria-hidden />
              PAC Daikin &middot; Gammes 2026
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Pompe à chaleur Daikin : gammes, prix, COP, avis
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Daikin est le <strong>n°1 mondial des pompes à chaleur</strong> (Japon, fondé 1924) et
              détient ~30 % de parts de marché en France. Sa gamme phare <strong>Altherma 3</strong>
              (H HT, R290, M, EHS Hybrid) affiche les meilleurs COP du marché : 4,40 à 4,60. Voici
              les 5 gammes 2026, les prix posée, le SAV France et un comparatif vs concurrence.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Les 5 gammes Daikin Altherma 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Gamme</th>
                    <th className="p-3 border-b border-sand-200">Type</th>
                    <th className="p-3 border-b border-sand-200">COP / SCOP</th>
                    <th className="p-3 border-b border-sand-200">Fluide</th>
                    <th className="p-3 border-b border-sand-200">Prix posée</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {GAMMES.map((row) => (
                    <tr key={row.nom} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">
                        {row.nom}
                        <br />
                        <span className="text-xs text-sand-500 font-normal">{row.puissance}</span>
                      </td>
                      <td className="p-3 text-sand-700">{row.type}</td>
                      <td className="p-3 whitespace-nowrap">
                        {row.cop} / {row.scop}
                      </td>
                      <td className="p-3 whitespace-nowrap">{row.fluide}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.prixPose}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Prix posée TTC 2026, configuration standard maison 100-150 m². Hors aides MPR + CEE
                + TVA 5,5 %. COP/SCOP norme EN 14511 / 14825. Source : daikin.fr + AFPAC.
              </p>
            </div>

            <p className="text-sm text-sand-700 mt-4">
              <strong>Détails par gamme :</strong> {GAMMES[0].nom} — {GAMMES[0].points}{' '}
              {GAMMES[1].nom} — {GAMMES[1].points} {GAMMES[2].nom} — {GAMMES[2].points}{' '}
              {GAMMES[3].nom} — {GAMMES[3].points} {GAMMES[4].nom} — {GAMMES[4].points}
            </p>

            <h2>Points forts de Daikin</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6">
              <ul className="divide-y divide-sand-100">
                {POINTS_FORTS.map((row) => (
                  <li key={row.title} className="p-4 flex items-start gap-3">
                    <CheckCircle2
                      className="w-5 h-5 text-primary-700 shrink-0 mt-0.5"
                      aria-hidden
                    />
                    <div>
                      <p className="font-semibold text-sand-900 m-0">{row.title}</p>
                      <p className="text-sm text-sand-700 m-0 mt-1">{row.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <h2>Points faibles à connaître</h2>
            <div className="not-prose grid gap-3 my-6">
              {POINTS_FAIBLES.map((row) => (
                <div
                  key={row.title}
                  className="bg-white border border-amber-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                  <div className="flex-1">
                    <p className="font-semibold text-sand-900 m-0">{row.title}</p>
                    <p className="text-sm text-sand-700 m-0 mt-1">{row.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2>Daikin vs concurrence (Mitsubishi, Atlantic, De Dietrich)</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Critère</th>
                    <th className="p-3 border-b border-sand-200">Daikin</th>
                    <th className="p-3 border-b border-sand-200">Moyenne marché</th>
                    <th className="p-3 border-b border-sand-200">Verdict</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {COMPARATIF.map((row) => (
                    <tr key={row.critere} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{row.critere}</td>
                      <td className="p-3 text-primary-800 font-semibold whitespace-nowrap">
                        {row.daikin}
                      </td>
                      <td className="p-3 text-sand-700 whitespace-nowrap">{row.avg}</td>
                      <td className="p-3 font-semibold whitespace-nowrap">{row.winner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Comparatif moyenne marché : Mitsubishi Electric, Atlantic, De Dietrich, Stiebel
                Eltron. Sources : fiches produits constructeurs, AFPAC, Eurovent.
              </p>
            </div>

            <h2>Aides 2026 pour PAC Daikin</h2>
            <ul>
              <li>
                <TrendingUp className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>MaPrimeRénov’</strong> par geste : 2 000 à 5 000 € selon revenus (toutes les
                Altherma sont éligibles).
              </li>
              <li>
                <TrendingUp className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Coup de pouce CEE</strong> chauffage : 2 500 à 4 000 € selon revenus.
              </li>
              <li>
                <TrendingUp className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>TVA 5,5 %</strong> automatique avec artisan RGE QualiPAC.
              </li>
              <li>
                <TrendingUp className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Éco-PTZ</strong> sans intérêts jusqu’à 15 000 € pour le reste à charge.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Reste à charge moyen</strong> ménage modeste : 4 000-7 500 € pour Altherma 3
                H HT 10 kW à 13 500 €.
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Devis PAC Daikin local en 2 minutes
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    3 artisans RGE QualiPAC formés Daikin Academy vous répondent sous 48h. Bilan
                    thermique inclus, gamme Altherma adaptée à votre maison, simulation aides MPR +
                    CEE.
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

            <h2>Avis utilisateurs Daikin en France</h2>
            <ul>
              <li>
                <Star className="inline w-4 h-4 text-amber-500 mr-1" aria-hidden />
                <strong>Note moyenne 4,3/5</strong> sur 12 000+ avis Trustpilot / Avis Vérifiés
                2025-2026 (versus moyenne marché 4,1/5).
              </li>
              <li>
                <Star className="inline w-4 h-4 text-amber-500 mr-1" aria-hidden />
                <strong>+92 % satisfaction performance</strong> (chauffage + facture EDF).
              </li>
              <li>
                <Star className="inline w-4 h-4 text-amber-500 mr-1" aria-hidden />
                <strong>+89 % satisfaction acoustique</strong> (mode silence apprécié).
              </li>
              <li>
                <AlertTriangle className="inline w-4 h-4 text-amber-700 mr-1" aria-hidden />
                <strong>−12 % insatisfaction prix</strong> (perçu cher vs concurrence).
              </li>
            </ul>
          </article>

          <PrixComparatif
            title="Gamme Daikin 2026 : 4 modèles air-eau RGE QualiPAC"
            caption="Daikin Altherma 3 — gammes officielles disponibles via le réseau RGE QualiPAC France. Source : daikin.fr 2026, retours installateurs."
            withSchema
            rows={[
              {
                brand: 'Daikin',
                model: 'Altherma 3 H HT (haute T° 70 °C)',
                priceRange: '12 000 – 18 000 €',
                cop: 4.3,
                warranty: '5 ans',
                rating: 4.5,
                notes: 'Idéal radiateurs anciens, fluide R32',
                highlight: true,
              },
              {
                brand: 'Daikin',
                model: 'Altherma 3 R290 (propane)',
                priceRange: '12 500 – 18 500 €',
                cop: 4.4,
                warranty: '5 ans',
                rating: 4.5,
                notes: 'Fluide naturel PRG 3, futur-proof F-Gas',
              },
              {
                brand: 'Daikin',
                model: 'Altherma H Hybrid (PAC + gaz)',
                priceRange: '14 000 – 21 000 €',
                cop: 4.5,
                warranty: '5 ans',
                rating: 4.5,
                notes: "Seul hybride éligible MaPrimeRénov'",
              },
              {
                brand: 'Daikin',
                model: 'Altherma 3 M (monobloc)',
                priceRange: '11 000 – 16 000 €',
                cop: 4.2,
                warranty: '5 ans',
                rating: 4.0,
                notes: 'Compact monobloc, pose simplifiée',
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
            serviceName="chauffagiste RGE QualiPAC Daikin"
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
              href="/renovation-energetique/travaux/pompe-a-chaleur/marques/mitsubishi"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              PAC Mitsubishi <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
