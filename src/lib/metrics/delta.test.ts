import { describe, it, expect } from 'vitest'
import { pctDelta, pointDelta, splitHalfDelta, formatPctDelta, formatPointDelta } from './delta'

describe('pctDelta', () => {
  it('retourne null si current ou baseline est null/undefined', () => {
    expect(pctDelta(null, 10)).toBeNull()
    expect(pctDelta(10, null)).toBeNull()
    expect(pctDelta(undefined, undefined)).toBeNull()
  })

  it('retourne 0 si les deux valent 0', () => {
    expect(pctDelta(0, 0)).toBe(0)
  })

  it('retourne null si baseline=0 mais current>0 (pas de référence)', () => {
    expect(pctDelta(5, 0)).toBeNull()
  })

  it('calcule le delta relatif arrondi à 1 décimale', () => {
    expect(pctDelta(110, 100)).toBe(10)
    expect(pctDelta(105, 100)).toBe(5)
    expect(pctDelta(95, 100)).toBe(-5)
    expect(pctDelta(133, 100)).toBe(33)
    expect(pctDelta(133.5, 100)).toBe(33.5)
  })

  it('ignore les NaN et Infinity', () => {
    expect(pctDelta(NaN, 100)).toBeNull()
    expect(pctDelta(100, NaN)).toBeNull()
    expect(pctDelta(Infinity, 100)).toBeNull()
  })
})

describe('pointDelta', () => {
  it('retourne null si null/undefined', () => {
    expect(pointDelta(null, 5)).toBeNull()
    expect(pointDelta(5, null)).toBeNull()
  })

  it('retourne la différence absolue arrondie 1 décimale', () => {
    expect(pointDelta(70, 60)).toBe(10)
    expect(pointDelta(70.5, 60)).toBe(10.5)
    expect(pointDelta(50, 80)).toBe(-30)
  })
})

describe('splitHalfDelta', () => {
  it('retourne null si série trop courte', () => {
    expect(splitHalfDelta([])).toBeNull()
    expect(splitHalfDelta([5])).toBeNull()
  })

  it('retourne null si tout à 0', () => {
    expect(splitHalfDelta([0, 0, 0, 0])).toBeNull()
  })

  it('+100% si première moitié=0 et seconde>0', () => {
    expect(splitHalfDelta([0, 0, 0, 0, 5, 5, 5, 5])).toBe(100)
  })

  it('calcule correctement sur série équilibrée', () => {
    // first = [10,10,10,10] = 40, second = [20,20,20,20] = 80
    // (80-40)/40 * 100 = 100
    expect(splitHalfDelta([10, 10, 10, 10, 20, 20, 20, 20])).toBe(100)
    // first = 40, second = 20 → (20-40)/40 = -50
    expect(splitHalfDelta([10, 10, 10, 10, 5, 5, 5, 5])).toBe(-50)
  })

  it('retourne 0 quand les deux moitiés sont égales', () => {
    expect(splitHalfDelta([5, 5, 5, 5, 5, 5])).toBe(0)
  })
})

describe('formatPctDelta', () => {
  it('retourne — si null', () => {
    expect(formatPctDelta(null)).toBe('—')
  })

  it('préfixe + pour positif, rien pour négatif', () => {
    expect(formatPctDelta(5.3)).toBe('+5.3%')
    expect(formatPctDelta(-5.3)).toBe('-5.3%')
    expect(formatPctDelta(0)).toBe('0%')
  })
})

describe('formatPointDelta', () => {
  it('retourne — si null', () => {
    expect(formatPointDelta(null)).toBe('—')
  })

  it('affiche unité par défaut pt', () => {
    expect(formatPointDelta(10)).toBe('+10 pt')
    expect(formatPointDelta(-5.5)).toBe('-5.5 pt')
  })

  it('accepte une unité custom', () => {
    expect(formatPointDelta(3, 'jours')).toBe('+3 jours')
  })
})
