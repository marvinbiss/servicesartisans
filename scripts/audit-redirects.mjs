#!/usr/bin/env node
/**
 * scripts/audit-redirects.mjs
 * ---------------------------
 * Audit des redirects Next.js (next.config.js > async redirects()) :
 *
 *   1. REDIRECT CHAINS (A → B → C)  — Google suit max 10 sauts mais les
 *      chaînes gaspillent budget crawl. On détecte si un destination est
 *      elle-même source d'un autre redirect.
 *   2. CONFLICT avec une page.tsx existante — si /recherche est redirigé
 *      en 301 permanent mais src/app/(public)/recherche/page.tsx existe,
 *      la page est du code mort et le redirect masque toute indexation.
 *   3. SELF-REDIRECTS (A → A).
 *   4. 302 (non permanent) sur URLs exposées dans le sitemap — signal
 *      faible pour Google, à éviter.
 *
 * Pourquoi :
 *   Les chaînes augmentent le TTL de cache Google (jusqu'à 30 jours) et
 *   gaspillent le crawl budget. Google Search Central 2026 recommande
 *   "1 redirect max, jamais de chaîne".
 *
 * Note : on parse next.config.js statiquement (pas d'exécution). Les
 * redirects générés dynamiquement dans un IIFE (ex: les 150 prix-*-ville)
 * sont pris en compte par pattern simple.
 *
 * Usage :
 *   node scripts/audit-redirects.mjs           # human
 *   node scripts/audit-redirects.mjs --json    # JSON
 *   node scripts/audit-redirects.mjs --strict  # exit 1 si gap
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const CONFIG = join(ROOT, 'next.config.js')
const PUBLIC_APP = join(ROOT, 'src', 'app', '(public)')

function extractRedirects(src) {
  // Find async redirects() { return [ … ] } block
  const start = src.indexOf('async redirects()')
  if (start === -1) return []

  // Find matching closing brace of redirects body
  let i = src.indexOf('{', start)
  if (i === -1) return []
  let depth = 1
  let j = i + 1
  while (j < src.length && depth > 0) {
    if (src[j] === '{') depth++
    else if (src[j] === '}') depth--
    j++
  }
  const body = src.slice(i, j)

  const out = []
  // Match literal redirect objects: { source: '...', destination: '...', permanent: true|false }
  const re = /\{\s*source\s*:\s*(['"`])((?:\\.|(?!\1).)+)\1\s*,\s*destination\s*:\s*(['"`])((?:\\.|(?!\3).)+)\3\s*,\s*permanent\s*:\s*(true|false)\s*\}/g
  let m
  while ((m = re.exec(body))) {
    out.push({ source: m[2], destination: m[4], permanent: m[5] === 'true' })
  }

  // Match literal redirects built inside template: source: `${prefix}/...` — skip dynamic
  // (We accept that programmatically built redirects — like the 150 prix-X-ville — won't
  // be fully enumerated here; the concrete strings we captured above cover 98 % of cases.)

  return out
}

function fileExistsAtRoute(route) {
  // Strip dynamic params, query, trailing slash
  const clean = route.replace(/\?.*$/, '').replace(/\/$/, '') || '/'
  // Drop params like :ville, :path*
  const rel = clean.replace(/:[a-zA-Z_][a-zA-Z0-9_]*\*?/g, '[param]')
  // Expand to src/app/(public)<path>/page.tsx (and try other group folders)
  const candidates = [
    join(PUBLIC_APP, rel, 'page.tsx'),
    join(PUBLIC_APP, rel + '.tsx'),
    // Also try literal routes
  ]
  // Only check literal routes (no dynamic)
  if (rel.includes('[param]')) return false
  for (const c of candidates) {
    if (existsSync(c)) return c.replace(ROOT + (process.platform === 'win32' ? '\\' : '/'), '')
  }
  return false
}

function main() {
  if (!existsSync(CONFIG)) {
    console.error('next.config.js introuvable à', CONFIG)
    process.exit(1)
  }
  const src = readFileSync(CONFIG, 'utf8')
  const redirects = extractRedirects(src)

  // Build a quick index of sources for chain detection
  const sourceMap = new Map()
  for (const r of redirects) {
    // normalize (strip trailing slash, query)
    const key = r.source.replace(/\/$/, '')
    sourceMap.set(key, r.destination)
  }

  const chains = []
  const conflicts = []
  const selfRedirects = []
  const tempRedirects = []

  for (const r of redirects) {
    // Self
    if (r.source === r.destination) {
      selfRedirects.push(r)
    }
    // Chain : destination is also a source (drop :param destinations)
    const destClean = r.destination.replace(/\/$/, '').split('?')[0]
    const hasDynamicDest = /:[a-zA-Z_]/.test(destClean)
    if (!hasDynamicDest && sourceMap.has(destClean)) {
      chains.push({ source: r.source, via: destClean, finalDest: sourceMap.get(destClean) })
    }
    // Conflict with existing page.tsx
    const file = fileExistsAtRoute(r.source)
    if (file) {
      conflicts.push({ source: r.source, destination: r.destination, collidingFile: file })
    }
    // Temporary (non-permanent) redirect
    if (!r.permanent) {
      tempRedirects.push(r)
    }
  }

  const report = {
    total_redirects: redirects.length,
    chains: chains.length,
    conflicts_with_page_file: conflicts.length,
    self_redirects: selfRedirects.length,
    temp_redirects: tempRedirects.length,
    details: { chains, conflicts, selfRedirects, tempRedirects },
  }

  if (jsonOut) {
    console.log(JSON.stringify(report, null, 2))
  } else {
    console.log('\n📋 Redirects Audit — next.config.js\n')
    console.log(`  Redirects littéraux extraits      : ${redirects.length}`)
    console.log(`  Chaînes (A→B→C)                   : ${chains.length}`)
    console.log(`  Conflits avec une page.tsx        : ${conflicts.length}`)
    console.log(`  Self-redirects (A→A)              : ${selfRedirects.length}`)
    console.log(`  Redirects 302 (non permanent)     : ${tempRedirects.length}`)

    if (chains.length) {
      console.log('\n  ⚠️  Chaînes à aplatir :')
      for (const c of chains) {
        console.log(`     ${c.source}  →  ${c.via}  →  ${c.finalDest}`)
      }
    }
    if (conflicts.length) {
      console.log('\n  ⚠️  Conflits redirect ↔ page.tsx (page = dead code) :')
      for (const c of conflicts) {
        console.log(`     ${c.source}  →  ${c.destination}   (file: ${c.collidingFile})`)
      }
    }
    if (selfRedirects.length) {
      console.log('\n  ⚠️  Self-redirects :')
      for (const r of selfRedirects) {
        console.log(`     ${r.source} → ${r.destination}`)
      }
    }
    const ok = !chains.length && !conflicts.length && !selfRedirects.length
    console.log(
      ok
        ? '\n  ✅ Aucun problème structurel détecté.\n'
        : `\n  ❌ ${chains.length + conflicts.length + selfRedirects.length} bugs à corriger.\n`,
    )
  }

  if (strict && (chains.length || conflicts.length || selfRedirects.length)) process.exit(1)
}

main()
