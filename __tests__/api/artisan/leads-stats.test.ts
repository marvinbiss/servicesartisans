/**
 * Tests unitaires pour GET /api/artisan/leads/stats
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockUser = { id: 'user-123' }
const mockProvider = { id: 'provider-456' }

// Mock requireArtisan
vi.mock('@/lib/auth/artisan-guard', () => ({
  requireArtisan: vi.fn(),
}))

// Mock createAdminClient
const mockAdminFrom = vi.fn()
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockAdminFrom,
  })),
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

// Mock next/headers (needed by supabase/server)
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
  })),
}))

import { requireArtisan } from '@/lib/auth/artisan-guard'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockSupabaseChain(overrides: Record<string, unknown> = {}) {
  const chain: Record<string, unknown> = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: mockProvider, error: null }),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    ...overrides,
  }
  // Make each method return the chain for fluent API
  for (const key of Object.keys(chain)) {
    if (typeof chain[key] === 'function' && !['single', 'limit'].includes(key)) {
      ;(chain[key] as ReturnType<typeof vi.fn>).mockReturnValue(chain)
    }
  }
  return chain
}

/** Build a count response like Supabase { count: N, data: null, error: null } */
function countResult(count: number) {
  return { count, data: null, error: null }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('GET /api/artisan/leads/stats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retourne 401 si non authentifié', async () => {
    vi.mocked(requireArtisan).mockResolvedValue({
      error: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }),
      user: null,
      provider: null,
      supabase: {} as never,
    })

    const { GET } = await import('@/app/api/artisan/leads/stats/route')
    const response = await GET()
    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('Non authentifié')
  })

  it('retourne 403 si aucun profil artisan', async () => {
    const supabaseMock = mockSupabaseChain()
    supabaseMock.single = vi.fn().mockResolvedValue({ data: null, error: null })

    vi.mocked(requireArtisan).mockResolvedValue({
      error: null,
      user: mockUser as never,
      provider: { id: 'test-provider-id' } as never,
      supabase: supabaseMock as never,
    })

    const { GET } = await import('@/app/api/artisan/leads/stats/route')
    const response = await GET()
    expect(response.status).toBe(403)
  })

  it('retourne les stats avec les bons champs (happy path)', async () => {
    const supabaseMock = mockSupabaseChain()
    supabaseMock.single = vi.fn().mockResolvedValue({ data: mockProvider, error: null })

    vi.mocked(requireArtisan).mockResolvedValue({
      error: null,
      user: mockUser as never,
      provider: mockProvider as never,
      supabase: supabaseMock as never,
    })

    // Mock adminClient.from() — every call returns a chain that resolves to a count
    let callIndex = 0
    const countValues = [
      50, // total
      10, // pending
      15, // viewed
      5, // declined
      8, // quoted (lead_events)
      4, // accepted
      2, // completed
      12, // thisMonth
      8, // lastMonth
      // 6 trend months
      3,
      4,
      6,
      8,
      10,
      12,
    ]

    mockAdminFrom.mockImplementation(() => {
      const idx = callIndex
      const adminChain: Record<string, unknown> = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      }
      // Make fluent
      for (const key of Object.keys(adminChain)) {
        if (typeof adminChain[key] === 'function' && key !== 'limit') {
          ;(adminChain[key] as ReturnType<typeof vi.fn>).mockReturnValue(adminChain)
        }
      }

      // The chain itself (when awaited as a Promise.all entry) should resolve with count
      // Supabase chains are thennable — the last method in the chain is awaited
      // For head:true queries, the last call is .eq() which returns the chain
      // We need the chain itself to be a thenable that resolves with { count, error }
      const thenableResult = countResult(countValues[idx] ?? 0)
      adminChain.then = (resolve: (v: unknown) => void) => {
        resolve(thenableResult)
        return adminChain
      }

      callIndex++
      return adminChain
    })

    const { GET } = await import('@/app/api/artisan/leads/stats/route')
    const response = await GET()

    expect(response.status).toBe(200)
    const body = await response.json()

    expect(body.stats).toBeDefined()
    expect(body.stats.total).toBe(50)
    expect(body.stats.pending).toBe(10)
    expect(body.stats.viewed).toBe(15)
    expect(body.stats.declined).toBe(5)
    expect(body.stats.quoted).toBe(8)
    expect(body.stats.accepted).toBe(4)
    expect(body.stats.completed).toBe(2)
    expect(body.stats.thisMonth).toBe(12)
    expect(body.stats.lastMonth).toBe(8)
    expect(body.stats.conversionRate).toBe(50) // 4/8 * 100
    expect(body.stats.monthlyGrowth).toBe(50) // (12-8)/8 * 100
    expect(body.stats.avgResponseMinutes).toBeDefined()
    expect(body.monthlyTrend).toBeDefined()
    expect(body.monthlyTrend).toHaveLength(6)
  })
})
