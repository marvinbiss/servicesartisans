/**
 * Tests leads-service.ts — transitions, idempotence, dédoublonnage.
 */

import { describe, it, expect, vi } from 'vitest'
import {
  PARTNER_TRANSITIONS,
  canTransition,
  hashEmail,
  createCeeLead,
  createCeePartner,
  updateCeePartnerStatus,
} from './leads-service'

// ---------------------------------------------------------------------------
// Helpers: minimal Supabase query-builder mock
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeSelectBuilder(result: { data: any; error?: any }) {
  const builder: Record<string, unknown> = {}
  const chain = () => builder
  builder.select = vi.fn(chain)
  builder.eq = vi.fn(chain)
  builder.gte = vi.fn(chain)
  builder.is = vi.fn(chain)
  builder.order = vi.fn(chain)
  builder.limit = vi.fn(chain)
  builder.maybeSingle = vi.fn().mockResolvedValue(result)
  builder.single = vi.fn().mockResolvedValue(result)
  return builder
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeInsertBuilder(result: { data: any; error?: any }) {
  const builder: Record<string, unknown> = {}
  builder.insert = vi.fn(() => builder)
  builder.select = vi.fn(() => builder)
  builder.single = vi.fn().mockResolvedValue(result)
  return builder
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeUpdateBuilder(result: { data: any; error?: any }) {
  const builder: Record<string, unknown> = {}
  builder.update = vi.fn(() => builder)
  builder.eq = vi.fn(() => builder)
  builder.select = vi.fn(() => builder)
  builder.single = vi.fn().mockResolvedValue(result)
  return builder
}

// ---------------------------------------------------------------------------
// hashEmail
// ---------------------------------------------------------------------------

describe('hashEmail', () => {
  it('hash SHA-256 hex lowercase', () => {
    const h = hashEmail('Test@Example.com')
    expect(h).toHaveLength(64)
    // Deterministic — same input same output
    expect(h).toBe(hashEmail('test@example.com'))
  })
})

// ---------------------------------------------------------------------------
// State machine
// ---------------------------------------------------------------------------

describe('PARTNER_TRANSITIONS', () => {
  it('invited → onboarding autorisé', () => {
    expect(canTransition('invited', 'onboarding')).toBe(true)
  })

  it('invited → active interdit', () => {
    expect(canTransition('invited', 'active')).toBe(false)
  })

  it('revoked est terminal', () => {
    expect(PARTNER_TRANSITIONS.revoked).toEqual([])
    expect(canTransition('revoked', 'active')).toBe(false)
  })

  it('active ↔ suspended autorisés', () => {
    expect(canTransition('active', 'suspended')).toBe(true)
    expect(canTransition('suspended', 'active')).toBe(true)
  })

  it('tous les status ont une entrée', () => {
    const expected = [
      'invited',
      'onboarding',
      'convention_sent',
      'convention_signed',
      'training',
      'certified',
      'active',
      'suspended',
      'revoked',
    ]
    for (const s of expected) {
      expect(PARTNER_TRANSITIONS).toHaveProperty(s)
    }
  })
})

// ---------------------------------------------------------------------------
// createCeeLead
// ---------------------------------------------------------------------------

describe('createCeeLead', () => {
  it('retourne lead existant si dédoublonnage <24h', async () => {
    const fromMock = vi
      .fn()
      .mockReturnValue(makeSelectBuilder({ data: { id: 'lead_exist' }, error: null }))
    const supabase = { from: fromMock }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await createCeeLead(supabase as any, {
      email: 'client@test.fr',
      operation_code: 'BAR-TH-171',
    })

    expect(result.id).toBe('lead_exist')
    expect(result.email_hash).toHaveLength(64)
  })

  it('insert et retourne id si pas de doublon', async () => {
    let callCount = 0
    const fromMock = vi.fn().mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        // SELECT dédoublonnage → null
        return makeSelectBuilder({ data: null, error: null })
      }
      // INSERT
      return makeInsertBuilder({ data: { id: 'lead_new' }, error: null })
    })
    const supabase = { from: fromMock }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await createCeeLead(supabase as any, {
      email: 'nouveau@test.fr',
      operation_code: 'BAR-TH-171',
    })
    expect(result.id).toBe('lead_new')
  })

  it('rejette un email invalide (zod)', async () => {
    const supabase = { from: vi.fn() }
    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createCeeLead(supabase as any, { email: 'not-an-email' })
    ).rejects.toThrow()
  })

  it('rejette un téléphone non-E164', async () => {
    const supabase = { from: vi.fn() }
    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createCeeLead(supabase as any, {
        email: 'a@b.fr',
        telephone_e164: '0612345678',
      })
    ).rejects.toThrow()
  })
})

// ---------------------------------------------------------------------------
// createCeePartner
// ---------------------------------------------------------------------------

describe('createCeePartner', () => {
  it('retourne partner existant (idempotence)', async () => {
    const fromMock = vi.fn().mockReturnValueOnce(
      makeSelectBuilder({
        data: {
          id: 'p_exist',
          provider_id: 'prov_1',
          user_id: 'u_1',
          status: 'active',
        },
        error: null,
      })
    )
    const supabase = { from: fromMock }

    const result = await createCeePartner(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      supabase as any,
      { userId: 'u_1', providerId: 'prov_1' }
    )
    expect(result.id).toBe('p_exist')
  })

  it('insert nouveau partner status invited', async () => {
    let call = 0
    const fromMock = vi.fn().mockImplementation(() => {
      call++
      if (call === 1) return makeSelectBuilder({ data: null, error: null })
      return makeInsertBuilder({
        data: {
          id: 'p_new',
          provider_id: 'prov_1',
          user_id: 'u_1',
          status: 'invited',
        },
        error: null,
      })
    })
    const supabase = { from: fromMock }

    const result = await createCeePartner(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      supabase as any,
      { userId: 'u_1', providerId: 'prov_1' }
    )
    expect(result.status).toBe('invited')
  })
})

// ---------------------------------------------------------------------------
// updateCeePartnerStatus
// ---------------------------------------------------------------------------

describe('updateCeePartnerStatus', () => {
  it('rejette une transition interdite', async () => {
    const fromMock = vi.fn().mockReturnValueOnce(
      makeSelectBuilder({
        data: {
          id: 'p_1',
          provider_id: 'pr',
          user_id: 'u',
          status: 'invited',
        },
        error: null,
      })
    )
    const supabase = { from: fromMock }
    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateCeePartnerStatus(supabase as any, 'p_1', 'active')
    ).rejects.toThrow('Transition interdite')
  })

  it('accepte invited → onboarding et applique timestamp', async () => {
    let call = 0
    const fromMock = vi.fn().mockImplementation(() => {
      call++
      if (call === 1) {
        return makeSelectBuilder({
          data: {
            id: 'p_1',
            provider_id: 'pr',
            user_id: 'u',
            status: 'invited',
          },
          error: null,
        })
      }
      return makeUpdateBuilder({
        data: {
          id: 'p_1',
          provider_id: 'pr',
          user_id: 'u',
          status: 'onboarding',
        },
        error: null,
      })
    })
    const supabase = { from: fromMock }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await updateCeePartnerStatus(supabase as any, 'p_1', 'onboarding')
    expect(result.status).toBe('onboarding')
  })

  it('idempotent si status identique', async () => {
    const fromMock = vi.fn().mockReturnValueOnce(
      makeSelectBuilder({
        data: {
          id: 'p_1',
          provider_id: 'pr',
          user_id: 'u',
          status: 'active',
        },
        error: null,
      })
    )
    const supabase = { from: fromMock }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await updateCeePartnerStatus(supabase as any, 'p_1', 'active')
    expect(result.status).toBe('active')
    // Pas de 2e call
    expect(fromMock).toHaveBeenCalledTimes(1)
  })

  it('throw si partner introuvable', async () => {
    const fromMock = vi.fn().mockReturnValueOnce(makeSelectBuilder({ data: null, error: null }))
    const supabase = { from: fromMock }
    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateCeePartnerStatus(supabase as any, 'p_x', 'onboarding')
    ).rejects.toThrow('introuvable')
  })
})
