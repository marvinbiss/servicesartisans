import { describe, it, expect } from 'vitest'
import {
  API_CATALOG,
  CATEGORY_ORDER,
  groupByCategory,
  type ApiCategory,
  type ApiEntry,
} from '@/app/(public)/developpeurs/api-catalog/_catalog'

describe('API_CATALOG data integrity', () => {
  it('contains at least 20 entries', () => {
    expect(API_CATALOG.length).toBeGreaterThanOrEqual(20)
  })

  it('exposes unique ids across all entries', () => {
    const ids = API_CATALOG.map((entry) => entry.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every entry has id, title, description, path and status', () => {
    for (const entry of API_CATALOG) {
      expect(entry.id).toBeTypeOf('string')
      expect(entry.id.length).toBeGreaterThan(0)
      expect(entry.title.length).toBeGreaterThan(0)
      expect(entry.description.length).toBeGreaterThan(0)
      expect(entry.path.length).toBeGreaterThan(0)
      expect(['stable', 'beta', 'experimental']).toContain(entry.status)
    }
  })

  it('every status uses the allowed enum values only', () => {
    const allowed: ReadonlyArray<ApiEntry['status']> = ['stable', 'beta', 'experimental']
    for (const entry of API_CATALOG) {
      expect(allowed).toContain(entry.status)
    }
  })

  it('npm: paths carry empty methods (SDK + CLI off-platform)', () => {
    const npmEntries = API_CATALOG.filter((entry) => entry.path.startsWith('npm:'))
    expect(npmEntries.length).toBeGreaterThan(0)
    for (const entry of npmEntries) {
      expect(entry.methods.length).toBe(0)
    }
  })

  it('every API path starts with /api/, /embed/ or npm:', () => {
    for (const entry of API_CATALOG) {
      expect(entry.path).toMatch(/^(\/api\/|\/embed\/|npm:)/)
    }
  })

  it('every category in CATEGORY_ORDER appears at least once in the catalog', () => {
    const used: Set<ApiCategory> = new Set(API_CATALOG.map((entry) => entry.category))
    for (const category of CATEGORY_ORDER) {
      expect(used.has(category)).toBe(true)
    }
  })

  it('every entry category is part of CATEGORY_ORDER (no orphan category)', () => {
    const declared: Set<ApiCategory> = new Set(CATEGORY_ORDER)
    for (const entry of API_CATALOG) {
      expect(declared.has(entry.category)).toBe(true)
    }
  })
})

describe('groupByCategory', () => {
  it('returns a Map keyed by category with non-empty entry lists', () => {
    const grouped = groupByCategory()
    expect(grouped).toBeInstanceOf(Map)
    for (const category of CATEGORY_ORDER) {
      const entries = grouped.get(category)
      expect(entries).toBeDefined()
      expect((entries ?? []).length).toBeGreaterThan(0)
    }
  })

  it('preserves the total entry count across all groups', () => {
    const grouped = groupByCategory()
    let total = 0
    grouped.forEach((entries) => {
      total += entries.length
    })
    expect(total).toBe(API_CATALOG.length)
  })
})
