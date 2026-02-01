'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'

interface AnimateOnScrollProps {
  children: ReactNode
  className?: string
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom' | 'blur'
  delay?: number
  duration?: number
  threshold?: number
  once?: boolean
}

export default function AnimateOnScroll({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
  duration = 600,
  threshold = 0.1,
  once = true,
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once && ref.current) {
            observer.unobserve(ref.current)
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin: '50px' }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold, once])

  const getAnimationStyles = () => {
    const baseTransform = isVisible ? 'translate3d(0, 0, 0) scale(1)' : ''
    const baseOpacity = isVisible ? 1 : 0
    const baseFilter = isVisible ? 'blur(0)' : ''

    switch (animation) {
      case 'fade-up':
        return {
          transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 40px, 0)',
          opacity: baseOpacity,
        }
      case 'fade-down':
        return {
          transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, -40px, 0)',
          opacity: baseOpacity,
        }
      case 'fade-left':
        return {
          transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(40px, 0, 0)',
          opacity: baseOpacity,
        }
      case 'fade-right':
        return {
          transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(-40px, 0, 0)',
          opacity: baseOpacity,
        }
      case 'zoom':
        return {
          transform: isVisible ? 'scale(1)' : 'scale(0.9)',
          opacity: baseOpacity,
        }
      case 'blur':
        return {
          filter: isVisible ? 'blur(0)' : 'blur(10px)',
          opacity: baseOpacity,
        }
      default:
        return { opacity: baseOpacity }
    }
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...getAnimationStyles(),
        transitionProperty: 'transform, opacity, filter',
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${delay}ms`,
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </div>
  )
}
