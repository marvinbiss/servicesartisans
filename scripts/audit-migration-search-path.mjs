#!/usr/bin/env node
// Guardrail : refuse un commit de migration qui crée des fonctions
// dans `public` ou `app` sans pinned `SET search_path` (CVE-2018-1058 class).
//
// Détection : pour chaque `CREATE [OR REPLACE] FUNCTION <schema>.<name>(...)`
// dans `public` / `app`, on cherche `SET search_path` dans une fenêtre de
// 60 lignes APRÈS l'en-tête (couvre args + LANGUAGE + AS $$ ...).
//
// Allowlist : un commentaire `-- pragma: allow-mutable-search-path` dans la
// même fenêtre désactive le check pour cette fonction (cas légitimes :
// fonction qui doit accéder à `extensions` ou `vault`, etc.).
//
// Bypass complet via env : SKIP_SEARCH_PATH_AUDIT=1 (à éviter).
// Mode `--all` : audit historique complet (utile en CI). Sinon : ne lint que
// les migrations stagées dans le commit courant (mode pre-commit).

import { readdirSync, readFileSync } from 'node:fs'
import { join, basename } from 'node:path'
import { execSync } from 'node:child_process'

if (process.env.SKIP_SEARCH_PATH_AUDIT === '1') {
  console.log('⚠️  audit-migration-search-path: skipped via SKIP_SEARCH_PATH_AUDIT=1')
  process.exit(0)
}

const MIG_DIR = join(process.cwd(), 'supabase', 'migrations')
const WINDOW_LINES = 60
const ALLOW_PRAGMA = 'pragma: allow-mutable-search-path'
const SCAN_ALL = process.argv.includes('--all')

let files
if (SCAN_ALL) {
  files = readdirSync(MIG_DIR).filter((f) => f.endsWith('.sql'))
} else {
  let staged = ''
  try {
    staged = execSync('git diff --cached --name-only --diff-filter=ACMR', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
  } catch {
    staged = ''
  }
  files = staged
    .split('\n')
    .map((p) => p.trim())
    .filter((p) => p.startsWith('supabase/migrations/') && p.endsWith('.sql'))
    .map((p) => basename(p))
  if (files.length === 0) {
    console.log('OK. Aucune migration stagée à auditer.')
    process.exit(0)
  }
}

const violations = []

for (const file of files) {
  const path = join(MIG_DIR, file)
  const text = readFileSync(path, 'utf8')
  const lines = text.split('\n')

  for (let i = 0; i < lines.length; i++) {
    // Ignore les lignes commentées
    const stripped = lines[i].replace(/--.*$/, '')
    const m = /\bCREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:(public|app)\.)?([a-zA-Z_][a-zA-Z0-9_]*)\b/i.exec(
      stripped
    )
    if (!m) continue

    const schema = (m[1] || 'public').toLowerCase()
    const fnName = m[2]

    // On ne contraint que public + app (les fonctions DROP+CREATE dans app.* sont aussi linted)
    if (schema !== 'public' && schema !== 'app') continue

    const window = lines.slice(i, Math.min(i + WINDOW_LINES, lines.length)).join('\n')

    if (window.toLowerCase().includes(ALLOW_PRAGMA)) continue

    if (/\bSET\s+search_path\s*=/i.test(window)) continue

    violations.push({
      file,
      line: i + 1,
      schema,
      fnName,
    })
  }
}

if (violations.length > 0) {
  console.error('\n❌ Migration(s) avec CREATE FUNCTION sans `SET search_path` :\n')
  for (const v of violations) {
    console.error(`  - ${v.file}:${v.line}  ${v.schema}.${v.fnName}`)
  }
  console.error(`\n${violations.length} fonction(s) non-pinnée(s).`)
  console.error('Ajouter `SET search_path = public, pg_catalog` dans la définition,')
  console.error('ou `-- pragma: allow-mutable-search-path` si la fonction doit accéder à extensions/vault.\n')
  process.exit(1)
}

console.log(`OK. Toutes les CREATE FUNCTION (public/app) pinnent leur search_path.`)
