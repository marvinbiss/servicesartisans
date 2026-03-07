/**
 * Nettoyage Complet des Numéros de Téléphone
 *
 * Actions :
 *   1. Normaliser les +33 → 0x format (pas de suppression)
 *   2. Supprimer les numéros fictifs des seeds
 *   3. Dédupliquer (même numéro sur plusieurs artisans)
 *   4. Supprimer les numéros mal attribués (cross-check GM, sim < 20%)
 *
 * IMPORTANT : Les artisans revendiqués (claimed_at IS NOT NULL) ne sont
 * JAMAIS modifiés — leur phone est considéré fiable.
 *
 * Usage :
 *   npx tsx scripts/cleanup-phones.ts                # dry-run
 *   npx tsx scripts/cleanup-phones.ts --apply        # applique les changements
 *   npx tsx scripts/cleanup-phones.ts --dept 13      # un seul département
 */

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

const SUPABASE_URL = 'https://umjmbdbwcsxrvfqktiui.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtam1iZGJ3Y3N4cnZmcWt0aXVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTY2NjQ1OCwiZXhwIjoyMDg1MjQyNDU4fQ.6hXdR5jfhCl1AA5052k3YrBmI-UMhu36mxV2IPvYxjc'

const DRY_RUN = !process.argv.includes('--apply')
const DEPT_FILTER = process.argv.includes('--dept')
  ? process.argv[process.argv.indexOf('--dept') + 1]
  : undefined

const GM_DATA_DIR = path.join(__dirname, '.gm-data')
const OUTPUT_DIR = path.join(__dirname, '.enrich-data')
const GM_FILES = ['gm-listings.jsonl', 'gm-listings-v2.jsonl', 'gm-listings-cities.jsonl']

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true })

// ═══════════════════════════════════════════
// Supabase REST via curl
// ═══════════════════════════════════════════

function supaGet(queryPath: string): any {
  const url = `${SUPABASE_URL}/rest/v1${queryPath}`
  const cmd = `curl -s -H 'apikey: ${SUPABASE_KEY}' -H 'Authorization: Bearer ${SUPABASE_KEY}' '${url}'`
  const out = execSync(cmd, { encoding: 'utf-8', timeout: 60000 })
  return JSON.parse(out)
}

function supaPatch(queryPath: string, body: Record<string, any>): any {
  const url = `${SUPABASE_URL}/rest/v1${queryPath}`
  const bodyStr = JSON.stringify(body).replace(/'/g, "'\\''")
  const cmd = `curl -s -X PATCH -H 'apikey: ${SUPABASE_KEY}' -H 'Authorization: Bearer ${SUPABASE_KEY}' -H 'Content-Type: application/json' -H 'Prefer: return=minimal' -d '${bodyStr}' '${url}'`
  try {
    execSync(cmd, { encoding: 'utf-8', timeout: 30000 })
    return true
  } catch {
    return false
  }
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
// Fuzzy matching
// ═══════════════════════════════════════════

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(sarl|sas|sa|eurl|sasu|eirl|ei|ets|entreprise|societe|ste|monsieur|madame|m\.|mme)\b/gi, '')
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

// ═══════════════════════════════════════════
// Phone normalization
// ═══════════════════════════════════════════

function normalizePhone(raw: string): string | null {
  let cleaned = raw.replace(/[\s.\-()]/g, '')
  if (cleaned.startsWith('+33')) cleaned = '0' + cleaned.substring(3)
  if (cleaned.startsWith('0033')) cleaned = '0' + cleaned.substring(4)
  if (/^0[1-9]\d{8}$/.test(cleaned)) return cleaned
  return null
}

// ═══════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════

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
const FAKE_SET = new Set(FAKE_PHONES)

// ═══════════════════════════════════════════
// Load GM data
// ═══════════════════════════════════════════

interface GMRecord { name: string; phone: string; trade: string; deptCode: string }

function loadGMRecords(): Map<string, GMRecord> {
  const phoneMap = new Map<string, GMRecord>()
  for (const file of GM_FILES) {
    const filepath = path.join(GM_DATA_DIR, file)
    if (!fs.existsSync(filepath)) continue
    const lines = fs.readFileSync(filepath, 'utf-8').trim().split('\n')
    for (const line of lines) {
      try {
        const obj: GMRecord = JSON.parse(line)
        if (!obj.phone || !obj.name) continue
        if (DEPT_FILTER && obj.deptCode !== DEPT_FILTER) continue
        if (!phoneMap.has(obj.phone)) phoneMap.set(obj.phone, obj)
      } catch { /* skip */ }
    }
  }
  return phoneMap
}

// ═══════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════

interface ProviderRow {
  id: string
  name: string
  phone: string | null
  claimed_at: string | null
  review_count: number | null
  created_at: string | null
}

function main() {
  console.log('\n' + '═'.repeat(70))
  console.log('  NETTOYAGE DES NUMÉROS DE TÉLÉPHONE')
  console.log(`  Mode : ${DRY_RUN ? '🔍 DRY-RUN (aucune modification)' : '⚠️  APPLICATION RÉELLE'}`)
  if (DEPT_FILTER) console.log(`  Département : ${DEPT_FILTER}`)
  console.log('═'.repeat(70))

  // Test connection
  const test = supaGet('/providers?select=id&limit=1&is_active=eq.true')
  if (!test || test.length === 0) {
    console.error('  ERREUR : Connexion Supabase impossible')
    process.exit(1)
  }
  console.log('  Connexion OK\n')

  // Load all providers with phone
  console.log('  Chargement des providers avec phone...')
  const deptQ = DEPT_FILTER ? `&address_department=eq.${DEPT_FILTER}` : ''
  const allWithPhone: ProviderRow[] = supaFetchAll(
    `/providers?select=id,name,phone,claimed_at,review_count,created_at&is_active=eq.true&phone=not.is.null${deptQ}&order=created_at`
  )
  console.log(`  → ${allWithPhone.length} providers chargés\n`)

  const toNormalize: { id: string; oldPhone: string; newPhone: string; name: string }[] = []
  const toDelete: { id: string; name: string; phone: string; reason: string }[] = []

  // ═══════════════════════════════════════════
  // ÉTAPE 1 : Normaliser +33 → 0x
  // ═══════════════════════════════════════════
  console.log('── Étape 1 : Normalisation +33 → 0x ──')

  for (const p of allWithPhone) {
    if (!p.phone) continue
    // Already in correct format?
    if (/^0[1-9]\d{8}$/.test(p.phone)) continue
    const normalized = normalizePhone(p.phone)
    if (normalized && normalized !== p.phone) {
      toNormalize.push({ id: p.id, oldPhone: p.phone, newPhone: normalized, name: p.name })
    } else if (!normalized) {
      // Truly invalid phone (can't be normalized)
      if (!p.claimed_at) {
        toDelete.push({ id: p.id, name: p.name, phone: p.phone, reason: 'format invalide (non normalisable)' })
      }
    }
  }
  console.log(`  → ${toNormalize.length} numéros à normaliser (+33 → 0x)`)
  console.log(`  → ${toDelete.length} numéros réellement invalides à supprimer`)

  // ═══════════════════════════════════════════
  // ÉTAPE 2 : Numéros fictifs
  // ═══════════════════════════════════════════
  console.log('\n── Étape 2 : Numéros fictifs des seeds ──')

  const alreadyDeleting = new Set(toDelete.map(d => d.id))
  let fakeCount = 0
  for (const p of allWithPhone) {
    if (p.claimed_at || !p.phone || alreadyDeleting.has(p.id)) continue
    const digits = normalizePhone(p.phone) || p.phone
    if (FAKE_SET.has(digits)) {
      toDelete.push({ id: p.id, name: p.name, phone: p.phone, reason: 'fictif (seed)' })
      alreadyDeleting.add(p.id)
      fakeCount++
    }
  }
  console.log(`  → ${fakeCount} numéros fictifs`)

  // ═══════════════════════════════════════════
  // ÉTAPE 3 : Numéros dupliqués (après normalisation)
  // ═══════════════════════════════════════════
  console.log('\n── Étape 3 : Numéros dupliqués ──')

  // Build map with normalized phones
  const normalizeMap = new Map<string, string>()
  for (const n of toNormalize) normalizeMap.set(n.id, n.newPhone)

  const phoneGroups = new Map<string, ProviderRow[]>()
  for (const p of allWithPhone) {
    if (!p.phone || alreadyDeleting.has(p.id)) continue
    const normalized = normalizeMap.get(p.id) || normalizePhone(p.phone) || p.phone
    const arr = phoneGroups.get(normalized) || []
    arr.push(p)
    phoneGroups.set(normalized, arr)
  }

  let dupCount = 0
  for (const [, group] of phoneGroups) {
    if (group.length <= 1) continue
    // Sort: claimed first, then review_count desc, then oldest first
    group.sort((a, b) => {
      if (a.claimed_at && !b.claimed_at) return -1
      if (!a.claimed_at && b.claimed_at) return 1
      const ra = a.review_count || 0
      const rb = b.review_count || 0
      if (rb !== ra) return rb - ra
      return (a.created_at || '').localeCompare(b.created_at || '')
    })
    // Keep first, remove rest
    for (let i = 1; i < group.length; i++) {
      if (group[i].claimed_at || alreadyDeleting.has(group[i].id)) continue
      toDelete.push({ id: group[i].id, name: group[i].name, phone: group[i].phone!, reason: 'doublon' })
      alreadyDeleting.add(group[i].id)
      dupCount++
    }
  }
  console.log(`  → ${dupCount} doublons`)

  // ═══════════════════════════════════════════
  // ÉTAPE 4 : Cross-check GM (mauvais artisan)
  // ═══════════════════════════════════════════
  console.log('\n── Étape 4 : Cross-check GM ──')

  const gmRecords = loadGMRecords()
  console.log(`  ${gmRecords.size} numéros GM chargés`)

  let crossCount = 0
  for (const p of allWithPhone) {
    if (p.claimed_at || !p.phone || alreadyDeleting.has(p.id)) continue
    const digits = normalizeMap.get(p.id) || normalizePhone(p.phone) || p.phone

    const gmRec = gmRecords.get(digits)
    if (!gmRec) continue

    const similarity = diceSimilarity(gmRec.name, p.name)
    if (similarity < 0.20) {
      toDelete.push({
        id: p.id,
        name: p.name,
        phone: p.phone,
        reason: `mauvais artisan (GM: "${gmRec.name}", sim: ${Math.round(similarity * 100)}%)`,
      })
      alreadyDeleting.add(p.id)
      crossCount++
    }
  }
  console.log(`  → ${crossCount} numéros sur le mauvais artisan`)

  // ═══════════════════════════════════════════
  // RÉSUMÉ
  // ═══════════════════════════════════════════
  console.log('\n' + '═'.repeat(70))
  console.log('  RÉSUMÉ')
  console.log('═'.repeat(70))
  console.log(`  Normalisation (+33 → 0x) : ${toNormalize.length}`)
  console.log(`  Suppression phone :        ${toDelete.length}`)

  const byReason: Record<string, number> = {}
  for (const r of toDelete) {
    const key = r.reason.split(' (')[0]
    byReason[key] = (byReason[key] || 0) + 1
  }
  for (const [reason, count] of Object.entries(byReason)) {
    console.log(`    └ ${reason}: ${count}`)
  }

  console.log('\n  Exemples suppression :')
  for (const r of toDelete.slice(0, 10)) {
    console.log(`    ${r.phone} | ${r.name} | ${r.reason}`)
  }
  if (toDelete.length > 10) console.log(`    ... et ${toDelete.length - 10} autres`)

  // ═══════════════════════════════════════════
  // APPLICATION
  // ═══════════════════════════════════════════

  if (DRY_RUN) {
    console.log('\n' + '─'.repeat(70))
    console.log('  🔍 DRY-RUN terminé.')
    console.log('  Pour appliquer : npx tsx scripts/cleanup-phones.ts --apply')
    console.log('─'.repeat(70) + '\n')

    fs.writeFileSync(path.join(OUTPUT_DIR, 'cleanup-plan.json'), JSON.stringify({
      date: new Date().toISOString(),
      toNormalize: toNormalize.length,
      toDelete: toDelete.length,
      phoneBefore: allWithPhone.length,
      normalizeItems: toNormalize.slice(0, 50),
      deleteItems: toDelete,
    }, null, 2))
    console.log(`  Plan sauvegardé : ${path.join(OUTPUT_DIR, 'cleanup-plan.json')}`)
    return
  }

  console.log('\n── Application des corrections ──')

  // 1. Normalize +33 → 0x
  let normalizedCount = 0
  console.log(`\n  [1/2] Normalisation de ${toNormalize.length} numéros...`)
  for (let i = 0; i < toNormalize.length; i++) {
    const { id, newPhone } = toNormalize[i]
    const ok = supaPatch(`/providers?id=eq.${id}`, { phone: newPhone })
    if (ok) normalizedCount++
    if ((i + 1) % 100 === 0 || i + 1 === toNormalize.length) {
      process.stdout.write(`    ${i + 1}/${toNormalize.length} — ${normalizedCount} normalisés\r`)
    }
  }
  console.log(`\n    → ${normalizedCount} numéros normalisés`)

  // 2. Delete bad phones
  let deletedCount = 0
  console.log(`\n  [2/2] Suppression de ${toDelete.length} numéros...`)
  for (let i = 0; i < toDelete.length; i++) {
    const { id } = toDelete[i]
    const ok = supaPatch(`/providers?id=eq.${id}&claimed_at=is.null`, { phone: null })
    if (ok) deletedCount++
    if ((i + 1) % 50 === 0 || i + 1 === toDelete.length) {
      process.stdout.write(`    ${i + 1}/${toDelete.length} — ${deletedCount} supprimés\r`)
    }
  }
  console.log(`\n    → ${deletedCount} numéros supprimés`)

  console.log('\n' + '═'.repeat(70))
  console.log('  ✅ NETTOYAGE TERMINÉ')
  console.log('═'.repeat(70))
  console.log(`  Normalisés :  ${normalizedCount}`)
  console.log(`  Supprimés :   ${deletedCount}`)
  console.log(`  Avant :       ${allWithPhone.length} artisans avec phone`)
  console.log(`  Après :       ~${allWithPhone.length - deletedCount} artisans avec phone`)
  console.log('═'.repeat(70) + '\n')

  fs.writeFileSync(path.join(OUTPUT_DIR, 'cleanup-log.json'), JSON.stringify({
    date: new Date().toISOString(),
    normalizedCount,
    deletedCount,
    phoneBefore: allWithPhone.length,
    normalizeItems: toNormalize,
    deleteItems: toDelete,
  }, null, 2))
}

main()
