#!/usr/bin/env node
/**
 * scripts/audit-revalidate.mjs
 * ----------------------------
 * Scanne tous les `page.tsx` et liste les pages publiques indexables qui
 * n'ont PAS de `export const revalidate` ou `export const dynamic` explicite.
 *
 * Next.js comportement par défaut sur App Router :
 *   - Sans `revalidate` ni `dynamic` → **Static render au build**.
 *     Conséquence : les pages s'affichent avec les données du build, pas
 *     de refresh jamais (jusqu'au prochain deploy). Catastrophique pour
 *     les pages pilotant du contenu DB (avis, artisans, barèmes CEE).
 *
 *   - Avec `revalidate = N` → ISR, regen toutes les N secondes
 *   - Avec `dynamic = 'force-dynamic'` → SSR systématique (anti-ISR)
 *   - Avec `dynamic = 'force-static'` → Static pur (choix explicite)
 *
 * Règle : toute page publique indexable DOIT déclarer explicitement
 * son comportement (static volontaire, ISR avec TTL, ou force-dynamic).
 * Faute de quoi, on a du static par accident → stale data → freshness
 * SEO dégradée (Google baisse le ranking sur signaux de fraîcheur).
 *
 * Seuils recommandés :
 *   - Pages "données business" (avis, artisans, tarifs) : revalidate = 3600 (1h)
 *   - Pages "contenu éditorial" (guides, blog, FAQ) : revalidate = 86400 (24h)
 *   - Pages "référentiels statiques" (mentions légales, CGV) : force-static OK
 *
 * Usage :
 *   node scripts/audit-revalidate.mjs            # liste humaine
 *   node scripts/audit-revalidate.mjs --json     # JSON
 *   node scripts/audit-revalidate.mjs --strict   # exit 1 si au moins 1 gap
 *                                                # sur page publique indexable
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

/** Détection noindex — même logique que audit-canonicals.mjs */
function inferNoindex(src, file) {
  if (/robots\s*:\s*\{\s*[^}]*index\s*:\s*false/s.test(src)) return true
  if (/robots\s*:\s*\{\s*\.\.\.\s*noindex/i.test(src)) return true
  if (/NOT_FOUND_METADATA|NOINDEX_METADATA/.test(src)) return true
  if (/\/\(private\)\//.test(file)) return true
  if (/\/espace-artisan\/|\/espace-client\/|\/admin\//.test(file)) return true
  if (/^\s*redirect\s*\(/m.test(src) && !/return\s*\(/m.test(src)) return true
  return false
}

/**
 * Détection du comportement de rendu déclaré :
 *   - 'revalidate' : export const revalidate = N
 *   - 'force-dynamic' : export const dynamic = 'force-dynamic'
 *   - 'force-static' : export const dynamic = 'force-static'
 *   - 'auto' : export const dynamic = 'auto' (comportement par défaut explicite)
 *   - 'error' : export const dynamic = 'error' (catch unexpected dynamic APIs)
 *   - null : aucune déclaration → static par défaut (implicite)
 */
function inferRenderMode(src) {
  // `revalidate` peut être un entier, `false`, OU un identifiant
  // (ex: `REVALIDATE.services` depuis @/lib/cache). On accepte toute
  // forme non-vide jusqu'à la fin d'instruction.
  const revalidateMatch = src.match(/export\s+const\s+revalidate\s*=\s*([^\n;]+)/)
  if (revalidateMatch) {
    return { kind: 'revalidate', value: revalidateMatch[1].trim() }
  }
  const dynamicMatch = src.match(
    /export\s+const\s+dynamic\s*=\s*['"](force-dynamic|force-static|auto|error)['"]/
  )
  if (dynamicMatch) {
    return { kind: 'dynamic', value: dynamicMatch[1] }
  }
  return { kind: 'implicit-static', value: null }
}

/** Extrait le chemin route depuis un chemin fichier `src/app/...` */
function pathToRoute(file) {
  let route = file
    .replace(/^.*?src[\/\\]app/, '')
    .replace(/[\/\\]page\.tsx$/, '')
    .split(sep)
    .join('/')
  // Retirer les route groups (xxx) de l'URL
  route = route.replace(/\/\([^)]+\)/g, '')
  return route || '/'
}

const pages = walk('src/app')
const results = []

for (const f of pages) {
  const src = readFileSync(f, 'utf8')
  const hasGenMeta = /export\s+(async\s+)?function\s+generateMetadata/.test(src)
  const hasStaticMeta = /export\s+const\s+metadata\s*[:=]/.test(src)
  if (!hasGenMeta && !hasStaticMeta) continue

  const normalized = f.split(sep).join('/')
  const noindex = inferNoindex(src, normalized)
  const renderMode = inferRenderMode(src)
  const isDynamic = /\[[^\]]+\]/.test(normalized)

  results.push({
    file: normalized,
    route: pathToRoute(normalized),
    dynamic: isDynamic,
    noindex,
    renderMode: renderMode.kind,
    renderValue: renderMode.value,
  })
}

const indexable = results.filter((r) => !r.noindex)
const implicitStatic = indexable.filter((r) => r.renderMode === 'implicit-static')
const implicitStaticDyn = implicitStatic.filter((r) => r.dynamic)

const report = {
  scanned: results.length,
  indexable: indexable.length,
  declared_behavior: indexable.length - implicitStatic.length,
  implicit_static_total: implicitStatic.length,
  implicit_static_dynamic: implicitStaticDyn.length,
  gaps: implicitStatic,
  by_mode: {
    revalidate: indexable.filter((r) => r.renderMode === 'revalidate').length,
    'force-dynamic': indexable.filter(
      (r) => r.renderMode === 'dynamic' && r.renderValue === 'force-dynamic'
    ).length,
    'force-static': indexable.filter(
      (r) => r.renderMode === 'dynamic' && r.renderValue === 'force-static'
    ).length,
    'auto': indexable.filter((r) => r.renderMode === 'dynamic' && r.renderValue === 'auto').length,
    'error': indexable.filter((r) => r.renderMode === 'dynamic' && r.renderValue === 'error')
      .length,
  },
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Revalidate/Dynamic Coverage Audit\n')
  console.log(`  Pages avec metadata scannées               : ${report.scanned}`)
  console.log(`  Indexables                                 : ${report.indexable}`)
  console.log(`  Avec comportement déclaré explicite        : ${report.declared_behavior}`)
  console.log(`  SANS déclaration (static implicite)        : ${report.implicit_static_total}`)
  console.log(`    dont dynamiques (critique)               : ${report.implicit_static_dynamic}`)
  console.log(`\n  Répartition (pages indexables déclarées) :`)
  for (const [k, v] of Object.entries(report.by_mode)) {
    console.log(`    ${k.padEnd(15)} : ${v}`)
  }
  console.log('')

  if (report.implicit_static_total === 0) {
    console.log('  ✅ Toutes les pages indexables ont un comportement de rendu déclaré.\n')
  } else {
    console.log('  ⚠️  Pages indexables sans revalidate/dynamic (static par défaut) :')
    for (const r of report.gaps) {
      console.log(`     [${r.dynamic ? 'DYN' : 'STA'}] ${r.route}`)
    }
    console.log('')
  }
}

if (strict && report.implicit_static_total > 0) {
  process.exit(1)
}
