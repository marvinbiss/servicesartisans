/**
 * MEGA ENRICHMENT — Search each artisan by name on Google
 *
 * Instead of "plombier Nice" (10 generic results), search:
 *   "SARL DUPONT PLOMBERIE Nice telephone"
 * → Google Knowledge Panel shows phone, website, rating directly
 *
 * Cost: 5 ScraperAPI credits/search (Google Search, no render)
 * Target: 688k artisans without phone
 *
 * Features:
 *   - 10+ concurrent workers with progressive scaling
 *   - Resume support (saves progress per department)
 *   - Parses Knowledge Panel, Local Pack, organic results
 *   - Extracts phone, website, rating, review count
 *   - Real-time DB updates
 *   - Rate limiting & error handling
 *
 * Usage: npx tsx scripts/enrich-by-name.ts [--resume] [--max-workers N] [--dept XX]
 */
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { Pool as PgPool } from 'pg'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

// ════════════════════════════
// CONFIG
// ════════════════════════════

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY
const PG_URL = 'postgresql://postgres:BEB6LnGlT6U9bkTe@db.umjmbdbwcsxrvfqktiui.supabase.co:5432/postgres'

const DATA_DIR = path.join(__dirname, '.gm-data')
let PROGRESS_FILE = path.join(DATA_DIR, 'enrich-by-name-progress.json')
const LOG_FILE = path.join(DATA_DIR, 'enrich-by-name.jsonl')

const INITIAL_WORKERS = 3
const DEFAULT_MAX_WORKERS = 20
const SCALE_INTERVAL_MS = 45_000     // Add 1 worker every 45s
const DELAY_BETWEEN_SEARCHES_MS = 400 // Per worker delay
const SCRAPER_TIMEOUT_MS = 30_000
const MAX_RETRIES = 2
const BATCH_SIZE = 500               // Load artisans in batches from DB
const SAVE_EVERY = 50                // Save progress every N artisans

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

// ════════════════════════════
// ARGS
// ════════════════════════════

const args = process.argv.slice(2)
const RESUME = args.includes('--resume')
const MAX_WORKERS = (() => {
  const idx = args.indexOf('--max-workers')
  return idx >= 0 ? parseInt(args[idx + 1]) || DEFAULT_MAX_WORKERS : DEFAULT_MAX_WORKERS
})()
const ONLY_DEPT = (() => {
  const idx = args.indexOf('--dept')
  return idx >= 0 ? args[idx + 1] : null
})()
const MULTI_DEPTS = (() => {
  const idx = args.indexOf('--depts')
  return idx >= 0 ? args[idx + 1].split(',') : null
})()
const INSTANCE_ID = (() => {
  const idx = args.indexOf('--instance')
  return idx >= 0 ? args[idx + 1] : null
})()

// Override progress file for multi-instance runs
if (INSTANCE_ID) {
  PROGRESS_FILE = path.join(DATA_DIR, `enrich-by-name-progress-${INSTANCE_ID}.json`)
}

// ════════════════════════════
// DEPARTMENTS (ordered by artisan density for best ROI)
// ════════════════════════════

const DEPARTEMENTS = [
  '06','31','34','75','33','83','67','30','69','93','42','44','74','95',
  '13','59','38','66','84','57','51','63','68','35','64','45','37','14',
  '76','49','56','29','62','54','22','72','50','17','86','87','71','73',
  '61','88','27','28','91','92','94','77','78','82','81','85','79','32',
  '46','47','48','43','39','40','41','15','19','36','18','70','52','55',
  '60','58','65','89','90','01','02','03','04','05','07','08','09','10',
  '11','12','16','20','21','23','24','25','26','53','2A','2B',
]

// ════════════════════════════
// TYPES
// ════════════════════════════

interface Artisan {
  id: string
  name: string
  address_city: string | null
  address_department: string | null
  address_postal_code: string | null
  specialty: string | null
  phone: string | null
  website: string | null
  rating_average: number | null
  review_count: number | null
}

interface EnrichResult {
  phone?: string
  website?: string
  rating?: number
  reviewCount?: number
  source: string
}

// ════════════════════════════
// STATE
// ════════════════════════════

let shuttingDown = false
const startTime = Date.now()

const stats = {
  artisansProcessed: 0,
  artisansTotal: 0,
  newPhones: 0,
  newWebsites: 0,
  newRatings: 0,
  noResults: 0,
  errors: 0,
  apiCredits: 0,
  activeWorkers: 0,
  maxWorkers: 0,
}

// Track which artisans have been processed this run
const processedIds = new Set<string>()

// ════════════════════════════
// HELPERS
// ════════════════════════════

function sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)) }
function fmt(n: number): string { return n.toLocaleString('fr-FR') }
function elapsed(): string {
  const s = Math.floor((Date.now() - startTime) / 1000)
  const m = Math.floor(s / 60); const h = Math.floor(m / 60)
  return h > 0 ? `${h}h${m % 60}m` : `${m}m${s % 60}s`
}

function normalizePhone(raw: string): string | null {
  if (!raw) return null
  let c = raw.replace(/[^\d+]/g, '')
  if (c.startsWith('+33')) c = '0' + c.substring(3)
  if (c.startsWith('0033')) c = '0' + c.substring(4)
  if (!/^0[1-9]\d{8}$/.test(c)) return null
  if (c.startsWith('089') || c.startsWith('036')) return null
  return c
}

function normalizeWebsite(raw: string): string | null {
  if (!raw) return null
  let u = raw.trim()
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u
  try {
    const url = new URL(u)
    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    // Skip social media & directory pages
    if (/facebook\.com|instagram\.com|linkedin\.com|twitter\.com|pagesjaunes\.fr|google\.com|yelp\.com|trustpilot/i.test(host)) return null
    return url.href
  } catch { return null }
}

function cleanBusinessName(name: string): string {
  // Remove legal forms for better Google matching
  return name
    .replace(/\b(SARL|SAS|SA|EURL|SASU|EIRL|EI|SCI|SNC|SCOP|SCP|SELARL|AUTO[- ]?ENTREPRENEUR|MICRO[- ]?ENTREPRISE|ETS|ETABLISSEMENTS?|ENTREPRISE|SOCIETE|STE)\b/gi, '')
    .replace(/\s+/g, ' ').trim()
}

function extractCommercialName(raw: string): string {
  const m = raw.match(/\(([^)]+)\)/)
  return m ? m[1].trim() : ''
}

// ════════════════════════════
// PROGRESS
// ════════════════════════════

interface Progress {
  completedDepts: string[]
  lastArtisanIndex: Record<string, number>  // dept -> index of last processed artisan
  stats: typeof stats
}

function loadProgress(): Progress {
  if (RESUME && fs.existsSync(PROGRESS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'))
    } catch { }
  }
  return { completedDepts: [], lastArtisanIndex: {}, stats: { ...stats } }
}

function saveProgress(progress: Progress) {
  progress.stats = { ...stats }
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2))
}

// ════════════════════════════
// GOOGLE SEARCH SCRAPING
// ════════════════════════════

async function searchGoogle(query: string, retry = 0): Promise<string | null> {
  const url = `http://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(
    `https://www.google.fr/search?q=${encodeURIComponent(query)}&hl=fr&gl=fr&num=5`
  )}`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), SCRAPER_TIMEOUT_MS)

    const resp = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    stats.apiCredits += 5  // Google Search = 5 credits

    if (!resp.ok) {
      if (resp.status === 429 && retry < MAX_RETRIES) {
        await sleep(10000 * (retry + 1))
        return searchGoogle(query, retry + 1)
      }
      return null
    }

    return await resp.text()
  } catch (e: any) {
    if (retry < MAX_RETRIES && !shuttingDown) {
      await sleep(5000 * (retry + 1))
      return searchGoogle(query, retry + 1)
    }
    return null
  }
}

// ════════════════════════════
// PARSE GOOGLE RESULTS
// ════════════════════════════

function extractPhoneFromHtml(html: string): string | null {
  // Pattern 1: Knowledge panel phone (data-dtype="d3ph")
  const kpMatch = html.match(/data-dtype="d3ph"[^>]*>([^<]+)</i)
  if (kpMatch) {
    const p = normalizePhone(kpMatch[1])
    if (p) return p
  }

  // Pattern 2: Phone in tel: link
  const telMatches = html.match(/href="tel:([^"]+)"/gi)
  if (telMatches) {
    for (const m of telMatches) {
      const num = m.match(/tel:([^"]+)/)?.[1]
      if (num) {
        const p = normalizePhone(num)
        if (p) return p
      }
    }
  }

  // Pattern 3: French phone pattern in text (0X XX XX XX XX or +33)
  const phoneRegex = /(?:(?:\+33|0033)\s*[1-9](?:[\s.-]*\d{2}){4}|0[1-9](?:[\s.-]*\d{2}){4})/g
  const matches = html.match(phoneRegex)
  if (matches) {
    for (const m of matches) {
      const p = normalizePhone(m)
      if (p) return p
    }
  }

  return null
}

function extractWebsiteFromHtml(html: string, businessName: string): string | null {
  // Pattern 1: Google organic results — links that look like business websites
  // Look for hrefs to non-google, non-directory sites near the business name
  const cleanName = businessName.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')

  // Pattern 2: Any https link in the results that could be a business website
  const hrefRegex = /href="(https?:\/\/[^"]+)"/gi
  const candidates: string[] = []
  let match
  while ((match = hrefRegex.exec(html)) !== null) {
    const w = normalizeWebsite(match[1])
    if (w) candidates.push(w)
  }

  // Filter to real business websites (not directories/social)
  const skipPattern = /google\.|facebook\.|instagram\.|linkedin\.|twitter\.|x\.com|pagesjaunes|yelp|trustpilot|kompass|societe\.com|mappy|horaires|annuaire|youtube|wikipedia|tripadvisor|cylex|starofservice|habitatpresto|houzz|linternaute/i
  const filtered: string[] = []
  for (const c of candidates) {
    try {
      const host = new URL(c).hostname.replace(/^www\./, '').toLowerCase()
      if (skipPattern.test(host)) continue
      filtered.push(c)
    } catch { }
  }

  // Prefer domain matching business name
  if (cleanName.length > 3) {
    for (const c of filtered) {
      const host = new URL(c).hostname.replace(/^www\./, '').toLowerCase().replace(/[^a-z0-9]/g, '')
      if (host.includes(cleanName.substring(0, Math.min(6, cleanName.length)))) {
        return c
      }
    }
  }

  // Fallback: return first non-directory website
  return filtered.length > 0 ? filtered[0] : null
}

function extractRatingFromHtml(html: string): { rating: number; reviewCount: number } | null {
  // Strip HTML tags for text analysis
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')

  // Pattern 1: "X.X (N avis)" or "X,X (N avis)" — most common in Google snippets
  const p1 = text.match(/(\d[.,]\d)\.\s*\((\d+)\s*avis\)/i)
    || text.match(/(\d[.,]\d)\s*\((\d+)\s*avis\)/i)
    || text.match(/(\d[.,]\d)\s*-\s*(\d+)\s*avis/i)
  if (p1) {
    const rating = parseFloat(p1[1].replace(',', '.'))
    const reviewCount = parseInt(p1[2])
    if (rating >= 1 && rating <= 5) return { rating, reviewCount }
  }

  // Pattern 2: Structured JSON data
  const structMatch = html.match(/"ratingValue"\s*:\s*"?(\d[.,]\d)"?\s*,\s*"(?:ratingCount|reviewCount)"\s*:\s*"?(\d+)"?/i)
  if (structMatch) {
    const rating = parseFloat(structMatch[1].replace(',', '.'))
    const reviewCount = parseInt(structMatch[2])
    if (rating >= 1 && rating <= 5) return { rating, reviewCount }
  }

  // Pattern 3: aria-label format
  const ariaMatch = html.match(/aria-label="[^"]*?(\d[.,]\d)[^"]*?(?:étoile|star|avis)/i)
  if (ariaMatch) {
    const rating = parseFloat(ariaMatch[1].replace(',', '.'))
    const reviewMatch = text.match(/(\d+)\s*avis/i)
    const reviewCount = reviewMatch ? parseInt(reviewMatch[1]) : 0
    if (rating >= 1 && rating <= 5) return { rating, reviewCount }
  }

  // Pattern 4: ">X,X</span" followed by N avis somewhere nearby
  const spanMatch = html.match(/>(\d[.,]\d)<\/span/i)
  if (spanMatch) {
    const rating = parseFloat(spanMatch[1].replace(',', '.'))
    const reviewMatch = text.match(/(\d+)\s*avis/i)
    const reviewCount = reviewMatch ? parseInt(reviewMatch[1]) : 0
    if (rating >= 1 && rating <= 5) return { rating, reviewCount }
  }

  return null
}

function parseSearchResults(html: string, artisan: Artisan): EnrichResult | null {
  const result: EnrichResult = { source: 'google-search' }
  let found = false

  // Extract phone
  if (!artisan.phone) {
    const phone = extractPhoneFromHtml(html)
    if (phone) {
      result.phone = phone
      found = true
    }
  }

  // Extract website
  if (!artisan.website) {
    const website = extractWebsiteFromHtml(html, artisan.name)
    if (website) {
      result.website = website
      found = true
    }
  }

  // Extract rating
  if (!artisan.rating_average) {
    const rating = extractRatingFromHtml(html)
    if (rating) {
      result.rating = rating.rating
      result.reviewCount = rating.reviewCount
      found = true
    }
  }

  return found ? result : null
}

// ════════════════════════════
// BUILD SEARCH QUERIES
// ════════════════════════════

function buildSearchQuery(artisan: Artisan): string {
  const parts: string[] = []

  // Use commercial name if available, otherwise cleaned business name
  const commercial = extractCommercialName(artisan.name)
  const cleaned = cleanBusinessName(artisan.name)
  const searchName = commercial || cleaned

  parts.push(`"${searchName}"`)

  // Add city
  if (artisan.address_city) {
    parts.push(artisan.address_city)
  }

  // Add trade keyword for context
  if (artisan.specialty) {
    const tradeMap: Record<string, string> = {
      'plombier': 'plombier',
      'electricien': 'électricien',
      'chauffagiste': 'chauffagiste',
      'menuisier': 'menuisier',
      'serrurier': 'serrurier',
      'couvreur': 'couvreur',
      'macon': 'maçon',
      'peintre': 'peintre',
      'carreleur': 'carreleur',
      'charpentier': 'charpentier',
      'platrier': 'plâtrier',
      'facade': 'façadier',
      'terrassier': 'terrassier',
    }
    const trade = tradeMap[artisan.specialty]
    if (trade) parts.push(trade)
  }

  parts.push('téléphone avis')

  return parts.join(' ')
}

// ════════════════════════════
// DB OPERATIONS
// ════════════════════════════

let pool: PgPool

function createPool(): PgPool {
  return new PgPool({
    connectionString: PG_URL,
    max: 15,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    options: '-c statement_timeout=120000',
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  })
}

async function loadArtisansBatch(dept: string, offset: number, limit: number): Promise<Artisan[]> {
  const result = await pool.query(
    `SELECT id, name, address_city, address_department, address_postal_code,
            specialty, phone, website, rating_average, review_count
     FROM providers
     WHERE address_department = $1
       AND (phone IS NULL OR website IS NULL OR rating_average IS NULL)
     ORDER BY (CASE WHEN phone IS NULL THEN 0 ELSE 1 END),
              (CASE WHEN website IS NULL THEN 0 ELSE 1 END),
              id
     LIMIT $2 OFFSET $3`,
    [dept, limit, offset]
  )
  return result.rows
}

async function countArtisansToEnrich(dept: string): Promise<number> {
  const result = await pool.query(
    `SELECT COUNT(*) as c FROM providers
     WHERE address_department = $1
       AND (phone IS NULL OR website IS NULL OR rating_average IS NULL)`,
    [dept]
  )
  return parseInt(result.rows[0].c)
}

async function updateArtisan(id: string, data: EnrichResult): Promise<{ phone: boolean; website: boolean; rating: boolean }> {
  const sets: string[] = []
  const params: any[] = []
  let pi = 1
  const updated = { phone: false, website: false, rating: false }

  if (data.phone) {
    sets.push(`phone = COALESCE(phone, $${pi++})`)
    params.push(data.phone)
    updated.phone = true
  }
  if (data.website) {
    sets.push(`website = COALESCE(website, $${pi++})`)
    params.push(data.website)
    updated.website = true
  }
  if (data.rating) {
    sets.push(`rating_average = COALESCE(rating_average, $${pi++})`)
    params.push(data.rating)
    updated.rating = true
  }
  if (data.reviewCount) {
    sets.push(`review_count = COALESCE(review_count, $${pi++})`)
    params.push(data.reviewCount)
  }

  if (sets.length === 0) return { phone: false, website: false, rating: false }

  params.push(id)
  await pool.query(`UPDATE providers SET ${sets.join(', ')} WHERE id = $${pi}`, params)

  return updated
}

// ════════════════════════════
// WORKER
// ════════════════════════════

async function processArtisan(artisan: Artisan, workerIdx: number): Promise<EnrichResult | null> {
  if (shuttingDown || processedIds.has(artisan.id)) return null
  processedIds.add(artisan.id)

  const query = buildSearchQuery(artisan)
  const html = await searchGoogle(query)

  if (!html) {
    stats.errors++
    return null
  }

  const result = parseSearchResults(html, artisan)

  if (!result) {
    stats.noResults++
    return null
  }

  // Update DB
  try {
    const updated = await updateArtisan(artisan.id, result)
    if (updated.phone) stats.newPhones++
    if (updated.website) stats.newWebsites++
    if (updated.rating) stats.newRatings++
  } catch (e: any) {
    stats.errors++
  }

  return result
}

// ════════════════════════════
// DEPARTMENT PROCESSOR
// ════════════════════════════

async function processDepartment(
  dept: string,
  progress: Progress,
  workerQueues: Array<Artisan[]>,
  workerReady: Array<boolean>,
): Promise<void> {
  const total = await countArtisansToEnrich(dept)
  if (total === 0) {
    console.log(`  ✓ Dept ${dept}: 0 artisans à enrichir, skip`)
    return
  }

  const startIdx = progress.lastArtisanIndex[dept] || 0
  console.log(`  → Dept ${dept}: ${fmt(total)} artisans à enrichir (reprise à ${startIdx})`)

  let offset = startIdx
  let deptProcessed = 0

  while (offset < total && !shuttingDown) {
    // Load batch
    const batch = await loadArtisansBatch(dept, offset, BATCH_SIZE)
    if (batch.length === 0) break

    // Process batch with workers
    for (const artisan of batch) {
      if (shuttingDown) break
      if (processedIds.has(artisan.id)) continue

      // Wait for a free worker
      let assigned = false
      while (!assigned && !shuttingDown) {
        for (let w = 0; w < workerQueues.length; w++) {
          if (workerQueues[w].length < 2) {
            workerQueues[w].push(artisan)
            assigned = true
            break
          }
        }
        if (!assigned) await sleep(100)
      }

      deptProcessed++
      stats.artisansProcessed++

      // Save progress periodically
      if (deptProcessed % SAVE_EVERY === 0) {
        progress.lastArtisanIndex[dept] = offset + deptProcessed
        saveProgress(progress)
      }
    }

    offset += batch.length

    // Wait for all pending workers to finish this batch
    let pending = true
    while (pending) {
      pending = workerQueues.some(q => q.length > 0)
      if (pending) await sleep(200)
    }
  }

  if (!shuttingDown) {
    progress.completedDepts.push(dept)
    progress.lastArtisanIndex[dept] = total
    saveProgress(progress)
    console.log(`  ✓ Dept ${dept} terminé (${fmt(deptProcessed)} traités)`)
  }
}

// ════════════════════════════
// MAIN
// ════════════════════════════

async function main() {
  console.log()
  console.log('════════════════════════════════════════════════════════════')
  console.log(`  MEGA ENRICHMENT — Recherche par nom sur Google${INSTANCE_ID ? ` [Instance ${INSTANCE_ID}]` : ''}`)
  console.log(`  Workers: ${INITIAL_WORKERS} → max ${MAX_WORKERS}`)
  console.log('════════════════════════════════════════════════════════════')
  console.log()

  pool = createPool()

  // Load progress
  const progress = loadProgress()
  if (RESUME && progress.completedDepts.length > 0) {
    console.log(`  Reprise: ${progress.completedDepts.length} depts déjà faits`)
    // Restore stats
    Object.assign(stats, progress.stats)
  }

  // Count total artisans to process
  const countRes = await pool.query(
    `SELECT COUNT(*) as c FROM providers WHERE phone IS NULL OR website IS NULL OR rating_average IS NULL`
  )
  stats.artisansTotal = parseInt(countRes.rows[0].c)
  console.log(`  ${fmt(stats.artisansTotal)} artisans à enrichir au total`)

  // Filter departments
  let depts = ONLY_DEPT ? [ONLY_DEPT] : MULTI_DEPTS ? MULTI_DEPTS : DEPARTEMENTS
  depts = depts.filter(d => !progress.completedDepts.includes(d))
  console.log(`  ${depts.length} départements restants`)
  console.log()

  // Setup workers
  const workerQueues: Array<Artisan[]> = []
  const workerRunning: boolean[] = []

  // Worker loop
  async function workerLoop(idx: number) {
    const queue = workerQueues[idx]
    while (!shuttingDown) {
      if (queue.length === 0) {
        await sleep(200)
        continue
      }

      const artisan = queue.shift()!
      const result = await processArtisan(artisan, idx)

      // Log progress
      const pct = stats.artisansTotal > 0
        ? ((stats.artisansProcessed / stats.artisansTotal) * 100).toFixed(1)
        : '0.0'

      const phoneStr = result?.phone ? `+T` : ''
      const webStr = result?.website ? `+W` : ''
      const ratingStr = result?.rating ? `+★` : ''
      const tag = phoneStr || webStr || ratingStr ? ` ${phoneStr}${webStr}${ratingStr}` : ' ·'

      if (stats.artisansProcessed % 10 === 0 || phoneStr) {
        console.log(
          `  W${idx + 1} [${fmt(stats.artisansProcessed)}/${fmt(stats.artisansTotal)}]` +
          ` ${artisan.name.substring(0, 35).padEnd(35)}` +
          `${tag}` +
          ` | ${stats.newPhones}T ${stats.newRatings}★ ${stats.newWebsites}W` +
          ` | ${pct}% ${elapsed()} W=${workerQueues.length}`
        )
      }

      await sleep(DELAY_BETWEEN_SEARCHES_MS)
    }
  }

  // Start initial worker
  function startWorker() {
    const idx = workerQueues.length
    workerQueues.push([])
    workerRunning.push(true)
    stats.activeWorkers = workerQueues.length
    stats.maxWorkers = Math.max(stats.maxWorkers, stats.activeWorkers)
    console.log(`  Démarrage Worker ${idx + 1}...`)
    workerLoop(idx).catch(console.error)
  }

  startWorker()

  // Progressive scaling
  const scaleTimer = setInterval(() => {
    if (workerQueues.length < MAX_WORKERS && !shuttingDown) {
      startWorker()
      console.log(`  ↑ Scale-up: Worker ${workerQueues.length} démarré (${workerQueues.length} actifs)`)
    }
  }, SCALE_INTERVAL_MS)

  // Graceful shutdown
  process.on('SIGINT', () => {
    if (shuttingDown) process.exit(1)
    shuttingDown = true
    console.log('\n  ⚠ Arrêt en cours, sauvegarde...')
    clearInterval(scaleTimer)
    saveProgress(progress)
    setTimeout(() => {
      printFinalStats()
      pool.end()
      process.exit(0)
    }, 3000)
  })

  // Process departments
  for (const dept of depts) {
    if (shuttingDown) break
    await processDepartment(dept, progress, workerQueues, workerRunning)
  }

  // Wait for remaining workers
  clearInterval(scaleTimer)
  let remaining = true
  while (remaining) {
    remaining = workerQueues.some(q => q.length > 0)
    if (remaining) await sleep(500)
  }
  shuttingDown = true

  await sleep(2000)
  printFinalStats()
  saveProgress(progress)
  await pool.end()
}

function printFinalStats() {
  console.log()
  console.log('════════════════════════════════════════════════════════════')
  console.log('  RÉSULTAT FINAL — ENRICHISSEMENT PAR NOM')
  console.log('════════════════════════════════════════════════════════════')
  console.log(`  Durée:              ${elapsed()}`)
  console.log(`  Artisans traités:   ${fmt(stats.artisansProcessed)}`)
  console.log(`  Nouveaux phones:    +${fmt(stats.newPhones)}`)
  console.log(`  Nouveaux ratings:   +${fmt(stats.newRatings)}`)
  console.log(`  Nouveaux websites:  +${fmt(stats.newWebsites)}`)
  console.log(`  Sans résultat:      ${fmt(stats.noResults)}`)
  console.log(`  Erreurs:            ${fmt(stats.errors)}`)
  console.log(`  Crédits API:        ~${fmt(stats.apiCredits)}`)
  console.log(`  Workers max:        ${stats.maxWorkers}`)
  console.log('════════════════════════════════════════════════════════════')
}

main().catch(console.error)
