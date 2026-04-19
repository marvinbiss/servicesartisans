/**
 * Tests for POST /api/inscription-artisan
 *
 * Focus: anti-double-claim protection. We mock the Supabase admin client
 * and Resend to isolate the route logic from external services.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

type ProviderRow = { id: string; slug: string; claimed_at: string | null } | null

type MaybeSingleResult = {
  data: ProviderRow
  error: { message: string } | null
}

const mocks = vi.hoisted(() => {
  const state: { maybeSingleResult: MaybeSingleResult } = {
    maybeSingleResult: { data: null, error: null },
  }
  return {
    state,
    maybeSingleMock: vi.fn(async () => state.maybeSingleResult),
    eqMock: vi.fn(),
    selectMock: vi.fn(),
    fromMock: vi.fn(),
    emailsSendMock: vi.fn(async () => ({ id: 'email-id', error: null })),
    loggerWarnMock: vi.fn(),
    loggerErrorMock: vi.fn(),
  }
})

mocks.eqMock.mockImplementation(() => ({ maybeSingle: mocks.maybeSingleMock }))
mocks.selectMock.mockImplementation(() => ({ eq: mocks.eqMock }))
mocks.fromMock.mockImplementation(() => ({ select: mocks.selectMock }))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ from: mocks.fromMock })),
}))

vi.mock('@/lib/api/resend-client', () => ({
  getResendClient: vi.fn(() => ({ emails: { send: mocks.emailsSendMock } })),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: mocks.loggerWarnMock,
    error: mocks.loggerErrorMock,
  },
}))

import { POST } from '@/app/api/inscription-artisan/route'

function buildPayload(overrides: Partial<Record<string, string>> = {}) {
  return {
    entreprise: 'Plomberie Dupont',
    siret: '12345678901234',
    metier: 'Plombier',
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@example.com',
    telephone: '0612345678',
    adresse: '12 rue des Artisans',
    codePostal: '75001',
    ville: 'Paris',
    rayonIntervention: '30',
    ...overrides,
  }
}

function buildRequest(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request('https://example.com/api/inscription-artisan', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

describe('POST /api/inscription-artisan — anti-double-claim', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.eqMock.mockImplementation(() => ({ maybeSingle: mocks.maybeSingleMock }))
    mocks.selectMock.mockImplementation(() => ({ eq: mocks.eqMock }))
    mocks.fromMock.mockImplementation(() => ({ select: mocks.selectMock }))
    mocks.state.maybeSingleResult = { data: null, error: null }
  })

  it('returns 409 ALREADY_CLAIMED when the SIRET already belongs to a claimed provider', async () => {
    mocks.state.maybeSingleResult = {
      data: {
        id: 'provider-uuid-1',
        slug: 'plomberie-dupont-paris',
        claimed_at: '2026-03-01T10:00:00.000Z',
      },
      error: null,
    }

    const res = await POST(buildRequest(buildPayload(), { 'x-forwarded-for': '203.0.113.5' }))
    expect(res.status).toBe(409)

    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('ALREADY_CLAIMED')
    expect(body.error.providerSlug).toBe('plomberie-dupont-paris')
    expect(body.error.providerUrl).toBe('/artisan/plomberie-dupont-paris')
    expect(body.error.loginUrl).toBe('/connexion')
    expect(body.error.passwordResetUrl).toBe('/mot-de-passe-oublie')
    expect(body.error.message).toContain('déjà revendiquée')

    // Critical: no email should be sent when we block a double-claim attempt.
    expect(mocks.emailsSendMock).not.toHaveBeenCalled()

    // Audit log captured with masked SIRET and client IP.
    expect(mocks.loggerWarnMock).toHaveBeenCalledWith(
      '[inscription-artisan] double-claim attempt blocked',
      expect.objectContaining({
        siretPrefix: '123456789*****',
        providerId: 'provider-uuid-1',
        ip: '203.0.113.5',
      })
    )
  })

  it('returns 409 when the SIRET is submitted with spaces/dashes matching a claimed provider', async () => {
    mocks.state.maybeSingleResult = {
      data: {
        id: 'provider-uuid-1',
        slug: 'plomberie-dupont-paris',
        claimed_at: '2026-03-01T10:00:00.000Z',
      },
      error: null,
    }

    const res = await POST(buildRequest(buildPayload({ siret: '123 456 789 01234' })))
    expect(res.status).toBe(409)

    // Normalised SIRET must be used for the lookup.
    expect(mocks.eqMock).toHaveBeenCalledWith('siret', '12345678901234')
  })

  it('proceeds normally when the provider exists but claimed_at is null', async () => {
    mocks.state.maybeSingleResult = {
      data: {
        id: 'provider-uuid-2',
        slug: 'electricien-martin-lyon',
        claimed_at: null,
      },
      error: null,
    }

    const res = await POST(buildRequest(buildPayload()))
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.success).toBe(true)
    expect(mocks.emailsSendMock).toHaveBeenCalledTimes(2)
    expect(mocks.loggerWarnMock).not.toHaveBeenCalledWith(
      '[inscription-artisan] double-claim attempt blocked',
      expect.anything()
    )
  })

  it('proceeds normally when the SIRET has no matching provider row at all', async () => {
    mocks.state.maybeSingleResult = { data: null, error: null }

    const res = await POST(buildRequest(buildPayload()))
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.success).toBe(true)
    expect(mocks.emailsSendMock).toHaveBeenCalledTimes(2)
  })

  it('fails-open (proceeds) when the providers lookup returns an error', async () => {
    mocks.state.maybeSingleResult = {
      data: null,
      error: { message: 'connection refused' },
    }

    const res = await POST(buildRequest(buildPayload()))
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.success).toBe(true)
    expect(mocks.emailsSendMock).toHaveBeenCalledTimes(2)
    expect(mocks.loggerWarnMock).toHaveBeenCalledWith(
      '[inscription-artisan] provider lookup failed (fail-open)',
      expect.objectContaining({
        siretPrefix: '123456789*****',
        error: 'connection refused',
      })
    )
  })
})
