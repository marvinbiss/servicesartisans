/**
 * Tests — `_example-builder.ts` minimal-example synthesiser.
 *
 * Each test isolates one schema-language feature (type, format, enum,
 * $ref, required) so a regression points straight at the offending
 * branch. Cycle detection is exercised via the `visited` set.
 */
import { describe, it, expect } from 'vitest'
import { buildMinimalExample } from '@/app/(public)/developpeurs/schema-explorer/_example-builder'

describe('buildMinimalExample — primitives', () => {
  it('emits "string" for type:string without format', () => {
    expect(buildMinimalExample('T', { T: { type: 'string' } })).toBe('string')
  })

  it('emits an ISO date-time literal for format:date-time', () => {
    const v = buildMinimalExample('T', { T: { type: 'string', format: 'date-time' } })
    expect(typeof v).toBe('string')
    expect(v).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('emits a YYYY-MM-DD literal for format:date', () => {
    const v = buildMinimalExample('T', { T: { type: 'string', format: 'date' } })
    expect(v).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('emits an email literal for format:email', () => {
    const v = buildMinimalExample('T', { T: { type: 'string', format: 'email' } })
    expect(String(v)).toMatch(/@/)
  })

  it('emits an HTTPS URI literal for format:uri', () => {
    const v = buildMinimalExample('T', { T: { type: 'string', format: 'uri' } })
    expect(String(v)).toMatch(/^https?:\/\//)
  })

  it('emits a v4-shaped UUID literal for format:uuid', () => {
    const v = buildMinimalExample('T', { T: { type: 'string', format: 'uuid' } })
    expect(String(v)).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('emits 0 for integer / number', () => {
    expect(buildMinimalExample('T', { T: { type: 'integer' } })).toBe(0)
    expect(buildMinimalExample('T', { T: { type: 'number' } })).toBe(0)
  })

  it('emits true for boolean', () => {
    expect(buildMinimalExample('T', { T: { type: 'boolean' } })).toBe(true)
  })
})

describe('buildMinimalExample — composites', () => {
  it('emits a single-element array for type:array', () => {
    const v = buildMinimalExample('T', {
      T: { type: 'array', items: { type: 'string' } },
    })
    expect(Array.isArray(v)).toBe(true)
    expect((v as unknown[]).length).toBe(1)
    expect((v as unknown[])[0]).toBe('string')
  })

  it('emits only required properties when required is set', () => {
    const v = buildMinimalExample('T', {
      T: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
      },
    })
    expect(v).toEqual({ id: 'string' })
  })

  it('emits every property when required is absent', () => {
    const v = buildMinimalExample('T', {
      T: {
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: { type: 'integer' },
        },
      },
    })
    expect(v).toEqual({ a: 'string', b: 0 })
  })

  it('resolves a nested $ref recursively', () => {
    const v = buildMinimalExample('A', {
      A: {
        type: 'object',
        required: ['b'],
        properties: { b: { $ref: '#/components/schemas/B' } },
      },
      B: { type: 'string' },
    })
    expect(v).toEqual({ b: 'string' })
  })
})

describe('buildMinimalExample — edge cases', () => {
  it('returns null on a circular $ref (no infinite loop)', () => {
    const out = buildMinimalExample('Node', {
      Node: {
        type: 'object',
        required: ['next'],
        properties: { next: { $ref: '#/components/schemas/Node' } },
      },
    })
    // First level returns { next: null } because the recursive build
    // sees Node already in `visited`.
    expect(out).toEqual({ next: null })
  })

  it('returns the first enum value when enum is set', () => {
    const v = buildMinimalExample('T', { T: { type: 'string', enum: ['alpha', 'beta'] } })
    expect(v).toBe('alpha')
  })

  it('honours an explicit example field over inferred values', () => {
    const v = buildMinimalExample('T', { T: { type: 'string', example: 'pinned' } })
    expect(v).toBe('pinned')
  })

  it('returns null for a schema with no type and no properties', () => {
    expect(buildMinimalExample('T', { T: {} })).toBe(null)
  })

  it('returns null for an unknown schema name', () => {
    expect(buildMinimalExample('Missing', {})).toBe(null)
  })
})
