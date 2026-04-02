import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  buildLinkGraph,
  getAllPagePaths,
} from '@/lib/seo/orphan-detection'

export const maxDuration = 60

// ---------------------------------------------------------------------------
// Weight configuration — contextual links are worth more than sitewide links
// ---------------------------------------------------------------------------

/** Pages present in footer navigation (sitewide, low weight) */
const FOOTER_NAV_PATHS = new Set([
  '/services', '/tarifs', '/devis', '/departements', '/villes',
  '/blog', '/contact', '/faq', '/inscription-artisan',
])

/** Pages present in FooterClusterLinks (sitewide, low weight) */
const FOOTER_CLUSTER_SERVICE_SLUGS = ['plombier', 'electricien', 'serrurier', 'chauffagiste', 'couvreur', 'macon']
const FOOTER_CLUSTER_CITY_SLUGS = ['paris', 'lyon', 'marseille', 'toulouse', 'bordeaux', 'lille']
const FOOTER_CLUSTER_PATHS = new Set([
  ...FOOTER_CLUSTER_SERVICE_SLUGS.map(s => `/services/${s}`),
  ...FOOTER_CLUSTER_CITY_SLUGS.map(c => `/villes/${c}`),
  '/guides', '/barometre', '/comparaison', '/urgence',
])

/** Header links (sitewide, low weight) */
const HEADER_PATHS = new Set([
  '/', '/services', '/tarifs', '/devis', '/urgence',
  '/departements', '/regions', '/villes', '/blog',
])

const WEIGHT_CONTEXTUAL = 1.0    // Liens contextuels (cross-intent, DeepPageLinks, TopCitiesGrid)
const WEIGHT_FOOTER = 0.15       // Liens footer (sitewide, dilués)
const WEIGHT_HEADER = 0.10       // Liens header/navigation (sitewide, très dilués)

// ---------------------------------------------------------------------------
// Page type detection
// ---------------------------------------------------------------------------

function detectPageType(path: string): string {
  if (path === '/') return 'home'
  if (path.startsWith('/services/')) {
    const parts = path.split('/').filter(Boolean)
    return parts.length === 3 ? 'service-city' : 'service-hub'
  }
  if (path.startsWith('/tarifs/')) {
    const parts = path.split('/').filter(Boolean)
    return parts.length >= 3 ? 'tarifs-city' : 'tarifs-hub'
  }
  if (path.startsWith('/devis/')) {
    const parts = path.split('/').filter(Boolean)
    return parts.length >= 3 ? 'devis-city' : 'devis-hub'
  }
  if (path.startsWith('/urgence/')) {
    const parts = path.split('/').filter(Boolean)
    return parts.length >= 3 ? 'urgence-city' : 'urgence-hub'
  }
  if (path.startsWith('/avis/')) {
    const parts = path.split('/').filter(Boolean)
    return parts.length >= 3 ? 'avis-city' : 'avis-hub'
  }
  if (path.startsWith('/problemes/')) return 'problemes'
  if (path.startsWith('/departements/')) {
    const parts = path.split('/').filter(Boolean)
    return parts.length >= 3 ? 'dept-service' : 'dept-hub'
  }
  if (path.startsWith('/regions/')) {
    const parts = path.split('/').filter(Boolean)
    return parts.length >= 3 ? 'region-service' : 'region-hub'
  }
  if (path.startsWith('/villes/')) return 'city-hub'
  if (path.startsWith('/blog/')) return 'blog'
  if (path.startsWith('/barometre/')) return 'barometre'
  if (path.startsWith('/guides')) return 'guides'
  return 'static'
}

// ---------------------------------------------------------------------------
// Scoring engine
// ---------------------------------------------------------------------------

interface PageLinkData {
  page_path: string
  page_type: string
  internal_links_in: number
  internal_links_out: number
  link_score: number
  is_orphan: boolean
}

function computeLinkScores(): PageLinkData[] {
  const linkGraph = buildLinkGraph()
  const allPages = getAllPagePaths()
  const allPagesSet = new Set(allPages)

  // Compute outgoing links per page (only to known pages)
  const outgoing = new Map<string, number>()
  const graphEntries = Array.from(linkGraph.entries())
  for (let i = 0; i < graphEntries.length; i++) {
    const from = graphEntries[i][0]
    const targets = Array.from(graphEntries[i][1])
    let count = 0
    for (let j = 0; j < targets.length; j++) {
      if (allPagesSet.has(targets[j])) count++
    }
    outgoing.set(from, count)
  }

  // Compute incoming links per page with weighting
  const contextualIn = new Map<string, number>()   // contextual incoming only (for orphan detection)
  const incomingRaw = new Map<string, number>()     // total raw count
  const incomingWeighted = new Map<string, number>() // weighted score

  for (let i = 0; i < allPages.length; i++) {
    contextualIn.set(allPages[i], 0)
    incomingRaw.set(allPages[i], 0)
    incomingWeighted.set(allPages[i], 0)
  }

  // Count incoming from link graph (contextual links)
  for (let i = 0; i < graphEntries.length; i++) {
    const targets = Array.from(graphEntries[i][1])
    for (let j = 0; j < targets.length; j++) {
      const target = targets[j]
      if (incomingRaw.has(target)) {
        contextualIn.set(target, (contextualIn.get(target) ?? 0) + 1)
        incomingRaw.set(target, (incomingRaw.get(target) ?? 0) + 1)
        incomingWeighted.set(target, (incomingWeighted.get(target) ?? 0) + WEIGHT_CONTEXTUAL)
      }
    }
  }

  // Add sitewide link contributions (footer + header appear on every page)
  // These are NOT double-counted with the link graph — the graph only has
  // contextual links. Footer/header links are sitewide additions.
  const estimatedTotalPages = allPages.length

  const footerNavArr = Array.from(FOOTER_NAV_PATHS)
  for (let i = 0; i < footerNavArr.length; i++) {
    const footerPath = footerNavArr[i]
    if (incomingWeighted.has(footerPath)) {
      incomingRaw.set(footerPath, (incomingRaw.get(footerPath) ?? 0) + estimatedTotalPages)
      incomingWeighted.set(footerPath, (incomingWeighted.get(footerPath) ?? 0) + estimatedTotalPages * WEIGHT_FOOTER)
    }
  }

  const clusterArr = Array.from(FOOTER_CLUSTER_PATHS)
  for (let i = 0; i < clusterArr.length; i++) {
    const clusterPath = clusterArr[i]
    if (incomingWeighted.has(clusterPath)) {
      incomingRaw.set(clusterPath, (incomingRaw.get(clusterPath) ?? 0) + estimatedTotalPages)
      incomingWeighted.set(clusterPath, (incomingWeighted.get(clusterPath) ?? 0) + estimatedTotalPages * WEIGHT_FOOTER)
    }
  }

  const headerArr = Array.from(HEADER_PATHS)
  for (let i = 0; i < headerArr.length; i++) {
    const headerPath = headerArr[i]
    if (incomingWeighted.has(headerPath)) {
      incomingRaw.set(headerPath, (incomingRaw.get(headerPath) ?? 0) + estimatedTotalPages)
      incomingWeighted.set(headerPath, (incomingWeighted.get(headerPath) ?? 0) + estimatedTotalPages * WEIGHT_HEADER)
    }
  }

  // Build result
  const results: PageLinkData[] = []

  for (const page of allPages) {
    const rawIn = incomingRaw.get(page) ?? 0
    const weightedIn = incomingWeighted.get(page) ?? 0
    const rawOut = outgoing.get(page) ?? 0
    const pageType = detectPageType(page)

    // Link score = weighted incoming (contextual links count more)
    // Rounded to 2 decimal places
    const linkScore = Math.round(weightedIn * 100) / 100

    // Orphan = less than 2 contextual incoming links (footer/header don't count)
    const ctxIn = contextualIn.get(page) ?? 0
    const isOrphan = ctxIn < 2

    results.push({
      page_path: page,
      page_type: pageType,
      internal_links_in: rawIn,
      internal_links_out: rawOut,
      link_score: linkScore,
      is_orphan: isOrphan,
    })
  }

  return results
}

// ---------------------------------------------------------------------------
// Cron endpoint
// ---------------------------------------------------------------------------

const UPSERT_BATCH_SIZE = 500

/**
 * Cron: Recalculate internal link scores and persist to seo_page_scores.
 *
 * Builds a static link graph (no HTTP crawl), computes incoming/outgoing
 * link counts with weighted scoring, and upserts results into DB.
 *
 * Auth: Bearer CRON_SECRET.
 * Schedule: Daily at ~03:00 UTC (see vercel.json).
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const start = Date.now()
  const runId = `ls-${new Date().toISOString().slice(0, 10)}-${Date.now().toString(36)}`

  try {
    logger.info('[link-scores] Starting link score computation', { action: 'link-scores-start' })

    // 1. Compute all link scores (pure static, no DB)
    const scores = computeLinkScores()

    // 2. Upsert into seo_page_scores in batches
    const supabase = createAdminClient()
    let upsertErrors = 0

    for (let i = 0; i < scores.length; i += UPSERT_BATCH_SIZE) {
      const batch = scores.slice(i, i + UPSERT_BATCH_SIZE)

      const rows = batch.map(s => ({
        page_path: s.page_path,
        page_type: s.page_type,
        internal_links_in: s.internal_links_in,
        internal_links_out: s.internal_links_out,
        link_score: s.link_score,
        is_orphan: s.is_orphan,
        source_run_id: runId,
      }))

      const { error } = await supabase
        .from('seo_page_scores')
        .upsert(rows, { onConflict: 'page_path' })

      if (error) {
        logger.error('[link-scores] Upsert batch error', error, {
          action: 'link-scores-upsert',
          artisanId: `batch ${Math.floor(i / UPSERT_BATCH_SIZE) + 1}`,
        })
        upsertErrors++
      }
    }

    // 3. Compute stats
    const orphanCount = scores.filter(s => s.is_orphan).length
    const totalScore = scores.reduce((sum, s) => sum + s.link_score, 0)
    const avgScore = scores.length > 0 ? Math.round((totalScore / scores.length) * 100) / 100 : 0

    const durationMs = Date.now() - start

    logger.info('[link-scores] Cron completed', {
      action: 'link-scores-complete',
      artisanId: `${scores.length} pages, ${orphanCount} orphans, avg=${avgScore}, ${durationMs}ms`,
    })

    if (upsertErrors > 0) {
      logger.warn(`[link-scores] ${upsertErrors} batch upsert errors`, {
        action: 'link-scores-errors',
      })
    }

    return NextResponse.json({
      success: true,
      stats: {
        total_pages: scores.length,
        orphan_pages: orphanCount,
        avg_score: avgScore,
        run_id: runId,
        duration_ms: durationMs,
        upsert_errors: upsertErrors,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    logger.error('[link-scores] Cron failed', err, { action: 'link-scores-cron' })

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    )
  }
}
