/**
 * Tests unitaires pour GET/POST/DELETE /api/artisan/availability
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

const sampleSlots = [
  {
    id: 'slot-1',
    artisan_id: 'user-123',
    date: '2026-04-15',
    start_time: '09:00',
    end_time: '10:00',
    is_available: true,
    created_at: '2026-03-01',
  },
  {
    id: 'slot-2',
    artisan_id: 'user-123',
    date: '2026-04-15',
    start_time: '14:00',
    end_time: '15:00',
    is_available: true,
    created_at: '2026-03-01',
  },
]

/**
 * Crée une chaîne Supabase fluente qui se résout avec `result` quand elle est awaited.
 * Si singleResult est fourni, `.single()` retourne ce résultat.
 */
function makeChain(result: unknown, singleResult?: unknown) {
  const chain: Record<string, unknown> = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(),
  }
  for (const key of Object.keys(chain)) {
    if (typeof chain[key] === 'function' && key !== 'single') {
      ;(chain[key] as ReturnType<typeof vi.fn>).mockReturnValue(chain)
    }
  }
  // Thenable (quand on await la chaîne directement)
  chain.then = (resolve: (v: unknown) => void) => {
    resolve(result)
    return chain
  }
  // .single() pour les requêtes qui en ont besoin
  if (singleResult !== undefined) {
    ;(chain.single as ReturnType<typeof vi.fn>).mockResolvedValue(singleResult)
  }
  return chain
}

function createJsonRequest(body: unknown): Request {
  return new Request('http://localhost:3000/api/artisan/availability', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

function createDeleteRequest(slotId?: string): Request {
  const url = new URL('http://localhost:3000/api/artisan/availability')
  if (slotId) url.searchParams.set('slotId', slotId)
  return new Request(url.toString(), { method: 'DELETE' })
}

function mockAuthSuccess(supabase: unknown) {
  vi.mocked(requireArtisan).mockResolvedValue({
    error: null,
    user: mockUser as never,
    provider: mockProvider as never,
    supabase: supabase as never,
  })
}

function mockAuthFail() {
  vi.mocked(requireArtisan).mockResolvedValue({
    error: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }),
    user: null,
    provider: null,
    supabase: {} as never,
  })
}

// ─── Tests GET ───────────────────────────────────────────────────────────────

describe('GET /api/artisan/availability', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('retourne 401 si non authentifié', async () => {
    mockAuthFail()

    const { GET } = await import('@/app/api/artisan/availability/route')
    const response = await GET()
    expect(response.status).toBe(401)
  })

  it('retourne les créneaux triés (happy path)', async () => {
    // GET fait un seul from('availability_slots') qui retourne la liste
    const supabase = {
      from: vi.fn().mockReturnValue(makeChain({ data: sampleSlots, error: null })),
    }
    mockAuthSuccess(supabase)

    const { GET } = await import('@/app/api/artisan/availability/route')
    const response = await GET()

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.slots).toHaveLength(2)
    expect(body.slots[0].start_time).toBe('09:00')
    expect(body.slots[1].start_time).toBe('14:00')
  })
})

// ─── Tests POST ──────────────────────────────────────────────────────────────

describe('POST /api/artisan/availability', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('retourne 401 si non authentifié', async () => {
    mockAuthFail()

    const { POST } = await import('@/app/api/artisan/availability/route')
    const response = await POST(
      createJsonRequest({ date: '2026-04-20', start_time: '10:00', end_time: '11:00' })
    )
    expect(response.status).toBe(401)
  })

  it('retourne 400 si end_time <= start_time', async () => {
    mockAuthSuccess({ from: vi.fn() })

    const { POST } = await import('@/app/api/artisan/availability/route')
    const response = await POST(
      createJsonRequest({ date: '2026-04-20', start_time: '14:00', end_time: '13:00' })
    )
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.success).toBe(false)
  })

  it('retourne 400 si la date est invalide', async () => {
    mockAuthSuccess({ from: vi.fn() })

    const { POST } = await import('@/app/api/artisan/availability/route')
    const response = await POST(
      createJsonRequest({ date: 'not-a-date', start_time: '10:00', end_time: '11:00' })
    )
    expect(response.status).toBe(400)
  })

  it('retourne 409 en cas de chevauchement', async () => {
    const existingSlots = [{ id: 'existing-1', start_time: '09:30', end_time: '10:30' }]
    // POST fait : 1) from('availability_slots').select().eq().eq() pour overlap check
    const overlapChain = makeChain({ data: existingSlots, error: null })
    const supabase = {
      from: vi.fn().mockReturnValue(overlapChain),
    }
    mockAuthSuccess(supabase)

    const { POST } = await import('@/app/api/artisan/availability/route')
    const response = await POST(
      createJsonRequest({ date: '2026-04-20', start_time: '10:00', end_time: '11:00' })
    )
    expect(response.status).toBe(409)
    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.error.message).toContain('chevauche')
  })

  it('crée un créneau avec succès (happy path)', async () => {
    const newSlot = {
      id: 'new-slot',
      artisan_id: 'user-123',
      date: '2026-04-20',
      start_time: '10:00',
      end_time: '11:00',
      is_available: true,
    }
    // 1st from() = overlap check (empty), 2nd from() = insert
    let callIdx = 0
    const supabase = {
      from: vi.fn().mockImplementation(() => {
        callIdx++
        if (callIdx === 1) {
          return makeChain({ data: [], error: null })
        }
        // Insert chain — insert().select().single()
        return makeChain({ data: newSlot, error: null }, { data: newSlot, error: null })
      }),
    }
    mockAuthSuccess(supabase)

    const { POST } = await import('@/app/api/artisan/availability/route')
    const response = await POST(
      createJsonRequest({ date: '2026-04-20', start_time: '10:00', end_time: '11:00' })
    )
    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.slot).toBeDefined()
    expect(body.slot.id).toBe('new-slot')
  })
})

// ─── Tests DELETE ────────────────────────────────────────────────────────────

describe('DELETE /api/artisan/availability', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('retourne 401 si non authentifié', async () => {
    mockAuthFail()

    const { DELETE } = await import('@/app/api/artisan/availability/route')
    const response = await DELETE(createDeleteRequest('550e8400-e29b-41d4-a716-446655440000'))
    expect(response.status).toBe(401)
  })

  it('retourne 400 si slotId est invalide', async () => {
    mockAuthSuccess({ from: vi.fn() })

    const { DELETE } = await import('@/app/api/artisan/availability/route')
    const response = await DELETE(createDeleteRequest('not-a-uuid'))
    expect(response.status).toBe(400)
  })

  it("retourne 404 si le créneau n'existe pas", async () => {
    const supabase = {
      from: vi.fn().mockReturnValue(makeChain({}, { data: null, error: { code: 'PGRST116' } })),
    }
    mockAuthSuccess(supabase)

    const { DELETE } = await import('@/app/api/artisan/availability/route')
    const response = await DELETE(createDeleteRequest('550e8400-e29b-41d4-a716-446655440000'))
    expect(response.status).toBe(404)
  })

  it('retourne 403 si le créneau appartient à un autre artisan', async () => {
    const supabase = {
      from: vi.fn().mockReturnValue(
        makeChain(
          {},
          {
            data: { id: '550e8400-e29b-41d4-a716-446655440000', artisan_id: 'other-user-999' },
            error: null,
          }
        )
      ),
    }
    mockAuthSuccess(supabase)

    const { DELETE } = await import('@/app/api/artisan/availability/route')
    const response = await DELETE(createDeleteRequest('550e8400-e29b-41d4-a716-446655440000'))
    expect(response.status).toBe(403)
    const body = await response.json()
    expect(body.error.message).toContain('supprimer')
  })

  it('supprime un créneau existant avec succès', async () => {
    const slotId = '550e8400-e29b-41d4-a716-446655440000'
    let callIdx = 0
    const supabase = {
      from: vi.fn().mockImplementation(() => {
        callIdx++
        if (callIdx === 1) {
          // Fetch slot — .single()
          return makeChain(
            {},
            {
              data: { id: slotId, artisan_id: 'user-123' },
              error: null,
            }
          )
        }
        if (callIdx === 2) {
          // Check active bookings — .single() returns null (no booking)
          return makeChain(
            {},
            {
              data: null,
              error: null,
            }
          )
        }
        // Delete chain
        return makeChain({ error: null })
      }),
    }
    mockAuthSuccess(supabase)

    const { DELETE } = await import('@/app/api/artisan/availability/route')
    const response = await DELETE(createDeleteRequest(slotId))
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })
})
