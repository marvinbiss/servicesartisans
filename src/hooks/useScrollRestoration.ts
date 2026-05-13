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
 * after the new layout is painted.
 *
 * Saves are throttled with a 150 ms trailing timer to avoid hammering
 * storage on momentum scrolls, but the timer is **flushed immediately**
 * before any of: a link/button click bubbling up from the panel, a
 * pagehide / visibilitychange:hidden event, or beforeunload. Without
 * the flush, a user who scrolled and then tapped a card in under
 * 150 ms would lose their position on back-nav.
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
    const writeNow = () => {
      try {
        sessionStorage.setItem(storageKey, String(el.scrollTop))
      } catch {
        // ignore
      }
    }
    const flush = () => {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      writeNow()
    }
    const onScroll = () => {
      if (!restored) return
      if (timer) clearTimeout(timer)
      timer = setTimeout(writeNow, 150)
    }
    // Anchor / button clicks inside the panel race the 150 ms timer.
    // Flush in capture phase so we win even if the handler navigates
    // synchronously.
    const onClickCapture = (e: Event) => {
      if (!restored) return
      const target = e.target as Element | null
      if (target && target.closest('a,button')) {
        flush()
      }
    }
    const onPageHide = () => flush()
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush()
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    el.addEventListener('click', onClickCapture, { capture: true })
    window.addEventListener('pagehide', onPageHide)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelAnimationFrame(rafId)
      if (timer) clearTimeout(timer)
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('click', onClickCapture, { capture: true } as EventListenerOptions)
      window.removeEventListener('pagehide', onPageHide)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [ref, storageKey])
}
