import { describe, expect, it } from 'vitest'

import { CANONICAL_SERVICE_SLUGS } from '@/lib/services/canonical-slugs'
import { services as franceLightServices } from '@/lib/data/france-light'
import { isRemovedByRgePivot } from '@/lib/seo/pivot-rge-removed-services'

describe('canonical-slugs ↔ france-light coherence', () => {
  it('canonical SSoT contient exactement les slugs france-light filtrés du pivot RGE', () => {
    const fromFranceLight = franceLightServices
      .map((s) => s.slug)
      .filter((slug) => !isRemovedByRgePivot(slug))
      .sort()
    expect([...CANONICAL_SERVICE_SLUGS].sort()).toEqual(fromFranceLight)
  })

  it("aucun slug canonical n'est marqué removed par le pivot RGE", () => {
    for (const slug of CANONICAL_SERVICE_SLUGS) {
      expect(isRemovedByRgePivot(slug), `${slug} ne devrait pas être removed`).toBe(false)
    }
  })

  it('contient exactement 21 slugs (pivot full RGE 2026-05-03)', () => {
    expect(CANONICAL_SERVICE_SLUGS).toHaveLength(21)
  })
})
