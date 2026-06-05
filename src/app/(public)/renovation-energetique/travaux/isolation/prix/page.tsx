/**
 * Page : /renovation-energetique/travaux/isolation/prix
 *
 * @kw-primary    prix isolation extérieur
 * @kw-volume     1900
 * @kw-kd         3
 * @kw-cpc        TBD
 * @intent        commercial
 * @cluster       isolation
 * @ahrefs-source docs/ahrefs-bloc1-keywords-gap-2026-05-04.md
 * @snapshot      2026-05-04 (Ahrefs Bloc 1 v3 — cluster isolation_ext/combles/murs)
 * @backlog-item  Sprint-pseo-isolation-prix-2026-05-22
 * @author        isabelle-renault
 *
 * KW cibles (validés Ahrefs gap CSV 2026-05-04, country=fr) :
 * - "prix isolation exterieur"               1900 vol, KD 3  ⭐ PIVOT (rang absent)
 * - "isolation exterieur prix"               1600 vol, KD 3
 * - "prix m2 isolation extérieure crépi"     1300 vol, KD 2
 * - "isolation 1 euro"                       1500 vol, KD 3  (légalité 2026 = obsolète)
 * - "prix isolation extérieur maison 100m2"   700 vol, KD 0
 * - "isolation combles" head connexe        4100 vol, KD 5  (anti-canniba hub combles)
 * - Famille cumulée prix ITE/ITI/combles : ~7 000 vol/mois
 *
 * Easy win : OUI MAJEUR (KD ≤ 3 sur tous KW, vol cumulé ~7 000 vol/mo).
 * Atout SA : focus PRIX par technique (ITE crépi/bardage + ITI + combles soufflé)
 * et par m², distinct du hub /isolation qui couvre techniques et matériaux.
 *
 * Anti-cannibalisation :
 *   - /renovation-energetique/travaux/isolation               = hub PRODUIT (techniques, matériaux)
 *   - /renovation-energetique/travaux/isolation/exterieure-ite = sous-page ITE détaillée
 *   - /renovation-energetique/travaux/isolation/combles        = sous-page combles détaillée
 *   - Cette page                                              = sous-page PRIX (grille m², 3 techniques)
 *
 * YMYL high : décisions 3 000-25 000 €, prime CEE BAR-EN-101/102/103, MPR
 * « Mon Accompagnateur Rénov’ » sur projets > 5 000 €. Cite : Légifrance,
 * France Rénov’, ADEME, ANAH, DTU 45.3 ITE, DTU 25.41 plâtrerie, Service-Public.fr.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Coins,
  Layers,
  ShieldCheck,
  TrendingDown,
  XCircle,
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
 * Comparatif marques isolants — données factuelles fiches techniques fabricants.
 * Sources : fiches produits Isover/Knauf/Rockwool/Ursa/Soprema + ACERMI 2026
 * (Association pour la Certification des Matériaux Isolants).
 */
const ISOLANTS_ROWS: PrixComparatifRow[] = [
  {
    brand: 'Isover (FR — Saint-Gobain)',
    model: 'GR 32 / Isoconfort 35',
    priceRange: '15 - 40 €/m²',
    cop: 'λ 0,032 - 0,035 W/m.K',
    warranty: 'ACERMI · 10 ans',
    notes: 'Laine de verre. Standard FR. Compatible ITI + combles.',
    highlight: true,
  },
  {
    brand: 'Knauf Insulation (DE/FR)',
    model: 'TI 135 U / Earthwool',
    priceRange: '14 - 38 €/m²',
    cop: 'λ 0,032 - 0,035 W/m.K',
    warranty: 'ACERMI · 10 ans',
    notes: 'Laine de verre / roche. Bonne perf acoustique.',
  },
  {
    brand: 'Rockwool (DK)',
    model: 'Rockmur / Deltarock',
    priceRange: '20 - 55 €/m²',
    cop: 'λ 0,034 - 0,037 W/m.K',
    warranty: 'ACERMI · 10 ans',
    notes: 'Laine de roche. Incombustible (Euroclasse A1).',
  },
  {
    brand: 'Ursa (ES/FR)',
    model: 'Pureone / Terra',
    priceRange: '13 - 35 €/m²',
    cop: 'λ 0,032 - 0,038 W/m.K',
    warranty: 'ACERMI · 10 ans',
    notes: 'Laine minérale. Rapport qualité-prix.',
  },
  {
    brand: 'Soprema (FR)',
    model: 'Pavatex (fibre de bois)',
    priceRange: '25 - 60 €/m²',
    cop: 'λ 0,036 - 0,041 W/m.K',
    warranty: 'ACERMI · 10 ans',
    notes: 'Biosourcé. Bonus MPR +5-10 €/m². Inertie estivale.',
  },
  {
    brand: 'Recticel (BE)',
    model: 'Eurowall / Eurothane',
    priceRange: '30 - 70 €/m²',
    cop: 'λ 0,022 - 0,026 W/m.K',
    warranty: 'ACERMI · 10 ans',
    notes: 'PUR/PIR. λ très faible, faible épaisseur.',
  },
]

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/travaux/isolation/prix'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-22'
const MODIFIED = '2026-05-22'
const AUTHOR_SLUG = 'isabelle-renault'
const AUTHOR_NAME = 'Isabelle Renault'

const TITLE = 'Prix isolation 2026 : ITE, ITI, combles au m² + aides'
const DESCRIPTION =
  'Prix isolation 2026 au m² : ITE 120-220 €/m², ITI 60-110 €/m², combles soufflés 20-45 €/m². MaPrimeRénov’ + CEE BAR-EN-101/103 + TVA 5,5 %.'

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
  'ITE (isolation thermique par l’extérieur) : 120-220 €/m² posé selon finition (crépi vs bardage).',
  'ITI (isolation thermique par l’intérieur) : 60-110 €/m² posé selon technique (placo + laine vs doublage collé).',
  'Combles perdus soufflés : 20-45 €/m² posé. Le plus rentable et le plus aidé.',
  'Combles aménagés (rampants) : 50-90 €/m² posé. Plus complexe, moins aidé.',
  'Aides 2026 cumulables : MPR + CEE BAR-EN-101/102/103 + TVA 5,5 % + Éco-PTZ jusqu’à 50 000 € si bouquet.',
  'Reste à charge typique 30-60 % pour foyers très modestes/modestes, 60-80 % pour intermédiaires/supérieurs.',
  '« Isolation à 1 € » n’existe plus depuis le décret 2021-209 sur le démarchage et la réforme CEE 2022.',
]

const PRIX_TECHNIQUES = [
  {
    technique: 'ITE crépi (polystyrène expansé)',
    materiel: '40-70 €/m²',
    pose: '80-150 €/m²',
    total: '120-220 €/m²',
    note: 'Finition enduit minéral. Solution la plus courante. R ≥ 3,7 m².K/W pour MPR.',
  },
  {
    technique: 'ITE bardage ventilé (laine de bois)',
    materiel: '70-110 €/m²',
    pose: '110-180 €/m²',
    total: '180-290 €/m²',
    note: 'Finition bois ou composite. Esthétique premium. R ≥ 3,7 m².K/W pour MPR.',
  },
  {
    technique: 'ITI doublage collé (placo + polystyrène)',
    materiel: '15-30 €/m²',
    pose: '35-60 €/m²',
    total: '50-90 €/m²',
    note: 'Solution rapide. Perte de surface habitable 4-8 cm. R ≥ 3,7 m².K/W mur extérieur.',
  },
  {
    technique: 'ITI ossature métallique (placo + laine de verre)',
    materiel: '25-45 €/m²',
    pose: '45-75 €/m²',
    total: '70-120 €/m²',
    note: 'Performance acoustique en bonus. Perte 7-12 cm. Compatible passage gaines.',
  },
  {
    technique: 'Combles perdus soufflés (ouate cellulose)',
    materiel: '8-18 €/m²',
    pose: '12-25 €/m²',
    total: '20-45 €/m²',
    note: 'Le plus rentable. R ≥ 7 m².K/W pour MPR. 1-2 jours pour 100 m².',
  },
  {
    technique: 'Combles aménagés rampants (laine de verre)',
    materiel: '20-40 €/m²',
    pose: '30-55 €/m²',
    total: '50-90 €/m²',
    note: 'Plus complexe (entre chevrons). R ≥ 6 m².K/W pour MPR.',
  },
  {
    technique: 'Sol (laine sous dalle ou plafond cave)',
    materiel: '10-25 €/m²',
    pose: '15-35 €/m²',
    total: '25-55 €/m²',
    note: 'R ≥ 3 m².K/W pour MPR. Sol bas (vide sanitaire / cave) le plus simple.',
  },
]

const EXEMPLES_PROJETS = [
  {
    profil: 'Maison 100 m² façade, ITE crépi',
    surface: '~ 130 m² façade',
    devis: '15 000 - 28 000 €',
    rac: '3 800 - 14 000 €',
    note: 'Aides ANAH + CEE selon revenus. Demande MPR avant signature devis.',
  },
  {
    profil: 'Maison 100 m² combles perdus',
    surface: '~ 80-100 m² plancher',
    devis: '1 800 - 4 500 €',
    rac: '0 - 1 500 €',
    note: 'Très modeste : reste à charge proche 0 € (MPR + CEE).',
  },
  {
    profil: 'Appartement 70 m² ITI doublage',
    surface: '~ 35 m² murs extérieurs',
    devis: '1 800 - 3 200 €',
    rac: '700 - 2 200 €',
    note: 'Copropriété : accord syndic préalable + AG si parties communes.',
  },
  {
    profil: 'Maison 120 m² combles aménagés',
    surface: '~ 80 m² rampants',
    devis: '4 000 - 7 200 €',
    rac: '1 500 - 4 800 €',
    note: 'Combinaison rampants + planchers haut = MPR 25 €/m² rampants + 10 €/m² plancher.',
  },
]

const AIDES_TABLE = [
  {
    profil: 'Très modestes (bleu)',
    mpr: '75 €/m² ITE • 25 €/m² ITI • 25 €/m² rampants • 10 €/m² combles perdus',
    cee: '~ 11-15 €/m² ITE • ~ 4-6 €/m² combles',
    cumul: 'jusqu’à 90 €/m² ITE',
    note: 'Plafond MPR 75 €/m² ITE + plafond projet 25 000 € sur 5 ans.',
  },
  {
    profil: 'Modestes (jaune)',
    mpr: '60 €/m² ITE • 20 €/m² ITI • 20 €/m² rampants • 8 €/m² combles perdus',
    cee: '~ 11-15 €/m² ITE • ~ 4-6 €/m² combles',
    cumul: 'jusqu’à 75 €/m² ITE',
    note: 'Plafond projet 25 000 € sur 5 ans.',
  },
  {
    profil: 'Intermédiaires (violet)',
    mpr: '40 €/m² ITE • 15 €/m² ITI • 15 €/m² rampants • 7 €/m² combles perdus',
    cee: '~ 11-15 €/m² ITE • ~ 4-6 €/m² combles',
    cumul: 'jusqu’à 55 €/m² ITE',
    note: 'Plafond projet 25 000 € sur 5 ans.',
  },
  {
    profil: 'Supérieurs (rose)',
    mpr: '15 €/m² ITE • 0 €/m² ITI • 7 €/m² rampants • 0 €/m² combles perdus',
    cee: '~ 11-15 €/m² ITE • ~ 4-6 €/m² combles',
    cumul: 'jusqu’à 30 €/m² ITE',
    note: 'ITI et combles perdus non aidés MPR sauf en bouquet.',
  },
]

const FACTEURS_PRIX = [
  {
    label: 'Technique d’isolation',
    impact: 'Ratio 1 à 5',
    detail:
      'Combles perdus soufflés (20-45 €/m²) sont 4-5 × moins chers au m² que l’ITE bardage (180-290 €/m²). Choisir la technique selon priorité (toit > murs > sol) et budget disponible.',
  },
  {
    label: 'Épaisseur et résistance thermique R',
    impact: '+ 15-40 %',
    detail:
      'R ≥ 3,7 m².K/W (murs MPR) = ~ 14-16 cm laine ; R ≥ 7 m².K/W (combles MPR) = ~ 28-32 cm. Au-delà, marginal +5 € par tranche +20 mm.',
  },
  {
    label: 'Matériau isolant',
    impact: '+ 20-60 %',
    detail:
      'Polystyrène expansé/extrudé = entrée de gamme. Laine de verre/roche = standard. Fibre de bois / ouate cellulose = biosourcé bonifié (MPR +5-10 €/m²). Liège = haut de gamme.',
  },
  {
    label: 'Accessibilité chantier',
    impact: '+ 10-30 %',
    detail:
      'Façade ITE > 8 m hauteur = échafaudage payant. Combles aménagés bas plafond (< 1,80 m) = pose à genoux + temps × 1,5. Toiture > 35° = harnais obligatoire.',
  },
  {
    label: 'Finition (ITE)',
    impact: '+ 30-50 %',
    detail:
      'Enduit minéral mince standard. Bardage bois ventilé = +40-80 €/m² vs crépi. Bardage composite Trespa / fibrociment = +60-100 €/m². Vérifier compatibilité PLU mairie.',
  },
  {
    label: 'Région (IDF / métropoles)',
    impact: '+ 10-20 %',
    detail:
      'Coût main-d’œuvre artisan plus élevé Île-de-France, PACA, Lyon, Bordeaux. Province rurale : -5-10 % vs moyenne nationale. Variations échafaudage selon densité urbaine.',
  },
]

const PIEGES_DEVIS = [
  {
    title: '« Isolation à 1 € » illégale en 2026',
    impact: 'Fraude DGCCRF',
    desc: 'L’offre « combles à 1 € » a été supprimée mi-2021 (décret 2021-209). Toute offre actuelle dissimule un reste à charge post-installation ou une fraude aux CEE. Risque : poursuites pénales selon DGCCRF.',
  },
  {
    title: 'R thermique insuffisant',
    impact: 'Aides perdues',
    desc: 'Pour MPR : R ≥ 3,7 m².K/W (murs), R ≥ 7 m².K/W (combles perdus), R ≥ 6 m².K/W (rampants), R ≥ 3 m².K/W (sol). Sous le seuil = dossier MPR rejeté + pas de CEE BAR-EN.',
  },
  {
    title: 'Pose par non RGE',
    impact: '+ 14 % TVA + aides perdues',
    desc: 'Sans artisan RGE Qualibat 7141 (ITE) / 7142 (ITI) : TVA 20 % au lieu de 5,5 % (+~ 1 000 € sur 7 000 €) + MPR/CEE rejetées + dossier non assurable.',
  },
  {
    title: 'Ponts thermiques négligés',
    impact: 'Performance -20-30 %',
    desc: 'ITI sans traitement des angles, dalle béton, retours de fenêtres = ponts thermiques = condensation + perte 20-30 % du gain attendu. Exiger un mémoire technique détaillant les retours.',
  },
  {
    title: 'Pare-vapeur absent (combles)',
    impact: 'Dégâts structure',
    desc: 'Combles isolés sans pare-vapeur = condensation interne dans la laine = perte d’efficacité + moisissures + corrosion charpente. Pare-vapeur DTU 31.2 obligatoire côté chaud.',
  },
  {
    title: 'Audit énergétique obligatoire oublié',
    impact: 'Dossier MPR bloqué',
    desc: 'Pour MPR « parcours accompagné » (projets > 5 000 € avec saut 2 classes DPE), audit énergétique obligatoire (500-1 200 €). Inclus dans aide ANAH jusqu’à 500 €.',
  },
]

const faqs = [
  {
    question: 'Combien coûte l’isolation au m² en 2026 ?',
    answer:
      'Selon la technique : <strong>combles perdus soufflés 20-45 €/m²</strong> (le moins cher), <strong>ITI doublage 50-90 €/m²</strong>, <strong>ITI ossature métallique 70-120 €/m²</strong>, <strong>combles aménagés rampants 50-90 €/m²</strong>, <strong>ITE crépi 120-220 €/m²</strong>, <strong>ITE bardage 180-290 €/m²</strong>. Sol : 25-55 €/m². Ces fourchettes incluent matériel + pose TVA 5,5 % avec artisan RGE Qualibat 7141/7142. Variations +10-20 % en Île-de-France et métropoles.',
  },
  {
    question: 'Quelles aides 2026 pour isoler une maison ?',
    answer:
      'Cumul possible : <strong>MaPrimeRénov’</strong> selon revenus (jusqu’à 75 €/m² ITE pour Bleu, 60 €/m² Jaune, 40 €/m² Violet, 15 €/m² Rose) + <strong>Coup de pouce CEE BAR-EN-101</strong> (combles), <strong>BAR-EN-102</strong> (sol), <strong>BAR-EN-103</strong> (murs) jusqu’à 11-15 €/m² + <strong>TVA 5,5 %</strong> avec RGE + <strong>éco-PTZ jusqu’à 50 000 €</strong> en bouquet. Conditions : R thermique minimum (3,7 mur / 7 combles), pose RGE, logement > 2 ans, dossier France Rénov’ AVANT signature devis.',
  },
  {
    question: 'L’isolation à 1 € existe-t-elle encore en 2026 ?',
    answer:
      'Non. Le Coup de pouce CEE « combles à 1 € » a été supprimé en juin 2021 (décret 2021-209 sur le démarchage abusif). Depuis 2022, la réforme CEE oblige un reste à charge minimum. Toute offre « isolation à 1 € » en 2026 cache soit une sous-performance (R insuffisant = aides rejetées), soit un reste à charge dissimulé en post-installation, soit une fraude aux CEE (poursuites pénales DGCCRF). Privilégier 3 devis comparés d’artisans RGE Qualibat.',
  },
  {
    question: 'Quel est le ROI réel d’une isolation 2026 ?',
    answer:
      'L’isolation est le geste à plus fort ROI de la rénovation énergétique : <strong>combles perdus</strong> = 30 % d’économies chauffage en moyenne = ROI 2-4 ans après aides. <strong>ITE complète maison</strong> = 25-35 % d’économies chauffage + gain DPE 1-2 classes + valorisation revente +5-10 % = ROI 8-12 ans après aides. <strong>ITI</strong> = 15-20 % d’économies = ROI 6-10 ans. Sources : ADEME baromètre 2026, France Rénov’ chiffres typiques.',
  },
  {
    question: 'ITE ou ITI : que choisir ?',
    answer:
      '<strong>ITE</strong> recommandée si : ravalement façade prévu, pas de contrainte PLU (zone protégée), budget > 15 000 €, refonte thermique globale. Avantages : pas de perte surface, traitement parfait des ponts thermiques, inertie murs préservée. <strong>ITI</strong> recommandée si : façade en pierre/brique à conserver, budget contraint, copropriété sans accord ITE, intervention pièce par pièce possible. Inconvénients ITI : perte 5-12 cm surface, ponts thermiques planchers/refends à traiter.',
  },
  {
    question: 'Quel artisan choisir et comment vérifier sa qualification ?',
    answer:
      'Artisan qualifié <strong>RGE Qualibat 7141</strong> (ITE) ou <strong>7142</strong> (ITI) ou <strong>Qualibat 8611</strong> (isolation thermique des combles). Vérification obligatoire : (1) numéro Qualibat valide à la date du devis sur <a href="https://www.qualibat.com" target="_blank" rel="noopener noreferrer">qualibat.com</a> ou <a href="https://france-renov.gouv.fr" target="_blank" rel="noopener noreferrer">france-renov.gouv.fr</a>, (2) SIRET actif, (3) attestation décennale assurance, (4) 5-10 références chantiers ITE/ITI/combles. Sans RGE : TVA 20 % + aides MPR/CEE perdues = +~ 14 % du devis.',
  },
  {
    question: 'Faut-il un audit énergétique avant d’isoler ?',
    answer:
      'Pour <strong>MPR par geste</strong> (≤ 5 000 €) : audit non obligatoire, dossier simplifié. Pour <strong>MPR Parcours accompagné</strong> (saut de 2 classes DPE, projets > 5 000 €) : audit énergétique obligatoire (500-1 200 € TTC, aide ANAH 500 € maximum). L’audit identifie les priorités (toit > murs > sol > menuiseries > chauffage) et chiffre 2 scénarios de rénovation pour atteindre la classe B-C. Sources : ANAH, France Rénov’.',
  },
  {
    question: 'Combien de temps dure un chantier isolation ?',
    answer:
      'Selon technique et surface : <strong>combles perdus soufflés</strong> 1-2 jours pour 100 m². <strong>Combles aménagés rampants</strong> 4-7 jours pour 80 m². <strong>ITI doublage</strong> 5-10 jours pour 70 m² appartement. <strong>ITE crépi maison 100 m² façade</strong> 3-5 semaines (échafaudage, séchage enduit, finition). <strong>ITE bardage</strong> 4-6 semaines. Délai accord MPR : 7-15 jours après dépôt. Délai versement aides : 2-4 mois après facture.',
  },
]

const sources = [
  {
    label: 'France Rénov’ — Isoler son logement',
    url: 'https://france-renov.gouv.fr/renovation/isolation',
  },
  {
    label: 'ANAH — MaPrimeRénov’ Isolation',
    url: 'https://www.anah.gouv.fr',
  },
  {
    label: 'ADEME — Guide isolation thermique',
    url: 'https://agir.ademe.fr',
  },
  {
    label: 'AFNOR — DTU 45.3 (Isolation thermique par l’extérieur)',
    url: 'https://www.afnor.org',
  },
  {
    label: 'AFNOR — DTU 31.2 (Pare-vapeur combles)',
    url: 'https://www.afnor.org',
  },
  {
    label: 'Légifrance — Décret 2021-209 (fin démarchage isolation 1 €)',
    url: 'https://www.legifrance.gouv.fr',
  },
  {
    label: 'Qualibat — Annuaire RGE isolation',
    url: 'https://www.qualibat.com',
  },
  {
    label: 'Service-Public.fr — Aides à la rénovation énergétique',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F35054',
  },
]

const relatedPages = [
  {
    label: 'Isolation — hub 2026',
    href: '/renovation-energetique/travaux/isolation',
    description: 'Techniques, matériaux, performances',
  },
  {
    label: 'ITE — isolation par l’extérieur',
    href: '/renovation-energetique/travaux/isolation/exterieure-ite',
    description: 'Crépi vs bardage, performance',
  },
  {
    label: 'Combles — isolation perdus + aménagés',
    href: '/renovation-energetique/travaux/isolation/combles',
    description: 'Soufflé, rampants, R minimum',
  },
  {
    label: 'Installation isolation — guide pose',
    href: '/renovation-energetique/travaux/isolation/installation',
    description: 'Étapes, durée, RGE, DTU',
  },
  {
    label: 'Aides MaPrimeRénov’ 2026',
    href: '/renovation-energetique/aides/maprimerenov-2026',
    description: 'Barèmes MPR par revenus + plafonds',
  },
  {
    label: 'Simulateur aides 2026',
    href: '/simulateur-aides-renovation',
    description: 'Estimer mes aides isolation',
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
    section: 'Travaux — Isolation — Prix',
    keywords: [
      'prix isolation extérieur',
      'isolation extérieur prix',
      'prix m2 isolation extérieure',
      'prix isolation combles',
      'isolation prix au m2',
      'isolation maison prix 2026',
      'tarif isolation thermique',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Travaux', url: '/renovation-energetique/travaux' },
    { name: 'Isolation', url: '/renovation-energetique/travaux/isolation' },
    { name: 'Prix', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const serviceSchema = getServiceSchema({
    name: 'Isolation thermique 2026 — ITE, ITI, combles',
    description:
      'Travaux d’isolation thermique par un artisan RGE Qualibat 7141/7142/8611 : ITE crépi/bardage 120-290 €/m², ITI 50-120 €/m², combles 20-90 €/m². TVA 5,5 % avec RGE.',
    category: 'Isolation thermique du bâtiment',
  })
  const financialSchema = getFinancialProductSchema({
    name: 'Aides cumulées isolation 2026',
    description:
      'Cumul MaPrimeRénov’ par geste (jusqu’à 75 €/m² ITE Bleu) + Coup de pouce CEE BAR-EN-101/102/103 + TVA 5,5 % + éco-PTZ jusqu’à 50 000 € en bouquet pour travaux d’isolation par artisan RGE.',
    url: PAGE_URL,
    category: 'Government Grant',
    amount: 'jusqu’à 90 €/m² ITE selon revenus',
  })
  const govServiceSchema = getGovernmentServiceSchema({
    name: 'MaPrimeRénov’ + CEE — Isolation 2026',
    description:
      'Aides à la transition énergétique versées par l’ANAH et les obligés CEE aux ménages réalisant des travaux d’isolation thermique (R minimum 3,7/7/6 m².K/W selon paroi) par un artisan RGE Qualibat.',
    url: PAGE_URL,
    serviceType: 'Aide financière à la rénovation énergétique',
    serviceOperator: {
      name: 'ANAH — Agence nationale de l’habitat',
      url: 'https://www.anah.gouv.fr',
    },
    audience: 'Propriétaires occupants, bailleurs et copropriétés — logement > 2 ans',
    sameAs: ['https://france-renov.gouv.fr/aides/maprimerenov', 'https://www.anah.gouv.fr'],
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
              { label: 'Isolation', href: '/renovation-energetique/travaux/isolation' },
              { label: 'Prix' },
            ]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Layers className="w-3.5 h-3.5" aria-hidden />
              Isolation &middot; Prix 2026
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Prix isolation 2026 au m² : ITE, ITI, combles + aides
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              En 2026, le <strong>prix de l’isolation au m²</strong> dépend de la technique :
              combles perdus soufflés <strong>20-45 €/m²</strong>, ITI <strong>50-120 €/m²</strong>,
              ITE crépi <strong>120-220 €/m²</strong>, ITE bardage <strong>180-290 €/m²</strong>.
              Avec MaPrimeRénov’ + CEE BAR-EN-101/102/103 + TVA 5,5 % auprès d’un artisan RGE
              Qualibat 7141/7142/8611, le reste à charge tombe à 30-60 % pour un foyer modeste.
              Voici la grille détaillée et les aides 2026.
            </p>
            <LastUpdated date={MODIFIED} className="mt-3" />
          </header>

          <TldrBlock bullets={tldr} />

          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2 id="prix-techniques">Prix au m² par technique d’isolation</h2>
            <p>
              Le prix de l’isolation dépend en premier lieu de la technique (ITE / ITI / combles /
              sol) et du matériau isolant. Voici les fourchettes 2026 de 7 configurations standards
              :
            </p>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Technique</th>
                    <th className="p-3 border-b border-sand-200">Matériel</th>
                    <th className="p-3 border-b border-sand-200">Pose</th>
                    <th className="p-3 border-b border-sand-200">Total / m²</th>
                    <th className="p-3 border-b border-sand-200 hidden md:table-cell">Note</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {PRIX_TECHNIQUES.map((row) => (
                    <tr key={row.technique} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold whitespace-nowrap">{row.technique}</td>
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
                Fourchettes nationales 2026 TVA 5,5 % incluse avec artisan RGE Qualibat
                7141/7142/8611. Sources : France Rénov’, ANAH, baromètre prix isolation 2026, FFB.
              </p>
            </div>

            <h2 id="exemples-projets">4 cas types budget après aides</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Profil projet</th>
                    <th className="p-3 border-b border-sand-200">Surface</th>
                    <th className="p-3 border-b border-sand-200">Devis TTC</th>
                    <th className="p-3 border-b border-sand-200">Reste à charge</th>
                  </tr>
                </thead>
                <tbody>
                  {EXEMPLES_PROJETS.map((row) => (
                    <tr key={row.profil} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{row.profil}</td>
                      <td className="p-3 whitespace-nowrap">{row.surface}</td>
                      <td className="p-3 whitespace-nowrap">{row.devis}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.rac}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Reste à charge calculé après cumul MPR + CEE + TVA 5,5 % pour profil modeste à très
                modeste, sources ANAH/CEE 2026. Variations selon délégataire CEE et plafonds
                revenus.
              </p>
            </div>

            <h2 id="aides">Aides 2026 par profil et technique</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Profil revenus</th>
                    <th className="p-3 border-b border-sand-200">MaPrimeRénov’</th>
                    <th className="p-3 border-b border-sand-200">CEE</th>
                    <th className="p-3 border-b border-sand-200">Cumul max ITE</th>
                  </tr>
                </thead>
                <tbody>
                  {AIDES_TABLE.map((row) => (
                    <tr key={row.profil} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-semibold">{row.profil}</td>
                      <td className="p-3 text-xs text-sand-700">{row.mpr}</td>
                      <td className="p-3 text-xs text-sand-700">{row.cee}</td>
                      <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                        {row.cumul}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-sand-500 p-3">
                Barèmes MaPrimeRénov’ 2026 (arrêté 30 décembre 2025). Plafonds projet 25 000 € sur 5
                ans, MaPrimeRénov’ « par geste ». Au-delà de 5 000 € avec saut 2 classes DPE :
                obligation parcours accompagné Mon Accompagnateur Rénov’. Sources : ANAH, France
                Rénov’.
              </p>
            </div>

            <ul>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>MaPrimeRénov’</strong> isolation : barème par m² et par paroi (mur ITE/ITI,
                rampants, combles perdus, sol). Cumul possible plusieurs parois sur le même dossier.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>CEE BAR-EN-101</strong> (combles), <strong>BAR-EN-102</strong> (sol),{' '}
                <strong>BAR-EN-103</strong> (murs ITE/ITI) : ~ 11-15 €/m² ITE et ~ 4-6 €/m² combles
                selon délégataire (TotalEnergies, EDF, Engie, Sonergia).
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Éco-PTZ</strong> : jusqu’à 50 000 € si bouquet (≥ 3 gestes) ou 30 000 € pour
                un geste isolation. Sans intérêts, remboursement 15-20 ans.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>TVA 5,5 %</strong> automatique avec artisan RGE Qualibat = ~ 14 % d’économie
                vs TVA 20 % standard.
              </li>
              <li>
                <Coins className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Aides locales</strong> (région, département, métropole) : 200-2 000 €
                variables. Voir notre simulateur pour le détail par département.
              </li>
            </ul>

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

            <h2 id="pieges">6 pièges qui font dériver un devis</h2>
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

            <h2 id="isolation-1-euro">Méfiance « isolation à 1 € »</h2>
            <div className="not-prose border-2 border-red-300 bg-red-50 rounded-lg p-5 my-6">
              <div className="flex items-start gap-3">
                <XCircle className="w-6 h-6 text-red-700 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-semibold text-red-900 m-0">
                    Aucune « isolation à 1 € » n’est légale en 2026.
                  </p>
                  <p className="text-sm text-red-900 mt-2 mb-0">
                    Le Coup de pouce CEE « combles à 1 € » a été supprimé en juin 2021 (décret
                    2021-209 sur le démarchage abusif). La réforme CEE de 2022 a imposé un reste à
                    charge minimum. Toute offre « à 1 € » en 2026 cache soit une sous-performance (R
                    thermique insuffisant → aides rejetées), soit un reste à charge dissimulé en
                    post-installation, soit une fraude aux CEE (poursuites pénales DGCCRF). La
                    DGCCRF publie chaque année une liste noire des éco-démarcheurs frauduleux.
                  </p>
                </div>
              </div>
            </div>

            <h2 id="comparer-devis">Comment comparer 3 devis efficacement</h2>
            <p>
              L’écart entre 3 devis à configuration équivalente atteint 20-35 % en isolation. Voici
              les 7 points à vérifier sur chaque devis avant de signer :
            </p>
            <ul>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Mention RGE Qualibat 7141 / 7142 / 8611</strong> valide à la date du devis
                (vérifiable sur france-renov.gouv.fr)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>
                  Surface exacte (m²), épaisseur isolant (mm), résistance thermique R
                </strong>{' '}
                (m².K/W) précisée
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Matériau isolant détaillé</strong> (marque + référence + lambda λ) — pas «
                isolant haute performance »
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Traitement des points singuliers</strong> (angles, retours fenêtres, ponts
                thermiques) chiffré
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Pare-vapeur DTU 31.2</strong> mentionné (combles, rampants) — protection
                obligatoire
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Garanties</strong> détaillées (décennale + biennale + parfait achèvement)
              </li>
              <li>
                <CheckCircle2 className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Total HT, TVA 5,5 % détaillée, total TTC</strong>, modalités paiement
              </li>
            </ul>

            <div className="not-prose bg-white border border-sand-200 rounded-xl p-5 md:p-6 my-8">
              <div className="flex items-start gap-3">
                <Calculator className="w-6 h-6 text-primary-700 shrink-0 mt-1" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold text-sand-900 mb-1">
                    Estimer mes aides isolation en 2 minutes
                  </p>
                  <p className="text-sm md:text-base text-sand-700 mb-3">
                    Notre simulateur compare votre situation (revenus, surface, paroi) pour estimer
                    le coût net après aides MPR + CEE 2026. Liste d’artisans Qualibat RGE proches de
                    chez vous.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/simulateur-aides-renovation"
                      className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
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

            <h2 id="economies-facture">Économies sur la facture chauffage</h2>
            <ul>
              <li>
                <TrendingDown className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Combles perdus</strong> : 25-30 % d’économies chauffage typiques (toit = 30
                % des déperditions d’une maison non isolée). ROI 2-4 ans après aides.
              </li>
              <li>
                <TrendingDown className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>ITE complète</strong> : 25-35 % d’économies chauffage + gain DPE 1-2 classes
                + valorisation revente +5-10 %. ROI 8-12 ans.
              </li>
              <li>
                <TrendingDown className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <ShieldCheck className="inline w-4 h-4 text-primary-700 mr-1" aria-hidden />
                <strong>Confort été</strong> : ITE et combles soufflés réduisent fortement la
                surchauffe estivale (+10-15 °C en toiture non isolée).
              </li>
            </ul>
          </article>

          <PrixComparatif
            title="Prix isolants par marque 2026 (ACERMI)"
            caption="λ (conductivité thermique) certifiée ACERMI. Prix matériel HT pour épaisseur 100-200 mm. Sources : fiches produits constructeurs + ACERMI 2026."
            withSchema
            rows={ISOLANTS_ROWS}
          />

          <SimulateurAideBox
            serviceKey="isolation"
            estimatedSaving={4500}
            subtitle="MaPrimeRénov’ jusqu’à 75 €/m² + CEE BAR-EN-101/102/103 — éligibilité en 3 min"
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
              href="/renovation-energetique/travaux/isolation"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Isolation
            </Link>
            <Link
              href="/rge/labels/qualibat"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Artisans RGE Qualibat <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>

      <FinalCtaSection
        heading="Demandez vos devis isolation"
        description="Recevez 3 devis d'artisans RGE Qualibat en moins de 24h. Gratuit, sans engagement."
        primaryCta={{
          label: 'Demander mes devis',
          href: '/simulateur-aides-renovation?service=isolation',
          intent: 'final-devis-prix',
        }}
        secondaryCta={{
          label: 'Voir les artisans RGE Qualibat',
          href: '/rge/labels/qualibat',
        }}
        accent="blue"
        trustLine="Artisans RGE Qualibat • Source : Registre RGE ADEME • RGPD"
      />
    </>
  )
}
