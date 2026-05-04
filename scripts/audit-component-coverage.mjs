#!/usr/bin/env node
/**
 * scripts/audit-component-coverage.mjs
 * -------------------------------------
 * DoD du backlog item P3-sprint10x-components.
 *
 * Source : memory `seo-10agents-synthesis-2026-04-28` (#2) — TldrBlock,
 * EnBrefBox, SnippetBaitSummary existent depuis Sprint 2 mais sont câblés
 * sur <30 % des pages indexables. CTR boost +0.3-0.7 % attendu sur 5K
 * villes pSEO + 46 services hubs = +950 clics/j P50.
 *
 * Vérifie qu'au moins {threshold}% des pages indexables "longues" (≥500 LOC)
 * incluent au moins UN des 3 composants snippet-bait.
 *
 * Stratégie de mesure :
 *   - Scan récursif src/app/(public)/**\/page.tsx
 *   - Exclusion : pages explicitement noindex via metadata robots.index=false
 *     ou via la liste de routes auto-noindex (devis/urgence/tarifs/avis pSEO)
 *   - Critère "longue" : ≥500 LOC (heuristique cheap pour cibler les pages
 *     candidates à snippet-bait — pages courtes = redirect/listing/dashboard
 *     n'ont pas besoin de TLDR)
 *   - Composant détecté : import ou usage de TldrBlock | EnBrefBox |
 *     SnippetBaitSummary (case-sensitive, JSX tag form)
 *
 * --threshold N : exige ≥N % de couverture (défaut 65). Threshold = lock-in
 *                  niveau actuel comme garde-régression. Une PR qui retire
 *                  un composant d'une page longue baisse le %.
 *
 * --json        : machine-readable
 * --verbose     : liste les pages échouantes
 *
 * Usage :
 *   node scripts/audit-component-coverage.mjs --strict
 *   node scripts/audit-component-coverage.mjs --threshold 70 --verbose
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const args = process.argv.slice(2)
const thresholdArg = args.find((a) => a.startsWith('--threshold'))
const threshold = thresholdArg
  ? Number(thresholdArg.split('=')[1] ?? args[args.indexOf(thresholdArg) + 1] ?? 65)
  : 65
const strict = args.includes('--strict')
const jsonOut = args.includes('--json')
const verbose = args.includes('--verbose')

const ROOT = process.cwd()
const PUBLIC_ROOT = join(ROOT, 'src', 'app', '(public)')

const COMPONENTS = ['TldrBlock', 'EnBrefBox', 'SnippetBaitSummary']

// Routes auto-noindex (cf. memory strategy-140k + sitemap purge) — exclues
// du calcul car elles ne sont pas censées capter du trafic SERP.
const AUTO_NOINDEX_PATTERNS = [
  /\(public\)\/devis\b/,
  /\(public\)\/urgence\b/,
  /\(public\)\/tarifs\b/,
  /\(public\)\/avis\b/,
  /\(public\)\/auth\b/,
  /\(public\)\/api\b/,
]

const MIN_LOC_FOR_LONG_PAGE = 500

function walkPageTsx(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) {
      out.push(...walkPageTsx(full))
    } else if (entry === 'page.tsx') {
      out.push(full)
    }
  }
  return out
}

const allPages = walkPageTsx(PUBLIC_ROOT)

function isAutoNoindex(path) {
  const rel = relative(ROOT, path).replace(/\\/g, '/')
  return AUTO_NOINDEX_PATTERNS.some((re) => re.test(rel))
}

function isExplicitNoindex(src) {
  return /robots:\s*\{\s*index:\s*false/.test(src) || /noindex:\s*true/.test(src)
}

function hasComponent(src) {
  return COMPONENTS.some((c) => {
    const importRe = new RegExp(`import\\s+(?:[^'"\\n]*\\b)?${c}\\b`, 'm')
    const tagRe = new RegExp(`<${c}\\b`, 'm')
    return importRe.test(src) || tagRe.test(src)
  })
}

let longPagesTotal = 0
let longPagesWithComponent = 0
let excludedNoindex = 0
let excludedAutoRoute = 0
const failingPages = []

for (const path of allPages) {
  if (isAutoNoindex(path)) {
    excludedAutoRoute += 1
    continue
  }
  const src = readFileSync(path, 'utf8')
  if (isExplicitNoindex(src)) {
    excludedNoindex += 1
    continue
  }
  const loc = src.split(/\r?\n/).length
  if (loc < MIN_LOC_FOR_LONG_PAGE) continue
  longPagesTotal += 1
  if (hasComponent(src)) {
    longPagesWithComponent += 1
  } else {
    failingPages.push(relative(ROOT, path).replace(/\\/g, '/'))
  }
}

const coveragePct =
  longPagesTotal === 0
    ? 100
    : Math.round((longPagesWithComponent / longPagesTotal) * 1000) / 10

const report = {
  backlog_item: 'P3-sprint10x-components',
  components: COMPONENTS,
  threshold,
  min_loc: MIN_LOC_FOR_LONG_PAGE,
  total_pages_scanned: allPages.length,
  excluded_auto_route: excludedAutoRoute,
  excluded_explicit_noindex: excludedNoindex,
  long_pages_total: longPagesTotal,
  long_pages_with_component: longPagesWithComponent,
  coverage_pct: coveragePct,
  failing_pages_count: failingPages.length,
  failing_pages_sample: verbose ? failingPages : failingPages.slice(0, 10),
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Component Coverage Audit (DoD P3-sprint10x-components)\n')
  console.log(`  Composants     : ${COMPONENTS.join(', ')}`)
  console.log(`  Threshold      : ≥${threshold}%`)
  console.log(`  Min LOC        : ${MIN_LOC_FOR_LONG_PAGE} (heuristique "page longue")`)
  console.log(`  Pages scannées : ${allPages.length}`)
  console.log(`  Exclues auto   : ${excludedAutoRoute} (devis/urgence/tarifs/avis pSEO/auth/api)`)
  console.log(`  Exclues noindex: ${excludedNoindex}`)
  console.log(
    `  Pages longues  : ${longPagesTotal} (${longPagesWithComponent} avec composant, ${failingPages.length} sans)`
  )
  console.log(`  Coverage       : ${coveragePct}%`)
  if (failingPages.length > 0) {
    console.log('\n  Pages longues sans composant snippet-bait (top 10) :')
    for (const p of failingPages.slice(0, verbose ? failingPages.length : 10)) {
      console.log(`    - ${p}`)
    }
  }
  if (coveragePct >= threshold) {
    console.log(`\n  ✅ Coverage ${coveragePct}% ≥ threshold ${threshold}% — DoD atteinte.\n`)
  } else {
    console.log(
      `\n  ⚠️  Coverage ${coveragePct}% < threshold ${threshold}% — DoD non atteinte.\n`
    )
  }
}

if (strict && coveragePct < threshold) process.exit(1)
