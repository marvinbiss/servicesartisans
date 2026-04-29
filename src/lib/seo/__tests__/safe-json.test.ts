import { describe, it, expect } from 'vitest'
import { safeJsonStringify } from '../safe-json'

describe('safeJsonStringify (centralized in @/lib/seo/safe-json)', () => {
  it('escapes < > & to prevent XSS via script tag closure', () => {
    const out = safeJsonStringify({ name: '</script><script>alert(1)</script>' })
    expect(out).not.toContain('</script>')
    expect(out).not.toContain('<script>')
    expect(out).toContain('\\u003c')
    expect(out).toContain('\\u003e')
  })

  it('escapes & to \\u0026', () => {
    const out = safeJsonStringify({ text: 'A & B' })
    expect(out).not.toContain(' & ')
    expect(out).toContain('\\u0026')
  })

  it('escapes U+2028 LINE SEPARATOR (prevents script tag breakage)', () => {
    const out = safeJsonStringify({ val: 'before after' })
    expect(out).not.toContain(' ')
    expect(out).toContain('\\u2028')
  })

  it('escapes U+2029 PARAGRAPH SEPARATOR', () => {
    const out = safeJsonStringify({ val: 'before after' })
    expect(out).not.toContain(' ')
    expect(out).toContain('\\u2029')
  })

  it('returns "null" on circular reference (fail-soft)', () => {
    const obj: Record<string, unknown> = { name: 'test' }
    obj.self = obj
    expect(safeJsonStringify(obj)).toBe('null')
  })

  it('returns "null" on BigInt input', () => {
    expect(safeJsonStringify({ siret: BigInt('83001931100026') })).toBe('null')
  })

  it('returns "null" on undefined input (JSON.stringify quirk)', () => {
    expect(safeJsonStringify(undefined)).toBe('null')
  })

  it('round-trips: parse(safeJsonStringify(obj)) recovers obj', () => {
    const obj = { name: 'test', value: 123, nested: { ok: true } }
    expect(JSON.parse(safeJsonStringify(obj))).toEqual(obj)
  })

  it('XSS regression: full payload neutralized', () => {
    const payload = { name: '</script><script>alert(1)</script> ' }
    const out = safeJsonStringify(payload)
    expect(out).not.toContain('</script>')
    expect(out).not.toContain(' ')
  })
})
