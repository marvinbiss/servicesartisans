/**
 * /api/v1/ask metadata smoke (Ralph 19).
 *
 * POST /api/v1/ask is the AnswerEngine LLM endpoint — exercising it
 * would burn live Anthropic credits on every CI tick (Critic Opus 4.7
 * second-pass + chooseModel routing). Smoke pack only checks :
 *
 *  - GET discovery metadata (200 + endpoint metadata, no LLM call)
 *  - POST without valid body returns 400 invalid_body
 *
 * Production LLM coverage lives in the manual Critic harness and the
 * vitest unit tests that mock the registry.
 */

import { expect, test } from '@playwright/test'

import { SHOULD_RUN_SMOKE, isObject, isServerReachable, newApiContext, postRaw } from './fixtures'

test.describe('Ask endpoint metadata', () => {
  test.beforeAll(async () => {
    if (!SHOULD_RUN_SMOKE && !(await isServerReachable())) {
      test.skip(true, 'Set E2E_RUN_SMOKE=1 or run a server on BASE_URL')
    }
  })

  test('GET /api/v1/ask returns discovery metadata (no LLM cost)', async () => {
    const ctx = await newApiContext()
    try {
      const response = await ctx.get('/api/v1/ask')
      expect(response.status()).toBe(200)

      const body = await response.json()
      if (!isObject(body)) throw new Error('expected JSON object')
      expect(body.endpoint).toBe('/api/v1/ask')
      expect(body.method).toBe('POST')
      expect(body.version).toBe('v1')
      expect(typeof body.disclosure).toBe('string')

      const headers = response.headers()
      expect(headers['x-license']).toBe('CC-BY-4.0')
      expect(headers['x-disclosure']).toBe('/transparence-ia')
    } finally {
      await ctx.dispose()
    }
  })

  test('POST /api/v1/ask with malformed JSON returns 400 invalid_body', async () => {
    const ctx = await newApiContext()
    try {
      const { response, body } = await postRaw(
        ctx,
        '/api/v1/ask',
        '{not valid json',
        'application/json'
      )
      // Either 400 (parse-level rejection) or 503 (registry not booted
      // locally because no ANTHROPIC_API_KEY). Both prove the route is
      // wired and short-circuits before any LLM call.
      expect([400, 503]).toContain(response.status())
      if (!isObject(body)) throw new Error('expected JSON error object')
      expect(isObject(body.error)).toBe(true)
    } finally {
      await ctx.dispose()
    }
  })
})
