import { describe, expect, it } from 'vitest'

import {
  ALL_GESTES_CEE,
  ALL_MENAGE_CATEGORIES_CEE,
  BONUS_COUP_DE_POUCE_2026,
  CUMUL_RULES_2026,
  FORFAITS_CEE_2026,
  getBonus,
  getCumul,
  getForfait,
} from '@/lib/cee/forfaits-cee-2026'
import { SOURCES_CEE } from '@/lib/cee/__sources-cee'
import type { GesteCEE } from '@/lib/cee/types'

describe('cee/forfaits-cee-2026 — getForfait', () => {
  it('returns an entry for chauffe_eau_thermo H1 maison_individuelle', () => {
    const f = getForfait('chauffe_eau_thermo', 'H1', 'maison_individuelle')
    expect(f).toBeDefined()
    expect(f?.fiche).toBe('BAR-TH-148')
  })

  it('returns an entry with kwhCumac null + notes for pac_air_air H1 maison_individuelle', () => {
    const f = getForfait('pac_air_air', 'H1', 'maison_individuelle')
    expect(f).toBeDefined()
    expect(f?.kwhCumac).toBeNull()
    expect(f?.notes).toContain('NON éligible MPR')
  })

  it('returns undefined for inexistent geste', () => {
    const f = getForfait('inexistant' as unknown as GesteCEE, 'H1', 'maison_individuelle')
    expect(f).toBeUndefined()
  })

  it('distinguishes maison_individuelle vs appartement entries when both declared', () => {
    const maison = getForfait('pac_air_eau', 'H1', 'maison_individuelle')
    const appart = getForfait('pac_air_eau', 'H1', 'appartement')
    expect(maison).toBeDefined()
    expect(appart).toBeDefined()
    expect(maison?.typeLogement).toBe('maison_individuelle')
    expect(appart?.typeLogement).toBe('appartement')
  })

  it('returns same entry across zones when entry declares no zone', () => {
    const h1 = getForfait('pac_air_eau', 'H1', 'maison_individuelle')
    const h2 = getForfait('pac_air_eau', 'H2', 'maison_individuelle')
    const h3 = getForfait('pac_air_eau', 'H3', 'maison_individuelle')
    expect(h1).toBeDefined()
    expect(h1).toEqual(h2)
    expect(h1).toEqual(h3)
  })

  it('matches each declared zone for chauffe_eau_thermo', () => {
    for (const zone of ['H1', 'H2', 'H3'] as const) {
      const f = getForfait('chauffe_eau_thermo', zone, 'maison_individuelle')
      expect(f).toBeDefined()
      expect(f?.zone).toBe(zone)
    }
  })
})

describe('cee/forfaits-cee-2026 — getBonus', () => {
  it('returns 1.5 multiplicateur for pac_air_eau tres_modeste', () => {
    const b = getBonus('pac_air_eau', 'tres_modeste')
    expect(b).toBeDefined()
    expect(b?.multiplicateur).toBe(1.5)
  })

  it('returns 1.0 multiplicateur for pac_air_eau superieur (no Coup de pouce)', () => {
    const b = getBonus('pac_air_eau', 'superieur')
    expect(b).toBeDefined()
    expect(b?.multiplicateur).toBe(1.0)
  })

  it('returns 1.0 multiplicateur for pac_air_air all categories (hors Coup de pouce)', () => {
    for (const cat of ALL_MENAGE_CATEGORIES_CEE) {
      const b = getBonus('pac_air_air', cat)
      expect(b).toBeDefined()
      expect(b?.multiplicateur).toBe(1.0)
    }
  })

  it('returns 1.3 multiplicateur for isolation_combles modeste', () => {
    const b = getBonus('isolation_combles', 'modeste')
    expect(b).toBeDefined()
    expect(b?.multiplicateur).toBe(1.3)
  })
})

describe('cee/forfaits-cee-2026 — getCumul', () => {
  it('returns cumulableMPR false for pac_air_air (critical case)', () => {
    const r = getCumul('pac_air_air')
    expect(r).toBeDefined()
    expect(r?.cumulableMPR).toBe(false)
    expect(r?.cumulableEcoPTZ).toBe(true)
  })

  it('returns cumulableMPR true for pac_air_eau', () => {
    const r = getCumul('pac_air_eau')
    expect(r).toBeDefined()
    expect(r?.cumulableMPR).toBe(true)
    expect(r?.cumulableEcoPTZ).toBe(true)
    expect(r?.cumulableTVA55).toBe(true)
  })

  it('returns cumulableTVA55 false for audit_energetique (prestation intellectuelle)', () => {
    const r = getCumul('audit_energetique')
    expect(r).toBeDefined()
    expect(r?.cumulableTVA55).toBe(false)
  })

  it('every geste in ALL_GESTES_CEE has a CumulRule entry', () => {
    for (const geste of ALL_GESTES_CEE) {
      const r = getCumul(geste)
      expect(r, `missing CumulRule for ${geste}`).toBeDefined()
    }
  })
})

describe('cee/forfaits-cee-2026 — invariants', () => {
  it('FORFAITS_CEE_2026 covers at least 10 gestes (one entry per ALL_GESTES_CEE)', () => {
    const distinctGestes = new Set(FORFAITS_CEE_2026.map((f) => f.geste))
    for (const g of ALL_GESTES_CEE) {
      expect(distinctGestes.has(g), `missing forfait for ${g}`).toBe(true)
    }
    expect(distinctGestes.size).toBeGreaterThanOrEqual(10)
  })

  it('every forfait entry has a defined sourceRef pointing to SOURCES_CEE', () => {
    for (const f of FORFAITS_CEE_2026) {
      expect(f.sourceRef).toBeTruthy()
      expect(SOURCES_CEE[f.sourceRef]).toBeDefined()
    }
  })

  it('every forfait entry has a BAR-XX-XXX fiche reference', () => {
    for (const f of FORFAITS_CEE_2026) {
      expect(f.fiche).toMatch(/^BAR-(TH|EN)-\d{3}$/)
    }
  })

  it('every forfait with kwhCumac null has a notes field (audit trail)', () => {
    for (const f of FORFAITS_CEE_2026) {
      if (f.kwhCumac === null) {
        expect(f.notes, `forfait null for ${f.geste}/${f.fiche} must declare notes`).toBeTruthy()
      }
    }
  })

  it('BONUS_COUP_DE_POUCE_2026 covers every (geste, categorie) pair exactly once', () => {
    const seen = new Set<string>()
    for (const b of BONUS_COUP_DE_POUCE_2026) {
      const key = `${b.geste}__${b.menageCategorie}`
      expect(seen.has(key), `duplicate bonus entry for ${key}`).toBe(false)
      seen.add(key)
    }
    for (const g of ALL_GESTES_CEE) {
      for (const c of ALL_MENAGE_CATEGORIES_CEE) {
        expect(seen.has(`${g}__${c}`), `missing bonus for ${g}/${c}`).toBe(true)
      }
    }
  })

  it('every bonus multiplicateur is in the closed range [1.0, 2.0]', () => {
    for (const b of BONUS_COUP_DE_POUCE_2026) {
      expect(b.multiplicateur).toBeGreaterThanOrEqual(1.0)
      expect(b.multiplicateur).toBeLessThanOrEqual(2.0)
    }
  })

  it('CUMUL_RULES_2026 contains exactly one entry per geste', () => {
    expect(CUMUL_RULES_2026.length).toBe(ALL_GESTES_CEE.length)
    const distinct = new Set(CUMUL_RULES_2026.map((r) => r.geste))
    expect(distinct.size).toBe(CUMUL_RULES_2026.length)
  })
})
