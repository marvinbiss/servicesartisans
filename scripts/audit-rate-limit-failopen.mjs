#!/usr/bin/env node
/**
 * scripts/audit-rate-limit-failopen.mjs
 * --------------------------------------
 * DoD anti-régression sur la politique failOpen Upstash rate limiter.
 *
 * Source : memory `servicesartisans-upstash-rate-limit-fix-2026-04-22` —
 * Incident 21/04 23h : ajout Upstash a activé un chemin fail-CLOSE dormant
 * → 429 sur /api/devis + signin → funnel cassé. Fix `3ab150da` aligne
 * failOpen middleware↔handler sur 17 endroits.
 *
 * Pourquoi : sans ce lock-in, un dev peut :
 *
 *   - Retirer `failOpen: true` sur `devis` / `signin` / `auth` pour
 *     "renforcer la sécurité" → en cas de glitch Redis Upstash (latence
 *     >timeout, panne transient, propre rate limit Upstash), TOUTES les
 *     requêtes funnel devis renvoient HTTP 429 → revenue=0 sur la durée
 *     du glitch (incident 22/04 = 6h de funnel bloqué avant rollback).
 *   - Ajouter un nouvel endpoint user-facing (ex: simulateur, baromètre)
 *     sans `failOpen: true` → même problème silencieux à la prochaine
 *     panne Upstash.
 *   - Mettre `failOpen: true` sur `payment` / `gdpr` / `ai` → bypass
 *     fraude/coûts API/RGPD en cas de glitch (faux positif inverse).
 *
 * Politique stricte :
 *
 *   FAIL-OPEN (failOpen: true) — endpoints user-facing business-critical :
 *     auth, signin, api, booking, reviews, devis, contact, upload, search,
 *     newsletter, inscription, ceeEstimate, estimation, estimationLead,
 *     vapiWebhook, webhook
 *
 *   FAIL-CLOSE (no failOpen) — endpoints sensibles anti-fraude/coûts/RGPD :
 *     payment, gdpr, ai, verify, geocode
 *
 * Vérifications :
 *
 *   1. La politique commentaire 2026-04-22 est documentée dans le source
 *   2. Les 16 endpoints fail-open ont bien `failOpen: true`
 *   3. Les 5 endpoints fail-close N'ONT PAS `failOpen: true`
 *   4. Le checkRateLimit lit `config.failOpen` et bascule sur memoryLimiter
 *      en fallback (pas de hard 429)
 *
 * Usage :
 *   node scripts/audit-rate-limit-failopen.mjs --strict
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const RL_LIB = join(ROOT, 'src', 'lib', 'rate-limiter.ts')

if (!existsSync(RL_LIB)) {
  console.error('Audit rate-limit failOpen : src/lib/rate-limiter.ts absent')
  if (strict) process.exit(1)
  process.exit(0)
}

const src = readFileSync(RL_LIB, 'utf8')

const FAIL_OPEN_REQUIRED = [
  'auth',
  'signin',
  'api',
  'booking',
  'reviews',
  'devis',
  'contact',
  'upload',
  'search',
  'newsletter',
  'inscription',
  'ceeEstimate',
  'estimation',
  'estimationLead',
  'vapiWebhook',
  'webhook',
]

const FAIL_CLOSE_REQUIRED = ['payment', 'gdpr', 'ai', 'verify', 'geocode']

function entryHasFailOpen(name, src) {
  // Match the line `name: { ... failOpen: true ... }` even with nested braces.
  // Capture the whole line up to the closing brace.
  const re = new RegExp(`\\b${name}\\s*:\\s*\\{([^}]*)\\}`, 'i')
  const m = src.match(re)
  if (!m) return null
  return /failOpen\s*:\s*true/.test(m[1])
}

const checks = []

checks.push({
  id: 'policy_documented',
  label: 'Commentaire POLITIQUE failOpen 2026-04-22 présent',
  ok: /POLITIQUE\s+failOpen.*2026-04-22/i.test(src),
  weight: 1.0,
})

checks.push({
  id: 'memory_limiter_fallback',
  label:
    'checkRateLimit lit config.failOpen ET bascule sur memoryLimiter en fallback',
  ok:
    /config\.failOpen\s*===\s*true/.test(src) &&
    /memoryLimiter|memoryRateLimit|inMemory/i.test(src),
  weight: 1.5,
})

const failOpenMissing = []
for (const name of FAIL_OPEN_REQUIRED) {
  const has = entryHasFailOpen(name, src)
  if (has === null) {
    failOpenMissing.push({ name, status: 'entry_missing' })
  } else if (!has) {
    failOpenMissing.push({ name, status: 'missing_failOpen' })
  }
}

checks.push({
  id: 'fail_open_endpoints_complete',
  label: `Les ${FAIL_OPEN_REQUIRED.length} endpoints user-facing business-critical ont failOpen:true`,
  ok: failOpenMissing.length === 0,
  weight: 2.0,
  details: failOpenMissing,
})

const failCloseLeak = []
for (const name of FAIL_CLOSE_REQUIRED) {
  const has = entryHasFailOpen(name, src)
  if (has === true) {
    failCloseLeak.push({ name, status: 'unexpected_failOpen_true' })
  }
  // entry_missing → tolérée (l'endpoint peut ne plus exister)
}

checks.push({
  id: 'fail_close_endpoints_strict',
  label: `Les ${FAIL_CLOSE_REQUIRED.length} endpoints sensibles N'ONT PAS failOpen:true (anti-fraude/coûts/RGPD)`,
  ok: failCloseLeak.length === 0,
  weight: 2.0,
  details: failCloseLeak,
})

const totalWeight = checks.reduce((s, c) => s + c.weight, 0)
const passedWeight = checks.filter((c) => c.ok).reduce((s, c) => s + c.weight, 0)
const coveragePct = Math.round((passedWeight / totalWeight) * 1000) / 10

const failures = checks.filter((c) => !c.ok)

const report = {
  backlog_item: 'P3-rate-limit-failopen',
  source_memory: 'servicesartisans-upstash-rate-limit-fix-2026-04-22',
  total_checks: checks.length,
  passed: checks.length - failures.length,
  passed_weight: passedWeight,
  total_weight: totalWeight,
  coverage_pct: coveragePct,
  failures: failures.map((f) => ({
    id: f.id,
    label: f.label,
    weight: f.weight,
    details: f.details,
  })),
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Rate Limit failOpen Audit (DoD P3-rate-limit-failopen)\n')
  console.log(`  Patterns  : ${checks.length}`)
  console.log(`  Coverage  : ${coveragePct}% (${passedWeight}/${totalWeight} pondéré)`)
  for (const c of checks) {
    const icon = c.ok ? '✅' : '❌'
    console.log(`     ${icon}  [${c.id}] ${c.label} (poids ${c.weight})`)
    if (!c.ok && c.details && c.details.length > 0) {
      for (const d of c.details.slice(0, 5)) {
        console.log(`         - ${JSON.stringify(d)}`)
      }
    }
  }
  if (failures.length === 0) {
    console.log('\n  ✅ Politique failOpen Upstash préservée.\n')
  } else {
    console.log(`\n  ⚠️  ${failures.length} régression(s) — DoD non atteinte.\n`)
  }
}

if (strict && failures.length > 0) process.exit(1)
