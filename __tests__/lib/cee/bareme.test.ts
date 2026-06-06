/**
 * bareme — lookup forfait + calcul prime snapshot (par geste vs par m²).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { lookupForfaitSnapshot, PER_M2_OPERATIONS } from '@/lib/cee/bareme'
import type { SupabaseClient } from '@supabase/supabase-js'

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

const maybeSingle = vi.fn()

function makeSupabase(): SupabaseClient {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle,
  }
  return { from: vi.fn(() => chain) } as unknown as SupabaseClient
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('lookupForfaitSnapshot', () => {
  it('opération par geste : prime = forfait brut', async () => {
    maybeSingle.mockResolvedValueOnce({
      data: { id: 42, prime_forfait_eur_cts: 96000, date_validite_debut: '2026-01-01' },
      error: null,
    })
    const res = await lookupForfaitSnapshot(makeSupabase(), {
      operationCode: 'BAR-TH-171',
      zone: 'H1',
      revenusCategorie: 'modeste',
    })
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.snapshot.forfait_id).toBe(42)
      expect(res.snapshot.prime_cee_cts).toBe(96000)
      expect(res.snapshot.forfait_version).toBe('2026-01-01:96000')
    }
  })

  it('opération par m² : prime = forfait × surface', async () => {
    maybeSingle.mockResolvedValueOnce({
      data: { id: 7, prime_forfait_eur_cts: 1200, date_validite_debut: '2026-01-01' },
      error: null,
    })
    const res = await lookupForfaitSnapshot(makeSupabase(), {
      operationCode: 'BAR-EN-101',
      zone: 'H2',
      revenusCategorie: 'superieur',
      surfaceM2: 85,
    })
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.snapshot.prime_cee_cts).toBe(102000)
  })

  it('opération par m² sans surface → SURFACE_REQUIRED', async () => {
    maybeSingle.mockResolvedValueOnce({
      data: { id: 7, prime_forfait_eur_cts: 1200, date_validite_debut: '2026-01-01' },
      error: null,
    })
    const res = await lookupForfaitSnapshot(makeSupabase(), {
      operationCode: 'BAR-EN-102',
      zone: 'H1',
      revenusCategorie: 'modeste',
      surfaceM2: null,
    })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe('SURFACE_REQUIRED')
  })

  it('aucun forfait → BAREME_NOT_FOUND (fail-closed, jamais prime 0)', async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null })
    const res = await lookupForfaitSnapshot(makeSupabase(), {
      operationCode: 'BAR-TH-999',
      zone: 'H1',
      revenusCategorie: 'modeste',
    })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe('BAREME_NOT_FOUND')
  })

  it('erreur DB → DB_ERROR', async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: { message: 'boom' } })
    const res = await lookupForfaitSnapshot(makeSupabase(), {
      operationCode: 'BAR-TH-171',
      zone: 'H1',
      revenusCategorie: 'modeste',
    })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe('DB_ERROR')
  })

  it('PER_M2_OPERATIONS couvre exactement les 3 fiches isolation', () => {
    expect(Array.from(PER_M2_OPERATIONS).sort()).toEqual(['BAR-EN-101', 'BAR-EN-102', 'BAR-EN-103'])
  })
})
