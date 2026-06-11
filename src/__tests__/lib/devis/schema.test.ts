import { describe, it, expect } from 'vitest'
import { quoteCreateSchema, quoteLineSchema, invoiceCreateSchema } from '@/lib/devis/schema'

const validLine = { designation: 'Pose PAC', quantite: 1, prix_unitaire_ht: 6000 }

describe('quoteLineSchema', () => {
  it('applique les défauts unite/tva/ordre', () => {
    const parsed = quoteLineSchema.parse(validLine)
    expect(parsed.unite).toBe('u')
    expect(parsed.tva_rate).toBe(20)
    expect(parsed.ordre).toBe(0)
  })

  it('rejette une désignation vide', () => {
    expect(quoteLineSchema.safeParse({ ...validLine, designation: '' }).success).toBe(false)
  })

  it('rejette un prix négatif', () => {
    expect(quoteLineSchema.safeParse({ ...validLine, prix_unitaire_ht: -1 }).success).toBe(false)
  })
})

describe('quoteCreateSchema', () => {
  it('accepte un devis particulier sans SIREN', () => {
    const res = quoteCreateSchema.safeParse({
      client_type: 'particulier',
      lines: [validLine],
    })
    expect(res.success).toBe(true)
  })

  it('exige un SIREN pour un client pro', () => {
    const res = quoteCreateSchema.safeParse({
      client_type: 'pro',
      lines: [validLine],
    })
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.error.issues.some((i) => i.path.includes('client_siren'))).toBe(true)
    }
  })

  it('accepte un client pro avec SIREN 9 chiffres', () => {
    const res = quoteCreateSchema.safeParse({
      client_type: 'pro',
      client_siren: '123456789',
      lines: [validLine],
    })
    expect(res.success).toBe(true)
  })

  it('rejette un SIREN mal formé', () => {
    const res = quoteCreateSchema.safeParse({
      client_type: 'pro',
      client_siren: '123',
      lines: [validLine],
    })
    expect(res.success).toBe(false)
  })

  it('exige au moins une ligne', () => {
    const res = quoteCreateSchema.safeParse({ client_type: 'particulier', lines: [] })
    expect(res.success).toBe(false)
  })

  it('défaut client_type = particulier, acompte_pct = 30', () => {
    const res = quoteCreateSchema.parse({ lines: [validLine] })
    expect(res.client_type).toBe('particulier')
    expect(res.acompte_pct).toBe(30)
  })
})

describe('invoiceCreateSchema', () => {
  it('défaut type = acompte', () => {
    const res = invoiceCreateSchema.parse({ quote_id: '11111111-1111-4111-8111-111111111111' })
    expect(res.type).toBe('acompte')
  })

  it('rejette un quote_id non-uuid', () => {
    expect(invoiceCreateSchema.safeParse({ quote_id: 'nope' }).success).toBe(false)
  })
})
