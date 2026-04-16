/**
 * Calcul CEE — fiches BAR-TH-148, BAR-TH-113, BAR-TH-143, BAR-TH-127, BAR-TH-171.
 *
 * Source : docs/baremes-sources/07-*.md §6, §11
 */

import type { BaremeId, EquipementActuel, TypeLogement, ZoneClimatique } from '../types'
import { asBaremeId } from '../types'
import type { CategorieAnah, SautsDpe } from '../types'
import {
  BAR_TH_148,
  BAR_TH_113,
  BAR_TH_143,
  BAR_TH_127_INDIV_BASE,
  BAR_TH_127_SURFACE_FACTEURS,
  BAR_TH_127_FACTEUR_R_INDIV,
  BAR_TH_171_MONTANT_BASE,
  BAR_TH_171_COEFF_SURFACE_MAISON,
  BAR_TH_171_COEFF_SURFACE_APPART,
  BAR_TH_171_COEFF_ZONE,
  BAR_EN_101,
  BAR_EN_102,
  BAR_EN_103,
  CEE_PRIX_CLASSIQUE_DEFAULT,
  CEE_PRIX_PRECARITE_DEFAULT,
  CEE_AMPLEUR_BASE,
  CEE_AMPLEUR_SURFACE_FACTEURS,
  MAR_PRISE_EN_CHARGE,
  MAR_PLAFOND_TTC,
  MAR_COUT_MOYEN_TTC,
  type VmcRType,
  type EnergieChauffage,
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

// ---------- BAR-TH-171 : PAC air/eau (formule officielle vA78.4) ----------

export type EtasClass = 1 | 2

/**
 * BAR-TH-171 — Formule officielle vA78.4 (arrêté 15/12/2025).
 * kWhc = montant_de_base × coefficient_surface × coefficient_zone
 *
 * Source : fiche BAR-TH-171 vA78.4 (PDF DGEC), Legifrance JORFTEXT000053043176
 * Validé par cross-check : maison H1, 80m², ETAS2 → 109200 × 0.7 × 1.2 = 91 728 kWhc
 * Avec Coup de Pouce ×5 = 458 640 kWhc ≈ 458 MWhc (point Argile.ai)
 */
export function computeBarTh171(
  zone: ZoneClimatique,
  etasClass: EtasClass,
  surface: number,
  typeLogement: TypeLogement
): CeeResult {
  const base = BAR_TH_171_MONTANT_BASE[typeLogement][etasClass]
  const coeffZone = BAR_TH_171_COEFF_ZONE[zone]

  const surfBuckets = typeLogement === 'maison'
    ? BAR_TH_171_COEFF_SURFACE_MAISON
    : BAR_TH_171_COEFF_SURFACE_APPART
  let coeffSurface = 1.0
  for (const bucket of surfBuckets) {
    if (surface < bucket.max) {
      coeffSurface = bucket.facteur
      break
    }
  }

  const kwhCumac = Math.round(base * coeffSurface * coeffZone)

  const typeKey = typeLogement === 'maison' ? 'MAISON' : 'APPART'
  return {
    kwhCumac,
    baremeId: asBaremeId(
      `CEE.BAR-TH-171.${zone}.${typeKey}.ETAS${etasClass}.S${Math.round(surface)}.2026-01`
    ),
  }
}

// ---------- BAR-EN-101 : Isolation combles / toitures ----------

export function equipToEnergie(equip: EquipementActuel): EnergieChauffage {
  return equip === 'elec' ? 'electricite' : 'combustible'
}

/**
 * BAR-EN-101 — kWhc = forfait_par_m² × surface_isolée
 * Source : fiche BAR-EN-101 vA64-6 (01/01/2025)
 */
export function calcBarEn101(
  zone: ZoneClimatique,
  surfaceIsolee: number,
  energie: EnergieChauffage
): CeeResult {
  const kwhParM2 = BAR_EN_101[zone][energie]
  const kwhCumac = Math.round(kwhParM2 * surfaceIsolee)
  return {
    kwhCumac,
    baremeId: asBaremeId(`CEE.BAR-EN-101.${zone}.${energie.toUpperCase()}.S${Math.round(surfaceIsolee)}.2026-01`),
  }
}

// ---------- BAR-EN-102 : Isolation des murs ----------

/**
 * BAR-EN-102 — kWhc = forfait_par_m² × surface_isolée
 * Source : fiche BAR-EN-102 vA39-5
 */
export function calcBarEn102(
  zone: ZoneClimatique,
  surfaceIsolee: number,
  energie: EnergieChauffage
): CeeResult {
  const kwhParM2 = BAR_EN_102[zone][energie]
  const kwhCumac = Math.round(kwhParM2 * surfaceIsolee)
  return {
    kwhCumac,
    baremeId: asBaremeId(`CEE.BAR-EN-102.${zone}.${energie.toUpperCase()}.S${Math.round(surfaceIsolee)}.2026-01`),
  }
}

// ---------- BAR-EN-103 : Isolation plancher bas ----------

/**
 * BAR-EN-103 — kWhc = forfait_par_m² × surface_isolée
 * Source : fiche BAR-EN-103 vA39-5 (pas de distinction énergie)
 */
export function calcBarEn103(
  zone: ZoneClimatique,
  surfaceIsolee: number
): CeeResult {
  const kwhParM2 = BAR_EN_103[zone]
  const kwhCumac = Math.round(kwhParM2 * surfaceIsolee)
  return {
    kwhCumac,
    baremeId: asBaremeId(`CEE.BAR-EN-103.${zone}.S${Math.round(surfaceIsolee)}.2026-01`),
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

export type CeeFicheId =
  | 'BAR-TH-148' | 'BAR-TH-113' | 'BAR-TH-143' | 'BAR-TH-127' | 'BAR-TH-171'
  | 'BAR-EN-101' | 'BAR-EN-102' | 'BAR-EN-103'

export interface CeeFicheParams {
  zone?: ZoneClimatique
  typeLogement?: TypeLogement
  surface?: number
  surfaceIsolee?: number
  rType?: VmcRType
  etasClass?: EtasClass
  energie?: EnergieChauffage
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
      if (!params.zone || !params.etasClass || params.surface === undefined || !params.typeLogement) {
        throw new Error('BAR-TH-171 requiert zone, etasClass, surface, typeLogement')
      }
      return computeBarTh171(params.zone, params.etasClass, params.surface, params.typeLogement)
    case 'BAR-EN-101':
      if (!params.zone || params.surfaceIsolee === undefined || !params.energie) {
        throw new Error('BAR-EN-101 requiert zone, surfaceIsolee, energie')
      }
      return calcBarEn101(params.zone, params.surfaceIsolee, params.energie)
    case 'BAR-EN-102':
      if (!params.zone || params.surfaceIsolee === undefined || !params.energie) {
        throw new Error('BAR-EN-102 requiert zone, surfaceIsolee, energie')
      }
      return calcBarEn102(params.zone, params.surfaceIsolee, params.energie)
    case 'BAR-EN-103':
      if (!params.zone || params.surfaceIsolee === undefined) {
        throw new Error('BAR-EN-103 requiert zone, surfaceIsolee')
      }
      return calcBarEn103(params.zone, params.surfaceIsolee)
  }
}
