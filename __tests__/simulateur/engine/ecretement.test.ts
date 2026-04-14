import { describe, it, expect } from 'vitest'
import { applyEcretement } from '@/lib/simulateur/engine/ecretement'

describe('applyEcretement — parcours geste', () => {
  it('Bleu 90 % budget 10000 → aides plafonnées à 9000', () => {
    const r = applyEcretement(
      [
        { code: 'MPR', montant: 6000 },
        { code: 'CEE', montant: 6000 },
      ],
      10000,
      'bleu',
      'geste'
    )
    expect(r.plafondPct).toBe(0.9)
    expect(r.plafondAtteint).toBe(true)
    expect(r.totalApresPlafond).toBe(9000)
  })
  it('Jaune 75 % — aides en dessous du plafond non touchées', () => {
    const r = applyEcretement([{ code: 'MPR', montant: 4000 }], 10000, 'jaune', 'geste')
    expect(r.plafondPct).toBe(0.75)
    expect(r.plafondAtteint).toBe(false)
    expect(r.aidesPlafonnees[0].montant).toBe(4000)
  })
  it('Violet 60 %', () => {
    const r = applyEcretement([{ code: 'MPR', montant: 8000 }], 10000, 'violet', 'geste')
    expect(r.plafondPct).toBe(0.6)
    expect(r.plafondAtteint).toBe(true)
    expect(r.totalApresPlafond).toBe(6000)
  })
  it('Rose + geste → exclusion totale avec message', () => {
    const r = applyEcretement([{ code: 'MPR', montant: 1000 }], 10000, 'rose', 'geste')
    expect(r.exclusionMessage).toMatch(/Rose/)
    expect(r.totalApresPlafond).toBe(0)
  })
})

describe('applyEcretement — parcours accompagné', () => {
  it('Bleu 100 %', () => {
    const r = applyEcretement([{ code: 'MPR', montant: 50000 }], 50000, 'bleu', 'accompagne')
    expect(r.plafondPct).toBe(1.0)
    expect(r.plafondAtteint).toBe(false)
  })
  it('Jaune 90 %', () => {
    const r = applyEcretement([{ code: 'MPR', montant: 50000 }], 50000, 'jaune', 'accompagne')
    expect(r.plafondPct).toBe(0.9)
    expect(r.plafondAtteint).toBe(true)
    expect(r.totalApresPlafond).toBe(45000)
  })
  it('Violet 80 %', () => {
    const r = applyEcretement([{ code: 'MPR', montant: 50000 }], 50000, 'violet', 'accompagne')
    expect(r.plafondPct).toBe(0.8)
    expect(r.totalApresPlafond).toBe(40000)
  })
  it('Rose 50 %', () => {
    const r = applyEcretement([{ code: 'MPR', montant: 30000 }], 50000, 'rose', 'accompagne')
    expect(r.plafondPct).toBe(0.5)
    expect(r.totalApresPlafond).toBe(25000)
  })
})
