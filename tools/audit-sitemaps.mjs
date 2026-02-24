#!/usr/bin/env node
/**
 * Sitemap Audit Script
 *
 * Fetches the sitemap index from https://servicesartisans.fr/sitemap.xml,
 * extracts all <loc> child sitemaps, samples 50 of them, and verifies:
 *   1. HTTP 200 response
 *   2. Valid XML (well-formed check via DOMParser-like parsing)
 *
 * Exit code 1 if any sampled sitemap fails either check.
 *
 * Usage:
 *   node tools/audit-sitemaps.mjs
 *   node tools/audit-sitemaps.mjs --sample 100
 *   node tools/audit-sitemaps.mjs --url https://staging.servicesartisans.fr/sitemap.xml
 */

const SITE = 'https://servicesartisans.fr'
const DEFAULT_SAMPLE_SIZE = 50
const CONCURRENCY = 10
const TIMEOUT_MS = 15_000

// ── CLI args ───────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2)
  let sitemapUrl = `${SITE}/sitemap.xml`
  let sampleSize = DEFAULT_SAMPLE_SIZE

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      sitemapUrl = args[++i]
    } else if (args[i] === '--sample' && args[i + 1]) {
      sampleSize = parseInt(args[++i], 10)
    }
  }
  return { sitemapUrl, sampleSize }
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Fetch with timeout */
async function fetchWithTimeout(url, timeoutMs = TIMEOUT_MS) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal })
    return res
  } finally {
    clearTimeout(timer)
  }
}

/** Extract all <loc>...</loc> values from XML text */
function extractLocs(xml) {
  const locs = []
  const regex = /<loc>\s*(.*?)\s*<\/loc>/g
  let match
  while ((match = regex.exec(xml)) !== null) {
    locs.push(match[1].trim())
  }
  return locs
}

/** Minimal well-formedness check for XML */
function isWellFormedXml(text) {
  // Must start with <?xml or <urlset or <sitemapindex
  if (!text.trimStart().startsWith('<?xml') &&
      !text.trimStart().startsWith('<urlset') &&
      !text.trimStart().startsWith('<sitemapindex')) {
    return { ok: false, error: 'Does not start with valid XML declaration or root element' }
  }
  // Check balanced tags (lightweight)
  const openTags = text.match(/<[a-zA-Z][^/>\s]*[^/]?>/g) || []
  const closeTags = text.match(/<\/[a-zA-Z][^>]*>/g) || []
  // Self-closing don't count
  const selfClosing = text.match(/<[a-zA-Z][^>]*\/>/g) || []
  const netOpen = openTags.length - selfClosing.length
  if (Math.abs(netOpen - closeTags.length) > 1) {
    return { ok: false, error: `Unbalanced tags: ${netOpen} open vs ${closeTags.length} close` }
  }
  // Check for raw & not followed by amp; lt; gt; quot; apos; #
  const rawAmpersand = text.replace(/&(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);/g, '')
  if (rawAmpersand.includes('&')) {
    return { ok: false, error: 'Contains unescaped & character' }
  }
  return { ok: true }
}

/** Shuffle array (Fisher-Yates) and take first n */
function sampleArray(arr, n) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

/** Run tasks with concurrency limit */
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

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const { sitemapUrl, sampleSize } = parseArgs()

  console.log(`\n🗺️  Sitemap Audit`)
  console.log(`   Index URL:   ${sitemapUrl}`)
  console.log(`   Sample size: ${sampleSize}`)
  console.log()

  // 1. Fetch sitemap index
  console.log(`📥 Fetching sitemap index...`)
  let indexRes
  try {
    indexRes = await fetchWithTimeout(sitemapUrl)
  } catch (err) {
    console.error(`❌ Failed to fetch sitemap index: ${err.message}`)
    process.exit(1)
  }

  if (!indexRes.ok) {
    console.error(`❌ Sitemap index returned HTTP ${indexRes.status}`)
    process.exit(1)
  }

  const indexXml = await indexRes.text()
  const childLocs = extractLocs(indexXml)

  if (childLocs.length === 0) {
    console.error(`❌ No <loc> entries found in sitemap index`)
    process.exit(1)
  }

  console.log(`   Found ${childLocs.length} child sitemaps`)

  // 2. Validate sitemap index itself
  const indexCheck = isWellFormedXml(indexXml)
  if (!indexCheck.ok) {
    console.error(`❌ Sitemap index is not well-formed XML: ${indexCheck.error}`)
    process.exit(1)
  }
  console.log(`✅ Sitemap index is well-formed XML\n`)

  // 3. Sample child sitemaps
  const sampled = sampleArray(childLocs, Math.min(sampleSize, childLocs.length))
  console.log(`🔍 Testing ${sampled.length} sitemaps (concurrency: ${CONCURRENCY})...\n`)

  let failures = 0
  let successes = 0

  const results = await pMap(sampled, async (loc, idx) => {
    const label = `[${idx + 1}/${sampled.length}]`
    try {
      const res = await fetchWithTimeout(loc)
      if (!res.ok) {
        console.error(`  ${label} ❌ HTTP ${res.status}  ${loc}`)
        return { loc, ok: false, reason: `HTTP ${res.status}` }
      }

      const body = await res.text()
      const xmlCheck = isWellFormedXml(body)
      if (!xmlCheck.ok) {
        console.error(`  ${label} ❌ Bad XML   ${loc}  (${xmlCheck.error})`)
        return { loc, ok: false, reason: xmlCheck.error }
      }

      const urlCount = extractLocs(body).length
      console.log(`  ${label} ✅ 200 OK   ${loc}  (${urlCount} URLs)`)
      return { loc, ok: true, urlCount }
    } catch (err) {
      console.error(`  ${label} ❌ Error    ${loc}  (${err.message})`)
      return { loc, ok: false, reason: err.message }
    }
  }, CONCURRENCY)

  for (const r of results) {
    if (r.ok) successes++
    else failures++
  }

  // 4. Summary
  console.log(`\n${'─'.repeat(60)}`)
  console.log(`📊 Results: ${successes} passed, ${failures} failed, ${sampled.length} tested / ${childLocs.length} total`)

  if (failures > 0) {
    console.log(`\n❌ AUDIT FAILED — ${failures} sitemap(s) had errors\n`)
    const failedResults = results.filter(r => !r.ok)
    for (const f of failedResults) {
      console.log(`   • ${f.loc}  →  ${f.reason}`)
    }
    console.log()
    process.exit(1)
  }

  console.log(`\n✅ AUDIT PASSED — all ${successes} sampled sitemaps are valid\n`)
  process.exit(0)
}

main().catch(err => {
  console.error(`\n💥 Unexpected error: ${err.message}\n`)
  process.exit(1)
})
