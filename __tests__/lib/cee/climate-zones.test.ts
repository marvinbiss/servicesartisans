/**
 * Tests unitaires — src/lib/cee/climate-zones.ts
 * ------------------------------------------------
 * Vérifie le mapping département → zone climatique RT2012 (H1/H2/H3)
 * et les cas limites (Corse, code postal invalide, null/undefined).
 */

import { describe, it, expect } from 'vitest'
import { postalCodeToClimateZone } from '@/lib/cee/climate-zones'

describe('postalCodeToClimateZone — zones H3 (méditerranée)', () => {
  it.each([
    ['13008', 'Marseille'],
    ['06000', 'Nice'],
    ['34000', 'Montpellier'],
    ['83000', 'Toulon'],
    ['84000', 'Avignon'],
    ['11000', 'Carcassonne'],
    ['66000', 'Perpignan'],
    ['30000', 'Nîmes'],
  ])('%s (%s) → H3', (cp) => {
    expect(postalCodeToClimateZone(cp)).toBe('H3')
  })
})

describe('postalCodeToClimateZone — zones H2 (océanique/sud-ouest)', () => {
  it.each([
    ['44000', 'Nantes'],
    ['33000', 'Bordeaux'],
    ['35000', 'Rennes'],
    ['29000', 'Quimper'],
    ['31000', 'Toulouse'],
    ['64000', 'Pau'],
    ['76600', 'Le Havre'],
    ['17000', 'La Rochelle'],
  ])('%s (%s) → H2', (cp) => {
    expect(postalCodeToClimateZone(cp)).toBe('H2')
  })
})

describe('postalCodeToClimateZone — zones H1 (continental/montagne)', () => {
  it.each([
    ['75001', 'Paris'],
    ['69000', 'Lyon'],
    ['67000', 'Strasbourg'],
    ['59000', 'Lille'],
    ['21000', 'Dijon'],
    ['38000', 'Grenoble'],
    ['54000', 'Nancy'],
  ])('%s (%s) → H1', (cp) => {
    expect(postalCodeToClimateZone(cp)).toBe('H1')
  })
})

describe('postalCodeToClimateZone — Corse (2A vs 2B)', () => {
  it('20000 (Ajaccio) → H3 (2A)', () => {
    expect(postalCodeToClimateZone('20000')).toBe('H3')
  })
  it('20090 (Ajaccio) → H3 (2A)', () => {
    expect(postalCodeToClimateZone('20090')).toBe('H3')
  })
  it('20200 (Bastia) → H3 (2B)', () => {
    expect(postalCodeToClimateZone('20200')).toBe('H3')
  })
  it('20600 (Bastia) → H3 (2B)', () => {
    expect(postalCodeToClimateZone('20600')).toBe('H3')
  })
})

describe('postalCodeToClimateZone — entrées invalides', () => {
  it('retourne null pour null', () => {
    expect(postalCodeToClimateZone(null)).toBeNull()
  })
  it('retourne null pour undefined', () => {
    expect(postalCodeToClimateZone(undefined)).toBeNull()
  })
  it('retourne null pour chaîne vide', () => {
    expect(postalCodeToClimateZone('')).toBeNull()
  })
  it('retourne null pour code postal non numérique', () => {
    expect(postalCodeToClimateZone('ABCDE')).toBeNull()
  })
  it('retourne null pour code postal trop court', () => {
    expect(postalCodeToClimateZone('7500')).toBeNull()
  })
  it('retourne null pour code postal trop long', () => {
    expect(postalCodeToClimateZone('750010')).toBeNull()
  })
})
