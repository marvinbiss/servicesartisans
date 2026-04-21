import { describe, it, expect } from 'vitest'
import { sanitizeQualificationCode } from './sanitize'

describe('sanitizeQualificationCode', () => {
  it.each([
    ['QualiPAC', 'QualiPAC'],
    ['Qualibat', 'Qualibat'],
    ['RGE', 'RGE'],
    ['PG-Eco-Artisan', 'PG-Eco-Artisan'],
    ["Qualit'EnR", 'QualitEnR'], // apostrophe stripped
    ['Éco-Artisan', 'Eco-Artisan'], // accents dropped
  ])('keeps common RGE codes: %s → %s', (input, expected) => {
    expect(sanitizeQualificationCode(input)).toBe(expected)
  })

  it.each([
    ['QualiPAC"; DROP TABLE providers;--', 'QualiPAC DROP TABLE providers--'],
    ['Quali"Pac', 'QualiPac'], // JSON injection char stripped
    ['Quali\\Pac', 'QualiPac'], // backslash stripped
    ['Quali,Pac', 'QualiPac'], // array separator stripped
    ['Quali{Pac}', 'QualiPac'], // array braces stripped
    ['Quali[Pac]', 'QualiPac'], // JSON brackets stripped
    ['Quali%_PAC', 'QualiPAC'], // LIKE wildcards stripped
    ['<script>alert(1)</script>', 'scriptalert1script'],
  ])('strips unsafe characters: %s → %s', (input, expected) => {
    expect(sanitizeQualificationCode(input)).toBe(expected)
  })

  it('trims whitespace and caps length at 40', () => {
    expect(sanitizeQualificationCode('   QualiPAC   ')).toBe('QualiPAC')
    expect(sanitizeQualificationCode('A'.repeat(100))).toHaveLength(40)
  })

  it('returns empty string on empty/nonsense input', () => {
    expect(sanitizeQualificationCode('')).toBe('')
    expect(sanitizeQualificationCode('""""')).toBe('')
    expect(sanitizeQualificationCode('!!!')).toBe('')
  })

  it('preserves digits and allowed punctuation', () => {
    expect(sanitizeQualificationCode('RGE-2024')).toBe('RGE-2024')
    expect(sanitizeQualificationCode('C+')).toBe('C+')
  })
})
