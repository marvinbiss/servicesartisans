/**
 * Config adaptateur Iopole (PDP, marque grise) — OAuth2 client credentials.
 * Tout vient de l'environnement — JAMAIS de secret en repo.
 *
 * Identifiants sandbox : labs.iopole.io → « Paramètres de la sandbox »
 * (Api Client ID, Api Client Secret, CustomerId).
 *
 * Variables :
 *   IOPOLE_CLIENT_ID       (requis) — Api Client ID
 *   IOPOLE_CLIENT_SECRET   (requis) — Api Client Secret
 *   IOPOLE_CUSTOMER_ID     (requis) — Identifiant client (CustomerId, UUID) → header customer-id
 *   IOPOLE_BASE_URL        (option) — défaut sandbox operator/invoicing
 *   IOPOLE_TOKEN_URL       (option) — défaut Keycloak sandbox
 *   IOPOLE_WEBHOOK_SECRET  (requis pour le webhook push) — vérif signature
 *   IOPOLE_TIMEOUT_MS      (option) — défaut 8000
 */

const DEFAULT_BASE_URL = 'https://api.ppd.iopole.fr/v1/api/operator/invoicing'
const DEFAULT_TOKEN_URL = 'https://auth.ppd.iopole.fr/realms/iopole/protocol/openid-connect/token'

export type IopoleConfig = {
  baseUrl: string
  tokenUrl: string
  clientId: string
  clientSecret: string
  customerId: string
  timeoutMs: number
}

export function getIopoleConfig(): IopoleConfig | null {
  const clientId = process.env.IOPOLE_CLIENT_ID
  const clientSecret = process.env.IOPOLE_CLIENT_SECRET
  const customerId = process.env.IOPOLE_CUSTOMER_ID
  if (!clientId || !clientSecret || !customerId) return null
  return {
    baseUrl: (process.env.IOPOLE_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, ''),
    tokenUrl: process.env.IOPOLE_TOKEN_URL || DEFAULT_TOKEN_URL,
    clientId,
    clientSecret,
    customerId,
    timeoutMs: Number(process.env.IOPOLE_TIMEOUT_MS) || 8_000,
  }
}

export function isIopoleConfigured(): boolean {
  return getIopoleConfig() !== null
}

/** Secret de signature webhook push (vérif HMAC côté handler). */
export function getIopoleWebhookSecret(): string | null {
  return process.env.IOPOLE_WEBHOOK_SECRET || null
}
