/**
 * Google Maps Scraping V2 — Multi-worker avec montée en charge progressive
 *
 * - Démarre avec 1 worker, ajoute 1 toutes les 2 minutes (max 5)
 * - Anti-doublon : skip les phones déjà en DB
 * - Matching + upload en temps réel (pas de phase séparée)
 * - Resume automatique
 *
 * Usage: npx tsx scripts/scrape-gm-turbo.ts [--resume] [--max-workers N] [--dry-run]
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
const LISTINGS_FILE = path.join(DATA_DIR, 'gm-listings-v2.jsonl')
const PROGRESS_FILE = path.join(DATA_DIR, 'turbo-progress.json')

const INITIAL_WORKERS = 1
const SCALE_INTERVAL_MS = 2 * 60 * 1000  // Add 1 worker every 2 min
const DELAY_PER_WORKER_MS = 5000          // Min delay between requests per worker
const SCRAPER_TIMEOUT_MS = 90000
const MAX_RETRIES = 2
const MATCH_THRESHOLD = 0.35

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

// ════════════════════════════
// TRADES + DEPARTMENTS
// ════════════════════════════

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

const DEPARTEMENTS = [
  '01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','2A',
  '2B','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39',
  '40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59',
  '60','61','62','63','64','65','66','67','68','69','70','71','72','73','74','75','76','77','78','79',
  '80','81','82','83','84','85','86','87','88','89','90','91','92','93','94','95',
]

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

const COMMON_WORDS = new Set([
  'plomberie','plombier','chauffage','chauffagiste','electricite','electricien',
  'peinture','peintre','menuiserie','menuisier','maconnerie','macon',
  'carrelage','carreleur','couverture','couvreur','serrurerie','serrurier',
  'isolation','platrier','platrerie','renovation','batiment','travaux',
  'construction','entreprise','artisan','services','service','general',
  'generale','multi','pro','plus','france','sud','nord','est','ouest',
  'climatisation','terrassement','demolition','assainissement','domotique',
  'ramonage','etancheite','depannage','paysagiste','vitrier',
  'charpentier','charpente','toiture','facade','ravalement','enduit','cloture',
  'amenagement','interieur','exterieur','habitat','logement','maison',
  'techni','technique','professionnel','groupe','agence','cabinet','atelier','bureau',
  'facades','facadier','terrassier','plaquiste',
])

// ════════════════════════════
// TYPES & STATE
// ════════════════════════════

interface GMListing {
  gmId: string; name: string; phone?: string; rating?: number
  reviewCount?: number; website?: string; trade: string; deptCode: string
}

interface Artisan {
  id: string; name: string; normFull: string; normComm: string
  phone: string | null; rating: number; reviews: number
}

let shuttingDown = false
const startTime = Date.now()

const stats = {
  combosProcessed: 0, combosTotal: 0,
  listingsFound: 0, newPhones: 0, newRatings: 0, newWebsites: 0,
  duplicatesSkipped: 0, errors: 0, apiCredits: 0,
  activeWorkers: 0, maxWorkers: 0,
}

// Global anti-duplicate sets (thread-safe since JS is single-threaded)
const knownPhones = new Set<string>()    // all phones already in DB or just assigned
const assignedArtisans = new Set<string>() // artisans already enriched this run

// ════════════════════════════
// HELPERS
// ════════════════════════════

function sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)) }
function fmt(n: number): string { return n.toLocaleString('fr-FR') }
function elapsed(): string {
  const s = Math.floor((Date.now() - startTime) / 1000)
  const m = Math.floor(s / 60); const h = Math.floor(m / 60)
  return h > 0 ? `${h}h${m%60}m` : `${m}m${s%60}s`
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

function normalizeText(t: string): string {
  return t.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(sarl|sas|sa|eurl|sasu|eirl|ei|sci|snc|scop|scp|selarl|auto[- ]?entrepreneur|micro[- ]?entreprise|ets|etablissements?|entreprise|societe|ste|monsieur|madame|m\.|mme|mr|dr)\b/gi, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim()
}

function extractCommercial(raw: string): string {
  const m = raw.match(/\(([^)]+)\)/g)
  if (!m || m.length === 0) return ''
  return m[m.length - 1].replace(/[()]/g, '').trim()
}

function normalizeWebsite(raw: string): string | null {
  if (!raw) return null
  let url = raw.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url
  try {
    const parsed = new URL(url)
    const excluded = ['google.com','google.fr','facebook.com','instagram.com','twitter.com','linkedin.com','x.com','pagesjaunes.fr']
    if (excluded.some(d => parsed.hostname.includes(d))) return null
    return parsed.toString()
  } catch { return null }
}

function hashId(trade: string, dept: string, name: string): string {
  const str = `${trade}-${dept}-${name.toLowerCase().trim()}`
  let h = 0
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0 }
  return `gm-${Math.abs(h).toString(36)}`
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length; if (!b.length) return a.length
  const mx: number[][] = []
  for (let i = 0; i <= b.length; i++) mx[i] = [i]
  for (let j = 0; j <= a.length; j++) mx[0][j] = j
  for (let i = 1; i <= b.length; i++)
    for (let j = 1; j <= a.length; j++)
      mx[i][j] = Math.min(mx[i-1][j]+1, mx[i][j-1]+1, mx[i-1][j-1]+(b[i-1]===a[j-1]?0:1))
  return mx[b.length][a.length]
}

function nameSimilarity(a: string, b: string): number {
  const tA = a.split(' ').filter(t => t.length > 1)
  const tB = b.split(' ').filter(t => t.length > 1)
  if (!tA.length || !tB.length) return 0
  let overlap = 0
  const matched = new Set<string>()
  for (const t of tA) { if (tB.includes(t) && !matched.has(t)) { overlap++; matched.add(t) } }
  const umA = tA.filter(t => !tB.includes(t))
  const umB = tB.filter(t => !matched.has(t))
  for (const wa of umA) {
    let best = 0, bi = -1
    for (let i = 0; i < umB.length; i++) {
      if (matched.has(umB[i])) continue
      const f = (wa === umB[i]) ? 1 :
        (wa.length >= 3 && umB[i].length >= 3 && levenshtein(wa, umB[i]) <= (Math.max(wa.length, umB[i].length) >= 7 ? 2 : 1)) ? 0.8 : 0
      if (f > best) { best = f; bi = i }
    }
    if (best > 0 && bi >= 0) { overlap += best; matched.add(umB[bi]) }
  }
  if (overlap === 0) {
    for (const ta of tA) for (const tb of tB)
      if (ta !== tb && ta.length >= 4 && tb.length >= 4 && (tb.includes(ta) || ta.includes(tb))) overlap += 0.5
  }
  return overlap / new Set([...tA, ...tB]).size
}

// ════════════════════════════
// HTML PARSING (from original)
// ════════════════════════════

function decodeHtml(s: string): string {
  return s.replace(/&#39;/g,"'").replace(/&amp;/g,'&').replace(/&quot;/g,'"')
    .replace(/&#x27;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/&nbsp;|\xa0/g,' ').replace(/\\u([\da-fA-F]{4})/g,(_,h)=>String.fromCharCode(parseInt(h,16)))
}

function parseGoogleMaps(html: string, trade: string, dept: string): GMListing[] {
  const listings: GMListing[] = []; const seen = new Set<string>()

  // Pattern 1: "Obtenir un itinéraire vers {NAME}"
  const dirRx = /aria-label="Obtenir un itin.raire vers ([^"]{2,80})"/g
  let m
  while ((m = dirRx.exec(html)) !== null) {
    const name = decodeHtml(m[1]).trim()
    if (!name || name.length < 2 || seen.has(name.toLowerCase())) continue
    const ctx = html.substring(Math.max(0, m.index - 3000), m.index)

    let phone: string | undefined
    const pms = [...ctx.matchAll(/(0[1-9][\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2})/g)]
    if (pms.length > 0) {
      const n = normalizePhone(pms[pms.length-1][1])
      if (n && !/^09[59]/.test(n)) phone = n
    }

    let rating: number | undefined, reviewCount: number | undefined
    const ctxC = ctx.replace(/&nbsp;|\xa0|\u00a0/g,' ')
    const rms = [...ctxC.matchAll(/(\d[,.]?\d?)\s*.toiles?\s+(\d[\d\s]*)\s*avis/g)]
    if (rms.length > 0) {
      rating = parseFloat(rms[rms.length-1][1].replace(',','.'))
      reviewCount = parseInt(rms[rms.length-1][2].replace(/\s/g,''))
    }

    let website: string | undefined
    const ne = name.substring(0,20).replace(/[.*+?^${}()|[\]\\\/]/g,'\\$&')
    const sa = html.substring(Math.max(0, m.index - 3000), Math.min(html.length, m.index + 2000))
    const ws = sa.match(new RegExp(`aria-label="Visiter le site Web de[^"]*${ne}[^"]*"[^>]*href="([^"]+)"`,'i'))
      || sa.match(new RegExp(`href="(https?://[^"]+)"[^>]*aria-label="Visiter le site Web de[^"]*${ne}`,'i'))
    if (ws) website = normalizeWebsite(ws[1]) || undefined

    seen.add(name.toLowerCase())
    listings.push({ gmId: hashId(trade,dept,name), name, phone, rating, reviewCount, website, trade, deptCode: dept })
  }

  // Pattern 2: hfpxzc class business links
  const bizRx = /class="[^"]*hfpxzc[^"]*"[^>]*aria-label="([^"]{3,80})"/g
  while ((m = bizRx.exec(html)) !== null) {
    const name = decodeHtml(m[1]).trim()
    if (!name || seen.has(name.toLowerCase())) continue
    if (/^(résultats|filtres|réduire|plan|en savoir|obtenir|visiter)/i.test(name)) continue
    const ctx = html.substring(m.index, Math.min(html.length, m.index + 3000))

    let phone: string | undefined
    const pm = ctx.match(/(0[1-9][\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2})/)
    if (pm) { const n = normalizePhone(pm[1]); if (n && !/^09[59]/.test(n)) phone = n }

    let rating: number | undefined, reviewCount: number | undefined
    const ctxC = ctx.replace(/&nbsp;|\xa0/g,' ')
    const rm = ctxC.match(/(\d[,.]?\d?)\s*.toiles?\s+(\d[\d\s]*)\s*avis/)
    if (rm) { rating = parseFloat(rm[1].replace(',','.')); reviewCount = parseInt(rm[2].replace(/\s/g,'')) }

    let website: string | undefined
    const ne = name.substring(0,20).replace(/[.*+?^${}()|[\]\\\/]/g,'\\$&')
    const ws = ctx.match(new RegExp(`aria-label="Visiter le site Web de[^"]*${ne}[^"]*"[^>]*href="([^"]+)"`,'i'))
      || ctx.match(new RegExp(`href="(https?://[^"]+)"[^>]*aria-label="Visiter le site Web de[^"]*${ne}`,'i'))
    if (ws) website = normalizeWebsite(ws[1]) || undefined

    seen.add(name.toLowerCase())
    listings.push({ gmId: hashId(trade,dept,name), name, phone, rating, reviewCount, website, trade, deptCode: dept })
  }

  return listings
}

function parseGoogleSearch(html: string, trade: string, dept: string): GMListing[] {
  const listings: GMListing[] = []; const seen = new Set<string>()
  const nameRx = /class="[^"]*OSrXXb[^"]*"[^>]*>([^<]{3,80})</g
  let m
  while ((m = nameRx.exec(html)) !== null) {
    const name = decodeHtml(m[1].trim())
    if (!name || name.length < 2 || seen.has(name.toLowerCase())) continue
    if (/^(entreprises?|résultats|recherche|plus de|voir|afficher)/i.test(name)) continue
    const ctx = html.substring(m.index, Math.min(html.length, m.index + 1500))

    let phone: string | undefined
    const pm = ctx.match(/(0[1-9][\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2})/)
    if (pm) { const n = normalizePhone(pm[1]); if (n) phone = n }

    let rating: number | undefined, reviewCount: number | undefined
    const rm = ctx.match(/(\d[,.]\d)\s*(?:étoiles?|stars?|<)/)
    if (rm) rating = parseFloat(rm[1].replace(',','.'))
    const rc = ctx.match(/\((\d[\d\s.,]*)\)/)
    if (rc) { const c = rc[1].replace(/[\s.,]/g,''); if (/^\d+$/.test(c)) reviewCount = parseInt(c) }

    let website: string | undefined
    const ws = ctx.match(/href="(https?:\/\/(?!www\.google)[^"]{5,200})"/)
    if (ws) website = normalizeWebsite(ws[1]) || undefined

    seen.add(name.toLowerCase())
    listings.push({ gmId: hashId(trade,dept,name), name, phone, rating, reviewCount, website, trade, deptCode: dept })
  }
  return listings
}

// ════════════════════════════
// SCRAPER API
// ════════════════════════════

async function fetchUrl(url: string, render: boolean, retry = 0): Promise<string | null> {
  const credits = render ? 10 : 5
  const scraperUrl = `https://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}${render ? '&render=true' : ''}&country_code=fr`

  try {
    const res = await fetch(scraperUrl, { signal: AbortSignal.timeout(SCRAPER_TIMEOUT_MS) })
    stats.apiCredits += credits

    if (res.status === 429) {
      console.log(`    ⚠ Rate limit, pause 15s...`)
      await sleep(15000)
      if (retry < MAX_RETRIES) return fetchUrl(url, render, retry + 1)
      return null
    }
    if (res.status === 500 || res.status === 403) {
      if (retry < MAX_RETRIES) { await sleep(8000); return fetchUrl(url, render, retry + 1) }
      return null
    }
    if (res.status >= 400) return ''

    const html = await res.text()
    if (html.length < 2000) {
      if (retry < MAX_RETRIES) { await sleep(10000); return fetchUrl(url, render, retry + 1) }
      return null
    }
    return html
  } catch (err: any) {
    stats.errors++
    if (retry < MAX_RETRIES) { await sleep(5000); return fetchUrl(url, render, retry + 1) }
    return null
  }
}

// ════════════════════════════
// ARTISAN CACHE + MATCHING
// ════════════════════════════

const artisanCache = new Map<string, Artisan[]>()

async function loadArtisans(db: PgPool, dept: string): Promise<Artisan[]> {
  if (artisanCache.has(dept)) return artisanCache.get(dept)!
  const r = await db.query(
    `SELECT id, name, phone, rating_average, review_count FROM providers
     WHERE address_department = $1 AND is_active = true AND source = 'annuaire_entreprises'`, [dept]
  )
  const artisans: Artisan[] = r.rows.map((row: any) => ({
    id: row.id, name: row.name, phone: row.phone,
    normFull: normalizeText(row.name),
    normComm: extractCommercial(row.name) ? normalizeText(extractCommercial(row.name)) : '',
    rating: row.rating_average || 0, reviews: row.review_count || 0,
  }))
  artisanCache.set(dept, artisans)
  // Evict old entries to save memory
  if (artisanCache.size > 20) { const k = artisanCache.keys().next().value; if (k) artisanCache.delete(k) }
  return artisans
}

function matchListing(listing: GMListing, artisans: Artisan[]): Artisan | null {
  const normGM = normalizeText(listing.name)
  if (normGM.length < 2) return null

  const distinctive = normGM.split(' ').filter(w => w.length >= 3 && !COMMON_WORDS.has(w))
  const terms = [normGM.split(' ').filter(w => w.length >= 2).slice(0, 2).join(' '), ...distinctive].filter(t => t.length >= 2)

  let best: { a: Artisan; score: number } | null = null
  for (const term of terms) {
    for (const a of artisans) {
      if (assignedArtisans.has(a.id)) continue
      if (!a.normFull.includes(term) && !a.normComm.includes(term)) continue
      const s1 = nameSimilarity(normGM, a.normFull)
      const s2 = a.normComm ? nameSimilarity(normGM, a.normComm) : 0
      const score = Math.max(s1, s2)
      if (score >= MATCH_THRESHOLD && (!best || score > best.score)) best = { a, score }
    }
  }
  return best ? best.a : null
}

// ════════════════════════════
// WORKER: processes one combo
// ════════════════════════════

async function processCombo(
  db: PgPool, trade: { key: string; query: string; label: string }, dept: string, workerId: number
): Promise<{ phones: number; ratings: number; websites: number; listings: number }> {
  const city = DEPT_CITIES[dept] || dept
  const result = { phones: 0, ratings: 0, websites: 0, listings: 0 }

  // 1) Google Maps search
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(trade.query + ' ' + city)}/`
  const mapsHtml = await fetchUrl(mapsUrl, true)
  let allListings: GMListing[] = []
  if (mapsHtml) allListings.push(...parseGoogleMaps(mapsHtml, trade.key, dept))

  await sleep(DELAY_PER_WORKER_MS)

  // 2) Google Search local pack
  const searchUrl = `https://www.google.fr/search?q=${encodeURIComponent(trade.query + ' ' + city + ' téléphone')}&hl=fr&gl=fr&num=20`
  const searchHtml = await fetchUrl(searchUrl, false)
  if (searchHtml) {
    const searchListings = parseGoogleSearch(searchHtml, trade.key, dept)
    const existing = new Set(allListings.map(l => l.name.toLowerCase()))
    for (const sl of searchListings) {
      if (!existing.has(sl.name.toLowerCase())) allListings.push(sl)
    }
  }

  // Dedup by phone within this combo
  const seenP = new Set<string>()
  const unique: GMListing[] = []
  for (const l of allListings) {
    if (l.phone && seenP.has(l.phone)) continue
    if (l.phone) seenP.add(l.phone)
    unique.push(l)
  }

  result.listings = unique.length

  // Save raw listings
  if (unique.length > 0) {
    const lines = unique.map(l => JSON.stringify(l)).join('\n') + '\n'
    fs.appendFileSync(LISTINGS_FILE, lines)
  }

  // 3) Match + Upload
  const artisans = await loadArtisans(db, dept)
  const updates: { id: string; phone?: string; rating?: number; reviews?: number; website?: string }[] = []

  for (const listing of unique) {
    const normPhone = listing.phone ? normalizePhone(listing.phone) : null

    // Anti-doublon : skip phones déjà connus
    if (normPhone && knownPhones.has(normPhone)) {
      stats.duplicatesSkipped++
      // But still try to enrich rating/website if we find a match
      if ((listing.rating && listing.rating >= 1 && listing.rating <= 5 && listing.reviewCount) || listing.website) {
        const artWithPhone = artisans.find(a => a.phone === normPhone && !assignedArtisans.has(a.id))
        if (artWithPhone) {
          const upd: any = { id: artWithPhone.id }
          if (listing.rating && listing.rating >= 1 && listing.rating <= 5 && artWithPhone.rating === 0) {
            upd.rating = listing.rating; upd.reviews = listing.reviewCount
          }
          if (listing.website) upd.website = normalizeWebsite(listing.website) || undefined
          if (upd.rating || upd.website) {
            updates.push(upd)
            assignedArtisans.add(artWithPhone.id)
            if (upd.rating) result.ratings++
            if (upd.website) result.websites++
          }
        }
      }
      continue
    }

    // Match by name
    // Only match artisans without phone (for phone enrichment)
    const phoneTarget = normPhone ? artisans.filter(a => !a.phone) : []
    const matched = normPhone ? matchListing(listing, phoneTarget) : null

    if (matched && normPhone) {
      const update: any = { id: matched.id, phone: normPhone }
      if (listing.rating && listing.rating >= 1 && listing.rating <= 5) {
        update.rating = listing.rating
        if (listing.reviewCount) update.reviews = listing.reviewCount
      }
      if (listing.website) update.website = normalizeWebsite(listing.website) || undefined
      updates.push(update)
      knownPhones.add(normPhone)
      assignedArtisans.add(matched.id)
      result.phones++
      if (update.rating) result.ratings++
      if (update.website) result.websites++
    } else if (listing.rating || listing.website) {
      // No phone match — try to match by name for rating/website enrichment
      const enrichTarget = artisans.filter(a => !assignedArtisans.has(a.id))
      const enrichMatch = matchListing(listing, enrichTarget)
      if (enrichMatch) {
        const upd: any = { id: enrichMatch.id }
        if (listing.rating && listing.rating >= 1 && listing.rating <= 5 && enrichMatch.rating === 0) {
          upd.rating = listing.rating; upd.reviews = listing.reviewCount
        }
        if (listing.website) upd.website = normalizeWebsite(listing.website) || undefined
        if (upd.rating || upd.website) {
          updates.push(upd)
          assignedArtisans.add(enrichMatch.id)
          if (upd.rating) result.ratings++
          if (upd.website) result.websites++
        }
      }
    }

    if (normPhone) knownPhones.add(normPhone)
  }

  // Batch upload
  if (updates.length > 0) {
    for (const u of updates) {
      try {
        const sets: string[] = []
        const params: any[] = []
        let pi = 1
        if (u.phone) { sets.push(`phone=$${pi++}`); params.push(u.phone) }
        if (u.rating) { sets.push(`rating_average=$${pi++}`); params.push(u.rating); sets.push(`review_count=$${pi++}`); params.push(u.reviews || 0) }
        if (u.website) { sets.push(`website=COALESCE(website,$${pi++})`); params.push(u.website) }
        if (sets.length === 0) continue
        params.push(u.id)
        const where = u.phone ? `id=$${pi} AND phone IS NULL` : `id=$${pi}`
        await db.query(`UPDATE providers SET ${sets.join(',')} WHERE ${where}`, params)
      } catch { stats.errors++ }
    }
  }

  return result
}

// ════════════════════════════
// QUEUE + ORCHESTRATOR
// ════════════════════════════

async function main() {
  const args = process.argv.slice(2)
  const resume = args.includes('--resume')
  const dryRun = args.includes('--dry-run')
  const maxWorkersArg = args.includes('--max-workers') ? parseInt(args[args.indexOf('--max-workers') + 1]) : 5

  if (!SCRAPER_API_KEY) { console.error('❌ SCRAPER_API_KEY manquant dans .env.local'); process.exit(1) }

  console.log('\n' + '═'.repeat(60))
  console.log('  GOOGLE MAPS TURBO SCRAPER')
  console.log('  Workers: 1 → max ' + maxWorkersArg + ' (montée progressive)')
  console.log('═'.repeat(60))

  // Connect to DB
  const db = new PgPool({
    connectionString: PG_URL, ssl: { rejectUnauthorized: false },
    max: 5, keepAlive: true, keepAliveInitialDelayMillis: 10000,
    options: '-c statement_timeout=120000',
  })
  db.on('error', (err: any) => console.log('  ⚠ DB Pool:', err.message))

  // Load existing phones from DB (anti-doublon)
  console.log('\n  Chargement phones existants...')
  const existingPhones = await db.query('SELECT DISTINCT phone FROM providers WHERE phone IS NOT NULL AND is_active = true')
  for (const r of existingPhones.rows) knownPhones.add(r.phone)
  console.log(`  ${fmt(knownPhones.size)} phones déjà en base`)

  // Build queue of remaining combos
  let completedCombos = new Set<string>()

  // Load V1 progress too
  const v1ProgressFile = path.join(DATA_DIR, 'fetch-progress.json')
  if (fs.existsSync(v1ProgressFile)) {
    const v1 = JSON.parse(fs.readFileSync(v1ProgressFile, 'utf-8'))
    for (const c of (v1.completedCombos || [])) completedCombos.add(c)
    console.log(`  ${fmt(completedCombos.size)} combos V1 déjà faits`)
  }

  // Load V2 progress
  if (resume && fs.existsSync(PROGRESS_FILE)) {
    const v2 = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'))
    for (const c of (v2.completedCombos || [])) completedCombos.add(c)
    stats.combosProcessed = v2.stats?.combosProcessed || 0
    stats.newPhones = v2.stats?.newPhones || 0
    stats.newRatings = v2.stats?.newRatings || 0
    stats.newWebsites = v2.stats?.newWebsites || 0
    stats.apiCredits = v2.stats?.apiCredits || 0
    console.log(`  + ${fmt(v2.completedCombos?.length || 0)} combos V2 repris`)
  }

  // Build queue
  const queue: { trade: typeof GM_TRADES[0]; dept: string }[] = []
  for (const trade of GM_TRADES) {
    for (const dept of DEPARTEMENTS) {
      const key = `${trade.key}-${dept}`
      if (!completedCombos.has(key)) queue.push({ trade, dept })
    }
  }

  stats.combosTotal = queue.length
  console.log(`\n  ${fmt(queue.length)} combos restants sur ${fmt(GM_TRADES.length * DEPARTEMENTS.length)} total`)

  if (queue.length === 0) { console.log('\n  ✓ Tout est déjà fait !'); await db.end(); return }
  if (dryRun) { console.log('\n  [DRY-RUN] Pas de scraping.'); await db.end(); return }

  // Graceful shutdown
  process.on('SIGINT', () => {
    if (shuttingDown) process.exit(1)
    console.log('\n  ⚠ Arrêt gracieux, les workers finissent leur combo en cours...')
    shuttingDown = true
  })

  // Worker function
  let queueIdx = 0
  const queueLock = { locked: false }

  function getNextCombo(): { trade: typeof GM_TRADES[0]; dept: string } | null {
    if (queueIdx >= queue.length || shuttingDown) return null
    return queue[queueIdx++]
  }

  async function worker(id: number) {
    while (!shuttingDown) {
      const combo = getNextCombo()
      if (!combo) break

      const key = `${combo.trade.key}-${combo.dept}`
      try {
        const result = await processCombo(db, combo.trade, combo.dept, id)
        completedCombos.add(key)
        stats.combosProcessed++
        stats.listingsFound += result.listings
        stats.newPhones += result.phones
        stats.newRatings += result.ratings
        stats.newWebsites += result.websites

        const city = DEPT_CITIES[combo.dept] || combo.dept
        const pct = ((completedCombos.size / (GM_TRADES.length * DEPARTEMENTS.length)) * 100).toFixed(1)
        console.log(
          `  W${id} [${stats.combosProcessed}/${stats.combosTotal}] ${combo.trade.label} ${city} (${combo.dept})` +
          ` → ${result.listings}L +${result.phones}T +${result.ratings}★ +${result.websites}W` +
          ` | total: ${fmt(stats.newPhones)}T ${fmt(stats.newRatings)}★ ${fmt(stats.newWebsites)}W` +
          ` | ${pct}% | ${elapsed()} | W=${stats.activeWorkers}`
        )
      } catch (err: any) {
        stats.errors++
        console.log(`  W${id} ⚠ ${key}: ${err.message}`)
      }

      // Save progress every 5 combos
      if (stats.combosProcessed % 5 === 0) saveProgress(completedCombos)

      await sleep(DELAY_PER_WORKER_MS)
    }
    stats.activeWorkers--
  }

  function saveProgress(completed: Set<string>) {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify({
      completedCombos: Array.from(completed).filter(c => !c.startsWith('plombier-') || c > 'peintre-72'), // Only V2 combos
      stats: {
        combosProcessed: stats.combosProcessed,
        newPhones: stats.newPhones,
        newRatings: stats.newRatings,
        newWebsites: stats.newWebsites,
        apiCredits: stats.apiCredits,
        listingsFound: stats.listingsFound,
        errors: stats.errors,
      },
    }))
  }

  // Progressive scaling: start workers gradually
  const maxWorkers = Math.min(maxWorkersArg, Math.ceil(queue.length / 10))
  stats.maxWorkers = maxWorkers
  const workers: Promise<void>[] = []

  console.log(`\n  Démarrage Worker 1...`)
  stats.activeWorkers = 1
  workers.push(worker(1))

  // Scale up timer
  let nextWorkerId = 2
  const scaleTimer = setInterval(() => {
    if (shuttingDown || nextWorkerId > maxWorkers || queueIdx >= queue.length) {
      clearInterval(scaleTimer)
      return
    }
    // Only scale if no recent errors
    if (stats.errors > stats.combosProcessed * 0.2) {
      console.log(`  ⚠ Trop d'erreurs (${stats.errors}/${stats.combosProcessed}), pas de scale-up`)
      return
    }
    const id = nextWorkerId++
    stats.activeWorkers++
    console.log(`  ↑ Scale-up: Worker ${id} démarré (${stats.activeWorkers} actifs)`)
    workers.push(worker(id))
  }, SCALE_INTERVAL_MS)

  // Wait for all workers
  await Promise.all(workers)
  clearInterval(scaleTimer)

  // Final save
  saveProgress(completedCombos)
  await db.end()

  // Summary
  console.log('\n' + '═'.repeat(60))
  console.log('  RÉSULTAT FINAL — GOOGLE MAPS TURBO')
  console.log('═'.repeat(60))
  console.log(`  Durée:              ${elapsed()}`)
  console.log(`  Combos traités:     ${fmt(stats.combosProcessed)}`)
  console.log(`  Listings trouvés:   ${fmt(stats.listingsFound)}`)
  console.log(`  Nouveaux phones:    +${fmt(stats.newPhones)}`)
  console.log(`  Nouveaux ratings:   +${fmt(stats.newRatings)}`)
  console.log(`  Nouveaux websites:  +${fmt(stats.newWebsites)}`)
  console.log(`  Doublons skippés:   ${fmt(stats.duplicatesSkipped)}`)
  console.log(`  Erreurs:            ${stats.errors}`)
  console.log(`  Crédits API:        ~${fmt(stats.apiCredits)}`)
  console.log(`  Workers max:        ${stats.maxWorkers}`)
  console.log('═'.repeat(60) + '\n')
}

main().then(() => process.exit(0)).catch(e => { console.error('Erreur:', e); process.exit(1) })
