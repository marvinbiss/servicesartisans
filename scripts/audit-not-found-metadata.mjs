#!/usr/bin/env node
/**
 * scripts/audit-not-found-metadata.mjs
 * --------------------------------------
 * Bug Next.js 14.2 vercel/next.js#69103 — root cause résiduel des soft 404.
 *
 * Sur les routes ISR avec `dynamicParams: true`, `notFound()` peut renvoyer
 * HTTP 200 + le composant `not-found.tsx` du segment. Sans `metadata.robots`
 * explicite, le layout racine impose `robots: { index: true, follow: true }`
 * sur la réponse HTML → Google indexe + soft-404 leak.
 *
 * On garantit ici qu'**aucun** route-level `not-found.tsx` ne peut être mergé
 * sans `export const metadata` contenant `robots: { index: false, follow: false }`.
 *
 * Couverture : tous les `not-found.tsx` sous `src/app/(public)/**`. Le racine
 * `src/app/not-found.tsx` est exclu (servi sur paths non-ISR).
 *
 * Usage :
 *   node scripts/audit-not-found-metadata.mjs [--strict]
 *
 * En mode --strict, exit 1 si au moins 1 fichier viole la règle.
 */

import { readFileSync, statSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const PUBLIC_DIR = join(ROOT, 'src', 'app', '(public)')

function walk(dir, out = []) {
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const entry of entries) {
    const full = join(dir, entry)
    let st
    try {
      st = statSync(full)
    } catch {
      continue
    }
    if (st.isDirectory()) walk(full, out)
    else if (entry === 'not-found.tsx') out.push(full)
  }
  return out
}

const files = walk(PUBLIC_DIR)

const violations = []

const PATTERN_IMPORT = /import\s+type\s+\{\s*Metadata\s*\}\s+from\s+['"]next['"]/
const PATTERN_EXPORT = /export\s+const\s+metadata\s*:\s*Metadata/
const PATTERN_INDEX_FALSE = /robots\s*:\s*\{[^}]*index\s*:\s*false/m
const PATTERN_FOLLOW_FALSE = /robots\s*:\s*\{[^}]*follow\s*:\s*false/m

for (const file of files) {
  const src = readFileSync(file, 'utf8')
  const rel = relative(ROOT, file)
  const issues = []
  if (!PATTERN_IMPORT.test(src)) {
    issues.push("import type { Metadata } from 'next' manquant")
  }
  if (!PATTERN_EXPORT.test(src)) {
    issues.push('export const metadata: Metadata manquant')
  }
  if (!PATTERN_INDEX_FALSE.test(src)) {
    issues.push("robots: { index: false } manquant")
  }
  if (!PATTERN_FOLLOW_FALSE.test(src)) {
    issues.push("robots: { follow: false } manquant")
  }
  if (issues.length > 0) {
    violations.push({ file: rel, issues })
  }
}

if (jsonOut) {
  console.log(
    JSON.stringify(
      { total: files.length, violations: violations.length, details: violations },
      null,
      2
    )
  )
} else {
  console.log(`Audit not-found.tsx metadata : ${files.length} fichier(s) scanné(s)`)
  if (violations.length === 0) {
    console.log('  → 0 violation. Tous les route-level not-found.tsx exportent robots:noindex.')
  } else {
    console.error(`  → ${violations.length} violation(s) :`)
    for (const v of violations) {
      console.error(`    - ${v.file}`)
      for (const issue of v.issues) {
        console.error(`        · ${issue}`)
      }
    }
    console.error(
      "\nRappel : bug Next.js 14.2 #69103 — sans metadata.robots explicite,"
    )
    console.error(
      'le not-found.tsx hérite robots:{index:true} du layout racine et leak en soft-404.'
    )
  }
}

if (strict && violations.length > 0) {
  process.exit(1)
}
