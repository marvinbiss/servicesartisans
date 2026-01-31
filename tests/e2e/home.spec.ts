import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should display the homepage correctly', async ({ page }) => {
    await page.goto('/')

    // Check title
    await expect(page).toHaveTitle(/ServicesArtisans/)

    // Check header elements
    await expect(page.getByRole('link', { name: /ServicesArtisans/i })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Demander un devis' })).toBeVisible()

    // Check main content
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should navigate to services page', async ({ page }) => {
    await page.goto('/')

    // Click on services in header
    await page.getByRole('button', { name: 'Services' }).hover()

    // Wait for dropdown
    await expect(page.getByText('Tous nos services')).toBeVisible()

    // Click on a service
    await page.getByRole('link', { name: 'Plombier' }).first().click()

    // Verify navigation
    await expect(page).toHaveURL(/\/services\/plombier/)
  })

  test('should show search functionality', async ({ page }) => {
    await page.goto('/')

    // Find search input
    const searchInput = page.getByPlaceholder(/Rechercher/i)
    await expect(searchInput).toBeVisible()

    // Type in search
    await searchInput.fill('plombier')
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Mobile menu should be visible
    await expect(page.getByRole('button', { name: /menu/i })).toBeVisible()

    // Click mobile menu
    await page.getByRole('button', { name: /menu/i }).click()

    // Mobile navigation should be visible
    await expect(page.getByText('Services')).toBeVisible()
  })
})

test.describe('Footer', () => {
  test('should display all footer links', async ({ page }) => {
    await page.goto('/')

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Check footer sections
    await expect(page.getByRole('heading', { name: 'Services' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Localisation' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Informations' })).toBeVisible()

    // Check legal links
    await expect(page.getByRole('link', { name: 'Mentions légales' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Confidentialité' })).toBeVisible()
  })
})
