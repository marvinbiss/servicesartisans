/**
 * Tests `bundle-budget` — Bouclier 4 du plan ULTRA DOMINATION SEO v2.
 * Pure logic — pas d'I/O fichier (le wrapper CLI lit .next/).
 */
import { describe, it, expect } from 'vitest'
import {
  checkBundleBudgets,
  computeFirstLoadBytes,
  formatBytes,
  matchesIgnorePattern,
  resolveRouteBudget,
  topChunks,
  type BundleBudgets,
  type BundleManifest,
} from '@/lib/seo/bundle-budget'

const sampleManifest: BundleManifest = {
  pages: {
    '/': ['static/chunks/page-index.js', 'static/chunks/shared-1.js'],
    '/services/[s]/[v]': ['static/chunks/page-services.js', 'static/chunks/shared-1.js'],
    '/_error': ['static/chunks/page-error.js'],
  },
  rootMainFiles: [
    'static/chunks/webpack.js',
    'static/chunks/main-app.js',
    'static/chunks/shared-1.js', // doit être dédupliqué
  ],
}

const sampleSizes: Record<string, number> = {
  'static/chunks/page-index.js': 50_000,
  'static/chunks/page-services.js': 80_000,
  'static/chunks/page-error.js': 5_000,
  'static/chunks/shared-1.js': 30_000,
  'static/chunks/webpack.js': 5_000,
  'static/chunks/main-app.js': 100_000,
  'static/chunks/big-vendor.js': 500_000,
}

describe('computeFirstLoadBytes — déduplication chunks partagés', () => {
  it('sums page + root chunks without double-counting shared', () => {
    // page-index (50K) + webpack (5K) + main-app (100K) + shared-1 (30K) = 185K
    expect(computeFirstLoadBytes(sampleManifest, sampleSizes, '/')).toBe(185_000)
  })

  it('returns 0 for unknown route (no chunks listed)', () => {
    expect(computeFirstLoadBytes(sampleManifest, sampleSizes, '/inconnu')).toBe(
      // toujours rootMainFiles présents : webpack + main-app + shared-1 = 135K
      135_000
    )
  })

  it('handles missing file size as 0 (unknown chunk)', () => {
    const partial = { ...sampleSizes }
    delete partial['static/chunks/main-app.js']
    expect(computeFirstLoadBytes(sampleManifest, partial, '/')).toBe(85_000)
  })

  it('handles empty rootMainFiles', () => {
    const m: BundleManifest = { pages: { '/foo': ['static/chunks/page-index.js'] } }
    expect(computeFirstLoadBytes(m, sampleSizes, '/foo')).toBe(50_000)
  })
})

describe('resolveRouteBudget — overrides', () => {
  it('falls back to global budget when no override', () => {
    const budgets: BundleBudgets = {
      firstLoadJSGlobal: 200_000,
      chunkBudget: 600_000,
    }
    expect(resolveRouteBudget('/', budgets)).toBe(200_000)
  })

  it('uses override when present', () => {
    const budgets: BundleBudgets = {
      firstLoadJSGlobal: 200_000,
      chunkBudget: 600_000,
      routeOverrides: { '/services/[s]/[v]': 220_000 },
    }
    expect(resolveRouteBudget('/services/[s]/[v]', budgets)).toBe(220_000)
    expect(resolveRouteBudget('/', budgets)).toBe(200_000)
  })
})

describe('topChunks — tri décroissant', () => {
  it('returns top N JS chunks by size desc', () => {
    const top = topChunks(sampleSizes, 3)
    expect(top).toHaveLength(3)
    expect(top[0].chunk).toBe('static/chunks/big-vendor.js')
    expect(top[0].bytes).toBe(500_000)
    expect(top[1].bytes).toBeGreaterThanOrEqual(top[2].bytes)
  })

  it('filters out non-.js entries', () => {
    const sizes = { ...sampleSizes, 'static/css/app.css': 9_999_999 }
    const top = topChunks(sizes, 5)
    expect(top.every((c) => c.chunk.endsWith('.js'))).toBe(true)
  })

  it('returns all chunks when limit exceeds count (no crash)', () => {
    const top = topChunks(sampleSizes, 100)
    expect(top.length).toBe(7)
  })

  it('returns empty array on empty fileSizes', () => {
    expect(topChunks({}, 10)).toEqual([])
  })
})

describe('checkBundleBudgets — audit complet', () => {
  it('reports zero violations when within budgets', () => {
    const budgets: BundleBudgets = {
      firstLoadJSGlobal: 300_000,
      chunkBudget: 600_000,
    }
    const r = checkBundleBudgets(sampleManifest, sampleSizes, budgets)
    expect(r.violations).toEqual([])
    expect(r.routes.length).toBeGreaterThan(0)
  })

  it('flags route violation when first-load exceeds budget', () => {
    const budgets: BundleBudgets = {
      firstLoadJSGlobal: 100_000,
      chunkBudget: 600_000,
    }
    const r = checkBundleBudgets(sampleManifest, sampleSizes, budgets)
    const routeViolations = r.violations.filter((v) => v.kind === 'route')
    expect(routeViolations.length).toBeGreaterThan(0)
    const services = routeViolations.find(
      (v) => v.kind === 'route' && v.route === '/services/[s]/[v]'
    )
    expect(services).toBeDefined()
    expect(services?.actual).toBe(215_000) // 80 + 30 + 5 + 100 = 215
    expect(services?.delta).toBe(115_000)
  })

  it('flags chunk violation when single chunk exceeds chunkBudget', () => {
    const budgets: BundleBudgets = {
      firstLoadJSGlobal: 1_000_000,
      chunkBudget: 200_000,
    }
    const r = checkBundleBudgets(sampleManifest, sampleSizes, budgets)
    const chunkViolations = r.violations.filter((v) => v.kind === 'chunk')
    expect(chunkViolations.length).toBeGreaterThan(0)
    expect(chunkViolations[0]).toMatchObject({
      kind: 'chunk',
      chunk: 'static/chunks/big-vendor.js',
      actual: 500_000,
      budget: 200_000,
      delta: 300_000,
    })
  })

  it('respects ignoreRoutes (e.g. /_error)', () => {
    const budgets: BundleBudgets = {
      firstLoadJSGlobal: 100_000,
      chunkBudget: 600_000,
      ignoreRoutes: ['/_error'],
    }
    const r = checkBundleBudgets(sampleManifest, sampleSizes, budgets)
    const errorRoute = r.routes.find((rt) => rt.route === '/_error')
    expect(errorRoute).toBeUndefined()
  })

  it('uses route override when present (no false positive)', () => {
    const budgets: BundleBudgets = {
      firstLoadJSGlobal: 100_000,
      chunkBudget: 600_000,
      routeOverrides: { '/services/[s]/[v]': 250_000 },
    }
    const r = checkBundleBudgets(sampleManifest, sampleSizes, budgets)
    const services = r.routes.find((rt) => rt.route === '/services/[s]/[v]')
    expect(services?.budget).toBe(250_000)
    const routeViolations = r.violations.filter(
      (v) => v.kind === 'route' && v.route === '/services/[s]/[v]'
    )
    expect(routeViolations).toEqual([])
  })

  it('handles empty pages manifest (only chunk violations possible)', () => {
    const empty: BundleManifest = { pages: {}, rootMainFiles: [] }
    const budgets: BundleBudgets = {
      firstLoadJSGlobal: 200_000,
      chunkBudget: 100_000,
    }
    const r = checkBundleBudgets(empty, sampleSizes, budgets)
    expect(r.routes).toEqual([])
    expect(r.violations.every((v) => v.kind === 'chunk')).toBe(true)
  })

  it('handles empty fileSizes (no build artifacts) with no false positives', () => {
    const budgets: BundleBudgets = {
      firstLoadJSGlobal: 1,
      chunkBudget: 1,
    }
    const r = checkBundleBudgets(sampleManifest, {}, budgets)
    expect(r.violations.filter((v) => v.kind === 'route')).toEqual([])
    expect(r.largestChunks).toEqual([])
  })

  it('routes report sorted desc by firstLoadBytes', () => {
    const budgets: BundleBudgets = {
      firstLoadJSGlobal: 1_000_000,
      chunkBudget: 1_000_000,
    }
    const r = checkBundleBudgets(sampleManifest, sampleSizes, budgets)
    for (let i = 1; i < r.routes.length; i++) {
      expect(r.routes[i - 1].firstLoadBytes).toBeGreaterThanOrEqual(r.routes[i].firstLoadBytes)
    }
  })
})

describe('matchesIgnorePattern — exact + prefix glob', () => {
  it('exact match by default', () => {
    expect(matchesIgnorePattern('/_error', '/_error')).toBe(true)
    expect(matchesIgnorePattern('/_error/foo', '/_error')).toBe(false)
  })

  it('prefix match with trailing *', () => {
    expect(matchesIgnorePattern('/admin/users/page', '/admin/*')).toBe(true)
    expect(matchesIgnorePattern('/admin', '/admin/*')).toBe(false)
    expect(matchesIgnorePattern('/public/admin', '/admin/*')).toBe(false)
  })

  it('handles parentheses in route groups', () => {
    expect(matchesIgnorePattern('/(private)/espace-artisan/page', '/(private)/*')).toBe(true)
  })
})

describe('checkBundleBudgets — ignore globs', () => {
  it('respects prefix glob in ignoreRoutes', () => {
    const manifest: BundleManifest = {
      pages: {
        '/admin/foo/page': ['static/chunks/page-services.js'],
        '/(public)/services/[s]/[v]/page': ['static/chunks/page-services.js'],
      },
      rootMainFiles: ['static/chunks/main-app.js'],
    }
    const budgets: BundleBudgets = {
      firstLoadJSGlobal: 50_000,
      chunkBudget: 1_000_000,
      ignoreRoutes: ['/admin/*'],
    }
    const r = checkBundleBudgets(manifest, sampleSizes, budgets)
    expect(r.routes.find((rt) => rt.route.startsWith('/admin'))).toBeUndefined()
    expect(r.routes.find((rt) => rt.route === '/(public)/services/[s]/[v]/page')).toBeDefined()
  })
})

describe('formatBytes — display', () => {
  it('formats bytes', () => {
    expect(formatBytes(512)).toBe('512B')
  })
  it('formats KB with one decimal', () => {
    expect(formatBytes(1500)).toBe('1.5KB')
    expect(formatBytes(150_000)).toBe('146.5KB')
  })
  it('formats MB with two decimals', () => {
    expect(formatBytes(2 * 1024 * 1024)).toBe('2.00MB')
  })
})
