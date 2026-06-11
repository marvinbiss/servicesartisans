import { describe, it, expect } from 'vitest'
import { lineTotalHt, computeTotals, acompteAmount } from '@/lib/devis/totals'

describe('lineTotalHt', () => {
  it('multiplie quantité × PU HT', () => {
    expect(lineTotalHt({ quantite: 3, prix_unitaire_ht: 12.5 })).toBe(37.5)
  })

  it('arrondit à 2 décimales sans dérive flottante', () => {
    expect(lineTotalHt({ quantite: 3, prix_unitaire_ht: 0.1 })).toBe(0.3)
  })
})

describe('computeTotals', () => {
  it('somme HT, TVA et TTC sur plusieurs lignes', () => {
    const totals = computeTotals([
      { quantite: 1, prix_unitaire_ht: 100, tva_rate: 20 },
      { quantite: 2, prix_unitaire_ht: 50, tva_rate: 10 },
    ])
    expect(totals.total_ht).toBe(200)
    expect(totals.total_tva).toBe(30) // 20 + 10
    expect(totals.total_ttc).toBe(230)
  })

  it('gère la TVA réno 5,5 %', () => {
    const totals = computeTotals([{ quantite: 1, prix_unitaire_ht: 1000, tva_rate: 5.5 }])
    expect(totals.total_ht).toBe(1000)
    expect(totals.total_tva).toBe(55)
    expect(totals.total_ttc).toBe(1055)
  })

  it('renvoie 0 sur liste vide', () => {
    expect(computeTotals([])).toEqual({ total_ht: 0, total_tva: 0, total_ttc: 0 })
  })
})

describe('acompteAmount', () => {
  it('calcule 30 % du TTC', () => {
    expect(acompteAmount(1000, 30)).toBe(300)
  })

  it('arrondit au centime', () => {
    expect(acompteAmount(1055, 30)).toBe(316.5)
  })

  it('0 % = 0', () => {
    expect(acompteAmount(1000, 0)).toBe(0)
  })
})
