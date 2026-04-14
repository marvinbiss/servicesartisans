/**
 * Tests — Admin simulateur (P5)
 * Couvre :
 *  - Export CSV (escape, colonnes, RFR tranche, filtres combinés)
 *  - requirePermission('simulateur', 'read') refuse si pas admin
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

// ============================================
// Mocks (must precede route import)
// ============================================

const mockAuthResult = {
  success: true,
  admin: {
    id: 'admin-1',
    email: 'admin@test.fr',
    role: 'super_admin' as const,
    permissions: {} as unknown,
  },
}

let forbidAuth = false

vi.mock('@/lib/admin-auth', () => ({
  requirePermission: vi.fn(async () => {
    if (forbidAuth) {
      return {
        success: false,
        error: NextResponse.json(
          { success: false, error: { code: 'FORBIDDEN', message: 'Accès admin requis' } },
          { status: 403 }
        ),
      }
    }
    return mockAuthResult
  }),
  logAdminAction: vi.fn(async () => {}),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    api: { request: vi.fn(), success: vi.fn(), error: vi.fn() },
  },
}))

// ---- Supabase chainable mock ----
interface MockRow {
  public_id: string
  created_at: string
  categorie_anah: string
  parcours: string
  zone_climatique: string
  rfr: number | null
  surface_m2: number
  mpr_total: number | null
  cee_fourchette_bas: number | null
  cee_fourchette_haut: number | null
  coup_pouce_estimation: number | null
  reste_a_charge_bas: number | null
  reste_a_charge_haut: number | null
  pipedrive_deal_id: string | null
  barometre_version: string
}

const capturedFilters: Array<{ method: string; args: unknown[] }> = []
let mockRows: MockRow[] = []

function makeQuery() {
  const q: Record<string, unknown> = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn((...args: unknown[]) => {
      capturedFilters.push({ method: 'eq', args })
      return q
    }),
    gte: vi.fn((...args: unknown[]) => {
      capturedFilters.push({ method: 'gte', args })
      return q
    }),
    lte: vi.fn((...args: unknown[]) => {
      capturedFilters.push({ method: 'lte', args })
      return q
    }),
    ilike: vi.fn((...args: unknown[]) => {
      capturedFilters.push({ method: 'ilike', args })
      return q
    }),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  }
  ;(q as Record<string, unknown>).then = (resolve: (v: unknown) => unknown) =>
    resolve({ data: mockRows, error: null })
  return q
}

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: vi.fn(() => makeQuery()),
  }),
}))

// ============================================
// Tests
// ============================================

describe('escapeCsvCell', () => {
  let escapeCsvCell: (v: unknown) => string
  let buildCsv: (rows: Array<Record<string, unknown>>, cols?: Array<{ key: string; label: string }>) => string

  beforeEach(async () => {
    const mod = await import('@/app/api/admin/simulateur/export/route')
    escapeCsvCell = mod.escapeCsvCell
    buildCsv = mod.buildCsv
  })

  it('returns empty string for null/undefined', () => {
    expect(escapeCsvCell(null)).toBe('')
    expect(escapeCsvCell(undefined)).toBe('')
    expect(escapeCsvCell('')).toBe('')
  })

  it('does not quote simple values', () => {
    expect(escapeCsvCell('hello')).toBe('hello')
    expect(escapeCsvCell(42)).toBe('42')
    expect(escapeCsvCell(true)).toBe('true')
  })

  it('quotes values containing comma', () => {
    expect(escapeCsvCell('a,b')).toBe('"a,b"')
  })

  it('escapes double quotes by doubling', () => {
    expect(escapeCsvCell('hello "world"')).toBe('"hello ""world"""')
  })

  it('quotes values with newlines or semicolons', () => {
    expect(escapeCsvCell('line1\nline2')).toBe('"line1\nline2"')
    expect(escapeCsvCell('a;b')).toBe('"a;b"')
  })

  it('buildCsv returns header + body with correct columns', () => {
    const csv = buildCsv(
      [{ a: 'x', b: 'y,z' }],
      [
        { key: 'a', label: 'A' },
        { key: 'b', label: 'B' },
      ]
    )
    expect(csv).toBe('A,B\nx,"y,z"')
  })
})

describe('GET /api/admin/simulateur/export', () => {
  beforeEach(() => {
    forbidAuth = false
    capturedFilters.length = 0
    mockRows = []
    vi.clearAllMocks()
  })

  it('returns 403 when requirePermission fails', async () => {
    forbidAuth = true
    const { GET } = await import('@/app/api/admin/simulateur/export/route')
    const req = new Request('http://localhost/api/admin/simulateur/export')
    const res = (await GET(req as never)) as Response
    expect(res.status).toBe(403)
  })

  it('streams CSV with UTF-8 BOM and correct filename', async () => {
    mockRows = [
      {
        public_id: 'EST-2026-04-14-abc123',
        created_at: '2026-04-14T10:00:00Z',
        categorie_anah: 'jaune',
        parcours: 'geste',
        zone_climatique: 'H1',
        rfr: 24_500,
        surface_m2: 90,
        mpr_total: 4000,
        cee_fourchette_bas: 3200,
        cee_fourchette_haut: 5400,
        coup_pouce_estimation: 2000,
        reste_a_charge_bas: 6200,
        reste_a_charge_haut: 8400,
        pipedrive_deal_id: '12345',
        barometre_version: '2026-01-14',
      },
    ]
    const { GET } = await import('@/app/api/admin/simulateur/export/route')
    const req = new Request('http://localhost/api/admin/simulateur/export')
    const res = (await GET(req as never)) as Response
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/csv')
    expect(res.headers.get('Content-Disposition')).toContain('attachment')
    const buf = new Uint8Array(await res.arrayBuffer())
    // BOM UTF-8 = EF BB BF
    expect(buf[0]).toBe(0xef)
    expect(buf[1]).toBe(0xbb)
    expect(buf[2]).toBe(0xbf)
    const text = new TextDecoder('utf-8').decode(buf)
    // Colonnes du header
    expect(text).toContain('public_id,created_at,categorie,parcours,zone,rfr_tranche')
    expect(text).toContain('mpr_total,cee_bas,cee_haut,cdp_haut')
    expect(text).toContain('reste_a_charge_bas,reste_a_charge_haut,pipedrive_deal_id,baremes_version')
    // Ligne de donnée : RFR 24500 → tranche 20000-29999
    expect(text).toContain('EST-2026-04-14-abc123')
    expect(text).toContain('20000-29999')
    expect(text).toContain('2026-01-14')
  })

  it('escapes commas in values correctly', async () => {
    mockRows = [
      {
        public_id: 'EST-2026-04-14-xyz,quo"te',
        created_at: '2026-04-14T10:00:00Z',
        categorie_anah: 'bleu',
        parcours: 'accompagne',
        zone_climatique: 'H2',
        rfr: 15_000,
        surface_m2: 60,
        mpr_total: 10_000,
        cee_fourchette_bas: 0,
        cee_fourchette_haut: 0,
        coup_pouce_estimation: 0,
        reste_a_charge_bas: 5000,
        reste_a_charge_haut: 5000,
        pipedrive_deal_id: null,
        barometre_version: '2026-01-14',
      },
    ]
    const { GET } = await import('@/app/api/admin/simulateur/export/route')
    const req = new Request('http://localhost/api/admin/simulateur/export')
    const res = (await GET(req as never)) as Response
    const text = await res.text()
    // La virgule et les guillemets doivent être escaped
    expect(text).toContain('"EST-2026-04-14-xyz,quo""te"')
  })

  it('applies combined filters (categorie + dates)', async () => {
    const { GET } = await import('@/app/api/admin/simulateur/export/route')
    const req = new Request(
      'http://localhost/api/admin/simulateur/export?categorie=jaune&from=2026-01-01&to=2026-04-14&zone=H1'
    )
    await GET(req as never)

    // Vérifier que eq/gte/lte ont été appelés avec les bons args
    const eqCalls = capturedFilters.filter((f) => f.method === 'eq')
    expect(eqCalls.some((c) => c.args[0] === 'categorie_anah' && c.args[1] === 'jaune')).toBe(true)
    expect(eqCalls.some((c) => c.args[0] === 'zone_climatique' && c.args[1] === 'H1')).toBe(true)

    const gteCalls = capturedFilters.filter((f) => f.method === 'gte')
    expect(gteCalls.some((c) => c.args[0] === 'created_at' && c.args[1] === '2026-01-01')).toBe(true)

    const lteCalls = capturedFilters.filter((f) => f.method === 'lte')
    expect(lteCalls.some((c) => c.args[0] === 'created_at' && c.args[1] === '2026-04-14')).toBe(true)
  })

  it('rejects invalid query params (bad categorie)', async () => {
    const { GET } = await import('@/app/api/admin/simulateur/export/route')
    const req = new Request('http://localhost/api/admin/simulateur/export?categorie=noir')
    const res = (await GET(req as never)) as Response
    expect(res.status).toBe(400)
  })
})
