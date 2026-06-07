/**
 * GET /api/cee/commissions — gelé (501).
 *
 * Gel 2026-06-07 : section « Dossiers CEE » retirée de l'espace artisan
 * (dashboard recentré métier). On ferme aussi l'API (zombie surface) —
 * même pattern que la messagerie (2026-06-05). Logique d'origine
 * restaurable depuis l'historique git. Tables et back-office admin intacts.
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(
    { success: false, error: { message: 'Dossiers CEE artisan gelés' } },
    { status: 501 }
  )
}
