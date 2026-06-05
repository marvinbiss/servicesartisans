#!/usr/bin/env node
/**
 * Codemod one-off (2026-06-05) — design premium wave A.
 * Remplace les classes Tailwind `gray-*` (palette bannie par DESIGN.md) par
 * les tokens warm : texte → charcoal, surfaces/bords clairs → sand,
 * surfaces/bords foncés → charcoal. Shade-aware pour préserver le contraste.
 *
 * Usage : node scripts/codemod-gray-to-warm.mjs [--dry]
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const DRY = process.argv.includes('--dry')
const ROOTS = ['src', '__tests__']
const EXT = /\.(tsx|ts|jsx|js|mdx)$/

// utilitaires "texte" : mapping 1:1 vers charcoal
const TEXT_UTILS = ['text', 'placeholder', 'decoration', 'caret']
// utilitaires "surface/bord" : clair (<=300) → sand, foncé (>=400) → charcoal
const SURFACE_UTILS = ['bg', 'border', 'divide', 'ring', 'from', 'via', 'to', 'outline', 'fill', 'stroke', 'accent']

const SHADES = '(50|100|200|300|400|500|600|700|800|900|950)'

const rules = []
for (const u of TEXT_UTILS) {
  rules.push([new RegExp(`\\b${u}-gray-${SHADES}`, 'g'), (m, s) => `${u}-charcoal-${s}`])
}
for (const u of SURFACE_UTILS) {
  rules.push([
    new RegExp(`\\b${u}-gray-${SHADES}`, 'g'),
    (m, s) => `${u}-${Number(s) <= 300 ? 'sand' : 'charcoal'}-${s}`,
  ])
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next' || name.startsWith('.')) continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) yield* walk(p)
    else if (EXT.test(name)) yield p
  }
}

let filesChanged = 0
let totalRepl = 0
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const before = readFileSync(file, 'utf8')
    let after = before
    for (const [re, fn] of rules) after = after.replace(re, fn)
    if (after !== before) {
      const n = (before.match(/\bgray-\d+/g) || []).length - (after.match(/\bgray-\d+/g) || []).length
      filesChanged++
      totalRepl += n
      if (!DRY) writeFileSync(file, after)
      console.log(`${DRY ? '[dry] ' : ''}${file} — ${n} remplacements`)
    }
  }
}
console.log(`\n${filesChanged} fichiers, ${totalRepl} remplacements${DRY ? ' (dry-run)' : ''}`)
