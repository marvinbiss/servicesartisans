#!/usr/bin/env node
/**
 * scripts/audit-cluster-ahrefs-source.mjs
 * ----------------------------------------
 * Garde-fou règle Ahrefs-first SA 2026-05-04 (memory ahrefs-first-rule) :
 * chaque entrée de `src/lib/clusters/taxonomy.ts` doit porter
 * `ahrefsSourceDate` non vide, daté < 90 jours, et `primaryKw` non vide.
 *
 * Pourquoi : un seed sans audit Ahrefs traçable génère du contenu sur un
 * KW non vérifié -> page créée pour rien (volume 0, KD 100, perte token
 * + Critic budget). Le sprint Ralph 4 a déjà brûlé 138K tokens là-dessus
 * (memory ralph 43 burn).
 *
 * Audit :
 *   1. Toutes les entrées PILLAR_SEEDS + CLUSTER_SEEDS visibles
 *   2. ahrefsSourceDate ISO valide
 *   3. ahrefsSourceDate <= 90 jours (sinon WARN, > 180 = FAIL)
 *   4. primaryKw non vide, volumeMonthly > 0
 *
 * Usage :
 *   node scripts/audit-cluster-ahrefs-source.mjs             # human
 *   node scripts/audit-cluster-ahrefs-source.mjs --strict    # exit 1 sur FAIL
 *   node scripts/audit-cluster-ahrefs-source.mjs --json      # JSON output
 */

import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const taxonomyPath = path.join(__dirname, '..', 'src', 'lib', 'clusters', 'taxonomy.ts')
const taxonomyUrl = pathToFileURL(taxonomyPath).href

const STRICT = process.argv.includes('--strict')
const JSON_MODE = process.argv.includes('--json')

const WARN_AGE_DAYS = 90
const FAIL_AGE_DAYS = 180

const { tsImport } = await import('tsx/esm/api')
const taxonomy = await tsImport(taxonomyUrl, import.meta.url)
const { ALL_SEEDS } = taxonomy.default ?? taxonomy

const now = Date.now()
const issues = []
let warnCount = 0
let failCount = 0

for (const seed of ALL_SEEDS) {
  if (!seed.ahrefsSourceDate || !/^\d{4}-\d{2}-\d{2}$/.test(seed.ahrefsSourceDate)) {
    issues.push({
      slug: seed.slug,
      severity: 'fail',
      reason: `ahrefsSourceDate invalid: ${JSON.stringify(seed.ahrefsSourceDate)}`,
    })
    failCount += 1
    continue
  }
  if (!seed.primaryKw || seed.primaryKw.length < 3) {
    issues.push({
      slug: seed.slug,
      severity: 'fail',
      reason: `primaryKw missing or too short: ${JSON.stringify(seed.primaryKw)}`,
    })
    failCount += 1
    continue
  }
  if (!Number.isFinite(seed.volumeMonthly) || seed.volumeMonthly <= 0) {
    issues.push({
      slug: seed.slug,
      severity: 'fail',
      reason: `volumeMonthly <= 0 or non-numeric: ${seed.volumeMonthly}`,
    })
    failCount += 1
    continue
  }
  const ageDays = Math.floor((now - Date.parse(seed.ahrefsSourceDate)) / 86400000)
  if (ageDays > FAIL_AGE_DAYS) {
    issues.push({
      slug: seed.slug,
      severity: 'fail',
      reason: `ahrefsSourceDate ${seed.ahrefsSourceDate} too old (${ageDays}d > ${FAIL_AGE_DAYS})`,
    })
    failCount += 1
  } else if (ageDays > WARN_AGE_DAYS) {
    issues.push({
      slug: seed.slug,
      severity: 'warn',
      reason: `ahrefsSourceDate ${seed.ahrefsSourceDate} aging (${ageDays}d > ${WARN_AGE_DAYS})`,
    })
    warnCount += 1
  }
}

const summary = {
  totalSeeds: ALL_SEEDS.length,
  warnCount,
  failCount,
  issues,
}

if (JSON_MODE) {
  console.log(JSON.stringify(summary, null, 2))
} else {
  console.log(`Cluster Ahrefs source audit`)
  console.log(`  Seeds scannés : ${ALL_SEEDS.length}`)
  console.log(`  Warnings      : ${warnCount}`)
  console.log(`  Failures      : ${failCount}`)
  if (issues.length === 0) {
    console.log(`  Tous les seeds OK.`)
  } else {
    for (const i of issues) {
      const tag = i.severity === 'fail' ? '[FAIL]' : '[WARN]'
      console.log(`  ${tag} ${i.slug}: ${i.reason}`)
    }
  }
}

if (STRICT && failCount > 0) process.exit(1)
