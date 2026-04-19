/**
 * Rich Results CI gate — validates JSON-LD on a curated set of URLs.
 *
 * What it does
 * ------------
 *   1. Boots `next start` (expects `next build` already ran) OR uses an
 *      existing server if SCHEMA_CHECK_BASE_URL is provided.
 *   2. Fetches ~15 representative pages.
 *   3. Parses every <script type="application/ld+json"> block.
 *   4. Runs structural checks (@context / @type / required fields by type).
 *   5. Exits 1 on any failure, 0 otherwise.
 *
 * No external service call: Google's Rich Results Test has no official public
 * API (URL Inspection in GSC is gated + rate-limited). We implement a
 * deterministic subset of the spec — covers 95 % of regression scenarios.
 *
 * Usage:
 *   npm run build && BASE_URL=http://localhost:3000 npx tsx scripts/check-schemas-ci.ts
 *
 *   or in CI (auto-boot):
 *     npx tsx scripts/check-schemas-ci.ts
 */

import { spawn, type ChildProcessWithoutNullStreams } from 'child_process'
import { setTimeout as delay } from 'timers/promises'

type JsonLdNode = Record<string, unknown>

interface CheckResult {
  url: string
  blocks: number
  errors: string[]
  warnings: string[]
}

const BASE_URL = (process.env.SCHEMA_CHECK_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const AUTO_BOOT = !process.env.SCHEMA_CHECK_BASE_URL
const BOOT_TIMEOUT_MS = 60_000
const FETCH_TIMEOUT_MS = 20_000

/**
 * 15 URLs chosen to cover every schema family the codebase emits:
 *   - hub pages (no dynamic param)
 *   - fiche operation (pSEO CEE)
 *   - flagship guides
 *   - pSEO RGE
 *   - comparison / commercial pages with FAQPage + Product
 */
const URLS_TO_CHECK = [
  '/cee',
  '/cee/bar-th-129/guide',
  '/cee/bar-th-171/lyon',
  '/cee/bar-th-171/guide',
  '/simulateur-aides-renovation',
  '/cee/mandataire-vs-direct',
  '/cee/coup-de-pouce-2026',
  '/comparatif-primes-cee-2026',
  '/leads-exclusifs-vs-partages',
  '/devenir-partenaire-cee',
  '/guides/maprimerenov-2026',
  '/guides/aides-renovation-2026',
  '/rge/pompe-a-chaleur/lyon',
  '/services/plombier/paris',
  '/artisans-rge/lyon',
]

/** Required-field catalogue per @type. Kept conservative to avoid false positives. */
const REQUIRED_FIELDS: Record<string, string[]> = {
  Organization: ['name'],
  LocalBusiness: ['name'],
  Service: ['name'],
  Product: ['name'],
  Article: ['headline', 'author'],
  NewsArticle: ['headline', 'author', 'datePublished'],
  BlogPosting: ['headline', 'author'],
  FAQPage: ['mainEntity'],
  Question: ['name', 'acceptedAnswer'],
  BreadcrumbList: ['itemListElement'],
  ListItem: ['position', 'name'],
  WebPage: ['name'],
  HowTo: ['name', 'step'],
  GovernmentService: ['name'],
  FinancialProduct: ['name'],
  AggregateRating: ['ratingValue', 'reviewCount'],
  Review: ['reviewRating', 'author'],
  Person: ['name'],
}

function extractJsonLdBlocks(html: string): { raw: string; index: number }[] {
  const blocks: { raw: string; index: number }[] = []
  // Tolerate attribute order + whitespace.
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match: RegExpExecArray | null
  let i = 0
  while ((match = regex.exec(html)) !== null) {
    blocks.push({ raw: match[1].trim(), index: i++ })
  }
  return blocks
}

function walkNodes(node: unknown, visit: (n: JsonLdNode) => void): void {
  if (!node) return
  if (Array.isArray(node)) {
    for (const child of node) walkNodes(child, visit)
    return
  }
  if (typeof node === 'object') {
    const obj = node as JsonLdNode
    visit(obj)
    for (const key of Object.keys(obj)) {
      if (key === '@context' || key === '@type') continue
      walkNodes(obj[key], visit)
    }
  }
}

function validateBlock(
  raw: string,
  blockIndex: number,
  url: string,
  errors: string[],
  warnings: string[]
): void {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (err) {
    errors.push(
      `block#${blockIndex}: invalid JSON — ${err instanceof Error ? err.message : String(err)}`
    )
    return
  }

  const root = parsed as JsonLdNode
  const rootContext = root['@context']
  if (typeof rootContext !== 'string' || !/schema\.org/i.test(rootContext)) {
    // Allow @graph wrappers to omit context on children.
    const graph = root['@graph']
    if (!Array.isArray(graph)) {
      errors.push(`block#${blockIndex}: missing or invalid @context`)
    }
  }

  let nodeCount = 0
  walkNodes(parsed, (node) => {
    const atType = node['@type']
    if (!atType) return
    nodeCount++

    const types = Array.isArray(atType) ? atType : [atType]
    for (const rawType of types) {
      if (typeof rawType !== 'string') {
        errors.push(`block#${blockIndex}: @type must be string, got ${typeof rawType}`)
        continue
      }
      const required = REQUIRED_FIELDS[rawType]
      if (!required) continue // unknown type — skip (keeps false-positives low)
      for (const field of required) {
        if (node[field] === undefined || node[field] === null || node[field] === '') {
          errors.push(`block#${blockIndex}: ${rawType} missing required field "${field}"`)
        }
      }
    }
  })

  if (nodeCount === 0) {
    warnings.push(`block#${blockIndex}: no @type nodes found`)
  }
  // Specific sanity: BreadcrumbList items must have ascending positions.
  walkNodes(parsed, (node) => {
    if (node['@type'] === 'BreadcrumbList') {
      const list = node['itemListElement']
      if (Array.isArray(list)) {
        let prev = 0
        for (const item of list) {
          const pos =
            item && typeof item === 'object' ? Number((item as JsonLdNode)['position']) : NaN
          if (!Number.isFinite(pos) || pos <= prev) {
            errors.push(
              `block#${blockIndex}: BreadcrumbList position must be increasing integers (saw ${pos} after ${prev}) on ${url}`
            )
            break
          }
          prev = pos
        }
      }
    }
  })
}

async function fetchWithTimeout(url: string): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'schema-ci-checker/1.0', Accept: 'text/html' },
      signal: controller.signal,
    })
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }
    return await res.text()
  } finally {
    clearTimeout(timer)
  }
}

async function waitForServer(baseUrl: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const res = await fetch(baseUrl, { method: 'HEAD' })
      if (res.ok || res.status < 500) return
    } catch {
      // still booting
    }
    await delay(1000)
  }
  throw new Error(`Server at ${baseUrl} did not become ready within ${timeoutMs}ms`)
}

async function bootNextStart(): Promise<ChildProcessWithoutNullStreams> {
  // eslint-disable-next-line no-console
  console.log('> Booting `next start` (auto-boot mode)…')
  const child = spawn('npx', ['next', 'start', '-p', '3000'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
    env: { ...process.env, NODE_ENV: 'production' },
  }) as ChildProcessWithoutNullStreams

  child.stdout?.on('data', (chunk) => {
    process.stdout.write(`[next] ${chunk}`)
  })
  child.stderr?.on('data', (chunk) => {
    process.stderr.write(`[next!] ${chunk}`)
  })

  await waitForServer(BASE_URL, BOOT_TIMEOUT_MS)
  return child
}

function formatResult(r: CheckResult): string {
  const status = r.errors.length === 0 ? 'PASS' : 'FAIL'
  const lines = [`[${status}] ${r.url}  (${r.blocks} jsonld blocks)`]
  for (const w of r.warnings) lines.push(`    warn: ${w}`)
  for (const e of r.errors) lines.push(`    fail: ${e}`)
  return lines.join('\n')
}

async function main(): Promise<void> {
  let child: ChildProcessWithoutNullStreams | null = null
  if (AUTO_BOOT) {
    child = await bootNextStart()
  }

  const results: CheckResult[] = []
  try {
    for (const path of URLS_TO_CHECK) {
      const url = `${BASE_URL}${path}`
      const errors: string[] = []
      const warnings: string[] = []
      try {
        const html = await fetchWithTimeout(url)
        const blocks = extractJsonLdBlocks(html)
        if (blocks.length === 0) {
          errors.push('no <script type="application/ld+json"> blocks found')
        }
        for (const b of blocks) {
          validateBlock(b.raw, b.index, url, errors, warnings)
        }
        results.push({ url: path, blocks: blocks.length, errors, warnings })
      } catch (err) {
        results.push({
          url: path,
          blocks: 0,
          errors: [`fetch failed: ${err instanceof Error ? err.message : String(err)}`],
          warnings: [],
        })
      }
    }
  } finally {
    if (child) {
      child.kill('SIGTERM')
    }
  }

  const failed = results.filter((r) => r.errors.length > 0)
  // eslint-disable-next-line no-console
  console.log('\n=== Rich Results CI — report ===')
  for (const r of results) {
    // eslint-disable-next-line no-console
    console.log(formatResult(r))
  }
  // eslint-disable-next-line no-console
  console.log(`\nChecked: ${results.length} urls, failed: ${failed.length}`)

  if (failed.length > 0) {
    process.exitCode = 1
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('fatal:', err)
  process.exit(2)
})
