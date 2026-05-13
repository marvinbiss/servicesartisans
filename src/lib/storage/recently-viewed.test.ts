// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearRecentlyViewed,
  loadRecentlyViewed,
  RECENTLY_VIEWED_STORAGE_KEY,
  trackProviderView,
} from './recently-viewed'

describe('recently-viewed', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-13T10:00:00Z'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts empty', () => {
    expect(loadRecentlyViewed()).toEqual([])
  })

  it('appends and reads back a single item', () => {
    trackProviderView({ id: 'a', name: 'Alpha', href: '/services/plombier/paris/a' })
    const items = loadRecentlyViewed()
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      id: 'a',
      name: 'Alpha',
      href: '/services/plombier/paris/a',
    })
    expect(items[0].viewedAt).toBe(Date.parse('2026-05-13T10:00:00Z'))
  })

  it('places the most recent view at the front (LRU)', () => {
    trackProviderView({ id: 'a', name: 'Alpha', href: '/a' })
    vi.advanceTimersByTime(1000)
    trackProviderView({ id: 'b', name: 'Bravo', href: '/b' })
    vi.advanceTimersByTime(1000)
    trackProviderView({ id: 'c', name: 'Charlie', href: '/c' })
    const items = loadRecentlyViewed()
    expect(items.map((i) => i.id)).toEqual(['c', 'b', 'a'])
  })

  it('bumps an existing id back to the front instead of duplicating', () => {
    trackProviderView({ id: 'a', name: 'Alpha', href: '/a' })
    vi.advanceTimersByTime(1000)
    trackProviderView({ id: 'b', name: 'Bravo', href: '/b' })
    vi.advanceTimersByTime(1000)
    trackProviderView({ id: 'a', name: 'Alpha v2', href: '/a' })
    const items = loadRecentlyViewed()
    expect(items.map((i) => i.id)).toEqual(['a', 'b'])
    expect(items[0].name).toBe('Alpha v2')
  })

  it('caps the list at 10', () => {
    for (let i = 0; i < 15; i++) {
      vi.advanceTimersByTime(1000)
      trackProviderView({ id: `id-${i}`, name: `Provider ${i}`, href: `/p/${i}` })
    }
    const items = loadRecentlyViewed()
    expect(items).toHaveLength(10)
    expect(items[0].id).toBe('id-14') // freshest first
  })

  it('drops items older than the 30-day TTL', () => {
    trackProviderView({ id: 'old', name: 'Old', href: '/old' })
    vi.advanceTimersByTime(31 * 24 * 60 * 60 * 1000)
    trackProviderView({ id: 'new', name: 'New', href: '/new' })
    const items = loadRecentlyViewed()
    expect(items.map((i) => i.id)).toEqual(['new'])
  })

  it('ignores malformed JSON', () => {
    localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, '{not json')
    expect(loadRecentlyViewed()).toEqual([])
  })

  it('filters out items missing required fields', () => {
    localStorage.setItem(
      RECENTLY_VIEWED_STORAGE_KEY,
      JSON.stringify([
        { id: 'ok', name: 'OK', href: '/ok', viewedAt: Date.now() },
        { id: 'bad', name: 'Bad' }, // missing href + viewedAt
      ])
    )
    const items = loadRecentlyViewed()
    expect(items.map((i) => i.id)).toEqual(['ok'])
  })

  it('refuses to track without a stable id', () => {
    trackProviderView({ id: '', name: 'Whatever', href: '/x' })
    expect(loadRecentlyViewed()).toEqual([])
  })

  it('clears the history', () => {
    trackProviderView({ id: 'a', name: 'Alpha', href: '/a' })
    clearRecentlyViewed()
    expect(loadRecentlyViewed()).toEqual([])
  })
})
