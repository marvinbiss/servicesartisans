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

describe('isServiceVilleIndexable (Phase B — vague α 2026-05-02 ON par défaut)', () => {
  const originalEnv = process.env.SA_DISABLE_SERVICES_TIERED

  beforeEach(() => {
    delete process.env.SA_DISABLE_SERVICES_TIERED
  })

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.SA_DISABLE_SERVICES_TIERED
    } else {
      process.env.SA_DISABLE_SERVICES_TIERED = originalEnv
    }
  })

  it('par défaut (gate ON) — Tier A + Paris → indexable', () => {
    expect(isServiceVilleIndexable('plombier', 'paris')).toBe(true)
  })

  it('par défaut (gate ON) — slug inconnu (fallback Tier C vide) hors top 0 → exclu', () => {
    // Tier C = vide depuis pivot RGE — slugs inconnus retombent en Tier C par fallback
    // qui n'a aucune ville allouée → toujours false.
    expect(isServiceVilleIndexable('service-inconnu', 'cany-barville')).toBe(false)
  })

  it('par défaut (gate ON) — Tier A + ville hors top 2 000 → exclu', () => {
    // Combo coupé par allocation : Tier A × top 2 000 villes.
    // Une commune INSEE rare hors du top 2000 sera exclue.
    expect(isServiceVilleIndexable('plombier', 'cany-barville')).toBe(false)
  })

  it('rollback escape SA_DISABLE_SERVICES_TIERED=1 → tout combo accepté', () => {
    process.env.SA_DISABLE_SERVICES_TIERED = '1'
    expect(isServiceVilleIndexable('plombier', 'cany-barville')).toBe(true)
    expect(isServiceVilleIndexable('service-inconnu', 'paris')).toBe(true)
  })

  it('rollback escape valeur env autre que "1" → gate reste ON (coupe active)', () => {
    process.env.SA_DISABLE_SERVICES_TIERED = 'true'
    // Valeur "true" ≠ "1" → escape inactif, coupe maintenue.
    expect(isServiceVilleIndexable('plombier', 'cany-barville')).toBe(false)
  })
})
