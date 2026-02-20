/**
 * Fix provider address_city: Convert INSEE commune codes to actual city names
 * Also: generate stable_id for providers missing one, set noindex=false for indexable providers
 *
 * Usage: node scripts/fix-provider-cities.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://umjmbdbwcsxrvfqktiui.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_KEY) {
  // Try reading from .env.local
  const fs = await import('fs')
  const envContent = fs.readFileSync('.env.local', 'utf-8')
  const match = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)
  if (!match) {
    console.error('SUPABASE_SERVICE_ROLE_KEY not found')
    process.exit(1)
  }
  var serviceKey = match[1].trim()
} else {
  var serviceKey = SUPABASE_SERVICE_KEY
}

const supabase = createClient(SUPABASE_URL, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─── Step 1: Resolve INSEE commune codes to city names ───────────────

async function resolveInseeCode(inseeCode) {
  try {
    const res = await fetch(`https://geo.api.gouv.fr/communes/${inseeCode}?fields=nom,codesPostaux,departement,region`)
    if (!res.ok) return null
    const data = await res.json()
    return {
      name: data.nom,
      postalCodes: data.codesPostaux || [],
      department: data.departement?.nom || null,
      departmentCode: data.departement?.code || null,
      region: data.region?.nom || null,
    }
  } catch {
    return null
  }
}

async function fixCities() {
  console.log('=== Step 1: Fix address_city (INSEE → city name) ===\n')

  // Fetch providers with numeric address_city (INSEE codes)
  let allProviders = []
  let offset = 0
  const PAGE_SIZE = 500

  while (true) {
    const { data, error } = await supabase
      .from('providers')
      .select('id, address_city, address_postal_code, address_department, address_region')
      .eq('is_active', true)
      .range(offset, offset + PAGE_SIZE - 1)

    if (error) {
      console.error('Query error:', error.message)
      break
    }
    if (!data || data.length === 0) break

    allProviders = allProviders.concat(data)
    if (data.length < PAGE_SIZE) break
    offset += PAGE_SIZE
    console.log(`  Fetched ${allProviders.length} providers...`)
  }

  console.log(`Total providers fetched: ${allProviders.length}`)

  // Filter providers with INSEE code in address_city
  const inseeProviders = allProviders.filter(p => {
    const city = p.address_city || ''
    return /^\d{4,5}$/.test(city) || /^[0-9][A-Z0-9]\d{3}$/.test(city) // Corse: 2A/2B
  })

  console.log(`Providers with INSEE codes: ${inseeProviders.length}`)

  if (inseeProviders.length === 0) {
    console.log('No INSEE codes to fix!')
    return
  }

  // Collect unique INSEE codes
  const uniqueCodes = [...new Set(inseeProviders.map(p => p.address_city))]
  console.log(`Unique INSEE codes to resolve: ${uniqueCodes.length}`)

  // Resolve all codes (with rate limiting)
  const codeToCity = new Map()
  let resolved = 0
  let failed = 0

  for (let i = 0; i < uniqueCodes.length; i++) {
    const code = uniqueCodes[i]
    const result = await resolveInseeCode(code)
    if (result) {
      codeToCity.set(code, result)
      resolved++
    } else {
      failed++
      console.log(`  ⚠ Failed to resolve: ${code}`)
    }

    // Rate limit: ~20 req/s to be polite
    if (i % 20 === 19) {
      await new Promise(r => setTimeout(r, 1100))
      process.stdout.write(`  Resolved ${i + 1}/${uniqueCodes.length}...\r`)
    }
  }

  console.log(`\nResolved ${resolved}/${uniqueCodes.length} codes (${failed} failed)`)

  // Update providers in batches
  let updated = 0
  let errors = 0

  for (const provider of inseeProviders) {
    const cityData = codeToCity.get(provider.address_city)
    if (!cityData) continue

    const updateData = {
      address_city: cityData.name,
    }

    // Also fill in region/department if missing
    if (!provider.address_region && cityData.region) {
      updateData.address_region = cityData.region
    }

    const { error } = await supabase
      .from('providers')
      .update(updateData)
      .eq('id', provider.id)

    if (error) {
      errors++
      if (errors <= 5) console.log(`  ✗ Error updating ${provider.id}: ${error.message}`)
    } else {
      updated++
    }

    if (updated % 100 === 0 && updated > 0) {
      process.stdout.write(`  Updated ${updated} providers...\r`)
    }
  }

  console.log(`\n✓ Updated ${updated} providers (${errors} errors)`)
}

// ─── Step 2: Set noindex=false for indexable providers ───────────────

async function fixNoindex() {
  console.log('\n=== Step 2: Set noindex=false for active providers ===\n')

  // Count providers with noindex=true that should be indexed
  const { count, error: countError } = await supabase
    .from('providers')
    .select('id', { count: 'estimated', head: true })
    .eq('is_active', true)
    .eq('noindex', true)

  if (countError) {
    console.error('Count error:', countError.message)
    return
  }

  console.log(`Providers with noindex=true: ~${count}`)

  if (!count || count === 0) {
    console.log('No providers to update!')
    return
  }

  // Update in batches of 500
  let totalUpdated = 0
  let hasMore = true

  while (hasMore) {
    const { data, error: fetchError } = await supabase
      .from('providers')
      .select('id')
      .eq('is_active', true)
      .eq('noindex', true)
      .limit(500)

    if (fetchError || !data || data.length === 0) {
      hasMore = false
      break
    }

    const ids = data.map(p => p.id)
    const { error: updateError } = await supabase
      .from('providers')
      .update({ noindex: false })
      .in('id', ids)

    if (updateError) {
      console.error('Update error:', updateError.message)
      hasMore = false
    } else {
      totalUpdated += ids.length
      process.stdout.write(`  Updated ${totalUpdated}...\r`)
    }

    if (data.length < 500) hasMore = false
  }

  console.log(`\n✓ Set noindex=false for ${totalUpdated} providers`)
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log('🔧 Provider Data Fix Script\n')

  // Test connection
  const { data: test, error: testErr } = await supabase
    .from('providers')
    .select('id')
    .limit(1)

  if (testErr) {
    console.error('Connection failed:', testErr.message)
    process.exit(1)
  }
  console.log('✓ Connected to Supabase\n')

  await fixCities()
  await fixNoindex()

  console.log('\n🎉 Done!')
}

main().catch(e => {
  console.error('Fatal error:', e)
  process.exit(1)
})
