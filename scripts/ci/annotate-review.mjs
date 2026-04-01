/**
 * Review Annotation Tool
 *
 * After a human reviews a PR that went through the pipeline,
 * run this to record precision data for calibration.
 *
 * Usage:
 *   node annotate-review.mjs --pr 42 --tp 5 --fp 2 --missed 0 --action merged
 *
 * Options:
 *   --pr       PR number
 *   --tp       True positives (findings that were real issues)
 *   --fp       False positives (findings that were noise)
 *   --missed   Issues found in prod that pipeline missed
 *   --action   What happened: merged, fixed, dismissed
 *
 * This appends to calibration.json.historical_metrics.reviews[]
 * and prints rolling agent precision if enough data exists.
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function getArg(name) {
  const idx = process.argv.indexOf(`--${name}`)
  return idx >= 0 ? process.argv[idx + 1] : null
}

const pr = getArg('pr')
const tp = parseInt(getArg('tp') || '0', 10)
const fp = parseInt(getArg('fp') || '0', 10)
const missed = parseInt(getArg('missed') || '0', 10)
const action = getArg('action') || 'unknown'

if (!pr) {
  console.error('Usage: node annotate-review.mjs --pr <number> --tp <n> --fp <n> --missed <n> --action <merged|fixed|dismissed>')
  process.exit(1)
}

// ─── Load calibration ───────────────────────────────────────────────────────

const calibrationPath = join(__dirname, 'calibration.json')
const calibration = JSON.parse(readFileSync(calibrationPath, 'utf8'))

if (!calibration.historical_metrics) {
  calibration.historical_metrics = { reviews: [] }
}

// ─── Append review ──────────────────────────────────────────────────────────

const entry = {
  pr: parseInt(pr, 10),
  date: new Date().toISOString().slice(0, 10),
  true_positives: tp,
  false_positives: fp,
  missed_in_prod: missed,
  human_action: action,
  precision: tp + fp > 0 ? Math.round((tp / (tp + fp)) * 100) : null,
}

calibration.historical_metrics.reviews.push(entry)

// ─── Calculate rolling stats ────────────────────────────────────────────────

const reviews = calibration.historical_metrics.reviews
const recentReviews = reviews.slice(-30) // Last 30 PRs

const totalTP = recentReviews.reduce((s, r) => s + (r.true_positives || 0), 0)
const totalFP = recentReviews.reduce((s, r) => s + (r.false_positives || 0), 0)
const totalMissed = recentReviews.reduce((s, r) => s + (r.missed_in_prod || 0), 0)
const rollingPrecision = totalTP + totalFP > 0 ? Math.round((totalTP / (totalTP + totalFP)) * 100) : null
const rollingRecall = totalTP + totalMissed > 0 ? Math.round((totalTP / (totalTP + totalMissed)) * 100) : null

// ─── Save ───────────────────────────────────────────────────────────────────

calibration.updated = new Date().toISOString().slice(0, 10)
writeFileSync(calibrationPath, JSON.stringify(calibration, null, 2) + '\n')

// ─── Report ─────────────────────────────────────────────────────────────────

console.log('========================================')
console.log('  Review Annotation Saved')
console.log('========================================')
console.log(`  PR:              #${pr}`)
console.log(`  True positives:  ${tp}`)
console.log(`  False positives: ${fp}`)
console.log(`  Missed in prod:  ${missed}`)
console.log(`  PR precision:    ${entry.precision !== null ? entry.precision + '%' : 'N/A'}`)
console.log(`  Human action:    ${action}`)
console.log('')
console.log(`  --- Rolling stats (last ${recentReviews.length} PRs) ---`)
console.log(`  Precision:       ${rollingPrecision !== null ? rollingPrecision + '%' : 'not enough data'}`)
console.log(`  Recall:          ${rollingRecall !== null ? rollingRecall + '%' : 'not enough data'}`)
console.log(`  Total reviews:   ${reviews.length}`)
console.log('========================================')

// ─── Suggest calibration adjustments ────────────────────────────────────────

if (recentReviews.length >= 10) {
  console.log('')
  if (rollingPrecision !== null && rollingPrecision < 70) {
    console.log('  ⚠ Precision below 70% — consider:')
    console.log('    - Adding patterns to known_false_positives')
    console.log('    - Raising risk_router_thresholds')
    console.log('    - Reviewing agent prompts for over-sensitivity')
  }
  if (rollingRecall !== null && rollingRecall < 70) {
    console.log('  ⚠ Recall below 70% — consider:')
    console.log('    - Lowering risk_router_thresholds (more agents)')
    console.log('    - Adding business_impact_zones patterns')
    console.log('    - Adding smoke tests for missed categories')
  }
  if (rollingPrecision !== null && rollingPrecision >= 85 && rollingRecall !== null && rollingRecall >= 80) {
    console.log('  ✓ Pipeline performing well (precision ≥85%, recall ≥80%)')
  }
}
