#!/usr/bin/env node
/**
 * scripts/audit-title-length.mjs
 * ------------------------------
 * Vérifie que les helpers de truncation/fitting de title dans `generateMetadata`
 * dynamique utilisent une limite ≤ 46 char raw (≤ 65 char rendus après ajout
 * du brand suffix ` | ServicesArtisans` par le root layout).
 *
 * Pourquoi :
 *   - Le root layout (`src/app/layout.tsx`) applique `template: '%s | ServicesArtisans'`
 *     à tous les `title: '...'` raw → +19 char au rendu HTML.
 *   - Le pattern documenté dans `src/lib/seo/title-selector.ts` est `truncate(text, 41)`
 *     pour 41 + 19 = 60 char rendus (sous cutoff Google ~580px desktop / ~520px mobile).
 *   - On tolère jusqu'à 65 char rendus (46 raw + 19 brand) pour les variants riches.
 *   - Des templates utilisent à tort `truncate(text, 60)` ou `selectFittingTitle(..., 60)` :
 *     60 + 19 = 79 char rendus → Google tronque silencieusement, perte CTR.
 *
 * Patterns flagués :
 *   1. `truncate(..., N)` ou `truncateTitle(..., N)` avec N > 46
 *      Scope : assigné à `title` (clé d'objet metadata) ou `const title = ...`,
 *      y compris à l'intérieur de ternaires.
 *   2. `selectFittingTitle(..., ..., N)` avec N > 46
 *
 * Pas flagué :
 *   - `truncate(text, 41)` (pattern correct, default selectFittingTitle)
 *   - `truncate(text, 158)` description (différent du title — détecté via scope)
 *   - `title: { absolute: '...' }` (bypass brand suffix, hors scope)
 *   - Pages noindex / `(private)` / `/admin` / `/api` / `/auth`
 *   - Static `export const metadata = { title: '...' }` longs : couvert par
 *     `audit-meta-quality.mjs --strict` (audit dédié déjà câblé).
 *
 * Usage :
 *   node scripts/audit-title-length.mjs            # human
 *   node scripts/audit-title-length.mjs --json     # JSON
 *   node scripts/audit-title-length.mjs --strict   # exit 1 si gap
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, sep } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const BRAND_SUFFIX = ' | ServicesArtisans' // 19 char (cf. src/app/layout.tsx template)
const MAX_RENDERED = 65
const MAX_RAW = MAX_RENDERED - BRAND_SUFFIX.length // 46

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, acc)
    else if (entry === 'page.tsx' || entry === 'layout.tsx') acc.push(full)
  }
  return acc
}

function inferNoindex(src, file) {
  if (/robots\s*:\s*\{\s*[^}]*index\s*:\s*false/s.test(src)) return true
  if (/robots\s*:\s*\{\s*\.\.\.\s*noindex/i.test(src)) return true
  if (/NOT_FOUND_METADATA|NOINDEX_METADATA/.test(src)) return true
  if (/\/\(private\)\//.test(file)) return true
  if (/\/espace-artisan\/|\/espace-client\/|\/admin\//.test(file)) return true
  return false
}

function pathToRoute(file) {
  let route = file
    .replace(/^.*?src[\/\\]app/, '')
    .replace(/[\/\\](page|layout)\.tsx$/, '')
    .split(sep)
    .join('/')
  route = route.replace(/\/\([^)]+\)/g, '')
  return route || '/'
}

/**
 * Repère la ligne d'un offset dans le source.
 */
function lineOf(src, offset) {
  return src.substring(0, offset).split('\n').length
}

const ROOT = process.cwd()
const APP_DIR = join(ROOT, 'src', 'app')
const files = walk(APP_DIR)
const violations = []
let scanned = 0
let skipped = 0

for (const f of files) {
  const normalized = f.split(sep).join('/')
  const src = readFileSync(f, 'utf8')

  // Skip layouts qui ne définissent pas de generateMetadata ni metadata
  const isLayout = normalized.endsWith('/layout.tsx')
  const hasMeta =
    /export\s+(async\s+)?function\s+generateMetadata/.test(src) ||
    /export\s+const\s+metadata\s*[:=]/.test(src)
  if (isLayout && !hasMeta) continue
  if (!hasMeta) continue
  if (inferNoindex(src, normalized)) {
    skipped++
    continue
  }
  scanned++
  const route = pathToRoute(normalized)

  // 1) truncate(*, N) / truncateTitle(*, N) — flag si N > MAX_RAW
  // Parser balanced-parens : on cherche `truncate(` ou `truncateTitle(`, puis
  // on avance en comptant les parens (et en respectant les backticks/strings)
  // pour trouver le `)` de fermeture. La limite N est le dernier argument numérique.
  const callStartRe = /\b(truncate(?:Title)?)\s*\(/g
  let m
  while ((m = callStartRe.exec(src)) !== null) {
    const callStart = m.index
    const argsStart = m.index + m[0].length
    let i = argsStart
    let depth = 1
    let inSingle = false
    let inDouble = false
    let inBacktick = false
    let templateDepth = 0
    while (i < src.length && depth > 0) {
      const c = src[i]
      const prev = i > 0 ? src[i - 1] : ''
      if (inSingle) {
        if (c === "'" && prev !== '\\') inSingle = false
      } else if (inDouble) {
        if (c === '"' && prev !== '\\') inDouble = false
      } else if (inBacktick) {
        if (c === '$' && src[i + 1] === '{') {
          templateDepth++
          i++
        } else if (c === '}' && templateDepth > 0) {
          templateDepth--
        } else if (c === '`' && templateDepth === 0 && prev !== '\\') {
          inBacktick = false
        }
      } else {
        if (c === "'") inSingle = true
        else if (c === '"') inDouble = true
        else if (c === '`') inBacktick = true
        else if (c === '(') depth++
        else if (c === ')') depth--
      }
      i++
    }
    if (depth !== 0) continue // unbalanced — skip
    const argsEnd = i - 1 // position du `)` final
    const argsText = src.substring(argsStart, argsEnd)
    // Le dernier argument doit être un entier littéral pour qu'on flag.
    const lastArgMatch = argsText.match(/,\s*(\d+)\s*$/)
    if (!lastArgMatch) continue
    const limit = parseInt(lastArgMatch[1], 10)
    if (limit <= MAX_RAW) continue

    // Scope detection — chercher `const NAME =` ou `NAME:` le plus proche en arrière.
    const ctxStart = Math.max(0, callStart - 600)
    const ctx = src.substring(ctxStart, callStart)
    const assigns = [...ctx.matchAll(/\b(?:const\s+(\w+)\s*=|(\w+)\s*:)\s/g)]
    if (assigns.length === 0) continue
    const last = assigns[assigns.length - 1]
    const name = (last[1] ?? last[2] ?? '').toLowerCase()
    if (name !== 'title') continue

    violations.push({
      file: normalized.replace(ROOT.split(sep).join('/'), ''),
      route,
      line: lineOf(src, callStart),
      kind: 'truncate-too-loose',
      actual: limit,
      max: MAX_RAW,
      renderedEst: limit + BRAND_SUFFIX.length,
      snippet: src.substring(callStart, Math.min(callStart + 80, argsEnd + 1)),
    })
  }

  // 2) selectFittingTitle(variants, hash, N) — flag si N > MAX_RAW
  const selectRe =
    /\bselectFittingTitle\s*\(\s*[^,]+,\s*[^,]+,\s*(\d+)\s*\)/g
  while ((m = selectRe.exec(src)) !== null) {
    const limit = parseInt(m[1], 10)
    if (limit > MAX_RAW) {
      violations.push({
        file: normalized.replace(ROOT.split(sep).join('/'), ''),
        route,
        line: lineOf(src, m.index),
        kind: 'selectFitting-too-loose',
        actual: limit,
        max: MAX_RAW,
        renderedEst: limit + BRAND_SUFFIX.length,
        snippet: m[0].slice(0, 80),
      })
    }
  }

  // NOTE : les titres littéraux longs (>46c) dans `export const metadata = {...}`
  // statique sont couverts par `audit-meta-quality.mjs --strict` (audit dédié).
  // On évite la duplication en se limitant ici aux helpers dynamiques.
}

const report = {
  scanned,
  skipped,
  brandSuffix: BRAND_SUFFIX,
  maxRaw: MAX_RAW,
  maxRendered: MAX_RENDERED,
  violations,
}

if (jsonOut) {
  process.stdout.write(JSON.stringify(report, null, 2))
} else {
  console.log(
    `\nAudit title length — ${scanned} pages scannées (${skipped} noindex skipped)\n`
  )
  console.log(
    `  Règle : raw ≤ ${MAX_RAW} char + brand "${BRAND_SUFFIX}" (${BRAND_SUFFIX.length}c) = ≤ ${MAX_RENDERED}c rendus.\n`
  )
  if (violations.length === 0) {
    console.log('  OK — aucune violation.\n')
  } else {
    console.log(`  ${violations.length} violation(s) :\n`)
    const grouped = new Map()
    for (const v of violations) {
      if (!grouped.has(v.kind)) grouped.set(v.kind, [])
      grouped.get(v.kind).push(v)
    }
    for (const [kind, list] of grouped) {
      console.log(`  [${kind}] ${list.length}`)
      for (const v of list.slice(0, 50)) {
        const detail =
          v.kind === 'literal-title-too-long'
            ? `${v.actual}c → ${v.renderedEst}c rendu (${v.sample})`
            : `limite=${v.actual} → ${v.renderedEst}c rendu`
        console.log(`     - ${v.file}:${v.line}  ${detail}`)
      }
      if (list.length > 50) console.log(`     … +${list.length - 50} de plus`)
    }
    console.log('')
  }
}

if (strict && violations.length > 0) process.exit(1)
