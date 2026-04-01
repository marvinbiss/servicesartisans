/**
 * Tests unitaires pour GET /api/artisan/bookings
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockUser = { id: 'user-123' }
const mockProvider = { id: 'provider-456' }

vi.mock('@/lib/auth/artisan-guard', () => ({
  requireArtisan: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
  })),
}))

import { requireArtisan } from '@/lib/auth/artisan-guard'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createRequest(params: Record<string, string> = {}): Request {
  const url = new URL('http://localhost:3000/api/artisan/bookings')
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return new Request(url.toString(), { method: 'GET' })
}

const sampleBookings = [
  {
    id: 'booking-1',
    client_name: 'Jean Dupont',
    client_email: 'jean@example.com',
    client_phone: '0612345678',
    service_description: 'Réparation fuite',
    status: 'confirmed',
    created_at: '2026-03-15T10:00:00Z',
    slot: {
      id: 'slot-1',
      date: '2026-04-15',
      start_time: '09:00',
      end_time: '10:00',
    },
  },
]

const sampleSlots = [
  { id: 'slot-a', date: '2026-04-15', start_time: '14:00', end_time: '15:00', is_available: true },
]

function buildSupabaseMock(overrides: {
  bookings?: unknown[]
  bookingsError?: unknown
  slots?: unknown[]
  slotsError?: unknown
} = {}) {
  const {
    bookings = sampleBookings,
    bookingsError = null,
    slots = sampleSlots,
    slotsError = null,
  } = overrides

  let fromCallIndex = 0

  const supabase: Record<string, unknown> = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
    },
    from: vi.fn().mockImplementation(() => {
      const idx = fromCallIndex++
      const chain: Record<string, unknown> = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn(),
      }

      for (const key of Object.keys(chain)) {
        if (typeof chain[key] === 'function' && key !== 'single') {
          (chain[key] as ReturnType<typeof vi.fn>).mockReturnValue(chain)
        }
      }

      if (idx === 0) {
        // bookings query
        chain.then = (resolve: (v: unknown) => void) => {
          resolve({ data: bookings, error: bookingsError })
          return chain
        }
      } else if (idx === 1) {
        // availability_slots query
        chain.then = (resolve: (v: unknown) => void) => {
          resolve({ data: slots, error: slotsError })
          return chain
        }
      } else {
        // Fallback queries
        chain.then = (resolve: (v: unknown) => void) => {
          resolve({ data: [], error: null })
          return chain
        }
      }

      return chain
    }),
  }

  return supabase
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('GET /api/artisan/bookings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('retourne 401 si non authentifié', async () => {
    vi.mocked(requireArtisan).mockResolvedValue({
      error: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }),
      user: null,
      provider: null,
      supabase: {} as never,
    })

    const { GET } = await import('@/app/api/artisan/bookings/route')
    const response = await GET(createRequest({ month: '3', year: '2026' }))
    expect(response.status).toBe(401)
  })

  it('retourne 400 si les paramètres month/year sont manquants', async () => {
    const supabaseMock = buildSupabaseMock()

    vi.mocked(requireArtisan).mockResolvedValue({
      error: null,
      user: mockUser as never,
      provider: mockProvider as never,
      supabase: supabaseMock as never,
    })

    const { GET } = await import('@/app/api/artisan/bookings/route')
    const response = await GET(createRequest())
    expect(response.status).toBe(400)
  })

  it('retourne les bookings et availabilitySlots (happy path)', async () => {
    const supabaseMock = buildSupabaseMock()

    vi.mocked(requireArtisan).mockResolvedValue({
      error: null,
      user: mockUser as never,
      provider: mockProvider as never,
      supabase: supabaseMock as never,
    })

    const { GET } = await import('@/app/api/artisan/bookings/route')
    const response = await GET(createRequest({ month: '3', year: '2026' }))

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.bookings).toBeDefined()
    expect(body.availabilitySlots).toBeDefined()
    expect(Array.isArray(body.bookings)).toBe(true)
    expect(Array.isArray(body.availabilitySlots)).toBe(true)
  })

  it('utilise les paramètres month et year pour filtrer', async () => {
    const supabaseMock = buildSupabaseMock()
    const fromSpy = supabaseMock.from as ReturnType<typeof vi.fn>

    vi.mocked(requireArtisan).mockResolvedValue({
      error: null,
      user: mockUser as never,
      provider: mockProvider as never,
      supabase: supabaseMock as never,
    })

    const { GET } = await import('@/app/api/artisan/bookings/route')
    await GET(createRequest({ month: '5', year: '2026' }))

    // from() a été appelé au moins une fois (pour bookings)
    expect(fromSpy).toHaveBeenCalledWith('bookings')
  })

  it('retourne un tableau vide quand il n\'y a aucun booking', async () => {
    const supabaseMock = buildSupabaseMock({ bookings: [], slots: [] })

    vi.mocked(requireArtisan).mockResolvedValue({
      error: null,
      user: mockUser as never,
      provider: mockProvider as never,
      supabase: supabaseMock as never,
    })

    const { GET } = await import('@/app/api/artisan/bookings/route')
    const response = await GET(createRequest({ month: '3', year: '2026' }))

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.bookings).toHaveLength(0)
    expect(body.availabilitySlots).toHaveLength(0)
  })
})
