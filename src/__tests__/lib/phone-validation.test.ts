import { describe, it, expect } from 'vitest'
import { cleanPhone, isValidFrenchPhone, formatPhoneForTel } from '@/lib/validation/phone'

// ===========================================================================
// cleanPhone
// ===========================================================================

describe('cleanPhone', () => {
  it('keeps plain digits', () => {
    expect(cleanPhone('0612345678')).toBe('0612345678')
  })

  it('strips spaces', () => {
    expect(cleanPhone('06 12 34 56 78')).toBe('0612345678')
  })

  it('strips dots', () => {
    expect(cleanPhone('06.12.34.56.78')).toBe('0612345678')
  })

  it('strips dashes', () => {
    expect(cleanPhone('06-12-34-56-78')).toBe('0612345678')
  })

  it('strips parentheses', () => {
    expect(cleanPhone('(06) 12 34 56 78')).toBe('0612345678')
  })

  it('preserves leading +', () => {
    expect(cleanPhone('+33612345678')).toBe('+33612345678')
  })

  it('strips non-leading +', () => {
    expect(cleanPhone('+33+612+345')).toBe('+33612345')
  })

  it('strips non-breaking spaces (U+00A0)', () => {
    expect(cleanPhone('06\u00A012\u00A034\u00A056\u00A078')).toBe('0612345678')
  })

  it('strips narrow no-break spaces (U+202F)', () => {
    expect(cleanPhone('06\u202F12\u202F34\u202F56\u202F78')).toBe('0612345678')
  })

  it('handles empty string', () => {
    expect(cleanPhone('')).toBe('')
  })
})

// ===========================================================================
// isValidFrenchPhone
// ===========================================================================

describe('isValidFrenchPhone', () => {
  // Mobile numbers (06/07)
  it('accepts 06 mobile number', () => {
    expect(isValidFrenchPhone('0612345678')).toBe(true)
  })

  it('accepts 07 mobile number', () => {
    expect(isValidFrenchPhone('0712345678')).toBe(true)
  })

  it('accepts 06 with spaces', () => {
    expect(isValidFrenchPhone('06 12 34 56 78')).toBe(true)
  })

  it('accepts 06 with dots', () => {
    expect(isValidFrenchPhone('06.12.34.56.78')).toBe(true)
  })

  // Landline numbers (01-05, 08, 09)
  it('accepts 01 Paris landline', () => {
    expect(isValidFrenchPhone('0145678901')).toBe(true)
  })

  it('accepts 02 NW France landline', () => {
    expect(isValidFrenchPhone('0234567890')).toBe(true)
  })

  it('accepts 03 NE France landline', () => {
    expect(isValidFrenchPhone('0345678901')).toBe(true)
  })

  it('accepts 04 SE France landline', () => {
    expect(isValidFrenchPhone('0456789012')).toBe(true)
  })

  it('accepts 05 SW France landline', () => {
    expect(isValidFrenchPhone('0567890123')).toBe(true)
  })

  it('accepts 09 VoIP number', () => {
    expect(isValidFrenchPhone('0912345678')).toBe(true)
  })

  // International format +33
  it('accepts +33 format', () => {
    expect(isValidFrenchPhone('+33612345678')).toBe(true)
  })

  it('accepts +33 with spaces', () => {
    expect(isValidFrenchPhone('+33 6 12 34 56 78')).toBe(true)
  })

  // 0033 format
  it('accepts 0033 format', () => {
    expect(isValidFrenchPhone('0033612345678')).toBe(true)
  })

  // Invalid numbers
  it('rejects empty string', () => {
    expect(isValidFrenchPhone('')).toBe(false)
  })

  it('rejects too short number', () => {
    expect(isValidFrenchPhone('061234')).toBe(false)
  })

  it('rejects too long number', () => {
    expect(isValidFrenchPhone('061234567890')).toBe(false)
  })

  it('rejects number starting with 00 (not a valid French prefix)', () => {
    expect(isValidFrenchPhone('0012345678')).toBe(false)
  })

  it('rejects letters', () => {
    expect(isValidFrenchPhone('06ABCDEFGH')).toBe(false)
  })

  it('rejects random text', () => {
    expect(isValidFrenchPhone('not a phone')).toBe(false)
  })

  it('rejects foreign number without proper prefix', () => {
    expect(isValidFrenchPhone('+44712345678')).toBe(false)
  })

  it('rejects +33 with 0 after (would be +330...)', () => {
    expect(isValidFrenchPhone('+330612345678')).toBe(false)
  })
})

// ===========================================================================
// formatPhoneForTel
// ===========================================================================

describe('formatPhoneForTel', () => {
  it('converts 0x format to +33x', () => {
    expect(formatPhoneForTel('0612345678')).toBe('+33612345678')
  })

  it('strips spaces and converts', () => {
    expect(formatPhoneForTel('06 12 34 56 78')).toBe('+33612345678')
  })

  it('strips dots and converts', () => {
    expect(formatPhoneForTel('06.12.34.56.78')).toBe('+33612345678')
  })

  it('strips dashes and converts', () => {
    expect(formatPhoneForTel('06-12-34-56-78')).toBe('+33612345678')
  })

  it('strips parentheses and converts', () => {
    expect(formatPhoneForTel('(06) 12 34 56 78')).toBe('+33612345678')
  })

  it('leaves +33 format untouched', () => {
    expect(formatPhoneForTel('+33612345678')).toBe('+33612345678')
  })

  it('handles landline number', () => {
    expect(formatPhoneForTel('01 45 67 89 01')).toBe('+33145678901')
  })
})
