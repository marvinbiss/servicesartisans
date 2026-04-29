import { describe, expect, it } from 'vitest'

import { computeFreshnessReport } from '@/app/api/cron/check-aides-freshness/route'

const FIXED_NOW = new Date('2026-04-29T12:00:00Z')

function ago(days: number): string {
  const d = new Date(FIXED_NOW)
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString().slice(0, 10)
}

describe('computeFreshnessReport', () => {
  it('returns status=ok when all aides are < 60 days old', () => {
    const r = computeFreshnessReport(
      [
        { slug: 'a', lastReviewed: ago(0) },
        { slug: 'b', lastReviewed: ago(30) },
        { slug: 'c', lastReviewed: ago(59) },
      ],
      FIXED_NOW
    )
    expect(r.status).toBe('ok')
    expect(r.alerts).toEqual([])
    expect(r.totalAides).toBe(3)
  })

  it('emits warning between 60 and 74 days', () => {
    const r = computeFreshnessReport(
      [
        { slug: 'a', lastReviewed: ago(60) },
        { slug: 'b', lastReviewed: ago(74) },
      ],
      FIXED_NOW
    )
    expect(r.status).toBe('warning')
    expect(r.alerts).toHaveLength(2)
    expect(r.alerts[0].severity).toBe('warning')
    expect(r.alerts[1].severity).toBe('warning')
  })

  it('emits critical at 75 days, before the 90-day CI fail', () => {
    const r = computeFreshnessReport(
      [
        { slug: 'a', lastReviewed: ago(75) },
        { slug: 'b', lastReviewed: ago(89) },
      ],
      FIXED_NOW
    )
    expect(r.status).toBe('critical')
    expect(r.alerts).toHaveLength(2)
    expect(r.alerts[0].severity).toBe('critical')
    expect(r.alerts[1].severity).toBe('critical')
  })

  it('mixed → status follows the worst severity', () => {
    const r = computeFreshnessReport(
      [
        { slug: 'fresh', lastReviewed: ago(10) },
        { slug: 'warn', lastReviewed: ago(65) },
        { slug: 'crit', lastReviewed: ago(80) },
      ],
      FIXED_NOW
    )
    expect(r.status).toBe('critical')
    const slugs = r.alerts.map((a) => a.slug).sort()
    expect(slugs).toEqual(['crit', 'warn'])
  })

  it('malformed lastReviewed → treated as critical (Number.POSITIVE_INFINITY age)', () => {
    const r = computeFreshnessReport([{ slug: 'broken', lastReviewed: 'not-a-date' }], FIXED_NOW)
    expect(r.status).toBe('critical')
    expect(r.alerts).toHaveLength(1)
    expect(r.alerts[0].severity).toBe('critical')
    expect(r.alerts[0].ageDays).toBe(Number.POSITIVE_INFINITY)
  })

  it('ageDays map covers every aide regardless of severity', () => {
    const r = computeFreshnessReport(
      [
        { slug: 'a', lastReviewed: ago(5) },
        { slug: 'b', lastReviewed: ago(80) },
      ],
      FIXED_NOW
    )
    expect(r.ageDays).toHaveProperty('a', 5)
    expect(r.ageDays).toHaveProperty('b', 80)
  })

  it('boundary at exactly 60 days → warning (inclusive)', () => {
    const r = computeFreshnessReport([{ slug: 'edge60', lastReviewed: ago(60) }], FIXED_NOW)
    expect(r.alerts[0]?.severity).toBe('warning')
  })

  it('boundary at exactly 75 days → critical (inclusive)', () => {
    const r = computeFreshnessReport([{ slug: 'edge75', lastReviewed: ago(75) }], FIXED_NOW)
    expect(r.alerts[0]?.severity).toBe('critical')
  })
})
