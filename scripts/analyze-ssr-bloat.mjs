#!/usr/bin/env node
/**
 * Estime le word-count réel SSR d'une page en simulant les .map() sur
 * les arrays connus (villes, services, regions, departements, etc.).
 * Plus précis que audit-content-depth.mjs qui ne suit pas .map().
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, sep } from 'node:path'

const ARRAY_SIZES = {
  villes: 2627,
  services: 30,
  regions: 13,
  departements: 101,
  allArticlesMeta: 800,
  allBlogTags: 200,
  allCategories: 17,
  blogCategories: 17,
  topCities: 20,
  topEmergencyCities: 12,
  tradeSlugs: 12,
  REGIONAL_PRICING: 8,
  emergencySteps: 3,
  urgencyServices: 3,
  sortedRegions: 13,
  calendrierTravaux: 12,
  validServiceSlugs: 30,
  allServiceItems: 24,
  allServices: 6,
  faqItems: 5,
  tldrBullets: 4,
  enBrefPoints: 4,
  ssrArticles: 12,
  topTags: 30,
  categoryCounts: 8,
  top: 12,
  regionVilles: 200,
  regionDepts: 8,
  seasonMonths: 3,
}

const TRADE_FIELD_SIZES = {
  commonTasks: 8,
  faq: 6,
  tips: 6,
  certifications: 3,
  problems: 6,
}

function walkPages(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walkPages(full, acc)
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
  let route = file.replace(/^.*?src[\/\\]app/, '').replace(/[\/\\]page\.tsx$/, '').split(sep).join('/')
  return route.replace(/\/\([^)]+\)/g, '') || '/'
}

function isLikelyTailwind(s) {
  // Heuristique : >50% des tokens sont des classes Tailwind / variants
  const tokens = s.split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return false
  let twCount = 0
  const tailwindPrefixes = /^(bg-|text-|p[xytlrb]?-|m[xytlrb]?-|rounded|border|shadow|flex|grid|gap|hover:|focus|md:|lg:|sm:|xl:|space-|w-|h-|max-|min-|font-|leading|tracking|align|justify|items|self-|absolute|relative|inset-|top-|left-|right-|bottom-|z-|opacity|cursor|overflow|transition|duration|ease|transform|translate|scale|rotate|backdrop|whitespace|line-clamp|object-|aspect-|order-|col-|row-|sticky|block|inline|hidden|group|peer|first|last|odd|even|placeholder|caret|outline|ring|filter|blur)/
  for (const t of tokens) {
    if (tailwindPrefixes.test(t)) twCount++
  }
  return twCount / tokens.length > 0.5
}

function countDirectWords(src) {
  let working = src
    .replace(/^import\s[^;\n]+$/gm, '')
    .replace(/export\s+const\s+(metadata|viewport)(?:\s*:\s*\w+)?\s*=\s*\{[\s\S]*?\n\}/g, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  working = working.replace(/<script[\s\S]*?<\/script>/g, '')
  // Strip className/class attributes (Tailwind soup) and key=, href=, etc.
  working = working.replace(/(class|className)\s*=\s*\{[^}]+\}/g, '')
  working = working.replace(/(class|className)\s*=\s*["'`][^"'`]+["'`]/g, '')
  // Strip style={{...}} props
  working = working.replace(/style\s*=\s*\{\{[^}]+\}\}/g, '')

  let total = 0
  const textRe = />([^<{]+)</g
  for (const m of working.matchAll(textRe)) {
    for (const tok of m[1].trim().split(/\s+/)) {
      if (tok.length >= 2 && /[a-zA-ZÀ-ſ]/.test(tok)) total++
    }
  }
  const attrRe = /(?:title|alt|aria-label|placeholder)\s*=\s*["']([^"']{3,})["']/g
  for (const m of working.matchAll(attrRe)) {
    for (const tok of m[1].split(/\s+/)) {
      if (tok.length >= 2 && /[a-zA-ZÀ-ſ]/.test(tok)) total++
    }
  }
  const longStrRe = /["'`]([^"'`]{40,})["'`]/g
  for (const m of working.matchAll(longStrRe)) {
    if (/\s/.test(m[1]) && !isLikelyTailwind(m[1])) {
      for (const tok of m[1].split(/\s+/)) {
        if (tok.length >= 2 && /[a-zA-ZÀ-ſ]/.test(tok)) total++
      }
    }
  }
  return total
}

function estimateMapBloat(src) {
  let total = 0
  const matches = []
  const seen = new Set()

  // trade.X.map / trade.X.slice(0, N).map en premier (plus spécifique)
  const tradeMapRe = /trade\.(\w+)(?:\.slice\(\s*0\s*,\s*(\d+)\s*\))?\.map\s*\(/g
  for (const m of src.matchAll(tradeMapRe)) {
    const field = m[1]
    const sliceN = m[2] ? parseInt(m[2], 10) : null
    const fieldSize = TRADE_FIELD_SIZES[field] ?? 5
    const effectiveSize = sliceN != null ? Math.min(sliceN, fieldSize) : fieldSize

    const startIdx = m.index + m[0].length
    let depth = 1
    let i = startIdx
    while (i < src.length && depth > 0) {
      if (src[i] === '(') depth++
      else if (src[i] === ')') depth--
      i++
      if (i - startIdx > 4000) break
    }
    seen.add(`${m.index}-${i}`)
    const callbackBody = src.slice(startIdx, i)
    const callbackWords = countDirectWords(callbackBody)
    const itemBloat = effectiveSize * callbackWords
    matches.push({ arr: `trade.${field}`, size: effectiveSize, perItem: callbackWords, total: itemBloat })
    total += itemBloat
  }

  const mapRe = /(\b[a-zA-Z_][a-zA-Z0-9_]*)(?:\.slice\(\s*0\s*,\s*(\d+)\s*\))?\.map\s*\(/g
  for (const m of src.matchAll(mapRe)) {
    const arrName = m[1]
    if (arrName === 'trade') continue
    if (ARRAY_SIZES[arrName] == null) continue
    const sliceN = m[2] ? parseInt(m[2], 10) : null
    const arrSize = ARRAY_SIZES[arrName]
    const effectiveSize = sliceN != null ? Math.min(sliceN, arrSize) : arrSize

    const startIdx = m.index + m[0].length
    let depth = 1
    let i = startIdx
    while (i < src.length && depth > 0) {
      if (src[i] === '(') depth++
      else if (src[i] === ')') depth--
      i++
      if (i - startIdx > 4000) break
    }
    if (seen.has(`${m.index}-${i}`)) continue
    const callbackBody = src.slice(startIdx, i)
    const callbackWords = countDirectWords(callbackBody)
    const itemBloat = effectiveSize * callbackWords
    matches.push({ arr: arrName, size: effectiveSize, perItem: callbackWords, total: itemBloat })
    total += itemBloat
  }

  return { total, matches }
}

const pages = walkPages('src/app')
const results = []

for (const f of pages) {
  const normalized = f.split(sep).join('/')
  const src = readFileSync(f, 'utf8')
  const hasMeta =
    /export\s+(async\s+)?function\s+generateMetadata/.test(src) ||
    /export\s+const\s+metadata\s*[:=]/.test(src)
  if (!hasMeta) continue
  if (inferNoindex(src, normalized)) continue

  const direct = countDirectWords(src)
  const { total: mapBloat, matches } = estimateMapBloat(src)
  const estimated = direct + mapBloat
  results.push({
    route: pathToRoute(normalized),
    file: normalized,
    direct,
    mapBloat,
    estimated,
    topMatches: matches.sort((a, b) => b.total - a.total).slice(0, 5),
  })
}

results.sort((a, b) => b.estimated - a.estimated)

console.log('\nSSR Word-Count Estimate (direct JSX + simulated .map() iterations)\n')
console.log('Top 40 pages by estimated SSR word count:\n')
console.log('     EST  DIRECT  MAP_BLOAT  ROUTE')
console.log('     ---  ------  ---------  -----')
for (const r of results.slice(0, 40)) {
  console.log(
    `  ${String(r.estimated).padStart(6)}  ${String(r.direct).padStart(6)}  ${String(r.mapBloat).padStart(9)}  ${r.route}`
  )
}

console.log('\nPages au-dessus du seuil cible 3500 mots:\n')
const offenders = results.filter((r) => r.estimated > 3500)
console.log(`  ${offenders.length} pages > 3500 mots SSR estimé\n`)
for (const r of offenders) {
  console.log(`  ${r.estimated} mots — ${r.route}`)
  for (const m of r.topMatches) {
    if (m.total > 200) {
      console.log(`    └─ ${m.arr} × ${m.size} × ${m.perItem} mots/item = ${m.total}`)
    }
  }
  console.log()
}

console.log(`Total scanné : ${results.length} pages indexables`)
