import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAllPagePaths } from '@/lib/seo/orphan-detection'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'

export const maxDuration = 300

/**
 * Cron: Orphan page detection via seo_page_scores table.
 *
 * 1. Lists all URLs from the sitemap source of truth (getAllPagePaths)
 * 2. For each URL, checks seo_page_scores.internal_links_in
 * 3. Classifies: ORPHAN_CRITICAL (0 links), ORPHAN_WEAK (< 3 links), HEALTHY (>= 3)
 * 4. Updates seo_page_scores.is_orphan
 * 5. Returns a summary report
 *
 * Auth: Bearer CRON_SECRET
 */
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (!verifyCronSecret(authHeader)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const startTime = Date.now()
  const runId = `oc-${new Date().toISOString().slice(0, 10)}-${Date.now().toString(36)}`

  try {
    const supabase = createAdminClient()

    // ── 1. Source of truth: all page paths from sitemap logic ──────────
    const allPages = getAllPagePaths()
    const totalChecked = allPages.length

    logger.info('[orphan-check] Starting orphan detection', {
      action: 'orphan-check-start',
      artisanId: `${totalChecked} pages to check, run ${runId}`,
    })

    // ── 2. Fetch existing scores from DB in batches ───────────────────
    // Supabase PostgREST limits to 1000 rows by default, we fetch in batches
    const FETCH_BATCH = 1000
    const existingScores = new Map<string, { internal_links_in: number; is_orphan: boolean }>()

    let offset = 0
    let hasMore = true
    while (hasMore) {
      const { data, error } = await supabase
        .from('seo_page_scores')
        .select('page_path, internal_links_in, is_orphan')
        .range(offset, offset + FETCH_BATCH - 1)

      if (error) {
        throw new Error(`Failed to fetch seo_page_scores at offset ${offset}: ${error.message}`)
      }

      if (!data || data.length === 0) {
        hasMore = false
      } else {
        for (const row of data) {
          existingScores.set(row.page_path, {
            internal_links_in: row.internal_links_in ?? 0,
            is_orphan: row.is_orphan ?? false,
          })
        }
        offset += data.length
        hasMore = data.length === FETCH_BATCH
      }
    }

    logger.info('[orphan-check] Fetched existing scores', {
      action: 'orphan-check-fetch',
      artisanId: `${existingScores.size} rows in seo_page_scores`,
    })

    // ── 3. Classify each page ─────────────────────────────────────────
    let orphanCritical = 0
    let orphanWeak = 0
    let healthy = 0

    interface OrphanEntry {
      path: string
      links_in: number
      status: 'ORPHAN_CRITICAL' | 'ORPHAN_WEAK'
    }
    const topOrphans: OrphanEntry[] = []

    // Pages to upsert (new or changed orphan status)
    interface UpsertRow {
      page_path: string
      page_type: string | null
      internal_links_in: number
      is_orphan: boolean
      source_run_id: string
    }
    const upsertBatch: UpsertRow[] = []

    for (const pagePath of allPages) {
      const existing = existingScores.get(pagePath)
      const linksIn = existing?.internal_links_in ?? 0

      let isOrphan: boolean
      let status: 'ORPHAN_CRITICAL' | 'ORPHAN_WEAK' | 'HEALTHY'

      if (linksIn === 0) {
        orphanCritical++
        isOrphan = true
        status = 'ORPHAN_CRITICAL'
      } else if (linksIn < 3) {
        orphanWeak++
        isOrphan = true
        status = 'ORPHAN_WEAK'
      } else {
        healthy++
        isOrphan = false
        status = 'HEALTHY'
      }

      // Track top orphans (critical first, then weak)
      if (status !== 'HEALTHY') {
        topOrphans.push({ path: pagePath, links_in: linksIn, status })
      }

      // If the page doesn't exist in DB, or its orphan status changed, mark for upsert
      const needsUpsert = !existing || existing.is_orphan !== isOrphan
      if (needsUpsert) {
        upsertBatch.push({
          page_path: pagePath,
          page_type: inferPageType(pagePath),
          internal_links_in: linksIn,
          is_orphan: isOrphan,
          source_run_id: runId,
        })
      }
    }

    // ── 4. Sort top orphans: critical first, then by links_in ASC ─────
    topOrphans.sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'ORPHAN_CRITICAL' ? -1 : 1
      }
      return a.links_in - b.links_in
    })
    const top50 = topOrphans.slice(0, 50)

    // ── 5. Upsert changes to seo_page_scores in batches ──────────────
    const UPSERT_BATCH = 500
    let upsertErrors = 0

    for (let i = 0; i < upsertBatch.length; i += UPSERT_BATCH) {
      const batch = upsertBatch.slice(i, i + UPSERT_BATCH)
      const { error } = await supabase
        .from('seo_page_scores')
        .upsert(batch, { onConflict: 'page_path' })

      if (error) {
        upsertErrors++
        logger.warn('[orphan-check] Upsert batch failed', {
          action: 'orphan-check-upsert-error',
          artisanId: `batch ${Math.floor(i / UPSERT_BATCH) + 1}: ${error.message}`,
        })
      }
    }

    const elapsed = Date.now() - startTime

    // ── 6. Log summary ───────────────────────────────────────────────
    if (orphanCritical > 0) {
      logger.warn('[orphan-check] Orphan pages detected', {
        action: 'orphan-check-complete',
        artisanId: `critical=${orphanCritical} weak=${orphanWeak} healthy=${healthy} elapsed=${elapsed}ms`,
      })
    } else {
      logger.info('[orphan-check] No critical orphans', {
        action: 'orphan-check-complete',
        artisanId: `weak=${orphanWeak} healthy=${healthy} elapsed=${elapsed}ms`,
      })
    }

    return NextResponse.json({
      success: true,
      report: {
        total_checked: totalChecked,
        orphan_critical: orphanCritical,
        orphan_weak: orphanWeak,
        healthy,
        upserted: upsertBatch.length,
        upsert_errors: upsertErrors,
        top_orphans: top50.map((o) => ({ path: o.path, links_in: o.links_in, status: o.status })),
        run_id: runId,
      },
      elapsed: `${elapsed}ms`,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    const elapsed = Date.now() - startTime
    logger.error('[orphan-check] Failed to run orphan detection', err, {
      action: 'orphan-check-error',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Orphan check failed',
        message: err instanceof Error ? err.message : 'Unknown error',
        run_id: runId,
        elapsed: `${elapsed}ms`,
      },
      { status: 500 }
    )
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────

/**
 * Infer page_type from the URL path.
 * Matches the page_type column in seo_page_scores.
 */
function inferPageType(path: string): string {
  if (path === '/') return 'hub'

  const segments = path.split('/').filter(Boolean)
  const first = segments[0]

  switch (first) {
    case 'services':
      return 'services'
    case 'tarifs':
      return 'tarifs'
    case 'devis':
      return 'devis'
    case 'urgence':
      return 'urgence'
    case 'avis':
      return 'avis'
    case 'blog':
      return 'blog'
    case 'guides':
      return 'blog'
    case 'departements':
      return 'hub'
    case 'regions':
      return 'hub'
    case 'villes':
      return 'hub'
    case 'barometre':
      return 'hub'
    default:
      // Static pages, outils, etc.
      return segments.length === 1 ? 'hub' : 'services'
  }
}
