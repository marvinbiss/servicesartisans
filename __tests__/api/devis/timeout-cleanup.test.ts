/**
 * Tests — /api/devis race timeouts cleanup
 *
 * Verrouille le fait que les DEUX `Promise.race` de la route `/api/devis`
 * (Pipedrive CRM sync puis CEE dispatcher) clear leur `setTimeout` en
 * `finally`. Sans ce clear, le timer continue de tourner jusqu'à son firing
 * (4s Pipedrive, 8s CEE) même lorsque la promesse "utile" a résolu en
 * quelques ms — sur une lambda Vercel serverless, cela maintient le handle
 * vivant et peut empêcher la lambda de se terminer / générer des warns
 * "MODULE_ENDED_WITH_PENDING_HANDLES".
 *
 * Stratégie :
 *   1. On mocke toutes les dépendances externes de la route (Supabase, email,
 *      dispatch, Pipedrive, CEE qualify/dispatcher, rate limit, auth, logger).
 *   2. On spy `global.clearTimeout` et on compte combien de fois il est
 *      invoqué avec un handle issu de `setTimeout`.
 *   3. Avant le fix vague 3, SEUL le bloc CEE call `clearTimeout` → le test
 *      fail (attend 2, observe 1).
 *   4. Après le fix, Pipedrive clear aussi → le test passe (2 clears).
 *
 * On reste en timers réels : les promesses "utiles" (Pipedrive, CEE) résolvent
 * immédiatement, donc la race est gagnée avant le firing du timer, et le
 * finally peut effectivement clear un timer encore armé.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ============================================
// Mocks — toutes les deps de la route
// ============================================

const mockJsonFn = vi.fn(
  (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
    body,
    status: init?.status ?? 200,
    headers: init?.headers ?? {},
  })
)

vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) =>
      mockJsonFn(body, init),
  },
}))

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

vi.mock('@/lib/rate-limiter', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true, resetTime: Date.now() + 60_000 }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

// Supabase admin — minimal stub that supports the chained calls used in route.ts
const LEAD_ID = '550e8400-e29b-41d4-a716-446655440123'

function makeAdminClient() {
  // dédup lookup : .from('devis_requests').select('id').eq().eq().eq().gte().limit()
  const dedupBuilder: Record<string, unknown> = {}
  dedupBuilder.select = vi.fn().mockReturnValue(dedupBuilder)
  dedupBuilder.eq = vi.fn().mockReturnValue(dedupBuilder)
  dedupBuilder.gte = vi.fn().mockReturnValue(dedupBuilder)
  ;(dedupBuilder as Record<string, unknown>).limit = vi
    .fn()
    .mockResolvedValue({ data: [], error: null })

  // per-email count lookup (head: true)
  const countBuilder: Record<string, unknown> = {}
  countBuilder.select = vi.fn().mockReturnValue(countBuilder)
  countBuilder.eq = vi.fn().mockReturnValue(countBuilder)
  ;(countBuilder as Record<string, unknown>).gte = vi
    .fn()
    .mockResolvedValue({ count: 0, error: null })

  // insert + select + single
  const insertBuilder: Record<string, unknown> = {}
  insertBuilder.insert = vi.fn().mockReturnValue(insertBuilder)
  insertBuilder.select = vi.fn().mockReturnValue(insertBuilder)
  insertBuilder.single = vi.fn().mockResolvedValue({ data: { id: LEAD_ID }, error: null })

  // update (CEE flag) and analytics insert — ignore shape, just resolve
  const passthrough: Record<string, unknown> = {}
  passthrough.update = vi.fn().mockReturnValue(passthrough)
  passthrough.eq = vi.fn().mockResolvedValue({ error: null })
  passthrough.insert = vi.fn().mockReturnValue({
    then: (resolve: (v: unknown) => unknown) => resolve({ error: null }),
  })

  let fromCall = 0
  return {
    from: vi.fn((table: string) => {
      fromCall++
      if (table === 'analytics_events') return passthrough
      if (table !== 'devis_requests') return passthrough
      // fromCall 1 = dedup select, 2 = count, 3 = insert, 4+ = updates
      if (fromCall === 1) return dedupBuilder
      if (fromCall === 2) return countBuilder
      if (fromCall === 3) return insertBuilder
      return passthrough
    }),
  }
}

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => makeAdminClient()),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  }),
}))

vi.mock('@/lib/api/resend-client', () => ({
  getResendClient: vi.fn(() => ({
    emails: { send: vi.fn().mockResolvedValue({ id: 'email-stub' }) },
  })),
  sendEmail: vi.fn().mockResolvedValue({
    id: 'email-stub',
    from: 'noreply@servicesartisans.fr',
    to: ['stub@test.fr'],
    createdAt: new Date(),
  }),
}))

vi.mock('@/app/actions/dispatch', () => ({
  dispatchLead: vi.fn().mockResolvedValue(['provider-1', 'provider-2']),
}))

vi.mock('@/lib/dashboard/events', () => ({
  logLeadEvent: vi.fn().mockResolvedValue(undefined),
}))

// Pipedrive : résoud immédiatement → la race doit gagner avant firing du timer
const mockSyncPipedrive = vi.fn().mockResolvedValue(undefined)
vi.mock('@/lib/integrations/pipedrive', () => ({
  syncDevisRequestToPipedrive: (...args: unknown[]) => mockSyncPipedrive(...args),
}))

// CEE qualify : on force eligible=true pour entrer dans le bloc dispatcher
vi.mock('@/lib/cee/qualify', () => ({
  qualifyDevisForCee: vi.fn().mockResolvedValue({ eligible: true, codes: ['BAR-TH-104'] }),
}))

// CEE dispatcher : résoud immédiatement → la race CEE gagne avant timer
const mockCeeDispatch = vi.fn().mockResolvedValue(null)
vi.mock('@/lib/cee/dispatcher-integration', () => ({
  runCeeDispatchFireAndForget: (...args: unknown[]) => mockCeeDispatch(...args),
}))

// ============================================
// Helpers
// ============================================

function buildRequest(): Request {
  return new Request('http://localhost/api/devis', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      service: 'chauffagiste',
      urgency: 'semaine',
      nom: 'Jean Dupont',
      email: 'jean@example.com',
      telephone: '0612345678',
      ville: 'Paris',
      codePostal: '75011',
      description: 'Installation PAC',
    }),
  })
}

// ============================================
// Tests
// ============================================

describe('/api/devis — race timeout cleanup', () => {
  let clearTimeoutSpy: ReturnType<typeof vi.spyOn>
  let setTimeoutSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
    setTimeoutSpy = vi.spyOn(global, 'setTimeout')
  })

  afterEach(() => {
    clearTimeoutSpy.mockRestore()
    setTimeoutSpy.mockRestore()
  })

  it('clear BOTH timers on happy path (Pipedrive 4s + CEE 8s)', async () => {
    const { POST } = await import('@/app/api/devis/route')

    const res = (await POST(buildRequest())) as unknown as {
      body: { success?: boolean }
      status: number
    }

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)

    // Collecte des timeouts que la route a armés, filtrés par durée connue.
    // (4000 = Pipedrive, 8000 = CEE dispatcher)
    const armedHandles = new Set<ReturnType<typeof setTimeout>>()
    for (const call of setTimeoutSpy.mock.results) {
      if (call.type === 'return') {
        armedHandles.add(call.value as ReturnType<typeof setTimeout>)
      }
    }

    const armedDurations = setTimeoutSpy.mock.calls.map((c: unknown[]) => c[1])
    // Sanity : on doit bien avoir armé au moins les deux timers d'intérêt
    expect(armedDurations).toContain(4000)
    expect(armedDurations).toContain(8000)

    // Les deux handles correspondants doivent avoir été clearés
    const cleared = new Set(
      clearTimeoutSpy.mock.calls.map((c: unknown[]) => c[0] as ReturnType<typeof setTimeout>)
    )

    // Récupère les handles spécifiquement attachés à 4000 et 8000
    const handle4s = setTimeoutSpy.mock.results[
      setTimeoutSpy.mock.calls.findIndex((c: unknown[]) => c[1] === 4000)
    ]?.value as ReturnType<typeof setTimeout> | undefined
    const handle8s = setTimeoutSpy.mock.results[
      setTimeoutSpy.mock.calls.findIndex((c: unknown[]) => c[1] === 8000)
    ]?.value as ReturnType<typeof setTimeout> | undefined

    expect(handle4s).toBeDefined()
    expect(handle8s).toBeDefined()
    // Clear Pipedrive (vague 3) + CEE (vague 2) — DOIVENT être cleared
    expect(cleared.has(handle4s!)).toBe(true)
    expect(cleared.has(handle8s!)).toBe(true)
  })
})
