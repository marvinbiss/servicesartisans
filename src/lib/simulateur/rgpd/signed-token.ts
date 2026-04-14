/**
 * Signed tokens HMAC-SHA256 pour exports RGPD (§5 doc RGPD)
 *
 * Contrat :
 *  - `signToken(publicId, ttlSeconds)` → token hex signé, expire dans ttlSeconds
 *  - `verifyToken(publicId, token)` → boolean (constant-time compare)
 *  - Secret : env var `RGPD_EXPORT_SECRET` (fallback dev only)
 *
 * Format du token : "<expiresAtEpoch>.<hexSignature>"
 *   - expiresAtEpoch = Unix seconds
 *   - hexSignature   = HMAC-SHA256(secret, `${publicId}:${expiresAtEpoch}`)
 *
 * Sécurité :
 *  - `timingSafeEqual` pour éviter les timing attacks
 *  - Pas de stockage du token côté serveur (stateless)
 *  - Le publicId fait partie du message signé — un token signé pour X
 *    ne vaut pas pour Y même si même TTL
 */

import { createHmac, timingSafeEqual } from 'node:crypto'
import { logger } from '@/lib/logger'

const SECRET_ENV_VAR = 'RGPD_EXPORT_SECRET'

function getSecret(): string {
  const s = process.env[SECRET_ENV_VAR]
  if (!s || s.length < 16) {
    if (process.env.NODE_ENV === 'production') {
      logger.error(`${SECRET_ENV_VAR} is missing or too short in production`, null, {
        component: 'simulateur/rgpd/signed-token',
      })
      throw new Error(`${SECRET_ENV_VAR} must be set to a strong secret (>= 16 chars)`)
    }
    // Dev fallback : clé stable mais non secrète pour éviter flakiness en test
    return 'dev-only-rgpd-export-secret-change-me'
  }
  return s
}

function hmacHex(message: string, secret: string): string {
  return createHmac('sha256', secret).update(message).digest('hex')
}

/**
 * Signe un token d'export pour un publicId donné.
 * @param publicId - identifiant `EST-YYYY-MM-DD-xxxxxx`
 * @param ttlSeconds - durée de validité (ex : 3600 = 1h)
 * @returns token string `<expiresAt>.<hexSig>`
 */
export function signToken(publicId: string, ttlSeconds: number): string {
  if (!publicId || typeof publicId !== 'string') {
    throw new Error('signToken: publicId required')
  }
  if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
    throw new Error('signToken: ttlSeconds must be positive')
  }
  const expiresAt = Math.floor(Date.now() / 1000) + Math.floor(ttlSeconds)
  const msg = `${publicId}:${expiresAt}`
  const sig = hmacHex(msg, getSecret())
  return `${expiresAt}.${sig}`
}

/**
 * Vérifie un token d'export.
 * @returns true si signature valide et non expirée
 */
export function verifyToken(publicId: string, token: string): boolean {
  if (!publicId || typeof publicId !== 'string') return false
  if (!token || typeof token !== 'string') return false

  const dot = token.indexOf('.')
  if (dot <= 0 || dot === token.length - 1) return false

  const expiresAtStr = token.slice(0, dot)
  const sig = token.slice(dot + 1)

  const expiresAt = Number(expiresAtStr)
  if (!Number.isFinite(expiresAt) || expiresAt <= 0) return false
  if (Math.floor(Date.now() / 1000) > expiresAt) return false

  const expectedSig = hmacHex(`${publicId}:${expiresAt}`, getSecret())

  // Constant-time compare — both buffers must be same length
  const a = Buffer.from(sig, 'hex')
  const b = Buffer.from(expectedSig, 'hex')
  if (a.length === 0 || a.length !== b.length) return false
  try {
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}
