#!/usr/bin/env node
/**
 * Revalidate batch — invalide ISR + edge cache Vercel pour les 283 URLs
 * touchées par les commits ULTRA (4d58b6e16 → 4276b85f9 le 2026-04-30).
 *
 * /api/revalidate accepte 50 paths max par batch + auth Bearer.
 * Auto-fire IndexNow déjà câblé côté handler (ligne 82-91).
 *
 * Usage : REVALIDATE_SECRET=xxx node scripts/revalidate-ultra-templates-2026-04-30.mjs
 */

const SECRET = process.env.REVALIDATE_SECRET
if (!SECRET) {
  console.error('[ERROR] REVALIDATE_SECRET non défini. Lance avec :')
  console.error('  REVALIDATE_SECRET=xxx node scripts/revalidate-ultra-templates-2026-04-30.mjs')
  process.exit(2)
}

const SITE = 'https://servicesartisans.fr'
const ENDPOINT = `${SITE}/api/revalidate`
const BATCH_SIZE = 50

// Réutilise la même curation que indexnow-ultra-templates-2026-04-30.mjs
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
const TOP_CEE_OPS = [
  'bar-th-171',
  'bar-th-148',
  'bar-en-101',
  'bar-en-103',
  'bar-en-104',
  'bar-th-129',
  'bar-th-104',
  'bar-th-113',
]
const OTHER_CEE = [
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
]
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
const TOP_AIDES = ['maprimerenov', 'cee', 'eco-ptz', 'ma-prime-adapt', 'tva-reduite']
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
const AIDE_SLUGS = [
  'paris-75',
  'rhone-69',
  'bouches-du-rhone-13',
  'nord-59',
  'gironde-33',
  'haute-garonne-31',
]

const paths = new Set()
TOP_SERVICES.forEach((s) =>
  TOP_VILLES.slice(0, 5).forEach((v) => paths.add(`/rge/${s}/${v}`))
)
TOP_CEE_OPS.forEach((op) =>
  TOP_VILLES.slice(0, 4).forEach((v) => paths.add(`/cee/${op}/${v}`))
)
TOP_CEE_OPS.forEach((op) => paths.add(`/cee/${op}`))
OTHER_CEE.forEach((op) => paths.add(`/cee/${op}`))
TOP_CEE_OPS.forEach((op) => paths.add(`/cee/${op}/guide`))
TOP_VILLES.forEach((v) => paths.add(`/artisans-rge/${v}`))
TOP_VILLES.forEach((v) => paths.add(`/communes/${v}`))
TOP_AIDES.forEach((a) => paths.add(`/aides/${a}`))
AIDE_SLUGS.forEach((slug) => paths.add(`/aides/${slug}/maprimerenov`))
TOP_PROBLEMES.forEach((p) =>
  TOP_VILLES.slice(0, 4).forEach((v) => paths.add(`/problemes/${p}/${v}`))
)
TOP_PROBLEMES.forEach((p) => paths.add(`/problemes/${p}`))
TOP_DEPTS.forEach((d) => paths.add(`/departements/${d}`))
REGIONS.forEach((r) => paths.add(`/regions/${r}`))
TOP_SERVICES.forEach((s) =>
  TOP_VILLES.slice(0, 4).forEach((v) => paths.add(`/avis/${s}/${v}`))
)
TOP_SERVICES.forEach((s) => paths.add(`/avis/${s}`))
TOP_SERVICES.forEach((s) =>
  TOP_VILLES.slice(0, 4).forEach((v) => paths.add(`/urgence/${s}/${v}`))
)
TOP_SERVICES.forEach((s) => paths.add(`/urgence/${s}`))

const ALL_PATHS = Array.from(paths)
const totalBatches = Math.ceil(ALL_PATHS.length / BATCH_SIZE)

console.log(`=== Revalidate ULTRA Templates (${ALL_PATHS.length} paths, ${totalBatches} batches) ===\n`)

let totalRevalidated = 0
let totalErrors = 0

for (let i = 0; i < ALL_PATHS.length; i += BATCH_SIZE) {
  const batch = ALL_PATHS.slice(i, i + BATCH_SIZE)
  const batchNum = Math.floor(i / BATCH_SIZE) + 1
  const t0 = Date.now()
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SECRET}`,
        'Origin': SITE,
      },
      body: JSON.stringify({ paths: batch }),
    })
    const dt = Date.now() - t0
    const json = await res.json().catch(() => ({}))
    if (res.ok && json.revalidated) {
      const ok = (json.paths || []).length
      const err = (json.errors || []).length
      totalRevalidated += ok
      totalErrors += err
      console.log(`  [${batchNum}/${totalBatches}] OK  ${res.status}  ${dt}ms  revalidated=${ok}${err > 0 ? `  errors=${err}` : ''}`)
    } else {
      totalErrors += batch.length
      console.log(`  [${batchNum}/${totalBatches}] KO  ${res.status}  ${dt}ms  ${JSON.stringify(json).slice(0, 200)}`)
    }
  } catch (err) {
    totalErrors += batch.length
    console.log(`  [${batchNum}/${totalBatches}] EXC  ${Date.now() - t0}ms  ${String(err)}`)
  }
}

console.log()
console.log(`Total revalidated : ${totalRevalidated}`)
console.log(`Total errors      : ${totalErrors}`)
console.log()
console.log('IndexNow auto-fire câblé côté handler /api/revalidate (route.ts:82-91)')
console.log('→ Bing+Yandex repingés en bonus, propagation Google ~24-48h.')
console.log()
console.log('Edge cache Vercel : invalidé. Prochain hit servira la nouvelle version.')
console.log('Vérif : curl -sI ' + SITE + ALL_PATHS[0] + ' | grep -i x-vercel-cache')

if (totalErrors > 0) process.exit(1)
