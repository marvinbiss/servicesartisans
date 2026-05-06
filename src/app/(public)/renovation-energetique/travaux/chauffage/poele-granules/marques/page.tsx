/**
 * Page : /renovation-energetique/travaux/chauffage/poele-granules/marques
 *
 * @kw-primary    meilleur poele a granule
 * @kw-volume     500
 * @kw-kd         3
 * @kw-cpc        1.20
 * @intent        commercial + comparison
 * @cluster       poele_granules
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md (rang #170)
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — sub-cluster comparatif marques)
 * @backlog-item  Levier-U-meilleur-poele-granules
 *
 * KW cibles (validés Ahrefs gap CSV 2026-04, country=fr) :
 * - "meilleur poele a granule"                          500 vol, KD 3 ⭐⭐ pivot rang #170
 * - "quelle est la meilleure marque de poele à granulés" 500 vol, KD 0 (rang #168)
 * - "poele a granules avis"                             ~250 vol estimé KD 1
 * - "comparatif poele a granules"                       ~150 vol estimé KD 1
 * - "marque poele a granules"                           ~200 vol estimé KD 1
 * - "top poele a granules"                              ~120 vol estimé KD 0
 * - "fiabilité poele a granules"                        ~100 vol estimé KD 1
 * - Famille cumulée pivot : ~1 820 vol/mois (KD 0-3 = easy win)
 *
 * Easy win : OUI MAJEUR (KD 0-3, leader quelleenergie #1+#2 contenus marketing).
 * Concurrence : quelleenergie, hellio, fabricants directs (RIKA, MCZ, Edilkamin).
 * Atout SA : guide INDÉPENDANT (8 marques + 6 critères + 3 budgets + erreurs à éviter).
 *
 * Cluster pillar : Rénovation Énergétique → Travaux → Chauffage → Poêle granulés → Marques
 *
 * Anti-cannibalisation :
 *   - /chauffage                              = hub chauffage 4 familles
 *   - /chauffage/poele-granules               = panorama poêle granulés (technos, prix, aides)
 *   - /chauffage/poele-granules/entretien     = service entretien annuel
 *   - /chauffage/poele-granules/sans-electricite = variante autonome
 *   - Cette page = COMPARATIF 8 MARQUES (RIKA, MCZ, Edilkamin, Stuv, Wodtke, Palazzetti,
 *     Hark, Termoflux) + 6 critères + 3 budgets entry/mid/premium + 4 erreurs à éviter.
 *
 * YMYL standard (investissement 4-14K€). Cite : Flamme Verte (label ADEME), Ecodesign UE
 * 2015/1185, NF EN 14785, Qualibois Module Air, France Rénov', ADEME guide chauffage bois.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Award,
  CheckCircle2,
  Coins,
  ShieldCheck,
  Star,
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

const PAGE_PATH = '/renovation-energetique/travaux/chauffage/poele-granules/marques'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Meilleur poêle à granulés 2026 : 8 marques comparées'
const DESCRIPTION =
  'Comparatif 8 marques de poêles à granulés 2026 (RIKA, MCZ, Edilkamin, Stuv, Wodtke, Palazzetti, Hark, Termoflux). 6 critères + 3 budgets (entry / mid / premium) + 4 erreurs à éviter.'

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
  '8 marques fiables 2026 : RIKA (Autriche), MCZ (Italie), Edilkamin (Italie), Stuv (Belgique), Wodtke (Allemagne), Palazzetti (Italie), Hark (Allemagne), Termoflux (Italie).',
  '6 critères de comparaison : rendement (η ≥ 87 % obligatoire MPR), autonomie réservoir, design, garantie, SAV France, prix posé.',
  '3 budgets : entry 3 000-4 500 € (Termoflux, Palazzetti basique), mid 4 500-7 000 € (MCZ, Edilkamin, Hark), premium 7 000-12 000 € (RIKA, Stuv, Wodtke).',
  'Top 3 fiabilité long terme (15-25 ans) : RIKA Domo, Stuv P-10, Wodtke ixbase. Pannes rares avant 10-12 ans.',
  'Top 3 design : Stuv P-10 (vision panoramique 270°), MCZ Vivo (galets pierre), Edilkamin Lia (ultra-compact).',
  "Label Flamme Verte 7 étoiles + Ecodesign 2022 UE OBLIGATOIRES pour MaPrimeRénov' (jusqu'à 2 500 €) + CEE Coup de pouce + TVA 5,5 %.",
  'Toujours 2-3 devis chez chauffagistes RGE Qualibois Module Air. SAV France = critère #1 long terme.',
]

const CRITERES_COMPARAISON = [
  {
    icone: '🔥',
    titre: 'Rendement (η_s saisonnier)',
    detail:
      "Minimum η ≥ 87 % pour MaPrimeRénov' + label Flamme Verte 7 étoiles + Ecodesign 2022. Les meilleures marques tournent à 89-93 % (RIKA Domo, Stuv P-10, Wodtke ixbase). Sous 87 % = exclusion aides 2026 + factures granulés +10-15 %.",
  },
  {
    icone: '⏱️',
    titre: 'Autonomie réservoir',
    detail:
      'Capacité 15-30 kg pour autonomie 24-48 h en charge moyenne. Modèles haut de gamme (RIKA Memo, Wodtke ixbase 30 kg) atteignent 60-80 h. Critique si vous travaillez à plein temps ou voyagez. Réservoir externe en option (silo intégré : +800-1 500 €).',
  },
  {
    icone: '🎨',
    titre: 'Design et intégration',
    detail:
      '8 esthétiques : compact carré, panoramique 270°, galets pierre, ultra-fin (< 25 cm profondeur), inox, contemporain, classique fonte. Stuv P-10 = référence design (vision panoramique 270°). MCZ Vivo = pierre naturelle. Edilkamin Lia = ultra-compact (50 × 50 × 95 cm).',
  },
  {
    icone: '🛡️',
    titre: 'Garantie constructeur',
    detail:
      "Standard : 5 ans pièces, 2 ans main d'œuvre. Premium : 10 ans pièces (Stuv, RIKA), garantie corps brûleur 15 ans (Wodtke). Vérifier les exclusions : entartrage (eau usage), suie (granulés moisis = exclusion). Étendre via assurance partenaire (+150-300 €/5 ans).",
  },
  {
    icone: '🔧',
    titre: 'SAV et pièces détachées France',
    detail:
      'Critère #1 long terme. Marques avec SAV France solide : RIKA (réseau Sud-Est), MCZ (Italie + revendeurs France), Stuv (Belgique + 50 dépôts France), Wodtke (Allemagne + Lyon/Strasbourg), Edilkamin (Lyon). Délais pièces 1-3 jours = standard. Hors-réseau = 7-15 jours.',
  },
  {
    icone: '💰',
    titre: 'Prix posé clé en main 2026',
    detail:
      'Entry 3 000-4 500 € (Termoflux, Palazzetti basique). Mid 4 500-7 000 € (MCZ, Edilkamin, Hark, Wodtke milieu). Premium 7 000-12 000 € (RIKA, Stuv, Wodtke ixbase, hydraulique haut de gamme). Le matériel = 50-65 %, la pose + conduit = 35-50 %.',
  },
]

const TOP_MARQUES = [
  {
    rang: 1,
    nom: 'RIKA',
    pays: 'Autriche',
    fonde: '1951',
    forces:
      'Fiabilité légendaire (pannes rares avant 12 ans), rendement 89-93 %, autonomie 60+ h sur Memo, design contemporain. Modèle phare : Domo (8 kW, 5 500-7 500 €).',
    faiblesses: 'SAV concentré Sud-Est (Lyon/Grenoble/PACA). Délais pièces hors-zone 5-10 jours.',
    gamme: 'Domo, Memo, Como, Vista, Loris',
    prixPoseTypique: '5 500-9 500 €',
    flammeVerte: '7 étoiles',
    garantie: '10 ans pièces',
  },
  {
    rang: 2,
    nom: 'MCZ',
    pays: 'Italie',
    fonde: '1975',
    forces:
      'Design italien (Vivo en pierre naturelle, Mood en céramique), large gamme, rendement 88-91 %, prix accessible. Réseau France via revendeurs Pyrénées et Sud.',
    faiblesses:
      'Garantie 5 ans seulement. Quelques retours capteurs après 8-10 ans (modèles entrée gamme).',
    gamme: 'Vivo, Mood, Suite, Star, Maestro',
    prixPoseTypique: '4 200-7 800 €',
    flammeVerte: '7 étoiles',
    garantie: '5 ans pièces',
  },
  {
    rang: 3,
    nom: 'Edilkamin',
    pays: 'Italie',
    fonde: '1963',
    forces:
      'Excellent rapport qualité/prix, gamme très large (90+ modèles), filiale française à Lyon, design varié (du classique au ultra-compact Lia 50 × 50 cm). Rendement 87-91 %.',
    faiblesses:
      'Performance sonore moyenne (ventilateur 35-42 dB sur entrée gamme). Quelques modèles compacts limités à 6 kW.',
    gamme: 'Lia, Cute, Ottavia, Lena, Davina',
    prixPoseTypique: '4 000-6 800 €',
    flammeVerte: '7 étoiles',
    garantie: '5 ans pièces',
  },
  {
    rang: 4,
    nom: 'Stuv',
    pays: 'Belgique',
    fonde: '1983',
    forces:
      'RÉFÉRENCE DESIGN. P-10 vision panoramique 270° (unique au monde). Construction massive (acier 5 mm), garantie 10 ans. Rendement 90-92 %. Réseau France 50+ dépôts.',
    faiblesses:
      'Prix premium (entrée gamme à 7 500 €). Peu de modèles compacts. SAV via dépôts régionaux Belgique.',
    gamme: 'P-10, P-30 hydro, Smart',
    prixPoseTypique: '7 500-12 500 €',
    flammeVerte: '7 étoiles',
    garantie: '10 ans pièces',
  },
  {
    rang: 5,
    nom: 'Wodtke',
    pays: 'Allemagne',
    fonde: '1977',
    forces:
      'Innovation technique allemande (ixbase = brûleur breveté longue durée 15 ans). Rendement 90-93 %, autonomie 80+ h. Design compact épuré. SAV Lyon + Strasbourg.',
    faiblesses: 'Catalogue moins diversifié (15 modèles). Prix intermédiaire-premium uniquement.',
    gamme: 'ixbase, ixwave, ixpower hydro, Sherry',
    prixPoseTypique: '6 500-10 500 €',
    flammeVerte: '7 étoiles',
    garantie: '15 ans corps brûleur',
  },
  {
    rang: 6,
    nom: 'Palazzetti',
    pays: 'Italie',
    fonde: '1954',
    forces:
      'Marque italienne historique, gamme variée (du classique au design contemporain), rendement 87-90 %, prix accessibles. Modèle phare : Ecofire (5-12 kW).',
    faiblesses:
      'SAV France via revendeurs uniquement (pas de filiale directe). Délais pièces 7-12 jours sur certains modèles.',
    gamme: 'Ecofire, Ginger, Linda, Ines',
    prixPoseTypique: '3 500-6 200 €',
    flammeVerte: '7 étoiles',
    garantie: '5 ans pièces',
  },
  {
    rang: 7,
    nom: 'Hark',
    pays: 'Allemagne',
    fonde: '1971',
    forces:
      'Solidité allemande, rendement 88-91 %, design classique-modernisme. Spécialisé poêles bûches + granulés. Réseau revendeurs France ouest et est.',
    faiblesses:
      'Catalogue concentré sur 12 modèles. Pas de modèles ultra-compact. Garantie standard 5 ans.',
    gamme: 'Avenso, Iruna, Florino',
    prixPoseTypique: '4 800-7 200 €',
    flammeVerte: '7 étoiles',
    garantie: '5 ans pièces',
  },
  {
    rang: 8,
    nom: 'Termoflux',
    pays: 'Italie',
    fonde: '1985',
    forces:
      'Marque budget la plus accessible (entry à 3 000 €). Rendement honorable 87-89 %. Convient parfaitement résidence secondaire ou complément chauffage.',
    faiblesses:
      'Durée de vie 12-15 ans (vs 20-25 pour premium). SAV via revendeurs avec délais 10-15 jours. Bruit ventilateur 38-44 dB.',
    gamme: 'Mia, Asia, Dora, Linda',
    prixPoseTypique: '3 000-4 800 €',
    flammeVerte: '7 étoiles',
    garantie: '5 ans pièces',
  },
]

const BUDGETS = [
  {
    titre: '💸 Entry 3 000-4 500 € — résidence secondaire / appoint',
    cas: 'Résidence secondaire, complément chauffage central, appartement 30-60 m². Usage 2-4 mois/an.',
    marques: 'Termoflux Mia/Asia, Palazzetti Ecofire 5 kW, MCZ Star',
    points:
      'Performance honorable (rendement 87-89 %), durée de vie 12-15 ans (acceptable pour usage secondaire), SAV via revendeurs (délais 7-15 jours).',
    eviter:
      'Marques inconnues ou non labellisées Flamme Verte 7 étoiles (perte aides MPR + CEE). Prix < 2 800 € posé = suspect (matériel cheap, pose bâclée).',
  },
  {
    titre: '🏠 Mid 4 500-7 000 € — résidence principale standard',
    cas: 'Maison principale 60-120 m², chauffage principal automatisé. Usage 5-7 mois/an.',
    marques: 'MCZ Vivo/Mood, Edilkamin Cute/Ottavia, Hark Avenso, Wodtke Sherry',
    points:
      'Sweet spot : rendement 88-91 %, durée de vie 18-22 ans, design contemporain, SAV France (Edilkamin/Wodtke), label Flamme Verte 7 étoiles + Ecodesign 2022 (toutes les aides éligibles).',
    eviter:
      'Modèles ultra-compacts à puissance insuffisante (< 6 kW pour > 80 m²). Vérifier dimensionnement par chauffagiste RGE Qualibois.',
  },
  {
    titre: '👑 Premium 7 000-12 000 € — long terme + design + hydraulique',
    cas: 'Maison principale 100-180 m², investissement long terme 25+ ans, design soigné. Hydraulique = chauffage central complet via radiateurs ou plancher chauffant.',
    marques: 'RIKA Domo/Memo, Stuv P-10/P-30, Wodtke ixbase, Edilkamin haut de gamme',
    points:
      'Fiabilité légendaire (pannes rares avant 12 ans), rendement 90-93 %, garanties 10-15 ans, design exceptionnel (Stuv P-10), SAV France solide. Hydraulique : raccordement chauffage central + ECS.',
    eviter:
      'Surdimensionner : poêle 15-20 kW pour 100 m² = cycles courts, surconsommation 10-15 %, usure rapide. Calcul puissance précis par pro.',
  },
]

const ERREURS_A_EVITER = [
  '❌ Choisir une marque sans label Flamme Verte 7 étoiles + Ecodesign 2022 (perte aides MPR + CEE).',
  "❌ Acheter en magasin grande distribution (pas d'installateur, pas de SAV, pas de mise en service formelle).",
  '❌ Surdimensionner la puissance (>= 30 % besoin réel) — cycles courts, surconso 10-15 %, usure rapide.',
  '❌ Confondre poêle simple (Module Air) et poêle hydraulique (Module Eau pour chauffage central).',
  '❌ Acheter sans visite technique préalable (mesure conduit, ventilation, distance évacuation).',
  '❌ Choisir installateur non RGE Qualibois (perte CEE + TVA 20 % au lieu de 5,5 %).',
  '❌ Démarrer le chantier avant dépôt CEE (pas de CEE rétroactif, perdu sec).',
  '❌ Négliger le conduit de fumée (tubage inox 316L obligatoire pour granulés humides condensation).',
  '❌ Ignorer la qualité du granulé (DIN+ ou ENplus A1 obligatoire — sinon usure brûleur 2-3× plus rapide).',
  '❌ Oublier la mise en service formelle (paramétrage régulation, contrôle CO/CO2, formation utilisateur).',
]

const faqs = [
  {
    question: 'Quelle est la meilleure marque de poêle à granulés en 2026 ?',
    answer:
      "Top 3 toutes catégories en 2026 : (1) <strong>RIKA</strong> (Autriche) — fiabilité légendaire, rendement 89-93 %, modèle phare Domo 5 500-7 500 € ; (2) <strong>Stuv</strong> (Belgique) — référence design avec vision panoramique 270° P-10, garantie 10 ans, 7 500-12 500 € ; (3) <strong>Wodtke</strong> (Allemagne) — innovation technique ixbase brûleur 15 ans, autonomie 80+ h, 6 500-10 500 €. Selon votre budget et besoin : MCZ ou Edilkamin pour le mid-range (4 500-7 000 €), Termoflux pour l'entry (3 000-4 500 €).",
  },
  {
    question: 'Quel poêle à granulés acheter pour 5 000 € ?',
    answer:
      "Avec un budget 5 000 € posé, vous accédez au mid-range qualitatif : <strong>MCZ Vivo/Mood</strong> (italien, design pierre/céramique, rendement 89 %), <strong>Edilkamin Cute/Ottavia</strong> (italien filiale Lyon, gamme large), <strong>Hark Avenso</strong> (allemand, solidité), ou <strong>Wodtke Sherry</strong> (allemand, entrée Wodtke). Toutes labellisées Flamme Verte 7 étoiles + Ecodesign 2022 — éligibles MaPrimeRénov' (1 500-2 500 € selon revenus) + CEE Coup de pouce (300-700 €) + TVA 5,5 %. Reste à charge net : 2 000-3 200 €.",
  },
  {
    question: 'Quelle marque dure le plus longtemps ?',
    answer:
      "Pour la durée de vie maximale (25+ ans), 3 marques sortent du lot : (1) <strong>RIKA Domo/Memo</strong> — fiabilité autrichienne légendaire, pannes rares avant 12 ans ; (2) <strong>Stuv P-10</strong> — construction acier 5 mm, garantie 10 ans pièces, durée 25-30 ans ; (3) <strong>Wodtke ixbase</strong> — brûleur breveté garanti 15 ans, durée du corps 25+ ans. Au-delà de la marque, la longévité dépend de : qualité du granulé (DIN+ ou ENplus A1), entretien annuel pro (180-280 €), ramonage 2× par an, qualité de l'installation initiale (RGE Qualibois).",
  },
  {
    question: 'Quels critères pour comparer les marques de poêles à granulés ?',
    answer:
      "6 critères clés : (1) <strong>Rendement</strong> η ≥ 87 % obligatoire (les meilleurs : 89-93 %) ; (2) <strong>Autonomie réservoir</strong> 24-48 h standard, jusqu'à 80 h sur premium (RIKA Memo, Wodtke ixbase) ; (3) <strong>Design</strong> intégration architecturale (Stuv P-10 = référence) ; (4) <strong>Garantie</strong> 5 ans standard, 10 ans premium ; (5) <strong>SAV France</strong> et délai pièces (1-3 j premium, 7-15 j entry) ; (6) <strong>Prix posé</strong> selon budget. Le SAV est le critère #1 long terme — privilégier les marques avec filiale ou réseau dépôts France.",
  },
  {
    question: 'Quelle puissance de poêle pour 100 m² ?',
    answer:
      'Calcul indicatif : 0,8-1,2 kW par 10 m² selon isolation. Pour 100 m² bien isolé (DPE C-D) : <strong>8 kW</strong>. Maison ancienne mal isolée (DPE E-F) : <strong>10-12 kW</strong>. Maison passive ou neuve RE2020 (DPE A-B) : <strong>6-8 kW</strong> suffisent. Toujours valider par étude thermique (calcul G x DJU + zone climatique) du chauffagiste RGE Qualibois. Erreur courante : surdimensionnement (15 kW pour 100 m²) → cycles courts, surconsommation 10-15 %, usure rapide. Modèles 8 kW disponibles : RIKA Domo, MCZ Vivo Air 8, Edilkamin Cute Up.',
  },
  {
    question: "Quelles marques sont éligibles MaPrimeRénov' 2026 ?",
    answer:
      "TOUTES les marques avec label <strong>Flamme Verte 7 étoiles</strong> ET conformes <strong>Ecodesign 2022 UE</strong> sont éligibles MaPrimeRénov'. Cela inclut : RIKA, MCZ, Edilkamin, Stuv, Wodtke, Palazzetti, Hark, Termoflux et 30+ autres marques labellisées. Vérifier le label sur le devis (obligatoire) et sur le carnet d'entretien. Forfait MPR Bleu (très modestes) = 2 500 €, MPR Jaune = 2 000 €, MPR Violet = 1 500 €, MPR Rose = exclu. Cumul possible CEE Coup de pouce (300-700 €) + TVA 5,5 %.",
  },
  {
    question: 'Quel artisan installer poêle à granulés ?',
    answer:
      'Plombier-chauffagiste qualifié <strong>RGE Qualibois Module Air</strong> (poêle simple, chauffage local seul) ou <strong>Module Eau</strong> (poêle hydraulique raccordé au chauffage central). Vérifier : SIRET valide, attestation décennale, formation Qualibois <strong>< 4 ans</strong> (obligation renouvellement), 3 références chantiers récents poêle granulés. Devis détaillé : marque, modèle, label Flamme Verte 7+, puissance kW, rendement η_s, conduit fumée (tubage neuf inox 316L ou existant), mise en service avec contrôle combustion. Notre annuaire référence des chauffagistes vérifiés.',
  },
  {
    question: 'Faut-il un conduit de fumée neuf pour un poêle à granulés ?',
    answer:
      'Pas systématiquement, mais OBLIGATOIREMENT en <strong>tubage inox 316L</strong> conforme NF DTU 24.1. Si votre conduit existant (cheminée maçonnée) est compatible (diamètre 80-150 mm selon puissance, étanchéité OK, hauteur 4 m mini), il peut être tubé pour 50-150 €/ml posé. Si pas de conduit ou conduit incompatible : sortie ventouse étanche par mur ou toiture (1 500-3 000 € posé). Le tubage évite les condensations acides du granulé (l\'acidité corrode l\'acier classique). Voir notre page <a href="/renovation-energetique/travaux/chauffage/tubage-cheminee">tubage cheminée</a>.',
  },
]

const sources = [
  {
    label: 'Flamme Verte — Label ADEME (rendement, émissions)',
    url: 'https://www.flammeverte.org',
  },
  {
    label: 'Règlement UE Ecodesign 2015/1185 (chauffage local biomasse)',
    url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32015R1185',
  },
  {
    label: 'NF EN 14785 — Norme appareils chauffage domestique granulés',
    url: 'https://www.boutique.afnor.org',
  },
  {
    label: "Qualit'EnR — Annuaire RGE Qualibois",
    url: 'https://www.qualit-enr.org/qualibois',
  },
  {
    label: "France Rénov' — Poêle à granulés",
    url: 'https://france-renov.gouv.fr/renovation/chauffage/poele-bois-granules',
  },
  {
    label: 'ADEME — Guide chauffage bois domestique',
    url: 'https://librairie.ademe.fr/urbanisme-et-batiment/2096-se-chauffer-mieux-et-moins-cher.html',
  },
  {
    label: "MaPrimeRénov' — Forfait poêle granulés 2026",
    url: 'https://france-renov.gouv.fr/aides/maprimerenov',
  },
  {
    label: 'NF EN ISO 17225-2 — Granulés bois ENplus A1',
    url: 'https://www.enplus-pellets.eu',
  },
]

const relatedPages = [
  {
    label: 'Hub Poêle granulés 2026 (technos, prix, aides)',
    href: '/renovation-energetique/travaux/chauffage/poele-granules',
    description: 'Panorama étanche/canalisable/hydraulique + Flamme Verte',
  },
  {
    label: 'Entretien poêle à granulés (4 niveaux)',
    href: '/renovation-energetique/travaux/chauffage/poele-granules/entretien',
    description: '180-280 €/an + ramonage 2×/an + 12 points contrôlés',
  },
  {
    label: 'Poêle granulés sans électricité',
    href: '/renovation-energetique/travaux/chauffage/poele-granules/sans-electricite',
    description: 'Variante autonome 4-8 kW pour résilience coupures',
  },
  {
    label: 'Tubage cheminée (poêle, chaudière)',
    href: '/renovation-energetique/travaux/chauffage/tubage-cheminee',
    description: '50-150 €/ml inox 316L, NF DTU 24.1',
  },
  {
    label: 'Hub Chauffage 2026',
    href: '/renovation-energetique/travaux/chauffage',
    description: '4 familles + comparatif prix',
  },
  {
    label: 'Label RGE Qualibois',
    href: '/rge/labels/qualibois',
    description: 'Module Air (poêle) + Module Eau (hydraulique)',
  },
  {
    label: 'Hub aides rénovation 2026',
    href: '/renovation-energetique/aides',
    description: 'MPR + CEE + éco-PTZ cumulables',
  },
  {
    label: 'Trouver un chauffagiste Qualibois',
    href: '/services/chauffagiste',
    description: 'Annuaire RGE + Qualibois Module Air vérifié',
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
    section: 'Chauffage — Comparatif marques poêle granulés',
    keywords: [
      'meilleur poele a granule',
      'meilleure marque poele a granule',
      'poele a granules avis',
      'comparatif poele a granules',
      'marque poele a granules',
      'top poele a granules',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Chauffage', url: '/renovation-energetique/travaux/chauffage' },
    {
      name: 'Poêle à granulés',
      url: '/renovation-energetique/travaux/chauffage/poele-granules',
    },
    { name: 'Marques', url: PAGE_PATH },
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
              { label: 'Chauffage', href: '/renovation-energetique/travaux/chauffage' },
              {
                label: 'Poêle à granulés',
                href: '/renovation-energetique/travaux/chauffage/poele-granules',
              },
              { label: 'Marques' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Award className="w-3.5 h-3.5" aria-hidden />
              Comparatif indépendant 2026 — 8 marques + 6 critères
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Meilleur poêle à granulés 2026 : 8 marques comparées
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Quelle est la <strong>meilleure marque de poêle à granulés</strong> en 2026 ?
              Comparatif indépendant des <strong>8 marques fiables</strong> du marché : RIKA
              (Autriche), MCZ (Italie), Edilkamin (Italie), Stuv (Belgique), Wodtke (Allemagne),
              Palazzetti (Italie), Hark (Allemagne), Termoflux (Italie). Notation sur 6 critères
              (rendement, autonomie, design, garantie, SAV France, prix posé) + 3 budgets ciblés
              (entry 3-4,5K €, mid 4,5-7K €, premium 7-12K €) + 4 erreurs à éviter. Toutes
              labellisées Flamme Verte 7 étoiles + Ecodesign 2022 (éligibles MaPrimeRénov&apos;
              jusqu&apos;à 2 500 €).
            </p>
            <LastUpdated date={MODIFIED} />
          </header>

          <TldrBlock bullets={tldr} />

          <section aria-labelledby="criteres" className="my-10">
            <h2
              id="criteres"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <Star className="w-5 h-5 text-primary-700" aria-hidden />6 critères pour comparer les
              marques
            </h2>
            <p className="text-sand-700 mb-5">
              Avant de comparer les marques, identifier les 6 critères techniques et commerciaux qui
              font vraiment la différence sur 15-25 ans d&apos;usage :
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {CRITERES_COMPARAISON.map((c) => (
                <article key={c.titre} className="bg-white border border-sand-200 rounded-lg p-5">
                  <h3 className="font-heading text-base font-semibold text-sand-900 mb-2">
                    <span className="mr-2" aria-hidden>
                      {c.icone}
                    </span>
                    {c.titre}
                  </h3>
                  <p className="text-sm text-sand-700 m-0">{c.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="top-marques" className="my-10">
            <h2
              id="top-marques"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <Award className="w-5 h-5 text-primary-700" aria-hidden />
              Top 8 marques 2026 (classement détaillé)
            </h2>
            <p className="text-sand-700 mb-5">
              8 marques fiables se partagent le marché français du poêle à granulés. Classement
              indépendant basé sur fiabilité long terme + rendement + SAV France + design. Toutes
              labellisées Flamme Verte 7 étoiles + Ecodesign 2022 (éligibles MPR + CEE) :
            </p>
            <div className="space-y-4">
              {TOP_MARQUES.map((m) => (
                <article key={m.nom} className="bg-white border border-sand-200 rounded-lg p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 text-orange-800 font-bold flex items-center justify-center">
                      #{m.rang}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading text-lg font-semibold text-sand-900 m-0 mb-0">
                        {m.nom}
                      </h3>
                      <p className="text-xs text-sand-500 m-0">
                        {m.pays} · Fondée {m.fonde}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-sand-700 m-0 mb-2">
                    <strong>Forces :</strong> {m.forces}
                  </p>
                  <p className="text-sm text-sand-700 m-0 mb-2">
                    <strong>Faiblesses :</strong> {m.faiblesses}
                  </p>
                  <p className="text-xs text-sand-500 m-0 mb-2">
                    <strong>Gamme :</strong> {m.gamme}
                  </p>
                  <div className="grid sm:grid-cols-3 gap-2 text-xs">
                    <div className="bg-sand-50 rounded p-2">
                      <p className="text-sand-600 m-0">Prix posé</p>
                      <p className="font-semibold text-sand-900 m-0">{m.prixPoseTypique}</p>
                    </div>
                    <div className="bg-sand-50 rounded p-2">
                      <p className="text-sand-600 m-0">Flamme Verte</p>
                      <p className="font-semibold text-sand-900 m-0">{m.flammeVerte}</p>
                    </div>
                    <div className="bg-emerald-50 rounded p-2">
                      <p className="text-emerald-700 m-0">Garantie</p>
                      <p className="font-bold text-emerald-900 m-0">{m.garantie}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="budgets" className="my-10">
            <h2
              id="budgets"
              className="font-heading text-2xl font-bold text-sand-900 mb-3 flex items-center gap-2"
            >
              <Coins className="w-5 h-5 text-primary-700" aria-hidden />3 marques par budget (entry,
              mid, premium)
            </h2>
            <p className="text-sand-700 mb-5">
              Choix optimal selon votre budget et usage. Les 3 segments couvrent tous les besoins
              résidentiels (résidence secondaire à maison principale long terme) :
            </p>
            <div className="space-y-4">
              {BUDGETS.map((b) => (
                <article key={b.titre} className="bg-white border border-sand-200 rounded-lg p-5">
                  <h3 className="font-heading text-base font-semibold text-sand-900 mb-2">
                    {b.titre}
                  </h3>
                  <p className="text-sm text-sand-700 m-0 mb-2">
                    <strong>Cas d&apos;usage :</strong> {b.cas}
                  </p>
                  <p className="text-sm text-sand-700 m-0 mb-2">
                    <strong>Marques recommandées :</strong> {b.marques}
                  </p>
                  <p className="text-sm text-sand-700 m-0 mb-2">
                    <strong>Points forts :</strong> {b.points}
                  </p>
                  <p className="text-sm text-sand-700 m-0">
                    <strong>À éviter :</strong> {b.eviter}
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
                  <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" aria-hidden />
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
              <ShieldCheck className="w-5 h-5 text-primary-700" aria-hidden />
              Choisir un chauffagiste RGE Qualibois
            </h2>
            <p className="text-sand-700 mb-3">
              L&apos;installation d&apos;un poêle à granulés exige un plombier-chauffagiste qualifié{' '}
              <strong>RGE Qualibois Module Air</strong> (poêle simple) ou{' '}
              <strong>Module Eau</strong> (poêle hydraulique raccordé au chauffage central). Sans
              label = perte des aides MPR + CEE + TVA 5,5 % :
            </p>
            <ul className="space-y-2 mb-3 list-disc pl-6 text-sand-700 text-sm">
              <li>SIRET valide + assurance décennale en cours.</li>
              <li>
                Formation Qualibois &lt; 4 ans (obligation renouvellement quadriennal
                Qualit&apos;EnR).
              </li>
              <li>3 références chantiers récents poêle granulés (idéal &lt; 12 mois).</li>
              <li>Devis détaillé : marque, modèle, label Flamme Verte 7+, η_s, conduit fumée.</li>
              <li>Mise en service avec contrôle de combustion (CO, CO2, T° fumées).</li>
              <li>Comparer 2-3 devis avant signature (10-20 % d&apos;écart fréquent).</li>
            </ul>
            <Link
              href="/services/chauffagiste"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Trouver un chauffagiste Qualibois vérifié
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </section>

          <FlagshipFaq title="Meilleur poêle à granulés : foire aux questions" items={faqs} />

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
              href="/renovation-energetique/travaux/chauffage/poele-granules"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Poêle granulés
            </Link>
            <Link
              href="/services/chauffagiste"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Chauffagistes Qualibois <Coins className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
