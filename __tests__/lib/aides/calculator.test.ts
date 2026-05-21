import { describe, expect, it } from 'vitest'

import {
  checkEligibility,
  computeMprAmount,
  determineMenageCategorie,
} from '@/lib/aides/calculator'
import type { EligibilityInput } from '@/lib/aides/types'

function input(partial: Partial<EligibilityInput>): EligibilityInput {
  return {
    rfr: 15000,
    nbPersonnes: 1,
    zone: 'hors_idf',
    geste: 'pac_air_eau',
    ...partial,
  }
}

describe('aides/calculator — determineMenageCategorie', () => {
  it('classifies RFR 15000 / 1 pers / hors_idf as tres_modeste', () => {
    expect(determineMenageCategorie(input({}))).toBe('tres_modeste')
  })

  it('classifies RFR 20000 / 1 pers / hors_idf as modeste', () => {
    expect(determineMenageCategorie(input({ rfr: 20000 }))).toBe('modeste')
  })

  it('classifies RFR 25000 / 1 pers / hors_idf as intermediaire', () => {
    expect(determineMenageCategorie(input({ rfr: 25000 }))).toBe('intermediaire')
  })

  it('classifies RFR 50000 / 1 pers / hors_idf as superieur', () => {
    expect(determineMenageCategorie(input({ rfr: 50000 }))).toBe('superieur')
  })

  it('uses IDF higher plafonds for same RFR', () => {
    const horsIdfCat = determineMenageCategorie(input({ rfr: 25000, zone: 'hors_idf' }))
    const idfCat = determineMenageCategorie(input({ rfr: 25000, zone: 'idf' }))
    expect(horsIdfCat).toBe('intermediaire')
    expect(idfCat).toBe('modeste')
  })

  it('treats RFR 0 as tres_modeste', () => {
    expect(determineMenageCategorie(input({ rfr: 0 }))).toBe('tres_modeste')
  })

  it('returns null for nbPersonnes 0', () => {
    expect(determineMenageCategorie(input({ nbPersonnes: 0 }))).toBeNull()
  })

  it('returns null for negative RFR', () => {
    expect(determineMenageCategorie(input({ rfr: -1 }))).toBeNull()
  })

  it('clamps nbPersonnes > 5 to row=5 when no stepIncrement is defined', () => {
    const cat5 = determineMenageCategorie(input({ nbPersonnes: 5, rfr: 35000 }))
    const cat10 = determineMenageCategorie(input({ nbPersonnes: 10, rfr: 35000 }))
    expect(cat10).toBe(cat5)
  })

  it('uses boundary inclusively: RFR exactly at tresModesteMax stays tres_modeste', () => {
    expect(determineMenageCategorie(input({ rfr: 17009 }))).toBe('tres_modeste')
    expect(determineMenageCategorie(input({ rfr: 17010 }))).toBe('modeste')
  })
})

describe('aides/calculator — computeMprAmount', () => {
  it('returns 5000 EUR for pac_air_eau / tres_modeste / hors_idf (mpr-001 gold)', () => {
    const result = computeMprAmount(input({ rfr: 15000, geste: 'pac_air_eau' }))
    expect(result.eligible).toBe(true)
    if (result.eligible) {
      expect(result.amountEUR).toBe(5000)
      expect(result.sourceRef).toBe('ANAH_MAPRIMERENOV')
    }
  })

  it('returns ineligible with reason for superieur category (mpr-004 gold)', () => {
    const result = computeMprAmount(input({ rfr: 60000, geste: 'pac_air_eau' }))
    expect(result.eligible).toBe(false)
    if (!result.eligible) {
      expect(result.reason).toMatch(/supérieure|0 EUR|exclu|recentrage/i)
    }
  })

  it('returns ineligible with non-eligible-MPR reason for pac_air_air (mpr-008 gold)', () => {
    const result = computeMprAmount(input({ rfr: 15000, geste: 'pac_air_air' }))
    expect(result.eligible).toBe(false)
    if (!result.eligible) {
      expect(result.reason).toMatch(/non éligible/i)
      expect(result.sourceRef).toBe('ANAH_MAPRIMERENOV')
    }
  })

  it('returns ineligible for unverified entry (vmc_double_flux / tres_modeste)', () => {
    const result = computeMprAmount(input({ rfr: 15000, geste: 'vmc_double_flux' }))
    expect(result.eligible).toBe(false)
    if (!result.eligible) {
      expect(result.reason).toMatch(/UNVERIFIED_PENDING_SOURCE/)
    }
  })

  it('audit énergétique 300 EUR for intermediaire / hors_idf (mpr-021 gold)', () => {
    const result = computeMprAmount(input({ rfr: 25000, geste: 'audit_energetique' }))
    expect(result.eligible).toBe(true)
    if (result.eligible) {
      expect(result.amountEUR).toBe(300)
    }
  })

  it('returns ineligible with reason when no plafonds row found (nbPersonnes 0)', () => {
    const result = computeMprAmount(input({ nbPersonnes: 0, geste: 'pac_air_eau' }))
    expect(result.eligible).toBe(false)
    if (!result.eligible) {
      expect(result.reason).toMatch(/aucun barème applicable|Aucun barème/i)
    }
  })
})

describe('aides/calculator — checkEligibility', () => {
  it('returns eligible=true and menageCategorie for tres_modeste household', () => {
    const result = checkEligibility(input({ rfr: 15000 }))
    expect(result.eligible).toBe(true)
    expect(result.menageCategorie).toBe('tres_modeste')
    expect(result.plafondAtteint).toBe(30549)
    expect(result.sourceRef).toBe('ANAH_MAPRIMERENOV')
  })

  it('returns eligible=false for superieur with reason', () => {
    const result = checkEligibility(input({ rfr: 60000 }))
    expect(result.eligible).toBe(false)
    expect(result.menageCategorie).toBe('superieur')
    expect(result.reason).toMatch(/supérieure|exclu/i)
  })

  it('returns eligible=false with null catégorie when nbPersonnes invalid', () => {
    const result = checkEligibility(input({ nbPersonnes: 0 }))
    expect(result.eligible).toBe(false)
    expect(result.menageCategorie).toBeNull()
    expect(result.plafondAtteint).toBe(0)
  })

  it('plafondAtteint reflects IDF higher bracket', () => {
    const horsIdf = checkEligibility(input({ rfr: 15000, zone: 'hors_idf' }))
    const idf = checkEligibility(input({ rfr: 15000, zone: 'idf' }))
    expect(idf.plafondAtteint).toBeGreaterThan(horsIdf.plafondAtteint)
  })
})
