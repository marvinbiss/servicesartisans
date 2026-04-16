/**
 * Calcul CEE — fiches BAR-TH-148, BAR-TH-113, BAR-TH-143, BAR-TH-127, BAR-TH-171.
 *
 * Source : docs/baremes-sources/07-*.md §6, §11
 */

import type { BaremeId, TypeLogement, ZoneClimatique } from '../types'
import { asBaremeId } from '../types'
import type { CategorieAnah, SautsDpe } from '../types'
import {
  BAR_TH_148,
  BAR_TH_113,
  BAR_TH_143,
  BAR_TH_127_INDIV_BASE,
  BAR_TH_127_SURFACE_FACTEURS,
  BAR_TH_127_FACTEUR_R_INDIV,
  CEE_PRIX_CLASSIQUE_DEFAULT,
  CEE_PRIX_PRECARITE_DEFAULT,
  CEE_AMPLEUR_BASE,
  CEE_AMPLEUR_SURFACE_FACTEURS,
  MAR_PRISE_EN_CHARGE,
  MAR_PLAFOND_TTC,
  MAR_COUT_MOYEN_TTC,
  type VmcRType,
} from '../baremes/2026-01'

export interface CeeResult {
  kwhCumac: number
  baremeId: BaremeId
}

// ---------- Helpers fourchette prime ----------

function readEnvFloat(key: string, fallback: number): number {
  const raw = typeof process !== 'undefined' ? process.env[key] : undefined
  if (!raw) return fallback
  const n = parseFloat(raw)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

/**
 * Fourchette prime CEE (doc 07 §11.3) :
 * - bas = kWhc × (CEE_PRIX_CLASSIQUE × 0.85 / 1000)  [conversion kWhc → MWhc]
 * - haut = kWhc × (CEE_PRIX_PRECARITE / 1000)
 */
export function fourchettePrime(kwhCumac: number): { bas: number; haut: number } {
  const prixClassique = readEnvFloat('CEE_PRIX_CLASSIQUE', CEE_PRIX_CLASSIQUE_DEFAULT)
  const prixPrecarite = readEnvFloat('CEE_PRIX_PRECARITE', CEE_PRIX_PRECARITE_DEFAULT)
  const mwhc = kwhCumac / 1000
  return {
    bas: Math.round(mwhc * prixClassique * 0.85),
    haut: Math.round(mwhc * prixPrecarite),
  }
}

// ---------- BAR-TH-148 : CET ----------

export function calcBarTh148(typeLogement: TypeLogement): CeeResult {
  const kwhCumac = BAR_TH_148[typeLogement]
  const key = typeLogement === 'maison' ? 'MI' : 'APPART'
  return {
    kwhCumac,
    baremeId: asBaremeId(`CEE.BAR-TH-148.${key}.2026-01`),
  }
}

// ---------- BAR-TH-113 : biomasse ----------

export function calcBarTh113(zone: ZoneClimatique): CeeResult {
  return {
    kwhCumac: BAR_TH_113[zone],
    baremeId: asBaremeId(`CEE.BAR-TH-113.${zone}.MAISON.2026-01`),
  }
}

// ---------- BAR-TH-143 : SSC ----------

export function calcBarTh143(zone: ZoneClimatique): CeeResult {
  return {
    kwhCumac: BAR_TH_143[zone],
    baremeId: asBaremeId(`CEE.BAR-TH-143.${zone}.MAISON.2026-01`),
  }
}

// ---------- BAR-TH-127 : VMC simple flux (individuelle) ----------

function facteurSurface(surface: number): number {
  for (const bucket of BAR_TH_127_SURFACE_FACTEURS) {
    if (surface < bucket.max) return bucket.facteur
  }
  return BAR_TH_127_SURFACE_FACTEURS[BAR_TH_127_SURFACE_FACTEURS.length - 1].facteur
}

export function calcVMCSimpleFlux(
  zone: ZoneClimatique,
  surface: number,
  rType: VmcRType
): CeeResult {
  const base = BAR_TH_127_INDIV_BASE[zone]
  const fS = facteurSurface(surface)
  const fR = BAR_TH_127_FACTEUR_R_INDIV[rType]
  const kwhCumac = Math.round(base * fS * fR)
  return {
    kwhCumac,
    baremeId: asBaremeId(`CEE.BAR-TH-127.${zone}.INDIV.2026-01`),
  }
}

// ---------- BAR-TH-171 : PAC air/eau (formule variable) ----------

export type EtasClass = 1 | 2
export type SurfBucketMaison = 'S_LT_70' | 'S_70_90' | 'S_GTE_90'
export type SurfBucketAppart = 'S_LT_35' | 'S_35_60' | 'S_GTE_60'

/**
 * BAR-TH-171 — table approximative par (zone × type × ETAS × tranche surface).
 *
 * ⚠️ APPROXIMATION NON OPPOSABLE — en attendant extraction du PDF DGEC vA78.4
 * (arrêté 15/12/2025). Point de calibration unique : Argile.ai indique
 * Maison H1, 80 m² (tranche 70-90), ETAS 142 % (classe 2), remplacement gaz,
 * Coup de Pouce actif → 458 MWhc. Les valeurs MAISON.H1.ETAS2.S_70_90
 * ci-dessous sont calées sur ce point. Toutes les autres dérivent par
 * ratio ordinal (H1 > H2 > H3, ETAS2 > ETAS1, plus grand > plus petit).
 *
 * Mode strict : positionner BAR_TH_171_STRICT_MODE=true en prod pour que
 * cette fonction throw au lieu de renvoyer un approximé — utile tant que
 * la table exacte n'est pas intégrée.
 *
 * Les baremeIds portent le suffixe `.APPROX.` pour que le back-office
 * et l'audit traçabilité sachent identifier ces calculs comme non exacts.
 */
const BAR_TH_171_MAISON: Record<
  ZoneClimatique,
  Record<EtasClass, Record<SurfBucketMaison, number>>
> = {
  H1: {
    1: { S_LT_70: 260_000, S_70_90: 370_000, S_GTE_90: 430_000 },
    2: { S_LT_70: 320_000, S_70_90: 458_000, S_GTE_90: 540_000 },
  },
  H2: {
    1: { S_LT_70: 215_000, S_70_90: 305_000, S_GTE_90: 360_000 },
    2: { S_LT_70: 265_000, S_70_90: 378_000, S_GTE_90: 445_000 },
  },
  H3: {
    1: { S_LT_70: 155_000, S_70_90: 220_000, S_GTE_90: 260_000 },
    2: { S_LT_70: 190_000, S_70_90: 273_000, S_GTE_90: 320_000 },
  },
}

const BAR_TH_171_APPART: Record<
  ZoneClimatique,
  Record<EtasClass, Record<SurfBucketAppart, number>>
> = {
  H1: {
    1: { S_LT_35: 115_000, S_35_60: 165_000, S_GTE_60: 210_000 },
    2: { S_LT_35: 140_000, S_35_60: 205_000, S_GTE_60: 260_000 },
  },
  H2: {
    1: { S_LT_35: 95_000, S_35_60: 135_000, S_GTE_60: 175_000 },
    2: { S_LT_35: 115_000, S_35_60: 170_000, S_GTE_60: 215_000 },
  },
  H3: {
    1: { S_LT_35: 68_000, S_35_60: 98_000, S_GTE_60: 125_000 },
    2: { S_LT_35: 83_000, S_35_60: 122_000, S_GTE_60: 155_000 },
  },
}

function surfBucketMaison(surface: number): SurfBucketMaison {
  if (surface < 70) return 'S_LT_70'
  if (surface < 90) return 'S_70_90'
  return 'S_GTE_90'
}

function surfBucketAppart(surface: number): SurfBucketAppart {
  if (surface < 35) return 'S_LT_35'
  if (surface < 60) return 'S_35_60'
  return 'S_GTE_60'
}

export function computeBarTh171(
  zone: ZoneClimatique,
  etasClass: EtasClass,
  surface: number,
  typeLogement: TypeLogement
): CeeResult {
  const strict = process.env.BAR_TH_171_STRICT_MODE === 'true'
  if (strict) {
    throw new Error(
      'BAR-TH-171: table exacte PDF DGEC vA78.4 non intégrée, mode strict activé'
    )
  }

  let kwhCumac: number
  let surfBucket: string
  if (typeLogement === 'maison') {
    const bucket = surfBucketMaison(surface)
    surfBucket = bucket
    kwhCumac = BAR_TH_171_MAISON[zone][etasClass][bucket]
  } else {
    const bucket = surfBucketAppart(surface)
    surfBucket = bucket
    kwhCumac = BAR_TH_171_APPART[zone][etasClass][bucket]
  }

  // eslint-disable-next-line no-console
  console.warn?.(
    `[BAR-TH-171] valeur approximative (${kwhCumac} kWhc) — calibrée sur point Argile.ai, non opposable tant que table PDF DGEC vA78.4 non intégrée`
  )

  const typeKey = typeLogement === 'maison' ? 'MAISON' : 'APPART'
  return {
    kwhCumac,
    baremeId: asBaremeId(
      `CEE.BAR-TH-171.${zone}.${typeKey}.ETAS${etasClass}.${surfBucket}.APPROX.2026-01`
    ),
  }
}

// ---------- CEE rénovation d'ampleur (parcours accompagné) ----------

export interface CeeAmpleurResult {
  montant: number
  base: number
  facteurSurface: number
  baremeId: BaremeId
}

/**
 * CEE rénovation d'ampleur — parcours accompagné.
 * Source : CEE.publicodes `CEE . rénovation d'ampleur`.
 *
 * Montant = base(sauts) × facteur correctif(surface).
 */
export function calcCeeAmpleur(sautsDpe: SautsDpe, surface: number): CeeAmpleurResult {
  const sautsKey = sautsDpe >= 4 ? 4 : sautsDpe
  const base = CEE_AMPLEUR_BASE[sautsKey as SautsDpe]

  let facteurSurface = 1.0
  for (const bucket of CEE_AMPLEUR_SURFACE_FACTEURS) {
    if (surface < bucket.max) {
      facteurSurface = bucket.facteur
      break
    }
  }

  const montant = Math.round(base * facteurSurface)
  return {
    montant,
    base,
    facteurSurface,
    baremeId: asBaremeId(`CEE.AMPLEUR.${sautsKey}SAUTS.S${Math.round(surface)}.2026-01`),
  }
}

// ---------- Prise en charge MAR ----------

export interface MarResult {
  montant: number
  taux: number
  baremeId: BaremeId
}

/**
 * Prise en charge de Mon Accompagnateur Rénov' par l'État.
 * Source : MPRA.publicodes `MPR . accompagnée . prise en charge MAR`.
 *
 * Taux × min(coût moyen, plafond TTC).
 */
export function calcMarPriseEnCharge(categorie: CategorieAnah): MarResult {
  const taux = MAR_PRISE_EN_CHARGE[categorie]
  const coutMAR = Math.min(MAR_COUT_MOYEN_TTC, MAR_PLAFOND_TTC)
  const montant = Math.round(coutMAR * taux)
  return {
    montant,
    taux,
    baremeId: asBaremeId(`MAR.${categorie.toUpperCase()}.2026-01`),
  }
}

// ---------- Dispatcher par ficheId (utile pour pipeline) ----------

export type CeeFicheId = 'BAR-TH-148' | 'BAR-TH-113' | 'BAR-TH-143' | 'BAR-TH-127' | 'BAR-TH-171'

export interface CeeFicheParams {
  zone?: ZoneClimatique
  typeLogement?: TypeLogement
  surface?: number
  rType?: VmcRType
  etasClass?: EtasClass
}

export function calcCEEFiche(ficheId: CeeFicheId, params: CeeFicheParams): CeeResult {
  switch (ficheId) {
    case 'BAR-TH-148':
      if (!params.typeLogement) throw new Error('BAR-TH-148 requiert typeLogement')
      return calcBarTh148(params.typeLogement)
    case 'BAR-TH-113':
      if (!params.zone) throw new Error('BAR-TH-113 requiert zone')
      return calcBarTh113(params.zone)
    case 'BAR-TH-143':
      if (!params.zone) throw new Error('BAR-TH-143 requiert zone')
      return calcBarTh143(params.zone)
    case 'BAR-TH-127':
      if (!params.zone || params.surface === undefined || !params.rType) {
        throw new Error('BAR-TH-127 requiert zone, surface, rType')
      }
      return calcVMCSimpleFlux(params.zone, params.surface, params.rType)
    case 'BAR-TH-171':
      if (
        !params.zone ||
        !params.etasClass ||
        params.surface === undefined ||
        !params.typeLogement
      ) {
        throw new Error('BAR-TH-171 requiert zone, etasClass, surface, typeLogement')
      }
      return computeBarTh171(params.zone, params.etasClass, params.surface, params.typeLogement)
  }
}
