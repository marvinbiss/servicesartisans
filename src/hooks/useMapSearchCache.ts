'use client'

/**
 * Stub — map search cache removed in v2 cleanup.
 */
export function useMapSearchCache<_T = unknown>() {
  return {
    get: (..._args: any[]): any => null,
    set: (..._args: any[]) => {},
    getCached: (..._args: any[]): any => null,
    setCache: (..._args: any[]) => {},
    clearCache: () => {},
    stats: { hits: 0, misses: 0, size: 0, hitRate: 0 },
  }
}
