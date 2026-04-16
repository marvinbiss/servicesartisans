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
  MPR_GESTE_PAC_GEOTHERMIE,
  MPR_GESTE_CET,
  MPR_GESTE_CESI,
  MPR_GESTE_POELE_GRANULES,
  MPR_GESTE_POELE_BUCHES,
  MPR_GESTE_VMC_2FLUX,
  MPR_GESTE_AUDIT_ENERGETIQUE,
  MPR_GESTE_SUPPRIMES,
  MPR_GESTE_UNCONFIRMED,
  MPR_GESTE_NEEDS_SURFACE,
  MPR_ACCOMPAGNE,
  MPR_GESTE_PLAFOND_DEPENSES,
  MPR_ACCOMPAGNE_PLAFOND_HT,
} from '../baremes/2026-01'
import { logger } from '@/lib/logger'

type UnconfirmedGeste = (typeof MPR_GESTE_UNCONFIRMED)[number]
type NeedsSurfaceGeste = (typeof MPR_GESTE_NEEDS_SURFACE)[number]

const GESTE_FORFAITS: Partial<Record<GesteId, Record<CategorieAnah, number>>> = {
  PAC_AIREAU: MPR_GESTE_PAC_AIREAU,
  PAC_GEOTHERMIE: MPR_GESTE_PAC_GEOTHERMIE,
  CET: MPR_GESTE_CET,
  CESI: MPR_GESTE_CESI,
  POELE_GRANULES: MPR_GESTE_POELE_GRANULES,
  POELE_BUCHES: MPR_GESTE_POELE_BUCHES,
  VMC_2FLUX: MPR_GESTE_VMC_2FLUX,
  AUDIT_ENERGETIQUE: MPR_GESTE_AUDIT_ENERGETIQUE,
}

function isUnconfirmed(g: GesteId): g is UnconfirmedGeste {
  return (MPR_GESTE_UNCONFIRMED as ReadonlyArray<string>).includes(g)
}

function isNeedsSurface(g: GesteId): g is NeedsSurfaceGeste {
  return (MPR_GESTE_NEEDS_SURFACE as ReadonlyArray<string>).includes(g)
}

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
 * Règles (doc 01 §70-120, sources economie.gouv.fr / service-public.gouv.fr) :
 * - Rose → forfait = 0 systématiquement (non éligible parcours geste)
 * - SUPPRIMES (BIOMASSE, ITE, ITI) → 0 €, baremeId `.SUPPRIME.`, warning loggué
 * - NEEDS_SURFACE (ISO_TOITURE_*, ISO_PLANCHERS_BAS) → 0 €, baremeId `.NEEDS_SURFACE.`,
 *   warning loggué (TODO : input `surfaceIsolation_m2` requis)
 * - UNCONFIRMED (CESI, POELE_BUCHES) → forfait appliqué, baremeId `.UNCONFIRMED.`
 *   (back-office sait que la valeur est à confirmer par arrêté)
 * - Autres gestes avec forfait défini (PAC_AIREAU, PAC_GEOTHERMIE, CET, POELE_GRANULES,
 *   VMC_2FLUX, AUDIT_ENERGETIQUE) → forfait standard, baremeId `2026-01`
 * - Gestes inconnus (ex: SSC, MENUISERIES, VMC_SF, ISOLATION_MURS/TOITURE/PLANCHER legacy)
 *   → 0 €, baremeId `.STUB.` (à implémenter)
 */
export function calcMPRGeste(gestes: GesteId[], categorie: CategorieAnah): MprGesteResult {
  const breakdown: MprGesteBreakdownItem[] = []
  let total = 0
  const catU = categorieUpper(categorie)

  for (const g of gestes) {
    // 1. Gestes supprimés du parcours geste depuis 01/01/2026
    if (MPR_GESTE_SUPPRIMES.includes(g)) {
      logger.warn(`MPR monogeste supprimée pour ${g} depuis 01/01/2026 — forfait 0 appliqué.`, {
        action: 'calcMPRGeste',
        geste: g,
      })
      breakdown.push({
        geste: g,
        forfait: 0,
        baremeId: asBaremeId(`MPR.${g}.${catU}.SUPPRIME.2026-01`),
      })
      continue
    }

    // 2. Rose : non éligible parcours geste → 0 quelle que soit la nature du geste
    if (categorie === 'rose') {
      breakdown.push({
        geste: g,
        forfait: 0,
        baremeId: asBaremeId(`MPR.${g}.ROSE.NON_ELIGIBLE.2026-01`),
      })
      continue
    }

    // 3. Gestes nécessitant une surface d'isolation (€/m²) — non implémenté
    if (isNeedsSurface(g)) {
      logger.warn(
        `MPR geste ${g} nécessite un input 'surfaceIsolation_m2' non disponible — forfait 0 appliqué.`,
        {
          action: 'calcMPRGeste',
          geste: g,
          todo: 'Ajouter input surfaceIsolation_m2 + barème €/m² par catégorie',
        }
      )
      breakdown.push({
        geste: g,
        forfait: 0,
        baremeId: asBaremeId(`MPR.${g}.${catU}.NEEDS_SURFACE.2026-01`),
      })
      continue
    }

    // 4. Gestes avec forfait défini (incl. UNCONFIRMED)
    const table = GESTE_FORFAITS[g]
    if (table) {
      const forfait = table[categorie]
      total += forfait
      const suffix = isUnconfirmed(g) ? '.UNCONFIRMED.2026-01' : '.2026-01'
      breakdown.push({
        geste: g,
        forfait,
        baremeId: asBaremeId(`MPR.${g}.${catU}${suffix}`),
      })
      continue
    }

    // 5. Geste inconnu / non implémenté → stub
    breakdown.push({
      geste: g,
      forfait: 0,
      baremeId: asBaremeId(`MPR.${g}.${catU}.STUB.2026-01`),
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
  /** Budget HT après application du plafond par sauts DPE. */
  budgetPlafonne: number
  /** Plafond HT applicable selon sauts DPE. */
  plafondHt: number
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
 * Le taux est appliqué au budget HT **plafonné** par sauts DPE
 * (MPRA.publicodes `projet.travaux.plafonnés`).
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

  // Plafond de dépenses éligibles selon le nombre de sauts DPE
  const plafondKey = sautsDpe >= 4 ? 4 : sautsDpe
  const plafondHt = MPR_ACCOMPAGNE_PLAFOND_HT[plafondKey as SautsDpe]
  const budgetPlafonne = Math.min(budgetHt, plafondHt)

  const total = Math.round(budgetPlafonne * taux)
  return {
    total,
    taux,
    budgetPlafonne,
    plafondHt,
    baremeId: asBaremeId(`MPR.ACCOMPAGNE.${categorieUpper(categorie)}.${sautsDpe}SAUTS.2026-01`),
  }
}
