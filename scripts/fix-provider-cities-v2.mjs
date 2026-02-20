/**
 * V2: Fix ALL 743K+ providers' address_city using batch UPDATE by INSEE code
 * Strategy: UPDATE providers SET address_city = 'Paris' WHERE address_city = '75056'
 * One query per commune = ~35K queries instead of 743K individual updates
 *
 * Also: set noindex=false for all active providers (batch)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL = 'https://umjmbdbwcsxrvfqktiui.supabase.co'
let serviceKey
try {
  const envContent = readFileSync('.env.local', 'utf-8')
  const match = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)
  serviceKey = match[1].trim()
} catch {
  console.error('Cannot read .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─── Step 1: Download ALL French communes from geo.api.gouv.fr ──────

async function downloadAllCommunes() {
  console.log('Downloading all French communes...')
  const res = await fetch('https://geo.api.gouv.fr/communes?fields=nom,departement,region&limit=40000')
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const communes = await res.json()
  console.log(`Downloaded ${communes.length} communes`)

  // Build INSEE code → city name map
  const map = new Map()
  for (const c of communes) {
    map.set(c.code, {
      name: c.nom,
      region: c.region?.nom || null,
    })
  }
  return map
}

// ─── Step 2: Get all unique INSEE codes in providers ────────────────

async function getUniqueInseeCodes() {
  console.log('Fetching unique INSEE codes from providers...')
  const codes = new Set()
  let offset = 0
  const PAGE = 1000

  while (true) {
    const { data, error } = await supabase
      .from('providers')
      .select('address_city')
      .eq('is_active', true)
      .range(offset, offset + PAGE - 1)

    if (error) {
      console.log(`  Fetch error at offset ${offset}: ${error.message}`)
      // On timeout, retry once after delay
      await new Promise(r => setTimeout(r, 2000))
      const { data: retry } = await supabase
        .from('providers')
        .select('address_city')
        .eq('is_active', true)
        .range(offset, offset + PAGE - 1)
      if (!retry || retry.length === 0) break
      for (const p of retry) {
        const city = p.address_city || ''
        if (/^\d{4,5}$/.test(city) || /^[0-9][A-Z0-9]\d{3}$/.test(city)) {
          codes.add(city)
        }
      }
      offset += PAGE
      continue
    }
    if (!data || data.length === 0) break

    for (const p of data) {
      const city = p.address_city || ''
      if (/^\d{4,5}$/.test(city) || /^[0-9][A-Z0-9]\d{3}$/.test(city)) {
        codes.add(city)
      }
    }

    offset += PAGE
    if (offset % 10000 === 0) process.stdout.write(`  Scanned ${offset} providers...\r`)
    if (data.length < PAGE) break
  }

  console.log(`\nFound ${codes.size} unique INSEE codes across ~${offset} providers`)
  return codes
}

// ─── Step 3: Batch UPDATE by INSEE code ─────────────────────────────

async function batchUpdateCities(communeMap, inseeCodes) {
  console.log('\nBatch updating providers by INSEE code...')
  let updated = 0
  let skipped = 0
  let errors = 0
  const total = inseeCodes.size

  for (const code of inseeCodes) {
    const commune = communeMap.get(code)
    if (!commune) {
      skipped++
      continue
    }

    const updateData = { address_city: commune.name }
    if (commune.region) updateData.address_region = commune.region

    // This single query updates ALL providers with this INSEE code
    const { error } = await supabase
      .from('providers')
      .update(updateData)
      .eq('address_city', code)

    if (error) {
      errors++
      if (errors <= 5) console.log(`  Error for ${code} (${commune.name}): ${error.message}`)
      // Retry after delay
      await new Promise(r => setTimeout(r, 1000))
      await supabase.from('providers').update(updateData).eq('address_city', code)
    } else {
      updated++
    }

    if (updated % 100 === 0 && updated > 0) {
      process.stdout.write(`  Updated ${updated}/${total} communes...\r`)
    }
  }

  console.log(`\nDone: ${updated} communes updated, ${skipped} not found in API, ${errors} errors`)
}

// ─── Step 4: Set noindex=false for all active providers ─────────────

async function fixNoindex() {
  console.log('\nSetting noindex=false for active providers...')

  let totalUpdated = 0
  let hasMore = true

  while (hasMore) {
    // Batch update 500 at a time
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
      console.log(`  Update error: ${updateError.message}`)
      await new Promise(r => setTimeout(r, 2000))
      // Retry
      await supabase.from('providers').update({ noindex: false }).in('id', ids)
    }

    totalUpdated += ids.length
    process.stdout.write(`  Set noindex=false for ${totalUpdated} providers...\r`)

    if (data.length < 500) hasMore = false
  }

  console.log(`\nDone: ${totalUpdated} providers set to noindex=false`)
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Provider City Fix v2 (Batch) ===\n')

  // Test connection
  const { error: testErr } = await supabase.from('providers').select('id').limit(1)
  if (testErr) {
    console.error('Connection failed:', testErr.message)
    process.exit(1)
  }
  console.log('Connected to Supabase\n')

  // Download communes reference data
  const communeMap = await downloadAllCommunes()

  // Get unique INSEE codes from DB
  const inseeCodes = await getUniqueInseeCodes()

  // Batch update
  await batchUpdateCities(communeMap, inseeCodes)

  // Fix noindex
  await fixNoindex()

  console.log('\nAll done!')
}

main().catch(e => {
  console.error('Fatal:', e.message)
  process.exit(1)
})
