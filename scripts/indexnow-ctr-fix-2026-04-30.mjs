/**
 * IndexNow batch — push immédiat des 8 URLs patchées par le commit
 * 5cc4a1b5e (CTR fix homepage brand + 7 blog prix-*).
 *
 * Lance le re-crawl Bing + Yandex maintenant. Google suivra via sitemaps.
 *
 * Usage : node scripts/indexnow-ctr-fix-2026-04-30.mjs
 */

const SITE_URL = 'https://servicesartisans.fr'
const INDEXNOW_KEY = process.env.INDEXNOW_API_KEY || 'd438ef72ba5465680fecf42737f316b4'

const URLS = [
  `${SITE_URL}/`,
  `${SITE_URL}/blog/prix-electricien-2026-tarifs-travaux`,
  `${SITE_URL}/blog/prix-installation-electrique-neuve-2026`,
  `${SITE_URL}/blog/prix-plombier-2026-tarifs-horaires`,
  `${SITE_URL}/blog/prix-menuisier-2026-tarifs-travaux`,
  `${SITE_URL}/blog/prix-macon-2026-gros-oeuvre-renovation`,
  `${SITE_URL}/blog/prix-cuisiniste-2026-pose-cuisine`,
  `${SITE_URL}/blog/chauffage-pompe-chaleur-vs-chaudiere-gaz-2026`,
]

const ENDPOINTS = [
  { name: 'Bing', url: 'https://www.bing.com/indexnow' },
  { name: 'Yandex', url: 'https://yandex.com/indexnow' },
]

console.log(`=== IndexNow — CTR fix push (${URLS.length} URLs) ===\n`)
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
console.log('Bing + Yandex re-crawl 5-30 min. Google : sitemaps next 1-7j.')

process.exit(allOk ? 0 : 1)
