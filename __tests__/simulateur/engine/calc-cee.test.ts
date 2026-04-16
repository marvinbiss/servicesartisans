import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  calcBarTh148,
  calcBarTh113,
  calcBarTh143,
  calcVMCSimpleFlux,
  computeBarTh171,
  calcBarTh125,
  calcBarTh112,
  calcBarTh101,
  calcPacGeoFallback,
  fourchettePrime,
  calcCEEFiche,
} from '@/lib/simulateur/engine/calc-cee'

describe('BAR-TH-148', () => {
  it('maison = 14700 kWhc', () => {
    const r = calcBarTh148('maison')
    expect(r.kwhCumac).toBe(14700)
    expect(r.baremeId).toBe('CEE.BAR-TH-148.MI.2026-01')
  })
  it('appartement = 11800 kWhc', () => {
    expect(calcBarTh148('appartement').kwhCumac).toBe(11800)
  })
})

describe('BAR-TH-113 biomasse', () => {
  it('H1=41300, H2=33800, H3=26300', () => {
    expect(calcBarTh113('H1').kwhCumac).toBe(41300)
    expect(calcBarTh113('H2').kwhCumac).toBe(33800)
    expect(calcBarTh113('H3').kwhCumac).toBe(26300)
  })
})

describe('BAR-TH-143 SSC', () => {
  it('H1=134800, H2=121000, H3=100500', () => {
    expect(calcBarTh143('H1').kwhCumac).toBe(134800)
    expect(calcBarTh143('H2').kwhCumac).toBe(121000)
    expect(calcBarTh143('H3').kwhCumac).toBe(100500)
  })
})

describe('BAR-TH-127 VMC simple flux', () => {
  it('H1 100m² B_caisson_BC = 31600 × 1.0 × 1.0 = 31600', () => {
    const r = calcVMCSimpleFlux('H1', 100, 'B_caisson_BC')
    expect(r.kwhCumac).toBe(31600)
  })
  it('H2 50m² A_caisson_BC = 25900 × 0.5 × 0.9 = 11655', () => {
    const r = calcVMCSimpleFlux('H2', 50, 'A_caisson_BC')
    expect(r.kwhCumac).toBe(Math.round(25900 * 0.5 * 0.9))
  })
  it('surface < 35 m² → facteur 0.3', () => {
    const r = calcVMCSimpleFlux('H1', 30, 'B_caisson_BC')
    expect(r.kwhCumac).toBe(Math.round(31600 * 0.3 * 1.0))
  })
  it('surface ≥ 130 m² → facteur 1.6', () => {
    const r = calcVMCSimpleFlux('H3', 150, 'B_caisson_BC')
    expect(r.kwhCumac).toBe(Math.round(17200 * 1.6 * 1.0))
  })
})

describe('BAR-TH-171 — invariants ordinaux', () => {
  it('H1 > H2 > H3 (mêmes params)', () => {
    const h1 = computeBarTh171('H1', 2, 80, 'maison').kwhCumac
    const h2 = computeBarTh171('H2', 2, 80, 'maison').kwhCumac
    const h3 = computeBarTh171('H3', 2, 80, 'maison').kwhCumac
    expect(h1).toBeGreaterThan(h2)
    expect(h2).toBeGreaterThan(h3)
  })
  it('ETAS2 > ETAS1', () => {
    const e1 = computeBarTh171('H1', 1, 80, 'maison').kwhCumac
    const e2 = computeBarTh171('H1', 2, 80, 'maison').kwhCumac
    expect(e2).toBeGreaterThan(e1)
  })
  it('grande surface > petite', () => {
    const s1 = computeBarTh171('H1', 2, 50, 'maison').kwhCumac
    const s2 = computeBarTh171('H1', 2, 100, 'maison').kwhCumac
    expect(s2).toBeGreaterThan(s1)
  })
  it('baremeId contient zone, type, etas, surface', () => {
    const r = computeBarTh171('H2', 1, 80, 'maison')
    expect(r.baremeId).toMatch(/BAR-TH-171\.H2\.MAISON\.ETAS1\.S80/)
  })
  it('formule = base × coeffSurface × coeffZone', () => {
    // Maison, ETAS2, 80m² (coeff 0.7), H1 (coeff 1.2) → 109200 × 0.7 × 1.2 = 91728
    const r = computeBarTh171('H1', 2, 80, 'maison')
    expect(r.kwhCumac).toBe(91728)
  })
})

describe('fourchettePrime — env vars', () => {
  const originalC = process.env.CEE_PRIX_CLASSIQUE
  const originalP = process.env.CEE_PRIX_PRECARITE
  beforeEach(() => {
    delete process.env.CEE_PRIX_CLASSIQUE
    delete process.env.CEE_PRIX_PRECARITE
  })
  afterEach(() => {
    if (originalC !== undefined) process.env.CEE_PRIX_CLASSIQUE = originalC
    if (originalP !== undefined) process.env.CEE_PRIX_PRECARITE = originalP
  })
  it('defaults 8.5 / 15.0 sans env', () => {
    const r = fourchettePrime(14700)
    // bas = 14.7 × 8.5 × 0.85 ≈ 106.22 → 106
    expect(r.bas).toBe(Math.round(14.7 * 8.5 * 0.85))
    // haut = 14.7 × 15 = 220.5 → 221
    expect(r.haut).toBe(Math.round(14.7 * 15))
  })
  it('override via env', () => {
    process.env.CEE_PRIX_CLASSIQUE = '10'
    process.env.CEE_PRIX_PRECARITE = '20'
    const r = fourchettePrime(10000)
    expect(r.bas).toBe(Math.round(10 * 10 * 0.85))
    expect(r.haut).toBe(10 * 20)
  })
})

describe('BAR-TH-125 VMC double flux (fallback)', () => {
  it('H1=63400, H2=52100, H3=34800', () => {
    expect(calcBarTh125('H1').kwhCumac).toBe(63400)
    expect(calcBarTh125('H2').kwhCumac).toBe(52100)
    expect(calcBarTh125('H3').kwhCumac).toBe(34800)
  })
  it('baremeId contient FALLBACK', () => {
    expect(calcBarTh125('H1').baremeId).toMatch(/FALLBACK/)
  })
})

describe('BAR-TH-112 poêle biomasse (fallback)', () => {
  it('H1=77900, H2=63900, H3=42700', () => {
    expect(calcBarTh112('H1').kwhCumac).toBe(77900)
    expect(calcBarTh112('H2').kwhCumac).toBe(63900)
    expect(calcBarTh112('H3').kwhCumac).toBe(42700)
  })
  it('baremeId contient FALLBACK', () => {
    expect(calcBarTh112('H2').baremeId).toMatch(/FALLBACK/)
  })
})

describe('BAR-TH-101 CESI (fallback)', () => {
  it('H1=19800, H2=16300, H3=10900', () => {
    expect(calcBarTh101('H1').kwhCumac).toBe(19800)
    expect(calcBarTh101('H2').kwhCumac).toBe(16300)
    expect(calcBarTh101('H3').kwhCumac).toBe(10900)
  })
  it('baremeId contient FALLBACK', () => {
    expect(calcBarTh101('H3').baremeId).toMatch(/FALLBACK/)
  })
})

describe('PAC géothermie fallback (BAR-TH-171 × 1.3)', () => {
  it('kWhc > PAC air/eau pour mêmes params', () => {
    const geo = calcPacGeoFallback('H1', 100, 'maison')
    const air = computeBarTh171('H1', 2, 100, 'maison')
    expect(geo.kwhCumac).toBeGreaterThan(air.kwhCumac)
    expect(geo.kwhCumac).toBe(Math.round(air.kwhCumac * 1.3))
  })
  it('baremeId contient PAC_GEO et FALLBACK', () => {
    expect(calcPacGeoFallback('H2', 80, 'maison').baremeId).toMatch(/PAC_GEO.*FALLBACK/)
  })
})

describe('calcCEEFiche dispatcher', () => {
  it('dispatche BAR-TH-148', () => {
    const r = calcCEEFiche('BAR-TH-148', { typeLogement: 'maison' })
    expect(r.kwhCumac).toBe(14700)
  })
  it('throw si params manquants', () => {
    expect(() => calcCEEFiche('BAR-TH-127', {})).toThrow()
  })
})

// ---- P1 : Tests cas limites ----

describe('Cas limites — surfaces extrêmes', () => {
  it('BAR-TH-171 surface 15m² → coeff 0.5 (plus petit bucket)', () => {
    const r = computeBarTh171('H1', 2, 15, 'maison')
    // 109200 × 0.5 × 1.2 = 65520
    expect(r.kwhCumac).toBe(65520)
  })
  it('BAR-TH-171 surface 400m² → coeff 1.0 (dernier bucket)', () => {
    const r = computeBarTh171('H1', 2, 400, 'maison')
    // 109200 × 1.0 × 1.2 = 131040
    expect(r.kwhCumac).toBe(131040)
  })
  it('VMC simple flux surface 10m² → facteur 0.3', () => {
    const r = calcVMCSimpleFlux('H1', 10, 'B_caisson_BC')
    expect(r.kwhCumac).toBe(Math.round(31600 * 0.3))
  })
})

describe('Cas limites — fourchettePrime valeurs extrêmes', () => {
  it('kWhc = 0 → prime 0/0', () => {
    const fr = fourchettePrime(0)
    expect(fr.bas).toBe(0)
    expect(fr.haut).toBe(0)
  })
  it('kWhc très élevé → prime proportionnelle', () => {
    const fr = fourchettePrime(500_000)
    expect(fr.bas).toBeGreaterThan(0)
    expect(fr.haut).toBeGreaterThan(fr.bas)
  })
})
