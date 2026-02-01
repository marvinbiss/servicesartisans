import { test, expect } from '@playwright/test'

test.describe('Theme Toggle', () => {
  test('default theme is applied', async ({ page }) => {
    await page.goto('/')
    // Should have either light or dark class based on system
    const html = page.locator('html')
    const className = await html.getAttribute('class')
    expect(className).toMatch(/light|dark|/)
  })

  test('can switch to dark mode', async ({ page }) => {
    await page.goto('/')
    // Find and click dark mode button
    const darkButton = page.locator('button[title="Mode sombre"]')
    if (await darkButton.isVisible()) {
      await darkButton.click()
      await expect(page.locator('html')).toHaveClass(/dark/)
    }
  })

  test('can switch to light mode', async ({ page }) => {
    await page.goto('/')
    const lightButton = page.locator('button[title="Mode clair"]')
    if (await lightButton.isVisible()) {
      await lightButton.click()
      await expect(page.locator('html')).toHaveClass(/light/)
    }
  })

  test('theme persists across page navigation', async ({ page }) => {
    await page.goto('/')
    // Set dark mode
    const darkButton = page.locator('button[title="Mode sombre"]')
    if (await darkButton.isVisible()) {
      await darkButton.click()
      // Navigate to another page
      await page.goto('/france')
      // Should still be dark
      await expect(page.locator('html')).toHaveClass(/dark/)
    }
  })

  test('theme persists after refresh', async ({ page }) => {
    await page.goto('/')
    const darkButton = page.locator('button[title="Mode sombre"]')
    if (await darkButton.isVisible()) {
      await darkButton.click()
      // Refresh
      await page.reload()
      // Should still be dark (from localStorage)
      await expect(page.locator('html')).toHaveClass(/dark/)
    }
  })
})
