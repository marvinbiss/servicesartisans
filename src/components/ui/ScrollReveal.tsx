'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number // delay in ms (0, 100, 200, 300...)
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  duration?: number // ms
  once?: boolean // animate only once (default true)
}

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 600,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) observer.unobserve(element)
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [once])

  const getTransform = () => {
    if (direction === 'up') return 'translateY(24px)'
    if (direction === 'down') return 'translateY(-24px)'
    if (direction === 'left') return 'translateX(24px)'
    if (direction === 'right') return 'translateX(-24px)'
    return 'none'
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : getTransform(),
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// Staggered children wrapper - each child gets incrementing delay
interface StaggerProps {
  children: ReactNode[]
  className?: string
  staggerDelay?: number // ms between each child
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  duration?: number
}

export function ScrollStagger({
  children,
  className = '',
  staggerDelay = 100,
  direction = 'up',
  duration = 500,
}: StaggerProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <ScrollReveal
          key={index}
          delay={index * staggerDelay}
          direction={direction}
          duration={duration}
        >
          {child}
        </ScrollReveal>
      ))}
    </div>
  )
}
