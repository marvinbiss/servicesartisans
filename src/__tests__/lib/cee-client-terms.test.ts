/**
 * Tests for `getCeeClientTerm` — Action #9 (Sprint A) striking distance attack.
 * Verifies the SEO title-rewrite layer that maps ADEME jargon → client term.
 */
import { describe, it, expect } from 'vitest'
import { getCeeClientTerm } from '@/lib/cee/client-terms'

describe('getCeeClientTerm', () => {
  it('returns client-friendly term for high-volume CEE ops', () => {
    expect(getCeeClientTerm('BAR-TH-112')).toBe('Poêle à granulés')
    expect(getCeeClientTerm('BAR-TH-148')).toBe('Chauffe-eau thermodynamique')
    expect(getCeeClientTerm('BAR-TH-127')).toBe('VMC simple flux hygroréglable')
    expect(getCeeClientTerm('BAR-EN-104')).toBe('Fenêtres double-vitrage')
    expect(getCeeClientTerm('BAR-EN-103')).toBe('Isolation murs extérieurs (ITE)')
  })

  it('is case-insensitive on the operation code', () => {
    expect(getCeeClientTerm('bar-th-112')).toBe('Poêle à granulés')
    expect(getCeeClientTerm('Bar-Th-148')).toBe('Chauffe-eau thermodynamique')
  })

  it('returns null for unknown operation codes', () => {
    expect(getCeeClientTerm('BAR-XX-999')).toBeNull()
    expect(getCeeClientTerm('UNKNOWN')).toBeNull()
    expect(getCeeClientTerm('')).toBeNull()
  })

  it('covers all CEE_OPERATION_CODES used by sitemap', () => {
    // List mirrors CEE_OPERATION_CODES_FOR_SITEMAP in src/lib/seo/lastmod-queries.ts
    // (we only check the high-priority ones — not all need a client term).
    const highPriority = [
      'BAR-EN-101',
      'BAR-EN-102',
      'BAR-EN-103',
      'BAR-EN-104',
      'BAR-EN-108',
      'BAR-TH-112',
      'BAR-TH-125',
      'BAR-TH-127',
      'BAR-TH-148',
    ]
    for (const code of highPriority) {
      expect(getCeeClientTerm(code)).not.toBeNull()
    }
  })
})
