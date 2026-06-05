/**
 * Message API - Edit and Delete — gelé.
 *
 * Messagerie en lecture seule depuis la fermeture de l'espace particulier
 * (2026-06-05). Aucune UI n'appelle ces mutations ; on ferme la surface
 * d'écriture (audit 2026-06-05).
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function PATCH() {
  return NextResponse.json(
    { success: false, error: { message: 'Messagerie en lecture seule' } },
    { status: 501 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: { message: 'Messagerie en lecture seule' } },
    { status: 501 }
  )
}
