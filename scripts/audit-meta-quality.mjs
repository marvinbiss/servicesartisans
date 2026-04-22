#!/usr/bin/env node
/**
 * scripts/audit-meta-quality.mjs
 * ------------------------------
 * Audite la qualité des metadata pour chaque page indexable :
 *   - title ABSENT / trop court (<20) / trop long (>60) / dupliqué
 *   - description ABSENTE / trop courte (<80) / trop longue (>160) / dupliquée
 *
 * Pourquoi :
 *   - Title >60 : Google tronque au snippet, perte CTR
 *   - Description >160 : tronquée sur mobile (155 pour desktop), perte info clé
 *   - Dupliqués : cannibalisation + signal "thin content" → ranking dégradé
 *   - Absents : Google génère un snippet générique, CTR -30% à -50%
 *
 * Limites : sur les pages avec `generateMetadata` (dynamiques), on ne peut
 * pas évaluer statiquement les title/desc calculés. On les exclut poliment.
 *
 * Usage :
 *   node scripts/audit-meta-quality.mjs            # human
 *   node scripts/audit-meta-quality.mjs --json     # JSON
 *   node scripts/audit-meta-quality.mjs --strict   # exit 1 si gap
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, sep } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const TITLE_MIN = 20
const TITLE_MAX = 60
const DESC_MIN = 80
const DESC_MAX = 160

/**
 * Layout-level title.template — Next.js applique `template.replace('%s', pageTitle)`
 * à chaque title string (hors `title: { absolute }`). On lit le template depuis
 * src/app/layout.tsx pour mesurer la VRAIE longueur rendue dans le HTML.
 *
 * Exemple :
 *   layout.tsx  : title: { template: '%s | ServicesArtisans' }
 *   page.tsx    : title: 'Plombier Lyon 2026'           (21 chars)
 *   rendu HTML  : '<title>Plombier Lyon 2026 | ServicesArtisans</title>' (40)
 */
const TITLE_TEMPLATE = (() => {
  try {
    const src = readFileSync('src/app/layout.tsx', 'utf8')
    const m = src.match(/template:\s*['"`]([^'"`]+)['"`]/)
    return m ? m[1] : null
  } catch {
    return null
  }
})()

function applyTemplate(rawTitle) {
  if (!TITLE_TEMPLATE || !rawTitle) return rawTitle
  return TITLE_TEMPLATE.replace('%s', rawTitle)
}

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

/**
 * Retourne la valeur string d'une clé `title:` ou `description:` en top-level
 * du bloc metadata. Supporte :
 *   - "..." / '...' / `...`
 *   - Multi-ligne (description: "...\n...")
 *   - Concaténation par + (description: "a" + " b")
 *   - Référence à une const (description: DESCRIPTION) — résolue si la const
 *     est déclarée en top-level du module
 *
 * Ignore volontairement les title/description imbriqués (openGraph, twitter)
 * en exigeant que la clé soit à la racine du bloc metadata.
 */
// Consts globales exportées par @/lib/seo/config — résolues à plat
// pour éviter d'avoir à parser le module TS complet à chaque page.
const GLOBAL_CONSTS = (() => {
  const out = {}
  try {
    const configSrc = readFileSync('src/lib/seo/config.ts', 'utf8')
    for (const m of configSrc.matchAll(
      /export\s+const\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'|\`((?:\\.|[^\`\\])*)\`)/g
    )) {
      out[m[1]] = (m[2] ?? m[3] ?? m[4] ?? '').replace(/\\(['"`])/g, '$1')
    }
    // SITE_URL a une fallback, on veut la valeur littérale (serveur prod)
    out.SITE_URL = 'https://servicesartisans.fr'
  } catch {}
  return out
})()

function resolveConst(src, name, depth = 0) {
  if (depth > 3) return null
  if (GLOBAL_CONSTS[name] != null) return GLOBAL_CONSTS[name]
  const re = new RegExp(
    `^const\\s+${name}\\s*=\\s*(?:"((?:\\\\.|[^"\\\\])*)"|'((?:\\\\.|[^'\\\\])*)'|\`((?:\\\\.|[^\`\\\\])*)\`)`,
    'm'
  )
  const m = src.match(re)
  if (!m) return null
  let value = m[1] ?? m[2] ?? m[3]
  // Résolution récursive des ${VAR} dans un template literal
  if (m[3] != null && /\$\{/.test(value)) {
    let resolved = value
    const placeholders = [...value.matchAll(/\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g)]
    for (const ph of placeholders) {
      const sub = resolveConst(src, ph[1], depth + 1)
      if (sub == null) return null // placeholder non résolvable → string incomplet
      resolved = resolved.replace(ph[0], sub)
    }
    value = resolved
  }
  return value.replace(/\\(['"`])/g, '$1')
}

/** Capture un littéral string (quote, contenu, quote) sans croisement de ligne cassante. */
const STR_LIT = `(?:"((?:\\\\.|[^"\\\\])*)"|'((?:\\\\.|[^'\\\\])*)'|\`((?:\\\\.|[^\`\\\\])*)\`)`

function extractValue(block, key, src) {
  // Top-level : on capture depuis `^\s{2}key:` (2 espaces — indentation metadata).
  // Si absent, fallback sur match classique (puisque certaines pages ont une
  // indentation différente ou une seule ligne).
  const flexible = new RegExp(
    `(?:^|[\\s,\\{])${key}\\s*:\\s*((?:${STR_LIT}|[a-zA-Z_][a-zA-Z0-9_]*)(?:\\s*\\+\\s*(?:${STR_LIT}|[a-zA-Z_][a-zA-Z0-9_]*))*)`,
    'm'
  )
  const m = block.match(flexible)
  if (!m) return null
  const rhs = m[1].trim()

  // RHS = "string" ou "a" + " b" ou CONST_NAME ou mélange
  // On résout chaque morceau et on concatène
  let value = ''
  const partRe = new RegExp(`${STR_LIT}|([a-zA-Z_][a-zA-Z0-9_]*)`, 'g')
  for (const pm of rhs.matchAll(partRe)) {
    const doubleQ = pm[1]
    const singleQ = pm[2]
    const backQ = pm[3]
    const constName = pm[4]
    const literal = doubleQ ?? singleQ ?? backQ
    if (literal != null) {
      // Si backtick avec interpolation ${VAR}, résoudre les placeholders
      if (backQ != null && /\$\{/.test(literal)) {
        let resolved = literal
        const phs = [...literal.matchAll(/\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g)]
        let allResolved = true
        for (const ph of phs) {
          const sub = resolveConst(src, ph[1])
          if (sub == null) {
            allResolved = false
            break
          }
          resolved = resolved.replace(ph[0], sub)
        }
        if (!allResolved) return null // interpolation non résolvable
        value += resolved.replace(/\\(['"`])/g, '$1')
      } else {
        value += literal.replace(/\\(['"`])/g, '$1')
      }
    } else if (constName) {
      const resolved = resolveConst(src, constName)
      if (resolved != null) value += resolved
      else return null
    }
  }
  return value || null
}

/**
 * Extrait title + description d'un `export const metadata: Metadata = { ... }`
 * STATIQUE. Retourne null si généré dynamiquement (generateMetadata).
 */
function extractStaticMeta(src) {
  if (/export\s+(async\s+)?function\s+generateMetadata/.test(src)) return null
  const metaMatch = src.match(/export\s+const\s+metadata\s*[:=][^{]*\{([\s\S]*?)\n\}/)
  if (!metaMatch) return null
  const block = metaMatch[1]
  return {
    title: extractValue(block, 'title', src),
    description: extractValue(block, 'description', src),
  }
}

const pages = walk('src/app')
const issues = []
const titleMap = new Map() // title → [files]
const descMap = new Map()
let scanned = 0
let skippedDynamic = 0

for (const f of pages) {
  const normalized = f.split(sep).join('/')
  const src = readFileSync(f, 'utf8')
  const hasMeta =
    /export\s+(async\s+)?function\s+generateMetadata/.test(src) ||
    /export\s+const\s+metadata\s*[:=]/.test(src)
  if (!hasMeta) continue
  if (inferNoindex(src, normalized)) continue

  const meta = extractStaticMeta(src)
  if (!meta) {
    skippedDynamic++
    continue
  }
  scanned++

  const route = pathToRoute(normalized)
  const pageIssues = []

  if (!meta.title) {
    pageIssues.push({ field: 'title', issue: 'missing' })
  } else {
    // Mesure sur le title rendu (après layout template), pas sur le raw.
    // Détecte aussi la double application de la marque : si meta.title contient
    // déjà "| ServicesArtisans" ET le template wrapperait encore, le render
    // final aura "| ServicesArtisans | ServicesArtisans" → bug.
    const renderedTitle = applyTemplate(meta.title)
    const hasDoubleSuffix =
      TITLE_TEMPLATE &&
      /\| ServicesArtisans/i.test(meta.title) &&
      !/\bapplied\b/.test(meta.title)
    if (renderedTitle.length < TITLE_MIN)
      pageIssues.push({ field: 'title', issue: 'too_short', length: renderedTitle.length })
    if (renderedTitle.length > TITLE_MAX)
      pageIssues.push({
        field: 'title',
        issue: 'too_long',
        length: renderedTitle.length,
        raw: meta.title,
        rendered: renderedTitle,
      })
    if (hasDoubleSuffix)
      pageIssues.push({
        field: 'title',
        issue: 'double_brand_suffix',
        raw: meta.title,
        rendered: renderedTitle,
      })
    if (!titleMap.has(renderedTitle)) titleMap.set(renderedTitle, [])
    titleMap.get(renderedTitle).push(route)
  }

  if (!meta.description) {
    pageIssues.push({ field: 'description', issue: 'missing' })
  } else {
    if (meta.description.length < DESC_MIN)
      pageIssues.push({
        field: 'description',
        issue: 'too_short',
        length: meta.description.length,
      })
    if (meta.description.length > DESC_MAX)
      pageIssues.push({
        field: 'description',
        issue: 'too_long',
        length: meta.description.length,
      })
    if (!descMap.has(meta.description)) descMap.set(meta.description, [])
    descMap.get(meta.description).push(route)
  }

  if (pageIssues.length > 0) issues.push({ route, file: normalized, issues: pageIssues })
}

// Doublons de title ou description
const dupTitles = [...titleMap.entries()]
  .filter(([, routes]) => routes.length > 1)
  .map(([title, routes]) => ({ title, routes }))
const dupDescs = [...descMap.entries()]
  .filter(([, routes]) => routes.length > 1)
  .map(([description, routes]) => ({ description, routes }))

const report = {
  pages_scanned_static: scanned,
  pages_skipped_dynamic: skippedDynamic,
  pages_with_issues: issues.length,
  duplicate_titles: dupTitles.length,
  duplicate_descriptions: dupDescs.length,
  issues,
  duplicates: {
    titles: dupTitles,
    descriptions: dupDescs,
  },
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Meta Quality Audit (title + description)\n')
  console.log(`  Pages scannées (metadata statique) : ${report.pages_scanned_static}`)
  console.log(`  Pages skippées (generateMetadata)  : ${report.pages_skipped_dynamic}`)
  console.log(`  Pages avec issues                  : ${report.pages_with_issues}`)
  console.log(`  Titres dupliqués                   : ${report.duplicate_titles}`)
  console.log(`  Descriptions dupliquées            : ${report.duplicate_descriptions}\n`)

  if (issues.length === 0 && dupTitles.length === 0 && dupDescs.length === 0) {
    console.log('  ✅ Toutes les metadata statiques sont conformes.\n')
  } else {
    if (issues.length) {
      console.log('  ⚠️  Issues par page :')
      for (const p of issues) {
        for (const i of p.issues) {
          const detail = i.length != null ? ` (${i.length})` : ''
          console.log(`     ${p.route.padEnd(50)} ${i.field} ${i.issue}${detail}`)
        }
      }
      console.log('')
    }
    if (dupTitles.length) {
      console.log('  ⚠️  Titres dupliqués :')
      for (const d of dupTitles) {
        console.log(`     "${d.title}"`)
        for (const r of d.routes) console.log(`        ${r}`)
      }
      console.log('')
    }
    if (dupDescs.length) {
      console.log('  ⚠️  Descriptions dupliquées :')
      for (const d of dupDescs) {
        console.log(`     "${d.description.slice(0, 80)}..."`)
        for (const r of d.routes) console.log(`        ${r}`)
      }
      console.log('')
    }
  }
}

// --strict fail uniquement sur les issues bloquantes (missing + duplicates).
// Les alertes length (too_short / too_long) sont reportées mais pas fatales,
// car elles demandent un arbitrage éditorial (le truncation Google 60/160 est
// une soft-limit, pas un standard dur — voir Search Central, "Title links").
const criticalIssues = issues.filter((p) =>
  p.issues.some((i) => i.issue === 'missing')
).length
const hasCritical = criticalIssues > 0 || dupTitles.length > 0 || dupDescs.length > 0
if (strict && hasCritical) process.exit(1)
