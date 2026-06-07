/**
 * E2E — Section « Dossiers CEE » gelée (2026-06-07).
 *
 * Les pages /espace-artisan/cee/** sont des stubs redirect vers
 * /espace-artisan (dashboard recentré métier). Le parcours d'origine
 * (liste + détail + upload) est restaurable depuis l'historique git.
 */

import { test, expect } from '@playwright/test'
import { mockArtisanAuth } from '../fixtures/cee-mocks'

test.describe('Dossiers CEE — gel', () => {
  test.beforeEach(async ({ page }) => {
    await mockArtisanAuth(page)
  })

  test('/espace-artisan/cee redirige vers le dashboard', async ({ page }) => {
    await page.goto('/espace-artisan/cee')
    await expect(page).toHaveURL(/\/espace-artisan(\?.*)?$/)
  })

  test('/espace-artisan/cee/nouveau redirige vers le dashboard', async ({ page }) => {
    await page.goto('/espace-artisan/cee/nouveau')
    await expect(page).toHaveURL(/\/espace-artisan(\?.*)?$/)
  })

  test("le détail d'un dossier redirige vers le dashboard", async ({ page }) => {
    await page.goto('/espace-artisan/cee/00000000-0000-4000-8000-000000000001')
    await expect(page).toHaveURL(/\/espace-artisan(\?.*)?$/)
  })
})
