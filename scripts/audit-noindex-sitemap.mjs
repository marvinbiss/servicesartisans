#!/usr/bin/env node
/**
 * scripts/audit-noindex-sitemap.mjs
 * ---------------------------------
 * Vérifie la cohérence sitemap ↔ robots.
 *
 *   1. PAGE INDEXABLE ABSENTE DU SITEMAP
 *      Une page sans robots:noindex devrait être énumérée dans sitemap.ts
 *      (ou ses loops dynamiques). Sinon Google ne la découvre qu'au travers
 *      du crawl interne → indexation lente.
 *      (déjà couvert par audit-sitemap-coverage pour les statiques)
 *
 *   2. PAGE NOINDEX PRÉSENTE DANS LE SITEMAP
 *      Sitemaps = signal "indexe-moi". Si la page renvoie noindex, Google
 *      la crawle pour rien → gaspillage budget + signal contradictoire.
 *      (PAS couvert par d'autres audits, c'est notre apport)
 *
 *   3. PAGE AVEC REDIRECT 301 PRÉSENTE DANS LE SITEMAP
 *      Google recommande d'exposer uniquement des URLs qui renvoient 200.
 *      Les 301 doivent pointer vers la nouvelle URL, la source ne doit pas
 *      être dans le sitemap.
 *
 * Usage :
 *   node scripts/audit-noindex-sitemap.mjs
 *   node scripts/audit-noindex-sitemap.mjs --json
 *   node scripts/audit-noindex-sitemap.mjs --strict
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const PUBLIC_APP = join(ROOT, 'src', 'app', '(public)')
const SITEMAP = join(ROOT, 'src', 'app', 'sitemap.ts')
const CONFIG = join(ROOT, 'next.config.js')

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, acc)
    else if (entry === 'page.tsx') acc.push(full)
  }
  return acc
}

function fileToRoute(file) {
  let rel = relative(PUBLIC_APP, file).replace(/[\\/]page\.tsx$/, '').replace(/\\/g, '/')
  rel = rel
    .split('/')
    .filter((seg) => !(seg.startsWith('(') && seg.endsWith(')')))
    .join('/')
  return rel === '' ? '/' : '/' + rel
}

function inferNoindex(src) {
  if (/robots\s*:\s*\{\s*[^}]*index\s*:\s*false/s.test(src)) return true
  if (/robots\s*:\s*\{\s*\.\.\.\s*noindex/i.test(src)) return true
  if (/NOT_FOUND_METADATA|NOINDEX_METADATA/.test(src)) return true
  return false
}

function isDynamic(route) {
  return /\[[^\]]+\]/.test(route)
}

// Extract URLs literally listed in sitemap.ts (no loops → we accept those
// coming from explicit `${SITE_URL}/...` template literals).
function extractSitemapLiteralUrls(src) {
  const out = new Set()
  const re = /\$\{SITE_URL\}(\/[^`"'\s,}]*)/g
  let m
  while ((m = re.exec(src))) {
    const u = m[1].replace(/\/$/, '') || '/'
    // Skip lines that look like loop bodies with ${} interpolation inside the path.
    if (u.includes('${')) continue
    out.add(u)
  }
  return out
}

function extractRedirectSources(src) {
  const out = new Set()
  // Scope to async redirects() { … } block only (skip headers/rewrites)
  const start = src.indexOf('async redirects()')
  if (start === -1) return out
  let i = src.indexOf('{', start)
  if (i === -1) return out
  let depth = 1
  let j = i + 1
  while (j < src.length && depth > 0) {
    if (src[j] === '{') depth++
    else if (src[j] === '}') depth--
    j++
  }
  const body = src.slice(i, j)
  // Match redirect objects { source: ..., destination: ..., permanent: ... }
  const re = /\{\s*source\s*:\s*(['"`])((?:\\.|(?!\1).)+)\1\s*,\s*destination\s*:/g
  let m
  while ((m = re.exec(body))) {
    const s = m[2]
    if (isDynamic(s)) continue
    if (!s.startsWith('/')) continue
    out.add(s.replace(/\/$/, '') || '/')
  }
  return out
}

function main() {
  const sitemapSrc = existsSync(SITEMAP) ? readFileSync(SITEMAP, 'utf8') : ''
  const configSrc = existsSync(CONFIG) ? readFileSync(CONFIG, 'utf8') : ''

  const sitemapUrls = extractSitemapLiteralUrls(sitemapSrc)
  const redirectSources = extractRedirectSources(configSrc)

  const pageFiles = walk(PUBLIC_APP)

  const noindexInSitemap = []
  const redirectedInSitemap = []

  // 1) For each page file, check if noindex AND present in sitemap
  for (const file of pageFiles) {
    const route = fileToRoute(file)
    if (isDynamic(route)) continue
    const src = readFileSync(file, 'utf8')
    if (inferNoindex(src) && sitemapUrls.has(route)) {
      noindexInSitemap.push({
        route,
        file: relative(ROOT, file).replace(/\\/g, '/'),
      })
    }
  }

  // 2) For each sitemap URL, check if it's a redirect source
  for (const url of sitemapUrls) {
    if (redirectSources.has(url)) {
      redirectedInSitemap.push({ url, redirectedFrom: 'next.config.js' })
    }
  }

  const report = {
    sitemap_literal_urls: sitemapUrls.size,
    redirect_sources: redirectSources.size,
    noindex_in_sitemap: noindexInSitemap.length,
    redirected_in_sitemap: redirectedInSitemap.length,
    details: { noindexInSitemap, redirectedInSitemap },
  }

  if (jsonOut) {
    console.log(JSON.stringify(report, null, 2))
  } else {
    console.log('\n📋 Noindex ↔ Sitemap Consistency\n')
    console.log(`  URLs littérales sitemap.ts        : ${sitemapUrls.size}`)
    console.log(`  Sources redirect 301 (literal)    : ${redirectSources.size}`)
    console.log(`  Pages noindex listées sitemap     : ${noindexInSitemap.length}`)
    console.log(`  Pages redirect listées sitemap    : ${redirectedInSitemap.length}`)
    if (noindexInSitemap.length) {
      console.log('\n  ⚠️  Pages noindex présentes dans sitemap (retirer du sitemap) :')
      for (const n of noindexInSitemap) console.log(`     ${n.route}   (${n.file})`)
    }
    if (redirectedInSitemap.length) {
      console.log('\n  ⚠️  Pages redirect 301 présentes dans sitemap (retirer) :')
      for (const r of redirectedInSitemap) console.log(`     ${r.url}`)
    }
    const ok = !noindexInSitemap.length && !redirectedInSitemap.length
    console.log(ok ? '\n  ✅ Cohérence sitemap ↔ noindex ↔ redirects.\n' : '')
  }

  if (strict && (noindexInSitemap.length || redirectedInSitemap.length)) process.exit(1)
}

main()
