import { describe, expect, it } from 'vitest'

import sitemap, { generateSitemaps } from '@/app/sitemap'
import { AIDES_INDEXED_DEPTS } from '@/lib/seo/aides-dept-whitelist'

/**
 * Sprint AI Wave H 2026-05-03 — verrou sitemap shard /aides/[dept] hub.
 *
 * Garantit :
 *   - shard `aides-dept-hub` déclaré
 *   - 30 URLs (= AIDES_INDEXED_DEPTS.size) émises
 *   - URL pattern `/aides/<deptSlug>` (sans sous-segment)
 *   - priority > celle des pages dept × aide (parent canonical)
 */

describe('Sprint AI Wave H — sitemap shard aides-dept-hub', () => {
  it('shard aides-dept-hub déclaré dans generateSitemaps()', async () => {
    const shards = await generateSitemaps()
    const ids = shards.map((s) => s.id)
    expect(ids).toContain('aides-dept-hub')
  })

  it(`handler retourne ${AIDES_INDEXED_DEPTS.size} URLs (= dépts whitelistés)`, async () => {
    const entries = await sitemap({ id: 'aides-dept-hub' })
    expect(entries.length).toBe(AIDES_INDEXED_DEPTS.size)
  })

  it('chaque URL respecte le pattern /aides/<dept> (sans sous-segment)', async () => {
    const entries = await sitemap({ id: 'aides-dept-hub' })
    for (const entry of entries) {
      expect(entry.url).toMatch(/\/aides\/[a-z0-9-]+$/)
    }
  })

  it('priority hub > priority pages dept × aide (PageRank parent)', async () => {
    const hubEntries = await sitemap({ id: 'aides-dept-hub' })
    const childEntries = await sitemap({ id: 'aides-dept' })
    const hubPriority = hubEntries[0]?.priority ?? 0
    const childPriority = childEntries[0]?.priority ?? 0
    expect(hubPriority).toBeGreaterThan(childPriority)
  })
})
