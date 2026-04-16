/**
 * CEE Pricing — source configurable pour les prix €/MWhc.
 *
 * Priorité :
 * 1. Variables d'environnement (CEE_PRIX_CLASSIQUE, CEE_PRIX_PRECARITE)
 * 2. Defaults hardcodés (baremes/2026-01.ts)
 *
 * Source de vérité prix EMMY : https://www.emmy.fr/public/statistiques
 * Refresh recommandé : trimestriel.
 */

import { CEE_PRIX_CLASSIQUE_DEFAULT, CEE_PRIX_PRECARITE_DEFAULT } from './baremes/2026-01'

export type CeePriceSource = 'ENV_OVERRIDE' | 'HARDCODED_DEFAULT'

export interface CeePriceInfo {
  classique: number
  precarite: number
  source: CeePriceSource
  version: string
}

function readEnvPrice(key: string): number | null {
  const raw = typeof process !== 'undefined' ? process.env[key] : undefined
  if (!raw) return null
  const n = parseFloat(raw)
  return Number.isFinite(n) && n > 0 ? n : null
}

/**
 * Retourne les prix CEE en vigueur avec leur source.
 */
export function getCeePricing(): CeePriceInfo {
  const envClassique = readEnvPrice('CEE_PRIX_CLASSIQUE')
  const envPrecarite = readEnvPrice('CEE_PRIX_PRECARITE')

  const hasEnv = envClassique !== null || envPrecarite !== null

  return {
    classique: envClassique ?? CEE_PRIX_CLASSIQUE_DEFAULT,
    precarite: envPrecarite ?? CEE_PRIX_PRECARITE_DEFAULT,
    source: hasEnv ? 'ENV_OVERRIDE' : 'HARDCODED_DEFAULT',
    version: '2026-Q1',
  }
}
