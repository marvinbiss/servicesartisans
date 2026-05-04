#!/usr/bin/env node
/**
 * scripts/audit-funnel-devis-fail-soft.mjs
 * -----------------------------------------
 * DoD anti-régression sur le fix funnel devis vague 4 (2026-05-04).
 *
 * Source : memory `servicesartisans-ahrefs-deep-audit-vague4-2026-05-04` —
 * "Funnel devis 5 root causes (Zod silencieuse 60%, tel format, Pipedrive
 *  silent failure, duplicate 1h, RGPD hint)". 92.8 % drop-off form_started
 * → form_submitted (97 → 7).
 *
 * Le fix audit F1 a corrigé Zod silencieuse — ce DoD verrouille le fix
 * pour qu'une PR future ne casse pas le contract serveur ↔ client.
 *
 * Pourquoi : un retour à `{ error: 'Données invalides' }` sans `details`
 * ferait perdre 60 % des leads sans aucune erreur visible côté form. La
 * UX showuserait juste « Erreur serveur » générique sur des champs valides
 * mais avec un bug d'edge-case (longueur, format, etc.). Bug invisible
 * mais cher : ~20 leads/j × 80-150€/lead mandataire CEE.
 *
 * Vérifie sur src/app/api/devis/route.ts + src/hooks/useDevisForm.ts :
 *
 *   1. /api/devis safeParse → 400 inclut `details: validation.error.flatten()`
 *      (sinon le client n'a aucun fieldError à mapper)
 *   2. useDevisForm parse `body?.details?.fieldErrors` sur 400
 *   3. SERVER_FIELD_MAP existe (mapping serverField → clientField)
 *   4. STEP_FIELD_MAP existe (jump vers earliest broken step)
 *   5. Form jumps step si earliestStep < step (UX critique : pas laisser
 *      l'user au step 3 avec erreurs au step 1)
 *   6. 409 (duplicate dans l'heure) géré distinct des erreurs (submitOutcome)
 *   7. /api/devis 500 db_error retourne JSON parsable {error: ...}
 *   8. Form catch TypeError 'Failed to fetch' (network error explicit UX)
 *
 * Usage :
 *   node scripts/audit-funnel-devis-fail-soft.mjs --strict
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const API_DEVIS = join(ROOT, 'src', 'app', 'api', 'devis', 'route.ts')
const HOOK = join(ROOT, 'src', 'hooks', 'useDevisForm.ts')

const apiSrc = existsSync(API_DEVIS) ? readFileSync(API_DEVIS, 'utf8') : ''
const hookSrc = existsSync(HOOK) ? readFileSync(HOOK, 'utf8') : ''

const checks = [
  {
    id: 'api_returns_zod_flatten',
    label: '/api/devis 400 inclut `details: validation.error.flatten()`',
    ok:
      /safeParse\(/.test(apiSrc) &&
      /details:\s*validation\.error\.flatten\(\)/.test(apiSrc),
  },
  {
    id: 'hook_parses_field_errors',
    label: 'useDevisForm parse `body?.details?.fieldErrors` sur 400',
    ok:
      /body\?\.details\?\.fieldErrors/.test(hookSrc) ||
      /res\.status\s*===\s*400[\s\S]{0,300}fieldErrors/.test(hookSrc),
  },
  {
    id: 'server_field_map',
    label: 'SERVER_FIELD_MAP existe (serverField → clientField)',
    ok: /SERVER_FIELD_MAP\s*[:=]/.test(hookSrc),
  },
  {
    id: 'step_field_map',
    label: 'STEP_FIELD_MAP existe (mapping clientField → step)',
    ok: /STEP_FIELD_MAP\s*[:=]/.test(hookSrc),
  },
  {
    id: 'jump_to_earliest_step',
    label: 'Form jump vers earliestStep si erreur sur step antérieur',
    ok:
      /earliestStep[\s\S]{0,200}setStep\(earliestStep\)/.test(hookSrc) ||
      /if\s*\(earliestStep\s*<\s*step\)\s*setStep/.test(hookSrc),
  },
  {
    id: 'duplicate_409_distinct',
    label: '409 (duplicate dans l\'heure) géré distinct des erreurs (submitOutcome)',
    ok:
      /res\.status\s*===\s*409/.test(hookSrc) &&
      /submitOutcome[\s\S]{0,100}['"]duplicate['"]/.test(hookSrc),
  },
  {
    id: 'api_500_json_parsable',
    label: '/api/devis 500 db_error retourne JSON parsable',
    ok:
      /case\s+['"]db_error['"][\s\S]{0,200}NextResponse\.json\(\s*\{\s*error:/.test(apiSrc) &&
      /status:\s*500/.test(apiSrc),
  },
  {
    id: 'network_error_handled',
    label: 'Form catch TypeError "Failed to fetch" (network error UX)',
    ok:
      /TypeError/.test(hookSrc) &&
      /Failed to fetch/.test(hookSrc),
  },
]

const failures = checks.filter((c) => !c.ok)

const report = {
  backlog_item: 'P3-funnel-devis-fail-soft',
  source_memory: 'servicesartisans-ahrefs-deep-audit-vague4-2026-05-04',
  drop_off_pct_before_fix: 92.8,
  estimated_leads_per_day_recovered: 20,
  total_checks: checks.length,
  passed: checks.length - failures.length,
  failures: failures.map((f) => ({ id: f.id, label: f.label })),
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Funnel Devis Fail-Soft Audit (DoD vague 4 F1 lock-in)\n')
  console.log(`  Source : memory ahrefs-deep-audit-vague4 (drop-off 92.8 %)`)
  console.log(`  Patterns : ${checks.length}`)
  console.log(`  OK       : ${checks.length - failures.length}`)
  console.log(`  Échecs   : ${failures.length}`)
  for (const c of checks) {
    const icon = c.ok ? '✅' : '❌'
    console.log(`     ${icon}  [${c.id}] ${c.label}`)
  }
  if (failures.length === 0) {
    console.log('\n  ✅ Funnel devis fail-soft contract préservé.\n')
  } else {
    console.log(`\n  ⚠️  ${failures.length} régression(s) — DoD non atteinte.\n`)
  }
}

if (strict && failures.length > 0) process.exit(1)
