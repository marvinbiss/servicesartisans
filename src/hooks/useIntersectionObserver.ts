'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  freezeOnceVisible?: boolean
}

/**
 * Hook for lazy loading and intersection detection
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<HTMLDivElement>, boolean] {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
  } = options

  const elementRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  const frozen = isVisible && freezeOnceVisible

  useEffect(() => {
    const element = elementRef.current
    if (!element || frozen) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold, root, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, root, rootMargin, frozen])

  return [elementRef, isVisible]
}

/**
 * Hook for infinite scrolling
 */
export function useInfiniteScroll(
  callback: () => void,
  options: { threshold?: number; enabled?: boolean } = {}
) {
  const { threshold = 100, enabled = true } = options
  const observerRef = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && enabled) {
        callback()
      }
    },
    [callback, enabled]
  )

  useEffect(() => {
    const element = observerRef.current
    if (!element || !enabled) return

    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: `${threshold}px`,
    })

    observer.observe(element)

    return () => observer.disconnect()
  }, [handleObserver, threshold, enabled])

  return observerRef
}

/**
 * Hook for lazy loading images
 */
export function useLazyLoad(): [React.RefObject<HTMLImageElement>, boolean] {
  const imageRef = useRef<HTMLImageElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const image = imageRef.current
    if (!image) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const src = image.dataset.src
          if (src) {
            image.src = src
            image.onload = () => setIsLoaded(true)
          }
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(image)

    return () => observer.disconnect()
  }, [])

  return [imageRef, isLoaded]
}
