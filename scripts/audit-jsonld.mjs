#!/usr/bin/env node
/**
 * scripts/audit-jsonld.mjs
 * -----------------------
 * Détecte les pages indexables SANS aucune donnée structurée JSON-LD.
 *
 * Pourquoi : JSON-LD (Schema.org) est le signal #1 pour les rich results
 * Google (FAQ, Breadcrumb, HowTo, Service, LocalBusiness, Article...) +
 * signal E-E-A-T direct (auteur, org, process éditorial).
 * Page indexable sans JSON-LD = opportunité SERP ratée.
 *
 * Règle : chaque page indexable DOIT inclure au moins un bloc JSON-LD.
 * Détection acceptée :
 *   a. Composant `<JsonLd ... />` (wrapper React du projet)
 *   b. `<script type="application/ld+json">` inline (legacy)
 *   c. Import d'un helper `getXxxSchema()` du module seo/jsonld
 *      (l'usage peut être conditionnel, mais présence du helper = intent)
 *
 * Usage :
 *   node scripts/audit-jsonld.mjs            # human
 *   node scripts/audit-jsonld.mjs --json     # JSON
 *   node scripts/audit-jsonld.mjs --strict   # exit 1 si gap
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

function hasJsonLd(src) {
  // a. Composant <JsonLd ... />
  if (/<JsonLd\b/.test(src)) return true
  // b. Script inline
  if (/application\/ld\+json/.test(src)) return true
  // c. Import d'au moins un helper de seo/jsonld
  if (/from\s+['"]@\/lib\/seo\/jsonld['"]/.test(src)) return true
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
  if (!hasJsonLd(src)) {
    gaps.push({ route: pathToRoute(normalized), file: normalized })
  }
}

const report = {
  indexable_pages: indexable,
  pages_without_jsonld: gaps.length,
  coverage_pct: indexable === 0 ? 100 : Number(((1 - gaps.length / indexable) * 100).toFixed(1)),
  gaps,
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 JSON-LD Coverage Audit\n')
  console.log(`  Pages indexables scannées : ${report.indexable_pages}`)
  console.log(`  Sans JSON-LD              : ${report.pages_without_jsonld}`)
  console.log(`  Coverage                  : ${report.coverage_pct}%\n`)

  if (gaps.length === 0) {
    console.log('  ✅ Toutes les pages indexables incluent du JSON-LD.\n')
  } else {
    console.log('  ⚠️  Pages indexables sans JSON-LD :')
    for (const g of gaps) {
      console.log(`     ${g.route.padEnd(50)} (${g.file})`)
    }
    console.log('')
  }
}

if (strict && gaps.length > 0) {
  process.exit(1)
}
