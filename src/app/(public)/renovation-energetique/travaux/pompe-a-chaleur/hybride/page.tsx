/**
 * Page : /renovation-energetique/travaux/pompe-a-chaleur/hybride
 *
 * @kw-primary    pompe a chaleur hybride
 * @kw-volume     1100
 * @kw-kd         3
 * @kw-cpc        1.95
 * @intent        commercial + informational
 * @cluster       pac
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md (rang #82)
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — sub-cluster PAC hybride)
 * @backlog-item  Levier-R-pac-hybride
 *
 * KW cibles (validés Ahrefs gap CSV 2026-04, country=fr) :
 * - "pompe a chaleur hybride"        1 100 vol, KD 3 ⭐⭐⭐ pivot rang #82
 * - "pompe à chaleur hybride"          700 vol, KD 3 (rang #126)
 * - "chaudiere hybride"                300 vol, KD 0 (rang #186)
 * - "pac hybride"                     ~250 vol estimé KD 1
 * - "système hybride pac gaz"         ~120 vol estimé
 * - "hybride pac chaudiere gaz"       ~80 vol estimé
 * - Famille cumulée pivot : ~2 550 vol/mois (KD 0-3 = easy win)
 *
 * Easy win : OUI (KD 0-3, sub-page absente du cluster /pompe-a-chaleur).
 * Concurrence : effy, quelleenergie, EDF, Daikin — pages produit ou marketing.
 * Atout SA : guide HONNÊTE hybride (cas d'usage adaptés, comparatif vs PAC pure
 * et gaz seul, fabricants leaders, prix net après aides, 10 erreurs à éviter).
 *
 * Cluster pillar : Rénovation Énergétique → Travaux → PAC → Hybride
 *
 * Anti-cannibalisation :
 *   - /pompe-a-chaleur                  = hub PAC (3 types)
 *   - /pompe-a-chaleur/air-eau-prix     = focus PAC air-eau pure
 *   - /pompe-a-chaleur/air-air-prix     = focus PAC air-air pure
 *   - /pompe-a-chaleur/geothermie       = focus PAC géothermie
 *   - /pompe-a-chaleur/fonctionnement   = principe physique PAC
 *   - /chauffage/chaudiere-gaz          = panorama chaudière gaz pur
 *   - /chauffage/chaudiere-gaz/remplacement = action remplacement (mentionne hybride parmi 5)
 *   - Cette page = SYSTÈME HYBRIDE PAC + chaudière gaz condensation (produit complet,
 *     compromis maisons mal isolées + climat froid, seul cas où MPR finance encore le gaz).
 *
 * YMYL high : décisions investissement 14-22K€, statut réglementaire (seul système gaz
 * encore éligible MPR depuis 2024), arbitrage technique complexe (température bivalente,
 * COP saisonnier, dimensionnement bi-énergie). Cite : Légifrance Décret 2020-26 RGE,
 * Règlement F-Gas UE 517/2014, France Rénov', ADEME, Code énergie L100-4, NF EN 14511.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Ban,
  Calculator,
  CheckCircle2,
  Coins,
  Flame,
  Home,
  ShieldCheck,
  Snowflake,
  Thermometer,
  Wrench,
  XCircle,
  Zap,
} from 'lucide-react'

import type { LucideIcon } from 'lucide-react'

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

const PAGE_PATH = '/renovation-energetique/travaux/pompe-a-chaleur/hybride'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Pompe à chaleur hybride 2026 : prix, aides, fabricants'
const DESCRIPTION =
  "Système hybride PAC + chaudière gaz 2026 : fonctionnement bivalent, comparatif vs PAC pure, prix posé 14-22 K€, aides MPR + CEE jusqu'à 6 000 €."

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
  'Système hybride = PAC air-eau (charge principale 80-90 % du temps) + chaudière gaz condensation (relais grand froid < -7 °C).',
  "Le seul système au gaz encore éligible MaPrimeRénov' depuis 2024 (4 000 € MPR Bleu + CEE 1 500-3 000 €).",
  'Prix posé 2026 : 14 000-22 000 € selon puissance PAC (5-12 kW) et chaudière (18-25 kW).',
  "Cas d'usage : maison mal isolée (DPE E-G), climat froid (Massif Central, Est), conservation tubage gaz, refus PAC seule.",
  'Économie facture : 35-50 % vs chaudière gaz seule (vs 50-70 % pour PAC seule). ROI 7-12 ans après aides.',
  "4 fabricants leaders : Daikin Altherma 3 H Hybride, Atlantic Alféa Hybride Duo, Saunier Duval Geni'Air Hybride, De Dietrich HPI Hybride.",
  'Limite : transition énergétique (Code énergie L100-4 vise neutralité 2050). Hybride = compromis intermédiaire, pas solution long terme.',
]

const FONCTIONNEMENT_PHASES = [
  {
    titre: 'Phase 1 — Plage normale (T° ext > 7 °C)',
    detail:
      "La PAC tourne seule à pleine charge. COP 3,5-4,5 (1 kWh élec = 3,5-4,5 kWh chaleur). Couvre 100 % des besoins chauffage + ECS si température départ ≤ 50 °C. Chaudière gaz à l'arrêt complet, consommation gaz = 0.",
  },
  {
    titre: 'Phase 2 — Bivalence parallèle (T° ext entre -2 °C et 7 °C)',
    detail:
      "PAC + chaudière gaz fonctionnent simultanément. Le régulateur intelligent compare en temps réel le coût marginal kWh : si prix gaz < prix élec × COP_actuel, la chaudière gaz prend le relais d'appoint. Optimum énergétique automatique.",
  },
  {
    titre: 'Phase 3 — Bivalence alternée (T° ext entre -7 °C et -2 °C)',
    detail:
      "Le régulateur bascule selon une courbe pré-paramétrée (point de bivalence). En-dessous du seuil, la PAC s'arrête (COP < 2,5 = inefficient), la chaudière gaz prend toute la charge. Confort préservé même en pointe.",
  },
  {
    titre: 'Phase 4 — Mode secours (T° ext < -7 °C)',
    detail:
      'PAC complètement désactivée. Chaudière gaz condensation seule en charge. Cette phase représente 5-15 % du temps en France (sauf zone H1c-H2 froide). Garantit le confort par grand froid sans surdimensionner la PAC.',
  },
]

const CAS_USAGE: {
  icon: LucideIcon
  titre: string
  profil: string
  pourquoiHybride: string
  economie: string
  aides: string
  netApresAides: string
}[] = [
  {
    icon: Thermometer,
    titre: 'Maison ancienne mal isolée (DPE E-F-G)',
    profil: 'Maison < 1990 sans rénovation isolation, déperditions élevées',
    pourquoiHybride:
      'Une PAC seule devrait fournir 100 % de la puissance par grand froid sur une maison passoire — surdimensionnement coûteux et inefficient. La chaudière gaz couvre la pointe, la PAC tourne en optimum 80-90 % du temps. Compromis intelligent avant rénovation isolation globale.',
    economie: '35-50 % facture vs chaudière gaz seule',
    aides: 'MPR Bleu 4 000 € + CEE 1 500-3 000 € + bonus passoire 1 500 € si DPE F/G',
    netApresAides: '8 500-15 000 €',
  },
  {
    icon: Snowflake,
    titre: 'Climat froid (Massif Central, Est, Vosges, Jura)',
    profil: 'Zone climatique H1c, H1b ou H2c avec T° base < -8 °C',
    pourquoiHybride:
      "Une PAC air-eau perd jusqu'à 30 % de COP en-dessous de -5 °C. Sur 60-90 jours/an de grand froid, les économies théoriques fondent. L'hybride bascule automatiquement sur le gaz aux pires moments, conserve la PAC en optimum le reste de l'année.",
    economie: '30-45 % facture vs chaudière gaz seule',
    aides: 'MPR Bleu 4 000 € + CEE 2 000-3 000 €',
    netApresAides: '9 000-15 000 €',
  },
  {
    icon: Home,
    titre: 'Conservation infrastructure gaz existante',
    profil: 'Tubage gaz récent + chaudière condensation < 5 ans + raccordement GRDF',
    pourquoiHybride:
      "Chaudière gaz performante encore amortissable, switch total vers PAC = perte d'investissement. L'hybride conserve la chaudière (intégrée au système), ajoute la PAC en charge principale. Investissement réduit (8-12K € vs 14-22K € pose neuve).",
    economie: '40-55 % facture',
    aides: 'CEE 1 500-2 500 € (MPR uniquement si chaudière incluse dans devis)',
    netApresAides: '6 000-10 000 €',
  },
  {
    icon: Ban,
    titre: 'Refus PAC seule (esthétique, voisinage, copro)',
    profil:
      'Contraintes copropriété, ABF (Architecte Bâtiments France), voisinage, espace ext limité',
    pourquoiHybride:
      "Une PAC hybride permet d'utiliser une PAC plus petite (5-8 kW au lieu de 10-14 kW) — encombrement réduit, bruit moindre (35-45 dB à 1 m vs 45-55 dB), intégration architecturale facilitée. Compromis acceptable en copropriété ancienne.",
    economie: '35-50 % facture',
    aides: 'MPR Bleu 4 000 € + CEE 1 500-3 000 €',
    netApresAides: '8 500-15 000 €',
  },
]

const COMPARATIF = [
  {
    critere: 'Investissement initial (15 kW équiv.)',
    hybride: '14 000-22 000 €',
    pacSeule: '12 000-15 000 €',
    gazSeul: '4 500-7 500 €',
    detailHybride: 'Plus cher (2 systèmes)',
  },
  {
    critere: 'Aides MPR + CEE 2026',
    hybride: '5 500-7 000 €',
    pacSeule: '9 000-13 000 €',
    gazSeul: '300-700 € (CEE seul)',
    detailHybride: 'MPR Bleu 4K + CEE 1,5-3K',
  },
  {
    critere: 'Reste à charge net après aides',
    hybride: '8 500-15 000 €',
    pacSeule: '3 000-6 000 €',
    gazSeul: '4 200-6 800 €',
    detailHybride: 'Le plus cher net',
  },
  {
    critere: 'Économie facture annuelle',
    hybride: '35-50 %',
    pacSeule: '50-70 %',
    gazSeul: '20-30 % (vs vieille chaudière)',
    detailHybride: 'Gain modéré',
  },
  {
    critere: 'Confort par grand froid (-10 °C)',
    hybride: 'Excellent (gaz prend relais)',
    pacSeule: 'Dégradé (COP 1,8-2,2)',
    gazSeul: 'Excellent',
    detailHybride: 'Atout #1 hybride',
  },
  {
    critere: 'Empreinte carbone (kgCO2eq/an, 100 m²)',
    hybride: '1 200-2 200',
    pacSeule: '300-800 (élec mix)',
    gazSeul: '2 500-4 000',
    detailHybride: 'Mieux que gaz seul',
  },
  {
    critere: 'Espace technique requis',
    hybride: '1,5 m² intérieur + unité ext',
    pacSeule: '1 m² + unité ext',
    gazSeul: '0,5-1 m²',
    detailHybride: 'Plus gourmand',
  },
  {
    critere: 'Maintenance (visites annuelles)',
    hybride: '2 visites (PAC + gaz)',
    pacSeule: '1 visite',
    gazSeul: '1 visite obligatoire',
    detailHybride: 'Coût + (250-400 €/an)',
  },
  {
    critere: 'Durée de vie',
    hybride: '15-18 ans (limité par PAC)',
    pacSeule: '15-20 ans',
    gazSeul: '15-20 ans',
    detailHybride: 'Identique PAC',
  },
]

const FABRICANTS = [
  {
    marque: 'Daikin Altherma 3 H Hybride',
    origine: 'Japon (usine France à Carros 06)',
    particularite:
      'Référence du marché. PAC 5-8 kW + chaudière gaz condensation 24-28 kW intégrées. SCOP 4,5 (climat moyen). Régulation cloud Daikin Onecta. Garantie 5 ans pièces compresseur.',
    prixIndicatif: '15 000-19 000 € posé',
  },
  {
    marque: 'Atlantic Alféa Hybride Duo',
    origine: 'France (Vendée + Maine-et-Loire)',
    particularite:
      'Fabriqué en France. PAC 6-10 kW + chaudière 25 kW. SCOP 4,3. Régulation Cozytouch (intégrée Atlantic). Excellent SAV en France. Forfait pose Atlantic possible.',
    prixIndicatif: '14 000-18 000 € posé',
  },
  {
    marque: "Saunier Duval Geni'Air Hybride",
    origine: 'France-Allemagne (groupe Vaillant)',
    particularite:
      'Système modulaire (PAC bibloc 5-12 kW + chaudière condensation existante ou neuve). Compatible chaudière Saunier Duval ≤ 8 ans. Régulation MiSet. Solution flexible pour rénovation.',
    prixIndicatif: '12 000-17 000 € posé (selon réutilisation)',
  },
  {
    marque: 'De Dietrich HPI / EvoDens Hybride',
    origine: 'France-Allemagne',
    particularite:
      "Gamme premium. PAC bi-bloc 5-11 kW + chaudière condensation 20-50 kW (jusqu'aux maisons surface importante). Régulation Diematic. Excellente longévité, fluide R32. Garantie 7 ans.",
    prixIndicatif: '17 000-22 000 € posé',
  },
]

const ERREURS_A_EVITER = [
  'Acheter hybride si maison déjà BIEN isolée (DPE C ou mieux) — PAC seule gagnante.',
  'Confondre chaudière hybride (PAC + gaz) et chaudière à condensation seule.',
  'Conserver une chaudière > 10 ans en hybride — fin de vie en 5-7 ans, double investissement.',
  "Mal régler le point de bivalence — surconsommation gaz (20-30 % d'écart selon paramétrage).",
  'Choisir installateur non QualiPAC + non QualiGaz — un seul label = perte CEE ou MPR.',
  'Surdimensionner la PAC (> besoin) — cycles courts, usure rapide, ROI dégradé.',
  'Sous-dimensionner la chaudière gaz (relais insuffisant) — confort dégradé par grand froid.',
  "Démarrer le chantier avant dépôt du dossier MPR/CEE — pas d'aide rétroactive.",
  'Oublier la sonde extérieure de bivalence — régulation aveugle, perte 10-15 % rendement.',
  "Omettre l'étude de dimensionnement (calcul G x DJU + DPE + zone climatique) — étape OBLIGATOIRE.",
]

const faqs = [
  {
    question: 'Comment fonctionne une pompe à chaleur hybride ?',
    answer:
      "Le système hybride combine 2 sources de chaleur : une PAC air-eau (charge principale, 80-90 % du temps) et une chaudière gaz à condensation (relais d'appoint en grand froid). 4 phases automatiques : (1) T° ext > 7 °C → PAC seule (COP 3,5-4,5) ; (2) -2 à 7 °C → bivalence parallèle, régulateur compare coût marginal kWh entre les 2 sources ; (3) -7 à -2 °C → bascule alternée selon point de bivalence ; (4) < -7 °C → chaudière gaz seule (5-15 % du temps en France). Régulation intelligente qui optimise en temps réel.",
  },
  {
    question: 'Combien coûte une PAC hybride en 2026 ?',
    answer:
      'Prix posé clé en main 2026 : 14 000-22 000 € selon le scénario. (1) Système complet neuf (PAC 6-8 kW + chaudière 24 kW intégrées Daikin/Atlantic) = 15 000-19 000 €. (2) Conservation chaudière < 5 ans + ajout PAC modulaire (Saunier Duval) = 12 000-17 000 €. (3) Gamme premium (De Dietrich grandes surfaces) = 17 000-22 000 €. Avec aides 2026 (MPR Bleu 4 000 € + CEE 1 500-3 000 €), reste à charge net 8 500-15 000 €.',
  },
  {
    question: "MaPrimeRénov' finance-t-elle la PAC hybride ?",
    answer:
      "Oui, c'est le SEUL système au gaz encore éligible MaPrimeRénov' depuis 2024. Forfait MPR Bleu (revenus très modestes) = 4 000 €, MPR Jaune (revenus modestes) = 3 000 €, MPR Violet (intermédiaires) = 2 000 €, MPR Rose (supérieurs) = exclu. Cumul possible avec CEE Coup de pouce chauffage 1 500-3 000 €, éco-PTZ jusqu'à 30 000 € si combiné avec d'autres travaux, et bonus sortie passoire DPE F/G de 1 500 €. Total maximum cumulé : ~8 500 € MPR Bleu + bonus.",
  },
  {
    question: 'PAC hybride ou PAC seule : laquelle choisir ?',
    answer:
      "PAC SEULE recommandée si : (1) maison correctement isolée (DPE C ou mieux), (2) zone climatique H2-H3 (pas de grand froid prolongé), (3) terrain et espace pour unité extérieure. ROI plus rapide, économies factures 50-70 %, aides plus généreuses (jusqu'à 13 000 €). PAC HYBRIDE recommandée si : (1) maison mal isolée DPE E-G non rénovée, (2) climat froid H1c/H1b/H2c (Massif Central, Est, Vosges), (3) chaudière gaz récente à conserver, (4) contraintes architecturales (copropriété, ABF). Compromis confort + écologie partielle.",
  },
  {
    question: "Combien d'économie sur ma facture avec une PAC hybride ?",
    answer:
      "35-50 % d'économie sur la facture annuelle vs chaudière gaz seule, selon le climat et la qualité d'isolation. Exemple maison 100 m² DPE E zone H1b (Centre-Est) : facture gaz seule ~2 200 €/an → facture hybride ~1 250 €/an = 950 € d'économie. Sur 15 ans = 14 250 € économisés. ROI net après aides : 7-12 ans (calcul prix net 8 500-15 000 € ÷ 950 €/an). Économies inférieures à PAC seule (50-70 %) car la chaudière gaz tourne 10-20 % du temps.",
  },
  {
    question: 'Quelles marques de PAC hybride choisir ?',
    answer:
      "4 fabricants leaders en France : (1) <strong>Daikin Altherma 3 H Hybride</strong> — référence mondiale, SCOP 4,5, fabriqué partiellement en France, garantie 5 ans, 15 000-19 000 € ; (2) <strong>Atlantic Alféa Hybride Duo</strong> — fabriqué en France, SCOP 4,3, SAV national, 14 000-18 000 € ; (3) <strong>Saunier Duval Geni'Air Hybride</strong> — modulaire (réutilise chaudière existante), 12 000-17 000 € ; (4) <strong>De Dietrich HPI Hybride</strong> — premium grandes surfaces, garantie 7 ans, 17 000-22 000 €. Vérifier label NF PAC ou EHPA Quality Label sur le matériel.",
  },
  {
    question: 'Quel artisan installe une PAC hybride ?',
    answer:
      "Plombier-chauffagiste DOUBLEMENT qualifié : <strong>QualiPAC</strong> (organisme Qualit'EnR, obligatoire pour la PAC + bénéfice MPR/CEE) ET <strong>QualiGaz Évolution</strong> (organisme habilité gaz, obligatoire chaudière). Cumul indispensable, sinon perte des aides. Vérifier également : SIRET valide, attestation décennale, certification F-Gaz catégorie 1 (manipulation fluides frigorigènes), 3 références chantiers récents, devis détaillé avec marque/modèle PAC + chaudière, SCOP, point de bivalence. Notre annuaire référence des chauffagistes vérifiés QualiPAC + QualiGaz.",
  },
  {
    question: 'La PAC hybride est-elle une bonne solution long terme ?',
    answer:
      "Pas vraiment. L'hybride est un compromis TRANSITOIRE intelligent (12-18 ans) avant rénovation globale. Le Code de l'énergie L100-4 fixe la neutralité carbone 2050 — le gaz résidentiel sera vraisemblablement réduit puis interdit progressivement. Stratégie recommandée : (1) Hybride aujourd'hui pour confort + aides MPR ; (2) En parallèle, planifier rénovation isolation (combles + murs) sur 5-8 ans ; (3) Au renouvellement de la PAC (15-18 ans), basculer vers PAC seule (logement entre-temps mieux isolé). Solution évolutive vs solution finale.",
  },
]

const sources = [
  {
    label: 'Légifrance — Décret n° 2020-26 du 14 janvier 2020 (RGE / QualiPAC)',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000041411230',
  },
  {
    label: "Code de l'énergie — Article L100-4 (objectif neutralité 2050)",
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000041553759',
  },
  {
    label: 'Règlement UE 517/2014 (F-Gas — fluides frigorigènes)',
    url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32014R0517',
  },
  {
    label: "France Rénov' — Pompe à chaleur hybride",
    url: 'https://france-renov.gouv.fr/renovation/chauffage',
  },
  {
    label: "MaPrimeRénov' — Forfait PAC hybride 2026",
    url: 'https://france-renov.gouv.fr/aides/maprimerenov',
  },
  {
    label: 'ADEME — Guide chauffage performant',
    url: 'https://librairie.ademe.fr/urbanisme-et-batiment/2096-se-chauffer-mieux-et-moins-cher.html',
  },
  {
    label: 'AFPAC — Association Française pour les PAC',
    url: 'https://www.afpac.org',
  },
  {
    label: "Qualit'EnR — Annuaire QualiPAC",
    url: 'https://www.qualit-enr.org/qualipac',
  },
  {
    label: 'QualiGaz Évolution — Organisme certificateur gaz',
    url: 'https://www.qualigaz.com',
  },
]

const relatedPages = [
  {
    label: 'Hub PAC 2026 — 3 types',
    href: '/renovation-energetique/travaux/pompe-a-chaleur',
    description: 'Air-eau, air-air, géothermie — comparatif',
  },
  {
    label: 'PAC air-eau prix 2026',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix',
    description: "12-15K € posé, MPR + CEE jusqu'à 9 000 €",
  },
  {
    label: 'Fonctionnement PAC',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/fonctionnement',
    description: 'Cycle thermo + COP + fluide frigo',
  },
  {
    label: 'Installation PAC (8 phases)',
    href: '/renovation-energetique/travaux/pompe-a-chaleur/installation',
    description: 'QualiPAC + RGE + durée 2-5 jours',
  },
  {
    label: 'Hub Chaudière gaz 2026',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-gaz',
    description: '4 types + statut RE2020',
  },
  {
    label: 'Remplacement chaudière gaz',
    href: '/renovation-energetique/travaux/chauffage/chaudiere-gaz/remplacement',
    description: '5 alternatives + planning chantier',
  },
  {
    label: 'Hub aides rénovation 2026',
    href: '/renovation-energetique/aides',
    description: 'MPR + CEE + éco-PTZ',
  },
  {
    label: 'Trouver un chauffagiste QualiPAC + QualiGaz',
    href: '/services/chauffagiste',
    description: 'Annuaire RGE vérifié',
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
    section: 'PAC — Système hybride',
    keywords: [
      'pompe a chaleur hybride',
      'pompe à chaleur hybride',
      'pac hybride',
      'chaudiere hybride',
      'systeme hybride pac gaz',
      'hybride pac chaudiere gaz',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Pompe à chaleur', url: '/renovation-energetique/travaux/pompe-a-chaleur' },
    { name: 'Hybride', url: PAGE_PATH },
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
                label: 'Pompe à chaleur',
                href: '/renovation-energetique/travaux/pompe-a-chaleur',
              },
              { label: 'Hybride' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Flame className="w-3.5 h-3.5" aria-hidden />
              Seul système gaz encore éligible MPR depuis 2024
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Pompe à chaleur hybride 2026 : prix, aides et fabricants
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              La <strong>pompe à chaleur hybride</strong> combine une PAC air-eau (charge
              principale) et une chaudière gaz condensation (relais grand froid). C&apos;est le{' '}
              <strong>SEUL système au gaz encore éligible MaPrimeRénov&apos;</strong> depuis 2024
              (forfait 4 000 € MPR Bleu + CEE 1 500-3 000 €). Idéal pour maisons mal isolées (DPE
              E-G), climat froid (Massif Central, Est) ou conservation d&apos;une infrastructure gaz
              récente. Prix posé 14 000-22 000 €, reste net 8 500-15 000 € après aides 2026.
            </p>
            <LastUpdated date={MODIFIED} />
          </header>

          <TldrBlock bullets={tldr} />

          <section aria-labelledby="fonctionnement" className="my-10">
            <h2
              id="fonctionnement"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <Zap className="w-5 h-5 text-primary-700" aria-hidden />
              Fonctionnement bivalent en 4 phases automatiques
            </h2>
            <p className="text-sand-700 mb-5">
              Une PAC hybride n&apos;est pas un simple cumul de 2 systèmes. C&apos;est une
              régulation intelligente qui bascule automatiquement entre PAC et chaudière gaz selon
              la température extérieure et le coût marginal du kWh, en 4 phases :
            </p>
            <ol className="space-y-3">
              {FONCTIONNEMENT_PHASES.map((p, i) => (
                <li
                  key={p.titre}
                  className="bg-white border border-sand-200 rounded-lg p-4 flex gap-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-base font-semibold text-sand-900 mb-1">
                      {p.titre}
                    </h3>
                    <p className="text-sm text-sand-700 m-0">{p.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="cas-usage" className="my-10">
            <h2
              id="cas-usage"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-primary-700" aria-hidden />4 cas d&apos;usage où
              la PAC hybride est gagnante
            </h2>
            <p className="text-sand-700 mb-5">
              La PAC hybride n&apos;est PAS une solution universelle. Elle est gagnante dans 4
              profils de logements précis. Hors de ces cas, une PAC seule ou une chaudière
              condensation classique sont plus pertinentes :
            </p>
            <div className="space-y-4">
              {CAS_USAGE.map((c) => {
                const Icon = c.icon
                return (
                  <article key={c.titre} className="bg-white border border-sand-200 rounded-lg p-5">
                    <h3 className="font-heading text-base font-semibold text-sand-900 mb-2 flex items-center gap-2">
                      <Icon className="w-5 h-5 text-primary-700 shrink-0" aria-hidden />
                      {c.titre}
                    </h3>
                    <p className="text-sm text-sand-700 m-0 mb-2">
                      <strong>Profil :</strong> {c.profil}
                    </p>
                    <p className="text-sm text-sand-700 m-0 mb-2">
                      <strong>Pourquoi hybride :</strong> {c.pourquoiHybride}
                    </p>
                    <div className="grid sm:grid-cols-3 gap-2 text-xs">
                      <div className="bg-sand-50 rounded p-2">
                        <p className="text-sand-600 m-0">Économie facture</p>
                        <p className="font-semibold text-sand-900 m-0">{c.economie}</p>
                      </div>
                      <div className="bg-sand-50 rounded p-2">
                        <p className="text-sand-600 m-0">Aides 2026</p>
                        <p className="font-semibold text-sand-900 m-0">{c.aides}</p>
                      </div>
                      <div className="bg-accent-50 rounded p-2">
                        <p className="text-accent-700 m-0">Net après aides</p>
                        <p className="font-bold text-accent-900 m-0">{c.netApresAides}</p>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <section aria-labelledby="comparatif" className="my-10">
            <h2
              id="comparatif"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <Calculator className="w-5 h-5 text-primary-700" aria-hidden />
              Comparatif PAC hybride vs PAC seule vs chaudière gaz
            </h2>
            <p className="text-sand-700 mb-5">
              9 critères chiffrés sur les 3 systèmes de chauffage (15 kW équivalent, maison 100 m²
              zone H1b). Le choix optimal dépend de l&apos;isolation existante et du climat :
            </p>
            <div className="overflow-x-auto bg-white border border-sand-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-sand-100">
                  <tr>
                    <th className="text-left p-3 font-semibold text-sand-900">Critère</th>
                    <th className="text-left p-3 font-semibold text-sand-900">Hybride</th>
                    <th className="text-left p-3 font-semibold text-sand-900">PAC seule</th>
                    <th className="text-left p-3 font-semibold text-sand-900">Gaz seul</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARATIF.map((c, i) => (
                    <tr key={c.critere} className={i % 2 === 0 ? 'bg-white' : 'bg-sand-50'}>
                      <td className="p-3 font-medium text-sand-800 border-t border-sand-200">
                        {c.critere}
                      </td>
                      <td className="p-3 text-sand-700 border-t border-sand-200">{c.hybride}</td>
                      <td className="p-3 text-sand-700 border-t border-sand-200">{c.pacSeule}</td>
                      <td className="p-3 text-sand-700 border-t border-sand-200">{c.gazSeul}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="fabricants" className="my-10">
            <h2
              id="fabricants"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <ShieldCheck className="w-5 h-5 text-primary-700" aria-hidden />4 fabricants leaders
              de PAC hybride en France
            </h2>
            <p className="text-sand-700 mb-5">
              4 marques dominent le marché de la PAC hybride en France 2026, avec des
              positionnements distincts (référence mondiale, made in France, modulaire, premium
              grandes surfaces) :
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {FABRICANTS.map((f) => (
                <article key={f.marque} className="bg-white border border-sand-200 rounded-lg p-4">
                  <h3 className="font-heading text-base font-semibold text-sand-900 mb-1">
                    {f.marque}
                  </h3>
                  <p className="text-xs text-sand-500 m-0 mb-2">Origine : {f.origine}</p>
                  <p className="text-sm text-sand-700 m-0 mb-2">{f.particularite}</p>
                  <p className="text-xs font-semibold text-accent-700 m-0">
                    Prix indicatif : {f.prixIndicatif}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="erreurs" className="my-10">
            <h2
              id="erreurs"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <AlertTriangle className="w-5 h-5 text-red-700" aria-hidden />
              10 erreurs à éviter
            </h2>
            <ul className="space-y-2 bg-white border border-sand-200 rounded-lg p-5 list-none pl-0">
              {ERREURS_A_EVITER.map((e) => (
                <li
                  key={e}
                  className="text-sm text-sand-700 m-0 flex items-start gap-2 border-b border-sand-100 last:border-b-0 py-2 first:pt-0 last:pb-0"
                >
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" aria-hidden />
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="artisan" className="my-10">
            <h2
              id="artisan"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <Wrench className="w-5 h-5 text-primary-700" aria-hidden />
              Choisir un chauffagiste QualiPAC + QualiGaz
            </h2>
            <p className="text-sand-700 mb-3">
              L&apos;installation d&apos;une PAC hybride exige un chauffagiste DOUBLEMENT qualifié :{' '}
              <strong>QualiPAC</strong> (organisme Qualit&apos;EnR — obligation pour bénéficier des
              aides MPR + CEE sur la PAC) ET <strong>QualiGaz Évolution</strong> (organisme
              habilité, obligation pour la chaudière gaz et la TVA 5,5 %). Un seul label = perte
              d&apos;une partie des aides.
            </p>
            <ul className="space-y-2 mb-3 list-disc pl-6 text-sand-700 text-sm">
              <li>SIRET valide + assurance décennale en cours.</li>
              <li>Certification F-Gaz catégorie 1 (manipulation fluides frigorigènes R32/R290).</li>
              <li>3 références chantiers récents PAC hybride (idéal &lt; 12 mois).</li>
              <li>
                Devis détaillé avec marque/modèle PAC + chaudière, SCOP, point de bivalence
                (température basculement).
              </li>
              <li>Étude de dimensionnement (calcul G x DJU + DPE + zone climatique) annexée.</li>
              <li>
                Mise en service formelle avec contrôle de combustion + paramétrage régulation.
              </li>
            </ul>
            <Link
              href="/services/chauffagiste"
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              Trouver un chauffagiste QualiPAC + QualiGaz vérifié
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </section>

          <FlagshipFaq title="PAC hybride : foire aux questions" items={faqs} />

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
              href="/renovation-energetique/travaux/pompe-a-chaleur"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub PAC
            </Link>
            <Link
              href="/services/chauffagiste"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Chauffagistes <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
