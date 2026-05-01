/**
 * Tests unitaires pures functions RGE — service × ville.
 * Couvre l'allowlist, le typeguard et les labels de qualification.
 */

import { describe, it, expect } from 'vitest'
import {
  RGE_ALLOWED_SERVICES,
  RGE_QUALIFICATION_LABELS,
  isRgeAllowedService,
} from '@/lib/rge/service-city-listings'

describe('RGE_ALLOWED_SERVICES', () => {
  it('est un tableau non vide de strings', () => {
    expect(Array.isArray(RGE_ALLOWED_SERVICES)).toBe(true)
    expect(RGE_ALLOWED_SERVICES.length).toBeGreaterThan(0)
    for (const slug of RGE_ALLOWED_SERVICES) {
      expect(typeof slug).toBe('string')
      expect(slug.length).toBeGreaterThan(0)
    }
  })

  it('contient exactement les 19 services énergétiques attendus (post élargissement 2026-05-02)', () => {
    const expected = [
      'pompe-a-chaleur',
      'panneaux-solaires',
      'isolation-thermique',
      'chauffagiste',
      'electricien',
      'renovation-energetique',
      'menuisier',
      'couvreur',
      'plombier',
      'climaticien',
      'ramoneur',
      'zingueur',
      'facadier',
      'platrier',
      // Élargissement RGE 2026-05-02 — slugs RGE-only.
      'borne-recharge',
      'chauffe-eau-thermodynamique',
      'audit-energetique',
      'ventilation',
      'fenetres',
    ]
    expect([...RGE_ALLOWED_SERVICES].sort()).toEqual([...expected].sort())
    expect(RGE_ALLOWED_SERVICES).toHaveLength(19)
  })

  it('ne contient aucun doublon', () => {
    const unique = new Set(RGE_ALLOWED_SERVICES)
    expect(unique.size).toBe(RGE_ALLOWED_SERVICES.length)
  })
})

describe('isRgeAllowedService', () => {
  it('retourne true pour chaque service de l allowlist', () => {
    for (const slug of RGE_ALLOWED_SERVICES) {
      expect(isRgeAllowedService(slug)).toBe(true)
    }
  })

  it('retourne false pour un slug inconnu', () => {
    expect(isRgeAllowedService('plombier-urgence')).toBe(false)
    expect(isRgeAllowedService('peintre')).toBe(false)
    expect(isRgeAllowedService('carreleur')).toBe(false)
    expect(isRgeAllowedService('serrurier')).toBe(false)
  })

  it('retourne false pour une string vide', () => {
    expect(isRgeAllowedService('')).toBe(false)
  })

  it('est case-sensitive (retourne false pour majuscules)', () => {
    expect(isRgeAllowedService('Pompe-A-Chaleur')).toBe(false)
    expect(isRgeAllowedService('ELECTRICIEN')).toBe(false)
  })
})

describe('RGE_QUALIFICATION_LABELS', () => {
  it('chaque clé est un service présent dans l allowlist', () => {
    for (const key of Object.keys(RGE_QUALIFICATION_LABELS)) {
      expect(isRgeAllowedService(key)).toBe(true)
    }
  })

  it('chaque entrée a label, organisme et specifics non vides', () => {
    for (const [key, entry] of Object.entries(RGE_QUALIFICATION_LABELS)) {
      expect(entry, `entry for ${key}`).toBeDefined()
      expect(typeof entry.label).toBe('string')
      expect(entry.label.length).toBeGreaterThan(0)
      expect(typeof entry.organisme).toBe('string')
      expect(entry.organisme.length).toBeGreaterThan(0)
      expect(typeof entry.specifics).toBe('string')
      expect(entry.specifics.length).toBeGreaterThan(0)
    }
  })

  it('couvre les services énergétiques principaux', () => {
    expect(RGE_QUALIFICATION_LABELS['pompe-a-chaleur']).toBeDefined()
    expect(RGE_QUALIFICATION_LABELS['pompe-a-chaleur'].label).toContain('QualiPAC')
    expect(RGE_QUALIFICATION_LABELS['panneaux-solaires']).toBeDefined()
    expect(RGE_QUALIFICATION_LABELS['isolation-thermique']).toBeDefined()
  })
})
