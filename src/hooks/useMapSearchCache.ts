'use client'

/**
 * Stub — map search cache removed in v2 cleanup.
 */
export function useMapSearchCache<T = unknown>() {
  return {
    get: (..._args: unknown[]): T | null => null,
    set: (..._args: unknown[]) => {},
    getCached: (..._args: unknown[]): T | null => null,
    setCache: (..._args: unknown[]) => {},
    clearCache: () => {},
    stats: { hits: 0, misses: 0, size: 0, hitRate: 0 },
  }
}
