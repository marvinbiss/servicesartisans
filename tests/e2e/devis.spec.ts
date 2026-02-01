import { test, expect } from '@playwright/test'

test.describe('Devis Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/devis')
  })

  test('should display the devis form', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should validate step 1 form fields', async ({ page }) => {
    // Try to proceed without selecting a service
    const continueBtn = page.getByRole('button', { name: /Continuer/i })

    // Button should be disabled when no service selected
    await expect(continueBtn).toBeDisabled()
  })

  test('should proceed to step 2 with valid data', async ({ page }) => {
    // Step 1: Select a service by clicking the button
    await page.getByRole('button', { name: 'Plombier' }).click()

    // Proceed to step 2
    await page.getByRole('button', { name: /Continuer/i }).click()

    // Should be on step 2 - check for specific heading
    await expect(page.getByRole('heading', { name: 'Décrivez votre projet' })).toBeVisible()
  })

  test('should complete multi-step flow', async ({ page }) => {
    // Step 1: Select service
    await page.getByRole('button', { name: 'Plombier' }).click()
    await page.getByRole('button', { name: /Continuer/i }).click()

    // Step 2: Fill project details
    await page.getByRole('button', { name: /Urgent/i }).click()
    await page.locator('textarea').fill('Réparation fuite sous évier')
    await page.locator('input[placeholder="75001"]').fill('75015')
    await page.locator('input[placeholder="Paris"]').fill('Paris')
    await page.getByRole('button', { name: /Continuer/i }).click()

    // Step 3: Contact form should be visible
    await expect(page.getByRole('heading', { name: /coordonn/i })).toBeVisible()
  })
})

test.describe('Devis Page - Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/devis')

    // Tab through form elements
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Should be able to interact with keyboard
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA', 'A']).toContain(focusedElement)
  })

  test('should have proper form structure', async ({ page }) => {
    await page.goto('/devis')

    // Check that service buttons are visible
    const serviceButtons = page.getByRole('button', { name: /Plombier|Électricien|Serrurier/i })
    await expect(serviceButtons.first()).toBeVisible()
  })
})
