/**
 * Decision Model — Feature-based blocking decision
 *
 * Replaces hardcoded heuristic rules with a learned scoring function.
 * Trained on historical PR annotations (calibration.json reviews[]).
 *
 * Two modes:
 *   1. score(features)   → blocking score 0–1 (used by aggregate-reports)
 *   2. train()           → recompute weights from historical data
 *
 * Features vector:
 *   [p0_count, p1_confirmed, p1_warning, p2_count, confidence_ratio,
 *    critical_zone_hits, high_zone_hits, diff_size_bucket, agent_count,
 *    avg_agent_precision, degraded_agent_ratio]
 *
 * The model is a simple logistic regression: block = sigmoid(w·x + b) > threshold
 * Weights are stored in calibration.json under decision_model.
 * When insufficient data (<15 annotated PRs), falls back to rule-based scoring.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const calibrationPath = join(__dirname, 'calibration.json')

// ─── Feature extraction ─────────────────────────────────────────────────────

/**
 * Extract feature vector from PR review data.
 * @param {object} pr - PR data with findings, agents, diff info
 * @returns {number[]} Feature vector (11 dimensions)
 */
export function extractFeatures(pr) {
  const p0 = pr.p0 || 0
  const p1Confirmed = pr.p1_confirmed || 0
  const p1Warning = pr.p1_warning || 0
  const p2 = pr.p2 || 0
  const totalFindings = p0 + p1Confirmed + p1Warning + p2

  // Confidence ratio: what fraction of findings are multi-agent confirmed
  const confidenceRatio = totalFindings > 0
    ? (p0 + p1Confirmed) / totalFindings
    : 0

  // Zone hits
  const criticalZoneHits = pr.critical_zone_hits || 0
  const highZoneHits = pr.high_zone_hits || 0

  // Diff size buckets: 0=small(<100), 1=medium(100-500), 2=large(>500)
  const diffLines = pr.diff_lines || 0
  const diffBucket = diffLines > 500 ? 2 : diffLines > 100 ? 1 : 0

  // Agent context
  const agentCount = pr.agents_run || 1
  const avgPrecision = pr.avg_agent_precision || 0.75 // default 75%
  const degradedRatio = pr.degraded_agent_ratio || 0

  return [
    p0,
    p1Confirmed,
    p1Warning,
    p2,
    confidenceRatio,
    criticalZoneHits,
    highZoneHits,
    diffBucket,
    agentCount,
    avgPrecision,
    degradedRatio,
  ]
}

// ─── Sigmoid + scoring ──────────────────────────────────────────────────────

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x))
}

function dot(a, b) {
  let sum = 0
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i]
  return sum
}

/**
 * Default weights (hand-tuned, used when <15 training samples).
 * These encode the existing rule-based logic as initial weights.
 */
const DEFAULT_WEIGHTS = {
  w: [
    4.0,   // p0 → strong block signal
    2.5,   // p1_confirmed → moderate block signal
    0.3,   // p1_warning → weak signal (single agent)
    0.05,  // p2 → negligible signal
    1.5,   // confidence_ratio → higher confidence → more likely to block
    2.0,   // critical_zone_hits → critical paths increase blocking
    1.0,   // high_zone_hits → revenue paths moderate increase
    0.2,   // diff_bucket → larger diffs slightly more likely to have issues
    -0.1,  // agent_count → more agents = more signal (slight negative = harder to block without consensus)
    -1.5,  // avg_agent_precision → higher precision → trust findings more (negative because high precision = lower threshold to block)
    -0.5,  // degraded_ratio → more degraded agents → less trust in findings
  ],
  b: -2.0, // bias: default lean toward not-blocking
  threshold: 0.5,
  trained_on: 0,
  version: 1,
}

/**
 * Score a PR's blocking probability.
 * @param {object} prData - PR review data
 * @returns {{ score: number, block: boolean, features: number[], source: string }}
 */
export function score(prData) {
  const calibration = loadCalibration()
  const model = calibration.decision_model || DEFAULT_WEIGHTS
  const features = extractFeatures(prData)

  const z = dot(model.w, features) + model.b
  const prob = sigmoid(z)
  const block = prob > (model.threshold || 0.5)

  return {
    score: Math.round(prob * 1000) / 1000,
    block,
    features,
    source: model.trained_on > 0 ? `trained (${model.trained_on} samples)` : 'default weights',
  }
}

// ─── Training (logistic regression via gradient descent) ────────────────────

/**
 * Train the decision model from historical annotations.
 * Each review needs: features + human_action (merged=0, fixed/dismissed=1)
 *
 * Returns updated weights or null if insufficient data.
 */
export function train() {
  const calibration = loadCalibration()
  const reviews = calibration.historical_metrics?.reviews || []

  // Need at least 15 annotated reviews with agent breakdown
  const usable = reviews.filter(r =>
    r.human_action && r.human_action !== 'unknown' &&
    (r.true_positives !== undefined || r.false_positives !== undefined)
  )

  if (usable.length < 15) {
    return {
      success: false,
      reason: `Need 15+ annotated reviews, have ${usable.length}`,
      model: DEFAULT_WEIGHTS,
    }
  }

  const lowConfidence = usable.length < 30

  // Build training set
  const X = []
  const y = []

  for (const review of usable) {
    const features = extractFeatures({
      p0: review.p0 || 0,
      p1_confirmed: review.p1_confirmed || 0,
      p1_warning: review.p1_warning || 0,
      p2: review.p2 || 0,
      critical_zone_hits: review.critical_zone_hits || 0,
      high_zone_hits: review.high_zone_hits || 0,
      diff_lines: review.diff_lines || 0,
      agents_run: review.agents_run || 1,
      avg_agent_precision: review.avg_agent_precision || 0.75,
      degraded_agent_ratio: review.degraded_agent_ratio || 0,
    })

    X.push(features)
    // Label: should this have been blocked?
    // fixed = pipeline was right to flag it (1)
    // merged = pipeline should not have blocked it (0)
    // dismissed = pipeline was wrong to flag it (0)
    y.push(review.human_action === 'fixed' ? 1 : 0)
  }

  // Mini-batch gradient descent
  const numFeatures = X[0].length
  const w = DEFAULT_WEIGHTS.w.slice() // start from defaults
  let b = DEFAULT_WEIGHTS.b
  const lr = 0.01
  const epochs = 500

  for (let epoch = 0; epoch < epochs; epoch++) {
    let gradW = new Array(numFeatures).fill(0)
    let gradB = 0

    for (let i = 0; i < X.length; i++) {
      const z = dot(w, X[i]) + b
      const pred = sigmoid(z)
      const err = pred - y[i]

      for (let j = 0; j < numFeatures; j++) {
        gradW[j] += err * X[i][j]
      }
      gradB += err
    }

    // Update with L2 regularization
    const lambda = 0.01
    for (let j = 0; j < numFeatures; j++) {
      w[j] -= lr * (gradW[j] / X.length + lambda * w[j])
    }
    b -= lr * (gradB / X.length)
  }

  // Find optimal threshold via F1 score on training data
  let bestThreshold = 0.5
  let bestF1 = 0

  for (let t = 0.3; t <= 0.8; t += 0.05) {
    let tp = 0, fp = 0, fn = 0
    for (let i = 0; i < X.length; i++) {
      const pred = sigmoid(dot(w, X[i]) + b) > t ? 1 : 0
      if (pred === 1 && y[i] === 1) tp++
      if (pred === 1 && y[i] === 0) fp++
      if (pred === 0 && y[i] === 1) fn++
    }
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0
    const f1 = precision + recall > 0 ? 2 * precision * recall / (precision + recall) : 0

    if (f1 > bestF1) {
      bestF1 = f1
      bestThreshold = Math.round(t * 100) / 100
    }
  }

  // When 15-30 samples: blend learned weights 50/50 with defaults
  // to dampen overfitting on small datasets
  const finalW = lowConfidence
    ? w.map((v, i) => (v + DEFAULT_WEIGHTS.w[i]) / 2)
    : w
  const finalB = lowConfidence ? (b + DEFAULT_WEIGHTS.b) / 2 : b

  const model = {
    w: finalW.map(v => Math.round(v * 1000) / 1000),
    b: Math.round(finalB * 1000) / 1000,
    threshold: bestThreshold,
    trained_on: usable.length,
    low_confidence: lowConfidence,
    f1_train: Math.round(bestF1 * 100) / 100,
    version: (calibration.decision_model?.version || 0) + 1,
    trained_at: new Date().toISOString().slice(0, 10),
  }

  // Save to calibration
  calibration.decision_model = model
  calibration.updated = new Date().toISOString().slice(0, 10)
  writeFileSync(calibrationPath, JSON.stringify(calibration, null, 2) + '\n')

  return { success: true, model }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function loadCalibration() {
  if (!existsSync(calibrationPath)) return {}
  try { return JSON.parse(readFileSync(calibrationPath, 'utf8')) } catch { return {} }
}

// ─── CLI interface ──────────────────────────────────────────────────────────

const isDirectRun = process.argv[1]?.includes('decision-model')
const command = isDirectRun ? process.argv[2] : null

if (command === 'train') {
  const result = train()
  console.log('========================================')
  console.log('  Decision Model Training')
  console.log('========================================')
  if (result.success) {
    console.log(`  Status:     trained${result.model.low_confidence ? ' (LOW CONFIDENCE — blended with defaults)' : ''}`)
    console.log(`  Samples:    ${result.model.trained_on}${result.model.low_confidence ? ' (need 30+ for full confidence)' : ''}`)
    console.log(`  F1 (train): ${result.model.f1_train}`)
    console.log(`  Threshold:  ${result.model.threshold}`)
    console.log(`  Version:    ${result.model.version}`)
    console.log(`  Weights:    ${result.model.w.join(', ')}`)
    console.log(`  Bias:       ${result.model.b}`)
  } else {
    console.log(`  Status:     ${result.reason}`)
    console.log(`  Using:      default weights`)
  }
  console.log('========================================')
} else if (command === 'score') {
  // Read PR data from file arg or stdin
  const inputFile = process.argv[3]
  let input
  if (inputFile) {
    input = readFileSync(inputFile, 'utf8')
  } else {
    // Read stdin (cross-platform)
    const chunks = []
    const stdin = process.stdin
    stdin.setEncoding('utf8')
    for await (const chunk of stdin) chunks.push(chunk)
    input = chunks.join('')
  }
  const prData = JSON.parse(input)
  const result = score(prData)
  console.log(JSON.stringify(result, null, 2))
} else if (command) {
  console.error('Usage: node decision-model.mjs [train|score]')
  console.error('  train  — retrain from calibration.json annotations')
  console.error('  score  — score PR data from stdin JSON')
  process.exit(1)
}
