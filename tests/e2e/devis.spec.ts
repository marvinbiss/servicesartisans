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
    const nextBtn = page.getByRole('button', { name: /Suivant/i })
    await nextBtn.click()

    // Should show validation error
    await expect(page.getByText('Veuillez choisir un service')).toBeVisible()
  })

  test('should proceed to step 2 with valid data', async ({ page }) => {
    // Step 1: Select a service from dropdown
    await page.locator('select#service').selectOption('plombier')

    // Type a city
    await page.locator('input#ville').fill('Paris')
    await page.getByText('Paris').first().click()

    // Proceed to step 2
    await page.getByRole('button', { name: /Suivant/i }).click()

    // Should be on step 2 - check for project details heading
    await expect(page.getByText('D\u00e9tails du projet')).toBeVisible()
  })

  test('should complete multi-step flow', async ({ page }) => {
    // Step 1: Select service and city
    await page.locator('select#service').selectOption('plombier')
    await page.locator('input#ville').fill('Paris')
    await page.getByText('Paris').first().click()
    await page.getByRole('button', { name: /Suivant/i }).click()

    // Step 2: Fill project details
    await page.locator('textarea').fill('R\u00e9paration fuite sous \u00e9vier de cuisine, urgent')
    await page.getByText('Urgent (sous 24h)').click()
    await page.getByText('500\u20112\u00a0000').click()
    await page.getByRole('button', { name: /Suivant/i }).click()

    // Step 3: Contact form should be visible
    await expect(page.getByText(/coordonn\u00e9es/i)).toBeVisible()
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

    // Check that service dropdown is visible
    await expect(page.locator('select#service')).toBeVisible()

    // Check that city input is visible
    await expect(page.locator('input#ville')).toBeVisible()
  })
})
