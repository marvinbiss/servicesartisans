/**
 * 2FA cookie helpers — HMAC-signed, Edge-safe.
 *
 * Plan C — C-1 (BLOCKER CVSS 8.1) : sans ces helpers, le flow 2FA backend
 * (déjà solide) est inopérant côté UX. Le `signin` route détecte 2FA et
 * dépose un cookie `sa_2fa_pending` ; la page `/verifier-2fa` collecte le
 * code TOTP ; sur succès la route `verify-pending` clear le pending et pose
 * un cookie `sa_2fa_verified` ; le middleware enforce le gate sur les routes
 * privées.
 *
 * Sécurité :
 *   - Cookies HttpOnly + secure(prod) + sameSite=strict.
 *   - Payload JSON `{userId, exp}` signé HMAC-SHA256 via Web Crypto API
 *     (Edge runtime safe — pas d'`import 'node:crypto'`). Format final :
 *     `<base64url(payload)>.<base64url(sig)>`.
 *   - Vérif `verifySig` utilise `crypto.subtle.verify` (constant-time interne).
 *   - `exp` est un timestamp ms ; expiration côté serveur ET côté navigateur
 *     via `maxAge`.
 *
 * Edge compat : pas de `Buffer`. On utilise `TextEncoder/Decoder` + helpers
 * base64url manuels (Web Crypto bytes ↔ string).
 */

const SECRET_ENV_NAME = 'TWO_FACTOR_COOKIE_SECRET'

export const PENDING_COOKIE_NAME = 'sa_2fa_pending'
export const VERIFIED_COOKIE_NAME = 'sa_2fa_verified'

const PENDING_TTL_MS = 10 * 60 * 1000
const VERIFIED_TTL_MS = 8 * 60 * 60 * 1000

export type TwoFactorCookiePayload = {
  userId: string
  exp: number
}

export type CookieDirective = {
  name: string
  value: string
  options: {
    httpOnly: true
    secure: boolean
    sameSite: 'strict'
    path: '/'
    maxAge: number
  }
}

const ENCODER = new TextEncoder()

let cachedKey: CryptoKey | null = null
let cachedSecret: string | null = null

async function getKey(): Promise<CryptoKey> {
  const secret = process.env[SECRET_ENV_NAME]
  if (!secret) {
    throw new Error(`${SECRET_ENV_NAME} environment variable is required`)
  }
  if (cachedKey && cachedSecret === secret) return cachedKey
  cachedSecret = secret
  cachedKey = await crypto.subtle.importKey(
    'raw',
    ENCODER.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
  return cachedKey
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  const b64 = btoa(bin)
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function sign(payloadB64: string): Promise<string> {
  const key = await getKey()
  const sig = await crypto.subtle.sign('HMAC', key, ENCODER.encode(payloadB64))
  return bytesToBase64Url(new Uint8Array(sig))
}

async function verifySig(payloadB64: string, sigB64: string): Promise<boolean> {
  const key = await getKey()
  let sigBytes: Uint8Array
  try {
    sigBytes = base64UrlToBytes(sigB64)
  } catch {
    return false
  }
  // Cast — TS strict distingue ArrayBuffer/SharedArrayBuffer mais Web Crypto
  // accepte tout BufferSource. `sigBytes` provient toujours d'un nouveau
  // Uint8Array (cf. base64UrlToBytes), donc jamais SharedArrayBuffer.
  return crypto.subtle.verify(
    'HMAC',
    key,
    sigBytes as unknown as BufferSource,
    ENCODER.encode(payloadB64)
  )
}

async function makeToken(payload: TwoFactorCookiePayload): Promise<string> {
  const json = JSON.stringify(payload)
  const b64 = bytesToBase64Url(ENCODER.encode(json))
  const sig = await sign(b64)
  return `${b64}.${sig}`
}

async function readToken(value: string | undefined | null): Promise<TwoFactorCookiePayload | null> {
  if (!value || typeof value !== 'string') return null
  const dot = value.indexOf('.')
  if (dot < 1 || dot >= value.length - 1) return null
  const b64 = value.slice(0, dot)
  const sig = value.slice(dot + 1)

  let ok = false
  try {
    ok = await verifySig(b64, sig)
  } catch {
    return null
  }
  if (!ok) return null

  let json: string
  try {
    json = new TextDecoder().decode(base64UrlToBytes(b64))
  } catch {
    return null
  }

  let payload: unknown
  try {
    payload = JSON.parse(json)
  } catch {
    return null
  }

  if (
    !payload ||
    typeof payload !== 'object' ||
    typeof (payload as { userId?: unknown }).userId !== 'string' ||
    typeof (payload as { exp?: unknown }).exp !== 'number'
  ) {
    return null
  }

  const p = payload as TwoFactorCookiePayload
  if (Date.now() >= p.exp) return null
  return p
}

function buildOptions(maxAgeSec: number): CookieDirective['options'] {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: maxAgeSec,
  }
}

export async function buildPendingCookie(userId: string): Promise<CookieDirective> {
  const exp = Date.now() + PENDING_TTL_MS
  return {
    name: PENDING_COOKIE_NAME,
    value: await makeToken({ userId, exp }),
    options: buildOptions(Math.floor(PENDING_TTL_MS / 1000)),
  }
}

export async function buildVerifiedCookie(userId: string): Promise<CookieDirective> {
  const exp = Date.now() + VERIFIED_TTL_MS
  return {
    name: VERIFIED_COOKIE_NAME,
    value: await makeToken({ userId, exp }),
    options: buildOptions(Math.floor(VERIFIED_TTL_MS / 1000)),
  }
}

export function buildClearCookie(name: string): CookieDirective {
  return {
    name,
    value: '',
    options: buildOptions(0),
  }
}

export async function readPendingCookie(
  value: string | undefined | null
): Promise<TwoFactorCookiePayload | null> {
  return readToken(value)
}

export async function readVerifiedCookie(
  value: string | undefined | null,
  expectedUserId?: string
): Promise<TwoFactorCookiePayload | null> {
  const payload = await readToken(value)
  if (!payload) return null
  if (expectedUserId && payload.userId !== expectedUserId) return null
  return payload
}

export const TWO_FACTOR_TTL = {
  pending: PENDING_TTL_MS,
  verified: VERIFIED_TTL_MS,
}
