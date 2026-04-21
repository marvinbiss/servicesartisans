#!/usr/bin/env node
// Guardrail : refuse un commit de migration si le préfixe numérique est déjà utilisé.
// Exclut les collisions historiques documentées dans supabase/migrations/README.md.

import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const MIG_DIR = join(process.cwd(), 'supabase', 'migrations')
const KNOWN_COLLISIONS = new Set(['330', '365'])

const files = readdirSync(MIG_DIR).filter((f) => f.endsWith('.sql'))
const byPrefix = new Map()

for (const f of files) {
  const match = /^(\d+)_/.exec(f)
  if (!match) continue
  const prefix = match[1]
  if (!byPrefix.has(prefix)) byPrefix.set(prefix, [])
  byPrefix.get(prefix).push(f)
}

let failed = 0
for (const [prefix, list] of byPrefix) {
  if (list.length > 1 && !KNOWN_COLLISIONS.has(prefix)) {
    console.error(`Collision migration ${prefix} :`, list.join(', '))
    failed++
  }
}

if (failed > 0) {
  console.error(`\n${failed} collision(s) non documentée(s). Renommer avec un préfixe libre.`)
  process.exit(1)
}

const prefixes = [...byPrefix.keys()].map(Number).sort((a, b) => a - b)
const next = (prefixes[prefixes.length - 1] || 0) + 1
console.log(`OK. ${files.length} migrations, prochain préfixe libre: ${next}`)
