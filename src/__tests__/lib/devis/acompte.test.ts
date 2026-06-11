import { describe, it, expect } from 'vitest'
import { acompteBreakdown } from '@/lib/devis/acompte'

describe('acompteBreakdown', () => {
  it('taux unique : acompte HT/TVA/TTC corrects', () => {
    const bd = acompteBreakdown(
      [
        { quantite: 1, prix_unitaire_ht: 100, tva_rate: 20 },
        { quantite: 1, prix_unitaire_ht: 50, tva_rate: 20 },
      ],
      30
    )
    expect(bd.total_ht).toBe(45) // 30% de 150
    expect(bd.total_tva).toBe(9) // 20% de 45
    expect(bd.total_ttc).toBe(54)
    expect(bd.groups).toHaveLength(1)
  })

  it('multi-taux : un groupe par taux, totaux = somme des groupes', () => {
    const bd = acompteBreakdown(
      [
        { quantite: 1, prix_unitaire_ht: 1000, tva_rate: 20 },
        { quantite: 2, prix_unitaire_ht: 50, tva_rate: 10 },
      ],
      30
    )
    // rate20: HT plein 1000 → acompte 300, TVA 60 ; rate10: HT plein 100 → 30, TVA 3
    expect(bd.groups).toEqual([
      { rate: 10, ht: 30, tva: 3 },
      { rate: 20, ht: 300, tva: 60 },
    ])
    expect(bd.total_ht).toBe(330)
    expect(bd.total_tva).toBe(63)
    expect(bd.total_ttc).toBe(393)
  })

  it('INVARIANT EN16931 : Σ groups.tva == total_tva (BR-CO-14) et Σ ht == total_ht', () => {
    // valeurs à dérive de rounding (per-ligne vs per-groupe)
    const bd = acompteBreakdown(
      [
        { quantite: 1, prix_unitaire_ht: 10.125, tva_rate: 20 },
        { quantite: 1, prix_unitaire_ht: 10.125, tva_rate: 20 },
        { quantite: 3, prix_unitaire_ht: 7.77, tva_rate: 10 },
      ],
      33
    )
    const sumHt = bd.groups.reduce((s, g) => s + g.ht, 0)
    const sumTva = bd.groups.reduce((s, g) => s + g.tva, 0)
    expect(Math.round(sumHt * 100) / 100).toBe(bd.total_ht)
    expect(Math.round(sumTva * 100) / 100).toBe(bd.total_tva)
    expect(bd.total_ttc).toBe(Math.round((bd.total_ht + bd.total_tva) * 100) / 100)
  })

  it('acompte 100% = totaux pleins', () => {
    const bd = acompteBreakdown([{ quantite: 2, prix_unitaire_ht: 100, tva_rate: 20 }], 100)
    expect(bd.total_ht).toBe(200)
    expect(bd.total_tva).toBe(40)
    expect(bd.total_ttc).toBe(240)
  })

  it('aucune ligne = 0', () => {
    const bd = acompteBreakdown([], 30)
    expect(bd).toEqual({ groups: [], total_ht: 0, total_tva: 0, total_ttc: 0 })
  })
})
