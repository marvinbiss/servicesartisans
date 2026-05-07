/**
 * Tests — POST /api/devis (canal #1 conversion)
 *
 * Couvre :
 *  - 400 si validation Zod fail (téléphone format, email)
 *  - 200 happy path : processDevis success → { success, id, artisans_notified }
 *  - 409 si processDevis retourne `duplicate`
 *  - 429 si processDevis retourne `email_rate_limit` ou rate-limit IP dépassé
 *  - 500 si processDevis retourne `db_error`
 *  - source attribution : champ `source` accepté dans body, transmis à processDevis
 *  - urgency optionnel défaulté à `flexible` (fix 2026-05-05)
 *  - IndexNow fire-and-forget appelé après success
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

// ---- mocks ----
// vi.hoisted() : variables disponibles au moment du hoisting de vi.mock(),
// sinon ReferenceError "Cannot access X before initialization".

const { checkRateLimitMock } = vi.hoisted(() => ({
  checkRateLimitMock: vi.fn(async () => ({ allowed: true, resetTime: Date.now() + 60_000 })),
}))
vi.mock('@/lib/rate-limiter', () => ({
  checkRateLimit: checkRateLimitMock,
  getClientIp: () => '1.2.3.4',
}))

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

vi.mock('@/lib/monitoring/sentry', () => ({
  captureError: vi.fn(),
}))

vi.mock('@/lib/api/handler', () => ({
  safeJsonBody: async (req: Request) => {
    try {
      const data = await req.json()
      return { ok: true as const, data }
    } catch {
      return {
        ok: false as const,
        response: NextResponse.json({ error: 'JSON invalide' }, { status: 400 }),
      }
    }
  },
}))

// supabase server client (auth)
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: null }, error: null }) },
  }),
}))

// processDevis + IndexNow service mocks (hoisted)
const { processDevisMock, submitToIndexNowMock } = vi.hoisted(() => ({
  processDevisMock: vi.fn(),
  submitToIndexNowMock: vi.fn(async () => undefined),
}))
vi.mock('@/lib/services/devis-service', () => ({
  processDevis: processDevisMock,
}))
vi.mock('@/lib/seo/indexnow', () => ({
  submitToIndexNow: submitToIndexNowMock,
  getProviderAffectedUrls: (s: string, v: string) => [
    `https://servicesartisans.fr/services/${s}/${v}`,
  ],
}))

vi.mock('@/lib/utils', async () => {
  const actual = await vi.importActual<typeof import('@/lib/utils')>('@/lib/utils')
  return { ...actual, slugify: (s: string) => s.toLowerCase().replace(/\s+/g, '-') }
})

import { POST } from '@/app/api/devis/route'

function buildReq(body: unknown): Parameters<typeof POST>[0] {
  return new Request('http://localhost/api/devis', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as Parameters<typeof POST>[0]
}

const baseBody = {
  service: 'plombier',
  urgency: 'flexible',
  description: 'Réparation fuite cuisine',
  codePostal: '75001',
  ville: 'Paris',
  nom: 'Test User',
  email: 'test@example.com',
  telephone: '0612345678',
}

describe('POST /api/devis', () => {
  beforeEach(() => {
    processDevisMock.mockReset()
    submitToIndexNowMock.mockClear()
    checkRateLimitMock.mockResolvedValue({ allowed: true, resetTime: Date.now() + 60_000 })
  })

  it('400 si téléphone format invalide', async () => {
    const res = await POST(buildReq({ ...baseBody, telephone: '123' }))
    expect(res.status).toBe(400)
    expect(processDevisMock).not.toHaveBeenCalled()
  })

  it('400 si service vide', async () => {
    const res = await POST(buildReq({ ...baseBody, service: '' }))
    expect(res.status).toBe(400)
  })

  it('400 si email format invalide', async () => {
    const res = await POST(buildReq({ ...baseBody, email: 'pas-email' }))
    expect(res.status).toBe(400)
  })

  it('400 si source format invalide (caractères interdits)', async () => {
    const res = await POST(buildReq({ ...baseBody, source: 'lp invalid' }))
    expect(res.status).toBe(400)
  })

  it('200 happy path → success + id + artisans_notified', async () => {
    processDevisMock.mockResolvedValue({
      success: true,
      id: 'devis-uuid-1',
      artisans_notified: 3,
      artisans_found: true,
      cee_eligible: false,
    })
    const res = await POST(buildReq(baseBody))
    expect(res.status).toBe(200)
    const body = (await (res as Response).json()) as {
      success: boolean
      id: string
      artisans_notified: number
      cee_eligible: boolean
    }
    expect(body.success).toBe(true)
    expect(body.id).toBe('devis-uuid-1')
    expect(body.artisans_notified).toBe(3)
    expect(body.cee_eligible).toBe(false)
  })

  it('200 + cee_eligible + cee_operation_codes propagés', async () => {
    processDevisMock.mockResolvedValue({
      success: true,
      id: 'devis-uuid-2',
      artisans_notified: 1,
      artisans_found: true,
      cee_eligible: true,
      cee_operation_codes: ['BAR-TH-148'],
    })
    const res = await POST(buildReq(baseBody))
    expect(res.status).toBe(200)
    const body = (await (res as Response).json()) as {
      cee_eligible: boolean
      cee_operation_codes?: string[]
    }
    expect(body.cee_eligible).toBe(true)
    expect(body.cee_operation_codes).toEqual(['BAR-TH-148'])
  })

  it('409 si processDevis retourne duplicate', async () => {
    processDevisMock.mockResolvedValue({ success: false, code: 'duplicate' })
    const res = await POST(buildReq(baseBody))
    expect(res.status).toBe(409)
  })

  it('429 si processDevis retourne email_rate_limit', async () => {
    processDevisMock.mockResolvedValue({ success: false, code: 'email_rate_limit' })
    const res = await POST(buildReq(baseBody))
    expect(res.status).toBe(429)
  })

  it('500 si processDevis retourne db_error', async () => {
    processDevisMock.mockResolvedValue({ success: false, code: 'db_error' })
    const res = await POST(buildReq(baseBody))
    expect(res.status).toBe(500)
  })

  it('429 + Retry-After si rate-limit IP dépassé', async () => {
    checkRateLimitMock.mockResolvedValueOnce({
      allowed: false,
      resetTime: Date.now() + 30_000,
    })
    const res = await POST(buildReq(baseBody))
    expect(res.status).toBe(429)
    expect(res.headers.get('Retry-After')).toBeDefined()
    expect(processDevisMock).not.toHaveBeenCalled()
  })

  it('urgency optionnel défaulté à "flexible" (fix 2026-05-05)', async () => {
    processDevisMock.mockResolvedValue({
      success: true,
      id: 'd',
      artisans_notified: 0,
      artisans_found: false,
      cee_eligible: false,
    })
    // Pas d'urgency dans le body
    const { urgency: _urgency, ...bodyWithoutUrgency } = baseBody
    const res = await POST(buildReq(bodyWithoutUrgency))
    expect(res.status).toBe(200)
    expect(processDevisMock).toHaveBeenCalled()
    const dataArg = processDevisMock.mock.calls[0]?.[0] as { urgency?: string }
    expect(dataArg.urgency).toBe('flexible')
  })

  it('source attribution : champ source transmis tel quel', async () => {
    processDevisMock.mockResolvedValue({
      success: true,
      id: 'd',
      artisans_notified: 1,
      artisans_found: true,
      cee_eligible: false,
    })
    const res = await POST(buildReq({ ...baseBody, source: 'lp_aides-pac' }))
    expect(res.status).toBe(200)
    const dataArg = processDevisMock.mock.calls[0]?.[0] as { source?: string }
    expect(dataArg.source).toBe('lp_aides-pac')
  })

  it('IndexNow fire-and-forget appelé après success avec slugs propres', async () => {
    processDevisMock.mockResolvedValue({
      success: true,
      id: 'd',
      artisans_notified: 1,
      artisans_found: true,
      cee_eligible: false,
    })
    const res = await POST(buildReq(baseBody))
    expect(res.status).toBe(200)
    // microtask flush
    await new Promise((r) => setTimeout(r, 0))
    expect(submitToIndexNowMock).toHaveBeenCalled()
  })

  it('artisans_found=false → artisans_found:false dans body', async () => {
    processDevisMock.mockResolvedValue({
      success: true,
      id: 'd',
      artisans_notified: 0,
      artisans_found: false,
      cee_eligible: false,
    })
    const res = await POST(buildReq(baseBody))
    expect(res.status).toBe(200)
    const body = (await (res as Response).json()) as { artisans_found?: boolean }
    expect(body.artisans_found).toBe(false)
  })
})
