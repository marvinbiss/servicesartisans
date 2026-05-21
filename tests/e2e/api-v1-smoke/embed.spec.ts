/**
 * Embed widget smoke (Ralph 21).
 *
 * /embed/rge                      — iframe HTML document hosting the widget
 * /embed/rge-v1.js                — static JS loader (CDN)
 * /api/v1/embed/rge-snippet       — dynamic mirror of the static loader
 *
 * Smoke targets : page reachable, JS served as application/javascript,
 * "Trouver un artisan" CTA visible in the HTML.
 */

import { expect, test } from '@playwright/test'

import { SHOULD_RUN_SMOKE, isServerReachable, newApiContext } from './fixtures'

test.describe('Embed RGE widget', () => {
  test.beforeAll(async () => {
    if (!SHOULD_RUN_SMOKE && !(await isServerReachable())) {
      test.skip(true, 'Set E2E_RUN_SMOKE=1 or run a server on BASE_URL')
    }
  })

  test('GET /embed/rge returns HTML with "Trouver un artisan RGE" CTA', async () => {
    const ctx = await newApiContext()
    try {
      const response = await ctx.get('/embed/rge')
      expect(response.status()).toBe(200)

      const headers = response.headers()
      expect(headers['content-type']).toContain('text/html')

      const html = await response.text()
      expect(html).toContain('Trouver un artisan RGE')
      expect(html).toContain('ServicesArtisans')
    } finally {
      await ctx.dispose()
    }
  })

  test('GET /embed/rge-v1.js returns JavaScript content', async () => {
    const ctx = await newApiContext()
    try {
      const response = await ctx.get('/embed/rge-v1.js')
      expect(response.status()).toBe(200)

      const headers = response.headers()
      expect(headers['content-type']).toMatch(/javascript|text\/plain/)

      const body = await response.text()
      expect(body.length).toBeGreaterThan(0)
    } finally {
      await ctx.dispose()
    }
  })

  test('GET /api/v1/embed/rge-snippet returns JavaScript with CC-BY-4.0 header', async () => {
    const ctx = await newApiContext()
    try {
      const response = await ctx.get('/api/v1/embed/rge-snippet')
      expect(response.status()).toBe(200)

      const headers = response.headers()
      expect(headers['content-type']).toContain('javascript')
      expect(headers['x-license']).toBe('CC-BY-4.0')
      expect(headers['access-control-allow-origin']).toBe('*')

      const body = await response.text()
      expect(typeof body).toBe('string')
    } finally {
      await ctx.dispose()
    }
  })
})
