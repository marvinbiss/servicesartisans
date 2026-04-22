#!/usr/bin/env node
/**
 * scripts/audit-robots-sitemaps.mjs
 * ---------------------------------
 * Vérifie que chaque URL de sitemap/feed déclarée dans src/app/robots.ts
 * correspond à une route réelle (page/route/sitemap/manifest fichier).
 *
 * Pourquoi : un sitemap déclaré dans robots.txt mais dont la route
 * n'existe pas → 404 à chaque crawl Google → pollution GSC Coverage
 * report + signal de qualité dégradé.
 *
 * Règle : toute URL listée dans `robots().sitemap` doit pointer vers
 *   - `src/app/sitemap.ts` (pour `/sitemap.xml`)
 *   - `src/app/{path}/route.ts` (pour `/path` avec App Router Route Handler)
 *   - `src/app/api/{path}/route.ts` (pour `/api/path`)
 *
 * Usage :
 *   node scripts/audit-robots-sitemaps.mjs           # human
 *   node scripts/audit-robots-sitemaps.mjs --json    # JSON
 *   node scripts/audit-robots-sitemaps.mjs --strict  # exit 1 si gap
 */

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROBOTS_PATH = 'src/app/robots.ts'

if (!existsSync(ROBOTS_PATH)) {
  console.error(`❌ ${ROBOTS_PATH} introuvable.`)
  process.exit(1)
}

const src = readFileSync(ROBOTS_PATH, 'utf8')

/**
 * Extrait les URLs de sitemap du tableau `sitemap: [...]`.
 * Matche les template literals `${SITE_URL}/path` pour ne garder que
 * le chemin relatif (ce qu'on peut vérifier côté filesystem).
 */
function extractSitemapPaths(text) {
  const match = text.match(/sitemap\s*:\s*\[([\s\S]*?)\]/)
  if (!match) return []
  const block = match[1]
  const paths = []
  const re = /\$\{SITE_URL\}(\/[^`'"]+)/g
  for (const m of block.matchAll(re)) {
    paths.push(m[1])
  }
  return paths
}

/**
 * Pour un chemin URL donné, trouve le fichier route source correspondant
 * dans src/app/. Retourne le path du fichier trouvé, ou null.
 *
 * Conventions Next.js App Router vérifiées :
 *   - `/sitemap.xml` → `src/app/sitemap.ts` ou `src/app/sitemap.xml/route.ts`
 *   - `/api/foo` → `src/app/api/foo/route.ts`
 *   - `/feed/bar.xml` → `src/app/feed/bar.xml/route.ts`
 *   - `/robots.txt` → `src/app/robots.ts`
 *   - `/manifest.json` → `src/app/manifest.ts` ou similaire
 */
function resolveRouteFile(urlPath) {
  const candidates = []
  // Normalize : /sitemap.xml → both 'sitemap.ts' + 'sitemap.xml/route.ts'
  if (urlPath === '/sitemap.xml') {
    candidates.push('src/app/sitemap.ts', 'src/app/sitemap.xml/route.ts')
  } else if (urlPath === '/robots.txt') {
    candidates.push('src/app/robots.ts', 'src/app/robots.txt/route.ts')
  } else if (urlPath === '/manifest.json') {
    candidates.push('src/app/manifest.ts', 'src/app/manifest.json/route.ts')
  } else {
    // Generic : strip leading /, join with src/app/, check for route.ts
    const stripped = urlPath.replace(/^\//, '')
    candidates.push(
      join('src/app', stripped, 'route.ts'),
      join('src/app', stripped, 'route.tsx'),
      // Ou forme "fichier direct" style src/app/sitemap.ts
      join('src/app', stripped + '.ts')
    )
  }
  for (const c of candidates) {
    if (existsSync(c)) return c.replace(/\\/g, '/')
  }
  return null
}

const paths = extractSitemapPaths(src)
const results = paths.map((p) => ({
  url_path: p,
  resolved_file: resolveRouteFile(p),
}))

const missing = results.filter((r) => !r.resolved_file)

const report = {
  robots_file: ROBOTS_PATH,
  total_sitemaps_declared: results.length,
  resolved: results.length - missing.length,
  missing: missing.length,
  details: results,
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Robots.ts Sitemap Coverage Audit\n')
  console.log(`  Sitemaps/feeds déclarés : ${report.total_sitemaps_declared}`)
  console.log(`  Résolus vers un fichier : ${report.resolved}`)
  console.log(`  Manquants (404 potentiel) : ${report.missing}\n`)

  console.log('  Détail :')
  for (const r of results) {
    const status = r.resolved_file ? '✓' : '✗'
    console.log(`    ${status} ${r.url_path.padEnd(35)} → ${r.resolved_file ?? 'INTROUVABLE'}`)
  }
  console.log('')

  if (missing.length === 0) {
    console.log('  ✅ Tous les sitemaps déclarés dans robots.ts existent.\n')
  } else {
    console.log('  ❌ Sitemaps déclarés mais fichier route absent :')
    for (const r of missing) console.log(`     - ${r.url_path}`)
    console.log('')
  }
}

if (strict && missing.length > 0) {
  process.exit(1)
}
