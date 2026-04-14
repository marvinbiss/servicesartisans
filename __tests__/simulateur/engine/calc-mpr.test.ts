import { describe, it, expect } from 'vitest'
import { calcMPRGeste, calcMPRAccompagne } from '@/lib/simulateur/engine/calc-mpr'

describe('calcMPRGeste — PAC air/eau forfaits par catégorie', () => {
  it('Bleu = 5000', () => {
    const r = calcMPRGeste(['PAC_AIREAU'], 'bleu')
    expect(r.total).toBe(5000)
    expect(r.breakdown[0].baremeId).toBe('MPR.PAC_AIREAU.BLEU.2026-01')
  })
  it('Jaune = 4000', () => {
    const r = calcMPRGeste(['PAC_AIREAU'], 'jaune')
    expect(r.total).toBe(4000)
  })
  it('Violet = 3000', () => {
    const r = calcMPRGeste(['PAC_AIREAU'], 'violet')
    expect(r.total).toBe(3000)
  })
  it('Rose = 1000 (retourné tel quel, exclusion gérée ailleurs)', () => {
    const r = calcMPRGeste(['PAC_AIREAU'], 'rose')
    expect(r.total).toBe(1000)
  })
})

describe('calcMPRGeste — BIOMASSE supprimée 01/01/2026', () => {
  it('BIOMASSE → 0 €', () => {
    const r = calcMPRGeste(['BIOMASSE'], 'bleu')
    expect(r.total).toBe(0)
    expect(r.breakdown[0].baremeId).toMatch(/SUPPRIME/)
  })
  it('PAC + BIOMASSE : seul PAC compte', () => {
    const r = calcMPRGeste(['PAC_AIREAU', 'BIOMASSE'], 'jaune')
    expect(r.total).toBe(4000)
    expect(r.breakdown).toHaveLength(2)
  })
})

describe('calcMPRAccompagne — taux selon catégorie + sauts DPE', () => {
  it('Bleu 2 sauts = 60 %', () => {
    const r = calcMPRAccompagne(100000, 'bleu', 2)
    expect(r.taux).toBe(0.6)
    expect(r.total).toBe(60000)
  })
  it('Bleu 4 sauts = 80 %', () => {
    const r = calcMPRAccompagne(100000, 'bleu', 4)
    expect(r.taux).toBe(0.8)
  })
  it('Jaune 3 sauts = 50 %', () => {
    const r = calcMPRAccompagne(100000, 'jaune', 3)
    expect(r.taux).toBe(0.5)
  })
  it('Violet = 45 % (constant)', () => {
    const r = calcMPRAccompagne(100000, 'violet', 4)
    expect(r.taux).toBe(0.45)
    expect(r.total).toBe(45000)
  })
  it('Rose = 10 % (constant)', () => {
    const r = calcMPRAccompagne(100000, 'rose', 4)
    expect(r.taux).toBe(0.1)
    expect(r.total).toBe(10000)
  })
  it('baremeId format correct', () => {
    const r = calcMPRAccompagne(50000, 'violet', 3)
    expect(r.baremeId).toBe('MPR.ACCOMPAGNE.VIOLET.2026-01')
  })
})
