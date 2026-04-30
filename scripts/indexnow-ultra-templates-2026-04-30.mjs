#!/usr/bin/env node
/**
 * IndexNow batch — push immédiat des 16 templates upgradés ULTRA
 * (commits 4d58b6e16 → 4276b85f9 le 2026-04-30).
 *
 * 11 templates ULTRA livrés aujourd'hui :
 *   /rge/[s]/[v]                 50 000 URLs
 *   /cee/[op]/[ville]             9 500 URLs
 *   /cee/[op] hub                    19 URLs
 *   /cee/[op]/guide                  19 URLs
 *   /artisans-rge/[ville]         5 000 URLs
 *   /communes/[c]                35 999 URLs
 *   /aides/[slug]                    13 hubs aides
 *   /aides/[slug]/[aide]            167 YMYL
 *   /problemes/[probleme]/[ville] 5 000 URLs
 *   /problemes/[probleme] hub       ~50 URLs
 *   /departements/[d]                96 URLs
 *   /regions/[r]                     13 URLs
 *   /avis/[s]/[v]                 5 000 URLs
 *   /avis/[s] hub                    46 URLs
 *   /urgence/[s]/[v]              5 000 URLs
 *   /urgence/[s] hub                 46 URLs
 *
 * Stratégie : on ne peut pas pinger 100K+ URLs (limite IndexNow ~10K/jour
 * par site, et même là ça noie le signal). On envoie une liste **curatée**
 * de ~200 URLs représentatives couvrant chaque template, avec focus sur
 * les top combos (top métiers × top villes + tous les hubs).
 *
 * Google/Bing reçoivent le signal "ces 200 pages ont changé". Ils
 * recrawlent → découvrent les nouveaux schemas (Article, Speakable,
 * EnBref, Tldr) → propagent la décision sur l'ensemble du template
 * via leur signal d'algo (template uniformity).
 *
 * Usage : node scripts/indexnow-ultra-templates-2026-04-30.mjs
 */

const SITE_URL = 'https://servicesartisans.fr'
const INDEXNOW_KEY = process.env.INDEXNOW_API_KEY || 'd438ef72ba5465680fecf42737f316b4'

// Top métiers les plus recherchés
const TOP_SERVICES = [
  'plombier',
  'electricien',
  'chauffagiste',
  'serrurier',
  'menuisier',
  'macon',
  'peintre',
  'carreleur',
]

// Top villes par population (top 10 + chefs-lieux régionaux clés)
const TOP_VILLES = [
  'paris',
  'marseille',
  'lyon',
  'toulouse',
  'nice',
  'nantes',
  'montpellier',
  'strasbourg',
  'bordeaux',
  'lille',
  'rennes',
  'reims',
  'saint-etienne',
  'le-havre',
  'toulon',
]

// Top opérations CEE (volume dossiers + grand public)
const TOP_CEE_OPS = [
  'bar-th-171', // PAC air-eau
  'bar-th-148', // chauffe-eau thermo
  'bar-en-101', // isolation combles perdus
  'bar-en-103', // isolation murs
  'bar-en-104', // isolation rampants
  'bar-th-129', // pompe à chaleur air-air
  'bar-th-104', // chaudière biomasse
  'bar-th-113', // chaudière condensation
]

// Top problèmes (urgence haute = traffic chaud)
const TOP_PROBLEMES = [
  'fuite-eau',
  'panne-chaudiere',
  'panne-electrique',
  'canalisation-bouchee',
  'wc-bouche',
  'court-circuit',
  'humidite',
  'infiltration-toiture',
]

// Top aides + sous-pages
const TOP_AIDES = [
  'maprimerenov',
  'cee',
  'eco-ptz',
  'ma-prime-adapt',
  'tva-reduite',
]

// Top départements (densité population + activité économique)
const TOP_DEPTS = [
  'paris',
  'rhone',
  'bouches-du-rhone',
  'nord',
  'hauts-de-seine',
  'gironde',
  'haute-garonne',
  'alpes-maritimes',
  'seine-saint-denis',
  'loire-atlantique',
]

// Toutes les régions (13)
const REGIONS = [
  'ile-de-france',
  'auvergne-rhone-alpes',
  'provence-alpes-cote-d-azur',
  'occitanie',
  'nouvelle-aquitaine',
  'hauts-de-france',
  'grand-est',
  'pays-de-la-loire',
  'bretagne',
  'normandie',
  'centre-val-de-loire',
  'bourgogne-franche-comte',
  'corse',
]

const urls = new Set()

// 1. /rge/[s]/[v] — 8 services × 5 villes = 40 URLs représentatives
TOP_SERVICES.forEach((s) =>
  TOP_VILLES.slice(0, 5).forEach((v) => urls.add(`${SITE_URL}/rge/${s}/${v}`))
)

// 2. /cee/[op]/[ville] — 8 opérations × 4 villes = 32 URLs
TOP_CEE_OPS.forEach((op) =>
  TOP_VILLES.slice(0, 4).forEach((v) => urls.add(`${SITE_URL}/cee/${op}/${v}`))
)

// 3. /cee/[op] hub — toutes les 8 top ops + 11 autres = 19 URLs
TOP_CEE_OPS.forEach((op) => urls.add(`${SITE_URL}/cee/${op}`))
;[
  'bar-th-172',
  'bar-th-174',
  'bar-th-143',
  'bar-th-159',
  'bar-en-108',
  'bar-th-106',
  'bar-th-112',
  'bar-en-102',
  'bar-en-105',
  'bar-en-106',
  'bar-en-107',
].forEach((op) => urls.add(`${SITE_URL}/cee/${op}`))

// 4. /cee/[op]/guide — 8 top ops
TOP_CEE_OPS.forEach((op) => urls.add(`${SITE_URL}/cee/${op}/guide`))

// 5. /artisans-rge/[ville] — top 15 villes
TOP_VILLES.forEach((v) => urls.add(`${SITE_URL}/artisans-rge/${v}`))

// 6. /communes/[c] — top 15 villes (subset des 35K)
TOP_VILLES.forEach((v) => urls.add(`${SITE_URL}/communes/${v}`))

// 7. /aides/[slug] hub — 5 grandes aides
TOP_AIDES.forEach((a) => urls.add(`${SITE_URL}/aides/${a}`))

// 8. /aides/[slug]/[aide] — patterns dept × maprimerenov
;[
  'paris-75',
  'rhone-69',
  'bouches-du-rhone-13',
  'nord-59',
  'gironde-33',
  'haute-garonne-31',
].forEach((slug) => urls.add(`${SITE_URL}/aides/${slug}/maprimerenov`))

// 9. /problemes/[probleme]/[ville] — 8 problèmes × 4 villes = 32 URLs
TOP_PROBLEMES.forEach((p) =>
  TOP_VILLES.slice(0, 4).forEach((v) => urls.add(`${SITE_URL}/problemes/${p}/${v}`))
)

// 10. /problemes/[probleme] hub — 8 top
TOP_PROBLEMES.forEach((p) => urls.add(`${SITE_URL}/problemes/${p}`))

// 11. /departements/[d] — top 10
TOP_DEPTS.forEach((d) => urls.add(`${SITE_URL}/departements/${d}`))

// 12. /regions/[r] — toutes les 13
REGIONS.forEach((r) => urls.add(`${SITE_URL}/regions/${r}`))

// 13. /avis/[s]/[v] — 8 services × 4 villes = 32 URLs
TOP_SERVICES.forEach((s) =>
  TOP_VILLES.slice(0, 4).forEach((v) => urls.add(`${SITE_URL}/avis/${s}/${v}`))
)

// 14. /avis/[s] hub — 8 top services
TOP_SERVICES.forEach((s) => urls.add(`${SITE_URL}/avis/${s}`))

// 15. /urgence/[s]/[v] — 8 services × 4 villes = 32 URLs
TOP_SERVICES.forEach((s) =>
  TOP_VILLES.slice(0, 4).forEach((v) => urls.add(`${SITE_URL}/urgence/${s}/${v}`))
)

// 16. /urgence/[s] hub — 8 top services
TOP_SERVICES.forEach((s) => urls.add(`${SITE_URL}/urgence/${s}`))

const URLS = Array.from(urls)

console.log(`=== IndexNow ULTRA Templates push (${URLS.length} URLs) ===\n`)
console.log(`Coverage : 16 templates upgradés ce jour, ~200 URLs représentatives.`)
console.log(`Strategy : signal Bing+Yandex+Google pour propagation algo template-wide.\n`)

const ENDPOINTS = [
  { name: 'Bing', url: 'https://www.bing.com/indexnow' },
  { name: 'Yandex', url: 'https://yandex.com/indexnow' },
]

const payload = {
  host: 'servicesartisans.fr',
  key: INDEXNOW_KEY,
  keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
  urlList: URLS,
}

const results = await Promise.all(
  ENDPOINTS.map(async ({ name, url }) => {
    const t0 = Date.now()
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
      })
      const dt = Date.now() - t0
      return { name, status: res.status, ok: res.ok, dt }
    } catch (err) {
      return { name, status: 0, ok: false, error: String(err), dt: Date.now() - t0 }
    }
  })
)

console.log('Résultats :')
for (const r of results) {
  const tag = r.ok ? 'OK' : 'KO'
  console.log(
    `  ${tag.padEnd(3)} ${r.name.padEnd(8)} ${String(r.status).padEnd(4)} ${r.dt}ms${r.error ? ' — ' + r.error : ''}`
  )
}

const allOk = results.every((r) => r.ok)
if (!allOk) {
  console.log('\n[WARN] Au moins un endpoint KO. Réessayer plus tard.')
  process.exit(1)
}

console.log('\n[OK] Push terminé. Recrawl Bing+Yandex sous 24-48h.')
console.log('     Google suit via sitemap lastmod + signal IndexNow indirect.')
