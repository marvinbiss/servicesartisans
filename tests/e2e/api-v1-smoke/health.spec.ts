/**
 * Health endpoints smoke (Ralph 32).
 *
 * /api/v1/health  — shallow probe, MUST stay green as long as the
 *                   Vercel function is reachable (sub-ms). Status `ok`.
 * /api/v1/health  — HEAD form for load-balancer liveness.
 * /api/v1/health/deep — exercises Supabase + Upstash + LLM env keys.
 *                   May legitimately return 200 (ok/degraded) or 503
 *                   (fail); both are acceptable smoke results.
 */

import { expect, test } from '@playwright/test'

import { BASE_URL, SHOULD_RUN_SMOKE, isObject, isServerReachable, newApiContext } from './fixtures'

test.describe('Health endpoints', () => {
  test.beforeAll(async () => {
    if (!SHOULD_RUN_SMOKE && !(await isServerReachable())) {
      test.skip(true, 'Set E2E_RUN_SMOKE=1 or run a server on BASE_URL')
    }
  })

  test('GET /api/v1/health returns status=ok with version + timestamp', async () => {
    const ctx = await newApiContext()
    try {
      const response = await ctx.get('/api/v1/health')
      expect(response.status()).toBe(200)

      const body = await response.json()
      if (!isObject(body)) throw new Error('expected JSON object')
      expect(body.status).toBe('ok')
      expect(typeof body.version).toBe('string')
      expect(typeof body.timestamp).toBe('string')
      expect(isObject(body.build)).toBe(true)

      const headers = response.headers()
      expect(headers['cache-control']).toContain('no-store')
      expect(headers['x-license']).toBe('CC-BY-4.0')
    } finally {
      await ctx.dispose()
    }
  })

  test('HEAD /api/v1/health returns 200', async () => {
    const ctx = await newApiContext()
    try {
      const response = await ctx.fetch(`${BASE_URL}/api/v1/health`, { method: 'HEAD' })
      expect(response.status()).toBe(200)
    } finally {
      await ctx.dispose()
    }
  })

  test('GET /api/v1/health/deep returns 200/503 with status + checks[]', async () => {
    const ctx = await newApiContext()
    try {
      const response = await ctx.get('/api/v1/health/deep')
      // 200 = ok|degraded ; 503 = fail. Both are valid smoke outcomes
      // (depends on whether Supabase + Upstash env keys are wired locally).
      expect([200, 503]).toContain(response.status())

      const body = await response.json()
      if (!isObject(body)) throw new Error('expected JSON object')
      expect(['ok', 'degraded', 'fail']).toContain(body.status as string)
      expect(Array.isArray(body.checks)).toBe(true)
      expect(typeof body.timestamp).toBe('string')
    } finally {
      await ctx.dispose()
    }
  })
})
