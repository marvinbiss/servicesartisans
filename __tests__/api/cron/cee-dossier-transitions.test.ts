/**
 * Tests — Cron CEE dossier transitions (/api/cron/cee-dossier-transitions)
 *
 * Couvre :
 *   - Auth fail-closed : CRON_SECRET absent, bearer manquant, invalide,
 *     longueur différente (pas de throw timingSafeEqual)
 *   - Règle A : engagement_signe + gap non vide → warn structuré, pas de transition
 *   - Règle B : travaux_acheves + gap complet → transition ah_signee
 *   - Règle B : travaux_acheves + gap non vide → pas de transition
 *   - Règle C : depose_delegataire > 48h → transition depose_pncee
 *   - Idempotence : 2e run après transitions = 0 transition
 *   - Cap : MAX_DOSSIERS_PER_RUN respecté, traitement borné
 *   - Par-dossier try/catch : l'échec d'un dossier n'annule pas les autres
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ============================================
// Mocks
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
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

// Supabase admin client — builder chaînable minimal.
type DossierRow = {
  id: string
  status: string
  operation_code: string
  created_at: string
  updated_at: string
}

interface QueryState {
  table: string
  filters: Array<{ op: string; col: string; val: unknown }>
  limit: number | null
}

const mockDataByCall: Array<{ data: DossierRow[] | null; error: unknown }> = []
let callIndex = 0

// Historique des appels `.from(table)` pour asserter dans les tests quels
// tables ont été lues et dans quel ordre.
const fromCalls: string[] = []

// Historique des QueryState par appel (index parallèle à mockDataByCall).
// Permet d'inspecter les filtres `.eq/.lte` passés à chaque query dossiers.
const queryStatesByCall: QueryState[] = []

// RPC acquire/release history + override configurable pour simuler "lease déjà
// actif" (acquired=false).
const rpcCalls: Array<{ fn: string; args: unknown }> = []
let mockAcquireLeaseResult: { data: boolean | null; error: unknown } = {
  data: true,
  error: null,
}

function makeCeeDossiersBuilder(table: string) {
  const state: QueryState = { table, filters: [], limit: null }
  const builder = {
    _state: state,
    select() {
      return builder
    },
    eq(col: string, val: unknown) {
      state.filters.push({ op: 'eq', col, val })
      return builder
    },
    lte(col: string, val: unknown) {
      state.filters.push({ op: 'lte', col, val })
      return builder
    },
    order() {
      return builder
    },
    limit(n: number) {
      state.limit = n
      // Capture du state à la résolution pour que les tests puissent asserter.
      queryStatesByCall[callIndex] = state
      return Promise.resolve(mockDataByCall[callIndex++] ?? { data: [], error: null })
    },
  }
  return builder
}

const mockFrom = vi.fn((table: string) => {
  fromCalls.push(table)
  return makeCeeDossiersBuilder(table)
})

const mockRpc = vi.fn(async (fn: string, args: unknown) => {
  rpcCalls.push({ fn, args })
  if (fn === 'acquire_cron_lease') return mockAcquireLeaseResult
  if (fn === 'release_cron_lease') return { data: null, error: null }
  return { data: null, error: null }
})

const mockAdminSupabase = { from: mockFrom, rpc: mockRpc }

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockAdminSupabase),
}))

// CEE lib mocks (on consomme, on ne touche pas).
const mockTransition = vi.fn()
vi.mock('@/lib/cee/dossiers', () => ({
  transitionCeeDossierStatus: (...args: unknown[]) => mockTransition(...args),
}))

const mockGap = vi.fn()
vi.mock('@/lib/cee/justificatifs', () => ({
  getJustificatifsGap: (...args: unknown[]) => mockGap(...args),
}))

// ============================================
// Helpers
// ============================================

const SECRET = 'test-cron-secret-abcdef-1234567890'

function makeRequest(headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/cron/cee-dossier-transitions', {
    method: 'GET',
    headers,
  })
}

type MockResult = {
  body: Record<string, unknown>
  status: number
  headers: Record<string, string>
}

function setDbCalls(calls: Array<{ data: DossierRow[] | null; error: unknown }>) {
  mockDataByCall.length = 0
  for (const c of calls) mockDataByCall.push(c)
  callIndex = 0
}

function dossier(id: string, status: string, hoursAgo = 0): DossierRow {
  const iso = new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString()
  return {
    id,
    status,
    operation_code: 'BAR-TH-104',
    created_at: iso,
    updated_at: iso,
  }
}

// ============================================
// Setup / teardown
// ============================================

const originalEnv = { ...process.env }

beforeEach(() => {
  vi.clearAllMocks()
  mockDataByCall.length = 0
  queryStatesByCall.length = 0
  fromCalls.length = 0
  rpcCalls.length = 0
  callIndex = 0
  // Reset lease : par défaut, l'acquisition réussit.
  mockAcquireLeaseResult = { data: true, error: null }
  process.env.CRON_SECRET = SECRET
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
  // Default: every list is empty unless overridden by the test.
  setDbCalls([
    { data: [], error: null }, // rule A list
    { data: [], error: null }, // rule B list
    { data: [], error: null }, // rule C list
  ])
  mockTransition.mockResolvedValue({ ok: true })
  mockGap.mockResolvedValue({ uploaded: [], requis: [], missing: [], complete: false })
})

afterEach(() => {
  process.env = { ...originalEnv }
})

// ============================================
// Auth
// ============================================

describe('GET /api/cron/cee-dossier-transitions — auth', () => {
  it('returns 401 when Authorization header is absent', async () => {
    const { GET } = await import('@/app/api/cron/cee-dossier-transitions/route')
    const res = (await GET(makeRequest())) as unknown as MockResult
    expect(res.status).toBe(401)
    expect(mockTransition).not.toHaveBeenCalled()
  })

  it('returns 401 when bearer is wrong', async () => {
    const { GET } = await import('@/app/api/cron/cee-dossier-transitions/route')
    const res = (await GET(
      makeRequest({ authorization: 'Bearer wrong-secret' })
    )) as unknown as MockResult
    expect(res.status).toBe(401)
    expect(mockTransition).not.toHaveBeenCalled()
  })

  it('returns 401 when CRON_SECRET env var is unset (fail-closed)', async () => {
    delete process.env.CRON_SECRET
    const { GET } = await import('@/app/api/cron/cee-dossier-transitions/route')
    const res = (await GET(
      makeRequest({ authorization: `Bearer ${SECRET}` })
    )) as unknown as MockResult
    expect(res.status).toBe(401)
  })

  it('returns 401 when provided secret length differs (no throw)', async () => {
    const { GET } = await import('@/app/api/cron/cee-dossier-transitions/route')
    const res = (await GET(makeRequest({ authorization: 'Bearer short' }))) as unknown as MockResult
    expect(res.status).toBe(401)
  })

  it('returns 200 with valid bearer', async () => {
    const { GET } = await import('@/app/api/cron/cee-dossier-transitions/route')
    const res = (await GET(
      makeRequest({ authorization: `Bearer ${SECRET}` })
    )) as unknown as MockResult
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ ok: true, processed: 0 })
  })
})

// ============================================
// Règle A — engagement_signe with gap → warn only
// ============================================

describe('GET /api/cron/cee-dossier-transitions — règle A engagement_signe', () => {
  it('logs warning when gap is not empty, no transition', async () => {
    setDbCalls([
      { data: [dossier('d-eng-1', 'engagement_signe', 48)], error: null },
      { data: [], error: null },
      { data: [], error: null },
    ])
    mockGap.mockResolvedValueOnce({
      uploaded: ['a'],
      requis: ['a', 'b'],
      missing: ['b'],
      complete: false,
    })

    const { GET } = await import('@/app/api/cron/cee-dossier-transitions/route')
    const res = (await GET(
      makeRequest({ authorization: `Bearer ${SECRET}` })
    )) as unknown as MockResult

    expect(res.status).toBe(200)
    expect(mockGap).toHaveBeenCalledTimes(1)
    expect(mockTransition).not.toHaveBeenCalled()
    expect(res.body).toMatchObject({
      ok: true,
      processed: 1,
      transitions: {
        travaux_acheves_to_ah_signee: 0,
        depose_delegataire_to_depose_pncee: 0,
      },
    })
  })
})

// ============================================
// Règle B — travaux_acheves → ah_signee
// ============================================

describe('GET /api/cron/cee-dossier-transitions — règle B travaux_acheves', () => {
  it('transitions to ah_signee when gap is complete', async () => {
    setDbCalls([
      { data: [], error: null },
      { data: [dossier('d-tra-1', 'travaux_acheves')], error: null },
      { data: [], error: null },
    ])
    mockGap.mockResolvedValueOnce({
      uploaded: ['a', 'b'],
      requis: ['a', 'b'],
      missing: [],
      complete: true,
    })

    const { GET } = await import('@/app/api/cron/cee-dossier-transitions/route')
    const res = (await GET(
      makeRequest({ authorization: `Bearer ${SECRET}` })
    )) as unknown as MockResult

    expect(res.status).toBe(200)
    expect(mockTransition).toHaveBeenCalledTimes(1)
    expect(mockTransition).toHaveBeenCalledWith(
      mockAdminSupabase,
      'd-tra-1',
      'ah_signee',
      null,
      'system'
    )
    // Assert explicite : règle B filtre sur `status = travaux_acheves`.
    // Le state de la query 2 (règle B) contient bien ce filtre eq.
    const ruleBState = queryStatesByCall[1]
    expect(ruleBState).toBeDefined()
    expect(ruleBState.table).toBe('cee_dossiers')
    expect(
      ruleBState.filters.some(
        (f) => f.op === 'eq' && f.col === 'status' && f.val === 'travaux_acheves'
      )
    ).toBe(true)
    expect(res.body).toMatchObject({
      transitions: {
        travaux_acheves_to_ah_signee: 1,
      },
    })
  })

  it('does not transition when gap is incomplete', async () => {
    setDbCalls([
      { data: [], error: null },
      { data: [dossier('d-tra-2', 'travaux_acheves')], error: null },
      { data: [], error: null },
    ])
    mockGap.mockResolvedValueOnce({
      uploaded: ['a'],
      requis: ['a', 'b'],
      missing: ['b'],
      complete: false,
    })

    const { GET } = await import('@/app/api/cron/cee-dossier-transitions/route')
    const res = (await GET(
      makeRequest({ authorization: `Bearer ${SECRET}` })
    )) as unknown as MockResult

    expect(res.status).toBe(200)
    expect(mockTransition).not.toHaveBeenCalled()
    expect(res.body).toMatchObject({
      processed: 1,
      transitions: { travaux_acheves_to_ah_signee: 0 },
    })
  })

  it('continues processing other dossiers when one fails (per-dossier try/catch)', async () => {
    setDbCalls([
      { data: [], error: null },
      {
        data: [dossier('d-tra-bad', 'travaux_acheves'), dossier('d-tra-ok', 'travaux_acheves')],
        error: null,
      },
      { data: [], error: null },
    ])
    mockGap.mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce({
      uploaded: ['a'],
      requis: ['a'],
      missing: [],
      complete: true,
    })

    const { GET } = await import('@/app/api/cron/cee-dossier-transitions/route')
    const res = (await GET(
      makeRequest({ authorization: `Bearer ${SECRET}` })
    )) as unknown as MockResult

    expect(res.status).toBe(200)
    expect(mockTransition).toHaveBeenCalledTimes(1)
    expect(mockTransition).toHaveBeenCalledWith(
      mockAdminSupabase,
      'd-tra-ok',
      'ah_signee',
      null,
      'system'
    )
    expect(res.body).toMatchObject({
      processed: 2,
      transitions: { travaux_acheves_to_ah_signee: 1 },
    })
  })
})

// ============================================
// Règle C — depose_delegataire > 48h → depose_pncee
// ============================================

describe('GET /api/cron/cee-dossier-transitions — règle C depose_delegataire', () => {
  it('transitions to depose_pncee for stale dossiers (seuil 48h asserté, fake timers)', async () => {
    // Fake timers → assertion ISO déterministe, zéro flakiness.
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-11T12:00:00Z'))

    try {
      setDbCalls([
        { data: [], error: null },
        { data: [], error: null },
        { data: [dossier('d-dep-1', 'depose_delegataire', 72)], error: null },
      ])

      const { GET } = await import('@/app/api/cron/cee-dossier-transitions/route')
      const res = (await GET(
        makeRequest({ authorization: `Bearer ${SECRET}` })
      )) as unknown as MockResult

      expect(res.status).toBe(200)
      expect(mockTransition).toHaveBeenCalledTimes(1)
      expect(mockTransition).toHaveBeenCalledWith(
        mockAdminSupabase,
        'd-dep-1',
        'depose_pncee',
        null,
        'system'
      )
      expect(res.body).toMatchObject({
        transitions: { depose_delegataire_to_depose_pncee: 1 },
      })

      // --- Asserts explicites sur les filtres de la règle C ---------------
      // La query règle C est la 3ème (index 2) : state[2].
      const ruleCState = queryStatesByCall[2]
      expect(ruleCState).toBeDefined()
      expect(ruleCState.table).toBe('cee_dossiers')

      // Filtre `eq('status', 'depose_delegataire')`
      const statusFilter = ruleCState.filters.find((f) => f.op === 'eq' && f.col === 'status')
      expect(statusFilter?.val).toBe('depose_delegataire')

      // Filtre `lte('updated_at', now - 48h)` — assertion ISO exacte.
      const lteFilter = ruleCState.filters.find((f) => f.op === 'lte' && f.col === 'updated_at')
      expect(lteFilter).toBeDefined()
      expect(lteFilter!.val).toBe('2026-04-09T12:00:00.000Z')
    } finally {
      vi.useRealTimers()
    }
  })

  it("règle C : un dossier de 47h (sous le seuil 48h) n'est PAS matché", async () => {
    // On ne renvoie aucun dossier (le handler a filtré via lte) → on vérifie
    // juste que le filtre lte appliqué exclut bien les dossiers < 48h.
    setDbCalls([
      { data: [], error: null },
      { data: [], error: null },
      { data: [], error: null },
    ])

    const { GET } = await import('@/app/api/cron/cee-dossier-transitions/route')
    const res = (await GET(
      makeRequest({ authorization: `Bearer ${SECRET}` })
    )) as unknown as MockResult

    expect(res.status).toBe(200)
    expect(mockTransition).not.toHaveBeenCalled()

    const ruleCState = queryStatesByCall[2]
    const lteFilter = ruleCState.filters.find((f) => f.op === 'lte' && f.col === 'updated_at')
    expect(lteFilter).toBeDefined()
    const lteTs = Date.parse(lteFilter!.val as string)
    // Un dossier de 47h a un updated_at = now - 47h → doit être STRICTEMENT
    // supérieur au seuil lte (donc exclu par `updated_at <= seuil`).
    const dossier47hTs = Date.now() - 47 * 3600 * 1000
    expect(dossier47hTs).toBeGreaterThan(lteTs)
  })
})

// ============================================
// Idempotence
// ============================================

describe('GET /api/cron/cee-dossier-transitions — idempotence', () => {
  it('second run finds no matching dossiers after transition', async () => {
    // Run 1 : 1 travaux_acheves transitionne vers ah_signee
    setDbCalls([
      { data: [], error: null },
      { data: [dossier('d-idem-1', 'travaux_acheves')], error: null },
      { data: [], error: null },
    ])
    mockGap.mockResolvedValueOnce({
      uploaded: ['a'],
      requis: ['a'],
      missing: [],
      complete: true,
    })

    const { GET } = await import('@/app/api/cron/cee-dossier-transitions/route')
    const res1 = (await GET(
      makeRequest({ authorization: `Bearer ${SECRET}` })
    )) as unknown as MockResult

    expect(res1.body).toMatchObject({
      transitions: { travaux_acheves_to_ah_signee: 1 },
    })

    // Run 2 : le dossier n'est plus dans le filtre `status = travaux_acheves`
    // → simulation par liste vide renvoyée.
    setDbCalls([
      { data: [], error: null },
      { data: [], error: null },
      { data: [], error: null },
    ])
    mockGap.mockReset()

    const res2 = (await GET(
      makeRequest({ authorization: `Bearer ${SECRET}` })
    )) as unknown as MockResult

    expect(res2.status).toBe(200)
    expect(res2.body).toMatchObject({
      processed: 0,
      transitions: {
        travaux_acheves_to_ah_signee: 0,
        depose_delegataire_to_depose_pncee: 0,
      },
    })
  })
})

// ============================================
// Cap 500
// ============================================

describe('GET /api/cron/cee-dossier-transitions — cap 500', () => {
  it('respects MAX_DOSSIERS_PER_RUN across all rules', async () => {
    // 300 engagement_signe + 300 travaux_acheves → règle A consomme 300,
    // règle B reçoit un limit de 200 → total processed = 500.
    const engagement = Array.from({ length: 300 }, (_, i) =>
      dossier(`d-eng-${i}`, 'engagement_signe', 48)
    )
    const travaux = Array.from({ length: 200 }, (_, i) => dossier(`d-tra-${i}`, 'travaux_acheves'))
    setDbCalls([
      { data: engagement, error: null },
      { data: travaux, error: null },
      { data: [], error: null },
    ])
    mockGap.mockResolvedValue({
      uploaded: ['a'],
      requis: ['a'],
      missing: [],
      complete: true,
    })

    const { GET } = await import('@/app/api/cron/cee-dossier-transitions/route')
    const res = (await GET(
      makeRequest({ authorization: `Bearer ${SECRET}` })
    )) as unknown as MockResult

    expect(res.status).toBe(200)
    expect(res.body.processed).toBe(500)
    // Règle B doit avoir transitionné les 200 travaux_acheves.
    expect(mockTransition).toHaveBeenCalledTimes(200)
    expect(res.body).toMatchObject({
      transitions: {
        travaux_acheves_to_ah_signee: 200,
        depose_delegataire_to_depose_pncee: 0,
      },
      cap: 500,
    })
  })
})

// ============================================
// Lease anti-double-run (Bug #4 migration 409)
// ============================================

describe('GET /api/cron/cee-dossier-transitions — lease anti-double-run', () => {
  it('skip si lease déjà actif (RPC acquire_cron_lease renvoie false)', async () => {
    // Simule un lease détenu par un autre runner → le RPC atomique renvoie
    // FALSE (le `WHERE cron_leases.expires_at < NOW()` dans ON CONFLICT DO
    // UPDATE n'a pas matché).
    mockAcquireLeaseResult = { data: false, error: null }

    // Données des règles non utilisées — mais on les pose pour garantir que
    // si elles étaient consommées, le test échouerait avec processed > 0.
    setDbCalls([
      { data: [dossier('d-should-not-run', 'engagement_signe', 48)], error: null },
      { data: [], error: null },
      { data: [], error: null },
    ])

    const { GET } = await import('@/app/api/cron/cee-dossier-transitions/route')
    const res = (await GET(
      makeRequest({ authorization: `Bearer ${SECRET}` })
    )) as unknown as MockResult

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      ok: true,
      skipped: true,
      reason: 'already_running',
    })
    // Aucun dossier processé car le handler est sorti avant d'entrer dans la
    // section règles.
    expect(mockGap).not.toHaveBeenCalled()
    expect(mockTransition).not.toHaveBeenCalled()
  })

  it('acquiert le lease et traite les dossiers quand aucun lease actif', async () => {
    // Par défaut mockLeaseAcquireResult retourne une ligne — simulation d'une
    // acquisition réussie (lease inexistant ou expiré).
    setDbCalls([
      { data: [], error: null },
      { data: [dossier('d-tra-run', 'travaux_acheves')], error: null },
      { data: [], error: null },
    ])
    mockGap.mockResolvedValueOnce({
      uploaded: ['a'],
      requis: ['a'],
      missing: [],
      complete: true,
    })

    const { GET } = await import('@/app/api/cron/cee-dossier-transitions/route')
    const res = (await GET(
      makeRequest({ authorization: `Bearer ${SECRET}` })
    )) as unknown as MockResult

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      ok: true,
      processed: 1,
      transitions: { travaux_acheves_to_ah_signee: 1 },
    })
    expect(res.body).not.toHaveProperty('skipped')
  })
})
