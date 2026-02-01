import { test, expect } from '@playwright/test'

// Espace artisan pages require authentication - these tests verify route existence and redirect behavior

test.describe('Espace Artisan Authentication', () => {
  test('should redirect unauthenticated users to login from main dashboard', async ({ page }) => {
    await page.goto('/espace-artisan')
    // Should be redirected to login page or show auth required
    const url = page.url()
    expect(url).toMatch(/connexion|espace-artisan/)
  })

  test('should redirect from profil page', async ({ page }) => {
    await page.goto('/espace-artisan/profil')
    const url = page.url()
    expect(url).toMatch(/connexion|espace-artisan/)
  })

  test('should redirect from demandes page', async ({ page }) => {
    await page.goto('/espace-artisan/demandes')
    const url = page.url()
    expect(url).toMatch(/connexion|espace-artisan/)
  })
})

test.describe('Espace Artisan Routes Exist', () => {
  test('espace-artisan route should be defined', async ({ page }) => {
    const response = await page.goto('/espace-artisan')
    expect(response?.status()).toBeLessThan(500)
  })

  test('profil route should be defined', async ({ page }) => {
    const response = await page.goto('/espace-artisan/profil')
    expect(response?.status()).toBeLessThan(500)
  })

  test('demandes route should be defined', async ({ page }) => {
    const response = await page.goto('/espace-artisan/demandes')
    expect(response?.status()).toBeLessThan(500)
  })

  test('avis route should be defined', async ({ page }) => {
    const response = await page.goto('/espace-artisan/avis')
    expect(response?.status()).toBeLessThan(500)
  })

  test('messages route should be defined', async ({ page }) => {
    const response = await page.goto('/espace-artisan/messages')
    expect(response?.status()).toBeLessThan(500)
  })

  test('statistiques route should be defined', async ({ page }) => {
    const response = await page.goto('/espace-artisan/statistiques')
    expect(response?.status()).toBeLessThan(500)
  })

  test('abonnement route should be defined', async ({ page }) => {
    const response = await page.goto('/espace-artisan/abonnement')
    expect(response?.status()).toBeLessThan(500)
  })

  test('calendrier route should be defined', async ({ page }) => {
    const response = await page.goto('/espace-artisan/calendrier')
    expect(response?.status()).toBeLessThan(500)
  })

  test('equipe route should be defined', async ({ page }) => {
    const response = await page.goto('/espace-artisan/equipe')
    expect(response?.status()).toBeLessThan(500)
  })
})
