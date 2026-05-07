/**
 * Tests — /api/artisan/devis/[id] (DELETE + PATCH)
 *
 * Couvre :
 *  - DELETE 400 si id pas UUID
 *  - DELETE 404 si quote inexistant ou pas owné par provider
 *  - DELETE 403 si statut != pending
 *  - DELETE 200 happy path
 *  - DELETE 500 si delete error
 *  - PATCH 400 sans champs modifiables
 *  - PATCH 400 si valid_until passé
 *  - PATCH 403 si statut != pending
 *  - PATCH 200 happy path
 *  - 401 propagé via requireArtisan
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

// ---- Mocks ----
const {
  authBlockedRef,
  mockUser,
  mockSupabase,
  getProviderIdByUserIdMock,
  getQuoteByIdMock,
  deleteQuoteMock,
  updateQuoteMock,
} = vi.hoisted(() => {
  type SBResultH<T> = { data: T | null; error: { message: string } | null }
  type ProviderResultH = SBResultH<{ id: string }>
  type QuoteResultH = SBResultH<{ id: string; provider_id: string; status: string }>
  type UpdateResultH = SBResultH<{ id: string; amount?: number }>
  return {
    authBlockedRef: { current: false },
    mockUser: { id: 'u1' },
    mockSupabase: {},
    getProviderIdByUserIdMock: vi.fn<(...a: unknown[]) => Promise<ProviderResultH>>(async () => ({
      data: { id: 'prov-1' },
      error: null,
    })),
    getQuoteByIdMock: vi.fn<(...a: unknown[]) => Promise<QuoteResultH>>(async () => ({
      data: { id: 'q-1', provider_id: 'prov-1', status: 'pending' },
      error: null,
    })),
    deleteQuoteMock: vi.fn<(...a: unknown[]) => Promise<{ error: { message: string } | null }>>(
      async () => ({ error: null })
    ),
    updateQuoteMock: vi.fn<(...a: unknown[]) => Promise<UpdateResultH>>(async () => ({
      data: { id: 'q-1', amount: 999 },
      error: null,
    })),
  }
})

vi.mock('@/lib/auth/artisan-guard', () => ({
  requireArtisan: vi.fn(async () =>
    authBlockedRef.current
      ? {
          error: NextResponse.json(
            { success: false, error: { message: 'Auth required' } },
            { status: 401 }
          ),
        }
      : { error: undefined, user: mockUser, supabase: mockSupabase }
  ),
}))

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

vi.mock('@/lib/services/artisan-profile-service', () => ({
  getProviderIdByUserId: getProviderIdByUserIdMock,
  getQuoteById: getQuoteByIdMock,
  deleteQuote: deleteQuoteMock,
  updateQuote: updateQuoteMock,
}))

import { DELETE, PATCH } from '@/app/api/artisan/devis/[id]/route'
import { NextRequest } from 'next/server'

const VALID = 'a1b2c3d4-e5f6-7890-abcd-ef0123456789'

function buildReq(method: 'DELETE' | 'PATCH', body?: unknown): NextRequest {
  return new NextRequest('http://localhost/api/artisan/devis/' + VALID, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

const params = (id: string) => Promise.resolve({ id })

describe('DELETE /api/artisan/devis/[id]', () => {
  beforeEach(() => {
    authBlockedRef.current = false
    getProviderIdByUserIdMock.mockResolvedValue({ data: { id: 'prov-1' }, error: null })
    getQuoteByIdMock.mockResolvedValue({
      data: { id: 'q-1', provider_id: 'prov-1', status: 'pending' },
      error: null,
    })
    deleteQuoteMock.mockResolvedValue({ error: null })
  })

  it('400 si id pas UUID', async () => {
    const res = await DELETE(buildReq('DELETE'), { params: params('not-uuid') })
    expect(res.status).toBe(400)
  })

  it('401 si auth bloque', async () => {
    authBlockedRef.current = true
    const res = await DELETE(buildReq('DELETE'), { params: params(VALID) })
    expect(res.status).toBe(401)
  })

  it('404 si profil artisan introuvable', async () => {
    getProviderIdByUserIdMock.mockResolvedValueOnce({ data: null, error: null })
    const res = await DELETE(buildReq('DELETE'), { params: params(VALID) })
    expect(res.status).toBe(404)
  })

  it('404 si quote inexistante', async () => {
    getQuoteByIdMock.mockResolvedValueOnce({ data: null, error: null })
    const res = await DELETE(buildReq('DELETE'), { params: params(VALID) })
    expect(res.status).toBe(404)
  })

  it('404 si quote pas owné par provider (IDOR protection)', async () => {
    getQuoteByIdMock.mockResolvedValueOnce({
      data: { id: 'q-1', provider_id: 'AUTRE-PROV', status: 'pending' },
      error: null,
    })
    const res = await DELETE(buildReq('DELETE'), { params: params(VALID) })
    expect(res.status).toBe(404)
  })

  it('403 si statut != pending', async () => {
    getQuoteByIdMock.mockResolvedValueOnce({
      data: { id: 'q-1', provider_id: 'prov-1', status: 'accepted' },
      error: null,
    })
    const res = await DELETE(buildReq('DELETE'), { params: params(VALID) })
    expect(res.status).toBe(403)
  })

  it('200 happy path', async () => {
    const res = await DELETE(buildReq('DELETE'), { params: params(VALID) })
    expect(res.status).toBe(200)
    expect(deleteQuoteMock).toHaveBeenCalled()
  })

  it('500 si delete error', async () => {
    deleteQuoteMock.mockResolvedValueOnce({ error: { message: 'fk' } })
    const res = await DELETE(buildReq('DELETE'), { params: params(VALID) })
    expect(res.status).toBe(500)
  })
})

describe('PATCH /api/artisan/devis/[id]', () => {
  beforeEach(() => {
    authBlockedRef.current = false
    getProviderIdByUserIdMock.mockResolvedValue({ data: { id: 'prov-1' }, error: null })
    getQuoteByIdMock.mockResolvedValue({
      data: { id: 'q-1', provider_id: 'prov-1', status: 'pending' },
      error: null,
    })
    updateQuoteMock.mockResolvedValue({ data: { id: 'q-1', amount: 999 }, error: null })
  })

  it('400 si id pas UUID', async () => {
    const res = await PATCH(buildReq('PATCH', { amount: 100 }), { params: params('bad') })
    expect(res.status).toBe(400)
  })

  it('400 si aucun champ modifiable', async () => {
    const res = await PATCH(buildReq('PATCH', {}), { params: params(VALID) })
    expect(res.status).toBe(400)
  })

  it('400 si valid_until passé', async () => {
    const res = await PATCH(buildReq('PATCH', { valid_until: '2000-01-01' }), {
      params: params(VALID),
    })
    expect(res.status).toBe(400)
  })

  it('400 si valid_until format invalide', async () => {
    const res = await PATCH(buildReq('PATCH', { valid_until: 'invalid' }), {
      params: params(VALID),
    })
    expect(res.status).toBe(400)
  })

  it('400 si description vide', async () => {
    const res = await PATCH(buildReq('PATCH', { description: '' }), { params: params(VALID) })
    expect(res.status).toBe(400)
  })

  it('400 si amount négatif', async () => {
    const res = await PATCH(buildReq('PATCH', { amount: -1 }), { params: params(VALID) })
    expect(res.status).toBe(400)
  })

  it('404 si quote pas owné (IDOR)', async () => {
    getQuoteByIdMock.mockResolvedValueOnce({
      data: { id: 'q-1', provider_id: 'AUTRE', status: 'pending' },
      error: null,
    })
    const res = await PATCH(buildReq('PATCH', { amount: 100 }), { params: params(VALID) })
    expect(res.status).toBe(404)
  })

  it('403 si statut != pending', async () => {
    getQuoteByIdMock.mockResolvedValueOnce({
      data: { id: 'q-1', provider_id: 'prov-1', status: 'rejected' },
      error: null,
    })
    const res = await PATCH(buildReq('PATCH', { amount: 100 }), { params: params(VALID) })
    expect(res.status).toBe(403)
  })

  it('200 happy path partial update (amount only)', async () => {
    const res = await PATCH(buildReq('PATCH', { amount: 999 }), { params: params(VALID) })
    expect(res.status).toBe(200)
    const body = (await (res as Response).json()) as { success: boolean }
    expect(body.success).toBe(true)
    expect(updateQuoteMock).toHaveBeenCalled()
    const call = updateQuoteMock.mock.calls[0] as unknown[]
    expect(call?.[3]).toEqual({ amount: 999 })
  })
})
