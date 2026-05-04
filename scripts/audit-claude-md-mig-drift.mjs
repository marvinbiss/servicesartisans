#!/usr/bin/env node
/**
 * scripts/audit-claude-md-mig-drift.mjs
 * --------------------------------------
 * DoD du backlog item P3-claude-md-mig-drift (Tier 50).
 *
 * Source : memory `servicesartisans-mig306-status-2026-04-28`.
 * Drift détecté : CLAUDE.md listait 7 colonnes comme « SUPPRIMEES »
 * (`hourly_rate_min`, `hourly_rate_max`, `emergency_available`,
 *  `certifications`, `insurance`, `payment_methods`, `languages`,
 *  `avatar_url`) alors que `supabase/migrations/306_provider_public_page_fields.sql`
 * les ré-ajoute via ADD COLUMN. Provoque des reviews de code basés sur
 * une fausse mental model = perte de temps + reject de PR légitimes.
 *
 * Vérifie qu'aucune colonne listée comme « SUPPRIMEES » dans CLAUDE.md
 * n'est ré-ajoutée par une migration postérieure (sauf migration de DROP
 * explicite finale).
 *
 * Algorithme :
 *   1. Parse la liste « SUPPRIMEES » de CLAUDE.md (bloc dédié).
 *   2. Parse toutes les migrations supabase/migrations/*.sql triées par
 *      numéro pour reconstituer l'état logique de chaque colonne.
 *   3. État final : si une colonne listée SUPPRIMEES a un ADD COLUMN
 *      après son dernier DROP, c'est un drift = échec.
 *
 * Usage :
 *   node scripts/audit-claude-md-mig-drift.mjs --strict
 *   node scripts/audit-claude-md-mig-drift.mjs --json
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const CLAUDE_MD = join(ROOT, 'CLAUDE.md')
const MIG_DIR = join(ROOT, 'supabase', 'migrations')

if (!existsSync(CLAUDE_MD)) {
  console.error('Audit CLAUDE.md drift : CLAUDE.md absent')
  if (strict) process.exit(1)
  process.exit(0)
}
if (!existsSync(MIG_DIR)) {
  console.error('Audit CLAUDE.md drift : supabase/migrations absent')
  if (strict) process.exit(1)
  process.exit(0)
}

const claudeSrc = readFileSync(CLAUDE_MD, 'utf8')

// Parse le bloc « SUPPRIMEES » : on cherche la ligne qui suit
// "Colonnes SUPPRIMEES de providers" et on extrait tous les tokens
// enclos en backticks (la liste peut être en single-backtick par token
// ou en single-block backtick-list).
function parseSupprimees(src) {
  const headerRe = /Colonnes SUPPRIMEES de providers[^\n]*\n+([^\n]+)/m
  const m = src.match(headerRe)
  if (!m) return []
  const line = m[1]
  // Tous les tokens entre backticks
  const tokens = []
  const tokenRe = /`([^`\n]+)`/g
  let t
  while ((t = tokenRe.exec(line)) !== null) {
    // Si le token contient des virgules, c'est une liste à splitter
    for (const part of t[1].split(',')) {
      const cleaned = part.trim().replace(/^`|`$/g, '')
      if (/^[a-z_][a-z0-9_]*$/i.test(cleaned)) tokens.push(cleaned)
    }
  }
  return tokens
}

const supprimees = parseSupprimees(claudeSrc)

// Parse migrations triées par préfixe numérique
const migFiles = readdirSync(MIG_DIR)
  .filter((f) => /^\d+_.*\.sql$/.test(f))
  .sort((a, b) => {
    const ai = Number(a.match(/^(\d+)/)?.[1] ?? 0)
    const bi = Number(b.match(/^(\d+)/)?.[1] ?? 0)
    return ai - bi
  })

// État logique par colonne : 'added' | 'dropped' | undefined
const state = new Map()
const trace = new Map() // col -> [{mig, op}]

for (const file of migFiles) {
  const fullPath = join(MIG_DIR, file)
  const content = readFileSync(fullPath, 'utf8')
  // Match "ALTER TABLE providers ADD COLUMN [IF NOT EXISTS] foo …"
  const addRe =
    /ALTER\s+TABLE\s+(?:public\.)?providers\s+ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/gi
  const dropRe =
    /ALTER\s+TABLE\s+(?:public\.)?providers\s+DROP\s+COLUMN\s+(?:IF\s+EXISTS\s+)?(\w+)/gi
  let m
  while ((m = addRe.exec(content)) !== null) {
    const col = m[1].toLowerCase()
    state.set(col, 'added')
    if (!trace.has(col)) trace.set(col, [])
    trace.get(col).push({ mig: file, op: 'ADD' })
  }
  while ((m = dropRe.exec(content)) !== null) {
    const col = m[1].toLowerCase()
    state.set(col, 'dropped')
    if (!trace.has(col)) trace.set(col, [])
    trace.get(col).push({ mig: file, op: 'DROP' })
  }
}

// Pour chaque colonne déclarée SUPPRIMEES dans CLAUDE.md, l'état logique
// final doit être 'dropped' OU absent. Si 'added' = drift.
const drifts = []
for (const col of supprimees) {
  const lower = col.toLowerCase()
  const finalState = state.get(lower)
  if (finalState === 'added') {
    drifts.push({
      column: col,
      claude_md_says: 'SUPPRIMEE',
      mig_state: 'added',
      trace: trace.get(lower) ?? [],
    })
  }
}

const ok = drifts.length === 0

const report = {
  backlog_item: 'P3-claude-md-mig-drift',
  source_memory: 'servicesartisans-mig306-status-2026-04-28',
  total_columns_supprimees: supprimees.length,
  total_migrations_scanned: migFiles.length,
  drift_count: drifts.length,
  drifts,
  ok,
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 CLAUDE.md ↔ Migrations Drift Audit (DoD P3-claude-md-mig-drift)\n')
  console.log(`  Migrations scannées   : ${migFiles.length}`)
  console.log(`  Colonnes SUPPRIMEES   : ${supprimees.length}`)
  console.log(`  Drifts détectés       : ${drifts.length}`)
  if (drifts.length > 0) {
    console.log('\n  ❌ Colonnes listées SUPPRIMEES mais ré-ajoutées par une migration :')
    for (const d of drifts) {
      console.log(`    - ${d.column}`)
      for (const t of d.trace) {
        console.log(`        ${t.op.padEnd(5)} ← ${t.mig}`)
      }
    }
    console.log(
      '\n  → Action : soit retirer la colonne de la liste SUPPRIMEES dans CLAUDE.md,'
    )
    console.log(
      '              soit ajouter une migration finale DROP COLUMN postérieure.\n'
    )
  } else {
    console.log('\n  ✅ Aucun drift CLAUDE.md ↔ migrations.\n')
  }
}

if (strict && !ok) process.exit(1)
