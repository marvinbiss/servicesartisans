/**
 * Refresh Provider Sitemaps — Pre-computes provider sitemap URLs into
 * the `provider_sitemap_urls` table for fast runtime serving.
 *
 * Execution modes:
 *   1. CLI: npx tsx src/lib/seo/refresh-provider-sitemaps.ts
 *   2. API: called by /api/admin/refresh-provider-sitemaps
 *
 * Algorithm (atomic snapshot refresh):
 *   1. Acquire concurrency lock (reject if another refresh is in progress)
 *   2. Allocate new snapshot_id
 *   3. Fetch all active, non-noindex providers (keyset pagination by id)
 *   4. Resolve each → sitemap URL (using provider-url-resolver)
 *   5. INSERT rows with new snapshot_id (old snapshot untouched)
 *   6. Post-refresh validation (batch counts, URL sanity, row integrity)
 *   7. Activate new snapshot (pointer flip — atomic UPDATE)
 *   8. Mark old snapshot as superseded
 *   9. Garbage collect old snapshot rows (async cleanup)
 *
 * Ordering: by provider `id` (immutable, deterministic) — NOT by updated_at.
 * This guarantees stable batch assignment across refreshes.
 */

import { PROVIDER_BATCH_SIZE } from '@/lib/seo/sitemap-manifest'
import { resolveProviderUrl, PROVIDER_SELECT_COLUMNS } from '@/lib/seo/provider-url-resolver'
import type { ProviderRow } from '@/lib/seo/provider-url-resolver'

const FETCH_PAGE_SIZE = 5000
const INSERT_CHUNK_SIZE = 1000
const MAX_URLS_PER_BATCH = 50_000
const MIN_RESOLVED_RATIO = 0.5 // Require at least 50% of providers to resolve
const MAX_BATCH_DELTA_RATIO = 0.5 // Batch count can't change by more than 50% vs current
const ZOMBIE_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes — building snapshots older than this are zombies

export type RefreshResult = {
  success: boolean
  snapshotId: number
  totalProviders: number
  resolvedUrls: number
  droppedProviders: number
  batchCount: number
  maxBatchId: number
  durationMs: number
  validationErrors: string[]
  error?: string
}

export type RefreshLogger = {
  info: (msg: string, meta?: Record<string, string>) => void
  warn: (msg: string, meta?: Record<string, string>) => void
  error: (msg: string, meta?: Record<string, string>) => void
}

type SupabaseClient = ReturnType<typeof import('@/lib/supabase/admin').createAdminClient>

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getActiveSnapshotId(supabase: SupabaseClient): Promise<number | null> {
  const { data, error } = await supabase
    .from('sitemap_snapshots')
    .select('snapshot_id')
    .eq('status', 'active')
    .limit(1)

  if (error || !data || data.length === 0) return null
  return data[0].snapshot_id
}

async function allocateSnapshotId(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase
    .from('sitemap_snapshots')
    .select('snapshot_id')
    .order('snapshot_id', { ascending: false })
    .limit(1)

  if (error) throw new Error(`Failed to query max snapshot_id: ${error.message}`)
  return (data && data.length > 0) ? data[0].snapshot_id + 1 : 1
}

async function cleanupZombieSnapshots(
  supabase: SupabaseClient,
  logger: RefreshLogger,
): Promise<void> {
  const cutoff = new Date(Date.now() - ZOMBIE_TIMEOUT_MS).toISOString()

  const { data: zombies, error } = await supabase
    .from('sitemap_snapshots')
    .select('snapshot_id')
    .eq('status', 'building')
    .lt('created_at', cutoff)

  if (error || !zombies || zombies.length === 0) return

  for (const zombie of zombies) {
    logger.warn('Cleaning up zombie snapshot', { snapshotId: String(zombie.snapshot_id) })

    await supabase
      .from('provider_sitemap_urls')
      .delete()
      .eq('snapshot_id', zombie.snapshot_id)

    await supabase
      .from('sitemap_snapshots')
      .update({ status: 'failed', error_message: 'Zombie timeout — cleaned up by next refresh' })
      .eq('snapshot_id', zombie.snapshot_id)
  }
}

/**
 * Run a full atomic refresh of provider_sitemap_urls.
 *
 * Accepts a Supabase admin client (service_role) and an optional logger.
 * Returns a structured result for observability.
 */
export async function refreshProviderSitemaps(params: {
  supabase: SupabaseClient
  log?: RefreshLogger
}): Promise<RefreshResult> {
  const { supabase, log } = params
  const startMs = Date.now()
  const noop = () => {}
  const logger = log || { info: noop, warn: noop, error: noop }

  const emptyResult = (snapshotId: number, error: string, extra?: Partial<RefreshResult>): RefreshResult => ({
    success: false,
    snapshotId,
    totalProviders: 0,
    resolvedUrls: 0,
    droppedProviders: 0,
    batchCount: 0,
    maxBatchId: -1,
    durationMs: Date.now() - startMs,
    validationErrors: [],
    error,
    ...extra,
  })

  let snapshotId = 0

  try {
    // ── Step 0: Cleanup zombie snapshots ──────────────────────────────────
    await cleanupZombieSnapshots(supabase, logger)

    // ── Step 1: Concurrency lock — reject if another refresh is in progress ──
    const { data: building } = await supabase
      .from('sitemap_snapshots')
      .select('snapshot_id, created_at')
      .eq('status', 'building')
      .limit(1)

    if (building && building.length > 0) {
      const age = Date.now() - new Date(building[0].created_at).getTime()
      logger.error('Another refresh is already in progress', {
        snapshotId: String(building[0].snapshot_id),
        ageMs: String(age),
      })
      return emptyResult(0, `Concurrent refresh blocked — snapshot ${building[0].snapshot_id} is building (age: ${Math.round(age / 1000)}s)`)
    }

    // ── Step 2: Allocate new snapshot_id ─────────────────────────────────
    snapshotId = await allocateSnapshotId(supabase)

    const { error: createError } = await supabase
      .from('sitemap_snapshots')
      .insert({
        snapshot_id: snapshotId,
        status: 'building',
      })

    if (createError) {
      logger.error('Failed to create snapshot record', {
        code: createError.code,
        message: createError.message,
      })
      return emptyResult(snapshotId, `Failed to create snapshot: ${createError.message}`)
    }

    logger.info('Snapshot allocated', { snapshotId: String(snapshotId) })

    // ── Step 3: Fetch all active, non-noindex providers (keyset pagination) ──
    logger.info('Starting provider fetch')

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
        await markSnapshotFailed(supabase, snapshotId, `DB fetch error: ${error.message}`)
        return emptyResult(snapshotId, `DB fetch error: ${error.message}`, {
          totalProviders: allProviders.length,
        })
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

    // ── Step 4: Resolve URLs ──────────────────────────────────────────────
    const resolvedRows: Array<{
      batch_id: number
      url: string
      lastmod: string | null
      provider_id: string
      snapshot_id: number
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
          snapshot_id: snapshotId,
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

    // ── Step 5: Pre-insert guardrails ────────────────────────────────────
    if (resolvedRows.length === 0) {
      logger.warn('No URLs resolved — skipping table update to preserve existing data')
      await markSnapshotFailed(supabase, snapshotId, 'No URLs resolved — table not modified')
      return emptyResult(snapshotId, 'No URLs resolved — table not modified', {
        totalProviders: allProviders.length,
        droppedProviders: droppedCount,
      })
    }

    // Check max URLs per batch
    const batchCounts = new Map<number, number>()
    for (const row of resolvedRows) {
      batchCounts.set(row.batch_id, (batchCounts.get(row.batch_id) || 0) + 1)
    }
    for (const [batchId, count] of Array.from(batchCounts.entries())) {
      if (count > MAX_URLS_PER_BATCH) {
        const msg = `Batch ${batchId} has ${count} URLs (> 50k limit)`
        logger.error('Batch exceeds 50k URLs', { batchId: String(batchId), count: String(count) })
        await markSnapshotFailed(supabase, snapshotId, msg)
        return emptyResult(snapshotId, msg, {
          totalProviders: allProviders.length,
          resolvedUrls: resolvedRows.length,
          droppedProviders: droppedCount,
          batchCount,
          maxBatchId,
        })
      }
    }

    // ── Step 6: INSERT new rows with new snapshot_id ─────────────────────
    // Old snapshot rows are untouched — reads continue serving old data
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

    if (insertedCount === 0) {
      const msg = 'All inserts failed — snapshot abandoned. Existing data preserved.'
      logger.error(msg)
      await markSnapshotFailed(supabase, snapshotId, msg)
      return emptyResult(snapshotId, msg, {
        totalProviders: allProviders.length,
        droppedProviders: droppedCount,
      })
    }

    // ── Step 7: Post-refresh validation ──────────────────────────────────
    logger.info('Running post-refresh validation')
    await supabase
      .from('sitemap_snapshots')
      .update({ status: 'validating' })
      .eq('snapshot_id', snapshotId)

    const validationErrors: string[] = []

    // 7a. Verify insert ratio
    const insertRatio = insertedCount / resolvedRows.length
    if (insertRatio < 0.9) {
      validationErrors.push(`Insert ratio ${Math.round(insertRatio * 100)}% < 90% threshold`)
    }

    // 7b. Verify resolved ratio
    const resolvedRatio = resolvedRows.length / allProviders.length
    if (resolvedRatio < MIN_RESOLVED_RATIO) {
      validationErrors.push(`Resolved ratio ${Math.round(resolvedRatio * 100)}% < ${MIN_RESOLVED_RATIO * 100}% minimum`)
    }

    // 7c. Compare batch count with current active snapshot
    const activeSnapshotId = await getActiveSnapshotId(supabase)
    if (activeSnapshotId) {
      const { data: activeBatchData } = await supabase
        .from('sitemap_snapshots')
        .select('batch_count')
        .eq('snapshot_id', activeSnapshotId)
        .limit(1)

      if (activeBatchData && activeBatchData.length > 0 && activeBatchData[0].batch_count) {
        const currentBatchCount = activeBatchData[0].batch_count
        const delta = Math.abs(batchCount - currentBatchCount) / currentBatchCount
        if (delta > MAX_BATCH_DELTA_RATIO) {
          validationErrors.push(
            `Batch count delta ${Math.round(delta * 100)}% exceeds ${MAX_BATCH_DELTA_RATIO * 100}% threshold (${currentBatchCount} → ${batchCount})`
          )
        }
      }
    }

    // 7d. Verify actual row count in DB matches expectations
    const { count: dbRowCount, error: countError } = await supabase
      .from('provider_sitemap_urls')
      .select('*', { count: 'exact', head: true })
      .eq('snapshot_id', snapshotId)

    if (!countError && dbRowCount !== null) {
      if (dbRowCount !== insertedCount) {
        validationErrors.push(`DB row count ${dbRowCount} != expected ${insertedCount}`)
      }
    }

    const buildDurationMs = Date.now() - startMs

    // Update snapshot with stats
    await supabase
      .from('sitemap_snapshots')
      .update({
        total_providers: allProviders.length,
        resolved_urls: insertedCount,
        dropped_providers: droppedCount,
        batch_count: batchCount,
        max_batch_id: maxBatchId,
        build_duration_ms: buildDurationMs,
        validation_errors: validationErrors.length > 0 ? validationErrors : null,
      })
      .eq('snapshot_id', snapshotId)

    // If validation has HARD failures (insert ratio < 90% or resolved ratio < minimum), abort
    if (insertRatio < 0.9 || resolvedRatio < MIN_RESOLVED_RATIO) {
      const msg = `Validation failed: ${validationErrors.join('; ')}`
      logger.error(msg)
      await markSnapshotFailed(supabase, snapshotId, msg)
      // Clean up the failed snapshot's rows
      await supabase
        .from('provider_sitemap_urls')
        .delete()
        .eq('snapshot_id', snapshotId)
      return {
        success: false,
        snapshotId,
        totalProviders: allProviders.length,
        resolvedUrls: insertedCount,
        droppedProviders: droppedCount,
        batchCount,
        maxBatchId,
        durationMs: buildDurationMs,
        validationErrors,
        error: msg,
      }
    }

    // Log warnings but proceed with activation
    for (const warning of validationErrors) {
      logger.warn('Validation warning (non-blocking)', { warning })
    }

    // ── Step 8: Activate new snapshot (atomic pointer flip) ──────────────
    logger.info('Activating snapshot', { snapshotId: String(snapshotId) })

    // Supersede the old active snapshot
    if (activeSnapshotId) {
      await supabase
        .from('sitemap_snapshots')
        .update({ status: 'superseded', superseded_at: new Date().toISOString() })
        .eq('snapshot_id', activeSnapshotId)
    }

    // Activate the new snapshot
    await supabase
      .from('sitemap_snapshots')
      .update({ status: 'active', activated_at: new Date().toISOString() })
      .eq('snapshot_id', snapshotId)

    logger.info('Snapshot activated', { snapshotId: String(snapshotId) })

    // ── Step 9: Garbage collect old snapshot rows (async, best-effort) ───
    if (activeSnapshotId) {
      logger.info('Garbage collecting old snapshot rows', {
        oldSnapshotId: String(activeSnapshotId),
      })
      const { error: gcError } = await supabase
        .from('provider_sitemap_urls')
        .delete()
        .eq('snapshot_id', activeSnapshotId)

      if (gcError) {
        logger.warn('GC delete failed (non-critical, old rows remain)', {
          oldSnapshotId: String(activeSnapshotId),
          code: gcError.code,
          message: gcError.message,
        })
      } else {
        await supabase
          .from('sitemap_snapshots')
          .update({ status: 'garbage_collected' })
          .eq('snapshot_id', activeSnapshotId)
      }
    }

    // Also GC any snapshots older than the previous active
    if (activeSnapshotId && activeSnapshotId > 1) {
      const { data: oldSnapshots } = await supabase
        .from('sitemap_snapshots')
        .select('snapshot_id')
        .in('status', ['superseded', 'failed'])
        .lt('snapshot_id', activeSnapshotId)

      if (oldSnapshots && oldSnapshots.length > 0) {
        for (const old of oldSnapshots) {
          await supabase
            .from('provider_sitemap_urls')
            .delete()
            .eq('snapshot_id', old.snapshot_id)
          await supabase
            .from('sitemap_snapshots')
            .update({ status: 'garbage_collected' })
            .eq('snapshot_id', old.snapshot_id)
        }
        logger.info('GC: cleaned up older snapshots', {
          count: String(oldSnapshots.length),
        })
      }
    }

    const durationMs = Date.now() - startMs
    logger.info('Refresh complete', {
      snapshotId: String(snapshotId),
      totalProviders: String(allProviders.length),
      resolvedUrls: String(insertedCount),
      droppedProviders: String(droppedCount),
      batchCount: String(batchCount),
      durationMs: String(durationMs),
    })

    return {
      success: true,
      snapshotId,
      totalProviders: allProviders.length,
      resolvedUrls: insertedCount,
      droppedProviders: droppedCount,
      batchCount,
      maxBatchId,
      durationMs,
      validationErrors,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error('Refresh failed with exception', { error: message })
    if (snapshotId > 0) {
      await markSnapshotFailed(supabase, snapshotId, message).catch(() => {})
      // Best-effort cleanup of partial rows
      await supabase
        .from('provider_sitemap_urls')
        .delete()
        .eq('snapshot_id', snapshotId)
        .then(() => {}, () => {})
    }
    return {
      success: false,
      snapshotId,
      totalProviders: 0,
      resolvedUrls: 0,
      droppedProviders: 0,
      batchCount: 0,
      maxBatchId: -1,
      durationMs: Date.now() - startMs,
      validationErrors: [],
      error: message,
    }
  }
}

async function markSnapshotFailed(supabase: SupabaseClient, snapshotId: number, errorMessage: string): Promise<void> {
  await supabase
    .from('sitemap_snapshots')
    .update({
      status: 'failed',
      error_message: errorMessage,
    })
    .eq('snapshot_id', snapshotId)
}

/**
 * Get the currently active snapshot ID.
 * Exported for use by route handlers.
 */
export { getActiveSnapshotId }

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
