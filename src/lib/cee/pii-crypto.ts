/**
 * CEE dossier PII encryption — AES-256-GCM, Node-side.
 *
 * Encrypts client PII (nom, prénom, email, téléphone, adresse) before storage
 * in the `cee_dossiers.client_*_encrypted` bytea columns (mig 431).
 *
 * Design
 * ------
 * - Key: `CEE_PII_KEY` env, base64-encoded 32 bytes (AES-256). Distinct from
 *   `CEE_IBAN_KEY` (IBAN encryption stays Postgres-side via pgp_sym_encrypt —
 *   see iban-crypto.ts) so a leak of one secret does not expose the other.
 * - Payload format: base64( iv(12) || authTag(16) || ciphertext ). GCM gives
 *   authenticated encryption — tampering with stored bytes fails decryption.
 * - Output is fed to `CreateDossierInputSchema.client_*_b64` and decoded to
 *   bytea by `createDossier` — the bytes at rest are real ciphertext.
 * - Fail-closed: encryption throws when the key is absent/invalid. Callers
 *   must check `isPiiCryptoConfigured()` and refuse the write path.
 * - Zéro PII log : ni plaintext ni ciphertext ne sont loggés ici.
 */

import crypto from 'crypto'

const IV_LENGTH = 12
const TAG_LENGTH = 16

// ---------------------------------------------------------------------------
// CEE_PII_KEY startup validation (same contract as CEE_IBAN_KEY — CWE-321)
//
// A malformed key means dossier PII would silently fail at request time; a
// loud boot failure surfaces immediately in Vercel Function logs instead.
// Skipped in test / build environments where the key is not present.
// ---------------------------------------------------------------------------

function validateCeePiiKey(): void {
  if (process.env.VITEST || process.env.NODE_ENV === 'test' || process.env.NEXT_BUILD_SKIP_DB) {
    return
  }

  const raw = process.env.CEE_PII_KEY
  if (!raw) {
    // Key absent — not fatal outside production (dev may skip CEE feature).
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        '[CEE_PII_KEY] Missing in production. Set a base64-encoded 32-byte key (AES-256).'
      )
    }
    return
  }

  const decoded = Buffer.from(raw, 'base64')
  if (decoded.length !== 32) {
    throw new Error(
      `[CEE_PII_KEY] Decoded to ${decoded.length} bytes — expected exactly 32 (AES-256). ` +
        "Re-generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\""
    )
  }
}

validateCeePiiKey()

function getKey(): Buffer | null {
  const raw = process.env.CEE_PII_KEY
  if (!raw) return null
  const decoded = Buffer.from(raw, 'base64')
  return decoded.length === 32 ? decoded : null
}

/** True when CEE_PII_KEY is present and well-formed. */
export function isPiiCryptoConfigured(): boolean {
  return getKey() !== null
}

/**
 * Encrypts a PII string. Returns base64( iv || authTag || ciphertext ),
 * directly usable as a `client_*_b64` input for createDossier.
 * @throws when CEE_PII_KEY is absent or malformed (fail-closed).
 */
export function encryptPiiToB64(plaintext: string): string {
  const key = getKey()
  if (!key) {
    throw new Error('[CEE_PII_KEY] Missing or invalid — cannot encrypt dossier PII')
  }
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, ciphertext]).toString('base64')
}

/**
 * Decrypts a payload produced by encryptPiiToB64 (or read back from a bytea
 * column re-encoded to base64). Throws on tampering (GCM auth failure).
 */
export function decryptPiiFromB64(payloadB64: string): string {
  const key = getKey()
  if (!key) {
    throw new Error('[CEE_PII_KEY] Missing or invalid — cannot decrypt dossier PII')
  }
  const buf = Buffer.from(payloadB64, 'base64')
  if (buf.length < IV_LENGTH + TAG_LENGTH + 1) {
    throw new Error('PII payload too short — not a valid iv||tag||ciphertext blob')
  }
  const iv = buf.subarray(0, IV_LENGTH)
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
  const ciphertext = buf.subarray(IV_LENGTH + TAG_LENGTH)
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
}
