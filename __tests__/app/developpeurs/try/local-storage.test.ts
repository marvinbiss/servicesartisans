/**
 * Tests — `_local-storage.ts` (Ralph 40).
 *
 * Validates the in-browser request history persistence helpers using a
 * tiny in-memory `Storage` shim so the test runs in the default `node`
 * environment without spinning up jsdom.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  clearHistory,
  loadHistory,
  pushHistory,
} from '@/app/(public)/developpeurs/try/_local-storage'
import type { HistoryEntry } from '@/app/(public)/developpeurs/try/_types'

class MemoryStorage implements Storage {
  private map = new Map<string, string>()
  get length() {
    return this.map.size
  }
  key(i: number): string | null {
    return Array.from(this.map.keys())[i] ?? null
  }
  getItem(k: string): string | null {
    return this.map.get(k) ?? null
  }
  setItem(k: string, v: string): void {
    this.map.set(k, v)
  }
  removeItem(k: string): void {
    this.map.delete(k)
  }
  clear(): void {
    this.map.clear()
  }
}

function entry(overrides: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    ts: Date.now(),
    opId: 'op',
    method: 'GET',
    url: 'https://example.com/r',
    status: 200,
    durationMs: 1,
    responseExcerpt: '{}',
    ...overrides,
  }
}

describe('localStorage history', () => {
  let storage: MemoryStorage

  beforeEach(() => {
    storage = new MemoryStorage()
  })

  it('loadHistory returns [] on empty storage', () => {
    expect(loadHistory(storage)).toEqual([])
  })

  it('pushHistory then loadHistory returns the entry', () => {
    const e = entry({ ts: 1 })
    pushHistory(e, storage)
    const got = loadHistory(storage)
    expect(got).toHaveLength(1)
    expect(got[0]?.ts).toBe(1)
  })

  it('pushHistory caps at MAX = 20 entries with newest first', () => {
    for (let i = 0; i < 30; i++) pushHistory(entry({ ts: i }), storage)
    const got = loadHistory(storage)
    expect(got).toHaveLength(20)
    expect(got[0]?.ts).toBe(29)
    expect(got[19]?.ts).toBe(10)
  })

  it('clearHistory empties the storage', () => {
    pushHistory(entry(), storage)
    clearHistory(storage)
    expect(loadHistory(storage)).toEqual([])
  })

  it('loadHistory returns [] when raw is corrupt JSON', () => {
    storage.setItem('sa-try-history-v1', '{not json}')
    expect(loadHistory(storage)).toEqual([])
  })

  it('loadHistory returns [] when raw is a non-array', () => {
    storage.setItem('sa-try-history-v1', '{"oops": true}')
    expect(loadHistory(storage)).toEqual([])
  })

  it('loadHistory drops malformed entries from a valid array', () => {
    storage.setItem('sa-try-history-v1', JSON.stringify([entry({ ts: 1 }), { ts: 'oops' }, null]))
    const got = loadHistory(storage)
    expect(got).toHaveLength(1)
    expect(got[0]?.ts).toBe(1)
  })

  it('returns [] when storage is null (SSR)', () => {
    expect(loadHistory(null)).toEqual([])
    pushHistory(entry(), null)
    clearHistory(null)
  })
})
