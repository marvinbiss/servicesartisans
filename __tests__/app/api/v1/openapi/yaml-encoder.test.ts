/**
 * Tests — `encodeYaml` (`src/app/api/v1/openapi/_yaml-encoder.ts`).
 *
 * Couvre :
 *  - null → 'null'
 *  - booleans → 'true' / 'false'
 *  - numbers → string, NaN/Infinity → 'null'
 *  - simple strings unquoted
 *  - strings with whitespace double-quoted
 *  - empty string → '""'
 *  - multi-line string → block scalar `|`
 *  - arrays → block sequence with leading newline
 *  - empty array → '[]'
 *  - objects → block mapping with key: value lines
 *  - empty object → '{}'
 *  - nested object preserves indentation
 *  - round-trip subset : key/value parseable when split manually
 */
import { describe, it, expect } from 'vitest'

import { encodeYaml } from '@/app/api/v1/openapi/_yaml-encoder'

describe('encodeYaml — scalars', () => {
  it('encodes null', () => {
    expect(encodeYaml(null)).toBe('null')
  })

  it('encodes undefined as null', () => {
    expect(encodeYaml(undefined)).toBe('null')
  })

  it('encodes booleans', () => {
    expect(encodeYaml(true)).toBe('true')
    expect(encodeYaml(false)).toBe('false')
  })

  it('encodes finite numbers', () => {
    expect(encodeYaml(42)).toBe('42')
    expect(encodeYaml(-3.14)).toBe('-3.14')
    expect(encodeYaml(0)).toBe('0')
  })

  it('encodes NaN/Infinity as null', () => {
    expect(encodeYaml(NaN)).toBe('null')
    expect(encodeYaml(Infinity)).toBe('null')
    expect(encodeYaml(-Infinity)).toBe('null')
  })
})

describe('encodeYaml — strings', () => {
  it('encodes simple identifiers unquoted', () => {
    expect(encodeYaml('simple')).toBe('simple')
    expect(encodeYaml('CC-BY-4.0')).toBe('CC-BY-4.0')
    expect(encodeYaml('https://example.com/path')).toBe('https://example.com/path')
  })

  it('quotes strings containing spaces', () => {
    expect(encodeYaml('with space')).toBe('"with space"')
  })

  it('quotes empty string', () => {
    expect(encodeYaml('')).toBe('""')
  })

  it('quotes reserved tokens', () => {
    expect(encodeYaml('true')).toBe('"true"')
    expect(encodeYaml('null')).toBe('"null"')
  })

  it('quotes strings that look like numbers', () => {
    expect(encodeYaml('42')).toBe('"42"')
    expect(encodeYaml('-3')).toBe('"-3"')
  })

  it('encodes multi-line strings as block scalar |', () => {
    const out = encodeYaml('line1\nline2', 0)
    expect(out.startsWith('|\n')).toBe(true)
    expect(out).toContain('line1')
    expect(out).toContain('line2')
  })
})

describe('encodeYaml — arrays', () => {
  it('encodes empty array as []', () => {
    expect(encodeYaml([])).toBe('[]')
  })

  it('encodes flat array as block sequence', () => {
    const out = encodeYaml([1, 2, 3], 0)
    expect(out).toContain('- 1')
    expect(out).toContain('- 2')
    expect(out).toContain('- 3')
    expect(out.startsWith('\n')).toBe(true)
  })

  it('encodes array of strings inline per item', () => {
    const out = encodeYaml(['a', 'b'], 0)
    expect(out).toContain('- a')
    expect(out).toContain('- b')
  })
})

describe('encodeYaml — objects', () => {
  it('encodes empty object as {}', () => {
    expect(encodeYaml({})).toBe('{}')
  })

  it('encodes flat object as block mapping', () => {
    const out = encodeYaml({ a: 1, b: 2 }, 0)
    expect(out).toContain('a: 1')
    expect(out).toContain('b: 2')
    const lines = out.split('\n')
    expect(lines[0]).toBe('a: 1')
    expect(lines[1]).toBe('b: 2')
  })

  it('preserves nested indentation', () => {
    const out = encodeYaml({ outer: { inner: 1 } }, 0)
    expect(out).toMatch(/outer:\n {2}inner: 1/)
  })

  it('quotes non-safe keys', () => {
    const out = encodeYaml({ 'with space': 1 }, 0)
    expect(out.startsWith('"with space":')).toBe(true)
  })

  it('encodes deeply nested OpenAPI-like structure', () => {
    const value = {
      info: { title: 'X', license: { name: 'CC-BY-4.0' } },
      paths: { '/a': { get: { tags: ['Meta'] } } },
    }
    const out = encodeYaml(value, 0)
    expect(out).toContain('title: X')
    expect(out).toContain('name: CC-BY-4.0')
    expect(out).toContain('- Meta')
  })
})
