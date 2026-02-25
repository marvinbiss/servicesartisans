/**
 * Google Sitemap Ping — notify Google of updated sitemaps.
 *
 * Usage:
 *   npx tsx src/lib/seo/sitemap-ping.ts
 *   npx tsx src/lib/seo/sitemap-ping.ts --dry-run
 *
 * Note: Google deprecated the formal ping API in 2023, but submitting
 * sitemaps via Search Console API or URL Inspection API is recommended.
 * This utility pings the legacy endpoint as a best-effort notification.
 */

import { SITE_URL } from '@/lib/seo/config'
import { logger } from '@/lib/logger'

const pingLog = logger.child({ component: 'sitemap-ping' })

const SITEMAPS = [
  `${SITE_URL}/sitemap.xml`,
  `${SITE_URL}/news-sitemap.xml`,
  `${SITE_URL}/image-sitemap.xml`,
]

export async function pingSitemaps(options: { dryRun?: boolean } = {}): Promise<void> {
  const { dryRun = false } = options

  for (const sitemapUrl of SITEMAPS) {
    const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`

    if (dryRun) {
      console.log(`[DRY-RUN] Would ping: ${pingUrl}`)
      continue
    }

    try {
      const response = await fetch(pingUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(10_000),
      })
      pingLog.info('Sitemap ping sent', {
        sitemap: sitemapUrl,
        status: String(response.status),
        ok: String(response.ok),
      })
      console.log(`  Pinged: ${sitemapUrl} → ${response.status}`)
    } catch (err) {
      pingLog.warn('Sitemap ping failed', {
        sitemap: sitemapUrl,
        error: err instanceof Error ? err.message : String(err),
      })
      console.log(`  Failed: ${sitemapUrl} → ${err instanceof Error ? err.message : String(err)}`)
    }
  }
}

// CLI entrypoint
if (typeof process !== 'undefined' && process.argv[1]?.includes('sitemap-ping')) {
  const dryRun = process.argv.includes('--dry-run')
  console.log(dryRun ? '\nSitemap Ping (DRY RUN)\n' : '\nPinging Google sitemaps...\n')
  pingSitemaps({ dryRun }).then(() => console.log('\nDone.'))
}
