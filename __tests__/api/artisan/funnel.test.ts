/**
 * Tests unitaires pour GET /api/artisan/funnel
 *
 * Couvre :
 *  - Auth : 401 sans user, 403 sans provider, 403 provider inactif
 *  - DB   : 500 si requête period courante échoue
 *  - Vide : compteurs à 0, rates null, série vide → pas de division par zéro
 *  - Normal : counts par status, responseRate/quoteRate/declineRate
 *  - Median : pair/impair, durée négative filtrée, NaN filtré
 *  - Période précédente : responseRate delta
 *  - Clamp days : [7..365]
 *  - Headers : Cache-Control private
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUser = { id: 'user-123' }
const mockProvider = { id: 'provider-456' }

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({ get: vi.fn(), set: vi.fn() })),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'

type LeadRow = { status: string; assigned_at?: string; viewed_at?: string | null }

function buildSupabase(opts: {
  user?: { id: string } | null
  authError?: unknown
  providers?: { id: string }[] | null
  currentRows?: LeadRow[]
  currentError?: unknown
  previousRows?: LeadRow[]
}) {
  const {
    user = mockUser,
    authError = null,
    providers = [mockProvider],
    currentRows = [],
    currentError = null,
    previousRows = [],
  } = opts

  let tableCallIndex = 0
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: authError }),
    },
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'providers') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({ data: providers, error: null }),
        }
      }
      if (table === 'lead_assignments') {
        const idx = tableCallIndex++
        const chain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lt: vi.fn().mockReturnThis(),
        }
        const thenable = {
          ...chain,
          then: (resolve: (v: unknown) => void) => {
            if (idx === 0) resolve({ data: currentError ? null : currentRows, error: currentError })
            else resolve({ data: previousRows, error: null })
            return thenable
          },
        }
        for (const k of ['select', 'eq', 'gte', 'lt']) {
          ;(chain as Record<string, ReturnType<typeof vi.fn>>)[k].mockReturnValue(thenable)
        }
        return thenable
      }
      return {}
    }),
  }
}

function createRequest(url = 'http://localhost:3000/api/artisan/funnel'): Request {
  return new Request(url)
}

describe('GET /api/artisan/funnel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('renvoie 401 si non authentifié', async () => {
    vi.mocked(createClient).mockResolvedValue(buildSupabase({ user: null }) as never)
    const { GET } = await import('@/app/api/artisan/funnel/route')
    const res = await GET(createRequest())
    expect(res.status).toBe(401)
  })

  it('renvoie 401 si authError', async () => {
    vi.mocked(createClient).mockResolvedValue(
      buildSupabase({ user: null, authError: { message: 'expired' } }) as never
    )
    const { GET } = await import('@/app/api/artisan/funnel/route')
    const res = await GET(createRequest())
    expect(res.status).toBe(401)
  })

  it('renvoie 403 si aucun provider actif', async () => {
    vi.mocked(createClient).mockResolvedValue(buildSupabase({ providers: [] }) as never)
    const { GET } = await import('@/app/api/artisan/funnel/route')
    const res = await GET(createRequest())
    expect(res.status).toBe(403)
  })

  it('renvoie 500 si la query period courante échoue', async () => {
    vi.mocked(createClient).mockResolvedValue(
      buildSupabase({ currentError: { message: 'boom' } }) as never
    )
    const { GET } = await import('@/app/api/artisan/funnel/route')
    const res = await GET(createRequest())
    expect(res.status).toBe(500)
  })

  it('renvoie counts=0 et rates=null quand aucun lead', async () => {
    vi.mocked(createClient).mockResolvedValue(
      buildSupabase({ currentRows: [], previousRows: [] }) as never
    )
    const { GET } = await import('@/app/api/artisan/funnel/route')
    const res = await GET(createRequest())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.counts.assigned).toBe(0)
    expect(body.counts.viewed).toBe(0)
    expect(body.counts.quoted).toBe(0)
    expect(body.counts.declined).toBe(0)
    expect(body.counts.pending).toBe(0)
    expect(body.rates.responseRate).toBeNull()
    expect(body.rates.quoteRate).toBeNull()
    expect(body.rates.declineRate).toBeNull()
    expect(body.responseMedianMinutes).toBeNull()
  })

  it('calcule counts + rates correctement sur un funnel standard', async () => {
    const t0 = '2026-04-01T09:00:00.000Z'
    const t5 = '2026-04-01T09:05:00.000Z' // 5 min view delay
    const rows: LeadRow[] = [
      { status: 'quoted', assigned_at: t0, viewed_at: t5 },
      { status: 'quoted', assigned_at: t0, viewed_at: t5 },
      { status: 'viewed', assigned_at: t0, viewed_at: t5 },
      { status: 'declined', assigned_at: t0, viewed_at: t5 },
      { status: 'pending', assigned_at: t0, viewed_at: null },
    ]
    vi.mocked(createClient).mockResolvedValue(
      buildSupabase({ currentRows: rows, previousRows: [] }) as never
    )
    const { GET } = await import('@/app/api/artisan/funnel/route')
    const res = await GET(createRequest())
    const body = await res.json()

    expect(body.counts.assigned).toBe(5)
    expect(body.counts.viewed).toBe(4) // viewed_at not null
    expect(body.counts.quoted).toBe(2)
    expect(body.counts.declined).toBe(1)
    expect(body.counts.pending).toBe(1)

    // 4 / 5 * 100 = 80
    expect(body.rates.responseRate).toBe(80)
    // 2 / 4 = 50
    expect(body.rates.quoteRate).toBe(50)
    // 1 / 4 = 25
    expect(body.rates.declineRate).toBe(25)

    // Median delay = 5 min (all rows 5 min)
    expect(body.responseMedianMinutes).toBe(5)
  })

  it('filtre les durées négatives ou non finies du median', async () => {
    const t0 = '2026-04-01T09:00:00.000Z'
    const tBefore = '2026-04-01T08:00:00.000Z' // negative delay
    const rows: LeadRow[] = [
      { status: 'viewed', assigned_at: t0, viewed_at: '2026-04-01T09:02:00.000Z' }, // 2 min
      { status: 'viewed', assigned_at: t0, viewed_at: tBefore }, // -60 min → filtered
      { status: 'viewed', assigned_at: t0, viewed_at: '2026-04-01T09:10:00.000Z' }, // 10 min
      { status: 'viewed', assigned_at: t0, viewed_at: 'INVALID' }, // NaN → filtered
    ]
    vi.mocked(createClient).mockResolvedValue(buildSupabase({ currentRows: rows }) as never)
    const { GET } = await import('@/app/api/artisan/funnel/route')
    const res = await GET(createRequest())
    const body = await res.json()
    // Median of [2, 10] = 6
    expect(body.responseMedianMinutes).toBe(6)
  })

  it('calcule median impair (3 éléments) correctement', async () => {
    const t0 = '2026-04-01T09:00:00.000Z'
    const rows: LeadRow[] = [
      { status: 'viewed', assigned_at: t0, viewed_at: '2026-04-01T09:01:00.000Z' }, // 1
      { status: 'viewed', assigned_at: t0, viewed_at: '2026-04-01T09:05:00.000Z' }, // 5
      { status: 'viewed', assigned_at: t0, viewed_at: '2026-04-01T09:30:00.000Z' }, // 30
    ]
    vi.mocked(createClient).mockResolvedValue(buildSupabase({ currentRows: rows }) as never)
    const { GET } = await import('@/app/api/artisan/funnel/route')
    const res = await GET(createRequest())
    const body = await res.json()
    expect(body.responseMedianMinutes).toBe(5)
  })

  it('retourne previousPeriod avec comparaison responseRate', async () => {
    const t0 = '2026-04-01T09:00:00.000Z'
    const t1 = '2026-04-01T09:05:00.000Z'
    const prev: LeadRow[] = [
      { status: 'viewed', assigned_at: t0, viewed_at: t1 },
      { status: 'pending', assigned_at: t0, viewed_at: null },
      { status: 'pending', assigned_at: t0, viewed_at: null },
      { status: 'pending', assigned_at: t0, viewed_at: null },
    ]
    vi.mocked(createClient).mockResolvedValue(
      buildSupabase({ currentRows: [], previousRows: prev }) as never
    )
    const { GET } = await import('@/app/api/artisan/funnel/route')
    const res = await GET(createRequest())
    const body = await res.json()
    expect(body.previousPeriod.assigned).toBe(4)
    // 1 / 4 = 25
    expect(body.previousPeriod.responseRate).toBe(25)
  })

  it('clamp days : 3 → 7, 999 → 365', async () => {
    vi.mocked(createClient).mockResolvedValue(buildSupabase({}) as never)
    const { GET } = await import('@/app/api/artisan/funnel/route')
    const low = await GET(createRequest('http://localhost:3000/api/artisan/funnel?days=3'))
    const high = await GET(createRequest('http://localhost:3000/api/artisan/funnel?days=999'))
    expect((await low.json()).days).toBe(7)
    expect((await high.json()).days).toBe(365)
  })

  it('retourne Cache-Control privé (pas de cache intermédiaire)', async () => {
    vi.mocked(createClient).mockResolvedValue(buildSupabase({}) as never)
    const { GET } = await import('@/app/api/artisan/funnel/route')
    const res = await GET(createRequest())
    expect(res.headers.get('Cache-Control')).toMatch(/private.*no-cache.*no-store/)
  })
})
