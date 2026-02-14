/**
 * Advanced Phone Matching — Multi-Strategy Engine
 *
 * Strategies:
 *   1. Address matching (CP + street number/name overlap)
 *   2. Reverse matching (provider→PJ, broader token search)
 *   3. City + first distinctive word matching
 *   4. Initials & acronym expansion
 *   5. SIRET API batch lookup (entreprise.data.gouv.fr)
 *
 * Usage: npx tsx scripts/match-advanced.ts
 */
import * as fs from 'fs'
import * as path from 'path'
import { Pool } from 'pg'

const PG_URL = 'postgresql://postgres:BEB6LnGlT6U9bkTe@db.umjmbdbwcsxrvfqktiui.supabase.co:5432/postgres'
const DATA_DIR = path.join(__dirname, '.enrich-data')
const PJ_FILE = path.join(DATA_DIR, 'pj-listings.jsonl')
const RESULTS_FILE = path.join(DATA_DIR, 'matches', 'matches-advanced.jsonl')

// ════════════════════════════
// Types
// ════════════════════════════

interface PJListing {
  pjId: string
  trade: string
  deptCode: string
  name: string
  city?: string
  postalCode?: string
  address?: string
  phone?: string
}

interface Provider {
  id: string
  name: string
  phone: string | null
  cp: string | null
  street: string | null
  dept: string
  city_code: string | null
}

interface MatchResult {
  artisanId: string
  phone: string
  score: number
  strategy: string
  pjName: string
  artisanName: string
}

// ════════════════════════════
// Normalization utilities
// ════════════════════════════

function norm(s: string): string {
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim()
}

function normStreet(s: string): string {
  return norm(s)
    .replace(/\b(rue|avenue|boulevard|impasse|allee|chemin|place|route|passage|square|cours|voie|quai|lotissement|residence|zone|za|zi|zac|bat|batiment|apt|appt|appartement|etage|esc|escalier|porte|bp|cs|cedex)\b/g, '')
    .replace(/\s+/g, ' ').trim()
}

function extractStreetNumber(s: string): string | null {
  const m = norm(s).match(/^(\d+)/)
  return m ? m[1] : null
}

function extractCityFromStreet(street: string): string | null {
  // Provider streets look like "21 AVENUE JEAN JAURES 87230 FLAVIGNAC"
  // Extract city name after postal code
  const m = street.match(/\d{5}\s+(.+)$/i)
  return m ? norm(m[1]) : null
}

function getTokens(s: string): string[] {
  return norm(s).split(' ').filter(w => w.length >= 2)
}

function getDistinctiveTokens(s: string): string[] {
  const common = new Set([
    'sarl', 'sas', 'sasu', 'eurl', 'eirl', 'ei', 'sci', 'snc', 'sa', 'ste',
    'ets', 'entreprise', 'societe', 'etablissement', 'etablissements',
    'monsieur', 'madame', 'mme', 'cabinet', 'agence', 'atelier', 'groupe',
    'plomberie', 'plombier', 'chauffage', 'chauffagiste', 'electricite', 'electricien',
    'peinture', 'peintre', 'menuiserie', 'menuisier', 'maconnerie', 'macon',
    'carrelage', 'carreleur', 'couverture', 'couvreur', 'serrurerie', 'serrurier',
    'isolation', 'renovation', 'batiment', 'travaux', 'construction', 'services',
    'service', 'general', 'generale', 'multi', 'pro', 'plus', 'france',
    'sud', 'nord', 'est', 'ouest', 'habitat', 'depannage', 'confort',
    'climatisation', 'terrassement', 'assainissement', 'toiture', 'facade',
    'energie', 'energies', 'renov', 'deco', 'tech', 'concept',
  ])
  return getTokens(s).filter(t => t.length >= 3 && !common.has(t))
}

function getInitials(s: string): string {
  return getDistinctiveTokens(s).map(t => t[0]).join('')
}

// Dice coefficient for string similarity
function dice(a: string, b: string): number {
  const na = norm(a), nb = norm(b)
  if (na === nb) return 1
  if (na.length < 2 || nb.length < 2) return 0
  const biA = new Set<string>()
  const biB = new Set<string>()
  for (let i = 0; i < na.length - 1; i++) biA.add(na.substring(i, i + 2))
  for (let i = 0; i < nb.length - 1; i++) biB.add(nb.substring(i, i + 2))
  let inter = 0
  for (const b of biA) if (biB.has(b)) inter++
  return (2 * inter) / (biA.size + biB.size)
}

// ════════════════════════════
// Load data
// ════════════════════════════

function loadPJListings(): PJListing[] {
  const lines = fs.readFileSync(PJ_FILE, 'utf-8').trim().split('\n')
  return lines.map(l => JSON.parse(l)).filter((l: PJListing) => l.phone)
}

async function loadPhonelessProviders(pool: Pool): Promise<Provider[]> {
  console.log('  Loading phoneless providers from DB...')
  const providers: Provider[] = []
  let lastId = ''
  const PAGE = 5000

  while (true) {
    const params = lastId
      ? [lastId]
      : []
    const where = lastId
      ? 'WHERE phone IS NULL AND id > $1'
      : 'WHERE phone IS NULL'
    const res = await pool.query(
      `SELECT id, name, address_postal_code as cp, address_street as street, address_department as dept, address_city as city_code
       FROM providers ${where}
       ORDER BY id LIMIT ${PAGE}`,
      params
    )
    if (res.rows.length === 0) break
    for (const r of res.rows) {
      providers.push({
        id: r.id,
        name: r.name,
        phone: null,
        cp: r.cp,
        street: r.street,
        dept: r.dept,
        city_code: r.city_code,
      })
    }
    lastId = res.rows[res.rows.length - 1].id
    if (providers.length % 50000 < PAGE) {
      process.stdout.write(`  ${providers.length.toLocaleString('fr-FR')} loaded...\r`)
    }
    if (res.rows.length < PAGE) break
  }
  console.log(`  ${providers.length.toLocaleString('fr-FR')} phoneless providers loaded`)
  return providers
}

// ════════════════════════════
// STRATEGY 1: Address matching
// ════════════════════════════

function strategyAddress(
  pjByCP: Map<string, PJListing[]>,
  providersByCP: Map<string, Provider[]>,
  assignedPhones: Set<string>,
  assignedProviders: Set<string>,
): MatchResult[] {
  console.log('\n' + '═'.repeat(60))
  console.log('  STRATEGY 1: Address Matching (CP + street overlap)')
  console.log('═'.repeat(60))

  const results: MatchResult[] = []
  let checked = 0, totalCPs = pjByCP.size

  for (const [cp, pjList] of pjByCP) {
    const providers = providersByCP.get(cp) || []
    if (providers.length === 0) continue
    checked++

    for (const pj of pjList) {
      if (!pj.phone || assignedPhones.has(pj.phone) || !pj.address) continue

      const pjStreetNorm = normStreet(pj.address)
      const pjNumber = extractStreetNumber(pj.address)
      if (pjStreetNorm.length < 3) continue

      let bestScore = 0
      let bestProvider: Provider | null = null

      for (const prov of providers) {
        if (prov.phone || assignedProviders.has(prov.id) || !prov.street) continue

        const provStreetNorm = normStreet(prov.street)
        const provNumber = extractStreetNumber(prov.street)

        // Must share street number if both have one
        if (pjNumber && provNumber && pjNumber !== provNumber) continue

        // Street similarity
        const streetSim = dice(pjStreetNorm, provStreetNorm)
        // Name similarity
        const nameSim = dice(pj.name, prov.name)

        // Combined score: address match is strong signal
        let score = 0
        if (pjNumber && provNumber && pjNumber === provNumber && streetSim > 0.3) {
          // Same street number + street similarity → very high confidence
          score = 0.5 + nameSim * 0.3 + streetSim * 0.2
        } else if (streetSim > 0.5) {
          // Street very similar + some name overlap
          score = streetSim * 0.4 + nameSim * 0.6
        }

        if (score > bestScore && score >= 0.35) {
          bestScore = score
          bestProvider = prov
        }
      }

      if (bestProvider) {
        results.push({
          artisanId: bestProvider.id,
          phone: pj.phone,
          score: bestScore,
          strategy: 'address',
          pjName: pj.name,
          artisanName: bestProvider.name,
        })
        assignedPhones.add(pj.phone)
        assignedProviders.add(bestProvider.id)
      }
    }

    if (checked % 500 === 0) {
      process.stdout.write(`  CP ${checked}/${totalCPs} → ${results.length} matches\r`)
    }
  }

  console.log(`  → ${results.length} matches found via address`)
  return results
}

// ════════════════════════════
// STRATEGY 2: Reverse matching (provider → PJ)
// ════════════════════════════

function strategyReverse(
  pjByCP: Map<string, PJListing[]>,
  providers: Provider[],
  assignedPhones: Set<string>,
  assignedProviders: Set<string>,
): MatchResult[] {
  console.log('\n' + '═'.repeat(60))
  console.log('  STRATEGY 2: Reverse Matching (provider→PJ, token search)')
  console.log('═'.repeat(60))

  const results: MatchResult[] = []

  // Build PJ index by CP → normalized tokens
  const pjTokenIndex = new Map<string, Map<string, PJListing[]>>()
  for (const [cp, listings] of pjByCP) {
    const tokenMap = new Map<string, PJListing[]>()
    for (const pj of listings) {
      if (!pj.phone) continue
      for (const tok of getDistinctiveTokens(pj.name)) {
        if (!tokenMap.has(tok)) tokenMap.set(tok, [])
        tokenMap.get(tok)!.push(pj)
      }
    }
    pjTokenIndex.set(cp, tokenMap)
  }

  let checked = 0

  for (const prov of providers) {
    if (prov.phone || assignedProviders.has(prov.id) || !prov.cp) continue
    checked++

    const cpTokens = pjTokenIndex.get(prov.cp)
    if (!cpTokens) continue

    const provTokens = getDistinctiveTokens(prov.name)
    if (provTokens.length === 0) continue

    // Find PJ listings sharing ANY distinctive token at same CP
    const candidateSet = new Set<PJListing>()
    for (const tok of provTokens) {
      const matches = cpTokens.get(tok)
      if (matches) {
        for (const m of matches) candidateSet.add(m)
      }
    }

    let bestScore = 0
    let bestPJ: PJListing | null = null

    for (const pj of candidateSet) {
      if (assignedPhones.has(pj.phone!)) continue
      const score = dice(pj.name, prov.name)
      if (score > bestScore && score >= 0.30) {
        bestScore = score
        bestPJ = pj
      }
    }

    if (bestPJ) {
      results.push({
        artisanId: prov.id,
        phone: bestPJ.phone!,
        score: bestScore,
        strategy: 'reverse_token',
        pjName: bestPJ.name,
        artisanName: prov.name,
      })
      assignedPhones.add(bestPJ.phone!)
      assignedProviders.add(prov.id)
    }

    if (checked % 50000 === 0) {
      process.stdout.write(`  ${checked.toLocaleString('fr-FR')} providers → ${results.length} matches\r`)
    }
  }

  console.log(`  → ${results.length} matches found via reverse token`)
  return results
}

// ════════════════════════════
// STRATEGY 3: City + distinctive word
// ════════════════════════════

function strategyCityWord(
  pjByDept: Map<string, PJListing[]>,
  providersByDept: Map<string, Provider[]>,
  assignedPhones: Set<string>,
  assignedProviders: Set<string>,
): MatchResult[] {
  console.log('\n' + '═'.repeat(60))
  console.log('  STRATEGY 3: City name from address + distinctive word')
  console.log('═'.repeat(60))

  const results: MatchResult[] = []

  for (const [dept, pjList] of pjByDept) {
    const providers = providersByDept.get(dept) || []
    if (providers.length === 0) continue

    // Build provider index by extracted city name
    const provByCity = new Map<string, Provider[]>()
    for (const prov of providers) {
      if (prov.phone || assignedProviders.has(prov.id) || !prov.street) continue
      const city = extractCityFromStreet(prov.street)
      if (!city || city.length < 3) continue
      // Use first word of city as key
      const cityKey = city.split(' ')[0]
      if (!provByCity.has(cityKey)) provByCity.set(cityKey, [])
      provByCity.get(cityKey)!.push(prov)
    }

    for (const pj of pjList) {
      if (!pj.phone || assignedPhones.has(pj.phone) || !pj.city) continue

      const pjCityNorm = norm(pj.city)
      const pjCityKey = pjCityNorm.split(' ')[0]
      if (!pjCityKey || pjCityKey.length < 3) continue

      const cityCandidates = provByCity.get(pjCityKey) || []
      if (cityCandidates.length === 0) continue

      const pjDistinct = getDistinctiveTokens(pj.name)
      if (pjDistinct.length === 0) continue

      let bestScore = 0
      let bestProvider: Provider | null = null

      for (const prov of cityCandidates) {
        if (assignedProviders.has(prov.id)) continue

        const provTokens = getDistinctiveTokens(prov.name)
        // Check if any distinctive token matches
        let tokenOverlap = 0
        for (const pt of pjDistinct) {
          for (const at of provTokens) {
            if (pt === at || (pt.length >= 4 && at.length >= 4 && (pt.includes(at) || at.includes(pt)))) {
              tokenOverlap++
              break
            }
          }
        }

        if (tokenOverlap > 0) {
          const score = dice(pj.name, prov.name)
          if (score > bestScore && score >= 0.25) {
            bestScore = score
            bestProvider = prov
          }
        }
      }

      if (bestProvider) {
        results.push({
          artisanId: bestProvider.id,
          phone: pj.phone,
          score: bestScore,
          strategy: 'city_word',
          pjName: pj.name,
          artisanName: bestProvider.name,
        })
        assignedPhones.add(pj.phone)
        assignedProviders.add(bestProvider.id)
      }
    }
  }

  console.log(`  → ${results.length} matches found via city+word`)
  return results
}

// ════════════════════════════
// STRATEGY 4: Initials matching
// ════════════════════════════

function strategyInitials(
  pjByCP: Map<string, PJListing[]>,
  providersByCP: Map<string, Provider[]>,
  assignedPhones: Set<string>,
  assignedProviders: Set<string>,
): MatchResult[] {
  console.log('\n' + '═'.repeat(60))
  console.log('  STRATEGY 4: Initials & acronym matching')
  console.log('═'.repeat(60))

  const results: MatchResult[] = []

  for (const [cp, pjList] of pjByCP) {
    const providers = providersByCP.get(cp) || []
    if (providers.length === 0) continue

    // Build provider initials index
    const provByInitials = new Map<string, Provider[]>()
    for (const prov of providers) {
      if (prov.phone || assignedProviders.has(prov.id)) continue
      const initials = getInitials(prov.name)
      if (initials.length >= 2) {
        if (!provByInitials.has(initials)) provByInitials.set(initials, [])
        provByInitials.get(initials)!.push(prov)
      }
      // Also try: provider name IS the acronym (e.g., "DSN" → match "Da Silva Nicolas")
      const provNorm = norm(prov.name)
      if (provNorm.length >= 2 && provNorm.length <= 6 && !provNorm.includes(' ')) {
        if (!provByInitials.has(provNorm)) provByInitials.set(provNorm, [])
        provByInitials.get(provNorm)!.push(prov)
      }
    }

    for (const pj of pjList) {
      if (!pj.phone || assignedPhones.has(pj.phone)) continue

      const pjInitials = getInitials(pj.name)
      const pjTokens = getDistinctiveTokens(pj.name)

      // Check if PJ initials match any provider
      if (pjInitials.length >= 2) {
        const candidates = provByInitials.get(pjInitials) || []
        for (const prov of candidates) {
          if (assignedProviders.has(prov.id)) continue
          // Verify with name similarity
          const score = dice(pj.name, prov.name)
          if (score >= 0.15) {
            results.push({
              artisanId: prov.id,
              phone: pj.phone,
              score: Math.max(score, 0.30),
              strategy: 'initials',
              pjName: pj.name,
              artisanName: prov.name,
            })
            assignedPhones.add(pj.phone)
            assignedProviders.add(prov.id)
            break
          }
        }
      }

      // Check if PJ name contains a short token that matches a provider name acronym
      if (!assignedPhones.has(pj.phone!)) {
        for (const tok of pjTokens) {
          if (tok.length >= 2 && tok.length <= 5) {
            const candidates = provByInitials.get(tok) || []
            for (const prov of candidates) {
              if (assignedProviders.has(prov.id)) continue
              const provInitials = getInitials(prov.name)
              if (provInitials === tok || norm(prov.name) === tok) {
                results.push({
                  artisanId: prov.id,
                  phone: pj.phone!,
                  score: 0.35,
                  strategy: 'acronym_expand',
                  pjName: pj.name,
                  artisanName: prov.name,
                })
                assignedPhones.add(pj.phone!)
                assignedProviders.add(prov.id)
                break
              }
            }
            if (assignedPhones.has(pj.phone!)) break
          }
        }
      }
    }
  }

  console.log(`  → ${results.length} matches found via initials/acronyms`)
  return results
}

// ════════════════════════════
// STRATEGY 5: SIRET API lookup
// ════════════════════════════

async function strategySiretApi(
  pool: Pool,
  assignedProviders: Set<string>,
  limit: number = 2000,
): Promise<MatchResult[]> {
  console.log('\n' + '═'.repeat(60))
  console.log(`  STRATEGY 5: SIRET API Lookup (entreprise.data.gouv.fr)`)
  console.log(`  Limit: ${limit} lookups`)
  console.log('═'.repeat(60))

  const results: MatchResult[] = []

  // Get providers with SIRET but no phone, not yet assigned
  const res = await pool.query(`
    SELECT id, name, siret, address_department
    FROM providers
    WHERE phone IS NULL AND siret IS NOT NULL AND LENGTH(siret) = 14
    ORDER BY RANDOM()
    LIMIT $1
  `, [limit * 2])  // extra buffer since some will be assigned

  const providers = res.rows.filter((r: any) => !assignedProviders.has(r.id))
  console.log(`  ${providers.length} candidates with SIRET`)

  let checked = 0, found = 0, errors = 0, rateLimited = 0

  for (const prov of providers.slice(0, limit)) {
    checked++

    try {
      // API: https://entreprise.data.gouv.fr/api/sirene/v3/etablissements/{siret}
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const resp = await fetch(
        `https://recherche-entreprises.api.gouv.fr/search?q=${prov.siret}&mtm_campaign=servicesartisans`,
        { signal: controller.signal }
      )
      clearTimeout(timeout)

      if (resp.status === 429) {
        rateLimited++
        if (rateLimited >= 5) {
          console.log(`  Rate limited after ${checked} requests, stopping`)
          break
        }
        await new Promise(r => setTimeout(r, 5000))
        continue
      }

      if (!resp.ok) {
        errors++
        continue
      }

      const data = await resp.json() as any
      if (data.results && data.results.length > 0) {
        const entreprise = data.results[0]
        // Look for phone in the data
        // The API doesn't directly return phone, but returns other useful data
        // We mainly use this for name verification and enrichment
      }

      // Small delay to avoid rate limiting
      if (checked % 10 === 0) {
        await new Promise(r => setTimeout(r, 200))
      }

    } catch (err: any) {
      errors++
    }

    if (checked % 100 === 0) {
      process.stdout.write(`  ${checked}/${Math.min(providers.length, limit)} — found: ${found}, err: ${errors}\r`)
    }
  }

  console.log(`  → ${results.length} matches found via SIRET API`)
  console.log(`  (Note: API doesn't return phone numbers directly)`)
  return results
}

// ════════════════════════════
// UPLOAD results
// ════════════════════════════

async function uploadResults(pool: Pool, results: MatchResult[]): Promise<void> {
  console.log(`\n  Uploading ${results.length} matches...`)

  // Deduplicate
  const phoneSet = new Set<string>()
  const artisanSet = new Set<string>()
  const deduped: MatchResult[] = []
  for (const r of [...results].sort((a, b) => b.score - a.score)) {
    if (phoneSet.has(r.phone) || artisanSet.has(r.artisanId)) continue
    phoneSet.add(r.phone)
    artisanSet.add(r.artisanId)
    deduped.push(r)
  }
  console.log(`  ${deduped.length} after dedup`)

  let updated = 0, skipped = 0, errors = 0

  for (let i = 0; i < deduped.length; i++) {
    const r = deduped[i]
    try {
      const res = await pool.query(
        'UPDATE providers SET phone = $1 WHERE id = $2 AND phone IS NULL',
        [r.phone, r.artisanId]
      )
      if ((res.rowCount || 0) > 0) updated++
      else skipped++
    } catch (err: any) {
      errors++
      if (errors <= 3) console.log(`    ERR: ${err.message}`)
    }

    if ((i + 1) % 500 === 0 || i === deduped.length - 1) {
      process.stdout.write(`  ${i + 1}/${deduped.length} — ${updated} OK, ${skipped} skip, ${errors} err\r`)
    }
  }

  console.log(`\n  ✓ ${updated} providers updated, ${skipped} skipped, ${errors} errors`)
}

// ════════════════════════════
// MAIN
// ════════════════════════════

async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('  ADVANCED PHONE MATCHING — Multi-Strategy Engine')
  console.log('='.repeat(60))

  // Connect to DB
  const pool = new Pool({
    connectionString: PG_URL,
    ssl: { rejectUnauthorized: false },
    max: 3,
  })
  await pool.query('SET statement_timeout = 0')

  // Load data
  console.log('\n[1] Loading PJ listings...')
  const pjListings = loadPJListings()
  console.log(`  ${pjListings.length.toLocaleString('fr-FR')} PJ listings with phone`)

  console.log('\n[2] Loading phoneless providers...')
  const providers = await loadPhonelessProviders(pool)

  // Build indexes
  console.log('\n[3] Building indexes...')
  const pjByCP = new Map<string, PJListing[]>()
  const pjByDept = new Map<string, PJListing[]>()
  for (const pj of pjListings) {
    if (pj.postalCode) {
      if (!pjByCP.has(pj.postalCode)) pjByCP.set(pj.postalCode, [])
      pjByCP.get(pj.postalCode)!.push(pj)
    }
    if (!pjByDept.has(pj.deptCode)) pjByDept.set(pj.deptCode, [])
    pjByDept.get(pj.deptCode)!.push(pj)
  }

  const providersByCP = new Map<string, Provider[]>()
  const providersByDept = new Map<string, Provider[]>()
  for (const p of providers) {
    if (p.cp) {
      if (!providersByCP.has(p.cp)) providersByCP.set(p.cp, [])
      providersByCP.get(p.cp)!.push(p)
    }
    if (!providersByDept.has(p.dept)) providersByDept.set(p.dept, [])
    providersByDept.get(p.dept)!.push(p)
  }

  console.log(`  PJ: ${pjByCP.size} postal codes, ${pjByDept.size} departments`)
  console.log(`  Providers: ${providersByCP.size} postal codes, ${providersByDept.size} departments`)

  // Track assignments
  const assignedPhones = new Set<string>()
  const assignedProviders = new Set<string>()
  const allResults: MatchResult[] = []

  // Pre-populate with existing phones from PJ that are already assigned
  // (Handled by the WHERE phone IS NULL in the upload query)

  // Run strategies
  const t0 = Date.now()

  const r1 = strategyAddress(pjByCP, providersByCP, assignedPhones, assignedProviders)
  allResults.push(...r1)

  const r2 = strategyReverse(pjByCP, providers, assignedPhones, assignedProviders)
  allResults.push(...r2)

  const r3 = strategyCityWord(pjByDept, providersByDept, assignedPhones, assignedProviders)
  allResults.push(...r3)

  const r4 = strategyInitials(pjByCP, providersByCP, assignedPhones, assignedProviders)
  allResults.push(...r4)

  // Skip SIRET API — it doesn't return phone numbers
  // const r5 = await strategySiretApi(pool, assignedProviders, 500)
  // allResults.push(...r5)

  const elapsed = ((Date.now() - t0) / 1000).toFixed(0)

  // Save results
  if (!fs.existsSync(path.dirname(RESULTS_FILE))) {
    fs.mkdirSync(path.dirname(RESULTS_FILE), { recursive: true })
  }
  if (allResults.length > 0) {
    fs.writeFileSync(RESULTS_FILE, allResults.map(r => JSON.stringify(r)).join('\n'))
    console.log(`\n  Results saved → ${path.basename(RESULTS_FILE)}`)
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('  SUMMARY')
  console.log('='.repeat(60))
  console.log(`  Strategy 1 (address):     ${r1.length}`)
  console.log(`  Strategy 2 (reverse):     ${r2.length}`)
  console.log(`  Strategy 3 (city+word):   ${r3.length}`)
  console.log(`  Strategy 4 (initials):    ${r4.length}`)
  console.log(`  ──────────────────────────`)
  console.log(`  TOTAL:                    ${allResults.length}`)
  console.log(`  Time:                     ${elapsed}s`)
  console.log('='.repeat(60))

  // Upload
  if (allResults.length > 0) {
    await uploadResults(pool, allResults)
  }

  await pool.end()

  // Final DB count
  const pool2 = new Pool({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } })
  const count = await pool2.query('SELECT COUNT(phone) as ph FROM providers')
  console.log(`\n  Total phones in DB: ${count.rows[0].ph}`)
  await pool2.end()
}

main().catch(err => {
  console.error('FATAL:', err)
  process.exit(1)
})
