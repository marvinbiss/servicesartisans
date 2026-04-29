/**
 * Canary fingerprint — ULTRA DOMINATION SEO Phase 0
 *
 * For each pilot URL (15 villes×services + 5 hubs racines), fetches the live
 * HTML and produces a normalized fingerprint of:
 *
 *   - <title>
 *   - first <h1>
 *   - all <script type="application/ld+json"> blocks parsed and key-sorted
 *
 * The SHA-256 of the canonical JSON tuple {title, h1, jsonLd[]} is written
 * along with the raw snapshot so a Sprint 0.1 regression (broken h1, dropped
 * schema, empty body) is detectable in <1s.
 *
 * Usage:
 *   # Capture J+0 fingerprints
 *   npx tsx scripts/seo/canary-fingerprint.ts
 *
 *   # Override base URL (defaults to https://servicesartisans.fr)
 *   BASELINE_BASE_URL=https://staging.example.com npx tsx scripts/seo/canary-fingerprint.ts
 *
 *   # Diff a fresh capture against an earlier baseline file
 *   npx tsx scripts/seo/canary-fingerprint.ts --diff data/seo/fingerprints-2026-04-29.json
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import * as crypto from 'node:crypto'

// ----- types ----------------------------------------------------------------

type PilotConfig = {
  villes: string[]
  services: string[]
  urls: string[]
  hubs: string[]
}

type FetchResult = {
  url: string
  status: number
  fetched_at: string
  duration_ms: number
  title: string
  h1: string
  json_ld: unknown[]
  fingerprint: string
  error?: string
}

type FingerprintFile = {
  $schema_version: number
  base_url: string
  captured_at: string
  total_urls: number
  ok_count: number
  error_count: number
  results: FetchResult[]
}

// ----- IO helpers -----------------------------------------------------------

function repoRoot(): string {
  return path.resolve(__dirname, '..', '..')
}

function todayUtc(): string {
  const d = new Date()
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function loadPilot(root: string): PilotConfig {
  const p = path.join(root, 'data', 'seo', 'pilot-cities-2026-04-29.json')
  return JSON.parse(fs.readFileSync(p, 'utf-8')) as PilotConfig
}

// ----- HTML extraction (regex-based, no external dep) -----------------------

/**
 * Extract the inner text of the first <title> tag. Returns "" if absent.
 *
 * @param html Full HTML document.
 * @returns Title text without surrounding whitespace, HTML entities decoded.
 */
function extractTitle(html: string): string {
  const m = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html)
  if (!m) return ''
  return decodeEntities(stripTags(m[1])).trim()
}

/**
 * Extract the inner text of the first <h1> tag. Returns "" if absent.
 */
function extractFirstH1(html: string): string {
  const m = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html)
  if (!m) return ''
  return decodeEntities(stripTags(m[1])).replace(/\s+/g, ' ').trim()
}

/**
 * Extract all `<script type="application/ld+json">` blocks. Each block is
 * JSON-parsed; unparseable blocks are surfaced as `{ "_parse_error": "..." }`
 * so a regression that breaks JSON-LD is visible in the diff.
 */
function extractJsonLd(html: string): unknown[] {
  const out: unknown[] = []
  const re = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match: RegExpExecArray | null
  while ((match = re.exec(html)) !== null) {
    const raw = match[1].trim()
    if (!raw) continue
    try {
      out.push(JSON.parse(raw))
    } catch (err) {
      out.push({
        _parse_error: err instanceof Error ? err.message : String(err),
        _raw_preview: raw.slice(0, 200),
      })
    }
  }
  return out
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, '')
}

/**
 * Minimal HTML entity decoder for the named entities likely to appear in
 * <title> / <h1> French copy. Avoids pulling a dep for entity decoding.
 */
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&agrave;/g, 'à')
    .replace(/&ccedil;/g, 'ç')
    .replace(/&ucirc;/g, 'û')
    .replace(/&ocirc;/g, 'ô')
    .replace(/&icirc;/g, 'î')
    .replace(/&ecirc;/g, 'ê')
    .replace(/&acirc;/g, 'â')
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
}

// ----- canonicalization for stable hashing ---------------------------------

/**
 * Canonicalize an unknown JSON-LD value: object keys sorted recursively,
 * arrays preserved in order. Produces deterministic output for hashing.
 */
function canonicalize(input: unknown): unknown {
  if (input === null || typeof input !== 'object') return input
  if (Array.isArray(input)) return input.map((v) => canonicalize(v))
  const obj = input as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const k of Object.keys(obj).sort()) {
    out[k] = canonicalize(obj[k])
  }
  return out
}

function fingerprintTuple(title: string, h1: string, jsonLd: unknown[]): string {
  const sortedJsonLd = (canonicalize(jsonLd) as unknown[]).map((j) => JSON.stringify(j)).sort()
  const tuple = JSON.stringify({ title, h1, jsonLd: sortedJsonLd })
  return crypto.createHash('sha256').update(tuple).digest('hex')
}

// ----- network --------------------------------------------------------------

/**
 * Fetch a URL with a 15s timeout. Returns the raw HTML body (or empty on
 * non-2xx) plus status + duration. Errors are caught and returned as the
 * `error` field of the result so the script never aborts mid-run.
 */
async function fetchUrl(baseUrl: string, urlPath: string): Promise<FetchResult> {
  const fullUrl = `${baseUrl.replace(/\/+$/, '')}${urlPath}`
  const startedAt = Date.now()
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 15_000)
  try {
    const res = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'ServicesArtisans-Canary/1.0 (+https://servicesartisans.fr; baseline check)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
      signal: ctrl.signal,
    })
    const html = await res.text()
    const title = extractTitle(html)
    const h1 = extractFirstH1(html)
    const jsonLd = extractJsonLd(html)
    return {
      url: urlPath,
      status: res.status,
      fetched_at: new Date().toISOString(),
      duration_ms: Date.now() - startedAt,
      title,
      h1,
      json_ld: jsonLd,
      fingerprint: fingerprintTuple(title, h1, jsonLd),
    }
  } catch (err) {
    return {
      url: urlPath,
      status: 0,
      fetched_at: new Date().toISOString(),
      duration_ms: Date.now() - startedAt,
      title: '',
      h1: '',
      json_ld: [],
      fingerprint: '',
      error: err instanceof Error ? err.message : String(err),
    }
  } finally {
    clearTimeout(timer)
  }
}

// ----- diff mode ------------------------------------------------------------

type Divergence = {
  url: string
  kind: 'new' | 'removed' | 'changed'
  fields: string[]
  before?: { title?: string; h1?: string; fingerprint?: string; status?: number }
  after?: { title?: string; h1?: string; fingerprint?: string; status?: number }
}

function diffFiles(baseline: FingerprintFile, current: FingerprintFile): Divergence[] {
  const baseMap = new Map(baseline.results.map((r) => [r.url, r]))
  const curMap = new Map(current.results.map((r) => [r.url, r]))
  const divergences: Divergence[] = []

  for (const [url, b] of baseMap) {
    const c = curMap.get(url)
    if (!c) {
      divergences.push({
        url,
        kind: 'removed',
        fields: ['*'],
        before: { title: b.title, h1: b.h1, fingerprint: b.fingerprint, status: b.status },
      })
      continue
    }
    if (c.fingerprint === b.fingerprint && c.status === b.status) continue
    const fields: string[] = []
    if (c.status !== b.status) fields.push('status')
    if (c.title !== b.title) fields.push('title')
    if (c.h1 !== b.h1) fields.push('h1')
    if (c.fingerprint !== b.fingerprint && !fields.includes('title') && !fields.includes('h1')) {
      fields.push('json_ld')
    }
    if (fields.length > 0) {
      divergences.push({
        url,
        kind: 'changed',
        fields,
        before: { title: b.title, h1: b.h1, fingerprint: b.fingerprint, status: b.status },
        after: { title: c.title, h1: c.h1, fingerprint: c.fingerprint, status: c.status },
      })
    }
  }
  for (const [url, c] of curMap) {
    if (!baseMap.has(url)) {
      divergences.push({
        url,
        kind: 'new',
        fields: ['*'],
        after: { title: c.title, h1: c.h1, fingerprint: c.fingerprint, status: c.status },
      })
    }
  }
  return divergences
}

// ----- runner ---------------------------------------------------------------

async function captureAll(baseUrl: string, urls: string[]): Promise<FetchResult[]> {
  const results: FetchResult[] = []
  // Sequential: 20 URLs, gentle on prod, deterministic ordering.
  for (let i = 0; i < urls.length; i++) {
    const u = urls[i]
    process.stderr.write(`  [${i + 1}/${urls.length}] ${u} ... `)
    const r = await fetchUrl(baseUrl, u)
    if (r.error) {
      process.stderr.write(`ERR ${r.error}\n`)
    } else {
      process.stderr.write(`${r.status} ${r.duration_ms}ms ${r.fingerprint.slice(0, 12)}\n`)
    }
    results.push(r)
  }
  return results
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const diffIdx = args.indexOf('--diff')
  const root = repoRoot()
  const pilot = loadPilot(root)
  const allUrls = [...pilot.urls, ...pilot.hubs]
  const baseUrl = process.env.BASELINE_BASE_URL ?? 'https://servicesartisans.fr'

  console.error(`[canary-fingerprint] base=${baseUrl} urls=${allUrls.length}`)

  const results = await captureAll(baseUrl, allUrls)
  const okCount = results.filter((r) => r.status >= 200 && r.status < 300).length
  const errCount = results.length - okCount

  const out: FingerprintFile = {
    $schema_version: 1,
    base_url: baseUrl,
    captured_at: new Date().toISOString(),
    total_urls: results.length,
    ok_count: okCount,
    error_count: errCount,
    results,
  }

  if (diffIdx !== -1) {
    const baselineArg = args[diffIdx + 1]
    if (!baselineArg) {
      console.error('Missing path after --diff')
      process.exit(2)
    }
    const baselineAbs = path.isAbsolute(baselineArg) ? baselineArg : path.join(root, baselineArg)
    if (!fs.existsSync(baselineAbs)) {
      console.error(`Baseline file not found: ${baselineAbs}`)
      process.exit(2)
    }
    const baseline = JSON.parse(fs.readFileSync(baselineAbs, 'utf-8')) as FingerprintFile
    const divergences = diffFiles(baseline, out)
    const ts = new Date().toISOString().replace(/[:.]/g, '-')
    const diffOut = path.join(root, 'data', 'seo', `fingerprint-diff-${ts}.json`)
    fs.writeFileSync(diffOut, JSON.stringify({ baseline_path: baselineArg, divergences }, null, 2))
    console.error(`[canary-fingerprint] diff: ${divergences.length} divergences`)
    for (const d of divergences) {
      console.error(`  ${d.kind.toUpperCase().padEnd(8)} ${d.url}  fields=[${d.fields.join(',')}]`)
    }
    console.error(`  → ${path.relative(root, diffOut).replace(/\\/g, '/')}`)
    process.exitCode = divergences.length > 0 ? 1 : 0
    return
  }

  const date = todayUtc()
  const outFile = path.join(root, 'data', 'seo', `fingerprints-${date}.json`)
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2), 'utf-8')
  console.error(
    `[canary-fingerprint] ok=${okCount} err=${errCount} → ${path.relative(root, outFile).replace(/\\/g, '/')}`
  )
}

main().catch((err) => {
  console.error('[canary-fingerprint] fatal:', err)
  process.exit(1)
})
