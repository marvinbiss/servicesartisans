/**
 * Tests — `_request-builder.ts` (Ralph 40).
 *
 * Covers every transformation that turns the form state into a `fetch()`
 * call: path param substitution, query encoding, header parsing, JSON
 * body validation, missing-required guard, base URL normalisation, and
 * the `buildCurl` rendering with single-quote escape.
 */
import { describe, it, expect } from 'vitest'
import { buildCurl, buildRequest } from '@/app/(public)/developpeurs/try/_request-builder'
import type { FormState, OpLite } from '@/app/(public)/developpeurs/try/_types'

function baseForm(overrides: Partial<FormState> = {}): FormState {
  return {
    opId: 'op',
    baseUrl: 'https://example.com',
    paramValues: {},
    bodyText: '',
    customHeaders: '',
    ...overrides,
  }
}

function op(overrides: Partial<OpLite> = {}): OpLite {
  return {
    id: 'op',
    method: 'GET',
    path: '/r',
    summary: '',
    tag: 'Misc',
    parameters: [],
    hasJsonBody: false,
    bodySample: '',
    ...overrides,
  }
}

describe('buildRequest', () => {
  it('builds a GET URL with no params', () => {
    const r = buildRequest(op(), baseForm())
    expect(r.error).toBeUndefined()
    expect(r.url).toBe('https://example.com/r')
    expect(r.headers).toMatchObject({ Accept: 'application/json' })
    expect(r.body).toBeNull()
  })

  it('substitutes path parameters with URL encoding', () => {
    const r = buildRequest(
      op({
        path: '/users/{id}',
        parameters: [{ name: 'id', in: 'path', required: true, type: 'string' }],
      }),
      baseForm({ paramValues: { id: 'al ice' } })
    )
    expect(r.url).toBe('https://example.com/users/al%20ice')
  })

  it('encodes query parameters', () => {
    const r = buildRequest(
      op({
        parameters: [{ name: 'q', in: 'query', required: false, type: 'string' }],
      }),
      baseForm({ paramValues: { q: 'PAC air/eau' } })
    )
    expect(r.url).toBe('https://example.com/r?q=PAC%20air%2Feau')
  })

  it('returns error when a required parameter is missing', () => {
    const r = buildRequest(
      op({ parameters: [{ name: 'id', in: 'path', required: true, type: 'string' }] }),
      baseForm({ paramValues: {} })
    )
    expect(r.error).toBe('Required parameter missing: id')
    expect(r.url).toBe('')
  })

  it('parses operation-defined header parameters', () => {
    const r = buildRequest(
      op({
        parameters: [{ name: 'X-API-Key', in: 'header', required: false, type: 'string' }],
      }),
      baseForm({ paramValues: { 'X-API-Key': 'abc' } })
    )
    expect(r.headers['X-API-Key']).toBe('abc')
  })

  it('parses free-form custom header lines (Name: Value)', () => {
    const r = buildRequest(
      op(),
      baseForm({ customHeaders: 'X-Trace-Id: 42\nX-Source: try-console' })
    )
    expect(r.headers['X-Trace-Id']).toBe('42')
    expect(r.headers['X-Source']).toBe('try-console')
  })

  it('errors on malformed header line (no colon)', () => {
    const r = buildRequest(op(), baseForm({ customHeaders: 'no-colon-line' }))
    expect(r.error).toMatch(/Invalid header line/)
  })

  it('validates JSON body and sets Content-Type', () => {
    const r = buildRequest(
      op({ method: 'POST', hasJsonBody: true }),
      baseForm({ bodyText: '{"a": 1}' })
    )
    expect(r.error).toBeUndefined()
    expect(r.headers['Content-Type']).toBe('application/json')
    expect(r.body).toBe('{"a": 1}')
  })

  it('errors when JSON body is malformed', () => {
    const r = buildRequest(
      op({ method: 'POST', hasJsonBody: true }),
      baseForm({ bodyText: '{not json' })
    )
    expect(r.error).toBe('Body is not valid JSON')
  })

  it('strips a trailing slash on baseUrl', () => {
    const r = buildRequest(op(), baseForm({ baseUrl: 'https://example.com/' }))
    expect(r.url).toBe('https://example.com/r')
  })
})

describe('buildCurl', () => {
  it('renders method, url and headers', () => {
    const r = buildRequest(op(), baseForm({ customHeaders: 'X-A: 1' }))
    const curl = buildCurl(r)
    expect(curl).toContain("curl -X GET 'https://example.com/r'")
    expect(curl).toContain("-H 'Accept: application/json'")
    expect(curl).toContain("-H 'X-A: 1'")
  })

  it("escapes single quotes in body via posix `\"'\\''\"` idiom", () => {
    const r = buildRequest(
      op({ method: 'POST', hasJsonBody: true }),
      baseForm({ bodyText: `{"q":"it's"}` })
    )
    const curl = buildCurl(r)
    expect(curl).toContain(`--data '{"q":"it'\\''s"}'`)
  })

  it('returns "" when the request carries an error', () => {
    const r = buildRequest(
      op({ parameters: [{ name: 'id', in: 'path', required: true, type: 'string' }] }),
      baseForm({})
    )
    expect(buildCurl(r)).toBe('')
  })
})
