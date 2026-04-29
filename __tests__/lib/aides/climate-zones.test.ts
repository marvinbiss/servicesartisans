import { describe, expect, it } from 'vitest'

import {
  CLIMATE_ZONE_IMPACT,
  CLIMATE_ZONE_LABELS,
  deptToClimateZone,
  type ClimateZone,
} from '@/lib/aides/climate-zones'

describe('deptToClimateZone (RT2012 mapping)', () => {
  it('returns H3 for the 10 mediterranean dept codes', () => {
    const expected: [string, ClimateZone][] = [
      ['06', 'H3'], // Alpes-Maritimes
      ['11', 'H3'], // Aude
      ['13', 'H3'], // Bouches-du-Rhône
      ['2A', 'H3'], // Corse-du-Sud
      ['2B', 'H3'], // Haute-Corse
      ['30', 'H3'], // Gard
      ['34', 'H3'], // Hérault
      ['66', 'H3'], // Pyrénées-Orientales
      ['83', 'H3'], // Var
      ['84', 'H3'], // Vaucluse
    ]
    for (const [code, zone] of expected) {
      expect(deptToClimateZone(code)).toBe(zone)
    }
  })

  it('returns H2 for sample atlantic + sud-ouest dept codes', () => {
    expect(deptToClimateZone('33')).toBe('H2') // Gironde
    expect(deptToClimateZone('44')).toBe('H2') // Loire-Atlantique
    expect(deptToClimateZone('29')).toBe('H2') // Finistère
    expect(deptToClimateZone('64')).toBe('H2') // Pyrénées-Atlantiques
    expect(deptToClimateZone('17')).toBe('H2') // Charente-Maritime
  })

  it('returns H1 for nord/est/IDF (default)', () => {
    expect(deptToClimateZone('75')).toBe('H1') // Paris
    expect(deptToClimateZone('59')).toBe('H1') // Nord
    expect(deptToClimateZone('67')).toBe('H1') // Bas-Rhin
    expect(deptToClimateZone('69')).toBe('H1') // Rhône
    expect(deptToClimateZone('92')).toBe('H1') // Hauts-de-Seine
  })

  it('falls back to H1 for unknown codes (DOM-TOM, garbage input)', () => {
    expect(deptToClimateZone('971')).toBe('H1') // Guadeloupe
    expect(deptToClimateZone('974')).toBe('H1') // La Réunion
    expect(deptToClimateZone('999')).toBe('H1') // unknown
    expect(deptToClimateZone('')).toBe('H1') // empty
    expect(deptToClimateZone('XX')).toBe('H1') // garbage
  })

  it('Corse codes 2A/2B handled (uppercase only — INSEE format)', () => {
    expect(deptToClimateZone('2A')).toBe('H3')
    expect(deptToClimateZone('2B')).toBe('H3')
    // Lowercase variant should fallback (INSEE uses uppercase)
    expect(deptToClimateZone('2a')).toBe('H1')
  })
})

describe('CLIMATE_ZONE_LABELS / CLIMATE_ZONE_IMPACT', () => {
  it('has entries for H1, H2, H3', () => {
    expect(CLIMATE_ZONE_LABELS.H1).toMatch(/H1/)
    expect(CLIMATE_ZONE_LABELS.H2).toMatch(/H2/)
    expect(CLIMATE_ZONE_LABELS.H3).toMatch(/H3/)

    expect(CLIMATE_ZONE_IMPACT.H1.length).toBeGreaterThan(50)
    expect(CLIMATE_ZONE_IMPACT.H2.length).toBeGreaterThan(50)
    expect(CLIMATE_ZONE_IMPACT.H3.length).toBeGreaterThan(50)
  })
})
