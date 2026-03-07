/**
 * Audit Qualité des Numéros de Téléphone
 *
 * Analyse la fiabilité des numéros en base en recroisant avec les données
 * brutes Google Maps et en détectant les anomalies.
 *
 * Vérifications :
 *   1. Doublons : même numéro sur plusieurs artisans
 *   2. Numéros fictifs restants (seeds)
 *   3. Cross-check GM : quand un numéro GM existe en base, est-il sur le bon artisan ?
 *   4. Numéros suspects : format invalide, surtaxés, etc.
 *   5. Providers avec un numéro assigné mais nom très différent de la source GM
 *
 * Usage :
 *   npx tsx scripts/audit-phone-quality.ts
 *   npx tsx scripts/audit-phone-quality.ts --dept 13     # Un seul département
 *   npx tsx scripts/audit-phone-quality.ts --verbose     # Détails complets
 */

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

const SUPABASE_URL = 'https://umjmbdbwcsxrvfqktiui.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtam1iZGJ3Y3N4cnZmcWt0aXVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTY2NjQ1OCwiZXhwIjoyMDg1MjQyNDU4fQ.6hXdR5jfhCl1AA5052k3YrBmI-UMhu36mxV2IPvYxjc'

const GM_DATA_DIR = path.join(__dirname, '.gm-data')
const GM_FILES = ['gm-listings.jsonl', 'gm-listings-v2.jsonl', 'gm-listings-cities.jsonl']
const REPORT_DIR = path.join(__dirname, '.enrich-data')
const REPORT_FILE = path.join(REPORT_DIR, 'audit-report.json')

if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true })

const VERBOSE = process.argv.includes('--verbose')
const DEPT_FILTER = process.argv.includes('--dept')
  ? process.argv[process.argv.indexOf('--dept') + 1]
  : undefined

// ═══════════════════════════════════════════
// Supabase REST via curl (bypass Node DNS issues)
// ═══════════════════════════════════════════

function supaGet(queryPath: string, headers?: Record<string, string>): any {
  const extraHeaders = headers
    ? Object.entries(headers).map(([k, v]) => `-H '${k}: ${v}'`).join(' ')
    : ''
  const url = `${SUPABASE_URL}/rest/v1${queryPath}`
  const cmd = `curl -s -H 'apikey: ${SUPABASE_KEY}' -H 'Authorization: Bearer ${SUPABASE_KEY}' ${extraHeaders} '${url}'`
  const out = execSync(cmd, { encoding: 'utf-8', timeout: 60000 })
  return JSON.parse(out)
}

function supaCount(queryPath: string): number {
  const url = `${SUPABASE_URL}/rest/v1${queryPath}`
  const cmd = `curl -s -H 'apikey: ${SUPABASE_KEY}' -H 'Authorization: Bearer ${SUPABASE_KEY}' -H 'Prefer: count=exact' -H 'Range: 0-0' -I '${url}'`
  const out = execSync(cmd, { encoding: 'utf-8', timeout: 60000 })
  const match = out.match(/content-range:\s*\d+-\d+\/(\d+)/i)
  return match ? parseInt(match[1]) : 0
}

function supaFetchAll(queryPath: string): any[] {
  const PAGE = 1000
  const all: any[] = []
  let offset = 0
  while (true) {
    const sep = queryPath.includes('?') ? '&' : '?'
    const data = supaGet(`${queryPath}${sep}offset=${offset}&limit=${PAGE}`)
    if (!data || !Array.isArray(data) || data.length === 0) break
    all.push(...data)
    if (data.length < PAGE) break
    offset += PAGE
    process.stdout.write(`    ${all.length} chargés...\r`)
  }
  return all
}

// ═══════════════════════════════════════════
// Types
// ═══════════════════════════════════════════

interface GMRecord {
  name: string
  phone: string
  trade: string
  deptCode: string
  city?: string
  rating?: number
  reviewCount?: number
  website?: string
}

interface ProviderRow {
  id: string
  name: string
  phone: string | null
  address_department: string
  address_city: string | null
  specialty: string | null
  claimed_at: string | null
  review_count: number | null
}

interface Mismatch {
  providerId: string
  providerName: string
  providerPhone: string
  gmName: string
  gmPhone: string
  department: string
  similarity: number
  issue: string
}

// ═══════════════════════════════════════════
// Fuzzy matching (same algo as import scripts)
// ═══════════════════════════════════════════

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(sarl|sas|sa|eurl|sasu|eirl|ei|ets|entreprise|societe|ste|monsieur|madame|m\.|mme|auto[- ]?entrepreneur|micro[- ]?entreprise)\b/gi, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function bigrams(s: string): Set<string> {
  const set = new Set<string>()
  const norm = normalize(s)
  for (let i = 0; i < norm.length - 1; i++) {
    set.add(norm.substring(i, i + 2))
  }
  return set
}

function diceSimilarity(a: string, b: string): number {
  const ba = bigrams(a)
  const bb = bigrams(b)
  if (ba.size === 0 && bb.size === 0) return 1
  if (ba.size === 0 || bb.size === 0) return 0
  let intersection = 0
  for (const bi of ba) {
    if (bb.has(bi)) intersection++
  }
  return (2 * intersection) / (ba.size + bb.size)
}

function tokenSimilarity(a: string, b: string): number {
  const tA = new Set(normalize(a).split(' ').filter(t => t.length > 1))
  const tB = new Set(normalize(b).split(' ').filter(t => t.length > 1))
  if (tA.size === 0 || tB.size === 0) return 0
  let overlap = 0
  tA.forEach(t => { if (tB.has(t)) overlap++ })
  const union = new Set([...tA, ...tB])
  return overlap / union.size
}

// ═══════════════════════════════════════════
// Load GM data
// ═══════════════════════════════════════════

function loadGMRecords(): Map<string, GMRecord> {
  const phoneMap = new Map<string, GMRecord>()
  let totalLoaded = 0

  for (const file of GM_FILES) {
    const filepath = path.join(GM_DATA_DIR, file)
    if (!fs.existsSync(filepath)) {
      console.log(`  SKIP (introuvable) : ${file}`)
      continue
    }

    const lines = fs.readFileSync(filepath, 'utf-8').trim().split('\n')
    let count = 0
    for (const line of lines) {
      try {
        const obj: GMRecord = JSON.parse(line)
        if (!obj.phone || !obj.name) continue
        if (DEPT_FILTER && obj.deptCode !== DEPT_FILTER) continue
        const existing = phoneMap.get(obj.phone)
        if (!existing || (obj.city && !existing.city) || (obj.website && !existing.website)) {
          phoneMap.set(obj.phone, { ...existing, ...obj })
        }
        count++
      } catch { /* skip bad lines */ }
    }
    console.log(`  ${file}: ${count} enregistrements valides`)
    totalLoaded += count
  }

  console.log(`  → ${phoneMap.size} numéros uniques (${totalLoaded} total)`)
  return phoneMap
}

// ═══════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════

function main() {
  console.log('\n' + '═'.repeat(70))
  console.log('  AUDIT QUALITÉ DES NUMÉROS DE TÉLÉPHONE')
  console.log('═'.repeat(70))
  if (DEPT_FILTER) console.log(`  Filtre département : ${DEPT_FILTER}`)

  // Step 1: Load GM data
  console.log('\n[1] Chargement des données Google Maps brutes...')
  const gmRecords = loadGMRecords()

  // Step 2: Connect to Supabase
  console.log('\n[2] Connexion Supabase (via curl)...')
  // Quick test
  const testData = supaGet('/providers?select=id&limit=1&is_active=eq.true')
  if (!testData || testData.length === 0) {
    console.error('  ERREUR : Impossible de se connecter à Supabase')
    process.exit(1)
  }
  console.log('  → OK')

  // Step 3: Stats de base
  console.log('\n[3] Statistiques actuelles...')

  const deptQ = DEPT_FILTER ? `&address_department=eq.${DEPT_FILTER}` : ''
  const total = supaCount(`/providers?is_active=eq.true${deptQ}`)
  const withPhone = supaCount(`/providers?is_active=eq.true&phone=not.is.null${deptQ}`)
  const withoutPhone = supaCount(`/providers?is_active=eq.true&phone=is.null${deptQ}`)
  const claimedWithPhone = supaCount(`/providers?is_active=eq.true&phone=not.is.null&claimed_at=not.is.null${deptQ}`)

  console.log(`  Total artisans actifs :       ${total.toLocaleString('fr-FR')}`)
  console.log(`  Avec téléphone :              ${withPhone.toLocaleString('fr-FR')} (${total > 0 ? (withPhone / total * 100).toFixed(1) : 0}%)`)
  console.log(`  Sans téléphone :              ${withoutPhone.toLocaleString('fr-FR')}`)
  console.log(`  Revendiqués avec téléphone :  ${claimedWithPhone.toLocaleString('fr-FR')}`)

  // ═══════════════════════════════════════════
  // Fetch all providers with phone
  // ═══════════════════════════════════════════
  console.log('\n[4] Chargement des providers avec phone...')
  const allWithPhone: ProviderRow[] = supaFetchAll(
    `/providers?select=id,name,phone,address_department,address_city,specialty,claimed_at,review_count&is_active=eq.true&phone=not.is.null${deptQ}&order=address_department,name`
  )
  console.log(`  → ${allWithPhone.length} providers chargés`)

  // ═══════════════════════════════════════════
  // CHECK 1: Numéros dupliqués
  // ═══════════════════════════════════════════
  console.log('\n' + '─'.repeat(70))
  console.log('  CHECK 1 : Numéros dupliqués (même numéro sur plusieurs artisans)')
  console.log('─'.repeat(70))

  const phoneGroups = new Map<string, ProviderRow[]>()
  for (const p of allWithPhone) {
    if (!p.phone) continue
    // Normalize phone for grouping
    const normalized = p.phone.replace(/[\s.+\-]/g, '').replace(/^0033/, '0').replace(/^\+33/, '0')
    const arr = phoneGroups.get(normalized) || []
    arr.push(p)
    phoneGroups.set(normalized, arr)
  }

  const duplicates: { phone: string; count: number; names: string[]; ids: string[] }[] = []
  let totalDupArtisans = 0
  for (const [phone, group] of phoneGroups) {
    if (group.length > 1) {
      duplicates.push({
        phone,
        count: group.length,
        names: group.map(p => p.name).sort(),
        ids: group.map(p => p.id),
      })
      totalDupArtisans += group.length - 1
    }
  }
  duplicates.sort((a, b) => b.count - a.count)

  console.log(`  Numéros en double :     ${duplicates.length}`)
  console.log(`  Artisans à nettoyer :   ${totalDupArtisans}`)
  if (duplicates.length > 0 && VERBOSE) {
    for (const dup of duplicates.slice(0, 20)) {
      const names = dup.names.slice(0, 3).join(' | ')
      console.log(`    ${dup.phone} → ${dup.count}x : ${names}${dup.count > 3 ? ' ...' : ''}`)
    }
  }

  // ═══════════════════════════════════════════
  // CHECK 2 : Numéros fictifs restants
  // ═══════════════════════════════════════════
  console.log('\n' + '─'.repeat(70))
  console.log('  CHECK 2 : Numéros fictifs des seeds')
  console.log('─'.repeat(70))

  const FAKE_PHONES = [
    '0145678901','0145678902','0145678903','0145678904','0145678905',
    '0612345601','0612345602','0612345603','0612345604','0612345605',
    '0472345601','0472345602','0472345603','0472345604','0472345605',
    '0678901201','0678901202','0678901203','0678901204','0678901205',
    '0491234501','0491234502','0491234503','0491234504','0491234505',
    '0634567801','0634567802','0634567803','0634567804','0634567805',
    '0320456701','0320456702','0320456703','0320456704','0320456705',
    '0656789001','0656789002','0656789003','0656789004','0656789005',
  ]
  const fakeSet = new Set(FAKE_PHONES)
  const fakeInDb = allWithPhone.filter(p => {
    if (!p.phone) return false
    const digits = p.phone.replace(/[\s.+\-]/g, '').replace(/^0033/, '0').replace(/^\+33/, '0')
    return fakeSet.has(digits)
  })
  console.log(`  Numéros fictifs encore en base : ${fakeInDb.length}`)
  if (fakeInDb.length > 0) {
    for (const p of fakeInDb.slice(0, 5)) {
      console.log(`    ${p.phone} → ${p.name}`)
    }
  }

  // ═══════════════════════════════════════════
  // CHECK 3 : Numéros au format suspect
  // ═══════════════════════════════════════════
  console.log('\n' + '─'.repeat(70))
  console.log('  CHECK 3 : Numéros au format suspect')
  console.log('─'.repeat(70))

  const phoneRegex = /^0[1-9]\d{8}$/
  const surtaxRegex = /^(089|036|099)/
  const suspectPhones = allWithPhone.filter(p => {
    if (!p.phone) return false
    const digits = p.phone.replace(/[\s.+\-]/g, '').replace(/^0033/, '0').replace(/^\+33/, '0')
    return !phoneRegex.test(digits) || surtaxRegex.test(digits)
  })
  console.log(`  Numéros suspects : ${suspectPhones.length}`)
  if (suspectPhones.length > 0 && VERBOSE) {
    for (const p of suspectPhones.slice(0, 10)) {
      console.log(`    "${p.phone}" → ${p.name}`)
    }
  }

  // ═══════════════════════════════════════════
  // CHECK 4 : Cross-check GM ↔ DB
  // ═══════════════════════════════════════════
  console.log('\n' + '─'.repeat(70))
  console.log('  CHECK 4 : Cross-check Google Maps ↔ Base de données')
  console.log('  (Un numéro GM existe en base → est-il chez le BON artisan ?)')
  console.log('─'.repeat(70))

  // Build normalized phone → providers map
  const phoneToProvider = new Map<string, ProviderRow[]>()
  for (const p of allWithPhone) {
    if (!p.phone) continue
    const digits = p.phone.replace(/[\s.+\-]/g, '').replace(/^0033/, '0').replace(/^\+33/, '0')
    const arr = phoneToProvider.get(digits) || []
    arr.push(p)
    phoneToProvider.set(digits, arr)
  }

  console.log(`  Providers avec phone en base : ${allWithPhone.length}`)
  console.log(`  Numéros GM disponibles :       ${gmRecords.size}`)

  const mismatches: Mismatch[] = []
  let gmMatchedCount = 0
  let gmCorrectCount = 0
  let gmWrongCount = 0
  let gmNotInDb = 0

  for (const [gmPhone, gmRec] of gmRecords) {
    const normalized = gmPhone.replace(/[\s.+\-]/g, '').replace(/^0033/, '0').replace(/^\+33/, '0')
    const dbProviders = phoneToProvider.get(normalized)

    if (!dbProviders || dbProviders.length === 0) {
      gmNotInDb++
      continue
    }

    gmMatchedCount++

    let bestSim = 0
    let bestProvider: ProviderRow | null = null
    for (const p of dbProviders) {
      const dice = diceSimilarity(gmRec.name, p.name)
      const token = tokenSimilarity(gmRec.name, p.name)
      const sim = Math.max(dice, token)
      if (sim > bestSim) {
        bestSim = sim
        bestProvider = p
      }
    }

    if (bestSim >= 0.40) {
      gmCorrectCount++
    } else {
      gmWrongCount++
      if (bestProvider) {
        mismatches.push({
          providerId: bestProvider.id,
          providerName: bestProvider.name,
          providerPhone: bestProvider.phone || '',
          gmName: gmRec.name,
          gmPhone: gmPhone,
          department: gmRec.deptCode,
          similarity: Math.round(bestSim * 100),
          issue: bestSim < 0.20
            ? 'CRITIQUE — noms complètement différents'
            : 'SUSPECT — noms peu similaires',
        })
      }
    }
  }

  console.log(`\n  Résultats du cross-check :`)
  console.log(`    Numéros GM trouvés en base :    ${gmMatchedCount}`)
  console.log(`    ✓ Nom correct (sim ≥ 0.40) :    ${gmCorrectCount} (${gmMatchedCount > 0 ? (gmCorrectCount / gmMatchedCount * 100).toFixed(1) : 0}%)`)
  console.log(`    ✗ Nom différent (sim < 0.40) :   ${gmWrongCount} (${gmMatchedCount > 0 ? (gmWrongCount / gmMatchedCount * 100).toFixed(1) : 0}%)`)
  console.log(`    Non trouvés en base :            ${gmNotInDb}`)

  mismatches.sort((a, b) => a.similarity - b.similarity)
  const criticalMismatches = mismatches.filter(m => m.similarity < 20)
  const suspectMismatches = mismatches.filter(m => m.similarity >= 20)

  console.log(`\n  Détail des incohérences :`)
  console.log(`    CRITIQUES (sim < 20%) :  ${criticalMismatches.length}`)
  console.log(`    SUSPECTS (20-40%) :      ${suspectMismatches.length}`)

  if (VERBOSE || criticalMismatches.length <= 30) {
    if (criticalMismatches.length > 0) {
      console.log(`\n  ── INCOHÉRENCES CRITIQUES (numéro probablement attribué au mauvais artisan) ──`)
      for (const m of criticalMismatches.slice(0, 50)) {
        console.log(`    ${m.providerPhone}`)
        console.log(`      DB :  ${m.providerName} (dept ${m.department})`)
        console.log(`      GM :  ${m.gmName}`)
        console.log(`      Sim : ${m.similarity}% — ${m.issue}`)
        console.log()
      }
    }
  }

  if (VERBOSE && suspectMismatches.length > 0) {
    console.log(`\n  ── INCOHÉRENCES SUSPECTES (à vérifier manuellement) ──`)
    for (const m of suspectMismatches.slice(0, 30)) {
      console.log(`    ${m.providerPhone} — sim ${m.similarity}%`)
      console.log(`      DB : ${m.providerName}  |  GM : ${m.gmName}`)
    }
  }

  // ═══════════════════════════════════════════
  // CHECK 5 : Artisans revendiqués
  // ═══════════════════════════════════════════
  console.log('\n' + '─'.repeat(70))
  console.log('  CHECK 5 : Artisans revendiqués (phone fiable vs phone importé)')
  console.log('─'.repeat(70))
  console.log(`  Artisans revendiqués avec phone : ${claimedWithPhone}`)
  console.log(`  (Les phones des revendiqués sont considérés fiables)`)

  // ═══════════════════════════════════════════
  // RÉSUMÉ & RECOMMANDATIONS
  // ═══════════════════════════════════════════
  console.log('\n' + '═'.repeat(70))
  console.log('  RÉSUMÉ DE L\'AUDIT')
  console.log('═'.repeat(70))

  const issues = []
  if (fakeInDb.length > 0) issues.push(`${fakeInDb.length} numéros fictifs`)
  if (duplicates.length > 0) issues.push(`${duplicates.length} numéros dupliqués (${totalDupArtisans} artisans concernés)`)
  if (suspectPhones.length > 0) issues.push(`${suspectPhones.length} numéros au format suspect`)
  if (criticalMismatches.length > 0) issues.push(`${criticalMismatches.length} numéros probablement sur le MAUVAIS artisan`)
  if (suspectMismatches.length > 0) issues.push(`${suspectMismatches.length} numéros à vérifier (matching faible)`)

  if (issues.length === 0) {
    console.log('  ✓ Aucun problème détecté !')
  } else {
    console.log(`  ${issues.length} types de problèmes détectés :\n`)
    for (const issue of issues) {
      console.log(`    ✗ ${issue}`)
    }
  }

  // Save report
  const report = {
    date: new Date().toISOString(),
    deptFilter: DEPT_FILTER || 'all',
    stats: { totalProviders: total, withPhone, withoutPhone },
    issues: {
      fakePhones: fakeInDb.length,
      duplicatePhones: duplicates.length,
      duplicateArtisans: totalDupArtisans,
      suspectFormat: suspectPhones.length,
      criticalMismatches: criticalMismatches.length,
      suspectMismatches: suspectMismatches.length,
    },
    mismatches: mismatches.map(m => ({
      providerId: m.providerId,
      providerName: m.providerName,
      phone: m.providerPhone,
      gmName: m.gmName,
      similarity: m.similarity,
      issue: m.issue,
      department: m.department,
    })),
    duplicates,
  }

  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2))
  console.log(`\n  Rapport détaillé : ${REPORT_FILE}`)

  console.log('\n  Recommandations :')
  if (fakeInDb.length > 0) {
    console.log('    1. Supprimer les numéros fictifs → npx tsx scripts/cleanup-phones.ts --apply')
  }
  if (criticalMismatches.length > 0) {
    console.log(`    2. Supprimer ${criticalMismatches.length} numéros critiques → npx tsx scripts/cleanup-phones.ts --apply`)
  }
  if (duplicates.length > 0) {
    console.log(`    3. Dédupliquer ${totalDupArtisans} numéros en double → npx tsx scripts/cleanup-phones.ts --apply`)
  }
  if (suspectMismatches.length > 0) {
    console.log(`    4. Vérifier manuellement ${suspectMismatches.length} numéros suspects`)
  }

  console.log('\n' + '═'.repeat(70) + '\n')
}

main()
