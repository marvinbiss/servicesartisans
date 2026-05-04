#!/usr/bin/env node
/**
 * scripts/audit-cron-sentry-coverage.mjs
 * ---------------------------------------
 * DoD du backlog item P3-cron-sentry-coverage (Tier 56).
 *
 * Source : memory `servicesartisans-audit-architecture-2026-04-12` —
 * "31/45 crons sans Sentry, pas DLQ globale, rge-sync data loss risk".
 *
 * Pourquoi : un cron qui throw silencieusement = data loss invisible
 * pendant des jours/semaines. Mémoire `dispatch-rge-aware-2026-04-20`
 * documente "dispatch silencieusement cassé depuis ~3 semaines (42703
 * `weight_response_rate` hérité 363)" — exactement le pattern d'un
 * cron sans observability.
 *
 * Vérifie chaque src/app/api/cron/**\/route.ts :
 *
 *   1. Catch block présent (try/catch sur logique principale)
 *   2. Catch émet observability via :
 *      - `Sentry.captureException(err, ...)`, OU
 *      - `logger.error(...)` (logger.error a une intégration Sentry
 *         côté @/lib/logger qui forward auto)
 *   3. Pas de catch silencieux `catch {}` ou `catch (_) {}` qui swallow
 *
 * Threshold : --threshold N exige ≥N % des crons OK (défaut 70).
 * Memory dit 14/45 OK → 31 % baseline. Lock-in à 70 % (≈32/45) après
 * commit `9fdedd9b9` audit 10-agents 2026-04-25 qui a fixé timing-safe
 * + Redis circuit + Sentry sur quelques crons. Threshold sera bumpé
 * progressivement par futurs Tiers wiring.
 *
 * Usage :
 *   node scripts/audit-cron-sentry-coverage.mjs --strict
 *   node scripts/audit-cron-sentry-coverage.mjs --threshold 80 --verbose
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const args = process.argv.slice(2)
const thresholdArg = args.find((a) => a.startsWith('--threshold'))
const threshold = thresholdArg
  ? Number(thresholdArg.split('=')[1] ?? args[args.indexOf(thresholdArg) + 1] ?? 70)
  : 70
const strict = args.includes('--strict')
const jsonOut = args.includes('--json')
const verbose = args.includes('--verbose')

const ROOT = process.cwd()
const CRON_DIR = join(ROOT, 'src', 'app', 'api', 'cron')

if (!existsSync(CRON_DIR)) {
  console.error('Audit cron sentry : src/app/api/cron absent')
  if (strict) process.exit(1)
  process.exit(0)
}

function walkRouteTs(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) out.push(...walkRouteTs(full))
    else if (entry === 'route.ts' || entry === 'route.js') out.push(full)
  }
  return out
}

const cronRoutes = walkRouteTs(CRON_DIR)

const results = cronRoutes.map((path) => {
  const src = readFileSync(path, 'utf8')
  const rel = relative(ROOT, path).replace(/\\/g, '/')

  const hasCatch = /catch\s*\(/.test(src) || /catch\s*\{/.test(src)
  // Silent catch : `catch {}` ou `catch (_) {}` ou `catch (err) {}` sans body.
  const hasSilentCatch =
    /catch\s*\{\s*\}/.test(src) ||
    /catch\s*\(\s*_+\s*\)\s*\{\s*\}/.test(src) ||
    /catch\s*\(\s*[a-z_]+\s*\)\s*\{\s*\}/i.test(src)

  const hasSentryCapture = /Sentry\.(captureException|captureMessage)\(/.test(src)
  const hasLoggerError = /logger\.error\(/.test(src)

  // Wrapper `withCronCheckIn(monitorSlug, handler)` fournit déjà :
  //   - try/catch externe sur le handler
  //   - Sentry.captureCheckIn (status: 'in_progress' / 'ok' / 'error')
  //   - healthchecks.io heartbeat ping (defense-in-depth observability)
  // Cf. src/lib/monitoring/sentry-checkin.ts — un cron wrappé est
  // automatiquement observable, même sans try/catch interne.
  const hasCronCheckInWrapper = /withCronCheckIn\(/.test(src)

  const observable =
    hasCronCheckInWrapper ||
    (hasCatch && (hasSentryCapture || hasLoggerError) && !hasSilentCatch)

  const loc = src.split(/\r?\n/).length
  const isSimpleHealthcheck = loc < 60 && /Response\.(json|ok)/.test(src) && !hasCatch

  return {
    path: rel,
    name: rel.match(/cron\/([^/]+)\/route\.(ts|js)$/)?.[1] ?? '',
    loc,
    hasCatch,
    hasSilentCatch,
    hasSentryCapture,
    hasLoggerError,
    hasCronCheckInWrapper,
    observable: observable || isSimpleHealthcheck,
    simpleHealthcheck: isSimpleHealthcheck,
  }
})

const totalCrons = results.length
const observableCount = results.filter((r) => r.observable).length
const coveragePct = Math.round((observableCount / totalCrons) * 1000) / 10

const failing = results.filter((r) => !r.observable)
const silentCatch = results.filter((r) => r.hasSilentCatch)

const report = {
  backlog_item: 'P3-cron-sentry-coverage',
  source_memory: 'servicesartisans-audit-architecture-2026-04-12',
  threshold,
  total_crons: totalCrons,
  observable_count: observableCount,
  coverage_pct: coveragePct,
  silent_catch_count: silentCatch.length,
  failing_count: failing.length,
  failing_sample: verbose
    ? failing.map((f) => ({ name: f.name, loc: f.loc, hasCatch: f.hasCatch }))
    : failing.slice(0, 15).map((f) => ({ name: f.name, loc: f.loc })),
  silent_catch_sample: silentCatch.map((s) => s.name),
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Cron Sentry Coverage Audit (DoD P3-cron-sentry-coverage)\n')
  console.log(`  Source : memory audit-architecture-2026-04-12 (31/45 sans Sentry baseline)`)
  console.log(`  Crons scannés : ${totalCrons}`)
  console.log(`  Observable    : ${observableCount}`)
  console.log(`  Coverage      : ${coveragePct}%`)
  console.log(`  Threshold     : ≥${threshold}%`)
  console.log(`  Silent catch  : ${silentCatch.length} (catch{} ou catch(_){})`)
  if (failing.length > 0) {
    console.log('\n  Crons sans observability (top 15) :')
    for (const f of failing.slice(0, verbose ? failing.length : 15)) {
      const hint = f.hasSilentCatch
        ? '⚠️ SILENT CATCH'
        : f.hasCatch
          ? 'catch sans Sentry/logger.error'
          : 'pas de catch (loc=' + f.loc + ')'
      console.log(`    - ${f.name.padEnd(35)} ${hint}`)
    }
  }
  if (silentCatch.length > 0) {
    console.log('\n  ⚠️  Silent catch (data loss invisible) :')
    for (const s of silentCatch) console.log(`    - ${s.name}`)
  }
  if (coveragePct >= threshold) {
    console.log(`\n  ✅ Coverage ${coveragePct}% ≥ threshold ${threshold}% — DoD atteinte.\n`)
  } else {
    console.log(
      `\n  ⚠️  Coverage ${coveragePct}% < threshold ${threshold}% — DoD non atteinte.\n`
    )
  }
}

if (strict && coveragePct < threshold) process.exit(1)
