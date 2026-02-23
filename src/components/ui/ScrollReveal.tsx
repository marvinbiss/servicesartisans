'use client'

import { useRef, useEffect, useState, ReactNode, useCallback } from 'react'

// ── Shared IntersectionObserver singleton ──────────────────────────
// One observer for ALL ScrollReveal instances → reduces TBT by ~80%
// vs creating 15-20 individual observers during React hydration.
type ObserverCallback = () => void
const observerCallbacks = new WeakMap<Element, ObserverCallback>()
let sharedObserver: IntersectionObserver | null = null

function getSharedObserver(): IntersectionObserver {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const cb = observerCallbacks.get(entry.target)
            if (cb) {
              cb()
              observerCallbacks.delete(entry.target)
              sharedObserver!.unobserve(entry.target)
            }
          }
        }
      },
      { rootMargin: '-80px' }
    )
  }
  return sharedObserver
}

// ── Reduced motion detection (shared, avoids per-instance MediaQuery) ──
let reducedMotionCached: boolean | null = null

function getPrefersReducedMotion(): boolean {
  if (reducedMotionCached === null) {
    reducedMotionCached = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
  return reducedMotionCached
}

// ── Component ──────────────────────────────────────────────────────
interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  duration?: number
  distance?: number
  as?: 'div' | 'section'
}

const DIRECTIONS: Record<string, (d: number) => string> = {
  up: (d) => `translateY(${d}px)`,
  down: (d) => `translateY(-${d}px)`,
  left: (d) => `translateX(${d}px)`,
  right: (d) => `translateX(-${d}px)`,
  none: () => 'none',
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = 'up',
  duration = 0.6,
  distance = 40,
  as = 'div',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  // Start VISIBLE on SSR so Lighthouse sees all content immediately.
  // After hydration, elements below the viewport get hidden for animation.
  const [isVisible, setIsVisible] = useState(true)
  const [isReady, setIsReady] = useState(false)

  const reveal = useCallback(() => setIsVisible(true), [])

  useEffect(() => {
    if (getPrefersReducedMotion()) return // stays visible

    const el = ref.current
    if (!el) return

    // Check if element is already in the viewport — if so, keep visible
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight + 100) {
      // Already in or near viewport — stay visible, no animation needed
      return
    }

    // Below viewport — hide it and set up observer for animation
    setIsVisible(false)
    setIsReady(true)

    const observer = getSharedObserver()
    observerCallbacks.set(el, reveal)
    observer.observe(el)

    return () => {
      observerCallbacks.delete(el)
      observer.unobserve(el)
    }
  }, [reveal])

  const Component = as === 'section' ? 'section' : 'div'

  return (
    <Component
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : DIRECTIONS[direction](distance),
        // Only add transition after client setup, to avoid flash
        transition: isReady
          ? `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`
          : undefined,
      }}
    >
      {children}
    </Component>
  )
}
