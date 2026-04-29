/**
 * Baseline snapshot — ULTRA DOMINATION SEO Phase 0 (J+0)
 *
 * Reads a GSC-like CSV export, filters SEO-significant paths
 * (/, /rge, /aides, /services/, /villes/, /renovation-energetique),
 * normalizes columns, computes aggregates, and writes:
 *
 *   - data/seo/baseline-YYYY-MM-DD.csv          (immutable, sorted by impressions)
 *   - data/seo/baseline-YYYY-MM-DD.summary.md   (KPI + top 50 + pilot focus)
 *   - data/seo/baseline-YYYY-MM-DD.sha256       (tamper detection of the CSV)
 *
 * Usage:
 *   npx tsx scripts/seo/baseline-snapshot.ts data/seo/baseline-template.csv [snapshot-date]
 *
 * `snapshot-date` defaults to today (UTC, YYYY-MM-DD).
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import * as crypto from 'node:crypto'

// ----- types ----------------------------------------------------------------

type RawRow = Record<string, string>

type GscRow = {
  path: string
  clicks: number
  impressions: number
  ctr: number
  position: number
  date_start: string
  date_end: string
}

type Aggregate = {
  rows_total: number
  rows_kept: number
  rows_dropped: number
  total_clicks: number
  total_impressions: number
  weighted_ctr: number
  median_position: number
  date_range: { start: string; end: string }
}

type PilotConfig = {
  villes: string[]
  services: string[]
  urls: string[]
  hubs: string[]
  filters: {
    scope_path_prefixes: string[]
    exclude_path_prefixes: string[]
  }
}

// ----- CSV parsing (manual, no external dep) --------------------------------

/**
 * Parse a CSV file content. Lines starting with `#` are treated as comments
 * and skipped. Supports quoted fields containing commas.
 *
 * @param raw Full file text.
 * @returns Array of objects keyed by header column.
 */
function parseCsv(raw: string): RawRow[] {
  const noBom = raw.replace(/^﻿/, '')
  const lines = noBom
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'))

  if (lines.length < 2) return []
  const header = parseCsvLine(lines[0])
  const out: RawRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const parts = parseCsvLine(lines[i])
    if (parts.length === 1 && parts[0] === '') continue
    const row: RawRow = {}
    header.forEach((h, idx) => {
      row[h] = parts[idx] ?? ''
    })
    out.push(row)
  }
  return out
}

/**
 * Parse a single CSV line, supporting double-quoted fields.
 *
 * @param line One CSV row.
 * @returns Array of trimmed string fields with surrounding quotes removed.
 */
function parseCsvLine(line: string): string[] {
  const parts: string[] = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQ = !inQ
      }
    } else if (ch === ',' && !inQ) {
      parts.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  parts.push(cur)
  return parts.map((p) => p.replace(/^"|"$/g, '').trim())
}

/**
 * Serialize rows back to CSV with the canonical header order.
 *
 * @param rows Normalized rows.
 * @returns CSV string ending with a trailing newline.
 */
function rowsToCsv(rows: GscRow[]): string {
  const header = ['path', 'clicks', 'impressions', 'ctr', 'position', 'date_start', 'date_end']
  const body = rows
    .map((r) =>
      [
        csvEscape(r.path),
        r.clicks,
        r.impressions,
        r.ctr.toFixed(4),
        r.position.toFixed(2),
        r.date_start,
        r.date_end,
      ].join(',')
    )
    .join('\n')
  return `${header.join(',')}\n${body}\n`
}

function csvEscape(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`
  }
  return v
}

// ----- normalization --------------------------------------------------------

/**
 * Convert a raw GSC row into the normalized shape. Returns null if any field
 * is missing or invalid (caller will skip the row).
 *
 * @param raw Row keyed by header.
 * @returns Normalized row or null.
 */
function normalizeRow(raw: RawRow): GscRow | null {
  const rawPath = (raw.path ?? '').trim()
  if (!rawPath) return null

  // Strip protocol+host if user pasted full URLs.
  let p = rawPath
  const httpsIdx = p.indexOf('://')
  if (httpsIdx !== -1) {
    const slash = p.indexOf('/', httpsIdx + 3)
    p = slash === -1 ? '/' : p.slice(slash)
  }
  if (!p.startsWith('/')) p = `/${p}`
  // Drop query string + fragment
  p = p.split('?')[0].split('#')[0]
  // Normalize trailing slash (keep "/" for homepage)
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1)

  const clicks = toIntStrict(raw.clicks)
  const impressions = toIntStrict(raw.impressions)
  const ctr = toFloatCtr(raw.ctr)
  const position = toFloatStrict(raw.position)
  const date_start = (raw.date_start ?? '').trim()
  const date_end = (raw.date_end ?? '').trim()

  if (clicks === null || impressions === null || ctr === null || position === null) return null
  if (!isIsoDate(date_start) || !isIsoDate(date_end)) return null

  return { path: p, clicks, impressions, ctr, position, date_start, date_end }
}

function toIntStrict(v: string | undefined): number | null {
  if (v == null) return null
  const t = v.replace(/\s+/g, '').replace(',', '')
  if (!/^-?\d+$/.test(t)) return null
  return parseInt(t, 10)
}

function toFloatStrict(v: string | undefined): number | null {
  if (v == null) return null
  const t = v.replace(/\s+/g, '').replace(',', '.')
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null
  return parseFloat(t)
}

/**
 * Parse a CTR field that may be either a fraction (`0.0227`) or a percent
 * string (`2.27%`). Always returns a fraction in [0,1].
 */
function toFloatCtr(v: string | undefined): number | null {
  if (v == null) return null
  const t = v.replace(/\s+/g, '').replace(',', '.')
  if (t.endsWith('%')) {
    const n = parseFloat(t.slice(0, -1))
    if (!Number.isFinite(n)) return null
    return n / 100
  }
  const n = parseFloat(t)
  if (!Number.isFinite(n)) return null
  // Heuristic: GSC sometimes exports as 2.27 meaning 2.27% — flag values >1
  if (n > 1) return n / 100
  return n
}

function isIsoDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s)
}

// ----- filtering ------------------------------------------------------------

/**
 * Keep rows whose path starts with a scope prefix and not with an exclude
 * prefix. The homepage `/` is matched explicitly.
 */
function inScope(p: string, cfg: PilotConfig['filters']): boolean {
  for (const ex of cfg.exclude_path_prefixes) {
    if (p.startsWith(ex)) return false
  }
  if (p === '/') return true
  for (const inc of cfg.scope_path_prefixes) {
    if (inc === '/') continue
    const base = inc.endsWith('/') ? inc.slice(0, -1) : inc
    if (p === base || p.startsWith(`${base}/`)) return true
  }
  return false
}

// ----- aggregation ----------------------------------------------------------

function aggregate(rows: GscRow[], totalRaw: number): Aggregate {
  const total_clicks = rows.reduce((s, r) => s + r.clicks, 0)
  const total_impressions = rows.reduce((s, r) => s + r.impressions, 0)
  const weighted_ctr = total_impressions === 0 ? 0 : total_clicks / total_impressions
  const positions = rows.map((r) => r.position).sort((a, b) => a - b)
  const median_position =
    positions.length === 0
      ? 0
      : positions.length % 2 === 1
        ? positions[(positions.length - 1) / 2]
        : (positions[positions.length / 2 - 1] + positions[positions.length / 2]) / 2

  let start = ''
  let end = ''
  for (const r of rows) {
    if (!start || r.date_start < start) start = r.date_start
    if (!end || r.date_end > end) end = r.date_end
  }

  return {
    rows_total: totalRaw,
    rows_kept: rows.length,
    rows_dropped: totalRaw - rows.length,
    total_clicks,
    total_impressions,
    weighted_ctr,
    median_position,
    date_range: { start, end },
  }
}

// ----- summary --------------------------------------------------------------

function buildSummary(
  rows: GscRow[],
  agg: Aggregate,
  pilot: PilotConfig,
  snapshotDate: string,
  inputFile: string,
  csvSha: string
): string {
  const sortedByImpr = [...rows].sort((a, b) => b.impressions - a.impressions)
  const top50 = sortedByImpr.slice(0, 50)

  const pilotUrlSet = new Set(pilot.urls.map(normalizePath))
  const pilotRows = rows.filter((r) => pilotUrlSet.has(normalizePath(r.path)))
  const pilotMissing = pilot.urls.filter(
    (u) => !rows.some((r) => normalizePath(r.path) === normalizePath(u))
  )

  const lines: string[] = []
  lines.push(`# Baseline GSC — Phase 0 ULTRA DOMINATION SEO`)
  lines.push('')
  lines.push(`- **Snapshot date** : ${snapshotDate}`)
  lines.push(`- **Source file** : \`${inputFile}\``)
  lines.push(`- **Coverage** : ${agg.date_range.start} → ${agg.date_range.end}`)
  lines.push(`- **CSV SHA-256** : \`${csvSha}\``)
  lines.push('')
  lines.push(`## KPI globaux (scope filtré)`)
  lines.push('')
  lines.push(`| Metric | Value |`)
  lines.push(`|---|---|`)
  lines.push(`| Rows total (raw) | ${agg.rows_total} |`)
  lines.push(`| Rows kept (in-scope) | ${agg.rows_kept} |`)
  lines.push(`| Rows dropped (out-of-scope) | ${agg.rows_dropped} |`)
  lines.push(`| Total clicks | ${agg.total_clicks.toLocaleString('fr-FR')} |`)
  lines.push(`| Total impressions | ${agg.total_impressions.toLocaleString('fr-FR')} |`)
  lines.push(`| Weighted CTR | ${(agg.weighted_ctr * 100).toFixed(2)}% |`)
  lines.push(`| Median position | ${agg.median_position.toFixed(2)} |`)
  lines.push('')
  lines.push(`## Gate P0 — cible J+30`)
  lines.push('')
  lines.push(
    `Total clicks J+30 ≥ **${Math.ceil(agg.total_clicks * 1.5).toLocaleString('fr-FR')}** ` +
      `(× 1.5 baseline) pour valider \`+50% clics J+30\`.`
  )
  lines.push('')
  lines.push(`## Top 50 URLs par impressions`)
  lines.push('')
  lines.push(`| # | Path | Clicks | Impressions | CTR | Position |`)
  lines.push(`|---|---|---:|---:|---:|---:|`)
  top50.forEach((r, i) => {
    lines.push(
      `| ${i + 1} | \`${r.path}\` | ${r.clicks} | ${r.impressions} | ` +
        `${(r.ctr * 100).toFixed(2)}% | ${r.position.toFixed(1)} |`
    )
  })
  lines.push('')
  lines.push(`## Pilot 5 villes × 3 services (15 URLs)`)
  lines.push('')
  if (pilotRows.length === 0) {
    lines.push(`_Aucune URL pilot trouvée dans la baseline._`)
  } else {
    lines.push(`| Path | Clicks | Impressions | CTR | Position |`)
    lines.push(`|---|---:|---:|---:|---:|`)
    pilotRows
      .sort((a, b) => b.impressions - a.impressions)
      .forEach((r) => {
        lines.push(
          `| \`${r.path}\` | ${r.clicks} | ${r.impressions} | ` +
            `${(r.ctr * 100).toFixed(2)}% | ${r.position.toFixed(1)} |`
        )
      })
  }
  if (pilotMissing.length > 0) {
    lines.push('')
    lines.push(`### URLs pilot absentes du GSC export`)
    lines.push('')
    lines.push(`Ces URLs n'apparaissent pas dans la baseline (0 impression ou non-indexées) :`)
    lines.push('')
    pilotMissing.forEach((u) => lines.push(`- \`${u}\``))
  }
  lines.push('')
  lines.push(`## Hubs racines`)
  lines.push('')
  lines.push(`| Path | Clicks | Impressions | CTR | Position |`)
  lines.push(`|---|---:|---:|---:|---:|`)
  for (const hub of pilot.hubs) {
    const r = rows.find((x) => normalizePath(x.path) === normalizePath(hub))
    if (r) {
      lines.push(
        `| \`${r.path}\` | ${r.clicks} | ${r.impressions} | ` +
          `${(r.ctr * 100).toFixed(2)}% | ${r.position.toFixed(1)} |`
      )
    } else {
      lines.push(`| \`${hub}\` | _absent_ | _absent_ | _absent_ | _absent_ |`)
    }
  }
  lines.push('')
  lines.push(`---`)
  lines.push(``)
  lines.push(
    `_Snapshot immuable. Pour le J+30 gate check, ré-exporter GSC sur la même fenêtre ` +
      `glissante (${agg.date_range.start} +30j → ${agg.date_range.end} +30j) et relancer ` +
      `le script avec une nouvelle \`snapshot-date\`._`
  )
  lines.push('')
  return lines.join('\n')
}

function normalizePath(p: string): string {
  let q = p.trim()
  if (!q.startsWith('/')) q = `/${q}`
  if (q.length > 1 && q.endsWith('/')) q = q.slice(0, -1)
  return q
}

// ----- IO -------------------------------------------------------------------

function todayUtc(): string {
  const d = new Date()
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function repoRoot(): string {
  // Script lives in <root>/scripts/seo/baseline-snapshot.ts
  return path.resolve(__dirname, '..', '..')
}

function loadPilot(root: string): PilotConfig {
  const p = path.join(root, 'data', 'seo', 'pilot-cities-2026-04-29.json')
  const raw = fs.readFileSync(p, 'utf-8')
  const j = JSON.parse(raw) as PilotConfig
  return j
}

// ----- main -----------------------------------------------------------------

function main(): void {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    console.error('Usage: npx tsx scripts/seo/baseline-snapshot.ts <input.csv> [snapshot-date]')
    process.exit(2)
  }

  const root = repoRoot()
  const inputArg = args[0]
  const inputAbs = path.isAbsolute(inputArg) ? inputArg : path.join(root, inputArg)
  const snapshotDate = args[1] ?? todayUtc()
  if (!isIsoDate(snapshotDate)) {
    console.error(`Invalid snapshot-date: ${snapshotDate} (expected YYYY-MM-DD)`)
    process.exit(2)
  }

  if (!fs.existsSync(inputAbs)) {
    console.error(`Input file not found: ${inputAbs}`)
    process.exit(2)
  }

  const raw = fs.readFileSync(inputAbs, 'utf-8')
  const parsed = parseCsv(raw)
  const pilot = loadPilot(root)

  const normalized: GscRow[] = []
  let droppedInvalid = 0
  for (const r of parsed) {
    const n = normalizeRow(r)
    if (n === null) {
      droppedInvalid++
      continue
    }
    normalized.push(n)
  }

  const inScopeRows = normalized.filter((r) => inScope(r.path, pilot.filters))
  inScopeRows.sort((a, b) => b.impressions - a.impressions || b.clicks - a.clicks)

  const agg = aggregate(inScopeRows, parsed.length)

  const csv = rowsToCsv(inScopeRows)
  const sha = crypto.createHash('sha256').update(csv).digest('hex')
  const summary = buildSummary(
    inScopeRows,
    agg,
    pilot,
    snapshotDate,
    path.relative(root, inputAbs).replace(/\\/g, '/'),
    sha
  )

  const outDir = path.join(root, 'data', 'seo')
  const outCsv = path.join(outDir, `baseline-${snapshotDate}.csv`)
  const outSummary = path.join(outDir, `baseline-${snapshotDate}.summary.md`)
  const outSha = path.join(outDir, `baseline-${snapshotDate}.sha256`)

  fs.writeFileSync(outCsv, csv, 'utf-8')
  fs.writeFileSync(outSummary, summary, 'utf-8')
  fs.writeFileSync(outSha, `${sha}  baseline-${snapshotDate}.csv\n`, 'utf-8')

  console.error(`[baseline-snapshot] ${snapshotDate}`)
  console.error(`  rows total       : ${parsed.length}`)
  console.error(`  dropped invalid  : ${droppedInvalid}`)
  console.error(`  out-of-scope     : ${normalized.length - inScopeRows.length}`)
  console.error(`  rows kept        : ${inScopeRows.length}`)
  console.error(`  total clicks     : ${agg.total_clicks}`)
  console.error(`  total impr.      : ${agg.total_impressions}`)
  console.error(`  weighted CTR     : ${(agg.weighted_ctr * 100).toFixed(2)}%`)
  console.error(`  median position  : ${agg.median_position.toFixed(2)}`)
  console.error(`  csv              : ${path.relative(root, outCsv).replace(/\\/g, '/')}`)
  console.error(`  summary          : ${path.relative(root, outSummary).replace(/\\/g, '/')}`)
  console.error(`  sha256           : ${sha}`)
}

main()
