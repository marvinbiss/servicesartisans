/**
 * Import unassigned Google Maps phone numbers into the providers table.
 *
 * 3 Iterations:
 *   1. Fuzzy name match within same department + trade (threshold 0.30)
 *   2. Relaxed: dept+city, dept+trade partial, first-word match
 *   3. Aggressive: same dept (first 2 digits), any phoneless provider, sorted by name similarity
 *
 * Usage: npx tsx scripts/import-gm-phones.ts
 */
import * as fs from 'fs'
import * as path from 'path'
import { Client } from 'pg'

const PG_URL = 'postgresql://postgres:BEB6LnGlT6U9bkTe@db.umjmbdbwcsxrvfqktiui.supabase.co:5432/postgres'
const DATA_DIR = path.join(__dirname, '.gm-data')
const FILES = ['gm-listings.jsonl', 'gm-listings-v2.jsonl', 'gm-listings-cities.jsonl']

// ════════════════════════════
// Types
// ════════════════════════════

interface GMRecord {
  gmId: string
  name: string
  phone: string
  trade: string
  deptCode: string
  rating?: number
  reviewCount?: number
  website?: string
  city?: string
}

interface ProviderRow {
  id: string
  name: string
  address_department: string
  address_city: string | null
  specialty: string | null
  phone: string | null
  website: string | null
  rating_average: string | null
  review_count: number | null
}

// ════════════════════════════
// Fuzzy matching (Sørensen–Dice)
// ════════════════════════════

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // remove accents
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function bigrams(s: string): Set<string> {
  const set = new Set<string>()
  const norm = normalize(s)
  for (let i = 0; i < norm.length - 1; i++) {
    set.add(norm.substring(i, i + 2))
  }
  return set
}

function diceSimilarity(a: string, b: string): number {
  const ba = bigrams(a)
  const bb = bigrams(b)
  if (ba.size === 0 && bb.size === 0) return 1
  if (ba.size === 0 || bb.size === 0) return 0
  let intersection = 0
  for (const bi of ba) {
    if (bb.has(bi)) intersection++
  }
  return (2 * intersection) / (ba.size + bb.size)
}

function firstWord(s: string): string {
  const norm = normalize(s)
  // Skip common prefixes like SARL, SAS, EURL, ETS, etc.
  const words = norm.split(' ').filter(w =>
    !['sarl', 'sas', 'sasu', 'eurl', 'eirl', 'ets', 'etablissements',
     'entreprise', 'societe', 'ste', 'atelier', 'les', 'la', 'le', 'l',
     'de', 'du', 'des', 'et', 'pro', 'artisan'].includes(w) && w.length > 1
  )
  return words[0] || ''
}

// Trade mapping: GM trade -> DB specialty values
const TRADE_TO_SPECIALTY: Record<string, string[]> = {
  plombier: ['plombier', 'Plombier'],
  electricien: ['electricien', 'Électricien', 'Electricien'],
  chauffagiste: ['chauffagiste', 'Chauffagiste'],
  menuisier: ['menuisier', 'Menuisier', 'menuisier-metallique'],
  serrurier: ['serrurier', 'Serrurier'],
  couvreur: ['couvreur', 'Couvreur'],
  macon: ['macon', 'Maçon', 'Macon'],
  peintre: ['peintre', 'Peintre en bâtiment', 'Peintre'],
  carreleur: ['carreleur', 'Carreleur'],
  charpentier: ['charpentier', 'Charpentier'],
  platrier: ['platrier', 'Plâtrier', 'Platrier'],
  facade: ['facade', 'Façadier', 'Facadier', 'finition'],
  terrassier: ['terrassier', 'Terrassier'],
}

// ════════════════════════════
// Database connection
// ════════════════════════════

async function connectPg(): Promise<Client> {
  const client = new Client({
    connectionString: PG_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 60000,
  })
  await client.connect()
  await client.query('SET statement_timeout = 0')
  return client
}

// ════════════════════════════
// Load JSONL files
// ════════════════════════════

function loadGMRecords(): Map<string, GMRecord> {
  const phoneMap = new Map<string, GMRecord>()
  for (const file of FILES) {
    const filepath = path.join(DATA_DIR, file)
    if (!fs.existsSync(filepath)) {
      console.log(`  SKIP (not found): ${file}`)
      continue
    }
    const lines = fs.readFileSync(filepath, 'utf-8').trim().split('\n')
    let count = 0
    for (const line of lines) {
      try {
        const obj: GMRecord = JSON.parse(line)
        if (!obj.phone || !obj.name || !obj.deptCode) continue
        const existing = phoneMap.get(obj.phone)
        if (!existing || (obj.city && !existing.city) || (obj.website && !existing.website) || (obj.rating && !existing.rating)) {
          phoneMap.set(obj.phone, { ...existing, ...obj })
        }
        count++
      } catch {}
    }
    console.log(`  ${file}: ${count} valid records`)
  }
  return phoneMap
}

// ════════════════════════════
// MAIN
// ════════════════════════════

async function main() {
  console.log('\n' + '='.repeat(70))
  console.log('  IMPORT GM PHONES — 3-ITERATION MATCHING')
  console.log('='.repeat(70))

  // Step 1: Load GM records
  console.log('\n[1] Loading JSONL files...')
  const gmRecords = loadGMRecords()
  console.log(`  → ${gmRecords.size} unique phones loaded`)

  // Step 2: Connect to DB
  console.log('\n[2] Connecting to database...')
  let client = await connectPg()
  console.log('  → Connected')

  // Step 3: Find phones already in DB
  console.log('\n[3] Checking which phones are already in DB...')
  const allPhones = Array.from(gmRecords.keys())
  const CHUNK = 500
  const existingPhones = new Set<string>()

  for (let i = 0; i < allPhones.length; i += CHUNK) {
    const chunk = allPhones.slice(i, i + CHUNK)
    const placeholders = chunk.map((_, idx) => `$${idx + 1}`).join(',')
    const res = await client.query(
      `SELECT phone FROM providers WHERE phone IN (${placeholders})`,
      chunk
    )
    for (const row of res.rows) {
      existingPhones.add(row.phone)
    }
  }
  console.log(`  → ${existingPhones.size} phones already in providers table`)

  // Filter to only unmatched phones
  const unmatched = new Map<string, GMRecord>()
  for (const [phone, record] of gmRecords) {
    if (!existingPhones.has(phone)) {
      unmatched.set(phone, record)
    }
  }
  console.log(`  → ${unmatched.size} phones NOT yet in DB (candidates for import)`)

  // ══════════════════════════════════════════════════════════════════
  // ITERATION 1: Fuzzy name match within same department + trade
  // ══════════════════════════════════════════════════════════════════

  console.log('\n' + '═'.repeat(70))
  console.log('  ITERATION 1: Department + Trade + Fuzzy Name (threshold 0.30)')
  console.log('═'.repeat(70))

  let matched1 = 0, skipped1 = 0, errors1 = 0
  const remaining = new Map<string, GMRecord>(unmatched)
  const t1 = Date.now()

  // Group unmatched phones by department for batch querying
  const byDept = new Map<string, GMRecord[]>()
  for (const [phone, rec] of remaining) {
    const arr = byDept.get(rec.deptCode) || []
    arr.push(rec)
    byDept.set(rec.deptCode, arr)
  }

  let deptIdx = 0
  const totalDepts = byDept.size
  for (const [dept, records] of byDept) {
    deptIdx++

    // Get all phoneless providers in this department
    const specialties = new Set<string>()
    for (const rec of records) {
      const mapped = TRADE_TO_SPECIALTY[rec.trade] || [rec.trade]
      for (const s of mapped) specialties.add(s)
    }

    const specArr = Array.from(specialties)
    const specPlaceholders = specArr.map((_, i) => `$${i + 2}`).join(',')

    let providers: ProviderRow[]
    try {
      const res = await client.query(
        `SELECT id, name, address_department, address_city, specialty, phone, website, rating_average, review_count
         FROM providers
         WHERE address_department = $1
           AND phone IS NULL
           AND specialty IN (${specPlaceholders})
         LIMIT 10000`,
        [dept, ...specArr]
      )
      providers = res.rows
    } catch (err: any) {
      console.log(`  ERR querying dept ${dept}: ${err.message}`)
      // Reconnect
      try { await client.end() } catch {}
      client = await connectPg()
      continue
    }

    if (providers.length === 0) {
      if (deptIdx % 20 === 0) console.log(`  Dept ${deptIdx}/${totalDepts} (${dept}): 0 phoneless providers`)
      continue
    }

    // For each GM record, find best matching provider
    for (const rec of records) {
      const mapped = TRADE_TO_SPECIALTY[rec.trade] || [rec.trade]
      const candidates = providers.filter(p =>
        p.phone === null && mapped.includes(p.specialty || '')
      )

      let bestScore = 0
      let bestProvider: ProviderRow | null = null

      for (const prov of candidates) {
        const score = diceSimilarity(rec.name, prov.name)
        if (score > bestScore) {
          bestScore = score
          bestProvider = prov
        }
      }

      if (bestProvider && bestScore >= 0.30) {
        try {
          const updates: string[] = ['phone = $1']
          const params: any[] = [rec.phone]
          let paramIdx = 2

          if (rec.website && !bestProvider.website) {
            updates.push(`website = $${paramIdx}`)
            params.push(rec.website.substring(0, 499))
            paramIdx++
          }
          if (rec.rating && (!bestProvider.rating_average || bestProvider.rating_average === '0.00')) {
            updates.push(`rating_average = $${paramIdx}`)
            params.push(rec.rating)
            paramIdx++
          }
          if (rec.reviewCount && rec.reviewCount < 2000000000 && (!bestProvider.review_count || bestProvider.review_count === 0)) {
            updates.push(`review_count = $${paramIdx}`)
            params.push(rec.reviewCount)
            paramIdx++
          }

          params.push(bestProvider.id)
          const res = await client.query(
            `UPDATE providers SET ${updates.join(', ')} WHERE id = $${paramIdx} AND phone IS NULL`,
            params
          )

          if ((res.rowCount || 0) > 0) {
            matched1++
            // Mark provider as taken
            bestProvider.phone = rec.phone
            remaining.delete(rec.phone)
          } else {
            skipped1++
          }
        } catch (err: any) {
          errors1++
          if (errors1 <= 5) console.log(`  ERR updating: ${err.message}`)
          try { await client.end() } catch {}
          client = await connectPg()
        }
      }
    }

    if (deptIdx % 10 === 0 || deptIdx === totalDepts) {
      const elapsed = ((Date.now() - t1) / 1000).toFixed(0)
      console.log(`  Dept ${deptIdx}/${totalDepts} — matched: ${matched1}, skip: ${skipped1}, err: ${errors1} — ${elapsed}s`)
    }
  }

  console.log(`\n  ── ITERATION 1 RESULTS ──`)
  console.log(`  Matched & updated: ${matched1}`)
  console.log(`  Skipped (race):    ${skipped1}`)
  console.log(`  Errors:            ${errors1}`)
  console.log(`  Remaining:         ${remaining.size}`)
  console.log(`  Time:              ${((Date.now() - t1) / 1000).toFixed(0)}s`)

  // ══════════════════════════════════════════════════════════════════
  // ITERATION 2: Relaxed matching — partial name, cross-trade
  // ══════════════════════════════════════════════════════════════════

  console.log('\n' + '═'.repeat(70))
  console.log('  ITERATION 2: Relaxed — First-word match, cross-trade in dept')
  console.log('═'.repeat(70))

  let matched2 = 0, skipped2 = 0, errors2 = 0
  const t2 = Date.now()

  // Re-group remaining by department
  const byDept2 = new Map<string, GMRecord[]>()
  for (const [, rec] of remaining) {
    const arr = byDept2.get(rec.deptCode) || []
    arr.push(rec)
    byDept2.set(rec.deptCode, arr)
  }

  let deptIdx2 = 0
  const totalDepts2 = byDept2.size
  for (const [dept, records] of byDept2) {
    deptIdx2++

    // Get ALL phoneless providers in this department (any specialty)
    let providers: ProviderRow[]
    try {
      const res = await client.query(
        `SELECT id, name, address_department, address_city, specialty, phone, website, rating_average, review_count
         FROM providers
         WHERE address_department = $1
           AND phone IS NULL
         LIMIT 20000`,
        [dept]
      )
      providers = res.rows
    } catch (err: any) {
      console.log(`  ERR querying dept ${dept}: ${err.message}`)
      try { await client.end() } catch {}
      client = await connectPg()
      continue
    }

    if (providers.length === 0) continue

    for (const rec of records) {
      if (!remaining.has(rec.phone)) continue  // already matched in this iteration

      let bestScore = 0
      let bestProvider: ProviderRow | null = null

      // Strategy A: First-word match + same trade
      const gmFirst = firstWord(rec.name)
      if (gmFirst.length >= 3) {
        const mapped = TRADE_TO_SPECIALTY[rec.trade] || [rec.trade]
        for (const prov of providers) {
          if (prov.phone !== null) continue
          if (!mapped.includes(prov.specialty || '')) continue
          const provFirst = firstWord(prov.name)
          if (provFirst === gmFirst) {
            const score = diceSimilarity(rec.name, prov.name)
            if (score > bestScore) {
              bestScore = score
              bestProvider = prov
            }
          }
        }
      }

      // Strategy B: Fuzzy name match across ALL specialties (threshold 0.40)
      if (!bestProvider || bestScore < 0.25) {
        for (const prov of providers) {
          if (prov.phone !== null) continue
          const score = diceSimilarity(rec.name, prov.name)
          if (score > bestScore && score >= 0.40) {
            bestScore = score
            bestProvider = prov
          }
        }
      }

      // Strategy C: If GM record has city name, look for city match + similar name
      if ((!bestProvider || bestScore < 0.25) && rec.city) {
        const cityNorm = normalize(rec.city)
        for (const prov of providers) {
          if (prov.phone !== null) continue
          // Check if provider name contains city name or vice versa
          const provNorm = normalize(prov.name)
          if (provNorm.includes(cityNorm) || cityNorm.includes(provNorm.split(' ')[0])) {
            const score = diceSimilarity(rec.name, prov.name)
            if (score > bestScore) {
              bestScore = score
              bestProvider = prov
            }
          }
        }
      }

      if (bestProvider && bestScore >= 0.20) {
        try {
          const updates: string[] = ['phone = $1']
          const params: any[] = [rec.phone]
          let paramIdx = 2

          if (rec.website && !bestProvider.website) {
            updates.push(`website = $${paramIdx}`)
            params.push(rec.website.substring(0, 499))
            paramIdx++
          }
          if (rec.rating && (!bestProvider.rating_average || bestProvider.rating_average === '0.00')) {
            updates.push(`rating_average = $${paramIdx}`)
            params.push(rec.rating)
            paramIdx++
          }
          if (rec.reviewCount && rec.reviewCount < 2000000000 && (!bestProvider.review_count || bestProvider.review_count === 0)) {
            updates.push(`review_count = $${paramIdx}`)
            params.push(rec.reviewCount)
            paramIdx++
          }

          params.push(bestProvider.id)
          const res = await client.query(
            `UPDATE providers SET ${updates.join(', ')} WHERE id = $${paramIdx} AND phone IS NULL`,
            params
          )

          if ((res.rowCount || 0) > 0) {
            matched2++
            bestProvider.phone = rec.phone
            remaining.delete(rec.phone)
          } else {
            skipped2++
          }
        } catch (err: any) {
          errors2++
          if (errors2 <= 5) console.log(`  ERR updating: ${err.message}`)
          try { await client.end() } catch {}
          client = await connectPg()
        }
      }
    }

    if (deptIdx2 % 10 === 0 || deptIdx2 === totalDepts2) {
      const elapsed = ((Date.now() - t2) / 1000).toFixed(0)
      console.log(`  Dept ${deptIdx2}/${totalDepts2} — matched: ${matched2}, skip: ${skipped2}, err: ${errors2} — ${elapsed}s`)
    }
  }

  console.log(`\n  ── ITERATION 2 RESULTS ──`)
  console.log(`  Matched & updated: ${matched2}`)
  console.log(`  Skipped (race):    ${skipped2}`)
  console.log(`  Errors:            ${errors2}`)
  console.log(`  Remaining:         ${remaining.size}`)
  console.log(`  Time:              ${((Date.now() - t2) / 1000).toFixed(0)}s`)

  // ══════════════════════════════════════════════════════════════════
  // ITERATION 3: Aggressive — any phoneless provider in same dept
  // ══════════════════════════════════════════════════════════════════

  console.log('\n' + '═'.repeat(70))
  console.log('  ITERATION 3: Aggressive — Any phoneless provider in same dept, best name similarity')
  console.log('═'.repeat(70))

  let matched3 = 0, skipped3 = 0, errors3 = 0
  const t3 = Date.now()

  // Re-group remaining by department
  const byDept3 = new Map<string, GMRecord[]>()
  for (const [, rec] of remaining) {
    const arr = byDept3.get(rec.deptCode) || []
    arr.push(rec)
    byDept3.set(rec.deptCode, arr)
  }

  let deptIdx3 = 0
  const totalDepts3 = byDept3.size
  for (const [dept, records] of byDept3) {
    deptIdx3++

    // Get ALL phoneless providers in this department
    let providers: ProviderRow[]
    try {
      const res = await client.query(
        `SELECT id, name, address_department, address_city, specialty, phone, website, rating_average, review_count
         FROM providers
         WHERE address_department = $1
           AND phone IS NULL
         LIMIT 30000`,
        [dept]
      )
      providers = res.rows
    } catch (err: any) {
      console.log(`  ERR querying dept ${dept}: ${err.message}`)
      try { await client.end() } catch {}
      client = await connectPg()
      continue
    }

    if (providers.length === 0) continue

    // Sort GM records by those with best potential matches first
    for (const rec of records) {
      if (!remaining.has(rec.phone)) continue

      // Find the provider with the highest name similarity
      let bestScore = 0
      let bestProvider: ProviderRow | null = null

      for (const prov of providers) {
        if (prov.phone !== null) continue
        const score = diceSimilarity(rec.name, prov.name)
        if (score > bestScore) {
          bestScore = score
          bestProvider = prov
        }
      }

      // Accept any match with score >= 0.10 (very relaxed)
      if (bestProvider && bestScore >= 0.10) {
        try {
          const updates: string[] = ['phone = $1']
          const params: any[] = [rec.phone]
          let paramIdx = 2

          if (rec.website && !bestProvider.website) {
            updates.push(`website = $${paramIdx}`)
            params.push(rec.website.substring(0, 499))
            paramIdx++
          }
          if (rec.rating && (!bestProvider.rating_average || bestProvider.rating_average === '0.00')) {
            updates.push(`rating_average = $${paramIdx}`)
            params.push(rec.rating)
            paramIdx++
          }
          if (rec.reviewCount && rec.reviewCount < 2000000000 && (!bestProvider.review_count || bestProvider.review_count === 0)) {
            updates.push(`review_count = $${paramIdx}`)
            params.push(rec.reviewCount)
            paramIdx++
          }

          params.push(bestProvider.id)
          const res = await client.query(
            `UPDATE providers SET ${updates.join(', ')} WHERE id = $${paramIdx} AND phone IS NULL`,
            params
          )

          if ((res.rowCount || 0) > 0) {
            matched3++
            bestProvider.phone = rec.phone
            remaining.delete(rec.phone)
          } else {
            skipped3++
          }
        } catch (err: any) {
          errors3++
          if (errors3 <= 5) console.log(`  ERR updating: ${err.message}`)
          try { await client.end() } catch {}
          client = await connectPg()
        }
      }
    }

    if (deptIdx3 % 10 === 0 || deptIdx3 === totalDepts3) {
      const elapsed = ((Date.now() - t3) / 1000).toFixed(0)
      console.log(`  Dept ${deptIdx3}/${totalDepts3} — matched: ${matched3}, skip: ${skipped3}, err: ${errors3} — ${elapsed}s`)
    }
  }

  console.log(`\n  ── ITERATION 3 RESULTS ──`)
  console.log(`  Matched & updated: ${matched3}`)
  console.log(`  Skipped (race):    ${skipped3}`)
  console.log(`  Errors:            ${errors3}`)
  console.log(`  Remaining:         ${remaining.size}`)
  console.log(`  Time:              ${((Date.now() - t3) / 1000).toFixed(0)}s`)

  // ══════════════════════════════════════════════════════════════════
  // FINAL SUMMARY
  // ══════════════════════════════════════════════════════════════════

  try { await client.end() } catch {}

  const totalMatched = matched1 + matched2 + matched3
  const totalTime = ((Date.now() - t1) / 1000).toFixed(0)

  console.log('\n' + '='.repeat(70))
  console.log('  FINAL SUMMARY')
  console.log('='.repeat(70))
  console.log(`  Total phones in JSONL:       ${gmRecords.size}`)
  console.log(`  Already in DB:               ${existingPhones.size}`)
  console.log(`  Candidates for import:       ${unmatched.size}`)
  console.log(`  ─────────────────────────────`)
  console.log(`  Iteration 1 (name+trade):    ${matched1}`)
  console.log(`  Iteration 2 (relaxed):       ${matched2}`)
  console.log(`  Iteration 3 (aggressive):    ${matched3}`)
  console.log(`  ─────────────────────────────`)
  console.log(`  TOTAL IMPORTED:              ${totalMatched}`)
  console.log(`  Still unmatched:             ${remaining.size}`)
  console.log(`  Total time:                  ${totalTime}s`)
  console.log('='.repeat(70) + '\n')
}

main().catch(err => {
  console.error('FATAL ERROR:', err)
  process.exit(1)
})
