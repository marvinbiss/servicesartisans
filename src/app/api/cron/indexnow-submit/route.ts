import { NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/seo/config'
import { services } from '@/lib/data/france'
import { allArticlesMeta } from '@/lib/data/blog/articles-index'
import { submitToIndexNow } from '@/lib/seo/indexnow'
import { logger } from '@/lib/logger'

const TOP_CITIES = ['paris', 'marseille', 'lyon', 'toulouse', 'nice', 'nantes', 'strasbourg', 'montpellier', 'bordeaux', 'lille']

/** Extended city list for /devis/ rotation (top 30 French cities by population) */
const EXTENDED_CITIES = [
  ...TOP_CITIES,
  'rennes', 'reims', 'saint-etienne', 'toulon', 'le-havre',
  'grenoble', 'dijon', 'angers', 'nimes', 'villeurbanne',
  'clermont-ferrand', 'le-mans', 'aix-en-provence', 'brest', 'tours',
  'amiens', 'limoges', 'perpignan', 'metz', 'besancon',
]

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

/** Max URLs per daily run — target 500/day, well under IndexNow 10K limit */
const MAX_URLS_PER_DAY = 500

/** Number of rotation buckets (days) to cycle through all URLs */
const ROTATION_DAYS = 3

/**
 * Deterministic daily rotation index based on UTC date.
 * Returns 0, 1, or 2 — cycles every ROTATION_DAYS.
 */
function getDayBucket(): number {
  const now = new Date()
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getUTCFullYear(), 0, 1).getTime()) / (24 * 60 * 60 * 1000)
  )
  return dayOfYear % ROTATION_DAYS
}

/**
 * Return every Nth element from an array based on the current day bucket.
 * This ensures full coverage across ROTATION_DAYS.
 */
function rotateSlice<T>(items: T[], bucket: number): T[] {
  return items.filter((_, i) => i % ROTATION_DAYS === bucket)
}

/**
 * Cron job: Submit strategic URLs to IndexNow after each deploy.
 * Runs daily to ensure Bing always has fresh data.
 *
 * Target: ~500 URLs/day with rotation to cover all pages in ~3 days.
 *
 * Categories:
 * - Priority pages: homepage, /services index, /blog index (always)
 * - Service hub pages: all 46 services (rotated)
 * - Service × top cities: /services/{slug}/{city} (rotated)
 * - Devis pages: /devis/{slug}/{city} with extended cities (rotated)
 * - Blog articles: prix articles + recent articles (rotated + fresh)
 * - New providers: created in last 24h (hub pages impacted)
 * - Guides: all guide pages, once per week (Sundays)
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const bucket = getDayBucket()
  const counts = { strategic: 0, serviceHubs: 0, devis: 0, blog: 0, blogPrix: 0, providers: 0, guides: 0 }

  // ── 1. Always-submit priority pages ─────────────────────────────────
  const urls: string[] = [
    SITE_URL,
    `${SITE_URL}/services`,
    `${SITE_URL}/blog`,
    `${SITE_URL}/tarifs`,
  ]
  counts.strategic = urls.length

  // ── 2. Service hub pages — all 46 services, rotated ─────────────────
  const serviceBatch = rotateSlice(services, bucket)
  for (const service of serviceBatch) {
    urls.push(`${SITE_URL}/services/${service.slug}`)
    urls.push(`${SITE_URL}/tarifs/${service.slug}`)
  }
  counts.serviceHubs = serviceBatch.length * 2

  // ── 3. Service × top cities (rotated by service) ────────────────────
  for (const service of serviceBatch) {
    for (const city of TOP_CITIES) {
      urls.push(`${SITE_URL}/services/${service.slug}/${city}`)
    }
  }

  // ── 4. Devis pSEO pages — all services × extended cities (rotated) ──
  // Build the full matrix and rotate it for broad daily coverage
  const allDevisUrls: string[] = []
  for (const service of services) {
    for (const city of EXTENDED_CITIES) {
      allDevisUrls.push(`${SITE_URL}/devis/${service.slug}/${city}`)
    }
  }
  const devisBatch = rotateSlice(allDevisUrls, bucket)
  urls.push(...devisBatch)
  counts.devis = devisBatch.length

  // ── 5. Blog articles — fresh first, then prix articles in rotation ──
  const now = Date.now()
  const hours48 = 48 * 60 * 60 * 1000

  // 5a. Recent articles (published/modified in last 48h) — always submitted
  const recentArticles = allArticlesMeta.filter(a => {
    const articleDate = new Date(a.date).getTime()
    return now - articleDate < hours48
  })
  for (const article of recentArticles) {
    urls.push(`${SITE_URL}/blog/${article.slug}`)
  }
  counts.blog = recentArticles.length

  // 5b. Prix articles — rotated daily for continuous re-submission
  const prixArticles = allArticlesMeta.filter(a => a.slug.startsWith('prix-'))
  const prixBatch = rotateSlice(prixArticles, bucket)
  for (const article of prixBatch) {
    urls.push(`${SITE_URL}/blog/${article.slug}`)
  }
  counts.blogPrix = prixBatch.length

  // 5c. Non-prix, non-recent articles — rotated for background coverage
  const recentSlugs = new Set(recentArticles.map(a => a.slug))
  const otherArticles = allArticlesMeta.filter(
    a => !a.slug.startsWith('prix-') && !recentSlugs.has(a.slug)
  )
  const otherBatch = rotateSlice(otherArticles, bucket)
  for (const article of otherBatch) {
    urls.push(`${SITE_URL}/blog/${article.slug}`)
  }

  // ── 6. New providers created in last 24h ────────────────────────────
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
        // Also notify the devis page for this service+city
        hubPages.add(`${SITE_URL}/devis/${serviceSlug}/${citySlug}`)
      }

      urls.push(...Array.from(hubPages))
      counts.providers = hubPages.size

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

  // ── 7. Guides — once per week (Sundays) ─────────────────────────────
  const isSunday = new Date().getUTCDay() === 0
  if (isSunday) {
    urls.push(`${SITE_URL}/guides`)
    for (const slug of GUIDE_SLUGS) {
      urls.push(`${SITE_URL}/guides/${slug}`)
    }
    counts.guides = GUIDE_SLUGS.length + 1
  }

  // ── Deduplicate and cap at MAX_URLS_PER_DAY ─────────────────────────
  const uniqueUrls = Array.from(new Set(urls)).slice(0, MAX_URLS_PER_DAY)

  logger.info('IndexNow cron: submitting URLs', {
    action: 'indexnow-cron',
    bucket,
    strategic: counts.strategic,
    serviceHubs: counts.serviceHubs,
    devis: counts.devis,
    blog: counts.blog,
    blogPrix: counts.blogPrix,
    providers: counts.providers,
    guides: counts.guides,
    totalBeforeCap: urls.length,
    totalUnique: uniqueUrls.length,
    capped: urls.length > MAX_URLS_PER_DAY,
  })

  // ── Submit directly via IndexNow API ────────────────────────────────
  const result = await submitToIndexNow(uniqueUrls)

  return NextResponse.json({
    ...result,
    urlCount: uniqueUrls.length,
    breakdown: counts,
    rotation: { bucket, totalDays: ROTATION_DAYS },
  })
}
