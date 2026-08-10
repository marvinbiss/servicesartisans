import 'server-only'

/**
 * Google Ads — Offline Conversion Import (OCI).
 *
 * Remonte à Google Ads les conversions qui ne se produisent PAS sur le site :
 * un lead dispatché à un artisan, puis devisé. C'est ce signal-là, et non
 * « formulaire soumis », qui doit piloter le Smart Bidding sur un modèle de
 * leads exclusifs — sinon les enchères optimisent le volume de formulaires,
 * dont une partie n'a aucune valeur.
 *
 * Implémentation en REST brut (aucune dépendance ajoutée) :
 *   - OAuth2 : échange refresh_token -> access_token (cache mémoire process)
 *   - POST customers/{id}:uploadClickConversions
 *
 * Variables d'environnement requises (le module no-op si l'une manque) :
 *   GOOGLE_ADS_CUSTOMER_ID          — ID client SANS tirets (ex "1234567890")
 *   GOOGLE_ADS_DEVELOPER_TOKEN      — jeton développeur du MCC
 *   GOOGLE_ADS_CLIENT_ID            — OAuth2 client ID
 *   GOOGLE_ADS_CLIENT_SECRET        — OAuth2 client secret
 *   GOOGLE_ADS_REFRESH_TOKEN        — refresh token du compte autorisé
 *
 * Optionnelles :
 *   GOOGLE_ADS_LOGIN_CUSTOMER_ID    — ID du MCC si accès via manager
 *   GOOGLE_ADS_API_VERSION          — défaut ci-dessous ; A VERIFIER avant
 *                                     mise en service, Google déprécie une
 *                                     version d'API tous les ~4 mois
 *   GOOGLE_ADS_CONVERSION_ACTION_LEAD_DISPATCHED — resource name complet
 *   GOOGLE_ADS_CONVERSION_ACTION_LEAD_QUOTED     — resource name complet
 *   GOOGLE_ADS_VALUE_LEAD_DISPATCHED_EUR         — valeur envoyée (nombre)
 *   GOOGLE_ADS_VALUE_LEAD_QUOTED_EUR             — valeur envoyée (nombre)
 *
 * Le « resource name » d'une action de conversion a la forme
 * `customers/1234567890/conversionActions/987654321` (visible via l'API ou
 * l'URL de l'interface Ads).
 */

import { logger } from '@/lib/logger'

/** Version d'API par défaut — à revalider avant activation (dépréciation ~4 mois). */
const DEFAULT_API_VERSION = 'v21'

const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const ADS_API_HOST = 'https://googleads.googleapis.com'

/** Fuseau du compte Ads — la conversionDateTime doit être exprimée dedans. */
export const ADS_ACCOUNT_TIME_ZONE = 'Europe/Paris'

/** Timeouts serrés : ce cron ne doit jamais approcher le maxDuration Vercel. */
const OAUTH_TIMEOUT_MS = 5_000
const UPLOAD_TIMEOUT_MS = 15_000

/** Clés logiques d'actions de conversion gérées par le cron. */
export type ConversionActionKey = 'lead_dispatched' | 'lead_quoted'

export type ClickIdType = 'gclid' | 'gbraid' | 'wbraid'

export interface ClickConversion {
  clickId: string
  clickIdType: ClickIdType
  actionKey: ConversionActionKey
  /** Date de l'événement métier (dispatch / devis), pas de l'upload. */
  conversionAt: Date
  valueEur?: number
}

export interface UploadOutcome {
  uploaded: ClickConversion[]
  /** Conversions refusées par Google, avec le message d'erreur associé. */
  rejected: Array<{ conversion: ClickConversion; error: string }>
}

interface AdsConfig {
  customerId: string
  developerToken: string
  clientId: string
  clientSecret: string
  refreshToken: string
  loginCustomerId?: string
  apiVersion: string
  conversionActions: Partial<Record<ConversionActionKey, string>>
  values: Partial<Record<ConversionActionKey, number>>
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

function parseEurValue(raw: string | undefined): number | undefined {
  if (!raw) return undefined
  const value = Number(raw)
  return Number.isFinite(value) && value >= 0 ? value : undefined
}

export function getAdsConfig(): AdsConfig | null {
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, '')
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN

  if (!customerId || !developerToken || !clientId || !clientSecret || !refreshToken) {
    return null
  }

  return {
    customerId,
    developerToken,
    clientId,
    clientSecret,
    refreshToken,
    loginCustomerId: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID?.replace(/-/g, ''),
    apiVersion: process.env.GOOGLE_ADS_API_VERSION || DEFAULT_API_VERSION,
    conversionActions: {
      lead_dispatched: process.env.GOOGLE_ADS_CONVERSION_ACTION_LEAD_DISPATCHED,
      lead_quoted: process.env.GOOGLE_ADS_CONVERSION_ACTION_LEAD_QUOTED,
    },
    values: {
      lead_dispatched: parseEurValue(process.env.GOOGLE_ADS_VALUE_LEAD_DISPATCHED_EUR),
      lead_quoted: parseEurValue(process.env.GOOGLE_ADS_VALUE_LEAD_QUOTED_EUR),
    },
  }
}

export function isGoogleAdsConfigured(): boolean {
  return getAdsConfig() !== null
}

/** Actions de conversion réellement exploitables (resource name renseigné). */
export function getEnabledActionKeys(cfg: AdsConfig): ConversionActionKey[] {
  return (Object.keys(cfg.conversionActions) as ConversionActionKey[]).filter((key) =>
    Boolean(cfg.conversionActions[key])
  )
}

// ---------------------------------------------------------------------------
// Horodatage
// ---------------------------------------------------------------------------

function timeZoneOffset(date: Date, timeZone: string): string {
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'longOffset',
  }).format(date)
  // "1/15/2026, GMT+01:00" -> "+01:00"
  const match = /GMT([+-]\d{2}:\d{2})/.exec(formatted)
  return match ? match[1] : '+00:00'
}

/**
 * Formate une date au format exigé par l'API Ads :
 * `yyyy-MM-dd HH:mm:ss+HH:mm`, exprimé dans le fuseau du compte.
 *
 * Un décalage erroné fait rejeter la conversion, ou pire, la rattache au
 * mauvais jour — d'où le calcul explicite de l'offset (gère l'heure d'été).
 */
export function formatConversionDateTime(
  date: Date,
  timeZone: string = ADS_ACCOUNT_TIME_ZONE
): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const get = (type: string): string => parts.find((p) => p.type === type)?.value ?? '00'
  // `hour12: false` peut rendre "24" pour minuit selon l'implémentation ICU.
  const hour = get('hour') === '24' ? '00' : get('hour')

  return `${get('year')}-${get('month')}-${get('day')} ${hour}:${get('minute')}:${get('second')}${timeZoneOffset(date, timeZone)}`
}

// ---------------------------------------------------------------------------
// OAuth2
// ---------------------------------------------------------------------------

let cachedToken: { value: string; expiresAt: number } | null = null

/** Réinitialise le cache mémoire — utilisé par les tests. */
export function __resetAccessTokenCache(): void {
  cachedToken = null
}

async function getAccessToken(cfg: AdsConfig): Promise<string> {
  // Marge de 60 s pour ne jamais utiliser un token qui expire en vol.
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value
  }

  const res = await fetch(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      refresh_token: cfg.refreshToken,
      grant_type: 'refresh_token',
    }),
    signal: AbortSignal.timeout(OAUTH_TIMEOUT_MS),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Google OAuth refresh failed (${res.status}): ${detail.slice(0, 300)}`)
  }

  const json = (await res.json()) as { access_token?: string; expires_in?: number }
  if (!json.access_token) throw new Error('Google OAuth response missing access_token')

  cachedToken = {
    value: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
  }
  return cachedToken.value
}

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------

interface PartialFailureError {
  message?: string
  details?: Array<{ errors?: Array<{ message?: string; location?: unknown }> }>
}

/**
 * Extrait les index de conversions en échec depuis la réponse partialFailure.
 * Google encode l'index de l'élément fautif dans `fieldPathElements`.
 */
function parsePartialFailure(error: PartialFailureError | undefined): Map<number, string> {
  const failures = new Map<number, string>()
  if (!error?.details) return failures

  for (const detail of error.details) {
    for (const err of detail.errors ?? []) {
      const location = err.location as
        | { fieldPathElements?: Array<{ fieldName?: string; index?: number }> }
        | undefined
      const element = location?.fieldPathElements?.find(
        (el) => el.fieldName === 'conversions' && typeof el.index === 'number'
      )
      if (element && typeof element.index === 'number') {
        failures.set(element.index, err.message ?? 'unknown error')
      }
    }
  }
  return failures
}

/**
 * Envoie un lot de conversions. `partialFailure: true` : un élément invalide
 * ne fait pas échouer tout le lot — indispensable, sinon un seul gclid périmé
 * bloquerait indéfiniment la file d'attente.
 *
 * Les conversions rejetées ne sont PAS journalisées comme uploadées par
 * l'appelant, elles seront donc retentées au run suivant.
 */
export async function uploadClickConversions(
  conversions: ClickConversion[]
): Promise<UploadOutcome> {
  if (conversions.length === 0) return { uploaded: [], rejected: [] }

  const cfg = getAdsConfig()
  if (!cfg) throw new Error('Google Ads not configured')

  const accessToken = await getAccessToken(cfg)

  const payload = conversions.map((conv) => {
    const resourceName = cfg.conversionActions[conv.actionKey]
    const value = conv.valueEur ?? cfg.values[conv.actionKey]
    return {
      // Un seul des trois identifiants est renseigné par conversion.
      [conv.clickIdType]: conv.clickId,
      conversionAction: resourceName,
      conversionDateTime: formatConversionDateTime(conv.conversionAt),
      ...(value !== undefined ? { conversionValue: value, currencyCode: 'EUR' } : {}),
    }
  })

  const url = `${ADS_API_HOST}/${cfg.apiVersion}/customers/${cfg.customerId}:uploadClickConversions`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'developer-token': cfg.developerToken,
      'Content-Type': 'application/json',
      ...(cfg.loginCustomerId ? { 'login-customer-id': cfg.loginCustomerId } : {}),
    },
    body: JSON.stringify({ conversions: payload, partialFailure: true }),
    signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Google Ads upload failed (${res.status}): ${detail.slice(0, 500)}`)
  }

  const json = (await res.json()) as { partialFailureError?: PartialFailureError }
  const failures = parsePartialFailure(json.partialFailureError)

  const uploaded: ClickConversion[] = []
  const rejected: UploadOutcome['rejected'] = []
  conversions.forEach((conv, index) => {
    const failure = failures.get(index)
    if (failure) rejected.push({ conversion: conv, error: failure })
    else uploaded.push(conv)
  })

  if (rejected.length > 0) {
    logger.warn('[google-ads-oci] partial failure on conversion upload', {
      action: 'google-ads-oci',
      rejectedCount: rejected.length,
      uploadedCount: uploaded.length,
      firstError: rejected[0]?.error,
    })
  }

  return { uploaded, rejected }
}
