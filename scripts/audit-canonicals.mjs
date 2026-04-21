#!/usr/bin/env node
/**
 * scripts/audit-canonicals.mjs
 * ----------------------------
 * Scanne tous les `page.tsx` du dossier `src/app/` et liste ceux qui
 * déclarent des metadata MAIS n'utilisent ni `getAlternates()` ni
 * `canonical:`, ET qui sont indexables (pas de `robots: { index: false }`).
 *
 * Un canonical manquant sur une page dynamique indexable (ISR) = Google
 * peut traiter plusieurs variantes de la même URL comme des doublons,
 * diluant le PageRank.
 *
 * Les pages `noindex` sont exclues du strict check — elles ne peuvent
 * pas polluer l'index de toute façon (espaces privés, tokens uniques,
 * résultats personnels, routes redirect force-dynamic, etc).
 *
 * Usage :
 *   node scripts/audit-canonicals.mjs            # liste humaine
 *   node scripts/audit-canonicals.mjs --json     # JSON
 *   node scripts/audit-canonicals.mjs --strict   # exit 1 si page INDEXABLE
 *                                                # dynamique sans canonical
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, sep } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, acc)
    else if (entry === 'page.tsx') acc.push(full)
  }
  return acc
}

/**
 * Une page est considérée `noindex` si son metadata contient :
 *   - `robots: { index: false }` — pattern Next.js 14 Metadata API
 *   - `robots: { ...noindex }` — étalement d'objet factorisé
 *   - ou `NOT_FOUND_METADATA` / `NOINDEX_METADATA` (constantes dédiées)
 *   - ou est dans un dossier `(private)/` / `espace-artisan/` / `espace-client/`
 *     / `admin/` (espaces privés par convention)
 *   - ou utilise `redirect(` sans rendu (route.ts-like page)
 */
function inferNoindex(src, file) {
  if (/robots\s*:\s*\{\s*[^}]*index\s*:\s*false/s.test(src)) return true
  if (/robots\s*:\s*\{\s*\.\.\.\s*noindex/i.test(src)) return true
  if (/NOT_FOUND_METADATA|NOINDEX_METADATA/.test(src)) return true
  if (/\/\(private\)\//.test(file)) return true
  if (/\/espace-artisan\/|\/espace-client\/|\/admin\//.test(file)) return true
  // Page qui ne fait que `redirect(...)` sans retourner de JSX/HTML :
  // on l'assimile à un noindex opérationnel (pas de contenu à indexer).
  if (/^\s*redirect\s*\(/m.test(src) && !/return\s*\(/m.test(src)) return true
  return false
}

const pages = walk('src/app')
const results = []

for (const f of pages) {
  const src = readFileSync(f, 'utf8')
  const hasGenMeta = /export\s+(async\s+)?function\s+generateMetadata/.test(src)
  const hasStaticMeta = /export\s+const\s+metadata\s*[:=]/.test(src)
  if (!hasGenMeta && !hasStaticMeta) continue

  const hasAlternates = /alternates\s*:/.test(src) || /getAlternates\s*\(/.test(src)
  const hasCanonical = /canonical\s*:/.test(src)
  const normalized = f.split(sep).join('/')
  const isDynamic = /\[[^\]]+\]/.test(normalized)
  const noindex = inferNoindex(src, normalized)

  results.push({
    file: normalized,
    dynamic: isDynamic,
    alternates: hasAlternates,
    canonical: hasCanonical,
    noindex,
  })
}

const missingAny = results.filter((r) => !r.alternates && !r.canonical)
const missingIndexable = missingAny.filter((r) => !r.noindex)
const missingIndexableDyn = missingIndexable.filter((r) => r.dynamic)

const report = {
  scanned: results.length,
  missing_total: missingAny.length,
  missing_indexable: missingIndexable.length,
  missing_indexable_dynamic: missingIndexableDyn.length,
  gaps: missingIndexable,
  excluded_noindex: missingAny.filter((r) => r.noindex).map((r) => r.file),
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Canonical/Alternates Audit\n')
  console.log(`  Pages avec metadata scannées        : ${report.scanned}`)
  console.log(`  Sans canonical (total)              : ${report.missing_total}`)
  console.log(`  Sans canonical ET indexables (bug)  : ${report.missing_indexable}`)
  console.log(`    dont dynamiques (critique)        : ${report.missing_indexable_dynamic}`)
  console.log(`  Exclues (noindex, OK)               : ${report.excluded_noindex.length}\n`)

  if (report.missing_indexable === 0) {
    console.log('  ✅ Aucune page indexable sans canonical.\n')
  } else {
    console.log('  ❌ Pages indexables sans canonical :')
    for (const r of report.gaps) {
      console.log(`     [${r.dynamic ? 'DYN' : 'STA'}] ${r.file}`)
    }
    console.log('')
  }
}

if (strict && missingIndexableDyn.length > 0) {
  process.exit(1)
}
