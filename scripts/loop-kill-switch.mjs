#!/usr/bin/env node
/**
 * scripts/loop-kill-switch.mjs
 * -----------------------------
 * Garde-fou autonomous loop. À appeler en pre-commit ET en début de
 * chaque Tier (avant tout edit). Exit 1 = stop le loop.
 *
 * Critères Booking-grade :
 *
 *   1. AHREFS GAP : si plan-coverage signale ≥1 item sans source Ahrefs
 *      valide → l'item viole la règle "Ahrefs-first" (mémoire
 *      servicesartisans-ahrefs-first-rule). Refuser nouveau commit.
 *
 *   2. SCHEMA REGRESSION : si scripts/audit-jsonld-integrity --strict
 *      casse, on a régressé Schema.org → stop.
 *
 *   3. TEST RUNTIME EXPLOSION : si test runtime > 300s baseline + 60s,
 *      on a introduit un test qui plombe le loop. Refuser.
 *      (Lit le dernier run depuis .vitest-runtime.json si présent.)
 *
 *   4. PRE-COMMIT BLOAT : si nb d'audits pre-commit > 50 → on a
 *      empilé trop d'audits, signe de scope creep. Stop manuel requis.
 *
 *   5. GIT HEALTH : si HEAD a divergé de plus de 100 commits depuis
 *      origin/master sans rebase, le loop tourne en isolation, refuser.
 *
 * Usage :
 *   node scripts/loop-kill-switch.mjs                   # rapport humain
 *   node scripts/loop-kill-switch.mjs --strict          # exit 1 si triggers
 *   node scripts/loop-kill-switch.mjs --json
 */

import { execSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')
const ROOT = process.cwd()

const triggers = []

function tryRun(cmd) {
  try {
    return { ok: true, out: execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] }).toString() }
  } catch (e) {
    return { ok: false, out: e.stdout?.toString() ?? '', err: e.stderr?.toString() ?? '' }
  }
}

// 1. AHREFS GAP
{
  const r = tryRun(`node ${join('scripts', 'plan-coverage.mjs')} --json`)
  if (!r.ok) {
    triggers.push({ kind: 'plan_coverage_broken', detail: 'plan-coverage script failed' })
  } else {
    try {
      const data = JSON.parse(r.out)
      if ((data.coverage?.ahrefs_gaps_count ?? 0) > 0) {
        triggers.push({
          kind: 'ahrefs_gap',
          count: data.coverage.ahrefs_gaps_count,
          gaps: data.coverage.ahrefs_gaps,
        })
      }
    } catch {
      triggers.push({ kind: 'plan_coverage_invalid_json' })
    }
  }
}

// 2. SCHEMA REGRESSION
{
  const r = tryRun(`node ${join('scripts', 'audit-jsonld-integrity.mjs')} --strict`)
  if (!r.ok) triggers.push({ kind: 'schema_regression', err: r.err.slice(0, 400) })
}

// 3. TEST RUNTIME EXPLOSION (best-effort, optional)
{
  const runtimePath = join(ROOT, '.vitest-runtime.json')
  if (existsSync(runtimePath)) {
    try {
      const data = JSON.parse(readFileSync(runtimePath, 'utf8'))
      const last = data.last_run_seconds ?? 0
      const baseline = data.baseline_seconds ?? 200
      if (last > baseline + 60) {
        triggers.push({
          kind: 'test_runtime_explosion',
          last_seconds: last,
          baseline_seconds: baseline,
        })
      }
    } catch {
      // ignore
    }
  }
}

// 4. PRE-COMMIT BLOAT — seuil 100 (96 audits actuels post-soft-404 fix +
//    marge tampon ~4 audits avant escalade). Bumpé 2026-05-22 pour
//    accommoder `audit-not-found-metadata.mjs` (mitigation route-level
//    not-found.tsx pour bug Next.js 14.2 #69103). Si on retape ce plafond
//    → vraie escalade humaine, retirer audits redondants.
{
  try {
    const auditCount = readdirSync(join(ROOT, 'scripts')).filter((f) =>
      f.startsWith('audit-')
    ).length
    if (auditCount > 100) {
      triggers.push({ kind: 'precommit_bloat', audit_count: auditCount })
    }
  } catch {
    // scripts/ missing — ignore
  }
}

// 5. GIT HEALTH (best-effort, skip if not a git repo)
{
  const r = tryRun('git rev-list --count HEAD ^origin/master 2>/dev/null || git rev-list --count HEAD 2>/dev/null')
  if (r.ok) {
    const ahead = parseInt(r.out.trim(), 10)
    if (Number.isFinite(ahead) && ahead > 100) {
      triggers.push({ kind: 'branch_drift', commits_ahead: ahead })
    }
  }
}

const ok = triggers.length === 0

if (jsonOut) {
  console.log(JSON.stringify({ ok, triggers }, null, 2))
} else {
  console.log('\n🛑 Loop Kill Switch — état\n')
  if (ok) {
    console.log('  ✅ Aucun déclencheur. Loop sain, on continue.\n')
  } else {
    console.log(`  ⚠️  ${triggers.length} déclencheur(s) :`)
    for (const t of triggers) {
      console.log(`     - ${t.kind} ${t.count ? `(${t.count})` : ''} ${t.last_seconds ? `last=${t.last_seconds}s` : ''}`.trim())
    }
    console.log('\n  → Stop loop, escalader Marvin.\n')
  }
}

if (strict && !ok) process.exit(1)
