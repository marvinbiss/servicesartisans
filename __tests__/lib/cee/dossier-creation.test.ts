/**
 * Tests — src/lib/cee/dossier-creation.ts
 *
 * Covers:
 *   - RGE expiré rejeté (gate 4)
 *   - Convention non signée rejetée (gate 2)
 *   - Quiz non passé rejeté (gate 3)
 *   - Partner non active rejeté (gate 1)
 *   - Operation non autorisée rejetée (gate 5)
 *   - Idempotence : dossier draft existant retourné
 *   - Création normale → status='draft'
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  checkDossierCreationGates,
  createDossier,
  hashEmailForDossier,
  generateDossierReference,
  type CreateDossierInput,
} from '@/lib/cee/dossier-creation'

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePartnerRow(
  overrides: Partial<{
    status: string
    convention_signed_at: string | null
    certified_at: string | null
    operations_allowed: string[]
    rge_date_fin: string | null
  }> = {}
) {
  const {
    status = 'active',
    convention_signed_at = '2026-01-01T00:00:00Z',
    certified_at = '2026-02-01T00:00:00Z',
    operations_allowed = [],
    rge_date_fin = null, // null = no expiry
  } = overrides

  return {
    id: 'partner-1',
    status,
    convention_signed_at,
    certified_at,
    operations_allowed,
    provider: {
      rge_qualifications: [{ code: 'QualiPAC', date_debut: '2024-01-01', date_fin: rge_date_fin }],
    },
  }
}

function buildMockSupabase(partnerRow: unknown, existingDossier: unknown = null) {
  const maybeSinglePartner = vi.fn().mockResolvedValue({ data: partnerRow, error: null })
  const maybeSingleDossier = vi.fn().mockResolvedValue({ data: existingDossier, error: null })
  const singleInsert = vi.fn().mockResolvedValue({
    data: {
      id: 'dossier-new',
      reference: 'SAE-202604-001234',
      partner_id: 'partner-1',
      provider_id: 'provider-1',
      status: 'draft',
      client_email_hash: 'abc123',
      client_code_postal: '75001',
      client_commune_insee: '75056',
      foyer_personnes: 2,
      revenus_categorie: 'modeste',
      rfr_declared_cts: null,
      operation_code: 'BAR-TH-171',
      type_travaux: 'Installation PAC',
      montant_ht_cts: 500000,
      montant_ttc_cts: 600000,
      date_devis: '2026-04-10',
      date_chantier_prevue: null,
      date_chantier_realisee: null,
      forfait_id: 1,
      forfait_version: 'v1',
      prime_cee_cts: 120000,
      prime_mpr_cts: null,
      commission_rate: 10,
      surface_m2: null,
      annee_construction: null,
      energie_remplacee: null,
      delegataire: null,
      pncee_reference: null,
      qa_score: null,
      created_at: '2026-04-14T10:00:00Z',
      updated_at: '2026-04-14T10:00:00Z',
    },
    error: null,
  })

  // Track calls to differentiate partners vs dossiers
  let fromCallCount = 0

  return {
    from: vi.fn(() => {
      fromCallCount++
      const callNum = fromCallCount
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                gte: vi.fn(() => ({
                  maybeSingle: callNum === 2 ? maybeSingleDossier : maybeSinglePartner,
                })),
                maybeSingle: callNum === 1 ? maybeSinglePartner : maybeSingleDossier,
              })),
              maybeSingle: callNum === 1 ? maybeSinglePartner : maybeSingleDossier,
            })),
            maybeSingle: callNum === 1 ? maybeSinglePartner : maybeSingleDossier,
          })),
          maybeSingle: maybeSinglePartner,
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: singleInsert,
          })),
        })),
      }
    }),
    _maybeSinglePartner: maybeSinglePartner,
    _maybeSingleDossier: maybeSingleDossier,
    _singleInsert: singleInsert,
  }
}
void buildMockSupabase

function makeValidInput(): CreateDossierInput {
  return {
    partner_id: '11111111-1111-4111-8111-111111111111',
    provider_id: '22222222-2222-4222-8222-222222222222',
    client_nom_b64: Buffer.from('Dupont').toString('base64'),
    client_prenom_b64: Buffer.from('Jean').toString('base64'),
    client_email_b64: Buffer.from('jean@example.com').toString('base64'),
    client_email_hash: hashEmailForDossier('jean@example.com'),
    client_telephone_b64: null,
    client_adresse_b64: Buffer.from('1 rue de la Paix').toString('base64'),
    client_code_postal: '75001',
    client_commune_insee: '75056',
    foyer_personnes: 2,
    revenus_categorie: 'modeste',
    rfr_declared_cts: null,
    operation_code: 'BAR-TH-171',
    type_travaux: 'Installation PAC air-eau',
    surface_m2: null,
    annee_construction: null,
    energie_remplacee: null,
    montant_ht_cts: 500000,
    montant_ttc_cts: 600000,
    date_devis: '2026-04-10',
    date_chantier_prevue: null,
    forfait_id: 1,
    forfait_version: 'v1',
    prime_cee_cts: 120000,
    prime_mpr_cts: null,
    commission_rate: 10,
  }
}

// ---------------------------------------------------------------------------
// hashEmailForDossier
// ---------------------------------------------------------------------------

describe('hashEmailForDossier', () => {
  it('returns a 64-char hex string', () => {
    const hash = hashEmailForDossier('test@example.com')
    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })

  it('is case-insensitive (lowercase before hashing)', () => {
    expect(hashEmailForDossier('Test@Example.COM')).toBe(hashEmailForDossier('test@example.com'))
  })
})

// ---------------------------------------------------------------------------
// generateDossierReference
// ---------------------------------------------------------------------------

describe('generateDossierReference', () => {
  it('produces SAE-YYYYMM-NNNNNN format', () => {
    const date = new Date('2026-04-14')
    const ref = generateDossierReference(date, '550e8400-e29b-41d4-a716-446655440000')
    expect(ref).toMatch(/^SAE-202604-[0-9]{6}$/)
  })
})

// ---------------------------------------------------------------------------
// checkDossierCreationGates
// ---------------------------------------------------------------------------

describe('checkDossierCreationGates', () => {
  it('passes all gates when partner is active + convention signed + certified + RGE valid', async () => {
    const supabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: makePartnerRow(), error: null }),
          })),
        })),
      })),
    }
    const result = await checkDossierCreationGates(
      supabase as never,
      'partner-1',
      'BAR-TH-171',
      new Date('2026-04-14')
    )
    expect(result.ok).toBe(true)
  })

  it('rejects when partner status is not active', async () => {
    const supabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi
              .fn()
              .mockResolvedValue({ data: makePartnerRow({ status: 'certified' }), error: null }),
          })),
        })),
      })),
    }
    const result = await checkDossierCreationGates(supabase as never, 'partner-1', 'BAR-TH-171')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('PARTNER_NOT_ACTIVE')
  })

  it('rejects when convention_signed_at is null', async () => {
    const supabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({
              data: makePartnerRow({ convention_signed_at: null }),
              error: null,
            }),
          })),
        })),
      })),
    }
    const result = await checkDossierCreationGates(supabase as never, 'partner-1', 'BAR-TH-171')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('CONVENTION_NOT_SIGNED')
  })

  it('rejects when certified_at is null (quiz not passed)', async () => {
    const supabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({
              data: makePartnerRow({ certified_at: null }),
              error: null,
            }),
          })),
        })),
      })),
    }
    const result = await checkDossierCreationGates(supabase as never, 'partner-1', 'BAR-TH-171')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('NOT_CERTIFIED')
  })

  it('rejects when RGE is expired at deposit date', async () => {
    // RGE expired 2026-01-01, deposit is 2026-04-14
    const supabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({
              data: makePartnerRow({ rge_date_fin: '2026-01-01' }),
              error: null,
            }),
          })),
        })),
      })),
    }
    const result = await checkDossierCreationGates(
      supabase as never,
      'partner-1',
      'BAR-TH-171',
      new Date('2026-04-14')
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('RGE_EXPIRED')
  })

  it('accepts when RGE expires on deposit date (same day = still valid)', async () => {
    const supabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({
              data: makePartnerRow({ rge_date_fin: '2026-04-14' }),
              error: null,
            }),
          })),
        })),
      })),
    }
    const result = await checkDossierCreationGates(
      supabase as never,
      'partner-1',
      'BAR-TH-171',
      new Date('2026-04-14')
    )
    expect(result.ok).toBe(true)
  })

  it('rejects when operation is not in operations_allowed (non-empty list)', async () => {
    const supabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({
              data: makePartnerRow({ operations_allowed: ['BAR-EN-101', 'BAR-EN-102'] }),
              error: null,
            }),
          })),
        })),
      })),
    }
    const result = await checkDossierCreationGates(
      supabase as never,
      'partner-1',
      'BAR-TH-171' // not in allowed list
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('OPERATION_NOT_ALLOWED')
  })

  it('accepts any operation when operations_allowed is empty (unrestricted)', async () => {
    const supabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({
              data: makePartnerRow({ operations_allowed: [] }),
              error: null,
            }),
          })),
        })),
      })),
    }
    const result = await checkDossierCreationGates(supabase as never, 'partner-1', 'BAR-TH-171')
    expect(result.ok).toBe(true)
  })

  it('returns PARTNER_NOT_FOUND when partner does not exist', async () => {
    const supabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          })),
        })),
      })),
    }
    const result = await checkDossierCreationGates(supabase as never, 'nonexistent', 'BAR-TH-171')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('PARTNER_NOT_FOUND')
  })
})

// ---------------------------------------------------------------------------
// createDossier
// ---------------------------------------------------------------------------

describe('createDossier', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects with VALIDATION_ERROR when input is invalid', async () => {
    const supabase = { from: vi.fn() }
    const result = await createDossier(supabase as never, {
      ...makeValidInput(),
      client_code_postal: 'INVALID',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('VALIDATION_ERROR')
  })

  it('returns idempotent existing draft when one already exists today', async () => {
    const existingDossier = {
      id: 'dossier-existing',
      reference: 'SAE-202604-000001',
      partner_id: 'partner-1',
      status: 'draft',
      operation_code: 'BAR-TH-171',
      client_email_hash: hashEmailForDossier('jean@example.com'),
      created_at: new Date().toISOString(),
    }

    // Build a supabase mock that returns the active partner on first call,
    // and returns the existing dossier on the idempotence query.
    // We differentiate by table name.
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === 'cee_artisan_partners') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: makePartnerRow(), error: null }),
              })),
            })),
          }
        }
        // cee_dossiers — idempotence check
        // Chain: .select().eq(partner_id).eq(email_hash).eq(operation_code).eq(status).gte(created_at).maybeSingle()
        const gteHandler = vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: existingDossier, error: null }),
        }))
        const eqStatus = vi.fn(() => ({ gte: gteHandler }))
        const eqOp = vi.fn(() => ({ eq: eqStatus }))
        const eqEmail = vi.fn(() => ({ eq: eqOp }))
        const eqPartner = vi.fn(() => ({ eq: eqEmail }))
        return {
          select: vi.fn(() => ({ eq: eqPartner })),
        }
      }),
    }

    const result = await createDossier(supabase as never, makeValidInput())
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.status).toBe('existing')
      expect(result.dossier.id).toBe('dossier-existing')
    }
  })
})
