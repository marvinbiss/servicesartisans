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
 *   1. Fetch ONE TIME l'OpenAPI spec PostgREST avec service_role (RLS-bypass).
 *      → Carte complète Map<table, Set<column>> de la prod actuelle.
 *      Si pas de service_role → fallback probe-by-column (anon, plus lent
 *      + faux positifs RLS).
 *   2. Walk `src/**\/*.{ts,tsx}` pour collecter les couples (table, column)
 *      depuis `.from('t').select('cols')` + filtres `.eq/.gt/.like/.in/...`
 *   3. Diff : code (table, column) ∉ prod[table] = drift.
 *   4. Vs baseline `.schema-drift-baseline.json` → bloque uniquement les
 *      NOUVELLES drifts.
 *
 * Modes :
 *   --baseline-write : génère/régénère le baseline initial
 *   --baseline-check : compare vs baseline (mode pre-push)
 *   --strict         : exit 1 sur drift
 *   --offline        : skip network (utile en CI sans secrets)
 *   --json           : output JSON
 *   --table=X        : focus 1 table
 *   --verbose        : detailed RLS/skip info
 *
 * Lit `.env.local` (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY ou
 * NEXT_PUBLIC_SUPABASE_ANON_KEY). Sans .env.local → exit 0 silencieux.
 *
 * Limites connues (faux négatifs acceptés <5%) :
 *   - .from(`${dynamic}`) — skip (literal table only)
 *   - .from('schema.table') — schema préfixé skip (rare)
 *   - .select(longue chaîne JS construite dynamiquement) — skip
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

const SELECT_RE = /\.select\(\s*['"`]([^'"`]+)['"`]/g
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
// `.insert(`, `.update(`, `.upsert(` — payload columns extraction.
// Catches the bug where mig 452/453 added DB columns but the insert payload
// in src/app/api/simulateur/submit/route.ts referenced them while prod DB
// hadn't been migrated. SELECT/filter regexes alone don't see this.
const MUTATION_RE = /\.(insert|update|upsert)\(\s*(\[\s*)?\{/g
// Variable-passed payload : `.insert(insertPayload)` — needs back-resolve.
const MUTATION_VAR_RE = /\.(insert|update|upsert)\(\s*([A-Za-z_][\w]*)\s*[,)]/g
// Identifier-passed select : `.select(PROVIDER_DETAIL_SELECT)` — needs
// back-resolve vers `const NAME = [...].join(',')`. Sans ça, le pattern le
// plus repandu (centralized SELECT constants) slip through. Regression
// 2026-05-10 commit 591665911 (business_name/first_name/is_center fabriques)
// aurait ete bloque par cette resolution.
const SELECT_VAR_RE = /\.select\(\s*([A-Za-z_][\w]*)\s*\)/g
// JS reserved / common type names to exclude from extracted keys.
const RESERVED_KEYS = new Set([
  'string', 'number', 'boolean', 'null', 'undefined', 'true', 'false',
  'as', 'const', 'let', 'var', 'new', 'function', 'return', 'if', 'else',
  'for', 'while', 'switch', 'case', 'default', 'this', 'typeof', 'instanceof',
])

function parseSelectExpression(raw) {
  const cols = []
  const expr = raw.replace(/\s+/g, '')
  if (expr === '*' || expr === '') return cols
  let depth = 0
  let buf = ''
  const tokens = []
  for (const c of expr) {
    if (c === '(') { depth++; buf += c }
    else if (c === ')') { depth--; buf += c }
    else if (c === ',' && depth === 0) { tokens.push(buf); buf = '' }
    else { buf += c }
  }
  if (buf) tokens.push(buf)

  for (const tok of tokens) {
    const joinAliased = tok.match(/^[\w]+:([\w]+)\(.*\)$/)
    if (joinAliased) { cols.push(joinAliased[1]); continue }
    const joinImplicit = tok.match(/^([\w]+)\(.*\)$/)
    if (joinImplicit) continue
    const castMatch = tok.match(/^([\w]+)(::[\w]+)?$/)
    if (castMatch) {
      const name = castMatch[1]
      if (name === 'count' || name === '*') continue
      cols.push(name)
      continue
    }
    const aliasMatch = tok.match(/^[\w]+:([\w]+)$/)
    if (aliasMatch) { cols.push(aliasMatch[1]); continue }
  }
  return cols
}

/**
 * Walks an object literal starting AT the position right after the opening
 * `{` and returns its top-level property keys (identifier or string).
 * Skips nested braces, parens, brackets, strings, template literals, regex,
 * spread (`...x`), and computed keys (`[expr]:`).
 *
 * @param {string} text
 * @param {number} startAfterBrace  index of first char inside the `{`
 * @returns {{ keys: string[], end: number } | null}  null if unbalanced
 */
function extractObjectKeys(text, startAfterBrace) {
  const keys = []
  let i = startAfterBrace
  let depth = 1   // depth of { / } only — paren/bracket tracked separately
  let paren = 0
  let bracket = 0
  let str = null  // active string delimiter or null
  let templateDepth = 0
  let expectKey = true

  while (i < text.length) {
    const c = text[i]
    const next = text[i + 1]

    // String state machine
    if (str) {
      if (c === '\\') { i += 2; continue }
      if (str === '`' && c === '$' && next === '{') {
        templateDepth++
        str = null
        i += 2
        continue
      }
      if (c === str) { str = null; i++; continue }
      i++
      continue
    }
    if (templateDepth > 0 && c === '}') {
      templateDepth--
      str = '`'
      i++
      continue
    }
    if (c === '/' && (next === '/' || next === '*')) {
      // line or block comment — skip
      if (next === '/') {
        const eol = text.indexOf('\n', i + 2)
        i = eol === -1 ? text.length : eol + 1
      } else {
        const close = text.indexOf('*/', i + 2)
        i = close === -1 ? text.length : close + 2
      }
      continue
    }
    if (c === '"' || c === "'" || c === '`') {
      // Could be a key (string) — capture if at top-level depth and expectKey
      if (depth === 1 && paren === 0 && bracket === 0 && expectKey) {
        const close = findStringEnd(text, i + 1, c)
        if (close > i) {
          const raw = text.slice(i + 1, close)
          // Find the colon after closing quote
          let j = close + 1
          while (j < text.length && /\s/.test(text[j])) j++
          if (text[j] === ':' && /^[\w]+$/.test(raw)) {
            keys.push(raw)
            expectKey = false
            i = j + 1
            continue
          }
          i = close + 1
          continue
        }
      }
      str = c
      i++
      continue
    }
    if (c === '{') { depth++; i++; expectKey = true; continue }
    if (c === '}') {
      depth--
      if (depth === 0) return { keys, end: i + 1 }
      i++
      continue
    }
    if (c === '(') { paren++; i++; continue }
    if (c === ')') { paren--; i++; continue }
    if (c === '[') { bracket++; i++; continue }
    if (c === ']') { bracket--; i++; continue }
    if (c === ',' && depth === 1 && paren === 0 && bracket === 0) {
      expectKey = true
      i++
      continue
    }
    // Identifier key (must be at top-level + expectKey + not preceded by `...`)
    if (depth === 1 && paren === 0 && bracket === 0 && expectKey && /[A-Za-z_$]/.test(c)) {
      // Skip spread operator
      if (text.slice(Math.max(0, i - 3), i) === '...') {
        // already consumed dots — find end of identifier and continue
        const m = text.slice(i).match(/^[\w$]+/)
        if (m) i += m[0].length
        else i++
        expectKey = false
        continue
      }
      const m = text.slice(i).match(/^[\w$]+/)
      if (m) {
        const ident = m[0]
        let j = i + ident.length
        while (j < text.length && /\s/.test(text[j])) j++
        // Match `key:` (regular) or `key,`/`key}` (shorthand)
        if (text[j] === ':') {
          if (/^[a-z_]/i.test(ident)) keys.push(ident)
          expectKey = false
          i = j + 1
          continue
        }
        if (text[j] === ',' || text[j] === '}') {
          if (/^[a-z_]/i.test(ident)) keys.push(ident)
          expectKey = false
          i = j
          continue
        }
        i = j
        continue
      }
    }
    i++
  }
  return null  // unbalanced
}

function findStringEnd(text, from, quote) {
  let i = from
  while (i < text.length) {
    const c = text[i]
    if (c === '\\') { i += 2; continue }
    if (c === quote) return i
    i++
  }
  return -1
}

/**
 * Resolve `const NAME = [...].join(',')` ou `const NAME = 'a,b,c'` declarations
 * in same-file scope. Returns array of column names. Recursive (cap depth 5)
 * pour gerer nested const refs comme PROVIDER_DETAIL_SELECT -> PROVIDER_LIST_SELECT.
 *
 * @param {string} content  Full file content
 * @param {string} name     Identifier to resolve
 * @param {number} depth    Recursion guard (max 5)
 * @returns {string[]}
 */
function resolveConstSelect(content, name, depth = 0, visited = new Set()) {
  if (depth > 5 || visited.has(name)) return []
  visited.add(name)

  // Pattern 1 : const NAME = [...].join(',')
  const arrayRe = new RegExp(
    `(?:^|\\W)(?:const|let|var)\\s+${name}\\s*(?::[^=\\n]+)?=\\s*\\[([\\s\\S]*?)\\]\\.join\\(`,
    'g'
  )
  const arrayMatch = arrayRe.exec(content)
  if (arrayMatch) {
    return parseArrayElements(arrayMatch[1], content, depth + 1, visited)
  }

  // Pattern 2 : const NAME = 'a,b,c'
  const strRe = new RegExp(
    `(?:^|\\W)(?:const|let|var)\\s+${name}\\s*(?::[^=\\n]+)?=\\s*['"\`]([^'"\`]+)['"\`]`,
    'g'
  )
  const strMatch = strRe.exec(content)
  if (strMatch) {
    return parseSelectExpression(strMatch[1])
  }

  return []
}

function parseArrayElements(arrayBody, content, depth, visited) {
  const cols = []
  // Strip line + block comments
  const stripped = arrayBody.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '')
  // Match string literals OR bare identifiers
  const elementRe = /(['"`])([^'"`]*)\1|([A-Za-z_][\w]*)/g
  let m
  while ((m = elementRe.exec(stripped)) !== null) {
    if (m[2] !== undefined) {
      // String literal — parse as select expression (handles comma-joined inline)
      for (const c of parseSelectExpression(m[2])) cols.push(c)
    } else if (m[3]) {
      const ident = m[3]
      if (RESERVED_KEYS.has(ident)) continue
      for (const c of resolveConstSelect(content, ident, depth, visited)) cols.push(c)
    }
  }
  return cols
}

function extractFromContent(content) {
  const refs = new Map()
  const matches = [...content.matchAll(/\.from\(\s*['"`]([\w]+)['"`]\s*\)/g)]
  for (let i = 0; i < matches.length; i++) {
    const table = matches[i][1]
    const start = matches[i].index + matches[i][0].length
    // Chunk-end : next `.from(` OR end-of-method-chain heuristic.
    // Pour limiter la mis-attribution, on prend jusqu'au prochain `.from(`
    // OU 4000 chars max (insert payloads peuvent être très grands).
    let end = i + 1 < matches.length ? matches[i + 1].index : content.length
    end = Math.min(end, start + 4000)
    const chunk = content.slice(start, end)

    let cols = refs.get(table)
    if (!cols) { cols = new Set(); refs.set(table, cols) }

    for (const sm of chunk.matchAll(SELECT_RE)) {
      for (const c of parseSelectExpression(sm[1])) cols.add(c)
    }
    // Identifier-passed select : `.select(PROVIDER_DETAIL_SELECT)` — resolve
    // depuis le full content (const declaration peut etre n'importe ou en amont).
    for (const sv of chunk.matchAll(SELECT_VAR_RE)) {
      const ident = sv[1]
      if (RESERVED_KEYS.has(ident)) continue
      for (const c of resolveConstSelect(content, ident)) cols.add(c)
    }
    for (const fm of chunk.matchAll(FILTER_RE)) {
      cols.add(fm[2])
    }
    // Mutation payloads (insert/update/upsert) — extract object literal keys.
    for (const mm of chunk.matchAll(MUTATION_RE)) {
      // mm.index is relative to `chunk`; `mm[0]` ends just past the `{`.
      const braceIdx = mm.index + mm[0].length
      const parsed = extractObjectKeys(chunk, braceIdx)
      if (parsed) {
        for (const k of parsed.keys) {
          if (!RESERVED_KEYS.has(k)) cols.add(k)
        }
      }
    }
    // Variable-passed mutation : `.insert(payload)` — back-resolve `const payload = { ... }`
    // in the SAME file (not just chunk — payload is often built earlier in the function).
    for (const mv of chunk.matchAll(MUTATION_VAR_RE)) {
      const varName = mv[2]
      // Skip arrays/spreads we can't follow
      if (RESERVED_KEYS.has(varName)) continue
      const declRe = new RegExp(`(?:^|\\W)(?:const|let|var)\\s+${varName}\\s*(?::[^=\\n]+)?=\\s*\\{`, 'g')
      const declMatch = declRe.exec(content)
      if (!declMatch) continue
      const braceIdx = declMatch.index + declMatch[0].length
      const parsed = extractObjectKeys(content, braceIdx)
      if (parsed) {
        for (const k of parsed.keys) {
          if (!RESERVED_KEYS.has(k)) cols.add(k)
        }
      }
    }
  }
  return refs
}

function extractAllRefs(srcDir) {
  const aggregate = new Map()
  const fileRefs = new Map() // table::col → [files]
  const files = walkSync(srcDir, /\.(ts|tsx)$/)
  let scanned = 0
  for (const file of files) {
    if (/\.(test|spec)\.tsx?$/.test(file)) continue
    if (file.includes(`__tests__`)) continue
    const content = readFileSync(file, 'utf8')
    if (!content.includes('.from(')) continue
    scanned++
    const refs = extractFromContent(content)
    for (const [table, cols] of refs) {
      let agg = aggregate.get(table)
      if (!agg) { agg = new Set(); aggregate.set(table, agg) }
      for (const c of cols) {
        agg.add(c)
        const key = `${table}::${c}`
        if (!fileRefs.has(key)) fileRefs.set(key, new Set())
        fileRefs.get(key).add(relative(srcDir, file))
      }
    }
  }
  return { refs: aggregate, fileRefs, scannedFiles: scanned, totalFiles: files.length }
}

// ----------------------------------------------------------------------------
// 2. Load env + fetch prod schema
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

async function fetchProdSchema(supaUrl, key) {
  const resp = await fetch(`${supaUrl}/rest/v1/`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/openapi+json',
    },
  })
  if (!resp.ok) {
    throw new Error(`OpenAPI fetch ${resp.status}`)
  }
  const oapi = await resp.json()
  const defs = oapi.definitions || oapi.components?.schemas || {}
  const schema = new Map() // table → Set<column>
  for (const [name, def] of Object.entries(defs)) {
    const props = def.properties || {}
    schema.set(name, new Set(Object.keys(props)))
  }
  return schema
}

// ----------------------------------------------------------------------------
// 3. Diff
// ----------------------------------------------------------------------------

function diffSchema(codeRefs, prodSchema) {
  const drift = []
  const missingTables = []
  for (const [table, cols] of codeRefs) {
    if (focusTable && table !== focusTable) continue
    const prodCols = prodSchema.get(table)
    if (!prodCols) {
      missingTables.push(table)
      continue
    }
    for (const col of cols) {
      if (!prodCols.has(col)) {
        drift.push({ table, column: col })
      }
    }
  }
  return { drift, missingTables }
}

// ----------------------------------------------------------------------------
// 4. Output
// ----------------------------------------------------------------------------

function reportHuman(extract, diffRes, prodSchema, source, baseline) {
  console.log('')
  console.log('📋 Schema Drift Audit')
  console.log('')
  console.log(`  Source schema prod                    : ${source}`)
  console.log(`  Tables prod                           : ${prodSchema.size}`)
  console.log(`  Fichiers TS/TSX scannés (avec .from)  : ${extract.scannedFiles} / ${extract.totalFiles}`)
  console.log(`  Tables référencées en code            : ${extract.refs.size}`)
  console.log(`  Tables introuvables en prod           : ${diffRes.missingTables.length}`)
  console.log('')

  if (diffRes.drift.length === 0 && diffRes.missingTables.length === 0) {
    console.log('  ✅ Aucune drift détectée.')
    return
  }

  if (diffRes.missingTables.length > 0 && verbose) {
    console.log('  ⚠️  Tables référencées mais absentes en prod :')
    for (const t of diffRes.missingTables) console.log(`       - ${t}`)
    console.log('')
  }

  if (diffRes.drift.length === 0) return

  console.log(`  ❌ ${diffRes.drift.length} drift(s) détectée(s) :`)
  console.log('')
  const byTable = new Map()
  for (const d of diffRes.drift) {
    if (!byTable.has(d.table)) byTable.set(d.table, [])
    byTable.get(d.table).push(d)
  }
  for (const [table, drifts] of byTable) {
    console.log(`  📌 ${table} :`)
    for (const d of drifts) {
      const files = extract.fileRefs.get(`${table}::${d.column}`)
      const sample = files && files.size > 0 ? [...files].slice(0, 2).join(', ') : '?'
      console.log(`       - ${d.column}  (réf : ${sample}${files && files.size > 2 ? `, +${files.size - 2}` : ''})`)
    }
  }
  console.log('')
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

async function main() {
  const extract = extractAllRefs(SRC_DIR)

  if (offline) {
    if (jsonOut) {
      console.log(JSON.stringify({ mode: 'offline', scannedFiles: extract.scannedFiles, tableCount: extract.refs.size }, null, 2))
    } else {
      console.log(`📋 Schema Drift Audit (offline)`)
      console.log(`  Fichiers scannés : ${extract.scannedFiles}`)
      console.log(`  Tables refs      : ${extract.refs.size}`)
    }
    process.exit(0)
  }

  const env = loadEnv()
  if (!env) {
    if (jsonOut) console.log(JSON.stringify({ skipped: true, reason: 'no .env.local' }))
    else console.log(`📋 Schema Drift Audit — skipped (.env.local absent)`)
    process.exit(0)
  }
  const supaUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const key = serviceKey || anonKey
  const source = serviceKey ? 'OpenAPI (service_role, RLS-bypass)' : 'OpenAPI (anon, RLS-filtered)'
  if (!supaUrl || !key) {
    if (jsonOut) console.log(JSON.stringify({ skipped: true, reason: 'missing env vars' }))
    else console.log(`📋 Schema Drift Audit — skipped (NEXT_PUBLIC_SUPABASE_* absent)`)
    process.exit(0)
  }

  let prodSchema
  try {
    prodSchema = await fetchProdSchema(supaUrl, key)
  } catch (err) {
    if (jsonOut) console.log(JSON.stringify({ skipped: true, reason: `fetch error: ${err.message}` }))
    else console.error(`📋 Schema Drift Audit — fetch failed: ${err.message}`)
    process.exit(strict ? 1 : 0)
  }

  const diffRes = diffSchema(extract.refs, prodSchema)

  // Disambiguation : `alias:joined_table(c1,c2)` capture la table jointe comme
  // colonne du parent. Si le nom matche un nom de table existant, on retire.
  const knownTables = new Set(prodSchema.keys())
  diffRes.drift = diffRes.drift.filter((d) => !knownTables.has(d.column))

  // ---------- Baseline management ----------
  let newDrifts = diffRes.drift
  let baseline = null
  if (writeBaseline) {
    const payload = {
      generatedAt: new Date().toISOString(),
      source,
      drifts: diffRes.drift.map(({ table, column }) => ({ table, column })),
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
    newDrifts = diffRes.drift.filter((d) => !baselineSet.has(`${d.table}::${d.column}`))
    diffRes.drift = newDrifts
  }

  if (jsonOut) {
    console.log(JSON.stringify({
      source,
      scannedFiles: extract.scannedFiles,
      tableCount: extract.refs.size,
      prodTables: prodSchema.size,
      drift: diffRes.drift,
      missingTables: diffRes.missingTables,
    }, null, 2))
  } else {
    reportHuman(extract, diffRes, prodSchema, source, baseline)
  }

  if (strict && newDrifts.length > 0) {
    if (checkBaseline) console.error(`❌ ${newDrifts.length} NOUVELLES drift(s) hors baseline — push bloqué.`)
    process.exit(1)
  }
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ audit-schema-drift fatal:', err)
  process.exit(strict ? 1 : 0)
})
