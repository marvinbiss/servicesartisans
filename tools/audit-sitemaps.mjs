#!/usr/bin/env node
/**
 * Sitemap Audit Script v3 — Production runtime validator + SLO checker
 *
 * Fetches the sitemap index, parses child sitemaps, and validates:
 *   1. HTTP 200 + correct Content-Type header
 *   2. Well-formed XML (no unescaped entities, balanced tags)
 *   3. URL count per sitemap <= 50,000 (Google limit)
 *   4. XML size per sitemap <= 50 MB (Google limit)
 *   5. Response size + latency metrics
 *   6. SLO violation detection
 *   7. Delta comparison with previous run baseline
 *   8. Forensic metadata (git SHA, timestamp, result hash)
 *
 * Usage:
 *   node tools/audit-sitemaps.mjs
 *   node tools/audit-sitemaps.mjs --sample 100
 *   node tools/audit-sitemaps.mjs --all --concurrency 20
 *   node tools/audit-sitemaps.mjs --strict --json
 *   node tools/audit-sitemaps.mjs --seed 42 --sample 50
 *   node tools/audit-sitemaps.mjs --url https://staging.servicesartisans.fr/sitemap.xml
 *   node tools/audit-sitemaps.mjs --baseline sitemap-audit-baseline.json
 *   node tools/audit-sitemaps.mjs --slo          # enforce SLO thresholds
 *   node tools/audit-sitemaps.mjs --out report.json
 *
 * Exit code 1 if any checked sitemap fails or SLO is violated.
 */

import { execSync } from 'child_process'
import { createHash } from 'crypto'
import fs from 'fs'

const SCRIPT_VERSION = '4.0.0'
const SITE = 'https://servicesartisans.fr'
const DEFAULT_SAMPLE_SIZE = 50
const DEFAULT_CONCURRENCY = 10
const TIMEOUT_MS = 15_000
const GOOGLE_MAX_URLS = 50_000
const GOOGLE_MAX_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB uncompressed

// ── SLO Thresholds (from docs/sitemap/SLO-SLA.md) ──────────────────────────

const SLO = {
  INDEX_AVAILABILITY: true,             // SLO-01: index must return 200
  CHILD_200_RATE_CRITICAL: 0.995,       // SLO-02: 99.5%
  XML_VALIDITY_RATE: 1.0,              // SLO-03: 100% well-formed XML
  CONTENT_TYPE_RATE: 1.0,              // SLO-04: 100% application/xml
  P95_LATENCY_CRITICAL_MS: 2000,        // SLO-05
  P99_LATENCY_CRITICAL_MS: 5000,        // SLO-06
  EMPTY_SITEMAP_RATE_CRITICAL: 0.05,    // SLO-07: 5% for providers
  PROVIDER_DROPPED_RATIO_CRITICAL: 0.10,// SLO-08: <10%
  MAX_URLS_PER_SITEMAP: GOOGLE_MAX_URLS,// SLO-09
  MAX_SIZE_BYTES: GOOGLE_MAX_SIZE_BYTES,// SLO-10
  INDEX_CHILDREN_COHERENCE: 1.0,        // SLO-11: 100% resolvable children
  CHILD_COUNT_DELTA_CRITICAL_PCT: 0.25, // SLO-12: 25%
}

// ── CLI args ──────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2)
  let sitemapUrl = `${SITE}/sitemap.xml`
  let sampleSize = DEFAULT_SAMPLE_SIZE
  let concurrency = DEFAULT_CONCURRENCY
  let strict = false
  let all = false
  let json = false
  let seed = null
  let baselineFile = null
  let slo = false
  let outFile = null

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--url': sitemapUrl = args[++i]; break
      case '--sample': sampleSize = parseInt(args[++i], 10); break
      case '--concurrency': concurrency = parseInt(args[++i], 10); break
      case '--strict': strict = true; break
      case '--all': all = true; break
      case '--json': json = true; break
      case '--seed': seed = parseInt(args[++i], 10); break
      case '--baseline': baselineFile = args[++i]; break
      case '--slo': slo = true; break
      case '--out': outFile = args[++i]; break
    }
  }
  return { sitemapUrl, sampleSize, concurrency, strict, all, json, seed, baselineFile, slo, outFile }
}

// ── Seeded PRNG (Mulberry32) ──────────────────────────────────────────────────

function mulberry32(seed) {
  let s = seed | 0
  return function () {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGitSha() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()
  } catch {
    return null
  }
}

async function fetchWithTimeout(url, timeoutMs = TIMEOUT_MS, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timer)
      return res
    } catch (err) {
      clearTimeout(timer)
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000 // 1s, 2s backoff
        await new Promise(r => setTimeout(r, delay))
        continue
      }
      throw err
    }
  }
}

function extractLocs(xml) {
  const locs = []
  const regex = /<loc>\s*(.*?)\s*<\/loc>/g
  let match
  while ((match = regex.exec(xml)) !== null) {
    locs.push(match[1].trim())
  }
  return locs
}

function isWellFormedXml(text) {
  const trimmed = text.trimStart()
  if (!trimmed.startsWith('<?xml') &&
      !trimmed.startsWith('<urlset') &&
      !trimmed.startsWith('<sitemapindex')) {
    return { ok: false, error: 'Does not start with valid XML declaration or root element' }
  }
  // Check for unescaped &
  const cleaned = text.replace(/&(amp|lt|gt|quot|apos|#\d+|#x[\da-fA-F]+);/g, '')
  if (cleaned.includes('&')) {
    return { ok: false, error: 'Contains unescaped & character' }
  }
  // Check balanced tags (match all start tags including those with attributes)
  const allStartTags = text.match(/<[a-zA-Z][^>]*>/g) || []
  const selfClosing = allStartTags.filter(t => t.endsWith('/>'))
  const openTags = allStartTags.filter(t => !t.endsWith('/>'))
  const closeTags = text.match(/<\/[a-zA-Z][^>]*>/g) || []
  if (openTags.length !== closeTags.length) {
    return { ok: false, error: `Unbalanced tags: ${openTags.length} open vs ${closeTags.length} close` }
  }
  return { ok: true }
}

function isXmlContentType(contentType) {
  if (!contentType) return false
  return contentType.includes('xml') || contentType.includes('text/xml') || contentType.includes('application/xml')
}

function sampleArray(arr, n, rng = Math.random) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

async function pMap(items, fn, concurrency) {
  const results = []
  let i = 0
  async function worker() {
    while (i < items.length) {
      const idx = i++
      results[idx] = await fn(items[idx], idx)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()))
  return results
}

function percentile(sorted, p) {
  if (sorted.length === 0) return 0
  const idx = Math.ceil(sorted.length * p / 100) - 1
  return sorted[Math.max(0, idx)]
}

function hashObject(obj) {
  const str = JSON.stringify(obj, Object.keys(obj).sort())
  return 'sha256:' + createHash('sha256').update(str).digest('hex').slice(0, 16)
}

function loadBaseline(filePath) {
  try {
    if (!filePath || !fs.existsSync(filePath)) return null
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

// ── SLO checker ──────────────────────────────────────────────────────────────

function checkSloViolations(stats, baseline, indexOk = true) {
  const violations = []

  // SLO-01: Index availability (checked before this function, but enforce here too)
  if (!indexOk) {
    violations.push({
      slo: 'SLO-01',
      name: 'Index Availability',
      threshold: 'HTTP 200',
      actual: 'Index fetch failed',
      severity: 'critical',
    })
  }

  // SLO-02: Child 200 rate
  const successRate = stats.passed / (stats.tested || 1)
  if (successRate < SLO.CHILD_200_RATE_CRITICAL) {
    violations.push({
      slo: 'SLO-02',
      name: 'Child 200 Rate',
      threshold: `${(SLO.CHILD_200_RATE_CRITICAL * 100).toFixed(1)}%`,
      actual: `${(successRate * 100).toFixed(1)}%`,
      severity: 'critical',
    })
  }

  // SLO-03: XML validity rate (100%)
  if (stats.xmlInvalid > 0) {
    violations.push({
      slo: 'SLO-03',
      name: 'XML Validity Rate',
      threshold: '100%',
      actual: `${stats.xmlInvalid} invalid sitemap(s)`,
      severity: 'critical',
    })
  }

  // SLO-04: Content-Type correctness (100% — only enforced in strict mode)
  if (stats.contentTypeBad > 0) {
    violations.push({
      slo: 'SLO-04',
      name: 'Content-Type Correctness',
      threshold: '100% application/xml',
      actual: `${stats.contentTypeBad} non-XML Content-Type(s)`,
      severity: 'critical',
    })
  }

  // SLO-05: p95 latency
  if (stats.latency.p95 > SLO.P95_LATENCY_CRITICAL_MS) {
    violations.push({
      slo: 'SLO-05',
      name: 'p95 Latency',
      threshold: `${SLO.P95_LATENCY_CRITICAL_MS}ms`,
      actual: `${stats.latency.p95}ms`,
      severity: 'critical',
    })
  }

  // SLO-06: p99 latency
  if (stats.latency.p99 > SLO.P99_LATENCY_CRITICAL_MS) {
    violations.push({
      slo: 'SLO-06',
      name: 'p99 Latency',
      threshold: `${SLO.P99_LATENCY_CRITICAL_MS}ms`,
      actual: `${stats.latency.p99}ms`,
      severity: 'critical',
    })
  }

  // SLO-07: Empty sitemap rate (only for provider sitemaps)
  if (stats.emptySitemaps > 0 && stats.tested > 0) {
    const emptyRate = stats.emptySitemaps / stats.tested
    if (emptyRate > SLO.EMPTY_SITEMAP_RATE_CRITICAL) {
      violations.push({
        slo: 'SLO-07',
        name: 'Empty Sitemap Rate',
        threshold: `${(SLO.EMPTY_SITEMAP_RATE_CRITICAL * 100).toFixed(1)}%`,
        actual: `${(emptyRate * 100).toFixed(1)}%`,
        severity: 'critical',
      })
    }
  }

  // SLO-09: 50k URLs (already caught per-sitemap, but aggregate check)
  if (stats.urlsPerSitemap.max > SLO.MAX_URLS_PER_SITEMAP) {
    violations.push({
      slo: 'SLO-09',
      name: 'Google 50k URL Limit',
      threshold: `${SLO.MAX_URLS_PER_SITEMAP}`,
      actual: `${stats.urlsPerSitemap.max}`,
      severity: 'critical',
    })
  }

  // SLO-10: 50 MB size
  if (stats.responseSize.maxBytes > SLO.MAX_SIZE_BYTES) {
    violations.push({
      slo: 'SLO-10',
      name: 'XML Size Limit (50MB)',
      threshold: `${(SLO.MAX_SIZE_BYTES / 1024 / 1024).toFixed(0)}MB`,
      actual: `${(stats.responseSize.maxBytes / 1024 / 1024).toFixed(1)}MB`,
      severity: 'critical',
    })
  }

  // SLO-11: Index ↔ Children coherence (all tested children must be 200)
  if (stats.tested > 0 && stats.failed > 0) {
    const coherenceRate = stats.passed / stats.tested
    if (coherenceRate < SLO.INDEX_CHILDREN_COHERENCE) {
      violations.push({
        slo: 'SLO-11',
        name: 'Index ↔ Children Coherence',
        threshold: '100%',
        actual: `${(coherenceRate * 100).toFixed(1)}% (${stats.failed} unresolvable)`,
        severity: 'critical',
      })
    }
  }

  // SLO-12: Child count stability (requires baseline)
  if (baseline?.stats?.totalChildSitemaps && stats.totalChildSitemaps) {
    const prev = baseline.stats.totalChildSitemaps
    const curr = stats.totalChildSitemaps
    const deltaPct = Math.abs(curr - prev) / prev
    if (deltaPct > SLO.CHILD_COUNT_DELTA_CRITICAL_PCT) {
      violations.push({
        slo: 'SLO-12',
        name: 'Sitemap Count Stability',
        threshold: `${(SLO.CHILD_COUNT_DELTA_CRITICAL_PCT * 100).toFixed(0)}%`,
        actual: `${(deltaPct * 100).toFixed(1)}% (${prev} → ${curr})`,
        severity: 'critical',
      })
    }
  }

  return violations
}

// ── Delta computation ────────────────────────────────────────────────────────

function computeDelta(stats, baseline) {
  if (!baseline?.stats) {
    return null
  }
  const prev = baseline.stats
  const childCountDelta = stats.totalChildSitemaps - (prev.totalChildSitemaps || 0)
  const childCountDeltaPct = prev.totalChildSitemaps
    ? ((childCountDelta / prev.totalChildSitemaps) * 100).toFixed(1) + '%'
    : 'N/A'

  // Find new failures (present now but not in baseline)
  const prevFailLocs = new Set((prev.failures || []).map(f => f.loc))
  const currFailLocs = new Set((stats.failures || []).map(f => f.loc))
  const newFailures = (stats.failures || []).filter(f => !prevFailLocs.has(f.loc))
  const resolvedFailures = (prev.failures || []).filter(f => !currFailLocs.has(f.loc))

  const latencyDeltaAvgMs = (stats.latency?.avg || 0) - (prev.latency?.avg || 0)

  return {
    baselineFile: baseline._sourceFile || null,
    baselineTimestamp: baseline.timestamp || null,
    childCountDelta,
    childCountDeltaPct,
    totalUrlsDelta: stats.totalUrls - (prev.totalUrls || 0),
    newFailures,
    resolvedFailures,
    latencyDeltaAvgMs,
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const { sitemapUrl, sampleSize, concurrency, strict, all, json, seed, baselineFile, slo, outFile } = parseArgs()
  const rng = seed !== null ? mulberry32(seed) : Math.random
  const timestamp = new Date().toISOString()
  const gitSha = getGitSha()

  if (!json) {
    console.log('\n\u{1F5FA}\uFE0F  Sitemap Audit v3')
    console.log(`   Index URL:    ${sitemapUrl}`)
    console.log(`   Mode:         ${all ? 'ALL sitemaps' : `sample ${sampleSize}`}`)
    console.log(`   Concurrency:  ${concurrency}`)
    console.log(`   Strict:       ${strict}`)
    console.log(`   SLO enforce:  ${slo}`)
    console.log(`   Seed:         ${seed !== null ? seed : 'random'}`)
    console.log(`   Baseline:     ${baselineFile || 'none'}`)
    console.log(`   Git SHA:      ${gitSha || 'unknown'}`)
    console.log(`   Timestamp:    ${timestamp}`)
    console.log()
  }

  // 1. Fetch sitemap index
  if (!json) console.log('\u{1F4E5} Fetching sitemap index...')
  let indexRes
  try {
    indexRes = await fetchWithTimeout(sitemapUrl)
  } catch (err) {
    const msg = `Failed to fetch sitemap index: ${err.message}`
    if (json) { console.log(JSON.stringify({ pass: false, error: msg, version: SCRIPT_VERSION, timestamp, gitSha })); process.exit(1) }
    console.error(`\u274C ${msg}`)
    process.exit(1)
  }

  if (!indexRes.ok) {
    const msg = `Sitemap index returned HTTP ${indexRes.status}`
    if (json) { console.log(JSON.stringify({ pass: false, error: msg, version: SCRIPT_VERSION, timestamp, gitSha })); process.exit(1) }
    console.error(`\u274C ${msg}`)
    process.exit(1)
  }

  // Validate content-type
  const indexContentType = indexRes.headers.get('content-type') || ''
  const indexCtOk = isXmlContentType(indexContentType)
  if (strict && !indexCtOk) {
    const msg = `Sitemap index Content-Type is not XML: "${indexContentType}"`
    if (json) { console.log(JSON.stringify({ pass: false, error: msg, version: SCRIPT_VERSION, timestamp, gitSha })); process.exit(1) }
    console.error(`\u274C ${msg}`)
    process.exit(1)
  }

  const indexXml = await indexRes.text()
  const childLocs = extractLocs(indexXml)

  if (childLocs.length === 0) {
    const msg = 'No <loc> entries found in sitemap index'
    if (json) { console.log(JSON.stringify({ pass: false, error: msg, version: SCRIPT_VERSION, timestamp, gitSha })); process.exit(1) }
    console.error(`\u274C ${msg}`)
    process.exit(1)
  }

  const indexCheck = isWellFormedXml(indexXml)
  if (!indexCheck.ok) {
    const msg = `Sitemap index XML error: ${indexCheck.error}`
    if (json) { console.log(JSON.stringify({ pass: false, error: msg, version: SCRIPT_VERSION, timestamp, gitSha })); process.exit(1) }
    console.error(`\u274C ${msg}`)
    process.exit(1)
  }

  if (!json) {
    console.log(`   Found ${childLocs.length} child sitemaps`)
    console.log(`   Content-Type: ${indexContentType} ${indexCtOk ? '\u2705' : '\u26A0\uFE0F'}`)
    console.log(`\u2705 Sitemap index is well-formed XML\n`)
  }

  // 2. Select sitemaps to test
  const sampled = all
    ? childLocs
    : sampleArray(childLocs, Math.min(sampleSize, childLocs.length), rng)

  if (!json) {
    console.log(`\u{1F50D} Testing ${sampled.length} sitemaps (concurrency: ${concurrency})...\n`)
  }

  // 3. Test each sitemap
  const results = await pMap(sampled, async (loc, idx) => {
    const label = `[${idx + 1}/${sampled.length}]`
    const startMs = Date.now()
    try {
      const res = await fetchWithTimeout(loc)
      const latencyMs = Date.now() - startMs

      if (!res.ok) {
        if (!json) console.error(`  ${label} \u274C HTTP ${res.status}  ${loc}`)
        return { loc, ok: false, reason: `HTTP ${res.status}`, latencyMs, urlCount: 0, sizeBytes: 0 }
      }

      const ct = res.headers.get('content-type') || ''
      const ctOk = isXmlContentType(ct)
      if (strict && !ctOk) {
        if (!json) console.error(`  ${label} \u274C Bad CT   ${loc}  (${ct})`)
        return { loc, ok: false, reason: `Content-Type: ${ct}`, latencyMs, urlCount: 0, sizeBytes: 0 }
      }

      const body = await res.text()
      const sizeBytes = new TextEncoder().encode(body).length
      const xmlCheck = isWellFormedXml(body)
      if (!xmlCheck.ok) {
        if (!json) console.error(`  ${label} \u274C Bad XML  ${loc}  (${xmlCheck.error})`)
        return { loc, ok: false, reason: xmlCheck.error, latencyMs, urlCount: 0, sizeBytes, xmlInvalid: true }
      }

      const urlCount = extractLocs(body).length
      const overLimit = urlCount > GOOGLE_MAX_URLS
      if (overLimit) {
        if (!json) console.error(`  ${label} \u274C >50k     ${loc}  (${urlCount} URLs)`)
        return { loc, ok: false, reason: `${urlCount} URLs exceeds Google 50k limit`, latencyMs, urlCount, sizeBytes }
      }

      const overSize = sizeBytes > GOOGLE_MAX_SIZE_BYTES
      if (overSize) {
        if (!json) console.error(`  ${label} \u274C >50MB    ${loc}  (${(sizeBytes / 1024 / 1024).toFixed(1)}MB)`)
        return { loc, ok: false, reason: `${(sizeBytes / 1024 / 1024).toFixed(1)}MB exceeds Google 50MB limit`, latencyMs, urlCount, sizeBytes }
      }

      // Check caching headers
      const cacheControl = res.headers.get('cache-control') || ''
      const hasSMaxAge = /s-maxage=\d+/.test(cacheControl)

      if (!json) console.log(`  ${label} \u2705 200 OK   ${loc}  (${urlCount} URLs, ${latencyMs}ms, ${(sizeBytes / 1024).toFixed(0)}KB)`)
      return { loc, ok: true, latencyMs, urlCount, sizeBytes, contentTypeOk: ctOk, hasSMaxAge }
    } catch (err) {
      const latencyMs = Date.now() - startMs
      if (!json) console.error(`  ${label} \u274C Error    ${loc}  (${err.message})`)
      return { loc, ok: false, reason: err.message, latencyMs, urlCount: 0, sizeBytes: 0 }
    }
  }, concurrency)

  // 4. Compute stats
  const passed = results.filter(r => r.ok)
  const failed = results.filter(r => !r.ok)
  const emptySitemaps = results.filter(r => r.ok && r.urlCount === 0).length
  const xmlInvalid = results.filter(r => r.xmlInvalid).length
  const contentTypeBad = results.filter(r => r.ok && r.contentTypeOk === false).length
  const latencies = results.map(r => r.latencyMs).sort((a, b) => a - b)
  const sizes = results.filter(r => r.sizeBytes > 0).map(r => r.sizeBytes).sort((a, b) => a - b)
  const urlCounts = results.filter(r => r.urlCount > 0).map(r => r.urlCount).sort((a, b) => a - b)
  const totalUrls = results.reduce((sum, r) => sum + r.urlCount, 0)
  const maxBytes = sizes.length > 0 ? sizes[sizes.length - 1] : 0
  const missingCacheHeaders = results.filter(r => r.ok && !r.hasSMaxAge).length

  const stats = {
    tested: sampled.length,
    totalChildSitemaps: childLocs.length,
    passed: passed.length,
    failed: failed.length,
    successRate: `${((passed.length / sampled.length) * 100).toFixed(1)}%`,
    totalUrls,
    emptySitemaps,
    emptySitemapRate: `${((emptySitemaps / (sampled.length || 1)) * 100).toFixed(1)}%`,
    xmlInvalid,
    contentTypeBad,
    missingCacheHeaders,
    latency: {
      min: latencies[0] || 0,
      avg: Math.round(latencies.reduce((s, v) => s + v, 0) / (latencies.length || 1)),
      p95: percentile(latencies, 95),
      p99: percentile(latencies, 99),
      max: latencies[latencies.length - 1] || 0,
    },
    responseSize: {
      minKB: ((sizes[0] || 0) / 1024).toFixed(1),
      avgKB: (sizes.reduce((s, v) => s + v, 0) / (sizes.length || 1) / 1024).toFixed(1),
      maxKB: ((sizes[sizes.length - 1] || 0) / 1024).toFixed(1),
      maxBytes,
    },
    urlsPerSitemap: {
      min: urlCounts[0] || 0,
      avg: Math.round(urlCounts.reduce((s, v) => s + v, 0) / (urlCounts.length || 1)),
      max: urlCounts[urlCounts.length - 1] || 0,
    },
    failures: failed.map(f => ({ loc: f.loc, reason: f.reason })),
  }

  // 5. SLO check
  const baseline = loadBaseline(baselineFile)
  if (baseline) baseline._sourceFile = baselineFile
  const sloViolations = checkSloViolations(stats, baseline, true /* indexOk — we got past index fetch */)
  stats.sloViolations = sloViolations

  // 6. Delta computation
  const delta = computeDelta(stats, baseline)

  // 7. Build result hash for forensic comparison
  const resultHash = hashObject({
    totalChildSitemaps: stats.totalChildSitemaps,
    passed: stats.passed,
    failed: stats.failed,
    totalUrls: stats.totalUrls,
    failureLocs: stats.failures.map(f => f.loc).sort(),
  })

  // 8. Output
  const report = {
    pass: failed.length === 0 && (!slo || sloViolations.length === 0),
    version: SCRIPT_VERSION,
    timestamp,
    gitSha,
    targetUrl: sitemapUrl,
    mode: all ? 'all' : `sample-${sampled.length}`,
    seed: seed !== null ? seed : null,
    concurrency,
    strict,
    sloEnforced: slo,
    resultHash,
    stats,
    delta,
  }

  if (json) {
    const output = JSON.stringify(report, null, 2)
    console.log(output)
    if (outFile) fs.writeFileSync(outFile, output, 'utf-8')
  } else {
    console.log(`\n${'─'.repeat(60)}`)
    console.log('\u{1F4CA} Audit Report')
    console.log(`   Version:          ${SCRIPT_VERSION}`)
    console.log(`   Git SHA:          ${gitSha || 'unknown'}`)
    console.log(`   Result hash:      ${resultHash}`)
    console.log(`   Tested:           ${stats.tested} / ${stats.totalChildSitemaps}`)
    console.log(`   Passed:           ${stats.passed}`)
    console.log(`   Failed:           ${stats.failed}`)
    console.log(`   Empty sitemaps:   ${stats.emptySitemaps} (${stats.emptySitemapRate})`)
    console.log(`   Missing s-maxage: ${stats.missingCacheHeaders}`)
    console.log(`   Success rate:     ${stats.successRate}`)
    console.log(`   Total URLs:       ${stats.totalUrls.toLocaleString()}`)
    console.log()
    console.log(`   Latency (ms):     min=${stats.latency.min}  avg=${stats.latency.avg}  p95=${stats.latency.p95}  p99=${stats.latency.p99}  max=${stats.latency.max}`)
    console.log(`   Response size:    min=${stats.responseSize.minKB}KB  avg=${stats.responseSize.avgKB}KB  max=${stats.responseSize.maxKB}KB`)
    console.log(`   URLs/sitemap:     min=${stats.urlsPerSitemap.min}  avg=${stats.urlsPerSitemap.avg}  max=${stats.urlsPerSitemap.max}`)

    if (delta) {
      console.log()
      console.log(`   \u{1F4C8} Delta vs baseline`)
      console.log(`   Baseline:         ${delta.baselineFile || 'N/A'} (${delta.baselineTimestamp || 'N/A'})`)
      console.log(`   Child count:      ${delta.childCountDelta >= 0 ? '+' : ''}${delta.childCountDelta} (${delta.childCountDeltaPct})`)
      console.log(`   Total URLs:       ${delta.totalUrlsDelta >= 0 ? '+' : ''}${delta.totalUrlsDelta}`)
      console.log(`   Latency avg:      ${delta.latencyDeltaAvgMs >= 0 ? '+' : ''}${delta.latencyDeltaAvgMs}ms`)
      if (delta.newFailures.length > 0) {
        console.log(`   New failures:     ${delta.newFailures.length}`)
        for (const f of delta.newFailures) console.log(`     \u{1F534} ${f.loc} \u2192 ${f.reason}`)
      }
      if (delta.resolvedFailures.length > 0) {
        console.log(`   Resolved:         ${delta.resolvedFailures.length}`)
        for (const f of delta.resolvedFailures) console.log(`     \u{1F7E2} ${f.loc}`)
      }
    }

    if (sloViolations.length > 0) {
      console.log()
      console.log(`   \u{1F6A8} SLO VIOLATIONS (${sloViolations.length})`)
      for (const v of sloViolations) {
        console.log(`     ${v.severity === 'critical' ? '\u{1F534}' : '\u{1F7E1}'} ${v.slo} ${v.name}: ${v.actual} (threshold: ${v.threshold})`)
      }
    }

    if (failed.length > 0) {
      console.log(`\n\u274C AUDIT FAILED \u2014 ${failed.length} sitemap(s) had errors\n`)
      for (const f of stats.failures) {
        console.log(`   \u2022 ${f.loc}  \u2192  ${f.reason}`)
      }
      console.log()
    } else if (slo && sloViolations.length > 0) {
      console.log(`\n\u274C AUDIT FAILED \u2014 ${sloViolations.length} SLO violation(s)\n`)
    } else {
      console.log(`\n\u2705 AUDIT PASSED \u2014 all ${passed.length} sampled sitemaps are valid\n`)
    }

    if (outFile) {
      fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf-8')
      console.log(`   \u{1F4BE} Report saved to ${outFile}\n`)
    }
  }

  const exitCode = (failed.length > 0 || (slo && sloViolations.length > 0)) ? 1 : 0
  process.exit(exitCode)
}

main().catch(err => {
  console.error(`\n\u{1F4A5} Unexpected error: ${err.message}\n`)
  process.exit(1)
})
