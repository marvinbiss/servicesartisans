/**
 * Devis-light — machine à états du devis.
 * brouillon → envoye → vu → accepte | refuse | expire
 * (accepte/refuse/expire = terminaux)
 */

import type { QuoteStatus } from './schema'

export const QUOTE_TRANSITIONS: Record<QuoteStatus, readonly QuoteStatus[]> = {
  brouillon: ['envoye'],
  envoye: ['vu', 'accepte', 'refuse', 'expire'],
  vu: ['accepte', 'refuse', 'expire'],
  accepte: [],
  refuse: [],
  expire: [],
}

export const canTransition = (from: QuoteStatus, to: QuoteStatus): boolean =>
  QUOTE_TRANSITIONS[from]?.includes(to) ?? false

export class InvalidTransitionError extends Error {
  constructor(
    public readonly from: QuoteStatus,
    public readonly to: QuoteStatus
  ) {
    super(`Transition invalide: ${from} → ${to}`)
    this.name = 'InvalidTransitionError'
  }
}

export const assertTransition = (from: QuoteStatus, to: QuoteStatus): void => {
  if (!canTransition(from, to)) throw new InvalidTransitionError(from, to)
}

/** Colonne timestamp à renseigner lors d'une transition (null si aucune). */
export const transitionTimestampColumn = (
  to: QuoteStatus
): 'sent_at' | 'viewed_at' | 'accepted_at' | 'refused_at' | null => {
  switch (to) {
    case 'envoye':
      return 'sent_at'
    case 'vu':
      return 'viewed_at'
    case 'accepte':
      return 'accepted_at'
    case 'refuse':
      return 'refused_at'
    default:
      return null
  }
}
