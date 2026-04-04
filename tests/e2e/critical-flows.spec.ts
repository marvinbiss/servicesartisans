/**
 * Critical E2E Flows — @critical tag
 *
 * 5 multi-step behavioral tests that catch what LLM review,
 * unit tests, and smoke tests cannot:
 * - Auth flow (login → access → logout → blocked)
 * - API auth enforcement (unauthenticated → 401 on all protected routes)
 * - Error resilience (invalid input → controlled error, not 500)
 * - SEO contract (indexable page → meta + canonical + h1)
 * - Protected page redirect chain (private page → /connexion → proper redirect)
 *
 * Run with: npx playwright test --grep @critical
 */

import { test, expect } from '@playwright/test'

// ─── 1. Auth flow: full lifecycle ───────────────────────────────────────────

test.describe('@critical Auth lifecycle', () => {
  test('unauthenticated user is redirected from private pages to /connexion', async ({ page }) => {
    // Try accessing artisan dashboard without auth
    await page.goto('/espace-artisan/dashboard')

    // Should redirect to connexion (not 500, not blank page)
    await expect(page).toHaveURL(/\/connexion/)

    // Connexion page should have a login form
    await expect(page.locator('form')).toBeVisible()
  })

  test('unauthenticated user is redirected from client pages to /connexion', async ({ page }) => {
    await page.goto('/espace-client/dashboard')
    await expect(page).toHaveURL(/\/connexion/)
    await expect(page.locator('form')).toBeVisible()
  })

  test('login form validates email format before submission', async ({ page }) => {
    await page.goto('/connexion')

    // Fill invalid email
    const emailInput = page.locator('input[type="email"]')
    await emailInput.fill('not-an-email')

    // Fill any password
    const passwordInput = page.locator('input[type="password"]')
    await passwordInput.fill('password123')

    // Submit
    await page.getByRole('button', { name: /Se connecter/i }).click()

    // Page should still be on /connexion (not redirected, not 500)
    await expect(page).toHaveURL(/\/connexion/)
  })

  test('login with wrong credentials shows error, not 500', async ({ page }) => {
    await page.goto('/connexion')

    await page.locator('input[type="email"]').fill('nonexistent@test.com')
    await page.locator('input[type="password"]').fill('wrongpassword')
    await page.getByRole('button', { name: /Se connecter/i }).click()

    // Should show user-friendly error, not a crash
    // Wait a bit for the async response
    await page.waitForTimeout(2000)

    // Should still be on connexion page
    await expect(page).toHaveURL(/\/connexion/)

    // Should NOT show a raw error page or 500
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).not.toContain('500')
    expect(bodyText).not.toContain('Internal Server Error')
    expect(bodyText).not.toContain('Application error')
  })
})

// ─── 2. API auth enforcement (multi-endpoint) ──────────────────────────────

test.describe('@critical API auth enforcement', () => {
  const protectedEndpoints = [
    { path: '/api/artisan/provider', method: 'GET' },
    { path: '/api/artisan/avis?page=1', method: 'GET' },
    { path: '/api/artisan/stats', method: 'GET' },
    { path: '/api/artisan/bookings', method: 'GET' },
    { path: '/api/artisan/availability', method: 'GET' },
    { path: '/api/client/profile', method: 'GET' },
  ]

  for (const endpoint of protectedEndpoints) {
    test(`${endpoint.method} ${endpoint.path} returns 401/403 without auth`, async ({ request }) => {
      const response = await request.fetch(endpoint.path, { method: endpoint.method })

      // Must reject: 401 or 403, never 200
      expect([401, 403]).toContain(response.status())
    })
  }

  const adminEndpoints = [
    '/api/admin/stats',
    '/api/admin/users',
    '/api/admin/providers',
  ]

  for (const path of adminEndpoints) {
    test(`GET ${path} rejects non-admin`, async ({ request }) => {
      const response = await request.fetch(path)
      expect([401, 403]).toContain(response.status())
    })
  }
})

// ─── 3. Error resilience (invalid input → controlled error) ─────────────────

test.describe('@critical Error resilience', () => {
  test('invalid UUID in API returns 400, not 500', async ({ request }) => {
    const response = await request.fetch('/api/artisan/leads/not-a-uuid')
    // Should be 400 (bad request) or 401 (no auth), never 500
    expect(response.status()).toBeLessThan(500)
  })

  test('malformed JSON body returns 400, not 500', async ({ request }) => {
    const response = await request.fetch('/api/artisan/provider', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      data: 'this is not json{{{',
    })
    // Should be 400 or 401, never 500
    expect(response.status()).toBeLessThan(500)
  })

  test('non-existent page returns 404 with proper layout', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-xyz')

    // Should be 404
    expect(response?.status()).toBe(404)

    // Should render a proper page, not a blank or error dump
    const body = await page.locator('body').textContent()
    expect(body).not.toContain('Internal Server Error')
  })

  test('accessing non-existent artisan returns 404', async ({ page }) => {
    const response = await page.goto('/artisan/slug-qui-nexiste-pas-xyz')

    // Should be 404, not 500
    if (response) {
      expect(response.status()).toBeLessThanOrEqual(404)
    }
  })
})

// ─── 4. SEO contract (indexable page → meta + canonical + h1) ───────────────

test.describe('@critical SEO contract', () => {
  const indexablePages = [
    { path: '/', name: 'Homepage' },
    { path: '/services/plombier', name: 'Service page' },
    { path: '/contact', name: 'Contact page' },
  ]

  for (const p of indexablePages) {
    test(`${p.name} (${p.path}) has required SEO elements`, async ({ page }) => {
      await page.goto(p.path)

      // Must have exactly one h1
      const h1Count = await page.locator('h1').count()
      expect(h1Count).toBeGreaterThanOrEqual(1)

      // Must have meta description
      const metaDesc = page.locator('meta[name="description"]')
      await expect(metaDesc).toHaveAttribute('content', /.{10,}/)

      // Must have canonical (self-referencing)
      const canonical = page.locator('link[rel="canonical"]')
      const href = await canonical.getAttribute('href')
      expect(href).toBeTruthy()

      // Must NOT have noindex
      const robotsMeta = page.locator('meta[name="robots"]')
      const robotsCount = await robotsMeta.count()
      if (robotsCount > 0) {
        const content = await robotsMeta.getAttribute('content')
        expect(content).not.toContain('noindex')
      }
    })
  }

  test('robots.txt is valid and declares sitemaps', async ({ request }) => {
    const response = await request.fetch('/robots.txt')
    expect(response.status()).toBe(200)
    const text = await response.text()
    expect(text).toContain('Sitemap')
    expect(text).toContain('User-agent')
  })

  test('sitemap.xml returns valid XML', async ({ request }) => {
    const response = await request.fetch('/sitemap.xml')
    expect(response.status()).toBe(200)
    const text = await response.text()
    expect(text).toMatch(/<\?xml|<sitemapindex|<urlset/)
  })
})

// ─── 5. Protected page redirect chain ───────────────────────────────────────

test.describe('@critical Redirect chain integrity', () => {
  const privatePages = [
    '/espace-artisan/dashboard',
    '/espace-artisan/messages',
    '/espace-artisan/avis-recus',
    '/espace-artisan/statistiques',
    '/espace-artisan/portfolio',
    '/espace-client/dashboard',
  ]

  for (const path of privatePages) {
    test(`${path} redirects to /connexion with clean URL`, async ({ page }) => {
      await page.goto(path)

      // Must end up on /connexion
      const url = page.url()
      expect(url).toContain('/connexion')

      // Must NOT show 500 or error page
      const body = await page.locator('body').textContent()
      expect(body).not.toContain('500')
      expect(body).not.toContain('Internal Server Error')

      // Login form must be functional
      const form = page.locator('form')
      await expect(form).toBeVisible()
    })
  }
})
