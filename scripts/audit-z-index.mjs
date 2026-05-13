#!/usr/bin/env node
/**
 * scripts/audit-z-index.mjs
 * ------------------------
 * Bloque l'usage de `z-[N]` arbitraires hors-tokens dans `src/`.
 *
 * Système de z-index documenté (cf. `tailwind.config.js` → `theme.extend.zIndex`).
 * Tokens autorisés :
 *   z-base, z-raised, z-dropdown, z-sticky, z-header, z-nav-mobile,
 *   z-modal, z-sticky-cta, z-over-modal, z-lightbox, z-toast, z-skip-link
 *
 * Pourquoi :
 *   Audit 2026-05-13 — 15 valeurs ad-hoc (z-[51], z-[54], z-[55], z-[56],
 *   z-[60], z-[100], z-[1000], z-[9999], z-[10000]) avec collisions et
 *   sans hiérarchie claire. Une régression silencieuse ferait re-diverger.
 *
 * Allowlist (calibrations stacking précises, conservées) :
 *   - DevisBottomSheet z-[55]/z-[56] : sheet > MobileBottomNav
 *   - ScrollNudge z-[54]            : sous le sheet
 *   - MapTooltip z-[10000]          : transient absolute over map
 *   - GeographicMap z-[1000]        : badge map info
 *
 * Usage :
 *   node scripts/audit-z-index.mjs            # human
 *   node scripts/audit-z-index.mjs --strict   # exit 1 si nouveau ad-hoc
 *   node scripts/audit-z-index.mjs --json     # JSON
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, sep } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

// Allowlist file:value — toute nouvelle violation hors de cette liste = erreur.
const ALLOWLIST = new Set([
  'src/components/conversion/DevisBottomSheet.tsx:z-[55]',
  'src/components/conversion/DevisBottomSheet.tsx:z-[56]',
  'src/components/conversion/ScrollNudge.tsx:z-[54]',
  'src/components/maps/MapTooltip.tsx:z-[10000]',
  'src/components/maps/GeographicMap.tsx:z-[1000]',
])

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next' || entry === '.git') continue
      walk(full, acc)
    } else if (/\.tsx$/.test(entry)) {
      acc.push(full)
    }
  }
  return acc
}

const root = process.cwd()
const files = walk(join(root, 'src'))
const Z_RE = /\bz-\[[0-9]+\]/g

const violations = []
for (const file of files) {
  const content = readFileSync(file, 'utf8')
  const relFile = file.replace(root + sep, '').split(sep).join('/')
  for (const line of content.split('\n')) {
    const matches = line.matchAll(Z_RE)
    for (const m of matches) {
      const key = `${relFile}:${m[0]}`
      if (ALLOWLIST.has(key)) continue
      violations.push({ file: relFile, token: m[0], snippet: line.trim().slice(0, 120) })
    }
  }
}

if (jsonOut) {
  console.log(JSON.stringify({ violations, count: violations.length }, null, 2))
} else if (violations.length === 0) {
  console.log('✅ Aucun z-[N] arbitraire hors allowlist.')
} else {
  console.log(`❌ ${violations.length} z-[N] arbitraire(s) hors tokens DESIGN.md :\n`)
  for (const v of violations.slice(0, 30)) {
    console.log(`  ${v.file}`)
    console.log(`    ${v.token}  →  Utiliser un token (z-modal, z-over-modal, z-lightbox, ...)`)
    console.log(`    ${v.snippet}\n`)
  }
  if (violations.length > 30) console.log(`  ... et ${violations.length - 30} autre(s).`)
}

if (strict && violations.length > 0) process.exit(1)
