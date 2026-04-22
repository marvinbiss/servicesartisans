/**
 * Tests unitaires pour GET /api/artisan/rge
 *
 * Couvre les 4 transitions de status :
 *   none / expired / expiring_soon (≤30j) / active
 *
 * + edges : date_fin null, pas de qualif, DB error, auth failures,
 *   payload shape stable pour le front.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUser = { id: 'user-123' }

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

type ProviderRow = {
  rge_qualifications?: unknown[] | null
  rge_valid_until?: string | null
  rge_last_synced_at?: string | null
  rge_source_url?: string | null
  rge_organismes?: string[] | null
}

function buildSupabase(opts: {
  user?: { id: string } | null
  providers?: ProviderRow[] | null
  providerError?: unknown
}) {
  const { user = mockUser, providers = [], providerError = null } = opts
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: providers, error: providerError }),
    })),
  }
}

function isoPlusDays(days: number): string {
  return new Date(Date.now() + days * 86400000).toISOString()
}

describe('GET /api/artisan/rge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('renvoie 401 si non authentifié', async () => {
    vi.mocked(createClient).mockResolvedValue(buildSupabase({ user: null }) as never)
    const { GET } = await import('@/app/api/artisan/rge/route')
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('renvoie 500 si la query provider échoue', async () => {
    vi.mocked(createClient).mockResolvedValue(
      buildSupabase({ providers: null, providerError: { message: 'boom' } }) as never
    )
    const { GET } = await import('@/app/api/artisan/rge/route')
    const res = await GET()
    expect(res.status).toBe(500)
  })

  it('renvoie 403 sans profil artisan', async () => {
    vi.mocked(createClient).mockResolvedValue(buildSupabase({ providers: [] }) as never)
    const { GET } = await import('@/app/api/artisan/rge/route')
    const res = await GET()
    expect(res.status).toBe(403)
  })

  it('status=none quand aucune qualification', async () => {
    vi.mocked(createClient).mockResolvedValue(
      buildSupabase({
        providers: [
          {
            rge_qualifications: [],
            rge_valid_until: null,
            rge_last_synced_at: null,
            rge_source_url: null,
          },
        ],
      }) as never
    )
    const { GET } = await import('@/app/api/artisan/rge/route')
    const res = await GET()
    const body = await res.json()
    expect(body.status).toBe('none')
    expect(body.hasRge).toBe(false)
    expect(body.rgeValidUntil).toBeNull()
    expect(body.daysUntilExpiry).toBeNull()
    expect(Array.isArray(body.qualifications)).toBe(true)
  })

  it('status=expired quand date_fin dans le passé', async () => {
    vi.mocked(createClient).mockResolvedValue(
      buildSupabase({
        providers: [
          {
            rge_qualifications: [{ code: 'RGE-123', domaine: 'Chauffage' }],
            rge_valid_until: isoPlusDays(-10),
            rge_last_synced_at: '2026-04-15T00:00:00.000Z',
            rge_source_url: 'https://ademe.fr/rge/123',
          },
        ],
      }) as never
    )
    const { GET } = await import('@/app/api/artisan/rge/route')
    const res = await GET()
    const body = await res.json()
    expect(body.status).toBe('expired')
    expect(body.hasRge).toBe(true)
    expect(body.daysUntilExpiry).toBeLessThanOrEqual(-9)
  })

  it('status=expiring_soon quand expire dans 15j (≤30)', async () => {
    vi.mocked(createClient).mockResolvedValue(
      buildSupabase({
        providers: [
          {
            rge_qualifications: [{ code: 'RGE-123' }],
            rge_valid_until: isoPlusDays(15),
          },
        ],
      }) as never
    )
    const { GET } = await import('@/app/api/artisan/rge/route')
    const res = await GET()
    const body = await res.json()
    expect(body.status).toBe('expiring_soon')
    expect(body.daysUntilExpiry).toBeLessThanOrEqual(15)
    expect(body.daysUntilExpiry).toBeGreaterThanOrEqual(14)
  })

  it('status=active quand expire dans >30j', async () => {
    vi.mocked(createClient).mockResolvedValue(
      buildSupabase({
        providers: [
          {
            rge_qualifications: [{ code: 'RGE-123' }],
            rge_valid_until: isoPlusDays(120),
          },
        ],
      }) as never
    )
    const { GET } = await import('@/app/api/artisan/rge/route')
    const res = await GET()
    const body = await res.json()
    expect(body.status).toBe('active')
  })

  it('status=active (edge) si qualif mais rge_valid_until absent', async () => {
    vi.mocked(createClient).mockResolvedValue(
      buildSupabase({
        providers: [
          {
            rge_qualifications: [{ code: 'RGE-123' }],
            rge_valid_until: null,
          },
        ],
      }) as never
    )
    const { GET } = await import('@/app/api/artisan/rge/route')
    const res = await GET()
    const body = await res.json()
    // Qualifs présentes mais pas de date agrégée → doc : 'active' fallback
    expect(body.status).toBe('active')
    expect(body.hasRge).toBe(true)
  })

  it('renvoie les qualifications JSONB telles quelles', async () => {
    const qualifs = [
      { code: 'A', organisme: 'Qualibat' },
      { code: 'B', organisme: 'Qualifelec' },
    ]
    vi.mocked(createClient).mockResolvedValue(
      buildSupabase({
        providers: [
          {
            rge_qualifications: qualifs,
            rge_valid_until: isoPlusDays(100),
          },
        ],
      }) as never
    )
    const { GET } = await import('@/app/api/artisan/rge/route')
    const res = await GET()
    const body = await res.json()
    expect(body.qualifications).toEqual(qualifs)
  })

  it('rge_qualifications non-array → traité comme vide', async () => {
    vi.mocked(createClient).mockResolvedValue(
      buildSupabase({
        providers: [
          {
            rge_qualifications: { not: 'array' } as never,
            rge_valid_until: null,
          },
        ],
      }) as never
    )
    const { GET } = await import('@/app/api/artisan/rge/route')
    const res = await GET()
    const body = await res.json()
    expect(body.status).toBe('none')
    expect(body.qualifications).toEqual([])
  })
})
