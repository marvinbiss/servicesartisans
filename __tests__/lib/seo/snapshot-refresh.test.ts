import { describe, it, expect } from 'vitest'

const MIGRATION_PATH = 'supabase/migrations/345_provider_sitemap_system.sql'

function readMigration(): string {
  const fs = require('fs')
  const path = require('path')
  return fs.readFileSync(path.resolve(process.cwd(), MIGRATION_PATH), 'utf-8')
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. MIGRATION 345 — complete sitemap infrastructure
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('migration 345: sitemap_snapshots table', () => {
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

  it('seeds initial active snapshot', () => {
    const sql = readMigration()
    expect(sql).toContain('INSERT INTO sitemap_snapshots')
    expect(sql).toContain("'active'")
    expect(sql).toContain('ON CONFLICT')
    expect(sql).toContain('DO NOTHING')
  })
})

describe('migration 345: provider_sitemap_urls table', () => {
  it('creates provider_sitemap_urls table with snapshot_id column', () => {
    const sql = readMigration()
    expect(sql).toContain('CREATE TABLE')
    expect(sql).toContain('provider_sitemap_urls')
    // snapshot_id should be part of CREATE TABLE, not ALTER TABLE ADD COLUMN
    expect(sql).not.toContain('ADD COLUMN')
  })

  it('snapshot_id has NO DEFAULT (prevents silent misassignment)', () => {
    const sql = readMigration()
    // The column definition should have NOT NULL but no DEFAULT
    // Extract the provider_sitemap_urls CREATE TABLE block
    const tableStart = sql.indexOf('CREATE TABLE IF NOT EXISTS provider_sitemap_urls')
    const tableEnd = sql.indexOf(');', tableStart)
    const tableBlock = sql.substring(tableStart, tableEnd)
    expect(tableBlock).toContain('snapshot_id')
    expect(tableBlock).toContain('NOT NULL')
    // Should NOT have DEFAULT in the snapshot_id line
    expect(tableBlock).not.toMatch(/snapshot_id\s+INTEGER\s+NOT NULL\s+DEFAULT/)
  })

  it('has composite (snapshot_id, batch_id) index', () => {
    const sql = readMigration()
    expect(sql).toContain('idx_psm_snapshot_batch')
    expect(sql).toContain('(snapshot_id, batch_id)')
  })

  it('has NO old UNIQUE(provider_id) index', () => {
    const sql = readMigration()
    // Should NOT have the old broken index
    expect(sql).not.toContain('idx_psm_provider_unique')
  })

  it('has UNIQUE(snapshot_id, provider_id) index', () => {
    const sql = readMigration()
    expect(sql).toContain('idx_psm_provider_per_snapshot')
    expect(sql).toContain('(snapshot_id, provider_id)')
    expect(sql).toContain('UNIQUE')
  })

  it('enables RLS (service_role only)', () => {
    const sql = readMigration()
    // Should have RLS for both tables
    const rlsMatches = sql.match(/ENABLE ROW LEVEL SECURITY/g)
    expect(rlsMatches).not.toBeNull()
    expect(rlsMatches!.length).toBeGreaterThanOrEqual(2)
  })
})

describe('migration 345: DB-level invariants', () => {
  it('creates unique partial index for at-most-1 building snapshot (concurrency lock)', () => {
    const sql = readMigration()
    expect(sql).toContain('idx_snapshots_one_building')
    expect(sql).toContain("WHERE status = 'building'")
    expect(sql).toContain('UNIQUE')
  })

  it('creates unique partial index for at-most-1 active snapshot', () => {
    const sql = readMigration()
    expect(sql).toContain('idx_snapshots_one_active')
    expect(sql).toContain("WHERE status = 'active'")
    expect(sql).toContain('UNIQUE')
  })

  it('creates activate_sitemap_snapshot RPC function', () => {
    const sql = readMigration()
    expect(sql).toContain('CREATE OR REPLACE FUNCTION activate_sitemap_snapshot')
    expect(sql).toContain('p_new_snapshot_id INTEGER')
    expect(sql).toContain('RETURNS BOOLEAN')
    expect(sql).toContain('plpgsql')
  })

  it('RPC function supersedes old active before activating new', () => {
    const sql = readMigration()
    const supersedeIdx = sql.indexOf("SET status = 'superseded'")
    const activateIdx = sql.indexOf("SET status = 'active'", supersedeIdx + 1)
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

  it('legacy fallback uses same ordering as refresh script (ORDER BY id ASC)', () => {
    const fs = require('fs')
    const path = require('path')
    const routeSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/app/api/sitemap-providers/route.ts'), 'utf-8')
    expect(routeSrc).toContain("order('id', { ascending: true })")
    expect(routeSrc).not.toContain("order('updated_at'")
  })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1b. MIGRATION 346 — sequence-backed ID + force-activate RPC
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('migration 346: snapshot_identity', () => {
  function readMigration346(): string {
    const fs = require('fs')
    const path = require('path')
    return fs.readFileSync(path.resolve(process.cwd(), 'supabase/migrations/346_snapshot_identity.sql'), 'utf-8')
  }

  it('creates a sequence for snapshot_id (eliminates TOCTOU)', () => {
    const sql = readMigration346()
    expect(sql).toContain('CREATE SEQUENCE')
    expect(sql).toContain('sitemap_snapshots_snapshot_id_seq')
    expect(sql).toContain('nextval')
  })

  it('creates allocate_snapshot_id RPC (INSERT RETURNING)', () => {
    const sql = readMigration346()
    expect(sql).toContain('CREATE OR REPLACE FUNCTION allocate_snapshot_id()')
    expect(sql).toContain('RETURNS INTEGER')
    expect(sql).toContain('RETURNING snapshot_id INTO new_id')
    expect(sql).toContain("INSERT INTO sitemap_snapshots")
    expect(sql).toContain("'building'")
  })

  it('allocate_snapshot_id uses SECURITY DEFINER', () => {
    const sql = readMigration346()
    // Find the allocate function block
    const funcStart = sql.indexOf('CREATE OR REPLACE FUNCTION allocate_snapshot_id()')
    const funcEnd = sql.indexOf('$$;', funcStart)
    const funcBlock = sql.substring(funcStart, funcEnd)
    expect(funcBlock).toContain('SECURITY DEFINER')
  })

  it('creates force_activate_sitemap_snapshot RPC', () => {
    const sql = readMigration346()
    expect(sql).toContain('CREATE OR REPLACE FUNCTION force_activate_sitemap_snapshot')
    expect(sql).toContain('p_snapshot_id INTEGER')
    expect(sql).toContain('p_reason TEXT')
    expect(sql).toContain('RETURNS BOOLEAN')
  })

  it('force_activate validates reason is provided', () => {
    const sql = readMigration346()
    expect(sql).toContain('reason is required for audit trail')
    expect(sql).toContain('RAISE EXCEPTION')
  })

  it('force_activate checks snapshot existence', () => {
    const sql = readMigration346()
    expect(sql).toContain('does not exist')
  })

  it('force_activate is idempotent (no-op if already active)', () => {
    const sql = readMigration346()
    expect(sql).toContain("IF v_status = 'active' THEN")
    expect(sql).toContain('RETURN TRUE')
  })

  it('force_activate only allows from safe source states', () => {
    const sql = readMigration346()
    expect(sql).toContain("'superseded'")
    expect(sql).toContain("'failed'")
    expect(sql).toContain("'validating'")
    expect(sql).toContain('only superseded, failed, or validating allowed')
  })

  it('force_activate records reason in error_message (audit trail)', () => {
    const sql = readMigration346()
    expect(sql).toContain("'force-activate: '")
    expect(sql).toContain('error_message')
  })

  it('force_activate performs atomic supersede + activate', () => {
    const sql = readMigration346()
    // Within the function body, supersede comes before activate
    const funcStart = sql.indexOf('force_activate_sitemap_snapshot')
    const supersedeIdx = sql.indexOf("SET status = 'superseded'", funcStart)
    const activateIdx = sql.indexOf("SET status = 'active'", supersedeIdx + 1)
    expect(supersedeIdx).toBeGreaterThan(-1)
    expect(activateIdx).toBeGreaterThan(-1)
    expect(supersedeIdx).toBeLessThan(activateIdx)
  })

  it('force_activate uses SECURITY DEFINER', () => {
    const sql = readMigration346()
    // The force_activate function declaration must include SECURITY DEFINER
    // Find the CREATE FUNCTION line and check the signature block up to AS $$
    const funcStart = sql.indexOf('CREATE OR REPLACE FUNCTION force_activate_sitemap_snapshot')
    expect(funcStart).toBeGreaterThan(-1)
    const asIdx = sql.indexOf('AS $$', funcStart)
    const funcSignature = sql.substring(funcStart, asIdx)
    expect(funcSignature).toContain('SECURITY DEFINER')
  })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. REFRESH SCRIPT — atomic snapshot lifecycle (hardened)
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
    const insertIdx = src.indexOf("status: 'building'")
    expect(insertIdx).toBeGreaterThan(-1)
    expect(src).not.toContain('Another refresh is already in progress')
  })

  // ── Atomic pointer flip (P1 — invariant) ──────────────────────────────

  it('uses RPC function for atomic pointer flip', () => {
    const src = readSource()
    expect(src).toContain("rpc('activate_sitemap_snapshot'")
    expect(src).toContain('p_new_snapshot_id')
  })

  it('has NO non-atomic fallback for pointer flip (hard-fail only)', () => {
    const src = readSource()
    // The old fallback pattern was: if rpcError, do 2 UPDATEs separately
    // This is GONE — RPC failure = hard fail, period.
    expect(src).not.toContain('rpc_fallback')
    expect(src).toContain('activation_rpc_failed')
    // The word 'Atomic activation failed' should appear
    expect(src).toContain('Atomic activation failed')
  })

  it('allocates snapshot ID via RPC (sequence-backed, no TOCTOU)', () => {
    const src = readSource()
    expect(src).toContain("rpc('allocate_snapshot_id')")
    expect(src).toContain('snapshot_allocated_rpc')
    // Should NOT have the old max()+1 pattern
    expect(src).not.toMatch(/\.select\('snapshot_id'\)[\s\S]*?data\[0\]\.snapshot_id\s*\+\s*1/)
  })

  it('uses ConcurrencyLockError for structured lock detection', () => {
    const src = readSource()
    expect(src).toContain('ConcurrencyLockError')
    expect(src).toContain('instanceof ConcurrencyLockError')
  })

  it('exports forceActivateSnapshot for ops recovery', () => {
    const src = readSource()
    expect(src).toContain('export async function forceActivateSnapshot')
    expect(src).toContain("rpc('force_activate_sitemap_snapshot'")
    expect(src).toContain('p_snapshot_id')
    expect(src).toContain('p_reason')
  })

  it('forceActivateSnapshot requires reason (audit trail)', () => {
    const src = readSource()
    expect(src).toContain('Reason is required for force-activate')
  })

  it('forceActivateSnapshot logs structured events', () => {
    const src = readSource()
    expect(src).toContain("event: 'refresh.force_activate_start'")
    expect(src).toContain("event: 'refresh.force_activate_success'")
    expect(src).toContain("event: 'refresh.force_activate_failed'")
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
// 3. ROUTE — sitemap-providers (hardened)
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
// 4. ROUTE — sitemap-index snapshot-aware batch count
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
