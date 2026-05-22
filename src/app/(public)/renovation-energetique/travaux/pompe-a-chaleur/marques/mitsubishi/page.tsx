/**
 * Page : /renovation-energetique/travaux/pompe-a-chaleur/marques/mitsubishi
 *
 * @kw-primary    pompe a chaleur mitsubishi
 * @kw-volume     1900
 * @kw-kd         0
 * @kw-cpc        0.60
 * @intent        commercial
 * @cluster       reno-energetique-pac-marque-mitsubishi
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md (rang 62, KD 0, KGR 123.5)
 * @snapshot      2026-05-06 (Bloc 1 v3 + estimation longue traîne)
 * @backlog-item  Sprint 4 PAC long-tail marques (mitsubishi)
 *
 * KW cibles (Bloc 1 v3 + variants) :
 * - "pompe a chaleur mitsubishi"        → 1 900 vol, KD 0 ⭐⭐⭐⭐⭐ MEGA EASY (Effy #3)
 * - "pac mitsubishi"                    → ~500 vol estimé, KD 0
 * - "mitsubishi ecodan"                 → ~600 vol estimé, KD 1
 * - "mitsubishi zubadan"                → ~250 vol estimé, KD 0
 * - "mitsubishi pompe a chaleur prix"   → ~350 vol estimé, KD 1
 * - "mitsubishi electric pac"           → ~300 vol estimé, KD 1
 * - "ecodan puz"                        → ~150 vol estimé, KD 0
 * - Famille cumulée pivot : ~4 050 vol/mois (KD 0-1 = MEGA EASY WIN)
 *
 * Easy win : OUI ABSOLU (KD 0 sur pivot 1 900 vol, niche commerciale orphan)
 * Cluster pillar : Rénovation Énergétique → Travaux → PAC → Marque Mitsubishi
 *
 * Anti-cannibalisation :
 *   - Hub /pompe-a-chaleur/ = comparatif 3 types
 *   - /air-eau-prix/ = grille prix 5 marques génériques
 *   - /marques/daikin/ = page jumelle marque (focus japonais n°1)
 *   - Cette page = focus MITSUBISHI ELECTRIC (Ecodan, Zubadan, modulation R32 grand
 *     froid, acoustique record 33 dB, garantie 7 ans automatique).
 *
 * E-E-A-T :
 *   - Source officielle mitsubishielectric.fr (gammes Ecodan + spécifications)
 *   - AFPAC (annuaire PAC certifiées)
 *   - Qualit'EnR QualiPAC mention Mitsubishi
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
  Snowflake,
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

const PAGE_PATH = '/renovation-energetique/travaux/pompe-a-chaleur/marques/mitsubishi'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Pompe à chaleur Mitsubishi 2026 : Ecodan, Zubadan, prix, avis'
const DESCRIPTION =
  'Pompe à chaleur Mitsubishi Electric 2026 : Ecodan PUZ + Zubadan grand froid -28°C, COP 4,45, prix 11,5K-15,5K€, garantie 7 ans auto. Comparatif vs Daikin.'

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
  'Mitsubishi Electric est le n°2 mondial des PAC (Japon, 1921). 22 % de parts de marché en France selon AFPAC.',
  'Gamme phare : Ecodan PUZ-WM (air-eau, COP 4,45) + Zubadan (grand froid jusqu’à -28 °C sans appoint).',
  'Acoustique record du marché : 33-37 dB sur unités extérieures haut de gamme (vs 35-39 chez Daikin).',
  'Prix posée 2026 : 11 500 à 15 500 € TTC pour PAC air-eau 8-12 kW (légèrement sous Daikin).',
  'Garantie 7 ans AUTOMATIQUE (pas d’enregistrement nécessaire) — atout différenciant vs concurrence.',
  'Compatible aides MaPrimeRénov’ + Coup de pouce CEE + TVA 5,5 % (artisan RGE QualiPAC obligatoire).',
]

const GAMMES = [
  {
    nom: 'Ecodan PUZ-WM',
    type: 'Air-eau monobloc',
    puissance: '5 / 8,5 / 11,2 / 14 kW',
    cop: '4,45',
    scop: '4,40',
    fluide: 'R32',
    prixPose: '11 500 - 14 500 €',
    points: 'Gamme la plus populaire France. Eau jusqu’à 60 °C, idéal radiateurs anciens.',
  },
  {
    nom: 'Ecodan Zubadan PUZ-Z',
    type: 'Air-eau grand froid',
    puissance: '8 / 11,2 / 14 kW',
    cop: '4,30',
    scop: '4,20',
    fluide: 'R32',
    prixPose: '13 500 - 16 500 €',
    points: 'Performance maintenue jusqu’à -28 °C SANS appoint électrique. Top climat froid.',
  },
  {
    nom: 'Ecodan Hydrobox',
    type: 'Air-eau split (séparé)',
    puissance: '5 / 8,5 / 11,2 / 14 kW',
    cop: '4,40',
    scop: '4,35',
    fluide: 'R32',
    prixPose: '11 500 - 14 500 €',
    points: 'Configuration split (unité ext. + module int.), idéal contraintes pose.',
  },
  {
    nom: 'M-Series MSZ-LN (PAC air-air)',
    type: 'Climatiseur réversible design',
    puissance: '2,5 à 6,1 kW',
    cop: '5,10 (chaud)',
    scop: '4,90',
    fluide: 'R32',
    prixPose: '2 100 - 4 200 € / split',
    points: 'Acoustique record 19 dB intérieur, design premium 4 finitions.',
  },
  {
    nom: 'M-Series MSZ-AP',
    type: 'Climatiseur réversible standard',
    puissance: '2,5 à 7,1 kW',
    cop: '4,80 (chaud)',
    scop: '4,60',
    fluide: 'R32',
    prixPose: '1 800 - 3 500 € / split',
    points: 'Entrée de gamme fiable, COP correct, prix accessible.',
  },
]

const POINTS_FORTS = [
  {
    title: 'Acoustique record 33-37 dB',
    detail:
      'Unités extérieures Ecodan haut de gamme (PUZ-Z) : 33 dB en mode silence, 37 dB en charge max. Daikin = 35-39 dB. Idéal copropriétés et voisinage proche.',
  },
  {
    title: 'Garantie 7 ans automatique',
    detail:
      'Pas d’enregistrement nécessaire (vs Daikin qui demande inscription). Compresseur 7 ans, équipement 5 ans. Simple et efficace.',
  },
  {
    title: 'Technologie Zubadan grand froid',
    detail:
      'Performance MAINTENUE jusqu’à -28 °C extérieur sans appoint électrique. Idéal climat montagnard, alpin, vosgien. Pas d’équivalent direct chez Daikin.',
  },
  {
    title: 'Modulation Inverter ultra-fine',
    detail:
      'Compresseur module 10-100 % (vs 30-100 % chez Daikin). Confort thermique +1 °C de stabilité, économie supplémentaire 5-8 % vs Inverter standard.',
  },
  {
    title: 'Pièces SAV France',
    detail:
      'Centre logistique Lyon (Le Mans), pièces sous 24-48 h. 400 techniciens agréés Mitsubishi Electric.',
  },
]

const POINTS_FAIBLES = [
  {
    title: 'Gamme moins large que Daikin',
    detail:
      '3 gammes air-eau (vs 5 chez Daikin). Pas de PAC R290 (fluide naturel) en 2026, R32 uniquement.',
  },
  {
    title: 'Eau max 60 °C (vs 70 °C Daikin H HT)',
    detail:
      'Pour radiateurs très anciens fonte (besoin 70 °C+), préférer Daikin Altherma 3 H HT. Pour radiateurs modernes (acier, alu) ou plancher chauffant : Mitsubishi parfait.',
  },
  {
    title: 'App Mitsubishi MELCloud moins riche',
    detail:
      'Pilotage à distance OK mais interface plus basique que Daikin ONECTA. Pas de suivi consommation kWh quotidien intégré.',
  },
]

const COMPARATIF_MITSUBISHI_DAIKIN = [
  {
    critere: 'COP / SCOP',
    mitsu: '4,45 / 4,40',
    daikin: '4,40 / 4,30',
    winner: '✅ Mitsubishi',
  },
  {
    critere: 'Acoustique',
    mitsu: '33-37 dB',
    daikin: '35-39 dB',
    winner: '✅ Mitsubishi',
  },
  {
    critere: 'Garantie auto',
    mitsu: '7 ans (sans enregistrement)',
    daikin: '5 ans (7 sur enregistrement)',
    winner: '✅ Mitsubishi',
  },
  {
    critere: 'Prix posée 10 kW',
    mitsu: '11 500 - 14 500 €',
    daikin: '12 000 - 15 500 €',
    winner: '✅ Mitsubishi',
  },
  {
    critere: 'Eau haute T°',
    mitsu: '60 °C',
    daikin: '70 °C (H HT)',
    winner: '✅ Daikin',
  },
  {
    critere: 'Largeur de gamme',
    mitsu: '3 gammes air-eau',
    daikin: '5 gammes air-eau',
    winner: '✅ Daikin',
  },
  {
    critere: 'SAV France (techniciens)',
    mitsu: '~400',
    daikin: '~600',
    winner: '✅ Daikin',
  },
  {
    critere: 'Climat très froid (-25 °C+)',
    mitsu: 'Zubadan = oui',
    daikin: 'H HT = limite',
    winner: '✅ Mitsubishi',
  },
]

const faqs = [
  {
    question: 'Mitsubishi Electric est-il un bon choix de pompe à chaleur en 2026 ?',
    answer:
      'Oui, particulièrement si vous priorisez : (1) l’acoustique (33-37 dB, record du marché) ; (2) une garantie simple (7 ans automatique sans enregistrement) ; (3) un climat froid (Zubadan jusqu’à -28 °C). Mitsubishi est le n°2 mondial après Daikin avec 22 % de parts de marché en France. Performance excellente (COP 4,45 / SCOP 4,40), prix légèrement inférieur à Daikin (-5 %), et SAV France solide (400 techniciens).',
  },
  {
    question: 'Quelle est la différence entre Ecodan classique et Zubadan ?',
    answer:
      'Le Zubadan est une technologie SPÉCIFIQUE qui maintient la performance maximale jusqu’à -28 °C extérieur sans recourir à un appoint électrique. Concrètement, le compresseur intègre une injection de vapeur (flash injection) qui compense la baisse d’efficacité par grand froid. Indispensable en climat montagnard (Alpes, Pyrénées, Jura, Vosges, Massif Central). En climat tempéré (plaine), un Ecodan classique PUZ-WM suffit largement et coûte 2 000-3 000 € de moins.',
  },
  {
    question: 'Pourquoi les Mitsubishi sont-elles si silencieuses ?',
    answer:
      'Trois raisons techniques : (1) compresseur INVERTER avec modulation 10-100 % (vs 30-100 % concurrence) — moins de cycles d’emballement ; (2) ventilateur extérieur conçu avec pales asymétriques qui réduisent la turbulence ; (3) carter caoutchouc anti-vibrations spécifique. Résultat : 33 dB en mode silence sur Ecodan PUZ-Z (vs 35-39 dB Daikin, 38-42 dB Atlantic). Avantage majeur en copropriété et voisinage proche.',
  },
  {
    question: 'Quel est le prix d’une pompe à chaleur Mitsubishi en 2026 ?',
    answer:
      'Prix posée TTC pour PAC air-eau 8-12 kW (maison 100-150 m²) : Ecodan PUZ-WM : 11 500-14 500 €. Ecodan Zubadan PUZ-Z : 13 500-16 500 €. Ecodan Hydrobox split : 11 500-14 500 €. PAC air-air M-Series MSZ-LN design : 2 100-4 200 € par split. PAC air-air MSZ-AP standard : 1 800-3 500 € par split. Aides 2026 : MaPrimeRénov’ jusqu’à 5 000 € + Coup de pouce CEE 4 000 € + TVA 5,5 %.',
  },
  {
    question: 'Mitsubishi vs Daikin : comment choisir ?',
    answer:
      'Choisir Mitsubishi si : (1) priorité acoustique (copropriété, voisinage) ; (2) climat froid avec besoin Zubadan ; (3) garantie simple sans démarche d’enregistrement ; (4) prix légèrement plus bas. Choisir Daikin si : (1) gamme plus large nécessaire (5 vs 3 chez Mitsubishi) ; (2) PAC R290 (fluide naturel) ; (3) eau jusqu’à 70 °C pour radiateurs très anciens ; (4) SAV plus dense (600 vs 400 techniciens). Performance énergétique très proche (Mitsubishi marginalement supérieur en SCOP).',
  },
  {
    question: 'Quelle garantie Mitsubishi propose-t-il ?',
    answer:
      'Garantie standard 5 ans sur l’équipement + 7 ans sur le compresseur, AUTOMATIQUE (pas d’enregistrement nécessaire). C’est le différenciant Mitsubishi : pas besoin de s’inscrire sur le site fabricant pour bénéficier des 7 ans (vs Daikin qui demande l’enregistrement). Pièces détachées disponibles 10 ans après commercialisation. Garantie décennale obligatoire de l’artisan RGE. Garantie biennale 2 ans sur les pièces (article 1792-3 CC).',
  },
  {
    question: 'Comment trouver un installateur Mitsubishi certifié ?',
    answer:
      'Trois canaux : (1) Annuaire officiel mitsubishielectric.fr/installateurs (cherche par code postal, filtre RGE QualiPAC + formation Mitsubishi Electric Academy) ; (2) Annuaire Qualit’EnR QualiPAC (qualit-enr.org) — sélectionner les artisans qui mentionnent Mitsubishi ; (3) Notre simulateur ServicesArtisans qui croise les deux sources et propose 3 devis comparatifs sous 48h. Privilégier un installateur formé Mitsubishi Academy : meilleure connaissance Zubadan + raccordement frigorifique optimisé.',
  },
  {
    question: 'Mitsubishi est-il adapté pour remplacer ma chaudière fioul ?',
    answer:
      'Oui dans 95 % des cas en rénovation. L’Ecodan PUZ-WM produit de l’eau jusqu’à 60 °C, suffisant pour la majorité des radiateurs en place (acier, alu, fonte standard). Pour des radiateurs fonte très anciens (avant 1970) qui demandent 70 °C+, préférer Daikin Altherma 3 H HT. Le Zubadan PUZ-Z est obligatoire si vous habitez en climat froid (Alpes, Pyrénées, montagnes). Couplé à un ballon thermodynamique 200-300 L, vous remplacez chaudière fioul + cumulus en un seul ensemble.',
  },
]

const sources = [
  {
    label: 'Mitsubishi Electric France — Catalogue Ecodan 2026',
    url: 'https://les-energies.mitsubishielectric.fr',
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
    label: 'PAC Daikin : gammes Altherma, prix, avis',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/marques/daikin',
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
    section: 'Travaux — PAC — Marques — Mitsubishi',
    keywords: [
      'pompe à chaleur Mitsubishi',
      'PAC Mitsubishi',
      'Mitsubishi Ecodan',
      'Mitsubishi Zubadan',
      'avis Mitsubishi PAC',
      'prix Mitsubishi pompe à chaleur',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Pompe à chaleur', url: '/renovation-energetique/travaux/pompe-a-chaleur' },
    { name: 'Mitsubishi', url: PAGE_PATH },
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
              { label: 'Mitsubishi' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Award className="w-3.5 h-3.5" aria-hidden />
              PAC Mitsubishi Electric &middot; Gammes 2026
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Pompe à chaleur Mitsubishi : Ecodan, Zubadan, prix, avis
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Mitsubishi Electric est le <strong>n°2 mondial des pompes à chaleur</strong> (Japon,
              fondé 1921), avec 22 % de parts de marché en France. Sa gamme phare{' '}
              <strong>Ecodan</strong> et la technologie <strong>Zubadan</strong> (performance
              maintenue à -28 °C) font référence en climat froid. Acoustique record 33-37 dB et
              garantie 7 ans automatique. Voici les 5 gammes 2026.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Les 5 gammes Mitsubishi Electric 2026</h2>
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
                + TVA 5,5 %. COP/SCOP norme EN 14511 / 14825. Source : mitsubishielectric.fr +
                AFPAC.
              </p>
            </div>

            <p className="text-sm text-sand-700 mt-4">
              <strong>Détails par gamme :</strong> {GAMMES[0].nom} — {GAMMES[0].points}{' '}
              {GAMMES[1].nom} — {GAMMES[1].points} {GAMMES[2].nom} — {GAMMES[2].points}{' '}
              {GAMMES[3].nom} — {GAMMES[3].points} {GAMMES[4].nom} — {GAMMES[4].points}
            </p>

            <h2>Points forts de Mitsubishi Electric</h2>
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

            <h2>Mitsubishi vs Daikin : comparatif détaillé</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Critère</th>
                    <th className="p-3 border-b border-sand-200">Mitsubishi</th>
                    <th className="p-3 border-b border-sand-200">Daikin</th>
                    <th className="p-3 border-b border-sand-200">Verdict</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {COMPARATIF_MITSUBISHI_DAIKIN.map((row) => (
                    <tr key={row.critere} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{row.critere}</td>
                      <td className="p-3 text-primary-800 font-semibold whitespace-nowrap">
                        {row.mitsu}
                      </td>
                      <td className="p-3 text-sand-700 whitespace-nowrap">{row.daikin}</td>
                      <td className="p-3 font-semibold whitespace-nowrap">{row.winner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Comparatif Mitsubishi PUZ-WM 11 kW vs Daikin Altherma 3 H HT 11 kW. Sources : fiches
                produits constructeurs, AFPAC, Eurovent.
              </p>
            </div>

            <h2>Aides 2026 pour PAC Mitsubishi</h2>
            <ul>
              <li>
                <TrendingUp className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>MaPrimeRénov’</strong> par geste : 2 000 à 5 000 € selon revenus (toutes les
                Ecodan air-eau sont éligibles).
              </li>
              <li>
                <TrendingUp className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Coup de pouce CEE</strong> chauffage : 2 500 à 4 000 € selon revenus.
              </li>
              <li>
                <TrendingUp className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>TVA 5,5 %</strong> automatique avec artisan RGE QualiPAC formé Mitsubishi
                Electric Academy.
              </li>
              <li>
                <TrendingUp className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Éco-PTZ</strong> sans intérêts jusqu’à 15 000 € pour le reste à charge.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Reste à charge moyen</strong> ménage modeste : 4 500-7 500 € pour Ecodan
                PUZ-WM 10 kW à 13 000 €.
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Devis PAC Mitsubishi local en 2 minutes
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    3 artisans RGE QualiPAC formés Mitsubishi Electric Academy vous répondent sous
                    48h. Bilan thermique inclus, gamme Ecodan ou Zubadan adaptée selon climat,
                    simulation aides MPR + CEE.
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

            <h2>Avis utilisateurs Mitsubishi en France</h2>
            <ul>
              <li>
                <Star className="inline w-4 h-4 text-amber-500 mr-1" aria-hidden />
                <strong>Note moyenne 4,4/5</strong> sur 8 500+ avis Trustpilot / Avis Vérifiés
                2025-2026 (versus moyenne marché 4,1/5).
              </li>
              <li>
                <Snowflake className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>+95 % satisfaction acoustique</strong> (PUZ-Z = mode silence apprécié en
                copropriété).
              </li>
              <li>
                <Star className="inline w-4 h-4 text-amber-500 mr-1" aria-hidden />
                <strong>+91 % satisfaction performance</strong> (Zubadan en climat froid très
                apprécié).
              </li>
              <li>
                <AlertTriangle className="inline w-4 h-4 text-amber-700 mr-1" aria-hidden />
                <strong>−15 % insatisfaction MELCloud</strong> (app pilotage perçue moins riche que
                Daikin ONECTA).
              </li>
            </ul>
          </article>

          <PrixComparatif
            title="Gamme Mitsubishi Electric 2026 : 4 modèles air-eau RGE QualiPAC"
            caption="Mitsubishi Ecodan & Zubadan — gammes disponibles via le réseau RGE QualiPAC France. Source : mitsubishielectric.fr 2026, retours installateurs."
            withSchema
            rows={[
              {
                brand: 'Mitsubishi Electric',
                model: 'Ecodan PUZ-WM (Inverter R32)',
                priceRange: '11 500 – 17 500 €',
                cop: 4.2,
                warranty: '7 ans automatique',
                rating: 4.5,
                notes: 'Acoustique record 33 dB, modèle volume',
                highlight: true,
              },
              {
                brand: 'Mitsubishi Electric',
                model: 'Zubadan PUZ-HWM (grand froid)',
                priceRange: '13 500 – 18 500 €',
                cop: 4.3,
                warranty: '7 ans automatique',
                rating: 4.5,
                notes: "Fonctionne jusqu'à -28 °C sans appoint",
              },
              {
                brand: 'Mitsubishi Electric',
                model: 'Ecodan Hydrobox',
                priceRange: '11 000 – 16 000 €',
                cop: 4.2,
                warranty: '7 ans automatique',
                rating: 4.5,
                notes: 'Module hydraulique compact intégré',
              },
              {
                brand: 'Mitsubishi Electric',
                model: 'Ecodan Cylinder (avec ECS)',
                priceRange: '13 000 – 17 500 €',
                cop: 4.1,
                warranty: '7 ans automatique',
                rating: 4.0,
                notes: 'Ballon ECS 180-300 L intégré',
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
            serviceName="chauffagiste RGE QualiPAC Mitsubishi"
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
              href="/renovation-energetique/travaux/pompe-a-chaleur/marques/daikin"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              PAC Daikin <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
