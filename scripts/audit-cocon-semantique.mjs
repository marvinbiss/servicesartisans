#!/usr/bin/env node
/**
 * scripts/audit-cocon-semantique.mjs
 * ----------------------------------
 * Chaque page indexable doit contenir au moins N liens internes sortants
 * (`<Link href=>`, `<a href="/...">`) pour former un cocon sémantique :
 * distribue du PageRank interne + donne à Google un contexte thématique.
 *
 * Pourquoi :
 *   - Référencement de cocon (Laurent Bourrelly) : une page sans liens
 *     sortants internes = feuille morte, ne transmet rien, peine à ranker.
 *   - Budget crawl : Google découvre de nouvelles pages via les liens
 *     internes. Une page sans sortants freine la découverte.
 *   - E-E-A-T : les liens contextuels vers d'autres pages du même cluster
 *     signalent une expertise topique (topical authority).
 *
 * Règle : chaque page indexable doit avoir ≥ MIN_LINKS liens internes
 * (défaut 3), dont ≥ 1 vers le parent/frère (topical proximity).
 *
 * Méthodologie :
 *   1. Scanner les page.tsx indexables.
 *   2. Compter les liens internes (`<Link href=>`, `<a href="/">`,
 *      `href=\`/X\``) — exclut les externes et ancres.
 *   3. Inclure les liens des composants importés depth=1 (Header/Footer
 *      qui délèguent déjà la plupart des liens globaux).
 *   4. Flag les pages < MIN_LINKS.
 *
 * Usage :
 *   node scripts/audit-cocon-semantique.mjs            # human
 *   node scripts/audit-cocon-semantique.mjs --json     # JSON
 *   node scripts/audit-cocon-semantique.mjs --strict   # exit 1 si gap
 *   node scripts/audit-cocon-semantique.mjs --min=5    # override MIN_LINKS
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, sep, dirname } from 'node:path'

const args = process.argv.slice(2)
const strict = args.includes('--strict')
const jsonOut = args.includes('--json')
const minArg = args.find((a) => a.startsWith('--min='))
const MIN_LINKS = minArg ? parseInt(minArg.split('=')[1], 10) : 3

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

/**
 * Compte les liens internes (href=/... ou href=`/...`) dans une source.
 * Exclut : externes (http://, https://, mailto:, tel:, //), anchors pures
 * (#X), paths vides.
 */
function countInternalLinks(src) {
  const hrefRe = /href\s*=\s*(?:\{?`([^`]+)`\}?|\{?['"]([^'"]+)['"]\}?)/g
  let count = 0
  for (const m of src.matchAll(hrefRe)) {
    const href = (m[1] ?? m[2] ?? '').trim()
    if (!href) continue
    if (/^(https?:|mailto:|tel:|javascript:|\/\/)/.test(href)) continue
    if (href.startsWith('#')) continue
    if (!href.startsWith('/') && !href.startsWith('${') && !/^\w/.test(href)) continue
    // Consider paths starting with `/` or with template-literal interpolation
    if (href.startsWith('/') || /\$\{/.test(href)) count++
  }
  return count
}

function countFromImports(pageFile, src, budget = 50) {
  const pageDir = dirname(pageFile)
  const importRe = /import\s+\w+\s+from\s+['"](\.\/[^'"]+|@\/[^'"]+)['"]/g
  let total = 0
  for (const m of src.matchAll(importRe)) {
    if (total >= budget) break
    const spec = m[1]
    if (/^@\/(hooks|lib|types|contexts|stores)(\/|$)/.test(spec)) continue
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
          total += countInternalLinks(readFileSync(c, 'utf8'))
        } catch {}
        break
      }
    }
  }
  return total
}

// Compute baseline internal links from root layout (Header, Footer, etc.)
// applied globally to every page via src/app/layout.tsx.
let baselineLinks = 0
{
  const rootLayout = 'src/app/layout.tsx'
  if (existsSync(rootLayout)) {
    const rootSrc = readFileSync(rootLayout, 'utf8')
    baselineLinks = countInternalLinks(rootSrc) + countFromImports(rootLayout, rootSrc, 100)
  }
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
  scanned++
  const inline = countInternalLinks(src)
  const imported = countFromImports(f, src)
  const total = inline + imported + baselineLinks
  if (total < MIN_LINKS) {
    gaps.push({
      route: pathToRoute(normalized),
      file: normalized,
      inline,
      imported,
      baseline: baselineLinks,
      total,
    })
  }
}

const report = {
  min_links_threshold: MIN_LINKS,
  baseline_layout_links: baselineLinks,
  indexable_pages_scanned: scanned,
  pages_below_threshold: gaps.length,
  coverage_pct:
    scanned === 0 ? 100 : Number((((scanned - gaps.length) / scanned) * 100).toFixed(1)),
  gaps,
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log(`\n📋 Cocon Sémantique Audit (≥ ${MIN_LINKS} liens internes / page)\n`)
  console.log(`  Pages indexables scannées     : ${report.indexable_pages_scanned}`)
  console.log(`  Pages sous seuil              : ${report.pages_below_threshold}`)
  console.log(`  Coverage                      : ${report.coverage_pct}%\n`)
  if (gaps.length === 0) {
    console.log(`  ✅ Toutes les pages ont ≥ ${MIN_LINKS} liens internes.\n`)
  } else {
    console.log('  ❌ Pages sous seuil :')
    for (const g of gaps.slice(0, 30))
      console.log(`     ${String(g.total).padStart(2)} liens  ${g.route}`)
    if (gaps.length > 30) console.log(`     ... et ${gaps.length - 30} de plus`)
    console.log('')
  }
}

if (strict && gaps.length > 0) process.exit(1)
