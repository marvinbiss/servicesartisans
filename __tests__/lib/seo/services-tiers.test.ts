/**
 * Tests — services-tiers : allocation tiered /services/[s]/[v].
 *
 * Stratégie 140K vague 2 #6 (2026-04-29).
 *   - Phase A : priority sitemap par tier (non-destructif, actif)
 *   - Phase B : coupe destructive gated par env SA_REDUCE_SERVICES_TIERED
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  TIER_A_SERVICES,
  TIER_B_SERVICES,
  TIER_C_SERVICES,
  assertTierPartitionCoverage,
  getServiceTier,
  getServiceCityPriority,
  isServiceVilleIndexable,
} from '@/lib/seo/services-tiers'
import { services } from '@/lib/data/france'

describe('partition tiers', () => {
  it('chaque service france.ts appartient à exactement 1 tier', () => {
    expect(() => assertTierPartitionCoverage()).not.toThrow()
  })

  it('aucun overlap entre Tier A, B, C', () => {
    for (const slug of Array.from(TIER_A_SERVICES)) {
      expect(TIER_B_SERVICES.has(slug)).toBe(false)
      expect(TIER_C_SERVICES.has(slug)).toBe(false)
    }
    for (const slug of Array.from(TIER_B_SERVICES)) {
      expect(TIER_C_SERVICES.has(slug)).toBe(false)
    }
  })

  it('couvre tous les services france.ts (zéro slug orphelin)', () => {
    const allTiered = new Set<string>([
      ...Array.from(TIER_A_SERVICES),
      ...Array.from(TIER_B_SERVICES),
      ...Array.from(TIER_C_SERVICES),
    ])
    for (const s of services) {
      expect(allTiered.has(s.slug), `service ${s.slug} sans tier`).toBe(true)
    }
  })

  it('Tier A = exactement 12 services (haute demande)', () => {
    expect(TIER_A_SERVICES.size).toBe(12)
  })

  it('Tier B = exactement 18 services (moyenne)', () => {
    expect(TIER_B_SERVICES.size).toBe(18)
  })

  it('Tier C = vide (16 métiers niche supprimés au pivot RGE 2026-05-01)', () => {
    expect(TIER_C_SERVICES.size).toBe(0)
  })
})

describe('getServiceTier', () => {
  it('plombier → A', () => {
    expect(getServiceTier('plombier')).toBe('A')
  })

  it('isolation-thermique → B (cluster RGE)', () => {
    expect(getServiceTier('isolation-thermique')).toBe('B')
  })

  it('slug inconnu → C (fallback safe)', () => {
    expect(getServiceTier('service-fictif-xyz')).toBe('C')
  })
})

describe('getServiceCityPriority (Phase A — actif sans gate)', () => {
  it('Tier A = 0.9', () => {
    expect(getServiceCityPriority('plombier')).toBe(0.9)
  })

  it('Tier B = 0.7', () => {
    expect(getServiceCityPriority('pompe-a-chaleur')).toBe(0.7)
  })

  it('slug inconnu → fallback Tier C priority 0.4', () => {
    expect(getServiceCityPriority('service-fictif-xyz')).toBe(0.4)
  })
})

describe('isServiceVilleIndexable (Phase B gate)', () => {
  const originalEnv = process.env.SA_REDUCE_SERVICES_TIERED

  beforeEach(() => {
    delete process.env.SA_REDUCE_SERVICES_TIERED
  })

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.SA_REDUCE_SERVICES_TIERED
    } else {
      process.env.SA_REDUCE_SERVICES_TIERED = originalEnv
    }
  })

  it('gate OFF par défaut → tout combo accepté', () => {
    expect(isServiceVilleIndexable('plombier', 'paris')).toBe(true)
    expect(isServiceVilleIndexable('pompe-a-chaleur', 'andrezieux-boutheon')).toBe(true)
  })

  it('gate ON + Tier A + Paris → indexable', () => {
    process.env.SA_REDUCE_SERVICES_TIERED = '1'
    expect(isServiceVilleIndexable('plombier', 'paris')).toBe(true)
  })

  it('gate ON + slug inconnu (fallback Tier C) hors top 200 → exclu', () => {
    process.env.SA_REDUCE_SERVICES_TIERED = '1'
    // Tier C = vide depuis pivot RGE — slugs inconnus retombent en Tier C par fallback
    expect(isServiceVilleIndexable('service-inconnu', 'cany-barville')).toBe(false)
  })

  it('gate ON + slug inconnu (fallback Tier C) + Paris (top 200) → indexable', () => {
    process.env.SA_REDUCE_SERVICES_TIERED = '1'
    expect(isServiceVilleIndexable('service-inconnu', 'paris')).toBe(true)
  })

  it('gate ON + valeur env autre que "1" → considère gate OFF', () => {
    process.env.SA_REDUCE_SERVICES_TIERED = 'true'
    expect(isServiceVilleIndexable('service-inconnu', 'cany-barville')).toBe(true)
  })
})
