/**
 * OpenAPI 3.1 spec endpoint smoke (Ralph 27).
 *
 * /api/v1/openapi/json and /yaml are the auto-import surfaces for
 * Postman, Insomnia, Bruno, ChatGPT plugin manifests, and any SDK
 * codegen tool (openapi-typescript, openapi-generator). A 5xx here or
 * a malformed payload breaks every downstream integration.
 */

import { expect, test } from '@playwright/test'

import { SHOULD_RUN_SMOKE, isObject, isServerReachable, newApiContext } from './fixtures'

test.describe('OpenAPI 3.1 spec', () => {
  test.beforeAll(async () => {
    if (!SHOULD_RUN_SMOKE && !(await isServerReachable())) {
      test.skip(true, 'Set E2E_RUN_SMOKE=1 or run a server on BASE_URL')
    }
  })

  test('GET /api/v1/openapi/json returns 3.1.0 spec with CC-BY-4.0 header', async () => {
    const ctx = await newApiContext()
    try {
      const response = await ctx.get('/api/v1/openapi/json')
      expect(response.status()).toBe(200)

      const headers = response.headers()
      expect(headers['content-type']).toContain('application/json')
      expect(headers['x-license']).toBe('CC-BY-4.0')
      expect(headers['access-control-allow-origin']).toBe('*')
      expect(headers['cache-control']).toContain('max-age=3600')

      const body = await response.json()
      if (!isObject(body)) throw new Error('expected JSON object')
      expect(body.openapi).toBe('3.1.0')
      expect(isObject(body.info)).toBe(true)
      expect(isObject(body.paths)).toBe(true)
    } finally {
      await ctx.dispose()
    }
  })

  test('GET /api/v1/openapi/yaml returns YAML body with comment header', async () => {
    const ctx = await newApiContext()
    try {
      const response = await ctx.get('/api/v1/openapi/yaml')
      expect(response.status()).toBe(200)

      const headers = response.headers()
      expect(headers['content-type']).toContain('yaml')
      expect(headers['x-license']).toBe('CC-BY-4.0')

      const text = await response.text()
      expect(text.startsWith('#')).toBe(true)
      expect(text).toContain('OpenAPI 3.1 spec')
      expect(text).toContain('openapi: 3.1.0')
    } finally {
      await ctx.dispose()
    }
  })
})
