/**
 * Tier 0 smoke test — flow email-confirmation claim Sprint 4.
 *
 * Valide que l'endpoint `/api/artisan/claim/confirm/[token]` :
 *   - Rejette les tokens invalides (longueur out-of-bound)
 *   - Redirige vers /lien-invalide si claim absente
 *   - Idempotent : déjà confirmé → /confirme sans re-update
 *   - Vérifie expires_at avant flip
 *   - Flip atomique email_confirmed_at + clear token
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

const updateMock = vi.fn()
const eqMock = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: vi.fn().mockResolvedValue(claimResponse),
        }),
      }),
      update: (patch: unknown) => {
        updateMock(patch)
        return {
          eq: () => {
            eqMock()
            return {
              is: vi.fn().mockResolvedValue({ error: updateError }),
            }
          },
        }
      },
    }),
  }),
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}))

import { GET } from '@/app/api/artisan/claim/confirm/[token]/route'

let claimResponse: { data: unknown; error: unknown } = { data: null, error: null }
let updateError: unknown = null

function makeReq(): Request {
  return new Request('http://localhost/api/artisan/claim/confirm/x')
}

describe('GET /api/artisan/claim/confirm/[token]', () => {
  beforeEach(() => {
    updateMock.mockClear()
    eqMock.mockClear()
    claimResponse = { data: null, error: null }
    updateError = null
  })

  it('rejects token shorter than 32 chars', async () => {
    const res = await GET(makeReq(), { params: { token: 'abc' } })
    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toContain('/artisan/claim/lien-invalide')
  })

  it('rejects token longer than 96 chars', async () => {
    const res = await GET(makeReq(), { params: { token: 'a'.repeat(200) } })
    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toContain('/artisan/claim/lien-invalide')
  })

  it('redirects to lien-invalide when claim not found', async () => {
    claimResponse = { data: null, error: null }
    const res = await GET(makeReq(), { params: { token: 'a'.repeat(43) } })
    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toContain('/artisan/claim/lien-invalide')
  })

  it('is idempotent: redirect to confirme without re-update if already confirmed', async () => {
    claimResponse = {
      data: {
        id: 'claim-1',
        status: 'pending',
        email_confirmed_at: '2026-05-01T00:00:00Z',
        email_confirmation_expires_at: new Date(Date.now() + 86400000).toISOString(),
      },
      error: null,
    }
    const res = await GET(makeReq(), { params: { token: 'a'.repeat(43) } })
    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toContain('/artisan/claim/confirme')
    expect(updateMock).not.toHaveBeenCalled()
  })

  it('rejects expired token', async () => {
    claimResponse = {
      data: {
        id: 'claim-2',
        status: 'pending',
        email_confirmed_at: null,
        email_confirmation_expires_at: '2026-01-01T00:00:00Z',
      },
      error: null,
    }
    const res = await GET(makeReq(), { params: { token: 'a'.repeat(43) } })
    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toContain('/artisan/claim/lien-invalide')
    expect(updateMock).not.toHaveBeenCalled()
  })

  it('rejects claim with non-pending status', async () => {
    claimResponse = {
      data: {
        id: 'claim-3',
        status: 'approved',
        email_confirmed_at: null,
        email_confirmation_expires_at: new Date(Date.now() + 86400000).toISOString(),
      },
      error: null,
    }
    const res = await GET(makeReq(), { params: { token: 'a'.repeat(43) } })
    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toContain('/artisan/claim/lien-invalide')
    expect(updateMock).not.toHaveBeenCalled()
  })

  it('flips email_confirmed_at + clears token on valid pending claim', async () => {
    claimResponse = {
      data: {
        id: 'claim-4',
        status: 'pending',
        email_confirmed_at: null,
        email_confirmation_expires_at: new Date(Date.now() + 86400000).toISOString(),
      },
      error: null,
    }
    const res = await GET(makeReq(), { params: { token: 'a'.repeat(43) } })
    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toContain('/artisan/claim/confirme')
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email_confirmed_at: expect.any(String),
        email_confirmation_token: null,
      })
    )
  })

  it('redirects to lien-invalide on update DB error', async () => {
    claimResponse = {
      data: {
        id: 'claim-5',
        status: 'pending',
        email_confirmed_at: null,
        email_confirmation_expires_at: new Date(Date.now() + 86400000).toISOString(),
      },
      error: null,
    }
    updateError = { code: '500', message: 'db down' }
    const res = await GET(makeReq(), { params: { token: 'a'.repeat(43) } })
    expect(res.status).toBe(303)
    expect(res.headers.get('location')).toContain('/artisan/claim/lien-invalide')
  })
})
