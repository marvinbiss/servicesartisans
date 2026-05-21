/**
 * Webhooks endpoints body-validation smoke (Ralph 24).
 *
 * We deliberately do NOT exercise the happy path here :
 *  - subscribe writes a row in `rge_os_webhooks` (live DB side-effect)
 *  - test fires HTTP to an external URL (network side-effect + log row)
 *  - unsubscribe needs a real id+secret pair
 *
 * Smoke pack covers only the validation cliffs — every webhook
 * endpoint MUST reject malformed bodies with the documented HTTP
 * code and JSON error envelope. Authenticated end-to-end smoke is
 * tracked as v0.2 roadmap.
 */

import { expect, test } from '@playwright/test'

import {
  BASE_URL,
  SHOULD_RUN_SMOKE,
  isObject,
  isServerReachable,
  newApiContext,
  postJson,
  postRaw,
} from './fixtures'

test.describe('Webhooks — subscribe', () => {
  test.beforeAll(async () => {
    if (!SHOULD_RUN_SMOKE && !(await isServerReachable())) {
      test.skip(true, 'Set E2E_RUN_SMOKE=1 or run a server on BASE_URL')
    }
  })

  test('POST /api/v1/webhooks/subscribe with malformed JSON returns 400 invalid_body', async () => {
    const ctx = await newApiContext()
    try {
      const { response, body } = await postRaw(
        ctx,
        '/api/v1/webhooks/subscribe',
        '{not valid json',
        'application/json'
      )
      expect(response.status()).toBe(400)
      if (!isObject(body)) throw new Error('expected JSON error object')
      expect(isObject(body.error)).toBe(true)
      const err = body.error as Record<string, unknown>
      expect(err.code).toBe('invalid_body')
    } finally {
      await ctx.dispose()
    }
  })

  test('POST /api/v1/webhooks/subscribe with invalid URL returns 400 invalid_params', async () => {
    const ctx = await newApiContext()
    try {
      const { response, body } = await postJson(ctx, '/api/v1/webhooks/subscribe', {
        url: 'not-a-url',
        events: ['rge.qualification.updated'],
      })
      expect(response.status()).toBe(400)
      if (!isObject(body)) throw new Error('expected JSON error object')
      expect(isObject(body.error)).toBe(true)
      const err = body.error as Record<string, unknown>
      expect(err.code).toBe('invalid_params')
    } finally {
      await ctx.dispose()
    }
  })

  test('GET /api/v1/webhooks/subscribe returns discovery metadata', async () => {
    const ctx = await newApiContext()
    try {
      const response = await ctx.get('/api/v1/webhooks/subscribe')
      expect(response.status()).toBe(200)
      const body = await response.json()
      if (!isObject(body)) throw new Error('expected JSON object')
      expect(body.endpoint).toBe('/api/v1/webhooks/subscribe')
      expect(body.method).toBe('POST')
    } finally {
      await ctx.dispose()
    }
  })
})

test.describe('Webhooks — unsubscribe', () => {
  test.beforeAll(async () => {
    if (!SHOULD_RUN_SMOKE && !(await isServerReachable())) {
      test.skip(true, 'Set E2E_RUN_SMOKE=1 or run a server on BASE_URL')
    }
  })

  test('DELETE /api/v1/webhooks/unsubscribe without id+secret returns 400 invalid_params', async () => {
    const ctx = await newApiContext()
    try {
      const response = await ctx.fetch(`${BASE_URL}/api/v1/webhooks/unsubscribe`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        data: {},
      })
      expect(response.status()).toBe(400)
      const body = await response.json()
      if (!isObject(body)) throw new Error('expected JSON error object')
      expect(isObject(body.error)).toBe(true)
      const err = body.error as Record<string, unknown>
      expect(err.code).toBe('invalid_params')
    } finally {
      await ctx.dispose()
    }
  })
})

test.describe('Webhooks — list', () => {
  test.beforeAll(async () => {
    if (!SHOULD_RUN_SMOKE && !(await isServerReachable())) {
      test.skip(true, 'Set E2E_RUN_SMOKE=1 or run a server on BASE_URL')
    }
  })

  test('GET /api/v1/webhooks/list without Authorization returns 401 unauthorized', async () => {
    const ctx = await newApiContext()
    try {
      const response = await ctx.get('/api/v1/webhooks/list')
      expect(response.status()).toBe(401)

      const body = await response.json()
      if (!isObject(body)) throw new Error('expected JSON error object')
      expect(isObject(body.error)).toBe(true)
      const err = body.error as Record<string, unknown>
      expect(err.code).toBe('unauthorized')
    } finally {
      await ctx.dispose()
    }
  })

  test('GET /api/v1/webhooks/list with malformed Authorization returns 401', async () => {
    const ctx = await newApiContext()
    try {
      const response = await ctx.get('/api/v1/webhooks/list', {
        headers: { Authorization: 'NotBearer something' },
      })
      expect(response.status()).toBe(401)
    } finally {
      await ctx.dispose()
    }
  })
})

test.describe('Webhooks — test fire', () => {
  test.beforeAll(async () => {
    if (!SHOULD_RUN_SMOKE && !(await isServerReachable())) {
      test.skip(true, 'Set E2E_RUN_SMOKE=1 or run a server on BASE_URL')
    }
  })

  test('POST /api/v1/webhooks/test with malformed JSON returns 400 invalid_body', async () => {
    const ctx = await newApiContext()
    try {
      const { response, body } = await postRaw(
        ctx,
        '/api/v1/webhooks/test',
        '{not valid json',
        'application/json'
      )
      expect(response.status()).toBe(400)
      if (!isObject(body)) throw new Error('expected JSON error object')
      expect(isObject(body.error)).toBe(true)
    } finally {
      await ctx.dispose()
    }
  })

  test('POST /api/v1/webhooks/test with empty body returns 400 invalid_params', async () => {
    const ctx = await newApiContext()
    try {
      const { response, body } = await postJson(ctx, '/api/v1/webhooks/test', {})
      expect(response.status()).toBe(400)
      if (!isObject(body)) throw new Error('expected JSON error object')
      expect(isObject(body.error)).toBe(true)
      const err = body.error as Record<string, unknown>
      expect(err.code).toBe('invalid_params')
    } finally {
      await ctx.dispose()
    }
  })
})
