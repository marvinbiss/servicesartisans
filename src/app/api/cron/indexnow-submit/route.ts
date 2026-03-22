import { NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/seo/config'
import { services } from '@/lib/data/france'
import { allArticlesMeta } from '@/lib/data/blog/articles-index'
import { submitToIndexNow } from '@/lib/seo/indexnow'
import { logger } from '@/lib/logger'

const TOP_CITIES = ['paris', 'marseille', 'lyon', 'toulouse', 'nice', 'nantes', 'strasbourg', 'montpellier', 'bordeaux', 'lille']

/** All guide slugs — submitted once a week (Sundays) */
const GUIDE_SLUGS = [
  'aides-renovation-2026',
  'artisan-rge',
  'assurance-dommage-ouvrage',
  'budget-renovation',
  'declaration-prealable-travaux',
  'devis-travaux',
  'diagnostics-immobiliers',
  'eviter-arnaques-artisan',
  'extension-maison',
  'garantie-decennale',
  'isolation-combles',
  'isolation-thermique',
  'maprimerenov-2026',
  'normes-electriques',
  'permis-construire',
  'pompe-a-chaleur',
  'renovation-cuisine',
  'renovation-energetique-complete',
  'renovation-fenetres',
  'renovation-salle-de-bain',
  'renovation-toiture',
  'travaux-copropriete',
  'trouver-artisan',
]

/** Max URLs per daily run to stay reasonable */
const MAX_URLS_PER_DAY = 500

/**
 * Cron job: Submit strategic URLs to IndexNow after each deploy.
 * Runs daily to ensure Bing always has fresh data.
 *
 * Categories:
 * - Strategic pages: homepage + top services × top cities (~212 URLs)
 * - Blog articles: published/modified in last 48h
 * - New providers: created in last 24h (hub pages impacted)
 * - Guides: all guide pages, once per week (Sundays)
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const counts = { strategic: 0, blog: 0, providers: 0, guides: 0 }

  // ── 1. Strategic URLs (existing logic) ──────────────────────────────
  const urls: string[] = [
    SITE_URL,
    `${SITE_URL}/services`,
  ]

  for (const service of services.slice(0, 10)) {
    urls.push(`${SITE_URL}/services/${service.slug}`)
    for (const city of TOP_CITIES) {
      urls.push(`${SITE_URL}/services/${service.slug}/${city}`)
      urls.push(`${SITE_URL}/devis/${service.slug}/${city}`)
    }
  }
  counts.strategic = urls.length

  // ── 2. Blog articles published/modified in last 48h ─────────────────
  const now = Date.now()
  const hours48 = 48 * 60 * 60 * 1000
  const recentArticles = allArticlesMeta.filter(a => {
    const articleDate = new Date(a.date).getTime()
    return now - articleDate < hours48
  })

  for (const article of recentArticles) {
    urls.push(`${SITE_URL}/blog/${article.slug}`)
  }
  counts.blog = recentArticles.length

  // Also always submit the blog index when there are new articles
  if (recentArticles.length > 0) {
    urls.push(`${SITE_URL}/blog`)
  }

  // ── 3. New providers created in last 24h ────────────────────────────
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()

    const yesterday = new Date(now - 24 * 60 * 60 * 1000).toISOString()

    const { data: newProviders, error } = await supabase
      .from('providers')
      .select('specialty, address_city')
      .eq('is_active', true)
      .gte('created_at', yesterday)
      .limit(200)

    if (error) {
      logger.warn('IndexNow cron: failed to fetch new providers', { error: error.message })
    } else if (newProviders && newProviders.length > 0) {
      // Submit the hub pages (service/ville) impacted by new providers.
      // These are the pages whose content actually changed (new provider listed).
      // We use a Set to deduplicate since multiple providers may share the same hub.
      const hubPages = new Set<string>()
      const serviceMap = new Map(services.map(s => [
        s.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim(),
        s.slug,
      ]))

      for (const p of newProviders) {
        if (!p.specialty || !p.address_city) continue

        const normalizedSpecialty = p.specialty.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
        const serviceSlug = serviceMap.get(normalizedSpecialty)
        if (!serviceSlug) continue

        const citySlug = p.address_city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        if (!citySlug) continue

        hubPages.add(`${SITE_URL}/services/${serviceSlug}/${citySlug}`)
      }

      for (const hubUrl of hubPages) {
        urls.push(hubUrl)
      }
      counts.providers = hubPages.size

      // Also submit the artisans listing page
      if (hubPages.size > 0) {
        urls.push(`${SITE_URL}/artisans`)
      }
    }
  } catch (err) {
    // DB unavailable — continue with static URLs only
    logger.warn('IndexNow cron: Supabase unavailable, skipping new providers', {
      error: err instanceof Error ? err.message : 'unknown',
    })
  }

  // ── 4. Guides — once per week (Sundays) ─────────────────────────────
  const isSunday = new Date().getUTCDay() === 0
  if (isSunday) {
    urls.push(`${SITE_URL}/guides`)
    for (const slug of GUIDE_SLUGS) {
      urls.push(`${SITE_URL}/guides/${slug}`)
    }
    counts.guides = GUIDE_SLUGS.length + 1 // +1 for the index page
  }

  // ── Deduplicate and cap at MAX_URLS_PER_DAY ─────────────────────────
  const uniqueUrls = [...new Set(urls)].slice(0, MAX_URLS_PER_DAY)

  logger.info('IndexNow cron: submitting URLs', {
    action: 'indexnow-cron',
    strategic: counts.strategic,
    blog: counts.blog,
    providers: counts.providers,
    guides: counts.guides,
    totalUnique: uniqueUrls.length,
    capped: urls.length > MAX_URLS_PER_DAY,
  })

  // ── Submit directly via IndexNow API ────────────────────────────────
  const result = await submitToIndexNow(uniqueUrls)

  return NextResponse.json({
    ...result,
    urlCount: uniqueUrls.length,
    breakdown: counts,
  })
}
