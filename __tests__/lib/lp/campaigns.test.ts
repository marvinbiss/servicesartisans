import { describe, expect, it } from 'vitest'

import { CANONICAL_SERVICE_SLUGS_SET } from '@/lib/services/canonical-slugs'
import {
  getAllLpCampaigns,
  getLpCampaign,
  getLpPipedriveSource,
  LP_CAMPAIGN_SLUGS,
} from '@/lib/lp/campaigns'

describe('LP Campaigns Registry — Action #5 Ahrefs 2026-05-03', () => {
  it('expose au minimum 4 campagnes (PAC, CEE, isolation, audit)', () => {
    expect(LP_CAMPAIGN_SLUGS.length).toBeGreaterThanOrEqual(4)
    expect(LP_CAMPAIGN_SLUGS).toContain('aides-pac')
    expect(LP_CAMPAIGN_SLUGS).toContain('prime-cee')
    expect(LP_CAMPAIGN_SLUGS).toContain('isolation-aides')
    expect(LP_CAMPAIGN_SLUGS).toContain('audit-energetique')
  })

  it('chaque campaign.serviceSlug est dans canonical-slugs (zéro broken /api/devis)', () => {
    for (const c of getAllLpCampaigns()) {
      expect(
        CANONICAL_SERVICE_SLUGS_SET.has(c.serviceSlug),
        `Campaign "${c.slug}" : serviceSlug "${c.serviceSlug}" absent de canonical-slugs`
      ).toBe(true)
    }
  })

  it('chaque slug LP est en kebab-case (a-z, 0-9, -)', () => {
    const re = /^[a-z0-9]+(-[a-z0-9]+)*$/
    for (const slug of LP_CAMPAIGN_SLUGS) {
      expect(re.test(slug), `Slug LP "${slug}" pas en kebab-case`).toBe(true)
    }
  })

  it('contraintes éditoriales : H1 ≤ 70 chars, sub ≤ 200, cta ≤ 50, legal ≤ 250', () => {
    for (const c of getAllLpCampaigns()) {
      expect(c.h1.length, `Campaign "${c.slug}" : h1 trop long`).toBeLessThanOrEqual(70)
      expect(
        c.subheadline.length,
        `Campaign "${c.slug}" : subheadline trop long`
      ).toBeLessThanOrEqual(200)
      expect(c.ctaLabel.length, `Campaign "${c.slug}" : ctaLabel trop long`).toBeLessThanOrEqual(50)
      expect(c.legalNote.length, `Campaign "${c.slug}" : legalNote trop long`).toBeLessThanOrEqual(
        250
      )
    }
  })

  it('chaque campaign expose exactement 3 trustBlocks', () => {
    for (const c of getAllLpCampaigns()) {
      expect(c.trustBlocks.length, `Campaign "${c.slug}" : doit avoir 3 trust blocks`).toBe(3)
    }
  })

  it('kind est dans la liste autorisée (financial / government / service)', () => {
    const allowed = new Set(['financial', 'government', 'service'])
    for (const c of getAllLpCampaigns()) {
      expect(allowed.has(c.kind), `Campaign "${c.slug}" : kind "${c.kind}" inconnu`).toBe(true)
    }
  })

  it('source Pipedrive respecte la convention `lp_<slug>` (mig 499)', () => {
    expect(getLpPipedriveSource('aides-pac')).toBe('lp_aides-pac')
    expect(getLpPipedriveSource('prime-cee')).toBe('lp_prime-cee')
    // Format compatible avec regex schema /api/devis (a-z, 0-9, _, -)
    for (const slug of LP_CAMPAIGN_SLUGS) {
      const source = getLpPipedriveSource(slug)
      expect(source).toMatch(/^[a-z0-9_-]+$/)
      expect(source.length).toBeLessThanOrEqual(50)
    }
  })

  it('getLpCampaign renvoie undefined pour slug inconnu', () => {
    expect(getLpCampaign('campaign-qui-existe-pas')).toBeUndefined()
  })

  it('maxAmountEur (si défini) est cohérent (positif, < 100 000)', () => {
    for (const c of getAllLpCampaigns()) {
      if (c.maxAmountEur !== undefined) {
        expect(c.maxAmountEur).toBeGreaterThan(0)
        expect(c.maxAmountEur).toBeLessThan(100000)
      }
    }
  })
})
