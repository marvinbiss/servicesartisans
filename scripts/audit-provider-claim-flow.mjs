#!/usr/bin/env node
/**
 * scripts/audit-provider-claim-flow.mjs
 * --------------------------------------
 * DoD anti-régression sur le flow revendication fiche artisan.
 *
 * Source : memory `servicesartisans-architecture` + `servicesartisans-ceo-strategy-2026-04-20`
 * (Pillar #1 supply-side broken : 19 claimed / 970K). CLAUDE.md projet
 * "Revendiquez cette fiche" : SIRET → provider_claims pending → admin
 * approuve → providers.user_id assigné.
 *
 * Pourquoi : c'est la pipeline de monétisation supply-side. Si elle casse :
 *
 *   - provider_claims.status élargi → bypass workflow d'approbation
 *     (ex: 'auto_approved' sans review = fiches volées par tiers).
 *   - Validation SIRET retirée → claim sans SIRET valide → claim
 *     n'importe quelle fiche.
 *   - approveClaim() ne set plus providers.user_id + claimed_at →
 *     l'artisan "approuvé" n'a accès à RIEN côté espace-artisan.
 *   - approveClaim() ne filtre plus `.is('user_id', null)` → race
 *     condition : 2 claims approuvés en même temps sur la même fiche
 *     écrasent l'un l'autre.
 *   - Cron claim-auto-approve désactivé → 100% des claims attendent
 *     review admin manuelle = bottleneck supply.
 *
 * Vérifications :
 *
 *   1. Mig 314 provider_claims : CREATE TABLE + status CHECK IN
 *      ('pending','approved','rejected') + siret_provided NOT NULL +
 *      rejection_reason text
 *   2. Aucune migration postérieure n'élargit status au-delà des 3 valeurs
 *   3. /api/artisan/claim/route.ts valide SIRET regex (9 ou 14 chiffres)
 *   4. claims-service approveClaim() :
 *      - update providers SET user_id + claimed_at + claimed_by
 *      - filtre .is('user_id', null) (anti race condition)
 *   5. Cron claim-auto-approve présent
 *   6. Admin endpoint /api/admin/claims utilise requirePermission ou
 *      adminAuth pour gating
 *
 * Usage :
 *   node scripts/audit-provider-claim-flow.mjs --strict
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const MIG_DIR = join(ROOT, 'supabase', 'migrations')
const CLAIM_ROUTE = join(ROOT, 'src', 'app', 'api', 'artisan', 'claim', 'route.ts')
const ADMIN_ROUTE = join(ROOT, 'src', 'app', 'api', 'admin', 'claims', 'route.ts')
const CLAIM_AUTO_CRON = join(
  ROOT,
  'src',
  'app',
  'api',
  'cron',
  'claim-auto-approve',
  'route.ts'
)
const SERVICE_LIB = join(ROOT, 'src', 'lib', 'services', 'claims-service.ts')

const migFiles = existsSync(MIG_DIR)
  ? readdirSync(MIG_DIR).filter((f) => /^\d+_.*\.sql$/.test(f))
  : []

const mig314File = migFiles.find((f) => /^314_.*provider_claims/i.test(f))
const mig314Src = mig314File ? readFileSync(join(MIG_DIR, mig314File), 'utf8') : ''

// Concat post-314 pour détecter override
const post314Src = migFiles
  .filter((f) => Number(f.match(/^(\d+)/)[1]) > 314)
  .map((f) => readFileSync(join(MIG_DIR, f), 'utf8'))
  .join('\n')

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '')

const claimRouteSrc = read(CLAIM_ROUTE)
const adminRouteSrc = read(ADMIN_ROUTE)
const cronSrc = read(CLAIM_AUTO_CRON)
const serviceSrc = read(SERVICE_LIB)

const checks = [
  {
    id: 'mig_314_present',
    label: 'Mig 314 provider_claims présente avec CREATE TABLE',
    ok:
      mig314Src.length > 0 &&
      /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?provider_claims/i.test(
        mig314Src
      ),
    weight: 2.0,
  },
  {
    id: 'status_workflow_canonical',
    label:
      "provider_claims status CHECK IN ('pending','approved','rejected')",
    ok: /status[\s\S]{0,200}?CHECK\s*\(\s*status\s+IN\s*\(\s*['"]pending['"]\s*,\s*['"]approved['"]\s*,\s*['"]rejected['"]\s*\)\s*\)/i.test(
      mig314Src
    ),
    weight: 2.0,
  },
  {
    id: 'siret_provided_required',
    label: 'siret_provided NOT NULL + rejection_reason text',
    ok:
      /siret_provided\s+(?:TEXT|text)[\s\S]{0,80}?NOT\s+NULL/i.test(mig314Src) &&
      /rejection_reason\s+(?:TEXT|text)/i.test(mig314Src),
    weight: 1.0,
  },
  {
    id: 'no_post_widen_status',
    label:
      "Aucune migration postérieure ne touche provider_claims status (ex: auto_approved sans review)",
    ok: (() => {
      // On regarde seulement les ALTER TABLE provider_claims ou les
      // re-CREATE TABLE provider_claims dans les migrations >314.
      // Si aucun mention provider_claims + status, c'est OK.
      const re = /provider_claims[\s\S]{0,300}?(ADD\s+CONSTRAINT|DROP\s+CONSTRAINT|CHECK\s*\(\s*status\s+IN)/gi
      const m = post314Src.match(re) ?? []
      // S'il y a une mention, vérifier qu'elle ne contient pas de valeurs
      // hors canonical.
      for (const hit of m) {
        // Extract the CHECK IN list if present
        const checkMatch = hit.match(/CHECK\s*\(\s*status\s+IN\s*\(([^)]+)\)/i)
        if (!checkMatch) continue
        const values = checkMatch[1].match(/['"]([a-z_]+)['"]/gi) ?? []
        const cleaned = values.map((v) => v.replace(/['"]/g, '').toLowerCase())
        const allowed = new Set(['pending', 'approved', 'rejected'])
        if (cleaned.some((v) => !allowed.has(v))) return false
      }
      return true
    })(),
    weight: 1.5,
  },
  {
    id: 'siret_regex_validation',
    label:
      'POST /api/artisan/claim valide SIRET regex (9 ou 14 chiffres)',
    ok:
      claimRouteSrc.length > 0 &&
      /\.regex\s*\(\s*\/\^\\d\{9\}.*?14|9.*?14|9\\d|14\}\$\//.test(claimRouteSrc),
    weight: 1.5,
  },
  {
    id: 'approve_claim_atomic_set',
    label:
      'approveClaim update providers SET user_id + claimed_at + claimed_by',
    ok:
      serviceSrc.length > 0 &&
      /user_id:\s*resolvedUserId/.test(serviceSrc) &&
      /claimed_at:\s*now/.test(serviceSrc) &&
      /claimed_by:\s*resolvedUserId/.test(serviceSrc),
    weight: 2.0,
  },
  {
    id: 'approve_claim_race_guard',
    label:
      "approveClaim filtre .is('user_id', null) (anti-race 2 claims simultanés)",
    ok:
      serviceSrc.length > 0 &&
      /\.is\s*\(\s*['"]user_id['"]\s*,\s*null\s*\)/.test(serviceSrc),
    weight: 2.0,
  },
  {
    id: 'auto_approve_cron_exists',
    label: 'Cron claim-auto-approve présent + appelle approveClaim',
    ok: cronSrc.length > 0 && /approveClaim\s*\(/.test(cronSrc),
    weight: 1.0,
  },
  {
    id: 'admin_endpoint_gated',
    label:
      "Admin /api/admin/claims gated via requirePermission/admin auth (pas d'auth bypass)",
    ok:
      adminRouteSrc.length > 0 &&
      /(requirePermission|requireAdmin|adminAuth|isAdmin\s*\()/i.test(adminRouteSrc),
    weight: 1.0,
  },
]

const totalWeight = checks.reduce((s, c) => s + c.weight, 0)
const passedWeight = checks.filter((c) => c.ok).reduce((s, c) => s + c.weight, 0)
const coveragePct = Math.round((passedWeight / totalWeight) * 1000) / 10

const failures = checks.filter((c) => !c.ok)

const report = {
  backlog_item: 'P3-provider-claim-flow',
  source_memory: 'architecture + ceo-strategy-2026-04-20 (Pillar #1 supply)',
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
  console.log('\n📋 Provider Claim Flow Audit (DoD P3-provider-claim-flow)\n')
  console.log(`  Patterns  : ${checks.length}`)
  console.log(`  Coverage  : ${coveragePct}% (${passedWeight}/${totalWeight} pondéré)`)
  for (const c of checks) {
    const icon = c.ok ? '✅' : '❌'
    console.log(`     ${icon}  [${c.id}] ${c.label} (poids ${c.weight})`)
  }
  if (failures.length === 0) {
    console.log('\n  ✅ Provider claim flow préservé.\n')
  } else {
    console.log(`\n  ⚠️  ${failures.length} régression(s) — DoD non atteinte.\n`)
  }
}

if (strict && failures.length > 0) process.exit(1)
