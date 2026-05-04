import { describe, expect, it } from 'vitest'

import sitemap, { generateSitemaps } from '@/app/sitemap'

/**
 * Sprint AI Wave D Ahrefs 2026-05-03 — verrou sitemap shard cee-operation-region.
 *
 * Garantit que :
 *   - le shard `cee-operation-region` est déclaré dans generateSitemaps()
 *   - le handler retourne un Sitemap entries non-vide avec URL pattern attendu
 *   - chaque URL contient `/cee/<op>/region/<region>` (path schema)
 */

describe('Sprint AI Wave D — sitemap shard cee-operation-region', () => {
  it('shard cee-operation-region déclaré dans generateSitemaps()', async () => {
    const shards = await generateSitemaps()
    const ids = shards.map((s) => s.id)
    expect(ids).toContain('cee-operation-region')
  })

  it('handler retourne entries non-vide pour cee-operation-region', async () => {
    const entries = await sitemap({ id: 'cee-operation-region' })
    expect(entries.length).toBeGreaterThan(0)
  })

  it('chaque URL respecte le pattern /cee/<op>/region/<region>', async () => {
    const entries = await sitemap({ id: 'cee-operation-region' })
    for (const entry of entries) {
      expect(entry.url).toMatch(/\/cee\/[a-z0-9-]+\/region\/[a-z0-9-]+$/)
    }
  })

  it('priority CEE×région est < priority hub /cee/[op] (PageRank flow descendant)', async () => {
    const entries = await sitemap({ id: 'cee-operation-region' })
    for (const entry of entries) {
      // Hub /cee/[op] = 0.7, page régionale doit être inférieure (signal SEO).
      expect(entry.priority).toBeLessThan(0.7)
    }
  })
})
