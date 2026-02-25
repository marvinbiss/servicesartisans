import { describe, it, expect } from 'vitest'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. MIGRATION 346 — sitemap_snapshots SQL structure
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('migration 346: sitemap_snapshots table', () => {
  function readMigration(): string {
    const fs = require('fs')
    const path = require('path')
    return fs.readFileSync(path.resolve(process.cwd(), 'supabase/migrations/346_sitemap_snapshots.sql'), 'utf-8')
  }

  it('creates sitemap_snapshots table', () => {
    const sql = readMigration()
    expect(sql).toContain('CREATE TABLE')
    expect(sql).toContain('sitemap_snapshots')
  })

  it('has snapshot_id column with unique + positive constraint', () => {
    const sql = readMigration()
    expect(sql).toContain('snapshot_id')
    expect(sql).toContain('INTEGER')
    expect(sql).toContain('UNIQUE')
    expect(sql).toContain('chk_snapshot_id_positive')
  })

  it('has status column with CHECK constraint for all lifecycle states', () => {
    const sql = readMigration()
    expect(sql).toContain('chk_snapshot_status')
    expect(sql).toContain('building')
    expect(sql).toContain('validating')
    expect(sql).toContain('active')
    expect(sql).toContain('superseded')
    expect(sql).toContain('failed')
    expect(sql).toContain('garbage_collected')
  })

  it('has forensic metadata columns', () => {
    const sql = readMigration()
    expect(sql).toContain('total_providers')
    expect(sql).toContain('resolved_urls')
    expect(sql).toContain('dropped_providers')
    expect(sql).toContain('batch_count')
    expect(sql).toContain('max_batch_id')
    expect(sql).toContain('build_duration_ms')
    expect(sql).toContain('validation_errors')
    expect(sql).toContain('error_message')
  })

  it('has timestamp columns for lifecycle tracking', () => {
    const sql = readMigration()
    expect(sql).toContain('created_at')
    expect(sql).toContain('activated_at')
    expect(sql).toContain('superseded_at')
  })

  it('has index on status for active snapshot lookup', () => {
    const sql = readMigration()
    expect(sql).toContain('idx_snapshots_status')
    expect(sql).toContain('idx_snapshots_active')
  })

  it('enables RLS with no policies (service_role only)', () => {
    const sql = readMigration()
    expect(sql).toContain('ENABLE ROW LEVEL SECURITY')
    expect(sql).not.toMatch(/CREATE POLICY/)
  })

  it('adds snapshot_id column to provider_sitemap_urls', () => {
    const sql = readMigration()
    expect(sql).toContain('ALTER TABLE provider_sitemap_urls')
    expect(sql).toContain('ADD COLUMN')
    expect(sql).toContain('snapshot_id')
  })

  it('replaces batch index with composite (snapshot_id, batch_id) index', () => {
    const sql = readMigration()
    expect(sql).toContain('DROP INDEX IF EXISTS idx_psm_batch')
    expect(sql).toContain('idx_psm_snapshot_batch')
    expect(sql).toContain('(snapshot_id, batch_id)')
  })

  it('seeds initial active snapshot for backward compatibility', () => {
    const sql = readMigration()
    expect(sql).toContain('INSERT INTO sitemap_snapshots')
    expect(sql).toContain("'active'")
    expect(sql).toContain('ON CONFLICT')
    expect(sql).toContain('DO NOTHING')
  })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. MIGRATION 347 — DB-level hardening invariants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('migration 347: sitemap_hardening', () => {
  function readMigration(): string {
    const fs = require('fs')
    const path = require('path')
    return fs.readFileSync(path.resolve(process.cwd(), 'supabase/migrations/347_sitemap_hardening.sql'), 'utf-8')
  }

  // ── F1: Fix provider unique index ──────────────────────────────────────

  it('drops the old UNIQUE(provider_id) index that blocks multi-snapshot', () => {
    const sql = readMigration()
    expect(sql).toContain('DROP INDEX IF EXISTS idx_psm_provider_unique')
  })

  it('creates new UNIQUE(snapshot_id, provider_id) index', () => {
    const sql = readMigration()
    expect(sql).toContain('idx_psm_provider_per_snapshot')
    expect(sql).toContain('(snapshot_id, provider_id)')
    expect(sql).toContain('UNIQUE')
  })

  // ── F2: DB-level concurrency lock ──────────────────────────────────────

  it('creates unique partial index for at-most-1 building snapshot', () => {
    const sql = readMigration()
    expect(sql).toContain('idx_snapshots_one_building')
    expect(sql).toContain("WHERE status = 'building'")
    expect(sql).toContain('UNIQUE')
  })

  // ── F3: DB-level single-active invariant ───────────────────────────────

  it('creates unique partial index for at-most-1 active snapshot', () => {
    const sql = readMigration()
    expect(sql).toContain('idx_snapshots_one_active')
    expect(sql).toContain("WHERE status = 'active'")
    expect(sql).toContain('UNIQUE')
  })

  // ── F4: Atomic pointer flip RPC function ───────────────────────────────

  it('creates activate_sitemap_snapshot RPC function', () => {
    const sql = readMigration()
    expect(sql).toContain('CREATE OR REPLACE FUNCTION activate_sitemap_snapshot')
    expect(sql).toContain('p_new_snapshot_id INTEGER')
    expect(sql).toContain('RETURNS BOOLEAN')
    expect(sql).toContain('plpgsql')
  })

  it('RPC function supersedes old active before activating new', () => {
    const sql = readMigration()
    // The function must supersede old BEFORE activating new (unique constraint order)
    const supersedeIdx = sql.indexOf("SET status = 'superseded'")
    const activateIdx = sql.indexOf("SET status = 'active'")
    expect(supersedeIdx).toBeGreaterThan(-1)
    expect(activateIdx).toBeGreaterThan(-1)
    expect(supersedeIdx).toBeLessThan(activateIdx)
  })

  it('RPC function runs in single transaction (plpgsql block)', () => {
    const sql = readMigration()
    expect(sql).toContain('BEGIN')
    expect(sql).toContain('RETURN TRUE')
    expect(sql).toContain('END;')
  })

  it('RPC function uses SECURITY DEFINER', () => {
    const sql = readMigration()
    expect(sql).toContain('SECURITY DEFINER')
  })

  it('RPC function RAISE EXCEPTION if snapshot not in validating state (prevents 0 active)', () => {
    const sql = readMigration()
    expect(sql).toContain('RAISE EXCEPTION')
    expect(sql).toContain('not in validating state')
    expect(sql).toContain('IF NOT FOUND')
  })

  it('drops snapshot_id DEFAULT to prevent silent misassignment', () => {
    const sql = readMigration()
    expect(sql).toContain('ALTER TABLE provider_sitemap_urls ALTER COLUMN snapshot_id DROP DEFAULT')
  })

  it('legacy fallback uses same ordering as refresh script (ORDER BY id ASC)', () => {
    const fs = require('fs')
    const path = require('path')
    const routeSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/app/api/sitemap-providers/route.ts'), 'utf-8')
    // Legacy fallback must order by id ASC (same as refresh script)
    // to ensure consistent batch assignment across code paths
    expect(routeSrc).toContain("order('id', { ascending: true })")
    // Should NOT use updated_at ordering in legacy path
    expect(routeSrc).not.toContain("order('updated_at'")
  })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. REFRESH SCRIPT — atomic snapshot lifecycle (hardened)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('anti-regression: refresh-provider-sitemaps (hardened)', () => {
  function readSource(): string {
    const fs = require('fs')
    const path = require('path')
    return fs.readFileSync(path.resolve(process.cwd(), 'src/lib/seo/refresh-provider-sitemaps.ts'), 'utf-8')
  }

  // ── Imports ────────────────────────────────────────────────────────────

  it('imports PROVIDER_BATCH_SIZE from manifest', () => {
    const src = readSource()
    expect(src).toContain("from '@/lib/seo/sitemap-manifest'")
    expect(src).toContain('PROVIDER_BATCH_SIZE')
  })

  it('imports resolveProviderUrl from provider-url-resolver', () => {
    const src = readSource()
    expect(src).toContain("from '@/lib/seo/provider-url-resolver'")
    expect(src).toContain('resolveProviderUrl')
  })

  it('does NOT define its own PROVIDER_BATCH_SIZE', () => {
    const src = readSource()
    expect(src).not.toMatch(/^\s*(const|let|var)\s+PROVIDER_BATCH_SIZE\b/m)
  })

  // ── Keyset pagination ─────────────────────────────────────────────────

  it('uses keyset pagination (ORDER BY id) not OFFSET', () => {
    const src = readSource()
    expect(src).toContain("order('id'")
    expect(src).toContain("gt('id'")
    expect(src).not.toContain('.range(')
  })

  // ── Guardrails ────────────────────────────────────────────────────────

  it('has 50k guardrail check', () => {
    const src = readSource()
    expect(src).toContain('50_000')
    expect(src).toContain('50k')
  })

  it('skips table update when no URLs resolved (safety net)', () => {
    const src = readSource()
    expect(src).toContain('No URLs resolved')
    expect(src).toContain('table not modified')
  })

  // ── Types ─────────────────────────────────────────────────────────────

  it('exports RefreshResult type with snapshotId and validationChecks', () => {
    const src = readSource()
    expect(src).toContain('export type RefreshResult')
    expect(src).toContain('snapshotId')
    expect(src).toContain('validationChecks')
  })

  it('exports ValidationCheck type with structured fields', () => {
    const src = readSource()
    expect(src).toContain('export type ValidationCheck')
    expect(src).toContain("'pass'")
    expect(src).toContain("'warn'")
    expect(src).toContain("'fail'")
  })

  // ── DB-level lock (P1 — concurrency) ──────────────────────────────────

  it('uses PostgreSQL unique constraint violation (23505) for lock detection', () => {
    const src = readSource()
    expect(src).toContain('PG_UNIQUE_VIOLATION')
    expect(src).toContain("'23505'")
    expect(src).toContain('DB lock active')
  })

  it('does NOT use check-then-act pattern for lock', () => {
    const src = readSource()
    // Should NOT have a SELECT for building status before INSERT
    // The INSERT itself is the lock (unique partial index)
    // Old pattern: separate check "if building" before INSERT — should be gone
    const insertIdx = src.indexOf("status: 'building'")
    expect(insertIdx).toBeGreaterThan(-1)
    // The word "building" in the INSERT is fine — it's the lock acquisition
    // Verify there's no separate SELECT-check-then-INSERT pattern
    expect(src).not.toContain('Another refresh is already in progress')
  })

  // ── Atomic pointer flip (P1 — invariant) ──────────────────────────────

  it('uses RPC function for atomic pointer flip', () => {
    const src = readSource()
    expect(src).toContain("rpc('activate_sitemap_snapshot'")
    expect(src).toContain('p_new_snapshot_id')
  })

  it('has fallback to two UPDATEs if RPC unavailable', () => {
    const src = readSource()
    expect(src).toContain('rpc_fallback')
    expect(src).toContain("status: 'superseded'")
    expect(src).toContain("status: 'active'")
  })

  // ── Snapshot lifecycle ────────────────────────────────────────────────

  it('creates snapshot record with building status', () => {
    const src = readSource()
    expect(src).toContain("status: 'building'")
    expect(src).toContain("'sitemap_snapshots'")
  })

  it('transitions through validating state', () => {
    const src = readSource()
    expect(src).toContain("status: 'validating'")
  })

  it('has zombie snapshot cleanup', () => {
    const src = readSource()
    expect(src).toContain('cleanupZombieSnapshots')
    expect(src).toContain('Zombie timeout')
    expect(src).toContain('ZOMBIE_TIMEOUT_MS')
  })

  it('inserts rows with snapshot_id', () => {
    const src = readSource()
    expect(src).toContain('snapshot_id: snapshotId')
  })

  it('marks snapshot as failed on error', () => {
    const src = readSource()
    expect(src).toContain('markSnapshotFailed')
    expect(src).toContain("status: 'failed'")
    expect(src).toContain('error_message')
  })

  // ── Structured validation (P4) ────────────────────────────────────────

  it('uses named ValidationCheck objects with pass/warn/fail', () => {
    const src = readSource()
    expect(src).toContain("name: 'insert_ratio'")
    expect(src).toContain("name: 'resolved_ratio'")
    expect(src).toContain("name: 'batch_count_delta'")
    expect(src).toContain("name: 'db_row_count'")
  })

  it('has named threshold constants for all validations', () => {
    const src = readSource()
    expect(src).toContain('MIN_INSERT_RATIO')
    expect(src).toContain('MIN_RESOLVED_RATIO')
    expect(src).toContain('MAX_BATCH_DELTA_RATIO')
  })

  it('treats insert ratio as hard-fail', () => {
    const src = readSource()
    // The insertCheck should set status to 'fail' not 'warn'
    expect(src).toMatch(/name:\s*'insert_ratio'[\s\S]*?status:.*'fail'/)
  })

  it('treats DB row count mismatch as hard-fail', () => {
    const src = readSource()
    expect(src).toMatch(/name:\s*'db_row_count'[\s\S]*?'fail'/)
    expect(src).toContain('data corruption')
  })

  it('treats batch count delta as warning (not hard-fail)', () => {
    const src = readSource()
    expect(src).toMatch(/name:\s*'batch_count_delta'[\s\S]*?'warn'/)
  })

  it('logs structured validation summary', () => {
    const src = readSource()
    expect(src).toContain('Validation summary')
    expect(src).toContain("event: 'refresh.validation_complete'")
  })

  it('aborts activation on hard-fail and cleans up rows', () => {
    const src = readSource()
    expect(src).toContain('hasHardFail')
    expect(src).toContain('validation_hard_fail')
    // Should delete failed snapshot rows
    expect(src).toContain("eq('snapshot_id', snapshotId)")
  })

  // ── Safe GC with retention (P3) ───────────────────────────────────────

  it('has safe GC function with retention policy', () => {
    const src = readSource()
    expect(src).toContain('safeGarbageCollect')
    expect(src).toContain('GC_KEEP_SUPERSEDED')
  })

  it('keeps last superseded snapshot for rollback', () => {
    const src = readSource()
    // GC_KEEP_SUPERSEDED = 1 means keep 1 superseded for rollback
    expect(src).toContain('GC_KEEP_SUPERSEDED')
    expect(src).toMatch(/GC_KEEP_SUPERSEDED\s*=\s*1/)
  })

  it('logs GC metrics (snapshots, rows deleted, duration)', () => {
    const src = readSource()
    expect(src).toContain('snapshotsGCed')
    expect(src).toContain('rowsDeleted')
    expect(src).toContain('keptSuperseded')
    expect(src).toContain("event: 'refresh.gc_complete'")
  })

  // ── Observability (P5) ────────────────────────────────────────────────

  it('uses structured event names in logs', () => {
    const src = readSource()
    expect(src).toContain("event: 'refresh.lock_acquired'")
    expect(src).toContain("event: 'refresh.lock_denied'")
    expect(src).toContain("event: 'refresh.complete'")
    expect(src).toContain("event: 'refresh.exception'")
    expect(src).toContain("event: 'refresh.activated'")
  })

  it('exports getActiveSnapshotId for route handlers', () => {
    const src = readSource()
    expect(src).toContain('export { getActiveSnapshotId }')
  })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. ROUTE — sitemap-providers (hardened)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('anti-regression: sitemap-providers route (hardened)', () => {
  function readSource(): string {
    const fs = require('fs')
    const path = require('path')
    return fs.readFileSync(path.resolve(process.cwd(), 'src/app/api/sitemap-providers/route.ts'), 'utf-8')
  }

  it('imports from provider-url-resolver', () => {
    const src = readSource()
    expect(src).toContain("from '@/lib/seo/provider-url-resolver'")
    expect(src).toContain('resolveProviderUrl')
  })

  it('imports from sitemap-manifest', () => {
    const src = readSource()
    expect(src).toContain("from '@/lib/seo/sitemap-manifest'")
    expect(src).toContain('PROVIDER_BATCH_SIZE')
    expect(src).toContain('escapeXmlLoc')
  })

  it('has kill-switch via SITEMAP_PROVIDERS_FORCE_LEGACY env var', () => {
    const src = readSource()
    expect(src).toContain('SITEMAP_PROVIDERS_FORCE_LEGACY')
    expect(src).toContain('forceLegacy')
    expect(src).toContain('kill-switch')
  })

  it('reads active snapshot from sitemap_snapshots table', () => {
    const src = readSource()
    expect(src).toContain('sitemap_snapshots')
    expect(src).toContain("eq('status', 'active')")
    expect(src).toContain('activeSnapshotId')
  })

  it('orders active snapshot query by snapshot_id DESC (deterministic pick)', () => {
    const src = readSource()
    expect(src).toContain("order('snapshot_id', { ascending: false })")
  })

  it('queries provider_sitemap_urls with snapshot_id filter', () => {
    const src = readSource()
    expect(src).toContain("eq('snapshot_id', activeSnapshotId)")
    expect(src).toContain("eq('batch_id', batchIndex)")
  })

  it('has freshness check with configurable thresholds', () => {
    const src = readSource()
    expect(src).toContain('FRESHNESS_WARNING_MS')
    expect(src).toContain('FRESHNESS_CRITICAL_MS')
    expect(src).toContain('critically stale')
    expect(src).toContain('approaching staleness')
    // Configurable via env
    expect(src).toContain('SITEMAP_FRESHNESS_WARNING_HOURS')
    expect(src).toContain('SITEMAP_FRESHNESS_CRITICAL_HOURS')
  })

  it('logs specifically when no active snapshot found', () => {
    const src = readSource()
    expect(src).toContain('no active snapshot found')
    expect(src).toContain("event: 'sitemap.no_active_snapshot'")
  })

  it('has fast path with timing observability', () => {
    const src = readSource()
    expect(src).toContain('tDbMs')
    expect(src).toContain('tXmlMs')
    expect(src).toContain('durationMs')
    expect(src).toContain("path: 'fast'")
  })

  it('has legacy fallback', () => {
    const src = readSource()
    expect(src).toContain('legacy fallback')
    expect(src).toContain('LEGACY_PAGE_SIZE')
    expect(src).toContain("path: 'legacy'")
  })

  it('does NOT define its own specialty/city maps', () => {
    const src = readSource()
    expect(src).not.toMatch(/^\s*const specialtyToSlug/m)
    expect(src).not.toMatch(/^\s*const serviceMap/m)
    expect(src).not.toMatch(/^\s*const villeMap/m)
    expect(src).not.toMatch(/^\s*const inseeMap/m)
    expect(src).not.toMatch(/^\s*const arrondissementMap/m)
  })

  it('has error fallback with valid XML', () => {
    const src = readSource()
    expect(src).toContain('catch')
    expect(src).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    expect(src).toContain('s-maxage=60')
  })

  it('sets correct cache headers', () => {
    const src = readSource()
    expect(src).toMatch(/s-maxage=3600/)
    expect(src).toMatch(/stale-while-revalidate=86400/)
  })

  it('uses logger.child', () => {
    const src = readSource()
    expect(src).toContain('logger.child')
    expect(src).toContain("'sitemap-providers'")
  })

  it('logs snapshotId in fast path', () => {
    const src = readSource()
    expect(src).toContain('snapshotId: String(activeSnapshotId)')
  })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. ROUTE — sitemap-index snapshot-aware batch count
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('anti-regression: sitemap-index route (snapshot-aware)', () => {
  function readSource(): string {
    const fs = require('fs')
    const path = require('path')
    return fs.readFileSync(path.resolve(process.cwd(), 'src/app/api/sitemap-index/route.ts'), 'utf-8')
  }

  it('reads batch count from active snapshot metadata first', () => {
    const src = readSource()
    expect(src).toContain('sitemap_snapshots')
    expect(src).toContain("eq('status', 'active')")
    expect(src).toContain('batch_count')
  })

  it('has fallback to provider_sitemap_urls table lookup', () => {
    const src = readSource()
    expect(src).toContain('provider_sitemap_urls')
    expect(src).toContain('precomputed')
  })

  it('still falls back to provider count (legacy)', () => {
    const src = readSource()
    expect(src).toContain('providers-count')
    expect(src).toContain("count: 'exact'")
  })
})
