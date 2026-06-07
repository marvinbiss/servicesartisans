/**
 * POST /api/cee/partners/convention — gelé (501).
 *
 * Gel 2026-06-07 : section « Dossiers CEE » retirée de l'espace artisan.
 * ConventionPDF (composant React-PDF) conservé dans
 * src/app/(private)/espace-artisan/cee/onboarding/ConventionPDF.tsx.
 * Voir src/app/api/cee/commissions/route.ts pour le contexte complet.
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  return NextResponse.json(
    { success: false, error: { message: 'Dossiers CEE artisan gelés' } },
    { status: 501 }
  )
}
