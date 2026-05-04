/**
 * Probe `getQualifiedRgeCombos()` to verify if the fetcher returns enough
 * combos to safely activate sitemap filtering for /rge/[s]/[v] + /rge/[s]/dept/[d].
 *
 * Context: Sprint A audit revealed sitemap.ts comments saying "fetcher trop
 * strict (143/7000 URLs)" — fail-open total since 2026-04-30. The fetcher
 * has been refactored since (qualification-matcher + multi-format dept lookup).
 * We probe live to confirm before re-activating the filter.
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { getQualifiedRgeCombos } from '../src/lib/seo/lastmod-queries'

async function main() {
  console.log('Calling getQualifiedRgeCombos()...')
  const t0 = Date.now()
  const result = await getQualifiedRgeCombos()
  const elapsed = Date.now() - t0

  console.log(`\nElapsed: ${(elapsed / 1000).toFixed(1)}s`)
  console.log('\nResults:')
  console.log(
    `  rgeServiceCity      : ${result.rgeServiceCity?.size?.toLocaleString('fr') ?? 'NULL (DB blip)'}`
  )
  console.log(
    `  rgeServiceDept      : ${result.rgeServiceDept?.size?.toLocaleString('fr') ?? 'NULL'}`
  )
  console.log(
    `  rgeLastmodServiceCity: ${result.rgeLastmodServiceCity?.size?.toLocaleString('fr') ?? 'NULL'}`
  )
  console.log(
    `  rgeLastmodServiceDept: ${result.rgeLastmodServiceDept?.size?.toLocaleString('fr') ?? 'NULL'}`
  )

  if (result.rgeServiceCity && result.rgeServiceCity.size > 0) {
    console.log('\nSample rgeServiceCity (first 10):')
    let i = 0
    for (const k of result.rgeServiceCity) {
      console.log(`  ${k}`)
      if (++i >= 10) break
    }
  }

  if (result.rgeServiceDept && result.rgeServiceDept.size > 0) {
    console.log('\nSample rgeServiceDept (first 10):')
    let i = 0
    for (const k of result.rgeServiceDept) {
      console.log(`  ${k}`)
      if (++i >= 10) break
    }
  }

  // Verdict
  const cityCount = result.rgeServiceCity?.size ?? 0
  const deptCount = result.rgeServiceDept?.size ?? 0
  console.log('\nVerdict:')
  if (cityCount >= 3000 && deptCount >= 500) {
    console.log(`  ✅ Fetcher healthy (${cityCount} city, ${deptCount} dept).`)
    console.log(`     SAFE to re-activate sitemap filter for /rge/[s]/[v] + /rge/[s]/dept/[d].`)
  } else if (cityCount >= 500) {
    console.log(`  ⚠️  Fetcher partial (${cityCount} city, ${deptCount} dept).`)
    console.log(`     ACTIVATE WITH CAUTION — risk of pruning legitimate URLs.`)
  } else {
    console.log(`  ❌ Fetcher still broken (${cityCount} city, ${deptCount} dept).`)
    console.log(`     KEEP fail-open total in sitemap. Investigate matcher first.`)
  }
}

main().catch((e) => {
  console.error('FATAL:', e)
  process.exit(1)
})
