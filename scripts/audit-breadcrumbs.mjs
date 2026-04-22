#!/usr/bin/env node
/**
 * scripts/audit-breadcrumbs.mjs
 * -----------------------------
 * Vérifie que chaque page indexable NON-ROOT inclut un breadcrumb :
 *   a. Composant UI `<Breadcrumb ... />` dans le JSX
 *   b. JSON-LD `BreadcrumbList` via `getBreadcrumbSchema(...)`
 *
 * Pourquoi : BreadcrumbList est un des rich results les plus simples à
 * obtenir (Google affiche le fil d'Ariane au lieu de l'URL dans la SERP,
 * CTR +5-10%). Côté UX, un breadcrumb améliore la navigation profonde.
 * La racine `/` est exclue (pas de parent).
 *
 * Règle : toute page indexable (hors `/`) doit avoir au moins l'un des
 * deux signaux (UI component OU JSON-LD schema).
 *
 * Usage :
 *   node scripts/audit-breadcrumbs.mjs            # human
 *   node scripts/audit-breadcrumbs.mjs --json     # JSON
 *   node scripts/audit-breadcrumbs.mjs --strict   # exit 1 si gap
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

function inferNoindex(src, file) {
  if (/robots\s*:\s*\{\s*[^}]*index\s*:\s*false/s.test(src)) return true
  if (/robots\s*:\s*\{\s*\.\.\.\s*noindex/i.test(src)) return true
  if (/NOT_FOUND_METADATA|NOINDEX_METADATA/.test(src)) return true
  if (/\/\(private\)\//.test(file)) return true
  if (/\/espace-artisan\/|\/espace-client\/|\/admin\//.test(file)) return true
  if (/^\s*redirect\s*\(/m.test(src) && !/return\s*\(/m.test(src)) return true
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

function hasBreadcrumb(src) {
  // a. Composant UI (import + usage JSX)
  if (/<Breadcrumb\b/.test(src)) return true
  // b. JSON-LD schema helper
  if (/getBreadcrumbSchema\b/.test(src)) return true
  // c. BreadcrumbList inline
  if (/['"]@type['"]\s*:\s*['"]BreadcrumbList['"]/.test(src)) return true
  return false
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
  const route = pathToRoute(normalized)
  if (route === '/') continue // racine n'a pas de parent
  indexable++
  if (!hasBreadcrumb(src)) {
    gaps.push({ route, file: normalized })
  }
}

const report = {
  indexable_non_root_pages: indexable,
  pages_without_breadcrumb: gaps.length,
  coverage_pct: indexable === 0 ? 100 : Number(((1 - gaps.length / indexable) * 100).toFixed(1)),
  gaps,
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Breadcrumb Coverage Audit\n')
  console.log(`  Pages indexables (hors /) : ${report.indexable_non_root_pages}`)
  console.log(`  Sans breadcrumb           : ${report.pages_without_breadcrumb}`)
  console.log(`  Coverage                  : ${report.coverage_pct}%\n`)

  if (gaps.length === 0) {
    console.log('  ✅ Toutes les pages indexables ont un breadcrumb (UI ou JSON-LD).\n')
  } else {
    console.log('  ⚠️  Pages sans breadcrumb :')
    for (const g of gaps) {
      console.log(`     ${g.route.padEnd(50)} (${g.file})`)
    }
    console.log('')
  }
}

if (strict && gaps.length > 0) process.exit(1)
