/**
 * Tests — GET + PATCH /api/cee/dossiers/[id] (gelés 501)
 * Gel 2026-06-07 : section « Dossiers CEE » retirée de l'espace artisan.
 */

import { describe, it, expect, vi } from 'vitest'

vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({ body, status: init?.status ?? 200 }),
  },
}))

interface MockResult {
  body: { success: boolean; error: { message: string } }
  status: number
}

describe('/api/cee/dossiers/[id] — gelé', () => {
  it('GET returns 501 without touching auth or DB', async () => {
    const { GET } = await import('@/app/api/cee/dossiers/[id]/route')
    const result = (await GET()) as unknown as MockResult
    expect(result.status).toBe(501)
    expect(result.body.error.message).toBe('Dossiers CEE artisan gelés')
  })

  it('PATCH returns 501 without touching auth or DB', async () => {
    const { PATCH } = await import('@/app/api/cee/dossiers/[id]/route')
    const result = (await PATCH()) as unknown as MockResult
    expect(result.status).toBe(501)
    expect(result.body.error.message).toBe('Dossiers CEE artisan gelés')
  })
})
