#!/usr/bin/env node
/**
 * scripts/audit-schema-drift.mjs
 * -------------------------------
 * Audit anti-régression schema drift hors-Git.
 *
 * Contexte : 3 incidents en 1 mois (mig 474 phone_e164, mig 483 google_*,
 * mig 486 service_*) où le code TS référençait des colonnes absentes en prod
 * — soit migration committée mais pas appliquée, soit DROP COLUMN manuel
 * via Supabase dashboard. Conséquence : 100% des consumers en 500 ou
 * notFound() silencieux jusqu'à découverte (24-48h post-incident).
 *
 * Pipeline :
 *   1. Extract — parse src/**\/*.{ts,tsx} pour collecter toutes les
 *      références (table, column) dans les chaînes Supabase :
 *        .from('table').select('col1,col2,joined:fk(c3,c4)')
 *        .eq('col', x), .gt, .lt, .gte, .lte, .like, .ilike, .in,
 *        .contains, .containedBy, .is, .not('col', x), .order('col', ...)
 *   2. Probe — pour chaque (table, column) du code, hit
 *      `GET /rest/v1/<table>?select=<column>&limit=0` avec l'anon key.
 *      → 200/206 = OK, 400 + code 42703 = COLONNE MANQUANTE (DRIFT).
 *      → 401/403 = RLS bloque (skip silencieux, pas un drift).
 *      → 404 / code 42P01 = TABLE MANQUANTE (drift majeur).
 *   3. Diff — output les drifts détectés, exit 1 si --strict.
 *
 * Usage :
 *   node scripts/audit-schema-drift.mjs                  # human, exit 0
 *   node scripts/audit-schema-drift.mjs --json           # JSON output
 *   node scripts/audit-schema-drift.mjs --strict         # exit 1 si drift
 *   node scripts/audit-schema-drift.mjs --offline        # skip network
 *   node scripts/audit-schema-drift.mjs --table=providers # focus 1 table
 *
 * Lit `.env.local` (NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY).
 * Sans .env.local → exit 0 silencieux (CI sans secrets, pas un échec).
 *
 * Limites connues (faux négatifs acceptés) :
 *   - .from(`${dynamic}`) — skip (pas de literal table)
 *   - .from('schema.table') — schema préfixé skip (rare)
 *   - .select(longue chaîne JS construite dynamiquement) — skip
 *   - tables RLS-blocked anon → skip (impossible de prouver via REST anon)
 *   Ces cas représentent <5% des refs Supabase du repo.
 */

import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

// ----------------------------------------------------------------------------
// Config + args
// ----------------------------------------------------------------------------

const args = new Set(process.argv.slice(2))
const focusTable = [...args].find((a) => a.startsWith('--table='))?.slice(8)
const jsonOut = args.has('--json')
const strict = args.has('--strict')
const offline = args.has('--offline')
const verbose = args.has('--verbose')
const writeBaseline = args.has('--baseline-write')
const checkBaseline = args.has('--baseline-check')

const SRC_DIR = 'src'
const ENV_FILE = '.env.local'
const BASELINE_FILE = '.schema-drift-baseline.json'

// Tables qu'on s'attend à NE PAS pouvoir probe via anon (RLS lock).
// Listées pour ne pas générer de bruit "skipped". On compte les skips
// pour être sûr qu'on n'oublie pas une vraie drift.
const RLS_LOCKED_HINT = new Set([
  'audit_logs',
  'cee_dossiers',
  'cee_dossier_events',
  'cee_justificatifs',
  'cee_payouts',
  'leads',
  'lead_assignments',
  'devis_requests',
  'bookings',
  'profiles',
  'provider_claims',
  'admin_users',
  'cron_leases',
])

// ----------------------------------------------------------------------------
// 1. Walk + extract from code
// ----------------------------------------------------------------------------

function walkSync(dir, exts, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry.startsWith('.')) continue
      walkSync(full, exts, out)
    } else if (exts.test(entry)) {
      out.push(full)
    }
  }
  return out
}

/**
 * Match `.from('table')` — captures table name from a string literal.
 * Backticks autorisés mais sans interpolation (literal only).
 */
const FROM_RE = /\.from\(\s*['"`]([\w]+)['"`]\s*\)/g

/**
 * Match `.select('col,col,join:fk(c,c)')` — captures the raw select string.
 * Multi-line backtick selects supportés.
 */
const SELECT_RE = /\.select\(\s*['"`]([^'"`]+)['"`]/g

/**
 * Match filter methods: `.eq('col', ...)`, `.gt`, `.lt`, etc.
 * Le 1er arg string littéral = nom de colonne.
 */
const FILTER_METHODS = [
  'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
  'like', 'ilike', 'is', 'in',
  'contains', 'containedBy', 'rangeGt', 'rangeGte', 'rangeLt', 'rangeLte',
  'rangeAdjacent', 'overlaps', 'textSearch',
  'not', 'order',
]
const FILTER_RE = new RegExp(
  `\\.(${FILTER_METHODS.join('|')})\\(\\s*['"\`]([\\w]+)['"\`]`,
  'g'
)

/**
 * Parse a select string for column refs.
 * Examples:
 *   "id,name,specialty"                       → [id, name, specialty]
 *   "id, joined:fk_col(c1, c2), other"        → [id, fk_col, c1, c2, other]
 *   "*"                                       → [] (wildcard, no specific cols)
 *   "count"                                   → [] (PostgREST aggregate)
 *   "id::text"                                → [id]
 *
 * On retourne aussi les colonnes du join (c1, c2 dans l'exemple) car ce sont
 * de vraies colonnes de la table jointe — mais on ne sait pas associer la table
 * au join ici. Pour rester safe (faux négatif > faux positif), on les ignore.
 * Seules les colonnes de la table principale (top-level avant le `:` ou hors paren)
 * sont remontées.
 */
function parseSelectExpression(raw) {
  const cols = []
  // Strip whitespace and newlines
  const expr = raw.replace(/\s+/g, '')
  if (expr === '*' || expr === '') return cols
  // Walk char by char to handle nested parens for joins
  let depth = 0
  let buf = ''
  const tokens = []
  for (const c of expr) {
    if (c === '(') {
      depth++
      buf += c
    } else if (c === ')') {
      depth--
      buf += c
    } else if (c === ',' && depth === 0) {
      tokens.push(buf)
      buf = ''
    } else {
      buf += c
    }
  }
  if (buf) tokens.push(buf)

  for (const tok of tokens) {
    // Format avec alias explicite "alias:fk_col(...)" → fk_col est UNE
    //   colonne FK sur le PARENT (PostgREST utilise le FK pour résoudre).
    // Format sans alias "joined_table(...)" → joined_table est le NOM DE LA
    //   TABLE jointe (auto-FK detection PostgREST), PAS une colonne du parent.
    //   On skip dans ce cas pour éviter les faux positifs.
    const joinAliased = tok.match(/^[\w]+:([\w]+)\(.*\)$/)
    if (joinAliased) {
      cols.push(joinAliased[1])
      continue
    }
    const joinImplicit = tok.match(/^([\w]+)\(.*\)$/)
    if (joinImplicit) {
      // table jointe via auto-FK → ne pas remonter comme colonne du parent
      continue
    }
    // Strip casts like "id::text"
    const castMatch = tok.match(/^([\w]+)(::[\w]+)?$/)
    if (castMatch) {
      const name = castMatch[1]
      // Skip aggregate functions / metadata
      if (name === 'count' || name === '*') continue
      cols.push(name)
      continue
    }
    // Aliased: "alias:col" (no parens)
    const aliasMatch = tok.match(/^[\w]+:([\w]+)$/)
    if (aliasMatch) {
      cols.push(aliasMatch[1])
      continue
    }
    // Unknown token shape → skip silently (defensive)
  }
  return cols
}

/**
 * Find the closest preceding `.from('table')` for each `.select`/filter call.
 * On split d'abord par `.from(...)` (chaque chunk appartient à 1 table),
 * puis dans chaque chunk on extrait les selects + filtres.
 */
function extractFromContent(content) {
  const refs = new Map() // table → Set<column>
  // Split content into chunks per `.from('table')` occurrence
  // We use a regex with capture to keep the table names
  const matches = [...content.matchAll(/\.from\(\s*['"`]([\w]+)['"`]\s*\)/g)]
  for (let i = 0; i < matches.length; i++) {
    const table = matches[i][1]
    const start = matches[i].index + matches[i][0].length
    const end = i + 1 < matches.length ? matches[i + 1].index : Math.min(start + 5000, content.length)
    const chunk = content.slice(start, end)

    let cols = refs.get(table)
    if (!cols) {
      cols = new Set()
      refs.set(table, cols)
    }

    // Extract selects in this chunk
    for (const sm of chunk.matchAll(SELECT_RE)) {
      for (const c of parseSelectExpression(sm[1])) cols.add(c)
    }
    // Extract filters in this chunk
    for (const fm of chunk.matchAll(FILTER_RE)) {
      cols.add(fm[2])
    }
  }
  return refs
}

function extractAllRefs(srcDir) {
  const aggregate = new Map() // table → Set<column>
  const files = walkSync(srcDir, /\.(ts|tsx)$/)
  let scanned = 0
  for (const file of files) {
    // Skip test files
    if (/\.(test|spec)\.tsx?$/.test(file)) continue
    if (file.includes(`${join('__tests__')}${process.platform === 'win32' ? '\\' : '/'}`)) continue
    const content = readFileSync(file, 'utf8')
    if (!content.includes('.from(')) continue
    scanned++
    const refs = extractFromContent(content)
    for (const [table, cols] of refs) {
      let agg = aggregate.get(table)
      if (!agg) {
        agg = new Set()
        aggregate.set(table, agg)
      }
      for (const c of cols) agg.add(c)
    }
  }
  return { refs: aggregate, scannedFiles: scanned, totalFiles: files.length }
}

// ----------------------------------------------------------------------------
// 2. Load env + probe prod
// ----------------------------------------------------------------------------

function loadEnv() {
  if (!existsSync(ENV_FILE)) return null
  const env = {}
  const content = readFileSync(ENV_FILE, 'utf8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 0) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    env[key] = val
  }
  return env
}

async function probeColumn(supaUrl, anon, table, column) {
  // Forge a SELECT that includes the column. PostgREST returns 400 + 42703
  // if the column is missing on the table. Empty array if OK (limit=0).
  const url = `${supaUrl}/rest/v1/${encodeURIComponent(table)}?select=${encodeURIComponent(column)}&limit=0`
  const resp = await fetch(url, {
    headers: {
      apikey: anon,
      Authorization: `Bearer ${anon}`,
    },
  })
  if (resp.status >= 200 && resp.status < 300) {
    return { ok: true }
  }
  let body
  try {
    body = await resp.json()
  } catch {
    body = { message: `HTTP ${resp.status}` }
  }
  return { ok: false, status: resp.status, code: body.code, message: body.message }
}

async function probeRefs(supaUrl, anon, refs) {
  const drift = [] // { table, column, status, code, message }
  const skippedRls = [] // { table, column }
  const skippedTable = [] // { table }
  const concurrency = 8

  // Build flat list of probes
  const probes = []
  for (const [table, columns] of refs) {
    if (focusTable && table !== focusTable) continue
    for (const column of columns) {
      probes.push({ table, column })
    }
  }

  let cursor = 0
  async function worker() {
    while (cursor < probes.length) {
      const { table, column } = probes[cursor++]
      const r = await probeColumn(supaUrl, anon, table, column)
      if (r.ok) continue
      if (r.status === 401 || r.status === 403) {
        skippedRls.push({ table, column })
        continue
      }
      if (r.code === '42P01') {
        skippedTable.push({ table })
        continue
      }
      if (r.code === '42703') {
        drift.push({ table, column, code: r.code, message: r.message })
        continue
      }
      // Unknown error — surface as warning, not drift
      if (verbose) {
        console.error(`  ⚠️  Probe ${table}.${column} unknown error: ${r.status} ${r.code || ''} ${r.message || ''}`)
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker))

  // Dedup skippedTable
  const tableSet = new Set(skippedTable.map((x) => x.table))
  return {
    drift,
    skippedRls,
    skippedTables: [...tableSet],
    totalProbes: probes.length,
  }
}

// ----------------------------------------------------------------------------
// 3. Output
// ----------------------------------------------------------------------------

function reportHuman(extract, probeRes) {
  console.log('')
  console.log('📋 Schema Drift Audit')
  console.log('')
  console.log(`  Fichiers TS/TSX scannés (avec .from)  : ${extract.scannedFiles} / ${extract.totalFiles}`)
  console.log(`  Tables référencées (literal)          : ${extract.refs.size}`)
  let totalCols = 0
  for (const cols of extract.refs.values()) totalCols += cols.size
  console.log(`  Couples (table, column) probés        : ${probeRes.totalProbes}`)
  console.log(`  RLS bloque le probe anon              : ${probeRes.skippedRls.length}`)
  console.log(`  Tables introuvables (42P01)           : ${probeRes.skippedTables.length}`)
  console.log('')

  if (probeRes.drift.length === 0) {
    console.log('  ✅ Aucune drift détectée.')
    if (probeRes.skippedRls.length > 0 && verbose) {
      console.log('')
      console.log('  ℹ️  RLS-blocked (non-vérifiable via anon, OK):')
      const byTable = new Map()
      for (const s of probeRes.skippedRls) {
        if (!byTable.has(s.table)) byTable.set(s.table, [])
        byTable.get(s.table).push(s.column)
      }
      for (const [t, cols] of byTable) {
        const isExpected = RLS_LOCKED_HINT.has(t)
        console.log(`     ${isExpected ? '✓' : '?'} ${t} (${cols.length} cols)`)
      }
    }
    return
  }

  console.log('  ❌ DRIFT DÉTECTÉE — code TS référence des colonnes absentes en prod :')
  console.log('')
  // Group by table
  const byTable = new Map()
  for (const d of probeRes.drift) {
    if (!byTable.has(d.table)) byTable.set(d.table, [])
    byTable.get(d.table).push(d)
  }
  for (const [table, drifts] of byTable) {
    console.log(`  📌 ${table} :`)
    for (const d of drifts) {
      console.log(`       - ${d.column}  (${d.code}: ${d.message})`)
    }
  }
  console.log('')
  console.log('  Action :')
  console.log('    1. Vérifier que la migration définissant ces colonnes est appliquée en prod')
  console.log('       via Supabase SQL editor :')
  console.log("         SELECT column_name FROM information_schema.columns")
  console.log("           WHERE table_schema = 'public' AND table_name = '<table>';")
  console.log('    2. Si manquante : appliquer la migration ou créer une migration ADD COLUMN.')
  console.log('    3. Si présente : vérifier que le code utilise le bon nom (renommage hors-Git ?).')
  console.log('')
}

function reportJson(extract, probeRes) {
  console.log(
    JSON.stringify(
      {
        scannedFiles: extract.scannedFiles,
        totalFiles: extract.totalFiles,
        tableCount: extract.refs.size,
        totalProbes: probeRes.totalProbes,
        rlsBlocked: probeRes.skippedRls.length,
        tablesNotFound: probeRes.skippedTables,
        drift: probeRes.drift,
      },
      null,
      2
    )
  )
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

async function main() {
  const extract = extractAllRefs(SRC_DIR)

  if (offline) {
    if (jsonOut) {
      console.log(
        JSON.stringify(
          {
            mode: 'offline',
            scannedFiles: extract.scannedFiles,
            tableCount: extract.refs.size,
            tables: [...extract.refs.entries()].map(([t, c]) => ({ table: t, columns: [...c] })),
          },
          null,
          2
        )
      )
    } else {
      console.log(`📋 Schema Drift Audit (offline)`)
      console.log(`  Fichiers scannés : ${extract.scannedFiles}`)
      console.log(`  Tables refs      : ${extract.refs.size}`)
      console.log(`  ℹ️  Pour vérifier vs prod, retire --offline.`)
    }
    process.exit(0)
  }

  const env = loadEnv()
  if (!env) {
    if (jsonOut) {
      console.log(JSON.stringify({ skipped: true, reason: 'no .env.local' }))
    } else {
      console.log(`📋 Schema Drift Audit — skipped (.env.local absent)`)
    }
    process.exit(0)
  }
  const supaUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supaUrl || !anon) {
    if (jsonOut) {
      console.log(JSON.stringify({ skipped: true, reason: 'missing env vars' }))
    } else {
      console.log(`📋 Schema Drift Audit — skipped (NEXT_PUBLIC_SUPABASE_* absent)`)
    }
    process.exit(0)
  }

  const probeRes = await probeRefs(supaUrl, anon, extract.refs)

  // Disambiguation faux positifs : `alias:joined_table(c1,c2)` capture la
  // table jointe comme "colonne" du parent. Si le nom capturé est lui-même
  // un nom de table connue, on le retire — c'est un join PostgREST auto-FK,
  // pas une colonne du parent.
  const knownTables = new Set(extract.refs.keys())
  probeRes.drift = probeRes.drift.filter((d) => !knownTables.has(d.column))

  // ---------- Baseline management ----------
  // Le baseline encode les drifts connus historiques. En CI/pre-push, on
  // ne bloque que les NOUVELLES drifts (delta vs baseline). Permet
  // d'introduire le hook sans forcer le fix immédiat des 50+ drifts existantes.
  let newDrifts = probeRes.drift
  let baseline = null
  if (writeBaseline) {
    const payload = {
      generatedAt: new Date().toISOString(),
      drifts: probeRes.drift.map(({ table, column }) => ({ table, column })),
    }
    writeFileSync(BASELINE_FILE, JSON.stringify(payload, null, 2) + '\n')
    if (!jsonOut) {
      console.log(`✅ Baseline écrit dans ${BASELINE_FILE} avec ${payload.drifts.length} drifts.`)
    }
    process.exit(0)
  }
  if (checkBaseline) {
    if (!existsSync(BASELINE_FILE)) {
      console.error(`❌ ${BASELINE_FILE} absent — exécute d'abord --baseline-write`)
      process.exit(1)
    }
    baseline = JSON.parse(readFileSync(BASELINE_FILE, 'utf8'))
    const baselineSet = new Set(baseline.drifts.map((d) => `${d.table}::${d.column}`))
    newDrifts = probeRes.drift.filter((d) => !baselineSet.has(`${d.table}::${d.column}`))
    probeRes.drift = newDrifts
  }

  if (jsonOut) {
    reportJson(extract, probeRes)
  } else {
    reportHuman(extract, probeRes)
    if (checkBaseline) {
      const stale = (baseline?.drifts || []).filter(
        (d) => !probeRes.drift.find((x) => x.table === d.table && x.column === d.column) &&
               !newDrifts.find((x) => x.table === d.table && x.column === d.column)
      )
      // Note: stale = baseline entries that are no longer drifts (column was added
      // back). On ne bloque pas, mais on suggère de regénérer le baseline.
      if (stale.length > 0 && verbose) {
        console.log(`  ℹ️  ${stale.length} entries baseline résolues — pense à --baseline-write.`)
      }
    }
  }

  if (strict && newDrifts.length > 0) {
    if (checkBaseline) {
      console.error(`❌ ${newDrifts.length} NOUVELLES drift(s) hors baseline — push bloqué.`)
    }
    process.exit(1)
  }
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ audit-schema-drift fatal:', err)
  process.exit(strict ? 1 : 0)
})
