#!/usr/bin/env node
/**
 * scripts/audit-sitemap-unicity.mjs
 * ---------------------------------
 * Audit d'unicité et cohérence du sitemap.ts :
 *
 *   1. ZÉRO URL dupliquée dans les URLs littérales de sitemap.ts
 *      Cause classique : copier-coller, ajout d'une route déjà listée
 *      dans un autre bloc. Google dédup côté cache mais signale un
 *      "duplicate URL without canonical" dans GSC.
 *
 *   2. ZÉRO URL avec trailing slash (hors root) dans sitemap
 *      Le site sert sans trailing slash ; un sitemap qui liste /foo/
 *      crée un 308 loop côté crawler.
 *
 *   3. ZÉRO URL avec paramètre de requête (?key=value)
 *      Les sitemaps doivent lister URLs canoniques, pas de variants.
 *
 *   4. ZÉRO URL avec fragment (#anchor)
 *      Google ignore les fragments côté indexation mais un fragment
 *      dans le sitemap est invalide (spec sitemaps.org).
 *
 *   5. ZÉRO URL avec double slash //path
 *      Bug de concaténation classique `${SITE_URL}//${path}` ou `${SITE_URL}/${path}`
 *      quand path commence déjà par `/`.
 *
 * Usage :
 *   node scripts/audit-sitemap-unicity.mjs           # human
 *   node scripts/audit-sitemap-unicity.mjs --json    # JSON
 *   node scripts/audit-sitemap-unicity.mjs --strict  # exit 1 si gap
 */

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const SITEMAP = join(ROOT, 'src', 'app', 'sitemap.ts')

function main() {
  if (!existsSync(SITEMAP)) {
    console.error('sitemap.ts introuvable à', SITEMAP)
    process.exit(1)
  }
  const src = readFileSync(SITEMAP, 'utf8')

  // Extract literal URLs `${SITE_URL}/...` — we want ONLY paths that are
  // fully literal (no `${…}` interpolation). The path ends at one of:
  //   - end of template literal (`)
  //   - end of string literal (" or ')
  //   - comma, whitespace, closing brace (value delimiters)
  //   - `${…}` interpolation (which means this is a template PREFIX, not
  //     a literal URL → skip it entirely)
  //
  // Strategy: match `${SITE_URL}<path>` where <path> contains neither
  // whitespace, delimiter, nor the start of another interpolation. Then,
  // inspect the char immediately after to confirm it's NOT `${`.
  const literalSiteUrl = /\$\{SITE_URL\}(\/[^`"'\s,}]*)/g
  const allPaths = new Map() // path → occurrences count

  let m
  while ((m = literalSiteUrl.exec(src))) {
    const path = m[1]
    // Skip if path itself contains `${...}` (interpolation inside path)
    if (path.includes('${')) continue
    // Skip if the captured path is followed by `${…}` in the source —
    // this means it's a template prefix like `${SITE_URL}/services/${slug}`
    // and `/services/` is not a real URL.
    const nextTwo = src.slice(m.index + m[0].length, m.index + m[0].length + 2)
    if (nextTwo === '${') continue
    allPaths.set(path, (allPaths.get(path) ?? 0) + 1)
  }

  const duplicates = [...allPaths.entries()].filter(([, n]) => n > 1)
  const trailingSlash = [...allPaths.keys()].filter((p) => p !== '/' && p.endsWith('/'))
  const withQuery = [...allPaths.keys()].filter((p) => p.includes('?'))
  const withFragment = [...allPaths.keys()].filter((p) => p.includes('#'))
  const doubleSlash = [...allPaths.keys()].filter((p) => /\/\//.test(p))

  const report = {
    literal_urls: allPaths.size,
    total_occurrences: [...allPaths.values()].reduce((s, n) => s + n, 0),
    duplicates: duplicates.length,
    trailing_slash: trailingSlash.length,
    with_query: withQuery.length,
    with_fragment: withFragment.length,
    double_slash: doubleSlash.length,
    details: {
      duplicates: duplicates.map(([path, count]) => ({ path, count })),
      trailingSlash,
      withQuery,
      withFragment,
      doubleSlash,
    },
  }

  if (jsonOut) {
    console.log(JSON.stringify(report, null, 2))
  } else {
    console.log('\n📋 Sitemap Unicity Audit\n')
    console.log(`  URLs littérales distinctes     : ${report.literal_urls}`)
    console.log(`  Occurrences totales            : ${report.total_occurrences}`)
    console.log(`  URLs dupliquées (>=2 occur.)   : ${report.duplicates}`)
    console.log(`  URLs trailing slash (hors /)   : ${report.trailing_slash}`)
    console.log(`  URLs avec query ?key=value     : ${report.with_query}`)
    console.log(`  URLs avec fragment #anchor     : ${report.with_fragment}`)
    console.log(`  URLs avec double slash //      : ${report.double_slash}`)

    if (duplicates.length) {
      console.log('\n  ⚠️  Doublons :')
      for (const { path, count } of report.details.duplicates)
        console.log(`     [${count}×] ${path}`)
    }
    if (trailingSlash.length) {
      console.log('\n  ⚠️  Trailing slash :')
      for (const p of trailingSlash) console.log(`     ${p}`)
    }
    if (withQuery.length) {
      console.log('\n  ⚠️  Query :')
      for (const p of withQuery) console.log(`     ${p}`)
    }
    if (withFragment.length) {
      console.log('\n  ⚠️  Fragment :')
      for (const p of withFragment) console.log(`     ${p}`)
    }
    if (doubleSlash.length) {
      console.log('\n  ⚠️  Double slash :')
      for (const p of doubleSlash) console.log(`     ${p}`)
    }
    const ok = !duplicates.length && !trailingSlash.length && !withQuery.length && !withFragment.length && !doubleSlash.length
    console.log(ok ? '\n  ✅ Sitemap sain.\n' : '')
  }

  const total = duplicates.length + trailingSlash.length + withQuery.length + withFragment.length + doubleSlash.length
  if (strict && total > 0) process.exit(1)
}

main()
