import { NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/seo/config'
import { sitemapHeaders } from '@/lib/seo/sitemap-headers'
import { RGE_ALLOWED_SERVICES } from '@/lib/rge/service-city-listings'
import { tradeContent } from '@/lib/data/trade-content'
import { services } from '@/lib/data/france'
import { slugify } from '@/lib/utils'

// Allowlists matérialisées une seule fois (module load) pour éviter le
// rebuild des Set à chaque requête sitemap-recent.
//
// Audit 2026-04-25 (Vague E-quinquies) : avant cette allowlist canonique, on
// pushait `/services/{slug}/{ville}` pour TOUTE specialty provider même si
// le slug n'était pas dans l'array `services` (47 slugs). Une specialty
// "Plomberie générale" → slug "plomberie-generale" → 4-5 URLs 404 par
// provider avec specialty exotique. Filter ici garantit que tout push pSEO
// hits une page réellement générée.
const SERVICES_CANONICAL_SET = new Set<string>(services.map((s) => s.slug))
const RGE_ALLOWED_SERVICES_SET = new Set<string>(RGE_ALLOWED_SERVICES)
const URGENCE_ALLOWED_SERVICES_SET = new Set<string>(Object.keys(tradeContent))

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
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(request: Request) {
  const urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = []

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()

    // 1. Recently updated providers (individual pages + service/city combo pages)
    const { data: recentProviders } = await supabase
      .from('providers')
      .select('stable_id, specialty, address_city, updated_at, rge_qualifications')
      .eq('is_active', true)
      .eq('noindex', false)
      .gte('updated_at', sevenDaysAgo)
      .not('stable_id', 'is', null)
      .not('specialty', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(2000)

    if (recentProviders) {
      const seenServiceCity = new Set<string>()
      const seenDevisCity = new Set<string>()
      const seenUrgenceCity = new Set<string>()
      const seenAvisCity = new Set<string>()
      const seenRgeServiceCity = new Set<string>()
      const seenServiceHub = new Set<string>()

      for (const p of recentProviders) {
        const lastmod = new Date(p.updated_at).toISOString().split('T')[0]
        // Audit 2026-04-25 (Vague E-quater) : `specialty` est stock\u00e9 en
        // texte libre (ex: "Pompe \u00e0 chaleur"). Sans `slugify`, on push des
        // URLs malform\u00e9es comme /services/pompe \u00e0 chaleur/paris (404), et
        // les filtres allowlist Set.has(service) ne matchent jamais. On
        // doit normaliser exactement comme la ville pour que les deux
        // c\u00f4t\u00e9s (URL + lookup) soient coh\u00e9rents.
        const service = p.specialty ? slugify(p.specialty) : ''
        const city = p.address_city ? slugify(p.address_city) : ''

        // Skip si service slug n'est pas un slug canonique : pas de page
        // /services/{x}, /devis/{x}, /tarifs/{x} g\u00e9n\u00e9r\u00e9e \u2192 on \u00e9viterait
        // de d\u00e9clarer des URLs 404 \u00e0 Google.
        if (!service || !SERVICES_CANONICAL_SET.has(service)) continue

        // Service hub page (one per service)
        if (!seenServiceHub.has(service)) {
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

        // Audit 2026-04-25 (agent #3 SEO B2) : sitemap-recent ne couvrait
        // que /services/{s}/{v}. Recrawl 5\u00d7 plus lent pour les autres
        // templates pSEO qui consomment provider activity (devis, urgence,
        // avis, RGE). On les pousse tous ici quand un provider matche.
        if (city) {
          // Service \u00d7 city
          const keyService = `${service}::${city}`
          if (!seenServiceCity.has(keyService)) {
            seenServiceCity.add(keyService)
            urls.push({
              loc: `${SITE_URL}/services/${service}/${city}`,
              lastmod,
              changefreq: 'daily',
              priority: '0.8',
            })
          }

          // Devis \u00d7 city
          const keyDevis = `${service}::${city}`
          if (!seenDevisCity.has(keyDevis)) {
            seenDevisCity.add(keyDevis)
            urls.push({
              loc: `${SITE_URL}/services/${service}/${city}`,
              lastmod,
              changefreq: 'daily',
              priority: '0.7',
            })
          }

          // Urgence \u00d7 city (only for emergency-relevant trades). On skip si
          // le service n'a pas de page /urgence g\u00e9n\u00e9r\u00e9e (sinon URL morte
          // d\u00e9clar\u00e9e \u00e0 Google \u2192 faux signal).
          const keyUrgence = `${service}::${city}`
          if (!seenUrgenceCity.has(keyUrgence) && URGENCE_ALLOWED_SERVICES_SET.has(service)) {
            seenUrgenceCity.add(keyUrgence)
            urls.push({
              loc: `${SITE_URL}/urgence/${service}/${city}`,
              lastmod,
              changefreq: 'daily',
              priority: '0.6',
            })
          }

          // Avis \u00d7 city
          const keyAvis = `${service}::${city}`
          if (!seenAvisCity.has(keyAvis)) {
            seenAvisCity.add(keyAvis)
            urls.push({
              loc: `${SITE_URL}/avis/${service}/${city}`,
              lastmod,
              changefreq: 'daily',
              priority: '0.6',
            })
          }

          // RGE \u00d7 city \u2014 provider doit avoir au moins une qualif RGE ET le
          // service doit \u00eatre \u00e9ligible \u00e0 `/rge/{s}/{v}` (14 services seulement
          // dans RGE_ALLOWED_SERVICES). Sinon URL morte \u2192 faux signal Google.
          const hasRge = Array.isArray(p.rge_qualifications) && p.rge_qualifications.length > 0
          if (hasRge && RGE_ALLOWED_SERVICES_SET.has(service)) {
            const keyRge = `${service}::${city}`
            if (!seenRgeServiceCity.has(keyRge)) {
              seenRgeServiceCity.add(keyRge)
              urls.push({
                loc: `${SITE_URL}/rge/${service}/${city}`,
                lastmod,
                changefreq: 'daily',
                priority: '0.7',
              })
            }
          }
        }
      }
    }

    // 2. Recently created reviews (avis pages)
    const { data: recentReviews } = await supabase
      .from('reviews')
      .select('provider_id, created_at')
      .eq('status', 'published')
      .gte('created_at', sevenDaysAgo)
      .not('provider_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(500)

    if (recentReviews && recentReviews.length > 0) {
      const providerIds = Array.from(new Set(recentReviews.map((r) => r.provider_id)))
      const { data: providers } = await supabase
        .from('providers')
        .select('id, specialty')
        .in('id', providerIds)

      if (providers) {
        const specialtyById = new Map<string, string>()
        for (const p of providers) {
          // Audit 2026-04-25 (Vague E-quinquies) : même bug que section 1 —
          // sans `slugify`, /avis/pompe à chaleur est pushé en clair → 404.
          // Section 1 a été fixée en E-quater, on aligne ici.
          if (p.id && p.specialty) {
            specialtyById.set(p.id, slugify(p.specialty))
          }
        }

        const seenAvis = new Set<string>()
        for (const r of recentReviews) {
          const svc = specialtyById.get(r.provider_id)
          // Filter sur slug canonique : /avis/{x} n'existe que pour x ∈ services array.
          if (svc && SERVICES_CANONICAL_SET.has(svc) && !seenAvis.has(svc)) {
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
    ...urls.map(
      (u) =>
        `  <url><loc>${escapeXml(u.loc)}</loc><lastmod>${escapeXml(u.lastmod)}</lastmod><changefreq>${escapeXml(u.changefreq)}</changefreq><priority>${escapeXml(u.priority)}</priority></url>`
    ),
    '</urlset>',
  ].join('\n')

  // Latest content date in this sitemap → driver pour Last-Modified.
  const maxLastmod = urls.reduce<string | undefined>(
    (acc, u) => (acc === undefined || u.lastmod > acc ? u.lastmod : acc),
    undefined
  )

  const { notModified, responseHeaders } = sitemapHeaders(xml, request, {
    // Short cache : freshness entry-point. Override pour matcher le 5min existant.
    cacheControl: 'public, s-maxage=300, stale-while-revalidate=600, stale-if-error=86400',
    lastModified: maxLastmod ? new Date(maxLastmod) : undefined,
  })
  if (notModified) {
    return new NextResponse(null, { status: 304, headers: responseHeaders })
  }
  return new NextResponse(xml, { headers: responseHeaders })
}
