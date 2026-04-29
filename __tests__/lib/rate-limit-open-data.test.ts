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
