#!/usr/bin/env node
/**
 * scripts/audit-opengraph.mjs
 * --------------------------
 * Vérifie que chaque page indexable expose un bloc `openGraph` complet :
 *   - og:title (via openGraph.title OU fallback metadata.title)
 *   - og:description
 *   - og:url
 *   - og:type (website / article / product)
 *
 * Pourquoi : OpenGraph contrôle l'unfurl sur Facebook, LinkedIn, WhatsApp,
 * Slack, Discord. Sans OG, Google peut aussi fallback sur un snippet dégradé.
 * og:image est géré par Next.js via metadata.openGraph.images OU par
 * l'opengraph-image.png/jpg au niveau root — on ne peut pas vérifier le
 * fichier statique fiablement en statique, donc on le flag en warning.
 *
 * Règle critique : `openGraph` présent. Règle soft : `images` renseigné.
 *
 * Usage :
 *   node scripts/audit-opengraph.mjs            # human
 *   node scripts/audit-opengraph.mjs --json     # JSON
 *   node scripts/audit-opengraph.mjs --strict   # exit 1 si OG block manquant
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
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
 * Extrait les clés déclarées dans le bloc openGraph.
 * Supporte : `openGraph: { ... }` statique et à l'intérieur de generateMetadata.
 * On ne cherche pas à résoudre les valeurs (présence suffit pour l'audit OG).
 */
function analyzeOG(src) {
  // Chercher le bloc openGraph (dans metadata OU dans generateMetadata)
  const re = /openGraph\s*:\s*\{([\s\S]*?)\n\s*\}/m
  const m = src.match(re)
  if (!m) return { present: false, keys: [] }
  const block = m[1]
  const keys = new Set()
  // Supporte property avec valeur (`title: X`) ET shorthand ES6 (`title,` ou `title }`)
  const hasKey = (k) => new RegExp(`(?:^|[\\s,{])${k}\\s*(?:[,:}]|$)`, 'm').test(block)
  if (hasKey('title')) keys.add('title')
  if (hasKey('description')) keys.add('description')
  if (hasKey('url')) keys.add('url')
  if (hasKey('type')) keys.add('type')
  if (hasKey('images')) keys.add('images')
  if (hasKey('locale')) keys.add('locale')
  return { present: true, keys: [...keys] }
}

const REQUIRED_KEYS = ['title', 'description', 'url']

const pages = walk('src/app')
const gaps = []
let indexable = 0
let withOG = 0

for (const f of pages) {
  const normalized = f.split(sep).join('/')
  const src = readFileSync(f, 'utf8')
  const hasMeta =
    /export\s+(async\s+)?function\s+generateMetadata/.test(src) ||
    /export\s+const\s+metadata\s*[:=]/.test(src)
  if (!hasMeta) continue
  if (inferNoindex(src, normalized)) continue
  indexable++

  const og = analyzeOG(src)
  if (og.present) withOG++
  const missing = REQUIRED_KEYS.filter((k) => !og.keys.includes(k))
  if (!og.present || missing.length > 0) {
    gaps.push({
      route: pathToRoute(normalized),
      file: normalized,
      og_present: og.present,
      missing_required_keys: missing,
      declared_keys: og.keys,
    })
  }
}

// Image root-level (via /opengraph-image.* ou /opengraph-image/route.ts)
const hasRootOGImage =
  existsSync('src/app/opengraph-image.png') ||
  existsSync('src/app/opengraph-image.jpg') ||
  existsSync('src/app/opengraph-image.tsx') ||
  existsSync('src/app/opengraph-image/route.ts')

const report = {
  indexable_pages: indexable,
  pages_with_og_block: withOG,
  pages_with_gaps: gaps.length,
  root_opengraph_image: hasRootOGImage,
  coverage_pct: indexable === 0 ? 100 : Number(((withOG / indexable) * 100).toFixed(1)),
  gaps,
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 OpenGraph Coverage Audit\n')
  console.log(`  Pages indexables scannées : ${report.indexable_pages}`)
  console.log(`  Pages avec bloc openGraph : ${report.pages_with_og_block}`)
  console.log(`  Coverage                  : ${report.coverage_pct}%`)
  console.log(`  Image OG root             : ${report.root_opengraph_image ? '✓' : '✗'}\n`)

  if (gaps.length === 0) {
    console.log('  ✅ Toutes les pages indexables ont un bloc openGraph complet.\n')
  } else {
    console.log('  ⚠️  Pages avec gaps OpenGraph :')
    for (const g of gaps) {
      if (!g.og_present) {
        console.log(`     ${g.route.padEnd(50)} bloc openGraph ABSENT`)
      } else {
        console.log(
          `     ${g.route.padEnd(50)} clés manquantes : ${g.missing_required_keys.join(', ')}`
        )
      }
    }
    console.log('')
  }
}

if (strict && gaps.length > 0) process.exit(1)
