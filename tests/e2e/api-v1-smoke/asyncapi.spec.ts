/**
 * AsyncAPI 3.0.0 spec endpoint smoke (Ralph 30).
 *
 * /api/v1/asyncapi/json and /yaml describe the four RGE-OS webhook
 * events (Ralph 24) for AsyncAPI Studio, EventCatalog, Postman events,
 * AsyncAPI Generator subscribers. The contract MUST be exposed as
 * `asyncapi: '3.0.0'` and carry the CC-BY-4.0 license header.
 */

import { expect, test } from '@playwright/test'

import { SHOULD_RUN_SMOKE, isObject, isServerReachable, newApiContext } from './fixtures'

test.describe('AsyncAPI 3.0.0 spec', () => {
  test.beforeAll(async () => {
    if (!SHOULD_RUN_SMOKE && !(await isServerReachable())) {
      test.skip(true, 'Set E2E_RUN_SMOKE=1 or run a server on BASE_URL')
    }
  })

  test('GET /api/v1/asyncapi/json returns 3.0.0 spec with channels', async () => {
    const ctx = await newApiContext()
    try {
      const response = await ctx.get('/api/v1/asyncapi/json')
      expect(response.status()).toBe(200)

      const headers = response.headers()
      expect(headers['content-type']).toContain('application/json')
      expect(headers['x-license']).toBe('CC-BY-4.0')
      expect(headers['access-control-allow-origin']).toBe('*')

      const body = await response.json()
      if (!isObject(body)) throw new Error('expected JSON object')
      expect(body.asyncapi).toBe('3.0.0')
      expect(isObject(body.info)).toBe(true)
    } finally {
      await ctx.dispose()
    }
  })

  test('GET /api/v1/asyncapi/yaml returns YAML body with comment header', async () => {
    const ctx = await newApiContext()
    try {
      const response = await ctx.get('/api/v1/asyncapi/yaml')
      expect(response.status()).toBe(200)

      const headers = response.headers()
      expect(headers['content-type']).toContain('yaml')
      expect(headers['x-license']).toBe('CC-BY-4.0')

      const text = await response.text()
      expect(text.startsWith('#')).toBe(true)
      expect(text).toContain('AsyncAPI 3.0.0 spec')
      expect(text).toContain('asyncapi: 3.0.0')
    } finally {
      await ctx.dispose()
    }
  })
})
