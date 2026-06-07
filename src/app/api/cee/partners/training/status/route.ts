/**
 * GET /api/cee/partners/training/status — gelé (501).
 *
 * Gel 2026-06-07 : section « Dossiers CEE » retirée de l'espace artisan.
 * Voir src/app/api/cee/commissions/route.ts pour le contexte complet.
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(
    { success: false, error: { message: 'Dossiers CEE artisan gelés' } },
    { status: 501 }
  )
}
