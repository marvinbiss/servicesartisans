/**
 * Tests unitaires — src/lib/cee/dossiers.ts
 * -------------------------------------------
 * Pattern mock chainable identique à `qualify.test.ts` / `delegataires.test.ts`.
 * Couvre create / get / list / transition : happy path + erreurs DB.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createCeeDossier,
  getCeeDossierById,
  listCeeDossiersForProvider,
  transitionCeeDossierStatus,
} from '@/lib/cee/dossiers'
import type { CeeDossier } from '@/lib/cee/dossier-types'

// ---------------------------------------------------------------------------
// Mock Supabase builder — chainable thenable
// ---------------------------------------------------------------------------

interface MockResponse {
  data: unknown
  error: { message: string } | null
}

function createMockClient(responses: MockResponse[]) {
  let callIndex = 0

  const buildChain = () => {
    const next: MockResponse = responses[callIndex] ?? { data: null, error: null }
    callIndex++

    const chain: Record<string, unknown> = {}
    const methods = [
      'select',
      'insert',
      'update',
      'eq',
      'in',
      'contains',
      'order',
      'range',
      'limit',
    ]
    for (const m of methods) {
      chain[m] = vi.fn(() => chain)
    }
    // Terminal methods resolve to the mock response
    chain.single = vi.fn(() => Promise.resolve(next))
    chain.maybeSingle = vi.fn(() => Promise.resolve(next))

    // Chain itself is thenable for queries that resolve without .single()
    chain.then = (
      onFulfilled: (v: MockResponse) => unknown,
      onRejected?: (e: unknown) => unknown
    ) => Promise.resolve(next).then(onFulfilled, onRejected)

    return chain
  }

  return {
    from: vi.fn((table: string) => {
      expect(table).toBe('cee_dossiers')
      return buildChain()
    }),
  } as unknown as Parameters<typeof createCeeDossier>[0]
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const FIXTURE_DOSSIER: CeeDossier = {
  id: '00000000-0000-0000-0000-000000000001',
  devis_id: null,
  client_id: '00000000-0000-0000-0000-0000000000c1',
  provider_id: '00000000-0000-0000-0000-0000000000p1',
  delegataire_id: null,
  operation_code: 'BAR-EN-101',
  status: 'brouillon',
  date_engagement: null,
  date_pre_visite: null,
  date_debut_travaux: null,
  date_fin_travaux: null,
  date_ah_signature: null,
  date_depot_delegataire: null,
  date_depot_pncee: null,
  date_validation: null,
  zone_climatique: 'H1',
  postal_code: '75001',
  kwhc_estime: 12000,
  kwhc_depose: null,
  prime_estimee_eur: 150,
  prime_versee_eur: null,
  precarite: false,
  justificatifs: [],
  rejection_reason: null,
  notes: null,
  metadata: {},
  created_at: '2026-04-11T10:00:00.000Z',
  updated_at: '2026-04-11T10:00:00.000Z',
}

// ---------------------------------------------------------------------------
// createCeeDossier
// ---------------------------------------------------------------------------

describe('createCeeDossier', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('happy path : retourne le dossier créé', async () => {
    const client = createMockClient([{ data: FIXTURE_DOSSIER, error: null }])
    const result = await createCeeDossier(client, {
      provider_id: FIXTURE_DOSSIER.provider_id,
      operation_code: 'BAR-EN-101',
      client_id: FIXTURE_DOSSIER.client_id,
      zone_climatique: 'H1',
      postal_code: '75001',
      kwhc_estime: 12000,
      prime_estimee_eur: 150,
    })
    expect(result).not.toBeNull()
    expect(result?.id).toBe(FIXTURE_DOSSIER.id)
    expect(result?.operation_code).toBe('BAR-EN-101')
  })

  it('erreur DB : retourne null', async () => {
    const client = createMockClient([{ data: null, error: { message: 'constraint violation' } }])
    const result = await createCeeDossier(client, {
      provider_id: FIXTURE_DOSSIER.provider_id,
      operation_code: 'BAR-EN-101',
    })
    expect(result).toBeNull()
  })

  it('data null sans erreur : retourne null', async () => {
    const client = createMockClient([{ data: null, error: null }])
    const result = await createCeeDossier(client, {
      provider_id: FIXTURE_DOSSIER.provider_id,
      operation_code: 'BAR-EN-101',
    })
    expect(result).toBeNull()
  })

  it('accepte client_id: null (soumission devis anonyme, pas de profil)', async () => {
    const anonDossier: CeeDossier = { ...FIXTURE_DOSSIER, client_id: null }
    let capturedPayload: Record<string, unknown> | null = null
    const chain: Record<string, unknown> = {}
    chain.insert = vi.fn((payload: Record<string, unknown>) => {
      capturedPayload = payload
      return chain
    })
    chain.select = vi.fn(() => chain)
    chain.single = vi.fn(() => Promise.resolve({ data: anonDossier, error: null }))
    const client = {
      from: vi.fn(() => chain),
    } as unknown as Parameters<typeof createCeeDossier>[0]

    const result = await createCeeDossier(client, {
      provider_id: FIXTURE_DOSSIER.provider_id,
      operation_code: 'BAR-EN-101',
      client_id: null,
    })
    expect(result).not.toBeNull()
    expect(result?.client_id).toBeNull()
    // Vérifie que l'insert a bien reçu client_id=null (pas undefined)
    expect(capturedPayload).not.toBeNull()
    expect((capturedPayload as unknown as Record<string, unknown>).client_id).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// getCeeDossierById
// ---------------------------------------------------------------------------

describe('getCeeDossierById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('dossier trouvé : retourne la ligne', async () => {
    const client = createMockClient([{ data: FIXTURE_DOSSIER, error: null }])
    const result = await getCeeDossierById(client, FIXTURE_DOSSIER.id)
    expect(result).not.toBeNull()
    expect(result?.id).toBe(FIXTURE_DOSSIER.id)
  })

  it('dossier introuvable : retourne null', async () => {
    const client = createMockClient([{ data: null, error: null }])
    const result = await getCeeDossierById(client, FIXTURE_DOSSIER.id)
    expect(result).toBeNull()
  })

  it('erreur DB : retourne null', async () => {
    const client = createMockClient([{ data: null, error: { message: 'timeout' } }])
    const result = await getCeeDossierById(client, FIXTURE_DOSSIER.id)
    expect(result).toBeNull()
  })

  it('id vide : retourne null sans toucher à la DB', async () => {
    const client = createMockClient([])
    const result = await getCeeDossierById(client, '')
    expect(result).toBeNull()
    expect((client as unknown as { from: ReturnType<typeof vi.fn> }).from).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// listCeeDossiersForProvider
// ---------------------------------------------------------------------------

describe('listCeeDossiersForProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('aucun dossier : retourne []', async () => {
    const client = createMockClient([{ data: [], error: null }])
    const result = await listCeeDossiersForProvider(client, FIXTURE_DOSSIER.provider_id)
    expect(result).toEqual([])
  })

  it('plusieurs dossiers : retourne la liste', async () => {
    const client = createMockClient([
      {
        data: [FIXTURE_DOSSIER, { ...FIXTURE_DOSSIER, id: '00000000-0000-0000-0000-000000000002' }],
        error: null,
      },
    ])
    const result = await listCeeDossiersForProvider(client, FIXTURE_DOSSIER.provider_id)
    expect(result.length).toBe(2)
    expect(result[0].id).toBe(FIXTURE_DOSSIER.id)
  })

  it('erreur DB : retourne []', async () => {
    const client = createMockClient([{ data: null, error: { message: 'connection refused' } }])
    const result = await listCeeDossiersForProvider(client, FIXTURE_DOSSIER.provider_id)
    expect(result).toEqual([])
  })

  it('providerId vide : retourne [] sans toucher à la DB', async () => {
    const client = createMockClient([])
    const result = await listCeeDossiersForProvider(client, '')
    expect(result).toEqual([])
    expect((client as unknown as { from: ReturnType<typeof vi.fn> }).from).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// transitionCeeDossierStatus
// ---------------------------------------------------------------------------

describe('transitionCeeDossierStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Helper : mock Supabase RPC-only (plus besoin de .from() depuis le fix
   * atomique — la transition passe intégralement par la RPC
   * `transition_cee_dossier_status`, migration 410).
   */
  function createRpcClient(rpcResult: {
    data: unknown
    error: { message: string; code?: string } | null
  }) {
    const rpcCalls: Array<{ fn: string; args: Record<string, unknown> }> = []
    const fromSpy = vi.fn(() => {
      throw new Error('from() ne doit pas être appelé — RPC only')
    })
    const client = {
      from: fromSpy,
      rpc: vi.fn((fn: string, args: Record<string, unknown>) => {
        rpcCalls.push({ fn, args })
        return Promise.resolve(rpcResult)
      }),
    }
    return {
      client: client as unknown as Parameters<typeof transitionCeeDossierStatus>[0],
      rpcCalls,
      fromSpy,
    }
  }

  it('happy path : RPC retourne { ok:true } → wrapper retourne { ok:true }', async () => {
    const { client, rpcCalls, fromSpy } = createRpcClient({
      data: { ok: true, dossier_id: FIXTURE_DOSSIER.id, status: 'engagement_signe' },
      error: null,
    })
    const result = await transitionCeeDossierStatus(
      client,
      FIXTURE_DOSSIER.id,
      'engagement_signe',
      '00000000-0000-0000-0000-0000000000a1',
      'admin'
    )
    expect(result.ok).toBe(true)
    expect(result.error).toBeUndefined()
    // RPC a bien été appelée avec les bons paramètres (pas de .from())
    expect(fromSpy).not.toHaveBeenCalled()
    expect(rpcCalls).toHaveLength(1)
    expect(rpcCalls[0].fn).toBe('transition_cee_dossier_status')
    expect(rpcCalls[0].args).toEqual({
      p_dossier_id: FIXTURE_DOSSIER.id,
      p_to_status: 'engagement_signe',
      p_actor_id: '00000000-0000-0000-0000-0000000000a1',
      p_actor_type: 'admin',
    })
  })

  it('RPC retourne { ok:false, reason:not_found } → erreur "dossier introuvable"', async () => {
    const { client } = createRpcClient({
      data: { ok: false, reason: 'not_found' },
      error: null,
    })
    const result = await transitionCeeDossierStatus(
      client,
      FIXTURE_DOSSIER.id,
      'engagement_signe',
      null,
      'system'
    )
    expect(result.ok).toBe(false)
    expect(result.error).toBe('dossier introuvable')
  })

  it("RPC error (trigger DAG block) → fail-closed avec message d'erreur", async () => {
    const { client } = createRpcClient({
      data: null,
      error: { message: 'Transition de statut illégale : brouillon → valide' },
    })
    const result = await transitionCeeDossierStatus(
      client,
      FIXTURE_DOSSIER.id,
      'valide',
      null,
      'system'
    )
    expect(result.ok).toBe(false)
    expect(result.error).toContain('illégale')
  })

  it('RPC error (missing function, network) → fail-closed', async () => {
    const { client } = createRpcClient({
      data: null,
      error: {
        message: 'Could not find the function transition_cee_dossier_status',
        code: 'PGRST202',
      },
    })
    const result = await transitionCeeDossierStatus(
      client,
      FIXTURE_DOSSIER.id,
      'engagement_signe',
      null,
      'system'
    )
    expect(result.ok).toBe(false)
    expect(result.error).toContain('Could not find the function')
  })

  it('RPC payload vide (data=null sans error) → fail-closed rpc_empty_payload', async () => {
    const { client } = createRpcClient({ data: null, error: null })
    const result = await transitionCeeDossierStatus(
      client,
      FIXTURE_DOSSIER.id,
      'engagement_signe',
      null,
      'system'
    )
    expect(result.ok).toBe(false)
    expect(result.error).toBe('rpc_empty_payload')
  })

  it('RPC retourne un array (PostgREST wrapping) → payload normalisé (Bug #3)', async () => {
    // Certaines versions de PostgREST wrappent la réponse d'une fonction
    // scalaire JSONB en array `[{...}]`. Le wrapper doit normaliser ça.
    const { client } = createRpcClient({
      data: [{ ok: true, dossier_id: FIXTURE_DOSSIER.id, status: 'engagement_signe' }],
      error: null,
    })
    const result = await transitionCeeDossierStatus(
      client,
      FIXTURE_DOSSIER.id,
      'engagement_signe',
      null,
      'system'
    )
    expect(result.ok).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('RPC retourne un array avec ok:false reason → normalisé aussi (Bug #3)', async () => {
    const { client } = createRpcClient({
      data: [{ ok: false, reason: 'not_found' }],
      error: null,
    })
    const result = await transitionCeeDossierStatus(
      client,
      FIXTURE_DOSSIER.id,
      'engagement_signe',
      null,
      'system'
    )
    expect(result.ok).toBe(false)
    expect(result.error).toBe('dossier introuvable')
  })

  it('id vide : retourne { ok: false } sans toucher à la DB ni à la RPC', async () => {
    const { client, fromSpy } = createRpcClient({ data: null, error: null })
    const result = await transitionCeeDossierStatus(client, '', 'engagement_signe', null, 'system')
    expect(result.ok).toBe(false)
    expect(fromSpy).not.toHaveBeenCalled()
    expect((client as unknown as { rpc: ReturnType<typeof vi.fn> }).rpc).not.toHaveBeenCalled()
  })
})
