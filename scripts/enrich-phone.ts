/**
 * Enrichissement Telephonique des Artisans via Pages Jaunes (Playwright)
 *
 * Utilise un navigateur headless pour contourner la protection anti-bot de PJ.
 * Extrait les telephones depuis le JSON-LD des fiches individuelles.
 *
 * Usage:
 *   npx tsx scripts/enrich-phone.ts                    # Lancement complet
 *   npx tsx scripts/enrich-phone.ts --resume           # Reprendre apres interruption
 *   npx tsx scripts/enrich-phone.ts --limit 500        # Limiter a 500 artisans
 *   npx tsx scripts/enrich-phone.ts --dept 75          # Uniquement Paris
 *   npx tsx scripts/enrich-phone.ts --tabs 5           # 5 onglets paralleles
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright'
import { supabase } from './lib/supabase-admin'
import * as fs from 'fs'
import * as path from 'path'

// ============================================
// CONFIG
// ============================================

const BATCH_SIZE = 100
const DEFAULT_PARALLEL_TABS = 3
const NAV_TIMEOUT = 20000
const DELAY_BETWEEN_REQUESTS_MS = 2000
const MAX_JITTER_MS = 1500
const PROGRESS_FILE = path.join(__dirname, '.enrich-phone-progress.json')
const PROGRESS_REPORT_INTERVAL = 25

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
]

// ============================================
// STATE
// ============================================

let shuttingDown = false
let browser: Browser | null = null
let context: BrowserContext | null = null

const stats = {
  processed: 0,
  found: 0,
  notFound: 0,
  errors: 0,
  phonesUpdated: 0,
  emailsUpdated: 0,
  websitesUpdated: 0,
}

let startTime = Date.now()

// ============================================
// TYPES
// ============================================

interface Provider {
  id: string
  name: string
  siren: string | null
  address_city: string | null
  address_postal_code: string | null
  address_department: string | null
}

interface ScrapedContact {
  phone?: string
  email?: string
  website?: string
}

interface ProgressState {
  offset: number
  startedAt: string
  stats: typeof stats
  dept?: string
}

interface CliArgs {
  resume: boolean
  limit: number
  dept?: string
  tabs: number
}

// ============================================
// HELPERS
// ============================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function randomDelay(): number {
  return DELAY_BETWEEN_REQUESTS_MS + Math.floor(Math.random() * MAX_JITTER_MS)
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h${m % 60}m${s % 60}s`
  if (m > 0) return `${m}m${s % 60}s`
  return `${s}s`
}

function formatNumber(n: number): string {
  return n.toLocaleString('fr-FR')
}

/** Normalize string for PJ URL slugs */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Keep only alphanumeric, spaces, hyphens
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80)
}

// ============================================
// PHONE VALIDATION & NORMALIZATION
// ============================================

function normalizePhone(raw: string): string | null {
  if (!raw) return null
  let cleaned = raw.replace(/[^\d+]/g, '')
  if (cleaned.startsWith('+33')) cleaned = '0' + cleaned.substring(3)
  if (cleaned.startsWith('0033')) cleaned = '0' + cleaned.substring(4)
  if (!/^0[1-9]\d{8}$/.test(cleaned)) return null
  if (cleaned.startsWith('089')) return null
  return cleaned
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !email.includes('..')
}

function normalizeWebsite(raw: string | undefined | null): string | null {
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
// PLAYWRIGHT BROWSER MANAGEMENT
// ============================================

async function initBrowser(numTabs: number): Promise<Page[]> {
  browser = await chromium.launch({ headless: true })
  context = await browser.newContext({
    userAgent: USER_AGENTS[0],
    locale: 'fr-FR',
    viewport: { width: 1920, height: 1080 },
    extraHTTPHeaders: {
      'Accept-Language': 'fr-FR,fr;q=0.9',
    },
  })

  const pages: Page[] = []
  for (let i = 0; i < numTabs; i++) {
    const page = await context.newPage()
    // Block unnecessary resources for speed
    await page.route('**/*.{png,jpg,jpeg,gif,svg,webp,ico,woff,woff2,ttf,eot}', route => route.abort())
    await page.route('**/ads*', route => route.abort())
    await page.route('**/analytics*', route => route.abort())
    await page.route('**/tracking*', route => route.abort())
    await page.route('**/gtm*', route => route.abort())
    await page.route('**/google-analytics*', route => route.abort())
    pages.push(page)
  }

  // Accept cookies on first page
  try {
    await pages[0].goto('https://www.pagesjaunes.fr', { waitUntil: 'domcontentloaded', timeout: 15000 })
    const consentBtn = await pages[0].$('#didomi-notice-agree-button')
    if (consentBtn) {
      await consentBtn.click()
      await sleep(1000)
    }
  } catch { /* ignore */ }

  return pages
}

async function closeBrowser(): Promise<void> {
  if (context) await context.close().catch(() => {})
  if (browser) await browser.close().catch(() => {})
}

// ============================================
// PAGES JAUNES SCRAPING WITH PLAYWRIGHT
// ============================================

/**
 * Search PJ for an artisan and extract contact info.
 * Strategy:
 *   1. Search by name + city on PJ
 *   2. Find the first matching result
 *   3. Visit detail page → extract phone from JSON-LD
 */
async function searchPagesJaunes(
  page: Page,
  name: string,
  city: string,
  postalCode?: string,
  dept?: string,
): Promise<ScrapedContact | null> {
  try {
    // Build search URL - use the /annuaire format
    const cityPart = dept ? `${slugify(city)}-${dept}` : slugify(city)
    const namePart = slugify(name)
    const searchUrl = `https://www.pagesjaunes.fr/annuaire/${cityPart}/${namePart}`

    // Navigate to search
    const response = await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: NAV_TIMEOUT,
    })

    if (!response || response.status() >= 400) {
      // Fallback: try with postal code
      if (postalCode) {
        const fallbackUrl = `https://www.pagesjaunes.fr/annuaire/${postalCode}/${namePart}`
        const resp2 = await page.goto(fallbackUrl, {
          waitUntil: 'domcontentloaded',
          timeout: NAV_TIMEOUT,
        })
        if (!resp2 || resp2.status() >= 400) return null
      } else {
        return null
      }
    }

    await page.waitForTimeout(1000)

    // Check if we landed on a detail page directly (redirect)
    if (page.url().includes('/pros/')) {
      return extractFromPage(page)
    }

    // We're on search results page - find the first listing's detail link
    const detailHref = await page.$eval(
      '.bi-content a[href*="/pros/"], .bi-header-title a[href*="/pros/"], .bi-denomination a[href*="/pros/"]',
      el => el.getAttribute('href')
    ).catch(() => null)

    if (!detailHref) {
      // No results found
      return null
    }

    // Visit the detail page
    const detailUrl = detailHref.startsWith('http')
      ? detailHref
      : `https://www.pagesjaunes.fr${detailHref}`

    await page.goto(detailUrl, {
      waitUntil: 'domcontentloaded',
      timeout: NAV_TIMEOUT,
    })
    await page.waitForTimeout(800)

    return extractFromPage(page)
  } catch {
    return null
  }
}

/**
 * Extract contact info from a PJ page (detail or search results).
 * Prioritizes JSON-LD structured data, falls back to regex.
 */
async function extractFromPage(page: Page): Promise<ScrapedContact | null> {
  const result: ScrapedContact = {}

  try {
    // Strategy 1: JSON-LD structured data (most reliable)
    const jsonLdTexts = await page.$$eval(
      'script[type="application/ld+json"]',
      els => els.map(e => e.textContent || '')
    ).catch(() => [])

    for (const jsonText of jsonLdTexts) {
      try {
        const data = JSON.parse(jsonText)
        // Handle both single objects and arrays
        const items = Array.isArray(data) ? data : [data]
        for (const item of items) {
          if (item.telephone) {
            const phone = normalizePhone(item.telephone)
            if (phone) result.phone = phone
          }
          if (item.email && isValidEmail(item.email)) {
            result.email = item.email.toLowerCase()
          }
          if (item.url) {
            const website = normalizeWebsite(item.url)
            if (website) result.website = website
          }
        }
      } catch { /* invalid JSON */ }
    }

    // Strategy 2: tel: links on the page
    if (!result.phone) {
      const telHrefs = await page.$$eval(
        'a[href^="tel:"]',
        els => els.map(e => e.getAttribute('href')?.replace('tel:', '') || '')
      ).catch(() => [])

      for (const tel of telHrefs) {
        const phone = normalizePhone(tel)
        if (phone) { result.phone = phone; break }
      }
    }

    // Strategy 3: Regex on visible text
    if (!result.phone) {
      const bodyText = await page.evaluate(() => document.body?.innerText || '').catch(() => '')
      const phoneRegex = /(?:(?:\+33|0)\s*[1-9])(?:[\s.-]*\d{2}){4}/g
      const matches = bodyText.match(phoneRegex) || []
      for (const m of matches) {
        const phone = normalizePhone(m)
        if (phone) { result.phone = phone; break }
      }
    }

    // Strategy 4: mailto links for email
    if (!result.email) {
      const mailtoHrefs = await page.$$eval(
        'a[href^="mailto:"]',
        els => els.map(e => e.getAttribute('href')?.replace('mailto:', '').split('?')[0] || '')
      ).catch(() => [])

      for (const email of mailtoHrefs) {
        if (isValidEmail(email.toLowerCase())) {
          result.email = email.toLowerCase()
          break
        }
      }
    }
  } catch { /* extraction error */ }

  if (!result.phone && !result.email && !result.website) return null
  return result
}

// ============================================
// PROGRESS MANAGEMENT
// ============================================

function loadProgress(): ProgressState {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8')) as ProgressState
    }
  } catch { /* ignore */ }
  return { offset: 0, startedAt: new Date().toISOString(), stats: { ...stats } }
}

function saveProgress(offset: number, dept?: string): void {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({
    offset,
    startedAt: new Date().toISOString(),
    stats: { ...stats },
    dept,
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
  const result: CliArgs = { resume: false, limit: 0, tabs: DEFAULT_PARALLEL_TABS }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--resume': result.resume = true; break
      case '--limit':
        result.limit = parseInt(args[++i], 10)
        if (isNaN(result.limit) || result.limit <= 0) {
          console.error('Erreur: --limit doit etre un nombre positif'); process.exit(1)
        }
        break
      case '--dept':
        result.dept = args[++i]
        if (!result.dept) { console.error('Erreur: --dept requis'); process.exit(1) }
        break
      case '--tabs':
        result.tabs = parseInt(args[++i], 10)
        if (isNaN(result.tabs) || result.tabs < 1 || result.tabs > 10) {
          console.error('Erreur: --tabs doit etre entre 1 et 10'); process.exit(1)
        }
        break
      case '--help': case '-h':
        console.log(`
Usage: npx tsx scripts/enrich-phone.ts [options]

Options:
  --resume        Reprendre apres interruption
  --limit N       Limiter a N artisans
  --dept XX       Filtrer par departement (ex: 75, 13)
  --tabs N        Nombre d'onglets paralleles (1-10, defaut: ${DEFAULT_PARALLEL_TABS})
  --help, -h      Aide
`); process.exit(0); break
      default:
        console.error(`Option inconnue: ${args[i]}`); process.exit(1)
    }
  }
  return result
}

// ============================================
// PROVIDER FETCHING
// ============================================

async function fetchProviderBatch(offset: number, batchSize: number, dept?: string): Promise<Provider[]> {
  let query = supabase
    .from('providers')
    .select('id, name, siren, address_city, address_postal_code, address_department')
    .is('phone', null)
    .eq('source', 'annuaire_entreprises')
    .eq('is_active', true)
    .order('data_quality_score', { ascending: false })
    .range(offset, offset + batchSize - 1)

  if (dept) query = query.eq('address_department', dept)
  const { data, error } = await query
  if (error) { console.error(`Erreur: ${error.message}`); return [] }
  return (data || []) as Provider[]
}

// ============================================
// PARALLEL ENRICHMENT
// ============================================

/**
 * Process a single provider using a browser page.
 */
async function processProvider(page: Page, provider: Provider): Promise<boolean> {
  const city = provider.address_city
  if (!city) { stats.notFound++; stats.processed++; return false }

  try {
    const contact = await searchPagesJaunes(
      page,
      provider.name,
      city,
      provider.address_postal_code || undefined,
      provider.address_department || undefined,
    )

    if (!contact) {
      stats.notFound++
      stats.processed++
      return false
    }

    const updateFields: Record<string, unknown> = {}
    if (contact.phone) { updateFields.phone = contact.phone; stats.phonesUpdated++ }
    if (contact.email) { updateFields.email = contact.email; stats.emailsUpdated++ }
    if (contact.website) { updateFields.website = contact.website; stats.websitesUpdated++ }

    if (Object.keys(updateFields).length === 0) {
      stats.notFound++
      stats.processed++
      return false
    }

    const { error } = await supabase
      .from('providers')
      .update(updateFields)
      .eq('id', provider.id)

    if (error) {
      stats.errors++
      stats.processed++
      return false
    }

    stats.found++
    stats.processed++
    return true
  } catch {
    stats.errors++
    stats.processed++
    return false
  }
}

// ============================================
// PROGRESS DISPLAY
// ============================================

function printProgress(): void {
  const elapsed = Date.now() - startTime
  const rate = elapsed > 0 ? Math.round(stats.processed / (elapsed / 60000)) : 0
  const successRate = stats.processed > 0 ? Math.round((stats.found / stats.processed) * 100) : 0
  console.log('')
  console.log(`   --- Progression (${formatNumber(stats.processed)} traites) ---`)
  console.log(`   Telephones: ${formatNumber(stats.phonesUpdated)} | Emails: ${formatNumber(stats.emailsUpdated)} | Sites: ${formatNumber(stats.websitesUpdated)}`)
  console.log(`   Taux: ${successRate}% | Debit: ${formatNumber(rate)}/min | Duree: ${formatDuration(elapsed)}`)
  console.log('')
}

function printSummary(): void {
  const elapsed = Date.now() - startTime
  const rate = elapsed > 0 ? Math.round(stats.processed / (elapsed / 60000)) : 0
  const successRate = stats.processed > 0 ? Math.round((stats.found / stats.processed) * 100) : 0
  console.log('\n' + '='.repeat(60))
  console.log('  RESUME DE L\'ENRICHISSEMENT TELEPHONIQUE')
  console.log('='.repeat(60))
  console.log(`  Duree:              ${formatDuration(elapsed)}`)
  console.log(`  Artisans traites:   ${formatNumber(stats.processed)}`)
  console.log('  ' + '-'.repeat(40))
  console.log(`  Telephones:         ${formatNumber(stats.phonesUpdated)}`)
  console.log(`  Emails:             ${formatNumber(stats.emailsUpdated)}`)
  console.log(`  Sites web:          ${formatNumber(stats.websitesUpdated)}`)
  console.log('  ' + '-'.repeat(40))
  console.log(`  Taux de reussite:   ${successRate}%`)
  console.log(`  Debit:              ${formatNumber(rate)} artisans/min`)
  console.log('='.repeat(60) + '\n')
}

// ============================================
// MAIN
// ============================================

async function main() {
  const args = parseArgs()

  console.log('\n' + '='.repeat(60))
  console.log('  ENRICHISSEMENT TELEPHONIQUE DES ARTISANS')
  console.log('  Source: Pages Jaunes via Playwright (navigateur headless)')
  console.log('='.repeat(60) + '\n')

  // Graceful shutdown
  process.on('SIGINT', () => {
    if (shuttingDown) { console.log('\n   Arret force'); process.exit(1) }
    console.log('\n   Arret gracieux...')
    shuttingDown = true
  })

  // Resume
  let currentOffset = 0
  if (args.resume) {
    const progress = loadProgress()
    currentOffset = progress.offset
    if (progress.stats) Object.assign(stats, progress.stats)
    console.log(`   Reprise a l'offset ${formatNumber(currentOffset)}`)
  }

  if (args.dept) console.log(`   Departement: ${args.dept}`)
  if (args.limit > 0) console.log(`   Limite: ${formatNumber(args.limit)}`)
  console.log(`   Onglets paralleles: ${args.tabs}`)
  console.log(`   Delai: ${DELAY_BETWEEN_REQUESTS_MS}ms + jitter ${MAX_JITTER_MS}ms\n`)

  // Init browser
  console.log('   Lancement du navigateur...')
  const pages = await initBrowser(args.tabs)
  console.log(`   ${pages.length} onglet(s) prets\n`)

  startTime = Date.now()
  let totalProcessed = 0
  let hasMore = true
  let consecutiveEmpty = 0

  while (hasMore && !shuttingDown) {
    if (args.limit > 0 && totalProcessed >= args.limit) break

    let batchSize = BATCH_SIZE
    if (args.limit > 0) batchSize = Math.min(BATCH_SIZE, args.limit - totalProcessed)

    const providers = await fetchProviderBatch(currentOffset, batchSize, args.dept)
    if (providers.length === 0) {
      consecutiveEmpty++
      if (consecutiveEmpty >= 3) { hasMore = false; console.log('   Plus aucun artisan a enrichir'); break }
      currentOffset += batchSize
      continue
    }
    consecutiveEmpty = 0

    console.log(`   Batch: offset=${formatNumber(currentOffset)}, taille=${providers.length}`)

    // Process providers in parallel using tab pool
    let providerIdx = 0
    while (providerIdx < providers.length && !shuttingDown) {
      if (args.limit > 0 && totalProcessed >= args.limit) break

      // Launch parallel tasks for each available tab
      const chunk = providers.slice(providerIdx, providerIdx + pages.length)
      const promises = chunk.map(async (provider, i) => {
        const page = pages[i % pages.length]
        const cityInfo = provider.address_city || '?'
        const found = await processProvider(page, provider)

        if (found) {
          console.log(`   [${formatNumber(totalProcessed + i + 1)}] ${provider.name.substring(0, 35).padEnd(35)} | ${cityInfo.substring(0, 15).padEnd(15)} -> TROUVE`)
        }

        // Rate limit per tab
        await sleep(randomDelay())
      })

      await Promise.all(promises)
      providerIdx += chunk.length
      totalProcessed += chunk.length

      // Progress report
      if (stats.processed % PROGRESS_REPORT_INTERVAL === 0 && stats.processed > 0) {
        printProgress()
      }
    }

    currentOffset += providers.length
    saveProgress(currentOffset, args.dept)
  }

  // Cleanup
  await closeBrowser()

  if (!shuttingDown) {
    clearProgress()
  } else {
    saveProgress(currentOffset, args.dept)
    console.log(`\n   Progression sauvegardee (offset: ${formatNumber(currentOffset)})`)
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
