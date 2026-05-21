/**
 * Tests — `_flatten-spec.ts` (Ralph 40).
 *
 * Targets the pure OpenAPI 3.1 → `OpLite[]` transformer that feeds the
 * Try-it-now console. Covers the well-formed shape used by the Ralph 27
 * const + defensive edge cases (no paths, non-object spec, unknown
 * methods, missing tags, missing summary, missing requestBody).
 */
import { describe, it, expect } from 'vitest'
import { flattenSpec } from '@/app/(public)/developpeurs/try/_flatten-spec'

describe('flattenSpec — defensive shape', () => {
  it('returns [] for non-object spec', () => {
    expect(flattenSpec(null)).toEqual([])
    expect(flattenSpec(undefined)).toEqual([])
    expect(flattenSpec('oops')).toEqual([])
    expect(flattenSpec([1, 2, 3])).toEqual([])
  })

  it('returns [] when spec has no paths', () => {
    expect(flattenSpec({})).toEqual([])
    expect(flattenSpec({ paths: null })).toEqual([])
  })
})

describe('flattenSpec — extraction', () => {
  it('emits one OpLite per (method, path) tuple', () => {
    const spec = {
      paths: {
        '/users': {
          get: { tags: ['User'], summary: 'List users' },
          post: { tags: ['User'], summary: 'Create user' },
        },
      },
    }
    const out = flattenSpec(spec)
    expect(out).toHaveLength(2)
    const methods = out.map((o) => o.method).sort()
    expect(methods).toEqual(['GET', 'POST'])
  })

  it('walks all 6 supported methods', () => {
    const spec = {
      paths: {
        '/r': {
          get: {},
          post: {},
          put: {},
          patch: {},
          delete: {},
          head: {},
        },
      },
    }
    const out = flattenSpec(spec)
    expect(out).toHaveLength(6)
  })

  it('uses tags[0] when present, defaults to "Misc"', () => {
    const out = flattenSpec({
      paths: {
        '/a': { get: { tags: ['AI'] } },
        '/b': { get: {} },
        '/c': { get: { tags: [42, 'Fallback'] } },
      },
    })
    const a = out.find((o) => o.path === '/a')
    const b = out.find((o) => o.path === '/b')
    const c = out.find((o) => o.path === '/c')
    expect(a?.tag).toBe('AI')
    expect(b?.tag).toBe('Misc')
    expect(c?.tag).toBe('Misc')
  })

  it('synthesises a summary from method+path when missing', () => {
    const out = flattenSpec({
      paths: { '/ping': { get: {} } },
    })
    expect(out[0]?.summary).toBe('GET /ping')
  })

  it('preserves path parameter braces (e.g. /users/{id})', () => {
    const out = flattenSpec({
      paths: {
        '/users/{id}': {
          get: {
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          },
        },
      },
    })
    expect(out[0]?.path).toBe('/users/{id}')
    expect(out[0]?.parameters[0]?.in).toBe('path')
    expect(out[0]?.parameters[0]?.required).toBe(true)
  })

  it('captures enum values on a parameter schema', () => {
    const out = flattenSpec({
      paths: {
        '/r': {
          get: {
            parameters: [
              { name: 'mode', in: 'query', schema: { type: 'string', enum: ['fast', 'slow'] } },
            ],
          },
        },
      },
    })
    expect(out[0]?.parameters[0]?.enum).toEqual(['fast', 'slow'])
  })

  it('detects application/json request body and emits hasJsonBody=true', () => {
    const out = flattenSpec({
      paths: {
        '/ask': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: { type: 'object' },
                  example: { query: 'Hello' },
                },
              },
            },
          },
        },
      },
    })
    expect(out[0]?.hasJsonBody).toBe(true)
    expect(out[0]?.bodySample).toContain('"query"')
    expect(out[0]?.bodySample).toContain('"Hello"')
  })

  it('falls back to examples[firstKey].value when no top-level example exists', () => {
    const out = flattenSpec({
      paths: {
        '/x': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  examples: {
                    first: { value: { foo: 1 } },
                    second: { value: { foo: 2 } },
                  },
                },
              },
            },
          },
        },
      },
    })
    expect(out[0]?.bodySample).toContain('"foo"')
    expect(out[0]?.bodySample).toContain('1')
  })

  it('hasJsonBody=false when content type is not application/json', () => {
    const out = flattenSpec({
      paths: {
        '/x': {
          post: {
            requestBody: { content: { 'application/xml': { schema: {} } } },
          },
        },
      },
    })
    expect(out[0]?.hasJsonBody).toBe(false)
    expect(out[0]?.bodySample).toBe('')
  })

  it('sorts by tag, then path, then method', () => {
    const out = flattenSpec({
      paths: {
        '/z': { get: { tags: ['A'] } },
        '/a': { post: { tags: ['Z'] } },
        '/m': { delete: { tags: ['A'] } },
      },
    })
    // tag A first, within A sort by path '/m' < '/z'
    expect(out[0]?.tag).toBe('A')
    expect(out[0]?.path).toBe('/m')
    expect(out[1]?.path).toBe('/z')
    expect(out[2]?.tag).toBe('Z')
  })

  it('ignores parameters with bogus `in`', () => {
    const out = flattenSpec({
      paths: {
        '/r': {
          get: {
            parameters: [
              { name: 'a', in: 'body', schema: { type: 'string' } },
              { name: 'b', in: 'query', schema: { type: 'string' } },
            ],
          },
        },
      },
    })
    const names = out[0]?.parameters.map((p) => p.name)
    expect(names).toEqual(['b'])
  })
})
