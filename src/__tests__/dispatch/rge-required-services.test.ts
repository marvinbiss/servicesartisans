import { describe, it, expect } from 'vitest'
import { RGE_REQUIRED_SERVICES, isRgeRequiredService } from '@/lib/dispatch/rge-required-services'

describe('isRgeRequiredService', () => {
  it('returns true for canonical RGE-mandatory services', () => {
    const expected = [
      'pompe-a-chaleur',
      'panneaux-solaires',
      'isolation-thermique',
      'chauffe-eau-thermodynamique',
      'audit-energetique',
      'renovation-energetique',
      'ventilation',
      'fenetres',
      'borne-recharge',
    ]
    for (const slug of expected) {
      expect(isRgeRequiredService(slug)).toBe(true)
    }
  })

  it('returns false for RGE-conditional / non-RGE services', () => {
    const conditional = [
      'plombier',
      'electricien',
      'chauffagiste',
      'couvreur',
      'climaticien',
      'menuisier',
      'ramoneur',
      'zingueur',
      'facadier',
      'platrier',
    ]
    for (const slug of conditional) {
      expect(isRgeRequiredService(slug)).toBe(false)
    }
  })

  it('handles null / undefined / empty inputs safely', () => {
    expect(isRgeRequiredService(null)).toBe(false)
    expect(isRgeRequiredService(undefined)).toBe(false)
    expect(isRgeRequiredService('')).toBe(false)
  })

  it('is case-sensitive (mirrors SQL ANY() comparison)', () => {
    expect(isRgeRequiredService('Pompe-A-Chaleur')).toBe(false)
    expect(isRgeRequiredService('POMPE-A-CHALEUR')).toBe(false)
  })

  it('exposes a frozen canonical list aligned with SQL DEFAULT', () => {
    // Cette liste DOIT rester synchronisée avec la valeur DEFAULT de
    // algorithm_config.rge_required_services dans migration 498. Toute
    // modification ici nécessite UPDATE SQL en parallèle.
    expect(RGE_REQUIRED_SERVICES).toEqual([
      'pompe-a-chaleur',
      'panneaux-solaires',
      'isolation-thermique',
      'chauffe-eau-thermodynamique',
      'audit-energetique',
      'renovation-energetique',
      'ventilation',
      'fenetres',
      'borne-recharge',
    ])
  })
})
