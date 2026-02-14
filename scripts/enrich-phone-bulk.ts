/**
 * Enrichissement Téléphonique Massif — Recherche individuelle par nom d'artisan
 *
 * Stratégie multi-sources (du moins cher au plus cher) :
 *   1. PagesJaunes par nom (5 credits, ~35% hit rate)
 *   2. Google Search fallback (5 credits, ~20% hit rate)
 *
 * Traite les 730k+ artisans sans téléphone, département par département.
 * Workers concurrents pour la vitesse + resume complet.
 *
 * Usage:
 *   npx tsx scripts/enrich-phone-bulk.ts                      # Lancer
 *   npx tsx scripts/enrich-phone-bulk.ts --resume              # Reprendre
 *   npx tsx scripts/enrich-phone-bulk.ts --dept 13             # Un seul dept
 *   npx tsx scripts/enrich-phone-bulk.ts --test                # Test 10 artisans
 *   npx tsx scripts/enrich-phone-bulk.ts --workers 10          # 10 workers
 */

import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

// ============================================
// CONFIG
// ============================================

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const DEFAULT_WORKERS = 20
const DELAY_BETWEEN_REQUESTS_MS = 1000
const SCRAPER_TIMEOUT_MS = 60000
const MAX_RETRIES = 2
const MATCH_THRESHOLD = 0.5 // Lower threshold for exact name searches
const BATCH_SIZE = 500 // Supabase fetch batch size

const DATA_DIR = path.join(__dirname, '.bulk-data')
const PROGRESS_FILE = path.join(DATA_DIR, 'bulk-progress.json')
const STATS_FILE = path.join(DATA_DIR, 'bulk-stats.json')

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

// ============================================
// DEPARTMENTS
// ============================================

const DEPARTEMENTS = [
  '01','02','03','04','05','06','07','08','09','10',
  '11','12','13','14','15','16','17','18','19','2A',
  '2B','21','22','23','24','25','26','27','28','29',
  '30','31','32','33','34','35','36','37','38','39',
  '40','41','42','43','44','45','46','47','48','49',
  '50','51','52','53','54','55','56','57','58','59',
  '60','61','62','63','64','65','66','67','68','69',
  '70','71','72','73','74','75','76','77','78','79',
  '80','81','82','83','84','85','86','87','88','89',
  '90','91','92','93','94','95',
]

const DEPT_NAMES: Record<string, string> = {
  '01':'Ain','02':'Aisne','03':'Allier','04':'Alpes-de-Haute-Provence','05':'Hautes-Alpes',
  '06':'Alpes-Maritimes','07':'Ardèche','08':'Ardennes','09':'Ariège','10':'Aube',
  '11':'Aude','12':'Aveyron','13':'Bouches-du-Rhône','14':'Calvados','15':'Cantal',
  '16':'Charente','17':'Charente-Maritime','18':'Cher','19':'Corrèze','2A':'Corse-du-Sud',
  '2B':'Haute-Corse','21':'Côte-d\'Or','22':'Côtes-d\'Armor','23':'Creuse','24':'Dordogne',
  '25':'Doubs','26':'Drôme','27':'Eure','28':'Eure-et-Loir','29':'Finistère',
  '30':'Gard','31':'Haute-Garonne','32':'Gers','33':'Gironde','34':'Hérault',
  '35':'Ille-et-Vilaine','36':'Indre','37':'Indre-et-Loire','38':'Isère','39':'Jura',
  '40':'Landes','41':'Loir-et-Cher','42':'Loire','43':'Haute-Loire','44':'Loire-Atlantique',
  '45':'Loiret','46':'Lot','47':'Lot-et-Garonne','48':'Lozère','49':'Maine-et-Loire',
  '50':'Manche','51':'Marne','52':'Haute-Marne','53':'Mayenne','54':'Meurthe-et-Moselle',
  '55':'Meuse','56':'Morbihan','57':'Moselle','58':'Nièvre','59':'Nord',
  '60':'Oise','61':'Orne','62':'Pas-de-Calais','63':'Puy-de-Dôme','64':'Pyrénées-Atlantiques',
  '65':'Hautes-Pyrénées','66':'Pyrénées-Orientales','67':'Bas-Rhin','68':'Haut-Rhin','69':'Rhône',
  '70':'Haute-Saône','71':'Saône-et-Loire','72':'Sarthe','73':'Savoie','74':'Haute-Savoie',
  '75':'Paris','76':'Seine-Maritime','77':'Seine-et-Marne','78':'Yvelines','79':'Deux-Sèvres',
  '80':'Somme','81':'Tarn','82':'Tarn-et-Garonne','83':'Var','84':'Vaucluse',
  '85':'Vendée','86':'Vienne','87':'Haute-Vienne','88':'Vosges','89':'Yonne',
  '90':'Territoire de Belfort','91':'Essonne','92':'Hauts-de-Seine','93':'Seine-Saint-Denis',
  '94':'Val-de-Marne','95':'Val-d\'Oise',
}

// ============================================
// STATE
// ============================================

let shuttingDown = false
let startTime = Date.now()

const stats = {
  searched: 0,
  found: 0,
  updated: 0,
  skipped: 0,
  errors: 0,
  creditsUsed: 0,
  pjHits: 0,
  siretHits: 0,
  googleNameHits: 0,
  phoneDedups: 0,
}

// Anti-doublon: track all phones in DB + newly assigned in this run
const existingPhones = new Set<string>()
const sessionPhones = new Set<string>()

interface Artisan {
  id: string
  name: string
  address_postal_code: string | null
  address_department: string
  address_city: string | null
  siret: string | null
}

interface PJResult {
  name: string
  phone: string
  city?: string
}

// ============================================
// HELPERS
// ============================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h${m % 60}m`
  if (m > 0) return `${m}m${s % 60}s`
  return `${s}s`
}

function fmt(n: number): string { return n.toLocaleString('fr-FR') }

function normalizePhone(raw: string): string | null {
  if (!raw) return null
  let cleaned = raw.replace(/[^\d+]/g, '')
  if (cleaned.startsWith('+33')) cleaned = '0' + cleaned.substring(3)
  if (cleaned.startsWith('0033')) cleaned = '0' + cleaned.substring(4)
  if (!/^0[1-9]\d{8}$/.test(cleaned)) return null
  // Filter premium/tracking numbers
  if (/^(089|036|099)/.test(cleaned)) return null
  return cleaned
}

function normalizeName(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(sarl|sas|sa|eurl|sasu|eirl|ei|auto[- ]?entrepreneur|micro[- ]?entreprise|ets|entreprise|societe|ste|monsieur|madame|m\.|mme)\b/gi, '')
    .replace(/\([^)]*\)/g, '') // Remove parenthetical
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ').trim()
}

function nameSimilarity(a: string, b: string): number {
  const tA = new Set(a.split(' ').filter(t => t.length > 1))
  const tB = new Set(b.split(' ').filter(t => t.length > 1))
  if (tA.size === 0 || tB.size === 0) return 0
  let overlap = 0
  tA.forEach(t => { if (tB.has(t)) overlap++ })
  const union = new Set(Array.from(tA).concat(Array.from(tB)))
  return overlap / union.size
}

function decodeHtml(s: string): string {
  return s
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
}

/**
 * Anti-doublon: check if a phone is safe to assign
 * Returns false if phone already exists in DB or was assigned in this session
 */
function isPhoneSafe(phone: string): boolean {
  if (existingPhones.has(phone)) return false
  if (sessionPhones.has(phone)) return false
  return true
}

/**
 * Mark a phone as used (both in session and existing sets)
 */
function markPhoneUsed(phone: string): void {
  sessionPhones.add(phone)
  existingPhones.add(phone)
}

/**
 * Determine if an artisan name is too generic to search effectively
 */
function isSearchable(name: string): boolean {
  const norm = normalizeName(name)
  if (norm.length < 3) return false
  // Skip pure legal forms
  if (/^(sarl|sas|sa|eurl|sasu|eirl|ei)$/i.test(norm)) return false
  // Skip if only single common word
  const words = norm.split(' ').filter(w => w.length > 2)
  if (words.length === 0) return false
  return true
}

// ============================================
// SCRAPING: PagesJaunes by name
// ============================================

async function searchPJ(name: string, location: string, retry = 0): Promise<PJResult[]> {
  // Clean name for search: remove legal form suffixes for better matching
  const cleanName = name
    .replace(/\b(SARL|SAS|SA|EURL|SASU|EIRL|EI|SCI|SNC|SCOP)\b/gi, '')
    .replace(/\([^)]*\)/g, '')
    .trim()

  const url = `https://www.pagesjaunes.fr/annuaire/chercherlespros?quoiqui=${encodeURIComponent(cleanName)}&ou=${encodeURIComponent(location)}`
  const scraperUrl = `https://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}`

  try {
    const response = await fetch(scraperUrl, { signal: AbortSignal.timeout(SCRAPER_TIMEOUT_MS) })
    stats.creditsUsed += 5

    if (response.status === 429) {
      if (retry < MAX_RETRIES) { await sleep(10000); return searchPJ(name, location, retry + 1) }
      return []
    }
    if (response.status === 500) {
      if (retry < MAX_RETRIES) { await sleep(5000); return searchPJ(name, location, retry + 1) }
      return []
    }
    if (response.status >= 400) return []

    const html = await response.text()

    // Check for DataDome block
    if (html.length < 5000 && (html.includes('datadome') || html.includes('DataDome'))) {
      if (retry < MAX_RETRIES) { await sleep(15000); return searchPJ(name, location, retry + 1) }
      return []
    }

    return parsePJResults(html)
  } catch (err: any) {
    stats.errors++
    if (retry < MAX_RETRIES) { await sleep(3000); return searchPJ(name, location, retry + 1) }
    return []
  }
}

function parsePJResults(html: string): PJResult[] {
  const results: PJResult[] = []

  // Pattern: <h3 class="truncate-2-lines">BUSINESS NAME</h3> ... phone nearby
  // Split by denomination blocks
  const blocks = html.split(/class="bi-denomination/)
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i]

    // Extract name from <h3>
    const nameMatch = block.match(/<h3[^>]*>\s*([^<]+)\s*<\/h3>/)
    if (!nameMatch) continue
    const name = decodeHtml(nameMatch[1].trim())
    if (!name || name.length < 2) continue

    // Get the rest of the block until next denomination
    const nextBlockStart = block.indexOf('bi-denomination')
    const searchArea = nextBlockStart > 0 ? block.substring(0, nextBlockStart) : block.substring(0, 5000)

    // Extract phone — look for tel: links first, then pattern match
    let phone: string | null = null

    // Priority 1: tel: links
    const telMatch = searchArea.match(/href="tel:([^"]+)"/)
    if (telMatch) phone = normalizePhone(telMatch[1])

    // Priority 2: Phone patterns in the block
    if (!phone) {
      const phoneMatches = searchArea.match(/(0[1-9][\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2})/g)
      if (phoneMatches) {
        // Filter out SIRET-like numbers and PJ internal numbers
        for (const p of phoneMatches) {
          const normalized = normalizePhone(p)
          if (normalized && !normalized.startsWith('013') && !normalized.startsWith('084')) {
            phone = normalized
            break
          }
        }
      }
    }

    // Extract city
    const cityMatch = searchArea.match(/bi-address-city[^>]*>([^<]+)/)
    const city = cityMatch ? cityMatch[1].trim() : undefined

    if (phone) {
      results.push({ name, phone, city })
    }
  }

  // Also try JSON-LD
  const jsonLdRe = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
  let m
  while ((m = jsonLdRe.exec(html)) !== null) {
    try {
      const data = JSON.parse(m[1])
      const items = Array.isArray(data) ? data : [data]
      for (const item of items) {
        if (item.telephone && item.name) {
          const phone = normalizePhone(item.telephone)
          if (phone) {
            results.push({
              name: decodeHtml(item.name),
              phone,
              city: item.address?.addressLocality,
            })
          }
        }
      }
    } catch { /* skip */ }
  }

  return results
}

// ============================================
// SCRAPING: Google Search by SIRET (Source 2)
// ============================================

async function searchGoogleSiret(siret: string, retry = 0): Promise<string | null> {
  const siren = siret.substring(0, 9)
  const query = `"${siren}" téléphone`
  const url = `https://www.google.fr/search?q=${encodeURIComponent(query)}&hl=fr&gl=fr&num=5`
  const scraperUrl = `https://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}`

  try {
    const response = await fetch(scraperUrl, { signal: AbortSignal.timeout(SCRAPER_TIMEOUT_MS) })
    stats.creditsUsed += 5

    if (response.status === 429) {
      if (retry < MAX_RETRIES) { await sleep(10000); return searchGoogleSiret(siret, retry + 1) }
      return null
    }
    if (response.status >= 400) return null

    const html = await response.text()

    // Only accept phones that appear near the SIREN/SIRET number in the HTML
    const siretEsc = siret.replace(/\s/g, '[\\s.]?')
    const sirenEsc = siren.replace(/\s/g, '[\\s.]?')

    // Look for phone within 500 chars of the SIRET/SIREN mention
    for (const pattern of [siretEsc, sirenEsc]) {
      const re = new RegExp(pattern, 'g')
      let m
      while ((m = re.exec(html)) !== null) {
        const ctx = html.substring(Math.max(0, m.index - 300), m.index + m[0].length + 300)
        const phoneMatch = ctx.match(/(0[1-9][\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2})/)
        if (phoneMatch) {
          const phone = normalizePhone(phoneMatch[1])
          if (phone) return phone
        }
      }
    }
    return null
  } catch {
    stats.errors++
    if (retry < MAX_RETRIES) { await sleep(3000); return searchGoogleSiret(siret, retry + 1) }
    return null
  }
}

// ============================================
// SCRAPING: Google Search by name with VALIDATION (Source 3)
// ============================================

async function searchGoogleName(name: string, location: string, retry = 0): Promise<string | null> {
  const query = `"${name}" ${location} téléphone`
  const url = `https://www.google.fr/search?q=${encodeURIComponent(query)}&hl=fr&gl=fr&num=5`
  const scraperUrl = `https://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}`

  try {
    const response = await fetch(scraperUrl, { signal: AbortSignal.timeout(SCRAPER_TIMEOUT_MS) })
    stats.creditsUsed += 5

    if (response.status === 429) {
      if (retry < MAX_RETRIES) { await sleep(10000); return searchGoogleName(name, location, retry + 1) }
      return null
    }
    if (response.status >= 400) return null

    const html = await response.text()

    // VALIDATION: Only accept phones that appear near the business name
    // Extract a significant portion of the name for matching (at least 2 words)
    const nameWords = name.split(/[\s,.()\-]+/).filter(w => w.length > 2)
    if (nameWords.length === 0) return null
    const nameKey = nameWords.slice(0, 3).join('|')
    const nameRe = new RegExp(nameKey, 'i')

    // Find all phone patterns in the HTML
    const phoneRe = /(0[1-9][\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2})/g
    let pm
    while ((pm = phoneRe.exec(html)) !== null) {
      // Check if any significant name word appears within 500 chars of this phone
      const start = Math.max(0, pm.index - 500)
      const end = Math.min(html.length, pm.index + 500)
      const ctx = html.substring(start, end)

      if (nameRe.test(ctx)) {
        const phone = normalizePhone(pm[1])
        if (phone) return phone
      }
    }
    return null
  } catch {
    stats.errors++
    if (retry < MAX_RETRIES) { await sleep(3000); return searchGoogleName(name, location, retry + 1) }
    return null
  }
}

// ============================================
// WORKER: Process one artisan
// ============================================

async function processArtisan(
  artisan: Artisan,
  supabase: SupabaseClient,
  deptName: string
): Promise<boolean> {
  if (shuttingDown) return false

  const searchName = artisan.name
  const searchLocation = deptName

  // ── Source 1: PagesJaunes par nom (5 credits, ~22% hit rate, haute fiabilité) ──
  const pjResults = await searchPJ(searchName, searchLocation)

  if (pjResults.length > 0) {
    const normalizedArtisan = normalizeName(artisan.name)
    let bestMatch: PJResult | null = null
    let bestScore = 0

    for (const result of pjResults) {
      // Anti-doublon: skip phones already in use
      if (!isPhoneSafe(result.phone)) continue
      const score = nameSimilarity(normalizedArtisan, normalizeName(result.name))
      if (score > bestScore) {
        bestScore = score
        bestMatch = result
      }
    }

    if (bestMatch && (bestScore >= MATCH_THRESHOLD || pjResults.length === 1)) {
      const { error } = await supabase
        .from('providers')
        .update({ phone: bestMatch.phone })
        .eq('id', artisan.id)

      if (!error) {
        markPhoneUsed(bestMatch.phone)
        stats.found++
        stats.updated++
        stats.pjHits++
        return true
      }
    }
  }

  await sleep(DELAY_BETWEEN_REQUESTS_MS)

  // ── Source 2: Google par SIRET (5 credits, très haute fiabilité) ──
  if (artisan.siret && artisan.siret.length >= 9) {
    const siretPhone = await searchGoogleSiret(artisan.siret)
    if (siretPhone && isPhoneSafe(siretPhone)) {
      const { error } = await supabase
        .from('providers')
        .update({ phone: siretPhone })
        .eq('id', artisan.id)

      if (!error) {
        markPhoneUsed(siretPhone)
        stats.found++
        stats.updated++
        stats.siretHits++
        return true
      }
    } else if (siretPhone) {
      stats.phoneDedups++
    }

    await sleep(DELAY_BETWEEN_REQUESTS_MS)
  }

  // ── Source 3: Google par nom AVEC validation proximité (5 credits, fiabilité moyenne-haute) ──
  const googlePhone = await searchGoogleName(searchName, searchLocation)
  if (googlePhone && isPhoneSafe(googlePhone)) {
    const { error } = await supabase
      .from('providers')
      .update({ phone: googlePhone })
      .eq('id', artisan.id)

    if (!error) {
      markPhoneUsed(googlePhone)
      stats.found++
      stats.updated++
      stats.googleNameHits++
      return true
    }
  } else if (googlePhone) {
    stats.phoneDedups++
  }

  return false
}

// ============================================
// MAIN LOOP
// ============================================

async function main() {
  const args = process.argv.slice(2)
  const flags = {
    resume: args.includes('--resume'),
    test: args.includes('--test'),
    dept: args.includes('--dept') ? args[args.indexOf('--dept') + 1] : undefined,
    workers: args.includes('--workers') ? parseInt(args[args.indexOf('--workers') + 1]) : DEFAULT_WORKERS,
  }

  if (!SCRAPER_API_KEY) {
    console.error('   ❌ SCRAPER_API_KEY manquant')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  console.log('\n' + '='.repeat(60))
  console.log('  ENRICHISSEMENT TÉLÉPHONIQUE MASSIF (ANTI-DOUBLON)')
  console.log('='.repeat(60))
  console.log(`  Workers: ${flags.workers}`)
  console.log(`  Sources: PJ nom → Google SIRET → Google nom+validation`)

  // Pre-load ALL existing phones from DB for dedup
  console.log('  Chargement des téléphones existants...')
  for (const dept of DEPARTEMENTS) {
    const { data } = await supabase
      .from('providers')
      .select('phone')
      .eq('is_active', true)
      .eq('address_department', dept)
      .not('phone', 'is', null)
      .limit(10000)
    if (data) data.forEach(d => { if (d.phone) existingPhones.add(d.phone) })
  }
  console.log(`  ${existingPhones.size.toLocaleString('fr-FR')} téléphones déjà en base (anti-doublon actif)`)

  // Load progress
  const processedIds = new Set<string>()
  const completedDepts = new Set<string>()
  if (flags.resume && fs.existsSync(PROGRESS_FILE)) {
    const prev = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'))
    prev.completedDepts?.forEach((d: string) => completedDepts.add(d))
    prev.processedIds?.forEach((id: string) => processedIds.add(id))
    stats.searched = prev.stats?.searched || 0
    stats.found = prev.stats?.found || 0
    stats.updated = prev.stats?.updated || 0
    stats.skipped = prev.stats?.skipped || 0
    stats.errors = prev.stats?.errors || 0
    stats.creditsUsed = prev.stats?.creditsUsed || 0
    stats.pjHits = prev.stats?.pjHits || 0
    stats.siretHits = prev.stats?.siretHits || 0
    stats.googleNameHits = prev.stats?.googleNameHits || 0
    console.log(`  Reprise: ${fmt(processedIds.size)} artisans, ${completedDepts.size} depts terminés`)
  }
  console.log()

  // Handle SIGINT
  process.on('SIGINT', () => {
    if (shuttingDown) process.exit(1)
    console.log('\n   Arrêt gracieux en cours...')
    shuttingDown = true
  })

  startTime = Date.now()
  const depts = flags.dept ? [flags.dept] : DEPARTEMENTS

  for (const deptCode of depts) {
    if (shuttingDown) break
    if (completedDepts.has(deptCode)) continue

    const deptName = DEPT_NAMES[deptCode] || deptCode
    console.log(`\n── ${deptName} (${deptCode}) ──`)

    // Fetch artisans without phone in this department
    let allArtisans: Artisan[] = []
    let from = 0
    while (true) {
      const { data, error } = await supabase
        .from('providers')
        .select('id, name, address_postal_code, address_department, address_city, siret')
        .is('phone', null)
        .eq('is_active', true)
        .eq('address_department', deptCode)
        .range(from, from + BATCH_SIZE - 1)

      if (error) {
        console.log(`   ⚠ DB error: ${error.message}`)
        await sleep(5000)
        break
      }
      if (!data || data.length === 0) break
      allArtisans.push(...(data as Artisan[]))
      from += BATCH_SIZE
      if (data.length < BATCH_SIZE) break
    }

    // Filter: skip already processed and unsearchable names
    const artisans = allArtisans.filter(a => {
      if (processedIds.has(a.id)) return false
      if (!isSearchable(a.name)) { stats.skipped++; processedIds.add(a.id); return false }
      return true
    })

    console.log(`   ${fmt(artisans.length)} artisans à traiter (${fmt(allArtisans.length - artisans.length)} déjà faits/ignorés)`)

    if (flags.test) artisans.splice(10) // Only 10 in test mode

    let deptFound = 0
    let deptProcessed = 0

    // Process in batches with concurrent workers
    for (let i = 0; i < artisans.length; i += flags.workers) {
      if (shuttingDown) break

      const batch = artisans.slice(i, i + flags.workers)
      const results = await Promise.allSettled(
        batch.map(artisan => processArtisan(artisan, supabase, deptName))
      )

      for (let j = 0; j < batch.length; j++) {
        processedIds.add(batch[j].id)
        stats.searched++
        deptProcessed++
        if (results[j].status === 'fulfilled' && results[j].value) {
          deptFound++
        }
      }

      // Progress display
      const elapsed = Date.now() - startTime
      const rate = stats.searched > 0 ? Math.round(stats.searched / (elapsed / 3600000)) : 0
      process.stdout.write(
        `   ${fmt(deptProcessed)}/${fmt(artisans.length)} | ` +
        `${fmt(stats.found)} trouvés (${fmt(stats.pjHits)} PJ + ${fmt(stats.siretHits)} SIRET + ${fmt(stats.googleNameHits)} GName) | ` +
        `${rate}/h | ~${fmt(stats.creditsUsed)} cr    \r`
      )

      // Save progress every 50 artisans
      if (deptProcessed % 50 === 0) {
        saveProgress(processedIds, completedDepts)
      }

      await sleep(DELAY_BETWEEN_REQUESTS_MS)
    }

    const hitRate = deptProcessed > 0 ? Math.round(deptFound / deptProcessed * 100) : 0
    console.log(
      `\n   ✓ ${deptName}: ${fmt(deptProcessed)} traités → ${fmt(deptFound)} trouvés (${hitRate}%)    `
    )

    if (!flags.test) {
      completedDepts.add(deptCode)
      saveProgress(processedIds, completedDepts)
    }
  }

  // Final save
  saveProgress(processedIds, completedDepts)

  const elapsed = Date.now() - startTime
  console.log('\n' + '='.repeat(60))
  console.log('  RÉSUMÉ ENRICHISSEMENT MASSIF')
  console.log('='.repeat(60))
  console.log(`  Durée:            ${formatDuration(elapsed)}`)
  console.log(`  Artisans traités: ${fmt(stats.searched)}`)
  console.log(`  Ignorés:          ${fmt(stats.skipped)}`)
  console.log(`  Trouvés:          ${fmt(stats.found)} (${stats.searched > 0 ? Math.round(stats.found / stats.searched * 100) : 0}%)`)
  console.log(`    └ PagesJaunes:  ${fmt(stats.pjHits)}`)
  console.log(`    └ Google SIRET: ${fmt(stats.siretHits)}`)
  console.log(`    └ Google Nom:   ${fmt(stats.googleNameHits)}`)
  console.log(`  MAJ en base:      ${fmt(stats.updated)}`)
  console.log(`  Phone doublons:   ${fmt(stats.phoneDedups)} (bloqués)`)
  console.log(`  Erreurs:          ${stats.errors}`)
  console.log(`  Crédits API:      ~${fmt(stats.creditsUsed)}`)
  console.log('='.repeat(60) + '\n')
}

function saveProgress(processedIds: Set<string>, completedDepts: Set<string>) {
  // Save processed IDs (limit to last 100k to keep file manageable)
  const idsArr = Array.from(processedIds)
  const recentIds = idsArr.length > 100000 ? idsArr.slice(-100000) : idsArr

  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({
    completedDepts: Array.from(completedDepts),
    processedIds: recentIds,
    stats,
    lastSave: new Date().toISOString(),
  }))
}

main()
  .then(() => process.exit(0))
  .catch(e => { console.error('\n   Erreur fatale:', e); process.exit(1) })
