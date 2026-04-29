import { describe, it, expect } from 'vitest'
import { countLabelForSummary, buildEnBrefPoints } from '../sprint-helpers'

// ---------------------------------------------------------------------------
// countLabelForSummary
// ---------------------------------------------------------------------------

describe('countLabelForSummary', () => {
  it('returns "des centaines de" when count is 0', () => {
    expect(countLabelForSummary(0)).toBe('des centaines de')
  })

  it('returns "{n}+" for small positive counts', () => {
    expect(countLabelForSummary(12)).toBe('12+')
    expect(countLabelForSummary(999)).toBe('999+')
  })

  it('rounds down to nearest 100 for big counts (>= 1000)', () => {
    expect(countLabelForSummary(1000)).toBe('plus de 1000+')
    expect(countLabelForSummary(1234)).toBe('plus de 1200+')
    expect(countLabelForSummary(45678)).toBe('plus de 45600+')
  })

  it('never crashes on negative count and falls back', () => {
    expect(countLabelForSummary(-1)).toBe('des centaines de')
  })
})

// ---------------------------------------------------------------------------
// buildEnBrefPoints
// ---------------------------------------------------------------------------

describe('buildEnBrefPoints', () => {
  it('uses provider count when > 0', () => {
    const points = buildEnBrefPoints({
      serviceName: 'Plombier',
      providerCount: 1234,
      trade: null,
      villesCount: 5000,
    })
    expect(points[0]).toMatch(/1\s?234 plombier vérifiés SIREN/)
  })

  it('falls back to villes count when no providers', () => {
    const points = buildEnBrefPoints({
      serviceName: 'Plombier',
      providerCount: 0,
      trade: null,
      villesCount: 5000,
    })
    expect(points[0]).toContain('Annuaire plombier')
    expect(points[0]).toMatch(/5\s?000\+ villes/)
  })

  it('inserts a price line when trade is provided', () => {
    const points = buildEnBrefPoints({
      serviceName: 'Plombier',
      providerCount: 100,
      trade: { priceRange: { min: 60, max: 90, unit: '€/h' } },
      villesCount: 5000,
    })
    expect(points.some((p) => p.includes('60–90 €/h'))).toBe(true)
  })

  it('always ends with the trust + freshness lines', () => {
    const points = buildEnBrefPoints({
      serviceName: 'Plombier',
      providerCount: 0,
      trade: null,
      villesCount: 100,
    })
    expect(points).toContain('Devis gratuits sous 24h, sans engagement')
    expect(points).toContain('Données SIRENE officielles, mises à jour quotidiennement')
  })

  it('does not produce price line when trade is null/undefined', () => {
    const points = buildEnBrefPoints({
      serviceName: 'Serrurier',
      providerCount: 5,
      trade: undefined,
      villesCount: 100,
    })
    expect(points.some((p) => p.includes('Fourchette de prix'))).toBe(false)
  })
})
