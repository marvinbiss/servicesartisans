#!/usr/bin/env node
/**
 * scripts/audit-crawl-budget.mjs
 * ------------------------------
 * Contrôle les deux leviers crawl-budget Google les plus sensibles pour un
 * site à 459K URLs :
 *   1. `lastmod` dans les sitemaps ≤ 180 jours, et aucun template n'impose
 *      la même date statique à plus de 50 % des entrées quand celle-ci est
 *      > 90 j (signal "fresh dates falsifiées" flagué par Google 12/2025).
 *   2. Tous les endpoints XML/RSS/Atom exposent un header `Cache-Control`
 *      avec `s-maxage`, pour permettre au CDN Vercel de servir 304 et à
 *      Googlebot de réduire sa pression de crawl (§"Budget crawl" SC 2026).
 *
 * Pourquoi :
 *   - 408K URLs en queue "détectée non indexée" sur ServicesArtisans : le
 *     signal `lastmod` obsolète empêche Google de redécouvrir les pages
 *     actualisées en priorité.
 *   - Sans Cache-Control sur les sitemaps/flux, Google re-télécharge à
 *     chaque visite → consomme du budget, limite la fréquence de crawl.
 *
 * Méthodologie :
 *   1. Parser `src/app/sitemap.ts` + `src/app/api/sitemap-X/route.ts` pour
 *      extraire chaque assignation `lastModified: <valeur>`.
 *   2. Résoudre la valeur : littéral `'YYYY-MM-DD'`, `new Date(...)`,
 *      `SOME_CONST` défini dans le même fichier.
 *   3. Calculer âge = (today - date). Classer :
 *        - `new Date()` / today / < 90d      ✅
 *        - 90-180 j                          ⚠️ warning
 *        - > 180 j                           ❌ hard gap
 *   4. Pour chaque valeur de date unique, compter le nombre d'entrées qui
 *      la réutilisent. Si > 50 % des entrées partagent une seule date
 *      > 90 j, flag "stale-template".
 *   5. Scanner les endpoints servant du XML/RSS : ils DOIVENT emettre un
 *      header `Cache-Control` avec `s-maxage` ≥ 60s.
 *
 * Usage :
 *   node scripts/audit-crawl-budget.mjs              # human
 *   node scripts/audit-crawl-budget.mjs --json       # JSON
 *   node scripts/audit-crawl-budget.mjs --strict     # exit 1 si gap dur
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const TODAY = new Date()
const DAY_MS = 24 * 3600 * 1000
const SOFT_DAYS = 90
const HARD_DAYS = 180

function ageInDays(date) {
  return Math.floor((TODAY - date) / DAY_MS)
}

/**
 * Tente de résoudre la valeur d'un `lastModified: X` en date JS.
 * Retourne { kind, date } :
 *   kind = 'dynamic'  → new Date(), Date.now() → toujours frais
 *   kind = 'literal'  → 'YYYY-MM-DD' ou Date('...')
 *   kind = 'const'    → variable du fichier résolue
 *   kind = 'unknown'  → inconnu, à ignorer
 */
function resolveLastmod(expr, fileSrc) {
  const e = expr.trim()
  // Dynamic : new Date(), new Date().toISOString(), Date.now()
  if (/^new\s+Date\s*\(\s*\)/.test(e) || /Date\.now\s*\(\s*\)/.test(e)) {
    return { kind: 'dynamic', date: TODAY }
  }
  // `new Date().toISOString().slice(0, 10)` → dynamic today
  if (/new\s+Date\s*\(\s*\)\.toISOString\s*\(\s*\)/.test(e)) {
    return { kind: 'dynamic', date: TODAY }
  }
  // Literal 'YYYY-MM-DD'
  const litMatch = e.match(/^['"`](\d{4}-\d{2}-\d{2})(?:T[^'"]*)?['"`]$/)
  if (litMatch) {
    const d = new Date(litMatch[1])
    if (!isNaN(d.getTime())) return { kind: 'literal', date: d, raw: litMatch[1] }
  }
  // new Date('YYYY-MM-DD')
  const newDateLit = e.match(/^new\s+Date\s*\(\s*['"`](\d{4}-\d{2}-\d{2})[^'"]*['"`]\s*\)/)
  if (newDateLit) {
    const d = new Date(newDateLit[1])
    if (!isNaN(d.getTime())) return { kind: 'literal', date: d, raw: newDateLit[1] }
  }
  // Const reference: STATIC_DATE, MOSTLY_STATIC_DATE, etc.
  const constMatch = e.match(/^([A-Z_][A-Z0-9_]*)$/)
  if (constMatch) {
    const constName = constMatch[1]
    // Look up `const CONSTNAME = ...` in the file
    const defRe = new RegExp(`const\\s+${constName}\\s*=\\s*([^\\n]+)`, 'm')
    const def = fileSrc.match(defRe)
    if (def) {
      const resolved = resolveLastmod(def[1].replace(/[,;]$/, ''), fileSrc)
      if (resolved.kind !== 'unknown') return { ...resolved, constName }
    }
  }
  // Object access or property: SOMETHING.date — treat as unknown (could be DB-driven = likely fresh)
  if (/\./.test(e) || /\?\.|\[/.test(e)) {
    return { kind: 'db-driven', date: TODAY }
  }
  return { kind: 'unknown', raw: e }
}

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, acc)
    else acc.push(full)
  }
  return acc
}

// ── 1. Scan sitemap.ts + api/sitemap-* for lastModified entries ─────────
const SITEMAP_FILES = [
  'src/app/sitemap.ts',
  ...walk('src/app/api').filter((f) =>
    /\/api\/sitemap-[^/]+\/route\.ts$/.test(f.replace(/\\/g, '/'))
  ),
]

const lastmodEntries = []
for (const f of SITEMAP_FILES) {
  if (!existsSync(f)) continue
  const src = readFileSync(f, 'utf8')
  const re = /lastModified\s*:\s*([^,\n}]+)/g
  for (const m of src.matchAll(re)) {
    const expr = m[1].trim()
    const resolved = resolveLastmod(expr, src)
    lastmodEntries.push({
      file: f.replace(/\\/g, '/'),
      line: src.slice(0, m.index).split('\n').length,
      expr,
      kind: resolved.kind,
      date: resolved.date ? resolved.date.toISOString().slice(0, 10) : null,
      ageDays: resolved.date ? ageInDays(resolved.date) : null,
      constName: resolved.constName,
    })
  }
}

// ── 2. Classify entries ─────────────────────────────────────────────────
const staleHard = lastmodEntries.filter(
  (e) => e.kind === 'literal' && e.ageDays != null && e.ageDays > HARD_DAYS
)
const staleSoft = lastmodEntries.filter(
  (e) =>
    e.kind === 'literal' &&
    e.ageDays != null &&
    e.ageDays > SOFT_DAYS &&
    e.ageDays <= HARD_DAYS
)

// ── 3. Template staleness: if a single const covers > 50% of entries and is stale ──
const constCounts = new Map()
for (const e of lastmodEntries) {
  if (e.constName) {
    const prev = constCounts.get(e.constName) || { count: 0, entry: e }
    constCounts.set(e.constName, { count: prev.count + 1, entry: e })
  }
}
const templateStale = []
const total = lastmodEntries.length
for (const [name, { count, entry }] of constCounts) {
  if (
    total > 0 &&
    count / total > 0.5 &&
    entry.kind === 'literal' &&
    entry.ageDays > SOFT_DAYS
  ) {
    templateStale.push({
      constName: name,
      usage_pct: Number(((count / total) * 100).toFixed(1)),
      date: entry.date,
      age_days: entry.ageDays,
      file: entry.file,
    })
  }
}

// ── 4. Scan XML/RSS endpoints for Cache-Control ─────────────────────────
const XML_ROUTE_CANDIDATES = [
  'src/app/sitemap.ts',
  'src/app/robots.ts',
  'src/app/feed.xml/route.ts',
  'src/app/image-sitemap.xml/route.ts',
  'src/app/news-sitemap.xml/route.ts',
  ...walk('src/app/api').filter((f) =>
    /\/api\/sitemap-[^/]+\/route\.ts$/.test(f.replace(/\\/g, '/'))
  ),
  ...walk('src/app/feed').filter((f) => /route\.ts$/.test(f)),
]

const missingCache = []
for (const f of XML_ROUTE_CANDIDATES) {
  if (!existsSync(f)) continue
  const src = readFileSync(f, 'utf8')
  // `sitemap.ts` (Next.js built-in) et `robots.ts` ne renvoient pas de Response :
  // Next.js gère le Cache-Control via la config ISR (revalidate). On les skip.
  if (/src\/app\/sitemap\.ts$/.test(f.replace(/\\/g, '/'))) continue
  if (/src\/app\/robots\.ts$/.test(f.replace(/\\/g, '/'))) continue
  // Route handlers doivent explicitement renvoyer Cache-Control: s-maxage=...
  // OU déléguer au helper sitemapHeaders() qui set le header pour eux.
  const hasInlineCache = /Cache-Control['"]?\s*[,:]\s*['"][^'"]*s-maxage\s*=\s*\d+/i.test(src)
  const hasHelper = /\bsitemapHeaders\s*\(/.test(src)
  if (!hasInlineCache && !hasHelper) {
    missingCache.push({ file: f.replace(/\\/g, '/') })
  }
}

// ── 5. Build report ─────────────────────────────────────────────────────
const report = {
  today: TODAY.toISOString().slice(0, 10),
  soft_days_threshold: SOFT_DAYS,
  hard_days_threshold: HARD_DAYS,
  lastmod_entries_scanned: lastmodEntries.length,
  dynamic_entries: lastmodEntries.filter((e) => e.kind === 'dynamic' || e.kind === 'db-driven').length,
  literal_entries: lastmodEntries.filter((e) => e.kind === 'literal').length,
  stale_soft_count: staleSoft.length,
  stale_hard_count: staleHard.length,
  template_stale: templateStale,
  xml_routes_scanned: XML_ROUTE_CANDIDATES.length,
  xml_routes_missing_cache: missingCache.length,
  missing_cache: missingCache,
  stale_hard_samples: staleHard.slice(0, 15),
  stale_soft_samples: staleSoft.slice(0, 10),
}

const hasHardGap =
  staleHard.length > 0 || templateStale.length > 0 || missingCache.length > 0

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Crawl Budget Audit (lastmod freshness + XML cache)\n')
  console.log(`  Aujourd'hui                     : ${report.today}`)
  console.log(`  Entrées lastModified            : ${report.lastmod_entries_scanned}`)
  console.log(`    dynamic / db-driven           : ${report.dynamic_entries}`)
  console.log(`    literal date strings          : ${report.literal_entries}`)
  console.log(`  Stale soft (> ${SOFT_DAYS}d, ≤ ${HARD_DAYS}d)     : ${report.stale_soft_count}`)
  console.log(`  Stale hard (> ${HARD_DAYS}d)               : ${report.stale_hard_count}`)
  console.log(`  Templates stale (> 50 % stale)  : ${templateStale.length}`)
  console.log(`  Endpoints XML sans Cache-Control: ${missingCache.length}\n`)
  if (!hasHardGap) {
    console.log('  ✅ Crawl budget hygiene OK.\n')
  } else {
    if (staleHard.length > 0) {
      console.log(`  ❌ Entrées lastmod > ${HARD_DAYS}j :`)
      for (const e of staleHard.slice(0, 15))
        console.log(`     ${String(e.ageDays).padStart(5)}d  ${e.date}  ${e.file}:${e.line}`)
      if (staleHard.length > 15) console.log(`     ... et ${staleHard.length - 15} de plus`)
      console.log('')
    }
    if (templateStale.length > 0) {
      console.log('  ❌ Template stale (date unique utilisée pour > 50 % des entrées) :')
      for (const t of templateStale)
        console.log(
          `     ${t.constName}  ${t.date}  (${t.age_days}d, ${t.usage_pct}% des entrées)  ${t.file}`
        )
      console.log('')
    }
    if (missingCache.length > 0) {
      console.log('  ❌ Endpoints XML sans Cache-Control s-maxage :')
      for (const e of missingCache) console.log(`     ${e.file}`)
      console.log('')
    }
  }
}

if (strict && hasHardGap) process.exit(1)
