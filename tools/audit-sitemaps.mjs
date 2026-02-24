#!/usr/bin/env node
/**
 * Sitemap Audit Script — Production runtime validator
 *
 * Fetches the sitemap index, parses child sitemaps, and validates:
 *   1. HTTP 200 + correct Content-Type header
 *   2. Well-formed XML (no unescaped entities, balanced tags)
 *   3. URL count per sitemap ≤ 50,000 (Google limit)
 *   4. Response size + latency metrics
 *
 * Usage:
 *   node tools/audit-sitemaps.mjs
 *   node tools/audit-sitemaps.mjs --sample 100
 *   node tools/audit-sitemaps.mjs --all --concurrency 20
 *   node tools/audit-sitemaps.mjs --strict --json
 *   node tools/audit-sitemaps.mjs --seed 42 --sample 50
 *   node tools/audit-sitemaps.mjs --url https://staging.servicesartisans.fr/sitemap.xml
 *
 * Exit code 1 if any checked sitemap fails.
 */

const SITE = 'https://servicesartisans.fr'
const DEFAULT_SAMPLE_SIZE = 50
const DEFAULT_CONCURRENCY = 10
const TIMEOUT_MS = 15_000
const GOOGLE_MAX_URLS = 50_000

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

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--url': sitemapUrl = args[++i]; break
      case '--sample': sampleSize = parseInt(args[++i], 10); break
      case '--concurrency': concurrency = parseInt(args[++i], 10); break
      case '--strict': strict = true; break
      case '--all': all = true; break
      case '--json': json = true; break
      case '--seed': seed = parseInt(args[++i], 10); break
    }
  }
  return { sitemapUrl, sampleSize, concurrency, strict, all, json, seed }
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

async function fetchWithTimeout(url, timeoutMs = TIMEOUT_MS) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timer)
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
  // Check balanced tags
  const openTags = text.match(/<[a-zA-Z][^/>\s]*[^/]?>/g) || []
  const closeTags = text.match(/<\/[a-zA-Z][^>]*>/g) || []
  const selfClosing = text.match(/<[a-zA-Z][^>]*\/>/g) || []
  const netOpen = openTags.length - selfClosing.length
  if (Math.abs(netOpen - closeTags.length) > 1) {
    return { ok: false, error: `Unbalanced tags: ${netOpen} open vs ${closeTags.length} close` }
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

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const { sitemapUrl, sampleSize, concurrency, strict, all, json, seed } = parseArgs()
  const rng = seed !== null ? mulberry32(seed) : Math.random

  if (!json) {
    console.log('\n🗺️  Sitemap Audit v2')
    console.log(`   Index URL:    ${sitemapUrl}`)
    console.log(`   Mode:         ${all ? 'ALL sitemaps' : `sample ${sampleSize}`}`)
    console.log(`   Concurrency:  ${concurrency}`)
    console.log(`   Strict:       ${strict}`)
    console.log(`   Seed:         ${seed !== null ? seed : 'random'}`)
    console.log()
  }

  // 1. Fetch sitemap index
  if (!json) console.log('📥 Fetching sitemap index...')
  let indexRes
  try {
    indexRes = await fetchWithTimeout(sitemapUrl)
  } catch (err) {
    const msg = `Failed to fetch sitemap index: ${err.message}`
    if (json) { console.log(JSON.stringify({ pass: false, error: msg })); process.exit(1) }
    console.error(`❌ ${msg}`)
    process.exit(1)
  }

  if (!indexRes.ok) {
    const msg = `Sitemap index returned HTTP ${indexRes.status}`
    if (json) { console.log(JSON.stringify({ pass: false, error: msg })); process.exit(1) }
    console.error(`❌ ${msg}`)
    process.exit(1)
  }

  // Validate content-type
  const indexContentType = indexRes.headers.get('content-type') || ''
  const indexCtOk = isXmlContentType(indexContentType)
  if (strict && !indexCtOk) {
    const msg = `Sitemap index Content-Type is not XML: "${indexContentType}"`
    if (json) { console.log(JSON.stringify({ pass: false, error: msg })); process.exit(1) }
    console.error(`❌ ${msg}`)
    process.exit(1)
  }

  const indexXml = await indexRes.text()
  const childLocs = extractLocs(indexXml)

  if (childLocs.length === 0) {
    const msg = 'No <loc> entries found in sitemap index'
    if (json) { console.log(JSON.stringify({ pass: false, error: msg })); process.exit(1) }
    console.error(`❌ ${msg}`)
    process.exit(1)
  }

  const indexCheck = isWellFormedXml(indexXml)
  if (!indexCheck.ok) {
    const msg = `Sitemap index XML error: ${indexCheck.error}`
    if (json) { console.log(JSON.stringify({ pass: false, error: msg })); process.exit(1) }
    console.error(`❌ ${msg}`)
    process.exit(1)
  }

  if (!json) {
    console.log(`   Found ${childLocs.length} child sitemaps`)
    console.log(`   Content-Type: ${indexContentType} ${indexCtOk ? '✅' : '⚠️'}`)
    console.log(`✅ Sitemap index is well-formed XML\n`)
  }

  // 2. Select sitemaps to test
  const sampled = all
    ? childLocs
    : sampleArray(childLocs, Math.min(sampleSize, childLocs.length), rng)

  if (!json) {
    console.log(`🔍 Testing ${sampled.length} sitemaps (concurrency: ${concurrency})...\n`)
  }

  // 3. Test each sitemap
  const results = await pMap(sampled, async (loc, idx) => {
    const label = `[${idx + 1}/${sampled.length}]`
    const startMs = Date.now()
    try {
      const res = await fetchWithTimeout(loc)
      const latencyMs = Date.now() - startMs

      if (!res.ok) {
        if (!json) console.error(`  ${label} ❌ HTTP ${res.status}  ${loc}`)
        return { loc, ok: false, reason: `HTTP ${res.status}`, latencyMs, urlCount: 0, sizeBytes: 0 }
      }

      const ct = res.headers.get('content-type') || ''
      const ctOk = isXmlContentType(ct)
      if (strict && !ctOk) {
        if (!json) console.error(`  ${label} ❌ Bad CT   ${loc}  (${ct})`)
        return { loc, ok: false, reason: `Content-Type: ${ct}`, latencyMs, urlCount: 0, sizeBytes: 0 }
      }

      const body = await res.text()
      const sizeBytes = new TextEncoder().encode(body).length
      const xmlCheck = isWellFormedXml(body)
      if (!xmlCheck.ok) {
        if (!json) console.error(`  ${label} ❌ Bad XML  ${loc}  (${xmlCheck.error})`)
        return { loc, ok: false, reason: xmlCheck.error, latencyMs, urlCount: 0, sizeBytes }
      }

      const urlCount = extractLocs(body).length
      const overLimit = urlCount > GOOGLE_MAX_URLS
      if (overLimit) {
        if (!json) console.error(`  ${label} ❌ >50k     ${loc}  (${urlCount} URLs)`)
        return { loc, ok: false, reason: `${urlCount} URLs exceeds Google 50k limit`, latencyMs, urlCount, sizeBytes }
      }

      if (!json) console.log(`  ${label} ✅ 200 OK   ${loc}  (${urlCount} URLs, ${latencyMs}ms, ${(sizeBytes / 1024).toFixed(0)}KB)`)
      return { loc, ok: true, latencyMs, urlCount, sizeBytes, contentTypeOk: ctOk }
    } catch (err) {
      const latencyMs = Date.now() - startMs
      if (!json) console.error(`  ${label} ❌ Error    ${loc}  (${err.message})`)
      return { loc, ok: false, reason: err.message, latencyMs, urlCount: 0, sizeBytes: 0 }
    }
  }, concurrency)

  // 4. Compute stats
  const passed = results.filter(r => r.ok)
  const failed = results.filter(r => !r.ok)
  const latencies = results.map(r => r.latencyMs).sort((a, b) => a - b)
  const sizes = results.filter(r => r.sizeBytes > 0).map(r => r.sizeBytes).sort((a, b) => a - b)
  const urlCounts = results.filter(r => r.urlCount > 0).map(r => r.urlCount).sort((a, b) => a - b)
  const totalUrls = results.reduce((sum, r) => sum + r.urlCount, 0)

  const stats = {
    tested: sampled.length,
    totalChildSitemaps: childLocs.length,
    passed: passed.length,
    failed: failed.length,
    successRate: `${((passed.length / sampled.length) * 100).toFixed(1)}%`,
    totalUrls,
    latency: {
      min: latencies[0] || 0,
      avg: Math.round(latencies.reduce((s, v) => s + v, 0) / (latencies.length || 1)),
      p95: percentile(latencies, 95),
      max: latencies[latencies.length - 1] || 0,
    },
    responseSize: {
      minKB: ((sizes[0] || 0) / 1024).toFixed(1),
      avgKB: (sizes.reduce((s, v) => s + v, 0) / (sizes.length || 1) / 1024).toFixed(1),
      maxKB: ((sizes[sizes.length - 1] || 0) / 1024).toFixed(1),
    },
    urlsPerSitemap: {
      min: urlCounts[0] || 0,
      avg: Math.round(urlCounts.reduce((s, v) => s + v, 0) / (urlCounts.length || 1)),
      max: urlCounts[urlCounts.length - 1] || 0,
    },
    failures: failed.map(f => ({ loc: f.loc, reason: f.reason })),
  }

  // 5. Output
  if (json) {
    console.log(JSON.stringify({ pass: failed.length === 0, stats }, null, 2))
  } else {
    console.log(`\n${'─'.repeat(60)}`)
    console.log('📊 Audit Report')
    console.log(`   Tested:          ${stats.tested} / ${stats.totalChildSitemaps}`)
    console.log(`   Passed:          ${stats.passed}`)
    console.log(`   Failed:          ${stats.failed}`)
    console.log(`   Success rate:    ${stats.successRate}`)
    console.log(`   Total URLs:      ${stats.totalUrls.toLocaleString()}`)
    console.log()
    console.log('   Latency (ms):    min=${stats.latency.min}  avg=${stats.latency.avg}  p95=${stats.latency.p95}  max=${stats.latency.max}')
    console.log(`   Latency (ms):    min=${stats.latency.min}  avg=${stats.latency.avg}  p95=${stats.latency.p95}  max=${stats.latency.max}`)
    console.log(`   Response size:   min=${stats.responseSize.minKB}KB  avg=${stats.responseSize.avgKB}KB  max=${stats.responseSize.maxKB}KB`)
    console.log(`   URLs/sitemap:    min=${stats.urlsPerSitemap.min}  avg=${stats.urlsPerSitemap.avg}  max=${stats.urlsPerSitemap.max}`)

    if (failed.length > 0) {
      console.log(`\n❌ AUDIT FAILED — ${failed.length} sitemap(s) had errors\n`)
      for (const f of stats.failures) {
        console.log(`   • ${f.loc}  →  ${f.reason}`)
      }
      console.log()
    } else {
      console.log(`\n✅ AUDIT PASSED — all ${passed.length} sampled sitemaps are valid\n`)
    }
  }

  process.exit(failed.length > 0 ? 1 : 0)
}

main().catch(err => {
  console.error(`\n💥 Unexpected error: ${err.message}\n`)
  process.exit(1)
})
