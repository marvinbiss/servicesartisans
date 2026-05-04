import { describe, expect, it } from 'vitest'

import { getAidesDeptHubData, getAllAidesDeptHubSlugs, isAidesDeptHubSlug } from '../dept-hub-data'
import { aidesCatalog } from '../aides-catalog'
import { AIDES_INDEXED_DEPTS, AIDES_INDEXED_SLUGS } from '@/lib/seo/aides-dept-whitelist'

/**
 * Sprint AI Wave H 2026-05-03 — verrou data hub /aides/[dept].
 *
 * Garantit la cohérence entre :
 *   - la whitelist sitemap (AIDES_INDEXED_DEPTS / AIDES_INDEXED_SLUGS)
 *   - le routing discrimination (/aides/[slug] aide vs dept)
 *   - les data dept (région + zone climatique RT2012 + aides régionales)
 */

describe('Sprint AI Wave H — dept-hub-data', () => {
  it('isAidesDeptHubSlug accepte les depts whitelist + rejette le reste', () => {
    expect(isAidesDeptHubSlug('paris')).toBe(true)
    expect(isAidesDeptHubSlug('nord')).toBe(true)
    expect(isAidesDeptHubSlug('rhone')).toBe(true)
    expect(isAidesDeptHubSlug('inexistant-dept')).toBe(false)
    expect(isAidesDeptHubSlug('')).toBe(false)
    // Disjoint avec aidesSlugs (anti-collision routing)
    for (const aide of aidesCatalog) {
      expect(isAidesDeptHubSlug(aide.slug)).toBe(false)
    }
  })

  it('getAllAidesDeptHubSlugs = AIDES_INDEXED_DEPTS exhaustif', () => {
    const slugs = getAllAidesDeptHubSlugs()
    expect(slugs.length).toBe(AIDES_INDEXED_DEPTS.size)
    for (const slug of slugs) {
      expect(AIDES_INDEXED_DEPTS.has(slug)).toBe(true)
    }
  })

  it('getAidesDeptHubData(paris) — données dept + climat + catalogue national complet', () => {
    const hub = getAidesDeptHubData('paris')
    expect(hub).not.toBeNull()
    expect(hub!.dept.slug).toBe('paris')
    expect(hub!.dept.name).toBe('Paris')
    expect(hub!.dept.code).toBe('75')
    expect(['H1', 'H2', 'H3']).toContain(hub!.climate.zone)
    expect(hub!.climate.label.length).toBeGreaterThan(0)
    expect(hub!.climate.impact.length).toBeGreaterThan(20)
    expect(hub!.nationalAides.length).toBe(aidesCatalog.length)
  })

  it('deptIndexedAides = sous-ensemble strict de nationalAides ∩ AIDES_INDEXED_SLUGS', () => {
    const hub = getAidesDeptHubData('paris')
    expect(hub).not.toBeNull()
    expect(hub!.deptIndexedAides.length).toBe(AIDES_INDEXED_SLUGS.size)
    for (const a of hub!.deptIndexedAides) {
      expect(AIDES_INDEXED_SLUGS.has(a.slug)).toBe(true)
    }
  })

  it('nationalAides triées par estimatedVolume desc (PageRank descendant)', () => {
    const hub = getAidesDeptHubData('paris')
    expect(hub).not.toBeNull()
    for (let i = 1; i < hub!.nationalAides.length; i++) {
      expect(hub!.nationalAides[i - 1].estimatedVolume).toBeGreaterThanOrEqual(
        hub!.nationalAides[i].estimatedVolume
      )
    }
  })

  it('regionalAids — sourceUrl https valide quand non vide (E-E-A-T)', () => {
    for (const slug of getAllAidesDeptHubSlugs().slice(0, 10)) {
      const hub = getAidesDeptHubData(slug)
      if (!hub) continue
      for (const aid of hub.regionalAids) {
        expect(aid.sourceUrl).toMatch(/^https:\/\//)
        expect(aid.montant.length).toBeGreaterThan(0)
      }
    }
  })

  it('retourne null pour un dept hors whitelist (anti-fallback)', () => {
    expect(getAidesDeptHubData('inexistant-dept')).toBeNull()
    expect(getAidesDeptHubData('maprimerenov')).toBeNull() // c'est une aide, pas un dept
  })
})
