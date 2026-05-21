/**
 * Tests — SDL constant + introspection consistency.
 *
 * Couvre :
 *  - SDL string is non-empty and balanced
 *  - ROOT_QUERY_FIELDS contains all 5 expected root fields
 *  - SDL references all root field names
 *  - SDL ends without unclosed braces / parens
 */
import { describe, it, expect } from 'vitest'

import { SDL, ROOT_QUERY_FIELDS } from '@/app/api/v1/graphql/_schema'

describe('SDL constant', () => {
  it('exposes the 5 expected root query fields', () => {
    expect([...ROOT_QUERY_FIELDS].sort()).toEqual([
      'ceeBareme',
      'cumulRules',
      'mprBareme',
      'rgeLookup',
      'rgeSearch',
    ])
  })

  it('SDL contains each root field name', () => {
    for (const f of ROOT_QUERY_FIELDS) {
      expect(SDL).toContain(f)
    }
  })

  it('SDL has balanced braces and parens', () => {
    const lbrace = (SDL.match(/\{/g) ?? []).length
    const rbrace = (SDL.match(/\}/g) ?? []).length
    expect(lbrace).toBe(rbrace)
    const lparen = (SDL.match(/\(/g) ?? []).length
    const rparen = (SDL.match(/\)/g) ?? []).length
    expect(lparen).toBe(rparen)
  })

  it('SDL declares both top-level Query type and at least 5 object types', () => {
    expect(SDL).toContain('type Query')
    const typeDecls = (SDL.match(/\ntype [A-Z]/g) ?? []).length
    expect(typeDecls).toBeGreaterThanOrEqual(5)
  })

  it('SDL declares the 2 expected input types', () => {
    expect(SDL).toContain('input MprBaremeInput')
    expect(SDL).toContain('input CeeBaremeInput')
  })
})
