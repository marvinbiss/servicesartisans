'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getSessionId } from '@/lib/analytics/tracking'
import { getVisitorId } from '@/lib/analytics/visitor'

/**
 * Check if the user has accepted analytics cookies.
 * Reads from localStorage (set by the CookieConsent banner).
 */
function hasAnalyticsConsent(): boolean {
  try {
    const raw = window.localStorage.getItem('cookie_preferences')
    if (!raw) return false
    const parsed = JSON.parse(raw) as { analytics?: boolean }
    return parsed.analytics === true
  } catch {
    return false
  }
}

/**
 * Tracks page views on every client-side navigation.
 * Mounted once in RootLayout via dynamic import (ssr: false).
 *
 * RGPD/CNIL compliance:
 * - NO tracking data is sent without explicit analytics consent
 * - NO cookies are set without consent (getVisitorId() also checks)
 * - Listens for consent changes via 'cookie-preferences-updated' event
 *
 * Sends to /api/analytics with:
 * - visitor_id: persistent anonymous UUID (cookie, 13 months)
 * - session_id: per-tab session (sessionStorage)
 * - page_path: current pathname
 *
 * Skips admin and private pages.
 */
export default function PageViewTracker() {
  const pathname = usePathname()
  const lastTracked = useRef<string>('')
  const [consentGiven, setConsentGiven] = useState(() => {
    if (typeof window === 'undefined') return false
    return hasAnalyticsConsent()
  })

  // Listen for consent changes (user accepts/revokes analytics via cookie banner)
  useEffect(() => {
    function onConsentUpdate() {
      setConsentGiven(hasAnalyticsConsent())
    }

    window.addEventListener('cookie-preferences-updated', onConsentUpdate)
    return () => {
      window.removeEventListener('cookie-preferences-updated', onConsentUpdate)
    }
  }, [])

  useEffect(() => {
    // RGPD: never track without explicit analytics consent
    if (!consentGiven) return

    // Avoid duplicate tracking (React strict mode, same page)
    if (pathname === lastTracked.current) return
    lastTracked.current = pathname

    // Don't track admin or private pages
    if (pathname.startsWith('/admin') || pathname.startsWith('/espace-')) return

    // Defer to let Next.js update document.title before capturing it
    const timer = setTimeout(() => {
      const data = {
        event: 'page_view' as const,
        properties: {
          page_path: pathname,
          url: window.location.href,
          referrer: document.referrer,
          title: document.title,
          screenSize: `${window.innerWidth}x${window.innerHeight}`,
        },
        sessionId: getSessionId(),
        visitorId: getVisitorId(),
      }

      // Send page_view to GA4 via gtag (single source of truth — no dataLayer push
      // to avoid double-counting if GTM also has a GA4 tag)
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'page_view', {
          page_path: pathname,
          page_title: document.title,
          page_location: window.location.href,
        })
      }

      // Send to custom analytics backend
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/analytics', JSON.stringify(data))
        } else {
          fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            keepalive: true,
          })
        }
      } catch {
        // Silent failure — analytics should never break the app
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [pathname, consentGiven])

  return null
}
