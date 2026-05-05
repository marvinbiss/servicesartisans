/**
 * Funnel devis fix 2026-05-05 — regression test on Zod schema contract.
 *
 * Memory `audit-funnel-devis-fail-soft.mjs` Tier 55 covered fail-soft
 * surfacing, but did NOT cover the client/server contract mismatch that
 * caused the 92.8% drop-off : `urgency` was REQUIRED server-side while
 * client `validateStep2` treated it as optional. Submitting step 3
 * without urgence → 400 → fieldError redirected to step 2 → user friction.
 *
 * This test pins the fix : urgency MUST be optional with default 'flexible'.
 * If a future refactor re-tightens it, the test fails before reaching prod.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock all the I/O dependencies — we're testing schema contract only.
vi.mock('@/lib/rate-limiter', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true, resetTime: Date.now() + 60000 }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
  }),
}))
vi.mock('@/lib/services/devis-service', () => ({
  processDevis: vi.fn().mockResolvedValue({
    success: true,
    id: 'lead-123',
    artisans_notified: 2,
    artisans_found: true,
    cee_eligible: false,
  }),
}))
vi.mock('@/lib/seo/indexnow', () => ({
  submitToIndexNow: vi.fn().mockResolvedValue(undefined),
  getProviderAffectedUrls: vi.fn().mockReturnValue([]),
}))
vi.mock('@/lib/monitoring/sentry', () => ({
  captureError: vi.fn(),
}))
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

import { POST } from '@/app/api/devis/route'
import { processDevis } from '@/lib/services/devis-service'

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/devis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/devis — Zod contract', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('accepts a payload WITHOUT urgency (funnel fix 2026-05-05)', async () => {
    const res = await POST(
      makeRequest({
        service: 'plombier',
        ville: 'Paris',
        nom: 'Jean Dupont',
        telephone: '+33612345678',
        email: 'jean@example.com',
      })
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(processDevis).toHaveBeenCalledOnce()
    // Defaulted to 'flexible' per Zod default
    const passedData = (processDevis as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(passedData.urgency).toBe('flexible')
  })

  it('accepts urgency when explicitly provided', async () => {
    const res = await POST(
      makeRequest({
        service: 'plombier',
        ville: 'Paris',
        nom: 'Jean Dupont',
        telephone: '+33612345678',
        urgency: 'urgent',
      })
    )
    expect(res.status).toBe(200)
    const passedData = (processDevis as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(passedData.urgency).toBe('urgent')
  })

  it('rejects invalid urgency values (still strict on enum)', async () => {
    const res = await POST(
      makeRequest({
        service: 'plombier',
        ville: 'Paris',
        nom: 'Jean Dupont',
        telephone: '+33612345678',
        urgency: 'whenever-i-feel-like-it',
      })
    )
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Données invalides')
    expect(json.details?.fieldErrors?.urgency).toBeDefined()
  })

  it('still requires service (regression guard)', async () => {
    const res = await POST(
      makeRequest({
        ville: 'Paris',
        nom: 'Jean Dupont',
        telephone: '+33612345678',
      })
    )
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.details?.fieldErrors?.service).toBeDefined()
  })

  it('still requires a valid French phone (regression guard)', async () => {
    const res = await POST(
      makeRequest({
        service: 'plombier',
        ville: 'Paris',
        nom: 'Jean Dupont',
        telephone: '12',
      })
    )
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.details?.fieldErrors?.telephone).toBeDefined()
  })
})
