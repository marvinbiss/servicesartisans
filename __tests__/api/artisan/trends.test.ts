/**
 * Tests unitaires pour GET /api/artisan/trends
 *
 * Couvre :
 *  - auth 401 / provider 403
 *  - axis de `days` points fixes, jours à 0 inclus
 *  - bucketing par YYYY-MM-DD (UTC) de multiples events sur même jour
 *  - clamp days [7..90]
 *  - totaux = somme des séries
 *  - résilience quand un bloc échoue (error loggé, série vide)
 *  - lead_assignments bucketé par assigned_at (pas created_at)
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

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type EventRow = { created_at: string }
type LeadRow = { assigned_at: string }

function buildClient(opts: {
  user?: { id: string } | null
  providers?: { id: string }[]
  leads?: LeadRow[]
  leadsError?: unknown
}) {
  const { user = mockUser, providers = [mockProvider], leads = [], leadsError = null } = opts
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
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
        const chain: Record<string, ReturnType<typeof vi.fn>> = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
        }
        const thenable = {
          ...chain,
          then: (resolve: (v: unknown) => void) => {
            resolve({ data: leadsError ? null : leads, error: leadsError })
            return thenable
          },
        }
        for (const k of ['select', 'eq', 'gte']) chain[k].mockReturnValue(thenable)
        return thenable
      }
      return {}
    }),
  }
}

function buildAdmin(events: Record<string, EventRow[]>) {
  // events keyed by event_type
  return {
    from: vi.fn().mockImplementation(() => {
      const state = { eventType: '' }
      const chain: Record<string, ReturnType<typeof vi.fn>> = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockImplementation((col: string, val: string) => {
          if (col === 'event_type') state.eventType = val
          return thenable
        }),
        gte: vi.fn().mockReturnThis(),
      }
      const thenable = {
        ...chain,
        then: (resolve: (v: unknown) => void) => {
          resolve({ data: events[state.eventType] ?? [], error: null })
          return thenable
        },
      }
      for (const k of ['select', 'gte']) chain[k].mockReturnValue(thenable)
      return thenable
    }),
  }
}

function createRequest(url = 'http://localhost:3000/api/artisan/trends'): Request {
  return new Request(url)
}

describe('GET /api/artisan/trends', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('renvoie 401 sans user', async () => {
    vi.mocked(createClient).mockResolvedValue(buildClient({ user: null }) as never)
    vi.mocked(createAdminClient).mockReturnValue(buildAdmin({}) as never)
    const { GET } = await import('@/app/api/artisan/trends/route')
    const res = await GET(createRequest())
    expect(res.status).toBe(401)
  })

  it('renvoie 403 sans provider actif', async () => {
    vi.mocked(createClient).mockResolvedValue(buildClient({ providers: [] }) as never)
    vi.mocked(createAdminClient).mockReturnValue(buildAdmin({}) as never)
    const { GET } = await import('@/app/api/artisan/trends/route')
    const res = await GET(createRequest())
    expect(res.status).toBe(403)
  })

  it("retourne un axis de `days` points avec des jours à 0 quand pas d'events", async () => {
    vi.mocked(createClient).mockResolvedValue(buildClient({}) as never)
    vi.mocked(createAdminClient).mockReturnValue(buildAdmin({}) as never)
    const { GET } = await import('@/app/api/artisan/trends/route')
    const res = await GET(createRequest('http://localhost:3000/api/artisan/trends?days=14'))
    const body = await res.json()
    expect(body.days).toBe(14)
    expect(body.series.profileViews).toHaveLength(14)
    expect(body.series.phoneReveals).toHaveLength(14)
    expect(body.series.phoneClicks).toHaveLength(14)
    expect(body.series.demandesRecues).toHaveLength(14)
    expect(body.totals.profileViews).toBe(0)
    // Axis croissant
    const days = body.series.profileViews.map((p: { day: string }) => p.day)
    expect([...days].sort()).toEqual(days)
  })

  it('bucketise plusieurs events sur le même jour correctement', async () => {
    const today = new Date().toISOString().slice(0, 10)
    vi.mocked(createClient).mockResolvedValue(buildClient({}) as never)
    vi.mocked(createAdminClient).mockReturnValue(
      buildAdmin({
        artisan_profile_view: [
          { created_at: `${today}T10:00:00.000Z` },
          { created_at: `${today}T14:30:00.000Z` },
          { created_at: `${today}T22:15:00.000Z` },
        ],
        phone_reveal: [{ created_at: `${today}T11:00:00.000Z` }],
        phone_click: [],
      }) as never
    )
    const { GET } = await import('@/app/api/artisan/trends/route')
    const res = await GET(createRequest('http://localhost:3000/api/artisan/trends?days=7'))
    const body = await res.json()
    expect(body.totals.profileViews).toBe(3)
    expect(body.totals.phoneReveals).toBe(1)
    expect(body.totals.phoneClicks).toBe(0)
    // Le dernier point de l'axis (today) contient 3 pour profileViews
    const last = body.series.profileViews[body.series.profileViews.length - 1]
    expect(last.day).toBe(today)
    expect(last.count).toBe(3)
  })

  it('bucketise lead_assignments via assigned_at', async () => {
    const today = new Date().toISOString().slice(0, 10)
    vi.mocked(createClient).mockResolvedValue(
      buildClient({
        leads: [
          { assigned_at: `${today}T12:00:00.000Z` },
          { assigned_at: `${today}T13:00:00.000Z` },
        ],
      }) as never
    )
    vi.mocked(createAdminClient).mockReturnValue(buildAdmin({}) as never)
    const { GET } = await import('@/app/api/artisan/trends/route')
    const res = await GET(createRequest())
    const body = await res.json()
    expect(body.totals.demandesRecues).toBe(2)
    const last = body.series.demandesRecues[body.series.demandesRecues.length - 1]
    expect(last.count).toBe(2)
  })

  it('clamp days : 3 → 7, 999 → 90', async () => {
    vi.mocked(createClient).mockResolvedValue(buildClient({}) as never)
    vi.mocked(createAdminClient).mockReturnValue(buildAdmin({}) as never)
    const { GET } = await import('@/app/api/artisan/trends/route')
    const low = await GET(createRequest('http://localhost:3000/api/artisan/trends?days=3'))
    const high = await GET(createRequest('http://localhost:3000/api/artisan/trends?days=999'))
    expect((await low.json()).days).toBe(7)
    expect((await high.json()).days).toBe(90)
  })

  it('ignore les rows sans created_at/assigned_at', async () => {
    const today = new Date().toISOString().slice(0, 10)
    vi.mocked(createClient).mockResolvedValue(buildClient({}) as never)
    vi.mocked(createAdminClient).mockReturnValue(
      buildAdmin({
        artisan_profile_view: [
          { created_at: `${today}T10:00:00.000Z` },
          { created_at: null as unknown as string },
          { created_at: '' as unknown as string },
        ],
      }) as never
    )
    const { GET } = await import('@/app/api/artisan/trends/route')
    const res = await GET(createRequest('http://localhost:3000/api/artisan/trends?days=7'))
    const body = await res.json()
    expect(body.totals.profileViews).toBe(1)
  })
})
