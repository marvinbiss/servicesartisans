/**
 * CLI — Bouclier 4 plan v2.
 * Usage: tsx scripts/check-bundle-budget.ts [--baseline]
 *
 * Lit `.next/app-build-manifest.json` + `.next/build-manifest.json`,
 * scanne `.next/static/chunks/` pour les tailles, audit vs `bundle-budgets.json`.
 *
 * Modes :
 *   --baseline : print l'état actuel sans exit-non-zero (utile pour calibrer)
 *   default    : exit 1 sur violation
 */
import fs from 'node:fs'
import path from 'node:path'
import {
  checkBundleBudgets,
  formatBytes,
  type BundleBudgets,
  type BundleManifest,
} from '../src/lib/seo/bundle-budget'

const NEXT_DIR = path.resolve(process.cwd(), '.next')
const BUDGETS_PATH = path.resolve(process.cwd(), 'bundle-budgets.json')
const isBaseline = process.argv.includes('--baseline')

function readJson<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, 'utf-8')) as T
}

function fileSizeBytes(p: string): number {
  try {
    return fs.statSync(p).size
  } catch {
    return 0
  }
}

/**
 * Walk `.next/static/` récursivement, retourne `{ "static/.../foo.js": bytes }`.
 * Les chemins sont relatifs à `.next/` pour matcher le manifest.
 */
function collectFileSizes(): Record<string, number> {
  const sizes: Record<string, number> = {}
  function walk(dir: string, rel: string) {
    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name)
      const relPath = rel ? `${rel}/${entry.name}` : entry.name
      if (entry.isDirectory()) {
        walk(full, relPath)
      } else if (entry.isFile() && relPath.endsWith('.js')) {
        sizes[relPath] = fileSizeBytes(full)
      }
    }
  }
  walk(path.join(NEXT_DIR, 'static'), 'static')
  return sizes
}

function mergeManifests(): BundleManifest {
  const merged: BundleManifest = { pages: {}, rootMainFiles: [] }
  // App Router
  const appPath = path.join(NEXT_DIR, 'app-build-manifest.json')
  if (fs.existsSync(appPath)) {
    const app = readJson<{ pages: Record<string, string[]>; rootMainFiles?: string[] }>(appPath)
    Object.assign(merged.pages, app.pages ?? {})
    merged.rootMainFiles = app.rootMainFiles ?? merged.rootMainFiles
  }
  // Pages Router (legacy)
  const legacyPath = path.join(NEXT_DIR, 'build-manifest.json')
  if (fs.existsSync(legacyPath)) {
    const legacy = readJson<{
      pages: Record<string, string[]>
      rootMainFiles?: string[]
    }>(legacyPath)
    for (const [route, chunks] of Object.entries(legacy.pages ?? {})) {
      if (!merged.pages[route]) merged.pages[route] = chunks
    }
    if ((merged.rootMainFiles ?? []).length === 0) {
      merged.rootMainFiles = legacy.rootMainFiles ?? []
    }
  }
  return merged
}

function main() {
  if (!fs.existsSync(NEXT_DIR)) {
    console.error('[bundle-budget] .next/ not found — run `npm run build` first.')
    process.exit(2)
  }
  if (!fs.existsSync(BUDGETS_PATH)) {
    console.error('[bundle-budget] bundle-budgets.json not found at repo root.')
    process.exit(2)
  }

  const manifest = mergeManifests()
  const fileSizes = collectFileSizes()
  const budgets = readJson<BundleBudgets>(BUDGETS_PATH)
  const report = checkBundleBudgets(manifest, fileSizes, budgets)

  console.log('\n[bundle-budget] Top 10 routes (first-load JS desc):')
  for (const r of report.routes.slice(0, 10)) {
    const status = r.firstLoadBytes > r.budget ? 'X' : 'OK'
    console.log(
      `  [${status}] ${r.route.padEnd(45)} ${formatBytes(r.firstLoadBytes).padStart(10)} / ${formatBytes(r.budget)}`
    )
  }

  console.log('\n[bundle-budget] Top 5 chunks (size desc):')
  for (const c of report.largestChunks.slice(0, 5)) {
    console.log(`  ${c.chunk.padEnd(60)} ${formatBytes(c.bytes).padStart(10)}`)
  }

  if (report.violations.length === 0) {
    console.log('\n[bundle-budget] OK : 0 violation.')
    process.exit(0)
  }

  console.log(`\n[bundle-budget] ${report.violations.length} violation(s) :`)
  for (const v of report.violations) {
    if (v.kind === 'route') {
      console.log(
        `  - route ${v.route} : ${formatBytes(v.actual)} > ${formatBytes(v.budget)} (+${formatBytes(v.delta)})`
      )
    } else {
      console.log(
        `  - chunk ${v.chunk} : ${formatBytes(v.actual)} > ${formatBytes(v.budget)} (+${formatBytes(v.delta)})`
      )
    }
  }

  if (isBaseline) {
    console.log('\n[bundle-budget] --baseline : violations non bloquantes.')
    process.exit(0)
  }
  process.exit(1)
}

main()
