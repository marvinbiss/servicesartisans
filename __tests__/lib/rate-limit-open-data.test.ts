/**
 * Chantier #3 — vérifie que /api/open-data/* est rangé dans le bucket
 * `openData` (cold start DOS protection) et non dans le fallback `api`.
 */
import { describe, expect, it } from 'vitest'

import { getRateLimitConfig, RATE_LIMITS } from '@/lib/rate-limiter'

describe('getRateLimitConfig — /api/open-data routing', () => {
  it('maps /api/open-data/local-stats.csv to RATE_LIMITS.openData', () => {
    expect(getRateLimitConfig('/api/open-data/local-stats.csv')).toBe(RATE_LIMITS.openData)
  })

  it('maps /api/open-data/local-stats.json to RATE_LIMITS.openData', () => {
    expect(getRateLimitConfig('/api/open-data/local-stats.json')).toBe(RATE_LIMITS.openData)
  })

  it('maps /api/open-data/manifest.json to RATE_LIMITS.openData', () => {
    expect(getRateLimitConfig('/api/open-data/manifest.json')).toBe(RATE_LIMITS.openData)
  })

  it('does not match /api/open-data on other api paths (no false positive)', () => {
    expect(getRateLimitConfig('/api/contact')).not.toBe(RATE_LIMITS.openData)
    expect(getRateLimitConfig('/api/devis')).not.toBe(RATE_LIMITS.openData)
    expect(getRateLimitConfig('/api/cron/check-aides-freshness')).not.toBe(RATE_LIMITS.openData)
  })

  it('maps exact /api/open-data (no suffix) to RATE_LIMITS.openData', () => {
    expect(getRateLimitConfig('/api/open-data')).toBe(RATE_LIMITS.openData)
  })

  it('maps trailing-slash /api/open-data/ to RATE_LIMITS.openData', () => {
    expect(getRateLimitConfig('/api/open-data/')).toBe(RATE_LIMITS.openData)
  })

  it('does NOT match a sibling like /api/open-data-extras (anchored pattern)', () => {
    // Garde anti-prefix: une route hypothétique `/api/open-data-extras`
    // ne doit PAS hériter du bucket openData failOpen.
    expect(getRateLimitConfig('/api/open-data-extras')).not.toBe(RATE_LIMITS.openData)
    expect(getRateLimitConfig('/api/open-database')).not.toBe(RATE_LIMITS.openData)
  })

  it('/api/cron/* still routes to RATE_LIMITS.cron (ordering guard)', () => {
    expect(getRateLimitConfig('/api/cron/check-aides-freshness')).toBe(RATE_LIMITS.cron)
  })

  it('never falls through to RATE_LIMITS.api for any /api/open-data subpath', () => {
    expect(getRateLimitConfig('/api/open-data/local-stats.csv')).not.toBe(RATE_LIMITS.api)
    expect(getRateLimitConfig('/api/open-data/manifest.json')).not.toBe(RATE_LIMITS.api)
  })
})

describe('RATE_LIMITS.openData configuration', () => {
  it('is fail-open (data.gouv bot must never be blocked)', () => {
    expect(RATE_LIMITS.openData.failOpen).toBe(true)
  })

  it('uses 60-second sliding window', () => {
    expect(RATE_LIMITS.openData.window).toBe(60 * 1000)
  })

  it('60 req/min cap (legitimate consumer OK, naive scraper throttled)', () => {
    expect(RATE_LIMITS.openData.max).toBe(60)
  })
})
