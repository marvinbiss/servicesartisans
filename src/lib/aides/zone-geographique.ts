/**
 * Zone géographique pour calcul plafonds revenus MPR.
 *
 * Île-de-France = départements 75, 77, 78, 91, 92, 93, 94, 95.
 * Source : ANAH — barèmes MaPrimeRénov' (zonage IDF vs hors IDF historique).
 * Snapshot : 2026-04-15.
 *
 * NOTE : `providers.address_department` stocke un CODE INSEE 2-3 chars
 * (pas le nom) — voir CLAUDE.md règle dept-code-not-name. Le helper
 * `zoneForDeptCode` attend donc bien un code (`'75'`, pas `'Paris'`).
 */

import type { Zone } from './types'

const IDF_DEPT_CODES: ReadonlySet<string> = new Set([
  '75',
  '77',
  '78',
  '91',
  '92',
  '93',
  '94',
  '95',
])

export function zoneForDeptCode(deptCode: string): Zone {
  return IDF_DEPT_CODES.has(deptCode) ? 'idf' : 'hors_idf'
}

export function zoneForPostalCode(postalCode: string): Zone {
  const trimmed = postalCode.trim()
  if (trimmed.length < 2) return 'hors_idf'
  const prefix2 = trimmed.slice(0, 2)
  // Corse : codes postaux 200xx / 201xx (2A) et 202xx (2B). Hors IDF.
  if (prefix2 === '20') return 'hors_idf'
  // DOM : codes postaux à 3 chiffres de département (971-978). Hors IDF.
  if (trimmed.startsWith('97') || trimmed.startsWith('98')) return 'hors_idf'
  return zoneForDeptCode(prefix2)
}

export function isIdfDeptCode(deptCode: string): boolean {
  return IDF_DEPT_CODES.has(deptCode)
}
