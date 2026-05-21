import { describe, expect, it } from 'vitest'

import {
  ALL_GESTES,
  ALL_MENAGE_CATEGORIES,
  BAREME_MPR_2026,
  PLAFONDS_REVENUS_2026,
  getBaremeEntry,
  getPlafonds,
} from '@/lib/aides/bareme-mpr-2026'
import { isPlaceholderSource } from '@/lib/aides/__sources'
import type { Geste, MenageCategorie } from '@/lib/aides/types'

describe('aides/bareme-mpr-2026 — getBaremeEntry', () => {
  it('returns 5000 EUR for pac_air_eau × tres_modeste (mpr-001 gold)', () => {
    const entry = getBaremeEntry('pac_air_eau', 'tres_modeste')
    expect(entry).toBeDefined()
    expect(entry?.amountEUR).toBe(5000)
    expect(entry?.sourceRef).toBe('ANAH_MAPRIMERENOV')
  })

  it('returns amountEUR null + notes for pac_air_air (non éligible MPR)', () => {
    const entry = getBaremeEntry('pac_air_air', 'tres_modeste')
    expect(entry).toBeDefined()
    expect(entry?.amountEUR).toBeNull()
    expect(entry?.notes).toMatch(/non éligible/i)
  })

  it('returns undefined for unknown geste', () => {
    expect(getBaremeEntry('nonexistent_geste' as Geste, 'tres_modeste')).toBeUndefined()
  })

  it('returns undefined for unknown menage catégorie', () => {
    expect(getBaremeEntry('pac_air_eau', 'unknown_cat' as MenageCategorie)).toBeUndefined()
  })
})

describe('aides/bareme-mpr-2026 — table invariants', () => {
  it('BAREME_MPR_2026 contains exactly 10 gestes × 4 categories = 40 entries', () => {
    expect(BAREME_MPR_2026).toHaveLength(40)
    expect(ALL_GESTES).toHaveLength(10)
    expect(ALL_MENAGE_CATEGORIES).toHaveLength(4)
  })

  it('every (geste, catégorie) combination appears exactly once', () => {
    const seen = new Set<string>()
    for (const e of BAREME_MPR_2026) {
      const key = `${e.geste}|${e.menageCategorie}`
      expect(seen.has(key)).toBe(false)
      seen.add(key)
    }
    expect(seen.size).toBe(40)
  })

  it('every entry has a sourceRef defined', () => {
    for (const e of BAREME_MPR_2026) {
      expect(e.sourceRef).toBeTruthy()
    }
  })

  it('no verified amount (non-null > 0) points to a placeholder source', () => {
    for (const e of BAREME_MPR_2026) {
      if (e.amountEUR !== null && e.amountEUR > 0) {
        expect(isPlaceholderSource(e.sourceRef)).toBe(false)
      }
    }
  })
})

describe('aides/bareme-mpr-2026 — getPlafonds', () => {
  it('returns IDF entry for nbPersonnes 1', () => {
    const p = getPlafonds('idf', 1)
    expect(p).toBeDefined()
    expect(p?.tresModesteMax).toBe(23541)
  })

  it('clamps nbPersonnes >= 5 to nbPersonnes=5 row', () => {
    const p10 = getPlafonds('hors_idf', 10)
    const p5 = getPlafonds('hors_idf', 5)
    expect(p10).toEqual(p5)
  })

  it('returns undefined for nbPersonnes < 1', () => {
    expect(getPlafonds('idf', 0)).toBeUndefined()
    expect(getPlafonds('idf', -1)).toBeUndefined()
  })

  it('PLAFONDS_REVENUS_2026 covers both zones for nbPersonnes 1..5', () => {
    expect(PLAFONDS_REVENUS_2026).toHaveLength(10)
    for (const zone of ['idf', 'hors_idf'] as const) {
      for (let n = 1; n <= 5; n++) {
        expect(getPlafonds(zone, n)).toBeDefined()
      }
    }
  })

  it('IDF plafonds always >= hors_idf plafonds (cost-of-life logic — mpr-050 gold)', () => {
    for (let n = 1; n <= 5; n++) {
      const idf = getPlafonds('idf', n)!
      const hors = getPlafonds('hors_idf', n)!
      expect(idf.tresModesteMax).toBeGreaterThanOrEqual(hors.tresModesteMax)
      expect(idf.modesteMax).toBeGreaterThanOrEqual(hors.modesteMax)
      expect(idf.intermediaireMax).toBeGreaterThanOrEqual(hors.intermediaireMax)
    }
  })

  it('plafond brackets are strictly increasing tresModeste < modeste < intermediaire', () => {
    for (const p of PLAFONDS_REVENUS_2026) {
      expect(p.tresModesteMax).toBeLessThan(p.modesteMax)
      expect(p.modesteMax).toBeLessThan(p.intermediaireMax)
    }
  })
})
