import { describe, it, expect } from 'vitest'

import { ALL_EVENTS, isValidEvent, mockPayloadFor, type WebhookEvent } from '@/lib/webhooks'

describe('webhooks/events — catalog', () => {
  it('ALL_EVENTS exposes the v0.1 event set', () => {
    expect(ALL_EVENTS).toContain('rge.snapshot.refreshed')
    expect(ALL_EVENTS).toContain('rge.qualification.added')
    expect(ALL_EVENTS).toContain('aides.bareme.updated')
    expect(ALL_EVENTS).toContain('ai.transparency.updated')
    expect(ALL_EVENTS).toHaveLength(4)
  })

  it('isValidEvent narrows known event strings', () => {
    expect(isValidEvent('rge.snapshot.refreshed')).toBe(true)
    expect(isValidEvent('aides.bareme.updated')).toBe(true)
  })

  it('isValidEvent rejects unknown strings (no typos, no SQL injection)', () => {
    expect(isValidEvent('rge.snapshot.refresh')).toBe(false)
    expect(isValidEvent('drop table rge_os_webhooks')).toBe(false)
    expect(isValidEvent('')).toBe(false)
    expect(isValidEvent('user.created')).toBe(false)
  })

  it('mockPayloadFor returns a non-empty payload shape per event', () => {
    for (const e of ALL_EVENTS) {
      const payload = mockPayloadFor(e as WebhookEvent)
      expect(payload).toBeTruthy()
      expect(Object.keys(payload).length).toBeGreaterThan(0)
    }
  })

  it('mockPayloadFor produces stable keys per event family', () => {
    const snap = mockPayloadFor('rge.snapshot.refreshed')
    expect(snap).toHaveProperty('snapshot_date')
    expect(snap).toHaveProperty('providers_count')
    const qual = mockPayloadFor('rge.qualification.added')
    expect(qual).toHaveProperty('siret')
    expect(qual).toHaveProperty('qualif_code')
    const bareme = mockPayloadFor('aides.bareme.updated')
    expect(bareme).toHaveProperty('aide')
    expect(bareme).toHaveProperty('version_id')
    const ai = mockPayloadFor('ai.transparency.updated')
    expect(ai).toHaveProperty('version')
    expect(ai).toHaveProperty('change_summary')
  })
})
