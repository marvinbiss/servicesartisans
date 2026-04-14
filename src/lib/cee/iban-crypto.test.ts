/**
 * Tests iban-crypto.ts — validation IBAN FR (ISO 7064 mod 97).
 *
 * Le chiffrement vit côté Postgres (RPC `cee_store_partner_iban` migration 434).
 * Aucun encrypt/decrypt JS — donc rien à mocker côté Node.
 *
 * IMPORTANT : aucun IBAN réel. IBAN FR de test ISO 13616 officiel.
 */

import { describe, it, expect } from 'vitest'
import { validateIban } from './iban-crypto'

// IBAN FR de test officiel ISO 13616 — non lié à un compte réel
const IBAN_VALID = 'FR1420041010050500013M02606'
const IBAN_VALID_WITH_SPACES = 'FR14 2004 1010 0505 0001 3M02 606'

describe('validateIban', () => {
  it('accepte un IBAN FR valide', () => {
    const result = validateIban(IBAN_VALID)
    expect(result.valid).toBe(true)
    expect(result.last4).toBe('2606')
    expect(result.normalized).toBe(IBAN_VALID)
  })

  it('normalise espaces et minuscules', () => {
    const result = validateIban(IBAN_VALID_WITH_SPACES.toLowerCase())
    expect(result.valid).toBe(true)
    expect(result.normalized).toBe(IBAN_VALID)
  })

  it('rejette un IBAN trop court', () => {
    const result = validateIban('FR76')
    expect(result.valid).toBe(false)
    expect(result.last4).toBeNull()
    expect(result.normalized).toBeNull()
  })

  it('rejette un IBAN non-FR', () => {
    const result = validateIban('DE89370400440532013000')
    expect(result.valid).toBe(false)
  })

  it('rejette une clé modulo 97 invalide', () => {
    // Change un chiffre de clé pour casser le modulo
    const broken = IBAN_VALID.replace('FR14', 'FR99')
    const result = validateIban(broken)
    expect(result.valid).toBe(false)
  })

  it('rejette les inputs non-string', () => {
    // @ts-expect-error — test défensif
    expect(validateIban(null).valid).toBe(false)
    // @ts-expect-error — test défensif
    expect(validateIban(42).valid).toBe(false)
  })

  it('rejette un IBAN avec caractères spéciaux', () => {
    expect(validateIban('FR14-2004-1010').valid).toBe(false)
  })
})
