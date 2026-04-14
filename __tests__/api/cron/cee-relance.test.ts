/**
 * Tests — Cron CEE relance (/api/cron/cee-relance)
 *
 * Couvre :
 *   - Auth fail-closed : CRON_SECRET absent, bearer manquant/invalide
 *   - Palier selection : J3/J7/J14 selon age et status
 *   - Anti-spam : skip si meme relance_type < 72h
 *   - Budget cap : max 50 relances par run
 *   - Contact resolution : skip si pas d'email client
 *   - Email send : J3 = 1 email, J7/J14 = 2 emails (client+artisan)
 *   - Event tracking : insert cee_dossier_events apres envoi
 *   - Resilience : ok=true meme si un email echoue
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ============================================
// Mocks
// ============================================

vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
    }),
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

const mockSendEmail = vi.fn()
vi.mock('@/lib/api/resend-client', () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}))

vi.mock('@/lib/cee/relance-emails', () => ({
  relanceJ3Client: vi.fn(() => ({ subject: 'J3 client', html: '<p>j3</p>' })),
  relanceJ7Client: vi.fn(() => ({ subject: 'J7 client', html: '<p>j7c</p>' })),
  relanceJ7Artisan: vi.fn(() => ({ subject: 'J7 artisan', html: '<p>j7a</p>' })),
  relanceJ14Client: vi.fn(() => ({ subject: 'J14 client', html: '<p>j14c</p>' })),
  relanceJ14Artisan: vi.fn(() => ({ subject: 'J14 artisan', html: '<p>j14a</p>' })),
}))

// ---------------------------------------------------------------------------
// Supabase chainable mock
// ---------------------------------------------------------------------------

interface MockCall {
  table: string
  method: 'select' | 'insert'
  filters: Array<{ op: string; col: string; val: unknown }>
}

const mockCalls: MockCall[] = []

// Data returned by `.from(table).select(...)...` chains (consumed in order).
const selectResults: Array<{ data: unknown[] | null; error: unknown }> = []
let selectIndex = 0

// Data returned by `.from(table).insert(...)` calls.
const insertResults: Array<{ error: unknown }> = []
let insertIndex = 0

// Result for `.maybeSingle()` calls (devis_requests, providers).
// Keyed by table name for deterministic routing.
const maybeSingleResults: Record<string, { data: unknown; error: unknown }> = {}

function makeChainBuilder(table: string) {
  const call: MockCall = { table, method: 'select', filters: [] }

  // Track whether this builder has been "consumed" by .limit() or .maybeSingle().
  // If not, `await builder` resolves via `.then()` (Supabase's thenable pattern
  // used by the anti-spam query which ends with .gte() without .limit()).
  let consumed = false

  const builder: Record<string, unknown> = {}

  // Make the builder thenable so `await builder` works (Supabase client pattern).
  // This is used by the anti-spam query: await supabase.from(...).select().eq().eq().gte()
  builder.then = (resolve?: (val: unknown) => unknown, reject?: (err: unknown) => unknown) => {
    if (consumed) {
      // Already resolved via .limit() or .maybeSingle() — don't double-consume.
      return Promise.resolve(undefined).then(resolve, reject)
    }
    consumed = true
    mockCalls.push(call)
    const result = selectResults[selectIndex++] ?? { data: [], error: null }
    return Promise.resolve(result).then(resolve, reject)
  }

  builder.select = vi.fn(() => {
    call.method = 'select'
    return builder
  })

  builder.insert = vi.fn((_data: unknown) => {
    call.method = 'insert'
    mockCalls.push({ ...call, method: 'insert' })
    return Promise.resolve(insertResults[insertIndex++] ?? { error: null })
  })

  builder.eq = vi.fn((col: string, val: unknown) => {
    call.filters.push({ op: 'eq', col, val })
    return builder
  })

  builder.lte = vi.fn((col: string, val: unknown) => {
    call.filters.push({ op: 'lte', col, val })
    return builder
  })

  builder.gte = vi.fn((col: string, val: unknown) => {
    call.filters.push({ op: 'gte', col, val })
    return builder
  })

  builder.order = vi.fn(() => builder)

  builder.limit = vi.fn(() => {
    consumed = true
    mockCalls.push(call)
    return Promise.resolve(selectResults[selectIndex++] ?? { data: [], error: null })
  })

  builder.maybeSingle = vi.fn(() => {
    consumed = true
    mockCalls.push(call)
    return Promise.resolve(maybeSingleResults[table] ?? { data: null, error: null })
  })

  return builder
}

const mockFrom = vi.fn((table: string) => makeChainBuilder(table))
const mockAdminSupabase = { from: mockFrom }

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockAdminSupabase),
}))

// ============================================
// Helpers
// ============================================

const SECRET = 'test-cron-secret-cee-relance'

type MockResult = {
  body: Record<string, unknown>
  status: number
}

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/api/cron/cee-relance', {
    method: 'GET',
    headers,
  })
}

function authRequest(): Request {
  return makeRequest({ authorization: `Bearer ${SECRET}` })
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 3600 * 1000).toISOString()
}

interface DossierFixture {
  id: string
  status: string
  devis_id: string | null
  provider_id: string
  created_at: string
  updated_at: string
}

function makeDossier(
  id: string,
  status: string,
  ageDays: number,
  overrides: Partial<DossierFixture> = {}
): DossierFixture {
  const iso = daysAgo(ageDays)
  return {
    id,
    status,
    devis_id: 'devis-1',
    provider_id: 'prov-1',
    created_at: iso,
    updated_at: iso,
    ...overrides,
  }
}

function resetSelectResults(results: Array<{ data: unknown[] | null; error: unknown }>) {
  selectResults.length = 0
  for (const r of results) selectResults.push(r)
  selectIndex = 0
}

function resetInsertResults(results: Array<{ error: unknown }> = []) {
  insertResults.length = 0
  for (const r of results) insertResults.push(r)
  insertIndex = 0
}

/** Configure contacts pour un dossier standard (client + artisan). */
function setContacts(
  opts: {
    clientEmail?: string | null
    clientName?: string | null
    artisanEmail?: string | null
    artisanName?: string | null
  } = {}
) {
  maybeSingleResults['devis_requests'] = {
    data: {
      client_email: opts.clientEmail !== undefined ? opts.clientEmail : 'client@test.fr',
      client_name: opts.clientName !== undefined ? opts.clientName : 'Jean Dupont',
    },
    error: null,
  }
  maybeSingleResults['providers'] = {
    data: {
      email: opts.artisanEmail !== undefined ? opts.artisanEmail : 'artisan@test.fr',
      name: opts.artisanName !== undefined ? opts.artisanName : 'Plomberie Pro',
    },
    error: null,
  }
}

// ============================================
// Setup / teardown
// ============================================

const originalEnv = { ...process.env }

beforeEach(() => {
  vi.clearAllMocks()
  vi.resetModules()

  selectResults.length = 0
  insertResults.length = 0
  mockCalls.length = 0
  selectIndex = 0
  insertIndex = 0
  Object.keys(maybeSingleResults).forEach((k) => delete maybeSingleResults[k])

  process.env.CRON_SECRET = SECRET
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'

  mockSendEmail.mockResolvedValue(undefined)
})

afterEach(() => {
  process.env = { ...originalEnv }
})

// ============================================
// Auth
// ============================================

describe('GET /api/cron/cee-relance — auth', () => {
  it('returns 401 when Authorization header is absent', async () => {
    const { GET } = await import('@/app/api/cron/cee-relance/route')
    const res = (await GET(makeRequest())) as unknown as MockResult
    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ error: 'Non autorisé' })
  })

  it('returns 401 with wrong bearer token', async () => {
    const { GET } = await import('@/app/api/cron/cee-relance/route')
    const res = (await GET(
      makeRequest({ authorization: 'Bearer wrong-token' })
    )) as unknown as MockResult
    expect(res.status).toBe(401)
    expect(res.body).toMatchObject({ error: 'Non autorisé' })
  })

  it('returns 401 when CRON_SECRET env var is not configured (fail-closed)', async () => {
    delete process.env.CRON_SECRET
    const { GET } = await import('@/app/api/cron/cee-relance/route')
    const res = (await GET(
      makeRequest({ authorization: `Bearer ${SECRET}` })
    )) as unknown as MockResult
    expect(res.status).toBe(401)
  })
})

// ============================================
// Palier selection
// ============================================

describe('GET /api/cron/cee-relance — palier selection', () => {
  // Pour ces tests, on configure le mock Supabase de facon plus fine.
  // Le route fait :
  //   1. .from('cee_dossiers').select(...).eq('status','brouillon').lte(...).order(...).limit(50) → brouillonRows
  //   2. .from('cee_dossiers').select(...).eq('status','engagement_signe').lte(...).order(...).limit(50) → engagementRows
  //   3. Pour chaque dossier: .from('cee_dossier_events').select(...).eq(...).eq(...).gte(...)  → anti-spam check
  //   4. .from('devis_requests').select(...).eq(...).maybeSingle() → client contact
  //   5. .from('providers').select(...).eq(...).maybeSingle() → artisan contact
  //   6. sendEmail(...)
  //   7. .from('cee_dossier_events').insert(...) → event tracking
  //
  // Le probleme : la query anti-spam n'utilise pas .limit() donc le builder
  // ne resout pas la promesse via .limit(). Il faut que .gte() retourne
  // la promesse directement (Supabase client est "thenable").
  //
  // On va refactorer le mock pour que chaque methode terminale retourne
  // une promesse resolue avec les donnees configurees.

  it('dossier brouillon 4 jours → relance_j3', async () => {
    // brouillon list: 1 dossier de 4 jours
    // engagement list: vide
    // anti-spam: aucun event recent
    // contacts: client + artisan
    // sendEmail: ok
    // event insert: ok
    resetSelectResults([
      { data: [makeDossier('d1', 'brouillon', 4)], error: null }, // brouillon list
      { data: [], error: null }, // engagement list
      { data: [], error: null }, // anti-spam check
    ])
    resetInsertResults([{ error: null }])
    setContacts()

    const { GET } = await import('@/app/api/cron/cee-relance/route')
    const res = (await GET(authRequest())) as unknown as MockResult

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ ok: true })
    const counters = res.body.counters as Record<string, number>
    expect(counters.relance_j3).toBe(1)
    expect(counters.relance_j7).toBe(0)
    expect(counters.relance_j14).toBe(0)
    // J3 = client only → 1 sendEmail call
    expect(mockSendEmail).toHaveBeenCalledTimes(1)
  })

  it('dossier brouillon 8 jours → relance_j7', async () => {
    resetSelectResults([
      { data: [makeDossier('d2', 'brouillon', 8)], error: null },
      { data: [], error: null },
      { data: [], error: null }, // anti-spam
    ])
    resetInsertResults([{ error: null }])
    setContacts()

    const { GET } = await import('@/app/api/cron/cee-relance/route')
    const res = (await GET(authRequest())) as unknown as MockResult

    expect(res.status).toBe(200)
    const counters = res.body.counters as Record<string, number>
    expect(counters.relance_j7).toBe(1)
    expect(counters.relance_j3).toBe(0)
    // J7 = client + artisan → 2 sendEmail calls
    expect(mockSendEmail).toHaveBeenCalledTimes(2)
  })

  it('dossier brouillon 15 jours → relance_j14', async () => {
    resetSelectResults([
      { data: [makeDossier('d3', 'brouillon', 15)], error: null },
      { data: [], error: null },
      { data: [], error: null }, // anti-spam
    ])
    resetInsertResults([{ error: null }])
    setContacts()

    const { GET } = await import('@/app/api/cron/cee-relance/route')
    const res = (await GET(authRequest())) as unknown as MockResult

    expect(res.status).toBe(200)
    const counters = res.body.counters as Record<string, number>
    expect(counters.relance_j14).toBe(1)
    // J14 = client + artisan → 2 sendEmail calls
    expect(mockSendEmail).toHaveBeenCalledTimes(2)
  })

  it('dossier engagement_signe 15 jours → relance_j14', async () => {
    resetSelectResults([
      { data: [], error: null }, // brouillon list: vide
      { data: [makeDossier('d4', 'engagement_signe', 15)], error: null },
      { data: [], error: null }, // anti-spam
    ])
    resetInsertResults([{ error: null }])
    setContacts()

    const { GET } = await import('@/app/api/cron/cee-relance/route')
    const res = (await GET(authRequest())) as unknown as MockResult

    expect(res.status).toBe(200)
    const counters = res.body.counters as Record<string, number>
    expect(counters.relance_j14).toBe(1)
  })

  it('dossier engagement_signe 5 jours → pas de relance (< 14j pour ce statut)', async () => {
    // engagement_signe est filtre par lte(cutoffJ14) donc un dossier de 5j
    // ne devrait pas apparaitre. Mais si le mock le renvoie quand meme,
    // le code applicatif doit le skipper (ageDays < 14 + status != brouillon).
    // En realite, le SQL filtre ca, mais testons la logique applicative.
    resetSelectResults([
      { data: [], error: null },
      // Le mock renvoie le dossier meme s'il ne devrait pas passer le filtre SQL
      { data: [makeDossier('d5', 'engagement_signe', 5)], error: null },
      // Pas d'anti-spam check car le dossier est skip avant
    ])

    const { GET } = await import('@/app/api/cron/cee-relance/route')
    const res = (await GET(authRequest())) as unknown as MockResult

    expect(res.status).toBe(200)
    const counters = res.body.counters as Record<string, number>
    expect(counters.relance_j3).toBe(0)
    expect(counters.relance_j7).toBe(0)
    expect(counters.relance_j14).toBe(0)
    expect(mockSendEmail).not.toHaveBeenCalled()
  })
})

// ============================================
// Anti-spam
// ============================================

describe('GET /api/cron/cee-relance — anti-spam', () => {
  it('skip si meme relance_type envoye dans les 72h', async () => {
    resetSelectResults([
      { data: [makeDossier('d-spam', 'brouillon', 4)], error: null },
      { data: [], error: null },
      // Anti-spam: event recent avec relance_j3
      {
        data: [{ id: 'evt-1', payload: { relance_type: 'relance_j3' } }],
        error: null,
      },
    ])
    setContacts()

    const { GET } = await import('@/app/api/cron/cee-relance/route')
    const res = (await GET(authRequest())) as unknown as MockResult

    expect(res.status).toBe(200)
    const counters = res.body.counters as Record<string, number>
    expect(counters.skipped_antispam).toBe(1)
    expect(counters.relance_j3).toBe(0)
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('envoie si derniere relance > 72h (event avec type different)', async () => {
    resetSelectResults([
      { data: [makeDossier('d-ok', 'brouillon', 4)], error: null },
      { data: [], error: null },
      // Anti-spam: event recent mais avec un TYPE DIFFERENT (j7, pas j3)
      {
        data: [{ id: 'evt-2', payload: { relance_type: 'relance_j7' } }],
        error: null,
      },
    ])
    resetInsertResults([{ error: null }])
    setContacts()

    const { GET } = await import('@/app/api/cron/cee-relance/route')
    const res = (await GET(authRequest())) as unknown as MockResult

    expect(res.status).toBe(200)
    const counters = res.body.counters as Record<string, number>
    expect(counters.relance_j3).toBe(1)
    expect(counters.skipped_antispam).toBe(0)
    expect(mockSendEmail).toHaveBeenCalled()
  })

  it('envoie si aucun event anti-spam recent (liste vide)', async () => {
    resetSelectResults([
      { data: [makeDossier('d-clear', 'brouillon', 4)], error: null },
      { data: [], error: null },
      { data: [], error: null }, // aucun event
    ])
    resetInsertResults([{ error: null }])
    setContacts()

    const { GET } = await import('@/app/api/cron/cee-relance/route')
    const res = (await GET(authRequest())) as unknown as MockResult

    expect(res.status).toBe(200)
    const counters = res.body.counters as Record<string, number>
    expect(counters.relance_j3).toBe(1)
    expect(mockSendEmail).toHaveBeenCalled()
  })
})

// ============================================
// Budget cap
// ============================================

describe('GET /api/cron/cee-relance — budget cap', () => {
  it("s'arrete apres 50 relances", async () => {
    // 60 dossiers brouillon de 4 jours, le cap doit limiter a 50.
    const dossiers = Array.from({ length: 60 }, (_, i) => makeDossier(`d-cap-${i}`, 'brouillon', 4))

    // Pour chaque dossier traite: anti-spam check (vide) + event insert
    // On a besoin de 60 anti-spam results meme si seuls 50 seront consommes.
    const antiSpamResults = Array.from({ length: 60 }, () => ({
      data: [] as unknown[],
      error: null,
    }))

    resetSelectResults([
      { data: dossiers, error: null }, // brouillon list
      { data: [], error: null }, // engagement list
      ...antiSpamResults, // anti-spam for each dossier
    ])

    const inserts = Array.from({ length: 60 }, () => ({ error: null }))
    resetInsertResults(inserts)
    setContacts()

    const { GET } = await import('@/app/api/cron/cee-relance/route')
    const res = (await GET(authRequest())) as unknown as MockResult

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ ok: true, cap: 50 })
    const counters = res.body.counters as Record<string, number>
    expect(counters.relance_j3).toBe(50)
    // sendEmail est appele 1 fois par dossier (J3 = client seul)
    expect(mockSendEmail).toHaveBeenCalledTimes(50)
  })
})

// ============================================
// Contact resolution
// ============================================

describe('GET /api/cron/cee-relance — contact resolution', () => {
  it('skip si client sans email', async () => {
    resetSelectResults([
      { data: [makeDossier('d-nomail', 'brouillon', 4)], error: null },
      { data: [], error: null },
      { data: [], error: null }, // anti-spam
    ])
    setContacts({ clientEmail: null })

    const { GET } = await import('@/app/api/cron/cee-relance/route')
    const res = (await GET(authRequest())) as unknown as MockResult

    expect(res.status).toBe(200)
    const counters = res.body.counters as Record<string, number>
    expect(counters.skipped_no_contact).toBe(1)
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('envoie a l artisan en J7 (pas en J3)', async () => {
    // J3 dossier: seul le client est contacte, pas l'artisan
    resetSelectResults([
      { data: [makeDossier('d-j3', 'brouillon', 4)], error: null },
      { data: [], error: null },
      { data: [], error: null }, // anti-spam
    ])
    resetInsertResults([{ error: null }])
    setContacts()

    const { GET } = await import('@/app/api/cron/cee-relance/route')
    const res = (await GET(authRequest())) as unknown as MockResult

    expect(res.status).toBe(200)
    // J3: 1 seul email (client)
    expect(mockSendEmail).toHaveBeenCalledTimes(1)
    expect(mockSendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'client@test.fr' }))
  })

  it('envoie a l artisan en J7', async () => {
    resetSelectResults([
      { data: [makeDossier('d-j7art', 'brouillon', 8)], error: null },
      { data: [], error: null },
      { data: [], error: null }, // anti-spam
    ])
    resetInsertResults([{ error: null }])
    setContacts()

    const { GET } = await import('@/app/api/cron/cee-relance/route')
    const res = (await GET(authRequest())) as unknown as MockResult

    expect(res.status).toBe(200)
    // J7: 2 emails (client + artisan)
    expect(mockSendEmail).toHaveBeenCalledTimes(2)
    expect(mockSendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'client@test.fr' }))
    expect(mockSendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'artisan@test.fr' }))
  })

  it('envoie a l artisan en J14', async () => {
    resetSelectResults([
      { data: [makeDossier('d-j14art', 'brouillon', 15)], error: null },
      { data: [], error: null },
      { data: [], error: null }, // anti-spam
    ])
    resetInsertResults([{ error: null }])
    setContacts()

    const { GET } = await import('@/app/api/cron/cee-relance/route')
    const res = (await GET(authRequest())) as unknown as MockResult

    expect(res.status).toBe(200)
    // J14: 2 emails (client + artisan)
    expect(mockSendEmail).toHaveBeenCalledTimes(2)
    expect(mockSendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'artisan@test.fr' }))
  })
})

// ============================================
// Event tracking
// ============================================

describe('GET /api/cron/cee-relance — event tracking', () => {
  it('insere un cee_dossier_events apres envoi reussi', async () => {
    resetSelectResults([
      { data: [makeDossier('d-evt', 'brouillon', 4)], error: null },
      { data: [], error: null },
      { data: [], error: null }, // anti-spam
    ])
    resetInsertResults([{ error: null }])
    setContacts()

    const { GET } = await import('@/app/api/cron/cee-relance/route')
    await GET(authRequest())

    // Verify insert was called on cee_dossier_events
    const insertCalls = mockCalls.filter(
      (c) => c.table === 'cee_dossier_events' && c.method === 'insert'
    )
    expect(insertCalls.length).toBe(1)

    // Verify the insert was called via mockFrom('cee_dossier_events')
    const fromTables = mockFrom.mock.calls.map((c) => c[0])
    expect(fromTables).toContain('cee_dossier_events')
  })
})

// ============================================
// Email send
// ============================================

describe('GET /api/cron/cee-relance — email send', () => {
  it('J3 : envoie 1 email (client seul)', async () => {
    resetSelectResults([
      { data: [makeDossier('d-e1', 'brouillon', 4)], error: null },
      { data: [], error: null },
      { data: [], error: null },
    ])
    resetInsertResults([{ error: null }])
    setContacts()

    const { GET } = await import('@/app/api/cron/cee-relance/route')
    const res = (await GET(authRequest())) as unknown as MockResult

    expect(res.status).toBe(200)
    expect(mockSendEmail).toHaveBeenCalledTimes(1)
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'client@test.fr',
        subject: 'J3 client',
      })
    )
  })

  it('J7 : envoie 2 emails (client + artisan)', async () => {
    resetSelectResults([
      { data: [makeDossier('d-e2', 'brouillon', 8)], error: null },
      { data: [], error: null },
      { data: [], error: null },
    ])
    resetInsertResults([{ error: null }])
    setContacts()

    const { GET } = await import('@/app/api/cron/cee-relance/route')
    const res = (await GET(authRequest())) as unknown as MockResult

    expect(res.status).toBe(200)
    expect(mockSendEmail).toHaveBeenCalledTimes(2)
    // First call: client
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'client@test.fr',
        subject: 'J7 client',
      })
    )
    // Second call: artisan
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'artisan@test.fr',
        subject: 'J7 artisan',
      })
    )
  })

  it('J14 : envoie 2 emails (client + artisan)', async () => {
    resetSelectResults([
      { data: [makeDossier('d-e3', 'brouillon', 15)], error: null },
      { data: [], error: null },
      { data: [], error: null },
    ])
    resetInsertResults([{ error: null }])
    setContacts()

    const { GET } = await import('@/app/api/cron/cee-relance/route')
    const res = (await GET(authRequest())) as unknown as MockResult

    expect(res.status).toBe(200)
    expect(mockSendEmail).toHaveBeenCalledTimes(2)
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'client@test.fr',
        subject: 'J14 client',
      })
    )
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'artisan@test.fr',
        subject: 'J14 artisan',
      })
    )
  })

  it('retourne ok=true meme si un email echoue (l autre est quand meme compte)', async () => {
    resetSelectResults([
      { data: [makeDossier('d-partial', 'brouillon', 8)], error: null },
      { data: [], error: null },
      { data: [], error: null },
    ])
    resetInsertResults([{ error: null }])
    setContacts()

    // Premier sendEmail (client) reussit, deuxieme (artisan) echoue
    mockSendEmail
      .mockResolvedValueOnce(undefined) // client OK
      .mockRejectedValueOnce(new Error('Resend rate limit')) // artisan KO

    const { GET } = await import('@/app/api/cron/cee-relance/route')
    const res = (await GET(authRequest())) as unknown as MockResult

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ ok: true })
    const counters = res.body.counters as Record<string, number>
    // La relance est quand meme comptee car au moins un email a ete envoye
    expect(counters.relance_j7).toBe(1)
    expect(counters.email_errors).toBe(0) // emailsSent=true car clientOk=true
  })

  it('compte email_errors si tous les emails echouent pour un dossier', async () => {
    resetSelectResults([
      { data: [makeDossier('d-allfail', 'brouillon', 8)], error: null },
      { data: [], error: null },
      { data: [], error: null },
    ])
    setContacts()

    // Les deux emails echouent
    mockSendEmail
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'))

    const { GET } = await import('@/app/api/cron/cee-relance/route')
    const res = (await GET(authRequest())) as unknown as MockResult

    expect(res.status).toBe(200)
    const counters = res.body.counters as Record<string, number>
    expect(counters.email_errors).toBe(1)
    expect(counters.relance_j7).toBe(0)
  })
})
