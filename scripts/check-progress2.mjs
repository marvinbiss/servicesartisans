import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf-8')
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim()
const sb = createClient('https://umjmbdbwcsxrvfqktiui.supabase.co', key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Count fixed vs unfixed by scanning batches
let fixed = 0
let unfixed = 0
let offset = 0
const PAGE = 1000
const MAX_PAGES = 50 // Sample 50K providers

while (offset < MAX_PAGES * PAGE) {
  const { data, error } = await sb
    .from('providers')
    .select('address_city')
    .eq('is_active', true)
    .range(offset, offset + PAGE - 1)

  if (error || !data || data.length === 0) break

  for (const p of data) {
    const city = p.address_city || ''
    if (/^\d{4,5}$/.test(city) || /^[0-9][A-Z0-9]\d{3}$/.test(city)) {
      unfixed++
    } else {
      fixed++
    }
  }

  offset += PAGE
  if (data.length < PAGE) break
}

console.log(`Scanned ${offset} providers:`)
console.log(`  Fixed (city names): ${fixed}`)
console.log(`  Unfixed (INSEE codes): ${unfixed}`)
console.log(`  Progress: ${((fixed / (fixed + unfixed)) * 100).toFixed(1)}%`)
console.log(`  Estimated total fixed: ~${Math.round(fixed * 743000 / (fixed + unfixed))} out of 743K`)
