// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import type { CompareProvider } from '@/components/compare/CompareProvider'
import {
  loadCompareList,
  saveCompareList,
  buildCompareShareUrl,
  compareShareId,
  COMPARE_STORAGE_KEY,
} from './compare-store'

function fakeProvider(id: string, stableId?: string): CompareProvider {
  return {
    id,
    name: `Artisan ${id}`,
    slug: `artisan-${id}`,
    ...(stableId ? { stable_id: stableId } : {}),
  }
}

describe('compare-store', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('save then load round-trips a non-empty list', () => {
    const list = [fakeProvider('a', 'A1'), fakeProvider('b')]
    saveCompareList(list)
    expect(loadCompareList()).toEqual(list)
  })

  it('saving an empty list removes the key', () => {
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify([fakeProvider('a')]))
    saveCompareList([])
    expect(localStorage.getItem(COMPARE_STORAGE_KEY)).toBeNull()
  })

  it('caps stored list at 3', () => {
    const list = ['a', 'b', 'c', 'd', 'e'].map((id) => fakeProvider(id))
    saveCompareList(list)
    expect(loadCompareList()).toHaveLength(3)
  })

  it('loadCompareList returns [] on malformed JSON', () => {
    localStorage.setItem(COMPARE_STORAGE_KEY, 'not-json')
    expect(loadCompareList()).toEqual([])
  })

  it('loadCompareList returns [] when stored value is an object (corrupt)', () => {
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify({ foo: 'bar' }))
    expect(loadCompareList()).toEqual([])
  })

  it('loadCompareList filters out entries without an id', () => {
    localStorage.setItem(
      COMPARE_STORAGE_KEY,
      JSON.stringify([{ id: 'a', name: 'A' }, { name: 'orphan' }, null])
    )
    expect(loadCompareList()).toHaveLength(1)
    expect(loadCompareList()[0].id).toBe('a')
  })

  it('compareShareId prefers stable_id over id', () => {
    expect(compareShareId({ id: 'uuid-1', stable_id: 'STABLE-1' })).toBe('STABLE-1')
    expect(compareShareId({ id: 'uuid-1' })).toBe('uuid-1')
  })

  it('buildCompareShareUrl assembles /comparer?ids=… url', () => {
    const list = [fakeProvider('a', 'A1'), fakeProvider('b')]
    const url = buildCompareShareUrl(list, 'https://servicesartisans.fr')
    expect(url).toBe('https://servicesartisans.fr/comparer?ids=A1%2Cb')
  })

  it('buildCompareShareUrl caps to 3 ids', () => {
    const list = ['a', 'b', 'c', 'd'].map((id) => fakeProvider(id))
    const url = buildCompareShareUrl(list, 'https://x.fr')
    const ids = decodeURIComponent(url.split('ids=')[1])
    expect(ids.split(',')).toHaveLength(3)
  })
})
