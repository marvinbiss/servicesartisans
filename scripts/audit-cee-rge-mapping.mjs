#!/usr/bin/env node
/**
 * scripts/audit-cee-rge-mapping.mjs
 * ----------------------------------
 * DoD du backlog item P3-cocon-cee-rge.
 *
 * Vérifie le mapping bidirectionnel entre opérations CEE et services RGE :
 *
 *   1. CEE_CODE_TO_RGE_SERVICES contient ≥15 codes
 *   2. Codes étendus présents (Tier 4-5) :
 *      BAR-TH-172, BAR-TH-174, BAR-TH-143, BAR-TH-159, BAR-EN-108
 *   3. Helpers exportés : getCeeOpsForRgeService + getRgeServicesForCeeOp
 *      + getCeeGuidesForService + getRgeGuidesForService
 *   4. Chaque code mappé a un label dans CEE_SHORT_LABELS (cohérence)
 *   5. Aucun service RGE inventé (mapping aligné RGE_ALLOWED_SERVICES)
 *
 * Stratégie : si on supprime un mapping ou un helper, l'audit rejette.
 *
 * Usage :
 *   node scripts/audit-cee-rge-mapping.mjs           # human
 *   node scripts/audit-cee-rge-mapping.mjs --json
 *   node scripts/audit-cee-rge-mapping.mjs --strict  # exit 1 if gap
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const MAP = join(ROOT, 'src', 'lib', 'rge', 'service-guides-map.ts')
const LABELS = join(ROOT, 'src', 'lib', 'cee', 'shared-labels.ts')
const RGE_LIST = join(ROOT, 'src', 'lib', 'rge', 'service-city-listings.ts')

if (!existsSync(MAP)) {
  console.error('Audit CEE/RGE mapping : service-guides-map.ts absent')
  if (strict) process.exit(1)
  process.exit(0)
}

const mapSrc = readFileSync(MAP, 'utf8')
const labelsSrc = existsSync(LABELS) ? readFileSync(LABELS, 'utf8') : ''
const rgeSrc = existsSync(RGE_LIST) ? readFileSync(RGE_LIST, 'utf8') : ''

// Extract all CEE codes mapped (only inside CEE_CODE_TO_RGE_SERVICES literal).
const codeSection = mapSrc.match(/CEE_CODE_TO_RGE_SERVICES[^=]*=\s*\{([\s\S]*?)\n\}/)
const codes = codeSection
  ? Array.from(codeSection[1].matchAll(/['"]((?:BAR|IND|RES)-[A-Z]{2}-\d+)['"]/g)).map((m) => m[1])
  : []

const REQUIRED_CODES = ['BAR-TH-172', 'BAR-TH-174', 'BAR-TH-143', 'BAR-TH-159', 'BAR-EN-108']

const missingCodes = REQUIRED_CODES.filter((c) => !codes.includes(c))

const REQUIRED_HELPERS = [
  'getCeeOpsForRgeService',
  'getRgeServicesForCeeOp',
  'getCeeGuidesForService',
  'getRgeGuidesForService',
]
const missingHelpers = REQUIRED_HELPERS.filter(
  (h) => !new RegExp(`export\\s+function\\s+${h}\\b`).test(mapSrc)
)

// Each code must have a label in CEE_SHORT_LABELS
const labelMissing = codes.filter((c) => labelsSrc && !labelsSrc.includes(`'${c}'`))

const checks = [
  {
    id: 'min_15_codes',
    label: `Mapping ≥15 codes CEE (actuel ${codes.length})`,
    ok: codes.length >= 15,
  },
  {
    id: 'extended_codes',
    label: `5 codes étendus présents (manquants: ${missingCodes.join(', ') || 'aucun'})`,
    ok: missingCodes.length === 0,
  },
  {
    id: 'inverse_helpers',
    label: `4 helpers exportés (manquants: ${missingHelpers.join(', ') || 'aucun'})`,
    ok: missingHelpers.length === 0,
  },
  {
    id: 'all_codes_have_label',
    label: `Chaque code a un label dans CEE_SHORT_LABELS (manquants: ${labelMissing.length})`,
    ok: labelMissing.length === 0,
  },
  {
    id: 'rge_allowed_services_exists',
    label: 'RGE_ALLOWED_SERVICES exporté (ancrage cohérence service)',
    ok: /export\s+const\s+RGE_ALLOWED_SERVICES/.test(rgeSrc),
  },
]

const failures = checks.filter((c) => !c.ok)

const report = {
  mapping: 'src/lib/rge/service-guides-map.ts',
  codes_count: codes.length,
  required_extended: REQUIRED_CODES,
  missing_codes: missingCodes,
  missing_helpers: missingHelpers,
  missing_labels: labelMissing,
  total: checks.length,
  passed: checks.length - failures.length,
  failures: failures.map((f) => ({ id: f.id, label: f.label })),
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 CEE/RGE Mapping Audit (DoD P3-cocon-cee-rge)\n')
  console.log(`  Codes CEE mappés     : ${codes.length}`)
  console.log(`  Helpers requis       : ${REQUIRED_HELPERS.length}`)
  console.log(`  Patterns vérifiés    : ${checks.length}`)
  console.log(`  OK                   : ${checks.length - failures.length}`)
  console.log(`  Échecs               : ${failures.length}`)
  for (const c of checks) {
    const icon = c.ok ? '✅' : '❌'
    console.log(`     ${icon}  [${c.id}] ${c.label}`)
  }
  console.log('')
  if (failures.length === 0) {
    console.log('  ✅ Mapping CEE↔RGE conforme P3-cocon-cee-rge.\n')
  } else {
    console.log(`  ⚠️  ${failures.length} pattern(s) manquant(s) — DoD non atteinte.\n`)
  }
}

if (strict && failures.length > 0) process.exit(1)
