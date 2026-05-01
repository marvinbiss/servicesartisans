/**
 * IndexNow batch — push immédiat des 7 blog prix-* dont l'`updatedDate` a
 * été bumpé à 2026-04-30 (P0 GSC audit 2026-05-01, bloc 2).
 *
 * Pourquoi : commit `5cc4a1b5e` (30/04) a refondu metaTitle/metaDescription
 * et injecté Schema Service+AggregateOffer mais a laissé les `updatedDate`
 * à 2026-02 / 2026-03. Sur 28j, ces 7 URLs gardent CTR 0.73 % (3 154 imp,
 * 23 clics). Bumping de `updatedDate` = signal `dateModified` Schema +
 * `<lastmod>` sitemap rafraîchi → Google reprior recrawl + révision titre
 * SERP.
 *
 * Usage : node scripts/indexnow-zombie-blogs-bump-2026-05-01.mjs
 */

const SITE_URL = 'https://servicesartisans.fr'
const INDEXNOW_KEY = process.env.INDEXNOW_API_KEY || 'd438ef72ba5465680fecf42737f316b4'

const URLS = [
  `${SITE_URL}/blog/prix-plombier-2026-tarifs-horaires`,
  `${SITE_URL}/blog/prix-electricien-2026-tarifs-travaux`,
  `${SITE_URL}/blog/prix-peintre-batiment-2026-guide-complet`,
  `${SITE_URL}/blog/prix-chauffagiste-2026-installation-entretien`,
  `${SITE_URL}/blog/prix-macon-2026-gros-oeuvre-renovation`,
  `${SITE_URL}/blog/prix-installation-electrique-neuve-2026`,
  `${SITE_URL}/blog/prix-salle-de-bain-complete-2026`,
]

const ENDPOINTS = [
  { name: 'Bing', url: 'https://www.bing.com/indexnow' },
  { name: 'Yandex', url: 'https://yandex.com/indexnow' },
]

console.log(`=== IndexNow — zombie blogs date bump (${URLS.length} URLs) ===\n`)
URLS.forEach((u, i) => console.log(`  ${i + 1}. ${u}`))
console.log()

const payload = {
  host: 'servicesartisans.fr',
  key: INDEXNOW_KEY,
  keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
  urlList: URLS,
}

const results = await Promise.all(
  ENDPOINTS.map(async (ep) => {
    try {
      const res = await fetch(ep.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
      })
      return { name: ep.name, status: res.status, ok: [200, 202, 204].includes(res.status) }
    } catch (err) {
      return { name: ep.name, status: 'ERR', error: err.message, ok: false }
    }
  })
)

console.log('Résultats :')
for (const r of results) {
  const icon = r.ok ? '✓' : '✗'
  console.log(`  ${icon} ${r.name}: ${r.status}${r.error ? ` (${r.error})` : ''}`)
}

const allOk = results.every((r) => r.ok)
console.log(`\n${allOk ? '✅' : '⚠️ '} Submission ${allOk ? 'complète' : 'partielle'}.`)
console.log('Bing + Yandex re-crawl 5-30 min. Google : sitemaps + GSC URL inspection.')

process.exit(allOk ? 0 : 1)
