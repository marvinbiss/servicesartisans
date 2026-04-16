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
    expect(r.uncertainCombinations).toEqual([])
  })
})

describe('applyNonCumul — combinaisons incertaines (NON_CUMUL_UNCERTAIN)', () => {
  it('BAR-TH-112 + BAR-TH-101 = incertain (ni blacklist ni safe)', () => {
    const r = applyNonCumul([
      { code: 'BAR-TH-112', montant: 500 },
      { code: 'BAR-TH-101', montant: 200 },
    ])
    expect(r.retenues).toHaveLength(2) // pas exclus, juste tagué
    expect(r.uncertainCombinations).toContain('BAR-TH-112 + BAR-TH-101')
  })
  it('BAR-EN-101 + BAR-EN-102 = safe (combinaison connue)', () => {
    const r = applyNonCumul([
      { code: 'BAR-EN-101', montant: 1000 },
      { code: 'BAR-EN-102', montant: 2000 },
    ])
    expect(r.uncertainCombinations).toEqual([])
  })
  it('BAR-TH-171 + BAR-EN-101 = safe', () => {
    const r = applyNonCumul([
      { code: 'BAR-TH-171', montant: 3000 },
      { code: 'BAR-EN-101', montant: 1500 },
    ])
    expect(r.uncertainCombinations).toEqual([])
  })
  it('3 fiches dont 1 paire incertaine', () => {
    const r = applyNonCumul([
      { code: 'BAR-TH-125', montant: 400 },
      { code: 'BAR-TH-112', montant: 500 },
      { code: 'BAR-EN-101', montant: 1000 },
    ])
    // BAR-TH-125 + BAR-EN-101 = safe
    // BAR-TH-125 + BAR-TH-112 = incertain
    // BAR-TH-112 + BAR-EN-101 = incertain
    expect(r.uncertainCombinations.length).toBeGreaterThanOrEqual(1)
    expect(r.exclusions).toEqual([]) // rien n'est exclu, juste tagué
  })
})
