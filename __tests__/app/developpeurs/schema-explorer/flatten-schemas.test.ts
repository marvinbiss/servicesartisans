/**
 * Tests — `_flatten-schemas.ts` extractor.
 *
 * Covers the well-formed shape used by the Ralph 27 OpenAPI const and a
 * battery of edge cases (no components, $ref cycles, malformed types,
 * non-string required entries). The flattener must never throw.
 */
import { describe, it, expect } from 'vitest'
import { flattenSchemas } from '@/app/(public)/developpeurs/schema-explorer/_flatten-schemas'

describe('flattenSchemas — well-formed', () => {
  it('returns [] when the spec has no components.schemas', () => {
    expect(flattenSchemas({})).toEqual([])
    expect(flattenSchemas({ components: {} })).toEqual([])
    expect(flattenSchemas({ components: { schemas: {} } })).toEqual([])
  })

  it('emits one SchemaLite per named schema, sorted alphabetically', () => {
    const out = flattenSchemas({
      components: {
        schemas: {
          ZSchema: { type: 'object' },
          ASchema: { type: 'object' },
          MSchema: { type: 'object' },
        },
      },
    })
    expect(out.map((s) => s.name)).toEqual(['ASchema', 'MSchema', 'ZSchema'])
  })

  it('flattens properties with name + type + required flag', () => {
    const out = flattenSchemas({
      components: {
        schemas: {
          User: {
            type: 'object',
            required: ['id'],
            properties: {
              id: { type: 'string' },
              age: { type: 'integer' },
            },
          },
        },
      },
    })
    expect(out.length).toBe(1)
    const props = out[0]?.properties ?? []
    const id = props.find((p) => p.name === 'id')
    const age = props.find((p) => p.name === 'age')
    expect(id?.required).toBe(true)
    expect(id?.type).toBe('string')
    expect(age?.required).toBe(false)
    expect(age?.type).toBe('integer')
  })

  it('captures $ref properties as type "$ref" + refTo schema name', () => {
    const out = flattenSchemas({
      components: {
        schemas: {
          A: {
            type: 'object',
            properties: { b: { $ref: '#/components/schemas/B' } },
          },
          B: { type: 'object' },
        },
      },
    })
    const a = out.find((s) => s.name === 'A')
    const b = a?.properties.find((p) => p.name === 'b')
    expect(b?.type).toBe('$ref')
    expect(b?.refTo).toBe('B')
  })

  it('captures up to 5 enum values on a property', () => {
    const out = flattenSchemas({
      components: {
        schemas: {
          Status: {
            type: 'object',
            properties: { v: { type: 'string', enum: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] } },
          },
        },
      },
    })
    const v = out[0]?.properties.find((p) => p.name === 'v')
    // enum is fully captured at the prop level — the renderer slices to 5,
    // but the extractor keeps the source-of-truth array intact.
    expect(v?.enum?.length).toBe(7)
  })

  it('captures format on a string property', () => {
    const out = flattenSchemas({
      components: {
        schemas: {
          T: {
            type: 'object',
            properties: { ts: { type: 'string', format: 'date-time' } },
          },
        },
      },
    })
    const ts = out[0]?.properties.find((p) => p.name === 'ts')
    expect(ts?.format).toBe('date-time')
  })

  it('builds a reverse usedBy index from paths that $ref a schema', () => {
    const spec = {
      components: { schemas: { User: { type: 'object' } } },
      paths: {
        '/api/v1/users/{id}': {
          get: {
            operationId: 'getUser',
            responses: {
              '200': {
                content: {
                  'application/json': { schema: { $ref: '#/components/schemas/User' } },
                },
              },
            },
          },
        },
      },
    }
    const out = flattenSchemas(spec)
    const user = out.find((s) => s.name === 'User')
    expect(user?.usedBy.length).toBe(1)
    expect(user?.usedBy[0]).toMatchObject({
      method: 'get',
      path: '/api/v1/users/{id}',
      operationId: 'getUser',
    })
  })

  it('deduplicates usedBy entries for the same (method, path)', () => {
    const spec = {
      components: { schemas: { User: { type: 'object' } } },
      paths: {
        '/api/v1/users': {
          get: {
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
              '404': {
                content: {
                  'application/json': { schema: { $ref: '#/components/schemas/User' } },
                },
              },
            },
          },
        },
      },
    }
    const out = flattenSchemas(spec)
    const user = out.find((s) => s.name === 'User')
    expect(user?.usedBy.length).toBe(1)
  })

  it('does not crash on a circular $ref chain', () => {
    const out = flattenSchemas({
      components: {
        schemas: {
          Node: {
            type: 'object',
            properties: { next: { $ref: '#/components/schemas/Node' } },
          },
        },
      },
    })
    const node = out.find((s) => s.name === 'Node')
    expect(node?.properties[0]?.refTo).toBe('Node')
  })

  it('skips non-object schemas defensively', () => {
    const out = flattenSchemas({
      components: {
        schemas: {
          Bad: null,
          AlsoBad: 'oops',
          Good: { type: 'object' },
        },
      },
    })
    expect(out.map((s) => s.name)).toEqual(['Good'])
  })

  it('exposes required as a string[] (filters non-string entries)', () => {
    const out = flattenSchemas({
      components: {
        schemas: {
          T: {
            type: 'object',
            required: ['a', 42, 'b', null],
            properties: { a: { type: 'string' }, b: { type: 'string' } },
          },
        },
      },
    })
    expect(out[0]?.required).toEqual(['a', 'b'])
  })
})
