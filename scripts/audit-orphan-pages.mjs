#!/usr/bin/env node
/**
 * scripts/audit-orphan-pages.mjs
 * ------------------------------
 * Détecte les pages indexables SANS aucun lien interne entrant.
 *
 * Pourquoi : Google découvre principalement par maillage interne. Une page
 * orpheline dépend uniquement du sitemap pour être indexée, et ne reçoit
 * AUCUN PageRank interne. Elle reste durablement à la traîne dans les SERP
 * (ou disparaît en "crawled not indexed").
 *
 * Règle : chaque page indexable STATIQUE doit être référencée au moins une
 * fois dans `src/` via un `href=`, une redirect(), ou un router.push().
 *
 * Limites (faux positifs possibles) :
 *   - Pages générées par loops dynamiques (`href={\`/services/${slug}\`}`)
 *     sont référencées via un template, donc matchées par préfixe.
 *   - Ce script scan les .tsx/.ts de `src/` uniquement (pas de MDX / CMS).
 *   - Le sitemap.ts et plan-du-site.tsx sont exclus des sources de liens
 *     (listé partout, mais c'est une "découverte" pas un vrai link juice).
 *
 * Usage :
 *   node scripts/audit-orphan-pages.mjs            # human
 *   node scripts/audit-orphan-pages.mjs --json     # JSON
 *   node scripts/audit-orphan-pages.mjs --strict   # exit 1 si orphan
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, sep } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const NEXT_CONFIG_PATH = 'next.config.js'

const LINK_SOURCES_EXCLUDE = [
  /[\/\\]app[\/\\]sitemap\.ts$/,
  /[\/\\]app[\/\\]robots\.ts$/,
  /[\/\\]plan-du-site[\/\\]page\.tsx$/,
]

function extractRedirectSources() {
  if (!existsSync(NEXT_CONFIG_PATH)) return new Set()
  const src = readFileSync(NEXT_CONFIG_PATH, 'utf8')
  const sources = new Set()
  const re = /\{\s*source:\s*['"]([^'"]+)['"],[\s\S]*?permanent:\s*true[^}]*\}/g
  for (const m of src.matchAll(re)) {
    const s = m[1]
    if (!s.includes(':') && !s.includes('*')) sources.add(s)
  }
  return sources
}

const redirectSources = extractRedirectSources()

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, acc)
    else if (/\.(tsx|ts)$/.test(entry)) acc.push(full)
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

function isDynamicRoute(file) {
  return /\[[^\]]+\]/.test(file)
}

// 1. Collecter toutes les pages statiques indexables
const pages = walk('src/app').filter((f) => /page\.tsx$/.test(f))
const staticIndexable = []

for (const f of pages) {
  const normalized = f.split(sep).join('/')
  if (isDynamicRoute(normalized)) continue
  const src = readFileSync(f, 'utf8')
  const hasMeta =
    /export\s+(async\s+)?function\s+generateMetadata/.test(src) ||
    /export\s+const\s+metadata\s*[:=]/.test(src)
  if (!hasMeta) continue
  if (inferNoindex(src, normalized)) continue
  const route = pathToRoute(normalized)
  if (route === '/') continue // root accessible via branding partout
  if (redirectSources.has(route)) continue // 301-redirigée côté next.config.js
  staticIndexable.push({ route, file: normalized })
}

// 2. Scanner src/ pour extraire tous les liens internes utilisés
const allFiles = walk('src')
const linkReferences = new Set() // routes directement référencées
const linkPrefixes = new Set() // préfixes de loops (`/services/`, `/guides/`, ...)

for (const f of allFiles) {
  const normalized = f.split(sep).join('/')
  if (LINK_SOURCES_EXCLUDE.some((re) => re.test(normalized))) continue
  const src = readFileSync(f, 'utf8')

  // a. href="/path" — JSX attribute (Link, <a>)
  for (const m of src.matchAll(/href=["'](\/[^"'#?]*)["']/g)) {
    linkReferences.add(m[1].replace(/\/$/, '') || '/')
  }

  // b. href={`/path`} — template literal sans interpolation
  for (const m of src.matchAll(/href=\{\s*`(\/[^`$]*)`\s*\}/g)) {
    linkReferences.add(m[1].replace(/\/$/, '') || '/')
  }

  // c. href={`/prefix/${slug}`} — template literal AVEC interpolation → préfixe
  for (const m of src.matchAll(/href=\{\s*`(\/[^`$]*?)\$\{/g)) {
    const prefix = m[1]
    if (prefix.endsWith('/') && prefix !== '/') linkPrefixes.add(prefix)
  }

  // d. { href: '/path' } — data structure (navigation arrays, footer, menus)
  //    Pattern courant dans Footer.tsx, Header.tsx, etc.
  for (const m of src.matchAll(/href\s*:\s*['"](\/[^'"#?]*)['"]/g)) {
    linkReferences.add(m[1].replace(/\/$/, '') || '/')
  }

  // e. { href: `/prefix/${...}` } — data structure avec interpolation
  for (const m of src.matchAll(/href\s*:\s*`(\/[^`$]*?)\$\{/g)) {
    const prefix = m[1]
    if (prefix.endsWith('/') && prefix !== '/') linkPrefixes.add(prefix)
  }

  // f. redirect('/path')
  for (const m of src.matchAll(/redirect\(\s*['"](\/[^'"]*)['"]/g)) {
    linkReferences.add(m[1].replace(/\/$/, '') || '/')
  }

  // g. router.push('/path')
  for (const m of src.matchAll(/router\.(push|replace)\(\s*['"](\/[^'"]*)['"]/g)) {
    linkReferences.add(m[2].replace(/\/$/, '') || '/')
  }
}

function isLinked(route) {
  if (linkReferences.has(route)) return true
  for (const prefix of linkPrefixes) {
    if (route.startsWith(prefix)) return true
  }
  return false
}

// 3. Diff : pages statiques indexables sans lien entrant
const orphans = staticIndexable.filter((p) => !isLinked(p.route))

const report = {
  static_indexable_pages: staticIndexable.length,
  link_references_extracted: linkReferences.size,
  link_prefixes_extracted: linkPrefixes.size,
  orphans_count: orphans.length,
  orphans,
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Orphan Pages Audit (no internal link)\n')
  console.log(`  Pages statiques indexables : ${report.static_indexable_pages}`)
  console.log(`  Liens href directs         : ${report.link_references_extracted}`)
  console.log(`  Préfixes de loop           : ${report.link_prefixes_extracted}`)
  console.log(`  Pages orphelines           : ${report.orphans_count}\n`)

  if (orphans.length === 0) {
    console.log('  ✅ Aucune page orpheline.\n')
  } else {
    console.log('  ⚠️  Pages orphelines (aucun lien interne entrant) :')
    for (const o of orphans) {
      console.log(`     ${o.route.padEnd(50)} (${o.file})`)
    }
    console.log('')
  }
}

if (strict && orphans.length > 0) {
  process.exit(1)
}
