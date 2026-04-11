/**
 * Tests — Intégration CEE dispatch dans le tunnel devis
 * (`src/lib/cee/dispatcher-integration.ts`)
 *
 * Objectifs :
 *   1. Le helper `runCeeDispatchFireAndForget` ne JAMAIS throw même si le
 *      dispatcher sous-jacent throw (fail-OPEN côté tunnel devis).
 *   2. Si outcome = `cee_routed`, le `cee_dossier_id` est persisté sur
 *      `devis_requests`.
 *   3. Si outcome = `fallback_non_cee`, aucune écriture côté devis.
 *   4. Si outcome = `error`, aucune écriture côté devis, pas de throw.
 *   5. Zéro PII dans les logs (action + devisId + serviceSlug uniquement).
 *
 * On mocke le dispatcher et le client Supabase pour isoler la frontière
 * tunnel devis ↔ brique CEE.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { DispatchOutcome } from '@/lib/cee/dispatcher'

// ============================================
// Mocks
// ============================================

const mockDispatchDevis = vi.fn()
vi.mock('@/lib/cee/dispatcher', () => ({
  dispatchDevis: (...args: unknown[]) => mockDispatchDevis(...args),
}))

const loggerWarn = vi.fn()
const loggerInfo = vi.fn()
const loggerError = vi.fn()
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: (...args: unknown[]) => loggerInfo(...args),
    warn: (...args: unknown[]) => loggerWarn(...args),
    error: (...args: unknown[]) => loggerError(...args),
  },
}))

// ============================================
// Helpers
// ============================================

const DEVIS_ID = '550e8400-e29b-41d4-a716-446655440001'
const CLIENT_ID = '550e8400-e29b-41d4-a716-446655440002'
const PROVIDER_1 = '550e8400-e29b-41d4-a716-446655440010'
const PROVIDER_2 = '550e8400-e29b-41d4-a716-446655440011'
const DOSSIER_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'

interface UpdateCall {
  payload: Record<string, unknown>
  eqColumn: string
  eqValue: unknown
}

/**
 * Mock Supabase client minimaliste : capture les updates sur `devis_requests`
 * pour vérifier la persistance du `cee_dossier_id`.
 */
function makeMockSupabase(updateError: string | null = null) {
  const updateCalls: UpdateCall[] = []

  const fromFn = vi.fn((table: string) => {
    if (table !== 'devis_requests') {
      throw new Error(`Unexpected table in test: ${table}`)
    }
    return {
      update: (payload: Record<string, unknown>) => ({
        eq: (eqColumn: string, eqValue: unknown) => {
          updateCalls.push({ payload, eqColumn, eqValue })
          return Promise.resolve({
            error: updateError ? { message: updateError } : null,
          })
        },
      }),
    }
  })

  return {
    client: { from: fromFn } as never,
    updateCalls,
    fromFn,
  }
}

function routedOutcome(dossierId = DOSSIER_ID): DispatchOutcome {
  return {
    kind: 'cee_routed',
    operationCode: 'BAR-TH-104',
    providerId: PROVIDER_1,
    delegataireId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    dossierId,
    primeEstimate: {
      kwhc_min: 100,
      kwhc_max: 200,
      euros_classique_min: 50,
      euros_classique_max: 100,
      zone: 'H1',
    },
    justificatifsRequis: [{ code: 'PVPLUS', label: 'Procès-verbal', obligatoire: true }],
  }
}

function fallbackOutcome(): DispatchOutcome {
  return {
    kind: 'fallback_non_cee',
    reason: 'no_rge_provider',
    providerId: PROVIDER_1,
  }
}

function errorOutcome(): DispatchOutcome {
  return { kind: 'error', message: 'dossier_creation_failed' }
}

const baseInput = {
  devisId: DEVIS_ID,
  clientId: CLIENT_ID,
  serviceSlug: 'chauffagiste',
  postalCode: '75011',
  candidateProviderIds: [PROVIDER_1, PROVIDER_2],
}

// ============================================
// Setup
// ============================================

beforeEach(() => {
  vi.clearAllMocks()
})

// ============================================
// Tests
// ============================================

describe('runCeeDispatchFireAndForget — fail-open frontière tunnel devis', () => {
  it('ne throw JAMAIS même si le dispatcher throw (fail-open)', async () => {
    mockDispatchDevis.mockRejectedValueOnce(new Error('boom dispatcher'))

    const { runCeeDispatchFireAndForget } = await import('@/lib/cee/dispatcher-integration')
    const { client, updateCalls } = makeMockSupabase()

    // Ne doit PAS rejeter.
    const result = await runCeeDispatchFireAndForget(client, baseInput)

    expect(result).toBeNull()
    // Aucune écriture côté devis (pas de dossier créé).
    expect(updateCalls).toHaveLength(0)
    // Logged en warn avec action='cee-dispatch' et zéro PII.
    expect(loggerWarn).toHaveBeenCalled()
    const warnCall = loggerWarn.mock.calls[0]
    const warnContext = warnCall[1] as Record<string, unknown>
    expect(warnContext.action).toBe('cee-dispatch')
    expect(warnContext.devisId).toBe(DEVIS_ID)
    // Zéro PII : pas de email/telephone/nom/description dans le contexte.
    expect(warnContext.email).toBeUndefined()
    expect(warnContext.phone).toBeUndefined()
    expect(warnContext.name).toBeUndefined()
  })

  it('persiste cee_dossier_id sur devis_requests quand outcome=cee_routed', async () => {
    mockDispatchDevis.mockResolvedValueOnce(routedOutcome())

    const { runCeeDispatchFireAndForget } = await import('@/lib/cee/dispatcher-integration')
    const { client, updateCalls } = makeMockSupabase()

    const result = await runCeeDispatchFireAndForget(client, baseInput)

    expect(result?.kind).toBe('cee_routed')
    expect(updateCalls).toHaveLength(1)
    expect(updateCalls[0]).toMatchObject({
      payload: { cee_dossier_id: DOSSIER_ID },
      eqColumn: 'id',
      eqValue: DEVIS_ID,
    })
  })

  it("n'écrit rien sur le devis quand outcome=fallback_non_cee", async () => {
    mockDispatchDevis.mockResolvedValueOnce(fallbackOutcome())

    const { runCeeDispatchFireAndForget } = await import('@/lib/cee/dispatcher-integration')
    const { client, updateCalls, fromFn } = makeMockSupabase()

    const result = await runCeeDispatchFireAndForget(client, baseInput)

    expect(result?.kind).toBe('fallback_non_cee')
    expect(updateCalls).toHaveLength(0)
    expect(fromFn).not.toHaveBeenCalled()
    // Un log info explicatif du fallback, pas un warn/error.
    expect(loggerInfo).toHaveBeenCalled()
  })

  it("n'écrit rien quand outcome=error, log en warn sans re-throw", async () => {
    mockDispatchDevis.mockResolvedValueOnce(errorOutcome())

    const { runCeeDispatchFireAndForget } = await import('@/lib/cee/dispatcher-integration')
    const { client, updateCalls } = makeMockSupabase()

    const result = await runCeeDispatchFireAndForget(client, baseInput)

    expect(result?.kind).toBe('error')
    expect(updateCalls).toHaveLength(0)
    expect(loggerWarn).toHaveBeenCalled()
    const warnCall = loggerWarn.mock.calls[0]
    const warnContext = warnCall[1] as Record<string, unknown>
    expect(warnContext.action).toBe('cee-dispatch')
  })

  it('absorbe une erreur de persist sans re-throw (UPDATE devis_requests fail)', async () => {
    mockDispatchDevis.mockResolvedValueOnce(routedOutcome())

    const { runCeeDispatchFireAndForget } = await import('@/lib/cee/dispatcher-integration')
    const { client, updateCalls } = makeMockSupabase('permission denied for table devis_requests')

    const result = await runCeeDispatchFireAndForget(client, baseInput)

    // Le dispatcher a réussi, l'outcome est bien cee_routed,
    // seule la persistance a échoué — on log en warn, pas de throw.
    expect(result?.kind).toBe('cee_routed')
    expect(updateCalls).toHaveLength(1)
    expect(loggerWarn).toHaveBeenCalled()
    const persistWarn = loggerWarn.mock.calls.find(
      (c) =>
        typeof c[1] === 'object' &&
        c[1] !== null &&
        (c[1] as Record<string, unknown>).action === 'cee-dispatch-persist'
    )
    expect(persistWarn).toBeDefined()
  })

  it('anonymous submission : passe clientId=null au dispatcher (pas lead.id)', async () => {
    mockDispatchDevis.mockResolvedValueOnce(fallbackOutcome())

    const { runCeeDispatchFireAndForget } = await import('@/lib/cee/dispatcher-integration')
    const { client } = makeMockSupabase()

    await runCeeDispatchFireAndForget(client, {
      ...baseInput,
      clientId: null,
    })

    expect(mockDispatchDevis).toHaveBeenCalledTimes(1)
    const callArgs = mockDispatchDevis.mock.calls[0]
    expect(callArgs[1]).toMatchObject({
      devisId: DEVIS_ID,
      clientId: null,
      serviceSlug: 'chauffagiste',
      candidateProviderIds: [PROVIDER_1, PROVIDER_2],
    })
  })

  it('appelle dispatchDevis avec le postalCode null si non fourni', async () => {
    mockDispatchDevis.mockResolvedValueOnce(fallbackOutcome())

    const { runCeeDispatchFireAndForget } = await import('@/lib/cee/dispatcher-integration')
    const { client } = makeMockSupabase()

    await runCeeDispatchFireAndForget(client, {
      ...baseInput,
      postalCode: undefined,
    })

    expect(mockDispatchDevis).toHaveBeenCalledTimes(1)
    const callArgs = mockDispatchDevis.mock.calls[0]
    // callArgs[0] = supabase client, callArgs[1] = DispatchInput
    expect(callArgs[1]).toMatchObject({
      devisId: DEVIS_ID,
      clientId: CLIENT_ID,
      serviceSlug: 'chauffagiste',
      postalCode: null,
      candidateProviderIds: [PROVIDER_1, PROVIDER_2],
    })
  })
})
