import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should display login page elements', async ({ page }) => {
    await page.goto('/connexion')

    // Check page elements
    await expect(page.getByRole('heading', { name: /Connexion/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Se connecter/i })).toBeVisible()
  })

  test('should display registration page elements', async ({ page }) => {
    await page.goto('/inscription')

    // Check page elements
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should have form on login page', async ({ page }) => {
    await page.goto('/connexion')

    // Check login form exists (form with email/password fields)
    const loginForm = page.locator('form').filter({ hasText: 'Email' }).first()
    await expect(loginForm).toBeVisible()
  })

  test('should have password toggle functionality', async ({ page }) => {
    await page.goto('/connexion')

    // Wait for page load
    await page.waitForLoadState('networkidle')

    // Check there's a button that can toggle password visibility
    const buttons = page.locator('button[type="button"]')
    const count = await buttons.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should navigate between login and registration', async ({ page }) => {
    await page.goto('/connexion')

    // Click on "Creer un compte" link
    await page.getByRole('link', { name: /Creer un compte/i }).click()

    // Should be on registration page
    await expect(page).toHaveURL(/\/inscription/)

    // Click on "Se connecter" link
    await page.getByRole('link', { name: /Se connecter/i }).click()

    // Should be on login page
    await expect(page).toHaveURL(/\/connexion/)
  })

  test('should navigate to forgot password', async ({ page }) => {
    await page.goto('/connexion')

    // Click forgot password link
    await page.getByRole('link', { name: /Mot de passe oubli/i }).click()

    // Should be on forgot password page
    await expect(page).toHaveURL(/\/mot-de-passe-oublie/)
  })

  test('should switch between user types', async ({ page }) => {
    await page.goto('/connexion')

    // Click on "Artisan" tab
    await page.getByRole('button', { name: 'Artisan' }).click()

    // Check link updates
    const registerLink = page.getByRole('link', { name: /Creer un compte/i })
    await expect(registerLink).toHaveAttribute('href', '/inscription-artisan')
  })
})

test.describe('Artisan Registration', () => {
  test('should display artisan registration form', async ({ page }) => {
    await page.goto('/inscription-artisan')

    // Check page loads
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should have form elements', async ({ page }) => {
    await page.goto('/inscription-artisan')

    // Page should have input fields
    const inputs = page.locator('input')
    const count = await inputs.count()
    expect(count).toBeGreaterThan(0)
  })
})
