#!/usr/bin/env node
/**
 * scripts/audit-crawl-traps.mjs
 * -----------------------------
 * Détecte les "crawl traps" : pages indexables qui renvoient 200 avec un
 * état vide visible ("Aucun artisan", "0 résultat", "Pas encore") sans
 * déclencher `notFound()` ni passer en `robots: noindex`.
 *
 * Pourquoi :
 *   - Google classe ces pages "soft 404" → elles occupent le budget de
 *     crawl sans jamais être indexées, et polluent la queue GSC
 *     "découverte — non indexée" (cf. 408K URLs ServicesArtisans).
 *   - Quality Raters : pages à contenu vide = Low Quality.
 *   - Bug upstream Next.js 14.2 (#69103) : `notFound()` renvoie 200 sur ISR
 *     + dynamicParams=true. Mitigation via `robots: noindex` conditionnel
 *     (déjà documenté en mémoire).
 *
 * Règle : pour chaque page qui contient un de ces marqueurs textuels
 * d'état vide, elle DOIT avoir :
 *   - soit un `notFound()` précédent sur la condition count === 0
 *   - soit un `robots: { index: false }` conditionnel
 *   - soit être déjà globalement noindex (skip)
 *
 * Méthodologie :
 *   1. Scanner les page.tsx indexables.
 *   2. Détecter la présence d'un texte d'état vide (copy "Aucun X trouvé",
 *      "0 résultat", "Pas encore", "Rien trouvé").
 *   3. Si présent, vérifier que la page contient AU MOINS UNE :
 *        - `notFound()` sur condition `length === 0` / `!X.length` / `!X`
 *        - `index: false` conditionnel (robots computed selon count)
 *   4. Sinon → crawl trap = hard gap.
 *
 * Usage :
 *   node scripts/audit-crawl-traps.mjs            # human
 *   node scripts/audit-crawl-traps.mjs --json     # JSON
 *   node scripts/audit-crawl-traps.mjs --strict   # exit 1 si gap
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
  if (/robots\s*:\s*\{\s*[^}]*index\s*:\s*false/s.test(src)) {
    // Globally noindex (not conditional): flag true
    // Check if this is unconditional (returned directly from metadata)
    const metaRe = /export\s+const\s+metadata\s*[:=]\s*\{[\s\S]*?robots\s*:\s*\{\s*index\s*:\s*false/
    if (metaRe.test(src)) return true
  }
  if (/\/\(private\)\//.test(file)) return true
  if (/\/espace-artisan\/|\/espace-client\/|\/admin\//.test(file)) return true
  if (/NOT_FOUND_METADATA|NOINDEX_METADATA/.test(src)) return true
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

// Empty-state copy patterns — highly indicative of soft 404 risk when visible.
const EMPTY_STATE_PATTERNS = [
  /Aucun\s+(artisan|résultat|article|avis|professionnel|partenaire)\s+(trouvé|disponible)/i,
  /0\s+(artisans?|résultats?|articles?|avis)\s+(trouvés?|disponibles?)/i,
  /Pas\s+encore\s+d['’]?\s*(artisan|résultat|article|avis)/i,
  /Rien\s+(à\s+afficher|trouvé)/i,
  /Aucune\s+(entreprise|fiche|entrée)/i,
  /N['’]avons\s+pas\s+trouvé/i,
]

// Safeguards : either notFound() on count check, or conditional robots index:false
const SAFEGUARD_PATTERNS = [
  /if\s*\(\s*[!\s]*\w+\.length\s*(?:===?\s*0|<\s*1)?\s*\)\s*(?:\{[\s\S]{0,80}?)?notFound\s*\(/,
  /if\s*\(\s*\w+\.length\s*===?\s*0\s*\)\s*(?:\{[\s\S]{0,80}?)?notFound\s*\(/,
  /if\s*\(\s*!\s*\w+(?:\s*\|\|\s*[!\w.\s]+)?\s*\)\s*(?:\{[\s\S]{0,80}?)?notFound\s*\(/,
  /robots\s*:\s*\w+\.length\s*===?\s*0\s*\?\s*\{\s*index\s*:\s*false/,
  /robots\s*:\s*\(?\s*\w+\s*&&\s*\w+\.length\s*>\s*0\s*\)?\s*\?\s*\{/,
  /robots\s*:\s*!\s*\w+\s*\?\s*\{\s*index\s*:\s*false/,
  /\bindex\s*:\s*\w+\.length\s*>\s*0\b/,
  /\bindex\s*:\s*Boolean\s*\(\s*\w+(?:\?\.[^)]+)?\s*\)/,
]

function matchesAny(src, patterns) {
  for (const p of patterns) if (p.test(src)) return true
  return false
}

const pages = walk('src/app').filter((f) => /page\.tsx$/.test(f))
const gaps = []
let scanned = 0

for (const f of pages) {
  const normalized = f.split(sep).join('/')
  const src = readFileSync(f, 'utf8')
  const hasMeta =
    /export\s+(async\s+)?function\s+generateMetadata/.test(src) ||
    /export\s+const\s+metadata\s*[:=]/.test(src)
  if (!hasMeta) continue
  if (inferNoindex(src, normalized)) continue
  if (!matchesAny(src, EMPTY_STATE_PATTERNS)) continue
  // Only flag dynamic routes ([param]) : static pages with empty-state fallback
  // for DB/API failures are a normal UX pattern, not a crawl trap (content is
  // always populated in production).
  const isDynamic = /\[[^\]]+\]/.test(normalized)
  if (!isDynamic) continue
  scanned++
  if (matchesAny(src, SAFEGUARD_PATTERNS)) continue
  // Gap: dynamic page renders empty-state copy without notFound/noindex guard
  gaps.push({
    route: pathToRoute(normalized),
    file: normalized,
  })
}

const report = {
  pages_with_empty_state_copy: scanned,
  crawl_trap_gaps: gaps.length,
  coverage_pct:
    scanned === 0 ? 100 : Number((((scanned - gaps.length) / scanned) * 100).toFixed(1)),
  gaps,
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Crawl Traps Audit (soft 404 prevention)\n')
  console.log(`  Pages avec copy d'état vide    : ${report.pages_with_empty_state_copy}`)
  console.log(`  Gaps (empty sans guard)        : ${report.crawl_trap_gaps}`)
  console.log(`  Coverage                       : ${report.coverage_pct}%\n`)
  if (gaps.length === 0) {
    console.log('  ✅ Aucun crawl trap détecté.\n')
  } else {
    console.log(`  ❌ Pages soft-404 potentielles (copy "aucun" sans guard) :`)
    for (const g of gaps.slice(0, 30)) console.log(`     ${g.route}  (${g.file})`)
    if (gaps.length > 30) console.log(`     ... et ${gaps.length - 30} de plus`)
    console.log('')
  }
}

if (strict && gaps.length > 0) process.exit(1)
