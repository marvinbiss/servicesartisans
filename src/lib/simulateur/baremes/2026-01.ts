/**
 * Barèmes aides rénovation — Version 2026-01-14
 *
 * Source de vérité : docs/baremes-sources/07-valeurs-officielles-confirmees-2026-04-14.md
 * Architecture      : docs/simulateur-architecture.md §3.3
 *
 * IMPORTANT : ne pas modifier les valeurs sans mettre à jour le doc 07 et créer
 * une nouvelle version (ex: 2026-07-01) plutôt que d'écraser celle-ci.
 * Une estimation générée référence `barometre_version` et doit rester
 * reconstructible à l'identique même après MAJ barèmes.
 */

import 'server-only'
import type { CategorieAnah, GesteId, ZoneClimatique, TypeLogement } from '../types'

export const BAREME_VERSION = '2026-01-14'

// =============================================================================
// 1. Plafonds ressources ANAH 2026 (doc 07 §1)
// =============================================================================

export interface PlafondsAnahRow {
  bleu: number
  jaune: number
  violet: number
}

export const ANAH_PLAFONDS_HORS_IDF: Record<number, PlafondsAnahRow> = {
  1: { bleu: 17363, jaune: 22259, violet: 31185 },
  2: { bleu: 25393, jaune: 32553, violet: 45842 },
  3: { bleu: 30540, jaune: 39148, violet: 55196 },
  4: { bleu: 35676, jaune: 45735, violet: 64550 },
  5: { bleu: 40835, jaune: 52348, violet: 73907 },
}
export const ANAH_INCREMENT_HORS_IDF: PlafondsAnahRow = {
  bleu: 5151,
  jaune: 6598,
  violet: 9357,
}

export const ANAH_PLAFONDS_IDF: Record<number, PlafondsAnahRow> = {
  1: { bleu: 24031, jaune: 29253, violet: 40851 },
  2: { bleu: 35270, jaune: 42933, violet: 60051 },
  3: { bleu: 42357, jaune: 51564, violet: 71846 },
  4: { bleu: 49455, jaune: 60208, violet: 84562 },
  5: { bleu: 56580, jaune: 68877, violet: 96817 },
}
export const ANAH_INCREMENT_IDF: PlafondsAnahRow = {
  bleu: 7116,
  jaune: 8663,
  violet: 12257,
}

// =============================================================================
// 2. Écrêtement des aides cumulées (doc 07 §2)
// =============================================================================

export const ECRETEMENT_GESTE: Record<CategorieAnah, number | null> = {
  bleu: 0.9,
  jaune: 0.75,
  violet: 0.6,
  rose: null, // non éligible parcours par geste
}

export const ECRETEMENT_ACCOMPAGNE: Record<CategorieAnah, number> = {
  bleu: 1.0,
  jaune: 0.9,
  violet: 0.8,
  rose: 0.5,
}

// =============================================================================
// 3. MPR parcours accompagné (doc 07 §3)
// =============================================================================

export interface MprAccompagneTaux {
  min: number
  max: number
}

/**
 * Taux MPR parcours accompagné : % du HT travaux.
 * Bleu/Jaune : variable selon sauts DPE.
 * Violet/Rose : taux unique (min === max).
 */
export const MPR_ACCOMPAGNE: Record<CategorieAnah, MprAccompagneTaux> = {
  bleu: { min: 0.6, max: 0.8 },
  jaune: { min: 0.4, max: 0.6 },
  violet: { min: 0.45, max: 0.45 },
  rose: { min: 0.1, max: 0.1 },
}

// =============================================================================
// 5. MPR parcours geste — PAC air/eau (doc 07 §5)
// =============================================================================

export const MPR_GESTE_PAC_AIREAU: Record<CategorieAnah, number> = {
  bleu: 5000,
  jaune: 4000,
  violet: 3000,
  rose: 1000,
}

export const MPR_GESTE_PLAFOND_DEPENSES = 12000

/**
 * MPR parcours geste — autres forfaits par catégorie (doc 01 §70-120).
 * Sources officielles : economie.gouv.fr / service-public.gouv.fr (arrêté 2026).
 * Rose : 0 € systématiquement (non éligible parcours geste).
 */
export const MPR_GESTE_PAC_GEOTHERMIE: Record<CategorieAnah, number> = {
  bleu: 11000,
  jaune: 9000,
  violet: 6000,
  rose: 0,
}

export const MPR_GESTE_CET: Record<CategorieAnah, number> = {
  bleu: 1200,
  jaune: 800,
  violet: 400,
  rose: 0,
}

/** ⚠️ Valeurs à confirmer contre l'arrêté officiel 2026 (baremeId `.UNCONFIRMED.`). */
export const MPR_GESTE_CESI: Record<CategorieAnah, number> = {
  bleu: 4000,
  jaune: 3000,
  violet: 2000,
  rose: 0,
}

export const MPR_GESTE_POELE_GRANULES: Record<CategorieAnah, number> = {
  bleu: 1250,
  jaune: 1000,
  violet: 750,
  rose: 0,
}

/** ⚠️ Valeurs à confirmer contre l'arrêté officiel 2026 (baremeId `.UNCONFIRMED.`). */
export const MPR_GESTE_POELE_BUCHES: Record<CategorieAnah, number> = {
  bleu: 1000,
  jaune: 800,
  violet: 500,
  rose: 0,
}

export const MPR_GESTE_VMC_2FLUX: Record<CategorieAnah, number> = {
  bleu: 2500,
  jaune: 2000,
  violet: 1500,
  rose: 0,
}

export const MPR_GESTE_AUDIT_ENERGETIQUE: Record<CategorieAnah, number> = {
  bleu: 500,
  jaune: 400,
  violet: 300,
  rose: 0,
}

/** Gestes dont les forfaits 2026 doivent encore être confirmés par arrêté officiel. */
export const MPR_GESTE_UNCONFIRMED = ['CESI', 'POELE_BUCHES'] as const

/**
 * Gestes nécessitant un input `surfaceIsolation_m2` pour calculer le forfait (€/m²).
 * TODO: ajouter input surfaceIsolation_m2 au stepper + calcul barème €/m² par catégorie.
 */
export const MPR_GESTE_NEEDS_SURFACE = [
  'ISO_TOITURE_RAMPANTS',
  'ISO_TOITURE_TERRASSE',
  'ISO_PLANCHERS_BAS',
] as const

/**
 * Gestes dont le forfait MPR monogeste est SUPPRIMÉ depuis 01/01/2026.
 * - BIOMASSE : supprimée (CEE seuls actifs)
 * - ITE / ITI : supprimés du parcours geste (doc 01 §70-120)
 */
export const MPR_GESTE_SUPPRIMES: GesteId[] = ['BIOMASSE', 'ITE', 'ITI']

// =============================================================================
// 6. Fiches CEE (doc 07 §6)
// =============================================================================

// ---- BAR-TH-148 — Chauffe-eau thermodynamique ----
export const BAR_TH_148: Record<TypeLogement, number> = {
  maison: 14700,
  appartement: 11800,
}

export const BAR_TH_148_META = {
  fiche: 'BAR-TH-148' as const,
  version: 'vA78.4',
  dureeDeVieAns: 17,
  nonCumul: ['BAR-TH-171', 'BAR-TH-172'] as const,
}

// ---- BAR-TH-113 — Chaudière biomasse ----
export const BAR_TH_113: Record<ZoneClimatique, number> = {
  H1: 41300,
  H2: 33800,
  H3: 26300,
}

export const BAR_TH_113_META = {
  fiche: 'BAR-TH-113' as const,
  version: 'vA79-4',
  dureeDeVieAns: 17,
  maisonIndividuelleUniquement: true,
  nonCumul: ['BAR-TH-143'] as const,
  note: 'MPR monogeste SUPPRIMÉE depuis 01/01/2026 — CEE seuls actifs. Coup de Pouce ×5 en remplacement fioul/gaz/charbon.',
}

// ---- BAR-TH-143 — Système solaire combiné (SSC) ----
export const BAR_TH_143: Record<ZoneClimatique, number> = {
  H1: 134800,
  H2: 121000,
  H3: 100500,
}

export const BAR_TH_143_META = {
  fiche: 'BAR-TH-143' as const,
  version: 'vA79-6',
  dureeDeVieAns: 20,
  maisonIndividuelleFranceMetroUniquement: true,
  conditionsTechniques: {
    capteursWm2Min: 600,
    surfaceCapteursM2Min: 8,
    ballonLitresMin: 400,
    emetteursBasseTemp: true as const,
  },
  nonCumul: ['BAR-TH-171', 'BAR-TH-172', 'BAR-TH-113'] as const,
}

// ---- BAR-TH-127 — VMC simple flux hygroréglable ----
export const BAR_TH_127_INDIV_BASE: Record<ZoneClimatique, number> = {
  H1: 31600,
  H2: 25900,
  H3: 17200,
}

export const BAR_TH_127_COLLECTIF_BASE: Record<ZoneClimatique, number> = {
  H1: 21800,
  H2: 17800,
  H3: 11900,
}

export interface SurfaceFactorBucket {
  /** Borne supérieure exclusive (sauf dernière). m². */
  max: number
  facteur: number
}

export const BAR_TH_127_SURFACE_FACTEURS: SurfaceFactorBucket[] = [
  { max: 35, facteur: 0.3 },
  { max: 60, facteur: 0.5 },
  { max: 70, facteur: 0.6 },
  { max: 90, facteur: 0.7 },
  { max: 110, facteur: 1.0 },
  { max: 130, facteur: 1.1 },
  { max: Infinity, facteur: 1.6 },
]

export type VmcRType = 'A_caisson_BC' | 'B_caisson_BC'

export const BAR_TH_127_FACTEUR_R_INDIV: Record<VmcRType, number> = {
  A_caisson_BC: 0.9,
  B_caisson_BC: 1.0,
}

export type VmcRTypeCollectif =
  | 'A_caisson_BC'
  | 'A_standard'
  | 'A_BP'
  | 'B_caisson_BC'
  | 'B_standard'
  | 'B_BP'

export const BAR_TH_127_FACTEUR_R_COLLECTIF: Record<VmcRTypeCollectif, number> = {
  A_caisson_BC: 0.96,
  A_standard: 0.91,
  A_BP: 0.76,
  B_caisson_BC: 1.0,
  B_standard: 0.95,
  B_BP: 0.78,
}

export const BAR_TH_127_META = {
  fiche: 'BAR-TH-127' as const,
  version: 'vA58-6',
  dureeDeVieAns: 17,
}

// ---- BAR-TH-171 — PAC air/eau (formule variable, doc 07 §11.1) ----

export interface BarTh171TrancheSurface {
  label: string
  minM2: number
  /** null = pas de borne haute */
  maxM2: number | null
}

export const BAR_TH_171_META = {
  fiche: 'BAR-TH-171' as const,
  version: 'vA78.4',
  dureeDeVieAns: 17,
  formulaireVariable: true as const,
  classesEtas: {
    classe1: { min: 111, max: 140, label: 'ETAS 111–140 %' },
    classe2: { min: 140, label: 'ETAS > 140 %' },
  },
  trancheSurfaceMaison: [
    { label: '< 70 m²', minM2: 0, maxM2: 70 },
    { label: '70–90 m²', minM2: 70, maxM2: 90 },
    { label: '> 90 m²', minM2: 90, maxM2: null },
  ] as BarTh171TrancheSurface[],
  trancheSurfaceAppartement: [
    { label: '< 35 m²', minM2: 0, maxM2: 35 },
    { label: '35–60 m²', minM2: 35, maxM2: 60 },
    { label: '> 60 m²', minM2: 60, maxM2: null },
  ] as BarTh171TrancheSurface[],
  obligations2026: {
    tauxControleSite: 0.5,
    noteDimensionnementObligatoireDepuis: '2025-10-01',
    numeroEprelObligatoireDepuis: '2026-01-01',
  },
  nonCumul: ['BAR-TH-148', 'BAR-TH-143'] as const,
  note: 'Forfait calculé via computeBarTh171(zone, etasClass, surface, typeLogement). Table exacte PDF DGEC vA78.4 à intégrer dans le moteur de calcul.',
}

// =============================================================================
// Prix EMMY kWhc (doc 07 §11.2)
// =============================================================================

/** €/MWhc — refresh trimestriel via env `CEE_PRIX_CLASSIQUE`. */
export const CEE_PRIX_CLASSIQUE_DEFAULT = 8.5
/** €/MWhc — refresh trimestriel via env `CEE_PRIX_PRECARITE`. */
export const CEE_PRIX_PRECARITE_DEFAULT = 15.0

// =============================================================================
// Coup de Pouce (doc 03) — fourchettes indicatives
// =============================================================================

export interface CdpFourchette {
  bas: number
  haut: number
}

export const CDP_CHAUFFAGE_PAC: Record<CategorieAnah, CdpFourchette> = {
  bleu: { bas: 4000, haut: 5000 },
  jaune: { bas: 4000, haut: 5000 },
  violet: { bas: 2500, haut: 4000 },
  rose: { bas: 2500, haut: 4000 },
}

export const CDP_CHAUFFAGE_BIOMASSE: Record<CategorieAnah, CdpFourchette> = {
  bleu: { bas: 4000, haut: 5000 },
  jaune: { bas: 4000, haut: 5000 },
  violet: { bas: 2500, haut: 4000 },
  rose: { bas: 2500, haut: 4000 },
}

export const CDP_RENOV_AMPLEUR_PLANCHER = 3500

export interface SurfaceAmpleurBucket {
  maxSurface: number
  facteur: number
}
export const CDP_RENOV_AMPLEUR_FACTEURS_SURFACE: SurfaceAmpleurBucket[] = [
  { maxSurface: 50, facteur: 1.0 },
  { maxSurface: 100, facteur: 1.5 },
  { maxSurface: 150, facteur: 2.0 },
  { maxSurface: Infinity, facteur: 2.5 },
]

// =============================================================================
// 8. Matrice de non-cumul CEE (doc 07 §8)
// =============================================================================

export const CEE_NON_CUMUL_PAIRES: ReadonlyArray<readonly [string, string]> = [
  ['BAR-TH-148', 'BAR-TH-171'],
  ['BAR-TH-148', 'BAR-TH-172'],
  ['BAR-TH-143', 'BAR-TH-171'],
  ['BAR-TH-143', 'BAR-TH-172'],
  ['BAR-TH-143', 'BAR-TH-113'],
]

// =============================================================================
// 7. Zones climatiques H1/H2/H3 (doc 07 §7)
// =============================================================================

const H1_DEPTS: readonly string[] = [
  '02',
  '08',
  '10',
  '51',
  '52',
  '54',
  '55',
  '57',
  '59',
  '60',
  '62',
  '67',
  '68',
  '70',
  '88',
  '89',
  '90',
  '05',
  '73',
  '74',
  '975',
]

const H2_DEPTS: readonly string[] = [
  '01',
  '03',
  '04',
  '06',
  '07',
  '09',
  '11',
  '12',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '31',
  '32',
  '33',
  '35',
  '36',
  '37',
  '38',
  '39',
  '40',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  '47',
  '48',
  '49',
  '50',
  '53',
  '56',
  '58',
  '61',
  '63',
  '64',
  '65',
  '69',
  '71',
  '72',
  '75',
  '76',
  '77',
  '78',
  '79',
  '80',
  '81',
  '82',
  '84',
  '85',
  '86',
  '87',
  '91',
  '92',
  '93',
  '94',
  '95',
  '2A',
  '2B',
]

const H3_DEPTS: readonly string[] = [
  '13',
  '30',
  '34',
  '66',
  '83',
  '971',
  '972',
  '973',
  '974',
  '976',
]

const IDF_DEPTS: readonly string[] = ['75', '77', '78', '91', '92', '93', '94', '95']

function buildZoneByDept(): Readonly<Record<string, ZoneClimatique>> {
  const map: Record<string, ZoneClimatique> = {}
  for (const d of H1_DEPTS) map[d] = 'H1'
  for (const d of H2_DEPTS) map[d] = 'H2'
  for (const d of H3_DEPTS) map[d] = 'H3'
  return map
}

export const ZONE_BY_DEPT: Readonly<Record<string, ZoneClimatique>> = buildZoneByDept()

export interface ZoneLookup {
  zone: ZoneClimatique
  idf: boolean
  dept: string
  warning?: string
}

/**
 * Résout un code postal français en zone climatique + flag IdF.
 * Fallback H3 avec warning si département inconnu.
 */
export function zoneFromCodePostal(cp: string): ZoneLookup {
  if (cp.length !== 5 || !/^[0-9]{5}$/.test(cp)) {
    return { zone: 'H3', idf: false, dept: '', warning: 'Code postal invalide, zone H3 par défaut' }
  }
  const dept = cp.startsWith('97') ? cp.slice(0, 3) : cp.slice(0, 2)
  const zone = ZONE_BY_DEPT[dept]
  if (!zone) {
    return { zone: 'H3', idf: false, dept, warning: 'Département inconnu, zone H3 par défaut' }
  }
  const idf = IDF_DEPTS.includes(dept)
  return { zone, idf, dept }
}

/** Indique si un département est en Île-de-France. */
export function isIdf(dept: string): boolean {
  return IDF_DEPTS.includes(dept)
}

// =============================================================================
// 9. Disclaimer légal (doc 07 §9)
// =============================================================================

export const DISCLAIMER_LEGAL =
  'Estimation indicative non contractuelle. Le montant final dépend du devis RGE, de votre avis d\u2019imposition et du cours du kWhc. Barèmes version 2026-01 du 14/04/2026.'

// =============================================================================
// BAREMES_2026_01 — objet agrégé (doc archi §3.3)
// =============================================================================
//
// Cet objet regroupe tous les barèmes sous forme d'une structure sérialisable
// (compatible jsonb) pour :
//   - insertion dans la table `baremes_versions` (Supabase)
//   - reconstruction d'une estimation < 30s (traçabilité §7 doc archi)
//
// Les barèmes granulaires ci-dessus restent exportés pour un usage direct
// par le moteur de calcul (`engine/*`).
// =============================================================================

export interface BaremesSnapshot {
  readonly version: string
  readonly effectiveFrom: string
  readonly sourceDoc: string

  readonly plafondsAnah: {
    readonly horsIdf: {
      readonly byFoyer: Readonly<Record<number, PlafondsAnahRow>>
      readonly perPersonSupplementaire: PlafondsAnahRow
    }
    readonly idf: {
      readonly byFoyer: Readonly<Record<number, PlafondsAnahRow>>
      readonly perPersonSupplementaire: PlafondsAnahRow
    }
  }

  readonly ecretement: {
    readonly geste: Readonly<Record<CategorieAnah, number | null>>
    readonly accompagne: Readonly<Record<CategorieAnah, number>>
  }

  readonly mprAccompagne: Readonly<Record<CategorieAnah, MprAccompagneTaux>>

  readonly mprGeste: {
    readonly PAC_AIREAU: {
      readonly parCategorie: Readonly<Record<CategorieAnah, number>>
      readonly plafondDepenses: number
    }
    readonly supprimes: ReadonlyArray<GesteId>
  }

  readonly cee: {
    readonly 'BAR-TH-148': {
      readonly meta: typeof BAR_TH_148_META
      readonly kwhc: Readonly<Record<TypeLogement, number>>
    }
    readonly 'BAR-TH-113': {
      readonly meta: typeof BAR_TH_113_META
      readonly kwhcMaison: Readonly<Record<ZoneClimatique, number>>
    }
    readonly 'BAR-TH-143': {
      readonly meta: typeof BAR_TH_143_META
      readonly kwhcMaison: Readonly<Record<ZoneClimatique, number>>
    }
    readonly 'BAR-TH-127': {
      readonly meta: typeof BAR_TH_127_META
      readonly individuel: {
        readonly base: Readonly<Record<ZoneClimatique, number>>
        readonly surfaceFacteurs: ReadonlyArray<SurfaceFactorBucket>
        readonly facteurR: Readonly<Record<VmcRType, number>>
      }
      readonly collectif: {
        readonly parLogement: Readonly<Record<ZoneClimatique, number>>
        readonly facteurR: Readonly<Record<VmcRTypeCollectif, number>>
      }
    }
    readonly 'BAR-TH-171': {
      readonly meta: typeof BAR_TH_171_META
    }
  }

  readonly nonCumul: ReadonlyArray<readonly [string, string]>

  readonly zones: {
    readonly h1: ReadonlyArray<string>
    readonly h2: ReadonlyArray<string>
    readonly h3: ReadonlyArray<string>
    readonly idf: ReadonlyArray<string>
    readonly byDept: Readonly<Record<string, ZoneClimatique>>
  }

  readonly prixEmmyDefault: {
    readonly classique: number
    readonly precarite: number
  }

  readonly disclaimer: string
}

export const BAREMES_2026_01: BaremesSnapshot = {
  version: BAREME_VERSION,
  effectiveFrom: '2026-01-01',
  sourceDoc: 'docs/baremes-sources/07-valeurs-officielles-confirmees-2026-04-14.md',

  plafondsAnah: {
    horsIdf: {
      byFoyer: ANAH_PLAFONDS_HORS_IDF,
      perPersonSupplementaire: ANAH_INCREMENT_HORS_IDF,
    },
    idf: {
      byFoyer: ANAH_PLAFONDS_IDF,
      perPersonSupplementaire: ANAH_INCREMENT_IDF,
    },
  },

  ecretement: {
    geste: ECRETEMENT_GESTE,
    accompagne: ECRETEMENT_ACCOMPAGNE,
  },

  mprAccompagne: MPR_ACCOMPAGNE,

  mprGeste: {
    PAC_AIREAU: {
      parCategorie: MPR_GESTE_PAC_AIREAU,
      plafondDepenses: MPR_GESTE_PLAFOND_DEPENSES,
    },
    supprimes: MPR_GESTE_SUPPRIMES,
  },

  cee: {
    'BAR-TH-148': {
      meta: BAR_TH_148_META,
      kwhc: BAR_TH_148,
    },
    'BAR-TH-113': {
      meta: BAR_TH_113_META,
      kwhcMaison: BAR_TH_113,
    },
    'BAR-TH-143': {
      meta: BAR_TH_143_META,
      kwhcMaison: BAR_TH_143,
    },
    'BAR-TH-127': {
      meta: BAR_TH_127_META,
      individuel: {
        base: BAR_TH_127_INDIV_BASE,
        surfaceFacteurs: BAR_TH_127_SURFACE_FACTEURS,
        facteurR: BAR_TH_127_FACTEUR_R_INDIV,
      },
      collectif: {
        parLogement: BAR_TH_127_COLLECTIF_BASE,
        facteurR: BAR_TH_127_FACTEUR_R_COLLECTIF,
      },
    },
    'BAR-TH-171': {
      meta: BAR_TH_171_META,
    },
  },

  nonCumul: CEE_NON_CUMUL_PAIRES,

  zones: {
    h1: H1_DEPTS,
    h2: H2_DEPTS,
    h3: H3_DEPTS,
    idf: IDF_DEPTS,
    byDept: ZONE_BY_DEPT,
  },

  prixEmmyDefault: {
    classique: CEE_PRIX_CLASSIQUE_DEFAULT,
    precarite: CEE_PRIX_PRECARITE_DEFAULT,
  },

  disclaimer: DISCLAIMER_LEGAL,
}
