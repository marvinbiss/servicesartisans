#!/usr/bin/env npx tsx
/**
 * import-insee-ademe-csv.ts — Complete the 2 enrichment columns that the
 * live API scrape couldn't fetch because the opendatasoft/data.gouv catalog
 * endpoints have been unstable since the 2026-04 migration.
 *
 * This script assumes you downloaded the official CSVs manually, because:
 *   - INSEE FILOSOFI datasets moved off opendatasoft with no stable replacement
 *   - ADEME MaPrimeRénov data-fair endpoint returns empty results for the
 *     filtered queries (structure change in 2025-11)
 *
 * Target columns in `communes`:
 *   - revenu_median (integer €/year)             ← FILOSOFI "DISP_MED" / "MED"
 *   - nb_maprimerenov_annuel (integer)           ← ADEME dept aggregated count
 *
 * Official download URLs (2026-04):
 *   - FILOSOFI 2021 Commune:
 *     https://www.insee.fr/fr/statistiques/7463730
 *     → file "indic-struct-distrib-revenu-2021-COMMUNES.xlsx" (convert to CSV)
 *     or the 2019 version "base-ic-revenu-2019.xlsx"
 *   - MaPrimeRénov par département:
 *     https://www.data.gouv.fr/fr/datasets/base-de-donnees-maprimerenov-ma-prime-renov-residences-principales/
 *     → pick the aggregated per-dept yearly totals
 *
 * Usage:
 *   npx tsx scripts/import-insee-ademe-csv.ts --filosofi=./filosofi.csv [--dry-run]
 *   npx tsx scripts/import-insee-ademe-csv.ts --maprime=./maprime.csv [--dry-run]
 *   npx tsx scripts/import-insee-ademe-csv.ts --filosofi=./f.csv --maprime=./m.csv
 *
 * CSV format — FILOSOFI expected columns (separator `;` or `,`):
 *   CODGEO (code INSEE commune, 5 chars)
 *   MED21 / MED20 / MED19 / DISP_MED / MEDIAN  (first present = revenu_median)
 *
 * CSV format — MaPrimeRénov expected columns:
 *   code_departement | departement | dept  (2 or 3 char dept code)
 *   nb_dossiers | nb_primes | count        (yearly count)
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supa = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
)

type Row = Record<string, string>

function parseCsv(filePath: string): Row[] {
  const raw = fs.readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '')
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length === 0) return []

  // Auto-detect separator by inspecting the header
  const firstLine = lines[0]
  const sep = firstLine.includes(';') ? ';' : ','

  const splitRow = (line: string): string[] => {
    const out: string[] = []
    let cur = ''
    let inQ = false
    for (const ch of line) {
      if (ch === '"') inQ = !inQ
      else if (ch === sep && !inQ) {
        out.push(cur)
        cur = ''
      } else cur += ch
    }
    out.push(cur)
    return out.map((s) => s.replace(/^"|"$/g, '').trim())
  }

  const header = splitRow(lines[0]).map((h) => h.trim())
  const rows: Row[] = []
  for (let i = 1; i < lines.length; i++) {
    const parts = splitRow(lines[i])
    const row: Row = {}
    for (let j = 0; j < header.length; j++) row[header[j]] = parts[j] ?? ''
    rows.push(row)
  }
  return rows
}

const REVENU_KEYS = ['MED21', 'MED20', 'MED19', 'MED18', 'DISP_MED', 'MEDIAN', 'revenu_median']
const INSEE_KEYS = ['CODGEO', 'CODE_INSEE', 'code_insee', 'insee', 'INSEE', 'depcom', 'DEPCOM']

function firstMatchingKey(row: Row, candidates: string[]): string | null {
  for (const k of candidates) {
    if (row[k] !== undefined && row[k] !== '') return k
    // case-insensitive fallback
    const hit = Object.keys(row).find((rk) => rk.toLowerCase() === k.toLowerCase())
    if (hit && row[hit] !== '') return hit
  }
  return null
}

function parseIntSafe(v: string): number | null {
  if (!v) return null
  const n = parseInt(v.replace(/[\s.,]/g, ''), 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

async function importFilosofi(csvPath: string, dryRun: boolean): Promise<void> {
  console.log(`📊 FILOSOFI: parsing ${csvPath}`)
  const rows = parseCsv(csvPath)
  if (rows.length === 0) {
    console.warn('   ⚠️  No rows parsed')
    return
  }

  const inseeKey = firstMatchingKey(rows[0], INSEE_KEYS)
  const revenuKey = firstMatchingKey(rows[0], REVENU_KEYS)
  if (!inseeKey || !revenuKey) {
    throw new Error(
      `FILOSOFI CSV missing required columns. Found: ${Object.keys(rows[0]).join(', ')}. ` +
        `Expected INSEE code + revenue median.`
    )
  }
  console.log(`   Columns: insee="${inseeKey}" revenu="${revenuKey}"`)

  const updates = new Map<string, number>()
  for (const row of rows) {
    const insee = (row[inseeKey] || '').trim().padStart(5, '0').slice(0, 5)
    const revenu = parseIntSafe(row[revenuKey])
    if (!insee || !revenu) continue
    updates.set(insee, revenu)
  }
  console.log(`   Parsed ${updates.size} commune revenu_median entries`)

  if (dryRun) {
    const sample = Array.from(updates.entries()).slice(0, 5)
    console.log('   Sample:', sample)
    return
  }

  const entries = Array.from(updates.entries())
  const BATCH = 500
  let applied = 0
  for (let i = 0; i < entries.length; i += BATCH) {
    const chunk = entries.slice(i, i + BATCH)
    // One UPDATE per row — commune table is keyed by `code_insee`, not `slug`.
    // We can't use PostgREST UPDATE … IN (values list) because we need per-row
    // values. Parallelize with Promise.all in chunks of 50 to respect rate.
    const sub = 50
    for (let j = 0; j < chunk.length; j += sub) {
      const slice = chunk.slice(j, j + sub)
      await Promise.all(
        slice.map(([insee, val]) =>
          supa.from('communes').update({ revenu_median: val }).eq('code_insee', insee)
        )
      )
      applied += slice.length
      process.stdout.write(`\r   Applied ${applied}/${entries.length}`)
    }
  }
  console.log(`\n   ✅ FILOSOFI imported: ${applied}`)
}

const DEPT_KEYS = ['code_departement', 'dept', 'departement', 'CODE_DEPT', 'dep', 'DEP']
const NB_KEYS = ['nb_dossiers', 'nb_primes', 'count', 'total_primes', 'nb_maprimerenov']

async function importMaPrimeRenov(csvPath: string, dryRun: boolean): Promise<void> {
  console.log(`📊 MaPrimeRénov: parsing ${csvPath}`)
  const rows = parseCsv(csvPath)
  if (rows.length === 0) {
    console.warn('   ⚠️  No rows parsed')
    return
  }

  const deptKey = firstMatchingKey(rows[0], DEPT_KEYS)
  const nbKey = firstMatchingKey(rows[0], NB_KEYS)
  if (!deptKey || !nbKey) {
    throw new Error(
      `MaPrimeRénov CSV missing required columns. Found: ${Object.keys(rows[0]).join(', ')}. ` +
        `Expected department code + dossier count.`
    )
  }
  console.log(`   Columns: dept="${deptKey}" nb="${nbKey}"`)

  // Aggregate by dept (CSV may have per-year rows; take the most recent / max)
  const aggregate = new Map<string, number>()
  for (const row of rows) {
    const dept = (row[deptKey] || '').trim().padStart(2, '0').slice(0, 3)
    const nb = parseIntSafe(row[nbKey])
    if (!dept || !nb) continue
    const prev = aggregate.get(dept) || 0
    aggregate.set(dept, Math.max(prev, nb))
  }
  console.log(`   Parsed ${aggregate.size} depts with MaPrimeRénov counts`)

  if (dryRun) {
    const sample = Array.from(aggregate.entries()).slice(0, 5)
    console.log('   Sample:', sample)
    return
  }

  // Update ALL communes of each dept in one UPDATE per dept.
  let applied = 0
  for (const [dept, nb] of aggregate) {
    const { error } = await supa
      .from('communes')
      .update({ nb_maprimerenov_annuel: nb })
      .like('code_insee', `${dept}%`)
    if (error) {
      console.warn(`   ⚠️ dept ${dept}: ${error.message}`)
      continue
    }
    applied++
  }
  console.log(`   ✅ MaPrimeRénov imported: ${applied} depts`)
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const filo = args.find((a) => a.startsWith('--filosofi='))?.split('=')[1]
  const mpr = args.find((a) => a.startsWith('--maprime='))?.split('=')[1]

  if (!filo && !mpr) {
    console.error(
      'Usage: npx tsx scripts/import-insee-ademe-csv.ts --filosofi=./f.csv --maprime=./m.csv [--dry-run]'
    )
    process.exit(1)
  }

  if (filo) await importFilosofi(filo, dryRun)
  if (mpr) await importMaPrimeRenov(mpr, dryRun)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
