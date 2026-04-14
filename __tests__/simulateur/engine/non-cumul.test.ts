import { describe, it, expect } from 'vitest'
import { applyNonCumul } from '@/lib/simulateur/engine/non-cumul'

describe('applyNonCumul — paires interdites', () => {
  it('BAR-TH-148 + BAR-TH-171 → garde le plus avantageux', () => {
    const r = applyNonCumul([
      { code: 'BAR-TH-148', montant: 1000 },
      { code: 'BAR-TH-171', montant: 5000 },
    ])
    expect(r.retenues.map((x) => x.code)).toEqual(['BAR-TH-171'])
    expect(r.exclusions).toHaveLength(1)
    expect(r.exclusions[0].garde).toBe('BAR-TH-171')
    expect(r.exclusions[0].exclut).toBe('BAR-TH-148')
  })
  it('BAR-TH-143 + BAR-TH-113 → garde le plus cher', () => {
    const r = applyNonCumul([
      { code: 'BAR-TH-143', montant: 8000 },
      { code: 'BAR-TH-113', montant: 3000 },
    ])
    expect(r.retenues.map((x) => x.code)).toEqual(['BAR-TH-143'])
  })
  it('BAR-TH-143 + BAR-TH-171 → exclus', () => {
    const r = applyNonCumul([
      { code: 'BAR-TH-143', montant: 100 },
      { code: 'BAR-TH-171', montant: 200 },
    ])
    expect(r.retenues.map((x) => x.code)).toEqual(['BAR-TH-171'])
  })
  it('BAR-TH-148 + BAR-TH-172 → exclus', () => {
    const r = applyNonCumul([
      { code: 'BAR-TH-148', montant: 500 },
      { code: 'BAR-TH-172', montant: 300 },
    ])
    expect(r.exclusions).toHaveLength(1)
    expect(r.retenues.map((x) => x.code)).toEqual(['BAR-TH-148'])
  })
  it('pas d exclusion sur combinaisons autorisées', () => {
    const r = applyNonCumul([
      { code: 'BAR-TH-148', montant: 500 },
      { code: 'BAR-TH-127', montant: 300 },
    ])
    expect(r.exclusions).toEqual([])
    expect(r.retenues).toHaveLength(2)
  })
  it('liste vide → pas d exclusion', () => {
    const r = applyNonCumul([])
    expect(r.retenues).toEqual([])
  })
})
