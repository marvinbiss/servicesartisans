import { createHash, randomBytes } from 'crypto'

/**
 * Why SHA256 (not HMAC): the plaintext token is itself the secret
 * (32 bytes of cryptographic randomness transmitted by email only).
 * No server-side pepper needed - a raw SHA256 is enough to prevent
 * timing/enumeration attacks while keeping the DB lookup constant-time.
 */

const TOKEN_BYTES = 32

export type InvitationToken = {
  plaintext: string
  hash: string
}

export function createInvitationToken(): InvitationToken {
  const plaintext = randomBytes(TOKEN_BYTES).toString('base64url')
  const hash = hashInvitationToken(plaintext)
  return { plaintext, hash }
}

export function hashInvitationToken(plaintext: string): string {
  return createHash('sha256').update(plaintext).digest('hex')
}

export const INVITATION_DELAY_MS = 7 * 24 * 60 * 60 * 1000
export const INVITATION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000
