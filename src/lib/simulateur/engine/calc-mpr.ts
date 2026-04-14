/**
 * Calcul MaPrimeRénov' — parcours geste + parcours accompagné.
 *
 * Source :
 * - docs/baremes-sources/07-*.md §3, §5
 * - docs/baremes-sources/01-maprimerenov-2026.md
 *
 * ⚠️ BAR-TH-113 biomasse : MPR monogeste SUPPRIMÉE depuis 01/01/2026
 *    → forfait 0 en parcours geste, warning loggué.
 */

import type { BaremeId, CategorieAnah, GesteId, SautsDpe } from '../types'
import { asBaremeId } from '../types'
import {
  MPR_GESTE_PAC_AIREAU,
  MPR_GESTE_SUPPRIMES,
  MPR_ACCOMPAGNE,
  MPR_GESTE_PLAFOND_DEPENSES,
} from '../baremes/2026-01'
import { logger } from '@/lib/logger'

export interface MprGesteBreakdownItem {
  geste: GesteId
  forfait: number
  baremeId: BaremeId
}

export interface MprGesteResult {
  total: number
  breakdown: MprGesteBreakdownItem[]
}

function categorieUpper(cat: CategorieAnah): string {
  return cat.toUpperCase()
}

/**
 * Calcule MPR parcours geste pour un ensemble de gestes retenus.
 *
 * Règles :
 * - PAC_AIREAU : forfait selon catégorie (doc 07 §5)
 * - BIOMASSE : 0 € (supprimée depuis 01/01/2026), warning loggué
 * - Autres gestes : 0 € pour l'instant (barèmes à ajouter par P1)
 */
export function calcMPRGeste(gestes: GesteId[], categorie: CategorieAnah): MprGesteResult {
  const breakdown: MprGesteBreakdownItem[] = []
  let total = 0

  for (const g of gestes) {
    if (MPR_GESTE_SUPPRIMES.includes(g)) {
      logger.warn(`MPR monogeste supprimée pour ${g} depuis 01/01/2026 — forfait 0 appliqué.`, {
        action: 'calcMPRGeste',
        geste: g,
      })
      breakdown.push({
        geste: g,
        forfait: 0,
        baremeId: asBaremeId(`MPR.${g}.${categorieUpper(categorie)}.SUPPRIME.2026-01`),
      })
      continue
    }

    if (g === 'PAC_AIREAU') {
      const forfait = MPR_GESTE_PAC_AIREAU[categorie]
      total += forfait
      breakdown.push({
        geste: g,
        forfait,
        baremeId: asBaremeId(`MPR.PAC_AIREAU.${categorieUpper(categorie)}.2026-01`),
      })
      continue
    }

    // Gestes sans forfait MPR défini (stub — P1 owner)
    breakdown.push({
      geste: g,
      forfait: 0,
      baremeId: asBaremeId(`MPR.${g}.${categorieUpper(categorie)}.STUB.2026-01`),
    })
  }

  return { total, breakdown }
}

/**
 * Plafond dépenses éligibles MPR (parcours geste).
 * Exposé pour usage dans pipeline si nécessaire.
 */
export { MPR_GESTE_PLAFOND_DEPENSES }

export interface MprAccompagneResult {
  total: number
  taux: number
  baremeId: BaremeId
}

/**
 * Calcule MPR parcours accompagné.
 *
 * Taux :
 * - Bleu : 60→80 % selon gain DPE (2 sauts = 60 %, 3 sauts = 70 %, ≥4 sauts = 80 %)
 * - Jaune : 40→60 % selon gain DPE (2 sauts = 40 %, 3 sauts = 50 %, ≥4 sauts = 60 %)
 * - Violet : 45 % (constant)
 * - Rose : 10 % (constant)
 *
 * Le taux est appliqué au budget HT.
 */
export function calcMPRAccompagne(
  budgetHt: number,
  categorie: CategorieAnah,
  sautsDpe: SautsDpe
): MprAccompagneResult {
  const conf = MPR_ACCOMPAGNE[categorie]
  let taux = conf.min

  if (categorie === 'bleu' || categorie === 'jaune') {
    // Interpolation linéaire sur 2..4 sauts
    if (sautsDpe >= 4) taux = conf.max
    else if (sautsDpe === 3) taux = (conf.min + conf.max) / 2
    else taux = conf.min
  } else {
    taux = conf.min // violet/rose : min = max
  }

  const total = Math.round(budgetHt * taux)
  return {
    total,
    taux,
    baremeId: asBaremeId(`MPR.ACCOMPAGNE.${categorieUpper(categorie)}.2026-01`),
  }
}
