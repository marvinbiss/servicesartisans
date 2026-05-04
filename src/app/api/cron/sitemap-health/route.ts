import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { SITE_URL } from '@/lib/seo/config'
import { logger } from '@/lib/logger'
import { pingHeartbeat } from '@/lib/monitoring/heartbeat'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { computeSitemapDiff, persistSitemapRun, type SitemapRun } from '@/lib/seo/sitemap-diff'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

const RGE_STALE_WARN_DAYS = 7
const RGE_STALE_CRITICAL_DAYS = 14

type RgeFreshness = {
  ok: boolean
  lastSyncedAt: string | null
  daysStale: number | null
  severity: 'ok' | 'warn' | 'error' | 'unknown'
}

/**
 * Fail-open freshness check for the weekly RGE ADEME sync.
 * Logs structured events but never throws — sitemap health must not be impacted.
 */
async function checkRgeFreshness(): Promise<RgeFreshness> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('providers')
      .select('rge_last_synced_at')
      .not('rge_last_synced_at', 'is', null)
      .order('rge_last_synced_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      logger.warn('rge_sync_freshness_check_failed', {
        kind: 'rge_sync_check_error',
        error: error.message,
      })
      return { ok: false, lastSyncedAt: null, daysStale: null, severity: 'unknown' }
    }

    const lastSyncedAt = data?.rge_last_synced_at ?? null
    if (!lastSyncedAt) {
      logger.warn('RGE sync has never run', {
        kind: 'rge_sync_stale',
        last_synced_at: null,
        days_stale: null,
      })
      return { ok: false, lastSyncedAt: null, daysStale: null, severity: 'warn' }
    }

    const daysStale = (Date.now() - new Date(lastSyncedAt).getTime()) / 86_400_000

    if (daysStale > RGE_STALE_CRITICAL_DAYS) {
      logger.error('RGE sync critically stale', undefined, {
        kind: 'rge_sync_stale',
        severity: 'critical',
        last_synced_at: lastSyncedAt,
        days_stale: Math.round(daysStale * 10) / 10,
      })
      return { ok: false, lastSyncedAt, daysStale, severity: 'error' }
    }

    if (daysStale > RGE_STALE_WARN_DAYS) {
      logger.error('RGE sync stale', undefined, {
        kind: 'rge_sync_stale',
        severity: 'warn',
        last_synced_at: lastSyncedAt,
        days_stale: Math.round(daysStale * 10) / 10,
      })
      return { ok: false, lastSyncedAt, daysStale, severity: 'error' }
    }

    logger.info('RGE sync healthy', {
      kind: 'rge_sync_ok',
      last_synced_at: lastSyncedAt,
      days_stale: Math.round(daysStale * 10) / 10,
    })
    return { ok: true, lastSyncedAt, daysStale, severity: 'ok' }
  } catch (err) {
    logger.warn('rge_sync_freshness_check_exception', {
      kind: 'rge_sync_check_error',
      error: err instanceof Error ? err.message : String(err),
    })
    return { ok: false, lastSyncedAt: null, daysStale: null, severity: 'unknown' }
  }
}

/**
 * Daily cron: Verify all sitemaps return HTTP 200 with valid XML.
 * Alerts via structured logging (visible in Vercel logs).
 */
export const GET = withCronCheckIn('cron-sitemap-health', async (request: Request) => {
  return await Sentry.withMonitor(
    'cron-sitemap-health',
    async () => {
      if (!process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
      }
      const authHeader = request.headers.get('authorization')
      if (!verifyCronSecret(authHeader)) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
      }

      // Fetch sitemap index to get all child sitemaps
      const indexRes = await fetch(`${SITE_URL}/sitemap.xml`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(15000),
      })
      if (!indexRes.ok) {
        logger.error('[sitemap-health] CRITICAL: sitemap index returned', undefined, {
          status: indexRes.status,
        })
        Sentry.captureMessage('Sitemap index unhealthy', {
          level: 'error',
          extra: { status: indexRes.status },
        })
        return NextResponse.json(
          { error: "Échec de l'index sitemap", status: indexRes.status },
          { status: 500 }
        )
      }

      const indexXml = await indexRes.text()
      const locRegex = /<loc>(.*?)<\/loc>/g
      const sitemapUrls: string[] = []
      let match
      while ((match = locRegex.exec(indexXml)) !== null) {
        sitemapUrls.push(match[1])
      }

      // Check each child sitemap
      const results: { url: string; status: number; urls: number; ok: boolean }[] = []
      const failures: string[] = []

      // Check in parallel batches of 5 to avoid overwhelming the server
      for (let i = 0; i < sitemapUrls.length; i += 5) {
        const batch = sitemapUrls.slice(i, i + 5)
        const batchResults = await Promise.all(
          batch.map(async (url) => {
            try {
              const res = await fetch(url, {
                cache: 'no-store',
                signal: AbortSignal.timeout(15000),
              })
              const text = res.ok ? await res.text() : ''
              const urlCount = (text.match(/<url>/g) || []).length
              const ok = res.ok && urlCount > 0
              if (!ok) failures.push(url)
              return { url, status: res.status, urls: urlCount, ok }
            } catch {
              failures.push(url)
              return { url, status: 0, urls: 0, ok: false }
            }
          })
        )
        results.push(...batchResults)
      }

      // Also check special sitemaps
      for (const special of [`${SITE_URL}/image-sitemap.xml`, `${SITE_URL}/news-sitemap.xml`]) {
        try {
          const res = await fetch(special, {
            cache: 'no-store',
            signal: AbortSignal.timeout(15000),
          })
          // news-sitemap can legitimately be empty (0 articles in last 48h)
          const ok = res.ok
          if (!ok) failures.push(special)
          results.push({ url: special, status: res.status, urls: 0, ok })
        } catch {
          failures.push(special)
          results.push({ url: special, status: 0, urls: 0, ok: false })
        }
      }

      const totalUrls = results.reduce((sum, r) => sum + r.urls, 0)
      const allOk = failures.length === 0

      if (!allOk) {
        logger.error(`[sitemap-health] ALERT: ${failures.length} sitemaps failed`, undefined, {
          failures,
        })
        Sentry.captureMessage(`Sitemap health: ${failures.length} sitemaps failed`, {
          level: 'warning',
          extra: { failures },
        })
      } else {
        logger.info(
          `[sitemap-health] OK: ${results.length} sitemaps healthy, ${totalUrls} total URLs`
        )
      }

      // Bouclier 5 — diff jour-à-jour + persistance fail-safe.
      // Ne bloque pas le cron principal en cas d'erreur DB.
      let diffAlerts: Awaited<ReturnType<typeof computeSitemapDiff>> = []
      try {
        const supabase = createAdminClient()
        const sitemapRuns: SitemapRun[] = results.map((r) => ({
          sitemap_url: r.url,
          url_count: r.urls,
          status: r.status,
          ok: r.ok,
        }))
        diffAlerts = await computeSitemapDiff(supabase, sitemapRuns)
        await persistSitemapRun(supabase, sitemapRuns)

        for (const alert of diffAlerts) {
          const pct = (alert.delta_pct * 100).toFixed(1)
          logger.error(
            `[sitemap-health] ${alert.severity.toUpperCase()} diff ${pct}% on ${alert.sitemap_url}`,
            undefined,
            {
              kind: 'sitemap_diff_alert',
              ...alert,
            }
          )
          Sentry.captureMessage(`Sitemap diff ${alert.severity}: ${alert.sitemap_url} ${pct}%`, {
            level: alert.severity === 'critical' ? 'error' : 'warning',
            extra: { ...alert },
          })
        }
      } catch (err) {
        logger.warn('[sitemap-health] diff/persist failed (non-blocking)', {
          error: err instanceof Error ? err.message : String(err),
        })
      }

      const rgeFreshness = await checkRgeFreshness()

      await pingHeartbeat('sitemap-health')
      return NextResponse.json({
        healthy: allOk,
        checked: results.length,
        totalUrls,
        failures: failures.length > 0 ? failures : undefined,
        diffAlerts: diffAlerts.length > 0 ? diffAlerts : undefined,
        rge: {
          healthy: rgeFreshness.ok,
          lastSyncedAt: rgeFreshness.lastSyncedAt,
          daysStale: rgeFreshness.daysStale,
          severity: rgeFreshness.severity,
        },
        timestamp: new Date().toISOString(),
      })
    },
    {
      schedule: { type: 'crontab', value: '0 6 * * *' },
    }
  )
})
