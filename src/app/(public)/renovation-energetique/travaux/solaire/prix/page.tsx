/**
 * Page : /renovation-energetique/travaux/solaire/prix
 *
 * @kw-primary    panneau solaire prix
 * @kw-volume     6300
 * @kw-kd         25
 * @kw-cpc        TBD
 * @intent        commercial
 * @cluster       solaire
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — cluster solaire_pv)
 * @backlog-item  Sprint-pseo-solaire-prix-2026-05-22
 * @author        jean-pierre-duval
 *
 * KW cibles (validés Ahrefs gap CSV 2026-05-04, country=fr) :
 * - "panneau solaire prix"             6300 vol, KD 25 ⭐ PIVOT (rang absent)
 * - "panneau photovoltaique"          21000 vol, KD 27 (head connexe hub)
 * - "panneau solaire"                 87000 vol, KD 43 (mega head connexe)
 * - "panneau solaire thermique"        3200 vol, KD 4  (sous-cluster ST)
 * - "panneau solaire 1000w"            2100 vol, KD 1
 * - "panneau solaire avec batterie"    3400 vol, KD 13
 * - "batterie pour panneau solaire"    3900 vol, KD 8
 * - Famille cumulée commerciale prix : ~22 000 vol/mois
 *
 * Easy win : PARTIEL (pivot KD 25, mais variants KD 1-13 + vol pivot massif 6.3K).
 * Atout SA : focus PRIX par puissance (3-9 kWc) + ROI + autoconso vs revente surplus,
 * distinct du hub /solaire qui couvre rendement/dimension/marques.
 *
 * Anti-cannibalisation :
 *   - /renovation-energetique/travaux/solaire             = hub PRODUIT
 *   - /renovation-energetique/travaux/solaire/autoconsommation = sous-page autoconso
 *   - /renovation-energetique/travaux/solaire/dimension        = sous-page dimensionnement
 *   - /guides/panneau-solaire-prix-rentabilite                 = guide rang abs en gap
 *   - Cette page                                              = sous-page PRIX (par kWc, ROI)
 *
 * YMYL high : investissement 6 000-25 000 €, prime autoconso CRE, MPR solaire thermique,
 * éco-PTZ, TVA 10 % installation. Cite : CRE, EDF OA, France Rénov’, ADEME, ANAH,
 * Légifrance, Service-Public.fr, AFNOR EN IEC 61215.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Coins,
  Sun,
  ShieldCheck,
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
import {
  getBreadcrumbSchema,
  getFAQSchema,
  getFinancialProductSchema,
  getGovernmentServiceSchema,
  getServiceSchema,
} from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import SimulateurAideBox from '@/components/conversion/SimulateurAideBox'
import PrixComparatif, { type PrixComparatifRow } from '@/components/conversion/PrixComparatif'
import FinalCtaSection from '@/components/conversion/FinalCtaSection'

/**
 * Comparatif modules photovoltaïques — données factuelles fiches produits constructeurs.
 * Sources : fiches techniques officielles + AFNOR EN IEC 61215 / 61730 + ADEME 2026.
 * Prix indicatifs module 400-450 Wc seul (hors onduleur, pose, structure).
 */
const PANNEAUX_ROWS: PrixComparatifRow[] = [
  {
    brand: 'DualSun (FR)',
    model: 'Flash Half-Cut 425',
    priceRange: '230 - 290 €/module',
    cop: 'Rendement 21,4 %',
    warranty: '25 ans (produit) · 30 ans (perf)',
    notes: 'Fabricant FR (Marseille). Origine France garantie.',
    highlight: true,
  },
  {
    brand: 'Voltec Solar (FR)',
    model: 'Tarka 425 BB',
    priceRange: '220 - 280 €/module',
    cop: 'Rendement 21,2 %',
    warranty: '25 ans (produit) · 30 ans (perf)',
    notes: 'Fabricant FR (Alsace). Modules glass-glass.',
  },
  {
    brand: 'REC (NO/SG)',
    model: 'Alpha Pure-R 430',
    priceRange: '230 - 300 €/module',
    cop: 'Rendement 22,3 %',
    warranty: '20 ans (produit) · 25 ans (perf)',
    notes: 'Module HJT haut rendement. Garantie linéaire.',
  },
  {
    brand: 'Trina Solar (CN)',
    model: 'Vertex S+ NEG9R 440',
    priceRange: '170 - 230 €/module',
    cop: 'Rendement 22,3 %',
    warranty: '15 ans (produit) · 30 ans (perf)',
    notes: 'Volume mondial #1. Bon rapport puissance-prix.',
  },
  {
    brand: 'JA Solar (CN)',
    model: 'JAM54D40 425',
    priceRange: '160 - 220 €/module',
    cop: 'Rendement 21,8 %',
    warranty: '12 ans (produit) · 30 ans (perf)',
    notes: 'Volume mondial top 3. Entrée de gamme fiable.',
  },
  {
    brand: 'SunPower (US)',
    model: 'Maxeon 6 AC 435',
    priceRange: '320 - 420 €/module',
    cop: 'Rendement 22,8 %',
    warranty: '40 ans (produit + perf)',
    notes: 'Référence premium. Cellules IBC sans busbars.',
  },
]

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/solaire/prix'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-22'
const MODIFIED = '2026-05-22'
const AUTHOR_SLUG = 'jean-pierre-duval'
const AUTHOR_NAME = 'Jean-Pierre Duval'

const TITLE = 'Panneau solaire prix 2026 : 3-9 kWc, ROI, aides'
const DESCRIPTION =
  'Panneau solaire prix 2026 : 3 kWc 7 000-10 000 €, 6 kWc 12 000-17 000 €, 9 kWc 17 000-25 000 € posé. Prime autoconso CRE, revente EDF OA, TVA 10 %.'

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
  'Prix moyen 2026 d’une installation photovoltaïque posée : 7 000-25 000 € selon puissance (3 à 9 kWc).',
  '3 kWc (~ 15 m²) : 7 000-10 000 € posé, foyer 2-3 personnes, ROI 9-12 ans.',
  '6 kWc (~ 30 m²) : 12 000-17 000 € posé, foyer 4-5 personnes, ROI 8-11 ans.',
  '9 kWc (~ 45 m²) : 17 000-25 000 € posé, foyer 6+ ou véhicule électrique, ROI 8-10 ans.',
  'Prime autoconso CRE 2026 : 120 €/kWc (≤ 3 kWc), 180 €/kWc (3-9 kWc), versement 5 ans.',
  'Revente surplus EDF OA : ~ 0,127 €/kWh (3-9 kWc) sur contrat 20 ans (S1 2026).',
  'TVA 10 % automatique avec installateur RGE QualiPV. MPR solaire thermique (eau chaude) jusqu’à 4 000 €.',
]

const PRIX_PUISSANCE = [
  {
    puissance: '3 kWc (~ 15 m²)',
    materiel: '5 000 - 7 000 €',
    pose: '2 000 - 3 000 €',
    total: '7 000 - 10 000 €',
    note: 'Foyer 2-3 personnes, conso 4-6 MWh/an. Sans batterie. ROI 9-12 ans.',
  },
  {
    puissance: '6 kWc (~ 30 m²)',
    materiel: '9 000 - 12 500 €',
    pose: '3 000 - 4 500 €',
    total: '12 000 - 17 000 €',
    note: 'Foyer 4-5 personnes, conso 7-10 MWh/an. ROI 8-11 ans.',
  },
  {
    puissance: '9 kWc (~ 45 m²)',
    materiel: '12 500 - 18 000 €',
    pose: '4 500 - 7 000 €',
    total: '17 000 - 25 000 €',
    note: 'Foyer 6+ ou véhicule électrique. Plafond prime autoconso. ROI 8-10 ans.',
  },
  {
    puissance: '+ Batterie lithium 5 kWh',
    materiel: '3 500 - 6 000 €',
    pose: '500 - 1 000 €',
    total: '+ 4 000 - 7 000 €',
    note: 'Augmente autoconso 30 % → 60-75 %. ROI batterie seule 10-14 ans (sans aide).',
  },
  {
    puissance: 'Solaire thermique (eau chaude)',
    materiel: '3 000 - 5 500 €',
    pose: '2 000 - 3 500 €',
    total: '5 000 - 9 000 €',
    note: '4-8 m² capteurs + ballon 200-300 L. ECS gratuite 60-70 %. MPR jusqu’à 4 000 €.',
  },
]

const AIDES_TABLE = [
  {
    aide: 'Prime autoconso CRE — ≤ 3 kWc',
    montant: '120 €/kWc × 3 = 360 €',
    condition: 'Autoconso avec revente surplus EDF OA. Versement 5 ans (1/5 par an).',
  },
  {
    aide: 'Prime autoconso CRE — 3 à 9 kWc',
    montant: '180 €/kWc × 6 (par ex.) = 1 080 €',
    condition: 'Plafond 9 kWc. Versement 5 ans. RGE QualiPV obligatoire.',
  },
  {
    aide: 'Revente surplus EDF OA',
    montant: '~ 0,127 €/kWh (3-9 kWc) S1 2026',
    condition: 'Contrat 20 ans EDF Obligation d’Achat. Réévaluation trimestrielle.',
  },
  {
    aide: 'TVA réduite 10 %',
    montant: '~ 10 % d’économie',
    condition: 'Installation par RGE QualiPV / Qualisol. Logement > 2 ans.',
  },
  {
    aide: 'MaPrimeRénov’ — Solaire thermique CESI',
    montant: 'Bleu 4 000 € • Jaune 3 000 € • Violet 2 000 €',
    condition: 'Chauffe-eau solaire individuel uniquement. RGE Qualisol obligatoire.',
  },
  {
    aide: 'MaPrimeRénov’ — Solaire combiné SSC',
    montant: 'Bleu 10 000 € • Jaune 8 000 € • Violet 4 000 €',
    condition: 'Système solaire combiné chauffage + ECS. RGE Qualisol Combi.',
  },
  {
    aide: 'Éco-PTZ',
    montant: 'jusqu’à 30 000 €',
    condition: 'Sans intérêts, remboursement 15-20 ans. Bouquet possible 50 000 €.',
  },
]

const ROI_EXEMPLES = [
  {
    profil: '3 kWc autoconso + surplus, maison 100 m²',
    prod: '~ 3 600 kWh/an',
    eco: '~ 700 €/an',
    rac: '~ 6 600 €',
    roi: '9-10 ans',
  },
  {
    profil: '6 kWc autoconso + surplus, famille 4',
    prod: '~ 7 200 kWh/an',
    eco: '~ 1 200 €/an',
    rac: '~ 11 000 €',
    roi: '9 ans',
  },
  {
    profil: '9 kWc + VE + batterie 5 kWh',
    prod: '~ 10 800 kWh/an',
    eco: '~ 2 000 €/an',
    rac: '~ 19 000 €',
    roi: '9-10 ans',
  },
  {
    profil: 'CESI solaire thermique 4 m², famille 4',
    prod: '~ 2 000 kWh/an ECS',
    eco: '~ 400 €/an',
    rac: '~ 3 000 € (après MPR Bleu)',
    roi: '7-8 ans',
  },
]

const FACTEURS_PRIX = [
  {
    label: 'Puissance crête (kWc)',
    impact: '+ 1 800-2 500 €/kWc',
    detail:
      '3 kWc ≈ 7 000-10 000 €, 6 kWc ≈ 12 000-17 000 €, 9 kWc ≈ 17 000-25 000 €. Coût/kWc baisse légèrement avec la puissance (effet de série).',
  },
  {
    label: 'Type panneau (monocristallin vs bifacial)',
    impact: '+ 10-25 %',
    detail:
      'Monocristallin standard 400-450 Wc = baseline. Mono haut rendement TOPCon/HJT 450-500 Wc = +10-15 %. Bifacial (faces avant + arrière) = +15-25 % mais +5-10 % production sur toit clair.',
  },
  {
    label: 'Onduleur (string vs micro-onduleurs)',
    impact: '+ 800-2 500 €',
    detail:
      'Onduleur central string (1 par installation) = standard. Micro-onduleurs (1 par panneau Enphase / APsystems) = +1 500-2 500 € mais production +5-10 % en cas d’ombre + monitoring panneau par panneau + garantie 25 ans.',
  },
  {
    label: 'Type pose (intégration vs surimposition)',
    impact: '+ 500-2 000 €',
    detail:
      'Surimposition (sur tuiles, le standard depuis 2020) = baseline. Intégration au bâti (remplace les tuiles) = +1 000-2 000 € + risques étanchéité historiques (à éviter sauf neuf).',
  },
  {
    label: 'Accès toiture + complexité',
    impact: '+ 500-1 500 €',
    detail:
      'Toit > 35° + hauteur > 8 m = échafaudage payant + harnais. Toit zinc/ardoise = fixations spécifiques. Toit complexe (lucarnes, cheminées) = pertes m² + pose ralentie.',
  },
  {
    label: 'Batterie lithium',
    impact: '+ 4 000-12 000 €',
    detail:
      '5 kWh ~ 4 000-7 000 € (Pylontech, BYD, Huawei). 10 kWh ~ 7 000-10 000 €. 15 kWh ~ 10 000-12 000 €. ROI batterie seule 10-14 ans (sans aide spécifique en 2026, hors île non-interconnectée).',
  },
]

const PIEGES_DEVIS = [
  {
    title: '« Panneau solaire à 1 € » / installation gratuite',
    impact: 'Fraude DGCCRF',
    desc: 'Aucune installation photovoltaïque ne peut être « gratuite » en 2026. Toute offre cache un crédit déguisé, un reste à charge post-installation, ou une fraude aux aides. Sources : DGCCRF avis 2025, CRE.',
  },
  {
    title: 'Vente sur estimation de production fantaisiste',
    impact: 'Sur-estimation 30-50 %',
    desc: 'Le démarcheur promet 5 000 kWh/an pour 3 kWc en Bretagne. La réalité : 3 200-3 600 kWh/an. Exiger une étude PVGIS / Mines ParisTech ou logiciel SolarEdge / Enphase avec inclinaison, orientation, masques d’ombre.',
  },
  {
    title: 'TVA 20 % au lieu de 10 %',
    impact: '+ 9 % sur le total',
    desc: 'Sans installateur RGE QualiPV / Qualisol, la TVA passe à 20 %. Sur un devis 15 000 €, l’écart est de ~ 1 350 €. Vérifier mention RGE valide à la date du devis sur france-renov.gouv.fr.',
  },
  {
    title: 'Garanties produit vs garantie de production',
    impact: 'Risque long terme',
    desc: 'Garantie produit panneau 12 ans minimum (souvent 25 ans haut de gamme). Garantie de production linéaire 25 ans (≥ 80 % à 25 ans). Sans garantie performance, perte 0,5-0,8 %/an non contractuelle.',
  },
  {
    title: 'Démarches CRE / EDF OA externalisées (payantes)',
    impact: '+ 400-800 €',
    desc: 'Démarches CRE (prime autoconso) et EDF OA (contrat 20 ans revente surplus) sont gratuites mais l’installateur peut facturer un « pack démarches » 400-800 €. À négocier en option vs incluse selon devis.',
  },
  {
    title: 'Démarchage téléphonique interdit',
    impact: 'Loi 2020',
    desc: 'Le démarchage téléphonique pour la rénovation énergétique (dont solaire) est interdit depuis la loi du 24 juillet 2020. Toute offre suite à un appel froid = potentiellement frauduleuse. Signaler sur SignalConso DGCCRF.',
  },
]

const faqs = [
  {
    question: 'Combien coûte précisément une installation photovoltaïque en 2026 ?',
    answer:
      'Entre <strong>7 000 et 25 000 € TTC posé</strong> selon puissance : <strong>3 kWc (~ 15 m²)</strong> = 7 000-10 000 €, <strong>6 kWc (~ 30 m²)</strong> = 12 000-17 000 €, <strong>9 kWc (~ 45 m²)</strong> = 17 000-25 000 €. Le matériel représente ~ 65-75 % du devis (panneaux + onduleur + fixations + câblage + protection DC/AC), la pose 25-35 %. Variations +10-20 % en Île-de-France et métropoles. Ajout batterie lithium : +4 000-12 000 € selon capacité (5-15 kWh).',
  },
  {
    question: 'Quelles aides 2026 pour le solaire ?',
    answer:
      'Pour le <strong>photovoltaïque</strong> : (1) Prime autoconso CRE 120 €/kWc (≤ 3 kWc) ou 180 €/kWc (3-9 kWc), versée 5 ans après mise en service, (2) Revente surplus EDF OA ~ 0,127 €/kWh (S1 2026) sur 20 ans, (3) TVA 10 % avec installateur RGE QualiPV. Pour le <strong>solaire thermique</strong> (CESI) : MaPrimeRénov’ Bleu 4 000 € / Jaune 3 000 € / Violet 2 000 €. Pour le <strong>solaire combiné SSC</strong> (chauffage + ECS) : MPR Bleu 10 000 € / Jaune 8 000 € / Violet 4 000 €. Cumul possible éco-PTZ.',
  },
  {
    question: 'Quel est le ROI d’une installation photovoltaïque 2026 ?',
    answer:
      'Entre <strong>8 et 12 ans</strong> selon profil et région. Exemples typiques : <strong>3 kWc autoconso + surplus, maison Ouest France</strong> = production ~ 3 600 kWh/an, économie ~ 700 €/an, RAC ~ 6 600 € après prime autoconso → ROI ~ 9-10 ans. <strong>6 kWc famille 4 personnes</strong> = production ~ 7 200 kWh/an, économie ~ 1 200 €/an, RAC ~ 11 000 € → ROI ~ 9 ans. Sur 25 ans (durée de vie), gain net 15 000-30 000 € selon installation. ROI s’améliore avec hausse continue du tarif kWh (+5-10 %/an depuis 2022).',
  },
  {
    question: 'Faut-il une batterie ?',
    answer:
      'Pas forcément. Sans batterie : autoconso instantanée 25-35 % + revente surplus EDF OA = ROI 8-12 ans. Avec batterie 5 kWh : autoconso 50-65 % = +200-400 €/an d’économies supplémentaires mais surcoût 4 000-7 000 € → ROI batterie seule 10-14 ans (sans aide spécifique en 2026 sauf îles non interconnectées). Privilégier la batterie si : véhicule électrique en charge nuit, conso forte du soir (cuisine + chauffage électrique), ou anticipation coupures réseau.',
  },
  {
    question: 'Quelle puissance choisir : 3, 6 ou 9 kWc ?',
    answer:
      'Selon conso annuelle et toiture : <strong>3 kWc (~ 15 m²)</strong> pour foyer 2-3 personnes consommant 4-6 MWh/an. <strong>6 kWc (~ 30 m²)</strong> pour famille 4-5 personnes (7-10 MWh/an), chauffage électrique inclus. <strong>9 kWc (~ 45 m²)</strong> pour foyer 6+ ou véhicule électrique (10-12 MWh/an). Au-delà de 9 kWc : prime autoconso plafonnée, tarif revente surplus inférieur, raccordement renforcé. Règle : ne pas surdimensionner > 1,2 × conso annuelle.',
  },
  {
    question: 'Quel artisan choisir et comment vérifier sa qualification ?',
    answer:
      'Installateur qualifié <strong>RGE QualiPV</strong> (photovoltaïque) ou <strong>QualiSol</strong> (solaire thermique) ou <strong>Qualisol Combi</strong> (systèmes combinés). Vérification obligatoire : (1) numéro Qualit\'ENR valide à la date du devis sur <a href="https://france-renov.gouv.fr" target="_blank" rel="noopener noreferrer">france-renov.gouv.fr</a>, (2) SIRET actif sur societe.com, (3) attestation décennale assurance, (4) 5-10 références chantiers similaires. Sans RGE : aides CRE / MPR rejetées + TVA 20 % au lieu de 10 % = surcoût ~ 1 500 € sur un devis 15 000 €.',
  },
  {
    question: 'La « panneau solaire à 1 € » existe-t-elle ?',
    answer:
      'Non. Aucune installation photovoltaïque ne peut être « gratuite » ou « à 1 € » en 2026. Toute offre cache soit un crédit déguisé (mensualités cachées dépassant l’économie d’énergie), soit un reste à charge en post-installation, soit une fraude aux aides CRE / EDF OA. La DGCCRF publie chaque année une liste noire des éco-démarcheurs frauduleux. Privilégier 3 devis comparés d’artisans RGE QualiPV. Signaler tout démarchage abusif sur SignalConso.gouv.fr.',
  },
  {
    question: 'Combien de temps dure l’installation ?',
    answer:
      'Installation type 6 kWc maison standard : <strong>1-3 jours</strong> de chantier (pose panneaux + onduleur + câblage). Plus : <strong>2-4 mois</strong> de démarches administratives (déclaration préalable mairie, raccordement Enedis, contrat EDF OA, prime CRE). Durée totale projet : 3-6 mois de la signature à la mise en service. Versement prime autoconso : étalé sur 5 ans à compter de la mise en service. Revente surplus : début dès raccordement consuel.',
  },
]

const sources = [
  {
    label: 'CRE — Commission de régulation de l’énergie (tarifs achat solaire)',
    url: 'https://www.cre.fr',
  },
  {
    label: 'France Rénov’ — Énergie solaire',
    url: 'https://france-renov.gouv.fr/renovation/energies-renouvelables/solaire',
  },
  {
    label: 'ADEME — Guide photovoltaïque',
    url: 'https://agir.ademe.fr',
  },
  {
    label: 'ANAH — MaPrimeRénov’ Solaire thermique',
    url: 'https://www.anah.gouv.fr',
  },
  {
    label: 'EDF OA — Obligation d’Achat solaire',
    url: 'https://www.edf-oa.fr',
  },
  {
    label: 'Qualit’ENR — Annuaire QualiPV / QualiSol',
    url: 'https://www.qualit-enr.org',
  },
  {
    label: 'Service-Public.fr — Aides énergies renouvelables',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F35054',
  },
  {
    label: 'Légifrance — Arrêté tarifs S2024 et arrêté Soleil 2021',
    url: 'https://www.legifrance.gouv.fr',
  },
]

const relatedPages = [
  {
    label: 'Solaire — hub 2026',
    href: '/renovation-energetique/travaux/solaire',
    description: 'Photovoltaïque + thermique + hybride',
  },
  {
    label: 'Installation panneau solaire — guide pose',
    href: '/renovation-energetique/travaux/solaire/installation',
    description: 'Étapes, démarches CRE, Enedis',
  },
  {
    label: 'Autoconsommation solaire 2026',
    href: '/renovation-energetique/travaux/solaire/autoconsommation',
    description: 'Maximiser l’autoconso, batterie',
  },
  {
    label: 'Dimensionner son installation (kWc)',
    href: '/renovation-energetique/travaux/solaire/dimension',
    description: '3, 6 ou 9 kWc selon conso',
  },
  {
    label: 'Aides panneau solaire 2026',
    href: '/renovation-energetique/aides/panneau-solaire-2026',
    description: 'Prime autoconso + EDF OA',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'Estimer mes aides solaire',
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
    section: 'Travaux — Solaire — Prix',
    keywords: [
      'panneau solaire prix',
      'prix panneau solaire',
      'panneau photovoltaïque prix',
      'installation solaire prix',
      'panneau solaire 3 kwc prix',
      'panneau solaire 6 kwc prix',
      'panneau solaire 9 kwc prix',
      'solaire 2026',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Solaire', url: '/renovation-energetique/travaux/solaire' },
    { name: 'Prix', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const serviceSchema = getServiceSchema({
    name: 'Installation panneaux solaires photovoltaïques 2026',
    description:
      'Fourniture et pose d’une installation photovoltaïque 3-9 kWc par un installateur RGE QualiPV, avec démarches Enedis, contrat EDF OA et demande prime autoconso CRE.',
    category: 'Énergies renouvelables — Photovoltaïque',
  })
  const financialSchema = getFinancialProductSchema({
    name: 'Prime à l’autoconsommation solaire 2026',
    description:
      'Aide versée par EDF Obligation d’Achat sur 5 ans (120 €/kWc ≤ 3 kWc, 180 €/kWc 3-9 kWc) aux ménages installant une installation photovoltaïque en autoconsommation avec revente du surplus par un installateur RGE QualiPV.',
    url: PAGE_URL,
    category: 'Government Grant',
    amount: '360 € à 1 620 € selon puissance (étalé 5 ans)',
  })
  const govServiceSchema = getGovernmentServiceSchema({
    name: 'Prime autoconso + Obligation d’Achat solaire 2026',
    description:
      'Aides financières (prime CRE autoconso + tarif d’achat EDF OA 20 ans) accordées aux ménages installant une installation photovoltaïque par un installateur RGE QualiPV.',
    url: PAGE_URL,
    serviceType: 'Aide financière aux énergies renouvelables',
    serviceOperator: {
      name: 'CRE — Commission de régulation de l’énergie',
      url: 'https://www.cre.fr',
    },
    audience: 'Propriétaires occupants, bailleurs et copropriétés — logement > 2 ans',
    sameAs: ['https://france-renov.gouv.fr', 'https://www.cre.fr'],
  })
  const schemas = [
    articleSchema,
    breadcrumbSchema,
    faqSchema,
    serviceSchema,
    financialSchema,
    govServiceSchema,
  ].filter((s): s is Record<string, unknown> => s !== null)

  return (
    <>
      <JsonLd data={schemas} />
      <div className="bg-sand-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: 'Rénovation énergétique', href: '/renovation-energetique' },
              { label: 'Travaux', href: '/renovation-energetique/travaux' },
              { label: 'Solaire', href: '/renovation-energetique/travaux/solaire' },
              { label: 'Prix' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Sun className="w-3.5 h-3.5" aria-hidden />
              Solaire &middot; Prix 2026
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Panneau solaire prix 2026 : 3-9 kWc, ROI et aides
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              En 2026, une <strong>installation photovoltaïque posée</strong> coûte entre{' '}
              <strong>7 000 et 25 000 € TTC</strong> selon puissance (3 à 9 kWc). Avec la prime
              autoconso CRE (jusqu’à 1 620 €), la revente surplus EDF OA (20 ans) et la TVA 10 %
              auprès d’un installateur RGE QualiPV, le ROI s’établit à <strong>8-12 ans</strong>.
              Voici la grille de prix par puissance, le ROI 25 ans détaillé, les aides 2026 et les
              pièges à éviter.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="prix-puissance">Prix par puissance et configuration</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Configuration</th>
                    <th className="p-3 border-b border-sand-200">Matériel</th>
                    <th className="p-3 border-b border-sand-200">Pose</th>
                    <th className="p-3 border-b border-sand-200">Total TTC</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Profil</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {PRIX_PUISSANCE.map((row) => (
                    <tr key={row.puissance} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.puissance}</td>
                      <td className="p-3 whitespace-nowrap">{row.materiel}</td>
                      <td className="p-3 whitespace-nowrap">{row.pose}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.total}
                      </td>
                      <td className="p-3 text-sand-600 hidden md:table-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Fourchettes nationales 2026, TVA 10 % incluse avec installateur RGE QualiPV /
                QualiSol. Variations +10-20 % Île-de-France, PACA, métropoles. Sources : CRE, ADEME,
                baromètre installateurs RGE 2026.
              </p>
            </div>

            <h2 id="aides">Aides 2026 photovoltaïque + thermique</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Aide</th>
                    <th className="p-3 border-b border-sand-200">Montant 2026</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {AIDES_TABLE.map((row) => (
                    <tr key={row.aide} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{row.aide}</td>
                      <td className="p-3 font-semibold text-primary-800">{row.montant}</td>
                      <td className="p-3 text-sand-600 hidden md:table-cell">{row.condition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Barèmes CRE et ANAH 2026. Tarif EDF OA réévalué trimestriellement (vérifier cre.fr).
                Pas de cumul autoconso CRE + MPR sur la même installation PV (séparé du solaire
                thermique). Sources : CRE, France Rénov’, EDF OA.
              </p>
            </div>

            <ul>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Prime autoconso CRE</strong> : 120 €/kWc (≤ 3 kWc) ou 180 €/kWc (3-9 kWc),
                versée sur 5 ans après mise en service. Conditions : autoconso + revente surplus,
                pose RGE QualiPV.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Revente surplus EDF OA</strong> : tarif ~ 0,127 €/kWh (S1 2026, 3-9 kWc) sur
                contrat 20 ans. Réévaluation trimestrielle CRE.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>MPR solaire thermique CESI</strong> : Bleu 4 000 € / Jaune 3 000 € / Violet
                2 000 €. CESI = chauffe-eau solaire individuel. RGE Qualisol obligatoire.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>MPR solaire combiné SSC</strong> : Bleu 10 000 € / Jaune 8 000 € / Violet 4
                000 €. Système solaire combiné chauffage + ECS. RGE Qualisol Combi.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>TVA 10 %</strong> avec installateur RGE = ~ 9 % d’économie vs TVA 20 %.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Éco-PTZ</strong> jusqu’à 30 000 € (50 000 € en bouquet). Sans intérêts.
              </li>
            </ul>

            <h2 id="roi">ROI 25 ans (durée de vie panneaux)</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Profil</th>
                    <th className="p-3 border-b border-sand-200">Production</th>
                    <th className="p-3 border-b border-sand-200">Économies</th>
                    <th className="p-3 border-b border-sand-200">RAC</th>
                    <th className="p-3 border-b border-sand-200">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {ROI_EXEMPLES.map((row) => (
                    <tr key={row.profil} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{row.profil}</td>
                      <td className="p-3 whitespace-nowrap">{row.prod}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.eco}
                      </td>
                      <td className="p-3 whitespace-nowrap">{row.rac}</td>
                      <td className="p-3 font-semibold whitespace-nowrap">{row.roi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Hypothèses : tarif EDF 0,20 €/kWh, production réelle PVGIS, autoconso 30 %, surplus
                à 0,127 €/kWh sur 20 ans. Pertes panneau 0,5 %/an. Sources : ADEME, CRE, EDF OA,
                PVGIS.
              </p>
            </div>

            <h2 id="facteurs-prix">6 facteurs qui font varier le prix</h2>
            <div className="not-prose grid gap-3 my-6">
              {FACTEURS_PRIX.map((f) => (
                <div key={f.label} className="bg-white border border-sand-200 rounded-xl p-4">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-sand-900 m-0">{f.label}</p>
                    <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                      {f.impact}
                    </span>
                  </div>
                  <p className="text-sm text-sand-700 m-0">{f.detail}</p>
                </div>
              ))}
            </div>

            <h2 id="pieges">6 pièges qui font dériver un devis solaire</h2>
            <div className="not-prose grid gap-3 my-6">
              {PIEGES_DEVIS.map((piege) => (
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

            <h2 id="comparer-devis">Checklist comparaison 3 devis</h2>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Mention RGE QualiPV / QualiSol</strong> valide à la date du devis
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Puissance crête (kWc)</strong> + nombre de panneaux + Wc unitaire
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Marque + référence panneaux + onduleur + fixations</strong> (pas « panneau
                haute qualité »)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Étude de production PVGIS / SolarEdge / Enphase</strong> avec orientation,
                inclinaison, masques d’ombre
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Garantie produit ≥ 12 ans + garantie performance linéaire 25 ans</strong> (≥
                80 % à 25 ans)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Démarches CRE / EDF OA / Enedis</strong> incluses (sinon coût 400-800 €)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Total HT, TVA 10 % détaillée, total TTC</strong>, modalités paiement
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Estimer mes aides solaire en 2 minutes
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Notre simulateur compare votre situation (conso, surface toit, orientation) pour
                    estimer le coût net et le ROI 25 ans. Liste d’installateurs QualiPV proches de
                    chez vous.
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

            <h2 id="economies">Économies sur la facture électricité</h2>
            <ul>
              <li>
                <TrendingDown className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Installation 6 kWc maison standard : production ~ 7 200 kWh/an = ~ 1 200 €/an
                d’économies (autoconso + surplus).
              </li>
              <li>
                <TrendingDown className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <ShieldCheck className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Sur 25 ans (durée de vie panneaux) : gain net 15 000-30 000 € après aides selon
                profil et région.
              </li>
              <li>
                <TrendingDown className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                Le ROI s’améliore continuellement avec la hausse du tarif kWh (+5-10 %/an depuis
                2022). Hypothèse conservatrice +3 %/an : ROI réel souvent inférieur à l’estimation.
              </li>
            </ul>
          </article>

          <PrixComparatif
            title="Comparatif modules photovoltaïques par marque 2026"
            caption="Prix module 400-450 Wc seul (hors onduleur, pose, structure). Rendements et garanties certifiés sur fiche produit constructeur. Sources : AFNOR EN IEC 61215/61730, fiches produits, ADEME."
            withSchema
            rows={PANNEAUX_ROWS}
          />

          <SimulateurAideBox
            serviceKey="panneau-solaire"
            estimatedSaving={1080}
            subtitle="Prime autoconso CRE jusqu’à 1 620 € + revente surplus EDF OA — éligibilité en 3 min"
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
            authorSlug={AUTHOR_SLUG}
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
              href="/rge/labels/qualisol"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Installateurs RGE QualiSol / QualiPV{' '}
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>

      <FinalCtaSection
        heading="Demandez vos devis solaire"
        description="Recevez 3 devis d'installateurs RGE QualiSol / QualiPV en moins de 24h. Gratuit, sans engagement."
        primaryCta={{
          label: 'Demander mes devis',
          href: '/simulateur-aides-renovation?service=panneau-solaire',
          intent: 'final-devis-prix',
        }}
        secondaryCta={{
          label: 'Voir les installateurs RGE',
          href: '/rge/labels/qualisol',
        }}
        accent="blue"
        trustLine="Installateurs RGE QualiSol / QualiPV • Source : Registre RGE ADEME • RGPD"
      />
    </>
  )
}
