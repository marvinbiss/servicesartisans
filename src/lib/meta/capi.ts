/**
 * Meta Conversions API (CAPI) — envoi serveur des événements de conversion.
 *
 * Pourquoi : le Pixel navigateur perd 30 à 50 % du signal (ATT iOS, bloqueurs,
 * ITP). Le même événement envoyé côté serveur est dédupliqué par Meta via le
 * couple (`event_name`, `event_id`) : si le Pixel arrive aussi, Meta n'en garde
 * qu'un seul. L'appelant DOIT donc réutiliser le même `eventId` des deux côtés.
 *
 * Server-only. Best-effort : toute erreur est loggée mais ne casse jamais le
 * flux métier (capture de lead, inscription…).
 *
 * Config (env, jamais en dur) :
 * - META_CAPI_ACCESS_TOKEN  : System User Token (permission `ads_management`)
 * - META_DATASET_ID         : ID du dataset / pixel (défaut : NEXT_PUBLIC_META_PIXEL_ID)
 * - META_TEST_EVENT_CODE    : code « Test Events » (dev uniquement, jamais en prod)
 * - META_GRAPH_API_VERSION  : version Graph API (défaut : v26.0)
 *
 * RGPD : cette fonction n'applique AUCUNE logique de consentement. C'est à
 * l'appelant de ne l'invoquer qu'avec le consentement marketing de l'utilisateur.
 */
import { logger } from '@/lib/logger'
import {
  hashCity,
  hashCountry,
  hashEmail,
  hashExternalId,
  hashName,
  hashPhone,
  hashZip,
} from '@/lib/meta/hash'

const DEFAULT_GRAPH_VERSION = 'v26.0'
const REQUEST_TIMEOUT_MS = 5_000

/** Événements standard Meta utilisés par ServicesArtisans. */
export type MetaEventName =
  | 'PageView'
  | 'ViewContent'
  | 'Lead'
  | 'CompleteRegistration'
  | 'Contact'
  | 'Schedule'
  | 'SubmitApplication'
  | 'StartTrial'
  | 'Subscribe'
  | 'Purchase'

/** Données utilisateur en clair — hachées ici, jamais transmises brutes. */
export interface MetaUserData {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  city?: string
  zip?: string
  /** Code ISO alpha-2, ex. « fr ». */
  country?: string
  /** Identifiant interne (user id, lead id) — haché avant envoi. */
  externalId?: string
  /** Cookie `_fbp` posé par le Pixel. */
  fbp?: string
  /** Cookie `_fbc` (dérivé de `fbclid`) — le signal d'attribution le plus fort. */
  fbc?: string
  /** IP publique du visiteur (non hachée, requis par Meta). */
  clientIpAddress?: string
  /** User-Agent du visiteur (non haché, requis par Meta). */
  clientUserAgent?: string
}

export interface MetaEventInput {
  eventName: MetaEventName
  /** Identifiant partagé avec le Pixel pour la déduplication. Obligatoire. */
  eventId: string
  /** Epoch secondes. Défaut : maintenant. Meta refuse > 7 jours dans le passé. */
  eventTime?: number
  eventSourceUrl?: string
  /** `website` pour un événement navigateur, `system_generated` pour un job serveur. */
  actionSource?: 'website' | 'system_generated' | 'phone_call' | 'chat' | 'email'
  userData: MetaUserData
  customData?: Record<string, string | number | boolean>
}

export interface MetaCapiResult {
  sent: boolean
  reason?: 'not_configured' | 'no_identifier' | 'http_error' | 'network_error'
  eventsReceived?: number
}

interface GraphUserData {
  em?: string[]
  ph?: string[]
  fn?: string[]
  ln?: string[]
  ct?: string[]
  zp?: string[]
  country?: string[]
  external_id?: string[]
  fbp?: string
  fbc?: string
  client_ip_address?: string
  client_user_agent?: string
}

function getConfig(): { token: string; datasetId: string; version: string } | null {
  const token = process.env.META_CAPI_ACCESS_TOKEN
  const datasetId = process.env.META_DATASET_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID
  if (!token || !datasetId) return null
  return {
    token,
    datasetId,
    version: process.env.META_GRAPH_API_VERSION || DEFAULT_GRAPH_VERSION,
  }
}

/** Hache et met en forme les identifiants selon la spec Graph API. */
export function buildGraphUserData(userData: MetaUserData): GraphUserData {
  const out: GraphUserData = {}
  const set = (key: 'em' | 'ph' | 'fn' | 'ln' | 'ct' | 'zp' | 'country' | 'external_id', value?: string) => {
    if (value) out[key] = [value]
  }

  set('em', hashEmail(userData.email))
  set('ph', hashPhone(userData.phone))
  set('fn', hashName(userData.firstName))
  set('ln', hashName(userData.lastName))
  set('ct', hashCity(userData.city))
  set('zp', hashZip(userData.zip))
  set('country', hashCountry(userData.country))
  set('external_id', hashExternalId(userData.externalId))

  if (userData.fbp) out.fbp = userData.fbp
  if (userData.fbc) out.fbc = userData.fbc
  if (userData.clientIpAddress) out.client_ip_address = userData.clientIpAddress
  if (userData.clientUserAgent) out.client_user_agent = userData.clientUserAgent

  return out
}

/** Un événement sans aucun identifiant est rejeté par Meta — on filtre en amont. */
function hasIdentifier(userData: GraphUserData): boolean {
  return Object.keys(userData).some(
    (key) => key !== 'client_ip_address' && key !== 'client_user_agent'
  )
}

/**
 * Envoie un ou plusieurs événements à la Conversions API.
 * Ne lève jamais : retourne `{ sent: false, reason }` en cas d'échec.
 */
export async function sendMetaEvents(events: MetaEventInput[]): Promise<MetaCapiResult> {
  const config = getConfig()
  if (!config) return { sent: false, reason: 'not_configured' }
  if (events.length === 0) return { sent: false, reason: 'no_identifier' }

  const nowSeconds = Math.floor(Date.now() / 1000)
  const payload = events
    .map((event) => {
      const userData = buildGraphUserData(event.userData)
      if (!hasIdentifier(userData)) return null
      return {
        event_name: event.eventName,
        event_id: event.eventId,
        event_time: event.eventTime ?? nowSeconds,
        action_source: event.actionSource ?? 'website',
        ...(event.eventSourceUrl ? { event_source_url: event.eventSourceUrl } : {}),
        user_data: userData,
        ...(event.customData ? { custom_data: event.customData } : {}),
      }
    })
    .filter((event): event is NonNullable<typeof event> => event !== null)

  if (payload.length === 0) return { sent: false, reason: 'no_identifier' }

  const url = `https://graph.facebook.com/${config.version}/${encodeURIComponent(config.datasetId)}/events`
  const body: Record<string, unknown> = {
    data: payload,
    access_token: config.token,
  }
  const testCode = process.env.META_TEST_EVENT_CODE
  if (testCode) body.test_event_code = testCode

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    const json = (await res.json().catch(() => null)) as
      | { events_received?: number; error?: { message?: string; code?: number } }
      | null

    if (!res.ok) {
      // Le message d'erreur Meta ne contient pas de PII (uniquement le champ fautif).
      logger.error('Meta CAPI non-OK', {
        status: res.status,
        code: json?.error?.code,
        message: json?.error?.message,
        events: payload.map((e) => e.event_name),
      })
      return { sent: false, reason: 'http_error' }
    }

    return { sent: true, eventsReceived: json?.events_received ?? payload.length }
  } catch (err) {
    logger.error('Meta CAPI fetch failed', {
      err: err instanceof Error ? err.message : String(err),
    })
    return { sent: false, reason: 'network_error' }
  } finally {
    clearTimeout(timeout)
  }
}

/** Raccourci mono-événement. */
export async function sendMetaEvent(event: MetaEventInput): Promise<MetaCapiResult> {
  return sendMetaEvents([event])
}

/**
 * Extrait IP + User-Agent d'une requête entrante.
 * Meta s'en sert pour la correspondance quand aucun cookie n'est disponible.
 */
export function getClientContext(request: Request): {
  clientIpAddress?: string
  clientUserAgent?: string
} {
  const forwarded = request.headers.get('x-forwarded-for')
  const clientIpAddress =
    forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || undefined
  return {
    clientIpAddress,
    clientUserAgent: request.headers.get('user-agent') || undefined,
  }
}

/** Lit les cookies `_fbp` / `_fbc` d'une requête serveur. */
export function getFbCookies(request: Request): { fbp?: string; fbc?: string } {
  const header = request.headers.get('cookie')
  if (!header) return {}
  const read = (name: string): string | undefined => {
    const value = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))?.[1]
    return value ? decodeURIComponent(value) : undefined
  }
  return { fbp: read('_fbp'), fbc: read('_fbc') }
}
