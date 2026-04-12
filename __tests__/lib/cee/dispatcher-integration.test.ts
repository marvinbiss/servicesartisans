/**
 * Tests unitaires — src/lib/cee/dispatcher-integration.ts
 * --------------------------------------------------------
 * Stratégie : on mock les modules aval (dispatcher, emails, artisan-notification)
 * et Supabase pour tester l'orchestration fire-and-forget en isolation.
 *
 * Couverture :
 * - Core dispatch (cee_routed, fallback_non_cee, error, exception)
 * - Analytics events (insert cee_dispatch_routed / cee_dispatch_fallback)
 * - Fail-open (chaque side-effect peut crasher sans propager)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks modules aval
// ---------------------------------------------------------------------------

vi.mock('@/lib/cee/dispatcher', () => ({
  dispatchDevis: vi.fn(),
}))

vi.mock('@/lib/cee/emails', () => ({
  sendCeeEligibilityEmail: vi.fn(),
}))

vi.mock('@/lib/cee/artisan-notification', () => ({
  sendCeeArtisanBriefing: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

import {
  runCeeDispatchFireAndForget,
  type CeeDispatchInput,
} from '@/lib/cee/dispatcher-integration'
import { dispatchDevis } from '@/lib/cee/dispatcher'
import { sendCeeEligibilityEmail } from '@/lib/cee/emails'
import { sendCeeArtisanBriefing } from '@/lib/cee/artisan-notification'
import { logger } from '@/lib/logger'
import type { DispatchOutcome } from '@/lib/cee/dispatcher'

const mockedDispatch = vi.mocked(dispatchDevis)
const mockedEligibilityEmail = vi.mocked(sendCeeEligibilityEmail)
const mockedArtisanBriefing = vi.mocked(sendCeeArtisanBriefing)
const mockedLogger = vi.mocked(logger)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Input de base réutilisable. */
function baseInput(overrides: Partial<CeeDispatchInput> = {}): CeeDispatchInput {
  return {
    devisId: 'devis-001',
    clientId: 'client-001',
    serviceSlug: 'chauffagiste',
    postalCode: '75001',
    candidateProviderIds: ['prov-aaa'],
    clientName: 'Jean Dupont',
    clientEmail: 'jean@example.com',
    serviceName: 'Chauffagiste',
    ville: 'Paris',
    ...overrides,
  }
}

/** Outcome cee_routed complet. */
function ceeRoutedOutcome(
  overrides: Partial<Extract<DispatchOutcome, { kind: 'cee_routed' }>> = {}
): DispatchOutcome {
  return {
    kind: 'cee_routed',
    operationCode: 'BAR-TH-106',
    operationName: 'Chaudière individuelle à haute performance énergétique',
    providerId: 'prov-aaa',
    delegataireId: 'deleg-001',
    dossierId: 'dossier-xyz',
    primeEstimate: {
      kwhc_min: 10000,
      kwhc_max: 20000,
      euros_classique_min: 300,
      euros_classique_max: 600,
      zone: 'H1',
    },
    justificatifsRequis: [{ code: 'devis_signe', label: 'Devis signé', obligatoire: true }],
    ...overrides,
  }
}

/** Supabase mock chainable avec capture des appels insert/update. */
function createSupabaseMock(
  options: {
    updateError?: { message: string } | null
    insertThenCallback?: boolean
  } = {}
) {
  const { updateError = null } = options

  const insertCalls: Array<{ table: string; data: unknown }> = []
  const updateCalls: Array<{ table: string; data: unknown; eqCol: string; eqVal: unknown }> = []

  const client = {
    from: vi.fn((table: string) => {
      const chain: Record<string, unknown> = {}

      // .update().eq() chain (pour persistCeeDossierLink)
      chain.update = vi.fn((data: unknown) => {
        const updateEntry = { table, data, eqCol: '', eqVal: '' }
        updateCalls.push(updateEntry)
        return {
          eq: vi.fn((col: string, val: unknown) => {
            updateEntry.eqCol = col
            updateEntry.eqVal = val
            return Promise.resolve({ error: updateError })
          }),
        }
      })

      // .insert().then() chain (pour analytics events)
      chain.insert = vi.fn((data: unknown) => {
        insertCalls.push({ table, data })
        // Retourne un thenable pour supporter .then()
        return {
          then: vi.fn((cb: (res: { error: null }) => void) => {
            if (cb) cb({ error: null })
            return Promise.resolve()
          }),
        }
      })

      return chain
    }),
    __insertCalls: insertCalls,
    __updateCalls: updateCalls,
  }

  return client as unknown as Parameters<typeof runCeeDispatchFireAndForget>[0] & {
    __insertCalls: typeof insertCalls
    __updateCalls: typeof updateCalls
  }
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
  mockedEligibilityEmail.mockResolvedValue(undefined)
  mockedArtisanBriefing.mockResolvedValue(undefined)
})

// ===========================================================================
// Core dispatch
// ===========================================================================

describe('runCeeDispatchFireAndForget', () => {
  describe('core dispatch — cee_routed', () => {
    it('appelle persistCeeDossierLink, sendCeeEligibilityEmail et sendCeeArtisanBriefing', async () => {
      const outcome = ceeRoutedOutcome()
      mockedDispatch.mockResolvedValue(outcome)
      const supabase = createSupabaseMock()

      const result = await runCeeDispatchFireAndForget(supabase, baseInput())

      expect(result).toEqual(outcome)

      // persistCeeDossierLink : update devis_requests.cee_dossier_id
      expect(supabase.__updateCalls).toHaveLength(1)
      expect(supabase.__updateCalls[0]).toMatchObject({
        table: 'devis_requests',
        data: { cee_dossier_id: 'dossier-xyz' },
        eqCol: 'id',
        eqVal: 'devis-001',
      })

      // Email éligibilité envoyé
      expect(mockedEligibilityEmail).toHaveBeenCalledOnce()
      expect(mockedEligibilityEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          clientEmail: 'jean@example.com',
          operationCode: 'BAR-TH-106',
        })
      )

      // Briefing artisan envoyé
      expect(mockedArtisanBriefing).toHaveBeenCalledOnce()
      expect(mockedArtisanBriefing).toHaveBeenCalledWith(
        supabase,
        expect.objectContaining({
          providerId: 'prov-aaa',
          dossierId: 'dossier-xyz',
        })
      )
    })

    it("sans clientEmail, n'appelle PAS sendCeeEligibilityEmail", async () => {
      mockedDispatch.mockResolvedValue(ceeRoutedOutcome())
      const supabase = createSupabaseMock()

      await runCeeDispatchFireAndForget(supabase, baseInput({ clientEmail: null }))

      expect(mockedEligibilityEmail).not.toHaveBeenCalled()
      // Le briefing artisan est quand même envoyé
      expect(mockedArtisanBriefing).toHaveBeenCalledOnce()
    })

    it("sans clientEmail (undefined), n'appelle PAS sendCeeEligibilityEmail", async () => {
      mockedDispatch.mockResolvedValue(ceeRoutedOutcome())
      const supabase = createSupabaseMock()

      await runCeeDispatchFireAndForget(supabase, baseInput({ clientEmail: undefined }))

      expect(mockedEligibilityEmail).not.toHaveBeenCalled()
    })
  })

  describe('core dispatch — fallback_non_cee', () => {
    it("n'appelle ni email ni briefing", async () => {
      const outcome: DispatchOutcome = {
        kind: 'fallback_non_cee',
        reason: 'not_eligible',
        providerId: 'prov-aaa',
      }
      mockedDispatch.mockResolvedValue(outcome)
      const supabase = createSupabaseMock()

      const result = await runCeeDispatchFireAndForget(supabase, baseInput())

      expect(result).toEqual(outcome)
      expect(mockedEligibilityEmail).not.toHaveBeenCalled()
      expect(mockedArtisanBriefing).not.toHaveBeenCalled()
      // Pas d'update devis_requests
      expect(supabase.__updateCalls).toHaveLength(0)
    })
  })

  describe('core dispatch — error outcome', () => {
    it("log warn et retourne l'outcome", async () => {
      const outcome: DispatchOutcome = {
        kind: 'error',
        message: 'dispatcher internal failure',
      }
      mockedDispatch.mockResolvedValue(outcome)
      const supabase = createSupabaseMock()

      const result = await runCeeDispatchFireAndForget(supabase, baseInput())

      expect(result).toEqual(outcome)
      expect(mockedLogger.warn).toHaveBeenCalledWith(
        'cee-dispatch: erreur dispatcher, soft-fail',
        expect.objectContaining({
          action: 'cee-dispatch',
          devisId: 'devis-001',
          message: 'dispatcher internal failure',
        })
      )
      expect(mockedEligibilityEmail).not.toHaveBeenCalled()
      expect(mockedArtisanBriefing).not.toHaveBeenCalled()
    })
  })

  describe('core dispatch — exception inattendue', () => {
    it('catch, log warn et retourne null', async () => {
      mockedDispatch.mockRejectedValue(new Error('OOM'))
      const supabase = createSupabaseMock()

      const result = await runCeeDispatchFireAndForget(supabase, baseInput())

      expect(result).toBeNull()
      expect(mockedLogger.warn).toHaveBeenCalledWith(
        'cee-dispatch: exception inattendue, soft-fail',
        expect.objectContaining({
          action: 'cee-dispatch',
          devisId: 'devis-001',
          error: 'OOM',
        })
      )
    })
  })

  // ===========================================================================
  // Analytics
  // ===========================================================================

  describe('analytics', () => {
    it('cee_routed : insère analytics event type cee_dispatch_routed', async () => {
      mockedDispatch.mockResolvedValue(ceeRoutedOutcome())
      const supabase = createSupabaseMock()

      await runCeeDispatchFireAndForget(supabase, baseInput())

      const analyticsInsert = supabase.__insertCalls.find((c) => c.table === 'analytics_events')
      expect(analyticsInsert).toBeDefined()
      expect(analyticsInsert?.data).toMatchObject({
        event_type: 'cee_dispatch_routed',
        metadata: expect.objectContaining({
          devisId: 'devis-001',
          operationCode: 'BAR-TH-106',
        }),
      })
    })

    it('fallback_non_cee : insère analytics event type cee_dispatch_fallback', async () => {
      const outcome: DispatchOutcome = {
        kind: 'fallback_non_cee',
        reason: 'no_rge_provider',
        providerId: null,
      }
      mockedDispatch.mockResolvedValue(outcome)
      const supabase = createSupabaseMock()

      await runCeeDispatchFireAndForget(supabase, baseInput())

      const analyticsInsert = supabase.__insertCalls.find((c) => c.table === 'analytics_events')
      expect(analyticsInsert).toBeDefined()
      expect(analyticsInsert?.data).toMatchObject({
        event_type: 'cee_dispatch_fallback',
        metadata: expect.objectContaining({
          devisId: 'devis-001',
          reason: 'no_rge_provider',
        }),
      })
    })
  })

  // ===========================================================================
  // Fail-open
  // ===========================================================================

  describe('fail-open', () => {
    it('si sendCeeEligibilityEmail throw, le dispatch continue', async () => {
      mockedDispatch.mockResolvedValue(ceeRoutedOutcome())
      mockedEligibilityEmail.mockRejectedValue(new Error('Resend API down'))
      const supabase = createSupabaseMock()

      const result = await runCeeDispatchFireAndForget(supabase, baseInput())

      // Le dispatch a quand même retourné l'outcome
      expect(result).toMatchObject({ kind: 'cee_routed' })
      // Le briefing artisan a quand même été appelé
      expect(mockedArtisanBriefing).toHaveBeenCalledOnce()
    })

    it('si sendCeeArtisanBriefing throw, le dispatch continue', async () => {
      mockedDispatch.mockResolvedValue(ceeRoutedOutcome())
      mockedArtisanBriefing.mockRejectedValue(new Error('Notification service down'))
      const supabase = createSupabaseMock()

      const result = await runCeeDispatchFireAndForget(supabase, baseInput())

      expect(result).toMatchObject({ kind: 'cee_routed' })
      // L'email a quand même été appelé
      expect(mockedEligibilityEmail).toHaveBeenCalledOnce()
    })

    it('si persistCeeDossierLink échoue (supabase error), le dispatch continue', async () => {
      mockedDispatch.mockResolvedValue(ceeRoutedOutcome())
      const supabase = createSupabaseMock({
        updateError: { message: 'constraint violation' },
      })

      const result = await runCeeDispatchFireAndForget(supabase, baseInput())

      // Le dispatch retourne quand même l'outcome
      expect(result).toMatchObject({ kind: 'cee_routed' })
      // Les notifications ont quand même été envoyées
      expect(mockedEligibilityEmail).toHaveBeenCalledOnce()
      expect(mockedArtisanBriefing).toHaveBeenCalledOnce()
      // Le warn a été loggé
      expect(mockedLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('échec persist lien dossier'),
        expect.objectContaining({
          devisId: 'devis-001',
          error: 'constraint violation',
        })
      )
    })

    it('si persistCeeDossierLink throw une exception, le dispatch continue', async () => {
      mockedDispatch.mockResolvedValue(ceeRoutedOutcome())
      // Simule une exception dans .update() (pas juste une erreur Supabase)
      const supabase = createSupabaseMock()
      ;(supabase as unknown as { from: ReturnType<typeof vi.fn> }).from = vi.fn((table: string) => {
        if (table === 'devis_requests') {
          return {
            update: vi.fn(() => ({
              eq: vi.fn(() => Promise.reject(new Error('network timeout'))),
            })),
          }
        }
        // analytics_events
        const insertCalls = (
          supabase as unknown as { __insertCalls: Array<{ table: string; data: unknown }> }
        ).__insertCalls
        return {
          insert: vi.fn((data: unknown) => {
            insertCalls.push({ table, data })
            return {
              then: vi.fn((cb: (res: { error: null }) => void) => {
                if (cb) cb({ error: null })
                return Promise.resolve()
              }),
            }
          }),
        }
      })

      const result = await runCeeDispatchFireAndForget(supabase, baseInput())

      expect(result).toMatchObject({ kind: 'cee_routed' })
      expect(mockedEligibilityEmail).toHaveBeenCalledOnce()
      expect(mockedArtisanBriefing).toHaveBeenCalledOnce()
    })
  })
})
