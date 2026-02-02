import { describe, it, expect } from 'vitest'
import {
  getDeptCodeFromPostal,
  getDepartmentName,
  getRegionName,
  getGeographyFromPostal,
  slugify,
} from './geography'

describe('getDeptCodeFromPostal', () => {
  it('should return null for null input', () => {
    expect(getDeptCodeFromPostal(null)).toBeNull()
  })

  it('should return null for undefined input', () => {
    expect(getDeptCodeFromPostal(undefined)).toBeNull()
  })

  it('should return null for empty string', () => {
    expect(getDeptCodeFromPostal('')).toBeNull()
  })

  it('should extract department code from standard postal code', () => {
    expect(getDeptCodeFromPostal('75001')).toBe('75')
    expect(getDeptCodeFromPostal('13001')).toBe('13')
    expect(getDeptCodeFromPostal('69001')).toBe('69')
  })

  it('should handle DOM-TOM postal codes (3 digit prefix)', () => {
    expect(getDeptCodeFromPostal('97100')).toBe('971') // Guadeloupe
    expect(getDeptCodeFromPostal('97200')).toBe('972') // Martinique
    expect(getDeptCodeFromPostal('97300')).toBe('973') // Guyane
    expect(getDeptCodeFromPostal('97400')).toBe('974') // La Reunion
    expect(getDeptCodeFromPostal('97600')).toBe('976') // Mayotte
  })

  // The implementation uses: num < 201 for 2A, else 2B
  // 20000 -> num=200 -> 2A, 20100 -> num=201 -> 2B, 20200 -> num=202 -> 2B
  it('should handle Corse-du-Sud postal codes (2A) - codes < 20100', () => {
    expect(getDeptCodeFromPostal('20000')).toBe('2A') // Ajaccio (200 < 201)
    expect(getDeptCodeFromPostal('20090')).toBe('2A') // 200 < 201
  })

  it('should handle Haute-Corse postal codes (2B) - codes >= 20100', () => {
    expect(getDeptCodeFromPostal('20100')).toBe('2B') // 201 >= 201
    expect(getDeptCodeFromPostal('20200')).toBe('2B') // Bastia
    expect(getDeptCodeFromPostal('20600')).toBe('2B')
  })
})

describe('getDepartmentName', () => {
  it('should return null for null input', () => {
    expect(getDepartmentName(null)).toBeNull()
  })

  it('should return null for undefined input', () => {
    expect(getDepartmentName(undefined)).toBeNull()
  })

  it('should return null for empty string', () => {
    expect(getDepartmentName('')).toBeNull()
  })

  it('should return department name from postal code', () => {
    expect(getDepartmentName('75001')).toBe('Paris')
    expect(getDepartmentName('13001')).toBe('Bouches-du-Rhône')
    expect(getDepartmentName('69001')).toBe('Rhône')
  })

  it('should return department name from department code', () => {
    expect(getDepartmentName('75')).toBe('Paris')
    expect(getDepartmentName('13')).toBe('Bouches-du-Rhône')
    expect(getDepartmentName('2A')).toBe('Corse-du-Sud')
  })

  it('should return the input if it is already a department name', () => {
    expect(getDepartmentName('Paris')).toBe('Paris')
    expect(getDepartmentName('Bouches-du-Rhône')).toBe('Bouches-du-Rhône')
  })

  it('should return null for invalid department code', () => {
    expect(getDepartmentName('99')).toBeNull()
    expect(getDepartmentName('00')).toBeNull()
  })
})

describe('getRegionName', () => {
  it('should return null for null input', () => {
    expect(getRegionName(null)).toBeNull()
  })

  it('should return null for undefined input', () => {
    expect(getRegionName(undefined)).toBeNull()
  })

  it('should return null for empty string', () => {
    expect(getRegionName('')).toBeNull()
  })

  it('should return region name from postal code', () => {
    expect(getRegionName('75001')).toBe('Île-de-France')
    expect(getRegionName('13001')).toBe("Provence-Alpes-Côte d'Azur")
    expect(getRegionName('69001')).toBe('Auvergne-Rhône-Alpes')
  })

  it('should return region name from department code', () => {
    expect(getRegionName('75')).toBe('Île-de-France')
    expect(getRegionName('29')).toBe('Bretagne')
    expect(getRegionName('2A')).toBe('Corse')
  })

  it('should return the input if it is already a region name', () => {
    expect(getRegionName('Bretagne')).toBe('Bretagne')
    expect(getRegionName('Île-de-France')).toBe('Île-de-France')
  })

  it('should return null for invalid department code', () => {
    expect(getRegionName('99')).toBeNull()
    expect(getRegionName('00')).toBeNull()
  })
})

describe('getGeographyFromPostal', () => {
  it('should return null values for null input', () => {
    const result = getGeographyFromPostal(null)
    expect(result.departmentCode).toBeNull()
    expect(result.departmentName).toBeNull()
    expect(result.regionName).toBeNull()
  })

  it('should return full geography info for valid postal code', () => {
    const result = getGeographyFromPostal('75001')
    expect(result.departmentCode).toBe('75')
    expect(result.departmentName).toBe('Paris')
    expect(result.regionName).toBe('Île-de-France')
  })

  it('should handle DOM-TOM postal codes', () => {
    const result = getGeographyFromPostal('97100')
    expect(result.departmentCode).toBe('971')
    expect(result.departmentName).toBe('Guadeloupe')
    expect(result.regionName).toBe('Guadeloupe')
  })
})

describe('slugify', () => {
  it('should convert text to lowercase', () => {
    expect(slugify('Paris')).toBe('paris')
    expect(slugify('BRETAGNE')).toBe('bretagne')
  })

  it('should replace spaces with hyphens', () => {
    expect(slugify('Ile de France')).toBe('ile-de-france')
  })

  it('should remove accents', () => {
    expect(slugify('Île-de-France')).toBe('ile-de-france')
    expect(slugify('Rhône-Alpes')).toBe('rhone-alpes')
  })

  it('should handle special characters', () => {
    // The geography slugify converts special chars to hyphens
    const result = slugify("Provence-Alpes-Côte d'Azur")
    expect(result).toMatch(/provence-alpes-cote-d/)
    expect(result).toContain('azur')
  })
})
