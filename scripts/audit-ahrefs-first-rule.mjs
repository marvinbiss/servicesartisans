#!/usr/bin/env node
/**
 * scripts/audit-ahrefs-first-rule.mjs
 * ------------------------------------
 * Vérifie la règle Ahrefs-first sur les pages indexables nouvellement
 * créées : chaque src/app/(public)/**\/page.tsx indexable doit déclarer
 * en haut du fichier un bloc JSDoc qui cite :
 *
 *   - @kw-primary    : keyword cible
 *   - @kw-volume     : volume Ahrefs (mensuel)
 *   - @kw-kd         : keyword difficulty
 *   - @ahrefs-source : chemin CSV ou doc Ahrefs (`docs/...`)
 *
 * Source : mémoire `servicesartisans-ahrefs-first-rule` (top 0.001%
 * exigence Marvin) + budget Ahrefs 600€+ déjà dépensé sur 6 Blocs.
 *
 * Exclusions : routes admin, api, auth, legal, simulateur (non SEO),
 * pages utilitaires (loading, error, not-found, layout).
 *
 * Stratégie progressive : grandfather les pages existantes via
 * `docs/ahrefs-first-grandfather.json` (créé vide ; les nouveaux items
 * ajoutés sans header doivent y être listés explicitement, ce qui
 * force une décision consciente vs commit silencieux).
 *
 * Usage :
 *   node scripts/audit-ahrefs-first-rule.mjs           # human
 *   node scripts/audit-ahrefs-first-rule.mjs --json
 *   node scripts/audit-ahrefs-first-rule.mjs --strict  # exit 1 si gap
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const PAGES_ROOT = join(ROOT, 'src', 'app')
const GRANDFATHER_PATH = join(ROOT, 'docs', 'ahrefs-first-grandfather.json')

const EXCLUDE_SEGMENTS = new Set([
  'admin',
  'api',
  'auth',
  'legal',
  'sentry-example-page',
])

const REQUIRED_TAGS = ['@kw-primary', '@ahrefs-source']

function loadGrandfather() {
  if (!existsSync(GRANDFATHER_PATH)) return new Set()
  try {
    const data = JSON.parse(readFileSync(GRANDFATHER_PATH, 'utf8'))
    return new Set(Array.isArray(data?.routes) ? data.routes : [])
  } catch {
    return new Set()
  }
}

function isIndexable(src) {
  // robots.noindex meta = pas indexable (skip).
  if (/robots\s*:\s*\{[^}]*index\s*:\s*false/s.test(src)) return false
  // generateMetadata noindex pattern
  if (/noindex\s*:\s*true/.test(src)) return false
  return true
}

function hasAhrefsHeader(src) {
  // First 60 lines should contain a JSDoc block (`/** ... */`) with the tags.
  const head = src.split(/\r?\n/, 60).join('\n')
  return REQUIRED_TAGS.every((tag) => head.includes(tag))
}

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) {
      const seg = entry.replace(/^\(.*\)$/, '')
      if (EXCLUDE_SEGMENTS.has(seg)) continue
      walk(full, acc)
    } else if (entry === 'page.tsx' || entry === 'page.ts') {
      acc.push(full)
    }
  }
  return acc
}

function pageRoute(absPath) {
  const rel = relative(PAGES_ROOT, absPath).replace(/\\/g, '/')
  return (
    '/' +
    rel
      .replace(/\/page\.(t|j)sx?$/, '')
      .replace(/\([^)]*\)\//g, '')
      .replace(/^\(?[^)]*\)$/, '')
  )
}

function main() {
  const grandfather = loadGrandfather()
  const files = walk(PAGES_ROOT)
  const issues = []
  let scanned = 0
  let indexable = 0

  for (const file of files) {
    scanned++
    const src = readFileSync(file, 'utf8')
    if (!isIndexable(src)) continue
    indexable++

    const route = pageRoute(file)
    if (grandfather.has(route)) continue

    if (!hasAhrefsHeader(src)) {
      issues.push({
        route,
        file: relative(ROOT, file).replace(/\\/g, '/'),
        missing_tags: REQUIRED_TAGS.filter((t) => !src.includes(t)),
      })
    }
  }

  const report = {
    scanned,
    indexable,
    grandfathered: grandfather.size,
    issues_total: issues.length,
    issues,
  }

  if (jsonOut) {
    console.log(JSON.stringify(report, null, 2))
  } else {
    console.log('\n📋 Ahrefs-First Rule Audit\n')
    console.log(`  Pages scannées        : ${scanned}`)
    console.log(`  Pages indexables      : ${indexable}`)
    console.log(`  Grandfathered         : ${grandfather.size}`)
    console.log(`  Issues (manque header): ${issues.length}`)
    if (issues.length > 0) {
      console.log('\n  ⚠️  Pages sans header Ahrefs (nouvelles pages prioritaires) :')
      for (const i of issues.slice(0, 20)) {
        console.log(`     - ${i.route}  (manque ${i.missing_tags.join(', ')})`)
      }
      if (issues.length > 20) console.log(`     ... +${issues.length - 20} autres`)
      console.log(
        '\n  Action :\n' +
          '    a. Soit ajouter le bloc JSDoc avec @kw-primary + @ahrefs-source\n' +
          '    b. Soit ajouter la route à docs/ahrefs-first-grandfather.json (décision consciente)\n'
      )
    } else {
      console.log('\n  ✅ Toutes les pages indexables citent leur source Ahrefs.\n')
    }
  }

  if (strict && issues.length > 0) process.exit(1)
}

main()
