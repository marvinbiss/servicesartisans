/**
 * E2E — Parcours client « prime CEE estimée » dans le tunnel devis.
 *
 * Couvre 2 cas :
 *   1. Service éligible CEE (chauffagiste, 75001) → la carte « prime CEE »
 *      s'affiche avec un montant formaté
 *   2. Service non éligible (serrurier) → la carte n'est pas rendue
 *
 * Mocks :
 *   - `POST /api/cee/estimate` intercepté via `page.route()` (pas de DB)
 *
 * État actuel (2026-04-11) : la carte `CeePrimeEstimateCard` est intégrée
 * dans `src/components/DevisForm.tsx` (~ligne 1001) et expose
 * `data-testid="cee-prime-card"`. Les tests sont actifs.
 */

import { test, expect } from '@playwright/test'
import {
  mockCeeEstimate,
  MOCK_CEE_ESTIMATE_ELIGIBLE,
  MOCK_CEE_ESTIMATE_NON_ELIGIBLE,
} from '../fixtures/cee-mocks'

test.describe('Tunnel devis — carte prime CEE', () => {
  test('service éligible : la carte prime CEE affiche un montant formaté', async ({ page }) => {
    await mockCeeEstimate(page, MOCK_CEE_ESTIMATE_ELIGIBLE)

    // `CeePrimeEstimateCard` est montée dans `DevisForm.tsx:~1001` et déclenche
    // POST /api/cee/estimate dès que serviceSlug + postalCode sont renseignés.
    await page.goto('/devis/chauffagiste/paris-75001')

    // La carte doit être visible avec le titre attendu.
    const primeCard = page.getByTestId('cee-prime-card')
    await expect(primeCard).toBeVisible()

    // Le composant affiche `max(euros_precarite_max)` via `getMaxPrime()` :
    // dans le mock `MOCK_CEE_ESTIMATE_ELIGIBLE`, c'est 4800 €, rendu en FR
    // sous la forme « 4 800 € » (fine espace insécable `\u202f` comme
    // séparateur de milliers + nbsp `\u00a0` avant le symbole €).
    await expect(primeCard).toContainText(/prime CEE/i)
    await expect(primeCard).toContainText(/4[\s\u202f\u00a0]?800[\s\u202f\u00a0]?€/)
    await expect(primeCard).toContainText(/€|euros?/i)
  })

  test('service non éligible : la carte prime CEE est cachée', async ({ page }) => {
    await mockCeeEstimate(page, MOCK_CEE_ESTIMATE_NON_ELIGIBLE)

    await page.goto('/devis/serrurier/paris-75001')

    // Aucun élément `cee-prime-card` ne doit exister (fail-open → return null).
    const primeCard = page.getByTestId('cee-prime-card')
    await expect(primeCard).toHaveCount(0)
  })
})
