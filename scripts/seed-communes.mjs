/**
 * Seed script: insert all 34,969 French communes from insee-communes.json
 * into the Supabase `communes` table.
 *
 * Cross-references france.ts villes (2,280) for code_postal & population.
 * Uses departements list for departement_name mapping.
 *
 * Usage: node scripts/seed-communes.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  // Fallback: read from .env.local
  const envContent = readFileSync('.env.local', 'utf8')
  const getEnv = (key) => {
    const match = envContent.match(new RegExp(`^${key}=(.+)$`, 'm'))
    return match ? match[1].trim() : null
  }
  var url = getEnv('NEXT_PUBLIC_SUPABASE_URL')
  var key = getEnv('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) {
    console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY')
    process.exit(1)
  }
  var sb = createClient(url, key)
} else {
  var sb = createClient(SUPABASE_URL, SUPABASE_KEY)
}

// ---------------------------------------------------------------------------
// Load data sources
// ---------------------------------------------------------------------------
const insee = JSON.parse(readFileSync('src/lib/data/insee-communes.json', 'utf8'))
const franceTsContent = readFileSync('src/lib/data/france.ts', 'utf8')

// ---------------------------------------------------------------------------
// Parse departements from france.ts for dept_code → dept_name mapping
// ---------------------------------------------------------------------------
const deptNameMap = {}
const deptRegex = /\{\s*code:\s*'([^']+)',\s*slug:\s*'[^']+',\s*name:\s*'([^']+)'/g
let dm
while ((dm = deptRegex.exec(franceTsContent)) !== null) {
  deptNameMap[dm[1]] = dm[2]
}
console.log(`Departement name mapping: ${Object.keys(deptNameMap).length} depts`)

// ---------------------------------------------------------------------------
// Parse villes from france.ts for code_postal & population enrichment
// ---------------------------------------------------------------------------
function slugify(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['']/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const villeMap = {} // slug → { codePostal, population }
// Match ville entries: slug, name, ..., population, codePostal
const villeRegex = /slug:\s*'([^']+)',\s*name:\s*'[^']+',[\s\S]*?population:\s*'([^']+)',\s*codePostal:\s*'([^']+)'/g
let vm
while ((vm = villeRegex.exec(franceTsContent)) !== null) {
  const pop = parseInt(vm[2].replace(/\s/g, ''), 10) || 0
  villeMap[vm[1]] = { codePostal: vm[3], population: pop }
}
console.log(`France.ts villes enrichment: ${Object.keys(villeMap).length} villes with code_postal & population`)

// ---------------------------------------------------------------------------
// Build rows — two-pass: group by slug, then assign bare slug to most populous
// ---------------------------------------------------------------------------

// Pass 1: group all entries by base slug
const slugGroups = new Map() // baseSlug → [{ code, data, name }]
for (const [codeInsee, data] of Object.entries(insee)) {
  const name = data.n
  const baseSlug = slugify(name)
  if (!slugGroups.has(baseSlug)) slugGroups.set(baseSlug, [])
  slugGroups.get(baseSlug).push({ code: codeInsee, data, name })
}

// Build france.ts dept lookup: slug → departementCode (to match bare slug to correct commune)
const franceDeptMap = {}
const franceDeptRegex = /slug:\s*'([^']+)',\s*name:\s*'[^']+',\s*region:\s*'[^']+',\s*departement:\s*'[^']+',\s*departementCode:\s*'([^']+)'/g
let fdm
while ((fdm = franceDeptRegex.exec(franceTsContent)) !== null) {
  franceDeptMap[fdm[1]] = fdm[2]
}
console.log(`France.ts dept mapping: ${Object.keys(franceDeptMap).length} villes with departementCode`)

// Pass 2: for each group, assign bare slug to the commune matching france.ts
const rows = []
const seenSlugs = new Set()

for (const [baseSlug, entries] of slugGroups) {
  if (entries.length === 1) {
    // Unique slug — use as-is
    const e = entries[0]
    seenSlugs.add(baseSlug)
    rows.push(buildRow(e.code, e.data, e.name, baseSlug))
  } else {
    // Duplicate slug — pick which entry gets the bare slug:
    // 1. If france.ts defines this slug, match by departementCode
    // 2. Otherwise, pick the entry with the largest population (from villeMap)
    // 3. Fallback: first entry alphabetically by dept code
    let bareIdx = 0
    const franceDept = franceDeptMap[baseSlug]
    if (franceDept) {
      const idx = entries.findIndex(e => e.data.d === franceDept)
      if (idx >= 0) bareIdx = idx
    }

    for (let i = 0; i < entries.length; i++) {
      const e = entries[i]
      if (i === bareIdx) {
        seenSlugs.add(baseSlug)
        rows.push(buildRow(e.code, e.data, e.name, baseSlug))
      } else {
        const deptSlug = `${baseSlug}-${e.data.d.toLowerCase()}`
        if (seenSlugs.has(deptSlug)) {
          const inseeSlug = `${baseSlug}-${e.code}`
          seenSlugs.add(inseeSlug)
          rows.push(buildRow(e.code, e.data, e.name, inseeSlug))
        } else {
          seenSlugs.add(deptSlug)
          rows.push(buildRow(e.code, e.data, e.name, deptSlug))
        }
      }
    }
  }
}

function buildRow(codeInsee, data, name, slug) {
  const enrichment = villeMap[slug] || {}
  return {
    code_insee: codeInsee,
    name,
    slug,
    departement_code: data.d,
    departement_name: deptNameMap[data.d] || null,
    region_name: data.r || null,
    code_postal: enrichment.codePostal || null,
    population: enrichment.population || 0,
    is_active: true,
  }
}

console.log(`\nTotal rows to insert: ${rows.length}`)
console.log(`  - With code_postal: ${rows.filter(r => r.code_postal).length}`)
console.log(`  - With population > 0: ${rows.filter(r => r.population > 0).length}`)
console.log(`  - Duplicate slugs resolved: ${rows.length - new Set(rows.map(r => r.slug)).size === 0 ? 'all unique ✓' : 'DUPLICATES REMAIN ✗'}`)

// ---------------------------------------------------------------------------
// Count before
// ---------------------------------------------------------------------------
const { count: countBefore } = await sb.from('communes').select('*', { count: 'exact', head: true })
console.log(`\n--- BEFORE: ${countBefore} communes in DB ---`)

// ---------------------------------------------------------------------------
// Insert in batches (Supabase limit: ~1000 rows per request)
// ---------------------------------------------------------------------------
const BATCH_SIZE = 500
let inserted = 0
let errors = 0

for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE)
  const { error } = await sb.from('communes').upsert(batch, { onConflict: 'code_insee' })

  if (error) {
    console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} error:`, error.message)
    errors++
    // Log the first problematic row for debugging
    if (batch.length > 0) {
      console.error('  First row in batch:', JSON.stringify(batch[0]))
    }
  } else {
    inserted += batch.length
  }

  // Progress
  if ((i / BATCH_SIZE) % 10 === 0) {
    process.stdout.write(`  Inserted ${inserted}/${rows.length}...\r`)
  }
}

console.log(`\nInsertion complete: ${inserted} inserted, ${errors} batch errors`)

// ---------------------------------------------------------------------------
// Count after
// ---------------------------------------------------------------------------
const { count: countAfter } = await sb.from('communes').select('*', { count: 'exact', head: true })
console.log(`\n--- AFTER: ${countAfter} communes in DB ---`)
console.log(`\n✓ Delta: +${countAfter - countBefore} communes`)
