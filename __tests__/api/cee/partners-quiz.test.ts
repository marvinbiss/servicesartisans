/**
 * Tests — POST /api/cee/partners/training/quiz (gelé 501)
 * Gel 2026-06-07 : section « Dossiers CEE » retirée de l'espace artisan.
 * Le scoring serveur (scoreQuiz) reste couvert par security-hardening.test.ts.
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

describe('POST /api/cee/partners/training/quiz — gelé', () => {
  it('returns 501 without touching auth or DB', async () => {
    const { POST } = await import('@/app/api/cee/partners/training/quiz/route')
    const result = (await POST()) as unknown as MockResult
    expect(result.status).toBe(501)
    expect(result.body.error.message).toBe('Dossiers CEE artisan gelés')
  })
})
