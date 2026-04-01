/**
 * Risk-Based Agent Router v2
 *
 * Reads calibration.json for tunable thresholds.
 * Analyzes the PR diff to determine which agents are relevant.
 *
 * Usage: node risk-router.mjs <diff-file>
 * Output: JSON with { agents, risk_level, reason, skipped, context_summary }
 */

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const diffFile = process.argv[2]
if (!diffFile) {
  console.error('Usage: node risk-router.mjs <diff-file>')
  process.exit(1)
}

// ─── Load calibration ───────────────────────────────────────────────────────

const calibrationPath = join(__dirname, 'calibration.json')
let calibration = {
  risk_router_thresholds: {
    medium_min_score: 3,
    low_min_score: 5,
    large_diff_threshold: 500,
    medium_diff_threshold: 100,
    medium_files_threshold: 5,
  },
  critical_paths: { always_high: [] },
  known_false_positives: { patterns: [] },
}

if (existsSync(calibrationPath)) {
  try {
    calibration = JSON.parse(readFileSync(calibrationPath, 'utf8'))
  } catch (e) {
    console.error('Warning: could not parse calibration.json, using defaults')
  }
}

const thresholds = calibration.risk_router_thresholds
const criticalPathStrings = calibration.critical_paths?.always_high || []

// ─── Read diff ──────────────────────────────────────────────────────────────

const diff = readFileSync(diffFile, 'utf8')
const lines = diff.split('\n')

const changedFiles = []
for (const line of lines) {
  const match = line.match(/^diff --git a\/(.+?) b\//)
  if (match) changedFiles.push(match[1])
}

const diffSize = lines.length

// ─── Categorize changed files for context summary ───────────────────────────

const fileCategories = {
  api: changedFiles.filter(f => /src\/app\/api\//.test(f)),
  pages: changedFiles.filter(f => /page\.tsx$/.test(f)),
  components: changedFiles.filter(f => /src\/components\//.test(f)),
  lib: changedFiles.filter(f => /src\/lib\//.test(f)),
  migrations: changedFiles.filter(f => /supabase\/migrations/.test(f)),
  tests: changedFiles.filter(f => /\.test\./.test(f)),
  config: changedFiles.filter(f => /\.(json|yml|yaml|config\.)/.test(f)),
  other: [],
}
const categorized = new Set(Object.values(fileCategories).flat())
fileCategories.other = changedFiles.filter(f => !categorized.has(f))

// ─── Detection rules per agent ──────────────────────────────────────────────

const rules = {
  security: {
    filePatterns: [/src\/middleware/, /src\/app\/api\//, /src\/lib\/auth/, /src\/lib\/supabase/, /admin/, /\.env/],
    contentPatterns: [/createAdminClient/, /requirePermission/, /requireArtisan/, /dangerouslySetInnerHTML/, /service_role/, /SUPABASE_SERVICE_ROLE/, /redirect\(/, /router\.push/, /\.rpc\(/],
  },
  performance: {
    filePatterns: [/src\/app\/api\//, /src\/app\/.*page\.tsx/, /src\/app\/.*layout\.tsx/, /src\/lib\/supabase/, /src\/components\//],
    contentPatterns: [/\.from\(/, /\.select\(/, /revalidate/, /revalidatePath/, /use client/, /import.*lodash/, /import.*moment/],
  },
  accessibility: {
    filePatterns: [/\.tsx$/],
    contentPatterns: [/onClick/, /role=/, /aria-/, /<button/, /<dialog/, /<form/, /<input/, /<img/, /className.*fixed.*inset/],
  },
  'types-validation': {
    filePatterns: [/src\/app\/api\//, /src\/types\//, /src\/lib\/validation/, /\.test\./],
    contentPatterns: [/z\.object/, /z\.string/, /interface\s/, /type\s.*=/, /as\s+\w/, /: any/, /\.uuid\(/],
  },
  'ux-consistency': {
    filePatterns: [/src\/app\/\(private\)/, /src\/components\/artisan-dashboard/, /src\/components\/ui/],
    contentPatterns: [/ArtisanSidebar/, /loading/i, /Loader2/],
  },
  'data-integrity': {
    filePatterns: [/src\/app\/api\//, /supabase\/migrations/, /src\/lib\/supabase/],
    contentPatterns: [/\.from\(/, /\.select\(/, /\.eq\(/, /\.insert\(/, /\.update\(/, /\.delete\(/, /trust_score|trust_badge|is_premium|company_name/],
  },
  'mobile-responsive': {
    filePatterns: [/\.tsx$/],
    contentPatterns: [/w-\[/, /grid-cols/, /overflow/, /fixed\s/, /absolute\s/],
  },
  'error-handling': {
    filePatterns: [/src\/app\/api\//, /src\/app\/.*page\.tsx/, /src\/app\/.*error\.tsx/],
    contentPatterns: [/try\s*\{/, /catch/, /throw/, /async/, /fetch\(/, /useEffect/, /AbortController/],
  },
  seo: {
    filePatterns: [/src\/app\/sitemap/, /src\/app\/robots/, /src\/app\/\(public\)/, /src\/lib\/seo/, /src\/app\/api\/sitemap/, /src\/app\/api\/cron\/indexnow/],
    contentPatterns: [/noindex/, /canonical/, /meta.*description/i, /og:/, /json-ld/i, /escapeXml/],
  },
  'code-quality': {
    filePatterns: [/.*/],
    contentPatterns: [/console\.log/, /console\.error/, /TODO/, /FIXME/, /HACK/],
  },
}

// ─── Score agents ───────────────────────────────────────────────────────────

const agentScores = {}

for (const [agent, rule] of Object.entries(rules)) {
  let score = 0
  for (const file of changedFiles) {
    for (const pattern of rule.filePatterns) {
      if (pattern.test(file)) { score += 2; break }
    }
  }
  for (const pattern of rule.contentPatterns) {
    if (pattern.test(diff)) score += 1
  }
  agentScores[agent] = score
}

// ─── Determine risk level (from calibration thresholds) ─────────────────────

const criticalPatterns = criticalPathStrings.map(s => new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
const touchesCritical = changedFiles.some(f => criticalPatterns.some(p => p.test(f)))

let riskLevel
if (touchesCritical || diffSize > (thresholds.large_diff_threshold || 500)) {
  riskLevel = 'high'
} else if (diffSize > (thresholds.medium_diff_threshold || 100) || changedFiles.length > (thresholds.medium_files_threshold || 5)) {
  riskLevel = 'medium'
} else {
  riskLevel = 'low'
}

// ─── Select agents ──────────────────────────────────────────────────────────

let selectedAgents
const reasons = []

if (riskLevel === 'high') {
  selectedAgents = Object.entries(agentScores)
    .filter(([agent, score]) => score > 0 || agent === 'security')
    .map(([agent]) => agent)
  reasons.push(`High risk (${touchesCritical ? 'critical paths' : `${diffSize} lines`})`)
} else if (riskLevel === 'medium') {
  selectedAgents = Object.entries(agentScores)
    .filter(([, score]) => score >= (thresholds.medium_min_score || 3))
    .map(([agent]) => agent)
  reasons.push(`Medium risk (${changedFiles.length} files, ${diffSize} lines)`)
} else {
  selectedAgents = Object.entries(agentScores)
    .filter(([, score]) => score >= (thresholds.low_min_score || 5))
    .map(([agent]) => agent)
  reasons.push(`Low risk (${changedFiles.length} files, ${diffSize} lines)`)
}

// Always minimum: security + code-quality
if (!selectedAgents.includes('security')) selectedAgents.push('security')
if (!selectedAgents.includes('code-quality')) selectedAgents.push('code-quality')

// ─── Build context summary for agents ───────────────────────────────────────
// Compact summary of what changed, injected into each agent prompt

const contextLines = []
contextLines.push(`Risk: ${riskLevel} | ${changedFiles.length} files | ${diffSize} lines`)
if (fileCategories.api.length) contextLines.push(`API routes: ${fileCategories.api.length} (${fileCategories.api.slice(0, 5).join(', ')})`)
if (fileCategories.pages.length) contextLines.push(`Pages: ${fileCategories.pages.length} (${fileCategories.pages.slice(0, 5).join(', ')})`)
if (fileCategories.components.length) contextLines.push(`Components: ${fileCategories.components.length}`)
if (fileCategories.migrations.length) contextLines.push(`Migrations: ${fileCategories.migrations.length} — HIGH SENSITIVITY`)
if (fileCategories.lib.length) contextLines.push(`Lib: ${fileCategories.lib.length}`)
if (fileCategories.tests.length) contextLines.push(`Tests: ${fileCategories.tests.length}`)

const result = {
  agents: selectedAgents,
  risk_level: riskLevel,
  changed_files: changedFiles.length,
  diff_lines: diffSize,
  agent_scores: agentScores,
  reason: reasons.join('; '),
  skipped: Object.keys(rules).filter(a => !selectedAgents.includes(a)),
  context_summary: contextLines.join('\n'),
  file_categories: Object.fromEntries(
    Object.entries(fileCategories).filter(([, files]) => files.length > 0).map(([k, v]) => [k, v.length])
  ),
}

console.log(JSON.stringify(result, null, 2))
