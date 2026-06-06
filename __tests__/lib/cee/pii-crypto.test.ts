/**
 * pii-crypto — AES-256-GCM roundtrip, fail-closed sans clé, détection tampering.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import crypto from 'crypto'

const VALID_KEY = crypto.randomBytes(32).toString('base64')

async function loadModule() {
  vi.resetModules()
  return import('@/lib/cee/pii-crypto')
}

const originalKey = process.env.CEE_PII_KEY

beforeEach(() => {
  delete process.env.CEE_PII_KEY
})

afterEach(() => {
  if (originalKey === undefined) delete process.env.CEE_PII_KEY
  else process.env.CEE_PII_KEY = originalKey
})

describe('pii-crypto', () => {
  it('isPiiCryptoConfigured false sans clé', async () => {
    const { isPiiCryptoConfigured } = await loadModule()
    expect(isPiiCryptoConfigured()).toBe(false)
  })

  it('isPiiCryptoConfigured false si clé mal formée (taille != 32)', async () => {
    process.env.CEE_PII_KEY = Buffer.from('tooshort').toString('base64')
    const { isPiiCryptoConfigured } = await loadModule()
    expect(isPiiCryptoConfigured()).toBe(false)
  })

  it('isPiiCryptoConfigured true avec clé 32 bytes', async () => {
    process.env.CEE_PII_KEY = VALID_KEY
    const { isPiiCryptoConfigured } = await loadModule()
    expect(isPiiCryptoConfigured()).toBe(true)
  })

  it('encrypt sans clé throw (fail-closed)', async () => {
    const { encryptPiiToB64 } = await loadModule()
    expect(() => encryptPiiToB64('Jean Dupont')).toThrow(/CEE_PII_KEY/)
  })

  it('roundtrip encrypt → decrypt restitue le plaintext (accents inclus)', async () => {
    process.env.CEE_PII_KEY = VALID_KEY
    const { encryptPiiToB64, decryptPiiFromB64 } = await loadModule()
    const plaintext = 'Jean-Noël Dupont, 12 rue de l’Été, 75011 Paris'
    const payload = encryptPiiToB64(plaintext)
    expect(payload).not.toContain('Dupont')
    expect(decryptPiiFromB64(payload)).toBe(plaintext)
  })

  it('deux chiffrements du même plaintext diffèrent (IV aléatoire)', async () => {
    process.env.CEE_PII_KEY = VALID_KEY
    const { encryptPiiToB64 } = await loadModule()
    expect(encryptPiiToB64('jean@example.com')).not.toBe(encryptPiiToB64('jean@example.com'))
  })

  it('payload altéré → throw (auth GCM)', async () => {
    process.env.CEE_PII_KEY = VALID_KEY
    const { encryptPiiToB64, decryptPiiFromB64 } = await loadModule()
    const payload = encryptPiiToB64('secret')
    const buf = Buffer.from(payload, 'base64')
    buf[buf.length - 1] ^= 0xff
    expect(() => decryptPiiFromB64(buf.toString('base64'))).toThrow()
  })

  it('payload tronqué → throw explicite', async () => {
    process.env.CEE_PII_KEY = VALID_KEY
    const { decryptPiiFromB64 } = await loadModule()
    expect(() => decryptPiiFromB64(Buffer.from('abc').toString('base64'))).toThrow(/too short/)
  })

  it('le blob déchiffré via Buffer (parité bytea createDossier)', async () => {
    process.env.CEE_PII_KEY = VALID_KEY
    const { encryptPiiToB64, decryptPiiFromB64 } = await loadModule()
    // createDossier fait Buffer.from(b64, 'base64') → bytea ; on simule la
    // relecture bytea → base64 → decrypt
    const payload = encryptPiiToB64('0612345678')
    const byteaRoundtrip = Buffer.from(payload, 'base64').toString('base64')
    expect(decryptPiiFromB64(byteaRoundtrip)).toBe('0612345678')
  })
})
