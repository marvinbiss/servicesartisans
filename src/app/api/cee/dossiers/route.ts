/**
 * GET/POST /api/cee/dossiers — gelés (501).
 *
 * Gel 2026-06-07 : section « Dossiers CEE » retirée de l'espace artisan.
 * Voir src/app/api/cee/commissions/route.ts pour le contexte complet.
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const GONE = () =>
  NextResponse.json(
    { success: false, error: { message: 'Dossiers CEE artisan gelés' } },
    { status: 501 }
  )

export async function GET() {
  return GONE()
}

export async function POST() {
  return GONE()
}
