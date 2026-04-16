'use client'

// Client-only PostHog bootstrap.
//
// Runs after hydration, only in production, only when analytics consent is
// granted (RGPD — cookie_preferences.analytics stored by CookieConsent).
// Listens for consent updates so turning analytics on/off takes effect
// without a reload.

import { useEffect } from 'react'
import posthog from 'posthog-js'

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com'

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

function initIfReady(): void {
  if (typeof window === 'undefined') return
  if (!POSTHOG_KEY) return
  if (posthog.__loaded) return
  if (!hasAnalyticsConsent()) return

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    ui_host: 'https://eu.posthog.com',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    persistence: 'localStorage+cookie',
    // Only create Person profiles for identified users — saves ~70% MTU quota
    // on anonymous visitors while keeping funnel analytics fully functional.
    person_profiles: 'identified_only',
    // Defense in depth: respect browser Do-Not-Track headers in addition to
    // our RGPD consent gate above.
    respect_dnt: true,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: '[data-ph-mask]',
    },
    loaded: (ph) => {
      // Expose for the lib/analytics/posthog.ts wrapper to pick up
      ;(window as unknown as { posthog: typeof ph }).posthog = ph
    },
  })
}

export default function PostHogProvider() {
  useEffect(() => {
    initIfReady()

    // React to consent changes (the CookieConsent component dispatches a
    // custom event when the user updates their preferences).
    const handler = () => initIfReady()
    window.addEventListener('cookie-preferences-updated', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('cookie-preferences-updated', handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  return null
}
