/**
 * Scraping Google Maps via ScraperAPI — Enrichissement téléphone + infos
 *
 * PHASE 1 (--fetch): Recherche Google Maps pour chaque métier × département
 *   - Utilise ScraperAPI pour fetch les pages Google Maps (render=true)
 *   - Extrait les résultats locaux via aria-label et parsing HTML
 *   - Sauvegarde dans gm-listings.jsonl
 *
 * PHASE 2 (--match): Matche les résultats avec Supabase
 *   - Lit gm-listings.jsonl
 *   - Matche par nom + département (même algo que enrich-phone.ts)
 *   - Met à jour téléphone, rating, website si trouvé
 *   - Saute les artisans qui ont déjà un téléphone
 *
 * Usage:
 *   npx tsx scripts/scrape-google-maps.ts --fetch                 # Phase 1
 *   npx tsx scripts/scrape-google-maps.ts --fetch --resume        # Reprendre
 *   npx tsx scripts/scrape-google-maps.ts --fetch --test          # Test 1 combo
 *   npx tsx scripts/scrape-google-maps.ts --match                 # Phase 2
 *   npx tsx scripts/scrape-google-maps.ts --match --dept 75       # Match 1 dept
 */

import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

// ============================================
// CONFIG
// ============================================

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY
const DELAY_BETWEEN_REQUESTS_MS = 4000
const DELAY_BETWEEN_COMBOS_MS = 1000
const SCRAPER_TIMEOUT_MS = 90000 // Google Maps render takes longer
const MAX_RETRIES = 2
const MATCH_THRESHOLD = 0.6

const DATA_DIR = path.join(__dirname, '.gm-data')
const LISTINGS_FILE = path.join(DATA_DIR, 'gm-listings.jsonl')
const PROGRESS_FILE = path.join(DATA_DIR, 'fetch-progress.json')
const MATCH_PROGRESS_FILE = path.join(DATA_DIR, 'match-progress.json')

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

// Major city per department for better Google Maps results
const DEPT_CITIES: Record<string, string> = {
  '01':'Bourg-en-Bresse','02':'Laon','03':'Moulins','04':'Digne-les-Bains','05':'Gap',
  '06':'Nice','07':'Privas','08':'Charleville-Mézières','09':'Foix','10':'Troyes',
  '11':'Carcassonne','12':'Rodez','13':'Marseille','14':'Caen','15':'Aurillac',
  '16':'Angoulême','17':'La Rochelle','18':'Bourges','19':'Tulle','2A':'Ajaccio',
  '2B':'Bastia','21':'Dijon','22':'Saint-Brieuc','23':'Guéret','24':'Périgueux',
  '25':'Besançon','26':'Valence','27':'Évreux','28':'Chartres','29':'Quimper',
  '30':'Nîmes','31':'Toulouse','32':'Auch','33':'Bordeaux','34':'Montpellier',
  '35':'Rennes','36':'Châteauroux','37':'Tours','38':'Grenoble','39':'Lons-le-Saunier',
  '40':'Mont-de-Marsan','41':'Blois','42':'Saint-Étienne','43':'Le Puy-en-Velay','44':'Nantes',
  '45':'Orléans','46':'Cahors','47':'Agen','48':'Mende','49':'Angers',
  '50':'Saint-Lô','51':'Reims','52':'Chaumont','53':'Laval','54':'Nancy',
  '55':'Bar-le-Duc','56':'Vannes','57':'Metz','58':'Nevers','59':'Lille',
  '60':'Beauvais','61':'Alençon','62':'Arras','63':'Clermont-Ferrand','64':'Pau',
  '65':'Tarbes','66':'Perpignan','67':'Strasbourg','68':'Colmar','69':'Lyon',
  '70':'Vesoul','71':'Mâcon','72':'Le Mans','73':'Chambéry','74':'Annecy',
  '75':'Paris','76':'Rouen','77':'Melun','78':'Versailles','79':'Niort',
  '80':'Amiens','81':'Albi','82':'Montauban','83':'Toulon','84':'Avignon',
  '85':'La Roche-sur-Yon','86':'Poitiers','87':'Limoges','88':'Épinal','89':'Auxerre',
  '90':'Belfort','91':'Évry','92':'Nanterre','93':'Bobigny','94':'Créteil','95':'Cergy',
}

// ============================================
// GOOGLE MAPS TRADE QUERIES
// ============================================

const GM_TRADES: { key: string; query: string; label: string }[] = [
  { key: 'plombier', query: 'plombier', label: 'Plombier' },
  { key: 'electricien', query: 'électricien', label: 'Électricien' },
  { key: 'chauffagiste', query: 'chauffagiste', label: 'Chauffagiste' },
  { key: 'menuisier', query: 'menuisier', label: 'Menuisier' },
  { key: 'serrurier', query: 'serrurier', label: 'Serrurier' },
  { key: 'couvreur', query: 'couvreur', label: 'Couvreur' },
  { key: 'macon', query: 'maçon', label: 'Maçon' },
  { key: 'peintre', query: 'peintre en bâtiment', label: 'Peintre' },
  { key: 'carreleur', query: 'carreleur', label: 'Carreleur' },
  { key: 'charpentier', query: 'charpentier', label: 'Charpentier' },
  { key: 'platrier', query: 'plâtrier plaquiste', label: 'Plâtrier' },
  { key: 'facade', query: 'façadier ravalement', label: 'Façadier' },
  { key: 'terrassier', query: 'terrassement', label: 'Terrassier' },
]

const TRADE_ORDER = GM_TRADES.map(t => t.key)

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
  ratingsUpdated: 0,
  websitesUpdated: 0,
  errors: 0,
  apiCreditsUsed: 0,
}

// ============================================
// TYPES
// ============================================

interface GMListing {
  gmId: string         // unique ID: trade-dept-name hash
  name: string
  phone?: string
  address?: string
  city?: string
  rating?: number
  reviewCount?: number
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

function normalizePhone(raw: string): string | null {
  if (!raw) return null
  let cleaned = raw.replace(/[^\d+]/g, '')
  if (cleaned.startsWith('+33')) cleaned = '0' + cleaned.substring(3)
  if (cleaned.startsWith('0033')) cleaned = '0' + cleaned.substring(4)
  if (!/^0[1-9]\d{8}$/.test(cleaned)) return null
  // Filter premium numbers
  if (cleaned.startsWith('089') || cleaned.startsWith('036')) return null
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
    const excluded = ['google.com', 'google.fr', 'facebook.com', 'instagram.com', 'twitter.com', 'linkedin.com', 'x.com', 'pagesjaunes.fr']
    if (excluded.some(d => parsed.hostname.includes(d))) return null
    return parsed.toString()
  } catch { return null }
}

function hashId(trade: string, dept: string, name: string): string {
  // Simple deterministic ID
  const str = `${trade}-${dept}-${name.toLowerCase().trim()}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return `gm-${Math.abs(hash).toString(36)}`
}

// ============================================
// SCRAPER API — Google Maps
// ============================================

async function fetchGoogleMaps(query: string, retry = 0): Promise<string | null> {
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}/`
  const scraperUrl = `https://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(mapsUrl)}&render=true&country_code=fr`

  try {
    const response = await fetch(scraperUrl, { signal: AbortSignal.timeout(SCRAPER_TIMEOUT_MS) })
    stats.apiCreditsUsed += 10 // render=true costs 10 credits

    if (response.status === 429) {
      console.log(`      ⚠ Rate limit, pause 15s...`)
      await sleep(15000)
      if (retry < MAX_RETRIES) return fetchGoogleMaps(query, retry + 1)
      return null
    }
    if (response.status === 500) {
      console.log(`      ⚠ ScraperAPI 500 (retry ${retry})`)
      if (retry < MAX_RETRIES) { await sleep(8000); return fetchGoogleMaps(query, retry + 1) }
      return null
    }
    if (response.status === 403) {
      console.log(`      ⛔ 403 blocked (retry ${retry})`)
      if (retry < MAX_RETRIES) { await sleep(15000); return fetchGoogleMaps(query, retry + 1) }
      return null
    }
    if (response.status >= 400) {
      return '' // 404 etc = no results
    }

    const html = await response.text()
    if (html.length < 2000) {
      console.log(`      ⚠ Short response (${html.length} chars), possible captcha`)
      if (retry < MAX_RETRIES) { await sleep(10000); return fetchGoogleMaps(query, retry + 1) }
      return null
    }

    return html
  } catch (err: any) {
    stats.errors++
    console.log(`      ⚠ Fetch error: ${err.message} (retry ${retry})`)
    if (retry < MAX_RETRIES) { await sleep(5000); return fetchGoogleMaps(query, retry + 1) }
    return null
  }
}

// Also try Google Search for local pack results (more reliable for phone numbers)
async function fetchGoogleSearch(query: string, retry = 0): Promise<string | null> {
  const searchUrl = `https://www.google.fr/search?q=${encodeURIComponent(query)}&hl=fr&gl=fr&num=20`
  const scraperUrl = `https://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(searchUrl)}&country_code=fr`

  try {
    const response = await fetch(scraperUrl, { signal: AbortSignal.timeout(SCRAPER_TIMEOUT_MS) })
    stats.apiCreditsUsed += 5 // standard request

    if (response.status === 429) {
      console.log(`      ⚠ Rate limit (search), pause 10s...`)
      await sleep(10000)
      if (retry < MAX_RETRIES) return fetchGoogleSearch(query, retry + 1)
      return null
    }
    if (response.status === 500) {
      if (retry < MAX_RETRIES) { await sleep(5000); return fetchGoogleSearch(query, retry + 1) }
      return null
    }
    if (response.status >= 400) return ''

    return await response.text()
  } catch (err: any) {
    stats.errors++
    if (retry < MAX_RETRIES) { await sleep(3000); return fetchGoogleSearch(query, retry + 1) }
    return null
  }
}

// ============================================
// HTML PARSING — Google Maps
// ============================================

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;|\xa0/g, ' ')
    .replace(/\\u([\da-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
}

function parseGoogleMapsPage(html: string, trade: string, deptCode: string): GMListing[] {
  const listings: GMListing[] = []
  const seen = new Set<string>()

  // RELIABLE PATTERN: In Google Maps rendered HTML, each business listing has:
  //   1. rating aria-label="X,X étoiles Y avis"  (position A)
  //   2. phone number "0X XX XX XX XX"            (position B, after A)
  //   3. "Obtenir un itinéraire vers {NAME}"      (position C, after B)
  // We anchor on pattern 3 and look backwards for phone + rating.

  const directionRegex = /aria-label="Obtenir un itin.raire vers ([^"]{2,80})"/g
  let match

  while ((match = directionRegex.exec(html)) !== null) {
    const name = decodeHtmlEntities(match[1]).trim()
    if (!name || name.length < 2) continue
    if (seen.has(name.toLowerCase())) continue

    // Look backwards ~3000 chars for phone and rating
    const lookbackStart = Math.max(0, match.index - 3000)
    const context = html.substring(lookbackStart, match.index)

    // Find the LAST phone number in the context (closest to name)
    let phone: string | undefined
    const phoneMatches = [...context.matchAll(/(0[1-9][\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2})/g)]
    if (phoneMatches.length > 0) {
      const lastPhoneMatch = phoneMatches[phoneMatches.length - 1]
      const normalized = normalizePhone(lastPhoneMatch[1])
      // Filter out fake/tracking numbers (09XX prefix or very round numbers)
      if (normalized && !/^09[59]/.test(normalized)) {
        phone = normalized
      }
    }

    // Find the LAST rating in the context (closest to name)
    // Handle &nbsp; in HTML: "4,3&nbsp;étoiles 30&nbsp;avis"
    let rating: number | undefined
    let reviewCount: number | undefined
    const ctxClean = context.replace(/&nbsp;|\xa0|\u00a0/g, ' ')
    const ratingMatches = [...ctxClean.matchAll(/(\d[,.]?\d?)\s*.toiles?\s+(\d[\d\s]*)\s*avis/g)]
    if (ratingMatches.length > 0) {
      const lastRating = ratingMatches[ratingMatches.length - 1]
      rating = parseFloat(lastRating[1].replace(',', '.'))
      reviewCount = parseInt(lastRating[2].replace(/\s/g, ''))
    }

    // Look for "Visiter le site Web de {NAME}" — href comes AFTER aria-label
    let website: string | undefined
    const nameEscaped = name.substring(0, 20).replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&')
    const wsRegex1 = new RegExp(`aria-label="Visiter le site Web de[^"]*${nameEscaped}[^"]*"[^>]*href="([^"]+)"`, 'i')
    const wsRegex2 = new RegExp(`href="(https?://[^"]+)"[^>]*aria-label="Visiter le site Web de[^"]*${nameEscaped}`, 'i')
    const searchArea = html.substring(lookbackStart, Math.min(html.length, match.index + 2000))
    const wsMatch = searchArea.match(wsRegex1) || searchArea.match(wsRegex2)
    if (wsMatch) {
      website = normalizeWebsite(wsMatch[1]) || undefined
    }

    seen.add(name.toLowerCase())
    listings.push({
      gmId: hashId(trade, deptCode, name),
      name,
      phone,
      rating,
      reviewCount,
      website,
      trade,
      deptCode,
    })
  }

  // FALLBACK: if most listings have no rating, try matching by positional index
  // In Google Maps HTML, ratings appear in order before their corresponding business
  const listingsWithoutRating = listings.filter(l => !l.rating)
  if (listingsWithoutRating.length > listings.length * 0.5 && listings.length > 0) {
    const htmlClean = html.replace(/&nbsp;|\xa0|\u00a0/g, ' ')
    const ratingRegex = /(\d[,.]\d)\s*.toiles?\s+(\d[\d\s]*)\s*avis/g
    const allRatings: { rating: number; reviewCount: number; idx: number }[] = []
    let rm
    while ((rm = ratingRegex.exec(htmlClean)) !== null) {
      allRatings.push({
        rating: parseFloat(rm[1].replace(',', '.')),
        reviewCount: parseInt(rm[2].replace(/\s/g, '')),
        idx: rm.index,
      })
    }

    // For each listing, find the closest preceding rating by position
    const dirRegex = /Obtenir un itin.raire vers ([^"]{2,80})"/g
    const dirPositions: { name: string; idx: number }[] = []
    let dm
    while ((dm = dirRegex.exec(htmlClean)) !== null) {
      dirPositions.push({ name: decodeHtmlEntities(dm[1]).trim(), idx: dm.index })
    }

    for (const listing of listings) {
      if (listing.rating) continue
      const dirPos = dirPositions.find(d => d.name.toLowerCase() === listing.name.toLowerCase())
      if (!dirPos) continue
      // Find the last rating that appears before this direction link
      const precedingRating = allRatings.filter(r => r.idx < dirPos.idx).pop()
      if (precedingRating) {
        listing.rating = precedingRating.rating
        listing.reviewCount = listing.reviewCount || precedingRating.reviewCount
      }
    }
  }

  // BACKUP: also check for business name links that aren't directions links
  // Pattern: aria-label="{BUSINESS_NAME}" on clickable elements near phone numbers
  const businessLinkRegex = /class="[^"]*hfpxzc[^"]*"[^>]*aria-label="([^"]{3,80})"/g
  while ((match = businessLinkRegex.exec(html)) !== null) {
    const name = decodeHtmlEntities(match[1]).trim()
    if (!name || seen.has(name.toLowerCase())) continue
    if (/^(résultats|filtres|réduire|plan|en savoir|obtenir|visiter)/i.test(name)) continue

    const lookforwardEnd = Math.min(html.length, match.index + 3000)
    const context = html.substring(match.index, lookforwardEnd)

    let phone: string | undefined
    const phoneMatch = context.match(/(0[1-9][\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2})/)
    if (phoneMatch) {
      const normalized = normalizePhone(phoneMatch[1])
      if (normalized && !/^09[59]/.test(normalized)) phone = normalized
    }

    let rating: number | undefined
    let reviewCount: number | undefined
    const ctxClean2 = context.replace(/&nbsp;|\xa0/g, ' ')
    const ratingMatch = ctxClean2.match(/(\d[,.]?\d?)\s*.toiles?\s+(\d[\d\s]*)\s*avis/)
    if (ratingMatch) {
      rating = parseFloat(ratingMatch[1].replace(',', '.'))
      reviewCount = parseInt(ratingMatch[2].replace(/\s/g, ''))
    }

    // Website
    let website: string | undefined
    const nameEsc = name.substring(0, 20).replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&')
    const wsR1 = new RegExp(`aria-label="Visiter le site Web de[^"]*${nameEsc}[^"]*"[^>]*href="([^"]+)"`, 'i')
    const wsR2 = new RegExp(`href="(https?://[^"]+)"[^>]*aria-label="Visiter le site Web de[^"]*${nameEsc}`, 'i')
    const wsM = context.match(wsR1) || context.match(wsR2)
    if (wsM) website = normalizeWebsite(wsM[1]) || undefined

    seen.add(name.toLowerCase())
    listings.push({
      gmId: hashId(trade, deptCode, name),
      name,
      phone,
      rating,
      reviewCount,
      website,
      trade,
      deptCode,
    })
  }

  return listings
}

// ============================================
// GOOGLE SEARCH LOCAL PACK PARSING
// ============================================

function parseGoogleSearchLocalPack(html: string, trade: string, deptCode: string): GMListing[] {
  const listings: GMListing[] = []
  const seen = new Set<string>()

  // RELIABLE PATTERN: In Google Search local pack, each business has:
  //   class="OSrXXb">{NAME}  then  phone 0X XX XX XX XX shortly after
  // We anchor on the OSrXXb class (business name) and look forward for the phone.

  const nameRegex = /class="[^"]*OSrXXb[^"]*"[^>]*>([^<]{3,80})</g
  let match

  while ((match = nameRegex.exec(html)) !== null) {
    const rawName = match[1].trim()
    const name = decodeHtmlEntities(rawName)
    if (!name || name.length < 2) continue
    // Skip heading-level "Entreprises" labels
    if (/^(entreprises?|résultats|recherche|plus de|voir|afficher)/i.test(name)) continue
    if (seen.has(name.toLowerCase())) continue

    // Look forward ~1500 chars for the first phone number
    const lookforwardEnd = Math.min(html.length, match.index + 1500)
    const context = html.substring(match.index, lookforwardEnd)

    let phone: string | undefined
    const phoneMatch = context.match(/(0[1-9][\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2})/)
    if (phoneMatch) {
      const normalized = normalizePhone(phoneMatch[1])
      if (normalized) phone = normalized
    }

    // Look for rating in context — Google Search uses "X,X" near star icons, or "(XXX)"
    let rating: number | undefined
    let reviewCount: number | undefined
    // Pattern: "4,5" class with star display, then "(120)" for review count
    const ratingMatch = context.match(/(\d[,.]\d)\s*(?:étoiles?|stars?|<)/)
    if (ratingMatch) rating = parseFloat(ratingMatch[1].replace(',', '.'))
    // Review count in parentheses like (120) or (1 234)
    const reviewMatch = context.match(/\((\d[\d\s.,]*)\)/)
    if (reviewMatch) {
      const cleaned = reviewMatch[1].replace(/[\s.,]/g, '')
      if (/^\d+$/.test(cleaned)) reviewCount = parseInt(cleaned)
    }

    // Website from href near the business
    let website: string | undefined
    const wsMatch = context.match(/href="(https?:\/\/(?!www\.google)[^"]{5,200})"/)
    if (wsMatch) website = normalizeWebsite(wsMatch[1]) || undefined

    seen.add(name.toLowerCase())
    listings.push({
      gmId: hashId(trade, deptCode, name),
      name,
      phone,
      rating,
      reviewCount,
      website,
      trade,
      deptCode,
    })
  }

  return listings
}

// ============================================
// PHASE 1: FETCH FROM GOOGLE
// ============================================

async function phaseFetch(args: { resume: boolean; test: boolean; dept?: string; trade?: string }) {
  if (!SCRAPER_API_KEY) {
    console.error('   ❌ SCRAPER_API_KEY manquant dans .env.local')
    process.exit(1)
  }

  console.log('\n' + '='.repeat(60))
  console.log('  PHASE 1: SCRAPING GOOGLE MAPS')
  console.log('='.repeat(60))

  // Build combo list: trade × department
  const combos: { trade: string; deptCode: string }[] = []
  const tradeKeys = args.trade ? [args.trade] : TRADE_ORDER
  const deptCodes = args.dept ? [args.dept] : DEPARTEMENTS

  for (const trade of tradeKeys) {
    for (const dept of deptCodes) {
      combos.push({ trade, deptCode: dept })
    }
  }

  if (args.test) combos.splice(1) // Keep only first combo

  console.log(`   Combos: ${fmt(combos.length)} (${tradeKeys.length} métiers × ${deptCodes.length} depts)`)
  console.log(`   Fichier: ${LISTINGS_FILE}`)

  // Load progress
  let completedCombos = new Set<string>()
  if (args.resume && fs.existsSync(PROGRESS_FILE)) {
    const prev = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'))
    completedCombos = new Set(prev.completedCombos || [])
    stats.pagesLoaded = prev.stats?.pagesLoaded || 0
    stats.listingsFound = prev.stats?.listingsFound || 0
    stats.phonesFound = prev.stats?.phonesFound || 0
    stats.errors = prev.stats?.errors || 0
    stats.apiCreditsUsed = prev.stats?.apiCreditsUsed || 0
    console.log(`   Reprise: ${fmt(completedCombos.size)} combos déjà faits\n`)
  } else {
    console.log()
  }

  startTime = Date.now()
  let processed = 0
  const total = combos.length

  for (const combo of combos) {
    if (shuttingDown) break
    const comboKey = `${combo.trade}-${combo.deptCode}`
    if (completedCombos.has(comboKey)) { processed++; continue }

    processed++
    const tradeInfo = GM_TRADES.find(t => t.key === combo.trade)
    if (!tradeInfo) continue

    const deptName = DEPT_NAMES[combo.deptCode] || combo.deptCode
    const cityName = DEPT_CITIES[combo.deptCode] || deptName

    // Search query: "plombier Marseille" for better local results
    const query = `${tradeInfo.query} ${cityName}`
    const elapsed = formatDuration(Date.now() - startTime)
    const rate = processed > 1 ? Math.round((processed - 1) / ((Date.now() - startTime) / 60000)) : 0

    process.stdout.write(
      `   [${processed}/${total}] ${tradeInfo.label} | ${deptName} (${combo.deptCode}) | ${fmt(stats.listingsFound)} listings | ${rate}/min    \r`
    )

    let allListings: GMListing[] = []

    // Strategy 1: Google Maps search
    const mapsHtml = await fetchGoogleMaps(query)
    if (mapsHtml) {
      stats.pagesLoaded++
      const mapsListings = parseGoogleMapsPage(mapsHtml, combo.trade, combo.deptCode)
      allListings.push(...mapsListings)
    }

    await sleep(DELAY_BETWEEN_REQUESTS_MS)

    // Strategy 2: Google Search for local pack (often has phone numbers)
    const searchQuery = `${tradeInfo.query} ${cityName} téléphone`
    const searchHtml = await fetchGoogleSearch(searchQuery)
    if (searchHtml) {
      stats.pagesLoaded++
      const searchListings = parseGoogleSearchLocalPack(searchHtml, combo.trade, combo.deptCode)
      // Merge, avoiding duplicates
      const existingNames = new Set(allListings.map(l => l.name.toLowerCase()))
      for (const sl of searchListings) {
        if (!existingNames.has(sl.name.toLowerCase())) {
          allListings.push(sl)
        }
      }
    }

    // Deduplicate by phone
    const seenPhones = new Set<string>()
    const uniqueListings: GMListing[] = []
    for (const l of allListings) {
      if (l.phone && seenPhones.has(l.phone)) continue
      if (l.phone) seenPhones.add(l.phone)
      uniqueListings.push(l)
    }

    // Save to JSONL
    if (uniqueListings.length > 0) {
      const lines = uniqueListings.map(l => JSON.stringify(l)).join('\n') + '\n'
      fs.appendFileSync(LISTINGS_FILE, lines)
      stats.listingsFound += uniqueListings.length
      stats.phonesFound += uniqueListings.filter(l => l.phone).length
    }

    // Mark combo as done
    completedCombos.add(comboKey)

    // Save progress every 5 combos
    if (processed % 5 === 0) {
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify({
        completedCombos: Array.from(completedCombos),
        stats: { pagesLoaded: stats.pagesLoaded, listingsFound: stats.listingsFound, phonesFound: stats.phonesFound, errors: stats.errors, apiCreditsUsed: stats.apiCreditsUsed },
      }))
    }

    const phonesInCombo = uniqueListings.filter(l => l.phone).length
    console.log(
      `   [${processed}/${total}] ${tradeInfo.label} | ${deptName} (${combo.deptCode}) → ${uniqueListings.length}L ${phonesInCombo}T    `
    )

    await sleep(DELAY_BETWEEN_COMBOS_MS)
  }

  // Final save
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({
    completedCombos: Array.from(completedCombos),
    stats: { pagesLoaded: stats.pagesLoaded, listingsFound: stats.listingsFound, phonesFound: stats.phonesFound, errors: stats.errors, apiCreditsUsed: stats.apiCreditsUsed },
  }))

  const elapsed = Date.now() - startTime
  console.log('\n' + '='.repeat(60))
  console.log('  RÉSUMÉ PHASE 1 — GOOGLE MAPS')
  console.log('='.repeat(60))
  console.log(`  Durée:             ${formatDuration(elapsed)}`)
  console.log(`  Pages chargées:    ${fmt(stats.pagesLoaded)}`)
  console.log(`  Listings trouvés:  ${fmt(stats.listingsFound)}`)
  console.log(`  Avec téléphone:    ${fmt(stats.phonesFound)}`)
  console.log(`  Erreurs:           ${stats.errors}`)
  console.log(`  Crédits API:       ~${fmt(stats.apiCreditsUsed)}`)
  console.log('='.repeat(60) + '\n')
}

// ============================================
// PHASE 2: MATCH TO SUPABASE
// ============================================

async function phaseMatch(args: { dept?: string }) {
  console.log('\n' + '='.repeat(60))
  console.log('  PHASE 2: MATCH GOOGLE MAPS → SUPABASE')
  console.log('='.repeat(60))

  // Dynamic import for Supabase
  const { createClient } = await import('@supabase/supabase-js')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('   ❌ Variables Supabase manquantes')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  if (!fs.existsSync(LISTINGS_FILE)) {
    console.error('   ❌ Fichier GM introuvable. Lancez --fetch d\'abord.')
    process.exit(1)
  }

  // Read all listings
  const lines = fs.readFileSync(LISTINGS_FILE, 'utf-8').split('\n').filter(l => l.trim())
  const allListings: GMListing[] = lines.map(l => JSON.parse(l))

  // Filter by dept if specified
  const listings = args.dept ? allListings.filter(l => l.deptCode === args.dept) : allListings
  const withPhone = listings.filter(l => l.phone)

  console.log(`   Total listings:     ${fmt(allListings.length)}`)
  console.log(`   Avec téléphone:     ${fmt(withPhone.length)}`)
  if (args.dept) console.log(`   Filtre dept:        ${args.dept}`)
  console.log()

  // Load match progress
  const matched = new Set<string>()
  if (fs.existsSync(MATCH_PROGRESS_FILE)) {
    const prev = JSON.parse(fs.readFileSync(MATCH_PROGRESS_FILE, 'utf-8'))
    prev.matchedGmIds?.forEach((id: string) => matched.add(id))
    stats.matched = prev.stats?.matched || 0
    stats.phonesUpdated = prev.stats?.phonesUpdated || 0
    stats.ratingsUpdated = prev.stats?.ratingsUpdated || 0
    stats.websitesUpdated = prev.stats?.websitesUpdated || 0
    console.log(`   Reprise: ${fmt(matched.size)} déjà traités\n`)
  }

  startTime = Date.now()
  let processed = 0

  // Group by dept for efficient DB queries
  const byDept: Record<string, GMListing[]> = {}
  for (const l of withPhone) {
    if (matched.has(l.gmId)) continue
    if (!byDept[l.deptCode]) byDept[l.deptCode] = []
    byDept[l.deptCode].push(l)
  }

  const deptCodes = Object.keys(byDept).sort()
  console.log(`   ${deptCodes.length} départements à traiter\n`)

  for (const deptCode of deptCodes) {
    if (shuttingDown) break

    const deptListings = byDept[deptCode]
    const deptName = DEPT_NAMES[deptCode] || deptCode
    let deptMatches = 0

    for (const listing of deptListings) {
      if (shuttingDown) break
      processed++

      const normalizedGMName = normalizeName(listing.name)
      if (normalizedGMName.length < 2) { matched.add(listing.gmId); continue }

      // Query candidates — same strategy as enrich-phone.ts
      const nameWords = normalizedGMName.split(/\s+/).filter(w => w.length >= 3)
      const searchTerm = nameWords.slice(0, 2).join(' ') || normalizedGMName

      const { data: candidates, error } = await supabase
        .from('providers')
        .select('id, name, address_city, phone, google_rating')
        .is('phone', null)
        .eq('is_active', true)
        .eq('address_department', deptCode)
        .ilike('name', `%${searchTerm.replace(/'/g, "''")}%`)
        .limit(50)

      if (error) {
        console.log(`      ⚠ DB error: ${error.message}`)
        stats.errors++
        await sleep(2000)
        continue
      }

      if (!candidates || candidates.length === 0) {
        matched.add(listing.gmId)
        continue
      }

      // Find best match
      let bestMatch: { id: string; score: number } | null = null
      for (const c of candidates) {
        if (c.phone) continue
        const score = nameSimilarity(normalizedGMName, normalizeName(c.name))
        if (score >= MATCH_THRESHOLD && (!bestMatch || score > bestMatch.score)) {
          bestMatch = { id: c.id, score }
        }
      }

      matched.add(listing.gmId)
      if (!bestMatch) continue

      // Build update
      const updateFields: Record<string, unknown> = { phone: listing.phone }
      stats.phonesUpdated++

      if (listing.rating && listing.rating >= 1 && listing.rating <= 5) {
        updateFields.google_rating = listing.rating
        if (listing.reviewCount) updateFields.google_review_count = listing.reviewCount
        stats.ratingsUpdated++
      }

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
          matchedGmIds: Array.from(matched),
          stats: { matched: stats.matched, phonesUpdated: stats.phonesUpdated, ratingsUpdated: stats.ratingsUpdated, websitesUpdated: stats.websitesUpdated },
        }))
      }
    }

    console.log(`   ${deptName} (${deptCode}): ${deptListings.length} listings → ${deptMatches} matches`)
  }

  // Final save
  fs.writeFileSync(MATCH_PROGRESS_FILE, JSON.stringify({
    matchedGmIds: Array.from(matched),
    stats: { matched: stats.matched, phonesUpdated: stats.phonesUpdated, ratingsUpdated: stats.ratingsUpdated, websitesUpdated: stats.websitesUpdated },
  }))

  const elapsed = Date.now() - startTime
  console.log('\n' + '='.repeat(60))
  console.log('  RÉSUMÉ PHASE 2 — GOOGLE MAPS')
  console.log('='.repeat(60))
  console.log(`  Durée:             ${formatDuration(elapsed)}`)
  console.log(`  Traités:           ${fmt(processed)}`)
  console.log(`  Matches:           ${fmt(stats.matched)}`)
  console.log(`  Téléphones MAJ:    ${fmt(stats.phonesUpdated)}`)
  console.log(`  Ratings MAJ:       ${fmt(stats.ratingsUpdated)}`)
  console.log(`  Sites web MAJ:     ${fmt(stats.websitesUpdated)}`)
  console.log(`  Erreurs:           ${stats.errors}`)
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
  npx tsx scripts/scrape-google-maps.ts --fetch [--resume] [--test] [--dept XX] [--trade KEY]
  npx tsx scripts/scrape-google-maps.ts --match [--dept XX]

Phase 1 (--fetch): Scrape Google Maps via ScraperAPI → fichier local
Phase 2 (--match): Matche les résultats avec Supabase → enrichit téléphones + ratings

Métiers: ${TRADE_ORDER.join(', ')}
`)
    process.exit(0)
  }

  process.on('SIGINT', () => {
    if (shuttingDown) process.exit(1)
    console.log('\n   Arrêt gracieux...')
    shuttingDown = true
  })

  if (flags.fetch) await phaseFetch(flags)
  if (flags.match) await phaseMatch(flags)
}

main()
  .then(() => process.exit(0))
  .catch(e => { console.error('\n   Erreur fatale:', e); process.exit(1) })
