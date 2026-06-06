import { chromium, devices } from 'playwright'
import { mkdirSync } from 'fs'

const BASE = 'https://servicesartisans.fr'
const OUT = './design-shots'
mkdirSync(OUT, { recursive: true })

const pages = [
  ['home', '/'],
  ['service-hub', '/services/plombier'],
  ['service-ville', '/services/plombier/lyon'],
  ['fiche', '/services/plombier/lyon/plomberie-charlemagne-323720771'],
  ['devis', '/devis'],
  ['simulateur', '/simulateur-aides-renovation'],
  ['rge-ville', '/rge/pompe-a-chaleur/lyon'],
  ['blog', '/blog/comment-choisir-son-plombier'],
]

const browser = await chromium.launch()

for (const [vpName, ctxOpts] of [
  ['desktop', { viewport: { width: 1440, height: 900 } }],
  ['mobile', { ...devices['iPhone 13'] }],
]) {
  const ctx = await browser.newContext(ctxOpts)
  for (const [name, path] of pages) {
    const page = await ctx.newPage()
    try {
      await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 })
      await page.waitForTimeout(1500)
      await page.screenshot({ path: `${OUT}/${name}-${vpName}-fold.png`, fullPage: false })
      console.log('ok', name, vpName)
    } catch (e) {
      console.log('FAIL', name, vpName, e.message?.slice(0, 80))
    }
    await page.close()
  }
  await ctx.close()
}
await browser.close()
