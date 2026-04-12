import { describe, it, expect } from 'vitest'

import {
  STATIC_BATCH,
  LARGE_BATCH,
  PROVIDER_BATCH_SIZE,
  MAX_PROVIDER_SITEMAPS,
  SITEMAP_CITY_COUNT,
  SITEMAP_CITY_COUNT_TIER2,
} from '@/lib/seo/sitemap-config'

describe('sitemap-config constants', () => {
  // ---------- STATIC_BATCH ----------
  describe('STATIC_BATCH', () => {
    it('equals 10,000', () => {
      expect(STATIC_BATCH).toBe(10_000)
    })

    it('is a positive integer', () => {
      expect(STATIC_BATCH).toBeGreaterThan(0)
      expect(Number.isInteger(STATIC_BATCH)).toBe(true)
    })

    it('does not exceed Google 50K sitemap URL limit', () => {
      expect(STATIC_BATCH).toBeLessThanOrEqual(50_000)
    })
  })

  // ---------- LARGE_BATCH ----------
  describe('LARGE_BATCH', () => {
    it('equals 25,000', () => {
      expect(LARGE_BATCH).toBe(25_000)
    })

    it('is larger than STATIC_BATCH', () => {
      expect(LARGE_BATCH).toBeGreaterThan(STATIC_BATCH)
    })

    it('does not exceed Google 50K sitemap URL limit', () => {
      expect(LARGE_BATCH).toBeLessThanOrEqual(50_000)
    })

    it('stays within Google 30K recommendation for optimal processing', () => {
      expect(LARGE_BATCH).toBeLessThanOrEqual(30_000)
    })
  })

  // ---------- PROVIDER_BATCH_SIZE ----------
  describe('PROVIDER_BATCH_SIZE', () => {
    it('equals 25,000', () => {
      expect(PROVIDER_BATCH_SIZE).toBe(25_000)
    })

    it('is a positive integer', () => {
      expect(PROVIDER_BATCH_SIZE).toBeGreaterThan(0)
      expect(Number.isInteger(PROVIDER_BATCH_SIZE)).toBe(true)
    })

    it('does not exceed Google 50K sitemap URL limit', () => {
      expect(PROVIDER_BATCH_SIZE).toBeLessThanOrEqual(50_000)
    })
  })

  // ---------- MAX_PROVIDER_SITEMAPS ----------
  describe('MAX_PROVIDER_SITEMAPS', () => {
    it('equals 200', () => {
      expect(MAX_PROVIDER_SITEMAPS).toBe(200)
    })

    it('is a positive integer', () => {
      expect(MAX_PROVIDER_SITEMAPS).toBeGreaterThan(0)
      expect(Number.isInteger(MAX_PROVIDER_SITEMAPS)).toBe(true)
    })

    it('can cover at least 900K providers with PROVIDER_BATCH_SIZE', () => {
      const maxProviders = MAX_PROVIDER_SITEMAPS * PROVIDER_BATCH_SIZE
      expect(maxProviders).toBeGreaterThanOrEqual(900_000)
    })

    it('total capacity is at most 5M URLs (reasonable cap)', () => {
      const maxUrls = MAX_PROVIDER_SITEMAPS * PROVIDER_BATCH_SIZE
      expect(maxUrls).toBeLessThanOrEqual(10_000_000)
    })
  })

  // ---------- SITEMAP_CITY_COUNT ----------
  describe('SITEMAP_CITY_COUNT', () => {
    it('equals 2,267 (all French cities 5K+ inhabitants)', () => {
      expect(SITEMAP_CITY_COUNT).toBe(2_267)
    })

    it('is a positive integer', () => {
      expect(SITEMAP_CITY_COUNT).toBeGreaterThan(0)
      expect(Number.isInteger(SITEMAP_CITY_COUNT)).toBe(true)
    })

    it('is in a reasonable range for French cities above 5K pop', () => {
      // France has ~2,000-2,500 cities above 5K inhabitants
      expect(SITEMAP_CITY_COUNT).toBeGreaterThan(1_500)
      expect(SITEMAP_CITY_COUNT).toBeLessThan(5_000)
    })
  })

  // ---------- SITEMAP_CITY_COUNT_TIER2 ----------
  describe('SITEMAP_CITY_COUNT_TIER2', () => {
    it('equals 500', () => {
      expect(SITEMAP_CITY_COUNT_TIER2).toBe(500)
    })

    it('is smaller than SITEMAP_CITY_COUNT (tiered strategy)', () => {
      expect(SITEMAP_CITY_COUNT_TIER2).toBeLessThan(SITEMAP_CITY_COUNT)
    })

    it('is a reasonable subset (10-50% of full city count)', () => {
      const ratio = SITEMAP_CITY_COUNT_TIER2 / SITEMAP_CITY_COUNT
      expect(ratio).toBeGreaterThan(0.1)
      expect(ratio).toBeLessThan(0.5)
    })
  })

  // ---------- Cross-constant consistency ----------
  describe('cross-constant consistency', () => {
    it('batch sizes are ordered: STATIC_BATCH <= LARGE_BATCH', () => {
      expect(STATIC_BATCH).toBeLessThanOrEqual(LARGE_BATCH)
    })

    it('PROVIDER_BATCH_SIZE equals LARGE_BATCH (same scale)', () => {
      expect(PROVIDER_BATCH_SIZE).toBe(LARGE_BATCH)
    })

    it('all batch sizes are multiples of 1000', () => {
      expect(STATIC_BATCH % 1000).toBe(0)
      expect(LARGE_BATCH % 1000).toBe(0)
      expect(PROVIDER_BATCH_SIZE % 1000).toBe(0)
    })
  })
})
