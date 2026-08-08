/**
 * Helpers de tracking conversion côté client.
 * Fire à la fois Meta Pixel (fbq) et Google (gtag) — chacun no-op si absent.
 * Le chargement réel des pixels (+ consentement RGPD) est géré dans le root layout.
 *
 * Déduplication Meta : chaque événement porte un `event_id` généré ici. Le même
 * identifiant est transmis au Pixel (`fbq(..., { eventID })`) ET à la Conversions
 * API côté serveur. Meta ne comptabilise alors qu'une seule conversion, même si
 * les deux canaux arrivent — et il en reste une si le Pixel est bloqué.
 */

type TrackParams = Record<string, string | number | undefined>

/** Données de correspondance saisies par l'utilisateur (jamais lues ailleurs). */
export interface TrackUserData {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  city?: string
  zip?: string
}

export interface TrackOptions {
  /** Réutiliser un `event_id` déjà généré (ex. envoyé au serveur avec le formulaire). */
  eventId?: string
  /**
   * Relayer l'événement vers la Conversions API via `/api/meta/capi`.
   * À mettre à `false` quand la route métier envoie déjà l'événement serveur
   * (sinon l'événement part deux fois côté serveur).
   */
  sendServerEvent?: boolean
  /** Données de correspondance transmises au serveur (hachées côté serveur). */
  userData?: TrackUserData
}

const COOKIE_PREFERENCES_KEY = 'cookie_preferences'

function clean(params?: TrackParams): TrackParams | undefined {
  if (!params) return undefined
  const out: TrackParams = {}
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') out[k] = v
  }
  return Object.keys(out).length ? out : undefined
}

/** Identifiant d'événement unique, partagé Pixel ↔ Conversions API. */
export function newEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Consentement marketing (RGPD). Sans lui : ni Pixel, ni Conversions API.
 * Le serveur ne peut pas lire ce choix (stocké en localStorage), c'est donc le
 * client qui porte la responsabilité de ne rien émettre.
 */
export function hasMarketingConsent(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = window.localStorage.getItem(COOKIE_PREFERENCES_KEY)
    if (!raw) return false
    return Boolean((JSON.parse(raw) as { marketing?: boolean }).marketing)
  } catch {
    return false
  }
}

/** Cookies d'attribution posés par le Pixel (`_fbp`) et par `fbclid` (`_fbc`). */
export function getFbCookies(): { fbp?: string; fbc?: string } {
  if (typeof document === 'undefined') return {}
  const read = (name: string): string | undefined => {
    const value = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))?.[1]
    return value ? decodeURIComponent(value) : undefined
  }
  return { fbp: read('_fbp'), fbc: read('_fbc') }
}

/** Relais best-effort vers la Conversions API. Aucun throw, aucun await bloquant. */
function relayToCapi(
  eventName: string,
  eventId: string,
  params?: TrackParams,
  userData?: TrackUserData
): void {
  if (typeof window === 'undefined' || !hasMarketingConsent()) return
  const { fbp, fbc } = getFbCookies()
  const body = JSON.stringify({
    eventName,
    eventId,
    eventSourceUrl: window.location.href,
    consent: true,
    fbp,
    fbc,
    userData,
    customData: params,
  })

  // `keepalive` permet à la requête de survivre à une navigation immédiate
  // (soumission de formulaire suivie d'un redirect).
  void fetch('/api/meta/capi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // Best-effort : un échec de relais ne doit jamais impacter l'utilisateur.
  })
}

function track(
  metaEvent: string,
  gtagEvent: string,
  params?: TrackParams,
  options?: TrackOptions
): string {
  const eventId = options?.eventId ?? newEventId()
  if (typeof window === 'undefined') return eventId

  const p = clean(params)
  window.fbq?.('track', metaEvent, p, { eventID: eventId })
  window.gtag?.('event', gtagEvent, p)

  if (options?.sendServerEvent !== false) {
    relayToCapi(metaEvent, eventId, p, options?.userData)
  }
  return eventId
}

/** Lead capturé (form de la landing d'acquisition). Retourne l'`event_id` utilisé. */
export function trackLead(params?: TrackParams, options?: TrackOptions): string {
  return track('Lead', 'generate_lead', params, options)
}

/** Inscription finalisée (form complet artisan). */
export function trackCompleteRegistration(
  params?: TrackParams,
  options?: TrackOptions
): string {
  return track('CompleteRegistration', 'sign_up', params, options)
}

/** Consultation d'une fiche artisan / page de service à forte intention. */
export function trackViewContent(params?: TrackParams, options?: TrackOptions): string {
  return track('ViewContent', 'view_item', params, options)
}

/** Prise de contact directe (appel, message, rappel demandé). */
export function trackContact(params?: TrackParams, options?: TrackOptions): string {
  return track('Contact', 'contact', params, options)
}

/** Rendez-vous / créneau réservé. */
export function trackSchedule(params?: TrackParams, options?: TrackOptions): string {
  return track('Schedule', 'schedule', params, options)
}
