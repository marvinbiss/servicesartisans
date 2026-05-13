#!/usr/bin/env node
/**
 * scripts/audit-banned-tokens.mjs
 * -------------------------------
 * Bloque l'usage de classes Tailwind hors-DESIGN.md sur src/.
 *
 * Tokens bannis (et leur remplacement canonical) :
 *   - emerald-*    → accent-*   (palette warm Forest Green, pas générique emerald)
 *   - slate-*      → charcoal-* (palette chaude, pas cool slate)
 *   - gray-*       → charcoal-* (pareil)
 *   - stone-*      → sand-* / charcoal-* (selon contexte)
 *   - violet-*     → primary-* / accent-* (hors palette)
 *   - indigo-*     → primary-* / accent-* (hors palette)
 *   - blue-*       → primary-* (hors palette pour CTA/links)
 *   - font-jakarta → font-heading (Plus Jakarta Sans non chargé, alias Sora)
 *
 * Pourquoi :
 *   Drift visuel détecté audit 2026-05-13 (1722 emerald-* remplacés).
 *   Une régression silencieuse re-introduirait le drift.
 *
 * Usage :
 *   node scripts/audit-banned-tokens.mjs            # human
 *   node scripts/audit-banned-tokens.mjs --strict   # exit 1 si violation
 *   node scripts/audit-banned-tokens.mjs --json     # JSON
 *
 * Hook pre-commit : ajouter dans .husky/pre-commit.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, sep } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

// Régression-blockers — tout match = erreur.
// Note : on évite les faux+ substring (ex: `slate-` dans `translate-`,
// `gray-` théorique dans `engraveray-`...) via lookbehind : le token
// doit être précédé d'une non-lettre (`-`, `:`, espace, quote, `(`, etc.).
const BANNED = [
  { token: 'emerald-', regex: /(^|[^a-zA-Z])emerald-/g, replacement: 'accent-' },
  { token: 'slate-', regex: /(^|[^a-zA-Z])slate-/g, replacement: 'charcoal-' },
  { token: 'gray-', regex: /(^|[^a-zA-Z])gray-/g, replacement: 'charcoal-' },
  { token: 'stone-', regex: /(^|[^a-zA-Z])stone-/g, replacement: 'sand- ou charcoal-' },
  { token: 'violet-', regex: /(^|[^a-zA-Z])violet-/g, replacement: 'primary- ou accent-' },
  { token: 'indigo-', regex: /(^|[^a-zA-Z])indigo-/g, replacement: 'primary- ou accent-' },
  { token: 'font-jakarta', regex: /(^|[^a-zA-Z])font-jakarta/g, replacement: 'font-heading' },
]

// Exclusions — fichiers où la règle ne s'applique pas.
const EXCLUDED_PATHS = [
  // Admin dashboard utilise stricte palette gray/blue par convention (UI tooling).
  ['src', 'app', 'admin'].join(sep),
  ['src', 'components', 'admin'].join(sep),
  // Auto-generated SEO pages from CSV (read-only)
  ['src', 'app', '(public)', 'admin'].join(sep),
]

function isExcluded(filepath) {
  return EXCLUDED_PATHS.some((p) => filepath.includes(p))
}

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next' || entry === '.git') continue
      walk(full, acc)
    } else if (/\.(tsx?|jsx?)$/.test(entry)) {
      acc.push(full)
    }
  }
  return acc
}

const root = process.cwd()
const srcDir = join(root, 'src')
const files = walk(srcDir)

const violations = []
for (const file of files) {
  if (isExcluded(file)) continue
  const content = readFileSync(file, 'utf8')
  const lines = content.split('\n')
  lines.forEach((line, i) => {
    for (const { token, regex, replacement } of BANNED) {
      regex.lastIndex = 0
      if (regex.test(line)) {
        violations.push({
          file: file.replace(root + sep, ''),
          line: i + 1,
          token,
          replacement,
          snippet: line.trim().slice(0, 120),
        })
      }
    }
  })
}

if (jsonOut) {
  console.log(JSON.stringify({ violations, count: violations.length }, null, 2))
} else if (violations.length === 0) {
  console.log('✅ Aucun token banni détecté.')
} else {
  console.log(`❌ ${violations.length} violation(s) de tokens DESIGN.md :\n`)
  for (const v of violations.slice(0, 50)) {
    console.log(`  ${v.file}:${v.line}`)
    console.log(`    Banni: ${v.token}  →  Utiliser: ${v.replacement}`)
    console.log(`    ${v.snippet}\n`)
  }
  if (violations.length > 50) {
    console.log(`  ... et ${violations.length - 50} autre(s).`)
  }
}

if (strict && violations.length > 0) {
  process.exit(1)
}
