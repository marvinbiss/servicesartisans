/**
 * Claude Code Review — Report Aggregator v5
 *
 * v5 improvements over v4:
 * - Decision model: learned blocking function replaces heuristic rules
 *   Falls back to rule-based scoring when <15 training samples
 * - Agent degradation: noisy agents (precision <70%) capped to P2-only
 * - All v4 features preserved (escalation, dedup, metrics)
 *
 * Usage: node aggregate-reports.mjs <reports-directory> [--skipped agent1,agent2]
 */

import { readFileSync, writeFileSync, readdirSync, statSync, appendFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { score as decisionScore, extractFeatures } from './decision-model.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

const reportsDir = process.argv[2]
if (!reportsDir) {
  console.error('Usage: node aggregate-reports.mjs <reports-dir> [--skipped agent1,agent2]')
  process.exit(1)
}

// Parse --skipped flag
const skippedIdx = process.argv.indexOf('--skipped')
const skippedAgents = skippedIdx >= 0 ? (process.argv[skippedIdx + 1] || '').split(',').filter(Boolean) : []

// ─── Load calibration ───────────────────────────────────────────────────────

const calibrationPath = join(__dirname, 'calibration.json')
let calibration = { severity_weights: { P0: 25, P1: 10, P2: 2 }, known_false_positives: { patterns: [] } }
if (existsSync(calibrationPath)) {
  try { calibration = JSON.parse(readFileSync(calibrationPath, 'utf8')) } catch {}
}
const weights = calibration.severity_weights || { P0: 25, P1: 10, P2: 2 }
const falsePositivePatterns = (calibration.known_false_positives?.patterns || []).map(p => new RegExp(p, 'i'))

// Per-agent calibration stats (rolling precision from annotate-review.mjs)
const agentStats = calibration.agent_stats || {}

// Business impact zones for severity escalation
const bizZones = calibration.business_impact_zones || {}
const criticalPatterns = (bizZones.critical?.patterns || []).map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
const highPatterns = (bizZones.high?.patterns || []).map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))

function getBusinessZone(filePath) {
  if (!filePath) return 'standard'
  if (criticalPatterns.some(p => filePath.includes(p))) return 'critical'
  if (highPatterns.some(p => filePath.includes(p))) return 'high'
  return 'standard'
}

function escalateSeverity(severity, zone) {
  if (zone === 'critical') {
    // P1 → P0, P2 → P1
    if (severity === 'P1') return 'P0'
    if (severity === 'P2') return 'P1'
  }
  if (zone === 'high') {
    // P2 → P1 only
    if (severity === 'P2') return 'P1'
  }
  return severity
}

// ─── Recursively find all JSON report files ─────────────────────────────────

function findReports(dir) {
  const results = []
  if (!existsSync(dir)) return results
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...findReports(full))
    } else if (entry.endsWith('.json')) {
      results.push(full)
    }
  }
  return results
}

// ─── Parse all reports ──────────────────────────────────────────────────────

const reportFiles = findReports(reportsDir)
const allFindings = []
const agentSummaries = []

for (const file of reportFiles) {
  try {
    const raw = readFileSync(file, 'utf8')
    const report = JSON.parse(raw)
    const agent = report.agent || file.replace(/.*claude-report-/, '').replace(/[\\/].*/, '')
    const findings = Array.isArray(report.findings) ? report.findings : []

    allFindings.push(...findings.map(f => ({ ...f, agent })))
    agentSummaries.push({
      agent,
      total: findings.length,
      p0: findings.filter(f => f.severity === 'P0').length,
      p1: findings.filter(f => f.severity === 'P1').length,
      p2: findings.filter(f => f.severity === 'P2').length,
      error: report.error || null,
    })
  } catch (e) {
    const agentName = file.replace(/.*claude-report-/, '').replace(/[\\/].*/, '')
    agentSummaries.push({
      agent: agentName,
      total: 0,
      p0: 0,
      p1: 0,
      p2: 0,
      error: `Parse error: ${e.message}`,
    })
  }
}

// ─── Filter known false positives ───────────────────────────────────────────

const beforeFilter = allFindings.length
for (let i = allFindings.length - 1; i >= 0; i--) {
  const f = allFindings[i]
  const searchText = `${f.title || ''} ${f.description || ''} ${f.file || ''}`
  if (falsePositivePatterns.some(p => p.test(searchText))) {
    allFindings.splice(i, 1)
  }
}
const suppressedCount = beforeFilter - allFindings.length

// ─── Semantic Deduplication ─────────────────────────────────────────────────
// Two findings are "same issue" if they reference the same file+line range
// or have very similar titles targeting the same file.

function normalizeTitle(title) {
  return (title || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim()
}

function isSameIssue(a, b) {
  // Same file + overlapping line range (within 5 lines)
  if (a.file && b.file && a.file === b.file) {
    if (a.line && b.line && Math.abs(a.line - b.line) <= 5) return true
  }

  // Same file + similar title (>60% word overlap)
  if (a.file && b.file && a.file === b.file) {
    const wordsA = new Set(normalizeTitle(a.title).split(' '))
    const wordsB = new Set(normalizeTitle(b.title).split(' '))
    const intersection = [...wordsA].filter(w => wordsB.has(w)).length
    const union = new Set([...wordsA, ...wordsB]).size
    if (union > 0 && intersection / union > 0.5) return true
  }

  // Very similar titles even across files (>80% match)
  const titleA = normalizeTitle(a.title)
  const titleB = normalizeTitle(b.title)
  if (titleA && titleB && titleA === titleB) return true

  return false
}

// Group duplicates
const dedupGroups = []
const assigned = new Set()

for (let i = 0; i < allFindings.length; i++) {
  if (assigned.has(i)) continue
  const group = [allFindings[i]]
  assigned.add(i)

  for (let j = i + 1; j < allFindings.length; j++) {
    if (assigned.has(j)) continue
    if (isSameIssue(allFindings[i], allFindings[j])) {
      group.push(allFindings[j])
      assigned.add(j)
    }
  }
  dedupGroups.push(group)
}

// Merge each group into a single finding with confidence
const dedupedFindings = dedupGroups.map(group => {
  // Take highest severity
  const severityOrder = { P0: 0, P1: 1, P2: 2 }
  group.sort((a, b) => (severityOrder[a.severity] || 9) - (severityOrder[b.severity] || 9))

  const primary = group[0]
  const agents = [...new Set(group.map(f => f.agent))]
  const confidence = agents.length >= 3 ? 'high' : agents.length === 2 ? 'medium' : 'single'

  return {
    ...primary,
    agents,
    confidence,
    duplicateCount: group.length,
  }
})

// ─── Business impact escalation ─────────────────────────────────────────────
// Escalate severity based on which files are touched.
// A P1 on auth code is a P0. A P2 on lead routing is a P1.

let escalatedCount = 0
for (const f of dedupedFindings) {
  const zone = getBusinessZone(f.file)
  const original = f.severity
  f.severity = escalateSeverity(f.severity, zone)
  if (f.severity !== original) {
    f.escalated_from = original
    f.escalation_zone = zone
    escalatedCount++
  }
}

// ─── Agent degradation (precision < 70% → cap findings at P2) ───────────
// A noisy agent's P0/P1 findings are demoted to P2 until its precision recovers.
// This prevents unreliable agents from blocking PRs.

let degradedCount = 0
for (const f of dedupedFindings) {
  // Only degrade single-agent findings (multi-agent agreement overrides)
  if (f.agents.length > 1) continue
  const agent = f.agents[0]
  const stats = agentStats[agent]
  if (stats && stats.degraded && stats.reviews_counted >= 5) {
    if (f.severity === 'P0' || f.severity === 'P1') {
      f.degraded_from = f.severity
      f.degraded_agent = agent
      f.severity = 'P2'
      degradedCount++
    }
  }
}

// ─── Compute totals ─────────────────────────────────────────────────────────

const totalP0 = dedupedFindings.filter(f => f.severity === 'P0').length
const totalP1 = dedupedFindings.filter(f => f.severity === 'P1').length
const totalP2 = dedupedFindings.filter(f => f.severity === 'P2').length
const totalFindings = dedupedFindings.length
const rawCount = allFindings.length
const deduped = rawCount - totalFindings
const activeAgents = agentSummaries.length

// ─── Confidence-based counts ────────────────────────────────────────────────

const confirmedP1 = dedupedFindings.filter(f =>
  f.severity === 'P1' && (f.confidence === 'medium' || f.confidence === 'high')
).length
const warningP1 = dedupedFindings.filter(f =>
  f.severity === 'P1' && f.confidence === 'single'
).length

// ─── Decision model (replaces heuristic rules) ─────────────────────────────
// Uses learned weights when trained on 15+ annotations.
// Falls back to rule-based logic otherwise.
// Hard override: P0 always blocks regardless of model output.

const criticalZoneHits = dedupedFindings.filter(f => f.escalation_zone === 'critical').length
const highZoneHits = dedupedFindings.filter(f => f.escalation_zone === 'high').length

// Compute average agent precision from stats
const agentPrecisions = Object.values(agentStats)
  .filter(s => s.rolling_precision !== null && s.reviews_counted >= 5)
  .map(s => s.rolling_precision / 100)
const avgAgentPrecision = agentPrecisions.length > 0
  ? agentPrecisions.reduce((a, b) => a + b, 0) / agentPrecisions.length
  : 0.75
const degradedAgentRatio = Object.values(agentStats).filter(s => s.degraded).length / Math.max(activeAgents, 1)

let hasBlockers
let decisionInfo

try {
  const decision = decisionScore({
    p0: totalP0,
    p1_confirmed: confirmedP1,
    p1_warning: warningP1,
    p2: totalP2,
    critical_zone_hits: criticalZoneHits,
    high_zone_hits: highZoneHits,
    diff_lines: parseInt(process.env.DIFF_LINES || '0', 10),
    agents_run: activeAgents,
    avg_agent_precision: avgAgentPrecision,
    degraded_agent_ratio: degradedAgentRatio,
  })

  // Hard override: P0 always blocks, regardless of model
  hasBlockers = totalP0 > 0 || decision.block
  decisionInfo = decision
} catch {
  // Fallback to rule-based if model fails
  hasBlockers = totalP0 > 0 || confirmedP1 > 0
  decisionInfo = { score: null, source: 'fallback (rule-based)' }
}

// ─── Build Markdown summary ─────────────────────────────────────────────────

let md = '# Claude Code Review\n\n'

if (hasBlockers) {
  const blockCount = totalP0 + confirmedP1
  md += `**${blockCount} blocking issue(s) found** — PR cannot merge.\n\n`
  if (warningP1 > 0) md += `*+ ${warningP1} P1 warning(s) from single agents (not blocking, review recommended)*\n\n`
} else if (totalFindings === 0) {
  md += `**No issues found** — ${activeAgents} agent(s) passed.\n\n`
} else {
  let parts = []
  if (warningP1 > 0) parts.push(`${warningP1} P1 warning(s)`)
  if (totalP2 > 0) parts.push(`${totalP2} suggestion(s)`)
  md += `**No blocking issues** — ${parts.join(', ') || 'clean'}.\n\n`
}

// Score (using calibration weights)
const score = Math.max(0, 100 - (totalP0 * (weights.P0 || 25)) - (confirmedP1 * (weights.P1 || 10)) - (warningP1 * 3) - (totalP2 * (weights.P2 || 2)))
md += `**Score: ${score}/100** | ${activeAgents} agents`
if (skippedAgents.length > 0) md += ` | ${skippedAgents.length} skipped`
if (deduped > 0) md += ` | ${deduped} merged`
if (suppressedCount > 0) md += ` | ${suppressedCount} suppressed`
if (escalatedCount > 0) md += ` | ${escalatedCount} escalated`
if (degradedCount > 0) md += ` | ${degradedCount} degraded`
if (decisionInfo.score !== null) md += ` | decision: ${decisionInfo.score} (${decisionInfo.source})`
md += '\n\n'

// Agent table
md += '| Agent | P0 | P1 | P2 | Total | Status |\n'
md += '|-------|----|----|----|----- |--------|\n'

agentSummaries.sort((a, b) => (b.p0 - a.p0) || (b.p1 - a.p1) || (b.p2 - a.p2))

for (const s of agentSummaries) {
  let status
  if (s.error) status = '!! error'
  else if (s.p0 > 0) status = 'BLOCKED'
  else if (s.p1 > 0) status = 'BLOCKED'
  else if (s.p2 > 0) status = 'suggestions'
  else status = 'clean'

  md += `| ${s.agent} | ${s.p0} | ${s.p1} | ${s.p2} | ${s.total} | ${status} |\n`
}

// Show skipped agents
if (skippedAgents.length > 0) {
  for (const agent of skippedAgents) {
    md += `| ${agent} | - | - | - | - | skipped |\n`
  }
}

// Detail P0 + confirmed P1 (blockers)
const blockers = dedupedFindings.filter(f =>
  f.severity === 'P0' || (f.severity === 'P1' && f.confidence !== 'single')
)
if (blockers.length > 0) {
  md += '\n## Blocking Issues\n\n'
  for (const f of blockers) {
    const escalateTag = f.escalated_from ? ` (escalated from ${f.escalated_from} — ${f.escalation_zone} zone)` : ''
    md += `### ${f.severity}: ${f.title}${escalateTag}\n`
    md += `**Agent${f.agents.length > 1 ? 's' : ''}:** ${f.agents.join(', ')} (confidence: ${f.confidence})`
    if (f.file) md += ` | **File:** \`${f.file}\``
    if (f.line) md += `:${f.line}`
    md += '\n\n'
    md += `${f.description}\n\n`
    if (f.suggestion) md += `**Fix:** ${f.suggestion}\n\n`
    if (f.fix_code) md += `\`\`\`\n${f.fix_code}\n\`\`\`\n\n`
    md += '---\n\n'
  }
}

// Detail single-agent P1 (warnings, not blocking)
const warnings = dedupedFindings.filter(f => f.severity === 'P1' && f.confidence === 'single')
if (warnings.length > 0) {
  md += `\n## Warnings (P1, single agent — review recommended)\n\n`
  for (const f of warnings) {
    md += `- **[${f.agents[0]}]** ${f.title}`
    if (f.file) md += ` (\`${f.file}\`)`
    md += `: ${f.description}`
    if (f.suggestion) md += ` — *Fix: ${f.suggestion}*`
    md += '\n'
  }
  md += '\n'
}

// P2 as collapsed section
const suggestions = dedupedFindings.filter(f => f.severity === 'P2')
if (suggestions.length > 0) {
  md += `\n<details><summary>${suggestions.length} suggestion(s) (P2)</summary>\n\n`
  for (const f of suggestions) {
    const agentTag = f.agents.length > 1 ? f.agents.join('+') : f.agents[0]
    md += `- **[${agentTag}]** ${f.title}`
    if (f.file) md += ` (\`${f.file}\`)`
    if (f.description) md += `: ${f.description}`
    md += '\n'
  }
  md += '\n</details>\n'
}

md += '\n---\n'
md += `*${activeAgents} agents | ${totalFindings} unique findings (${rawCount} raw, ${deduped} merged) | ${new Date().toISOString().slice(0, 10)}*\n`

// ─── Write summary ──────────────────────────────────────────────────────────

writeFileSync('/tmp/claude-summary.md', md)

// ─── Metrics tracking ───────────────────────────────────────────────────────
// Append to a metrics log file for precision/recall analysis over time.
// Format: JSONL (one JSON object per line)

const metricsEntry = {
  timestamp: new Date().toISOString(),
  pr: process.env.PR_NUMBER || 'unknown',
  repo: process.env.REPO || 'unknown',
  score,
  agents_run: activeAgents,
  agents_skipped: skippedAgents.length,
  raw_findings: rawCount,
  deduped_findings: totalFindings,
  duplicates_merged: deduped,
  suppressed: suppressedCount,
  escalated: escalatedCount,
  degraded: degradedCount,
  p0: totalP0,
  p1_confirmed: confirmedP1,
  p1_warning: warningP1,
  p2: totalP2,
  blocked: hasBlockers,
  decision_score: decisionInfo.score,
  decision_source: decisionInfo.source,
  critical_zone_hits: criticalZoneHits,
  high_zone_hits: highZoneHits,
  avg_agent_precision: Math.round(avgAgentPrecision * 100),
  // Fill manually after human review for calibration:
  // true_positives: null,
  // false_positives: null,
  // missed_in_prod: null,
}

// Write to /tmp for artifact upload
writeFileSync('/tmp/claude-metrics.jsonl', JSON.stringify(metricsEntry) + '\n')

// ─── GitHub Actions outputs ─────────────────────────────────────────────────

const outputFile = process.env.GITHUB_OUTPUT
if (outputFile) {
  appendFileSync(outputFile, `has_blockers=${hasBlockers}\n`)
  appendFileSync(outputFile, `score=${score}\n`)
  appendFileSync(outputFile, `total_findings=${totalFindings}\n`)
  appendFileSync(outputFile, `agents_run=${activeAgents}\n`)
  appendFileSync(outputFile, `duplicates_merged=${deduped}\n`)
}

// ─── Console summary ────────────────────────────────────────────────────────

console.log('========================================')
console.log('  Claude Code Review — Aggregated v4')
console.log('========================================')
console.log(`  Agents:        ${activeAgents} run, ${skippedAgents.length} skipped`)
console.log(`  Score:         ${score}/100`)
console.log(`  Raw findings:  ${rawCount}`)
console.log(`  Suppressed:    ${suppressedCount} (known false positives)`)
console.log(`  After dedup:   ${totalFindings} (${deduped} merged)`)
console.log(`  Escalated:     ${escalatedCount} (business impact zones)`)
console.log(`  Degraded:      ${degradedCount} (noisy agent → capped P2)`)
console.log(`  P0:            ${totalP0} (always block)`)
console.log(`  P1 confirmed:  ${confirmedP1} (2+ agents, blocks)`)
console.log(`  P1 warning:    ${warningP1} (single agent, does NOT block)`)
console.log(`  P2:            ${totalP2}`)
console.log(`  Decision:      ${hasBlockers ? 'BLOCKED' : 'PASS'}`)
console.log(`  Model score:   ${decisionInfo.score !== null ? decisionInfo.score : 'N/A'} (${decisionInfo.source})`)
console.log('========================================')
