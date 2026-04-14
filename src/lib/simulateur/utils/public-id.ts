/**
 * Génération d'identifiants publics estimation
 * Format : EST-YYYY-MM-DD-xxxxxx (6 chars base36 aléatoires lowercase)
 * Source : docs/simulateur-architecture.md §3.1 (public_id), §2 Step 5
 */

import { randomBytes } from 'node:crypto'

const ID_SUFFIX_LENGTH = 6

/**
 * Génère un suffixe base36 lowercase de longueur fixe,
 * à partir d'octets cryptographiquement aléatoires.
 */
function randomSuffix(length: number = ID_SUFFIX_LENGTH): string {
  // 36^6 ≈ 2.18e9 combinaisons/jour. On consomme 6 octets (48 bits) d'entropie
  // et on concatène deux conversions base36 pour éviter les biais de tronquage.
  const bytes = randomBytes(6)
  // Scinde en deux uint24 (chacun ≤ 16 777 215 ≈ 5 chars base36)
  const hi = ((bytes[0] ?? 0) << 16) | ((bytes[1] ?? 0) << 8) | (bytes[2] ?? 0)
  const lo = ((bytes[3] ?? 0) << 16) | ((bytes[4] ?? 0) << 8) | (bytes[5] ?? 0)
  const s = hi.toString(36).padStart(5, '0') + lo.toString(36).padStart(5, '0')
  return s.slice(-length)
}

/**
 * Génère un public_id collision-résistant.
 *
 * Format : `EST-YYYY-MM-DD-xxxxxx`
 * - YYYY-MM-DD : date UTC au moment de la génération
 * - xxxxxx     : 6 chars alphanum lowercase (base36), ~2 milliards de combinaisons/jour
 *
 * Exemples : `EST-2026-04-14-a7f3b2`, `EST-2026-04-14-00x1zk`
 */
export function generatePublicId(now: Date = new Date()): string {
  const y = now.getUTCFullYear()
  const m = String(now.getUTCMonth() + 1).padStart(2, '0')
  const d = String(now.getUTCDate()).padStart(2, '0')
  return `EST-${y}-${m}-${d}-${randomSuffix()}`
}

export const __internal = {
  randomSuffix,
  ID_SUFFIX_LENGTH,
}
