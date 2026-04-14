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
const insertMock = vi.fn(async () => ({ error: null }))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (_table: string) => ({
      upsert: (...args: unknown[]) => upsertMock(...args),
      insert: (...args: unknown[]) => insertMock(...args),
    }),
  }),
}))

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: () => ({ success: true, remaining: 99, resetAt: Date.now() + 60_000 }),
  getRateLimitHeaders: () => ({}),
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
})
