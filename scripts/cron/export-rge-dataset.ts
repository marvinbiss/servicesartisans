/**
 * Sprint 0.4 — Dataset RGE export (data.gouv.fr backbone)
 *
 * Cron mensuel qui exporte le sous-ensemble RGE de `providers` vers 3 formats
 * publiables sous licence CC-BY-4.0 :
 *
 *   - public/datasets/rge/rge-YYYY-MM.csv      (UTF-8 BOM, séparateur ",")
 *   - public/datasets/rge/rge-YYYY-MM.json     (NDJSON streaming-friendly)
 *   - public/datasets/rge/rge-YYYY-MM.parquet  (stub si parquetjs absent)
 *
 * Sidecar :
 *   - public/datasets/rge/rge-YYYY-MM.meta.json
 *   - public/datasets/rge/rge-latest.{csv,json,parquet}  (copies du dernier)
 *
 * Source : table `providers` (sync ADEME hebdo via cron `/api/cron/rge-sync`)
 *   filtrée `is_active=true AND noindex=false AND rge_qualifications IS NOT NULL`
 *
 * Champs (cf. migration 380) :
 *   siret, name, slug, address_street, address_city, address_postal_code,
 *   address_department, address_region, latitude, longitude,
 *   rge_qualifications[], rge_valid_until, rge_organismes[], specialty,
 *   rge_last_synced_at, rge_source_url
 *
 * Usage CLI :
 *   npx tsx scripts/cron/export-rge-dataset.ts                # mois courant
 *   npx tsx scripts/cron/export-rge-dataset.ts 2026-04        # mois explicite
 *   npx tsx scripts/cron/export-rge-dataset.ts --dry-run      # pas d'écriture
 *
 * Cron route : src/app/api/cron/export-rge-dataset/route.ts (timing-safe auth).
 *
 * NOTE Sprint 0.4 : ce script est livré en MODE PRÉPARATOIRE — l'exécution
 * réelle attend la validation Sprint 0.1 (template /rge/[s]/[v]). Tant que
 * l'agent #4 n'a pas activé la cron dans vercel.json, ce script reste
 * exécutable manuellement uniquement, et le cron route renvoie 503 par
 * défaut (kill switch via env `RGE_DATASET_EXPORT_ENABLED=true`).
 *
 * Env :
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import { createAdminClient } from '../../src/lib/supabase/admin'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RgeQualification = {
  code?: string | null
  nom?: string | null
  libelle?: string | null
  organisme?: string | null
  domaine?: string | null
  date_debut?: string | null
  date_fin?: string | null
}

type ProviderRow = {
  siret: string | null
  name: string | null
  slug: string | null
  address_street: string | null
  address_city: string | null
  address_postal_code: string | null
  address_department: string | null
  address_region: string | null
  latitude: number | null
  longitude: number | null
  specialty: string | null
  rge_qualifications: RgeQualification[] | null
  rge_valid_until: string | null
  rge_organismes: string[] | null
  rge_last_synced_at: string | null
  rge_source_url: string | null
}

type ExportSummary = {
  yearmonth: string
  count: number
  generated_at: string
  license: 'CC-BY-4.0'
  schema_version: string
  files: Array<{
    name: string
    bytes: number
    sha256: string
    encoding_format: string
  }>
}

type ExportResult = {
  ok: boolean
  yearmonth: string
  count: number
  duration_ms: number
  output_dir: string
  files: string[]
  warnings: string[]
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const SCHEMA_VERSION = '0.1.0'
const PAGE_SIZE = 1000
const PUBLIC_DATASETS_DIR = path.join(process.cwd(), 'public', 'datasets', 'rge')
const UTF8_BOM = '﻿'

const EXPORT_COLUMNS = [
  'siret',
  'name',
  'slug',
  'address_street',
  'address_city',
  'address_postal_code',
  'address_department',
  'address_region',
  'latitude',
  'longitude',
  'specialty',
  'rge_qualifications',
  'rge_valid_until',
  'rge_organismes',
  'rge_last_synced_at',
  'rge_source_url',
] as const

// ---------------------------------------------------------------------------
// Helpers — CSV
// ---------------------------------------------------------------------------

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = typeof value === 'string' ? value : JSON.stringify(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function rowToCsv(row: ProviderRow): string {
  return EXPORT_COLUMNS.map((col) => {
    const v = row[col as keyof ProviderRow]
    if (Array.isArray(v) || (v !== null && typeof v === 'object')) {
      return csvEscape(JSON.stringify(v))
    }
    return csvEscape(v)
  }).join(',')
}

function buildCsv(rows: ProviderRow[]): string {
  const header = EXPORT_COLUMNS.join(',')
  const body = rows.map(rowToCsv).join('\n')
  return `${UTF8_BOM}${header}\n${body}\n`
}

// ---------------------------------------------------------------------------
// Helpers — NDJSON
// ---------------------------------------------------------------------------

function buildNdjson(rows: ProviderRow[]): string {
  return rows.map((row) => JSON.stringify(row)).join('\n') + '\n'
}

// ---------------------------------------------------------------------------
// Helpers — Parquet (stub: dep `parquetjs` absente)
// ---------------------------------------------------------------------------

/**
 * TODO Sprint 0.4 follow-up : intégrer `parquetjs` ou `apache-arrow` une fois
 * l'export CSV/JSON validé en prod. Pour l'instant on émet un stub binaire
 * informatif pour ne pas bloquer le pipeline (data.gouv accepte CSV+JSON
 * uniquement comme MVP).
 *
 * Plan d'activation :
 *   1. `npm i parquetjs-lite` (200KB, pure JS, pas de native bindings)
 *   2. Remplacer `buildParquetStub()` par un `ParquetWriter` réel
 *   3. Schema : reprendre `EXPORT_COLUMNS`, types Parquet (UTF8 / DOUBLE / TIMESTAMP_MILLIS)
 *   4. Tester roundtrip avec `pyarrow` côté data.gouv pour valider
 */
function buildParquetStub(rows: ProviderRow[], yearmonth: string): Buffer {
  const placeholder = {
    _stub: true,
    _format: 'parquet',
    _version: SCHEMA_VERSION,
    _yearmonth: yearmonth,
    _count: rows.length,
    _todo: 'Replace with real Parquet output (parquetjs-lite). See export-rge-dataset.ts.',
    _alternative_formats: ['rge-latest.csv', 'rge-latest.json'],
  }
  return Buffer.from(JSON.stringify(placeholder, null, 2), 'utf-8')
}

// ---------------------------------------------------------------------------
// Helpers — IO
// ---------------------------------------------------------------------------

function sha256(buf: Buffer | string): string {
  return createHash('sha256').update(buf).digest('hex')
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true })
}

async function writeFileAtomic(filepath: string, content: Buffer | string): Promise<number> {
  const tmp = `${filepath}.tmp-${process.pid}`
  const buf = typeof content === 'string' ? Buffer.from(content, 'utf-8') : content
  await fs.writeFile(tmp, buf)
  await fs.rename(tmp, filepath)
  return buf.byteLength
}

async function copyFile(src: string, dst: string): Promise<void> {
  await fs.copyFile(src, dst)
}

// ---------------------------------------------------------------------------
// DB fetch (paginé pour scaler à 50K+ providers)
// ---------------------------------------------------------------------------

async function fetchAllRgeProviders(): Promise<ProviderRow[]> {
  const supabase = createAdminClient()
  const out: ProviderRow[] = []
  let from = 0
  for (;;) {
    const { data, error } = await supabase
      .from('providers')
      .select(EXPORT_COLUMNS.join(','))
      .eq('is_active', true)
      .eq('noindex', false)
      .not('rge_qualifications', 'is', null)
      .order('siret', { ascending: true, nullsFirst: false })
      .range(from, from + PAGE_SIZE - 1)
    if (error) {
      throw new Error(`fetchAllRgeProviders failed at offset ${from}: ${error.message}`)
    }
    if (!data || data.length === 0) break
    // Cast unknown[] → ProviderRow[] : la liste de colonnes est figée par EXPORT_COLUMNS
    out.push(...(data as unknown as ProviderRow[]))
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }
  return out
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

function parseArgs(): { yearmonth: string; dryRun: boolean } {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const explicit = args.find((a) => /^\d{4}-\d{2}$/.test(a))
  const yearmonth = explicit ?? new Date().toISOString().slice(0, 7)
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(yearmonth)) {
    throw new Error(`Invalid yearmonth "${yearmonth}" — expected YYYY-MM`)
  }
  return { yearmonth, dryRun }
}

export async function exportRgeDataset(opts?: {
  yearmonth?: string
  dryRun?: boolean
}): Promise<ExportResult> {
  const yearmonth = opts?.yearmonth ?? new Date().toISOString().slice(0, 7)
  const dryRun = opts?.dryRun ?? false
  const startedAt = Date.now()
  const warnings: string[] = []

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      ok: false,
      yearmonth,
      count: 0,
      duration_ms: Date.now() - startedAt,
      output_dir: PUBLIC_DATASETS_DIR,
      files: [],
      warnings: ['Supabase env vars missing — aborting (stub mode).'],
    }
  }

  const rows = await fetchAllRgeProviders()
  const count = rows.length

  // Build artefacts en mémoire (50K rows ~ 30-60 MB CSV — OK pour Lambda 1GB)
  const csv = buildCsv(rows)
  const ndjson = buildNdjson(rows)
  const parquet = buildParquetStub(rows, yearmonth)
  warnings.push('Parquet output is currently a JSON stub — see TODO in source.')

  const csvName = `rge-${yearmonth}.csv`
  const jsonName = `rge-${yearmonth}.json`
  const parquetName = `rge-${yearmonth}.parquet`
  const metaName = `rge-${yearmonth}.meta.json`

  const csvBuf = Buffer.from(csv, 'utf-8')
  const ndjsonBuf = Buffer.from(ndjson, 'utf-8')

  const summary: ExportSummary = {
    yearmonth,
    count,
    generated_at: new Date().toISOString(),
    license: 'CC-BY-4.0',
    schema_version: SCHEMA_VERSION,
    files: [
      {
        name: csvName,
        bytes: csvBuf.byteLength,
        sha256: sha256(csvBuf),
        encoding_format: 'text/csv',
      },
      {
        name: jsonName,
        bytes: ndjsonBuf.byteLength,
        sha256: sha256(ndjsonBuf),
        encoding_format: 'application/x-ndjson',
      },
      {
        name: parquetName,
        bytes: parquet.byteLength,
        sha256: sha256(parquet),
        encoding_format: 'application/vnd.apache.parquet',
      },
    ],
  }

  if (dryRun) {
    return {
      ok: true,
      yearmonth,
      count,
      duration_ms: Date.now() - startedAt,
      output_dir: PUBLIC_DATASETS_DIR,
      files: summary.files.map((f) => f.name),
      warnings: [...warnings, 'Dry-run — nothing written to disk.'],
    }
  }

  await ensureDir(PUBLIC_DATASETS_DIR)

  const csvPath = path.join(PUBLIC_DATASETS_DIR, csvName)
  const jsonPath = path.join(PUBLIC_DATASETS_DIR, jsonName)
  const parquetPath = path.join(PUBLIC_DATASETS_DIR, parquetName)
  const metaPath = path.join(PUBLIC_DATASETS_DIR, metaName)

  await writeFileAtomic(csvPath, csvBuf)
  await writeFileAtomic(jsonPath, ndjsonBuf)
  await writeFileAtomic(parquetPath, parquet)
  await writeFileAtomic(metaPath, JSON.stringify(summary, null, 2) + '\n')

  // "rge-latest.{csv,json,parquet}" pour des URLs stables côté data.gouv.fr
  // On préfère la copie au symlink : multi-OS compatible (Vercel build = Linux,
  // dev = Windows ici) et pas de surprise avec git.
  await copyFile(csvPath, path.join(PUBLIC_DATASETS_DIR, 'rge-latest.csv'))
  await copyFile(jsonPath, path.join(PUBLIC_DATASETS_DIR, 'rge-latest.json'))
  await copyFile(parquetPath, path.join(PUBLIC_DATASETS_DIR, 'rge-latest.parquet'))
  await copyFile(metaPath, path.join(PUBLIC_DATASETS_DIR, 'rge-latest.meta.json'))

  return {
    ok: true,
    yearmonth,
    count,
    duration_ms: Date.now() - startedAt,
    output_dir: PUBLIC_DATASETS_DIR,
    files: [
      csvName,
      jsonName,
      parquetName,
      metaName,
      'rge-latest.csv',
      'rge-latest.json',
      'rge-latest.parquet',
      'rge-latest.meta.json',
    ],
    warnings,
  }
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

const isMain = (() => {
  // WHY: webpack inlines `import.meta.url` to the literal source path at bundle
  // time, so the previous ESM check always returned true inside the bundled
  // Next.js route handler — the CLI ran at module load during prerender, hit
  // Supabase and crashed the build (statement timeout). `process.argv[1]` is a
  // runtime value that bundlers cannot inline; it equals the entrypoint
  // script when run via `tsx`/`node` and is `next` (or similar) under Next.js.
  try {
    const arg1 = process.argv[1] ?? ''
    return /export-rge-dataset(?:\.ts|\.js|\.mjs|\.cjs)?$/.test(arg1)
  } catch {
    return false
  }
})()

if (isMain) {
  const { yearmonth, dryRun } = parseArgs()
  exportRgeDataset({ yearmonth, dryRun })
    .then((res) => {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(res, null, 2))
      process.exit(res.ok ? 0 : 1)
    })
    .catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err)
      // eslint-disable-next-line no-console
      console.error(`[export-rge-dataset] FAILED: ${msg}`)
      process.exit(1)
    })
}
