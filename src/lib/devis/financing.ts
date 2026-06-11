/**
 * Devis-light — routage du rail de financement selon le type de client.
 * particulier → Younited (crédit affecté B2C). pro → Aria (escompte B2B).
 * Posture indicateur : ceci ne fait que CHOISIR l'affichage, aucune
 * intermédiation / simulation / scoring côté SA.
 */

import type { FinancingRail, QuoteClientType } from './schema'

/** Younited Pay : produit à partir de ~100 € ; sous ce seuil, pas d'offre. */
export const YOUNITED_MIN_TTC = 100

export const resolveFinancingRail = (
  clientType: QuoteClientType,
  totalTtc: number
): FinancingRail => {
  if (clientType === 'pro') return 'aria'
  if (clientType === 'particulier') return totalTtc >= YOUNITED_MIN_TTC ? 'younited' : 'none'
  return 'none'
}
