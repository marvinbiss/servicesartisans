/**
 * Cron : IndexNow batch auto — push quotidien des pages récemment modifiées.
 *
 * Complément du cron `indexnow-submit` (rotation statique pSEO 2500/jour) :
 * ce cron cible spécifiquement les **nouvelles pages** (lastmod récent dans
 * sitemap.xml) et les **providers DB** dont `updated_at` < 2 jours. Cap
 * volontairement bas (1000 URLs/jour) pour rester gentil avec le quota
 * IndexNow et éviter le recouvrement avec l'autre cron.
 *
 * Logique :
 *   1. Lit dynamiquement le sitemap.xml (index + sub-sitemaps) en HTTP et
 *      filtre les entrées `<lastmod>` ≥ now - SITEMAP_LOOKBACK_DAYS. Élimine
 *      la dérive d'une whitelist statique. Fallback whitelist minimal si le
 *      sitemap.xml répond mal.
 *   2. Query providers updated_at >= now - 2j (cron quotidien donc 48h ≈ 2x
 *      grace pour rattraper si run skip).
 *   3. Filtre via `evaluateGonePath` + dedup + cap 1000.
 *   4. Submit via `submitToIndexNow` (handle batching + timeout + log).
 *
 * Schedule : `0 8 * * *` (8h UTC = 9h Paris hiver / 10h été — après le cron
 * `indexnow-submit` de 6h15 pour ne pas se chevaucher sur le quota Bing).
 */
import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { SITE_URL } from '@/lib/seo/config'
import { evaluateGonePath } from '@/lib/seo/gone-paths'
import { pingHeartbeat } from '@/lib/monitoring/heartbeat'
import { submitToIndexNow } from '@/lib/seo/indexnow'
import { logger } from '@/lib/logger'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

// Force dynamic rendering — cron lit request.headers (cron-secret) à chaque appel.
export const dynamic = 'force-dynamic'

/** Cap quotidien volontairement bas pour rester sous le radar Bing. */
const MAX_URLS_PER_DAY = 1000

// SLA-99.9 : cap dur par run (alias explicite de MAX_URLS_PER_DAY) + wall-clock
// guard 50s + lease anti-double-run.
const MAX_URLS_PER_RUN = MAX_URLS_PER_DAY
const MAX_RUNTIME_MS = 50_000
const LEASE_NAME = 'cron_indexnow_batch'
const LEASE_TTL_SECONDS = 15 * 60
/** Fenêtre updated_at pour les providers — 2 jours = grace si cron skip 1 fois. */
const LOOKBACK_DAYS = 2
/** Fenêtre lastmod pour le filtrage sitemap — un peu plus large pour rattraper. */
const SITEMAP_LOOKBACK_DAYS = 7
/** Cap absolu sur le nombre de sub-sitemaps lus (sitemap index ~39 entrées connues). */
const MAX_SUBSITEMAPS = 50
/** Cap absolu sur URLs extraites du sitemap (reste du quota va aux providers). */
const MAX_SITEMAP_URLS = 500
/** Timeout par fetch sitemap pour éviter le cron blocking. */
const SITEMAP_FETCH_TIMEOUT_MS = 10_000

export const maxDuration = 60

/**
 * Fallback whitelist minimale — utilisée UNIQUEMENT si la lecture sitemap.xml
 * échoue (DNS, 5xx, parse). Garde un floor pour les hubs reno les plus
 * critiques afin qu'un run dégradé pousse toujours quelque chose. La source
 * de vérité est désormais `${SITE_URL}/sitemap.xml`.
 */
const FALLBACK_RENO_ROUTES: readonly string[] = [
  '/renovation-energetique',
  '/renovation-energetique/aides',
  '/renovation-energetique/travaux',
  '/renovation-energetique/travaux/pompe-a-chaleur',
  '/renovation-energetique/travaux/vmc',
  '/simulateur-aides-renovation',
  '/barometre/renovation-energetique-2026',
  '/comparatif-primes-cee-2026',
  '/devenir-partenaire-cee',
  '/leads-exclusifs-vs-partages',
] as const

const SITEMAP_USER_AGENT = 'ServicesArtisans-IndexNow-Cron/1.0'

/**
 * Lit le sitemap.xml (index + sub-sitemaps) et retourne les URLs dont le
 * `<lastmod>` est dans les `daysAgo` derniers jours.
 *
 * Robuste :
 *   - Cap `MAX_SUBSITEMAPS` sur le nombre de sub-sitemaps lus
 *   - `AbortSignal.timeout(SITEMAP_FETCH_TIMEOUT_MS)` par fetch
 *   - Un sub-sitemap qui échoue (5xx, parse fail) est skip silencieusement
 *
 * Throw uniquement si le sitemap INDEX lui-même est inaccessible — le caller
 * bascule alors sur la fallback whitelist.
 */
async function fetchRecentSitemapUrls(daysAgo: number, limit: number): Promise<string[]> {
  const sitemapIndex = `${SITE_URL}/sitemap.xml`
  const cutoff = new Date(Date.now() - daysAgo * 86_400_000)

  const indexRes = await fetch(sitemapIndex, {
    headers: { 'User-Agent': SITEMAP_USER_AGENT },
    cache: 'no-store',
    signal: AbortSignal.timeout(SITEMAP_FETCH_TIMEOUT_MS),
  })
  if (!indexRes.ok) {
    throw new Error(`Sitemap index HTTP ${indexRes.status}`)
  }
  const indexXml = await indexRes.text()

  // Parse via exec-loop pour éviter le besoin de --downlevelIteration sur les iterators.
  const subSitemaps: string[] = []
  const locRegex = /<loc>([^<]+)<\/loc>/g
  let locMatch: RegExpExecArray | null
  while ((locMatch = locRegex.exec(indexXml)) !== null) {
    if (subSitemaps.length >= MAX_SUBSITEMAPS) break
    const u = locMatch[1].trim()
    if (u.startsWith('http')) subSitemaps.push(u)
  }

  const urls = new Set<string>()
  for (const subUrl of subSitemaps) {
    if (urls.size >= limit) break
    try {
      const subRes = await fetch(subUrl, {
        headers: { 'User-Agent': SITEMAP_USER_AGENT },
        cache: 'no-store',
        signal: AbortSignal.timeout(SITEMAP_FETCH_TIMEOUT_MS),
      })
      if (!subRes.ok) continue
      const subXml = await subRes.text()
      const entryRegex = /<url>\s*<loc>([^<]+)<\/loc>\s*(?:<lastmod>([^<]+)<\/lastmod>)?/g
      let entryMatch: RegExpExecArray | null
      while ((entryMatch = entryRegex.exec(subXml)) !== null) {
        if (urls.size >= limit) break
        const loc = entryMatch[1]?.trim()
        const lastmodStr = entryMatch[2]?.trim()
        if (!loc || !lastmodStr) continue
        const lm = new Date(lastmodStr)
        if (Number.isNaN(lm.getTime())) continue
        if (lm < cutoff) continue
        urls.add(loc)
      }
    } catch {
      // 5xx, timeout, parse error — skip ce sub-sitemap silencieusement
      continue
    }
  }
  return Array.from(urls)
}

/**
 * Filter relative routes through `evaluateGonePath` (skip 410s) + dedup + absolutize.
 * Utilisé pour la fallback whitelist (chemins relatifs hardcodés).
 */
function filterAndAbsolutize(routes: readonly string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const route of routes) {
    if (!route.startsWith('/')) continue
    // Skip routes that would 410 via middleware — never burn IndexNow credit on dead URLs.
    const decision = evaluateGonePath(route)
    if (decision.gone) continue
    const abs = `${SITE_URL}${route}`
    if (seen.has(abs)) continue
    seen.add(abs)
    out.push(abs)
  }
  return out
}

/**
 * Filter absolute URLs (issues du sitemap) — extrait le pathname, applique
 * `evaluateGonePath`, dedupe et garde l'URL absolue d'origine.
 */
function filterAbsoluteUrls(urls: readonly string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const url of urls) {
    let pathname: string
    try {
      pathname = new URL(url).pathname
    } catch {
      continue
    }
    if (!pathname.startsWith('/')) continue
    const decision = evaluateGonePath(pathname)
    if (decision.gone) continue
    if (seen.has(url)) continue
    seen.add(url)
    out.push(url)
  }
  return out
}

/**
 * Query providers updated in last LOOKBACK_DAYS days, return canonical URLs.
 * Graceful degrade if Supabase unavailable.
 */
async function getRecentProviderUrls(limit: number): Promise<string[]> {
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const { getArtisanUrl } = await import('@/lib/utils')
    const supabase = createAdminClient()
    const cutoff = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('providers')
      .select('stable_id, slug, specialty, address_city')
      .eq('is_active', true)
      .eq('noindex', false)
      .gte('updated_at', cutoff)
      .not('specialty', 'is', null)
      .not('address_city', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (error) {
      logger.warn('indexnow-batch: failed to fetch fresh providers', { error: error.message })
      return []
    }
    if (!data) return []

    const urls = new Set<string>()
    for (const p of data) {
      const u = getArtisanUrl({
        slug: p.slug as string | null,
        stable_id: p.stable_id as string | null,
        specialty: p.specialty as string | null,
        city: p.address_city as string | null,
      })
      if (u && !u.endsWith('/')) urls.add(`${SITE_URL}${u}`)
    }
    return Array.from(urls)
  } catch (err) {
    logger.warn('indexnow-batch: Supabase unavailable', {
      error: err instanceof Error ? err.message : 'unknown',
    })
    return []
  }
}

export const GET = withCronCheckIn('cron-indexnow-batch', async (request: Request) => {
  return await Sentry.withMonitor(
    'cron-indexnow-batch',
    async () => {
      if (!process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
      }
      const authHeader = request.headers.get('authorization')
      if (!verifyCronSecret(authHeader)) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
      }

      const startedAt = Date.now()
      const { createAdminClient: createLeaseClient } = await import('@/lib/supabase/admin')
      const leaseSupabase = createLeaseClient()

      // SLA-99.9 : lease avec abort 5s.
      const leaseController = new AbortController()
      const leaseTimer = setTimeout(() => leaseController.abort(), 5_000)
      let acquired: boolean | null = null
      let leaseErr: { message: string } | null = null
      try {
        const result = await leaseSupabase
          .rpc('acquire_cron_lease', {
            p_name: LEASE_NAME,
            p_ttl_seconds: LEASE_TTL_SECONDS,
          })
          .abortSignal(leaseController.signal)
        acquired = result.data as boolean | null
        leaseErr = result.error
      } catch (err) {
        leaseErr = { message: err instanceof Error ? err.message : String(err) }
      } finally {
        clearTimeout(leaseTimer)
      }

      if (leaseErr) {
        logger.error('indexnow-batch: lease error', {
          lease: LEASE_NAME,
          error: leaseErr.message,
        })
        return NextResponse.json({ error: 'lease_error' }, { status: 500 })
      }
      if (acquired !== true) {
        logger.info('indexnow-batch: skipped (lease already held)', { lease: LEASE_NAME })
        return NextResponse.json({ ok: true, skipped: true, reason: 'already_running' })
      }

      try {
        // ── 1. Dynamic sitemap.xml read (replaces static whitelist) ───────
        let sitemapUrls: string[] = []
        let sitemapSource: 'sitemap' | 'fallback' = 'sitemap'
        try {
          const raw = await fetchRecentSitemapUrls(SITEMAP_LOOKBACK_DAYS, MAX_SITEMAP_URLS)
          sitemapUrls = filterAbsoluteUrls(raw)
        } catch (err) {
          sitemapSource = 'fallback'
          const message = err instanceof Error ? err.message : 'unknown'
          logger.warn('indexnow-batch: sitemap fetch failed, using fallback whitelist', {
            error: message,
          })
          Sentry.captureMessage('indexnow-batch sitemap fetch failed', {
            level: 'warning',
            extra: { error: message },
          })
          sitemapUrls = filterAndAbsolutize(FALLBACK_RENO_ROUTES)
        }

        // ── 2. Fresh providers from DB ────────────────────────────────────
        // Reserve LIMIT-sitemapUrls for provider routes.
        const providerSlots = Math.max(0, MAX_URLS_PER_DAY - sitemapUrls.length)
        const providerUrls = providerSlots > 0 ? await getRecentProviderUrls(providerSlots) : []

        // ── 3. Merge + dedup + cap ────────────────────────────────────────
        const merged = [...sitemapUrls, ...providerUrls]
        const uniqueUrls = Array.from(new Set(merged)).slice(0, MAX_URLS_PER_RUN)

        logger.info('indexnow-batch: submitting URLs', {
          action: 'indexnow-batch-cron',
          sitemapCount: sitemapUrls.length,
          sitemapSource,
          providerCount: providerUrls.length,
          totalUnique: uniqueUrls.length,
          cap: MAX_URLS_PER_DAY,
          lookbackDays: LOOKBACK_DAYS,
          sitemapLookbackDays: SITEMAP_LOOKBACK_DAYS,
        })

        if (uniqueUrls.length === 0) {
          await pingHeartbeat('indexnow-batch')
          return NextResponse.json({
            submitted: 0,
            success: true,
            note: 'no URLs candidate',
            breakdown: { sitemap: 0, providers: 0, sitemapSource },
          })
        }

        // SLA-99.9 : wall-clock guard — si la lecture sitemap+DB a mangé le
        // budget, on skip le POST plutôt que de risquer un kill avant release.
        if (Date.now() - startedAt > MAX_RUNTIME_MS) {
          logger.warn('indexnow-batch: wall-clock budget exhausted before submit, skipping', {
            elapsedMs: Date.now() - startedAt,
            pendingUrls: uniqueUrls.length,
          })
          return NextResponse.json({
            ok: true,
            skipped: true,
            reason: 'wallclock_budget',
            submitted: 0,
          })
        }

        const result = await submitToIndexNow(uniqueUrls)

        await pingHeartbeat('indexnow-batch')
        return NextResponse.json({
          ...result,
          urlCount: uniqueUrls.length,
          breakdown: { sitemap: sitemapUrls.length, providers: providerUrls.length, sitemapSource },
          lookbackDays: LOOKBACK_DAYS,
          sitemapLookbackDays: SITEMAP_LOOKBACK_DAYS,
        })
      } finally {
        // SLA-99.9 : release best-effort.
        try {
          await leaseSupabase.rpc('release_cron_lease', { p_name: LEASE_NAME })
        } catch {
          // swallowed : TTL acts as safety net
        }
      }
    },
    {
      schedule: { type: 'crontab', value: '0 8 * * *' },
    }
  )
})
