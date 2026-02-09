/**
 * Enrichissement Telephonique des Artisans via Pages Jaunes (Playwright)
 *
 * STRATEGIE: Navigation par metier (trade-based browsing)
 *   1. Pour chaque combinaison metier × departement:
 *      - Naviguer /annuaire/{dept-slug}-{dept-code}/{metier-slug}
 *      - Paginer tous les resultats (~20 par page)
 *      - Extraire nom, telephone, adresse de chaque listing
 *   2. Matcher les resultats PJ avec nos artisans en base (nom + ville)
 *   3. Mettre a jour les artisans matches avec telephone/email/site
 *
 * ANTI-BAN:
 *   - 15-30s entre chaque page
 *   - Pause de 3-5 min toutes les 15 pages
 *   - Detection de ban (403) → pause 30-60 min
 *   - Rotation de User-Agent
 *   - Nouveau contexte navigateur toutes les ~50 pages
 *
 * Usage:
 *   npx tsx scripts/enrich-phone.ts                    # Lancement complet
 *   npx tsx scripts/enrich-phone.ts --resume           # Reprendre
 *   npx tsx scripts/enrich-phone.ts --dept 75          # Uniquement Paris
 *   npx tsx scripts/enrich-phone.ts --trade plombiers  # Uniquement plombiers
 *   npx tsx scripts/enrich-phone.ts --test             # Test rapide (1 combo)
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright'
import { supabase } from './lib/supabase-admin'
import { DEPARTEMENTS, DEPARTEMENT_NAMES } from './lib/naf-config'
import * as fs from 'fs'
import * as path from 'path'

// ============================================
// CONFIG
// ============================================

const MIN_DELAY_MS = 12000           // 12s min between pages
const MAX_DELAY_MS = 25000           // 25s max between pages
const BREAK_EVERY_N_PAGES = 15       // Pause longue toutes les N pages
const BREAK_MIN_MS = 180000          // 3 min pause
const BREAK_MAX_MS = 300000          // 5 min pause
const BAN_PAUSE_MS = 1800000         // 30 min si ban detecte
const BAN_ESCALATION_MS = 7200000    // 2h apres bans consecutifs
const MAX_CONSECUTIVE_BANS = 5       // Abandon apres N bans
const CONTEXT_REFRESH_EVERY = 50     // Nouveau contexte tous les N pages
const NAV_TIMEOUT = 25000
const MATCH_THRESHOLD = 0.6          // Seuil de similarite pour le matching

const PROGRESS_FILE = path.join(__dirname, '.enrich-phone-progress.json')

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
]

// ============================================
// PJ TRADE SLUGS (NAF → PJ category)
// ============================================

/**
 * Mapping des metiers vers les slugs PJ.
 * Chaque metier peut avoir plusieurs slugs alternatifs (PJ n'est pas toujours coherent).
 */
const PJ_TRADE_SLUGS: Record<string, { label: string; slugs: string[] }> = {
  electriciens:    { label: 'Électriciens',    slugs: ['electriciens', 'electricite-generale'] },
  plombiers:       { label: 'Plombiers',       slugs: ['plombiers', 'plomberie'] },
  chauffagistes:   { label: 'Chauffagistes',   slugs: ['chauffagistes', 'chauffage-installation'] },
  isolation:       { label: 'Isolation',        slugs: ['isolation-thermique', 'entreprises-d-isolation'] },
  platriers:       { label: 'Plâtriers',       slugs: ['platriers', 'platrerie'] },
  menuisiers:      { label: 'Menuisiers',      slugs: ['menuisiers', 'menuiserie'] },
  serruriers:      { label: 'Serruriers',      slugs: ['serruriers', 'serrurerie'] },
  carreleurs:      { label: 'Carreleurs',      slugs: ['carreleurs', 'carrelage'] },
  peintres:        { label: 'Peintres',        slugs: ['peintres-en-batiment', 'peinture-batiment'] },
  finition:        { label: 'Finition',        slugs: ['entreprises-de-batiment', 'ravalement-de-facades'] },
  charpentiers:    { label: 'Charpentiers',    slugs: ['charpentiers', 'charpente'] },
  couvreurs:       { label: 'Couvreurs',       slugs: ['couvreurs', 'couverture-toiture'] },
  macons:          { label: 'Maçons',          slugs: ['macons', 'maconnerie'] },
}

// Order of trades to process
const TRADE_ORDER = [
  'plombiers', 'electriciens', 'chauffagistes', 'couvreurs',
  'menuisiers', 'macons', 'peintres', 'carreleurs',
  'charpentiers', 'platriers', 'serruriers', 'isolation', 'finition',
]

// ============================================
// STATE
// ============================================

let shuttingDown = false
let browser: Browser | null = null
let context: BrowserContext | null = null
let currentPage: Page | null = null

const stats = {
  pagesLoaded: 0,
  listingsExtracted: 0,
  matched: 0,
  phonesUpdated: 0,
  emailsUpdated: 0,
  websitesUpdated: 0,
  bansDetected: 0,
  errors: 0,
}

let startTime = Date.now()
let consecutiveBans = 0
let pagesSinceContextRefresh = 0

// ============================================
// TYPES
// ============================================

interface PJListing {
  name: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  website?: string
  email?: string
}

interface ProgressState {
  tradeIndex: number
  deptIndex: number
  pageNum: number
  startedAt: string
  stats: typeof stats
}

interface CliArgs {
  resume: boolean
  dept?: string
  trade?: string
  test: boolean
}

// ============================================
// HELPERS
// ============================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function randomBetween(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min))
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h${m % 60}m`
  if (m > 0) return `${m}m${s % 60}s`
  return `${s}s`
}

function formatNumber(n: number): string {
  return n.toLocaleString('fr-FR')
}

/** Normalize a company name for fuzzy matching */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(sarl|sas|sa|eurl|sasu|eirl|ei|auto[- ]?entrepreneur|micro[- ]?entreprise|ets|entreprise|societe|ste)\b/gi, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Calculate token overlap similarity (0-1) between two normalized names */
function nameSimilarity(a: string, b: string): number {
  const tokensA = new Set(a.split(' ').filter(t => t.length > 1))
  const tokensB = new Set(b.split(' ').filter(t => t.length > 1))
  if (tokensA.size === 0 || tokensB.size === 0) return 0

  let overlap = 0
  for (const t of tokensA) {
    if (tokensB.has(t)) overlap++
  }

  // Jaccard-like similarity
  const union = new Set([...tokensA, ...tokensB]).size
  return overlap / union
}

/** Normalize and validate a French phone number */
function normalizePhone(raw: string): string | null {
  if (!raw) return null
  let cleaned = raw.replace(/[^\d+]/g, '')
  if (cleaned.startsWith('+33')) cleaned = '0' + cleaned.substring(3)
  if (cleaned.startsWith('0033')) cleaned = '0' + cleaned.substring(4)
  if (!/^0[1-9]\d{8}$/.test(cleaned)) return null
  if (cleaned.startsWith('089')) return null // Premium numbers
  return cleaned
}

/** Slugify for PJ department URLs */
function slugifyDept(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// ============================================
// PLAYWRIGHT BROWSER MANAGEMENT
// ============================================

async function createContext(): Promise<Page> {
  const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]

  if (!browser) {
    browser = await chromium.launch({ headless: true })
  }

  // Close old context if exists
  if (context) {
    await context.close().catch(() => {})
  }

  context = await browser.newContext({
    userAgent: ua,
    locale: 'fr-FR',
    viewport: { width: 1920, height: 1080 },
    extraHTTPHeaders: {
      'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    },
  })

  const page = await context.newPage()

  // Block heavy resources
  await page.route('**/*.{png,jpg,jpeg,gif,svg,webp,ico,woff,woff2,ttf,eot}', route => route.abort())
  await page.route('**/ads*', route => route.abort())
  await page.route('**/analytics*', route => route.abort())
  await page.route('**/tracking*', route => route.abort())
  await page.route('**/gtm*', route => route.abort())
  await page.route('**/google-analytics*', route => route.abort())
  await page.route('**/datadome*', route => route.abort())

  // Accept cookies
  try {
    await page.goto('https://www.pagesjaunes.fr', { waitUntil: 'domcontentloaded', timeout: 15000 })
    const consentBtn = await page.$('#didomi-notice-agree-button')
    if (consentBtn) {
      await consentBtn.click()
      await sleep(1500)
    }
  } catch { /* ignore */ }

  pagesSinceContextRefresh = 0
  currentPage = page
  return page
}

async function closeBrowser(): Promise<void> {
  if (context) await context.close().catch(() => {})
  if (browser) await browser.close().catch(() => {})
  context = null
  browser = null
  currentPage = null
}

// ============================================
// PJ SCRAPING: TRADE-BASED BROWSING
// ============================================

/**
 * Browse a PJ trade+dept page and extract all listings.
 * Returns null if banned/blocked, empty array if no results.
 */
async function browsePJPage(
  page: Page,
  deptSlug: string,
  deptCode: string,
  tradeSlug: string,
  pageNum: number,
): Promise<PJListing[] | null> {
  // Build URL
  const url = pageNum === 1
    ? `https://www.pagesjaunes.fr/annuaire/${deptSlug}-${deptCode}/${tradeSlug}`
    : `https://www.pagesjaunes.fr/annuaire/${deptSlug}-${deptCode}/${tradeSlug}/${pageNum}`

  try {
    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: NAV_TIMEOUT,
    })

    if (!response) return null

    const status = response.status()

    // Ban detection: any 403 from PJ is a DataDome challenge
    if (status === 403 || status === 503) {
      console.log(`      ⛔ HTTP ${status} - ban/challenge detecte`)
      return null
    }

    if (status >= 400) {
      console.log(`      ⚠ HTTP ${status} - pas de resultats`)
      return [] // Not found = no results for this combo
    }

    // Wait for content to render
    await page.waitForTimeout(2000)

    // Check for "no results" indication
    const hasNoResults = await page.evaluate(() => {
      const text = document.body?.innerText || ''
      return text.includes('Aucun professionnel') || text.includes('aucun résultat') || text.includes('0 résultat')
    }).catch(() => false)

    if (hasNoResults) return []

    stats.pagesLoaded++

    // Extract listings from the page
    const listings = await page.evaluate(() => {
      const results: Array<{
        name: string
        phone?: string
        address?: string
        city?: string
        postalCode?: string
        website?: string
      }> = []

      // Try JSON-LD first (most reliable)
      const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]')
      for (const script of jsonLdScripts) {
        try {
          const data = JSON.parse(script.textContent || '')
          const items = Array.isArray(data) ? data : [data]
          for (const item of items) {
            if (item['@type'] === 'LocalBusiness' || item.telephone) {
              const listing: any = {
                name: item.name || '',
                phone: item.telephone || undefined,
                website: item.url || undefined,
              }
              if (item.address) {
                listing.address = item.address.streetAddress || ''
                listing.city = item.address.addressLocality || ''
                listing.postalCode = item.address.postalCode || ''
              }
              if (listing.name) results.push(listing)
            }
          }
        } catch { /* skip */ }
      }

      // Also extract from HTML listing elements (bi-bloc pattern)
      const listingEls = document.querySelectorAll('.bi-bloc, .bi, [data-pj-id]')
      for (const el of listingEls) {
        const nameEl = el.querySelector('.bi-denomination, .bi-header-title, h3')
        const name = nameEl?.textContent?.trim() || ''
        if (!name) continue

        // Check if already in JSON-LD results
        const alreadyFound = results.some(r => r.name === name)
        if (alreadyFound) continue

        const phoneEl = el.querySelector('.bi-phone .tel, .Click2Call, a[href^="tel:"]')
        const phone = phoneEl?.textContent?.trim() || phoneEl?.getAttribute('href')?.replace('tel:', '') || undefined

        const addressEl = el.querySelector('.bi-address .bi-address-street, .address-street')
        const address = addressEl?.textContent?.trim() || undefined

        const cityEl = el.querySelector('.bi-address .bi-address-city, .address-city')
        const cityText = cityEl?.textContent?.trim() || ''
        const cityMatch = cityText.match(/(\d{5})\s+(.+)/)

        const websiteEl = el.querySelector('a[href*="http"]:not([href*="pagesjaunes"])')
        const website = websiteEl?.getAttribute('href') || undefined

        results.push({
          name,
          phone,
          address,
          city: cityMatch ? cityMatch[2] : cityText || undefined,
          postalCode: cityMatch ? cityMatch[1] : undefined,
          website,
        })
      }

      return results
    }).catch(() => [])

    // Also try to extract phones from tel: links in the page
    const telLinks = await page.$$eval(
      'a[href^="tel:"]',
      els => els.map(e => ({
        href: e.getAttribute('href')?.replace('tel:', '') || '',
        text: e.closest('.bi-bloc, .bi, [data-pj-id]')?.querySelector('.bi-denomination, .bi-header-title, h3')?.textContent?.trim() || '',
      }))
    ).catch(() => [])

    // Merge tel: link data with listings
    for (const tel of telLinks) {
      if (!tel.href || !tel.text) continue
      const existing = listings.find(l => l.name === tel.text)
      if (existing && !existing.phone) {
        existing.phone = tel.href
      }
    }

    return listings
  } catch {
    stats.errors++
    return []
  }
}

/**
 * Check if there's a next page available
 */
async function hasNextPage(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const nextLink = document.querySelector('.pagination-next a, a[title="Page suivante"], .next a')
    return !!nextLink
  }).catch(() => false)
}

// ============================================
// DATABASE MATCHING
// ============================================

/**
 * Find matching artisans in our DB for a set of PJ listings.
 * Searches by normalized name similarity + same department.
 */
async function matchAndUpdateListings(
  listings: PJListing[],
  deptCode: string,
): Promise<number> {
  let updatedCount = 0

  for (const listing of listings) {
    if (shuttingDown) break

    const phone = listing.phone ? normalizePhone(listing.phone) : null
    if (!phone) continue // Skip listings without valid phone

    stats.listingsExtracted++

    // Search for matching artisan in our DB
    const normalizedPJName = normalizeName(listing.name)
    if (normalizedPJName.length < 2) continue

    // Query artisans in same dept without phone
    // Use the city from PJ if available, otherwise match by dept
    let query = supabase
      .from('providers')
      .select('id, name, address_city, phone')
      .is('phone', null)
      .eq('source', 'annuaire_entreprises')
      .eq('is_active', true)
      .eq('address_department', deptCode)

    // If we have city info, narrow the search
    if (listing.city) {
      query = query.ilike('address_city', `%${listing.city.replace(/'/g, "''")}%`)
    }

    // Limit results to avoid huge queries
    const { data: candidates, error } = await query.limit(100)

    if (error || !candidates || candidates.length === 0) continue

    // Find best match by name similarity
    let bestMatch: { id: string; score: number } | null = null

    for (const candidate of candidates) {
      if (candidate.phone) continue // Already has phone

      const normalizedDBName = normalizeName(candidate.name)
      const score = nameSimilarity(normalizedPJName, normalizedDBName)

      if (score >= MATCH_THRESHOLD && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { id: candidate.id, score }
      }
    }

    if (!bestMatch) continue

    // Update the matched artisan
    const updateFields: Record<string, unknown> = { phone }
    stats.phonesUpdated++

    if (listing.website) {
      const cleanUrl = normalizeWebsite(listing.website)
      if (cleanUrl) {
        updateFields.website = cleanUrl
        stats.websitesUpdated++
      }
    }

    const { error: updateError } = await supabase
      .from('providers')
      .update(updateFields)
      .eq('id', bestMatch.id)

    if (!updateError) {
      stats.matched++
      updatedCount++
    }
  }

  return updatedCount
}

function normalizeWebsite(raw: string): string | null {
  if (!raw) return null
  let url = raw.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url
  try {
    const parsed = new URL(url)
    const excluded = ['pagesjaunes.fr', 'facebook.com', 'instagram.com', 'twitter.com', 'linkedin.com', 'x.com']
    if (excluded.some(d => parsed.hostname.includes(d))) return null
    return parsed.toString()
  } catch {
    return null
  }
}

// ============================================
// PROGRESS MANAGEMENT
// ============================================

function loadProgress(): ProgressState {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'))
    }
  } catch { /* ignore */ }
  return { tradeIndex: 0, deptIndex: 0, pageNum: 1, startedAt: new Date().toISOString(), stats: { ...stats } }
}

function saveProgress(tradeIndex: number, deptIndex: number, pageNum: number): void {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({
    tradeIndex,
    deptIndex,
    pageNum,
    startedAt: new Date().toISOString(),
    stats: { ...stats },
  }, null, 2))
}

function clearProgress(): void {
  try { fs.unlinkSync(PROGRESS_FILE) } catch { /* ignore */ }
}

// ============================================
// CLI ARGS
// ============================================

function parseArgs(): CliArgs {
  const args = process.argv.slice(2)
  const result: CliArgs = { resume: false, test: false }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--resume': result.resume = true; break
      case '--test': result.test = true; break
      case '--dept':
        result.dept = args[++i]
        if (!result.dept) { console.error('Erreur: --dept requis'); process.exit(1) }
        break
      case '--trade':
        result.trade = args[++i]
        if (!result.trade) { console.error('Erreur: --trade requis'); process.exit(1) }
        break
      case '--help': case '-h':
        console.log(`
Usage: npx tsx scripts/enrich-phone.ts [options]

Options:
  --resume        Reprendre apres interruption
  --dept XX       Filtrer par departement (ex: 75, 13)
  --trade SLUG    Filtrer par metier (ex: plombiers, electriciens)
  --test          Test rapide (1 combinaison seulement)
  --help, -h      Aide

Metiers disponibles: ${TRADE_ORDER.join(', ')}
`); process.exit(0); break
      default:
        console.error(`Option inconnue: ${args[i]}`); process.exit(1)
    }
  }
  return result
}

// ============================================
// PROGRESS DISPLAY
// ============================================

function printProgress(trade: string, dept: string, pageNum: number): void {
  const elapsed = Date.now() - startTime
  const rate = elapsed > 0 ? (stats.pagesLoaded / (elapsed / 60000)).toFixed(1) : '0'
  console.log(`   📊 ${formatNumber(stats.pagesLoaded)} pages | ${formatNumber(stats.listingsExtracted)} listings | ${formatNumber(stats.matched)} matches | ${formatNumber(stats.phonesUpdated)} tel | ${rate} p/min | ${formatDuration(elapsed)}`)
}

function printSummary(): void {
  const elapsed = Date.now() - startTime
  console.log('\n' + '='.repeat(60))
  console.log('  RESUME ENRICHISSEMENT TELEPHONIQUE')
  console.log('='.repeat(60))
  console.log(`  Duree:              ${formatDuration(elapsed)}`)
  console.log(`  Pages chargees:     ${formatNumber(stats.pagesLoaded)}`)
  console.log(`  Listings extraits:  ${formatNumber(stats.listingsExtracted)}`)
  console.log('  ' + '-'.repeat(40))
  console.log(`  Artisans matches:   ${formatNumber(stats.matched)}`)
  console.log(`  Telephones:         ${formatNumber(stats.phonesUpdated)}`)
  console.log(`  Sites web:          ${formatNumber(stats.websitesUpdated)}`)
  console.log('  ' + '-'.repeat(40))
  console.log(`  Bans detectes:      ${stats.bansDetected}`)
  console.log(`  Erreurs:            ${stats.errors}`)
  console.log('='.repeat(60) + '\n')
}

// ============================================
// MAIN
// ============================================

async function main() {
  const args = parseArgs()

  console.log('\n' + '='.repeat(60))
  console.log('  ENRICHISSEMENT TELEPHONIQUE DES ARTISANS')
  console.log('  Strategie: Navigation par metier (Pages Jaunes)')
  console.log('='.repeat(60) + '\n')

  // Graceful shutdown
  process.on('SIGINT', () => {
    if (shuttingDown) { console.log('\n   Arret force'); process.exit(1) }
    console.log('\n   Arret gracieux en cours...')
    shuttingDown = true
  })

  // Build trade × dept task list
  const trades = args.trade
    ? [args.trade]
    : TRADE_ORDER

  const depts = args.dept
    ? [args.dept]
    : DEPARTEMENTS

  // Resume
  let startTradeIdx = 0
  let startDeptIdx = 0
  let startPageNum = 1

  if (args.resume) {
    const progress = loadProgress()
    startTradeIdx = progress.tradeIndex
    startDeptIdx = progress.deptIndex
    startPageNum = progress.pageNum
    if (progress.stats) Object.assign(stats, progress.stats)
    console.log(`   Reprise: trade=${startTradeIdx}, dept=${startDeptIdx}, page=${startPageNum}`)
  }

  console.log(`   Metiers: ${trades.length} | Departements: ${depts.length}`)
  console.log(`   Combinaisons: ${trades.length * depts.length}`)
  console.log(`   Delai: ${MIN_DELAY_MS/1000}-${MAX_DELAY_MS/1000}s | Pause toutes les ${BREAK_EVERY_N_PAGES} pages\n`)

  if (args.test) {
    console.log('   MODE TEST: 1 combinaison seulement\n')
  }

  // Init browser
  console.log('   Lancement du navigateur...')
  let page = await createContext()
  console.log('   Navigateur pret\n')

  startTime = Date.now()
  let totalPages = 0

  // Main loop: trade × dept × pages
  for (let ti = startTradeIdx; ti < trades.length && !shuttingDown; ti++) {
    const tradeKey = trades[ti]
    const tradeConfig = PJ_TRADE_SLUGS[tradeKey]

    if (!tradeConfig) {
      console.log(`   ⚠ Metier inconnu: ${tradeKey}, skip`)
      continue
    }

    for (let di = (ti === startTradeIdx ? startDeptIdx : 0); di < depts.length && !shuttingDown; di++) {
      const deptCode = depts[di]
      const deptName = DEPARTEMENT_NAMES[deptCode] || deptCode
      const deptSlug = slugifyDept(deptName)

      console.log(`\n   [${tradeConfig.label}] ${deptName} (${deptCode})`)

      // Try each slug variant for this trade
      let foundResults = false

      for (const tradeSlug of tradeConfig.slugs) {
        if (shuttingDown || foundResults) break

        let pageNum = (ti === startTradeIdx && di === startDeptIdx) ? startPageNum : 1
        let hasMore = true

        while (hasMore && !shuttingDown) {
          // Refresh browser context periodically
          if (pagesSinceContextRefresh >= CONTEXT_REFRESH_EVERY) {
            console.log('   🔄 Renouvellement contexte navigateur...')
            page = await createContext()
            await sleep(3000)
          }

          // Load page
          const listings = await browsePJPage(page, deptSlug, deptCode, tradeSlug, pageNum)

          // Ban detection
          if (listings === null) {
            consecutiveBans++
            stats.bansDetected++
            console.log(`   ⛔ BAN detecte (${consecutiveBans}/${MAX_CONSECUTIVE_BANS})`)

            if (consecutiveBans >= MAX_CONSECUTIVE_BANS) {
              console.log('   ❌ Trop de bans consecutifs, arret')
              shuttingDown = true
              break
            }

            // Pause and retry with fresh context
            const pauseMs = consecutiveBans >= 3 ? BAN_ESCALATION_MS : BAN_PAUSE_MS
            console.log(`   ⏳ Pause de ${formatDuration(pauseMs)}...`)
            await closeBrowser()
            await sleep(pauseMs)

            // Relaunch with fresh context
            page = await createContext()
            continue // Retry same page
          }

          // Reset ban counter on success
          consecutiveBans = 0

          if (listings.length === 0) {
            if (pageNum === 1) {
              // No results for this slug, try next
              break
            }
            // No more pages
            hasMore = false
            break
          }

          foundResults = true
          totalPages++
          pagesSinceContextRefresh++

          // Match listings to our DB artisans
          const updated = await matchAndUpdateListings(listings, deptCode)

          console.log(`   p${pageNum}: ${listings.length} listings, ${updated} matches`)

          // Check for more pages
          const nextExists = await hasNextPage(page)
          if (!nextExists) {
            hasMore = false
          } else {
            pageNum++
          }

          // Save progress
          saveProgress(ti, di, pageNum)

          // Rate limiting
          if (hasMore) {
            // Regular delay between pages
            const delay = randomBetween(MIN_DELAY_MS, MAX_DELAY_MS)
            await sleep(delay)

            // Longer break every N pages
            if (totalPages % BREAK_EVERY_N_PAGES === 0) {
              const breakMs = randomBetween(BREAK_MIN_MS, BREAK_MAX_MS)
              console.log(`   💤 Pause de ${formatDuration(breakMs)}...`)
              printProgress(tradeKey, deptCode, pageNum)
              await sleep(breakMs)
            }
          }

          // Test mode: stop after first page
          if (args.test) {
            hasMore = false
            shuttingDown = true
          }
        }

        if (foundResults) break // Found results with this slug, no need to try alternatives
      }

      // Reset start page for subsequent iterations
      startPageNum = 1
    }
  }

  // Cleanup
  await closeBrowser()

  if (!shuttingDown) {
    clearProgress()
  } else {
    console.log(`\n   Progression sauvegardee`)
    console.log('   Utilisez --resume pour reprendre')
  }

  printSummary()
}

main()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error('\n   Erreur fatale:', error)
    await closeBrowser()
    process.exit(1)
  })
