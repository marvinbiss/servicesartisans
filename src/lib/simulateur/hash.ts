/**
 * Helpers de hashing déterministe pour la traçabilité plan 20/20.
 *
 * - canonicalJson : sérialisation stable (clés triées, undefined skippé) —
 *   garantit que deux objets sémantiquement égaux produisent le même string,
 *   indépendamment de l'ordre d'insertion des clés.
 * - computeInputsHash : SHA-256 hex du canonicalJson({ situation, projet, budget }).
 *   Source unique utilisée par /api/simulateur/submit ET les tests vitest.
 *   Ne JAMAIS réécrire inline — importer d'ici pour éviter drift.
 */

import { createHash } from 'node:crypto'

export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return '[' + value.map(canonicalJson).join(',') + ']'
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  return '{' + entries.map(([k, v]) => JSON.stringify(k) + ':' + canonicalJson(v)).join(',') + '}'
}

export function computeInputsHash(situation: unknown, projet: unknown, budget: unknown): string {
  const canonical = canonicalJson({ situation, projet, budget })
  return createHash('sha256').update(canonical, 'utf8').digest('hex')
}
