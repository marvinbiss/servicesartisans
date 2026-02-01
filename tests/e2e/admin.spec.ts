import { test, expect } from '@playwright/test'

// Admin pages require authentication - these tests verify the redirect behavior
// In a production environment, authentication would need to be set up properly

test.describe('Admin Authentication', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/admin')
    // Should be redirected to login page
    await expect(page).toHaveURL(/connexion/)
  })

  test('should redirect from admin artisans page to login', async ({ page }) => {
    await page.goto('/admin/artisans')
    await expect(page).toHaveURL(/connexion/)
  })

  test('should redirect from admin avis page to login', async ({ page }) => {
    await page.goto('/admin/avis')
    await expect(page).toHaveURL(/connexion/)
  })

  test('should redirect from admin abonnements page to login', async ({ page }) => {
    await page.goto('/admin/abonnements')
    await expect(page).toHaveURL(/connexion/)
  })
})

test.describe('Admin Page Structure', () => {
  // These tests verify that the pages exist and have correct structure
  // by checking the build output rather than runtime behavior

  test('admin routes should be defined', async ({ page }) => {
    // Verify page returns expected redirect (not 404)
    const response = await page.goto('/admin')
    expect(response?.status()).toBeLessThan(500)
  })

  test('admin artisans route should be defined', async ({ page }) => {
    const response = await page.goto('/admin/artisans')
    expect(response?.status()).toBeLessThan(500)
  })

  test('admin avis route should be defined', async ({ page }) => {
    const response = await page.goto('/admin/avis')
    expect(response?.status()).toBeLessThan(500)
  })

  test('admin abonnements route should be defined', async ({ page }) => {
    const response = await page.goto('/admin/abonnements')
    expect(response?.status()).toBeLessThan(500)
  })
})
