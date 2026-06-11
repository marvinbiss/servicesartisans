/**
 * Partenaires de financement — POSTURE INDICATEUR STRICTE (hors IOBSP, CMF).
 *
 * SA se limite à : nommer le partenaire, afficher son offre, fournir un lien
 * sortant. AUCUNE simulation / éligibilité / scoring / comparaison / collecte de
 * dossier / transmission de données personnelles côté SA. Franchir l'une de ces
 * lignes = bascule en IOBSP mandataire (immatriculation ORIAS requise).
 *
 * ⚠️ DOUBLE VERROU AVANT MISE EN LIGNE :
 *   1. Validation avocat bancaire de la posture indicateur + des mentions.
 *   2. Contrats partenaires signés + mentions légales EXACTES fournies par eux
 *      (les chaînes ci-dessous sont des PLACEHOLDERS à confirmer).
 * Tant que le flag n'est pas 'true', rien ne s'affiche (exposition nulle).
 *
 * Rails (cf. lib/devis/financing) : particulier→younited (B2C), pro→aria (B2B).
 */

import type { FinancingRail } from '@/lib/devis'

export type FinancingAudience = 'client' | 'artisan'

export type FinancingPartner = {
  key: 'younited' | 'aria'
  name: string
  audience: FinancingAudience
  /** Accroche neutre (pas une promesse d'octroi). */
  pitch: string
  /** Mention légale obligatoire — À CONFIRMER par le partenaire / l'avocat. */
  legalMention: string
  learnMoreUrl: string
}

const flagOn = (v: string | undefined): boolean => v === 'true' || v === '1'

// NEXT_PUBLIC_* : lisibles côté client (composants), valeurs non secrètes.
const YOUNITED_ENABLED = flagOn(process.env.NEXT_PUBLIC_FINANCING_YOUNITED_ENABLED)
const ARIA_ENABLED = flagOn(process.env.NEXT_PUBLIC_FINANCING_ARIA_ENABLED)

const YOUNITED_URL = process.env.NEXT_PUBLIC_FINANCING_YOUNITED_URL || 'https://www.younited.com'
const ARIA_URL = process.env.NEXT_PUBLIC_FINANCING_ARIA_URL || 'https://www.helloaria.eu'

const PARTNERS: Record<'younited' | 'aria', FinancingPartner> = {
  younited: {
    key: 'younited',
    name: 'Younited',
    audience: 'client',
    pitch: 'Payez vos travaux en plusieurs fois.',
    // Placeholder — Younited = établissement de crédit (agrément ACPR). À confirmer.
    legalMention:
      'Financement proposé par Younited, établissement de crédit. Sous réserve d’acceptation. Un crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement avant de vous engager.',
    learnMoreUrl: YOUNITED_URL,
  },
  aria: {
    key: 'aria',
    name: 'Aria',
    audience: 'artisan',
    pitch: 'Soyez payé immédiatement : cédez votre facture (escompte).',
    // Placeholder — Aria, intermédiaire (ORIAS MOBSP n°20001254), prêteur Swan. À confirmer.
    legalMention:
      'Service de financement de facture proposé par Aria, intermédiaire en opérations de banque et services de paiement (ORIAS n°20001254). Sous réserve d’acceptation.',
    learnMoreUrl: ARIA_URL,
  },
}

/** Partenaire actif pour un rail, ou null si désactivé (flag OFF par défaut). */
export function getFinancingPartner(rail: FinancingRail): FinancingPartner | null {
  if (rail === 'younited') return YOUNITED_ENABLED ? PARTNERS.younited : null
  if (rail === 'aria') return ARIA_ENABLED ? PARTNERS.aria : null
  return null
}

export function isFinancingEnabled(rail: FinancingRail): boolean {
  return getFinancingPartner(rail) !== null
}
