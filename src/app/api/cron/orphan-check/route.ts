import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import {
  buildLinkGraph,
  findOrphans,
  generateRescueLinks,
  getDepthFromHomepage,
  getAllPagePaths,
} from '@/lib/seo/orphan-detection'

export const maxDuration = 60

/**
 * Cron: Orphan page detection.
 * Builds a static link graph and identifies pages with 0 or weak internal linking.
 * Authenticated via CRON_SECRET (same pattern as sitemap-health).
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const startTime = Date.now()

    // Build the link graph from static data
    const linkGraph = buildLinkGraph()
    const allPages = getAllPagePaths()

    // Find orphans and weak pages
    const report = findOrphans(linkGraph, allPages)

    // Generate rescue link suggestions for orphans
    const rescueLinks = generateRescueLinks(report.orphanPages.slice(0, 100))

    // Compute depth stats
    const depthMap = getDepthFromHomepage(linkGraph)
    const reachableCount = depthMap.size
    const unreachableCount = allPages.length - reachableCount

    const elapsed = Date.now() - startTime

    // Log summary
    if (report.orphanPages.length > 0) {
      logger.warn('[orphan-check] Orphan pages detected', {
        action: 'orphan-check',
        orphanCount: report.orphanPages.length,
        weakCount: report.weakPages.length,
        depthOver3Count: report.depthOver3.length,
        unreachableCount,
        elapsed: `${elapsed}ms`,
      } as Record<string, unknown>)
    } else {
      logger.info('[orphan-check] No orphan pages detected', {
        action: 'orphan-check',
        totalPages: report.totalPages,
        linkedPages: report.linkedPages,
        maxDepth: report.maxDepth,
        elapsed: `${elapsed}ms`,
      } as Record<string, unknown>)
    }

    return NextResponse.json({
      healthy: report.orphanPages.length === 0,
      report: {
        totalPages: report.totalPages,
        linkedPages: report.linkedPages,
        orphanCount: report.orphanPages.length,
        weakCount: report.weakPages.length,
        depthOver3Count: report.depthOver3.length,
        maxDepth: report.maxDepth,
        reachableFromHomepage: reachableCount,
        unreachableFromHomepage: unreachableCount,
      },
      // Include first 50 orphans and rescue links in response
      orphanPages: report.orphanPages.slice(0, 50),
      weakPages: report.weakPages.slice(0, 50),
      depthOver3: report.depthOver3.slice(0, 50),
      rescueLinks: rescueLinks.slice(0, 50),
      elapsed: `${elapsed}ms`,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    logger.error('[orphan-check] Failed to run orphan detection', err)
    return NextResponse.json(
      { error: 'Orphan check failed', message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
