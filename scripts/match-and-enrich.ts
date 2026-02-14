/**
 * MATCH & ENRICH — Méthode worldclass 2026
 *
 * Zéro fichier intermédiaire. Tout en mémoire, 1 seul pass.
 * Pour chaque département :
 *   1. SELECT artisans FROM Postgres (WHERE phone IS NULL)
 *   2. Match contre PJ listings en mémoire
 *   3. UPDATE résultats immédiatement
 *
 * 4 workers parallèles, chacun ~25 départements.
 * Matching algo V3 (multi-mots, acronymes, CP, voisins).
 */
import * as fs from 'fs'
import * as path from 'path'
import { Client } from 'pg'

const PG_URL = 'postgresql://postgres:BEB6LnGlT6U9bkTe@db.umjmbdbwcsxrvfqktiui.supabase.co:5432/postgres'
const PJ_FILE = path.join(__dirname, '.enrich-data', 'pj-listings.jsonl')
const GM_FILE = path.join(__dirname, '.gm-data', 'gm-listings.jsonl')
const WORKERS = 4
const MATCH_THRESHOLD = 0.35

const DEPTS = [
  '01','02','03','04','05','06','07','08','09','10',
  '11','12','13','14','15','16','17','18','19','2A','2B',
  '21','22','23','24','25','26','27','28','29',
  '30','31','32','33','34','35','36','37','38','39',
  '40','41','42','43','44','45','46','47','48','49',
  '50','51','52','53','54','55','56','57','58','59',
  '60','61','62','63','64','65','66','67','68','69',
  '70','71','72','73','74','75','76','77','78','79',
  '80','81','82','83','84','85','86','87','88','89',
  '90','91','92','93','94','95',
  '971','972','973','974','976',
]

// ═══════════════════════════════════════════════
// MATCHING ENGINE (from V3 — optimized)
// ═══════════════════════════════════════════════

const LEGAL_FORMS = /\b(sarl|sas|sasu|eurl|sa|sci|scp|snc|earl|eirl|auto[- ]?entrepreneur|ei|ste|societe|entreprise|ets|etablissements?|cabinet|agence|groupe|holding|international|france|services?|batiment|btp|construction|renovation|travaux|habitat|maison|concept|solutions?|multi[- ]?services?|general[e]?|artisan(ale)?)\b/gi

function normalize(name: string): string {
  return name
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(LEGAL_FORMS, ' ')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractTokens(name: string): string[] {
  return normalize(name).split(' ').filter(t => t.length >= 2)
}

function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length
  if (Math.abs(a.length - b.length) > 3) return Math.max(a.length, b.length)
  const matrix: number[][] = []
  for (let i = 0; i <= b.length; i++) matrix[i] = [i]
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost)
    }
  }
  return matrix[b.length][a.length]
}

function tokenSimilarity(tokA: string[], tokB: string[]): number {
  if (tokA.length === 0 || tokB.length === 0) return 0
  const longer = tokA.length >= tokB.length ? tokA : tokB
  const shorter = tokA.length < tokB.length ? tokA : tokB
  let matched = 0
  const used = new Set<number>()

  // Pass 1: exact
  for (const t of shorter) {
    const idx = longer.findIndex((l, i) => !used.has(i) && l === t)
    if (idx >= 0) { matched++; used.add(idx) }
  }
  // Pass 2: fuzzy
  for (const t of shorter) {
    if (longer.some((l, i) => !used.has(i) && l === t)) continue
    const idx = longer.findIndex((l, i) => !used.has(i) && t.length >= 3 && l.length >= 3 && levenshtein(t, l) <= 1)
    if (idx >= 0) { matched += 0.8; used.add(idx) }
  }
  // Pass 3: substring
  for (const t of shorter) {
    if (longer.some((l, i) => !used.has(i) && l === t)) continue
    const idx = longer.findIndex((l, i) => !used.has(i) && t.length >= 4 && l.length >= 4 && (l.includes(t) || t.includes(l)))
    if (idx >= 0) { matched += 0.6; used.add(idx) }
  }

  return matched / Math.max(longer.length, 1)
}

function makeAcronym(tokens: string[]): string {
  return tokens.filter(t => t.length >= 2).map(t => t[0]).join('')
}

function nameSimilarity(pjName: string, artName: string): number {
  const pjTok = extractTokens(pjName)
  const artTok = extractTokens(artName)
  if (pjTok.length === 0 || artTok.length === 0) return 0

  let score = tokenSimilarity(pjTok, artTok)

  // Acronym bonus
  const pjAcr = makeAcronym(pjTok)
  const artAcr = makeAcronym(artTok)
  const pjNorm = normalize(pjName).replace(/\s/g, '')
  const artNorm = normalize(artName).replace(/\s/g, '')
  if (pjAcr.length >= 2 && (artNorm.includes(pjAcr) || pjAcr === artAcr)) score += 0.15
  if (artAcr.length >= 2 && (pjNorm.includes(artAcr) || artAcr === pjAcr)) score += 0.15

  // Distinctive word bonus
  const distinctive = pjTok.filter(t => t.length >= 5)
  for (const d of distinctive) {
    if (artTok.some(a => a === d || (a.length >= 4 && d.length >= 4 && levenshtein(a, d) <= 1))) {
      score += 0.1
      break
    }
  }

  return Math.min(score, 1)
}

// ═══════════════════════════════════════════════
// LOAD LISTINGS (PJ + Google Maps)
// ═══════════════════════════════════════════════

interface Listing {
  name: string
  phone: string
  cp?: string
  dept?: string
  city?: string
  source: 'pj' | 'gm'
}

function loadListings(): Map<string, Listing[]> {
  const byDept = new Map<string, Listing[]>()

  // PJ listings
  if (fs.existsSync(PJ_FILE)) {
    const lines = fs.readFileSync(PJ_FILE, 'utf-8').trim().split('\n')
    for (const line of lines) {
      try {
        const obj = JSON.parse(line)
        if (!obj.phone || !obj.name) continue
        const phone = obj.phone.replace(/\D/g, '')
        if (phone.length < 10) continue
        const dept = obj.deptCode || obj.dept || obj.postalCode?.slice(0, 2) || ''
        if (!dept) continue
        const cp = obj.postalCode || obj.cp || ''
        const listing: Listing = { name: obj.name, phone, cp, dept, city: obj.city, source: 'pj' }
        if (!byDept.has(dept)) byDept.set(dept, [])
        byDept.get(dept)!.push(listing)
      } catch {}
    }
  }

  // Google Maps listings
  if (fs.existsSync(GM_FILE)) {
    const lines = fs.readFileSync(GM_FILE, 'utf-8').trim().split('\n')
    for (const line of lines) {
      try {
        const obj = JSON.parse(line)
        if (!obj.phone || !obj.name) continue
        const phone = obj.phone.replace(/\D/g, '')
        if (phone.length < 10) continue
        // GM listings — extract dept from postalCode if available
        const cp = obj.postalCode || obj.postal_code || ''
        const dept = obj.deptCode || obj.dept || obj.department || (cp.length >= 2 ? cp.slice(0, 2) : '')
        const listing: Listing = { name: obj.name, phone, cp, dept, city: obj.city, source: 'gm' }
        if (dept) {
          if (!byDept.has(dept)) byDept.set(dept, [])
          byDept.get(dept)!.push(listing)
        } else {
          // No dept — add to a special "unknown" bucket, match against all
          if (!byDept.has('XX')) byDept.set('XX', [])
          byDept.get('XX')!.push(listing)
        }
      } catch {}
    }
  }

  return byDept
}

// ═══════════════════════════════════════════════
// WORKER — export + match + upload per dept
// ═══════════════════════════════════════════════

interface MatchResult {
  artisanId: string
  phone: string
  score: number
  source: string
}

async function workerFn(
  workerId: number,
  depts: string[],
  listingsByDept: Map<string, Listing[]>
): Promise<{ matched: number; updated: number; artisansScanned: number; errors: number }> {
  const client = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 60000 })
  await client.connect()
  await client.query('SET statement_timeout = 0')

  let matched = 0, updated = 0, artisansScanned = 0, errors = 0
  const usedPhones = new Set<string>()
  const usedArtisans = new Set<string>()
  const t0 = Date.now()

  for (const dept of depts) {
    // Get listings for this dept
    const listings = listingsByDept.get(dept) || []
    if (listings.length === 0) continue

    // Build listing index by CP prefix
    const listingsByCp = new Map<string, Listing[]>()
    for (const l of listings) {
      const cp = l.cp || ''
      if (!listingsByCp.has(cp)) listingsByCp.set(cp, [])
      listingsByCp.get(cp)!.push(l)
    }

    // Fetch artisans without phone for this dept
    try {
      const result = await client.query(
        `SELECT id, name, phone, address_postal_code as cp, address_city as city, is_active
         FROM providers
         WHERE address_department = $1`,
        [dept]
      )
      const artisans = result.rows.filter((r: any) => r.is_active && !r.phone)
      artisansScanned += artisans.length

      // Match each artisan against listings
      const deptMatches: MatchResult[] = []

      for (const art of artisans) {
        if (usedArtisans.has(art.id)) continue
        let bestMatch: MatchResult | null = null
        let bestScore = 0

        // Check listings with same CP first, then all dept listings
        const candidates = [
          ...(listingsByCp.get(art.cp) || []),
          ...listings
        ]
        const seen = new Set<string>()

        for (const listing of candidates) {
          if (seen.has(listing.phone)) continue
          seen.add(listing.phone)
          if (usedPhones.has(listing.phone)) continue

          let score = nameSimilarity(listing.name, art.name)
          // CP match bonus
          if (art.cp && listing.cp && art.cp === listing.cp) score += 0.15

          if (score >= MATCH_THRESHOLD && score > bestScore) {
            bestScore = score
            bestMatch = { artisanId: art.id, phone: listing.phone, score, source: listing.source }
          }
        }

        if (bestMatch) {
          deptMatches.push(bestMatch)
          usedPhones.add(bestMatch.phone)
          usedArtisans.add(art.id)
        }
      }

      matched += deptMatches.length

      // Immediate UPDATE for this dept's matches
      for (const m of deptMatches) {
        try {
          const res = await client.query(
            'UPDATE providers SET phone = $1 WHERE id = $2 AND phone IS NULL',
            [m.phone, m.artisanId]
          )
          if ((res.rowCount || 0) > 0) updated++
        } catch {
          errors++
        }
      }

    } catch (err: any) {
      // If SELECT fails, try to reconnect
      errors++
      if (errors <= 3) console.log(`  W${workerId} err dept ${dept}: ${err.message}`)
      try {
        await client.end()
        const newC = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 60000 })
        await newC.connect()
        await newC.query('SET statement_timeout = 0')
        Object.assign(client, newC)
      } catch {}
    }

    // Progress every dept
    const doneCount = depts.indexOf(dept) + 1
    if (true) {
      const elapsed = ((Date.now() - t0) / 1000).toFixed(0)
      console.log(`  W${workerId}: ${doneCount}/${depts.length} depts — ${artisansScanned} artisans — ${matched} matches — ${updated} MAJ — ${elapsed}s`)
    }
  }

  try { await client.end() } catch {}
  return { matched, updated, artisansScanned, errors }
}

// ═══════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════

async function main() {
  console.log('\n════════════════════════════════════════════════════════════')
  console.log('  MATCH & ENRICH — Worldclass 2026')
  console.log('  Zéro export, zéro fichier. Stream direct DB → Match → Update.')
  console.log('════════════════════════════════════════════════════════════')

  // Load all listings into memory
  console.log('\n  Chargement des listings...')
  const listingsByDept = loadListings()
  let totalListings = 0
  for (const [, v] of listingsByDept) totalListings += v.length
  console.log(`  ${totalListings} listings chargés (PJ + Google Maps)`)
  console.log(`  ${listingsByDept.size} départements couverts`)

  // --test mode: 5 big depts, 1 worker
  const args = process.argv.slice(2)
  const testMode = args.includes('--test')
  const activeDepts = testMode ? ['01', '02', '03', '04', '05'] : DEPTS
  const activeWorkers = testMode ? 1 : WORKERS

  // Split departments across workers
  const chunkSize = Math.ceil(activeDepts.length / activeWorkers)
  const chunks = Array.from({ length: activeWorkers }, (_, i) => activeDepts.slice(i * chunkSize, (i + 1) * chunkSize))

  console.log(`  ${testMode ? 'MODE TEST — 5 départements' : `${activeWorkers} workers × ~${chunkSize} départements`}\n`)

  const t0 = Date.now()
  const results = await Promise.all(
    chunks.map((depts, i) => workerFn(i + 1, depts, listingsByDept))
  )

  const totals = results.reduce((acc, r) => ({
    matched: acc.matched + r.matched,
    updated: acc.updated + r.updated,
    artisansScanned: acc.artisansScanned + r.artisansScanned,
    errors: acc.errors + r.errors,
  }), { matched: 0, updated: 0, artisansScanned: 0, errors: 0 })

  const elapsed = ((Date.now() - t0) / 1000).toFixed(0)

  console.log(`\n  ══════════════ RÉSULTAT ══════════════`)
  console.log(`  ${totals.artisansScanned} artisans sans tél scannés`)
  console.log(`  ${totals.matched} nouveaux matches trouvés`)
  console.log(`  ${totals.updated} artisans enrichis dans Supabase`)
  console.log(`  ${totals.errors} erreurs`)
  console.log(`  Temps total: ${elapsed}s`)
  console.log(`  ══════════════════════════════════════\n`)
}

main().catch(err => { console.error('Erreur fatale:', err); process.exit(1) })
