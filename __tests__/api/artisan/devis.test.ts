/**
 * Tests — /api/artisan/devis (GET + POST + PUT)
 *
 * Couvre :
 *  - GET 200 → liste devis du provider
 *  - GET 404 si profil artisan non trouvé
 *  - POST 400 si validation Zod fail
 *  - POST 403 si pas de lead_assignment
 *  - POST 404 si devis_request introuvable
 *  - POST 409 si statut devis_request != pending/sent
 *  - POST 409 si quote déjà existante (dedup request_id+provider_id)
 *  - POST 200 happy path
 *  - PUT 400 si valid_until passé
 *  - PUT 404 si devis non trouvé
 *  - PUT 403 si statut != pending
 *  - PUT 200 happy path
 *  - Auth 401/403 propagé via requireArtisan
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

// ---- Auth guard ----
const {
  authBlockedRef,
  mockUser,
  mockSupabase,
  getProviderIdByUserIdMock,
  getQuotesByProviderIdMock,
  getLeadAssignmentMock,
  getDevisRequestByIdMock,
  getExistingQuoteMock,
  insertQuoteMock,
  getQuoteByIdForProviderMock,
  updateQuoteMock,
} = vi.hoisted(() => {
  type SBResultH<T> = { data: T | null; error: { message: string } | null }
  type AsyncFnH<T> = (...args: unknown[]) => Promise<T>
  return {
    authBlockedRef: { current: false },
    mockUser: { id: 'user-uuid-1', email: 'a@b.io' },
    mockSupabase: { name: 'mock-supabase' },
    getProviderIdByUserIdMock: vi.fn<AsyncFnH<SBResultH<{ id: string }>>>(async () => ({
      data: { id: 'prov-1' },
      error: null,
    })),
    getQuotesByProviderIdMock: vi.fn<AsyncFnH<SBResultH<Array<{ id: string }>>>>(async () => ({
      data: [{ id: 'q-1' }],
      error: null,
    })),
    getLeadAssignmentMock: vi.fn<AsyncFnH<SBResultH<{ provider_id: string }>>>(async () => ({
      data: { provider_id: 'prov-1' },
      error: null,
    })),
    getDevisRequestByIdMock: vi.fn<AsyncFnH<SBResultH<{ id: string; status: string }>>>(
      async () => ({ data: { id: 'req-1', status: 'pending' }, error: null })
    ),
    getExistingQuoteMock: vi.fn<AsyncFnH<SBResultH<{ id: string }>>>(async () => ({
      data: null,
      error: null,
    })),
    insertQuoteMock: vi.fn<AsyncFnH<SBResultH<{ id: string; status?: string }>>>(async () => ({
      data: { id: 'q-new', status: 'pending' },
      error: null,
    })),
    getQuoteByIdForProviderMock: vi.fn<AsyncFnH<SBResultH<{ id: string; status: string }>>>(
      async () => ({ data: { id: 'q-1', status: 'pending' }, error: null })
    ),
    updateQuoteMock: vi.fn<AsyncFnH<SBResultH<{ id: string; amount?: number }>>>(async () => ({
      data: { id: 'q-1', amount: 1500 },
      error: null,
    })),
  }
})

vi.mock('@/lib/auth/artisan-guard', () => ({
  requireArtisan: vi.fn(async () => {
    if (authBlockedRef.current) {
      return {
        error: NextResponse.json(
          { success: false, error: { message: 'Auth required' } },
          { status: 401 }
        ),
      }
    }
    return { error: undefined, user: mockUser, supabase: mockSupabase }
  }),
}))

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

vi.mock('@/lib/services/artisan-profile-service', () => ({
  getProviderIdByUserId: getProviderIdByUserIdMock,
  getQuotesByProviderId: getQuotesByProviderIdMock,
  getLeadAssignment: getLeadAssignmentMock,
  getDevisRequestById: getDevisRequestByIdMock,
  getExistingQuote: getExistingQuoteMock,
  insertQuote: insertQuoteMock,
  getQuoteByIdForProvider: getQuoteByIdForProviderMock,
  updateQuote: updateQuoteMock,
}))

import { GET, POST, PUT } from '@/app/api/artisan/devis/route'

function buildReq(method: 'GET' | 'POST' | 'PUT', body?: unknown): Request {
  return new Request('http://localhost/api/artisan/devis', {
    method,
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

const VALID_UUID = 'a1b2c3d4-e5f6-7890-abcd-ef0123456789'

describe('GET /api/artisan/devis', () => {
  beforeEach(() => {
    authBlockedRef.current = false
    getProviderIdByUserIdMock.mockResolvedValue({ data: { id: 'prov-1' }, error: null })
    getQuotesByProviderIdMock.mockResolvedValue({ data: [{ id: 'q-1' }], error: null })
  })

  it('200 + liste devis', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const body = (await (res as Response).json()) as { devis: unknown[] }
    expect(body.devis).toEqual([{ id: 'q-1' }])
  })

  it('401 si auth bloque', async () => {
    authBlockedRef.current = true
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('404 si profil artisan non trouvé', async () => {
    getProviderIdByUserIdMock.mockResolvedValueOnce({ data: null, error: null })
    const res = await GET()
    expect(res.status).toBe(404)
  })

  it('500 si DB error', async () => {
    getQuotesByProviderIdMock.mockResolvedValueOnce({ data: null, error: { message: 'db down' } })
    const res = await GET()
    expect(res.status).toBe(500)
  })
})

describe('POST /api/artisan/devis', () => {
  const validBody = {
    request_id: VALID_UUID,
    amount: 1500.5,
    description: 'Devis pour réparation',
  }

  beforeEach(() => {
    authBlockedRef.current = false
    getProviderIdByUserIdMock.mockResolvedValue({ data: { id: 'prov-1' }, error: null })
    getLeadAssignmentMock.mockResolvedValue({ data: { provider_id: 'prov-1' }, error: null })
    getDevisRequestByIdMock.mockResolvedValue({
      data: { id: 'req-1', status: 'pending' },
      error: null,
    })
    getExistingQuoteMock.mockResolvedValue({ data: null, error: null })
    insertQuoteMock.mockResolvedValue({ data: { id: 'q-new' }, error: null })
  })

  it('400 si request_id pas UUID', async () => {
    const res = await POST(buildReq('POST', { ...validBody, request_id: 'not-uuid' }))
    expect(res.status).toBe(400)
  })

  it('400 si amount négatif', async () => {
    const res = await POST(buildReq('POST', { ...validBody, amount: -10 }))
    expect(res.status).toBe(400)
  })

  it('400 si description vide', async () => {
    const res = await POST(buildReq('POST', { ...validBody, description: '' }))
    expect(res.status).toBe(400)
  })

  it('400 si valid_until dans le passé', async () => {
    const res = await POST(buildReq('POST', { ...validBody, valid_until: '2000-01-01' }))
    expect(res.status).toBe(400)
  })

  it('400 si valid_until format invalide', async () => {
    const res = await POST(buildReq('POST', { ...validBody, valid_until: '01/01/2027' }))
    expect(res.status).toBe(400)
  })

  it('403 si pas de lead_assignment', async () => {
    getLeadAssignmentMock.mockResolvedValueOnce({ data: null, error: null })
    const res = await POST(buildReq('POST', validBody))
    expect(res.status).toBe(403)
  })

  it('404 si devis_request introuvable', async () => {
    getDevisRequestByIdMock.mockResolvedValueOnce({ data: null, error: null })
    const res = await POST(buildReq('POST', validBody))
    expect(res.status).toBe(404)
  })

  it('409 si devis_request status closed', async () => {
    getDevisRequestByIdMock.mockResolvedValueOnce({
      data: { id: 'req-1', status: 'completed' },
      error: null,
    })
    const res = await POST(buildReq('POST', validBody))
    expect(res.status).toBe(409)
  })

  it('409 si quote déjà existante (dedup)', async () => {
    getExistingQuoteMock.mockResolvedValueOnce({ data: { id: 'existing-q' }, error: null })
    const res = await POST(buildReq('POST', validBody))
    expect(res.status).toBe(409)
  })

  it('200 happy path', async () => {
    const res = await POST(buildReq('POST', validBody))
    expect(res.status).toBe(200)
    const body = (await (res as Response).json()) as { success: boolean }
    expect(body.success).toBe(true)
    expect(insertQuoteMock).toHaveBeenCalled()
  })

  it('500 si insert error', async () => {
    insertQuoteMock.mockResolvedValueOnce({ data: null, error: { message: 'fk violation' } })
    const res = await POST(buildReq('POST', validBody))
    expect(res.status).toBe(500)
  })
})

describe('PUT /api/artisan/devis', () => {
  const validBody = { id: VALID_UUID, amount: 2000 }

  beforeEach(() => {
    authBlockedRef.current = false
    getProviderIdByUserIdMock.mockResolvedValue({ data: { id: 'prov-1' }, error: null })
    getQuoteByIdForProviderMock.mockResolvedValue({
      data: { id: 'q-1', status: 'pending' },
      error: null,
    })
    updateQuoteMock.mockResolvedValue({ data: { id: 'q-1', amount: 2000 }, error: null })
  })

  it('400 si id pas UUID', async () => {
    const res = await PUT(buildReq('PUT', { id: 'not-uuid', amount: 100 }))
    expect(res.status).toBe(400)
  })

  it("400 si valid_until <= aujourd'hui", async () => {
    const res = await PUT(buildReq('PUT', { ...validBody, valid_until: '2000-01-01' }))
    expect(res.status).toBe(400)
  })

  it('404 si devis non trouvé', async () => {
    getQuoteByIdForProviderMock.mockResolvedValueOnce({ data: null, error: null })
    const res = await PUT(buildReq('PUT', validBody))
    expect(res.status).toBe(404)
  })

  it('403 si statut != pending', async () => {
    getQuoteByIdForProviderMock.mockResolvedValueOnce({
      data: { id: 'q-1', status: 'accepted' },
      error: null,
    })
    const res = await PUT(buildReq('PUT', validBody))
    expect(res.status).toBe(403)
  })

  it('200 happy path', async () => {
    const res = await PUT(buildReq('PUT', validBody))
    expect(res.status).toBe(200)
    const body = (await (res as Response).json()) as { success: boolean }
    expect(body.success).toBe(true)
    expect(updateQuoteMock).toHaveBeenCalled()
  })
})
