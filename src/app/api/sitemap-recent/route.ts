import { NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/seo/config'

/**
 * Sitemap-recent: contains only pages with real content changes in the last 7 days.
 *
 * Purpose: Google crawls sitemaps referenced in robots.txt in declaration order.
 * By placing this sitemap FIRST, freshly updated pages get crawled before the
 * 742K-URL main sitemap index. This dramatically improves crawl freshness for
 * pages that actually changed (new providers, new reviews, new blog articles).
 *
 * Sources:
 *   - Providers updated in the last 7 days (individual provider pages + their city/service pages)
 *   - Reviews created in the last 7 days (avis pages)
 *   - Blog articles published/updated in the last 7 days
 *
 * Fail-safe: if DB is unavailable, returns an empty but valid sitemap.
 */

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET() {
  const urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = []

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()

    // 1. Recently updated providers (individual pages + service/city combo pages)
    const { data: recentProviders } = await supabase
      .from('providers')
      .select('stable_id, specialty, address_city, updated_at')
      .eq('is_active', true)
      .eq('noindex', false)
      .gte('updated_at', sevenDaysAgo)
      .not('stable_id', 'is', null)
      .not('specialty', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(2000)

    if (recentProviders) {
      const seenServiceCity = new Set<string>()
      const seenServiceHub = new Set<string>()

      for (const p of recentProviders) {
        const lastmod = new Date(p.updated_at).toISOString().split('T')[0]
        const service = p.specialty?.toLowerCase().trim()
        const city = p.address_city?.toLowerCase().trim()
          ?.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

        // Service hub page (one per service)
        if (service && !seenServiceHub.has(service)) {
          seenServiceHub.add(service)
          urls.push({
            loc: `${SITE_URL}/services/${service}`,
            lastmod,
            changefreq: 'daily',
            priority: '0.9',
          })
          // Also tarifs and urgence hub pages
          urls.push({
            loc: `${SITE_URL}/tarifs/${service}`,
            lastmod,
            changefreq: 'daily',
            priority: '0.8',
          })
        }

        // Service x city page
        if (service && city) {
          const key = `${service}::${city}`
          if (!seenServiceCity.has(key)) {
            seenServiceCity.add(key)
            urls.push({
              loc: `${SITE_URL}/services/${service}/${city}`,
              lastmod,
              changefreq: 'daily',
              priority: '0.8',
            })
          }
        }
      }
    }

    // 2. Recently created reviews (avis pages)
    const { data: recentReviews } = await supabase
      .from('reviews')
      .select('artisan_id, created_at')
      .eq('status', 'published')
      .gte('created_at', sevenDaysAgo)
      .not('artisan_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(500)

    if (recentReviews && recentReviews.length > 0) {
      const artisanIds = Array.from(new Set(recentReviews.map(r => r.artisan_id)))
      const { data: providers } = await supabase
        .from('providers')
        .select('user_id, specialty')
        .in('user_id', artisanIds)

      if (providers) {
        const specialtyByUserId = new Map<string, string>()
        for (const p of providers) {
          if (p.user_id && p.specialty) {
            specialtyByUserId.set(p.user_id, p.specialty.toLowerCase().trim())
          }
        }

        const seenAvis = new Set<string>()
        for (const r of recentReviews) {
          const svc = specialtyByUserId.get(r.artisan_id)
          if (svc && !seenAvis.has(svc)) {
            seenAvis.add(svc)
            urls.push({
              loc: `${SITE_URL}/avis/${svc}`,
              lastmod: new Date(r.created_at).toISOString().split('T')[0],
              changefreq: 'daily',
              priority: '0.7',
            })
          }
        }
      }
    }
  } catch {
    // DB unavailable — return empty but valid sitemap
  }

  // 3. Recently published/updated blog articles (from static data)
  try {
    const { allArticles, articleSlugs } = await import('@/lib/data/blog/articles')
    const now = Date.now()
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000

    for (const slug of articleSlugs) {
      const article = allArticles[slug]
      if (!article) continue
      const articleDate = new Date(article.updatedDate || article.date).getTime()
      if (now - articleDate <= sevenDaysMs) {
        urls.push({
          loc: `${SITE_URL}/blog/${slug}`,
          lastmod: new Date(articleDate).toISOString().split('T')[0],
          changefreq: 'daily',
          priority: '0.7',
        })
      }
    }
  } catch {
    // Blog data unavailable — skip
  }

  // Build XML
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(u =>
      `  <url><loc>${escapeXml(u.loc)}</loc><lastmod>${escapeXml(u.lastmod)}</lastmod><changefreq>${escapeXml(u.changefreq)}</changefreq><priority>${escapeXml(u.priority)}</priority></url>`
    ),
    '</urlset>',
  ].join('\n')

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Short cache: this sitemap changes frequently by definition
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
    },
  })
}
