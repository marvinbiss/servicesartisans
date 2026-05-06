/**
 * /renovation-energetique/travaux/isolation/phonique — Levier 6 ROI.
 *
 * @kw-primary    isolation phonique
 * @kw-volume     8300
 * @kw-kd         7
 * @kw-cpc        1.20
 * @cluster       6
 * @ahrefs-source local snapshot 2026-05-04 (docs/ahrefs-bloc1-keywords-gap, docs/audit-ahrefs-2026-05-03/B_competitor_pages)
 * @backlog-item  P3-isolation-other-cluster (sub-niche acoustique)
 *
 * Cluster `isolation phonique` (vol cumulé ~14 K KD avg ~3) — quasi-libre côté V1.
 * Concurrent #1 Sonergia DR 49 (rank #2 sur pivot, mais traffic faible 1 584).
 *
 * KW cibles snapshot 2026-05-04 :
 * - "isolation phonique"            → 8 300 vol, KD 7 (PIVOT primary)
 * - "isolation phonique mur"        → 3 500 vol, KD 0 (cible plafond)
 * - "isolation phonique mur mitoyen"→   800 vol, KD 0
 * - "isolation phonique sol"        →   700 vol, KD 0
 * - "isolation phonique fenetre"    →   250 vol, KD 15
 * - "meilleur isolant phonique plafond" → 200 vol, KD 34 (sub-page potentielle)
 * - "isolation phonique laine de bois"  →  50 vol, KD 50 (longue traîne mat.)
 * - Cluster cumulé : ~13 800 vol/mo, KD avg 3.0 — sweet spot ROI vol/effort.
 *
 * ⚠ POSITIONNEMENT YMYL CRITIQUE :
 * L'isolation phonique seule N'EST PAS éligible aux aides MaPrimeRénov',
 * CEE, éco-PTZ ou TVA 5,5 %. Ces aides ciblent uniquement la performance
 * thermique. Cas particuliers où acoustique + thermique se cumulent :
 * laine minérale ou biosourcée installée dans le cadre d'une opération
 * thermique (BAR-EN-101 toiture, BAR-EN-102 ITE) — la performance
 * acoustique est un BÉNÉFICE COLLATERAL, pas l'objet de l'aide. La page
 * doit clarifier sans ambiguïté.
 *
 * Anti-cannibalisation :
 *   - /isolation/{combles, exterieure-ite, interieure, toiture} → angle thermique
 *   - /guides/isolation-phonique-mur-appartement (Thomas Bernard, focus
 *     contre-cloison appartement) → guide deep-dive cas spécifique
 *   - Cette page = HUB acoustique 4 postes (mur, plafond, sol, fenêtre)
 *
 * Performance acoustique = indice **Rw dB** (NF EN ISO 717-1). Affaiblissement
 * acoustique pondéré. Mur courant brique : Rw 35 dB. Cloison BA13 simple :
 * Rw 32 dB. Contre-cloison masse-ressort-masse pro : Rw 55-65 dB. Réduction
 * perçue : -10 dB ≈ -50 % du bruit perçu.
 *
 * Réglementation France :
 *   - Décret bruit voisinage (Art. R1334-30 à R1334-37 CSP) : tapage diurne
 *     sanctionné si gêne caractérisée
 *   - Réglementation acoustique 2000 (NRA 2000) pour bâtiments neufs :
 *     Rw ≥ 53 dB entre logements, ≥ 30 dB façade urbaine
 *   - Plan d'Exposition au Bruit (PEB) aéroports : zones A/B/C avec aides
 *     spéciales (subvention insonorisation jusqu'à 80 % pour zone A)
 *
 * Sources : CSTB (NF EN ISO 717-1, NRA 2000), Acotherm (label fenêtre),
 * ADEME (guide bruit), Bruitparif (mesures Île-de-France).
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Volume2, AlertTriangle, Calculator } from 'lucide-react'

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

const PAGE_PATH = '/renovation-energetique/travaux/isolation/phonique'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'thomas-bernard'
const AUTHOR_NAME = 'Thomas Bernard'

const TITLE = 'Isolation phonique 2026 : prix, dB, solutions par poste'
const DESCRIPTION =
  'Isolation phonique 2026 : mur 80-180 €/m², plafond 60-150 €/m², sol 40-110 €/m², fenêtre Rw 38-42 dB. Loi masse-ressort-masse, matériaux, mythes.'

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
  'Indice clé : <strong>Rw dB</strong> (affaiblissement acoustique pondéré, NF EN ISO 717-1). Plus c’est haut, mieux le bruit est arrêté.',
  'Loi physique de base : <strong>masse-ressort-masse</strong>. 2 parois lourdes + matériau absorbant entre = isolation maximale (Rw 55-65 dB).',
  'Prix posé 2026 par poste — mur 80-180 €/m², plafond 60-150 €/m², sol 40-110 €/m², fenêtre Rw 38-42 dB ~600-1 200 €/unité.',
  '⚠ <strong>Pas d’aide MaPrimeRénov’ ni CEE</strong> pour l’isolation phonique seule. Sauf si combinée à une opération thermique (laine minérale en toiture par ex.).',
  'Mythes courants : « 1€ phonique » = arnaque, panneaux mousse 25 €/m² = +3-5 dB seuls (insuffisant), vitrage feuilleté ≠ phonique automatique.',
  'Diagnostic acoustique préalable (BE) : 250-600 € — identifie le pont phonique exact (mur, sol, gaine, fenêtre) avant travaux.',
  'Aide spécifique aéroport : <strong>insonorisation PEB zones A/B/C</strong> jusqu’à 80 % du devis pour propriétaires riverains (DGAC).',
]

const SOLUTIONS = [
  {
    poste: 'Mur (cloison ou mur mitoyen)',
    rwGain: '+15 à +25 dB (Rw 50-65 dB total)',
    prix: '80-180 €/m² posé',
    technique:
      'Contre-cloison désolidarisée masse-ressort-masse : ossature métallique (ou bois) + laine minérale 45-100 mm + plaques BA13 phonique double couche. Espace de 4-10 cm avec le mur existant. Conformité NF DTU 25.41.',
    materiaux:
      'Laine de roche/verre 45-100 kg/m³, BA13 phonique (Placo Phonique, Knauf Aku), bandes résilientes',
    href: '/guides/isolation-phonique-mur-appartement',
  },
  {
    poste: 'Plafond (bruits d’impact des voisins du dessus)',
    rwGain: '+10 à +18 dB (impact L’nT,w ≤ 55 dB)',
    prix: '60-150 €/m² posé',
    technique:
      'Faux plafond suspendu désolidarisé sur suspentes anti-vibratiles (type Stil F530 + suspente acoustique) + 80-160 mm laine minérale + BA13 phonique. Hauteur perdue 12-20 cm.',
    materiaux:
      'Suspentes anti-vibratiles Vibrofix/Acousti+, laine minérale ≥ 50 kg/m³, BA13 phonique 12,5 mm',
    href: null,
  },
  {
    poste: 'Sol (bruits d’impact pour les voisins du dessous)',
    rwGain: '+15 à +25 dB d’impact ΔLw',
    prix: '40-110 €/m² posé',
    technique:
      'Sous-couche acoustique sous parquet flottant ou carrelage (mousse, liège, fibre de bois) — 3-10 mm. Solution lourde : chape sèche désolidarisée. NRA 2000 exige ΔLw ≥ 19 dB pour neuf.',
    materiaux:
      'Sous-couche liège (DURASOL), mousse polyéthylène, fibres de bois Steico Therm, chape Fermacell',
    href: null,
  },
  {
    poste: 'Fenêtre (bruit aérien rue, autoroute, voie ferrée)',
    rwGain: 'Rw 30-42 dB selon vitrage',
    prix: '600-1 800 €/unité posée',
    technique:
      'Double vitrage acoustique asymétrique (verres d’épaisseur différente, ex. 10/16/4 mm) ou triple vitrage. Cadre PVC ou alu à rupture thermique. Label Acotherm AC1-AC4 (Rw 28 / 30 / 33 / 36 dB).',
    materiaux: 'Vitrage feuilleté Stadip Silence, Cordon EPDM, label Acotherm AC2-AC4',
    href: null,
  },
]

const PROFILS = [
  {
    cas: 'Voisin bruyant en appartement (TV, conversations, musique)',
    recommandation: 'Mur mitoyen — contre-cloison masse-ressort-masse',
    justification:
      'Bruit aérien — la solution est sur le mur partagé. Comptez 80-180 €/m² posé, gain typique +15-20 dB (-75 % perception). Diagnostic acoustique préalable conseillé pour exclure une transmission par la dalle ou les gaines.',
  },
  {
    cas: 'Bruits de pas / chaises des voisins du dessus',
    recommandation: 'Faux plafond suspendu désolidarisé',
    justification:
      'Bruit d’impact — la solution est au plafond. 60-150 €/m² posé. Idéalement à combiner avec une sous-couche acoustique chez le voisin du dessus (mais hors de portée si bailleurs distincts).',
  },
  {
    cas: 'Bruit de circulation (route, autoroute, voie ferrée, train)',
    recommandation: 'Fenêtres double vitrage acoustique Acotherm AC2-AC4',
    justification:
      'Bruit aérien extérieur — la fenêtre est le maillon faible. Vitrage asymétrique 10/16/4 + cadre étanche (joint EPDM neuf). 600-1 800 €/unité. Gain Rw 30-42 dB selon classe Acotherm.',
  },
  {
    cas: 'Logement situé en zone aéroport (PEB)',
    recommandation: 'Demande aide DGAC + travaux complets enveloppe',
    justification:
      'Aide spécifique <strong>insonorisation PEB zones A/B/C</strong> jusqu’à 80 % du devis pour propriétaires riverains (DGAC). Concerne fenêtres, toiture, ventilation. Vérifier éligibilité auprès de l’aéroport gestionnaire.',
  },
  {
    cas: 'Studio musique / home cinéma / pièce de répétition',
    recommandation: 'Box-in-the-box (boîte dans la boîte) — pro',
    justification:
      'Pour viser Rw ≥ 60 dB : structure entièrement désolidarisée du bâti existant (sol flottant + plafond suspendu + cloisons indépendantes). Bureau d’études acoustique obligatoire. Budget 350-700 €/m². Hors scope artisan classique.',
  },
  {
    cas: 'Bureau ou télétravail (open space audible, voisins de palier)',
    recommandation: 'Panneaux absorbants muraux + porte joints renforcés',
    justification:
      'Pour TRAITER les sons à l’intérieur (réverbération) — pas l’isolation. Panneaux Heradesign / Akusto / Vicoustic 50-200 €/m². Ne réduit pas le bruit qui vient de l’extérieur, mais améliore confort phonique de la pièce elle-même.',
  },
]

const MATERIAUX = [
  {
    materiau: 'Laine de roche',
    densite: '45-100 kg/m³',
    rwApport: 'Excellent (densité élevée)',
    prix: '12-25 €/m² (50 mm)',
    note: 'Référence performance acoustique. Aussi thermique (R 1,3 m².K/W pour 50 mm). Marques : Rockwool, Knauf.',
  },
  {
    materiau: 'Laine de verre haute densité',
    densite: '30-50 kg/m³',
    rwApport: 'Bon',
    prix: '8-18 €/m² (50 mm)',
    note: 'Moins dense donc moins absorbant que la roche. Économique. Marques : Isover, Ursa.',
  },
  {
    materiau: 'Fibre de bois (panneaux ou flocon)',
    densite: '50-180 kg/m³',
    rwApport: 'Excellent (très dense)',
    prix: '20-45 €/m² (50 mm)',
    note: 'Biosourcé. Excellent en absorption + déphasage thermique. Marques : Steico, Pavatex.',
  },
  {
    materiau: 'Liège expansé',
    densite: '110-130 kg/m³',
    rwApport: 'Bon (très bon en sol)',
    prix: '25-55 €/m² (40 mm)',
    note: 'Biosourcé. Excellent en sous-couche sol (compression résistante). Référence pour parquet flottant.',
  },
  {
    materiau: 'Plaque BA13 phonique (Placo Phonique, Knauf Aku)',
    densite: '12,5 mm — 11,5-12 kg/m²',
    rwApport: '+3 à +5 dB vs BA13 standard',
    prix: '8-15 €/m² (plaque seule)',
    note: 'Plaque de plâtre dense formulée pour acoustique. À doubler en parement (2 plaques décalées).',
  },
  {
    materiau: 'Mousse polyuréthane / polyester (panneaux décoratifs)',
    densite: '25-40 kg/m³',
    rwApport: 'Faible (+3-8 dB seul)',
    prix: '15-50 €/m²',
    note: '⚠ Souvent vendu pour faire de l’isolation phonique — efficace pour ABSORBER la réverbération à l’intérieur d’une pièce, mais N’ARRÊTE PAS le bruit du voisin. Ne pas confondre absorption et isolation.',
  },
]

const PRIX_DETAIL = [
  {
    poste: 'Contre-cloison phonique mur 100 mm + double BA13',
    prix: '110-160 €/m² posé',
    note: 'Rw +18-22 dB. Inclut ossature, laine roche 75 mm, BA13 phonique × 2, joint résilient. Référence haut de gamme.',
  },
  {
    poste: 'Contre-cloison phonique mur 70 mm + simple BA13',
    prix: '80-120 €/m² posé',
    note: 'Rw +12-15 dB. Compromis budget. Suffisant pour bruits aériens moyens.',
  },
  {
    poste: 'Faux plafond acoustique 120 mm sur suspentes Vibrofix',
    prix: '100-150 €/m² posé',
    note: 'Bruits d’impact +12-18 dB. Hauteur perdue 15-20 cm. Référence pour appartements anciens.',
  },
  {
    poste: 'Sous-couche liège 8 mm sous parquet flottant',
    prix: '15-30 €/m² fourniture',
    note: 'ΔLw 19-21 dB (NRA 2000 OK). Sous-couche seule, hors parquet.',
  },
  {
    poste: 'Fenêtre Acotherm AC3 (Rw 33 dB) PVC double vitrage',
    prix: '600-1 200 € par fenêtre',
    note: 'Standard urbain modéré. Marque Schüco, Kömmerling. Pose incluse.',
  },
  {
    poste: 'Fenêtre Acotherm AC4 (Rw 36 dB) feuilleté Stadip Silence',
    prix: '900-1 800 € par fenêtre',
    note: 'Standard route fréquentée, vue sur axe bruyant. Vitrage asymétrique 10/16/4.',
  },
  {
    poste: 'Diagnostic acoustique par bureau d’études',
    prix: '250-600 €',
    note: 'Mesure Rw dB existant + identification ponts phoniques. Recommandé > 5 000 € de travaux.',
  },
]

const faqs = [
  {
    question: 'Quelle différence entre isolation phonique et isolation thermique ?',
    answer:
      'L’<strong>isolation thermique</strong> empêche la chaleur de passer (mesurée par <strong>R en m².K/W</strong>). L’<strong>isolation phonique</strong> empêche le son de passer (mesurée par <strong>Rw en dB</strong>). Certains matériaux (laine de roche, fibre de bois) excellent dans les deux. D’autres sont spécifiques : la mousse acoustique <em>absorbe</em> le son sans l’arrêter (utile pour réverbération en studio), le polystyrène <em>isole thermiquement</em> mais transmet bien le son (peu adapté en phonique). Pour MaPrimeRénov’/CEE : seule la performance thermique compte.',
  },
  {
    question: 'L’isolation phonique est-elle éligible à MaPrimeRénov’ ou CEE ?',
    answer:
      '<strong>Non, pas en tant que telle.</strong> MaPrimeRénov’, CEE, éco-PTZ et TVA 5,5 % ciblent uniquement la <strong>performance thermique</strong> (R en m².K/W). Cas particulier : si l’isolation phonique est réalisée avec une laine minérale ou biosourcée dans le cadre d’une opération thermique (ex. <strong>BAR-EN-101</strong> isolation toiture, <strong>BAR-EN-102</strong> ITE), la performance acoustique est un <em>bénéfice collatéral</em> mais n’est pas l’objet de l’aide. <strong>Exception</strong> : zones aéroport (Plan d’Exposition au Bruit PEB A/B/C) où la DGAC subventionne jusqu’à 80 % du devis d’insonorisation pour propriétaires riverains.',
  },
  {
    question: 'Qu’est-ce que le Rw en dB et qu’est-ce qu’une bonne valeur ?',
    answer:
      'Le <strong>Rw</strong> (« Rated Weighted », NF EN ISO 717-1) est l’<strong>affaiblissement acoustique pondéré</strong> d’une paroi en décibels. Plus il est élevé, mieux le bruit est arrêté. Repères : mur brique creuse 35 dB, cloison BA13 simple 32 dB, double vitrage standard 28 dB, contre-cloison masse-ressort-masse pro 55-65 dB. Réglementation NRA 2000 (neuf) : <strong>Rw ≥ 53 dB</strong> entre logements, <strong>Rw ≥ 30 dB</strong> en façade urbaine. Perception humaine : <strong>-10 dB ≈ -50 % du bruit perçu</strong>, -20 dB ≈ -75 %.',
  },
  {
    question: 'Les panneaux mousse à 25 €/m² sont-ils efficaces ?',
    answer:
      'Pour <strong>réduire la réverbération à l’intérieur d’une pièce</strong> (chant, podcast, home studio) : oui, +3-8 dB d’absorption (sensation de pièce moins « caisse de résonance »). Pour <strong>arrêter le bruit qui vient du voisin</strong> : <strong>non</strong>, la mousse est trop légère (25-40 kg/m³) pour bloquer une onde acoustique. La loi physique impose une <strong>masse</strong> (BA13 phonique 12 kg/m² + laine dense + 2e BA13). Sous 50 €/m² tout compris, méfiance — c’est du décoratif, pas de l’isolation. <strong>Le « 1 € » phonique n’existe pas</strong> : aucun dispositif public ne subventionne l’acoustique pure.',
  },
  {
    question: 'Quels sont les 3 types de bruits à connaître ?',
    answer:
      '(1) <strong>Bruit aérien</strong> : voix, TV, musique, circulation. Solution : masse + désolidarisation (contre-cloison, fenêtre acoustique). (2) <strong>Bruit d’impact</strong> : pas, chaises tirées, objets qui tombent. Solution : faux plafond suspendu désolidarisé, sous-couche au sol. Mesuré par <strong>L’nT,w ≤ 55 dB</strong> (NRA 2000). (3) <strong>Bruit d’équipement</strong> : VMC, plomberie, ascenseur, climatiseur. Solution : caisson désolidarisé + manchons souples sur les conduits + plot anti-vibratile. Le diagnostic acoustique identifie le ou les types dominants avant travaux.',
  },
  {
    question: 'Combien coûte un diagnostic acoustique ?',
    answer:
      '<strong>250 à 600 €</strong> pour une intervention courte (1-3 h) par un bureau d’études acoustique. Inclut mesures Rw + L’nT,w avec sonomètre certifié, identification des ponts phoniques (gaines, prises, plinthes, joints fenêtres), rapport avec préconisations chiffrées. <strong>Très rentable au-dessus de 5 000 €</strong> de travaux car il évite de surinvestir au mauvais endroit (ex. doubler un mur quand le bruit passe en réalité par la dalle ou la VMC). Annuaire pros : <a href="https://www.cnb.org" rel="noopener noreferrer" target="_blank">CNB Conseil National Bureau d’études acoustique</a> ou ingénieurs INSA.',
  },
  {
    question: 'Une fenêtre double vitrage standard est-elle phoniquement performante ?',
    answer:
      'Pas particulièrement. Un double vitrage <strong>thermique standard</strong> (4/16/4 argon) plafonne à <strong>Rw 28-30 dB</strong>. Un <strong>double vitrage acoustique</strong> utilise des vitrages d’épaisseur <strong>différente</strong> (10/16/4 par ex.) avec souvent un verre <strong>feuilleté Stadip Silence</strong> qui inclut un PVB acoustique. Performance : Rw 33-42 dB selon classe Acotherm (AC1 28 dB, AC2 30 dB, AC3 33 dB, AC4 36 dB). Pour zone très bruyante (axe routier, train) : Acotherm AC4 ou triple vitrage acoustique 6/12/4/12/8 (Rw 40-42 dB).',
  },
  {
    question: 'Quel artisan choisir pour l’isolation phonique ?',
    answer:
      'Selon le poste : <strong>plâtrier</strong> pour mur et plafond (Qualibat 6311 plâtrerie traditionnelle, 6321 plâtrerie sèche), <strong>menuisier</strong> pour fenêtres acoustiques (label <strong>Acotherm</strong> du fabricant + pose étanche cordon EPDM), <strong>parqueteur</strong> ou <strong>carreleur</strong> pour sol (sous-couche acoustique). <strong>Pas de label RGE acoustique spécifique</strong> — c’est un marché libre. Privilégier un artisan qui peut justifier <strong>2-3 chantiers similaires</strong> avec mesures de performance Rw avant/après. Pour studios pros ou home cinéma : passer par un <strong>bureau d’études acoustique</strong> (CNB, ingénieurs INSA) en amont.',
  },
]

const sources = [
  { label: 'CSTB — NF EN ISO 717-1 (Rw) + NRA 2000', url: 'https://www.cstb.fr' },
  { label: 'Acotherm — Label fenêtres acoustiques (AC1-AC4)', url: 'https://www.acotherm.com' },
  { label: 'ADEME — Guide bruit dans le logement', url: 'https://www.ademe.fr' },
  { label: 'Bruitparif — Cartes bruit Île-de-France', url: 'https://www.bruitparif.fr' },
  {
    label: 'DGAC — Aides insonorisation PEB aéroports',
    url: 'https://www.ecologie.gouv.fr/aide-insonorisation-logement',
  },
  {
    label: 'Service-Public.fr — Bruit de voisinage',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F2618',
  },
]

const relatedPages = [
  {
    label: 'Hub Isolation thermique',
    href: '/renovation-energetique/travaux/isolation',
    description: 'Combles + ITE + ITI + toiture (avec aides)',
  },
  {
    label: 'Guide — Mur appartement entre voisins',
    href: '/guides/isolation-phonique-mur-appartement',
    description: 'Deep-dive contre-cloison masse-ressort-masse 80-180 €/m²',
  },
  {
    label: 'Isolation toiture (sarking, rampants)',
    href: '/renovation-energetique/travaux/isolation/toiture',
    description: 'Acoustique + thermique combinés (laine de roche)',
  },
  {
    label: 'Fenêtres double vitrage 2026',
    href: '/renovation-energetique/travaux/fenetres-double-vitrage',
    description: 'Acotherm AC1-AC4, prix posé, aides MPR',
  },
  {
    label: 'Trouver un plâtrier RGE',
    href: '/services/platrier',
    description: 'Annuaire artisans plâtrerie (mur + plafond phonique)',
  },
  {
    label: 'Trouver un menuisier RGE',
    href: '/services/menuisier',
    description: 'Pose fenêtres acoustiques certifiées Acotherm',
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
    section: 'Isolation phonique',
    keywords: [
      'isolation phonique',
      'isolation acoustique',
      'isolation phonique mur',
      'isolation phonique mur mitoyen',
      'isolation phonique plafond',
      'isolation phonique sol',
      'isolation phonique fenetre',
      'isolation phonique appartement',
      'masse ressort masse',
      'rw db',
      'acotherm',
      'nra 2000',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Isolation', url: '/renovation-energetique/travaux/isolation' },
    { name: 'Phonique', url: PAGE_PATH },
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
              { label: 'Isolation', href: '/renovation-energetique/travaux/isolation' },
              { label: 'Phonique' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Volume2 className="w-3.5 h-3.5" aria-hidden />
              Acoustique 2026 — NF EN ISO 717-1 / NRA 2000
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Isolation phonique 2026 : prix, dB, solutions par poste
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              <strong>Mur, plafond, sol, fenêtre</strong> : 4 postes à traiter selon la source du
              bruit (aérien, impact, équipement). Loi physique de référence :{' '}
              <strong>masse-ressort-masse</strong>. Indice de performance :{' '}
              <strong>Rw en dB</strong> (NF EN ISO 717-1). Prix posé 2026 — mur 80-180 €/m², plafond
              60-150 €/m², sol 40-110 €/m², fenêtre acoustique 600-1 800 €/unité.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <div className="not-prose border-2 border-amber-300 bg-amber-50 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
            <div className="text-sm text-amber-900">
              <p className="font-semibold m-0 mb-1">
                Pas d’aide MaPrimeRénov’ ni CEE pour l’isolation phonique seule
              </p>
              <p className="m-0">
                Ces aides ciblent uniquement la performance <strong>thermique</strong> (R en
                m².K/W). L’acoustique pure n’est pas éligible. Exception : zones aéroport (Plan
                d’Exposition au Bruit PEB A/B/C) où la <strong>DGAC</strong> subventionne jusqu’à 80
                % du devis d’insonorisation pour propriétaires riverains. Voir{' '}
                <a
                  href="https://www.ecologie.gouv.fr/aide-insonorisation-logement"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="underline"
                >
                  ecologie.gouv.fr — aide insonorisation
                </a>
                .
              </p>
            </div>
          </div>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="solutions">Les 4 postes à isoler phoniquement</h2>
            <div className="not-prose grid gap-3 my-6">
              {SOLUTIONS.map((s) => (
                <div key={s.poste} className="bg-white border border-sand-200 rounded-xl p-5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                    <h3 className="font-heading text-base font-semibold text-sand-900 m-0">
                      {s.poste}
                    </h3>
                    <span className="text-sm font-bold text-primary-700 whitespace-nowrap">
                      {s.prix}
                    </span>
                  </div>
                  <p className="text-xs text-sand-500 m-0 mb-1">Gain typique : {s.rwGain}</p>
                  <p className="text-sm text-sand-700 m-0 mb-2">{s.technique}</p>
                  <p className="text-xs text-primary-600 font-medium m-0 italic">
                    Matériaux : {s.materiaux}
                  </p>
                  {s.href ? (
                    <p className="text-xs m-0 mt-2">
                      <Link href={s.href} className="text-primary-700 font-semibold">
                        Détail dédié →
                      </Link>
                    </p>
                  ) : null}
                </div>
              ))}
            </div>

            <h2 id="profil">Quelle solution selon votre situation</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Cas</th>
                    <th className="p-3 border-b border-sand-200">Recommandation</th>
                    <th className="p-3 border-b border-sand-200">Pourquoi</th>
                  </tr>
                </thead>
                <tbody>
                  {PROFILS.map((r) => (
                    <tr key={r.cas} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{r.cas}</td>
                      <td className="p-3 text-primary-700 font-semibold">{r.recommandation}</td>
                      <td
                        className="p-3 text-sand-600"
                        dangerouslySetInnerHTML={{ __html: r.justification }}
                      />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 id="materiaux">Matériaux : performances et prix</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Matériau</th>
                    <th className="p-3 border-b border-sand-200">Densité</th>
                    <th className="p-3 border-b border-sand-200">Apport Rw</th>
                    <th className="p-3 border-b border-sand-200">Prix</th>
                  </tr>
                </thead>
                <tbody>
                  {MATERIAUX.map((m) => (
                    <tr key={m.materiau} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{m.materiau}</td>
                      <td className="p-3 text-sand-600 text-xs">{m.densite}</td>
                      <td className="p-3 text-sand-700">{m.rwApport}</td>
                      <td className="p-3 text-primary-700 font-semibold">{m.prix}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 italic px-3 pb-2">
                Densité = clé de la performance acoustique. Plus c’est dense, plus l’onde est
                absorbée. Mousse polyuréthane légère = absorption décorative ≠ isolation phonique.
              </p>
            </div>

            <h2 id="prix">Prix posé 2026 — détail par poste</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Poste</th>
                    <th className="p-3 border-b border-sand-200">Prix</th>
                    <th className="p-3 border-b border-sand-200">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {PRIX_DETAIL.map((p) => (
                    <tr key={p.poste} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium text-sand-900">{p.poste}</td>
                      <td className="p-3 text-primary-700 font-semibold">{p.prix}</td>
                      <td className="p-3 text-sand-600 text-xs">{p.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-sand-500 italic">
              Fourchettes indicatives 2026 (matériel + pose). Variations selon zone géographique,
              accessibilité du chantier, complexité acoustique. Diagnostic acoustique préalable
              recommandé au-delà de 5 000 € de travaux.
            </p>

            <h2 id="reglementation">Réglementation acoustique en France</h2>
            <ul>
              <li>
                <strong>NRA 2000</strong> (Nouvelle Réglementation Acoustique) — bâtiments neufs
                résidentiels : Rw ≥ 53 dB entre logements, ≥ 30 dB façade urbaine, L’nT,w ≤ 55 dB
                (impact).
              </li>
              <li>
                <strong>Décret bruit voisinage</strong> (Art. R1334-30 à R1334-37 CSP) — tapage
                diurne ou nocturne sanctionné si gêne caractérisée.
              </li>
              <li>
                <strong>NF EN ISO 717-1</strong> — méthode normalisée de mesure du Rw
                (affaiblissement acoustique pondéré).
              </li>
              <li>
                <strong>Plan d’Exposition au Bruit (PEB)</strong> — aéroports : zones A/B/C avec
                aides DGAC jusqu’à 80 % pour insonorisation des logements riverains.
              </li>
            </ul>

            <h2 id="cta">Trouvez un artisan acoustique près de chez vous</h2>
            <div className="not-prose bg-primary-50 border border-primary-200 rounded-xl p-6 my-6">
              <p className="text-sand-900 m-0 mb-3">
                <Calculator className="inline w-5 h-5 text-primary-700 mr-1" aria-hidden />
                <strong>Devis isolation phonique en 30 secondes</strong> — plâtriers, menuisiers et
                bureaux d’études acoustique du réseau ServicesArtisans.
              </p>
              <Link
                href="/devis"
                className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-semibold px-5 py-3 rounded-lg transition"
              >
                Demander mon devis isolation phonique <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          </article>

          <FlagshipFaq items={faqs} />

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              Pour aller plus loin
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {relatedPages.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="block bg-white border border-sand-200 hover:border-primary-300 rounded-xl p-4 transition"
                >
                  <p className="font-semibold text-sand-900 m-0 mb-1 inline-flex items-center gap-1">
                    {p.label} <ArrowRight className="w-3.5 h-3.5 text-primary-700" aria-hidden />
                  </p>
                  <p className="text-sm text-sand-600 m-0">{p.description}</p>
                </Link>
              ))}
            </div>
          </section>

          <FlagshipSources sources={sources} />
          <FlagshipAuthorCard
            authorSlug={AUTHOR_SLUG}
            authorName={AUTHOR_NAME}
            datePublished={PUBLISHED}
            dateModified={MODIFIED}
          />
        </div>
      </div>
    </>
  )
}
