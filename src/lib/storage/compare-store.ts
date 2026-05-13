/**
 * Persisted compare list — survives page reload via localStorage.
 *
 * The in-memory CompareProvider keeps the rich CompareProvider[] shape that
 * the bar and modal render directly; the persisted projection only stores
 * the lean fields needed for re-rendering the bar without a refetch and for
 * rebuilding the `?ids=...` deep link.
 *
 * Schema is versioned (`sa:compare:v1`) so future shape changes invalidate
 * stale entries instead of crashing the renderer.
 */
import type { CompareProvider } from '@/components/compare/CompareProvider'

export const COMPARE_STORAGE_KEY = 'sa:compare:v1'

const MAX = 3

export function loadCompareList(): CompareProvider[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(COMPARE_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (item): item is CompareProvider =>
          !!item && typeof item === 'object' && typeof item.id === 'string' && !!item.id
      )
      .slice(0, MAX)
  } catch {
    return []
  }
}

export function saveCompareList(list: CompareProvider[]): void {
  if (typeof window === 'undefined') return
  try {
    if (list.length === 0) {
      localStorage.removeItem(COMPARE_STORAGE_KEY)
      return
    }
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(list.slice(0, MAX)))
  } catch {
    // quota full or storage disabled — silently ignore
  }
}

/**
 * Resolve the public identifier we use in `/comparer?ids=...` deep links.
 * Prefer `stable_id` (short, human-shareable) and fall back to UUID `id`.
 */
export function compareShareId(p: Pick<CompareProvider, 'id' | 'stable_id'>): string {
  return p.stable_id || p.id
}

export function buildCompareShareUrl(list: CompareProvider[], origin?: string): string {
  const ids = list.map(compareShareId).filter(Boolean).slice(0, MAX).join(',')
  const base = origin ?? (typeof window !== 'undefined' ? window.location.origin : '')
  return `${base}/comparer?ids=${encodeURIComponent(ids)}`
}
