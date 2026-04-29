/**
 * Google Places API (New) client — Find Place via SIRET pour enrichir les
 * fiches providers RGE/non-RGE avec rating + user_ratings_total + place_id.
 *
 * ⚠️ Sécurité :
 *   - Clé API en header `X-Goog-Api-Key` (jamais en query string → leak via
 *     Sentry breadcrumbs / logs).
 *   - `redirect: 'error'` (anti-SSRF si l'API est jamais détournée).
 *   - Body cap 1 MB (Places Find Place response < 50KB en pratique).
 *   - `AbortSignal.timeout()` pour ne pas bloquer le backfill.
 *
 * Référence : https://developers.google.com/maps/documentation/places/web-service/text-search
 */

import { logger } from '@/lib/logger'

export type PlacesFindResult = {
  /**
   * Discriminated union sur le résultat du match.
   *
   * - `matched`   : 1 résultat retenu (avec pageSize=1 c'est le top Places).
   * - `no_match`  : 0 résultat Places.
   * - `api_error` : 4xx/5xx, body invalide, timeout, SIRET malformé.
   *
   * Note : avec pageSize=1, on ne peut pas detecter "ambiguous" côté API.
   * Le vrai signal d'ambiguïté SIRET (deux SIRET → même place_id) remonte
   * au niveau DB via l'index unique partial : un UPDATE qui viole la
   * contrainte 23505 → `google_sync_status='collision'` côté backfill
   * (audit security 2026-04-29 — defense in depth).
   */
  status: 'matched' | 'no_match' | 'api_error'
  placeId: string | null
  rating: number | null
  userRatingsTotal: number
  businessStatus: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY' | null
  /** Raw response bytes for audit / debug. */
  rawBytes?: number
  errorReason?: string
}

const PLACES_TEXT_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText'
const FIELD_MASK = 'places.id,places.rating,places.userRatingCount,places.businessStatus'
const BODY_CAP = 1_048_576 // 1 MB
const DEFAULT_TIMEOUT_MS = 10_000

type FetchLike = typeof fetch

export type FindPlaceInput = {
  /** SIRET 14 chiffres. Anti-injection via construction stricte du textQuery. */
  siret: string
  /** Nom commercial. Inclu dans textQuery pour disambiguation. */
  companyName?: string | null
  /** Code postal — boost score quand fourni. */
  postalCode?: string | null
}

export type PlacesClientOptions = {
  apiKey: string
  fetcher?: FetchLike
  timeoutMs?: number
}

/**
 * Construit un textQuery sécurisé pour Places. Anti-injection stricte :
 * SIRET ne doit contenir que des chiffres (validé par regex). companyName
 * est passé en clair (Places le tokenize lui-même), mais on cap la longueur
 * pour éviter une requête abusive.
 */
export function buildTextQuery(input: FindPlaceInput): string {
  // Anti-leak défensif : ne JAMAIS inclure la valeur du SIRET (même partielle
  // ou la longueur) dans le message d'erreur. Le `errorReason` du résultat
  // peut transiter vers Sentry breadcrumbs si le caller loggue le payload
  // PlacesFindResult complet (audit security 2026-04-29).
  if (!/^\d{14}$/.test(input.siret)) {
    throw new Error('Invalid SIRET format (expected 14 digits)')
  }
  const parts: string[] = [input.siret]
  if (input.companyName) {
    parts.push(input.companyName.slice(0, 120))
  }
  if (input.postalCode && /^\d{5}$/.test(input.postalCode)) {
    parts.push(input.postalCode)
  }
  return parts.join(' ')
}

/**
 * Read body avec cap. Évite OOM si Places renvoie un payload anormal.
 * Au-delà du cap, on tronque et on log un warning (pas d'exception fatale).
 */
async function readCappedBody(response: Response, cap: number): Promise<string> {
  const reader = response.body?.getReader()
  if (!reader) return await response.text()
  const chunks: Uint8Array[] = []
  let total = 0
  let truncated = false
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) {
        total += value.byteLength
        chunks.push(value)
        if (total > cap) {
          logger.warn('[places-client] body cap exceeded', { cap, totalBytes: total })
          truncated = true
          break
        }
      }
    }
  } finally {
    // Libère le socket TCP underlying. Sans ce cancel, sur 49K backfill l'edge
    // runtime peut accumuler des sockets en attente de drain (audit security
    // 2026-04-29 — LOW). `releaseLock` aussi pour réutiliser le ReadableStream.
    if (truncated) {
      try {
        await reader.cancel()
      } catch {
        // cancel() peut throw si le stream est déjà clos — non bloquant.
      }
    }
    try {
      reader.releaseLock()
    } catch {
      // releaseLock peut throw si déjà released par cancel — non bloquant.
    }
  }
  // Concaténation Uint8Array sans Buffer (compat edge runtime)
  const merged = new Uint8Array(Math.min(total, cap))
  let offset = 0
  for (const c of chunks) {
    const remaining = merged.length - offset
    if (remaining <= 0) break
    const slice = c.byteLength > remaining ? c.subarray(0, remaining) : c
    merged.set(slice, offset)
    offset += slice.byteLength
  }
  return new TextDecoder('utf-8').decode(merged)
}

type PlacesPlace = {
  id?: string
  rating?: number
  userRatingCount?: number
  businessStatus?: string
}

type PlacesResponse = {
  places?: PlacesPlace[]
}

/**
 * Cherche un Place via SIRET (Places API New, Text Search).
 *
 * - matched : un seul résultat, place_id retourné
 * - no_match : 0 résultat ou résultat ambigu (>1 match avec ratings disjoints)
 * - api_error : 4xx/5xx, body invalide, timeout
 *
 * Idempotent : pas d'effet de bord, le caller persiste le résultat.
 */
export async function findPlaceBySiret(
  input: FindPlaceInput,
  options: PlacesClientOptions
): Promise<PlacesFindResult> {
  const fetcher = options.fetcher ?? fetch
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS

  let textQuery: string
  try {
    textQuery = buildTextQuery(input)
  } catch (err) {
    return {
      status: 'api_error',
      placeId: null,
      rating: null,
      userRatingsTotal: 0,
      businessStatus: null,
      errorReason: err instanceof Error ? err.message : 'invalid_input',
    }
  }

  let response: Response
  try {
    response = await fetcher(PLACES_TEXT_SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': options.apiKey,
        'X-Goog-FieldMask': FIELD_MASK,
        'Accept-Language': 'fr-FR',
      },
      body: JSON.stringify({
        textQuery,
        languageCode: 'fr',
        regionCode: 'FR',
        // pageSize 1 — on ne consomme que places[0]. Réduit la bande passante
        // et le parse JSON sans coût Places différent (facturation par requête,
        // pas par résultat). Le multi-match est détecté en amont via la
        // requête Places (qui ranke par pertinence) — si plusieurs SIRET
        // collide on attrape via 23505 unique-index DB, pas via pageSize.
        pageSize: 1,
      }),
      redirect: 'error',
      signal: AbortSignal.timeout(timeoutMs),
    })
  } catch (err) {
    return {
      status: 'api_error',
      placeId: null,
      rating: null,
      userRatingsTotal: 0,
      businessStatus: null,
      errorReason: err instanceof Error ? err.name : 'network_error',
    }
  }

  if (!response.ok) {
    return {
      status: 'api_error',
      placeId: null,
      rating: null,
      userRatingsTotal: 0,
      businessStatus: null,
      errorReason: `http_${response.status}`,
    }
  }

  let payload: PlacesResponse
  let rawBytes: number
  try {
    const body = await readCappedBody(response, BODY_CAP)
    rawBytes = body.length
    payload = JSON.parse(body) as PlacesResponse
  } catch (err) {
    return {
      status: 'api_error',
      placeId: null,
      rating: null,
      userRatingsTotal: 0,
      businessStatus: null,
      errorReason: err instanceof Error ? `parse_${err.name}` : 'parse_error',
    }
  }

  const places = payload.places ?? []
  if (places.length === 0) {
    return {
      status: 'no_match',
      placeId: null,
      rating: null,
      userRatingsTotal: 0,
      businessStatus: null,
      rawBytes,
    }
  }

  // pageSize=1 → places.length ≤ 1. SIRET = identifiant unique légal donc
  // 1 résultat suffit. La détection d'ambiguïté SIRET≠Place se fait au
  // niveau DB via l'index unique partial (collision 23505 → sync_status
  // 'collision' côté backfill).
  const top = places[0]
  const businessStatus = normalizeBusinessStatus(top.businessStatus)
  const rating =
    typeof top.rating === 'number' && top.rating >= 0 && top.rating <= 5 ? top.rating : null
  const userRatingsTotal =
    typeof top.userRatingCount === 'number' && top.userRatingCount >= 0
      ? Math.floor(top.userRatingCount)
      : 0

  if (!top.id) {
    return {
      status: 'api_error',
      placeId: null,
      rating: null,
      userRatingsTotal: 0,
      businessStatus: null,
      errorReason: 'missing_place_id',
      rawBytes,
    }
  }

  return {
    status: 'matched',
    placeId: top.id,
    rating,
    userRatingsTotal,
    businessStatus,
    rawBytes,
  }
}

function normalizeBusinessStatus(raw: string | undefined): PlacesFindResult['businessStatus'] {
  if (raw === 'OPERATIONAL' || raw === 'CLOSED_TEMPORARILY' || raw === 'CLOSED_PERMANENTLY') {
    return raw
  }
  return null
}
