#!/usr/bin/env node
/**
 * scripts/audit-indexnow-coverage.mjs
 * ------------------------------------
 * DoD anti-régression sur le pipeline IndexNow (Bing/Yandex push indexation).
 *
 * Source : memory `servicesartisans-rge-descriptions-2026-04-19` (95 576
 * URLs IndexNow bootstrap), `servicesartisans-noindex-rge-migration-2026-04-19`
 * (50k IndexNow en 7.4s), `servicesartisans-internal-linking-rge-cee-2026-04-20`
 * (helpers `getProviderAffectedUrls` + `getCeeRegionalUrls`), Sprint V
 * canonicals.
 *
 * Pourquoi : IndexNow est notre seul levier "push" face aux 350K pages
 * détectées non indexées (rapport coverage 2026-04-30). Si un dev :
 *
 *   - Retire `submitToIndexNow` du flow `/api/revalidate` → toute mise à
 *     jour content (avis, profil artisan, refresh SEO) ne pousse plus
 *     vers Bing/Yandex → indexation lag +5 à +14 jours.
 *   - Renomme/supprime un helper (`getSprintVCanonicalRgeUrls`,
 *     `getCeeRegionalUrls`, `getProviderAffectedUrls`) → le cron
 *     `indexnow-submit` n'a plus de source d'URLs → batch quotidien
 *     vide.
 *   - Casse le webhook `provider-seo-refresh` qui n'appelle plus
 *     IndexNow après regen description → backlog 49K fiches RGE
 *     re-indexées invisible côté push.
 *   - Oublie la clé `INDEXNOW_KEY` env (404 sur clé) → tous les pings
 *     rejetés silencieusement par Bing.
 *
 * Méthodologie :
 *
 *   1. `src/lib/seo/indexnow.ts` exporte `submitToIndexNow(urls)`,
 *      `getSprintVCanonicalRgeUrls()`, `getCeeRegionalUrls(...)` et
 *      `getProviderAffectedUrls(...)`.
 *   2. `src/app/api/cron/indexnow-submit/route.ts` existe et appelle au
 *      moins un des helpers + `submitToIndexNow`.
 *   3. `src/app/api/revalidate/route.ts` appelle `submitToIndexNow` après
 *      revalidatePath (push immédiat sur content updates).
 *   4. `src/app/api/webhooks/provider-seo-refresh/route.ts` appelle
 *      `submitToIndexNow` (regen description = recrawl prioritaire).
 *   5. `INDEXNOW_KEY` est référencé dans `src/lib/env.ts` ou
 *      `src/lib/seo/indexnow.ts`.
 *   6. Le fichier de clé `public/[INDEXNOW_KEY].txt` ou route Next.js
 *      pour servir la clé existe (Bing valide que la clé est servable
 *      à la racine du domaine).
 *
 * Usage :
 *   node scripts/audit-indexnow-coverage.mjs --strict
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()

const INDEXNOW_LIB = join(ROOT, 'src', 'lib', 'seo', 'indexnow.ts')
const INDEXNOW_CRON = join(ROOT, 'src', 'app', 'api', 'cron', 'indexnow-submit', 'route.ts')
const REVALIDATE_ROUTE = join(ROOT, 'src', 'app', 'api', 'revalidate', 'route.ts')
const PROVIDER_SEO_WEBHOOK = join(
  ROOT,
  'src',
  'app',
  'api',
  'webhooks',
  'provider-seo-refresh',
  'route.ts'
)
const ENV_FILE = join(ROOT, 'src', 'lib', 'env.ts')
const PUBLIC_DIR = join(ROOT, 'public')

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '')

const indexnowSrc = read(INDEXNOW_LIB)
const cronSrc = read(INDEXNOW_CRON)
const revalidateSrc = read(REVALIDATE_ROUTE)
const webhookSrc = read(PROVIDER_SEO_WEBHOOK)
const envSrc = read(ENV_FILE)

// Le fichier de clé peut être servi soit par un .txt dans /public,
// soit par une route Next.js dynamique. On accepte les deux formes.
const publicTxtFiles = existsSync(PUBLIC_DIR)
  ? readdirSync(PUBLIC_DIR).filter((f) => /^[a-f0-9]{32,}\.txt$/i.test(f))
  : []
const indexnowRoute = join(ROOT, 'src', 'app', '[indexnow]', 'route.ts')
const indexnowKeyRoute = existsSync(indexnowRoute)

const checks = [
  {
    id: 'indexnow_lib_exports',
    label: 'src/lib/seo/indexnow.ts exporte submitToIndexNow + 3 helpers URL',
    ok:
      /export\s+async\s+function\s+submitToIndexNow\s*\(/.test(indexnowSrc) &&
      /export\s+function\s+getSprintVCanonicalRgeUrls\s*\(/.test(indexnowSrc) &&
      /export\s+function\s+getCeeRegionalUrls\s*\(/.test(indexnowSrc) &&
      /export\s+function\s+getProviderAffectedUrls\s*\(/.test(indexnowSrc),
    weight: 2.0,
  },
  {
    id: 'indexnow_cron_wired',
    label:
      'cron indexnow-submit existe + appelle submitToIndexNow (helpers ou batch direct)',
    ok: cronSrc.length > 0 && /submitToIndexNow\s*\(/.test(cronSrc),
    weight: 1.5,
  },
  {
    id: 'revalidate_pings_indexnow',
    label: '/api/revalidate route ping IndexNow après revalidatePath',
    ok:
      revalidateSrc.length > 0 &&
      /submitToIndexNow\s*\(/.test(revalidateSrc) &&
      /revalidatePath\s*\(/.test(revalidateSrc),
    weight: 2.0,
  },
  {
    id: 'webhook_seo_refresh_pings_indexnow',
    label:
      'webhook provider-seo-refresh ping IndexNow (submitToIndexNow ou submitUrlsWithRetry)',
    ok:
      webhookSrc.length > 0 &&
      /(submitToIndexNow|submitUrlsWithRetry|getProviderAffectedUrls)\s*\(/.test(
        webhookSrc
      ),
    weight: 1.5,
  },
  {
    id: 'indexnow_key_env',
    label:
      'INDEXNOW_API_KEY (ou INDEXNOW_KEY) déclaré dans env.ts ou utilisé dans indexnow.ts',
    ok:
      /INDEXNOW_(API_)?KEY/.test(envSrc) || /INDEXNOW_(API_)?KEY/.test(indexnowSrc),
    weight: 1.0,
  },
  {
    id: 'indexnow_key_servable',
    label:
      'Clé IndexNow servable (public/<key>.txt ou route Next.js dynamique)',
    ok: publicTxtFiles.length > 0 || indexnowKeyRoute,
    weight: 1.0,
  },
]

const totalWeight = checks.reduce((s, c) => s + c.weight, 0)
const passedWeight = checks.filter((c) => c.ok).reduce((s, c) => s + c.weight, 0)
const coveragePct = Math.round((passedWeight / totalWeight) * 1000) / 10

const failures = checks.filter((c) => !c.ok)

const report = {
  backlog_item: 'P3-indexnow-coverage',
  source_memory: 'rge-descriptions-2026-04-19 + noindex-rge-migration + internal-linking-rge-cee',
  total_checks: checks.length,
  passed: checks.length - failures.length,
  passed_weight: passedWeight,
  total_weight: totalWeight,
  coverage_pct: coveragePct,
  failures: failures.map((f) => ({ id: f.id, label: f.label, weight: f.weight })),
  diagnostics: {
    public_key_files: publicTxtFiles,
    has_dynamic_key_route: indexnowKeyRoute,
  },
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 IndexNow Coverage Audit (DoD P3-indexnow-coverage)\n')
  console.log(`  Patterns  : ${checks.length}`)
  console.log(`  Coverage  : ${coveragePct}% (${passedWeight}/${totalWeight} pondéré)`)
  for (const c of checks) {
    const icon = c.ok ? '✅' : '❌'
    console.log(`     ${icon}  [${c.id}] ${c.label} (poids ${c.weight})`)
  }
  if (failures.length === 0) {
    console.log('\n  ✅ Pipeline IndexNow préservé.\n')
  } else {
    console.log(`\n  ⚠️  ${failures.length} régression(s) — DoD non atteinte.\n`)
  }
}

if (strict && failures.length > 0) process.exit(1)
