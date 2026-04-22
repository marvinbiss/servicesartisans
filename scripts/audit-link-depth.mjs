#!/usr/bin/env node
/**
 * scripts/audit-link-depth.mjs
 * ----------------------------
 * Calcule la profondeur de clic (BFS) depuis `/` pour chaque page statique
 * indexable. Signale les pages à plus de N clics de la home.
 *
 * Pourquoi :
 *   - Google Search Console pondère la priorité de crawl par la distance
 *     au domain root. Profondeur > 4 = pages rarement recrawlées,
 *     fraîcheur lentement détectée.
 *   - Audit "pages profondes" = opportunité PageRank : les promouvoir en
 *     Footer / Navigation / clusters thématiques.
 *
 * Méthode :
 *   1. Extraire toutes les arêtes (from_route → to_route) depuis les `href`
 *      statiques des fichiers TSX (pas d'interpolation résolue).
 *   2. BFS depuis `/` → profondeur minimale par route.
 *   3. Flag les routes atteignables > MAX_DEPTH ou INATTEIGNABLES.
 *
 * Limites : routes générées par `.map()` (interpolation) apparaissent
 * comme PRÉFIXES. Une page `/services/plombier/lyon` est considérée
 * atteignable si un lien `/services/${slug}/${city.slug}` existe quelque
 * part. On matche par préfixe.
 *
 * Usage :
 *   node scripts/audit-link-depth.mjs            # human
 *   node scripts/audit-link-depth.mjs --json     # JSON
 *   node scripts/audit-link-depth.mjs --strict   # exit 1 si dépasse MAX_DEPTH
 *   node scripts/audit-link-depth.mjs --max=5    # override MAX_DEPTH (défaut 4)
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, sep } from 'node:path'

const args = process.argv.slice(2)
const strict = args.includes('--strict')
const jsonOut = args.includes('--json')
const maxArg = args.find((a) => a.startsWith('--max='))
const MAX_DEPTH = maxArg ? parseInt(maxArg.split('=')[1], 10) : 4

const NEXT_CONFIG_PATH = 'next.config.js'

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, acc)
    else if (/\.(tsx|ts|jsx|js)$/.test(entry)) acc.push(full)
  }
  return acc
}

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

const redirectSources = extractRedirectSources()

// 1. Collecter toutes les routes statiques indexables
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
  if (redirectSources.has(route)) continue
  staticIndexable.push({ route, file: normalized })
}

const allRoutes = new Set(staticIndexable.map((p) => p.route))

// 2. Construire le graphe : from_route → Set<to_route>
// Pour chaque page, lister les liens vers d'autres routes statiques (directs + préfixes)
const allFiles = walk('src')
const fileLinks = new Map() // file path → set of href strings (literals + prefix wildcards)
for (const f of allFiles) {
  const normalized = f.split(sep).join('/')
  const src = readFileSync(f, 'utf8')
  const refs = new Set()
  // a. Literals : href="/path"
  for (const m of src.matchAll(/href=["'](\/[^"'#?]*)["']/g)) refs.add(m[1].replace(/\/$/, '') || '/')
  for (const m of src.matchAll(/href=\{\s*`(\/[^`$]*)`\s*\}/g))
    refs.add(m[1].replace(/\/$/, '') || '/')
  for (const m of src.matchAll(/href\s*:\s*['"](\/[^'"#?]*)['"]/g))
    refs.add(m[1].replace(/\/$/, '') || '/')
  // b. Template literals avec interpolation : href={`/prefix/${x}`} — préfixe
  //    On ajoute une entrée "wildcard" qui match toute route sous ce préfixe.
  for (const m of src.matchAll(/href=\{\s*`(\/[^`$]*?)\$\{/g)) {
    const prefix = m[1]
    if (prefix.endsWith('/') && prefix !== '/') refs.add(`${prefix}*`)
  }
  for (const m of src.matchAll(/href\s*:\s*`(\/[^`$]*?)\$\{/g)) {
    const prefix = m[1]
    if (prefix.endsWith('/') && prefix !== '/') refs.add(`${prefix}*`)
  }
  fileLinks.set(normalized, refs)
}

/** Retourne true si une référence dans le set matche la route (literal ou prefix) */
function refsCoverRoute(refs, route) {
  if (refs.has(route)) return true
  for (const ref of refs) {
    if (ref.endsWith('/*') && route.startsWith(ref.slice(0, -1))) return true
  }
  return false
}

// Mapper chaque page (route) à son fichier source pour BFS
const routeToFile = new Map()
for (const p of staticIndexable) routeToFile.set(p.route, p.file)

/**
 * Résout les composants importés par un fichier et agrège leurs `href`.
 * Profondeur 1 (pas récursif) — les Link inside Link inside Link ne sont pas
 * exotiques, mais la première couche couvre 95% des cas.
 */
function resolveImportedRefs(file, visited = new Set()) {
  if (visited.has(file)) return new Set()
  visited.add(file)
  const src = readFileSync(file, 'utf8')
  const refs = new Set()
  const importRe = /import\s+\w+\s+from\s+['"](\.\/[^'"]+|@\/[^'"]+)['"]/g
  const dir = file.replace(/\/[^/]+$/, '')
  for (const m of src.matchAll(importRe)) {
    const spec = m[1]
    const candidates = []
    if (spec.startsWith('./')) {
      const base = `${dir}/${spec.replace(/^\.\//, '')}`
      candidates.push(base + '.tsx', base + '.ts', base + '/index.tsx')
    } else if (spec.startsWith('@/')) {
      const base = spec.replace(/^@\//, 'src/')
      candidates.push(base + '.tsx', base + '.ts', base + '/index.tsx')
    }
    for (const c of candidates) {
      const normalizedC = c.replace(/\\/g, '/')
      if (fileLinks.has(normalizedC)) {
        for (const r of fileLinks.get(normalizedC)) refs.add(r)
        break
      }
      if (existsSync(c)) {
        try {
          const childSrc = readFileSync(c, 'utf8')
          for (const sm of childSrc.matchAll(/href=["'](\/[^"'#?]*)["']/g)) refs.add(sm[1])
          for (const sm of childSrc.matchAll(/href=\{\s*`(\/[^`$]*)`\s*\}/g)) refs.add(sm[1])
          for (const sm of childSrc.matchAll(/href\s*:\s*['"](\/[^'"#?]*)['"]/g)) refs.add(sm[1])
        } catch {}
        break
      }
    }
  }
  return refs
}

// Pour chaque page source, extraire ses liens vers d'autres pages STATIQUES.
// Union des refs directes + des refs des composants importés (profondeur 1).
// Chaque ref peut être une route littérale ou un préfixe wildcard `/prefix/*`
// généré depuis un template literal avec interpolation.
const adjacency = new Map() // route → Set<route>
function expandRefs(refs, includedRoutes) {
  const out = new Set()
  for (const ref of refs) {
    if (ref.endsWith('/*')) {
      const prefix = ref.slice(0, -1)
      for (const r of includedRoutes) if (r.startsWith(prefix)) out.add(r)
    } else if (includedRoutes.has(ref)) {
      out.add(ref)
    }
  }
  return out
}
for (const { route, file } of staticIndexable) {
  const directRefs = fileLinks.get(file) || new Set()
  const importedRefs = resolveImportedRefs(file)
  const outgoing = new Set([
    ...expandRefs(directRefs, allRoutes),
    ...expandRefs(importedRefs, allRoutes),
  ])
  adjacency.set(route, outgoing)
}

// Propagation depuis les pages dynamiques (`[slug]`) vers leur ancêtre statique.
// Rationale : une page `/services/[service]/page.tsx` qui contient
// `href="/garantie"` représente N pages concrètes (/services/plombier, etc.)
// qui sont linkées depuis `/services`. On injecte donc son hreflinks dans
// le nœud `/services` — approximation correcte pour le BFS.
for (const f of pages) {
  const normalized = f.split(sep).join('/')
  if (!isDynamicRoute(normalized)) continue
  const src = readFileSync(f, 'utf8')
  const hasMeta =
    /export\s+(async\s+)?function\s+generateMetadata/.test(src) ||
    /export\s+const\s+metadata\s*[:=]/.test(src)
  if (!hasMeta) continue
  if (inferNoindex(src, normalized)) continue

  // Résolution de l'ancêtre statique : on monte les segments jusqu'à trouver
  // une route sans `[...]` qui existe dans allRoutes.
  const segments = pathToRoute(normalized).split('/')
  let ancestor = null
  for (let i = segments.length - 1; i >= 1; i--) {
    const candidate = segments.slice(0, i).join('/') || '/'
    if (!/\[.*\]/.test(candidate) && allRoutes.has(candidate)) {
      ancestor = candidate
      break
    }
  }
  if (!ancestor) continue

  const directRefs = fileLinks.get(normalized) || new Set()
  const importedRefs = resolveImportedRefs(normalized)
  const out = adjacency.get(ancestor) || new Set()
  for (const r of expandRefs(directRefs, allRoutes)) out.add(r)
  for (const r of expandRefs(importedRefs, allRoutes)) out.add(r)
  adjacency.set(ancestor, out)
}

// 3. Ajouter les liens globaux du Footer/Header (présents sur toutes les pages)
// Convention : composants layouts communs sont dans src/components/Footer*,
// src/components/Header*, src/components/Nav*. On collecte leurs refs et on
// les injecte comme arêtes depuis CHAQUE route.
const GLOBAL_LINK_FILES = [
  /[\/\\]components[\/\\]Footer\.tsx$/,
  /[\/\\]components[\/\\]Header\.tsx$/,
  /[\/\\]components[\/\\]HeaderClient\.tsx$/,
  /[\/\\]components[\/\\]Nav[^\/\\]*\.tsx$/,
  /[\/\\]components[\/\\]seo[\/\\]FooterClusterLinks\.tsx$/,
  /[\/\\]components[\/\\]seo[\/\\]DynamicFooterLinks\.tsx$/,
]
const globalRefs = new Set()
for (const [file, refs] of fileLinks) {
  if (GLOBAL_LINK_FILES.some((re) => re.test(file))) {
    for (const r of expandRefs(refs, allRoutes)) globalRefs.add(r)
  }
}
for (const [route, out] of adjacency) {
  for (const g of globalRefs) if (g !== route) out.add(g)
}

// 4. BFS depuis `/`
const depth = new Map()
const queue = []
depth.set('/', 0)
queue.push('/')
while (queue.length > 0) {
  const current = queue.shift()
  const d = depth.get(current)
  const nexts = adjacency.get(current) || new Set()
  for (const next of nexts) {
    if (!depth.has(next)) {
      depth.set(next, d + 1)
      queue.push(next)
    }
  }
}

// 5. Classer les routes
const tooDeep = []
const unreachable = []
for (const { route, file } of staticIndexable) {
  if (!depth.has(route)) {
    unreachable.push({ route, file })
  } else if (depth.get(route) > MAX_DEPTH) {
    tooDeep.push({ route, file, depth: depth.get(route) })
  }
}

const depthHistogram = {}
for (const { route } of staticIndexable) {
  const d = depth.has(route) ? depth.get(route) : 'unreachable'
  depthHistogram[d] = (depthHistogram[d] || 0) + 1
}

const report = {
  max_depth_threshold: MAX_DEPTH,
  static_indexable_pages: staticIndexable.length,
  global_footer_links: globalRefs.size,
  depth_histogram: depthHistogram,
  pages_too_deep: tooDeep.length,
  pages_unreachable: unreachable.length,
  too_deep: tooDeep,
  unreachable,
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log(`\n📋 Internal Link Depth Audit (BFS from /, max depth ${MAX_DEPTH})\n`)
  console.log(`  Pages statiques indexables : ${report.static_indexable_pages}`)
  console.log(`  Liens globaux Footer/Header : ${report.global_footer_links}\n`)

  console.log('  Histogramme de profondeur :')
  const entries = Object.entries(report.depth_histogram).sort((a, b) => {
    if (a[0] === 'unreachable') return 1
    if (b[0] === 'unreachable') return -1
    return Number(a[0]) - Number(b[0])
  })
  for (const [d, n] of entries) {
    console.log(`     depth ${String(d).padEnd(12)} : ${n}`)
  }
  console.log('')

  if (tooDeep.length === 0 && unreachable.length === 0) {
    console.log(`  ✅ Toutes les pages sont à ≤ ${MAX_DEPTH} clics de /.\n`)
  } else {
    if (tooDeep.length > 0) {
      console.log(`  ⚠️  Pages à plus de ${MAX_DEPTH} clics de / :`)
      for (const p of tooDeep.slice(0, 30)) {
        console.log(`     depth=${p.depth}  ${p.route}`)
      }
      if (tooDeep.length > 30) console.log(`     ... et ${tooDeep.length - 30} de plus`)
      console.log('')
    }
    if (unreachable.length > 0) {
      console.log('  ❌ Pages inatteignables depuis / :')
      for (const p of unreachable.slice(0, 30)) console.log(`     ${p.route}`)
      if (unreachable.length > 30) console.log(`     ... et ${unreachable.length - 30} de plus`)
      console.log('')
    }
  }
}

if (strict && (tooDeep.length > 0 || unreachable.length > 0)) process.exit(1)
