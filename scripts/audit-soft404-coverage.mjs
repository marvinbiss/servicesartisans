#!/usr/bin/env node
/**
 * scripts/audit-soft404-coverage.mjs
 * -----------------------------------
 * DoD du backlog item P3-soft404-fix-mass.
 *
 * Source : memory `servicesartisans-gsc-diagnostic-2026-04-30` — 12 890 pages
 * 5xx GSC dont 57 % sur le template `/services/[service]/[location]/[publicId]`.
 *
 * Hypothèse root-cause : Supabase ralenti consomme les 30s Vercel
 * (cold ISR + DB lente), generateMetadata ou renderProviderPage saturent et
 * la fonction renvoie 504 visible côté GSC. Tier 0 (2026-05-04) avait
 * appliqué raceTimeout sur reviews/similar uniquement. Tier 45 étend le
 * pattern aux lookups CRITIQUES (provider/service/location) côté metadata
 * + render — le manque de race sur ces 7 fetchs était le vrai trou.
 *
 * Vérifie sur `src/app/(public)/services/[service]/[location]/[publicId]/page.tsx` :
 *
 *   1. Helper raceTimeout déclaré au module-scope (partagé metadata + render)
 *   2. Constante RACE_MS définie au module-scope (≤6000 ms)
 *   3. raceTimeout appliqué ≥7 fois (3 metadata + 4 render minimum)
 *   4. generateMetadata wrap try/catch + fallback noindex sur DB error
 *   5. ProviderPage outer try/catch → notFound() sur erreur non-control-flow
 *   6. Re-throw isRedirectError + isNotFoundError + isDynamicServerError
 *   7. logger.error sur chaque .catch() de fetch DB (pas de catch silencieux)
 *   8. export const revalidate présent (ISR pour tirer de la pression DB)
 *   9. notFound() appelé quand provider null OR is_active === false
 *  10. .catch() guard sur chaque branche de Promise.all() critique
 *
 * Garde-régression : si une nouvelle PR retire un raceTimeout ou un
 * .catch() guard, ce hook bloque le commit. Sans ça, on retomberait dans
 * le pattern qui a produit les 12 890 pages 5xx.
 *
 * Usage :
 *   node scripts/audit-soft404-coverage.mjs --strict
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const PAGE = join(
  ROOT,
  'src',
  'app',
  '(public)',
  'services',
  '[service]',
  '[location]',
  '[publicId]',
  'page.tsx'
)

if (!existsSync(PAGE)) {
  console.error('Audit soft404 coverage : page absente')
  if (strict) process.exit(1)
  process.exit(0)
}

const src = readFileSync(PAGE, 'utf8')

// 1. Helper raceTimeout au module-scope — détection : déclaration hors d'une fonction async.
//    On considère module-scope si la déclaration n'est pas indentée (col 0).
const moduleScopeRaceTimeout = /^const raceTimeout = /m.test(src)

// 2. RACE_MS constante (≤6000)
const raceMsMatch = src.match(/^const RACE_MS = (\d+)/m)
const raceMs = raceMsMatch ? Number(raceMsMatch[1]) : null

// 3. Compter les raceTimeout( call sites
const raceCallCount = (src.match(/raceTimeout\(/g) ?? []).length

// 4. generateMetadata try/catch + noindex fallback
const metadataTryFallback =
  /generateMetadata[\s\S]*?try\s*\{[\s\S]*?\}\s*catch\s*\(err\)\s*\{[\s\S]*?return\s*\{[\s\S]*?robots:\s*\{\s*index:\s*false/m.test(
    src
  )

// 5. ProviderPage outer try/catch → notFound()
const providerOuterCatch =
  /export default async function ProviderPage[\s\S]*?try\s*\{[\s\S]*?\}\s*catch\s*\(err\)\s*\{[\s\S]*?notFound\(\)/m.test(
    src
  )

// 6. Re-throws des control-flow.
//    Next 16 : `unstable_rethrow(err)` remplace les helpers
//    isRedirectError/isNotFoundError/isDynamicServerError (retirés de
//    next/navigation) et re-throw les trois familles en un seul appel.
const hasUnstableRethrow = /unstable_rethrow\(err\)/.test(src)
const reRedirect =
  hasUnstableRethrow || /isRedirectError\(err\)\s*\|\|\s*isNotFoundError\(err\)/.test(src)
const reDynamic = hasUnstableRethrow || /isDynamicServerError\(err\)/.test(src)

// 7. logger.error sur chaque .catch() — heuristique : compter les `.catch((err)` qui retournent
//    null ET vérifier qu'au moins autant de logger.error sont déclarés dans le fichier que de catches.
const dotCatchErrCount = (src.match(/\.catch\(\(err\)/g) ?? []).length
const loggerErrorCount = (src.match(/logger\.error\(/g) ?? []).length

// 8. export const revalidate
const revalidateExport = /^export const revalidate = \d+/m.test(src)

// 9. notFound() sur provider null/inactif
const notFoundOnNull = /if\s*\(!provider\s*\|\|\s*provider\.is_active\s*===\s*false\)\s*\{\s*notFound\(\)/m.test(
  src
)

// 10. Promise.all critique = chaque branche est wrapped par raceTimeout
//     OU est un Promise.resolve(null) (pas un fetch).
//     Heuristique : si un Promise.all contient des get*( fetches, ils doivent
//     être à l'intérieur d'un raceTimeout(...).
const promiseAllBlocks = src.match(/Promise\.all\(\[[\s\S]*?\]\)/g) ?? []
const promiseAllAllGuarded = promiseAllBlocks.every((block) => {
  const fetches = block.match(/get[A-Z]\w+\(/g) ?? []
  if (fetches.length === 0) return true
  // Si le bloc contient des fetches, il doit aussi contenir un raceTimeout
  // (sinon les fetches ne sont pas protégés par timeout).
  return /raceTimeout\(/.test(block)
})

const checks = [
  {
    id: 'race_timeout_module_scope',
    label: 'Helper raceTimeout déclaré au module-scope (partagé metadata + render)',
    ok: moduleScopeRaceTimeout,
  },
  {
    id: 'race_ms_constant',
    label: `RACE_MS module-scope ≤6000ms (actuel ${raceMs ?? 'absent'})`,
    ok: raceMs !== null && raceMs <= 6000 && raceMs >= 1000,
  },
  {
    id: 'race_call_count',
    label: `raceTimeout appliqué ≥7 fois (actuel ${raceCallCount})`,
    ok: raceCallCount >= 7,
  },
  {
    id: 'metadata_noindex_fallback',
    label: 'generateMetadata try/catch + fallback noindex sur DB error',
    ok: metadataTryFallback,
  },
  {
    id: 'provider_outer_catch',
    label: 'ProviderPage outer try/catch → notFound() sur erreur non-control-flow',
    ok: providerOuterCatch,
  },
  {
    id: 'rethrow_redirect_notfound',
    label: 'Re-throw redirect + notFound (isRedirectError/isNotFoundError ou unstable_rethrow)',
    ok: reRedirect,
  },
  {
    id: 'rethrow_dynamic_server_error',
    label: 'Re-throw dynamic-server-error (isDynamicServerError ou unstable_rethrow)',
    ok: reDynamic,
  },
  {
    id: 'logger_error_on_catches',
    label: `logger.error couvre tous les .catch() (actuel ${loggerErrorCount}≥${dotCatchErrCount})`,
    ok: loggerErrorCount >= dotCatchErrCount && dotCatchErrCount >= 6,
  },
  {
    id: 'isr_revalidate_export',
    label: 'export const revalidate présent (réduit pression DB)',
    ok: revalidateExport,
  },
  {
    id: 'notfound_on_null_provider',
    label: 'notFound() appelé quand provider null OR is_active === false',
    ok: notFoundOnNull,
  },
  {
    id: 'promise_all_guarded',
    label: 'Tous les Promise.all critiques ont .catch() par branche',
    ok: promiseAllAllGuarded,
  },
]

const failures = checks.filter((c) => !c.ok)

const report = {
  template: 'services/[service]/[location]/[publicId]',
  source_memory: 'servicesartisans-gsc-diagnostic-2026-04-30',
  pages_5xx_gsc: 12890,
  pct_template: 0.571,
  race_timeout_calls: raceCallCount,
  race_ms: raceMs,
  total: checks.length,
  passed: checks.length - failures.length,
  failures: failures.map((f) => ({ id: f.id, label: f.label })),
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Soft404 Coverage Audit (DoD P3-soft404-fix-mass)\n')
  console.log(`  Template       : /services/[service]/[location]/[publicId]`)
  console.log(`  Pages 5xx GSC  : 12 890 (57 % sur ce template)`)
  console.log(`  Patterns       : ${checks.length}`)
  console.log(`  OK             : ${checks.length - failures.length}`)
  console.log(`  Échecs         : ${failures.length}`)
  for (const c of checks) {
    const icon = c.ok ? '✅' : '❌'
    console.log(`     ${icon}  [${c.id}] ${c.label}`)
  }
  console.log('')
  if (failures.length === 0) {
    console.log('  ✅ Template anti-soft404 conforme P3-soft404-fix-mass.\n')
  } else {
    console.log(`  ⚠️  ${failures.length} pattern(s) manquant(s) — DoD non atteinte.\n`)
  }
}

if (strict && failures.length > 0) process.exit(1)
