import { describe, expect, it } from 'vitest'

import { zoneClimatiqueForDept } from '@/lib/cee/zones-climatiques'

describe('cee/zones-climatiques — zoneClimatiqueForDept', () => {
  it('returns H1 for Paris (75)', () => {
    expect(zoneClimatiqueForDept('75')).toBe('H1')
  })

  it('returns H3 for Bouches-du-Rhône (13)', () => {
    expect(zoneClimatiqueForDept('13')).toBe('H3')
  })

  it('returns H3 for Alpes-Maritimes (06)', () => {
    expect(zoneClimatiqueForDept('06')).toBe('H3')
  })

  it('returns H2 for Gironde (33)', () => {
    expect(zoneClimatiqueForDept('33')).toBe('H2')
  })

  it('returns H2 for Loire-Atlantique (44)', () => {
    expect(zoneClimatiqueForDept('44')).toBe('H2')
  })

  it('returns H3 for Corse-du-Sud (2A) and Haute-Corse (2B)', () => {
    expect(zoneClimatiqueForDept('2A')).toBe('H3')
    expect(zoneClimatiqueForDept('2B')).toBe('H3')
  })

  it('returns H3 for postal-code Corse prefix "20"', () => {
    expect(zoneClimatiqueForDept('20')).toBe('H3')
  })

  it('returns H1 for Haut-Rhin (68)', () => {
    expect(zoneClimatiqueForDept('68')).toBe('H1')
  })

  it('returns H2 as documented fallback for unknown code', () => {
    expect(zoneClimatiqueForDept('XX')).toBe('H2')
  })

  it('returns H2 for La Réunion (974) — DROM hors scope v0', () => {
    expect(zoneClimatiqueForDept('974')).toBe('H2')
  })

  it('returns H2 for Mayotte (976) — DROM', () => {
    expect(zoneClimatiqueForDept('976')).toBe('H2')
  })

  it('returns H2 for null/undefined input', () => {
    expect(zoneClimatiqueForDept(null)).toBe('H2')
    expect(zoneClimatiqueForDept(undefined)).toBe('H2')
    expect(zoneClimatiqueForDept('')).toBe('H2')
  })

  it('trims whitespace and is case-insensitive for Corse', () => {
    expect(zoneClimatiqueForDept(' 2a ')).toBe('H3')
    expect(zoneClimatiqueForDept('2b')).toBe('H3')
  })

  it('covers the 95 metropolitan departments — every code 01-95 maps to H1/H2/H3', () => {
    for (let i = 1; i <= 95; i++) {
      const code = i.toString().padStart(2, '0')
      const zone = zoneClimatiqueForDept(code)
      expect(['H1', 'H2', 'H3']).toContain(zone)
    }
  })

  it('H3 strictly contains the documented méditerranée + Corse set', () => {
    const expectedH3 = ['06', '11', '13', '2A', '2B', '30', '34', '66', '83', '84']
    for (const code of expectedH3) {
      expect(zoneClimatiqueForDept(code)).toBe('H3')
    }
  })

  it('Paris region (77, 78, 91, 92, 93, 94, 95) all map to H1', () => {
    for (const code of ['75', '77', '78', '91', '92', '93', '94', '95']) {
      expect(zoneClimatiqueForDept(code)).toBe('H1')
    }
  })

  it('atlantic façade (29, 56, 22, 35) all map to H2', () => {
    for (const code of ['29', '56', '22', '35']) {
      expect(zoneClimatiqueForDept(code)).toBe('H2')
    }
  })
})
