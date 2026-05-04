// Thin PostHog wrapper. Safe to import anywhere — all calls are no-op until
// the browser client is initialized by PostHogProvider (client component) AND
// the user has granted analytics consent (RGPD).
//
// Catalogue étendu B/C #5 (audit 2026-05-04) : ajout des events nécessaires
// pour reconstruire les funnels complets côté GTM/GA4/PostHog. La règle
// "signal, not volume" reste — chaque event est typé, déduplique au backend.

import type { PostHog } from 'posthog-js'

export const EVENT = {
  // Devis funnel
  DEVIS_STARTED: 'devis_started',
  DEVIS_STEP_COMPLETED: 'devis_step_completed',
  DEVIS_SUBMITTED: 'devis_submitted',
  DEVIS_FAILED: 'devis_failed',
  // Simulateur funnel
  SIMULATEUR_STARTED: 'simulateur_started',
  SIMULATEUR_STEP_COMPLETED: 'simulateur_step_completed',
  SIMULATEUR_STEP_DROPPED: 'simulateur_step_dropped',
  SIMULATEUR_SUBMITTED: 'simulateur_submitted',
  // Artisan claim
  ARTISAN_CLAIM_STARTED: 'artisan_claim_started',
  ARTISAN_CLAIM_SUCCEEDED: 'artisan_claim_succeeded',
  ARTISAN_CLAIM_COMPLETED_ADMIN: 'artisan_claim_completed_admin_approved',
  // Partenariat CEE B2B
  PARTNER_CEE_PAGE_VIEWED: 'partner_cee_page_viewed',
  PARTNER_CEE_STARTED: 'partner_cee_started',
  PARTNER_CEE_SUBMITTED: 'partner_cee_submitted',
  // Phone reveal (artisan claimed)
  PHONE_REVEALED: 'phone_revealed',
  // Lead dispatch
  LEAD_DISPATCHED_NO_ARTISAN: 'lead_dispatched_no_artisan',
  // Search
  SEARCH_PERFORMED: 'search_performed',
} as const

export type EventName = (typeof EVENT)[keyof typeof EVENT]

function getClient(): PostHog | null {
  if (typeof window === 'undefined') return null
  const ph = (window as unknown as { posthog?: PostHog }).posthog
  if (!ph || typeof ph.capture !== 'function') return null
  return ph
}

export function capture(name: EventName, properties?: Record<string, unknown>): void {
  try {
    const ph = getClient()
    if (!ph) return
    ph.capture(name, properties)
  } catch {
    // Analytics must never break the product
  }
}

export function identify(distinctId: string, properties?: Record<string, unknown>): void {
  try {
    const ph = getClient()
    if (!ph) return
    ph.identify(distinctId, properties)
  } catch {
    // ignore
  }
}

export function reset(): void {
  try {
    const ph = getClient()
    if (!ph) return
    ph.reset()
  } catch {
    // ignore
  }
}
