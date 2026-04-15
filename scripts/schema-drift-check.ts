#!/usr/bin/env tsx
/**
 * Supabase Schema Drift Detector
 *
 * Parses supabase/migrations/*.sql to build the current schema,
 * then scans src/**\/*.{ts,tsx} for Supabase queries and flags columns
 * or tables referenced in code that do not exist in the schema.
 *
 * Usage: npx tsx scripts/schema-drift-check.ts
 * Exit 0 = clean, Exit 1 = drift detected.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const MIGRATIONS_DIR = join(ROOT, 'supabase', 'migrations')
const SRC_DIR = join(ROOT, 'src')
const IGNORE_FILE = join(ROOT, 'scripts', '.schema-drift-ignore')

type Schema = Map<string, Set<string>> // table -> columns
const VIEWS = new Set<string>() // views: exist but column parsing skipped

interface IgnoreList {
  tables: Set<string>
  columns: Map<string, Set<string>>
}

function loadIgnoreList(): IgnoreList {
  const empty: IgnoreList = { tables: new Set(), columns: new Map() }
  if (!existsSync(IGNORE_FILE)) return empty
  try {
    const raw = JSON.parse(readFileSync(IGNORE_FILE, 'utf8')) as {
      tables?: string[]
      columns?: Record<string, string[]>
    }
    const tables = new Set(raw.tables ?? [])
    const columns = new Map<string, Set<string>>()
    for (const [t, cols] of Object.entries(raw.columns ?? {})) {
      columns.set(t, new Set(cols))
    }
    return { tables, columns }
  } catch (err) {
    console.error(`Warning: could not parse ${IGNORE_FILE}:`, (err as Error).message)
    return empty
  }
}

// ---------- Migration parser ----------

function parseMigrations(): Schema {
  const schema: Schema = new Map()
  let files: string[] = []
  try {
    files = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort()
  } catch {
    console.error(`No migrations dir at ${MIGRATIONS_DIR}`)
    process.exit(1)
  }

  for (const f of files) {
    const sql = readFileSync(join(MIGRATIONS_DIR, f), 'utf8')
    applyMigration(sql, schema)
  }
  return schema
}

function stripSqlComments(sql: string): string {
  return sql.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '')
}

function applyMigration(rawSql: string, schema: Schema) {
  const sql = stripSqlComments(rawSql)

  // CREATE TABLE [IF NOT EXISTS] [public.]<name> ( ... )
  const createRe =
    /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+(?:public\.)?["']?(\w+)["']?\s*\(([\s\S]*?)\n\s*\);/gi
  let m: RegExpExecArray | null
  while ((m = createRe.exec(sql))) {
    const table = m[1]
    const body = m[2]
    const cols = extractColumnsFromCreateBody(body)
    schema.set(table, new Set(cols))
  }

  // ALTER TABLE <t> ADD COLUMN a ..., ADD COLUMN b ..., ... ;
  // Captures the table and the entire action-list up to the next ';',
  // then extracts every ADD COLUMN clause inside.
  const alterAddRe =
    /ALTER\s+TABLE\s+(?:IF\s+EXISTS\s+)?(?:ONLY\s+)?(?:public\.)?["']?(\w+)["']?\s+([\s\S]*?);/gi
  while ((m = alterAddRe.exec(sql))) {
    const [, table, actions] = m
    const addRe = /ADD\s+COLUMN(?:\s+IF\s+NOT\s+EXISTS)?\s+["']?(\w+)["']?/gi
    let am: RegExpExecArray | null
    while ((am = addRe.exec(actions))) {
      if (!schema.has(table)) schema.set(table, new Set())
      schema.get(table)!.add(am[1])
    }
  }

  // ALTER TABLE ... DROP COLUMN
  const dropRe =
    /ALTER\s+TABLE\s+(?:ONLY\s+)?(?:public\.)?["']?(\w+)["']?\s+DROP\s+COLUMN(?:\s+IF\s+EXISTS)?\s+["']?(\w+)["']?/gi
  while ((m = dropRe.exec(sql))) {
    const [, table, col] = m
    schema.get(table)?.delete(col)
  }

  // ALTER TABLE ... RENAME COLUMN old TO new
  const renameRe =
    /ALTER\s+TABLE\s+(?:ONLY\s+)?(?:public\.)?["']?(\w+)["']?\s+RENAME\s+COLUMN\s+["']?(\w+)["']?\s+TO\s+["']?(\w+)["']?/gi
  while ((m = renameRe.exec(sql))) {
    const [, table, oldCol, newCol] = m
    const s = schema.get(table)
    if (s?.has(oldCol)) {
      s.delete(oldCol)
      s.add(newCol)
    }
  }

  // DROP TABLE
  const dropTableRe = /DROP\s+TABLE(?:\s+IF\s+EXISTS)?\s+(?:public\.)?["']?(\w+)["']?/gi
  while ((m = dropTableRe.exec(sql))) {
    schema.delete(m[1])
  }

  // CREATE [MATERIALIZED] VIEW — treat as tables (scanner needs "exists", not strict column check)
  const viewRe =
    /CREATE\s+(?:OR\s+REPLACE\s+)?(?:MATERIALIZED\s+)?VIEW(?:\s+IF\s+NOT\s+EXISTS)?\s+(?:public\.)?["']?(\w+)["']?/gi
  while ((m = viewRe.exec(sql))) {
    if (!schema.has(m[1])) schema.set(m[1], new Set())
    VIEWS.add(m[1])
  }
}

function extractColumnsFromCreateBody(body: string): string[] {
  const cols: string[] = []
  const lines = body.split(/,(?![^(]*\))/).map((l) => l.trim())
  for (const line of lines) {
    if (!line) continue
    if (/^(CONSTRAINT|PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CHECK|EXCLUDE|LIKE)\b/i.test(line))
      continue
    const nameMatch = line.match(/^["']?(\w+)["']?\s+\S/)
    if (nameMatch) cols.push(nameMatch[1])
  }
  return cols
}

// ---------- Code scanner ----------

interface Reference {
  file: string
  line: number
  table: string
  columns: string[]
}

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[] = []
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const e of entries) {
    const p = join(dir, e)
    const st = statSync(p)
    if (st.isDirectory()) {
      if (['node_modules', '.next', 'dist', 'build', '.git'].includes(e)) continue
      walk(p, out)
    } else if (/\.(ts|tsx)$/.test(e)) {
      out.push(p)
    }
  }
  return out
}

function scanFile(file: string): Reference[] {
  const src = readFileSync(file, 'utf8')
  const lines = src.split('\n')
  const refs: Reference[] = []

  const fromRe = /\.from\(\s*['"`](\w+)['"`]\s*\)/g
  let m: RegExpExecArray | null
  while ((m = fromRe.exec(src))) {
    const table = m[1]
    const idx = m.index
    const lineNum = src.slice(0, idx).split('\n').length
    // Chain ends at the next .from() or at 2000 chars — whichever comes first.
    // This avoids bleed across query boundaries (nextFrom hits the '.from(' of the next query).
    const after = src.slice(idx + m[0].length)
    const nextFromIdx = after.search(/\.from\(\s*['"`]/)
    // Chains are contiguous in formatted code. Any blank line breaks the chain.
    const blankLineIdx = after.search(/\n\s*\n/)
    // Also stop at a new statement start (const/let/var/return/if/for/while/}) at line start.
    const newStmtMatch = after.search(
      /\n\s*(?:const|let|var|return|if|for|while|async|function|\}|\w+Query\s*[=.])/
    )
    const hardCap = 2000
    const candidates = [nextFromIdx, blankLineIdx, newStmtMatch, hardCap].filter((n) => n > 0)
    const limit = Math.min(...candidates, hardCap)
    const chain = after.slice(0, limit)
    // Skip RPC calls — they reference functions, not tables/columns
    if (/\.rpc\(/.test(chain)) continue
    const cols = extractColumnsFromChain(chain)
    if (table && cols.length >= 0) {
      refs.push({ file, line: lineNum, table, columns: cols })
    }
  }
  return refs
}

function extractColumnsFromChain(chain: string): string[] {
  const cols = new Set<string>()

  // .select('a, b, c') — only static strings (skip template literals)
  const selectRe = /\.select\(\s*['"]([^'"]+)['"]/g
  let m: RegExpExecArray | null
  while ((m = selectRe.exec(chain))) {
    parseSelectString(m[1]).forEach((c) => cols.add(c))
  }

  // .eq('col', ...), .gt, .lt, .gte, .lte, .ilike, .like, .neq, .is, .not
  const filterRe =
    /\.(?:eq|neq|gt|gte|lt|lte|ilike|like|is|in|not|contains|containedBy|range\w*|match)\(\s*['"](\w+)['"]/g
  while ((m = filterRe.exec(chain))) {
    cols.add(m[1])
  }

  // .order('col', ...)
  const orderRe = /\.order\(\s*['"](\w+)['"]/g
  while ((m = orderRe.exec(chain))) {
    cols.add(m[1])
  }

  // .insert({...}) / .insert([{...}, ...]) / .update({...})
  const mutationRe = /\.(?:insert|update|upsert)\(\s*(\[?\s*\{)/g
  while ((m = mutationRe.exec(chain))) {
    const startIdx = m.index + m[0].length - 1 // position of first '{'
    const objBody = extractBalancedObject(chain, startIdx)
    if (objBody) {
      for (const key of extractObjectKeys(objBody)) cols.add(key)
    }
  }

  return [...cols]
}

// Extract balanced {...} starting at startIdx (chain[startIdx] === '{').
// Returns the inner body (without outer braces), or null if unbalanced.
function extractBalancedObject(chain: string, startIdx: number): string | null {
  if (chain[startIdx] !== '{') return null
  let depth = 0
  let inStr: string | null = null
  let prev = ''
  for (let i = startIdx; i < chain.length; i++) {
    const ch = chain[i]
    if (inStr) {
      if (ch === inStr && prev !== '\\') inStr = null
    } else if (ch === '"' || ch === "'" || ch === '`') {
      inStr = ch
    } else if (ch === '{') {
      depth++
    } else if (ch === '}') {
      depth--
      if (depth === 0) return chain.slice(startIdx + 1, i)
    }
    prev = ch
  }
  return null
}

// Extract top-level identifier keys from an object body. Conservative:
// only `identifier:` keys at depth 0 of the body, skipping string/computed keys.
function extractObjectKeys(body: string): string[] {
  const keys: string[] = []
  let depth = 0
  let inStr: string | null = null
  let prev = ''
  let i = 0
  let atStart = true // true when at start of body or right after a top-level comma

  while (i < body.length) {
    const ch = body[i]
    if (inStr) {
      if (ch === inStr && prev !== '\\') inStr = null
      prev = ch
      i++
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inStr = ch
      atStart = false
      prev = ch
      i++
      continue
    }
    if (ch === '{' || ch === '[' || ch === '(') {
      depth++
      atStart = false
      prev = ch
      i++
      continue
    }
    if (ch === '}' || ch === ']' || ch === ')') {
      depth--
      prev = ch
      i++
      continue
    }
    if (depth === 0 && ch === ',') {
      atStart = true
      prev = ch
      i++
      continue
    }
    if (depth === 0 && atStart && /\s/.test(ch)) {
      i++
      continue
    }
    if (depth === 0 && atStart) {
      // Try to match `identifier:` (allowing spaces)
      const rest = body.slice(i)
      const km = rest.match(/^(\w+)\s*:/)
      if (km) {
        keys.push(km[1])
        i += km[0].length
        atStart = false
        prev = ':'
        continue
      }
      // Not a simple identifier key — skip to next top-level comma
      atStart = false
    }
    prev = ch
    i++
  }
  return keys
}

function parseSelectString(sel: string): string[] {
  if (sel.trim() === '*') return []
  const cols: string[] = []
  let depth = 0
  let buf = ''
  for (const ch of sel) {
    if (ch === '(') depth++
    else if (ch === ')') depth--
    else if (ch === ',' && depth === 0) {
      if (buf.trim()) cols.push(buf.trim())
      buf = ''
      continue
    }
    buf += ch
  }
  if (buf.trim()) cols.push(buf.trim())

  return cols
    .map((c) => {
      // Strip Supabase join hints: "lead:devis_requests!inner(...)" or "!left"
      const stripped = c.replace(/!(?:inner|left|right|full)\b/g, '')
      // "alias:foreign_table(col)" or "alias:fk_column(col)" -> second capture.
      // If the second capture resembles a table name AND col list is in parens,
      // it's likely a join alias, not a column; return '' to skip.
      const fkMatch = stripped.match(/^(\w+)\s*:\s*(\w+)\s*\(/)
      if (fkMatch) {
        // Heuristic: plural table names (ending in 's') or *_contacts/_campaigns
        // style are join aliases, not columns. Skip.
        const second = fkMatch[2]
        if (/s$/.test(second) && !/_id$/.test(second)) return ''
        return second
      }
      // "providers(name)" -> skip (nested select, not a column)
      if (/^\w+\s*\(/.test(stripped)) return ''
      // "col::type" or "col as alias"
      return stripped.split(/[\s:]/)[0].trim()
    })
    .filter((c) => c && /^\w+$/.test(c))
}

// ---------- Main ----------

function main() {
  const schema = parseMigrations()
  const ignore = loadIgnoreList()
  console.log(`Schema parsed: ${schema.size} tables\n`)

  const files = walk(SRC_DIR)
  const issues: Array<{
    severity: 'HIGH' | 'MED' | 'LOW'
    file: string
    line: number
    msg: string
  }> = []

  for (const f of files) {
    const refs = scanFile(f)
    for (const r of refs) {
      if (ignore.tables.has(r.table)) continue
      const tableCols = schema.get(r.table)
      const rel = relative(ROOT, r.file).replace(/\\/g, '/')
      if (!tableCols) {
        issues.push({
          severity: 'LOW',
          file: rel,
          line: r.line,
          msg: `Table '${r.table}' does not exist in any migration`,
        })
        continue
      }
      if (VIEWS.has(r.table)) continue // views: can't parse columns from SELECT, skip
      const whitelistedCols = ignore.columns.get(r.table)
      for (const col of r.columns) {
        if (whitelistedCols?.has(col)) continue
        if (!tableCols.has(col)) {
          issues.push({
            severity: 'HIGH',
            file: rel,
            line: r.line,
            msg: `Table '${r.table}': column '${col}' does not exist`,
          })
        }
      }
    }
  }

  if (issues.length === 0) {
    console.log('✓ No schema drift detected')
    process.exit(0)
  }

  console.log(`DRIFT DETECTED — ${issues.length} issue(s):\n`)
  const order = { HIGH: 0, MED: 1, LOW: 2 }
  issues.sort((a, b) => order[a.severity] - order[b.severity])
  for (const i of issues.slice(0, 50)) {
    console.log(`[${i.severity}] ${i.file}:${i.line}\n  ${i.msg}\n`)
  }
  if (issues.length > 50) console.log(`... and ${issues.length - 50} more`)
  process.exit(1)
}

main()
