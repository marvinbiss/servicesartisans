#!/usr/bin/env node
/**
 * scripts/run-audits-parallel.mjs
 * --------------------------------
 * Orchestrateur parallèle pour les audits anti-régression pre-commit.
 *
 * Pourquoi : la liste séquentielle dans .husky/pre-commit empile ~50
 * audits Node, chacun bootstrap V8 (~150-300ms) + son propre travail.
 * Total observé baseline 18.4s. Empêche le commit fluide → moins de
 * commits, plus gros, plus risqués.
 *
 * Approche : chaque audit-*.mjs est un read-only check indépendant
 * (pas de shared state, pas d'écriture). On les spawn en parallèle.
 *
 * Source de vérité : la liste exacte (avec args custom comme
 * `--threshold 55`) est extraite de `.husky/pre-commit` directement.
 * On ne touche pas aux audits non-câblés (ex: audit-schema-drift).
 *
 * Usage :
 *   node scripts/run-audits-parallel.mjs --strict
 *   node scripts/run-audits-parallel.mjs --strict --concurrency 6
 *   node scripts/run-audits-parallel.mjs --json
 *
 * Sortie :
 *   - Affiche un récap pass/fail par audit + temps
 *   - Exit 1 si --strict ET ≥1 audit échoué
 *   - Affiche le stdout/stderr des audits qui ont échoué
 */

import { spawn } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import os from 'node:os'

const args = process.argv.slice(2)
const strict = args.includes('--strict')
const jsonOut = args.includes('--json')

const concurrencyArgIdx = args.indexOf('--concurrency')
// Default conservateur 6 — sur Windows + Node 24 on a vu des UV_HANDLE_CLOSING
// races avec concurrency = nb_cpus (12+). 6 est un sweet spot stable.
const CONCURRENCY =
  concurrencyArgIdx >= 0
    ? parseInt(args[concurrencyArgIdx + 1] ?? '6', 10) || 6
    : Math.min(6, Math.max(2, os.cpus().length))

const ROOT = process.cwd()
const AUDITS_LIST = join(ROOT, '.husky', 'audits.list')

if (!existsSync(AUDITS_LIST)) {
  console.error('.husky/audits.list absent — single source of truth manquante.')
  process.exit(strict ? 1 : 0)
}

/**
 * Parse `.husky/audits.list` (single source of truth).
 * Format : `audit-XXX.mjs [--flag ...]` par ligne. Lignes vides ou `#` ignorées.
 */
function parseAuditsList() {
  const src = readFileSync(AUDITS_LIST, 'utf8')
  const lines = src.split(/\r?\n/)
  const audits = []
  for (const raw of lines) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const tokens = line.split(/\s+/)
    const filename = tokens[0]
    if (!/^audit-[\w-]+\.mjs$/.test(filename)) {
      console.warn(`  ⚠️  Ligne ignorée (format invalide) : "${line}"`)
      continue
    }
    audits.push({
      file: join('scripts', filename),
      args: tokens.slice(1),
    })
  }
  return audits
}

const audits = parseAuditsList()

if (audits.length === 0) {
  console.log('Aucun audit câblé dans .husky/pre-commit')
  process.exit(0)
}

if (!jsonOut) {
  console.log(
    `\n🚀 Pre-commit audits parallèle — ${audits.length} audits, concurrency=${CONCURRENCY}\n`
  )
}

/**
 * Spawn un audit en collectant stdout/stderr + exit code.
 */
function runAudit({ file, args: auditArgs }) {
  return new Promise((resolve) => {
    const start = Date.now()
    const child = spawn('node', [join(ROOT, file), ...auditArgs], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (d) => {
      stdout += d.toString()
    })
    child.stderr.on('data', (d) => {
      stderr += d.toString()
    })
    child.on('close', (code) => {
      resolve({
        file,
        args: auditArgs,
        code: code ?? 1,
        stdout,
        stderr,
        durationMs: Date.now() - start,
      })
    })
    child.on('error', (err) => {
      resolve({
        file,
        args: auditArgs,
        code: 1,
        stdout,
        stderr: stderr + '\nspawn error: ' + err.message,
        durationMs: Date.now() - start,
      })
    })
  })
}

/**
 * Pool simple : N workers en parallèle qui pull la prochaine tâche.
 */
async function runAll() {
  const queue = [...audits]
  const results = []

  async function worker() {
    while (queue.length > 0) {
      const task = queue.shift()
      if (!task) break
      const r = await runAudit(task)
      results.push(r)
      if (!jsonOut) {
        const icon = r.code === 0 ? '✅' : '❌'
        const tag = task.file.replace(/^scripts\/audit-|\.mjs$/g, '')
        process.stdout.write(`  ${icon}  ${tag.padEnd(38)} ${r.durationMs}ms\n`)
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker())
  await Promise.all(workers)
  return results
}

const t0 = Date.now()
const results = await runAll()
const totalMs = Date.now() - t0

const failures = results.filter((r) => r.code !== 0)
const sumIndividual = results.reduce((s, r) => s + r.durationMs, 0)

if (jsonOut) {
  console.log(
    JSON.stringify(
      {
        total_audits: results.length,
        passed: results.length - failures.length,
        failed: failures.length,
        wall_clock_ms: totalMs,
        sum_individual_ms: sumIndividual,
        speedup: Math.round((sumIndividual / totalMs) * 10) / 10,
        concurrency: CONCURRENCY,
        failures: failures.map((f) => ({
          file: f.file,
          args: f.args,
          code: f.code,
          stderr_tail: f.stderr.slice(-400),
          stdout_tail: f.stdout.slice(-400),
        })),
      },
      null,
      2
    )
  )
} else {
  console.log()
  console.log(`  Total wall-clock     : ${totalMs}ms`)
  console.log(`  Somme séquentielle   : ${sumIndividual}ms`)
  console.log(`  Speedup parallèle    : ${(sumIndividual / totalMs).toFixed(1)}x`)
  console.log(`  Audits OK            : ${results.length - failures.length}/${results.length}`)
  if (failures.length > 0) {
    console.log(`\n  ❌ ${failures.length} audit(s) en échec :\n`)
    for (const f of failures) {
      console.log(
        `  ─── ${f.file} ${f.args.join(' ')} (exit ${f.code}, ${f.durationMs}ms) ───`
      )
      const out = (f.stdout + f.stderr).trim()
      if (out) {
        console.log(out.slice(-1500))
      }
      console.log()
    }
  } else {
    console.log(`\n  ✅ Tous les audits passent.\n`)
  }
}

if (strict && failures.length > 0) process.exit(1)
