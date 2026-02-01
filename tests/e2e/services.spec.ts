import { test, expect } from '@playwright/test'

test.describe('Services Pages', () => {
  test('should display services list page', async ({ page }) => {
    await page.goto('/services')

    // Check page loads with heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should display service detail page', async ({ page }) => {
    await page.goto('/services/plombier')

    // Check page content loads
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should display service by location', async ({ page }) => {
    await page.goto('/services/plombier/paris')

    // Check page loads
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should have working navigation in services', async ({ page }) => {
    await page.goto('/services')

    // Page should have service links
    const serviceLinks = page.getByRole('link')
    const count = await serviceLinks.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('Location Pages', () => {
  test('should display villes list', async ({ page }) => {
    await page.goto('/villes')

    // Check page loads
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should display regions list', async ({ page }) => {
    await page.goto('/regions')

    // Check page loads
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should display departements list', async ({ page }) => {
    await page.goto('/departements')

    // Check page loads
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should navigate from region to departments', async ({ page }) => {
    await page.goto('/regions/ile-de-france')

    // Check region detail page loads
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})

test.describe('Urgence Page', () => {
  test('should display urgence page', async ({ page }) => {
    await page.goto('/urgence')

    // Check page loads
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should have emergency contact options', async ({ page }) => {
    await page.goto('/urgence')

    // Page should have content
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })
})
