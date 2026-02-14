/**
 * Enrichissement RATINGS Google → artisans annuaire_entreprises
 * (Part 2 corrigée — matching en mémoire, pas de LIKE sur 700k rows)
 *
 * Stratégie A : match par téléphone (le plus fiable)
 * Stratégie B : match par nom fuzzy (chargement par département, matching in-memory)
 *
 * Usage: npx tsx scripts/enrich-google-ratings.ts
 */
import { Pool } from 'pg'

const PG_URL = 'postgresql://postgres:BEB6LnGlT6U9bkTe@db.umjmbdbwcsxrvfqktiui.supabase.co:5432/postgres'

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

function normalizeText(text: string): string {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(sarl|sas|sa|eurl|sasu|eirl|ei|sci|snc|scop|scp|selarl|auto[- ]?entrepreneur|micro[- ]?entreprise|ets|etablissements?|entreprise|societe|ste|monsieur|madame|m\.|mme|mr|dr)\b/gi, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim()
}

function extractCommercial(rawName: string): string {
  const matches = rawName.match(/\(([^)]+)\)/g)
  if (!matches || matches.length === 0) return ''
  return matches[matches.length - 1].replace(/[()]/g, '').trim()
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

interface Artisan {
  id: string
  name: string
  normFull: string
  normComm: string
  phone: string | null
  rating: number
  reviews: number
}

interface GoogleProvider {
  id: string
  name: string
  phone: string | null
  rating: number
  reviews: number
  normName: string
  distinctive: string[]
}

async function main() {
  const pool = new Pool({
    connectionString: PG_URL,
    ssl: { rejectUnauthorized: false },
    max: 3, keepAlive: true, keepAliveInitialDelayMillis: 10000,
    options: '-c statement_timeout=300000',
  })
  pool.on('error', (err: any) => console.log('  ⚠ Pool:', err.message))

  const startTime = Date.now()

  console.log('\n' + '='.repeat(60))
  console.log('  ENRICHISSEMENT RATINGS (Google → artisans)')
  console.log('='.repeat(60))

  // 1) Load all Google providers with rating data
  const gpRes = await pool.query(`
    SELECT id, name, phone, rating_average, review_count
    FROM providers
    WHERE source IN ('google_maps', 'google_places')
      AND rating_average > 0
      AND review_count > 0
  `)
  const googleProviders: GoogleProvider[] = gpRes.rows.map((r: any) => {
    const normName = normalizeText(r.name)
    return {
      id: r.id, name: r.name,
      phone: r.phone ? normalizePhone(r.phone) : null,
      rating: r.rating_average, reviews: r.review_count,
      normName,
      distinctive: normName.split(' ').filter((w: string) => w.length >= 4 && !COMMON_WORDS.has(w)),
    }
  })
  console.log(`  ${googleProviders.length} providers Google avec avis`)

  // 2) Build phone→Google index for Strategy A
  const gpByPhone = new Map<string, GoogleProvider>()
  for (const gp of googleProviders) {
    if (gp.phone && !gpByPhone.has(gp.phone)) gpByPhone.set(gp.phone, gp)
  }
  console.log(`  ${gpByPhone.size} avec téléphone normalisé`)

  // 3) Get all departments
  const deptRes = await pool.query(
    `SELECT DISTINCT address_department FROM providers WHERE source = 'annuaire_entreprises' AND is_active = true AND address_department IS NOT NULL`
  )
  const allDepts: string[] = deptRes.rows.map((r: any) => r.address_department).sort()
  console.log(`  ${allDepts.length} départements à traiter`)

  // 4) Build keyword→GoogleProvider[] index for Strategy B
  const gpByKeyword = new Map<string, GoogleProvider[]>()
  for (const gp of googleProviders) {
    for (const word of gp.distinctive) {
      if (!gpByKeyword.has(word)) gpByKeyword.set(word, [])
      gpByKeyword.get(word)!.push(gp)
    }
  }

  const ratingUpdates: { id: string; rating: number; reviews: number }[] = []
  const updatedArtisanIds = new Set<string>()
  const matchedGoogleIds = new Set<string>()
  let ratingByPhone = 0
  let ratingByName = 0

  // Process department by department
  for (let di = 0; di < allDepts.length; di++) {
    const dept = allDepts[di]

    // Load artisans for this dept
    const artRes = await pool.query(
      `SELECT id, name, phone, rating_average, review_count
       FROM providers
       WHERE address_department = $1 AND source = 'annuaire_entreprises' AND is_active = true`, [dept]
    )
    const artisans: Artisan[] = artRes.rows.map((r: any) => ({
      id: r.id, name: r.name, phone: r.phone,
      normFull: normalizeText(r.name),
      normComm: extractCommercial(r.name) ? normalizeText(extractCommercial(r.name)) : '',
      rating: r.rating_average || 0,
      reviews: r.review_count || 0,
    }))

    let deptPhoneMatches = 0
    let deptNameMatches = 0

    // Strategy A: match by phone
    for (const art of artisans) {
      if (updatedArtisanIds.has(art.id)) continue
      if (art.rating > 0 && art.reviews > 0) continue // already has rating
      if (!art.phone) continue

      const gp = gpByPhone.get(art.phone)
      if (!gp || matchedGoogleIds.has(gp.id)) continue

      ratingUpdates.push({ id: art.id, rating: gp.rating, reviews: gp.reviews })
      updatedArtisanIds.add(art.id)
      matchedGoogleIds.add(gp.id)
      ratingByPhone++
      deptPhoneMatches++
    }

    // Strategy B: match by name (in-memory fuzzy)
    // Build keyword index for this dept's artisans
    const artByKeyword = new Map<string, Artisan[]>()
    for (const art of artisans) {
      if (updatedArtisanIds.has(art.id)) continue
      if (art.rating > 0 && art.reviews > 0) continue
      const words = art.normFull.split(' ').filter(w => w.length >= 4 && !COMMON_WORDS.has(w))
      const commWords = art.normComm ? art.normComm.split(' ').filter(w => w.length >= 4 && !COMMON_WORDS.has(w)) : []
      for (const w of [...words, ...commWords]) {
        if (!artByKeyword.has(w)) artByKeyword.set(w, [])
        artByKeyword.get(w)!.push(art)
      }
    }

    // For each unmatched Google provider, check if any artisan in this dept matches by keyword
    for (const gp of googleProviders) {
      if (matchedGoogleIds.has(gp.id)) continue
      if (gp.distinctive.length === 0) continue

      // Find candidate artisans sharing a keyword
      const candidates = new Set<Artisan>()
      for (const word of gp.distinctive) {
        const arts = artByKeyword.get(word)
        if (arts) for (const a of arts) candidates.add(a)
      }

      let bestMatch: { art: Artisan; score: number } | null = null
      for (const cand of candidates) {
        if (updatedArtisanIds.has(cand.id)) continue
        if (cand.rating > 0 && cand.reviews > 0) continue
        const s1 = nameSimilarity(gp.normName, cand.normFull)
        const s2 = cand.normComm ? nameSimilarity(gp.normName, cand.normComm) : 0
        const score = Math.max(s1, s2)
        if (score >= 0.5 && (!bestMatch || score > bestMatch.score)) {
          bestMatch = { art: cand, score }
        }
      }

      if (bestMatch) {
        ratingUpdates.push({ id: bestMatch.art.id, rating: gp.rating, reviews: gp.reviews })
        updatedArtisanIds.add(bestMatch.art.id)
        matchedGoogleIds.add(gp.id)
        ratingByName++
        deptNameMatches++
      }
    }

    if (deptPhoneMatches + deptNameMatches > 0 || (di + 1) % 10 === 0) {
      console.log(`  [${dept}] ${artisans.length} artisans | +${deptPhoneMatches} phone +${deptNameMatches} nom (total: ${ratingUpdates.length})`)
    }
  }

  console.log(`\n  Résumé matching:`)
  console.log(`    Par téléphone: ${ratingByPhone}`)
  console.log(`    Par nom:       ${ratingByName}`)
  console.log(`    Total:         ${ratingUpdates.length}`)

  // Upload ratings in batches
  console.log(`\n  Upload ${ratingUpdates.length} ratings...`)
  let ratingsUploaded = 0
  let uploadErrors = 0
  const BATCH = 500

  for (let i = 0; i < ratingUpdates.length; i += BATCH) {
    const batch = ratingUpdates.slice(i, i + BATCH)
    const values = batch.map((u, idx) =>
      `($${idx*3+1}::uuid, $${idx*3+2}::real, $${idx*3+3}::integer)`
    ).join(',')
    const params = batch.flatMap(u => [u.id, u.rating, u.reviews])

    try {
      const res = await pool.query(
        `UPDATE providers AS p
         SET rating_average = v.rating, review_count = v.reviews
         FROM (VALUES ${values}) AS v(id, rating, reviews)
         WHERE p.id = v.id`, params
      )
      ratingsUploaded += res.rowCount || batch.length
    } catch {
      // Fallback one-by-one
      for (const u of batch) {
        try {
          await pool.query(
            'UPDATE providers SET rating_average = $1, review_count = $2 WHERE id = $3',
            [u.rating, u.reviews, u.id]
          )
          ratingsUploaded++
        } catch { uploadErrors++ }
      }
    }
    if (ratingUpdates.length > BATCH) {
      console.log(`    ${Math.min(i + BATCH, ratingUpdates.length)}/${ratingUpdates.length}`)
    }
  }

  console.log(`  ✓ ${ratingsUploaded} ratings uploadés (${uploadErrors} erreurs)`)

  await pool.end()

  const elapsed = Math.round((Date.now() - startTime) / 1000)
  console.log('\n' + '='.repeat(60))
  console.log('  RÉSULTAT FINAL')
  console.log('='.repeat(60))
  console.log(`  Ratings par phone: +${ratingByPhone}`)
  console.log(`  Ratings par nom:   +${ratingByName}`)
  console.log(`  Total uploadés:    +${ratingsUploaded}`)
  console.log(`  Durée:             ${elapsed}s`)
  console.log('='.repeat(60) + '\n')
}

main().then(() => process.exit(0)).catch(e => { console.error('Erreur:', e); process.exit(1) })
