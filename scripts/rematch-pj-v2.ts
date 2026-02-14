/**
 * Matching PJ → Supabase V2 — Rigoureux
 *
 * Corrections par rapport à V1 :
 * 1. Nom commercial (entre parenthèses) indexé séparément → double chance de match
 * 2. Fallback par code postal + mot distinctif long (>= 5 chars)
 * 3. Anti faux-positifs : prénoms communs exclus, score minimum relevé pour CP-only
 * 4. Dédup stricte : 1 phone → 1 artisan, 1 artisan → 1 phone
 *
 * Usage: npx tsx scripts/rematch-pj-v2.ts
 */
import * as fs from 'fs'
import * as path from 'path'
import { Pool } from 'pg'

const PG_URL = 'postgresql://postgres:BEB6LnGlT6U9bkTe@db.umjmbdbwcsxrvfqktiui.supabase.co:5432/postgres'
const LISTINGS_FILE = path.join(__dirname, '.enrich-data', 'pj-listings.jsonl')

// ── Config ──
const MATCH_THRESHOLD = 0.35
const CP_MATCH_THRESHOLD = 0.45 // Plus strict pour match par CP seul
const MIN_DISTINCTIVE_LEN = 4   // Mot distinctif minimum pour CP match

// ── Common words (métiers, formes juridiques, mots génériques) ──
const COMMON_WORDS = new Set([
  'plomberie','plombier','chauffage','chauffagiste','electricite','electricien',
  'peinture','peintre','menuiserie','menuisier','maconnerie','macon',
  'carrelage','carreleur','couverture','couvreur','serrurerie','serrurier',
  'isolation','platrier','platrerie','renovation','batiment','travaux',
  'construction','entreprise','artisan','services','service','general',
  'generale','multi','pro','plus','france','sud','nord','est','ouest',
  'climatisation','terrassement','demolition','assainissement','domotique',
  'ramonage','etancheite','depannage','paysagiste','paysagistes','vitrier',
  'portail','portails','store','stores','parquet','parquets','salle','bain',
  'chauffagistes','electriciens','menuisiers','macons','peintres','carreleurs',
  'couvreurs','serruriers','plombiers','charpentier','charpentiers','charpente',
  'toiture','facade','facades','ravalement','enduit','cloture','clotures',
  'amenagement','interieur','exterieur','habitat','logement','maison',
  'appartement','immeuble','copropriete','neuf','ancien','moderne',
  'techni','technique','techniques','professionnel','professionnels',
  'groupe','agence','cabinet','atelier','ateliers','bureau','bureaux',
  'ile','provence','alpes','cote','azur','bretagne','normandie',
  'aquitaine','occitanie','auvergne','rhone','loire','region',
  'nettoyage','entretien','maintenance','installation','installations',
  'depannage','reparation','creation','conception','realisation',
])

// Prénoms français courants (anti faux-positifs)
const COMMON_FIRST_NAMES = new Set([
  'jean','pierre','michel','philippe','andre','louis','jacques','bernard',
  'robert','paul','alain','rene','daniel','roger','claude','christophe',
  'christian','laurent','nicolas','eric','patrick','david','stephane',
  'thierry','franck','frederic','olivier','francois','pascal','didier',
  'sebastien','jerome','antoine','guillaume','thomas','julien','vincent',
  'alexandre','yves','marc','emmanuel','bruno','marie','gerard',
  'dominique','henri','denis','gabriel','charles','max','maxime',
  'matthieu','mathieu','benjamin','florian','anthony','cedric','romain',
  'fabien','xavier','arnaud','baptiste','simon','lucas','leo',
  'hugo','adam','arthur','nathan','ethan','mohamed','ali','ahmed',
])

// ── Départements voisins ──
const DEPT_NEIGHBORS: Record<string, string[]> = {
  '01':['38','39','69','71','73','74'],'02':['08','51','59','60','77','80'],
  '03':['18','23','42','58','63','71'],'04':['05','06','26','83','84'],
  '05':['04','26','38','73'],'06':['04','83'],
  '07':['26','30','42','43','48','84'],'08':['02','51','55'],
  '09':['11','31','66'],'10':['21','51','52','77','89'],
  '11':['09','31','34','66','81'],'12':['15','30','34','46','48','81','82'],
  '13':['30','83','84'],'14':['27','50','61','76'],
  '15':['03','12','19','43','46','48','63'],'16':['17','24','79','86','87'],
  '17':['16','24','33','79','85'],'18':['03','23','36','41','45','58'],
  '19':['15','23','24','46','63','87'],'2A':['2B'],'2B':['2A'],
  '21':['10','39','52','58','70','71','89'],'22':['29','35','56'],
  '23':['03','18','19','36','63','87'],'24':['16','17','19','33','46','47','87'],
  '25':['39','70','90'],'26':['04','05','07','38','84'],
  '27':['14','28','60','76','78','95'],'28':['27','41','45','72','78','91'],
  '29':['22','56'],'30':['07','12','13','34','48','84'],
  '31':['09','11','32','65','81','82'],'32':['31','40','47','64','65','82'],
  '33':['17','24','40','47'],'34':['11','12','30','81'],
  '35':['22','44','49','50','53','56'],'36':['18','23','37','41','86','87'],
  '37':['36','41','49','72','86'],'38':['01','05','26','42','69','73'],
  '39':['01','21','25','70','71'],'40':['32','33','47','64'],
  '41':['18','28','36','37','45','72'],'42':['03','07','38','43','63','69'],
  '43':['07','15','42','48','63'],'44':['35','49','56','85'],
  '45':['18','28','41','58','77','89','91'],'46':['12','15','19','24','47','82'],
  '47':['24','32','33','40','46','82'],'48':['07','12','15','30','43'],
  '49':['35','37','44','53','72','79','85','86'],'50':['14','35','53','61'],
  '51':['02','08','10','52','55','77'],'52':['10','21','51','55','70','88'],
  '53':['35','44','49','50','61','72'],'54':['55','57','67','88'],
  '55':['08','51','52','54','57','88'],'56':['22','29','35','44'],
  '57':['54','55','67','88'],'58':['03','18','21','45','71','89'],
  '59':['02','62','80'],'60':['02','27','76','77','78','80','95'],
  '61':['14','27','28','35','50','53','72'],'62':['59','80'],
  '63':['03','15','19','23','42','43'],'64':['32','40','65'],
  '65':['31','32','64'],'66':['09','11'],
  '67':['54','57','68','88'],'68':['67','88','90'],
  '69':['01','38','42','71'],'70':['21','25','39','52','88','90'],
  '71':['01','03','21','39','42','58','69'],'72':['28','37','41','49','53','61'],
  '73':['01','05','38','74'],'74':['01','73'],
  '75':['92','93','94'],'76':['14','27','60','80'],
  '77':['02','10','45','51','60','89','91','93','94'],
  '78':['27','28','60','91','92','95'],
  '79':['16','17','49','85','86'],'80':['02','59','60','62','76'],
  '81':['11','12','31','34','82'],'82':['12','31','32','46','47','81'],
  '83':['04','06','13','84'],'84':['04','07','13','26','30','83'],
  '85':['17','44','49','79'],'86':['16','36','37','49','79','87'],
  '87':['16','19','23','24','36','86'],'88':['52','54','55','57','67','68','70'],
  '89':['10','21','45','58','77'],'90':['25','68','70'],
  '91':['28','45','77','78','92','94'],
  '92':['75','78','91','93','94','95'],
  '93':['75','77','92','94','95'],
  '94':['75','77','91','92','93'],
  '95':['27','60','78','92','93'],
}

const DEPTS = Object.keys(DEPT_NEIGHBORS).sort()

// ── Types ──
interface PJListing {
  name: string
  phone: string
  city?: string
  postalCode?: string
  deptCode: string
  trade: string
}

interface Artisan {
  id: string
  name: string
  normFull: string       // Nom complet normalisé (AVEC contenu parenthèses)
  normLegal: string      // Nom légal seul (SANS parenthèses)
  normCommercial: string // Nom commercial seul (contenu des parenthèses)
  phone: string | null
  cp: string | null
}

// ── Normalisation ──
function normalizeText(text: string): string {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(sarl|sas|sa|eurl|sasu|eirl|ei|sci|snc|scop|scp|selarl|auto[- ]?entrepreneur|micro[- ]?entreprise|ets|etablissements?|entreprise|societe|ste|monsieur|madame|m\.|mme|mr|dr)\b/gi, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim()
}

function extractCommercial(rawName: string): string {
  // "LEGAL NAME (COMMERCIAL NAME)" → "COMMERCIAL NAME"
  // Handle nested: "A (B) (C)" → take last parenthetical
  const matches = rawName.match(/\(([^)]+)\)/g)
  if (!matches || matches.length === 0) return ''
  const last = matches[matches.length - 1]
  return last.replace(/[()]/g, '').trim()
}

function extractLegal(rawName: string): string {
  // Remove all parenthetical content
  return rawName.replace(/\([^)]*\)/g, '').trim()
}

// ── Similarity ──
function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length
  const matrix: number[][] = []
  for (let i = 0; i <= b.length; i++) matrix[i] = [i]
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(matrix[i-1][j]+1, matrix[i][j-1]+1, matrix[i-1][j-1]+cost)
    }
  }
  return matrix[b.length][a.length]
}

function fuzzyTokenMatch(a: string, b: string): number {
  if (a === b) return 1.0
  if (a.length < 3 || b.length < 3) return 0
  const maxDist = Math.max(a.length, b.length) >= 7 ? 2 : 1
  return levenshtein(a, b) <= maxDist ? 0.8 : 0
}

function nameSimilarity(a: string, b: string): number {
  const tokA = a.split(' ').filter(t => t.length > 1)
  const tokB = b.split(' ').filter(t => t.length > 1)
  if (tokA.length === 0 || tokB.length === 0) return 0

  let overlap = 0
  const matchedB = new Set<string>()

  // Exact token matches
  for (const t of tokA) {
    if (tokB.includes(t) && !matchedB.has(t)) {
      overlap++
      matchedB.add(t)
    }
  }

  // Fuzzy matches for unmatched tokens
  const unmatchedA = tokA.filter(t => !tokB.includes(t))
  const unmatchedB = tokB.filter(t => !matchedB.has(t))
  for (const wa of unmatchedA) {
    let best = 0
    let bestIdx = -1
    for (let i = 0; i < unmatchedB.length; i++) {
      if (matchedB.has(unmatchedB[i])) continue
      const f = fuzzyTokenMatch(wa, unmatchedB[i])
      if (f > best) { best = f; bestIdx = i }
    }
    if (best > 0 && bestIdx >= 0) {
      overlap += best
      matchedB.add(unmatchedB[bestIdx])
    }
  }

  // Substring match fallback
  if (overlap === 0) {
    for (const ta of tokA) {
      for (const tb of tokB) {
        if (ta !== tb && ta.length >= 4 && tb.length >= 4 && (tb.includes(ta) || ta.includes(tb))) {
          overlap += 0.5
        }
      }
    }
  }

  const union = new Set([...tokA, ...tokB])
  return overlap / union.size
}

function isCommonFirstName(word: string): boolean {
  return COMMON_FIRST_NAMES.has(word.toLowerCase())
}

function getDistinctiveWords(norm: string): string[] {
  return norm.split(' ')
    .filter(w => w.length >= 3 && !COMMON_WORDS.has(w) && !isCommonFirstName(w))
    .sort((a, b) => b.length - a.length)
}

function getSearchTerms(norm: string): string[] {
  const terms: string[] = []
  const words = norm.split(' ').filter(w => w.length >= 2)
  const distinctive = getDistinctiveWords(norm)
  if (words.length >= 2) terms.push(words.slice(0, 2).join(' '))
  if (distinctive.length > 0) terms.push(distinctive[0])
  if (distinctive.length > 1) terms.push(distinctive[1])
  if (words.length <= 3 && words.length > 0) terms.push(words.join(' '))
  if (words.length >= 3) terms.push(words.slice(-2).join(' '))
  return [...new Set(terms)].filter(t => t.length >= 2)
}

// ── Main ──
async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('  MATCHING PJ → SUPABASE V2 (nom commercial + CP)')
  console.log('='.repeat(60))
  const startTime = Date.now()

  // Load PJ listings
  const rawLines = fs.readFileSync(LISTINGS_FILE, 'utf-8').trim().split('\n')
  const allListings: PJListing[] = rawLines.map(l => JSON.parse(l)).filter((l: any) => l.phone)

  // Dedup PJ by phone (keep first occurrence)
  const seenPhones = new Set<string>()
  const uniqueListings: PJListing[] = []
  for (const l of allListings) {
    if (!seenPhones.has(l.phone)) {
      seenPhones.add(l.phone)
      uniqueListings.push(l)
    }
  }

  // Group by dept
  const listingsByDept: Record<string, PJListing[]> = {}
  for (const l of uniqueListings) {
    if (!listingsByDept[l.deptCode]) listingsByDept[l.deptCode] = []
    listingsByDept[l.deptCode].push(l)
  }
  console.log(`  ${allListings.length.toLocaleString('fr-FR')} listings PJ total`)
  console.log(`  ${uniqueListings.length.toLocaleString('fr-FR')} téléphones uniques`)

  // Connect Postgres
  const pool = new Pool({
    connectionString: PG_URL,
    ssl: { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 30000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  })
  pool.on('error', (err: any) => console.log('  ⚠ Pool error:', err.message))
  const testClient = await pool.connect()
  testClient.release()

  // Get existing phones to skip
  const existingPhones = await pool.query('SELECT DISTINCT phone FROM providers WHERE phone IS NOT NULL AND is_active = true')
  const dbPhoneSet = new Set(existingPhones.rows.map((r: any) => r.phone))
  console.log(`  ${dbPhoneSet.size.toLocaleString('fr-FR')} phones déjà en base`)

  // Filter to only unmatched phones
  const toProcess = uniqueListings.filter(l => !dbPhoneSet.has(l.phone))
  const toProcessByDept: Record<string, PJListing[]> = {}
  for (const l of toProcess) {
    if (!toProcessByDept[l.deptCode]) toProcessByDept[l.deptCode] = []
    toProcessByDept[l.deptCode].push(l)
  }
  console.log(`  ${toProcess.length.toLocaleString('fr-FR')} phones à matcher\n`)

  // Global dedup
  const assignedPhones = new Set<string>()
  const assignedArtisans = new Set<string>()
  const updates: { id: string; phone: string; strategy: string; score: number; pjName: string; artisanName: string }[] = []

  // Stats per strategy
  const stratStats = { nameFullDept: 0, nameCommDept: 0, nameFullNeighbor: 0, nameCommNeighbor: 0, cpMatch: 0 }

  // ── Artisan cache with dual indexing ──
  const artisanCache = new Map<string, Artisan[]>()
  // Index by postal code for CP strategy
  const artisanByCPCache = new Map<string, Artisan[]>()

  async function loadDept(dept: string): Promise<Artisan[]> {
    if (artisanCache.has(dept)) return artisanCache.get(dept)!
    const result = await pool.query(
      `SELECT id, name, phone, address_postal_code as cp
       FROM providers WHERE address_department = $1 AND is_active = true`, [dept]
    )
    const artisans: Artisan[] = result.rows.map((r: any) => {
      const commercial = extractCommercial(r.name)
      const legal = extractLegal(r.name)
      return {
        id: r.id,
        name: r.name,
        normFull: normalizeText(r.name),
        normLegal: normalizeText(legal),
        normCommercial: commercial ? normalizeText(commercial) : '',
        phone: r.phone,
        cp: r.cp,
      }
    })
    artisanCache.set(dept, artisans)

    // Index by CP
    for (const a of artisans) {
      if (a.cp) {
        if (!artisanByCPCache.has(a.cp)) artisanByCPCache.set(a.cp, [])
        artisanByCPCache.get(a.cp)!.push(a)
      }
    }

    // Keep memory bounded
    if (artisanCache.size > 20) {
      const firstKey = artisanCache.keys().next().value
      if (firstKey) {
        // Clean CP index for this dept
        const oldArtisans = artisanCache.get(firstKey)!
        for (const a of oldArtisans) {
          if (a.cp && artisanByCPCache.has(a.cp)) {
            const arr = artisanByCPCache.get(a.cp)!
            const filtered = arr.filter(x => x.id !== a.id)
            if (filtered.length === 0) artisanByCPCache.delete(a.cp)
            else artisanByCPCache.set(a.cp, filtered)
          }
        }
        artisanCache.delete(firstKey)
      }
    }
    return artisans
  }

  // ── Search candidates by substring in name ──
  function searchByName(artisans: Artisan[], term: string, field: 'normFull' | 'normLegal' | 'normCommercial', limit = 100): Artisan[] {
    const m: Artisan[] = []
    for (const a of artisans) {
      const val = a[field]
      if (val && val.includes(term)) {
        m.push(a)
        if (m.length >= limit) break
      }
    }
    return m
  }

  // ── Score a candidate against a PJ listing ──
  function scoreMatch(normPJ: string, artisan: Artisan, postalCode?: string): { score: number; field: string } {
    // Score against full name
    let scoreFull = nameSimilarity(normPJ, artisan.normFull)
    // Score against commercial name (often closer to PJ name)
    let scoreComm = artisan.normCommercial ? nameSimilarity(normPJ, artisan.normCommercial) : 0
    // Score against legal name
    let scoreLegal = nameSimilarity(normPJ, artisan.normLegal)

    let bestScore = scoreFull
    let bestField = 'full'
    if (scoreComm > bestScore) { bestScore = scoreComm; bestField = 'commercial' }
    if (scoreLegal > bestScore) { bestScore = scoreLegal; bestField = 'legal' }

    // Postal code bonus
    if (postalCode && artisan.cp === postalCode) {
      bestScore = Math.min(1, bestScore + 0.15)
    }

    return { score: bestScore, field: bestField }
  }

  // ── Strategy A: name match (same dept or neighbors) ──
  function tryNameMatch(listing: PJListing, normPJ: string, artisans: Artisan[], searchTerms: string[], threshold: number): { artisan: Artisan; score: number; field: string } | null {
    let best: { artisan: Artisan; score: number; field: string } | null = null

    for (const term of searchTerms) {
      // Search in full name (includes commercial in parentheses)
      const candsFull = searchByName(artisans, term, 'normFull')
      // Also search specifically in commercial name
      const candsComm = searchByName(artisans, term, 'normCommercial')

      // Merge and dedup
      const seen = new Set<string>()
      const allCands: Artisan[] = []
      for (const c of [...candsFull, ...candsComm]) {
        if (!seen.has(c.id)) { seen.add(c.id); allCands.push(c) }
      }

      for (const c of allCands) {
        if (c.phone || assignedArtisans.has(c.id)) continue
        const { score, field } = scoreMatch(normPJ, c, listing.postalCode)
        if (score >= threshold && (!best || score > best.score)) {
          best = { artisan: c, score, field }
        }
      }
    }
    return best
  }

  // ── Strategy B: postal code + distinctive keyword ──
  function tryCPMatch(listing: PJListing, normPJ: string): { artisan: Artisan; score: number } | null {
    if (!listing.postalCode) return null

    const distinctive = getDistinctiveWords(normPJ)
    // Need at least one long distinctive word for CP match (avoid false positives)
    const longDistinctive = distinctive.filter(w => w.length >= MIN_DISTINCTIVE_LEN)
    if (longDistinctive.length === 0) return null

    const cpArtisans = artisanByCPCache.get(listing.postalCode) || []
    if (cpArtisans.length === 0) return null

    let best: { artisan: Artisan; score: number } | null = null

    for (const c of cpArtisans) {
      if (c.phone || assignedArtisans.has(c.id)) continue

      // Check if ANY long distinctive word appears in any of the artisan's name fields
      const hasKeyword = longDistinctive.some(w =>
        c.normFull.includes(w) || c.normCommercial.includes(w)
      )
      if (!hasKeyword) continue

      const { score } = scoreMatch(normPJ, c, listing.postalCode)
      if (score >= CP_MATCH_THRESHOLD && (!best || score > best.score)) {
        best = { artisan: c, score }
      }
    }
    return best
  }

  // ── Process each department ──
  let totalMatches = 0
  let totalSkipped = 0

  for (let i = 0; i < DEPTS.length; i++) {
    const dept = DEPTS[i]
    const listings = toProcessByDept[dept] || []
    if (listings.length === 0) continue

    // Preload dept + neighbors
    const artisans = await loadDept(dept)
    const neighbors = DEPT_NEIGHBORS[dept] || []
    // Preload neighbor artisans for CP index
    for (const nd of neighbors.slice(0, 4)) {
      await loadDept(nd)
    }

    let deptMatches = 0

    for (const listing of listings) {
      if (assignedPhones.has(listing.phone)) { totalSkipped++; continue }

      const normPJ = normalizeText(listing.name)
      if (normPJ.length < 2) continue
      const searchTerms = getSearchTerms(normPJ)

      let matched = false

      // Strategy A1: name match in same dept (search in full + commercial)
      const matchA1 = tryNameMatch(listing, normPJ, artisans, searchTerms, MATCH_THRESHOLD)
      if (matchA1) {
        updates.push({
          id: matchA1.artisan.id, phone: listing.phone,
          strategy: `name_${matchA1.field}_dept`, score: matchA1.score,
          pjName: listing.name, artisanName: matchA1.artisan.name,
        })
        assignedPhones.add(listing.phone)
        assignedArtisans.add(matchA1.artisan.id)
        if (matchA1.field === 'commercial') stratStats.nameCommDept++
        else stratStats.nameFullDept++
        deptMatches++
        totalMatches++
        matched = true
      }

      // Strategy A2: name match in neighbors
      if (!matched) {
        for (const nd of neighbors.slice(0, 4)) {
          const nArtisans = await loadDept(nd)
          const matchA2 = tryNameMatch(listing, normPJ, nArtisans, searchTerms.slice(0, 3), MATCH_THRESHOLD)
          if (matchA2) {
            updates.push({
              id: matchA2.artisan.id, phone: listing.phone,
              strategy: `name_${matchA2.field}_neighbor`, score: matchA2.score,
              pjName: listing.name, artisanName: matchA2.artisan.name,
            })
            assignedPhones.add(listing.phone)
            assignedArtisans.add(matchA2.artisan.id)
            if (matchA2.field === 'commercial') stratStats.nameCommNeighbor++
            else stratStats.nameFullNeighbor++
            deptMatches++
            totalMatches++
            matched = true
            break
          }
        }
      }

      // Strategy B: CP + distinctive keyword (strict threshold)
      if (!matched) {
        const matchB = tryCPMatch(listing, normPJ)
        if (matchB) {
          updates.push({
            id: matchB.artisan.id, phone: listing.phone,
            strategy: 'cp_keyword', score: matchB.score,
            pjName: listing.name, artisanName: matchB.artisan.name,
          })
          assignedPhones.add(listing.phone)
          assignedArtisans.add(matchB.artisan.id)
          stratStats.cpMatch++
          deptMatches++
          totalMatches++
        }
      }
    }

    const elapsed = (Date.now() - startTime) / 1000
    if (listings.length > 0) {
      console.log(`  [${i+1}/${DEPTS.length}] ${dept}: ${listings.length} à traiter, ${artisans.length} artisans → +${deptMatches} (total: ${totalMatches})  [${Math.round(elapsed)}s]`)
    }
  }

  // ── Upload ──
  console.log(`\n  Matching V2 terminé: ${totalMatches} nouveaux matches`)
  console.log(`  Stratégies:`)
  console.log(`    Nom complet (dept):      ${stratStats.nameFullDept}`)
  console.log(`    Nom commercial (dept):   ${stratStats.nameCommDept}`)
  console.log(`    Nom complet (voisin):    ${stratStats.nameFullNeighbor}`)
  console.log(`    Nom commercial (voisin): ${stratStats.nameCommNeighbor}`)
  console.log(`    CP + mot-clé:            ${stratStats.cpMatch}`)
  console.log(`\n  Upload de ${updates.length} téléphones (batch de 500)...`)

  let uploaded = 0
  let errors = 0
  const UPLOAD_BATCH = 500

  for (let i = 0; i < updates.length; i += UPLOAD_BATCH) {
    const batch = updates.slice(i, i + UPLOAD_BATCH)
    const values = batch.map((u, idx) => `($${idx*2+1}::uuid, $${idx*2+2})`).join(',')
    const params = batch.flatMap(u => [u.id, u.phone])
    try {
      const res = await pool.query(
        `UPDATE providers AS p SET phone = v.phone FROM (VALUES ${values}) AS v(id, phone) WHERE p.id = v.id AND p.phone IS NULL`,
        params
      )
      uploaded += res.rowCount || batch.length
    } catch (e: any) {
      // Fallback one by one
      for (const u of batch) {
        try {
          await pool.query('UPDATE providers SET phone = $1 WHERE id = $2 AND phone IS NULL', [u.phone, u.id])
          uploaded++
        } catch { errors++ }
      }
    }
    console.log(`  ${Math.min(i + UPLOAD_BATCH, updates.length)}/${updates.length} (${uploaded} OK, ${errors} err)`)
  }

  // Save match details for audit
  const auditFile = path.join(__dirname, '.enrich-data', 'matches-v2-audit.jsonl')
  const fd = fs.openSync(auditFile, 'w')
  for (const u of updates) {
    fs.writeSync(fd, JSON.stringify(u) + '\n')
  }
  fs.closeSync(fd)

  await pool.end()

  const elapsed = Math.round((Date.now() - startTime) / 1000)
  console.log('\n' + '='.repeat(60))
  console.log('  RÉSULTAT FINAL V2')
  console.log('='.repeat(60))
  console.log(`  Phones PJ à traiter:   ${toProcess.length.toLocaleString('fr-FR')}`)
  console.log(`  Nouveaux téléphones:   +${uploaded}`)
  console.log(`  Erreurs upload:        ${errors}`)
  console.log(`  Audit:                 ${auditFile}`)
  console.log(`  Durée totale:          ${elapsed}s`)
  console.log('='.repeat(60) + '\n')
}

main().then(() => process.exit(0)).catch(e => { console.error('Erreur:', e); process.exit(1) })
