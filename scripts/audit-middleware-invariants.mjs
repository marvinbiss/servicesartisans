#!/usr/bin/env node
/**
 * scripts/audit-middleware-invariants.mjs
 * ----------------------------------------
 * DoD anti-régression sur les invariants de `src/middleware.ts`.
 *
 * Source : memory `audit-10-agents-2026-04-25` (timing-safe + CSP),
 * `noindex-rge-migration-2026-04-19` (gone-paths 410), `soft-404-bug-2026-04-19`
 * (mitigation Next.js 14.2 #69103), `audit-architecture-2026-04-12` (apex
 * canonical + middleware perf).
 *
 * Pourquoi : le middleware est exécuté Edge sur 100% des requests. Une
 * régression silencieuse ici = impact systémique :
 *
 *   - `evaluateGonePath` retiré → soft 404 Next.js 14.2 réactivé sur
 *     ISR/dynamicParams. Google ré-indexe les 184K URLs DELETE 410 du
 *     plan strategy 140K → revert SEO meltdown.
 *   - `constantTimeEqual` remplacé par `===` sur cronSecret → timing
 *     attack restauré (audit 25/04 H1). 1B comparaisons = key leak.
 *   - CSP `script-src 'unsafe-eval'` réintroduit → XSS Stripe + GTM.
 *   - Canonical redirect www → apex retiré → split index Google +
 *     duplicates content + `/api/revalidate` POST cassé (la règle apex
 *     casse les POST sur www).
 *   - `LEGACY_REDIRECTS` vidé → 4 paths historiques renvoient 404 et
 *     perdent leur jus interne.
 *   - matcher `config.matcher` élargi à `_next/static` → dégrade perf
 *     edge × 5-10 (assets traversent le middleware inutilement).
 *
 * Méthodologie : pattern matching sur le source de `src/middleware.ts`.
 *
 * Usage :
 *   node scripts/audit-middleware-invariants.mjs --strict
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const MIDDLEWARE = join(ROOT, 'src', 'middleware.ts')
const GONE_PATHS_LIB = join(ROOT, 'src', 'lib', 'seo', 'gone-paths.ts')

if (!existsSync(MIDDLEWARE)) {
  console.error('Audit middleware : src/middleware.ts absent')
  if (strict) process.exit(1)
  process.exit(0)
}

const src = readFileSync(MIDDLEWARE, 'utf8')
const goneSrc = existsSync(GONE_PATHS_LIB) ? readFileSync(GONE_PATHS_LIB, 'utf8') : ''

const checks = [
  {
    id: 'gone_path_first',
    label:
      'evaluateGonePath() appelé avant toute autre logique (soft 404 Next 14.2 fix)',
    ok:
      /import\s+\{\s*evaluateGonePath/.test(src) &&
      /goneDecision\s*=\s*evaluateGonePath\s*\(\s*pathname\s*\)/.test(src) &&
      /status:\s*410/.test(src),
    weight: 2.0,
  },
  {
    id: 'gone_paths_lib_exists',
    label: 'src/lib/seo/gone-paths.ts existe + export evaluateGonePath',
    ok: goneSrc.length > 0 && /export\s+function\s+evaluateGonePath/.test(goneSrc),
    weight: 1.5,
  },
  {
    id: 'cron_secret_constant_time',
    label:
      'CRON_SECRET comparison utilise constantTimeEqual (anti-timing attack)',
    ok:
      /function\s+constantTimeEqual/.test(src) &&
      /constantTimeEqual\s*\(\s*cronSecret/.test(src) &&
      // Anti-régression : aucune comparaison `cronSecret === ...` ne doit subsister
      !/cronSecret\s*===\s*expectedCronSecret/.test(src),
    weight: 2.0,
  },
  {
    id: 'csp_no_unsafe_eval',
    label: "CSP script-src ne contient PAS 'unsafe-eval'",
    ok:
      /STATIC_CSP|Content-Security-Policy/.test(src) &&
      !/script-src[^"']*'unsafe-eval'/i.test(src),
    weight: 1.5,
  },
  {
    id: 'csp_frame_ancestors_none',
    label: "CSP frame-ancestors 'none' (anti-clickjacking)",
    ok: /frame-ancestors\s+'none'/i.test(src),
    weight: 1.0,
  },
  {
    id: 'apex_canonicalization',
    label:
      'Canonical redirect www → apex (sinon /api/revalidate POST cassé)',
    ok:
      /getCanonicalRedirect/.test(src) &&
      /servicesartisans\.fr/.test(src),
    weight: 1.5,
  },
  {
    id: 'legacy_redirects_present',
    label:
      'LEGACY_REDIRECTS map non vidée (au moins 3 entries historiques)',
    ok: (() => {
      const m = src.match(/const\s+LEGACY_REDIRECTS\s*:[^=]*=\s*\{([\s\S]*?)\}/)
      if (!m) return false
      const entries = m[1].match(/['"]\/[^'"]+['"]\s*:\s*['"]\/[^'"]+['"]/g)
      return (entries?.length ?? 0) >= 3
    })(),
    weight: 1.0,
  },
  {
    id: 'safe_redirect_used',
    label:
      'isSafeRedirectPath utilisé pour les redirections post-auth (anti open-redirect)',
    ok: /import.*isSafeRedirectPath/.test(src) && /isSafeRedirectPath\s*\(/.test(src),
    weight: 1.0,
  },
  {
    id: 'matcher_excludes_static',
    label:
      'config.matcher exclut _next/static + favicon (perf edge runtime)',
    ok: (() => {
      const m = src.match(/export\s+const\s+config\s*=\s*\{[\s\S]*?matcher\s*:[\s\S]*?\}/)
      if (!m) return false
      return /_next\/static|favicon/.test(m[0])
    })(),
    weight: 1.0,
  },
  {
    id: 'rate_limit_wired',
    label:
      'Rate limiter wiring : checkRateLimit + getRateLimitConfig + getRateLimitKey',
    ok:
      /checkRateLimit\s*\(/.test(src) &&
      /getRateLimitConfig\s*\(/.test(src) &&
      /getRateLimitKey\s*\(/.test(src),
    weight: 1.0,
  },
]

const totalWeight = checks.reduce((s, c) => s + c.weight, 0)
const passedWeight = checks.filter((c) => c.ok).reduce((s, c) => s + c.weight, 0)
const coveragePct = Math.round((passedWeight / totalWeight) * 1000) / 10

const failures = checks.filter((c) => !c.ok)

const report = {
  backlog_item: 'P3-middleware-invariants',
  source_memory:
    'audit-10-agents-2026-04-25 + noindex-rge-migration-2026-04-19 + soft-404-bug-2026-04-19 + audit-architecture-2026-04-12',
  total_checks: checks.length,
  passed: checks.length - failures.length,
  passed_weight: passedWeight,
  total_weight: totalWeight,
  coverage_pct: coveragePct,
  failures: failures.map((f) => ({ id: f.id, label: f.label, weight: f.weight })),
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Middleware Invariants Audit (DoD P3-middleware-invariants)\n')
  console.log(`  Patterns  : ${checks.length}`)
  console.log(`  Coverage  : ${coveragePct}% (${passedWeight}/${totalWeight} pondéré)`)
  for (const c of checks) {
    const icon = c.ok ? '✅' : '❌'
    console.log(`     ${icon}  [${c.id}] ${c.label} (poids ${c.weight})`)
  }
  if (failures.length === 0) {
    console.log('\n  ✅ Invariants middleware préservés.\n')
  } else {
    console.log(`\n  ⚠️  ${failures.length} régression(s) — DoD non atteinte.\n`)
  }
}

if (strict && failures.length > 0) process.exit(1)
