#!/usr/bin/env node
/**
 * Crawl prod : fetch HTML, extrait le texte SSR rendu (hors <script>/<style>/<noscript>),
 * compte les mots et flag les pages > 3500.
 *
 * Échantillon stratifié sur les sitemaps (hubs + dynamiques).
 *
 * Usage:
 *   node scripts/crawl-ssr-wordcount.mjs [--limit=200] [--concurrency=4] [--threshold=3500]
 */

import { writeFileSync } from 'node:fs'

const ORIGIN = process.env.SA_CRAWL_ORIGIN || 'https://servicesartisans.fr'
const EXTRA_HEADERS = process.env.SA_CRAWL_LOCAL
  ? { 'X-Forwarded-Proto': 'https', 'X-Forwarded-Host': 'servicesartisans.fr' }
  : {}
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=')
    return [k, v ?? true]
  })
)
const LIMIT = parseInt(args.limit ?? '200', 10)
const CONCURRENCY = parseInt(args.concurrency ?? '4', 10)
const THRESHOLD = parseInt(args.threshold ?? '3500', 10)

const SITEMAPS_TO_SAMPLE = [
  // Hubs / pages éditoriales / templates clés (sitemap réel observé sur prod)
  { url: '/sitemap/static.xml', take: 60, label: 'static' },
  { url: '/sitemap/cities.xml', take: 20, label: 'cities' },
  { url: '/sitemap/geo.xml', take: 10, label: 'geo' },
  { url: '/sitemap/service-cities-0.xml', take: 25, label: 'svc-city' },
  { url: '/sitemap/devis-services.xml', take: 8, label: 'devis-svc' },
  { url: '/sitemap/avis-services.xml', take: 8, label: 'avis-svc' },
  { url: '/sitemap/urgence-service-cities-0.xml', take: 10, label: 'urg-sc' },
  { url: '/sitemap/problemes.xml', take: 5, label: 'problemes' },
  { url: '/sitemap/problemes-cities-0.xml', take: 10, label: 'prob-city' },
  { url: '/sitemap/communes.xml', take: 10, label: 'communes' },
  { url: '/sitemap/communes-cities-0.xml', take: 10, label: 'communes-c' },
  { url: '/sitemap/aides-dept.xml', take: 8, label: 'aides-dept' },
  { url: '/sitemap/dept-services-0.xml', take: 10, label: 'dept-svc' },
  { url: '/sitemap/barometre.xml', take: 5, label: 'barometre' },
  { url: '/sitemap/region-services.xml', take: 8, label: 'region-svc' },
  { url: '/sitemap/rge-service.xml', take: 8, label: 'rge-svc' },
  { url: '/sitemap/rge-city.xml', take: 8, label: 'rge-city' },
  { url: '/sitemap/rge-service-city.xml', take: 12, label: 'rge-sc' },
  { url: '/sitemap/rge-service-dept.xml', take: 6, label: 'rge-sd' },
  { url: '/sitemap/rge-qualification.xml', take: 5, label: 'rge-qual' },
  { url: '/sitemap/cee-operation.xml', take: 6, label: 'cee-op' },
  { url: '/sitemap/cee-operation-guide.xml', take: 5, label: 'cee-guide' },
  { url: '/sitemap/cee-operation-city.xml', take: 8, label: 'cee-op-c' },
]

async function fetchText(url) {
  const r = await fetch(url, {
    headers: { 'User-Agent': 'SA-SSR-Audit/1.0', ...EXTRA_HEADERS },
    redirect: 'follow',
  })
  return { status: r.status, html: await r.text(), finalUrl: r.url }
}

function pickRandom(arr, n) {
  if (arr.length <= n) return arr.slice()
  const out = []
  const used = new Set()
  while (out.length < n) {
    const i = Math.floor(Math.random() * arr.length)
    if (!used.has(i)) {
      used.add(i)
      out.push(arr[i])
    }
  }
  return out
}

function extractUrlsFromSitemap(xml) {
  const urls = []
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.push(m[1].trim())
  return urls
}

async function fetchSitemapSample(path, take, label) {
  try {
    const { status, html } = await fetchText(`${ORIGIN}${path}`)
    if (status !== 200) {
      console.error(`  ⚠️  ${path} → ${status}`)
      return []
    }
    const urls = extractUrlsFromSitemap(html)
    const sample = pickRandom(urls, take)
    return sample.map((raw) => {
      // Sitemap renvoie URLs canoniques prod ; rewrite vers ORIGIN si crawl local.
      const u = raw.replace(/^https?:\/\/[^/]+/, ORIGIN)
      return { url: u, label }
    })
  } catch (e) {
    console.error(`  ⚠️  ${path} → ${e.message}`)
    return []
  }
}

function stripHtml(html) {
  let s = html
  // Drop head, script, style, noscript, JSON-LD, svg
  s = s.replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, '')
  s = s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  s = s.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  s = s.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, '')
  s = s.replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, '')
  // Drop attributes from remaining tags (kills Tailwind class soup)
  s = s.replace(/<[^>]+>/g, ' ')
  // HTML entities basics
  s = s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
  return s
}

function countWords(text) {
  let n = 0
  for (const tok of text.split(/\s+/)) {
    if (tok.length >= 2 && /[a-zA-ZÀ-ſ0-9]/.test(tok)) n++
  }
  return n
}

function detectBailout(html) {
  return /<!--\$!?-->|self\.__next_f\.push.*"e":/.test(html) ? false : false // placeholder
}

function detectH1(html) {
  return /<h1[\s>]/i.test(html)
}

function detectNoindex(html) {
  return /<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html)
}

async function processOne({ url, label }) {
  try {
    const { status, html, finalUrl } = await fetchText(url)
    if (status !== 200) return { url, label, status, ok: false, words: 0 }
    const noindex = detectNoindex(html)
    const h1 = detectH1(html)
    const text = stripHtml(html)
    const words = countWords(text)
    return { url, finalUrl, label, status, ok: true, words, noindex, h1, htmlBytes: html.length }
  } catch (e) {
    return { url, label, status: 0, ok: false, words: 0, error: e.message }
  }
}

async function pool(items, n, fn, onTick) {
  const out = []
  let i = 0
  const workers = Array.from({ length: n }, async () => {
    while (i < items.length) {
      const idx = i++
      const r = await fn(items[idx])
      out[idx] = r
      onTick?.(idx + 1, items.length, r)
    }
  })
  await Promise.all(workers)
  return out
}

async function main() {
  console.log(`\nSSR word-count crawl — ${ORIGIN}`)
  console.log(`Limit ${LIMIT}, concurrency ${CONCURRENCY}, threshold ${THRESHOLD}\n`)

  console.log('1. Sampling sitemaps...')
  const sampleSets = await Promise.all(
    SITEMAPS_TO_SAMPLE.map((s) => fetchSitemapSample(s.url, s.take, s.label))
  )
  let urls = sampleSets.flat()

  // Dedup + cap to LIMIT
  const seen = new Set()
  urls = urls.filter((u) => {
    if (seen.has(u.url)) return false
    seen.add(u.url)
    return true
  })
  if (urls.length > LIMIT) urls = pickRandom(urls, LIMIT)
  console.log(`   ${urls.length} URLs uniques échantillonnées\n`)

  console.log('2. Crawling...')
  const t0 = Date.now()
  const results = await pool(urls, CONCURRENCY, processOne, (n, total, r) => {
    if (n % 10 === 0 || n === total) {
      const flag = r.ok && r.words > THRESHOLD ? ' 🔴' : ''
      process.stdout.write(`   ${n}/${total} ${r.label.padEnd(14)} ${String(r.words).padStart(5)} ${r.url}${flag}\n`)
    }
  })
  const dt = ((Date.now() - t0) / 1000).toFixed(1)
  console.log(`\n   Crawl terminé en ${dt}s\n`)

  // Stats
  const ok = results.filter((r) => r.ok)
  const errors = results.filter((r) => !r.ok)
  const indexed = ok.filter((r) => !r.noindex)
  const offenders = indexed.filter((r) => r.words > THRESHOLD)

  console.log('3. Résultats')
  console.log(`   OK             : ${ok.length}/${results.length}`)
  console.log(`   Errors         : ${errors.length}`)
  console.log(`   noindex        : ${ok.filter((r) => r.noindex).length}`)
  console.log(`   Sans <h1>      : ${indexed.filter((r) => !r.h1).length}/${indexed.length}`)
  console.log(`   > ${THRESHOLD} mots  : ${offenders.length}/${indexed.length}\n`)

  // Stats par label
  console.log('   Par catégorie (médiane / max mots, indexables uniquement):')
  const byLabel = {}
  for (const r of indexed) {
    byLabel[r.label] ??= []
    byLabel[r.label].push(r.words)
  }
  for (const [label, arr] of Object.entries(byLabel).sort()) {
    arr.sort((a, b) => a - b)
    const median = arr[Math.floor(arr.length / 2)]
    const max = arr[arr.length - 1]
    const over = arr.filter((w) => w > THRESHOLD).length
    console.log(`     ${label.padEnd(14)} n=${String(arr.length).padStart(3)} med=${String(median).padStart(5)} max=${String(max).padStart(5)} >${THRESHOLD}=${over}`)
  }

  if (offenders.length > 0) {
    console.log(`\n4. Offenders > ${THRESHOLD} mots :`)
    offenders.sort((a, b) => b.words - a.words)
    for (const r of offenders) {
      console.log(`   ${String(r.words).padStart(5)} ${r.label.padEnd(14)} ${r.url}`)
    }
  }

  // JSON dump
  writeFileSync(
    'tmp-ssr-crawl-results.json',
    JSON.stringify({ origin: ORIGIN, threshold: THRESHOLD, results }, null, 2)
  )
  console.log('\n   JSON dump → tmp-ssr-crawl-results.json')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
