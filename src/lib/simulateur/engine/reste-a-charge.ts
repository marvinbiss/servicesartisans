/**
 * Calcul reste à charge après application des aides.
 * Fourchette car certaines aides (CEE) sont en fourchette.
 */

export interface AideFourchette {
  bas: number
  haut: number
}

/**
 * Reste à charge = budgetTTC − aides.
 * bas = budgetTTC − haut(aides) (optimiste), haut = budgetTTC − bas(aides) (pessimiste).
 * Clamp à 0.
 */
export function calcResteACharge(
  budgetTTC: number,
  aides: AideFourchette
): { bas: number; haut: number } {
  const bas = Math.max(0, Math.round(budgetTTC - aides.haut))
  const haut = Math.max(0, Math.round(budgetTTC - aides.bas))
  return { bas, haut }
}
