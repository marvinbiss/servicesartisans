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
  it('POELE_BUCHES Bleu = 1250 avec baremeId UNCONFIRMED', () => {
    const r = calcMPRGeste(['POELE_BUCHES'], 'bleu')
    expect(r.total).toBe(1250)
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
  it('ISO_TOITURE_RAMPANTS Bleu sans surface → 0 € avec baremeId NEEDS_SURFACE', () => {
    const r = calcMPRGeste(['ISO_TOITURE_RAMPANTS'], 'bleu')
    expect(r.total).toBe(0)
    expect(r.breakdown[0].forfait).toBe(0)
    expect(r.breakdown[0].baremeId).toMatch(/\.NEEDS_SURFACE\./)
    expect(r.breakdown[0].baremeId).toBe('MPR.ISO_TOITURE_RAMPANTS.BLEU.NEEDS_SURFACE.2026-01')
  })
  it('ISO_TOITURE_TERRASSE Jaune sans surface → 0 € avec baremeId NEEDS_SURFACE', () => {
    const r = calcMPRGeste(['ISO_TOITURE_TERRASSE'], 'jaune')
    expect(r.total).toBe(0)
    expect(r.breakdown[0].baremeId).toMatch(/\.NEEDS_SURFACE\./)
  })
  it('ISO_TOITURE_TERRASSE Violet sans surface → 0 € avec baremeId NEEDS_SURFACE', () => {
    // Remplace l'ancien test ISO_PLANCHERS_BAS : ce geste est désormais
    // SUPPRIMES en parcours geste 2026 (source : PDF ANAH p.13-17).
    const r = calcMPRGeste(['ISO_TOITURE_TERRASSE'], 'violet')
    expect(r.total).toBe(0)
    expect(r.breakdown[0].baremeId).toMatch(/\.NEEDS_SURFACE\./)
  })

  it('surface absente via map vide → NEEDS_SURFACE, pas OFFICIAL_BAREME', () => {
    const r = calcMPRGeste(['ISO_TOITURE_RAMPANTS'], 'bleu', {})
    expect(r.total).toBe(0)
    expect(r.breakdown[0].baremeId).toMatch(/\.NEEDS_SURFACE\./)
  })

  it('surface 0 ou négative → NEEDS_SURFACE (garde-fou)', () => {
    const r = calcMPRGeste(['ISO_TOITURE_RAMPANTS'], 'bleu', { ISO_TOITURE_RAMPANTS: 0 })
    expect(r.total).toBe(0)
    expect(r.breakdown[0].baremeId).toMatch(/\.NEEDS_SURFACE\./)
  })

  it('Rose prime sur toute isolation (non éligible) → 0 € NON_ELIGIBLE même avec surface', () => {
    const r = calcMPRGeste(['ISO_TOITURE_RAMPANTS'], 'rose', { ISO_TOITURE_RAMPANTS: 100 })
    expect(r.total).toBe(0)
    expect(r.breakdown[0].baremeId).toMatch(/\.NON_ELIGIBLE\./)
  })
})

describe('calcMPRGeste — gestes supprimés parcours geste 2026 (ITE/ITI/ISOLATION_MURS/PLANCHERS_BAS)', () => {
  // Source PDF ANAH "Les aides financières en 2026" p.13 :
  // "A partir du 1er janvier 2026, l'isolation des murs et les chaudières
  //  biomasse ne sont plus financés."
  // Le tableau p.16 ne liste plus l'isolation des planchers bas en parcours geste
  // (uniquement en rénovation d'ampleur p.20).
  it('ITE avec surface saisie → .SUPPRIME.', () => {
    const r = calcMPRGeste(['ITE'], 'bleu', { ITE: 120 })
    expect(r.total).toBe(0)
    expect(r.breakdown[0].baremeId).toMatch(/\.SUPPRIME\./)
  })
  it('ITI avec surface saisie → .SUPPRIME.', () => {
    const r = calcMPRGeste(['ITI'], 'jaune', { ITI: 80 })
    expect(r.total).toBe(0)
    expect(r.breakdown[0].baremeId).toMatch(/\.SUPPRIME\./)
  })
  it('ISOLATION_MURS avec surface saisie → .SUPPRIME.', () => {
    const r = calcMPRGeste(['ISOLATION_MURS'], 'violet', { ISOLATION_MURS: 100 })
    expect(r.total).toBe(0)
    expect(r.breakdown[0].baremeId).toMatch(/\.SUPPRIME\./)
  })
  it('ISO_PLANCHERS_BAS avec surface saisie → .SUPPRIME. (rénovation ampleur uniquement)', () => {
    const r = calcMPRGeste(['ISO_PLANCHERS_BAS'], 'bleu', { ISO_PLANCHERS_BAS: 80 })
    expect(r.total).toBe(0)
    expect(r.breakdown[0].baremeId).toMatch(/\.SUPPRIME\./)
  })
})

describe('calcMPRGeste — valeurs référentielles ANAH 2026 (source : PDF ANAH p.16)', () => {
  // Forfaits officiels parcours par geste 2026 :
  // Rampants de toiture / plafonds de combles : 25 / 20 / 15 / non éligible €/m²
  // Toitures-terrasses                        : 75 / 60 / 40 / non éligible €/m²

  it('ISO_TOITURE_RAMPANTS Bleu 60 m² = 1 500 €', () => {
    const r = calcMPRGeste(['ISO_TOITURE_RAMPANTS'], 'bleu', { ISO_TOITURE_RAMPANTS: 60 })
    expect(r.total).toBe(60 * 25) // 1500
    expect(r.breakdown[0].forfait).toBe(1500)
    expect(r.breakdown[0].baremeId).toBe('MPR.ISO_TOITURE_RAMPANTS.BLEU.PAR_M2.2026-01')
  })
  it('ISO_TOITURE_RAMPANTS Jaune 80 m² = 1 600 €', () => {
    const r = calcMPRGeste(['ISO_TOITURE_RAMPANTS'], 'jaune', { ISO_TOITURE_RAMPANTS: 80 })
    expect(r.total).toBe(80 * 20) // 1600
  })
  it('ISO_TOITURE_RAMPANTS Violet 100 m² = 1 500 €', () => {
    const r = calcMPRGeste(['ISO_TOITURE_RAMPANTS'], 'violet', { ISO_TOITURE_RAMPANTS: 100 })
    expect(r.total).toBe(100 * 15) // 1500
  })
  it('ISO_TOITURE_RAMPANTS Rose 100 m² → NON_ELIGIBLE (ménages supérieurs non éligibles)', () => {
    const r = calcMPRGeste(['ISO_TOITURE_RAMPANTS'], 'rose', { ISO_TOITURE_RAMPANTS: 100 })
    expect(r.total).toBe(0)
    expect(r.breakdown[0].baremeId).toMatch(/\.NON_ELIGIBLE\./)
  })

  it('ISO_TOITURE_TERRASSE Bleu 50 m² = 3 750 €', () => {
    const r = calcMPRGeste(['ISO_TOITURE_TERRASSE'], 'bleu', { ISO_TOITURE_TERRASSE: 50 })
    expect(r.total).toBe(50 * 75) // 3750
  })
  it('ISO_TOITURE_TERRASSE Jaune 50 m² = 3 000 €', () => {
    const r = calcMPRGeste(['ISO_TOITURE_TERRASSE'], 'jaune', { ISO_TOITURE_TERRASSE: 50 })
    expect(r.total).toBe(50 * 60) // 3000
  })
  it('ISO_TOITURE_TERRASSE Violet 100 m² = 4 000 €', () => {
    const r = calcMPRGeste(['ISO_TOITURE_TERRASSE'], 'violet', { ISO_TOITURE_TERRASSE: 100 })
    expect(r.total).toBe(100 * 40) // 4000
  })

  it('ISOLATION_TOITURE (alias legacy) suit les valeurs rampants — Bleu 80 m² = 2 000 €', () => {
    const r = calcMPRGeste(['ISOLATION_TOITURE'], 'bleu', { ISOLATION_TOITURE: 80 })
    expect(r.total).toBe(80 * 25) // 2000
  })

  it('Cumul 2 gestes : rampants 60 m² + terrasse 40 m² Bleu = 1500 + 3000 = 4 500 €', () => {
    const r = calcMPRGeste(['ISO_TOITURE_RAMPANTS', 'ISO_TOITURE_TERRASSE'], 'bleu', {
      ISO_TOITURE_RAMPANTS: 60,
      ISO_TOITURE_TERRASSE: 40,
    })
    expect(r.total).toBe(60 * 25 + 40 * 75) // 4500
    expect(r.breakdown).toHaveLength(2)
  })
})

describe('calcMPRAccompagne — taux flat par catégorie (arrêté ANAH 2026)', () => {
  it('Bleu 2 sauts = 80 % (plafonné à 30K HT)', () => {
    const r = calcMPRAccompagne(100000, 'bleu', 2)
    expect(r.taux).toBe(0.8)
    // plafond HT 2 sauts = 30000, donc 30000 * 0.80 = 24000
    expect(r.total).toBe(24000)
    expect(r.budgetPlafonne).toBe(30000)
    expect(r.plafondHt).toBe(30000)
  })
  it('Bleu 3 sauts = 80 % (plafonné à 40K HT)', () => {
    const r = calcMPRAccompagne(100000, 'bleu', 3)
    expect(r.taux).toBe(0.8)
    // plafond HT 3 sauts = 40000, donc 40000 * 0.80 = 32000
    expect(r.total).toBe(32000)
    expect(r.budgetPlafonne).toBe(40000)
  })
  it('Bleu 4 sauts = 80 % (plafonné à 40K HT)', () => {
    const r = calcMPRAccompagne(100000, 'bleu', 4)
    expect(r.taux).toBe(0.8)
    expect(r.total).toBe(32000)
    expect(r.budgetPlafonne).toBe(40000)
  })
  it('Jaune 3 sauts = 60 % (plafonné à 40K HT)', () => {
    const r = calcMPRAccompagne(100000, 'jaune', 3)
    expect(r.taux).toBe(0.6)
    // 40000 * 0.60 = 24000
    expect(r.total).toBe(24000)
  })
  it('Violet = 45 % (plafonné à 40K HT pour 4 sauts)', () => {
    const r = calcMPRAccompagne(100000, 'violet', 4)
    expect(r.taux).toBe(0.45)
    // plafond HT 4 sauts = 40000, donc 40000 * 0.45 = 18000
    expect(r.total).toBe(18000)
    expect(r.budgetPlafonne).toBe(40000)
  })
  it('Rose = 10 % (plafonné à 40K HT pour 4 sauts)', () => {
    const r = calcMPRAccompagne(100000, 'rose', 4)
    expect(r.taux).toBe(0.1)
    // plafond HT 4 sauts = 40000, donc 40000 * 0.10 = 4000
    expect(r.total).toBe(4000)
    expect(r.budgetPlafonne).toBe(40000)
  })
  it('baremeId format correct (inclut sauts DPE)', () => {
    const r = calcMPRAccompagne(50000, 'violet', 3)
    expect(r.baremeId).toBe('MPR.ACCOMPAGNE.VIOLET.3SAUTS.2026-01')
  })
  it('Budget inférieur au plafond → budgetPlafonne = budgetHt', () => {
    const r = calcMPRAccompagne(20000, 'bleu', 2)
    expect(r.budgetPlafonne).toBe(20000)
    // 20000 * 0.80 = 16000
    expect(r.total).toBe(16000)
  })
})
