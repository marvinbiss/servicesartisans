import { describe, expect, it } from 'vitest'
import {
  cleanPhone,
  formatPhoneForTel,
  formatFrenchPhoneAsTyped,
  isValidFrenchPhone,
} from './phone'

describe('cleanPhone', () => {
  it('strips spaces, dots, dashes, parentheses', () => {
    expect(cleanPhone('06 12.34-56(78)')).toBe('0612345678')
  })
  it('strips non-breaking and narrow no-break spaces', () => {
    expect(cleanPhone('06 12 34 56 78')).toBe('0612345678')
  })
  it('keeps a single leading +', () => {
    expect(cleanPhone('+33 6 12 34 56 78')).toBe('+33612345678')
  })
  it('drops non-leading + signs', () => {
    expect(cleanPhone('+33+6+12')).toBe('+33612')
  })
})

describe('isValidFrenchPhone', () => {
  it('accepts 0X format', () => {
    expect(isValidFrenchPhone('06 12 34 56 78')).toBe(true)
  })
  it('accepts +33 format', () => {
    expect(isValidFrenchPhone('+33 6 12 34 56 78')).toBe(true)
  })
  it('accepts 0033 format', () => {
    expect(isValidFrenchPhone('0033 6 12 34 56 78')).toBe(true)
  })
  it('rejects too short', () => {
    expect(isValidFrenchPhone('06 12 34')).toBe(false)
  })
  it('rejects leading 00 (not 0033) on landline', () => {
    expect(isValidFrenchPhone('00 12 34 56 78')).toBe(false)
  })
})

describe('formatPhoneForTel', () => {
  it('prefixes +33 when starts with 0', () => {
    expect(formatPhoneForTel('06 12 34 56 78')).toBe('+33612345678')
  })
  it('keeps +33 untouched', () => {
    expect(formatPhoneForTel('+33 6 12 34 56 78')).toBe('+33612345678')
  })
})

describe('formatFrenchPhoneAsTyped', () => {
  it('returns empty string for empty input', () => {
    expect(formatFrenchPhoneAsTyped('')).toBe('')
  })

  it('formats a full 0X number into pairs', () => {
    expect(formatFrenchPhoneAsTyped('0612345678')).toBe('06 12 34 56 78')
  })

  it('strips formatting characters before re-pairing', () => {
    expect(formatFrenchPhoneAsTyped('06.12.34.56.78')).toBe('06 12 34 56 78')
    expect(formatFrenchPhoneAsTyped('06-12-34-56-78')).toBe('06 12 34 56 78')
    expect(formatFrenchPhoneAsTyped('(06)12 34 56 78')).toBe('06 12 34 56 78')
  })

  it('progressively pairs while typing', () => {
    expect(formatFrenchPhoneAsTyped('0')).toBe('0')
    expect(formatFrenchPhoneAsTyped('06')).toBe('06')
    expect(formatFrenchPhoneAsTyped('061')).toBe('06 1')
    expect(formatFrenchPhoneAsTyped('0612')).toBe('06 12')
    expect(formatFrenchPhoneAsTyped('061234')).toBe('06 12 34')
  })

  it('caps at 10 digits for 0X format (paste overflow)', () => {
    expect(formatFrenchPhoneAsTyped('061234567890123')).toBe('06 12 34 56 78')
  })

  it('formats +33 with single-digit head then pairs', () => {
    expect(formatFrenchPhoneAsTyped('+33612345678')).toBe('+33 6 12 34 56 78')
  })

  it('formats partial +33 input', () => {
    expect(formatFrenchPhoneAsTyped('+33')).toBe('+33')
    expect(formatFrenchPhoneAsTyped('+336')).toBe('+33 6')
    expect(formatFrenchPhoneAsTyped('+3361')).toBe('+33 6 1')
  })

  it('formats 0033 with single-digit head then pairs', () => {
    expect(formatFrenchPhoneAsTyped('0033612345678')).toBe('0033 6 12 34 56 78')
  })

  it('formats partial 0033 input', () => {
    expect(formatFrenchPhoneAsTyped('0033')).toBe('0033')
    expect(formatFrenchPhoneAsTyped('00336')).toBe('0033 6')
  })

  it('is idempotent — passing its own output back yields same value', () => {
    const inputs = ['0612345678', '+33612345678', '0033612345678', '0612', '+336']
    for (const raw of inputs) {
      const once = formatFrenchPhoneAsTyped(raw)
      const twice = formatFrenchPhoneAsTyped(once)
      expect(twice).toBe(once)
    }
  })
})
