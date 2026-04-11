/**
 * E2E — Parcours artisan « dossiers CEE » (liste + détail + upload).
 *
 * Couvre 2 cas :
 *   3. Liste : /espace-artisan/cee doit afficher au moins 1 dossier mocké
 *   4. Détail + upload : /espace-artisan/cee/[id] accepte un fichier et
 *      affiche un toast de succès
 *
 * Mocks :
 *   - Auth Supabase mockée (utilisateur artisan)
 *   - `GET /api/cee/dossiers` + `GET /api/cee/dossiers/:id` mockés
 *   - Fallback REST Supabase `/rest/v1/cee_dossiers*` également intercepté
 *   - Storage `/storage/v1/object/**` pour l'upload
 *
 * Pages couvertes :
 *   - `src/app/(private)/espace-artisan/cee/page.tsx` (liste)
 *   - `src/app/(private)/espace-artisan/cee/[dossierId]/page.tsx` (détail)
 *
 * NB : les pages artisan sont des Server Components qui appellent Supabase
 * côté serveur via `@/lib/supabase/server`. Les `page.route()` ne peuvent
 * intercepter que le trafic navigateur — le vrai fetch DB ne passe pas par
 * là. Ces tests restent donc dépendants d'un backend mocké par ailleurs
 * (run CI avec stub Supabase local) ou d'un compte de test.
 */

import { test, expect } from '@playwright/test'
import {
  mockArtisanAuth,
  mockArtisanCeeDossiers,
  mockCeeJustificatifUpload,
  MOCK_CEE_DOSSIER,
} from '../fixtures/cee-mocks'

test.describe('Espace artisan — dossiers CEE', () => {
  test.beforeEach(async ({ page }) => {
    await mockArtisanAuth(page)
    await mockArtisanCeeDossiers(page)
    await mockCeeJustificatifUpload(page)
  })

  test('la liste affiche au moins 1 dossier mocké', async ({ page }) => {
    await page.goto('/espace-artisan/cee')

    // Le titre de la page doit mentionner CEE / dossiers.
    await expect(page.getByRole('heading', { name: /Mes dossiers CEE/i })).toBeVisible()

    // La section liste doit être montée.
    await expect(page.getByTestId('cee-dossier-list-section')).toBeVisible()

    // Au moins un dossier mocké doit être rendu (on cible le code opération).
    await expect(page.getByText(MOCK_CEE_DOSSIER.operation_code).first()).toBeVisible()
  })

  test('détail + upload : un fichier uploadé déclenche un toast success', async ({ page }) => {
    await page.goto(`/espace-artisan/cee/${MOCK_CEE_DOSSIER.id}`)

    // Vérifier que la page détail est bien chargée (H1 contient le code opération).
    await expect(
      page.getByRole('heading', {
        name: new RegExp(MOCK_CEE_DOSSIER.operation_code, 'i'),
      })
    ).toBeVisible()

    // Sélectionner le type de pièce (le <select> est requis par le formulaire).
    const codeSelect = page.locator('#cee-just-code')
    await codeSelect.selectOption({ index: 0 })

    // Sélectionner le 1er input file visible et uploader un fichier fictif.
    const fileInput = page.locator('#cee-just-file')
    await fileInput.setInputFiles({
      name: 'facture.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 mock contents'),
    })

    // Soumettre le formulaire.
    await page.getByRole('button', { name: /Envoyer la pièce/i }).click()

    // Un toast de succès (role="status") doit apparaître.
    // On tolère plusieurs formulations françaises courantes.
    const toast = page
      .getByRole('status')
      .filter({ hasText: /(enregistré|téléchargé|succès|ajouté)/i })
      .first()
    await expect(toast).toBeVisible({ timeout: 10_000 })
  })
})
