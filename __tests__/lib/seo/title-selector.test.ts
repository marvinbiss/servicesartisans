import { describe, expect, it } from 'vitest'
import { selectFittingTitle, truncateTitle } from '@/lib/seo/title-selector'

describe('truncateTitle', () => {
  it('returns string as-is when under limit', () => {
    expect(truncateTitle('Plombier Paris', 41)).toBe('Plombier Paris')
  })

  it('truncates on word boundary with ellipsis', () => {
    const out = truncateTitle('Plombier Saint-Just-en-Chaussée — Devis Gratuit 2026', 41)
    expect(out.length).toBeLessThanOrEqual(41)
    expect(out.endsWith('…')).toBe(true)
    expect(out).not.toMatch(/\s$/)
  })

  it('handles single word longer than maxLen with hard cut', () => {
    const out = truncateTitle('Saint-Just-en-Chausseéééééé-Sur-Seine', 20)
    expect(out.length).toBeLessThanOrEqual(20)
    expect(out.endsWith('…')).toBe(true)
  })

  it('returns empty string when maxLen <= 1', () => {
    expect(truncateTitle('Plombier', 0)).toBe('')
    expect(truncateTitle('Plombier', 1)).toBe('')
  })
})

describe('selectFittingTitle', () => {
  const variants = [
    'Plombier Paris 24h/24 · Intervention 2026 — Devis 2h Express', // 60 (won't fit at 41)
    'Plombier Paris : 42 pros dispo 24h', // 34
    'Plombier Paris — Urgence 24h/24', // 31
    'Plombier Paris 24h', // 18
  ]

  it('returns first variant ≤ maxLen rotating from hash offset', () => {
    const out = selectFittingTitle(variants, 1, 41) // offset=1
    expect(out.length).toBeLessThanOrEqual(41)
    expect(out).toBe('Plombier Paris : 42 pros dispo 24h')
  })

  it('rotates back to start when offset variant doesn’t fit', () => {
    const out = selectFittingTitle(variants, 0, 41) // offset=0 (60c, doesn't fit)
    // Falls through to variant[1] (34c) which fits
    expect(out).toBe('Plombier Paris : 42 pros dispo 24h')
  })

  it('returns truncated offset variant when no variant fits', () => {
    const allLong = ['Plombier Saint-Just-en-Chaussée — Devis Gratuit 2026 - Express']
    const out = selectFittingTitle(allLong, 0, 41)
    expect(out.length).toBeLessThanOrEqual(41)
    expect(out.endsWith('…')).toBe(true)
  })

  it('returns empty string when variants array is empty', () => {
    expect(selectFittingTitle([], 0, 41)).toBe('')
  })

  it('is deterministic on same hash (rotation stable across deploys)', () => {
    expect(selectFittingTitle(variants, 42, 41)).toBe(selectFittingTitle(variants, 42, 41))
  })

  it('handles negative hash via Math.abs', () => {
    const out = selectFittingTitle(variants, -1, 41)
    expect(variants).toContain(out.replace('…', '').trim())
  })
})
