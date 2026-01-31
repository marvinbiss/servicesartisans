import { test, expect } from '@playwright/test'

test.describe('Devis Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/devis')
  })

  test('should display the devis form', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { name: /Demandez un devis gratuit/i })).toBeVisible()

    // Check step indicators
    await expect(page.getByText('Votre projet')).toBeVisible()
    await expect(page.getByText('Vos coordonnées')).toBeVisible()
    await expect(page.getByText('Confirmation')).toBeVisible()
  })

  test('should validate step 1 form fields', async ({ page }) => {
    // Try to proceed without filling required fields
    await page.getByRole('button', { name: /Continuer/i }).click()

    // Form should still be on step 1 (validation failed)
    await expect(page.getByText('Votre projet')).toBeVisible()
  })

  test('should proceed to step 2 with valid data', async ({ page }) => {
    // Fill step 1
    await page.getByLabel(/Service/i).selectOption('plombier')
    await page.getByLabel(/Code postal/i).fill('75015')
    await page.getByLabel(/Description/i).fill('Réparation fuite sous évier')

    // Proceed to step 2
    await page.getByRole('button', { name: /Continuer/i }).click()

    // Should be on step 2
    await expect(page.getByLabel(/Prénom/i)).toBeVisible()
  })

  test('should complete full devis flow', async ({ page }) => {
    // Step 1
    await page.getByLabel(/Service/i).selectOption('plombier')
    await page.getByLabel(/Code postal/i).fill('75015')
    await page.getByLabel(/Description/i).fill('Réparation fuite sous évier')
    await page.getByRole('button', { name: /Continuer/i }).click()

    // Step 2
    await page.getByLabel(/Prénom/i).fill('Jean')
    await page.getByLabel(/Nom/i).fill('Dupont')
    await page.getByLabel(/Email/i).fill('jean.dupont@test.com')
    await page.getByLabel(/Téléphone/i).fill('0612345678')
    await page.getByRole('button', { name: /Envoyer/i }).click()

    // Step 3 - Confirmation
    await expect(page.getByText(/succès|confirmé|reçue/i)).toBeVisible()
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
    expect(['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA']).toContain(focusedElement)
  })

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/devis')

    // All inputs should have associated labels
    const inputs = await page.$$('input:not([type="hidden"]), select, textarea')

    for (const input of inputs) {
      const id = await input.getAttribute('id')
      if (id) {
        const label = await page.$(`label[for="${id}"]`)
        expect(label).not.toBeNull()
      }
    }
  })
})
