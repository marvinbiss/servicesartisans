import { NextRequest, NextResponse } from 'next/server'
import { PROVIDER_BATCH_SIZE, escapeXmlLoc } from '@/lib/seo/sitemap-manifest'
import { resolveProviderUrl, PROVIDER_SELECT_COLUMNS } from '@/lib/seo/provider-url-resolver'
import type { ProviderRow } from '@/lib/seo/provider-url-resolver'
import { logger } from '@/lib/logger'

/**
 * Dynamic API route for provider sitemaps.
 * Serves /sitemap/providers-{id}.xml via next.config.js rewrite.
 *
 * Two code paths:
 *   1. FAST PATH: reads from provider_sitemap_urls table (pre-computed).
 *      Single indexed query, no pagination, no slug resolution. p95 < 500ms.
 *   2. LEGACY FALLBACK: if provider_sitemap_urls is empty (table not yet
 *      populated), falls back to the original paginated query + runtime
 *      slug resolution. This ensures zero-downtime during migration.
 *
 * The fast path is used automatically once the refresh script has been run.
 */
const sitemapLog = logger.child({ component: 'sitemap-providers' })

const LEGACY_PAGE_SIZE = 1000

export async function GET(request: NextRequest) {
  const startMs = Date.now()
  const { searchParams } = request.nextUrl
  const id = searchParams.get('id')

  if (!id || !/^\d+$/.test(id)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const batchIndex = parseInt(id, 10)

  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()

    // ── Try fast path first ─────────────────────────────────────────────
    const tDbStart = Date.now()
    const { data: precomputed, error: precomputedError } = await supabase
      .from('provider_sitemap_urls')
      .select('url, lastmod')
      .eq('batch_id', batchIndex)
      .order('id', { ascending: true })

    const tDb = Date.now() - tDbStart

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

    // ── Legacy fallback: paginated query + runtime resolution ────────────
    sitemapLog.warn('sitemap-providers using legacy fallback (provider_sitemap_urls empty or error)', {
      batchIndex: String(batchIndex),
      precomputedError: precomputedError?.message || 'none',
      precomputedCount: String(precomputed?.length ?? 0),
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
        .order('updated_at', { ascending: false })
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
    sitemapLog.error('sitemap-providers failed, returning empty sitemap', err, {
      batchIndex: String(batchIndex),
      durationMs: String(durationMs),
    })
    // Return empty but valid sitemap on error
    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>'
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=60',
      },
    })
  }
}
