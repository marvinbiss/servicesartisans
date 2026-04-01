/**
 * Claude Code Review — Report Aggregator v3
 *
 * v3 improvements:
 * - Confidence-based blocking: P1 from single agent = WARNING (not blocker)
 *   Only P0 (any confidence) or P1 with confidence >= medium (2+ agents) block
 * - Reads calibration.json for severity weights + false positive suppression
 * - Semantic deduplication with cross-agent confidence scoring
 * - Metrics tracking (JSONL) for precision/recall analysis
 *
 * Usage: node aggregate-reports.mjs <reports-directory> [--skipped agent1,agent2]
 */

import { readFileSync, writeFileSync, readdirSync, statSync, appendFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

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

// ─── Compute totals ─────────────────────────────────────────────────────────

const totalP0 = dedupedFindings.filter(f => f.severity === 'P0').length
const totalP1 = dedupedFindings.filter(f => f.severity === 'P1').length
const totalP2 = dedupedFindings.filter(f => f.severity === 'P2').length
const totalFindings = dedupedFindings.length
const rawCount = allFindings.length
const deduped = rawCount - totalFindings
const activeAgents = agentSummaries.length

// ─── Confidence-based blocking ──────────────────────────────────────────────
// P0: ALWAYS blocks (any confidence)
// P1 with confidence medium/high (2+ agents agree): blocks
// P1 with confidence single (1 agent only): WARNING, does NOT block
// P2: never blocks
//
// This dramatically reduces false positive blocking rate. A single agent
// claiming P1 is often noise. Two agents agreeing is a real signal.

const confirmedP1 = dedupedFindings.filter(f =>
  f.severity === 'P1' && (f.confidence === 'medium' || f.confidence === 'high')
).length
const warningP1 = dedupedFindings.filter(f =>
  f.severity === 'P1' && f.confidence === 'single'
).length
const hasBlockers = totalP0 > 0 || confirmedP1 > 0

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
    md += `### ${f.severity}: ${f.title}\n`
    md += `**Agent${f.agents.length > 1 ? 's' : ''}:** ${f.agents.join(', ')} (confidence: ${f.confidence})`
    if (f.file) md += ` | **File:** \`${f.file}\``
    if (f.line) md += `:${f.line}`
    md += '\n\n'
    md += `${f.description}\n\n`
    if (f.suggestion) md += `**Fix:** ${f.suggestion}\n\n`
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
  p0: totalP0,
  p1_confirmed: confirmedP1,
  p1_warning: warningP1,
  p2: totalP2,
  blocked: hasBlockers,
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
console.log('  Claude Code Review — Aggregated v3')
console.log('========================================')
console.log(`  Agents:        ${activeAgents} run, ${skippedAgents.length} skipped`)
console.log(`  Score:         ${score}/100`)
console.log(`  Raw findings:  ${rawCount}`)
console.log(`  Suppressed:    ${suppressedCount} (known false positives)`)
console.log(`  After dedup:   ${totalFindings} (${deduped} merged)`)
console.log(`  P0:            ${totalP0} (always block)`)
console.log(`  P1 confirmed:  ${confirmedP1} (2+ agents, blocks)`)
console.log(`  P1 warning:    ${warningP1} (single agent, does NOT block)`)
console.log(`  P2:            ${totalP2}`)
console.log(`  Decision:      ${hasBlockers ? 'BLOCKED' : 'PASS'}`)
console.log('========================================')
