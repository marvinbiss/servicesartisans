import { NextRequest, NextResponse } from 'next/server'
import { PROVIDER_BATCH_SIZE, escapeXmlLoc } from '@/lib/seo/sitemap-manifest'
import { resolveProviderUrl, PROVIDER_SELECT_COLUMNS } from '@/lib/seo/provider-url-resolver'
import type { ProviderRow } from '@/lib/seo/provider-url-resolver'
import { logger } from '@/lib/logger'

/**
 * Dynamic API route for provider sitemaps.
 * Serves /sitemap/providers-{id}.xml via next.config.js rewrite.
 *
 * Three code paths (evaluated in order):
 *   0. KILL-SWITCH: if SITEMAP_PROVIDERS_FORCE_LEGACY=true, skip fast path entirely.
 *   1. FAST PATH: reads from provider_sitemap_urls table (pre-computed, snapshot-aware).
 *      Single indexed query, no pagination, no slug resolution. p95 < 500ms.
 *      Includes freshness check — if active snapshot is stale, log warning.
 *      Defensive: if multiple active snapshots exist (corruption), picks latest
 *      snapshot_id deterministically + logs critical alert.
 *   2. LEGACY FALLBACK: if provider_sitemap_urls is empty or no active snapshot,
 *      falls back to the original paginated query + runtime slug resolution.
 *
 * The fast path is used automatically once the refresh script has been run
 * and an active snapshot exists in the sitemap_snapshots table.
 */
const sitemapLog = logger.child({ component: 'sitemap-providers' })

const LEGACY_PAGE_SIZE = 1000

// Freshness thresholds (configurable via env, defaults in ms)
const FRESHNESS_WARNING_MS = parseInt(process.env.SITEMAP_FRESHNESS_WARNING_HOURS || '168', 10) * 3600000 // default 7 days
const FRESHNESS_CRITICAL_MS = parseInt(process.env.SITEMAP_FRESHNESS_CRITICAL_HOURS || '336', 10) * 3600000 // default 14 days

export async function GET(request: NextRequest) {
  const startMs = Date.now()
  const { searchParams } = request.nextUrl
  const id = searchParams.get('id')

  if (!id || !/^\d+$/.test(id)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const batchIndex = parseInt(id, 10)

  // ── Kill-switch: force legacy fallback via env var ────────────────────
  const forceLegacy = process.env.SITEMAP_PROVIDERS_FORCE_LEGACY === 'true'

  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()

    // ── Try fast path (unless kill-switch is active) ───────────────────
    if (!forceLegacy) {
      // Get active snapshot — order by snapshot_id DESC for deterministic pick
      // if corruption ever results in multiple active rows
      const { data: activeSnapshot, error: snapshotError } = await supabase
        .from('sitemap_snapshots')
        .select('snapshot_id, activated_at')
        .eq('status', 'active')
        .order('snapshot_id', { ascending: false })
        .limit(1)

      if (!snapshotError && activeSnapshot && activeSnapshot.length > 0) {
        const activeSnapshotId = activeSnapshot[0].snapshot_id

        // Freshness check
        const activatedAt = activeSnapshot[0].activated_at
        if (activatedAt) {
          const ageMs = Date.now() - new Date(activatedAt).getTime()
          if (ageMs > FRESHNESS_CRITICAL_MS) {
            sitemapLog.error('sitemap-providers: active snapshot is critically stale', {
              snapshotId: String(activeSnapshotId),
              ageHours: String(Math.round(ageMs / 3600000)),
              threshold: 'critical',
              event: 'sitemap.freshness_critical',
            })
          } else if (ageMs > FRESHNESS_WARNING_MS) {
            sitemapLog.warn('sitemap-providers: active snapshot approaching staleness', {
              snapshotId: String(activeSnapshotId),
              ageHours: String(Math.round(ageMs / 3600000)),
              threshold: 'warning',
              event: 'sitemap.freshness_warning',
            })
          }
        }

        // Fast path: read from pre-computed table with snapshot filter
        const tDbStart = Date.now()
        const { data: precomputed, error: precomputedError } = await supabase
          .from('provider_sitemap_urls')
          .select('url, lastmod')
          .eq('snapshot_id', activeSnapshotId)
          .eq('batch_id', batchIndex)
          .order('id', { ascending: true })

        const tDb = Date.now() - tDbStart

        if (!precomputedError && precomputed && precomputed.length === 0) {
          // Snapshot exists but batch is empty: return 404 immediately.
          // Don't fall through to legacy — the batch simply doesn't exist.
          sitemapLog.info('sitemap-providers: empty batch in active snapshot, returning 404', {
            batchIndex: String(batchIndex),
            snapshotId: String(activeSnapshotId),
            tDbMs: String(tDb),
          })
          return new NextResponse('Not found', { status: 404 })
        }

        if (!precomputedError && precomputed && precomputed.length > 0) {
          // Fast path: pre-computed URLs available
          const tXmlStart = Date.now()
          const urls = precomputed.map(row => {
            const loc = escapeXmlLoc(row.url)
            const lastmod = row.lastmod ? row.lastmod : undefined
            return `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`
          })

          const xml = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            ...urls,
            '</urlset>',
          ].join('\n')
          const tXml = Date.now() - tXmlStart

          const durationMs = Date.now() - startMs
          sitemapLog.info('sitemap-providers generated (fast path)', {
            batchIndex: String(batchIndex),
            urlsGenerated: String(urls.length),
            snapshotId: String(activeSnapshotId),
            tDbMs: String(tDb),
            tXmlMs: String(tXml),
            durationMs: String(durationMs),
            path: 'fast',
          })

          return new NextResponse(xml, {
            headers: {
              'Content-Type': 'application/xml; charset=utf-8',
              'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
          })
        }
      } else if (!snapshotError) {
        // No active snapshot found — explicit log
        sitemapLog.warn('sitemap-providers: no active snapshot found, falling back to legacy', {
          batchIndex: String(batchIndex),
          event: 'sitemap.no_active_snapshot',
        })
      }
    }

    // ── Legacy fallback: paginated query + runtime resolution ────────────
    sitemapLog.warn('sitemap-providers using legacy fallback', {
      batchIndex: String(batchIndex),
      reason: forceLegacy ? 'kill-switch active (SITEMAP_PROVIDERS_FORCE_LEGACY=true)' : 'no active snapshot or empty batch',
    })

    const offset = batchIndex * PROVIDER_BATCH_SIZE
    let allProviders: ProviderRow[] = []
    let from = offset
    const limit = offset + PROVIDER_BATCH_SIZE

    while (from < limit) {
      const { data, error } = await supabase
        .from('providers')
        .select(PROVIDER_SELECT_COLUMNS)
        .eq('is_active', true)
        .eq('noindex', false)
        .order('id', { ascending: true })
        .range(from, Math.min(from + LEGACY_PAGE_SIZE - 1, limit - 1))

      if (error) {
        sitemapLog.error('sitemap-providers: legacy pagination query error', {
          batchIndex: String(batchIndex),
          pageFrom: String(from),
          code: error.code,
          message: error.message,
        })
        break
      }
      if (!data || data.length === 0) break
      allProviders = allProviders.concat(data as ProviderRow[])
      if (data.length < LEGACY_PAGE_SIZE) break
      from += LEGACY_PAGE_SIZE
    }

    let droppedCount = 0
    const urls = allProviders
      .map((p) => {
        const resolved = resolveProviderUrl(p)
        if (!resolved) {
          droppedCount++
          return null
        }
        const loc = escapeXmlLoc(resolved.url)
        return `  <url><loc>${loc}</loc>${resolved.lastmod ? `<lastmod>${resolved.lastmod}</lastmod>` : ''}</url>`
      })
      .filter((entry): entry is string => entry !== null)

    const durationMs = Date.now() - startMs
    sitemapLog.warn('sitemap-providers generated (legacy fallback)', {
      batchIndex: String(batchIndex),
      providersQueried: String(allProviders.length),
      urlsGenerated: String(urls.length),
      droppedProviders: String(droppedCount),
      durationMs: String(durationMs),
      path: 'legacy',
    })

    // Empty batch: return 404 instead of empty <urlset> (which Google
    // rejects with "Balise XML manquante" for missing <url> tag).
    if (urls.length === 0) {
      sitemapLog.info('sitemap-providers: empty batch, returning 404', {
        batchIndex: String(batchIndex),
        path: 'legacy',
      })
      return new NextResponse('Not found', { status: 404 })
    }

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls,
      '</urlset>',
    ].join('\n')

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (err) {
    const durationMs = Date.now() - startMs
    sitemapLog.error('sitemap-providers failed, returning 404', err, {
      batchIndex: String(batchIndex),
      durationMs: String(durationMs),
    })
    // Return 404 on error — an empty <urlset> without <url> tags triggers
    // Google's "Balise XML manquante" error. A 404 is a cleaner signal.
    return new NextResponse('Not found', {
      status: 404,
      headers: { 'Cache-Control': 'public, s-maxage=60' },
    })
  }
}
