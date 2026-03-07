/**
 * Nettoyage Complet des Numéros de Téléphone
 *
 * Supprime les numéros problématiques détectés par l'audit :
 *   1. Numéros fictifs des seeds (migrations 104, 105)
 *   2. Numéros dupliqués (même numéro sur plusieurs artisans)
 *   3. Numéros au format invalide
 *   4. Numéros mal attribués (cross-check GM → similarité < 20%)
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
import { Client } from 'pg'

const PG_URL = process.env.DATABASE_URL
  || 'postgresql://postgres:BEB6LnGlT6U9bkTe@db.umjmbdbwcsxrvfqktiui.supabase.co:5432/postgres'

const DRY_RUN = !process.argv.includes('--apply')
const DEPT_FILTER = process.argv.includes('--dept')
  ? process.argv[process.argv.indexOf('--dept') + 1]
  : undefined

const GM_DATA_DIR = path.join(__dirname, '.gm-data')
const OUTPUT_DIR = path.join(__dirname, '.enrich-data')
const GM_FILES = ['gm-listings.jsonl', 'gm-listings-v2.jsonl', 'gm-listings-cities.jsonl']

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true })

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
// Numéros fictifs
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

// ═══════════════════════════════════════════
// Load GM data for cross-check
// ═══════════════════════════════════════════

interface GMRecord {
  name: string
  phone: string
  trade: string
  deptCode: string
}

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
        if (!phoneMap.has(obj.phone)) {
          phoneMap.set(obj.phone, obj)
        }
      } catch { /* skip */ }
    }
  }

  return phoneMap
}

// ═══════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════

async function main() {
  console.log('\n' + '═'.repeat(70))
  console.log('  NETTOYAGE DES NUMÉROS DE TÉLÉPHONE')
  console.log(`  Mode : ${DRY_RUN ? '🔍 DRY-RUN (aucune modification)' : '⚠️  APPLICATION RÉELLE'}`)
  if (DEPT_FILTER) console.log(`  Département : ${DEPT_FILTER}`)
  console.log('═'.repeat(70))

  const client = new Client({
    connectionString: PG_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,
  })
  await client.connect()
  console.log('  Connexion OK\n')

  const deptFilter = DEPT_FILTER ? `AND address_department = '${DEPT_FILTER}'` : ''
  const idsToClean = new Set<string>()
  const cleanupReasons: { id: string; name: string; phone: string; reason: string }[] = []

  // Stats avant
  const beforeRes = await client.query(`
    SELECT COUNT(phone) FILTER (WHERE phone IS NOT NULL) as with_phone
    FROM providers WHERE is_active = true ${deptFilter}
  `)
  const phoneBefore = Number(beforeRes.rows[0].with_phone)

  // ═══════════════════════════════════════════
  // ÉTAPE 1 : Numéros fictifs
  // ═══════════════════════════════════════════
  console.log('── Étape 1 : Numéros fictifs des seeds ──')

  const fakePlaceholders = FAKE_PHONES.map((_, i) => `$${i + 1}`).join(',')
  const fakeRes = await client.query(
    `SELECT id, name, phone FROM providers
     WHERE phone IN (${fakePlaceholders}) AND claimed_at IS NULL ${deptFilter}`,
    FAKE_PHONES
  )

  for (const row of fakeRes.rows) {
    idsToClean.add(row.id)
    cleanupReasons.push({ id: row.id, name: row.name, phone: row.phone, reason: 'fictif (seed)' })
  }
  console.log(`  → ${fakeRes.rows.length} numéros fictifs à supprimer`)

  // ═══════════════════════════════════════════
  // ÉTAPE 2 : Numéros format invalide
  // ═══════════════════════════════════════════
  console.log('\n── Étape 2 : Numéros au format invalide ──')

  const invalidRes = await client.query(`
    SELECT id, name, phone FROM providers
    WHERE phone IS NOT NULL AND is_active = true AND claimed_at IS NULL ${deptFilter}
      AND (
        phone !~ '^0[1-9][0-9]{8}$'
        OR phone ~ '^(089|036|099)'
        OR LENGTH(REGEXP_REPLACE(phone, '[^0-9]', '', 'g')) != 10
      )
    LIMIT 1000
  `)

  for (const row of invalidRes.rows) {
    if (!idsToClean.has(row.id)) {
      idsToClean.add(row.id)
      cleanupReasons.push({ id: row.id, name: row.name, phone: row.phone, reason: 'format invalide' })
    }
  }
  console.log(`  → ${invalidRes.rows.length} numéros invalides à supprimer`)

  // ═══════════════════════════════════════════
  // ÉTAPE 3 : Numéros dupliqués
  // ═══════════════════════════════════════════
  console.log('\n── Étape 3 : Numéros dupliqués ──')

  const dupRes = await client.query(`
    WITH ranked AS (
      SELECT id, name, phone,
             ROW_NUMBER() OVER (PARTITION BY phone ORDER BY
               claimed_at DESC NULLS LAST,
               review_count DESC NULLS LAST,
               created_at ASC
             ) as rn
      FROM providers
      WHERE phone IS NOT NULL AND is_active = true ${deptFilter}
    )
    SELECT id, name, phone FROM ranked
    WHERE rn > 1 AND id NOT IN (
      SELECT id FROM providers WHERE claimed_at IS NOT NULL
    )
  `)

  for (const row of dupRes.rows) {
    if (!idsToClean.has(row.id)) {
      idsToClean.add(row.id)
      cleanupReasons.push({ id: row.id, name: row.name, phone: row.phone, reason: 'doublon' })
    }
  }
  console.log(`  → ${dupRes.rows.length} doublons à nettoyer`)

  // ═══════════════════════════════════════════
  // ÉTAPE 4 : Cross-check GM (mauvais artisan)
  // ═══════════════════════════════════════════
  console.log('\n── Étape 4 : Numéros attribués au mauvais artisan (cross-check GM) ──')

  const gmRecords = loadGMRecords()
  console.log(`  ${gmRecords.size} numéros GM chargés`)

  // Get all non-claimed providers with phone
  const providersRes = await client.query(`
    SELECT id, name, phone FROM providers
    WHERE phone IS NOT NULL AND is_active = true AND claimed_at IS NULL ${deptFilter}
  `)

  let crossCheckCritical = 0
  for (const provider of providersRes.rows) {
    if (idsToClean.has(provider.id)) continue
    const phone = provider.phone?.replace(/\D/g, '')
    if (!phone) continue

    const gmRec = gmRecords.get(phone)
    if (!gmRec) continue // Phone not in GM data, can't cross-check

    const similarity = diceSimilarity(gmRec.name, provider.name)

    // Critical: GM has this phone for a completely different business
    if (similarity < 0.20) {
      idsToClean.add(provider.id)
      cleanupReasons.push({
        id: provider.id,
        name: provider.name,
        phone: provider.phone,
        reason: `mauvais artisan (GM: "${gmRec.name}", sim: ${Math.round(similarity * 100)}%)`,
      })
      crossCheckCritical++
    }
  }
  console.log(`  → ${crossCheckCritical} numéros sur le mauvais artisan (sim < 20%)`)

  // ═══════════════════════════════════════════
  // RÉSUMÉ
  // ═══════════════════════════════════════════
  console.log('\n' + '═'.repeat(70))
  console.log(`  TOTAL : ${idsToClean.size} numéros à supprimer`)
  console.log('═'.repeat(70))

  // Breakdown by reason
  const byReason: Record<string, number> = {}
  for (const r of cleanupReasons) {
    const key = r.reason.split(' (')[0] // Group by main reason
    byReason[key] = (byReason[key] || 0) + 1
  }
  for (const [reason, count] of Object.entries(byReason)) {
    console.log(`    ${reason}: ${count}`)
  }

  // Show some examples
  console.log('\n  Exemples :')
  for (const r of cleanupReasons.slice(0, 15)) {
    console.log(`    ${r.phone} | ${r.name} | ${r.reason}`)
  }
  if (cleanupReasons.length > 15) {
    console.log(`    ... et ${cleanupReasons.length - 15} autres`)
  }

  // ═══════════════════════════════════════════
  // APPLICATION
  // ═══════════════════════════════════════════

  if (DRY_RUN) {
    console.log('\n' + '─'.repeat(70))
    console.log('  🔍 DRY-RUN terminé.')
    console.log('  Pour appliquer : npx tsx scripts/cleanup-phones.ts --apply')
    console.log('─'.repeat(70) + '\n')

    // Save cleanup plan
    const planFile = path.join(OUTPUT_DIR, 'cleanup-plan.json')
    fs.writeFileSync(planFile, JSON.stringify({
      date: new Date().toISOString(),
      totalToClean: idsToClean.size,
      phoneBefore,
      items: cleanupReasons,
    }, null, 2))
    console.log(`  Plan sauvegardé : ${planFile}`)
  } else {
    console.log('\n── Application des corrections ──')

    if (idsToClean.size === 0) {
      console.log('  Rien à nettoyer !')
      await client.end()
      return
    }

    const idsArr = Array.from(idsToClean)
    const CHUNK = 500
    let totalCleaned = 0

    for (let i = 0; i < idsArr.length; i += CHUNK) {
      const chunk = idsArr.slice(i, i + CHUNK)
      const placeholders = chunk.map((_, idx) => `$${idx + 1}`).join(',')

      const res = await client.query(
        `UPDATE providers
         SET phone = NULL, updated_at = NOW()
         WHERE id IN (${placeholders}) AND claimed_at IS NULL
         RETURNING id`,
        chunk
      )
      totalCleaned += res.rowCount || 0

      if ((i + CHUNK) % 2000 === 0 || i + CHUNK >= idsArr.length) {
        console.log(`  Progression : ${Math.min(i + CHUNK, idsArr.length)}/${idsArr.length} — ${totalCleaned} nettoyés`)
      }
    }

    // Stats après
    const afterRes = await client.query(`
      SELECT COUNT(phone) FILTER (WHERE phone IS NOT NULL) as with_phone
      FROM providers WHERE is_active = true ${deptFilter}
    `)
    const phoneAfter = Number(afterRes.rows[0].with_phone)

    console.log('\n' + '═'.repeat(70))
    console.log('  ✅ NETTOYAGE TERMINÉ')
    console.log('═'.repeat(70))
    console.log(`  Avant :    ${phoneBefore.toLocaleString('fr-FR')} artisans avec phone`)
    console.log(`  Nettoyés : ${totalCleaned}`)
    console.log(`  Après :    ${phoneAfter.toLocaleString('fr-FR')} artisans avec phone`)
    console.log(`  Δ :        -${(phoneBefore - phoneAfter).toLocaleString('fr-FR')}`)
    console.log('═'.repeat(70) + '\n')

    // Save cleanup log
    const logFile = path.join(OUTPUT_DIR, 'cleanup-log.json')
    fs.writeFileSync(logFile, JSON.stringify({
      date: new Date().toISOString(),
      phoneBefore,
      phoneAfter,
      totalCleaned,
      items: cleanupReasons,
    }, null, 2))
    console.log(`  Log : ${logFile}`)
  }

  await client.end()
}

main().catch(err => {
  console.error('ERREUR:', err)
  process.exit(1)
})
