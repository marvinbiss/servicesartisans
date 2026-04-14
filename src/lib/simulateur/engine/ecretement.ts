/**
 * Écrêtement des aides cumulées selon catégorie ANAH + parcours.
 *
 * Source : docs/baremes-sources/07-*.md §2 (Décret JO 05/12/2024)
 *
 * - Parcours geste : Bleu 90 %, Jaune 75 %, Violet 60 %, Rose NON ÉLIGIBLE
 * - Parcours accompagné : Bleu 100 %, Jaune 90 %, Violet 80 %, Rose 50 %
 */

import type { CategorieAnah, Parcours } from '../types'
import { ECRETEMENT_GESTE, ECRETEMENT_ACCOMPAGNE } from '../baremes/2026-01'
import type { AideCalculee } from './non-cumul'

export interface EcretementResult {
  aidesPlafonnees: AideCalculee[]
  plafondPct: number
  plafondAtteint: boolean
  totalAvantPlafond: number
  totalApresPlafond: number
  /** Si Rose + geste, le message d'exclusion. */
  exclusionMessage?: string
}

/**
 * Applique le plafonnement d'écrêtement.
 *
 * Si parcours geste + Rose : aides réduites à 0, exclusionMessage retourné.
 * Sinon : si total > budget × plafond, aides réduites proportionnellement.
 */
export function applyEcretement(
  aides: AideCalculee[],
  budgetTTC: number,
  categorie: CategorieAnah,
  parcours: Parcours
): EcretementResult {
  const totalAvant = aides.reduce((s, a) => s + a.montant, 0)

  // Rose + parcours geste = exclusion totale
  if (parcours === 'geste' && categorie === 'rose') {
    return {
      aidesPlafonnees: aides.map((a) => ({ ...a, montant: 0 })),
      plafondPct: 0,
      plafondAtteint: true,
      totalAvantPlafond: totalAvant,
      totalApresPlafond: 0,
      exclusionMessage:
        'Catégorie Rose (supérieur) non éligible au parcours par geste. Orientez-vous vers le parcours accompagné.',
    }
  }

  const plafondPct =
    parcours === 'geste' ? (ECRETEMENT_GESTE[categorie] ?? 0) : ECRETEMENT_ACCOMPAGNE[categorie]

  const plafondEuros = budgetTTC * plafondPct

  if (totalAvant <= plafondEuros || totalAvant === 0) {
    return {
      aidesPlafonnees: aides,
      plafondPct,
      plafondAtteint: false,
      totalAvantPlafond: totalAvant,
      totalApresPlafond: totalAvant,
    }
  }

  // Réduction proportionnelle
  const ratio = plafondEuros / totalAvant
  const aidesPlafonnees = aides.map((a) => ({
    ...a,
    montant: Math.round(a.montant * ratio),
  }))
  const totalApres = aidesPlafonnees.reduce((s, a) => s + a.montant, 0)

  return {
    aidesPlafonnees,
    plafondPct,
    plafondAtteint: true,
    totalAvantPlafond: totalAvant,
    totalApresPlafond: totalApres,
  }
}
