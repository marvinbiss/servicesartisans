/**
 * Client HTTP Iopole (PDP marque grise) — OAuth2 client credentials (Keycloak).
 * Env-driven, échoue proprement si non configuré (renvoie 'IOPOLE_NOT_CONFIGURED').
 *
 * Auth : POST token URL (grant_type=client_credentials) → access_token (caché
 * jusqu'à expiration), puis Bearer + header `customer-id` sur chaque appel.
 *
 * ⚠️ SCAFFOLD : les chemins d'ÉMISSION exacts (POST invoice) et la forme du
 * payload restent à confirmer sur le Swagger réel
 * (api.ppd.iopole.fr/v1/api/operator/invoicing) — marqués TODO(iopole).
 * Connus : token URL, header customer-id, GET /v1/invoice/{id}, /v1.1/invoice/search.
 */

import { getIopoleConfig, type IopoleConfig } from './config'
import { buildUblInvoice } from './document'
import type {
  IopoleResult,
  IopoleEmitterInput,
  IopoleEmitterResult,
  IopoleInvoicePayload,
  IopoleSubmitResult,
  IopoleStatusResult,
} from './types'

const NOT_CONFIGURED = 'IOPOLE_NOT_CONFIGURED'

// Cache token au niveau module (réutilisé entre invocations chaudes).
let tokenCache: { token: string; expiresAt: number } | null = null

async function getAccessToken(cfg: IopoleConfig): Promise<string | null> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 5_000) return tokenCache.token

  try {
    const res = await fetch(cfg.tokenUrl, {
      method: 'POST',
      signal: AbortSignal.timeout(cfg.timeoutMs),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
      }),
    })
    if (!res.ok) return null
    const json = (await res.json().catch(() => ({}))) as {
      access_token?: string
      expires_in?: number
    }
    if (!json.access_token) return null
    tokenCache = {
      token: json.access_token,
      expiresAt: Date.now() + (json.expires_in ?? 300) * 1000,
    }
    return json.access_token
  } catch {
    return null
  }
}

async function iopoleFetch<T>(path: string, init: RequestInit): Promise<IopoleResult<T>> {
  const cfg = getIopoleConfig()
  if (!cfg) return { data: null, error: NOT_CONFIGURED }

  const token = await getAccessToken(cfg)
  if (!token) return { data: null, error: 'IOPOLE_AUTH_FAILED' }

  // multipart : laisser fetch fixer le boundary (ne PAS forcer Content-Type).
  const isMultipart = init.body instanceof FormData

  try {
    const res = await fetch(`${cfg.baseUrl}${path}`, {
      ...init,
      signal: AbortSignal.timeout(cfg.timeoutMs),
      headers: {
        ...(isMultipart ? {} : { 'Content-Type': 'application/json' }),
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'customer-id': cfg.customerId,
        ...(init.headers || {}),
      },
    })
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>
    if (!res.ok) {
      const msg = (json.message as string) || (json.error as string) || `HTTP ${res.status}`
      return { data: null, error: msg }
    }
    return { data: json as T, error: null }
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : 'IOPOLE_FETCH_FAILED' }
  }
}

/**
 * Enrôle un artisan comme émetteur (KYB) sous son SIREN.
 * NOTE : en marque grise l'émission ne dépend PAS de cet appel — l'identité
 * vendeur (SIREN) est portée par le document UBL. L'onboarding KYB peut se faire
 * via le tableau de bord Iopole. Endpoint `/v1/company` non confirmé → best-effort
 * (getOrCreateEmitter tolère l'échec, l'émission se poursuit). À confirmer en sandbox.
 */
export async function registerEmitter(
  input: IopoleEmitterInput
): Promise<IopoleResult<IopoleEmitterResult>> {
  const { data, error } = await iopoleFetch<Record<string, unknown>>('/v1/company', {
    method: 'POST',
    body: JSON.stringify({
      siren: input.siren,
      name: input.name,
      email: input.email ?? undefined,
    }),
  })
  if (error || !data) return { data: null, error }
  return {
    data: {
      emitterId: String(data.id ?? data.companyId ?? data.emitterId ?? ''),
      status: String(data.status ?? 'pending'),
    },
    error: null,
  }
}

/**
 * Transmet une facture : POST /v1/invoice en multipart (file + type), async.
 * Le document est un UBL 2.1 généré depuis le payload. Réponse : invoiceId.
 */
export async function submitInvoice(
  payload: IopoleInvoicePayload
): Promise<IopoleResult<IopoleSubmitResult>> {
  const xml = buildUblInvoice(payload)
  const form = new FormData()
  form.append(
    'file',
    new Blob([xml], { type: 'application/xml' }),
    `${payload.numero || payload.internalId}.xml`
  )
  form.append('type', 'application/xml')

  const { data, error } = await iopoleFetch<Record<string, unknown>>('/v1/invoice', {
    method: 'POST',
    body: form,
  })
  if (error || !data) return { data: null, error }
  return {
    data: {
      iopoleId: String(data.invoiceId ?? data.id ?? ''),
      // Émission async : pas de statut métier ici, on part de 'deposited'.
      status: String(data.status ?? 'deposited'),
    },
    error: null,
  }
}

/** Récupère le statut courant d'une facture (poll de secours vs webhook). */
export async function getInvoiceStatus(
  iopoleId: string
): Promise<IopoleResult<IopoleStatusResult>> {
  // Connu : GET /v1/invoice/{invoiceId} (metadata + statut).
  const { data, error } = await iopoleFetch<Record<string, unknown>>(
    `/v1/invoice/${encodeURIComponent(iopoleId)}`,
    { method: 'GET' }
  )
  if (error || !data) return { data: null, error }
  const status =
    (data.status as string) ??
    ((data.lastStatusData as Record<string, unknown>)?.status as string) ??
    ''
  return { data: { iopoleId, status: String(status) }, error: null }
}

/** Réinitialise le cache token (tests / rotation secret). */
export function _resetIopoleTokenCache(): void {
  tokenCache = null
}
