#!/usr/bin/env node
/**
 * SLA 99.9% audit — scanne toutes les routes API + crons contre le checklist
 * canonique. Produit un rapport JSON par route + un summary CSV trié par
 * priorité (P0 = bloque SLA, P1 = dégrade, P2 = nice-to-have).
 *
 * Checklist par ROUTE API :
 *   1. rate-limit présent (`checkRateLimit`)        — sinon DoS trivial
 *   2. failOpen:true sur rate-limit                 — sinon Redis down = self-DoS
 *   3. timeout sur Supabase / fetch externes        — sinon hang = 5xx storm
 *   4. abortSignal sur fetch externe                — sinon leak resource
 *   5. try/catch + logger.error + Sentry            — sinon erreurs invisibles
 *   6. zod validation sur inputs (POST/PUT/PATCH)   — sinon panic non-géré
 *   7. runtime déclaré explicitement                — sinon défault peut casser
 *   8. dynamic='force-dynamic' si DB                — sinon stale ISR
 *
 * Checklist par CRON :
 *   1. withCronCheckIn (Sentry monitor)             — sinon crash invisible
 *   2. CRON_SECRET timingSafeEqual                  — sinon timing-attack
 *   3. lease anti-double-run                        — sinon race conditions
 *   4. cap MAX_*_PER_RUN                            — sinon timeout Vercel
 *   5. wall-clock guard                             — sinon timeout silencieux
 *   6. abortSignal sur RPC                          — sinon leak
 *   7. release lease en finally                     — sinon lease stuck
 *
 * Exit codes :
 *   0 — toutes les routes ≥ seuil P0
 *   1 — au moins 1 P0 manquant (bloque deploy si --strict)
 *
 * Usage :
 *   node scripts/audit-sla-99-9.mjs              # rapport stdout
 *   node scripts/audit-sla-99-9.mjs --json       # JSON
 *   node scripts/audit-sla-99-9.mjs --strict     # exit 1 si P0 missing
 *   node scripts/audit-sla-99-9.mjs --top 30     # top 30 worst
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'
import { glob } from 'glob'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const CWD = process.cwd()
const argv = process.argv.slice(2)
const FLAG_JSON = argv.includes('--json')
const FLAG_STRICT = argv.includes('--strict')
const TOP_N = (() => {
  const i = argv.indexOf('--top')
  if (i === -1) return 0
  return parseInt(argv[i + 1] ?? '20', 10)
})()

// ---------------------------------------------------------------------------
// Patterns d'audit
// ---------------------------------------------------------------------------

const PATTERNS_API = [
  {
    id: 'rate_limit',
    label: 'Rate-limit présent',
    severity: 'P0',
    test: (src) => /\bcheckRateLimit\s*\(/.test(src),
    appliesTo: (path) => !/\/api\/cron\//.test(path) && !/\/api\/health\//.test(path),
  },
  {
    id: 'rate_limit_fail_open',
    label: 'Rate-limit failOpen:true',
    severity: 'P0',
    test: (src) =>
      !/\bcheckRateLimit\s*\(/.test(src) || /failOpen\s*:\s*true/.test(src),
    appliesTo: (path) => !/\/api\/cron\//.test(path),
  },
  {
    id: 'try_catch',
    label: 'try/catch global',
    severity: 'P0',
    test: (src) => /try\s*{[\s\S]+?catch\s*\(/.test(src),
    appliesTo: () => true,
  },
  {
    id: 'sentry_capture',
    label: 'Sentry captureError ou logger.error',
    severity: 'P1',
    test: (src) =>
      /\bcaptureError\b/.test(src) || /\blogger\.error\b/.test(src) || /\bcaptureException\b/.test(src),
    appliesTo: () => true,
  },
  {
    id: 'zod_validation',
    label: 'Zod validation sur body',
    severity: 'P1',
    test: (src) =>
      !/export\s+async\s+function\s+(POST|PUT|PATCH)/.test(src) ||
      /\.safeParse\(|\.parse\(|validateRequest\(/.test(src),
    appliesTo: () => true,
  },
  {
    id: 'dynamic_force',
    label: "dynamic = 'force-dynamic' si DB",
    severity: 'P2',
    test: (src) =>
      !/\bcreateAdminClient\b|\bcreateClient\b|\bcreateServerClient\b/.test(src) ||
      /export\s+const\s+dynamic\s*=\s*['"]force-dynamic['"]/.test(src) ||
      /\bexport\s+const\s+revalidate\b/.test(src),
    appliesTo: () => true,
  },
  {
    id: 'runtime_declared',
    label: 'runtime déclaré explicitement',
    severity: 'P2',
    test: (src) => /export\s+const\s+runtime\s*=/.test(src),
    appliesTo: (path) => /\/webhook\b|stripe|vapi|yousign/.test(path),
  },
  {
    id: 'fetch_abort_signal',
    label: 'AbortSignal sur fetch externe',
    severity: 'P1',
    test: (src) =>
      !/\bfetch\s*\(/.test(src) ||
      !/https?:\/\//.test(src) ||
      /AbortSignal\.timeout|controller\.signal|abortSignal/.test(src),
    appliesTo: () => true,
  },
]

const PATTERNS_CRON = [
  {
    id: 'cron_checkin',
    label: 'withCronCheckIn',
    severity: 'P0',
    test: (src) => /\bwithCronCheckIn\b/.test(src),
  },
  {
    id: 'cron_secret_timing_safe',
    label: 'CRON_SECRET timingSafeEqual',
    severity: 'P0',
    test: (src) =>
      /timingSafeEqual|safeCompare|constantTimeEqual/.test(src) ||
      !/CRON_SECRET/.test(src),
  },
  {
    id: 'cron_lease',
    label: 'Lease anti-double-run',
    severity: 'P1',
    test: (src) => /acquire_cron_lease|cron_lease|p_name/.test(src),
  },
  {
    id: 'cron_cap',
    label: 'Cap MAX_*_PER_RUN',
    severity: 'P1',
    test: (src) => /MAX_[A-Z_]+_PER_RUN|\.limit\(\s*\d+\s*\)/.test(src),
  },
  {
    id: 'cron_wallclock',
    label: 'Wall-clock guard',
    severity: 'P1',
    test: (src) =>
      /Date\.now\(\)\s*-\s*startedAt|MAX_RUNTIME_MS|wall.?clock|elapsed|maxDurationMs/.test(src),
  },
  {
    id: 'cron_abort_signal',
    label: 'AbortSignal sur RPC',
    severity: 'P2',
    test: (src) =>
      !/\.rpc\(/.test(src) ||
      /\.abortSignal\(|AbortController|AbortSignal\.timeout/.test(src),
  },
  {
    id: 'cron_release_finally',
    label: 'Release lease en finally',
    severity: 'P0',
    test: (src) =>
      !/acquire_cron_lease/.test(src) || /finally\s*{[\s\S]+?release_cron_lease/.test(src),
  },
]

// ---------------------------------------------------------------------------
// Scan
// ---------------------------------------------------------------------------

const apiFiles = await glob('src/app/api/**/route.ts', { cwd: ROOT, absolute: true })

const results = []
let p0Missing = 0
let p1Missing = 0
let p2Missing = 0

function isStub(src) {
  // Stub = handler qui retourne immédiatement sans toucher DB/fetch/cookies/headers.
  // Ex: stripe/create-portal renvoie 501. Ces routes n'ont pas besoin de
  // rate-limit, try/catch, zod.
  const noBodyRead = !/\.json\(\)|\.formData\(\)|\.text\(\)|searchParams|\bcookies\(\)|\bheaders\(\)/.test(src)
  const noDb = !/\bcreateAdminClient\b|\bcreateClient\b|\bcreateServerClient\b|\bsupabase/i.test(src)
  const noFetch = !/\bfetch\s*\(/.test(src)
  const noWriteOps = !/\.insert\(|\.update\(|\.delete\(|\.upsert\(/.test(src)
  return noBodyRead && noDb && noFetch && noWriteOps && src.length < 500
}

for (const file of apiFiles) {
  const rel = relative(ROOT, file).replace(/\\/g, '/')
  const isCron = rel.startsWith('src/app/api/cron/')
  const src = readFileSync(file, 'utf8')
  if (!isCron && isStub(src)) continue // skip stubs / redirects 501
  const patterns = isCron ? PATTERNS_CRON : PATTERNS_API
  const failures = []
  let score = 0
  let weight = 0
  for (const p of patterns) {
    if (p.appliesTo && !p.appliesTo(rel)) continue
    const w = p.severity === 'P0' ? 10 : p.severity === 'P1' ? 5 : 2
    weight += w
    if (p.test(src)) {
      score += w
    } else {
      failures.push({ id: p.id, label: p.label, severity: p.severity })
      if (p.severity === 'P0') p0Missing++
      else if (p.severity === 'P1') p1Missing++
      else p2Missing++
    }
  }
  results.push({
    path: rel,
    type: isCron ? 'cron' : 'api',
    score: weight === 0 ? 100 : Math.round((score / weight) * 100),
    failures,
  })
}

results.sort((a, b) => a.score - b.score)

if (FLAG_JSON) {
  console.log(JSON.stringify({
    summary: { total: results.length, p0Missing, p1Missing, p2Missing },
    results,
  }, null, 2))
} else {
  console.log('SLA 99.9% audit — ServicesArtisans')
  console.log('===================================')
  console.log(`Total surfaces : ${results.length}`)
  console.log(`P0 manquants   : ${p0Missing} (bloquant SLA)`)
  console.log(`P1 manquants   : ${p1Missing} (dégrade)`)
  console.log(`P2 manquants   : ${p2Missing} (nice-to-have)`)
  console.log('')
  const N = TOP_N || 30
  console.log(`TOP ${N} routes les plus à risque (score le plus bas) :`)
  console.log('---------------------------------------------------------------')
  for (const r of results.slice(0, N)) {
    const failsP0 = r.failures.filter((f) => f.severity === 'P0').length
    const failsP1 = r.failures.filter((f) => f.severity === 'P1').length
    const failsP2 = r.failures.filter((f) => f.severity === 'P2').length
    console.log(
      `[${String(r.score).padStart(3)}/100] ${r.path}  (P0:${failsP0} P1:${failsP1} P2:${failsP2})`
    )
    for (const f of r.failures) {
      console.log(`           ${f.severity} — ${f.label}`)
    }
  }
}

if (FLAG_STRICT && p0Missing > 0) {
  process.exit(1)
}
