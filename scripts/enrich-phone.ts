/**
 * Enrichissement Telephonique des Artisans via Pages Jaunes + ScraperAPI
 *
 * PHASE 1 (--fetch): Recuperer toutes les fiches PJ dans un fichier local JSON
 *   - Parcourt chaque combinaison metier × departement
 *   - Pagine tous les resultats via ScraperAPI
 *   - Sauvegarde nom, telephone, ville, CP dans pj-listings.jsonl
 *   - Pas besoin de Supabase (peut tourner pendant la collecte)
 *
 * PHASE 2 (--match): Matcher les fiches PJ avec la base Supabase
 *   - Lit pj-listings.jsonl
 *   - Pour chaque fiche avec telephone, cherche un artisan correspondant en base
 *   - Met a jour le telephone si match trouve
 *   - Necessite Supabase stable
 *
 * Usage:
 *   npx tsx scripts/enrich-phone.ts --fetch                 # Phase 1: recuperer PJ
 *   npx tsx scripts/enrich-phone.ts --fetch --resume        # Reprendre phase 1
 *   npx tsx scripts/enrich-phone.ts --fetch --test          # Test 1 combo
 *   npx tsx scripts/enrich-phone.ts --match                 # Phase 2: matcher en base
 *   npx tsx scripts/enrich-phone.ts --match --dept 75       # Matcher uniquement dept 75
 */

import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

// ============================================
// CONFIG
// ============================================

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY
const DELAY_BETWEEN_PAGES_MS = 3000
const DELAY_BETWEEN_COMBOS_MS = 500
const SCRAPER_TIMEOUT_MS = 60000
const MAX_RETRIES = 2
const MATCH_THRESHOLD = 0.6

const DATA_DIR = path.join(__dirname, '.enrich-data')
const LISTINGS_FILE = path.join(DATA_DIR, 'pj-listings.jsonl')
const PROGRESS_FILE = path.join(DATA_DIR, 'fetch-progress.json')
const MATCH_PROGRESS_FILE = path.join(DATA_DIR, 'match-progress.json')

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

// ============================================
// DEPARTMENT NAMES (inline to avoid supabase-admin dep for phase 1)
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
  '90','91','92','93','94','95','971','972','973','974','976',
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
  '94':'Val-de-Marne','95':'Val-d\'Oise','971':'Guadeloupe','972':'Martinique',
  '973':'Guyane','974':'La Réunion','976':'Mayotte',
}

// ============================================
// PJ TRADE SLUGS
// ============================================

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
  // ── Mots-clés bonus (Phase 2) ──
  climatisation:   { label: 'Climatisation',   slugs: ['climatisation', 'pompes-a-chaleur'] },
  paysagistes:     { label: 'Paysagistes',     slugs: ['paysagistes', 'amenagement-de-jardins'] },
  terrassement:    { label: 'Terrassement',    slugs: ['terrassement', 'entreprises-de-terrassement'] },
  vitriers:        { label: 'Vitriers',        slugs: ['vitriers', 'vitrerie-miroiterie'] },
  renovation:      { label: 'Rénovation',      slugs: ['renovation-immobiliere', 'entreprises-de-renovation-du-batiment'] },
  depannage:       { label: 'Dépannage',       slugs: ['depannage-electricite', 'depannage-plomberie'] },
  sdb:             { label: 'Salles de bain',  slugs: ['salles-de-bains-installations-equipements', 'salle-de-bains'] },
  etancheite:      { label: 'Étanchéité',      slugs: ['etancheite-des-batiments', 'etancheite'] },
  demolition:      { label: 'Démolition',      slugs: ['entreprises-de-demolition', 'demolition'] },
  assainissement:  { label: 'Assainissement',  slugs: ['assainissement', 'vidange-de-fosses-septiques'] },
  domotique:       { label: 'Domotique',       slugs: ['domotique', 'alarmes-et-surveillance'] },
  ramonage:        { label: 'Ramonage',        slugs: ['ramonage', 'ramoneurs'] },
  parquets:        { label: 'Parquets',        slugs: ['parquets-pose', 'pose-de-parquets'] },
  stores:          { label: 'Stores/Volets',   slugs: ['stores-et-rideaux-metalliques', 'volets-roulants'] },
  portails:        { label: 'Portails',        slugs: ['portails-automatiques', 'portails'] },
}

const TRADE_ORDER = [
  'plombiers', 'electriciens', 'chauffagistes', 'couvreurs',
  'menuisiers', 'macons', 'peintres', 'carreleurs',
  'charpentiers', 'platriers', 'serruriers', 'isolation', 'finition',
]

const BONUS_TRADES = [
  'climatisation', 'paysagistes', 'terrassement', 'vitriers', 'renovation',
  'depannage', 'sdb', 'etancheite', 'demolition', 'assainissement',
  'domotique', 'ramonage', 'parquets', 'stores', 'portails',
]

// ============================================
// STATE
// ============================================

let shuttingDown = false
let startTime = Date.now()

const stats = {
  pagesLoaded: 0,
  listingsFound: 0,
  phonesFound: 0,
  matched: 0,
  phonesUpdated: 0,
  websitesUpdated: 0,
  errors: 0,
  apiCreditsUsed: 0,
}

// ============================================
// TYPES
// ============================================

interface PJListing {
  pjId: string
  name: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  website?: string
  trade: string
  deptCode: string
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

function slugifyDept(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function normalizePhone(raw: string): string | null {
  if (!raw) return null
  let cleaned = raw.replace(/[^\d+]/g, '')
  if (cleaned.startsWith('+33')) cleaned = '0' + cleaned.substring(3)
  if (cleaned.startsWith('0033')) cleaned = '0' + cleaned.substring(4)
  if (!/^0[1-9]\d{8}$/.test(cleaned)) return null
  if (cleaned.startsWith('089')) return null
  return cleaned
}

function normalizeName(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(sarl|sas|sa|eurl|sasu|eirl|ei|auto[- ]?entrepreneur|micro[- ]?entreprise|ets|entreprise|societe|ste)\b/gi, '')
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

function normalizeWebsite(raw: string): string | null {
  if (!raw) return null
  let url = raw.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url
  try {
    const parsed = new URL(url)
    const excluded = ['pagesjaunes.fr', 'facebook.com', 'instagram.com', 'twitter.com', 'linkedin.com', 'x.com']
    if (excluded.some(d => parsed.hostname.includes(d))) return null
    return parsed.toString()
  } catch { return null }
}

// ============================================
// SCRAPER API
// ============================================

async function fetchPage(url: string, retry = 0): Promise<string | null> {
  // premium+render: residential proxies + headless browser to bypass DataDome (~25 credits/req)
  const scraperUrl = `https://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}&premium=true&render=true`
  try {
    const response = await fetch(scraperUrl, { signal: AbortSignal.timeout(SCRAPER_TIMEOUT_MS) })
    stats.apiCreditsUsed++

    if (response.status === 429) {
      console.log(`      ⚠ Rate limit, pause 10s...`)
      await sleep(10000)
      if (retry < MAX_RETRIES) return fetchPage(url, retry + 1)
      return null
    }
    if (response.status === 500) {
      console.log(`      ⚠ ScraperAPI 500 (retry ${retry})`)
      if (retry < MAX_RETRIES) { await sleep(5000); return fetchPage(url, retry + 1) }
      return null
    }
    if (response.status === 403) {
      // DataDome still blocked - pause and retry
      console.log(`      ⛔ 403 DataDome (retry ${retry})`)
      if (retry < MAX_RETRIES) { await sleep(15000); return fetchPage(url, retry + 1) }
      return null
    }
    if (response.status >= 400) {
      return '' // 404 etc = no results
    }
    const html = await response.text()
    // Check for DataDome challenge in HTML
    if (html.includes('Un instant') || (html.length < 5000 && html.includes('datadome'))) {
      console.log(`      ⛔ DataDome challenge in HTML (retry ${retry})`)
      if (retry < MAX_RETRIES) { await sleep(15000); return fetchPage(url, retry + 1) }
      return null
    }
    return html
  } catch (err: any) {
    stats.errors++
    console.log(`      ⚠ Fetch error: ${err.message} (retry ${retry})`)
    if (retry < MAX_RETRIES) { await sleep(3000); return fetchPage(url, retry + 1) }
    return null
  }
}

// ============================================
// HTML PARSING
// ============================================

function parsePJPage(html: string, trade: string, deptCode: string): { listings: PJListing[]; totalPages: number } {
  const listings: PJListing[] = []
  let totalPages = 1

  // Total pages from "Page X</strong> / Y"
  const pageMatch = html.match(/Page\s+\d+\s*<\/strong>\s*\/\s*(\d+)/)
  if (pageMatch) totalPages = parseInt(pageMatch[1]) || 1

  // Parse JSON-LD
  const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)
  if (!jsonLdMatch) return { listings, totalPages }

  try {
    const data = JSON.parse(jsonLdMatch[1])
    const items = Array.isArray(data) ? data : [data]

    for (const item of items) {
      const listItems = item.itemListElement || [item]
      for (const listItem of listItems) {
        const biz = listItem.item || listItem
        if (biz['@type'] !== 'LocalBusiness') continue

        // Page 1: @id="/pros/54299967#..." | Page 2+: @id="...#epj-08187761"
        const idStr = biz['@id'] || biz.url || ''
        const urlMatch = idStr.match(/\/pros\/(\d+)/) || idStr.match(/#epj-(\d+)/)
        if (!urlMatch) continue

        const pjId = urlMatch[1]
        const listing: PJListing = {
          pjId, trade, deptCode,
          name: biz.name || '',
          city: biz.address?.addressLocality || '',
          postalCode: biz.address?.postalCode || '',
          address: biz.address?.streetAddress || '',
        }

        // Phone from bi-fantomas div
        const fantomasPattern = new RegExp(`id="bi-fantomas-${pjId}"[^>]*>([\\s\\S]*?)</div>\\s*</div>`)
        const fantomasMatch = html.match(fantomasPattern)
        if (fantomasMatch) {
          const phoneMatches = fantomasMatch[1].match(/(?:0[1-9])(?:[\s.-]?\d{2}){4}/g)
          if (phoneMatches && phoneMatches.length > 0) {
            const mobile = phoneMatches.find(p => p.replace(/\s/g, '').match(/^0[67]/))
            const raw = mobile || phoneMatches[0]
            listing.phone = normalizePhone(raw) || undefined
            if (listing.phone) stats.phonesFound++
          }
        }

        // Website from bi-website (base64 encoded)
        const denomIdx = html.indexOf(`bi-fantomas-${pjId}`)
        if (denomIdx > 0) {
          const section = html.substring(Math.max(0, denomIdx - 5000), denomIdx + 500)
          const siteMatch = section.match(/bi-website[^>]*data-pjlb='[^']*"url":"([^"]+)"/)
          if (siteMatch) {
            try {
              const decoded = Buffer.from(siteMatch[1], 'base64').toString('utf-8')
              if (decoded.startsWith('http')) listing.website = decoded
            } catch {}
          }
        }

        if (listing.name) {
          listings.push(listing)
          stats.listingsFound++
        }
      }
    }
  } catch {}

  return { listings, totalPages }
}

// ============================================
// PHASE 1: FETCH PJ DATA TO LOCAL FILE
// ============================================

async function phaseFetch(args: { resume: boolean; test: boolean; dept?: string; trade?: string }) {
  if (!SCRAPER_API_KEY) { console.error('SCRAPER_API_KEY manquante'); process.exit(1) }

  console.log('\n' + '='.repeat(60))
  console.log('  PHASE 1: RECUPERATION DES FICHES PAGES JAUNES')
  console.log('  ScraperAPI (1 credit/page) → fichier local')
  console.log('='.repeat(60) + '\n')

  const trades = args.trade ? [args.trade] : TRADE_ORDER
  const depts = args.dept ? [args.dept] : DEPARTEMENTS

  let startTradeIdx = 0, startDeptIdx = 0

  if (args.resume && fs.existsSync(PROGRESS_FILE)) {
    const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'))
    startTradeIdx = progress.tradeIndex || 0
    startDeptIdx = progress.deptIndex || 0
    if (progress.stats) Object.assign(stats, progress.stats)
    console.log(`   Reprise: trade=${startTradeIdx}, dept=${startDeptIdx}`)
    console.log(`   Precedent: ${fmt(stats.listingsFound)} listings, ${fmt(stats.phonesFound)} tel, ${fmt(stats.apiCreditsUsed)} credits\n`)
  }

  const totalCombos = trades.length * depts.length
  let combosDone = startTradeIdx * depts.length + startDeptIdx

  console.log(`   Metiers: ${trades.length} | Departements: ${depts.length} | Combos: ${totalCombos}`)
  console.log(`   Fichier: ${LISTINGS_FILE}`)
  console.log(`   Delai: ${DELAY_BETWEEN_PAGES_MS / 1000}s/page\n`)

  if (args.test) console.log('   MODE TEST: 1 combo\n')

  // Open file for appending
  const fd = fs.openSync(LISTINGS_FILE, 'a')
  startTime = Date.now()

  for (let ti = startTradeIdx; ti < trades.length && !shuttingDown; ti++) {
    const tradeKey = trades[ti]
    const tradeConfig = PJ_TRADE_SLUGS[tradeKey]
    if (!tradeConfig) continue

    for (let di = (ti === startTradeIdx ? startDeptIdx : 0); di < depts.length && !shuttingDown; di++) {
      const deptCode = depts[di]
      const deptName = DEPT_NAMES[deptCode] || deptCode
      const deptSlug = slugifyDept(deptName)
      combosDone++

      let foundResults = false

      for (const tradeSlug of tradeConfig.slugs) {
        if (shuttingDown || foundResults) break

        // Page 1
        const baseUrl = `https://www.pagesjaunes.fr/annuaire/${deptSlug}-${deptCode}/${tradeSlug}`
        const html1 = await fetchPage(baseUrl)
        if (!html1) continue

        const { listings: p1, totalPages } = parsePJPage(html1, tradeKey, deptCode)
        if (p1.length === 0) continue

        foundResults = true
        stats.pagesLoaded++

        // Write page 1 listings
        for (const l of p1) fs.writeSync(fd, JSON.stringify(l) + '\n')

        const p1phones = p1.filter(l => l.phone).length
        console.log(`   [${combosDone}/${totalCombos}] ${tradeConfig.label} | ${deptName} (${deptCode}) | ${totalPages}p | p1: ${p1.length}L ${p1phones}T`)

        // Pages 2+
        for (let p = 2; p <= totalPages && !shuttingDown; p++) {
          await sleep(DELAY_BETWEEN_PAGES_MS)

          const urlP = `${baseUrl}?page=${p}`
          const htmlP = await fetchPage(urlP)
          if (htmlP === null) {
            console.log(`      p${p}: fetch echoue, skip`)
            continue // Try next page
          }
          if (htmlP === '') {
            console.log(`      p${p}: page vide, fin pagination`)
            break
          }

          const { listings: pN } = parsePJPage(htmlP, tradeKey, deptCode)
          if (pN.length === 0) {
            console.log(`      p${p}: 0 listings parsed (html: ${htmlP.length} chars)`)
            break
          }

          stats.pagesLoaded++
          for (const l of pN) fs.writeSync(fd, JSON.stringify(l) + '\n')

          if (p % 5 === 0 || p === totalPages) {
            const pNphones = pN.filter(l => l.phone).length
            console.log(`      p${p}/${totalPages}: ${pN.length}L ${pNphones}T`)
          }

          if (stats.pagesLoaded % 50 === 0) {
            const elapsed = Date.now() - startTime
            const rate = (stats.pagesLoaded / (elapsed / 60000)).toFixed(1)
            console.log(`   📊 ${fmt(stats.pagesLoaded)}p | ${fmt(stats.listingsFound)}L | ${fmt(stats.phonesFound)}T | ${fmt(stats.apiCreditsUsed)}cr | ${rate}p/min | ${formatDuration(elapsed)}`)
          }
        }
      }

      if (!foundResults) {
        console.log(`   [${combosDone}/${totalCombos}] ${tradeConfig.label} | ${deptName} (${deptCode}) | -`)
      }

      // Save progress
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ tradeIndex: ti, deptIndex: di + 1, stats: { ...stats } }, null, 2))

      await sleep(DELAY_BETWEEN_COMBOS_MS)
      if (args.test) shuttingDown = true
    }
  }

  fs.closeSync(fd)

  const elapsed = Date.now() - startTime
  console.log('\n' + '='.repeat(60))
  console.log('  RESUME PHASE 1')
  console.log('='.repeat(60))
  console.log(`  Duree:          ${formatDuration(elapsed)}`)
  console.log(`  Pages:          ${fmt(stats.pagesLoaded)}`)
  console.log(`  Listings:       ${fmt(stats.listingsFound)}`)
  console.log(`  Telephones:     ${fmt(stats.phonesFound)}`)
  console.log(`  Credits API:    ${fmt(stats.apiCreditsUsed)}`)
  console.log(`  Erreurs:        ${stats.errors}`)
  console.log(`  Fichier:        ${LISTINGS_FILE}`)
  console.log('='.repeat(60) + '\n')

  if (shuttingDown) {
    console.log('   --resume pour reprendre')
  } else {
    // Clean progress
    try { fs.unlinkSync(PROGRESS_FILE) } catch {}
    console.log('   Phase 1 terminee! Lancez --match pour enrichir la base')
  }
}

// ============================================
// PHASE 2: MATCH PJ DATA TO SUPABASE
// ============================================

async function phaseMatch(args: { dept?: string }) {
  // Import supabase only for phase 2
  const { supabase } = await import('./lib/supabase-admin')

  console.log('\n' + '='.repeat(60))
  console.log('  PHASE 2: MATCHING PJ → SUPABASE')
  console.log('='.repeat(60) + '\n')

  if (!fs.existsSync(LISTINGS_FILE)) {
    console.error('   Fichier PJ introuvable. Lancez --fetch d\'abord.')
    process.exit(1)
  }

  // Read all listings
  const lines = fs.readFileSync(LISTINGS_FILE, 'utf-8').split('\n').filter(l => l.trim())
  const allListings: PJListing[] = lines.map(l => JSON.parse(l))

  // Filter by dept if specified
  const listings = args.dept ? allListings.filter(l => l.deptCode === args.dept) : allListings
  const withPhone = listings.filter(l => l.phone)

  console.log(`   Total listings:     ${fmt(allListings.length)}`)
  console.log(`   Avec telephone:     ${fmt(withPhone.length)}`)
  if (args.dept) console.log(`   Filtre dept:        ${args.dept}`)
  console.log()

  // Load match progress
  const matched = new Set<string>()
  if (fs.existsSync(MATCH_PROGRESS_FILE)) {
    const prev = JSON.parse(fs.readFileSync(MATCH_PROGRESS_FILE, 'utf-8'))
    prev.matchedPjIds?.forEach((id: string) => matched.add(id))
    stats.matched = prev.stats?.matched || 0
    stats.phonesUpdated = prev.stats?.phonesUpdated || 0
    stats.websitesUpdated = prev.stats?.websitesUpdated || 0
    console.log(`   Reprise: ${fmt(matched.size)} deja traites\n`)
  }

  startTime = Date.now()
  let processed = 0

  // Group by dept for efficient DB queries
  const byDept: Record<string, PJListing[]> = {}
  for (const l of withPhone) {
    if (matched.has(l.pjId)) continue
    if (!byDept[l.deptCode]) byDept[l.deptCode] = []
    byDept[l.deptCode].push(l)
  }

  const deptCodes = Object.keys(byDept).sort()
  console.log(`   ${deptCodes.length} departements a traiter\n`)

  for (const deptCode of deptCodes) {
    if (shuttingDown) break

    const deptListings = byDept[deptCode]
    const deptName = DEPT_NAMES[deptCode] || deptCode
    let deptMatches = 0

    for (const listing of deptListings) {
      if (shuttingDown) break
      processed++

      const normalizedPJName = normalizeName(listing.name)
      if (normalizedPJName.length < 2) { matched.add(listing.pjId); continue }

      // Query candidates — address_city contains INSEE codes (not names),
      // so we match by department + name similarity only
      const nameWords = normalizedPJName.split(/\s+/).filter(w => w.length >= 3)
      const searchTerm = nameWords.slice(0, 2).join(' ') || normalizedPJName

      let query = supabase
        .from('providers')
        .select('id, name, address_city, phone')
        .is('phone', null)
        .eq('source', 'annuaire_entreprises')
        .eq('is_active', true)
        .eq('address_department', deptCode)
        .ilike('name', `%${searchTerm.replace(/'/g, "''")}%`)

      const { data: candidates, error } = await query.limit(50)

      if (error) {
        console.log(`      ⚠ DB error: ${error.message}`)
        stats.errors++
        await sleep(2000)
        continue
      }

      if (!candidates || candidates.length === 0) {
        matched.add(listing.pjId)
        continue
      }

      // Find best match
      let bestMatch: { id: string; score: number } | null = null
      for (const c of candidates) {
        if (c.phone) continue
        const score = nameSimilarity(normalizedPJName, normalizeName(c.name))
        if (score >= MATCH_THRESHOLD && (!bestMatch || score > bestMatch.score)) {
          bestMatch = { id: c.id, score }
        }
      }

      matched.add(listing.pjId)

      if (!bestMatch) continue

      const updateFields: Record<string, unknown> = { phone: listing.phone }
      stats.phonesUpdated++

      if (listing.website) {
        const cleanUrl = normalizeWebsite(listing.website)
        if (cleanUrl) { updateFields.website = cleanUrl; stats.websitesUpdated++ }
      }

      const { error: updateError } = await supabase
        .from('providers')
        .update(updateFields)
        .eq('id', bestMatch.id)

      if (!updateError) {
        stats.matched++
        deptMatches++
      }

      // Save progress every 100 listings
      if (processed % 100 === 0) {
        fs.writeFileSync(MATCH_PROGRESS_FILE, JSON.stringify({
          matchedPjIds: Array.from(matched),
          stats: { matched: stats.matched, phonesUpdated: stats.phonesUpdated, websitesUpdated: stats.websitesUpdated },
        }))
      }
    }

    console.log(`   ${deptName} (${deptCode}): ${deptListings.length} listings → ${deptMatches} matches`)
  }

  // Final save
  fs.writeFileSync(MATCH_PROGRESS_FILE, JSON.stringify({
    matchedPjIds: Array.from(matched),
    stats: { matched: stats.matched, phonesUpdated: stats.phonesUpdated, websitesUpdated: stats.websitesUpdated },
  }))

  const elapsed = Date.now() - startTime
  console.log('\n' + '='.repeat(60))
  console.log('  RESUME PHASE 2')
  console.log('='.repeat(60))
  console.log(`  Duree:          ${formatDuration(elapsed)}`)
  console.log(`  Traites:        ${fmt(processed)}`)
  console.log(`  Matches:        ${fmt(stats.matched)}`)
  console.log(`  Telephones MAJ: ${fmt(stats.phonesUpdated)}`)
  console.log(`  Sites web MAJ:  ${fmt(stats.websitesUpdated)}`)
  console.log(`  Erreurs:        ${stats.errors}`)
  console.log('='.repeat(60) + '\n')
}

// ============================================
// MAIN
// ============================================

async function main() {
  const args = process.argv.slice(2)
  const flags = {
    fetch: args.includes('--fetch'),
    match: args.includes('--match'),
    resume: args.includes('--resume'),
    test: args.includes('--test'),
    dept: args.includes('--dept') ? args[args.indexOf('--dept') + 1] : undefined,
    trade: args.includes('--trade') ? args[args.indexOf('--trade') + 1] : undefined,
  }

  if (!flags.fetch && !flags.match) {
    console.log(`
Usage:
  npx tsx scripts/enrich-phone.ts --fetch [--resume] [--test] [--dept XX] [--trade SLUG]
  npx tsx scripts/enrich-phone.ts --match [--dept XX]

Phase 1 (--fetch): Recupere les fiches PJ via ScraperAPI → fichier local
Phase 2 (--match): Matche les fiches PJ avec Supabase → enrichit les telephones

Metiers: ${TRADE_ORDER.join(', ')}
`)
    process.exit(0)
  }

  process.on('SIGINT', () => {
    if (shuttingDown) process.exit(1)
    console.log('\n   Arret gracieux...')
    shuttingDown = true
  })

  if (flags.fetch) await phaseFetch(flags)
  if (flags.match) await phaseMatch(flags)
}

main()
  .then(() => process.exit(0))
  .catch(e => { console.error('\n   Erreur fatale:', e); process.exit(1) })
