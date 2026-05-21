/**
 * SPARQL endpoint + ontology smoke (Ralph 25).
 *
 * /api/v1/kg/sparql implements a SPARQL 1.1 subset (W3C Protocol):
 *   - GET  ?query=…
 *   - POST application/sparql-query   (raw body)
 *   - POST application/x-www-form-urlencoded (query=…)
 *
 * /api/v1/kg/ontology serves the SA-RGE OWL vocabulary :
 *   - default Accept → JSON-LD (`application/ld+json`)
 *   - Accept: text/turtle → Turtle
 *
 * Smoke targets here exercise the protocol surfaces, NOT the triple
 * store coverage (that lives in the unit test pack).
 */

import { expect, test } from '@playwright/test'

import {
  BASE_URL,
  SHOULD_RUN_SMOKE,
  isObject,
  isServerReachable,
  newApiContext,
  postRaw,
} from './fixtures'

test.describe('SPARQL endpoint', () => {
  test.beforeAll(async () => {
    if (!SHOULD_RUN_SMOKE && !(await isServerReachable())) {
      test.skip(true, 'Set E2E_RUN_SMOKE=1 or run a server on BASE_URL')
    }
  })

  test('GET /api/v1/kg/sparql?query=ASK{?s?p?o} returns 200', async () => {
    const ctx = await newApiContext()
    try {
      const response = await ctx.get('/api/v1/kg/sparql', {
        params: { query: 'ASK { ?s ?p ?o }' },
      })
      expect(response.status()).toBe(200)

      const headers = response.headers()
      expect(headers['x-license']).toBe('CC-BY-4.0')
    } finally {
      await ctx.dispose()
    }
  })

  test('POST /api/v1/kg/sparql with form-urlencoded body returns 200', async () => {
    const ctx = await newApiContext()
    try {
      const { response } = await postRaw(
        ctx,
        '/api/v1/kg/sparql',
        'query=' + encodeURIComponent('ASK { ?s ?p ?o }'),
        'application/x-www-form-urlencoded'
      )
      expect(response.status()).toBe(200)
    } finally {
      await ctx.dispose()
    }
  })

  test('POST /api/v1/kg/sparql without query returns 400 missing_query', async () => {
    const ctx = await newApiContext()
    try {
      const { response, body } = await postRaw(
        ctx,
        '/api/v1/kg/sparql',
        JSON.stringify({}),
        'application/json'
      )
      expect(response.status()).toBe(400)
      if (!isObject(body)) throw new Error('expected JSON error object')
      expect(isObject(body.error)).toBe(true)
      const err = body.error as Record<string, unknown>
      expect(err.code).toBe('missing_query')
    } finally {
      await ctx.dispose()
    }
  })
})

test.describe('SPARQL ontology endpoint', () => {
  test.beforeAll(async () => {
    if (!SHOULD_RUN_SMOKE && !(await isServerReachable())) {
      test.skip(true, 'Set E2E_RUN_SMOKE=1 or run a server on BASE_URL')
    }
  })

  test('GET /api/v1/kg/ontology default Accept returns JSON-LD', async () => {
    const ctx = await newApiContext()
    try {
      const response = await ctx.get('/api/v1/kg/ontology', {
        headers: { Accept: 'application/ld+json' },
      })
      expect(response.status()).toBe(200)

      const headers = response.headers()
      expect(headers['content-type']).toContain('application/ld+json')
      expect(headers['x-license']).toBe('CC-BY-4.0')

      const body = await response.json()
      if (!isObject(body)) throw new Error('expected JSON object')
      expect(isObject(body['@context'])).toBe(true)
      expect(Array.isArray(body['@graph'])).toBe(true)
    } finally {
      await ctx.dispose()
    }
  })

  test('GET /api/v1/kg/ontology with Accept: text/turtle returns Turtle', async () => {
    const ctx = await newApiContext()
    try {
      const response = await ctx.fetch(`${BASE_URL}/api/v1/kg/ontology`, {
        headers: { Accept: 'text/turtle' },
      })
      expect(response.status()).toBe(200)

      const headers = response.headers()
      expect(headers['content-type']).toContain('text/turtle')

      const text = await response.text()
      expect(text).toContain('@prefix sa:')
      expect(text).toContain('sa:RgeProvider')
    } finally {
      await ctx.dispose()
    }
  })
})
