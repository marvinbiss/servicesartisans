/**
 * Tests for Artisan Registration Schema
 * Complex schema with SIRET, password confirmation, and French-specific validation
 */

import { describe, it, expect } from 'vitest'
import { artisanRegistrationSchema } from '@/lib/validations/schemas'

const validRegistration = {
  email: 'artisan@example.com',
  password: 'SecurePass1',
  confirmPassword: 'SecurePass1',
  businessName: 'Plomberie Dupont',
  firstName: 'Jean',
  lastName: 'Dupont',
  phone: '0612345678',
  specialty: 'Plomberie',
  siret: '12345678901234',
  address: '12 rue de la Paix',
  city: 'Paris',
  postalCode: '75001',
  acceptTerms: true as const,
}

describe('artisanRegistrationSchema', () => {
  it('should accept valid registration', () => {
    expect(artisanRegistrationSchema.safeParse(validRegistration).success).toBe(true)
  })

  it('should accept registration with optional description', () => {
    const result = artisanRegistrationSchema.safeParse({
      ...validRegistration,
      description: 'Plombier professionnel depuis 10 ans',
    })
    expect(result.success).toBe(true)
  })

  it('should reject mismatched passwords', () => {
    const result = artisanRegistrationSchema.safeParse({
      ...validRegistration,
      confirmPassword: 'DifferentPass1',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const passwordError = result.error.issues.find(i => i.path.includes('confirmPassword'))
      expect(passwordError).toBeDefined()
    }
  })

  it('should reject invalid SIRET (not 14 digits)', () => {
    expect(artisanRegistrationSchema.safeParse({ ...validRegistration, siret: '123' }).success).toBe(false)
    expect(artisanRegistrationSchema.safeParse({ ...validRegistration, siret: '1234567890123' }).success).toBe(false)
    expect(artisanRegistrationSchema.safeParse({ ...validRegistration, siret: '123456789012345' }).success).toBe(false)
    expect(artisanRegistrationSchema.safeParse({ ...validRegistration, siret: 'abcdefghijklmn' }).success).toBe(false)
  })

  it('should reject invalid postal code', () => {
    expect(artisanRegistrationSchema.safeParse({ ...validRegistration, postalCode: '7500' }).success).toBe(false)
    expect(artisanRegistrationSchema.safeParse({ ...validRegistration, postalCode: '750011' }).success).toBe(false)
    expect(artisanRegistrationSchema.safeParse({ ...validRegistration, postalCode: 'ABCDE' }).success).toBe(false)
  })

  it('should reject when acceptTerms is not true', () => {
    expect(artisanRegistrationSchema.safeParse({ ...validRegistration, acceptTerms: false }).success).toBe(false)
  })

  it('should reject too short business name', () => {
    expect(artisanRegistrationSchema.safeParse({ ...validRegistration, businessName: 'A' }).success).toBe(false)
  })

  it('should reject too short address', () => {
    expect(artisanRegistrationSchema.safeParse({ ...validRegistration, address: '12' }).success).toBe(false)
  })

  it('should reject description exceeding max length', () => {
    expect(artisanRegistrationSchema.safeParse({
      ...validRegistration,
      description: 'a'.repeat(2001),
    }).success).toBe(false)
  })

  it('should reject missing required fields', () => {
    const { email: _e, ...withoutEmail } = validRegistration
    expect(artisanRegistrationSchema.safeParse(withoutEmail).success).toBe(false)

    const { phone: _p, ...withoutPhone } = validRegistration
    expect(artisanRegistrationSchema.safeParse(withoutPhone).success).toBe(false)

    const { siret: _s, ...withoutSiret } = validRegistration
    expect(artisanRegistrationSchema.safeParse(withoutSiret).success).toBe(false)
  })
})
