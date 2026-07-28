/**
 * Tests — buildPendingConversions (cron ads-offline-conversions).
 *
 * Enjeu central : l'idempotence. Un double envoi de la même conversion gonfle
 * le compteur côté Google Ads et corrompt le Smart Bidding — donc les enchères,
 * donc le budget. Le journal `ads_conversion_uploads` doit court-circuiter tout
 * ré-envoi.
 */

import { describe, it, expect } from 'vitest'
import { buildPendingConversions } from '@/lib/ads/pending-conversions'
import type { ConversionActionKey } from '@/lib/ads/google-ads-oci'

const ALL_ACTIONS: ConversionActionKey[] = ['lead_dispatched', 'lead_quoted']

const lead = {
  id: 'lead-1',
  gclid: 'Cj0KCQjw_abc123',
  gbraid: null,
  wbraid: null,
  created_at: '2026-07-01T10:00:00Z',
}

const noneUploaded = new Set<ConversionActionKey>()

describe('buildPendingConversions', () => {
  it('ne produit rien sans affectation (lead non dispatché = sans valeur)', () => {
    expect(buildPendingConversions(lead, [], noneUploaded, ALL_ACTIONS)).toEqual([])
  })

  it('ne produit rien sans click-ID', () => {
    const organic = { ...lead, gclid: null }
    const assignments = [
      { lead_id: 'lead-1', status: 'pending', assigned_at: '2026-07-01T11:00:00Z' },
    ]
    expect(buildPendingConversions(organic, assignments, noneUploaded, ALL_ACTIONS)).toEqual([])
  })

  it('produit lead_dispatched dès la première affectation', () => {
    const assignments = [
      { lead_id: 'lead-1', status: 'pending', assigned_at: '2026-07-01T11:00:00Z' },
    ]
    const result = buildPendingConversions(lead, assignments, noneUploaded, ALL_ACTIONS)

    expect(result).toHaveLength(1)
    expect(result[0].actionKey).toBe('lead_dispatched')
    expect(result[0].clickId).toBe('Cj0KCQjw_abc123')
    expect(result[0].clickIdType).toBe('gclid')
    expect(result[0].conversionAt.toISOString()).toBe('2026-07-01T11:00:00.000Z')
  })

  it('retient la PLUS ANCIENNE affectation comme date de dispatch', () => {
    const assignments = [
      { lead_id: 'lead-1', status: 'pending', assigned_at: '2026-07-03T09:00:00Z' },
      { lead_id: 'lead-1', status: 'pending', assigned_at: '2026-07-01T11:00:00Z' },
    ]
    const result = buildPendingConversions(lead, assignments, noneUploaded, ALL_ACTIONS)
    expect(result[0].conversionAt.toISOString()).toBe('2026-07-01T11:00:00.000Z')
  })

  it('produit lead_quoted en plus quand une affectation est devisée', () => {
    const assignments = [
      { lead_id: 'lead-1', status: 'quoted', assigned_at: '2026-07-02T15:00:00Z' },
    ]
    const result = buildPendingConversions(lead, assignments, noneUploaded, ALL_ACTIONS)

    expect(result.map((c) => c.actionKey).sort()).toEqual(['lead_dispatched', 'lead_quoted'])
  })

  it('ne produit pas lead_quoted si aucune affectation n est devisée', () => {
    const assignments = [
      { lead_id: 'lead-1', status: 'declined', assigned_at: '2026-07-02T15:00:00Z' },
    ]
    const result = buildPendingConversions(lead, assignments, noneUploaded, ALL_ACTIONS)
    expect(result.map((c) => c.actionKey)).toEqual(['lead_dispatched'])
  })

  it('IDEMPOTENCE : ne re-produit pas une conversion déjà journalisée', () => {
    const assignments = [
      { lead_id: 'lead-1', status: 'quoted', assigned_at: '2026-07-02T15:00:00Z' },
    ]
    const uploaded = new Set<ConversionActionKey>(['lead_dispatched'])
    const result = buildPendingConversions(lead, assignments, uploaded, ALL_ACTIONS)

    expect(result.map((c) => c.actionKey)).toEqual(['lead_quoted'])
  })

  it('IDEMPOTENCE : ne produit rien quand tout est déjà journalisé', () => {
    const assignments = [
      { lead_id: 'lead-1', status: 'quoted', assigned_at: '2026-07-02T15:00:00Z' },
    ]
    const uploaded = new Set<ConversionActionKey>(['lead_dispatched', 'lead_quoted'])
    expect(buildPendingConversions(lead, assignments, uploaded, ALL_ACTIONS)).toEqual([])
  })

  it('ignore une action non configurée côté env', () => {
    const assignments = [
      { lead_id: 'lead-1', status: 'quoted', assigned_at: '2026-07-02T15:00:00Z' },
    ]
    const result = buildPendingConversions(lead, assignments, noneUploaded, ['lead_quoted'])
    expect(result.map((c) => c.actionKey)).toEqual(['lead_quoted'])
  })

  it('bascule sur gbraid puis wbraid quand gclid est absent', () => {
    const assignments = [
      { lead_id: 'lead-1', status: 'pending', assigned_at: '2026-07-01T11:00:00Z' },
    ]

    const gbraidLead = { ...lead, gclid: null, gbraid: 'gb-123' }
    expect(
      buildPendingConversions(gbraidLead, assignments, noneUploaded, ALL_ACTIONS)[0].clickIdType
    ).toBe('gbraid')

    const wbraidLead = { ...lead, gclid: null, gbraid: null, wbraid: 'wb-456' }
    expect(
      buildPendingConversions(wbraidLead, assignments, noneUploaded, ALL_ACTIONS)[0].clickIdType
    ).toBe('wbraid')
  })
})
