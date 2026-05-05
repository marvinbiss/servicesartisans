#!/usr/bin/env node
/**
 * scripts/audit-pipedrive-3-canaux.mjs
 * -------------------------------------
 * DoD anti-régression sur architecture Pipedrive 3 canaux.
 *
 * Source : memory `servicesartisans-pipedrive-3-canaux` + CLAUDE.md
 * tableau "Pipedrive CRM — 3 canaux" :
 *
 *   /api/devis              → PIPEDRIVE_PIPELINE_ID         source='servicesartisans.fr'
 *   /api/simulateur/submit  → PIPEDRIVE_PIPELINE_SIMULATEUR source='simulateur-aides'
 *   /api/simulateur/callback → PIPEDRIVE_PIPELINE_SIMULATEUR source='callback-simulateur'
 *
 * Pourquoi : si un dev rebranche un canal sur le mauvais pipeline OU
 * change la valeur source, on perd le tracking commercial : l'équipe sales
 * Pipedrive gère 3 funnels distincts avec SLA différents (devis = 24h,
 * simulateur = lead nurturing 7-30j). Mélange = leads chauds traités comme
 * froids OU froids dispatchés trop vite.
 *
 * Vérifie :
 *
 *   1. src/lib/integrations/pipedrive.ts utilise `lead.source ?? 'servicesartisans.fr'`
 *   2. src/lib/simulateur/pipedrive.ts utilise PIPEDRIVE_PIPELINE_SIMULATEUR
 *      ET assigne source='simulateur-aides'
 *   3. src/lib/simulateur/callback-pipedrive.ts utilise PIPEDRIVE_PIPELINE_SIMULATEUR
 *      ET assigne source='callback-simulateur'
 *   4. env.ts déclare PIPEDRIVE_PIPELINE_SIMULATEUR comme optionalString
 *   5. DLQ retry cron `pipedrive-retry/route.ts` existe (max 5 tentatives,
 *      backoff expo 6h)
 *   6. simulateur-pipedrive-retry cron existe (séparé du devis DLQ)
 *
 * Usage :
 *   node scripts/audit-pipedrive-3-canaux.mjs --strict
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()

const DEVIS_LIB = join(ROOT, 'src', 'lib', 'integrations', 'pipedrive.ts')
const SIMU_LIB = join(ROOT, 'src', 'lib', 'simulateur', 'pipedrive.ts')
const CALLBACK_LIB = join(ROOT, 'src', 'lib', 'simulateur', 'callback-pipedrive.ts')
const ENV_FILE = join(ROOT, 'src', 'lib', 'env.ts')
const DEVIS_RETRY = join(ROOT, 'src', 'app', 'api', 'cron', 'pipedrive-retry', 'route.ts')
const SIMU_RETRY = join(
  ROOT,
  'src',
  'app',
  'api',
  'cron',
  'simulateur-pipedrive-retry',
  'route.ts'
)

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '')

const devisSrc = read(DEVIS_LIB)
const simuSrc = read(SIMU_LIB)
const callbackSrc = read(CALLBACK_LIB)
const envSrc = read(ENV_FILE)

const checks = [
  {
    id: 'devis_default_source',
    label: '/api/devis utilise source ?? "servicesartisans.fr" (devis canal)',
    ok: /lead\.source\s*\?\?\s*['"]servicesartisans\.fr['"]/.test(devisSrc),
  },
  {
    id: 'simu_pipeline_simulateur',
    label: '/api/simulateur/submit utilise PIPEDRIVE_PIPELINE_SIMULATEUR',
    ok: /PIPEDRIVE_PIPELINE_SIMULATEUR/.test(simuSrc),
  },
  {
    id: 'simu_source_aides',
    label: '/api/simulateur/submit assigne source="simulateur-aides"',
    ok: /body\[cfg\.fields\.source\]\s*=\s*['"]simulateur-aides['"]/.test(simuSrc),
  },
  {
    id: 'callback_pipeline_simulateur',
    label: '/api/simulateur/callback utilise PIPEDRIVE_PIPELINE_SIMULATEUR',
    ok: /PIPEDRIVE_PIPELINE_SIMULATEUR/.test(callbackSrc),
  },
  {
    id: 'callback_source_callback',
    label: '/api/simulateur/callback assigne source="callback-simulateur"',
    ok: /body\[cfg\.fields\.source\]\s*=\s*['"]callback-simulateur['"]/.test(callbackSrc),
  },
  {
    id: 'env_pipeline_simulateur',
    label: 'env.ts déclare PIPEDRIVE_PIPELINE_SIMULATEUR',
    ok: /PIPEDRIVE_PIPELINE_SIMULATEUR/.test(envSrc),
  },
  {
    id: 'devis_dlq_cron',
    label: 'cron pipedrive-retry existe (DLQ devis)',
    ok: existsSync(DEVIS_RETRY),
  },
  {
    id: 'simu_dlq_cron',
    label: 'cron simulateur-pipedrive-retry existe (DLQ simulateur, séparé)',
    ok: existsSync(SIMU_RETRY),
  },
]

const failures = checks.filter((c) => !c.ok)

const report = {
  backlog_item: 'P3-pipedrive-3-canaux',
  source_memory: 'servicesartisans-pipedrive-3-canaux',
  total_checks: checks.length,
  passed: checks.length - failures.length,
  failures: failures.map((f) => ({ id: f.id, label: f.label })),
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Pipedrive 3 Canaux Audit (DoD architecture funnel)\n')
  console.log(`  Patterns : ${checks.length}`)
  console.log(`  OK       : ${checks.length - failures.length}`)
  console.log(`  Échecs   : ${failures.length}`)
  for (const c of checks) {
    const icon = c.ok ? '✅' : '❌'
    console.log(`     ${icon}  [${c.id}] ${c.label}`)
  }
  if (failures.length === 0) {
    console.log('\n  ✅ Architecture Pipedrive 3 canaux préservée.\n')
  } else {
    console.log(`\n  ⚠️  ${failures.length} régression(s) — DoD non atteinte.\n`)
  }
}

if (strict && failures.length > 0) process.exit(1)
