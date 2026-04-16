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
  it('Rose = 0 (non éligible parcours geste, baremeId NON_ELIGIBLE)', () => {
    const r = calcMPRGeste(['PAC_AIREAU'], 'rose')
    expect(r.total).toBe(0)
    expect(r.breakdown[0].forfait).toBe(0)
    expect(r.breakdown[0].baremeId).toMatch(/NON_ELIGIBLE/)
  })
})

describe('calcMPRGeste — gestes supprimés 01/01/2026', () => {
  it('BIOMASSE → 0 €', () => {
    const r = calcMPRGeste(['BIOMASSE'], 'bleu')
    expect(r.total).toBe(0)
    expect(r.breakdown[0].baremeId).toMatch(/SUPPRIME/)
  })
  it('ITE → 0 € avec baremeId SUPPRIME', () => {
    const r = calcMPRGeste(['ITE'], 'bleu')
    expect(r.total).toBe(0)
    expect(r.breakdown[0].baremeId).toMatch(/ITE\.BLEU\.SUPPRIME/)
  })
  it('ITI → 0 € avec baremeId SUPPRIME', () => {
    const r = calcMPRGeste(['ITI'], 'jaune')
    expect(r.total).toBe(0)
    expect(r.breakdown[0].baremeId).toMatch(/ITI\.JAUNE\.SUPPRIME/)
  })
  it('PAC + BIOMASSE : seul PAC compte', () => {
    const r = calcMPRGeste(['PAC_AIREAU', 'BIOMASSE'], 'jaune')
    expect(r.total).toBe(4000)
    expect(r.breakdown).toHaveLength(2)
  })
})

describe('calcMPRGeste — nouveaux forfaits parcours geste (doc 01 §70-120)', () => {
  it('PAC_GEOTHERMIE Bleu = 11000', () => {
    const r = calcMPRGeste(['PAC_GEOTHERMIE'], 'bleu')
    expect(r.total).toBe(11000)
    expect(r.breakdown[0].baremeId).toBe('MPR.PAC_GEOTHERMIE.BLEU.2026-01')
  })
  it('CET Bleu = 1200', () => {
    const r = calcMPRGeste(['CET'], 'bleu')
    expect(r.total).toBe(1200)
    expect(r.breakdown[0].baremeId).toBe('MPR.CET.BLEU.2026-01')
  })
  it('CESI Bleu = 4000 avec baremeId UNCONFIRMED', () => {
    const r = calcMPRGeste(['CESI'], 'bleu')
    expect(r.total).toBe(4000)
    expect(r.breakdown[0].baremeId).toMatch(/\.UNCONFIRMED\./)
    expect(r.breakdown[0].baremeId).toBe('MPR.CESI.BLEU.UNCONFIRMED.2026-01')
  })
  it('POELE_GRANULES Bleu = 1250', () => {
    const r = calcMPRGeste(['POELE_GRANULES'], 'bleu')
    expect(r.total).toBe(1250)
    expect(r.breakdown[0].baremeId).toBe('MPR.POELE_GRANULES.BLEU.2026-01')
  })
  it('POELE_BUCHES Bleu = 1000 avec baremeId UNCONFIRMED', () => {
    const r = calcMPRGeste(['POELE_BUCHES'], 'bleu')
    expect(r.total).toBe(1000)
    expect(r.breakdown[0].baremeId).toMatch(/\.UNCONFIRMED\./)
  })
  it('VMC_2FLUX Bleu = 2500', () => {
    const r = calcMPRGeste(['VMC_2FLUX'], 'bleu')
    expect(r.total).toBe(2500)
    expect(r.breakdown[0].baremeId).toBe('MPR.VMC_2FLUX.BLEU.2026-01')
  })
  it('AUDIT_ENERGETIQUE Bleu = 500', () => {
    const r = calcMPRGeste(['AUDIT_ENERGETIQUE'], 'bleu')
    expect(r.total).toBe(500)
    expect(r.breakdown[0].baremeId).toBe('MPR.AUDIT_ENERGETIQUE.BLEU.2026-01')
  })
})

describe('calcMPRGeste — Rose = 0 pour tous gestes éligibles', () => {
  it.each([
    ['PAC_AIREAU'],
    ['PAC_GEOTHERMIE'],
    ['CET'],
    ['CESI'],
    ['POELE_GRANULES'],
    ['POELE_BUCHES'],
    ['VMC_2FLUX'],
    ['AUDIT_ENERGETIQUE'],
  ] as const)('%s → 0 € pour Rose avec baremeId NON_ELIGIBLE', (g) => {
    const r = calcMPRGeste([g], 'rose')
    expect(r.total).toBe(0)
    expect(r.breakdown[0].baremeId).toMatch(/NON_ELIGIBLE/)
  })
})

describe('calcMPRGeste — gestes NEEDS_SURFACE (isolation €/m²)', () => {
  it('ISO_TOITURE_RAMPANTS Bleu → 0 € avec baremeId NEEDS_SURFACE', () => {
    const r = calcMPRGeste(['ISO_TOITURE_RAMPANTS'], 'bleu')
    expect(r.total).toBe(0)
    expect(r.breakdown[0].forfait).toBe(0)
    expect(r.breakdown[0].baremeId).toMatch(/\.NEEDS_SURFACE\./)
    expect(r.breakdown[0].baremeId).toBe('MPR.ISO_TOITURE_RAMPANTS.BLEU.NEEDS_SURFACE.2026-01')
  })
  it('ISO_TOITURE_TERRASSE Jaune → 0 € avec baremeId NEEDS_SURFACE', () => {
    const r = calcMPRGeste(['ISO_TOITURE_TERRASSE'], 'jaune')
    expect(r.total).toBe(0)
    expect(r.breakdown[0].baremeId).toMatch(/\.NEEDS_SURFACE\./)
  })
  it('ISO_PLANCHERS_BAS Violet → 0 € avec baremeId NEEDS_SURFACE', () => {
    const r = calcMPRGeste(['ISO_PLANCHERS_BAS'], 'violet')
    expect(r.total).toBe(0)
    expect(r.breakdown[0].baremeId).toMatch(/\.NEEDS_SURFACE\./)
  })
})

describe('calcMPRAccompagne — taux selon catégorie + sauts DPE', () => {
  it('Bleu 2 sauts = 60 % (plafonné à 40K HT)', () => {
    const r = calcMPRAccompagne(100000, 'bleu', 2)
    expect(r.taux).toBe(0.6)
    // plafond HT 2 sauts = 40000, donc 40000 * 0.6 = 24000
    expect(r.total).toBe(24000)
    expect(r.budgetPlafonne).toBe(40000)
  })
  it('Bleu 4 sauts = 80 %', () => {
    const r = calcMPRAccompagne(100000, 'bleu', 4)
    expect(r.taux).toBe(0.8)
  })
  it('Jaune 3 sauts = 50 %', () => {
    const r = calcMPRAccompagne(100000, 'jaune', 3)
    expect(r.taux).toBe(0.5)
  })
  it('Violet = 45 % (constant, plafonné à 70K HT)', () => {
    const r = calcMPRAccompagne(100000, 'violet', 4)
    expect(r.taux).toBe(0.45)
    // plafond HT 4 sauts = 70000, donc 70000 * 0.45 = 31500
    expect(r.total).toBe(31500)
    expect(r.budgetPlafonne).toBe(70000)
  })
  it('Rose = 10 % (constant, plafonné à 70K HT)', () => {
    const r = calcMPRAccompagne(100000, 'rose', 4)
    expect(r.taux).toBe(0.1)
    // plafond HT 4 sauts = 70000, donc 70000 * 0.1 = 7000
    expect(r.total).toBe(7000)
    expect(r.budgetPlafonne).toBe(70000)
  })
  it('baremeId format correct (inclut sauts DPE)', () => {
    const r = calcMPRAccompagne(50000, 'violet', 3)
    expect(r.baremeId).toBe('MPR.ACCOMPAGNE.VIOLET.3SAUTS.2026-01')
  })
})
