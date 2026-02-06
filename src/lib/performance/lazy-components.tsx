'use client'

/**
 * Lazy Loading Components for Performance Optimization
 * Code splitting and dynamic imports
 */

import dynamic from 'next/dynamic'
import { ComponentType, ReactNode } from 'react'

// Loading fallback component
function LoadingFallback({ height = '200px' }: { height?: string }) {
  return (
    <div
      className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
      style={{ minHeight: height }}
    >
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// Skeleton loader for cards
function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
      </div>
    </div>
  )
}

// Lazy load heavy components
export const LazyMap = dynamic(
  () => import('@/components/Map').then(mod => mod.default),
  {
    loading: () => <LoadingFallback height="400px" />,
    ssr: false, // Map doesn't work with SSR
  }
)

export const LazyBookingCalendar = dynamic(
  () => import('@/components/BookingCalendar').then(mod => mod.default),
  {
    loading: () => <LoadingFallback height="500px" />,
  }
)

export const LazyBookingCalendarPro = dynamic(
  () => import('@/components/BookingCalendarPro').then(mod => mod.default),
  {
    loading: () => <LoadingFallback height="600px" />,
  }
)

export const LazyChatWindow = dynamic(
  () => import('@/components/chat/ChatWindow').then(mod => mod.default),
  {
    loading: () => <LoadingFallback height="500px" />,
  }
)

export const LazyReviewsSection = dynamic(
  () => import('@/components/ReviewsSection').then(mod => mod.default),
  {
    loading: () => (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    ),
  }
)

export const LazyPaymentForm = dynamic(
  () => import('@/components/PaymentForm').then(mod => mod.default),
  {
    loading: () => <LoadingFallback height="300px" />,
  }
)

/**
 * Higher-order component for lazy loading with intersection observer
 */
export function withLazyLoad<P extends object>(
  Component: ComponentType<P>,
  fallback?: ReactNode
) {
  return dynamic(() => Promise.resolve(Component), {
    loading: () => <>{fallback || <LoadingFallback />}</>,
  })
}

/**
 * Lazy load component only when visible
 */
export function LazyOnVisible({
  children,
  fallback = <LoadingFallback />,
  rootMargin = '100px',
}: {
  children: ReactNode
  fallback?: ReactNode
  rootMargin?: string
}) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [rootMargin])

  return <div ref={ref}>{isVisible ? children : fallback}</div>
}

// Need to import these
import { useState, useEffect, useRef } from 'react'
