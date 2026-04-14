import { describe, it, expect } from 'vitest'
import { classifierCategorieAnah, getPlafondsAnah } from '@/lib/simulateur/engine/classifier'

describe('classifier — plafonds ANAH hors IdF', () => {
  it('foyer 1 pers : bleu si RFR ≤ 17363', () => {
    expect(classifierCategorieAnah(17363, 1, false)).toBe('bleu')
    expect(classifierCategorieAnah(17364, 1, false)).toBe('jaune')
  })
  it('foyer 1 pers : jaune si 17363 < RFR ≤ 22259', () => {
    expect(classifierCategorieAnah(22259, 1, false)).toBe('jaune')
    expect(classifierCategorieAnah(22260, 1, false)).toBe('violet')
  })
  it('foyer 1 pers : violet si 22259 < RFR ≤ 31185', () => {
    expect(classifierCategorieAnah(31185, 1, false)).toBe('violet')
    expect(classifierCategorieAnah(31186, 1, false)).toBe('rose')
  })
  it('foyer 4 pers : frontières exactes', () => {
    expect(classifierCategorieAnah(35676, 4, false)).toBe('bleu')
    expect(classifierCategorieAnah(45735, 4, false)).toBe('jaune')
    expect(classifierCategorieAnah(64550, 4, false)).toBe('violet')
    expect(classifierCategorieAnah(64551, 4, false)).toBe('rose')
  })
  it('foyer 5 pers : frontières exactes', () => {
    expect(classifierCategorieAnah(40835, 5, false)).toBe('bleu')
    expect(classifierCategorieAnah(52348, 5, false)).toBe('jaune')
    expect(classifierCategorieAnah(73907, 5, false)).toBe('violet')
  })
})

describe('classifier — plafonds ANAH IdF', () => {
  it('foyer 1 pers IdF : frontières', () => {
    expect(classifierCategorieAnah(24031, 1, true)).toBe('bleu')
    expect(classifierCategorieAnah(29253, 1, true)).toBe('jaune')
    expect(classifierCategorieAnah(40851, 1, true)).toBe('violet')
    expect(classifierCategorieAnah(40852, 1, true)).toBe('rose')
  })
  it('foyer 4 pers IdF : frontières', () => {
    expect(classifierCategorieAnah(49455, 4, true)).toBe('bleu')
    expect(classifierCategorieAnah(60208, 4, true)).toBe('jaune')
    expect(classifierCategorieAnah(84562, 4, true)).toBe('violet')
  })
})

describe('classifier — incrément >5 pers', () => {
  it('foyer 6 pers hors IdF = base 5 + 1× increment', () => {
    const p = getPlafondsAnah(6, false)
    expect(p.bleu).toBe(40835 + 5151)
    expect(p.jaune).toBe(52348 + 6598)
    expect(p.violet).toBe(73907 + 9357)
  })
  it('foyer 7 pers IdF = base 5 + 2× increment', () => {
    const p = getPlafondsAnah(7, true)
    expect(p.bleu).toBe(56580 + 2 * 7116)
    expect(p.jaune).toBe(68877 + 2 * 8663)
    expect(p.violet).toBe(96817 + 2 * 12257)
  })
  it('classifier applique correctement incrément hors IdF', () => {
    // 6 pers bleu ≤ 45986
    expect(classifierCategorieAnah(45986, 6, false)).toBe('bleu')
    expect(classifierCategorieAnah(45987, 6, false)).toBe('jaune')
  })
})

describe('classifier — entrées invalides', () => {
  it('RFR négatif → throw', () => {
    expect(() => classifierCategorieAnah(-1, 1, false)).toThrow()
  })
  it('foyer 0 → throw', () => {
    expect(() => classifierCategorieAnah(20000, 0, false)).toThrow()
  })
})
