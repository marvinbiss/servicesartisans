/**
 * Helpers de tracking conversion côté client.
 * Fire à la fois Meta Pixel (fbq) et Google (gtag) — chacun no-op si absent.
 * Le chargement réel des pixels (+ consentement RGPD) est géré dans le root layout.
 */

type TrackParams = Record<string, string | number | undefined>

function clean(params?: TrackParams): TrackParams | undefined {
  if (!params) return undefined
  const out: TrackParams = {}
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') out[k] = v
  }
  return Object.keys(out).length ? out : undefined
}

/** Lead capturé (form de la landing d'acquisition) */
export function trackLead(params?: TrackParams): void {
  if (typeof window === 'undefined') return
  const p = clean(params)
  window.fbq?.('track', 'Lead', p)
  window.gtag?.('event', 'generate_lead', p)
}

/** Inscription finalisée (form complet artisan) */
export function trackCompleteRegistration(params?: TrackParams): void {
  if (typeof window === 'undefined') return
  const p = clean(params)
  window.fbq?.('track', 'CompleteRegistration', p)
  window.gtag?.('event', 'sign_up', p)
}
