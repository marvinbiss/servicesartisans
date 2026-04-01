/**
 * Claude Code Review — Report Aggregator
 *
 * Reads JSON reports from 10 specialized agents, merges findings,
 * generates a Markdown summary, and sets GitHub Actions outputs.
 *
 * Usage: node aggregate-reports.mjs <reports-directory>
 */

import { readFileSync, writeFileSync, readdirSync, statSync, appendFileSync } from 'fs'
import { join } from 'path'

const reportsDir = process.argv[2]
if (!reportsDir) {
  console.error('Usage: node aggregate-reports.mjs <reports-dir>')
  process.exit(1)
}

// ─── Recursively find all JSON report files ─────────────────────────────────

function findReports(dir) {
  const results = []
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

// ─── Compute totals ─────────────────────────────────────────────────────────

const totalP0 = allFindings.filter(f => f.severity === 'P0').length
const totalP1 = allFindings.filter(f => f.severity === 'P1').length
const totalP2 = allFindings.filter(f => f.severity === 'P2').length
const totalFindings = allFindings.length
const hasBlockers = totalP0 > 0 || totalP1 > 0

// ─── Build Markdown summary ─────────────────────────────────────────────────

let md = '# Claude Code Review\n\n'

if (hasBlockers) {
  md += `**${totalP0 + totalP1} blocking issue(s) found** — PR cannot merge.\n\n`
} else if (totalFindings === 0) {
  md += '**No issues found** — all 10 agents passed.\n\n'
} else {
  md += `**No blocking issues** — ${totalP2} minor suggestion(s).\n\n`
}

// Score
const score = Math.max(0, 100 - (totalP0 * 25) - (totalP1 * 10) - (totalP2 * 2))
md += `**Score: ${score}/100**\n\n`

// Agent table
md += '| Agent | P0 | P1 | P2 | Total | Status |\n'
md += '|-------|----|----|----|----- |--------|\n'

// Sort: errors first, then by severity
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

// Detail blocking findings (P0 + P1)
const blockers = allFindings.filter(f => f.severity === 'P0' || f.severity === 'P1')
if (blockers.length > 0) {
  md += '\n## Blocking Issues\n\n'

  // P0 first
  const p0s = blockers.filter(f => f.severity === 'P0')
  const p1s = blockers.filter(f => f.severity === 'P1')

  for (const f of [...p0s, ...p1s]) {
    md += `### ${f.severity}: ${f.title}\n`
    md += `**Agent:** ${f.agent}`
    if (f.file) md += ` | **File:** \`${f.file}\``
    if (f.line) md += `:${f.line}`
    md += '\n\n'
    md += `${f.description}\n\n`
    if (f.suggestion) md += `**Fix:** ${f.suggestion}\n\n`
    md += '---\n\n'
  }
}

// P2 as collapsed section
const suggestions = allFindings.filter(f => f.severity === 'P2')
if (suggestions.length > 0) {
  md += `\n<details><summary>${suggestions.length} suggestion(s) (P2)</summary>\n\n`
  for (const f of suggestions) {
    md += `- **[${f.agent}]** ${f.title}`
    if (f.file) md += ` (\`${f.file}\`)`
    if (f.description) md += `: ${f.description}`
    md += '\n'
  }
  md += '\n</details>\n'
}

md += '\n---\n'
md += `*10 agents | ${totalFindings} findings | ${new Date().toISOString().slice(0, 10)} | Powered by Claude Code CLI*\n`

// ─── Write outputs ──────────────────────────────────────────────────────────

writeFileSync('/tmp/claude-summary.md', md)

// GitHub Actions output
const outputFile = process.env.GITHUB_OUTPUT
if (outputFile) {
  appendFileSync(outputFile, `has_blockers=${hasBlockers}\n`)
  appendFileSync(outputFile, `score=${score}\n`)
  appendFileSync(outputFile, `total_findings=${totalFindings}\n`)
}

// Console summary
console.log('========================================')
console.log('  Claude Code Review — Aggregated')
console.log('========================================')
console.log(`  Agents:   ${reportFiles.length}/10`)
console.log(`  Score:    ${score}/100`)
console.log(`  P0:       ${totalP0}`)
console.log(`  P1:       ${totalP1}`)
console.log(`  P2:       ${totalP2}`)
console.log(`  Blockers: ${hasBlockers ? 'YES — PR BLOCKED' : 'none'}`)
console.log('========================================')
