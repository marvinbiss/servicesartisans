#!/usr/bin/env node
/**
 * Full cache warmup — sitemap-driven, 100% coverage.
 *
 * Parses the sitemap index → fetches every sub-sitemap → extracts all URLs →
 * crawls them with controlled concurrency. Reports broken pages.
 *
 * Designed to run in GitHub Actions post-deploy (no timeout constraint).
 * Can also be run locally: node scripts/cache-warmup-full.mjs
 *
 * Env vars:
 *   SITE_URL        — defaults to https://servicesartisans.fr
 *   CONCURRENCY     — parallel requests (default 80)
 *   REQUEST_TIMEOUT — per-request timeout ms (default 10000)
 *   DRY_RUN         — if "true", only parse sitemaps without fetching pages
 *   TIER            — "all" (default), "1" (top pages only ~5K), "2" (~50K strategic)
 */

const SITE_URL = (process.env.SITE_URL || 'https://servicesartisans.fr').replace(/\/+$/, '')
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '80', 10)
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || '10000', 10)
const DRY_RUN = process.env.DRY_RUN === 'true'
const TIER = process.env.TIER || 'all'

// ── Helpers ──────────────────────────────────────────────────────────────────

function extractFromXml(xml, tag) {
  const regex = new RegExp(`<${tag}>([^<]+)</${tag}>`, 'g')
  const results = []
  let match
  while ((match = regex.exec(xml)) !== null) {
    results.push(match[1].trim())
  }
  return results
}

async function fetchXml(url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'SA-CacheWarmup/2.0' },
        signal: AbortSignal.timeout(30_000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.text()
    } catch (err) {
      if (attempt === retries) throw err
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
    }
  }
}

// ── Sitemap parsing ──────────────────────────────────────────────────────────

async function getAllUrls() {
  console.log(`\n📡 Fetching sitemap index: ${SITE_URL}/sitemap.xml`)
  const indexXml = await fetchXml(`${SITE_URL}/sitemap.xml`)
  const sitemapUrls = extractFromXml(indexXml, 'loc')

  console.log(`   Found ${sitemapUrls.length} sub-sitemaps\n`)

  const allUrls = []
  const sitemapStats = []

  // Fetch sub-sitemaps in parallel (batches of 10)
  for (let i = 0; i < sitemapUrls.length; i += 10) {
    const batch = sitemapUrls.slice(i, i + 10)
    const results = await Promise.allSettled(
      batch.map(async (url) => {
        const xml = await fetchXml(url)
        const urls = extractFromXml(xml, 'loc')
        return { url, count: urls.length, urls }
      })
    )

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { url, count, urls } = result.value
        const name = url.split('/').pop() || url
        sitemapStats.push({ name, count })
        allUrls.push(...urls)
        process.stdout.write(`   ✓ ${name} — ${count.toLocaleString()} URLs\n`)
      } else {
        const failedUrl = batch[results.indexOf(result)]
        console.error(`   ✗ ${failedUrl} — ${result.reason.message}`)
        sitemapStats.push({ name: failedUrl, count: 0, error: true })
      }
    }
  }

  return { allUrls, sitemapStats }
}

// ── Tiered filtering ─────────────────────────────────────────────────────────

function filterByTier(urls) {
  if (TIER === 'all') return urls

  // Priority patterns — ordered by business value
  const tier1Patterns = [
    /^\/$/, // homepage
    /^\/services$/,
    /^\/services\/[^/]+$/,  // service hubs
    /^\/villes\/[^/]+$/,    // city hubs
    /^\/departements\/[^/]+$/, // dept hubs
    /^\/regions\/[^/]+$/,
    /^\/blog/,
    /^\/contact$/,
    /^\/faq$/,
    /^\/devis$/,
    /^\/urgence$/,
    /^\/tarifs$/,
    /^\/a-propos$/,
    /^\/artisans\/[^/]+$/,  // artisan pages
  ]

  const tier2Patterns = [
    ...tier1Patterns,
    /^\/services\/[^/]+\/[^/]+$/,  // service×ville
    /^\/devis\/[^/]+\/[^/]+$/,     // devis×ville
    /^\/tarifs\/[^/]+\/[^/]+$/,    // tarifs×ville
    /^\/urgence\/[^/]+\/[^/]+$/,   // urgence×ville
    /^\/departements\/[^/]+\/[^/]+$/, // dept×service
    /^\/avis/,
  ]

  const patterns = TIER === '1' ? tier1Patterns : tier2Patterns

  return urls.filter(url => {
    const path = url.replace(SITE_URL, '') || '/'
    return patterns.some(p => p.test(path))
  })
}

// ── Concurrent crawler ───────────────────────────────────────────────────────

async function warmUrls(urls) {
  const stats = {
    total: urls.length,
    ok: 0,
    errors: [],       // { url, status, error }
    redirects: 0,
    cacheHits: 0,     // x-vercel-cache: HIT (already cached)
    cacheMisses: 0,   // x-vercel-cache: MISS (freshly rendered — warmup working)
    startTime: Date.now(),
  }

  let processed = 0
  const queue = [...urls]
  const active = new Set()

  function logProgress() {
    const pct = ((processed / stats.total) * 100).toFixed(1)
    const elapsed = ((Date.now() - stats.startTime) / 1000).toFixed(0)
    const rate = (processed / (elapsed || 1)).toFixed(0)
    const errCount = stats.errors.length
    process.stdout.write(
      `\r   🔥 ${processed.toLocaleString()}/${stats.total.toLocaleString()} (${pct}%) — ${rate} req/s — ${errCount} errors — ${elapsed}s`
    )
  }

  async function processUrl(url) {
    try {
      // GET (not HEAD) — required to trigger Vercel ISR cache population.
      // Body is consumed but discarded to free memory immediately.
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'SA-CacheWarmup/2.0',
          // Minimal response — skip images/fonts if CDN respects this
          'Accept': 'text/html',
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT),
        redirect: 'manual',
      })

      // Drain body to avoid memory leaks
      await res.text().catch(() => {})

      const cacheStatus = res.headers.get('x-vercel-cache') || ''
      if (res.status >= 200 && res.status < 300) {
        stats.ok++
        if (cacheStatus === 'MISS') stats.cacheMisses++
        else if (cacheStatus === 'HIT') stats.cacheHits++
      } else if (res.status >= 300 && res.status < 400) {
        stats.redirects++
      } else {
        stats.errors.push({ url, status: res.status })
      }
    } catch (err) {
      stats.errors.push({ url, error: err.message })
    }

    processed++
    if (processed % 200 === 0 || processed === stats.total) {
      logProgress()
    }
  }

  // Worker pool
  async function worker() {
    while (queue.length > 0) {
      const url = queue.shift()
      if (!url) break
      active.add(url)
      await processUrl(url)
      active.delete(url)
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker())
  await Promise.all(workers)

  process.stdout.write('\n')
  return stats
}

// ── Report ───────────────────────────────────────────────────────────────────

function printReport(stats, sitemapStats) {
  const duration = ((Date.now() - stats.startTime) / 1000).toFixed(1)
  const rate = (stats.total / (duration || 1)).toFixed(0)

  console.log('\n' + '═'.repeat(70))
  console.log('  CACHE WARMUP REPORT')
  console.log('═'.repeat(70))
  console.log(`  Site:         ${SITE_URL}`)
  console.log(`  Tier:         ${TIER}`)
  console.log(`  Concurrency:  ${CONCURRENCY}`)
  console.log(`  Duration:     ${duration}s`)
  console.log(`  Rate:         ${rate} req/s`)
  console.log('─'.repeat(70))
  console.log(`  Total URLs:   ${stats.total.toLocaleString()}`)
  console.log(`  ✓ OK (2xx):   ${stats.ok.toLocaleString()}`)
  console.log(`    Cache HIT:  ${stats.cacheHits.toLocaleString()} (already cached)`)
  console.log(`    Cache MISS: ${stats.cacheMisses.toLocaleString()} (freshly rendered)`)
  console.log(`  → Redirects:  ${stats.redirects.toLocaleString()}`)
  console.log(`  ✗ Errors:     ${stats.errors.length.toLocaleString()}`)
  console.log('─'.repeat(70))

  // Sitemap breakdown
  console.log('\n  Sitemaps:')
  for (const s of sitemapStats) {
    const icon = s.error ? '✗' : '✓'
    console.log(`    ${icon} ${s.name}: ${s.count.toLocaleString()} URLs`)
  }

  // Error details (grouped by status)
  if (stats.errors.length > 0) {
    console.log('\n  Errors by type:')
    const grouped = {}
    for (const e of stats.errors) {
      const key = e.status ? `HTTP ${e.status}` : (e.error || 'Unknown')
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(e.url)
    }
    for (const [type, urls] of Object.entries(grouped).sort((a, b) => b[1].length - a[1].length)) {
      console.log(`    ${type}: ${urls.length} pages`)
      // Show first 5 examples
      for (const url of urls.slice(0, 5)) {
        console.log(`      - ${url.replace(SITE_URL, '')}`)
      }
      if (urls.length > 5) {
        console.log(`      ... and ${urls.length - 5} more`)
      }
    }
  }

  console.log('\n' + '═'.repeat(70))

  // Exit code for CI — fail if >1% error rate
  const errorRate = stats.errors.length / stats.total
  if (errorRate > 0.01) {
    console.log(`\n❌ Error rate ${(errorRate * 100).toFixed(2)}% exceeds 1% threshold`)
    return 1
  }
  if (stats.errors.length > 0) {
    console.log(`\n⚠️  ${stats.errors.length} errors detected (< 1% — acceptable)`)
  } else {
    console.log('\n✅ All pages warmed successfully')
  }
  return 0
}

// ── GitHub Actions output ────────────────────────────────────────────────────

import { writeFileSync } from 'fs'

function writeGhOutput(stats) {
  const summaryFile = process.env.GITHUB_STEP_SUMMARY
  if (!summaryFile) return

  const errorRate = ((stats.errors.length / stats.total) * 100).toFixed(2)
  const duration = ((Date.now() - stats.startTime) / 1000 / 60).toFixed(1)

  const md = `## Cache Warmup Report

| Metric | Value |
|--------|-------|
| Total URLs | ${stats.total.toLocaleString()} |
| OK (2xx) | ${stats.ok.toLocaleString()} |
| Cache HIT | ${stats.cacheHits.toLocaleString()} |
| Cache MISS (rendered) | ${stats.cacheMisses.toLocaleString()} |
| Redirects | ${stats.redirects.toLocaleString()} |
| Errors | ${stats.errors.length.toLocaleString()} (${errorRate}%) |
| Duration | ${duration} min |

${stats.errors.length > 0 ? `### Errors\n${stats.errors.slice(0, 20).map(e => `- \`${e.url.replace(SITE_URL, '')}\` → ${e.status || e.error}`).join('\n')}` : 'Zero errors!'}
`
  try {
    writeFileSync(summaryFile, md, { flag: 'a' })
  } catch { /* not in GH Actions */ }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 ServicesArtisans — Full Cache Warmup')
  console.log(`   ${new Date().toISOString()}`)
  console.log(`   Tier: ${TIER} | Concurrency: ${CONCURRENCY} | Timeout: ${REQUEST_TIMEOUT}ms`)

  // 1. Parse all sitemaps
  const { allUrls, sitemapStats } = await getAllUrls()

  // 2. Deduplicate
  const uniqueUrls = [...new Set(allUrls)]
  console.log(`\n📊 Total: ${allUrls.length.toLocaleString()} URLs (${uniqueUrls.length.toLocaleString()} unique)`)

  // 3. Filter by tier
  const filtered = filterByTier(uniqueUrls)
  if (filtered.length !== uniqueUrls.length) {
    console.log(`   Tier ${TIER} filter: ${filtered.length.toLocaleString()} URLs selected`)
  }

  if (DRY_RUN) {
    console.log('\n🏁 DRY RUN — skipping actual warmup')
    console.log(`   Would warm ${filtered.length.toLocaleString()} URLs`)
    process.exit(0)
  }

  // 4. Shuffle to spread load across page types
  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]]
  }

  // 5. Warm
  console.log(`\n🔥 Warming ${filtered.length.toLocaleString()} pages (concurrency: ${CONCURRENCY})...\n`)
  const stats = await warmUrls(filtered)

  // 6. Report
  const exitCode = printReport(stats, sitemapStats)
  writeGhOutput(stats)

  process.exit(exitCode)
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err)
  process.exit(1)
})
