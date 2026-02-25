import { describe, it, expect } from 'vitest'
import {
  resolveProviderUrl,
  specialtyToSlug,
  PROVIDER_SELECT_COLUMNS,
} from '@/lib/seo/provider-url-resolver'
import type { ProviderRow } from '@/lib/seo/provider-url-resolver'
import { SITE_URL } from '@/lib/seo/config'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. RESOLVER — basic resolution
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('resolveProviderUrl', () => {
  const baseProvider: ProviderRow = {
    id: 'test-uuid-123',
    name: 'Dupont Plomberie',
    slug: 'dupont-plomberie-12345',
    stable_id: 'stable-123',
    specialty: 'plombier',
    address_city: 'Paris',
    updated_at: '2026-02-24T10:00:00Z',
  }

  it('resolves a standard provider correctly', () => {
    const result = resolveProviderUrl(baseProvider)
    expect(result).not.toBeNull()
    expect(result!.url).toBe(`${SITE_URL}/services/plombier/paris/dupont-plomberie-12345`)
    expect(result!.lastmod).toBe('2026-02-24')
    expect(result!.providerId).toBe('test-uuid-123')
  })

  it('uses stable_id when slug is null', () => {
    const p = { ...baseProvider, slug: null }
    const result = resolveProviderUrl(p)
    expect(result).not.toBeNull()
    expect(result!.url).toContain('stable-123')
  })

  it('uses id when both slug and stable_id are null', () => {
    const p = { ...baseProvider, slug: null, stable_id: null }
    const result = resolveProviderUrl(p)
    expect(result).not.toBeNull()
    expect(result!.url).toContain('test-uuid-123')
  })

  it('returns null when name is null', () => {
    expect(resolveProviderUrl({ ...baseProvider, name: null })).toBeNull()
  })

  it('returns null when specialty is null', () => {
    expect(resolveProviderUrl({ ...baseProvider, specialty: null })).toBeNull()
  })

  it('returns null when address_city is null', () => {
    expect(resolveProviderUrl({ ...baseProvider, address_city: null })).toBeNull()
  })

  it('returns null for unmapped specialty + city combo', () => {
    const p = { ...baseProvider, specialty: 'métier-inventé-xyz', address_city: 'ville-inventée-xyz' }
    // Even if specialty is unmapped, tradeContent keys are added to specialtyToSlug
    // But if truly unmapped, should return null
    const result = resolveProviderUrl(p)
    // City 'ville-inventée-xyz' won't be found in villeMap → null
    expect(result).toBeNull()
  })

  it('returns undefined lastmod when updated_at is null', () => {
    const p = { ...baseProvider, updated_at: null }
    const result = resolveProviderUrl(p)
    expect(result).not.toBeNull()
    expect(result!.lastmod).toBeUndefined()
  })

  it('handles INSEE code for address_city (arrondissement)', () => {
    const p = { ...baseProvider, address_city: '75101' }
    const result = resolveProviderUrl(p)
    expect(result).not.toBeNull()
    expect(result!.url).toContain('/paris/')
  })

  it('handles Marseille arrondissement codes', () => {
    const p = { ...baseProvider, address_city: '13201' }
    const result = resolveProviderUrl(p)
    expect(result).not.toBeNull()
    expect(result!.url).toContain('/marseille/')
  })

  it('handles Lyon arrondissement codes', () => {
    const p = { ...baseProvider, address_city: '69381' }
    const result = resolveProviderUrl(p)
    expect(result).not.toBeNull()
    expect(result!.url).toContain('/lyon/')
  })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. SPECIALTY MAPPING — coverage
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('specialtyToSlug mapping', () => {
  it('has at least 50 mappings', () => {
    expect(Object.keys(specialtyToSlug).length).toBeGreaterThanOrEqual(50)
  })

  it('all values are non-empty strings', () => {
    for (const [, value] of Object.entries(specialtyToSlug)) {
      expect(typeof value).toBe('string')
      expect(value.length).toBeGreaterThan(0)
    }
  })

  it('maps variant names to canonical slugs', () => {
    expect(specialtyToSlug['peintre']).toBe('peintre-en-batiment')
    expect(specialtyToSlug['finition']).toBe('peintre-en-batiment')
    expect(specialtyToSlug['pac']).toBe('pompe-a-chaleur')
    expect(specialtyToSlug['ite']).toBe('isolation-thermique')
    expect(specialtyToSlug['piscine']).toBe('pisciniste')
  })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. SELECT COLUMNS — prevent accidental changes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('PROVIDER_SELECT_COLUMNS', () => {
  it('contains all required columns', () => {
    const cols = PROVIDER_SELECT_COLUMNS.split(',').map(c => c.trim())
    expect(cols).toContain('id')
    expect(cols).toContain('name')
    expect(cols).toContain('slug')
    expect(cols).toContain('stable_id')
    expect(cols).toContain('specialty')
    expect(cols).toContain('address_city')
    expect(cols).toContain('updated_at')
  })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. ANTI-REGRESSION — module structure
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('anti-regression: provider-url-resolver module', () => {
  function readSource(relativePath: string): string {
    const fs = require('fs')
    const path = require('path')
    return fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf-8')
  }

  it('sitemap-providers route imports resolveProviderUrl from provider-url-resolver', () => {
    const src = readSource('src/app/api/sitemap-providers/route.ts')
    expect(src).toContain("from '@/lib/seo/provider-url-resolver'")
    expect(src).toContain('resolveProviderUrl')
  })

  it('sitemap-providers route still imports from manifest', () => {
    const src = readSource('src/app/api/sitemap-providers/route.ts')
    expect(src).toContain("from '@/lib/seo/sitemap-manifest'")
    expect(src).toContain('PROVIDER_BATCH_SIZE')
    expect(src).toContain('escapeXmlLoc')
  })

  it('sitemap-providers route has fast path using provider_sitemap_urls', () => {
    const src = readSource('src/app/api/sitemap-providers/route.ts')
    expect(src).toContain('provider_sitemap_urls')
    expect(src).toContain('fast path')
  })

  it('sitemap-providers route has legacy fallback', () => {
    const src = readSource('src/app/api/sitemap-providers/route.ts')
    expect(src).toContain('legacy fallback')
    expect(src).toContain('LEGACY_PAGE_SIZE')
  })

  it('sitemap-providers route does NOT define its own specialty/city maps', () => {
    const src = readSource('src/app/api/sitemap-providers/route.ts')
    expect(src).not.toMatch(/^\s*const specialtyToSlug/m)
    expect(src).not.toMatch(/^\s*const serviceMap/m)
    expect(src).not.toMatch(/^\s*const villeMap/m)
    expect(src).not.toMatch(/^\s*const inseeMap/m)
    expect(src).not.toMatch(/^\s*const arrondissementMap/m)
  })

  it('sitemap-providers route still has error fallback with valid XML', () => {
    const src = readSource('src/app/api/sitemap-providers/route.ts')
    expect(src).toContain('catch')
    expect(src).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    expect(src).toContain('s-maxage=60')
  })

  it('sitemap-providers route sets correct cache headers', () => {
    const src = readSource('src/app/api/sitemap-providers/route.ts')
    expect(src).toMatch(/s-maxage=3600/)
    expect(src).toMatch(/stale-while-revalidate=86400/)
  })

  it('sitemap-providers route uses logger.child', () => {
    const src = readSource('src/app/api/sitemap-providers/route.ts')
    expect(src).toContain("logger.child")
    expect(src).toContain("'sitemap-providers'")
  })

  it('sitemap-providers route logs tDbMs for fast path observability', () => {
    const src = readSource('src/app/api/sitemap-providers/route.ts')
    expect(src).toContain('tDbMs')
    expect(src).toContain('tXmlMs')
  })

  it('sitemap-index route has precomputed table lookup for batch count', () => {
    const src = readSource('src/app/api/sitemap-index/route.ts')
    expect(src).toContain('provider_sitemap_urls')
    expect(src).toContain('precomputed')
  })

  it('sitemap-index route still falls back to provider count', () => {
    const src = readSource('src/app/api/sitemap-index/route.ts')
    expect(src).toContain('providers-count')
    expect(src).toContain("count: 'exact'")
  })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. REFRESH SCRIPT — module structure
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('anti-regression: refresh-provider-sitemaps module', () => {
  function readSource(relativePath: string): string {
    const fs = require('fs')
    const path = require('path')
    return fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf-8')
  }

  it('imports PROVIDER_BATCH_SIZE from manifest', () => {
    const src = readSource('src/lib/seo/refresh-provider-sitemaps.ts')
    expect(src).toContain("from '@/lib/seo/sitemap-manifest'")
    expect(src).toContain('PROVIDER_BATCH_SIZE')
  })

  it('imports resolveProviderUrl from provider-url-resolver', () => {
    const src = readSource('src/lib/seo/refresh-provider-sitemaps.ts')
    expect(src).toContain("from '@/lib/seo/provider-url-resolver'")
    expect(src).toContain('resolveProviderUrl')
  })

  it('does NOT define its own PROVIDER_BATCH_SIZE', () => {
    const src = readSource('src/lib/seo/refresh-provider-sitemaps.ts')
    expect(src).not.toMatch(/^\s*(const|let|var)\s+PROVIDER_BATCH_SIZE\b/m)
  })

  it('uses keyset pagination (ORDER BY id) not OFFSET', () => {
    const src = readSource('src/lib/seo/refresh-provider-sitemaps.ts')
    expect(src).toContain("order('id'")
    expect(src).toContain("gt('id'")
    expect(src).not.toContain('.range(')
  })

  it('has 50k guardrail check', () => {
    const src = readSource('src/lib/seo/refresh-provider-sitemaps.ts')
    expect(src).toContain('50_000')
    expect(src).toContain('Batch exceeds 50k URLs')
  })

  it('skips table update when no URLs resolved (safety net)', () => {
    const src = readSource('src/lib/seo/refresh-provider-sitemaps.ts')
    expect(src).toContain('No URLs resolved')
    expect(src).toContain('table not modified')
  })

  it('exports RefreshResult type', () => {
    const src = readSource('src/lib/seo/refresh-provider-sitemaps.ts')
    expect(src).toContain('export type RefreshResult')
  })
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. MIGRATION — SQL structure
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('migration: provider_sitemap_urls table', () => {
  function readMigration(): string {
    const fs = require('fs')
    const path = require('path')
    return fs.readFileSync(path.resolve(process.cwd(), 'supabase/migrations/345_provider_sitemap_urls.sql'), 'utf-8')
  }

  it('creates provider_sitemap_urls table', () => {
    const sql = readMigration()
    expect(sql).toContain('CREATE TABLE')
    expect(sql).toContain('provider_sitemap_urls')
  })

  it('has batch_id column with non-negative constraint', () => {
    const sql = readMigration()
    expect(sql).toContain('batch_id')
    expect(sql).toContain('INTEGER')
    expect(sql).toContain('chk_psm_batch_id_non_negative')
  })

  it('has url column with not-empty constraint', () => {
    const sql = readMigration()
    expect(sql).toContain('chk_psm_url_not_empty')
  })

  it('has provider_id column', () => {
    const sql = readMigration()
    expect(sql).toContain('provider_id')
    expect(sql).toContain('UUID')
  })

  it('creates index on batch_id', () => {
    const sql = readMigration()
    expect(sql).toContain('idx_psm_batch')
    expect(sql).toContain('(batch_id)')
  })

  it('creates unique index on provider_id', () => {
    const sql = readMigration()
    expect(sql).toContain('UNIQUE INDEX')
    expect(sql).toContain('idx_psm_provider_unique')
    expect(sql).toContain('(provider_id)')
  })

  it('enables RLS with no policies (service_role only)', () => {
    const sql = readMigration()
    expect(sql).toContain('ENABLE ROW LEVEL SECURITY')
    expect(sql).not.toMatch(/CREATE POLICY/)
  })
})
