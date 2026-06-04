#!/usr/bin/env node
/**
 * scripts/audit-rls-pii-tables.mjs
 * ---------------------------------
 * DoD anti-régression RLS sur tables PII / business-critical.
 *
 * Source : memory `servicesartisans-rls-hotfix-2026-04-24` (55 tables +
 * 5 vues security_invoker + 10 cols PII REVOKE) + memory
 * `audit-10-agents-2026-04-25` (RGPD/2FA/leaks fixes).
 *
 * Pourquoi : si une migration retire RLS sur ces tables, exposition PII
 * directe via PostgREST anon role :
 *   - profiles : email, phone, full_name → spam/démarchage
 *   - provider_claims : SIRET fournis privately → fraud claim
 *   - bookings : agenda + adresses chantiers → exposure clients
 *   - lead_assignments : qui a accepté quel lead → competitive intel
 *   - leads : description chantiers + budget → competitive intel
 *   - audit_logs : événements admin → privilege escalation
 *
 * Vérifie qu'au moins 1 ENABLE ROW LEVEL SECURITY existe pour chaque
 * table critique dans l'ensemble des migrations, ET qu'aucune migration
 * postérieure ne fait DISABLE RLS ou DROP POLICY sans replacement.
 *
 * Usage :
 *   node scripts/audit-rls-pii-tables.mjs --strict
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const MIG_DIR = join(ROOT, 'supabase', 'migrations')

if (!existsSync(MIG_DIR)) {
  console.error('Audit RLS : supabase/migrations absent')
  if (strict) process.exit(1)
  process.exit(0)
}

// Tables PII critiques effectivement présentes dans supabase/migrations/.
// `lead_exclusivity_incidents` est mentionnée dans la memory `lead-exclusivity-cleanup`
// mais n'a pas (encore) de CREATE TABLE en migration → exclue tant que non créée.
const PII_CRITICAL_TABLES = [
  'profiles',
  'providers',
  'provider_claims',
  'bookings',
  'lead_assignments',
  'leads',
  'audit_logs',
  'kyc_profiles',
  'cee_leads',
  'cee_mandats',
  'estimation_leads',
]

const migFiles = readdirSync(MIG_DIR)
  .filter((f) => /^\d+_.*\.sql$/.test(f))
  .sort((a, b) => Number(a.match(/^(\d+)/)[1]) - Number(b.match(/^(\d+)/)[1]))

const allMigSrc = migFiles.map((f) => readFileSync(join(MIG_DIR, f), 'utf8')).join('\n')

const checks = PII_CRITICAL_TABLES.map((table) => {
  // 1. Au moins une ENABLE RLS dans toutes les migrations
  const enableRe = new RegExp(
    `ALTER\\s+TABLE\\s+(?:public\\.|app\\.)?${table}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`,
    'i'
  )
  const enabled = enableRe.test(allMigSrc)

  // 2. Aucune DISABLE RLS sans ré-ENABLE postérieur
  const disableRe = new RegExp(
    `ALTER\\s+TABLE\\s+(?:public\\.|app\\.)?${table}\\s+DISABLE\\s+ROW\\s+LEVEL\\s+SECURITY`,
    'gi'
  )
  const disableMatches = (allMigSrc.match(disableRe) ?? []).length
  // On accepte un DISABLE seulement s'il y a un ENABLE postérieur dans une
  // autre migration (test grossier : count enable >= count disable + 1).
  const enableMatches = (allMigSrc.match(new RegExp(enableRe.source, 'gi')) ?? []).length
  const noOrphanDisable = enableMatches >= disableMatches + (disableMatches > 0 ? 1 : 0)

  return {
    id: `rls_${table}`,
    label: `${table} : RLS enabled (no orphan DISABLE)`,
    ok: enabled && noOrphanDisable,
    weight: ['profiles', 'providers', 'provider_claims', 'leads'].includes(table) ? 2.0 : 1.0,
  }
})

// Bonus : vérifier qu'aucune migration récente (>400) ne fait DROP POLICY
// sans CREATE POLICY de remplacement dans la même migration ou postérieure.
//
// Whitelist : migrations qui font délibérément un clean-sweep sans recreate
// car la couverture est assurée par d'autres policies (ex: ADMIN FOR ALL +
// service_role BYPASSRLS). Documentées en commentaire dans la migration.
const ORPHAN_DROP_WHITELIST = new Set([
  '417_reviews_rls_hardening_fix.sql', // clean sweep INSERT policies — admin FOR ALL couvre
  '532_profiles_rls_reenable_p0.sql', // drop policy soup permissive (fuite) ; couverture = own-row + is_admin() + service_role BYPASSRLS
])

let droppedPoliciesSample = []
const recentMigs = migFiles.filter((f) => Number(f.match(/^(\d+)/)[1]) > 400)
for (const f of recentMigs) {
  if (ORPHAN_DROP_WHITELIST.has(f)) continue
  const src = readFileSync(join(MIG_DIR, f), 'utf8')
  const dropPolicyMatches = src.match(/DROP\s+POLICY[\s\S]{0,200}?(?:public\.|app\.)?(\w+)/gi) ?? []
  const createPolicyMatches =
    src.match(/CREATE\s+POLICY[\s\S]{0,200}?(?:public\.|app\.)?(\w+)/gi) ?? []
  if (dropPolicyMatches.length > createPolicyMatches.length + 2) {
    droppedPoliciesSample.push({
      file: f,
      drops: dropPolicyMatches.length,
      creates: createPolicyMatches.length,
    })
  }
}

checks.push({
  id: 'no_orphan_drop_policy',
  label: `Aucune migration récente (>400) ne DROP POLICY massivement sans recreate`,
  ok: droppedPoliciesSample.length === 0,
  weight: 1.5,
})

const totalWeight = checks.reduce((s, c) => s + c.weight, 0)
const passedWeight = checks.filter((c) => c.ok).reduce((s, c) => s + c.weight, 0)
const coveragePct = Math.round((passedWeight / totalWeight) * 1000) / 10

const failures = checks.filter((c) => !c.ok)

const report = {
  backlog_item: 'P3-rls-pii-tables',
  source_memory: 'servicesartisans-rls-hotfix-2026-04-24',
  total_tables_scanned: PII_CRITICAL_TABLES.length,
  total_checks: checks.length,
  passed: checks.length - failures.length,
  passed_weight: passedWeight,
  total_weight: totalWeight,
  coverage_pct: coveragePct,
  failures: failures.map((f) => ({ id: f.id, label: f.label, weight: f.weight })),
  orphan_drop_policies: droppedPoliciesSample,
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 RLS PII Tables Audit (DoD P3-rls-pii-tables)\n')
  console.log(`  Tables critiques : ${PII_CRITICAL_TABLES.length}`)
  console.log(`  Patterns         : ${checks.length}`)
  console.log(`  Coverage         : ${coveragePct}% (${passedWeight}/${totalWeight} pondéré)`)
  for (const c of checks) {
    const icon = c.ok ? '✅' : '❌'
    console.log(`     ${icon}  [${c.id}] ${c.label} (poids ${c.weight})`)
  }
  if (failures.length === 0) {
    console.log('\n  ✅ RLS PII préservé sur toutes les tables critiques.\n')
  } else {
    console.log(`\n  ⚠️  ${failures.length} régression(s) — DoD non atteinte.\n`)
  }
}

if (strict && failures.length > 0) process.exit(1)
