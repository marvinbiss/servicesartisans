import { describe, expect, it } from 'vitest'

import { isIdfDeptCode, zoneForDeptCode, zoneForPostalCode } from '@/lib/aides/zone-geographique'

describe('aides/zone-geographique — zoneForDeptCode', () => {
  it('returns idf for all 8 IDF dept codes', () => {
    for (const code of ['75', '77', '78', '91', '92', '93', '94', '95']) {
      expect(zoneForDeptCode(code)).toBe('idf')
    }
  })

  it('returns hors_idf for Lyon (69)', () => {
    expect(zoneForDeptCode('69')).toBe('hors_idf')
  })

  it('returns hors_idf for Marseille (13)', () => {
    expect(zoneForDeptCode('13')).toBe('hors_idf')
  })

  it('returns hors_idf for Corsica codes (2A, 2B)', () => {
    expect(zoneForDeptCode('2A')).toBe('hors_idf')
    expect(zoneForDeptCode('2B')).toBe('hors_idf')
  })

  it('returns hors_idf for DOM (974 Réunion)', () => {
    expect(zoneForDeptCode('974')).toBe('hors_idf')
  })

  it('returns hors_idf for empty / unknown code', () => {
    expect(zoneForDeptCode('')).toBe('hors_idf')
    expect(zoneForDeptCode('XX')).toBe('hors_idf')
  })
})

describe('aides/zone-geographique — zoneForPostalCode', () => {
  it('returns idf for Paris 75001', () => {
    expect(zoneForPostalCode('75001')).toBe('idf')
  })

  it('returns idf for all IDF dept postal prefixes', () => {
    expect(zoneForPostalCode('77000')).toBe('idf')
    expect(zoneForPostalCode('78000')).toBe('idf')
    expect(zoneForPostalCode('91000')).toBe('idf')
    expect(zoneForPostalCode('92000')).toBe('idf')
    expect(zoneForPostalCode('93000')).toBe('idf')
    expect(zoneForPostalCode('94000')).toBe('idf')
    expect(zoneForPostalCode('95000')).toBe('idf')
  })

  it('returns hors_idf for Lyon 69001', () => {
    expect(zoneForPostalCode('69001')).toBe('hors_idf')
  })

  it('returns hors_idf for Bordeaux 33000', () => {
    expect(zoneForPostalCode('33000')).toBe('hors_idf')
  })

  it('returns hors_idf for Corsica postal codes 20000 / 20200', () => {
    expect(zoneForPostalCode('20000')).toBe('hors_idf')
    expect(zoneForPostalCode('20200')).toBe('hors_idf')
  })

  it('returns hors_idf for DOM postal 97400 (Réunion)', () => {
    expect(zoneForPostalCode('97400')).toBe('hors_idf')
  })

  it('returns hors_idf for too-short input', () => {
    expect(zoneForPostalCode('')).toBe('hors_idf')
    expect(zoneForPostalCode('7')).toBe('hors_idf')
  })

  it('trims whitespace before evaluation', () => {
    expect(zoneForPostalCode('  75001 ')).toBe('idf')
  })
})

describe('aides/zone-geographique — isIdfDeptCode', () => {
  it('matches zoneForDeptCode (consistency)', () => {
    for (const code of ['75', '69', '2A', '94', '13']) {
      expect(isIdfDeptCode(code)).toBe(zoneForDeptCode(code) === 'idf')
    }
  })
})
