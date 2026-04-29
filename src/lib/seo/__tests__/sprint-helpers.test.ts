import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  truncateTitle,
  safeJsonStringify,
  isSeoUpgradeV2,
  currentMonthYearFr,
  monthlyAnchorIso,
} from '../sprint-helpers'

// ---------------------------------------------------------------------------
// Smoke tests : ces helpers viennent du module RGE (Sprint 0.1) via re-export.
// Ces tests garantissent que le re-export reste fonctionnellement equivalent
// si quelqu'un déplace la source.
// ---------------------------------------------------------------------------

describe('sprint-helpers re-exports', () => {
  it('truncateTitle is callable and respects maxLen', () => {
    expect(truncateTitle('short', 60)).toBe('short')
    expect(truncateTitle('a'.repeat(80), 60).length).toBeLessThanOrEqual(60)
  })

  it('safeJsonStringify neutralises </script>', () => {
    const out = safeJsonStringify({ x: '</script>' })
    expect(out).not.toContain('</script>')
    expect(out).toContain('\\u003c/script\\u003e')
  })

  it('currentMonthYearFr returns a French month-year', () => {
    const out = currentMonthYearFr()
    expect(out).toMatch(/\d{4}/)
    expect(out).not.toMatch(/april|january|december/i)
  })

  describe('isSeoUpgradeV2 (alias of RGE_UPGRADE_V2)', () => {
    let original: string | undefined

    beforeEach(() => {
      original = process.env.RGE_UPGRADE_V2
    })

    afterEach(() => {
      if (original === undefined) {
        delete process.env.RGE_UPGRADE_V2
      } else {
        process.env.RGE_UPGRADE_V2 = original
      }
    })

    it('returns true by default (env unset)', () => {
      delete process.env.RGE_UPGRADE_V2
      expect(isSeoUpgradeV2()).toBe(true)
    })

    it('returns false when explicitly disabled', () => {
      process.env.RGE_UPGRADE_V2 = 'false'
      expect(isSeoUpgradeV2()).toBe(false)
    })

    it('returns true for any other string', () => {
      process.env.RGE_UPGRADE_V2 = '0'
      expect(isSeoUpgradeV2()).toBe(true)
    })
  })

  describe('monthlyAnchorIso (Sprint 0.2 — fake-freshness fix)', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns the 1st of the current month at UTC midnight', () => {
      vi.setSystemTime(new Date('2026-04-29T15:30:00Z'))
      expect(monthlyAnchorIso()).toBe('2026-04-01T00:00:00.000Z')
    })

    it('is stable across the month (does not change with revalidate)', () => {
      vi.setSystemTime(new Date('2026-04-01T00:00:00Z'))
      const a = monthlyAnchorIso()
      vi.setSystemTime(new Date('2026-04-30T23:59:59Z'))
      const b = monthlyAnchorIso()
      expect(a).toBe(b)
    })

    it('rolls over to the next month on the 1st', () => {
      vi.setSystemTime(new Date('2026-05-01T00:00:00Z'))
      expect(monthlyAnchorIso()).toBe('2026-05-01T00:00:00.000Z')
    })

    it('rolls over end-of-year correctly', () => {
      vi.setSystemTime(new Date('2026-12-15T12:00:00Z'))
      expect(monthlyAnchorIso()).toBe('2026-12-01T00:00:00.000Z')
      vi.setSystemTime(new Date('2027-01-01T00:00:00Z'))
      expect(monthlyAnchorIso()).toBe('2027-01-01T00:00:00.000Z')
    })
  })
})
