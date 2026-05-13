'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

/**
 * Floating "back to top" affordance for long pages (guides, RGE
 * directory hubs, blog posts). Materializes only after the user has
 * scrolled past one viewport so it doesn't compete with hero CTAs.
 *
 * - hidden until scrollY > window.innerHeight (≈ one screen)
 * - prefers-reduced-motion: jumps instantly via "auto" behavior
 * - on click sends focus to <body> first then scrolls so keyboard
 *   users restart their Tab walk from the top instead of being left
 *   at the bottom of the page
 */
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const threshold = window.innerHeight
      setVisible(window.scrollY > threshold)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleClick = useCallback(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
    // Send focus to <main> if present so the next Tab restarts there,
    // otherwise fall back to document.body. Without this, focus stays
    // on the now-off-screen button and Tab continues from there.
    const main = document.querySelector('main') as HTMLElement | null
    const target = main ?? document.body
    target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  }, [])

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Remonter en haut de la page"
      className={`
        fixed bottom-24 right-4 md:bottom-8 md:right-8 z-40
        w-11 h-11 rounded-full bg-white border border-sand-300 shadow-lg
        flex items-center justify-center text-charcoal-700 hover:text-primary-500 hover:bg-primary-50
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2
        transition-all duration-200
        motion-reduce:transition-none
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
      `}
    >
      <ArrowUp className="w-5 h-5" aria-hidden="true" />
    </button>
  )
}
