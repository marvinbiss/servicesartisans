/**
 * Tests /api/simulateur/estimate
 * - Happy path
 * - Zod invalide
 * - Rate limit
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

process.env.RGPD_IP_SALT = 'test-salt'

// Rate limit doit être frais à chaque test
vi.mock('@/lib/rate-limit', () => {
  let calls = 0
  return {
    rateLimit: vi.fn((_key: string, limit: number) => {
      calls += 1
      return {
        success: calls <= limit,
        remaining: Math.max(0, limit - calls),
        resetAt: Date.now() + 60_000,
      }
    }),
    getRateLimitHeaders: vi.fn(() => ({})),
    __reset: () => {
      calls = 0
    },
  }
})

import { POST } from '@/app/api/simulateur/estimate/route'

function buildReq(body: unknown, ip = '81.64.12.5') {
  return new Request('http://localhost/api/simulateur/estimate', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  }) as unknown as Parameters<typeof POST>[0]
}

const validBody = {
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
}

describe('POST /api/simulateur/estimate', () => {
  beforeEach(async () => {
    const rl = (await import('@/lib/rate-limit')) as unknown as {
      __reset: () => void
    }
    rl.__reset()
  })

  it('happy path : retourne une estimation numérique', async () => {
    const res = await POST(buildReq(validBody))
    expect(res.status).toBe(200)
    const json = (await (res as Response).json()) as Record<string, unknown>
    expect(typeof json.mprTotal).toBe('number')
    expect(typeof json.resteAChargeBas).toBe('number')
    expect(typeof json.resteAChargeHaut).toBe('number')
    expect(json.categorieAnah).toBeDefined()
  })

  it('Zod invalide : 422 sur corps malformé', async () => {
    const bad = { ...validBody, situation: { ...validBody.situation, surface: 2 } }
    const res = await POST(buildReq(bad))
    expect(res.status).toBe(422)
  })

  it('Rate limit : 429 après quota', async () => {
    // 10 requêtes OK puis 11e refusée
    for (let i = 0; i < 10; i++) {
      const ok = await POST(buildReq(validBody, '1.1.1.1'))
      expect(ok.status).toBe(200)
    }
    const blocked = await POST(buildReq(validBody, '1.1.1.1'))
    expect(blocked.status).toBe(429)
  })
})
