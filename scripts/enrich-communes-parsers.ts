/**
 * enrich-communes-parsers.ts — Pure parsers + range guards extraits de
 * `enrich-communes-top40.ts` pour testabilité Stripe-grade. Aucun import
 * Supabase / IO / env : uniquement des fonctions pures.
 *
 * Importé par :
 *   - scripts/enrich-communes-top40.ts (orchestrator)
 *   - scripts/__tests__/enrich-communes-parsers.test.ts (vitest)
 */

// ---------------------------------------------------------------------------
// Géorisques — libellé qualitatif → enum stable côté DB
// ---------------------------------------------------------------------------
// Vérifié 2026-04-29 : Géorisques retourne libellés type
// "Risque Existant - important" / "Risque Existant - faible". On mappe
// "important" / "élevé" → "fort" pour conserver une enum stable côté DB.

export type ArgileLevel = 'faible' | 'moyen' | 'fort'

export function parseArgileLevel(libelle: string | null | undefined): ArgileLevel | null {
  if (!libelle) return null
  const l = libelle.toLowerCase()
  if (/(important|élevé|eleve|fort)/i.test(l)) return 'fort'
  if (/moyen/i.test(l)) return 'moyen'
  if (/faible/i.test(l)) return 'faible'
  return null
}

/** Parse séisme libelleStatutCommune.
 *  Géorisques 2026 ne retourne plus la zone numérique (1-5) dans le rapport
 *  de risque commune ; le libellé est qualitatif "Risque Existant - faible".
 *  Mapping qualitatif → zone : très_faible→1, faible→2, moyen→3, important→4. */
export function parseZoneSismique(libelle: string | null | undefined): number | null {
  if (!libelle) return null
  const m = libelle.match(/zone\s+(\d)/i)
  if (m) return parseInt(m[1], 10)
  const l = libelle.toLowerCase()
  if (/(très\s+faible|tres\s+faible|nul)/i.test(l)) return 1
  if (/(important|élevé|eleve|fort)/i.test(l)) return 4
  if (/moyen/i.test(l)) return 3
  if (/faible/i.test(l)) return 2
  return null
}

/** Parse radon classe "Catégorie 3" / "Risque Existant - moyen" → 1-3. */
export function parseRadon(libelle: string | null | undefined): number | null {
  if (!libelle) return null
  const m = libelle.match(/(?:catégorie|classe)\s*(\d)/i)
  if (m) return parseInt(m[1], 10)
  const l = libelle.toLowerCase()
  if (/(important|élevé|eleve|fort)/i.test(l)) return 3
  if (/moyen/i.test(l)) return 2
  if (/faible/i.test(l)) return 1
  return null
}

// ---------------------------------------------------------------------------
// DVF — agrégation prix m² depuis CSV brut Etalab
// ---------------------------------------------------------------------------
/** Extract the geo-dvf department prefix : 2 chars, sauf Corse (2A/2B,
 *  uppercase canonical). */
export function dvfDept(codeInsee: string): string {
  if (/^2[AB]/i.test(codeInsee)) return codeInsee.slice(0, 2).toUpperCase()
  return codeInsee.slice(0, 2)
}

export type DvfParsed = {
  prixMoyen: number | null
  prixMaison: number | null
  prixAppart: number | null
  nbMutations: number
}

export function parseDvfCsv(csv: string): DvfParsed {
  const lines = csv.split(/\r?\n/).filter(Boolean)
  if (lines.length < 2)
    return { prixMoyen: null, prixMaison: null, prixAppart: null, nbMutations: 0 }
  const header = lines[0].split(',')
  const iValeur = header.indexOf('valeur_fonciere')
  const iType = header.indexOf('type_local')
  const iSurface = header.indexOf('surface_reelle_bati')
  const iNature = header.indexOf('nature_mutation')
  const iMut = header.indexOf('id_mutation')
  if (iValeur < 0 || iType < 0 || iSurface < 0)
    return { prixMoyen: null, prixMaison: null, prixAppart: null, nbMutations: 0 }
  const samples = { maison: [] as number[], appart: [] as number[], all: [] as number[] }
  const mutationsSeen = new Set<string>()
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',')
    if (iNature >= 0 && parts[iNature] !== 'Vente') continue
    const val = parseFloat(parts[iValeur])
    const surf = parseFloat(parts[iSurface])
    const type = parts[iType]
    if (!val || !surf || surf < 9 || surf > 2000) continue
    const prixM2 = val / surf
    if (prixM2 < 100 || prixM2 > 50000) continue
    if (iMut >= 0) mutationsSeen.add(parts[iMut])
    samples.all.push(prixM2)
    if (type === 'Maison') samples.maison.push(prixM2)
    else if (type === 'Appartement') samples.appart.push(prixM2)
  }
  const median = (arr: number[]): number | null => {
    if (!arr.length) return null
    const sorted = [...arr].sort((a, b) => a - b)
    return Math.round(sorted[Math.floor(sorted.length / 2)])
  }
  return {
    prixMoyen: median(samples.all),
    prixMaison: median(samples.maison),
    prixAppart: median(samples.appart),
    nbMutations: mutationsSeen.size,
  }
}

// ---------------------------------------------------------------------------
// Validation guards — reject aberrant values that would corrupt downstream
// templates (BarometrePrixBlock, ContexteDPEBlock, RisquesGeoBlock...)
// ---------------------------------------------------------------------------
export function isPriceM2Sane(n: number | null | undefined): n is number {
  return n != null && Number.isFinite(n) && n >= 500 && n <= 30_000
}

export function isRevenuSane(n: number | null | undefined): n is number {
  return n != null && Number.isFinite(n) && n >= 8_000 && n <= 80_000
}

export function isPctSane(n: number | null | undefined): n is number {
  return n != null && Number.isFinite(n) && n >= 0 && n <= 100
}

export function isPositiveCount(n: number | null | undefined): n is number {
  return n != null && Number.isFinite(n) && n > 0 && n <= 10_000_000
}
