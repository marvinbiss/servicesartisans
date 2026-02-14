/**
 * Matching PJ → Supabase DIRECT — département par département.
 * Pas d'export global : pour chaque dept, on charge les artisans depuis Postgres,
 * on matche en mémoire contre les listings PJ, et on upload les résultats.
 * Tout en une passe, ~30-60 min.
 */
import * as fs from 'fs'
import * as path from 'path'
import { Client, Pool } from 'pg'

const PG_URL = 'postgresql://postgres:BEB6LnGlT6U9bkTe@db.umjmbdbwcsxrvfqktiui.supabase.co:5432/postgres'
const LISTINGS_FILE = path.join(__dirname, '.enrich-data', 'pj-listings.jsonl')

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
]

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

const COMMON_WORDS = new Set([
  'plomberie','plombier','chauffage','chauffagiste','electricite','electricien',
  'peinture','peintre','menuiserie','menuisier','maconnerie','macon',
  'carrelage','carreleur','couverture','couvreur','serrurerie','serrurier',
  'isolation','platrier','platrerie','renovation','batiment','travaux',
  'construction','entreprise','artisan','services','service','general',
  'generale','multi','pro','plus','france','sud','nord','est','ouest',
  'climatisation','terrassement','demolition','assainissement','domotique',
  'ramonage','etancheite','depannage','paysagiste','vitrier',
  'chauffagistes','electriciens','menuisiers','macons','peintres','carreleurs',
  'couvreurs','serruriers','plombiers','charpentier','charpente',
  'toiture','facade','ravalement','enduit','cloture',
  'amenagement','interieur','exterieur','habitat','maison',
  'techni','technique','professionnel','groupe','agence','cabinet','atelier','bureau',
])

// ── Name normalization ──
function normalizeName(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(sarl|sas|sa|eurl|sasu|eirl|ei|sci|snc|scop|scp|selarl|auto[- ]?entrepreneur|micro[- ]?entreprise|ets|etablissements?|entreprise|societe|ste|monsieur|madame|m\.|mme|mr|dr|cabinet|agence|atelier|groupe|holding)\b/gi, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim()
}

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
  const tA = new Set(tokA), tB = new Set(tokB)
  if (tA.size === 0 || tB.size === 0) return 0
  let overlap = 0
  const matchedB = new Set<string>()
  tA.forEach(t => { if (tB.has(t)) { overlap++; matchedB.add(t) } })
  const unmatchedA = tokA.filter(t => !tB.has(t))
  const unmatchedB = tokB.filter(t => !tA.has(t) && !matchedB.has(t))
  for (const wa of unmatchedA) {
    let best = 0, bestIdx = -1
    for (let i = 0; i < unmatchedB.length; i++) {
      if (matchedB.has(unmatchedB[i])) continue
      const f = fuzzyTokenMatch(wa, unmatchedB[i])
      if (f > best) { best = f; bestIdx = i }
    }
    if (best > 0 && bestIdx >= 0) { overlap += best; matchedB.add(unmatchedB[bestIdx]) }
  }
  if (overlap === 0) {
    tA.forEach(ta => tB.forEach(tb => {
      if (ta !== tb && ta.length >= 4 && tb.length >= 4 && (tb.includes(ta) || ta.includes(tb))) overlap += 0.5
    }))
  }
  return overlap / new Set([...tA, ...tB]).size
}

function acronymMatch(norm: string, candNorm: string): boolean {
  const pw = norm.split(' ').filter(w => w.length >= 2 && w.length <= 5)
  const cw = candNorm.split(' ').filter(w => w.length >= 2)
  if (cw.length < 2) return false
  const acronym = cw.map(w => w[0]).join('')
  for (const p of pw) { if (acronym === p) return true }
  const pjAcr = norm.split(' ').filter(w => w.length >= 2).map(w => w[0]).join('')
  for (const c of cw) { if (c.length <= 5 && pjAcr === c) return true }
  return false
}

function getDistinctiveWords(norm: string): string[] {
  return norm.split(' ').filter(w => w.length >= 3 && !COMMON_WORDS.has(w)).sort((a,b) => b.length - a.length)
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

// ── Types ──
interface PJListing { name: string; phone?: string; city?: string; postalCode?: string; deptCode: string }
interface Artisan { id: string; name: string; norm: string; phone: string|null; cp: string|null; city: string|null; cityNorm: string|null }

async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('  MATCHING PJ → SUPABASE (direct par département)')
  console.log('='.repeat(60))
  const startTime = Date.now()

  // Load PJ listings
  const rawLines = fs.readFileSync(LISTINGS_FILE, 'utf-8').trim().split('\n')
  const allListings: PJListing[] = rawLines.map(l => JSON.parse(l)).filter((l: any) => l.phone)
  const listingsByDept: Record<string, PJListing[]> = {}
  for (const l of allListings) {
    if (!listingsByDept[l.deptCode]) listingsByDept[l.deptCode] = []
    listingsByDept[l.deptCode].push(l)
  }
  console.log(`  ${allListings.length.toLocaleString('fr-FR')} listings PJ avec téléphone`)

  // Connect Postgres with Pool + keepalive
  const { Pool } = await import('pg') as any
  const pool = new Pool({
    connectionString: PG_URL,
    ssl: { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 30000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  })
  pool.on('error', (err: any) => console.log('  ⚠ Pool error (non-fatal):', err.message))
  // Test connection
  const testClient = await pool.connect()
  testClient.release()
  console.log('  Connexion Postgres OK (Pool)\n')

  // Global dedup
  const assignedPhones = new Set<string>()
  const assignedArtisans = new Set<string>()
  let totalMatches = 0
  let totalAlready = 0
  let totalListings = 0
  const updates: { id: string; phone: string }[] = []

  // Cache artisans by dept (for neighbor lookups)
  const artisanCache = new Map<string, Artisan[]>()

  async function loadDept(dept: string): Promise<Artisan[]> {
    if (artisanCache.has(dept)) return artisanCache.get(dept)!
    const result = await pool.query(
      `SELECT id, name, phone, address_postal_code as cp, address_city as city, is_active
       FROM providers WHERE address_department = $1`, [dept]
    )
    const artisans: Artisan[] = result.rows.filter((r: any) => r.is_active).map((r: any) => ({
      id: r.id, name: r.name, norm: normalizeName(r.name),
      phone: r.phone, cp: r.cp, city: r.city,
      cityNorm: r.city ? r.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z\s]/g,' ').trim() : null,
    }))
    artisanCache.set(dept, artisans)
    // Keep cache limited to ~10 depts
    if (artisanCache.size > 15) {
      const firstKey = artisanCache.keys().next().value
      if (firstKey) artisanCache.delete(firstKey)
    }
    return artisans
  }

  function searchByName(artisans: Artisan[], term: string, limit = 100): Artisan[] {
    const m: Artisan[] = []
    for (const a of artisans) { if (a.norm.includes(term)) { m.push(a); if (m.length >= limit) break } }
    return m
  }

  function tryMatch(listing: PJListing, normPJ: string, artisans: Artisan[], searchTerms: string[]): Artisan | null {
    for (const term of searchTerms) {
      const candidates = searchByName(artisans, term)
      let best: { a: Artisan; score: number } | null = null
      for (const c of candidates) {
        if (c.phone || assignedArtisans.has(c.id)) continue
        let score = nameSimilarity(normPJ, c.norm)
        if (listing.postalCode && c.cp === listing.postalCode) score = Math.min(1, score + 0.15)
        if (score < MATCH_THRESHOLD && acronymMatch(normPJ, c.norm)) score = Math.max(score, MATCH_THRESHOLD)
        if (score >= MATCH_THRESHOLD && (!best || score > best.score)) best = { a: c, score }
      }
      if (best) return best.a
    }
    return null
  }

  // Process each department
  for (let i = 0; i < DEPTS.length; i++) {
    const dept = DEPTS[i]
    const listings = listingsByDept[dept] || []
    if (listings.length === 0) {
      console.log(`  [${i+1}/${DEPTS.length}] ${dept}: 0 listings — skip`)
      continue
    }

    const artisans = await loadDept(dept)
    let deptMatches = 0
    let deptAlready = 0

    for (const listing of listings) {
      totalListings++
      if (!listing.phone || assignedPhones.has(listing.phone)) continue

      const normPJ = normalizeName(listing.name)
      if (normPJ.length < 2) continue
      const searchTerms = getSearchTerms(normPJ)

      // Phase A: same dept
      let match = tryMatch(listing, normPJ, artisans, searchTerms)

      // Phase B: neighbors (top 3)
      if (!match) {
        const neighbors = DEPT_NEIGHBORS[dept] || []
        for (const nd of neighbors.slice(0, 3)) {
          const nArtisans = await loadDept(nd)
          match = tryMatch(listing, normPJ, nArtisans, searchTerms.slice(0, 2))
          if (match) break
        }
      }

      if (match) {
        if (match.phone) { deptAlready++; totalAlready++; continue }
        updates.push({ id: match.id, phone: listing.phone })
        assignedPhones.add(listing.phone)
        assignedArtisans.add(match.id)
        deptMatches++
        totalMatches++
      }
    }

    const elapsed = (Date.now() - startTime) / 1000
    console.log(`  [${i+1}/${DEPTS.length}] ${dept}: ${listings.length} listings, ${artisans.length} artisans → +${deptMatches} matches (total: ${totalMatches})  [${Math.round(elapsed)}s]`)
  }

  // Upload results in bulk batches
  console.log(`\n  Matching terminé: ${totalMatches} matches, ${totalAlready} déjà avec tél`)
  console.log(`  Upload de ${updates.length} téléphones (batch de 500)...`)

  let uploaded = 0, errors = 0
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
      // Fallback: one by one
      for (const u of batch) {
        try {
          await pool.query('UPDATE providers SET phone = $1 WHERE id = $2 AND phone IS NULL', [u.phone, u.id])
          uploaded++
        } catch { errors++ }
      }
    }
    console.log(`  ${Math.min(i + UPLOAD_BATCH, updates.length)}/${updates.length} uploadés (${uploaded} OK, ${errors} err)`)
  }

  await pool.end()

  const elapsed = Math.round((Date.now() - startTime) / 1000)
  console.log(`\n` + '='.repeat(60))
  console.log(`  RÉSULTAT FINAL`)
  console.log('='.repeat(60))
  console.log(`  Listings PJ traitées: ${totalListings.toLocaleString('fr-FR')}`)
  console.log(`  Nouveaux téléphones:  +${uploaded}`)
  console.log(`  Déjà avec tél:       ${totalAlready}`)
  console.log(`  Erreurs upload:      ${errors}`)
  console.log(`  Durée totale:        ${elapsed}s`)
  console.log('='.repeat(60) + '\n')
}

main().then(() => process.exit(0)).catch(e => { console.error('Erreur:', e); process.exit(1) })
