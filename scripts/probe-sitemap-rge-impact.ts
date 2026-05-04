/**
 * Simulate the impact of activating RGE sitemap filtering on /rge/[s]/[v]
 * and /rge/[s]/dept/[d]. Reports kept vs pruned URLs without touching prod.
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { getQualifiedRgeCombos } from '../src/lib/seo/lastmod-queries'
import { villes, departements } from '../src/lib/data/france'

const RGE_ALLOWED_SERVICES = [
  'pompe-a-chaleur',
  'isolation-thermique',
  'chauffagiste',
  'panneaux-solaires',
  'renovation-energetique',
  'electricien',
  'menuisier',
  'couvreur',
  'plombier',
  'climaticien',
  'ramoneur',
  'zingueur',
  'facadier',
  'platrier',
  'chauffe-eau-thermodynamique',
  'audit-energetique',
  'ventilation',
  'fenetres',
  'borne-recharge',
] as const

const SITEMAP_CITY_COUNT_TIER2 = 500

function normalizeName(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
}

async function main() {
  console.log('Fetching RGE combos...')
  const { rgeServiceCity, rgeServiceDept } = await getQualifiedRgeCombos()
  console.log(`  rgeServiceCity: ${rgeServiceCity?.size ?? 'NULL'}`)
  console.log(`  rgeServiceDept: ${rgeServiceDept?.size ?? 'NULL'}`)

  if (!rgeServiceCity || !rgeServiceDept) {
    console.log('Fail-open active — sitemap would include all URLs.')
    return
  }

  // Simulate /rge/[s]/[v] filter
  const phase1Cities = villes.slice(0, SITEMAP_CITY_COUNT_TIER2)
  let cityKept = 0
  let cityPruned = 0
  for (const svc of RGE_ALLOWED_SERVICES) {
    for (const ville of phase1Cities) {
      const key = `${svc}::${ville.slug}`
      const hasLocal = rgeServiceCity.has(key)
      const deptSlug = normalizeName(ville.departement)
      const hasDept = rgeServiceDept.has(`${svc}::${deptSlug}`)
      if (hasLocal || hasDept) cityKept++
      else cityPruned++
    }
  }

  // Simulate /rge/[s]/dept/[d] filter
  let deptKept = 0
  let deptPruned = 0
  for (const svc of RGE_ALLOWED_SERVICES) {
    for (const dept of departements) {
      const deptKey = normalizeName(dept.name)
      const mapKey = `${svc}::${deptKey}`
      if (rgeServiceDept.has(mapKey)) deptKept++
      else deptPruned++
    }
  }

  console.log('\n=== /rge/[s]/[v] (city OR dept fallback) ===')
  console.log(
    `  Total emitted before: ${(RGE_ALLOWED_SERVICES.length * phase1Cities.length).toLocaleString('fr')}`
  )
  console.log(
    `  Kept after filter   : ${cityKept.toLocaleString('fr')} (${((cityKept / (RGE_ALLOWED_SERVICES.length * phase1Cities.length)) * 100).toFixed(1)}%)`
  )
  console.log(
    `  Pruned (would 404/noindex): ${cityPruned.toLocaleString('fr')} (${((cityPruned / (RGE_ALLOWED_SERVICES.length * phase1Cities.length)) * 100).toFixed(1)}%)`
  )

  console.log('\n=== /rge/[s]/dept/[d] (dept only) ===')
  console.log(
    `  Total emitted before: ${(RGE_ALLOWED_SERVICES.length * departements.length).toLocaleString('fr')}`
  )
  console.log(
    `  Kept after filter   : ${deptKept.toLocaleString('fr')} (${((deptKept / (RGE_ALLOWED_SERVICES.length * departements.length)) * 100).toFixed(1)}%)`
  )
  console.log(
    `  Pruned              : ${deptPruned.toLocaleString('fr')} (${((deptPruned / (RGE_ALLOWED_SERVICES.length * departements.length)) * 100).toFixed(1)}%)`
  )

  console.log('\n=== TOTAL ===')
  const totalBefore =
    RGE_ALLOWED_SERVICES.length * phase1Cities.length +
    RGE_ALLOWED_SERVICES.length * departements.length
  const totalAfter = cityKept + deptKept
  console.log(`  Avant : ${totalBefore.toLocaleString('fr')} URLs RGE en sitemap`)
  console.log(`  Après : ${totalAfter.toLocaleString('fr')} URLs RGE en sitemap`)
  console.log(
    `  Économie crawl budget Google : ${(totalBefore - totalAfter).toLocaleString('fr')} URLs/cycle (= ${(((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1)}% du sitemap RGE)`
  )
}

main().catch((e) => {
  console.error('FATAL:', e)
  process.exit(1)
})
