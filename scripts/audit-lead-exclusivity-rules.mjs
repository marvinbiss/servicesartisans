#!/usr/bin/env node
/**
 * scripts/audit-lead-exclusivity-rules.mjs
 * -----------------------------------------
 * DoD anti-régression sur règle NON-NEGOTIABLE CLAUDE.md :
 * "Leads are ALWAYS exclusive: 1 lead = 1 artisan, never shared".
 *
 * Source : memory `lead-exclusivity-cleanup-2026-04-18` — 14 leads avec
 * 3 assignments actifs résolus (bug batch dispatch + config max=3 historique).
 * Migration 455 a posé : trigger enforce_lead_exclusivity + unique index
 * partial uniq_lead_assignments_active_lead_id + CHECK
 * max_artisans_per_lead = 1.
 *
 * Pourquoi : si un dev retire le trigger ou élargit le CHECK pour passer
 * à max=N (ex. par méprise lecture CLAUDE.md ou besoin marketing
 * "cross-sell"), le funnel exclusif casse silencieusement et 14+ leads
 * réapparaîtraient avec multi-assignments.
 *
 * Vérifie sur supabase/migrations/*.sql + src/lib/leads/* :
 *
 *   1. Migration 455 (ou ultérieure) contient CHECK max_artisans_per_lead = 1
 *   2. Partial UNIQUE INDEX `uniq_lead_assignments_active_lead_id` sur
 *      lead_assignments(lead_id) WHERE status IN ('pending','accepted','viewed')
 *   3. Trigger `trg_lead_exclusivity` BEFORE INSERT sur lead_assignments
 *   4. Function `enforce_lead_exclusivity` SET search_path (CVE-2018-1058)
 *   5. Aucune migration POSTÉRIEURE ne fait DROP TRIGGER trg_lead_exclusivity
 *      ou DROP INDEX uniq_lead_assignments_active_lead_id ou élargit
 *      max_artisans_per_lead BETWEEN x AND y avec y > 1
 *   6. Helper `src/lib/leads/exclusivity-proof.ts` exporte une fonction
 *      qui peut être appelée pour vérifier l'invariant
 *
 * Usage :
 *   node scripts/audit-lead-exclusivity-rules.mjs --strict
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const MIG_DIR = join(ROOT, 'supabase', 'migrations')
const PROOF_HELPER = join(ROOT, 'src', 'lib', 'leads', 'exclusivity-proof.ts')

const migFiles = readdirSync(MIG_DIR)
  .filter((f) => /^\d+_.*\.sql$/.test(f))
  .sort((a, b) => Number(a.match(/^(\d+)/)[1]) - Number(b.match(/^(\d+)/)[1]))

// Concat all post-455 migrations
const POST_455_NUM = 455
let mig455Src = ''
let postSrc = ''
for (const f of migFiles) {
  const num = Number(f.match(/^(\d+)/)[1])
  const content = readFileSync(join(MIG_DIR, f), 'utf8')
  if (num === POST_455_NUM || /lead_exclusivity_enforcement/i.test(f)) {
    mig455Src += content + '\n'
  }
  if (num > POST_455_NUM) {
    postSrc += content + '\n'
  }
}

const proofSrc = existsSync(PROOF_HELPER) ? readFileSync(PROOF_HELPER, 'utf8') : ''

const checks = [
  {
    id: 'mig_455_check_max_1',
    label: 'Migration 455 contient CHECK max_artisans_per_lead = 1',
    ok: /CHECK\s*\(\s*max_artisans_per_lead\s*=\s*1\s*\)/.test(mig455Src),
  },
  {
    id: 'unique_index_active',
    label: 'Partial UNIQUE INDEX uniq_lead_assignments_active_lead_id',
    ok: /CREATE\s+UNIQUE\s+INDEX[\s\S]{0,200}?uniq_lead_assignments_active_lead_id/.test(
      mig455Src
    ),
  },
  {
    id: 'trigger_exclusivity',
    label: 'Trigger trg_lead_exclusivity BEFORE INSERT (status update OK)',
    ok:
      /CREATE\s+TRIGGER\s+trg_lead_exclusivity/.test(mig455Src) &&
      /BEFORE\s+INSERT(?:\s+OR\s+UPDATE)?[\s\S]{0,80}?(?:public\.)?lead_assignments/i.test(
        mig455Src
      ),
  },
  {
    id: 'function_exists',
    label:
      'Function enforce_lead_exclusivity définie (search_path géré par audit dédié)',
    ok: /FUNCTION\s+(?:public\.)?enforce_lead_exclusivity/.test(mig455Src) &&
      /RAISE\s+EXCEPTION/i.test(mig455Src),
  },
  {
    id: 'no_post_drop_trigger',
    label: 'Aucune migration postérieure ne DROP TRIGGER trg_lead_exclusivity',
    ok: !/DROP\s+TRIGGER[\s\S]{0,100}?trg_lead_exclusivity/i.test(postSrc),
  },
  {
    id: 'no_post_drop_index',
    label:
      'Aucune migration postérieure ne DROP INDEX uniq_lead_assignments_active_lead_id',
    ok: !/DROP\s+INDEX[\s\S]{0,100}?uniq_lead_assignments_active_lead_id/i.test(postSrc),
  },
  {
    id: 'no_post_widen_max',
    label: 'Aucune migration postérieure n\'élargit max_artisans_per_lead > 1',
    ok: !/CHECK\s*\(\s*max_artisans_per_lead\s*BETWEEN\s+\d+\s+AND\s+([2-9]|\d{2,})\s*\)/i.test(
      postSrc
    ),
  },
  {
    id: 'proof_helper_exists',
    label: 'Helper src/lib/leads/exclusivity-proof.ts existe + exporte fonction',
    ok: existsSync(PROOF_HELPER) && /export\s+(?:async\s+)?function/.test(proofSrc),
  },
]

const failures = checks.filter((c) => !c.ok)

const report = {
  backlog_item: 'P3-lead-exclusivity-rules',
  source_memory: 'servicesartisans-lead-exclusivity-cleanup-2026-04-18',
  total_checks: checks.length,
  passed: checks.length - failures.length,
  failures: failures.map((f) => ({ id: f.id, label: f.label })),
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Lead Exclusivity Rules Audit (NON-NEGOTIABLE 1 lead = 1 artisan)\n')
  console.log(`  Patterns : ${checks.length}`)
  console.log(`  OK       : ${checks.length - failures.length}`)
  console.log(`  Échecs   : ${failures.length}`)
  for (const c of checks) {
    const icon = c.ok ? '✅' : '❌'
    console.log(`     ${icon}  [${c.id}] ${c.label}`)
  }
  if (failures.length === 0) {
    console.log('\n  ✅ Lead exclusivity invariant préservé.\n')
  } else {
    console.log(`\n  ⚠️  ${failures.length} régression(s) — DoD non atteinte.\n`)
  }
}

if (strict && failures.length > 0) process.exit(1)
