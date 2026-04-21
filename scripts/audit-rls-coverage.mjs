#!/usr/bin/env node
/**
 * scripts/audit-rls-coverage.mjs
 * -------------------------------
 * Audit statique de la couverture RLS à partir des fichiers de migration.
 *
 * Parse tous les `.sql` dans supabase/migrations/ et détermine, pour chaque
 * table vivante (créée sans être droppée) :
 *   - RLS activé ou non
 *   - Présence d'au moins une policy
 *
 * Sortie humaine (tty) ou JSON (pour CI). Exit code 1 si des gaps sont
 * détectés, 0 sinon.
 *
 * Usage :
 *   node scripts/audit-rls-coverage.mjs            # human readable
 *   node scripts/audit-rls-coverage.mjs --json     # JSON output
 *   node scripts/audit-rls-coverage.mjs --strict   # exit 1 si gaps
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const MIG_DIR = 'supabase/migrations'
const args = new Set(process.argv.slice(2))
const jsonOut = args.has('--json')
const strict = args.has('--strict')

// Artefacts regex à ignorer (pas des vraies tables)
const FALSE_POSITIVES = new Set(['if', 'like', 'public', 'exists', 'not'])

const files = readdirSync(MIG_DIR)
  .filter((f) => f.endsWith('.sql'))
  .sort()

const createdTables = new Set()
const enabledRls = new Set()
const forcedRls = new Set()
const hasPolicy = new Set()
const droppedTables = new Set()

const createRe =
  /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?["']?([a-zA-Z_][a-zA-Z0-9_]*)["']?/gi
const enableRe =
  /ALTER\s+TABLE\s+(?:public\.)?["']?([a-zA-Z_][a-zA-Z0-9_]*)["']?\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/gi
const forceRe =
  /ALTER\s+TABLE\s+(?:public\.)?["']?([a-zA-Z_][a-zA-Z0-9_]*)["']?\s+FORCE\s+ROW\s+LEVEL\s+SECURITY/gi
const policyRe =
  /CREATE\s+POLICY\s+(?:"[^"]+"|\w+)\s+ON\s+(?:public\.)?["']?([a-zA-Z_][a-zA-Z0-9_]*)["']?/gi
const dropRe =
  /DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?(?:public\.)?["']?([a-zA-Z_][a-zA-Z0-9_]*)["']?/gi
// Annotation machine-readable dans les migrations qui traitent les tables
// via DO blocks dynamiques (EXECUTE format('%I')). Le parser ne voit pas le
// nom de table dans le SQL généré ; on s'appuie sur le commentaire.
// Format : `-- @rls-covered: table1, table2, table3`
const rlsCoveredRe = /--\s*@rls-covered:\s*([a-zA-Z0-9_,\s]+)/gi

for (const f of files) {
  const src = readFileSync(join(MIG_DIR, f), 'utf8')
  for (const m of src.matchAll(createRe)) createdTables.add(m[1].toLowerCase())
  for (const m of src.matchAll(enableRe)) enabledRls.add(m[1].toLowerCase())
  for (const m of src.matchAll(forceRe)) forcedRls.add(m[1].toLowerCase())
  for (const m of src.matchAll(policyRe)) hasPolicy.add(m[1].toLowerCase())
  for (const m of src.matchAll(dropRe)) droppedTables.add(m[1].toLowerCase())
  // Annotations @rls-covered : les tables listées sont considérées couvertes
  // (ENABLE RLS + policy appropriée) par la migration, même si absentes du
  // pattern regex ALTER/CREATE POLICY classique.
  for (const m of src.matchAll(rlsCoveredRe)) {
    const tables = m[1]
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
    for (const t of tables) {
      enabledRls.add(t)
      hasPolicy.add(t)
    }
  }
}

const alive = [...createdTables]
  .filter((t) => !droppedTables.has(t))
  .filter((t) => !FALSE_POSITIVES.has(t))
  .sort()

const withoutRls = alive.filter((t) => !enabledRls.has(t))
const withRlsNoPolicy = alive.filter((t) => enabledRls.has(t) && !hasPolicy.has(t))

const report = {
  scanned_files: files.length,
  live_tables: alive.length,
  rls_enabled: alive.filter((t) => enabledRls.has(t)).length,
  rls_forced: alive.filter((t) => forcedRls.has(t)).length,
  with_policy: alive.filter((t) => hasPolicy.has(t)).length,
  gaps: {
    without_rls: withoutRls,
    with_rls_no_policy: withRlsNoPolicy,
  },
  generated_at: new Date().toISOString(),
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  const pct = ((report.rls_enabled / report.live_tables) * 100).toFixed(1)
  console.log(`\n📋 RLS Coverage Audit — ${report.generated_at}\n`)
  console.log(`  Migrations scannées : ${report.scanned_files}`)
  console.log(`  Tables vivantes     : ${report.live_tables}`)
  console.log(`  RLS activé          : ${report.rls_enabled} (${pct}%)`)
  console.log(`  RLS forcé           : ${report.rls_forced}`)
  console.log(`  Avec policy         : ${report.with_policy}`)

  if (withoutRls.length === 0 && withRlsNoPolicy.length === 0) {
    console.log(`\n  ✅ Aucun gap détecté.\n`)
  } else {
    if (withoutRls.length > 0) {
      console.log(`\n  ❌ Sans RLS (${withoutRls.length}) :`)
      withoutRls.forEach((t) => console.log(`     - ${t}`))
    }
    if (withRlsNoPolicy.length > 0) {
      console.log(`\n  ⚠️  RLS activé mais zéro policy (${withRlsNoPolicy.length}) :`)
      withRlsNoPolicy.forEach((t) => console.log(`     - ${t}`))
    }
    console.log('')
  }
}

const hasGaps = withoutRls.length > 0 || withRlsNoPolicy.length > 0
if (strict && hasGaps) {
  process.exit(1)
}
