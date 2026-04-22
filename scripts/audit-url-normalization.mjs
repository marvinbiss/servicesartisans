#!/usr/bin/env node
/**
 * scripts/audit-url-normalization.mjs
 * -----------------------------------
 * Vérifie la cohérence des URLs internes :
 *   1. Zéro href se terminant par `/` (hors root `/`) — Next.js 14 App Router
 *      sert par défaut sans trailing slash ; un lien `href="/services/"`
 *      déclenche un 308 permanent vers `/services` → round-trip crawler.
 *   2. Zéro href en UPPER-case (les slugs sont tous lower-case dans ce projet).
 *   3. Zéro href avec double slash `//path` (ex: `${SITE_URL}//foo` par bug
 *      de concaténation).
 *   4. Zéro href avec espaces ou caractères non-URL-safe non encodés.
 *
 * Pourquoi : chaque 308/301 interne = crawl budget gaspillé + signal SEO
 * faible. Google Search Central recommande des URLs canoniques cohérentes
 * dès le linkage interne.
 *
 * Usage :
 *   node scripts/audit-url-normalization.mjs            # human
 *   node scripts/audit-url-normalization.mjs --json     # JSON
 *   node scripts/audit-url-normalization.mjs --strict   # exit 1 si gap
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
    else if (/\.(tsx|ts|jsx|js|mjs)$/.test(entry)) acc.push(full)
  }
  return acc
}

/**
 * Classifie un href en problème(s). Retourne un tableau (peut être vide)
 * d'objets { type, detail } pour chaque règle violée.
 */
function classifyHref(href) {
  const issues = []
  if (href === '/') return issues // root autorisé
  // URL protocol-relative (`//host.com/...`) — utilisée pour les hints
  // `<link rel="dns-prefetch|preconnect">`. Ce n'est pas une nav href, on ne
  // la valide pas.
  if (href.startsWith('//')) return issues
  // On ne vérifie la casse que sur la portion path (avant `?` ou `#`). Les
  // valeurs de query strings peuvent légitimement contenir des majuscules.
  const path = href.split(/[?#]/)[0]
  // 1. trailing slash sur le path
  if (path.endsWith('/') && path !== '/') issues.push({ type: 'trailing_slash', detail: href })
  // 2. majuscules dans le path (slugs)
  if (/[A-Z]/.test(path) && !/^\/:[a-zA-Z]/.test(path))
    issues.push({ type: 'uppercase', detail: href })
  // 3. double slash
  if (path.includes('//')) issues.push({ type: 'double_slash', detail: href })
  // 4. espace ou caractère non safe
  if (/[ "<>\\^`{|}]/.test(path)) issues.push({ type: 'unsafe_char', detail: href })
  return issues
}

const files = walk('src')
const violations = []
let totalHrefs = 0

for (const f of files) {
  const normalized = f.split(sep).join('/')
  if (/[\/\\]__tests__[\/\\]/.test(normalized)) continue
  if (/[\/\\]scripts[\/\\]/.test(normalized)) continue
  const src = readFileSync(f, 'utf8')

  // Collecte les hrefs internes (commencent par /)
  const hrefs = new Set()
  for (const m of src.matchAll(/href=["'](\/[^"']*)["']/g)) hrefs.add(m[1])
  for (const m of src.matchAll(/href=\{\s*`(\/[^`$]*)`\s*\}/g)) hrefs.add(m[1])
  for (const m of src.matchAll(/href\s*:\s*["'](\/[^"']*)["']/g)) hrefs.add(m[1])
  // Templates avec interpolation — on garde le préfixe avant `${`. Un
  // préfixe qui finit par `/` suivi de `${slug}` est OK (le slug apporte
  // la suite). On ignore donc ce cas-là.

  for (const href of hrefs) {
    totalHrefs++
    const issues = classifyHref(href)
    for (const i of issues) {
      violations.push({ file: normalized, href, type: i.type })
    }
  }
}

const byType = {}
for (const v of violations) byType[v.type] = (byType[v.type] || 0) + 1

const report = {
  files_scanned: files.length,
  total_internal_hrefs: totalHrefs,
  violations_count: violations.length,
  by_type: byType,
  violations,
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 URL Normalization Audit (internal hrefs)\n')
  console.log(`  Fichiers scannés       : ${report.files_scanned}`)
  console.log(`  Hrefs internes totaux  : ${report.total_internal_hrefs}`)
  console.log(`  Violations             : ${report.violations_count}\n`)

  if (violations.length === 0) {
    console.log('  ✅ Tous les hrefs internes sont normalisés.\n')
  } else {
    console.log('  Répartition par type :')
    for (const [t, n] of Object.entries(byType)) console.log(`     ${t.padEnd(16)} ${n}`)
    console.log('')
    console.log('  ⚠️  Violations :')
    for (const v of violations.slice(0, 50)) {
      console.log(`     [${v.type}] ${v.href}`)
      console.log(`        ${v.file}`)
    }
    if (violations.length > 50) console.log(`     ... et ${violations.length - 50} de plus`)
    console.log('')
  }
}

if (strict && violations.length > 0) process.exit(1)
