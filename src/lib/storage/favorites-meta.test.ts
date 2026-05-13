// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import {
  setFavoriteMeta,
  removeFavoriteMeta,
  loadFavoritesMeta,
  clearFavoritesMeta,
  FAVORITES_META_STORAGE_KEY,
} from './favorites-meta'

describe('favorites-meta storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('setFavoriteMeta writes an item with savedAt timestamp', () => {
    setFavoriteMeta({
      id: 'p1',
      name: 'Plomberie A',
      slug: 'plomberie-a',
      specialty: 'Plombier',
      city: 'Lyon',
      href: '/artisan/p1',
    })
    const map = loadFavoritesMeta()
    expect(map.p1.name).toBe('Plomberie A')
    expect(typeof map.p1.savedAt).toBe('number')
  })

  it('removeFavoriteMeta drops a single entry', () => {
    setFavoriteMeta({ id: 'a', name: 'A', slug: null, specialty: null, city: null, href: '/a' })
    setFavoriteMeta({ id: 'b', name: 'B', slug: null, specialty: null, city: null, href: '/b' })
    removeFavoriteMeta('a')
    const map = loadFavoritesMeta()
    expect(map.a).toBeUndefined()
    expect(map.b).toBeDefined()
  })

  it('clearFavoritesMeta wipes everything', () => {
    setFavoriteMeta({ id: 'a', name: 'A', slug: null, specialty: null, city: null, href: '/a' })
    clearFavoritesMeta()
    expect(loadFavoritesMeta()).toEqual({})
  })

  it('loadFavoritesMeta returns {} on malformed JSON', () => {
    localStorage.setItem(FAVORITES_META_STORAGE_KEY, 'not-json')
    expect(loadFavoritesMeta()).toEqual({})
  })

  it('loadFavoritesMeta returns {} when stored value is an array (corrupt)', () => {
    localStorage.setItem(FAVORITES_META_STORAGE_KEY, JSON.stringify([1, 2]))
    expect(loadFavoritesMeta()).toEqual({})
  })

  it('setFavoriteMeta with empty id is a no-op', () => {
    setFavoriteMeta({ id: '', name: 'X', slug: null, specialty: null, city: null, href: '/x' })
    expect(loadFavoritesMeta()).toEqual({})
  })
})
