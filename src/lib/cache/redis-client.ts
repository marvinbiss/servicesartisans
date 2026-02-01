/**
 * Redis Client for Caching and Rate Limiting
 * Production-grade distributed caching
 */

import { Redis } from 'ioredis'

// Singleton Redis client
let redisClient: Redis | null = null

export function getRedisClient(): Redis | null {
  if (redisClient) return redisClient

  const redisUrl = process.env.REDIS_URL

  if (!redisUrl) {
    console.warn('Redis URL not configured - caching disabled')
    return null
  }

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 3) return null
        return Math.min(times * 100, 3000)
      },
    })

    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err)
    })

    redisClient.on('connect', () => {
      console.log('Redis connected')
    })

    return redisClient
  } catch (error) {
    console.error('Failed to create Redis client:', error)
    return null
  }
}

/**
 * Cache wrapper with automatic serialization
 */
export class CacheService {
  private redis: Redis | null
  private prefix: string

  constructor(prefix = 'sa:') {
    this.redis = getRedisClient()
    this.prefix = prefix
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null

    try {
      const value = await this.redis.get(this.getKey(key))
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  /**
   * Set cached value with TTL
   */
  async set<T>(key: string, value: T, ttlSeconds = 3600): Promise<boolean> {
    if (!this.redis) return false

    try {
      await this.redis.setex(
        this.getKey(key),
        ttlSeconds,
        JSON.stringify(value)
      )
      return true
    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  }

  /**
   * Delete cached value
   */
  async delete(key: string): Promise<boolean> {
    if (!this.redis) return false

    try {
      await this.redis.del(this.getKey(key))
      return true
    } catch (error) {
      console.error('Cache delete error:', error)
      return false
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    if (!this.redis) return 0

    try {
      const keys = await this.redis.keys(this.getKey(pattern))
      if (keys.length === 0) return 0
      return await this.redis.del(...keys)
    } catch (error) {
      console.error('Cache delete pattern error:', error)
      return 0
    }
  }

  /**
   * Get or set with callback
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds = 3600
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) return cached

    const value = await factory()
    await this.set(key, value, ttlSeconds)
    return value
  }

  /**
   * Increment a counter
   */
  async increment(key: string, ttlSeconds = 3600): Promise<number> {
    if (!this.redis) return 0

    try {
      const fullKey = this.getKey(key)
      const value = await this.redis.incr(fullKey)
      if (value === 1) {
        await this.redis.expire(fullKey, ttlSeconds)
      }
      return value
    } catch (error) {
      console.error('Cache increment error:', error)
      return 0
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.redis) return false

    try {
      return (await this.redis.exists(this.getKey(key))) === 1
    } catch (error) {
      console.error('Cache exists error:', error)
      return false
    }
  }

  /**
   * Get TTL of a key
   */
  async ttl(key: string): Promise<number> {
    if (!this.redis) return -1

    try {
      return await this.redis.ttl(this.getKey(key))
    } catch (error) {
      console.error('Cache TTL error:', error)
      return -1
    }
  }
}

// Default cache instance
export const cache = new CacheService()

/**
 * Rate Limiter using Redis
 */
export class RateLimiter {
  private redis: Redis | null
  private prefix: string

  constructor(prefix = 'rl:') {
    this.redis = getRedisClient()
    this.prefix = prefix
  }

  /**
   * Check if request is allowed under rate limit
   * Uses sliding window algorithm
   */
  async isAllowed(
    identifier: string,
    limit: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    if (!this.redis) {
      return { allowed: true, remaining: limit, resetAt: Date.now() + windowSeconds * 1000 }
    }

    const key = `${this.prefix}${identifier}`
    const now = Date.now()
    const windowStart = now - windowSeconds * 1000

    try {
      // Remove old entries
      await this.redis.zremrangebyscore(key, 0, windowStart)

      // Count current entries
      const count = await this.redis.zcard(key)

      if (count >= limit) {
        // Get oldest entry to calculate reset time
        const oldest = await this.redis.zrange(key, 0, 0, 'WITHSCORES')
        const resetAt = oldest.length > 1
          ? parseInt(oldest[1]) + windowSeconds * 1000
          : now + windowSeconds * 1000

        return { allowed: false, remaining: 0, resetAt }
      }

      // Add new entry
      await this.redis.zadd(key, now, `${now}`)
      await this.redis.expire(key, windowSeconds)

      return {
        allowed: true,
        remaining: limit - count - 1,
        resetAt: now + windowSeconds * 1000,
      }
    } catch (error) {
      console.error('Rate limiter error:', error)
      return { allowed: true, remaining: limit, resetAt: Date.now() + windowSeconds * 1000 }
    }
  }

  /**
   * Simple fixed window rate limiter
   */
  async checkLimit(
    identifier: string,
    limit: number,
    windowSeconds: number
  ): Promise<boolean> {
    const result = await this.isAllowed(identifier, limit, windowSeconds)
    return result.allowed
  }
}

// Default rate limiter instance
export const rateLimiter = new RateLimiter()

export default { cache, rateLimiter, getRedisClient }
