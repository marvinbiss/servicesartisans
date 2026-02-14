/**
 * Phase 1 GRATUIT : Ré-matcher les listings PJ existantes — ALGO V3 100% LOCAL
 *
 * V3: Matching 100% en mémoire — zéro requête DB pendant le matching
 *   - Export artisans en cache local (1 fois) → ~743k artisans
 *   - Matching pur JS en mémoire (~95k listings vs ~743k artisans)
 *   - Batch upload des résultats → UPDATE ciblés
 *   - Supporte 20 agents parallèles via --batch N/M
 *
 * Usage:
 *   npx tsx scripts/rematch-pj.ts --export          # Étape 1: cache artisans localement
 *   npx tsx scripts/rematch-pj.ts --batch 1/20      # Étape 2: matcher batch 1 sur 20
 *   npx tsx scripts/rematch-pj.ts --upload           # Étape 3: upload résultats vers Supabase
 *   npx tsx scripts/rematch-pj.ts                    # Tout-en-un: export + match + upload
 *   npx tsx scripts/rematch-pj.ts --dept 13          # Un seul département
 */

import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const MATCH_THRESHOLD = 0.35
const LISTINGS_FILE = path.join(__dirname, '.enrich-data', 'pj-listings.jsonl')
const ARTISANS_CACHE = path.join(__dirname, '.enrich-data', 'artisans-cache.jsonl')
const MATCHES_DIR = path.join(__dirname, '.enrich-data', 'matches')

// ── Common trade/business words (not distinctive) ──
const COMMON_WORDS = new Set([
  'plomberie', 'plombier', 'chauffage', 'chauffagiste', 'electricite', 'electricien',
  'peinture', 'peintre', 'menuiserie', 'menuisier', 'maconnerie', 'macon',
  'carrelage', 'carreleur', 'couverture', 'couvreur', 'serrurerie', 'serrurier',
  'isolation', 'platrier', 'platrerie', 'renovation', 'batiment', 'travaux',
  'construction', 'entreprise', 'artisan', 'services', 'service', 'general',
  'generale', 'multi', 'pro', 'plus', 'france', 'sud', 'nord', 'est', 'ouest',
  'climatisation', 'terrassement', 'demolition', 'assainissement', 'domotique',
  'ramonage', 'etancheite', 'depannage', 'paysagiste', 'paysagistes', 'vitrier',
  'portail', 'portails', 'store', 'stores', 'parquet', 'parquets', 'salle', 'bain',
  'chauffagistes', 'electriciens', 'menuisiers', 'macons', 'peintres', 'carreleurs',
  'couvreurs', 'serruriers', 'plombiers', 'charpentier', 'charpentiers', 'charpente',
  'toiture', 'facade', 'facades', 'ravalement', 'enduit', 'cloture', 'clotures',
  'amenagement', 'interieur', 'exterieur', 'habitat', 'logement', 'maison',
  'appartement', 'immeuble', 'copropriete', 'neuf', 'ancien', 'moderne',
  'techni', 'technique', 'techniques', 'professionnel', 'professionnels',
  'groupe', 'agence', 'cabinet', 'atelier', 'ateliers', 'bureau', 'bureaux',
  'ile', 'provence', 'alpes', 'cote', 'azur', 'bretagne', 'normandie',
  'aquitaine', 'occitanie', 'auvergne', 'rhone', 'loire', 'region',
])

// ── Neighboring departments ──
const DEPT_NEIGHBORS: Record<string, string[]> = {
  '01': ['38','39','69','71','73','74'], '02': ['08','51','59','60','77','80'],
  '03': ['18','23','42','58','63','71'], '04': ['05','06','26','83','84'],
  '05': ['04','26','38','73'], '06': ['04','83'],
  '07': ['26','30','42','43','48','84'], '08': ['02','51','55'],
  '09': ['11','31','66'], '10': ['21','51','52','77','89'],
  '11': ['09','31','34','66','81'], '12': ['15','30','34','46','48','81','82'],
  '13': ['30','83','84'], '14': ['27','50','61','76'],
  '15': ['03','12','19','43','46','48','63'], '16': ['17','24','79','86','87'],
  '17': ['16','24','33','79','85'], '18': ['03','23','36','41','45','58'],
  '19': ['15','23','24','46','63','87'], '2A': ['2B'], '2B': ['2A'],
  '21': ['10','39','52','58','70','71','89'], '22': ['29','35','56'],
  '23': ['03','18','19','36','63','87'], '24': ['16','17','19','33','46','47','87'],
  '25': ['39','70','90'], '26': ['04','05','07','38','84'],
  '27': ['14','28','60','76','78','95'], '28': ['27','41','45','72','78','91'],
  '29': ['22','56'], '30': ['07','12','13','34','48','84'],
  '31': ['09','11','32','65','81','82'], '32': ['31','40','47','64','65','82'],
  '33': ['17','24','40','47'], '34': ['11','12','30','81'],
  '35': ['22','44','49','50','53','56'], '36': ['18','23','37','41','86','87'],
  '37': ['36','41','49','72','86'], '38': ['01','05','26','42','69','73'],
  '39': ['01','21','25','70','71'], '40': ['32','33','47','64'],
  '41': ['18','28','36','37','45','72'], '42': ['03','07','38','43','63','69'],
  '43': ['07','15','42','48','63'], '44': ['35','49','56','85'],
  '45': ['18','28','41','58','77','89','91'], '46': ['12','15','19','24','47','82'],
  '47': ['24','32','33','40','46','82'], '48': ['07','12','15','30','43'],
  '49': ['35','37','44','53','72','79','85','86'], '50': ['14','35','53','61'],
  '51': ['02','08','10','52','55','77'], '52': ['10','21','51','55','70','88'],
  '53': ['35','44','49','50','61','72'], '54': ['55','57','67','88'],
  '55': ['08','51','52','54','57','88'], '56': ['22','29','35','44'],
  '57': ['54','55','67','88'], '58': ['03','18','21','45','71','89'],
  '59': ['02','62','80'], '60': ['02','27','76','77','78','80','95'],
  '61': ['14','27','28','35','50','53','72'], '62': ['59','80'],
  '63': ['03','15','19','23','42','43'], '64': ['32','40','65'],
  '65': ['31','32','64'], '66': ['09','11'],
  '67': ['54','57','68','88'], '68': ['67','88','90'],
  '69': ['01','38','42','71'], '70': ['21','25','39','52','88','90'],
  '71': ['01','03','21','39','42','58','69'], '72': ['28','37','41','49','53','61'],
  '73': ['01','05','38','74'], '74': ['01','73'],
  '75': ['92','93','94'], '76': ['14','27','60','80'],
  '77': ['02','10','45','51','60','89','91','93','94'],
  '78': ['27','28','60','91','92','95'],
  '79': ['16','17','49','85','86'], '80': ['02','59','60','62','76'],
  '81': ['11','12','31','34','82'], '82': ['12','31','32','46','47','81'],
  '83': ['04','06','13','84'], '84': ['04','07','13','26','30','83'],
  '85': ['17','44','49','79'], '86': ['16','36','37','49','79','87'],
  '87': ['16','19','23','24','36','86'], '88': ['52','54','55','57','67','68','70'],
  '89': ['10','21','45','58','77'], '90': ['25','68','70'],
  '91': ['28','45','77','78','92','94'],
  '92': ['75','78','91','93','94','95'],
  '93': ['75','77','92','94','95'],
  '94': ['75','77','91','92','93'],
  '95': ['27','60','78','92','93'],
}

// ── Interfaces ──
interface PJListing {
  pjId: string
  trade: string
  deptCode: string
  name: string
  city?: string
  postalCode?: string
  phone?: string
  website?: string
}

interface MemArtisan {
  id: string
  name: string
  norm: string
  phone: string | null
  cp: string | null
  city: string | null
  cityNorm: string | null
  dept: string
}

interface MatchResult {
  artisanId: string
  phone: string
  score: number
  strategy: string
  pjName: string
  artisanName: string
}

// ── Name normalization ──
function normalizeName(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(sarl|sas|sa|eurl|sasu|eirl|ei|sci|snc|scop|scp|selarl|auto[- ]?entrepreneur|micro[- ]?entreprise|ets|etablissements?|entreprise|societe|ste|monsieur|madame|m\.|mme|mr|dr|cabinet|agence|atelier|groupe|holding)\b/gi, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim()
}

// ── Levenshtein edit distance ──
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
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )
    }
  }
  return matrix[b.length][a.length]
}

// ── Fuzzy token match (Levenshtein) ──
function fuzzyTokenMatch(a: string, b: string): number {
  if (a === b) return 1.0
  if (a.length < 3 || b.length < 3) return 0
  const maxLen = Math.max(a.length, b.length)
  const maxDist = maxLen >= 7 ? 2 : 1
  const dist = levenshtein(a, b)
  if (dist <= maxDist) return 0.8
  return 0
}

// ── Name similarity scoring ──
function nameSimilarity(a: string, b: string): number {
  const tokA = a.split(' ').filter(t => t.length > 1)
  const tokB = b.split(' ').filter(t => t.length > 1)
  const tA = new Set(tokA)
  const tB = new Set(tokB)
  if (tA.size === 0 || tB.size === 0) return 0

  let overlap = 0
  const matchedB = new Set<string>()

  // Pass 1: Exact token match
  tA.forEach(t => {
    if (tB.has(t)) { overlap++; matchedB.add(t) }
  })

  // Pass 2: Fuzzy token match (Levenshtein)
  const unmatchedA = tokA.filter(t => !tB.has(t))
  const unmatchedB = tokB.filter(t => !tA.has(t) && !matchedB.has(t))
  for (const wa of unmatchedA) {
    let bestFuzzy = 0
    let bestIdx = -1
    for (let i = 0; i < unmatchedB.length; i++) {
      if (matchedB.has(unmatchedB[i])) continue
      const f = fuzzyTokenMatch(wa, unmatchedB[i])
      if (f > bestFuzzy) { bestFuzzy = f; bestIdx = i }
    }
    if (bestFuzzy > 0 && bestIdx >= 0) {
      overlap += bestFuzzy
      matchedB.add(unmatchedB[bestIdx])
    }
  }

  // Pass 3: Substring match for remaining
  if (overlap === 0) {
    tA.forEach(tA_word => {
      tB.forEach(tB_word => {
        if (tA_word !== tB_word && tA_word.length >= 4 && tB_word.length >= 4) {
          if (tB_word.includes(tA_word) || tA_word.includes(tB_word)) overlap += 0.5
        }
      })
    })
  }

  const union = new Set([...tA, ...tB])
  return overlap / union.size
}

// ── Acronym match ──
function acronymMatch(normalized: string, candidateNorm: string): boolean {
  const pjWords = normalized.split(' ').filter(w => w.length >= 2 && w.length <= 5)
  const candWords = candidateNorm.split(' ').filter(w => w.length >= 2)
  if (candWords.length < 2) return false

  for (const pw of pjWords) {
    const acronym = candWords.map(w => w[0]).join('')
    if (acronym === pw) return true
    const pjAllWords = normalized.split(' ').filter(w => w.length >= 2)
    const pjAcronym = pjAllWords.map(w => w[0]).join('')
    const candShortWords = candidateNorm.split(' ').filter(w => w.length >= 2 && w.length <= 5)
    for (const cw of candShortWords) {
      if (pjAcronym === cw) return true
    }
  }
  return false
}

// ── Get distinctive words ──
function getDistinctiveWords(normalized: string): string[] {
  return normalized.split(' ')
    .filter(w => w.length >= 3 && !COMMON_WORDS.has(w))
    .sort((a, b) => b.length - a.length)
}

// ── Generate search strategies ──
function getSearchTerms(normalized: string): string[] {
  const terms: string[] = []
  const words = normalized.split(' ').filter(w => w.length >= 2)
  const distinctive = getDistinctiveWords(normalized)

  // Strategy 1: First 2 words
  if (words.length >= 2) terms.push(words.slice(0, 2).join(' '))
  // Strategy 2: Most distinctive word
  if (distinctive.length > 0) terms.push(distinctive[0])
  // Strategy 3: Second distinctive word
  if (distinctive.length > 1) terms.push(distinctive[1])
  // Strategy 4: Full name if short
  if (words.length <= 3 && words.length > 0) terms.push(words.join(' '))
  // Strategy 5: Last 2 words
  if (words.length >= 3) terms.push(words.slice(-2).join(' '))
  // Strategy 6: Pairs of distinctive words
  if (distinctive.length >= 2) {
    for (let i = 0; i < Math.min(distinctive.length, 3); i++) {
      for (let j = i + 1; j < Math.min(distinctive.length, 4); j++) {
        terms.push(`${distinctive[i]} ${distinctive[j]}`)
      }
    }
  }

  return [...new Set(terms)].filter(t => t.length >= 2)
}

// ════════════════════════════════════════════════════════════
// EXPORT: Download all artisans from Supabase to local cache
// ════════════════════════════════════════════════════════════
async function fetchSupabase(params: string): Promise<any[]> {
  const url = `${SUPABASE_URL}/rest/v1/providers?${params}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 120000) // 120s timeout
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      signal: controller.signal
    })
    clearTimeout(timeout)
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
    return await res.json()
  } catch (e: any) {
    clearTimeout(timeout)
    throw e
  }
}

async function exportArtisans(): Promise<void> {
  console.log('\n' + '='.repeat(60))
  console.log('  EXPORT ARTISANS → CACHE LOCAL')
  console.log('='.repeat(60))
  console.log('  Pagination par ID (PK) — pas de filtre pour éviter les timeouts')

  let totalCount = 0
  let activeCount = 0
  const lines: string[] = []
  let lastId = ''
  let retries = 0
  const PAGE_SIZE = 500

  while (true) {
    // Only filter by id > lastId, no other filters — uses PK index, always fast
    const params = new URLSearchParams({
      'select': 'id,name,phone,address_postal_code,address_city,address_department,is_active',
      'order': 'id.asc',
      'limit': String(PAGE_SIZE)
    })
    if (lastId) params.set('id', `gt.${lastId}`)

    let data: any[]
    try {
      data = await fetchSupabase(params.toString())
    } catch (e: any) {
      retries++
      if (retries > 15) {
        console.log(`  Abandon après 15 erreurs consécutives à ${totalCount} lignes`)
        break
      }
      console.log(`  Retry ${retries} à ${totalCount} (${e.message?.substring(0, 60)})`)
      await new Promise(r => setTimeout(r, 3000 + retries * 2000))
      continue
    }
    if (!data || data.length === 0) break
    retries = 0

    for (const a of data) {
      totalCount++
      // Filter is_active in JS instead of SQL
      if (!a.is_active) continue
      activeCount++
      lines.push(JSON.stringify({
        id: a.id,
        name: a.name,
        phone: a.phone,
        cp: a.address_postal_code,
        city: a.address_city,
        dept: a.address_department
      }))
    }

    lastId = data[data.length - 1].id
    if (totalCount % 10000 < PAGE_SIZE) {
      console.log(`  ${totalCount.toLocaleString('fr-FR')} lus, ${activeCount.toLocaleString('fr-FR')} actifs`)
    }
    if (data.length < PAGE_SIZE) break
  }

  fs.writeFileSync(ARTISANS_CACHE, lines.join('\n'))
  console.log(`\n  ✓ ${activeCount.toLocaleString('fr-FR')} artisans actifs exportés (${totalCount.toLocaleString('fr-FR')} total)`)
  console.log(`  → artisans-cache.jsonl`)
  console.log('='.repeat(60) + '\n')
}

// ════════════════════════════════════════════════════════════
// Load artisans from local cache into memory
// ════════════════════════════════════════════════════════════
function loadArtisansFromCache(): MemArtisan[] {
  if (!fs.existsSync(ARTISANS_CACHE)) {
    throw new Error(`Cache introuvable: ${ARTISANS_CACHE}\nExécutez d'abord: npx tsx scripts/rematch-pj.ts --export`)
  }

  console.log('  Chargement depuis cache local...')
  const raw = fs.readFileSync(ARTISANS_CACHE, 'utf-8').trim().split('\n')
  const artisans: MemArtisan[] = new Array(raw.length)

  for (let i = 0; i < raw.length; i++) {
    const a = JSON.parse(raw[i])
    artisans[i] = {
      id: a.id,
      name: a.name,
      norm: normalizeName(a.name),
      phone: a.phone,
      cp: a.cp,
      city: a.city,
      cityNorm: a.city
        ? a.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z\s]/g, ' ').trim()
        : null,
      dept: a.dept
    }
  }

  console.log(`  ${artisans.length.toLocaleString('fr-FR')} artisans chargés en mémoire`)
  return artisans
}

// ════════════════════════════════════════════════════════════
// MATCH: Pure local matching — zero DB queries
// ════════════════════════════════════════════════════════════
function matchLocal(allArtisans: MemArtisan[], listings: PJListing[]): MatchResult[] {
  // Build department index
  const byDept = new Map<string, MemArtisan[]>()
  const byCP = new Map<string, MemArtisan[]>()

  for (const a of allArtisans) {
    if (!byDept.has(a.dept)) byDept.set(a.dept, [])
    byDept.get(a.dept)!.push(a)
    if (a.cp) {
      if (!byCP.has(a.cp)) byCP.set(a.cp, [])
      byCP.get(a.cp)!.push(a)
    }
  }

  // Track dedup
  const assignedPhones = new Set<string>()
  const assignedArtisans = new Set<string>()

  const results: MatchResult[] = []
  let processed = 0
  let matched = 0
  let alreadyHad = 0
  let phoneDedup = 0
  const byStrategy: Record<string, number> = {}
  const startTime = Date.now()

  // ── In-memory search: artisans whose normalized name contains the term ──
  function searchByName(artisans: MemArtisan[], term: string, limit = 100): MemArtisan[] {
    const matches: MemArtisan[] = []
    for (const a of artisans) {
      if (a.norm.includes(term)) {
        matches.push(a)
        if (matches.length >= limit) break
      }
    }
    return matches
  }

  // ── Try match in a department's artisans (in-memory) ──
  function tryMatch(
    listing: PJListing,
    normalizedPJ: string,
    deptArtisans: MemArtisan[],
    strategyLabel: string,
    searchTerms: string[]
  ): { type: 'new' | 'already' | 'none'; result?: MatchResult } {
    for (let si = 0; si < searchTerms.length; si++) {
      const candidates = searchByName(deptArtisans, searchTerms[si])
      if (candidates.length === 0) continue

      let bestMatch: { artisan: MemArtisan; score: number } | null = null
      for (const c of candidates) {
        if (assignedArtisans.has(c.id)) continue

        let score = nameSimilarity(normalizedPJ, c.norm)

        // Postal code bonus
        if (listing.postalCode && c.cp === listing.postalCode) {
          score = Math.min(1, score + 0.15)
        }
        // Acronym bonus
        if (score < MATCH_THRESHOLD && acronymMatch(normalizedPJ, c.norm)) {
          score = Math.max(score, MATCH_THRESHOLD)
        }

        if (score >= MATCH_THRESHOLD && (!bestMatch || score > bestMatch.score)) {
          bestMatch = { artisan: c, score }
        }
      }

      if (bestMatch) {
        if (bestMatch.artisan.phone) {
          return { type: 'already' }
        }
        if (listing.phone && assignedPhones.has(listing.phone)) {
          phoneDedup++
          return { type: 'already' }
        }
        const key = `${strategyLabel}_s${si + 1}`
        return {
          type: 'new',
          result: {
            artisanId: bestMatch.artisan.id,
            phone: listing.phone!,
            score: bestMatch.score,
            strategy: key,
            pjName: listing.name,
            artisanName: bestMatch.artisan.name
          }
        }
      }
    }
    return { type: 'none' }
  }

  // ── Process listings by department ──
  const listingsByDept: Record<string, PJListing[]> = {}
  for (const l of listings) {
    if (!listingsByDept[l.deptCode]) listingsByDept[l.deptCode] = []
    listingsByDept[l.deptCode].push(l)
  }

  for (const [deptCode, deptListings] of Object.entries(listingsByDept).sort()) {
    const deptArtisans = byDept.get(deptCode) || []
    let deptMatches = 0
    let deptAlready = 0

    for (const listing of deptListings) {
      processed++

      const normalizedPJ = normalizeName(listing.name)
      if (normalizedPJ.length < 2) continue

      // Phone dedup
      if (listing.phone && assignedPhones.has(listing.phone)) {
        phoneDedup++
        continue
      }

      const searchTerms = getSearchTerms(normalizedPJ)
      let found = false

      // === Phase A: Same department (strategies 1-6) ===
      const resultA = tryMatch(listing, normalizedPJ, deptArtisans, 'dept', searchTerms)
      if (resultA.type === 'new' && resultA.result) {
        results.push(resultA.result)
        assignedPhones.add(listing.phone!)
        assignedArtisans.add(resultA.result.artisanId)
        deptMatches++; matched++
        byStrategy[resultA.result.strategy] = (byStrategy[resultA.result.strategy] || 0) + 1
        found = true
      } else if (resultA.type === 'already') {
        deptAlready++; alreadyHad++; found = true
      }

      // === Phase B: Postal code + relaxed threshold 0.25 ===
      if (!found && listing.postalCode) {
        const cpArtisans = byCP.get(listing.postalCode) || []
        let bestMatch: { artisan: MemArtisan; score: number } | null = null

        for (const c of cpArtisans) {
          if (c.phone || assignedArtisans.has(c.id)) continue
          const score = nameSimilarity(normalizedPJ, c.norm)
          if (score >= 0.25 && (!bestMatch || score > bestMatch.score)) {
            bestMatch = { artisan: c, score }
          }
        }

        if (bestMatch && listing.phone && !assignedPhones.has(listing.phone)) {
          results.push({
            artisanId: bestMatch.artisan.id,
            phone: listing.phone,
            score: bestMatch.score,
            strategy: 'cp_relaxed',
            pjName: listing.name,
            artisanName: bestMatch.artisan.name
          })
          assignedPhones.add(listing.phone)
          assignedArtisans.add(bestMatch.artisan.id)
          deptMatches++; matched++
          byStrategy['cp_relaxed'] = (byStrategy['cp_relaxed'] || 0) + 1
          found = true
        }
      }

      // === Phase C: City name search ===
      if (!found && listing.city) {
        const cityNorm = listing.city.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z\s]/g, ' ').trim()
        const cityWords = cityNorm.split(' ').filter(w => w.length >= 3)

        if (cityWords.length > 0) {
          const cityKey = cityWords[0]
          const cityCandidates: MemArtisan[] = []
          for (const a of deptArtisans) {
            if (a.phone || assignedArtisans.has(a.id)) continue
            if (a.cityNorm && a.cityNorm.includes(cityKey)) {
              cityCandidates.push(a)
              if (cityCandidates.length >= 200) break
            }
          }

          let bestMatch: { artisan: MemArtisan; score: number } | null = null
          for (const c of cityCandidates) {
            const score = nameSimilarity(normalizedPJ, c.norm)
            if (score >= 0.3 && (!bestMatch || score > bestMatch.score)) {
              bestMatch = { artisan: c, score }
            }
          }

          if (bestMatch && listing.phone && !assignedPhones.has(listing.phone)) {
            results.push({
              artisanId: bestMatch.artisan.id,
              phone: listing.phone,
              score: bestMatch.score,
              strategy: 'city_search',
              pjName: listing.name,
              artisanName: bestMatch.artisan.name
            })
            assignedPhones.add(listing.phone)
            assignedArtisans.add(bestMatch.artisan.id)
            deptMatches++; matched++
            byStrategy['city_search'] = (byStrategy['city_search'] || 0) + 1
            found = true
          }
        }
      }

      // === Phase D: Neighboring departments ===
      if (!found) {
        const neighbors = DEPT_NEIGHBORS[deptCode] || []
        for (const neighborDept of neighbors.slice(0, 3)) {
          const neighborArtisans = byDept.get(neighborDept) || []
          const resultD = tryMatch(listing, normalizedPJ, neighborArtisans, 'neighbor', searchTerms.slice(0, 2))
          if (resultD.type === 'new' && resultD.result) {
            results.push(resultD.result)
            assignedPhones.add(listing.phone!)
            assignedArtisans.add(resultD.result.artisanId)
            deptMatches++; matched++
            byStrategy[resultD.result.strategy] = (byStrategy[resultD.result.strategy] || 0) + 1
            found = true; break
          } else if (resultD.type === 'already') {
            deptAlready++; alreadyHad++; found = true; break
          }
        }
      }

      // Progress
      if (processed % 500 === 0) {
        const elapsed = Date.now() - startTime
        const rate = Math.round(processed / (elapsed / 3600000))
        process.stdout.write(
          `   ${processed.toLocaleString('fr-FR')}/${listings.length.toLocaleString('fr-FR')} | ` +
          `+${matched.toLocaleString('fr-FR')} nouveaux | ` +
          `${alreadyHad.toLocaleString('fr-FR')} déjà | ` +
          `${phoneDedup} dedup | ` +
          `${rate.toLocaleString('fr-FR')}/h    \r`
        )
      }
    }

    console.log(
      `   ${deptCode.padEnd(3)} | ${deptListings.length.toString().padStart(5)} listings → ` +
      `+${deptMatches} nouveaux, ${deptAlready} déjà    `
    )
  }

  // Summary
  const elapsed = Date.now() - startTime
  console.log('\n' + '='.repeat(60))
  console.log('  RÉSUMÉ RE-MATCHING V3 (100% LOCAL)')
  console.log('='.repeat(60))
  console.log(`  Durée:              ${Math.round(elapsed / 1000)}s`)
  console.log(`  Listings analysées: ${processed.toLocaleString('fr-FR')}`)
  console.log(`  Nouveaux matches:   +${matched.toLocaleString('fr-FR')}`)
  console.log(`  Déjà un tél:        ${alreadyHad.toLocaleString('fr-FR')}`)
  console.log(`  Phone dedup:        ${phoneDedup}`)
  console.log(`  Par stratégie:`)
  for (const [s, count] of Object.entries(byStrategy).sort()) {
    console.log(`    └ ${s}: +${count}`)
  }
  console.log('='.repeat(60) + '\n')

  return results
}

// ════════════════════════════════════════════════════════════
// UPLOAD: Batch upload match results to Supabase
// ════════════════════════════════════════════════════════════
async function uploadResults(results: MatchResult[]): Promise<void> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  // Deduplicate: best score wins — one phone per artisan, one artisan per phone
  const phoneToResult = new Map<string, MatchResult>()
  const artisanToResult = new Map<string, MatchResult>()

  const sorted = [...results].sort((a, b) => b.score - a.score)
  for (const r of sorted) {
    if (phoneToResult.has(r.phone)) continue
    if (artisanToResult.has(r.artisanId)) continue
    phoneToResult.set(r.phone, r)
    artisanToResult.set(r.artisanId, r)
  }

  const deduped = [...artisanToResult.values()]
  console.log(`\n  Upload: ${deduped.length} matches (${results.length - deduped.length} doublons retirés)`)

  let uploaded = 0
  let errors = 0
  let skipped = 0

  for (const r of deduped) {
    const { error, count } = await supabase
      .from('providers')
      .update({ phone: r.phone })
      .eq('id', r.artisanId)
      .is('phone', null)

    if (error) {
      errors++
      if (errors <= 3) console.error(`    Erreur: ${error.message}`)
    } else {
      uploaded++
    }

    if ((uploaded + errors) % 200 === 0) {
      process.stdout.write(`  ${uploaded + errors}/${deduped.length} traités (${uploaded} OK, ${errors} err)...\r`)
    }
  }

  console.log(`\n  ✓ ${uploaded} mis à jour, ${errors} erreurs, ${skipped} déjà avec tél`)
}

// ════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════
async function main() {
  const args = process.argv.slice(2)

  // Mode: --export
  if (args.includes('--export')) {
    await exportArtisans()
    return
  }

  // Mode: --upload (from saved match files)
  if (args.includes('--upload')) {
    if (!fs.existsSync(MATCHES_DIR)) {
      console.log('Aucun fichier de résultats trouvé dans', MATCHES_DIR)
      return
    }
    const matchFiles = fs.readdirSync(MATCHES_DIR).filter(f => f.endsWith('.jsonl'))
    if (matchFiles.length === 0) {
      console.log('Aucun fichier .jsonl trouvé dans', MATCHES_DIR)
      return
    }
    const allResults: MatchResult[] = []
    for (const f of matchFiles) {
      const content = fs.readFileSync(path.join(MATCHES_DIR, f), 'utf-8').trim()
      if (content) {
        for (const line of content.split('\n')) {
          allResults.push(JSON.parse(line))
        }
      }
    }
    console.log(`  ${allResults.length} matches chargés depuis ${matchFiles.length} fichiers`)
    await uploadResults(allResults)
    return
  }

  // Mode: match (default)
  const deptFilter = args.includes('--dept') ? args[args.indexOf('--dept') + 1] : undefined
  const batchArg = args.includes('--batch') ? args[args.indexOf('--batch') + 1] : undefined

  console.log('\n' + '='.repeat(60))
  console.log('  RE-MATCHING PJ LISTINGS — V3 100% LOCAL')
  console.log('='.repeat(60))
  console.log(`  Seuil: ${MATCH_THRESHOLD}`)
  console.log(`  Stratégies: multi-mots + distinctifs + CP + acronymes + voisins`)
  console.log()

  // Load artisans from cache
  const allArtisans = loadArtisansFromCache()

  // Load PJ listings
  const rawLines = fs.readFileSync(LISTINGS_FILE, 'utf-8').trim().split('\n')
  let listings: PJListing[] = rawLines.map(l => JSON.parse(l)).filter((l: PJListing) => l.phone)
  console.log(`  Total listings avec phone: ${listings.length}`)

  // Filter
  if (deptFilter) {
    listings = listings.filter(l => l.deptCode === deptFilter)
    console.log(`  Filtrées pour dept ${deptFilter}: ${listings.length}`)
  } else if (batchArg) {
    const [batchNum, totalBatches] = batchArg.split('/').map(Number)
    const allDepts = [...new Set(listings.map(l => l.deptCode))].sort()
    const batchSize = Math.ceil(allDepts.length / totalBatches)
    const start = (batchNum - 1) * batchSize
    const batchDepts = allDepts.slice(start, start + batchSize)
    listings = listings.filter(l => batchDepts.includes(l.deptCode))
    console.log(`  Batch ${batchNum}/${totalBatches}: depts [${batchDepts[0]}..${batchDepts[batchDepts.length - 1]}] (${listings.length} listings)`)
  }

  console.log()

  // Match locally
  const results = matchLocal(allArtisans, listings)

  // Save results
  if (!fs.existsSync(MATCHES_DIR)) fs.mkdirSync(MATCHES_DIR, { recursive: true })
  const batchLabel = deptFilter || (batchArg ? batchArg.replace('/', '-') : 'full')
  const outFile = path.join(MATCHES_DIR, `matches-${batchLabel}.jsonl`)
  if (results.length > 0) {
    fs.writeFileSync(outFile, results.map(r => JSON.stringify(r)).join('\n'))
    console.log(`  Résultats sauvegardés → matches-${batchLabel}.jsonl`)
  }

  // Auto-upload if not batch mode
  if (!batchArg && results.length > 0) {
    await uploadResults(results)
  } else if (batchArg) {
    console.log(`  Mode batch — lancez --upload après tous les batchs pour uploader`)
  }
}

main()
  .then(() => process.exit(0))
  .catch(e => { console.error('Erreur:', e); process.exit(1) })
