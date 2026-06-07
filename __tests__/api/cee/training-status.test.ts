/**
 * Tests — GET /api/cee/partners/training/status (gelé 501)
 * Gel 2026-06-07 : section « Dossiers CEE » retirée de l'espace artisan.
 * Tests d'origine restaurables depuis l'historique git avec la route.
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

describe('GET /api/cee/partners/training/status — gelé', () => {
  it('returns 501 without touching auth or DB', async () => {
    const { GET } = await import('@/app/api/cee/partners/training/status/route')
    const result = (await GET()) as unknown as MockResult
    expect(result.status).toBe(501)
    expect(result.body.error.message).toBe('Dossiers CEE artisan gelés')
  })
})
