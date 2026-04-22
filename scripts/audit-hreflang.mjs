#!/usr/bin/env node
/**
 * scripts/audit-hreflang.mjs
 * --------------------------
 * Détecte les pages indexables qui N'EXPOSENT PAS de hreflang (fr-FR + x-default).
 *
 * Pourquoi : le site est FR-only, mais Google attend hreflang explicite sur les
 * sites mono-langue pour éviter qu'il ne teste du géo-targeting arbitraire.
 *   - `fr-FR` signale la France (langue + région)
 *   - `x-default` signale la fallback langue pour visiteurs non-FR
 *
 * Sans hreflang, Google peut :
 *   - Considérer la page comme "unspecified" → moins de confiance
 *   - Servir un snippet en anglais traduit auto → taux de rebond
 *   - Créer des doublons fantômes dans GSC International Targeting
 *
 * Règle : toute page indexable DOIT utiliser `getAlternates(path)` OU déclarer
 * manuellement `alternates.languages = { 'fr-FR': ..., 'x-default': ... }`.
 *
 * Usage :
 *   node scripts/audit-hreflang.mjs            # human
 *   node scripts/audit-hreflang.mjs --json     # JSON
 *   node scripts/audit-hreflang.mjs --strict   # exit 1 si gap
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

/**
 * Détecte si une page déclare correctement hreflang :
 *   a) via helper `getAlternates(...)` — couvre fr-FR + x-default
 *   b) via `languages: { 'fr-FR': ..., 'x-default': ... }` manuel
 *
 * NB : on tolère aussi `getAlternates(...)` appelé depuis une fonction
 * `generateMetadata` async qui passe un path calculé.
 */
function hasHreflang(src) {
  // a. Helper centralisé
  if (/getAlternates\s*\(/.test(src)) return true
  // b. Déclaration manuelle — doit contenir les 2 locales clés
  if (/languages\s*:\s*\{[^}]*['"]fr-FR['"]/s.test(src) && /['"]x-default['"]/.test(src))
    return true
  return false
}

function pathToRoute(file) {
  let route = file
    .replace(/^.*?src[\/\\]app/, '')
    .replace(/[\/\\]page\.tsx$/, '')
    .split(sep)
    .join('/')
  route = route.replace(/\/\([^)]+\)/g, '')
  return route || '/'
}

const pages = walk('src/app')
const gaps = []
let indexable = 0

for (const f of pages) {
  const normalized = f.split(sep).join('/')
  const src = readFileSync(f, 'utf8')
  const hasMeta =
    /export\s+(async\s+)?function\s+generateMetadata/.test(src) ||
    /export\s+const\s+metadata\s*[:=]/.test(src)
  if (!hasMeta) continue
  if (inferNoindex(src, normalized)) continue
  indexable++
  if (!hasHreflang(src)) {
    gaps.push({ route: pathToRoute(normalized), file: normalized })
  }
}

const report = {
  indexable_pages: indexable,
  pages_without_hreflang: gaps.length,
  coverage_pct: indexable === 0 ? 100 : Number(((1 - gaps.length / indexable) * 100).toFixed(1)),
  gaps,
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Hreflang Coverage Audit (fr-FR + x-default)\n')
  console.log(`  Pages indexables scannées : ${report.indexable_pages}`)
  console.log(`  Sans hreflang             : ${report.pages_without_hreflang}`)
  console.log(`  Coverage                  : ${report.coverage_pct}%\n`)

  if (gaps.length === 0) {
    console.log('  ✅ Toutes les pages indexables déclarent hreflang fr-FR + x-default.\n')
  } else {
    console.log('  ⚠️  Pages sans hreflang :')
    for (const g of gaps) {
      console.log(`     ${g.route.padEnd(50)} (${g.file})`)
    }
    console.log('')
  }
}

if (strict && gaps.length > 0) {
  process.exit(1)
}
