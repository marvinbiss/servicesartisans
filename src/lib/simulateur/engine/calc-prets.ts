/**
 * Calcul éco-PTZ et PAR+ (Prêt Avance Rénovation).
 *
 * Source : service-public.gouv.fr, aide-sociale.fr, betagouv/reno
 *
 * Ces aides sont des PRÊTS (pas des subventions) — le pipeline les affiche
 * séparément des aides directes (MPR, CEE, CDP) et ne les inclut PAS
 * dans le calcul d'écrêtement ni dans le reste à charge subventionné.
 */

import type { BaremeId, CategorieAnah, Parcours } from '../types'
import { asBaremeId } from '../types'
import {
  ECO_PTZ_PLAFONDS,
  ECO_PTZ_DUREE_MAX,
  ECO_PTZ_PLAFOND_CUMULE,
  PAR_CATEGORIES_ELIGIBLES,
  PAR_PLAFONDS,
  PAR_DUREE_TAUX_ZERO_ANS,
  type EcoPtzWorkType,
} from '../baremes/2026-01'

// ---------- Éco-PTZ ----------

export interface EcoPtzResult {
  eligible: boolean
  montantMax: number
  dureeMaxAns: number
  workType: EcoPtzWorkType
  baremeId: BaremeId
}

/**
 * Détermine le type de travaux éco-PTZ à partir du parcours + nombre de gestes.
 */
function resolveEcoPtzWorkType(parcours: Parcours, nbGestes: number): EcoPtzWorkType {
  if (parcours === 'accompagne') {
    return 'renovation_globale'
  }
  if (nbGestes >= 3) return '3_actions'
  if (nbGestes === 2) return '2_actions'
  return '1_action_autre'
}

/**
 * Calcule l'éco-PTZ applicable.
 *
 * Conditions :
 * - Logement ≥ 2 ans (déjà validé par eligibilite.ts)
 * - Résidence principale (déjà validé)
 * - Artisans RGE (non vérifiable ici)
 * - Pas de condition de revenus
 *
 * Parcours accompagné (rénovation globale) : max 50 000 €, 20 ans
 * Parcours geste : 15 000 → 30 000 € selon nombre d'actions, 15 ans
 */
export function calcEcoPtz(
  parcours: Parcours,
  nbGestesRetenus: number,
): EcoPtzResult {
  const workType = resolveEcoPtzWorkType(parcours, nbGestesRetenus)
  const montantMax = ECO_PTZ_PLAFONDS[workType]
  const dureeMaxAns = ECO_PTZ_DUREE_MAX[workType]

  return {
    eligible: nbGestesRetenus > 0,
    montantMax,
    dureeMaxAns,
    workType,
    baremeId: asBaremeId(`ECO-PTZ.${workType.toUpperCase()}.2026-01`),
  }
}

/** Plafond cumulé exposé pour info. */
export const ECO_PTZ_CUMUL_MAX = ECO_PTZ_PLAFOND_CUMULE

// ---------- PAR+ (Prêt Avance Rénovation) ----------

export interface ParResult {
  eligible: boolean
  montantMax: number
  dureeTauxZeroAns: number
  workType: EcoPtzWorkType
  baremeId: BaremeId
}

/**
 * Calcule le PAR+ applicable.
 *
 * Conditions :
 * - Catégorie bleu ou jaune uniquement
 * - Mêmes plafonds que éco-PTZ
 * - Remboursement au moment de la mutation (vente/succession)
 * - Taux 0 % pendant 10 ans (État), puis taux contractuel
 */
export function calcPar(
  categorie: CategorieAnah,
  parcours: Parcours,
  nbGestesRetenus: number,
): ParResult {
  const eligible = PAR_CATEGORIES_ELIGIBLES.includes(categorie) && nbGestesRetenus > 0
  const workType = resolveEcoPtzWorkType(parcours, nbGestesRetenus)
  const montantMax = eligible ? PAR_PLAFONDS[workType] : 0

  return {
    eligible,
    montantMax,
    dureeTauxZeroAns: PAR_DUREE_TAUX_ZERO_ANS,
    workType,
    baremeId: asBaremeId(`PAR.${categorie.toUpperCase()}.${workType.toUpperCase()}.2026-01`),
  }
}
