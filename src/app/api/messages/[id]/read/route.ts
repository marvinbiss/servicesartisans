/**
 * Message Read Receipt API — gelé.
 *
 * Messagerie en lecture seule depuis la fermeture de l'espace particulier
 * (2026-06-05). Aucune UI n'appelle cette route, et le marquage était de
 * toute façon no-op : la seule policy RLS UPDATE sur messages est
 * `sender_id = auth.uid()` alors que la route ne ciblait que les messages
 * d'autrui (audit 2026-06-05).
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  return NextResponse.json(
    { success: false, error: { message: 'Messagerie en lecture seule' } },
    { status: 501 }
  )
}
