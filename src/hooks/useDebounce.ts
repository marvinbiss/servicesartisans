'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Hook to debounce a value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook to debounce a callback
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number = 300
): T {
  const timeoutRef = useRef<NodeJS.Timeout>()

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  ) as T

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

/**
 * Hook to throttle a callback
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  limit: number = 300
): T {
  const inThrottleRef = useRef(false)
  const lastArgsRef = useRef<Parameters<T>>()

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      lastArgsRef.current = args

      if (!inThrottleRef.current) {
        callback(...args)
        inThrottleRef.current = true

        setTimeout(() => {
          inThrottleRef.current = false
          if (lastArgsRef.current !== args) {
            callback(...lastArgsRef.current!)
          }
        }, limit)
      }
    },
    [callback, limit]
  ) as T

  return throttledCallback
}
