/**
 * Classifier ANAH — détermine la catégorie (bleu/jaune/violet/rose)
 * selon le RFR, la taille du foyer et la zone IdF.
 *
 * Source : docs/baremes-sources/07-valeurs-officielles-confirmees-2026-04-14.md §1
 */

import type { CategorieAnah } from '../types'
import {
  ANAH_PLAFONDS_HORS_IDF,
  ANAH_PLAFONDS_IDF,
  ANAH_INCREMENT_HORS_IDF,
  ANAH_INCREMENT_IDF,
  type PlafondsAnahRow,
} from '../baremes/2026-01'

/**
 * Calcule les plafonds ANAH pour une taille de foyer et une zone données.
 * Au-delà de 5 personnes, ajoute incrément × (foyerTaille - 5).
 *
 * @throws si foyerTaille < 1
 */
export function getPlafondsAnah(foyerTaille: number, idf: boolean): PlafondsAnahRow {
  if (foyerTaille < 1 || !Number.isFinite(foyerTaille)) {
    throw new Error(`foyerTaille invalide: ${foyerTaille}`)
  }
  const table = idf ? ANAH_PLAFONDS_IDF : ANAH_PLAFONDS_HORS_IDF
  const increment = idf ? ANAH_INCREMENT_IDF : ANAH_INCREMENT_HORS_IDF

  if (foyerTaille <= 5) {
    const row = table[Math.floor(foyerTaille)]
    if (!row) {
      throw new Error(`Pas de plafond trouvé pour foyerTaille=${foyerTaille}`)
    }
    return row
  }
  const base = table[5]
  const extra = foyerTaille - 5
  return {
    bleu: base.bleu + increment.bleu * extra,
    jaune: base.jaune + increment.jaune * extra,
    violet: base.violet + increment.violet * extra,
  }
}

/**
 * Classifie un foyer en catégorie ANAH.
 * - RFR ≤ bleu → bleu (très modeste)
 * - RFR ≤ jaune → jaune (modeste)
 * - RFR ≤ violet → violet (intermédiaire)
 * - RFR > violet → rose (supérieur, non éligible parcours geste)
 *
 * Note : Rose est retourné. L'exclusion Rose+parcours geste est gérée
 * en aval dans `eligibilite.ts` / `ecretement.ts`.
 */
export function classifierCategorieAnah(
  rfr: number,
  foyerTaille: number,
  idf: boolean
): CategorieAnah {
  if (rfr < 0 || !Number.isFinite(rfr)) {
    throw new Error(`RFR invalide: ${rfr}`)
  }
  const plafonds = getPlafondsAnah(foyerTaille, idf)
  if (rfr <= plafonds.bleu) return 'bleu'
  if (rfr <= plafonds.jaune) return 'jaune'
  if (rfr <= plafonds.violet) return 'violet'
  return 'rose'
}
