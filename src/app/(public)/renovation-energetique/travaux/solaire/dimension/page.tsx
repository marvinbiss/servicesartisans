/**
 * Page : /renovation-energetique/travaux/solaire/dimension
 *
 * @kw-primary    dimension panneau solaire
 * @kw-volume     800
 * @kw-kd         4
 * @kw-cpc        0.95
 * @intent        informational + commercial
 * @cluster       solaire_pv
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md (rang #122)
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — sub-cluster dimensions PV)
 * @backlog-item  Levier-S-dimension-panneau-solaire
 *
 * KW cibles (validés Ahrefs gap CSV 2026-04 + estimations longue traîne) :
 * - "dimension panneau solaire"      800 vol, KD 4 ⭐⭐ pivot rang #122
 * - "taille panneau solaire"         ~350 vol estimé KD 1
 * - "surface panneau solaire"        ~300 vol estimé KD 1
 * - "poids panneau solaire"          ~250 vol estimé KD 1
 * - "epaisseur panneau solaire"      ~150 vol estimé KD 0
 * - "largeur panneau solaire"        ~120 vol estimé KD 0
 * - "hauteur panneau solaire"        ~100 vol estimé KD 0
 * - "dimensions panneau photovoltaique" ~200 vol estimé KD 1
 * - Famille cumulée pivot : ~2 270 vol/mois (KD 0-4 = easy win)
 *
 * Easy win : OUI (KD 0-4, pivot KD 4 leader quelleenergie.fr #1 page courte).
 * Concurrence : quelleenergie, hellio, edf — tous orientés vente.
 * Atout SA : guide DIMENSIONS techniques complet (4 standards résidentiel,
 * 5 paramètres physiques, calcul surface toit, 5 contraintes pose, 8 FAQ).
 *
 * Cluster pillar : Rénovation Énergétique → Travaux → Solaire → Dimensions
 *
 * Anti-cannibalisation :
 *   - /solaire                     = hub PV (panorama types + prix)
 *   - /solaire/rendement           = % conversion technos
 *   - /solaire/autoconsommation    = modes énergétiques
 *   - /solaire/thermique           = CESI/SSC chaleur
 *   - /solaire/hybride             = PV-T 2-en-1
 *   - /solaire/nettoyage           = entretien
 *   - /solaire/panneau-1000w       = kit DIY 1000W
 *   - /solaire/panneau-souple      = flexible camping-car
 *   - /solaire/panneau-piscine     = chauffage piscine
 *   - Cette page = DIMENSIONS physiques (largeur, hauteur, épaisseur, poids, surface
 *     toit nécessaire, contraintes pose). Intent : calculer surface toit avant devis.
 *
 * YMYL standard (pas santé/finance critique) : décisions investissement 8-25K€,
 * contraintes physiques (charge toiture 12-15 kg/m², encombrement). Cite : INES,
 * ADEME, IEC 61215 (norme essai PV), NF DTU 65.1 (couverture solaire).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Calculator,
  Coins,
  Ruler,
  ShieldCheck,
  Sun,
  Weight,
} from 'lucide-react'

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

const PAGE_PATH = '/renovation-energetique/travaux/solaire/dimension'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'marc-lefebvre'
const AUTHOR_NAME = 'Marc Lefebvre'

const TITLE = 'Dimension panneau solaire 2026 : taille, poids, surface'
const DESCRIPTION =
  'Dimensions panneau solaire 2026 : 4 formats résidentiel, largeur 99-115 cm, hauteur 165-205 cm, poids 18-26 kg, calcul surface toit pour 3-9 kWc.'

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
  '4 formats résidentiel 2026 : 60 cellules (165 × 99 cm), 72 cellules (205 × 99 cm), demi-cellules (175 × 105 cm), full-black esthétique (172 × 113 cm).',
  'Largeur standard : 99-115 cm. Hauteur : 165-205 cm. Épaisseur : 30-40 mm. Poids : 18-26 kg pour ~1,7-2 m².',
  'Surface 1 panneau ≈ 1,65-2,3 m² selon format. Puissance 2026 : 380-460 Wc par panneau monocristallin.',
  'Surface toit pour 3 kWc (autoconsommation typique) : ~16-18 m² (8 panneaux 380 Wc) — ~12-14 m² (8 panneaux 460 Wc demi-cellules).',
  'Surface toit pour 6 kWc (autoconso + revente surplus) : ~32-36 m² (16 panneaux 380 Wc).',
  'Charge toiture : 12-15 kg/m² (panneau + structure). Toiture saine charpente bois récente : OK. Charpente fragile : étude obligatoire.',
  'Inclinaison optimale France : 30-35° pour le pivot annuel ; 25-30° pour autoconso été ; 45-60° pour autoconso hiver.',
]

const FORMATS_STANDARDS = [
  {
    titre: '60 cellules monocristallin standard',
    dimensions: '165 × 99 × 35 mm',
    surface: '1,63 m²',
    poids: '18-20 kg',
    puissance: '370-400 Wc',
    densitePuissance: '227-245 Wc/m²',
    cas: "Format historique du résidentiel. Le plus répandu jusqu'en 2023. Encombrement compact, idéal toits de petite surface ou compromis poids/puissance.",
  },
  {
    titre: '72 cellules monocristallin (grand format)',
    dimensions: '205 × 99 × 35 mm',
    surface: '2,03 m²',
    poids: '22-25 kg',
    puissance: '440-460 Wc',
    densitePuissance: '217-227 Wc/m²',
    cas: 'Format optimisé tertiaire et grandes maisons. Réduit le nombre de panneaux pour une même puissance (utile pour les onduleurs string qui acceptent des chaînes plus longues).',
  },
  {
    titre: 'Demi-cellules (half-cut) — standard 2026',
    dimensions: '175 × 105 × 30 mm',
    surface: '1,84 m²',
    poids: '20-22 kg',
    puissance: '420-460 Wc',
    densitePuissance: '228-250 Wc/m²',
    cas: 'Devenu le standard 2026 (60-70 % du marché résidentiel neuf). Cellules coupées en 2 → moins de pertes ohmiques + meilleure résistance ombrage partiel. +5-10 % rendement vs format classique 60 cellules.',
  },
  {
    titre: 'Full-black (esthétique premium)',
    dimensions: '172 × 113 × 35 mm',
    surface: '1,94 m²',
    poids: '21-24 kg',
    puissance: '405-440 Wc',
    densitePuissance: '209-227 Wc/m²',
    cas: 'Châssis noir + back-sheet noir + cellules monocristallin sombres. Intégration architecturale premium (ABF, copropriété, maison contemporaine). Surcoût 50-100 €/panneau vs format standard. Attention : -3-5 % rendement vs full-power car cellules masquées.',
  },
]

const PARAMETRES_TECHNIQUES = [
  {
    icone: '↔️',
    titre: 'Largeur (99-115 cm)',
    detail:
      "La largeur standard d'un panneau résidentiel oscille entre 99 cm (60 cellules ou 72 cellules pleins) et 115 cm (demi-cellules + grands formats). Cette largeur conditionne le nombre de rangées sur un toit donné. Pour un toit de 5 m de large : 4-5 panneaux par rangée selon le format.",
  },
  {
    icone: '↕️',
    titre: 'Hauteur (165-205 cm)',
    detail:
      'La hauteur (longueur dans le sens de la pente) varie entre 165 cm (60 cellules), 175 cm (demi-cellules) et 205 cm (72 cellules). Pour un toit de 7 m de pente : 3-4 panneaux par colonne selon le format. Attention au respect des distances de bord (50 cm minimum, plus en zone vent).',
  },
  {
    icone: '📏',
    titre: 'Épaisseur (30-40 mm)',
    detail:
      "L'épaisseur d'un panneau résidentiel monocristallin classique est de 30-40 mm (cadre aluminium + verre 3,2 mm + EVA + cellules + back-sheet + boîte de jonction). Les panneaux à double-verre (bifaciaux) atteignent 7-8 mm. La structure de fixation ajoute 8-15 cm au-dessus de la couverture.",
  },
  {
    icone: '⚖️',
    titre: 'Poids (18-26 kg / panneau)',
    detail:
      'Un panneau résidentiel pèse 18-20 kg (60 cellules), 20-22 kg (demi-cellules) ou 22-26 kg (72 cellules grand format). Surface 1,7-2 m² → charge surfacique 9-13 kg/m² (panneau seul). Avec structure de fixation (rails + crochets + visserie) : 12-15 kg/m². Comparable aux tuiles terre cuite (40-60 kg/m²) — toiture saine = aucun problème.',
  },
  {
    icone: '🔢',
    titre: 'Surface unitaire (1,6-2,3 m²)',
    detail:
      "La surface utile d'un panneau (largeur × hauteur, hors cadre) varie de 1,6 m² (60 cellules) à 2,3 m² (grand format 72 cellules). C'est le paramètre clé pour calculer la surface toit nécessaire en multipliant par le nombre de panneaux (selon puissance kWc visée).",
  },
]

const CALCULS_SURFACE_TOIT = [
  {
    titre: '3 kWc — Autoconsommation simple (8 panneaux)',
    foyer: '1-3 personnes, conso annuelle 3 000-4 500 kWh',
    nbPanneaux: '8 panneaux × 380 Wc OU 7 panneaux × 460 Wc',
    surfaceToit: '12-14 m² (demi-cellules 460 Wc) — 13-15 m² (60 cellules 380 Wc)',
    productionAnnuelle: '~3 200-3 600 kWh/an (rendement 0,9 en France moyenne)',
    prixIndicatif: '8 000-10 500 € posé (avec onduleur + pose)',
  },
  {
    titre: '4-5 kWc — Autoconso + revente surplus (10-12 panneaux)',
    foyer: '3-4 personnes, conso 4 500-7 000 kWh, ECS thermodynamique',
    nbPanneaux: '10-12 panneaux × 420 Wc demi-cellules',
    surfaceToit: '18-22 m²',
    productionAnnuelle: '~4 500-5 500 kWh/an',
    prixIndicatif: '11 000-14 500 € posé',
  },
  {
    titre: '6 kWc — Autoconso + revente surplus + PAC (16 panneaux)',
    foyer: '4-5 personnes, conso 7 000-10 000 kWh, PAC air-eau',
    nbPanneaux: '16 panneaux × 380 Wc OU 14 panneaux × 460 Wc',
    surfaceToit: '26-30 m² (demi-cellules) — 32-36 m² (60 cellules)',
    productionAnnuelle: '~6 500-7 500 kWh/an',
    prixIndicatif: '14 500-18 500 € posé',
  },
  {
    titre: '9 kWc — Tarif Bleu max résidentiel (24 panneaux)',
    foyer: 'Maison passive ou multi-occupation, conso 9 000+ kWh, PAC + clim + VE',
    nbPanneaux: '24 panneaux × 380 Wc OU 20 panneaux × 460 Wc',
    surfaceToit: '38-42 m² (demi-cellules 460 Wc) — 48-52 m² (60 cellules 380 Wc)',
    productionAnnuelle: '~9 500-11 000 kWh/an',
    prixIndicatif: '21 000-26 500 € posé',
  },
]

const CONTRAINTES_POSE = [
  {
    titre: 'Orientation toiture',
    detail:
      'Sud = optimum (production référence 100 %). Sud-Est ou Sud-Ouest = -3 à -5 % (acceptable). Est ou Ouest pure = -20 à -25 % (à compenser par +20 % surface). Nord = -45 à -55 % (rarement rentable). Vérifier orientation avec une boussole ou Géoportail (vue cadastrale + inclinaison toit).',
  },
  {
    titre: 'Inclinaison',
    detail:
      'Optimum France métropolitaine : 30-35° (pivot annuel équilibré). Pour autoconso prioritaire été : 25-30° (capte mieux soleil haut). Pour autoconso prioritaire hiver : 45-60° (capte soleil rasant). Toit plat (< 15°) : structure inclinée nécessaire (+ 200-400 €/kWc) ou panneaux au sol.',
  },
  {
    titre: 'Ombrage (capital)',
    detail:
      "Un seul panneau ombragé peut faire chuter la production globale de 30-40 % (si onduleur string sans optimiseurs). Vérifier sur 1 année complète : arbres voisins, cheminées, antennes, immeubles. Zone d'ombrage matinal/soir = perte tolérable (~5-10 %). Ombrage midi = exclure ou utiliser micro-onduleurs (Enphase, APsystems) pour découplage.",
  },
  {
    titre: 'Charge structurelle toiture',
    detail:
      '12-15 kg/m² ajoutés (panneau + rails + crochets). Charpente bois récente (< 30 ans) : OK sans étude. Charpente ancienne (> 50 ans) ou fermette industrialisée : étude bureau de structure recommandée (300-500 €). Tuiles canal méditerranéennes : crochets spécifiques (+ 100-200 €/kWc). Bac acier : kit dédié rapide.',
  },
  {
    titre: 'Raccordement Enedis (pour > 3 kWc)',
    detail:
      'Pour toute installation > 3 kWc : convention de raccordement Enedis obligatoire (300-500 € + 8-12 semaines délai). Pour 6-9 kWc : passage triphasé fréquent (+ 1 200-2 500 € selon distance branchement). Compteur Linky obligatoire (gratuit). Convention CACSI pour autoconso collective si copropriété.',
  },
]

const faqs = [
  {
    question: "Quelle est la dimension standard d'un panneau solaire en 2026 ?",
    answer:
      '4 formats coexistent en résidentiel 2026 : (1) 60 cellules monocristallin classique = 165 × 99 cm, 18-20 kg, 1,63 m², 370-400 Wc ; (2) 72 cellules grand format = 205 × 99 cm, 22-25 kg, 2,03 m², 440-460 Wc ; (3) <strong>demi-cellules (half-cut)</strong> = 175 × 105 cm, 20-22 kg, 1,84 m², 420-460 Wc — devenu standard 2026 (60-70 % du marché) ; (4) full-black esthétique = 172 × 113 cm, 21-24 kg, 1,94 m², 405-440 Wc. Épaisseur quasi-constante 30-40 mm hors structure.',
  },
  {
    question: 'Combien pèse un panneau solaire et quelle charge toiture ?',
    answer:
      "Un panneau résidentiel pèse 18-26 kg selon le format (1,7-2,1 m²). La charge surfacique panneau seul est 9-13 kg/m². Avec structure de fixation (rails aluminium + crochets + visserie inox), la charge totale ajoutée est <strong>12-15 kg/m²</strong>. Comparé aux tuiles terre cuite (40-60 kg/m²) ou ardoises (25-45 kg/m²), c'est négligeable. Toiture saine charpente bois récente (< 30 ans) = aucun problème. Charpente > 50 ans, fermette industrialisée ou shed-roof : étude bureau de structure recommandée (300-500 €).",
  },
  {
    question: 'Quelle surface de toit pour 3 kWc, 6 kWc, 9 kWc ?',
    answer:
      'Surface toit nécessaire 2026 (panneaux demi-cellules 420-460 Wc) : <strong>3 kWc</strong> = 7-8 panneaux × 1,84 m² ≈ <strong>13-15 m²</strong> ; <strong>4-5 kWc</strong> = 10-12 panneaux ≈ <strong>18-22 m²</strong> ; <strong>6 kWc</strong> = 14-15 panneaux ≈ <strong>26-30 m²</strong> ; <strong>9 kWc</strong> = 20-22 panneaux ≈ <strong>38-42 m²</strong>. Avec panneaux 60 cellules anciens (380 Wc), il faut +25-30 % de surface en plus. Toujours prévoir 50 cm minimum de bord et 20-30 cm entre rangées pour ventilation et étanchéité.',
  },
  {
    question: 'Quelle inclinaison de toit pour des panneaux solaires ?',
    answer:
      "Optimum France métropolitaine annuel : <strong>30-35°</strong>. Pour orienter la production : (1) priorité été (climatisation, autoconso) = 25-30° ; (2) priorité hiver (chauffage électrique) = 45-60° (capte soleil rasant). Toit plat (< 15°) : structure d'inclinaison ajoutée (200-400 €/kWc supplémentaires) ou panneaux au sol. Toit > 60° : performance dégradée 5-10 %, pose plus complexe (échafaudage spécifique). La majorité des toits français (rampants 30-45°) sont compatibles sans modification.",
  },
  {
    question: 'Combien de panneaux solaires pour produire 6 kWc ?',
    answer:
      'Pour atteindre 6 kWc en 2026, comptez : (1) <strong>14-15 panneaux demi-cellules 420-460 Wc</strong> (les plus performants), surface 26-30 m² ; (2) <strong>16 panneaux 60 cellules 380 Wc</strong> (anciens stocks), surface 32-36 m² ; (3) <strong>13-14 panneaux 72 cellules 440-460 Wc</strong>, surface 27-30 m² (mais grand format = peu adapté maisons individuelles). La production annuelle attendue est de 6 500-7 500 kWh selon orientation, inclinaison et zone (ratio 1 100-1 250 kWh/kWc France).',
  },
  {
    question: 'Quelle épaisseur fait un panneau solaire avec sa structure ?',
    answer:
      "Le panneau seul fait <strong>30-40 mm</strong> d'épaisseur (cadre aluminium 35 mm + verre trempé 3,2 mm + EVA + cellules silicium + back-sheet polymère + boîte de jonction arrière 25-35 mm). Avec la structure de fixation (rails aluminium + crochets toiture + entretoise ventilation), l'ensemble dépasse de la couverture de <strong>8-15 cm</strong>. Cette hauteur permet la ventilation arrière (essentielle pour évacuer la chaleur et préserver le rendement à haute T° = -0,4 %/°C au-dessus de 25 °C).",
  },
  {
    question: 'Les panneaux bifaciaux ont-ils des dimensions différentes ?',
    answer:
      'Les panneaux bifaciaux (qui captent aussi la lumière sur la face arrière, +5-15 % gain) ont des dimensions très proches des monofaciaux classiques (175 × 105 cm pour les demi-cellules), mais sont à <strong>double-verre</strong> (verre 2 mm avant + 2 mm arrière) sans cadre alu standard. Conséquences : poids légèrement supérieur (22-26 kg vs 20-22 kg), épaisseur 7-8 mm (vs 30-40 mm) mais nécessite des fixations spécifiques (clamps inox + entretoises). Réservés aux installations au sol, brise-soleil, garde-corps, carports — peu pertinents en intégration toiture résidentielle classique.',
  },
  {
    question: 'Faut-il une étude pour calculer les dimensions ?',
    answer:
      "Oui, toujours. L'étude technique préalable de l'installateur RGE QualiPV inclut : (1) <strong>relevé toiture</strong> (longueur, largeur, orientation boussole, inclinaison clinomètre) ; (2) <strong>simulation production</strong> (logiciel PVGIS, PVsyst, ou outil constructeur) ; (3) <strong>calcul charge structurelle</strong> ; (4) <strong>analyse ombrage</strong> sur 1 année (logiciel Sun-Path) ; (5) <strong>schéma de pose</strong> (orientation rangées, distances bord, points fixation). Cette étude est OFFERTE par les artisans sérieux. Méfiance des devis sans visite physique — risque de sous- ou surdimensionnement (15-25 % d'erreur courante).",
  },
]

const sources = [
  {
    label: "INES — Institut National de l'Énergie Solaire",
    url: 'https://www.ines-solaire.org',
  },
  {
    label: 'ADEME — Guide installation photovoltaïque',
    url: 'https://librairie.ademe.fr/energies-renouvelables-reseaux-stockage/3939-installer-des-panneaux-solaires-photovoltaiques-quelles-aides.html',
  },
  {
    label: 'IEC 61215 — Norme essai modules PV terrestres',
    url: 'https://webstore.iec.ch/publication/61345',
  },
  {
    label: 'NF DTU 65.1 — Couverture solaire (règles de pose)',
    url: 'https://www.boutique.afnor.org',
  },
  {
    label: 'Enedis — Convention de raccordement photovoltaïque',
    url: 'https://www.enedis.fr/raccordement-photovoltaique',
  },
  {
    label: "Qualit'EnR — Annuaire QualiPV (installateurs RGE)",
    url: 'https://www.qualit-enr.org/qualipv',
  },
  {
    label: 'PVGIS — Outil européen calcul production solaire',
    url: 'https://re.jrc.ec.europa.eu/pvg_tools/fr/',
  },
  {
    label: "France Rénov' — Énergie solaire",
    url: 'https://france-renov.gouv.fr/renovation/energies-renouvelables/solaire',
  },
]

const relatedPages = [
  {
    label: 'Hub Solaire 2026 — panneau PV',
    href: '/renovation-energetique/travaux/solaire',
    description: 'Photovoltaïque : prix, types, autoconso',
  },
  {
    label: 'Rendement panneau solaire',
    href: '/renovation-energetique/travaux/solaire/rendement',
    description: '5 technos PV, 17-23 % conversion, latitude',
  },
  {
    label: 'Autoconsommation solaire',
    href: '/renovation-energetique/travaux/solaire/autoconsommation',
    description: 'Totale, surplus, collective + ROI batterie',
  },
  {
    label: 'Panneau solaire hybride PV-T',
    href: '/renovation-energetique/travaux/solaire/hybride',
    description: 'Élec + ECS sur même panneau, +5-15 % rendement',
  },
  {
    label: 'Panneau solaire thermique (CESI/SSC)',
    href: '/renovation-energetique/travaux/solaire/thermique',
    description: "MPR jusqu'à 10 000 €",
  },
  {
    label: 'Hub aides rénovation',
    href: '/renovation-energetique/aides',
    description: 'MPR + CEE + éco-PTZ',
  },
  {
    label: 'Aides panneau solaire 2026 (PV)',
    href: '/renovation-energetique/aides/panneau-solaire-2026',
    description: 'Prime EDF OA, TVA 10 %, IR exonéré, éco-PTZ',
  },
  {
    label: 'Trouver un installateur QualiPV',
    href: '/services/electricien',
    description: 'Annuaire RGE photovoltaïque',
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
    section: 'Solaire — Dimensions panneau',
    keywords: [
      'dimension panneau solaire',
      'taille panneau solaire',
      'surface panneau solaire',
      'poids panneau solaire',
      'epaisseur panneau solaire',
      'dimensions panneau photovoltaique',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Solaire', url: '/renovation-energetique/travaux/solaire' },
    { name: 'Dimensions', url: PAGE_PATH },
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
              { label: 'Travaux', href: '/renovation-energetique/travaux' },
              {
                label: 'Solaire',
                href: '/renovation-energetique/travaux/solaire',
              },
              { label: 'Dimensions' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-sand-100 text-sand-700 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Ruler className="w-3.5 h-3.5" aria-hidden />
              Spécifications techniques 2026 — calcul surface toit
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Dimension panneau solaire 2026 : taille, poids, surface
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Quelle <strong>dimension</strong> fait un <strong>panneau solaire</strong> en 2026 ? 4
              formats dominent le résidentiel : 60 cellules (165 × 99 cm), 72 cellules (205 × 99
              cm), demi-cellules (175 × 105 cm — devenu standard) et full-black (172 × 113 cm).
              Largeur 99-115 cm, hauteur 165-205 cm, épaisseur 30-40 mm, poids 18-26 kg pour ~1,7-2
              m². Avec ces dimensions, calculer la surface toit nécessaire selon la puissance visée
              (3 kWc = 13-15 m², 6 kWc = 26-30 m², 9 kWc = 38-42 m²) et vérifier les contraintes de
              pose.
            </p>
            <LastUpdated date={MODIFIED} />
          </header>

          <TldrBlock bullets={tldr} />

          <section aria-labelledby="formats" className="my-10">
            <h2
              id="formats"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <Sun className="w-5 h-5 text-primary-700" aria-hidden />4 formats standards
              résidentiel 2026
            </h2>
            <p className="text-sand-700 mb-5">
              Le marché résidentiel 2026 propose 4 formats principaux. Le choix dépend de la surface
              toit disponible, de la puissance visée et de l&apos;intégration architecturale :
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {FORMATS_STANDARDS.map((f) => (
                <article key={f.titre} className="bg-white border border-sand-200 rounded-lg p-5">
                  <h3 className="font-heading text-base font-semibold text-sand-900 mb-3">
                    {f.titre}
                  </h3>
                  <ul className="space-y-1 text-xs text-sand-700 mb-3 list-none pl-0">
                    <li>
                      <strong>Dimensions :</strong> {f.dimensions}
                    </li>
                    <li>
                      <strong>Surface :</strong> {f.surface}
                    </li>
                    <li>
                      <strong>Poids :</strong> {f.poids}
                    </li>
                    <li>
                      <strong>Puissance :</strong> {f.puissance}
                    </li>
                    <li>
                      <strong>Densité :</strong> {f.densitePuissance}
                    </li>
                  </ul>
                  <p className="text-sm text-sand-700 m-0">{f.cas}</p>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="parametres" className="my-10">
            <h2
              id="parametres"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <Weight className="w-5 h-5 text-primary-700" aria-hidden />5 paramètres techniques à
              connaître
            </h2>
            <p className="text-sand-700 mb-5">
              Au-delà du seul format, 5 paramètres physiques conditionnent le choix et la pose
              d&apos;un panneau solaire :
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {PARAMETRES_TECHNIQUES.map((p) => (
                <article key={p.titre} className="bg-white border border-sand-200 rounded-lg p-5">
                  <h3 className="font-heading text-base font-semibold text-sand-900 mb-2">
                    <span className="mr-2" aria-hidden>
                      {p.icone}
                    </span>
                    {p.titre}
                  </h3>
                  <p className="text-sm text-sand-700 m-0">{p.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="surface-toit" className="my-10">
            <h2
              id="surface-toit"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <Calculator className="w-5 h-5 text-primary-700" aria-hidden />
              Surface toit nécessaire selon puissance (4 cas concrets)
            </h2>
            <p className="text-sand-700 mb-5">
              4 scénarios chiffrés selon la puissance visée. Calculs basés sur des panneaux
              demi-cellules 420-460 Wc (standard 2026) — pour des panneaux 60 cellules 380 Wc,
              prévoir +25-30 % de surface :
            </p>
            <div className="space-y-4">
              {CALCULS_SURFACE_TOIT.map((c) => (
                <article key={c.titre} className="bg-white border border-sand-200 rounded-lg p-5">
                  <h3 className="font-heading text-base font-semibold text-sand-900 mb-2">
                    {c.titre}
                  </h3>
                  <p className="text-sm text-sand-700 m-0 mb-2">
                    <strong>Foyer cible :</strong> {c.foyer}
                  </p>
                  <ul className="space-y-1 text-xs text-sand-700 mb-2 list-none pl-0">
                    <li>
                      <strong>Nombre panneaux :</strong> {c.nbPanneaux}
                    </li>
                    <li>
                      <strong>Surface toit :</strong> {c.surfaceToit}
                    </li>
                    <li>
                      <strong>Production annuelle :</strong> {c.productionAnnuelle}
                    </li>
                  </ul>
                  <p className="text-xs font-semibold text-accent-700 m-0">
                    Prix indicatif posé : {c.prixIndicatif}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="contraintes" className="my-10">
            <h2
              id="contraintes"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <AlertTriangle className="w-5 h-5 text-primary-700" aria-hidden />5 contraintes de
              pose à vérifier
            </h2>
            <p className="text-sand-700 mb-5">
              Connaître les dimensions ne suffit pas. 5 contraintes physiques et réglementaires
              conditionnent la faisabilité et le rendement réel :
            </p>
            <ol className="space-y-3">
              {CONTRAINTES_POSE.map((c, i) => (
                <li
                  key={c.titre}
                  className="bg-white border border-sand-200 rounded-lg p-4 flex gap-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-base font-semibold text-sand-900 mb-1">
                      {c.titre}
                    </h3>
                    <p className="text-sm text-sand-700 m-0">{c.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="artisan" className="my-10">
            <h2
              id="artisan"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <ShieldCheck className="w-5 h-5 text-primary-700" aria-hidden />
              Faire valider les dimensions par un installateur QualiPV
            </h2>
            <p className="text-sand-700 mb-3">
              Les dimensions et la surface toit nécessaire doivent être validées par une étude
              technique préalable. Un installateur RGE <strong>QualiPV</strong> ou{' '}
              <strong>Qualifelec mention Solaire Photovoltaïque</strong> réalise gratuitement :
            </p>
            <ul className="space-y-2 mb-3 list-disc pl-6 text-sand-700 text-sm">
              <li>Relevé toiture (longueur, largeur, orientation, inclinaison).</li>
              <li>Calcul charge structurelle vs charpente existante.</li>
              <li>Simulation production annuelle (PVGIS / PVsyst).</li>
              <li>Analyse ombrage 1 année complète.</li>
              <li>Schéma de pose détaillé (rangées, distances bord, fixations).</li>
              <li>Devis chiffré : matériel + pose + onduleur + raccordement Enedis.</li>
            </ul>
            <Link
              href="/services/electricien"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Trouver un installateur QualiPV vérifié
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </section>

          <FlagshipFaq title="Dimension panneau solaire : foire aux questions" items={faqs} />

          <FlagshipSources sources={sources} />

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
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
              href="/renovation-energetique/travaux/solaire"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Solaire
            </Link>
            <Link
              href="/services/electricien"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Installateurs PV <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
