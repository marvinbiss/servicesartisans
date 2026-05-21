/**
 * Tests — scripts/_bruno-transformer.mjs
 *
 * Pure transformer : zero I/O. We assert the OpenAPI -> .bru mapping
 * stays predictable as `_spec.ts` grows.
 */

import { describe, it, expect } from 'vitest'
import {
  toBrunoCollection,
  sanitizeFileName,
  sanitizeDir,
  renderOp,
  buildUrl,
  paramPlaceholder,
  hasJsonRequestBody,
  extractJsonExample,
  inferFromSchema,
  buildEnvironment,
  buildCollectionMeta,
} from '../../scripts/_bruno-transformer.mjs'

const MINI_SPEC = {
  openapi: '3.1.0',
  paths: {
    '/api/v1/ping': {
      get: {
        tags: ['Health'],
        summary: 'Get ping',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/v1/echo': {
      post: {
        tags: ['Echo'],
        summary: 'Echo',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/EchoIn' },
              examples: { simple: { value: { msg: 'hi' } } },
            },
          },
        },
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/v1/search': {
      get: {
        tags: ['Search'],
        summary: 'Search',
        parameters: [
          {
            name: 'q',
            in: 'query',
            required: true,
            schema: { type: 'string', maxLength: 50 },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1 },
          },
        ],
        responses: { '200': { description: 'OK' } },
      },
    },
  },
  components: {
    schemas: {
      EchoIn: {
        type: 'object',
        required: ['msg'],
        properties: { msg: { type: 'string' } },
      },
    },
  },
}

describe('sanitizeFileName', () => {
  it('strips path separators and non-word symbols', () => {
    expect(sanitizeFileName('GET /api/v1/foo')).toBe('GET api v1 foo')
  })
  it('collapses whitespace', () => {
    expect(sanitizeFileName('foo    bar')).toBe('foo bar')
  })
  it('falls back to Request when input empty', () => {
    expect(sanitizeFileName('')).toBe('Request')
    expect(sanitizeFileName('   ')).toBe('Request')
  })
  it('caps length at 80 chars', () => {
    const long = 'a'.repeat(200)
    expect(sanitizeFileName(long).length).toBeLessThanOrEqual(80)
  })
})

describe('sanitizeDir', () => {
  it('replaces non-word chars with underscore', () => {
    expect(sanitizeDir('A & B / C')).toBe('A_B_C')
  })
  it('falls back to Misc', () => {
    expect(sanitizeDir('!!!')).toBe('Misc')
  })
})

describe('buildUrl', () => {
  it('returns base+path when no query params', () => {
    expect(buildUrl('{{base_url}}', '/api/x', [])).toBe('{{base_url}}/api/x')
  })
  it('appends ?a=&b= placeholders for query params', () => {
    const params = [
      { name: 'a', in: 'query' },
      { name: 'b', in: 'query' },
      { name: 'c', in: 'header' },
    ]
    expect(buildUrl('{{base_url}}', '/x', params)).toBe('{{base_url}}/x?a=&b=')
  })
})

describe('paramPlaceholder', () => {
  it('uses first enum value', () => {
    const p = { schema: { enum: ['a', 'b'] } }
    expect(paramPlaceholder(p)).toBe('a')
  })
  it('uses inline example', () => {
    const p = { example: 'hello' }
    expect(paramPlaceholder(p)).toBe('hello')
  })
  it('uses schema.example', () => {
    const p = { schema: { example: 42 } }
    expect(paramPlaceholder(p)).toBe('42')
  })
  it('returns 0 for integer', () => {
    expect(paramPlaceholder({ schema: { type: 'integer' } })).toBe('0')
  })
  it('returns true for boolean', () => {
    expect(paramPlaceholder({ schema: { type: 'boolean' } })).toBe('true')
  })
  it('resolves $ref enum via spec', () => {
    const spec = {
      components: {
        schemas: { Mode: { type: 'string', enum: ['x', 'y'] } },
      },
    }
    const p = { schema: { $ref: '#/components/schemas/Mode' } }
    expect(paramPlaceholder(p, spec)).toBe('x')
  })
})

describe('hasJsonRequestBody', () => {
  it('true when application/json content present', () => {
    expect(
      hasJsonRequestBody({
        requestBody: { content: { 'application/json': {} } },
      })
    ).toBe(true)
  })
  it('false when only sparql-query content', () => {
    expect(
      hasJsonRequestBody({
        requestBody: { content: { 'application/sparql-query': {} } },
      })
    ).toBe(false)
  })
  it('false when no requestBody', () => {
    expect(hasJsonRequestBody({})).toBe(false)
  })
})

describe('extractJsonExample', () => {
  it('uses content.example when present', () => {
    const op = {
      requestBody: {
        content: { 'application/json': { example: { a: 1 } } },
      },
    }
    expect(extractJsonExample(op, MINI_SPEC)).toEqual({ a: 1 })
  })
  it('falls back to first examples.value', () => {
    const op = {
      requestBody: {
        content: {
          'application/json': {
            examples: { e1: { value: { b: 2 } }, e2: { value: { b: 3 } } },
          },
        },
      },
    }
    expect(extractJsonExample(op, MINI_SPEC)).toEqual({ b: 2 })
  })
  it('infers from schema when no example', () => {
    const op = {
      requestBody: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/EchoIn' },
          },
        },
      },
    }
    expect(extractJsonExample(op, MINI_SPEC)).toEqual({ msg: 'string' })
  })
  it('returns {} when no content', () => {
    expect(extractJsonExample({}, MINI_SPEC)).toEqual({})
  })
})

describe('inferFromSchema', () => {
  it('returns scalar default for primitive types', () => {
    expect(inferFromSchema({ type: 'string' }, MINI_SPEC, new Set())).toBe('string')
    expect(inferFromSchema({ type: 'integer' }, MINI_SPEC, new Set())).toBe(0)
    expect(inferFromSchema({ type: 'boolean' }, MINI_SPEC, new Set())).toBe(true)
  })
  it('uses example when present', () => {
    const s = { type: 'string', example: 'foo' }
    expect(inferFromSchema(s, MINI_SPEC, new Set())).toBe('foo')
  })
  it('returns first enum value', () => {
    expect(inferFromSchema({ enum: ['a', 'b'] }, MINI_SPEC, new Set())).toBe('a')
  })
  it('survives $ref cycle without infinite loop', () => {
    const spec = {
      components: {
        schemas: {
          A: {
            type: 'object',
            properties: { b: { $ref: '#/components/schemas/B' } },
            required: ['b'],
          },
          B: {
            type: 'object',
            properties: { a: { $ref: '#/components/schemas/A' } },
            required: ['a'],
          },
        },
      },
    }
    const visited = new Set<string>()
    const result = inferFromSchema({ $ref: '#/components/schemas/A' }, spec, visited)
    expect(result).toBeDefined()
  })
  it('returns UUID placeholder for format=uuid', () => {
    expect(inferFromSchema({ type: 'string', format: 'uuid' }, MINI_SPEC, new Set())).toMatch(
      /^[0-9a-f-]+$/
    )
  })
})

describe('renderOp', () => {
  it('produces a Bruno block for GET no body', () => {
    const op = MINI_SPEC.paths['/api/v1/ping'].get
    const text = renderOp({
      method: 'get',
      path: '/api/v1/ping',
      op,
      baseUrl: '{{base_url}}',
      seq: 1,
      spec: MINI_SPEC,
    })
    expect(text).toContain('meta {')
    expect(text).toContain('name: Get ping')
    expect(text).toContain('seq: 1')
    expect(text).toContain('get {')
    expect(text).toContain('url: {{base_url}}/api/v1/ping')
    expect(text).toContain('body: none')
    expect(text).not.toContain('body:json')
  })
  it('produces a Bruno block for POST with JSON body', () => {
    const op = MINI_SPEC.paths['/api/v1/echo'].post
    const text = renderOp({
      method: 'post',
      path: '/api/v1/echo',
      op,
      baseUrl: '{{base_url}}',
      seq: 2,
      spec: MINI_SPEC,
    })
    expect(text).toContain('post {')
    expect(text).toContain('body: json')
    expect(text).toContain('Content-Type: application/json')
    expect(text).toContain('"msg": "hi"')
  })
  it('embeds query params block with placeholders + optional disabled', () => {
    const op = MINI_SPEC.paths['/api/v1/search'].get
    const text = renderOp({
      method: 'get',
      path: '/api/v1/search',
      op,
      baseUrl: '{{base_url}}',
      seq: 3,
      spec: MINI_SPEC,
    })
    expect(text).toContain('params:query {')
    expect(text).toContain('  q: ')
    expect(text).toContain('  ~limit: 0')
  })
})

describe('toBrunoCollection', () => {
  it('throws when spec missing', () => {
    expect(() => toBrunoCollection(null as unknown as object)).toThrow()
  })
  it('groups operations by tag', () => {
    const files = toBrunoCollection(MINI_SPEC) as Map<string, string>
    const paths = Array.from(files.keys())
    expect(paths).toContain('collection/Health/Get ping.bru')
    expect(paths).toContain('collection/Echo/Echo.bru')
    expect(paths).toContain('collection/Search/Search.bru')
  })
  it('honours custom baseUrl', () => {
    const files = toBrunoCollection(MINI_SPEC, {
      baseUrl: 'http://localhost:3099',
    }) as Map<string, string>
    const text = files.get('collection/Health/Get ping.bru')
    expect(text).toContain('url: http://localhost:3099/api/v1/ping')
  })
  it('defaults missing tags to Misc', () => {
    const spec = {
      openapi: '3.1.0',
      paths: {
        '/x': { get: { summary: 'X', responses: { '200': { description: 'OK' } } } },
      },
    }
    const files = toBrunoCollection(spec) as Map<string, string>
    expect(Array.from(files.keys())[0]).toBe('collection/Misc/X.bru')
  })
})

describe('buildEnvironment', () => {
  it('emits a vars block with base_url', () => {
    const text = buildEnvironment('Production', 'https://servicesartisans.fr')
    expect(text).toContain('vars {')
    expect(text).toContain('base_url: https://servicesartisans.fr')
    expect(text).toContain('}')
  })
})

describe('buildCollectionMeta', () => {
  it('emits valid Bruno JSON metadata', () => {
    const parsed = JSON.parse(buildCollectionMeta())
    expect(parsed).toMatchObject({
      version: '1',
      type: 'collection',
      name: 'ServicesArtisans RGE-OS',
    })
    expect(parsed.ignore).toContain('node_modules')
  })
})
