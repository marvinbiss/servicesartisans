import { describe, expect, it } from 'vitest'
import {
  ALL_SEEDS,
  CLUSTER_SEEDS,
  PILLAR_SEEDS,
  TAXONOMY_VERSION,
  getChildrenOf,
  getSeedBySlug,
} from '@/lib/clusters/taxonomy'

describe('clusters/taxonomy', () => {
  it('has 14 pillars', () => {
    expect(PILLAR_SEEDS.length).toBe(14)
  })

  it('all pillar entries are clusterType=pillar with parentClusterSlug=null', () => {
    for (const p of PILLAR_SEEDS) {
      expect(p.clusterType).toBe('pillar')
      expect(p.parentClusterSlug).toBeNull()
    }
  })

  it('all cluster entries point to an existing pillar', () => {
    const pillarSlugs = new Set(PILLAR_SEEDS.map((p) => p.slug))
    for (const c of CLUSTER_SEEDS) {
      expect(c.clusterType).toBe('cluster')
      expect(c.parentClusterSlug).not.toBeNull()
      expect(pillarSlugs.has(c.parentClusterSlug as string)).toBe(true)
    }
  })

  it('every seed slug is unique', () => {
    const slugs = ALL_SEEDS.map((s) => s.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('every seed carries Ahrefs source date', () => {
    for (const s of ALL_SEEDS) {
      expect(s.ahrefsSourceDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(s.primaryKw.length).toBeGreaterThan(2)
      expect(s.volumeMonthly).toBeGreaterThan(0)
      expect(s.kdAhrefs).toBeGreaterThanOrEqual(0)
      expect(s.cpcEur).toBeGreaterThan(0)
    }
  })

  it('TAXONOMY_VERSION matches ISO date prefix', () => {
    expect(TAXONOMY_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}-v\d+$/)
  })

  it('getSeedBySlug returns seed or undefined', () => {
    expect(getSeedBySlug('pompe-a-chaleur')?.clusterType).toBe('pillar')
    expect(getSeedBySlug('nonexistent-zzz')).toBeUndefined()
  })

  it('getChildrenOf returns clusters with matching parent', () => {
    const children = getChildrenOf('pompe-a-chaleur')
    expect(children.length).toBeGreaterThan(0)
    for (const c of children) {
      expect(c.parentClusterSlug).toBe('pompe-a-chaleur')
    }
  })

  it('pillar primary KW are deduplicated', () => {
    const kws = PILLAR_SEEDS.map((p) => p.primaryKw.toLowerCase())
    expect(new Set(kws).size).toBe(kws.length)
  })

  it('total seeds >= 30 (14 pillars + 16+ clusters)', () => {
    expect(ALL_SEEDS.length).toBeGreaterThanOrEqual(30)
  })
})
