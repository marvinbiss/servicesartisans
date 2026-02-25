/**
 * Refresh Provider Sitemaps — Pre-computes provider sitemap URLs into
 * the `provider_sitemap_urls` table for fast runtime serving.
 *
 * Execution modes:
 *   1. CLI: npx tsx src/lib/seo/refresh-provider-sitemaps.ts
 *   2. API: called by /api/admin/refresh-provider-sitemaps
 *
 * Algorithm (atomic snapshot refresh):
 *   1. Clean up zombie snapshots (building for > ZOMBIE_TIMEOUT_MS)
 *   2. Allocate new snapshot_id
 *   3. Acquire DB-level concurrency lock (INSERT with status='building';
 *      unique partial index rejects if another refresh is in progress)
 *   4. Fetch all active, non-noindex providers (keyset pagination by id)
 *   5. Resolve each → sitemap URL (using provider-url-resolver)
 *   6. INSERT rows with new snapshot_id (old snapshot untouched, reads continue)
 *   7. Post-refresh validation (structured: hard-fail vs warning)
 *   8. Activate new snapshot via RPC (atomic pointer flip in one transaction)
 *   9. Safe GC (keep active + last superseded for rollback, delete the rest)
 *
 * Ordering: by provider `id` (immutable, deterministic) — NOT by updated_at.
 * This guarantees stable batch assignment across refreshes.
 *
 * DB-level guarantees (migration 347):
 *   - UNIQUE partial index on status='building' → at most 1 concurrent refresh
 *   - UNIQUE partial index on status='active'  → at most 1 active snapshot
 *   - UNIQUE(snapshot_id, provider_id)          → no duplicate providers per snapshot
 *   - RPC activate_sitemap_snapshot()           → atomic pointer flip
 */

import { PROVIDER_BATCH_SIZE } from '@/lib/seo/sitemap-manifest'
import { resolveProviderUrl, PROVIDER_SELECT_COLUMNS } from '@/lib/seo/provider-url-resolver'
import type { ProviderRow } from '@/lib/seo/provider-url-resolver'

// ── Configurable thresholds ─────────────────────────────────────────────────
// These can be overridden in future via env vars if needed.

const FETCH_PAGE_SIZE = 5000
const INSERT_CHUNK_SIZE = 1000

/** Google sitemap limit: max URLs per sitemap file */
const MAX_URLS_PER_BATCH = 50_000

/** Hard fail: reject snapshot if fewer than this ratio of providers resolved to URLs */
const MIN_RESOLVED_RATIO = 0.5

/** Hard fail: reject snapshot if fewer than this ratio of resolved URLs were inserted */
const MIN_INSERT_RATIO = 0.9

/** Warning: log if batch count changes by more than this ratio vs current active */
const MAX_BATCH_DELTA_RATIO = 0.5

/** Zombie timeout: building snapshots older than this are cleaned up automatically */
const ZOMBIE_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

/** GC retention: keep the active snapshot + this many superseded snapshots for rollback */
const GC_KEEP_SUPERSEDED = 1

/** PostgreSQL error code for unique constraint violation */
const PG_UNIQUE_VIOLATION = '23505'

// ── Types ───────────────────────────────────────────────────────────────────

export type ValidationCheck = {
  name: string
  status: 'pass' | 'warn' | 'fail'
  message: string
  metric?: number
  threshold?: number
}

export type RefreshResult = {
  success: boolean
  snapshotId: number
  totalProviders: number
  resolvedUrls: number
  droppedProviders: number
  batchCount: number
  maxBatchId: number
  durationMs: number
  validationChecks: ValidationCheck[]
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
    .order('snapshot_id', { ascending: false })
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

async function markSnapshotFailed(supabase: SupabaseClient, snapshotId: number, errorMessage: string): Promise<void> {
  await supabase
    .from('sitemap_snapshots')
    .update({
      status: 'failed',
      error_message: errorMessage,
    })
    .eq('snapshot_id', snapshotId)
}

// ── Main refresh function ───────────────────────────────────────────────────

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
    validationChecks: [],
    validationErrors: [],
    error,
    ...extra,
  })

  let snapshotId = 0

  try {
    // ── Step 1: Cleanup zombie snapshots ──────────────────────────────────
    await cleanupZombieSnapshots(supabase, logger)

    // ── Step 2: Allocate new snapshot_id ─────────────────────────────────
    snapshotId = await allocateSnapshotId(supabase)

    // ── Step 3: Acquire DB-level lock via INSERT ────────────────────────
    // The unique partial index idx_snapshots_one_building ensures at most
    // 1 row with status='building'. If another refresh is already running,
    // this INSERT fails with 23505 (unique_violation). No check-then-act race.
    const { error: createError } = await supabase
      .from('sitemap_snapshots')
      .insert({
        snapshot_id: snapshotId,
        status: 'building',
      })

    if (createError) {
      if (createError.code === PG_UNIQUE_VIOLATION) {
        logger.error('Concurrent refresh blocked — DB lock active (unique constraint on building)', {
          snapshotId: String(snapshotId),
          code: createError.code,
          event: 'refresh.lock_denied',
        })
        return emptyResult(snapshotId, 'Concurrent refresh blocked — another refresh is building (DB-level lock)')
      }
      logger.error('Failed to create snapshot record', {
        code: createError.code,
        message: createError.message,
        event: 'refresh.snapshot_create_failed',
      })
      return emptyResult(snapshotId, `Failed to create snapshot: ${createError.message}`)
    }

    logger.info('Lock acquired — snapshot allocated', {
      snapshotId: String(snapshotId),
      event: 'refresh.lock_acquired',
    })

    // ── Step 4: Fetch all active, non-noindex providers (keyset pagination) ──
    logger.info('Starting provider fetch', { event: 'refresh.fetch_start' })

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
        logger.error('Fetch page error', {
          code: error.code,
          message: error.message,
          event: 'refresh.fetch_error',
        })
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

    logger.info('All providers fetched', {
      total: String(allProviders.length),
      event: 'refresh.fetch_complete',
    })

    // ── Step 5: Resolve URLs ──────────────────────────────────────────────
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
      event: 'refresh.resolve_complete',
    })

    // ── Step 6: Pre-insert guardrails ────────────────────────────────────
    if (resolvedRows.length === 0) {
      logger.warn('No URLs resolved — skipping table update to preserve existing data', {
        event: 'refresh.zero_urls',
      })
      await markSnapshotFailed(supabase, snapshotId, 'No URLs resolved — table not modified')
      return emptyResult(snapshotId, 'No URLs resolved — table not modified', {
        totalProviders: allProviders.length,
        droppedProviders: droppedCount,
      })
    }

    // Check max URLs per batch (50k limit)
    const batchCounts = new Map<number, number>()
    for (const row of resolvedRows) {
      batchCounts.set(row.batch_id, (batchCounts.get(row.batch_id) || 0) + 1)
    }
    for (const [batchId, count] of Array.from(batchCounts.entries())) {
      if (count > MAX_URLS_PER_BATCH) {
        const msg = `Batch ${batchId} has ${count} URLs (> 50k limit)`
        logger.error('Batch exceeds 50k URLs', {
          batchId: String(batchId),
          count: String(count),
          event: 'refresh.batch_overflow',
        })
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

    // ── Step 7: INSERT new rows with new snapshot_id ─────────────────────
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
          event: 'refresh.insert_error',
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
      logger.error(msg, { event: 'refresh.insert_total_failure' })
      await markSnapshotFailed(supabase, snapshotId, msg)
      return emptyResult(snapshotId, msg, {
        totalProviders: allProviders.length,
        droppedProviders: droppedCount,
      })
    }

    // ── Step 8: Post-refresh validation ──────────────────────────────────
    logger.info('Running post-refresh validation', { event: 'refresh.validation_start' })
    await supabase
      .from('sitemap_snapshots')
      .update({ status: 'validating' })
      .eq('snapshot_id', snapshotId)

    const checks: ValidationCheck[] = []
    let hasHardFail = false

    // Check 1: Insert ratio
    const insertRatio = insertedCount / resolvedRows.length
    const insertCheck: ValidationCheck = {
      name: 'insert_ratio',
      status: insertRatio >= MIN_INSERT_RATIO ? 'pass' : 'fail',
      message: `Insert ratio ${Math.round(insertRatio * 100)}% (threshold: ${MIN_INSERT_RATIO * 100}%)`,
      metric: insertRatio,
      threshold: MIN_INSERT_RATIO,
    }
    checks.push(insertCheck)
    if (insertCheck.status === 'fail') hasHardFail = true

    // Check 2: Resolved ratio
    const resolvedRatio = resolvedRows.length / allProviders.length
    const resolvedCheck: ValidationCheck = {
      name: 'resolved_ratio',
      status: resolvedRatio >= MIN_RESOLVED_RATIO ? 'pass' : 'fail',
      message: `Resolved ratio ${Math.round(resolvedRatio * 100)}% (threshold: ${MIN_RESOLVED_RATIO * 100}%)`,
      metric: resolvedRatio,
      threshold: MIN_RESOLVED_RATIO,
    }
    checks.push(resolvedCheck)
    if (resolvedCheck.status === 'fail') hasHardFail = true

    // Check 3: Batch count delta vs current active
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
        checks.push({
          name: 'batch_count_delta',
          status: delta <= MAX_BATCH_DELTA_RATIO ? 'pass' : 'warn',
          message: `Batch count delta ${Math.round(delta * 100)}% (threshold: ${MAX_BATCH_DELTA_RATIO * 100}%, ${currentBatchCount} → ${batchCount})`,
          metric: delta,
          threshold: MAX_BATCH_DELTA_RATIO,
        })
      }
    }

    // Check 4: DB row count matches expected
    const { count: dbRowCount, error: countError } = await supabase
      .from('provider_sitemap_urls')
      .select('*', { count: 'exact', head: true })
      .eq('snapshot_id', snapshotId)

    if (!countError && dbRowCount !== null) {
      const rowCountMatch = dbRowCount === insertedCount
      const rowCountCheck: ValidationCheck = {
        name: 'db_row_count',
        status: rowCountMatch ? 'pass' : 'fail',
        message: rowCountMatch
          ? `DB row count matches: ${dbRowCount}`
          : `DB row count ${dbRowCount} != expected ${insertedCount} (data corruption)`,
        metric: dbRowCount,
        threshold: insertedCount,
      }
      checks.push(rowCountCheck)
      if (!rowCountMatch) hasHardFail = true
    }

    const buildDurationMs = Date.now() - startMs
    const validationErrors = checks.filter(c => c.status !== 'pass').map(c => c.message)

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

    // Log validation summary
    const passCount = checks.filter(c => c.status === 'pass').length
    const warnCount = checks.filter(c => c.status === 'warn').length
    const failCount = checks.filter(c => c.status === 'fail').length
    logger.info('Validation summary', {
      total: String(checks.length),
      pass: String(passCount),
      warn: String(warnCount),
      fail: String(failCount),
      event: 'refresh.validation_complete',
    })

    // If hard-fail, abort activation
    if (hasHardFail) {
      const failedChecks = checks.filter(c => c.status === 'fail').map(c => c.message)
      const msg = `Validation hard-fail: ${failedChecks.join('; ')}`
      logger.error(msg, { event: 'refresh.validation_hard_fail' })
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
        validationChecks: checks,
        validationErrors,
        error: msg,
      }
    }

    // Log warnings but proceed with activation
    for (const check of checks.filter(c => c.status === 'warn')) {
      logger.warn('Validation warning (non-blocking)', {
        check: check.name,
        message: check.message,
        event: 'refresh.validation_warning',
      })
    }

    // ── Step 9: Activate new snapshot (atomic pointer flip) ──────────────
    logger.info('Activating snapshot', {
      snapshotId: String(snapshotId),
      event: 'refresh.activation_start',
    })

    // Try RPC function first (atomic, single transaction)
    const { data: rpcResult, error: rpcError } = await supabase
      .rpc('activate_sitemap_snapshot', { p_new_snapshot_id: snapshotId })

    if (rpcError) {
      // RPC not available (migration 347 not applied?) — fallback to two UPDATEs
      logger.warn('RPC activate_sitemap_snapshot failed, falling back to two UPDATEs', {
        code: rpcError.code,
        message: rpcError.message,
        event: 'refresh.rpc_fallback',
      })

      // Supersede the old active snapshot first (order matters: unique partial index)
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
    } else if (rpcResult === false) {
      // RPC returned false — snapshot wasn't in 'validating' state
      logger.error('RPC activate_sitemap_snapshot returned false — snapshot not in validating state', {
        snapshotId: String(snapshotId),
        event: 'refresh.activation_failed',
      })
      await markSnapshotFailed(supabase, snapshotId, 'Activation failed — snapshot not in validating state')
      return {
        success: false,
        snapshotId,
        totalProviders: allProviders.length,
        resolvedUrls: insertedCount,
        droppedProviders: droppedCount,
        batchCount,
        maxBatchId,
        durationMs: Date.now() - startMs,
        validationChecks: checks,
        validationErrors,
        error: 'Activation failed — snapshot not in validating state',
      }
    }

    logger.info('Snapshot activated', {
      snapshotId: String(snapshotId),
      event: 'refresh.activated',
    })

    // ── Step 10: Safe garbage collection ─────────────────────────────────
    // Retention policy: keep active + GC_KEEP_SUPERSEDED most recent superseded
    // Delete everything else (older superseded, failed, garbage_collected)
    await safeGarbageCollect(supabase, logger, snapshotId)

    const durationMs = Date.now() - startMs
    logger.info('Refresh complete', {
      snapshotId: String(snapshotId),
      totalProviders: String(allProviders.length),
      resolvedUrls: String(insertedCount),
      droppedProviders: String(droppedCount),
      batchCount: String(batchCount),
      durationMs: String(durationMs),
      event: 'refresh.complete',
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
      validationChecks: checks,
      validationErrors,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error('Refresh failed with exception', {
      error: message,
      event: 'refresh.exception',
    })
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
      validationChecks: [],
      validationErrors: [],
      error: message,
    }
  }
}

// ── Safe Garbage Collection ─────────────────────────────────────────────────

async function safeGarbageCollect(
  supabase: SupabaseClient,
  logger: RefreshLogger,
  currentActiveSnapshotId: number,
): Promise<void> {
  const gcStartMs = Date.now()

  // Find all superseded snapshots, ordered by most recent first
  const { data: superseded } = await supabase
    .from('sitemap_snapshots')
    .select('snapshot_id')
    .eq('status', 'superseded')
    .order('snapshot_id', { ascending: false })

  // Keep GC_KEEP_SUPERSEDED most recent superseded for rollback
  const toKeep = superseded ? superseded.slice(0, GC_KEEP_SUPERSEDED) : []
  const toGc = superseded ? superseded.slice(GC_KEEP_SUPERSEDED) : []
  const keepIds = new Set(toKeep.map(s => s.snapshot_id))
  keepIds.add(currentActiveSnapshotId) // never GC the active

  // Also GC failed snapshots (rows + metadata kept for forensics, rows cleaned)
  const { data: failed } = await supabase
    .from('sitemap_snapshots')
    .select('snapshot_id')
    .in('status', ['failed'])

  const allGcCandidates = [
    ...toGc.map(s => s.snapshot_id),
    ...(failed || []).map(s => s.snapshot_id),
  ].filter(id => !keepIds.has(id))

  if (allGcCandidates.length === 0) {
    logger.info('GC: nothing to clean up', { event: 'refresh.gc_noop' })
    return
  }

  let totalRowsDeleted = 0
  for (const gcSnapshotId of allGcCandidates) {
    // Count rows before deleting (Supabase delete doesn't return count directly)
    const { count } = await supabase
      .from('provider_sitemap_urls')
      .select('*', { count: 'exact', head: true })
      .eq('snapshot_id', gcSnapshotId)

    await supabase
      .from('provider_sitemap_urls')
      .delete()
      .eq('snapshot_id', gcSnapshotId)

    totalRowsDeleted += count || 0

    await supabase
      .from('sitemap_snapshots')
      .update({ status: 'garbage_collected' })
      .eq('snapshot_id', gcSnapshotId)
  }

  const gcDurationMs = Date.now() - gcStartMs
  logger.info('GC complete', {
    snapshotsGCed: String(allGcCandidates.length),
    rowsDeleted: String(totalRowsDeleted),
    keptSuperseded: String(toKeep.length),
    durationMs: String(gcDurationMs),
    event: 'refresh.gc_complete',
  })
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
