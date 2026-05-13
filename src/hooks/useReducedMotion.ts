'use client'

import { useEffect, useState } from 'react'

/**
 * `useReducedMotion()` — returns true if the user has asked the OS to reduce
 * motion (WCAG 2.3.3 / "prefers-reduced-motion: reduce").
 *
 * Use to swap `behavior: 'smooth'` for `'auto'`, skip parallax / spring
 * animations, or drop heavy framer-motion enter transitions. The global CSS
 * rule in `globals.css` already kills `transition-*` durations, but
 * JS-driven scrolls and Web Animations API calls are not covered there.
 */
const QUERY = '(prefers-reduced-motion: reduce)'

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia?.(QUERY)?.matches ?? false
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia(QUERY)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    // Safari < 14 ne supporte que addListener (deprecated). Garde-fou.
    if ('addEventListener' in mql) {
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(mql as any).addListener(onChange)
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(mql as any).removeListener(onChange)
    }
  }, [])

  return reduced
}
