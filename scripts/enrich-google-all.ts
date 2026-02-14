/**
 * Enrichissement Google Maps — 2 opérations :
 *
 * 1. PHONES : Matcher les 5k fiches gm-listings.jsonl → artisans sans téléphone
 * 2. RATINGS : Cross-matcher les providers google_maps/google_places (avec rating+avis)
 *    → artisans annuaire_entreprises (par phone ou par nom)
 *
 * Usage: npx tsx scripts/enrich-google-all.ts
 */
import * as fs from 'fs'
import * as path from 'path'
import { Pool } from 'pg'

const PG_URL = 'postgresql://postgres:BEB6LnGlT6U9bkTe@db.umjmbdbwcsxrvfqktiui.supabase.co:5432/postgres'
const GM_FILE = path.join(__dirname, '.gm-data', 'gm-listings.jsonl')

const MATCH_THRESHOLD = 0.35

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
  'amenagement','interieur','exterieur','habitat','logement','maison',
  'techni','technique','professionnel','groupe','agence','cabinet','atelier','bureau',
])

// ── Normalisation ──
function normalizeText(text: string): string {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(sarl|sas|sa|eurl|sasu|eirl|ei|sci|snc|scop|scp|selarl|auto[- ]?entrepreneur|micro[- ]?entreprise|ets|etablissements?|entreprise|societe|ste|monsieur|madame|m\.|mme|mr|dr)\b/gi, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim()
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

function extractCommercial(rawName: string): string {
  const matches = rawName.match(/\(([^)]+)\)/g)
  if (!matches || matches.length === 0) return ''
  return matches[matches.length - 1].replace(/[()]/g, '').trim()
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

function nameSimilarity(a: string, b: string): number {
  const tokA = a.split(' ').filter(t => t.length > 1)
  const tokB = b.split(' ').filter(t => t.length > 1)
  if (tokA.length === 0 || tokB.length === 0) return 0
  let overlap = 0
  const matchedB = new Set<string>()
  for (const t of tokA) { if (tokB.includes(t) && !matchedB.has(t)) { overlap++; matchedB.add(t) } }
  const unmatchedA = tokA.filter(t => !tokB.includes(t))
  const unmatchedB = tokB.filter(t => !matchedB.has(t))
  for (const wa of unmatchedA) {
    let best = 0, bestIdx = -1
    for (let i = 0; i < unmatchedB.length; i++) {
      if (matchedB.has(unmatchedB[i])) continue
      const f = (wa === unmatchedB[i]) ? 1 : (wa.length >= 3 && unmatchedB[i].length >= 3 && levenshtein(wa, unmatchedB[i]) <= (Math.max(wa.length, unmatchedB[i].length) >= 7 ? 2 : 1)) ? 0.8 : 0
      if (f > best) { best = f; bestIdx = i }
    }
    if (best > 0 && bestIdx >= 0) { overlap += best; matchedB.add(unmatchedB[bestIdx]) }
  }
  if (overlap === 0) {
    for (const ta of tokA) for (const tb of tokB) {
      if (ta !== tb && ta.length >= 4 && tb.length >= 4 && (tb.includes(ta) || ta.includes(tb))) overlap += 0.5
    }
  }
  return overlap / new Set([...tokA, ...tokB]).size
}

interface Artisan { id: string; name: string; normFull: string; normComm: string; phone: string | null }
interface GMListing { name: string; phone: string; deptCode: string }

async function main() {
  const pool = new Pool({
    connectionString: PG_URL,
    ssl: { rejectUnauthorized: false },
    max: 3, keepAlive: true, keepAliveInitialDelayMillis: 10000,
  })
  pool.on('error', (err: any) => console.log('  ⚠ Pool:', err.message))

  const startTime = Date.now()

  // ═══════════════════════════════════════════
  // PARTIE 1 : PHONES depuis gm-listings.jsonl
  // ═══════════════════════════════════════════
  console.log('\n' + '='.repeat(60))
  console.log('  PARTIE 1 : ENRICHISSEMENT PHONES (GM → artisans)')
  console.log('='.repeat(60))

  const rawLines = fs.readFileSync(GM_FILE, 'utf-8').trim().split('\n')
  const allGM: GMListing[] = rawLines.map(l => JSON.parse(l)).filter((l: any) => l.phone)

  // Dedup
  const seenPhones = new Set<string>()
  const uniqueGM: GMListing[] = []
  for (const l of allGM) {
    const norm = normalizePhone(l.phone)
    if (norm && !seenPhones.has(norm)) { seenPhones.add(norm); uniqueGM.push({ ...l, phone: norm }) }
  }

  // Get existing phones
  const existingPhones = await pool.query('SELECT DISTINCT phone FROM providers WHERE phone IS NOT NULL AND is_active = true')
  const dbPhoneSet = new Set(existingPhones.rows.map((r: any) => r.phone))

  const toMatch = uniqueGM.filter(l => !dbPhoneSet.has(l.phone))
  console.log(`  ${allGM.length} fiches GM total`)
  console.log(`  ${uniqueGM.length} phones uniques`)
  console.log(`  ${toMatch.length} phones pas encore en base`)

  // Group by dept
  const byDept: Record<string, GMListing[]> = {}
  for (const l of toMatch) {
    if (!byDept[l.deptCode]) byDept[l.deptCode] = []
    byDept[l.deptCode].push(l)
  }

  const assignedPhones = new Set<string>()
  const assignedArtisans = new Set<string>()
  const phoneUpdates: { id: string; phone: string }[] = []
  const artisanCache = new Map<string, Artisan[]>()

  async function loadDept(dept: string): Promise<Artisan[]> {
    if (artisanCache.has(dept)) return artisanCache.get(dept)!
    const r = await pool.query(
      `SELECT id, name, phone FROM providers WHERE address_department = $1 AND is_active = true AND source = 'annuaire_entreprises'`, [dept]
    )
    const artisans: Artisan[] = r.rows.map((row: any) => ({
      id: row.id, name: row.name, phone: row.phone,
      normFull: normalizeText(row.name),
      normComm: extractCommercial(row.name) ? normalizeText(extractCommercial(row.name)) : '',
    }))
    artisanCache.set(dept, artisans)
    if (artisanCache.size > 15) { const k = artisanCache.keys().next().value; if (k) artisanCache.delete(k) }
    return artisans
  }

  const depts = Object.keys(byDept).sort()
  let totalPhoneMatches = 0

  for (const dept of depts) {
    const listings = byDept[dept]
    const artisans = await loadDept(dept)
    let deptMatches = 0

    for (const listing of listings) {
      if (assignedPhones.has(listing.phone)) continue
      const normGM = normalizeText(listing.name)
      if (normGM.length < 2) continue

      const distinctive = normGM.split(' ').filter(w => w.length >= 3 && !COMMON_WORDS.has(w))
      const searchTerms = [normGM.split(' ').filter(w => w.length >= 2).slice(0, 2).join(' '), ...distinctive].filter(t => t.length >= 2)

      let best: { a: Artisan; score: number } | null = null
      for (const term of searchTerms) {
        for (const a of artisans) {
          if (a.phone || assignedArtisans.has(a.id)) continue
          if (!a.normFull.includes(term) && !a.normComm.includes(term)) continue
          const s1 = nameSimilarity(normGM, a.normFull)
          const s2 = a.normComm ? nameSimilarity(normGM, a.normComm) : 0
          const score = Math.max(s1, s2)
          if (score >= MATCH_THRESHOLD && (!best || score > best.score)) best = { a, score }
        }
      }

      if (best) {
        phoneUpdates.push({ id: best.a.id, phone: listing.phone })
        assignedPhones.add(listing.phone)
        assignedArtisans.add(best.a.id)
        deptMatches++
        totalPhoneMatches++
      }
    }
    if (listings.length > 0) console.log(`  [${dept}] ${listings.length} GM → +${deptMatches} (total: ${totalPhoneMatches})`)
  }

  // Upload phones
  console.log(`\n  Upload ${phoneUpdates.length} phones...`)
  let phonesUploaded = 0
  const BATCH = 500
  for (let i = 0; i < phoneUpdates.length; i += BATCH) {
    const batch = phoneUpdates.slice(i, i + BATCH)
    const values = batch.map((u, idx) => `($${idx*2+1}::uuid, $${idx*2+2})`).join(',')
    const params = batch.flatMap(u => [u.id, u.phone])
    try {
      const res = await pool.query(
        `UPDATE providers AS p SET phone = v.phone FROM (VALUES ${values}) AS v(id, phone) WHERE p.id = v.id AND p.phone IS NULL`, params
      )
      phonesUploaded += res.rowCount || batch.length
    } catch { for (const u of batch) { try { await pool.query('UPDATE providers SET phone=$1 WHERE id=$2 AND phone IS NULL', [u.phone, u.id]); phonesUploaded++ } catch {} } }
  }
  console.log(`  ✓ ${phonesUploaded} phones uploadés`)

  // ═══════════════════════════════════════════
  // PARTIE 2 : RATINGS depuis providers google_maps/google_places
  // ═══════════════════════════════════════════
  console.log('\n' + '='.repeat(60))
  console.log('  PARTIE 2 : ENRICHISSEMENT RATINGS (Google → artisans)')
  console.log('='.repeat(60))

  // Get all Google providers with rating data
  const googleProviders = await pool.query(`
    SELECT id, name, phone, rating_average, review_count
    FROM providers
    WHERE source IN ('google_maps', 'google_places')
      AND rating_average > 0
      AND review_count > 0
  `)
  console.log(`  ${googleProviders.rows.length} providers Google avec avis`)

  // Strategy A: match by phone (most reliable)
  let ratingByPhone = 0
  let ratingByName = 0
  const ratingUpdates: { id: string; rating: number; reviews: number }[] = []
  const updatedArtisanIds = new Set<string>()

  for (const gp of googleProviders.rows) {
    const normPhone = gp.phone ? normalizePhone(gp.phone) : null

    if (normPhone) {
      // Find annuaire artisan with same phone
      const r = await pool.query(
        `SELECT id, rating_average, review_count FROM providers
         WHERE phone = $1 AND source = 'annuaire_entreprises' AND is_active = true
         LIMIT 1`, [normPhone]
      )
      if (r.rows.length > 0) {
        const artisan = r.rows[0]
        // Only update if Google has better data
        if ((!artisan.rating_average || artisan.rating_average === 0) || artisan.review_count === 0) {
          ratingUpdates.push({ id: artisan.id, rating: gp.rating_average, reviews: gp.review_count })
          updatedArtisanIds.add(artisan.id)
          ratingByPhone++
        }
        continue
      }
    }

    // Strategy B: match by name (fuzzy) — need to search across all depts
    const normGoogle = normalizeText(gp.name)
    if (normGoogle.length < 3) continue
    const distinctive = normGoogle.split(' ').filter((w: string) => w.length >= 4 && !COMMON_WORDS.has(w))
    if (distinctive.length === 0) continue

    // Search by most distinctive word
    const searchWord = distinctive.sort((a: string, b: string) => b.length - a.length)[0]
    const r = await pool.query(
      `SELECT id, name, rating_average, review_count FROM providers
       WHERE source = 'annuaire_entreprises' AND is_active = true
       AND LOWER(name) LIKE $1
       LIMIT 20`, ['%' + searchWord + '%']
    )

    let bestMatch: { id: string; score: number } | null = null
    for (const cand of r.rows) {
      if (updatedArtisanIds.has(cand.id)) continue
      const normCand = normalizeText(cand.name)
      const normComm = extractCommercial(cand.name) ? normalizeText(extractCommercial(cand.name)) : ''
      const score = Math.max(nameSimilarity(normGoogle, normCand), normComm ? nameSimilarity(normGoogle, normComm) : 0)
      if (score >= 0.5 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { id: cand.id, score }
      }
    }

    if (bestMatch) {
      ratingUpdates.push({ id: bestMatch.id, rating: gp.rating_average, reviews: gp.review_count })
      updatedArtisanIds.add(bestMatch.id)
      ratingByName++
    }
  }

  console.log(`  Matches rating par phone: ${ratingByPhone}`)
  console.log(`  Matches rating par nom: ${ratingByName}`)
  console.log(`  Total: ${ratingUpdates.length} artisans à enrichir`)

  // Upload ratings
  let ratingsUploaded = 0
  for (let i = 0; i < ratingUpdates.length; i += BATCH) {
    const batch = ratingUpdates.slice(i, i + BATCH)
    for (const u of batch) {
      try {
        await pool.query(
          'UPDATE providers SET rating_average = $1, review_count = $2 WHERE id = $3',
          [u.rating, u.reviews, u.id]
        )
        ratingsUploaded++
      } catch {}
    }
    if (ratingUpdates.length > BATCH) console.log(`  ${Math.min(i + BATCH, ratingUpdates.length)}/${ratingUpdates.length}`)
  }
  console.log(`  ✓ ${ratingsUploaded} ratings+avis uploadés`)

  await pool.end()

  const elapsed = Math.round((Date.now() - startTime) / 1000)
  console.log('\n' + '='.repeat(60))
  console.log('  RÉSULTAT FINAL')
  console.log('='.repeat(60))
  console.log(`  Phones ajoutés:    +${phonesUploaded}`)
  console.log(`  Ratings enrichis:  +${ratingsUploaded}`)
  console.log(`  Durée:             ${elapsed}s`)
  console.log('='.repeat(60) + '\n')
}

main().then(() => process.exit(0)).catch(e => { console.error('Erreur:', e); process.exit(1) })
