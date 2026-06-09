import { test, expect } from '@playwright/test'

// Dev server : cold compile des pages lourdes peut dépasser le défaut.
test.setTimeout(120_000)

/**
 * Tunnel devis immersif `/demander-un-devis` (dogfood comparatif vs
 * travaux.com 2026-06-09).
 *
 * Couvre :
 *  1. Le bouton header "Devis gratuit" pointe et navigue vers le funnel
 *     immersif (et non plus /devis).
 *  2. La route immersive masque le chrome global (SiteChrome HIDDEN_PREFIXES)
 *     tout en rendant le wizard DevisForm (H1 + barre de progression).
 *  3. La route est noindex (duplicate du funnel /devis qui porte le SEO).
 */

test.describe('Tunnel devis immersif', () => {
  test('header "Devis gratuit" → /demander-un-devis', async ({ page }) => {
    await page.goto('/')
    const cta = page.locator('header a[href="/demander-un-devis"]').first()
    await expect(cta).toBeVisible()
    await cta.click()
    await expect(page).toHaveURL(/\/demander-un-devis(\?|\/|$)/, { timeout: 60_000 })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('route immersive : wizard rendu, chrome global masqué', async ({ page }) => {
    await page.goto('/demander-un-devis')

    // Wizard présent : H1 + barre de progression (étape 1 sur 3).
    await expect(page.getByRole('heading', { level: 1, name: /Recevez vos devis/i })).toBeVisible()
    await expect(page.locator('[role="progressbar"]')).toBeVisible()
    await expect(page.getByText('Étape 1 sur 3', { exact: true })).toBeVisible()

    // Sortie explicite du tunnel.
    await expect(page.locator('a[aria-label*="Quitter"]')).toBeVisible()

    // Chrome global ABSENT : le header marketing (badge "Urgence RGE 24h")
    // et le lien nav espace artisan ne doivent pas fuiter dans le tunnel.
    await expect(page.getByText('Urgence RGE 24h')).toHaveCount(0)
    await expect(page.locator('header a[href="/demander-un-devis"]')).toHaveCount(0)
  })

  test('route immersive : un seul landmark <main> (pas de main imbriqué)', async ({ page }) => {
    // Garde-fou : SiteChrome (chrome masqué) enveloppe déjà children dans
    // <main id="main-content">. La page ne doit PAS rajouter un second <main>
    // (HTML invalide + double landmark WCAG).
    await page.goto('/demander-un-devis')
    await expect(page.locator('main')).toHaveCount(1)
    await expect(page.locator('main#main-content')).toHaveCount(1)
    await expect(page.locator('main main')).toHaveCount(0)
  })

  test('route immersive : noindex (canonical → /devis porte le SEO)', async ({ page }) => {
    await page.goto('/demander-un-devis')
    const robots = page.locator('meta[name="robots"]')
    await expect(robots).toHaveAttribute('content', /noindex/i)
  })

  test('prefill via query params (CTA contextualisés)', async ({ page }) => {
    await page.goto('/demander-un-devis?service=pompe-a-chaleur&ville=Toulouse')
    // Le service prérempli fait démarrer le wizard à l'étape 2 (isPrefilled) ;
    // on vérifie au minimum que le formulaire est rendu sans erreur.
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('form')).toBeVisible()
  })
})
