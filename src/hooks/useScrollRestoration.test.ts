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

  it('flushes immediately on click inside the panel (beats 150 ms timer)', async () => {
    vi.useFakeTimers()
    const el = document.createElement('div')
    Object.defineProperty(el, 'scrollTop', { value: 0, writable: true })
    const anchor = document.createElement('a')
    anchor.href = '#x'
    el.appendChild(anchor)
    document.body.appendChild(el)

    renderWith(el, 'sa:listing-scroll:/flush')
    await vi.advanceTimersByTimeAsync(20)

    // Simulate fast scroll → click in under 150 ms
    el.scrollTop = 250
    el.dispatchEvent(new Event('scroll'))
    // Click bubbles up through the panel before the trailing timer fires
    anchor.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    // Without flush the value would still be null at this point. With flush
    // it's already persisted.
    expect(sessionStorage.getItem('sa:listing-scroll:/flush')).toBe('250')
    document.body.removeChild(el)
  })

  it('flushes on visibilitychange→hidden', async () => {
    vi.useFakeTimers()
    const el = document.createElement('div')
    Object.defineProperty(el, 'scrollTop', { value: 0, writable: true })
    document.body.appendChild(el)

    renderWith(el, 'sa:listing-scroll:/vis')
    await vi.advanceTimersByTimeAsync(20)

    el.scrollTop = 99
    el.dispatchEvent(new Event('scroll'))
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))

    expect(sessionStorage.getItem('sa:listing-scroll:/vis')).toBe('99')
    document.body.removeChild(el)
  })
})
