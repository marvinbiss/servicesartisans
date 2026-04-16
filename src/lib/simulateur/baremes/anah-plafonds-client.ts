/**
 * Plafonds ANAH extraits des barèmes 2026-01 — importable côté client.
 *
 * Ce fichier duplique volontairement les constantes ANAH de `2026-01.ts` pour
 * éviter le guard `import 'server-only'`. Toute modification des plafonds doit
 * être répercutée ici ET dans `2026-01.ts`.
 *
 * Source : docs/baremes-sources/07-valeurs-officielles-confirmees-2026-04-14.md §1
 */

export interface PlafondsAnahRow {
  bleu: number
  jaune: number
  violet: number
}

export const ANAH_PLAFONDS_HORS_IDF: Record<number, PlafondsAnahRow> = {
  1: { bleu: 17363, jaune: 22259, violet: 31185 },
  2: { bleu: 25393, jaune: 32553, violet: 45842 },
  3: { bleu: 30540, jaune: 39148, violet: 55196 },
  4: { bleu: 35676, jaune: 45735, violet: 64550 },
  5: { bleu: 40835, jaune: 52348, violet: 73907 },
}
export const ANAH_INCREMENT_HORS_IDF: PlafondsAnahRow = {
  bleu: 5151,
  jaune: 6598,
  violet: 9357,
}

export const ANAH_PLAFONDS_IDF: Record<number, PlafondsAnahRow> = {
  1: { bleu: 24031, jaune: 29253, violet: 40851 },
  2: { bleu: 35270, jaune: 42933, violet: 60051 },
  3: { bleu: 42357, jaune: 51564, violet: 71846 },
  4: { bleu: 49455, jaune: 60208, violet: 84562 },
  5: { bleu: 56580, jaune: 68877, violet: 96817 },
}
export const ANAH_INCREMENT_IDF: PlafondsAnahRow = {
  bleu: 7116,
  jaune: 8663,
  violet: 12257,
}

/**
 * Calcule les plafonds ANAH pour une taille de foyer et une zone données.
 * Miroir de `engine/classifier.ts#getPlafondsAnah` — utilisable côté client.
 */
export function getPlafondsAnah(foyerTaille: number, idf: boolean): PlafondsAnahRow {
  if (foyerTaille < 1 || !Number.isFinite(foyerTaille)) {
    return { bleu: 0, jaune: 0, violet: 0 }
  }
  const table = idf ? ANAH_PLAFONDS_IDF : ANAH_PLAFONDS_HORS_IDF
  const increment = idf ? ANAH_INCREMENT_IDF : ANAH_INCREMENT_HORS_IDF

  if (foyerTaille <= 5) {
    return table[Math.floor(foyerTaille)] ?? { bleu: 0, jaune: 0, violet: 0 }
  }
  const base = table[5]
  const extra = foyerTaille - 5
  return {
    bleu: base.bleu + increment.bleu * extra,
    jaune: base.jaune + increment.jaune * extra,
    violet: base.violet + increment.violet * extra,
  }
}
