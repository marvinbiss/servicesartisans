#!/usr/bin/env node
/**
 * scripts/audit-sitemap-coverage.mjs
 * ----------------------------------
 * Détecte les pages publiques STATIQUES (sans segments dynamiques `[...]`)
 * et indexables qui ne sont PAS listées dans src/app/sitemap.ts.
 *
 * Pourquoi : chaque page non référencée dans le sitemap est découverte
 * uniquement via le maillage interne. Pour les pages orphelines ou peu
 * liées, Google peut mettre des mois à les indexer. Le sitemap est un
 * shortcut direct crawl budget → indexation.
 *
 * Les routes dynamiques (`[slug]`, `[ville]`, etc) ne peuvent pas être
 * vérifiées par diff statique — elles sont générées par des loops sur
 * les data files dans sitemap.ts. On ne les audite pas ici.
 *
 * Usage :
 *   node scripts/audit-sitemap-coverage.mjs            # human
 *   node scripts/audit-sitemap-coverage.mjs --json     # JSON
 *   node scripts/audit-sitemap-coverage.mjs --strict   # exit 1 si gap
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, sep } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const SITEMAP_PATH = 'src/app/sitemap.ts'
const NEXT_CONFIG_PATH = 'next.config.js'

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, acc)
    else if (entry === 'page.tsx') acc.push(full)
  }
  return acc
}

/** Détection noindex — partagée avec les autres audits */
function inferNoindex(src, file) {
  if (/robots\s*:\s*\{\s*[^}]*index\s*:\s*false/s.test(src)) return true
  if (/robots\s*:\s*\{\s*\.\.\.\s*noindex/i.test(src)) return true
  if (/NOT_FOUND_METADATA|NOINDEX_METADATA/.test(src)) return true
  if (/\/\(private\)\//.test(file)) return true
  if (/\/espace-artisan\/|\/espace-client\/|\/admin\//.test(file)) return true
  if (/^\s*redirect\s*\(/m.test(src) && !/return\s*\(/m.test(src)) return true
  return false
}

/** Convertit un chemin de fichier en route URL (strip groupes + segments dynamiques) */
function pathToRoute(file) {
  let route = file
    .replace(/^.*?src[\/\\]app/, '')
    .replace(/[\/\\]page\.tsx$/, '')
    .split(sep)
    .join('/')
  route = route.replace(/\/\([^)]+\)/g, '')
  return route || '/'
}

function isDynamicRoute(file) {
  return /\[[^\]]+\]/.test(file)
}

/**
 * Parse next.config.js pour extraire les sources de redirects permanents.
 *
 * Les pages dont le `source` est redirigé ne doivent pas être listées dans
 * le sitemap (gaspillage crawl + signal contradictoire à Google). On les
 * exclut à la fois de "publicStatic" (donc jamais flaguées comme manquantes)
 * ET du côté vérif sitemap (on signale si une URL redirigée y apparaît).
 */
function extractRedirectSources() {
  if (!existsSync(NEXT_CONFIG_PATH)) return new Set()
  const src = readFileSync(NEXT_CONFIG_PATH, 'utf8')
  const sources = new Set()
  // Match { source: '/foo', destination: '...', permanent: true }
  const re = /\{\s*source:\s*['"]([^'"]+)['"],[\s\S]*?permanent:\s*true[^}]*\}/g
  for (const m of src.matchAll(re)) {
    const s = m[1]
    // On ignore les patterns avec paramètres (/:path*, /:slug) — ils ne
    // correspondent pas à des pages statiques au sens de cet audit
    if (!s.includes(':') && !s.includes('*')) sources.add(s)
  }
  return sources
}

const redirectSources = extractRedirectSources()

// 1. Extraire les URLs littérales + les patterns-préfixes de loops du sitemap
//
// Le sitemap.ts contient 2 types de références :
//   a. URLs LITTÉRALES : `${SITE_URL}/tarifs`, `${SITE_URL}/avis`, etc.
//   b. URLs GÉNÉRÉES par loops : `guideSlugs.map(slug => ${SITE_URL}/guides/${slug})`
//
// Pour les loops, on ne peut pas résoudre le contenu des arrays (certains sont
// importés, d'autres dérivés de `Object.keys(...)`), mais on peut extraire le
// PRÉFIXE commun (`/guides/`, `/services/`, etc.) et considérer que toute page
// statique sous ce préfixe est couverte par le loop.
//
// Limite volontaire : si un loop a un bug (slug absent de l'array source),
// l'audit ne le détectera pas. Le test unitaire des data files couvre ce cas.
const sitemapSrc = readFileSync(SITEMAP_PATH, 'utf8')
const sitemapUrls = new Set()
const sitemapPrefixes = new Set() // wildcards `/guides/`, `/services/`, etc.

// a. URLs LITTÉRALES : `${SITE_URL}/xxx` sans aucune interpolation à l'intérieur
for (const m of sitemapSrc.matchAll(/\$\{SITE_URL\}(\/[^`'"$]*)/g)) {
  const u = m[1].replace(/\/$/, '') || '/'
  if (!u.includes('${')) sitemapUrls.add(u)
}

// b. URLs DANS DES TEMPLATE LITERALS avec interpolation `${...}` — extraire le préfixe
//    Match `${SITE_URL}/prefix1/prefix2/.../${var}...`
//    → capture tout jusqu'à la première interpolation, normaliser comme préfixe
for (const m of sitemapSrc.matchAll(/\$\{SITE_URL\}(\/[^`'"]*?)\$\{/g)) {
  const prefix = m[1]
  // Ne garder que les préfixes propres (se termine par /)
  if (prefix.endsWith('/') && prefix !== '/') {
    sitemapPrefixes.add(prefix)
  }
}

// c. URLs en quote directe (rare mais possible, pour sitemap/robots externes)
for (const m of sitemapSrc.matchAll(/['"](\/\w[\w\-\/]*)['"],\s*$/gm)) {
  const u = m[1]
  if (u !== '/' && !u.includes('${')) sitemapUrls.add(u)
}

/** Une route est "couverte" si elle est listée explicitement OU sous un préfixe de loop */
function isCovered(route) {
  if (sitemapUrls.has(route)) return true
  for (const prefix of sitemapPrefixes) {
    if (route.startsWith(prefix)) return true
  }
  return false
}

// 2. Extraire les routes publiques statiques indexables
const pages = walk('src/app')
const publicStatic = []

for (const f of pages) {
  const normalized = f.split(sep).join('/')
  if (isDynamicRoute(normalized)) continue // skip dynamique (généré par loops)
  const src = readFileSync(f, 'utf8')
  const hasMeta =
    /export\s+(async\s+)?function\s+generateMetadata/.test(src) ||
    /export\s+const\s+metadata\s*[:=]/.test(src)
  if (!hasMeta) continue
  const noindex = inferNoindex(src, normalized)
  if (noindex) continue
  const route = pathToRoute(normalized)
  // Page 301-redirigée : elle existe encore côté filesystem mais Google la
  // voit comme une redirection. Elle ne doit pas être dans le sitemap.
  if (redirectSources.has(route)) continue
  publicStatic.push({ route, file: normalized })
}

// 3. Diff : pages statiques sans entrée ni préfixe de loop dans sitemap
// (la root route '/' est listée comme `SITE_URL` sans slash final)
const missing = publicStatic.filter((p) => !isCovered(p.route) && p.route !== '/')

// 4. Cross-check inverse : URL dans sitemap mais redirigée 301 → gaspillage crawl
const redirectedInSitemap = [...sitemapUrls].filter((u) => redirectSources.has(u))

const report = {
  sitemap_file: SITEMAP_PATH,
  sitemap_urls_extracted: sitemapUrls.size,
  sitemap_loop_prefixes: [...sitemapPrefixes].sort(),
  public_static_pages: publicStatic.length,
  missing_from_sitemap: missing.length,
  gaps: missing,
  redirected_urls_in_sitemap: redirectedInSitemap,
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Sitemap Coverage Audit (static routes only)\n')
  console.log(`  URLs littérales extraites du sitemap.ts  : ${report.sitemap_urls_extracted}`)
  console.log(`  Préfixes de loop détectés                : ${report.sitemap_loop_prefixes.length}`)
  console.log(`  Pages publiques statiques indexables     : ${report.public_static_pages}`)
  console.log(`  Manquantes dans sitemap.ts               : ${report.missing_from_sitemap}\n`)

  if (missing.length === 0) {
    console.log('  ✅ Toutes les pages statiques indexables sont dans le sitemap.\n')
  } else {
    console.log('  ⚠️  Pages indexables absentes du sitemap :')
    for (const r of missing) {
      console.log(`     ${r.route.padEnd(50)} (${r.file})`)
    }
    console.log('')
  }

  if (redirectedInSitemap.length > 0) {
    console.log('  ⚠️  URLs dans le sitemap mais 301-redirigées (gaspillage crawl) :')
    for (const u of redirectedInSitemap) console.log(`     ${u}`)
    console.log('')
  }
}

const hasGap = missing.length > 0 || redirectedInSitemap.length > 0
if (strict && hasGap) {
  process.exit(1)
}
