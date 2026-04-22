#!/usr/bin/env node
/**
 * scripts/audit-internal-links-404.mjs
 * ------------------------------------
 * Détecte les liens internes <Link href="..."> / <a href="..."> qui ne
 * correspondent à AUCUNE route existante dans le repo.
 *
 * Pourquoi :
 *   - Lien interne mort = 404 quand l'utilisateur clique → bounce
 *   - Google découvre l'URL, crawle la 404, gaspille le budget
 *   - PageRank leak : un lien sortant qui 404 dilue le juice
 *   - À grande échelle : 408K pages × 50 liens = facile de laisser passer
 *     un lien cassé dupliqué partout
 *
 * Méthode :
 *   1. Scanne tous les *.tsx dans src/ à la recherche de href="/..."
 *   2. Construit la liste des routes valides :
 *      - Pages statiques : src/app/**page.tsx
 *      - Pages dynamiques : [param] traités comme wildcard
 *      - Redirects 301 de next.config.js
 *      - API routes ignorées
 *   3. Pour chaque lien interne, vérifie qu'il matche au moins une route
 *      ou un redirect.
 *   4. Reporte les liens morts avec fichier + nombre d'occurrences.
 *
 * Skip :
 *   - Liens externes (http://, https://, mailto:, tel:, #, javascript:)
 *   - Liens avec ${interpolation} pure (pas d'analyse statique possible)
 *   - Paramètres (?query) et ancres (#fragment) retirés avant check
 *
 * Usage :
 *   node scripts/audit-internal-links-404.mjs           # human
 *   node scripts/audit-internal-links-404.mjs --json    # JSON
 *   node scripts/audit-internal-links-404.mjs --strict  # exit 1 si gap
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const APP_DIR = join(ROOT, 'src', 'app')
const SRC_DIR = join(ROOT, 'src')
const CONFIG = join(ROOT, 'next.config.js')

function walk(dir, pattern, acc = []) {
  if (!existsSync(dir)) return acc
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, pattern, acc)
    else if (pattern.test(entry)) acc.push(full)
  }
  return acc
}

// Build regex-pattern list of valid routes from src/app/**page.tsx
function buildValidRoutes() {
  const pageFiles = walk(APP_DIR, /^page\.tsx$/)
  const patterns = new Set()
  for (const file of pageFiles) {
    let rel = relative(APP_DIR, file).replace(/[\\/]page\.tsx$/, '').replace(/\\/g, '/')
    // Drop route groups (parens): (public), (private), etc.
    rel = rel
      .split('/')
      .filter((seg) => !(seg.startsWith('(') && seg.endsWith(')')))
      .join('/')
    const route = rel === '' ? '/' : '/' + rel
    // Convert [param] → regex wildcard, [...param] / [[...param]] → same
    const regexStr =
      '^' +
      route
        .replace(/\[\[\.\.\.[^\]]+\]\]/g, '(?:/.*)?')
        .replace(/\[\.\.\.[^\]]+\]/g, '.+')
        .replace(/\[[^\]]+\]/g, '[^/]+') +
      '/?$'
    patterns.add(regexStr)
  }
  return Array.from(patterns).map((s) => new RegExp(s))
}

function buildRedirectSources() {
  if (!existsSync(CONFIG)) return []
  const src = readFileSync(CONFIG, 'utf8')
  const out = new Set()
  const re = /source\s*:\s*(['"`])((?:\\.|(?!\1).)+)\1/g
  let m
  while ((m = re.exec(src))) {
    let s = m[2]
    // Convert :param → wildcard
    s = s.replace(/:[a-zA-Z_][a-zA-Z0-9_]*\*/g, '.*').replace(/:[a-zA-Z_][a-zA-Z0-9_]*/g, '[^/]+')
    out.add('^' + s + '/?$')
  }
  return Array.from(out).map((r) => new RegExp(r))
}

// Paths to scan for internal links — exclude tests, node_modules, .next, scripts
function walkSrc(acc = [], dir = SRC_DIR) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) {
      if (['__tests__', '.next', 'node_modules'].includes(entry)) continue
      walkSrc(acc, full)
    } else if (/\.(tsx?|jsx?)$/.test(entry)) acc.push(full)
  }
  return acc
}

function extractInternalLinks(src) {
  // Match href="..."  (single or double quote, literal strings only)
  // We skip `href={...}` and template literals with interpolation.
  const out = []
  const re = /href\s*=\s*(["'])(\/[^"'\s]*)\1/g
  let m
  while ((m = re.exec(src))) {
    const link = m[2].replace(/\?.*$/, '').replace(/#.*$/, '')
    if (!link) continue
    // Filter: skip API, asset paths, mailto-esque, etc.
    if (link.startsWith('/api/')) continue
    if (link.startsWith('/_next/')) continue
    if (/\.(png|jpe?g|svg|webp|ico|pdf|xml|txt)$/i.test(link)) continue
    out.push(link)
  }
  return out
}

function main() {
  const validRouteRegexps = buildValidRoutes()
  const redirectSourceRegexps = buildRedirectSources()
  const combined = [...validRouteRegexps, ...redirectSourceRegexps]

  const srcFiles = walkSrc()
  const dead = new Map() // link → [file, count]

  for (const file of srcFiles) {
    const src = readFileSync(file, 'utf8')
    const links = extractInternalLinks(src)
    for (const link of links) {
      const ok = combined.some((re) => re.test(link))
      if (!ok) {
        const rel = relative(ROOT, file).replace(/\\/g, '/')
        const key = link
        const entry = dead.get(key) ?? { occurrences: [], count: 0 }
        entry.count++
        if (!entry.occurrences.includes(rel)) entry.occurrences.push(rel)
        dead.set(key, entry)
      }
    }
  }

  const issues = [...dead.entries()]
    .map(([link, info]) => ({ link, count: info.count, files: info.occurrences }))
    .sort((a, b) => b.count - a.count)

  const report = {
    valid_routes_scanned: validRouteRegexps.length,
    redirect_sources: redirectSourceRegexps.length,
    source_files_scanned: srcFiles.length,
    dead_links: issues.length,
    total_broken_occurrences: issues.reduce((s, i) => s + i.count, 0),
    issues,
  }

  if (jsonOut) {
    console.log(JSON.stringify(report, null, 2))
  } else {
    console.log('\n📋 Internal Links 404 Audit\n')
    console.log(`  Routes valides (pages)        : ${report.valid_routes_scanned}`)
    console.log(`  Sources redirect 301          : ${report.redirect_sources}`)
    console.log(`  Fichiers src/ scannés         : ${report.source_files_scanned}`)
    console.log(`  Liens morts distincts         : ${report.dead_links}`)
    console.log(`  Occurrences totales           : ${report.total_broken_occurrences}`)
    if (issues.length) {
      console.log('\n  ⚠️  Top 20 liens morts :')
      for (const i of issues.slice(0, 20)) {
        console.log(`     [${i.count}×] ${i.link}`)
        for (const f of i.files.slice(0, 3)) console.log(`         ${f}`)
        if (i.files.length > 3) console.log(`         … +${i.files.length - 3} fichiers`)
      }
      console.log('')
    } else {
      console.log('\n  ✅ Aucun lien interne mort détecté.\n')
    }
  }

  if (strict && issues.length > 0) process.exit(1)
}

main()
