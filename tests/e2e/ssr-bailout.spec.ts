import { expect, test } from '@playwright/test'

const GOOGLEBOT_UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? process.env.BASE_URL ?? 'http://localhost:3000'

const TESTIMONY_URLS = [
  '/',
  '/services/plombier/paris',
  '/services/electricien/lyon',
  '/services/chauffagiste/marseille',
  '/guides/maprimerenov-2026',
  '/artisans-rge/paris',
  '/simulateur-aides-renovation',
  '/urgence/plombier/paris',
  '/artisans',
  '/blog',
] as const

const MIN_BODY_CHARS = 10_000
const MIN_INTERNAL_LINKS = 20

function countInternalLinks(html: string): number {
  const matches = html.match(/<a\s[^>]*href=["']\/[^"']*["']/gi)
  return matches ? matches.length : 0
}

function countH1(html: string): number {
  const matches = html.match(/<h1\b[^>]*>/gi)
  return matches ? matches.length : 0
}

test.describe('SSR bailout regression guard', () => {
  for (const path of TESTIMONY_URLS) {
    test(`SSR payload is intact for Googlebot on ${path}`, async ({ request }) => {
      const url = `${BASE_URL}${path}`
      const response = await request.get(url, {
        headers: {
          'User-Agent': GOOGLEBOT_UA,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        },
        maxRedirects: 5,
      })

      expect(
        response.status(),
        `HTTP status should be 200 for ${path} (got ${response.status()})`
      ).toBe(200)

      const html = await response.text()

      expect(
        html.length,
        `SSR HTML body should be >= ${MIN_BODY_CHARS} chars for ${path} (got ${html.length})`
      ).toBeGreaterThanOrEqual(MIN_BODY_CHARS)

      expect(
        countH1(html),
        `At least one <h1> must be present in SSR HTML for ${path}`
      ).toBeGreaterThanOrEqual(1)

      // Next.js 14 emits <template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING">
      // markers for every dynamic({ssr:false}) component (trackers, maps,
      // consent banners — all legitimate). The real regression we guard against
      // is "whole app shell bailed out to CSR" which manifests as H1=0 + LINKS=0
      // (already asserted above). We keep a generous upper bound to catch
      // anomalies without breaking on legitimate client-only widgets.
      const bailoutCount = (html.match(/BAILOUT_TO_CLIENT_SIDE_RENDERING/g) ?? []).length
      expect(
        bailoutCount,
        `SSR HTML for ${path} has too many CSR bailouts (${bailoutCount}). A legitimate count is 5-25; above 40 suggests a new wrapper regression.`
      ).toBeLessThanOrEqual(40)

      expect(
        countInternalLinks(html),
        `SSR HTML for ${path} should expose >= ${MIN_INTERNAL_LINKS} internal <a href="/..."> links (Header + Footer present)`
      ).toBeGreaterThanOrEqual(MIN_INTERNAL_LINKS)
    })
  }
})
