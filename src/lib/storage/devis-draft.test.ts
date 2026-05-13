// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import {
  loadDevisDraft,
  saveDevisDraft,
  clearDevisDraft,
  formatDraftSavedAt,
  DEVIS_DRAFT_KEY,
} from './devis-draft'

const DAY = 24 * 60 * 60 * 1000

describe('devis-draft storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('save then load round-trips a valid draft', () => {
    saveDevisDraft({
      formData: { service: 'plombier', ville: 'Lyon' },
      step: 2,
      villeQuery: 'Lyon',
      selectedVillePostal: '69001',
    })
    const draft = loadDevisDraft()
    expect(draft).not.toBeNull()
    expect(draft?.formData.service).toBe('plombier')
    expect(draft?.step).toBe(2)
    expect(typeof draft?.savedAt).toBe('number')
  })

  it('loadDevisDraft returns null on malformed JSON', () => {
    localStorage.setItem(DEVIS_DRAFT_KEY, 'not-json')
    expect(loadDevisDraft()).toBeNull()
  })

  it('loadDevisDraft drops drafts older than 7 days', () => {
    saveDevisDraft({
      formData: { service: 'plombier' },
      step: 1,
      savedAt: Date.now() - 8 * DAY,
    })
    expect(loadDevisDraft()).toBeNull()
    // Stale draft is also pruned from storage
    expect(localStorage.getItem(DEVIS_DRAFT_KEY)).toBeNull()
  })

  it('loadDevisDraft keeps drafts within the 7-day window', () => {
    saveDevisDraft({
      formData: { service: 'plombier' },
      step: 1,
      savedAt: Date.now() - 3 * DAY,
    })
    expect(loadDevisDraft()).not.toBeNull()
  })

  it('loadDevisDraft rejects payloads without savedAt', () => {
    localStorage.setItem(
      DEVIS_DRAFT_KEY,
      JSON.stringify({ formData: { service: 'plombier' }, step: 1 })
    )
    expect(loadDevisDraft()).toBeNull()
  })

  it('loadDevisDraft rejects payloads with invalid step', () => {
    localStorage.setItem(
      DEVIS_DRAFT_KEY,
      JSON.stringify({ formData: {}, step: 99, savedAt: Date.now() })
    )
    expect(loadDevisDraft()).toBeNull()
  })

  it('clearDevisDraft removes the key', () => {
    saveDevisDraft({ formData: {}, step: 1 })
    clearDevisDraft()
    expect(localStorage.getItem(DEVIS_DRAFT_KEY)).toBeNull()
  })
})

describe('formatDraftSavedAt', () => {
  it('returns aujourd’hui when same day', () => {
    const now = new Date('2026-05-13T10:00:00').getTime()
    const saved = new Date('2026-05-13T09:14:00').getTime()
    expect(formatDraftSavedAt(saved, now)).toBe(`aujourd'hui à 09:14`)
  })

  it('returns hier when previous day', () => {
    const now = new Date('2026-05-13T10:00:00').getTime()
    const saved = new Date('2026-05-12T19:14:00').getTime()
    expect(formatDraftSavedAt(saved, now)).toBe('hier à 19:14')
  })

  it('returns dated form otherwise', () => {
    const now = new Date('2026-05-13T10:00:00').getTime()
    const saved = new Date('2026-05-10T19:14:00').getTime()
    expect(formatDraftSavedAt(saved, now)).toBe('le 10/05 à 19:14')
  })
})
