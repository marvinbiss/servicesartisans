'use client'

import { useEffect, useRef, ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  /** Semantic HTML tag — 'div' (default) or 'section' */
  as?: 'div' | 'section'
  /** Kept for API compat — ignored (CSS handles animation) */
  delay?: number
  direction?: string
  duration?: number
  distance?: number
}

export function ScrollReveal({
  children,
  className = '',
  as = 'div',
  delay = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Elements already in viewport at mount → reveal immediately
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight) {
      el.classList.add('visible')
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Apply stagger delay if provided
          if (delay > 0) {
            el.style.transitionDelay = `${delay}s`
          }
          el.classList.add('visible')
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  const Component = as === 'section' ? 'section' : 'div'

  return (
    <Component
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`scroll-reveal ${className}`.trim()}
    >
      {children}
    </Component>
  )
}
