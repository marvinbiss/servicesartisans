import { describe, it, expect } from 'vitest'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. MIGRATION — sitemap_snapshots SQL structure
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('migration: sitemap_snapshots table', () => {
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
// 2. REFRESH SCRIPT — atomic snapshot lifecycle
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('anti-regression: refresh-provider-sitemaps module (v2 atomic)', () => {
  function readSource(): string {
    const fs = require('fs')
    const path = require('path')
    return fs.readFileSync(path.resolve(process.cwd(), 'src/lib/seo/refresh-provider-sitemaps.ts'), 'utf-8')
  }

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

  it('uses keyset pagination (ORDER BY id) not OFFSET', () => {
    const src = readSource()
    expect(src).toContain("order('id'")
    expect(src).toContain("gt('id'")
    expect(src).not.toContain('.range(')
  })

  it('has 50k guardrail check', () => {
    const src = readSource()
    expect(src).toContain('50_000')
    expect(src).toContain('50k')
  })

  it('exports RefreshResult type with snapshotId', () => {
    const src = readSource()
    expect(src).toContain('export type RefreshResult')
    expect(src).toContain('snapshotId')
  })

  // ── Atomic snapshot lifecycle checks ─────────────────────────────────

  it('has concurrency lock — checks for building snapshots before starting', () => {
    const src = readSource()
    expect(src).toContain("eq('status', 'building')")
    expect(src).toContain('Concurrent refresh blocked')
  })

  it('allocates new snapshot_id', () => {
    const src = readSource()
    expect(src).toContain('allocateSnapshotId')
    expect(src).toContain('snapshot_id')
  })

  it('creates snapshot record with building status', () => {
    const src = readSource()
    expect(src).toContain("status: 'building'")
    expect(src).toContain("'sitemap_snapshots'")
  })

  it('transitions through validating state', () => {
    const src = readSource()
    expect(src).toContain("status: 'validating'")
  })

  it('activates new snapshot (atomic pointer flip)', () => {
    const src = readSource()
    expect(src).toContain("status: 'active'")
    expect(src).toContain('activated_at')
    expect(src).toContain('Activating snapshot')
  })

  it('supersedes old active snapshot', () => {
    const src = readSource()
    expect(src).toContain("status: 'superseded'")
    expect(src).toContain('superseded_at')
  })

  it('garbage collects old snapshot rows', () => {
    const src = readSource()
    expect(src).toContain('Garbage collecting old snapshot rows')
    expect(src).toContain("status: 'garbage_collected'")
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

  // ── Post-refresh validation ──────────────────────────────────────────

  it('validates insert ratio (>= 90%)', () => {
    const src = readSource()
    expect(src).toContain('insertRatio')
    expect(src).toContain('Insert ratio')
  })

  it('validates resolved ratio', () => {
    const src = readSource()
    expect(src).toContain('MIN_RESOLVED_RATIO')
    expect(src).toContain('Resolved ratio')
  })

  it('validates batch count delta vs current active', () => {
    const src = readSource()
    expect(src).toContain('MAX_BATCH_DELTA_RATIO')
    expect(src).toContain('Batch count delta')
  })

  it('verifies DB row count matches expected', () => {
    const src = readSource()
    expect(src).toContain("count: 'exact'")
    expect(src).toContain('DB row count')
  })

  it('stores validation errors in snapshot metadata', () => {
    const src = readSource()
    expect(src).toContain('validation_errors')
    expect(src).toContain('validationErrors')
  })

  it('cleans up failed snapshot rows', () => {
    const src = readSource()
    // When validation fails hard, should delete the new snapshot's rows
    expect(src).toContain("eq('snapshot_id', snapshotId)")
  })

  it('skips table update when no URLs resolved (safety net)', () => {
    const src = readSource()
    expect(src).toContain('No URLs resolved')
    expect(src).toContain('table not modified')
  })

  it('exports getActiveSnapshotId for route handlers', () => {
    const src = readSource()
    expect(src).toContain('export { getActiveSnapshotId }')
  })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. ROUTE — sitemap-providers snapshot-aware fast path
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('anti-regression: sitemap-providers route (v2 snapshot-aware)', () => {
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

  it('queries provider_sitemap_urls with snapshot_id filter', () => {
    const src = readSource()
    expect(src).toContain("eq('snapshot_id', activeSnapshotId)")
    expect(src).toContain("eq('batch_id', batchIndex)")
  })

  it('has freshness check with warning and critical thresholds', () => {
    const src = readSource()
    expect(src).toContain('FRESHNESS_WARNING_MS')
    expect(src).toContain('FRESHNESS_CRITICAL_MS')
    expect(src).toContain('critically stale')
    expect(src).toContain('approaching staleness')
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

describe('anti-regression: sitemap-index route (v2 snapshot-aware)', () => {
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
