/**
 * Calculator MaPrimeRénov' 2026 — fonctions pures.
 *
 * Zéro I/O, zéro LLM. Ground-truth pour :
 *   1. Critic YMYL (Ralph 8) — compare output LLM vs ce calculator
 *   2. Promptfoo eval (Ralph 7) — gold cases auto-vérifiables
 *   3. MCP tool `get_bareme_mpr` (Ralph 11)
 *   4. Simulateur SA `/simulateur-aides-renovation` (migration sprint séparé)
 */

import type {
  BaremeResult,
  EligibilityInput,
  EligibilityResult,
  MenageCategorie,
  PlafondRevenusEntry,
} from './types'
import { getBaremeEntry, getPlafonds } from './bareme-mpr-2026'

function applyStepIncrement(base: PlafondRevenusEntry, nbPersonnes: number): PlafondRevenusEntry {
  if (nbPersonnes <= 5 || !base.stepIncrement) return base
  const extras = nbPersonnes - 5
  return {
    ...base,
    tresModesteMax: base.tresModesteMax + extras * base.stepIncrement,
    modesteMax: base.modesteMax + extras * base.stepIncrement,
    intermediaireMax: base.intermediaireMax + extras * base.stepIncrement,
  }
}

export function determineMenageCategorie(input: EligibilityInput): MenageCategorie | null {
  if (!Number.isFinite(input.rfr) || input.rfr < 0) return null
  if (!Number.isFinite(input.nbPersonnes) || input.nbPersonnes < 1) return null

  const plafondsBase = getPlafonds(input.zone, input.nbPersonnes)
  if (!plafondsBase) return null

  const plafonds = applyStepIncrement(plafondsBase, input.nbPersonnes)

  if (input.rfr <= plafonds.tresModesteMax) return 'tres_modeste'
  if (input.rfr <= plafonds.modesteMax) return 'modeste'
  if (input.rfr <= plafonds.intermediaireMax) return 'intermediaire'
  return 'superieur'
}

export function computeMprAmount(input: EligibilityInput): BaremeResult {
  const menageCategorie = determineMenageCategorie(input)
  if (!menageCategorie) {
    return {
      eligible: false,
      reason: `Aucun barème applicable pour zone ${input.zone} nbPersonnes ${input.nbPersonnes} rfr ${input.rfr}`,
      sourceRef: 'ANAH_MAPRIMERENOV',
    }
  }

  const entry = getBaremeEntry(input.geste, menageCategorie)
  if (!entry) {
    return {
      eligible: false,
      reason: `Aucune entrée barème pour geste ${input.geste} catégorie ${menageCategorie}`,
      sourceRef: 'ANAH_MAPRIMERENOV',
    }
  }

  if (entry.amountEUR === null) {
    return {
      eligible: false,
      reason: entry.notes ?? `Combinaison non éligible MaPrimeRénov (valeur null)`,
      sourceRef: entry.sourceRef,
    }
  }

  if (entry.amountEUR === 0) {
    const isSuperieur = menageCategorie === 'superieur'
    return {
      eligible: false,
      reason:
        entry.notes ??
        (isSuperieur
          ? `Ménage catégorie supérieure exclu du Parcours par geste depuis recentrage 2024`
          : `Montant MaPrimeRénov 0 EUR pour cette combinaison`),
      sourceRef: entry.sourceRef,
    }
  }

  return {
    eligible: true,
    amountEUR: entry.amountEUR,
    sourceRef: entry.sourceRef,
    notes: entry.notes,
  }
}

export function checkEligibility(input: EligibilityInput): EligibilityResult {
  const menageCategorie = determineMenageCategorie(input)
  const plafondsBase = getPlafonds(input.zone, input.nbPersonnes)

  if (!menageCategorie || !plafondsBase) {
    return {
      eligible: false,
      menageCategorie: null,
      plafondAtteint: 0,
      reason: `Aucun barème applicable pour zone ${input.zone} nbPersonnes ${input.nbPersonnes}`,
      sourceRef: 'ANAH_MAPRIMERENOV',
    }
  }

  const plafonds = applyStepIncrement(plafondsBase, input.nbPersonnes)

  return {
    eligible: menageCategorie !== 'superieur',
    menageCategorie,
    plafondAtteint: plafonds.intermediaireMax,
    sourceRef: 'ANAH_MAPRIMERENOV',
    reason:
      menageCategorie === 'superieur'
        ? `Ménage catégorie supérieure exclu du Parcours par geste depuis recentrage 2024`
        : undefined,
  }
}
