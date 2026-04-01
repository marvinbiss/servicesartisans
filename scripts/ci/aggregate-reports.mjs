/**
 * Claude Code Review — Report Aggregator v2
 *
 * Improvements over v1:
 * - Semantic deduplication: merges findings from multiple agents about the same issue
 * - Confidence scoring: findings reported by multiple agents get higher confidence
 * - Metrics tracking: appends results to metrics log for precision/recall analysis
 * - Skipped agents awareness: shows which agents were skipped by risk router
 *
 * Usage: node aggregate-reports.mjs <reports-directory> [--skipped agent1,agent2]
 */

import { readFileSync, writeFileSync, readdirSync, statSync, appendFileSync, existsSync } from 'fs'
import { join } from 'path'

const reportsDir = process.argv[2]
if (!reportsDir) {
  console.error('Usage: node aggregate-reports.mjs <reports-dir> [--skipped agent1,agent2]')
  process.exit(1)
}

// Parse --skipped flag
const skippedIdx = process.argv.indexOf('--skipped')
const skippedAgents = skippedIdx >= 0 ? (process.argv[skippedIdx + 1] || '').split(',').filter(Boolean) : []

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
const hasBlockers = totalP0 > 0 || totalP1 > 0
const activeAgents = agentSummaries.length

// ─── Build Markdown summary ─────────────────────────────────────────────────

let md = '# Claude Code Review\n\n'

if (hasBlockers) {
  md += `**${totalP0 + totalP1} blocking issue(s) found** — PR cannot merge.\n\n`
} else if (totalFindings === 0) {
  md += `**No issues found** — ${activeAgents} agent(s) passed.\n\n`
} else {
  md += `**No blocking issues** — ${totalP2} suggestion(s).\n\n`
}

// Score
const score = Math.max(0, 100 - (totalP0 * 25) - (totalP1 * 10) - (totalP2 * 2))
md += `**Score: ${score}/100** | ${activeAgents} agents`
if (skippedAgents.length > 0) md += ` | ${skippedAgents.length} skipped (risk-based)`
if (deduped > 0) md += ` | ${deduped} duplicates merged`
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

// Detail blocking findings (P0 + P1) — deduplicated
const blockers = dedupedFindings.filter(f => f.severity === 'P0' || f.severity === 'P1')
if (blockers.length > 0) {
  md += '\n## Blocking Issues\n\n'

  const p0s = blockers.filter(f => f.severity === 'P0')
  const p1s = blockers.filter(f => f.severity === 'P1')

  for (const f of [...p0s, ...p1s]) {
    md += `### ${f.severity}: ${f.title}\n`
    md += `**Agent${f.agents.length > 1 ? 's' : ''}:** ${f.agents.join(', ')}`
    if (f.confidence !== 'single') md += ` (confidence: ${f.confidence})`
    if (f.file) md += ` | **File:** \`${f.file}\``
    if (f.line) md += `:${f.line}`
    md += '\n\n'
    md += `${f.description}\n\n`
    if (f.suggestion) md += `**Fix:** ${f.suggestion}\n\n`
    md += '---\n\n'
  }
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
  p0: totalP0,
  p1: totalP1,
  p2: totalP2,
  blocked: hasBlockers,
  // These fields are filled manually after human review:
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
console.log('  Claude Code Review — Aggregated v2')
console.log('========================================')
console.log(`  Agents run:    ${activeAgents}`)
console.log(`  Agents skipped:${skippedAgents.length} (${skippedAgents.join(', ') || 'none'})`)
console.log(`  Score:         ${score}/100`)
console.log(`  Raw findings:  ${rawCount}`)
console.log(`  After dedup:   ${totalFindings} (${deduped} merged)`)
console.log(`  P0:            ${totalP0}`)
console.log(`  P1:            ${totalP1}`)
console.log(`  P2:            ${totalP2}`)
console.log(`  Blockers:      ${hasBlockers ? 'YES — PR BLOCKED' : 'none'}`)
console.log('========================================')
