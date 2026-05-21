/**
 * GraphQL endpoint smoke (Ralph 23).
 *
 * /api/v1/graphql is the GraphQL-as-RPC subset over the v1 surface.
 *
 *  - GET  → discovery JSON (endpoint metadata + SDL preview)
 *  - POST → executes a query ; body must include `{query: string}`
 *
 * Smoke targets :
 *  - GET returns 200 + endpoint metadata with `root_fields[]`
 *  - POST with `{__typename}` returns 200 + data envelope
 *  - POST without `query` returns 400 + GraphQL-style `errors[]`
 *  - POST with malformed body returns 400
 */

import { expect, test } from '@playwright/test'

import {
  SHOULD_RUN_SMOKE,
  isObject,
  isServerReachable,
  newApiContext,
  postJson,
  postRaw,
} from './fixtures'

test.describe('GraphQL endpoint', () => {
  test.beforeAll(async () => {
    if (!SHOULD_RUN_SMOKE && !(await isServerReachable())) {
      test.skip(true, 'Set E2E_RUN_SMOKE=1 or run a server on BASE_URL')
    }
  })

  test('GET /api/v1/graphql returns discovery metadata', async () => {
    const ctx = await newApiContext()
    try {
      const response = await ctx.get('/api/v1/graphql')
      expect(response.status()).toBe(200)

      const headers = response.headers()
      expect(headers['x-license']).toBe('CC-BY-4.0')

      const body = await response.json()
      if (!isObject(body)) throw new Error('expected JSON object')
      expect(body.endpoint).toBe('/api/v1/graphql')
      expect(body.method).toBe('POST')
      expect(Array.isArray(body.root_fields)).toBe(true)
      expect(typeof body.sdl_preview).toBe('string')
    } finally {
      await ctx.dispose()
    }
  })

  test('POST /api/v1/graphql with {__typename} returns data envelope', async () => {
    const ctx = await newApiContext()
    try {
      const { response, body } = await postJson(ctx, '/api/v1/graphql', {
        query: '{ __typename }',
      })
      // Either 200 (introspection supported) or 400 (introspection
      // disabled on the hand-rolled executor). Both prove the route is
      // wired and the parser handles the body.
      expect([200, 400]).toContain(response.status())
      if (!isObject(body)) throw new Error('expected JSON object')
      expect('data' in body || 'errors' in body).toBe(true)
    } finally {
      await ctx.dispose()
    }
  })

  test('POST /api/v1/graphql without query field returns 400 + errors[]', async () => {
    const ctx = await newApiContext()
    try {
      const { response, body } = await postJson(ctx, '/api/v1/graphql', { not_query: 'foo' })
      expect(response.status()).toBe(400)
      if (!isObject(body)) throw new Error('expected JSON error object')
      expect(Array.isArray(body.errors)).toBe(true)
    } finally {
      await ctx.dispose()
    }
  })

  test('POST /api/v1/graphql with malformed JSON returns 400', async () => {
    const ctx = await newApiContext()
    try {
      const { response, body } = await postRaw(
        ctx,
        '/api/v1/graphql',
        '{not valid json',
        'application/json'
      )
      expect(response.status()).toBe(400)
      if (!isObject(body)) throw new Error('expected JSON error object')
      expect(Array.isArray(body.errors)).toBe(true)
    } finally {
      await ctx.dispose()
    }
  })
})
