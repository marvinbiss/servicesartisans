// @vitest-environment jsdom
import { renderHook } from '@testing-library/react'
import { useRef } from 'react'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { useScrollRestoration } from './useScrollRestoration'

describe('useScrollRestoration', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.useRealTimers()
  })

  function renderWith(initial: HTMLDivElement | null, storageKey: string) {
    return renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(initial)
      useScrollRestoration(ref, storageKey)
      return ref
    })
  }

  it('writes scrollTop to sessionStorage on scroll (throttled)', async () => {
    vi.useFakeTimers()
    const el = document.createElement('div')
    Object.defineProperty(el, 'scrollTop', { value: 0, writable: true })

    renderWith(el, 'sa:listing-scroll:/services/plombier/paris')

    // Let the rAF tick fire so the restore path runs (no-op, but flips the
    // restored flag inside the hook).
    await vi.advanceTimersByTimeAsync(20)

    el.scrollTop = 420
    el.dispatchEvent(new Event('scroll'))

    // Trailing 150 ms timer has not fired yet
    expect(sessionStorage.getItem('sa:listing-scroll:/services/plombier/paris')).toBeNull()

    await vi.advanceTimersByTimeAsync(160)
    expect(sessionStorage.getItem('sa:listing-scroll:/services/plombier/paris')).toBe('420')
  })

  it('restores scrollTop from sessionStorage on mount', async () => {
    vi.useFakeTimers()
    sessionStorage.setItem('sa:listing-scroll:/villes/lyon', '300')
    const el = document.createElement('div')
    Object.defineProperty(el, 'scrollTop', { value: 0, writable: true })

    renderWith(el, 'sa:listing-scroll:/villes/lyon')
    await vi.advanceTimersByTimeAsync(20)

    expect(el.scrollTop).toBe(300)
  })

  it('does nothing when ref is null', async () => {
    vi.useFakeTimers()
    sessionStorage.setItem('sa:listing-scroll:/x', '500')
    renderWith(null, 'sa:listing-scroll:/x')
    await vi.advanceTimersByTimeAsync(20)
    // No error and no write — storage untouched
    expect(sessionStorage.getItem('sa:listing-scroll:/x')).toBe('500')
  })

  it('ignores malformed stored value', async () => {
    vi.useFakeTimers()
    sessionStorage.setItem('sa:listing-scroll:/x', 'not-a-number')
    const el = document.createElement('div')
    Object.defineProperty(el, 'scrollTop', { value: 0, writable: true })
    renderWith(el, 'sa:listing-scroll:/x')
    await vi.advanceTimersByTimeAsync(20)
    expect(el.scrollTop).toBe(0)
  })
})
