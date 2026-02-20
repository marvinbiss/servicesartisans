/**
 * V3: Fix provider address_city using chunked ID-based updates
 *
 * Strategy: For each INSEE code:
 *   1. SELECT id FROM providers WHERE address_city = 'code' LIMIT 200
 *   2. UPDATE providers SET address_city = 'name' WHERE id IN (ids)
 *   3. Repeat until no more
 *
 * This avoids full table scans that timeout on free tier.
 *
 * Usage:
 *   node scripts/fix-provider-cities-v3.mjs 01-19    # departments 01 to 19
 *   node scripts/fix-provider-cities-v3.mjs 20-39    # departments 20 to 39
 *   node scripts/fix-provider-cities-v3.mjs noindex  # only fix noindex flag
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

const RANGE = process.argv[2] || 'all'
const BATCH_SIZE = 200 // Small batches to avoid timeouts
const DELAY_MS = 100 // Delay between batches

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// ─── Download communes from geo.api.gouv.fr ─────────────────────────

async function downloadCommunes() {
  console.log(`[${RANGE}] Downloading communes...`)
  const res = await fetch('https://geo.api.gouv.fr/communes?fields=nom,departement,region&limit=40000')
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const communes = await res.json()

  // Build INSEE code → city info map
  const map = new Map()
  for (const c of communes) {
    map.set(c.code, {
      name: c.nom,
      region: c.region?.nom || null,
      dept: c.departement?.code || null,
    })
  }
  console.log(`[${RANGE}] Loaded ${map.size} communes`)
  return map
}

// ─── Filter codes by department range ────────────────────────────────

function filterByRange(communeMap) {
  if (RANGE === 'all' || RANGE === 'noindex') return communeMap

  const [startStr, endStr] = RANGE.split('-')
  const start = parseInt(startStr, 10)
  const end = parseInt(endStr, 10)

  const filtered = new Map()
  for (const [code, info] of communeMap) {
    const deptCode = info.dept || code.substring(0, 2)

    // Handle Corsica (2A, 2B)
    if (deptCode === '2A' || deptCode === '2B') {
      if (start <= 20 && end >= 20) filtered.set(code, info)
      continue
    }

    // Handle overseas departments (97x)
    const deptNum = parseInt(deptCode, 10)
    if (!isNaN(deptNum) && deptNum >= start && deptNum <= end) {
      filtered.set(code, info)
    }
  }

  console.log(`[${RANGE}] Filtered to ${filtered.size} communes for departments ${RANGE}`)
  return filtered
}

// ─── Fix cities for a single INSEE code (chunked) ───────────────────

async function fixSingleCode(code, cityName, region) {
  let totalFixed = 0
  let attempts = 0
  const MAX_ATTEMPTS = 50 // Safety: max 50 rounds per code (10K providers)

  while (attempts < MAX_ATTEMPTS) {
    attempts++

    // Step 1: Find providers with this INSEE code
    const { data, error: fetchErr } = await supabase
      .from('providers')
      .select('id')
      .eq('address_city', code)
      .limit(BATCH_SIZE)

    if (fetchErr) {
      // Retry once after delay
      await sleep(2000)
      const { data: retry } = await supabase
        .from('providers')
        .select('id')
        .eq('address_city', code)
        .limit(BATCH_SIZE)
      if (!retry || retry.length === 0) break
      // Use retry data
      const ids = retry.map(p => p.id)
      const updateData = { address_city: cityName }
      if (region) updateData.address_region = region
      await supabase.from('providers').update(updateData).in('id', ids)
      totalFixed += ids.length
      await sleep(DELAY_MS)
      continue
    }

    if (!data || data.length === 0) break

    // Step 2: Update by IDs
    const ids = data.map(p => p.id)
    const updateData = { address_city: cityName }
    if (region) updateData.address_region = region

    const { error: updateErr } = await supabase
      .from('providers')
      .update(updateData)
      .in('id', ids)

    if (updateErr) {
      // Split into smaller chunks if even ID-based update times out
      const half = Math.ceil(ids.length / 2)
      const chunk1 = ids.slice(0, half)
      const chunk2 = ids.slice(half)
      await supabase.from('providers').update(updateData).in('id', chunk1)
      await sleep(DELAY_MS)
      await supabase.from('providers').update(updateData).in('id', chunk2)
    }

    totalFixed += ids.length
    await sleep(DELAY_MS)

    // If we got less than BATCH_SIZE, we're done with this code
    if (data.length < BATCH_SIZE) break
  }

  return totalFixed
}

// ─── Fix noindex for active providers ────────────────────────────────

async function fixNoindex() {
  console.log(`[noindex] Setting noindex=false for active providers...`)
  let totalFixed = 0
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabase
      .from('providers')
      .select('id')
      .eq('is_active', true)
      .eq('noindex', true)
      .limit(BATCH_SIZE)

    if (error) {
      await sleep(2000)
      continue
    }

    if (!data || data.length === 0) {
      hasMore = false
      break
    }

    const ids = data.map(p => p.id)
    const { error: updateErr } = await supabase
      .from('providers')
      .update({ noindex: false })
      .in('id', ids)

    if (updateErr) {
      // Split into smaller chunks
      const half = Math.ceil(ids.length / 2)
      await supabase.from('providers').update({ noindex: false }).in('id', ids.slice(0, half))
      await sleep(DELAY_MS)
      await supabase.from('providers').update({ noindex: false }).in('id', ids.slice(half))
    }

    totalFixed += ids.length
    if (totalFixed % 1000 === 0) {
      process.stdout.write(`[noindex] Fixed ${totalFixed} providers...\r`)
    }

    await sleep(DELAY_MS)
    if (data.length < BATCH_SIZE) hasMore = false
  }

  console.log(`\n[noindex] Done: ${totalFixed} providers set to noindex=false`)
  return totalFixed
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log(`=== Provider Fix v3 [${RANGE}] ===\n`)

  // Test connection
  const { error: testErr } = await supabase.from('providers').select('id').limit(1)
  if (testErr) {
    console.error('Connection failed:', testErr.message)
    process.exit(1)
  }
  console.log(`[${RANGE}] Connected to Supabase\n`)

  if (RANGE === 'noindex') {
    await fixNoindex()
    console.log('\nDone!')
    return
  }

  // Download and filter communes
  const allCommunes = await downloadCommunes()
  const communes = filterByRange(allCommunes)

  // Process each commune code
  let totalProviders = 0
  let codesProcessed = 0
  let codesSkipped = 0
  const totalCodes = communes.size
  const startTime = Date.now()

  for (const [code, info] of communes) {
    const fixed = await fixSingleCode(code, info.name, info.region)
    totalProviders += fixed
    codesProcessed++

    if (fixed === 0) {
      codesSkipped++
    }

    if (codesProcessed % 50 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
      console.log(`[${RANGE}] Progress: ${codesProcessed}/${totalCodes} codes | ${totalProviders} providers fixed | ${elapsed}s elapsed`)
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(0)
  console.log(`\n[${RANGE}] COMPLETE: ${codesProcessed} codes processed, ${codesSkipped} empty, ${totalProviders} providers fixed in ${totalTime}s`)

  // Also fix noindex if this is a full run
  if (RANGE === 'all') {
    await fixNoindex()
  }
}

main().catch(e => {
  console.error(`[${RANGE}] Fatal:`, e.message)
  process.exit(1)
})
