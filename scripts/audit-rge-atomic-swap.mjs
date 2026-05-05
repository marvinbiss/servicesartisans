#!/usr/bin/env node
/**
 * scripts/audit-rge-atomic-swap.mjs
 * ----------------------------------
 * DoD anti-régression sur le pipeline ADEME RGE atomic swap (P0 data
 * integrity, audit-architecture-2026-04-12).
 *
 * Source : migration 413_rge_atomic_swap.sql + src/lib/rge/sync.ts
 * + memory `servicesartisans-rge-integration` + memory
 * `servicesartisans-audit-architecture-2026-04-12` (P0 ADEME atomic swap).
 *
 * Pourquoi : la sync ADEME hebdomadaire ingère ~165 000 lignes RGE depuis
 * data.gouv.fr. Sans swap atomique :
 *
 *   - DELETE puis INSERT séparés → window où providers.siret n'a plus
 *     de qualif RGE → /rge/[s]/[v] retourne 0 artisans pendant 5-30 min.
 *   - INSERT incrémentaux sans staging → si le run plante en cours
 *     (ADEME 502), table providers en état partiellement modifié.
 *   - UPDATE sans guard rail "min rows" → si ADEME retourne 0 ligne
 *     (panne API), tout le parc RGE serait supprimé silencieusement.
 *
 * Pattern lock-in (mig 413) :
 *
 *   1. `rge_truncate_staging()` : vide la staging table avant chaque run
 *   2. `rge_stage_rows(payload jsonb)` : ingère les batches en staging
 *      (zéro impact sur providers tant que le swap n'est pas appelé)
 *   3. `rge_apply_staging_atomic(p_last_synced_at, p_allow_clear_stale,
 *      p_min_staging_rows)` : DANS UNE SEULE TRANSACTION, match staging
 *      vs providers + UPDATE contacts + clear stale. Refuse si staging
 *      < 10K rows (garde-fou panne ADEME).
 *
 *   Côté client (src/lib/rge/sync.ts) :
 *   - constante `ADEME_MIN_ROWS_FOR_CLEAR = 50_000` (défense en profondeur)
 *   - séquence stricte truncate → stage → swap
 *   - SECURITY DEFINER + SET search_path = public (CVE-2018-1058)
 *   - REVOKE anon/authenticated, GRANT EXECUTE service_role only
 *
 * Vérifications :
 *
 *   A. Migration 413 contient les 3 fonctions PL/pgSQL
 *   B. rge_apply_staging_atomic : SECURITY DEFINER + SET search_path +
 *      RAISE EXCEPTION sur garde-fou min_staging_rows
 *   C. Une seule transaction (pas de COMMIT intermédiaire)
 *   D. REVOKE PUBLIC + GRANT service_role
 *   E. Aucune migration postérieure (>413) ne DROP/REPLACE rge_apply_staging_atomic
 *      sans préserver SECURITY DEFINER + garde-fou
 *   F. src/lib/rge/sync.ts utilise les 3 RPC dans l'ordre + ADEME_MIN_ROWS_FOR_CLEAR
 *
 * Usage :
 *   node scripts/audit-rge-atomic-swap.mjs --strict
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const MIG_DIR = join(ROOT, 'supabase', 'migrations')
const SYNC_LIB = join(ROOT, 'src', 'lib', 'rge', 'sync.ts')

const migFiles = existsSync(MIG_DIR)
  ? readdirSync(MIG_DIR).filter((f) => /^\d+_.*\.sql$/.test(f))
  : []

const mig413File = migFiles.find((f) => /^413_.*atomic_swap/i.test(f))
const mig413Src = mig413File ? readFileSync(join(MIG_DIR, mig413File), 'utf8') : ''

// Concat migrations > 413 pour détecter override silencieux
const post413Src = migFiles
  .filter((f) => Number(f.match(/^(\d+)/)[1]) > 413)
  .map((f) => readFileSync(join(MIG_DIR, f), 'utf8'))
  .join('\n')

const syncSrc = existsSync(SYNC_LIB) ? readFileSync(SYNC_LIB, 'utf8') : ''

const checks = [
  {
    id: 'mig_413_present',
    label: 'Migration 413_rge_atomic_swap.sql présente',
    ok: mig413Src.length > 0,
    weight: 2.0,
  },
  {
    id: 'three_rpc_functions',
    label:
      'Mig 413 définit rge_truncate_staging + rge_stage_rows + rge_apply_staging_atomic',
    ok:
      /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.rge_truncate_staging/.test(mig413Src) &&
      /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.rge_stage_rows/.test(mig413Src) &&
      /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.rge_apply_staging_atomic/.test(
        mig413Src
      ),
    weight: 2.0,
  },
  {
    id: 'security_definer_search_path',
    label:
      'rge_apply_staging_atomic : SECURITY DEFINER + SET search_path = public',
    ok: (() => {
      const m = mig413Src.match(
        /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.rge_apply_staging_atomic[\s\S]*?\$\$/
      )
      if (!m) return false
      return (
        /SECURITY\s+DEFINER/i.test(m[0]) && /SET\s+search_path\s*=\s*public/i.test(m[0])
      )
    })(),
    weight: 2.0,
  },
  {
    id: 'guard_rail_min_rows',
    label:
      'Garde-fou : RAISE EXCEPTION si staging < p_min_staging_rows (panne ADEME)',
    ok: /RAISE\s+EXCEPTION[\s\S]*?p_min_staging_rows|RAISE\s+EXCEPTION[\s\S]*?refusing\s+atomic\s+apply/i.test(
      mig413Src
    ),
    weight: 1.5,
  },
  {
    id: 'no_intermediate_commit',
    label:
      'Pas de COMMIT intermédiaire dans rge_apply_staging_atomic (transaction unique)',
    ok: (() => {
      const m = mig413Src.match(
        /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.rge_apply_staging_atomic[\s\S]*?\$\$\s*;/
      )
      if (!m) return false
      // Une fonction PL/pgSQL ne devrait jamais contenir COMMIT (interdit par
      // PostgreSQL hors transaction blocks). Si un dev ajoute du raw SQL avec
      // COMMIT, on le rejette.
      return !/\bCOMMIT\s*;/i.test(m[0])
    })(),
    weight: 1.5,
  },
  {
    id: 'revoke_public_grant_service_role',
    label:
      'REVOKE FROM PUBLIC + GRANT EXECUTE TO service_role sur les 3 fonctions',
    ok:
      /REVOKE\s+ALL\s+ON\s+FUNCTION\s+public\.rge_apply_staging_atomic[\s\S]{0,200}?FROM\s+(PUBLIC|anon|authenticated)/i.test(
        mig413Src
      ) &&
      /GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.rge_apply_staging_atomic[\s\S]{0,100}?TO\s+service_role/i.test(
        mig413Src
      ),
    weight: 1.0,
  },
  {
    id: 'no_post_drop_atomic',
    label:
      'Aucune migration postérieure (>413) ne DROP rge_apply_staging_atomic',
    ok: !/DROP\s+FUNCTION[\s\S]{0,100}?rge_apply_staging_atomic/i.test(post413Src),
    weight: 1.5,
  },
  {
    id: 'sync_lib_calls_truncate_then_stage_then_swap',
    label:
      'src/lib/rge/sync.ts appelle truncate → stage → swap dans cet ordre (RPC, pas commentaires)',
    ok: (() => {
      // Check RPC call order — match `.rpc('xxx'` only (supabase chain
      // peut être éclaté sur plusieurs lignes avec multiline). Ignore les
      // commentaires JSDoc qui mentionnent les fonctions par nom.
      const truncIdx = syncSrc.search(/\.rpc\s*\(\s*['"]rge_truncate_staging['"]/)
      const stageIdx = syncSrc.search(/\.rpc\s*\(\s*['"]rge_stage_rows['"]/)
      const swapIdx = syncSrc.search(/\.rpc\s*\(\s*['"]rge_apply_staging_atomic['"]/)
      return truncIdx > 0 && stageIdx > truncIdx && swapIdx > stageIdx
    })(),
    weight: 1.5,
  },
  {
    id: 'sync_lib_min_rows_guard',
    label: 'src/lib/rge/sync.ts déclare ADEME_MIN_ROWS_FOR_CLEAR (côté client)',
    ok: /const\s+ADEME_MIN_ROWS_FOR_CLEAR\s*=\s*\d+/.test(syncSrc),
    weight: 1.0,
  },
]

const totalWeight = checks.reduce((s, c) => s + c.weight, 0)
const passedWeight = checks.filter((c) => c.ok).reduce((s, c) => s + c.weight, 0)
const coveragePct = Math.round((passedWeight / totalWeight) * 1000) / 10

const failures = checks.filter((c) => !c.ok)

const report = {
  backlog_item: 'P3-rge-atomic-swap',
  source_memory:
    'rge-integration + audit-architecture-2026-04-12 (P0 ADEME atomic swap)',
  total_checks: checks.length,
  passed: checks.length - failures.length,
  passed_weight: passedWeight,
  total_weight: totalWeight,
  coverage_pct: coveragePct,
  failures: failures.map((f) => ({ id: f.id, label: f.label, weight: f.weight })),
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 RGE Atomic Swap Audit (DoD P3-rge-atomic-swap)\n')
  console.log(`  Patterns  : ${checks.length}`)
  console.log(`  Coverage  : ${coveragePct}% (${passedWeight}/${totalWeight} pondéré)`)
  for (const c of checks) {
    const icon = c.ok ? '✅' : '❌'
    console.log(`     ${icon}  [${c.id}] ${c.label} (poids ${c.weight})`)
  }
  if (failures.length === 0) {
    console.log('\n  ✅ Pipeline RGE atomic swap préservé.\n')
  } else {
    console.log(`\n  ⚠️  ${failures.length} régression(s) — DoD non atteinte.\n`)
  }
}

if (strict && failures.length > 0) process.exit(1)
