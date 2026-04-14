/**
 * Tests — POST /api/admin/simulateur/:publicId/recompute
 *
 * Vérifie que le recompute lit budget_ht en priorité (migration 440) et
 * retombe sur formule_debug si budget_ht est null (rétro-compat).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---- Mocks ----
vi.mock('@/lib/admin-auth', () => ({
  requirePermission: vi.fn(async () => ({
    success: true,
    admin: {
      id: 'admin-1',
      email: 'admin@test.fr',
      role: 'super_admin' as const,
      permissions: {} as unknown,
    },
  })),
  logAdminAction: vi.fn(async () => {}),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

interface DataRow {
  type_logement: string
  residence_principale: boolean
  anciennete: string
  surface_m2: number
  code_postal: string
  zone_climatique: string
  idf: boolean
  foyer_taille: number
  rfr: number
  categorie_anah: string
  parcours: string
  gestes: Array<{ id: string }>
  coup_de_pouce: boolean
  equipement_actuel: string
  sauts_dpe: number | null
  mpr_total: number | null
  cee_fourchette_bas: number | null
  cee_fourchette_haut: number | null
  reste_a_charge_bas: number | null
  reste_a_charge_haut: number | null
  bareme_ids: string[]
  barometre_version: string
  budget_ht: number | null
  formule_debug: Array<{ step: string; inputs?: Record<string, unknown> }> | null
}

let mockRow: DataRow | null = null

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: vi.fn(() => {
      const q: Record<string, unknown> = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn(async () => ({ data: mockRow, error: null })),
      }
      return q
    }),
  }),
}))

// Capture runSimulation inputs to verify budget reading
const runSimulationMock = vi.fn(() => ({
  mprTotal: 1000,
  ceeFourchetteBas: 500,
  ceeFourchetteHaut: 800,
  cdpEstimationBas: 0,
  cdpEstimationHaut: 0,
  ecretementPct: 60,
  resteAChargeBas: 500,
  resteAChargeHaut: 500,
  gestesRetenus: ['PAC_AIREAU'],
  baremeIds: [],
  formuleDebug: [],
}))

vi.mock('@/lib/simulateur/engine', () => ({
  runSimulation: (...args: unknown[]) => runSimulationMock(...(args as [never])),
}))

function makeRow(overrides: Partial<DataRow> = {}): DataRow {
  return {
    type_logement: 'maison',
    residence_principale: true,
    anciennete: 'plus_15_ans',
    surface_m2: 100,
    code_postal: '75001',
    zone_climatique: 'H1',
    idf: true,
    foyer_taille: 3,
    rfr: 28000,
    categorie_anah: 'jaune',
    parcours: 'geste',
    gestes: [{ id: 'PAC_AIREAU' }],
    coup_de_pouce: false,
    equipement_actuel: 'gaz',
    sauts_dpe: null,
    mpr_total: 1000,
    cee_fourchette_bas: 500,
    cee_fourchette_haut: 800,
    reste_a_charge_bas: 500,
    reste_a_charge_haut: 500,
    bareme_ids: [],
    barometre_version: '2026-01-14',
    budget_ht: null,
    formule_debug: null,
    ...overrides,
  }
}

describe('POST /api/admin/simulateur/:publicId/recompute — budget_ht priorité', () => {
  beforeEach(() => {
    runSimulationMock.mockClear()
  })

  it('utilise budget_ht stocké (migration 440) en priorité', async () => {
    mockRow = makeRow({ budget_ht: 25_000 })
    const { POST } = await import('@/app/api/admin/simulateur/[publicId]/recompute/route')
    const req = new Request(
      'http://localhost/api/admin/simulateur/EST-2026-04-14-abc123/recompute',
      { method: 'POST' }
    )
    const res = await POST(req as never, {
      params: Promise.resolve({ publicId: 'EST-2026-04-14-abc123' }),
    })
    expect((res as Response).status).toBe(200)
    expect(runSimulationMock).toHaveBeenCalledTimes(1)
    const arg = runSimulationMock.mock.calls[0]![0] as { budget: { budgetHt: number } }
    expect(arg.budget.budgetHt).toBe(25_000)
  })

  it('retombe sur formule_debug si budget_ht est null', async () => {
    mockRow = makeRow({
      budget_ht: null,
      formule_debug: [
        {
          step: 'applyEcretement',
          inputs: { budgetTTC: 21_100 }, // → budgetHt = 20 000 (arrondi)
        },
      ],
    })
    const { POST } = await import('@/app/api/admin/simulateur/[publicId]/recompute/route')
    const req = new Request(
      'http://localhost/api/admin/simulateur/EST-2026-04-14-abc123/recompute',
      { method: 'POST' }
    )
    const res = await POST(req as never, {
      params: Promise.resolve({ publicId: 'EST-2026-04-14-abc123' }),
    })
    expect((res as Response).status).toBe(200)
    const arg = runSimulationMock.mock.calls[0]![0] as { budget: { budgetHt: number } }
    expect(arg.budget.budgetHt).toBe(20_000)
  })

  it('404 si estimation introuvable', async () => {
    mockRow = null
    const { POST } = await import('@/app/api/admin/simulateur/[publicId]/recompute/route')
    const req = new Request(
      'http://localhost/api/admin/simulateur/EST-2026-04-14-zzz999/recompute',
      { method: 'POST' }
    )
    const res = await POST(req as never, {
      params: Promise.resolve({ publicId: 'EST-2026-04-14-zzz999' }),
    })
    expect((res as Response).status).toBe(404)
  })
})
