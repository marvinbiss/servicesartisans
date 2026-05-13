#!/usr/bin/env node
/**
 * scripts/audit-heading-hierarchy.mjs
 * -----------------------------------
 * Vérifie que la hiérarchie de headings d'une page indexable respecte
 * l'ordre canonique : H1 → H2 → H3 → H4 → H5 → H6 sans saut de niveau.
 *
 * Pourquoi :
 *   - WCAG 2.1 1.3.1 "Info and Relationships" (niveau A) : les lecteurs
 *     d'écran naviguent par niveau — un H1 suivi d'un H4 casse l'outline.
 *   - Google utilise la hiérarchie pour construire la table des matières
 *     de la SERP (featured snippet, rich results).
 *   - SEO on-page : un H3 orphelin (sans H2 parent) est pénalisé comme
 *     « thin structure » sur les pSEO templates.
 *
 * Méthodologie :
 *   1. Pour chaque page.tsx indexable, collecter les tags `<h1>`..`<h6>`
 *      dans l'ordre d'apparition (en excluant les composants importés —
 *      ceux-ci sont considérés atomiques).
 *   2. Pour chaque page, appliquer la règle : pour tout hN rencontré,
 *      le niveau précédent doit être hN, hN-1, ou (si c'est le premier
 *      heading non-H1) h1.
 *
 * Exceptions documentées :
 *   - Certaines pages utilisent `<header>` + `<h3>` pour des blocks
 *     secondaires (ex: carte d'auteur, FAQ accordion). Tant que l'outline
 *     globale reste H1→H2→H3, ces H3 intercalés sont légitimes.
 *
 * Usage :
 *   node scripts/audit-heading-hierarchy.mjs            # human
 *   node scripts/audit-heading-hierarchy.mjs --json     # JSON
 *   node scripts/audit-heading-hierarchy.mjs --strict   # exit 1 si skip
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

function stripSafeComments(src) {
  // Retire `{/* ... */}` (JSX) et les lignes `//` : on évite `/* ... */`
  // brut pour ne pas matcher les strings contenant `*/` (cf. audit h1).
  return src.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/^\s*\/\/.*$/gm, '')
}

/**
 * Collecte la séquence des niveaux H1..H6 pour la vraie render function
 * de la page. Heuristique :
 *   1. Parmi tous les `return (...)` / `return <`, garder ceux qui
 *      contiennent un `<h1>` (= candidats "render principal").
 *   2. Parmi ces candidats, prendre la séquence la plus longue.
 *   3. Si aucun candidat → fallback sur la séquence la plus longue toutes
 *      branches confondues (= pages sans H1, qui seront flaggées par la
 *      validation).
 *
 * Cette approche évite de capturer des returns imbriqués dans des
 * `.map(item => return <h3>)` ou `authors.map(...)` qui ne sont PAS le
 * rendu principal de la page.
 */
function collectHeadingSequence(src) {
  const cleaned = stripSafeComments(src)
  const returnIdxs = [...cleaned.matchAll(/\breturn\s+[(<]/g)].map((m) => m.index ?? 0)
  if (returnIdxs.length === 0) return []

  let bestWithH1 = []
  let bestAny = []
  for (let i = 0; i < returnIdxs.length; i++) {
    const start = returnIdxs[i]
    const end = returnIdxs[i + 1] ?? cleaned.length
    const segment = cleaned.slice(start, end)
    const headings = [...segment.matchAll(/<(?:h([1-6])|PageHeroH1)\b/g)].map((m) =>
      m[1] ? parseInt(m[1], 10) : 1
    )
    if (headings.length === 0) continue
    if (headings.includes(1) && headings.length > bestWithH1.length) {
      bestWithH1 = headings
    }
    if (headings.length > bestAny.length) bestAny = headings
  }
  return bestWithH1.length > 0 ? bestWithH1 : bestAny
}

/**
 * Vérifie qu'une séquence de niveaux respecte la hiérarchie :
 *   - Le 1er heading rencontré est H1 (ou pas de heading = vide).
 *   - Chaque heading suivant est ≤ précédent + 1 (pas de saut de +2 ou +).
 *
 * Retourne une liste d'erreurs { position, prev_level, found_level }.
 */
function validateHierarchy(levels) {
  const errors = []
  if (levels.length === 0) return errors
  if (levels[0] !== 1) errors.push({ position: 0, prev_level: null, found_level: levels[0] })
  for (let i = 1; i < levels.length; i++) {
    const prev = levels[i - 1]
    const cur = levels[i]
    if (cur > prev + 1) {
      errors.push({ position: i, prev_level: prev, found_level: cur })
    }
  }
  return errors
}

const pages = walk('src/app')
const gaps = []
let indexable = 0
let clean = 0

for (const f of pages) {
  const normalized = f.split(sep).join('/')
  const src = readFileSync(f, 'utf8')
  const hasMeta =
    /export\s+(async\s+)?function\s+generateMetadata/.test(src) ||
    /export\s+const\s+metadata\s*[:=]/.test(src)
  if (!hasMeta) continue
  if (inferNoindex(src, normalized)) continue
  indexable++

  const sequence = collectHeadingSequence(src)
  const errors = validateHierarchy(sequence)
  if (errors.length === 0) {
    clean++
  } else {
    gaps.push({
      route: pathToRoute(normalized),
      file: normalized,
      heading_sequence: sequence,
      errors,
    })
  }
}

const report = {
  indexable_pages: indexable,
  pages_clean_hierarchy: clean,
  pages_with_gap: gaps.length,
  coverage_pct: indexable === 0 ? 100 : Number(((clean / indexable) * 100).toFixed(1)),
  gaps,
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Heading Hierarchy Audit (H1→H2→H3 sans saut)\n')
  console.log(`  Pages indexables scannées  : ${report.indexable_pages}`)
  console.log(`  Hiérarchie correcte        : ${report.pages_clean_hierarchy}`)
  console.log(`  Pages avec saut de niveau  : ${report.pages_with_gap}`)
  console.log(`  Coverage                   : ${report.coverage_pct}%\n`)

  if (gaps.length === 0) {
    console.log('  ✅ Toutes les pages respectent la hiérarchie H1→H2→H3...\n')
  } else {
    console.log('  ⚠️  Pages avec saut de niveau heading :')
    for (const g of gaps.slice(0, 30)) {
      const err = g.errors[0]
      const preview = g.heading_sequence.slice(0, 12).join('→') + (g.heading_sequence.length > 12 ? '...' : '')
      const detail = err.prev_level == null
        ? `commence par H${err.found_level} (attendu H1)`
        : `saut H${err.prev_level} → H${err.found_level}`
      console.log(`     ${g.route.padEnd(50)} [${detail}]`)
      console.log(`        seq: ${preview}`)
    }
    if (gaps.length > 30) console.log(`     ... et ${gaps.length - 30} de plus`)
    console.log('')
  }
}

if (strict && gaps.length > 0) process.exit(1)
