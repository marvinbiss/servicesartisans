/**
 * Risk-Based Agent Router
 *
 * Analyzes the PR diff to determine which agents are relevant.
 * Instead of running all 10 agents on every PR, only triggers agents
 * whose surface area is touched by the changes.
 *
 * Usage: node risk-router.mjs <diff-file>
 * Output: JSON with { agents: string[], risk_level: "low"|"medium"|"high", reason: string }
 */

import { readFileSync } from 'fs'

const diffFile = process.argv[2]
if (!diffFile) {
  console.error('Usage: node risk-router.mjs <diff-file>')
  process.exit(1)
}

const diff = readFileSync(diffFile, 'utf8')
const lines = diff.split('\n')

// ─── Extract changed files from diff ────────────────────────────────────────

const changedFiles = []
for (const line of lines) {
  const match = line.match(/^diff --git a\/(.+?) b\//)
  if (match) changedFiles.push(match[1])
}

const diffLower = diff.toLowerCase()
const diffSize = lines.length

// ─── Define detection rules per agent ───────────────────────────────────────

const rules = {
  security: {
    // Always run on: auth, middleware, API routes, admin, env files
    filePatterns: [
      /src\/middleware/,
      /src\/app\/api\//,
      /src\/lib\/auth/,
      /src\/lib\/supabase/,
      /admin/,
      /\.env/,
    ],
    contentPatterns: [
      /createAdminClient/,
      /requirePermission/,
      /requireArtisan/,
      /dangerouslySetInnerHTML/,
      /service_role/,
      /SUPABASE_SERVICE_ROLE/,
      /redirect\(/,
      /router\.push/,
      /\.rpc\(/,
    ],
    alwaysOnRiskLevel: 'high',
  },

  performance: {
    filePatterns: [
      /src\/app\/api\//,
      /src\/app\/.*page\.tsx/,
      /src\/app\/.*layout\.tsx/,
      /src\/lib\/supabase/,
      /src\/components\//,
    ],
    contentPatterns: [
      /\.from\(/,
      /\.select\(/,
      /revalidate/,
      /revalidatePath/,
      /use client/,
      /import.*lodash/,
      /import.*moment/,
    ],
    alwaysOnRiskLevel: 'high',
  },

  accessibility: {
    filePatterns: [
      /\.tsx$/,
    ],
    contentPatterns: [
      /onClick/,
      /role=/,
      /aria-/,
      /<button/,
      /<dialog/,
      /<modal/,
      /<form/,
      /<input/,
      /<img/,
      /className.*fixed.*inset/,
    ],
    alwaysOnRiskLevel: null, // Only when UI changes
  },

  'types-validation': {
    filePatterns: [
      /src\/app\/api\//,
      /src\/types\//,
      /src\/lib\/validation/,
      /\.test\./,
    ],
    contentPatterns: [
      /z\.object/,
      /z\.string/,
      /interface\s/,
      /type\s.*=/,
      /as\s+\w/,
      /: any/,
      /\.uuid\(/,
    ],
    alwaysOnRiskLevel: null,
  },

  'ux-consistency': {
    filePatterns: [
      /src\/app\/\(private\)/,
      /src\/components\/artisan-dashboard/,
      /src\/components\/ui/,
    ],
    contentPatterns: [
      /ArtisanSidebar/,
      /loading/i,
      /error/i,
      /empty/i,
      /Loader2/,
    ],
    alwaysOnRiskLevel: null,
  },

  'data-integrity': {
    filePatterns: [
      /src\/app\/api\//,
      /supabase\/migrations/,
      /src\/lib\/supabase/,
    ],
    contentPatterns: [
      /\.from\(/,
      /\.select\(/,
      /\.eq\(/,
      /\.insert\(/,
      /\.update\(/,
      /\.delete\(/,
      /trust_score|trust_badge|is_premium|company_name/,
      /hourly_rate_min|hourly_rate_max|emergency_available/,
    ],
    alwaysOnRiskLevel: null,
  },

  'mobile-responsive': {
    filePatterns: [
      /\.tsx$/,
    ],
    contentPatterns: [
      /className/,
      /w-\[/,
      /grid-cols/,
      /flex/,
      /overflow/,
      /fixed/,
      /absolute/,
    ],
    alwaysOnRiskLevel: null,
  },

  'error-handling': {
    filePatterns: [
      /src\/app\/api\//,
      /src\/app\/.*page\.tsx/,
      /src\/app\/.*error\.tsx/,
    ],
    contentPatterns: [
      /try\s*\{/,
      /catch/,
      /\.catch\(/,
      /throw/,
      /Promise/,
      /async/,
      /fetch\(/,
      /useEffect/,
      /AbortController/,
    ],
    alwaysOnRiskLevel: null,
  },

  seo: {
    filePatterns: [
      /src\/app\/sitemap/,
      /src\/app\/robots/,
      /src\/app\/\(public\)/,
      /src\/lib\/seo/,
      /src\/app\/api\/sitemap/,
      /src\/app\/api\/cron\/indexnow/,
      /src\/app\/api\/cron\/sitemap/,
    ],
    contentPatterns: [
      /noindex/,
      /canonical/,
      /meta.*description/i,
      /og:/,
      /json-ld/i,
      /structured.*data/i,
      /escapeXml/,
    ],
    alwaysOnRiskLevel: null,
  },

  'code-quality': {
    // Always run — catches general issues
    filePatterns: [/.*/],
    contentPatterns: [
      /console\.log/,
      /console\.error/,
      /TODO/,
      /FIXME/,
      /HACK/,
    ],
    alwaysOnRiskLevel: null,
  },
}

// ─── Score each agent's relevance ───────────────────────────────────────────

const agentScores = {}

for (const [agent, rule] of Object.entries(rules)) {
  let score = 0

  // File pattern matches
  for (const file of changedFiles) {
    for (const pattern of rule.filePatterns) {
      if (pattern.test(file)) {
        score += 2
        break // One match per file is enough
      }
    }
  }

  // Content pattern matches (check diff content)
  for (const pattern of rule.contentPatterns) {
    if (pattern.test(diff)) {
      score += 1
    }
  }

  agentScores[agent] = score
}

// ─── Determine risk level ───────────────────────────────────────────────────

// Critical paths that force high risk
const criticalPaths = [
  /src\/middleware/,
  /src\/lib\/auth/,
  /src\/lib\/supabase\/admin/,
  /supabase\/migrations/,
  /src\/app\/api\/admin/,
  /\.env/,
]

const touchesCritical = changedFiles.some(f =>
  criticalPaths.some(p => p.test(f))
)

let riskLevel
if (touchesCritical || diffSize > 500) {
  riskLevel = 'high'
} else if (diffSize > 100 || changedFiles.length > 5) {
  riskLevel = 'medium'
} else {
  riskLevel = 'low'
}

// ─── Select agents based on risk level and scores ───────────────────────────

let selectedAgents
const reasons = []

if (riskLevel === 'high') {
  // High risk: run all agents that have any relevance (score > 0)
  // Plus always include security
  selectedAgents = Object.entries(agentScores)
    .filter(([agent, score]) => score > 0 || agent === 'security')
    .map(([agent]) => agent)
  reasons.push(`High risk (${touchesCritical ? 'critical paths touched' : `large diff: ${diffSize} lines`})`)
} else if (riskLevel === 'medium') {
  // Medium risk: run agents with score >= 3
  selectedAgents = Object.entries(agentScores)
    .filter(([, score]) => score >= 3)
    .map(([agent]) => agent)
  reasons.push(`Medium risk (${changedFiles.length} files, ${diffSize} lines)`)
} else {
  // Low risk: run only agents with score >= 5
  selectedAgents = Object.entries(agentScores)
    .filter(([, score]) => score >= 5)
    .map(([agent]) => agent)
  reasons.push(`Low risk (${changedFiles.length} files, ${diffSize} lines)`)
}

// Always include at least security + code-quality
if (!selectedAgents.includes('security')) selectedAgents.push('security')
if (!selectedAgents.includes('code-quality')) selectedAgents.push('code-quality')

// Minimum 2, maximum 10
if (selectedAgents.length < 2) {
  selectedAgents = ['security', 'code-quality']
}

// ─── Output ─────────────────────────────────────────────────────────────────

const result = {
  agents: selectedAgents,
  risk_level: riskLevel,
  changed_files: changedFiles.length,
  diff_lines: diffSize,
  agent_scores: agentScores,
  reason: reasons.join('; '),
  skipped: Object.keys(rules).filter(a => !selectedAgents.includes(a)),
}

console.log(JSON.stringify(result, null, 2))
