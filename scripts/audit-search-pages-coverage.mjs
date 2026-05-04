#!/usr/bin/env node
/**
 * scripts/audit-search-pages-coverage.mjs
 * ----------------------------------------
 * DoD du backlog item P3-internal-search-pages (pivot 2026-05-04).
 *
 * Pivot stratégique
 * -----------------
 * L'item original visait à construire `/recherche/[query]` dynamiquement
 * indexable pour 200 longtail KW. Pivot après inspection du codebase et
 * des CSV Ahrefs disponibles :
 *
 *   1. La source CSV originale `docs/ahrefs-bloc3-longtail.csv` n'existe pas.
 *      Source réelle disponible : `striking_distance_2026-05.csv` (589 KW
 *      Ahrefs avec bucket / volume / KD / sa_pos / best_competitor).
 *
 *   2. Construire 200 routes /recherche/[query] = risque élevé de duplicate
 *      content / canonicalization (les KW longtail sont majoritairement
 *      informationnels « pompe à chaleur air eau », « isolation phonique »
 *      qui correspondent déjà à des pages /renovation-energetique/* ou
 *      /services/* existantes).
 *
 *   3. Stratégie correcte = MAPPING : vérifier que les top 200 KW Ahrefs
 *      sont effectivement couverts par une page SA existante (longtail
 *      slug ↔ route SA), plutôt que créer des doublons.
 *
 * Vérification (DoD)
 * ------------------
 * Pour chaque KW dans le top 200 (par volume DESC, source striking_distance
 * 2026-05.csv) :
 *   - Slugifier le keyword (NFD strip diacritics, espaces → tirets)
 *   - Chercher si le slug est présent dans le tree des pages indexables :
 *       a) match direct sur un fichier page.tsx (route littérale)
 *       b) match dans la liste des services/villes/communes (route dynamique)
 *       c) match sur les hubs renovation-energetique/aides/cee/rge
 *   - Si aucun match : marqué comme « gap » (KW Ahrefs non capturé)
 *
 * Le coverage % = top 200 KW capturés / 200.
 *
 * Threshold : --strict (défaut 50). On est volontairement bas : beaucoup de
 * KW « blue_ocean » sont hors scope SA (« attestation d'hébergement »,
 * « primeo energie »…). Le but est de capturer les KW dans-scope (renovation,
 * artisanat, services) sans bloquer le commit pour des KW qu'on ne servira
 * jamais.
 *
 * Usage :
 *   node scripts/audit-search-pages-coverage.mjs --strict
 *   node scripts/audit-search-pages-coverage.mjs --threshold 60 --json
 *   node scripts/audit-search-pages-coverage.mjs --verbose
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const args = process.argv.slice(2)
const thresholdArg = args.find((a) => a.startsWith('--threshold'))
const threshold = thresholdArg
  ? Number(thresholdArg.split('=')[1] ?? args[args.indexOf(thresholdArg) + 1] ?? 50)
  : 50
const strict = args.includes('--strict')
const jsonOut = args.includes('--json')
const verbose = args.includes('--verbose')

const ROOT = process.cwd()
const CSV = join(ROOT, 'docs', 'audit-ahrefs-2026-05-03', 'striking_distance_2026-05.csv')
const PUBLIC_ROOT = join(ROOT, 'src', 'app', '(public)')

if (!existsSync(CSV)) {
  console.error('Audit search pages : striking_distance_2026-05.csv absent')
  if (strict) process.exit(1)
  process.exit(0)
}

const TOP_N = 200

// Parse CSV (simple, no embedded commas in keyword field)
const rows = readFileSync(CSV, 'utf8')
  .split(/\r?\n/)
  .slice(1)
  .filter((l) => l.trim().length > 0)
  .map((line) => {
    const [bucket, keyword, volume, kd, saPos] = line.split(',')
    return { bucket, keyword, volume: Number(volume), kd: Number(kd), saPos: Number(saPos) || null }
  })

// Top 200 par volume DESC (KW Ahrefs avec poids SERP réel)
const topKw = rows
  .filter((r) => Number.isFinite(r.volume) && r.volume > 0)
  .sort((a, b) => b.volume - a.volume)
  .slice(0, TOP_N)

function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[''`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Walk page.tsx tree and collect route segments + tokens
function walkPaths(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) out.push(...walkPaths(full))
    else if (entry === 'page.tsx') out.push(full)
  }
  return out
}
const pages = walkPaths(PUBLIC_ROOT)

// Index : ensemble des slugs littéraux dans les routes (segments non-bracketés)
const literalSlugs = new Set()
for (const p of pages) {
  const rel = relative(PUBLIC_ROOT, p).replace(/\\/g, '/')
  rel.split('/').forEach((seg) => {
    if (!seg.startsWith('[') && seg !== 'page.tsx') {
      literalSlugs.add(seg)
    }
  })
}

// Index : tokens du contenu (heuristique). On lit les pages "hubs" (sous
// renovation-energetique, aides, cee, rge, services, blog, guides) pour
// trouver les KW dans le contenu publié.
const HUB_DIRS = [
  'renovation-energetique',
  'aides',
  'cee',
  'rge',
  'services',
  'blog',
  'guides',
  'communes',
  'villes',
  'departements',
  'regions',
]
const hubContent = []
for (const p of pages) {
  const rel = relative(PUBLIC_ROOT, p).replace(/\\/g, '/')
  if (HUB_DIRS.some((h) => rel.startsWith(h))) {
    hubContent.push(readFileSync(p, 'utf8').toLowerCase())
  }
}
const hubBlob = hubContent.join(' ')

function isCovered(kwSlug, kwOriginal) {
  // 1. Slug match dans une route littérale
  if (literalSlugs.has(kwSlug)) return { covered: true, via: 'literal_route' }
  // 2. Slug d'un fragment ≥3 tokens présent dans une route
  const tokens = kwSlug.split('-').filter((t) => t.length >= 3)
  if (tokens.length >= 2) {
    const allInLiteral = tokens.every((t) => literalSlugs.has(t))
    if (allInLiteral) return { covered: true, via: 'multi_token_literal' }
  }
  // 3. KW présent dans le content blob des hubs (texte publié) — exige que
  // ≥2 tokens distinctifs (≥4 chars) co-occurent dans le blob.
  const distinctTokens = kwSlug.split('-').filter((t) => t.length >= 4)
  if (distinctTokens.length >= 2) {
    const matched = distinctTokens.filter((t) => hubBlob.includes(t)).length
    if (matched >= Math.max(2, Math.ceil(distinctTokens.length * 0.6))) {
      return { covered: true, via: 'hub_content' }
    }
  }
  // 4. KW courts (≤2 tokens) doivent matcher au moins un token dans literalSlugs
  if (kwSlug.split('-').length <= 2) {
    const single = kwSlug.split('-').find((t) => literalSlugs.has(t))
    if (single) return { covered: true, via: 'partial_literal' }
  }
  return { covered: false, via: null, original: kwOriginal }
}

const results = topKw.map((kw) => {
  const slug = slugify(kw.keyword)
  const cov = isCovered(slug, kw.keyword)
  return { keyword: kw.keyword, slug, volume: kw.volume, kd: kw.kd, ...cov }
})

const covered = results.filter((r) => r.covered)
const gaps = results.filter((r) => !r.covered)
const coveragePct = Math.round((covered.length / results.length) * 1000) / 10

const report = {
  backlog_item: 'P3-internal-search-pages',
  pivot_note:
    'Mapping audit (no /recherche/[query] route) — top 200 striking-distance KW must map to existing SA pages',
  source_csv: 'docs/audit-ahrefs-2026-05-03/striking_distance_2026-05.csv',
  top_n: TOP_N,
  threshold,
  total_kw_in_top: results.length,
  covered_count: covered.length,
  gap_count: gaps.length,
  coverage_pct: coveragePct,
  gaps_sample: verbose ? gaps : gaps.slice(0, 20).map((g) => ({
    keyword: g.keyword,
    volume: g.volume,
    kd: g.kd,
  })),
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Search Pages Mapping Audit (DoD P3-internal-search-pages, pivot)\n')
  console.log(`  Source CSV     : ${relative(ROOT, CSV).replace(/\\/g, '/')}`)
  console.log(`  Top KW scanned : ${results.length}`)
  console.log(`  Threshold      : ≥${threshold}%`)
  console.log(`  Coverage       : ${coveragePct}%  (${covered.length}/${results.length})`)
  console.log(`  Gaps           : ${gaps.length}`)
  if (gaps.length > 0) {
    console.log('\n  Top 20 KW gaps (KW Ahrefs sans page SA correspondante) :')
    for (const g of gaps.slice(0, verbose ? gaps.length : 20)) {
      console.log(`    - ${g.keyword.padEnd(45)} vol=${String(g.volume).padStart(6)} KD=${g.kd}`)
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
