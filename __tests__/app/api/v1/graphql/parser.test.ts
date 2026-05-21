/**
 * Tests — GraphQL parser (`src/app/api/v1/graphql/_parser.ts`)
 *
 * Couvre :
 *  - Source vide / non-string
 *  - Source > 8000 chars
 *  - Selection unique avec args String/Int/Float/Boolean/null/list/object
 *  - Selection imbriquée
 *  - Multi-root
 *  - Malformed (parens / braces non fermés)
 *  - Depth >5 → erreur
 *  - Fields >20 → erreur
 *  - Strings avec escape sequences
 *  - Shorthand `{...}` vs `query { ... }`
 */
import { describe, it, expect } from 'vitest'
import { parseGraphQL } from '@/app/api/v1/graphql/_parser'

describe('parseGraphQL — invalid input', () => {
  it('returns error on empty string', () => {
    const res = parseGraphQL('')
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toMatch(/empty/i)
  })

  it('returns error when source exceeds 8000 chars', () => {
    const huge = '{' + 'a'.repeat(8100) + '}'
    const res = parseGraphQL(huge)
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toMatch(/8000/)
  })

  it('returns error on malformed query (unclosed brace)', () => {
    const res = parseGraphQL('{ rgeLookup(siret: "1") { nom ')
    expect(res.ok).toBe(false)
  })

  it('returns error on unterminated string literal', () => {
    const res = parseGraphQL('{ rgeLookup(siret: "unterminated)')
    expect(res.ok).toBe(false)
  })

  it('returns error on empty selection set', () => {
    const res = parseGraphQL('{ }')
    expect(res.ok).toBe(false)
  })
})

describe('parseGraphQL — basic queries', () => {
  it('parses simple root field with string arg', () => {
    const res = parseGraphQL('{ rgeLookup(siret: "12345678901234") { nom ville } }')
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.query.operation).toBe('query')
    expect(res.query.fields).toHaveLength(1)
    const root = res.query.fields[0]!
    expect(root.name).toBe('rgeLookup')
    expect(root.args.siret).toBe('12345678901234')
    expect(root.selections.map((s) => s.name)).toEqual(['nom', 'ville'])
  })

  it('parses shorthand and `query` keyword identically', () => {
    const a = parseGraphQL('{ rgeLookup(siret: "1") { nom } }')
    const b = parseGraphQL('query { rgeLookup(siret: "1") { nom } }')
    expect(a.ok).toBe(true)
    expect(b.ok).toBe(true)
    if (!a.ok || !b.ok) return
    expect(a.query.operation).toBe('query')
    expect(b.query.operation).toBe('query')
    expect(a.query.fields[0]!.name).toBe(b.query.fields[0]!.name)
  })

  it('parses multi-root selection', () => {
    const res = parseGraphQL('{ rgeLookup(siret: "1") { nom } cumulRules { rules { geste } } }')
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.query.fields).toHaveLength(2)
    expect(res.query.fields[0]!.name).toBe('rgeLookup')
    expect(res.query.fields[1]!.name).toBe('cumulRules')
  })

  it('parses nested selection set 3 levels deep', () => {
    const res = parseGraphQL(
      '{ rgeSearch(metier: "p", ville: "Lyon") { results { qualifications_count } total } }'
    )
    expect(res.ok).toBe(true)
    if (!res.ok) return
    const root = res.query.fields[0]!
    expect(root.selections.map((s) => s.name)).toEqual(['results', 'total'])
    const results = root.selections.find((s) => s.name === 'results')!
    expect(results.selections.map((s) => s.name)).toEqual(['qualifications_count'])
  })
})

describe('parseGraphQL — argument types', () => {
  it('parses Int args as numbers', () => {
    const res = parseGraphQL('{ rgeSearch(metier: "p", ville: "L", limit: 10) { total } }')
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.query.fields[0]!.args.limit).toBe(10)
    expect(typeof res.query.fields[0]!.args.limit).toBe('number')
  })

  it('parses negative numbers and floats', () => {
    const res = parseGraphQL('{ test(neg: -42, frac: 3.14) { x } }')
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.query.fields[0]!.args.neg).toBe(-42)
    expect(res.query.fields[0]!.args.frac).toBeCloseTo(3.14)
  })

  it('parses Boolean and null literals', () => {
    const res = parseGraphQL('{ test(active: true, archived: false, label: null) { x } }')
    expect(res.ok).toBe(true)
    if (!res.ok) return
    const a = res.query.fields[0]!.args
    expect(a.active).toBe(true)
    expect(a.archived).toBe(false)
    expect(a.label).toBe(null)
  })

  it('parses object input args', () => {
    const res = parseGraphQL(
      '{ mprBareme(input: { geste: "pac_air_eau", menageCategorie: "tres_modeste", zone: "hors_idf", rfr: 10000, nbPersonnes: 2 }) { result { eligible } } }'
    )
    expect(res.ok).toBe(true)
    if (!res.ok) return
    const input = res.query.fields[0]!.args.input as Record<string, unknown>
    expect(input.geste).toBe('pac_air_eau')
    expect(input.rfr).toBe(10000)
    expect(input.nbPersonnes).toBe(2)
  })

  it('parses list args', () => {
    const res = parseGraphQL('{ test(codes: ["A", "B", "C"]) { x } }')
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.query.fields[0]!.args.codes).toEqual(['A', 'B', 'C'])
  })

  it('handles escape sequences in strings (newline, quote)', () => {
    const res = parseGraphQL('{ test(s: "line1\\nline2 with \\"quote\\"") { x } }')
    expect(res.ok).toBe(true)
    if (!res.ok) return
    const s = res.query.fields[0]!.args.s as string
    expect(s).toContain('\n')
    expect(s).toContain('"')
  })
})

describe('parseGraphQL — DoS guards', () => {
  it('returns error when selection depth exceeds 5', () => {
    const deep = '{ a { b { c { d { e { f { g } } } } } } }'
    const res = parseGraphQL(deep)
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toMatch(/depth|MAX_DEPTH/i)
  })

  it('returns error when total fields exceed 20', () => {
    const many = '{ ' + Array.from({ length: 22 }, (_, i) => `f${i}`).join(' ') + ' }'
    const res = parseGraphQL(many)
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toMatch(/MAX_FIELDS|20/)
  })
})

describe('parseGraphQL — introspection', () => {
  it('accepts __schema and __typename root fields', () => {
    const res = parseGraphQL('{ __typename __schema { queryType { fields { name } } } }')
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.query.fields.map((f) => f.name)).toEqual(['__typename', '__schema'])
  })
})
