import { describe, it, expect } from 'vitest'
import {
  RENO_SERVICES_WITH_AIDES,
  buildAidePageUrl,
  getApplicableAidesForService,
  isServiceEligibleForAides,
} from '../aides-for-service'
import { SITE_URL } from '../config'

describe('RENO_SERVICES_WITH_AIDES whitelist', () => {
  it('contains core renovation services', () => {
    expect(RENO_SERVICES_WITH_AIDES.has('pompe-a-chaleur')).toBe(true)
    expect(RENO_SERVICES_WITH_AIDES.has('isolation-thermique')).toBe(true)
    expect(RENO_SERVICES_WITH_AIDES.has('ventilation')).toBe(true)
    expect(RENO_SERVICES_WITH_AIDES.has('audit-energetique')).toBe(true)
    expect(RENO_SERVICES_WITH_AIDES.has('chauffagiste')).toBe(true)
  })

  it('excludes urgence/commodity services', () => {
    expect(RENO_SERVICES_WITH_AIDES.has('plombier')).toBe(false)
    expect(RENO_SERVICES_WITH_AIDES.has('electricien')).toBe(false)
    expect(RENO_SERVICES_WITH_AIDES.has('ramoneur')).toBe(false)
    expect(RENO_SERVICES_WITH_AIDES.has('platrier')).toBe(false)
  })
})

describe('isServiceEligibleForAides', () => {
  it('returns true for whitelisted services', () => {
    expect(isServiceEligibleForAides('pompe-a-chaleur')).toBe(true)
    expect(isServiceEligibleForAides('isolation-thermique')).toBe(true)
  })

  it('returns false for non-whitelisted services', () => {
    expect(isServiceEligibleForAides('plombier')).toBe(false)
    expect(isServiceEligibleForAides('unknown-service')).toBe(false)
    expect(isServiceEligibleForAides('')).toBe(false)
  })
})

describe('getApplicableAidesForService', () => {
  it('returns [] for services not in whitelist', () => {
    expect(getApplicableAidesForService('plombier')).toEqual([])
    expect(getApplicableAidesForService('unknown-service')).toEqual([])
  })

  it('returns 4 aides for pompe-a-chaleur (MPR + CEE BAR-TH-104 + Coup de pouce + Eco-PTZ)', () => {
    const aides = getApplicableAidesForService('pompe-a-chaleur')
    expect(aides.length).toBeGreaterThanOrEqual(3)
    const codes = aides.map((a) => a.code)
    expect(codes).toContain('mpr')
    expect(codes).toContain('cee-bar-th-104')
    expect(codes).toContain('eco-ptz')
  })

  it('returns isolation aides covering CEE BAR-EN-101, 102, 103', () => {
    const aides = getApplicableAidesForService('isolation-thermique')
    const codes = aides.map((a) => a.code)
    expect(codes).toContain('cee-bar-en-101')
    expect(codes).toContain('cee-bar-en-102')
    expect(codes).toContain('cee-bar-en-103')
  })

  it('returns only CEE BAR-TH-129 for climaticien (PAC air/air not MPR-eligible)', () => {
    const aides = getApplicableAidesForService('climaticien')
    const codes = aides.map((a) => a.code)
    expect(codes).toContain('cee-bar-th-129')
    expect(codes).not.toContain('mpr') // PAC air/air not eligible MPR
  })

  it('returns ventilation aides including BAR-TH-125 + BAR-TH-127', () => {
    const aides = getApplicableAidesForService('ventilation')
    const codes = aides.map((a) => a.code)
    expect(codes).toContain('cee-bar-th-125')
    expect(codes).toContain('cee-bar-th-127')
  })

  it('emits unique fragments per service+aide combo (no KG collision)', () => {
    const pac = getApplicableAidesForService('pompe-a-chaleur')
    const iso = getApplicableAidesForService('isolation-thermique')
    const pacMpr = pac.find((a) => a.code === 'mpr')
    const isoMpr = iso.find((a) => a.code === 'mpr')
    expect(pacMpr?.fragment).toBe('aide-mpr-pompe-a-chaleur')
    expect(isoMpr?.fragment).toBe('aide-mpr-isolation-thermique')
    expect(pacMpr?.fragment).not.toBe(isoMpr?.fragment)
  })

  it('every aide has a non-empty sameAs with at least 1 official .gouv.fr URL', () => {
    const services = [
      'pompe-a-chaleur',
      'isolation-thermique',
      'ventilation',
      'fenetres',
      'audit-energetique',
      'chauffagiste',
    ]
    for (const slug of services) {
      const aides = getApplicableAidesForService(slug)
      for (const aide of aides) {
        expect(aide.sameAs.length).toBeGreaterThan(0)
        const hasOfficial = aide.sameAs.some(
          (u) => u.includes('.gouv.fr') || u.includes('legifrance.gouv.fr')
        )
        expect(hasOfficial).toBe(true)
      }
    }
  })

  it('every aide has serviceOperator with name + url', () => {
    const aides = getApplicableAidesForService('pompe-a-chaleur')
    for (const aide of aides) {
      expect(aide.serviceOperator.name.length).toBeGreaterThan(0)
      expect(aide.serviceOperator.url).toMatch(/^https?:\/\//)
    }
  })

  it('no aide description contains invented numeric values (€, kWh cumac)', () => {
    // Garde-fou : on accepte les seuils techniques (Uw, COP) mais pas les
    // montants € spécifiques ni les kWh cumac (qui doivent rester sur les
    // pages racines /aides/...). Les montants génériques ("jusqu'à 50 000 €
    // pour un éco-PTZ performance globale") sont publics et stables côté
    // Légifrance — on autorise ceux-ci dans `renovation-energetique`.
    const services = ['pompe-a-chaleur', 'isolation-thermique', 'ventilation', 'fenetres']
    for (const slug of services) {
      const aides = getApplicableAidesForService(slug)
      for (const aide of aides) {
        expect(aide.description).not.toMatch(/\d+\s*kWh\s*cumac/i)
        expect(aide.description.length).toBeLessThanOrEqual(500)
      }
    }
  })
})

describe('buildAidePageUrl', () => {
  it('prepends SITE_URL', () => {
    expect(buildAidePageUrl('/services/pompe-a-chaleur/paris')).toBe(
      `${SITE_URL}/services/pompe-a-chaleur/paris`
    )
  })
})
