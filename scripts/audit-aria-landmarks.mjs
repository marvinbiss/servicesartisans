#!/usr/bin/env node
/**
 * scripts/audit-aria-landmarks.mjs
 * --------------------------------
 * Vérifie la présence des landmarks ARIA (ou leurs équivalents HTML5
 * sémantiques) sur le layout root et les pages indexables.
 *
 * Landmarks obligatoires (WCAG 2.1 + WAI-ARIA Authoring Practices) :
 *   - Main content  : `<main>` OU `role="main"` — exactement UN par page
 *   - Navigation    : `<nav>` OU `role="navigation"` — au moins une dans le layout
 *   - Banner/header : `<header>` top-level OU `role="banner"`
 *   - Contentinfo   : `<footer>` top-level OU `role="contentinfo"`
 *
 * Pourquoi :
 *   - Accessibilité : lecteurs d'écran (JAWS, NVDA, VoiceOver) permettent
 *     de naviguer par landmark (« Aller au contenu principal »).
 *   - SEO : Google utilise les landmarks pour distinguer la zone éditoriale
 *     du chrome (menu, footer) lors du calcul de pertinence.
 *   - Lighthouse a11y : -5 points pour `<main>` manquant.
 *
 * Méthodologie :
 *   1. Layout root (`src/app/layout.tsx`) : DOIT contenir nav + header/footer
 *      (ou leurs équivalents importés via Header.tsx, Footer.tsx).
 *   2. Chaque page indexable DOIT avoir un `<main>` (inline, ou dans un
 *      layout imbriqué / dans un composant importé au 1er niveau).
 *
 * Usage :
 *   node scripts/audit-aria-landmarks.mjs            # human
 *   node scripts/audit-aria-landmarks.mjs --json     # JSON
 *   node scripts/audit-aria-landmarks.mjs --strict   # exit 1 si gap
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, sep, dirname } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

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

function stripSafeComments(src) {
  return src.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/^\s*\/\/.*$/gm, '')
}

/**
 * Détecte la présence d'un landmark dans un source. Accepte :
 *   - Tag HTML5 sémantique (<main>, <nav>, <header>, <footer>)
 *   - Attribut role="main|navigation|banner|contentinfo"
 *   - Composant React nommé d'après le landmark (Header, Footer, Nav, Main)
 *     — les importer compte comme landmark présent via délégation.
 */
function hasLandmark(src, kind) {
  const cleaned = stripSafeComments(src)
  switch (kind) {
    case 'main':
      return /<main\b/.test(cleaned) || /role=["']main["']/.test(cleaned)
    case 'nav':
      return (
        /<nav\b/.test(cleaned) ||
        /role=["']navigation["']/.test(cleaned) ||
        /<(Header|HeaderClient|Nav)\b/.test(cleaned)
      )
    case 'banner':
      return (
        /<header\b/.test(cleaned) ||
        /role=["']banner["']/.test(cleaned) ||
        /<(Header|HeaderClient)\b/.test(cleaned)
      )
    case 'contentinfo':
      return (
        /<footer\b/.test(cleaned) ||
        /role=["']contentinfo["']/.test(cleaned) ||
        /<Footer\b/.test(cleaned)
      )
  }
  return false
}

/**
 * Résout les composants importés profondeur 1 et agrège la présence du
 * landmark. Ex: un page.tsx qui rend <PageShell /> peut déléguer son
 * <main> à PageShell.tsx.
 */
function hasLandmarkViaImports(file, src, kind) {
  const pageDir = dirname(file)
  const importRe = /import\s+\w+\s+from\s+['"](\.\/[^'"]+|@\/[^'"]+)['"]/g
  for (const m of src.matchAll(importRe)) {
    const spec = m[1]
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
          const childSrc = readFileSync(c, 'utf8')
          if (hasLandmark(childSrc, kind)) return true
        } catch {}
        break
      }
    }
  }
  return false
}

// ── 1. Vérification du layout root ─────────────────────────────────────
const LAYOUT_PATH = 'src/app/layout.tsx'
const layoutReport = {
  file: LAYOUT_PATH,
  nav: false,
  banner: false,
  contentinfo: false,
}
if (existsSync(LAYOUT_PATH)) {
  const src = readFileSync(LAYOUT_PATH, 'utf8')
  layoutReport.nav = hasLandmark(src, 'nav') || hasLandmarkViaImports(LAYOUT_PATH, src, 'nav')
  layoutReport.banner =
    hasLandmark(src, 'banner') || hasLandmarkViaImports(LAYOUT_PATH, src, 'banner')
  layoutReport.contentinfo =
    hasLandmark(src, 'contentinfo') || hasLandmarkViaImports(LAYOUT_PATH, src, 'contentinfo')
}

// ── 2. Vérification de <main> sur chaque page indexable ─────────────────
const pages = walk('src/app').filter((f) => /page\.tsx$/.test(f))
const mainGaps = []
let indexable = 0

// Layouts imbriqués peuvent fournir <main> — on collecte aussi les layout.tsx
const layouts = walk('src/app').filter((f) => /layout\.tsx$/.test(f))
function hasMainInAncestorLayouts(pageFile) {
  // Ex: page `src/app/(public)/foo/page.tsx` — ancestors =
  // `src/app/(public)/foo/layout.tsx`, `src/app/(public)/layout.tsx`, `src/app/layout.tsx`
  const parts = pageFile.split(sep)
  const appIdx = parts.findIndex((p) => p === 'app')
  if (appIdx < 0) return false
  for (let i = parts.length - 1; i >= appIdx; i--) {
    const layoutCand = parts.slice(0, i).concat(['layout.tsx']).join(sep)
    if (layouts.includes(layoutCand)) {
      const childSrc = readFileSync(layoutCand, 'utf8')
      if (hasLandmark(childSrc, 'main') || hasLandmarkViaImports(layoutCand, childSrc, 'main'))
        return true
    }
  }
  return false
}

for (const f of pages) {
  const normalized = f.split(sep).join('/')
  const src = readFileSync(f, 'utf8')
  const hasMeta =
    /export\s+(async\s+)?function\s+generateMetadata/.test(src) ||
    /export\s+const\s+metadata\s*[:=]/.test(src)
  if (!hasMeta) continue
  if (inferNoindex(src, normalized)) continue
  indexable++

  const hasMain =
    hasLandmark(src, 'main') ||
    hasLandmarkViaImports(f, src, 'main') ||
    hasMainInAncestorLayouts(f)
  if (!hasMain) {
    mainGaps.push({ route: pathToRoute(normalized), file: normalized })
  }
}

const layoutGaps = []
if (!layoutReport.nav) layoutGaps.push('<nav> / Header / role=navigation absent du layout root')
if (!layoutReport.banner) layoutGaps.push('<header> / role=banner absent du layout root')
if (!layoutReport.contentinfo)
  layoutGaps.push('<footer> / Footer / role=contentinfo absent du layout root')

const report = {
  layout: layoutReport,
  layout_gaps: layoutGaps,
  indexable_pages: indexable,
  pages_without_main: mainGaps.length,
  coverage_main_pct:
    indexable === 0 ? 100 : Number((((indexable - mainGaps.length) / indexable) * 100).toFixed(1)),
  main_gaps: mainGaps,
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 ARIA Landmarks Audit\n')
  console.log(`  Layout root (${LAYOUT_PATH}) :`)
  console.log(`     nav / Header       : ${layoutReport.nav ? '✓' : '✗'}`)
  console.log(`     header / banner    : ${layoutReport.banner ? '✓' : '✗'}`)
  console.log(`     footer / contentinfo : ${layoutReport.contentinfo ? '✓' : '✗'}\n`)

  console.log(`  Pages indexables scannées  : ${report.indexable_pages}`)
  console.log(`  Sans <main>                : ${report.pages_without_main}`)
  console.log(`  Coverage <main>            : ${report.coverage_main_pct}%\n`)

  if (layoutGaps.length === 0 && mainGaps.length === 0) {
    console.log('  ✅ Tous les landmarks ARIA sont présents.\n')
  } else {
    if (layoutGaps.length > 0) {
      console.log('  ❌ Gaps layout :')
      for (const g of layoutGaps) console.log(`     - ${g}`)
      console.log('')
    }
    if (mainGaps.length > 0) {
      console.log('  ⚠️  Pages sans landmark <main> :')
      for (const g of mainGaps.slice(0, 30)) console.log(`     ${g.route.padEnd(50)} (${g.file})`)
      if (mainGaps.length > 30) console.log(`     ... et ${mainGaps.length - 30} de plus`)
      console.log('')
    }
  }
}

const hasAnyGap = layoutGaps.length > 0 || mainGaps.length > 0
if (strict && hasAnyGap) process.exit(1)
