/**
 * Tests — `_renderer.tsx` flattenSpec extractor.
 *
 * The renderer extracts a flat OperationLite[] from any OpenAPI 3.1
 * paths object. We test both edge cases (empty, malformed pathItems)
 * and the well-formed minimal shape used by Ralph 27.
 */
import { describe, it, expect } from 'vitest'
import { flattenSpec } from '@/app/(public)/developpeurs/api-explorer/_renderer'

describe('flattenSpec — well-formed input', () => {
  it('returns one OperationLite per (path × method) pair', () => {
    const spec = {
      paths: {
        '/api/v1/foo': {
          get: { summary: 'g' },
          post: { summary: 'p' },
        },
        '/api/v1/bar': {
          delete: { summary: 'd' },
        },
      },
    }
    const ops = flattenSpec(spec)
    expect(ops.length).toBe(3)
    expect(ops.map((o) => o.method).sort()).toEqual(['delete', 'get', 'post'])
  })

  it('extracts parameters with name + in + type + required defaults', () => {
    const spec = {
      paths: {
        '/api/v1/foo': {
          get: {
            parameters: [
              { name: 'q', in: 'query', required: true, schema: { type: 'string' } },
              { name: 'limit', in: 'query', schema: { type: 'integer' } },
              { name: 'X-Trace', in: 'header' },
            ],
          },
        },
      },
    }
    const ops = flattenSpec(spec)
    expect(ops.length).toBe(1)
    const params = ops[0].parameters ?? []
    expect(params.length).toBe(3)
    expect(params[0]).toMatchObject({ name: 'q', in: 'query', required: true, type: 'string' })
    expect(params[1]).toMatchObject({
      name: 'limit',
      in: 'query',
      required: false,
      type: 'integer',
    })
    expect(params[2]).toMatchObject({ name: 'X-Trace', in: 'header', type: 'string' })
  })

  it('extracts request body application/json example value as pretty JSON', () => {
    const spec = {
      paths: {
        '/api/v1/foo': {
          post: {
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  examples: {
                    sample: { value: { hello: 'world', n: 42 } },
                  },
                },
              },
            },
          },
        },
      },
    }
    const ops = flattenSpec(spec)
    expect(ops[0].requestBodySample).toContain('"hello"')
    expect(ops[0].requestBodySample).toContain('"world"')
    expect(ops[0].requestBodySample).toContain('"n": 42')
  })

  it('extracts response status → description map', () => {
    const spec = {
      paths: {
        '/api/v1/foo': {
          get: {
            responses: {
              '200': { description: 'OK' },
              '404': { description: 'Not Found' },
              '500': {},
            },
          },
        },
      },
    }
    const ops = flattenSpec(spec)
    const responses = ops[0].responses
    expect(responses.length).toBe(3)
    expect(responses.find((r) => r.status === '200')?.description).toBe('OK')
    expect(responses.find((r) => r.status === '404')?.description).toBe('Not Found')
    expect(responses.find((r) => r.status === '500')?.description).toBeUndefined()
  })

  it('preserves tags as a string[] (filters non-string entries)', () => {
    const spec = {
      paths: {
        '/api/v1/foo': {
          get: { tags: ['Aides', 'Public', 123 as unknown as string] },
        },
      },
    }
    const ops = flattenSpec(spec)
    expect(ops[0].tags).toEqual(['Aides', 'Public'])
  })

  it('enumerates GET/POST/PUT/DELETE/HEAD/OPTIONS/PATCH', () => {
    const allMethods = ['get', 'post', 'put', 'delete', 'head', 'options', 'patch'] as const
    const pathItem: Record<string, { summary: string }> = {}
    for (const m of allMethods) pathItem[m] = { summary: m }
    const spec = { paths: { '/api/v1/all': pathItem } }
    const ops = flattenSpec(spec)
    expect(ops.length).toBe(7)
    expect(new Set(ops.map((o) => o.method))).toEqual(new Set(allMethods))
  })
})

describe('flattenSpec — edge cases', () => {
  it('returns [] for an empty/undefined paths object', () => {
    expect(flattenSpec({})).toEqual([])
    expect(flattenSpec({ paths: {} })).toEqual([])
  })

  it('skips non-object pathItems (null, string, number)', () => {
    const spec = {
      paths: {
        '/api/v1/bad-null': null as unknown as Record<string, unknown>,
        '/api/v1/bad-str': 'oops' as unknown as Record<string, unknown>,
        '/api/v1/good': { get: { summary: 'ok' } },
      },
    }
    const ops = flattenSpec(spec)
    expect(ops.length).toBe(1)
    expect(ops[0].path).toBe('/api/v1/good')
  })

  it('skips unknown HTTP-like methods (trace, connect)', () => {
    const spec = {
      paths: {
        '/api/v1/foo': {
          trace: { summary: 't' },
          connect: { summary: 'c' },
          get: { summary: 'g' },
        },
      },
    }
    const ops = flattenSpec(spec)
    expect(ops.length).toBe(1)
    expect(ops[0].method).toBe('get')
  })

  it('returns null requestBodySample when no application/json examples present', () => {
    const spec = {
      paths: {
        '/api/v1/foo': {
          post: {
            requestBody: {
              required: true,
              content: {
                'application/json': {},
              },
            },
          },
        },
      },
    }
    const ops = flattenSpec(spec)
    expect(ops[0].requestBodySample).toBeNull()
  })
})
