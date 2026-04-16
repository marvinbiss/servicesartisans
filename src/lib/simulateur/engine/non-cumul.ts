/**
 * Application des règles de non-cumul CEE entre fiches BAR-TH.
 *
 * Source : docs/baremes-sources/07-*.md §8
 *
 * Stratégie :
 * 1. Paires explicitement incompatibles → exclut la moins avantageuse
 * 2. Paires de fiches CEE hors blacklist → tagge NON_CUMUL_UNCERTAIN
 *    (toutes les incompatibilités ne sont pas documentées publiquement)
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
  /** Combinaisons non explicitement documentées — risque de sur-cumul. */
  uncertainCombinations: string[]
}

/** Paires explicitement autorisées (pas de non-cumul connu). */
const KNOWN_SAFE_PAIRES: ReadonlyArray<readonly [string, string]> = [
  ['BAR-EN-101', 'BAR-EN-102'],
  ['BAR-EN-101', 'BAR-EN-103'],
  ['BAR-EN-102', 'BAR-EN-103'],
  ['BAR-TH-171', 'BAR-EN-101'],
  ['BAR-TH-171', 'BAR-EN-102'],
  ['BAR-TH-171', 'BAR-EN-103'],
  ['BAR-TH-125', 'BAR-TH-171'],
  ['BAR-TH-125', 'BAR-EN-101'],
  ['BAR-TH-125', 'BAR-EN-102'],
  ['BAR-TH-125', 'BAR-EN-103'],
]

function isPaireKnown(a: string, b: string, list: ReadonlyArray<readonly [string, string]>): boolean {
  return list.some(([x, y]) => (x === a && y === b) || (x === b && y === a))
}

/**
 * Applique la matrice de non-cumul + détecte les combinaisons ambiguës.
 */
export function applyNonCumul(aides: AideCalculee[]): NonCumulResult {
  const exclusions: NonCumulExclusion[] = []
  const excluded = new Set<string>()
  const uncertainCombinations: string[] = []

  // 1. Exclure les paires explicitement incompatibles
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

  // 2. Détecter les combinaisons non explicitement documentées
  const retenues = aides.filter((x) => !excluded.has(x.code))
  const ceeFiches = retenues.filter((a) => a.code.startsWith('BAR-'))
  for (let i = 0; i < ceeFiches.length; i++) {
    for (let j = i + 1; j < ceeFiches.length; j++) {
      const a = ceeFiches[i].code
      const b = ceeFiches[j].code
      if (a === b) continue
      const isBlacklisted = isPaireKnown(a, b, CEE_NON_CUMUL_PAIRES)
      const isSafe = isPaireKnown(a, b, KNOWN_SAFE_PAIRES)
      if (!isBlacklisted && !isSafe) {
        uncertainCombinations.push(`${a} + ${b}`)
        logger.info(
          `Non-cumul incertain : ${a} + ${b} — ni interdit ni explicitement autorisé.`,
          { action: 'applyNonCumul', tag: 'NON_CUMUL_UNCERTAIN' }
        )
      }
    }
  }

  return { retenues, exclusions, uncertainCombinations }
}
