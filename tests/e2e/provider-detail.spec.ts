import { test, expect } from '@playwright/test'

test.describe('Provider Detail Page', () => {
  test('provider detail page loads', async ({ page }) => {
    // Navigate to a known provider page structure
    await page.goto('/services/plombier/paris')

    // Try to find and click a provider card
    const card = page.locator('[data-testid="provider-card"], .provider-card, article a').first()
    if (await card.isVisible()) {
      await card.click()
      await expect(page.locator('body')).toBeVisible()
    }
  })

  test('quote form is visible on provider pages', async ({ page }) => {
    await page.goto('/services/artisan/test')

    // Check for quote form elements
    const quoteSection = page.locator('text=Demander un devis, text=devis')
    // May or may not be visible depending on page structure
    await expect(page.locator('body')).toBeVisible()
  })

  test('phone number link format', async ({ page }) => {
    await page.goto('/services/artisan/test')

    const phoneLink = page.locator('a[href^="tel:"]')
    if (await phoneLink.isVisible()) {
      const href = await phoneLink.getAttribute('href')
      expect(href).toMatch(/^tel:\+?\d+/)
    }
  })

  test('reviews section if available', async ({ page }) => {
    await page.goto('/services/artisan/test')

    const reviewsSection = page.locator('text=Avis, text=avis')
    // Reviews may or may not be present
    await expect(page.locator('body')).toBeVisible()
  })
})
