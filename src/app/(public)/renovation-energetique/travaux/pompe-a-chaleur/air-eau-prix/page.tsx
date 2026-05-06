/**
 * Page : /renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix
 *
 * @kw-primary    prix pompe a chaleur air eau
 * @kw-volume     2263
 * @kw-kd         1
 * @kw-cpc        1.20
 * @intent        commercial
 * @cluster       reno-energetique-pac-air-eau-prix
 * @ahrefs-source api-live
 * @snapshot      2026-05-06
 * @backlog-item  Sprint 2 cash cow PAC air-eau-prix
 *
 * KW cibles (validés Ahrefs API live, snapshot 2026-05-03, country=fr) :
 * - "prix pompe a chaleur air eau"  → 2 263 vol, KD 1, CPC $1,20, clicks 2 947 ⭐
 * - "pac air eau prix"              → 126 vol, KD 2, CPC $1,40
 * - "prix pac air eau"              → variant générique (vol cumulé estimé ~200)
 * - "pompe a chaleur air eau prix"  → variant générique
 * - "tarif pac air eau"             → ~50 vol estimé
 * - Famille cumulée pivot : ~2 500 vol/mois
 *
 * Source : audit Ahrefs API live (cf docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md
 *          recalibré 2026-05-03)
 * Easy win : OUI (KD 1 sur KW pivot, vol > 2 000, CPC > 1 USD intent commercial)
 * Cluster pillar : Rénovation Énergétique → Travaux → Chauffage → PAC air-eau
 *
 * Anti-cannibalisation :
 *   - Hub parent /renovation-energetique/travaux/pompe-a-chaleur/ = comparaison 3 types PAC
 *   - Source guide /guides/prix-pompe-chaleur-air-eau-installee = grille technique 6-16 kW
 *   - Cette page = sous-page TRANSACTIONNELLE (intent "combien ça coûte exactement",
 *     focus sur prix + facteurs + erreurs devis, contenu différent du guide source)
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Droplet,
  TrendingDown,
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

const PAGE_PATH = '/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-03'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Prix PAC air-eau 2026 : 10-18K€ posée'
const DESCRIPTION =
  'Prix pompe à chaleur air-eau 2026 : 10 000-18 000 € TTC posée selon puissance. Aides MPR + CEE jusquà 9 000 €. Grille 6-16 kW, devis types.'

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
  'Prix moyen 2026 d’une PAC air-eau posée : 10 000 à 18 000 € TTC, hors aides.',
  'Tarif décomposé : 4 000-7 000 € équipement + 3 000-5 000 € pose + 1 500-3 000 € hydraulique + 1 500-3 000 € options.',
  'Reste à charge ménage très modeste : 3 000-5 000 € après cumul MaPrimeRénov’ + Coup de pouce CEE.',
  'TVA 5,5 % automatique avec un artisan RGE QualiPAC = économie ~14 % vs TVA 20 %.',
  'Écart entre 3 devis à configuration équivalente : 15-25 % typique. Demandez 3 devis avant de signer.',
]

const PRICE_GRID = [
  {
    power: '6-8 kW',
    surface: '80-100 m² bien isolée RT 2012',
    price: '9 500 à 12 500 €',
    note: 'Maison neuve ou rénovation thermique récente',
  },
  {
    power: '8-10 kW',
    surface: '100-130 m² RT 2012',
    price: '11 000 à 14 000 €',
    note: 'Cas standard remplacement chaudière en rénovation',
  },
  {
    power: '10-12 kW',
    surface: '130-160 m² moyennement isolée',
    price: '12 500 à 16 000 €',
    note: 'Maison années 80-90 avec isolation partielle',
  },
  {
    power: '12-14 kW',
    surface: '150-180 m² peu isolée',
    price: '14 000 à 18 000 €',
    note: 'Audit énergétique recommandé avant devis',
  },
  {
    power: '14-16 kW',
    surface: '180-220 m² ou mal isolée',
    price: '16 000 à 22 000 €',
    note: 'Envisager isolation préalable pour réduire la puissance',
  },
]

const COST_BREAKDOWN = [
  { label: 'Unité extérieure (compresseur + ventilateur)', range: '3 000 - 5 500 €' },
  {
    label: 'Module hydraulique intérieur (échangeur + pompe + régulation)',
    range: '1 500 - 2 500 €',
  },
  { label: 'Pose + raccordement + mise en service', range: '2 500 - 4 000 €' },
  {
    label: 'Adaptation hydraulique (vase d’expansion, bouclage, robinets)',
    range: '500 - 2 000 €',
  },
  { label: 'Adaptation électrique (tableau, disjoncteur dédié)', range: '300 - 1 500 €' },
  { label: 'Dépose ancienne chaudière + évacuation cuve fioul', range: '500 - 2 500 €' },
  { label: 'Module ECS optionnel (ballon thermodynamique 200-300 L)', range: '1 200 - 2 500 €' },
]

const AIDES_TABLE = [
  {
    profil: 'Très modestes (bleu)',
    mpr: '5 000 €',
    cee: '4 000 €',
    cumul: '9 000 €',
    rac: '3 000 - 5 000 €',
  },
  {
    profil: 'Modestes (jaune)',
    mpr: '4 000 €',
    cee: '4 000 €',
    cumul: '8 000 €',
    rac: '4 000 - 6 000 €',
  },
  {
    profil: 'Intermédiaires (violet)',
    mpr: '3 000 €',
    cee: '3 000 €',
    cumul: '6 000 €',
    rac: '6 000 - 8 000 €',
  },
  {
    profil: 'Supérieurs (rose)',
    mpr: '2 000 €',
    cee: '2 500 €',
    cumul: '4 500 €',
    rac: '7 500 - 10 000 €',
  },
]

const MARQUES = [
  {
    marque: 'Daikin (JP)',
    modele: 'Altherma 3 H HT',
    cop: '4,40',
    scop: '4,30',
    prix: '11 000 - 15 000 €',
    garantie: '5 ans',
    point: 'Leader mondial, SAV France dense, COP excellent jusqu’à -25 °C.',
  },
  {
    marque: 'Mitsubishi Electric (JP)',
    modele: 'Ecodan PUZ',
    cop: '4,45',
    scop: '4,40',
    prix: '11 500 - 15 500 €',
    garantie: '5-7 ans',
    point: 'Très silencieux (35-39 dB), fiable longue durée, modulation fine.',
  },
  {
    marque: 'Atlantic (FR)',
    modele: 'Alféa Excellia AI',
    cop: '4,30',
    scop: '4,25',
    prix: '10 500 - 14 000 €',
    garantie: '5 ans',
    point: 'Fabrication française (La Roche-sur-Yon), pièces SAV rapides.',
  },
  {
    marque: 'De Dietrich (FR)',
    modele: 'Strateo MR',
    cop: '4,45',
    scop: '4,40',
    prix: '11 000 - 14 500 €',
    garantie: '5 ans',
    point: 'Compact, parfait remplacement chaudière fioul, hybridation possible.',
  },
  {
    marque: 'Stiebel Eltron (DE)',
    modele: 'WPL HT',
    cop: '4,50',
    scop: '4,45',
    prix: '12 000 - 16 000 €',
    garantie: '5 ans',
    point: 'Ingénierie allemande, robustesse +15 ans, idéal climat froid.',
  },
]

const ROI_10_ANS = [
  {
    profil: 'Fioul → PAC, modeste',
    facture: '2 500 €/an → 900 €/an',
    rac: '4 000 €',
    eco10: '16 000 €',
    roi: '2,5 ans',
  },
  {
    profil: 'Gaz → PAC, intermédiaire',
    facture: '1 800 €/an → 800 €/an',
    rac: '6 000 €',
    eco10: '10 000 €',
    roi: '6 ans',
  },
  {
    profil: 'Électrique → PAC, modeste',
    facture: '2 800 €/an → 950 €/an',
    rac: '4 000 €',
    eco10: '18 500 €',
    roi: '2,2 ans',
  },
  {
    profil: 'Fioul → PAC, supérieur',
    facture: '2 500 €/an → 900 €/an',
    rac: '8 000 €',
    eco10: '16 000 €',
    roi: '5 ans',
  },
]

const PIEGES = [
  {
    title: 'Plancher chauffant neuf à créer',
    impact: '+3 000 à 8 000 €',
    desc: 'Si votre maison n’a pas de plancher chauffant et que les radiateurs existants ne suffisent pas, créer un plancher chauffant ajoute du gros œuvre. Alternative : PAC haute température compatible radiateurs (+5-10 % vs PAC standard).',
  },
  {
    title: 'Refonte tableau électrique',
    impact: '+500 à 1 500 €',
    desc: 'Une PAC peut imposer un renforcement de l’abonnement (9 → 12 kVA) et un disjoncteur différentiel dédié. Coût souvent oublié sur les devis low-cost.',
  },
  {
    title: 'Emplacement unité extérieure contraint',
    impact: '+500 à 2 000 €',
    desc: 'Copropriété avec règlement, voisinage acoustique, distance > 5 m du module hydraulique : études et travaux supplémentaires. Vérifier avant signature.',
  },
  {
    title: 'Frais cachés dépose chaudière fioul',
    impact: '+800 à 2 500 €',
    desc: 'L’évacuation d’une cuve fioul (dégazage, démantelement) est obligatoire et coûte 800-2 500 € selon volume. Souvent absent des devis.',
  },
]

const faqs = [
  {
    question: 'Combien coûte précisément une PAC air-eau installée en 2026 ?',
    answer:
      'Entre 10 000 et 18 000 € TTC pour le prix tout compris : équipement (unité ext. + module int.), pose, raccordement hydraulique et électrique, mise en service, garanties. Pour une maison standard 100-130 m² RT 2012, comptez 11 000-14 000 € TTC. Le prix peut grimper à 22 000 € pour des maisons grandes ou mal isolées (PAC 14-16 kW).',
  },
  {
    question: 'Quelles sont les aides 2026 pour une PAC air-eau ?',
    answer:
      'MaPrimeRénov’ par geste : 2 000 à 5 000 € selon revenus (barème bleu/jaune/violet/rose). Coup de pouce CEE chauffage : 2 500 à 4 000 €. Cumul jusqu’à 9 000 € pour ménages très modestes. TVA 5,5 % automatique avec artisan RGE = économie ~14 % vs TVA 20 %. Éco-PTZ jusqu’à 15 000 € pour compléter sans intérêts.',
  },
  {
    question: 'Pourquoi les devis PAC air-eau varient autant ?',
    answer:
      'Quatre facteurs principaux : (1) puissance thermique en kW (déterminée par bilan déperditions G de la maison), (2) COP / SCOP du modèle (plus il est élevé, plus la PAC consomme moins), (3) configuration hydraulique (radiateurs existants vs plancher chauffant neuf), (4) adaptation électrique (tableau à reprendre +500-1 500 €). Écart typique entre devis : 15-25 % à configuration équivalente.',
  },
  {
    question: 'Quel est le reste à charge réel pour un ménage modeste ?',
    answer:
      'Pour une PAC air-eau 10 kW (12 000 € TTC) chez un ménage modeste (jaune) : 12 000 - 4 000 € MPR - 4 000 € CEE = 4 000 € reste à charge. Si vous ajoutez la TVA 5,5 % (au lieu de 20 %), l’économie supplémentaire est d’environ 1 700 €. Total reste à charge effectif : ~2 300-4 000 € selon configuration.',
  },
  {
    question: 'La « PAC à 1 € » existe-t-elle encore en 2026 ?',
    answer:
      'Non. Le Coup de pouce CEE a été significativement réduit depuis 2024 et n’atteint plus le seuil nécessaire pour couvrir 100 % du prix d’une PAC. Toute offre « à 1 € » en 2026 cache soit une sous-performance (COP < 3,0), soit un reste à charge dissimulé en post-installation, soit une fraude aux aides (poursuites pénales possibles). Privilégiez 3 devis comparés.',
  },
  {
    question: 'Combien coûte l’entretien annuel d’une PAC air-eau ?',
    answer:
      'L’entretien annuel est obligatoire (décret 2020-912) et coûte 150 à 250 € TTC selon la marque et le contrat. Il inclut : vérification du circuit frigorifique, contrôle des sécurités électriques, nettoyage de l’unité extérieure, ajustement de la régulation. Attention : sans entretien attesté, la garantie fabricant peut tomber.',
  },
  {
    question: 'Comment économiser sur le prix d’une PAC ?',
    answer:
      'Cinq leviers : (1) demandez 3 devis d’artisans RGE QualiPAC (économie potentielle 15-25 %), (2) signez avant changement de barème CEE (consultez les arrêtés JORF), (3) choisissez un modèle français ou européen (SAV plus fiable, économie sur 15 ans), (4) cumulez MPR + CEE + TVA 5,5 % (jamais oublié), (5) financez le reste à charge par éco-PTZ sans intérêts (jusqu’à 15 000 €).',
  },
]

const sources = [
  {
    label: 'France Rénov’ — Barèmes MaPrimeRénov’ PAC 2026',
    url: 'https://france-renov.gouv.fr/aides/maprimerenov',
  },
  { label: 'ADEME — Fiches techniques pompes à chaleur', url: 'https://agir.ademe.fr' },
  {
    label: 'AFPAC — Association française pour les pompes à chaleur',
    url: 'https://www.afpac.org',
  },
  { label: 'Qualit’EnR — Annuaire QualiPAC officiel', url: 'https://www.qualit-enr.org' },
  { label: 'Légifrance — Décret 2020-912 entretien PAC', url: 'https://www.legifrance.gouv.fr' },
]

const relatedPages = [
  {
    label: 'Hub pompe à chaleur (3 types comparés)',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
  },
  {
    label: 'Guide PAC air-eau installée — version technique',
    href: '/guides/prix-pompe-chaleur-air-eau-installee',
  },
  {
    label: 'PAC + aides CEE/MaPrimeRénov’ 2026',
    href: '/guides/pompe-a-chaleur-cee-maprimerenov-2026',
  },
  {
    label: 'MaPrimeRénov’ 2026 — barèmes complets',
    href: '/guides/maprimerenov-2026',
  },
  {
    label: 'Trouver un chauffagiste RGE QualiPAC',
    href: '/rge/chauffagiste',
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
    section: 'Travaux — Chauffage — PAC air-eau',
    keywords: [
      'prix pompe à chaleur air-eau',
      'PAC air-eau prix',
      'prix PAC 2026',
      'tarif PAC air-eau',
      'aides PAC air-eau',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Pompe à chaleur', url: '/renovation-energetique/travaux/pompe-a-chaleur' },
    { name: 'PAC air-eau : prix', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const financialSchema = getFinancialProductSchema({
    name: 'Aides cumulées PAC air-eau 2026',
    description:
      'Cumul MaPrimeRénov’ par geste + Coup de pouce CEE chauffage pour l’installation d’une pompe à chaleur air-eau par un artisan RGE QualiPAC.',
    url: PAGE_URL,
    category: 'Government Grant',
    amount: '4 500 € à 9 000 € selon revenus du foyer',
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
              { label: 'Pompe à chaleur', href: '/renovation-energetique/travaux/pompe-a-chaleur' },
              { label: 'PAC air-eau : prix' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Droplet className="w-3.5 h-3.5" aria-hidden />
              PAC air-eau &middot; Prix 2026
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Prix d’une pompe à chaleur air-eau en 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              En 2026, une PAC air-eau coûte entre <strong>10 000 et 18 000 € TTC posée</strong>{' '}
              hors aides, tout compris (équipement, pose, mise en service, garanties). Avec les
              aides MaPrimeRénov’ + CEE, le reste à charge tombe à 3 000-9 000 € pour un ménage
              éligible. Voici la grille de prix par puissance, le détail des coûts et les pièges à
              éviter sur les devis.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Grille de prix 2026 par puissance</h2>
            <p>
              Le prix d’une PAC air-eau dépend principalement de la puissance thermique (kW)
              nécessaire à votre logement. Cette puissance est calculée par bilan thermique
              (déperditions G) et dépend de la surface, l’isolation, le climat et le système
              d’émetteurs.
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Puissance</th>
                    <th className="p-3 border-b border-sand-200">Maison type</th>
                    <th className="p-3 border-b border-sand-200">Prix TTC posée</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {PRICE_GRID.map((row) => (
                    <tr key={row.power} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.power}</td>
                      <td className="p-3">{row.surface}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.price}
                      </td>
                      <td className="p-3 text-sand-600 hidden md:table-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Fourchettes moyennes nationales 2026, hors aides et hors cas particuliers
                (adaptation plancher chauffant neuf, relève chaudière pour multi-énergie). Sources :
                AFPAC, baromètre artisans RGE QualiPAC.
              </p>
            </div>

            <h2>Décomposition d’un devis PAC air-eau</h2>
            <p>
              Un devis transparent doit détailler chaque ligne. Voici la structure type d’un devis
              PAC air-eau 10 kW (cas standard maison 130 m²) :
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6">
              <ul className="divide-y divide-sand-100">
                {COST_BREAKDOWN.map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center justify-between gap-3 p-3 text-sm"
                  >
                    <span className="text-sand-800">{row.label}</span>
                    <span className="font-semibold text-primary-800 whitespace-nowrap">
                      {row.range}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-sand-500 p-3 border-t border-sand-100">
                Hors options (kit ECS thermodynamique séparé, smart-régulation, contrat
                d’entretien). TVA 5,5 % avec artisan RGE QualiPAC.
              </p>
            </div>

            <h2>Aides 2026 : combien récupérer selon votre profil</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Profil revenus</th>
                    <th className="p-3 border-b border-sand-200">MaPrimeRénov’</th>
                    <th className="p-3 border-b border-sand-200">Coup de pouce CEE</th>
                    <th className="p-3 border-b border-sand-200">Cumul aides</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">
                      Reste à charge*
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {AIDES_TABLE.map((row) => (
                    <tr key={row.profil} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{row.profil}</td>
                      <td className="p-3">{row.mpr}</td>
                      <td className="p-3">{row.cee}</td>
                      <td className="p-3 font-semibold text-primary-800">{row.cumul}</td>
                      <td className="p-3 hidden md:table-cell">{row.rac}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                *Reste à charge calculé sur PAC air-eau 10 kW à 12 000 € TTC, après cumul aides et
                TVA 5,5 %. Vérifier les barèmes exacts sur france-renov.gouv.fr.
              </p>
            </div>

            <h2>4 pièges qui font dériver un devis PAC</h2>
            <div className="not-prose grid gap-3 my-6">
              {PIEGES.map((piege) => (
                <div
                  key={piege.title}
                  className="bg-white border border-amber-200 rounded-lg p-4 flex items-start gap-3"
                >
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-sand-900 m-0">{piege.title}</p>
                      <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                        {piege.impact}
                      </span>
                    </div>
                    <p className="text-sm text-sand-700 m-0 mt-1">{piege.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2>Méfiance « PAC à 1 € »</h2>
            <div className="not-prose border-2 border-red-300 bg-red-50 rounded-lg p-5 my-6">
              <div className="flex items-start gap-3">
                <XCircle className="w-6 h-6 text-red-700 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-semibold text-red-900 m-0">
                    Aucune PAC à 1 € légitime n’existe en 2026.
                  </p>
                  <p className="text-sm text-red-900 mt-2 mb-0">
                    Le Coup de pouce CEE a été sensiblement réduit depuis 2024. Toute offre « à 1 €
                    » aujourd’hui masque soit une sous-performance (COP &lt; 3,0), soit un reste à
                    charge caché, soit une fraude aux aides. La DGCCRF (répression des fraudes)
                    publie chaque année une liste noire des éco-démarcheurs frauduleux.
                  </p>
                </div>
              </div>
            </div>

            <h2>Comment comparer 3 devis efficacement</h2>
            <p>
              L’écart entre 3 devis à configuration équivalente atteint 15-25 % en pratique. Voici
              les 5 points à vérifier sur chaque devis avant de signer :
            </p>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Bilan thermique préalable</strong> indiqué (puissance kW justifiée, pas
                surdimensionnée)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Marque, modèle, COP/SCOP</strong> précisés (pas seulement « PAC haute
                qualité »)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Numéro QualiPAC RGE + organisme certificateur</strong> visibles
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Garanties</strong> détaillées (fabricant 5-7 ans + décennale artisan)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Toutes les lignes</strong> détaillées (pas de « forfait global »)
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Demandez 3 devis PAC air-eau en 2 minutes
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    3 artisans RGE QualiPAC vérifiés vous répondent sous 48h. Bilan thermique
                    inclus, simulation MaPrimeRénov’ + CEE intégrée.
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

            <h2>Économies sur la facture de chauffage</h2>
            <p>
              Une PAC air-eau remplaçant une chaudière fioul réduit la facture annuelle de 50 à 70
              %.
            </p>
            <ul>
              <li>
                <TrendingDown className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Facture fioul typique 2 500 €/an → facture PAC électricité ~800-1 000 €/an
              </li>
              <li>
                <TrendingDown className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Retour sur investissement 7 à 12 ans selon aides perçues + tarif électricité (heures
                creuses recommandées)
              </li>
              <li>
                <TrendingDown className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Bonus DPE : passage typique de classe E → C ou D, valorisation à la revente +5 à +10
                %
              </li>
            </ul>

            <h2>ROI sur 10 ans : économies cumulées par profil</h2>
            <p>
              Le retour sur investissement d’une PAC air-eau dépend du combustible remplacé et du
              niveau d’aides perçues. Voici 4 cas types calculés sur 10 ans après pose, hors
              entretien annuel (150-250 €/an) et hausses tarifaires énergie.
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Profil</th>
                    <th className="p-3 border-b border-sand-200">Facture annuelle</th>
                    <th className="p-3 border-b border-sand-200">Reste à charge</th>
                    <th className="p-3 border-b border-sand-200">Éco. 10 ans</th>
                    <th className="p-3 border-b border-sand-200">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {ROI_10_ANS.map((row) => (
                    <tr key={row.profil} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{row.profil}</td>
                      <td className="p-3 whitespace-nowrap">{row.facture}</td>
                      <td className="p-3 whitespace-nowrap">{row.rac}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.eco10}
                      </td>
                      <td className="p-3 font-semibold whitespace-nowrap">{row.roi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Hypothèses : PAC 10 kW SCOP 4,3 ; tarif EDF heures creuses 0,17 €/kWh ; fioul 1,30
                €/L ; gaz 0,12 €/kWh ; valorisation revente non incluse. Sources : ADEME, AFPAC,
                INSEE.
              </p>
            </div>

            <h2>Comparatif marques PAC air-eau 2026</h2>
            <p>
              Cinq marques se partagent l’essentiel du marché français. Les prix indicatifs portent
              sur une PAC 10 kW posée par un artisan RGE QualiPAC, hors options ECS séparé.
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Marque / modèle</th>
                    <th className="p-3 border-b border-sand-200">COP / SCOP</th>
                    <th className="p-3 border-b border-sand-200">Prix posée</th>
                    <th className="p-3 border-b border-sand-200">Garantie</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">
                      Point fort
                    </th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {MARQUES.map((row) => (
                    <tr key={row.marque} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">
                        {row.marque}
                        <br />
                        <span className="text-xs text-sand-500 font-normal">{row.modele}</span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {row.cop} / {row.scop}
                      </td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.prix}
                      </td>
                      <td className="p-3 whitespace-nowrap">{row.garantie}</td>
                      <td className="p-3 text-sand-600 hidden md:table-cell">{row.point}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                COP / SCOP officiels mesurés norme EN 14511. Garantie fabricant standard. Pour
                Mitsubishi, l’extension à 7 ans s’active via enregistrement du modèle. Sources :
                fiches produits constructeurs, AFPAC.
              </p>
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
              href="/renovation-energetique/travaux/pompe-a-chaleur"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Pompe à chaleur
            </Link>
            <Link
              href="/rge/chauffagiste"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Chauffagistes RGE QualiPAC <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
