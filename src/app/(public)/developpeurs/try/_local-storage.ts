/**
 * Pure helpers for the `localStorage`-backed request history.
 *
 * Kept tiny on purpose — the history feature exists so an integrator can
 * scroll back through the last few experiments without paying any server
 * round-trip. Cap at `MAX = 20` keeps the page under any reasonable
 * `localStorage` quota even for verbose endpoints.
 *
 * Every entry point accepts a `storage` parameter (default = `window.
 * localStorage` when running in the browser, `null` otherwise) so the
 * tests can pass an in-memory shim without monkey-patching globals.
 */

import type { HistoryEntry } from './_types'

const KEY = 'sa-try-history-v1'
const MAX = 20

export function loadHistory(
  storage: Storage | null = typeof window === 'undefined' ? null : window.localStorage
): HistoryEntry[] {
  if (!storage) return []
  try {
    const raw = storage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((e): e is HistoryEntry => {
        return (
          e !== null &&
          typeof e === 'object' &&
          typeof (e as HistoryEntry).ts === 'number' &&
          typeof (e as HistoryEntry).opId === 'string'
        )
      })
      .slice(0, MAX)
  } catch {
    return []
  }
}

export function pushHistory(
  entry: HistoryEntry,
  storage: Storage | null = typeof window === 'undefined' ? null : window.localStorage
): void {
  if (!storage) return
  try {
    const current = loadHistory(storage)
    const next = [entry, ...current].slice(0, MAX)
    storage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* quota or serialization issue — ignore */
  }
}

export function clearHistory(
  storage: Storage | null = typeof window === 'undefined' ? null : window.localStorage
): void {
  if (!storage) return
  try {
    storage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
