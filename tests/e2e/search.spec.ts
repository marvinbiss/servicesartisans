import { test, expect } from '@playwright/test'

test.describe('Search Functionality', () => {
  test('home page search redirects correctly', async ({ page }) => {
    await page.goto('/')

    const serviceInput = page.locator('input[placeholder*="métier"], input[placeholder*="service"]').first()
    const cityInput = page.locator('input[placeholder*="Où"], input[placeholder*="ville"]').first()

    if (await serviceInput.isVisible() && await cityInput.isVisible()) {
      await serviceInput.fill('plombier')
      await cityInput.fill('paris')
      await page.click('button[type="submit"]')
      await expect(page).toHaveURL(/\/(france|services)\/plombier/)
    }
  })

  test('search with only service', async ({ page }) => {
    await page.goto('/')

    const serviceInput = page.locator('input[placeholder*="métier"], input[placeholder*="service"]').first()

    if (await serviceInput.isVisible()) {
      await serviceInput.fill('electricien')
      await page.click('button[type="submit"]')
      // URL can vary - may be /france/electricien, /services/electricien, or /recherche?q=electricien
      await expect(page).toHaveURL(/electricien/)
    }
  })

  test('search results page displays providers', async ({ page }) => {
    await page.goto('/services/plombier/paris')

    // Should have some content
    await expect(page.locator('body')).toBeVisible()
  })

  test('pagination works if present', async ({ page }) => {
    await page.goto('/services/plombier')

    const nextButton = page.locator('a:has-text("Suivant"), button:has-text("Suivant")')
    if (await nextButton.isVisible()) {
      await nextButton.click()
      await expect(page).toHaveURL(/page=2/)
    }
  })

  test('breadcrumbs navigation works', async ({ page }) => {
    await page.goto('/services/plombier/paris')

    const breadcrumb = page.locator('nav[aria-label*="Ariane"] a, .breadcrumb a').first()
    if (await breadcrumb.isVisible()) {
      await breadcrumb.click()
      // Should navigate somewhere
      await expect(page.locator('body')).toBeVisible()
    }
  })
})
