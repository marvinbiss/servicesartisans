/**
 * Tests unitaires pour les helpers TldrBlock des hubs `/services/[s]` et
 * `/villes/[v]` (Sprint 0.2 ULTRA DOMINATION SEO).
 *
 * Pure logique déterministe — pas de mocks Next.js / Supabase requis.
 */
import { describe, it, expect } from 'vitest'

import { buildServiceTldrBullets } from '@/app/(public)/services/[service]/sprint-helpers'
import { buildVilleTldrBullets } from '@/app/(public)/villes/[ville]/sprint-helpers'

describe('buildServiceTldrBullets', () => {
  it('retourne 4 bullets quand trade + topCity disponibles', () => {
    const out = buildServiceTldrBullets({
      serviceName: 'Plombier',
      trade: { priceRange: { min: 60, max: 90, unit: '€/h' } },
      topCity: 'Paris',
      villesCount: 5000,
    })
    expect(out).toHaveLength(4)
    expect(out[0]).toContain('60–90 €/h')
    expect(out[0]).toContain('plombier')
    expect(out[1]).toMatch(/SIRET|décennale/i)
    expect(out[2]).toContain('Paris')
    expect(out[3]).toMatch(/comparez|service-public/i)
  })

  it('omet la fourchette quand trade est null', () => {
    const out = buildServiceTldrBullets({
      serviceName: 'Serrurier',
      trade: null,
      topCity: 'Lyon',
      villesCount: 100,
    })
    expect(out).toHaveLength(3)
    expect(out.every((b) => !b.includes('€/h'))).toBe(true)
  })

  it('inverse min/max si DB renvoie min > max', () => {
    const out = buildServiceTldrBullets({
      serviceName: 'Peintre',
      trade: { priceRange: { min: 60, max: 30, unit: '€/m²' } },
      topCity: null,
      villesCount: 200,
    })
    expect(out[0]).toContain('30–60 €/m²')
  })

  it('utilise villesCount sans topCity quand topCity null', () => {
    const out = buildServiceTldrBullets({
      serviceName: 'Carreleur',
      trade: null,
      topCity: null,
      villesCount: 1500,
    })
    expect(out[1]).toContain('1 500+')
  })

  it('ne retourne jamais bullet vide ou undefined', () => {
    const out = buildServiceTldrBullets({
      serviceName: 'Test',
      trade: null,
      topCity: null,
      villesCount: 0,
    })
    expect(out.every((b) => typeof b === 'string' && b.length > 0)).toBe(true)
  })
})

describe('buildVilleTldrBullets', () => {
  it('retourne [] quand villeProviderCount = 0 (cohérence avec UX no-empty-promise)', () => {
    const out = buildVilleTldrBullets({
      villeName: 'Vesoul',
      departementCode: '70',
      servicesCount: 46,
      villeProviderCount: 0,
      rgeCount: 0,
      climateLabel: 'Climat continental',
      citySizeLabel: 'Petite ville',
    })
    expect(out).toEqual([])
  })

  it('retourne 4 bullets sans RGE', () => {
    const out = buildVilleTldrBullets({
      villeName: 'Lyon',
      departementCode: '69',
      servicesCount: 46,
      villeProviderCount: 1234,
      rgeCount: 0,
      climateLabel: 'Climat semi-continental',
      citySizeLabel: 'Grande ville',
    })
    expect(out).toHaveLength(4)
    expect(out[0]).toContain('1 234')
    expect(out[0]).toContain('Lyon')
    expect(out[0]).toContain('(69)')
    expect(out[1]).toMatch(/SIREN|décennale/i)
    expect(out[2]).toMatch(/24h|partagée/i)
    expect(out[3]).toMatch(/comparaison|service-public/i)
  })

  it('ajoute la bullet RGE/MPR quand rgeCount > 0', () => {
    const out = buildVilleTldrBullets({
      villeName: 'Paris',
      departementCode: '75',
      servicesCount: 46,
      villeProviderCount: 5000,
      rgeCount: 312,
      climateLabel: null,
      citySizeLabel: null,
    })
    expect(out).toHaveLength(5)
    expect(out[3]).toContain('312')
    expect(out[3]).toContain('MaPrimeRénov')
  })

  it("singularise 'certifié' quand rgeCount = 1", () => {
    const out = buildVilleTldrBullets({
      villeName: 'Saint-Maur',
      departementCode: '94',
      servicesCount: 46,
      villeProviderCount: 50,
      rgeCount: 1,
      climateLabel: null,
      citySizeLabel: null,
    })
    expect(out[3]).toMatch(/1\s+artisan certifié RGE/)
    expect(out[3]).not.toMatch(/artisans certifiés/)
  })

  it('omet le suffixe profile quand climate + size sont null', () => {
    const out = buildVilleTldrBullets({
      villeName: 'Bordeaux',
      departementCode: '33',
      servicesCount: 46,
      villeProviderCount: 800,
      rgeCount: 0,
      climateLabel: null,
      citySizeLabel: null,
    })
    expect(out[0]).not.toContain(' — ')
  })

  it('toutes les bullets sont des strings non-vides', () => {
    const out = buildVilleTldrBullets({
      villeName: 'Marseille',
      departementCode: '13',
      servicesCount: 46,
      villeProviderCount: 999,
      rgeCount: 42,
      climateLabel: 'Climat méditerranéen',
      citySizeLabel: 'Métropole',
    })
    expect(out.every((b) => typeof b === 'string' && b.length > 10)).toBe(true)
  })
})
