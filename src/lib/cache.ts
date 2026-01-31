// In-memory cache for server-side data
const cache = new Map<string, { data: unknown; expiry: number }>()

// Cache TTL configurations (in seconds)
export const CACHE_TTL = {
  services: 3600, // 1 hour
  artisans: 300, // 5 minutes
  reviews: 600, // 10 minutes
  locations: 86400, // 24 hours
  stats: 1800, // 30 minutes
} as const

// ISR Revalidation times (in seconds)
export const REVALIDATE = {
  services: 3600, // 1 hour
  serviceDetail: 1800, // 30 minutes
  serviceLocation: 900, // 15 minutes
  artisanProfile: 300, // 5 minutes
  locations: 86400, // 24 hours
  blog: 3600, // 1 hour
  staticPages: 86400, // 24 hours
} as const

/**
 * Get cached data or fetch new data
 */
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  const cached = cache.get(key)

  if (cached && cached.expiry > Date.now()) {
    return cached.data as T
  }

  const data = await fetcher()
  cache.set(key, { data, expiry: Date.now() + ttl * 1000 })

  return data
}

/**
 * Invalidate cache by key or pattern
 */
export function invalidateCache(keyOrPattern: string | RegExp): void {
  if (typeof keyOrPattern === 'string') {
    cache.delete(keyOrPattern)
  } else {
    const keys = Array.from(cache.keys())
    for (const key of keys) {
      if (keyOrPattern.test(key)) {
        cache.delete(key)
      }
    }
  }
}

/**
 * Clear entire cache
 */
export function clearCache(): void {
  cache.clear()
}

/**
 * Get cache stats
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  }
}

/**
 * Generate cache key from parameters
 */
export function generateCacheKey(prefix: string, params: Record<string, unknown>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')

  return `${prefix}:${sortedParams}`
}

/**
 * Memoize function results
 */
export function memoize<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl: number = 300
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args)
    return getCachedData(key, () => fn(...args), ttl)
  }) as T
}

/**
 * Deduplicate concurrent requests
 */
const pendingRequests = new Map<string, Promise<unknown>>()

export async function dedupeRequest<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const pending = pendingRequests.get(key)

  if (pending) {
    return pending as Promise<T>
  }

  const request = fetcher().finally(() => {
    pendingRequests.delete(key)
  })

  pendingRequests.set(key, request)

  return request
}
