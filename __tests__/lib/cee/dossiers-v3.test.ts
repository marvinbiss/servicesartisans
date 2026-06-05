/**
 * Tests unitaires — src/lib/cee/dossiers-v3.ts
 * --------------------------------------------
 * Schéma V3 (migration 431). Couvre getCeeDossierByIdV3 / listCeeDossiersForProviderV3
 * (happy path + fail-open). Vérifie que le SELECT cible UNIQUEMENT des colonnes
 * V3 réelles — aucune colonne du schéma 402 droppé.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getCeeDossierByIdV3,
  listCeeDossiersForProviderV3,
  type CeeDossierV3Row,
} from '@/lib/cee/dossiers-v3'

// ---------------------------------------------------------------------------
// Mock Supabase builder — capture le SELECT + thenable chainable
// ---------------------------------------------------------------------------

interface MockResponse {
  data: unknown
  error: { message: string } | null
}

function createMockClient(response: MockResponse) {
  const selectArgs: string[] = []

  const chain: Record<string, unknown> = {}
  chain.select = vi.fn((cols: string) => {
    selectArgs.push(cols)
    return chain
  })
  chain.eq = vi.fn(() => chain)
  chain.order = vi.fn(() => chain)
  chain.maybeSingle = vi.fn(() => Promise.resolve(response))
  chain.then = (onFulfilled: (v: MockResponse) => unknown, onRejected?: (e: unknown) => unknown) =>
    Promise.resolve(response).then(onFulfilled, onRejected)

  const fromSpy = vi.fn((table: string) => {
    expect(table).toBe('cee_dossiers')
    return chain
  })

  return {
    client: { from: fromSpy } as unknown as Parameters<typeof getCeeDossierByIdV3>[0],
    selectArgs,
    fromSpy,
  }
}

// ---------------------------------------------------------------------------
// Fixture V3 — colonnes réelles de la table (migration 431)
// ---------------------------------------------------------------------------

const FIXTURE_V3_RAW = {
  id: '00000000-0000-0000-0000-000000000001',
  reference: 'SAE-202604-000001',
  provider_id: '00000000-0000-0000-0000-0000000000p1',
  operation_code: 'BAR-TH-171',
  status: 'submitted_by_artisan',
  client_code_postal: '75011',
  date_devis: '2026-04-01',
  date_chantier_prevue: null,
  date_chantier_realisee: null,
  montant_ht_cts: 500000,
  montant_ttc_cts: 550000,
  prime_cee_cts: 120000,
  prime_total_cts: 140000,
  reste_a_charge_cts: 410000,
  commission_amount_cts: 50000,
  commission_status: 'pending',
  qa_score: null,
  created_at: '2026-04-01T10:00:00.000Z',
}

/** Colonnes du schéma 402 droppé qui ne doivent JAMAIS apparaître dans le SELECT. */
const DEAD_402_COLUMNS = [
  'client_id',
  'zone_climatique',
  'postal_code',
  'date_engagement',
  'date_pre_visite',
  'date_debut_travaux',
  'date_fin_travaux',
  'date_ah_signature',
  'date_depot_delegataire',
  'date_depot_pncee',
  'date_validation',
  'kwhc_depose',
  'prime_versee_eur',
  'precarite',
  'rejection_reason',
]

// ---------------------------------------------------------------------------
// getCeeDossierByIdV3
// ---------------------------------------------------------------------------

describe('getCeeDossierByIdV3', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('happy path : retourne la ligne V3 + placeholder metadata {}', async () => {
    const { client } = createMockClient({ data: FIXTURE_V3_RAW, error: null })
    const result = await getCeeDossierByIdV3(client, FIXTURE_V3_RAW.id)
    expect(result).not.toBeNull()
    expect(result?.id).toBe(FIXTURE_V3_RAW.id)
    expect(result?.reference).toBe('SAE-202604-000001')
    expect(result?.prime_total_cts).toBe(140000)
    expect(result?.client_code_postal).toBe('75011')
    // metadata est un placeholder constant {} (colonne absente de la table V3)
    expect(result?.metadata).toEqual({})
  })

  it('SELECT ne cible que des colonnes V3 — aucune colonne 402 morte', async () => {
    const { client, selectArgs } = createMockClient({ data: FIXTURE_V3_RAW, error: null })
    await getCeeDossierByIdV3(client, FIXTURE_V3_RAW.id)
    expect(selectArgs).toHaveLength(1)
    const cols = selectArgs[0]
    for (const dead of DEAD_402_COLUMNS) {
      expect(cols).not.toContain(dead)
    }
    // metadata n'existe pas en V3 → ne doit pas être sélectionnée
    expect(cols.split(',')).not.toContain('metadata')
    // colonnes V3 attendues présentes
    expect(cols).toContain('client_code_postal')
    expect(cols).toContain('date_devis')
    expect(cols).toContain('prime_total_cts')
    expect(cols).toContain('reste_a_charge_cts')
  })

  it('fail-open : erreur DB → null', async () => {
    const { client } = createMockClient({ data: null, error: { message: 'timeout' } })
    const result = await getCeeDossierByIdV3(client, FIXTURE_V3_RAW.id)
    expect(result).toBeNull()
  })

  it('dossier introuvable (data null sans erreur) → null', async () => {
    const { client } = createMockClient({ data: null, error: null })
    const result = await getCeeDossierByIdV3(client, FIXTURE_V3_RAW.id)
    expect(result).toBeNull()
  })

  it('id vide : retourne null sans toucher à la DB', async () => {
    const { client, fromSpy } = createMockClient({ data: null, error: null })
    const result = await getCeeDossierByIdV3(client, '')
    expect(result).toBeNull()
    expect(fromSpy).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// listCeeDossiersForProviderV3
// ---------------------------------------------------------------------------

describe('listCeeDossiersForProviderV3', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('happy path : retourne la liste V3, chaque ligne avec metadata {}', async () => {
    const { client } = createMockClient({
      data: [FIXTURE_V3_RAW, { ...FIXTURE_V3_RAW, id: '00000000-0000-0000-0000-000000000002' }],
      error: null,
    })
    const result = await listCeeDossiersForProviderV3(client, FIXTURE_V3_RAW.provider_id)
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe(FIXTURE_V3_RAW.id)
    result.forEach((r: CeeDossierV3Row) => expect(r.metadata).toEqual({}))
  })

  it('aucun dossier : retourne []', async () => {
    const { client } = createMockClient({ data: [], error: null })
    const result = await listCeeDossiersForProviderV3(client, FIXTURE_V3_RAW.provider_id)
    expect(result).toEqual([])
  })

  it('fail-open : erreur DB → []', async () => {
    const { client } = createMockClient({ data: null, error: { message: 'connection refused' } })
    const result = await listCeeDossiersForProviderV3(client, FIXTURE_V3_RAW.provider_id)
    expect(result).toEqual([])
  })

  it('SELECT ne cible que des colonnes V3 — aucune colonne 402 morte', async () => {
    const { client, selectArgs } = createMockClient({ data: [], error: null })
    await listCeeDossiersForProviderV3(client, FIXTURE_V3_RAW.provider_id)
    const cols = selectArgs[0]
    for (const dead of DEAD_402_COLUMNS) {
      expect(cols).not.toContain(dead)
    }
  })

  it('providerId vide : retourne [] sans toucher à la DB', async () => {
    const { client, fromSpy } = createMockClient({ data: null, error: null })
    const result = await listCeeDossiersForProviderV3(client, '')
    expect(result).toEqual([])
    expect(fromSpy).not.toHaveBeenCalled()
  })
})
