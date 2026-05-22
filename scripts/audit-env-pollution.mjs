#!/usr/bin/env node
/**
 * Audit env pollution — defensive guard around `NEXT_PUBLIC_SITE_URL`.
 *
 * Root incident (2026-05-22) : a literal `\n` baked into the Vercel deployment
 * env cascaded into every JSON-LD `@id` field on 45 677 RGE provider pages.
 * Google rejected those IRIs as invalid → structured-data warnings + soft-404
 * risk on `/rge/[service]/[ville]/[publicId]`.
 *
 * This script enforces three rules :
 *
 *   1. NO `.env*` files committed to the repo (already covered by .gitignore,
 *      but this is a hard belt-and-suspenders check — duplicates the
 *      `audit-secrets` philosophy : trust nothing, verify everything).
 *
 *   2. NO source file contains a string literal URL with embedded whitespace
 *      / control chars (e.g. `'https://servicesartisans.fr\n'`). Such literals
 *      indicate a copy-paste accident or test leakage into prod.
 *
 *   3. INFORMATIONAL : list every direct read of
 *      `process.env.NEXT_PUBLIC_SITE_URL` in `src/`. These should migrate to
 *      `SITE_URL` from `@/lib/seo/config` (which uses `sanitizeUrl`) — but
 *      gating them all today would block other work. Tracked as warning.
 *
 * Exit codes :
 *   - 0 : clean (or only informational warnings)
 *   - 1 : rule 1 or rule 2 violated (hard fail)
 *
 * Usage :
 *   node scripts/audit-env-pollution.mjs            # default
 *   node scripts/audit-env-pollution.mjs --strict   # fail on rule 3 too
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const STRICT = process.argv.includes('--strict')

const IGNORE_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  'coverage',
  '.vercel',
  'tmp',
  'public',
  '.claude',
])

/** Allowed `.env*` filenames in the repo (templates, examples). */
const ENV_ALLOWLIST = new Set([
  '.env.example',
  '.env.template',
  '.env.sample',
])

/** Files where `process.env.NEXT_PUBLIC_SITE_URL` is the canonical source. */
const NEXT_PUBLIC_SITE_URL_ALLOWED = new Set(
  [
    'src/lib/seo/config.ts',
    'src/lib/utils/sanitize-url.ts',
    'src/lib/config/company-identity.ts',
    'src/lib/env.ts',
  ].map((p) => p.split('/').join(sep))
)

const failures = []
const warnings = []

/** Recursively walk a directory yielding file absolute paths. */
function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (IGNORE_DIRS.has(entry)) continue
    const full = join(dir, entry)
    let st
    try {
      st = statSync(full)
    } catch {
      continue
    }
    if (st.isDirectory()) {
      yield* walk(full)
    } else if (st.isFile()) {
      yield full
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Rule 1 — no committed .env files (except allowlisted templates).
// We trust `git ls-files`, not the working-tree FS : a dev's local
// `.env.local` is expected on disk (gitignored), only the tracked set matters.
// ─────────────────────────────────────────────────────────────
try {
  const tracked = execSync('git ls-files', { cwd: ROOT, encoding: 'utf8' })
    .split('\n')
    .filter(Boolean)
  for (const path of tracked) {
    const base = path.split('/').pop()
    if (!base) continue
    if (base.startsWith('.env') && !ENV_ALLOWLIST.has(base)) {
      failures.push(
        `rule-1 env-file-committed : ${path} — only ${[...ENV_ALLOWLIST].join(', ')} allowed`
      )
    }
  }
} catch {
  warnings.push('rule-1 skipped : not a git repo (or git unavailable)')
}

// ─────────────────────────────────────────────────────────────
// Rule 2 — no URL literal with embedded whitespace / control chars.
// We look for `https://` followed by raw \n \r \t or backslash-escaped variant.
// ─────────────────────────────────────────────────────────────
const URL_POLLUTION_RE = /(['"`])\s*https?:\/\/[^'"`\n\r]*?(?:\\n|\\r|\\t|\n|\r|\t)[^'"`\n\r]*?\1/

// Track usage of NEXT_PUBLIC_SITE_URL for rule 3.
const NEXT_PUBLIC_USAGE_RE = /process\.env\.NEXT_PUBLIC_SITE_URL/

const directReads = []

for (const full of walk(ROOT)) {
  const rel = relative(ROOT, full)
  if (!rel.startsWith('src' + sep) && !rel.startsWith('scripts' + sep)) continue
  if (!/\.(ts|tsx|js|mjs|cjs)$/.test(rel)) continue
  // Skip this file (it scans for the pattern by name).
  if (rel.endsWith(join('scripts', 'audit-env-pollution.mjs'))) continue

  let content
  try {
    content = readFileSync(full, 'utf8')
  } catch {
    continue
  }

  // Rule 2 : URL literal containing escape sequences. We skip tests (they
  // intentionally exercise polluted inputs) and pure-comment lines (JSDoc
  // examples like `https://example.com\\n` aren't real literals at runtime).
  const isTest = /\.test\.[mc]?[jt]sx?$/.test(rel)
  if (!isTest) {
    const lines = content.split('\n')
    lines.forEach((line, idx) => {
      const trimmed = line.trim()
      // Skip comment-only lines : `// ...`, `* ...`, `/* ...`, `/** ...`.
      if (
        trimmed.startsWith('//') ||
        trimmed.startsWith('*') ||
        trimmed.startsWith('/*')
      ) {
        return
      }
      if (URL_POLLUTION_RE.test(line)) {
        failures.push(
          `rule-2 polluted-url-literal : ${rel}:${idx + 1} — ${trimmed.slice(0, 120)}`
        )
      }
    })
  }

  // Rule 3 : direct env read outside allowlist.
  if (NEXT_PUBLIC_USAGE_RE.test(content) && !NEXT_PUBLIC_SITE_URL_ALLOWED.has(rel)) {
    directReads.push(rel)
  }
}

if (directReads.length > 0) {
  const msg = `rule-3 direct-env-read : ${directReads.length} file(s) read process.env.NEXT_PUBLIC_SITE_URL directly. ` +
    `Prefer SITE_URL from @/lib/seo/config (sanitized).`
  if (STRICT) failures.push(msg)
  else warnings.push(msg)
}

// ─────────────────────────────────────────────────────────────
// Report
// ─────────────────────────────────────────────────────────────
if (warnings.length > 0) {
  console.warn('\n[audit-env-pollution] WARNINGS :')
  for (const w of warnings) console.warn('  - ' + w)
  if (directReads.length > 0 && !STRICT) {
    console.warn('\n  Direct readers (migrate to SITE_URL from @/lib/seo/config) :')
    for (const r of directReads) console.warn('    - ' + r)
  }
}

if (failures.length > 0) {
  console.error('\n[audit-env-pollution] FAILURES :')
  for (const f of failures) console.error('  - ' + f)
  console.error(`\n${failures.length} failure(s). See scripts/audit-env-pollution.mjs.`)
  process.exit(1)
}

console.log(
  `\n[audit-env-pollution] OK — 0 failure, ${warnings.length} warning(s), ` +
    `${directReads.length} direct env read(s) tracked.`
)
process.exit(0)
