#!/usr/bin/env node
/**
 * scripts/audit-near-duplicates.mjs
 * ---------------------------------
 * Détecte les pages indexables dont le contenu textuel est quasi-identique
 * (near-duplicate). Critique pour un site avec ~459K pages pSEO : Google
 * déclasse ou désindexe les grappes de templates sans variance réelle
 * (Panda / Helpful Content System, Search Central 2026).
 *
 * Pourquoi :
 *   - Quality Raters Guidelines §7.4 : "low effort auto-generated content"
 *     = thin/dupe = Low Quality.
 *   - Le crawl budget est gaspillé sur des pages qui n'apportent pas de
 *     signal unique : elles occupent la queue "crawled — not indexed".
 *   - Helpful Content System pénalise globalement le site si trop de
 *     pages identiques.
 *
 * Méthodologie :
 *   1. Scanner les page.tsx STATIQUES indexables (pas de dynamic routes,
 *      pas de noindex). On exclut les pages CMS/runtime (faux positifs).
 *   2. Extraire le texte rendu statiquement (JSX literals, attributs, data
 *      arrays) — même logique que audit-content-depth.
 *   3. Calculer un shingle set (n-grams de 5 mots normalisés, lower-case,
 *      stop-words retirés, ponctuation nettoyée).
 *   4. Comparer chaque paire via Jaccard similarity (|A∩B| / |A∪B|).
 *   5. Flag les paires avec similarité ≥ SEUIL (0.85 = near-duplicate).
 *
 * Optimisations :
 *   - MinHash LSH ferait mieux à large échelle, mais on a typiquement
 *     < 300 pages statiques uniques (le gros du volume est dynamique,
 *     non scanné ici). O(n²) est acceptable.
 *
 * Usage :
 *   node scripts/audit-near-duplicates.mjs             # human
 *   node scripts/audit-near-duplicates.mjs --json      # JSON
 *   node scripts/audit-near-duplicates.mjs --strict    # exit 1 si dup
 *   node scripts/audit-near-duplicates.mjs --threshold=0.80
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, sep, dirname } from 'node:path'

const args = process.argv.slice(2)
const strict = args.includes('--strict')
const jsonOut = args.includes('--json')
const thresholdArg = args.find((a) => a.startsWith('--threshold='))
const THRESHOLD = thresholdArg ? parseFloat(thresholdArg.split('=')[1]) : 0.85
const SHINGLE_N = 5

// Stop-words français courants (filtrage bruit pour n-grams).
const STOP = new Set([
  'a', 'à', 'au', 'aux', 'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du',
  'et', 'ou', 'ni', 'mais', 'donc', 'or', 'car', 'si', 'que', 'qui', 'quoi',
  'dont', 'où', 'en', 'sur', 'sous', 'pour', 'par', 'avec', 'sans', 'dans',
  'est', 'sont', 'être', 'avoir', 'fait', 'faire', 'ce', 'cet', 'cette',
  'ces', 'son', 'sa', 'ses', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes',
  'notre', 'nos', 'votre', 'vos', 'leur', 'leurs', 'il', 'elle', 'ils',
  'elles', 'on', 'nous', 'vous', 'je', 'tu', 'me', 'te', 'se', 'lui',
  'y', 'ne', 'pas', 'plus', 'peu', 'très', 'bien', 'aussi', 'même',
  'tout', 'tous', 'toute', 'toutes', 'autre', 'autres', 'chaque',
])

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

function isDynamicRoute(file) {
  return /\[[^\]]+\]/.test(file)
}

function isRuntimeContentHeavy(src) {
  if (/\bgetPageContent\s*\(/.test(src)) return true
  if (/\bCmsContent\b/.test(src)) return true
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

/**
 * Extrait les tokens textuels (mêmes règles que audit-content-depth) et
 * les normalise : lower-case, accents, ponctuation retirée, stop-words
 * filtrés.
 */
function extractTokens(src) {
  let working = src
    .replace(/^import\s[^;\n]+$/gm, '')
    .replace(
      /export\s+const\s+(metadata|viewport)(?:\s*:\s*\w+)?\s*=\s*\{[\s\S]*?\n\}/g,
      ''
    )
    .replace(
      /export\s+const\s+(revalidate|dynamic|dynamicParams|fetchCache|runtime|preferredRegion|maxDuration)\s*=\s*[^\n]+/g,
      ''
    )
  working = working.replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  working = working
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')

  const tokens = []
  const textRe = />([^<{]*)</g
  for (const m of working.matchAll(textRe)) {
    for (const tok of m[1].split(/\s+/)) {
      const norm = normalize(tok)
      if (norm) tokens.push(norm)
    }
  }
  const attrWordRe = /(?:title|alt|aria-label|placeholder|aria-describedby)\s*=\s*["']([^"']{3,})["']/g
  for (const m of working.matchAll(attrWordRe)) {
    for (const tok of m[1].split(/\s+/)) {
      const norm = normalize(tok)
      if (norm) tokens.push(norm)
    }
  }
  const dataStringRe = /["'`]([^"'`]{40,})["'`]/g
  for (const m of working.matchAll(dataStringRe)) {
    const txt = m[1]
    if (/\s/.test(txt)) {
      for (const tok of txt.split(/\s+/)) {
        const norm = normalize(tok)
        if (norm) tokens.push(norm)
      }
    }
  }
  return tokens
}

function normalize(tok) {
  const lower = tok
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')
  if (lower.length < 2) return null
  if (STOP.has(lower)) return null
  return lower
}

function shingles(tokens, n = SHINGLE_N) {
  const set = new Set()
  for (let i = 0; i <= tokens.length - n; i++) {
    set.add(tokens.slice(i, i + n).join(' '))
  }
  return set
}

function jaccard(a, b) {
  if (a.size === 0 && b.size === 0) return 1
  if (a.size === 0 || b.size === 0) return 0
  let inter = 0
  const smaller = a.size < b.size ? a : b
  const larger = a.size < b.size ? b : a
  for (const s of smaller) if (larger.has(s)) inter++
  const union = a.size + b.size - inter
  return inter / union
}

// Import depth-1 agrégation (même logique que content-depth)
function tokensWithImports(file, src, depth = 1) {
  const tokens = extractTokens(src)
  if (depth === 0) return tokens
  const pageDir = dirname(file)
  const importRe = /import\s+\w+\s+from\s+['"](\.\/[^'"]+|@\/[^'"]+)['"]/g
  for (const m of src.matchAll(importRe)) {
    const spec = m[1]
    if (/^@\/(hooks|lib|types|contexts|stores)(\/|$)/.test(spec)) continue
    const candidates = []
    if (spec.startsWith('./')) {
      const base = `${pageDir}/${spec.replace(/^\.\//, '')}`
      candidates.push(base + '.tsx', base + '.ts', `${base}/index.tsx`)
    } else if (spec.startsWith('@/')) {
      const base = spec.replace(/^@\//, 'src/')
      candidates.push(base + '.tsx', base + '.ts', `${base}/index.tsx`)
    }
    for (const c of candidates) {
      if (existsSync(c)) {
        try {
          tokens.push(...extractTokens(readFileSync(c, 'utf8')))
        } catch {}
        break
      }
    }
  }
  return tokens
}

const pages = walk('src/app')
const corpus = [] // [{ route, file, shingles }]
let skippedDynamic = 0
let skippedRuntime = 0
let skippedShort = 0

for (const f of pages) {
  const normalized = f.split(sep).join('/')
  if (isDynamicRoute(normalized)) {
    skippedDynamic++
    continue
  }
  const src = readFileSync(f, 'utf8')
  const hasMeta =
    /export\s+(async\s+)?function\s+generateMetadata/.test(src) ||
    /export\s+const\s+metadata\s*[:=]/.test(src)
  if (!hasMeta) continue
  if (inferNoindex(src, normalized)) continue
  if (isRuntimeContentHeavy(src)) {
    skippedRuntime++
    continue
  }
  const tokens = tokensWithImports(f, src, 1)
  const sh = shingles(tokens)
  // Skip pages trop courtes (sous SHINGLE_N*2) : bruit
  if (sh.size < SHINGLE_N * 2) {
    skippedShort++
    continue
  }
  corpus.push({ route: pathToRoute(normalized), file: normalized, shingles: sh })
}

const duplicates = []
for (let i = 0; i < corpus.length; i++) {
  for (let j = i + 1; j < corpus.length; j++) {
    const sim = jaccard(corpus[i].shingles, corpus[j].shingles)
    if (sim >= THRESHOLD) {
      duplicates.push({
        a: corpus[i].route,
        b: corpus[j].route,
        fileA: corpus[i].file,
        fileB: corpus[j].file,
        similarity: Number(sim.toFixed(3)),
      })
    }
  }
}

duplicates.sort((x, y) => y.similarity - x.similarity)

const report = {
  threshold: THRESHOLD,
  shingle_n: SHINGLE_N,
  pages_compared: corpus.length,
  skipped_dynamic: skippedDynamic,
  skipped_runtime_content: skippedRuntime,
  skipped_short: skippedShort,
  duplicate_pairs: duplicates.length,
  pairs: duplicates.slice(0, 50),
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log(`\n📋 Near-Duplicate Template Audit (Jaccard ≥ ${THRESHOLD}, ${SHINGLE_N}-grams)\n`)
  console.log(`  Pages comparées              : ${report.pages_compared}`)
  console.log(`  Pages dynamiques skippées    : ${report.skipped_dynamic}`)
  console.log(`  Pages CMS/runtime skippées   : ${report.skipped_runtime_content}`)
  console.log(`  Pages trop courtes skippées  : ${report.skipped_short}`)
  console.log(`  Paires duplicates            : ${report.duplicate_pairs}\n`)
  if (duplicates.length === 0) {
    console.log(`  ✅ Aucune paire de pages ≥ ${THRESHOLD * 100}% similaires.\n`)
  } else {
    console.log(`  ⚠️  Paires duplicates (top 30) :\n`)
    for (const p of duplicates.slice(0, 30)) {
      console.log(`     ${(p.similarity * 100).toFixed(1)}%  ${p.a}`)
      console.log(`            ↔  ${p.b}`)
    }
    if (duplicates.length > 30) console.log(`\n     ... et ${duplicates.length - 30} de plus`)
    console.log('')
  }
}

if (strict && duplicates.length > 0) process.exit(1)
