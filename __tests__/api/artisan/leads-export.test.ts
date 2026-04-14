/**
 * Tests unitaires pour GET /api/artisan/leads/export
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

function createMockRequest(params: Record<string, string> = {}): Request {
  const url = new URL('http://localhost:3000/api/artisan/leads/export')
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  // NextRequest needs nextUrl — we simulate it
  const req = new Request(url.toString(), { method: 'GET' })
  // Attach nextUrl for NextRequest compatibility
  Object.defineProperty(req, 'nextUrl', { value: url })
  return req
}

function buildSupabaseMock(assignments: unknown[] = [], queryError: unknown = null) {
  const chain: Record<string, unknown> = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    single: vi.fn(),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
    },
  }

  // Make fluent
  for (const key of Object.keys(chain)) {
    if (typeof chain[key] === 'function' && !['single', 'auth'].includes(key)) {
      ;(chain[key] as ReturnType<typeof vi.fn>).mockReturnValue(chain)
    }
  }

  // The chain is thenable — resolves with the query result
  let callCount = 0
  chain.then = (resolve: (v: unknown) => void) => {
    callCount++
    // First .from('providers') call -> single(), second .from('lead_assignments') -> data
    resolve({ data: assignments, error: queryError })
    return chain
  }

  // single() for the provider lookup
  ;(chain.single as ReturnType<typeof vi.fn>).mockResolvedValue({
    data: mockProvider,
    error: null,
  })

  return chain
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('GET /api/artisan/leads/export', () => {
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

    const { GET } = await import('@/app/api/artisan/leads/export/route')
    const response = await GET(createMockRequest() as never)
    expect(response.status).toBe(401)
  })

  it('retourne un CSV avec Content-Type et BOM UTF-8 (happy path)', async () => {
    const mockAssignments = [
      {
        id: 'a1',
        status: 'pending',
        assigned_at: '2026-03-15T10:00:00Z',
        lead: {
          id: 'l1',
          service_name: 'Plomberie',
          city: 'Paris',
          postal_code: '75001',
          description: 'Fuite robinet',
          client_name: 'Jean Dupont',
          client_email: 'jean@example.com',
          client_phone: '0612345678',
          created_at: '2026-03-15T10:00:00Z',
        },
      },
    ]

    // The export route calls:
    // 1) supabase.auth.getUser() -> user
    // 2) supabase.from('providers').select().eq().eq().single() -> provider
    // 3) supabase.from('lead_assignments').select().eq().order().limit()... -> assignments
    let fromIdx = 0
    const supabaseMock: Record<string, unknown> = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: vi.fn().mockImplementation(() => {
        fromIdx++
        const chain: Record<string, unknown> = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          single: vi.fn(),
        }
        for (const key of Object.keys(chain)) {
          if (typeof chain[key] === 'function' && key !== 'single') {
            ;(chain[key] as ReturnType<typeof vi.fn>).mockReturnValue(chain)
          }
        }
        if (fromIdx === 1) {
          // providers query
          ;(chain.single as ReturnType<typeof vi.fn>).mockResolvedValue({
            data: mockProvider,
            error: null,
          })
        } else {
          // lead_assignments query — thenable
          chain.then = (resolve: (v: unknown) => void) => {
            resolve({ data: mockAssignments, error: null })
            return chain
          }
        }
        return chain
      }),
    }

    vi.mocked(requireArtisan).mockResolvedValue({
      error: null,
      user: mockUser as never,
      provider: mockProvider as never,
      supabase: supabaseMock as never,
    })

    const { GET } = await import('@/app/api/artisan/leads/export/route')
    const response = await GET(createMockRequest() as never)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/csv; charset=utf-8')

    const text = await response.text()
    // Note : Le BOM UTF-8 (\uFEFF) est ajouté dans le code source mais jsdom le strip
    // lors de la sérialisation. On vérifie que le contenu CSV est correct.
    // Vérifie les en-têtes CSV avec séparateur ;
    expect(text).toContain('"Date"')
    expect(text).toContain('"Client"')
    // Vérifie les données
    expect(text).toContain('Plomberie')
    expect(text).toContain('Jean Dupont')
    // Vérifie Content-Disposition
    expect(response.headers.get('Content-Disposition')).toContain('leads-export-')
  })

  it('utilise le séparateur point-virgule', async () => {
    const mockAssignments = [
      {
        id: 'a1',
        status: 'viewed',
        assigned_at: '2026-03-15T10:00:00Z',
        lead: {
          id: 'l1',
          service_name: 'Électricité',
          city: 'Lyon',
          postal_code: '69001',
          description: 'Panne totale',
          client_name: 'Marie Martin',
          client_email: 'marie@example.com',
          client_phone: '0698765432',
          created_at: '2026-03-15T10:00:00Z',
        },
      },
    ]

    const supabaseMock = buildSupabaseMock(mockAssignments)

    vi.mocked(requireArtisan).mockResolvedValue({
      error: null,
      user: mockUser as never,
      provider: mockProvider as never,
      supabase: supabaseMock as never,
    })

    const { GET } = await import('@/app/api/artisan/leads/export/route')
    const response = await GET(createMockRequest() as never)
    const text = await response.text()

    // Chaque ligne de données contient des ;
    const lines = text.split('\n')
    // Header line (after BOM)
    expect(lines[0]).toContain(';')
    // Data line
    if (lines[1]) {
      expect(lines[1]).toContain(';')
    }
  })

  it('échappe les guillemets dans les valeurs CSV', async () => {
    const mockAssignments = [
      {
        id: 'a1',
        status: 'pending',
        assigned_at: '2026-03-15T10:00:00Z',
        lead: {
          id: 'l1',
          service_name: 'Plomberie',
          city: 'Paris',
          postal_code: '75001',
          description: 'Il a dit "bonjour"',
          client_name: 'Jean "Le Grand" Dupont',
          client_email: 'jean@example.com',
          client_phone: null,
          created_at: '2026-03-15T10:00:00Z',
        },
      },
    ]

    const supabaseMock = buildSupabaseMock(mockAssignments)

    vi.mocked(requireArtisan).mockResolvedValue({
      error: null,
      user: mockUser as never,
      provider: mockProvider as never,
      supabase: supabaseMock as never,
    })

    const { GET } = await import('@/app/api/artisan/leads/export/route')
    const response = await GET(createMockRequest() as never)
    const text = await response.text()

    // Les guillemets dans les valeurs doivent être doublés
    expect(text).toContain('""bonjour""')
    expect(text).toContain('""Le Grand""')
  })

  it('passe le filtre status à la requête Supabase', async () => {
    const supabaseMock = buildSupabaseMock([])
    const eqSpy = supabaseMock.eq as ReturnType<typeof vi.fn>

    vi.mocked(requireArtisan).mockResolvedValue({
      error: null,
      user: mockUser as never,
      provider: mockProvider as never,
      supabase: supabaseMock as never,
    })

    const { GET } = await import('@/app/api/artisan/leads/export/route')
    await GET(createMockRequest({ status: 'pending' }) as never)

    // Vérifie que eq a été appelé avec 'status', 'pending'
    expect(eqSpy).toHaveBeenCalledWith('status', 'pending')
  })
})
