import { useState, useCallback, useRef } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
}

interface Bounds {
  north: number
  south: number
  east: number
  west: number
}

/**
 * World-class caching system for map searches
 * Reduces API calls and improves performance
 */
export function useMapSearchCache<T>(ttl: number = 60000) { // 60 seconds default TTL
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map())
  const [cacheStats, setCacheStats] = useState({ hits: 0, misses: 0 })

  // Generate cache key from bounds and filters
  const generateKey = useCallback((bounds: Bounds, filters?: Record<string, any>): string => {
    // Round coordinates to reduce cache misses for similar searches
    const roundedBounds = {
      north: Math.round(bounds.north * 1000) / 1000,
      south: Math.round(bounds.south * 1000) / 1000,
      east: Math.round(bounds.east * 1000) / 1000,
      west: Math.round(bounds.west * 1000) / 1000
    }

    const filterString = filters ? JSON.stringify(filters) : ''
    return `${JSON.stringify(roundedBounds)}|${filterString}`
  }, [])

  // Get from cache
  const get = useCallback((bounds: Bounds, filters?: Record<string, any>): T | null => {
    const key = generateKey(bounds, filters)
    const entry = cache.current.get(key)

    if (!entry) {
      setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }))
      return null
    }

    // Check if entry is still valid
    const now = Date.now()
    if (now - entry.timestamp > ttl) {
      cache.current.delete(key)
      setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }))
      return null
    }

    setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }))
    return entry.data
  }, [generateKey, ttl])

  // Set in cache
  const set = useCallback((bounds: Bounds, data: T, filters?: Record<string, any>): void => {
    const key = generateKey(bounds, filters)
    cache.current.set(key, {
      data,
      timestamp: Date.now()
    })

    // Cleanup old entries (keep only last 50)
    if (cache.current.size > 50) {
      const entries = Array.from(cache.current.entries())
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp)
      cache.current = new Map(entries.slice(0, 50))
    }
  }, [generateKey])

  // Clear cache
  const clear = useCallback(() => {
    cache.current.clear()
    setCacheStats({ hits: 0, misses: 0 })
  }, [])

  // Get cache hit rate
  const getHitRate = useCallback((): number => {
    const total = cacheStats.hits + cacheStats.misses
    return total === 0 ? 0 : (cacheStats.hits / total) * 100
  }, [cacheStats])

  return {
    get,
    set,
    clear,
    stats: {
      ...cacheStats,
      size: cache.current.size,
      hitRate: getHitRate()
    }
  }
}
