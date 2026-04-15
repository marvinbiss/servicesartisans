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
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const MIGRATIONS_DIR = join(ROOT, 'supabase', 'migrations')
const SRC_DIR = join(ROOT, 'src')

type Schema = Map<string, Set<string>> // table -> columns

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

  // ALTER TABLE ... ADD COLUMN
  const addRe =
    /ALTER\s+TABLE\s+(?:ONLY\s+)?(?:public\.)?["']?(\w+)["']?\s+ADD\s+COLUMN(?:\s+IF\s+NOT\s+EXISTS)?\s+["']?(\w+)["']?/gi
  while ((m = addRe.exec(sql))) {
    const [, table, col] = m
    if (!schema.has(table)) schema.set(table, new Set())
    schema.get(table)!.add(col)
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
    const hardCap = 2000
    const limit = nextFromIdx === -1 ? hardCap : Math.min(nextFromIdx, hardCap)
    const chain = after.slice(0, limit)
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

  // .eq('col', ...), .gt, .lt, .gte, .lte, .ilike, .like, .neq, .is
  const filterRe =
    /\.(?:eq|neq|gt|gte|lt|lte|ilike|like|is|in|contains|containedBy|range\w*|match)\(\s*['"](\w+)['"]/g
  while ((m = filterRe.exec(chain))) {
    cols.add(m[1])
  }

  // .order('col', ...)
  const orderRe = /\.order\(\s*['"](\w+)['"]/g
  while ((m = orderRe.exec(chain))) {
    cols.add(m[1])
  }

  return [...cols]
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
      // "provider:provider_id(name)" -> "provider_id"
      const fkMatch = c.match(/^(\w+)\s*:\s*(\w+)\s*\(/)
      if (fkMatch) return fkMatch[2]
      // "providers(name)" -> skip (nested select, not a column)
      if (/^\w+\s*\(/.test(c)) return ''
      // "col::type" or "col as alias"
      return c.split(/[\s:]/)[0].trim()
    })
    .filter((c) => c && /^\w+$/.test(c))
}

// ---------- Main ----------

function main() {
  const schema = parseMigrations()
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
      for (const col of r.columns) {
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
