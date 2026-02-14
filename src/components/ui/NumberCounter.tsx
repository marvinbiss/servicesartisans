'use client'

import { useEffect, useRef, useState } from 'react'

interface NumberCounterProps {
  end: number
  suffix?: string
  prefix?: string
  duration?: number
  className?: string
}

/**
 * Animated number counter that triggers on scroll into view.
 * Uses IntersectionObserver for efficient viewport detection.
 * Respects prefers-reduced-motion — skips animation entirely.
 * Ease-out cubic curve for a natural deceleration feel.
 */
export function NumberCounter({ end, suffix = '', prefix = '', duration = 1500, className = '' }: NumberCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setCount(end)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          const startTime = performance.now()
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(eased * end))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [end, duration, hasAnimated])

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString('fr-FR')}{suffix}
    </span>
  )
}
