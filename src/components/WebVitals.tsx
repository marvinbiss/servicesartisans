'use client'

import { useReportWebVitals } from 'next/web-vitals'

/**
 * Reports Core Web Vitals (LCP, CLS, INP, FCP, TTFB) to Google Analytics 4.
 * Must be rendered once in the root layout.
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to GA4 (already configured via GoogleAnalytics component)
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const w = window as typeof window & { gtag: (...args: unknown[]) => void }
      w.gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true,
      })
    }
  })

  return null
}
