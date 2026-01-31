import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/connexion')

    // Check page elements
    await expect(page.getByRole('heading', { name: /Connexion/i })).toBeVisible()
    await expect(page.getByLabel(/Email/i)).toBeVisible()
    await expect(page.getByLabel(/Mot de passe/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Se connecter/i })).toBeVisible()
  })

  test('should display registration page', async ({ page }) => {
    await page.goto('/inscription')

    // Check page elements
    await expect(page.getByRole('heading', { name: /Créer un compte/i })).toBeVisible()
    await expect(page.getByLabel(/Prénom/i)).toBeVisible()
    await expect(page.getByLabel(/Nom/i)).toBeVisible()
    await expect(page.getByLabel(/Email/i)).toBeVisible()
  })

  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto('/connexion')

    // Click submit without filling form
    await page.getByRole('button', { name: /Se connecter/i }).click()

    // Form should require fields (HTML5 validation)
    const emailInput = page.getByLabel(/Email/i)
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.checkValidity())
    expect(isInvalid).toBe(true)
  })

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/connexion')

    const passwordInput = page.getByLabel(/Mot de passe/i)
    const toggleButton = page.getByRole('button', { name: '' }).filter({ has: page.locator('svg') })

    // Initially password type
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Click toggle
    await toggleButton.first().click()

    // Should now be text type
    await expect(passwordInput).toHaveAttribute('type', 'text')
  })

  test('should navigate between login and registration', async ({ page }) => {
    await page.goto('/connexion')

    // Click on "Créer un compte" link
    await page.getByRole('link', { name: /Créer un compte/i }).click()

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
    await page.getByRole('link', { name: /Mot de passe oublié/i }).click()

    // Should be on forgot password page
    await expect(page).toHaveURL(/\/mot-de-passe-oublie/)
    await expect(page.getByRole('heading', { name: /Mot de passe oublié/i })).toBeVisible()
  })

  test('should switch between user types', async ({ page }) => {
    await page.goto('/connexion')

    // Click on "Artisan" tab
    await page.getByRole('button', { name: 'Artisan' }).click()

    // Check link updates
    const registerLink = page.getByRole('link', { name: /Créer un compte/i })
    await expect(registerLink).toHaveAttribute('href', '/inscription-artisan')
  })
})

test.describe('Artisan Registration', () => {
  test('should display artisan registration form', async ({ page }) => {
    await page.goto('/inscription-artisan')

    // Check steps
    await expect(page.getByText('Entreprise')).toBeVisible()
    await expect(page.getByText('Services')).toBeVisible()
    await expect(page.getByText('Contact')).toBeVisible()
    await expect(page.getByText('Validation')).toBeVisible()
  })

  test('should validate company info step', async ({ page }) => {
    await page.goto('/inscription-artisan')

    // Fill company info
    await page.getByLabel(/Nom de l'entreprise/i).fill('Test Plomberie')
    await page.getByLabel(/SIRET/i).fill('12345678901234')

    // Proceed
    await page.getByRole('button', { name: /Continuer/i }).click()

    // Should be on step 2
    await expect(page.getByText(/métier principal/i)).toBeVisible()
  })
})
