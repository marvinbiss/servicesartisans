import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf-8')
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim()
const sb = createClient('https://umjmbdbwcsxrvfqktiui.supabase.co', key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const { data: sample } = await sb
  .from('providers')
  .select('address_city')
  .eq('is_active', true)
  .limit(1000)

if (!sample) {
  console.log('Query failed')
  process.exit(1)
}

const inseeCount = sample.filter(p => /^\d{4,5}$/.test(p.address_city || '')).length
const cityCount = sample.filter(p => p.address_city && !/^\d{4,5}$/.test(p.address_city)).length
console.log(`Sample of ${sample.length} providers:`)
console.log(`  Still INSEE codes: ${inseeCount}`)
console.log(`  Already city names: ${cityCount}`)
console.log(`  Ratio fixed: ${((cityCount / (inseeCount + cityCount)) * 100).toFixed(1)}%`)

// Show some examples
const { data: fixed } = await sb
  .from('providers')
  .select('address_city, address_region, specialty')
  .eq('is_active', true)
  .ilike('address_city', '%a%')
  .limit(8)

if (fixed && fixed.length > 0) {
  console.log('\nExamples of fixed providers:')
  for (const p of fixed) {
    console.log(`  ${p.address_city} (${p.address_region}) - ${p.specialty}`)
  }
}
