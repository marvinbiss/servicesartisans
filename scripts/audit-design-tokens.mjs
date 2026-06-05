#!/usr/bin/env node
/**
 * audit-design-tokens.mjs — anti-régression design premium (wave A 2026-06-05)
 * ---------------------------------------------------------------------------
 * DESIGN.md bannit la palette Tailwind `gray-*` (gris froid) au profit des
 * tokens warm : texte → `charcoal-*`, surfaces/bords → `sand-*`.
 * Le 2026-06-05, 2501 usages ont été codemodés (scripts/codemod-gray-to-warm.mjs).
 * Ce hook bloque toute ré-introduction dans les classes utilitaires.
 *
 * Étendu le 2026-06-05 (close trou wave A) aux palettes froides sœurs
 * `slate/zinc/neutral/stone` — sinon la palette bannie se réintroduit
 * par synonyme. 17 occurrences résiduelles fixées au passage.
 *
 * Mapping de référence (shade-aware) :
 *   text/placeholder/decoration/caret-{gray|slate|zinc|neutral|stone}-X  → *-charcoal-X
 *   bg/border/divide/ring/from/via/to-…-X  → X<=300 ? *-sand-X : *-charcoal-X
 */
import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const UTILS =
  '(?:text|bg|border|divide|ring|placeholder|from|via|to|decoration|caret|outline|fill|stroke|accent)'
const GRAY_RE = new RegExp(`\\b(?:[a-z-]+:)*${UTILS}-(?:gray|slate|zinc|neutral|stone)-\\d{2,3}\\b`, 'g')

// Wave C-bis (2026-06-06) : blue-* banni aussi (DESIGN.md « never cold blues »).
// 716 occ migrées par scripts/codemod-blue-to-brand.mjs. Exceptions sémantiques
// ci-dessous (mêmes skips que le codemod).
const BLUE_RE = new RegExp(`\\b(?:[a-z-]+:)*${UTILS}-blue-\\d{2,3}\\b`, 'g')
const BLUE_CTX_SKIP =
  /maprimerenov|bar[èe]me|MPR|[Bb]leu\b|facebook|linkedin|twitter|youtube|instagram|VerifiedBadge|trust-score|escrow/i
const BLUE_LINE_SKIP = /(from|to|via)-blue-\d/

const SCAN_DIRS = ['src', '__tests__']

// Thème dark admin volontairement slate (page non publique, hors DESIGN.md).
const WHITELIST = new Set(['src/app/admin/connexion/page.tsx'])
// Bleu sémantique légitime : badge vérifié (exception DESIGN.md), seuils ANAH
// (couleur officielle barème Bleu), palette catégorielle métiers (plombier = eau).
const BLUE_WHITELIST = new Set([
  'src/components/reviews/VerifiedBadge.tsx',
  'src/lib/simulateur/anah-thresholds.ts',
  'src/lib/data/france.ts',
  'src/lib/data/france-light.ts',
  'src/app/(public)/urgence/[service]/[ville]/page.tsx',
])

function listFiles() {
  const out = execSync(`git ls-files ${SCAN_DIRS.join(' ')} -- '*.ts' '*.tsx' '*.jsx' '*.js'`, {
    encoding: 'utf8',
    cwd: process.cwd(),
  })
  return out.split('\n').filter((f) => f.trim().length > 0)
}

const violations = []
for (const file of listFiles()) {
  const norm = file.replace(/\\/g, '/')
  if (WHITELIST.has(norm)) continue
  let src
  try {
    src = readFileSync(file, 'utf8')
  } catch {
    continue
  }
  let m
  while ((m = GRAY_RE.exec(src)) !== null) {
    const line = src.slice(0, m.index).split(/\r?\n/).length
    violations.push({ file, line, cls: m[0] })
  }
  if (!BLUE_WHITELIST.has(norm)) {
    const lines = src.split(/\r?\n/)
    lines.forEach((lineText, i) => {
      if (!BLUE_RE.test(lineText)) return
      BLUE_RE.lastIndex = 0
      if (BLUE_LINE_SKIP.test(lineText)) return
      const ctx =
        (lines[i - 2] || '') + (lines[i - 1] || '') + lineText + (lines[i + 1] || '') + (lines[i + 2] || '')
      if (BLUE_CTX_SKIP.test(ctx)) return
      let bm
      while ((bm = BLUE_RE.exec(lineText)) !== null) {
        violations.push({ file, line: i + 1, cls: bm[0] })
      }
      BLUE_RE.lastIndex = 0
    })
  }
}

const strict = process.argv.includes('--strict')

if (violations.length === 0) {
  console.log(
    '✅ audit-design-tokens : aucune classe gray/slate/zinc/neutral/stone/blue (palettes bannies).'
  )
  process.exit(0)
}

console.error(
  `\n❌ ${violations.length} classe(s) palette froide (gray/slate/zinc/neutral/stone — bannies par DESIGN.md) :\n`
)
for (const v of violations.slice(0, 30)) {
  console.error(`  ${v.file}:${v.line} — ${v.cls}`)
}
if (violations.length > 30) console.error(`  … +${violations.length - 30} autres`)
console.error(
  '\n  Fix : texte → charcoal-*, surfaces/bords clairs (≤300) → sand-*,\n' +
    '  foncés (≥400) → charcoal-*. Réf : scripts/codemod-gray-to-warm.mjs\n' +
    '  + docs/design-premium/SYNTHESIS-2026-06-05.md\n'
)

process.exit(strict ? 1 : 0)
