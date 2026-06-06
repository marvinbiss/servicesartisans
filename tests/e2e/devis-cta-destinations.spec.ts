import { test, expect } from '@playwright/test'

// Dev server : cold compile des pages lourdes (/rge, /services) peut dépasser
// les 30 s par défaut. Sans incidence en CI (next start = pages déjà buildées).
test.setTimeout(120_000)

/**
 * Anti-régression bug 2026-06-06 — CTAs flottants devis.
 *
 * Avant fix : StickyMobileCTA construisait son href inline →
 *   - serviceSlug+citySlug : /services/[s]/[v] (self-link sur pages listing)
 *   - serviceSlug seul : /devis/<slug>, 410 middleware si slug mort
 *     (guides passaient chauffage/isolation/plomberie/cuisine).
 *
 * Ces tests vérifient en navigateur réel que chaque CTA flottant atterrit
 * sur le formulaire /devis (pré-rempli) — pas un self-link, pas un 410.
 */

test.describe('CTA flottant devis — destinations réelles', () => {
  test('guide PAC : flottant desktop → /devis/pompe-a-chaleur (formulaire)', async ({ page }) => {
    await page.goto('/guides/pompe-a-chaleur')
    // Le CTA desktop apparaît après scroll (>300px)
    await page.evaluate(() => window.scrollTo(0, 1200))
    const cta = page.locator('a[href="/devis/pompe-a-chaleur"]').first()
    await expect(cta).toBeVisible()
    await cta.click()
    // (\?|\/|$) : GA linker peut décorer l'URL avec ?_gl=…
    await expect(page).toHaveURL(/\/devis\/pompe-a-chaleur(\?|\/|$)/, { timeout: 60_000 })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('/rge/pompe-a-chaleur/toulouse : flottant câblé formulaire + hero navigue', async ({
    page,
  }) => {
    await page.goto('/rge/pompe-a-chaleur/toulouse')
    // Le flottant sticky se masque quand DevisQuickForm est en viewport
    // (comportement voulu) — on vérifie donc son href dans le DOM, et on
    // valide la navigation via le CTA hero (toujours visible).
    const sticky = page.locator('a[href="/devis?service=pompe-a-chaleur&ville=toulouse"]')
    expect(await sticky.count()).toBeGreaterThan(0)
    const hero = page.getByRole('link', { name: /Demander un devis RGE/i }).first()
    await expect(hero).toBeVisible()
    await hero.click()
    // SSR dev de /devis?… peut dépasser 5 s — timeout généreux.
    await expect(page).toHaveURL(/\/devis\?service=pompe-a-chaleur&ville=toulouse/, {
      timeout: 60_000,
    })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('/services/pompe-a-chaleur/toulouse : plus de self-link, flottant câblé formulaire', async ({
    page,
  }) => {
    await page.goto('/services/pompe-a-chaleur/toulouse')
    // Ancien bug : le flottant StickyMobileCTA portait href
    // /services/pompe-a-chaleur/toulouse (self-link). Le composant rend
    // l'ancre desktop dans un wrapper .z-sticky-cta — on vérifie qu'aucune
    // ancre devis du flottant ne self-link et que la cible formulaire existe.
    const cta = page.locator('a[href="/devis?service=pompe-a-chaleur&ville=toulouse"]')
    expect(await cta.count()).toBeGreaterThan(0)
    const stickySelfLink = page.locator(
      'div.z-sticky-cta a[href="/services/pompe-a-chaleur/toulouse"]'
    )
    await expect(stickySelfLink).toHaveCount(0)
    // Navigation réelle via la première ancre formulaire de la page.
    await cta.first().evaluate((el) => (el as HTMLElement).click())
    await expect(page).toHaveURL(/\/devis\?service=pompe-a-chaleur&ville=toulouse/, {
      timeout: 60_000,
    })
  })

  test('mobile : flottant ouvre le bottom sheet devis', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/rge/pompe-a-chaleur/toulouse')
    const btn = page.getByRole('button', { name: /Devis RGE gratuit/i }).first()
    await expect(btn).toBeAttached()
    // Clic JS : le flottant se masque (translate-y-full) quand le form
    // inline est en viewport — le handler React reste câblé, c'est lui
    // qu'on teste (ouverture du sheet), pas la géométrie du pointeur.
    await btn.evaluate((el) => (el as HTMLElement).click())
    // DevisBottomSheet monté : body porte data-estimation-open
    await expect(page.locator('body[data-estimation-open]')).toHaveCount(1)
  })
})

test.describe('Middleware 410 — slugs morts', () => {
  test('/devis/chauffage → 410 (slug mort post-pivot RGE)', async ({ request }) => {
    const res = await request.get('/devis/chauffage', { maxRedirects: 0 })
    expect(res.status()).toBe(410)
  })

  test('/devis/chauffagiste → 200 (slug canon)', async ({ request }) => {
    const res = await request.get('/devis/chauffagiste')
    expect(res.status()).toBe(200)
  })

  test('/devis/pompe-a-chaleur/toulouse → redirect permanent vers /services (route 2-seg purgée)', async ({
    request,
  }) => {
    const res = await request.get('/devis/pompe-a-chaleur/toulouse', { maxRedirects: 0 })
    // 308 émis par next.config.js (redirects, permanent:true) — évalué AVANT
    // le middleware, donc le 301 de gone-paths n'est jamais atteint ici.
    // 301 conservé au cas où l'ordre change. Les deux = permanent pour Google.
    expect([301, 308]).toContain(res.status())
    expect(res.headers()['location']).toContain('/services/pompe-a-chaleur/toulouse')
  })
})
