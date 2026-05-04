/**
 * Sprint 4 vague 4 — tests cron claim-auto-approve.
 *
 * Couvre la matrice d'éligibilité (4 conditions) et le logging audit.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mocks (doivent précéder l'import du route handler)
vi.mock('@/lib/auth/verify-cron-secret', () => ({
  verifyCronSecret: vi.fn(() => true),
}))

vi.mock('@/lib/monitoring/sentry-checkin', () => ({
  withCronCheckIn: (_slug: string, handler: (req: Request) => Promise<Response>) => handler,
}))

const approveClaimMock = vi.fn()
vi.mock('@/lib/services/claims-service', () => ({
  approveClaim: (...args: unknown[]) => approveClaimMock(...args),
}))

const insertMock = vi.fn().mockResolvedValue({ error: null })

let claimsResponse: { data: unknown[] | null; error: unknown } = { data: [], error: null }

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table: string) => {
      if (table === 'provider_claims') {
        const builder = {
          select: () => builder,
          eq: () => builder,
          not: () => builder,
          order: () => builder,
          limit: () => builder,
          returns: () => Promise.resolve(claimsResponse),
        }
        return builder
      }
      if (table === 'claims_auto_approve_log') {
        return { insert: insertMock }
      }
      throw new Error('unexpected table ' + table)
    },
  }),
}))

import { GET } from '@/app/api/cron/claim-auto-approve/route'

const futureDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

function makeRequest(): Request {
  return new Request('http://localhost/api/cron/claim-auto-approve', {
    headers: { authorization: 'Bearer test-secret' },
  })
}

describe('cron claim-auto-approve', () => {
  beforeEach(() => {
    approveClaimMock.mockReset()
    insertMock.mockClear()
  })

  it('returns scanned=0 when no candidates', async () => {
    claimsResponse = { data: [], error: null }
    const res = await GET(makeRequest())
    expect(res.status).toBe(200)
    const body = (await res.json()) as { scanned: number; approved: number; skipped: number }
    expect(body.scanned).toBe(0)
    expect(body.approved).toBe(0)
    expect(approveClaimMock).not.toHaveBeenCalled()
  })

  it('skips claims whose provider is already claimed', async () => {
    claimsResponse = {
      data: [
        {
          id: 'claim-1',
          provider_id: 'p-1',
          status: 'pending',
          email_confirmed_at: '2026-05-01T00:00:00Z',
          providers: { id: 'p-1', user_id: 'someone-else', rge_valid_until: futureDate },
        },
      ],
      error: null,
    }
    const res = await GET(makeRequest())
    const body = (await res.json()) as { skipped: number; approved: number }
    expect(body.skipped).toBe(1)
    expect(body.approved).toBe(0)
    expect(approveClaimMock).not.toHaveBeenCalled()
    expect(insertMock).toHaveBeenCalledWith([
      expect.objectContaining({
        decision: 'skipped',
        reasons: ['provider_already_claimed'],
      }),
    ])
  })

  it('skips claims with expired RGE', async () => {
    claimsResponse = {
      data: [
        {
          id: 'claim-2',
          provider_id: 'p-2',
          status: 'pending',
          email_confirmed_at: '2026-05-01T00:00:00Z',
          providers: { id: 'p-2', user_id: null, rge_valid_until: pastDate },
        },
      ],
      error: null,
    }
    const res = await GET(makeRequest())
    const body = (await res.json()) as { skipped: number; approved: number }
    expect(body.skipped).toBe(1)
    expect(body.approved).toBe(0)
    expect(insertMock).toHaveBeenCalledWith([
      expect.objectContaining({ decision: 'skipped', reasons: ['rge_expired'] }),
    ])
  })

  it('approves claims meeting all 4 conditions', async () => {
    claimsResponse = {
      data: [
        {
          id: 'claim-3',
          provider_id: 'p-3',
          status: 'pending',
          email_confirmed_at: '2026-05-01T00:00:00Z',
          providers: { id: 'p-3', user_id: null, rge_valid_until: futureDate },
        },
      ],
      error: null,
    }
    approveClaimMock.mockResolvedValue({ success: true, data: { message: 'ok' } })
    const res = await GET(makeRequest())
    const body = (await res.json()) as { approved: number; skipped: number }
    expect(body.approved).toBe(1)
    expect(body.skipped).toBe(0)
    expect(approveClaimMock).toHaveBeenCalledWith(expect.anything(), 'claim-3', null)
    expect(insertMock).toHaveBeenCalledWith([
      expect.objectContaining({
        decision: 'approved',
        reasons: ['auto_4_conditions_met'],
      }),
    ])
  })

  it('logs skipped when approveClaim returns failure (race)', async () => {
    claimsResponse = {
      data: [
        {
          id: 'claim-4',
          provider_id: 'p-4',
          status: 'pending',
          email_confirmed_at: '2026-05-01T00:00:00Z',
          providers: { id: 'p-4', user_id: null, rge_valid_until: futureDate },
        },
      ],
      error: null,
    }
    approveClaimMock.mockResolvedValue({
      success: false,
      error: 'Cette fiche a déjà été attribuée à un autre utilisateur',
      status: 409,
    })
    const res = await GET(makeRequest())
    const body = (await res.json()) as { approved: number; skipped: number }
    expect(body.approved).toBe(0)
    expect(body.skipped).toBe(1)
    expect(insertMock).toHaveBeenCalledWith([
      expect.objectContaining({
        decision: 'skipped',
        reasons: [expect.stringMatching(/^approve_failed:/)],
      }),
    ])
  })

  it('returns 401 if cron secret invalid', async () => {
    const { verifyCronSecret } = await import('@/lib/auth/verify-cron-secret')
    vi.mocked(verifyCronSecret).mockReturnValueOnce(false)
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })
})
