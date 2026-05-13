'use client'

import { useEffect } from 'react'

/**
 * Persist + restore the scrollTop of a scrollable container across
 * client-side navigation.
 *
 * Next.js App Router resets window scroll between pages, but inner
 * `overflow-y-auto` panels keep no memory of their own. When a user
 * scrolls through 50 artisans, taps one, then back-navigates, the list
 * jumps back to the top — the consultation context evaporates.
 *
 * The hook writes the live `scrollTop` to sessionStorage (cheap, scoped
 * to the tab session) under a route-derived key, and reads it back on
 * mount inside a `requestAnimationFrame` so the restoration happens
 * after the new layout is painted. Writes are throttled with a 150 ms
 * trailing timer so a fast scroll doesn't hammer storage.
 */
export function useScrollRestoration(
  ref: React.RefObject<HTMLElement | null>,
  storageKey: string
): void {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const el = ref.current
    if (!el) return

    // Restore — wait one frame so the children are laid out and
    // scrollHeight is accurate; without rAF the assignment is clamped.
    let restored = false
    const rafId = requestAnimationFrame(() => {
      try {
        const stored = sessionStorage.getItem(storageKey)
        if (stored !== null) {
          const top = Number(stored)
          if (Number.isFinite(top) && top > 0) {
            el.scrollTop = top
          }
        }
      } catch {
        // sessionStorage unavailable — ignore
      } finally {
        restored = true
      }
    })

    let timer: ReturnType<typeof setTimeout> | null = null
    const onScroll = () => {
      if (!restored) return
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        try {
          sessionStorage.setItem(storageKey, String(el.scrollTop))
        } catch {
          // ignore
        }
      }, 150)
    }
    el.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      cancelAnimationFrame(rafId)
      if (timer) clearTimeout(timer)
      el.removeEventListener('scroll', onScroll)
    }
  }, [ref, storageKey])
}
