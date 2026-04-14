/**
 * Tests /api/simulateur/submit
 * - consentRgpd = false bloque (422)
 * - insert OK → 201 { publicId }
 * - idempotence baremes_versions upsert (pas d'erreur si déjà présent)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

process.env.RGPD_IP_SALT = 'test-salt'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test'

const upsertMock = vi.fn(async () => ({ error: null }))
const insertCaptured: Array<Record<string, unknown>> = []
let insertShouldFail = false
const insertMock = vi.fn((payload: Record<string, unknown>) => {
  insertCaptured.push(payload)
  return {
    select: (_col: string) => ({
      single: async () =>
        insertShouldFail
          ? { data: null, error: { message: 'insert failed' } }
          : { data: { id: 'est-uuid-1' }, error: null },
    }),
  }
})

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (_table: string) => ({
      upsert: (...args: unknown[]) => upsertMock(...args),
      insert: (payload: Record<string, unknown>) => insertMock(payload),
    }),
  }),
}))

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: () => ({ success: true, remaining: 99, resetAt: Date.now() + 60_000 }),
  getRateLimitHeaders: () => ({}),
}))

const runPipedriveHookMock = vi.fn(async () => {})
vi.mock('@/lib/simulateur/submit-hooks', () => ({
  runPipedriveHook: (...args: unknown[]) => runPipedriveHookMock(...(args as [never])),
}))

import { POST } from '@/app/api/simulateur/submit/route'

function buildReq(body: unknown) {
  return new Request('http://localhost/api/simulateur/submit', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '81.64.12.5' },
    body: JSON.stringify(body),
  }) as unknown as Parameters<typeof POST>[0]
}

const baseBody = {
  situation: {
    typeLogement: 'maison',
    residencePrincipale: true,
    anciennete: 'plus_15_ans',
    surface: 100,
    codePostal: '75001',
    foyer: 3,
    rfr: 28_000,
  },
  projet: {
    parcours: 'geste',
    gestes: ['PAC_AIREAU'],
    coupDePouce: false,
    equipementActuel: 'gaz',
  },
  budget: { budgetHt: 15_000 },
  coordonnees: {
    prenom: 'Alice',
    nom: 'Durand',
    email: 'alice@example.com',
    telephone: '0612345678',
    consentRgpd: true,
    consentMajorite: true,
    consentDemarchage: false,
  },
}

describe('POST /api/simulateur/submit', () => {
  beforeEach(() => {
    upsertMock.mockClear()
    insertMock.mockClear()
    runPipedriveHookMock.mockClear()
    insertCaptured.length = 0
    insertShouldFail = false
  })

  it('consentRgpd = false → 422', async () => {
    const body = {
      ...baseBody,
      coordonnees: { ...baseBody.coordonnees, consentRgpd: false },
    }
    const res = await POST(buildReq(body))
    expect(res.status).toBe(422)
    expect(insertMock).not.toHaveBeenCalled()
  })

  it('happy path → 201 + publicId + insert appelé', async () => {
    const res = await POST(buildReq(baseBody))
    expect(res.status).toBe(201)
    const json = (await (res as Response).json()) as { publicId: string }
    expect(json.publicId).toMatch(/^EST-\d{4}-\d{2}-\d{2}-[a-z0-9]{6,12}$/)
    expect(insertMock).toHaveBeenCalledTimes(1)
    expect(upsertMock).toHaveBeenCalledTimes(1)
  })

  it('idempotence baremes_versions : upsert ignoreDuplicates (pas de retry DB)', async () => {
    upsertMock.mockResolvedValueOnce({ error: null })
    const res1 = await POST(buildReq(baseBody))
    const res2 = await POST(buildReq(baseBody))
    expect(res1.status).toBe(201)
    expect(res2.status).toBe(201)
    expect(upsertMock).toHaveBeenCalledTimes(2)
  })

  it('insert payload inclut budget_ht', async () => {
    const res = await POST(buildReq(baseBody))
    expect(res.status).toBe(201)
    expect(insertCaptured).toHaveLength(1)
    expect(insertCaptured[0]!.budget_ht).toBe(baseBody.budget.budgetHt)
  })

  it('runPipedriveHook est appelé après insert réussi', async () => {
    const res = await POST(buildReq(baseBody))
    expect(res.status).toBe(201)
    // Attendre la microtask du fire-and-forget
    await new Promise((r) => setTimeout(r, 0))
    expect(runPipedriveHookMock).toHaveBeenCalledTimes(1)
    const callArg = runPipedriveHookMock.mock.calls[0]![0] as {
      estimationId: string
      input: { email: string; publicId: string }
    }
    expect(callArg.estimationId).toBe('est-uuid-1')
    expect(callArg.input.email).toBe('alice@example.com')
    expect(callArg.input.publicId).toMatch(/^EST-/)
  })

  it("runPipedriveHook n'est pas appelé si INSERT échoue", async () => {
    insertShouldFail = true
    const res = await POST(buildReq(baseBody))
    expect(res.status).toBe(500)
    await new Promise((r) => setTimeout(r, 0))
    expect(runPipedriveHookMock).not.toHaveBeenCalled()
  })
})
