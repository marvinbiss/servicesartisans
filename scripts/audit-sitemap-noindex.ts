/**
 * Audit: how many URLs in the sitemap actually resolve to noindex=true?
 *
 * Only cluster of concern based on code review: /artisans-rge/[ville].
 * Sitemap lists top 500 cities (Tier 2). Pages noindex when 0 RGE providers
 * exist in the city. No pruning applied at sitemap generation time.
 */

import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { createAdminClient } from '@/lib/supabase/admin'
import { villes } from '@/lib/data/france'
import { SITEMAP_CITY_COUNT_TIER2 } from '@/lib/seo/sitemap-config'
import { getCityValues } from '@/lib/insee-resolver'

async function main() {
  const s = createAdminClient()
  const phase1 = villes.slice(0, SITEMAP_CITY_COUNT_TIER2)
  console.log(`Auditing ${phase1.length} RGE-city sitemap URLs...`)

  let zero = 0
  let nonZero = 0
  const sampleZero: string[] = []

  for (let i = 0; i < phase1.length; i++) {
    const ville = phase1[i]
    const cityValues = getCityValues(ville.name, ville.departementCode)
    const today = new Date().toISOString().slice(0, 10)
    const { count } = await s
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .in('address_city', cityValues)
      .eq('is_active', true)
      .not('rge_qualifications', 'is', null)
      .gte('rge_valid_until', today)

    if ((count ?? 0) === 0) {
      zero++
      if (sampleZero.length < 15) sampleZero.push(`/artisans-rge/${ville.slug}`)
    } else {
      nonZero++
    }

    if (i % 50 === 49) console.log(`  [${i + 1}/${phase1.length}] zero=${zero} nonZero=${nonZero}`)
  }

  console.log('')
  console.log(`TOTAL          : ${phase1.length}`)
  console.log(`noindex (zero) : ${zero} (${((zero / phase1.length) * 100).toFixed(1)}%)`)
  console.log(`indexed        : ${nonZero}`)
  console.log('')
  console.log('Sample URLs in sitemap that are noindex:')
  for (const u of sampleZero) console.log(`  ${u}`)
}

main().catch((e) => {
  console.error('fatal:', e)
  process.exit(1)
})
