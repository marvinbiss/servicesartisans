#!/usr/bin/env node
// Adds `speakable: { @type: 'SpeakableSpecification', cssSelector: [...] }`
// inside every Article-typed JSON-LD object that doesn't already have it.
//
// Idempotent. Targets pages whose grep already shows a `@type: 'Article'` but
// no `SpeakableSpecification`.
//
// Usage:
//   node scripts/add-speakable-spec.mjs            # dry-run
//   node scripts/add-speakable-spec.mjs --write    # apply

import { readFileSync, writeFileSync } from 'node:fs'
import { relative } from 'node:path'

const APPLY = process.argv.includes('--write')
const ROOT = process.cwd()

const targets = [
  'src/app/(public)/statistiques-artisans-france/page.tsx',
  'src/app/(public)/rge/tarifs-audit-energetique/page.tsx',
  'src/app/(public)/rge/qualifications/page.tsx',
  'src/app/(public)/rge/qualifications/[slug]/page.tsx',
  'src/app/(public)/rge/fraude-rge-comment-verifier/page.tsx',
  'src/app/(public)/rge/comment-devenir-rge/page.tsx',
  'src/app/(public)/maprimerenov-cumulaison-cee/page.tsx',
  'src/app/(public)/leads-exclusifs-vs-partages/page.tsx',
  'src/app/(public)/guides/qualibat-qualipac-qualifelec-qui-choisir/page.tsx',
  'src/app/(public)/guides/pompe-a-chaleur-cee-maprimerenov-2026/page.tsx',
  'src/app/(public)/guides/maprimerenov-2026-criteres-rge/page.tsx',
  'src/app/(public)/guides/maprimerenov-2026/page.tsx',
  'src/app/(public)/guides/isolation-ite-iti-rge-aides-2026/page.tsx',
  'src/app/(public)/guides/cee-certificats-economies-energie-2026/page.tsx',
  'src/app/(public)/guides/aides-renovation-2026/page.tsx',
  'src/app/(public)/comparatif-primes-cee-2026/page.tsx',
  'src/app/(public)/comparaison/page.tsx',
  'src/app/(public)/cee/mandataire-vs-direct/page.tsx',
  'src/app/(public)/cee/guides/page.tsx',
  'src/app/(public)/cee/coup-de-pouce-2026/page.tsx',
  'src/app/(public)/barometre/page.tsx',
  'src/app/(public)/barometre/tarifs/page.tsx',
  'src/app/(public)/barometre/tarifs/[metier]/page.tsx',
  'src/app/(public)/barometre/rge/page.tsx',
  'src/app/(public)/barometre/regions/page.tsx',
  'src/app/(public)/barometre/regions/[region]/page.tsx',
]

const SPEAKABLE_BLOCK = `
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },`

let touched = 0
let already = 0
let skipped = []

for (const rel of targets) {
  const file = `${ROOT}/${rel}`
  let c
  try {
    c = readFileSync(file, 'utf8')
  } catch (e) {
    skipped.push([rel, 'read error'])
    continue
  }

  if (c.includes('SpeakableSpecification')) {
    already += 1
    continue
  }

  // Strategy: locate the line with `'@type': 'Article'` (single OR double-quoted)
  // and insert the speakable block on the next line at the same indent.
  // We target the FIRST Article occurrence per file.
  const articleRegex = /([ \t]+)(['"])@type\2\s*:\s*\2Article\2\s*,?\n/

  if (!articleRegex.test(c)) {
    skipped.push([rel, 'no @type: Article line found'])
    continue
  }

  const out = c.replace(articleRegex, (match, indent, quote) => {
    // Re-indent the speakable block to match the article object's inner indent
    const block = SPEAKABLE_BLOCK.replace(/\n {4}/g, `\n${indent}`)
    return match + block.trimStart() + '\n'
  })

  if (out === c) {
    skipped.push([rel, 'replacement no-op'])
    continue
  }

  if (APPLY) writeFileSync(file, out)
  touched += 1
  console.log(`PATCH ${rel}`)
}

console.log(
  `\nSummary: touched=${touched} already=${already} skipped=${skipped.length} total=${targets.length}`,
)
if (skipped.length) {
  console.log('Skipped:')
  skipped.forEach(([f, why]) => console.log(`  - ${f} (${why})`))
}
console.log(APPLY ? 'WROTE changes.' : 'DRY RUN — re-run with --write to apply.')
