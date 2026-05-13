// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildSearchHref,
  buildSearchId,
  clearSavedSearches,
  isSearchSaved,
  loadSavedSearches,
  removeSearch,
  SAVED_SEARCHES_STORAGE_KEY,
  saveSearch,
} from './saved-searches'

describe('saved-searches', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-13T10:00:00Z'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('buildSearchId concatenates the triple', () => {
    expect(buildSearchId('plombier', 'paris', 'rge=1')).toBe('plombier|paris|rge=1')
    expect(buildSearchId('plombier', 'paris')).toBe('plombier|paris|')
  })

  it('buildSearchHref produces a clean canonical URL', () => {
    expect(buildSearchHref({ service: 'plombier', ville: 'paris', filters: '' })).toBe(
      '/services/plombier/paris'
    )
    expect(buildSearchHref({ service: 'plombier', ville: 'paris', filters: 'rge=1' })).toBe(
      '/services/plombier/paris?rge=1'
    )
    expect(buildSearchHref({ service: 'plombier', ville: 'paris', filters: '?rge=1' })).toBe(
      '/services/plombier/paris?rge=1'
    )
  })

  it('saveSearch persists and returns sorted list', () => {
    saveSearch({
      service: 'plombier',
      serviceLabel: 'Plombier',
      ville: 'paris',
      villeLabel: 'Paris',
      filters: '',
    })
    const items = loadSavedSearches()
    expect(items).toHaveLength(1)
    expect(items[0].id).toBe('plombier|paris|')
  })

  it('bumps existing entries instead of duplicating', () => {
    saveSearch({
      service: 'plombier',
      serviceLabel: 'Plombier',
      ville: 'paris',
      villeLabel: 'Paris',
      filters: '',
    })
    vi.advanceTimersByTime(1000)
    saveSearch({
      service: 'electricien',
      serviceLabel: 'Électricien',
      ville: 'paris',
      villeLabel: 'Paris',
      filters: '',
    })
    vi.advanceTimersByTime(1000)
    saveSearch({
      service: 'plombier',
      serviceLabel: 'Plombier',
      ville: 'paris',
      villeLabel: 'Paris',
      filters: '',
    })
    const items = loadSavedSearches()
    expect(items.map((s) => s.service)).toEqual(['plombier', 'electricien'])
  })

  it('isSearchSaved detects an exact triple', () => {
    saveSearch({
      service: 'plombier',
      serviceLabel: 'Plombier',
      ville: 'paris',
      villeLabel: 'Paris',
      filters: 'rge=1',
    })
    expect(isSearchSaved('plombier', 'paris', 'rge=1')).toBe(true)
    expect(isSearchSaved('plombier', 'paris', '')).toBe(false)
    expect(isSearchSaved('electricien', 'paris', 'rge=1')).toBe(false)
  })

  it('caps the list at 10', () => {
    for (let i = 0; i < 15; i++) {
      vi.advanceTimersByTime(1000)
      saveSearch({
        service: `svc-${i}`,
        serviceLabel: `Service ${i}`,
        ville: `ville-${i}`,
        villeLabel: `Ville ${i}`,
        filters: '',
      })
    }
    expect(loadSavedSearches()).toHaveLength(10)
  })

  it('removes a specific search', () => {
    saveSearch({
      service: 'plombier',
      serviceLabel: 'Plombier',
      ville: 'paris',
      villeLabel: 'Paris',
      filters: '',
    })
    vi.advanceTimersByTime(1000)
    saveSearch({
      service: 'electricien',
      serviceLabel: 'Électricien',
      ville: 'paris',
      villeLabel: 'Paris',
      filters: '',
    })
    removeSearch('plombier|paris|')
    const items = loadSavedSearches()
    expect(items.map((s) => s.service)).toEqual(['electricien'])
  })

  it('hydrates legacy entries that lack serviceLabel/villeLabel/filters', () => {
    localStorage.setItem(
      SAVED_SEARCHES_STORAGE_KEY,
      JSON.stringify([{ id: 'plombier|paris|', service: 'plombier', ville: 'paris', savedAt: 1 }])
    )
    const items = loadSavedSearches()
    expect(items[0].serviceLabel).toBe('plombier')
    expect(items[0].villeLabel).toBe('paris')
    expect(items[0].filters).toBe('')
  })

  it('clears the whole list', () => {
    saveSearch({
      service: 'plombier',
      serviceLabel: 'Plombier',
      ville: 'paris',
      villeLabel: 'Paris',
      filters: '',
    })
    clearSavedSearches()
    expect(loadSavedSearches()).toEqual([])
  })
})
