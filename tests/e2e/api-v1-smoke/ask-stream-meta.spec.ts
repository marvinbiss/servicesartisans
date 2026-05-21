/**
 * /api/v1/ask/stream metadata smoke (Ralph 28).
 *
 * POST /api/v1/ask/stream is the SSE streaming AnswerEngine endpoint —
 * exercising it would hold a Vercel connection slot for the full
 * 10-30s latency budget AND burn Anthropic credits. Smoke pack only
 * checks :
 *
 *  - GET discovery metadata (200 + SSE response_format declared)
 *  - POST without valid body returns 400 invalid_body
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

test.describe('Ask stream endpoint metadata', () => {
  test.beforeAll(async () => {
    if (!SHOULD_RUN_SMOKE && !(await isServerReachable())) {
      test.skip(true, 'Set E2E_RUN_SMOKE=1 or run a server on BASE_URL')
    }
  })

  test('GET /api/v1/ask/stream returns discovery metadata with SSE response_format', async () => {
    const ctx = await newApiContext()
    try {
      const response = await ctx.get('/api/v1/ask/stream')
      expect(response.status()).toBe(200)

      const body = await response.json()
      if (!isObject(body)) throw new Error('expected JSON object')
      expect(body.endpoint).toBe('/api/v1/ask/stream')
      expect(body.method).toBe('POST')
      expect(body.response_format).toBe('text/event-stream')

      const headers = response.headers()
      expect(headers['x-license']).toBe('CC-BY-4.0')
    } finally {
      await ctx.dispose()
    }
  })

  test('POST /api/v1/ask/stream with malformed JSON returns 400 invalid_body', async () => {
    const ctx = await newApiContext()
    try {
      const { response, body } = await postRaw(
        ctx,
        '/api/v1/ask/stream',
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

  test('POST /api/v1/ask/stream with empty body returns 400 invalid_params', async () => {
    const ctx = await newApiContext()
    try {
      const { response, body } = await postJson(ctx, '/api/v1/ask/stream', {})
      expect(response.status()).toBe(400)
      if (!isObject(body)) throw new Error('expected JSON error object')
      expect(isObject(body.error)).toBe(true)
    } finally {
      await ctx.dispose()
    }
  })
})
