/**
 * Logique de déduction objectif → gestes / parcours / budget.
 *
 * Le stepper V2 ne demande plus les gestes techniques ni le budget.
 * Ce module déduit automatiquement les paramètres du pipeline à partir
 * de l'objectif simple choisi par l'utilisateur.
 */

import type { EquipementActuel, GesteId, Parcours, SautsDpe } from './types'

// ---------- Types ----------

export type Objectif = 'chauffage' | 'isolation' | 'renovation_complete'
export type SurfaceTranche = 'lt50' | '50_100' | '100_150' | 'gt150'

export interface DeductionInput {
  objectif: Objectif
  surfaceTranche: SurfaceTranche
  residencePrincipale: boolean
  equipementActuel?: EquipementActuel
}

export interface DeductionResult {
  parcours: Parcours
  gestes: GesteId[]
  sautsDpe?: SautsDpe
  coupDePouce: boolean
  equipementActuel: EquipementActuel
  budgetHt: number
  surface: number
}

// ---------- Constantes ----------

/** Surface milieu de tranche pour le calcul. */
const SURFACE_MID: Record<SurfaceTranche, number> = {
  lt50: 35,
  '50_100': 75,
  '100_150': 125,
  gt150: 175,
}

/** Coûts moyens HT par geste (€ forfait ou €/m²). */
const COUT_FORFAIT: Partial<Record<GesteId, number>> = {
  PAC_AIREAU: 12_000,
  PAC_GEOTHERMIE: 22_000,
  VMC_2FLUX: 4_500,
  POELE_GRANULES: 5_000,
  CET: 3_500,
  AUDIT_ENERGETIQUE: 800,
}

const COUT_M2: Partial<Record<GesteId, number>> = {
  ISOLATION_MURS: 80,
  ISOLATION_TOITURE: 55,
  ISOLATION_PLANCHER: 40,
}

// ---------- Déduction ----------

function estimateBudget(gestes: GesteId[], surface: number): number {
  let total = 0
  for (const g of gestes) {
    if (COUT_FORFAIT[g]) {
      total += COUT_FORFAIT[g]
    } else if (COUT_M2[g]) {
      total += COUT_M2[g] * surface
    }
  }
  return Math.max(total, 1_000) // budgetSchema exige min 1000
}

export function deduceSimulationParams(input: DeductionInput): DeductionResult {
  const surface = SURFACE_MID[input.surfaceTranche]
  const equip = input.equipementActuel ?? 'autre'

  switch (input.objectif) {
    case 'chauffage': {
      const gestes: GesteId[] = ['PAC_AIREAU']
      return {
        parcours: 'geste',
        gestes,
        coupDePouce: equip === 'gaz' || equip === 'fioul' || equip === 'charbon',
        equipementActuel: equip,
        budgetHt: estimateBudget(gestes, surface),
        surface,
      }
    }
    case 'isolation': {
      const gestes: GesteId[] = ['ISOLATION_MURS', 'ISOLATION_TOITURE']
      return {
        parcours: 'geste',
        gestes,
        coupDePouce: false,
        equipementActuel: equip,
        budgetHt: estimateBudget(gestes, surface),
        surface,
      }
    }
    case 'renovation_complete': {
      const gestes: GesteId[] = [
        'PAC_AIREAU',
        'ISOLATION_MURS',
        'ISOLATION_TOITURE',
        'VMC_2FLUX',
      ]
      return {
        parcours: 'accompagne',
        gestes,
        sautsDpe: 2,
        coupDePouce: input.residencePrincipale,
        equipementActuel: equip,
        budgetHt: estimateBudget(gestes, surface),
        surface,
      }
    }
  }
}

export { SURFACE_MID }
