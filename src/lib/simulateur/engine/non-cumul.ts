/**
 * Application des règles de non-cumul CEE entre fiches BAR-TH.
 *
 * Source : docs/baremes-sources/07-*.md §8
 *
 * En cas de conflit : garde l'aide la plus avantageuse financièrement.
 */

import { CEE_NON_CUMUL_PAIRES } from '../baremes/2026-01'
import { logger } from '@/lib/logger'

export interface AideCalculee {
  /** Identifiant court : ex. "BAR-TH-148", "BAR-TH-171". */
  code: string
  /** Montant estimé (€) pour comparaison. Utiliser fourchette.haut ou moyenne. */
  montant: number
  /** Label lisible. */
  label?: string
  /** Métadonnées libres (kWhc, baremeId, etc.). */
  meta?: Record<string, unknown>
}

export interface NonCumulExclusion {
  paire: [string, string]
  garde: string
  exclut: string
  raison: string
}

export interface NonCumulResult {
  retenues: AideCalculee[]
  exclusions: NonCumulExclusion[]
}

/**
 * Applique la matrice de non-cumul.
 * Itère sur CEE_NON_CUMUL_PAIRES ; si les deux sont présentes, exclut la moins avantageuse.
 */
export function applyNonCumul(aides: AideCalculee[]): NonCumulResult {
  const exclusions: NonCumulExclusion[] = []
  const excluded = new Set<string>()

  for (const [a, b] of CEE_NON_CUMUL_PAIRES) {
    if (excluded.has(a) || excluded.has(b)) continue
    const aideA = aides.find((x) => x.code === a)
    const aideB = aides.find((x) => x.code === b)
    if (!aideA || !aideB) continue

    const garde = aideA.montant >= aideB.montant ? aideA : aideB
    const exclut = garde === aideA ? aideB : aideA
    excluded.add(exclut.code)
    logger.warn(
      `Non-cumul CEE : ${a} et ${b} incompatibles. Garde ${garde.code} (${garde.montant} €), exclut ${exclut.code} (${exclut.montant} €).`,
      { action: 'applyNonCumul' }
    )
    exclusions.push({
      paire: [a, b],
      garde: garde.code,
      exclut: exclut.code,
      raison: `Non-cumul CEE ${a} + ${b} : le plus avantageux est gardé.`,
    })
  }

  const retenues = aides.filter((x) => !excluded.has(x.code))
  return { retenues, exclusions }
}
