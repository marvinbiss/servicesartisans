import { test, expect } from '@playwright/test'

test.describe('Services Pages', () => {
  test('should display services list page', async ({ page }) => {
    await page.goto('/services')

    // Check page title
    await expect(page.getByRole('heading', { name: /Tous nos services/i })).toBeVisible()

    // Check service categories are displayed
    await expect(page.getByText('Plomberie')).toBeVisible()
    await expect(page.getByText('Électricité')).toBeVisible()
  })

  test('should display service detail page', async ({ page }) => {
    await page.goto('/services/plombier')

    // Check page content
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/plombier/i)

    // Check CTA buttons
    await expect(page.getByRole('link', { name: /devis/i })).toBeVisible()
  })

  test('should display service by location', async ({ page }) => {
    await page.goto('/services/plombier/paris')

    // Check location is mentioned
    await expect(page.getByText(/Paris/i)).toBeVisible()

    // Check for artisan listings or CTA
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should have working navigation in services', async ({ page }) => {
    await page.goto('/services')

    // Click on a service
    await page.getByRole('link', { name: /Plombier/i }).first().click()

    // Should navigate to service page
    await expect(page).toHaveURL(/\/services\/plombier/)
  })
})

test.describe('Location Pages', () => {
  test('should display villes list', async ({ page }) => {
    await page.goto('/villes')

    // Check page title
    await expect(page.getByRole('heading', { name: /villes/i })).toBeVisible()

    // Check major cities
    await expect(page.getByText('Paris')).toBeVisible()
    await expect(page.getByText('Lyon')).toBeVisible()
    await expect(page.getByText('Marseille')).toBeVisible()
  })

  test('should display regions list', async ({ page }) => {
    await page.goto('/regions')

    // Check regions
    await expect(page.getByText('Île-de-France')).toBeVisible()
    await expect(page.getByText('Auvergne-Rhône-Alpes')).toBeVisible()
  })

  test('should display departements list', async ({ page }) => {
    await page.goto('/departements')

    // Check some departments
    await expect(page.getByText(/Paris/)).toBeVisible()
    await expect(page.getByText(/Rhône/)).toBeVisible()
  })

  test('should navigate from region to departments', async ({ page }) => {
    await page.goto('/regions/ile-de-france')

    // Check region detail page
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Île-de-France/i)

    // Should show departments
    await expect(page.getByText(/Paris|Seine/i)).toBeVisible()
  })
})

test.describe('Urgence Page', () => {
  test('should display urgence page', async ({ page }) => {
    await page.goto('/urgence')

    // Check emergency content
    await expect(page.getByRole('heading', { name: /urgence/i })).toBeVisible()
    await expect(page.getByText(/24h\/24/i)).toBeVisible()

    // Check emergency services
    await expect(page.getByText(/Plombier urgence/i)).toBeVisible()
    await expect(page.getByText(/Serrurier urgence/i)).toBeVisible()
  })

  test('should have emergency call buttons', async ({ page }) => {
    await page.goto('/urgence')

    // Check for call buttons
    const callButtons = page.getByRole('button', { name: /Appeler/i })
    await expect(callButtons.first()).toBeVisible()
  })
})
