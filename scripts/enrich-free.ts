/**
 * FREE ENRICHMENT — Direct Google Search without ScraperAPI
 *
 * Searches Google.fr directly with rotating User-Agents and long delays.
 * No API credits needed — completely free but slower.
 *
 * Strategy:
 *   - 1-3 workers with 5-15s random delays (avoid detection)
 *   - Rotate User-Agents
 *   - If blocked (429/captcha), back off exponentially
 *   - Also scrapes found websites directly for phone numbers
 *
 * Usage: npx tsx scripts/enrich-free.ts [--resume] [--max-workers N] [--dept XX]
 */
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { Pool as PgPool } from 'pg'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

// ════════════════════════════
// CONFIG
// ════════════════════════════

const PG_URL = 'postgresql://postgres:BEB6LnGlT6U9bkTe@db.umjmbdbwcsxrvfqktiui.supabase.co:5432/postgres'
const DATA_DIR = path.join(__dirname, '.gm-data')
const PROGRESS_FILE = path.join(DATA_DIR, 'enrich-free-progress.json')

const DEFAULT_MAX_WORKERS = 2
const INITIAL_WORKERS = 1
const SCALE_INTERVAL_MS = 120_000     // Add 1 worker every 2 min
const MIN_DELAY_MS = 5000             // Min delay between searches
const MAX_DELAY_MS = 15000            // Max delay between searches
const BATCH_SIZE = 200
const SAVE_EVERY = 25
const WEBSITE_FETCH_TIMEOUT = 8000

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

// ════════════════════════════
// USER AGENTS (rotate to avoid detection)
// ════════════════════════════

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
]

function randomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

// ════════════════════════════
// DEPARTMENTS
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
  id: string; name: string; address_city: string | null
  address_department: string | null; address_postal_code: string | null
  specialty: string | null; phone: string | null; website: string | null
  rating_average: number | null; review_count: number | null
}

interface EnrichResult {
  phone?: string; website?: string; rating?: number
  reviewCount?: number; source: string
}

interface Progress {
  completedDepts: string[]
  lastArtisanIndex: Record<string, number>
  stats: typeof stats
}

// ════════════════════════════
// STATE
// ════════════════════════════

let shuttingDown = false
const processedIds = new Set<string>()
const stats = {
  artisansProcessed: 0, artisansTotal: 0,
  newPhones: 0, newWebsites: 0, newRatings: 0,
  noResults: 0, errors: 0, blocked: 0,
  activeWorkers: 0, maxWorkers: MAX_WORKERS,
}

let backoffUntil = 0 // timestamp — if blocked, wait until this time

// ════════════════════════════
// HELPERS
// ════════════════════════════

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
const fmt = (n: number) => n.toLocaleString('fr-FR')
function randomDelay(): number {
  return MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS)
}

function loadProgress(): Progress {
  if (RESUME && fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'))
  }
  return { completedDepts: [], lastArtisanIndex: {}, stats: { ...stats } }
}

function saveProgress(p: Progress) {
  p.stats = { ...stats }
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2))
}

// ════════════════════════════
// PHONE / WEBSITE EXTRACTION
// ════════════════════════════

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
    if (/facebook\.com|instagram\.com|linkedin\.com|twitter\.com|pagesjaunes\.fr|google\.com|yelp\.com|trustpilot/i.test(host)) return null
    return url.href
  } catch { return null }
}

function extractPhoneFromHtml(html: string): string | null {
  // Pattern 1: Knowledge panel
  const kpMatch = html.match(/data-dtype="d3ph"[^>]*>([^<]+)/i)
  if (kpMatch) { const p = normalizePhone(kpMatch[1]); if (p) return p }

  // Pattern 2: tel: link
  const telMatches = html.match(/href="tel:([^"]+)"/gi)
  if (telMatches) {
    for (const m of telMatches) {
      const num = m.match(/tel:([^"]+)/)?.[1]
      if (num) { const p = normalizePhone(num); if (p) return p }
    }
  }

  // Pattern 3: French phone in text
  const phoneRegex = /(?:(?:\+33|0033)\s*[1-9](?:[\s.-]*\d{2}){4}|0[1-9](?:[\s.-]*\d{2}){4})/g
  const matches = html.match(phoneRegex)
  if (matches) {
    for (const m of matches) { const p = normalizePhone(m); if (p) return p }
  }

  return null
}

function extractWebsiteFromHtml(html: string, businessName: string): string | null {
  const cleanName = businessName.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')

  const hrefRegex = /href="(https?:\/\/[^"]+)"/gi
  const candidates: string[] = []
  let match
  while ((match = hrefRegex.exec(html)) !== null) {
    const w = normalizeWebsite(match[1])
    if (w) candidates.push(w)
  }

  const skipPattern = /google\.|facebook\.|instagram\.|linkedin\.|twitter\.|x\.com|pagesjaunes|yelp|trustpilot|kompass|societe\.com|mappy|horaires|annuaire|youtube|wikipedia|tripadvisor|cylex|starofservice|habitatpresto|houzz|linternaute/i
  const filtered: string[] = []
  for (const c of candidates) {
    try {
      const host = new URL(c).hostname.replace(/^www\./, '').toLowerCase()
      if (skipPattern.test(host)) continue
      filtered.push(c)
    } catch { }
  }

  if (cleanName.length > 3) {
    for (const c of filtered) {
      const host = new URL(c).hostname.replace(/^www\./, '').toLowerCase().replace(/[^a-z0-9]/g, '')
      if (host.includes(cleanName.substring(0, Math.min(6, cleanName.length)))) return c
    }
  }

  return filtered.length > 0 ? filtered[0] : null
}

function extractRatingFromHtml(html: string): { rating: number; reviewCount: number } | null {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
  const p1 = text.match(/(\d[.,]\d)\.\s*\((\d+)\s*avis\)/i)
    || text.match(/(\d[.,]\d)\s*\((\d+)\s*avis\)/i)
    || text.match(/(\d[.,]\d)\s*-\s*(\d+)\s*avis/i)
  if (p1) {
    const rating = parseFloat(p1[1].replace(',', '.'))
    const reviewCount = parseInt(p1[2])
    if (rating >= 1 && rating <= 5) return { rating, reviewCount }
  }
  const structMatch = html.match(/"ratingValue"\s*:\s*"?(\d[.,]\d)"?\s*,\s*"(?:ratingCount|reviewCount)"\s*:\s*"?(\d+)"?/i)
  if (structMatch) {
    const rating = parseFloat(structMatch[1].replace(',', '.'))
    const reviewCount = parseInt(structMatch[2])
    if (rating >= 1 && rating <= 5) return { rating, reviewCount }
  }
  const spanMatch = html.match(/>(\d[.,]\d)<\/span/i)
  if (spanMatch) {
    const rating = parseFloat(spanMatch[1].replace(',', '.'))
    const reviewMatch = text.match(/(\d+)\s*avis/i)
    const reviewCount = reviewMatch ? parseInt(reviewMatch[1]) : 0
    if (rating >= 1 && rating <= 5) return { rating, reviewCount }
  }
  return null
}

// ════════════════════════════
// SEARCH FUNCTIONS
// ════════════════════════════

const tradeMap: Record<string, string> = {
  plombier: 'plombier', electricien: 'électricien', peintre: 'peintre',
  menuisier: 'menuisier', maçon: 'maçon', carreleur: 'carreleur',
  couvreur: 'couvreur', serrurier: 'serrurier', chauffagiste: 'chauffagiste',
  climaticien: 'climaticien', charpentier: 'charpentier', plâtrier: 'plâtrier',
  façadier: 'façadier', terrassier: 'terrassier',
}

function extractCommercialName(name: string): string | null {
  const parenMatch = name.match(/\(([^)]{3,})\)\s*$/)
  if (parenMatch) return parenMatch[1].trim()
  return null
}

function cleanBusinessName(name: string): string {
  return name
    .replace(/\b(SARL|SAS|EURL|SCI|EI|SASU|SA|SNC|SELARL|AUTO[- ]?ENTREPRENEUR)\b/gi, '')
    .replace(/\s+/g, ' ').trim()
}

function buildSearchQuery(artisan: Artisan): string {
  const parts: string[] = []
  const commercial = extractCommercialName(artisan.name)
  const cleaned = cleanBusinessName(artisan.name)
  const searchName = commercial || cleaned
  parts.push(`"${searchName}"`)
  if (artisan.address_city) parts.push(artisan.address_city)
  if (artisan.specialty && tradeMap[artisan.specialty]) parts.push(tradeMap[artisan.specialty])
  parts.push('téléphone avis')
  return parts.join(' ')
}

async function searchGoogleDirect(query: string): Promise<string | null> {
  // Wait for backoff if blocked
  const now = Date.now()
  if (now < backoffUntil) {
    await sleep(backoffUntil - now)
  }

  const url = `https://www.google.fr/search?q=${encodeURIComponent(query)}&hl=fr&gl=fr&num=5`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(url, {
      headers: {
        'User-Agent': randomUA(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'DNT': '1',
      },
      signal: controller.signal,
      redirect: 'follow',
    })

    clearTimeout(timeout)

    if (response.status === 429 || response.status === 503) {
      // Blocked — exponential backoff
      stats.blocked++
      const backoffMs = Math.min(60000 * Math.pow(2, stats.blocked), 600000) // max 10 min
      backoffUntil = Date.now() + backoffMs
      console.log(`  ⚠ Google blocked (${response.status}) — backing off ${Math.round(backoffMs / 1000)}s`)
      return null
    }

    if (!response.ok) return null

    const html = await response.text()

    // Check for CAPTCHA
    if (html.includes('captcha') || html.includes('unusual traffic') || html.includes('notre système a détecté')) {
      stats.blocked++
      const backoffMs = Math.min(120000 * Math.pow(2, stats.blocked), 600000)
      backoffUntil = Date.now() + backoffMs
      console.log(`  ⚠ CAPTCHA detected — backing off ${Math.round(backoffMs / 1000)}s`)
      return null
    }

    // Reset blocked counter on success
    if (stats.blocked > 0) stats.blocked = Math.max(0, stats.blocked - 1)

    return html
  } catch (e: any) {
    if (e.name === 'AbortError') return null
    return null
  }
}

async function fetchWebsiteForPhone(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), WEBSITE_FETCH_TIMEOUT)

    const response = await fetch(url, {
      headers: { 'User-Agent': randomUA() },
      signal: controller.signal,
      redirect: 'follow',
    })

    clearTimeout(timeout)
    if (!response.ok) return null

    const html = await response.text()
    return extractPhoneFromHtml(html)
  } catch {
    return null
  }
}

// ════════════════════════════
// DB OPERATIONS
// ════════════════════════════

let pool: PgPool

function createPool(): PgPool {
  return new PgPool({
    connectionString: PG_URL,
    max: 3,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
    options: '-c statement_timeout=600000',
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  })
}

async function dbQueryRetry(text: string, params: any[], retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      return await pool.query(text, params)
    } catch (e: any) {
      if (i === retries - 1) throw e
      console.log(`  ⚠ DB retry ${i + 1}/${retries}: ${e.message}`)
      if (e.code === '57014' || e.message.includes('Connection terminated') || e.message.includes('timeout')) {
        try { await pool.end() } catch {}
        pool = createPool()
      }
      await sleep(3000 * (i + 1))
    }
  }
}

async function loadArtisansBatch(dept: string, offset: number, limit: number): Promise<Artisan[]> {
  const result = await dbQueryRetry(
    `SELECT id, name, address_city, address_department, address_postal_code,
            specialty, phone, website, rating_average, review_count
     FROM providers
     WHERE address_department = $1 AND phone IS NULL
     ORDER BY id
     LIMIT $2 OFFSET $3`,
    [dept, limit, offset]
  )
  return result.rows
}

async function countArtisansToEnrich(dept: string): Promise<number> {
  const result = await dbQueryRetry(
    `SELECT COUNT(*) as c FROM providers
     WHERE address_department = $1 AND phone IS NULL`,
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
    if (data.reviewCount) {
      sets.push(`review_count = COALESCE(review_count, $${pi++})`)
      params.push(data.reviewCount)
    }
    updated.rating = true
  }

  if (sets.length === 0) return { phone: false, website: false, rating: false }

  params.push(id)
  await dbQueryRetry(`UPDATE providers SET ${sets.join(', ')} WHERE id = $${pi}`, params)
  return updated
}

// ════════════════════════════
// WORKER
// ════════════════════════════

async function processArtisan(artisan: Artisan, workerIdx: number): Promise<EnrichResult | null> {
  if (shuttingDown || processedIds.has(artisan.id)) return null
  processedIds.add(artisan.id)

  const query = buildSearchQuery(artisan)
  const html = await searchGoogleDirect(query)

  if (!html) {
    stats.errors++
    return null
  }

  const result: EnrichResult = { source: 'google-free' }
  let found = false

  // Extract phone from Google results
  if (!artisan.phone) {
    const phone = extractPhoneFromHtml(html)
    if (phone) { result.phone = phone; found = true }
  }

  // Extract website
  if (!artisan.website) {
    const website = extractWebsiteFromHtml(html, artisan.name)
    if (website) { result.website = website; found = true }
  }

  // Extract rating
  if (!artisan.rating_average) {
    const rating = extractRatingFromHtml(html)
    if (rating) { result.rating = rating.rating; result.reviewCount = rating.reviewCount; found = true }
  }

  // If no phone found from Google but we found a website, try scraping website directly
  if (!result.phone && !artisan.phone) {
    const websiteUrl = result.website || artisan.website
    if (websiteUrl) {
      const phoneFromSite = await fetchWebsiteForPhone(websiteUrl)
      if (phoneFromSite) { result.phone = phoneFromSite; found = true }
    }
  }

  if (!found) {
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
  let total: number
  try {
    total = await countArtisansToEnrich(dept)
  } catch {
    total = 0
  }
  if (total === 0) {
    console.log(`  ✓ Dept ${dept}: 0 artisans, skip`)
    return
  }

  const startIdx = progress.lastArtisanIndex[dept] || 0
  console.log(`  → Dept ${dept}: ${fmt(total)} artisans (reprise à ${startIdx})`)

  let offset = startIdx
  let deptProcessed = 0

  while (offset < total && !shuttingDown) {
    const batch = await loadArtisansBatch(dept, offset, BATCH_SIZE)
    if (batch.length === 0) break

    for (const artisan of batch) {
      if (shuttingDown) break

      // Assign to first available worker
      let assigned = false
      while (!assigned && !shuttingDown) {
        for (let i = 0; i < workerQueues.length; i++) {
          if (workerQueues[i].length === 0) {
            workerQueues[i].push(artisan)
            assigned = true
            break
          }
        }
        if (!assigned) await sleep(100)
      }

      deptProcessed++
      stats.artisansProcessed++

      if (deptProcessed % SAVE_EVERY === 0) {
        progress.lastArtisanIndex[dept] = offset + deptProcessed
        saveProgress(progress)
      }
    }

    offset += batch.length

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
  console.log('  FREE ENRICHMENT — Google direct (0 crédits API)')
  console.log(`  Workers: ${INITIAL_WORKERS} → max ${MAX_WORKERS}`)
  console.log('════════════════════════════════════════════════════════════')
  console.log()

  pool = createPool()

  const progress = loadProgress()
  if (RESUME && progress.completedDepts.length > 0) {
    console.log(`  Reprise: ${progress.completedDepts.length} depts déjà faits`)
    Object.assign(stats, progress.stats)
  }

  try {
    const countRes = await pool.query('SELECT COUNT(*) as c FROM providers WHERE phone IS NULL')
    stats.artisansTotal = parseInt(countRes.rows[0].c)
  } catch {
    stats.artisansTotal = 660000
  }
  console.log(`  ${fmt(stats.artisansTotal)} artisans sans téléphone`)

  let depts = ONLY_DEPT ? [ONLY_DEPT] : DEPARTEMENTS
  depts = depts.filter(d => !progress.completedDepts.includes(d))
  console.log(`  ${depts.length} départements restants`)
  console.log()

  // Setup workers
  const workerQueues: Array<Artisan[]> = []
  const workerRunning: boolean[] = []

  async function workerLoop(idx: number) {
    const queue = workerQueues[idx]
    while (!shuttingDown) {
      if (queue.length === 0) { await sleep(200); continue }

      const artisan = queue.shift()!
      const result = await processArtisan(artisan, idx)

      // Display progress
      const phoneStr = result?.phone ? '+T' : ''
      const websiteStr = result?.website ? '+W' : ''
      const ratingStr = result?.rating ? '+★' : ''
      const found = phoneStr + websiteStr + ratingStr
      const display = found || '·'

      const pct = ((stats.artisansProcessed / stats.artisansTotal) * 100).toFixed(1)
      const elapsed = Math.round((Date.now() - startTime) / 1000)
      const mins = Math.floor(elapsed / 60)
      const secs = elapsed % 60
      const name = artisan.name.substring(0, 40).padEnd(40)

      process.stdout.write(
        `\r  W${idx + 1} [${stats.artisansProcessed}/${fmt(stats.artisansTotal)}] ${name} ${display.padEnd(6)}` +
        ` | ${stats.newPhones}T ${stats.newRatings}★ ${stats.newWebsites}W` +
        ` | ${pct}% ${mins}m${secs}s W=${stats.activeWorkers}` +
        `${stats.blocked > 0 ? ' BLK=' + stats.blocked : ''}   \n`
      )

      // Random delay
      await sleep(randomDelay())
    }
  }

  const startTime = Date.now()

  // Start initial workers
  for (let i = 0; i < INITIAL_WORKERS; i++) {
    workerQueues.push([])
    workerRunning.push(true)
    stats.activeWorkers++
    console.log(`  Démarrage Worker ${i + 1}...`)
    workerLoop(i)
  }

  // Scaling timer
  const scaleTimer = setInterval(() => {
    if (stats.activeWorkers < MAX_WORKERS && !shuttingDown && stats.blocked === 0) {
      const idx = stats.activeWorkers
      workerQueues.push([])
      workerRunning.push(true)
      stats.activeWorkers++
      console.log(`  ↑ Scale-up: Worker ${idx + 1} démarré (${stats.activeWorkers} actifs)`)
      workerLoop(idx)
    }
  }, SCALE_INTERVAL_MS)

  // Graceful shutdown
  process.on('SIGINT', () => {
    if (shuttingDown) process.exit(1)
    shuttingDown = true
    console.log('\n  ⏸ Arrêt en cours...')
    clearInterval(scaleTimer)
    saveProgress(progress)
  })

  // Process departments
  for (const dept of depts) {
    if (shuttingDown) break
    await processDepartment(dept, progress, workerQueues, workerRunning)
  }

  clearInterval(scaleTimer)

  // Final stats
  const elapsed = Math.round((Date.now() - startTime) / 1000)
  console.log()
  console.log('════════════════════════════════════════════════════════════')
  console.log(`  FREE ENRICHMENT — Résultats`)
  console.log(`  Durée: ${Math.floor(elapsed / 60)}m${elapsed % 60}s`)
  console.log(`  Artisans traités: ${fmt(stats.artisansProcessed)}`)
  console.log(`  Nouveaux phones:  +${fmt(stats.newPhones)}`)
  console.log(`  Nouveaux sites:   +${fmt(stats.newWebsites)}`)
  console.log(`  Nouveaux ratings: +${fmt(stats.newRatings)}`)
  console.log(`  Blocages Google:  ${stats.blocked}`)
  console.log(`  Erreurs:          ${stats.errors}`)
  console.log(`  Crédits API:      0 (gratuit!)`)
  console.log('════════════════════════════════════════════════════════════')

  await pool.end()
}

main().catch(e => { console.error(e); process.exit(1) })
