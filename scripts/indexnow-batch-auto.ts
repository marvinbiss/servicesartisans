/**
 * IndexNow batch auto-submission — découverte automatique d'URLs récentes.
 *
 * Pourquoi ce script ?
 *   - Le cron `indexnow-submit` (route.ts) couvre les pages pSEO rotées (top
 *     villes × services, devis, tarifs, etc) — strict mais statique.
 *   - Les **nouvelles pages reno/cluster** ajoutées au filesystem (Sprint 1
 *     VMC, Sprint 3 ballon thermodynamique, Sprint 5 baromètre…) ne sont pas
 *     toutes whitelistées dans le cron historique.
 *   - Solution : scanner `src/app/(public)` pour trouver les pages reno
 *     récentes (mtime ≤ N jours) + croiser avec providers DB `updated_at` pour
 *     les fiches RGE fraîches → push IndexNow.
 *
 * Filtrage de sécurité :
 *   - `evaluateGonePath()` (zéro I/O, Edge-friendly) skip toute URL qui
 *     retournerait un 410 via middleware.
 *   - Pages avec `noindex: true` côté DB skip.
 *   - Cap par run pour ne pas brûler le quota IndexNow.
 *
 * Modes :
 *   --dry-run     (default) : liste les URLs sans soumettre
 *   --days=N      (default 30) : ne considère que pages mtime ≤ N jours
 *   --limit=N     (default 10000) : cap absolu sur # URLs (IndexNow accepte 10K/batch)
 *
 * Usage :
 *   npx tsx scripts/indexnow-batch-auto.ts --dry-run --days=7
 *   npx tsx scripts/indexnow-batch-auto.ts --days=30 --limit=2000   # live submit
 *
 * Prérequis :
 *   - INDEXNOW_API_KEY dans .env.local
 *   - NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (pour providers récents)
 *
 * Le cron `/api/cron/indexnow-batch` (route.ts) wrappe ce script en mode
 * `--days=2 --limit=1000` quotidien.
 */
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { evaluateGonePath } from '../src/lib/seo/gone-paths'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr')
  .trim()
  .replace(/\/+$/, '')
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow'
const APP_PUBLIC_DIR = path.join(__dirname, '..', 'src', 'app', '(public)')

const DRY_RUN = process.argv.includes('--dry-run') || !process.argv.some((a) => a === '--live')
const DAYS = (() => {
  const arg = process.argv.find((a) => a.startsWith('--days='))
  const v = arg ? parseInt(arg.split('=')[1], 10) : 30
  return Number.isFinite(v) && v > 0 ? v : 30
})()
const LIMIT = (() => {
  const arg = process.argv.find((a) => a.startsWith('--limit='))
  const v = arg ? parseInt(arg.split('=')[1], 10) : 10_000
  return Number.isFinite(v) && v > 0 ? Math.min(v, 10_000) : 10_000
})()

function nowIso(): string {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

function logLine(logPath: string, line: string): void {
  // eslint-disable-next-line no-console
  console.log(line)
  fs.appendFileSync(logPath, `${new Date().toISOString()} ${line}\n`, 'utf8')
}

/**
 * Walk `src/app/(public)` and collect routes whose `page.tsx` was modified in
 * the last DAYS days. Route is reconstructed from the directory path, with
 * Next.js route-group `(...)` and parallel `@...` segments stripped.
 *
 * Skipped :
 *   - directories named with `[...]` (dynamic params — can't construct concrete URL)
 *   - files other than `page.tsx`
 *   - paths under `/api/` (not user-facing)
 */
function collectRecentFilesystemRoutes(rootDir: string, days: number): string[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  const routes: string[] = []

  function walk(dir: string, urlSegments: string[]): void {
    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        // Skip Next.js dynamic segments — we can't list concrete URLs from here.
        if (entry.name.startsWith('[')) continue
        // Skip parallel/intercepting routes — non-canonical.
        if (entry.name.startsWith('@') || entry.name.startsWith('(.')) continue
        // Strip route groups (parentheses) from URL but recurse into them.
        const isRouteGroup = entry.name.startsWith('(') && entry.name.endsWith(')')
        const nextSegments = isRouteGroup ? urlSegments : [...urlSegments, entry.name]
        walk(fullPath, nextSegments)
      } else if (entry.isFile() && entry.name === 'page.tsx') {
        let stat: fs.Stats
        try {
          stat = fs.statSync(fullPath)
        } catch {
          continue
        }
        if (stat.mtimeMs < cutoff) continue
        const route = `/${urlSegments.join('/')}`.replace(/\/+$/, '') || '/'
        routes.push(route)
      }
    }
  }

  walk(rootDir, [])
  return Array.from(new Set(routes)).sort()
}

/**
 * Fetch providers updated in the last N days from Supabase (noindex=false).
 * Reconstruct canonical URLs via `/services/[s]/[v]/[publicId]`.
 *
 * Returns [] silently if Supabase env vars missing — graceful degrade.
 */
async function collectRecentProviderRoutes(days: number, limit: number): Promise<string[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return []

  // Lazy import — keep the script importable when Supabase env is absent
  // (e.g. dry-run pre-deploy on a fresh worktree).
  const { createClient } = await import('@supabase/supabase-js')
  const sb = createClient(url, key)

  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await sb
    .from('providers')
    .select('stable_id, slug, specialty, address_city')
    .eq('is_active', true)
    .eq('noindex', false)
    .gte('updated_at', cutoff)
    .not('specialty', 'is', null)
    .not('address_city', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []

  const { getArtisanUrl } = await import('../src/lib/utils')
  const out: string[] = []
  for (const p of data) {
    const u = getArtisanUrl({
      slug: p.slug as string | null,
      stable_id: p.stable_id as string | null,
      specialty: p.specialty as string | null,
      city: p.address_city as string | null,
    })
    if (u && !u.endsWith('/')) out.push(u)
  }
  return out
}

/** Hard exclusion list — paths that exist on FS but are NEVER user-facing canonical URLs. */
const ALWAYS_SKIP_PREFIXES = [
  '/api',
  '/admin',
  '/auth',
  '/(auth)',
  '/espace-client',
  '/espace-artisan',
]

function isUserFacing(route: string): boolean {
  return !ALWAYS_SKIP_PREFIXES.some((p) => route === p || route.startsWith(`${p}/`))
}

/**
 * Final filter combining gone-paths + always-skip + dedup.
 * Returns absolute URLs ready for IndexNow.
 */
function filterAndAbsolutize(routes: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const route of routes) {
    if (!route.startsWith('/')) continue
    if (!isUserFacing(route)) continue
    const decision = evaluateGonePath(route)
    if (decision.gone) continue
    const abs = `${SITE_URL}${route}`
    if (seen.has(abs)) continue
    seen.add(abs)
    out.push(abs)
  }
  return out
}

async function submitBatch(key: string, urls: string[]): Promise<{ status: number; ok: boolean }> {
  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: new URL(SITE_URL).hostname,
      key,
      keyLocation: `${SITE_URL}/${key}.txt`,
      urlList: urls,
    }),
    signal: AbortSignal.timeout(15_000),
  })
  return { status: res.status, ok: res.ok || res.status === 202 }
}

async function main(): Promise<void> {
  const tmpDir = path.join(__dirname, '..', 'tmp')
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
  const logPath = path.join(tmpDir, `indexnow-batch-${nowIso()}.log`)

  logLine(logPath, '=== IndexNow batch auto ===')
  logLine(logPath, `Mode    : ${DRY_RUN ? 'DRY-RUN (no submit)' : 'LIVE SUBMIT'}`)
  logLine(logPath, `Site    : ${SITE_URL}`)
  logLine(logPath, `Days    : ${DAYS}`)
  logLine(logPath, `Limit   : ${LIMIT}`)

  // ── Phase 1 : filesystem walk ──────────────────────────────────────────
  logLine(logPath, '')
  logLine(logPath, `Phase 1 — scanning ${APP_PUBLIC_DIR} (mtime ≤ ${DAYS}j)…`)
  const fsRoutes = collectRecentFilesystemRoutes(APP_PUBLIC_DIR, DAYS)
  logLine(logPath, `  filesystem routes: ${fsRoutes.length}`)

  // ── Phase 2 : DB providers ────────────────────────────────────────────
  logLine(logPath, '')
  logLine(logPath, `Phase 2 — querying providers updated_at ≥ now-${DAYS}j…`)
  let providerRoutes: string[] = []
  try {
    providerRoutes = await collectRecentProviderRoutes(DAYS, LIMIT)
  } catch (err) {
    logLine(logPath, `  WARN: provider fetch failed — ${String(err)}`)
  }
  logLine(logPath, `  provider routes: ${providerRoutes.length}`)

  // ── Phase 3 : merge + filter ──────────────────────────────────────────
  const merged = [...fsRoutes, ...providerRoutes]
  const absoluteUrls = filterAndAbsolutize(merged).slice(0, LIMIT)

  logLine(logPath, '')
  logLine(logPath, `Phase 3 — merge + filter (gone-paths, skip /api, dedup, cap)…`)
  logLine(logPath, `  pre-filter:  ${merged.length}`)
  logLine(logPath, `  post-filter: ${absoluteUrls.length}`)
  logLine(logPath, `  capped at LIMIT=${LIMIT}: ${absoluteUrls.length === LIMIT ? 'yes' : 'no'}`)

  // Detailed list only in dry-run (avoid log spam in cron).
  if (DRY_RUN) {
    for (const u of absoluteUrls.slice(0, 50)) logLine(logPath, `  - ${u}`)
    if (absoluteUrls.length > 50) {
      logLine(logPath, `  … (+${absoluteUrls.length - 50} more, see full log)`)
    }
  }

  if (DRY_RUN) {
    logLine(logPath, '')
    logLine(logPath, '[DRY-RUN] aucune soumission effectuée. Ajouter --live pour pousser.')
    logLine(logPath, `Log : ${logPath}`)
    return
  }

  if (absoluteUrls.length === 0) {
    logLine(logPath, 'Aucune URL candidate — rien à soumettre.')
    return
  }

  const key = process.env.INDEXNOW_API_KEY
  if (!key) {
    logLine(logPath, 'FATAL : INDEXNOW_API_KEY absent de .env.local')
    process.exit(1)
  }

  logLine(logPath, '')
  logLine(logPath, 'Phase 4 — IndexNow submission…')
  let result: { status: number; ok: boolean }
  try {
    result = await submitBatch(key, absoluteUrls)
  } catch (err) {
    logLine(logPath, `FATAL : exception réseau ${String(err)}`)
    process.exit(2)
  }

  logLine(logPath, `  HTTP ${result.status} ${result.ok ? 'OK' : 'FAIL'}`)
  if (!result.ok) {
    logLine(logPath, 'ECHEC : IndexNow a rejeté la soumission.')
    process.exit(3)
  }

  logLine(logPath, '')
  logLine(logPath, `OK — ${absoluteUrls.length} URLs soumises à Bing/Yandex.`)
  logLine(logPath, 'Recrawl attendu : Bing 24-48h, Yandex 24-72h.')
  logLine(logPath, `Log : ${logPath}`)
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[indexnow-batch-auto] FATAL :', err)
  process.exit(1)
})
