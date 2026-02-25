/**
 * Refresh Provider Sitemaps — Pre-computes provider sitemap URLs into
 * the `provider_sitemap_urls` table for fast runtime serving.
 *
 * Execution modes:
 *   1. CLI: npx tsx src/lib/seo/refresh-provider-sitemaps.ts
 *   2. API: called by /api/admin/refresh-provider-sitemaps
 *
 * Algorithm:
 *   1. Fetch all active, non-noindex providers (paginated by id, ascending)
 *   2. Resolve each → sitemap URL (using provider-url-resolver)
 *   3. Assign batch_id = floor(index / PROVIDER_BATCH_SIZE)
 *   4. Delete old rows from provider_sitemap_urls
 *   5. Insert new rows in chunks of INSERT_CHUNK_SIZE
 *
 * Ordering: by provider `id` (immutable, deterministic) — NOT by updated_at.
 * This guarantees stable batch assignment across refreshes.
 */

import { PROVIDER_BATCH_SIZE } from '@/lib/seo/sitemap-manifest'
import { resolveProviderUrl, PROVIDER_SELECT_COLUMNS } from '@/lib/seo/provider-url-resolver'
import type { ProviderRow } from '@/lib/seo/provider-url-resolver'

const FETCH_PAGE_SIZE = 5000
const INSERT_CHUNK_SIZE = 1000

export type RefreshResult = {
  success: boolean
  totalProviders: number
  resolvedUrls: number
  droppedProviders: number
  batchCount: number
  maxBatchId: number
  durationMs: number
  error?: string
}

export type RefreshLogger = {
  info: (msg: string, meta?: Record<string, string>) => void
  warn: (msg: string, meta?: Record<string, string>) => void
  error: (msg: string, meta?: Record<string, string>) => void
}

/**
 * Run a full refresh of provider_sitemap_urls.
 *
 * Accepts a Supabase admin client (service_role) and an optional logger.
 * Returns a structured result for observability.
 */
export async function refreshProviderSitemaps(params: {
  supabase: ReturnType<typeof import('@/lib/supabase/admin').createAdminClient>
  log?: RefreshLogger
}): Promise<RefreshResult> {
  const { supabase, log } = params
  const startMs = Date.now()
  const noop = () => {}
  const logger = log || { info: noop, warn: noop, error: noop }

  try {
    // ── Step 1: Fetch all active, non-noindex providers (keyset pagination by id) ──
    logger.info('Starting provider sitemap refresh')

    let allProviders: ProviderRow[] = []
    let lastId: string | null = null

    // eslint-disable-next-line no-constant-condition
    while (true) {
      let query = supabase
        .from('providers')
        .select(PROVIDER_SELECT_COLUMNS)
        .eq('is_active', true)
        .eq('noindex', false)
        .order('id', { ascending: true })
        .limit(FETCH_PAGE_SIZE)

      if (lastId) {
        query = query.gt('id', lastId)
      }

      const { data, error } = await query

      if (error) {
        logger.error('Fetch page error', { code: error.code, message: error.message })
        return {
          success: false,
          totalProviders: allProviders.length,
          resolvedUrls: 0,
          droppedProviders: 0,
          batchCount: 0,
          maxBatchId: -1,
          durationMs: Date.now() - startMs,
          error: `DB fetch error: ${error.message}`,
        }
      }

      if (!data || data.length === 0) break

      allProviders = allProviders.concat(data as ProviderRow[])
      lastId = data[data.length - 1].id

      logger.info('Fetched page', {
        pageSize: String(data.length),
        totalSoFar: String(allProviders.length),
        lastId: lastId || '',
      })

      if (data.length < FETCH_PAGE_SIZE) break
    }

    logger.info('All providers fetched', { total: String(allProviders.length) })

    // ── Step 2: Resolve URLs ──
    const resolvedRows: Array<{
      batch_id: number
      url: string
      lastmod: string | null
      provider_id: string
    }> = []
    let droppedCount = 0

    for (let i = 0; i < allProviders.length; i++) {
      const resolved = resolveProviderUrl(allProviders[i])
      if (resolved) {
        resolvedRows.push({
          batch_id: Math.floor(resolvedRows.length / PROVIDER_BATCH_SIZE),
          url: resolved.url,
          lastmod: resolved.lastmod || null,
          provider_id: resolved.providerId,
        })
      } else {
        droppedCount++
      }
    }

    const maxBatchId = resolvedRows.length > 0
      ? resolvedRows[resolvedRows.length - 1].batch_id
      : -1
    const batchCount = maxBatchId + 1

    logger.info('URLs resolved', {
      resolved: String(resolvedRows.length),
      dropped: String(droppedCount),
      batchCount: String(batchCount),
    })

    // ── Step 3: Guardrails ──
    if (resolvedRows.length === 0) {
      logger.warn('No URLs resolved — skipping table update to preserve existing data')
      return {
        success: false,
        totalProviders: allProviders.length,
        resolvedUrls: 0,
        droppedProviders: droppedCount,
        batchCount: 0,
        maxBatchId: -1,
        durationMs: Date.now() - startMs,
        error: 'No URLs resolved — table not modified',
      }
    }

    // Check max URLs per batch
    const batchCounts = new Map<number, number>()
    for (const row of resolvedRows) {
      batchCounts.set(row.batch_id, (batchCounts.get(row.batch_id) || 0) + 1)
    }
    for (const [batchId, count] of Array.from(batchCounts.entries())) {
      if (count > 50_000) {
        logger.error('Batch exceeds 50k URLs', { batchId: String(batchId), count: String(count) })
        return {
          success: false,
          totalProviders: allProviders.length,
          resolvedUrls: resolvedRows.length,
          droppedProviders: droppedCount,
          batchCount,
          maxBatchId,
          durationMs: Date.now() - startMs,
          error: `Batch ${batchId} has ${count} URLs (> 50k limit)`,
        }
      }
    }

    // ── Step 4: Delete old data ──
    logger.info('Deleting old sitemap URLs')
    const { error: deleteError } = await supabase
      .from('provider_sitemap_urls')
      .delete()
      .gte('id', 0)

    if (deleteError) {
      logger.error('Delete error', { code: deleteError.code, message: deleteError.message })
      return {
        success: false,
        totalProviders: allProviders.length,
        resolvedUrls: resolvedRows.length,
        droppedProviders: droppedCount,
        batchCount,
        maxBatchId,
        durationMs: Date.now() - startMs,
        error: `Delete error: ${deleteError.message}`,
      }
    }

    // ── Step 5: Insert new data in chunks ──
    let insertedCount = 0
    for (let i = 0; i < resolvedRows.length; i += INSERT_CHUNK_SIZE) {
      const chunk = resolvedRows.slice(i, i + INSERT_CHUNK_SIZE)
      const { error: insertError } = await supabase
        .from('provider_sitemap_urls')
        .insert(chunk)

      if (insertError) {
        logger.error('Insert chunk error', {
          offset: String(i),
          chunkSize: String(chunk.length),
          code: insertError.code,
          message: insertError.message,
        })
        // Continue inserting remaining chunks — partial data is better than none
        continue
      }
      insertedCount += chunk.length

      if (i % (INSERT_CHUNK_SIZE * 50) === 0 && i > 0) {
        logger.info('Insert progress', {
          inserted: String(insertedCount),
          total: String(resolvedRows.length),
          pct: String(Math.round(insertedCount / resolvedRows.length * 100)),
        })
      }
    }

    // ── Step 6: Post-insert integrity check ──
    if (insertedCount === 0) {
      logger.error('All inserts failed — table is now empty', {
        resolvedRows: String(resolvedRows.length),
        insertedCount: '0',
      })
      return {
        success: false,
        totalProviders: allProviders.length,
        resolvedUrls: 0,
        droppedProviders: droppedCount,
        batchCount: 0,
        maxBatchId: -1,
        durationMs: Date.now() - startMs,
        error: 'All inserts failed after delete — table is empty. Legacy fallback will be used.',
      }
    }

    const insertRatio = insertedCount / resolvedRows.length
    if (insertRatio < 0.9) {
      logger.warn('Significant insert failures — only partial data written', {
        insertedCount: String(insertedCount),
        expectedCount: String(resolvedRows.length),
        ratio: String(Math.round(insertRatio * 100)),
      })
    }

    const durationMs = Date.now() - startMs
    logger.info('Refresh complete', {
      totalProviders: String(allProviders.length),
      resolvedUrls: String(insertedCount),
      droppedProviders: String(droppedCount),
      batchCount: String(batchCount),
      durationMs: String(durationMs),
    })

    return {
      success: insertRatio >= 0.9,
      totalProviders: allProviders.length,
      resolvedUrls: insertedCount,
      droppedProviders: droppedCount,
      batchCount,
      maxBatchId,
      durationMs,
      error: insertRatio < 0.9 ? `Only ${Math.round(insertRatio * 100)}% of rows inserted` : undefined,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error('Refresh failed with exception', { error: message })
    return {
      success: false,
      totalProviders: 0,
      resolvedUrls: 0,
      droppedProviders: 0,
      batchCount: 0,
      maxBatchId: -1,
      durationMs: Date.now() - startMs,
      error: message,
    }
  }
}

// ── CLI entrypoint ──────────────────────────────────────────────────────────

if (typeof process !== 'undefined' && process.argv[1]?.includes('refresh-provider-sitemaps')) {
  ;(async () => {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()

    const consoleLogger: RefreshLogger = {
      info: (msg, meta) => console.log(`[INFO] ${msg}`, meta ? JSON.stringify(meta) : ''),
      warn: (msg, meta) => console.warn(`[WARN] ${msg}`, meta ? JSON.stringify(meta) : ''),
      error: (msg, meta) => console.error(`[ERROR] ${msg}`, meta ? JSON.stringify(meta) : ''),
    }

    const result = await refreshProviderSitemaps({ supabase, log: consoleLogger })
    console.log('\n=== RESULT ===')
    console.log(JSON.stringify(result, null, 2))
    process.exit(result.success ? 0 : 1)
  })()
}
