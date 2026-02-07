/**
 * Security test: /api/admin/leads must reject unauthenticated requests.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'
import type { AdminAuthResult } from '@/lib/admin-auth'

// Mock verifyAdmin before importing the route handler
const mockVerifyAdmin = vi.fn<() => Promise<AdminAuthResult>>()
vi.mock('@/lib/admin-auth', () => ({
  verifyAdmin: () => mockVerifyAdmin(),
}))

// Mock createAdminClient so it never actually connects
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => {
    throw new Error('createAdminClient should not be called without admin auth')
  },
}))

function makeRequest(url = 'http://localhost/api/admin/leads') {
  return new Request(url)
}

describe('/api/admin/leads auth guard', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let GET: (request: Request) => Promise<any>

  beforeEach(async () => {
    vi.clearAllMocks()
    // Dynamic import inside beforeEach to ensure mocks are active
    const mod = await import('./route')
    GET = mod.GET
  })

  it('returns 401 when no session exists (anonymous user)', async () => {
    mockVerifyAdmin.mockResolvedValue({
      success: false,
      error: NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentification requise' } },
        { status: 401 }
      ),
    })

    const response = await GET(makeRequest())

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('UNAUTHORIZED')
  })

  it('returns 403 when user is authenticated but not admin', async () => {
    mockVerifyAdmin.mockResolvedValue({
      success: false,
      error: NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Accès admin requis' } },
        { status: 403 }
      ),
    })

    const response = await GET(makeRequest())

    expect(response.status).toBe(403)
    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('FORBIDDEN')
  })

  it('never calls createAdminClient when auth fails', async () => {
    mockVerifyAdmin.mockResolvedValue({
      success: false,
      error: NextResponse.json({ success: false }, { status: 401 }),
    })

    // If createAdminClient were called, it would throw (see mock above)
    // The test passing proves the guard runs before any data access
    const response = await GET(makeRequest())
    expect(response.status).toBe(401)
  })
})
