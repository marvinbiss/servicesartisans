#!/usr/bin/env node
/**
 * audit-cron-force-dynamic.mjs — anti-régression Vercel runtime.
 *
 * Tout `route.ts` sous `src/app/api` qui lit `request.headers` ou `headers()`
 * dans une méthode GET DOIT exporter `dynamic = 'force-dynamic'`. Sinon Next
 * App Router tente un pré-rendu statique et plante en prod avec :
 *   "Dynamic server usage: Route X couldn't be rendered statically
 *    because it used `request.headers`"
 *
 * POST/PUT/DELETE handlers sont déjà dynamiques par nature, on ne contrôle
 * que les crons (toujours dynamiques) + GET handlers qui lisent les headers.
 *
 * Bug observé en prod 2026-05-05 sur cee-dossier-transitions, gsc-sync,
 * abandon-emails, link-scores, metrics-snapshot, cache-warmup, etc.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const API_ROOT = join(process.cwd(), 'src', 'app', 'api')
const strict = process.argv.includes('--strict')

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    if (name === '__tests__' || name === 'node_modules') continue
    const full = join(dir, name)
    const stat = statSync(full)
    if (stat.isDirectory()) out.push(...walk(full))
    else if (name === 'route.ts' || name === 'route.tsx') out.push(full)
  }
  return out
}

const HEADER_USE = /\brequest\.headers\b|\bheaders\(\)/
const FORCE_DYNAMIC = /export\s+const\s+dynamic\s*=\s*['"]force-dynamic['"]/
const EDGE_RUNTIME = /export\s+const\s+runtime\s*=\s*['"]edge['"]/
const HAS_GET = /export\s+(async\s+)?function\s+GET\b|export\s+const\s+GET\b/

const violations = []
for (const file of walk(API_ROOT)) {
  const src = readFileSync(file, 'utf8')
  const isCron = file.includes('/api/cron/') || file.includes('\\api\\cron\\')
  const usesHeaders = HEADER_USE.test(src)
  const hasGet = HAS_GET.test(src)
  const hasDirective = FORCE_DYNAMIC.test(src) || EDGE_RUNTIME.test(src)

  // Cron : toujours requis (chaque cron lit cron-secret).
  // Non-cron : requis seulement si GET handler lit les headers.
  const required = isCron || (hasGet && usesHeaders)
  if (required && !hasDirective) {
    violations.push(file.replace(/\\/g, '/').replace(/.*\/src\//, 'src/'))
  }
}

if (violations.length === 0) {
  console.log(
    `✅ audit-cron-force-dynamic : tous les handlers sensibles ont \`force-dynamic\`.`
  )
  process.exit(0)
}

console.error(`\n❌ ${violations.length} route(s) sans \`force-dynamic\` :\n`)
for (const v of violations) {
  console.error(`  ${v}\n    → ajouter avant la première fonction:\n      export const dynamic = 'force-dynamic'`)
}
console.error(
  '\n  Sinon Vercel logs en prod : "Dynamic server usage: Route ... couldn\'t be rendered statically because it used `request.headers`".\n'
)
process.exit(strict ? 1 : 0)
