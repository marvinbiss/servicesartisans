#!/usr/bin/env node
// Adds data-speakable="true" attribute to the FIRST <h1> of each remaining
// (public) page.tsx that doesn't already have it. Idempotent: skips files
// where any <h1 already carries data-speakable.
//
// Usage:
//   node scripts/add-data-speakable-guides.mjs            # dry-run
//   node scripts/add-data-speakable-guides.mjs --write    # apply

import { readFileSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { globSync } from 'glob'

const APPLY = process.argv.includes('--write')
const ROOT = process.cwd()

const files = globSync('src/app/(public)/**/page.tsx', { cwd: ROOT, absolute: true })

let touched = 0
let skipped = 0
let already = 0

for (const file of files) {
  const original = readFileSync(file, 'utf8')
  let out = original
  let count = 0
  // Patch every <h1 ...> that isn't already carrying data-speakable.
  // Walk via a regex that matches `<h1` followed by anything up to the first `>`.
  out = out.replace(/<h1((?:\s[^>]*)?)>/g, (match, attrs) => {
    if (attrs.includes('data-speakable')) return match
    count += 1
    if (attrs.length === 0) return '<h1 data-speakable="true">'
    return `<h1 data-speakable="true"${attrs}>`
  })
  if (count === 0) {
    if (original.includes('<h1')) skipped += 1
    else already += 1
    continue
  }
  if (APPLY) writeFileSync(file, out)
  touched += 1
  console.log(`PATCH ${relative(ROOT, file)} (+${count} h1)`)
}

console.log(
  `\nSummary: touched=${touched} already=${already} skipped=${skipped} total=${files.length}`,
)
console.log(APPLY ? 'WROTE changes.' : 'DRY RUN — re-run with --write to apply.')
