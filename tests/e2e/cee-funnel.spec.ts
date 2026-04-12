/**
 * E2E — Funnel CEE complet : navigation, simulateur, CTAs, mobile flows.
 *
 * Couvre :
 *   1. Page /cee — charge avec « Certificats » + CeeCTA hero
 *   2. Simulateur /simulateur-prime-cee — sélection service, CP, estimation
 *   3. CeeCTA inline — href contient /devis et source=cee
 *   4. Sticky CTA mobile — apparaît après scroll 400px
 *   5. DevisBottomSheet mobile — s'ouvre au clic sur StickyMobileCTA
 *   6. Page opération CEE — /cee/bar-th-171 charge, CeeCTA inline visible
 *
 * Mocks :
 *   - `POST /api/cee/estimate` intercepté via `page.route()` (pas de DB)
 *
 * État actuel (2026-04-12) : CeeCTA expose 3 variants (inline, hero, sticky-bottom).
 * Le simulateur CeeSimulator est monté dans /simulateur-prime-cee.
 */

import { test, expect } from '@playwright/test'
import {
  mockCeeEstimate,
  MOCK_CEE_ESTIMATE_ELIGIBLE,
  MOCK_CEE_ESTIMATE_NON_ELIGIBLE,
} from '../fixtures/cee-mocks'

/* ================================================================== */
/*  1. Navigation — page /cee                                         */
/* ================================================================== */

test.describe('CEE Funnel — Navigation', () => {
  test('la page /cee charge et contient « Certificats » avec CeeCTA hero visible', async ({
    page,
  }) => {
    await page.goto('/cee', { waitUntil: 'domcontentloaded', timeout: 30_000 })

    // Le titre ou le contenu doit mentionner les certificats
    await expect(page.locator('body')).toContainText(/Certificats/i)

    // Le CeeCTA hero est un <section> avec le gradient emerald et le texte
    // « Estimez votre prime CEE gratuitement »
    const heroCta = page.locator('section:has(h2:text-is("Estimez votre prime CEE gratuitement"))')
    await expect(heroCta).toBeVisible({ timeout: 10_000 })

    // Le lien CTA hero pointe vers /devis avec source=cee
    const heroLink = heroCta.locator('a[href*="/devis"]')
    await expect(heroLink).toBeVisible()
    await expect(heroLink).toHaveAttribute('href', /source=cee/)
  })
})

/* ================================================================== */
/*  2. Simulateur — /simulateur-prime-cee                              */
/* ================================================================== */

test.describe('CEE Funnel — Simulateur', () => {
  test('estimation éligible : résultat affiché avec montant', async ({ page }) => {
    // Mock l'API avant navigation
    await mockCeeEstimate(page, MOCK_CEE_ESTIMATE_ELIGIBLE)

    await page.goto('/simulateur-prime-cee', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    })

    // Sélectionner un service dans le <select>
    const serviceSelect = page.locator('#cee-service')
    await expect(serviceSelect).toBeVisible({ timeout: 10_000 })
    // Prendre la première option non-vide
    const firstOption = serviceSelect.locator('option:not([value=""])')
    const firstValue = await firstOption.first().getAttribute('value')
    expect(firstValue).toBeTruthy()
    await serviceSelect.selectOption(firstValue ?? '')

    // Entrer le code postal 75001
    const cpInput = page.locator('#cee-cp')
    await cpInput.fill('75001')

    // Cliquer « Estimer ma prime »
    const submitBtn = page.locator('button[type="submit"]', {
      hasText: /Estimer ma prime/i,
    })
    await expect(submitBtn).toBeEnabled()
    await submitBtn.click()

    // Vérifier qu'un résultat éligible s'affiche :
    // soit la zone climatique, soit un montant en euros
    const resultArea = page.locator('body')
    await expect(resultArea).toContainText(/H1|€|euros/i, { timeout: 15_000 })

    // Le mock renvoie BAR-TH-171 avec prime classique 900–2700 €
    // et précarité 1600–4800 €. Vérifions qu'un montant apparaît.
    await expect(resultArea).toContainText(/Prime classique|Prime précarité/i)
  })

  test('estimation non-éligible : message « non éligible » affiché', async ({ page }) => {
    await mockCeeEstimate(page, MOCK_CEE_ESTIMATE_NON_ELIGIBLE)

    await page.goto('/simulateur-prime-cee', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    })

    const serviceSelect = page.locator('#cee-service')
    await expect(serviceSelect).toBeVisible({ timeout: 10_000 })
    const firstOption = serviceSelect.locator('option:not([value=""])')
    const firstValue = await firstOption.first().getAttribute('value')
    await serviceSelect.selectOption(firstValue ?? '')

    const cpInput = page.locator('#cee-cp')
    await cpInput.fill('75001')

    const submitBtn = page.locator('button[type="submit"]', {
      hasText: /Estimer ma prime/i,
    })
    await submitBtn.click()

    // Le composant affiche « n'est pas éligible aux CEE »
    await expect(page.locator('body')).toContainText(/pas.*éligible|non.*éligible/i, {
      timeout: 15_000,
    })
  })
})

/* ================================================================== */
/*  3. CTA routing — lien CeeCTA inline → /devis?source=cee           */
/* ================================================================== */

test.describe('CEE Funnel — CTA routing', () => {
  test('le CeeCTA inline contient un lien vers /devis avec source=cee', async ({ page }) => {
    await page.goto('/cee', { waitUntil: 'domcontentloaded', timeout: 30_000 })

    // CeeCTA inline : <div> avec « Estimez votre prime CEE gratuitement » en <h3>
    // et un lien « Demander un devis gratuit »
    const inlineCta = page.locator('div.rounded-2xl:has(h3)', {
      hasText: /prime CEE/i,
    })

    // Il peut y avoir plusieurs CTA inline sur la page /cee ; vérifions le premier
    const firstInline = inlineCta.first()
    await expect(firstInline).toBeVisible({ timeout: 10_000 })

    const link = firstInline.locator('a[href*="/devis"]')
    await expect(link).toBeVisible()

    const href = await link.getAttribute('href')
    expect(href).toBeTruthy()
    expect(href).toContain('/devis')
    expect(href).toContain('source=cee')
  })
})

/* ================================================================== */
/*  4. Sticky CTA mobile — apparaît après scroll                      */
/* ================================================================== */

test.describe('CEE Funnel — Sticky CTA mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('le sticky-bottom CTA apparaît après scroll de 400px', async ({ page }) => {
    await page.goto('/cee', { waitUntil: 'domcontentloaded', timeout: 30_000 })

    // Le CeeCTA sticky-bottom est un <div> fixé en bas avec « md:hidden »
    // contenant « Prime CEE disponible »
    const stickyCta = page.locator('div.fixed.bottom-0', {
      hasText: /Prime CEE disponible/i,
    })

    // Avant scroll : le sticky peut ne pas encore être visible
    // (certaines pages ne montent le sticky qu'au scroll)
    // Scroller 400px vers le bas
    await page.evaluate(() => window.scrollBy(0, 400))

    // Attendre que le sticky apparaisse
    // Note : sur /cee, le CeeCTA sticky-bottom est rendu côté serveur et
    // toujours dans le DOM mobile. Sa visibilité dépend de la classe md:hidden
    // qui le cache sur desktop mais le montre sur mobile (viewport 375).
    await expect(stickyCta).toBeVisible({ timeout: 10_000 })

    // Vérifier que le lien est fonctionnel
    const stickyLink = stickyCta.locator('a[href*="/devis"]')
    await expect(stickyLink).toBeVisible()
    await expect(stickyLink).toHaveAttribute('href', /source=cee/)
  })
})

/* ================================================================== */
/*  5. DevisBottomSheet mobile — s'ouvre au clic StickyMobileCTA       */
/* ================================================================== */

test.describe('CEE Funnel — DevisBottomSheet mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('clic sur StickyMobileCTA ouvre le bottom sheet devis', async ({ page }) => {
    // Mock l'API CEE pour éviter les erreurs réseau
    await mockCeeEstimate(page, MOCK_CEE_ESTIMATE_ELIGIBLE)

    // Aller sur une page service qui a un StickyMobileCTA
    // (les pages service + ville montent le StickyMobileCTA)
    await page.goto('/services/chauffagiste', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    })

    // Scroller pour déclencher l'apparition du StickyMobileCTA
    await page.evaluate(() => window.scrollBy(0, 500))

    // Le StickyMobileCTA rend un bouton fixé en bas mobile avec
    // « Demander un devis gratuit » (ou texte custom)
    const stickyBtn = page
      .locator('button, a', {
        hasText: /devis gratuit/i,
      })
      .locator('visible=true')
      .first()

    // Attendre l'apparition du sticky
    await expect(stickyBtn).toBeVisible({ timeout: 15_000 })
    await stickyBtn.click()

    // Le DevisBottomSheet s'ouvre : vérifier la présence du formulaire
    // DevisBottomSheet rend un panel avec les étapes du formulaire devis
    // et utilise le hook useDevisForm. Le sheet contient un <select> service
    // ou des champs de formulaire.
    const bottomSheet = page.locator('[role="dialog"], [data-testid="devis-bottom-sheet"]')
    // Fallback : chercher un panneau overlay qui contient un formulaire
    const sheetOrForm = bottomSheet.or(
      page.locator('.fixed.inset-0, .fixed.bottom-0').filter({
        has: page.locator('form, select, input'),
      })
    )

    await expect(sheetOrForm.first()).toBeVisible({ timeout: 10_000 })
  })
})

/* ================================================================== */
/*  6. Page opération CEE — /cee/bar-th-171                           */
/* ================================================================== */

test.describe('CEE Funnel — Page opération', () => {
  test('la page /cee/bar-th-171 charge avec le code opération et CeeCTA inline', async ({
    page,
  }) => {
    await page.goto('/cee/bar-th-171', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    })

    // La page doit contenir le code opération
    await expect(page.locator('body')).toContainText('BAR-TH-171', { timeout: 10_000 })

    // Un CeeCTA inline doit être visible sur la page opération
    // CeeCTA inline : div avec h3 « Estimez votre prime CEE gratuitement »
    // et lien « Demander un devis gratuit »
    const inlineCta = page.locator('a', {
      hasText: /Demander un devis gratuit/i,
    })
    await expect(inlineCta.first()).toBeVisible({ timeout: 10_000 })

    // Le lien doit pointer vers /devis avec source=cee et l'opération
    const href = await inlineCta.first().getAttribute('href')
    expect(href).toContain('/devis')
    expect(href).toContain('source=cee')
    // Le CeeCTA passe operationCode → le href contient operation=BAR-TH-171
    expect(href).toContain('operation=BAR-TH-171')
  })
})
